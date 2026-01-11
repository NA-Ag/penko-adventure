/**
 * Browser AI Optimizations - Export all modules
 *
 * 5 Independent optimization strategies for Browser AI mode:
 *
 * 1. BrowserPreGenerator - Predictive caching (instant responses)
 * 2. BrowserVocabularyManager - Constrained vocabulary (3-5x faster)
 * 3. BrowserStructuredOutput - JSON schema constraints (3-5x faster)
 * 4. BrowserContextCompressor - Aggressive compression (5 turns vs 15)
 * 5. BrowserBatchGenerator - Batch generation (3 turns at once)
 *
 * OptimizedBrowserService - Main service combining all 5 strategies
 */

export { BrowserPreGenerator } from './BrowserPreGenerator';
export { BrowserVocabularyManager } from './BrowserVocabularyManager';
export { BrowserStructuredOutput } from './BrowserStructuredOutput';
export { BrowserContextCompressor } from './BrowserContextCompressor';
export { BrowserBatchGenerator } from './BrowserBatchGenerator';
export { OptimizedBrowserService } from './OptimizedBrowserService';

export type { PreGeneratedBranch, GenerationRequest } from './BrowserPreGenerator';
export type { VocabularyLevel } from './BrowserVocabularyManager';
export type { CompressedContext } from './BrowserContextCompressor';
export type { BatchedTurn, GenerationBatch } from './BrowserBatchGenerator';
