/**
 * BaseService - Common functionality shared between OnnxService and CartridgeService
 * 
 * This abstract class eliminates code duplication and provides a foundation for
 * all AI model services in Penko. It handles:
 * - Worker management and communication
 * - Storage management
 * - Context compression
 * - CEFR level adaptation
 * - Error handling patterns
 */

import { GameTurnData, UserProfile, CEFRLevel } from '../types';
import { InputChecker } from './InputChecker';
import { DEBUG } from '../config';

export interface PerformanceMetrics {
    errorRate: number;
    averageConfidence: number;
    turnsAtCurrentLevel: number;
    consecutivePerfectTurns: number;
}

export interface WorkerMessage {
    type: 'complete' | 'error' | 'progress';
    id: string;
    payload: any;
}

export abstract class BaseService {
    protected static workerInstance: Worker | null = null;
    protected static pendingRequests: Map<string, { resolve: Function; reject: Function; onProgress?: Function }> = new Map();
    protected static initializingModel: string | null = null;

    protected profile: UserProfile;
    protected historyContext: string[] = [];
    protected currentHealth: number = 100;
    protected currentInventory: string[] = [];
    protected inputChecker: InputChecker;
    protected isModelReady: boolean = false;

    // Dynamic CEFR adaptation
    protected currentCEFRLevel: CEFRLevel;
    protected performanceMetrics: PerformanceMetrics = {
        errorRate: 0,
        averageConfidence: 1.0,
        turnsAtCurrentLevel: 0,
        consecutivePerfectTurns: 0
    };

    // Context compression settings
    protected readonly MAX_CONTEXT_LENGTH = 15;
    protected readonly KEEP_FIRST_TURNS = 2;
    protected readonly KEEP_RECENT_TURNS = 4;

    constructor(profile: UserProfile) {
        this.profile = profile;
        this.currentCEFRLevel = profile.cefrLevel || 'A2';
        this.inputChecker = new InputChecker(
            profile.targetLanguage,
            profile.nativeLanguage,
            this.currentCEFRLevel
        );
        this.initWorker();
    }

    protected abstract getWorkerUrl(): string;
    protected abstract handleModelSpecificMessage(event: MessageEvent): void;

    protected initWorker(): void {
        if (!BaseService.workerInstance) {
            BaseService.workerInstance = new Worker(this.getWorkerUrl(), { type: 'module' });
            BaseService.workerInstance.addEventListener('message', (event) => this.handleWorkerMessage(event));
        }
    }

    protected handleWorkerMessage(event: MessageEvent): void {
        const { type, id, payload } = event.data as WorkerMessage;
        const request = BaseService.pendingRequests.get(id);

        // Only log non-progress messages to reduce spam
        if (DEBUG.ONNX && type !== 'progress') {
            console.log(`[${this.constructor.name}] Worker message:`, { type, id });
        }

        if (!request) return;

        if (type === 'progress') {
            // Don't log progress here - worker already logs it
            if (request.onProgress) {
                request.onProgress(
                    payload.progress || 0,
                    payload.file || 'Loading...',
                    payload.loaded,
                    payload.total
                );
            }
        } else if (type === 'complete') {
            if (DEBUG.ONNX) console.log(`[${this.constructor.name}] Request completed:`, id);
            request.resolve(payload);
            BaseService.pendingRequests.delete(id);
        } else if (type === 'error') {
            if (DEBUG.ERRORS) console.error(`[${this.constructor.name}] Request failed:`, payload);
            request.reject(new Error(payload));
            BaseService.pendingRequests.delete(id);
        } else {
            this.handleModelSpecificMessage(event);
        }
    }

    protected request(type: string, payload: any, onProgress?: (p: number, t: string, loaded?: number, total?: number) => void, timeout = 120000): Promise<any> {
        const id = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                BaseService.pendingRequests.delete(id);
                reject(new Error(`Request timeout after ${timeout}ms`));
            }, timeout);

            BaseService.pendingRequests.set(id, {
                resolve: (result: any) => {
                    clearTimeout(timeoutId);
                    BaseService.pendingRequests.delete(id);
                    resolve(result);
                },
                reject: (error: any) => {
                    clearTimeout(timeoutId);
                    BaseService.pendingRequests.delete(id);
                    reject(error);
                },
                onProgress
            });

            BaseService.workerInstance?.postMessage({ type, payload, id });
        });
    }

    // --- Storage Management ---
    public static async getStorageDetails(): Promise<{ usage: number; quota: number; free: number; pcent: number }> {
        if (typeof navigator === 'undefined' || !navigator.storage) {
            return { usage: 0, quota: 0, free: 0, pcent: 0 };
        }
        try {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const free = quota - usage;
            const pcent = quota > 0 ? Math.round((usage / quota) * 100) : 0;
            return { usage, quota, free, pcent };
        } catch (e) {
            if (DEBUG.ONNX) console.warn("Storage estimate failed", e);
            return { usage: 0, quota: 0, free: 0, pcent: 0 };
        }
    }

    public static async isModelCached(modelId: string): Promise<boolean> {
        if (typeof window === 'undefined' || !('caches' in window)) return false;
        try {
            const cache = await caches.open('transformers-cache');
            const keys = await cache.keys();
            return keys.some(k => k.url.includes(modelId));
        } catch (e) {
            return false;
        }
    }

    public static async deleteModelCache(modelId: string): Promise<number> {
        if (typeof window === 'undefined' || !('caches' in window)) return 0;
        try {
            const cache = await caches.open('transformers-cache');
            const keys = await cache.keys();
            let deletedCount = 0;

            if (modelId === 'all') {
                for (const request of keys) {
                    await cache.delete(request);
                    deletedCount++;
                }
                return deletedCount;
            }

            for (const request of keys) {
                if (request.url.includes(modelId)) {
                    await cache.delete(request);
                    deletedCount++;
                }
            }
            return deletedCount;
        } catch (e) {
            if (DEBUG.ERRORS) console.error("Failed to delete cache", e);
            return 0;
        }
    }

    public static async clearAllModelCaches(): Promise<{ filesDeleted: number; bytesFreed: number }> {
        if (typeof window === 'undefined' || !('caches' in window)) {
            return { filesDeleted: 0, bytesFreed: 0 };
        }

        try {
            const cache = await caches.open('transformers-cache');
            const keys = await cache.keys();
            let deletedCount = 0;
            let bytesFreed = 0;

            if (DEBUG.ONNX) console.log(`[BaseService] Clearing ${keys.length} cached files...`);

            for (const request of keys) {
                try {
                    const response = await cache.match(request);
                    if (response && response.body) {
                        const blob = await response.blob();
                        bytesFreed += blob.size;
                    }
                    await cache.delete(request);
                    deletedCount++;
                } catch (e) {
                    console.warn(`[BaseService] Failed to delete ${request.url}:`, e);
                }
            }

            if (DEBUG.ONNX) console.log(`[BaseService] Cleared ${deletedCount} files, freed ${(bytesFreed / 1024 / 1024).toFixed(2)} MB`);
            return { filesDeleted: deletedCount, bytesFreed };
        } catch (e) {
            if (DEBUG.ERRORS) console.error("[BaseService] Failed to clear model caches", e);
            return { filesDeleted: 0, bytesFreed: 0 };
        }
    }

    public static cleanup(): void {
        if (DEBUG.ONNX) console.log('[BaseService] Cleaning up worker');

        if (BaseService.initializingModel !== null) {
            if (DEBUG.ONNX) console.log('[BaseService] Skipping cleanup: model is initializing');
            return;
        }

        if (BaseService.pendingRequests.size > 0) {
            if (DEBUG.ONNX) console.log(`[BaseService] Rejecting ${BaseService.pendingRequests.size} pending requests`);
            BaseService.pendingRequests.forEach((request, id) => {
                request.reject(new Error('BaseService cleanup - request cancelled'));
            });
            BaseService.pendingRequests.clear();
        }

        if (BaseService.workerInstance) {
            BaseService.workerInstance.terminate();
            BaseService.workerInstance = null;
        }
    }

    public static async clearWorkerCache(modelId?: string): Promise<void> {
        if (!BaseService.workerInstance) {
            if (DEBUG.ONNX) console.log('[BaseService] Worker not initialized, skipping cache clear');
            return;
        }
        try {
            const id = crypto.randomUUID();
            const promise = new Promise<void>((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    BaseService.pendingRequests.delete(id);
                    reject(new Error('Clear cache timeout'));
                }, 5000);
                BaseService.pendingRequests.set(id, {
                    resolve: () => {
                        clearTimeout(timeoutId);
                        BaseService.pendingRequests.delete(id);
                        resolve();
                    },
                    reject: (error: any) => {
                        clearTimeout(timeoutId);
                        BaseService.pendingRequests.delete(id);
                        reject(error);
                    },
                    onProgress: undefined
                });
            });
            BaseService.workerInstance.postMessage({
                type: 'clear_cache',
                payload: { modelId },
                id
            });
            await promise;
            if (DEBUG.ONNX) console.log(`[BaseService] Worker cache cleared for model ${modelId || 'all'}`);
        } catch (error) {
            if (DEBUG.ERRORS) console.error('[BaseService] Failed to clear worker cache:', error);
        }
    }

    // --- Context Compression ---
    protected compressContext(): void {
        if (this.historyContext.length <= this.MAX_CONTEXT_LENGTH) {
            return;
        }

        if (DEBUG.ONNX) console.log(`[Context] Compressing history: ${this.historyContext.length} → ${this.MAX_CONTEXT_LENGTH} turns`);

        const firstTurns = this.historyContext.slice(0, this.KEEP_FIRST_TURNS);
        const recentTurns = this.historyContext.slice(-this.KEEP_RECENT_TURNS);
        const middleTurns = this.historyContext.slice(
            this.KEEP_FIRST_TURNS,
            this.historyContext.length - this.KEEP_RECENT_TURNS
        );

        const middleSummary = this.summarizeMiddleTurns(middleTurns);

        this.historyContext = [
            ...firstTurns,
            middleSummary,
            ...recentTurns
        ];

        if (DEBUG.ONNX) console.log(`[Context] Compressed to ${this.historyContext.length} entries (${firstTurns.length} first + 1 summary + ${recentTurns.length} recent)`);
    }

    protected summarizeMiddleTurns(turns: string[]): string {
        const locations = new Set<string>();
        const npcs = new Set<string>();
        const items = new Set<string>();
        const actions: string[] = [];

        const locationKeywords = ['enter', 'arrive', 'travel', 'go to', 'reach', 'forest', 'cave', 'town', 'dungeon'];
        const npcKeywords = ['meet', 'talk', 'merchant', 'guard', 'wizard', 'enemy', 'friend'];
        const itemKeywords = ['find', 'take', 'get', 'pick up', 'sword', 'potion', 'key', 'treasure'];
        const actionKeywords = ['fight', 'defeat', 'escape', 'solve', 'open', 'unlock', 'buy', 'sell'];

        for (const turn of turns) {
            const lower = turn.toLowerCase();

            locationKeywords.forEach(keyword => {
                if (lower.includes(keyword)) {
                    locations.add(keyword);
                }
            });

            npcKeywords.forEach(keyword => {
                if (lower.includes(keyword)) {
                    npcs.add(keyword);
                }
            });

            itemKeywords.forEach(keyword => {
                if (lower.includes(keyword)) {
                    items.add(keyword);
                }
            });

            actionKeywords.forEach(keyword => {
                if (lower.includes(keyword)) {
                    actions.push(keyword);
                }
            });
        }

        const parts: string[] = ['[Previous events:'];
        if (locations.size > 0) {
            parts.push(`visited ${Array.from(locations).join(', ')}`);
        }
        if (npcs.size > 0) {
            parts.push(`met ${Array.from(npcs).join(', ')}`);
        }
        if (items.size > 0) {
            parts.push(`found ${Array.from(items).join(', ')}`);
        }
        if (actions.length > 0) {
            const uniqueActions = [...new Set(actions)];
            parts.push(`${uniqueActions.join(', ')}`);
        }
        parts.push(']');

        return parts.join(' ');
    }

    protected getCompressedContext(): string {
        this.compressContext();
        return this.historyContext.join(' ');
    }

    // --- CEFR Adaptation ---
    protected updateCEFRLevel(checkResult: { hadErrors: boolean; errorDetails: any[]; confidence: number }): void {
        const totalWords = checkResult.errorDetails.length > 0 ? 10 : 5;
        const errorCount = checkResult.errorDetails.length;
        this.performanceMetrics.errorRate = errorCount / Math.max(totalWords, 1);
        this.performanceMetrics.averageConfidence = checkResult.confidence;
        this.performanceMetrics.turnsAtCurrentLevel++;

        if (!checkResult.hadErrors && checkResult.confidence > 0.9) {
            this.performanceMetrics.consecutivePerfectTurns++;
        } else {
            this.performanceMetrics.consecutivePerfectTurns = 0;
        }

        if (this.performanceMetrics.turnsAtCurrentLevel >= 5) {
            this.adjustCEFRLevel();
            this.performanceMetrics.turnsAtCurrentLevel = 0;
        }
    }

    protected adjustCEFRLevel(): void {
        const { errorRate, averageConfidence, consecutivePerfectTurns } = this.performanceMetrics;
        const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levels.indexOf(this.currentCEFRLevel);
        let newLevel = this.currentCEFRLevel;

        if (consecutivePerfectTurns >= 3 && errorRate < 0.1 && averageConfidence > 0.85) {
            if (currentIndex < levels.length - 1) {
                newLevel = levels[currentIndex + 1];
                if (DEBUG.ONNX) console.log(`[CEFR] Level UP: ${this.currentCEFRLevel} → ${newLevel} (${consecutivePerfectTurns} perfect turns)`);
            }
        } else if (errorRate > 0.4 || averageConfidence < 0.5) {
            if (currentIndex > 0) {
                newLevel = levels[currentIndex - 1];
                if (DEBUG.ONNX) console.log(`[CEFR] Level DOWN: ${this.currentCEFRLevel} → ${newLevel} (error rate: ${(errorRate * 100).toFixed(0)}%)`);
            }
        }

        if (newLevel !== this.currentCEFRLevel) {
            this.currentCEFRLevel = newLevel;
            this.inputChecker.updateCEFRLevel(this.currentCEFRLevel);
            this.performanceMetrics.consecutivePerfectTurns = 0;
        }

        if (DEBUG.ONNX) console.log('[CEFR] Performance:', {
            level: this.currentCEFRLevel,
            errorRate: `${(errorRate * 100).toFixed(1)}%`,
            confidence: averageConfidence.toFixed(2),
            perfectTurns: consecutivePerfectTurns
        });
    }

    public getCurrentCEFRLevel(): CEFRLevel {
        return this.currentCEFRLevel;
    }

    // --- Common Game Methods ---
    protected getBiomeForTheme(theme: string): string {
        switch (theme) {
            case 'scifi': return 'cyber_city';
            case 'horror': return 'graveyard';
            case 'western': return 'canyon';
            case 'cyberpunk': return 'cyber_city';
            case 'mystery': return 'interior';
            default: return 'forest';
        }
    }

    protected createFallbackState(error: any): GameTurnData {
        return {
            narrative: `Neural link error: ${error.message}`,
            nativeTranslation: "Error",
            sceneData: { biome: 'dungeon', features: [], entities: [], timeOfDay: 'night' },
            playerOptions: ["Retry"],
            inventory: [],
            health: 100,
            locationName: "ERROR",
            feedback: ""
        };
    }

    // --- Abstract Methods ---
    public abstract initGame(onProgress?: (p: number, t: string, loaded?: number, total?: number) => void): Promise<any>;
    public abstract processTurn(input: string, context?: any, skipInputCheck?: boolean): Promise<any>;
}
