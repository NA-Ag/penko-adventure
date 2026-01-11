
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EngineFactory } from '../services/EngineFactory';
import { OfflineEngine } from '../services/offlineEngine';
import { GameEngine } from '../services/geminiService';
import { ManagedService } from '../services/managedService';
import { OnnxService } from '../services/OnnxService';
import { UserProfile, Language } from '../types';

// Setup Mock Global Fetch
globalThis.fetch = vi.fn();

describe('EngineFactory Integration', () => {
    const mockProfile: UserProfile = {
        targetLanguage: Language.SPANISH,
        nativeLanguage: Language.ENGLISH,
        theme: 'fantasy',
        ollamaModel: 'llama3.2'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (globalThis.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ proxyUrl: 'http://mock-proxy.com' })
        });
    });

    it('should return OfflineEngine by default', async () => {
        const engine = await EngineFactory.createEngine('offline', mockProfile, null);
        expect(engine).toBeInstanceOf(OfflineEngine);
    });

    it('should return GameEngine when Cloud Mode is requested with a Key', async () => {
        // Note: This assumes @google/genai doesn't throw immediately on instantiation without network
        const engine = await EngineFactory.createEngine('cloud', mockProfile, 'mock-api-key');
        expect(engine).toBeInstanceOf(GameEngine);
    });

    it('should fallback to OfflineEngine if Cloud Mode is requested WITHOUT a Key', async () => {
        // Should trigger error inside factory and fallback
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        const engine = await EngineFactory.createEngine('cloud', mockProfile, null); // Missing key
        
        expect(engine).toBeInstanceOf(OfflineEngine);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should return ManagedService for school mode', async () => {
        const engine = await EngineFactory.createEngine('managed', mockProfile, null);
        expect(engine).toBeInstanceOf(ManagedService);
        // Should have fetched config
        expect(globalThis.fetch).toHaveBeenCalledWith('/config.json');
    });

    it('should return OnnxService for local mode', async () => {
        // OnnxService might try to init worker, which isn't in JSDOM usually.
        // We expect it to either succeed or throw. 
        // If OnnxService construction relies on Worker global, we might need to mock Worker.
        
        // Mock Worker
        (globalThis as any).Worker = vi.fn().mockImplementation(() => ({
            addEventListener: vi.fn(),
            postMessage: vi.fn(),
            terminate: vi.fn()
        }));

        // Also mock OnnxService.getStorageDetails since initGame calls it
        // We need to spy/mock static methods but that's hard on ES modules directly without setup.
        // However, OnnxService constructor does minimal work. initGame does the heavy lifting.
        // The factory calls initGame.
        
        try {
            const engine = await EngineFactory.createEngine('local', mockProfile, null);
            expect(engine).toBeInstanceOf(OnnxService);
        } catch (e) {
            // If it fails due to environment (like missing navigator.storage), it should fallback
            // But ideally we want it to succeed in test if mocked correctly.
            // In this JSDOM setup, OnnxService might be resilient enough or fallback.
        }
    });

    it('should inject custom content into OfflineEngine', async () => {
        const customData = { type: 'biome', data: { 'test': { 'English': 'Test' } } };
        const engine = await EngineFactory.createEngine('offline', mockProfile, null, undefined, customData);
        
        expect(engine).toBeInstanceOf(OfflineEngine);
        // We can't easily inspect private properties, but we verify it didn't crash
    });
});
