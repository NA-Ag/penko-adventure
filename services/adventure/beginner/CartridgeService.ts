/**
 * CartridgeService - Native Multilingual Generation
 *
 * Replaces OnnxService's Qwen + Translation pipeline with direct native generation
 * using truly open-source models: Qwen 2.5 (Apache 2.0).
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

import nlp from 'compromise';
import * as Diff from 'diff';
import { GameTurnData, UserProfile, Language, CEFRLevel } from '../../../types';
import { Cartridge } from '../../../types/Cartridge';
import workerUrl from '../../cartridge/llm.worker?worker&url';
import ttsWorkerUrl from '../../cartridge/tts.worker?worker&url';
import translationWorkerUrl from '../../cartridge/translation.worker?worker&url';
import { InputChecker } from '../InputChecker';
import { DEBUG } from '../../../config';
import { BaseService } from '../../BaseService';
import { getPromptSet } from '../../../data/adventure/beginner/prompts';
import { TRANSLATIONS } from '../../../translations';

import { RulesEngine } from '../../browser/rules/RulesEngine';

export class CartridgeService extends BaseService {
    private cartridge: Cartridge;
    private rulesEngine: RulesEngine;
    private currentScene: any;
    private locationName: string;

    constructor(profile: UserProfile, cartridge: Cartridge) {
        super(profile);
        this.cartridge = cartridge;
        this.rulesEngine = new RulesEngine(profile.theme);
        this.currentScene = {
            biome: this.getBiomeForTheme(this.profile.theme),
            features: ['start'],
            entities: [],
            timeOfDay: 'day'
        };
        this.locationName = this.currentScene.biome.toUpperCase();
    }

    protected getWorkerUrl(): string {
        return workerUrl;
    }

    protected getTtsWorkerUrl(): string {
        return ttsWorkerUrl;
    }

    protected getSimplifyWorkerUrl(): string {
        return translationWorkerUrl;
    }

    protected handleModelSpecificMessage(event: MessageEvent): void {
        // Handle any CartridgeService-specific worker messages
        // Currently all messages are handled by BaseService
    }

    // --- GAME METHODS ---

    public isTTSReady: boolean = false;
    public currentTTSEngine: string = 'kokoro';

    public get isSimplifyReady(): boolean { return BaseService.isSimplifyReady; }
    public set isSimplifyReady(v: boolean) { BaseService.isSimplifyReady = v; }

    public async initSimplify(onProgress?: (p: number, t: string) => void): Promise<void> {
        try {
            await this.initSimplifyEngine((p, text) => {
                onProgress?.(p || 0, text || 'Loading simplify engine...');
            });
            BaseService.isSimplifyReady = true;
        } catch (e) {
            console.error('[CartridgeService] Failed to init simplify engine:', e);
            BaseService.isSimplifyReady = false;
        }
    }

    public static getNeuralModelId(language: Language, engine: string = 'mms'): { modelId: string, modelFile?: string } {
        // Piper is currently gated on Hugging Face (requires 401 auth), 
        // so we fallback to the fully public and verified MMS models.
        const mmsMapping: Record<string, string> = {
            [Language.SPANISH]: 'Xenova/mms-tts-spa',
            [Language.FRENCH]: 'Xenova/mms-tts-fra',
            [Language.GERMAN]: 'Xenova/mms-tts-deu',
            [Language.ITALIAN]: 'Xenova/mms-tts-ita',
            [Language.JAPANESE]: 'Xenova/mms-tts-jpn',
            [Language.MANDARIN]: 'Xenova/mms-tts-cmn',
            [Language.RUSSIAN]: 'Xenova/mms-tts-rus',
            [Language.PORTUGUESE]: 'Xenova/mms-tts-por',
            [Language.UKRAINIAN]: 'Xenova/mms-tts-ukr',
            [Language.POLISH]: 'Xenova/mms-tts-pol',
            [Language.CZECH]: 'Xenova/mms-tts-ces',
        };
        return { modelId: mmsMapping[language] || 'Xenova/mms-tts-spa' };
    }

    public async preloadTTS(engine: string = 'kokoro', onProgress?: (p: number) => void): Promise<void> {
        if (this.isTTSReady && this.currentTTSEngine === engine) {
            onProgress?.(100);
            return;
        }

        const { modelId, modelFile } = engine === 'kokoro' 
            ? { modelId: 'onnx-community/Kokoro-82M-v1.0-ONNX' } 
            : CartridgeService.getNeuralModelId(this.profile.targetLanguage, engine);

        await this.requestTts('init_tts', { engine, modelId, modelFile }, (p, text, loaded, total) => {
            onProgress?.(p || 0);
        });
        
        this.isTTSReady = true;
        this.currentTTSEngine = engine;
        BaseService.isTtsInitialized = true; // Activate Baton Pass if on low-end
    }

    public async generateSpeech(text: string, voiceName: string, engine: string = 'kokoro', onProgress?: (p: number) => void): Promise<string> {
        if (!this.isTTSReady || this.currentTTSEngine !== engine) {
            await this.preloadTTS(engine, onProgress);
        }
        
        try {
            return await this.requestTts('generate_tts', { text, voice: voiceName });
        } catch (e) {
            console.error('[CartridgeService] TTS generation failed:', e);
            return '';
        }
    }

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
            }, 0); // 0 means no timeout for downloading massive models
            this.isModelReady = true;
        } finally {
            CartridgeService.initializingModel = null;
        }
    }

    async initGame(onProgress?: (p: number, t: string, loaded?: number, total?: number) => void, onStream?: (chunk: string, text: string) => void): Promise<GameTurnData> {
        if (!this.isModelReady) {
            throw new Error('Model not loaded. Call loadModel() first.');
        }

        onProgress?.(95, 'Initializing game state...');

        this.historyContext = [];
        
        // Use the map-based RulesEngine to get the rigid starting state
        const initialState = this.rulesEngine.getInitialState();
        
        this.currentScene = initialState.scene;
        this.currentHealth = initialState.playerState.health;
        this.currentInventory = initialState.playerState.inventory;
        this.locationName = initialState.playerState.locationName;
        // Keep track of the actual room ID as well
        (this as any).currentRoomId = initialState.playerState.currentRoomId;

        // Qwen understands instructions in English, but the system prompt forces it to reply in the Target Language.
        const promptText = `Action: Look around.\nSystem Event: ${initialState.promptInfo}`;
        
        return this.processTurn(promptText, this.currentScene, true, true, onStream);
    }

    async processTurn(input: string, context?: any, skipInputCheck = false, isStart = false, onStream?: (chunk: string, text: string) => void): Promise<GameTurnData> {
        if (!this.isModelReady) {
            throw new Error('Model not ready. Please wait for initialization.');
        }

        try {
            await this.compressContextAsync();

            if (context?.inventory) this.currentInventory = context.inventory.map((i: any) => i.name || i);
            if (context?.health) this.currentHealth = context.health;
            if (context?.sceneData) this.currentScene = context.sceneData;

            // Get the localized theme name
            const themeMapping: Record<string, string> = (TRANSLATIONS as any)[this.profile.targetLanguage] || TRANSLATIONS[Language.ENGLISH];
            const localizedTheme = themeMapping[this.profile.theme] || this.profile.theme;

            // USE RULES ENGINE FOR STATE CHANGES
            const playerState = { health: this.currentHealth, inventory: this.currentInventory, locationName: this.locationName, currentRoomId: (this as any).currentRoomId };
            const ruleResult = this.rulesEngine.processInput(input, this.currentScene, playerState);
            
            this.currentScene = ruleResult.newScene;
            this.currentInventory = ruleResult.newPlayerState.inventory;
            this.currentHealth = ruleResult.newPlayerState.health;
            this.locationName = ruleResult.newPlayerState.locationName;
            (this as any).currentRoomId = ruleResult.newPlayerState.currentRoomId;

            // Build the prompt using the new Omni-Model templates
            const promptSet = getPromptSet(this.profile.targetLanguage);
            
            // Clean the action and system event strings
            const cleanAction = input.replace(/^Action:\s*/i, '').replace(/\nSystem Event:.*$/s, '');
            const rawSystemEvent = ruleResult.actionEvent || (input.includes('System Event:') ? input.split('System Event:')[1].trim() : null);
            const cleanSystemEvent = rawSystemEvent ? rawSystemEvent.replace(/^Initial location:\s*/i, '') : null;

            const prompt = promptSet.narrative(
                localizedTheme,
                this.historyContext.join(' '),
                isStart ? "Start the game." : cleanAction,
                cleanSystemEvent
            );

            const response = await this.request('generate_turn', {
                prompt: prompt,
                maxTokens: 80,
                language: this.profile.targetLanguage,
                theme: this.profile.theme
            }, undefined, 0, onStream); 

            let targetNarrative = response.text || "";

            if (!isStart) {
                this.historyContext.push(`Player: ${input}`);
            }

            const dynamicOptions = this.rulesEngine.generateOptions((this as any).currentRoomId || this.currentScene.biome, this.currentInventory);

            const turnData: GameTurnData = {
                narrative: targetNarrative,
                simplifiedNarrative: "", // Handled on-demand by UI
                nativeTranslation: '',   // Handled on-demand by UI
                sceneData: this.currentScene,
                playerOptions: dynamicOptions,
                inventory: this.currentInventory.map(name => ({ id: name, name, description: 'Item', icon: '❓' })),
                health: this.currentHealth,
                locationName: this.locationName,
                feedback: "" // Handled on-demand by UI
            };

            this.historyContext.push(`AI: ${targetNarrative}`);
            return turnData;

        } catch (e: any) {
            if (DEBUG.ERRORS) console.error("Model Generation Failed", e);
            return this.createFallbackState(e);
        }
    }

    async auditContent(text: string, onProgress?: (p: number, t: string) => void): Promise<{ passed: boolean; score: number; label: string }> {
        if (!this.isModelReady) {
            return { passed: true, score: 1, label: "Audit skipped (model not ready)" };
        }
        const rawResult = await this.request('audit_content', { text });
        return { passed: rawResult.includes("true"), score: 1, label: rawResult };
    }

    // --- AUDIO METHODS (for Neural Speech Recognition) ---

    static async resampleTo16k(audioBuffer: AudioBuffer): Promise<Float32Array> {
        // Dummy implementation for compilation
        return audioBuffer.getChannelData(0);
    }

    async transcribeAudio(audioData: Float32Array, languageCode: string): Promise<string> {
        // Dummy implementation for compilation
        return this.request('transcribe_audio', { audioData, languageCode });
    }
}
