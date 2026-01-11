/**
 * DictionaryManager - Handles loading and lookup of offline dictionaries
 *
 * TIER 12 IMPLEMENTATION: Uses binary dictionaries with msgpack + gzip
 * - 67% smaller file sizes compared to JSON
 * - Fast msgpack decoding
 * - Bundled by Vite for reliable offline functionality
 */

import { Language } from '../../types';
import { DEBUG } from '../../config';
import { loadBinaryDictionary } from './BinaryDictionaryLoader';

// Import all binary dictionaries using Vite's glob import
// TIER 12: Uses optimized .pbd.gz format for 67% size reduction
const dictionaryModules = import.meta.glob('../../src/assets/dictionaries-bin/*.pbd.gz', {
    eager: false,
    query: '?url',
    import: 'default'
}) as Record<string, () => Promise<string>>;

interface DictionaryMetadata {
    langPair: string;
    name: string;
    wordcount: number;
    version: string;
    available: boolean;
}

export class DictionaryManager {
    private static instance: DictionaryManager;
    private dictionaries = new Map<string, Record<string, string>>();

    // Dictionary metadata
    public static readonly LANGUAGE_NAMES: Record<Language, { name: string; flag: string; code: string }> = {
        [Language.ENGLISH]: { name: 'English', flag: '🇬🇧', code: 'en' },
        [Language.SPANISH]: { name: 'Spanish', flag: '🇪🇸', code: 'es' },
        [Language.FRENCH]: { name: 'French', flag: '🇫🇷', code: 'fr' },
        [Language.JAPANESE]: { name: 'Japanese', flag: '🇯🇵', code: 'ja' },
        [Language.GERMAN]: { name: 'German', flag: '🇩🇪', code: 'de' },
        [Language.ITALIAN]: { name: 'Italian', flag: '🇮🇹', code: 'it' },
        [Language.PORTUGUESE]: { name: 'Portuguese', flag: '🇵🇹', code: 'pt' },
        [Language.RUSSIAN]: { name: 'Russian', flag: '🇷🇺', code: 'ru' },
        [Language.POLISH]: { name: 'Polish', flag: '🇵🇱', code: 'pl' },
        [Language.CZECH]: { name: 'Czech', flag: '🇨🇿', code: 'cs' },
        [Language.MANDARIN]: { name: 'Mandarin', flag: '🇨🇳', code: 'zh' },
        [Language.UKRAINIAN]: { name: 'Ukrainian', flag: '🇺🇦', code: 'uk' }
    };

    // Available dictionaries - ALL 12 LANGUAGES BUNDLED
    private static DICTIONARIES: Record<string, DictionaryMetadata> = {
        'en-es': {
            langPair: 'en-es',
            name: 'English-Spanish',
            wordcount: 44625,
            version: '2024.10.10',
            available: true
        },
        'en-fr': {
            langPair: 'en-fr',
            name: 'English-French',
            wordcount: 76188,
            version: 'Wiktionary 2022',
            available: true
        },
        'fr-en': {
            langPair: 'fr-en',
            name: 'French-English',
            wordcount: 76188,
            version: 'Wiktionary 2022',
            available: true
        },
        'es-en': {
            langPair: 'es-en',
            name: 'Spanish-English',
            wordcount: 44625,
            version: '2024.10.10 (reverse)',
            available: true
        },
        'en-it': {
            langPair: 'en-it',
            name: 'English-Italian',
            wordcount: 39493,
            version: '2024.10.10',
            available: true
        },
        'it-en': {
            langPair: 'it-en',
            name: 'Italian-English',
            wordcount: 39493,
            version: '2024.10.10 (reverse)',
            available: true
        },
        'en-pt': {
            langPair: 'en-pt',
            name: 'English-Portuguese',
            wordcount: 15759,
            version: '0.3',
            available: true
        },
        'pt-en': {
            langPair: 'pt-en',
            name: 'Portuguese-English',
            wordcount: 15759,
            version: '0.3 (reverse)',
            available: true
        },
        'en-de': {
            langPair: 'en-de',
            name: 'English-German',
            wordcount: 366799,
            version: '1.9',
            available: true
        },
        'de-en': {
            langPair: 'de-en',
            name: 'German-English',
            wordcount: 366799,
            version: '1.9 (reverse)',
            available: true
        },
        'en-ru': {
            langPair: 'en-ru',
            name: 'English-Russian',
            wordcount: 46098,
            version: '2024.10.10',
            available: true
        },
        'ru-en': {
            langPair: 'ru-en',
            name: 'Russian-English',
            wordcount: 46098,
            version: '2024.10.10 (reverse)',
            available: true
        },
        'en-pl': {
            langPair: 'en-pl',
            name: 'English-Polish',
            wordcount: 2397,
            version: '0.2.1',
            available: true
        },
        'pl-en': {
            langPair: 'pl-en',
            name: 'Polish-English',
            wordcount: 2397,
            version: '0.2.1 (reverse)',
            available: true
        },
        'en-cs': {
            langPair: 'en-cs',
            name: 'English-Czech',
            wordcount: 81005,
            version: '0.1.3',
            available: true
        },
        'cs-en': {
            langPair: 'cs-en',
            name: 'Czech-English',
            wordcount: 81005,
            version: '0.1.3 (reverse)',
            available: true
        },
        'en-uk': {
            langPair: 'en-uk',
            name: 'English-Ukrainian',
            wordcount: 12354,
            version: 'Wiktionary 2024',
            available: true
        },
        'uk-en': {
            langPair: 'uk-en',
            name: 'Ukrainian-English',
            wordcount: 12354,
            version: 'Wiktionary 2024 (reverse)',
            available: true
        },
        'en-ja': {
            langPair: 'en-ja',
            name: 'English-Japanese',
            wordcount: 172214,
            version: '0.1',
            available: true
        },
        'ja-en': {
            langPair: 'ja-en',
            name: 'Japanese-English',
            wordcount: 172214,
            version: '0.1 (reverse)',
            available: true
        },
        'en-zh': {
            langPair: 'en-zh',
            name: 'English-Mandarin',
            wordcount: 135813,
            version: 'Wiktionary 2024',
            available: true
        },
        'zh-en': {
            langPair: 'zh-en',
            name: 'Mandarin-English',
            wordcount: 135813,
            version: 'Wiktionary 2024 (reverse)',
            available: true
        }
    };

    private constructor() {}

    static getInstance(): DictionaryManager {
        if (!DictionaryManager.instance) {
            DictionaryManager.instance = new DictionaryManager();
        }
        return DictionaryManager.instance;
    }

    /**
     * Initialize dictionary manager
     * No initialization needed - dictionaries load on-demand
     */
    async init(): Promise<void> {
        if (DEBUG.DICTIONARY) console.log('[DictionaryManager] Initialized (Binary msgpack + gzip mode)');
    }

    /**
     * Check if dictionary is loaded in memory
     */
    async isDictionaryLoaded(langPair: string): Promise<boolean> {
        return this.dictionaries.has(langPair);
    }

    /**
     * Download and install a dictionary
     * Now just an alias for loadDictionary since we use bundled files
     */
    async downloadDictionary(
        langPair: string,
        onProgress?: (progress: number, status: string) => void
    ): Promise<void> {
        onProgress?.(0, 'Loading dictionary...');
        await this.loadDictionary(langPair);
        onProgress?.(100, 'Complete!');
    }

    /**
     * Load dictionary from bundled binary files (.pbd.gz)
     * TIER 12: Uses msgpack + gzip format for 67% size reduction
     */
    async loadDictionary(langPair: string): Promise<void> {
        if (this.dictionaries.has(langPair)) {
            return; // Already loaded
        }

        const metadata = DictionaryManager.DICTIONARIES[langPair];
        if (!metadata || !metadata.available) {
            throw new Error(`Dictionary ${langPair} not found in metadata`);
        }

        if (DEBUG.DICTIONARY) console.log(`[DictionaryManager] Loading ${langPair} from binary format...`);

        try {
            // Find the binary dictionary in the glob imports
            const modulePath = `../../src/assets/dictionaries-bin/${langPair}.pbd.gz`;
            const fileUrlLoader = dictionaryModules[modulePath];

            if (!fileUrlLoader) {
                throw new Error(`Binary dictionary file not found: ${modulePath}`);
            }

            // Get the file URL
            const fileUrl = await fileUrlLoader();

            // Fetch the binary file
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch dictionary: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();

            // Parse binary format (msgpack + gzip)
            const dictionary = await loadBinaryDictionary(arrayBuffer);

            this.dictionaries.set(langPair, dictionary);
            if (DEBUG.DICTIONARY) console.log(`[DictionaryManager] ✅ Loaded ${langPair} with ${Object.keys(dictionary).length} entries`);
        } catch (error) {
            if (DEBUG.ERRORS) console.error(`[DictionaryManager] Failed to load ${langPair}:`, error);
            throw new Error(`Dictionary ${langPair} failed to load: ${error}`);
        }
    }

    /**
     * Translate a word
     */
    async translate(word: string, fromLang: Language, toLang: Language): Promise<string[]> {
        const langPair = this.getLangPair(fromLang, toLang);

        // Load dictionary if needed (automatically load from bundled files)
        if (!this.dictionaries.has(langPair)) {
            const metadata = DictionaryManager.DICTIONARIES[langPair];
            if (!metadata || !metadata.available) {
                throw new Error(`Dictionary ${langPair} not available.`);
            }

            // Auto-load the dictionary from bundled files
            try {
                await this.loadDictionary(langPair);
            } catch (error) {
                throw new Error(`Failed to load dictionary ${langPair}: ${error}`);
            }
        }

        const dictionary = this.dictionaries.get(langPair)!;
        const lowerWord = word.toLowerCase();

        // Look up the word in the dictionary
        const translation = dictionary[lowerWord];

        return translation ? [translation] : [];
    }

    /**
     * Get language pair identifier
     */
    private getLangPair(from: Language, to: Language): string {
        const langMap: Record<Language, string> = {
            [Language.ENGLISH]: 'en',
            [Language.SPANISH]: 'es',
            [Language.FRENCH]: 'fr',
            [Language.JAPANESE]: 'ja',
            [Language.GERMAN]: 'de',
            [Language.ITALIAN]: 'it',
            [Language.PORTUGUESE]: 'pt',
            [Language.RUSSIAN]: 'ru',
            [Language.POLISH]: 'pl',
            [Language.CZECH]: 'cs',
            [Language.MANDARIN]: 'zh',
            [Language.UKRAINIAN]: 'uk'
        };

        const fromCode = langMap[from];
        const toCode = langMap[to];

        // Always format as "en-XX" or "XX-en" for consistency
        if (fromCode === 'en') {
            return `en-${toCode}`;
        } else if (toCode === 'en') {
            return `${fromCode}-en`;
        } else {
            // For non-English pairs, we'd need different dictionaries
            throw new Error(`Direct translation ${from}-${to} not supported. Use English as intermediate.`);
        }
    }

    /**
     * Delete dictionary from memory
     */
    async deleteDictionary(langPair: string): Promise<void> {
        this.dictionaries.delete(langPair);
        if (DEBUG.DICTIONARY) console.log(`[DictionaryManager] Deleted ${langPair} from memory`);
    }

    /**
     * Get available dictionaries
     */
    static getAvailableDictionaries(): DictionaryMetadata[] {
        return Object.values(DictionaryManager.DICTIONARIES);
    }

    /**
     * Get dictionary metadata
     */
    static getDictionaryInfo(langPair: string): DictionaryMetadata | null {
        return DictionaryManager.DICTIONARIES[langPair] || null;
    }

    /**
     * Get language metadata
     */
    static getLanguageInfo(lang: Language): { name: string; flag: string; code: string } | null {
        return DictionaryManager.LANGUAGE_NAMES[lang] || null;
    }

    /**
     * Get dictionaries needed for a specific language pair
     * Returns array of langPairs needed (e.g., for Spanish learner with English interface: ['en-es'])
     */
    static getNeededDictionaries(nativeLanguage: Language, targetLanguage: Language): string[] {
        const needed: string[] = [];

        // If languages are the same, no dictionary needed
        if (nativeLanguage === targetLanguage) {
            return needed;
        }

        const nativeCode = DictionaryManager.LANGUAGE_NAMES[nativeLanguage]?.code;
        const targetCode = DictionaryManager.LANGUAGE_NAMES[targetLanguage]?.code;

        if (!nativeCode || !targetCode) {
            return needed;
        }

        // Game generates in English, so we always need English-to-target
        if (targetCode !== 'en') {
            const langPair = `en-${targetCode}`;
            const dict = DictionaryManager.DICTIONARIES[langPair];
            if (dict && dict.available) {
                needed.push(langPair);
            }
        }

        // If native language is not English, we also need English-to-native for hints
        if (nativeCode !== 'en' && nativeCode !== targetCode) {
            const langPair = `en-${nativeCode}`;
            const dict = DictionaryManager.DICTIONARIES[langPair];
            if (dict && dict.available) {
                needed.push(langPair);
            }
        }

        return needed;
    }
}
