/**
 * ContextCondition - FACADE 3.3
 *
 * Context conditions are monitored DURING behavior execution.
 * Unlike preconditions (checked once before execution), context conditions
 * are continuously evaluated while the behavior runs.
 *
 * If a context condition fails during execution:
 * - 'interrupt': Stop immediately, mark behavior as INTERRUPTED
 * - 'fail': Stop immediately, mark behavior as FAILED
 * - 'retry': Continue execution, hoping condition will be restored
 *
 * Based on Facade's context monitoring system.
 */

import { WorldState } from './WorldState';
import { PreconditionBuilder } from './Precondition';

/**
 * Failure strategy when context condition fails
 */
export type ContextFailureStrategy = 'interrupt' | 'fail' | 'retry';

/**
 * Context condition interface
 */
export interface IContextCondition {
  description: string;
  check: (worldState: WorldState) => boolean;
  onFailure: ContextFailureStrategy;
}

/**
 * Context condition builder (similar to PreconditionBuilder)
 */
export class ContextConditionBuilder {
  private description: string;
  private checkFn: (worldState: WorldState) => boolean;
  private failureStrategy: ContextFailureStrategy;

  constructor(
    description: string,
    checkFn: (worldState: WorldState) => boolean,
    failureStrategy: ContextFailureStrategy = 'interrupt'
  ) {
    this.description = description;
    this.checkFn = checkFn;
    this.failureStrategy = failureStrategy;
  }

  /**
   * Build the final context condition
   */
  build(): IContextCondition {
    return {
      description: this.description,
      check: this.checkFn,
      onFailure: this.failureStrategy,
    };
  }

  /**
   * Set failure strategy
   */
  onFailure(strategy: ContextFailureStrategy): ContextConditionBuilder {
    this.failureStrategy = strategy;
    return this;
  }

  /**
   * Combine with another condition using AND
   */
  and(other: ContextConditionBuilder): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `(${this.description}) AND (${other.description})`,
      (ws: WorldState) => this.checkFn(ws) && other.checkFn(ws),
      this.failureStrategy // Keep current failure strategy
    );
  }

  /**
   * Combine with another condition using OR
   */
  or(other: ContextConditionBuilder): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `(${this.description}) OR (${other.description})`,
      (ws: WorldState) => this.checkFn(ws) || other.checkFn(ws),
      this.failureStrategy
    );
  }

  /**
   * Negate this condition
   */
  not(): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `NOT (${this.description})`,
      (ws: WorldState) => !this.checkFn(ws),
      this.failureStrategy
    );
  }

  // ===== STATIC FACTORY METHODS =====

  /**
   * Create from PreconditionBuilder (reuse precondition logic)
   */
  static fromPrecondition(
    precondition: PreconditionBuilder,
    failureStrategy: ContextFailureStrategy = 'interrupt'
  ): ContextConditionBuilder {
    const built = precondition.build();
    return new ContextConditionBuilder(built.description, built.check, failureStrategy);
  }

  /**
   * Player must remain in location
   */
  static playerInLocation(locationId: string, failureStrategy: ContextFailureStrategy = 'interrupt'): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `Player in location "${locationId}"`,
      (ws: WorldState) => ws.get('player_location') === locationId,
      failureStrategy
    );
  }

  /**
   * Player must remain nearby (distance check)
   */
  static playerNearby(maxDistance: number, failureStrategy: ContextFailureStrategy = 'interrupt'): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `Player within ${maxDistance} units`,
      (ws: WorldState) => {
        const distance = ws.get('player_distance') as number;
        return distance !== undefined && distance <= maxDistance;
      },
      failureStrategy
    );
  }

  /**
   * No danger present
   */
  static noDanger(failureStrategy: ContextFailureStrategy = 'interrupt'): ContextConditionBuilder {
    return new ContextConditionBuilder(
      'No danger present',
      (ws: WorldState) => !ws.get('danger_present'),
      failureStrategy
    );
  }

  /**
   * Health above threshold
   */
  static healthAbove(threshold: number, failureStrategy: ContextFailureStrategy = 'interrupt'): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `Health > ${threshold}`,
      (ws: WorldState) => {
        const health = ws.get('health') as number;
        return health !== undefined && health > threshold;
      },
      failureStrategy
    );
  }

  /**
   * Resource availability (e.g., ingredients, materials)
   */
  static hasResource(resourceKey: string, failureStrategy: ContextFailureStrategy = 'interrupt'): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `Has resource "${resourceKey}"`,
      (ws: WorldState) => ws.get(resourceKey) === true,
      failureStrategy
    );
  }

  /**
   * Time limit not exceeded
   */
  static withinTimeLimit(
    startTimeKey: string,
    maxDurationMs: number,
    failureStrategy: ContextFailureStrategy = 'interrupt'
  ): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `Within ${maxDurationMs}ms time limit`,
      (ws: WorldState) => {
        const startTime = ws.get(startTimeKey) as number;
        if (!startTime) return true; // No start time = not started yet
        return Date.now() - startTime <= maxDurationMs;
      },
      failureStrategy
    );
  }

  /**
   * Weather condition remains stable
   */
  static weatherIs(weather: string, failureStrategy: ContextFailureStrategy = 'interrupt'): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `Weather is "${weather}"`,
      (ws: WorldState) => ws.get('current_weather') === weather,
      failureStrategy
    );
  }

  /**
   * NPC is not under attack
   */
  static notUnderAttack(failureStrategy: ContextFailureStrategy = 'interrupt'): ContextConditionBuilder {
    return new ContextConditionBuilder(
      'Not under attack',
      (ws: WorldState) => !ws.get('under_attack'),
      failureStrategy
    );
  }

  /**
   * Conversation partner is still present
   */
  static conversationPartnerPresent(
    partnerKey: string,
    failureStrategy: ContextFailureStrategy = 'interrupt'
  ): ContextConditionBuilder {
    return new ContextConditionBuilder(
      `Conversation partner "${partnerKey}" is present`,
      (ws: WorldState) => ws.get(partnerKey) === true,
      failureStrategy
    );
  }

  /**
   * Custom context condition
   */
  static custom(
    description: string,
    checkFn: (worldState: WorldState) => boolean,
    failureStrategy: ContextFailureStrategy = 'interrupt'
  ): ContextConditionBuilder {
    return new ContextConditionBuilder(description, checkFn, failureStrategy);
  }

  /**
   * Combine multiple conditions with AND
   */
  static all(...conditions: ContextConditionBuilder[]): ContextConditionBuilder {
    if (conditions.length === 0) {
      return new ContextConditionBuilder('always true', () => true, 'interrupt');
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return conditions.reduce((acc, curr) => acc.and(curr));
  }

  /**
   * Combine multiple conditions with OR
   */
  static any(...conditions: ContextConditionBuilder[]): ContextConditionBuilder {
    if (conditions.length === 0) {
      return new ContextConditionBuilder('always false', () => false, 'interrupt');
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return conditions.reduce((acc, curr) => acc.or(curr));
  }
}

/**
 * Context monitor - actively monitors conditions during behavior execution
 */
export class ContextMonitor {
  private conditions: IContextCondition[] = [];
  private checkInterval: number;
  private isMonitoring: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private onViolation: ((condition: IContextCondition) => void) | null = null;

  constructor(checkInterval: number = 100) {
    this.checkInterval = checkInterval;
  }

  /**
   * Add a condition to monitor
   */
  addCondition(condition: IContextCondition): void {
    this.conditions.push(condition);
  }

  /**
   * Set violation callback
   */
  setViolationCallback(callback: (condition: IContextCondition) => void): void {
    this.onViolation = callback;
  }

  /**
   * Start monitoring
   */
  start(worldState: WorldState): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    this.intervalId = setInterval(() => {
      for (const condition of this.conditions) {
        if (!condition.check(worldState)) {
          console.log(`[ContextMonitor] Condition violated: ${condition.description}`);

          if (this.onViolation) {
            this.onViolation(condition);
          }

          // If onFailure is 'interrupt' or 'fail', stop monitoring
          if (condition.onFailure === 'interrupt' || condition.onFailure === 'fail') {
            this.stop();
            break;
          }
          // 'retry' continues monitoring
        }
      }
    }, this.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Check if currently monitoring
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get all monitored conditions
   */
  getConditions(): IContextCondition[] {
    return [...this.conditions];
  }

  /**
   * Clear all conditions
   */
  clear(): void {
    this.conditions = [];
  }
}
