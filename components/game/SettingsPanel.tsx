import React from 'react';
import { useTranslation } from 'react-i18next';
import { KOKORO_VOICES } from '../../constants';
import { GameMode } from '../../types';
import { exportSaveToFile } from '../../services/saveSystem';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
    apiKey: string | null;
    gameMode: GameMode;
    T: any;
    selectedVoiceName: string;
    setSelectedVoiceName: (name: string) => void;
    ttsEngine: 'native' | 'espeak' | 'universal';
    setTtsEngine: (engine: 'native' | 'espeak' | 'universal') => void;
    availableOfflineVoices: SpeechSynthesisVoice[];
    offlineVoiceURI: string;
    setOfflineVoiceURI: (uri: string) => void;
    correctionEngine: 'rules' | 'hunspell';
    setCorrectionEngine: (engine: 'rules' | 'hunspell') => void;
    isTTSReady?: boolean;
    downloadProgress?: number | null;
    onPreloadTTS?: () => void;
    ttsDownloadLoaded?: number;
    ttsDownloadTotal?: number;
    engineType?: 'kokoro' | 'mms' | 'piper';
    // New Props for Whisper
    sttEngine?: 'native' | 'neural';
    setSttEngine?: (engine: 'native' | 'neural') => void;
    isWhisperReady?: boolean;
    onPreloadWhisper?: () => void;
    whisperProgress?: number | null;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    apiKey,
    gameMode,
    T,
    selectedVoiceName,
    setSelectedVoiceName,
    ttsEngine,
    setTtsEngine,
    availableOfflineVoices,
    offlineVoiceURI,
    setOfflineVoiceURI,
    correctionEngine,
    setCorrectionEngine,
    isTTSReady,
    downloadProgress,
    onPreloadTTS,
    ttsDownloadLoaded,
    ttsDownloadTotal,
    engineType = 'kokoro',
    sttEngine,
    setSttEngine,
    isWhisperReady,
    onPreloadWhisper,
    whisperProgress
}) => {
    const { t } = useTranslation();

    const handleExportSave = () => {
        if (exportSaveToFile()) {
            toast.success("Save Cartridge Exported!");
        } else {
            toast.error("No save data found.");
        }
    };

    const isNeural = engineType === 'mms' || engineType === 'piper';
    const accentColor = engineType === 'mms' ? 'purple' : (engineType === 'piper' ? 'indigo' : 'cyan');
    const engineName = engineType === 'mms' ? 'Native Engine (MMS)' : (engineType === 'piper' ? 'Premium Engine' : 'Kokoro Engine');

    return (
        <div className="bg-gray-800 border-4 border-gray-600 p-4 rounded-none shadow-[4px_4px_0_rgba(0,0,0,0.8)] animate-fade-in shrink-0 space-y-5">
            {/* DATA MANAGEMENT & TTS DOWNLOAD */}
            <div className="border-b-2 border-gray-700 pb-4 space-y-3">
                <h4 className="text-blue-400 font-pixel text-sm mb-2 uppercase tracking-wide">{t('common:sp_game_data')}</h4>
                
                <button
                    onClick={handleExportSave}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-pixel text-xs shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase border-4 border-slate-500"
                >
                    {t('common:sp_export_save')}
                </button>

                {/* UNIFIED NEURAL TTS DOWNLOAD */}
                <div className="space-y-2">
                    {isTTSReady ? (
                        <div className={`flex flex-col items-center justify-center p-4 ${isNeural ? (engineType === 'mms' ? 'bg-purple-900/30 border-purple-500' : 'bg-indigo-900/30 border-indigo-500') : 'bg-green-900/30 border-green-500'} border-4 shadow-[4px_4px_0_rgba(0,0,0,0.8)] mb-2`}>
                            <span className={`${isNeural ? (engineType === 'mms' ? 'text-purple-400' : 'text-indigo-400') : 'text-green-400'} font-pixel text-base uppercase mb-2 tracking-wider`}>
                                {t('common:sp_ready')}
                            </span>
                            <span className={`${isNeural ? (engineType === 'mms' ? 'text-purple-500/80' : 'text-indigo-500/80') : 'text-green-500/80'} text-[10px] font-mono`}>{engineName} Online</span>
                        </div>
                    ) : (
                        <div className="relative group mb-2">
                            {downloadProgress !== null && downloadProgress !== undefined ? (
                                <div className="space-y-1">
                                    <div className={`flex justify-between text-[9px] font-mono ${isNeural ? (engineType === 'mms' ? 'text-purple-400' : 'text-indigo-400') : 'text-cyan-400'} px-1`}>
                                        <span>{t('common:sp_downloading')}</span>
                                        <span>
                                          {ttsDownloadTotal ? 
                                            `${Math.round((ttsDownloadLoaded || 0) / 1024 / 1024)} / ${Math.round(ttsDownloadTotal / 1024 / 1024)} MB (${downloadProgress}%)` : 
                                            `${downloadProgress}%`}
                                        </span>
                                    </div>
                                    <div className={`w-full bg-gray-900 h-8 border-2 ${isNeural ? (engineType === 'mms' ? 'border-purple-600' : 'border-indigo-600') : 'border-cyan-600'} overflow-hidden relative`}>
                                        <div 
                                            className={`h-full transition-all duration-300 ${isNeural ? (engineType === 'mms' ? 'bg-purple-500' : 'bg-indigo-500') : 'bg-cyan-500'}`}
                                            style={{ width: `${downloadProgress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)] bg-[length:1rem_1rem] animate-[progress-stripes_1s_linear_infinite]"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={onPreloadTTS}
                                    className={`w-full py-4 ${isNeural ? (engineType === 'mms' ? 'bg-purple-600 hover:bg-purple-500 border-purple-400' : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400') : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400'} text-slate-900 font-pixel text-xs shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase border-4`}
                                >
                                    {isNeural ? (engineType === 'mms' ? 'Download Native Neural Voice' : 'Download Premium Neural Voice') : t('common:sp_download_voice')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* VOICE SELECTION */}
            <div>
                <h4 className="text-green-400 font-pixel mb-2 border-b border-gray-700 pb-1 uppercase tracking-tight">
                    LOCAL VOICE MODEL
                </h4>

                <div className="space-y-3">
                    {/* Voice Selection */}
                    <div>
                        <label className="block text-gray-500 mb-2 uppercase text-xs tracking-widest">{t('common:voice')}</label>
                        <select 
                            value={selectedVoiceName}
                            onChange={(e) => setSelectedVoiceName(e.target.value)}
                            className={`w-full bg-slate-800 border-4 border-slate-600 py-3 px-4 ${isNeural ? (engineType === 'mms' ? 'text-purple-300 focus:border-purple-500' : 'text-indigo-300 focus:border-indigo-500') : 'text-cyan-300 focus:border-cyan-500'} font-pixel text-sm focus:outline-none shadow-[4px_4px_0_rgba(0,0,0,0.8)] appearance-none cursor-pointer`}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                            {KOKORO_VOICES.map(v => (
                                <option key={v.id} value={v.id} className="bg-slate-900 text-cyan-300 font-sans text-base">
                                    {v.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* SYSTEM INFO */}
            <div className="pt-2 border-t border-gray-700 opacity-40 select-none">
                <div className="flex justify-between text-[8px] font-mono text-gray-500 uppercase">
                    <span>Engine: {engineName}</span>
                    <span>v1.0-ONNX</span>
                </div>
            </div>
        </div>
    );
};