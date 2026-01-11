/**
 * RuleEngine - FACADE 6.1
 *
 * Rule engine for managing and executing rules.
 * Implements forward-chaining inference with the Rete algorithm concepts.
 *
 * Features:
 * - Rule activation and conflict resolution
 * - Priority-based execution
 * - Recency-based execution (most recent matches first)
 * - Rule salience (importance)
 * - Agenda management
 * - Rule statistics and monitoring
 *
 * This enables:
 * - Reactive NPC behaviors
 * - Complex event processing
 * - Expert system-style reasoning
 * - Declarative behavior definitions
 */

import { Rule, RuleActivation, RuleStats, getRuleStats } from './Rule';
import { WorkingMemory, WMEChangeType } from '../wm/WorkingMemory';
import { IWME } from '../wm/WME';

/**
 * Conflict resolution strategy
 */
export enum ConflictResolution {
  /** Fire highest priority first */
  PRIORITY = 'priority',

  /** Fire most recent activation first */
  RECENCY = 'recency',

  /** Fire rule that fired least recently */
  LEAST_RECENT = 'least_recent',

  /** Fire rule with fewest fires */
  LEAST_FIRED = 'least_fired',

  /** Fire first rule added */
  FIFO = 'fifo',
}

/**
 * Rule execution mode
 */
export enum ExecutionMode {
  /** Fire all matching rules once */
  ONCE = 'once',

  /** Fire rules until no more activations */
  EXHAUSTIVE = 'exhaustive',

  /** Fire rules continuously (requires manual stop) */
  CONTINUOUS = 'continuous',
}

/**
 * Rule engine configuration
 */
export interface RuleEngineConfig {
  /** Conflict resolution strategy */
  conflictResolution?: ConflictResolution;

  /** Execution mode */
  executionMode?: ExecutionMode;

  /** Maximum execution cycles (for exhaustive mode) */
  maxCycles?: number;

  /** Enable debug logging */
  debug?: boolean;

  /** Enable statistics tracking */
  trackStats?: boolean;

  /** Automatically react to WME changes */
  autoReact?: boolean;
}

/**
 * Execution statistics
 */
export interface ExecutionStats {
  cycleCount: number;
  totalActivations: number;
  totalFirings: number;
  lastCycleDuration: number;
  averageCycleDuration: number;
}

/**
 * Rule Engine - manages and executes rules
 */
export class RuleEngine {
  private wm: WorkingMemory;
  private rules: Map<string, Rule> = new Map();
  private agenda: RuleActivation[] = [];
  private config: Required<RuleEngineConfig>;
  private running: boolean = false;
  private stats: ExecutionStats = {
    cycleCount: 0,
    totalActivations: 0,
    totalFirings: 0,
    lastCycleDuration: 0,
    averageCycleDuration: 0,
  };
  private cycleDurations: number[] = [];
  private maxDurationSamples: number = 100;

  constructor(wm: WorkingMemory, config?: RuleEngineConfig) {
    this.wm = wm;
    this.config = {
      conflictResolution: config?.conflictResolution || ConflictResolution.PRIORITY,
      executionMode: config?.executionMode || ExecutionMode.ONCE,
      maxCycles: config?.maxCycles || 100,
      debug: config?.debug || false,
      trackStats: config?.trackStats || true,
      autoReact: config?.autoReact || false,
    };

    // Auto-react to WME changes if enabled
    if (this.config.autoReact) {
      this.setupAutoReact();
    }
  }

  /**
   * Setup automatic reaction to WME changes
   */
  private setupAutoReact(): void {
    this.wm.addListener({
      onAssert: () => this.run(),
      onModify: () => this.run(),
      onRetract: () => this.run(),
    });
  }

  /**
   * Add a rule to the engine
   */
  addRule(rule: Rule): void {
    if (this.rules.has(rule.name)) {
      console.warn(`[RuleEngine] Rule "${rule.name}" already exists, replacing`);
    }

    this.rules.set(rule.name, rule);

    if (this.config.debug) {
      console.log(`[RuleEngine] Added rule: ${rule.name}`);
    }
  }

  /**
   * Remove a rule from the engine
   */
  removeRule(ruleName: string): boolean {
    const removed = this.rules.delete(ruleName);

    if (removed && this.config.debug) {
      console.log(`[RuleEngine] Removed rule: ${ruleName}`);
    }

    return removed;
  }

  /**
   * Get a rule by name
   */
  getRule(ruleName: string): Rule | undefined {
    return this.rules.get(ruleName);
  }

  /**
   * Get all rules
   */
  getAllRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Clear all rules
   */
  clearRules(): void {
    this.rules.clear();
    this.agenda = [];

    if (this.config.debug) {
      console.log('[RuleEngine] Cleared all rules');
    }
  }

  /**
   * Run the rule engine
   */
  run(): void {
    if (this.running) {
      if (this.config.debug) {
        console.warn('[RuleEngine] Already running, skipping');
      }
      return;
    }

    this.running = true;

    try {
      switch (this.config.executionMode) {
        case ExecutionMode.ONCE:
          this.runOnce();
          break;

        case ExecutionMode.EXHAUSTIVE:
          this.runExhaustive();
          break;

        case ExecutionMode.CONTINUOUS:
          this.runContinuous();
          break;
      }
    } finally {
      this.running = false;
    }
  }

  /**
   * Run once - fire all matching rules once
   */
  private runOnce(): void {
    const startTime = Date.now();

    // Match all rules
    this.matchRules();

    // Resolve conflicts and fire
    this.fireAgenda();

    // Update stats
    this.updateStats(startTime);

    if (this.config.debug) {
      console.log(
        `[RuleEngine] Cycle complete: ${this.agenda.length} activations, ${Date.now() - startTime}ms`
      );
    }
  }

  /**
   * Run exhaustively - keep firing until no more activations
   */
  private runExhaustive(): void {
    let cycle = 0;

    while (cycle < this.config.maxCycles) {
      const startTime = Date.now();

      // Match all rules
      this.matchRules();

      // If no activations, we're done
      if (this.agenda.length === 0) {
        if (this.config.debug) {
          console.log(`[RuleEngine] Exhaustive run complete after ${cycle} cycles`);
        }
        break;
      }

      // Fire all activations
      this.fireAgenda();

      // Update stats
      this.updateStats(startTime);

      cycle++;
    }

    if (cycle >= this.config.maxCycles) {
      console.warn(
        `[RuleEngine] Exhaustive run stopped after max cycles (${this.config.maxCycles})`
      );
    }
  }

  /**
   * Run continuously (requires manual stop)
   */
  private runContinuous(): void {
    console.warn(
      '[RuleEngine] Continuous mode not implemented (would require async execution)'
    );
    // Would need setInterval or similar for true continuous execution
    this.runExhaustive();
  }

  /**
   * Match all rules against working memory
   */
  private matchRules(): void {
    this.agenda = [];

    for (const rule of this.rules.values()) {
      const activations = rule.match(this.wm);

      if (activations.length > 0) {
        this.agenda.push(...activations);

        if (this.config.debug) {
          console.log(
            `[RuleEngine] Rule "${rule.name}" matched: ${activations.length} activation(s)`
          );
        }
      }
    }

    this.stats.totalActivations += this.agenda.length;

    // Sort agenda based on conflict resolution strategy
    this.resolveConflicts();
  }

  /**
   * Resolve conflicts in agenda
   */
  private resolveConflicts(): void {
    switch (this.config.conflictResolution) {
      case ConflictResolution.PRIORITY:
        // Sort by priority (highest first)
        this.agenda.sort((a, b) => b.priority - a.priority);
        break;

      case ConflictResolution.RECENCY:
        // Sort by timestamp (most recent first)
        this.agenda.sort((a, b) => b.timestamp - a.timestamp);
        break;

      case ConflictResolution.LEAST_RECENT:
        // Sort by rule's last fired time (least recent first)
        this.agenda.sort(
          (a, b) => a.rule.getLastFired() - b.rule.getLastFired()
        );
        break;

      case ConflictResolution.LEAST_FIRED:
        // Sort by rule's fire count (least fired first)
        this.agenda.sort(
          (a, b) => a.rule.getFireCount() - b.rule.getFireCount()
        );
        break;

      case ConflictResolution.FIFO:
        // Keep insertion order (no sorting needed)
        break;
    }
  }

  /**
   * Fire all activations in agenda
   */
  private fireAgenda(): void {
    const agendaSize = this.agenda.length;

    for (const activation of this.agenda) {
      if (this.config.debug) {
        console.log(`[RuleEngine] Firing rule: ${activation.rule.name}`);
      }

      activation.rule.fire(activation.bindings, this.wm);
      this.stats.totalFirings++;
    }

    // Clear agenda
    this.agenda = [];

    if (this.config.debug && agendaSize > 0) {
      console.log(`[RuleEngine] Fired ${agendaSize} rule(s)`);
    }
  }

  /**
   * Update execution statistics
   */
  private updateStats(startTime: number): void {
    if (!this.config.trackStats) return;

    const duration = Date.now() - startTime;

    this.stats.cycleCount++;
    this.stats.lastCycleDuration = duration;

    // Track cycle durations for average
    this.cycleDurations.push(duration);
    if (this.cycleDurations.length > this.maxDurationSamples) {
      this.cycleDurations.shift();
    }

    // Calculate average
    const sum = this.cycleDurations.reduce((a, b) => a + b, 0);
    this.stats.averageCycleDuration = sum / this.cycleDurations.length;
  }

  /**
   * Get execution statistics
   */
  getStats(): ExecutionStats {
    return { ...this.stats };
  }

  /**
   * Get all rule statistics
   */
  getRuleStats(): RuleStats[] {
    return Array.from(this.rules.values()).map(getRuleStats);
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      cycleCount: 0,
      totalActivations: 0,
      totalFirings: 0,
      lastCycleDuration: 0,
      averageCycleDuration: 0,
    };

    this.cycleDurations = [];

    // Reset individual rule stats
    for (const rule of this.rules.values()) {
      rule.resetStats();
    }

    if (this.config.debug) {
      console.log('[RuleEngine] Reset statistics');
    }
  }

  /**
   * Display statistics
   */
  displayStats(): void {
    console.log('\n' + '='.repeat(60));
    console.log('RULE ENGINE STATISTICS');
    console.log('='.repeat(60));

    console.log('\nExecution Stats:');
    console.log(`  Cycles: ${this.stats.cycleCount}`);
    console.log(`  Total Activations: ${this.stats.totalActivations}`);
    console.log(`  Total Firings: ${this.stats.totalFirings}`);
    console.log(`  Last Cycle: ${this.stats.lastCycleDuration}ms`);
    console.log(`  Average Cycle: ${this.stats.averageCycleDuration.toFixed(2)}ms`);

    console.log('\nRule Stats:');
    const ruleStats = this.getRuleStats().sort(
      (a, b) => b.fireCount - a.fireCount
    );

    for (const stat of ruleStats) {
      console.log(
        `  ${stat.name}: ${stat.fireCount} fires, priority ${stat.priority}, ${stat.enabled ? 'enabled' : 'disabled'}`
      );
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleName: string, enabled: boolean): boolean {
    const rule = this.rules.get(ruleName);
    if (!rule) return false;

    rule.setEnabled(enabled);

    if (this.config.debug) {
      console.log(
        `[RuleEngine] Rule "${ruleName}" ${enabled ? 'enabled' : 'disabled'}`
      );
    }

    return true;
  }

  /**
   * Get current agenda
   */
  getAgenda(): RuleActivation[] {
    return [...this.agenda];
  }

  /**
   * Check if engine is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get configuration
   */
  getConfig(): Required<RuleEngineConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RuleEngineConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.debug) {
      console.log('[RuleEngine] Configuration updated:', config);
    }
  }
}

/**
 * Rule engine builder
 */
export class RuleEngineBuilder {
  private wm?: WorkingMemory;
  private rules: Rule[] = [];
  private config: RuleEngineConfig = {};

  /**
   * Set working memory
   */
  withWorkingMemory(wm: WorkingMemory): this {
    this.wm = wm;
    return this;
  }

  /**
   * Add a rule
   */
  addRule(rule: Rule): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * Add multiple rules
   */
  addRules(...rules: Rule[]): this {
    this.rules.push(...rules);
    return this;
  }

  /**
   * Set conflict resolution strategy
   */
  withConflictResolution(strategy: ConflictResolution): this {
    this.config.conflictResolution = strategy;
    return this;
  }

  /**
   * Set execution mode
   */
  withExecutionMode(mode: ExecutionMode): this {
    this.config.executionMode = mode;
    return this;
  }

  /**
   * Set max cycles
   */
  withMaxCycles(maxCycles: number): this {
    this.config.maxCycles = maxCycles;
    return this;
  }

  /**
   * Enable debug logging
   */
  withDebug(debug: boolean = true): this {
    this.config.debug = debug;
    return this;
  }

  /**
   * Enable auto-react
   */
  withAutoReact(autoReact: boolean = true): this {
    this.config.autoReact = autoReact;
    return this;
  }

  /**
   * Build the rule engine
   */
  build(): RuleEngine {
    if (!this.wm) {
      throw new Error('Working memory is required');
    }

    const engine = new RuleEngine(this.wm, this.config);

    // Add all rules
    for (const rule of this.rules) {
      engine.addRule(rule);
    }

    return engine;
  }
}
