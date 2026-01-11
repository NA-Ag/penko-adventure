import { Trie } from './Trie';

/**
 * Word type categories
 */
export enum WordType {
  NOUN = 'noun',
  ADJECTIVE = 'adjective',
  VERB = 'verb',
  ADVERB = 'adverb',
  PREPOSITION = 'preposition',
  CONJUNCTION = 'conjunction',
  ARTICLE = 'article',
  PRONOUN = 'pronoun'
}

/**
 * Word metadata stored in the dictionary
 */
export interface WordMetadata {
  type: WordType;
  category?: string;      // e.g., "color", "size", "material" for adjectives
  modifierType?: string;  // e.g., "color", "scale", "material"
  synonyms?: string[];
  translations?: Record<string, string>; // language code -> translation
  properties?: any;       // Additional properties specific to the word
}

/**
 * Dictionary search result
 */
export interface DictionarySearchResult {
  found: boolean;
  word?: string;
  metadata?: WordMetadata;
  suggestions?: string[]; // Fuzzy match suggestions if not found
}

/**
 * DictionaryTrie - Efficient dictionary using Trie data structure
 *
 * Features:
 * - Fast O(k) lookups where k is word length (vs O(n) for linear search)
 * - Memory efficient for large vocabularies
 * - Prefix matching for auto-complete
 * - Fuzzy matching for spell correction
 * - Support for word metadata (type, category, modifiers, etc.)
 * - Runtime word addition
 * - Export/import for persistence
 *
 * Examples:
 *   dict.addWord("red", { type: WordType.ADJECTIVE, category: "color" })
 *   dict.lookup("red") → { found: true, metadata: { type: "adjective", ... } }
 *   dict.getAutoComplete("r") → ["red", "rusty", "ruby", ...]
 *   dict.fuzzyLookup("rde") → suggests "red"
 */
export class DictionaryTrie {
  private trie: Trie;
  private wordsByType: Map<WordType, Set<string>>;
  private wordsByCategory: Map<string, Set<string>>;

  constructor() {
    this.trie = new Trie();
    this.wordsByType = new Map();
    this.wordsByCategory = new Map();

    // Initialize maps
    for (const type of Object.values(WordType)) {
      this.wordsByType.set(type as WordType, new Set());
    }
  }

  /**
   * Add a word to the dictionary
   */
  addWord(word: string, metadata: WordMetadata): void {
    if (!word) return;

    const normalized = word.toLowerCase();

    // Insert into trie
    this.trie.insert(normalized, metadata);

    // Track by type
    if (this.wordsByType.has(metadata.type)) {
      this.wordsByType.get(metadata.type)!.add(normalized);
    }

    // Track by category
    if (metadata.category) {
      if (!this.wordsByCategory.has(metadata.category)) {
        this.wordsByCategory.set(metadata.category, new Set());
      }
      this.wordsByCategory.get(metadata.category)!.add(normalized);
    }
  }

  /**
   * Add multiple words at once
   */
  addWords(words: Array<{ word: string; metadata: WordMetadata }>): void {
    for (const { word, metadata } of words) {
      this.addWord(word, metadata);
    }
  }

  /**
   * Look up a word in the dictionary
   */
  lookup(word: string): DictionarySearchResult {
    if (!word) return { found: false };

    const normalized = word.toLowerCase();
    const result = this.trie.search(normalized);

    if (result.found) {
      return {
        found: true,
        word: normalized,
        metadata: result.value as WordMetadata
      };
    }

    // If not found, provide fuzzy suggestions
    const suggestions = this.fuzzyLookup(normalized, 3);

    return {
      found: false,
      suggestions: suggestions.map(s => s.word)
    };
  }

  /**
   * Check if a word exists (without metadata)
   */
  hasWord(word: string): boolean {
    if (!word) return false;
    const normalized = word.toLowerCase();
    return this.trie.search(normalized).found;
  }

  /**
   * Remove a word from the dictionary
   */
  removeWord(word: string): boolean {
    if (!word) return false;

    const normalized = word.toLowerCase();
    const result = this.trie.search(normalized);

    if (!result.found) return false;

    const metadata = result.value as WordMetadata;

    // Remove from trie
    const deleted = this.trie.delete(normalized);

    if (deleted) {
      // Remove from type tracking
      if (this.wordsByType.has(metadata.type)) {
        this.wordsByType.get(metadata.type)!.delete(normalized);
      }

      // Remove from category tracking
      if (metadata.category && this.wordsByCategory.has(metadata.category)) {
        this.wordsByCategory.get(metadata.category)!.delete(normalized);
      }
    }

    return deleted;
  }

  /**
   * Get all words of a specific type
   */
  getWordsByType(type: WordType): string[] {
    return Array.from(this.wordsByType.get(type) || []);
  }

  /**
   * Get all words in a specific category
   */
  getWordsByCategory(category: string): string[] {
    return Array.from(this.wordsByCategory.get(category) || []);
  }

  /**
   * Get auto-complete suggestions
   */
  getAutoComplete(prefix: string, maxResults: number = 10): string[] {
    if (!prefix) return [];
    return this.trie.autoComplete(prefix.toLowerCase(), maxResults);
  }

  /**
   * Get auto-complete suggestions with metadata
   */
  getAutoCompleteWithMetadata(prefix: string, maxResults: number = 10): Array<{ word: string; metadata: WordMetadata }> {
    if (!prefix) return [];

    const normalized = prefix.toLowerCase();
    const results = this.trie.getAllWithPrefixAndValues(normalized);

    return results
      .slice(0, maxResults)
      .map(r => ({ word: r.word, metadata: r.value as WordMetadata }));
  }

  /**
   * Fuzzy lookup with spell correction
   */
  fuzzyLookup(word: string, maxDistance: number = 2): Array<{ word: string; distance: number; metadata: WordMetadata }> {
    if (!word) return [];

    const normalized = word.toLowerCase();
    const fuzzyResults = this.trie.fuzzySearch(normalized, maxDistance);

    return fuzzyResults.map(r => {
      const result = this.trie.search(r.word);
      return {
        word: r.word,
        distance: r.distance,
        metadata: result.value as WordMetadata
      };
    });
  }

  /**
   * Find words matching a pattern with wildcards
   */
  searchPattern(pattern: string): string[] {
    if (!pattern) return [];
    return this.trie.searchWithWildcard(pattern.toLowerCase());
  }

  /**
   * Get all nouns
   */
  getAllNouns(): string[] {
    return this.getWordsByType(WordType.NOUN);
  }

  /**
   * Get all adjectives
   */
  getAllAdjectives(): string[] {
    return this.getWordsByType(WordType.ADJECTIVE);
  }

  /**
   * Get all verbs
   */
  getAllVerbs(): string[] {
    return this.getWordsByType(WordType.VERB);
  }

  /**
   * Get adjectives by modifier type (color, scale, material, etc.)
   */
  getAdjectivesByModifierType(modifierType: string): string[] {
    const adjectives = this.getAllAdjectives();
    const filtered: string[] = [];

    for (const adj of adjectives) {
      const result = this.trie.search(adj);
      if (result.found && result.value) {
        const metadata = result.value as WordMetadata;
        if (metadata.modifierType === modifierType) {
          filtered.push(adj);
        }
      }
    }

    return filtered;
  }

  /**
   * Get all color adjectives
   */
  getColorAdjectives(): string[] {
    return this.getAdjectivesByModifierType('color');
  }

  /**
   * Get all scale adjectives
   */
  getScaleAdjectives(): string[] {
    return this.getAdjectivesByModifierType('scale');
  }

  /**
   * Get all material adjectives
   */
  getMaterialAdjectives(): string[] {
    return this.getAdjectivesByModifierType('material');
  }

  /**
   * Get dictionary statistics
   */
  getStats(): {
    totalWords: number;
    nouns: number;
    adjectives: number;
    verbs: number;
    categories: number;
    trieStats: {
      nodeCount: number;
      averageDepth: number;
      maxDepth: number;
    };
  } {
    const trieStats = this.trie.getStats();

    return {
      totalWords: this.trie.size(),
      nouns: this.wordsByType.get(WordType.NOUN)?.size || 0,
      adjectives: this.wordsByType.get(WordType.ADJECTIVE)?.size || 0,
      verbs: this.wordsByType.get(WordType.VERB)?.size || 0,
      categories: this.wordsByCategory.size,
      trieStats: {
        nodeCount: trieStats.nodeCount,
        averageDepth: trieStats.averageDepth,
        maxDepth: trieStats.maxDepth
      }
    };
  }

  /**
   * Check if dictionary is empty
   */
  isEmpty(): boolean {
    return this.trie.isEmpty();
  }

  /**
   * Get total word count
   */
  size(): number {
    return this.trie.size();
  }

  /**
   * Clear all words
   */
  clear(): void {
    this.trie.clear();
    this.wordsByType.clear();
    this.wordsByCategory.clear();

    // Re-initialize type maps
    for (const type of Object.values(WordType)) {
      this.wordsByType.set(type as WordType, new Set());
    }
  }

  /**
   * Export dictionary data
   */
  export(): {
    words: Array<{ word: string; metadata: WordMetadata }>;
    version: string;
  } {
    const trieData = this.trie.export();

    return {
      words: trieData.words.map(w => ({
        word: w.word,
        metadata: w.value as WordMetadata
      })),
      version: '1.0'
    };
  }

  /**
   * Import dictionary data
   */
  import(data: { words: Array<{ word: string; metadata: WordMetadata }>; version?: string }): void {
    this.clear();

    // Convert to trie format and import
    const trieData = {
      words: data.words.map(w => ({
        word: w.word,
        value: w.metadata
      }))
    };

    this.trie.import(trieData);

    // Rebuild type and category indices
    for (const { word, metadata } of data.words) {
      const normalized = word.toLowerCase();

      // Track by type
      if (this.wordsByType.has(metadata.type)) {
        this.wordsByType.get(metadata.type)!.add(normalized);
      }

      // Track by category
      if (metadata.category) {
        if (!this.wordsByCategory.has(metadata.category)) {
          this.wordsByCategory.set(metadata.category, new Set());
        }
        this.wordsByCategory.get(metadata.category)!.add(normalized);
      }
    }
  }

  /**
   * Merge another dictionary into this one
   */
  merge(other: DictionaryTrie): void {
    const otherData = other.export();
    for (const { word, metadata } of otherData.words) {
      this.addWord(word, metadata);
    }
  }

  /**
   * Get all categories
   */
  getAllCategories(): string[] {
    return Array.from(this.wordsByCategory.keys());
  }

  /**
   * Check if a category exists
   */
  hasCategory(category: string): boolean {
    return this.wordsByCategory.has(category);
  }

  /**
   * Get word count by category
   */
  getWordCountByCategory(category: string): number {
    return this.wordsByCategory.get(category)?.size || 0;
  }

  /**
   * Find similar words (by edit distance)
   */
  findSimilarWords(word: string, maxResults: number = 5): string[] {
    const fuzzyResults = this.fuzzyLookup(word, 2);
    return fuzzyResults
      .slice(0, maxResults)
      .map(r => r.word);
  }

  /**
   * Bulk check word existence (optimized)
   */
  hasWords(words: string[]): boolean[] {
    return words.map(word => this.hasWord(word));
  }

  /**
   * Get random word
   */
  getRandomWord(): string | null {
    const allWords = this.trie.getAllWords();
    if (allWords.length === 0) return null;
    return allWords[Math.floor(Math.random() * allWords.length)];
  }

  /**
   * Get random word of specific type
   */
  getRandomWordOfType(type: WordType): string | null {
    const words = this.getWordsByType(type);
    if (words.length === 0) return null;
    return words[Math.floor(Math.random() * words.length)];
  }

  /**
   * Get random adjective of specific category
   */
  getRandomAdjectiveOfCategory(category: string): string | null {
    const words = this.getWordsByCategory(category);
    if (words.length === 0) return null;
    return words[Math.floor(Math.random() * words.length)];
  }
}
