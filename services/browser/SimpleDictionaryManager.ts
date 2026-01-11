/**
 * SimpleDictionaryManager - Direct TypeScript dictionary imports
 *
 * This replaces the complex StarDict binary format with simple, pre-bundled
 * TypeScript modules containing complete dictionaries.
 *
 * Benefits:
 * - Zero runtime parsing complexity
 * - Instant availability (no downloads or decompression)
 * - Complete dictionaries (not limited to A1-B2)
 * - Infinitely reliable (compiled into code)
 * - Type-safe with TypeScript
 * - Leverages Vite's code-splitting for lazy loading
 */

export type DictionaryCode =
  | 'en-es' // English-Spanish
  | 'en-fr' // English-French
  | 'fr-en' // French-English
  | 'en-it' // English-Italian
  | 'en-pt' // English-Portuguese
  | 'en-de' // English-German
  | 'en-ru' // English-Russian
  | 'en-pl' // English-Polish
  | 'en-cs' // English-Czech
  | 'en-uk' // English-Ukrainian
  | 'en-ja' // English-Japanese
  | 'en-zh'; // English-Chinese (Mandarin)

/**
 * Language pair to dictionary code mapping
 */
const LANGUAGE_PAIR_MAP: Record<string, DictionaryCode> = {
  // English -> Target Language
  'en-es': 'en-es',
  'en-fr': 'en-fr',
  'en-it': 'en-it',
  'en-pt': 'en-pt',
  'en-de': 'en-de',
  'en-ru': 'en-ru',
  'en-pl': 'en-pl',
  'en-cs': 'en-cs',
  'en-uk': 'en-uk',
  'en-ja': 'en-ja',
  'en-zh': 'en-zh',

  // Target Language -> English (reverse lookups)
  'es-en': 'en-es', // Will reverse lookup
  'fr-en': 'fr-en', // Has dedicated dictionary
  'it-en': 'en-it',
  'pt-en': 'en-pt',
  'de-en': 'en-de',
  'ru-en': 'en-ru',
  'pl-en': 'en-pl',
  'cs-en': 'en-cs',
  'uk-en': 'en-uk',
  'ja-en': 'en-ja',
  'zh-en': 'en-zh',
};

/**
 * SimpleDictionaryManager - Manages pre-bundled TypeScript dictionaries
 */
export class SimpleDictionaryManager {
  private loadedDictionaries: Map<DictionaryCode, Map<string, string>> = new Map();
  private loadingPromises: Map<DictionaryCode, Promise<Map<string, string>>> = new Map();

  /**
   * Load a dictionary dynamically (lazy loading via Vite code-splitting)
   */
  private async loadDictionary(code: DictionaryCode): Promise<Map<string, string>> {
    // Return if already loaded
    if (this.loadedDictionaries.has(code)) {
      return this.loadedDictionaries.get(code)!;
    }

    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(code)) {
      return this.loadingPromises.get(code)!;
    }

    // Start loading
    const loadingPromise = (async () => {
      console.log(`[SimpleDictionaryManager] Loading dictionary: ${code}`);
      const startTime = performance.now();

      try {
        // Dynamic import with Vite code-splitting
        let dictionary: Map<string, string>;

        switch (code) {
          case 'en-es':
            dictionary = (await import('../../src/data/dictionaries/en-es.dict.ts')).default;
            break;
          case 'en-fr':
            dictionary = (await import('../../src/data/dictionaries/en-fr.dict.ts')).default;
            break;
          case 'fr-en':
            dictionary = (await import('../../src/data/dictionaries/fr-en.dict.ts')).default;
            break;
          case 'en-it':
            dictionary = (await import('../../src/data/dictionaries/en-it.dict.ts')).default;
            break;
          case 'en-pt':
            dictionary = (await import('../../src/data/dictionaries/en-pt.dict.ts')).default;
            break;
          case 'en-de':
            dictionary = (await import('../../src/data/dictionaries/en-de.dict.ts')).default;
            break;
          case 'en-ru':
            dictionary = (await import('../../src/data/dictionaries/en-ru.dict.ts')).default;
            break;
          case 'en-pl':
            dictionary = (await import('../../src/data/dictionaries/en-pl.dict.ts')).default;
            break;
          case 'en-cs':
            dictionary = (await import('../../src/data/dictionaries/en-cs.dict.ts')).default;
            break;
          case 'en-uk':
            dictionary = (await import('../../src/data/dictionaries/en-uk.dict.ts')).default;
            break;
          case 'en-ja':
            dictionary = (await import('../../src/data/dictionaries/en-ja.dict.ts')).default;
            break;
          case 'en-zh':
            dictionary = (await import('../../src/data/dictionaries/en-zh.dict.ts')).default;
            break;
          default:
            throw new Error(`Unknown dictionary code: ${code}`);
        }

        const loadTime = performance.now() - startTime;
        console.log(`[SimpleDictionaryManager] ✅ Loaded ${code} in ${loadTime.toFixed(2)}ms (${dictionary.size} entries)`);

        this.loadedDictionaries.set(code, dictionary);
        this.loadingPromises.delete(code);

        return dictionary;
      } catch (error) {
        console.error(`[SimpleDictionaryManager] Failed to load ${code}:`, error);
        this.loadingPromises.delete(code);
        throw error;
      }
    })();

    this.loadingPromises.set(code, loadingPromise);
    return loadingPromise;
  }

  /**
   * Translate a word from source language to target language
   */
  async translate(
    word: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string | null> {
    // Normalize word to lowercase for lookup
    const normalizedWord = word.toLowerCase().trim();

    // Get dictionary code for this language pair
    const pairCode = `${sourceLang}-${targetLang}`;
    const dictCode = LANGUAGE_PAIR_MAP[pairCode];

    if (!dictCode) {
      console.warn(`[SimpleDictionaryManager] No dictionary available for ${pairCode}`);
      return null;
    }

    try {
      // Load dictionary
      const dictionary = await this.loadDictionary(dictCode);

      // Direct lookup
      const translation = dictionary.get(normalizedWord);

      if (translation) {
        // Clean up the translation (remove HTML tags that might remain)
        const cleanTranslation = translation
          .replace(/<[^>]+>/g, '') // Remove HTML tags
          .replace(/div>/g, '')     // Remove stray div>
          .split(';')[0]            // Take first definition if multiple
          .trim();

        return cleanTranslation || null;
      }

      // No translation found
      return null;
    } catch (error) {
      console.error(`[SimpleDictionaryManager] Translation failed:`, error);
      return null;
    }
  }

  /**
   * Check if a word exists in the dictionary
   */
  async hasWord(
    word: string,
    sourceLang: string,
    targetLang: string
  ): Promise<boolean> {
    const translation = await this.translate(word, sourceLang, targetLang);
    return translation !== null;
  }

  /**
   * Get dictionary size (number of entries)
   */
  async getDictionarySize(code: DictionaryCode): Promise<number> {
    const dictionary = await this.loadDictionary(code);
    return dictionary.size;
  }

  /**
   * Preload a dictionary (for performance optimization)
   */
  async preloadDictionary(sourceLang: string, targetLang: string): Promise<void> {
    const pairCode = `${sourceLang}-${targetLang}`;
    const dictCode = LANGUAGE_PAIR_MAP[pairCode];

    if (dictCode) {
      await this.loadDictionary(dictCode);
    }
  }

  /**
   * Preload multiple dictionaries
   */
  async preloadDictionaries(languagePairs: Array<{ source: string; target: string }>): Promise<void> {
    const promises = languagePairs.map(({ source, target }) =>
      this.preloadDictionary(source, target).catch(err =>
        console.error(`Failed to preload ${source}-${target}:`, err)
      )
    );

    await Promise.all(promises);
  }

  /**
   * Get loading status for all dictionaries
   */
  getLoadedDictionaries(): DictionaryCode[] {
    return Array.from(this.loadedDictionaries.keys());
  }

  /**
   * Clear loaded dictionaries to free memory (if needed)
   */
  clearDictionaries(): void {
    this.loadedDictionaries.clear();
    console.log('[SimpleDictionaryManager] All dictionaries cleared from memory');
  }
}

// Singleton instance
export const simpleDictionaryManager = new SimpleDictionaryManager();
