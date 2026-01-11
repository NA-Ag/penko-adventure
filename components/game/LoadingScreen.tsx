
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile, Language } from '../../types';
import { TRANSLATIONS } from '../../translations';

interface LoadingScreenProps {
    progress: number;
    status: string;
    loaded?: number;      // Bytes loaded
    total?: number;       // Total bytes
    userProfile?: UserProfile;  // For language translations
}

interface LoadingStage {
    name: string;
    icon: string;
    range: [number, number]; // Progress percentage range
    completed: boolean;
    active: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, status, loaded, total, userProfile }) => {
    const { t } = useTranslation();
    const T = TRANSLATIONS[userProfile?.nativeLanguage || Language.ENGLISH] || TRANSLATIONS[Language.ENGLISH];
    // Download speed calculation
    const [downloadSpeed, setDownloadSpeed] = useState<number>(0);  // Bytes per second
    const [eta, setEta] = useState<number>(0);  // Seconds remaining
    const lastLoadedRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(Date.now());

    // Calculate download speed and ETA
    useEffect(() => {
        if (loaded && total && loaded > 0) {
            const now = Date.now();
            const timeDelta = (now - lastTimeRef.current) / 1000;  // Seconds

            if (timeDelta > 0.5) {  // Update every 0.5 seconds
                const bytesDelta = loaded - lastLoadedRef.current;
                const speed = bytesDelta / timeDelta;  // Bytes per second

                setDownloadSpeed(speed);

                // Calculate ETA
                const remaining = total - loaded;
                const estimatedSeconds = speed > 0 ? remaining / speed : 0;
                setEta(estimatedSeconds);

                lastLoadedRef.current = loaded;
                lastTimeRef.current = now;
            }
        }
    }, [loaded, total]);

    // Format bytes to human-readable
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    // Format seconds to MM:SS
    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds) || seconds === 0) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Parse loading stages from status text and progress
    const stages = useMemo((): LoadingStage[] => {
        const statusLower = status.toLowerCase();

        return [
            {
                name: 'Initializing services',
                icon: '⚙️',
                range: [0, 10],
                completed: progress > 10,
                active: progress <= 10
            },
            {
                name: 'Loading dictionaries',
                icon: '📚',
                range: [10, 30],
                completed: progress > 30,
                active: progress > 10 && progress <= 30
            },
            {
                name: 'Loading morphology patterns',
                icon: '🔤',
                range: [30, 50],
                completed: progress > 50,
                active: progress > 30 && progress <= 50
            },
            {
                name: 'Downloading AI model',
                icon: '🧠',
                range: [50, 95],
                completed: progress > 95,
                active: progress > 50 && progress <= 95
            },
            {
                name: 'Initializing translation engine',
                icon: '🌐',
                range: [95, 100],
                completed: progress >= 100,
                active: progress > 95 && progress < 100
            }
        ];
    }, [progress, status]);

    const activeStage = stages.find(s => s.active);
    const completedCount = stages.filter(s => s.completed).length;

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
            <div className="w-full max-w-2xl">
                <h2 className="text-2xl font-pixel text-blue-400 mb-6 text-center animate-pulse">
                    {t('common:ls_initializing')}
                </h2>

                {/* Overall Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                        <span>Overall Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Current Status */}
                <div className="mb-6 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 border-3 border-gray-700 rounded-full"></div>
                            <div className="absolute inset-0 border-3 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-mono text-blue-300">{status || 'Loading...'}</p>
                            <p className="text-xs font-mono text-gray-500 mt-1">
                                Step {completedCount + 1} of {stages.length}
                            </p>

                            {/* Download Metrics (only show if downloading) */}
                            {loaded && total && total > 0 && progress > 50 && progress < 95 && (
                                <div className="mt-2 text-xs font-mono space-y-1">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Downloaded:</span>
                                        <span className="text-blue-400">{formatBytes(loaded)} / {formatBytes(total)}</span>
                                    </div>
                                    {downloadSpeed > 0 && (
                                        <>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Speed:</span>
                                                <span className="text-green-400">{formatBytes(downloadSpeed)}/s</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>ETA:</span>
                                                <span className="text-yellow-400">{formatTime(eta)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading Stages */}
                <div className="space-y-2 mb-6">
                    {stages.map((stage, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg border transition-all duration-300 ${
                                stage.completed
                                    ? 'bg-green-900/20 border-green-700/50'
                                    : stage.active
                                    ? 'bg-blue-900/30 border-blue-600/70 animate-pulse'
                                    : 'bg-gray-800/30 border-gray-700/30'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{stage.icon}</span>
                                <div className="flex-1">
                                    <p className={`text-sm font-mono ${
                                        stage.completed ? 'text-green-300' :
                                        stage.active ? 'text-blue-300' :
                                        'text-gray-500'
                                    }`}>
                                        {stage.name}
                                    </p>
                                    {stage.active && (
                                        <div className="mt-1 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(100, Math.max(0,
                                                        ((progress - stage.range[0]) / (stage.range[1] - stage.range[0])) * 100
                                                    ))}%`
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xl">
                                    {stage.completed ? '✓' : stage.active ? '⏳' : '⬤'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Message - Dynamic model size */}
                <div className="text-center text-xs text-gray-500 bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">
                    <p>
                        <span className="text-blue-400">💡 {t('common:loading_first_time')}:</span>{' '}
                        {total && total > 0 ? (
                            T.loading_model_cache_dynamic
                                ?.replace('{size}', `${(total / (1024 * 1024 * 1024)).toFixed(1)}GB`)
                                || `The AI model (~${(total / (1024 * 1024 * 1024)).toFixed(1)}GB) is being cached to your browser storage.`
                        ) : (
                            T.loading_model_cache || "Your selected AI model is being cached to your browser storage."
                        )}
                    </p>
                    <p className="mt-1">{t('common:loading_once')}</p>
                </div>
            </div>
        </div>
    );
};
