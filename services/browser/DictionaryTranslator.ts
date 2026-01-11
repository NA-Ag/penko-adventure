/**
 * DictionaryTranslator - Translates text using offline dictionaries
 * Implements word-by-word translation with phrase matching and grammar awareness
 */

import { Language } from '../../types';
import { DictionaryManager } from './DictionaryManager';
import { GRAMMAR } from '../parser/data/languageData';

interface TranslationCache {
    [key: string]: string;
}

export class DictionaryTranslator {
    private dictManager: DictionaryManager;
    private cache: TranslationCache = {};
    private fromLang: Language;
    private toLang: Language;

    constructor(fromLang: Language, toLang: Language) {
        this.fromLang = fromLang;
        this.toLang = toLang;
        this.dictManager = DictionaryManager.getInstance();

        // Load cache from localStorage
        this.loadCache();
    }

    /**
     * Translate a full sentence/paragraph
     */
    async translate(text: string): Promise<string> {
        console.log('[DictionaryTranslator] Translating:', {
            from: this.fromLang,
            to: this.toLang,
            text: text.substring(0, 50) + '...'
        });

        // Check cache first
        const cacheKey = `${text}:${this.fromLang}:${this.toLang}`;
        if (this.cache[cacheKey]) {
            console.log('[DictionaryTranslator] Cache hit');
            return this.cache[cacheKey];
        }

        try {
            // Strategy 1: Try phrase-level translation first
            let translated = await this.translatePhrases(text);
            console.log('[DictionaryTranslator] After phrases:', translated.substring(0, 50) + '...');

            // Strategy 2: Fallback to word-by-word with existing vocabulary
            if (translated === text) {
                translated = this.translateWithVocabulary(text);
                console.log('[DictionaryTranslator] After vocabulary:', translated.substring(0, 50) + '...');
            }

            // Strategy 3: Try dictionary lookup for remaining words
            const dictAvailable = await this.isDictionaryAvailable();
            console.log('[DictionaryTranslator] Dictionary available?', dictAvailable);
            if (dictAvailable) {
                translated = await this.translateWithDictionary(translated);
                console.log('[DictionaryTranslator] After dictionary:', translated.substring(0, 50) + '...');
            }

            // Cache result
            this.cache[cacheKey] = translated;
            this.saveCache();

            console.log('[DictionaryTranslator] Final result:', translated.substring(0, 50) + '...');
            return translated;

        } catch (e) {
            console.warn('[DictionaryTranslator] Translation failed:', e);
            return text; // Return original on failure
        }
    }

    /**
     * Translate using phrase templates
     */
    private async translatePhrases(text: string): Promise<string> {
        const templates = this.getPhraseTemplates();

        let result = text;
        for (const [englishPattern, targetPhrase] of Object.entries(templates)) {
            const regex = new RegExp(englishPattern, 'gi');
            result = result.replace(regex, targetPhrase);
        }

        return result;
    }

    /**
     * Get phrase templates for target language
     */
    private getPhraseTemplates(): Record<string, string> {
        const templates: Record<Language, Record<string, string>> = {
            [Language.SPANISH]: {
                "You see": "Ves",
                "You enter": "Entras en",
                "You find": "Encuentras",
                "You are in": "Estás en",
                "You are": "Estás",
                "There is": "Hay",
                "There are": "Hay",
                "You notice": "Notas",
                "appears": "aparece",
                "A (.+) appears": "Aparece $1",
                "The (.+) is (.+)": "El $1 es $2"
            },
            [Language.FRENCH]: {
                "You see": "Tu vois",
                "You enter": "Tu entres dans",
                "You find": "Tu trouves",
                "You are in": "Tu es dans",
                "You are": "Tu es",
                "There is": "Il y a",
                "There are": "Il y a",
                "You notice": "Tu remarques",
                "appears": "apparaît",
                "A (.+) appears": "Un $1 apparaît"
            },
            [Language.JAPANESE]: {
                "You see": "見える",
                "You enter": "入る",
                "You find": "見つける",
                "appears": "が現れる",
                "You are in": "にいる",
                "There is": "がある",
                "You notice": "気づく"
            },
            [Language.ENGLISH]: {},
            [Language.GERMAN]: {},
            [Language.ITALIAN]: {},
            [Language.PORTUGUESE]: {},
            [Language.RUSSIAN]: {},
            [Language.POLISH]: {},
            [Language.CZECH]: {},
            [Language.MANDARIN]: {},
            [Language.UKRAINIAN]: {}
        };

        return templates[this.toLang] || {};
    }

    /**
     * Translate using existing vocabulary from languageData.ts
     */
    private translateWithVocabulary(text: string): string {
        if (this.fromLang !== Language.ENGLISH) {
            return text; // Only English source supported with GRAMMAR data
        }

        let result = text;

        // Replace words from GRAMMAR dictionary
        for (const [category, translations] of Object.entries(GRAMMAR)) {
            const englishWords = translations[Language.ENGLISH];
            const targetWords = translations[this.toLang];

            if (englishWords && targetWords) {
                englishWords.forEach((enWord, index) => {
                    if (targetWords[index]) {
                        // Case-insensitive word boundary replacement
                        const regex = new RegExp(`\\b${this.escapeRegex(enWord)}\\b`, 'gi');
                        result = result.replace(regex, (match) => {
                            // Preserve capitalization
                            if (match[0] === match[0].toUpperCase()) {
                                return this.capitalize(targetWords[index]);
                            }
                            return targetWords[index];
                        });
                    }
                });
            }
        }

        return result;
    }

    /**
     * Translate using dictionary lookup
     */
    private async translateWithDictionary(text: string): Promise<string> {
        const words = text.split(/\b/);
        const translated: string[] = [];

        for (const word of words) {
            // Skip punctuation and whitespace
            if (!/\w/.test(word)) {
                translated.push(word);
                continue;
            }

            try {
                const translations = await this.dictManager.translate(
                    word,
                    this.fromLang,
                    this.toLang
                );

                if (translations.length > 0) {
                    console.log(`[Dict] "${word}" -> "${translations[0]}"`);
                    // Use first translation
                    translated.push(this.matchCase(word, translations[0]));
                } else {
                    translated.push(word); // Keep original if no translation
                }
            } catch (e) {
                console.warn(`[Dict] Error translating "${word}":`, e);
                translated.push(word); // Keep original on error
            }
        }

        return translated.join('');
    }

    /**
     * Check if dictionary is available for current language pair
     */
    private async isDictionaryAvailable(): Promise<boolean> {
        try {
            const langPair = this.getLangPair();
            return await this.dictManager.isDictionaryLoaded(langPair);
        } catch (e) {
            return false;
        }
    }

    /**
     * Get language pair code
     */
    private getLangPair(): string {
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

        const from = langMap[this.fromLang];
        const to = langMap[this.toLang];

        if (from === 'en') return `en-${to}`;
        if (to === 'en') return `${from}-en`;
        throw new Error('Only English-to-X or X-to-English supported');
    }

    /**
     * Match case of original word
     */
    private matchCase(original: string, translation: string): string {
        if (original[0] === original[0].toUpperCase()) {
            return this.capitalize(translation);
        }
        return translation;
    }

    /**
     * Capitalize first letter
     */
    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Escape regex special characters
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Load cache from localStorage
     */
    private loadCache() {
        try {
            const cached = localStorage.getItem('translation_cache');
            if (cached) {
                this.cache = JSON.parse(cached);
            }
        } catch (e) {
            console.warn('Failed to load translation cache:', e);
        }
    }

    /**
     * Save cache to localStorage
     */
    private saveCache() {
        try {
            // Keep only last 1000 translations
            const entries = Object.entries(this.cache);
            if (entries.length > 1000) {
                this.cache = Object.fromEntries(entries.slice(-1000));
            }

            localStorage.setItem('translation_cache', JSON.stringify(this.cache));
        } catch (e) {
            console.warn('Failed to save translation cache:', e);
        }
    }

    /**
     * Clear translation cache
     */
    clearCache() {
        this.cache = {};
        localStorage.removeItem('translation_cache');
    }

    /**
     * Get translation statistics
     */
    getStats() {
        return {
            cachedTranslations: Object.keys(this.cache).length,
            fromLanguage: this.fromLang,
            toLanguage: this.toLang
        };
    }
}
