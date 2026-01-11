/**
 * Scenario Type Definitions
 *
 * Legacy scenario system types extracted from CommunityEngine V1.
 * These are maintained for backward compatibility with older content packs
 * that use the choice-based system instead of the newer ContentPack format.
 */

import { Language, SceneData, InventoryItem } from '../types';

/**
 * Scenario Node - Individual scene in a choice-based adventure
 *
 * @deprecated Use LocationNode from ContentPack.ts for new content.
 * This interface is maintained for backward compatibility only.
 */
export interface ScenarioNode {
  id: string;
  text: string; // In target language
  translation: string; // In native language

  // Legacy choice-based system (backward compatible)
  choices?: {
    text: string; // Choice in target language
    nextNodeId: string | null; // null = game over/end
    requiredVocab?: string[]; // Must know these words
  }[];

  // New object-based system
  objects?: string[]; // Object IDs available in this node
  allowFreeInput?: boolean; // Enable text input instead of choices

  vocabulary: string[]; // New words introduced
  grammar?: string; // Grammar point
  health?: number; // Health change (+/-)
  items?: InventoryItem[]; // Items to add/remove
  sceneData?: SceneData; // For visualizer
}

/**
 * Community Scenario - Complete adventure scenario
 *
 * @deprecated Use ContentPack from ContentPack.ts for new content.
 * This interface is maintained for backward compatibility only.
 */
export interface CommunityScenario {
  id: string;
  title: string;
  author: string;
  targetLanguage: Language;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  startNodeId: string;
  nodes: Record<string, ScenarioNode>;
}
