/**
 * SequentialBehavior - FACADE 3.7
 *
 * Sequential behavior composition where sub-behaviors execute in order.
 * Each step must complete before the next begins.
 *
 * Based on Facade's ABL sequential acts:
 * - Execute behaviors in strict order
 * - If a step fails, handle with recovery strategy
 * - Track progress through sequence
 * - Support checkpoints and resumption
 *
 * Recovery strategies:
 * - FAIL: Stop sequence and fail immediately
 * - RETRY: Retry failed step (with max attempts)
 * - SKIP: Skip failed step and continue
 * - FALLBACK: Execute alternative behavior
 */

import { Behavior, BehaviorStatus, BehaviorResult } from './Behavior';
import { WorldState } from './WorldState';

/**
 * Recovery strategy when a step fails
 */
export enum RecoveryStrategy {
  /** Fail entire sequence immediately */
  FAIL = 'fail',

  /** Retry failed step up to max attempts */
  RETRY = 'retry',

  /** Skip failed step and continue */
  SKIP = 'skip',

  /** Execute fallback behavior instead */
  FALLBACK = 'fallback',
}

/**
 * Sequential step configuration
 */
export interface SequentialStep {
  /** The behavior to execute */
  behavior: Behavior;

  /** Recovery strategy if this step fails */
  recoveryStrategy: RecoveryStrategy;

  /** Max retry attempts (for RETRY strategy) */
  maxRetries?: number;

  /** Fallback behavior (for FALLBACK strategy) */
  fallbackBehavior?: Behavior;

  /** Optional checkpoint name (for resumption) */
  checkpoint?: string;
}

/**
 * Sequential execution state
 */
export interface SequentialState {
  /** Current step index */
  currentStep: number;

  /** Total steps */
  totalSteps: number;

  /** Steps completed successfully */
  completedSteps: number;

  /** Steps failed */
  failedSteps: number;

  /** Steps skipped */
  skippedSteps: number;

  /** Current step retry count */
  currentRetries: number;

  /** Execution history */
  history: SequentialStepResult[];
}

/**
 * Result of executing a sequential step
 */
export interface SequentialStepResult {
  stepIndex: number;
  behaviorName: string;
  status: BehaviorStatus;
  message?: string;
  retries: number;
  checkpoint?: string;
}

/**
 * Sequential behavior that executes sub-behaviors in order
 */
export class SequentialBehavior extends Behavior {
  protected steps: SequentialStep[] = [];
  protected state: SequentialState;
  protected allowResume: boolean = true;

  constructor(
    id: string,
    name: string,
    priority: number = 50,
    specificity: number = 0.5,
    allowResume: boolean = true
  ) {
    super(id, name, priority, specificity);

    this.allowResume = allowResume;
    this.state = this.createInitialState();
  }

  /**
   * Add a step to the sequence
   */
  addStep(
    behavior: Behavior,
    recoveryStrategy: RecoveryStrategy = RecoveryStrategy.FAIL,
    maxRetries: number = 3,
    fallbackBehavior?: Behavior,
    checkpoint?: string
  ): void {
    this.steps.push({
      behavior,
      recoveryStrategy,
      maxRetries,
      fallbackBehavior,
      checkpoint,
    });

    // Update total steps
    this.state.totalSteps = this.steps.length;
  }

  /**
   * Add multiple steps at once
   */
  addSteps(steps: SequentialStep[]): void {
    this.steps.push(...steps);
    this.state.totalSteps = this.steps.length;
  }

  /**
   * Execute the sequential behavior
   */
  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(`[Sequential:${this.name}] Starting sequence (${this.state.totalSteps} steps)`);

    // Execute steps in order
    while (this.state.currentStep < this.steps.length) {
      const stepIndex = this.state.currentStep;
      const step = this.steps[stepIndex];

      console.log(
        `[Sequential:${this.name}] Step ${stepIndex + 1}/${this.steps.length}: ${step.behavior.name}`
      );

      // Check if step can execute
      if (!step.behavior.canExecute(worldState)) {
        console.log(`[Sequential:${this.name}] Step ${stepIndex + 1} cannot execute (preconditions not met)`);

        // Handle according to recovery strategy
        const handled = await this.handleStepFailure(step, stepIndex, worldState, 'preconditions_not_met');

        if (!handled) {
          return this.createFailureResult('Sequence failed: preconditions not met');
        }

        continue;
      }

      // Execute step
      const result = await step.behavior.execute(worldState);

      // Record step result
      this.recordStepResult(stepIndex, step, result);

      // Handle result
      if (result.status === BehaviorStatus.SUCCESS) {
        console.log(`[Sequential:${this.name}] Step ${stepIndex + 1} succeeded`);
        this.state.completedSteps++;
        this.state.currentRetries = 0;
        this.state.currentStep++;
      } else if (result.status === BehaviorStatus.FAILURE) {
        console.log(`[Sequential:${this.name}] Step ${stepIndex + 1} failed`);

        const handled = await this.handleStepFailure(step, stepIndex, worldState, result.message || 'step_failed');

        if (!handled) {
          return this.createFailureResult(`Sequence failed at step ${stepIndex + 1}: ${result.message}`);
        }
      } else if (result.status === BehaviorStatus.INTERRUPTED) {
        console.log(`[Sequential:${this.name}] Step ${stepIndex + 1} interrupted`);
        return {
          status: BehaviorStatus.INTERRUPTED,
          message: `Sequence interrupted at step ${stepIndex + 1}`,
        };
      }
    }

    console.log(`[Sequential:${this.name}] Sequence complete!`);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `Sequence completed: ${this.state.completedSteps}/${this.state.totalSteps} steps succeeded`,
      data: {
        state: this.state,
      },
    };
  }

  /**
   * Handle step failure according to recovery strategy
   * Returns true if sequence should continue, false if it should fail
   */
  private async handleStepFailure(
    step: SequentialStep,
    stepIndex: number,
    worldState: WorldState,
    reason: string
  ): Promise<boolean> {
    switch (step.recoveryStrategy) {
      case RecoveryStrategy.FAIL:
        console.log(`[Sequential:${this.name}] Recovery: FAIL - stopping sequence`);
        this.state.failedSteps++;
        return false;

      case RecoveryStrategy.RETRY:
        this.state.currentRetries++;

        if (this.state.currentRetries >= (step.maxRetries || 3)) {
          console.log(
            `[Sequential:${this.name}] Recovery: RETRY - max retries (${step.maxRetries}) exceeded, failing`
          );
          this.state.failedSteps++;
          return false;
        }

        console.log(
          `[Sequential:${this.name}] Recovery: RETRY - attempt ${this.state.currentRetries + 1}/${step.maxRetries}`
        );
        // Don't advance currentStep, will retry same step
        return true;

      case RecoveryStrategy.SKIP:
        console.log(`[Sequential:${this.name}] Recovery: SKIP - continuing to next step`);
        this.state.skippedSteps++;
        this.state.currentRetries = 0;
        this.state.currentStep++;
        return true;

      case RecoveryStrategy.FALLBACK:
        if (!step.fallbackBehavior) {
          console.log(`[Sequential:${this.name}] Recovery: FALLBACK - no fallback defined, failing`);
          this.state.failedSteps++;
          return false;
        }

        console.log(
          `[Sequential:${this.name}] Recovery: FALLBACK - executing ${step.fallbackBehavior.name}`
        );

        const fallbackResult = await step.fallbackBehavior.execute(worldState);

        if (fallbackResult.status === BehaviorStatus.SUCCESS) {
          console.log(`[Sequential:${this.name}] Fallback succeeded, continuing`);
          this.state.completedSteps++;
          this.state.currentRetries = 0;
          this.state.currentStep++;
          return true;
        } else {
          console.log(`[Sequential:${this.name}] Fallback failed, stopping sequence`);
          this.state.failedSteps++;
          return false;
        }

      default:
        return false;
    }
  }

  /**
   * Record result of step execution
   */
  private recordStepResult(stepIndex: number, step: SequentialStep, result: BehaviorResult): void {
    this.state.history.push({
      stepIndex,
      behaviorName: step.behavior.name,
      status: result.status,
      message: result.message,
      retries: this.state.currentRetries,
      checkpoint: step.checkpoint,
    });
  }

  /**
   * Create failure result
   */
  private createFailureResult(message: string): BehaviorResult {
    return {
      status: BehaviorStatus.FAILURE,
      message,
      data: {
        state: this.state,
      },
    };
  }

  /**
   * Reset sequence to beginning
   */
  reset(): void {
    super.reset();
    this.state = this.createInitialState();
  }

  /**
   * Resume from checkpoint
   */
  resumeFromCheckpoint(checkpointName: string): boolean {
    if (!this.allowResume) {
      return false;
    }

    // Find checkpoint in steps
    const stepIndex = this.steps.findIndex(s => s.checkpoint === checkpointName);

    if (stepIndex === -1) {
      return false;
    }

    // Reset to checkpoint
    this.state.currentStep = stepIndex;
    this.state.currentRetries = 0;

    console.log(`[Sequential:${this.name}] Resumed from checkpoint "${checkpointName}" (step ${stepIndex + 1})`);

    return true;
  }

  /**
   * Resume from specific step index
   */
  resumeFromStep(stepIndex: number): boolean {
    if (!this.allowResume) {
      return false;
    }

    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return false;
    }

    this.state.currentStep = stepIndex;
    this.state.currentRetries = 0;

    console.log(`[Sequential:${this.name}] Resumed from step ${stepIndex + 1}`);

    return true;
  }

  /**
   * Get current execution state
   */
  getState(): SequentialState {
    return { ...this.state };
  }

  /**
   * Get progress percentage (0-1)
   */
  getProgress(): number {
    if (this.state.totalSteps === 0) {
      return 0;
    }

    return this.state.currentStep / this.state.totalSteps;
  }

  /**
   * Create initial state
   */
  private createInitialState(): SequentialState {
    return {
      currentStep: 0,
      totalSteps: this.steps.length,
      completedSteps: 0,
      failedSteps: 0,
      skippedSteps: 0,
      currentRetries: 0,
      history: [],
    };
  }

  /**
   * Get all steps
   */
  getSteps(): SequentialStep[] {
    return [...this.steps];
  }
}
