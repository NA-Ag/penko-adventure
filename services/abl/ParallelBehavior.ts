/**
 * ParallelBehavior - FACADE 3.8
 *
 * Parallel behavior execution where multiple sub-behaviors run simultaneously.
 * NPCs can perform multiple actions at once (talk while gesturing, walk while thinking).
 *
 * Based on Facade's ABL parallel acts:
 * - Execute multiple behaviors concurrently
 * - Track completion of all parallel tasks
 * - Handle conflicts and resource sharing
 * - Support different completion strategies
 *
 * Completion strategies:
 * - ALL: All behaviors must succeed
 * - ANY: At least one behavior must succeed
 * - MAJORITY: More than half must succeed
 * - FIRST: First to complete determines result
 */

import { Behavior, BehaviorStatus, BehaviorResult } from './Behavior';
import { WorldState } from './WorldState';

/**
 * Completion strategy for parallel behaviors
 */
export enum ParallelCompletionStrategy {
  /** All behaviors must succeed */
  ALL = 'all',

  /** At least one behavior must succeed */
  ANY = 'any',

  /** More than half must succeed */
  MAJORITY = 'majority',

  /** First to complete determines result */
  FIRST = 'first',
}

/**
 * Conflict resolution strategy
 */
export enum ConflictResolution {
  /** Allow conflicting behaviors (no checking) */
  ALLOW = 'allow',

  /** Cancel conflicting behaviors */
  CANCEL_CONFLICTS = 'cancel_conflicts',

  /** Fail if conflicts detected */
  FAIL_ON_CONFLICT = 'fail_on_conflict',
}

/**
 * Parallel task configuration
 */
export interface ParallelTask {
  /** The behavior to execute */
  behavior: Behavior;

  /** Resources this behavior uses (for conflict detection) */
  resources?: string[];

  /** Is this task optional? */
  optional?: boolean;

  /** Task identifier */
  id?: string;
}

/**
 * Parallel execution state
 */
export interface ParallelState {
  /** Total tasks */
  totalTasks: number;

  /** Tasks completed */
  completedTasks: number;

  /** Tasks succeeded */
  succeededTasks: number;

  /** Tasks failed */
  failedTasks: number;

  /** Tasks running */
  runningTasks: number;

  /** Task results */
  results: ParallelTaskResult[];

  /** Detected conflicts */
  conflicts: string[];
}

/**
 * Result of executing a parallel task
 */
export interface ParallelTaskResult {
  taskId: string;
  behaviorName: string;
  status: BehaviorStatus;
  message?: string;
  startTime: number;
  endTime: number;
  duration: number;
}

/**
 * Parallel behavior that executes sub-behaviors simultaneously
 */
export class ParallelBehavior extends Behavior {
  protected tasks: ParallelTask[] = [];
  protected completionStrategy: ParallelCompletionStrategy = ParallelCompletionStrategy.ALL;
  protected conflictResolution: ConflictResolution = ConflictResolution.ALLOW;
  protected state: ParallelState;

  constructor(
    id: string,
    name: string,
    priority: number = 50,
    specificity: number = 0.5,
    completionStrategy: ParallelCompletionStrategy = ParallelCompletionStrategy.ALL,
    conflictResolution: ConflictResolution = ConflictResolution.ALLOW
  ) {
    super(id, name, priority, specificity);

    this.completionStrategy = completionStrategy;
    this.conflictResolution = conflictResolution;
    this.state = this.createInitialState();
  }

  /**
   * Add a parallel task
   */
  addTask(
    behavior: Behavior,
    resources?: string[],
    optional: boolean = false,
    taskId?: string
  ): void {
    const id = taskId || `task_${this.tasks.length}`;

    this.tasks.push({
      behavior,
      resources,
      optional,
      id,
    });

    this.state.totalTasks = this.tasks.length;
  }

  /**
   * Add multiple tasks at once
   */
  addTasks(tasks: ParallelTask[]): void {
    for (const task of tasks) {
      const id = task.id || `task_${this.tasks.length}`;
      this.tasks.push({
        ...task,
        id,
      });
    }

    this.state.totalTasks = this.tasks.length;
  }

  /**
   * Execute parallel behaviors
   */
  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(`[Parallel:${this.name}] Starting ${this.state.totalTasks} parallel tasks`);

    // Check for conflicts
    const conflicts = this.detectConflicts();

    if (conflicts.length > 0) {
      this.state.conflicts = conflicts;
      console.log(`[Parallel:${this.name}] Detected ${conflicts.length} resource conflicts:`, conflicts);

      if (this.conflictResolution === ConflictResolution.FAIL_ON_CONFLICT) {
        return {
          status: BehaviorStatus.FAILURE,
          message: `Resource conflicts detected: ${conflicts.join(', ')}`,
        };
      } else if (this.conflictResolution === ConflictResolution.CANCEL_CONFLICTS) {
        // Remove conflicting tasks
        this.removeConflictingTasks(conflicts);
        console.log(`[Parallel:${this.name}] Cancelled conflicting tasks`);
      }
    }

    // Filter to executable tasks
    const executableTasks = this.tasks.filter(task => task.behavior.canExecute(worldState));

    if (executableTasks.length === 0) {
      return {
        status: BehaviorStatus.FAILURE,
        message: 'No executable parallel tasks',
      };
    }

    console.log(`[Parallel:${this.name}] Executing ${executableTasks.length} tasks in parallel`);

    this.state.runningTasks = executableTasks.length;

    // Execute based on completion strategy
    switch (this.completionStrategy) {
      case ParallelCompletionStrategy.FIRST:
        return await this.executeFirstComplete(executableTasks, worldState);

      case ParallelCompletionStrategy.ALL:
      case ParallelCompletionStrategy.ANY:
      case ParallelCompletionStrategy.MAJORITY:
      default:
        return await this.executeAllThenCheck(executableTasks, worldState);
    }
  }

  /**
   * Execute all tasks, then check completion strategy
   */
  private async executeAllThenCheck(
    tasks: ParallelTask[],
    worldState: WorldState
  ): Promise<BehaviorResult> {
    const startTime = Date.now();

    // Execute all tasks in parallel
    const promises = tasks.map(task => this.executeTask(task, worldState, startTime));
    const results = await Promise.all(promises);

    // Update state
    this.state.completedTasks = results.length;
    this.state.succeededTasks = results.filter(r => r.status === BehaviorStatus.SUCCESS).length;
    this.state.failedTasks = results.filter(r => r.status === BehaviorStatus.FAILURE).length;
    this.state.runningTasks = 0;
    this.state.results = results;

    // Check completion strategy
    const success = this.checkCompletionStrategy();

    console.log(
      `[Parallel:${this.name}] Completed: ${this.state.succeededTasks}/${this.state.totalTasks} succeeded`
    );

    if (success) {
      return {
        status: BehaviorStatus.SUCCESS,
        message: `Parallel execution succeeded (${this.state.succeededTasks}/${this.state.totalTasks})`,
        data: { state: this.state },
      };
    } else {
      return {
        status: BehaviorStatus.FAILURE,
        message: `Parallel execution failed (${this.state.succeededTasks}/${this.state.totalTasks})`,
        data: { state: this.state },
      };
    }
  }

  /**
   * Execute until first task completes (race)
   */
  private async executeFirstComplete(
    tasks: ParallelTask[],
    worldState: WorldState
  ): Promise<BehaviorResult> {
    const startTime = Date.now();

    console.log(`[Parallel:${this.name}] Racing ${tasks.length} tasks (FIRST strategy)`);

    // Race all tasks
    const promises = tasks.map(task => this.executeTask(task, worldState, startTime));

    try {
      const firstResult = await Promise.race(promises);

      this.state.runningTasks = 0;
      this.state.completedTasks = 1;

      if (firstResult.status === BehaviorStatus.SUCCESS) {
        this.state.succeededTasks = 1;

        return {
          status: BehaviorStatus.SUCCESS,
          message: `First task completed: ${firstResult.behaviorName}`,
          data: { firstResult, state: this.state },
        };
      } else {
        this.state.failedTasks = 1;

        return {
          status: BehaviorStatus.FAILURE,
          message: `First task failed: ${firstResult.behaviorName}`,
          data: { firstResult, state: this.state },
        };
      }
    } catch (error) {
      return {
        status: BehaviorStatus.FAILURE,
        message: `Parallel execution error: ${error}`,
      };
    }
  }

  /**
   * Execute a single task and track result
   */
  private async executeTask(
    task: ParallelTask,
    worldState: WorldState,
    startTime: number
  ): Promise<ParallelTaskResult> {
    const taskStartTime = Date.now();

    console.log(`[Parallel:${this.name}:${task.id}] Starting ${task.behavior.name}`);

    const result = await task.behavior.execute(worldState);

    const taskEndTime = Date.now();

    const taskResult: ParallelTaskResult = {
      taskId: task.id!,
      behaviorName: task.behavior.name,
      status: result.status,
      message: result.message,
      startTime: taskStartTime,
      endTime: taskEndTime,
      duration: taskEndTime - taskStartTime,
    };

    console.log(
      `[Parallel:${this.name}:${task.id}] Completed ${task.behavior.name} (${taskResult.duration}ms) - ${result.status}`
    );

    return taskResult;
  }

  /**
   * Check if completion strategy is satisfied
   */
  private checkCompletionStrategy(): boolean {
    switch (this.completionStrategy) {
      case ParallelCompletionStrategy.ALL:
        // All non-optional tasks must succeed
        const requiredTasks = this.tasks.filter(t => !t.optional).length;
        return this.state.succeededTasks >= requiredTasks;

      case ParallelCompletionStrategy.ANY:
        // At least one task must succeed
        return this.state.succeededTasks > 0;

      case ParallelCompletionStrategy.MAJORITY:
        // More than half must succeed
        return this.state.succeededTasks > this.state.totalTasks / 2;

      case ParallelCompletionStrategy.FIRST:
        // Already handled in executeFirstComplete
        return true;

      default:
        return false;
    }
  }

  /**
   * Detect resource conflicts between tasks
   */
  private detectConflicts(): string[] {
    const conflicts: string[] = [];
    const resourceMap: Map<string, string[]> = new Map();

    // Build resource usage map
    for (const task of this.tasks) {
      if (task.resources) {
        for (const resource of task.resources) {
          if (!resourceMap.has(resource)) {
            resourceMap.set(resource, []);
          }
          resourceMap.get(resource)!.push(task.id!);
        }
      }
    }

    // Find conflicts (resources used by multiple tasks)
    for (const [resource, taskIds] of resourceMap.entries()) {
      if (taskIds.length > 1) {
        conflicts.push(`${resource} (used by ${taskIds.join(', ')})`);
      }
    }

    return conflicts;
  }

  /**
   * Remove tasks that have resource conflicts
   */
  private removeConflictingTasks(conflicts: string[]): void {
    // Extract resource names from conflict strings
    const conflictedResources = conflicts.map(c => c.split(' ')[0]);

    // Remove tasks using conflicted resources
    this.tasks = this.tasks.filter(task => {
      if (!task.resources) return true;

      for (const resource of task.resources) {
        if (conflictedResources.includes(resource)) {
          console.log(`[Parallel:${this.name}] Removing conflicting task: ${task.id}`);
          return false;
        }
      }

      return true;
    });

    this.state.totalTasks = this.tasks.length;
  }

  /**
   * Get current execution state
   */
  getState(): ParallelState {
    return { ...this.state };
  }

  /**
   * Get progress (0-1)
   */
  getProgress(): number {
    if (this.state.totalTasks === 0) {
      return 0;
    }

    return this.state.completedTasks / this.state.totalTasks;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    super.reset();
    this.state = this.createInitialState();
  }

  /**
   * Create initial state
   */
  private createInitialState(): ParallelState {
    return {
      totalTasks: this.tasks.length,
      completedTasks: 0,
      succeededTasks: 0,
      failedTasks: 0,
      runningTasks: 0,
      results: [],
      conflicts: [],
    };
  }

  /**
   * Get all tasks
   */
  getTasks(): ParallelTask[] {
    return [...this.tasks];
  }
}
