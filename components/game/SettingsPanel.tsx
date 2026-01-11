
import React from 'react';
import { useTranslation } from 'react-i18next';
import { GEMINI_VOICES } from '../../constants';
import { GameMode } from '../../types';
import { exportSaveToFile } from '../../services/saveSystem';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
    apiKey: string | null;
    gameMode: GameMode;
    T: any;
    selectedVoiceName: string;
    setSelectedVoiceName: (name: string) => void;
    voiceEffect: 'neutral' | 'droid' | 'villain';
    setVoiceEffect: (effect: 'neutral' | 'droid' | 'villain') => void;
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
    voiceEffect,
    setVoiceEffect,
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

    return (
        <div className="bg-gray-800 border border-gray-600 p-3 rounded shadow-lg animate-fade-in shrink-0 text-xs space-y-4">
            {/* DATA MANAGEMENT */}
            <div className="border-b border-gray-700 pb-3">
                <h4 className="text-blue-400 font-pixel mb-2">{t('common:sp_game_data')}</h4>
                <button
                    onClick={handleExportSave}
                    className="w-full bg-gray-700 hover:bg-blue-600 text-white py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border border-gray-600"
                >
                    {t('common:sp_export_save')}
                </button>
            </div>

            {/* CLOUD MODE OR UNIVERSAL TTS */}
            {(apiKey || (gameMode === 'local' && ttsEngine === 'universal')) ? (
                <div>
                    <h4 className="text-green-400 font-pixel mb-2 border-b border-gray-700 pb-1">
                        {apiKey ? t('common:voice_settings') : t('common:sp_neural_voice')}
                    </h4>

                    {/* Universal Voice Manager */}
                    {gameMode === 'local' && ttsEngine === 'universal' && (
                        <div className="mb-3 bg-gray-900/50 p-2 rounded border border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">{t('common:sp_status')}</span>
                                {isTTSReady ? (
                                    <span className="text-green-400 font-bold">{t('common:sp_ready')}</span>
                                ) : downloadProgress !== null && downloadProgress !== undefined ? (
                                    <span className="text-blue-400 font-mono">{downloadProgress}%</span>
                                ) : (
                                    <span className="text-gray-500">{t('common:sp_not_loaded')}</span>
                                )}
                            </div>
                            {!isTTSReady && (
                                <button
                                    onClick={onPreloadTTS}
                                    disabled={downloadProgress !== null && downloadProgress !== undefined}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors"
                                >
                                    {downloadProgress !== null && downloadProgress !== undefined ? t('common:sp_downloading') : t('common:sp_download_voice')}
                                </button>
                            )}
                            {downloadProgress !== null && downloadProgress !== undefined && (
                                <div className="w-full h-1 bg-gray-800 mt-1 rounded overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mb-2">
                        <label className="block text-gray-500 mb-1">{t('common:voice')}</label>
                        <select 
                            value={selectedVoiceName}
                            onChange={(e) => setSelectedVoiceName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-gray-300"
                        >
                            {GEMINI_VOICES.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-500 mb-1">{t('common:effect')}</label>
                        <div className="flex gap-2">
                            {(['neutral', 'droid', 'villain'] as const).map(eff => (
                                <button 
                                    key={eff}
                                    onClick={() => setVoiceEffect(eff)}
                                    className={`flex-1 py-1 px-2 rounded border ${
                                        voiceEffect === eff 
                                        ? 'bg-green-900 border-green-500 text-white' 
                                        : 'bg-gray-900 border-gray-700 text-gray-400'
                                    }`}
                                >
                                    {T['fx_' + eff] || eff}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* SPEECH INPUT SETTINGS - DISABLED (Under Testing) */}
            {/* {setSttEngine && (
                <div className="pt-2 border-t border-gray-700">
                    <h4 className="text-green-400 font-pixel mb-2 pb-1">SPEECH INPUT</h4>
                    <div className="mb-2">
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => setSttEngine('native')}
                                className={`flex-1 py-1 rounded border text-[10px] ${sttEngine === 'native' ? 'bg-blue-900 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                            >
                                {t('common:sp_browser_native')}
                            </button>
                            <button
                                onClick={() => setSttEngine('neural')}
                                className={`flex-1 py-1 rounded border text-[10px] ${sttEngine === 'neural' ? 'bg-purple-900 border-purple-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                            >
                                {t('common:sp_neural_offline')}
                            </button>
                        </div>

                        {sttEngine === 'neural' && (
                            <div className="bg-purple-900/20 p-2 rounded border border-purple-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-400">Whisper (Tiny):</span>
                                    {isWhisperReady ? (
                                        <span className="text-green-400 font-bold">{t('common:sp_ready')}</span>
                                    ) : whisperProgress ? (
                                        <span className="text-purple-400">{whisperProgress}%</span>
                                    ) : (
                                        <span className="text-gray-500">{t('common:sp_missing')}</span>
                                    )}
                                </div>
                                {!isWhisperReady && (
                                    <button
                                        onClick={onPreloadWhisper}
                                        disabled={!!whisperProgress}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white py-1 rounded text-[10px] font-bold transition-colors"
                                    >
                                        {whisperProgress ? t('common:sp_downloading') : 'DOWNLOAD (~40MB)'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )} */}

            {/* FALLBACK ENGINES */}
            {!apiKey && (
                <div className="pt-2 border-t border-gray-700">
                    <h4 className="text-green-400 font-pixel mb-2 pb-1">{t('common:tech_stack')}</h4>
                    <div className="mb-2">
                        <label className="block text-gray-500 mb-1">{t('common:tts_engine')}</label>
                        <select
                            value={ttsEngine}
                            onChange={(e) => setTtsEngine(e.target.value as any)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-gray-300 mb-1"
                        >
                            {gameMode === 'local' && <option value="universal">{t('common:sp_neural_speecht5')}</option>}
                            <option value="native">{t('common:engine_native')}</option>
                            <option value="espeak">{t('common:engine_espeak')}</option>
                        </select>

                        {ttsEngine === 'native' && availableOfflineVoices.length > 0 && (
                            <select
                                value={offlineVoiceURI}
                                onChange={(e) => setOfflineVoiceURI(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-gray-300 mt-1"
                            >
                                <option value="">{t('common:sp_default_voice')}</option>
                                {availableOfflineVoices.map(v => (
                                    <option key={v.voiceURI} value={v.voiceURI}>{v.name.substring(0,30)}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    {gameMode === 'offline' && (
                        <div>
                            <label className="block text-gray-500 mb-1">{t('common:corrector')}</label>
                            <select 
                                value={correctionEngine}
                                onChange={(e) => setCorrectionEngine(e.target.value as any)}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-gray-300"
                            >
                                <option value="rules">{t('common:corr_rules')}</option>
                                <option value="hunspell">{t('common:corr_hunspell')}</option>
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
