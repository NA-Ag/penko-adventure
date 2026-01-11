/**
 * Scribblenauts Engine
 *
 * Implements a dynamic object spawning system inspired by Scribblenauts.
 * Players can type phrases like "large red car" and the engine will:
 * 1. Parse the input to identify modifiers (adjectives) and base object (noun)
 * 2. Spawn the object with all modifiers applied
 * 3. Add it to the game world for characters to interact with
 *
 * Architecture:
 * - Uses a modifier dictionary for fast adjective lookup
 * - Uses an object database for noun recognition
 * - Right-to-left parsing (rightmost word is likely the noun)
 * - Trie-like structure for efficient word matching
 */

import fs from 'fs';
import path from 'path';
import {
  ModifierDictionary,
  ModifierWord,
  BaseObject,
  ObjectDatabase,
  Modifier,
  SpawnedObject,
  ParsedObjectInput,
  SpawnRequest,
  ScribblenautsConfig,
  InteractionType,
  InteractionResult,
} from '../types/scribblenauts';

export class ScribblenautsEngine {
  private modifierDictionary: ModifierDictionary = {};
  private objectDatabase: ObjectDatabase = {};
  private spawnedObjects: Map<string, SpawnedObject> = new Map();
  private config: ScribblenautsConfig;
  private nextInstanceId: number = 1;
  private currentTurn: number = 0;

  constructor(config: ScribblenautsConfig = {}) {
    this.config = {
      maxObjectsPerScene: config.maxObjectsPerScene ?? 20,
      allowCustomModifiers: config.allowCustomModifiers ?? true,
      debugMode: config.debugMode ?? false,
    };

    console.log('[ScribblenautsEngine] Constructed with config:', this.config);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Load modifier dictionary and object database
   */
  async initialize(): Promise<void> {
    console.log('[ScribblenautsEngine] Initializing...');

    const dataDir = path.join(__dirname, '../data/community');

    // Load modifier dictionary
    const dictionaryPath = path.join(dataDir, 'modifier-dictionary.json');
    const dictionaryData = fs.readFileSync(dictionaryPath, 'utf-8');
    this.modifierDictionary = JSON.parse(dictionaryData);

    const modifierCount = Object.values(this.modifierDictionary).reduce(
      (sum, bucket) => sum + Object.keys(bucket).length,
      0
    );
    console.log(`[ScribblenautsEngine] Loaded ${modifierCount} modifier words`);

    // Load object database
    const objectsPath = path.join(dataDir, 'objects.json');
    const objectsData = fs.readFileSync(objectsPath, 'utf-8');
    this.objectDatabase = JSON.parse(objectsData);

    const objectCount = Object.values(this.objectDatabase).reduce(
      (sum, category) => sum + Object.keys(category).length,
      0
    );
    console.log(`[ScribblenautsEngine] Loaded ${objectCount} base objects`);

    console.log('[ScribblenautsEngine] ✅ Initialization complete');
  }

  // ============================================================================
  // INPUT PARSING
  // ============================================================================

  /**
   * Parse player input to extract object and modifiers
   * Uses right-to-left parsing: "large red car" -> noun="car", modifiers=["large", "red"]
   */
  parseInput(input: string): ParsedObjectInput {
    const normalized = input.toLowerCase().trim();
    const words = normalized.split(/\s+/);

    if (this.config.debugMode) {
      console.log(`[ScribblenautsEngine] Parsing: "${input}"`);
      console.log(`[ScribblenautsEngine] Words: ${JSON.stringify(words)}`);
    }

    // Try to find a base object by checking words from right to left
    let baseObject: BaseObject | undefined;
    let nounIndex = -1;

    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      baseObject = this.findBaseObject(word);

      if (baseObject) {
        nounIndex = i;
        if (this.config.debugMode) {
          console.log(`[ScribblenautsEngine] Found noun at index ${i}: ${baseObject.name}`);
        }
        break;
      }
    }

    // If no base object found, return failure
    if (!baseObject || nounIndex === -1) {
      return {
        success: false,
        modifiers: [],
        originalInput: input,
        recognizedWords: [],
        unrecognizedWords: words,
      };
    }

    // Parse modifiers from words before the noun
    const modifierWords = words.slice(0, nounIndex);
    const modifiers: Modifier[] = [];
    const recognizedWords: string[] = [words[nounIndex]];
    const unrecognizedWords: string[] = [];

    for (const word of modifierWords) {
      const modifierWord = this.findModifier(word);

      if (modifierWord) {
        modifiers.push(...modifierWord.modifiers);
        recognizedWords.push(word);

        if (this.config.debugMode) {
          console.log(`[ScribblenautsEngine] Found modifier: ${word} ->`, modifierWord.modifiers);
        }
      } else {
        unrecognizedWords.push(word);

        if (this.config.debugMode) {
          console.log(`[ScribblenautsEngine] Unrecognized word: ${word}`);
        }
      }
    }

    return {
      success: true,
      baseObject,
      modifiers,
      originalInput: input,
      recognizedWords,
      unrecognizedWords,
    };
  }

  /**
   * Find a base object by name or alias
   */
  private findBaseObject(word: string): BaseObject | undefined {
    const normalized = word.toLowerCase();

    // Search all categories
    for (const category of Object.values(this.objectDatabase)) {
      for (const obj of Object.values(category)) {
        // Check ID
        if (obj.id === normalized) {
          return obj;
        }

        // Check name
        if (obj.name.toLowerCase() === normalized) {
          return obj;
        }

        // Check aliases
        if (obj.aliases) {
          for (const alias of obj.aliases) {
            if (alias.toLowerCase() === normalized) {
              return obj;
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Find a modifier by word
   */
  private findModifier(word: string): ModifierWord | undefined {
    const normalized = word.toLowerCase();
    const firstLetter = normalized[0];

    const bucket = this.modifierDictionary[firstLetter];
    if (!bucket) {
      return undefined;
    }

    return bucket[normalized];
  }

  // ============================================================================
  // OBJECT SPAWNING
  // ============================================================================

  /**
   * Spawn an object in the world
   */
  spawnObject(request: SpawnRequest): SpawnedObject {
    // Check spawn limit
    if (this.spawnedObjects.size >= this.config.maxObjectsPerScene!) {
      throw new Error(
        `Cannot spawn object: Maximum of ${this.config.maxObjectsPerScene} objects reached`
      );
    }

    // Get base object
    const baseObject = this.findBaseObject(request.baseObjectId);
    if (!baseObject) {
      throw new Error(`Base object not found: ${request.baseObjectId}`);
    }

    // Create instance
    const instanceId = `obj_${this.nextInstanceId++}`;

    // Combine default modifiers with requested modifiers
    const allModifiers = [
      ...(baseObject.defaultModifiers || []),
      ...request.modifiers,
    ];

    // Compute final properties
    const computedProperties = this.computeProperties(baseObject, allModifiers);

    const spawnedObject: SpawnedObject = {
      instanceId,
      baseObjectId: baseObject.id,
      appliedModifiers: allModifiers,
      position: request.position,
      owner: request.owner,
      isDestroyed: false,
      timesInteractedWith: 0,
      createdAtTurn: this.currentTurn,
      computedProperties,
    };

    // Add to spawned objects
    this.spawnedObjects.set(instanceId, spawnedObject);

    console.log(`[ScribblenautsEngine] Spawned: ${baseObject.name} (${instanceId}) at ${request.position}`);

    if (this.config.debugMode) {
      console.log(`[ScribblenautsEngine] Applied modifiers:`, allModifiers);
      console.log(`[ScribblenautsEngine] Computed properties:`, computedProperties);
    }

    return spawnedObject;
  }

  /**
   * Compute final object properties from base + modifiers
   */
  private computeProperties(
    baseObject: BaseObject,
    modifiers: Modifier[]
  ): SpawnedObject['computedProperties'] {
    const props: SpawnedObject['computedProperties'] = {
      scale: 1.0,
      mass: 1.0,
      speed: 1.0,
      health: 100,
    };

    // Apply modifiers
    for (const modifier of modifiers) {
      switch (modifier.type) {
        case 'Color':
          props.color = modifier.value;
          break;

        case 'Scale':
          props.scale = modifier.value;
          break;

        case 'Mass':
          props.mass = modifier.value;
          break;

        case 'Speed':
          props.speed = modifier.value;
          break;

        case 'Health':
          props.health = modifier.value;
          break;

        // Add other property types as needed
      }
    }

    return props;
  }

  // ============================================================================
  // OBJECT MANAGEMENT
  // ============================================================================

  /**
   * Get a spawned object by ID
   */
  getObject(instanceId: string): SpawnedObject | undefined {
    return this.spawnedObjects.get(instanceId);
  }

  /**
   * Get all spawned objects
   */
  getAllObjects(): SpawnedObject[] {
    return Array.from(this.spawnedObjects.values());
  }

  /**
   * Get objects at a specific position
   */
  getObjectsAtPosition(position: string): SpawnedObject[] {
    return this.getAllObjects().filter((obj) => obj.position === position);
  }

  /**
   * Remove an object from the world
   */
  destroyObject(instanceId: string): boolean {
    const obj = this.spawnedObjects.get(instanceId);
    if (!obj) {
      return false;
    }

    obj.isDestroyed = true;
    this.spawnedObjects.delete(instanceId);

    console.log(`[ScribblenautsEngine] Destroyed object: ${instanceId}`);
    return true;
  }

  /**
   * Clear all spawned objects
   */
  clearAllObjects(): void {
    const count = this.spawnedObjects.size;
    this.spawnedObjects.clear();
    console.log(`[ScribblenautsEngine] Cleared ${count} objects`);
  }

  // ============================================================================
  // INTERACTIONS
  // ============================================================================

  /**
   * Interact with an object
   */
  interact(instanceId: string, interactionType: InteractionType): InteractionResult {
    const obj = this.spawnedObjects.get(instanceId);

    if (!obj) {
      return {
        success: false,
        message: 'Object not found.',
      };
    }

    if (obj.isDestroyed) {
      return {
        success: false,
        message: 'That object has been destroyed.',
      };
    }

    // Get base object for interactions
    const baseObject = this.findBaseObject(obj.baseObjectId);
    if (!baseObject) {
      return {
        success: false,
        message: 'Object definition not found.',
      };
    }

    // Check if interaction is defined
    const interactionMessage = baseObject.interactions?.[interactionType];

    if (interactionMessage) {
      obj.timesInteractedWith++;

      return {
        success: true,
        message: interactionMessage,
        stateChanges: {
          object: { timesInteractedWith: obj.timesInteractedWith },
        },
      };
    }

    return {
      success: false,
      message: `You can't ${interactionType} that.`,
    };
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Advance turn counter
   */
  advanceTurn(): void {
    this.currentTurn++;
  }

  /**
   * Get current turn
   */
  getCurrentTurn(): number {
    return this.currentTurn;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalModifiers: number;
    totalBaseObjects: number;
    spawnedObjects: number;
    currentTurn: number;
  } {
    const totalModifiers = Object.values(this.modifierDictionary).reduce(
      (sum, bucket) => sum + Object.keys(bucket).length,
      0
    );

    const totalBaseObjects = Object.values(this.objectDatabase).reduce(
      (sum, category) => sum + Object.keys(category).length,
      0
    );

    return {
      totalModifiers,
      totalBaseObjects,
      spawnedObjects: this.spawnedObjects.size,
      currentTurn: this.currentTurn,
    };
  }

  /**
   * Debug: Print all spawned objects
   */
  debugPrintObjects(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('SPAWNED OBJECTS');
    console.log('='.repeat(70));
    console.log(`Total: ${this.spawnedObjects.size}`);
    console.log('');

    for (const [id, obj] of this.spawnedObjects) {
      const baseObject = this.findBaseObject(obj.baseObjectId);
      console.log(`[${id}] ${baseObject?.name || obj.baseObjectId}`);
      console.log(`  Position: ${obj.position}`);
      console.log(`  Owner: ${obj.owner || 'None'}`);
      console.log(`  Modifiers: ${obj.appliedModifiers.length}`);
      console.log(`  Interactions: ${obj.timesInteractedWith}`);
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('');
  }
}
