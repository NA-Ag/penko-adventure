const fs = require('fs');

let content = fs.readFileSync('components/SetupScreen.tsx', 'utf-8');

// 1. Add state variables for Translation Engine
const stateVars = `
  const [isTranslationCached, setIsTranslationCached] = useState(true);
  const [isDownloadingTranslation, setIsDownloadingTranslation] = useState(false);
  const [translationDownloadProgress, setTranslationDownloadProgress] = useState(0);
  const [translationDownloadStatus, setTranslationDownloadStatus] = useState('');
  
  const needsTranslation = profile.targetLanguage !== profile.nativeLanguage;
`;

content = content.replace(
  "  const [setupPhase, setSetupPhase] = useState<'proficiency' | 'settings'>('proficiency');",
  "  const [setupPhase, setSetupPhase] = useState<'proficiency' | 'settings'>('proficiency');\n" + stateVars
);


// 2. Add translation checking logic in useEffect
const translationCheckEffect = `
  // Check translation model cache status
  useEffect(() => {
    if (!needsTranslation) {
        setIsTranslationCached(true);
        return;
    }
    
    const checkTranslationCache = async () => {
        const getLangCode = (lang: string) => {
            const map: Record<string, string> = {
                'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
                'Italian': 'it', 'Japanese': 'ja', 'Mandarin': 'zh', 'Russian': 'ru',
                'Portuguese': 'pt', 'Ukrainian': 'uk', 'Polish': 'pl', 'Czech': 'cs'
            };
            return map[lang] || 'en';
        };

        const srcCode = getLangCode(profile.nativeLanguage);
        const tgtCode = getLangCode(profile.targetLanguage);
        
        let cached = true;
        if (srcCode !== tgtCode) {
            const isCached = await CartridgeService.isModelCached(\`Xenova/opus-mt-\${srcCode}-\${tgtCode}\`);
            cached = isCached;
        }
        setIsTranslationCached(cached);
    };
    
    checkTranslationCache();
  }, [profile.targetLanguage, profile.nativeLanguage, needsTranslation]);
`;

content = content.replace(
  "  // Sync profile native language when initialNativeLanguage prop changes",
  translationCheckEffect + "\n  // Sync profile native language when initialNativeLanguage prop changes"
);

// 3. Add handleDownloadTranslation function
const handleDownloadTranslationFunc = `
  const handleDownloadTranslation = async () => {
      setIsDownloadingTranslation(true);
      setTranslationDownloadProgress(0);
      setTranslationDownloadStatus(T.local_trans_initializing || 'Initializing translation engine...');

      const defaultCartridge: Cartridge = {
        id: 'qwen2.5-1.5b',
        name: 'Qwen2.5 1.5B',
        modelId: BROWSER_MODEL_ID,
        tier: 'small',
        estimatedSize: 700 * 1024 * 1024
      };

      try {
          const service = new CartridgeService(profile, defaultCartridge);
          await service.initTranslation(profile.nativeLanguage, profile.targetLanguage, (prog, text) => {
              setTranslationDownloadProgress(prog);
              setTranslationDownloadStatus(text || '');
          });
          setIsTranslationCached(true);
          toast.success(T.local_trans_ready || '✅ Translation Engine is ready!', { duration: 3000 });
      } catch (e: any) {
          toast.error(\`Download failed: \${e.message}\`, { duration: 5000 });
          setIsTranslationCached(false);
      } finally {
          setIsDownloadingTranslation(false);
          setTranslationDownloadProgress(0);
          setTranslationDownloadStatus('');
      }
  };
`;

content = content.replace(
  "  const handleNativeLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {",
  handleDownloadTranslationFunc + "\n  const handleNativeLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {"
);

// 4. Update the "Start Adventure" button logic to block if translation is not cached in local mode
content = content.replace(
  "      const finalProfile = { ...profile, nativeLanguage: initialNativeLanguage };",
  `      if (mode === 'local' && needsTranslation && !isTranslationCached) {
          toast.error(T.local_trans_desc || "Translation Engine must be downloaded first for your selected languages.");
          return;
      }
      if (mode === 'local' && !isQwenCached) {
          toast.error(T.local_model_desc || "Local AI Model must be downloaded first.");
          return;
      }

      const finalProfile = { ...profile, nativeLanguage: initialNativeLanguage };`
);

// 5. Inject the Translation UI below the Qwen UI
const translationUI = `
                 {/* TRANSLATION ENGINE BOX */}
                 {needsTranslation && (
                 <div className="mt-8 pt-8 border-t border-gray-700">
                     <h3 className="text-3xl font-retro text-cyan-300 mb-4">{T.local_trans_title || "Local Translation Engine (OPUS-MT)"}</h3>
                     <p className="text-xl text-slate-400 font-pixel mb-8">
                        {T.local_trans_desc || "Required for offline translation of your actions and the game's story."}
                     </p>
                     
                     {isTranslationCached ? (
                        <div className="flex items-center gap-4 bg-green-900/30 border border-green-500/50 p-6 rounded text-green-400 font-pixel text-xl">
                           {T.local_trans_ready || "✅ Translation Engine is ready!"}
                        </div>
                     ) : (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center text-xl font-pixel text-slate-300">
                              <span>{T.local_trans_storage || "Required Storage: ~75 MB"}</span>
                           </div>
                           
                           {isDownloadingTranslation ? (
                              <div className="space-y-4">
                                 <div className="flex justify-between text-lg font-pixel text-cyan-400">
                                    <span>{translationDownloadStatus}</span>
                                    <span>{translationDownloadProgress}%</span>
                                 </div>
                                 <div className="w-full bg-slate-900 rounded-none h-8 border-4 border-cyan-500 overflow-hidden relative shadow-[4px_4px_0_rgba(34,211,238,0.3)]">
                                    <div 
                                       className="h-full transition-all duration-300 relative bg-cyan-500 bg-[length:2rem_2rem] border-r-4 border-cyan-300"
                                       style={{ 
                                          width: \`\${translationDownloadProgress}%\`,
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
                                 onClick={handleDownloadTranslation}
                                 className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-pixel text-xl shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all uppercase"
                              >
                                 {T.local_trans_download || "Download Translation Engine"}
                              </button>
                           )}
                        </div>
                     )}
                 </div>
                 )}
`;

content = content.replace(
  "              </div>\n            </>\n          )}",
  translationUI + "              </div>\n            </>\n          )}"
);


fs.writeFileSync('components/SetupScreen.tsx', content);
