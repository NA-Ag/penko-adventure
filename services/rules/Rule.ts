/**
 * Rule - FACADE 6.1
 *
 * Rule-based system inspired by JESS (Java Expert System Shell).
 * Rules consist of conditions (LHS) and actions (RHS).
 *
 * Features:
 * - Pattern matching against WMEs
 * - Wildcard support in patterns
 * - Variable binding
 * - Complex conditions (AND, OR, NOT)
 * - Priority-based rule ordering
 * - Rule activation and firing
 *
 * This enables:
 * - Reactive NPC behaviors
 * - Event-driven logic
 * - Complex pattern matching
 * - Declarative rule definitions
 */

import { IWME } from '../wm/WME';
import { WorkingMemory } from '../wm/WorkingMemory';

/**
 * Pattern for matching WMEs
 */
export interface Pattern {
  /** WME type to match */
  type: string;

  /** Attribute patterns (exact match or wildcard) */
  attributes?: Record<string, any>;

  /** Variable to bind this WME to */
  bindTo?: string;

  /** Custom filter function */
  filter?: (wme: IWME) => boolean;
}

/**
 * Rule condition - combines multiple patterns
 */
export interface RuleCondition {
  /** Patterns that must all match (AND) */
  patterns: Pattern[];

  /** Optional custom validation */
  validate?: (bindings: Map<string, IWME>) => boolean;
}

/**
 * Rule action - what happens when rule fires
 */
export type RuleAction = (
  bindings: Map<string, IWME>,
  wm: WorkingMemory
) => void;

/**
 * Rule activation - a specific match of rule conditions
 */
export interface RuleActivation {
  rule: Rule;
  bindings: Map<string, IWME>;
  timestamp: number;
  priority: number;
}

/**
 * Rule - combines conditions (LHS) with actions (RHS)
 */
export class Rule {
  readonly name: string;
  readonly description: string;
  readonly priority: number;
  private condition: RuleCondition;
  private actions: RuleAction[];
  private enabled: boolean = true;
  private fireCount: number = 0;
  private lastFired: number = 0;

  constructor(
    name: string,
    description: string,
    condition: RuleCondition,
    actions: RuleAction[],
    priority: number = 50
  ) {
    this.name = name;
    this.description = description;
    this.condition = condition;
    this.actions = actions;
    this.priority = priority;
  }

  /**
   * Check if rule conditions match current working memory
   */
  match(wm: WorkingMemory): RuleActivation[] {
    if (!this.enabled) return [];

    const activations: RuleActivation[] = [];

    // Find all possible bindings for the patterns
    const allBindingSets = this.findAllBindings(wm);

    for (const bindings of allBindingSets) {
      // Validate custom condition if present
      if (this.condition.validate && !this.condition.validate(bindings)) {
        continue;
      }

      activations.push({
        rule: this,
        bindings,
        timestamp: Date.now(),
        priority: this.priority,
      });
    }

    return activations;
  }

  /**
   * Find all possible variable bindings for patterns
   */
  private findAllBindings(wm: WorkingMemory): Map<string, IWME>[] {
    const results: Map<string, IWME>[] = [];

    // Start with first pattern
    if (this.condition.patterns.length === 0) {
      return [new Map()];
    }

    // Find matches for first pattern
    const firstPattern = this.condition.patterns[0];
    const firstMatches = this.matchPattern(firstPattern, wm, new Map());

    if (firstMatches.length === 0) {
      return [];
    }

    // Recursively match remaining patterns
    for (const bindings of firstMatches) {
      const remainingResults = this.matchRemainingPatterns(1, bindings, wm);
      results.push(...remainingResults);
    }

    return results;
  }

  /**
   * Match remaining patterns recursively
   */
  private matchRemainingPatterns(
    patternIndex: number,
    currentBindings: Map<string, IWME>,
    wm: WorkingMemory
  ): Map<string, IWME>[] {
    // Base case: all patterns matched
    if (patternIndex >= this.condition.patterns.length) {
      return [currentBindings];
    }

    const results: Map<string, IWME>[] = [];
    const pattern = this.condition.patterns[patternIndex];

    // Find matches for this pattern
    const matches = this.matchPattern(pattern, wm, currentBindings);

    // Recursively match remaining patterns
    for (const bindings of matches) {
      const remainingResults = this.matchRemainingPatterns(
        patternIndex + 1,
        bindings,
        wm
      );
      results.push(...remainingResults);
    }

    return results;
  }

  /**
   * Match a single pattern against working memory
   */
  private matchPattern(
    pattern: Pattern,
    wm: WorkingMemory,
    currentBindings: Map<string, IWME>
  ): Map<string, IWME>[] {
    const results: Map<string, IWME>[] = [];

    // Get candidate WMEs
    const candidates = wm.getByType(pattern.type);

    for (const wme of candidates) {
      // Check if WME matches pattern
      if (!this.matchesPattern(wme, pattern, currentBindings)) {
        continue;
      }

      // Create new bindings with this WME
      const newBindings = new Map(currentBindings);

      if (pattern.bindTo) {
        newBindings.set(pattern.bindTo, wme);
      }

      results.push(newBindings);
    }

    return results;
  }

  /**
   * Check if WME matches a pattern
   */
  private matchesPattern(
    wme: IWME,
    pattern: Pattern,
    currentBindings: Map<string, IWME>
  ): boolean {
    // Type must match
    if (wme.type !== pattern.type) {
      return false;
    }

    // Check attribute patterns
    if (pattern.attributes) {
      for (const [key, expectedValue] of Object.entries(pattern.attributes)) {
        const actualValue = wme.getAttribute(key);

        // Handle wildcards
        if (expectedValue === '*' || expectedValue === '?') {
          continue; // Wildcard matches anything
        }

        // Handle variable references (start with $)
        if (
          typeof expectedValue === 'string' &&
          expectedValue.startsWith('$')
        ) {
          const varName = expectedValue.substring(1);

          // If variable already bound, must match bound value
          if (currentBindings.has(varName)) {
            const boundWME = currentBindings.get(varName)!;
            if (actualValue !== boundWME.getAttribute(key)) {
              return false;
            }
          }
          // Variable will be bound to this value
          continue;
        }

        // Exact match required
        if (actualValue !== expectedValue) {
          return false;
        }
      }
    }

    // Custom filter
    if (pattern.filter && !pattern.filter(wme)) {
      return false;
    }

    return true;
  }

  /**
   * Fire the rule with given bindings
   */
  fire(bindings: Map<string, IWME>, wm: WorkingMemory): void {
    if (!this.enabled) return;

    this.fireCount++;
    this.lastFired = Date.now();

    // Execute all actions
    for (const action of this.actions) {
      try {
        action(bindings, wm);
      } catch (error) {
        console.error(`[Rule] Error executing action in rule "${this.name}":`, error);
      }
    }
  }

  /**
   * Enable/disable rule
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if rule is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get fire count
   */
  getFireCount(): number {
    return this.fireCount;
  }

  /**
   * Get last fired timestamp
   */
  getLastFired(): number {
    return this.lastFired;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.fireCount = 0;
    this.lastFired = 0;
  }

  /**
   * Get condition patterns
   */
  getPatterns(): Pattern[] {
    return [...this.condition.patterns];
  }

  /**
   * String representation
   */
  toString(): string {
    return `Rule[${this.name}] (priority: ${this.priority}, fires: ${this.fireCount})`;
  }
}

/**
 * Rule Builder - fluent API for creating rules
 */
export class RuleBuilder {
  private name: string = '';
  private description: string = '';
  private patterns: Pattern[] = [];
  private actions: RuleAction[] = [];
  private priority: number = 50;
  private customValidation?: (bindings: Map<string, IWME>) => boolean;

  /**
   * Set rule name
   */
  named(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Set rule description
   */
  describedAs(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * Add a pattern to match
   */
  when(pattern: Pattern): this {
    this.patterns.push(pattern);
    return this;
  }

  /**
   * Add pattern with type and attributes
   */
  whenType(
    type: string,
    attributes?: Record<string, any>,
    bindTo?: string
  ): this {
    this.patterns.push({ type, attributes, bindTo });
    return this;
  }

  /**
   * Add custom validation
   */
  validate(validator: (bindings: Map<string, IWME>) => boolean): this {
    this.customValidation = validator;
    return this;
  }

  /**
   * Add an action
   */
  then(action: RuleAction): this {
    this.actions.push(action);
    return this;
  }

  /**
   * Set priority
   */
  withPriority(priority: number): this {
    this.priority = priority;
    return this;
  }

  /**
   * Build the rule
   */
  build(): Rule {
    if (!this.name) {
      throw new Error('Rule must have a name');
    }

    if (this.patterns.length === 0) {
      throw new Error('Rule must have at least one pattern');
    }

    if (this.actions.length === 0) {
      throw new Error('Rule must have at least one action');
    }

    return new Rule(
      this.name,
      this.description,
      {
        patterns: this.patterns,
        validate: this.customValidation,
      },
      this.actions,
      this.priority
    );
  }
}

/**
 * Common rule patterns
 */
export class RulePatterns {
  /**
   * Match any WME of type
   */
  static anyOfType(type: string, bindTo?: string): Pattern {
    return { type, bindTo };
  }

  /**
   * Match WME with specific attribute
   */
  static withAttribute(
    type: string,
    attribute: string,
    value: any,
    bindTo?: string
  ): Pattern {
    return {
      type,
      attributes: { [attribute]: value },
      bindTo,
    };
  }

  /**
   * Match WME with wildcard attribute
   */
  static withAnyAttribute(type: string, attribute: string, bindTo?: string): Pattern {
    return {
      type,
      attributes: { [attribute]: '*' },
      bindTo,
    };
  }

  /**
   * Match WME with variable binding
   */
  static withVariable(
    type: string,
    attribute: string,
    variableName: string,
    bindTo?: string
  ): Pattern {
    return {
      type,
      attributes: { [attribute]: `$${variableName}` },
      bindTo,
    };
  }

  /**
   * Match WME with custom filter
   */
  static matching(
    type: string,
    filter: (wme: IWME) => boolean,
    bindTo?: string
  ): Pattern {
    return { type, filter, bindTo };
  }
}

/**
 * Common rule actions
 */
export class RuleActions {
  /**
   * Assert a new WME
   */
  static assert(wmeFactory: (bindings: Map<string, IWME>) => IWME): RuleAction {
    return (bindings, wm) => {
      const wme = wmeFactory(bindings);
      wm.assert(wme);
    };
  }

  /**
   * Retract a bound WME
   */
  static retract(bindingName: string): RuleAction {
    return (bindings, wm) => {
      const wme = bindings.get(bindingName);
      if (wme) {
        wm.retract(wme);
      }
    };
  }

  /**
   * Modify a bound WME
   */
  static modify(
    bindingName: string,
    changes: (wme: IWME, bindings: Map<string, IWME>) => Record<string, any>
  ): RuleAction {
    return (bindings, wm) => {
      const wme = bindings.get(bindingName);
      if (wme) {
        const changeMap = changes(wme, bindings);
        for (const [key, value] of Object.entries(changeMap)) {
          wme.setAttribute(key, value);
        }
        wm.modify(wme, changeMap);
      }
    };
  }

  /**
   * Log a message
   */
  static log(message: (bindings: Map<string, IWME>) => string): RuleAction {
    return (bindings) => {
      console.log(`[Rule] ${message(bindings)}`);
    };
  }

  /**
   * Execute custom function
   */
  static execute(fn: (bindings: Map<string, IWME>, wm: WorkingMemory) => void): RuleAction {
    return fn;
  }

  /**
   * Composite action - execute multiple actions
   */
  static all(...actions: RuleAction[]): RuleAction {
    return (bindings, wm) => {
      for (const action of actions) {
        action(bindings, wm);
      }
    };
  }
}

/**
 * Rule statistics
 */
export interface RuleStats {
  name: string;
  enabled: boolean;
  priority: number;
  fireCount: number;
  lastFired: number;
  patternCount: number;
}

/**
 * Helper to get rule statistics
 */
export function getRuleStats(rule: Rule): RuleStats {
  return {
    name: rule.name,
    enabled: rule.isEnabled(),
    priority: rule.priority,
    fireCount: rule.getFireCount(),
    lastFired: rule.getLastFired(),
    patternCount: rule.getPatterns().length,
  };
}
