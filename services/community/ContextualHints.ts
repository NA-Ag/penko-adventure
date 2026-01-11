/**
 * TIER 19: Contextual Hints System
 *
 * Provides intelligent, context-aware suggestions to help players
 * understand what actions are possible in their current situation.
 *
 * Like AI assistants, this system analyzes the game state and offers
 * proactive guidance without being asked.
 */

import type { Language, NarrativeGenre } from '../../types';
import type { ObjectIntent } from './ObjectSystem';

export interface ContextualHint {
  object: string;           // Object name
  suggestedActions: string[];  // What you can do with it
  priority: number;         // 0-1, how important this hint is
  reason: string;           // Why this is suggested
}

/**
 * Generate contextual hints based on available objects and game state
 */
export class ContextualHintsGenerator {
  private language: Language;
  private genre: NarrativeGenre;

  constructor(language: Language, genre: NarrativeGenre) {
    this.language = language;
    this.genre = genre;
  }

  /**
   * Generate helpful hints for the current game state
   *
   * This analyzes what objects are available and suggests meaningful interactions
   * based on genre conventions and object types.
   */
  generateHints(
    availableObjects: Array<{
      id: string;
      name?: Record<Language, string>;
      allowedActions?: ObjectIntent[];
      properties?: Record<string, any>;
    }>,
    playerInventory: string[],
    currentLocationDescription?: string
  ): ContextualHint[] {
    const hints: ContextualHint[] = [];

    // Analyze NPCs - highest priority for interaction
    for (const obj of availableObjects) {
      if (this.isNPC(obj.id)) {
        const objectName = obj.name?.[this.language] || obj.id;
        const actions = this.suggestNPCActions(obj, this.genre);

        hints.push({
          object: objectName,
          suggestedActions: actions,
          priority: 0.9,
          reason: 'NPCs can provide valuable information and items'
        });
      }
    }

    // Analyze interactive objects
    for (const obj of availableObjects) {
      if (!this.isNPC(obj.id)) {
        const objectName = obj.name?.[this.language] || obj.id;
        const actions = this.suggestObjectActions(obj, playerInventory);

        if (actions.length > 0) {
          hints.push({
            object: objectName,
            suggestedActions: actions,
            priority: 0.7,
            reason: this.getActionReason(obj.id, actions)
          });
        }
      }
    }

    // Sort by priority (highest first)
    hints.sort((a, b) => b.priority - a.priority);

    return hints.slice(0, 5);  // Return top 5 hints
  }

  /**
   * Check if an object ID represents an NPC
   */
  private isNPC(objectId: string): boolean {
    const npcKeywords = [
      'wizard', 'merchant', 'guard', 'bartender', 'bard',
      'stranger', 'elder', 'child', 'villager', 'traveler',
      'knight', 'priest', 'king', 'queen', 'princess',
      'scientist', 'doctor', 'engineer', 'captain', 'pilot'
    ];

    const lowerId = objectId.toLowerCase();
    return npcKeywords.some(keyword => lowerId.includes(keyword));
  }

  /**
   * Suggest actions for NPCs based on genre
   */
  private suggestNPCActions(
    npc: { id: string; allowedActions?: ObjectIntent[] },
    genre: NarrativeGenre
  ): string[] {
    const actions: string[] = [];

    // Universal NPC actions
    actions.push('talk to');
    actions.push('examine');

    // Genre-specific suggestions
    if (genre === 'fantasy' || genre === 'medieval') {
      actions.push('greet');
      if (npc.id.includes('merchant')) {
        actions.push('trade with');
      }
      if (npc.id.includes('wizard') || npc.id.includes('mage')) {
        actions.push('ask about magic');
      }
    } else if (genre === 'scifi' || genre === 'cyberpunk') {
      actions.push('scan');
      if (npc.id.includes('scientist') || npc.id.includes('engineer')) {
        actions.push('ask about technology');
      }
    } else if (genre === 'horror') {
      actions.push('approach carefully');
      actions.push('watch');
    }

    return actions;
  }

  /**
   * Suggest actions for regular objects
   */
  private suggestObjectActions(
    obj: { id: string; allowedActions?: ObjectIntent[]; properties?: Record<string, any> },
    playerInventory: string[]
  ): string[] {
    const actions: string[] = [];
    const lowerId = obj.id.toLowerCase();

    // Use allowed actions if specified
    if (obj.allowedActions && obj.allowedActions.length > 0) {
      return obj.allowedActions.map(intent => this.intentToAction(intent));
    }

    // Infer actions from object type
    if (this.isContainer(lowerId)) {
      actions.push('open', 'examine');
      if (obj.properties?.locked) {
        actions.push('unlock');
      }
    } else if (this.isReadable(lowerId)) {
      actions.push('read', 'examine', 'take');
    } else if (this.isConsumable(lowerId)) {
      actions.push('eat/drink', 'examine');
      if (!playerInventory.includes(obj.id)) {
        actions.push('take');
      }
    } else if (this.isWeapon(lowerId)) {
      actions.push('take', 'examine', 'wield');
    } else if (this.isTool(lowerId)) {
      actions.push('take', 'use', 'examine');
    } else {
      // Default actions for unknown objects
      actions.push('examine');
      if (!playerInventory.includes(obj.id)) {
        actions.push('take');
      }
    }

    return actions;
  }

  /**
   * Convert ObjectIntent to natural language action
   */
  private intentToAction(intent: ObjectIntent): string {
    const mapping: Record<ObjectIntent, string> = {
      'MOVE': 'go to',
      'LOOK_AROUND': 'look around',
      'EXAMINE': 'examine',
      'TAKE': 'take',
      'DROP': 'drop',
      'USE': 'use',
      'USE_ON': 'use on',
      'OPEN': 'open',
      'CLOSE': 'close',
      'TALK': 'talk to',
      'ATTACK': 'attack',
      'EAT': 'eat/drink',
      'GIVE': 'give',
      'CLIMB': 'climb',
      'TIE': 'tie',
      'BURN': 'burn',
      'READ': 'read',
      'WEAR': 'wear',
      'THROW': 'throw'
    };

    return mapping[intent] || intent.toLowerCase();
  }

  /**
   * Type detection helpers
   */
  private isContainer(id: string): boolean {
    return ['chest', 'box', 'crate', 'barrel', 'door', 'cabinet', 'safe'].some(
      keyword => id.includes(keyword)
    );
  }

  private isReadable(id: string): boolean {
    return ['book', 'scroll', 'map', 'note', 'letter', 'tome', 'manual'].some(
      keyword => id.includes(keyword)
    );
  }

  private isConsumable(id: string): boolean {
    return ['potion', 'bread', 'ale', 'food', 'water', 'drink', 'meal'].some(
      keyword => id.includes(keyword)
    );
  }

  private isWeapon(id: string): boolean {
    return ['sword', 'axe', 'dagger', 'bow', 'staff', 'wand', 'gun', 'rifle'].some(
      keyword => id.includes(keyword)
    );
  }

  private isTool(id: string): boolean {
    return ['key', 'torch', 'rope', 'hammer', 'wrench', 'scanner'].some(
      keyword => id.includes(keyword)
    );
  }

  /**
   * Generate reason why this action is suggested
   */
  private getActionReason(objectId: string, actions: string[]): string {
    const lowerId = objectId.toLowerCase();

    if (this.isContainer(lowerId)) {
      return 'May contain useful items';
    } else if (this.isReadable(lowerId)) {
      return 'Could provide important information';
    } else if (this.isConsumable(lowerId)) {
      return 'Can restore health or provide buffs';
    } else if (this.isWeapon(lowerId)) {
      return 'Useful for combat encounters';
    } else if (this.isTool(lowerId)) {
      return 'Might be needed for puzzles';
    }

    return 'Might be useful later';
  }

  /**
   * Generate formatted hint message for display
   */
  formatHint(hint: ContextualHint): string {
    return `💡 ${hint.object}: Try "${hint.suggestedActions[0]}" (${hint.reason})`;
  }

  /**
   * Generate all hints as formatted text
   */
  formatAllHints(hints: ContextualHint[]): string {
    if (hints.length === 0) {
      return '';
    }

    const formatted = hints.map(hint => this.formatHint(hint)).join('\n');
    return `\n\nHelpful Tips:\n${formatted}`;
  }
}
