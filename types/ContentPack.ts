/**
 * Content Pack Type Definitions
 *
 * Defines the structure for modular, genre-specific content packs
 * that can be loaded dynamically by the Community Engine.
 *
 * Design Philosophy:
 * - Content packs are self-contained worlds
 * - Each pack defines its own objects, events, templates, and vocabulary
 * - Same engine can run Fantasy, Cyberpunk, Modern, or any other genre
 * - Community can create entirely new genres without code changes
 */

import { GameObject, ObjectIntent } from './game.types';
import { LearningEvent } from './game.types';
import type { Language } from '../types';

/**
 * Content Pack Metadata
 */
export interface ContentPackMetadata {
  // Identification
  id: string;                    // Unique identifier (e.g., "official_fantasy_dungeon")
  version: string;               // Semantic version (e.g., "1.0.0")

  // Display Info
  title: Record<Language, string>;        // Pack name in all languages
  description: Record<Language, string>;  // Pack description
  author: string;                         // Creator name

  // Classification
  genre: ContentPackGenre;       // Genre category
  supportedLanguage: Language;   // Primary language being taught
  difficulty: DifficultyLevel;   // CEFR-based difficulty

  // Gameplay
  estimatedDuration: string;     // e.g., "30-45 minutes"
  tags: string[];                // Search tags (e.g., ["magic", "dungeons", "quests"])

  // Submission tracking (for community packs)
  submittedAt?: string;          // ISO timestamp
  submitterEmail?: string;       // Contact info
  status?: 'pending_review' | 'approved' | 'rejected';
}

/**
 * Content Pack Genres
 */
export type ContentPackGenre =
  | 'fantasy'      // Swords, magic, dungeons, dragons
  | 'scifi'        // Space, tech, aliens, cybernetics
  | 'cyberpunk'    // Hacking, corps, dystopia, augments
  | 'mystery'      // Detective work, clues, investigation
  | 'horror'       // Suspense, fear, survival
  | 'adventure'    // Exploration, discovery, travel
  | 'historical'   // Real-world history, periods
  | 'contemporary' // Modern everyday life
  | 'comedy'       // Humor, absurdity, fun
  | 'educational'  // Teaching-focused, explicit learning
  | 'custom';      // User-defined genre

/**
 * Difficulty Levels (CEFR-aligned)
 */
export type DifficultyLevel =
  | 'beginner'      // A1-A2
  | 'intermediate'  // B1-B2
  | 'advanced';     // C1-C2

/**
 * Complete Content Pack Structure
 */
export interface ContentPack {
  metadata: ContentPackMetadata;
  world: WorldDefinition;
}

/**
 * World Definition
 * Contains all the game content for a pack
 */
export interface WorldDefinition {
  // Starting point
  startingLocationId: string;    // ID of the first location

  // Core content
  locations: LocationNode[];     // All locations in the world
  objects?: GameObject[];        // All interactive objects
  npcs?: NPCDefinition[];        // All non-player characters
  items?: ItemDefinition[];      // Inventory items (deprecated - use objects)

  // Learning content
  events?: LearningEvent[];      // Oracle learning events for this pack
  vocabulary?: VocabularySet;    // Pack-specific vocabulary

  // Narrative
  templates?: ResponseTemplateSet;  // Genre-specific response templates
}

/**
 * Location Node (Scenario Node)
 * Represents a single scene/location in the world
 */
export interface LocationNode {
  id: string;                    // Unique location ID
  name?: string | Record<Language, string>;  // Location name (can be string or localized)

  // Narrative
  text?: string;                 // Scene description (target language)
  translation?: string;          // Translation (English)

  // Interaction modes
  choices?: Choice[];            // Optional: for guided/choice-based gameplay
  objects?: string[];            // Optional: IDs of objects present in this location
  npcs?: string[];               // Optional: IDs of NPCs present here
  allowFreeInput?: boolean;      // Allow free-form text input (default: true if objects present)

  // Learning
  vocabulary?: string[];         // Key vocabulary for this scene
  grammar?: string[];            // Grammar points featured

  // Navigation
  exits?: Exit[];                // Connections to other locations
  requiredItems?: string[];      // Items needed to enter (e.g., key for locked room)
}

/**
 * Choice (for choice-based gameplay)
 */
export interface Choice {
  id: string;
  text: string;                  // Choice text (target language)
  translation: string;           // Translation
  nextNodeId?: string;           // Where this choice leads
  requires?: string[];           // Required items/conditions
}

/**
 * Exit (navigation between locations)
 */
export interface Exit {
  direction: string;             // "north", "south", "door", etc.
  locationId: string;            // Where it leads
  isLocked?: boolean;            // Requires unlocking
  requiredItem?: string;         // Item needed to unlock
  description?: string;          // Exit description
}

/**
 * TIER 10: NPC Persona - Persistent internal state and memory
 * Inspired by The Sims (relationship scores), Oblivion (goals), Crusader Kings (traits)
 */
export interface NPCPersona {
  // Relationship with player (-100 to +100)
  relationshipWithPlayer: number;  // -100: hostile, 0: neutral, +100: best friends

  // Current emotional state
  mood: NPCMood;

  // Active goals the NPC is pursuing
  goals: NPCGoal[];

  // Facts the NPC knows about the world
  knowledge: Set<string>;          // e.g., "fact:dragon_slain", "fact:player_helped_guard"

  // Interaction history with player
  lastInteractionTurn?: number;    // When they last spoke to player
  timesSpokenTo: number;           // How many times player has talked to them

  // Memory of specific events
  memorableEvents: NPCMemory[];    // Things that significantly impacted their opinion
}

/**
 * NPC Mood states
 */
export type NPCMood =
  | 'happy'       // Content, friendly
  | 'neutral'     // Default state
  | 'sad'         // Melancholy, withdrawn
  | 'angry'       // Hostile, confrontational
  | 'fearful'     // Scared, cautious
  | 'excited'     // Enthusiastic, energetic
  | 'suspicious'; // Distrustful, wary

/**
 * NPC Goal - Something the NPC is trying to accomplish
 */
export interface NPCGoal {
  id: string;                      // Unique goal ID
  type: NPCGoalType;
  description: string;             // What they're trying to do
  priority: number;                // 1-10, higher = more important
  targetObjectId?: string;         // If goal involves an object
  targetLocationId?: string;       // If goal involves going somewhere
  targetNPCId?: string;            // If goal involves another NPC
  progress: number;                // 0-100, how close they are
  completionCondition?: string;    // What makes this goal complete
}

/**
 * Types of NPC goals
 */
export type NPCGoalType =
  | 'find_object'      // Looking for a specific item
  | 'talk_to_npc'      // Need to speak with someone
  | 'go_to_location'   // Want to travel somewhere
  | 'acquire_item'     // Want to obtain something from player
  | 'teach_player'     // Want to teach player something
  | 'learn_fact'       // Seeking information
  | 'help_player'      // Altruistic goal to assist
  | 'protect_object'   // Guard something
  | 'revenge';         // Get back at someone

/**
 * NPC Memory - Memorable events that shape opinion
 */
export interface NPCMemory {
  turn: number;                    // When it happened
  event: string;                   // What happened
  relationshipImpact: number;      // How it affected their opinion (-50 to +50)
  description: Record<Language, string>; // Localized description
}

/**
 * NPC Definition
 */
export interface NPCDefinition {
  id: string;                    // Unique NPC ID

  // Identity
  name: Record<Language, string>;        // NPC name
  description: Record<Language, string>; // Physical description

  // Behavior
  dialogue?: DialogueTree;       // Conversation system
  questGiver?: boolean;          // Can give quests
  merchant?: boolean;            // Can buy/sell items

  // Appearance
  currentLocation?: string;      // Where NPC is currently

  // AI behavior (future)
  personality?: NPCPersonality;

  // TIER 10: Persona System - Persistent NPC state
  persona?: NPCPersona;          // Internal state, memories, goals
}

/**
 * Dialogue Tree
 */
export interface DialogueTree {
  greeting: Record<Language, string>;    // Initial greeting
  topics?: DialogueTopic[];              // Conversation topics
  farewell?: Record<Language, string>;   // Goodbye message
}

/**
 * Dialogue Topic
 */
export interface DialogueTopic {
  id: string;
  trigger: string[];             // Keywords that trigger this topic
  response: Record<Language, string>;    // NPC's response
  unlocks?: string[];            // Topics/quests this unlocks
}

/**
 * NPC Personality (for dynamic responses)
 */
export interface NPCPersonality {
  friendliness: number;          // 0-10
  helpfulness: number;           // 0-10
  verbosity: number;             // 0-10 (how much they talk)
  traits: string[];              // e.g., ["grumpy", "wise", "secretive"]
}

/**
 * Item Definition (inventory items)
 */
export interface ItemDefinition {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  canBeHeld: boolean;
  weight?: number;
  uses?: ItemUse[];              // What you can do with this item
}

/**
 * Item Use
 */
export interface ItemUse {
  action: ObjectIntent;          // e.g., "USE", "DRINK", "READ"
  targetId?: string;             // What to use it on (optional)
  result: string;                // What happens
}

/**
 * Vocabulary Set
 * Pack-specific vocabulary organized by category
 *
 * NEW: Intent-based vocabulary structure (Phase 3.2)
 * Vocabulary is now organized by language and abstract intent,
 * making the content pack the single source of truth for what
 * words/phrases are understood in each language.
 */
export interface VocabularySet {
  // Legacy format (deprecated)
  nouns?: VocabularyCategory;
  verbs?: VocabularyCategory;
  adjectives?: VocabularyCategory;
  phrases?: VocabularyCategory;

  // NEW: Intent-based format (recommended)
  intents?: IntentVocabularySet;
}

/**
 * Intent-based vocabulary organized by language
 *
 * Example structure:
 * {
 *   "fr": {
 *     "LOOK_AROUND": ["regarder autour", "examiner la pièce", "observer"],
 *     "TAKE": ["prendre", "ramasser", "saisir"],
 *     "OPEN": ["ouvrir", "déverrouiller"]
 *   },
 *   "es": {
 *     "LOOK_AROUND": ["mirar alrededor", "examinar la habitación"],
 *     "TAKE": ["tomar", "coger", "agarrar"]
 *   }
 * }
 */
export interface IntentVocabularySet {
  [languageCode: string]: IntentPhraseMap;
}

/**
 * Maps abstract game intents to language-specific phrases
 */
export interface IntentPhraseMap {
  [intent: string]: string[];  // Each intent maps to array of recognized phrases
}

/**
 * Vocabulary Category (legacy format)
 */
export interface VocabularyCategory {
  [word: string]: VocabularyEntry;
}

/**
 * Vocabulary Entry (legacy format)
 */
export interface VocabularyEntry {
  translations: Record<Language, string>;  // Word in all languages
  difficulty: number;                      // 1-10 difficulty rating
  context: string;                         // Where/how it's used in this pack
}

/**
 * Response Template Set
 * Genre-specific templates for narrative generation
 */
export interface ResponseTemplateSet {
  success: TemplateGroup;        // Successful action templates
  failure: TemplateGroup;        // Failed action templates
  discovery: TemplateGroup;      // Finding something new
  combat?: TemplateGroup;        // Combat-related (if applicable)
  social?: TemplateGroup;        // NPC interaction (if applicable)
}

/**
 * Template Group
 */
export interface TemplateGroup {
  [actionType: string]: string[];  // e.g., "EXAMINE": ["You look at [object]...", ...]
}

/**
 * Content Pack Index Entry
 * Used for listing/browsing available packs
 */
export interface ContentPackIndexEntry {
  id: string;
  title: Record<Language, string>;
  author: string;
  genre: ContentPackGenre;
  difficulty: DifficultyLevel;
  supportedLanguage: Language;
  description: Record<Language, string>;
  version: string;
  filePath: string;              // Path to the JSON file
  submittedAt?: string;
  tags: string[];

  // Community features (Phase 7B)
  rating?: number;               // Average rating (0-5)
  ratingCount?: number;          // Number of ratings
  downloadCount?: number;        // Number of downloads
  featured?: boolean;            // Curated/featured pack
}

/**
 * Content Pack Index
 * Master list of all available content packs
 */
export interface ContentPackIndex {
  lastUpdated: string;           // ISO timestamp
  totalPacks: number;
  contentPacks: ContentPackIndexEntry[];
}
