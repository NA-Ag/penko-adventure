/**
 * Dictionary Service - Layered Lookup Architecture
 *
 * This service implements a "waterfall" dictionary lookup system that queries
 * dictionaries in a specific priority order:
 *
 * 1. Content Pack Dictionary (Layer 1) - Story-specific words (highest priority)
 * 2. Core Language Dictionary (Layer 2) - ~5000 most common words per language
 * 3. External API Fallback (Layer 3) - Optional Wiktionary API (online only)
 *
 * Philosophy:
 * Instead of trying to build a complete dictionary of an entire language, we
 * prioritize accuracy for story-critical words while providing broad coverage
 * for common language through the core dictionary and external APIs.
 *
 * This design ensures robust handling of unexpected player input, making the
 * system suitable for user-generated content and creative players.
 */

import { Language } from '../types';
import { ExternalDictionaryService } from './ExternalDictionaryService';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'pronoun'
  | 'article'
  | 'unknown';

export interface DictionaryEntry {
  objectId: string | null; // Language-agnostic ID (e.g., "ID_MANOR")
  partOfSpeech: PartOfSpeech;
  word: string; // The original word that was looked up
  source: 'content_pack' | 'core' | 'external' | 'not_found';
  definition?: string; // Optional definition from external API
}

export interface DictionaryServiceConfig {
  contentPackId?: string; // ID of currently loaded content pack
  enableExternalFallback?: boolean; // Enable Wiktionary API (default: true)
  cacheExternalResults?: boolean; // Cache external lookups (default: true)
  debugMode?: boolean; // Log detailed lookup information
}

/**
 * Maps Language enum to ISO 639-1 language codes
 */
const LANGUAGE_CODE_MAP: Record<Language, string> = {
  [Language.ENGLISH]: 'en',
  [Language.SPANISH]: 'es',
  [Language.FRENCH]: 'fr',
  [Language.GERMAN]: 'de',
  [Language.ITALIAN]: 'it',
  [Language.JAPANESE]: 'ja',
  [Language.MANDARIN]: 'zh',
  [Language.RUSSIAN]: 'ru',
  [Language.PORTUGUESE]: 'pt',
  [Language.UKRAINIAN]: 'uk',
  [Language.POLISH]: 'pl',
  [Language.CZECH]: 'cs',
};

export class DictionaryService {
  private config: DictionaryServiceConfig;

  // Layer 1: Content Pack Dictionary (in-memory, fastest)
  private contentPackDictionary: Map<string, DictionaryEntry> = new Map();

  // Layer 2: Core Dictionary (in-memory, larger)
  private coreDictionary: Map<string, DictionaryEntry> = new Map();

  // Layer 3: External API cache (optional)
  private externalCache: Map<string, DictionaryEntry> = new Map();
  private externalService?: ExternalDictionaryService;

  // Statistics
  private stats = {
    totalLookups: 0,
    contentPackHits: 0,
    coreHits: 0,
    externalHits: 0,
    notFound: 0,
  };

  constructor(config: DictionaryServiceConfig = {}) {
    this.config = {
      enableExternalFallback: config.enableExternalFallback ?? true,
      cacheExternalResults: config.cacheExternalResults ?? true,
      debugMode: config.debugMode ?? false,
      ...config,
    };

    // Initialize external service if enabled
    if (this.config.enableExternalFallback) {
      this.externalService = new ExternalDictionaryService({
        debugMode: this.config.debugMode,
      });
    }

    console.log('[DictionaryService] Initialized with layered lookup');
    console.log(`[DictionaryService] External fallback: ${this.config.enableExternalFallback}`);
  }

  // ============================================================================
  // LAYER LOADING
  // ============================================================================

  /**
   * Load Layer 1: Content Pack Dictionary
   * This should be called when a new story/adventure is loaded
   */
  async loadContentPackDictionary(
    language: Language,
    contentPackId: string
  ): Promise<void> {
    this.config.contentPackId = contentPackId;
    this.contentPackDictionary.clear();

    try {
      const languageCode = LANGUAGE_CODE_MAP[language];
      const path = `/public/dictionaries/content-packs/${contentPackId}/${languageCode}.json`;

      const response = await fetch(path);
      if (!response.ok) {
        console.warn(
          `[DictionaryService] Content pack dictionary not found: ${path}`
        );
        return;
      }

      const data = await response.json();

      // Convert to map for fast lookup
      // Expected format: { "word": { "objectId": "ID_MANOR", "partOfSpeech": "noun" }, ... }
      for (const [word, entry] of Object.entries(data)) {
        this.contentPackDictionary.set(word.toLowerCase(), {
          word,
          objectId: (entry as any).objectId,
          partOfSpeech: (entry as any).partOfSpeech || 'noun',
          source: 'content_pack',
        });
      }

      console.log(
        `[DictionaryService] Loaded content pack dictionary: ${this.contentPackDictionary.size} words`
      );
    } catch (error) {
      console.error(
        '[DictionaryService] Error loading content pack dictionary:',
        error
      );
    }
  }

  /**
   * Load Layer 2: Core Language Dictionary
   * This should be called once per language session
   */
  async loadCoreDictionary(language: Language): Promise<void> {
    this.coreDictionary.clear();

    try {
      const languageCode = LANGUAGE_CODE_MAP[language];
      const path = `/public/dictionaries/core/${languageCode}_core.json`;

      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`[DictionaryService] Core dictionary not found: ${path}`);
        return;
      }

      const data = await response.json();

      // Convert to map for fast lookup
      // Expected format: { "word": { "partOfSpeech": "noun", "frequency": 1234 }, ... }
      for (const [word, entry] of Object.entries(data)) {
        this.coreDictionary.set(word.toLowerCase(), {
          word,
          objectId: null, // Core dictionary doesn't map to game objects
          partOfSpeech: (entry as any).partOfSpeech || 'unknown',
          source: 'core',
        });
      }

      console.log(
        `[DictionaryService] Loaded core dictionary: ${this.coreDictionary.size} words`
      );
    } catch (error) {
      console.error('[DictionaryService] Error loading core dictionary:', error);
    }
  }

  // ============================================================================
  // MAIN LOOKUP METHOD
  // ============================================================================

  /**
   * Lookup a word using the layered waterfall approach
   *
   * @param word - The word to look up
   * @param language - The language of the word
   * @returns A DictionaryEntry with lookup results
   */
  async lookupWord(word: string, language: Language): Promise<DictionaryEntry> {
    this.stats.totalLookups++;

    const normalizedWord = word.toLowerCase().trim();

    if (this.config.debugMode) {
      console.log(`[DictionaryService] Looking up: "${normalizedWord}"`);
    }

    // Layer 1: Content Pack Dictionary (highest priority)
    const contentPackResult = this.contentPackDictionary.get(normalizedWord);
    if (contentPackResult) {
      this.stats.contentPackHits++;
      if (this.config.debugMode) {
        console.log(
          `[DictionaryService] ✓ Found in content pack: ${contentPackResult.objectId}`
        );
      }
      return contentPackResult;
    }

    // Layer 2: Core Dictionary
    const coreResult = this.coreDictionary.get(normalizedWord);
    if (coreResult) {
      this.stats.coreHits++;
      if (this.config.debugMode) {
        console.log(
          `[DictionaryService] ✓ Found in core dictionary: ${coreResult.partOfSpeech}`
        );
      }
      return coreResult;
    }

    // Layer 3: External API Fallback (optional)
    if (this.config.enableExternalFallback) {
      // Check cache first
      const cachedResult = this.externalCache.get(normalizedWord);
      if (cachedResult) {
        this.stats.externalHits++;
        if (this.config.debugMode) {
          console.log('[DictionaryService] ✓ Found in external cache');
        }
        return cachedResult;
      }

      // Query external API
      const externalResult = await this.queryExternalAPI(normalizedWord, language);
      if (externalResult.objectId !== null || externalResult.partOfSpeech !== 'unknown') {
        this.stats.externalHits++;

        // Cache result if enabled
        if (this.config.cacheExternalResults) {
          this.externalCache.set(normalizedWord, externalResult);
        }

        if (this.config.debugMode) {
          console.log('[DictionaryService] ✓ Found via external API');
        }
        return externalResult;
      }
    }

    // Not found in any layer
    this.stats.notFound++;
    if (this.config.debugMode) {
      console.log('[DictionaryService] ✗ Word not found in any layer');
    }

    return {
      word: normalizedWord,
      objectId: null,
      partOfSpeech: 'unknown',
      source: 'not_found',
    };
  }

  /**
   * Batch lookup multiple words (optimized)
   */
  async lookupWords(words: string[], language: Language): Promise<DictionaryEntry[]> {
    return Promise.all(words.map((word) => this.lookupWord(word, language)));
  }

  // ============================================================================
  // EXTERNAL API INTEGRATION (LAYER 3)
  // ============================================================================

  /**
   * Query external dictionary API (Wiktionary)
   */
  private async queryExternalAPI(
    word: string,
    language: Language
  ): Promise<DictionaryEntry> {
    if (!this.externalService) {
      return {
        word,
        objectId: null,
        partOfSpeech: 'unknown',
        source: 'external',
      };
    }

    try {
      const wiktionaryResult = await this.externalService.lookupWord(word, language);

      if (wiktionaryResult.found && wiktionaryResult.definitions.length > 0) {
        // Use the first definition's part-of-speech
        const firstDef = wiktionaryResult.definitions[0];

        return {
          word,
          objectId: null, // External lookups don't map to game objects
          partOfSpeech: firstDef.partOfSpeech,
          source: 'external',
          definition: firstDef.definitions[0], // Include first definition
        };
      }
    } catch (error) {
      console.error('[DictionaryService] External API query failed:', error);
    }

    return {
      word,
      objectId: null,
      partOfSpeech: 'unknown',
      source: 'external',
    };
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get lookup statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Clear all caches and reset
   */
  reset(): void {
    this.contentPackDictionary.clear();
    this.coreDictionary.clear();
    this.externalCache.clear();

    this.stats = {
      totalLookups: 0,
      contentPackHits: 0,
      coreHits: 0,
      externalHits: 0,
      notFound: 0,
    };

    console.log('[DictionaryService] All dictionaries cleared');
  }

  /**
   * Debug: Print current state
   */
  debugPrintState(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('DICTIONARY SERVICE STATE');
    console.log('='.repeat(70));
    console.log(`Content Pack ID: ${this.config.contentPackId || 'None'}`);
    console.log(`Content Pack Dictionary: ${this.contentPackDictionary.size} words`);
    console.log(`Core Dictionary: ${this.coreDictionary.size} words`);
    console.log(`External Cache: ${this.externalCache.size} words`);
    console.log('');
    console.log('STATISTICS:');
    console.log(`  Total lookups: ${this.stats.totalLookups}`);
    console.log(`  Content pack hits: ${this.stats.contentPackHits}`);
    console.log(`  Core hits: ${this.stats.coreHits}`);
    console.log(`  External hits: ${this.stats.externalHits}`);
    console.log(`  Not found: ${this.stats.notFound}`);
    console.log('');

    if (this.stats.totalLookups > 0) {
      const contentPackRate =
        (this.stats.contentPackHits / this.stats.totalLookups) * 100;
      const coreRate = (this.stats.coreHits / this.stats.totalLookups) * 100;
      const externalRate = (this.stats.externalHits / this.stats.totalLookups) * 100;
      const notFoundRate = (this.stats.notFound / this.stats.totalLookups) * 100;

      console.log('HIT RATES:');
      console.log(`  Content pack: ${contentPackRate.toFixed(1)}%`);
      console.log(`  Core: ${coreRate.toFixed(1)}%`);
      console.log(`  External: ${externalRate.toFixed(1)}%`);
      console.log(`  Not found: ${notFoundRate.toFixed(1)}%`);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('');
  }

  /**
   * Get current configuration
   */
  getConfig(): DictionaryServiceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(newConfig: Partial<DictionaryServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[DictionaryService] Configuration updated');
  }
}
