/**
 * Cartridge Worker - Native Multilingual Generation
 *
 * Supports truly open-source models: Qwen 2.5, IBM Granite 4.0
 * No translation needed - models generate natively in target language!
 *
 * Note: Gemma removed due to licensing restrictions (requires Google ToS agreement)
 */

import { pipeline, env } from '@huggingface/transformers';
import { DEBUG } from '../../config';
import { Language } from '../../types';

// FIREFOX FIX: Intercept fetch to disable Range requests (causes 139 separate buffers in WASM = 26GB leak)
// Store original fetch
const originalFetch = self.fetch.bind(self);
const modelCache = new Map<string, ArrayBuffer>();

// DISABLED fetch interception to test if Range requests are causing memory spike
// self.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
//     const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
//
//     // Only intercept .onnx file requests
//     if (url.includes('.onnx')) {
//         if (DEBUG.ONNX) console.log('[CartridgeWorker] Intercepting ONNX fetch:', url);
//
//         // Check if we have it cached in memory (unlikely after removing caching)
//         if (modelCache.has(url)) {
//             if (DEBUG.ONNX) console.log('[CartridgeWorker] Serving from worker cache');
//             return new Response(modelCache.get(url));
//         }
//
//         // Download entire file without Range requests, but DO NOT cache the ArrayBuffer
//         // This prevents duplication of memory (600MB arrayBuffer + library's copy)
//         if (DEBUG.ONNX) console.log('[CartridgeWorker] Downloading full model file (no cache)...');
//         const response = await originalFetch(url, { ...init, headers: {} }); // Remove Range headers
//         // Return the response directly; library will read the stream.
//         // We intentionally skip caching to reduce RAM spike.
//         return response;
//     }
//
//     // Pass through all other requests
//     return originalFetch(input, init);
// };

// Restore original fetch
self.fetch = originalFetch;

// Configure Transformers.js to use browser's native cache
env.allowLocalModels = false;   // Load from HuggingFace URLs
env.allowRemoteModels = true;   // Enable remote model loading
env.useBrowserCache = true;     // Use browser HTTP cache for metadata files

// FIREFOX PERFORMANCE: Disable WASM SIMD and limit memory allocation
// Firefox's WASM allocator can over-allocate memory (26GB instead of 600MB!)
env.backends = {
    onnx: {
        wasm: {
            numThreads: 1,  // Will be overridden by pipeline config
            simd: false,    // Disable SIMD for Firefox stability
            proxy: false,   // Disable proxy workers (reduces memory copies)
            // Limit WASM memory to prevent Firefox over-allocation
            // Values in MB (1MB = 1024*1024 bytes)
            // @ts-ignore
            memory: {
                initial: 512,
                maximum: 8192
            }
        }
    }
};

/**
 * Get optimal WASM threads based on browser and model size
 * Critical for Firefox stability with large models
 */
function getOptimalWASMThreads(modelId: string): number {
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes('firefox');

    // Estimate model size from ID
    let modelSizeGB = 0.7;
    if (modelId.includes('350m') || modelId.includes('granite')) modelSizeGB = 0.7;
    else if (modelId.includes('0.5B') || modelId.includes('500m')) modelSizeGB = 0.6;
    else if (modelId.includes('1.5B')) modelSizeGB = 1.8;
    else if (modelId.includes('1B')) modelSizeGB = 1.2;

    // FIREFOX AGGRESSIVE OPTIMIZATION: Use single thread for ALL models
    // Firefox struggles with WASM threading during initial compilation
    if (isFirefox) {
        if (DEBUG.ONNX) console.log(`[CartridgeWorker] Firefox detected - using single thread for stability`);
        return 1;
    }

    // Chrome/Edge can handle more threads
    const threads = Math.min(4, Math.floor(hardwareConcurrency * 0.5));
    if (DEBUG.ONNX) console.log(`[CartridgeWorker] Using ${threads} threads for ${modelSizeGB}GB model`);
    return threads;
}

// System prompts in multiple languages
// Qwen and Granite understand all of these natively!
const MULTILINGUAL_PROMPTS: Record<string, string> = {
    'en': `You are a text adventure game master. Generate engaging narratives in English.

Output JSON format:
{
  "narrative": "Your story text here",
  "biome": "forest",
  "features": ["tree", "path"],
  "entities": ["wolf"],
  "time": "day",
  "options": ["Go north", "Search area", "Rest"]
}`,

    'es': `Eres un maestro de juegos de aventuras de texto. Genera narrativas cautivadoras en español.

Formato de salida JSON:
{
  "narrative": "Tu texto de historia aquí",
  "biome": "bosque",
  "features": ["árbol", "camino"],
  "entities": ["lobo"],
  "time": "día",
  "options": ["Ir al norte", "Buscar en el área", "Descansar"]
}`,

    'fr': `Vous êtes un maître de jeu d'aventure textuelle. Générez des récits captivants en français.

Format de sortie JSON:
{
  "narrative": "Votre texte d'histoire ici",
  "biome": "forêt",
  "features": ["arbre", "chemin"],
  "entities": ["loup"],
  "time": "jour",
  "options": ["Aller au nord", "Chercher dans la zone", "Se reposer"]
}`,

    'de': `Du bist ein Spielleiter für Textabenteuer. Generiere fesselnde Erzählungen auf Deutsch.

JSON-Ausgabeformat:
{
  "narrative": "Dein Geschichtentext hier",
  "biome": "wald",
  "features": ["baum", "pfad"],
  "entities": ["wolf"],
  "time": "tag",
  "options": ["Nach Norden gehen", "Gebiet durchsuchen", "Rasten"]
}`,

    'it': `Sei un game master di avventure testuali. Genera narrazioni coinvolgenti in italiano.

Formato di output JSON:
{
  "narrative": "Il tuo testo della storia qui",
  "biome": "foresta",
  "features": ["albero", "sentiero"],
  "entities": ["lupo"],
  "time": "giorno",
  "options": ["Vai a nord", "Cerca nell'area", "Riposa"]
}`,

    'pt': `Você é um mestre de jogos de aventura de texto. Gere narrativas envolventes em português.

Formato de saída JSON:
{
  "narrative": "Seu texto de história aqui",
  "biome": "floresta",
  "features": ["árvore", "caminho"],
  "entities": ["lobo"],
  "time": "dia",
  "options": ["Ir para o norte", "Procurar na área", "Descansar"]
}`,

    'ja': `あなたはテキストアドベンチャーゲームのマスターです。日本語で魅力的な物語を生成してください。

JSON出力形式:
{
  "narrative": "ここに物語のテキスト",
  "biome": "森",
  "features": ["木", "道"],
  "entities": ["狼"],
  "time": "昼",
  "options": ["北へ行く", "エリアを探す", "休憩する"]
}`,

    'zh': `你是一个文字冒险游戏主持人。用中文生成引人入胜的叙述。

JSON输出格式:
{
  "narrative": "你的故事文本在这里",
  "biome": "森林",
  "features": ["树", "路"],
  "entities": ["狼"],
  "time": "白天",
  "options": ["向北走", "搜索区域", "休息"]
}`,

    'ru': `Вы - мастер текстовых приключений. Создавайте увлекательные повествования на русском языке.

Формат вывода JSON:
{
  "narrative": "Ваш текст истории здесь",
  "biome": "лес",
  "features": ["дерево", "тропа"],
  "entities": ["волк"],
  "time": "день",
  "options": ["Идти на север", "Искать в области", "Отдохнуть"]
}`,

    'uk': `Ви - майстер текстових пригод. Створюйте захоплюючі оповідання українською мовою.

Формат виводу JSON:
{
  "narrative": "Ваш текст історії тут",
  "biome": "ліс",
  "features": ["дерево", "стежка"],
  "entities": ["вовк"],
  "time": "день",
  "options": ["Йти на північ", "Шукати в області", "Відпочити"]
}`,

    'pl': `Jesteś mistrzem gier przygodowych tekstowych. Generuj wciągające narracje po polsku.

Format wyjściowy JSON:
{
  "narrative": "Twój tekst historii tutaj",
  "biome": "las",
  "features": ["drzewo", "ścieżka"],
  "entities": ["wilk"],
  "time": "dzień",
  "options": ["Idź na północ", "Przeszukaj obszar", "Odpocznij"]
}`,

    'cs': `Jsi mistr textových dobrodružných her. Generuj poutavé příběhy v češtině.

Formát výstupu JSON:
{
  "narrative": "Váš text příběhu zde",
  "biome": "les",
  "features": ["strom", "cesta"],
  "entities": ["vlk"],
  "time": "den",
  "options": ["Jít na sever", "Prohledat oblast", "Odpočinout"]
}`
};

// Singleton generator instance
let currentModelId: string | null = null;
let generator: any = null;
let targetLanguage: string = 'en';

self.addEventListener('message', async (event) => {
    const { type, payload, id } = event.data;

    try {
        // --- INITIALIZE GEMMA MODEL ---
        if (type === 'init_model') {
            const { modelId, targetLanguage: lang } = payload;

            if (!modelId) {
                throw new Error('modelId is required');
            }

            // Store target language for generation
            targetLanguage = lang || 'en';

            // If already loaded, skip
            if (currentModelId === modelId && generator) {
                if (DEBUG.ONNX) console.log('[CartridgeWorker] Model already loaded');
                self.postMessage({ type: 'complete', id, payload: 'ready' });
                return;
            }

            // Dispose previous model properly
            if (generator) {
                if (DEBUG.ONNX) console.log('[CartridgeWorker] Disposing previous model...');
                await generator.dispose();
                generator = null;
                currentModelId = null;
            }
            currentModelId = modelId;

            const modelName = modelId.split('/').pop() || 'Model';

            self.postMessage({
                type: 'progress',
                id,
                payload: { progress: 0, file: `Loading ${modelName}...` }
            });

            // Get optimal WASM configuration
            const threads = getOptimalWASMThreads(modelId);

            if (DEBUG.ONNX) console.log(`[CartridgeWorker] Loading model: ${modelId}`);
            if (DEBUG.ONNX) console.log(`[CartridgeWorker] Target language: ${targetLanguage}`);
            if (DEBUG.ONNX) console.log(`[CartridgeWorker] WASM threads: ${threads}`);

            try {
                // Load directly from HuggingFace with browser HTTP cache
                // Browser cache handles Range requests efficiently (no memory bloat)
                // Model downloads on first play, then served from cache
                // Track last logged progress to reduce spam
                let lastLoggedProgress = -1;

                generator = await pipeline('text-generation', modelId, {
                    dtype: 'q4',  // Keep Q4 quantization for size
                    device: 'wasm',
                    // @ts-ignore
                    num_threads: threads,
                    progress_callback: (data: any) => {
                        const progress = data.progress !== undefined ? data.progress :
                                       (data.loaded && data.total) ? Math.round((data.loaded / data.total) * 100) : 0;
                        const file = data.file || data.name || 'Loading model...';

                        // Only log every 10% to reduce console spam
                        const shouldLog = progress % 10 === 0 && progress !== lastLoggedProgress;
                        if (shouldLog) {
                            lastLoggedProgress = progress;
                            if (DEBUG.ONNX) console.log(`[CartridgeWorker] ${progress}% - ${file}`);
                        }

                        // Always send progress to UI (for progress bar)
                        self.postMessage({
                            type: 'progress',
                            id,
                            payload: {
                                progress,
                                file,
                                loaded: data.loaded || 0,
                                total: data.total || 0
                            }
                        });
                    }
                });

                if (DEBUG.ONNX) console.log(`[CartridgeWorker] ✅ ${modelName} loaded successfully!`);
                // Clear memory cache to free up RAM (model is now in WASM memory)
                modelCache.clear();
                if (DEBUG.ONNX) console.log(`[CartridgeWorker] Cleared modelCache, freed memory`);
                self.postMessage({ type: 'complete', id, payload: 'ready' });

            } catch (error: any) {
                if (DEBUG.ERRORS) console.error('[CartridgeWorker] Model loading failed:', error);

                // Provide helpful error messages
                if (error.message?.includes('memory') || error.message?.includes('OOM')) {
                    throw new Error(`Model too large for browser. Try Low Quality tier or use desktop Chrome.`);
                } else if (error.message?.includes('download') || error.message?.includes('fetch')) {
                    throw new Error(`Download failed. Check your internet connection and try again.`);
                } else {
                    throw new Error(`Failed to load model: ${error.message}`);
                }
            }
        }

        // --- GENERATE NARRATIVE ---
        else if (type === 'generate_turn') {
            if (!generator) {
                throw new Error('Model not loaded. Call init_model first.');
            }

            const { prompt, language, history, context, playerState, theme } = payload;

            // Use target language for system prompt
            const systemPrompt = MULTILINGUAL_PROMPTS[language] || MULTILINGUAL_PROMPTS['en'];

            // Build full prompt with context
            let fullPrompt = `${systemPrompt}\n\n`;

            if (history && history.length > 0) {
                fullPrompt += `Previous events: ${history}\n\n`;
            }

            if (context) {
                fullPrompt += `Current location: ${context.biome}\n`;
                if (context.features?.length > 0) {
                    fullPrompt += `Features: ${context.features.join(', ')}\n`;
                }
                if (context.entities?.length > 0) {
                    fullPrompt += `Present: ${context.entities.join(', ')}\n`;
                }
                fullPrompt += `Time: ${context.timeOfDay}\n\n`;
            }

            if (playerState) {
                fullPrompt += `Player health: ${playerState.health}\n`;
                if (playerState.inventory?.length > 0) {
                    fullPrompt += `Inventory: ${playerState.inventory.join(', ')}\n`;
                }
                fullPrompt += `\n`;
            }

            fullPrompt += `${prompt}\n\nGenerate the next narrative turn:`;

            if (DEBUG.ONNX) console.log('[CartridgeWorker] Generating with prompt:', fullPrompt.substring(0, 200) + '...');

            // Generate with reduced memory footprint
            const result = await generator(fullPrompt, {
                max_new_tokens: 150,  // Reduced from 250 to reduce memory usage
                temperature: 0.8,
                do_sample: true,
                top_p: 0.95,
                repetition_penalty: 1.1
            });

            const generatedText = result[0]?.generated_text || result.generated_text || '';

            if (DEBUG.ONNX) console.log('[CartridgeWorker] Generated:', generatedText.substring(0, 100) + '...');

            self.postMessage({ type: 'complete', id, payload: generatedText });
        }

        // --- CONTENT AUDIT ---
        else if (type === 'audit_content') {
            if (!generator) {
                throw new Error('Model not loaded');
            }

            const { text } = payload;
            const auditPrompt = `Is this text appropriate for all audiences? Respond with ONLY "true" or "false".\n\nText: ${text}`;

            const result = await generator(auditPrompt, {
                max_new_tokens: 10,
                temperature: 0.1
            });

            const auditResult = result[0]?.generated_text || result.generated_text || 'true';
            self.postMessage({ type: 'complete', id, payload: auditResult });
        }

        // --- CLEAR CACHE ---
        else if (type === 'clear_cache') {
            const { modelId } = payload;
            if (modelId) {
                // Clear specific model from cache
                for (const [url] of modelCache) {
                    if (url.includes(modelId)) {
                        modelCache.delete(url);
                    }
                }
                if (DEBUG.ONNX) console.log(`[CartridgeWorker] Cleared cache for model ${modelId}`);
            } else {
                // Clear entire cache
                modelCache.clear();
                if (DEBUG.ONNX) console.log(`[CartridgeWorker] Cleared entire modelCache`);
            }
            self.postMessage({ type: 'complete', id, payload: 'cache_cleared' });
        }

        else {
            throw new Error(`Unknown request type: ${type}`);
        }

    } catch (error: any) {
        if (DEBUG.ERRORS) console.error('[CartridgeWorker] Error:', error);
        self.postMessage({
            type: 'error',
            id,
            payload: error.message || String(error)
        });
    }
});

// Log worker initialization
if (DEBUG.ONNX) console.log('[CartridgeWorker] Worker initialized and ready');
