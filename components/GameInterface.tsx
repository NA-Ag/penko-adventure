
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { UserProfile, Language, GameMode } from '../types';
import { SaveData } from '../services/saveSystem';
import { VisualizerGBC } from './VisualizerGBC';
import { TRANSLATIONS } from '../translations';
import { useAudio } from '../hooks/useAudio';
import useGameState from '../hooks/useGameState';
import { useTTS } from '../hooks/useTTS';
import { GameInput } from './GameInput';
import { StatusPanel } from './StatusPanel';
import { CartridgeService } from '../services/adventure/advanced/CartridgeService';
import { Cartridge } from "../types/Cartridge";
import { FacadeEngine } from '../services/FacadeEngine';

// Sub-components
import { LoadingScreen } from './game/LoadingScreen';
import { GameToolbar } from './game/GameToolbar';
import { SettingsPanel } from './game/SettingsPanel';
import { MessageList } from './game/MessageList';
import { SegaBootSequence } from './SegaBootSequence';
import { FacadeViewport } from './facade/FacadeViewport';

import { Scenario } from '../data/educational/frameworks/types';

interface GameInterfaceProps {
  userProfile: UserProfile;
  apiKey: string | null;
  initialState?: SaveData | null;
  gameMode?: GameMode;
  customData?: any;
  cartridge?: Cartridge | null;
  educationalScenario?: Scenario | null;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({ userProfile, apiKey, initialState, gameMode = 'ollama', customData, cartridge, educationalScenario }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(true);
  const [showBootSequence, setShowBootSequence] = useState(true); // Retro boot!
  
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [downloadLoaded, setDownloadLoaded] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);

  const { soundEnabled, setSoundEnabled, playSFX, audioCtxRef } = useAudio();

  // Neural TTS State
  const [isKokoroReady, setIsKokoroReady] = useState(false);
  const [kokoroProgress, setKokoroProgress] = useState<number | null>(null);
  
  const [isNeuralReady, setIsNeuralReady] = useState(false);
  const [neuralProgress, setNeuralProgress] = useState<number | null>(null);

  // Check Neural Engines Ready on mount
  useEffect(() => {
      CartridgeService.isModelCached('kokoro-82m').then(setIsKokoroReady);
      
      const engine = getEngineForLanguage();
      const { modelId } = CartridgeService.getNeuralModelId(userProfile.targetLanguage, engine);
      CartridgeService.isModelCached(modelId).then(setIsNeuralReady);
  }, [userProfile.targetLanguage]);

  const getEngineForLanguage = () => {
      return userProfile.targetLanguage === Language.ENGLISH ? 'kokoro' : 'mms';
  };

  const preloadNeuralEngine = async () => {
      const engine = getEngineForLanguage();
      const setProgress = engine === 'kokoro' ? setKokoroProgress : setNeuralProgress;
      const setReady = engine === 'kokoro' ? setIsKokoroReady : setIsNeuralReady;
      
      setProgress(0);
      try {
          const { modelId } = engine === 'kokoro' 
            ? { modelId: 'onnx-community/Kokoro-82M-v1.0-ONNX' } 
            : CartridgeService.getNeuralModelId(userProfile.targetLanguage, engine);

          const tempCartridge: Cartridge = {
              id: engine === 'kokoro' ? 'kokoro-82m' : 'neural-tts',
              name: 'TTS Engine',
              modelId: modelId,
              tier: 'tiny',
              estimatedSize: 100 * 1024 * 1024
          };
          const service = new CartridgeService(userProfile, tempCartridge);
          await service.preloadTTS(engine, (p) => setProgress(Math.round(p)));
          setProgress(null);
          setReady(true);
          toast.success(`${engine.toUpperCase()} TTS Engine Ready!`);
      } catch(e) {
          console.error(`[GameInterface] ${engine} TTS preload failed:`, e);
          setProgress(null);
          toast.error(`Failed to download ${engine} TTS Engine.`);
      }
  };

  const generateNeuralSpeech = async (text: string, voice: string, onProg?: (p: number) => void): Promise<string | { audio: Float32Array, sampleRate: number }> => {
      const engine = getEngineForLanguage();
      const isReady = engine === 'kokoro' ? isKokoroReady : isNeuralReady;
      
      if (isReady) {
          const { modelId } = engine === 'kokoro' 
            ? { modelId: 'onnx-community/Kokoro-82M-v1.0-ONNX' } 
            : CartridgeService.getNeuralModelId(userProfile.targetLanguage, engine);

          const tempCartridge: Cartridge = {
              id: engine === 'kokoro' ? 'kokoro-82m' : 'neural-tts',
              name: 'TTS Engine',
              modelId: modelId,
              tier: 'tiny',
              estimatedSize: 82 * 1024 * 1024
          };
          const service = new CartridgeService(userProfile, tempCartridge);
          try {
              return await service.generateSpeech(text, voice, engine, onProg);
          } catch (e) {
              console.error('[GameInterface] Local TTS failed', e);
          }
      }
      return '';
  };

  const handleProgress = useCallback((prog: number, text: string, loaded?: number, total?: number) => {
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
      cartridge,
      educationalScenario
  );

  const {
      isSpeaking,
      isGenerating,
      downloadProgress: ttsDownloadProgress,
      selectedVoiceName,
      setSelectedVoiceName,
      ttsEngine,
      setTtsEngine,
      availableOfflineVoices,
      offlineVoiceURI,
      setOfflineVoiceURI,
      speak,
      preload,
      isReady: isTTSReady,
      downloadLoaded: ttsDownloadLoaded,
      downloadTotal: ttsDownloadTotal
  } = useTTS({
      apiKey,
      targetLanguage: userProfile.targetLanguage,
      audioCtxRef,
      generateCloudSpeech: generateNeuralSpeech,
      preloadFn: preloadNeuralEngine,
      checkReadyFn: () => getEngineForLanguage() === 'kokoro' ? isKokoroReady : isNeuralReady
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isFacadeSessionActive, setIsFacadeSessionActive] = useState(false);
  const T = TRANSLATIONS[userProfile.nativeLanguage] || TRANSLATIONS[Language.ENGLISH];

  useEffect(() => {
    return () => {
      if (import.meta.env.DEV) return;
      if (gameMode === 'local') {
        CartridgeService.cleanup(false);
      }
    };
  }, [gameMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (gameState.history.length > 1 && showBootSequence) {
      setShowBootSequence(false);
    }
  }, [gameState.history, showBootSequence]);

  const lastModelMessage = useMemo(() => {
    return [...gameState.history].reverse().find(m => m.role === 'model' || m.role === 'system');
  }, [gameState.history]);

  const currentSceneData = useMemo(() =>
    lastModelMessage?.meta?.sceneData,
    [lastModelMessage]
  );

  const playerOptions = useMemo(() =>
    lastModelMessage?.meta?.playerOptions || [],
    [lastModelMessage]
  );

  const handleStartFacadeSession = useCallback(async () => {
    if (engine && engine instanceof FacadeEngine) {
      try {
        await engine.startSession();
        setIsFacadeSessionActive(true);
      } catch (error) {
        console.error('[GameInterface] Failed to start Facade session:', error);
      }
    }
  }, [engine]);

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
      <div className="lg:w-1/3 flex flex-col border-r border-gray-700 bg-gray-900 shrink-0 h-auto lg:h-full">
        <div className="p-2 lg:p-4 space-y-2 lg:space-y-4 overflow-y-auto h-full flex flex-col pb-12 lg:pb-12 custom-scrollbar">
            
            <GameToolbar
                userProfile={userProfile}
                gameMode={gameMode}
                soundEnabled={soundEnabled}
                setSoundEnabled={setSoundEnabled}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
            />

            {showSettings && (
                <SettingsPanel 
                    apiKey={apiKey}
                    gameMode={gameMode}
                    T={T}
                    selectedVoiceName={selectedVoiceName}
                    setSelectedVoiceName={setSelectedVoiceName}
                    ttsEngine={ttsEngine}
                    setTtsEngine={setTtsEngine}
                    availableOfflineVoices={availableOfflineVoices}
                    offlineVoiceURI={offlineVoiceURI}
                    setOfflineVoiceURI={setOfflineVoiceURI}
                    correctionEngine={correctionEngine}
                    setCorrectionEngine={setCorrectionEngine}
                    isTTSReady={getEngineForLanguage() === 'kokoro' ? isKokoroReady : isNeuralReady}
                    downloadProgress={getEngineForLanguage() === 'kokoro' ? kokoroProgress : neuralProgress}
                    onPreloadTTS={preload}
                    ttsDownloadLoaded={ttsDownloadLoaded}
                    ttsDownloadTotal={ttsDownloadTotal}
                    engineType={getEngineForLanguage()}
                    />
            )}

            

            {isVisualizerOpen && (
                <div className="hidden lg:flex bg-gray-800 rounded-xl border border-gray-700 p-2 shadow-lg shrink-0 animate-fade-in flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-2 px-2">
                        <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {gameState.location?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </div>
                    <div className="w-full max-w-[480px] aspect-[4/3] bg-black rounded-lg border-4 border-gray-700 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        {showBootSequence ? (
                            <SegaBootSequence 
                                onComplete={() => setShowBootSequence(false)} 
                                theme={userProfile.theme}
                                nativeLanguage={userProfile.nativeLanguage}
                                isEducational={!!userProfile.learningPath && userProfile.learningPath === 'educational'}
                            />
                        ) : (
                            <VisualizerGBC
                                sceneData={currentSceneData}
                                narrativeText={lastModelMessage?.content}
                            />
                        )}
                    </div>
                </div>
            )}

            <StatusPanel 
                    health={gameState.health} 
                    inventory={gameState.currentInventory} 
                    T={T} 
                    educationalScenario={educationalScenario}
                    nativeLanguage={userProfile.nativeLanguage}
                />
        </div>
      </div>

      {/* RIGHT COLUMN: Chat & Input */}
      <div className="flex-1 flex flex-col bg-gray-900 relative h-full overflow-hidden">
        
        <MessageList
            history={gameState.history}
            isLoading={gameState.isLoading}
            T={T}
            isSpeaking={isSpeaking}
            isGenerating={isGenerating}
            downloadProgress={kokoroProgress}
            speak={speak}
            setInput={setInput}
            messagesEndRef={messagesEndRef}
            loadingStatus={downloadStatus}
            modelDownloadProgress={downloadProgress}
            engine={engine}
            targetLanguage={userProfile.targetLanguage}
            isBeginner={userProfile.cefrLevel === 'A1'}
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
                playerOptions={playerOptions}
            />
        </div>

      </div>
    </div>
  );
};
