/**
 * SatelliteReactions - FACADE 6.6
 *
 * Satellite reactions are minor responses that accompany main reactions.
 * They add flavor and personality without changing core behavior.
 *
 * Features:
 * - Main reaction + optional satellites
 * - Multiple satellites can fire together
 * - Satellites don't block main reaction
 * - Probability-based satellite firing
 * - Satellite prioritization
 * - Context-aware satellites
 *
 * This enables:
 * - Facial expressions alongside dialogue
 * - Gestures during conversations
 * - Ambient reactions (sighs, eye rolls)
 * - Personality variations
 * - Rich, layered NPC responses
 */

import { RuleAction } from './Rule';
import { IWME } from '../wm/WME';
import { WorkingMemory } from '../wm/WorkingMemory';

/**
 * Satellite reaction - minor response
 */
export interface SatelliteReaction {
  /** Unique identifier */
  id: string;

  /** Description */
  description: string;

  /** Action to execute */
  action: RuleAction;

  /** Priority (higher fires first) */
  priority: number;

  /** Probability of firing (0.0 - 1.0) */
  probability: number;

  /** Can fire with other satellites? */
  allowsConcurrent: boolean;

  /** Mutual exclusions (satellite IDs that can't fire with this) */
  excludes: Set<string>;

  /** Required context conditions */
  condition?: (bindings: Map<string, IWME>, wm: WorkingMemory) => boolean;

  /** Category (for grouping) */
  category?: string;

  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Main reaction with satellites
 */
export interface ReactionWithSatellites {
  /** Main reaction action */
  mainAction: RuleAction;

  /** Available satellite reactions */
  satellites: SatelliteReaction[];

  /** Should all satellites fire, or select subset? */
  fireAllSatellites: boolean;

  /** Maximum number of satellites to fire (if not all) */
  maxSatellites?: number;
}

/**
 * Satellite manager - manages satellite reactions
 */
export class SatelliteManager {
  private satellites: Map<string, SatelliteReaction> = new Map();
  private satelliteHistory: Map<string, number[]> = new Map(); // ID -> timestamps
  private debug: boolean = false;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Register a satellite reaction
   */
  register(satellite: SatelliteReaction): void {
    this.satellites.set(satellite.id, satellite);

    if (this.debug) {
      console.log(`[SatelliteManager] Registered: ${satellite.id}`);
    }
  }

  /**
   * Unregister a satellite reaction
   */
  unregister(id: string): boolean {
    const removed = this.satellites.delete(id);

    if (removed && this.debug) {
      console.log(`[SatelliteManager] Unregistered: ${id}`);
    }

    return removed;
  }

  /**
   * Get satellite by ID
   */
  get(id: string): SatelliteReaction | undefined {
    return this.satellites.get(id);
  }

  /**
   * Get all satellites
   */
  getAll(): SatelliteReaction[] {
    return Array.from(this.satellites.values());
  }

  /**
   * Get satellites by category
   */
  getByCategory(category: string): SatelliteReaction[] {
    return this.getAll().filter((s) => s.category === category);
  }

  /**
   * Execute main reaction with satellites
   */
  execute(
    reaction: ReactionWithSatellites,
    bindings: Map<string, IWME>,
    wm: WorkingMemory
  ): void {
    // Execute main action
    if (this.debug) {
      console.log('[SatelliteManager] Executing main action');
    }
    reaction.mainAction(bindings, wm);

    // Select and execute satellites
    const selectedSatellites = this.selectSatellites(reaction, bindings, wm);

    if (this.debug && selectedSatellites.length > 0) {
      console.log(`[SatelliteManager] Executing ${selectedSatellites.length} satellite(s)`);
    }

    for (const satellite of selectedSatellites) {
      this.executeSatellite(satellite, bindings, wm);
    }
  }

  /**
   * Select which satellites should fire
   */
  private selectSatellites(
    reaction: ReactionWithSatellites,
    bindings: Map<string, IWME>,
    wm: WorkingMemory
  ): SatelliteReaction[] {
    let candidates = [...reaction.satellites];

    // Filter by condition
    candidates = candidates.filter((s) => {
      if (!s.condition) return true;
      return s.condition(bindings, wm);
    });

    // Filter by probability
    candidates = candidates.filter((s) => Math.random() < s.probability);

    // Sort by priority
    candidates.sort((a, b) => b.priority - a.priority);

    // Handle mutual exclusions
    const selected: SatelliteReaction[] = [];
    const excluded = new Set<string>();

    for (const candidate of candidates) {
      // Skip if excluded
      if (excluded.has(candidate.id)) continue;

      // Add to selected
      selected.push(candidate);

      // Mark exclusions
      for (const excludedId of candidate.excludes) {
        excluded.add(excludedId);
      }

      // Check if we should stop selecting
      if (!reaction.fireAllSatellites && reaction.maxSatellites) {
        if (selected.length >= reaction.maxSatellites) break;
      }

      // If satellite doesn't allow concurrent, stop
      if (!candidate.allowsConcurrent && !reaction.fireAllSatellites) {
        break;
      }
    }

    return selected;
  }

  /**
   * Execute a single satellite
   */
  private executeSatellite(
    satellite: SatelliteReaction,
    bindings: Map<string, IWME>,
    wm: WorkingMemory
  ): void {
    if (this.debug) {
      console.log(`[SatelliteManager] Firing satellite: ${satellite.id}`);
    }

    satellite.action(bindings, wm);

    // Track execution
    if (!this.satelliteHistory.has(satellite.id)) {
      this.satelliteHistory.set(satellite.id, []);
    }
    this.satelliteHistory.get(satellite.id)!.push(Date.now());
  }

  /**
   * Get execution count for satellite
   */
  getExecutionCount(id: string): number {
    const history = this.satelliteHistory.get(id);
    return history ? history.length : 0;
  }

  /**
   * Get last execution time for satellite
   */
  getLastExecutionTime(id: string): number | undefined {
    const history = this.satelliteHistory.get(id);
    if (!history || history.length === 0) return undefined;
    return history[history.length - 1];
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.satelliteHistory.clear();
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalSatellites: number;
    byCategory: Record<string, number>;
    executionCounts: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    const executionCounts: Record<string, number> = {};

    for (const satellite of this.satellites.values()) {
      // Count by category
      const cat = satellite.category || 'uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;

      // Count executions
      executionCounts[satellite.id] = this.getExecutionCount(satellite.id);
    }

    return {
      totalSatellites: this.satellites.size,
      byCategory,
      executionCounts,
    };
  }

  /**
   * Display statistics
   */
  displayStats(): void {
    const stats = this.getStats();

    console.log('\n' + '='.repeat(60));
    console.log('SATELLITE MANAGER STATISTICS');
    console.log('='.repeat(60));

    console.log(`\nTotal Satellites: ${stats.totalSatellites}`);

    console.log('\nBy Category:');
    for (const [category, count] of Object.entries(stats.byCategory)) {
      console.log(`  ${category}: ${count}`);
    }

    console.log('\nExecution Counts:');
    const sorted = Object.entries(stats.executionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [id, count] of sorted) {
      console.log(`  ${id}: ${count}`);
    }

    console.log('='.repeat(60) + '\n');
  }
}

/**
 * Satellite builder - fluent API
 */
export class SatelliteBuilder {
  private id: string = '';
  private description: string = '';
  private action?: RuleAction;
  private priority: number = 50;
  private probability: number = 1.0;
  private allowsConcurrent: boolean = true;
  private excludes: Set<string> = new Set();
  private condition?: (bindings: Map<string, IWME>, wm: WorkingMemory) => boolean;
  private category?: string;
  private metadata: Record<string, any> = {};

  /**
   * Set satellite ID
   */
  withId(id: string): this {
    this.id = id;
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
   * Set action
   */
  does(action: RuleAction): this {
    this.action = action;
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
   * Set probability (0.0 - 1.0)
   */
  withProbability(probability: number): this {
    this.probability = Math.max(0, Math.min(1, probability));
    return this;
  }

  /**
   * Set whether concurrent execution is allowed
   */
  allowsConcurrent(allows: boolean = true): this {
    this.allowsConcurrent = allows;
    return this;
  }

  /**
   * Add mutual exclusion
   */
  excludes(satelliteId: string): this {
    this.excludes.add(satelliteId);
    return this;
  }

  /**
   * Set condition
   */
  when(condition: (bindings: Map<string, IWME>, wm: WorkingMemory) => boolean): this {
    this.condition = condition;
    return this;
  }

  /**
   * Set category
   */
  inCategory(category: string): this {
    this.category = category;
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
   * Build satellite
   */
  build(): SatelliteReaction {
    if (!this.id) {
      throw new Error('Satellite must have an ID');
    }

    if (!this.action) {
      throw new Error('Satellite must have an action');
    }

    return {
      id: this.id,
      description: this.description,
      action: this.action,
      priority: this.priority,
      probability: this.probability,
      allowsConcurrent: this.allowsConcurrent,
      excludes: this.excludes,
      condition: this.condition,
      category: this.category,
      metadata: this.metadata,
    };
  }

  /**
   * Build and register
   */
  register(manager: SatelliteManager): SatelliteReaction {
    const satellite = this.build();
    manager.register(satellite);
    return satellite;
  }
}

/**
 * Common satellite categories
 */
export enum SatelliteCategory {
  FACIAL = 'facial',
  GESTURE = 'gesture',
  VOCAL = 'vocal',
  MOVEMENT = 'movement',
  EMOTIONAL = 'emotional',
}

/**
 * Common satellite presets
 */
export class SatellitePresets {
  /**
   * Facial expressions
   */
  static smile(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('smile')
      .describedAs('Smile')
      .does(() => console.log('  [FACIAL] *smiles*'))
      .inCategory(SatelliteCategory.FACIAL)
      .withPriority(50)
      .build();
  }

  static frown(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('frown')
      .describedAs('Frown')
      .does(() => console.log('  [FACIAL] *frowns*'))
      .inCategory(SatelliteCategory.FACIAL)
      .withPriority(50)
      .build();
  }

  static scowl(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('scowl')
      .describedAs('Scowl')
      .does(() => console.log('  [FACIAL] *scowls*'))
      .inCategory(SatelliteCategory.FACIAL)
      .withPriority(50)
      .build();
  }

  static eyeRoll(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('eye_roll')
      .describedAs('Roll eyes')
      .does(() => console.log('  [FACIAL] *rolls eyes*'))
      .inCategory(SatelliteCategory.FACIAL)
      .withPriority(50)
      .build();
  }

  /**
   * Gestures
   */
  static nod(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('nod')
      .describedAs('Nod')
      .does(() => console.log('  [GESTURE] *nods*'))
      .inCategory(SatelliteCategory.GESTURE)
      .withPriority(50)
      .build();
  }

  static shakeHead(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('shake_head')
      .describedAs('Shake head')
      .does(() => console.log('  [GESTURE] *shakes head*'))
      .inCategory(SatelliteCategory.GESTURE)
      .withPriority(50)
      .build();
  }

  static shrug(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('shrug')
      .describedAs('Shrug')
      .does(() => console.log('  [GESTURE] *shrugs*'))
      .inCategory(SatelliteCategory.GESTURE)
      .withPriority(50)
      .build();
  }

  static crossArms(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('cross_arms')
      .describedAs('Cross arms')
      .does(() => console.log('  [GESTURE] *crosses arms*'))
      .inCategory(SatelliteCategory.GESTURE)
      .withPriority(50)
      .build();
  }

  /**
   * Vocal reactions
   */
  static sigh(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('sigh')
      .describedAs('Sigh')
      .does(() => console.log('  [VOCAL] *sighs*'))
      .inCategory(SatelliteCategory.VOCAL)
      .withPriority(50)
      .build();
  }

  static grunt(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('grunt')
      .describedAs('Grunt')
      .does(() => console.log('  [VOCAL] *grunts*'))
      .inCategory(SatelliteCategory.VOCAL)
      .withPriority(50)
      .build();
  }

  static laugh(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('laugh')
      .describedAs('Laugh')
      .does(() => console.log('  [VOCAL] *laughs*'))
      .inCategory(SatelliteCategory.VOCAL)
      .withPriority(50)
      .build();
  }

  static scoff(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('scoff')
      .describedAs('Scoff')
      .does(() => console.log('  [VOCAL] *scoffs*'))
      .inCategory(SatelliteCategory.VOCAL)
      .withPriority(50)
      .build();
  }

  /**
   * Movement
   */
  static stepBack(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('step_back')
      .describedAs('Step back')
      .does(() => console.log('  [MOVEMENT] *steps back*'))
      .inCategory(SatelliteCategory.MOVEMENT)
      .withPriority(50)
      .build();
  }

  static leanForward(): SatelliteReaction {
    return new SatelliteBuilder()
      .withId('lean_forward')
      .describedAs('Lean forward')
      .does(() => console.log('  [MOVEMENT] *leans forward*'))
      .inCategory(SatelliteCategory.MOVEMENT)
      .withPriority(50)
      .build();
  }

  /**
   * Register all common satellites
   */
  static registerAll(manager: SatelliteManager): void {
    // Facial
    manager.register(SatellitePresets.smile());
    manager.register(SatellitePresets.frown());
    manager.register(SatellitePresets.scowl());
    manager.register(SatellitePresets.eyeRoll());

    // Gestures
    manager.register(SatellitePresets.nod());
    manager.register(SatellitePresets.shakeHead());
    manager.register(SatellitePresets.shrug());
    manager.register(SatellitePresets.crossArms());

    // Vocal
    manager.register(SatellitePresets.sigh());
    manager.register(SatellitePresets.grunt());
    manager.register(SatellitePresets.laugh());
    manager.register(SatellitePresets.scoff());

    // Movement
    manager.register(SatellitePresets.stepBack());
    manager.register(SatellitePresets.leanForward());
  }
}

/**
 * Helper functions for creating reactions with satellites
 */
export class SatelliteHelpers {
  /**
   * Create reaction with all satellites firing
   */
  static withAllSatellites(
    mainAction: RuleAction,
    satellites: SatelliteReaction[]
  ): ReactionWithSatellites {
    return {
      mainAction,
      satellites,
      fireAllSatellites: true,
    };
  }

  /**
   * Create reaction with limited satellites
   */
  static withLimitedSatellites(
    mainAction: RuleAction,
    satellites: SatelliteReaction[],
    maxSatellites: number
  ): ReactionWithSatellites {
    return {
      mainAction,
      satellites,
      fireAllSatellites: false,
      maxSatellites,
    };
  }

  /**
   * Create reaction with single satellite
   */
  static withSingleSatellite(
    mainAction: RuleAction,
    satellites: SatelliteReaction[]
  ): ReactionWithSatellites {
    return {
      mainAction,
      satellites,
      fireAllSatellites: false,
      maxSatellites: 1,
    };
  }

  /**
   * Quick satellite creation
   */
  static quickSatellite(
    id: string,
    action: RuleAction,
    category?: string
  ): SatelliteReaction {
    return new SatelliteBuilder()
      .withId(id)
      .does(action)
      .inCategory(category || 'custom')
      .build();
  }
}
