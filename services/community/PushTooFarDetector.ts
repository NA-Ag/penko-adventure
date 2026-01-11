/**
 * FACADE 6.8: Push-Too-Far Detection
 *
 * Tracks repeated negative player actions and triggers major reactions
 * when NPCs' tolerance thresholds are crossed.
 *
 * Features:
 * - Track offensive actions (insults, thefts, attacks, etc.)
 * - Per-NPC tolerance thresholds
 * - Time-based decay of offenses
 * - Threshold-based reactions
 * - Multiple offense types with different weights
 * - Forgiveness and reputation recovery
 * - Warning system before threshold breach
 */

import { WorkingMemory, IWME } from '../WorkingMemory';

/**
 * Types of offensive actions that can push NPCs too far
 */
export enum OffenseType {
  INSULT = 'insult',
  THEFT = 'theft',
  ATTACK = 'attack',
  TRESPASS = 'trespass',
  INTIMIDATION = 'intimidation',
  LYING = 'lying',
  BREAKING_PROMISE = 'breaking_promise',
  RUDENESS = 'rudeness',
  IGNORING = 'ignoring',
  PROPERTY_DAMAGE = 'property_damage',
  BETRAYAL = 'betrayal',
  HARASSMENT = 'harassment'
}

/**
 * A recorded offense committed by a character
 */
export interface Offense {
  type: OffenseType;
  offender: string;
  victim: string;
  severity: number; // 0.0-1.0, how bad was it?
  timestamp: number;
  description?: string;
  witnessed?: boolean; // Did the victim see it happen?
}

/**
 * Threshold configuration for when an NPC has had enough
 */
export interface ToleranceThreshold {
  name: string;
  minOffenseCount?: number; // Minimum number of offenses
  minTotalSeverity?: number; // Minimum total severity score
  withinTimeWindow?: number; // Offenses must be within this time (ms)
  offenseTypes?: OffenseType[]; // Only count these types
  reaction: ThresholdReaction;
  priority: number; // Higher priority thresholds checked first
}

/**
 * What happens when a threshold is crossed
 */
export interface ThresholdReaction {
  id: string;
  description: string;
  execute: (victim: string, offender: string, offenses: Offense[], wm: WorkingMemory) => void;
  permanent?: boolean; // Does this permanently change relationship?
}

/**
 * NPC's tolerance configuration
 */
export interface NPCTolerance {
  npcId: string;
  basePatience: number; // 0.0-1.0, how patient is this NPC?
  offenseWeights: Map<OffenseType, number>; // Multipliers for different offense types
  thresholds: ToleranceThreshold[];
  decayRate: number; // How fast do offenses fade (per ms)
  forgiveness: number; // 0.0-1.0, willingness to forgive
  remembersForever: boolean; // Never forgets offenses
}

/**
 * Warning given before threshold is crossed
 */
export interface ToleranceWarning {
  victim: string;
  offender: string;
  threshold: ToleranceThreshold;
  currentProgress: number; // How close to threshold (0.0-1.0)
  message: string;
  timestamp: number;
}

/**
 * Tracks repeated offenses and triggers reactions when thresholds are crossed
 */
export class PushTooFarDetector {
  private offenses: Map<string, Offense[]> = new Map(); // victim -> offenses against them
  private tolerances: Map<string, NPCTolerance> = new Map(); // npcId -> tolerance config
  private breachedThresholds: Map<string, Set<string>> = new Map(); // victim -> set of threshold IDs
  private warnings: ToleranceWarning[] = [];
  private workingMemory?: WorkingMemory;

  constructor(private currentTime: () => number = Date.now) {}

  /**
   * Set the working memory instance for WME updates
   */
  setWorkingMemory(wm: WorkingMemory): void {
    this.workingMemory = wm;
  }

  /**
   * Configure tolerance for an NPC
   */
  setTolerance(tolerance: NPCTolerance): void {
    this.tolerances.set(tolerance.npcId, tolerance);
  }

  /**
   * Get an NPC's tolerance configuration
   */
  getTolerance(npcId: string): NPCTolerance | undefined {
    return this.tolerances.get(npcId);
  }

  /**
   * Record an offense
   */
  recordOffense(offense: Offense): void {
    const key = offense.victim;

    if (!this.offenses.has(key)) {
      this.offenses.set(key, []);
    }

    this.offenses.get(key)!.push(offense);

    // Check if this offense crosses any thresholds
    this.checkThresholds(offense.victim, offense.offender);

    // Add offense WME to working memory
    if (this.workingMemory) {
      this.workingMemory.addWME({
        type: 'Offense',
        id: `offense_${this.currentTime()}_${Math.random()}`,
        attributes: new Map([
          ['offenseType', offense.type],
          ['offender', offense.offender],
          ['victim', offense.victim],
          ['severity', offense.severity],
          ['timestamp', offense.timestamp],
          ['description', offense.description || ''],
          ['witnessed', offense.witnessed || false]
        ])
      });
    }
  }

  /**
   * Get all offenses by an offender against a victim
   */
  getOffenses(victim: string, offender?: string): Offense[] {
    const offenses = this.offenses.get(victim) || [];

    if (offender) {
      return offenses.filter(o => o.offender === offender);
    }

    return offenses;
  }

  /**
   * Get offenses within a time window, adjusted for decay
   */
  getRecentOffenses(
    victim: string,
    offender: string,
    timeWindow?: number
  ): Offense[] {
    const offenses = this.getOffenses(victim, offender);
    const now = this.currentTime();

    if (timeWindow) {
      return offenses.filter(o => now - o.timestamp <= timeWindow);
    }

    return offenses;
  }

  /**
   * Calculate effective severity with decay
   */
  calculateEffectiveSeverity(offense: Offense, tolerance: NPCTolerance): number {
    if (tolerance.remembersForever) {
      return offense.severity;
    }

    const age = this.currentTime() - offense.timestamp;
    const decay = Math.exp(-tolerance.decayRate * age);
    const weight = tolerance.offenseWeights.get(offense.type) || 1.0;

    return offense.severity * weight * decay;
  }

  /**
   * Calculate total severity score for offenses
   */
  getTotalSeverity(
    victim: string,
    offender: string,
    offenseTypes?: OffenseType[],
    timeWindow?: number
  ): number {
    const tolerance = this.tolerances.get(victim);
    if (!tolerance) return 0;

    let offenses = this.getRecentOffenses(victim, offender, timeWindow);

    if (offenseTypes) {
      offenses = offenses.filter(o => offenseTypes.includes(o.type));
    }

    return offenses.reduce((sum, offense) => {
      return sum + this.calculateEffectiveSeverity(offense, tolerance);
    }, 0);
  }

  /**
   * Check if threshold conditions are met
   */
  private isThresholdMet(
    threshold: ToleranceThreshold,
    victim: string,
    offender: string
  ): boolean {
    const offenses = this.getRecentOffenses(
      victim,
      offender,
      threshold.withinTimeWindow
    );

    let relevantOffenses = offenses;
    if (threshold.offenseTypes) {
      relevantOffenses = offenses.filter(o =>
        threshold.offenseTypes!.includes(o.type)
      );
    }

    // Check minimum count
    if (threshold.minOffenseCount !== undefined) {
      if (relevantOffenses.length < threshold.minOffenseCount) {
        return false;
      }
    }

    // Check minimum severity
    if (threshold.minTotalSeverity !== undefined) {
      const totalSeverity = this.getTotalSeverity(
        victim,
        offender,
        threshold.offenseTypes,
        threshold.withinTimeWindow
      );

      if (totalSeverity < threshold.minTotalSeverity) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check all thresholds for a victim-offender pair
   */
  private checkThresholds(victim: string, offender: string): void {
    const tolerance = this.tolerances.get(victim);
    if (!tolerance) return;

    // Get set of already breached thresholds
    const key = `${victim}:${offender}`;
    if (!this.breachedThresholds.has(key)) {
      this.breachedThresholds.set(key, new Set());
    }
    const breached = this.breachedThresholds.get(key)!;

    // Sort thresholds by priority
    const sortedThresholds = [...tolerance.thresholds].sort(
      (a, b) => b.priority - a.priority
    );

    for (const threshold of sortedThresholds) {
      // Skip if already breached
      if (breached.has(threshold.name)) {
        continue;
      }

      if (this.isThresholdMet(threshold, victim, offender)) {
        // Threshold crossed!
        breached.add(threshold.name);

        const offenses = this.getRecentOffenses(
          victim,
          offender,
          threshold.withinTimeWindow
        );

        // Execute reaction
        if (this.workingMemory) {
          threshold.reaction.execute(victim, offender, offenses, this.workingMemory);
        }

        // Add threshold breach WME
        if (this.workingMemory) {
          this.workingMemory.addWME({
            type: 'ThresholdBreach',
            id: `breach_${this.currentTime()}_${Math.random()}`,
            attributes: new Map([
              ['victim', victim],
              ['offender', offender],
              ['threshold', threshold.name],
              ['reactionId', threshold.reaction.id],
              ['permanent', threshold.reaction.permanent || false],
              ['timestamp', this.currentTime()]
            ])
          });
        }
      }
    }
  }

  /**
   * Check proximity to threshold and generate warnings
   */
  checkForWarnings(victim: string, offender: string): ToleranceWarning | undefined {
    const tolerance = this.tolerances.get(victim);
    if (!tolerance) return undefined;

    const key = `${victim}:${offender}`;
    const breached = this.breachedThresholds.get(key) || new Set();

    // Find the highest priority unbreached threshold
    const sortedThresholds = [...tolerance.thresholds]
      .filter(t => !breached.has(t.name))
      .sort((a, b) => b.priority - a.priority);

    for (const threshold of sortedThresholds) {
      const progress = this.getThresholdProgress(threshold, victim, offender);

      // Warn when 70% of the way there
      if (progress >= 0.7 && progress < 1.0) {
        const warning: ToleranceWarning = {
          victim,
          offender,
          threshold,
          currentProgress: progress,
          message: this.generateWarningMessage(victim, offender, threshold, progress),
          timestamp: this.currentTime()
        };

        this.warnings.push(warning);
        return warning;
      }
    }

    return undefined;
  }

  /**
   * Calculate progress toward threshold (0.0-1.0)
   */
  getThresholdProgress(
    threshold: ToleranceThreshold,
    victim: string,
    offender: string
  ): number {
    let progress = 0;

    const offenses = this.getRecentOffenses(
      victim,
      offender,
      threshold.withinTimeWindow
    );

    let relevantOffenses = offenses;
    if (threshold.offenseTypes) {
      relevantOffenses = offenses.filter(o =>
        threshold.offenseTypes!.includes(o.type)
      );
    }

    // Calculate based on count
    if (threshold.minOffenseCount !== undefined) {
      const countProgress = relevantOffenses.length / threshold.minOffenseCount;
      progress = Math.max(progress, countProgress);
    }

    // Calculate based on severity
    if (threshold.minTotalSeverity !== undefined) {
      const totalSeverity = this.getTotalSeverity(
        victim,
        offender,
        threshold.offenseTypes,
        threshold.withinTimeWindow
      );
      const severityProgress = totalSeverity / threshold.minTotalSeverity;
      progress = Math.max(progress, severityProgress);
    }

    return Math.min(progress, 1.0);
  }

  /**
   * Generate a warning message
   */
  private generateWarningMessage(
    victim: string,
    offender: string,
    threshold: ToleranceThreshold,
    progress: number
  ): string {
    if (progress >= 0.9) {
      return `${victim} is at their breaking point with ${offender}!`;
    } else if (progress >= 0.8) {
      return `${victim} is getting very angry with ${offender}.`;
    } else {
      return `${victim} is losing patience with ${offender}.`;
    }
  }

  /**
   * Get recent warnings
   */
  getWarnings(since?: number): ToleranceWarning[] {
    if (since !== undefined) {
      return this.warnings.filter(w => w.timestamp >= since);
    }
    return this.warnings;
  }

  /**
   * Check if a threshold has been breached
   */
  hasBreachedThreshold(victim: string, offender: string, thresholdName: string): boolean {
    const key = `${victim}:${offender}`;
    const breached = this.breachedThresholds.get(key);
    return breached?.has(thresholdName) || false;
  }

  /**
   * Apply forgiveness - reduce severity of past offenses
   */
  forgive(victim: string, offender: string, amount: number = 1.0): void {
    const offenses = this.getOffenses(victim, offender);

    for (const offense of offenses) {
      offense.severity *= (1.0 - amount);
    }

    // Clear warnings
    this.warnings = this.warnings.filter(
      w => !(w.victim === victim && w.offender === offender)
    );

    // Optionally clear some breached thresholds if fully forgiven
    if (amount >= 1.0) {
      const key = `${victim}:${offender}`;
      this.breachedThresholds.delete(key);
    }

    // Add forgiveness WME
    if (this.workingMemory) {
      this.workingMemory.addWME({
        type: 'Forgiveness',
        id: `forgiveness_${this.currentTime()}_${Math.random()}`,
        attributes: new Map([
          ['victim', victim],
          ['offender', offender],
          ['amount', amount],
          ['timestamp', this.currentTime()]
        ])
      });
    }
  }

  /**
   * Clear all offenses for a victim-offender pair
   */
  clearOffenses(victim: string, offender?: string): void {
    if (offender) {
      const offenses = this.offenses.get(victim);
      if (offenses) {
        this.offenses.set(
          victim,
          offenses.filter(o => o.offender !== offender)
        );
      }

      const key = `${victim}:${offender}`;
      this.breachedThresholds.delete(key);
    } else {
      this.offenses.delete(victim);
      // Clear all breaches for this victim
      for (const key of this.breachedThresholds.keys()) {
        if (key.startsWith(`${victim}:`)) {
          this.breachedThresholds.delete(key);
        }
      }
    }
  }

  /**
   * Get relationship status based on offenses
   */
  getRelationshipStatus(victim: string, offender: string): {
    offenseCount: number;
    totalSeverity: number;
    nearestThreshold?: ToleranceThreshold;
    progress: number;
    status: 'friendly' | 'neutral' | 'annoyed' | 'angry' | 'hostile';
  } {
    const offenses = this.getOffenses(victim, offender);
    const totalSeverity = this.getTotalSeverity(victim, offender);

    const tolerance = this.tolerances.get(victim);
    let nearestThreshold: ToleranceThreshold | undefined;
    let maxProgress = 0;

    if (tolerance) {
      const key = `${victim}:${offender}`;
      const breached = this.breachedThresholds.get(key) || new Set();

      for (const threshold of tolerance.thresholds) {
        if (!breached.has(threshold.name)) {
          const progress = this.getThresholdProgress(threshold, victim, offender);
          if (progress > maxProgress) {
            maxProgress = progress;
            nearestThreshold = threshold;
          }
        }
      }
    }

    let status: 'friendly' | 'neutral' | 'annoyed' | 'angry' | 'hostile' = 'neutral';
    if (maxProgress >= 1.0) {
      status = 'hostile';
    } else if (maxProgress >= 0.8) {
      status = 'angry';
    } else if (maxProgress >= 0.5) {
      status = 'annoyed';
    } else if (totalSeverity === 0) {
      status = 'friendly';
    }

    return {
      offenseCount: offenses.length,
      totalSeverity,
      nearestThreshold,
      progress: maxProgress,
      status
    };
  }

  /**
   * Decay old offenses based on NPC's decay rate
   */
  applyDecay(): void {
    for (const [victim, tolerance] of this.tolerances.entries()) {
      if (tolerance.remembersForever) continue;

      const offenses = this.offenses.get(victim) || [];

      // Recalculate effective severities and remove negligible offenses
      this.offenses.set(
        victim,
        offenses.filter(offense => {
          const effectiveSeverity = this.calculateEffectiveSeverity(offense, tolerance);
          return effectiveSeverity > 0.01; // Remove if decayed below 1%
        })
      );
    }
  }

  /**
   * Get summary of all relationship statuses for an NPC
   */
  getAllRelationships(victim: string): Map<string, ReturnType<typeof this.getRelationshipStatus>> {
    const offenses = this.offenses.get(victim) || [];
    const offenders = new Set(offenses.map(o => o.offender));

    const relationships = new Map();
    for (const offender of offenders) {
      relationships.set(offender, this.getRelationshipStatus(victim, offender));
    }

    return relationships;
  }
}

/**
 * Builder for creating NPC tolerance configurations
 */
export class ToleranceBuilder {
  private npcId: string = '';
  private basePatience: number = 0.5;
  private offenseWeights: Map<OffenseType, number> = new Map();
  private thresholds: ToleranceThreshold[] = [];
  private decayRate: number = 0.0000001; // Very slow decay by default
  private forgiveness: number = 0.5;
  private remembersForever: boolean = false;

  forNPC(npcId: string): this {
    this.npcId = npcId;
    return this;
  }

  withPatience(patience: number): this {
    this.basePatience = patience;
    return this;
  }

  weighOffense(type: OffenseType, weight: number): this {
    this.offenseWeights.set(type, weight);
    return this;
  }

  withDecayRate(rate: number): this {
    this.decayRate = rate;
    return this;
  }

  withForgiveness(level: number): this {
    this.forgiveness = level;
    return this;
  }

  neverForgets(): this {
    this.remembersForever = true;
    return this;
  }

  addThreshold(threshold: ToleranceThreshold): this {
    this.thresholds.push(threshold);
    return this;
  }

  build(): NPCTolerance {
    return {
      npcId: this.npcId,
      basePatience: this.basePatience,
      offenseWeights: this.offenseWeights,
      thresholds: this.thresholds,
      decayRate: this.decayRate,
      forgiveness: this.forgiveness,
      remembersForever: this.remembersForever
    };
  }
}

/**
 * Pre-built threshold reactions
 */
export class ThresholdReactions {
  static refuseToTalk(duration?: number): ThresholdReaction {
    return {
      id: 'refuse_to_talk',
      description: 'Refuses to speak to the offender',
      execute: (victim, offender, offenses, wm) => {
        wm.addWME({
          type: 'SocialStatus',
          id: `refuse_talk_${victim}_${offender}`,
          attributes: new Map([
            ['victim', victim],
            ['offender', offender],
            ['status', 'refuses_dialogue'],
            ['since', Date.now()],
            ['duration', duration || -1]
          ])
        });
        console.log(`>>> ${victim} refuses to talk to ${offender} anymore!`);
      },
      permanent: duration === undefined
    };
  }

  static becomeHostile(): ThresholdReaction {
    return {
      id: 'become_hostile',
      description: 'Becomes permanently hostile',
      execute: (victim, offender, offenses, wm) => {
        wm.addWME({
          type: 'Relationship',
          id: `hostile_${victim}_${offender}`,
          attributes: new Map([
            ['from', victim],
            ['to', offender],
            ['status', 'hostile'],
            ['since', Date.now()]
          ])
        });
        console.log(`>>> ${victim} is now HOSTILE toward ${offender}!`);
      },
      permanent: true
    };
  }

  static callGuards(): ThresholdReaction {
    return {
      id: 'call_guards',
      description: 'Calls guards to deal with offender',
      execute: (victim, offender, offenses, wm) => {
        wm.addWME({
          type: 'GuardAlert',
          id: `guard_alert_${Date.now()}`,
          attributes: new Map([
            ['caller', victim],
            ['target', offender],
            ['reason', 'repeated_offenses'],
            ['offenseCount', offenses.length],
            ['timestamp', Date.now()]
          ])
        });
        console.log(`>>> ${victim} calls the guards on ${offender}!`);
      },
      permanent: false
    };
  }

  static attackOffender(): ThresholdReaction {
    return {
      id: 'attack_offender',
      description: 'Physically attacks the offender',
      execute: (victim, offender, offenses, wm) => {
        wm.addWME({
          type: 'Action',
          id: `attack_${Date.now()}`,
          attributes: new Map([
            ['actor', victim],
            ['action', 'attack'],
            ['target', offender],
            ['reason', 'pushed_too_far'],
            ['timestamp', Date.now()]
          ])
        });
        console.log(`>>> ${victim} attacks ${offender} in rage!`);
      },
      permanent: false
    };
  }

  static spreadRumors(): ThresholdReaction {
    return {
      id: 'spread_rumors',
      description: 'Spreads negative rumors about offender',
      execute: (victim, offender, offenses, wm) => {
        wm.addWME({
          type: 'Rumor',
          id: `rumor_${Date.now()}`,
          attributes: new Map([
            ['spreader', victim],
            ['about', offender],
            ['sentiment', 'negative'],
            ['content', `${offender} has been treating people terribly`],
            ['timestamp', Date.now()]
          ])
        });
        console.log(`>>> ${victim} starts spreading bad rumors about ${offender}!`);
      },
      permanent: false
    };
  }

  static banFromLocation(location: string): ThresholdReaction {
    return {
      id: 'ban_from_location',
      description: `Bans offender from ${location}`,
      execute: (victim, offender, offenses, wm) => {
        wm.addWME({
          type: 'LocationBan',
          id: `ban_${victim}_${offender}_${location}`,
          attributes: new Map([
            ['authority', victim],
            ['banned', offender],
            ['location', location],
            ['reason', 'pushed_too_far'],
            ['timestamp', Date.now()]
          ])
        });
        console.log(`>>> ${victim} bans ${offender} from ${location}!`);
      },
      permanent: true
    };
  }

  static custom(
    id: string,
    description: string,
    execute: (victim: string, offender: string, offenses: Offense[], wm: WorkingMemory) => void,
    permanent: boolean = false
  ): ThresholdReaction {
    return { id, description, execute, permanent };
  }
}
