/**
 * NPCConversationMemory - TIER 20 Multi-Turn Conversation Memory
 *
 * NPCs remember the last 5-10 exchanges with the player and can:
 * - Reference previous topics
 * - Detect topic changes and react
 * - Prevent repetitive conversations
 * - Build on earlier discussion points
 *
 * Features:
 * - Conversation turn tracking (player input + NPC response)
 * - Topic continuity detection
 * - Repetition prevention
 * - Context callbacks ("As I mentioned before...")
 * - Topic change awareness ("Changing the subject, are we?")
 */

import type { DiscourseAct, DiscourseAnalysis } from './DiscourseActRecognizer';

/**
 * A single turn in the conversation
 */
export interface ConversationTurn {
  timestamp: number;
  playerInput: string;
  playerDiscourse: DiscourseAnalysis;
  npcResponse: string;
  topics: string[];  // Topics discussed in this turn
}

/**
 * Conversation memory for a single NPC
 */
export interface NPCConversationHistory {
  npcId: string;
  turns: ConversationTurn[];  // Last N turns (FIFO)
  currentTopic?: string;      // What we're currently talking about
  previousTopics: string[];   // Topics discussed in this conversation
  repetitionCount: Map<string, number>;  // How many times player said similar things
  lastTopicChange?: number;   // When topic last changed
}

/**
 * Topic change detection result
 */
export interface TopicChangeAnalysis {
  isTopicChange: boolean;
  previousTopic?: string;
  newTopic?: string;
  changeType: 'abrupt' | 'smooth' | 'callback' | 'none';
}

/**
 * Repetition detection result
 */
export interface RepetitionAnalysis {
  isRepetitive: boolean;
  similarTurnIndex?: number;  // Index of similar previous turn
  repetitionCount: number;
  message?: string;  // "We just talked about this"
}

/**
 * Manages conversation history for all NPCs
 */
export class NPCConversationMemory {
  private conversations: Map<string, NPCConversationHistory> = new Map();
  private readonly MAX_TURNS = 10;  // Keep last 10 turns

  /**
   * Initialize or get conversation history for an NPC
   */
  getHistory(npcId: string): NPCConversationHistory {
    if (!this.conversations.has(npcId)) {
      this.conversations.set(npcId, {
        npcId,
        turns: [],
        previousTopics: [],
        repetitionCount: new Map(),
      });
    }

    return this.conversations.get(npcId)!;
  }

  /**
   * Record a new conversation turn
   */
  recordTurn(
    npcId: string,
    playerInput: string,
    playerDiscourse: DiscourseAnalysis,
    npcResponse: string
  ): void {
    const history = this.getHistory(npcId);

    // Create new turn
    const turn: ConversationTurn = {
      timestamp: Date.now(),
      playerInput,
      playerDiscourse,
      npcResponse,
      topics: playerDiscourse.topicReferences,
    };

    // Add to history (FIFO - remove oldest if at limit)
    history.turns.push(turn);
    if (history.turns.length > this.MAX_TURNS) {
      history.turns.shift();
    }

    // Update current topic if new topics mentioned
    if (turn.topics.length > 0) {
      const newTopic = turn.topics[0];  // First topic is primary

      if (newTopic !== history.currentTopic) {
        history.lastTopicChange = Date.now();
        history.currentTopic = newTopic;
      }

      // Track all topics discussed
      turn.topics.forEach(topic => {
        if (!history.previousTopics.includes(topic)) {
          history.previousTopics.push(topic);
        }
      });
    }

    // Update repetition count for this input pattern
    const normalizedInput = this.normalizeForRepetition(playerInput);
    const currentCount = history.repetitionCount.get(normalizedInput) || 0;
    history.repetitionCount.set(normalizedInput, currentCount + 1);

    console.log(
      `[NPCConversationMemory] ${npcId}: Turn recorded ` +
      `(${history.turns.length} total, topic: ${history.currentTopic || 'none'})`
    );
  }

  /**
   * Detect if player is changing the topic
   */
  detectTopicChange(npcId: string, newDiscourse: DiscourseAnalysis): TopicChangeAnalysis {
    const history = this.getHistory(npcId);

    // No topic change if no conversation yet
    if (history.turns.length === 0) {
      return { isTopicChange: false, changeType: 'none' };
    }

    const newTopics = newDiscourse.topicReferences;
    const currentTopic = history.currentTopic;

    // No topics in new input
    if (newTopics.length === 0) {
      return { isTopicChange: false, changeType: 'none' };
    }

    const newTopic = newTopics[0];

    // Check if this is a callback to earlier topic
    if (history.previousTopics.includes(newTopic) && newTopic !== currentTopic) {
      return {
        isTopicChange: true,
        previousTopic: currentTopic,
        newTopic,
        changeType: 'callback',
      };
    }

    // Check if topic changed
    if (currentTopic && newTopic !== currentTopic) {
      // Abrupt change if we just started talking about current topic
      const timeSinceChange = history.lastTopicChange
        ? (Date.now() - history.lastTopicChange) / 1000
        : 999;

      const isAbrupt = timeSinceChange < 30;  // Less than 30 seconds

      return {
        isTopicChange: true,
        previousTopic: currentTopic,
        newTopic,
        changeType: isAbrupt ? 'abrupt' : 'smooth',
      };
    }

    return { isTopicChange: false, changeType: 'none' };
  }

  /**
   * Detect if player is being repetitive
   */
  detectRepetition(npcId: string, playerInput: string): RepetitionAnalysis {
    const history = this.getHistory(npcId);

    if (history.turns.length === 0) {
      return { isRepetitive: false, repetitionCount: 0 };
    }

    const normalized = this.normalizeForRepetition(playerInput);

    // Check repetition count
    const count = history.repetitionCount.get(normalized) || 0;

    if (count >= 2) {
      return {
        isRepetitive: true,
        repetitionCount: count,
        message: "We've talked about this already",
      };
    }

    // Check for very similar inputs in recent turns
    const recentTurns = history.turns.slice(-5);  // Last 5 turns

    for (let i = recentTurns.length - 1; i >= 0; i--) {
      const turn = recentTurns[i];
      const turnNormalized = this.normalizeForRepetition(turn.playerInput);

      if (this.areSimilar(normalized, turnNormalized)) {
        return {
          isRepetitive: true,
          similarTurnIndex: i,
          repetitionCount: count + 1,
          message: "Didn't we just talk about this?",
        };
      }
    }

    return { isRepetitive: false, repetitionCount: count };
  }

  /**
   * Get conversation context for response generation
   */
  getConversationContext(npcId: string): {
    hasPreviousContext: boolean;
    recentTopics: string[];
    turnCount: number;
    canReferenceBack: boolean;
  } {
    const history = this.getHistory(npcId);

    return {
      hasPreviousContext: history.turns.length > 0,
      recentTopics: history.previousTopics.slice(-3),  // Last 3 topics
      turnCount: history.turns.length,
      canReferenceBack: history.turns.length >= 2,
    };
  }

  /**
   * Get last N turns
   */
  getRecentTurns(npcId: string, count: number = 5): ConversationTurn[] {
    const history = this.getHistory(npcId);
    return history.turns.slice(-count);
  }

  /**
   * Check if NPC has discussed a topic before
   */
  hasDiscussedTopic(npcId: string, topic: string): boolean {
    const history = this.getHistory(npcId);
    return history.previousTopics.includes(topic);
  }

  /**
   * Get last time a topic was discussed
   */
  getLastDiscussionOf(npcId: string, topic: string): ConversationTurn | null {
    const history = this.getHistory(npcId);

    for (let i = history.turns.length - 1; i >= 0; i--) {
      const turn = history.turns[i];
      if (turn.topics.includes(topic)) {
        return turn;
      }
    }

    return null;
  }

  /**
   * Clear conversation history for an NPC
   */
  clearHistory(npcId: string): void {
    this.conversations.delete(npcId);
    console.log(`[NPCConversationMemory] Cleared history for ${npcId}`);
  }

  /**
   * Normalize input for repetition detection
   */
  private normalizeForRepetition(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[.,!?]/g, '')  // Remove punctuation
      .replace(/\s+/g, ' ');   // Normalize whitespace
  }

  /**
   * Check if two normalized inputs are similar
   */
  private areSimilar(input1: string, input2: string): boolean {
    // Exact match
    if (input1 === input2) return true;

    // Very similar (edit distance or word overlap)
    const words1 = input1.split(' ');
    const words2 = input2.split(' ');

    // Calculate word overlap
    const overlap = words1.filter(w => words2.includes(w)).length;
    const similarity = overlap / Math.max(words1.length, words2.length);

    return similarity > 0.7;  // 70% word overlap = similar
  }

  /**
   * Get all conversation histories (for debugging)
   */
  getAllHistories(): Map<string, NPCConversationHistory> {
    return this.conversations;
  }

  /**
   * Get conversation statistics
   */
  getStatistics(npcId: string): {
    totalTurns: number;
    topicsDiscussed: number;
    averageTurnLength: number;
    mostDiscussedTopic?: string;
  } {
    const history = this.getHistory(npcId);

    if (history.turns.length === 0) {
      return {
        totalTurns: 0,
        topicsDiscussed: 0,
        averageTurnLength: 0,
      };
    }

    // Calculate average turn length
    const totalLength = history.turns.reduce((sum, turn) => {
      return sum + turn.playerInput.length + turn.npcResponse.length;
    }, 0);

    const averageTurnLength = totalLength / (history.turns.length * 2);

    // Find most discussed topic
    const topicCounts = new Map<string, number>();
    history.turns.forEach(turn => {
      turn.topics.forEach(topic => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });

    let mostDiscussedTopic: string | undefined;
    let maxCount = 0;

    topicCounts.forEach((count, topic) => {
      if (count > maxCount) {
        maxCount = count;
        mostDiscussedTopic = topic;
      }
    });

    return {
      totalTurns: history.turns.length,
      topicsDiscussed: history.previousTopics.length,
      averageTurnLength,
      mostDiscussedTopic,
    };
  }
}

/**
 * Factory function for easy instantiation
 */
export function createNPCConversationMemory(): NPCConversationMemory {
  return new NPCConversationMemory();
}
