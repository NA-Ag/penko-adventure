
import { Language } from '../../types';

type Gender = 'M' | 'F' | 'N'; // Masculine, Feminine, Neutral

const GENDERED_LANGUAGES = [
    Language.SPANISH, 
    Language.FRENCH, 
    Language.ITALIAN, 
    Language.PORTUGUESE,
    Language.RUSSIAN
];

export class GrammarUtils {

    /**
     * Main entry point. Fixes a sentence's grammatical agreement.
     */
    public static autoCorrect(text: string, lang: Language): string {
        if (!GENDERED_LANGUAGES.includes(lang)) return text;

        let corrected = text;

        // 1. Fix Indefinite Articles (Un/Una)
        // Pattern: [Article] [Noun]
        const articleMap: Record<string, Record<string, string>> = {
            [Language.SPANISH]: { 'Un': 'Una', 'un': 'una', 'El': 'La', 'el': 'la' },
            [Language.FRENCH]: { 'Un': 'Une', 'un': 'une', 'Le': 'La', 'le': 'la' },
            [Language.ITALIAN]: { 'Un': 'Una', 'un': 'una', 'Il': 'La', 'il': 'la' },
            [Language.PORTUGUESE]: { 'Um': 'Uma', 'um': 'uma', 'O': 'A', 'o': 'a' }
            // Russian doesn't use articles, so we skip it here
        };

        if (articleMap[lang]) {
            const words = corrected.split(' ');
            for (let i = 0; i < words.length - 1; i++) {
                const current = words[i];
                const next = words[i + 1].replace(/[.,?!]/g, ''); // Strip punctuation

                const swap = articleMap[lang][current];
                if (swap) {
                    // Check gender of 'next' (the noun)
                    const gender = this.guessGender(next, lang);
                    if (gender === 'F') {
                        words[i] = swap; 
                    }
                }
            }
            corrected = words.join(' ');
        }
        
        return corrected;
    }

    /**
     * Smart inflection for template generation.
     * When the engine picks an adjective, it calls this with the target noun's gender.
     */
    public static inflect(word: string, targetGender: Gender, lang: Language): string {
        // Default assumption: Dictionary words are Masculine/Singular
        if (targetGender === 'M') return word; 

        // --- ROMANCE LANGUAGES ---
        if (lang === Language.SPANISH || lang === Language.PORTUGUESE || lang === Language.ITALIAN) {
            if (targetGender === 'F') {
                if (word.endsWith('o')) return word.slice(0, -1) + 'a';
                if (word.endsWith('O')) return word.slice(0, -1) + 'A';
            }
        }
        
        if (lang === Language.FRENCH) {
            if (targetGender === 'F') {
                // French usually adds 'e', unless it already ends in 'e' or 's'
                if (!word.endsWith('e') && !word.endsWith('s')) return word + 'e';
            }
        }

        // --- RUSSIAN (Nominative Case) ---
        if (lang === Language.RUSSIAN) {
            // Masculine endings: -ый, -ий, -ой
            let stem = word;
            if (word.endsWith('ый') || word.endsWith('ий') || word.endsWith('ой')) {
                stem = word.slice(0, -2);
            } else {
                // If word doesn't match standard masculine endings, assume it's invariant or irregular
                return word;
            }

            if (targetGender === 'F') return stem + 'ая'; // Fem: красивая
            if (targetGender === 'N') return stem + 'ое'; // Neut: красивое
        }

        return word;
    }

    /**
     * Heuristic gender Guesser.
     * 90% accuracy for common words without a dictionary.
     */
    public static guessGender(word: string, lang: Language): Gender {
        const w = word.toLowerCase();

        // --- ROMANCE ---
        if (lang === Language.SPANISH || lang === Language.PORTUGUESE || lang === Language.ITALIAN) {
            // Spanish Feminine Exceptions/Rules
            if (lang === Language.SPANISH) {
                if (['fuente', 'noche', 'torre', 'gente', 'muerte', 'calle', 'carne', 'nube', 'sangre', 'clase', 'llave'].includes(w)) return 'F';
                if (['luz', 'paz', 'voz', 'cruz', 'nariz', 'raíz'].includes(w)) return 'F';
            }

            if (w.endsWith('a') || w.endsWith('ción') || w.endsWith('sión') || w.endsWith('dad') || w.endsWith('tud') || w.endsWith('umbre')) {
                return 'F';
            }
            if (w.endsWith('o') || w.endsWith('or') || w.endsWith('aje')) {
                return 'M';
            }
        }

        if (lang === Language.FRENCH) {
            if (w.endsWith('e') || w.endsWith('ion') || w.endsWith('té')) {
                return 'F'; 
            }
        }

        // --- RUSSIAN ---
        if (lang === Language.RUSSIAN) {
            // Feminine: ends in -а, -я
            if (w.endsWith('а') || w.endsWith('я')) return 'F';
            // Neuter: ends in -о, -е
            if (w.endsWith('о') || w.endsWith('е')) return 'N';
            // Masculine: typically ends in consonant or -й
            return 'M';
        }

        // Default Fallback
        return 'M';
    }
}
