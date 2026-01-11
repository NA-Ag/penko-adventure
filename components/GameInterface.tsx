
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { UserProfile, Language, GameMode } from '../types';
import { SaveData } from '../services/saveSystem';
import { VisualizerGBC } from './VisualizerGBC';
import { TRANSLATIONS } from '../translations';
import { useAudio } from '../hooks/useAudio';
import useGameState from '../hooks/useGameState';
import { useTTS } from '../hooks/useTTS';
import { GameInput } from './GameInput';
import { StatusPanel } from './StatusPanel';
import { CartridgeService } from '../services/CartridgeService';
import { Cartridge } from './setup/CartridgeManager';
import { FacadeEngine } from '../services/FacadeEngine';

// Sub-components
import { LoadingScreen } from './game/LoadingScreen';
import { GameToolbar } from './game/GameToolbar';
import { SettingsPanel } from './game/SettingsPanel';
import { MessageList } from './game/MessageList';
import { RetroBootSequence } from './RetroBootSequence';
import { FacadeViewport } from './facade/FacadeViewport';

interface GameInterfaceProps {
  userProfile: UserProfile;
  apiKey: string | null;
  initialState?: SaveData | null;
  gameMode?: GameMode;
  customData?: any;
  cartridge?: Cartridge | null;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ userProfile, apiKey, initialState, gameMode = 'offline', customData, cartridge }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(true);
  const [showBootSequence, setShowBootSequence] = useState(true); // Retro boot!
  
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [downloadLoaded, setDownloadLoaded] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);

  const { soundEnabled, setSoundEnabled, playSFX, audioCtxRef } = useAudio();

  // Whisper State (Game Interface level for Settings)
  const [sttEngine, setSttEngine] = useState<'native' | 'neural'>('native');
  const [whisperProgress, setWhisperProgress] = useState<number | null>(null);
  const [isWhisperReady, setIsWhisperReady] = useState(false);

  // Facade session state
  const [isFacadeSessionActive, setIsFacadeSessionActive] = useState(false);

  // Check Whisper Ready
  useEffect(() => {
      CartridgeService.isModelCached('whisper').then(setIsWhisperReady);
  }, []);

  const preloadWhisper = async () => {
      if (!cartridge) return;
      const service = new CartridgeService(userProfile, cartridge);
      setWhisperProgress(0);
      try {
          // Note: preloadWhisper method doesn't exist on CartridgeService
          // This functionality may need to be implemented or removed
          // await service.preloadWhisper((p) => setWhisperProgress(Math.round(p)));
          setWhisperProgress(null);
          setIsWhisperReady(true);
      } catch(e) {
          console.error(e);
          setWhisperProgress(null);
      }
  };

  const handleProgress = useCallback((prog: number, text: string, loaded?: number, total?: number) => {
      // Only log at 10% intervals and completion to prevent console spam (reduces 10,000+ logs to ~10)
      if (prog % 10 === 0 || prog === 100 || prog === 0) {
          console.log(`[GameInterface] Download progress: ${prog}% - ${text}`);
      }
      setDownloadProgress(prog);
      setDownloadStatus(text);
      if (loaded !== undefined) setDownloadLoaded(loaded);
      if (total !== undefined) setDownloadTotal(total);
  }, []);

  const {
      gameState,
      input,
      setInput,
      handleSend,
      correctionEngine,
      setCorrectionEngine,
      engine
  } = useGameState(
      userProfile,
      gameMode,
      apiKey,
      initialState,
      playSFX,
      handleProgress,
      customData,
      cartridge
  );

  // Get pack info from CommunityEngineV3 if available (Phase 6)
  const packInfo = useMemo(() => {
    if (gameMode === 'offline' && engine && 'getPackInfo' in engine) {
      return (engine as any).getPackInfo();
    }
    return null;
  }, [gameMode, engine, gameState.history.length]); // Update when new messages arrive

  const { 
      isSpeaking, 
      downloadProgress: ttsDownloadProgress,
      voiceEffect, 
      setVoiceEffect, 
      selectedVoiceName, 
      setSelectedVoiceName,
      ttsEngine, 
      setTtsEngine, 
      availableOfflineVoices,
      offlineVoiceURI,
      setOfflineVoiceURI,
      speak,
      preload,
      isReady: isTTSReady
  } = useTTS({
      apiKey,
      targetLanguage: userProfile.targetLanguage,
      audioCtxRef,
      generateCloudSpeech: engine && 'generateSpeech' in engine
            ? (t, v, onProg) => (engine as any).generateSpeech(t, v, onProg)
            : async () => '',
      preloadFn: engine && 'preloadTTS' in engine 
            ? (onProg) => (engine as any).preloadTTS(onProg) 
            : undefined,
      checkReadyFn: engine && 'isTTSReady' in engine
            ? () => (engine as any).isTTSReady
            : undefined
  });

  const [showSettings, setShowSettings] = useState(false);
  const T = TRANSLATIONS[userProfile.nativeLanguage] || TRANSLATIONS[Language.ENGLISH];

  // Cleanup CartridgeService worker on unmount to prevent memory leaks
  // NOTE: Only cleanup if we're truly unmounting (not React StrictMode remounting)
  // The worker is a shared singleton, so we don't want to terminate it prematurely
  useEffect(() => {
    return () => {
      // Skip cleanup in development mode (React StrictMode causes false unmounts)
      if (import.meta.env.DEV) {
        return;
      }

      if (gameMode === 'local') {
        CartridgeService.cleanup();
      }
    };
  }, [gameMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Auto-dismiss boot sequence when first message arrives (game initialized)
    if (gameState.history.length > 0 && showBootSequence) {
      setShowBootSequence(false);
    }
  }, [gameState.history, showBootSequence]);

  // Fallback: Auto-dismiss boot sequence after 10 seconds even if game fails to load
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (showBootSequence) {
        console.log('[GameInterface] Boot sequence timeout - auto-dismissing');
        setShowBootSequence(false);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, [showBootSequence]);

  // Memoize expensive computations to prevent unnecessary re-renders
  const lastModelMessage = useMemo(() => {
    return [...gameState.history].reverse().find(m => m.role === 'model' || m.role === 'system');
  }, [gameState.history]);

  const currentSceneData = useMemo(() =>
    lastModelMessage?.meta?.sceneData,
    [lastModelMessage]
  );

  // Extract player options for Pronunciation Scoring
  const playerOptions = useMemo(() =>
    lastModelMessage?.meta?.playerOptions || [],
    [lastModelMessage]
  );

  // Facade session start handler
  const handleStartFacadeSession = useCallback(async () => {
    if (engine && engine instanceof FacadeEngine) {
      try {
        await engine.startSession();
        setIsFacadeSessionActive(true);
      } catch (error) {
        console.error('[GameInterface] Failed to start Facade session:', error);
        alert('Failed to start Facade session. Check console for details.');
      }
    }
  }, [engine]);

  // --- LOADING SCREEN ---
  // Skip loading screen if cartridge is provided (already downloaded via CartridgeManager)
  const skipLoadingScreen = cartridge !== null && cartridge !== undefined;

  if (gameState.isLoading && gameMode === 'local' && downloadProgress < 100 && gameState.history.length === 0 && !skipLoadingScreen) {
      return <LoadingScreen
        progress={downloadProgress}
        status={downloadStatus}
        loaded={downloadLoaded}
        total={downloadTotal}
        userProfile={userProfile}
      />;
  }

  // FACADE MODE: Use dedicated Facade viewport
  if (gameMode === 'facade' && engine instanceof FacadeEngine) {
    return (
      <FacadeViewport
        engine={engine}
        onStartSession={handleStartFacadeSession}
        isSessionActive={isFacadeSessionActive}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full overflow-hidden bg-gray-900">
      
      {/* LEFT COLUMN: Toolbar, Stats, Visualizer */}
      <div className={`lg:w-1/3 flex flex-col border-r border-gray-700 bg-gray-900 shrink-0 transition-[height] duration-300 ${isVisualizerOpen ? 'h-[45%] lg:h-full' : 'h-auto lg:h-full'}`}>
        <div className="p-2 lg:p-4 space-y-2 lg:space-y-4 overflow-y-auto h-full flex flex-col">
            
            <GameToolbar
                userProfile={userProfile}
                gameMode={gameMode}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                packInfo={packInfo}
            />

            {showSettings && (
                <SettingsPanel 
                    apiKey={apiKey}
                    gameMode={gameMode}
                    T={T}
                    selectedVoiceName={selectedVoiceName}
                    setSelectedVoiceName={setSelectedVoiceName}
                    voiceEffect={voiceEffect}
                    setVoiceEffect={setVoiceEffect}
                    ttsEngine={ttsEngine}
                    setTtsEngine={setTtsEngine}
                    availableOfflineVoices={availableOfflineVoices}
                    offlineVoiceURI={offlineVoiceURI}
                    setOfflineVoiceURI={setOfflineVoiceURI}
                    correctionEngine={correctionEngine}
                    setCorrectionEngine={setCorrectionEngine}
                    isTTSReady={isTTSReady}
                    downloadProgress={ttsDownloadProgress}
                    onPreloadTTS={preload}
                    sttEngine={sttEngine}
                    setSttEngine={setSttEngine}
                    isWhisperReady={isWhisperReady}
                    onPreloadWhisper={preloadWhisper}
                    whisperProgress={whisperProgress}
                />
            )}

            {/* Mobile Toggle for Visualizer */}
            <button 
                onClick={() => setIsVisualizerOpen(!isVisualizerOpen)}
                className="lg:hidden w-full text-[10px] uppercase tracking-widest bg-gray-800 border border-gray-700 p-1 rounded text-gray-400 hover:text-white flex justify-center items-center gap-2"
            >
                <span>{isVisualizerOpen ? '▲ Hide Visuals' : '▼ Show Visuals'}</span>
            </button>

            {isVisualizerOpen && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-2 shadow-lg shrink-0 animate-fade-in">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {gameState.location.toUpperCase()}
                        </span>
                    </div>
                    {showBootSequence ? (
                        <RetroBootSequence onComplete={() => setShowBootSequence(false)} />
                    ) : (
                        <VisualizerGBC
                            sceneData={currentSceneData}
                            narrativeText={lastModelMessage?.content}
                        />
                    )}
                </div>
            )}

            {isVisualizerOpen && (
                <StatusPanel 
                    health={gameState.health} 
                    inventory={gameState.currentInventory} 
                    T={T} 
                />
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: Chat & Input */}
      <div className="flex-1 flex flex-col bg-gray-900 relative h-full overflow-hidden">
        
        <MessageList
            history={gameState.history}
            isLoading={gameState.isLoading}
            T={T}
            isSpeaking={isSpeaking}
            downloadProgress={ttsDownloadProgress}
            speak={speak}
            setInput={setInput}
            messagesEndRef={messagesEndRef}
            loadingStatus={downloadStatus}
            modelDownloadProgress={downloadProgress}
        />

        <div className="p-2 lg:p-4 bg-gray-900 border-t border-gray-700 shrink-0 pb-safe">
            <GameInput 
                input={input} 
                setInput={setInput} 
                handleSend={handleSend} 
                isLoading={gameState.isLoading} 
                T={T} 
                playSFX={playSFX}
                targetLanguage={userProfile.targetLanguage}
                sttEngine={sttEngine}
                playerOptions={playerOptions}
            />
        </div>

      </div>
    </div>
  );
};
