/**
 * SCRIBBLENAUTS PARITY 1.2: Adjective-Noun Parsing
 *
 * Advanced parser that separates adjectives from nouns in user input.
 * Handles complex patterns like:
 * - "big red door"
 * - "door that is big and red"
 * - "a really sharp sword"
 * - "the tiny magical dragon"
 *
 * This is more sophisticated than the simple word-splitting in DynamicObjectCreator.
 */

import { Language } from '../../types';

/**
 * Parsed adjective-noun structure
 */
export interface AdjectiveNounParse {
  adjectives: string[];       // All modifiers extracted
  noun: string;               // The main object noun
  determiners: string[];      // Articles, quantifiers (a, the, some, etc.)
  intensifiers: string[];     // Degree words (very, really, extremely, etc.)
  confidence: number;         // 0.0-1.0, parsing confidence
  parseMethod: string;        // How it was parsed (for debugging)
}

/**
 * Advanced adjective-noun parser with pattern matching
 */
export class AdjectiveNounParser {
  private language: Language;

  // Common determiners (articles, quantifiers)
  private determiners: Set<string> = new Set([
    'a', 'an', 'the', 'some', 'any', 'this', 'that', 'these', 'those',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'one', 'two', 'three', 'several', 'many', 'few', 'all', 'both'
  ]);

  // Intensifiers (degree adverbs)
  private intensifiers: Set<string> = new Set([
    'very', 'really', 'extremely', 'quite', 'rather', 'pretty',
    'super', 'ultra', 'mega', 'incredibly', 'absolutely', 'totally',
    'somewhat', 'fairly', 'slightly', 'barely', 'hardly'
  ]);

  // Conjunctions used in descriptions
  private conjunctions: Set<string> = new Set([
    'and', 'or', 'but', 'with'
  ]);

  // Relative pronouns and connectors
  private relativeWords: Set<string> = new Set([
    'that', 'which', 'who', 'is', 'are', 'was', 'were', 'has', 'have'
  ]);

  // Common prepositions
  private prepositions: Set<string> = new Set([
    'of', 'in', 'on', 'at', 'to', 'for', 'from', 'by', 'with', 'about'
  ]);

  constructor(language: Language = Language.ENGLISH) {
    this.language = language;
  }

  /**
   * Parse a description into adjectives and noun
   */
  parse(description: string): AdjectiveNounParse {
    const normalized = description.toLowerCase().trim();

    if (!normalized) {
      return {
        adjectives: [],
        noun: '',
        determiners: [],
        intensifiers: [],
        confidence: 0,
        parseMethod: 'empty'
      };
    }

    // Try different parsing strategies in order of sophistication
    const strategies = [
      () => this.parseRelativeClause(normalized),
      () => this.parseCompoundAdjectives(normalized),
      () => this.parseWithIntensifiers(normalized),
      () => this.parseSimple(normalized)
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result.confidence > 0.5) {
        return result;
      }
    }

    // Fallback to simple parsing
    return this.parseSimple(normalized);
  }

  /**
   * Parse relative clause patterns: "door that is big and red"
   */
  private parseRelativeClause(text: string): AdjectiveNounParse {
    // Pattern: NOUN + that/which + is/are + ADJECTIVES
    const relativePattern = /^(.+?)\s+(that|which)\s+(is|are|was|were)\s+(.+)$/;
    const match = text.match(relativePattern);

    if (match) {
      const beforeRelative = match[1]; // "door" or "the door"
      const afterRelative = match[4];  // "big and red"

      // Parse the noun part (before relative)
      const nounParse = this.extractNounAndDeterminers(beforeRelative);

      // Parse the adjective part (after relative)
      const adjectives = this.extractAdjectivesFromPhrase(afterRelative);

      return {
        adjectives,
        noun: nounParse.noun,
        determiners: nounParse.determiners,
        intensifiers: [],
        confidence: 0.9,
        parseMethod: 'relative_clause'
      };
    }

    return {
      adjectives: [],
      noun: '',
      determiners: [],
      intensifiers: [],
      confidence: 0,
      parseMethod: 'relative_clause_failed'
    };
  }

  /**
   * Parse compound adjective patterns: "big red wooden door"
   */
  private parseCompoundAdjectives(text: string): AdjectiveNounParse {
    const words = text.split(/\s+/);

    if (words.length < 2) {
      return {
        adjectives: [],
        noun: words[0] || '',
        determiners: [],
        intensifiers: [],
        confidence: words.length === 1 ? 0.8 : 0,
        parseMethod: 'compound_adj_failed'
      };
    }

    const determiners: string[] = [];
    const intensifiers: string[] = [];
    const adjectives: string[] = [];
    let noun = '';

    let i = 0;

    // Skip determiners at the start
    while (i < words.length && this.determiners.has(words[i])) {
      determiners.push(words[i]);
      i++;
    }

    // Collect intensifiers and adjectives
    while (i < words.length - 1) {
      const word = words[i];

      if (this.intensifiers.has(word)) {
        intensifiers.push(word);
      } else if (!this.conjunctions.has(word)) {
        adjectives.push(word);
      }
      // Skip conjunctions like "and"

      i++;
    }

    // Last word is the noun
    if (i < words.length) {
      noun = words[i];
    }

    const confidence = this.calculateConfidence(adjectives, noun);

    return {
      adjectives,
      noun,
      determiners,
      intensifiers,
      confidence,
      parseMethod: 'compound_adjectives'
    };
  }

  /**
   * Parse with intensifiers: "very big door", "really sharp sword"
   */
  private parseWithIntensifiers(text: string): AdjectiveNounParse {
    const words = text.split(/\s+/);

    if (words.length < 2) {
      return {
        adjectives: [],
        noun: words[0] || '',
        determiners: [],
        intensifiers: [],
        confidence: 0.5,
        parseMethod: 'intensifier_failed'
      };
    }

    const determiners: string[] = [];
    const intensifiers: string[] = [];
    const adjectives: string[] = [];
    let noun = '';

    let i = 0;

    // Process determiners
    while (i < words.length && this.determiners.has(words[i])) {
      determiners.push(words[i]);
      i++;
    }

    // Process intensifiers and adjectives
    while (i < words.length - 1) {
      const word = words[i];

      if (this.intensifiers.has(word)) {
        intensifiers.push(word);
        // Next word after intensifier is likely an adjective
        if (i + 1 < words.length - 1) {
          adjectives.push(words[i + 1]);
          i += 2;
          continue;
        }
      } else if (!this.conjunctions.has(word)) {
        adjectives.push(word);
      }

      i++;
    }

    // Last word is noun
    if (i < words.length) {
      noun = words[i];
    }

    const confidence = this.calculateConfidence(adjectives, noun);

    return {
      adjectives,
      noun,
      determiners,
      intensifiers,
      confidence: confidence * 0.9, // Slightly lower confidence than compound
      parseMethod: 'with_intensifiers'
    };
  }

  /**
   * Simple parsing: last word is noun, everything else is adjective
   */
  private parseSimple(text: string): AdjectiveNounParse {
    const words = text.split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) {
      return {
        adjectives: [],
        noun: '',
        determiners: [],
        intensifiers: [],
        confidence: 0,
        parseMethod: 'simple_empty'
      };
    }

    if (words.length === 1) {
      return {
        adjectives: [],
        noun: words[0],
        determiners: [],
        intensifiers: [],
        confidence: 1.0,
        parseMethod: 'simple_single'
      };
    }

    const determiners: string[] = [];
    const intensifiers: string[] = [];
    const adjectives: string[] = [];

    let startIndex = 0;

    // Skip determiners
    while (startIndex < words.length && this.determiners.has(words[startIndex])) {
      determiners.push(words[startIndex]);
      startIndex++;
    }

    // Everything between determiners and last word is adjective/intensifier
    for (let i = startIndex; i < words.length - 1; i++) {
      if (this.intensifiers.has(words[i])) {
        intensifiers.push(words[i]);
      } else {
        adjectives.push(words[i]);
      }
    }

    const noun = words[words.length - 1];
    const confidence = this.calculateConfidence(adjectives, noun);

    return {
      adjectives,
      noun,
      determiners,
      intensifiers,
      confidence,
      parseMethod: 'simple'
    };
  }

  /**
   * Extract noun and determiners from a phrase
   */
  private extractNounAndDeterminers(phrase: string): {
    noun: string;
    determiners: string[];
  } {
    const words = phrase.split(/\s+/);
    const determiners: string[] = [];

    let i = 0;
    while (i < words.length && this.determiners.has(words[i])) {
      determiners.push(words[i]);
      i++;
    }

    // Everything after determiners is the noun (could be compound)
    const noun = words.slice(i).join(' ');

    return { noun, determiners };
  }

  /**
   * Extract adjectives from a phrase like "big and red"
   */
  private extractAdjectivesFromPhrase(phrase: string): string[] {
    const words = phrase.split(/\s+/);
    const adjectives: string[] = [];

    for (const word of words) {
      // Skip conjunctions, relative words, etc.
      if (
        !this.conjunctions.has(word) &&
        !this.relativeWords.has(word) &&
        !this.determiners.has(word) &&
        !this.prepositions.has(word)
      ) {
        adjectives.push(word);
      }
    }

    return adjectives;
  }

  /**
   * Calculate parsing confidence
   */
  private calculateConfidence(adjectives: string[], noun: string): number {
    if (!noun) return 0;

    // Base confidence
    let confidence = 0.8;

    // Increase confidence if we found adjectives
    if (adjectives.length > 0) {
      confidence += 0.1;
    }

    // Decrease confidence for very long adjective lists (might be misparsed)
    if (adjectives.length > 5) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Parse multiple object descriptions from complex input
   * e.g., "big red door and tiny sword" → [{adj: [big, red], noun: door}, {adj: [tiny], noun: sword}]
   */
  parseMultiple(description: string): AdjectiveNounParse[] {
    // Split by "and" or commas
    const segments = description.split(/\s+and\s+|,\s*/);

    return segments
      .map(segment => this.parse(segment.trim()))
      .filter(parse => parse.noun.length > 0);
  }

  /**
   * Validate if a word is a known adjective
   */
  isKnownAdjective(word: string): boolean {
    const knownAdjectives = new Set([
      // Colors
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white',
      'brown', 'gray', 'grey', 'pink', 'crimson', 'azure', 'emerald', 'gold',
      'golden', 'silver', 'bronze', 'copper', 'violet', 'indigo', 'turquoise',
      'scarlet', 'navy', 'teal', 'magenta', 'cyan', 'amber', 'jade', 'ruby',

      // Sizes
      'big', 'small', 'tiny', 'huge', 'large', 'enormous', 'gigantic', 'miniature',
      'massive', 'colossal', 'giant', 'little', 'petite', 'grand', 'vast', 'immense',
      'minuscule', 'microscopic', 'titanic', 'jumbo',

      // Materials
      'wooden', 'metal', 'metallic', 'iron', 'steel', 'stone', 'glass', 'plastic',
      'leather', 'cloth', 'fabric', 'paper', 'ceramic', 'crystal', 'diamond',
      'marble', 'granite', 'bronze', 'brass', 'aluminum', 'titanium',

      // Qualities
      'sharp', 'dull', 'heavy', 'light', 'soft', 'hard', 'strong', 'weak',
      'tough', 'fragile', 'sturdy', 'flimsy', 'solid', 'hollow', 'dense',
      'thick', 'thin', 'rough', 'smooth', 'sleek', 'jagged', 'pointed',
      'blunt', 'curved', 'straight', 'bent', 'twisted', 'flat', 'round',

      // Temperature
      'hot', 'cold', 'warm', 'cool', 'freezing', 'boiling', 'burning', 'frozen',
      'icy', 'chilly', 'heated', 'scalding', 'tepid', 'lukewarm',

      // Light/Visibility
      'bright', 'dark', 'shiny', 'dull', 'glowing', 'dim', 'brilliant', 'luminous',
      'radiant', 'shadowy', 'sparkling', 'gleaming', 'glistening', 'matte',

      // Age/Condition
      'new', 'old', 'ancient', 'modern', 'antique', 'vintage', 'contemporary',
      'aged', 'young', 'fresh', 'stale', 'worn', 'pristine', 'weathered',
      'rusty', 'polished', 'tarnished', 'clean', 'dirty', 'dusty', 'muddy',

      // States
      'open', 'closed', 'locked', 'unlocked', 'lit', 'unlit', 'burning',
      'broken', 'fixed', 'damaged', 'intact', 'whole', 'shattered', 'cracked',
      'torn', 'ripped', 'mended', 'repaired',

      // Descriptive/Aesthetic
      'beautiful', 'ugly', 'pretty', 'handsome', 'gorgeous', 'hideous',
      'elegant', 'crude', 'ornate', 'plain', 'simple', 'elaborate', 'fancy',
      'decorative', 'functional', 'artistic', 'stylish',

      // Emotional/Personality (for creatures)
      'friendly', 'hostile', 'angry', 'happy', 'sad', 'scary', 'frightening',
      'peaceful', 'aggressive', 'calm', 'wild', 'tame', 'fierce', 'gentle',
      'kind', 'cruel', 'mean', 'nice', 'evil', 'good',

      // Power/Magic
      'magical', 'enchanted', 'cursed', 'blessed', 'divine', 'holy', 'sacred',
      'demonic', 'infernal', 'celestial', 'mystical', 'arcane', 'supernatural',
      'mundane', 'ordinary', 'extraordinary', 'legendary', 'epic', 'mythical',

      // Danger/Safety
      'dangerous', 'safe', 'deadly', 'harmless', 'lethal', 'benign', 'toxic',
      'poisonous', 'venomous', 'hazardous', 'secure',

      // Speed/Motion
      'fast', 'slow', 'quick', 'swift', 'rapid', 'sluggish', 'speedy', 'nimble',
      'agile', 'clumsy', 'graceful', 'awkward',

      // Wetness/Dryness
      'wet', 'dry', 'damp', 'moist', 'soaked', 'drenched', 'soggy', 'parched',
      'arid', 'humid',

      // Sound
      'loud', 'quiet', 'silent', 'noisy', 'deafening', 'whispered', 'soft',
      'thunderous', 'melodic', 'harsh',

      // Taste/Smell
      'sweet', 'sour', 'bitter', 'salty', 'spicy', 'bland', 'tasty', 'delicious',
      'disgusting', 'fragrant', 'smelly', 'aromatic', 'pungent', 'rotten',

      // Quantity/Fullness
      'full', 'empty', 'half', 'partial', 'complete', 'incomplete', 'whole'
    ]);

    return knownAdjectives.has(word.toLowerCase());
  }

  /**
   * Validate if a word is a known noun
   */
  isKnownNoun(word: string): boolean {
    const knownNouns = new Set([
      // Structures
      'door', 'wall', 'window', 'gate', 'fence', 'bridge', 'ladder', 'stairs',
      'building', 'house', 'tower', 'castle', 'fortress', 'temple', 'shrine',
      'arch', 'pillar', 'column', 'statue', 'monument',

      // Items
      'box', 'chest', 'barrel', 'crate', 'bag', 'basket', 'sack', 'pouch',
      'bottle', 'jar', 'vase', 'pot', 'pan', 'cup', 'mug', 'plate', 'bowl',

      // Weapons
      'sword', 'axe', 'bow', 'arrow', 'spear', 'dagger', 'knife', 'hammer',
      'mace', 'staff', 'wand', 'club', 'whip', 'lance', 'halberd', 'scythe',
      'blade', 'shield', 'crossbow', 'gun', 'pistol', 'rifle',

      // Tools
      'rope', 'torch', 'lantern', 'candle', 'key', 'lock', 'lever', 'button',
      'switch', 'shovel', 'pickaxe', 'hoe', 'rake', 'wrench', 'hammer',
      'screwdriver', 'saw', 'chisel', 'nail', 'screw',

      // Creatures
      'dragon', 'wolf', 'bear', 'bird', 'fish', 'snake', 'spider', 'cat', 'dog',
      'horse', 'lion', 'tiger', 'eagle', 'hawk', 'owl', 'bat', 'rat', 'mouse',
      'rabbit', 'deer', 'fox', 'frog', 'lizard', 'turtle', 'shark', 'whale',
      'elephant', 'monkey', 'goat', 'sheep', 'pig', 'cow', 'chicken', 'duck',
      'goblin', 'orc', 'elf', 'dwarf', 'giant', 'troll', 'fairy', 'demon',
      'angel', 'ghost', 'zombie', 'skeleton', 'vampire', 'werewolf',

      // Nature
      'tree', 'rock', 'stone', 'flower', 'bush', 'grass', 'plant', 'vine',
      'leaf', 'branch', 'root', 'seed', 'fruit', 'berry', 'mushroom',
      'mountain', 'hill', 'cliff', 'valley', 'cave', 'river', 'stream',
      'lake', 'pond', 'ocean', 'sea', 'beach', 'island', 'forest', 'woods',
      'jungle', 'desert', 'swamp', 'marsh', 'field', 'meadow', 'garden',

      // Elements
      'fire', 'water', 'earth', 'air', 'ice', 'lightning', 'thunder', 'wind',
      'rain', 'snow', 'mist', 'fog', 'cloud', 'sun', 'moon', 'star',

      // Food
      'apple', 'bread', 'meat', 'cheese', 'wine', 'beer', 'milk', 'egg',
      'cake', 'pie', 'soup', 'stew', 'fish', 'chicken', 'beef', 'pork',
      'vegetable', 'carrot', 'potato', 'tomato', 'lettuce', 'onion',
      'potion', 'elixir', 'medicine', 'remedy',

      // Furniture
      'chair', 'table', 'bed', 'bench', 'stool', 'desk', 'shelf', 'cabinet',
      'wardrobe', 'dresser', 'couch', 'sofa', 'throne', 'bookshelf',

      // Clothing/Armor
      'shirt', 'pants', 'dress', 'robe', 'cloak', 'cape', 'hat', 'helmet',
      'boots', 'shoes', 'gloves', 'belt', 'armor', 'chainmail', 'plate',

      // Vehicles
      'cart', 'wagon', 'carriage', 'boat', 'ship', 'raft', 'canoe', 'horse',

      // Magic Items
      'crystal', 'orb', 'amulet', 'ring', 'scroll', 'book', 'tome', 'grimoire',
      'talisman', 'charm', 'rune', 'gem', 'jewel', 'pendant',

      // Miscellaneous
      'coin', 'gold', 'silver', 'treasure', 'gem', 'diamond', 'ruby', 'emerald',
      'flag', 'banner', 'sign', 'map', 'compass', 'clock', 'bell', 'mirror',
      'painting', 'portrait', 'carpet', 'rug', 'curtain', 'blanket', 'pillow'
    ]);

    return knownNouns.has(word.toLowerCase());
  }

  /**
   * Get suggestions for misspelled or unknown words
   */
  suggestCorrections(word: string): string[] {
    // Simple Levenshtein distance-based suggestions
    // For now, return empty (future enhancement)
    return [];
  }

  /**
   * Check if the parse result looks valid
   */
  isValidParse(parse: AdjectiveNounParse): boolean {
    return parse.noun.length > 0 && parse.confidence >= 0.5;
  }

  /**
   * Set language for parsing
   */
  setLanguage(language: Language): void {
    this.language = language;
    // Future: Load language-specific word lists
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.language;
  }
}
