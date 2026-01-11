
import React from 'react';
import { ChatMessage } from '../ChatMessage';
import { ChatMessage as ChatMessageType } from '../../types';

interface MessageListProps {
    history: ChatMessageType[];
    isLoading: boolean;
    T: any;
    isSpeaking: boolean;
    downloadProgress?: number | null; // Optional for backward compat
    speak: (text: string) => void;
    setInput: (text: string) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    loadingStatus?: string;
    modelDownloadProgress?: number;
}

export const MessageList: React.FC<MessageListProps> = ({
    history,
    isLoading,
    T,
    isSpeaking,
    downloadProgress,
    speak,
    setInput,
    messagesEndRef,
    loadingStatus,
    modelDownloadProgress
}) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scroll-smooth">
            {history.map((msg) => (
                <ChatMessage 
                    key={msg.id} 
                    msg={msg} 
                    T={T} 
                    isSpeaking={isSpeaking} 
                    downloadProgress={downloadProgress}
                    speak={speak} 
                    setInput={setInput} 
                />
            ))}
            
            {isLoading && (
                <div className="flex flex-col gap-2 px-4">
                    <div className="flex items-center gap-2 text-green-500 font-mono text-xs animate-pulse">
                        <span className="w-2 h-4 bg-green-500 block"></span>
                        {history.length === 0 ? 'INITIALIZING...' : T.processing}
                    </div>
                    {history.length === 0 && loadingStatus && (
                        <div className="text-gray-500 font-mono text-[10px] ml-4">
                            {loadingStatus} {modelDownloadProgress !== undefined && modelDownloadProgress < 100 ? `(${modelDownloadProgress}%)` : ''}
                        </div>
                    )}
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};
