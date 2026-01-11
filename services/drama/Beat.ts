/**
 * Beat - FACADE 4.1
 *
 * Beats are narrative segments that represent story moments.
 * Based on Facade's drama management system.
 *
 * A beat is a discrete story unit with:
 * - Name and description
 * - Preconditions (when can it trigger?)
 * - Effects (what changes when it executes?)
 * - Priority (which beats are more important?)
 * - Cooldown (prevent immediate repetition)
 *
 * Beats form the building blocks of dynamic storytelling.
 */

import { WorldState } from '../abl/WorldState';
import { PreconditionBuilder, IPrecondition } from '../abl/Precondition';

/**
 * Beat priority levels
 */
export enum BeatPriority {
  CRITICAL = 100,   // Story-critical moments
  HIGH = 75,        // Important story beats
  NORMAL = 50,      // Regular story progression
  LOW = 25,         // Optional flavor beats
  BACKGROUND = 10,  // Ambient story elements
}

/**
 * Beat status
 */
export enum BeatStatus {
  /** Beat hasn't been triggered yet */
  PENDING = 'pending',

  /** Beat is currently executing */
  ACTIVE = 'active',

  /** Beat has completed */
  COMPLETED = 'completed',

  /** Beat was skipped or failed */
  SKIPPED = 'skipped',
}

/**
 * Beat outcome (FACADE 4.8)
 */
export enum BeatOutcome {
  /** Beat succeeded */
  SUCCESS = 'success',

  /** Beat failed */
  FAILURE = 'failure',

  /** Beat partially succeeded */
  PARTIAL = 'partial',

  /** No outcome yet */
  NONE = 'none',
}

/**
 * Story value modification
 */
export interface StoryValueEffect {
  /** Story value to modify */
  value: string;

  /** Amount to change (can be negative) */
  delta: number;

  /** Optional min/max clamping */
  clamp?: { min: number; max: number };
}

/**
 * World state effect
 */
export interface WorldStateEffect {
  /** Key to set */
  key: string;

  /** Value to set */
  value: any;
}

/**
 * Beat execution result
 */
export interface BeatResult {
  /** Beat that was executed */
  beatName: string;

  /** Status after execution */
  status: BeatStatus;

  /** Outcome of the beat (FACADE 4.8) */
  outcome: BeatOutcome;

  /** Message describing what happened */
  message: string;

  /** Story values changed */
  storyValueChanges: StoryValueEffect[];

  /** World state changes */
  worldStateChanges: WorldStateEffect[];

  /** Timestamp */
  timestamp: number;
}

/**
 * Beat configuration
 */
export interface BeatConfig {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Description of this story moment */
  description: string;

  /** Priority level */
  priority: BeatPriority;

  /** Preconditions for beat activation */
  preconditions?: IPrecondition[];

  /** Story value effects */
  storyEffects?: StoryValueEffect[];

  /** World state effects */
  worldEffects?: WorldStateEffect[];

  /** Cooldown in milliseconds (prevent immediate repetition) */
  cooldown?: number;

  /** Can this beat repeat? */
  repeatable?: boolean;

  /** Optional category/tag */
  category?: string;

  /** Base weight for probabilistic selection (FACADE 4.6) */
  weight?: number;

  /** Beats unlocked on success (FACADE 4.8) */
  unlocksOnSuccess?: string[];

  /** Beats unlocked on failure (FACADE 4.8) */
  unlocksOnFailure?: string[];

  /** Beats locked on success (FACADE 4.8) */
  locksOnSuccess?: string[];

  /** Beats locked on failure (FACADE 4.8) */
  locksOnFailure?: string[];

  /** Optional content for dialogue/narrative */
  content?: {
    dialogue?: string[];
    narration?: string;
    choices?: { text: string; effects?: StoryValueEffect[] }[];
  };
}

/**
 * Beat class - represents a narrative segment
 */
export class Beat {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priority: BeatPriority;
  readonly preconditions: IPrecondition[];
  readonly storyEffects: StoryValueEffect[];
  readonly worldEffects: WorldStateEffect[];
  readonly cooldown: number;
  readonly repeatable: boolean;
  readonly category?: string;
  readonly weight: number;
  readonly unlocksOnSuccess: string[];
  readonly unlocksOnFailure: string[];
  readonly locksOnSuccess: string[];
  readonly locksOnFailure: string[];
  readonly content?: BeatConfig['content'];

  private status: BeatStatus = BeatStatus.PENDING;
  private outcome: BeatOutcome = BeatOutcome.NONE;
  private lastExecutedTime: number = 0;
  private executionCount: number = 0;

  constructor(config: BeatConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.priority = config.priority;
    this.preconditions = config.preconditions || [];
    this.storyEffects = config.storyEffects || [];
    this.worldEffects = config.worldEffects || [];
    this.cooldown = config.cooldown || 0;
    this.repeatable = config.repeatable ?? false;
    this.category = config.category;
    this.weight = config.weight ?? 1.0;
    this.unlocksOnSuccess = config.unlocksOnSuccess || [];
    this.unlocksOnFailure = config.unlocksOnFailure || [];
    this.locksOnSuccess = config.locksOnSuccess || [];
    this.locksOnFailure = config.locksOnFailure || [];
    this.content = config.content;
  }

  /**
   * Check if beat can execute now
   */
  canExecute(worldState: WorldState): boolean {
    // Check if already completed (and not repeatable)
    if (this.status === BeatStatus.COMPLETED && !this.repeatable) {
      return false;
    }

    // Check cooldown
    if (this.cooldown > 0 && this.lastExecutedTime > 0) {
      const timeSinceLastExecution = Date.now() - this.lastExecutedTime;
      if (timeSinceLastExecution < this.cooldown) {
        return false;
      }
    }

    // Check preconditions
    for (const precondition of this.preconditions) {
      if (!precondition.check(worldState)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute the beat
   */
  execute(worldState: WorldState, storyValues: Map<string, number>, outcome: BeatOutcome = BeatOutcome.SUCCESS): BeatResult {
    console.log(`[Beat] Executing: "${this.name}"`);

    this.status = BeatStatus.ACTIVE;
    this.outcome = outcome;

    const storyValueChanges: StoryValueEffect[] = [];
    const worldStateChanges: WorldStateEffect[] = [];

    // Apply story effects
    for (const effect of this.storyEffects) {
      const currentValue = storyValues.get(effect.value) || 0;
      let newValue = currentValue + effect.delta;

      // Apply clamping if specified
      if (effect.clamp) {
        newValue = Math.max(effect.clamp.min, Math.min(effect.clamp.max, newValue));
      }

      storyValues.set(effect.value, newValue);
      storyValueChanges.push({ ...effect });

      console.log(
        `[Beat] ${effect.value}: ${currentValue.toFixed(1)} → ${newValue.toFixed(1)} (${effect.delta > 0 ? '+' : ''}${effect.delta})`
      );
    }

    // Apply world state effects
    for (const effect of this.worldEffects) {
      worldState.set(effect.key, effect.value);
      worldStateChanges.push({ ...effect });

      console.log(`[Beat] Set ${effect.key} = ${effect.value}`);
    }

    // Update beat state
    this.status = BeatStatus.COMPLETED;
    this.lastExecutedTime = Date.now();
    this.executionCount++;

    console.log(`[Beat] Outcome: ${outcome}`);

    return {
      beatName: this.name,
      status: this.status,
      outcome: this.outcome,
      message: `Beat "${this.name}" executed with outcome: ${outcome}`,
      storyValueChanges,
      worldStateChanges,
      timestamp: this.lastExecutedTime,
    };
  }

  /**
   * Get current status
   */
  getStatus(): BeatStatus {
    return this.status;
  }

  /**
   * Get current outcome
   */
  getOutcome(): BeatOutcome {
    return this.outcome;
  }

  /**
   * Set outcome (FACADE 4.8)
   */
  setOutcome(outcome: BeatOutcome): void {
    this.outcome = outcome;
    console.log(`[Beat] "${this.name}" outcome set to: ${outcome}`);
  }

  /**
   * Get execution count
   */
  getExecutionCount(): number {
    return this.executionCount;
  }

  /**
   * Get time since last execution (ms)
   */
  getTimeSinceLastExecution(): number {
    if (this.lastExecutedTime === 0) {
      return Infinity;
    }
    return Date.now() - this.lastExecutedTime;
  }

  /**
   * Reset beat to pending
   */
  reset(): void {
    this.status = BeatStatus.PENDING;
    this.outcome = BeatOutcome.NONE;
    this.lastExecutedTime = 0;
    this.executionCount = 0;
  }

  /**
   * Skip this beat
   */
  skip(): void {
    this.status = BeatStatus.SKIPPED;
    console.log(`[Beat] Skipped: "${this.name}"`);
  }

  /**
   * Get beat info
   */
  getInfo(): {
    id: string;
    name: string;
    status: BeatStatus;
    outcome: BeatOutcome;
    priority: BeatPriority;
    executionCount: number;
    canRepeat: boolean;
  } {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      outcome: this.outcome,
      priority: this.priority,
      executionCount: this.executionCount,
      canRepeat: this.repeatable,
    };
  }
}

/**
 * Beat builder for easy construction
 */
export class BeatBuilder {
  private config: Partial<BeatConfig> = {};

  constructor(id: string, name: string) {
    this.config.id = id;
    this.config.name = name;
    this.config.priority = BeatPriority.NORMAL;
  }

  /**
   * Set description
   */
  withDescription(description: string): BeatBuilder {
    this.config.description = description;
    return this;
  }

  /**
   * Set priority
   */
  withPriority(priority: BeatPriority): BeatBuilder {
    this.config.priority = priority;
    return this;
  }

  /**
   * Add precondition
   */
  withPrecondition(precondition: IPrecondition): BeatBuilder {
    if (!this.config.preconditions) {
      this.config.preconditions = [];
    }
    this.config.preconditions.push(precondition);
    return this;
  }

  /**
   * Add precondition from builder
   */
  withPreconditionBuilder(builder: PreconditionBuilder): BeatBuilder {
    return this.withPrecondition(builder.build());
  }

  /**
   * Add story effect
   */
  withStoryEffect(value: string, delta: number, clamp?: { min: number; max: number }): BeatBuilder {
    if (!this.config.storyEffects) {
      this.config.storyEffects = [];
    }
    this.config.storyEffects.push({ value, delta, clamp });
    return this;
  }

  /**
   * Add world state effect
   */
  withWorldEffect(key: string, value: any): BeatBuilder {
    if (!this.config.worldEffects) {
      this.config.worldEffects = [];
    }
    this.config.worldEffects.push({ key, value });
    return this;
  }

  /**
   * Set cooldown
   */
  withCooldown(milliseconds: number): BeatBuilder {
    this.config.cooldown = milliseconds;
    return this;
  }

  /**
   * Make repeatable
   */
  repeatable(repeatable: boolean = true): BeatBuilder {
    this.config.repeatable = repeatable;
    return this;
  }

  /**
   * Set category
   */
  withCategory(category: string): BeatBuilder {
    this.config.category = category;
    return this;
  }

  /**
   * Set weight for probabilistic selection (FACADE 4.6)
   */
  withWeight(weight: number): BeatBuilder {
    this.config.weight = weight;
    return this;
  }

  /**
   * Add beats to unlock on success (FACADE 4.8)
   */
  unlocksOnSuccess(beatIds: string[]): BeatBuilder {
    this.config.unlocksOnSuccess = beatIds;
    return this;
  }

  /**
   * Add beats to unlock on failure (FACADE 4.8)
   */
  unlocksOnFailure(beatIds: string[]): BeatBuilder {
    this.config.unlocksOnFailure = beatIds;
    return this;
  }

  /**
   * Add beats to lock on success (FACADE 4.8)
   */
  locksOnSuccess(beatIds: string[]): BeatBuilder {
    this.config.locksOnSuccess = beatIds;
    return this;
  }

  /**
   * Add beats to lock on failure (FACADE 4.8)
   */
  locksOnFailure(beatIds: string[]): BeatBuilder {
    this.config.locksOnFailure = beatIds;
    return this;
  }

  /**
   * Add dialogue content
   */
  withDialogue(dialogue: string[]): BeatBuilder {
    if (!this.config.content) {
      this.config.content = {};
    }
    this.config.content.dialogue = dialogue;
    return this;
  }

  /**
   * Add narration content
   */
  withNarration(narration: string): BeatBuilder {
    if (!this.config.content) {
      this.config.content = {};
    }
    this.config.content.narration = narration;
    return this;
  }

  /**
   * Add player choices
   */
  withChoices(choices: { text: string; effects?: StoryValueEffect[] }[]): BeatBuilder {
    if (!this.config.content) {
      this.config.content = {};
    }
    this.config.content.choices = choices;
    return this;
  }

  /**
   * Build the beat
   */
  build(): Beat {
    if (!this.config.id || !this.config.name) {
      throw new Error('Beat must have id and name');
    }

    if (!this.config.description) {
      this.config.description = this.config.name;
    }

    return new Beat(this.config as BeatConfig);
  }
}
