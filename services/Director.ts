/**
 * Director Service - AI Director System
 *
 * The Director is the "decision maker" component inspired by Left 4 Dead's AI Director.
 * It reads metrics from the Oracle and uses a ruleset to decide when and how to
 * intervene in the player's experience to manage pacing, tension, and frustration.
 *
 * Intervention Strategies:
 * 1. State Injection: Modify world state directly (e.g., phone rings, door opens)
 * 2. Hint Injection: Provide contextual hints to stuck players
 * 3. Tension Adjustment: Modify narrative pacing (speed up / slow down)
 * 4. Emergency Reset: Provide escape hatch for truly stuck players
 *
 * Philosophy:
 * - Interventions should feel organic and diegetic (part of the world)
 * - Never break player agency or immersion
 * - Subtle guidance is better than heavy-handed help
 */

import { Oracle, OracleMetrics } from './Oracle';
import { WorldMemory } from './facade-engine/worldMemory';
import { FacadeBeat, BeatID } from '../types/facade';

export type InterventionType =
  | 'none'
  | 'hint'              // Provide a subtle hint
  | 'state_injection'   // Inject a new world event
  | 'tension_boost'     // Increase narrative tension
  | 'tension_relief'    // Decrease narrative tension
  | 'progress_nudge'    // Help player make progress
  | 'emergency_reset';  // Major intervention (last resort)

export interface InterventionDecision {
  shouldIntervene: boolean;
  interventionType: InterventionType;
  reason: string;
  priority: number; // 0-10 scale
  payload?: any;    // Type-specific intervention data
}

export interface DirectorConfig {
  enabled?: boolean;           // Default: true
  interventionCooldown?: number; // Turns between interventions (default: 5)
  aggressiveness?: number;     // 0-1 scale (default: 0.5)
  debugMode?: boolean;          // Default: false
}

export class Director {
  private oracle: Oracle;
  private worldMemory: WorldMemory;
  private config: DirectorConfig;

  private turnsSinceLastIntervention: number = 0;
  private totalInterventions: number = 0;
  private interventionHistory: Array<{
    turn: number;
    type: InterventionType;
    reason: string;
  }> = [];

  constructor(oracle: Oracle, worldMemory: WorldMemory, config: DirectorConfig = {}) {
    this.oracle = oracle;
    this.worldMemory = worldMemory;

    this.config = {
      enabled: config.enabled ?? true,
      interventionCooldown: config.interventionCooldown ?? 5,
      aggressiveness: config.aggressiveness ?? 0.5,
      debugMode: config.debugMode ?? false,
    };

    console.log('[Director] AI Director initialized');
    console.log(`[Director] Enabled: ${this.config.enabled}`);
    console.log(`[Director] Aggressiveness: ${this.config.aggressiveness}`);
  }

  // ============================================================================
  // MAIN EVALUATION LOOP
  // ============================================================================

  /**
   * Evaluate current state and decide if/how to intervene
   */
  async evaluateAndIntervene(): Promise<InterventionDecision> {
    if (!this.config.enabled) {
      return {
        shouldIntervene: false,
        interventionType: 'none',
        reason: 'Director disabled',
        priority: 0,
      };
    }

    this.turnsSinceLastIntervention++;

    // Get current metrics
    const metrics = this.oracle.getMetrics();

    if (this.config.debugMode) {
      console.log('[Director] Evaluating intervention...');
      console.log(`[Director] Turns since last intervention: ${this.turnsSinceLastIntervention}`);
    }

    // Apply all rules and collect decisions
    const decisions: InterventionDecision[] = [];

    decisions.push(this.evaluateStuckRule(metrics));
    decisions.push(this.evaluateFrustrationRule(metrics));
    decisions.push(this.evaluateBoredomRule(metrics));
    decisions.push(this.evaluateTensionRule(metrics));
    decisions.push(this.evaluateRushingRule(metrics));

    // Find highest priority decision that should intervene
    const sortedDecisions = decisions
      .filter((d) => d.shouldIntervene)
      .sort((a, b) => b.priority - a.priority);

    if (sortedDecisions.length === 0) {
      return {
        shouldIntervene: false,
        interventionType: 'none',
        reason: 'No intervention needed',
        priority: 0,
      };
    }

    const decision = sortedDecisions[0];

    // Check cooldown (unless it's a high priority emergency)
    if (
      this.turnsSinceLastIntervention < this.config.interventionCooldown! &&
      decision.priority < 8
    ) {
      if (this.config.debugMode) {
        console.log('[Director] Intervention blocked by cooldown');
      }

      return {
        shouldIntervene: false,
        interventionType: 'none',
        reason: 'Cooldown active',
        priority: 0,
      };
    }

    // Execute the intervention
    await this.executeIntervention(decision, metrics);

    // Record intervention
    this.turnsSinceLastIntervention = 0;
    this.totalInterventions++;
    this.interventionHistory.push({
      turn: metrics.currentTurn,
      type: decision.interventionType,
      reason: decision.reason,
    });

    console.log(`[Director] 🎬 INTERVENTION: ${decision.interventionType}`);
    console.log(`[Director] Reason: ${decision.reason}`);
    console.log(`[Director] Priority: ${decision.priority}`);

    return decision;
  }

  // ============================================================================
  // INTERVENTION RULES
  // ============================================================================

  /**
   * Rule: Player appears stuck (no progress for extended time)
   */
  private evaluateStuckRule(metrics: OracleMetrics): InterventionDecision {
    if (!metrics.isStuck) {
      return { shouldIntervene: false, interventionType: 'none', reason: '', priority: 0 };
    }

    // Escalate based on how long they've been stuck
    const stuckMinutes = metrics.timeSinceLastProgress / 60;

    if (stuckMinutes > 5) {
      // Very stuck - provide direct help
      return {
        shouldIntervene: true,
        interventionType: 'progress_nudge',
        reason: `Player stuck for ${stuckMinutes.toFixed(1)} minutes`,
        priority: 9,
        payload: { type: 'direct_hint' },
      };
    } else if (stuckMinutes > 3) {
      // Moderately stuck - provide subtle hint
      return {
        shouldIntervene: true,
        interventionType: 'hint',
        reason: `Player stuck for ${stuckMinutes.toFixed(1)} minutes`,
        priority: 7,
        payload: { type: 'subtle_hint' },
      };
    }

    return { shouldIntervene: false, interventionType: 'none', reason: '', priority: 0 };
  }

  /**
   * Rule: Player is frustrated (multiple consecutive failures)
   */
  private evaluateFrustrationRule(metrics: OracleMetrics): InterventionDecision {
    if (!metrics.isFrustrated) {
      return { shouldIntervene: false, interventionType: 'none', reason: '', priority: 0 };
    }

    return {
      shouldIntervene: true,
      interventionType: 'state_injection',
      reason: `Player frustrated (${metrics.consecutiveFailedActions} failures)`,
      priority: 8,
      payload: {
        event: 'interrupt',
        description: 'Create a distraction to break frustration cycle',
      },
    };
  }

  /**
   * Rule: Player is bored (low engagement, low tension)
   */
  private evaluateBoredomRule(metrics: OracleMetrics): InterventionDecision {
    if (!metrics.isBored) {
      return { shouldIntervene: false, interventionType: 'none', reason: '', priority: 0 };
    }

    return {
      shouldIntervene: true,
      interventionType: 'tension_boost',
      reason: 'Low player engagement detected',
      priority: 6,
      payload: {
        tensionIncrease: 0.3,
        method: 'inject_conflict',
      },
    };
  }

  /**
   * Rule: Narrative tension management
   */
  private evaluateTensionRule(metrics: OracleMetrics): InterventionDecision {
    // Tension too low for too long
    if (metrics.narrativeTension < 0.2) {
      const recentHistory = this.oracle.getTurnHistory(10);
      const lowTensionTurns = recentHistory.filter((t) => Math.abs(t.tensionDelta) < 0.1).length;

      if (lowTensionTurns >= 7) {
        return {
          shouldIntervene: true,
          interventionType: 'tension_boost',
          reason: 'Tension too low for extended period',
          priority: 5,
          payload: { tensionIncrease: 0.4 },
        };
      }
    }

    // Tension too high for too long (player stress)
    if (metrics.playerStressLevel > 0.8) {
      return {
        shouldIntervene: true,
        interventionType: 'tension_relief',
        reason: 'Player stress level too high',
        priority: 7,
        payload: { tensionDecrease: 0.3 },
      };
    }

    return { shouldIntervene: false, interventionType: 'none', reason: '', priority: 0 };
  }

  /**
   * Rule: Player is rushing (need to slow down for story)
   */
  private evaluateRushingRule(metrics: OracleMetrics): InterventionDecision {
    if (!metrics.isRushing) {
      return { shouldIntervene: false, interventionType: 'none', reason: '', priority: 0 };
    }

    return {
      shouldIntervene: true,
      interventionType: 'state_injection',
      reason: 'Player rushing - need to slow pacing',
      priority: 4,
      payload: {
        event: 'slow_moment',
        description: 'Create a reflective moment',
      },
    };
  }

  // ============================================================================
  // INTERVENTION EXECUTION
  // ============================================================================

  /**
   * Execute an intervention decision
   */
  private async executeIntervention(
    decision: InterventionDecision,
    metrics: OracleMetrics
  ): Promise<void> {
    switch (decision.interventionType) {
      case 'hint':
        this.executeHintIntervention(decision.payload);
        break;

      case 'state_injection':
        this.executeStateInjection(decision.payload);
        break;

      case 'tension_boost':
        this.executeTensionBoost(decision.payload);
        break;

      case 'tension_relief':
        this.executeTensionRelief(decision.payload);
        break;

      case 'progress_nudge':
        this.executeProgressNudge(decision.payload);
        break;

      case 'emergency_reset':
        this.executeEmergencyReset();
        break;
    }
  }

  /**
   * Provide a hint to the player
   */
  private executeHintIntervention(payload: any): void {
    // Set a world fact that the next beat can react to
    this.worldMemory.setFact('director.hint_requested', true);
    this.worldMemory.setFact('director.hint_type', payload?.type || 'subtle_hint');

    console.log('[Director] Hint intervention: Set hint_requested flag');
  }

  /**
   * Inject a new event into the world
   */
  private executeStateInjection(payload: any): void {
    const event = payload?.event || 'generic_interrupt';

    switch (event) {
      case 'interrupt':
        // Phone rings, doorbell, external distraction
        this.worldMemory.setFact('world.phone_ringing', true);
        console.log('[Director] State injection: Phone is now ringing');
        break;

      case 'slow_moment':
        // Create a pause in action
        this.worldMemory.setFact('world.quiet_moment', true);
        console.log('[Director] State injection: Quiet moment created');
        break;

      default:
        this.worldMemory.setFact(`world.event.${event}`, true);
        console.log(`[Director] State injection: ${event}`);
    }
  }

  /**
   * Boost narrative tension
   */
  private executeTensionBoost(payload: any): void {
    const increase = payload?.tensionIncrease || 0.2;

    // Increase relationship tension
    const currentTension = this.worldMemory.getRelationshipTension();
    this.worldMemory.adjustRelationshipTension(increase * 50); // Scale to 0-100

    // Set flag for drama manager
    this.worldMemory.setFact('director.boost_tension', true);

    console.log(`[Director] Tension boost: +${(increase * 100).toFixed(0)}%`);
  }

  /**
   * Provide tension relief
   */
  private executeTensionRelief(payload: any): void {
    const decrease = payload?.tensionDecrease || 0.2;

    // Decrease relationship tension
    this.worldMemory.adjustRelationshipTension(-decrease * 50);

    // Set flag for drama manager
    this.worldMemory.setFact('director.relieve_tension', true);

    console.log(`[Director] Tension relief: -${(decrease * 100).toFixed(0)}%`);
  }

  /**
   * Nudge player toward progress
   */
  private executeProgressNudge(payload: any): void {
    // Make next beat more likely to progress story
    this.worldMemory.setFact('director.force_progress', true);
    this.worldMemory.setFact('director.progress_nudge_strength', payload?.type === 'direct_hint' ? 2 : 1);

    console.log('[Director] Progress nudge: Forcing story progression');
  }

  /**
   * Emergency reset (last resort)
   */
  private executeEmergencyReset(): void {
    this.worldMemory.setFact('director.emergency_reset', true);

    console.log('[Director] ⚠️  EMERGENCY RESET: Providing escape hatch');
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get intervention statistics
   */
  getStats(): {
    totalInterventions: number;
    turnsSinceLastIntervention: number;
    interventionHistory: typeof this.interventionHistory;
  } {
    return {
      totalInterventions: this.totalInterventions,
      turnsSinceLastIntervention: this.turnsSinceLastIntervention,
      interventionHistory: [...this.interventionHistory],
    };
  }

  /**
   * Reset director state (for new session)
   */
  reset(): void {
    this.turnsSinceLastIntervention = 0;
    this.totalInterventions = 0;
    this.interventionHistory = [];

    console.log('[Director] State reset');
  }

  /**
   * Debug: Print director state
   */
  debugPrintState(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('AI DIRECTOR STATE');
    console.log('='.repeat(70));
    console.log(`Enabled: ${this.config.enabled}`);
    console.log(`Aggressiveness: ${this.config.aggressiveness}`);
    console.log(`Total interventions: ${this.totalInterventions}`);
    console.log(`Turns since last: ${this.turnsSinceLastIntervention}`);
    console.log('');

    console.log('Recent interventions:');
    const recent = this.interventionHistory.slice(-5);
    for (const intervention of recent) {
      console.log(`  Turn ${intervention.turn}: ${intervention.type} - ${intervention.reason}`);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('');
  }
}
