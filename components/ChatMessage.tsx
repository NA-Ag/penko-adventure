
import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
    msg: ChatMessageType;
    T: any;
    isSpeaking: boolean;
    downloadProgress?: number | null;
    speak: (text: string) => void;
    setInput: (text: string) => void;
}

// Memoize to prevent re-renders when message hasn't changed
export const ChatMessage = React.memo<ChatMessageProps>(({ msg, T, isSpeaking, downloadProgress, speak, setInput }) => {
    return (
        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
                className={`max-w-[95%] lg:max-w-[85%] rounded-lg p-5 shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-green-900/10 border border-green-800 text-green-100 rounded-tr-none' 
                    : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
                }`}
            >
                <div className="flex justify-between items-start mb-3 opacity-50 text-[10px] font-mono uppercase tracking-widest">
                  <span>{msg.role === 'user' ? T.you : T.engine}</span>
                  {msg.role !== 'user' && (
                     <button
                       onClick={() => speak(msg.content)}
                       disabled={isSpeaking || (downloadProgress !== null && downloadProgress !== undefined)}
                       className="hover:text-green-400 ml-4 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                       title={T.listen}
                     >
                       {downloadProgress !== null && downloadProgress !== undefined ? (
                           <span className="text-blue-400">▼ {downloadProgress}%</span>
                       ) : (
                           <><span>{isSpeaking ? '...' : '🔊'}</span> {T.listen}</>
                       )}
                     </button>
                  )}
                </div>

                <p className="leading-relaxed text-lg font-serif whitespace-pre-wrap">{msg.content}</p>

                {msg.meta && (
                  <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-3">
                    {msg.meta.feedback && (
                        <div className="text-sm text-yellow-500/90 italic bg-yellow-900/10 p-2 rounded border-l-2 border-yellow-600">
                             <span className="font-bold mr-2">{T.correction}</span>
                             {msg.meta.feedback}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                       {msg.meta.simplifiedNarrative && (
                         <details className="group">
                            <summary className="text-[10px] text-blue-400 cursor-pointer hover:text-blue-300 list-none uppercase tracking-wide font-bold flex items-center gap-1">
                                <span className="group-open:rotate-90 transition-transform">▶</span> {T.simplify}
                            </summary>
                            <p className="text-sm text-blue-200 mt-2 pl-3 border-l-2 border-blue-500">
                                {msg.meta.simplifiedNarrative}
                            </p>
                         </details>
                       )}
                       {msg.meta.nativeTranslation && (
                         <details className="group">
                            <summary className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-400 list-none uppercase tracking-wide font-bold flex items-center gap-1">
                                <span className="group-open:rotate-90 transition-transform">▶</span> {T.translate}
                            </summary>
                            <p className="text-sm text-gray-300 mt-2 pl-3 border-l-2 border-gray-500 italic">
                                {msg.meta.nativeTranslation}
                            </p>
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
