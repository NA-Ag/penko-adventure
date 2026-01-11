/**
 * SCRIBBLENAUTS PARITY 1.1-1.3: Text-Based Object Spawning
 *
 * Allows players to create objects by typing descriptions like:
 * - "create red door"
 * - "spawn tiny dragon"
 * - "make big sword"
 * - "door that is big and red"
 *
 * Integrated with AdjectiveNounParser (1.2) for sophisticated parsing.
 * This is the foundation for Scribblenauts-style emergent gameplay
 * where players can solve problems by creating appropriate objects.
 */

import { GameObject, ObjectProperties, ObjectIntent } from './ObjectSystem';
import { Language } from '../../types';
import { AdjectiveNounParser } from '../parser/AdjectiveNounParser';
import { UnknownObjectGenerator } from './UnknownObjectGenerator';
import { ColorModifier } from '../modifiers/ColorModifier';
import { ScaleModifier } from '../modifiers/ScaleModifier';
import { MaterialModifier } from '../modifiers/MaterialModifier';
import { PropertyCompositor } from '../modifiers/PropertyCompositor';
import { PropertyDescriptionGenerator } from '../modifiers/PropertyDescriptionGenerator';
import { RuntimeDictionaryManager } from '../dictionary/RuntimeDictionaryManager';
import { DictionaryTrie } from '../dictionary/DictionaryTrie';
import { WorldStateManager } from '../persistence/WorldStateManager';

/**
 * Request to create a new object
 */
export interface CreateObjectRequest {
  description: string;        // User's input (e.g., "red door", "tiny dragon")
  location?: string;          // Where to spawn (optional)
  requestedBy: string;        // Who requested it (player ID)
  language: Language;         // For localized names
}

/**
 * Result of object creation attempt
 */
export interface CreateObjectResult {
  success: boolean;
  object?: GameObject;
  message: string;            // Feedback to user
  error?: string;             // Error details if failed
}

/**
 * Parsed object description
 */
export interface ParsedDescription {
  adjectives: string[];       // Modifiers: ["red", "big", "wooden"]
  noun: string;               // Base object: "door", "sword", "dragon"
  confidence: number;         // 0.0-1.0, how confident are we in the parse?
}

/**
 * Template for creating objects of a certain type
 */
export interface ObjectTemplate {
  type: string;               // "door", "sword", "dragon", etc.
  baseProperties: ObjectProperties;
  allowedActions: ObjectIntent[];
  category: ObjectCategory;
  tags: string[];            // For searching/filtering
  icon?: string;             // Future: visual representation
}

/**
 * Categories for organizing objects
 */
export enum ObjectCategory {
  CREATURE = 'creature',
  ITEM = 'item',
  STRUCTURE = 'structure',
  NATURE = 'nature',
  FOOD = 'food',
  WEAPON = 'weapon',
  TOOL = 'tool',
  CONTAINER = 'container',
  FURNITURE = 'furniture',
  VEHICLE = 'vehicle',
  MAGIC = 'magic',
  UNKNOWN = 'unknown'
}

/**
 * Dynamic Object Creator - Creates objects from text descriptions
 */
export class DynamicObjectCreator {
  private templates: Map<string, ObjectTemplate> = new Map();
  private createdObjects: Map<string, GameObject> = new Map();
  private objectIdCounter: number = 0;
  private advancedParser: AdjectiveNounParser;
  private unknownGenerator: UnknownObjectGenerator;
  private colorModifier: ColorModifier;
  private scaleModifier: ScaleModifier;
  private materialModifier: MaterialModifier;
  private propertyCompositor: PropertyCompositor;
  private descriptionGenerator: PropertyDescriptionGenerator;
  private runtimeDictionary: RuntimeDictionaryManager;
  private worldState: WorldStateManager;

  constructor() {
    this.advancedParser = new AdjectiveNounParser(Language.ENGLISH);
    this.unknownGenerator = new UnknownObjectGenerator();
    this.colorModifier = new ColorModifier();
    this.scaleModifier = new ScaleModifier();
    this.materialModifier = new MaterialModifier();
    this.propertyCompositor = new PropertyCompositor(
      this.colorModifier,
      this.scaleModifier,
      this.materialModifier
    );
    this.descriptionGenerator = new PropertyDescriptionGenerator(
      this.colorModifier,
      this.scaleModifier,
      this.materialModifier
    );

    // Initialize runtime dictionary for user-defined words (SCRIBBLENAUTS 3.3)
    const baseDictionary = new DictionaryTrie();
    this.runtimeDictionary = new RuntimeDictionaryManager(baseDictionary, 'player', {
      autoSave: true,
      storageKey: 'penko_user_dictionary'
    });

    // Load saved user dictionary
    this.runtimeDictionary.load();

    // Initialize world state manager (SCRIBBLENAUTS 4.2)
    this.worldState = new WorldStateManager('player', {
      storageKey: 'penko_world_state'
    });

    // Enable auto-save every 5 minutes
    this.worldState.enableAutoSave(300000);

    this.initializeDefaultTemplates();

    // Restore created objects from world state
    this.restoreObjectsFromWorldState();
  }

  /**
   * Restore objects from saved world state
   */
  private restoreObjectsFromWorldState(): void {
    const objects = this.worldState.getAllObjects();
    for (const obj of objects) {
      this.createdObjects.set(obj.id, obj);
    }

    if (objects.length > 0) {
      console.log(`[DynamicObjectCreator] SCRIBBLENAUTS 4.2: Restored ${objects.length} objects from world state`);
    }
  }

  /**
   * Create an object from a text description
   */
  createObject(request: CreateObjectRequest): CreateObjectResult {
    // Update parser language
    this.advancedParser.setLanguage(request.language);

    // Use advanced parser for better parsing
    const advancedParse = this.advancedParser.parse(request.description);

    // Fallback to simple parser if advanced parser fails
    const parsed = advancedParse.confidence >= 0.5
      ? {
          adjectives: advancedParse.adjectives,
          noun: advancedParse.noun,
          confidence: advancedParse.confidence
        }
      : this.parseDescription(request.description);

    if (parsed.confidence < 0.3) {
      return {
        success: false,
        message: this.getLocalizedMessage(
          'create_unclear',
          request.language,
          request.description
        ),
        error: 'Low confidence parse'
      };
    }

    // Find or create template for the noun (pass adjectives for better unknown object inference)
    const template = this.getOrCreateTemplate(parsed.noun, parsed.adjectives);

    // Apply adjectives to modify properties
    const properties = this.applyAdjectives(
      { ...template.baseProperties },
      parsed.adjectives
    );

    // Generate unique ID
    const objectId = this.generateObjectId(parsed.noun);

    // Generate rich descriptions using PropertyDescriptionGenerator
    const descriptions = this.descriptionGenerator.generateDescriptions(
      parsed.noun,
      properties,
      request.language
    );

    // Create the game object
    const gameObject: GameObject = {
      id: objectId,
      name: this.generateLocalizedName(parsed, request.language),
      description: this.generateLocalizedDescriptionFromGenerated(descriptions, request.language),
      properties,
      allowedActions: [...template.allowedActions]
    };

    // Store the created object
    this.createdObjects.set(objectId, gameObject);

    // Register object with world state (SCRIBBLENAUTS 4.2)
    this.worldState.registerObject(gameObject, request.location || this.worldState.getCurrentLocation());

    return {
      success: true,
      object: gameObject,
      message: this.getLocalizedMessage(
        'create_success',
        request.language,
        this.getObjectName(gameObject, request.language)
      )
    };
  }

  /**
   * Parse user description into adjectives and noun
   */
  parseDescription(description: string): ParsedDescription {
    // Normalize input
    const normalized = description.toLowerCase().trim();
    const words = normalized.split(/\s+/);

    if (words.length === 0) {
      return { adjectives: [], noun: '', confidence: 0 };
    }

    // Simple heuristic: last word is noun, others are adjectives
    const noun = words[words.length - 1];
    const adjectives = words.slice(0, -1);

    // Calculate confidence based on recognized words
    const nounConfidence = this.isKnownNoun(noun) ? 1.0 : 0.5;
    const adjectiveConfidence = adjectives.length === 0 ? 1.0 :
      adjectives.filter(adj => this.isKnownAdjective(adj)).length / adjectives.length;

    const confidence = (nounConfidence + adjectiveConfidence) / 2;

    return {
      adjectives,
      noun,
      confidence
    };
  }

  /**
   * Check if a word is a known noun (object type)
   */
  private isKnownNoun(word: string): boolean {
    return this.templates.has(word) || this.isCommonNoun(word);
  }

  /**
   * Check if a word is a known adjective
   */
  private isKnownAdjective(word: string): boolean {
    const knownAdjectives = [
      // Colors
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white',
      'brown', 'gray', 'pink', 'crimson', 'azure', 'emerald', 'gold', 'silver',

      // Sizes
      'big', 'small', 'tiny', 'huge', 'large', 'enormous', 'gigantic', 'miniature',

      // Materials
      'wooden', 'metal', 'iron', 'steel', 'stone', 'glass', 'plastic', 'golden',
      'silver', 'bronze', 'copper',

      // Qualities
      'sharp', 'dull', 'heavy', 'light', 'soft', 'hard', 'strong', 'weak',
      'hot', 'cold', 'warm', 'cool', 'bright', 'dark', 'shiny', 'rusty',
      'new', 'old', 'ancient', 'modern', 'broken', 'fixed',

      // States
      'open', 'closed', 'locked', 'unlocked', 'lit', 'unlit', 'burning',

      // Descriptive
      'beautiful', 'ugly', 'scary', 'friendly', 'dangerous', 'safe',
      'magical', 'enchanted', 'cursed', 'blessed'
    ];

    return knownAdjectives.includes(word);
  }

  /**
   * Check if word is a common noun we can create
   */
  private isCommonNoun(word: string): boolean {
    const commonNouns = [
      // Structures
      'door', 'wall', 'window', 'gate', 'fence', 'bridge', 'ladder', 'stairs',

      // Items
      'box', 'chest', 'barrel', 'crate', 'bag', 'basket',

      // Weapons
      'sword', 'axe', 'bow', 'arrow', 'spear', 'dagger', 'hammer', 'shield',

      // Tools
      'rope', 'torch', 'lantern', 'key', 'lock', 'lever', 'button',

      // Creatures
      'dragon', 'wolf', 'bear', 'bird', 'fish', 'snake', 'spider', 'cat', 'dog',

      // Nature
      'tree', 'rock', 'stone', 'flower', 'bush', 'grass', 'water', 'fire',

      // Food
      'apple', 'bread', 'meat', 'cheese', 'water', 'wine', 'potion',

      // Furniture
      'chair', 'table', 'bed', 'bench', 'stool'
    ];

    return commonNouns.includes(word);
  }

  /**
   * Get or create a template for a noun
   */
  private getOrCreateTemplate(noun: string, adjectives: string[] = []): ObjectTemplate {
    // SCRIBBLENAUTS 3.3: Check if this is a custom user-defined object
    if (this.runtimeDictionary.isCustomObject(noun)) {
      const customObject = this.runtimeDictionary.getCustomObject(noun);
      if (customObject) {
        console.log(`[DynamicObjectCreator] SCRIBBLENAUTS 3.3: Using custom object template for "${noun}"`);

        // Record usage
        this.runtimeDictionary.recordObjectUsage(noun);

        // Convert custom object to template
        return {
          type: noun,
          baseProperties: customObject.baseProperties,
          allowedActions: customObject.allowedActions,
          category: this.inferCategoryFromProperties(customObject.baseProperties),
          tags: ['custom', 'user-defined'],
          icon: undefined
        };
      }
    }

    // Check if we have a pre-defined template
    if (this.templates.has(noun)) {
      return this.templates.get(noun)!;
    }

    // Try simple inference first
    const simpleTemplate = this.inferTemplate(noun);

    // If simple inference returns generic item and noun is not in known list,
    // use UnknownObjectGenerator for better inference
    if (simpleTemplate.category === ObjectCategory.ITEM && !this.isCommonNoun(noun)) {
      const inferred = this.unknownGenerator.inferObject(noun, adjectives);

      // If unknown generator has higher confidence, use it
      if (inferred.confidence >= 0.4) {
        return this.unknownGenerator.toTemplate(inferred, noun);
      }
    }

    return simpleTemplate;
  }

  /**
   * Infer category from object properties (for custom objects)
   */
  private inferCategoryFromProperties(properties: ObjectProperties): ObjectCategory {
    if (properties.is_alive) {
      return ObjectCategory.CREATURE;
    }
    if (properties.category === 'weapon' || properties.damage > 0) {
      return ObjectCategory.WEAPON;
    }
    if (properties.category === 'structure') {
      return ObjectCategory.STRUCTURE;
    }
    if (properties.category === 'food') {
      return ObjectCategory.FOOD;
    }
    if (properties.category === 'container') {
      return ObjectCategory.CONTAINER;
    }
    if (properties.category === 'vehicle') {
      return ObjectCategory.VEHICLE;
    }
    if (properties.is_magical || properties.category === 'magic') {
      return ObjectCategory.MAGIC;
    }
    return ObjectCategory.ITEM;
  }

  /**
   * Infer template from noun using heuristics
   */
  private inferTemplate(noun: string): ObjectTemplate {
    // Creatures
    if (['dragon', 'wolf', 'bear', 'bird', 'fish', 'snake', 'spider', 'cat', 'dog'].includes(noun)) {
      return this.createCreatureTemplate(noun);
    }

    // Weapons
    if (['sword', 'axe', 'bow', 'spear', 'dagger', 'hammer'].includes(noun)) {
      return this.createWeaponTemplate(noun);
    }

    // Doors/gates
    if (['door', 'gate'].includes(noun)) {
      return this.createDoorTemplate(noun);
    }

    // Containers
    if (['box', 'chest', 'barrel', 'crate', 'bag', 'basket'].includes(noun)) {
      return this.createContainerTemplate(noun);
    }

    // Default: generic item
    return this.createGenericItemTemplate(noun);
  }

  /**
   * Apply adjectives to modify object properties
   *
   * Uses PropertyCompositor for comprehensive modifier combination,
   * conflict detection, and validation.
   */
  private applyAdjectives(
    properties: ObjectProperties,
    adjectives: string[]
  ): ObjectProperties {
    // Use PropertyCompositor for comprehensive property composition
    const composition = this.propertyCompositor.composeProperties(properties, adjectives);

    // Log warnings if there are any (for debugging)
    if (composition.warnings.length > 0) {
      console.warn('[DynamicObjectCreator] Property composition warnings:', composition.warnings);
    }

    // Log conflicts if there are any (for debugging)
    if (composition.conflicts.length > 0) {
      console.log('[DynamicObjectCreator] Property conflicts detected:', composition.conflicts);
    }

    // Handle friendly/dangerous modifiers (NPC-specific)
    for (const adj of adjectives) {
      if (adj === 'friendly') {
        composition.finalProperties.is_friendly = true;
        composition.finalProperties.disposition = 75;
      }
      if (adj === 'dangerous' || adj === 'scary') {
        composition.finalProperties.is_friendly = false;
        composition.finalProperties.disposition = -50;
      }
    }

    return composition.finalProperties;
  }

  /**
   * Generate unique object ID
   */
  private generateObjectId(baseNoun: string): string {
    this.objectIdCounter++;
    return `created_${baseNoun}_${this.objectIdCounter}_${Date.now()}`;
  }

  /**
   * Generate localized name
   */
  private generateLocalizedName(parsed: ParsedDescription, language: Language): Record<Language, string> {
    const adjectives = parsed.adjectives.join(' ');
    const fullName = adjectives ? `${adjectives} ${parsed.noun}` : parsed.noun;

    // For now, use English for all languages (future: translate)
    const result: Record<Language, string> = {} as Record<Language, string>;
    for (const lang of Object.values(Language)) {
      result[lang] = fullName;
    }

    return result;
  }

  /**
   * Generate localized description from PropertyDescriptionGenerator result
   */
  private generateLocalizedDescriptionFromGenerated(
    descriptions: { short: string; detailed: string; examining: string },
    language: Language
  ): Record<Language, string> {
    // Use the detailed description as the main description
    const result: Record<Language, string> = {} as Record<Language, string>;

    // For now, use the same description for all languages
    // Future: Generate descriptions in each language separately
    for (const lang of Object.values(Language)) {
      result[lang] = descriptions.detailed;
    }

    return result;
  }

  /**
   * Get object name in specified language
   */
  private getObjectName(object: GameObject, language: Language): string {
    return object.name[language] || object.name[Language.ENGLISH] || object.id;
  }

  /**
   * Get localized message
   */
  private getLocalizedMessage(key: string, language: Language, ...args: string[]): string {
    const messages: Record<string, Record<Language, string>> = {
      create_success: {
        [Language.ENGLISH]: `Created: ${args[0]}`,
        [Language.SPANISH]: `Creado: ${args[0]}`,
        [Language.FRENCH]: `Créé: ${args[0]}`,
        [Language.GERMAN]: `Erstellt: ${args[0]}`,
        [Language.JAPANESE]: `作成: ${args[0]}`,
        [Language.CHINESE_SIMPLIFIED]: `创建: ${args[0]}`,
        [Language.PORTUGUESE]: `Criado: ${args[0]}`,
        [Language.ITALIAN]: `Creato: ${args[0]}`
      },
      create_unclear: {
        [Language.ENGLISH]: `I'm not sure what "${args[0]}" is. Try being more specific.`,
        [Language.SPANISH]: `No estoy seguro de qué es "${args[0]}". Intenta ser más específico.`,
        [Language.FRENCH]: `Je ne suis pas sûr de ce qu'est "${args[0]}". Essayez d'être plus précis.`,
        [Language.GERMAN]: `Ich bin mir nicht sicher, was "${args[0]}" ist. Versuchen Sie genauer zu sein.`,
        [Language.JAPANESE]: `"${args[0]}" が何か分かりません。もっと具体的にしてください。`,
        [Language.CHINESE_SIMPLIFIED]: `我不确定"${args[0]}"是什么。请更具体一些。`,
        [Language.PORTUGUESE]: `Não tenho certeza do que é "${args[0]}". Tente ser mais específico.`,
        [Language.ITALIAN]: `Non sono sicuro di cosa sia "${args[0]}". Prova ad essere più specifico.`
      }
    };

    return messages[key]?.[language] || messages[key]?.[Language.ENGLISH] || key;
  }

  /**
   * Register a custom template
   */
  registerTemplate(template: ObjectTemplate): void {
    this.templates.set(template.type, template);
  }

  /**
   * Get a created object by ID
   */
  getCreatedObject(id: string): GameObject | undefined {
    return this.createdObjects.get(id);
  }

  /**
   * Get all created objects
   */
  getAllCreatedObjects(): GameObject[] {
    return Array.from(this.createdObjects.values());
  }

  // ============================================================================
  // SCRIBBLENAUTS 3.3: Runtime Dictionary Expansion
  // ============================================================================

  /**
   * Add a user-defined word to the runtime dictionary
   */
  addUserWord(word: string, metadata: any): { success: boolean; message: string } {
    return this.runtimeDictionary.addUserWord(word, metadata);
  }

  /**
   * Add a custom object template
   */
  addCustomObject(
    noun: string,
    baseProperties: ObjectProperties,
    allowedActions: string[],
    options?: { description?: string; isPublic?: boolean }
  ): { success: boolean; message: string } {
    return this.runtimeDictionary.addCustomObject(noun, baseProperties, allowedActions, options);
  }

  /**
   * Get custom object template
   */
  getCustomObject(noun: string) {
    return this.runtimeDictionary.getCustomObject(noun);
  }

  /**
   * Check if object is custom
   */
  isCustomObject(noun: string): boolean {
    return this.runtimeDictionary.isCustomObject(noun);
  }

  /**
   * Remove custom object
   */
  removeCustomObject(noun: string): boolean {
    return this.runtimeDictionary.removeCustomObject(noun);
  }

  /**
   * Get all custom objects
   */
  getAllCustomObjects() {
    return this.runtimeDictionary.getAllCustomObjects();
  }

  /**
   * Get runtime dictionary statistics
   */
  getRuntimeDictionaryStats() {
    return this.runtimeDictionary.getStats();
  }

  /**
   * Export user dictionary
   */
  exportUserDictionary() {
    return this.runtimeDictionary.export();
  }

  /**
   * Import user dictionary
   */
  importUserDictionary(data: any) {
    return this.runtimeDictionary.import(data);
  }

  /**
   * Save user dictionary to localStorage
   */
  saveUserDictionary() {
    return this.runtimeDictionary.save();
  }

  /**
   * Load user dictionary from localStorage
   */
  loadUserDictionary() {
    return this.runtimeDictionary.load();
  }

  /**
   * Clear all user-defined content
   */
  clearUserDictionary(): void {
    this.runtimeDictionary.clear();
  }

  // ============================================================================
  // SCRIBBLENAUTS 4.2: Object State Persistence
  // ============================================================================

  /**
   * Save world state
   */
  saveWorldState(slotName: string = 'default'): { success: boolean; message: string } {
    return this.worldState.saveWorldState(slotName);
  }

  /**
   * Load world state
   */
  loadWorldState(slotName: string = 'default'): { success: boolean; message: string; objectsLoaded?: number } {
    const result = this.worldState.loadWorldState(slotName);
    if (result.success) {
      // Sync created objects with world state
      this.restoreObjectsFromWorldState();
    }
    return result;
  }

  /**
   * Check if saved state exists
   */
  hasSavedWorldState(slotName: string = 'default'): boolean {
    return this.worldState.hasSavedState(slotName);
  }

  /**
   * Get all save slots
   */
  getAllSaveSlots() {
    return this.worldState.getAllSaveSlots();
  }

  /**
   * Delete save slot
   */
  deleteSaveSlot(slotName: string): boolean {
    return this.worldState.deleteSaveSlot(slotName);
  }

  /**
   * Export world state
   */
  exportWorldState() {
    return this.worldState.exportWorldState();
  }

  /**
   * Import world state
   */
  importWorldState(exportData: any) {
    const result = this.worldState.importWorldState(exportData);
    if (result.success) {
      this.restoreObjectsFromWorldState();
    }
    return result;
  }

  /**
   * Enable auto-save
   */
  enableAutoSave(intervalMs: number = 300000): void {
    this.worldState.enableAutoSave(intervalMs);
  }

  /**
   * Disable auto-save
   */
  disableAutoSave(): void {
    this.worldState.disableAutoSave();
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled(): boolean {
    return this.worldState.isAutoSaveEnabled();
  }

  /**
   * Set current location
   */
  setCurrentLocation(location: string): void {
    this.worldState.setCurrentLocation(location);
  }

  /**
   * Get current location
   */
  getCurrentLocation(): string {
    return this.worldState.getCurrentLocation();
  }

  /**
   * Get objects in specific location
   */
  getObjectsInLocation(location: string): GameObject[] {
    return this.worldState.getObjectsInLocation(location);
  }

  /**
   * Get visible objects in current location
   */
  getVisibleObjectsInCurrentLocation(): GameObject[] {
    return this.worldState.getVisibleObjectsInCurrentLocation();
  }

  /**
   * Move object to different location
   */
  moveObjectToLocation(objectId: string, newLocation: string): void {
    this.worldState.moveObjectToLocation(objectId, newLocation);
  }

  /**
   * Set object visibility
   */
  setObjectVisibility(objectId: string, visible: boolean): void {
    this.worldState.setObjectVisibility(objectId, visible);
  }

  /**
   * Destroy object
   */
  destroyObject(objectId: string): void {
    this.worldState.destroyObject(objectId);
  }

  /**
   * Restore destroyed object
   */
  restoreObject(objectId: string): void {
    this.worldState.restoreObject(objectId);
  }

  /**
   * Update object properties
   */
  updateObjectProperties(objectId: string, properties: Partial<any>): void {
    this.worldState.updateObjectProperties(objectId, properties);

    // Also update in created objects cache
    const obj = this.createdObjects.get(objectId);
    if (obj) {
      Object.assign(obj.properties, properties);
    }
  }

  /**
   * Get world state statistics
   */
  getWorldStateStats() {
    return this.worldState.getStats();
  }

  /**
   * Get object state
   */
  getObjectState(objectId: string) {
    return this.worldState.getObjectState(objectId);
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // Will be populated with common object templates
    // For now, templates are created on-demand via inferTemplate()
  }

  /**
   * Create creature template
   */
  private createCreatureTemplate(noun: string): ObjectTemplate {
    return {
      type: noun,
      baseProperties: {
        is_alive: true,
        is_friendly: true,
        can_talk: false,
        disposition: 0,
        health_restore: 0,
        damage: 5,
        traits: ['creature']
      },
      allowedActions: ['EXAMINE', 'TALK', 'ATTACK', 'GIVE'],
      category: ObjectCategory.CREATURE,
      tags: ['creature', 'living', noun]
    };
  }

  /**
   * Create weapon template
   */
  private createWeaponTemplate(noun: string): ObjectTemplate {
    return {
      type: noun,
      baseProperties: {
        can_be_held: true,
        is_sharp: noun !== 'hammer',
        damage: 10,
        weight: 5,
        traits: ['weapon']
      },
      allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'ATTACK', 'THROW'],
      category: ObjectCategory.WEAPON,
      tags: ['weapon', 'item', noun]
    };
  }

  /**
   * Create door template
   */
  private createDoorTemplate(noun: string): ObjectTemplate {
    return {
      type: noun,
      baseProperties: {
        is_solid: true,
        can_be_opened: true,
        can_be_locked: true,
        is_open: false,
        is_locked: false,
        traits: ['door']
      },
      allowedActions: ['EXAMINE', 'OPEN', 'CLOSE', 'USE'],
      category: ObjectCategory.STRUCTURE,
      tags: ['structure', 'door', noun]
    };
  }

  /**
   * Create container template
   */
  private createContainerTemplate(noun: string): ObjectTemplate {
    return {
      type: noun,
      baseProperties: {
        can_be_opened: true,
        can_be_held: noun === 'bag' || noun === 'basket',
        can_contain: ['*'], // Can contain anything
        is_open: false,
        weight: noun === 'bag' ? 1 : 10,
        traits: ['container']
      },
      allowedActions: ['EXAMINE', 'OPEN', 'CLOSE', 'TAKE', 'DROP', 'USE'],
      category: ObjectCategory.CONTAINER,
      tags: ['container', 'item', noun]
    };
  }

  /**
   * Create generic item template
   */
  private createGenericItemTemplate(noun: string): ObjectTemplate {
    return {
      type: noun,
      baseProperties: {
        can_be_held: true,
        weight: 1,
        traits: []
      },
      allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'THROW'],
      category: ObjectCategory.ITEM,
      tags: ['item', noun]
    };
  }
}
