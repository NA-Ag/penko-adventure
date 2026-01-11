/**
 * Scribblenauts System Type Definitions
 *
 * Inspired by the scrb-master project's object and modifier architecture.
 * This system allows players to spawn objects with adjective modifiers,
 * creating a dynamic, emergent gameplay experience.
 *
 * Architecture:
 * - Modifiers: Adjectives that change object properties (color, scale, physics, etc.)
 * - BaseObjects: Nouns that can be spawned in the world
 * - SpawnedObjects: Runtime instances of objects with applied modifiers
 */

// ============================================================================
// MODIFIERS (Adjectives)
// ============================================================================

/**
 * Base modifier type - represents a single property change
 */
export type Modifier =
  // Visual modifiers
  | { type: 'Color'; value: string }           // e.g., '#FF0000' for red
  | { type: 'Scale'; value: number }           // e.g., 2.5 for 2.5x size
  | { type: 'Opacity'; value: number }         // e.g., 0.5 for 50% transparent
  | { type: 'Roughness'; value: number }       // e.g., 0.8 for very rough surface
  | { type: 'Metallic'; value: number }        // e.g., 1.0 for fully metallic

  // Physics modifiers
  | { type: 'Mass'; value: number }            // e.g., 100 for 100kg
  | { type: 'Friction'; value: number }        // e.g., 0.1 for very slippery
  | { type: 'Bounciness'; value: number }      // e.g., 0.9 for very bouncy
  | { type: 'Gravity'; value: number }         // e.g., -1.0 for anti-gravity

  // Behavioral modifiers
  | { type: 'Speed'; value: number }           // e.g., 2.0 for double speed
  | { type: 'Health'; value: number }          // e.g., 100 for max health
  | { type: 'Temperature'; value: number }     // e.g., 100 for hot, -10 for cold

  // State modifiers (boolean properties)
  | { type: 'Flying'; value: boolean }         // Can fly
  | { type: 'Burning'; value: boolean }        // Is on fire
  | { type: 'Frozen'; value: boolean }         // Is frozen
  | { type: 'Invisible'; value: boolean }      // Cannot be seen
  | { type: 'Invincible'; value: boolean }     // Cannot be destroyed
  | { type: 'Friendly'; value: boolean }       // Allied to player
  | { type: 'Hostile'; value: boolean }        // Enemy to player
  | { type: 'Alive'; value: boolean }          // Has life/AI
  | { type: 'Dead'; value: boolean }           // Is dead/broken
  | { type: 'Locked'; value: boolean }         // Cannot be opened/used
  | { type: 'Unlocked'; value: boolean }       // Can be opened/used

  // Material modifiers
  | { type: 'Material'; value: MaterialType }

  // Custom text modifiers
  | { type: 'Custom'; name: string; value: any };

export type MaterialType =
  | 'wood' | 'metal' | 'glass' | 'stone' | 'fabric'
  | 'plastic' | 'rubber' | 'paper' | 'water' | 'fire';

/**
 * Represents a word that maps to one or more modifiers
 */
export interface ModifierWord {
  name: string;                   // The word itself (e.g., "red", "large", "flying")
  modifiers: Modifier[];          // The modifiers this word applies
  aliases?: string[];             // Alternative words (e.g., "big" for "large")
}

/**
 * Modifier dictionary - organized by first letter for fast lookup
 */
export interface ModifierDictionary {
  [firstLetter: string]: {
    [word: string]: ModifierWord;
  };
}

// ============================================================================
// BASE OBJECTS (Nouns)
// ============================================================================

/**
 * Object category for organization
 */
export type ObjectCategory =
  | 'vehicle'      // Cars, planes, boats
  | 'animal'       // Living creatures
  | 'furniture'    // Tables, chairs, beds
  | 'weapon'       // Swords, guns, tools
  | 'food'         // Edible items
  | 'container'    // Boxes, bags, chests
  | 'electronic'   // Computers, phones, TVs
  | 'nature'       // Trees, rocks, plants
  | 'character'    // NPCs, people
  | 'abstract'     // Concepts, effects
  | 'misc';        // Everything else

/**
 * Object properties define what the object can do
 */
export type ObjectProperty =
  // Interaction properties
  | 'pickupable'    // Can be picked up
  | 'throwable'     // Can be thrown
  | 'rideable'      // Can be ridden
  | 'drivable'      // Can be driven
  | 'edible'        // Can be eaten
  | 'drinkable'     // Can be drunk
  | 'wearable'      // Can be worn
  | 'openable'      // Can be opened
  | 'breakable'     // Can be broken
  | 'burnable'      // Can catch fire
  | 'floatable'     // Floats on water
  | 'sinkable'      // Sinks in water

  // State properties
  | 'heavy'         // Difficult to move
  | 'light'         // Easy to move
  | 'sharp'         // Can cut things
  | 'blunt'         // Cannot cut
  | 'hot'           // High temperature
  | 'cold'          // Low temperature
  | 'wet'           // Is wet
  | 'dry'           // Is dry
  | 'clean'         // Is clean
  | 'dirty'         // Is dirty

  // Behavioral properties
  | 'aggressive'    // Attacks on sight
  | 'passive'       // Does not attack
  | 'scared'        // Runs from player
  | 'curious'       // Approaches player
  | 'intelligent'   // Can solve problems
  | 'magical'       // Has magical properties
  | 'mechanical'    // Has moving parts
  | 'electronic'    // Uses electricity
  | 'living'        // Is alive
  | 'nonliving';    // Is not alive

/**
 * Represents a base object definition (a noun)
 */
export interface BaseObject {
  id: string;                       // Unique identifier (e.g., "car", "apple", "sword")
  name: string;                     // Display name (e.g., "Car", "Apple", "Sword")
  category: ObjectCategory;         // Object category
  description: string;              // Brief description

  // Visual representation
  icon?: string;                    // Emoji or icon character
  sprite?: string;                  // Path to sprite image
  model?: string;                   // Path to 3D model

  // Object properties
  properties: ObjectProperty[];     // What the object can do

  // Default modifiers (objects can have inherent properties)
  defaultModifiers?: Modifier[];

  // Interaction responses
  interactions?: {
    [action: string]: string;       // Action -> response text
  };

  // Synonyms for recognition
  aliases?: string[];               // Alternative names
}

/**
 * Object database - organized by category
 */
export interface ObjectDatabase {
  [category: string]: {
    [objectId: string]: BaseObject;
  };
}

// ============================================================================
// SPAWNED OBJECTS (Runtime Instances)
// ============================================================================

/**
 * Represents an object instance in the game world
 */
export interface SpawnedObject {
  instanceId: string;               // Unique instance ID
  baseObjectId: string;             // Reference to BaseObject
  appliedModifiers: Modifier[];     // All modifiers applied to this instance

  // World state
  position: string;                 // Location in world (e.g., "living_room")
  owner?: 'grace' | 'trip' | 'player'; // Who owns/controls this object

  // Runtime state
  isDestroyed: boolean;
  timesInteractedWith: number;
  createdAtTurn: number;

  // Computed properties (derived from base + modifiers)
  computedProperties: {
    color?: string;
    scale: number;
    mass: number;
    speed: number;
    health: number;
    // ... other computed values
  };
}

/**
 * Object spawn request
 */
export interface SpawnRequest {
  baseObjectId: string;
  modifiers: Modifier[];
  position: string;
  owner?: 'grace' | 'trip' | 'player';
}

/**
 * Result of parsing player input for object spawning
 */
export interface ParsedObjectInput {
  success: boolean;
  baseObject?: BaseObject;
  modifiers: Modifier[];
  originalInput: string;
  recognizedWords: string[];
  unrecognizedWords: string[];
}

// ============================================================================
// INTERACTION SYSTEM
// ============================================================================

/**
 * Types of interactions players can perform with objects
 */
export type InteractionType =
  | 'pickup' | 'drop' | 'throw' | 'break' | 'open' | 'close'
  | 'eat' | 'drink' | 'wear' | 'remove' | 'use' | 'examine'
  | 'give' | 'take' | 'ride' | 'drive';

/**
 * Result of an interaction attempt
 */
export interface InteractionResult {
  success: boolean;
  message: string;
  stateChanges?: {
    object?: Partial<SpawnedObject>;
    world?: Record<string, any>;
  };
}

// ============================================================================
// SCRIBBLENAUTS ENGINE CONFIGURATION
// ============================================================================

export interface ScribblenautsConfig {
  maxObjectsPerScene?: number;      // Default: 20
  allowCustomModifiers?: boolean;   // Default: true
  debugMode?: boolean;              // Default: false
}
