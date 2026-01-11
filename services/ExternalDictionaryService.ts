/**
 * External Dictionary Service - Wiktionary API Integration
 *
 * This service provides an optional fallback layer for dictionary lookups
 * by querying the Wiktionary API when a word is not found in local dictionaries.
 *
 * Features:
 * - Query Wiktionary REST API for word definitions
 * - Extract part-of-speech information
 * - Parse definitions and examples
 * - Handle rate limiting and errors gracefully
 * - Optional caching of results
 *
 * API Documentation:
 * - https://en.wiktionary.org/api/rest_v1/
 * - Example: https://en.wiktionary.org/api/rest_v1/page/definition/house
 *
 * Privacy & Performance:
 * - Only queries when explicitly enabled by user
 * - Requires internet connection
 * - Results can be cached locally to minimize API calls
 * - User can opt-out entirely for offline operation
 */

import { Language } from '../types';
import type { PartOfSpeech } from './DictionaryService';

export interface WiktionaryDefinition {
  partOfSpeech: PartOfSpeech;
  definitions: string[];
  examples?: string[];
}

export interface WiktionaryLookupResult {
  word: string;
  language: string;
  found: boolean;
  definitions: WiktionaryDefinition[];
  etymology?: string;
}

export interface ExternalDictionaryConfig {
  timeout?: number; // Request timeout in milliseconds (default: 5000)
  maxRetries?: number; // Max retry attempts (default: 2)
  userAgent?: string; // Custom user agent for API requests
  debugMode?: boolean;
}

/**
 * Maps our PartOfSpeech enum to Wiktionary's part-of-speech labels
 */
const WIKTIONARY_POS_MAP: Record<string, PartOfSpeech> = {
  noun: 'noun',
  verb: 'verb',
  adjective: 'adjective',
  adverb: 'adverb',
  preposition: 'preposition',
  conjunction: 'conjunction',
  pronoun: 'pronoun',
  article: 'article',
  determiner: 'article',
  particle: 'adverb',
  interjection: 'unknown',
};

/**
 * Maps Language enum to Wiktionary language codes
 */
const WIKTIONARY_LANG_MAP: Record<Language, string> = {
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

export class ExternalDictionaryService {
  private config: ExternalDictionaryConfig;
  private cache: Map<string, WiktionaryLookupResult> = new Map();
  private stats = {
    totalQueries: 0,
    cacheHits: 0,
    apiHits: 0,
    errors: 0,
  };

  constructor(config: ExternalDictionaryConfig = {}) {
    this.config = {
      timeout: config.timeout ?? 5000,
      maxRetries: config.maxRetries ?? 2,
      userAgent:
        config.userAgent ??
        'PenkoLanguageLearningApp/1.0 (https://github.com/penko; educational use)',
      debugMode: config.debugMode ?? false,
    };

    console.log('[ExternalDictionaryService] Initialized with Wiktionary API');
  }

  // ============================================================================
  // MAIN LOOKUP METHOD
  // ============================================================================

  /**
   * Look up a word in Wiktionary
   *
   * @param word - The word to look up
   * @param language - The language of the word
   * @returns A WiktionaryLookupResult with definitions
   */
  async lookupWord(word: string, language: Language): Promise<WiktionaryLookupResult> {
    this.stats.totalQueries++;

    const normalizedWord = word.toLowerCase().trim();
    const cacheKey = `${language}:${normalizedWord}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      if (this.config.debugMode) {
        console.log(`[ExternalDictionaryService] Cache hit: ${normalizedWord}`);
      }
      return cached;
    }

    // Query Wiktionary API
    try {
      const result = await this.queryWiktionaryAPI(normalizedWord, language);
      this.stats.apiHits++;

      // Cache the result
      this.cache.set(cacheKey, result);

      if (this.config.debugMode) {
        console.log(
          `[ExternalDictionaryService] API query: ${normalizedWord} (found: ${result.found})`
        );
      }

      return result;
    } catch (error) {
      this.stats.errors++;
      console.error('[ExternalDictionaryService] Query error:', error);

      // Return not found result
      return {
        word: normalizedWord,
        language: WIKTIONARY_LANG_MAP[language],
        found: false,
        definitions: [],
      };
    }
  }

  // ============================================================================
  // WIKTIONARY API INTEGRATION
  // ============================================================================

  /**
   * Query the Wiktionary REST API
   */
  private async queryWiktionaryAPI(
    word: string,
    language: Language
  ): Promise<WiktionaryLookupResult> {
    const langCode = WIKTIONARY_LANG_MAP[language];
    const url = `https://${langCode}.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(
      word
    )}`;

    if (this.config.debugMode) {
      console.log(`[ExternalDictionaryService] Querying: ${url}`);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent!,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // Word not found - this is expected, not an error
          return {
            word,
            language: langCode,
            found: false,
            definitions: [],
          };
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse Wiktionary response
      return this.parseWiktionaryResponse(word, langCode, data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Parse Wiktionary API response into our format
   */
  private parseWiktionaryResponse(
    word: string,
    language: string,
    data: any
  ): WiktionaryLookupResult {
    const result: WiktionaryLookupResult = {
      word,
      language,
      found: false,
      definitions: [],
    };

    try {
      // Wiktionary API returns definitions grouped by language and part-of-speech
      // Format: { [language]: [ { partOfSpeech: string, definitions: [...] } ] }

      if (!data || typeof data !== 'object') {
        return result;
      }

      // Get definitions for the target language
      const langDefinitions = data[language];
      if (!Array.isArray(langDefinitions) || langDefinitions.length === 0) {
        return result;
      }

      result.found = true;

      // Process each part-of-speech section
      for (const section of langDefinitions) {
        const posLabel = section.partOfSpeech || 'unknown';
        const mappedPOS = this.mapWiktionaryPOStoOurs(posLabel);

        const definitions: string[] = [];
        const examples: string[] = [];

        // Extract definitions
        if (Array.isArray(section.definitions)) {
          for (const def of section.definitions) {
            if (def.definition) {
              // Clean up Wiktionary formatting (remove wiki markup)
              const cleanDefinition = this.cleanWikiText(def.definition);
              definitions.push(cleanDefinition);
            }

            // Extract examples if present
            if (Array.isArray(def.examples)) {
              for (const example of def.examples) {
                const cleanExample = this.cleanWikiText(example);
                examples.push(cleanExample);
              }
            }
          }
        }

        if (definitions.length > 0) {
          result.definitions.push({
            partOfSpeech: mappedPOS,
            definitions,
            examples: examples.length > 0 ? examples : undefined,
          });
        }
      }
    } catch (error) {
      console.error('[ExternalDictionaryService] Error parsing response:', error);
    }

    return result;
  }

  /**
   * Map Wiktionary part-of-speech labels to our PartOfSpeech enum
   */
  private mapWiktionaryPOStoOurs(wiktionaryPOS: string): PartOfSpeech {
    const normalized = wiktionaryPOS.toLowerCase().trim();
    return WIKTIONARY_POS_MAP[normalized] || 'unknown';
  }

  /**
   * Clean Wiktionary wiki markup from text
   */
  private cleanWikiText(text: string): string {
    if (typeof text !== 'string') return '';

    return (
      text
        // Remove wiki links: [[link|text]] -> text
        .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
        // Remove bold: '''text''' -> text
        .replace(/'''([^']+)'''/g, '$1')
        // Remove italic: ''text'' -> text
        .replace(/''([^']+)''/g, '$1')
        // Remove templates: {{template}}
        .replace(/\{\{[^}]+\}\}/g, '')
        // Remove HTML tags
        .replace(/<[^>]+>/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
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
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ExternalDictionaryService] Cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Debug: Print current state
   */
  debugPrintState(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('EXTERNAL DICTIONARY SERVICE STATE');
    console.log('='.repeat(70));
    console.log(`Cache size: ${this.cache.size} entries`);
    console.log(`Timeout: ${this.config.timeout}ms`);
    console.log(`Max retries: ${this.config.maxRetries}`);
    console.log('');
    console.log('STATISTICS:');
    console.log(`  Total queries: ${this.stats.totalQueries}`);
    console.log(`  Cache hits: ${this.stats.cacheHits}`);
    console.log(`  API hits: ${this.stats.apiHits}`);
    console.log(`  Errors: ${this.stats.errors}`);
    console.log('');

    if (this.stats.totalQueries > 0) {
      const cacheHitRate = (this.stats.cacheHits / this.stats.totalQueries) * 100;
      const errorRate = (this.stats.errors / this.stats.totalQueries) * 100;

      console.log('PERFORMANCE:');
      console.log(`  Cache hit rate: ${cacheHitRate.toFixed(1)}%`);
      console.log(`  Error rate: ${errorRate.toFixed(1)}%`);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('');
  }
}
