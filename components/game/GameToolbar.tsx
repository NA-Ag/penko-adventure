
import React from 'react';
import { UserProfile, GameMode } from '../../types';

interface GameToolbarProps {
    userProfile: UserProfile;
    gameMode: GameMode;
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
}

export const GameToolbar: React.FC<GameToolbarProps> = ({
    userProfile,
    gameMode,
    soundEnabled,
    setSoundEnabled,
    showSettings,
    setShowSettings
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
            case 'ollama': return 'NATIVE PC';
            default: return 'UNKNOWN';
        }
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
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] tracking-widest text-gray-400">SOUND:</span>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`relative w-12 h-6 transition-colors border-2 focus:outline-none shadow-[2px_2px_0_rgba(0,0,0,0.5)] ${soundEnabled ? 'bg-green-700 border-green-500' : 'bg-slate-700 border-slate-500'}`}
                            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
                            aria-label="Toggle Sound"
                        >
                            <span className={`absolute text-[10px] font-pixel top-[3px] transition-all ${soundEnabled ? 'left-1.5 text-green-100' : 'right-1.5 text-slate-400'}`}>
                                {soundEnabled ? 'ON' : 'OFF'}
                            </span>
                            <div className={`absolute top-[2px] w-4 h-4 bg-slate-200 border-b-2 border-r-2 border-slate-400 transition-transform ${soundEnabled ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`hover:text-white transition-colors p-1 border-l border-gray-600 pl-3 ml-1 ${showSettings ? 'text-white' : ''}`}
                        title="Settings"
                        aria-label="Settings"
                    >
                        ⚙️
                    </button>
                </div>
            </div>
        </>
    );
};
