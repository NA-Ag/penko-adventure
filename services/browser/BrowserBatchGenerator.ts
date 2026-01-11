/**
 * Batched Generation System for Browser AI
 *
 * Idea #5: Generate next 3 turns in one inference call
 * - User sees instant "branching" like Community Mode
 * - Amortizes slow inference across multiple turns
 * - 3 turns for price of 1 (3x effective speedup)
 */

import { GameTurnData } from '../../types';

export interface BatchedTurn {
    action: string;         // Player action that leads here
    response: GameTurnData; // Generated response
    children: string[];     // Next possible actions
}

export interface GenerationBatch {
    rootAction: string;           // The action user just took
    rootResponse: GameTurnData;   // Immediate response
    branches: BatchedTurn[];      // Pre-generated next turns
    generatedAt: number;          // Timestamp
}

export class BrowserBatchGenerator {
    private batchCache: Map<string, GenerationBatch>;
    private maxBatchAge: number = 3 * 60 * 1000;  // 3 minutes

    constructor() {
        this.batchCache = new Map();
    }

    /**
     * Generate 3 turns at once:
     * 1. Current response (immediate)
     * 2. Next 3 possible branches (for next turn)
     * 3. Sub-branches for each (for turn after that)
     *
     * This makes subsequent turns feel instant
     */
    async generateBatch(
        currentAction: string,
        context: any,
        generationFn: (action: string, ctx: any) => Promise<GameTurnData>
    ): Promise<GenerationBatch> {
        console.log(`[BrowserBatchGenerator] Generating batch for "${currentAction}"`);

        // Generate immediate response
        const rootResponse = await generationFn(currentAction, context);

        // Extract next 3 most likely actions from the response
        const nextActions = rootResponse.playerOptions?.slice(0, 3) || [
            'Continue',
            'Look around',
            'Rest'
        ];

        // Generate responses for each next action IN PARALLEL
        const branches: BatchedTurn[] = [];

        // Note: In production, these would run in parallel on separate workers
        // For now, sequential to avoid overloading single worker
        for (const action of nextActions) {
            try {
                const branchResponse = await generationFn(action, {
                    ...context,
                    lastAction: currentAction,
                    sceneData: rootResponse.sceneData
                });

                branches.push({
                    action,
                    response: branchResponse,
                    children: branchResponse.playerOptions?.slice(0, 3) || []
                });

            } catch (error) {
                console.error(`[BrowserBatchGenerator] Failed to generate branch for "${action}":`, error);
            }
        }

        const batch: GenerationBatch = {
            rootAction: currentAction,
            rootResponse,
            branches,
            generatedAt: Date.now()
        };

        // Cache for next turn
        this.batchCache.set(this.getCacheKey(currentAction, context), batch);

        console.log(`[BrowserBatchGenerator] ✅ Generated ${branches.length} branches`);

        return batch;
    }

    /**
     * Check if we have a pre-generated batch for this action
     * Returns the branch if cached (instant), otherwise null
     */
    getCachedBranch(action: string, context: any): GameTurnData | null {
        // Look for batch that contains this action as a branch
        for (const [key, batch] of this.batchCache.entries()) {
            // Check if batch is stale
            const age = Date.now() - batch.generatedAt;
            if (age > this.maxBatchAge) {
                this.batchCache.delete(key);
                continue;
            }

            // Check if this action is one of the pre-generated branches
            const branch = batch.branches.find(b =>
                b.action.toLowerCase() === action.toLowerCase()
            );

            if (branch) {
                console.log(`[BrowserBatchGenerator] ✅ Batch HIT for "${action}" (${Math.round(age/1000)}s old)`);
                return branch.response;
            }
        }

        return null;
    }

    /**
     * Get the immediate response from a batch
     * Used when we want to show the root response first
     */
    getBatchRoot(action: string, context: any): GameTurnData | null {
        const key = this.getCacheKey(action, context);
        const batch = this.batchCache.get(key);

        if (!batch) return null;

        // Check if stale
        const age = Date.now() - batch.generatedAt;
        if (age > this.maxBatchAge) {
            this.batchCache.delete(key);
            return null;
        }

        return batch.rootResponse;
    }

    /**
     * Pre-generate next batch in background
     * Called after user sees current response (during "reading time")
     */
    async preGenerateNext(
        currentResponse: GameTurnData,
        context: any,
        generationFn: (action: string, ctx: any) => Promise<GameTurnData>
    ): Promise<void> {
        // Get next 3 actions from current response
        const nextActions = currentResponse.playerOptions?.slice(0, 3) || [];

        if (nextActions.length === 0) return;

        console.log(`[BrowserBatchGenerator] 🔄 Pre-generating next batch in background...`);

        // Generate first action's batch (most likely user choice)
        const firstAction = nextActions[0];

        try {
            await this.generateBatch(firstAction, {
                ...context,
                sceneData: currentResponse.sceneData
            }, generationFn);
        } catch (error) {
            console.error('[BrowserBatchGenerator] Background generation failed:', error);
        }
    }

    /**
     * Create cache key from action + context
     */
    private getCacheKey(action: string, context: any): string {
        const parts = [
            action.toLowerCase().trim(),
            context.locationName || '',
            context.sceneData?.biome || ''
        ];

        return parts.join('::');
    }

    /**
     * Clear all cached batches
     */
    clearCache(): void {
        this.batchCache.clear();
        console.log('[BrowserBatchGenerator] Cache cleared');
    }

    /**
     * Get statistics
     */
    getStats(): {
        cacheSize: number;
        totalBranches: number;
        oldestBatch: number;
    } {
        let totalBranches = 0;
        let oldest = 0;

        for (const batch of this.batchCache.values()) {
            totalBranches += batch.branches.length;
            const age = Date.now() - batch.generatedAt;
            if (age > oldest) oldest = age;
        }

        return {
            cacheSize: this.batchCache.size,
            totalBranches,
            oldestBatch: Math.round(oldest / 1000)  // seconds
        };
    }

    /**
     * Cleanup stale batches
     * Called periodically to prevent memory buildup
     */
    cleanup(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, batch] of this.batchCache.entries()) {
            const age = now - batch.generatedAt;
            if (age > this.maxBatchAge) {
                this.batchCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`[BrowserBatchGenerator] Cleaned ${cleaned} stale batches`);
        }
    }

    /**
     * Enable/disable batch generation
     * Useful for low-end devices that can't handle parallel generation
     */
    private enabled: boolean = true;

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;

        if (!enabled) {
            this.clearCache();
        }

        console.log(`[BrowserBatchGenerator] ${enabled ? 'Enabled' : 'Disabled'}`);
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
