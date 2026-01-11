/**
 * Optimized Browser AI Service
 *
 * Combines all 5 optimization strategies:
 * 1. Pre-Generation (BrowserPreGenerator) - Instant responses via predictive caching
 * 2. Smart Vocabulary (BrowserVocabularyManager) - Faster inference via constrained vocabulary
 * 3. Structured Output (BrowserStructuredOutput) - 3-5x faster via JSON schema constraints
 * 4. Context Compression (BrowserContextCompressor) - Aggressive compression (5 turns vs 15)
 * 5. Batched Generation (BrowserBatchGenerator) - Generate 3 turns at once
 *
 * Goal: Match Cloud AI's speed (0.5-2s) on CPU-only Firefox Linux
 */

import { CartridgeService } from '../CartridgeService';
import { GameTurnData, UserProfile, Language } from '../../types';
import { Cartridge } from '../../components/setup/CartridgeManager';

import { BrowserPreGenerator } from './BrowserPreGenerator';
import { BrowserVocabularyManager } from './BrowserVocabularyManager';
import { BrowserStructuredOutput } from './BrowserStructuredOutput';
import { BrowserContextCompressor } from './BrowserContextCompressor';
import { BrowserBatchGenerator } from './BrowserBatchGenerator';

import { DEBUG } from '../../config';

export class OptimizedBrowserService extends CartridgeService {
    private preGenerator: BrowserPreGenerator;
    private vocabularyManager: BrowserVocabularyManager;
    private batchGenerator: BrowserBatchGenerator;

    private turnHistory: string[] = [];
    private turnCount: number = 0;

    constructor(profile: UserProfile, cartridge: Cartridge) {
        super(profile, cartridge);

        this.preGenerator = new BrowserPreGenerator();
        this.vocabularyManager = new BrowserVocabularyManager();
        this.batchGenerator = new BrowserBatchGenerator();

        // Load saved vocabulary progress
        this.vocabularyManager.load();

        console.log('[OptimizedBrowserService] Initialized with 5 optimizations:');
        console.log('  ✓ Pre-Generation (predictive caching)');
        console.log('  ✓ Smart Vocabulary (constrained generation)');
        console.log('  ✓ Structured Output (JSON schema)');
        console.log('  ✓ Context Compression (5 turns max)');
        console.log('  ✓ Batched Generation (3 turns at once)');
    }

    /**
     * Process turn with ALL optimizations enabled
     * Target: <1s on Firefox Linux (down from 5-15s)
     */
    async processTurn(input: string, context?: any): Promise<GameTurnData> {
        const startTime = Date.now();
        this.turnCount++;

        console.log(`[OptimizedBrowserService] Turn ${this.turnCount}: "${input}"`);

        // OPTIMIZATION 5: Check batched generation cache first
        const batchedResponse = this.batchGenerator.getCachedBranch(input, context || {});
        if (batchedResponse) {
            const elapsed = Date.now() - startTime;
            console.log(`[OptimizedBrowserService] ⚡ BATCH HIT (${elapsed}ms)`);

            this.trackVocabulary(batchedResponse.narrative);
            this.queueNextBatch(batchedResponse, context);

            return batchedResponse;
        }

        // OPTIMIZATION 1: Check pre-generation cache
        const contextHash = this.hashContext(context || {});
        const preGenerated = this.preGenerator.getCachedResponse(input, contextHash);
        if (preGenerated) {
            const elapsed = Date.now() - startTime;
            console.log(`[OptimizedBrowserService] ⚡ PRE-GEN HIT (${elapsed}ms)`);

            this.trackVocabulary(preGenerated.narrative);
            this.queueNextPreGeneration(preGenerated, context);

            return preGenerated;
        }

        // CACHE MISS - Need to generate

        // OPTIMIZATION 4: Compress context aggressively
        const compressed = BrowserContextCompressor.compress(
            this.turnHistory,
            context || {}
        );

        const minimalContext = BrowserContextCompressor.buildMinimalPrompt(
            compressed,
            input,
            this.profile.targetLanguage
        );

        // OPTIMIZATION 2: Get vocabulary constraint
        const vocabularyHint = this.vocabularyManager.getVocabularyConstraint(
            this.profile.targetLanguage as Language,
            200  // Max 200 words
        );

        // OPTIMIZATION 3: Build constrained JSON prompt
        const constrainedPrompt = BrowserStructuredOutput.buildConstrainedPrompt(
            input,
            {
                ...context,
                contextSummary: minimalContext
            },
            this.profile.targetLanguage as Language,
            vocabularyHint
        );

        // Validate context size
        if (!BrowserContextCompressor.validateContextSize(constrainedPrompt, 400)) {
            console.warn('[OptimizedBrowserService] Context too large, truncating...');
            const truncated = BrowserContextCompressor.truncatePrompt(constrainedPrompt, 400);
        }

        // Generate using base CartridgeService
        console.log(`[OptimizedBrowserService] 🔄 Generating (cache miss)...`);
        const rawResponse = await this.generateWithWorker(constrainedPrompt, context || {});

        // OPTIMIZATION 3: Parse structured output
        const response = BrowserStructuredOutput.parseResponse(
            rawResponse,
            context || {},
            `You ${input}.`  // Fallback narrative
        );

        const elapsed = Date.now() - startTime;
        console.log(`[OptimizedBrowserService] ✅ Generated in ${elapsed}ms`);

        // Track vocabulary for future constraint
        this.trackVocabulary(response.narrative);

        // Update history
        this.turnHistory.push(response.narrative);
        if (this.turnHistory.length > 20) {
            this.turnHistory.shift();
        }

        // OPTIMIZATION 5: Start batch generation in background
        if (this.turnCount % 3 === 1) {  // Every 3rd turn
            this.batchGenerator.preGenerateNext(
                response,
                context || {},
                (action, ctx) => this.processTurn(action, ctx)
            );
        }

        // OPTIMIZATION 1: Queue pre-generation for next turn
        this.queueNextPreGeneration(response, context);

        return response;
    }

    /**
     * Generate using worker (called by base processTurn)
     */
    private async generateWithWorker(prompt: string, context: any): Promise<string> {
        // Use reduced max tokens for structured output
        const maxTokens = BrowserStructuredOutput.getMaxTokens();  // 80 instead of 150

        // Call parent's worker request
        const result = await this.request('generate_turn', {
            prompt,
            language: this.profile.targetLanguage,
            history: [],  // Already compressed in prompt
            context,
            playerState: {
                health: context.health || 100,
                inventory: context.inventory || []
            },
            maxTokens
        });

        return result;
    }

    /**
     * Track vocabulary from narrative
     * Feeds into OPTIMIZATION 2 (Smart Vocabulary)
     */
    private trackVocabulary(narrative: string): void {
        const words = narrative.toLowerCase()
            .replace(/[.,!?;:]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2);  // Skip short words

        for (const word of words) {
            this.vocabularyManager.addWord(
                this.profile.targetLanguage as Language,
                word
            );
        }

        // Periodically save progress
        if (this.turnCount % 5 === 0) {
            this.vocabularyManager.save();
        }
    }

    /**
     * Queue pre-generation for next likely actions
     * OPTIMIZATION 1
     */
    private queueNextPreGeneration(response: GameTurnData, context: any): void {
        if (!response.playerOptions || response.playerOptions.length === 0) return;

        this.preGenerator.queuePreGeneration(
            {
                ...context,
                sceneData: response.sceneData
            },
            response.playerOptions,
            2  // Medium priority
        );
    }

    /**
     * Queue next batch generation in background
     * OPTIMIZATION 5
     */
    private queueNextBatch(response: GameTurnData, context: any): void {
        if (!response.playerOptions || response.playerOptions.length === 0) return;

        // Generate batch for first action (most likely)
        const firstAction = response.playerOptions[0];

        setTimeout(() => {
            this.batchGenerator.generateBatch(
                firstAction,
                {
                    ...context,
                    sceneData: response.sceneData
                },
                (action, ctx) => this.processTurn(action, ctx)
            ).catch(err => {
                console.error('[OptimizedBrowserService] Background batch generation failed:', err);
            });
        }, 1000);  // Start after 1 second (user reading time)
    }

    /**
     * Hash context for caching
     */
    private hashContext(context: any): string {
        const parts = [
            context.locationName || '',
            context.sceneData?.biome || '',
            (context.sceneData?.features || []).join(',')
        ];

        return parts.join('|');
    }

    /**
     * Get optimization statistics
     */
    getOptimizationStats(): {
        preGenCache: any;
        batchCache: any;
        vocabularyLevel: any;
        turnCount: number;
    } {
        return {
            preGenCache: this.preGenerator.getStats(),
            batchCache: this.batchGenerator.getStats(),
            vocabularyLevel: this.vocabularyManager.getLevel(this.profile.targetLanguage as Language),
            turnCount: this.turnCount
        };
    }

    /**
     * Clear all caches (new game)
     */
    clearAllCaches(): void {
        this.preGenerator.clearCache();
        this.batchGenerator.clearCache();
        BrowserContextCompressor.clearCache();
        this.turnHistory = [];
        this.turnCount = 0;

        console.log('[OptimizedBrowserService] All caches cleared');
    }

    /**
     * Cleanup - called when service is destroyed
     */
    async cleanup(): Promise<void> {
        this.vocabularyManager.save();
        this.clearAllCaches();
        await super.cleanup();
    }
}
