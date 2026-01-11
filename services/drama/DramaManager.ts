/**
 * DramaManager - FACADE 4.1 + 4.3 + 4.6 + 4.7 + 4.8 + 4.9
 *
 * Drama Manager orchestrates narrative progression through beats.
 * Based on Facade's drama management system.
 *
 * Responsibilities:
 * - Maintain collection of beats
 * - Track story values (tension, affinity, etc.)
 * - Select appropriate beats based on preconditions and priority
 * - Execute beats and apply their effects
 * - Track narrative history
 * - (4.3) Select beats to hit story targets
 * - (4.6) Weighted/probabilistic beat selection
 * - (4.7) Dynamic beat selection with triggers
 * - (4.8) Beat success/failure handling and branching
 * - (4.9) Story memory and timeline tracking
 *
 * The drama manager ensures coherent story progression by managing
 * when and how beats activate.
 */

import { WorldState } from '../abl/WorldState';
import { Beat, BeatPriority, BeatStatus, BeatResult, BeatOutcome, StoryValueEffect } from './Beat';
import { TargetManager } from './StoryTarget';
import { StoryMemory, StoryEvent } from './StoryMemory';

/**
 * Beat selection trigger types (FACADE 4.7)
 */
export enum TriggerType {
  /** Trigger on player action */
  PLAYER_ACTION = 'player_action',

  /** Trigger when story value crosses threshold */
  STORY_VALUE_THRESHOLD = 'story_value_threshold',

  /** Trigger after time elapsed */
  TIME_ELAPSED = 'time_elapsed',

  /** Trigger when world state changes */
  WORLD_STATE_CHANGE = 'world_state_change',

  /** Manual trigger */
  MANUAL = 'manual',
}

/**
 * Beat selection trigger configuration
 */
export interface BeatTrigger {
  type: TriggerType;
  condition?: any;
}

/**
 * Drama manager configuration
 */
export interface DramaManagerConfig {
  /** Enable debug logging */
  debug?: boolean;

  /** Story value initial values */
  initialStoryValues?: Record<string, number>;

  /** Auto-advance to next beat? */
  autoAdvance?: boolean;

  /** Use target-driven beat selection? (FACADE 4.3) */
  useTargetDrivenSelection?: boolean;

  /** Use weighted/probabilistic beat selection? (FACADE 4.6) */
  useWeightedSelection?: boolean;

  /** Randomness factor for weighted selection (0 = deterministic, 1 = fully random) */
  randomnessFactor?: number;

  /** Enable dynamic beat selection with triggers? (FACADE 4.7) */
  useDynamicSelection?: boolean;

  /** Story value thresholds for triggering beat selection (FACADE 4.7) */
  storyValueThresholds?: Record<string, { threshold: number; direction: 'above' | 'below' | 'crosses' }>;
}

/**
 * Narrative history entry
 */
export interface NarrativeHistoryEntry {
  beatName: string;
  timestamp: number;
  storyValueSnapshot: Record<string, number>;
}

/**
 * Drama Manager - orchestrates narrative progression
 */
export class DramaManager {
  private beats: Map<string, Beat> = new Map();
  private storyValues: Map<string, number> = new Map();
  private previousStoryValues: Map<string, number> = new Map();
  private worldState: WorldState;
  private config: DramaManagerConfig;
  private narrativeHistory: NarrativeHistoryEntry[] = [];
  private currentBeat: Beat | null = null;
  private targetManager: TargetManager = new TargetManager();
  private lastPlayerAction: string | null = null;
  private gameStartTime: number = Date.now();
  private lockedBeats: Set<string> = new Set(); // FACADE 4.8
  private storyMemory: StoryMemory = new StoryMemory(); // FACADE 4.9

  constructor(worldState: WorldState, config: DramaManagerConfig = {}) {
    this.worldState = worldState;
    this.config = {
      debug: config.debug ?? false,
      autoAdvance: config.autoAdvance ?? false,
      initialStoryValues: config.initialStoryValues ?? {},
      useTargetDrivenSelection: config.useTargetDrivenSelection ?? false,
      useWeightedSelection: config.useWeightedSelection ?? false,
      randomnessFactor: config.randomnessFactor ?? 0.3,
      useDynamicSelection: config.useDynamicSelection ?? false,
      storyValueThresholds: config.storyValueThresholds ?? {},
    };

    // Initialize story values
    for (const [key, value] of Object.entries(this.config.initialStoryValues || {})) {
      this.storyValues.set(key, value);
    }

    this.log('Drama Manager initialized');
  }

  /**
   * Register a beat
   */
  addBeat(beat: Beat): void {
    this.beats.set(beat.id, beat);
    this.log(`Added beat: "${beat.name}" (priority: ${beat.priority})`);
  }

  /**
   * Register multiple beats
   */
  addBeats(beats: Beat[]): void {
    for (const beat of beats) {
      this.addBeat(beat);
    }
  }

  /**
   * Get all available beats (can execute now)
   */
  getAvailableBeats(): Beat[] {
    const available: Beat[] = [];

    for (const beat of this.beats.values()) {
      // Skip locked beats (FACADE 4.8)
      if (this.lockedBeats.has(beat.id)) {
        continue;
      }

      if (beat.canExecute(this.worldState)) {
        available.push(beat);
      }
    }

    // Sort by priority (highest first)
    available.sort((a, b) => b.priority - a.priority);

    return available;
  }

  /**
   * Select best beat to execute
   * Returns highest priority available beat
   * If useTargetDrivenSelection is enabled, prefers beats that move values toward targets
   * If useWeightedSelection is enabled, uses probabilistic selection
   */
  selectBeat(): Beat | null {
    const available = this.getAvailableBeats();

    if (available.length === 0) {
      this.log('No available beats');
      return null;
    }

    // Weighted/probabilistic selection (FACADE 4.6)
    if (this.config.useWeightedSelection) {
      return this.selectBeatWeighted(available);
    }

    // If target-driven selection is disabled, use priority-based selection
    if (!this.config.useTargetDrivenSelection) {
      const selected = available[0];
      this.log(`Selected beat: "${selected.name}" (priority: ${selected.priority})`);
      return selected;
    }

    // Target-driven selection (FACADE 4.3)
    return this.selectBeatForTargets(available);
  }

  /**
   * Select beat that best moves story values toward targets (FACADE 4.3)
   */
  private selectBeatForTargets(availableBeats: Beat[]): Beat {
    // Get all deviations
    const deviations = this.targetManager.getAllDeviations(this.storyValues);

    // Score each beat based on how well it moves values toward targets
    const scores = availableBeats.map(beat => {
      let score = 0;

      // Base score from priority
      score += beat.priority;

      // Add score based on how well beat effects align with target deviations
      for (const effect of beat.storyEffects) {
        const deviation = deviations.get(effect.value);
        if (deviation !== undefined) {
          // If we're below target (negative deviation), reward positive effects
          // If we're above target (positive deviation), reward negative effects
          if (deviation < 0 && effect.delta > 0) {
            score += Math.abs(deviation) * 0.5; // Boost for helpful effects
          } else if (deviation > 0 && effect.delta < 0) {
            score += Math.abs(deviation) * 0.5; // Boost for helpful effects
          } else if (Math.sign(deviation) === Math.sign(effect.delta)) {
            score -= Math.abs(deviation) * 0.3; // Penalty for unhelpful effects
          }
        }
      }

      return { beat, score };
    });

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    const selected = scores[0].beat;
    this.log(`Selected beat (target-driven): "${selected.name}" (score: ${scores[0].score.toFixed(1)})`);

    return selected;
  }

  /**
   * Select beat using weighted/probabilistic selection (FACADE 4.6)
   */
  private selectBeatWeighted(availableBeats: Beat[]): Beat {
    // Calculate weights for each beat
    const weights = availableBeats.map(beat => {
      let weight = beat.weight;

      // Modify weight based on priority
      weight *= (beat.priority / 50); // Normalize around BeatPriority.NORMAL = 50

      // If using target-driven selection, modify weight based on target alignment
      if (this.config.useTargetDrivenSelection) {
        const deviations = this.targetManager.getAllDeviations(this.storyValues);

        for (const effect of beat.storyEffects) {
          const deviation = deviations.get(effect.value);
          if (deviation !== undefined) {
            // Increase weight if beat helps reach target
            if (deviation < 0 && effect.delta > 0) {
              weight *= (1 + Math.abs(deviation) * 0.01);
            } else if (deviation > 0 && effect.delta < 0) {
              weight *= (1 + Math.abs(deviation) * 0.01);
            } else if (Math.sign(deviation) === Math.sign(effect.delta)) {
              weight *= 0.8; // Reduce weight if beat moves away from target
            }
          }
        }
      }

      return { beat, weight };
    });

    // Calculate total weight
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

    // Apply randomness factor
    const randomnessFactor = this.config.randomnessFactor || 0.3;

    // Weighted random selection
    let random = Math.random() * totalWeight * (1 + randomnessFactor);

    // Find selected beat
    let cumulativeWeight = 0;
    for (const { beat, weight } of weights) {
      cumulativeWeight += weight;
      if (random <= cumulativeWeight) {
        this.log(`Selected beat (weighted): "${beat.name}" (weight: ${weight.toFixed(2)}, total: ${totalWeight.toFixed(2)})`);
        return beat;
      }
    }

    // Fallback to last beat (should never happen)
    const fallback = weights[weights.length - 1].beat;
    this.log(`Selected beat (weighted fallback): "${fallback.name}"`);
    return fallback;
  }

  /**
   * Execute a specific beat
   */
  executeBeat(beatId: string): BeatResult | null {
    const beat = this.beats.get(beatId);

    if (!beat) {
      console.error(`[DramaManager] Beat not found: ${beatId}`);
      return null;
    }

    if (!beat.canExecute(this.worldState)) {
      console.error(`[DramaManager] Beat cannot execute: "${beat.name}"`);
      return null;
    }

    return this.executeBeatInstance(beat);
  }

  /**
   * Execute a beat instance
   */
  private executeBeatInstance(beat: Beat, outcome: BeatOutcome = BeatOutcome.SUCCESS): BeatResult {
    this.currentBeat = beat;

    // Snapshot story values before execution
    const snapshot: Record<string, number> = {};
    for (const [key, value] of this.storyValues.entries()) {
      snapshot[key] = value;
    }

    // Execute beat with outcome
    const result = beat.execute(this.worldState, this.storyValues, outcome);

    // Process beat unlocking/locking based on outcome (FACADE 4.8)
    this.processBeatOutcome(beat, outcome);

    // Record in narrative history
    this.narrativeHistory.push({
      beatName: beat.name,
      timestamp: result.timestamp,
      storyValueSnapshot: snapshot,
    });

    // Record in story memory (FACADE 4.9)
    this.storyMemory.recordEvent({
      beatId: beat.id,
      beatName: beat.name,
      outcome,
      storyValueSnapshot: snapshot,
      worldStateChanges: result.worldStateChanges,
      storyValueChanges: result.storyValueChanges,
      tags: beat.category ? [beat.category] : undefined,
      description: beat.description,
    });

    this.currentBeat = null;

    this.log(`Executed beat: "${beat.name}" (outcome: ${outcome})`);

    return result;
  }

  /**
   * Advance story (execute next best beat)
   */
  advance(): BeatResult | null {
    const beat = this.selectBeat();

    if (!beat) {
      this.log('No beat to advance to');
      return null;
    }

    return this.executeBeatInstance(beat);
  }

  /**
   * Tick - called each update cycle
   * Auto-advances if configured
   */
  tick(): BeatResult | null {
    if (this.config.autoAdvance) {
      return this.advance();
    }
    return null;
  }

  /**
   * Get story value
   */
  getStoryValue(key: string): number {
    return this.storyValues.get(key) || 0;
  }

  /**
   * Set story value
   */
  setStoryValue(key: string, value: number): void {
    // Store previous value for threshold checking (FACADE 4.7)
    this.previousStoryValues.set(key, this.storyValues.get(key) || 0);

    this.storyValues.set(key, value);
    this.log(`Story value: ${key} = ${value.toFixed(1)}`);

    // Check for threshold triggers (FACADE 4.7)
    if (this.config.useDynamicSelection) {
      this.checkStoryValueThresholds(key);
    }
  }

  /**
   * Modify story value
   */
  modifyStoryValue(key: string, delta: number, clamp?: { min: number; max: number }): void {
    const current = this.getStoryValue(key);
    let newValue = current + delta;

    if (clamp) {
      newValue = Math.max(clamp.min, Math.min(clamp.max, newValue));
    }

    this.setStoryValue(key, newValue);
  }

  /**
   * Get all story values
   */
  getAllStoryValues(): Record<string, number> {
    const values: Record<string, number> = {};
    for (const [key, value] of this.storyValues.entries()) {
      values[key] = value;
    }
    return values;
  }

  /**
   * Get beat by id
   */
  getBeat(beatId: string): Beat | undefined {
    return this.beats.get(beatId);
  }

  /**
   * Get all beats
   */
  getAllBeats(): Beat[] {
    return Array.from(this.beats.values());
  }

  /**
   * Get beats by category
   */
  getBeatsByCategory(category: string): Beat[] {
    return Array.from(this.beats.values()).filter(b => b.category === category);
  }

  /**
   * Get beats by status
   */
  getBeatsByStatus(status: BeatStatus): Beat[] {
    return Array.from(this.beats.values()).filter(b => b.getStatus() === status);
  }

  /**
   * Get completed beats
   */
  getCompletedBeats(): Beat[] {
    return this.getBeatsByStatus(BeatStatus.COMPLETED);
  }

  /**
   * Get pending beats
   */
  getPendingBeats(): Beat[] {
    return this.getBeatsByStatus(BeatStatus.PENDING);
  }

  /**
   * Get narrative history
   */
  getNarrativeHistory(): NarrativeHistoryEntry[] {
    return [...this.narrativeHistory];
  }

  /**
   * Get current beat
   */
  getCurrentBeat(): Beat | null {
    return this.currentBeat;
  }

  /**
   * Get target manager (FACADE 4.3)
   */
  getTargetManager(): TargetManager {
    return this.targetManager;
  }

  /**
   * Get target summary (FACADE 4.3)
   */
  getTargetSummary(): string {
    return this.targetManager.getSummary(this.storyValues);
  }

  /**
   * Notify drama manager of player action (FACADE 4.7)
   * Triggers dynamic beat selection if enabled
   */
  onPlayerAction(action: string): BeatResult | null {
    this.lastPlayerAction = action;
    this.log(`Player action: ${action}`);

    if (this.config.useDynamicSelection) {
      return this.evaluateDynamicTriggers(TriggerType.PLAYER_ACTION, action);
    }

    return null;
  }

  /**
   * Check story value thresholds (FACADE 4.7)
   */
  private checkStoryValueThresholds(key: string): void {
    const thresholds = this.config.storyValueThresholds || {};
    const threshold = thresholds[key];

    if (!threshold) {
      return;
    }

    const currentValue = this.storyValues.get(key) || 0;
    const previousValue = this.previousStoryValues.get(key) || 0;

    let triggered = false;

    if (threshold.direction === 'above' && currentValue >= threshold.threshold && previousValue < threshold.threshold) {
      triggered = true;
    } else if (threshold.direction === 'below' && currentValue <= threshold.threshold && previousValue > threshold.threshold) {
      triggered = true;
    } else if (threshold.direction === 'crosses') {
      if ((previousValue < threshold.threshold && currentValue >= threshold.threshold) ||
          (previousValue > threshold.threshold && currentValue <= threshold.threshold)) {
        triggered = true;
      }
    }

    if (triggered) {
      this.log(`Story value threshold triggered: ${key} ${threshold.direction} ${threshold.threshold}`);
      this.evaluateDynamicTriggers(TriggerType.STORY_VALUE_THRESHOLD, { key, value: currentValue });
    }
  }

  /**
   * Evaluate dynamic triggers and potentially select/execute beat (FACADE 4.7)
   */
  private evaluateDynamicTriggers(triggerType: TriggerType, condition?: any): BeatResult | null {
    this.log(`Evaluating dynamic triggers: ${triggerType}`);

    // Check if any high-priority beats are available
    const available = this.getAvailableBeats();

    if (available.length === 0) {
      return null;
    }

    // Only auto-trigger CRITICAL and HIGH priority beats
    const criticalBeats = available.filter(b => b.priority >= BeatPriority.HIGH);

    if (criticalBeats.length === 0) {
      return null;
    }

    // Select and execute beat
    this.log(`Dynamic trigger activated: ${criticalBeats.length} high-priority beats available`);

    // Use configured selection method
    const beat = this.selectBeat();

    if (beat && beat.priority >= BeatPriority.HIGH) {
      this.log(`Auto-executing beat due to trigger: "${beat.name}"`);
      return this.executeBeatInstance(beat);
    }

    return null;
  }

  /**
   * Get elapsed game time in milliseconds (FACADE 4.7)
   */
  getElapsedTime(): number {
    return Date.now() - this.gameStartTime;
  }

  /**
   * Get last player action (FACADE 4.7)
   */
  getLastPlayerAction(): string | null {
    return this.lastPlayerAction;
  }

  /**
   * Process beat outcome - unlock/lock beats (FACADE 4.8)
   */
  private processBeatOutcome(beat: Beat, outcome: BeatOutcome): void {
    switch (outcome) {
      case BeatOutcome.SUCCESS:
        // Unlock beats
        for (const beatId of beat.unlocksOnSuccess) {
          this.unlockBeat(beatId);
        }
        // Lock beats
        for (const beatId of beat.locksOnSuccess) {
          this.lockBeat(beatId);
        }
        break;

      case BeatOutcome.FAILURE:
        // Unlock beats
        for (const beatId of beat.unlocksOnFailure) {
          this.unlockBeat(beatId);
        }
        // Lock beats
        for (const beatId of beat.locksOnFailure) {
          this.lockBeat(beatId);
        }
        break;

      case BeatOutcome.PARTIAL:
        // Partial success - unlock beats from both success and failure
        for (const beatId of beat.unlocksOnSuccess) {
          this.unlockBeat(beatId);
        }
        for (const beatId of beat.unlocksOnFailure) {
          this.unlockBeat(beatId);
        }
        break;

      default:
        // No outcome processing
        break;
    }
  }

  /**
   * Lock a beat (FACADE 4.8)
   */
  lockBeat(beatId: string): void {
    if (this.lockedBeats.has(beatId)) {
      return;
    }

    this.lockedBeats.add(beatId);
    const beat = this.beats.get(beatId);
    if (beat) {
      this.log(`Locked beat: "${beat.name}"`);
    } else {
      this.log(`Locked beat ID: ${beatId} (not yet added)`);
    }
  }

  /**
   * Unlock a beat (FACADE 4.8)
   */
  unlockBeat(beatId: string): void {
    if (!this.lockedBeats.has(beatId)) {
      return;
    }

    this.lockedBeats.delete(beatId);
    const beat = this.beats.get(beatId);
    if (beat) {
      this.log(`Unlocked beat: "${beat.name}"`);
    } else {
      this.log(`Unlocked beat ID: ${beatId}`);
    }
  }

  /**
   * Check if a beat is locked (FACADE 4.8)
   */
  isBeatLocked(beatId: string): boolean {
    return this.lockedBeats.has(beatId);
  }

  /**
   * Execute a beat with a specific outcome (FACADE 4.8)
   */
  executeBeatWithOutcome(beatId: string, outcome: BeatOutcome): BeatResult | null {
    const beat = this.beats.get(beatId);

    if (!beat) {
      this.log(`Beat not found: ${beatId}`);
      return null;
    }

    if (this.lockedBeats.has(beatId)) {
      this.log(`Beat is locked: "${beat.name}"`);
      return null;
    }

    if (!beat.canExecute(this.worldState)) {
      this.log(`Beat preconditions not met: "${beat.name}"`);
      return null;
    }

    return this.executeBeatInstance(beat, outcome);
  }

  /**
   * Get story memory (FACADE 4.9)
   */
  getStoryMemory(): StoryMemory {
    return this.storyMemory;
  }

  /**
   * Reset drama manager
   */
  reset(): void {
    // Reset all beats
    for (const beat of this.beats.values()) {
      beat.reset();
    }

    // Clear history
    this.narrativeHistory = [];

    // Reset story values to initial
    this.storyValues.clear();
    for (const [key, value] of Object.entries(this.config.initialStoryValues || {})) {
      this.storyValues.set(key, value);
    }

    // Clear locked beats (FACADE 4.8)
    this.lockedBeats.clear();

    // Clear story memory (FACADE 4.9)
    this.storyMemory.clear();

    this.currentBeat = null;

    this.log('Drama Manager reset');
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalBeats: number;
    completedBeats: number;
    pendingBeats: number;
    availableBeats: number;
    narrativeLength: number;
  } {
    return {
      totalBeats: this.beats.size,
      completedBeats: this.getCompletedBeats().length,
      pendingBeats: this.getPendingBeats().length,
      availableBeats: this.getAvailableBeats().length,
      narrativeLength: this.narrativeHistory.length,
    };
  }

  /**
   * Get narrative summary
   */
  getNarrativeSummary(): string {
    const lines = ['=== Narrative Summary ==='];

    for (const entry of this.narrativeHistory) {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      lines.push(`[${time}] ${entry.beatName}`);

      // Show story value changes
      const values = Object.entries(entry.storyValueSnapshot)
        .map(([k, v]) => `${k}: ${v.toFixed(1)}`)
        .join(', ');

      if (values) {
        lines.push(`  Story Values: ${values}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Export state for save/load
   */
  exportState(): {
    storyValues: Record<string, number>;
    completedBeatIds: string[];
    narrativeHistory: NarrativeHistoryEntry[];
  } {
    return {
      storyValues: this.getAllStoryValues(),
      completedBeatIds: this.getCompletedBeats().map(b => b.id),
      narrativeHistory: [...this.narrativeHistory],
    };
  }

  /**
   * Import state from save
   */
  importState(state: {
    storyValues: Record<string, number>;
    completedBeatIds: string[];
    narrativeHistory: NarrativeHistoryEntry[];
  }): void {
    // Restore story values
    this.storyValues.clear();
    for (const [key, value] of Object.entries(state.storyValues)) {
      this.storyValues.set(key, value);
    }

    // Mark beats as completed
    for (const beatId of state.completedBeatIds) {
      const beat = this.beats.get(beatId);
      if (beat) {
        beat.execute(this.worldState, this.storyValues);
      }
    }

    // Restore narrative history
    this.narrativeHistory = [...state.narrativeHistory];

    this.log('State imported');
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[DramaManager] ${message}`);
    }
  }
}
