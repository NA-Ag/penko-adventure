/**
 * Semantic Expander - FACADE PARITY 1.2
 *
 * Provides synonym expansion, hypernym/hyponym relationships for better NLU.
 * Enables understanding of related words without explicit vocabulary entries.
 *
 * Examples:
 * - "grab" matches "take" intent
 * - "creature" matches "dragon" object
 * - "weapon" matches any sword/axe/dagger
 *
 * Inspired by Facade's use of WordNet for semantic understanding.
 */

import type { Language } from '../../types';
import verbSynonyms from '../../data/semantics/verb_synonyms.json';
import nounRelations from '../../data/semantics/noun_relations.json';

export interface SemanticMatch {
  original: string;
  canonical: string;  // The base form (e.g., "take" for "grab")
  matchType: 'exact' | 'synonym' | 'hypernym' | 'hyponym';
  confidence: number;  // 1.0 = exact, 0.9 = synonym, 0.7 = hypernym, 0.6 = hyponym
}

/**
 * Semantic Expander - expands words to their synonyms and related terms
 */
export class SemanticExpander {
  private language: Language;
  private langCode: string;

  // Cached lookups for performance
  private synonymCache: Map<string, string[]> = new Map();
  private hypernymCache: Map<string, string[]> = new Map();
  private hyponymCache: Map<string, string[]> = new Map();
  private reverseVerbCache: Map<string, string> = new Map(); // synonym -> canonical

  // Language code mapping
  private static readonly LANG_CODES: Record<Language, string> = {
    [Language.ENGLISH]: 'en',
    [1]: 'es',  // Language.SPANISH
    [2]: 'fr',  // Language.FRENCH
    [3]: 'de',  // Language.GERMAN
    [4]: 'it',  // Language.ITALIAN
    [5]: 'ja',  // Language.JAPANESE
    [6]: 'zh',  // Language.MANDARIN
    [7]: 'ru',  // Language.RUSSIAN
    [8]: 'pt',  // Language.PORTUGUESE
    [9]: 'uk',  // Language.UKRAINIAN
    [10]: 'pl', // Language.POLISH
    [11]: 'cs'  // Language.CZECH
  };

  constructor(language: Language) {
    this.language = language;
    this.langCode = SemanticExpander.LANG_CODES[language];
    this.buildCaches();
  }

  /**
   * Build reverse lookup caches for fast synonym resolution
   */
  private buildCaches(): void {
    // Build verb synonym caches
    const verbData = (verbSynonyms as any)[this.langCode] || {};

    for (const [canonical, synonyms] of Object.entries(verbData)) {
      // Store forward lookup (canonical -> synonyms)
      this.synonymCache.set(canonical, synonyms as string[]);

      // Store reverse lookup (synonym -> canonical)
      for (const synonym of synonyms as string[]) {
        this.reverseVerbCache.set(synonym.toLowerCase(), canonical);
      }

      // Also map canonical to itself
      this.reverseVerbCache.set(canonical.toLowerCase(), canonical);
    }

    // Build noun relation caches
    const nounData = (nounRelations as any)[this.langCode] || {};

    if (nounData.hypernyms) {
      for (const [word, hypernyms] of Object.entries(nounData.hypernyms)) {
        this.hypernymCache.set(word, hypernyms as string[]);
      }
    }

    if (nounData.hyponyms) {
      for (const [word, hyponyms] of Object.entries(nounData.hyponyms)) {
        this.hyponymCache.set(word, hyponyms as string[]);
      }
    }

    console.log(`[SemanticExpander] Initialized for ${this.langCode}:`, {
      verbs: this.synonymCache.size,
      nouns: this.hypernymCache.size + this.hyponymCache.size,
      reverseCache: this.reverseVerbCache.size
    });
  }

  /**
   * Expand a word to include its synonyms
   * Returns array of related words including the original
   */
  expandWord(word: string, type: 'verb' | 'noun' = 'verb'): string[] {
    const lowered = word.toLowerCase();
    const results: string[] = [word]; // Always include original

    if (type === 'verb') {
      // Check if it's a canonical form
      const synonyms = this.synonymCache.get(lowered);
      if (synonyms) {
        results.push(...synonyms);
        return results;
      }

      // Check if it's a synonym (reverse lookup)
      const canonical = this.reverseVerbCache.get(lowered);
      if (canonical) {
        results.push(canonical);
        const moreSynonyms = this.synonymCache.get(canonical);
        if (moreSynonyms) {
          results.push(...moreSynonyms.filter(s => s !== lowered));
        }
      }
    } else if (type === 'noun') {
      // For nouns, expand to hypernyms (more general)
      const hypernyms = this.hypernymCache.get(lowered);
      if (hypernyms) {
        results.push(...hypernyms);
      }

      // Also expand to hyponyms (more specific)
      const hyponyms = this.hyponymCache.get(lowered);
      if (hyponyms) {
        results.push(...hyponyms);
      }
    }

    return [...new Set(results)]; // Remove duplicates
  }

  /**
   * Find the canonical (base) form of a word
   * E.g., "grab" -> "take", "creature" -> ["dragon", "wolf", ...]
   */
  findCanonical(word: string, type: 'verb' | 'noun' = 'verb'): SemanticMatch | null {
    const lowered = word.toLowerCase();

    if (type === 'verb') {
      // Check if it's already canonical
      if (this.synonymCache.has(lowered)) {
        return {
          original: word,
          canonical: lowered,
          matchType: 'exact',
          confidence: 1.0
        };
      }

      // Check if it's a synonym
      const canonical = this.reverseVerbCache.get(lowered);
      if (canonical) {
        return {
          original: word,
          canonical,
          matchType: 'synonym',
          confidence: 0.9
        };
      }
    } else if (type === 'noun') {
      // For nouns, check if word exists in our database
      if (this.hypernymCache.has(lowered) || this.hyponymCache.has(lowered)) {
        return {
          original: word,
          canonical: lowered,
          matchType: 'exact',
          confidence: 1.0
        };
      }

      // Check if it's a hypernym of something (more general term)
      for (const [specific, hypernyms] of this.hypernymCache.entries()) {
        if (hypernyms.includes(lowered)) {
          return {
            original: word,
            canonical: specific,
            matchType: 'hypernym',
            confidence: 0.7
          };
        }
      }

      // Check if it's a hyponym (more specific term)
      for (const [general, hyponyms] of this.hyponymCache.entries()) {
        if (hyponyms.includes(lowered)) {
          return {
            original: word,
            canonical: general,
            matchType: 'hyponym',
            confidence: 0.6
          };
        }
      }
    }

    return null;
  }

  /**
   * Match input against a target word, considering semantic relations
   * Returns confidence score (0.0-1.0)
   */
  matchWord(input: string, target: string, type: 'verb' | 'noun' = 'verb'): number {
    const inputLower = input.toLowerCase();
    const targetLower = target.toLowerCase();

    // Exact match
    if (inputLower === targetLower) {
      return 1.0;
    }

    if (type === 'verb') {
      // Check if input is synonym of target
      const targetSynonyms = this.expandWord(target, 'verb');
      if (targetSynonyms.some(s => s.toLowerCase() === inputLower)) {
        return 0.9;
      }

      // Check if both map to same canonical form
      const inputCanonical = this.reverseVerbCache.get(inputLower);
      const targetCanonical = this.reverseVerbCache.get(targetLower);

      if (inputCanonical && targetCanonical && inputCanonical === targetCanonical) {
        return 0.85;
      }
    } else if (type === 'noun') {
      // Check hypernym/hyponym relationships
      const targetHypernyms = this.hypernymCache.get(targetLower) || [];
      const targetHyponyms = this.hyponymCache.get(targetLower) || [];
      const inputHypernyms = this.hypernymCache.get(inputLower) || [];
      const inputHyponyms = this.hyponymCache.get(inputLower) || [];

      // Check if input is hypernym of target (input = "weapon", target = "sword")
      if (targetHypernyms.includes(inputLower)) {
        return 0.7;
      }

      // Check if input is hyponym of target (input = "sword", target = "weapon")
      if (targetHyponyms.includes(inputLower)) {
        return 0.6;
      }

      // Check if they share a common hypernym
      const commonHypernyms = targetHypernyms.filter(h => inputHypernyms.includes(h));
      if (commonHypernyms.length > 0) {
        return 0.5;
      }
    }

    return 0.0; // No match
  }

  /**
   * Get all possible interpretations of a word with confidence scores
   */
  getAllMatches(word: string, type: 'verb' | 'noun' = 'verb'): SemanticMatch[] {
    const matches: SemanticMatch[] = [];
    const lowered = word.toLowerCase();

    if (type === 'verb') {
      // Check canonical form
      const canonical = this.findCanonical(word, 'verb');
      if (canonical) {
        matches.push(canonical);

        // Add all synonyms
        const synonyms = this.synonymCache.get(canonical.canonical);
        if (synonyms) {
          for (const syn of synonyms) {
            if (syn.toLowerCase() !== lowered) {
              matches.push({
                original: word,
                canonical: syn,
                matchType: 'synonym',
                confidence: 0.85
              });
            }
          }
        }
      }
    } else if (type === 'noun') {
      // Add exact match
      if (this.hypernymCache.has(lowered) || this.hyponymCache.has(lowered)) {
        matches.push({
          original: word,
          canonical: lowered,
          matchType: 'exact',
          confidence: 1.0
        });
      }

      // Add hypernyms
      const hypernyms = this.hypernymCache.get(lowered);
      if (hypernyms) {
        for (const hypernym of hypernyms) {
          matches.push({
            original: word,
            canonical: hypernym,
            matchType: 'hypernym',
            confidence: 0.7
          });
        }
      }

      // Add hyponyms
      const hyponyms = this.hyponymCache.get(lowered);
      if (hyponyms) {
        for (const hyponym of hyponyms) {
          matches.push({
            original: word,
            canonical: hyponym,
            matchType: 'hyponym',
            confidence: 0.6
          });
        }
      }
    }

    return matches;
  }

  /**
   * Enhance input by replacing synonyms with canonical forms
   * E.g., "grab the sword" -> "take the sword"
   */
  normalize(input: string): string {
    const words = input.split(/\s+/);
    const normalized = words.map(word => {
      const canonical = this.findCanonical(word, 'verb');
      if (canonical && canonical.matchType === 'synonym') {
        console.log(`[SemanticExpander] Normalized "${word}" -> "${canonical.canonical}"`);
        return canonical.canonical;
      }
      return word;
    });

    return normalized.join(' ');
  }
}
