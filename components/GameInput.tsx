
import React, { useRef, useEffect, useState } from 'react';
import { Language } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { AudioVisualizer } from './AudioVisualizer';
import { levenshteinDistance } from '../services/utils/stringUtils';

interface GameInputProps {
    input: string;
    setInput: (val: string) => void;
    handleSend: () => void;
    isLoading: boolean;
    T: any;
    playSFX: (type: 'type') => void;
    targetLanguage: Language;
    sttEngine?: 'native' | 'neural';
    playerOptions?: string[];
}

export const GameInput: React.FC<GameInputProps> = ({ 
    input, 
    setInput, 
    handleSend, 
    isLoading, 
    T, 
    playSFX,
    targetLanguage,
    sttEngine,
    playerOptions = []
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [score, setScore] = useState<{ match: boolean, label: string, color: string } | null>(null);
    
    const handleVoiceResult = (text: string) => {
        setInput(text);
    };

    const { 
        isListening, 
        error, 
        toggleListening, 
        hasSupport, 
        engineType, 
        setEngineType, 
        isProcessingNeural,
        analyserNode 
    } = useSpeechRecognition(targetLanguage, handleVoiceResult);

    // Sync with props if provided
    useEffect(() => {
        if (sttEngine && sttEngine !== engineType) {
            setEngineType(sttEngine);
        }
    }, [sttEngine]); // Remove engineType and setEngineType from deps to prevent loop

    // Focus management
    useEffect(() => {
        if (!isLoading && !isListening && !isProcessingNeural) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isLoading, isListening, isProcessingNeural]);

    // Keyboard Shortcut: Ctrl+Space or Alt+Space to toggle Mic
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Only trigger if not typing in another input (though this is the only input)
            // and not currently loading/processing
            if ((e.ctrlKey || e.altKey) && e.code === 'Space') {
                e.preventDefault();
                if (hasSupport && !isLoading && !isProcessingNeural) {
                    toggleListening();
                }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [hasSupport, isLoading, isProcessingNeural, toggleListening]);

    // Real-time Pronunciation Scoring Logic
    useEffect(() => {
        if (!input.trim() || playerOptions.length === 0) {
            setScore(null);
            return;
        }

        const lowerInput = input.toLowerCase().trim();
        let bestDist = Infinity;
        let bestMatch = '';

        playerOptions.forEach(opt => {
            const dist = levenshteinDistance(lowerInput, opt.toLowerCase());
            if (dist < bestDist) {
                bestDist = dist;
                bestMatch = opt;
            }
        });

        if (bestDist === 0) {
            setScore({ match: true, label: "✓ PERFECT", color: "text-green-400 border-green-500" });
        } else if (bestDist <= 2) {
            setScore({ match: true, label: `~ ${bestMatch}?`, color: "text-yellow-400 border-yellow-500" });
        } else {
            setScore(null);
        }

    }, [input, playerOptions]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
        else playSFX('type');
    };

    return (
        <div className="relative max-w-4xl mx-auto">
            <div className="relative flex items-center w-full">
                
                {/* Visualizer Overlay (Only active when listening in Neural Mode) */}
                {isListening && engineType === 'neural' && (
                    <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
                        <AudioVisualizer analyser={analyserNode} isListening={isListening} />
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? T.gi_listening : isProcessingNeural ? T.gi_transcribing : T.placeholder}
                    className={`w-full bg-gray-800 text-white rounded-lg pl-4 pr-24 py-4 focus:outline-none border-2 transition-all font-mono text-lg shadow-inner relative z-10 bg-opacity-80 ${
                        isListening 
                        ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                        : isProcessingNeural 
                            ? 'border-blue-500 animate-pulse' 
                            : score 
                                ? score.color 
                                : 'border-gray-600 focus:border-green-500'
                    }`}
                    disabled={isLoading || isProcessingNeural}
                    autoComplete="off"
                    aria-label="Game Input"
                />
                
                {/* Score Badge */}
                {score && !isListening && (
                    <div className={`absolute -top-3 left-4 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-900 border ${score.color} z-20 animate-bounce`}>
                        {score.label}
                    </div>
                )}
                
                <div className="absolute right-2 flex items-center gap-2 z-20">
                    {/* VOICE FEATURE DISABLED - Under Testing */}
                    {/* {hasSupport && (
                        <button
                            onClick={toggleListening}
                            disabled={isLoading || isProcessingNeural}
                            className={`p-2 rounded-full transition-all ${
                                isListening
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                            title={`Toggle Voice Input (${engineType})`}
                            aria-label={isListening ? "Stop Voice Input" : "Start Voice Input"}
                            aria-pressed={isListening}
                        >
                            {isListening ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                        </button>
                    )} */}

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || isProcessingNeural}
                        className="text-gray-400 hover:text-green-400 transition-all disabled:opacity-30 p-2"
                        title={T.send}
                        aria-label="Send Action"
                    >
                        <span className="font-pixel text-xl tracking-widest">➤</span>
                    </button>
                </div>
            </div>
            {error && (
                <div className="absolute -top-8 right-0 text-xs text-red-400 bg-black/80 px-2 py-1 rounded border border-red-800 animate-fade-in" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};
