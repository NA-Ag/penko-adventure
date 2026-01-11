/**
 * Goal - FACADE 3.1
 *
 * Represents what an NPC wants to achieve.
 * Goals drive behavior selection - NPCs choose behaviors that satisfy their goals.
 *
 * Based on Facade's goal-driven architecture.
 *
 * Example goals:
 * - "Serve drinks to the player"
 * - "Protect the treasure"
 * - "Find information about the dragon"
 * - "Maintain good relationship with player"
 */

import { WorldState } from './WorldState';
import { Behavior } from './Behavior';

/**
 * Goal priority levels
 */
export enum GoalPriority {
  /** Critical goals (survival, urgent needs) */
  CRITICAL = 100,

  /** High priority goals (main quest objectives) */
  HIGH = 75,

  /** Normal priority goals (standard activities) */
  NORMAL = 50,

  /** Low priority goals (optional tasks) */
  LOW = 25,

  /** Background goals (idle activities) */
  BACKGROUND = 10,
}

/**
 * Goal status
 */
export enum GoalStatus {
  /** Goal is active and being pursued */
  ACTIVE = 'active',

  /** Goal has been achieved */
  ACHIEVED = 'achieved',

  /** Goal has failed (became impossible) */
  FAILED = 'failed',

  /** Goal is suspended (waiting for conditions) */
  SUSPENDED = 'suspended',

  /** Goal is inactive (not being pursued) */
  INACTIVE = 'inactive',
}

/**
 * Goal success criteria
 */
export interface GoalSuccessCriteria {
  /** Description of what constitutes success */
  description: string;

  /** Function that checks if goal is achieved */
  check: (worldState: WorldState) => boolean;
}

/**
 * Goal failure criteria
 */
export interface GoalFailureCriteria {
  /** Description of what constitutes failure */
  description: string;

  /** Function that checks if goal has become impossible */
  check: (worldState: WorldState) => boolean;
}

/**
 * Goal class
 */
export class Goal {
  /** Unique identifier */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Detailed description */
  readonly description: string;

  /** Priority (higher = more important) */
  readonly priority: GoalPriority;

  /** Current status */
  private status: GoalStatus = GoalStatus.INACTIVE;

  /** Success criteria */
  private successCriteria: GoalSuccessCriteria[] = [];

  /** Failure criteria */
  private failureCriteria: GoalFailureCriteria[] = [];

  /** Behaviors that can satisfy this goal */
  private satisfyingBehaviors: Behavior[] = [];

  /** Currently executing behavior (if any) */
  private currentBehavior: Behavior | null = null;

  /** Goal activation time */
  private activationTime: number = 0;

  /** Goal completion time */
  private completionTime: number = 0;

  /** Number of times this goal has been attempted */
  private attemptCount: number = 0;

  /** Maximum attempts before giving up (0 = unlimited) */
  private maxAttempts: number = 0;

  constructor(
    id: string,
    name: string,
    description: string,
    priority: GoalPriority = GoalPriority.NORMAL
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.priority = priority;
  }

  /**
   * Activate this goal
   */
  activate(): void {
    if (this.status === GoalStatus.INACTIVE || this.status === GoalStatus.SUSPENDED) {
      this.status = GoalStatus.ACTIVE;
      this.activationTime = Date.now();
      console.log(`[Goal:${this.name}] Activated (priority: ${this.priority})`);
    }
  }

  /**
   * Suspend this goal (temporarily inactive)
   */
  suspend(): void {
    if (this.status === GoalStatus.ACTIVE) {
      this.status = GoalStatus.SUSPENDED;
      console.log(`[Goal:${this.name}] Suspended`);
    }
  }

  /**
   * Check if goal has been achieved
   */
  checkAchievement(worldState: WorldState): boolean {
    if (this.successCriteria.length === 0) {
      return false;
    }

    // All success criteria must be met
    for (const criteria of this.successCriteria) {
      if (!criteria.check(worldState)) {
        return false;
      }
    }

    // Goal achieved!
    if (this.status === GoalStatus.ACTIVE) {
      this.status = GoalStatus.ACHIEVED;
      this.completionTime = Date.now();
      const duration = this.completionTime - this.activationTime;
      console.log(`[Goal:${this.name}] Achieved in ${duration}ms after ${this.attemptCount} attempts`);
    }

    return true;
  }

  /**
   * Check if goal has failed (become impossible)
   */
  checkFailure(worldState: WorldState): boolean {
    // Check if we've exceeded max attempts
    if (this.maxAttempts > 0 && this.attemptCount >= this.maxAttempts) {
      console.log(`[Goal:${this.name}] Failed - max attempts (${this.maxAttempts}) exceeded`);
      this.status = GoalStatus.FAILED;
      this.completionTime = Date.now();
      return true;
    }

    // Check failure criteria
    for (const criteria of this.failureCriteria) {
      if (criteria.check(worldState)) {
        console.log(`[Goal:${this.name}] Failed - ${criteria.description}`);
        this.status = GoalStatus.FAILED;
        this.completionTime = Date.now();
        return true;
      }
    }

    return false;
  }

  /**
   * Update goal status based on world state
   */
  update(worldState: WorldState): void {
    if (this.status !== GoalStatus.ACTIVE) {
      return;
    }

    // Check if achieved
    if (this.checkAchievement(worldState)) {
      return;
    }

    // Check if failed
    this.checkFailure(worldState);
  }

  /**
   * Add a success criterion
   */
  addSuccessCriteria(description: string, check: (worldState: WorldState) => boolean): void {
    this.successCriteria.push({ description, check });
  }

  /**
   * Add a failure criterion
   */
  addFailureCriteria(description: string, check: (worldState: WorldState) => boolean): void {
    this.failureCriteria.push({ description, check });
  }

  /**
   * Add a behavior that can satisfy this goal
   */
  addSatisfyingBehavior(behavior: Behavior): void {
    this.satisfyingBehaviors.push(behavior);
  }

  /**
   * Get all behaviors that can satisfy this goal
   */
  getSatisfyingBehaviors(): Behavior[] {
    return [...this.satisfyingBehaviors];
  }

  /**
   * Select the best behavior to pursue this goal
   * Returns the behavior with highest priority that can execute
   */
  selectBehavior(worldState: WorldState): Behavior | null {
    // Filter to behaviors that can execute
    const executableBehaviors = this.satisfyingBehaviors.filter(b => b.canExecute(worldState));

    if (executableBehaviors.length === 0) {
      return null;
    }

    // Sort by composite score (priority + specificity)
    executableBehaviors.sort((a, b) => {
      // Composite score: 70% priority, 30% specificity
      const scoreA = (a.priority * 0.7) + (a.specificity * 100 * 0.3);
      const scoreB = (b.priority * 0.7) + (b.specificity * 100 * 0.3);
      return scoreB - scoreA; // Descending order
    });

    return executableBehaviors[0];
  }

  /**
   * Set currently executing behavior
   */
  setCurrentBehavior(behavior: Behavior | null): void {
    this.currentBehavior = behavior;
    if (behavior !== null) {
      this.attemptCount++;
    }
  }

  /**
   * Get currently executing behavior
   */
  getCurrentBehavior(): Behavior | null {
    return this.currentBehavior;
  }

  /**
   * Set maximum attempts
   */
  setMaxAttempts(max: number): void {
    this.maxAttempts = max;
  }

  /**
   * Get current status
   */
  getStatus(): GoalStatus {
    return this.status;
  }

  /**
   * Check if goal is active
   */
  isActive(): boolean {
    return this.status === GoalStatus.ACTIVE;
  }

  /**
   * Check if goal is achieved
   */
  isAchieved(): boolean {
    return this.status === GoalStatus.ACHIEVED;
  }

  /**
   * Check if goal has failed
   */
  hasFailed(): boolean {
    return this.status === GoalStatus.FAILED;
  }

  /**
   * Reset goal to inactive state
   */
  reset(): void {
    this.status = GoalStatus.INACTIVE;
    this.currentBehavior = null;
    this.attemptCount = 0;
    this.activationTime = 0;
    this.completionTime = 0;
  }

  /**
   * Get time spent on this goal (if active or completed)
   */
  getTimeSpent(): number {
    if (this.activationTime === 0) {
      return 0;
    }

    const endTime = this.completionTime > 0 ? this.completionTime : Date.now();
    return endTime - this.activationTime;
  }
}
