/**
 * SCRIBBLENAUTS PARITY 1.4: Unknown Object Handling
 *
 * Handles creation of objects not in the known dictionary.
 * When a noun isn't recognized, this system:
 * 1. Creates a generic object based on context clues
 * 2. Infers properties from adjectives
 * 3. Uses heuristics to guess object type
 * 4. (Future) Can integrate with AI/GPT for descriptions
 *
 * Examples:
 * - "quantum blaster" → creates sci-fi weapon
 * - "telepathic helmet" → creates magical headwear
 * - "antigravity boots" → creates magical footwear
 */

import { ObjectProperties, ObjectIntent } from './ObjectSystem';
import { ObjectTemplate, ObjectCategory } from './DynamicObjectCreator';

/**
 * Context clues for inferring object type
 */
export interface InferenceContext {
  adjectives: string[];       // Adjectives describing the object
  noun: string;               // The unknown noun
  nounSuffixes: string[];     // Word endings (-er, -or, -inator, etc.)
  nounPrefixes: string[];     // Word beginnings (auto-, tele-, cyber-, etc.)
  relatedWords: string[];     // Words in compound nouns
}

/**
 * Inferred object information
 */
export interface InferredObjectInfo {
  category: ObjectCategory;
  baseProperties: ObjectProperties;
  allowedActions: ObjectIntent[];
  description: string;
  confidence: number;         // 0.0-1.0, how confident is this inference?
  inferenceMethod: string;    // How was this inferred?
  tags: string[];
}

/**
 * Generates objects for unknown nouns using inference
 */
export class UnknownObjectGenerator {
  /**
   * Infer object properties from an unknown noun and its adjectives
   */
  inferObject(noun: string, adjectives: string[]): InferredObjectInfo {
    const context = this.buildInferenceContext(noun, adjectives);

    // Try inference strategies in order of confidence
    const strategies = [
      () => this.inferFromSuffix(context),
      () => this.inferFromPrefix(context),
      () => this.inferFromCompoundWords(context),
      () => this.inferFromAdjectives(context),
      () => this.createGenericObject(context)
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result.confidence >= 0.4) {
        return result;
      }
    }

    // Fallback to generic
    return this.createGenericObject(context);
  }

  /**
   * Build inference context from noun and adjectives
   */
  private buildInferenceContext(noun: string, adjectives: string[]): InferenceContext {
    const normalized = noun.toLowerCase();

    // Extract suffixes (last 2-4 characters)
    const suffixes: string[] = [];
    if (normalized.length >= 3) suffixes.push(normalized.slice(-2));
    if (normalized.length >= 4) suffixes.push(normalized.slice(-3));
    if (normalized.length >= 5) suffixes.push(normalized.slice(-4));

    // Extract prefixes (first 3-5 characters)
    const prefixes: string[] = [];
    if (normalized.length >= 4) prefixes.push(normalized.slice(0, 3));
    if (normalized.length >= 5) prefixes.push(normalized.slice(0, 4));
    if (normalized.length >= 6) prefixes.push(normalized.slice(0, 5));

    // Split compound words (e.g., "quantum_blaster" or "quantumblaster")
    const relatedWords = this.splitCompoundWord(normalized);

    return {
      adjectives,
      noun: normalized,
      nounSuffixes: suffixes,
      nounPrefixes: prefixes,
      relatedWords
    };
  }

  /**
   * Split compound words into components
   */
  private splitCompoundWord(word: string): string[] {
    // Common compound patterns
    const knownComponents = [
      'quantum', 'cyber', 'nano', 'mega', 'ultra', 'hyper', 'super',
      'tele', 'auto', 'anti', 'proto', 'meta', 'neo', 'bio', 'geo',
      'blast', 'ray', 'beam', 'wave', 'pulse', 'shot', 'strike',
      'sword', 'blade', 'axe', 'hammer', 'staff', 'wand', 'gun',
      'helmet', 'armor', 'shield', 'boots', 'gloves', 'cloak',
      'orb', 'crystal', 'gem', 'stone', 'ring', 'amulet',
      'inator', 'ator', 'maker', 'builder', 'destroyer'
    ];

    const components: string[] = [];

    for (const component of knownComponents) {
      if (word.includes(component)) {
        components.push(component);
      }
    }

    return components;
  }

  /**
   * Infer from word suffix (e.g., -er, -or, -inator)
   */
  private inferFromSuffix(context: InferenceContext): InferredObjectInfo {
    const { noun, nounSuffixes, adjectives } = context;

    // Weapon/tool suffixes
    if (nounSuffixes.some(s => ['er', 'or', 'ator', 'inator'].includes(s))) {
      // Words ending in -er, -or, -ator, -inator are usually tools/weapons
      const isTool = this.hasTechAdjectives(adjectives);
      const isWeapon = this.hasWeaponAdjectives(adjectives) || noun.includes('blast') || noun.includes('destroy');

      if (isWeapon) {
        return {
          category: ObjectCategory.WEAPON,
          baseProperties: {
            can_be_held: true,
            damage: 15,
            weight: 5,
            traits: ['unknown', 'weapon', 'generated']
          },
          allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'ATTACK', 'THROW'],
          description: `A mysterious ${noun} that appears to be some kind of weapon.`,
          confidence: 0.7,
          inferenceMethod: 'suffix_weapon',
          tags: ['weapon', 'unknown', noun]
        };
      } else if (isTool) {
        return {
          category: ObjectCategory.TOOL,
          baseProperties: {
            can_be_held: true,
            weight: 3,
            traits: ['unknown', 'tool', 'generated']
          },
          allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE'],
          description: `A mysterious ${noun} that appears to be some kind of tool.`,
          confidence: 0.6,
          inferenceMethod: 'suffix_tool',
          tags: ['tool', 'unknown', noun]
        };
      }
    }

    return {
      category: ObjectCategory.UNKNOWN,
      baseProperties: {},
      allowedActions: [],
      description: '',
      confidence: 0,
      inferenceMethod: 'suffix_failed',
      tags: []
    };
  }

  /**
   * Infer from word prefix (e.g., quantum-, cyber-, tele-)
   */
  private inferFromPrefix(context: InferenceContext): InferredObjectInfo {
    const { noun, nounPrefixes, adjectives } = context;

    // Sci-fi/tech prefixes
    const sciFiPrefixes = ['quan', 'quant', 'cyber', 'nano', 'robo', 'tech'];
    if (nounPrefixes.some(p => sciFiPrefixes.includes(p))) {
      return {
        category: ObjectCategory.ITEM,
        baseProperties: {
          can_be_held: true,
          weight: 2,
          traits: ['unknown', 'scifi', 'technological', 'generated']
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE'],
        description: `A futuristic ${noun} with advanced technology.`,
        confidence: 0.6,
        inferenceMethod: 'prefix_scifi',
        tags: ['scifi', 'tech', 'unknown', noun]
      };
    }

    // Magic/psychic prefixes
    const magicPrefixes = ['tele', 'psycho', 'mystic', 'arcane', 'astral'];
    if (nounPrefixes.some(p => magicPrefixes.includes(p))) {
      return {
        category: ObjectCategory.MAGIC,
        baseProperties: {
          can_be_held: true,
          weight: 1,
          traits: ['unknown', 'magical', 'mystical', 'generated']
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE'],
        description: `A mystical ${noun} radiating magical energy.`,
        confidence: 0.6,
        inferenceMethod: 'prefix_magic',
        tags: ['magic', 'mystical', 'unknown', noun]
      };
    }

    // Anti- prefix (defensive items)
    if (nounPrefixes.some(p => p === 'anti')) {
      return {
        category: ObjectCategory.TOOL,
        baseProperties: {
          can_be_held: true,
          weight: 2,
          traits: ['unknown', 'protective', 'defensive', 'generated']
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'WEAR'],
        description: `A protective ${noun} designed to defend against something.`,
        confidence: 0.5,
        inferenceMethod: 'prefix_anti',
        tags: ['protective', 'defensive', 'unknown', noun]
      };
    }

    return {
      category: ObjectCategory.UNKNOWN,
      baseProperties: {},
      allowedActions: [],
      description: '',
      confidence: 0,
      inferenceMethod: 'prefix_failed',
      tags: []
    };
  }

  /**
   * Infer from compound word components
   */
  private inferFromCompoundWords(context: InferenceContext): InferredObjectInfo {
    const { noun, relatedWords, adjectives } = context;

    if (relatedWords.length === 0) {
      return {
        category: ObjectCategory.UNKNOWN,
        baseProperties: {},
        allowedActions: [],
        description: '',
        confidence: 0,
        inferenceMethod: 'compound_failed',
        tags: []
      };
    }

    // Check for weapon components
    const weaponWords = ['blast', 'ray', 'beam', 'sword', 'blade', 'axe', 'gun', 'shot', 'strike'];
    if (relatedWords.some(w => weaponWords.includes(w))) {
      return {
        category: ObjectCategory.WEAPON,
        baseProperties: {
          can_be_held: true,
          is_sharp: relatedWords.some(w => ['blade', 'sword'].includes(w)),
          damage: 12,
          weight: 4,
          traits: ['unknown', 'weapon', 'generated', ...relatedWords]
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'ATTACK', 'THROW'],
        description: `A mysterious ${noun} that functions as a weapon.`,
        confidence: 0.7,
        inferenceMethod: 'compound_weapon',
        tags: ['weapon', 'unknown', noun, ...relatedWords]
      };
    }

    // Check for armor/wearable components
    const armorWords = ['helmet', 'armor', 'shield', 'boots', 'gloves', 'cloak', 'vest'];
    if (relatedWords.some(w => armorWords.includes(w))) {
      return {
        category: ObjectCategory.ITEM,
        baseProperties: {
          can_be_held: true,
          can_be_worn: true,
          weight: 5,
          traits: ['unknown', 'armor', 'wearable', 'generated', ...relatedWords]
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'WEAR'],
        description: `A mysterious ${noun} that can be worn for protection.`,
        confidence: 0.7,
        inferenceMethod: 'compound_armor',
        tags: ['armor', 'wearable', 'unknown', noun, ...relatedWords]
      };
    }

    // Check for magical components
    const magicWords = ['orb', 'crystal', 'gem', 'stone', 'ring', 'amulet', 'wand', 'staff'];
    if (relatedWords.some(w => magicWords.includes(w))) {
      return {
        category: ObjectCategory.MAGIC,
        baseProperties: {
          can_be_held: true,
          can_be_worn: relatedWords.some(w => ['ring', 'amulet'].includes(w)),
          weight: 1,
          traits: ['unknown', 'magical', 'generated', ...relatedWords]
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'WEAR'],
        description: `A mysterious ${noun} imbued with magical power.`,
        confidence: 0.6,
        inferenceMethod: 'compound_magic',
        tags: ['magic', 'unknown', noun, ...relatedWords]
      };
    }

    return {
      category: ObjectCategory.UNKNOWN,
      baseProperties: {},
      allowedActions: [],
      description: '',
      confidence: 0,
      inferenceMethod: 'compound_no_match',
      tags: []
    };
  }

  /**
   * Infer from adjectives alone
   */
  private inferFromAdjectives(context: InferenceContext): InferredObjectInfo {
    const { noun, adjectives } = context;

    if (adjectives.length === 0) {
      return {
        category: ObjectCategory.UNKNOWN,
        baseProperties: {},
        allowedActions: [],
        description: '',
        confidence: 0,
        inferenceMethod: 'adjective_failed',
        tags: []
      };
    }

    // Magical adjectives
    if (this.hasMagicAdjectives(adjectives)) {
      return {
        category: ObjectCategory.MAGIC,
        baseProperties: {
          can_be_held: true,
          weight: 1,
          traits: ['unknown', 'magical', 'generated']
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE'],
        description: `A mysterious magical ${noun}.`,
        confidence: 0.5,
        inferenceMethod: 'adjective_magic',
        tags: ['magic', 'unknown', noun]
      };
    }

    // Weapon adjectives
    if (this.hasWeaponAdjectives(adjectives)) {
      return {
        category: ObjectCategory.WEAPON,
        baseProperties: {
          can_be_held: true,
          damage: 10,
          weight: 4,
          traits: ['unknown', 'weapon', 'generated']
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'ATTACK'],
        description: `A mysterious ${noun} that seems dangerous.`,
        confidence: 0.5,
        inferenceMethod: 'adjective_weapon',
        tags: ['weapon', 'unknown', noun]
      };
    }

    // Tech adjectives
    if (this.hasTechAdjectives(adjectives)) {
      return {
        category: ObjectCategory.TOOL,
        baseProperties: {
          can_be_held: true,
          weight: 2,
          traits: ['unknown', 'technological', 'generated']
        },
        allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE'],
        description: `A mysterious technological ${noun}.`,
        confidence: 0.4,
        inferenceMethod: 'adjective_tech',
        tags: ['tech', 'unknown', noun]
      };
    }

    return {
      category: ObjectCategory.UNKNOWN,
      baseProperties: {},
      allowedActions: [],
      description: '',
      confidence: 0,
      inferenceMethod: 'adjective_no_match',
      tags: []
    };
  }

  /**
   * Create a completely generic object
   */
  private createGenericObject(context: InferenceContext): InferredObjectInfo {
    const { noun, adjectives } = context;

    return {
      category: ObjectCategory.ITEM,
      baseProperties: {
        can_be_held: true,
        weight: 1,
        traits: ['unknown', 'generic', 'generated']
      },
      allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'THROW'],
      description: `A mysterious ${noun}. You're not quite sure what it is.`,
      confidence: 0.3,
      inferenceMethod: 'generic_fallback',
      tags: ['generic', 'unknown', noun]
    };
  }

  /**
   * Check if adjectives suggest magic
   */
  private hasMagicAdjectives(adjectives: string[]): boolean {
    const magicAdjectives = [
      'magical', 'enchanted', 'cursed', 'blessed', 'mystical', 'arcane',
      'divine', 'holy', 'sacred', 'demonic', 'celestial', 'ethereal',
      'supernatural', 'legendary', 'mythical', 'psychic', 'telepathic'
    ];

    return adjectives.some(adj => magicAdjectives.includes(adj.toLowerCase()));
  }

  /**
   * Check if adjectives suggest weapon
   */
  private hasWeaponAdjectives(adjectives: string[]): boolean {
    const weaponAdjectives = [
      'sharp', 'deadly', 'lethal', 'dangerous', 'powerful', 'destructive',
      'cutting', 'slashing', 'piercing', 'explosive', 'devastating'
    ];

    return adjectives.some(adj => weaponAdjectives.includes(adj.toLowerCase()));
  }

  /**
   * Check if adjectives suggest technology
   */
  private hasTechAdjectives(adjectives: string[]): boolean {
    const techAdjectives = [
      'quantum', 'cyber', 'digital', 'electronic', 'mechanical', 'robotic',
      'automated', 'advanced', 'futuristic', 'technological', 'scientific',
      'nano', 'micro', 'sonic', 'laser', 'plasma'
    ];

    return adjectives.some(adj => techAdjectives.includes(adj.toLowerCase()));
  }

  /**
   * Generate an AI-powered description (placeholder for future GPT integration)
   */
  async generateAIDescription(noun: string, adjectives: string[]): Promise<string> {
    // Future: Integrate with GPT/Claude API
    // For now, return a template-based description
    const adjectiveString = adjectives.length > 0 ? adjectives.join(' ') + ' ' : '';
    return `A mysterious ${adjectiveString}${noun}. Its purpose is unclear, but it seems intriguing.`;
  }

  /**
   * Suggest similar known objects
   */
  suggestSimilarObjects(noun: string): string[] {
    // Future: Use fuzzy matching or word embeddings
    // For now, return empty array
    return [];
  }

  /**
   * Convert inferred info to ObjectTemplate
   */
  toTemplate(inferred: InferredObjectInfo, noun: string): ObjectTemplate {
    return {
      type: noun,
      baseProperties: inferred.baseProperties,
      allowedActions: inferred.allowedActions,
      category: inferred.category,
      tags: inferred.tags
    };
  }
}
