/**
 * NPCRelationshipManager - TIER 20 Façade-style Relationship Tracking
 *
 * Tracks how NPCs feel about the player based on discourse acts.
 * Like Façade, NPCs remember your actions and their feelings evolve over time.
 *
 * Features:
 * - Relationship scores (-1.0 to 1.0)
 * - Emotional memory (recent interactions)
 * - Conversation history tracking
 * - Dynamic relationship tiers (hostile, unfriendly, neutral, friendly, allied)
 */

import type { DiscourseAct, DiscourseAnalysis } from './DiscourseActRecognizer';

/**
 * Relationship tier determines NPC behavior
 */
export type RelationshipTier =
  | 'hostile'      // -1.0 to -0.6: NPC actively dislikes player
  | 'unfriendly'   // -0.6 to -0.2: NPC is cold/distant
  | 'neutral'      // -0.2 to 0.2: NPC is indifferent
  | 'friendly'     // 0.2 to 0.6: NPC likes player
  | 'allied';      // 0.6 to 1.0: NPC trusts and respects player

/**
 * Individual interaction record
 */
export interface InteractionRecord {
  timestamp: number;
  discourseAct: DiscourseAct;
  sentiment: 'positive' | 'negative' | 'neutral';
  intensity: number;
  relationshipDelta: number;  // How much this changed the relationship
  playerInput: string;
}

/**
 * NPC's relationship state with the player
 */
export interface NPCRelationship {
  npcId: string;
  relationshipScore: number;  // -1.0 (hate) to 1.0 (love)
  tier: RelationshipTier;

  // Emotional memory (last 10 interactions)
  recentInteractions: InteractionRecord[];

  // Statistics
  totalInteractions: number;
  complimentsReceived: number;
  insultsReceived: number;
  threatsReceived: number;
  helpOffered: number;

  // Conversation tracking
  topicsDiscussed: Set<string>;
  lastInteractionTime: number;
}

/**
 * Manages relationships between player and all NPCs
 */
export class NPCRelationshipManager {
  private relationships: Map<string, NPCRelationship> = new Map();

  // TIER 20: Relationship decay/growth configuration
  private readonly DECAY_RATE_PER_DAY = 0.05;        // Positive relationships decay 5% per day
  private readonly RECOVERY_RATE_PER_DAY = 0.03;     // Negative relationships recover 3% per day
  private readonly DECAY_THRESHOLD = 0.2;             // Only decay relationships above neutral
  private readonly RECOVERY_THRESHOLD = -0.2;         // Only recover relationships below neutral
  private readonly MIN_TIME_BETWEEN_DECAY_MS = 1000 * 60 * 60; // 1 hour minimum between decay checks

  // Configurable relationship change rates
  private readonly INTERACTION_WEIGHTS: Record<DiscourseAct, number> = {
    // Positive interactions
    'COMPLIMENT': 0.15,
    'THANKS': 0.08,
    'ENCOURAGEMENT': 0.10,
    'SYMPATHY': 0.12,
    'APOLOGY': 0.10,
    'OFFER': 0.12,
    'PROMISE': 0.15,
    'REASSURANCE': 0.08,
    'GREETING': 0.03,
    'FAREWELL': 0.02,
    'INTRODUCTION': 0.05,
    'SMALL_TALK': 0.03,
    'EXCITEMENT': 0.05,

    // Negative interactions
    'INSULT': -0.25,
    'THREAT': -0.30,
    'PROHIBITION': -0.12,
    'COMPLAINT': -0.08,
    'FRUSTRATION': -0.10,
    'DISAGREEMENT': -0.05,

    // Neutral interactions
    'QUESTION_WHO': 0.00,
    'QUESTION_WHAT': 0.00,
    'QUESTION_WHERE': 0.00,
    'QUESTION_WHY': 0.00,
    'QUESTION_HOW': 0.00,
    'QUESTION_WHEN': 0.00,
    'QUESTION_YESNO': 0.00,
    'STATEMENT_FACT': 0.00,
    'STATEMENT_OPINION': 0.00,
    'STATEMENT_FEELING': 0.02,
    'STATEMENT_BELIEF': 0.00,
    'STATEMENT_MEMORY': 0.00,
    'AGREEMENT': 0.05,
    'CONFIRMATION': 0.00,
    'DOUBT': -0.02,
    'ACCEPTANCE': 0.03,
    'REQUEST': 0.00,
    'COMMAND': -0.05,
    'SUGGESTION': 0.03,
    'INVITATION': 0.08,
    'PERMISSION': 0.02,
    'TOPIC_CHANGE': 0.00,
    'TOPIC_CALLBACK': 0.00,
    'CLARIFICATION': 0.00,
    'ACKNOWLEDGMENT': 0.02,
    'INTERRUPTION': -0.03,
    'WARNING': 0.00,
    'CONCERN': 0.08,

    // TIER 20 Expansion: Complex Social Dynamics
    'SARCASM': -0.15,       // Sarcasm hurts relationships
    'FLIRTING': 0.10,       // Flirting can be flattering (context dependent)
    'BRAGGING': -0.08,      // Bragging is off-putting
    'TEASING': -0.05,       // Light teasing slightly negative
    'PLEADING': 0.05,       // Desperation can evoke sympathy
    'DISMISSAL': -0.20,     // Dismissal is very negative
    'SURPRISE': 0.00,       // Surprise is neutral
    'RELIEF': 0.05,         // Expressing relief is slightly positive
    'CURIOSITY': 0.08,      // Showing interest is positive
    'NOSTALGIA': 0.03,      // Nostalgia creates connection
  };

  /**
   * Initialize or get relationship with an NPC
   */
  getRelationship(npcId: string): NPCRelationship {
    if (!this.relationships.has(npcId)) {
      this.relationships.set(npcId, {
        npcId,
        relationshipScore: 0.0,
        tier: 'neutral',
        recentInteractions: [],
        totalInteractions: 0,
        complimentsReceived: 0,
        insultsReceived: 0,
        threatsReceived: 0,
        helpOffered: 0,
        topicsDiscussed: new Set(),
        lastInteractionTime: Date.now(),
      });
    }

    return this.relationships.get(npcId)!;
  }

  /**
   * Record a new interaction and update relationship
   */
  recordInteraction(
    npcId: string,
    discourse: DiscourseAnalysis,
    playerInput: string
  ): NPCRelationship {
    const relationship = this.getRelationship(npcId);

    // Store old score for milestone detection
    const oldScore = relationship.relationshipScore;

    // Calculate relationship change
    const baseWeight = this.INTERACTION_WEIGHTS[discourse.primary] || 0;
    const intensityMultiplier = discourse.intensity;
    const relationshipDelta = baseWeight * intensityMultiplier;

    // Update relationship score (clamped to -1.0 to 1.0)
    relationship.relationshipScore = Math.max(
      -1.0,
      Math.min(1.0, relationship.relationshipScore + relationshipDelta)
    );

    // Update tier based on new score
    const oldTier = relationship.tier;
    relationship.tier = this.calculateTier(relationship.relationshipScore);

    // TIER 20: Check for milestone and log it
    if (oldTier !== relationship.tier) {
      const milestone = this.checkForMilestone(npcId, oldScore, relationship.relationshipScore);
      if (milestone.crossed) {
        console.log(
          `[NPCRelationshipManager] ${npcId}: MILESTONE - ${milestone.oldTier} → ${milestone.newTier} (${milestone.direction})`
        );
      }
    }

    // Create interaction record
    const record: InteractionRecord = {
      timestamp: Date.now(),
      discourseAct: discourse.primary,
      sentiment: discourse.sentiment,
      intensity: discourse.intensity,
      relationshipDelta,
      playerInput,
    };

    // Add to recent interactions (keep last 10)
    relationship.recentInteractions.unshift(record);
    if (relationship.recentInteractions.length > 10) {
      relationship.recentInteractions.pop();
    }

    // Update statistics
    relationship.totalInteractions++;
    relationship.lastInteractionTime = Date.now();

    if (discourse.primary === 'COMPLIMENT') relationship.complimentsReceived++;
    if (discourse.primary === 'INSULT') relationship.insultsReceived++;
    if (discourse.primary === 'THREAT') relationship.threatsReceived++;
    if (discourse.primary === 'OFFER') relationship.helpOffered++;

    // Track topics
    discourse.topicReferences.forEach(topic => {
      relationship.topicsDiscussed.add(topic);
    });

    console.log(
      `[NPCRelationshipManager] ${npcId}: ${discourse.primary} (${relationshipDelta >= 0 ? '+' : ''}${relationshipDelta.toFixed(2)}) → ` +
      `Score: ${relationship.relationshipScore.toFixed(2)} (${relationship.tier})`
    );

    return relationship;
  }

  /**
   * Calculate relationship tier from score
   */
  private calculateTier(score: number): RelationshipTier {
    if (score <= -0.6) return 'hostile';
    if (score <= -0.2) return 'unfriendly';
    if (score <= 0.2) return 'neutral';
    if (score <= 0.6) return 'friendly';
    return 'allied';
  }

  /**
   * Get recent interaction summary
   */
  getRecentInteractionsSummary(npcId: string): string {
    const relationship = this.getRelationship(npcId);

    if (relationship.recentInteractions.length === 0) {
      return 'No previous interactions';
    }

    const positive = relationship.recentInteractions.filter(i => i.relationshipDelta > 0).length;
    const negative = relationship.recentInteractions.filter(i => i.relationshipDelta < 0).length;
    const neutral = relationship.recentInteractions.length - positive - negative;

    return `Recent: ${positive} positive, ${negative} negative, ${neutral} neutral interactions`;
  }

  /**
   * Check if NPC remembers specific discourse act type
   */
  hasReceivedDiscourseAct(npcId: string, act: DiscourseAct): boolean {
    const relationship = this.getRelationship(npcId);
    return relationship.recentInteractions.some(i => i.discourseAct === act);
  }

  /**
   * Get time since last interaction (in seconds)
   */
  getTimeSinceLastInteraction(npcId: string): number {
    const relationship = this.getRelationship(npcId);
    return (Date.now() - relationship.lastInteractionTime) / 1000;
  }

  /**
   * Get all relationships (for debugging/analytics)
   */
  getAllRelationships(): Map<string, NPCRelationship> {
    return this.relationships;
  }

  /**
   * Reset relationship with specific NPC
   */
  resetRelationship(npcId: string): void {
    this.relationships.delete(npcId);
    console.log(`[NPCRelationshipManager] Reset relationship with ${npcId}`);
  }

  /**
   * Get relationship modifier for response generation
   * Returns a multiplier for response intensity based on relationship
   */
  getResponseModifier(npcId: string): number {
    const relationship = this.getRelationship(npcId);

    switch (relationship.tier) {
      case 'hostile': return -0.5;   // Much colder responses
      case 'unfriendly': return -0.2; // Slightly cold
      case 'neutral': return 0.0;     // Standard responses
      case 'friendly': return 0.2;    // Warmer responses
      case 'allied': return 0.5;      // Very warm responses
      default: return 0.0;
    }
  }

  /**
   * Check if NPC should refuse to interact based on relationship
   */
  shouldRefuseInteraction(npcId: string): boolean {
    const relationship = this.getRelationship(npcId);

    // NPCs become hostile and may refuse interaction if relationship is very negative
    // AND they've received threats or multiple insults recently
    if (relationship.tier === 'hostile') {
      const recentThreats = relationship.recentInteractions
        .slice(0, 5)
        .filter(i => i.discourseAct === 'THREAT' || i.discourseAct === 'INSULT')
        .length;

      return recentThreats >= 2;
    }

    return false;
  }

  /**
   * Get a descriptive status of the relationship
   */
  getRelationshipDescription(npcId: string): string {
    const relationship = this.getRelationship(npcId);
    const score = relationship.relationshipScore;

    if (score >= 0.8) return 'deeply trusts you';
    if (score >= 0.6) return 'considers you a friend';
    if (score >= 0.4) return 'likes you';
    if (score >= 0.2) return 'is friendly toward you';
    if (score >= -0.2) return 'is neutral toward you';
    if (score >= -0.4) return 'is wary of you';
    if (score >= -0.6) return 'dislikes you';
    if (score >= -0.8) return 'strongly dislikes you';
    return 'is hostile toward you';
  }

  /**
   * TIER 20: Apply relationship decay/growth based on time passed
   * Positive relationships decay if not maintained
   * Negative relationships slowly recover over time
   */
  applyRelationshipDecay(npcId: string): { changed: boolean; delta: number; reason: string } {
    const relationship = this.getRelationship(npcId);
    const timeSinceLastInteraction = Date.now() - relationship.lastInteractionTime;

    // Only apply decay if enough time has passed (1 hour minimum)
    if (timeSinceLastInteraction < this.MIN_TIME_BETWEEN_DECAY_MS) {
      return { changed: false, delta: 0, reason: 'not enough time passed' };
    }

    const daysPassed = timeSinceLastInteraction / (1000 * 60 * 60 * 24);
    const oldScore = relationship.relationshipScore;
    let delta = 0;
    let reason = '';

    // Positive relationships decay (friendships require maintenance)
    if (relationship.relationshipScore > this.DECAY_THRESHOLD) {
      delta = -this.DECAY_RATE_PER_DAY * daysPassed;
      const newScore = Math.max(this.DECAY_THRESHOLD, relationship.relationshipScore + delta);
      delta = newScore - oldScore;
      relationship.relationshipScore = newScore;
      relationship.tier = this.calculateTier(relationship.relationshipScore);
      reason = 'friendship neglect';

      console.log(
        `[NPCRelationshipManager] ${npcId}: Relationship decayed (${daysPassed.toFixed(1)} days) ` +
        `${oldScore.toFixed(2)} → ${relationship.relationshipScore.toFixed(2)} (${reason})`
      );

      return { changed: true, delta, reason };
    }

    // Negative relationships recover (grudges fade over time)
    else if (relationship.relationshipScore < this.RECOVERY_THRESHOLD) {
      delta = this.RECOVERY_RATE_PER_DAY * daysPassed;
      const newScore = Math.min(this.RECOVERY_THRESHOLD, relationship.relationshipScore + delta);
      delta = newScore - oldScore;
      relationship.relationshipScore = newScore;
      relationship.tier = this.calculateTier(relationship.relationshipScore);
      reason = 'grudge fading';

      console.log(
        `[NPCRelationshipManager] ${npcId}: Relationship recovered (${daysPassed.toFixed(1)} days) ` +
        `${oldScore.toFixed(2)} → ${relationship.relationshipScore.toFixed(2)} (${reason})`
      );

      return { changed: true, delta, reason };
    }

    // Neutral relationships don't change
    return { changed: false, delta: 0, reason: 'already neutral' };
  }

  /**
   * TIER 20: Apply decay/growth to all NPCs
   * Called periodically by the game engine
   */
  applyDecayToAllNPCs(): Map<string, { delta: number; reason: string }> {
    const changes = new Map<string, { delta: number; reason: string }>();

    for (const [npcId, _] of this.relationships) {
      const result = this.applyRelationshipDecay(npcId);
      if (result.changed) {
        changes.set(npcId, { delta: result.delta, reason: result.reason });
      }
    }

    if (changes.size > 0) {
      console.log(`[NPCRelationshipManager] Applied decay/growth to ${changes.size} NPCs`);
    }

    return changes;
  }

  /**
   * TIER 20: Check if relationship crossed a tier boundary (milestone)
   * Returns the tier that was crossed (if any)
   */
  checkForMilestone(npcId: string, oldScore: number, newScore: number): {
    crossed: boolean;
    oldTier: RelationshipTier;
    newTier: RelationshipTier;
    direction: 'improved' | 'worsened' | 'none';
  } {
    const oldTier = this.calculateTier(oldScore);
    const newTier = this.calculateTier(newScore);

    if (oldTier === newTier) {
      return { crossed: false, oldTier, newTier, direction: 'none' };
    }

    // Determine if relationship improved or worsened
    const tierOrder: RelationshipTier[] = ['hostile', 'unfriendly', 'neutral', 'friendly', 'allied'];
    const oldIndex = tierOrder.indexOf(oldTier);
    const newIndex = tierOrder.indexOf(newTier);
    const direction = newIndex > oldIndex ? 'improved' : 'worsened';

    console.log(
      `[NPCRelationshipManager] ${npcId}: Relationship milestone - ${oldTier} → ${newTier} (${direction})`
    );

    return { crossed: true, oldTier, newTier, direction };
  }

  /**
   * TIER 20: Get days until next decay/recovery event
   */
  getDaysUntilNextChange(npcId: string): number | null {
    const relationship = this.getRelationship(npcId);

    // No change if neutral
    if (relationship.relationshipScore >= this.RECOVERY_THRESHOLD &&
        relationship.relationshipScore <= this.DECAY_THRESHOLD) {
      return null;
    }

    const timeSinceLastInteraction = Date.now() - relationship.lastInteractionTime;
    const hoursUntilNextDecay = Math.max(0, (this.MIN_TIME_BETWEEN_DECAY_MS - timeSinceLastInteraction) / (1000 * 60 * 60));

    return hoursUntilNextDecay / 24;
  }
}

/**
 * Factory function for easy instantiation
 */
export function createNPCRelationshipManager(): NPCRelationshipManager {
  return new NPCRelationshipManager();
}
