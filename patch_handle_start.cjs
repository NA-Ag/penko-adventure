const fs = require('fs');
let content = fs.readFileSync('components/SetupScreen.tsx', 'utf-8');

// The issue is that handleStart is not seeing the updated state or the logic blocking it is too aggressive
// The log "Required for offline translation of your actions and the game's story." means it failed the validation check inside handleStart.
// Let's modify handleStart's validation to check exactly what it needs.

content = content.replace(
    "      if (mode === 'local' && needsTranslation && !isTranslationCached) {\n          toast.error(T.local_trans_desc || \"Translation Engine must be downloaded first for your selected languages.\");\n          return;\n      }",
    `      if (mode === 'local' && needsTranslation) {
          // Double check the cache manually just in case state hasn't synced
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
          const isActuallyCached = srcCode === tgtCode || await CartridgeService.isModelCached(\`Xenova/opus-mt-\${srcCode}-\${tgtCode}\`);
          
          if (!isActuallyCached && !isTranslationCached) {
              toast.error(T.local_trans_desc || "Translation Engine must be downloaded first for your selected languages.");
              return;
          }
      }`
);

fs.writeFileSync('components/SetupScreen.tsx', content);
