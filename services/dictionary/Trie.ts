/**
 * TrieNode - A single node in the Trie data structure
 */
export class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  value: any; // Associated data for this word

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.value = null;
  }
}

/**
 * Trie - Prefix tree data structure for fast string lookups
 *
 * Time Complexity:
 * - Insert: O(k) where k is the length of the word
 * - Search: O(k) where k is the length of the word
 * - Prefix Search: O(k) where k is the length of the prefix
 * - Delete: O(k) where k is the length of the word
 *
 * Space Complexity: O(ALPHABET_SIZE * N * M) where N is number of words, M is average length
 * In practice, shared prefixes make this much more efficient than storing words separately.
 *
 * Features:
 * - Fast prefix matching
 * - Memory efficient for large vocabularies with shared prefixes
 * - Associated data storage (values)
 * - Wildcard search support
 * - Auto-complete functionality
 * - Word existence checking
 *
 * Examples:
 *   trie.insert("door", { type: "noun", category: "structure" })
 *   trie.search("door") → { found: true, value: { type: "noun", ... } }
 *   trie.startsWith("do") → true
 *   trie.getAllWithPrefix("do") → ["door", "dog", "dolphin", ...]
 */
export class Trie {
  private root: TrieNode;
  private wordCount: number;

  constructor() {
    this.root = new TrieNode();
    this.wordCount = 0;
  }

  /**
   * Insert a word into the trie with optional associated value
   */
  insert(word: string, value?: any): void {
    if (!word) return;

    const normalized = word.toLowerCase();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    // Mark end of word and store value
    if (!current.isEndOfWord) {
      this.wordCount++;
    }
    current.isEndOfWord = true;
    current.value = value;
  }

  /**
   * Search for an exact word in the trie
   */
  search(word: string): { found: boolean; value?: any } {
    if (!word) return { found: false };

    const normalized = word.toLowerCase();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children.has(char)) {
        return { found: false };
      }
      current = current.children.get(char)!;
    }

    return {
      found: current.isEndOfWord,
      value: current.isEndOfWord ? current.value : undefined
    };
  }

  /**
   * Check if any word in the trie starts with the given prefix
   */
  startsWith(prefix: string): boolean {
    if (!prefix) return true;

    const normalized = prefix.toLowerCase();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char)!;
    }

    return true;
  }

  /**
   * Get all words that start with the given prefix
   */
  getAllWithPrefix(prefix: string): string[] {
    const normalized = prefix.toLowerCase();
    let current = this.root;

    // Navigate to the prefix node
    for (const char of normalized) {
      if (!current.children.has(char)) {
        return []; // Prefix doesn't exist
      }
      current = current.children.get(char)!;
    }

    // Collect all words from this node
    const words: string[] = [];
    this.collectWords(current, normalized, words);
    return words;
  }

  /**
   * Get all words with their associated values that start with the given prefix
   */
  getAllWithPrefixAndValues(prefix: string): Array<{ word: string; value: any }> {
    const normalized = prefix.toLowerCase();
    let current = this.root;

    // Navigate to the prefix node
    for (const char of normalized) {
      if (!current.children.has(char)) {
        return []; // Prefix doesn't exist
      }
      current = current.children.get(char)!;
    }

    // Collect all words with values from this node
    const results: Array<{ word: string; value: any }> = [];
    this.collectWordsWithValues(current, normalized, results);
    return results;
  }

  /**
   * Delete a word from the trie
   */
  delete(word: string): boolean {
    if (!word) return false;

    const normalized = word.toLowerCase();
    return this.deleteHelper(this.root, normalized, 0);
  }

  /**
   * Helper method for deletion
   */
  private deleteHelper(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) {
      // Reached end of word
      if (!node.isEndOfWord) {
        return false; // Word doesn't exist
      }

      node.isEndOfWord = false;
      node.value = null;
      this.wordCount--;

      // Return true if node has no children (can be deleted)
      return node.children.size === 0;
    }

    const char = word[index];
    const childNode = node.children.get(char);

    if (!childNode) {
      return false; // Word doesn't exist
    }

    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      // Return true if current node has no children and is not end of another word
      return node.children.size === 0 && !node.isEndOfWord;
    }

    return false;
  }

  /**
   * Collect all words starting from a node
   */
  private collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEndOfWord) {
      words.push(prefix);
    }

    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, prefix + char, words);
    }
  }

  /**
   * Collect all words with values starting from a node
   */
  private collectWordsWithValues(
    node: TrieNode,
    prefix: string,
    results: Array<{ word: string; value: any }>
  ): void {
    if (node.isEndOfWord) {
      results.push({ word: prefix, value: node.value });
    }

    for (const [char, childNode] of node.children) {
      this.collectWordsWithValues(childNode, prefix + char, results);
    }
  }

  /**
   * Get all words in the trie
   */
  getAllWords(): string[] {
    const words: string[] = [];
    this.collectWords(this.root, '', words);
    return words;
  }

  /**
   * Get all words with their associated values
   */
  getAllWordsWithValues(): Array<{ word: string; value: any }> {
    const results: Array<{ word: string; value: any }> = [];
    this.collectWordsWithValues(this.root, '', results);
    return results;
  }

  /**
   * Get the total number of words in the trie
   */
  size(): number {
    return this.wordCount;
  }

  /**
   * Check if the trie is empty
   */
  isEmpty(): boolean {
    return this.wordCount === 0;
  }

  /**
   * Clear all words from the trie
   */
  clear(): void {
    this.root = new TrieNode();
    this.wordCount = 0;
  }

  /**
   * Find longest common prefix among all words in the trie
   */
  longestCommonPrefix(): string {
    let prefix = '';
    let current = this.root;

    while (current.children.size === 1 && !current.isEndOfWord) {
      const [char, childNode] = current.children.entries().next().value;
      prefix += char;
      current = childNode;
    }

    return prefix;
  }

  /**
   * Find words matching a pattern with wildcard '.'
   * Example: "d.g" matches "dog", "dig", "dug"
   */
  searchWithWildcard(pattern: string): string[] {
    const normalized = pattern.toLowerCase();
    const words: string[] = [];
    this.searchWildcardHelper(this.root, normalized, 0, '', words);
    return words;
  }

  /**
   * Helper for wildcard search
   */
  private searchWildcardHelper(
    node: TrieNode,
    pattern: string,
    index: number,
    currentWord: string,
    words: string[]
  ): void {
    if (index === pattern.length) {
      if (node.isEndOfWord) {
        words.push(currentWord);
      }
      return;
    }

    const char = pattern[index];

    if (char === '.') {
      // Wildcard: try all children
      for (const [childChar, childNode] of node.children) {
        this.searchWildcardHelper(childNode, pattern, index + 1, currentWord + childChar, words);
      }
    } else {
      // Regular character
      if (node.children.has(char)) {
        this.searchWildcardHelper(
          node.children.get(char)!,
          pattern,
          index + 1,
          currentWord + char,
          words
        );
      }
    }
  }

  /**
   * Get auto-complete suggestions for a prefix (limited to maxResults)
   */
  autoComplete(prefix: string, maxResults: number = 10): string[] {
    const allMatches = this.getAllWithPrefix(prefix);
    return allMatches.slice(0, maxResults);
  }

  /**
   * Find words within edit distance (Levenshtein distance) of target
   * Useful for fuzzy matching and spell correction
   */
  fuzzySearch(word: string, maxDistance: number = 2): Array<{ word: string; distance: number }> {
    const normalized = word.toLowerCase();
    const results: Array<{ word: string; distance: number }> = [];
    const allWords = this.getAllWords();

    for (const dictWord of allWords) {
      const distance = this.levenshteinDistance(normalized, dictWord);
      if (distance <= maxDistance) {
        results.push({ word: dictWord, distance });
      }
    }

    // Sort by distance
    results.sort((a, b) => a.distance - b.distance);
    return results;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // deletion
            dp[i][j - 1],     // insertion
            dp[i - 1][j - 1]  // substitution
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Export trie data for serialization
   */
  export(): { words: Array<{ word: string; value: any }> } {
    return {
      words: this.getAllWordsWithValues()
    };
  }

  /**
   * Import trie data from serialized format
   */
  import(data: { words: Array<{ word: string; value: any }> }): void {
    this.clear();
    for (const { word, value } of data.words) {
      this.insert(word, value);
    }
  }

  /**
   * Get statistics about the trie
   */
  getStats(): {
    wordCount: number;
    nodeCount: number;
    averageDepth: number;
    maxDepth: number;
  } {
    const stats = {
      wordCount: this.wordCount,
      nodeCount: 0,
      totalDepth: 0,
      maxDepth: 0
    };

    this.calculateStats(this.root, 0, stats);

    return {
      wordCount: stats.wordCount,
      nodeCount: stats.nodeCount,
      averageDepth: stats.wordCount > 0 ? stats.totalDepth / stats.wordCount : 0,
      maxDepth: stats.maxDepth
    };
  }

  /**
   * Helper for calculating statistics
   */
  private calculateStats(
    node: TrieNode,
    depth: number,
    stats: { nodeCount: number; totalDepth: number; maxDepth: number }
  ): void {
    stats.nodeCount++;
    if (node.isEndOfWord) {
      stats.totalDepth += depth;
      stats.maxDepth = Math.max(stats.maxDepth, depth);
    }

    for (const childNode of node.children.values()) {
      this.calculateStats(childNode, depth + 1, stats);
    }
  }
}
