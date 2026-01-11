import { DictionaryTrie, WordType, WordMetadata } from './DictionaryTrie';
import adjectivesData from '../../data/dictionaries/adjectives/en_adjectives.json';

/**
 * Adjective entry from JSON
 */
interface AdjectiveEntry {
  modifierType: string;
  category: string;
  synonyms?: string[];
  baseColor?: string;
  effect?: string;
}

/**
 * Adjective dictionary data structure
 */
interface AdjectiveDictionaryData {
  version: string;
  language: string;
  adjectives: Record<string, Record<string, AdjectiveEntry>>;
  stats: {
    totalAdjectives: number;
    byModifierType: Record<string, number>;
  };
}

/**
 * AdjectiveDictionary - Manages 500+ adjectives with synonym resolution
 *
 * Features:
 * - 500+ adjectives organized by category
 * - Synonym resolution (big → large, huge)
 * - Modifier type mapping (color, scale, material, quality, state, etc.)
 * - Fast O(k) lookups using Trie
 * - Auto-complete support
 * - Fuzzy matching for spell correction
 *
 * Categories:
 * - Colors (31): red, blue, green, crimson, azure, etc.
 * - Sizes (28): tiny, small, large, huge, gigantic, etc.
 * - Materials (20): wooden, iron, steel, glass, etc.
 * - Qualities (70): sharp, magical, powerful, beautiful, etc.
 * - States (14): open, closed, locked, broken, etc.
 * - Shapes (12): round, square, flat, curved, etc.
 * - Textures (12): smooth, rough, fuzzy, silky, etc.
 * - Ages (7): ancient, old, new, modern, etc.
 * - Themes (13): medieval, fantasy, scifi, gothic, etc.
 * - Emotions (11): happy, sad, angry, calm, etc.
 *
 * Examples:
 *   dict.lookup("red") → { modifierType: "color", category: "color" }
 *   dict.lookup("big") → resolves through synonym to "large"
 *   dict.isColor("crimson") → true
 *   dict.isSize("gigantic") → true
 *   dict.getAllByModifierType("color") → ["red", "blue", "green", ...]
 */
export class AdjectiveDictionary {
  private dict: DictionaryTrie;
  private synonymMap: Map<string, string>; // synonym → canonical word
  private modifierTypeIndex: Map<string, Set<string>>;

  constructor() {
    this.dict = new DictionaryTrie();
    this.synonymMap = new Map();
    this.modifierTypeIndex = new Map();
    this.loadAdjectives();
  }

  /**
   * Load adjectives from JSON data
   */
  private loadAdjectives(): void {
    const data = adjectivesData as AdjectiveDictionaryData;

    // Load all adjective categories
    for (const [categoryName, adjectives] of Object.entries(data.adjectives)) {
      for (const [word, entry] of Object.entries(adjectives)) {
        // Add main word
        const metadata: WordMetadata = {
          type: WordType.ADJECTIVE,
          category: entry.category,
          modifierType: entry.modifierType,
          properties: {
            baseColor: entry.baseColor,
            effect: entry.effect
          }
        };

        this.dict.addWord(word, metadata);

        // Track by modifier type
        if (!this.modifierTypeIndex.has(entry.modifierType)) {
          this.modifierTypeIndex.set(entry.modifierType, new Set());
        }
        this.modifierTypeIndex.get(entry.modifierType)!.add(word);

        // Add synonyms
        if (entry.synonyms) {
          for (const synonym of entry.synonyms) {
            // Map synonym to main word
            this.synonymMap.set(synonym.toLowerCase(), word);

            // Also add synonym to dictionary
            this.dict.addWord(synonym, {
              ...metadata,
              properties: {
                ...metadata.properties,
                isSynonym: true,
                canonicalWord: word
              }
            });

            // Track synonym in modifier type index
            this.modifierTypeIndex.get(entry.modifierType)!.add(synonym);
          }
        }
      }
    }
  }

  /**
   * Look up an adjective
   */
  lookup(word: string): { found: boolean; metadata?: WordMetadata; canonicalWord?: string } {
    const result = this.dict.lookup(word);

    if (!result.found) {
      return { found: false };
    }

    // If this is a synonym, return canonical word
    const canonical = this.synonymMap.get(word.toLowerCase());

    return {
      found: true,
      metadata: result.metadata,
      canonicalWord: canonical
    };
  }

  /**
   * Check if word is a valid adjective
   */
  isAdjective(word: string): boolean {
    return this.dict.hasWord(word);
  }

  /**
   * Get canonical form of adjective (resolves synonyms)
   */
  getCanonical(word: string): string {
    const normalized = word.toLowerCase();
    return this.synonymMap.get(normalized) || normalized;
  }

  /**
   * Check if adjective is a color
   */
  isColor(word: string): boolean {
    const result = this.lookup(word);
    return result.found && result.metadata?.modifierType === 'color';
  }

  /**
   * Check if adjective is a size
   */
  isSize(word: string): boolean {
    const result = this.lookup(word);
    return result.found && result.metadata?.modifierType === 'scale';
  }

  /**
   * Check if adjective is a material
   */
  isMaterial(word: string): boolean {
    const result = this.lookup(word);
    return result.found && result.metadata?.modifierType === 'material';
  }

  /**
   * Check if adjective is a quality
   */
  isQuality(word: string): boolean {
    const result = this.lookup(word);
    return result.found && result.metadata?.modifierType === 'quality';
  }

  /**
   * Check if adjective is a state
   */
  isState(word: string): boolean {
    const result = this.lookup(word);
    return result.found && result.metadata?.modifierType === 'state';
  }

  /**
   * Get all adjectives by modifier type
   */
  getAllByModifierType(modifierType: string): string[] {
    return Array.from(this.modifierTypeIndex.get(modifierType) || []);
  }

  /**
   * Get all color adjectives
   */
  getAllColors(): string[] {
    return this.getAllByModifierType('color');
  }

  /**
   * Get all size adjectives
   */
  getAllSizes(): string[] {
    return this.getAllByModifierType('scale');
  }

  /**
   * Get all material adjectives
   */
  getAllMaterials(): string[] {
    return this.getAllByModifierType('material');
  }

  /**
   * Get all quality adjectives
   */
  getAllQualities(): string[] {
    return this.getAllByModifierType('quality');
  }

  /**
   * Get all state adjectives
   */
  getAllStates(): string[] {
    return this.getAllByModifierType('state');
  }

  /**
   * Get auto-complete suggestions
   */
  getAutoComplete(prefix: string, maxResults: number = 10): string[] {
    return this.dict.getAutoComplete(prefix, maxResults);
  }

  /**
   * Fuzzy lookup for spell correction
   */
  fuzzyLookup(word: string, maxDistance: number = 2): Array<{ word: string; distance: number }> {
    const results = this.dict.fuzzyLookup(word, maxDistance);
    return results.map(r => ({ word: r.word, distance: r.distance }));
  }

  /**
   * Get all adjectives
   */
  getAllAdjectives(): string[] {
    return this.dict.getAllAdjectives();
  }

  /**
   * Get dictionary statistics
   */
  getStats(): {
    totalAdjectives: number;
    byModifierType: Record<string, number>;
    dictionaryStats: ReturnType<DictionaryTrie['getStats']>;
  } {
    const byModifierType: Record<string, number> = {};

    for (const [type, words] of this.modifierTypeIndex) {
      byModifierType[type] = words.size;
    }

    return {
      totalAdjectives: this.dict.size(),
      byModifierType,
      dictionaryStats: this.dict.getStats()
    };
  }

  /**
   * Get random adjective
   */
  getRandomAdjective(): string | null {
    return this.dict.getRandomWordOfType(WordType.ADJECTIVE);
  }

  /**
   * Get random adjective of specific modifier type
   */
  getRandomByModifierType(modifierType: string): string | null {
    const adjectives = this.getAllByModifierType(modifierType);
    if (adjectives.length === 0) return null;
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }

  /**
   * Get all modifier types
   */
  getAllModifierTypes(): string[] {
    return Array.from(this.modifierTypeIndex.keys());
  }

  /**
   * Check if modifier type exists
   */
  hasModifierType(modifierType: string): boolean {
    return this.modifierTypeIndex.has(modifierType);
  }

  /**
   * Get adjectives by category (color, size, material, etc.)
   */
  getAllByCategory(category: string): string[] {
    return this.dict.getWordsByCategory(category);
  }

  /**
   * Resolve multiple synonyms at once
   */
  resolveAllSynonyms(words: string[]): string[] {
    return words.map(word => this.getCanonical(word));
  }

  /**
   * Check multiple words at once
   */
  areAdjectives(words: string[]): boolean[] {
    return words.map(word => this.isAdjective(word));
  }

  /**
   * Get adjectives with specific effect
   */
  getAdjectivesWithEffect(effect: string): string[] {
    const allAdjectives = this.dict.getAllAdjectives();
    const filtered: string[] = [];

    for (const adj of allAdjectives) {
      const result = this.lookup(adj);
      if (result.found && result.metadata?.properties?.effect === effect) {
        filtered.push(adj);
      }
    }

    return filtered;
  }

  /**
   * Get damage-increasing adjectives
   */
  getDamageIncreasingAdjectives(): string[] {
    return this.getAdjectivesWithEffect('damage_increase');
  }

  /**
   * Get damage-decreasing adjectives
   */
  getDamageDecreasingAdjectives(): string[] {
    return this.getAdjectivesWithEffect('damage_decrease');
  }

  /**
   * Get weight-affecting adjectives
   */
  getWeightAffectingAdjectives(): { increasing: string[]; decreasing: string[] } {
    return {
      increasing: this.getAdjectivesWithEffect('weight_increase'),
      decreasing: this.getAdjectivesWithEffect('weight_decrease')
    };
  }

  /**
   * Search adjectives by pattern
   */
  searchPattern(pattern: string): string[] {
    return this.dict.searchPattern(pattern);
  }

  /**
   * Get similar adjectives (by edit distance)
   */
  findSimilar(word: string, maxResults: number = 5): string[] {
    return this.dict.findSimilarWords(word, maxResults);
  }
}
