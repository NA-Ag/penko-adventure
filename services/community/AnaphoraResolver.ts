/**
 * Anaphora Resolver - FACADE PARITY 1.1
 *
 * Resolves pronouns and demonstratives to their referents.
 * Enables natural conversation like:
 * - "Talk to the wizard. Ask him about the dragon."
 * - "Take the sword. Examine it."
 * - "The door is locked. Open it with the key."
 *
 * Inspired by Facade's anaphoric reference resolution system.
 */

import type { Language } from '../../types';

export interface ReferenceContext {
  lastMentionedNPC: string | null;
  lastMentionedObject: string | null;
  lastMentionedLocation: string | null;
  lastMentionedNPCGender: 'male' | 'female' | 'neutral' | null;
  conversationHistory: Array<{
    input: string;
    timestamp: number;
    mentionedEntities: string[];
  }>;
}

export interface ResolvedReference {
  original: string;
  resolved: string;
  type: 'npc' | 'object' | 'location';
  confidence: number;
}

/**
 * Pronoun mappings for 12 languages
 */
const PRONOUNS = {
  // Subject pronouns
  subject_male: {
    en: ['he', 'him'],
    es: ['él', 'lo', 'le'],
    fr: ['il', 'lui'],
    de: ['er', 'ihn', 'ihm'],
    it: ['lui', 'lo', 'gli'],
    ja: ['彼', 'かれ'],
    zh: ['他'],
    ru: ['он', 'его', 'ему'],
    pt: ['ele', 'o', 'lhe'],
    uk: ['він', 'його', 'йому'],
    pl: ['on', 'go', 'mu', 'nim'],
    cs: ['on', 'ho', 'mu', 'jím']
  },
  subject_female: {
    en: ['she', 'her'],
    es: ['ella', 'la', 'le'],
    fr: ['elle', 'la', 'lui'],
    de: ['sie', 'ihr'],
    it: ['lei', 'la', 'le'],
    ja: ['彼女', 'かのじょ'],
    zh: ['她'],
    ru: ['она', 'её', 'ей'],
    pt: ['ela', 'a', 'lhe'],
    uk: ['вона', 'її', 'їй'],
    pl: ['ona', 'ją', 'jej'],
    cs: ['ona', 'ji', 'jí']
  },
  // Object/thing pronouns
  object: {
    en: ['it', 'that', 'this'],
    es: ['eso', 'esto', 'aquello', 'aquello'],
    fr: ['ça', 'cela', 'ceci'],
    de: ['es', 'das', 'dies'],
    it: ['quello', 'questo'],
    ja: ['それ', 'これ', 'あれ'],
    zh: ['它', '这个', '那个'],
    ru: ['это', 'то', 'оно'],
    pt: ['isso', 'isto', 'aquilo'],
    uk: ['це', 'те', 'воно'],
    pl: ['to', 'tamto'],
    cs: ['to', 'ono']
  },
  // Possessive pronouns
  possessive_male: {
    en: ['his'],
    es: ['su', 'sus'],
    fr: ['son', 'sa', 'ses'],
    de: ['sein', 'seine', 'seiner'],
    it: ['suo', 'sua', 'suoi'],
    ja: ['彼の'],
    zh: ['他的'],
    ru: ['его'],
    pt: ['seu', 'sua'],
    uk: ['його'],
    pl: ['jego'],
    cs: ['jeho']
  },
  possessive_female: {
    en: ['her', 'hers'],
    es: ['su', 'sus'],
    fr: ['son', 'sa', 'ses'],
    de: ['ihr', 'ihre', 'ihrer'],
    it: ['suo', 'sua', 'suoi'],
    ja: ['彼女の'],
    zh: ['她的'],
    ru: ['её'],
    pt: ['seu', 'sua'],
    uk: ['її'],
    pl: ['jej'],
    cs: ['její']
  }
};

/**
 * Anaphora Resolver - tracks conversation context and resolves pronouns
 */
export class AnaphoraResolver {
  private context: ReferenceContext;
  private language: Language;
  private npcGenderMap: Map<string, 'male' | 'female' | 'neutral'> = new Map();

  // Language code mapping
  private static readonly LANG_CODES: Record<Language, string> = {
    [0]: 'en',  // Language.ENGLISH
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
    this.context = {
      lastMentionedNPC: null,
      lastMentionedObject: null,
      lastMentionedLocation: null,
      lastMentionedNPCGender: null,
      conversationHistory: []
    };
  }

  /**
   * Register NPC gender for pronoun resolution
   */
  registerNPC(npcId: string, gender: 'male' | 'female' | 'neutral'): void {
    this.npcGenderMap.set(npcId, gender);
  }

  /**
   * Update context with newly mentioned entities
   */
  updateContext(
    input: string,
    mentionedNPC?: string,
    mentionedObject?: string,
    mentionedLocation?: string
  ): void {
    if (mentionedNPC) {
      this.context.lastMentionedNPC = mentionedNPC;
      this.context.lastMentionedNPCGender = this.npcGenderMap.get(mentionedNPC) || 'neutral';
    }

    if (mentionedObject) {
      this.context.lastMentionedObject = mentionedObject;
    }

    if (mentionedLocation) {
      this.context.lastMentionedLocation = mentionedLocation;
    }

    // Add to conversation history
    const entities: string[] = [];
    if (mentionedNPC) entities.push(mentionedNPC);
    if (mentionedObject) entities.push(mentionedObject);
    if (mentionedLocation) entities.push(mentionedLocation);

    this.context.conversationHistory.push({
      input,
      timestamp: Date.now(),
      mentionedEntities: entities
    });

    // Keep only last 10 entries
    if (this.context.conversationHistory.length > 10) {
      this.context.conversationHistory.shift();
    }

    console.log(`[AnaphoraResolver] Context updated:`, {
      lastNPC: this.context.lastMentionedNPC,
      lastObject: this.context.lastMentionedObject,
      lastLocation: this.context.lastMentionedLocation
    });
  }

  /**
   * Resolve pronouns in input text to their referents
   */
  resolve(input: string): { resolvedInput: string; resolutions: ResolvedReference[] } {
    const langCode = AnaphoraResolver.LANG_CODES[this.language];
    const words = input.toLowerCase().split(/\s+/);
    const resolutions: ResolvedReference[] = [];
    let resolvedInput = input;

    // Check each word for pronouns
    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check male pronouns
      if (this.isPronoun(word, 'subject_male', langCode)) {
        if (this.context.lastMentionedNPC && this.context.lastMentionedNPCGender === 'male') {
          resolutions.push({
            original: word,
            resolved: this.context.lastMentionedNPC,
            type: 'npc',
            confidence: 0.9
          });

          // Replace in resolved input (case-insensitive)
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          resolvedInput = resolvedInput.replace(regex, this.context.lastMentionedNPC);

          console.log(`[AnaphoraResolver] Resolved "${word}" → "${this.context.lastMentionedNPC}" (male NPC)`);
        }
      }

      // Check female pronouns
      if (this.isPronoun(word, 'subject_female', langCode)) {
        if (this.context.lastMentionedNPC && this.context.lastMentionedNPCGender === 'female') {
          resolutions.push({
            original: word,
            resolved: this.context.lastMentionedNPC,
            type: 'npc',
            confidence: 0.9
          });

          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          resolvedInput = resolvedInput.replace(regex, this.context.lastMentionedNPC);

          console.log(`[AnaphoraResolver] Resolved "${word}" → "${this.context.lastMentionedNPC}" (female NPC)`);
        }
      }

      // Check object pronouns (it, that, this)
      if (this.isPronoun(word, 'object', langCode)) {
        if (this.context.lastMentionedObject) {
          resolutions.push({
            original: word,
            resolved: this.context.lastMentionedObject,
            type: 'object',
            confidence: 0.85
          });

          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          resolvedInput = resolvedInput.replace(regex, this.context.lastMentionedObject);

          console.log(`[AnaphoraResolver] Resolved "${word}" → "${this.context.lastMentionedObject}" (object)`);
        }
      }

      // Check possessive pronouns
      if (this.isPronoun(word, 'possessive_male', langCode) ||
          this.isPronoun(word, 'possessive_female', langCode)) {
        // Handle possessives like "his sword", "her house"
        // This requires looking at the next word to understand what's being possessed
        if (i + 1 < words.length) {
          const possessedThing = words[i + 1];

          if (this.context.lastMentionedNPC) {
            // Replace "his sword" with "wizard's sword" (approximation)
            const npcPossessive = `${this.context.lastMentionedNPC}'s`;
            const regex = new RegExp(`\\b${word}\\s+${possessedThing}\\b`, 'gi');
            resolvedInput = resolvedInput.replace(regex, `${npcPossessive} ${possessedThing}`);

            console.log(`[AnaphoraResolver] Resolved "${word} ${possessedThing}" → "${npcPossessive} ${possessedThing}"`);
          }
        }
      }
    }

    return { resolvedInput, resolutions };
  }

  /**
   * Check if word is a pronoun of given type
   */
  private isPronoun(word: string, type: keyof typeof PRONOUNS, langCode: string): boolean {
    const pronounList = PRONOUNS[type][langCode as keyof typeof PRONOUNS[typeof type]];
    return pronounList ? pronounList.includes(word.toLowerCase()) : false;
  }

  /**
   * Get current context (for debugging)
   */
  getContext(): ReferenceContext {
    return { ...this.context };
  }

  /**
   * Reset context (start new conversation)
   */
  resetContext(): void {
    this.context = {
      lastMentionedNPC: null,
      lastMentionedObject: null,
      lastMentionedLocation: null,
      lastMentionedNPCGender: null,
      conversationHistory: []
    };

    console.log('[AnaphoraResolver] Context reset');
  }
}
