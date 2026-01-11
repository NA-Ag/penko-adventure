/**
 * MorphologyEngine - Handles verb conjugations, noun plurals, and adjective forms
 *
 * Purpose: Recognize ALL valid forms of words (not just dictionary infinitives)
 * Example: "comiendo" (eating) should be recognized as valid form of "comer" (to eat)
 *
 * Architecture:
 * - Uses pattern-based morphology generation (NOT hardcoded tables)
 * - Loads pattern definitions from JSON files in /public/morphology/patterns/
 * - Generates forms on-demand using rules (e.g., stem + 'ando')
 * - Provides fast lookup: isValidForm(word, language) => boolean
 * - Provides base form lookup: getBaseForm(word, language) => string
 *
 * Benefits:
 * - 97% less stored data (patterns vs all forms)
 * - Easy to add new words (just assign pattern)
 * - Maintainable (fix pattern once, all verbs fixed)
 */

import { Language } from '../../types';
import { getPatternBasedMorphologyEngine, PatternBasedMorphologyEngine } from './PatternBasedMorphology';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VerbConjugation {
    infinitive: string;
    gerund: string;              // -ing form (comiendo)
    participle: string;          // past participle (comido)
    present: string[];           // como, comes, come, comemos, coméis, comen
    preterite: string[];         // comí, comiste, comió, comimos, comisteis, comieron
    imperfect: string[];         // comía, comías, comía, comíamos, comíais, comían
    future: string[];            // comeré, comerás, comerá, comeremos, comeréis, comerán
    conditional: string[];       // comería, comerías, comería, comeríamos, comeríais, comerían
    subjunctive_present: string[]; // coma, comas, coma, comamos, comáis, coman
    subjunctive_imperfect: string[]; // comiera, comieras, comiera, comiéramos, comierais, comieran
    imperative: string[];        // come (tú), coma (usted), comed (vosotros), coman (ustedes)
}

export interface NounForm {
    singular: string;
    plural: string;
}

export interface AdjectiveForm {
    masculine_singular: string;
    feminine_singular: string;
    masculine_plural: string;
    feminine_plural: string;
}

export interface MorphologyTable {
    verbs: Record<string, VerbConjugation>;
    nouns: Record<string, NounForm>;
    adjectives: Record<string, AdjectiveForm>;
}

// ============================================================================
// MORPHOLOGY ENGINE
// ============================================================================

export class MorphologyEngine {
    private patternEngine: PatternBasedMorphologyEngine;
    private tables: Map<Language, MorphologyTable> = new Map();
    private reverseIndex: Map<Language, Map<string, string>> = new Map(); // word -> base form
    private isInitialized: Map<Language, boolean> = new Map();

    constructor() {
        this.patternEngine = getPatternBasedMorphologyEngine();
    }

    /**
     * Load morphology data for a language
     * Uses pattern-based system for efficient storage
     */
    async loadLanguage(lang: Language): Promise<void> {
        if (this.isInitialized.get(lang)) {
            console.log(`[MorphologyEngine] ${lang} already loaded`);
            return;
        }

        try {
            // Load pattern-based morphology data
            await this.patternEngine.loadLanguageData(lang);

            // Build reverse index from pattern-based data
            this.buildReverseIndexFromPatterns(lang);

            this.isInitialized.set(lang, true);
            console.log(`[MorphologyEngine] Loaded ${lang} pattern-based morphology`);

        } catch (e) {
            console.error(`[MorphologyEngine] Failed to load ${lang}:`, e);
            // Initialize empty table to prevent repeated failures
            this.reverseIndex.set(lang, new Map());
            this.isInitialized.set(lang, true);
        }
    }

    /**
     * Build reverse index from pattern-based engine
     * Generates all forms and maps them back to base forms
     */
    private buildReverseIndexFromPatterns(lang: Language): void {
        const index = this.patternEngine.getReverseIndex(lang);
        this.reverseIndex.set(lang, index);
        console.log(`[MorphologyEngine] Built reverse index for ${lang}: ${index.size} forms`);
    }

    /**
     * Build reverse index: inflected form -> base form (LEGACY - for old format)
     * This allows O(1) lookup instead of iterating through all forms
     */
    private buildReverseIndex(lang: Language, table: MorphologyTable): void {
        const index = new Map<string, string>();

        // Index verb forms
        for (const [infinitive, conjugation] of Object.entries(table.verbs)) {
            // Add infinitive itself
            index.set(infinitive.toLowerCase(), infinitive);

            // Add gerund
            if (conjugation.gerund) {
                index.set(conjugation.gerund.toLowerCase(), infinitive);
            }

            // Add participle
            if (conjugation.participle) {
                index.set(conjugation.participle.toLowerCase(), infinitive);
            }

            // Add all conjugated forms
            const allForms = [
                ...conjugation.present,
                ...conjugation.preterite,
                ...conjugation.imperfect,
                ...conjugation.future,
                ...conjugation.conditional,
                ...conjugation.subjunctive_present,
                ...conjugation.subjunctive_imperfect,
                ...conjugation.imperative
            ];

            for (const form of allForms) {
                if (form) {
                    index.set(form.toLowerCase(), infinitive);
                }
            }
        }

        // Index noun forms
        for (const [singular, forms] of Object.entries(table.nouns)) {
            index.set(singular.toLowerCase(), singular);
            if (forms.plural) {
                index.set(forms.plural.toLowerCase(), singular);
            }
        }

        // Index adjective forms
        for (const [base, forms] of Object.entries(table.adjectives)) {
            index.set(base.toLowerCase(), base);
            if (forms.feminine_singular) {
                index.set(forms.feminine_singular.toLowerCase(), base);
            }
            if (forms.masculine_plural) {
                index.set(forms.masculine_plural.toLowerCase(), base);
            }
            if (forms.feminine_plural) {
                index.set(forms.feminine_plural.toLowerCase(), base);
            }
        }

        this.reverseIndex.set(lang, index);
        console.log(`[MorphologyEngine] Built reverse index for ${lang}: ${index.size} forms`);
    }

    /**
     * Check if a word is a valid form in the morphology table
     * Fast O(1) lookup using reverse index
     */
    isValidForm(word: string, lang: Language): boolean {
        if (!this.isInitialized.get(lang)) {
            console.warn(`[MorphologyEngine] ${lang} not initialized, call loadLanguage() first`);
            return false;
        }

        const index = this.reverseIndex.get(lang);
        if (!index) return false;

        return index.has(word.toLowerCase());
    }

    /**
     * Get the base form (infinitive/singular) of a word
     * Returns null if not found
     */
    getBaseForm(word: string, lang: Language): string | null {
        if (!this.isInitialized.get(lang)) {
            return null;
        }

        const index = this.reverseIndex.get(lang);
        if (!index) return null;

        return index.get(word.toLowerCase()) || null;
    }

    /**
     * Get full conjugation for a verb (if exists)
     * Generates forms using pattern-based system
     */
    getVerbConjugation(infinitive: string, lang: Language): VerbConjugation | null {
        if (!this.isInitialized.get(lang)) {
            return null;
        }

        // Try to generate all common forms using pattern engine
        const forms = this.patternEngine.getAllVerbForms(lang, infinitive);
        if (!forms) return null;

        // Map to VerbConjugation format for backwards compatibility
        return {
            infinitive: forms.infinitive || infinitive,
            gerund: forms.gerund || '',
            participle: forms.past_participle || forms.participle || '',
            present: [
                forms.present_1s || '',
                forms.present_2s || '',
                forms.present_3s || '',
                forms.present_1p || '',
                forms.present_2p || '',
                forms.present_3p || ''
            ],
            preterite: [
                forms.preterite_1s || '',
                forms.preterite_2s || '',
                forms.preterite_3s || '',
                forms.preterite_1p || '',
                forms.preterite_2p || '',
                forms.preterite_3p || ''
            ],
            imperfect: [
                forms.imperfect_1s || '',
                forms.imperfect_2s || '',
                forms.imperfect_3s || '',
                forms.imperfect_1p || '',
                forms.imperfect_2p || '',
                forms.imperfect_3p || ''
            ],
            future: [
                forms.future_1s || '',
                forms.future_2s || '',
                forms.future_3s || '',
                forms.future_1p || '',
                forms.future_2p || '',
                forms.future_3p || ''
            ],
            conditional: [
                forms.conditional_1s || '',
                forms.conditional_2s || '',
                forms.conditional_3s || '',
                forms.conditional_1p || '',
                forms.conditional_2p || '',
                forms.conditional_3p || ''
            ],
            subjunctive_present: [
                forms.subjunctive_present_1s || '',
                forms.subjunctive_present_2s || '',
                forms.subjunctive_present_3s || '',
                forms.subjunctive_present_1p || '',
                forms.subjunctive_present_2p || '',
                forms.subjunctive_present_3p || ''
            ],
            subjunctive_imperfect: [
                forms.subjunctive_imperfect_1s || '',
                forms.subjunctive_imperfect_2s || '',
                forms.subjunctive_imperfect_3s || '',
                forms.subjunctive_imperfect_1p || '',
                forms.subjunctive_imperfect_2p || '',
                forms.subjunctive_imperfect_3p || ''
            ],
            imperative: [
                forms.imperative_2s || '',
                forms.imperative_3s || '',
                forms.imperative_1p || '',
                forms.imperative_2p || ''
            ]
        };
    }

    /**
     * Get noun forms (if exists)
     * Generates forms using pattern-based system
     */
    getNounForms(singular: string, lang: Language): NounForm | null {
        if (!this.isInitialized.get(lang)) {
            return null;
        }

        const forms = this.patternEngine.getAllNounForms(lang, singular);
        if (!forms) return null;

        return {
            singular: forms.singular || singular,
            plural: forms.plural || ''
        };
    }

    /**
     * Get adjective forms (if exists)
     * Generates forms using pattern-based system
     */
    getAdjectiveForms(base: string, lang: Language): AdjectiveForm | null {
        if (!this.isInitialized.get(lang)) {
            return null;
        }

        const forms = this.patternEngine.getAllAdjectiveForms(lang, base);
        if (!forms) return null;

        return {
            masculine_singular: forms.masculine_singular || base,
            feminine_singular: forms.feminine_singular || '',
            masculine_plural: forms.masculine_plural || '',
            feminine_plural: forms.feminine_plural || ''
        };
    }

    /**
     * Get language code for file path
     */
    private getLanguageCode(lang: Language): string {
        const codes: Record<Language, string> = {
            [Language.SPANISH]: 'spanish',
            [Language.FRENCH]: 'french',
            [Language.GERMAN]: 'german',
            [Language.ITALIAN]: 'italian',
            [Language.JAPANESE]: 'japanese',
            [Language.MANDARIN]: 'mandarin',
            [Language.RUSSIAN]: 'russian',
            [Language.PORTUGUESE]: 'portuguese',
            [Language.ENGLISH]: 'english',
            [Language.UKRAINIAN]: 'ukrainian',
            [Language.POLISH]: 'polish',
            [Language.CZECH]: 'czech'
        };
        return codes[lang] || lang.toLowerCase();
    }

    /**
     * Get statistics for a language
     */
    getStats(lang: Language): { verbs: number; nouns: number; adjectives: number; totalForms: number } {
        if (!this.isInitialized.get(lang)) {
            return { verbs: 0, nouns: 0, adjectives: 0, totalForms: 0 };
        }

        const stats = this.patternEngine.getStats(lang);
        const index = this.reverseIndex.get(lang);

        return {
            verbs: stats.verbs,
            nouns: stats.nouns,
            adjectives: stats.adjectives,
            totalForms: index?.size || 0
        };
    }
}

// Singleton instance
let instance: MorphologyEngine | null = null;

export function getMorphologyEngine(): MorphologyEngine {
    if (!instance) {
        instance = new MorphologyEngine();
    }
    return instance;
}
