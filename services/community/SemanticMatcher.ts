/**
 * TIER 19: Semantic Matcher - Advanced NLP for Object Recognition
 *
 * This module provides AI-competitive natural language understanding
 * by using extensive synonym databases, fuzzy matching, and context awareness.
 *
 * Philosophy: Understand what the player MEANS, not just what they typed.
 */

import { levenshteinDistance } from '../utils/stringUtils';
import type { Language } from '../../types';

export interface MatchResult {
  objectId: string;
  confidence: number;  // 0.0 to 1.0
  method: 'exact' | 'synonym' | 'fuzzy' | 'partial' | 'description' | 'category';
}

/**
 * Multilingual synonym database for common objects
 * This allows the system to understand natural variations in how players refer to things
 */
const OBJECT_SYNONYMS: Record<string, string[]> = {
  // NPCs & People
  'wizard': ['mage', 'sorcerer', 'magician', 'enchanter', 'warlock', 'conjurer', 'mago', 'magicien', 'zauberer'],
  'merchant': ['trader', 'vendor', 'seller', 'shopkeeper', 'dealer', 'comerciante', 'marchand', 'händler'],
  'guard': ['soldier', 'warrior', 'sentinel', 'watchman', 'guardia', 'garde', 'wächter'],
  'bartender': ['barkeep', 'barman', 'innkeeper', 'tapster', 'cantinero', 'barman', 'barkeeper'],
  'bard': ['musician', 'minstrel', 'troubadour', 'singer', 'bardo', 'barde'],

  // Items & Objects
  'map': ['chart', 'atlas', 'guide', 'mapa', 'carte', 'karte'],
  'scroll': ['parchment', 'manuscript', 'document', 'pergamino', 'parchemin', 'pergament'],
  'key': ['lockpick', 'passkey', 'llave', 'clé', 'schlüssel'],
  'sword': ['blade', 'weapon', 'saber', 'rapier', 'espada', 'épée', 'schwert'],
  'potion': ['elixir', 'brew', 'tonic', 'draught', 'poción', 'potion', 'trank'],
  'book': ['tome', 'volume', 'manual', 'grimoire', 'libro', 'livre', 'buch'],
  'door': ['entrance', 'gateway', 'portal', 'exit', 'puerta', 'porte', 'tür'],
  'chest': ['box', 'trunk', 'coffer', 'crate', 'cofre', 'coffre', 'truhe'],
  'bread': ['loaf', 'roll', 'baguette', 'pan', 'pain', 'brot'],
  'ale': ['beer', 'drink', 'beverage', 'brew', 'cerveza', 'bière', 'bier'],

  // Locations & Features
  'forest': ['woods', 'woodland', 'grove', 'trees', 'bosque', 'forêt', 'wald'],
  'cave': ['cavern', 'grotto', 'den', 'hollow', 'cueva', 'grotte', 'höhle'],
  'mountain': ['peak', 'summit', 'hill', 'montaña', 'montagne', 'berg'],
  'river': ['stream', 'creek', 'brook', 'río', 'rivière', 'fluss'],
  'village': ['town', 'hamlet', 'settlement', 'pueblo', 'village', 'dorf'],
  'tavern': ['inn', 'pub', 'bar', 'alehouse', 'taberna', 'taverne', 'wirtshaus'],

  // Descriptors that might appear in input
  'old': ['ancient', 'aged', 'elderly', 'viejo', 'vieux', 'alt'],
  'young': ['youthful', 'joven', 'jeune', 'jung'],
  'mysterious': ['strange', 'enigmatic', 'misterioso', 'mystérieux', 'mysteriös'],
  'magic': ['magical', 'enchanted', 'arcane', 'mágico', 'magique', 'magisch'],
  'dark': ['shadowy', 'black', 'obscuro', 'sombre', 'dunkel'],
  'light': ['bright', 'luminous', 'claro', 'lumineux', 'hell']
};

/**
 * Category-based matching for genre-appropriate defaults
 */
const OBJECT_CATEGORIES: Record<string, string[]> = {
  person: ['wizard', 'merchant', 'guard', 'bartender', 'bard', 'elder', 'child', 'stranger'],
  weapon: ['sword', 'axe', 'bow', 'dagger', 'staff', 'wand'],
  container: ['chest', 'box', 'barrel', 'crate', 'bag', 'sack'],
  consumable: ['potion', 'bread', 'ale', 'food', 'water'],
  readable: ['book', 'scroll', 'map', 'note', 'letter'],
  location: ['forest', 'cave', 'mountain', 'river', 'village', 'tavern']
};

export class SemanticMatcher {
  private language: Language;

  constructor(language: Language) {
    this.language = language;
  }

  /**
   * Find the best matching object from available objects using advanced NLP
   *
   * This method uses multiple strategies in order of confidence:
   * 1. Exact name match (1.0 confidence)
   * 2. Synonym match (0.9 confidence)
   * 3. Fuzzy string match (0.7-0.9 confidence based on distance)
   * 4. Partial ID match (0.8 confidence)
   * 5. Description match (0.6 confidence)
   * 6. Category match (0.5 confidence)
   */
  findBestMatch(
    input: string,
    availableObjects: Array<{ id: string; name?: Record<Language, string>; description?: Record<Language, string> }>,
    threshold: number = 0.5
  ): MatchResult | null {
    const normalizedInput = input.toLowerCase().trim();
    const inputWords = normalizedInput.split(/\s+/).filter(w => w.length > 2);

    const matches: MatchResult[] = [];

    for (const obj of availableObjects) {
      // Strategy 1: Exact name match
      const objectName = obj.name?.[this.language]?.toLowerCase();
      if (objectName && normalizedInput.includes(objectName)) {
        matches.push({
          objectId: obj.id,
          confidence: 1.0,
          method: 'exact'
        });
        continue;
      }

      // Strategy 2: Synonym match
      const synonymMatch = this.findSynonymMatch(normalizedInput, obj.id, objectName);
      if (synonymMatch) {
        matches.push({
          objectId: obj.id,
          confidence: 0.9,
          method: 'synonym'
        });
        continue;
      }

      // Strategy 3: Fuzzy string matching
      if (objectName) {
        const distance = levenshteinDistance(normalizedInput, objectName);
        const maxLength = Math.max(normalizedInput.length, objectName.length);
        const similarity = 1 - (distance / maxLength);

        if (similarity >= 0.7) {
          matches.push({
            objectId: obj.id,
            confidence: similarity * 0.9,  // Scale to max 0.9
            method: 'fuzzy'
          });
          continue;
        }
      }

      // Strategy 4: Partial ID match (e.g., "wizard" matches "wizard_aldric")
      const lowercaseId = obj.id.toLowerCase();
      for (const word of inputWords) {
        if (lowercaseId.includes(word) || word.includes(lowercaseId.split('_')[0])) {
          matches.push({
            objectId: obj.id,
            confidence: 0.8,
            method: 'partial'
          });
          break;
        }
      }

      // Strategy 5: Description keyword match
      const description = obj.description?.[this.language]?.toLowerCase();
      if (description) {
        let matchCount = 0;
        for (const word of inputWords) {
          if (description.includes(word)) {
            matchCount++;
          }
        }

        if (inputWords.length > 0 && matchCount / inputWords.length >= 0.5) {
          matches.push({
            objectId: obj.id,
            confidence: 0.6,
            method: 'description'
          });
        }
      }

      // Strategy 6: Category-based matching
      const categoryMatch = this.findCategoryMatch(normalizedInput, obj.id);
      if (categoryMatch) {
        matches.push({
          objectId: obj.id,
          confidence: 0.5,
          method: 'category'
        });
      }
    }

    // Return highest confidence match above threshold
    if (matches.length === 0) {
      return null;
    }

    matches.sort((a, b) => b.confidence - a.confidence);
    const best = matches[0];

    return best.confidence >= threshold ? best : null;
  }

  /**
   * Check if input matches any known synonyms for this object
   */
  private findSynonymMatch(input: string, objectId: string, objectName?: string): boolean {
    // Extract base name from object ID (e.g., "wizard" from "wizard_aldric")
    const idParts = objectId.toLowerCase().split('_');
    const baseName = idParts[0];

    // Check synonyms for base name
    const synonyms = OBJECT_SYNONYMS[baseName] || [];
    for (const synonym of synonyms) {
      if (input.includes(synonym.toLowerCase())) {
        return true;
      }
    }

    // Check synonyms for object name
    if (objectName) {
      const nameWords = objectName.toLowerCase().split(/\s+/);
      for (const word of nameWords) {
        const wordSynonyms = OBJECT_SYNONYMS[word] || [];
        for (const synonym of wordSynonyms) {
          if (input.includes(synonym.toLowerCase())) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if input refers to a category that this object belongs to
   */
  private findCategoryMatch(input: string, objectId: string): boolean {
    const idParts = objectId.toLowerCase().split('_');
    const baseName = idParts[0];

    for (const [category, members] of Object.entries(OBJECT_CATEGORIES)) {
      if (input.includes(category)) {
        // Input mentions category (e.g., "person", "weapon")
        return members.includes(baseName);
      }
    }

    return false;
  }

  /**
   * Extract all possible object references from input
   * Returns array of words that might be object names
   */
  extractObjectCandidates(input: string): string[] {
    const normalizedInput = input.toLowerCase().trim();

    // Remove common action words
    const actionWords = [
      'look', 'examine', 'take', 'get', 'use', 'talk', 'speak', 'ask',
      'give', 'attack', 'eat', 'drink', 'open', 'close', 'read', 'wear',
      'the', 'a', 'an', 'at', 'to', 'with', 'on', 'in', 'about'
    ];

    const words = normalizedInput.split(/\s+/);
    const candidates = words.filter(word =>
      word.length > 2 && !actionWords.includes(word)
    );

    return candidates;
  }

  /**
   * Generate helpful suggestions when object not found
   */
  suggestAlternatives(
    input: string,
    availableObjects: Array<{ id: string; name?: Record<Language, string> }>
  ): string[] {
    const suggestions: string[] = [];

    // Get all object names
    const objectNames = availableObjects
      .map(obj => obj.name?.[this.language])
      .filter((name): name is string => !!name);

    // Find close matches using fuzzy matching
    for (const name of objectNames) {
      const distance = levenshteinDistance(input.toLowerCase(), name.toLowerCase());
      if (distance <= 3) {  // Close enough to suggest
        suggestions.push(name);
      }
    }

    return suggestions.slice(0, 3);  // Return top 3
  }
}
