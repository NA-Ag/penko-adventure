
import { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TTS_CONFIG, LANG_CODES, AUDIO } from '../constants';

interface UseTTSProps {
    apiKey: string | null;
    targetLanguage: Language;
    audioCtxRef: React.MutableRefObject<AudioContext | null>;
    generateCloudSpeech: (text: string, voice: string, onProgress?: (p: number) => void) => Promise<string | { audio: Float32Array, sampleRate: number }>;
    preloadFn?: (onProgress: (p: number, loaded?: number, total?: number) => void) => Promise<void>;
    checkReadyFn?: () => boolean;
}

export function useTTS({ apiKey, targetLanguage, audioCtxRef, generateCloudSpeech, preloadFn, checkReadyFn }: UseTTSProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [downloadLoaded, setDownloadLoaded] = useState<number>(0);
    const [downloadTotal, setDownloadTotal] = useState<number>(0);
    const [isReady, setIsReady] = useState(false);
    
    // Settings
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>(TTS_CONFIG.DEFAULT_VOICE);
    const [ttsEngine, setTtsEngine] = useState<'native' | 'espeak' | 'universal'>('universal');
    const [availableOfflineVoices, setAvailableOfflineVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [offlineVoiceURI, setOfflineVoiceURI] = useState<string>('');

    // Check initial ready state
    useEffect(() => {
        if (checkReadyFn) setIsReady(checkReadyFn());
    }, [checkReadyFn, ttsEngine]);

    // Init eSpeak
    useEffect(() => {
        if (ttsEngine === 'espeak' && (window as any).meSpeak) {
            (window as any).meSpeak.loadConfig(TTS_CONFIG.ESPEAK_CONFIG_URL);
            (window as any).meSpeak.loadVoice(TTS_CONFIG.ESPEAK_VOICE_URL);
        }
    }, [ttsEngine]);

    // Load Native Voices
    useEffect(() => {
        if (!apiKey) {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                setAvailableOfflineVoices(voices);
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, [apiKey]);

    // Explicit Preload function
    const preload = async () => {
        if (preloadFn && ttsEngine === 'universal') {
            try {
                setDownloadProgress(0);
                await preloadFn((p, loaded, total) => {
                    setDownloadProgress(Math.round(p));
                    if (loaded !== undefined) setDownloadLoaded(loaded);
                    if (total !== undefined) setDownloadTotal(total);
                });
                setDownloadProgress(null);
                setIsReady(true);
            } catch (e) {
                console.error("Preload failed", e);
                setDownloadProgress(null);
            }
        }
    };

    const speak = async (text: string) => {
        if (isSpeaking || isGenerating || downloadProgress !== null) return;
        
        // Determine if we should use the Cloud/Universal generation logic
        const useUniversalOrCloud = apiKey || ttsEngine === 'universal';

        // --- NATIVE / ESPEAK (Standard Offline) ---
        if (!useUniversalOrCloud) {
            setIsSpeaking(true);
            if (ttsEngine === 'espeak' && (window as any).meSpeak) {
                (window as any).meSpeak.speak(text, { 
                    pitch: TTS_CONFIG.ESPEAK_PITCH, 
                    speed: TTS_CONFIG.ESPEAK_SPEED 
                }, () => setIsSpeaking(false));
            } else {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = LANG_CODES[targetLanguage] || 'en-US';
                if (offlineVoiceURI) {
                    const selected = availableOfflineVoices.find(v => v.voiceURI === offlineVoiceURI);
                    if (selected) utterance.voice = selected;
                }
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);
                window.speechSynthesis.speak(utterance);
            }
            return;
        }

        // --- NEURAL (KOKORO / MMS) with Predictive Sequential Playback ---
        if (!audioCtxRef.current) return;

        // Split text into sentences (handles ., !, ?)
        const sentences = (text.match(/[^.!?]+[.!?]+/g) || [text]).map(s => s.trim()).filter(s => s.length > 0);
        
        setIsGenerating(true);
        try {
            const voiceMap: Record<string, string> = {
                'Kore': 'af_kore', 'Kore-82M': 'af_kore',
                'Female 1': 'af_heart', 'Female 2': 'af_bella', 'Female 3': 'af_nicole',
                'Male 1': 'am_adam', 'Male 2': 'am_michael'
            };
            const sanitizedVoice = voiceMap[selectedVoiceName] || selectedVoiceName;

            // PREDICTIVE LOADING: Kick off the first sentence immediately
            let nextSentencePromise = sentences.length > 0 
                ? generateCloudSpeech(sentences[0], sanitizedVoice, (p) => setDownloadProgress(Math.round(p)))
                : null;

            for (let i = 0; i < sentences.length; i++) {
                // Wait for the current chunk to finish generating
                const result = await nextSentencePromise;
                
                // PREDICTIVE LOADING: Kick off the NEXT sentence while we process/play this one
                if (i + 1 < sentences.length) {
                    nextSentencePromise = generateCloudSpeech(sentences[i+1], sanitizedVoice);
                }

                if (i === 0) {
                    setDownloadProgress(null);
                    setIsGenerating(false);
                    setIsSpeaking(true);
                }

                if (!result) continue;

                let audioBuffer: AudioBuffer;
                if (typeof result === 'string') {
                    const binaryString = window.atob(result);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let j = 0; j < binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
                    audioBuffer = await audioCtxRef.current.decodeAudioData(bytes.buffer.slice(0));
                } else {
                    const { audio, sampleRate } = result;
                    audioBuffer = audioCtxRef.current.createBuffer(1, audio.length, sampleRate);
                    audioBuffer.getChannelData(0).set(audio);
                }

                // Play this chunk and wait for it to finish before moving to next sentence
                await new Promise<void>(async (resolve) => {
                    if (!audioCtxRef.current) {
                        resolve();
                        return;
                    }
                    if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();

                    const source = audioCtxRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    const gainNode = audioCtxRef.current.createGain();
                    gainNode.gain.value = 1.5;
                    
                    source.connect(gainNode);
                    gainNode.connect(audioCtxRef.current.destination);
                    
                    source.onended = () => resolve();
                    source.start(0);
                });
            }
            
            setIsSpeaking(false);

        } catch (e) {
            console.error("TTS Error", e);
            setIsSpeaking(false);
            setIsGenerating(false);
            setDownloadProgress(null);
        }
    };

    return {
        isSpeaking,
        isGenerating,
        downloadProgress,
        selectedVoiceName,
        setSelectedVoiceName,
        ttsEngine,
        setTtsEngine,
        availableOfflineVoices,
        offlineVoiceURI,
        setOfflineVoiceURI,
        speak,
        preload,
        isReady,
        downloadLoaded,
        downloadTotal
    };
}
