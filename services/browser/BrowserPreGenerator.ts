/**
 * Pre-Generation System for Browser AI
 *
 * Idea #1: Pre-generate common narrative branches during idle time
 * - NOT a fallback - eliminates wait time entirely
 * - Predicts next 3-5 most likely player actions
 * - Generates responses in background while user is reading
 * - When user selects action, response is already cached (instant)
 */

import { GameTurnData } from '../../types';

export interface PreGeneratedBranch {
    action: string;           // Predicted player action ("go north", "examine door")
    response: GameTurnData;   // Pre-generated response
    confidence: number;       // 0-1, how likely user will choose this
    generatedAt: number;      // Timestamp
}

export interface GenerationRequest {
    context: any;
    possibleActions: string[];
    priority: number;  // Higher = generate first
}

export class BrowserPreGenerator {
    private cache: Map<string, PreGeneratedBranch>;
    private generationQueue: GenerationRequest[];
    private isGenerating: boolean = false;
    private maxCacheSize: number = 10;  // Store last 10 pre-generated branches

    constructor() {
        this.cache = new Map();
        this.generationQueue = [];
    }

    /**
     * Check if we have a pre-generated response for this action
     * Returns immediately if cached (0ms), otherwise null
     */
    getCachedResponse(action: string, contextHash: string): GameTurnData | null {
        const cacheKey = this.getCacheKey(action, contextHash);
        const cached = this.cache.get(cacheKey);

        if (!cached) return null;

        // Check if cache is stale (> 5 minutes old)
        const age = Date.now() - cached.generatedAt;
        if (age > 5 * 60 * 1000) {
            this.cache.delete(cacheKey);
            return null;
        }

        console.log(`[BrowserPreGenerator] ✅ Cache HIT for "${action}" (${Math.round(age/1000)}s old)`);
        return cached.response;
    }

    /**
     * Queue pre-generation for predicted actions
     * This runs in background during idle time
     */
    queuePreGeneration(
        context: any,
        possibleActions: string[],
        priority: number = 1
    ): void {
        // Don't queue if already generating or queue is full
        if (this.generationQueue.length > 5) {
            console.log('[BrowserPreGenerator] Queue full, skipping pre-generation');
            return;
        }

        this.generationQueue.push({
            context,
            possibleActions,
            priority
        });

        // Sort by priority (high to low)
        this.generationQueue.sort((a, b) => b.priority - a.priority);

        // Start generation if not already running
        if (!this.isGenerating) {
            this.processQueue();
        }
    }

    /**
     * Process generation queue in background
     */
    private async processQueue(): Promise<void> {
        if (this.isGenerating || this.generationQueue.length === 0) return;

        this.isGenerating = true;

        while (this.generationQueue.length > 0) {
            const request = this.generationQueue.shift()!;

            // Generate for each possible action
            for (const action of request.possibleActions.slice(0, 3)) {  // Limit to top 3
                await this.generateForAction(action, request.context);

                // Yield to main thread between generations
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        this.isGenerating = false;
    }

    /**
     * Generate response for a specific action
     * Called in background, results cached for instant retrieval
     */
    private async generateForAction(action: string, context: any): Promise<void> {
        const contextHash = this.hashContext(context);
        const cacheKey = this.getCacheKey(action, contextHash);

        // Skip if already cached
        if (this.cache.has(cacheKey)) return;

        console.log(`[BrowserPreGenerator] 🔄 Pre-generating for action: "${action}"`);

        // This would call the actual AI worker
        // For now, placeholder - you'll wire this to CartridgeService
        const response: GameTurnData = {
            narrative: `[PRE-GENERATED] You ${action}.`,  // Placeholder
            sceneData: context.sceneData,
            playerOptions: ['Continue', 'Look around', 'Check inventory'],
            inventory: context.inventory || [],
            health: context.health || 100,
            locationName: context.locationName || 'Unknown'
        };

        // Cache with metadata
        this.cache.set(cacheKey, {
            action,
            response,
            confidence: this.calculateConfidence(action, context),
            generatedAt: Date.now()
        });

        // Enforce cache size limit
        if (this.cache.size > this.maxCacheSize) {
            const oldest = Array.from(this.cache.keys())[0];
            this.cache.delete(oldest);
        }

        console.log(`[BrowserPreGenerator] ✅ Pre-generated "${action}" (cache: ${this.cache.size}/${this.maxCacheSize})`);
    }

    /**
     * Calculate confidence that user will choose this action
     * Based on action type and game context
     */
    private calculateConfidence(action: string, context: any): number {
        // Common actions have higher confidence
        const commonActions = ['go north', 'go south', 'go east', 'go west', 'look around', 'examine'];

        if (commonActions.some(common => action.toLowerCase().includes(common))) {
            return 0.8;
        }

        // Actions matching current scene features
        if (context.sceneData?.features) {
            const features = context.sceneData.features.join(' ').toLowerCase();
            if (features.includes(action.toLowerCase())) {
                return 0.9;
            }
        }

        return 0.5;  // Default confidence
    }

    /**
     * Hash context to create cache key
     */
    private hashContext(context: any): string {
        // Simple hash based on location + features + entities
        const parts = [
            context.locationName || '',
            context.sceneData?.biome || '',
            (context.sceneData?.features || []).join(','),
            (context.sceneData?.entities || []).join(',')
        ];

        return parts.join('|');
    }

    /**
     * Create cache key from action + context
     */
    private getCacheKey(action: string, contextHash: string): string {
        return `${action.toLowerCase().trim()}::${contextHash}`;
    }

    /**
     * Clear all cached pre-generations
     */
    clearCache(): void {
        this.cache.clear();
        this.generationQueue = [];
        console.log('[BrowserPreGenerator] Cache cleared');
    }

    /**
     * Get cache statistics
     */
    getStats(): { cacheSize: number; queueSize: number; isGenerating: boolean } {
        return {
            cacheSize: this.cache.size,
            queueSize: this.generationQueue.length,
            isGenerating: this.isGenerating
        };
    }

    /**
     * Set the actual AI generation function
     * This will be wired to CartridgeService worker
     */
    setGenerationFunction(fn: (prompt: string, context: any) => Promise<GameTurnData>): void {
        // Store for use in generateForAction
        (this as any).generationFn = fn;
    }
}
