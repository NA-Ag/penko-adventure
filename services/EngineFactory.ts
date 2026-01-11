import { GameMode, UserProfile } from '../types';
import { GameEngine } from './geminiService';
import { GroqEngine } from './groqService';
import { OpenRouterEngine } from './openrouterService';
import { TogetherEngine } from './togetherService';
import { DeepInfraEngine } from './deepinfraService';
import { DeepSeekEngine } from './deepseekService';
import { CommunityEngineV3 } from './CommunityEngineV3';
import { CartridgeService } from './CartridgeService';
import { Cartridge } from '../components/setup/CartridgeManager';
import { FacadeEngine } from './FacadeEngine';

export type CloudProvider = 'groq' | 'gemini' | 'openrouter' | 'deepseek';

// Active game engine implementations
export type GameEngineInstance =
    | CommunityEngineV3   // Community Mode (ContentPack-based with ResponseTemplates)
    | GameEngine          // Gemini API
    | GroqEngine          // Groq API (Llama 3.1)
    | OpenRouterEngine    // OpenRouter (Multi-Model)
    | TogetherEngine      // Together AI
    | DeepInfraEngine     // DeepInfra (Llama 3.1)
    | DeepSeekEngine      // DeepSeek V3 (100+ languages)
    | CartridgeService    // Browser AI Mode (Local ONNX models)
    | FacadeEngine;       // Facade Interactive Drama Engine

export class EngineFactory {
    /**
     * Create engine with automatic fallback to alternative providers
     * Inspired by whisplay-ai-chatbot's multi-provider architecture
     */
    static async createEngineWithFallback(
        mode: GameMode,
        profile: UserProfile,
        apiKey: string | null,
        onProgress?: (progress: number, text: string) => void,
        customData?: any,
        cartridge?: Cartridge,
        providers: CloudProvider[] = ['groq', 'gemini', 'openrouter', 'deepseek']
    ): Promise<GameEngineInstance> {
        const errors: Record<string, string> = {};

        for (const provider of providers) {
            try {
                console.log(`[EngineFactory] Attempting to initialize with provider: ${provider}`);

                const engine = await this.createEngine(
                    mode,
                    profile,
                    apiKey,
                    onProgress,
                    customData,
                    cartridge,
                    provider
                );

                console.log(`[EngineFactory] ✅ Successfully initialized with ${provider}`);
                return engine;

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.warn(`[EngineFactory] ❌ ${provider} failed: ${errorMsg}`);
                errors[provider] = errorMsg;

                // Continue to next provider
                continue;
            }
        }

        // All providers failed
        const errorDetails = Object.entries(errors)
            .map(([provider, error]) => `${provider}: ${error}`)
            .join('\n');

        throw new Error(
            `All cloud providers failed:\n${errorDetails}\n\nPlease check your API keys or use Browser AI Mode.`
        );
    }

    static async createEngine(
        mode: GameMode,
        profile: UserProfile,
        apiKey: string | null,
        onProgress?: (progress: number, text: string) => void,
        customData?: any,
        cartridge?: Cartridge,
        cloudProvider?: CloudProvider
    ): Promise<GameEngineInstance> {
        try {
            switch (mode) {
                case 'offline':
                    // Community Mode: ContentPack-based (no AI needed)
                    console.log('[EngineFactory] Initializing Community Mode (Offline)');

                    // ContentPack can come from:
                    // 1. Selected pack (contentPackBrowser)
                    // 2. QuickStart genre (auto-load default pack)
                    // 3. Previously loaded pack (restore)
                    
                    if (!customData) {
                        throw new Error('Community Mode requires a ContentPack. Select a genre or content pack.');
                    }

                    if (customData.metadata && customData.world) {
                        // Full ContentPack provided
                        console.log('[EngineFactory] Loaded ContentPack:', customData.metadata.title);
                        console.log('[EngineFactory] Genre:', customData.metadata.genre);
                        return new CommunityEngineV3(customData, profile);
                    }

                    throw new Error('Invalid ContentPack format. Expected metadata and world properties.');

                case 'cloud':
                    if (!apiKey) {
                        throw new Error("API Key required for Cloud Mode");
                    }

                    // Select cloud provider (default to Groq for best free tier)
                    const provider = cloudProvider || 'groq';

                    switch (provider) {
                        case 'groq':
                            console.log('[EngineFactory] Initializing Cloud Mode (Groq - Llama 3.1)');
                            return new GroqEngine(profile, apiKey);

                        case 'gemini':
                            console.log('[EngineFactory] Initializing Cloud Mode (Gemini API)');
                            return new GameEngine(profile, apiKey);

                        case 'openrouter':
                            console.log('[EngineFactory] Initializing Cloud Mode (OpenRouter - Multi-Model)');
                            return new OpenRouterEngine(profile, apiKey);

                        case 'together':
                            console.log('[EngineFactory] Initializing Cloud Mode (Together AI - Llama 3.1)');
                            return new TogetherEngine(profile, apiKey);

                        case 'deepinfra':
                            console.log('[EngineFactory] Initializing Cloud Mode (DeepInfra - Llama 3.1)');
                            return new DeepInfraEngine(profile, apiKey);

                        case 'deepseek':
                            console.log('[EngineFactory] Initializing Cloud Mode (DeepSeek V3 - 100+ languages)');
                            return new DeepSeekEngine(profile, apiKey);

                        default:
                            throw new Error(`Unknown cloud provider: ${provider}`);
                    }

                case 'local':
                    // Browser AI Mode: Open-source cartridge system (Qwen/Granite)
                    console.log('[EngineFactory] Initializing Browser AI Mode (Open-Source Cartridge)');

                    if (!cartridge) {
                        throw new Error("Cartridge required for Browser AI Mode. Please install a cartridge first.");
                    }

                    console.log('[EngineFactory] Using cartridge:', cartridge.id);
                    console.log('[EngineFactory] Model:', cartridge.modelId);
                    console.log('[EngineFactory] Quality:', cartridge.tier);

                    const cartridgeEngine = new CartridgeService(profile, cartridge);
                    if (onProgress) onProgress(0, "Initializing cartridge...");
                    await cartridgeEngine.loadModel(onProgress);
                    return cartridgeEngine;

                case 'facade':
                    // Facade Mode: Interactive drama with ABL-based character behaviors
                    console.log('[EngineFactory] Initializing Facade Interactive Drama Mode');
                    console.log('[EngineFactory] Loading Facade narrative engine...');

                    const facadeEngine = new FacadeEngine({
                        autoStart: false,  // Don't auto-start - let UI control session
                        debugMode: false,   // Set to true for verbose logging
                        language: profile.targetLanguage,
                    });

                    if (onProgress) onProgress(0, "Loading Facade data...");
                    await facadeEngine.initialize();

                    if (onProgress) onProgress(100, "Facade engine ready");
                    console.log('[EngineFactory] ✅ Facade engine initialized successfully');

                    return facadeEngine;

                default:
                    throw new Error(`Unsupported game mode: ${mode}. Supported modes: 'offline', 'cloud', 'local', 'facade'.`);
            }
        } catch (error) {
            console.error(`Failed to initialize ${mode} engine:`, error);
            throw error; // Don't fallback - let the UI handle the error
        }
    }
}
