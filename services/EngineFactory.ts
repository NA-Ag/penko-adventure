import { GameMode, UserProfile } from '../types';
import { GameEngine } from './adventure/advanced/geminiService';
import { GameEngine as GameEngineBeginner } from './adventure/beginner/geminiService';
import { CartridgeService } from './adventure/advanced/CartridgeService';
import { OptimizedBrowserService as OptimizedBrowserServiceAdvanced } from './adventure/advanced/OptimizedBrowserService';
import { OptimizedBrowserService as OptimizedBrowserServiceBeginner } from './adventure/beginner/OptimizedBrowserService';
import { Cartridge } from "../types/Cartridge";
import { FacadeEngine } from './FacadeEngine';
import { OllamaEngine } from './adventure/advanced/OllamaEngine';

import { Scenario } from '../data/educational/frameworks/types';

export type CloudProvider = 'gemini';

// Active game engine implementations
export type GameEngineInstance =
    | GameEngine          // Gemini API (Advanced)
    | GameEngineBeginner  // Gemini API (Beginner clone)
    | CartridgeService    // Browser AI Mode (Local ONNX models)
    | FacadeEngine        // Facade Interactive Drama Engine
    | OllamaEngine;       // Native PC Mode (Localhost)

export class EngineFactory {

    static async createEngine(
        mode: GameMode,
        profile: UserProfile,
        apiKey: string | null,
        onProgress?: (progress: number, text: string) => void,
        customData?: any,
        cartridge?: Cartridge,
        cloudProvider?: CloudProvider,
        educationalScenario?: Scenario | null
    ): Promise<GameEngineInstance> {
        try {
            switch (mode) {
                case 'ollama':
                    console.log('[EngineFactory] Initializing Native PC Mode (Ollama/Qwen3)');
                    
                    if (!customData || !customData.model) {
                        throw new Error('Native PC Mode requires a specified model (e.g., qwen3:0.6b).');
                    }

                    const ollamaEngine = new OllamaEngine(profile, customData.model);
                    await ollamaEngine.initialize(onProgress);
                    return ollamaEngine;

                case 'cloud':
                    if (!apiKey) {
                        throw new Error("API Key required for Cloud Mode");
                    }

                    const geminiModel = customData?.geminiModel || 'gemini-2.5-pro';

                    if (profile.cefrLevel === 'A1') {
                        console.log(`[EngineFactory] Initializing Cloud Mode (Gemini API - Beginner clone) with model: ${geminiModel}`);
                        return new GameEngineBeginner(profile, apiKey, geminiModel, educationalScenario);
                    } else {
                        console.log(`[EngineFactory] Initializing Cloud Mode (Gemini API - Advanced) with model: ${geminiModel}`);
                        return new GameEngine(profile, apiKey, geminiModel, educationalScenario);
                    }

                case 'local':
                    // Browser AI Mode: Open-source cartridge system (Qwen 2.5)
                    console.log('[EngineFactory] Initializing Browser AI Mode (Open-Source Cartridge)');

                    if (!cartridge) {
                        throw new Error("Cartridge required for Browser AI Mode. Please install a cartridge first.");
                    }

                    console.log('[EngineFactory] Using cartridge:', cartridge.id);
                    console.log('[EngineFactory] Model:', cartridge.modelId);
                    console.log('[EngineFactory] Quality:', cartridge.tier);

                    const isBeginner = profile.cefrLevel === 'A1' || profile.cefrLevel === 'N5' || profile.cefrLevel === 'HSK 1';

                    const cartridgeEngine = isBeginner 
                        ? new OptimizedBrowserServiceBeginner(profile, cartridge, educationalScenario)
                        : new OptimizedBrowserServiceAdvanced(profile, cartridge, educationalScenario);
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
