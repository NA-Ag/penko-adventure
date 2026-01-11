/**
 * Behavior - FACADE 3.1
 *
 * Base class for ABL-inspired hierarchical behaviors.
 * Based on Facade's A Behavior Language (ABL) system.
 *
 * Behaviors are goal-driven actions that NPCs can perform.
 * They form hierarchies where parent behaviors decompose into child behaviors.
 *
 * Key concepts from ABL:
 * - Preconditions: When can this behavior execute?
 * - Success tests: Did this behavior achieve its goal?
 * - Context conditions: Continuously monitored during execution
 * - Priority: Which behavior to choose when multiple are applicable
 * - Specificity: More specific behaviors override generic ones
 */

import { WorldState } from './WorldState';
import { SpecificityCriteria, SpecificityMatcher } from './SpecificityMatcher';

/**
 * Behavior execution status
 */
export enum BehaviorStatus {
  /** Behavior hasn't started yet */
  IDLE = 'idle',

  /** Behavior is currently executing */
  RUNNING = 'running',

  /** Behavior completed successfully */
  SUCCESS = 'success',

  /** Behavior failed to complete */
  FAILURE = 'failure',

  /** Behavior was interrupted by context failure */
  INTERRUPTED = 'interrupted',
}

/**
 * Result of executing a behavior
 */
export interface BehaviorResult {
  status: BehaviorStatus;
  message?: string;
  data?: any;
}

/**
 * Precondition - must be true before behavior can execute
 */
export interface Precondition {
  /** Human-readable description */
  description: string;

  /** Function that checks if condition is met */
  check: (worldState: WorldState) => boolean;
}

/**
 * Context condition - must remain true during execution
 */
export interface ContextCondition {
  /** Human-readable description */
  description: string;

  /** Function that checks if condition is still met */
  check: (worldState: WorldState) => boolean;

  /** What to do if condition fails */
  onFailure: 'interrupt' | 'retry' | 'fail';
}

/**
 * Success test - determines if behavior achieved its goal
 */
export interface SuccessTest {
  /** Human-readable description */
  description: string;

  /** Function that checks if goal was achieved */
  check: (worldState: WorldState, result?: any) => boolean;
}

/**
 * Base Behavior class
 */
export abstract class Behavior {
  /** Unique identifier for this behavior */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Priority (1-100, higher = more important) */
  readonly priority: number;

  /** Specificity (0-1, higher = more specific) */
  readonly specificity: number;

  /** Specificity criteria for matching (FACADE 3.6) */
  protected specificityCriteria: SpecificityCriteria;

  /** Can this behavior be preempted by higher priority ones? (FACADE 3.5) */
  protected preemptable: boolean = true;

  /** Current execution status */
  protected status: BehaviorStatus = BehaviorStatus.IDLE;

  /** Preconditions that must be met before execution */
  protected preconditions: Precondition[] = [];

  /** Context conditions monitored during execution */
  protected contextConditions: ContextCondition[] = [];

  /** Success tests to determine if goal achieved */
  protected successTests: SuccessTest[] = [];

  /** Child behaviors (for hierarchical composition) */
  protected children: Behavior[] = [];

  /** Parent behavior (if this is a child) */
  protected parent: Behavior | null = null;

  /** Execution start time */
  protected startTime: number = 0;

  /** Execution end time */
  protected endTime: number = 0;

  constructor(id: string, name: string, priority: number = 50, specificity: number = 0.5) {
    this.id = id;
    this.name = name;
    this.priority = Math.max(1, Math.min(100, priority)); // Clamp 1-100
    this.specificity = Math.max(0, Math.min(1, specificity)); // Clamp 0-1

    // FACADE 3.6: Initialize with generic specificity criteria
    this.specificityCriteria = SpecificityMatcher.generic();
  }

  /**
   * Check if all preconditions are satisfied
   */
  canExecute(worldState: WorldState): boolean {
    for (const precondition of this.preconditions) {
      if (!precondition.check(worldState)) {
        console.log(`[Behavior:${this.name}] Precondition failed: ${precondition.description}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Check if all context conditions are still satisfied
   */
  protected checkContextConditions(worldState: WorldState): boolean {
    for (const condition of this.contextConditions) {
      if (!condition.check(worldState)) {
        console.log(`[Behavior:${this.name}] Context condition failed: ${condition.description}`);

        // Handle context failure based on configuration
        if (condition.onFailure === 'interrupt') {
          this.status = BehaviorStatus.INTERRUPTED;
          return false;
        } else if (condition.onFailure === 'fail') {
          this.status = BehaviorStatus.FAILURE;
          return false;
        }
        // 'retry' continues execution hoping condition will be restored
      }
    }
    return true;
  }

  /**
   * Check if behavior achieved its success criteria
   */
  protected checkSuccess(worldState: WorldState, result?: any): boolean {
    // If no success tests defined, assume success if status is SUCCESS
    if (this.successTests.length === 0) {
      return this.status === BehaviorStatus.SUCCESS;
    }

    // All success tests must pass
    for (const test of this.successTests) {
      if (!test.check(worldState, result)) {
        console.log(`[Behavior:${this.name}] Success test failed: ${test.description}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Execute the behavior
   * This is the main entry point - handles preconditions, execution, and success testing
   */
  async execute(worldState: WorldState): Promise<BehaviorResult> {
    // Check preconditions
    if (!this.canExecute(worldState)) {
      return {
        status: BehaviorStatus.FAILURE,
        message: `Preconditions not met for ${this.name}`,
      };
    }

    // Start execution
    this.status = BehaviorStatus.RUNNING;
    this.startTime = Date.now();

    console.log(`[Behavior:${this.name}] Starting execution (priority: ${this.priority}, specificity: ${this.specificity})`);

    try {
      // Perform the actual behavior logic
      const result = await this.performBehavior(worldState);

      // Check context conditions weren't violated during execution
      if (!this.checkContextConditions(worldState)) {
        this.endTime = Date.now();
        return {
          status: this.status, // INTERRUPTED or FAILURE
          message: `Context conditions violated during ${this.name}`,
        };
      }

      // Check if we achieved success
      if (this.checkSuccess(worldState, result.data)) {
        this.status = BehaviorStatus.SUCCESS;
        this.endTime = Date.now();
        console.log(`[Behavior:${this.name}] Completed successfully in ${this.endTime - this.startTime}ms`);
        return result;
      } else {
        this.status = BehaviorStatus.FAILURE;
        this.endTime = Date.now();
        return {
          status: BehaviorStatus.FAILURE,
          message: `Success criteria not met for ${this.name}`,
        };
      }
    } catch (error) {
      this.status = BehaviorStatus.FAILURE;
      this.endTime = Date.now();
      console.error(`[Behavior:${this.name}] Execution failed:`, error);
      return {
        status: BehaviorStatus.FAILURE,
        message: `Exception during ${this.name}: ${error}`,
      };
    }
  }

  /**
   * Abstract method - subclasses implement actual behavior logic
   */
  protected abstract performBehavior(worldState: WorldState): Promise<BehaviorResult>;

  /**
   * Add a child behavior (for hierarchical composition)
   */
  addChild(child: Behavior): void {
    child.parent = this;
    this.children.push(child);
  }

  /**
   * Remove a child behavior
   */
  removeChild(child: Behavior): void {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children[index].parent = null;
      this.children.splice(index, 1);
    }
  }

  /**
   * Get all children
   */
  getChildren(): Behavior[] {
    return [...this.children];
  }

  /**
   * Add a precondition
   */
  addPrecondition(description: string, check: (worldState: WorldState) => boolean): void {
    this.preconditions.push({ description, check });
  }

  /**
   * Add a context condition
   */
  addContextCondition(
    description: string,
    check: (worldState: WorldState) => boolean,
    onFailure: 'interrupt' | 'retry' | 'fail' = 'interrupt'
  ): void {
    this.contextConditions.push({ description, check, onFailure });
  }

  /**
   * Add a success test
   */
  addSuccessTest(description: string, check: (worldState: WorldState, result?: any) => boolean): void {
    this.successTests.push({ description, check });
  }

  /**
   * Get current status
   */
  getStatus(): BehaviorStatus {
    return this.status;
  }

  /**
   * Reset behavior to IDLE state
   */
  reset(): void {
    this.status = BehaviorStatus.IDLE;
    this.startTime = 0;
    this.endTime = 0;
  }

  /**
   * Get execution time (if completed)
   */
  getExecutionTime(): number {
    if (this.endTime > 0 && this.startTime > 0) {
      return this.endTime - this.startTime;
    }
    return 0;
  }

  /**
   * Check if this behavior can be preempted (FACADE 3.5)
   */
  isPreemptable(): boolean {
    return this.preemptable;
  }

  /**
   * Set whether this behavior can be preempted (FACADE 3.5)
   */
  setPreemptable(preemptable: boolean): void {
    this.preemptable = preemptable;
  }

  /**
   * Set specificity criteria (FACADE 3.6)
   */
  setSpecificityCriteria(criteria: SpecificityCriteria): void {
    this.specificityCriteria = criteria;
  }

  /**
   * Get specificity criteria (FACADE 3.6)
   */
  getSpecificityCriteria(): SpecificityCriteria {
    return this.specificityCriteria;
  }

  /**
   * Calculate dynamic specificity score for current situation (FACADE 3.6)
   */
  calculateSpecificityScore(
    worldState: WorldState,
    targetId?: string,
    parameters?: Record<string, any>
  ): number {
    const score = SpecificityMatcher.calculateScore(
      this.specificityCriteria,
      worldState,
      targetId,
      parameters
    );
    return score.total;
  }
}
