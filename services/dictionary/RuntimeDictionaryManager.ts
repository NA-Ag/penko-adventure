import { DictionaryTrie, WordType, WordMetadata } from './DictionaryTrie';
import { GameObject, ObjectProperties } from '../../types/game.types';

/**
 * User-defined word entry
 */
export interface UserDefinedWord {
  word: string;
  metadata: WordMetadata;
  createdAt: number;
  createdBy: string; // User ID or "player"
  usageCount: number;
  lastUsedAt: number;
  source: 'user' | 'community' | 'ai_generated';
  isApproved: boolean; // For community words, requires moderation
  tags?: string[]; // For organization
}

/**
 * Custom object template created by user
 */
export interface CustomObjectTemplate {
  noun: string;
  baseProperties: ObjectProperties;
  allowedActions: string[];
  createdAt: number;
  createdBy: string;
  usageCount: number;
  lastUsedAt: number;
  isPublic: boolean; // Can be shared with community
  description?: string;
}

/**
 * Runtime dictionary statistics
 */
export interface RuntimeDictionaryStats {
  totalUserWords: number;
  totalCustomObjects: number;
  wordsByType: Record<WordType, number>;
  wordsBySource: Record<'user' | 'community' | 'ai_generated', number>;
  mostUsedWords: Array<{ word: string; count: number }>;
  recentWords: Array<{ word: string; timestamp: number }>;
  storageSize: number; // bytes
}

/**
 * Export format for user dictionary
 */
export interface UserDictionaryExport {
  version: string;
  exportedAt: number;
  userId: string;
  words: UserDefinedWord[];
  objects: CustomObjectTemplate[];
}

/**
 * RuntimeDictionaryManager - Manages user-defined words and custom objects
 *
 * Features:
 * - Add custom words during gameplay
 * - Persist user dictionary across sessions
 * - Track word usage statistics
 * - Support for community word sharing (future)
 * - AI-assisted word generation
 * - Custom object templates
 * - Import/export user dictionary
 * - Merge with base dictionary
 *
 * Examples:
 *   manager.addUserWord("lightsaber", { type: WordType.NOUN, category: "weapon", properties: { scifi: true } })
 *   manager.addCustomObject("dragon", baseProperties, allowedActions)
 *   manager.save() // Persist to localStorage
 *   manager.load() // Restore from localStorage
 *   manager.export() // Get shareable dictionary
 */
export class RuntimeDictionaryManager {
  private baseDictionary: DictionaryTrie;
  private userWords: Map<string, UserDefinedWord>;
  private customObjects: Map<string, CustomObjectTemplate>;
  private userId: string;
  private storageKey: string;
  private autoSave: boolean;
  private maxStorageSize: number; // Maximum size in bytes (default 5MB)

  constructor(
    baseDictionary: DictionaryTrie,
    userId: string = 'player',
    options: {
      storageKey?: string;
      autoSave?: boolean;
      maxStorageSize?: number;
    } = {}
  ) {
    this.baseDictionary = baseDictionary;
    this.userId = userId;
    this.userWords = new Map();
    this.customObjects = new Map();
    this.storageKey = options.storageKey || `penko_user_dictionary_${userId}`;
    this.autoSave = options.autoSave !== false; // Default true
    this.maxStorageSize = options.maxStorageSize || 5 * 1024 * 1024; // 5MB default
  }

  // ============================================================================
  // Word Management
  // ============================================================================

  /**
   * Add a user-defined word to the runtime dictionary
   */
  addUserWord(
    word: string,
    metadata: WordMetadata,
    options: {
      source?: 'user' | 'community' | 'ai_generated';
      tags?: string[];
    } = {}
  ): { success: boolean; message: string } {
    if (!word) {
      return { success: false, message: 'Word cannot be empty' };
    }

    const normalized = word.toLowerCase().trim();

    // Check if word already exists in base dictionary
    if (this.baseDictionary.hasWord(normalized)) {
      return {
        success: false,
        message: `Word "${normalized}" already exists in base dictionary`
      };
    }

    // Check if word already exists in user dictionary
    const existing = this.userWords.get(normalized);
    if (existing) {
      // Update usage count
      existing.usageCount++;
      existing.lastUsedAt = Date.now();
      return {
        success: true,
        message: `Word "${normalized}" already exists, usage count updated`
      };
    }

    // Validate word format (alphanumeric and basic punctuation)
    if (!/^[a-zA-Z0-9\-_']+$/.test(normalized)) {
      return {
        success: false,
        message: 'Word contains invalid characters'
      };
    }

    // Create user word entry
    const userWord: UserDefinedWord = {
      word: normalized,
      metadata,
      createdAt: Date.now(),
      createdBy: this.userId,
      usageCount: 1,
      lastUsedAt: Date.now(),
      source: options.source || 'user',
      isApproved: options.source === 'user', // User words auto-approved
      tags: options.tags || []
    };

    // Add to user dictionary
    this.userWords.set(normalized, userWord);

    // Add to base dictionary for runtime lookups
    this.baseDictionary.addWord(normalized, metadata);

    if (this.autoSave) {
      this.save();
    }

    return {
      success: true,
      message: `Word "${normalized}" added successfully`
    };
  }

  /**
   * Remove a user-defined word
   */
  removeUserWord(word: string): boolean {
    const normalized = word.toLowerCase().trim();
    const removed = this.userWords.delete(normalized);

    if (removed) {
      // Also remove from base dictionary
      this.baseDictionary.removeWord(normalized);

      if (this.autoSave) {
        this.save();
      }
    }

    return removed;
  }

  /**
   * Check if word is user-defined
   */
  isUserWord(word: string): boolean {
    const normalized = word.toLowerCase().trim();
    return this.userWords.has(normalized);
  }

  /**
   * Get user word details
   */
  getUserWord(word: string): UserDefinedWord | null {
    const normalized = word.toLowerCase().trim();
    return this.userWords.get(normalized) || null;
  }

  /**
   * Get all user-defined words
   */
  getAllUserWords(): UserDefinedWord[] {
    return Array.from(this.userWords.values());
  }

  /**
   * Get user words by type
   */
  getUserWordsByType(type: WordType): UserDefinedWord[] {
    return Array.from(this.userWords.values()).filter(
      w => w.metadata.type === type
    );
  }

  /**
   * Get user words by source
   */
  getUserWordsBySource(source: 'user' | 'community' | 'ai_generated'): UserDefinedWord[] {
    return Array.from(this.userWords.values()).filter(
      w => w.source === source
    );
  }

  /**
   * Update word usage statistics
   */
  recordWordUsage(word: string): void {
    const normalized = word.toLowerCase().trim();
    const userWord = this.userWords.get(normalized);

    if (userWord) {
      userWord.usageCount++;
      userWord.lastUsedAt = Date.now();

      if (this.autoSave) {
        this.save();
      }
    }
  }

  // ============================================================================
  // Custom Object Management
  // ============================================================================

  /**
   * Add a custom object template
   */
  addCustomObject(
    noun: string,
    baseProperties: ObjectProperties,
    allowedActions: string[],
    options: {
      description?: string;
      isPublic?: boolean;
    } = {}
  ): { success: boolean; message: string } {
    if (!noun) {
      return { success: false, message: 'Object name cannot be empty' };
    }

    const normalized = noun.toLowerCase().trim();

    // Check if object already exists
    const existing = this.customObjects.get(normalized);
    if (existing) {
      existing.usageCount++;
      existing.lastUsedAt = Date.now();
      return {
        success: true,
        message: `Object "${normalized}" already exists, usage count updated`
      };
    }

    // Create custom object template
    const customObject: CustomObjectTemplate = {
      noun: normalized,
      baseProperties,
      allowedActions,
      createdAt: Date.now(),
      createdBy: this.userId,
      usageCount: 1,
      lastUsedAt: Date.now(),
      isPublic: options.isPublic || false,
      description: options.description
    };

    this.customObjects.set(normalized, customObject);

    // Also add the noun to the dictionary
    this.addUserWord(normalized, {
      type: WordType.NOUN,
      category: baseProperties.category || 'custom',
      properties: { isCustomObject: true }
    });

    if (this.autoSave) {
      this.save();
    }

    return {
      success: true,
      message: `Custom object "${normalized}" created successfully`
    };
  }

  /**
   * Get custom object template
   */
  getCustomObject(noun: string): CustomObjectTemplate | null {
    const normalized = noun.toLowerCase().trim();
    return this.customObjects.get(normalized) || null;
  }

  /**
   * Check if object is custom
   */
  isCustomObject(noun: string): boolean {
    const normalized = noun.toLowerCase().trim();
    return this.customObjects.has(normalized);
  }

  /**
   * Remove custom object
   */
  removeCustomObject(noun: string): boolean {
    const normalized = noun.toLowerCase().trim();
    const removed = this.customObjects.delete(normalized);

    if (removed) {
      // Also remove from user words
      this.removeUserWord(normalized);

      if (this.autoSave) {
        this.save();
      }
    }

    return removed;
  }

  /**
   * Get all custom objects
   */
  getAllCustomObjects(): CustomObjectTemplate[] {
    return Array.from(this.customObjects.values());
  }

  /**
   * Update object usage statistics
   */
  recordObjectUsage(noun: string): void {
    const normalized = noun.toLowerCase().trim();
    const customObject = this.customObjects.get(normalized);

    if (customObject) {
      customObject.usageCount++;
      customObject.lastUsedAt = Date.now();

      if (this.autoSave) {
        this.save();
      }
    }
  }

  // ============================================================================
  // AI-Assisted Word Generation
  // ============================================================================

  /**
   * Generate word suggestions based on user input
   */
  suggestSimilarWords(word: string, maxSuggestions: number = 5): string[] {
    const normalized = word.toLowerCase().trim();
    return this.baseDictionary.findSimilarWords(normalized, maxSuggestions);
  }

  /**
   * Auto-generate metadata for a word based on context
   */
  generateMetadata(word: string, context?: string): WordMetadata {
    const normalized = word.toLowerCase().trim();

    // Simple heuristic-based metadata generation
    // In a real implementation, this would use AI/ML

    // Check common patterns
    if (normalized.endsWith('ing')) {
      return { type: WordType.VERB, category: 'action' };
    }

    if (normalized.endsWith('ly')) {
      return { type: WordType.ADVERB, category: 'modifier' };
    }

    // Check if word ends with common adjective suffixes
    const adjectiveSuffixes = ['ful', 'less', 'ous', 'ive', 'able', 'ible'];
    if (adjectiveSuffixes.some(suffix => normalized.endsWith(suffix))) {
      return { type: WordType.ADJECTIVE, category: 'quality' };
    }

    // Default to noun
    return { type: WordType.NOUN, category: 'object' };
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get runtime dictionary statistics
   */
  getStats(): RuntimeDictionaryStats {
    const wordsByType: Record<WordType, number> = {
      [WordType.NOUN]: 0,
      [WordType.ADJECTIVE]: 0,
      [WordType.VERB]: 0,
      [WordType.ADVERB]: 0,
      [WordType.PREPOSITION]: 0,
      [WordType.CONJUNCTION]: 0,
      [WordType.ARTICLE]: 0,
      [WordType.PRONOUN]: 0
    };

    const wordsBySource: Record<'user' | 'community' | 'ai_generated', number> = {
      user: 0,
      community: 0,
      ai_generated: 0
    };

    for (const word of this.userWords.values()) {
      wordsByType[word.metadata.type]++;
      wordsBySource[word.source]++;
    }

    // Get most used words
    const mostUsedWords = Array.from(this.userWords.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map(w => ({ word: w.word, count: w.usageCount }));

    // Get recent words
    const recentWords = Array.from(this.userWords.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(w => ({ word: w.word, timestamp: w.createdAt }));

    // Calculate storage size
    const storageSize = new Blob([JSON.stringify(this.export())]).size;

    return {
      totalUserWords: this.userWords.size,
      totalCustomObjects: this.customObjects.size,
      wordsByType,
      wordsBySource,
      mostUsedWords,
      recentWords,
      storageSize
    };
  }

  /**
   * Check if storage is approaching limit
   */
  isStorageNearLimit(): boolean {
    const stats = this.getStats();
    return stats.storageSize > this.maxStorageSize * 0.8; // 80% threshold
  }

  // ============================================================================
  // Persistence
  // ============================================================================

  /**
   * Save user dictionary to localStorage
   */
  save(): { success: boolean; message: string } {
    try {
      const data = this.export();
      const json = JSON.stringify(data);
      const size = new Blob([json]).size;

      if (size > this.maxStorageSize) {
        return {
          success: false,
          message: `Storage limit exceeded (${(size / 1024 / 1024).toFixed(2)}MB / ${(this.maxStorageSize / 1024 / 1024).toFixed(2)}MB)`
        };
      }

      localStorage.setItem(this.storageKey, json);

      return {
        success: true,
        message: `Dictionary saved (${(size / 1024).toFixed(2)}KB)`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save: ${error}`
      };
    }
  }

  /**
   * Load user dictionary from localStorage
   */
  load(): { success: boolean; message: string; wordsLoaded?: number } {
    try {
      const json = localStorage.getItem(this.storageKey);

      if (!json) {
        return {
          success: false,
          message: 'No saved dictionary found'
        };
      }

      const data = JSON.parse(json) as UserDictionaryExport;
      this.import(data);

      return {
        success: true,
        message: `Dictionary loaded successfully`,
        wordsLoaded: data.words.length
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to load: ${error}`
      };
    }
  }

  /**
   * Clear all user data
   */
  clear(): void {
    this.userWords.clear();
    this.customObjects.clear();

    if (this.autoSave) {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Export user dictionary
   */
  export(): UserDictionaryExport {
    return {
      version: '1.0',
      exportedAt: Date.now(),
      userId: this.userId,
      words: Array.from(this.userWords.values()),
      objects: Array.from(this.customObjects.values())
    };
  }

  /**
   * Import user dictionary
   */
  import(data: UserDictionaryExport): void {
    // Clear existing data
    this.userWords.clear();
    this.customObjects.clear();

    // Import words
    for (const word of data.words) {
      this.userWords.set(word.word, word);
      this.baseDictionary.addWord(word.word, word.metadata);
    }

    // Import custom objects
    for (const obj of data.objects) {
      this.customObjects.set(obj.noun, obj);
    }

    if (this.autoSave) {
      this.save();
    }
  }

  /**
   * Merge with another user's dictionary (for community sharing)
   */
  merge(otherExport: UserDictionaryExport): {
    success: boolean;
    added: number;
    skipped: number;
    conflicts: string[];
  } {
    let added = 0;
    let skipped = 0;
    const conflicts: string[] = [];

    // Merge words
    for (const word of otherExport.words) {
      if (this.userWords.has(word.word)) {
        skipped++;
        conflicts.push(word.word);
      } else if (this.baseDictionary.hasWord(word.word)) {
        skipped++;
      } else {
        // Mark as community word
        const mergedWord: UserDefinedWord = {
          ...word,
          source: 'community',
          isApproved: false, // Requires approval
          createdBy: otherExport.userId
        };
        this.userWords.set(word.word, mergedWord);
        added++;
      }
    }

    // Merge custom objects
    for (const obj of otherExport.objects) {
      if (!this.customObjects.has(obj.noun)) {
        this.customObjects.set(obj.noun, {
          ...obj,
          createdBy: otherExport.userId,
          isPublic: true
        });
        added++;
      } else {
        skipped++;
      }
    }

    if (this.autoSave) {
      this.save();
    }

    return {
      success: true,
      added,
      skipped,
      conflicts
    };
  }

  /**
   * Export to JSON file (for download)
   */
  exportToFile(): string {
    const data = this.export();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import from JSON file content
   */
  importFromFile(jsonContent: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonContent) as UserDictionaryExport;
      this.import(data);
      return {
        success: true,
        message: `Imported ${data.words.length} words and ${data.objects.length} objects`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to import: ${error}`
      };
    }
  }
}
