/**
 * ConversationManager - FACADE 2.2: Turn-Taking and Conversation Flow
 *
 * Manages conversation "floor" (who's speaking), turn transitions, topic tracking,
 * and NPC-initiated conversations. Inspired by Facade's conversation management
 * where Trip and Grace can interrupt, initiate topics, and manage turn-taking.
 *
 * Key Features:
 * - Track who has the conversation "floor" (player or specific NPC)
 * - Manage smooth turn transitions
 * - Allow NPC-initiated conversations and interruptions
 * - Track conversation topics for coherence
 * - Detect topic changes and handle them appropriately
 */

import { Language } from '../../types';

/**
 * Who currently has the conversation floor
 */
export type ConversationFloor =
  | { type: 'player' }
  | { type: 'npc'; npcId: string }
  | { type: 'none' };  // No active conversation

/**
 * Conversation topic tracking
 */
export interface ConversationTopic {
  id: string;              // e.g., "quest_dragon", "npc_backstory"
  name: string;            // Human-readable topic name
  initiatedBy: 'player' | 'npc';
  startedTurn: number;
  participatingNPCs: string[];  // NPCs involved in this topic
  subtopics: string[];     // Related topics discussed
  coherenceScore: number;  // 0-1: How well conversation stays on topic
}

/**
 * NPC interruption request
 */
export interface InterruptionRequest {
  npcId: string;
  urgency: 'low' | 'medium' | 'high';  // How important is this interruption
  reason: string;          // Why NPC wants to interrupt
  message: Record<Language, string>;  // What NPC wants to say
  allowDelay: boolean;     // Can this wait for natural turn?
}

/**
 * Conversation state for resuming after interruption
 */
export interface ConversationState {
  npcId: string;
  topic: string;
  partialThought?: string;  // What NPC was saying when interrupted
  canResume: boolean;
}

/**
 * Turn transition result
 */
export interface TurnTransition {
  success: boolean;
  newFloor: ConversationFloor;
  message?: string;  // Optional message about transition
}

/**
 * ConversationManager - Manages conversation flow and turn-taking
 */
export class ConversationManager {
  // Current conversation state
  private currentFloor: ConversationFloor = { type: 'none' };
  private currentTopic: ConversationTopic | null = null;
  private topicHistory: ConversationTopic[] = [];  // Last 5 topics

  // Turn management
  private turnCount: number = 0;
  private lastSpeaker: 'player' | 'npc' | null = null;
  private consecutiveTurnsByPlayer: number = 0;
  private consecutiveTurnsByNPC: Map<string, number> = new Map();

  // Interruption handling
  private pendingInterruptions: InterruptionRequest[] = [];
  private interruptedState: ConversationState | null = null;

  // Topic coherence tracking
  private topicChangesThisConversation: number = 0;
  private allowedTopicChanges: number = 3;  // Before conversation feels scattered

  constructor() {
    console.log('[ConversationManager] FACADE 2.2: Conversation flow manager initialized');
  }

  // ==================== Floor Management ====================

  /**
   * Get who currently has the conversation floor
   */
  getFloor(): ConversationFloor {
    return this.currentFloor;
  }

  /**
   * Check if anyone has the floor
   */
  hasActiveConversation(): boolean {
    return this.currentFloor.type !== 'none';
  }

  /**
   * Check if a specific NPC has the floor
   */
  npcHasFloor(npcId: string): boolean {
    return this.currentFloor.type === 'npc' && this.currentFloor.npcId === npcId;
  }

  /**
   * Check if player has the floor
   */
  playerHasFloor(): boolean {
    return this.currentFloor.type === 'player';
  }

  /**
   * Give floor to player (player's turn to speak)
   */
  giveFloorToPlayer(): TurnTransition {
    const previousFloor = this.currentFloor;

    // If NPC had floor, record interrupted state for potential resume
    if (previousFloor.type === 'npc') {
      this.interruptedState = {
        npcId: previousFloor.npcId,
        topic: this.currentTopic?.id || '',
        canResume: true
      };
    }

    this.currentFloor = { type: 'player' };
    this.lastSpeaker = 'player';
    this.consecutiveTurnsByPlayer++;

    console.log(`[ConversationManager] Floor → Player (${this.consecutiveTurnsByPlayer} consecutive turns)`);

    return {
      success: true,
      newFloor: this.currentFloor,
      message: previousFloor.type === 'npc' ? `Player took floor from NPC` : undefined
    };
  }

  /**
   * Give floor to NPC (NPC's turn to speak)
   */
  giveFloorToNPC(npcId: string, allowInterruption: boolean = false): TurnTransition {
    const previousFloor = this.currentFloor;

    // Check if NPC can take floor
    if (!allowInterruption && previousFloor.type === 'npc' && previousFloor.npcId !== npcId) {
      console.log(`[ConversationManager] Cannot give floor to ${npcId}, another NPC is speaking`);
      return {
        success: false,
        newFloor: previousFloor,
        message: `Another NPC (${previousFloor.npcId}) currently has floor`
      };
    }

    this.currentFloor = { type: 'npc', npcId };
    this.lastSpeaker = 'npc';
    this.consecutiveTurnsByPlayer = 0;  // Reset player turn count

    const npcTurns = (this.consecutiveTurnsByNPC.get(npcId) || 0) + 1;
    this.consecutiveTurnsByNPC.set(npcId, npcTurns);

    console.log(`[ConversationManager] Floor → NPC:${npcId} (${npcTurns} consecutive turns)`);

    return {
      success: true,
      newFloor: this.currentFloor,
      message: allowInterruption ? `NPC ${npcId} interrupted` : undefined
    };
  }

  /**
   * Release the floor (end conversation)
   */
  releaseFloor(): void {
    console.log(`[ConversationManager] Floor released (was: ${this.currentFloor.type})`);
    this.currentFloor = { type: 'none' };
    this.consecutiveTurnsByPlayer = 0;
    this.consecutiveTurnsByNPC.clear();
  }

  /**
   * Natural turn transition (conversation continues to next speaker)
   */
  transitionTurn(toNPCId?: string): TurnTransition {
    this.turnCount++;

    // If no one has floor, give to player by default
    if (this.currentFloor.type === 'none') {
      return this.giveFloorToPlayer();
    }

    // If player has floor and specifies NPC, give to NPC
    if (this.currentFloor.type === 'player' && toNPCId) {
      return this.giveFloorToNPC(toNPCId, false);
    }

    // If NPC has floor, give back to player
    if (this.currentFloor.type === 'npc') {
      return this.giveFloorToPlayer();
    }

    // Default: player gets floor
    return this.giveFloorToPlayer();
  }

  // ==================== Topic Management ====================

  /**
   * Start a new conversation topic
   */
  startTopic(
    topicId: string,
    topicName: string,
    initiatedBy: 'player' | 'npc',
    participatingNPCs: string[]
  ): void {
    // If there's an existing topic, save it to history
    if (this.currentTopic) {
      this.topicHistory.push(this.currentTopic);
      if (this.topicHistory.length > 5) {
        this.topicHistory.shift();
      }
      this.topicChangesThisConversation++;
    }

    this.currentTopic = {
      id: topicId,
      name: topicName,
      initiatedBy,
      startedTurn: this.turnCount,
      participatingNPCs,
      subtopics: [],
      coherenceScore: 1.0  // Start with perfect coherence
    };

    console.log(`[ConversationManager] New topic: "${topicName}" (initiated by ${initiatedBy})`);
  }

  /**
   * Add a subtopic to current conversation
   */
  addSubtopic(subtopicId: string): void {
    if (this.currentTopic) {
      this.currentTopic.subtopics.push(subtopicId);
      // Slight decrease in coherence with each subtopic
      this.currentTopic.coherenceScore = Math.max(0.5, this.currentTopic.coherenceScore - 0.1);
    }
  }

  /**
   * Get current topic
   */
  getCurrentTopic(): ConversationTopic | null {
    return this.currentTopic;
  }

  /**
   * Check if conversation is drifting (too many topic changes)
   */
  isConversationDrifting(): boolean {
    return this.topicChangesThisConversation > this.allowedTopicChanges;
  }

  /**
   * Get topic coherence score (how well conversation stays on topic)
   */
  getTopicCoherence(): number {
    return this.currentTopic?.coherenceScore || 0;
  }

  /**
   * Check if topic is related to recent topics
   */
  isRelatedToRecentTopic(topicId: string): boolean {
    // Check if topic was discussed recently
    return this.topicHistory.some(topic =>
      topic.id === topicId || topic.subtopics.includes(topicId)
    );
  }

  /**
   * End current topic
   */
  endTopic(): void {
    if (this.currentTopic) {
      console.log(`[ConversationManager] Ending topic: "${this.currentTopic.name}"`);
      this.topicHistory.push(this.currentTopic);
      if (this.topicHistory.length > 5) {
        this.topicHistory.shift();
      }
      this.currentTopic = null;
    }
  }

  // ==================== NPC-Initiated Conversations ====================

  /**
   * NPC wants to start a conversation with player
   */
  npcInitiateConversation(
    npcId: string,
    topic: string,
    message: Record<Language, string>,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): boolean {
    // If no one has floor, NPC can start immediately
    if (this.currentFloor.type === 'none') {
      this.giveFloorToNPC(npcId, false);
      this.startTopic(topic, topic, 'npc', [npcId]);
      console.log(`[ConversationManager] NPC ${npcId} initiated conversation about "${topic}"`);
      return true;
    }

    // If urgency is high, NPC can interrupt
    if (urgency === 'high') {
      this.requestInterruption(npcId, urgency, `wants to discuss ${topic}`, message, false);
      return true;
    }

    // Otherwise, queue for later
    this.requestInterruption(npcId, urgency, `wants to discuss ${topic}`, message, true);
    console.log(`[ConversationManager] NPC ${npcId} queued to discuss "${topic}" (urgency: ${urgency})`);
    return false;
  }

  // ==================== Interruption Handling ====================

  /**
   * NPC requests to interrupt current conversation
   */
  requestInterruption(
    npcId: string,
    urgency: 'low' | 'medium' | 'high',
    reason: string,
    message: Record<Language, string>,
    allowDelay: boolean
  ): void {
    const request: InterruptionRequest = {
      npcId,
      urgency,
      reason,
      message,
      allowDelay
    };

    this.pendingInterruptions.push(request);

    // Sort by urgency (high first)
    this.pendingInterruptions.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });

    console.log(`[ConversationManager] Interruption requested by ${npcId} (${urgency} urgency): ${reason}`);

    // If urgency is high and cannot be delayed, interrupt immediately
    if (urgency === 'high' && !allowDelay) {
      this.processInterruption(request);
    }
  }

  /**
   * Process a pending interruption
   */
  private processInterruption(request: InterruptionRequest): boolean {
    const transition = this.giveFloorToNPC(request.npcId, true);

    if (transition.success) {
      // Remove from pending list
      this.pendingInterruptions = this.pendingInterruptions.filter(
        r => r.npcId !== request.npcId || r.reason !== request.reason
      );

      console.log(`[ConversationManager] Interruption processed: ${request.npcId} - ${request.reason}`);
      return true;
    }

    return false;
  }

  /**
   * Check if there are pending interruptions ready to execute
   */
  getPendingInterruption(): InterruptionRequest | null {
    // Return highest priority interruption if any
    if (this.pendingInterruptions.length > 0) {
      // High urgency interruptions happen immediately
      const highUrgency = this.pendingInterruptions.find(r => r.urgency === 'high');
      if (highUrgency) {
        return highUrgency;
      }

      // Medium urgency when there's a natural pause (player finished turn)
      if (this.currentFloor.type === 'player' || this.currentFloor.type === 'none') {
        const mediumUrgency = this.pendingInterruptions.find(r => r.urgency === 'medium');
        if (mediumUrgency) {
          return mediumUrgency;
        }
      }

      // Low urgency only when conversation is idle
      if (this.currentFloor.type === 'none') {
        return this.pendingInterruptions[0];
      }
    }

    return null;
  }

  /**
   * Execute the pending interruption (called by engine)
   */
  executePendingInterruption(): InterruptionRequest | null {
    const interruption = this.getPendingInterruption();

    if (interruption) {
      this.processInterruption(interruption);
      return interruption;
    }

    return null;
  }

  /**
   * Player interrupts NPC ("wait", "hold on", "stop")
   */
  playerInterrupts(reason: string): void {
    if (this.currentFloor.type === 'npc') {
      // Save NPC state for resume
      this.interruptedState = {
        npcId: this.currentFloor.npcId,
        topic: this.currentTopic?.id || '',
        canResume: true
      };

      this.giveFloorToPlayer();
      console.log(`[ConversationManager] Player interrupted NPC: ${reason}`);
    }
  }

  /**
   * Check if there's an interrupted conversation that can be resumed
   */
  canResumeInterrupted(): boolean {
    return this.interruptedState !== null && this.interruptedState.canResume;
  }

  /**
   * Resume interrupted conversation
   */
  resumeInterrupted(): ConversationState | null {
    if (this.canResumeInterrupted() && this.interruptedState) {
      const state = this.interruptedState;
      this.interruptedState = null;  // Clear state
      this.giveFloorToNPC(state.npcId, false);

      if (state.topic) {
        this.startTopic(state.topic, state.topic, 'npc', [state.npcId]);
      }

      console.log(`[ConversationManager] Resumed interrupted conversation with ${state.npcId}`);
      return state;
    }

    return null;
  }

  // ==================== Conversation Flow Analysis ====================

  /**
   * Check if it's natural for NPC to speak now
   */
  isNaturalNPCTurn(npcId: string): boolean {
    // NPC already has floor
    if (this.npcHasFloor(npcId)) {
      return true;
    }

    // Player has had many consecutive turns, NPC should speak
    if (this.consecutiveTurnsByPlayer > 2) {
      return true;
    }

    // No one has floor
    if (this.currentFloor.type === 'none') {
      return true;
    }

    // Not natural for NPC to interrupt
    return false;
  }

  /**
   * Suggest when to transition turn (for natural flow)
   */
  shouldTransitionTurn(): boolean {
    // Player has had too many turns
    if (this.consecutiveTurnsByPlayer > 3) {
      return true;
    }

    // NPC has had too many turns
    if (this.currentFloor.type === 'npc') {
      const npcTurns = this.consecutiveTurnsByNPC.get(this.currentFloor.npcId) || 0;
      if (npcTurns > 2) {
        return true;
      }
    }

    // Conversation drifting, might be time to wrap up
    if (this.isConversationDrifting()) {
      return true;
    }

    return false;
  }

  // ==================== State Management ====================

  /**
   * Reset conversation manager (new scene/location)
   */
  reset(): void {
    this.currentFloor = { type: 'none' };
    this.currentTopic = null;
    this.topicHistory = [];
    this.turnCount = 0;
    this.lastSpeaker = null;
    this.consecutiveTurnsByPlayer = 0;
    this.consecutiveTurnsByNPC.clear();
    this.pendingInterruptions = [];
    this.interruptedState = null;
    this.topicChangesThisConversation = 0;

    console.log('[ConversationManager] Reset');
  }

  /**
   * Get conversation statistics (for debugging)
   */
  getStats() {
    return {
      currentFloor: this.currentFloor,
      currentTopic: this.currentTopic?.name || 'none',
      turnCount: this.turnCount,
      consecutiveTurnsByPlayer: this.consecutiveTurnsByPlayer,
      topicChanges: this.topicChangesThisConversation,
      isDefting: this.isConversationDrifting(),
      pendingInterruptions: this.pendingInterruptions.length,
      canResume: this.canResumeInterrupted()
    };
  }
}
