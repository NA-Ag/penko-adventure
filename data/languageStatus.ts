import { Language } from '../types';

/**
 * List of languages that are officially supported and stable for Browser AI (Qwen 0.8B).
 * Languages not in this list will be marked as "Coming Soon" in the UI.
 */
export const STABLE_LANGUAGES: Set<Language> = new Set([
    // Romance
    Language.SPANISH, Language.FRENCH, Language.ITALIAN, Language.PORTUGUESE, 
    Language.ROMANIAN, Language.CATALAN, Language.GALICIAN, Language.HAITIAN_CREOLE, Language.LATIN,
    
    // Germanic
    Language.ENGLISH, Language.GERMAN, Language.DUTCH, Language.SWEDISH, 
    Language.NORWEGIAN, Language.DANISH, Language.AFRIKAANS, Language.ICELANDIC, 
    Language.LUXEMBOURGISH, Language.YIDDISH,
    
    // Slavic
    Language.RUSSIAN, Language.UKRAINIAN, Language.POLISH, Language.CZECH, 
    Language.SLOVAK, Language.BULGARIAN, Language.CROATIAN, Language.SERBIAN, 
    Language.MACEDONIAN, Language.SLOVENIAN,
    
    // Other European
    Language.GREEK, Language.FINNISH, Language.ESTONIAN, Language.LATVIAN, 
    Language.LITHUANIAN, Language.HUNGARIAN, Language.ALBANIAN, Language.BASQUE, 
    Language.WELSH, Language.IRISH, Language.SCOTTISH_GAELIC,
    
    // Turkic
    Language.TURKISH, Language.AZERBAIJANI,
    
    // Semitic
    Language.ARABIC, Language.HEBREW,
    
    // Major Asian
    Language.MANDARIN, Language.CANTONESE, Language.JAPANESE, Language.KOREAN, 
    Language.VIETNAMESE, Language.THAI, Language.INDONESIAN, Language.MALAY, Language.TAGALOG,
    
    // African (Latin Script)
    Language.SWAHILI, Language.ZULU, Language.YORUBA, Language.HAUSA, 
    Language.SOMALI, Language.OROMO, Language.CHICHEWA, Language.KINYARWANDA, 
    Language.SHONA, Language.SOTHO, Language.GANDA, Language.FULA, Language.IGBO,
    
    // Pacific/Other
    Language.HAWAIIAN, Language.MAORI, Language.QUECHUA, Language.PERSIAN
]);

export const isLanguageStable = (lang: Language): boolean => {
    return STABLE_LANGUAGES.has(lang);
};
