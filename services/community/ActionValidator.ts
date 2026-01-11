/**
 * ActionValidator - Validates player actions against object properties
 *
 * This is the "Actor" component of the Game Master system.
 * It takes parsed player input and determines if the action is valid
 * based on object properties and current world state.
 */

import { ObjectSystem, ObjectIntent, ActionValidation } from './ObjectSystem';
import { StandardModeParser, EnhancedParseResult } from '../parser/StandardModeParser';
import { Language } from '../../types';
import { getError, buildAvailableObjectsMessage, getMessage } from '../SystemStrings';
import { SemanticMatcher } from './SemanticMatcher';
import { DiscourseActRecognizer } from './DiscourseActRecognizer';
import type { DiscourseAnalysis } from './DiscourseActRecognizer';
import { AnaphoraResolver } from './AnaphoraResolver';  // FACADE 1.1: Anaphoric reference resolution

// Re-export DiscourseAnalysis for use by CommunityEngineV3
export type { DiscourseAnalysis };

/**
 * Maps parser intents to object intents
 */
const INTENT_MAPPING: Record<string, ObjectIntent> = {
  'LOOK_AROUND': 'LOOK_AROUND',
  'EXAMINE': 'EXAMINE',
  'LOOK': 'EXAMINE',
  'TAKE': 'TAKE',
  'LOOT': 'TAKE',  // Map LOOT to TAKE for Scribblenauts-style flexibility
  'GET': 'TAKE',
  'PICKUP': 'TAKE',
  'DROP': 'DROP',
  'DISCARD': 'DROP',
  'USE': 'USE',
  'USE_ON': 'USE_ON',  // TIER 9: Two-object interactions
  'ACTIVATE': 'USE',
  'OPEN': 'OPEN',
  'UNLOCK': 'OPEN',
  'CLOSE': 'CLOSE',
  'SHUT': 'CLOSE',
  'LOCK': 'CLOSE',
  'TALK': 'TALK',
  'SPEAK': 'TALK',
  'INTERACT': 'USE',  // Generic interaction intent from VERB_DB - maps to USE
  'ASK': 'TALK',
  'ATTACK': 'ATTACK',
  'HIT': 'ATTACK',
  'FIGHT': 'ATTACK',
  'EAT': 'EAT',
  'DRINK': 'EAT',
  'CONSUME': 'EAT',
  'GIVE': 'GIVE',
  'OFFER': 'GIVE',
  'CLIMB': 'CLIMB',
  'ASCEND': 'CLIMB',
  'TIE': 'TIE',
  'BIND': 'TIE',
  'ATTACH': 'TIE',
  'BURN': 'BURN',
  'IGNITE': 'BURN',
  'LIGHT': 'BURN',
  'READ': 'READ',
  'STUDY': 'READ',
  'WEAR': 'WEAR',
  'EQUIP': 'WEAR',
  'THROW': 'THROW',
  'TOSS': 'THROW'
};

/**
 * Result of action validation
 */
export interface ValidatedAction {
  valid: boolean;
  objectId: string | null;
  intent: ObjectIntent | null;
  validation: ActionValidation | null;
  parseResult: EnhancedParseResult;
  suggestions?: string[];
  // TIER 9: Two-object interaction support
  targetObjectId?: string | null;  // For USE_ON intent (e.g., "use key on door")
  // TIER 20: Façade-style discourse analysis
  discourseAnalysis?: DiscourseAnalysis;  // Social interaction understanding
}

/**
 * ActionValidator handles the integration between parser and object system
 */
export class ActionValidator {
  private objectSystem: ObjectSystem;
  private parser: StandardModeParser;
  private currentLanguage: Language;
  private semanticMatcher: SemanticMatcher;
  private discourseRecognizer: DiscourseActRecognizer;
  private npcPersonaManager: any | null = null;  // TIER 1: Context-aware NPC detection
  private anaphoraResolver: AnaphoraResolver;  // FACADE 1.1: Anaphoric reference resolution

  constructor(
    objectSystem: ObjectSystem,
    parser: StandardModeParser,
    language: Language,
    npcPersonaManager?: any  // TIER 1: Optional NPCPersonaManager for NPC detection
  ) {
    this.objectSystem = objectSystem;
    this.parser = parser;
    this.currentLanguage = language;
    this.semanticMatcher = new SemanticMatcher(language);
    this.discourseRecognizer = new DiscourseActRecognizer(language);
    this.npcPersonaManager = npcPersonaManager || null;  // TIER 1: Store NPC manager
    this.anaphoraResolver = new AnaphoraResolver(language);  // FACADE 1.1: Initialize anaphora resolver
  }

  /**
   * TIER 17: Validate an already-parsed action (Façade architecture)
   *
   * This method accepts the intent directly from the parser, eliminating
   * duplicate parsing. This is the core of the Façade pattern separation:
   *
   * Phase 1 (Parser): Text → Intent (language-specific)
   * Phase 2 (ActionValidator): Intent → Validation (language-agnostic)
   *
   * @param parseResult - Already-parsed intent from StandardModeParser
   * @param input - Original raw text (for object extraction only)
   * @param availableObjects - Object IDs available in current location
   * @param playerInventory - Object IDs in player's inventory
   * @param currentLocation - Current location (needed for MOVE intent to check connections)
   */
  async validateAction(
    parseResult: EnhancedParseResult,
    input: string,
    availableObjects: string[],
    playerInventory: string[] = [],
    currentLocation: any = null
  ): Promise<ValidatedAction> {
    // FACADE 1.1: Resolve pronouns before processing
    const { resolvedInput, resolutions } = this.anaphoraResolver.resolve(input);

    // If we resolved any pronouns, log it and use resolved input for further processing
    if (resolutions.length > 0) {
      console.log(`[ActionValidator] FACADE 1.1: Anaphora resolved:`, resolutions);
      input = resolvedInput;  // Use resolved input for remaining processing

      // Re-parse with resolved input if significant changes were made
      if (resolutions.some(r => r.type === 'npc' || r.type === 'object')) {
        const reparse = await this.parser.parseWithContentPack(resolvedInput, this.currentLanguage);
        parseResult = { ...parseResult, ...reparse };
        console.log(`[ActionValidator] Re-parsed after anaphora resolution: ${parseResult.intent}`);
      }
    }

    // TIER 20: Analyze discourse act for Façade-style social interactions
    const discourseAnalysis = this.discourseRecognizer.analyze(input);

    console.log(`[ActionValidator] Discourse: ${discourseAnalysis.primary} (${discourseAnalysis.sentiment}, intensity: ${discourseAnalysis.intensity})`);

    // TIER 20: Handle pure social interactions (no game action needed)
    const socialResult = this.handleSocialInteraction(
      discourseAnalysis,
      input,
      availableObjects,
      parseResult
    );

    if (socialResult) {
      return socialResult;
    }

    // TIER 1: Context-aware NPC detection (Façade approach)
    // Convert spatial proximity actions to social interactions when targeting NPCs
    // Example: "me acerco al mago" (I approach the wizard) → TALK intent
    if (parseResult.intent === 'MOVE' && parseResult.object) {
      const npcId = this.detectNPCFromExtractedObject(parseResult.object, availableObjects);

      if (npcId) {
        console.log(`[ActionValidator] TIER 1: Converting MOVE → TALK (approaching NPC: ${npcId})`);
        parseResult.intent = 'TALK';
        // Continue processing with TALK intent - will be handled by handleSocialInteraction logic
        // Force return to TALK handling
        return {
          valid: true,
          objectId: npcId,
          intent: 'TALK',
          validation: { valid: true },
          parseResult: { ...parseResult, intent: 'TALK', object: npcId },
          discourseAnalysis
        };
      }
    }

    // Also check if input contains NPC reference but parser didn't extract it
    if (parseResult.intent === 'MOVE' && !parseResult.object) {
      const npcId = this.findNPCInContext(availableObjects, input);

      if (npcId) {
        // Check if input has social/proximity keywords
        const socialProximityKeywords = [
          'approach', 'talk', 'speak', 'greet', 'ask', 'tell',
          'acerco', 'acerca', 'aproxim', 'dirijo', 'hablar', 'saludar',
          'approch', 'parler', 'saluer', 'adress',
          'näher', 'sprech', 'grüß', 'frag',
          'avvicin', 'parlar', 'salut', 'chieder'
        ];

        const hasProximityIntent = socialProximityKeywords.some(kw =>
          input.toLowerCase().includes(kw)
        );

        if (hasProximityIntent) {
          console.log(`[ActionValidator] TIER 1: Detected social proximity action → TALK (${npcId})`);
          return {
            valid: true,
            objectId: npcId,
            intent: 'TALK',
            validation: { valid: true },
            parseResult: { ...parseResult, intent: 'TALK', object: npcId },
            discourseAnalysis
          };
        }
      }
    }

    // SPECIAL CASES: Intents that don't require an object
    if (parseResult.intent === 'MOVE') {
      return this.validateMovement(input, currentLocation, parseResult);
    }

    // LOOK_AROUND doesn't require an object - it describes the current scene
    if (parseResult.intent === 'LOOK_AROUND') {
      return {
        valid: true,
        objectId: null,
        intent: 'LOOK_AROUND',
        validation: { valid: true },
        parseResult,
        discourseAnalysis  // Include discourse analysis
      };
    }

    // EXAMINE without an object should behave like LOOK_AROUND
    // This handles commands like "examinar" in Spanish or "examine" in English
    if (parseResult.intent === 'EXAMINE' && !parseResult.object) {
      // Check if we can extract an object from the input
      const potentialObject = this.extractObject(input, availableObjects);

      // If no object found, treat as LOOK_AROUND
      if (!potentialObject) {
        return {
          valid: true,
          objectId: null,
          intent: 'LOOK_AROUND',
          validation: { valid: true },
          parseResult: { ...parseResult, intent: 'LOOK_AROUND' },
          discourseAnalysis
        };
      }
    }

    // TIER 9: Check if this is a two-object command (e.g., "use key on door")
    const twoObjects = this.extractTwoObjects(input, availableObjects, playerInventory);

    if (twoObjects.item && twoObjects.target) {
      // This is a two-object interaction
      return {
        valid: true,
        objectId: twoObjects.item,
        targetObjectId: twoObjects.target,
        intent: 'USE_ON',
        validation: { valid: true },
        parseResult
      };
    }

    // TIER 18: Try to use extracted object from parser first
    // If parser extracted a target (e.g., "vieux magicien" from "j'approche le vieux magicien"),
    // use that to match against available objects
    let objectId: string | null = null;

    if (parseResult.object) {
      // Parser extracted a target entity - use it to find the object
      objectId = this.extractObject(parseResult.object, availableObjects);
    }

    // Fallback: Try to extract object from full input (legacy behavior)
    if (!objectId) {
      objectId = this.extractObject(input, availableObjects);
    }

    if (!objectId) {
      // TIER 19: Generate intelligent suggestions using semantic matching
      const objectData = availableObjects.map(id => {
        const obj = this.objectSystem.getObject(id);
        return {
          id,
          name: obj?.name,
          description: obj?.description
        };
      });

      const smartSuggestions = this.semanticMatcher.suggestAlternatives(input, objectData);
      const baseSuggestion = this.suggestAvailableObjects(availableObjects);

      const enhancedSuggestion = smartSuggestions.length > 0
        ? `Did you mean: ${smartSuggestions.join(', ')}? ${baseSuggestion}`
        : baseSuggestion;

      return {
        valid: false,
        objectId: null,
        intent: null,
        validation: {
          valid: false,
          reason: getError('object_not_found', this.currentLanguage),
          suggestion: enhancedSuggestion
        },
        parseResult,
        suggestions: smartSuggestions.length > 0 ? smartSuggestions : availableObjects.slice(0, 3),
        discourseAnalysis  // TIER 20: Include discourse info
      };
    }

    // Map parser intent to object intent
    const intent = this.mapIntent(parseResult.intent);

    if (!intent) {
      return {
        valid: false,
        discourseAnalysis,  // TIER 20
        objectId,
        intent: null,
        validation: {
          valid: false,
          reason: getError('action_not_understood', this.currentLanguage),
          suggestion: getError('action_suggestion', this.currentLanguage)
        },
        parseResult
      };
    }

    // Validate action against object
    const validation = this.objectSystem.validateAction(
      objectId,
      intent,
      playerInventory,
      this.currentLanguage
    );

    return {
      valid: validation.valid,
      objectId,
      intent,
      validation,
      parseResult,
      discourseAnalysis  // TIER 20: Always include discourse analysis
    };
  }

  /**
   * TIER 17: Validate MOVE intent
   *
   * Handles movement commands by extracting direction from input and
   * checking if that direction is valid for the current location.
   *
   * @returns ValidatedAction with special 'MOVE' intent and direction in objectId field
   */
  private validateMovement(
    input: string,
    currentLocation: any,
    parseResult: EnhancedParseResult
  ): ValidatedAction {
    if (!currentLocation) {
      return {
        valid: false,
        objectId: null,
        intent: null,
        validation: {
          valid: false,
          reason: 'Cannot move: current location unknown.',
          suggestion: ''
        },
        parseResult
      };
    }

    // Extract direction from input using direction vocabulary
    const direction = this.extractDirection(input);

    if (!direction) {
      // No direction specified - show available exits
      const connections = currentLocation.connections || {};
      const availableDirections = Object.keys(connections);

      const exitsLabel = getMessage('exits', this.currentLanguage);
      const availableDirs = availableDirections.join(', ');

      return {
        valid: false,
        objectId: null,
        intent: null,
        validation: {
          valid: false,
          reason: getError('action_not_understood', this.currentLanguage),
          suggestion: `${exitsLabel}: ${availableDirs}`
        },
        parseResult
      };
    }

    // Check if this direction exists in current location's connections
    const connections = currentLocation.connections || {};

    if (!connections[direction]) {
      // Invalid direction for this location
      const availableDirections = Object.keys(connections);
      const exitsLabel = getMessage('exits', this.currentLanguage);
      const availableDirs = availableDirections.join(', ');

      return {
        valid: false,
        objectId: null,
        intent: null,
        validation: {
          valid: false,
          reason: `Cannot go ${direction} from here.`,
          suggestion: `${exitsLabel}: ${availableDirs}`
        },
        parseResult
      };
    }

    // Valid movement!
    // Store direction in objectId field (special case for MOVE)
    return {
      valid: true,
      objectId: direction,  // Direction stored here for movement processing
      intent: 'MOVE' as ObjectIntent,  // Special intent type
      validation: { valid: true },
      parseResult
    };
  }

  /**
   * Extract direction from input using multilingual direction vocabulary
   */
  private extractDirection(input: string): string | null {
    const normalizedInput = input.toLowerCase().trim();

    // Import direction translations from system_strings.json
    const directionKeys = [
      'north', 'south', 'east', 'west',
      'up', 'down', 'inside', 'outside',
      'left', 'right', 'forward', 'back',
      'office', 'trail', 'lobby', 'nightclub'  // Location-specific directions
    ];

    for (const dirKey of directionKeys) {
      // Get all translations for this direction
      const dirTranslations = this.getDirectionTranslations(dirKey);

      // Check if any translation appears in input
      for (const translation of dirTranslations) {
        const pattern = new RegExp(`\\b${translation.toLowerCase()}\\b`);
        if (pattern.test(normalizedInput)) {
          return dirKey;  // Return canonical direction key
        }
      }
    }

    return null;
  }

  /**
   * Get all translations for a direction key
   */
  private getDirectionTranslations(directionKey: string): string[] {
    // This would ideally import from system_strings.json
    // For now, hardcode the most common directions
    const directions: Record<string, Record<string, string>> = {
      'north': { en: 'north', es: 'norte', fr: 'nord', de: 'norden', it: 'nord', ja: '北', zh: '北', ru: 'север', pt: 'norte', uk: 'північ', pl: 'północ', cs: 'sever' },
      'south': { en: 'south', es: 'sur', fr: 'sud', de: 'süden', it: 'sud', ja: '南', zh: '南', ru: 'юг', pt: 'sul', uk: 'південь', pl: 'południe', cs: 'jih' },
      'east': { en: 'east', es: 'este', fr: 'est', de: 'osten', it: 'est', ja: '東', zh: '东', ru: 'восток', pt: 'leste', uk: 'схід', pl: 'wschód', cs: 'východ' },
      'west': { en: 'west', es: 'oeste', fr: 'ouest', de: 'westen', it: 'ovest', ja: '西', zh: '西', ru: 'запад', pt: 'oeste', uk: 'захід', pl: 'zachód', cs: 'západ' },
      'up': { en: 'up', es: 'arriba', fr: 'haut', de: 'oben', it: 'su', ja: '上', zh: '上', ru: 'вверх', pt: 'acima', uk: 'вгору', pl: 'góra', cs: 'nahoru' },
      'down': { en: 'down', es: 'abajo', fr: 'bas', de: 'unten', it: 'giù', ja: '下', zh: '下', ru: 'вниз', pt: 'abaixo', uk: 'вниз', pl: 'dół', cs: 'dolů' },
      'inside': { en: 'inside', es: 'dentro', fr: 'à l\'intérieur', de: 'drinnen', it: 'dentro', ja: '中', zh: '里面', ru: 'внутри', pt: 'dentro', uk: 'всередині', pl: 'wewnątrz', cs: 'uvnitř' },
      'outside': { en: 'outside', es: 'fuera', fr: 'dehors', de: 'draußen', it: 'fuori', ja: '外', zh: '外面', ru: 'снаружи', pt: 'fora', uk: 'зовні', pl: 'na zewnątrz', cs: 'venku' },
      'left': { en: 'left', es: 'izquierda', fr: 'gauche', de: 'links', it: 'sinistra', ja: '左', zh: '左', ru: 'влево', pt: 'esquerda', uk: 'ліворуч', pl: 'lewo', cs: 'vlevo' },
      'right': { en: 'right', es: 'derecha', fr: 'droite', de: 'rechts', it: 'destra', ja: '右', zh: '右', ru: 'вправо', pt: 'direita', uk: 'праворуч', pl: 'prawo', cs: 'vpravo' }
    };

    const dirObj = directions[directionKey];
    if (!dirObj) return [directionKey];  // Fallback to key itself

    return Object.values(dirObj);
  }

  /**
   * DEPRECATED: Legacy method kept for backwards compatibility
   *
   * Validate a player's text input against available objects.
   * This method parses the input internally, which duplicates work
   * if the caller has already parsed it.
   *
   * NEW CODE SHOULD USE: validateAction(parseResult, input, ...)
   */
  async validateInput(
    input: string,
    availableObjects: string[],
    playerInventory: string[] = []
  ): Promise<ValidatedAction> {
    // Parse the input directly - the parser should handle all language-specific intents
    const parseResult = await this.parser.parseWithContentPack(
      input,
      this.currentLanguage
    );

    // Delegate to new method
    return this.validateAction(parseResult, input, availableObjects, playerInventory);
  }

  /**
   * Extract object ID from input by matching against available objects
   *
   * TIER 19: AI-COMPETITIVE SEMANTIC OBJECT MATCHING
   * Uses multi-strategy NLP approach to understand natural language references:
   * - Exact name matching
   * - Synonym recognition across 12 languages
   * - Fuzzy string matching for typos/variations
   * - Partial ID matching (wizard → wizard_aldric)
   * - Description keyword analysis
   * - Category-based inference
   *
   * Like AI systems, this understands INTENT rather than requiring exact text.
   */
  private extractObject(
    input: string,
    availableObjects: string[]
  ): string | null {
    // Build rich object data for semantic matcher
    const objectData = availableObjects.map(id => {
      const obj = this.objectSystem.getObject(id);
      return {
        id,
        name: obj?.name,
        description: obj?.description
      };
    });

    // Use advanced semantic matching
    const match = this.semanticMatcher.findBestMatch(input, objectData);

    if (match) {
      console.log(`[ActionValidator] Matched "${input}" → ${match.objectId} (${match.method}, ${(match.confidence * 100).toFixed(0)}% confidence)`);
      return match.objectId;
    }

    // LEGACY FALLBACK: Keep original simple matching for edge cases
    const normalizedInput = input.toLowerCase().trim();

    // Try matching object ID directly (last resort)
    for (const objectId of availableObjects) {
      const lowercaseId = objectId.toLowerCase();

      // Check if any word from input matches part of the object ID
      const inputWords = normalizedInput.split(/\s+/).filter(w => w.length > 2);
      for (const word of inputWords) {
        if (lowercaseId.includes(word)) {
          console.log(`[ActionValidator] Fallback match "${input}" → ${objectId} (ID partial)`);
          return objectId;
        }
      }
    }

    return null;
  }

  /**
   * TIER 9: Extract two objects from input for USE_ON interactions
   * Example: "use key on door" -> {item: "iron_key", target: "wooden_door"}
   * Supports multilingual prepositions: on, with, to, etc.
   */
  private extractTwoObjects(
    input: string,
    availableObjects: string[],
    playerInventory: string[]
  ): { item: string | null; target: string | null } {
    const normalizedInput = input.toLowerCase().trim();

    // Common prepositions that connect two objects in various languages
    const prepositions = [
      'on', 'with', 'to', 'in', 'at', 'upon',  // English
      'en', 'con', 'a', 'sobre',                // Spanish
      'sur', 'avec', 'à', 'dans',               // French
      'auf', 'mit', 'an', 'in',                 // German
      'su', 'con', 'a', 'in',                   // Italian
      'на', 'с', 'в',                           // Russian
      'で', 'に', 'を',                          // Japanese
      '在', '用', '对'                           // Chinese
    ];

    // Find the preposition that splits the input
    let splitIndex = -1;
    let usedPreposition = '';
    for (const prep of prepositions) {
      const pattern = new RegExp(`\\b${prep}\\b`, 'i');
      const match = normalizedInput.match(pattern);
      if (match && match.index !== undefined) {
        splitIndex = match.index;
        usedPreposition = prep;
        break;
      }
    }

    if (splitIndex === -1) {
      // No preposition found - not a two-object command
      return { item: null, target: null };
    }

    // Split input into two parts: before and after preposition
    const beforePrep = normalizedInput.substring(0, splitIndex).trim();
    const afterPrep = normalizedInput.substring(splitIndex + usedPreposition.length).trim();

    // First object (item) should be in player's inventory
    let itemId: string | null = null;
    for (const objectId of playerInventory) {
      const obj = this.objectSystem.getObject(objectId);
      if (!obj) continue;

      const objectName = obj.name[this.currentLanguage]?.toLowerCase();
      if (objectName && beforePrep.includes(objectName)) {
        itemId = objectId;
        break;
      }
    }

    // Second object (target) can be in available objects or inventory
    let targetId: string | null = null;
    const allPossibleTargets = [...availableObjects, ...playerInventory];
    for (const objectId of allPossibleTargets) {
      // Skip if it's the same as the item
      if (objectId === itemId) continue;

      const obj = this.objectSystem.getObject(objectId);
      if (!obj) continue;

      const objectName = obj.name[this.currentLanguage]?.toLowerCase();
      if (objectName && afterPrep.includes(objectName)) {
        targetId = objectId;
        break;
      }
    }

    return { item: itemId, target: targetId };
  }

  /**
   * Map parser intent to object intent (Façade-inspired: always returns something)
   *
   * Philosophy: Like Façade, we try to understand ANY input rather than rejecting it.
   * If we can't find an exact match, we use semantic fallbacks and context.
   *
   * TIER 19: COMPREHENSIVE SEMANTIC NLP ENGINE
   * This system competes with AI by using extensive linguistic knowledge,
   * context awareness, and intelligent fallbacks across 12 languages.
   */
  private mapIntent(parserIntent: string | null): ObjectIntent | null {
    if (!parserIntent) {
      // Façade fallback: If no intent at all, default to EXAMINE (most common action)
      return 'EXAMINE';
    }

    const normalized = parserIntent.toUpperCase();

    // PHASE 1: Try exact match first
    const exactMatch = INTENT_MAPPING[normalized];
    if (exactMatch) return exactMatch;

    // PHASE 2: Comprehensive semantic understanding
    // Like AI systems, we understand intent through multiple linguistic layers

    // ========== PERCEPTION & OBSERVATION ==========
    // Look, examine, inspect, observe, check, study, investigate, search, find
    if (normalized.includes('LOOK')) return 'EXAMINE';
    if (normalized.includes('SEE')) return 'EXAMINE';
    if (normalized.includes('WATCH')) return 'EXAMINE';
    if (normalized.includes('OBSERVE')) return 'EXAMINE';
    if (normalized.includes('VIEW')) return 'EXAMINE';
    if (normalized.includes('CHECK')) return 'EXAMINE';
    if (normalized.includes('INSPECT')) return 'EXAMINE';
    if (normalized.includes('STUDY')) return 'EXAMINE';
    if (normalized.includes('INVESTIGATE')) return 'EXAMINE';
    if (normalized.includes('SEARCH')) return 'EXAMINE';
    if (normalized.includes('SCAN')) return 'EXAMINE';
    if (normalized.includes('PEER')) return 'EXAMINE';
    if (normalized.includes('GAZE')) return 'EXAMINE';
    if (normalized.includes('STARE')) return 'EXAMINE';
    if (normalized.includes('GLANCE')) return 'EXAMINE';
    if (normalized.includes('PEEK')) return 'EXAMINE';
    if (normalized.includes('SPOT')) return 'EXAMINE';
    if (normalized.includes('NOTICE')) return 'EXAMINE';
    if (normalized.includes('FIND')) return 'EXAMINE';

    // ========== ACQUISITION & COLLECTION ==========
    // Take, get, pick, grab, collect, acquire, obtain, retrieve, fetch, loot
    if (normalized.includes('TAKE')) return 'TAKE';
    if (normalized.includes('LOOT')) return 'TAKE';  // Map LOOT to TAKE
    if (normalized.includes('PICK')) return 'TAKE';
    if (normalized.includes('GRAB')) return 'TAKE';
    if (normalized.includes('GET')) return 'TAKE';
    if (normalized.includes('COLLECT')) return 'TAKE';
    if (normalized.includes('ACQUIRE')) return 'TAKE';
    if (normalized.includes('OBTAIN')) return 'TAKE';
    if (normalized.includes('RETRIEVE')) return 'TAKE';
    if (normalized.includes('FETCH')) return 'TAKE';
    if (normalized.includes('GATHER')) return 'TAKE';
    if (normalized.includes('SNATCH')) return 'TAKE';
    if (normalized.includes('SEIZE')) return 'TAKE';
    if (normalized.includes('CATCH')) return 'TAKE';
    if (normalized.includes('CLAIM')) return 'TAKE';
    if (normalized.includes('POCKET')) return 'TAKE';
    if (normalized.includes('STEAL')) return 'TAKE';

    // ========== RELEASE & DISCARD ==========
    // Drop, put, discard, release, leave, abandon
    if (normalized.includes('DROP')) return 'DROP';
    if (normalized.includes('DISCARD')) return 'DROP';
    if (normalized.includes('RELEASE')) return 'DROP';
    if (normalized.includes('LEAVE')) return 'DROP';
    if (normalized.includes('ABANDON')) return 'DROP';
    if (normalized.includes('PLACE')) return 'DROP';
    if (normalized.includes('SET')) return 'DROP';
    if (normalized.includes('LAY')) return 'DROP';
    if (normalized.includes('REST')) return 'DROP';
    if (normalized.includes('LOSE')) return 'DROP';

    // ========== COMMUNICATION & INTERACTION ==========
    // Talk, speak, ask, tell, greet, converse, chat, discuss, question
    if (normalized.includes('TALK')) return 'TALK';
    if (normalized.includes('SPEAK')) return 'TALK';
    if (normalized.includes('ASK')) return 'TALK';
    if (normalized.includes('TELL')) return 'TALK';
    if (normalized.includes('GREET')) return 'TALK';
    if (normalized.includes('CONVERSE')) return 'TALK';
    if (normalized.includes('CHAT')) return 'TALK';
    if (normalized.includes('DISCUSS')) return 'TALK';
    if (normalized.includes('QUESTION')) return 'TALK';
    if (normalized.includes('INTERVIEW')) return 'TALK';
    if (normalized.includes('HELLO')) return 'TALK';
    if (normalized.includes('HI')) return 'TALK';
    if (normalized.includes('GREETINGS')) return 'TALK';
    if (normalized.includes('HAIL')) return 'TALK';
    if (normalized.includes('ADDRESS')) return 'TALK';
    if (normalized.includes('APPROACH')) return 'TALK';

    // ========== UTILIZATION & ACTIVATION ==========
    // Use, apply, activate, operate, employ, utilize, wield, deploy
    if (normalized.includes('USE')) return 'USE';
    if (normalized.includes('APPLY')) return 'USE';
    if (normalized.includes('ACTIVATE')) return 'USE';
    if (normalized.includes('OPERATE')) return 'USE';
    if (normalized.includes('EMPLOY')) return 'USE';
    if (normalized.includes('UTILIZE')) return 'USE';
    if (normalized.includes('WIELD')) return 'USE';
    if (normalized.includes('DEPLOY')) return 'USE';
    if (normalized.includes('ENGAGE')) return 'USE';
    if (normalized.includes('TRIGGER')) return 'USE';
    if (normalized.includes('PRESS')) return 'USE';
    if (normalized.includes('PUSH')) return 'USE';
    if (normalized.includes('PULL')) return 'USE';
    if (normalized.includes('TURN')) return 'USE';
    if (normalized.includes('FLIP')) return 'USE';
    if (normalized.includes('SWITCH')) return 'USE';

    // ========== OPENING & ACCESS ==========
    // Open, unlock, unseal, pry, force
    if (normalized.includes('OPEN')) return 'OPEN';
    if (normalized.includes('UNLOCK')) return 'OPEN';
    if (normalized.includes('UNSEAL')) return 'OPEN';
    if (normalized.includes('PRY')) return 'OPEN';
    if (normalized.includes('FORCE')) return 'OPEN';
    if (normalized.includes('BREAK')) return 'OPEN';
    if (normalized.includes('CRACK')) return 'OPEN';
    if (normalized.includes('UNBOLT')) return 'OPEN';
    if (normalized.includes('UNFASTEN')) return 'OPEN';

    // ========== CLOSING & SECURING ==========
    // Close, shut, lock, seal, secure
    if (normalized.includes('CLOSE')) return 'CLOSE';
    if (normalized.includes('SHUT')) return 'CLOSE';
    if (normalized.includes('LOCK')) return 'CLOSE';
    if (normalized.includes('SEAL')) return 'CLOSE';
    if (normalized.includes('SECURE')) return 'CLOSE';
    if (normalized.includes('FASTEN')) return 'CLOSE';
    if (normalized.includes('BOLT')) return 'CLOSE';
    if (normalized.includes('LATCH')) return 'CLOSE';

    // ========== CONSUMPTION & INGESTION ==========
    // Eat, drink, consume, devour, taste, swallow
    if (normalized.includes('EAT')) return 'EAT';
    if (normalized.includes('DRINK')) return 'EAT';
    if (normalized.includes('CONSUME')) return 'EAT';
    if (normalized.includes('DEVOUR')) return 'EAT';
    if (normalized.includes('TASTE')) return 'EAT';
    if (normalized.includes('SWALLOW')) return 'EAT';
    if (normalized.includes('SIP')) return 'EAT';
    if (normalized.includes('GULP')) return 'EAT';
    if (normalized.includes('CHEW')) return 'EAT';
    if (normalized.includes('BITE')) return 'EAT';
    if (normalized.includes('NIBBLE')) return 'EAT';

    // ========== COMBAT & AGGRESSION ==========
    // Attack, hit, fight, kill, strike, punch, kick, shoot, stab
    if (normalized.includes('ATTACK')) return 'ATTACK';
    if (normalized.includes('HIT')) return 'ATTACK';
    if (normalized.includes('FIGHT')) return 'ATTACK';
    if (normalized.includes('KILL')) return 'ATTACK';
    if (normalized.includes('STRIKE')) return 'ATTACK';
    if (normalized.includes('PUNCH')) return 'ATTACK';
    if (normalized.includes('KICK')) return 'ATTACK';
    if (normalized.includes('SHOOT')) return 'ATTACK';
    if (normalized.includes('STAB')) return 'ATTACK';
    if (normalized.includes('SLASH')) return 'ATTACK';
    if (normalized.includes('CUT')) return 'ATTACK';
    if (normalized.includes('HURT')) return 'ATTACK';
    if (normalized.includes('HARM')) return 'ATTACK';
    if (normalized.includes('DAMAGE')) return 'ATTACK';
    if (normalized.includes('DESTROY')) return 'ATTACK';
    if (normalized.includes('SMASH')) return 'ATTACK';
    if (normalized.includes('BASH')) return 'ATTACK';
    if (normalized.includes('PUMMEL')) return 'ATTACK';
    if (normalized.includes('BEAT')) return 'ATTACK';
    if (normalized.includes('ASSAULT')) return 'ATTACK';

    // ========== MOVEMENT & LOCOMOTION ==========
    // Go, walk, run, move, head, travel, proceed, advance
    if (normalized.includes('GO')) return 'MOVE';
    if (normalized.includes('WALK')) return 'MOVE';
    if (normalized.includes('RUN')) return 'MOVE';
    if (normalized.includes('MOVE')) return 'MOVE';
    if (normalized.includes('HEAD')) return 'MOVE';
    if (normalized.includes('TRAVEL')) return 'MOVE';
    if (normalized.includes('PROCEED')) return 'MOVE';
    if (normalized.includes('ADVANCE')) return 'MOVE';
    if (normalized.includes('WANDER')) return 'MOVE';
    if (normalized.includes('ENTER')) return 'MOVE';
    if (normalized.includes('EXIT')) return 'MOVE';
    if (normalized.includes('LEAVE')) return 'MOVE';
    if (normalized.includes('DEPART')) return 'MOVE';
    if (normalized.includes('FLEE')) return 'MOVE';
    if (normalized.includes('ESCAPE')) return 'MOVE';

    // ========== TRANSFER & GIVING ==========
    // Give, offer, hand, present, donate, pass
    if (normalized.includes('GIVE')) return 'GIVE';
    if (normalized.includes('OFFER')) return 'GIVE';
    if (normalized.includes('HAND')) return 'GIVE';
    if (normalized.includes('PRESENT')) return 'GIVE';
    if (normalized.includes('DONATE')) return 'GIVE';
    if (normalized.includes('PASS')) return 'GIVE';
    if (normalized.includes('SHARE')) return 'GIVE';
    if (normalized.includes('PROVIDE')) return 'GIVE';
    if (normalized.includes('DELIVER')) return 'GIVE';

    // ========== READING & COMPREHENSION ==========
    // Read, study, peruse, review, scan
    if (normalized.includes('READ')) return 'READ';
    if (normalized.includes('PERUSE')) return 'READ';
    if (normalized.includes('REVIEW')) return 'READ';
    if (normalized.includes('DECIPHER')) return 'READ';

    // ========== WEARING & EQUIPPING ==========
    // Wear, put on, equip, don, dress
    if (normalized.includes('WEAR')) return 'WEAR';
    if (normalized.includes('EQUIP')) return 'WEAR';
    if (normalized.includes('DON')) return 'WEAR';
    if (normalized.includes('DRESS')) return 'WEAR';

    // ========== THROWING & PROJECTILES ==========
    // Throw, toss, hurl, fling, cast, chuck
    if (normalized.includes('THROW')) return 'THROW';
    if (normalized.includes('TOSS')) return 'THROW';
    if (normalized.includes('HURL')) return 'THROW';
    if (normalized.includes('FLING')) return 'THROW';
    if (normalized.includes('CAST')) return 'THROW';
    if (normalized.includes('CHUCK')) return 'THROW';
    if (normalized.includes('PITCH')) return 'THROW';
    if (normalized.includes('LOB')) return 'THROW';

    // ========== CLIMBING & ASCENDING ==========
    // Climb, ascend, scale, mount
    if (normalized.includes('CLIMB')) return 'CLIMB';
    if (normalized.includes('ASCEND')) return 'CLIMB';
    if (normalized.includes('SCALE')) return 'CLIMB';
    if (normalized.includes('MOUNT')) return 'CLIMB';

    // ========== TYING & BINDING ==========
    // Tie, bind, attach, fasten, secure, knot
    if (normalized.includes('TIE')) return 'TIE';
    if (normalized.includes('BIND')) return 'TIE';
    if (normalized.includes('ATTACH')) return 'TIE';
    if (normalized.includes('KNOT')) return 'TIE';
    if (normalized.includes('ROPE')) return 'TIE';

    // ========== BURNING & FIRE ==========
    // Burn, ignite, light, kindle, set fire
    if (normalized.includes('BURN')) return 'BURN';
    if (normalized.includes('IGNITE')) return 'BURN';
    if (normalized.includes('LIGHT')) return 'BURN';
    if (normalized.includes('KINDLE')) return 'BURN';
    if (normalized.includes('FIRE')) return 'BURN';
    if (normalized.includes('TORCH')) return 'BURN';
    if (normalized.includes('FLAME')) return 'BURN';

    // PHASE 3: Final fallback with intelligent default
    // This ensures we NEVER return null and reject player input
    console.log(`[ActionValidator] Unknown intent "${parserIntent}", defaulting to EXAMINE`);
    return 'EXAMINE';
  }

  /**
   * Suggest available objects to the player
   */
  private suggestAvailableObjects(availableObjects: string[]): string {
    const names = availableObjects
      .slice(0, 3)
      .map(id => {
        const obj = this.objectSystem.getObject(id);
        return obj?.name[this.currentLanguage] || id;
      });

    return buildAvailableObjectsMessage(names, this.currentLanguage);
  }

  /**
   * Get all valid actions for an object
   */
  getValidActions(objectId: string): string[] {
    const obj = this.objectSystem.getObject(objectId);
    if (!obj) return [];

    return obj.allowedActions.map(action => action.toLowerCase());
  }

  /**
   * Generate helpful feedback for failed action
   */
  generateFeedback(validatedAction: ValidatedAction): string {
    if (validatedAction.valid) {
      return '';
    }

    const parts: string[] = [];

    // Add validation reason
    if (validatedAction.validation?.reason) {
      parts.push(validatedAction.validation.reason);
    }

    // Add required item hint
    if (validatedAction.validation?.requiredItem) {
      const itemObj = this.objectSystem.getObject(validatedAction.validation.requiredItem);
      const itemName = itemObj?.name[this.currentLanguage] || validatedAction.validation.requiredItem;
      const youNeed = getMessage('you_need', this.currentLanguage);
      parts.push(`${youNeed}: ${itemName}`);
    }

    // Add suggestion
    if (validatedAction.validation?.suggestion) {
      parts.push(validatedAction.validation.suggestion);
    } else if (validatedAction.suggestions && validatedAction.suggestions.length > 0) {
      const names = validatedAction.suggestions
        .map(id => {
          const obj = this.objectSystem.getObject(id);
          return obj?.name[this.currentLanguage] || id;
        })
        .join(', ');
      const tryInteracting = getMessage('try_interacting_with', this.currentLanguage);
      parts.push(`${tryInteracting}: ${names}`);
    }

    return parts.join('. ');
  }

  /**
   * Get object description for EXAMINE action
   */
  getObjectDescription(objectId: string): string {
    const obj = this.objectSystem.getObject(objectId);
    if (!obj) return '';

    return obj.description[this.currentLanguage] || '';
  }

  /**
   * Update language
   */
  setLanguage(language: Language): void {
    this.currentLanguage = language;
    this.discourseRecognizer = new DiscourseActRecognizer(language);
    this.semanticMatcher = new SemanticMatcher(language);
  }

  /**
   * TIER 20: Handle pure social interactions (Façade-style)
   *
   * Social interactions don't require objects - they're about communication.
   * Examples: greetings, compliments, questions without specific targets, etc.
   *
   * @returns ValidatedAction if this is a pure social interaction, null otherwise
   */
  private handleSocialInteraction(
    discourse: DiscourseAnalysis,
    input: string,
    availableObjects: string[],
    parseResult: EnhancedParseResult
  ): ValidatedAction | null {
    // Check if this is a pure social interaction (no game action needed)
    const pureSocialActs = [
      'GREETING',
      'FAREWELL',
      'THANKS',
      'APOLOGY',
      'AGREEMENT',
      'DISAGREEMENT',
      'CONFIRMATION',
      'TOPIC_CHANGE',
      'CLARIFICATION',
      'ENCOURAGEMENT'
    ];

    if (pureSocialActs.includes(discourse.primary)) {
      // Find if there's an NPC to target
      const npcId = this.findNPCInContext(availableObjects, input);

      return {
        valid: true,
        objectId: npcId,
        intent: 'TALK' as ObjectIntent,  // Social acts map to TALK
        validation: { valid: true },
        parseResult,
        discourseAnalysis: discourse
      };
    }

    // Check if this is a compliment or insult directed at an NPC
    if (discourse.primary === 'COMPLIMENT' || discourse.primary === 'INSULT') {
      const npcId = this.findNPCInContext(availableObjects, input);

      if (npcId) {
        return {
          valid: true,
          objectId: npcId,
          intent: 'TALK' as ObjectIntent,
          validation: { valid: true },
          parseResult,
          discourseAnalysis: discourse
        };
      }

      // Compliment/insult with no target - general statement
      return {
        valid: true,
        objectId: null,
        intent: null,
        validation: { valid: true },
        parseResult,
        discourseAnalysis: discourse
      };
    }

    // Questions might be directed at NPCs
    if (discourse.primary.startsWith('QUESTION_')) {
      const npcId = this.findNPCInContext(availableObjects, input);

      if (npcId) {
        return {
          valid: true,
          objectId: npcId,
          intent: 'TALK' as ObjectIntent,
          validation: { valid: true },
          parseResult,
          discourseAnalysis: discourse
        };
      }
    }

    // Statements can be directed at NPCs
    if (discourse.primary.startsWith('STATEMENT_') && input.includes('you')) {
      const npcId = this.findNPCInContext(availableObjects, input);

      if (npcId) {
        return {
          valid: true,
          objectId: npcId,
          intent: 'TALK' as ObjectIntent,
          validation: { valid: true },
          parseResult,
          discourseAnalysis: discourse
        };
      }
    }

    // Not a pure social interaction - continue with game action processing
    return null;
  }

  /**
   * TIER 20: Find NPC in current context
   *
   * Looks for NPCs in available objects, prioritizing those mentioned in input
   */
  private findNPCInContext(availableObjects: string[], input: string): string | null {
    const lowerInput = input.toLowerCase();

    // Check if input mentions a specific NPC
    for (const objId of availableObjects) {
      if (this.isNPC(objId)) {
        // Check if NPC name or ID is in input
        const obj = this.objectSystem.getObject(objId);
        const npcName = obj?.name[this.currentLanguage]?.toLowerCase();

        if (npcName && lowerInput.includes(npcName)) {
          return objId;
        }

        // Check object ID itself (e.g., "wizard" in "wizard_aldric")
        const idParts = objId.toLowerCase().split('_');
        if (idParts.some(part => lowerInput.includes(part))) {
          return objId;
        }
      }
    }

    // No specific NPC mentioned - return first NPC if any
    const npcs = availableObjects.filter(id => this.isNPC(id));
    return npcs.length > 0 ? npcs[0] : null;
  }

  /**
   * TIER 20 + TIER 1: Check if object ID represents an NPC
   * IMPROVED: Uses NPCPersonaManager registry as source of truth (Façade approach)
   */
  private isNPC(objectId: string): boolean {
    // Method 1: Check if NPCPersonaManager knows about it (BEST - registry-aware)
    if (this.npcPersonaManager && this.npcPersonaManager.getNPC(objectId)) {
      return true;
    }

    // Method 2: Fallback - check if object has NPC-like properties (Scribblenauts approach)
    const obj = this.objectSystem.getObject(objectId);
    if (obj?.properties?.is_alive && obj?.properties?.can_talk) {
      return true;
    }

    // Method 3: Last resort - keyword matching (brittle but catches edge cases)
    const npcKeywords = [
      'npc', 'wizard', 'merchant', 'guard', 'bartender', 'bard',
      'stranger', 'elder', 'child', 'villager', 'traveler',
      'knight', 'priest', 'king', 'queen', 'princess',
      'scientist', 'doctor', 'engineer', 'captain', 'pilot',
      'sprite', 'dragon', 'mago', 'sorcier', 'zauberer'  // TIER 1: Add multilingual keywords
    ];

    const lowerId = objectId.toLowerCase();
    return npcKeywords.some(keyword => lowerId.includes(keyword));
  }

  /**
   * TIER 1: Detect NPC from parser's extracted object
   * Fixes "me acerco al mago" → should be TALK, not MOVE
   * This is the core of the Façade approach: context-aware intent conversion
   */
  private detectNPCFromExtractedObject(
    parserExtractedObject: string,
    availableObjects: string[]
  ): string | null {
    const lowerExtracted = parserExtractedObject.toLowerCase();

    // Find all NPCs in available objects
    const npcIds = availableObjects.filter(id => this.isNPC(id));

    if (npcIds.length === 0) return null;

    // Try to match by name mentioned in extracted object
    for (const npcId of npcIds) {
      const obj = this.objectSystem.getObject(npcId);
      const npcName = obj?.name[this.currentLanguage]?.toLowerCase();

      if (npcName && lowerExtracted.includes(npcName)) {
        console.log(`[ActionValidator] Detected NPC from parser: ${npcId} (name: ${npcName})`);
        return npcId;
      }
    }

    // Fallback: If only one NPC available and input mentions anything social, assume it's the target
    if (npcIds.length === 1) {
      const socialKeywords = ['approach', 'talk', 'speak', 'ask', 'tell', 'greet',
                              'acerco', 'hablar', 'parler', 'sprechen', 'parlare',
                              '話す', '说话', 'говорить', 'falar', 'mówić'];
      const hasSocialVerb = socialKeywords.some(kw => lowerExtracted.includes(kw));
      if (hasSocialVerb) {
        console.log(`[ActionValidator] Single NPC context + social verb → ${npcIds[0]}`);
        return npcIds[0];
      }
    }

    return null;
  }

  /**
   * FACADE 1.1: Register NPC gender for pronoun resolution
   */
  registerNPC(npcId: string, gender: 'male' | 'female' | 'neutral'): void {
    this.anaphoraResolver.registerNPC(npcId, gender);
  }

  /**
   * FACADE 1.1: Update anaphora context after successful action
   * Call this after validating an action to track mentioned entities
   */
  updateAnaphoraContext(
    input: string,
    mentionedNPC?: string,
    mentionedObject?: string,
    mentionedLocation?: string
  ): void {
    this.anaphoraResolver.updateContext(input, mentionedNPC, mentionedObject, mentionedLocation);
  }

  /**
   * FACADE 1.1: Reset anaphora context (new conversation or scene)
   */
  resetAnaphoraContext(): void {
    this.anaphoraResolver.resetContext();
  }
}

/**
 * Factory to create ActionValidator from components
 */
export function createActionValidator(
  objectSystem: ObjectSystem,
  parser: StandardModeParser,
  language: Language,
  npcPersonaManager?: any  // TIER 1: Optional NPCPersonaManager for context-aware NPC detection
): ActionValidator {
  return new ActionValidator(objectSystem, parser, language, npcPersonaManager);
}
