/**
 * Content Pack Service
 *
 * Handles loading, validation, and management of community-created content packs.
 * Content packs are JSON files following the schema defined in docs/CONTENT_PACK_SCHEMA.md
 */

import { Language, NarrativeGenre, Biome, TimeOfDay } from '../types';

// ==================== TYPES ====================

export interface ContentPack {
  metadata: ContentPackMetadata;
  world: World;
  events: GameEvent[];
  statistics: Record<string, Statistic>;
  vocabulary: Vocabulary;
}

export interface ContentPackMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  version: string;
  created: string;
  language: Language;
  genre: NarrativeGenre;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags?: string[];
  thumbnail?: string;
  contentRating?: 'everyone' | 'teen' | 'mature';
  dependencies?: string[];
}

export interface World {
  startLocation: string;
  locations: Location[];
  entities: Entity[];
  items: Item[];
  quests: Quest[];
}

export interface Location {
  id: string;
  name: string;
  biome: Biome;
  timeOfDay: TimeOfDay;
  description: string;
  features: string[];
  entities: string[];
  items: string[];
  connections: Partial<Record<Direction, string>>;
  metadata: {
    visited: boolean;
    discoverable: boolean;
  };
}

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  behavior: EntityBehavior;
  description: string;
  dialogue: DialogueNode[];
  quests: string[];
  shop: Shop | null;
}

export type EntityType = 'HUMANOID' | 'BEAST' | 'UNDEAD' | 'SPIRIT' | 'CONSTRUCT';
export type EntityBehavior = 'FRIENDLY' | 'PASSIVE' | 'AGGRESSIVE';

export interface DialogueNode {
  id: string;
  condition: string;
  text: string;
  responses: DialogueResponse[];
}

export interface DialogueResponse {
  text: string;
  effect: string;
}

export interface Shop {
  currency: string;
  items: ShopItem[];
}

export interface ShopItem {
  itemId: string;
  price: number;
  stock: number | null; // null = infinite
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  properties: Record<string, any>;
  stackable: boolean;
  questItem: boolean;
}

export type ItemType = 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'QUEST' | 'MISC';

export interface Quest {
  id: string;
  title: string;
  description: string;
  giver: string;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  state: QuestState;
}

export type QuestState = 'available' | 'active' | 'completed' | 'failed';

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  target: string;
  count?: number;
  completed: boolean;
}

export type ObjectiveType = 'VISIT' | 'DEFEAT' | 'COLLECT' | 'SPEAK' | 'USE';

export interface QuestRewards {
  experience?: number;
  items?: string[];
  statistics?: Record<string, number>;
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  trigger: EventTrigger;
  actions: EventAction[];
  priority: number;
  repeatable: boolean;
  cooldown: number;
}

export interface EventTrigger {
  type: TriggerType;
  location?: string;
  conditions?: EventCondition[];
  // QUEST trigger
  questId?: string;
  // STATISTIC trigger
  statistic?: string;
  threshold?: number;
  // TIME trigger
  timeOfDay?: string;
  daysPassed?: number;
  // TURN_COUNT trigger
  turnCount?: number;
  // HEALTH trigger
  healthThreshold?: number;
  healthOperator?: 'above' | 'below';
  // INVENTORY trigger
  requiredItem?: string;
  inventoryCount?: number;
}

export type TriggerType =
  | 'LOCATION'      // Player enters/is in location
  | 'COMBAT'        // Combat starts/ends
  | 'ITEM'          // Item picked up/used
  | 'DIALOGUE'      // Dialogue completed
  | 'QUEST'         // Quest state changes
  | 'STATISTIC'     // Statistic reaches threshold
  | 'TIME'          // Time of day or days passed
  | 'TURN_COUNT'    // Turn number reached
  | 'HEALTH'        // Health above/below threshold
  | 'INVENTORY';    // Inventory conditions met

export interface EventCondition {
  stat: string;
  operator: ConditionOperator;
  value: any;
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'contains'
  | 'not_contains';

export interface EventAction {
  type: ActionType;
  [key: string]: any;
}

export type ActionType =
  // Entity actions
  | 'SPAWN_ENTITY'        // Spawn entity at location
  | 'REMOVE_ENTITY'       // Remove entity from location
  // Message actions
  | 'SHOW_MESSAGE'        // Display message to player
  // Statistic actions
  | 'MODIFY_STAT'         // Add/subtract from statistic
  | 'SET_STAT'            // Set statistic to exact value
  // Item actions
  | 'ADD_ITEM'            // Add item to inventory
  | 'REMOVE_ITEM'         // Remove item from inventory
  // Location actions
  | 'UNLOCK_LOCATION'     // Make location accessible
  | 'TELEPORT_PLAYER'     // Move player to location instantly
  // Quest actions
  | 'START_QUEST'         // Start a quest
  | 'COMPLETE_QUEST'      // Complete a quest
  | 'FAIL_QUEST'          // Fail a quest
  // Visual actions
  | 'PLAY_ANIMATION'      // Trigger animation
  | 'CHANGE_BIOME'        // Change location biome
  | 'CHANGE_TIME'         // Change time of day
  // Player actions
  | 'HEAL_PLAYER'         // Restore player health
  | 'DAMAGE_PLAYER'       // Damage player
  // Event control
  | 'CHAIN_EVENT'         // Trigger another event
  | 'WAIT';               // Advance time/turns

export interface Statistic {
  displayName: string;
  startValue: number | string;
  targetValue: number | string | null;
  unit: string | null;
  visible: boolean;
  category: string;
}

export interface Vocabulary {
  verbs: Record<string, VerbEntry>;
  nouns: Record<string, NounEntry>;
  adjectives: Record<string, AdjectiveEntry>;
}

export interface VerbEntry {
  intent: Intent;
  synonyms: string[];
}

export type Intent = 'MOVE' | 'ATTACK' | 'LOOT' | 'LOOK' | 'SPEAK';

export interface NounEntry {
  gender: Gender;
  category: string;
}

export type Gender = 'M' | 'F' | 'N';

export interface AdjectiveEntry {
  feminine?: string;
  plural?: string;
  category: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
}

// ==================== CONSTANTS ====================

const SUPPORTED_LANGUAGES: Language[] = [
  Language.ENGLISH,
  Language.SPANISH,
  Language.FRENCH,
  Language.GERMAN,
  Language.ITALIAN,
  Language.JAPANESE,
  Language.MANDARIN,
  Language.RUSSIAN,
  Language.PORTUGUESE,
  Language.UKRAINIAN,
  Language.POLISH,
  Language.CZECH,
];

const SUPPORTED_GENRES: NarrativeGenre[] = [
  'fantasy',
  'scifi',
  'mystery',
  'horror',
  'western',
  'cyberpunk',
];

const SIZE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_LOCATIONS: 100,
  MAX_ENTITIES: 200,
  MAX_ITEMS: 200,
  MAX_EVENTS: 500,
  MAX_STATISTICS: 50,
  MAX_VOCABULARY_WORDS: 1000,
  MAX_QUEST_OBJECTIVES: 10,
  MAX_DIALOGUE_RESPONSES: 5,
};

// ==================== LOADING ====================

/**
 * Load a content pack from a JSON file
 */
export async function loadContentPack(filePathOrUrl: string): Promise<ContentPack> {
  try {
    let jsonData: string;

    // Check if it's a URL or local file
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      // Fetch from URL
      const response = await fetch(filePathOrUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch content pack: ${response.statusText}`);
      }
      jsonData = await response.text();
    } else {
      // Load from local file (browser file input)
      const response = await fetch(filePathOrUrl);
      jsonData = await response.text();
    }

    // Parse JSON
    const contentPack = JSON.parse(jsonData) as ContentPack;

    return contentPack;
  } catch (error) {
    throw new Error(`Failed to load content pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load a content pack from uploaded File object
 */
export async function loadContentPackFromFile(file: File): Promise<ContentPack> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const contentPack = JSON.parse(jsonData) as ContentPack;
        resolve(contentPack);
      } catch (error) {
        reject(new Error(`Failed to parse content pack: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

// ==================== VALIDATION ====================

/**
 * Validate a content pack against the schema
 */
export function validateContentPack(contentPack: ContentPack): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate metadata
  validateMetadata(contentPack.metadata, errors, warnings);

  // Validate world
  validateWorld(contentPack.world, errors, warnings);

  // Validate events
  validateEvents(contentPack.events, contentPack.world, contentPack.statistics, errors, warnings);

  // Validate statistics
  validateStatistics(contentPack.statistics, errors, warnings);

  // Validate vocabulary
  validateVocabulary(contentPack.vocabulary, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateMetadata(
  metadata: ContentPackMetadata,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required fields
  if (!metadata.id) {
    errors.push({ path: 'metadata.id', message: 'ID is required', code: 'REQUIRED_FIELD' });
  } else {
    // ID format validation
    const idPattern = /^[a-z]+_[a-z_]+_[a-z]{2}_\d{3}$/;
    if (!idPattern.test(metadata.id)) {
      warnings.push({
        path: 'metadata.id',
        message: 'ID should follow format: {genre}_{theme}_{lang}_{number}',
        code: 'FORMAT_WARNING',
      });
    }
  }

  if (!metadata.title) {
    errors.push({ path: 'metadata.title', message: 'Title is required', code: 'REQUIRED_FIELD' });
  }

  if (!metadata.language) {
    errors.push({ path: 'metadata.language', message: 'Language is required', code: 'REQUIRED_FIELD' });
  } else if (!SUPPORTED_LANGUAGES.includes(metadata.language)) {
    errors.push({
      path: 'metadata.language',
      message: `Unsupported language: ${metadata.language}`,
      code: 'INVALID_VALUE',
    });
  }

  if (!metadata.genre) {
    errors.push({ path: 'metadata.genre', message: 'Genre is required', code: 'REQUIRED_FIELD' });
  } else if (!SUPPORTED_GENRES.includes(metadata.genre)) {
    errors.push({
      path: 'metadata.genre',
      message: `Unsupported genre: ${metadata.genre}`,
      code: 'INVALID_VALUE',
    });
  }

  // Version format
  if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
    warnings.push({
      path: 'metadata.version',
      message: 'Version should follow semver format (e.g., 1.0.0)',
      code: 'FORMAT_WARNING',
    });
  }

  // Estimated time should be reasonable
  if (metadata.estimatedTime && (metadata.estimatedTime < 1 || metadata.estimatedTime > 600)) {
    warnings.push({
      path: 'metadata.estimatedTime',
      message: 'Estimated time should be between 1 and 600 minutes',
      code: 'VALUE_WARNING',
    });
  }
}

function validateWorld(world: World, errors: ValidationError[], warnings: ValidationWarning[]): void {
  // World must have at least one location
  if (!world.locations || world.locations.length === 0) {
    errors.push({ path: 'world.locations', message: 'At least one location is required', code: 'REQUIRED_FIELD' });
    return;
  }

  // Size limits
  if (world.locations.length > SIZE_LIMITS.MAX_LOCATIONS) {
    errors.push({
      path: 'world.locations',
      message: `Too many locations (max: ${SIZE_LIMITS.MAX_LOCATIONS})`,
      code: 'SIZE_LIMIT',
    });
  }

  if (world.entities.length > SIZE_LIMITS.MAX_ENTITIES) {
    errors.push({
      path: 'world.entities',
      message: `Too many entities (max: ${SIZE_LIMITS.MAX_ENTITIES})`,
      code: 'SIZE_LIMIT',
    });
  }

  if (world.items.length > SIZE_LIMITS.MAX_ITEMS) {
    errors.push({
      path: 'world.items',
      message: `Too many items (max: ${SIZE_LIMITS.MAX_ITEMS})`,
      code: 'SIZE_LIMIT',
    });
  }

  // Start location must exist
  const locationIds = new Set(world.locations.map((l) => l.id));
  if (!locationIds.has(world.startLocation)) {
    errors.push({
      path: 'world.startLocation',
      message: `Start location '${world.startLocation}' does not exist`,
      code: 'REFERENCE_ERROR',
    });
  }

  // Validate location connections
  world.locations.forEach((location, index) => {
    Object.entries(location.connections).forEach(([direction, targetId]) => {
      if (!locationIds.has(targetId)) {
        errors.push({
          path: `world.locations[${index}].connections.${direction}`,
          message: `Connected location '${targetId}' does not exist`,
          code: 'REFERENCE_ERROR',
        });
      }
    });

    // Validate entity references
    const entityIds = new Set(world.entities.map((e) => e.id));
    location.entities.forEach((entityId) => {
      if (!entityIds.has(entityId)) {
        warnings.push({
          path: `world.locations[${index}].entities`,
          message: `Referenced entity '${entityId}' does not exist`,
          code: 'REFERENCE_WARNING',
        });
      }
    });

    // Validate item references
    const itemIds = new Set(world.items.map((i) => i.id));
    location.items.forEach((itemId) => {
      if (!itemIds.has(itemId)) {
        warnings.push({
          path: `world.locations[${index}].items`,
          message: `Referenced item '${itemId}' does not exist`,
          code: 'REFERENCE_WARNING',
        });
      }
    });
  });

  // Validate quests
  world.quests.forEach((quest, index) => {
    if (quest.objectives.length > SIZE_LIMITS.MAX_QUEST_OBJECTIVES) {
      warnings.push({
        path: `world.quests[${index}].objectives`,
        message: `Too many objectives (max: ${SIZE_LIMITS.MAX_QUEST_OBJECTIVES})`,
        code: 'SIZE_WARNING',
      });
    }
  });
}

function validateEvents(
  events: GameEvent[],
  world: World,
  statistics: Record<string, Statistic>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (events.length > SIZE_LIMITS.MAX_EVENTS) {
    errors.push({
      path: 'events',
      message: `Too many events (max: ${SIZE_LIMITS.MAX_EVENTS})`,
      code: 'SIZE_LIMIT',
    });
  }

  const locationIds = new Set(world.locations.map((l) => l.id));
  const entityIds = new Set(world.entities.map((e) => e.id));
  const statIds = new Set(Object.keys(statistics));

  events.forEach((event, index) => {
    // Validate location triggers
    if (event.trigger.type === 'LOCATION' && event.trigger.location) {
      if (!locationIds.has(event.trigger.location)) {
        errors.push({
          path: `events[${index}].trigger.location`,
          message: `Referenced location '${event.trigger.location}' does not exist`,
          code: 'REFERENCE_ERROR',
        });
      }
    }

    // Validate conditions reference valid statistics
    event.trigger.conditions?.forEach((condition, condIndex) => {
      if (!statIds.has(condition.stat)) {
        warnings.push({
          path: `events[${index}].trigger.conditions[${condIndex}].stat`,
          message: `Referenced statistic '${condition.stat}' is not defined`,
          code: 'REFERENCE_WARNING',
        });
      }
    });

    // Validate action entity references
    event.actions.forEach((action, actionIndex) => {
      if ((action.type === 'SPAWN_ENTITY' || action.type === 'REMOVE_ENTITY') && action.entity) {
        if (!entityIds.has(action.entity)) {
          warnings.push({
            path: `events[${index}].actions[${actionIndex}].entity`,
            message: `Referenced entity '${action.entity}' does not exist`,
            code: 'REFERENCE_WARNING',
          });
        }
      }
    });
  });
}

function validateStatistics(
  statistics: Record<string, Statistic>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const statCount = Object.keys(statistics).length;
  if (statCount > SIZE_LIMITS.MAX_STATISTICS) {
    errors.push({
      path: 'statistics',
      message: `Too many statistics (max: ${SIZE_LIMITS.MAX_STATISTICS})`,
      code: 'SIZE_LIMIT',
    });
  }

  Object.entries(statistics).forEach(([key, stat]) => {
    // Numeric statistics should have valid targets
    if (typeof stat.startValue === 'number' && typeof stat.targetValue === 'number') {
      if (stat.targetValue <= stat.startValue) {
        warnings.push({
          path: `statistics.${key}.targetValue`,
          message: 'Target value should be greater than start value',
          code: 'VALUE_WARNING',
        });
      }
    }
  });
}

function validateVocabulary(
  vocabulary: Vocabulary,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const totalWords =
    Object.keys(vocabulary.verbs).length +
    Object.keys(vocabulary.nouns).length +
    Object.keys(vocabulary.adjectives).length;

  if (totalWords > SIZE_LIMITS.MAX_VOCABULARY_WORDS) {
    warnings.push({
      path: 'vocabulary',
      message: `Too many vocabulary words (max: ${SIZE_LIMITS.MAX_VOCABULARY_WORDS})`,
      code: 'SIZE_WARNING',
    });
  }

  // Validate verb intents
  const validIntents: Intent[] = ['MOVE', 'ATTACK', 'LOOT', 'LOOK', 'SPEAK'];
  Object.entries(vocabulary.verbs).forEach(([word, entry]) => {
    if (!validIntents.includes(entry.intent)) {
      warnings.push({
        path: `vocabulary.verbs.${word}.intent`,
        message: `Invalid intent '${entry.intent}'`,
        code: 'INVALID_VALUE',
      });
    }
  });

  // Validate noun genders
  const validGenders: Gender[] = ['M', 'F', 'N'];
  Object.entries(vocabulary.nouns).forEach(([word, entry]) => {
    if (!validGenders.includes(entry.gender)) {
      warnings.push({
        path: `vocabulary.nouns.${word}.gender`,
        message: `Invalid gender '${entry.gender}'`,
        code: 'INVALID_VALUE',
      });
    }
  });
}

// ==================== EXPORT ====================

/**
 * Export a content pack to JSON string
 */
export function exportContentPack(contentPack: ContentPack, pretty: boolean = true): string {
  return JSON.stringify(contentPack, null, pretty ? 2 : 0);
}

/**
 * Download a content pack as JSON file
 */
export function downloadContentPack(contentPack: ContentPack): void {
  const json = exportContentPack(contentPack, true);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${contentPack.metadata.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== UTILITIES ====================

/**
 * Create a blank content pack template
 */
export function createBlankContentPack(
  language: Language,
  genre: NarrativeGenre,
  author: string
): ContentPack {
  const id = `${genre}_untitled_${language.toLowerCase().slice(0, 2)}_001`;

  return {
    metadata: {
      id,
      title: 'Untitled Adventure',
      description: 'A new content pack',
      author,
      version: '1.0.0',
      created: new Date().toISOString().split('T')[0],
      language,
      genre,
      difficulty: 'beginner',
      estimatedTime: 15,
      tags: [],
      contentRating: 'everyone',
    },
    world: {
      startLocation: 'start',
      locations: [
        {
          id: 'start',
          name: 'Starting Location',
          biome: 'forest',
          timeOfDay: 'day',
          description: 'The beginning of your adventure.',
          features: [],
          entities: [],
          items: [],
          connections: {},
          metadata: {
            visited: false,
            discoverable: true,
          },
        },
      ],
      entities: [],
      items: [],
      quests: [],
    },
    events: [],
    statistics: {
      words_learned: {
        displayName: 'Words Learned',
        startValue: 0,
        targetValue: 50,
        unit: 'words',
        visible: true,
        category: 'vocabulary',
      },
    },
    vocabulary: {
      verbs: {},
      nouns: {},
      adjectives: {},
    },
  };
}
