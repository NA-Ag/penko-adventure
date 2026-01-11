/**
 * PriorityManager - FACADE 3.5
 *
 * Manages behavior priority with preemption support.
 * Higher priority behaviors can interrupt lower priority ones.
 *
 * Priority ranges (based on Facade):
 * - 90-100: CRITICAL (life/death, urgent danger)
 * - 70-89:  HIGH (important goals, social obligations)
 * - 40-69:  MEDIUM (normal activities, daily tasks)
 * - 20-39:  LOW (idle behaviors, background activities)
 * - 1-19:   TRIVIAL (filler, ambient actions)
 *
 * Preemption rules:
 * - Behaviors can only be preempted if preemptable = true
 * - Priority difference must exceed preemption threshold
 * - Some behaviors are non-preemptable (atomic actions, critical sequences)
 */

import { Behavior, BehaviorStatus } from './Behavior';
import { WorldState } from './WorldState';

/**
 * Priority levels (for convenience)
 */
export enum PriorityLevel {
  CRITICAL = 95,  // Flee from danger, save life
  HIGH = 80,      // Serve VIP, fulfill promise
  MEDIUM = 50,    // Serve drink, have conversation
  LOW = 30,       // Clean bar, idle chitchat
  TRIVIAL = 10,   // Look around, ambient gesture
}

/**
 * Priority change event
 */
export interface PriorityChangeEvent {
  oldBehavior: Behavior | null;
  newBehavior: Behavior;
  preempted: boolean;
  reason: string;
}

/**
 * Priority manager configuration
 */
export interface PriorityManagerConfig {
  /** Minimum priority difference for preemption (default: 20) */
  preemptionThreshold: number;

  /** Allow preemption during execution (default: true) */
  allowPreemption: boolean;

  /** Callback when behavior changes due to priority */
  onPriorityChange?: (event: PriorityChangeEvent) => void;
}

/**
 * Manages behavior selection and preemption based on priority
 */
export class PriorityManager {
  private config: PriorityManagerConfig;
  private currentBehavior: Behavior | null = null;
  private behaviorStartTime: number = 0;

  constructor(config: Partial<PriorityManagerConfig> = {}) {
    this.config = {
      preemptionThreshold: config.preemptionThreshold ?? 20,
      allowPreemption: config.allowPreemption ?? true,
      onPriorityChange: config.onPriorityChange,
    };
  }

  /**
   * Select the best behavior from candidates
   * Returns the behavior that should execute, considering current execution and preemption
   */
  selectBehavior(
    candidates: Behavior[],
    worldState: WorldState,
    currentlyExecuting: Behavior | null = null
  ): Behavior | null {
    // Filter to executable behaviors
    const executable = candidates.filter(b => b.canExecute(worldState));

    if (executable.length === 0) {
      return null;
    }

    // Sort by composite score (70% priority, 30% specificity)
    executable.sort((a, b) => {
      const scoreA = this.getCompositeScore(a);
      const scoreB = this.getCompositeScore(b);
      return scoreB - scoreA;
    });

    const highestPriority = executable[0];

    // If nothing is executing, return highest priority
    if (!currentlyExecuting) {
      this.currentBehavior = highestPriority;
      this.behaviorStartTime = Date.now();
      return highestPriority;
    }

    // If same behavior, continue executing it
    if (currentlyExecuting === highestPriority) {
      return highestPriority;
    }

    // Check if should preempt current behavior
    if (this.shouldPreempt(currentlyExecuting, highestPriority)) {
      this.notifyPriorityChange(currentlyExecuting, highestPriority, true);
      this.currentBehavior = highestPriority;
      this.behaviorStartTime = Date.now();
      return highestPriority;
    }

    // Continue with current behavior
    return currentlyExecuting;
  }

  /**
   * Check if new behavior should preempt current behavior
   */
  shouldPreempt(current: Behavior, candidate: Behavior): boolean {
    // Preemption disabled
    if (!this.config.allowPreemption) {
      return false;
    }

    // Current behavior is non-preemptable
    if (!current.isPreemptable()) {
      return false;
    }

    // Calculate priority difference
    const priorityDiff = candidate.priority - current.priority;

    // Must exceed threshold
    if (priorityDiff < this.config.preemptionThreshold) {
      return false;
    }

    return true;
  }

  /**
   * Get composite score for behavior (70% priority, 30% specificity)
   */
  private getCompositeScore(behavior: Behavior): number {
    return (behavior.priority * 0.7) + (behavior.specificity * 100 * 0.3);
  }

  /**
   * Notify when priority causes behavior change
   */
  private notifyPriorityChange(
    oldBehavior: Behavior | null,
    newBehavior: Behavior,
    preempted: boolean
  ): void {
    if (this.config.onPriorityChange) {
      const reason = preempted
        ? `Preempted by higher priority (${newBehavior.priority} > ${oldBehavior?.priority})`
        : 'Selected new behavior';

      this.config.onPriorityChange({
        oldBehavior,
        newBehavior,
        preempted,
        reason,
      });
    }
  }

  /**
   * Get current behavior
   */
  getCurrentBehavior(): Behavior | null {
    return this.currentBehavior;
  }

  /**
   * Get how long current behavior has been executing (ms)
   */
  getCurrentBehaviorDuration(): number {
    if (!this.currentBehavior) {
      return 0;
    }

    return Date.now() - this.behaviorStartTime;
  }

  /**
   * Clear current behavior
   */
  clear(): void {
    this.currentBehavior = null;
    this.behaviorStartTime = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PriorityManagerConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): PriorityManagerConfig {
    return { ...this.config };
  }
}

/**
 * Helper: Create priority manager with preemption logging
 */
export function createPriorityManagerWithLogging(
  preemptionThreshold: number = 20
): PriorityManager {
  return new PriorityManager({
    preemptionThreshold,
    allowPreemption: true,
    onPriorityChange: (event) => {
      if (event.preempted) {
        console.log(
          `[Priority] PREEMPTED: "${event.oldBehavior?.name}" → "${event.newBehavior.name}" (${event.reason})`
        );
      } else {
        console.log(`[Priority] Selected: "${event.newBehavior.name}"`);
      }
    },
  });
}
