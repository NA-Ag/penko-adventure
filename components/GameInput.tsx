
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
