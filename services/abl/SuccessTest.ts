/**
 * SuccessTest - FACADE 3.4
 *
 * Success tests determine if a behavior achieved its goal.
 * Unlike preconditions (checked before) and context conditions (checked during),
 * success tests are evaluated AFTER behavior execution.
 *
 * Success tests enable:
 * - Clear goal definition ("what does success look like?")
 * - Partial success detection (some goals achieved, others not)
 * - Parent behaviors checking if child behaviors succeeded
 * - Alternative approaches when first attempt fails
 *
 * Based on Facade's success/failure evaluation system.
 */

import { WorldState, WorldStateValue } from './WorldState';
import { PreconditionBuilder } from './Precondition';

/**
 * Success test check function
 */
export type SuccessTestCheck = (worldState: WorldState, result?: any) => boolean;

/**
 * Success test interface
 */
export interface ISuccessTest {
  description: string;
  check: SuccessTestCheck;
  weight?: number; // For weighted success (0-1, default 1)
}

/**
 * Success result with details
 */
export interface SuccessResult {
  achieved: boolean;
  score: number; // 0-1, weighted average of all tests
  failedTests: string[]; // Descriptions of failed tests
  passedTests: string[]; // Descriptions of passed tests
  partialSuccess: boolean; // Some tests passed, some failed
}

/**
 * Success test builder
 */
export class SuccessTestBuilder {
  private description: string;
  private checkFn: SuccessTestCheck;
  private weight: number;

  constructor(description: string, checkFn: SuccessTestCheck, weight: number = 1.0) {
    this.description = description;
    this.checkFn = checkFn;
    this.weight = Math.max(0, Math.min(1, weight)); // Clamp 0-1
  }

  /**
   * Build the final success test
   */
  build(): ISuccessTest {
    return {
      description: this.description,
      check: this.checkFn,
      weight: this.weight,
    };
  }

  /**
   * Set weight for this test (0-1)
   */
  withWeight(weight: number): SuccessTestBuilder {
    this.weight = Math.max(0, Math.min(1, weight));
    return this;
  }

  /**
   * Combine with another test using AND
   */
  and(other: SuccessTestBuilder): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `(${this.description}) AND (${other.description})`,
      (ws: WorldState, result?: any) => this.checkFn(ws, result) && other.checkFn(ws, result),
      Math.min(this.weight, other.weight) // Use lower weight
    );
  }

  /**
   * Combine with another test using OR
   */
  or(other: SuccessTestBuilder): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `(${this.description}) OR (${other.description})`,
      (ws: WorldState, result?: any) => this.checkFn(ws, result) || other.checkFn(ws, result),
      Math.max(this.weight, other.weight) // Use higher weight
    );
  }

  // ===== STATIC FACTORY METHODS =====

  /**
   * Create from PreconditionBuilder (reuse logic)
   */
  static fromPrecondition(precondition: PreconditionBuilder, weight: number = 1.0): SuccessTestBuilder {
    const built = precondition.build();
    return new SuccessTestBuilder(built.description, built.check, weight);
  }

  /**
   * State value equals expected
   */
  static stateEquals(key: string, expectedValue: WorldStateValue, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `${key} == ${JSON.stringify(expectedValue)}`,
      (ws) => ws.get(key) === expectedValue,
      weight
    );
  }

  /**
   * State value greater than threshold
   */
  static stateGreaterThan(key: string, threshold: number, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `${key} > ${threshold}`,
      (ws) => {
        const value = ws.get(key);
        return typeof value === 'number' && value > threshold;
      },
      weight
    );
  }

  /**
   * State value greater or equal to threshold
   */
  static stateGreaterOrEqual(key: string, threshold: number, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `${key} >= ${threshold}`,
      (ws) => {
        const value = ws.get(key);
        return typeof value === 'number' && value >= threshold;
      },
      weight
    );
  }

  /**
   * State value in range
   */
  static stateBetween(key: string, min: number, max: number, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `${key} between ${min} and ${max}`,
      (ws) => {
        const value = ws.get(key);
        return typeof value === 'number' && value >= min && value <= max;
      },
      weight
    );
  }

  /**
   * State key exists
   */
  static stateExists(key: string, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `${key} exists`,
      (ws) => ws.has(key),
      weight
    );
  }

  /**
   * Multiple items collected
   */
  static collectedCount(key: string, targetCount: number, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `Collected ${targetCount} ${key}`,
      (ws) => {
        const count = ws.get(key);
        return typeof count === 'number' && count >= targetCount;
      },
      weight
    );
  }

  /**
   * Task completed within time limit
   */
  static completedInTime(startTimeKey: string, maxDurationMs: number, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `Completed within ${maxDurationMs}ms`,
      (ws) => {
        const startTime = ws.get(startTimeKey) as number;
        if (!startTime) return false;
        const duration = Date.now() - startTime;
        return duration <= maxDurationMs;
      },
      weight
    );
  }

  /**
   * Goal delivered to target
   */
  static deliveredTo(deliveryKey: string, targetId: string, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(
      `${deliveryKey} delivered to ${targetId}`,
      (ws) => ws.get(deliveryKey) === targetId,
      weight
    );
  }

  /**
   * Check result data
   */
  static resultDataMatches(
    description: string,
    checkFn: (result: any) => boolean,
    weight: number = 1.0
  ): SuccessTestBuilder {
    return new SuccessTestBuilder(
      description,
      (ws, result) => result && checkFn(result),
      weight
    );
  }

  /**
   * Custom success test
   */
  static custom(description: string, checkFn: SuccessTestCheck, weight: number = 1.0): SuccessTestBuilder {
    return new SuccessTestBuilder(description, checkFn, weight);
  }

  /**
   * Combine multiple tests (all must pass)
   */
  static all(...tests: SuccessTestBuilder[]): SuccessTestBuilder {
    if (tests.length === 0) {
      return new SuccessTestBuilder('always true', () => true, 1.0);
    }

    if (tests.length === 1) {
      return tests[0];
    }

    return tests.reduce((acc, curr) => acc.and(curr));
  }

  /**
   * Combine multiple tests (any must pass)
   */
  static any(...tests: SuccessTestBuilder[]): SuccessTestBuilder {
    if (tests.length === 0) {
      return new SuccessTestBuilder('always false', () => false, 0.0);
    }

    if (tests.length === 1) {
      return tests[0];
    }

    return tests.reduce((acc, curr) => acc.or(curr));
  }
}

/**
 * Success evaluator - evaluate multiple success tests
 */
export class SuccessEvaluator {
  private tests: ISuccessTest[] = [];

  /**
   * Add a success test
   */
  addTest(test: ISuccessTest): void {
    this.tests.push(test);
  }

  /**
   * Evaluate all tests and return detailed result
   */
  evaluate(worldState: WorldState, result?: any): SuccessResult {
    if (this.tests.length === 0) {
      return {
        achieved: true,
        score: 1.0,
        failedTests: [],
        passedTests: [],
        partialSuccess: false,
      };
    }

    const passedTests: string[] = [];
    const failedTests: string[] = [];
    let totalWeight = 0;
    let achievedWeight = 0;

    for (const test of this.tests) {
      const weight = test.weight || 1.0;
      totalWeight += weight;

      if (test.check(worldState, result)) {
        passedTests.push(test.description);
        achievedWeight += weight;
      } else {
        failedTests.push(test.description);
      }
    }

    const score = totalWeight > 0 ? achievedWeight / totalWeight : 0;
    const achieved = failedTests.length === 0;
    const partialSuccess = passedTests.length > 0 && failedTests.length > 0;

    return {
      achieved,
      score,
      failedTests,
      passedTests,
      partialSuccess,
    };
  }

  /**
   * Get all tests
   */
  getTests(): ISuccessTest[] {
    return [...this.tests];
  }

  /**
   * Clear all tests
   */
  clear(): void {
    this.tests = [];
  }
}

/**
 * Helper: Create success criteria from multiple objectives
 */
export class SuccessCriteria {
  private primaryObjectives: SuccessTestBuilder[] = [];
  private secondaryObjectives: SuccessTestBuilder[] = [];
  private bonusObjectives: SuccessTestBuilder[] = [];

  /**
   * Add primary objective (required for success)
   */
  addPrimary(test: SuccessTestBuilder): SuccessCriteria {
    this.primaryObjectives.push(test);
    return this;
  }

  /**
   * Add secondary objective (important but not required)
   */
  addSecondary(test: SuccessTestBuilder): SuccessCriteria {
    this.secondaryObjectives.push(test);
    return this;
  }

  /**
   * Add bonus objective (optional, increases score)
   */
  addBonus(test: SuccessTestBuilder): SuccessCriteria {
    this.bonusObjectives.push(test);
    return this;
  }

  /**
   * Build final success test with weighted objectives
   */
  build(): ISuccessTest {
    const description = [
      this.primaryObjectives.length > 0 ? `Primary: ${this.primaryObjectives.length} objectives` : '',
      this.secondaryObjectives.length > 0 ? `Secondary: ${this.secondaryObjectives.length} objectives` : '',
      this.bonusObjectives.length > 0 ? `Bonus: ${this.bonusObjectives.length} objectives` : '',
    ]
      .filter((s) => s)
      .join(', ');

    return {
      description,
      check: (ws: WorldState, result?: any) => {
        // All primary objectives must pass
        for (const test of this.primaryObjectives) {
          const built = test.build();
          if (!built.check(ws, result)) {
            return false;
          }
        }
        return true;
      },
      weight: 1.0,
    };
  }

  /**
   * Evaluate with detailed scoring
   */
  evaluateDetailed(worldState: WorldState, result?: any): {
    primaryScore: number;
    secondaryScore: number;
    bonusScore: number;
    totalScore: number;
    success: boolean;
  } {
    const evalPrimary = this.evaluateObjectives(this.primaryObjectives, worldState, result);
    const evalSecondary = this.evaluateObjectives(this.secondaryObjectives, worldState, result);
    const evalBonus = this.evaluateObjectives(this.bonusObjectives, worldState, result);

    // Weighted total: 60% primary, 30% secondary, 10% bonus
    const totalScore = evalPrimary * 0.6 + evalSecondary * 0.3 + evalBonus * 0.1;

    return {
      primaryScore: evalPrimary,
      secondaryScore: evalSecondary,
      bonusScore: evalBonus,
      totalScore,
      success: evalPrimary === 1.0, // All primary objectives must pass
    };
  }

  private evaluateObjectives(objectives: SuccessTestBuilder[], ws: WorldState, result?: any): number {
    if (objectives.length === 0) return 1.0;

    let passed = 0;
    for (const test of objectives) {
      const built = test.build();
      if (built.check(ws, result)) {
        passed++;
      }
    }

    return passed / objectives.length;
  }
}
