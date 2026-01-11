/**
 * NPCGossipManager - TIER 20 NPC-to-NPC Gossip System
 *
 * NPCs share information about player behavior, creating regional reputation.
 * Like Fallout's karma system combined with Skyrim's bounty system - your actions
 * in one location affect how NPCs in nearby areas perceive you.
 *
 * Features:
 * - Regional reputation tracking (per location/faction)
 * - Gossip spreading based on proximity
 * - Reputation decay over time
 * - Notable events that spread faster
 * - First impression modifiers based on reputation
 *
 * Example:
 * - Insult guard in Town A → Guards in Town B become wary
 * - Help merchant in Village → Other merchants become friendlier
 * - Threaten wizard → All wizards hear about it
 */

import type { DiscourseAct } from './DiscourseActRecognizer';

/**
 * Types of gossip events
 */
export type GossipEventType =
  | 'positive_interaction'   // Compliments, thanks, help
  | 'negative_interaction'   // Insults, threats, dismissals
  | 'notable_action'         // Something unusual/remarkable
  | 'reputation_milestone';  // Crossed reputation threshold

/**
 * A single gossip event
 */
export interface GossipEvent {
  eventId: string;
  timestamp: number;
  sourceNpcId: string;          // Who witnessed it
  playerAction: string;          // What the player did
  discourseAct: DiscourseAct;   // Type of interaction
  eventType: GossipEventType;
  severity: number;              // 0.0-1.0 (how notable)

  // Gossip spreading
  spreadRadius: number;          // How far the gossip spreads (0-3)
  spreadTo: Set<string>;         // NPCs who've heard this gossip
  expiresAt: number;             // When this gossip becomes stale
}

/**
 * Regional reputation score
 */
export interface RegionalReputation {
  regionId: string;              // Location ID or faction name
  reputationScore: number;       // -1.0 to 1.0
  tier: ReputationTier;

  // Gossip affecting this region
  recentGossip: GossipEvent[];   // Last 20 gossip events

  // Statistics
  positiveEvents: number;
  negativeEvents: number;
  notableEvents: number;

  lastUpdated: number;
}

/**
 * Reputation tiers
 */
export type ReputationTier =
  | 'vilified'     // -1.0 to -0.6: Hated across the region
  | 'shunned'      // -0.6 to -0.3: Disliked by most
  | 'unknown'      // -0.3 to 0.3: No reputation
  | 'accepted'     // 0.3 to 0.6: Liked by most
  | 'hero';        // 0.6 to 1.0: Revered across the region

/**
 * Manages gossip spreading and regional reputation
 */
export class NPCGossipManager {
  private gossipEvents: Map<string, GossipEvent> = new Map();
  private regionalReputation: Map<string, RegionalReputation> = new Map();

  // Configuration
  private readonly GOSSIP_DECAY_HOURS = 24;                    // Gossip expires after 24 hours
  private readonly REPUTATION_INFLUENCE_RATE = 0.05;           // Each gossip affects reputation by 5%
  private readonly NOTABLE_EVENT_THRESHOLD = 0.7;              // Events above 70% intensity are notable
  private readonly MAX_GOSSIP_PER_REGION = 20;                 // Keep last 20 gossip events

  // Discourse acts that spread gossip
  private readonly GOSSIP_WORTHY_ACTS: Partial<Record<DiscourseAct, {
    type: GossipEventType;
    severity: number;
    spreadRadius: number;
  }>> = {
    // Highly gossip-worthy (spread far)
    'THREAT': { type: 'negative_interaction', severity: 0.9, spreadRadius: 3 },
    'INSULT': { type: 'negative_interaction', severity: 0.8, spreadRadius: 2 },
    'DISMISSAL': { type: 'negative_interaction', severity: 0.7, spreadRadius: 2 },

    // Moderately gossip-worthy (spread to nearby)
    'COMPLIMENT': { type: 'positive_interaction', severity: 0.6, spreadRadius: 1 },
    'THANKS': { type: 'positive_interaction', severity: 0.5, spreadRadius: 1 },
    'OFFER': { type: 'positive_interaction', severity: 0.7, spreadRadius: 2 },
    'PROMISE': { type: 'positive_interaction', severity: 0.8, spreadRadius: 2 },

    // Notable acts (spread widely)
    'BRAGGING': { type: 'notable_action', severity: 0.6, spreadRadius: 2 },
    'FLIRTING': { type: 'notable_action', severity: 0.5, spreadRadius: 1 },
    'SARCASM': { type: 'negative_interaction', severity: 0.6, spreadRadius: 1 },
    'PLEADING': { type: 'notable_action', severity: 0.7, spreadRadius: 1 },

    // Very gossip-worthy (people talk about these)
    'APOLOGY': { type: 'positive_interaction', severity: 0.6, spreadRadius: 1 },
    'ENCOURAGEMENT': { type: 'positive_interaction', severity: 0.6, spreadRadius: 1 },
    'SYMPATHY': { type: 'positive_interaction', severity: 0.7, spreadRadius: 1 },
  };

  /**
   * Record a gossip-worthy event
   */
  recordGossipEvent(
    npcId: string,
    playerAction: string,
    discourseAct: DiscourseAct,
    intensity: number,
    regionId: string
  ): GossipEvent | null {
    const gossipConfig = this.GOSSIP_WORTHY_ACTS[discourseAct];

    // Not all discourse acts generate gossip
    if (!gossipConfig) {
      return null;
    }

    // Adjust severity based on intensity
    const actualSeverity = gossipConfig.severity * intensity;

    // Only record if significant enough
    if (actualSeverity < 0.3) {
      return null;
    }

    // Create gossip event
    const eventId = `gossip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const event: GossipEvent = {
      eventId,
      timestamp: Date.now(),
      sourceNpcId: npcId,
      playerAction,
      discourseAct,
      eventType: gossipConfig.type,
      severity: actualSeverity,
      spreadRadius: gossipConfig.spreadRadius,
      spreadTo: new Set([npcId]), // Source NPC knows immediately
      expiresAt: Date.now() + (this.GOSSIP_DECAY_HOURS * 60 * 60 * 1000),
    };

    this.gossipEvents.set(eventId, event);

    // Update regional reputation
    this.updateRegionalReputation(regionId, event);

    console.log(
      `[NPCGossipManager] New gossip: ${discourseAct} (severity: ${actualSeverity.toFixed(2)}, ` +
      `spread: ${gossipConfig.spreadRadius}, region: ${regionId})`
    );

    return event;
  }

  /**
   * Update regional reputation based on gossip event
   */
  private updateRegionalReputation(regionId: string, event: GossipEvent): void {
    const reputation = this.getRegionalReputation(regionId);

    // Calculate reputation change based on event type and severity
    let delta = 0;
    if (event.eventType === 'positive_interaction') {
      delta = this.REPUTATION_INFLUENCE_RATE * event.severity;
    } else if (event.eventType === 'negative_interaction') {
      delta = -this.REPUTATION_INFLUENCE_RATE * event.severity;
    }

    // Update reputation score (clamped to -1.0 to 1.0)
    const oldScore = reputation.reputationScore;
    reputation.reputationScore = Math.max(-1.0, Math.min(1.0, reputation.reputationScore + delta));
    reputation.tier = this.calculateReputationTier(reputation.reputationScore);
    reputation.lastUpdated = Date.now();

    // Add to recent gossip (keep last 20)
    reputation.recentGossip.unshift(event);
    if (reputation.recentGossip.length > this.MAX_GOSSIP_PER_REGION) {
      reputation.recentGossip.pop();
    }

    // Update statistics
    if (event.eventType === 'positive_interaction') {
      reputation.positiveEvents++;
    } else if (event.eventType === 'negative_interaction') {
      reputation.negativeEvents++;
    }

    if (event.severity >= this.NOTABLE_EVENT_THRESHOLD) {
      reputation.notableEvents++;
    }

    // Check for reputation milestone
    const oldTier = this.calculateReputationTier(oldScore);
    if (oldTier !== reputation.tier) {
      console.log(
        `[NPCGossipManager] Reputation milestone in ${regionId}: ${oldTier} → ${reputation.tier} ` +
        `(${oldScore.toFixed(2)} → ${reputation.reputationScore.toFixed(2)})`
      );
    }
  }

  /**
   * Get or create regional reputation
   */
  getRegionalReputation(regionId: string): RegionalReputation {
    if (!this.regionalReputation.has(regionId)) {
      this.regionalReputation.set(regionId, {
        regionId,
        reputationScore: 0.0,
        tier: 'unknown',
        recentGossip: [],
        positiveEvents: 0,
        negativeEvents: 0,
        notableEvents: 0,
        lastUpdated: Date.now(),
      });
    }

    return this.regionalReputation.get(regionId)!;
  }

  /**
   * Calculate reputation tier from score
   */
  private calculateReputationTier(score: number): ReputationTier {
    if (score <= -0.6) return 'vilified';
    if (score <= -0.3) return 'shunned';
    if (score <= 0.3) return 'unknown';
    if (score <= 0.6) return 'accepted';
    return 'hero';
  }

  /**
   * Spread gossip to nearby NPCs
   * Called when player moves between locations or time passes
   */
  spreadGossip(sourceRegionId: string, targetRegionIds: string[], npcIds: string[]): number {
    let spreadCount = 0;

    for (const [eventId, event] of this.gossipEvents) {
      // Skip expired gossip
      if (Date.now() > event.expiresAt) {
        continue;
      }

      // Check if gossip can reach target regions (based on spread radius)
      for (const targetRegion of targetRegionIds) {
        // Gossip spreads to nearby regions based on radius
        // For now, simple check: radius > 0 means it spreads
        if (event.spreadRadius > 0) {
          // Spread to NPCs in target region
          for (const npcId of npcIds) {
            if (!event.spreadTo.has(npcId)) {
              event.spreadTo.add(npcId);
              spreadCount++;
            }
          }

          // Update target region's reputation (diluted effect)
          const targetReputation = this.getRegionalReputation(targetRegion);
          const dilutedDelta = (event.eventType === 'positive_interaction' ? 1 : -1) *
                               this.REPUTATION_INFLUENCE_RATE * event.severity * 0.3; // 30% effect

          targetReputation.reputationScore = Math.max(-1.0, Math.min(1.0,
            targetReputation.reputationScore + dilutedDelta
          ));
          targetReputation.tier = this.calculateReputationTier(targetReputation.reputationScore);
        }
      }
    }

    if (spreadCount > 0) {
      console.log(`[NPCGossipManager] Spread gossip to ${spreadCount} NPCs across ${targetRegionIds.length} regions`);
    }

    return spreadCount;
  }

  /**
   * Check if an NPC has heard gossip about the player
   */
  hasHeardGossip(npcId: string, eventId: string): boolean {
    const event = this.gossipEvents.get(eventId);
    return event ? event.spreadTo.has(npcId) : false;
  }

  /**
   * Get all gossip events an NPC has heard
   */
  getGossipHeardBy(npcId: string): GossipEvent[] {
    const heardGossip: GossipEvent[] = [];

    for (const event of this.gossipEvents.values()) {
      if (event.spreadTo.has(npcId) && Date.now() <= event.expiresAt) {
        heardGossip.push(event);
      }
    }

    return heardGossip.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get reputation modifier for first impressions
   * NPCs who've heard gossip will have biased first impressions
   */
  getFirstImpressionModifier(npcId: string, regionId: string): {
    modifier: number;
    reason: string;
  } {
    const reputation = this.getRegionalReputation(regionId);
    const heardGossip = this.getGossipHeardBy(npcId);

    // No gossip heard = neutral first impression
    if (heardGossip.length === 0) {
      return { modifier: 0, reason: 'no reputation' };
    }

    // Calculate modifier based on reputation tier
    let modifier = 0;
    let reason = '';

    switch (reputation.tier) {
      case 'hero':
        modifier = 0.3;
        reason = 'hero reputation';
        break;
      case 'accepted':
        modifier = 0.15;
        reason = 'positive reputation';
        break;
      case 'unknown':
        modifier = 0;
        reason = 'neutral reputation';
        break;
      case 'shunned':
        modifier = -0.15;
        reason = 'negative reputation';
        break;
      case 'vilified':
        modifier = -0.3;
        reason = 'terrible reputation';
        break;
    }

    return { modifier, reason };
  }

  /**
   * Clean up expired gossip events
   */
  cleanupExpiredGossip(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [eventId, event] of this.gossipEvents) {
      if (now > event.expiresAt) {
        this.gossipEvents.delete(eventId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[NPCGossipManager] Cleaned up ${cleanedCount} expired gossip events`);
    }

    return cleanedCount;
  }

  /**
   * Get reputation description for player feedback
   */
  getReputationDescription(regionId: string): string {
    const reputation = this.getRegionalReputation(regionId);

    switch (reputation.tier) {
      case 'hero':
        return 'You are revered as a hero in this region';
      case 'accepted':
        return 'You are well-liked in this region';
      case 'unknown':
        return 'You are unknown in this region';
      case 'shunned':
        return 'You are viewed with suspicion in this region';
      case 'vilified':
        return 'You are despised in this region';
    }
  }

  /**
   * Get most notable recent gossip about player
   */
  getMostNotableGossip(regionId: string): GossipEvent | null {
    const reputation = this.getRegionalReputation(regionId);

    if (reputation.recentGossip.length === 0) {
      return null;
    }

    // Find most severe recent gossip
    return reputation.recentGossip.reduce((most, current) =>
      current.severity > most.severity ? current : most
    );
  }

  /**
   * Get all regional reputations (for debugging/UI)
   */
  getAllReputations(): Map<string, RegionalReputation> {
    return this.regionalReputation;
  }

  /**
   * Reset reputation in a specific region
   */
  resetRegionalReputation(regionId: string): void {
    this.regionalReputation.delete(regionId);
    console.log(`[NPCGossipManager] Reset reputation in ${regionId}`);
  }
}

/**
 * Factory function for easy instantiation
 */
export function createNPCGossipManager(): NPCGossipManager {
  return new NPCGossipManager();
}
