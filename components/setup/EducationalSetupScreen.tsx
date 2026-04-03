
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Language, UserProfile, GameMode, AppConfig, NarrativeGenre } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { hasSave, importSaveFromFile } from '../../services/saveSystem';
import { CartridgeService } from '../../services/adventure/advanced/CartridgeService';
import { Cartridge } from '../../types/Cartridge';
import { PenkoLogo } from '../PenkoLogo';
import { CloudModeIcon } from '../icons/CloudModeIcon';
import { BrowserAIModeIcon } from '../icons/BrowserAIModeIcon';
import { GenreBackground } from '../GenreBackground';
import { LANGUAGE_FAMILIES, LanguageFamily } from '../../data/languageFamilies';
import { isLanguageStable } from '../../data/languageStatus';
import { PenkoIcon, PenkoIconType } from '../icons/PenkoIcon';

// Import Sub-components
import { CloudConfig } from './CloudConfig';

import { getFrameworkForLanguage } from '../../data/educational/frameworks';
import { Scenario } from '../../data/educational/frameworks/types';
import { EDUCATIONAL_TRANSLATIONS } from '../../data/educational/translations';

interface EducationalSetupScreenProps {
  onStart: (profile: UserProfile, mode: GameMode, apiKey: string | null, customData?: any, cartridge?: Cartridge, scenario?: Scenario) => void;
  onContinue: () => void;
  initialNativeLanguage: Language;
  onNativeLanguageChange: (lang: Language) => void;
  onBack: () => void;
}

const EducationalSetupScreen: React.FC<EducationalSetupScreenProps> = ({ onStart, onContinue, initialNativeLanguage, onNativeLanguageChange, onBack }) => {
  const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/');
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>({
    targetLanguage: Language.SPANISH,
    nativeLanguage: initialNativeLanguage,
    theme: 'fantasy'
  });

  const [apiKey, setApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-flash-lite-preview');
  const [mode, setMode] = useState<GameMode>('local');
  const [saveExists, setSaveExists] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  // Model Cache Status
  const [isQwenCached, setIsQwenCached] = useState(false);
  const [isPrewarming, setIsPrewarming] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Linguistic UI state
  const [selectedFamily, setSelectedFamily] = useState<string>('romance');

  // Local backend selection (browser/ollama/lmstudio)
  const [localBackend, setLocalBackend] = useState<'browser' | 'ollama' | 'lmstudio'>('browser');



  // Detection results for localhost AI servers
  const [ollamaDetected, setOllamaDetected] = useState(false);
  const [lmStudioDetected, setLmStudioDetected] = useState(false);

  const [customData, setCustomData] = useState<any>(null);
  const [appScreen, setAppScreen] = useState<'selection' | 'educational'>('selection');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveInputRef = useRef<HTMLInputElement>(null);

  // Model download state
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [downloadLoaded, setDownloadLoaded] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [setupPhase, setSetupPhase] = useState<'path' | 'proficiency' | 'settings' | 'educational_scenarios'>('settings');

  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const framework = getFrameworkForLanguage(profile.targetLanguage);
  const ET = EDUCATIONAL_TRANSLATIONS[initialNativeLanguage] || EDUCATIONAL_TRANSLATIONS[Language.ENGLISH];

  const T = TRANSLATIONS[initialNativeLanguage] || TRANSLATIONS[Language.ENGLISH];

  const BROWSER_MODEL_ID = 'onnx-community/Qwen3.5-0.8B-ONNX';

  // Detect Ollama server
  const detectOllama = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2s timeout
      });
      setOllamaDetected(response.ok);
    } catch {
      setOllamaDetected(false);
    }
  };

  // Detect LM Studio server
  const detectLMStudio = async () => {
    try {
      const response = await fetch('http://localhost:1234/v1/models', {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2s timeout
      });
      setLmStudioDetected(response.ok);
    } catch {
      setLmStudioDetected(false);
    }
  };

  useEffect(() => {
    const storedKey = sessionStorage.getItem('penko_api_key');
    const storedModel = sessionStorage.getItem('penko_gemini_model');
    if (storedKey) {
        setApiKey(storedKey);
        setMode('cloud');
    }
    if (storedModel) {
        setGeminiModel(storedModel);
    }
    setSaveExists(hasSave());

    // Load Config
    fetch('/config.json')
        .then(res => res.json())
        .then((cfg: AppConfig) => {
            setConfig(cfg);
        })
        .catch(() => {
            console.log("No external config found, using defaults");
        });

    // Check Model Cache Status
    CartridgeService.isModelCached(BROWSER_MODEL_ID).then(setIsQwenCached);

    // Detect localhost AI servers (non-blocking)
    detectOllama();
    detectLMStudio();

  }, []);


  // Sync profile native language when initialNativeLanguage prop changes
  useEffect(() => {
    setProfile(prev => {
      // If the target language is the same as the new native language, switch the target language to English (or Spanish if English is the new native language)
      let newTarget = prev.targetLanguage;
      if (newTarget === initialNativeLanguage) {
        newTarget = initialNativeLanguage === Language.ENGLISH ? Language.SPANISH : Language.ENGLISH;
      }
      return { ...prev, nativeLanguage: initialNativeLanguage, targetLanguage: newTarget };
    });
  }, [initialNativeLanguage]);

  // AGRESSIVE PRE-WARMING FOR BROWSER MODE
  useEffect(() => {
      if (mode === 'local' && isQwenCached && !isPrewarming) {
          console.log("[SetupScreen] Pre-warming Browser AI model in background...");
          setIsPrewarming(true);
          const defaultCartridge: Cartridge = {
            id: 'qwen3.5-0.8b',
            name: 'Qwen3.5 0.8B',
            modelId: BROWSER_MODEL_ID,
            tier: 'small',
            estimatedSize: 700 * 1024 * 1024
          };
          const service = new CartridgeService(profile, defaultCartridge);
          // Silently load model in background so it's instantly ready when user hits Start
          service.loadModel().catch(e => console.warn("Pre-warm failed:", e));
      }
  }, [mode, isQwenCached]);

  const handleDownloadModel = async () => {
    setIsDownloading(true);
    setDownloadStatus(T.local_model_initializing || 'Initializing download...');
    setDownloadProgress(0);

    const defaultCartridge: Cartridge = {
      id: 'qwen3.5-0.8b',
      name: 'Qwen3.5 0.8B',
      modelId: BROWSER_MODEL_ID,
      tier: 'small',
      estimatedSize: 700 * 1024 * 1024
    };

    try {
      const service = new CartridgeService(profile, defaultCartridge);
      await service.loadModel((prog: number, text: string, loaded?: number, total?: number) => {
        setDownloadProgress(prog);
        setDownloadStatus(text);
        if (loaded !== undefined) setDownloadLoaded(loaded);
        if (total !== undefined) setDownloadTotal(total);
      });
      setIsQwenCached(true);
      toast.success(T.local_model_ready || '✅ Model is downloaded and ready to play!', { duration: 3000 });
      // Clear pending requests but do NOT terminate the worker.
      // Keeping it alive prevents OOM errors when GameInterface mounts
      // and tries to immediately load the 700MB model again.
      CartridgeService.cleanup(false);
    } catch (e: any) {
      toast.error(`Download failed: ${e.message}`, { duration: 5000 });
      setIsQwenCached(false);
      // Force kill the worker if it crashed
      CartridgeService.cleanup(true);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadStatus('');
      setDownloadLoaded(0);
      setDownloadTotal(0);
    }
  };


  const handleNativeLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLang = e.target.value as Language;
      setProfile({ ...profile, nativeLanguage: newLang });
      onNativeLanguageChange(newLang);
  };

  const handleStart = async () => {
      if (mode === 'cloud' && !apiKey.trim()) {
          toast.error("Please enter an API Key for Cloud Mode.", { duration: 4000 });
          return;
      }

      // Prepare payload
      let payload: any = customData || {};

      // For Native PC Mode (ollama), check if server is detected
      if (mode === 'ollama') {
        if (!ollamaDetected) {
          toast.error("Ollama server not detected! Please ensure Ollama is installed and running.", { duration: 5000 });
          return;
        }
        
        // Auto-configure the requested model
        const modelName = 'qwen3:0.6b'; 
        payload = { ...payload, model: modelName };
      }

      // Store API key and provider in sessionStorage for cloud mode
      if (mode === 'cloud') {
        sessionStorage.setItem('penko_api_key', apiKey);
        sessionStorage.setItem('penko_gemini_model', geminiModel);
        payload = { ...payload, geminiModel };
      }

      // Pass cartridge for Browser AI Mode
      const defaultCartridge: Cartridge | undefined = mode === 'local' ? {
        id: 'qwen3.5-0.8b',
        name: 'Qwen3.5 0.8B',
        modelId: BROWSER_MODEL_ID,
        tier: 'small',
        estimatedSize: 700 * 1024 * 1024
      } : undefined;

      if (mode === 'local' && !isQwenCached) {
          toast.error(T.local_model_desc || "Local AI Model must be downloaded first.");
          return;
      }

      if (!selectedScenario) {
          toast.error(T.select_scenario || "Please select a scenario first.");
          return;
      }

      const finalProfile = { ...profile, nativeLanguage: initialNativeLanguage };
      onStart(finalProfile, mode, mode === 'cloud' ? apiKey : null, payload, defaultCartridge, selectedScenario || undefined);
  };

  // Alias for genre button clicks
  const handleStartGame = () => {
    handleStart();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.content_type || json.meta?.type) {
                  setCustomData(json);
                  toast.success(`Loaded Custom Content: ${file.name}`);
              } else {
                  toast.error("Invalid Penko JSON file.");
              }
          } catch (err) {
              toast.error("Failed to parse JSON.");
          }
      };
      reader.readAsText(file);
  };

  const handleImportSave = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const success = await importSaveFromFile(file);
      if (success) {
          toast.success(t('common:save_imported'));
          setSaveExists(true);
      } else {
          toast.error("Invalid Cartridge File.");
      }
  };

  type ThemeType = 'fantasy' | 'scifi' | 'mystery' | 'horror' | 'western' | 'cyberpunk' | 'time_travel' | 'post_apocalyptic' | 'pirate' | 'spy' | 'slice_of_life' | 'survival' | 'superhero' | 'fairy_tale' | 'steampunk' | 'school';

  const themes: { id: ThemeType, label: string, color: string, activeStyles: string }[] = [
      { id: 'fantasy', label: T.fantasy || 'Fantasy', color: 'purple', activeStyles: 'bg-purple-600 border-purple-400 text-white' },
      { id: 'scifi', label: T.scifi || 'Sci-Fi', color: 'blue', activeStyles: 'bg-blue-600 border-blue-400 text-white' },
      { id: 'mystery', label: T.mystery || 'Mystery', color: 'slate', activeStyles: 'bg-slate-600 border-slate-400 text-white' },
      { id: 'horror', label: T.horror || 'Horror', color: 'red', activeStyles: 'bg-red-700 border-red-500 text-white' },
      { id: 'western', label: T.western || 'Western', color: 'orange', activeStyles: 'bg-orange-600 border-orange-400 text-white' },
      { id: 'cyberpunk', label: T.cyberpunk || 'Cyberpunk', color: 'pink', activeStyles: 'bg-pink-600 border-pink-400 text-white' },
      { id: 'time_travel', label: T.time_travel || 'Time Travel', color: 'indigo', activeStyles: 'bg-indigo-600 border-indigo-400 text-white' },
      { id: 'post_apocalyptic', label: T.post_apocalyptic || 'Post-Apoc', color: 'yellow', activeStyles: 'bg-yellow-700 border-yellow-500 text-white' },
      { id: 'pirate', label: T.pirate || 'Pirate', color: 'teal', activeStyles: 'bg-teal-600 border-teal-400 text-white' },
      { id: 'spy', label: T.spy || 'Spy', color: 'gray', activeStyles: 'bg-gray-700 border-gray-400 text-white' },
      { id: 'slice_of_life', label: T.slice_of_life || 'Slice of Life', color: 'rose', activeStyles: 'bg-rose-500 border-rose-300 text-white' },
      { id: 'survival', label: T.survival || 'Survival', color: 'green', activeStyles: 'bg-green-700 border-green-500 text-white' },
      { id: 'superhero', label: T.superhero || 'Superhero', color: 'sky', activeStyles: 'bg-sky-600 border-sky-400 text-white' },
      { id: 'fairy_tale', label: T.fairy_tale || 'Fairy Tale', color: 'fuchsia', activeStyles: 'bg-fuchsia-500 border-fuchsia-300 text-white' },
      { id: 'steampunk', label: T.steampunk || 'Steampunk', color: 'amber', activeStyles: 'bg-amber-700 border-amber-500 text-white' },
      { id: 'school', label: T.school || 'School', color: 'blue', activeStyles: 'bg-blue-500 border-blue-300 text-white' },
  ];

  // Handle genre selection
  const handleThemeChange = (themeId: string) => {
    setProfile({...profile, theme: themeId as NarrativeGenre});
  };

  // Environmental effects based on genre
  const getGenreEnvironment = (genre: string) => {
    const effects = {
      fantasy: { bgGradient: 'from-purple-950/30 via-transparent to-purple-950/30', borderColor: 'border-purple-500', glowColor: 'shadow-purple-500/20' },
      scifi: { bgGradient: 'from-blue-950/30 via-transparent to-blue-950/30', borderColor: 'border-blue-500', glowColor: 'shadow-blue-500/20' },
      mystery: { bgGradient: 'from-slate-950/40 via-transparent to-slate-950/40', borderColor: 'border-slate-500', glowColor: 'shadow-slate-500/20' },
      horror: { bgGradient: 'from-red-950/40 via-transparent to-red-950/40', borderColor: 'border-red-600', glowColor: 'shadow-red-600/30' },
      western: { bgGradient: 'from-orange-950/30 via-transparent to-orange-950/30', borderColor: 'border-orange-600', glowColor: 'shadow-orange-500/20' },
      cyberpunk: { bgGradient: 'from-pink-950/30 via-transparent to-pink-950/30', borderColor: 'border-pink-500', glowColor: 'shadow-pink-500/30' },
      time_travel: { bgGradient: 'from-indigo-950/40 via-transparent to-indigo-950/40', borderColor: 'border-indigo-500', glowColor: 'shadow-indigo-500/30' },
      post_apocalyptic: { bgGradient: 'from-yellow-950/40 via-transparent to-yellow-950/40', borderColor: 'border-yellow-600', glowColor: 'shadow-yellow-600/30' },
      pirate: { bgGradient: 'from-teal-950/30 via-transparent to-teal-950/30', borderColor: 'border-teal-500', glowColor: 'shadow-teal-500/30' },
      spy: { bgGradient: 'from-gray-950/40 via-transparent to-gray-950/40', borderColor: 'border-gray-500', glowColor: 'shadow-gray-500/30' },
      slice_of_life: { bgGradient: 'from-rose-950/30 via-transparent to-rose-950/30', borderColor: 'border-rose-400', glowColor: 'shadow-rose-400/20' },
      survival: { bgGradient: 'from-green-950/40 via-transparent to-green-950/40', borderColor: 'border-green-600', glowColor: 'shadow-green-600/30' },
      superhero: { bgGradient: 'from-sky-950/30 via-transparent to-sky-950/30', borderColor: 'border-sky-500', glowColor: 'shadow-sky-500/30' },
      fairy_tale: { bgGradient: 'from-fuchsia-950/20 via-transparent to-fuchsia-950/20', borderColor: 'border-fuchsia-400', glowColor: 'shadow-fuchsia-400/20' },
      steampunk: { bgGradient: 'from-amber-950/40 via-transparent to-amber-950/40', borderColor: 'border-amber-600', glowColor: 'shadow-amber-600/30' },
      school: { bgGradient: 'from-blue-900/30 via-transparent to-blue-900/30', borderColor: 'border-blue-400', glowColor: 'shadow-blue-400/20' }
    };
    return effects[genre as keyof typeof effects] || effects.fantasy;
  };

  const genreEnv = getGenreEnvironment(profile.theme || 'fantasy');

  // --- STANDARD UI ---
  if (appScreen === 'educational') {
      return (
        <EducationalSetupScreen 
            onStart={onStart}
            onContinue={onContinue}
            initialNativeLanguage={initialNativeLanguage}
            onNativeLanguageChange={onNativeLanguageChange}
            onBack={() => setAppScreen('selection')}
        />
      );
  }

  return (
    <>
      {/* Animated genre background */}
      <GenreBackground genre={profile.theme || 'fantasy'} />

      <div className={`flex flex-col items-center min-h-full py-8 px-4 sm:px-12 w-full max-w-[1400px] mx-auto animate-fade-in overflow-y-auto bg-gradient-to-b ${genreEnv.bgGradient} transition-all duration-700 relative z-10`}>

        {setupPhase === 'path' ? (
            <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-in p-6 mt-10">
                <div className="mb-12 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse"></div>
                            <div className="relative bg-slate-900 border-4 border-cyan-500 p-3 shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
                                <PenkoLogo size={80} animated={true} />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-retro text-cyan-400 glow-text mb-3 tracking-wider">
                        {T.select_experience || 'SELECT YOUR EXPERIENCE'}
                    </h2>
                    <p className="text-sm text-slate-400 font-pixel">
                        {T.choose_learning_style || 'Choose how you want to learn today'}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                    <button 
                        onClick={() => { setProfile({...profile, learningPath: 'adventure'}); setSetupPhase('proficiency'); }}
                        className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-none border-2 border-cyan-500 shadow-[8px_8px_0px_0px_rgba(34,211,238,1)] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(34,211,238,1)] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] transition-all group"
                    >
                        <div className="mb-6 grayscale group-hover:grayscale-0 transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                            <PenkoIcon type="adventure" size={80} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-wider group-hover:text-cyan-400 transition-colors">{T.adventure_path || 'Adventure Path'}</h2>
                        <p className="text-slate-400 text-center font-mono italic text-sm">{T.adventure_path_desc || '"Learn through play in an open world"'}</p>
                    </button>
                    <button 
                        onClick={() => setAppScreen('educational')}
                        className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-none border-2 border-amber-500 shadow-[8px_8px_0px_0px_rgba(245,158,11,1)] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(245,158,11,1)] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] transition-all group"
                    >
                        <div className="mb-6 grayscale group-hover:grayscale-0 transition-all drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                            <PenkoIcon type="educational" size={80} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-wider group-hover:text-amber-400 transition-colors">{T.educational_path || 'Educational Path'}</h2>
                        <p className="text-slate-400 text-center font-mono italic text-sm">{T.educational_path_desc || '"Structured milestones & scenarios"'}</p>
                    </button>
                </div>
                {saveExists && (
                    <button
                        disabled={true}
                        onClick={onContinue}
                        className="mt-12 py-4 px-10 bg-slate-800 border-2 border-cyan-500 hover:bg-cyan-900 hover:border-cyan-400 text-white font-pixel text-xl shadow-[4px_4px_0_rgba(34,211,238,0.5)] active:translate-y-1 active:shadow-none transition-all uppercase opacity-50 cursor-not-allowed relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">COMING SOON</div>
                        {T.continue_session || 'Continue Saved Game'}
                    </button>
                )}
            </div>
        ) : setupPhase === 'proficiency' ? (
            <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-in p-6 mt-10 relative">
                
                {/* Internal Back Button */}
                <button
                    onClick={() => setSetupPhase('path')}
                    className="absolute top-6 left-6 px-6 py-3 bg-slate-700 border-4 border-slate-500 hover:bg-slate-600 hover:border-slate-400 text-slate-300 font-pixel text-xl shadow-[6px_6px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase flex items-center gap-3 z-20"
                >
                    <span className="text-3xl leading-none mt-[-4px]">←</span> {T.change_path || 'Change Path'}
                </button>

                <div className="mb-12 text-center">
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-retro text-cyan-400 glow-text mb-3 tracking-wider">
                        {T.choose_path || 'CHOOSE YOUR SKILL'}
                    </h2>
                    <p className="text-sm text-slate-400 font-pixel">
                        {T.select_proficiency || 'Select your language proficiency level'}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <button 
                        onClick={() => { setProfile({...profile, cefrLevel: 'A1'}); setSetupPhase('settings'); }}
                        className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-none border-2 border-cyan-500 shadow-[8px_8px_0px_0px_rgba(34,211,238,1)] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(34,211,238,1)] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] transition-all group"
                    >
                        <div className="mb-6 grayscale group-hover:grayscale-0 transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                            <PenkoIcon type="beginner" size={80} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-wider group-hover:text-cyan-400 transition-colors">{T.beginner || 'Beginner'}</h2>
                        <p className="text-slate-400 text-center font-mono">{T.beginner_desc || 'Start from the basics and learn slowly.'}</p>
                    </button>
                    <button 
                        onClick={() => { setProfile({...profile, cefrLevel: 'C1'}); setSetupPhase('settings'); }}
                        className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-none border-2 border-amber-500 shadow-[8px_8px_0px_0px_rgba(245,158,11,1)] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(245,158,11,1)] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] transition-all group"
                    >
                        <div className="mb-6 grayscale group-hover:grayscale-0 transition-all drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                            <PenkoIcon type="advanced" size={80} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase tracking-wider group-hover:text-amber-400 transition-colors">{T.advanced || 'Advanced'}</h2>
                        <p className="text-slate-400 text-center font-mono">{T.advanced_desc || 'Jump into complex scenarios and test your fluency.'}</p>
                    </button>
                </div>
                {saveExists && (
                    <button
                        disabled={true}
                        onClick={onContinue}
                        className="mt-12 py-4 px-10 bg-slate-800 border-2 border-cyan-500 hover:bg-cyan-900 hover:border-cyan-400 text-white font-pixel text-xl shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none transition-all uppercase opacity-50 cursor-not-allowed relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">COMING SOON</div>
                        {T.continue_session || 'Continue Saved Game'}
                    </button>
                )}
            </div>
        ) : setupPhase === 'educational_scenarios' ? (
            <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-in p-6 mt-10 relative">
                {/* Internal Back Button */}
                <button
                    onClick={() => setSetupPhase('proficiency')}
                    className="absolute top-6 left-6 px-6 py-3 bg-slate-700 border-4 border-slate-500 hover:bg-slate-600 hover:border-slate-400 text-slate-300 font-pixel text-xl shadow-[6px_6px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase flex items-center gap-3 z-20"
                >
                    <span className="text-3xl leading-none mt-[-4px]">←</span> BACK
                </button>

                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-retro tracking-tighter drop-shadow-lg glow-text uppercase">
                        Select Scenario
                    </h1>
                    <p className="text-xl md:text-2xl text-cyan-400 font-pixel uppercase tracking-widest animate-pulse text-center max-w-2xl">
                        {framework.frameworkName} - {selectedLevel?.name}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {selectedLevel?.scenarios.map((scenario: Scenario) => (
                        <button
                            key={scenario.id}
                            onClick={() => {
                                setSelectedScenario(scenario);
                                setSetupPhase('settings');
                            }}
                            className="flex flex-col items-start p-6 bg-slate-900 border-2 border-cyan-500 shadow-[6px_6px_0px_0px_rgba(34,211,238,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(34,211,238,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(34,211,238,1)] transition-all group text-left h-full"
                        >
                            <h3 className="text-2xl font-bold text-cyan-400 mb-2 font-mono uppercase group-hover:text-white transition-colors">{scenario.title}</h3>
                            <p className="text-slate-400 font-mono text-sm mb-4 leading-relaxed flex-grow">{scenario.description}</p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-800 w-full">
                                <div className="text-[10px] uppercase text-cyan-600 mb-2 tracking-widest font-pixel">Objectives:</div>
                                <div className="flex flex-wrap gap-2">
                                    {scenario.objectives.map((obj, i) => (
                                        <span key={i} className="text-[10px] px-2 py-1 bg-cyan-950 text-cyan-400 border border-cyan-900 font-pixel uppercase">
                                            {obj}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        ) : (
        <div className={`bg-slate-800 border-4 ${genreEnv.borderColor} rounded-sm p-6 sm:p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)] ${genreEnv.glowColor} w-full relative my-4 transition-all duration-700`}>

        {/* Back Button */}
        <button
            onClick={onBack}
            className="absolute top-6 left-6 px-6 py-3 bg-slate-700 border-4 border-slate-500 hover:bg-slate-600 hover:border-slate-400 text-slate-300 font-pixel text-xl shadow-[6px_6px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase flex items-center gap-3 z-20"
        >
            <span className="text-3xl leading-none mt-[-4px]">←</span> BACK
        </button>

        {/* Header with Logo */}
        <div className="mb-6 text-center mt-8 sm:mt-0">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse"></div>
                <div className="relative bg-slate-900 border-4 border-cyan-500 p-3 shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
                  <PenkoLogo size={100} animated={true} />
                </div>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-retro text-cyan-400 glow-text mb-3 tracking-wider">
              {T.start_adventure}
            </h2>
            <p className="text-xl text-slate-400 font-pixel">
                {T.configure_quest}
            </p>
        </div>

        <div className="space-y-8">
            {/* MODE SELECTION GRID */}
            <div>
                <label className="block text-2xl font-bold tracking-wider text-cyan-300 uppercase mb-4 font-pixel border-b-2 border-slate-600 pb-3">
                    {T.game_mode}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                    {/* 1. BROWSER AI MODE (Offline) */}
                     <button
                        onClick={() => { setMode('local'); setProfile(p => ({...p, ollamaModel: 'tiny'})); }}
                        className={`p-6 text-left transition-all relative shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none overflow-hidden
                            ${mode === 'local'
                                ? 'bg-cyan-500 border-4 border-cyan-300 text-slate-900'
                                : 'bg-slate-700 border-4 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-3 py-1 font-bold font-retro">RECOMMENDED</div>
                        <div className="mb-4 flex justify-center">
                            <BrowserAIModeIcon size={64} />
                        </div>
                        <h3 className="font-pixel text-xl mb-2 uppercase text-center">Browser AI</h3>
                        <p className="text-base opacity-80 font-pixel text-center">Local Models</p>
                    </button>

                    {/* 2. CLOUD MODE (Multi-Provider) */}
                    <button
                        onClick={() => setMode('cloud')}
                        className={`p-6 text-left transition-all relative shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none
                            ${mode === 'cloud'
                                ? 'bg-amber-500 border-4 border-amber-300 text-slate-900'
                                : 'bg-slate-700 border-4 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        <div className="mb-4 flex justify-center">
                            <CloudModeIcon size={64} />
                        </div>
                        <h3 className="font-pixel text-xl mb-2 uppercase text-center">Cloud AI</h3>
                        <p className="text-base opacity-80 font-pixel text-center">Gemini API</p>
                    </button>

                    {/* 3. NATIVE PC MODE (OLLAMA) */}
                    <button
                        onClick={() => setMode('ollama')}
                        disabled={true}
                        className={`p-6 text-left transition-all relative shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none overflow-hidden opacity-50 cursor-not-allowed
                            ${mode === 'ollama'
                                ? 'bg-emerald-600 border-4 border-emerald-400 text-white'
                                : 'bg-slate-700 border-4 border-slate-600 text-slate-300'
                            }`}
                    >
                        <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">COMING SOON</div>
                        <div className="mb-4 flex justify-center text-5xl">
                            🖥️
                        </div>
                        <h3 className="font-pixel text-xl mb-2 uppercase text-center">Native PC</h3>
                        <p className="text-base opacity-80 font-pixel text-center">Full Power Offline</p>
                    </button>

                    {/* 4. OLLAMA - HIDDEN: Coming Soon (Untested) */}
                    {/* <button
                        onClick={() => setMode('ollama')}
                        className={`p-4 rounded-lg border-2 text-left transition-all relative overflow-hidden ${mode === 'ollama' ? 'bg-gray-700 border-purple-500 shadow-lg ring-1 ring-purple-500/50' : 'bg-gray-800 border-gray-700 hover:bg-gray-750'}`}
                    >
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] px-2 py-1 rounded-bl font-bold">LOCAL</div>
                        <div className="text-2xl mb-2">🖥</div>
                        <h3 className="font-bold text-white mb-1">{t('common:mode_ollama')}</h3>
                        <p className="text-xs text-gray-400">{t('common:mode_ollama_desc')}</p>
                    </button> */}

                    {/* 5. OPENAI / LM STUDIO - HIDDEN: Coming Soon (Untested) */}
                    {/* <button
                        onClick={() => setMode('openai')}
                        className={`p-4 rounded-lg border-2 text-left transition-all relative overflow-hidden ${mode === 'openai' ? 'bg-gray-700 border-orange-500 shadow-lg ring-1 ring-orange-500/50' : 'bg-gray-800 border-gray-700 hover:bg-gray-750'}`}
                    >
                        <div className="absolute top-0 right-0 bg-orange-600 text-white text-[9px] px-2 py-1 rounded-bl font-bold">LOCAL</div>
                        <div className="text-2xl mb-2">🔌</div>
                        <h3 className="font-bold text-white mb-1">{t('common:mode_openai')}</h3>
                        <p className="text-xs text-gray-400">{t('common:mode_openai_desc')}</p>
                    </button> */}

                </div>
            </div>
          
          {/* DYNAMIC SETTINGS BASED ON MODE */}
          {mode === 'local' && (
            <>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 animate-fade-in">
                 <h3 className="text-3xl font-retro text-cyan-300 mb-4">{T.local_model_title || "Local AI Model (Qwen3.5 0.8B)"}</h3>
                 <p className="text-xl text-slate-400 font-pixel mb-8">
                    {T.local_model_desc || "Run the AI entirely in your browser. No internet required after download!"}
                 </p>
                 
                 {isQwenCached ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-green-900/30 border border-green-500/50 p-6 rounded text-green-400 font-pixel text-xl">
                           {T.local_model_ready || "✅ Model is downloaded and ready to play!"}
                        </div>
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 bg-red-900/30 hover:bg-red-800/50 border border-red-500/50 text-red-400 font-pixel text-sm uppercase transition-colors"
                        >
                            {T.remove_ai_btn || "Remove AI from Cache"}
                        </button>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center text-xl font-pixel text-slate-300">
                          <span>{T.local_model_storage || "Required Storage: ~850 MB"}</span>
                       </div>
                       
                       {isDownloading ? (
                          <div className="space-y-4">
                             <div className="flex justify-between text-lg font-pixel text-cyan-400">
                                <span>{downloadStatus}</span>
                                <span>
                                  {downloadTotal > 0 ? 
                                    `${Math.round(downloadLoaded / 1024 / 1024)} / ${Math.round(downloadTotal / 1024 / 1024)} MB (${downloadProgress}%)` : 
                                    `${downloadProgress}%`}
                                </span>
                             </div>
                             <div className="w-full bg-slate-900 rounded-none h-8 border-4 border-cyan-500 overflow-hidden relative shadow-[4px_4px_0_rgba(34,211,238,0.3)]">
                                <div 
                                   className="h-full transition-all duration-300 relative bg-cyan-500 bg-[length:2rem_2rem] border-r-4 border-cyan-300"
                                   style={{ 
                                      width: `${downloadProgress}%`,
                                      backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                                      animation: 'progress-stripes 1s linear infinite'
                                   }}
                                >
                                   <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <button
                             onClick={handleDownloadModel}
                             className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xl shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase"
                          >
                             {T.local_model_download || "Download Local Model"}
                          </button>
                       )}
                    </div>
                 )}
                 </div>
                 </>
                 )}          {/* Ollama and OpenAI configs hidden - Coming Soon */}
          {/* {mode === 'ollama' && <OllamaConfig profile={profile} setProfile={setProfile} T={T} />} */}
          {/* {mode === 'openai' && <OpenAIConfig profile={profile} setProfile={setProfile} T={T} />} */}
          {mode === 'cloud' && (
            <CloudConfig
              apiKey={apiKey}
              setApiKey={setApiKey}
              geminiModel={geminiModel}
              setGeminiModel={setGeminiModel}
              T={T}
            />
          )}

          {/* Target Language Selection (Family-First UI) */}
          <div>
            <label className="block text-2xl font-bold tracking-wider text-cyan-300 uppercase mb-4 font-pixel border-b-2 border-slate-600 pb-3">
                {T.i_want_to_learn}
            </label>
            
            {/* 1. Family Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {LANGUAGE_FAMILIES.map((family) => (
                    <button
                        key={family.id}
                        onClick={() => setSelectedFamily(family.id)}
                        className={`p-8 text-xl font-pixel transition-all border-4 flex flex-col items-center gap-6 shadow-[6px_6px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none
                            ${selectedFamily === family.id
                                ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_25px_rgba(34,211,238,0.4)]'
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
                            }`}
                    >
                        <PenkoIcon type={family.icon} size={64} />
                        <span className="uppercase tracking-widest text-base sm:text-lg text-center font-bold">{family.label}</span>
                    </button>
                ))}
            </div>

            {/* 2. Language Grid (Filtered by Family) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[200px] animate-fade-in" key={selectedFamily}>
              {LANGUAGE_FAMILIES.find(f => f.id === selectedFamily)?.languages.map((langName) => {
                const langValue = (Language as any)[langName.toUpperCase().replace(/ /g, '_')] || langName;
                const isNative = langValue === initialNativeLanguage;
                const isStable = isLanguageStable(langValue as Language);

                return (
                <button
                  key={langName}
                  onClick={() => !isNative && isStable && setProfile({ ...profile, targetLanguage: langValue as Language })}
                  disabled={isNative || !isStable}
                  title={isNative ? "This is your native language" : !isStable ? "Coming Soon" : ""}
                  className={`p-4 text-xl font-pixel transition-all shadow-[2px_2px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none border-4 relative overflow-hidden
                    ${isNative || !isStable
                      ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed shadow-none opacity-50'
                      : profile.targetLanguage === langValue
                        ? 'bg-amber-500 border-amber-300 text-slate-900'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span>{T['lang_' + langValue] || langName}</span>
                    {!isStable && !isNative && (
                      <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">COMING SOON</div>
                    )}
                  </div>
                </button>
              )})}
            </div>

          </div>

          {/* Theme Selection Replacement with CEFR Levels and Scenarios */}
          <div>
            <label className="block text-2xl font-bold tracking-wider text-cyan-300 uppercase mb-4 font-pixel border-b-2 border-slate-600 pb-3">
              {selectedLevel 
                ? `${ET.scenarios_available || 'SCENARIO'}: ${(() => {
                    const levelKeyMap: Record<string, string> = {
                      'A1': 'level_beginner', 'A2': 'level_elementary', 'B1': 'level_intermediate', 'B2': 'level_upper_intermediate', 'C1': 'level_advanced', 'C2': 'level_mastery',
                      'N5': 'level_beginner', 'N4': 'level_elementary', 'N3': 'level_intermediate', 'N2': 'level_upper_intermediate', 'N1': 'level_advanced',
                      'HSK 1': 'level_beginner', 'HSK 2': 'level_elementary', 'HSK 3': 'level_intermediate', 'HSK 4': 'level_upper_intermediate', 'HSK 5': 'level_advanced', 'HSK 6': 'level_mastery'
                    };
                    const key = levelKeyMap[selectedLevel.id];
                    return key ? ET[key] : selectedLevel.name;
                  })()}` 
                : (T.proficiency_level || 'LEVEL SELECTION')}
            </label>
            {!selectedLevel ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {framework.levels.map((level: any) => (
                  <button
                    key={level.id}
                    onClick={() => { setSelectedLevel(level); setProfile({ ...profile, cefrLevel: level.id }); }}
                    className="p-6 bg-slate-700 border-4 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-cyan-500 hover:text-cyan-400 font-pixel text-2xl transition-all shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none uppercase"
                  >
                    {level.id}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedLevel.scenarios.map((scenario: Scenario) => {
                    const localizedScenario = ET.scenarios[scenario.id] || scenario;
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => setSelectedScenario(scenario)}
                        className={`flex flex-col items-start p-6 border-4 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] active:translate-y-[2px] active:shadow-none h-full text-left
                          ${selectedScenario?.id === scenario.id
                            ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-cyan-500'
                          }`}
                      >
                        <div className="font-bold font-pixel text-xl mb-2 uppercase group-hover:text-cyan-400 transition-colors">{localizedScenario.title}</div>
                        <div className="text-slate-400 font-mono text-sm mb-4 leading-relaxed flex-grow">{localizedScenario.description}</div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-800 w-full">
                            <div className="text-[10px] uppercase text-cyan-600 mb-2 tracking-widest font-pixel">{ET.objectives_label || 'Objectives'}:</div>
                            <div className="flex flex-wrap gap-2">
                                {(ET.scenarios?.[scenario.id]?.objectives || localizedScenario.objectives || scenario.objectives).map((obj: string, i: number) => (
                                    <span key={i} className="text-[10px] px-2 py-1 bg-cyan-950 text-cyan-400 border border-cyan-900 font-pixel uppercase">
                                        {obj}
                                    </span>
                                ))}
                            </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => { setSelectedLevel(null); setSelectedScenario(null); }}
                  className="text-cyan-400 font-pixel text-sm hover:underline uppercase flex items-center gap-2"
                >
                  ← {ET.change_level || 'BACK TO LEVELS'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 space-y-4">
          <button
            onClick={handleStart}
            className="w-full py-4 sm:py-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-retro text-xl sm:text-3xl shadow-[6px_6px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all"
          >
            {T.start_adventure || 'START ADVENTURE'}
          </button>

          <div className="flex gap-4">
              {saveExists && (
                  <button
                        disabled={true}
                        onClick={onContinue}
                        className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xl shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase opacity-50 cursor-not-allowed relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">COMING SOON</div>
                        {T.continue_session || 'Continue'}
                    </button>
              )}

              <input type="file" ref={saveInputRef} onChange={handleImportSave} className="hidden" accept=".json" />
              <button
                onClick={() => saveInputRef.current?.click()}
                className={`py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-pixel text-xl shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase ${!saveExists ? 'w-full' : ''}`}
                title="Import saved game"
              >
                📂 Import
              </button>
          </div>

          <div className="mt-6 text-center">
             <p className="text-base text-slate-500 font-pixel opacity-60">
                System Ready
             </p>
          </div>
        </div>
        </div>
        )}
      
        {/* DELETE MODEL MODAL */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-sm animate-fade-in font-pixel">
              <div className="bg-slate-50 w-full max-w-xl max-h-[90vh] rounded-xl shadow-[8px_8px_0_rgba(0,0,0,0.5)] border-4 border-slate-800 flex flex-col overflow-hidden relative">
                
                <div className="bg-slate-800 p-4 border-b-4 border-slate-700 flex justify-between items-center sticky top-0 z-10 shrink-0">
                  <h2 className="text-2xl font-retro text-amber-400 glow-text">{T.remove_ai_title || "REMOVE LOCAL AI?"}</h2>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-400 text-white font-retro text-xl border-b-4 border-red-700 active:border-b-0 active:translate-y-1 rounded transition-all"
                  >
                    X
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-6 text-base md:text-lg leading-relaxed overflow-y-auto">
                  <div className="text-5xl mb-4 text-center">⚠️</div>
                  <p className="text-slate-800 text-center font-bold">
                      {T.remove_ai_desc || "This will permanently delete the ~850MB Qwen 3.5 model from your browser's local storage cache. You will need to download it again if you want to play Offline Mode later."}
                  </p>
                </div>

                <div className="p-4 bg-slate-200 border-t-4 border-slate-300 shrink-0 flex gap-4">
                  <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-retro text-xl py-4 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all rounded"
                  >
                      {T.cancel || "CANCEL"}
                  </button>
                  <button
                      onClick={async () => {
                          setShowDeleteConfirm(false);
                          const { CartridgeService } = await import('../../services/adventure/advanced/CartridgeService');
                          await CartridgeService.deleteModelCache('all');
                          setIsQwenCached(false);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-retro text-xl py-4 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all rounded"
                  >
                      {T.delete || "DELETE AI"}
                  </button>
                </div>
              </div>
            </div>
        )}
    
      </div>
    </>
  );
};

export default EducationalSetupScreen;
