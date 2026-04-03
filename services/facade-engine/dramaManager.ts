/**
 * Drama Manager Service
 *
 * The brain of the Facade interactive drama system.
 * Responsible for:
 * - Beat selection (choosing which story beat to play)
 * - Story progression (advancing through tiers/acts)
 * - Responding to player actions
 * - Managing dramatic tension and pacing
 *
 * This is the TypeScript equivalent of Facade's Drama Manager + ABL beat sequencer.
 */

import {
  FacadeBeat,
  BeatID,
  BeatSelectionResult,
  BeatPrecondition,
  DiscourseActWME,
  AnimationCue,
} from '../../types/facade';
import { WorldMemory } from './worldMemory';
import { BehaviorExecutor } from './behaviorExecutor';

export class DramaManager {
  private worldMemory: WorldMemory;
  private behaviorExecutor: BehaviorExecutor;
  private beats: Map<BeatID, FacadeBeat>;
  private isProcessing: boolean = false;

  constructor(
    beats: FacadeBeat[],
    worldMemory: WorldMemory,
    behaviorExecutor: BehaviorExecutor
  ) {
    this.worldMemory = worldMemory;
    this.behaviorExecutor = behaviorExecutor;

    // Index beats by ID
    this.beats = new Map();
    for (const beat of beats) {
      this.beats.set(beat.id, beat);
    }

    console.log(`[DramaManager] Initialized with ${beats.length} beats`);
    console.log(`[DramaManager] Tier 1 beats: ${beats.filter(b => b.tier === 1).length}`);
    console.log(`[DramaManager] Tier 2 beats: ${beats.filter(b => b.tier === 2).length}`);
    console.log(`[DramaManager] Tier 3 beats: ${beats.filter(b => b.tier === 3).length}`);
  }

  // ============================================================================
  // BEAT SELECTION
  // ============================================================================

  /**
   * Select the next beat to play
   * This is the core of the drama management system
   */
  async selectNextBeat(): Promise<BeatSelectionResult> {
    console.log('[DramaManager] Selecting next beat...');

    const currentTier = this.worldMemory.getCurrentTier();
    const currentBeat = this.worldMemory.getCurrentBeat();

    // Get candidate beats
    const candidates = this.getCandidateBeats(currentTier);

    console.log(`[DramaManager] Found ${candidates.length} candidate beats for Tier ${currentTier}`);

    if (candidates.length === 0) {
      // No candidates - may need to advance tier or end session
      if (currentTier < 3) {
        console.log(`[DramaManager] No candidates in Tier ${currentTier}, advancing to next tier`);
        this.worldMemory.advanceToNextTier();
        return this.selectNextBeat(); // Recursive call
      }

      return {
        selected: false,
        reason: 'No eligible beats available',
        candidateCount: 0,
      };
    }

    // Evaluate preconditions and priority for each candidate
    const scored: Array<{beat: FacadeBeat; score: number}> = [];

    for (const beat of candidates) {
      const preconditionsMet = this.evaluatePreconditions(beat);

      if (preconditionsMet) {
        const score = this.calculateBeatPriority(beat);
        scored.push({ beat, score });
      }
    }

    console.log(`[DramaManager] ${scored.length} beats passed precondition checks`);

    if (scored.length === 0) {
      return {
        selected: false,
        reason: 'No beats passed precondition checks',
        candidateCount: candidates.length,
      };
    }

    // Sort by score (highest first)
    scored.sort((a, b) => b.score - a.score);

    // Select highest scoring beat
    const selectedBeat = scored[0].beat;

    console.log(`[DramaManager] Selected beat: ${selectedBeat.name} (score: ${scored[0].score.toFixed(2)})`);

    return {
      selected: true,
      beat: selectedBeat,
      reason: `Highest priority beat (score: ${scored[0].score.toFixed(2)})`,
      candidateCount: candidates.length,
      alternativeBeat: scored[1]?.beat.id,
    };
  }

  /**
   * Get candidate beats for current tier
   */
  private getCandidateBeats(tier: 1 | 2 | 3): FacadeBeat[] {
    const candidates: FacadeBeat[] = [];

    for (const beat of this.beats.values()) {
      // Must match current tier
      if (beat.tier !== tier) continue;

      // Check max activations
      const activationCount = this.worldMemory.getBeatActivationCount(beat.id);
      if (activationCount >= beat.maxActivations) {
        continue; // Already played max times
      }

      candidates.push(beat);
    }

    return candidates;
  }

  /**
   * Evaluate if beat's preconditions are met
   */
  private evaluatePreconditions(beat: FacadeBeat): boolean {
    if (!beat.preconditions || beat.preconditions.length === 0) {
      return true; // No preconditions
    }

    for (const precondition of beat.preconditions) {
      if (precondition.required && !this.evaluateSinglePrecondition(precondition)) {
        return false; // Required precondition not met
      }
    }

    return true;
  }

  /**
   * Evaluate a single precondition
   */
  private evaluateSinglePrecondition(precondition: BeatPrecondition): boolean {
    switch (precondition.type) {
      case 'fact':
        // Check if a fact matches expected value
        // Condition format: "factName == value" or "factName > value"
        return this.evaluateFactCondition(precondition.condition);

      case 'history':
        // Check beat history
        // Condition format: "beatId played" or "beatId not played"
        return this.evaluateHistoryCondition(precondition.condition);

      case 'timing':
        // Check timing conditions
        // Condition format: "session > 120000" (more than 2 minutes in)
        return this.evaluateTimingCondition(precondition.condition);

      case 'wme':
        // Check working memory elements
        return this.evaluateWMECondition(precondition.condition);

      case 'custom':
        // Custom JavaScript evaluation (be careful!)
        return this.evaluateCustomCondition(precondition.condition);

      default:
        console.warn(`[DramaManager] Unknown precondition type: ${precondition.type}`);
        return false;
    }
  }

  /**
   * Evaluate fact condition (e.g., "playerInvited == true")
   */
  private evaluateFactCondition(condition: string): boolean {
    // Simple parser for fact conditions
    const match = condition.match(/(\w+)\s*(==|!=|>|<|>=|<=)\s*(.+)/);

    if (!match) {
      console.warn(`[DramaManager] Invalid fact condition: ${condition}`);
      return false;
    }

    const [, factName, operator, valueStr] = match;
    const factValue = this.worldMemory.getFact(factName);
    let expectedValue: any = valueStr.trim();

    // Parse expected value
    if (expectedValue === 'true') expectedValue = true;
    else if (expectedValue === 'false') expectedValue = false;
    else if (!isNaN(Number(expectedValue))) expectedValue = Number(expectedValue);

    // Evaluate operator
    switch (operator) {
      case '==': return factValue === expectedValue;
      case '!=': return factValue !== expectedValue;
      case '>': return Number(factValue) > Number(expectedValue);
      case '<': return Number(factValue) < Number(expectedValue);
      case '>=': return Number(factValue) >= Number(expectedValue);
      case '<=': return Number(factValue) <= Number(expectedValue);
      default: return false;
    }
  }

  /**
   * Evaluate history condition (e.g., "GGreetsP_T1 played")
   */
  private evaluateHistoryCondition(condition: string): boolean {
    const match = condition.match(/(\w+)\s+(played|not played)/);

    if (!match) {
      console.warn(`[DramaManager] Invalid history condition: ${condition}`);
      return false;
    }

    const [, beatName, requirement] = match;

    // Find beat ID by name
    let beatId: BeatID | undefined;
    for (const [id, beat] of this.beats.entries()) {
      if (beat.name === beatName) {
        beatId = id;
        break;
      }
    }

    if (beatId === undefined) {
      console.warn(`[DramaManager] Unknown beat in history condition: ${beatName}`);
      return false;
    }

    const hasBeenPlayed = this.worldMemory.hasBeatBeenPlayed(beatId);

    return requirement === 'played' ? hasBeenPlayed : !hasBeenPlayed;
  }

  /**
   * Evaluate timing condition (e.g., "session > 120000")
   */
  private evaluateTimingCondition(condition: string): boolean {
    const match = condition.match(/(session|time)\s*(>|<|>=|<=)\s*(\d+)/);

    if (!match) {
      console.warn(`[DramaManager] Invalid timing condition: ${condition}`);
      return false;
    }

    const [, metric, operator, valueStr] = match;
    const value = Number(valueStr);

    const sessionDuration = this.worldMemory.getSessionDuration();

    switch (operator) {
      case '>': return sessionDuration > value;
      case '<': return sessionDuration < value;
      case '>=': return sessionDuration >= value;
      case '<=': return sessionDuration <= value;
      default: return false;
    }
  }

  /**
   * Evaluate WME condition
   */
  private evaluateWMECondition(condition: string): boolean {
    // Simplified WME checking
    // In a full implementation, this would query working memory elements
    return true;
  }

  /**
   * Evaluate custom condition (JavaScript eval - use carefully!)
   */
  private evaluateCustomCondition(condition: string): boolean {
    try {
      // Provide context for eval
      const worldMemory = this.worldMemory;
      const func = new Function('worldMemory', `return ${condition};`);
      return func(worldMemory);
    } catch (e) {
      console.error(`[DramaManager] Error evaluating custom condition: ${e}`);
      return false;
    }
  }

  /**
   * Calculate beat priority score
   */
  private calculateBeatPriority(beat: FacadeBeat): number {
    let score = beat.priority;

    // Adjust based on character affinity
    if (beat.affinity) {
      const charState = this.worldMemory.getCharacterState(beat.affinity as 'grace' | 'trip');
      const affinity = charState.affinityToPlayer;

      // Boost score if character likes player
      if (affinity > 0) {
        score += affinity * 0.5;
      }
    }

    // Adjust based on topic relevance (if we track recent topics)
    // This would require more context tracking

    // Adjust based on dramatic timing
    const sessionDuration = this.worldMemory.getSessionDuration();
    const sessionMinutes = sessionDuration / 60000;

    // Boost crisis/ending beats if session is long
    if (beat.tier === 3 && sessionMinutes > 10) {
      score += 20;
    }

    // Penalize beats that have been played recently
    const beatHistory = this.worldMemory.getBeatHistory();
    const recentBeats = beatHistory.slice(-5);

    if (recentBeats.includes(beat.id)) {
      score -= 30; // Strong penalty for repetition
    }

    return score;
  }

  // ============================================================================
  // BEAT EXECUTION
  // ============================================================================

  /**
   * Execute a beat
   */
  async executeBeat(beat: FacadeBeat): Promise<AnimationCue[]> {
    console.log(`[DramaManager] Executing beat: ${beat.name}`);

    this.isProcessing = true;

    // Set as current beat
    this.worldMemory.setCurrentBeat(beat.id);

    // Call init action if defined
    if (beat.initAction) {
      console.log(`[DramaManager] Calling initAction: ${beat.initAction}`);
      // In full implementation, this would execute the actual init function
    }

    // Call select action if defined
    if (beat.selectAction) {
      console.log(`[DramaManager] Calling selectAction: ${beat.selectAction}`);
    }

    // Execute beat steps
    const allCues: AnimationCue[] = [];

    for (let i = 0; i < beat.steps.length; i++) {
      const step = beat.steps[i];

      console.log(`[DramaManager] Executing step ${i + 1}/${beat.steps.length}: ${step.character} ${step.action}`);

      const cues = await this.behaviorExecutor.executeBeatStep(step);
      allCues.push(...cues);

      // Check for commit point
      if (beat.commitPoint !== undefined && i === beat.commitPoint) {
        this.worldMemory.updateBeatStatus({ bCommitPointReached: true });
        console.log(`[DramaManager] Commit point reached at step ${i}`);
      }

      // Check for gist point
      if (beat.gistPoint !== undefined && i === beat.gistPoint) {
        this.worldMemory.updateBeatStatus({ bGistPointReached: true });
        console.log(`[DramaManager] Gist point reached at step ${i}`);
      }

      // Check for mix-ins (if enabled and before commit point)
      if (step.mixinCheck && !this.worldMemory.getBeatStatus().bCommitPointReached) {
        const shouldInterrupt = await this.checkForMixins(beat);

        if (shouldInterrupt) {
          console.log(`[DramaManager] Beat interrupted by mix-in`);
          break;
        }
      }

      // Wait if needed
      if (step.waitFor === 'playerInput') {
        console.log(`[DramaManager] Waiting for player input...`);
        break; // Stop beat execution, wait for player
      }

      this.worldMemory.advanceBeatStep();
    }

    // Call succeed action if defined
    if (beat.succeedAction) {
      console.log(`[DramaManager] Calling succeedAction: ${beat.succeedAction}`);
    }

    // Apply world effects
    if (beat.worldEffects && beat.worldEffects.length > 0) {
      this.worldMemory.applyWorldEffects(beat.worldEffects);
    }

    this.isProcessing = false;

    console.log(`[DramaManager] Beat execution complete: ${beat.name}`);

    return allCues;
  }

  /**
   * Check if any mix-ins should interrupt current beat
   */
  private async checkForMixins(currentBeat: FacadeBeat): Promise<boolean> {
    // Check for unhandled discourse acts
    const unhandledDAs = this.worldMemory.getUnhandledDiscourseActs();

    if (unhandledDAs.length > 0 && currentBeat.allowMixins.DA) {
      console.log(`[DramaManager] Unhandled DAs detected, may trigger mix-in`);
      // In full implementation, would select and execute appropriate mix-in beat
      return false; // For now, don't interrupt
    }

    // Check for "push too far" conditions
    if (currentBeat.allowMixins.pushTooFar) {
      const tension = this.worldMemory.getRelationshipTension();

      if (tension > 80) {
        console.log(`[DramaManager] High tension detected (${tension}), may trigger push-too-far`);
        // In full implementation, would trigger push-too-far mix-in
        return false;
      }
    }

    return false;
  }

  // ============================================================================
  // DISCOURSE ACT HANDLING
  // ============================================================================

  /**
   * Process a discourse act from the player
   */
  async processDiscourseAct(da: DiscourseActWME): Promise<void> {
    console.log(`[DramaManager] Processing discourse act: type=${da.id}, char=${da.charID}`);

    // Add to world memory
    this.worldMemory.addDiscourseAct(da);

    // Check if current beat can handle this DA
    const currentBeat = this.worldMemory.getCurrentBeat();

    if (currentBeat !== undefined) {
      const beat = this.beats.get(currentBeat);

      if (beat && beat.allowMixins.DA) {
        // Beat allows DA interruptions
        console.log(`[DramaManager] Current beat allows DA interruptions`);

        // In full implementation, would check for appropriate response
        // For now, mark as partially handled
        this.worldMemory.markDiscourseActHandled(da, 1);
      }
    }

    // Adjust character states based on DA
    this.applyDiscourseActEffects(da);
  }

  /**
   * Apply effects of a discourse act to world state
   */
  private applyDiscourseActEffects(da: DiscourseActWME): void {
    const targetChar = da.charID === 68 ? 'grace' : 'trip'; // 68 = grace, 69 = trip

    switch (da.id) {
      case 11: // Praise
        this.worldMemory.adjustCharacterAffinity(targetChar, 5);
        this.worldMemory.adjustCharacterMood(targetChar, 5);
        console.log(`[DramaManager] Praise → ${targetChar} affinity +5, mood +5`);
        break;

      case 12: // Criticize
        this.worldMemory.adjustCharacterAffinity(targetChar, -10);
        this.worldMemory.adjustCharacterMood(targetChar, -10);
        this.worldMemory.adjustRelationshipTension(5);
        console.log(`[DramaManager] Criticize → ${targetChar} affinity -10, mood -10, tension +5`);
        break;

      case 13: // Ally
        this.worldMemory.adjustCharacterAffinity(targetChar, 10);
        console.log(`[DramaManager] Ally → ${targetChar} affinity +10`);
        break;

      case 14: // Oppose
        this.worldMemory.adjustCharacterAffinity(targetChar, -10);
        this.worldMemory.adjustRelationshipTension(3);
        console.log(`[DramaManager] Oppose → ${targetChar} affinity -10, tension +3`);
        break;

      case 17: // Comfort
        this.worldMemory.adjustCharacterMood(targetChar, 10);
        this.worldMemory.adjustRelationshipTension(-5);
        console.log(`[DramaManager] Comfort → ${targetChar} mood +10, tension -5`);
        break;

      case 15: // Flirt
        this.worldMemory.adjustCharacterAffinity(targetChar, 3);
        // May increase tension if inappropriate
        break;

      default:
        // Other DAs have varying effects
        break;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Check if drama manager is currently processing
   */
  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Get beat by ID
   */
  getBeat(beatId: BeatID): FacadeBeat | undefined {
    return this.beats.get(beatId);
  }

  /**
   * Get all beats for a tier
   */
  getBeatsForTier(tier: 1 | 2 | 3): FacadeBeat[] {
    return Array.from(this.beats.values()).filter(b => b.tier === tier);
  }

  /**
   * Debug: Print drama manager state
   */
  printState(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('DRAMA MANAGER STATE');
    console.log('='.repeat(70));
    console.log(`Total beats: ${this.beats.size}`);
    console.log(`Current tier: ${this.worldMemory.getCurrentTier()}`);
    console.log(`Current beat: ${this.worldMemory.getCurrentBeat() ?? 'None'}`);
    console.log(`Is processing: ${this.isProcessing}`);
    console.log('='.repeat(70));
    console.log('');
  }
}
