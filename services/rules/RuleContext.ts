/**
 * RuleContext - FACADE 6.3
 *
 * Context-based rule activation/deactivation.
 * Rules can be grouped into contexts (Combat, Social, Stealth, etc.)
 * and only rules in active contexts will fire.
 *
 * Features:
 * - Dynamic context activation/deactivation
 * - Rule grouping by context
 * - Context priority and exclusivity
 * - Automatic context switching
 * - Context stack management
 * - Statistics and monitoring
 *
 * This enables:
 * - Combat vs social vs exploration behaviors
 * - Situation-appropriate rule firing
 * - Performance optimization (fewer active rules)
 * - Clear behavioral modes
 */

import { Rule } from './Rule';
import { RuleEngine } from './RuleEngine';
import { WorkingMemory } from '../wm/WorkingMemory';

/**
 * Rule context - groups related rules together
 */
export interface RuleContext {
  /** Unique context name */
  name: string;

  /** Description of the context */
  description: string;

  /** Priority when multiple contexts active (higher = more important) */
  priority: number;

  /** Is this context currently active? */
  active: boolean;

  /** Rules in this context */
  rules: Set<string>;

  /** Contexts that are mutually exclusive with this one */
  excludes: Set<string>;

  /** Contexts required to be active for this to activate */
  requires: Set<string>;

  /** Auto-activate conditions (optional) */
  activateWhen?: (wm: WorkingMemory) => boolean;

  /** Auto-deactivate conditions (optional) */
  deactivateWhen?: (wm: WorkingMemory) => boolean;

  /** Metadata */
  metadata: Record<string, any>;
}

/**
 * Context change event
 */
export interface ContextChangeEvent {
  context: string;
  type: 'activate' | 'deactivate';
  timestamp: number;
  reason?: string;
}

/**
 * Context manager - manages rule contexts and activation
 */
export class ContextManager {
  private contexts: Map<string, RuleContext> = new Map();
  private ruleContexts: Map<string, Set<string>> = new Map(); // rule name -> context names
  private engine?: RuleEngine;
  private wm?: WorkingMemory;
  private contextHistory: ContextChangeEvent[] = [];
  private maxHistorySize: number = 100;
  private debug: boolean = false;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Set rule engine for context-aware rule filtering
   */
  setEngine(engine: RuleEngine): void {
    this.engine = engine;
  }

  /**
   * Set working memory for auto-activation
   */
  setWorkingMemory(wm: WorkingMemory): void {
    this.wm = wm;
  }

  /**
   * Create a new context
   */
  createContext(
    name: string,
    description: string = '',
    priority: number = 50
  ): RuleContext {
    if (this.contexts.has(name)) {
      throw new Error(`Context "${name}" already exists`);
    }

    const context: RuleContext = {
      name,
      description,
      priority,
      active: false,
      rules: new Set(),
      excludes: new Set(),
      requires: new Set(),
      metadata: {},
    };

    this.contexts.set(name, context);

    if (this.debug) {
      console.log(`[ContextManager] Created context: ${name}`);
    }

    return context;
  }

  /**
   * Remove a context
   */
  removeContext(name: string): boolean {
    const context = this.contexts.get(name);
    if (!context) return false;

    // Remove all rule associations
    for (const ruleName of context.rules) {
      const ruleContextSet = this.ruleContexts.get(ruleName);
      if (ruleContextSet) {
        ruleContextSet.delete(name);
      }
    }

    this.contexts.delete(name);

    if (this.debug) {
      console.log(`[ContextManager] Removed context: ${name}`);
    }

    return true;
  }

  /**
   * Get context by name
   */
  getContext(name: string): RuleContext | undefined {
    return this.contexts.get(name);
  }

  /**
   * Get all contexts
   */
  getAllContexts(): RuleContext[] {
    return Array.from(this.contexts.values());
  }

  /**
   * Add rule to context
   */
  addRuleToContext(ruleName: string, contextName: string): void {
    const context = this.contexts.get(contextName);
    if (!context) {
      throw new Error(`Context "${contextName}" does not exist`);
    }

    context.rules.add(ruleName);

    // Track reverse mapping
    if (!this.ruleContexts.has(ruleName)) {
      this.ruleContexts.set(ruleName, new Set());
    }
    this.ruleContexts.get(ruleName)!.add(contextName);

    if (this.debug) {
      console.log(`[ContextManager] Added rule "${ruleName}" to context "${contextName}"`);
    }
  }

  /**
   * Remove rule from context
   */
  removeRuleFromContext(ruleName: string, contextName: string): void {
    const context = this.contexts.get(contextName);
    if (!context) return;

    context.rules.delete(ruleName);

    const ruleContextSet = this.ruleContexts.get(ruleName);
    if (ruleContextSet) {
      ruleContextSet.delete(contextName);
    }

    if (this.debug) {
      console.log(`[ContextManager] Removed rule "${ruleName}" from context "${contextName}"`);
    }
  }

  /**
   * Get contexts for a rule
   */
  getRuleContexts(ruleName: string): string[] {
    const contexts = this.ruleContexts.get(ruleName);
    return contexts ? Array.from(contexts) : [];
  }

  /**
   * Activate a context
   */
  activate(contextName: string, reason?: string): boolean {
    const context = this.contexts.get(contextName);
    if (!context) {
      console.warn(`[ContextManager] Context "${contextName}" does not exist`);
      return false;
    }

    if (context.active) {
      if (this.debug) {
        console.log(`[ContextManager] Context "${contextName}" already active`);
      }
      return true;
    }

    // Check required contexts
    for (const required of context.requires) {
      const requiredContext = this.contexts.get(required);
      if (!requiredContext || !requiredContext.active) {
        console.warn(
          `[ContextManager] Cannot activate "${contextName}": requires "${required}" to be active`
        );
        return false;
      }
    }

    // Deactivate mutually exclusive contexts
    for (const excluded of context.excludes) {
      const excludedContext = this.contexts.get(excluded);
      if (excludedContext && excludedContext.active) {
        if (this.debug) {
          console.log(
            `[ContextManager] Deactivating "${excluded}" (excluded by "${contextName}")`
          );
        }
        this.deactivate(excluded, `Excluded by ${contextName}`);
      }
    }

    context.active = true;

    // Enable rules in this context
    if (this.engine) {
      for (const ruleName of context.rules) {
        this.engine.setRuleEnabled(ruleName, true);
      }
    }

    // Record change
    this.recordChange({
      context: contextName,
      type: 'activate',
      timestamp: Date.now(),
      reason,
    });

    if (this.debug) {
      console.log(
        `[ContextManager] Activated context: ${contextName}${reason ? ` (${reason})` : ''}`
      );
    }

    return true;
  }

  /**
   * Deactivate a context
   */
  deactivate(contextName: string, reason?: string): boolean {
    const context = this.contexts.get(contextName);
    if (!context) {
      console.warn(`[ContextManager] Context "${contextName}" does not exist`);
      return false;
    }

    if (!context.active) {
      if (this.debug) {
        console.log(`[ContextManager] Context "${contextName}" already inactive`);
      }
      return true;
    }

    // Check if any active contexts require this one
    for (const [name, ctx] of this.contexts.entries()) {
      if (ctx.active && ctx.requires.has(contextName)) {
        console.warn(
          `[ContextManager] Cannot deactivate "${contextName}": required by active context "${name}"`
        );
        return false;
      }
    }

    context.active = false;

    // Disable rules in this context (unless they're in other active contexts)
    if (this.engine) {
      for (const ruleName of context.rules) {
        // Check if rule is in any other active context
        const otherActiveContexts = this.getRuleContexts(ruleName).filter(
          (ctxName) => ctxName !== contextName && this.isActive(ctxName)
        );

        if (otherActiveContexts.length === 0) {
          this.engine.setRuleEnabled(ruleName, false);
        }
      }
    }

    // Record change
    this.recordChange({
      context: contextName,
      type: 'deactivate',
      timestamp: Date.now(),
      reason,
    });

    if (this.debug) {
      console.log(
        `[ContextManager] Deactivated context: ${contextName}${reason ? ` (${reason})` : ''}`
      );
    }

    return true;
  }

  /**
   * Toggle context activation
   */
  toggle(contextName: string, reason?: string): boolean {
    const context = this.contexts.get(contextName);
    if (!context) return false;

    return context.active
      ? this.deactivate(contextName, reason)
      : this.activate(contextName, reason);
  }

  /**
   * Check if context is active
   */
  isActive(contextName: string): boolean {
    const context = this.contexts.get(contextName);
    return context ? context.active : false;
  }

  /**
   * Get all active contexts
   */
  getActiveContexts(): RuleContext[] {
    return Array.from(this.contexts.values()).filter((ctx) => ctx.active);
  }

  /**
   * Get all inactive contexts
   */
  getInactiveContexts(): RuleContext[] {
    return Array.from(this.contexts.values()).filter((ctx) => !ctx.active);
  }

  /**
   * Set mutual exclusion between contexts
   */
  setMutualExclusion(context1: string, context2: string): void {
    const ctx1 = this.contexts.get(context1);
    const ctx2 = this.contexts.get(context2);

    if (!ctx1 || !ctx2) {
      throw new Error('Both contexts must exist');
    }

    ctx1.excludes.add(context2);
    ctx2.excludes.add(context1);

    if (this.debug) {
      console.log(`[ContextManager] Set mutual exclusion: ${context1} <-> ${context2}`);
    }

    // If both are active, deactivate lower priority one
    if (ctx1.active && ctx2.active) {
      if (ctx1.priority >= ctx2.priority) {
        this.deactivate(context2, `Excluded by ${context1}`);
      } else {
        this.deactivate(context1, `Excluded by ${context2}`);
      }
    }
  }

  /**
   * Set context requirement
   */
  setRequirement(contextName: string, requiredContext: string): void {
    const context = this.contexts.get(contextName);
    const required = this.contexts.get(requiredContext);

    if (!context || !required) {
      throw new Error('Both contexts must exist');
    }

    context.requires.add(requiredContext);

    if (this.debug) {
      console.log(`[ContextManager] Set requirement: ${contextName} requires ${requiredContext}`);
    }

    // If context is active but requirement is not, deactivate
    if (context.active && !required.active) {
      this.deactivate(contextName, `Requirement ${requiredContext} not active`);
    }
  }

  /**
   * Set auto-activation condition
   */
  setAutoActivation(
    contextName: string,
    condition: (wm: WorkingMemory) => boolean
  ): void {
    const context = this.contexts.get(contextName);
    if (!context) {
      throw new Error(`Context "${contextName}" does not exist`);
    }

    context.activateWhen = condition;

    if (this.debug) {
      console.log(`[ContextManager] Set auto-activation for: ${contextName}`);
    }
  }

  /**
   * Set auto-deactivation condition
   */
  setAutoDeactivation(
    contextName: string,
    condition: (wm: WorkingMemory) => boolean
  ): void {
    const context = this.contexts.get(contextName);
    if (!context) {
      throw new Error(`Context "${contextName}" does not exist`);
    }

    context.deactivateWhen = condition;

    if (this.debug) {
      console.log(`[ContextManager] Set auto-deactivation for: ${contextName}`);
    }
  }

  /**
   * Check auto-activation/deactivation conditions
   */
  updateAutoContexts(): void {
    if (!this.wm) {
      console.warn('[ContextManager] Cannot update auto-contexts: no working memory set');
      return;
    }

    for (const context of this.contexts.values()) {
      // Check auto-activation
      if (!context.active && context.activateWhen) {
        if (context.activateWhen(this.wm)) {
          this.activate(context.name, 'Auto-activation condition met');
        }
      }

      // Check auto-deactivation
      if (context.active && context.deactivateWhen) {
        if (context.deactivateWhen(this.wm)) {
          this.deactivate(context.name, 'Auto-deactivation condition met');
        }
      }
    }
  }

  /**
   * Get rules that should be active based on current contexts
   */
  getActiveRules(): Set<string> {
    const activeRules = new Set<string>();

    for (const context of this.contexts.values()) {
      if (context.active) {
        for (const ruleName of context.rules) {
          activeRules.add(ruleName);
        }
      }
    }

    return activeRules;
  }

  /**
   * Check if a rule should be active
   */
  isRuleActive(ruleName: string): boolean {
    const contexts = this.ruleContexts.get(ruleName);
    if (!contexts) return false;

    // Rule is active if ANY of its contexts are active
    for (const contextName of contexts) {
      if (this.isActive(contextName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Record context change
   */
  private recordChange(event: ContextChangeEvent): void {
    this.contextHistory.push(event);

    if (this.contextHistory.length > this.maxHistorySize) {
      this.contextHistory.shift();
    }
  }

  /**
   * Get context change history
   */
  getHistory(limit?: number): ContextChangeEvent[] {
    if (limit) {
      return this.contextHistory.slice(-limit);
    }
    return [...this.contextHistory];
  }

  /**
   * Clear context history
   */
  clearHistory(): void {
    this.contextHistory = [];

    if (this.debug) {
      console.log('[ContextManager] Cleared context history');
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalContexts: number;
    activeContexts: number;
    inactiveContexts: number;
    totalRules: number;
    activeRules: number;
    contextChanges: number;
    byContext: Record<string, { active: boolean; rules: number; priority: number }>;
  } {
    const byContext: Record<string, { active: boolean; rules: number; priority: number }> = {};

    for (const [name, context] of this.contexts.entries()) {
      byContext[name] = {
        active: context.active,
        rules: context.rules.size,
        priority: context.priority,
      };
    }

    return {
      totalContexts: this.contexts.size,
      activeContexts: this.getActiveContexts().length,
      inactiveContexts: this.getInactiveContexts().length,
      totalRules: this.ruleContexts.size,
      activeRules: this.getActiveRules().size,
      contextChanges: this.contextHistory.length,
      byContext,
    };
  }

  /**
   * Display statistics
   */
  displayStats(): void {
    const stats = this.getStats();

    console.log('\n' + '='.repeat(60));
    console.log('CONTEXT MANAGER STATISTICS');
    console.log('='.repeat(60));

    console.log(`\nContexts: ${stats.totalContexts} total`);
    console.log(`  Active: ${stats.activeContexts}`);
    console.log(`  Inactive: ${stats.inactiveContexts}`);

    console.log(`\nRules: ${stats.totalRules} total`);
    console.log(`  Active: ${stats.activeRules}`);

    console.log(`\nContext Changes: ${stats.contextChanges}`);

    console.log('\nContexts:');
    const sorted = Object.entries(stats.byContext).sort((a, b) => b[1].priority - a[1].priority);
    for (const [name, data] of sorted) {
      const status = data.active ? '✓ ACTIVE' : '  inactive';
      console.log(`  [${status}] ${name}: ${data.rules} rules (priority ${data.priority})`);
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Display context history
   */
  displayHistory(limit?: number): void {
    const history = this.getHistory(limit);

    console.log('\n' + '='.repeat(60));
    console.log('CONTEXT CHANGE HISTORY');
    console.log('='.repeat(60));

    if (history.length === 0) {
      console.log('No context changes recorded');
    } else {
      for (const event of history) {
        const time = new Date(event.timestamp).toISOString();
        const type = event.type === 'activate' ? '▲ ACTIVATE' : '▼ DEACTIVATE';
        const reason = event.reason ? ` (${event.reason})` : '';
        console.log(`[${time}] ${type}: ${event.context}${reason}`);
      }
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Clear all contexts
   */
  clear(): void {
    this.contexts.clear();
    this.ruleContexts.clear();
    this.contextHistory = [];

    if (this.debug) {
      console.log('[ContextManager] Cleared all contexts');
    }
  }
}

/**
 * Context builder - fluent API for creating contexts
 */
export class ContextBuilder {
  private name: string = '';
  private description: string = '';
  private priority: number = 50;
  private rules: string[] = [];
  private excludes: string[] = [];
  private requires: string[] = [];
  private activateCondition?: (wm: WorkingMemory) => boolean;
  private deactivateCondition?: (wm: WorkingMemory) => boolean;
  private metadata: Record<string, any> = {};

  /**
   * Set context name
   */
  named(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Set description
   */
  describedAs(description: string): this {
    this.description = description;
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
   * Add a rule to the context
   */
  addRule(ruleName: string): this {
    this.rules.push(ruleName);
    return this;
  }

  /**
   * Add multiple rules
   */
  addRules(...ruleNames: string[]): this {
    this.rules.push(...ruleNames);
    return this;
  }

  /**
   * Add mutually exclusive context
   */
  excludes(contextName: string): this {
    this.excludes.push(contextName);
    return this;
  }

  /**
   * Add required context
   */
  requires(contextName: string): this {
    this.requires.push(contextName);
    return this;
  }

  /**
   * Set auto-activation condition
   */
  activateWhen(condition: (wm: WorkingMemory) => boolean): this {
    this.activateCondition = condition;
    return this;
  }

  /**
   * Set auto-deactivation condition
   */
  deactivateWhen(condition: (wm: WorkingMemory) => boolean): this {
    this.deactivateCondition = condition;
    return this;
  }

  /**
   * Add metadata
   */
  withMetadata(key: string, value: any): this {
    this.metadata[key] = value;
    return this;
  }

  /**
   * Build and register context
   */
  build(manager: ContextManager): RuleContext {
    if (!this.name) {
      throw new Error('Context must have a name');
    }

    const context = manager.createContext(this.name, this.description, this.priority);

    // Add rules
    for (const ruleName of this.rules) {
      manager.addRuleToContext(ruleName, this.name);
    }

    // Set exclusions
    for (const excluded of this.excludes) {
      manager.setMutualExclusion(this.name, excluded);
    }

    // Set requirements
    for (const required of this.requires) {
      manager.setRequirement(this.name, required);
    }

    // Set auto-activation
    if (this.activateCondition) {
      manager.setAutoActivation(this.name, this.activateCondition);
    }

    // Set auto-deactivation
    if (this.deactivateCondition) {
      manager.setAutoDeactivation(this.name, this.deactivateCondition);
    }

    // Set metadata
    context.metadata = { ...this.metadata };

    return context;
  }
}

/**
 * Common context patterns
 */
export class ContextPatterns {
  /**
   * Create combat context that activates when enemies are present
   */
  static combat(manager: ContextManager, rules: string[]): RuleContext {
    return new ContextBuilder()
      .named('Combat')
      .describedAs('Combat and fighting behaviors')
      .withPriority(90)
      .addRules(...rules)
      .activateWhen((wm) => wm.exists({ type: 'Enemy' }))
      .deactivateWhen((wm) => !wm.exists({ type: 'Enemy' }))
      .build(manager);
  }

  /**
   * Create social context for conversation
   */
  static social(manager: ContextManager, rules: string[]): RuleContext {
    return new ContextBuilder()
      .named('Social')
      .describedAs('Social interaction and conversation')
      .withPriority(70)
      .addRules(...rules)
      .activateWhen((wm) => wm.exists({ type: 'Conversation' }))
      .deactivateWhen((wm) => !wm.exists({ type: 'Conversation' }))
      .build(manager);
  }

  /**
   * Create exploration context
   */
  static exploration(manager: ContextManager, rules: string[]): RuleContext {
    return new ContextBuilder()
      .named('Exploration')
      .describedAs('Exploration and discovery')
      .withPriority(50)
      .addRules(...rules)
      .build(manager);
  }

  /**
   * Create stealth context
   */
  static stealth(manager: ContextManager, rules: string[]): RuleContext {
    return new ContextBuilder()
      .named('Stealth')
      .describedAs('Stealth and sneaking behaviors')
      .withPriority(80)
      .addRules(...rules)
      .build(manager);
  }

  /**
   * Create emergency context (highest priority)
   */
  static emergency(manager: ContextManager, rules: string[]): RuleContext {
    return new ContextBuilder()
      .named('Emergency')
      .describedAs('Emergency and critical situations')
      .withPriority(100)
      .addRules(...rules)
      .build(manager);
  }
}
