
import { Language } from '../types';

// Language code mapping (ISO 639-1)
const LANG_CODES: Record<Language, string> = {
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
  [Language.CZECH]: 'cs'
};

const TIER_1_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'ru', 'pt', 'uk', 'pl'];

export interface WordDefinition {
  word: string;
  definitions: string[];
  synonyms: string[];
  examples: string[];
  phonetic?: string;
}

export interface TranslationResult {
  original: string;
  translated: string;
  confidence: number;
}

// PERSISTENCE KEYS
const DICT_CACHE_KEY = 'penko_dict_v1';
const TRANS_CACHE_KEY = 'penko_trans_v1';

// In-Memory Caches
const CACHE: Map<string, Map<string, WordDefinition>> = new Map();
const TRANS_CACHE: Map<string, TranslationResult> = new Map();

// --- INITIALIZATION: Load from LocalStorage ---
try {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedDict = localStorage.getItem(DICT_CACHE_KEY);
        if (storedDict) {
            const parsed = JSON.parse(storedDict);
            Object.keys(parsed).forEach(lang => {
                CACHE.set(lang, new Map(Object.entries(parsed[lang])));
            });
        }

        const storedTrans = localStorage.getItem(TRANS_CACHE_KEY);
        if (storedTrans) {
            const parsed = JSON.parse(storedTrans);
            Object.entries(parsed).forEach(([key, val]) => {
                TRANS_CACHE.set(key, val as TranslationResult);
            });
        }
    }
} catch (e) {
    console.warn("Failed to load dictionary cache", e);
}

// Helper: Debounced Save
let saveTimeout: any;
function persistCache() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        try {
            // Serialize Dictionary Cache
            const dictExport: Record<string, any> = {};
            CACHE.forEach((map, lang) => {
                dictExport[lang] = Object.fromEntries(map);
            });
            localStorage.setItem(DICT_CACHE_KEY, JSON.stringify(dictExport));

            // Serialize Translation Cache
            const transExport = Object.fromEntries(TRANS_CACHE);
            localStorage.setItem(TRANS_CACHE_KEY, JSON.stringify(transExport));
            
        } catch (e) {
            console.warn("Failed to save dictionary cache (Quota exceeded?)", e);
        }
    }, 2000); // 2s debounce
}

export async function lookupWord(word: string, language: Language): Promise<WordDefinition | null> {
  const langCode = LANG_CODES[language];
  const normalized = word.toLowerCase().trim();

  if (CACHE.has(langCode) && CACHE.get(langCode)!.has(normalized)) {
    return CACHE.get(langCode)!.get(normalized)!;
  }

  try {
    // Tier 1: Try Free Dictionary API first
    if (TIER_1_LANGUAGES.includes(langCode)) {
      const freeDictResult = await lookupFreeDictionary(normalized, langCode);
      if (freeDictResult) {
        cacheWord(langCode, normalized, freeDictResult);
        return freeDictResult;
      }
    }

    // Fallback to Wiktionary
    const wiktionaryResult = await lookupWiktionary(normalized, langCode);
    if (wiktionaryResult) {
      cacheWord(langCode, normalized, wiktionaryResult);
      return wiktionaryResult;
    }

    return null;
  } catch (error) {
    console.error(`Failed to lookup word "${word}":`, error);
    return null;
  }
}

async function lookupFreeDictionary(word: string, langCode: string): Promise<WordDefinition | null> {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/${langCode}/${word}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    const definitions: string[] = [];
    const synonyms: string[] = [];
    const examples: string[] = [];

    entry.meanings?.forEach((meaning: any) => {
      meaning.definitions?.forEach((def: any) => {
        if (def.definition) definitions.push(def.definition);
        if (def.example) examples.push(def.example);
        if (def.synonyms) synonyms.push(...def.synonyms);
      });
    });

    return {
      word: entry.word,
      definitions: definitions.slice(0, 3),
      synonyms: [...new Set(synonyms)].slice(0, 10),
      examples: examples.slice(0, 3),
      phonetic: entry.phonetic
    };
  } catch (error) {
    return null;
  }
}

async function lookupWiktionary(word: string, langCode: string): Promise<WordDefinition | null> {
  const url = `https://${langCode}.wiktionary.org/api/rest_v1/page/definition/${word}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || !data[langCode]) return null;

    const definitions: string[] = [];
    data[langCode].forEach((entry: any) => {
      entry.definitions?.forEach((def: any) => {
        if (def.definition) definitions.push(def.definition.replace(/<[^>]+>/g, ''));
      });
    });

    return {
      word,
      definitions: definitions.slice(0, 3),
      synonyms: [],
      examples: []
    };
  } catch (error) {
    return null;
  }
}

export async function translateText(text: string, sourceLang: Language, targetLang: Language): Promise<TranslationResult | null> {
  const sourceCode = LANG_CODES[sourceLang];
  const targetCode = LANG_CODES[targetLang];
  const key = `${sourceCode}|${targetCode}|${text.trim()}`;

  // Check Cache
  if (TRANS_CACHE.has(key)) {
      return TRANS_CACHE.get(key)!;
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.responseStatus !== 200) return null;

    const result = {
      original: text,
      translated: data.responseData.translatedText,
      confidence: parseFloat(data.responseData.match) || 0.5
    };

    // Cache result
    TRANS_CACHE.set(key, result);
    persistCache();

    return result;
  } catch (error) {
    return null;
  }
}

export async function getSynonyms(word: string, language: Language): Promise<string[]> {
  const result = await lookupWord(word, language);
  return result?.synonyms || [];
}

function cacheWord(langCode: string, word: string, definition: WordDefinition) {
  if (!CACHE.has(langCode)) CACHE.set(langCode, new Map());
  CACHE.get(langCode)!.set(word, definition);
  persistCache();
}
