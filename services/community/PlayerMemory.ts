/**
 * PlayerMemory - FACADE 2.1: Player Working Memory System
 *
 * Tracks player state so NPCs can reference player's past actions, current state,
 * and relationships. Inspired by Facade's player model that remembers interactions,
 * choices, and state for natural conversations.
 *
 * This enables NPCs to say things like:
 * - "I remember when you helped me find that sword!"
 * - "You've been to the forest before, haven't you?"
 * - "Last time we spoke, you seemed frustrated."
 */

import { Language } from '../../types';

/**
 * Emotional state of the player (inferred from actions)
 */
export type PlayerMood =
  | 'neutral'
  | 'curious'       // Examining many things, asking questions
  | 'frustrated'    // Failed actions, repeated attempts
  | 'excited'       // Discovering new things, progressing
  | 'focused';      // Working towards a specific goal

/**
 * Player action record for history tracking
 */
export interface PlayerAction {
  turn: number;
  intent: string;              // MOVE, EXAMINE, TALK, TAKE, etc.
  targetId?: string;           // NPC or object interacted with
  locationId: string;          // Where the action occurred
  success: boolean;            // Did the action succeed?
  description: string;         // Brief description for reference
}

/**
 * Player conversation memory
 */
export interface ConversationMemory {
  turn: number;
  npcId: string;
  topic?: string;              // What they talked about
  playerMood: PlayerMood;      // How player seemed during conversation
  memorable: boolean;          // Was this a significant conversation?
}

/**
 * Player's relationship with an NPC (from player's perspective)
 */
export interface PlayerNPCRelationship {
  npcId: string;
  trustLevel: number;          // 0-100: How much player trusts this NPC
  timesHelped: number;         // How many times player helped this NPC
  timesRefused: number;        // How many times player refused help
  lastInteractionTurn: number; // When they last spoke
  memorableEvents: ConversationMemory[]; // Important conversations
}

/**
 * Player goal (what they're trying to accomplish)
 */
export interface PlayerGoal {
  id: string;
  description: string;
  progress: number;            // 0-100
  startedTurn: number;
  relatedNPCs: string[];       // NPCs involved in this goal
  relatedObjects: string[];    // Objects involved in this goal
}

/**
 * PlayerMemory - Tracks all player state for NPC references
 */
export class PlayerMemory {
  // Current state
  private currentLocation: string = '';
  private inventory: string[] = [];
  private currentMood: PlayerMood = 'neutral';
  private currentGoals: PlayerGoal[] = [];

  // History
  private recentActions: PlayerAction[] = [];           // Last 10 actions
  private conversationHistory: ConversationMemory[] = [];  // Last 20 conversations
  private visitedLocations: Set<string> = new Set();
  private metNPCs: Set<string> = new Set();
  private collectedObjects: Set<string> = new Set();

  // Relationships
  private npcRelationships: Map<string, PlayerNPCRelationship> = new Map();

  // Session tracking
  private currentTurn: number = 0;
  private sessionStartTime: Date = new Date();

  constructor() {
    console.log('[PlayerMemory] FACADE 2.1: Player memory system initialized');
  }

  // ==================== Location Tracking ====================

  /**
   * Update player's current location
   */
  setLocation(locationId: string): void {
    this.currentLocation = locationId;
    this.visitedLocations.add(locationId);
    console.log(`[PlayerMemory] Player moved to: ${locationId}`);
  }

  /**
   * Get current location
   */
  getLocation(): string {
    return this.currentLocation;
  }

  /**
   * Check if player has visited a location
   */
  hasVisited(locationId: string): boolean {
    return this.visitedLocations.has(locationId);
  }

  /**
   * Get all visited locations
   */
  getVisitedLocations(): string[] {
    return Array.from(this.visitedLocations);
  }

  // ==================== Inventory Tracking ====================

  /**
   * Add item to inventory
   */
  addToInventory(objectId: string): void {
    if (!this.inventory.includes(objectId)) {
      this.inventory.push(objectId);
      this.collectedObjects.add(objectId);
      console.log(`[PlayerMemory] Added to inventory: ${objectId}`);
    }
  }

  /**
   * Remove item from inventory
   */
  removeFromInventory(objectId: string): void {
    this.inventory = this.inventory.filter(id => id !== objectId);
    console.log(`[PlayerMemory] Removed from inventory: ${objectId}`);
  }

  /**
   * Get current inventory
   */
  getInventory(): string[] {
    return [...this.inventory];
  }

  /**
   * Check if player has an object
   */
  hasObject(objectId: string): boolean {
    return this.inventory.includes(objectId);
  }

  /**
   * Check if player has ever collected an object
   */
  hasEverHad(objectId: string): boolean {
    return this.collectedObjects.has(objectId);
  }

  // ==================== Action History ====================

  /**
   * Record a player action
   */
  recordAction(
    intent: string,
    targetId: string | undefined,
    locationId: string,
    success: boolean,
    description: string
  ): void {
    const action: PlayerAction = {
      turn: this.currentTurn,
      intent,
      targetId,
      locationId,
      success,
      description
    };

    this.recentActions.push(action);

    // Keep only last 10 actions
    if (this.recentActions.length > 10) {
      this.recentActions.shift();
    }

    // Update mood based on action patterns
    this.updateMoodFromActions();

    console.log(`[PlayerMemory] Recorded action: ${intent} ${targetId || ''} (${success ? 'success' : 'failed'})`);
  }

  /**
   * Get recent actions
   */
  getRecentActions(count: number = 10): PlayerAction[] {
    return this.recentActions.slice(-count);
  }

  /**
   * Get actions involving a specific NPC or object
   */
  getActionsInvolving(targetId: string): PlayerAction[] {
    return this.recentActions.filter(action => action.targetId === targetId);
  }

  /**
   * Get last action of a specific type
   */
  getLastActionOfType(intent: string): PlayerAction | null {
    for (let i = this.recentActions.length - 1; i >= 0; i--) {
      if (this.recentActions[i].intent === intent) {
        return this.recentActions[i];
      }
    }
    return null;
  }

  // ==================== Mood Tracking ====================

  /**
   * Update player mood based on recent action patterns
   */
  private updateMoodFromActions(): void {
    if (this.recentActions.length < 3) return;

    const last5 = this.recentActions.slice(-5);
    const failureRate = last5.filter(a => !a.success).length / last5.length;
    const examineCount = last5.filter(a => a.intent === 'EXAMINE').length;
    const uniqueTargets = new Set(last5.map(a => a.targetId).filter(Boolean)).size;

    // Frustrated: High failure rate
    if (failureRate > 0.6) {
      this.currentMood = 'frustrated';
    }
    // Curious: Examining many things
    else if (examineCount >= 3) {
      this.currentMood = 'curious';
    }
    // Excited: Discovering new things
    else if (uniqueTargets >= 4) {
      this.currentMood = 'excited';
    }
    // Focused: Repeated actions on same target
    else if (uniqueTargets === 1 && last5.length >= 3) {
      this.currentMood = 'focused';
    }
    // Default: Neutral
    else {
      this.currentMood = 'neutral';
    }
  }

  /**
   * Get current player mood
   */
  getMood(): PlayerMood {
    return this.currentMood;
  }

  /**
   * Manually set player mood (for special events)
   */
  setMood(mood: PlayerMood): void {
    this.currentMood = mood;
  }

  // ==================== Conversation History ====================

  /**
   * Record a conversation with an NPC
   */
  recordConversation(
    npcId: string,
    topic: string | undefined,
    memorable: boolean = false
  ): void {
    const conversation: ConversationMemory = {
      turn: this.currentTurn,
      npcId,
      topic,
      playerMood: this.currentMood,
      memorable
    };

    this.conversationHistory.push(conversation);
    this.metNPCs.add(npcId);

    // Keep only last 20 conversations
    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift();
    }

    // Update NPC relationship
    this.updateNPCRelationship(npcId);

    console.log(`[PlayerMemory] Recorded conversation with ${npcId}${topic ? ` about ${topic}` : ''}`);
  }

  /**
   * Get conversations with a specific NPC
   */
  getConversationsWith(npcId: string): ConversationMemory[] {
    return this.conversationHistory.filter(conv => conv.npcId === npcId);
  }

  /**
   * Get recent conversations
   */
  getRecentConversations(count: number = 10): ConversationMemory[] {
    return this.conversationHistory.slice(-count);
  }

  /**
   * Check if player has met an NPC
   */
  hasMetNPC(npcId: string): boolean {
    return this.metNPCs.has(npcId);
  }

  /**
   * Get all met NPCs
   */
  getMetNPCs(): string[] {
    return Array.from(this.metNPCs);
  }

  // ==================== NPC Relationships ====================

  /**
   * Update relationship tracking with an NPC
   */
  private updateNPCRelationship(npcId: string): void {
    let relationship = this.npcRelationships.get(npcId);

    if (!relationship) {
      relationship = {
        npcId,
        trustLevel: 50,  // Start neutral
        timesHelped: 0,
        timesRefused: 0,
        lastInteractionTurn: this.currentTurn,
        memorableEvents: []
      };
      this.npcRelationships.set(npcId, relationship);
    } else {
      relationship.lastInteractionTurn = this.currentTurn;
    }
  }

  /**
   * Record player helping an NPC
   */
  recordHelp(npcId: string): void {
    const relationship = this.npcRelationships.get(npcId);
    if (relationship) {
      relationship.timesHelped++;
      relationship.trustLevel = Math.min(100, relationship.trustLevel + 10);
      console.log(`[PlayerMemory] Helped ${npcId} (trust: ${relationship.trustLevel})`);
    }
  }

  /**
   * Record player refusing to help an NPC
   */
  recordRefusal(npcId: string): void {
    const relationship = this.npcRelationships.get(npcId);
    if (relationship) {
      relationship.timesRefused++;
      relationship.trustLevel = Math.max(0, relationship.trustLevel - 5);
      console.log(`[PlayerMemory] Refused ${npcId} (trust: ${relationship.trustLevel})`);
    }
  }

  /**
   * Get relationship with an NPC
   */
  getRelationship(npcId: string): PlayerNPCRelationship | null {
    return this.npcRelationships.get(npcId) || null;
  }

  // ==================== Goals ====================

  /**
   * Add a goal for the player
   */
  addGoal(goal: PlayerGoal): void {
    this.currentGoals.push(goal);
    console.log(`[PlayerMemory] New goal: ${goal.description}`);
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(goalId: string, progress: number): void {
    const goal = this.currentGoals.find(g => g.id === goalId);
    if (goal) {
      goal.progress = Math.min(100, progress);
      console.log(`[PlayerMemory] Goal progress: ${goal.description} → ${progress}%`);
    }
  }

  /**
   * Remove completed goal
   */
  completeGoal(goalId: string): void {
    this.currentGoals = this.currentGoals.filter(g => g.id !== goalId);
    console.log(`[PlayerMemory] Goal completed: ${goalId}`);
  }

  /**
   * Get active goals
   */
  getGoals(): PlayerGoal[] {
    return [...this.currentGoals];
  }

  /**
   * Get goals involving a specific NPC
   */
  getGoalsInvolving(npcId: string): PlayerGoal[] {
    return this.currentGoals.filter(goal => goal.relatedNPCs.includes(npcId));
  }

  // ==================== Turn Management ====================

  /**
   * Advance to next turn
   */
  nextTurn(): void {
    this.currentTurn++;
  }

  /**
   * Get current turn number
   */
  getTurn(): number {
    return this.currentTurn;
  }

  // ==================== Persistence ====================

  /**
   * Export player memory state for saving
   */
  export(): any {
    return {
      currentLocation: this.currentLocation,
      inventory: this.inventory,
      currentMood: this.currentMood,
      currentGoals: this.currentGoals,
      recentActions: this.recentActions,
      conversationHistory: this.conversationHistory,
      visitedLocations: Array.from(this.visitedLocations),
      metNPCs: Array.from(this.metNPCs),
      collectedObjects: Array.from(this.collectedObjects),
      npcRelationships: Array.from(this.npcRelationships.entries()),
      currentTurn: this.currentTurn,
      sessionStartTime: this.sessionStartTime.toISOString()
    };
  }

  /**
   * Import player memory state from saved data
   */
  import(data: any): void {
    this.currentLocation = data.currentLocation || '';
    this.inventory = data.inventory || [];
    this.currentMood = data.currentMood || 'neutral';
    this.currentGoals = data.currentGoals || [];
    this.recentActions = data.recentActions || [];
    this.conversationHistory = data.conversationHistory || [];
    this.visitedLocations = new Set(data.visitedLocations || []);
    this.metNPCs = new Set(data.metNPCs || []);
    this.collectedObjects = new Set(data.collectedObjects || []);
    this.npcRelationships = new Map(data.npcRelationships || []);
    this.currentTurn = data.currentTurn || 0;
    this.sessionStartTime = data.sessionStartTime ? new Date(data.sessionStartTime) : new Date();

    console.log('[PlayerMemory] State imported successfully');
  }

  /**
   * Reset player memory (new game)
   */
  reset(): void {
    this.currentLocation = '';
    this.inventory = [];
    this.currentMood = 'neutral';
    this.currentGoals = [];
    this.recentActions = [];
    this.conversationHistory = [];
    this.visitedLocations.clear();
    this.metNPCs.clear();
    this.collectedObjects.clear();
    this.npcRelationships.clear();
    this.currentTurn = 0;
    this.sessionStartTime = new Date();

    console.log('[PlayerMemory] Memory reset');
  }
}
