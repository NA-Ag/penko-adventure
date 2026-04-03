
import React from 'react';
import { ChatMessage as ChatMessageType, Language } from '../types';
import { TransliterationService } from '../services/utils/TransliterationService';

interface ChatMessageProps {
    msg: ChatMessageType;
    T: any;
    isSpeaking: boolean;
    isGenerating: boolean;
    downloadProgress?: number | null;
    speak: (text: string) => void;
    setInput: (text: string) => void;
    engine?: any;
    targetLanguage: Language;
    isBeginner?: boolean;
}

// Memoize to prevent re-renders when message hasn't changed
export const ChatMessage = React.memo<ChatMessageProps>(({ msg, T, isSpeaking, isGenerating, downloadProgress, speak, setInput, engine, targetLanguage, isBeginner }) => {
    const [displayedContent, setDisplayedContent] = React.useState(
        (msg.role === 'user' || (!msg.id.includes('_stream') && msg.id !== 'system_stream')) ? msg.content : ''
    );

    // Romanization logic
    const [romanizedText, setRomanizedText] = React.useState<string>(msg.meta?.romanization || '');
    const [isRomanizing, setIsRomanizing] = React.useState(false);

    // Local state for on-demand generation
    const [simplifiedText, setSimplifiedText] = React.useState<string>(msg.meta?.simplifiedNarrative || '');
    const [isSimplifying, setIsSimplifying] = React.useState(false);

    const [translatedText, setTranslatedText] = React.useState<string>(msg.meta?.nativeTranslation || '');
    const [isTranslating, setIsTranslating] = React.useState(false);

    const [grammarFeedback, setGrammarFeedback] = React.useState<string>(msg.meta?.feedback || '');
    const [isCheckingGrammar, setIsCheckingGrammar] = React.useState(false);

    // Keep a ref to the latest content to avoid re-triggering the interval and causing stutters
    const contentRef = React.useRef(msg.content);
    React.useEffect(() => {
        contentRef.current = msg.content;
    }, [msg.content]);

    React.useEffect(() => {
        if (msg.role === 'user' || (!msg.id.includes('_stream') && msg.id !== 'system_stream')) {
            setDisplayedContent(msg.content);
            return;
        }

        // Run a persistent ticker that never dies while streaming
        const interval = setInterval(() => {
            setDisplayedContent(prev => {
                if (prev.length < contentRef.current.length) {
                    // Grab more characters at once if we are far behind (up to 50% of the gap)
                    const diff = contentRef.current.length - prev.length;
                    const jump = diff > 20 ? Math.ceil(diff / 2) : Math.max(1, Math.floor(diff / 3));
                    return contentRef.current.substring(0, prev.length + jump);
                }
                return prev; 
            });
        }, 25); // Faster 25ms ticker with aggressive 'catch-up' logic

        return () => clearInterval(interval);
    }, [msg.id, msg.role]); // Do NOT depend on msg.content, let the ref handle the data flow

    // Handlers for on-demand features
    const handleSimplify = async (e: React.MouseEvent) => {
        if (simplifiedText || isSimplifying || !engine?.requestSimplify) return;
        
        e.preventDefault();
        
        // Force the details element open immediately to see streaming
        const details = (e.target as HTMLElement).closest('details');
        if (details) details.open = true;

        setIsSimplifying(true);
        try {
            const result = await engine.requestSimplify(msg.content, (chunk: string, text: string) => {
                setSimplifiedText(text);
            });
            setSimplifiedText(result);
            if (msg.meta) msg.meta.simplifiedNarrative = result; // Cache it
        } catch (err) {
            console.error("Simplification failed", err);
            setSimplifiedText("Failed to simplify.");
        } finally {
            setIsSimplifying(false);
        }
    };

    const handleRomanize = async (e: React.MouseEvent) => {
        if (romanizedText || isRomanizing) return;
        
        e.preventDefault();
        const details = (e.target as HTMLElement).closest('details');
        if (details) details.open = true;

        setIsRomanizing(true);
        try {
            let result = '';
            const needsLLM = [Language.JAPANESE, Language.MANDARIN, Language.CANTONESE, Language.WU].includes(targetLanguage);
            
            if (needsLLM && engine?.requestRomanization) {
                result = await engine.requestRomanization(msg.content);
            } else {
                result = TransliterationService.transliterate(msg.content, targetLanguage);
                if (!result && engine?.requestRomanization) {
                     result = await engine.requestRomanization(msg.content);
                }
            }

            if (!result) result = 'Not supported for this language.';
            
            setRomanizedText(result);
            if (msg.meta) msg.meta.romanization = result;
        } catch (err) {
            console.error("Romanization failed", err);
            setRomanizedText("Failed to generate.");
        } finally {
            setIsRomanizing(false);
        }
    };

    const handleTranslate = async (e: React.MouseEvent) => {
        if (translatedText || isTranslating || !engine?.requestNativeTranslation) return;
        
        e.preventDefault();

        const details = (e.target as HTMLElement).closest('details');
        if (details) details.open = true;

        setIsTranslating(true);
        try {
            const result = await engine.requestNativeTranslation(msg.content);
            setTranslatedText(result);
            if (msg.meta) msg.meta.nativeTranslation = result; // Cache it
        } catch (err) {
            console.error("Translation failed", err);
            setTranslatedText("Failed to translate.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleGrammarCheck = async (e: React.MouseEvent) => {
        if (grammarFeedback || isCheckingGrammar || !engine?.requestGrammarCorrection) return;
        if (!msg.meta?.userInput) return; // Need the original input
        
        e.preventDefault();

        const details = (e.target as HTMLElement).closest('details');
        if (details) details.open = true;

        setIsCheckingGrammar(true);
        try {
            // We pass the user's raw input stored in the engine's meta
            const result = await engine.requestGrammarCorrection(msg.meta.userInput, (chunk: string, text: string) => {
                setGrammarFeedback(text);
            });
            setGrammarFeedback(result);
            if (msg.meta) msg.meta.feedback = result; // Cache it
        } catch (err) {
            console.error("Grammar check failed", err);
            setGrammarFeedback("Failed to check grammar.");
        } finally {
            setIsCheckingGrammar(false);
        }
    };

    return (
        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
                className={`max-w-[95%] lg:max-w-[85%] rounded-lg p-5 shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-green-900/10 border border-green-800 text-green-100 rounded-tr-none' 
                    : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
                }`}
            >
                <div className="flex justify-between items-center mb-4 text-[10px] font-mono uppercase tracking-widest">
                  <span className="opacity-50">{msg.role === 'user' ? T.you : T.engine}</span>
                  {msg.role !== 'user' && (
                     <button
                       onClick={() => speak(msg.content)}
                       disabled={isSpeaking || isGenerating || (downloadProgress !== null && downloadProgress !== undefined)}
                       className={`ml-4 flex items-center justify-center w-10 h-10 rounded-md border-2 transition-all relative z-10 ${
                         isGenerating 
                           ? 'bg-blue-600 border-blue-400 text-white opacity-100 !cursor-default' 
                           : isSpeaking
                             ? 'bg-green-600 border-green-400 text-white opacity-100 !cursor-default'
                             : 'bg-gray-900 hover:bg-black border-gray-600 text-gray-300 hover:text-white hover:border-green-500'
                       } ${
                        (downloadProgress !== null && downloadProgress !== undefined) ? 'bg-blue-600 border-blue-400 text-white opacity-100' : ''
                       } disabled:grayscale-0`}
                       title={T.listen}
                     >
                       {downloadProgress !== null && downloadProgress !== undefined ? (
                           <div className="flex flex-col items-center leading-none">
                               <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mb-0.5"></div>
                               <span className="text-[8px] font-bold">{downloadProgress}%</span>
                           </div>
                       ) : (
                           <>
                            {(isSpeaking || isGenerating) ? (
                                isGenerating ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <span className="text-lg animate-pulse">🔊</span>
                                )
                            ) : (
                                <span className="text-lg">🔈</span>
                            )}
                           </>
                       )}
                     </button>
                  )}
                </div>

                <p className="leading-relaxed text-lg font-serif whitespace-pre-wrap">{displayedContent}</p>



                {/* Show a placeholder while the main turn is still generating */}
                {msg.id.includes('_stream') && displayedContent.length > 50 && (
                  <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-4">
                     <div className="flex items-center gap-3 text-sm text-cyan-500/70 italic font-mono">
                         <div className="w-3 h-3 border-2 border-cyan-500/50 border-t-transparent rounded-full animate-spin"></div>
                         Generating narrative...
                     </div>
                  </div>
                )}

                {/* On-Demand Tools for Engine Messages */}
                {msg.role !== 'user' && msg.meta && !msg.id.includes('_stream') && (
                  <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-4">
                    <div className="flex flex-wrap gap-3">
                       {engine?.requestSimplify && (
                         <details className="group bg-gray-900/50 rounded border border-gray-700/50 overflow-hidden">
                            <summary 
                                onClick={handleSimplify}
                                className="px-3 py-2 text-[10px] text-blue-400 cursor-pointer hover:bg-gray-800 list-none uppercase tracking-widest font-bold flex items-center gap-2"
                            >
                                <span className={`transition-transform text-[8px] ${simplifiedText ? 'rotate-90' : ''}`}>▶</span> 
                                {isSimplifying ? 'Simplifying...' : T.simplify}
                                {isSimplifying && <div className="w-2 h-2 border border-blue-400 border-t-transparent rounded-full animate-spin ml-auto"></div>}
                            </summary>
                            {simplifiedText && (
                                <div className="p-3 text-lg text-blue-100 bg-blue-900/10 border-t border-gray-700/50 leading-relaxed font-serif">
                                    {simplifiedText}
                                </div>
                            )}
                         </details>
                       )}
                       
                       {engine?.requestRomanization && (
                         <details className="group bg-gray-900/50 rounded border border-gray-700/50 overflow-hidden">
                            <summary 
                                onClick={handleRomanize}
                                className="px-3 py-2 text-[10px] text-emerald-400 cursor-pointer hover:bg-gray-800 list-none uppercase tracking-widest font-bold flex items-center gap-2"
                            >
                                <span className={`transition-transform text-[8px] ${romanizedText ? 'rotate-90' : ''}`}>▶</span> 
                                {isRomanizing ? 'Generating...' : 'Romanize'}
                                {isRomanizing && <div className="w-2 h-2 border border-emerald-400 border-t-transparent rounded-full animate-spin ml-auto"></div>}
                            </summary>
                            {romanizedText && (
                                <div className="p-3 text-lg text-emerald-100 bg-emerald-900/10 border-t border-gray-700/50 leading-relaxed font-serif">
                                    {romanizedText}
                                </div>
                            )}
                         </details>
                       )}
                       
                       {engine?.requestNativeTranslation && (
                         <details className="group bg-gray-900/50 rounded border border-gray-700/50 overflow-hidden">
                            <summary 
                                onClick={handleTranslate}
                                className="px-3 py-2 text-[10px] text-gray-400 cursor-pointer hover:bg-gray-800 list-none uppercase tracking-widest font-bold flex items-center gap-2"
                            >
                                <span className={`transition-transform text-[8px] ${translatedText ? 'rotate-90' : ''}`}>▶</span> 
                                {isTranslating ? 'Translating...' : T.translate}
                                {isTranslating && <div className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin ml-auto"></div>}
                            </summary>
                            {translatedText && (
                                <div className="p-3 text-lg text-gray-200 bg-gray-800/20 border-t border-gray-700/50 italic leading-relaxed font-serif">
                                    {translatedText}
                                </div>
                            )}
                         </details>
                       )}

                       {/* Grammar Correction moved to engine bubble */}
                       {engine?.requestGrammarCorrection && msg.meta.userInput && (
                           <details className="group bg-green-900/20 rounded border border-green-800/50 overflow-hidden">
                               <summary 
                                   onClick={handleGrammarCheck}
                                   className="px-3 py-2 text-[10px] text-green-400 cursor-pointer hover:bg-green-800/40 list-none uppercase tracking-widest font-bold flex items-center gap-2"
                               >
                                   <span className={`transition-transform text-[8px] ${grammarFeedback ? 'rotate-90' : ''}`}>▶</span> 
                                   {isCheckingGrammar ? 'Checking Grammar...' : T.correction || 'Check Grammar'}
                                   {isCheckingGrammar && <div className="w-2 h-2 border border-green-400 border-t-transparent rounded-full animate-spin ml-auto"></div>}
                               </summary>
                               {grammarFeedback && (
                                   <div className="p-3 text-sm text-yellow-500/90 italic bg-yellow-900/10 border-t border-green-800/50 font-mono">
                                       {grammarFeedback}
                                   </div>
                               )}
                           </details>
                       )}
                    </div>
                    
                    {msg.meta.playerOptions && msg.meta.playerOptions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {msg.meta.playerOptions.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(opt)}
                                    className="text-xs bg-gray-900 hover:bg-black border border-gray-600 px-3 py-2 rounded text-gray-300 hover:text-white uppercase tracking-wider font-mono"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                  </div>
                )}
            </div>
        </div>
    );
});
