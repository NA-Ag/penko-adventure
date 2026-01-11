/**
 * WorldState - Global fact tracking system (Tier 10)
 *
 * Manages a persistent record of significant events in the world.
 * NPCs can learn facts and react to them, creating a living, reactive world.
 *
 * Inspired by:
 * - The Elder Scrolls (crime system, faction relationships)
 * - Dwarf Fortress (historical events tracking)
 * - Crusader Kings (opinion modifiers based on events)
 *
 * Example facts:
 * - "fact:dragon_slain"
 * - "fact:merchant_robbed"
 * - "fact:player_helped_guard"
 * - "fact:castle_under_siege"
 */

import type { Language } from '../../types';

/**
 * A world fact - something that happened or is true
 */
export interface WorldFact {
  id: string;                          // Unique fact ID (e.g., "fact:dragon_slain")
  category: FactCategory;              // Type of fact
  turn: number;                        // When it occurred
  locationId?: string;                 // Where it happened (if location-specific)
  involvedNPCs?: string[];             // NPCs who were present/involved
  involvedObjects?: string[];          // Objects that were involved
  description: Record<Language, string>; // Localized description
  isPublic: boolean;                   // Can any NPC learn this, or only witnesses?
  expiresAfterTurns?: number;          // Optional: fact becomes irrelevant after N turns
}

/**
 * Categories of world facts
 */
export type FactCategory =
  | 'combat'         // Fights, deaths, victories
  | 'theft'          // Stealing, robbery
  | 'help'           // Player helped someone
  | 'betrayal'       // Breaking trust, lying
  | 'discovery'      // Finding important items/places
  | 'conversation'   // Important dialogue occurred
  | 'quest'          // Quest-related events
  | 'environment';   // World changes (fire, flood, etc.)

/**
 * WorldState service - Tracks all facts about the world
 */
export class WorldState {
  private facts: Map<string, WorldFact> = new Map();
  private currentTurn: number = 0;

  /**
   * Record a new fact
   */
  recordFact(fact: WorldFact): void {
    fact.turn = this.currentTurn;
    this.facts.set(fact.id, fact);
    console.log(`[WorldState] Fact recorded: ${fact.id}`);
  }

  /**
   * Check if a fact exists
   */
  hasFact(factId: string): boolean {
    const fact = this.facts.get(factId);
    if (!fact) return false;

    // Check if fact has expired
    if (fact.expiresAfterTurns) {
      const turnsSince = this.currentTurn - fact.turn;
      if (turnsSince > fact.expiresAfterTurns) {
        this.facts.delete(factId);
        return false;
      }
    }

    return true;
  }

  /**
   * Get a specific fact
   */
  getFact(factId: string): WorldFact | undefined {
    return this.facts.get(factId);
  }

  /**
   * Get all facts of a specific category
   */
  getFactsByCategory(category: FactCategory): WorldFact[] {
    return Array.from(this.facts.values()).filter(f => f.category === category);
  }

  /**
   * Get facts that occurred at a specific location
   */
  getFactsByLocation(locationId: string): WorldFact[] {
    return Array.from(this.facts.values()).filter(f => f.locationId === locationId);
  }

  /**
   * Get facts involving a specific NPC
   */
  getFactsByNPC(npcId: string): WorldFact[] {
    return Array.from(this.facts.values()).filter(f =>
      f.involvedNPCs?.includes(npcId)
    );
  }

  /**
   * Get all public facts (that any NPC can potentially learn)
   */
  getPublicFacts(): WorldFact[] {
    return Array.from(this.facts.values()).filter(f => f.isPublic);
  }

  /**
   * Get recent facts (within last N turns)
   */
  getRecentFacts(turnLimit: number): WorldFact[] {
    return Array.from(this.facts.values()).filter(f =>
      this.currentTurn - f.turn <= turnLimit
    );
  }

  /**
   * Remove a fact (e.g., if it's been resolved or is no longer relevant)
   */
  removeFact(factId: string): void {
    this.facts.delete(factId);
    console.log(`[WorldState] Fact removed: ${factId}`);
  }

  /**
   * Clear all facts (e.g., when starting a new game)
   */
  clearAllFacts(): void {
    this.facts.clear();
    console.log('[WorldState] All facts cleared');
  }

  /**
   * Advance the turn counter (called by game engine each turn)
   */
  advanceTurn(): void {
    this.currentTurn++;

    // Clean up expired facts
    for (const [id, fact] of this.facts.entries()) {
      if (fact.expiresAfterTurns) {
        const turnsSince = this.currentTurn - fact.turn;
        if (turnsSince > fact.expiresAfterTurns) {
          this.facts.delete(id);
          console.log(`[WorldState] Expired fact: ${id}`);
        }
      }
    }
  }

  /**
   * Get current turn number
   */
  getCurrentTurn(): number {
    return this.currentTurn;
  }

  /**
   * Get total number of active facts
   */
  getFactCount(): number {
    return this.facts.size;
  }

  /**
   * Export state for saving
   */
  exportState(): {
    facts: [string, WorldFact][];
    currentTurn: number;
  } {
    return {
      facts: Array.from(this.facts.entries()),
      currentTurn: this.currentTurn
    };
  }

  /**
   * Import state from save file
   */
  importState(state: {
    facts: [string, WorldFact][];
    currentTurn: number;
  }): void {
    this.facts = new Map(state.facts);
    this.currentTurn = state.currentTurn;
    console.log(`[WorldState] Imported ${this.facts.size} facts at turn ${this.currentTurn}`);
  }

  /**
   * Create a helper fact for common scenarios
   */
  static createCombatFact(
    id: string,
    locationId: string,
    victor: string,
    defeated: string,
    description: Record<Language, string>
  ): WorldFact {
    return {
      id,
      category: 'combat',
      turn: 0, // Will be set by recordFact
      locationId,
      involvedNPCs: [victor, defeated],
      description,
      isPublic: true,
      expiresAfterTurns: 50 // Combat news is relevant for ~50 turns
    };
  }

  /**
   * Create a helper fact for theft
   */
  static createTheftFact(
    id: string,
    locationId: string,
    thief: string,
    victim: string,
    stolenObject: string,
    description: Record<Language, string>
  ): WorldFact {
    return {
      id,
      category: 'theft',
      turn: 0,
      locationId,
      involvedNPCs: [thief, victim],
      involvedObjects: [stolenObject],
      description,
      isPublic: true,
      expiresAfterTurns: 100 // Crimes are remembered longer
    };
  }

  /**
   * Create a helper fact for player helping someone
   */
  static createHelpFact(
    id: string,
    locationId: string,
    helper: string,
    helped: string,
    description: Record<Language, string>
  ): WorldFact {
    return {
      id,
      category: 'help',
      turn: 0,
      locationId,
      involvedNPCs: [helper, helped],
      description,
      isPublic: true,
      expiresAfterTurns: 30
    };
  }

  /**
   * Create a helper fact for major discoveries
   */
  static createDiscoveryFact(
    id: string,
    locationId: string,
    discoverer: string,
    discoveredObject: string,
    description: Record<Language, string>
  ): WorldFact {
    return {
      id,
      category: 'discovery',
      turn: 0,
      locationId,
      involvedNPCs: [discoverer],
      involvedObjects: [discoveredObject],
      description,
      isPublic: true
      // No expiration - major discoveries are permanent
    };
  }
}

/**
 * Helper function to create default persona for an NPC
 */
export function createDefaultPersona(): import('../../types/ContentPack').NPCPersona {
  return {
    relationshipWithPlayer: 0,    // Neutral
    mood: 'neutral',
    goals: [],
    knowledge: new Set<string>(),
    timesSpokenTo: 0,
    memorableEvents: []
  };
}
