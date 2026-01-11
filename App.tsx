
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Language, UserProfile, GameMode } from './types';
import SetupScreen from './components/SetupScreen';
import { GameInterface } from './components/GameInterface';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TRANSLATIONS } from './translations';
import { loadGame, SaveData } from './services/saveSystem';
import { MANUALS } from './data/manualContent';
import { CartridgeService } from './services/CartridgeService';
import { Cartridge } from './components/setup/CartridgeManager';
import { PenkoLogo } from './components/PenkoLogo';
import { Scanlines } from './components/Scanlines';
import { Manual } from './components/Manual';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [gameActive, setGameActive] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('cloud');
  const [nativeLanguage, setNativeLanguage] = useState<Language>(Language.ENGLISH);

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

      // Cleanup function - prevent memory leaks
      return () => {
          window.removeEventListener('beforeinstallprompt', handler);
          // Skip worker cleanup in development (React StrictMode causes false unmounts)
          // The worker is a shared singleton and will be cleaned up when browser tab closes
          if (!import.meta.env.DEV) {
              CartridgeService.cleanup();
          }
      };
  }, []);

  // Sync i18next with nativeLanguage state
  useEffect(() => {
    // Map Language enum to i18next language codes
    const languageMap: Record<Language, string> = {
      [Language.ENGLISH]: 'en',
      [Language.SPANISH]: 'es',
      [Language.FRENCH]: 'fr',
      [Language.GERMAN]: 'de',
      [Language.ITALIAN]: 'it',
      [Language.JAPANESE]: 'ja',
      [Language.MANDARIN]: 'zh',
      [Language.RUSSIAN]: 'ru',
      [Language.PORTUGUESE]: 'pt',
      [Language.UKRAINIAN]: 'uk',
      [Language.POLISH]: 'pl',
      [Language.CZECH]: 'cs',
    };

    const languageCode = languageMap[nativeLanguage] || 'en';
    if (i18n.language !== languageCode) {
      i18n.changeLanguage(languageCode);
    }
  }, [nativeLanguage, i18n]);

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

  const handleStartGame = (profile: UserProfile, mode: GameMode, key: string | null, loadedCustomData?: any, cartridge?: Cartridge) => {
    setUserProfile(profile);
    setApiKey(key);
    setGameMode(mode);
    setInitialState(null);
    setCustomData(loadedCustomData || null);
    setSelectedCartridge(cartridge || null);
    
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
          setGameActive(true);
      }
  };

  const handleExitGame = () => {
    setGameActive(false);
    setInitialState(null);
    setCustomData(null);
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
                width={32}
                height={32}
                className="animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-retro tracking-widest text-cyan-400 glow-text">PENKO ADVENTURE</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
              {!isInstalled && (
                  <button
                      onClick={handleInstallClick}
                      className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 transition-all font-pixel border-2 border-cyan-500 px-3 py-1 bg-slate-900 hover:bg-cyan-900/30 shadow-md shadow-cyan-500/30 hover:shadow-cyan-500/50"
                      style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}
                  >
                      ⬇ {t('common:install')}
                  </button>
              )}

              <button
                  onClick={handleOpenManual}
                  className="text-xs sm:text-sm text-amber-400 hover:text-amber-300 transition-all font-pixel border-2 border-amber-500 px-2 py-1 bg-slate-900 hover:bg-amber-900/30"
                  title="Open Manual"
                  style={{ boxShadow: '0 0 8px rgba(245, 158, 11, 0.3)' }}
              >
                  ? MANUAL
              </button>

              {gameActive && (
              <button
                  onClick={handleExitGame}
                  className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-all font-pixel border-2 border-red-500 px-2 py-1 bg-slate-900 hover:bg-red-900/30"
                  style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.3)' }}
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
