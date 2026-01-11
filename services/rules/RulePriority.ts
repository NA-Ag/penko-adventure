/**
 * RulePriority - FACADE 6.4
 *
 * Advanced priority management for rules.
 * Ensures specific reactions fire before general ones.
 *
 * Features:
 * - Specificity-based priority calculation
 * - Urgency levels (CRITICAL, HIGH, NORMAL, LOW)
 * - Pattern specificity detection
 * - Automatic priority assignment
 * - Priority boosting/penalties
 * - Conflict resolution strategies
 *
 * This enables:
 * - Specific insult reaction > generic negative reaction
 * - Urgent reactions > social reactions
 * - Fine-grained control over rule firing order
 * - Automatic priority based on pattern complexity
 */

import { Rule, Pattern, RuleActivation } from './Rule';
import { IWME } from '../wm/WME';

/**
 * Urgency level for reactions
 */
export enum UrgencyLevel {
  /** Critical - must fire immediately (safety, survival) */
  CRITICAL = 1000,

  /** High - important but not critical (combat, threats) */
  HIGH = 750,

  /** Normal - standard reactions (social, exploration) */
  NORMAL = 500,

  /** Low - background, optional reactions */
  LOW = 250,
}

/**
 * Priority category for organizing rules
 */
export enum PriorityCategory {
  /** Survival and safety */
  SURVIVAL = 'survival',

  /** Combat and defense */
  COMBAT = 'combat',

  /** Social interactions */
  SOCIAL = 'social',

  /** Exploration and discovery */
  EXPLORATION = 'exploration',

  /** Background activities */
  BACKGROUND = 'background',
}

/**
 * Priority configuration for a rule
 */
export interface PriorityConfig {
  /** Base priority (manual override) */
  basePriority?: number;

  /** Urgency level */
  urgency?: UrgencyLevel;

  /** Priority category */
  category?: PriorityCategory;

  /** Specificity bonus (calculated automatically) */
  specificityBonus?: number;

  /** Manual boost/penalty */
  adjustment?: number;

  /** Should this rule preempt others? */
  preemptive?: boolean;

  /** Final computed priority */
  finalPriority?: number;
}

/**
 * Pattern specificity calculator
 */
export class SpecificityCalculator {
  /**
   * Calculate specificity score for a pattern
   * Higher score = more specific pattern
   */
  static calculatePatternSpecificity(pattern: Pattern): number {
    let score = 0;

    // Type matching (base score)
    score += 10;

    // Each specific attribute adds to specificity
    if (pattern.attributes) {
      for (const [key, value] of Object.entries(pattern.attributes)) {
        // Wildcard is less specific
        if (value === '*' || value === '?') {
          score += 1;
        }
        // Variable binding is moderately specific
        else if (typeof value === 'string' && value.startsWith('$')) {
          score += 3;
        }
        // Exact value is highly specific
        else {
          score += 5;
        }
      }
    }

    // Custom filter adds specificity
    if (pattern.filter) {
      score += 10;
    }

    // Variable binding adds specificity
    if (pattern.bindTo) {
      score += 2;
    }

    return score;
  }

  /**
   * Calculate specificity for all patterns in a rule
   */
  static calculateRuleSpecificity(patterns: Pattern[]): number {
    let totalScore = 0;

    for (const pattern of patterns) {
      totalScore += this.calculatePatternSpecificity(pattern);
    }

    // More patterns = more specific
    totalScore += patterns.length * 5;

    return totalScore;
  }

  /**
   * Compare two rules by specificity
   * Returns positive if rule1 is more specific
   */
  static compareSpecificity(patterns1: Pattern[], patterns2: Pattern[]): number {
    const score1 = this.calculateRuleSpecificity(patterns1);
    const score2 = this.calculateRuleSpecificity(patterns2);
    return score1 - score2;
  }
}

/**
 * Priority manager - manages rule priorities
 */
export class PriorityManager {
  private priorities: Map<string, PriorityConfig> = new Map();
  private categoryBasePriorities: Map<PriorityCategory, number> = new Map([
    [PriorityCategory.SURVIVAL, 900],
    [PriorityCategory.COMBAT, 700],
    [PriorityCategory.SOCIAL, 500],
    [PriorityCategory.EXPLORATION, 400],
    [PriorityCategory.BACKGROUND, 200],
  ]);

  /**
   * Set priority configuration for a rule
   */
  setPriority(ruleName: string, config: PriorityConfig): void {
    this.priorities.set(ruleName, config);
    this.recalculatePriority(ruleName);
  }

  /**
   * Get priority configuration for a rule
   */
  getPriority(ruleName: string): PriorityConfig | undefined {
    return this.priorities.get(ruleName);
  }

  /**
   * Calculate priority for a rule automatically
   */
  calculatePriority(rule: Rule): number {
    const config = this.priorities.get(rule.name);

    // If manual base priority set, use it
    if (config?.basePriority !== undefined) {
      return config.basePriority;
    }

    let priority = 0;

    // Start with urgency level
    if (config?.urgency !== undefined) {
      priority = config.urgency;
    }
    // Or category base priority
    else if (config?.category !== undefined) {
      priority = this.categoryBasePriorities.get(config.category) || 500;
    }
    // Or use rule's priority
    else {
      priority = rule.priority;
    }

    // Add specificity bonus
    const specificityBonus =
      config?.specificityBonus !== undefined
        ? config.specificityBonus
        : SpecificityCalculator.calculateRuleSpecificity(rule.getPatterns());

    priority += specificityBonus;

    // Add manual adjustment
    if (config?.adjustment !== undefined) {
      priority += config.adjustment;
    }

    // Preemptive rules get significant boost
    if (config?.preemptive) {
      priority += 1000;
    }

    return priority;
  }

  /**
   * Recalculate and store final priority
   */
  private recalculatePriority(ruleName: string): void {
    const config = this.priorities.get(ruleName);
    if (!config) return;

    // Note: We need the actual Rule object to calculate specificity
    // This will be set when the rule is registered with the engine
  }

  /**
   * Set urgency level for a rule
   */
  setUrgency(ruleName: string, urgency: UrgencyLevel): void {
    const config = this.priorities.get(ruleName) || {};
    config.urgency = urgency;
    this.setPriority(ruleName, config);
  }

  /**
   * Set category for a rule
   */
  setCategory(ruleName: string, category: PriorityCategory): void {
    const config = this.priorities.get(ruleName) || {};
    config.category = category;
    this.setPriority(ruleName, config);
  }

  /**
   * Boost rule priority
   */
  boost(ruleName: string, amount: number): void {
    const config = this.priorities.get(ruleName) || {};
    config.adjustment = (config.adjustment || 0) + amount;
    this.setPriority(ruleName, config);
  }

  /**
   * Penalize rule priority
   */
  penalize(ruleName: string, amount: number): void {
    this.boost(ruleName, -amount);
  }

  /**
   * Mark rule as preemptive
   */
  setPreemptive(ruleName: string, preemptive: boolean = true): void {
    const config = this.priorities.get(ruleName) || {};
    config.preemptive = preemptive;
    this.setPriority(ruleName, config);
  }

  /**
   * Set base priority category
   */
  setCategoryBasePriority(category: PriorityCategory, priority: number): void {
    this.categoryBasePriorities.set(category, priority);
  }

  /**
   * Sort activations by priority
   */
  sortActivations(activations: RuleActivation[]): RuleActivation[] {
    return activations.sort((a, b) => {
      const priorityA = this.calculatePriority(a.rule);
      const priorityB = this.calculatePriority(b.rule);
      return priorityB - priorityA; // Higher priority first
    });
  }

  /**
   * Get all rule priorities
   */
  getAllPriorities(): Map<string, PriorityConfig> {
    return new Map(this.priorities);
  }

  /**
   * Clear all priorities
   */
  clear(): void {
    this.priorities.clear();
  }

  /**
   * Display priority statistics
   */
  displayStats(): void {
    console.log('\n' + '='.repeat(60));
    console.log('PRIORITY MANAGER STATISTICS');
    console.log('='.repeat(60));

    console.log('\nRules with priority configurations:');
    const sorted = Array.from(this.priorities.entries()).sort(
      (a, b) => (b[1].finalPriority || 0) - (a[1].finalPriority || 0)
    );

    for (const [ruleName, config] of sorted) {
      const urgency = config.urgency ? UrgencyLevel[config.urgency] : 'N/A';
      const category = config.category || 'N/A';
      const final = config.finalPriority || 'not calculated';
      const preemptive = config.preemptive ? ' [PREEMPTIVE]' : '';

      console.log(`  ${ruleName}:`);
      console.log(`    Urgency: ${urgency}, Category: ${category}`);
      console.log(`    Final Priority: ${final}${preemptive}`);
    }

    console.log('\nCategory Base Priorities:');
    for (const [category, priority] of this.categoryBasePriorities.entries()) {
      console.log(`  ${category}: ${priority}`);
    }

    console.log('='.repeat(60) + '\n');
  }
}

/**
 * Priority helper functions
 */
export class PriorityHelpers {
  /**
   * Create high-priority urgent rule
   */
  static createUrgentRule(
    manager: PriorityManager,
    ruleName: string,
    urgency: UrgencyLevel = UrgencyLevel.HIGH
  ): void {
    manager.setUrgency(ruleName, urgency);
  }

  /**
   * Create preemptive rule (interrupts others)
   */
  static createPreemptiveRule(manager: PriorityManager, ruleName: string): void {
    manager.setPreemptive(ruleName, true);
  }

  /**
   * Create rule in category
   */
  static createCategoryRule(
    manager: PriorityManager,
    ruleName: string,
    category: PriorityCategory
  ): void {
    manager.setCategory(ruleName, category);
  }

  /**
   * Compare two rules and boost the more specific one
   */
  static boostMoreSpecific(
    manager: PriorityManager,
    rule1Name: string,
    rule1Patterns: Pattern[],
    rule2Name: string,
    rule2Patterns: Pattern[]
  ): void {
    const comparison = SpecificityCalculator.compareSpecificity(rule1Patterns, rule2Patterns);

    if (comparison > 0) {
      // rule1 is more specific
      manager.boost(rule1Name, 50);
    } else if (comparison < 0) {
      // rule2 is more specific
      manager.boost(rule2Name, 50);
    }
  }

  /**
   * Auto-assign priorities based on specificity
   */
  static autoAssignPriorities(manager: PriorityManager, rules: Rule[]): void {
    for (const rule of rules) {
      const specificity = SpecificityCalculator.calculateRuleSpecificity(rule.getPatterns());

      const config: PriorityConfig = {
        specificityBonus: specificity,
      };

      manager.setPriority(rule.name, config);
    }
  }
}

/**
 * Priority presets for common scenarios
 */
export class PriorityPresets {
  /**
   * Setup survival priorities (highest)
   */
  static survival(manager: PriorityManager, ruleNames: string[]): void {
    for (const ruleName of ruleNames) {
      manager.setCategory(ruleName, PriorityCategory.SURVIVAL);
      manager.setUrgency(ruleName, UrgencyLevel.CRITICAL);
    }
  }

  /**
   * Setup combat priorities
   */
  static combat(manager: PriorityManager, ruleNames: string[]): void {
    for (const ruleName of ruleNames) {
      manager.setCategory(ruleName, PriorityCategory.COMBAT);
      manager.setUrgency(ruleName, UrgencyLevel.HIGH);
    }
  }

  /**
   * Setup social priorities
   */
  static social(manager: PriorityManager, ruleNames: string[]): void {
    for (const ruleName of ruleNames) {
      manager.setCategory(ruleName, PriorityCategory.SOCIAL);
      manager.setUrgency(ruleName, UrgencyLevel.NORMAL);
    }
  }

  /**
   * Setup exploration priorities
   */
  static exploration(manager: PriorityManager, ruleNames: string[]): void {
    for (const ruleName of ruleNames) {
      manager.setCategory(ruleName, PriorityCategory.EXPLORATION);
      manager.setUrgency(ruleName, UrgencyLevel.NORMAL);
    }
  }

  /**
   * Setup background priorities (lowest)
   */
  static background(manager: PriorityManager, ruleNames: string[]): void {
    for (const ruleName of ruleNames) {
      manager.setCategory(ruleName, PriorityCategory.BACKGROUND);
      manager.setUrgency(ruleName, UrgencyLevel.LOW);
    }
  }

  /**
   * Create specific vs general priority setup
   */
  static specificBeforeGeneral(
    manager: PriorityManager,
    specificRules: string[],
    generalRules: string[]
  ): void {
    // Boost specific rules
    for (const ruleName of specificRules) {
      manager.boost(ruleName, 100);
    }

    // Penalize general rules slightly
    for (const ruleName of generalRules) {
      manager.penalize(ruleName, 50);
    }
  }
}

/**
 * Priority conflict resolver
 */
export class PriorityConflictResolver {
  /**
   * Resolve conflicts between multiple activations
   * Returns activations sorted by priority
   */
  static resolve(
    activations: RuleActivation[],
    manager: PriorityManager
  ): RuleActivation[] {
    return manager.sortActivations(activations);
  }

  /**
   * Get highest priority activation
   */
  static getHighestPriority(
    activations: RuleActivation[],
    manager: PriorityManager
  ): RuleActivation | undefined {
    if (activations.length === 0) return undefined;

    const sorted = this.resolve(activations, manager);
    return sorted[0];
  }

  /**
   * Filter to only preemptive rules
   */
  static getPreemptive(
    activations: RuleActivation[],
    manager: PriorityManager
  ): RuleActivation[] {
    return activations.filter((activation) => {
      const config = manager.getPriority(activation.rule.name);
      return config?.preemptive === true;
    });
  }

  /**
   * Check if any preemptive rules should fire
   * If yes, return only preemptive rules
   * If no, return all activations
   */
  static checkPreemption(
    activations: RuleActivation[],
    manager: PriorityManager
  ): RuleActivation[] {
    const preemptive = this.getPreemptive(activations, manager);

    if (preemptive.length > 0) {
      return this.resolve(preemptive, manager);
    }

    return this.resolve(activations, manager);
  }

  /**
   * Group activations by priority tier
   */
  static groupByTier(
    activations: RuleActivation[],
    manager: PriorityManager,
    tierSize: number = 100
  ): Map<number, RuleActivation[]> {
    const tiers = new Map<number, RuleActivation[]>();

    for (const activation of activations) {
      const priority = manager.calculatePriority(activation.rule);
      const tier = Math.floor(priority / tierSize);

      if (!tiers.has(tier)) {
        tiers.set(tier, []);
      }
      tiers.get(tier)!.push(activation);
    }

    return tiers;
  }
}

/**
 * Rule priority builder - fluent API
 */
export class PriorityBuilder {
  private config: PriorityConfig = {};
  private ruleName: string = '';

  /**
   * Set rule name
   */
  forRule(ruleName: string): this {
    this.ruleName = ruleName;
    return this;
  }

  /**
   * Set base priority
   */
  withBasePriority(priority: number): this {
    this.config.basePriority = priority;
    return this;
  }

  /**
   * Set urgency level
   */
  withUrgency(urgency: UrgencyLevel): this {
    this.config.urgency = urgency;
    return this;
  }

  /**
   * Set category
   */
  inCategory(category: PriorityCategory): this {
    this.config.category = category;
    return this;
  }

  /**
   * Add boost
   */
  boost(amount: number): this {
    this.config.adjustment = (this.config.adjustment || 0) + amount;
    return this;
  }

  /**
   * Make preemptive
   */
  makePreemptive(): this {
    this.config.preemptive = true;
    return this;
  }

  /**
   * Build and apply to manager
   */
  apply(manager: PriorityManager): void {
    if (!this.ruleName) {
      throw new Error('Rule name must be set');
    }

    manager.setPriority(this.ruleName, this.config);
  }
}
