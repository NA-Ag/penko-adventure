
import React from 'react';
import { UserProfile, GameMode } from '../../types';

interface GameToolbarProps {
    userProfile: UserProfile;
    gameMode: GameMode;
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    packInfo?: {
        title: string;
        author: string;
        genre: string;
        progress: string;
    } | null;
}

export const GameToolbar: React.FC<GameToolbarProps> = ({
    userProfile,
    gameMode,
    soundEnabled,
    setSoundEnabled,
    showSettings,
    setShowSettings,
    packInfo
}) => {
    const getModeColor = (mode: GameMode) => {
        switch (mode) {
            case 'local': return 'text-blue-400';
            case 'cloud': return 'text-yellow-400';
            case 'facade': return 'text-pink-400';
            default: return 'text-green-400';
        }
    };

    const getModeLabel = (mode: GameMode) => {
        switch (mode) {
            case 'local': return 'LOCAL AI';
            case 'cloud': return 'CLOUD';
            case 'facade': return 'FACADE';
            default: return 'COMMUNITY';
        }
    };

    const genreEmoji: Record<string, string> = {
        fantasy: '🏰',
        scifi: '🚀',
        mystery: '🔍',
        horror: '👻',
        cyberpunk: '🌃',
        contemporary: '🏙️',
        adventure: '🗺️',
        western: '🤠',
    };

    return (
        <>
            {/* Main Toolbar */}
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 bg-gray-800 p-2 rounded border border-gray-700 shrink-0">
                <div className="flex gap-3 items-center">
                    <span>{userProfile.theme.toUpperCase()}</span>
                    <span>{userProfile.targetLanguage.toUpperCase()}</span>
                    <span className={`${getModeColor(gameMode)} flex items-center gap-1`}>
                        {getModeLabel(gameMode)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`hover:text-white ${soundEnabled ? 'text-green-400' : 'text-red-400'}`}
                    >
                        {soundEnabled ? 'SOUND:ON' : 'SOUND:OFF'}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`hover:text-white border-l border-gray-600 pl-2 ${showSettings ? 'text-white' : ''}`}
                    >
                        ⚙
                    </button>
                </div>
            </div>

            {/* Pack Info Banner (Phase 6) */}
            {packInfo && gameMode === 'offline' && (
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-lg p-3 text-xs">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">
                            {genreEmoji[packInfo.genre] || '📦'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white text-sm">{packInfo.title}</span>
                                <span className="px-2 py-0.5 bg-purple-700/30 rounded text-[10px] text-purple-300 uppercase">
                                    {packInfo.genre}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <span>by {packInfo.author}</span>
                                <span className="text-gray-500">•</span>
                                <span>{packInfo.progress}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
