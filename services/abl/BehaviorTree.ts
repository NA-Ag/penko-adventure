/**
 * BehaviorTree - FACADE 3.1
 *
 * Manages hierarchical execution of behaviors for an NPC.
 * Behaviors can be composed sequentially or in parallel.
 *
 * Based on Facade's ABL behavior tree system.
 *
 * Execution modes:
 * - Sequential: Execute behaviors one after another
 * - Parallel: Execute multiple behaviors simultaneously
 * - Priority-based: Execute highest priority applicable behavior
 */

import { Behavior, BehaviorStatus, BehaviorResult } from './Behavior';
import { Goal } from './Goal';
import { WorldState } from './WorldState';
import { PriorityManager, createPriorityManagerWithLogging } from './PriorityManager';

/**
 * Execution strategy for behavior trees
 */
export enum ExecutionStrategy {
  /** Execute behaviors sequentially until one succeeds */
  SEQUENTIAL = 'sequential',

  /** Execute all behaviors in parallel */
  PARALLEL = 'parallel',

  /** Select highest priority behavior that can execute */
  PRIORITY = 'priority',
}

/**
 * Behavior tree node
 */
export class BehaviorTree {
  /** NPC this tree belongs to */
  private npcId: string;

  /** Root behaviors */
  private roots: Behavior[] = [];

  /** Active goals */
  private goals: Goal[] = [];

  /** Currently executing behaviors */
  private executing: Set<Behavior> = new Set();

  /** Execution strategy */
  private strategy: ExecutionStrategy = ExecutionStrategy.PRIORITY;

  /** World state for condition checking */
  private worldState: WorldState;

  /** Priority manager for preemption (FACADE 3.5) */
  private priorityManager: PriorityManager;

  constructor(
    npcId: string,
    worldState: WorldState,
    strategy: ExecutionStrategy = ExecutionStrategy.PRIORITY,
    priorityManager?: PriorityManager
  ) {
    this.npcId = npcId;
    this.worldState = worldState;
    this.strategy = strategy;
    this.priorityManager = priorityManager ?? createPriorityManagerWithLogging();
  }

  /**
   * Add a root behavior to the tree
   */
  addBehavior(behavior: Behavior): void {
    this.roots.push(behavior);
  }

  /**
   * Remove a behavior from the tree
   */
  removeBehavior(behavior: Behavior): void {
    const index = this.roots.indexOf(behavior);
    if (index >= 0) {
      this.roots.splice(index, 1);
    }
  }

  /**
   * Add a goal
   */
  addGoal(goal: Goal): void {
    this.goals.push(goal);
  }

  /**
   * Remove a goal
   */
  removeGoal(goal: Goal): void {
    const index = this.goals.indexOf(goal);
    if (index >= 0) {
      this.goals.splice(index, 1);
    }
  }

  /**
   * Get all active goals
   */
  getActiveGoals(): Goal[] {
    return this.goals.filter(g => g.isActive());
  }

  /**
   * Update all goals based on world state
   */
  updateGoals(): void {
    for (const goal of this.goals) {
      goal.update(this.worldState);
    }
  }

  /**
   * Select the highest priority active goal
   */
  selectGoal(): Goal | null {
    const activeGoals = this.getActiveGoals();

    if (activeGoals.length === 0) {
      return null;
    }

    // Sort by priority (descending)
    activeGoals.sort((a, b) => b.priority - a.priority);

    return activeGoals[0];
  }

  /**
   * Execute the behavior tree for one tick
   */
  async tick(): Promise<BehaviorResult[]> {
    // Update all goals
    this.updateGoals();

    // Select execution strategy
    switch (this.strategy) {
      case ExecutionStrategy.SEQUENTIAL:
        return await this.executeSequential();

      case ExecutionStrategy.PARALLEL:
        return await this.executeParallel();

      case ExecutionStrategy.PRIORITY:
      default:
        return await this.executePriority();
    }
  }

  /**
   * Execute behaviors sequentially
   */
  private async executeSequential(): Promise<BehaviorResult[]> {
    const results: BehaviorResult[] = [];

    for (const behavior of this.roots) {
      // Check if can execute
      if (!behavior.canExecute(this.worldState)) {
        continue;
      }

      // Execute behavior
      this.executing.add(behavior);
      const result = await behavior.execute(this.worldState);
      this.executing.delete(behavior);

      results.push(result);

      // If successful, stop (first success wins)
      if (result.status === BehaviorStatus.SUCCESS) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute behaviors in parallel
   */
  private async executeParallel(): Promise<BehaviorResult[]> {
    const executableBehaviors = this.roots.filter(b => b.canExecute(this.worldState));

    // Mark all as executing
    executableBehaviors.forEach(b => this.executing.add(b));

    // Execute all in parallel
    const promises = executableBehaviors.map(b => b.execute(this.worldState));
    const results = await Promise.all(promises);

    // Clear executing set
    this.executing.clear();

    return results;
  }

  /**
   * Execute highest priority behavior (goal-driven with preemption - FACADE 3.5)
   */
  private async executePriority(): Promise<BehaviorResult[]> {
    // Select highest priority goal
    const goal = this.selectGoal();

    if (!goal) {
      // No active goals - execute highest priority root behavior
      return await this.executeHighestPriorityRoot();
    }

    // Get all behaviors from this goal
    const goalBehaviors = goal.getSatisfyingBehaviors();

    // Get currently executing behavior
    const currentlyExecuting = this.executing.size > 0 ? Array.from(this.executing)[0] : null;

    // Use priority manager to select best behavior (considers preemption)
    const behavior = this.priorityManager.selectBehavior(
      goalBehaviors,
      this.worldState,
      currentlyExecuting
    );

    if (!behavior) {
      console.log(`[BehaviorTree:${this.npcId}] No executable behavior for goal "${goal.name}"`);
      return [];
    }

    // If switching behaviors due to preemption, interrupt the old one
    if (currentlyExecuting && currentlyExecuting !== behavior) {
      console.log(
        `[BehaviorTree:${this.npcId}] Preempting "${currentlyExecuting.name}" with "${behavior.name}"`
      );
      this.executing.delete(currentlyExecuting);
      // Return interrupted status for old behavior
      const interruptedResult: BehaviorResult = {
        status: BehaviorStatus.INTERRUPTED,
        message: `Preempted by higher priority behavior: ${behavior.name}`,
      };
      return [interruptedResult];
    }

    // Execute the selected behavior
    console.log(`[BehaviorTree:${this.npcId}] Executing "${behavior.name}" for goal "${goal.name}"`);

    goal.setCurrentBehavior(behavior);
    this.executing.add(behavior);

    const result = await behavior.execute(this.worldState);

    this.executing.delete(behavior);
    goal.setCurrentBehavior(null);

    return [result];
  }

  /**
   * Execute highest priority root behavior (when no goals active)
   */
  private async executeHighestPriorityRoot(): Promise<BehaviorResult[]> {
    // Get executable behaviors
    const executableBehaviors = this.roots.filter(b => b.canExecute(this.worldState));

    if (executableBehaviors.length === 0) {
      return [];
    }

    // Sort by composite score (70% priority, 30% specificity)
    executableBehaviors.sort((a, b) => {
      const scoreA = (a.priority * 0.7) + (a.specificity * 100 * 0.3);
      const scoreB = (b.priority * 0.7) + (b.specificity * 100 * 0.3);
      return scoreB - scoreA;
    });

    const behavior = executableBehaviors[0];

    console.log(`[BehaviorTree:${this.npcId}] Executing highest priority behavior "${behavior.name}"`);

    this.executing.add(behavior);
    const result = await behavior.execute(this.worldState);
    this.executing.delete(behavior);

    return [result];
  }

  /**
   * Get currently executing behaviors
   */
  getExecuting(): Behavior[] {
    return Array.from(this.executing);
  }

  /**
   * Check if any behavior is currently executing
   */
  isExecuting(): boolean {
    return this.executing.size > 0;
  }

  /**
   * Stop all executing behaviors
   */
  stopAll(): void {
    this.executing.clear();
  }

  /**
   * Reset the behavior tree
   */
  reset(): void {
    this.executing.clear();
    this.goals.forEach(g => g.reset());
    this.roots.forEach(b => b.reset());
  }

  /**
   * Get tree statistics (for debugging)
   */
  getStats(): {
    totalBehaviors: number;
    totalGoals: number;
    activeGoals: number;
    executing: number;
  } {
    return {
      totalBehaviors: this.roots.length,
      totalGoals: this.goals.length,
      activeGoals: this.getActiveGoals().length,
      executing: this.executing.size,
    };
  }
}
