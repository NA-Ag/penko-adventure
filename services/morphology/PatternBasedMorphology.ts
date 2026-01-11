/**
 * Pattern-based morphology system
 *
 * Instead of storing thousands of conjugated forms, we:
 * 1. Define conjugation/declension PATTERNS (rules)
 * 2. Store base words + their pattern type
 * 3. Generate forms on-the-fly using the patterns
 *
 * Benefits:
 * - Memory efficient (patterns + base forms instead of all forms)
 * - Scalable (add new words by just assigning a pattern)
 * - Maintainable (fix pattern once, fixes all words)
 */

import { Language } from '../../types';

// ============================================================================
// VERB CONJUGATION PATTERNS
// ============================================================================

export interface VerbPattern {
  name: string;
  description: string;
  /**
   * Rules for generating conjugated forms
   * Keys are form names (e.g., "present_1s", "past_3p")
   * Values are functions that take the base/stem and return the conjugated form
   */
  rules: {
    [formName: string]: (base: string, stem?: string) => string;
  };
  /**
   * Optional: How to extract the stem from the infinitive
   * If not provided, stem = infinitive
   */
  getStem?: (infinitive: string) => string;
}

export interface VerbEntry {
  infinitive: string;
  pattern: string; // Pattern name to use
  stem?: string; // Optional custom stem (for irregulars that mostly follow pattern)
  irregular?: {
    // Explicit overrides for specific forms
    [formName: string]: string;
  };
}

// ============================================================================
// NOUN DECLENSION PATTERNS
// ============================================================================

export interface NounPattern {
  name: string;
  description: string;
  gender?: 'm' | 'f' | 'n';
  rules: {
    [formName: string]: (base: string) => string;
  };
}

export interface NounEntry {
  singular: string;
  pattern: string;
  gender?: 'm' | 'f' | 'n';
  irregular?: {
    [formName: string]: string;
  };
}

// ============================================================================
// ADJECTIVE AGREEMENT PATTERNS
// ============================================================================

export interface AdjectivePattern {
  name: string;
  description: string;
  rules: {
    [formName: string]: (base: string) => string;
  };
}

export interface AdjectiveEntry {
  base: string;
  pattern: string;
  irregular?: {
    [formName: string]: string;
  };
}

// ============================================================================
// PATTERN-BASED MORPHOLOGY ENGINE
// ============================================================================

export class PatternBasedMorphologyEngine {
  private verbPatterns: Map<Language, Map<string, VerbPattern>> = new Map();
  private nounPatterns: Map<Language, Map<string, NounPattern>> = new Map();
  private adjectivePatterns: Map<Language, Map<string, AdjectivePattern>> = new Map();

  private verbs: Map<Language, Map<string, VerbEntry>> = new Map();
  private nouns: Map<Language, Map<string, NounEntry>> = new Map();
  private adjectives: Map<Language, Map<string, AdjectiveEntry>> = new Map();

  // Reverse index: word form → base form
  private reverseIndex: Map<Language, Map<string, string>> = new Map();

  constructor() {
    // Initialize maps for all languages
    const languages: Language[] = [
      Language.SPANISH, Language.FRENCH, Language.ITALIAN, Language.PORTUGUESE,
      Language.GERMAN, Language.RUSSIAN, Language.POLISH, Language.CZECH, Language.UKRAINIAN,
      Language.JAPANESE, Language.MANDARIN, Language.ENGLISH
    ];

    languages.forEach(lang => {
      this.verbPatterns.set(lang, new Map());
      this.nounPatterns.set(lang, new Map());
      this.adjectivePatterns.set(lang, new Map());
      this.verbs.set(lang, new Map());
      this.nouns.set(lang, new Map());
      this.adjectives.set(lang, new Map());
      this.reverseIndex.set(lang, new Map());
    });
  }

  // ============================================================================
  // PATTERN REGISTRATION
  // ============================================================================

  registerVerbPattern(lang: Language, pattern: VerbPattern): void {
    this.verbPatterns.get(lang)?.set(pattern.name, pattern);
  }

  registerNounPattern(lang: Language, pattern: NounPattern): void {
    this.nounPatterns.get(lang)?.set(pattern.name, pattern);
  }

  registerAdjectivePattern(lang: Language, pattern: AdjectivePattern): void {
    this.adjectivePatterns.get(lang)?.set(pattern.name, pattern);
  }

  // ============================================================================
  // WORD REGISTRATION
  // ============================================================================

  registerVerb(lang: Language, verb: VerbEntry): void {
    this.verbs.get(lang)?.set(verb.infinitive, verb);
    this.buildVerbReverseIndex(lang, verb);
  }

  registerNoun(lang: Language, noun: NounEntry): void {
    this.nouns.get(lang)?.set(noun.singular, noun);
    this.buildNounReverseIndex(lang, noun);
  }

  registerAdjective(lang: Language, adj: AdjectiveEntry): void {
    this.adjectives.get(lang)?.set(adj.base, adj);
    this.buildAdjectiveReverseIndex(lang, adj);
  }

  // ============================================================================
  // FORM GENERATION
  // ============================================================================

  generateVerbForm(lang: Language, infinitive: string, formName: string): string | null {
    const verb = this.verbs.get(lang)?.get(infinitive);
    if (!verb) return null;

    // Check for explicit irregular override first
    if (verb.irregular && verb.irregular[formName]) {
      return verb.irregular[formName];
    }

    // Get the pattern
    const pattern = this.verbPatterns.get(lang)?.get(verb.pattern);
    if (!pattern) {
      console.warn(`[Morphology] Pattern not found: ${verb.pattern} for ${lang}`);
      return null;
    }

    // Get the rule for this form
    const rule = pattern.rules[formName];
    if (!rule) {
      console.warn(`[Morphology] Form not found in pattern: ${formName}`);
      return null;
    }

    // Extract stem
    const stem = verb.stem || (pattern.getStem ? pattern.getStem(infinitive) : infinitive);

    // Apply the rule
    return rule(infinitive, stem);
  }

  generateAllVerbForms(lang: Language, infinitive: string): Map<string, string> {
    const forms = new Map<string, string>();
    const verb = this.verbs.get(lang)?.get(infinitive);
    if (!verb) return forms;

    const pattern = this.verbPatterns.get(lang)?.get(verb.pattern);
    if (!pattern) return forms;

    // Generate all forms defined in the pattern
    for (const formName in pattern.rules) {
      const form = this.generateVerbForm(lang, infinitive, formName);
      if (form) {
        forms.set(formName, form);
      }
    }

    return forms;
  }

  // Similar methods for nouns and adjectives...
  generateNounForm(lang: Language, singular: string, formName: string): string | null {
    const noun = this.nouns.get(lang)?.get(singular);
    if (!noun) return null;

    if (noun.irregular && noun.irregular[formName]) {
      return noun.irregular[formName];
    }

    const pattern = this.nounPatterns.get(lang)?.get(noun.pattern);
    if (!pattern || !pattern.rules[formName]) return null;

    return pattern.rules[formName](singular);
  }

  generateAdjectiveForm(lang: Language, base: string, formName: string): string | null {
    const adj = this.adjectives.get(lang)?.get(base);
    if (!adj) return null;

    if (adj.irregular && adj.irregular[formName]) {
      return adj.irregular[formName];
    }

    const pattern = this.adjectivePatterns.get(lang)?.get(adj.pattern);
    if (!pattern || !pattern.rules[formName]) return null;

    return pattern.rules[formName](base);
  }

  // ============================================================================
  // REVERSE INDEX BUILDING
  // ============================================================================

  private buildVerbReverseIndex(lang: Language, verb: VerbEntry): void {
    const index = this.reverseIndex.get(lang);
    if (!index) return;

    // Add the infinitive itself
    index.set(verb.infinitive.toLowerCase(), verb.infinitive);

    // Generate all forms and add to reverse index
    const forms = this.generateAllVerbForms(lang, verb.infinitive);
    forms.forEach((form, formName) => {
      index.set(form.toLowerCase(), verb.infinitive);
    });

    // Add explicit irregular forms
    if (verb.irregular) {
      Object.values(verb.irregular).forEach(form => {
        index.set(form.toLowerCase(), verb.infinitive);
      });
    }
  }

  private buildNounReverseIndex(lang: Language, noun: NounEntry): void {
    const index = this.reverseIndex.get(lang);
    if (!index) return;

    index.set(noun.singular.toLowerCase(), noun.singular);

    const pattern = this.nounPatterns.get(lang)?.get(noun.pattern);
    if (pattern) {
      Object.keys(pattern.rules).forEach(formName => {
        const form = this.generateNounForm(lang, noun.singular, formName);
        if (form) {
          index.set(form.toLowerCase(), noun.singular);
        }
      });
    }

    if (noun.irregular) {
      Object.values(noun.irregular).forEach(form => {
        index.set(form.toLowerCase(), noun.singular);
      });
    }
  }

  private buildAdjectiveReverseIndex(lang: Language, adj: AdjectiveEntry): void {
    const index = this.reverseIndex.get(lang);
    if (!index) return;

    index.set(adj.base.toLowerCase(), adj.base);

    const pattern = this.adjectivePatterns.get(lang)?.get(adj.pattern);
    if (pattern) {
      Object.keys(pattern.rules).forEach(formName => {
        const form = this.generateAdjectiveForm(lang, adj.base, formName);
        if (form) {
          index.set(form.toLowerCase(), adj.base);
        }
      });
    }

    if (adj.irregular) {
      Object.values(adj.irregular).forEach(form => {
        index.set(form.toLowerCase(), adj.base);
      });
    }
  }

  // ============================================================================
  // LOOKUP
  // ============================================================================

  isValidForm(word: string, lang: Language): boolean {
    const index = this.reverseIndex.get(lang);
    if (!index) return false;
    return index.has(word.toLowerCase());
  }

  getBaseForm(word: string, lang: Language): string | null {
    const index = this.reverseIndex.get(lang);
    if (!index) return null;
    return index.get(word.toLowerCase()) || null;
  }

  getReverseIndex(lang: Language): Map<string, string> {
    return this.reverseIndex.get(lang) || new Map();
  }

  getAllVerbForms(lang: Language, infinitive: string): { [formName: string]: string } | null {
    const forms = this.generateAllVerbForms(lang, infinitive);
    if (forms.size === 0) return null;

    const result: { [formName: string]: string } = {};
    forms.forEach((form, formName) => {
      result[formName] = form;
    });
    return result;
  }

  getAllNounForms(lang: Language, singular: string): { [formName: string]: string } | null {
    const noun = this.nouns.get(lang)?.get(singular);
    if (!noun) return null;

    const pattern = this.nounPatterns.get(lang)?.get(noun.pattern);
    if (!pattern) return null;

    const result: { [formName: string]: string } = {};
    Object.keys(pattern.rules).forEach(formName => {
      const form = this.generateNounForm(lang, singular, formName);
      if (form) {
        result[formName] = form;
      }
    });

    // Add irregular overrides
    if (noun.irregular) {
      Object.assign(result, noun.irregular);
    }

    return result;
  }

  getAllAdjectiveForms(lang: Language, base: string): { [formName: string]: string } | null {
    const adj = this.adjectives.get(lang)?.get(base);
    if (!adj) return null;

    const pattern = this.adjectivePatterns.get(lang)?.get(adj.pattern);
    if (!pattern) return null;

    const result: { [formName: string]: string } = {};
    Object.keys(pattern.rules).forEach(formName => {
      const form = this.generateAdjectiveForm(lang, base, formName);
      if (form) {
        result[formName] = form;
      }
    });

    // Add irregular overrides
    if (adj.irregular) {
      Object.assign(result, adj.irregular);
    }

    return result;
  }

  getStats(lang: Language): { verbs: number; nouns: number; adjectives: number } {
    return {
      verbs: this.verbs.get(lang)?.size || 0,
      nouns: this.nouns.get(lang)?.size || 0,
      adjectives: this.adjectives.get(lang)?.size || 0
    };
  }

  // ============================================================================
  // BULK LOADING FROM JSON
  // ============================================================================

  async loadLanguageData(lang: Language): Promise<void> {
    try {
      // Use import.meta.env.BASE_URL to work with vite base path
      const basePath = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${basePath}morphology/patterns/${this.getLanguageCode(lang)}.json`);
      const data = await response.json();

      // Load patterns
      if (data.verbPatterns) {
        data.verbPatterns.forEach((pattern: any) => {
          this.registerVerbPattern(lang, this.deserializeVerbPattern(pattern));
        });
      }

      if (data.nounPatterns) {
        data.nounPatterns.forEach((pattern: any) => {
          this.registerNounPattern(lang, this.deserializeNounPattern(pattern));
        });
      }

      if (data.adjectivePatterns) {
        data.adjectivePatterns.forEach((pattern: any) => {
          this.registerAdjectivePattern(lang, this.deserializeAdjectivePattern(pattern));
        });
      }

      // Load words
      if (data.verbs) {
        data.verbs.forEach((verb: VerbEntry) => {
          this.registerVerb(lang, verb);
        });
      }

      if (data.nouns) {
        data.nouns.forEach((noun: NounEntry) => {
          this.registerNoun(lang, noun);
        });
      }

      if (data.adjectives) {
        data.adjectives.forEach((adj: AdjectiveEntry) => {
          this.registerAdjective(lang, adj);
        });
      }

      console.log(`[Morphology] Loaded pattern-based data for ${lang}`);
    } catch (error) {
      console.warn(`[Morphology] Failed to load pattern data for ${lang}:`, error);
    }
  }

  private getLanguageCode(lang: Language): string {
    const codes: Record<Language, string> = {
      [Language.SPANISH]: 'es',
      [Language.FRENCH]: 'fr',
      [Language.ITALIAN]: 'it',
      [Language.PORTUGUESE]: 'pt',
      [Language.GERMAN]: 'de',
      [Language.RUSSIAN]: 'ru',
      [Language.POLISH]: 'pl',
      [Language.CZECH]: 'cs',
      [Language.UKRAINIAN]: 'uk',
      [Language.JAPANESE]: 'ja',
      [Language.MANDARIN]: 'zh',
      [Language.ENGLISH]: 'en'
    };
    return codes[lang] || lang.toLowerCase();
  }

  // Deserialize patterns from JSON (functions are stored as strings and eval'd)
  private deserializeVerbPattern(data: any): VerbPattern {
    const rules: { [key: string]: (base: string, stem?: string) => string } = {};

    for (const formName in data.rules) {
      const ruleStr = data.rules[formName];
      // Rules are stored as strings like "(base, stem) => stem + 'o'"
      rules[formName] = new Function('base', 'stem', `return ${ruleStr}`) as any;
    }

    return {
      name: data.name,
      description: data.description,
      rules,
      getStem: data.getStem ? new Function('infinitive', `return ${data.getStem}`) as any : undefined
    };
  }

  private deserializeNounPattern(data: any): NounPattern {
    const rules: { [key: string]: (base: string) => string } = {};

    for (const formName in data.rules) {
      const ruleStr = data.rules[formName];
      rules[formName] = new Function('base', `return ${ruleStr}`) as any;
    }

    return {
      name: data.name,
      description: data.description,
      gender: data.gender,
      rules
    };
  }

  private deserializeAdjectivePattern(data: any): AdjectivePattern {
    const rules: { [key: string]: (base: string) => string } = {};

    for (const formName in data.rules) {
      const ruleStr = data.rules[formName];
      rules[formName] = new Function('base', `return ${ruleStr}`) as any;
    }

    return {
      name: data.name,
      description: data.description,
      rules
    };
  }
}

// Singleton instance
let patternEngine: PatternBasedMorphologyEngine | null = null;

export function getPatternBasedMorphologyEngine(): PatternBasedMorphologyEngine {
  if (!patternEngine) {
    patternEngine = new PatternBasedMorphologyEngine();
  }
  return patternEngine;
}
