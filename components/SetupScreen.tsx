
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Language, UserProfile, GameMode, AppConfig, NarrativeGenre } from '../types';
import { TRANSLATIONS } from '../translations';
import { hasSave, importSaveFromFile } from '../services/saveSystem';
import { CartridgeService } from '../services/CartridgeService';
import { PenkoLogo } from './PenkoLogo';
import { CommunityModeIcon } from './icons/CommunityModeIcon';
import { CloudModeIcon } from './icons/CloudModeIcon';
import { BrowserAIModeIcon } from './icons/BrowserAIModeIcon';
import { GenreBackground } from './GenreBackground';

// Import Sub-components
import { CloudConfig } from './setup/CloudConfig';
import { CartridgeManager, Cartridge } from './setup/CartridgeManager';

interface SetupScreenProps {
  onStart: (profile: UserProfile, mode: GameMode, apiKey: string | null, customData?: any, cartridge?: Cartridge) => void;
  onContinue: () => void;
  initialNativeLanguage: Language;
  onNativeLanguageChange: (lang: Language) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onContinue, initialNativeLanguage, onNativeLanguageChange }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile>({
    targetLanguage: Language.SPANISH,
    nativeLanguage: initialNativeLanguage,
    theme: 'fantasy'
  });

  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState<GameMode>('offline');
  const [saveExists, setSaveExists] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [cloudProvider, setCloudProvider] = useState<'groq' | 'gemini' | 'openrouter' | 'deepseek'>('groq');

  // Model Cache Status
  const [isNanoCached, setIsNanoCached] = useState(false);
  const [isQwenCached, setIsQwenCached] = useState(false);

  // Local backend selection (browser/ollama/lmstudio)
  const [localBackend, setLocalBackend] = useState<'browser' | 'ollama' | 'lmstudio'>('browser');

  // Cartridge system
  const [useCartridgeManager, setUseCartridgeManager] = useState(true); // Toggle between old and new UI
  const [selectedCartridge, setSelectedCartridge] = useState<Cartridge | null>(null);

  // Detection results for localhost AI servers
  const [ollamaDetected, setOllamaDetected] = useState(false);
  const [lmStudioDetected, setLmStudioDetected] = useState(false);

  const [customData, setCustomData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveInputRef = useRef<HTMLInputElement>(null);

  const T = TRANSLATIONS[profile.nativeLanguage] || TRANSLATIONS[Language.ENGLISH];

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
    const storedProvider = sessionStorage.getItem('penko_cloud_provider');
    if (storedKey) {
        setApiKey(storedKey);
        setMode('cloud');
    }
    if (storedProvider) {
        setCloudProvider(storedProvider as 'groq' | 'gemini' | 'openrouter' | 'deepseek');
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
    CartridgeService.isModelCached('lamini').then(setIsNanoCached);
    CartridgeService.isModelCached('qwen').then(setIsQwenCached);

    // Detect localhost AI servers (non-blocking)
    detectOllama();
    detectLMStudio();

  }, []);

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

      // Validate that a cartridge is selected for Browser AI
      if (mode === 'local') {
          if (!selectedCartridge) {
            toast.error("Please install a cartridge first!", { duration: 4000 });
            return;
          }
      }

      // Prepare payload
      let payload: any = customData;

      // For Community Mode (offline), auto-load content pack based on selected genre
      if (mode === 'offline' && !customData) {
        const genreToPackMap: Record<string, string> = {
          'fantasy': 'penko-fantasy-quest',
          'scifi': 'penko-scifi-colony',
          'horror': 'penko-horror-mansion',
          'mystery': 'penko-mystery-detective',
          'western': 'penko-western-outlaw',
          'cyberpunk': 'penko-cyberpunk-heist'
        };

        const packFileName = genreToPackMap[profile.theme || 'fantasy'];
        const packPath = `/content-packs/official/${packFileName}.json`;

        try {
          console.log(`[SetupScreen] Loading content pack for genre: ${profile.theme} → ${packFileName}`);
          const response = await fetch(packPath);

          if (!response.ok) {
            throw new Error(`Failed to load content pack: ${response.statusText}`);
          }

          const contentPack = await response.json();
          console.log(`[SetupScreen] ✅ Loaded content pack:`, contentPack.metadata.title);
          payload = contentPack;
          toast.success(`Loading ${profile.theme} adventure...`, { duration: 2000 });
        } catch (error) {
          console.error('[SetupScreen] Failed to load content pack:', error);
          toast.error(`Failed to load ${profile.theme} adventure. Please try again.`, { duration: 4000 });
          return;
        }
      }

      // Store API key and provider in sessionStorage for cloud mode
      if (mode === 'cloud') {
        sessionStorage.setItem('penko_api_key', apiKey);
        sessionStorage.setItem('penko_cloud_provider', cloudProvider);
      }

      // Pass cartridge for Browser AI Mode
      onStart(profile, mode, mode === 'cloud' ? apiKey : null, payload, mode === 'local' ? selectedCartridge : undefined);
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

  type ThemeType = 'fantasy' | 'scifi' | 'mystery' | 'horror' | 'western' | 'cyberpunk';

  const themes: { id: ThemeType, label: string, color: string, activeStyles: string }[] = [
      { id: 'fantasy', label: t('common:fantasy'), color: 'purple', activeStyles: 'bg-purple-600 border-purple-400 text-white' },
      { id: 'scifi', label: t('common:scifi'), color: 'blue', activeStyles: 'bg-blue-600 border-blue-400 text-white' },
      { id: 'mystery', label: t('common:mystery'), color: 'slate', activeStyles: 'bg-slate-600 border-slate-400 text-white' },
      { id: 'horror', label: t('common:horror'), color: 'red', activeStyles: 'bg-red-700 border-red-500 text-white' },
      { id: 'western', label: t('common:western'), color: 'orange', activeStyles: 'bg-orange-600 border-orange-400 text-white' },
      { id: 'cyberpunk', label: t('common:cyberpunk'), color: 'pink', activeStyles: 'bg-pink-600 border-pink-400 text-white' },
  ];

  // Handle genre selection
  const handleThemeChange = (themeId: string) => {
    setProfile({...profile, theme: themeId as NarrativeGenre});
  };

  // Environmental effects based on genre
  const getGenreEnvironment = (genre: string) => {
    const effects = {
      fantasy: {
        bgGradient: 'from-purple-950/30 via-transparent to-purple-950/30',
        borderColor: 'border-purple-500',
        glowColor: 'shadow-purple-500/20',
      },
      scifi: {
        bgGradient: 'from-blue-950/30 via-transparent to-blue-950/30',
        borderColor: 'border-blue-500',
        glowColor: 'shadow-blue-500/20',
      },
      mystery: {
        bgGradient: 'from-slate-950/40 via-transparent to-slate-950/40',
        borderColor: 'border-slate-500',
        glowColor: 'shadow-slate-500/20',
      },
      horror: {
        bgGradient: 'from-red-950/40 via-transparent to-red-950/40',
        borderColor: 'border-red-600',
        glowColor: 'shadow-red-600/30',
      },
      western: {
        bgGradient: 'from-orange-950/30 via-transparent to-orange-950/30',
        borderColor: 'border-orange-600',
        glowColor: 'shadow-orange-500/20',
      },
      cyberpunk: {
        bgGradient: 'from-pink-950/30 via-transparent to-pink-950/30',
        borderColor: 'border-pink-500',
        glowColor: 'shadow-pink-500/30',
      },
    };
    return effects[genre as keyof typeof effects] || effects.fantasy;
  };

  const genreEnv = getGenreEnvironment(profile.theme || 'fantasy');

  // --- STANDARD UI ---
  return (
    <>
      {/* Animated genre background */}
      <GenreBackground genre={profile.theme || 'fantasy'} />

      <div className={`flex flex-col items-center min-h-full py-8 px-4 max-w-5xl mx-auto w-full animate-fade-in overflow-y-auto bg-gradient-to-b ${genreEnv.bgGradient} transition-all duration-700 relative z-10`}>

        <div className={`bg-slate-800 border-4 ${genreEnv.borderColor} rounded-sm p-6 sm:p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)] ${genreEnv.glowColor} w-full relative my-4 transition-all duration-700`}>

        {/* Header with Logo */}
        <div className="mb-6 text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse"></div>
                <div className="relative bg-slate-900 border-4 border-cyan-500 p-3 shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
                  <PenkoLogo size={80} animated={true} />
                </div>
              </div>
            </div>
            <h2 className="text-3xl sm:text-5xl font-retro text-cyan-400 glow-text mb-3 tracking-wider">
              {T.start_adventure}
            </h2>
            <p className="text-sm text-slate-400 font-pixel">
                {T.configure_quest}
            </p>
        </div>

        {/* Native Language Selector */}
        <div className="mb-6">
            <label className="block text-sm font-bold tracking-wider text-cyan-300 uppercase mb-2 font-pixel">
                {T.i_speak}
            </label>
            <div className="relative">
                <select
                    value={profile.nativeLanguage}
                    onChange={handleNativeLanguageChange}
                    className="w-full bg-slate-900 border-2 border-cyan-500 text-cyan-200 p-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-300 appearance-none font-pixel"
                >
                    {(Object.values(Language) as Language[]).map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-cyan-500 text-xl">
                    ▼
                </div>
            </div>
        </div>

        <div className="space-y-6">
            {/* MODE SELECTION GRID */}
            <div>
                <label className="block text-sm font-bold tracking-wider text-cyan-300 uppercase mb-3 font-pixel border-b-2 border-slate-600 pb-2">
                    {T.game_mode}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {/* 1. COMMUNITY MODE */}
                    <button
                        onClick={() => setMode('offline')}
                        className={`p-4 text-left transition-all relative shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none overflow-hidden
                            ${mode === 'offline'
                                ? 'bg-green-600 border-4 border-green-400 text-white'
                                : 'bg-slate-700 border-4 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[9px] px-2 py-1 font-bold font-retro">EXPERIMENTAL</div>
                        <div className="mb-2 flex justify-center">
                            <CommunityModeIcon size={48} />
                        </div>
                        <h3 className="font-pixel text-sm mb-1 uppercase">Community</h3>
                        <p className="text-xs opacity-80 font-pixel">Offline Stories</p>
                    </button>

                    {/* 2. CLOUD MODE (Multi-Provider) */}
                    <button
                        onClick={() => setMode('cloud')}
                        className={`p-4 text-left transition-all relative shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none
                            ${mode === 'cloud'
                                ? 'bg-amber-500 border-4 border-amber-300 text-slate-900'
                                : 'bg-slate-700 border-4 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        <div className="mb-2 flex justify-center">
                            <CloudModeIcon size={48} />
                        </div>
                        <h3 className="font-pixel text-sm mb-1 uppercase">Cloud AI</h3>
                        <p className="text-xs opacity-80 font-pixel">6 Providers</p>
                    </button>

                     {/* 3. BROWSER AI MODE (Offline) */}
                     <button
                        onClick={() => { setMode('local'); setProfile(p => ({...p, ollamaModel: 'tiny'})); }}
                        className={`p-4 text-left transition-all relative shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none overflow-hidden
                            ${mode === 'local'
                                ? 'bg-cyan-500 border-4 border-cyan-300 text-slate-900'
                                : 'bg-slate-700 border-4 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[9px] px-2 py-1 font-bold font-retro">EXPERIMENTAL</div>
                        <div className="mb-2 flex justify-center">
                            <BrowserAIModeIcon size={48} />
                        </div>
                        <h3 className="font-pixel text-sm mb-1 uppercase">Browser AI</h3>
                        <p className="text-xs opacity-80 font-pixel">Local Models</p>
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
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 animate-fade-in">
                <CartridgeManager
                  profile={profile}
                  setProfile={setProfile}
                  onCartridgeReady={(cartridge) => {
                    setSelectedCartridge(cartridge);
                    toast.success(t('common:cartridge_selected'));
                  }}
                />
              </div>
            </>
          )}
          {/* Ollama and OpenAI configs hidden - Coming Soon */}
          {/* {mode === 'ollama' && <OllamaConfig profile={profile} setProfile={setProfile} T={T} />} */}
          {/* {mode === 'openai' && <OpenAIConfig profile={profile} setProfile={setProfile} T={T} />} */}
          {mode === 'cloud' && (
            <CloudConfig
              apiKey={apiKey}
              setApiKey={setApiKey}
              cloudProvider={cloudProvider}
              setCloudProvider={setCloudProvider}
              T={T}
            />
          )}

          {/* Target Language Selection */}
          <div>
            <label className="block text-sm font-bold tracking-wider text-cyan-300 uppercase mb-3 font-pixel border-b-2 border-slate-600 pb-2">
                {T.i_want_to_learn}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {(Object.values(Language) as Language[]).filter(l => l !== profile.nativeLanguage).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setProfile({ ...profile, targetLanguage: lang })}
                  className={`p-3 text-sm font-pixel transition-all shadow-[2px_2px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none
                    ${profile.targetLanguage === lang
                      ? 'bg-amber-500 border-2 border-amber-300 text-slate-900'
                      : 'bg-slate-700 border-2 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {T['lang_' + lang] || lang}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
             <label className="block text-sm font-bold tracking-wider text-cyan-300 uppercase mb-3 font-pixel border-b-2 border-slate-600 pb-2">
                {T.narrative_genre}
             </label>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`p-4 capitalize font-pixel text-lg transition-all duration-300 shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none border-4
                            ${profile.theme === theme.id
                                ? theme.activeStyles
                                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {theme.label}
                    </button>
                ))}
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleStart}
            className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-retro text-xl shadow-[6px_6px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all"
          >
            START ADVENTURE
          </button>

          <div className="flex gap-3">
              {saveExists && (
                  <button
                    onClick={onContinue}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-sm shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase"
                  >
                    Continue
                  </button>
              )}

              <input type="file" ref={saveInputRef} onChange={handleImportSave} className="hidden" accept=".json" />
              <button
                onClick={() => saveInputRef.current?.click()}
                className={`py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-pixel text-sm shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase ${!saveExists ? 'w-full' : ''}`}
                title="Import saved game"
              >
                📂 Import
              </button>
          </div>

          <div className="mt-4 text-center">
             <p className="text-xs text-slate-500 font-pixel opacity-60">
                System Ready
             </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SetupScreen;
