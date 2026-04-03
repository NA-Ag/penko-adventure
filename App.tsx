import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Language, UserProfile, GameMode } from './types';
import { TRANSLATIONS } from './translations';
import { loadGame, SaveData } from './services/saveSystem';
import { Cartridge } from "./types/Cartridge";
import { GameInterface } from './components/GameInterface';
import SetupScreen from './components/SetupScreen';
import { Scanlines } from './components/Scanlines';
import { Manual } from './components/Manual';
import { Scenario } from './data/educational/frameworks/types';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [gameActive, setGameActive] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('cloud');
  const [nativeLanguage, setNativeLanguage] = useState<Language>(Language.ENGLISH);
  const [educationalScenario, setEducationalScenario] = useState<Scenario | null>(null);

  // New: Custom Content Injection (Mods) and School ID
  const [customData, setCustomData] = useState<any>(null);


  // Cartridge state for Browser AI Mode
  const [selectedCartridge, setSelectedCartridge] = useState<Cartridge | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    targetLanguage: Language.SPANISH,
    nativeLanguage: Language.ENGLISH,
    theme: 'fantasy'
  });
  const [initialState, setInitialState] = useState<SaveData | null>(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  useEffect(() => {
      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
          setIsInstalled(true);
      }
      
      const handler = (e: any) => {
          e.preventDefault();
          setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
      if (deferredPrompt) {
          // Chrome/Edge Native Prompt
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to the install prompt: ${outcome}`);
          setDeferredPrompt(null);
      } else {
          // Firefox/Safari Fallback
          setShowInstallHelp(true);
      }
  };

  const handleOpenManual = () => {
      setShowManual(true);
  };

  const handleStartGame = (profile: UserProfile, mode: GameMode, key: string | null, loadedCustomData?: any, cartridge?: Cartridge, scenario?: Scenario) => {
    setUserProfile(profile);
    setApiKey(key);
    setGameMode(mode);
    setInitialState(null);
    setCustomData(loadedCustomData || null);
    setSelectedCartridge(cartridge || null);
    setEducationalScenario(scenario || null);
    
    if (key) {
        sessionStorage.setItem('penko_api_key', key);
    } else {
        sessionStorage.removeItem('penko_api_key');
    }

    setNativeLanguage(profile.nativeLanguage);
    setGameActive(true);
  };

  const handleContinueGame = () => {
      const saved = loadGame();
      if (saved) {
          setUserProfile(saved.profile);
          setNativeLanguage(saved.profile.nativeLanguage);
          setInitialState(saved);
          // Restore Mods or School ID if present in save
          if (saved.customData) {
              setCustomData(saved.customData);
          }
          if (saved.educationalScenario) {
              setEducationalScenario(saved.educationalScenario);
          }
          setGameActive(true);
      }
  };

  const handleExitGame = () => {
    setGameActive(false);
    setInitialState(null);
    setCustomData(null);
    setEducationalScenario(null);
  };
  
  const T = TRANSLATIONS[nativeLanguage] || TRANSLATIONS[Language.ENGLISH];

  return (
    <ErrorBoundary>
      <div className="h-[100dvh] text-gray-100 flex flex-col overflow-hidden font-sans" style={{ backgroundColor: 'var(--retro-bg)' }}>
        <Scanlines />
        <Toaster
            position="top-center"
            toastOptions={{
                style: {
                    background: '#1e293b',
                    color: '#22d3ee',
                    fontFamily: 'VT323, monospace',
                    fontSize: '14px',
                    border: '1px solid #22d3ee',
                },
            }}
        />
        <header className="bg-slate-900 border-b-2 border-cyan-500 p-3 flex justify-between items-center z-20 shadow-lg shadow-cyan-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:block hidden">
              <img
                src="/penguin-logo.svg"
                alt="Penko Logo"
                width={48}
                height={48}
                className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-retro tracking-widest text-cyan-400 glow-text">PENKO ADVENTURE</h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
              {/* Native Language Selector (Moved from SetupScreen) */}
              <div className="relative flex items-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline text-cyan-400 font-pixel text-sm uppercase">{T.i_speak || 'I SPEAK'}:</span>
                  <div className="relative">
                      <button
                          onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                          className="text-xs sm:text-lg text-cyan-200 bg-slate-900 border-2 border-cyan-500 font-pixel px-2 sm:px-4 py-2 sm:py-3 pr-6 sm:pr-10 focus:outline-none focus:border-cyan-300 shadow-[4px_4px_0_rgba(34,211,238,0.3)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_rgba(34,211,238,0.4)] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer hover:bg-slate-800 flex items-center justify-between min-w-[140px]"
                          title={t('common:i_speak' as any)}
                      >
                          <span>{T['lang_' + nativeLanguage] || nativeLanguage}</span>
                          <span className="text-cyan-400 text-xs animate-pulse absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">▼</span>
                      </button>
                      
                      {languageDropdownOpen && (
                          <>
                              <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setLanguageDropdownOpen(false)}
                              />
                              <div className="absolute top-full mt-2 right-0 bg-slate-900 border-2 border-cyan-500 shadow-[6px_6px_0_rgba(34,211,238,0.3)] z-50 min-w-full max-h-64 overflow-y-auto w-48">
                                  {[Language.ENGLISH, Language.SPANISH, Language.FRENCH, Language.GERMAN, Language.ITALIAN, Language.JAPANESE, Language.MANDARIN, Language.RUSSIAN, Language.PORTUGUESE, Language.UKRAINIAN, Language.POLISH, Language.CZECH].map((lang) => (
                                      <button
                                          key={lang}                                          className={`w-full text-left font-pixel px-4 py-3 text-base sm:text-lg transition-colors
                                              ${nativeLanguage === lang 
                                                  ? 'bg-cyan-600 text-white' 
                                                  : 'text-cyan-200 hover:bg-cyan-900/50 hover:text-cyan-100'
                                              }`}
                                          onClick={() => {
                                              setNativeLanguage(lang);
                                              setUserProfile(prev => ({ ...prev, nativeLanguage: lang }));
                                              setLanguageDropdownOpen(false);
                                          }}
                                      >
                                          {T['lang_' + lang] || lang}
                                      </button>
                                  ))}
                              </div>
                          </>
                      )}
                  </div>
              </div>

              

              <button
                  onClick={handleOpenManual}
                  className={`${gameActive ? 'hidden md:block' : ''} text-xs sm:text-xl text-slate-900 bg-amber-500 hover:bg-amber-400 transition-all font-pixel border-2 border-amber-300 px-2 sm:px-4 py-2 sm:py-3 shadow-[4px_4px_0_rgba(245,158,11,0.3)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_rgba(245,158,11,0.4)] active:translate-y-[2px] active:shadow-none`}
                  title="Open Manual"
              >
                  ? MANUAL
              </button>

              {gameActive && (
              <button
                  onClick={handleExitGame}
                  className="text-xs sm:text-xl text-slate-900 bg-red-500 hover:bg-red-400 transition-all font-pixel border-2 border-red-300 px-2 sm:px-4 py-2 sm:py-3 shadow-[4px_4px_0_rgba(239,68,68,0.3)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_rgba(239,68,68,0.4)] active:translate-y-[2px] active:shadow-none"
              >
                  {t('common:exit')}
              </button>
              )}
          </div>
        </header>

        <main className="flex-grow relative overflow-hidden flex flex-col">
          {!gameActive ? (
            <SetupScreen
                onStart={handleStartGame}
                onContinue={handleContinueGame}
                initialNativeLanguage={nativeLanguage}
                onNativeLanguageChange={setNativeLanguage}
            />
          ) : (
            <GameInterface
                userProfile={userProfile}
                apiKey={apiKey}
                gameMode={gameMode}
                initialState={initialState}
                customData={customData}
                cartridge={selectedCartridge}
                educationalScenario={educationalScenario}
            />
          )}
        </main>

        {/* MANUAL MODAL */}
        {showManual && (
            <Manual onClose={() => setShowManual(false)} nativeLanguage={nativeLanguage} />
        )}

        {/* INSTALL HELP MODAL */}
        {showInstallHelp && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-slate-900 border-2 border-cyan-500 rounded-lg p-8 max-w-2xl w-full relative glow-box">
                    <button
                        onClick={() => setShowInstallHelp(false)}
                        className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 font-retro text-lg"
                    >
                        X
                    </button>
                    <h3 className="text-3xl font-retro text-cyan-400 mb-6 glow-text">{t('common:install_modal_title')}</h3>
                    <div className="space-y-6 text-gray-300 font-pixel">
                        <p className="text-xl">{t('common:install_browser_restriction')}</p>

                        <div className="bg-black/50 p-5 border-2 border-amber-500/50 rounded">
                            <strong className="text-amber-400 block mb-4 text-xl">🦊 Firefox Installation:</strong>
                            <div className="space-y-3 text-base">
                                <p>1. Click the <strong>hamburger menu (☰)</strong> in top-right corner</p>
                                <p>2. Look for <strong>"Install Penko - Language Adventure"</strong></p>
                                <p>3. Click <strong>Install</strong></p>
                                <p className="text-gray-400 italic mt-4 pt-4 border-t border-gray-600 text-sm">
                                    Note: If you don't see the install option, Firefox PWA support varies by version. You can still use Penko perfectly in your browser.
                                </p>
                            </div>
                        </div>

                        <div className="bg-black/50 p-5 border-2 border-cyan-500/50 rounded">
                            <strong className="text-cyan-400 block mb-4 text-xl">🧭 Safari (iOS):</strong>
                            <p className="text-base">{t('common:install_safari_hint')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowInstallHelp(false)}
                        className="w-full mt-8 bg-cyan-600 hover:bg-cyan-500 text-white py-4 font-retro text-lg transition-all border-b-4 border-cyan-800 active:border-b-0 active:translate-y-1"
                    >
                        {t('common:install_got_it')}
                    </button>
                </div>
            </div>
        )}

      </div>
    </ErrorBoundary>
  );
};

export default App;
