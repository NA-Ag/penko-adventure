import { pipeline, env } from '@huggingface/transformers';

// Specify the correct environment variables for transformers.js
env.allowLocalModels = false; // Force using the huggingface hub
env.useBrowserCache = true;   // Cache models in the browser

// Store loaded translation pipelines
// Keyed by model name e.g., 'Xenova/opus-mt-en-es'
const translators = new Map<string, any>();

self.onmessage = async (event) => {
    const { type, id, payload } = event.data;

    try {
        if (type === 'init') {
            const { directions } = payload;
            
            if (directions && Array.isArray(directions)) {
                for (const dir of directions) {
                    const modelId = `Xenova/opus-mt-${dir.src}-${dir.tgt}`;
                    
                    if (!translators.has(modelId)) {
                        // Send loading progress back to main thread
                        const progressCallback = (info: any) => {
                            self.postMessage({ type: 'progress', id, payload: info });
                        };
                        
                        const translator = await pipeline('translation', modelId, {
                            progress_callback: progressCallback,
                        });
                        
                        translators.set(modelId, translator);
                    }
                }
            }

            self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });
        } 
        
        else if (type === 'translate') {
            const { text, srcLang, tgtLang } = payload;
            
            const getLangCode = (lang: string) => {
                const map: Record<string, string> = {
                    'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
                    'Italian': 'it', 'Japanese': 'ja', 'Mandarin': 'zh', 'Russian': 'ru',
                    'Portuguese': 'pt', 'Ukrainian': 'uk', 'Polish': 'pl', 'Czech': 'cs'
                };
                return map[lang] || 'en';
            };

            const srcCode = getLangCode(srcLang);
            const tgtCode = getLangCode(tgtLang);
            
            if (srcCode === tgtCode) {
                self.postMessage({ type: 'complete', id, payload: { text } });
                return;
            }

            const modelId = `Xenova/opus-mt-${srcCode}-${tgtCode}`;
            const translator = translators.get(modelId);

            if (!translator) {
                throw new Error(`Translator model ${modelId} not loaded. Call init first.`);
            }

            // Split by sentences if the text is long, similar to MyMemory approach
            // Transformers.js OPUS-MT works best on sentence-level translation
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            let translatedText = '';

            for (const sentence of sentences) {
                if (!sentence.trim()) continue;
                
                const result = await translator(sentence.trim());
                if (result && result.length > 0) {
                    translatedText += result[0].translation_text + ' ';
                }
            }

            self.postMessage({ type: 'complete', id, payload: { text: translatedText.trim() } });
        }
    } catch (error: any) {
        console.error("[Translation Worker] Error:", error);
        self.postMessage({ type: 'error', id, payload: error.message });
    }
};
