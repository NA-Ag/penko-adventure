/**
 * ConditionalMemory - FACADE 5.6 Extension
 *
 * Advanced WME expiration with condition-based cleanup.
 * Extends TemporalMemory with conditional expiration.
 *
 * Features:
 * - Time-based expiration (from 5.3)
 * - Condition-based expiration (expires when condition becomes false)
 * - Dependency-based expiration (expires when another WME is retracted)
 * - Event-triggered expiration (expires on specific events)
 * - Automatic garbage collection
 * - Expiration strategies (immediate, delayed, graceful)
 *
 * This enables:
 * - "Player is angry" expires after 5 minutes OR when calmed down
 * - "Door is open" retracts automatically when door closes
 * - "Combat mode" expires when all enemies defeated
 * - "Buff active" expires when duration ends OR effect dispelled
 */

import { IWME, WME } from './WME';
import { WorkingMemory, WMEQuery } from './WorkingMemory';
import { TemporalWorkingMemory, TransientWME } from './TemporalMemory';

/**
 * Expiration condition - function that determines if WME should expire
 */
export type ExpirationCondition = (wme: IWME, wm: WorkingMemory) => boolean;

/**
 * Expiration strategy - how to handle expiration
 */
export enum ExpirationStrategy {
  IMMEDIATE = 'immediate', // Remove immediately when expired
  DELAYED = 'delayed', // Mark as expired but keep for N ms
  GRACEFUL = 'graceful', // Notify listeners before removing
  CONDITIONAL_ONLY = 'conditional_only', // Only expire based on condition, ignore time
}

/**
 * Expiration reason - why did WME expire?
 */
export enum ExpirationReason {
  TIME = 'time', // Time-based expiration
  CONDITION = 'condition', // Condition became false
  DEPENDENCY = 'dependency', // Dependent WME was removed
  EVENT = 'event', // Event triggered expiration
  MANUAL = 'manual', // Manually expired
}

/**
 * Conditional WME - WME that expires based on conditions
 */
export class ConditionalWME extends TransientWME {
  private conditions: ExpirationCondition[] = [];
  private dependencies: Set<string> = new Set(); // WME IDs this depends on
  private expirationEvents: Set<string> = new Set(); // Events that trigger expiration
  readonly strategy: ExpirationStrategy;
  private lastConditionCheck: number = 0;
  private conditionCheckInterval: number = 1000; // Check conditions every 1s

  constructor(
    type: string,
    attributes: Record<string, any>,
    lifetimeMs: number = Infinity,
    strategy: ExpirationStrategy = ExpirationStrategy.IMMEDIATE
  ) {
    super(type, attributes, lifetimeMs);
    this.strategy = strategy;
  }

  /**
   * Add expiration condition
   */
  addCondition(condition: ExpirationCondition): this {
    this.conditions.push(condition);
    return this;
  }

  /**
   * Add dependency (expires if dependent WME is removed)
   */
  addDependency(wmeId: string): this {
    this.dependencies.add(wmeId);
    return this;
  }

  /**
   * Add expiration event
   */
  addExpirationEvent(event: string): this {
    this.expirationEvents.add(event);
    return this;
  }

  /**
   * Check if any condition triggers expiration
   */
  checkConditions(wm: WorkingMemory): { shouldExpire: boolean; reason: ExpirationReason | null } {
    const now = Date.now();

    // Rate limit condition checks
    if (now - this.lastConditionCheck < this.conditionCheckInterval) {
      return { shouldExpire: false, reason: null };
    }
    this.lastConditionCheck = now;

    // Check time-based expiration (unless strategy is conditional only)
    if (this.strategy !== ExpirationStrategy.CONDITIONAL_ONLY && this.isExpired()) {
      return { shouldExpire: true, reason: ExpirationReason.TIME };
    }

    // Check all conditions
    for (const condition of this.conditions) {
      if (condition(this, wm)) {
        return { shouldExpire: true, reason: ExpirationReason.CONDITION };
      }
    }

    // Check dependencies
    for (const depId of this.dependencies) {
      if (!wm.has(depId)) {
        return { shouldExpire: true, reason: ExpirationReason.DEPENDENCY };
      }
    }

    return { shouldExpire: false, reason: null };
  }

  /**
   * Check if event triggers expiration
   */
  shouldExpireOnEvent(event: string): boolean {
    return this.expirationEvents.has(event);
  }

  /**
   * Get all expiration conditions
   */
  getConditions(): ExpirationCondition[] {
    return [...this.conditions];
  }

  /**
   * Get all dependencies
   */
  getDependencies(): string[] {
    return Array.from(this.dependencies);
  }

  /**
   * Get all expiration events
   */
  getExpirationEvents(): string[] {
    return Array.from(this.expirationEvents);
  }

  /**
   * Export with condition data
   */
  toJSON(): any {
    return {
      ...super.toJSON(),
      strategy: this.strategy,
      hasConditions: this.conditions.length > 0,
      dependencies: Array.from(this.dependencies),
      expirationEvents: Array.from(this.expirationEvents),
      isConditional: true,
    };
  }
}

/**
 * Expiration event - notification when WME expires
 */
export interface ExpirationEvent {
  wme: IWME;
  reason: ExpirationReason;
  timestamp: number;
}

/**
 * Expiration listener - callback for expiration events
 */
export type ExpirationListener = (event: ExpirationEvent) => void;

/**
 * Conditional Working Memory - extends TemporalWorkingMemory with conditional expiration
 */
export class ConditionalWorkingMemory extends TemporalWorkingMemory {
  private expirationListeners: ExpirationListener[] = [];
  private delayedExpirations: Map<
    string,
    { wme: ConditionalWME; reason: ExpirationReason; expiresAt: number }
  > = new Map();
  private conditionCheckInterval: NodeJS.Timeout | null = null;
  private gcInterval: NodeJS.Timeout | null = null;

  constructor(
    debug: boolean = false,
    autoExpireCheckIntervalMs: number = 1000,
    gcIntervalMs: number = 5000
  ) {
    super(debug, autoExpireCheckIntervalMs);

    // Start condition checking
    if (autoExpireCheckIntervalMs > 0) {
      this.startConditionChecking(autoExpireCheckIntervalMs);
    }

    // Start garbage collection
    if (gcIntervalMs > 0) {
      this.startGarbageCollection(gcIntervalMs);
    }
  }

  /**
   * Assert a conditional WME
   */
  assertConditional(wme: ConditionalWME): void {
    this.assert(wme);
  }

  /**
   * Create and assert a conditional WME
   */
  assertWithConditions(
    type: string,
    attributes: Record<string, any>,
    lifetimeMs: number = Infinity,
    strategy: ExpirationStrategy = ExpirationStrategy.IMMEDIATE
  ): ConditionalWME {
    const wme = new ConditionalWME(type, attributes, lifetimeMs, strategy);
    this.assert(wme);
    return wme;
  }

  /**
   * Add expiration listener
   */
  addExpirationListener(listener: ExpirationListener): void {
    this.expirationListeners.push(listener);
  }

  /**
   * Remove expiration listener
   */
  removeExpirationListener(listener: ExpirationListener): void {
    const index = this.expirationListeners.indexOf(listener);
    if (index !== -1) {
      this.expirationListeners.splice(index, 1);
    }
  }

  /**
   * Notify expiration listeners
   */
  private notifyExpiration(wme: IWME, reason: ExpirationReason): void {
    const event: ExpirationEvent = {
      wme,
      reason,
      timestamp: Date.now(),
    };

    for (const listener of this.expirationListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('[ConditionalMemory] Error in expiration listener:', error);
      }
    }
  }

  /**
   * Check all conditional WMEs for expiration
   */
  checkConditionalExpirations(): number {
    const toExpire: Array<{ wme: ConditionalWME; reason: ExpirationReason }> = [];

    for (const wme of this.getAll()) {
      if (wme instanceof ConditionalWME) {
        const { shouldExpire, reason } = wme.checkConditions(this);
        if (shouldExpire && reason) {
          toExpire.push({ wme, reason });
        }
      }
    }

    // Process expirations based on strategy
    for (const { wme, reason } of toExpire) {
      this.expireWME(wme, reason);
    }

    return toExpire.length;
  }

  /**
   * Expire a WME with specific reason and strategy
   */
  private expireWME(wme: ConditionalWME, reason: ExpirationReason): void {
    switch (wme.strategy) {
      case ExpirationStrategy.IMMEDIATE:
        this.notifyExpiration(wme, reason);
        this.retract(wme);
        break;

      case ExpirationStrategy.DELAYED:
        // Mark for delayed expiration (keep for 5 more seconds)
        this.delayedExpirations.set(wme.id, {
          wme,
          reason,
          expiresAt: Date.now() + 5000,
        });
        break;

      case ExpirationStrategy.GRACEFUL:
        // Notify first, then remove
        this.notifyExpiration(wme, reason);
        setTimeout(() => {
          if (this.has(wme.id)) {
            this.retract(wme);
          }
        }, 100); // Small delay for listeners to react
        break;

      case ExpirationStrategy.CONDITIONAL_ONLY:
        // Same as immediate for condition-based expiration
        this.notifyExpiration(wme, reason);
        this.retract(wme);
        break;
    }
  }

  /**
   * Trigger event-based expirations
   */
  triggerEvent(event: string): number {
    const toExpire: ConditionalWME[] = [];

    for (const wme of this.getAll()) {
      if (wme instanceof ConditionalWME && wme.shouldExpireOnEvent(event)) {
        toExpire.push(wme);
      }
    }

    for (const wme of toExpire) {
      this.expireWME(wme, ExpirationReason.EVENT);
    }

    return toExpire.length;
  }

  /**
   * Manually expire a WME
   */
  expire(wmeOrId: IWME | string): boolean {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    const wme = this.get(id);

    if (!wme) return false;

    if (wme instanceof ConditionalWME) {
      this.expireWME(wme, ExpirationReason.MANUAL);
    } else {
      this.notifyExpiration(wme, ExpirationReason.MANUAL);
      this.retract(wme);
    }

    return true;
  }

  /**
   * Get all conditional WMEs
   */
  getConditionalWMEs(): ConditionalWME[] {
    return this.getAll().filter((wme): wme is ConditionalWME => wme instanceof ConditionalWME);
  }

  /**
   * Get WMEs with specific expiration strategy
   */
  getWMEsByStrategy(strategy: ExpirationStrategy): ConditionalWME[] {
    return this.getConditionalWMEs().filter((wme) => wme.strategy === strategy);
  }

  /**
   * Start automatic condition checking
   */
  startConditionChecking(intervalMs: number = 1000): void {
    this.stopConditionChecking();

    this.conditionCheckInterval = setInterval(() => {
      const expired = this.checkConditionalExpirations();
      if (expired > 0) {
        console.log(`[ConditionalMemory] Condition-based expiration: ${expired} WMEs`);
      }
    }, intervalMs);
  }

  /**
   * Stop automatic condition checking
   */
  stopConditionChecking(): void {
    if (this.conditionCheckInterval) {
      clearInterval(this.conditionCheckInterval);
      this.conditionCheckInterval = null;
    }
  }

  /**
   * Start garbage collection (process delayed expirations)
   */
  startGarbageCollection(intervalMs: number = 5000): void {
    this.stopGarbageCollection();

    this.gcInterval = setInterval(() => {
      this.runGarbageCollection();
    }, intervalMs);
  }

  /**
   * Stop garbage collection
   */
  stopGarbageCollection(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }

  /**
   * Run garbage collection manually
   */
  runGarbageCollection(): number {
    const now = Date.now();
    const toRemove: string[] = [];

    // Process delayed expirations
    for (const [id, { wme, reason, expiresAt }] of this.delayedExpirations.entries()) {
      if (now >= expiresAt) {
        if (this.has(id)) {
          this.notifyExpiration(wme, reason);
          this.retract(wme);
        }
        toRemove.push(id);
      }
    }

    // Clean up processed delayed expirations
    for (const id of toRemove) {
      this.delayedExpirations.delete(id);
    }

    if (toRemove.length > 0) {
      console.log(`[ConditionalMemory] Garbage collection: ${toRemove.length} WMEs removed`);
    }

    return toRemove.length;
  }

  /**
   * Get memory statistics
   */
  getConditionalStats(): {
    totalWMEs: number;
    conditionalWMEs: number;
    byStrategy: Record<ExpirationStrategy, number>;
    delayedExpirations: number;
    withConditions: number;
    withDependencies: number;
    withEvents: number;
  } {
    const conditional = this.getConditionalWMEs();

    const byStrategy: Record<ExpirationStrategy, number> = {
      [ExpirationStrategy.IMMEDIATE]: 0,
      [ExpirationStrategy.DELAYED]: 0,
      [ExpirationStrategy.GRACEFUL]: 0,
      [ExpirationStrategy.CONDITIONAL_ONLY]: 0,
    };

    let withConditions = 0;
    let withDependencies = 0;
    let withEvents = 0;

    for (const wme of conditional) {
      byStrategy[wme.strategy]++;
      if (wme.getConditions().length > 0) withConditions++;
      if (wme.getDependencies().length > 0) withDependencies++;
      if (wme.getExpirationEvents().length > 0) withEvents++;
    }

    return {
      totalWMEs: this.getAll().length,
      conditionalWMEs: conditional.length,
      byStrategy,
      delayedExpirations: this.delayedExpirations.size,
      withConditions,
      withDependencies,
      withEvents,
    };
  }

  /**
   * Override retract to handle dependency cascades
   */
  retract(wmeOrId: IWME | string): boolean {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;

    // Check if any conditional WMEs depend on this one
    const dependents = this.getConditionalWMEs().filter((wme) => wme.getDependencies().includes(id));

    // Retract the original WME
    const retracted = super.retract(id);
    if (!retracted) return false;

    // Trigger dependency-based expiration for dependents
    for (const dependent of dependents) {
      this.expireWME(dependent, ExpirationReason.DEPENDENCY);
    }

    return true;
  }

  /**
   * Cleanup - stop all intervals
   */
  destroy(): void {
    super.destroy();
    this.stopConditionChecking();
    this.stopGarbageCollection();
  }
}

/**
 * Common expiration conditions
 */
export class ExpirationConditions {
  /**
   * Expire when attribute changes
   */
  static whenAttributeChanges(key: string, originalValue: any): ExpirationCondition {
    return (wme: IWME) => {
      return wme.getAttribute(key) !== originalValue;
    };
  }

  /**
   * Expire when attribute matches value
   */
  static whenAttributeEquals(key: string, value: any): ExpirationCondition {
    return (wme: IWME) => {
      return wme.getAttribute(key) === value;
    };
  }

  /**
   * Expire when attribute is below threshold
   */
  static whenAttributeBelow(key: string, threshold: number): ExpirationCondition {
    return (wme: IWME) => {
      const val = wme.getAttribute(key);
      return typeof val === 'number' && val < threshold;
    };
  }

  /**
   * Expire when attribute is above threshold
   */
  static whenAttributeAbove(key: string, threshold: number): ExpirationCondition {
    return (wme: IWME) => {
      const val = wme.getAttribute(key);
      return typeof val === 'number' && val > threshold;
    };
  }

  /**
   * Expire when WME of specific type exists
   */
  static whenWMEExists(type: string, attributes?: Record<string, any>): ExpirationCondition {
    return (_wme: IWME, wm: WorkingMemory) => {
      return wm.exists({ type, attributes });
    };
  }

  /**
   * Expire when WME of specific type doesn't exist
   */
  static whenWMENotExists(type: string, attributes?: Record<string, any>): ExpirationCondition {
    return (_wme: IWME, wm: WorkingMemory) => {
      return !wm.exists({ type, attributes });
    };
  }

  /**
   * Expire when count of WMEs meets condition
   */
  static whenCount(
    type: string,
    operator: '==' | '>' | '<' | '>=' | '<=',
    value: number
  ): ExpirationCondition {
    return (_wme: IWME, wm: WorkingMemory) => {
      const count = wm.count({ type });

      switch (operator) {
        case '==':
          return count === value;
        case '>':
          return count > value;
        case '<':
          return count < value;
        case '>=':
          return count >= value;
        case '<=':
          return count <= value;
        default:
          return false;
      }
    };
  }

  /**
   * Expire when age exceeds threshold
   */
  static whenOlderThan(ageMs: number): ExpirationCondition {
    return (wme: IWME) => {
      return Date.now() - wme.createdAt > ageMs;
    };
  }

  /**
   * Expire when not modified recently
   */
  static whenStale(stalenessMs: number): ExpirationCondition {
    return (wme: IWME) => {
      return Date.now() - wme.modifiedAt > stalenessMs;
    };
  }

  /**
   * Combine conditions with AND
   */
  static all(...conditions: ExpirationCondition[]): ExpirationCondition {
    return (wme: IWME, wm: WorkingMemory) => {
      return conditions.every((c) => c(wme, wm));
    };
  }

  /**
   * Combine conditions with OR
   */
  static any(...conditions: ExpirationCondition[]): ExpirationCondition {
    return (wme: IWME, wm: WorkingMemory) => {
      return conditions.some((c) => c(wme, wm));
    };
  }

  /**
   * Negate condition
   */
  static not(condition: ExpirationCondition): ExpirationCondition {
    return (wme: IWME, wm: WorkingMemory) => {
      return !condition(wme, wm);
    };
  }
}

/**
 * Helper functions for conditional memory
 */
export class ConditionalHelpers {
  /**
   * Create "player is angry" that expires after time OR when calmed
   */
  static createAngryState(
    wm: ConditionalWorkingMemory,
    entity: string,
    durationMs: number = 300000
  ): ConditionalWME {
    const wme = wm.assertWithConditions(
      'State',
      { entity, state: 'angry', value: true },
      durationMs,
      ExpirationStrategy.GRACEFUL
    );

    // Expire when anger value changes to false
    wme.addCondition(ExpirationConditions.whenAttributeEquals('value', false));

    return wme;
  }

  /**
   * Create "door is open" that expires when door closes
   */
  static createDoorState(
    wm: ConditionalWorkingMemory,
    doorId: string,
    isOpen: boolean
  ): ConditionalWME {
    const wme = wm.assertWithConditions(
      'State',
      { entity: doorId, state: 'open', value: isOpen },
      Infinity,
      ExpirationStrategy.IMMEDIATE
    );

    // Expire when state changes
    wme.addCondition(ExpirationConditions.whenAttributeChanges('value', isOpen));

    return wme;
  }

  /**
   * Create temporary buff that expires on time OR dispel event
   */
  static createBuff(
    wm: ConditionalWorkingMemory,
    entity: string,
    buffType: string,
    durationMs: number
  ): ConditionalWME {
    const wme = wm.assertWithConditions(
      'Buff',
      { entity, buffType, active: true },
      durationMs,
      ExpirationStrategy.GRACEFUL
    );

    // Also expire on dispel event
    wme.addExpirationEvent('dispel_buffs');
    wme.addExpirationEvent(`dispel_${buffType}`);

    return wme;
  }

  /**
   * Create combat mode that expires when no enemies remain
   */
  static createCombatMode(wm: ConditionalWorkingMemory, entity: string): ConditionalWME {
    const wme = wm.assertWithConditions(
      'State',
      { entity, state: 'inCombat', value: true },
      Infinity,
      ExpirationStrategy.GRACEFUL
    );

    // Expire when no enemies exist
    wme.addCondition(ExpirationConditions.whenCount('Enemy', '==', 0));

    return wme;
  }

  /**
   * Create quest marker that depends on quest WME
   */
  static createQuestMarker(
    wm: ConditionalWorkingMemory,
    questId: string,
    location: string,
    questWMEId: string
  ): ConditionalWME {
    const wme = wm.assertWithConditions(
      'QuestMarker',
      { questId, location },
      Infinity,
      ExpirationStrategy.IMMEDIATE
    );

    // Expire when quest WME is removed
    wme.addDependency(questWMEId);

    return wme;
  }
}
