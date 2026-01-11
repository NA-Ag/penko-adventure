/**
 * Precondition - FACADE 3.2
 *
 * Enhanced precondition system with logical operators (AND, OR, NOT)
 * and comparison operations (>, <, ==, !=, >=, <=).
 *
 * Allows building complex conditions like:
 * - (player_at_bar AND has_money) OR is_vip
 * - health > 50 AND NOT is_poisoned
 * - (relationship >= 0.5 OR visited_before) AND NOT banned
 */

import { WorldState, WorldStateValue } from './WorldState';

/**
 * Precondition check function
 */
export type PreconditionCheck = (worldState: WorldState) => boolean;

/**
 * Comparison operators
 */
export enum ComparisonOperator {
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_EQUAL = '>=',
  LESS_EQUAL = '<=',
  IN = 'in',
  NOT_IN = 'not_in',
}

/**
 * Logical operators
 */
export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

/**
 * Precondition interface
 */
export interface IPrecondition {
  description: string;
  check: PreconditionCheck;
}

/**
 * Precondition builder class
 */
export class PreconditionBuilder {
  private description: string;
  private checkFn: PreconditionCheck;

  constructor(description: string, checkFn: PreconditionCheck) {
    this.description = description;
    this.checkFn = checkFn;
  }

  /**
   * Build the final precondition
   */
  build(): IPrecondition {
    return {
      description: this.description,
      check: this.checkFn,
    };
  }

  /**
   * Combine with another precondition using AND
   */
  and(other: PreconditionBuilder): PreconditionBuilder {
    return new PreconditionBuilder(
      `(${this.description}) AND (${other.description})`,
      (ws: WorldState) => this.checkFn(ws) && other.checkFn(ws)
    );
  }

  /**
   * Combine with another precondition using OR
   */
  or(other: PreconditionBuilder): PreconditionBuilder {
    return new PreconditionBuilder(
      `(${this.description}) OR (${other.description})`,
      (ws: WorldState) => this.checkFn(ws) || other.checkFn(ws)
    );
  }

  /**
   * Negate this precondition
   */
  not(): PreconditionBuilder {
    return new PreconditionBuilder(
      `NOT (${this.description})`,
      (ws: WorldState) => !this.checkFn(ws)
    );
  }

  // ===== STATIC FACTORY METHODS =====

  /**
   * Create precondition: key exists
   */
  static exists(key: string): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} exists`,
      (ws: WorldState) => ws.has(key)
    );
  }

  /**
   * Create precondition: key does not exist
   */
  static notExists(key: string): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} does not exist`,
      (ws: WorldState) => !ws.has(key)
    );
  }

  /**
   * Create precondition: key equals value
   */
  static equals(key: string, value: WorldStateValue): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} == ${JSON.stringify(value)}`,
      (ws: WorldState) => ws.get(key) === value
    );
  }

  /**
   * Create precondition: key not equals value
   */
  static notEquals(key: string, value: WorldStateValue): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} != ${JSON.stringify(value)}`,
      (ws: WorldState) => ws.get(key) !== value
    );
  }

  /**
   * Create precondition: numeric comparison >
   */
  static greaterThan(key: string, threshold: number): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} > ${threshold}`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return typeof value === 'number' && value > threshold;
      }
    );
  }

  /**
   * Create precondition: numeric comparison <
   */
  static lessThan(key: string, threshold: number): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} < ${threshold}`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return typeof value === 'number' && value < threshold;
      }
    );
  }

  /**
   * Create precondition: numeric comparison >=
   */
  static greaterOrEqual(key: string, threshold: number): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} >= ${threshold}`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return typeof value === 'number' && value >= threshold;
      }
    );
  }

  /**
   * Create precondition: numeric comparison <=
   */
  static lessOrEqual(key: string, threshold: number): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} <= ${threshold}`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return typeof value === 'number' && value <= threshold;
      }
    );
  }

  /**
   * Create precondition: value is in list
   */
  static isIn(key: string, values: WorldStateValue[]): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} in [${values.map(v => JSON.stringify(v)).join(', ')}]`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return values.includes(value);
      }
    );
  }

  /**
   * Create precondition: value is not in list
   */
  static notIn(key: string, values: WorldStateValue[]): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} not in [${values.map(v => JSON.stringify(v)).join(', ')}]`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return !values.includes(value);
      }
    );
  }

  /**
   * Create precondition: boolean is true
   */
  static isTrue(key: string): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} is true`,
      (ws: WorldState) => ws.get(key) === true
    );
  }

  /**
   * Create precondition: boolean is false
   */
  static isFalse(key: string): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} is false`,
      (ws: WorldState) => ws.get(key) === false
    );
  }

  /**
   * Create precondition: string contains substring
   */
  static contains(key: string, substring: string): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} contains "${substring}"`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return typeof value === 'string' && value.includes(substring);
      }
    );
  }

  /**
   * Create precondition: string starts with prefix
   */
  static startsWith(key: string, prefix: string): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} starts with "${prefix}"`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return typeof value === 'string' && value.startsWith(prefix);
      }
    );
  }

  /**
   * Create precondition: string ends with suffix
   */
  static endsWith(key: string, suffix: string): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} ends with "${suffix}"`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return typeof value === 'string' && value.endsWith(suffix);
      }
    );
  }

  /**
   * Create precondition: value between min and max (inclusive)
   */
  static between(key: string, min: number, max: number): PreconditionBuilder {
    return new PreconditionBuilder(
      `${key} between ${min} and ${max}`,
      (ws: WorldState) => {
        const value = ws.get(key);
        return typeof value === 'number' && value >= min && value <= max;
      }
    );
  }

  /**
   * Create precondition: custom check function
   */
  static custom(description: string, checkFn: PreconditionCheck): PreconditionBuilder {
    return new PreconditionBuilder(description, checkFn);
  }

  /**
   * Combine multiple preconditions with AND
   */
  static all(...preconditions: PreconditionBuilder[]): PreconditionBuilder {
    if (preconditions.length === 0) {
      return new PreconditionBuilder('always true', () => true);
    }

    if (preconditions.length === 1) {
      return preconditions[0];
    }

    return preconditions.reduce((acc, curr) => acc.and(curr));
  }

  /**
   * Combine multiple preconditions with OR
   */
  static any(...preconditions: PreconditionBuilder[]): PreconditionBuilder {
    if (preconditions.length === 0) {
      return new PreconditionBuilder('always false', () => false);
    }

    if (preconditions.length === 1) {
      return preconditions[0];
    }

    return preconditions.reduce((acc, curr) => acc.or(curr));
  }

  /**
   * Create precondition that's always true
   */
  static alwaysTrue(): PreconditionBuilder {
    return new PreconditionBuilder('always true', () => true);
  }

  /**
   * Create precondition that's always false
   */
  static alwaysFalse(): PreconditionBuilder {
    return new PreconditionBuilder('always false', () => false);
  }
}

/**
 * Precondition cache for performance optimization
 */
export class PreconditionCache {
  private cache: Map<string, { result: boolean; timestamp: number }> = new Map();
  private ttl: number; // Time to live in milliseconds

  constructor(ttl: number = 1000) {
    this.ttl = ttl;
  }

  /**
   * Get cached result if still valid
   */
  get(key: string): boolean | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  /**
   * Store result in cache
   */
  set(key: string, result: boolean): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; ttl: number } {
    return {
      size: this.cache.size,
      ttl: this.ttl,
    };
  }
}

/**
 * Cached precondition wrapper
 */
export class CachedPrecondition implements IPrecondition {
  private precondition: IPrecondition;
  private cache: PreconditionCache;
  private cacheKey: string;

  constructor(precondition: IPrecondition, cache: PreconditionCache) {
    this.precondition = precondition;
    this.cache = cache;
    this.cacheKey = `precondition:${precondition.description}`;
  }

  get description(): string {
    return this.precondition.description;
  }

  check(worldState: WorldState): boolean {
    // Try cache first
    const cached = this.cache.get(this.cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Evaluate and cache
    const result = this.precondition.check(worldState);
    this.cache.set(this.cacheKey, result);

    return result;
  }
}
