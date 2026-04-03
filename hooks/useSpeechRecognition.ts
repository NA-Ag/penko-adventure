
import { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '../types';
import { LANG_CODES } from '../constants';
import { CartridgeService } from '../services/adventure/advanced/CartridgeService';

// VAD Constants
const VAD_THRESHOLD = 0.015; // Minimum volume to consider as speech
const SILENCE_DURATION = 1500; // ms of silence before stopping

export function useSpeechRecognition(language: Language, onResult: (text: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [engineType, setEngineType] = useState<'native' | 'neural'>('native');
    const [hasSupport, setHasSupport] = useState(false);
    const [isProcessingNeural, setIsProcessingNeural] = useState(false);
    
    // Native Refs
    const recognitionRef = useRef<any>(null);
    
    // Neural Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioChunksRef = useRef<Float32Array[]>([]);
    const cartridgeServiceRef = useRef<CartridgeService | null>(null);
    
    // VAD Refs
    const lastSpeechTimeRef = useRef<number>(0);
    const speechDetectedRef = useRef<boolean>(false);
    const vadIntervalRef = useRef<any>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch(e) {}
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (audioCtxRef.current) {
                try { audioCtxRef.current.close(); } catch(e) {}
            }
            if (vadIntervalRef.current) {
                clearInterval(vadIntervalRef.current);
            }
        };
    }, []);

    // --- NATIVE INIT ---
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setHasSupport(true);
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = LANG_CODES[language] || 'en-US';
            
            rec.onstart = () => {
                setIsListening(true);
                setError(null);
            };
            
            rec.onend = () => {
                setIsListening(false);
            };
            
            rec.onerror = (event: any) => {
                if (engineType === 'native') {
                    console.error("Native Speech Error", event.error);
                    if (event.error === 'not-allowed') setError("Microphone permission denied.");
                    else if (event.error !== 'no-speech') setError(`Error: ${event.error}`);
                    setIsListening(false);
                }
            };
            
            rec.onresult = (event: any) => {
                if (engineType === 'native') {
                    const transcript = event.results[0][0].transcript;
                    if (transcript) onResult(transcript);
                }
            };
            
            recognitionRef.current = rec;
        } else {
            // Fallback to neural if native not found
            setEngineType('neural');
            setHasSupport(true);
        }
    }, [language, onResult, engineType]);

    // Update language dynamically
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = LANG_CODES[language] || 'en-US';
        }
    }, [language]);

    // --- NEURAL HANDLING ---
    
    const getNeuralService = () => {
        if (!cartridgeServiceRef.current) {
            cartridgeServiceRef.current = new CartridgeService({
                targetLanguage: Language.ENGLISH, nativeLanguage: Language.ENGLISH, theme: 'fantasy'
            }, {
                id: 'dummy', name: 'dummy', modelId: 'dummy', tier: 'small', estimatedSize: 0
            }); 
        }
        return cartridgeServiceRef.current;
    };

    const startNeuralListening = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            audioCtxRef.current = ctx;

            // Load AudioWorklet with correct base URL for deployment
            try {
                const workletUrl = ((import.meta as any).env?.BASE_URL || '/') + 'recorder.worklet.js';
                await ctx.audioWorklet.addModule(workletUrl);
            } catch (e) {
                console.error("Failed to load audio worklet", e);
                throw new Error("AudioWorklet not supported or file missing");
            }

            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const recorderNode = new AudioWorkletNode(ctx, 'recorder.worklet');
            workletNodeRef.current = recorderNode;

            audioChunksRef.current = [];
            
            // Reset VAD
            speechDetectedRef.current = false;
            lastSpeechTimeRef.current = Date.now();

            recorderNode.port.onmessage = (e) => {
                const { type, data, volume } = e.data;
                
                if (type === 'audio') {
                    audioChunksRef.current.push(data);
                }
                
                if (type === 'volume') {
                    if (volume > VAD_THRESHOLD) {
                        lastSpeechTimeRef.current = Date.now();
                        speechDetectedRef.current = true;
                    }
                }
            };

            source.connect(analyser);
            analyser.connect(recorderNode);
            recorderNode.connect(ctx.destination);
            
            setIsListening(true);

            // VAD Check Loop (Main Thread just checks timer)
            vadIntervalRef.current = setInterval(() => {
                if (speechDetectedRef.current) {
                    const timeSinceSpeech = Date.now() - lastSpeechTimeRef.current;
                    if (timeSinceSpeech > SILENCE_DURATION) {
                        stopNeuralListening();
                    }
                }
            }, 200); // Check every 200ms is enough

        } catch (e: any) {
            console.error("Microphone Error", e);
            setError("Could not access microphone.");
            setIsListening(false);
        }
    };

    const stopNeuralListening = async () => {
        if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
        if (!streamRef.current) return; // Already stopped

        // Stop streams
        streamRef.current.getTracks().forEach(track => track.stop());
        
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current.port.onmessage = null;
        }
        
        if (analyserRef.current) analyserRef.current.disconnect();

        setIsListening(false);
        setIsProcessingNeural(true);

        try {
            // Merge Chunks
            const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
            const fullBuffer = new Float32Array(totalLength);
            let offset = 0;
            for (const chunk of audioChunksRef.current) {
                fullBuffer.set(chunk, offset);
                offset += chunk.length;
            }

            if (totalLength === 0) throw new Error("No audio recorded");

            // Resample
            const tempCtx = new AudioContext(); 
            const audioBuffer = tempCtx.createBuffer(1, totalLength, tempCtx.sampleRate);
            audioBuffer.copyToChannel(fullBuffer, 0);

            const resampled = await CartridgeService.resampleTo16k(audioBuffer);
            tempCtx.close();

            // Transcribe
            const service = getNeuralService();
            const text = await service.transcribeAudio(resampled, LANG_CODES[language]);
            
            if (text && text.trim()) {
                onResult(text.trim());
            }

        } catch (e: any) {
            console.error("Transcription Failed", e);
            if (e.message !== "No audio recorded") setError("Transcription failed.");
        } finally {
            setIsProcessingNeural(false);
            audioChunksRef.current = []; // Clear audio chunks to prevent memory leak
            streamRef.current = null;
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
        }
    };

    const toggleListening = useCallback(() => {
        if (isListening) {
            if (engineType === 'native') {
                if (recognitionRef.current) recognitionRef.current.stop();
                setIsListening(false);
            } else {
                stopNeuralListening();
            }
        } else {
            if (engineType === 'native') {
                if (recognitionRef.current) {
                    try { recognitionRef.current.start(); } 
                    catch(e) { console.error(e); }
                }
            } else {
                startNeuralListening();
            }
        }
    }, [isListening, engineType]);

    return { 
        isListening, 
        error, 
        toggleListening, 
        hasSupport,
        engineType,
        setEngineType,
        isProcessingNeural,
        analyserNode: analyserRef.current
    };
}
