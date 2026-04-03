/**
 * Global Configuration for Penko
 *
 * DEBUG FLAGS:
 * Set to true to enable console logging for specific modules.
 * Keep false in production to maximize performance.
 *
 * PERFORMANCE IMPACT:
 * - Each console.log blocks the main thread
 * - Console buffer accumulates memory (especially Firefox)
 * - 94+ console statements were causing UI freezes and memory leaks
 *
 * USAGE:
 * import { DEBUG } from './config';
 * if (DEBUG.ONNX) console.log('[ONNX] ...');
 */

export const DEBUG = {
    // ONNX Model & Worker (services/onnx/worker.ts, services/OnnxService.ts)
    ONNX: false,  // DISABLED for production - Firefox console memory leak

    // Translation Engine (services/CustomTranslationEngine.ts)
    TRANSLATION: false,

    // Input Checker (services/InputChecker.ts)
    INPUT_CHECKER: false,

    // Dictionary & Morphology (services/DictionaryManager.ts, services/MorphologyEngine.ts)
    DICTIONARY: false,

    // General/Misc logging
    GENERAL: false,

    // Ollama Engine logging
    OLLAMA: true,

    // Keep errors always visible (critical issues)
    ERRORS: true,

    // Model loading progress (only log every 10% to reduce spam)
    PROGRESS_VERBOSE: false
};

/**
 * Model Configuration
 */
export const MODEL_CONFIG = {
    // Default model if none specified (fallback)
    DEFAULT_MODEL_ID: 'onnx-community/Qwen3.5-0.8B-ONNX',

    // Max tokens by model size (prevents CPU overload)
    MAX_TOKENS: {
        SMALL: 150,   // < 1GB (Qwen 0.5B, LaMini)
        MEDIUM: 200,  // 1-2GB (Qwen 1.5B)
        LARGE: 250    // > 2GB (Qwen 2.2B+)
    },

    // Translation cache limits (prevents memory leaks)
    TRANSLATION_CACHE_MAX_SIZE: 1000,

    // Worker restart interval (clear memory every N generations)
    WORKER_RESTART_INTERVAL: 100
};

/**
 * Performance Tuning
 */
export const PERFORMANCE = {
    // Enable aggressive tensor cleanup
    CLEANUP_TENSORS: true,

    // Enable cache eviction
    ENABLE_CACHE_LIMITS: true,

    // Periodic worker restart
    AUTO_RESTART_WORKER: false // Disable for now (experimental)
};
