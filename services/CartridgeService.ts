/**
 * CartridgeService - Native Multilingual Generation
 *
 * Replaces OnnxService's Qwen + Translation pipeline with direct native generation
 * using truly open-source models: Qwen 2.5 (Apache 2.0), IBM Granite 4.0 (Apache 2.0)
 *
 * Key Differences from OnnxService:
 * - No CustomTranslationEngine (models generate natively in target language)
 * - Simpler worker communication (just load + generate)
 * - Cartridge-based model selection
 * - Native multilingual prompts
 * - TRUE open source - no licensing restrictions
 *
 * Note: Gemma removed due to Google ToS requirements (not truly open)
 */

import { GameTurnData, UserProfile, Language, CEFRLevel } from '../types';
import { Cartridge } from '../components/setup/CartridgeManager';
import workerUrl from './cartridge/worker?worker&url';
import { InputChecker } from './InputChecker';
import { DEBUG } from '../config';
import { BaseService } from './BaseService';

export class CartridgeService extends BaseService {
    private cartridge: Cartridge;

    constructor(profile: UserProfile, cartridge: Cartridge) {
        super(profile);
        this.cartridge = cartridge;
    }

    protected getWorkerUrl(): string {
        return workerUrl;
    }

    protected handleModelSpecificMessage(event: MessageEvent): void {
        // Handle any CartridgeService-specific worker messages
        // Currently all messages are handled by BaseService
    }

    // --- GAME METHODS ---

    public async loadModel(onProgress?: (p: number, t: string, loaded?: number, total?: number) => void): Promise<void> {
        // Skip model loading if already initialized
        if (this.isModelReady) {
            onProgress?.(95, 'Model already loaded');
            return;
        }

        onProgress?.(5, 'Initializing cartridge...');

        // Check storage (with 1.5x buffer for metadata files and safety margin)
        const details = await CartridgeService.getStorageDetails();
        const isCached = await CartridgeService.isModelCached(this.cartridge.modelId);
        const requiredSpace = this.cartridge.estimatedSize * 1.5;  // 50% buffer for config.json, tokenizer, etc.

        if (!isCached && details.free < requiredSpace && details.quota > 0) {
            throw new Error(`Insufficient storage. Free: ${Math.round(details.free/1024/1024)}MB. Required: ${Math.round(requiredSpace/1024/1024)}MB (includes metadata buffer).`);
        }

        // Initialize model
        if (CartridgeService.initializingModel === this.cartridge.modelId) {
            if (DEBUG.ONNX) console.log('[CartridgeService] Model already initializing, waiting...');
            onProgress?.(50, `Waiting for ${this.cartridge.modelId} initialization...`);

            let attempts = 0;
            while (CartridgeService.initializingModel !== null && attempts < 120) {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }
            if (CartridgeService.initializingModel !== null) {
                throw new Error('Model initialization timeout');
            }
            this.isModelReady = true;
            return;
        }

        CartridgeService.initializingModel = this.cartridge.modelId;
        try {
            onProgress?.(50, `Loading ${this.cartridge.tier} quality model...`);
            await this.request('init_model', {
                modelId: this.cartridge.modelId,
                targetLanguage: this.profile.targetLanguage
            }, (p, text, loaded, total) => {
                const mappedProgress = 50 + (p * 0.45);
                onProgress?.(Math.round(mappedProgress), text, loaded, total);
            });
            this.isModelReady = true;
        } finally {
            CartridgeService.initializingModel = null;
        }
    }

    async initGame(onProgress?: (p: number, t: string, loaded?: number, total?: number) => void): Promise<GameTurnData> {
        if (!this.isModelReady) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        onProgress?.(95, 'Initializing game state...');

        this.historyContext = [];
        this.currentHealth = 100;
        this.currentInventory = [];

        const theme = this.profile.theme.toUpperCase();

        // Initial prompt in target language (models generate natively!)
        const prompt = this.buildNativePrompt(`Start a new ${theme} adventure. Describe the opening scene.`);

        return this.processTurn(prompt, {
            biome: this.getBiomeForTheme(this.profile.theme),
            features: ['start'],
            entities: [],
            timeOfDay: 'day'
        }, true);
    }

    /**
     * Build native multilingual prompt for Qwen/Granite
     * No translation needed - these models understand and generate in 29+ languages!
     */
    private buildNativePrompt(userInput: string): string {
        const targetLang = this.profile.targetLanguage;

        // System prompts in various languages (Qwen/Granite understand all of these)
        const SYSTEM_PROMPTS: Record<string, string> = {
            [Language.ENGLISH]: 'You are a text adventure game master. Generate engaging narratives in English.',
            [Language.SPANISH]: 'Eres un maestro de juegos de aventuras de texto. Genera narrativas cautivadoras en español.',
            [Language.FRENCH]: 'Vous êtes un maître de jeu d\'aventure textuelle. Générez des récits captivants en français.',
            [Language.GERMAN]: 'Du bist ein Spielleiter für Textabenteuer. Generiere fesselnde Erzählungen auf Deutsch.',
            [Language.ITALIAN]: 'Sei un game master di avventure testuali. Genera narrazioni coinvolgenti in italiano.',
            [Language.PORTUGUESE]: 'Você é um mestre de jogos de aventura de texto. Gere narrativas envolventes em português.',
            [Language.JAPANESE]: 'あなたはテキストアドベンチャーゲームのマスターです。日本語で魅力的な物語を生成してください。',
            [Language.MANDARIN]: '你是一个文字冒险游戏主持人。用中文生成引人入胜的叙述。',
            [Language.RUSSIAN]: 'Вы - мастер текстовых приключений. Создавайте увлекательные повествования на русском языке.',
            [Language.UKRAINIAN]: 'Ви - майстер текстових пригод. Створюйте захоплюючі оповідання українською мовою.',
            [Language.POLISH]: 'Jesteś mistrzem gier przygodowych tekstowych. Generuj wciągające narracje po polsku.',
            [Language.CZECH]: 'Jsi mistr textových dobrodružných her. Generuj poutavé příběhy v češtině.',
        };

        const systemPrompt = SYSTEM_PROMPTS[targetLang] || SYSTEM_PROMPTS[Language.ENGLISH];

        return `${systemPrompt}\n\nUser: ${userInput}`;
    }

    async processTurn(input: string, context?: any, skipInputCheck = false): Promise<GameTurnData> {
        if (!this.isModelReady) {
            throw new Error('Model not ready. Please wait for initialization.');
        }

        try {
            const recentHistory = this.getCompressedContext();

            if (context?.inventory) this.currentInventory = context.inventory.map((i: any) => i.name);
            if (context?.health) this.currentHealth = context.health;

            let userFeedback = '';
            let finalInput = input;

            // OPTIONAL: Check user input for learning feedback only
            // We DON'T translate - Qwen/Granite accept input in ANY language!
            if (!skipInputCheck && this.profile.targetLanguage !== Language.ENGLISH && input.trim().length > 0) {
                try {
                    const checkResult = await this.inputChecker.checkAndCorrect(input);

                    console.log('[CartridgeService] Input check:', {
                        hadErrors: checkResult.hadErrors,
                        confidence: checkResult.confidence.toFixed(2)
                    });

                    // Update CEFR level based on performance
                    this.updateCEFRLevel(checkResult);

                    // Store feedback for display
                    userFeedback = checkResult.feedback;

                    // Use corrected input (still in target language!)
                    finalInput = checkResult.corrected;
                } catch (e) {
                    console.warn('[CartridgeService] Input checking failed:', e);
                }
            }

            // Build native prompt (no translation!)
            const prompt = this.buildNativePrompt(finalInput);

            // Generate with Qwen/Granite DIRECTLY in target language
            const rawText = await this.request('generate_turn', {
                prompt,
                language: this.profile.targetLanguage,
                history: recentHistory,
                context: context || { biome: 'unknown' },
                playerState: {
                    health: this.currentHealth,
                    inventory: this.currentInventory
                },
                theme: this.profile.theme
            }, undefined, 120000);

            this.historyContext.push(`Player: ${input}`);

            const turnData = await this.parseModelResponse(rawText, context);

            // Add user feedback if any
            if (userFeedback) {
                turnData.feedback = userFeedback;
            }

            this.historyContext.push(`AI: ${turnData.narrative}`);

            return turnData;

        } catch (e: any) {
            if (DEBUG.ERRORS) console.error("Model Generation Failed", e);
            return this.createFallbackState(e);
        }
    }

    /**
     * Parse model's native multilingual response
     * Much simpler than OnnxService - no translation needed!
     */
    private async parseModelResponse(text: string, fallbackContext?: any): Promise<GameTurnData> {
        let narrative = "";
        let sceneData = null;
        let options = null;

        // Try JSON parsing
        const firstBrace = text.indexOf('{');
        if (firstBrace !== -1) {
            try {
                let braceCount = 0;
                let endIndex = firstBrace;
                for (let i = firstBrace; i < text.length; i++) {
                    if (text[i] === '{') braceCount++;
                    if (text[i] === '}') braceCount--;
                    if (braceCount === 0) {
                        endIndex = i + 1;
                        break;
                    }
                }

                let jsonStr = text.substring(firstBrace, endIndex)
                    .replace(/,\s*}/g, '}')
                    .replace(/,\s*]/g, ']');

                const json = JSON.parse(jsonStr);
                narrative = json.narrative || "...";

                const rawBiome = json.biome || fallbackContext?.biome || 'forest';
                const biomeStr = typeof rawBiome === 'string' ? rawBiome : String(rawBiome);

                sceneData = {
                    biome: biomeStr.toLowerCase(),
                    features: Array.isArray(json.features) ? json.features : [],
                    entities: Array.isArray(json.entities) ? json.entities : [],
                    timeOfDay: json.time === 'night' ? 'night' : 'day'
                };
                options = json.options || ["Continue"];
            } catch(e) {
                if (DEBUG.ONNX) console.warn("JSON parsing failed", e);
            }
        }

        // Fallback
        if (!narrative) {
            narrative = text.replace(/Narrative:/i, '').trim();
            sceneData = {
                biome: fallbackContext?.biome || 'forest',
                features: fallbackContext?.features || [],
                entities: fallbackContext?.entities || [],
                timeOfDay: 'day'
            };
            options = ["Look", "Go North", "Check Inventory"];
        }

        // No translation needed! Model already generated in target language
        return {
            narrative,  // Already in Spanish/French/etc!
            nativeTranslation: narrative,  // Same text (no translation)
            sceneData: sceneData!,
            playerOptions: options!,
            inventory: [],
            health: 100,
            locationName: (sceneData!.biome || 'Unknown').toUpperCase(),
            feedback: ""
        };
    }

    async auditContent(text: string, onProgress?: (p: number, t: string) => void): Promise<{ passed: boolean; score: number; label: string }> {
        if (!this.isModelReady) {
            return { passed: true, score: 1, label: "Audit skipped (model not ready)" };
        }
        const rawResult = await this.request('audit_content', { text });
        return { passed: rawResult.includes("true"), score: 1, label: rawResult };
    }
}
