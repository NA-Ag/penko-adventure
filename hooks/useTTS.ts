
import { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TTS_CONFIG, VOICE_EFFECTS, LANG_CODES, AUDIO } from '../constants';

// Helper for Distortion
function makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

interface UseTTSProps {
    apiKey: string | null;
    targetLanguage: Language;
    audioCtxRef: React.MutableRefObject<AudioContext | null>;
    generateCloudSpeech: (text: string, voice: string, onProgress?: (p: number) => void) => Promise<string>;
    preloadFn?: (onProgress: (p: number) => void) => Promise<void>;
    checkReadyFn?: () => boolean;
}

export function useTTS({ apiKey, targetLanguage, audioCtxRef, generateCloudSpeech, preloadFn, checkReadyFn }: UseTTSProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [isReady, setIsReady] = useState(false);
    
    // Settings
    const [voiceEffect, setVoiceEffect] = useState<'neutral' | 'droid' | 'villain'>('neutral');
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>(TTS_CONFIG.DEFAULT_VOICE);
    const [ttsEngine, setTtsEngine] = useState<'native' | 'espeak' | 'universal'>('native');
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

    // Cleanup AudioContext on unmount to prevent memory leak
    useEffect(() => {
        return () => {
            // Close AudioContext on unmount
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close();
            }
        };
    }, [audioCtxRef]);

    // Explicit Preload function
    const preload = async () => {
        if (preloadFn && ttsEngine === 'universal') {
            try {
                setDownloadProgress(0);
                await preloadFn((p) => setDownloadProgress(Math.round(p)));
                setDownloadProgress(null);
                setIsReady(true);
            } catch (e) {
                console.error("Preload failed", e);
                setDownloadProgress(null);
            }
        }
    };

    const speak = async (text: string) => {
        if (isSpeaking || downloadProgress !== null) return;
        setIsSpeaking(true);

        // Determine if we should use the Cloud/Universal generation logic
        const useUniversalOrCloud = apiKey || ttsEngine === 'universal';

        // --- NATIVE / ESPEAK (Standard Offline) ---
        if (!useUniversalOrCloud) {
            if (ttsEngine === 'espeak' && (window as any).meSpeak) {
                (window as any).meSpeak.speak(text, { 
                    pitch: TTS_CONFIG.ESPEAK_PITCH, 
                    speed: TTS_CONFIG.ESPEAK_SPEED 
                }, () => setIsSpeaking(false));
            } else {
                // Native Browser TTS
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

        // --- CLOUD / UNIVERSAL (NEURAL) ---
        if (!audioCtxRef.current) {
            setIsSpeaking(false);
            return;
        }

        try {
            // This calls either Gemini (Cloud) or OnnxService (Universal) via the passed prop
            const base64Audio = await generateCloudSpeech(text, selectedVoiceName, (progress) => {
                setDownloadProgress(Math.round(progress));
            });
            
            setDownloadProgress(null); // Done downloading
            
            if(ttsEngine === 'universal') setIsReady(true); // Mark as ready after successful download

            if (!base64Audio) throw new Error("No audio generated");

            const binaryString = window.atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            const audioBuffer = await audioCtxRef.current.decodeAudioData(bytes.buffer.slice(0));
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = audioBuffer;
            
            // Apply Effects
            let lastNode: AudioNode = source;
            const config = VOICE_EFFECTS[voiceEffect.toUpperCase() as keyof typeof VOICE_EFFECTS];

            if (voiceEffect !== 'neutral') {
                source.playbackRate.value = config.rate;
                
                const filter = audioCtxRef.current.createBiquadFilter();
                filter.type = config.filterType;
                filter.frequency.value = config.filterFreq;
                
                const distortion = audioCtxRef.current.createWaveShaper();
                distortion.curve = makeDistortionCurve(config.distortion);
                distortion.oversample = '4x';

                lastNode.connect(filter);
                filter.connect(distortion);
                lastNode = distortion;
            }

            lastNode.connect(audioCtxRef.current.destination);
            source.onended = () => setIsSpeaking(false);
            source.start(0);

        } catch (e) {
            console.error("TTS Error", e);
            setIsSpeaking(false);
            setDownloadProgress(null);
        }
    };

    return {
        isSpeaking,
        downloadProgress,
        voiceEffect,
        setVoiceEffect,
        selectedVoiceName,
        setSelectedVoiceName,
        ttsEngine,
        setTtsEngine,
        availableOfflineVoices,
        offlineVoiceURI,
        setOfflineVoiceURI,
        speak,
        preload,
        isReady
    };
}
