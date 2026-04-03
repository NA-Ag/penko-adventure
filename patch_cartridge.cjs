const fs = require('fs');

let content = fs.readFileSync('services/advanced/CartridgeService.ts', 'utf-8');

// Add translationWorkerUrl import
content = content.replace(
    "import ttsWorkerUrl from '../cartridge/tts.worker?worker&url';",
    "import ttsWorkerUrl from '../cartridge/tts.worker?worker&url';\nimport translationWorkerUrl from '../cartridge/translation.worker?worker&url';"
);

// Add getTranslationWorkerUrl method
content = content.replace(
    "    protected getTtsWorkerUrl(): string {\n        return ttsWorkerUrl;\n    }",
    "    protected getTtsWorkerUrl(): string {\n        return ttsWorkerUrl;\n    }\n\n    protected getTranslationWorkerUrl(): string {\n        return translationWorkerUrl;\n    }"
);

// Add translation worker initialization tracking
content = content.replace(
    "    public currentTTSEngine: string = 'kokoro';",
    "    public currentTTSEngine: string = 'kokoro';\n    public isTranslationReady: boolean = false;"
);

// Add initTranslation method
const initTranslationBlock = `
    public async initTranslation(srcLang: Language, tgtLang: Language, onProgress?: (p: number, t: string) => void): Promise<void> {
        if (srcLang === tgtLang) return; // No translation needed
        
        try {
            await this.requestTranslation('init', { srcLang, tgtLang }, (p, text) => {
                onProgress?.(p || 0, text || 'Loading translation engine...');
            });
            this.isTranslationReady = true;
        } catch (e) {
            console.error('[CartridgeService] Failed to init translation engine:', e);
            this.isTranslationReady = false;
        }
    }
`;

content = content.replace(
    "    // --- GAME METHODS ---",
    "    // --- GAME METHODS ---\n" + initTranslationBlock
);


// Replace translateAgent to use worker first, fallback to API
const newTranslateAgentBlock = `    private async translateAgent(text: string, fromLang: string, toLang: string): Promise<string> {
        if (!text) return text;
        if (fromLang === toLang) return text;
        
        // 1. TRY LOCAL WORKER FIRST
        if (this.isTranslationReady) {
            try {
                if (DEBUG.ONNX) console.log(\`[CartridgeService] Translating locally: \${fromLang} -> \${toLang}\`);
                const result = await this.requestTranslation('translate', { text, srcLang: fromLang, tgtLang: toLang });
                if (result && result.text) {
                    return result.text;
                }
            } catch (e) {
                console.warn('[CartridgeService] Local translation failed, falling back to API:', e);
            }
        }

        // 2. FALLBACK TO MYMEMORY API
        const fromCode = this.getLangCode(fromLang);
        const toCode = this.getLangCode(toLang);
        if (fromCode === toCode) return text;

        // Split text into sentences to respect 500-char API limit and improve accuracy
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        try {
            const translatedChunks = await Promise.all(sentences.map(async (sentence) => {
                const s = sentence.trim();
                if (!s) return "";
                
                // If a single sentence is still > 500 chars (rare with our new prompt), truncate it
                const safeText = s.length > 490 ? s.substring(0, 490) + "..." : s;
                
                const url = \`https://api.mymemory.translated.net/get?q=\${encodeURIComponent(safeText)}&langpair=\${fromCode}|\${toCode}\`;
                const response = await fetch(url);
                const data = await response.json();
                
                return data?.responseData?.translatedText || safeText;
            }));

            return translatedChunks.join(" ");
        } catch (error) {
            console.error('[TranslationAgent] API Fallback Failed:', error);
            return text; // fallback to original
        }
    }`;

content = content.replace(
    /    private async translateAgent\(text: string, fromLang: string, toLang: string\): Promise<string> \{[\s\S]*?        return map\[lang\] \|\| 'en';\n    \}/,
    newTranslateAgentBlock + "\n\n    private getLangCode(lang: string): string {\n        const map: Record<string, string> = {\n            'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',\n            'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru', 'Japanese': 'ja',\n            'Mandarin': 'zh-CN', 'Korean': 'ko', 'Polish': 'pl', 'Czech': 'cs', 'Ukrainian': 'uk'\n        };\n        return map[lang] || 'en';\n    }"
);


fs.writeFileSync('services/advanced/CartridgeService.ts', content);
