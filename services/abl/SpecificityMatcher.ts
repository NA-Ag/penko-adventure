/**
 * SpecificityMatcher - FACADE 3.6
 *
 * Determines how specific a behavior is to the current situation.
 * More specific behaviors are preferred over generic ones.
 *
 * Specificity factors:
 * - Target specificity: specific NPC > any NPC
 * - Parameter specificity: "beer" > "drink"
 * - Context specificity: "at bar" > "anywhere"
 * - Relationship specificity: "friend" > "anyone"
 *
 * Based on Facade's ABL specificity system where more specific
 * behaviors override generic fallback behaviors.
 */

import { WorldState } from './WorldState';

/**
 * Specificity criteria for matching
 */
export interface SpecificityCriteria {
  /** Target entity ID (null = any target) */
  targetId?: string | null;

  /** Target type (null = any type) */
  targetType?: string | null;

  /** Required parameters (empty = no specific params) */
  parameters?: Record<string, any>;

  /** Required context conditions (empty = no specific context) */
  contextRequirements?: string[];

  /** Relationship requirements (null = any relationship) */
  relationshipLevel?: 'friend' | 'acquaintance' | 'stranger' | null;
}

/**
 * Specificity score breakdown
 */
export interface SpecificityScore {
  total: number; // 0-1
  targetScore: number; // 0-0.4
  parameterScore: number; // 0-0.3
  contextScore: number; // 0-0.2
  relationshipScore: number; // 0-0.1
}

/**
 * Matches behaviors to situations and calculates specificity
 */
export class SpecificityMatcher {
  /**
   * Calculate specificity score for a behavior in current situation
   *
   * Score breakdown:
   * - Target specificity: 0-0.4 (40%)
   * - Parameter specificity: 0-0.3 (30%)
   * - Context specificity: 0-0.2 (20%)
   * - Relationship specificity: 0-0.1 (10%)
   *
   * Total: 0-1.0
   */
  static calculateScore(
    criteria: SpecificityCriteria,
    worldState: WorldState,
    targetId?: string,
    parameters?: Record<string, any>
  ): SpecificityScore {
    const targetScore = this.calculateTargetScore(criteria, targetId);
    const parameterScore = this.calculateParameterScore(criteria, parameters);
    const contextScore = this.calculateContextScore(criteria, worldState);
    const relationshipScore = this.calculateRelationshipScore(criteria, worldState, targetId);

    const total = targetScore + parameterScore + contextScore + relationshipScore;

    return {
      total,
      targetScore,
      parameterScore,
      contextScore,
      relationshipScore,
    };
  }

  /**
   * Calculate target specificity (0-0.4)
   *
   * Scoring:
   * - Specific target ID match: 0.4
   * - Specific target type match: 0.3
   * - Any target type match: 0.2
   * - No target requirement: 0.1
   */
  private static calculateTargetScore(
    criteria: SpecificityCriteria,
    targetId?: string
  ): number {
    // Specific target ID required and matches
    if (criteria.targetId && targetId && criteria.targetId === targetId) {
      return 0.4;
    }

    // Specific target ID required but doesn't match
    if (criteria.targetId && (!targetId || criteria.targetId !== targetId)) {
      return 0.0;
    }

    // Specific target type required
    if (criteria.targetType) {
      // Would need to check actual target type from world state
      // For now, assume match if target type is specified
      return 0.3;
    }

    // Any target acceptable
    if (criteria.targetId === null && criteria.targetType === null) {
      return 0.2;
    }

    // No target requirement (generic behavior)
    return 0.1;
  }

  /**
   * Calculate parameter specificity (0-0.3)
   *
   * Scoring:
   * - All specific parameters match: 0.3
   * - Some specific parameters match: 0.15
   * - No specific parameters required: 0.1
   * - Parameters don't match: 0.0
   */
  private static calculateParameterScore(
    criteria: SpecificityCriteria,
    parameters?: Record<string, any>
  ): number {
    if (!criteria.parameters || Object.keys(criteria.parameters).length === 0) {
      // No specific parameters required (generic)
      return 0.1;
    }

    if (!parameters) {
      // Specific parameters required but none provided
      return 0.0;
    }

    let matchCount = 0;
    let totalCount = 0;

    for (const [key, value] of Object.entries(criteria.parameters)) {
      totalCount++;
      if (parameters[key] === value) {
        matchCount++;
      }
    }

    if (matchCount === totalCount) {
      return 0.3; // All match
    } else if (matchCount > 0) {
      return 0.15; // Partial match
    } else {
      return 0.0; // No match
    }
  }

  /**
   * Calculate context specificity (0-0.2)
   *
   * Scoring:
   * - All context requirements met: 0.2
   * - Some context requirements met: 0.1
   * - No context requirements: 0.05
   * - Context requirements not met: 0.0
   */
  private static calculateContextScore(
    criteria: SpecificityCriteria,
    worldState: WorldState
  ): number {
    if (!criteria.contextRequirements || criteria.contextRequirements.length === 0) {
      // No specific context required (generic)
      return 0.05;
    }

    let metCount = 0;
    for (const requirement of criteria.contextRequirements) {
      // Check if requirement is met in world state
      if (worldState.has(requirement) && worldState.get(requirement) === true) {
        metCount++;
      }
    }

    const totalCount = criteria.contextRequirements.length;

    if (metCount === totalCount) {
      return 0.2; // All met
    } else if (metCount > 0) {
      return 0.1; // Partial
    } else {
      return 0.0; // None met
    }
  }

  /**
   * Calculate relationship specificity (0-0.1)
   *
   * Scoring:
   * - Specific relationship level matches: 0.1
   * - No relationship requirement: 0.05
   * - Relationship level doesn't match: 0.0
   */
  private static calculateRelationshipScore(
    criteria: SpecificityCriteria,
    worldState: WorldState,
    targetId?: string
  ): number {
    if (!criteria.relationshipLevel) {
      // No specific relationship required (generic)
      return 0.05;
    }

    if (!targetId) {
      // Relationship required but no target specified
      return 0.0;
    }

    // Get relationship level from world state
    const relationshipKey = `relationship_${targetId}`;
    const actualRelationship = worldState.get(relationshipKey);

    if (actualRelationship === criteria.relationshipLevel) {
      return 0.1; // Match
    } else {
      return 0.0; // No match
    }
  }

  /**
   * Compare two behaviors by specificity
   * Returns: positive if a > b, negative if b > a, 0 if equal
   */
  static compareBehaviors(
    criteriaA: SpecificityCriteria,
    criteriaB: SpecificityCriteria,
    worldState: WorldState,
    targetId?: string,
    parameters?: Record<string, any>
  ): number {
    const scoreA = this.calculateScore(criteriaA, worldState, targetId, parameters);
    const scoreB = this.calculateScore(criteriaB, worldState, targetId, parameters);

    return scoreA.total - scoreB.total;
  }

  /**
   * Helper: Create criteria for specific target
   */
  static forSpecificTarget(targetId: string): SpecificityCriteria {
    return {
      targetId,
      targetType: null,
      parameters: {},
      contextRequirements: [],
      relationshipLevel: null,
    };
  }

  /**
   * Helper: Create criteria for target type
   */
  static forTargetType(targetType: string): SpecificityCriteria {
    return {
      targetId: null,
      targetType,
      parameters: {},
      contextRequirements: [],
      relationshipLevel: null,
    };
  }

  /**
   * Helper: Create criteria with parameters
   */
  static withParameters(parameters: Record<string, any>): SpecificityCriteria {
    return {
      targetId: null,
      targetType: null,
      parameters,
      contextRequirements: [],
      relationshipLevel: null,
    };
  }

  /**
   * Helper: Create criteria with context
   */
  static withContext(contextRequirements: string[]): SpecificityCriteria {
    return {
      targetId: null,
      targetType: null,
      parameters: {},
      contextRequirements,
      relationshipLevel: null,
    };
  }

  /**
   * Helper: Create criteria with relationship
   */
  static withRelationship(level: 'friend' | 'acquaintance' | 'stranger'): SpecificityCriteria {
    return {
      targetId: null,
      targetType: null,
      parameters: {},
      contextRequirements: [],
      relationshipLevel: level,
    };
  }

  /**
   * Helper: Create generic criteria (accepts anything)
   */
  static generic(): SpecificityCriteria {
    return {
      targetId: null,
      targetType: null,
      parameters: {},
      contextRequirements: [],
      relationshipLevel: null,
    };
  }
}

/**
 * Specificity-aware behavior wrapper
 */
export interface ISpecificBehavior {
  /** The behavior implementation */
  behavior: any;

  /** Specificity criteria for this behavior */
  specificityCriteria: SpecificityCriteria;

  /** Calculate how well this behavior matches the situation */
  calculateSpecificity(
    worldState: WorldState,
    targetId?: string,
    parameters?: Record<string, any>
  ): number;
}

/**
 * Helper: Create a specificity-aware behavior
 */
export function createSpecificBehavior(
  behavior: any,
  specificityCriteria: SpecificityCriteria
): ISpecificBehavior {
  return {
    behavior,
    specificityCriteria,
    calculateSpecificity(worldState, targetId, parameters) {
      const score = SpecificityMatcher.calculateScore(
        this.specificityCriteria,
        worldState,
        targetId,
        parameters
      );
      return score.total;
    },
  };
}
