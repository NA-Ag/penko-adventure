/**
 * Oracle Service - Metrics Gathering System
 *
 * The Oracle is the "data gatherer" component of the L4D-style AI Director.
 * It tracks key gameplay metrics that the Director uses to make decisions about
 * when and how to intervene in the player's experience.
 *
 * Inspired by Left 4 Dead's AI Director metrics system.
 *
 * Tracked Metrics:
 * - Time since last progress (story beat completion)
 * - Player action success/failure rate
 * - Narrative tension level
 * - Player engagement indicators
 * - Frustration indicators
 */

export interface OracleMetrics {
  // Timing metrics
  timeSinceLastProgress: number;      // Seconds since last significant story event
  timeSinceSessionStart: number;      // Total session time in seconds
  currentTurn: number;                 // Current turn number

  // Progress metrics
  beatsCompleted: number;              // Total beats completed
  lastBeatCompletedAt: number;        // Turn number of last beat completion
  consecutiveFailedActions: number;   // Failed interactions in a row

  // Tension metrics
  narrativeTension: number;            // 0-1 scale from DramaManager
  relationshipTension: number;         // 0-100 scale from WorldMemory
  playerStressLevel: number;           // Computed stress indicator (0-1)

  // Engagement metrics
  playerActionsPerTurn: number;       // Actions attempted per turn (rolling average)
  inputDiversity: number;              // Variety of player commands (0-1)
  timePerTurn: number;                 // Average seconds per turn

  // State flags
  isStuck: boolean;                    // Player appears stuck
  isBored: boolean;                    // Player appears disengaged
  isFrustrated: boolean;               // Player appears frustrated
  isRushing: boolean;                  // Player is rushing through content
}

export interface TurnSnapshot {
  turnNumber: number;
  timestamp: number;
  playerInput: string;
  actionSuccessful: boolean;
  beatChanged: boolean;
  tensionDelta: number;
}

export class Oracle {
  private metrics: OracleMetrics;
  private sessionStartTime: number;
  private lastProgressTime: number;
  private turnHistory: TurnSnapshot[] = [];
  private recentInputs: string[] = [];

  private readonly MAX_HISTORY_SIZE = 50;
  private readonly STUCK_THRESHOLD_SECONDS = 180; // 3 minutes
  private readonly BORED_THRESHOLD_TURNS = 10;
  private readonly FRUSTRATED_THRESHOLD_FAILS = 3;

  constructor() {
    this.sessionStartTime = Date.now();
    this.lastProgressTime = Date.now();

    // Initialize metrics
    this.metrics = {
      timeSinceLastProgress: 0,
      timeSinceSessionStart: 0,
      currentTurn: 0,
      beatsCompleted: 0,
      lastBeatCompletedAt: 0,
      consecutiveFailedActions: 0,
      narrativeTension: 0,
      relationshipTension: 0,
      playerStressLevel: 0,
      playerActionsPerTurn: 0,
      inputDiversity: 0,
      timePerTurn: 0,
      isStuck: false,
      isBored: false,
      isFrustrated: false,
      isRushing: false,
    };

    console.log('[Oracle] Initialized metrics gathering system');
  }

  // ============================================================================
  // METRIC RECORDING
  // ============================================================================

  /**
   * Record a completed turn
   */
  recordTurn(snapshot: TurnSnapshot): void {
    this.metrics.currentTurn = snapshot.turnNumber;

    // Add to history
    this.turnHistory.push(snapshot);
    if (this.turnHistory.length > this.MAX_HISTORY_SIZE) {
      this.turnHistory.shift();
    }

    // Track input diversity
    this.recentInputs.push(snapshot.playerInput.toLowerCase().trim());
    if (this.recentInputs.length > 20) {
      this.recentInputs.shift();
    }

    // Update metrics
    this.updateTimingMetrics();
    this.updateProgressMetrics(snapshot);
    this.updateEngagementMetrics();
    this.updateStateFlags();

    console.log(`[Oracle] Turn ${snapshot.turnNumber} recorded`);
  }

  /**
   * Record a beat completion (significant progress)
   */
  recordBeatCompletion(beatName: string, turnNumber: number): void {
    this.metrics.beatsCompleted++;
    this.metrics.lastBeatCompletedAt = turnNumber;
    this.lastProgressTime = Date.now();

    console.log(`[Oracle] Beat completed: ${beatName} (total: ${this.metrics.beatsCompleted})`);
  }

  /**
   * Update narrative tension from DramaManager
   */
  updateNarrativeTension(tension: number): void {
    this.metrics.narrativeTension = Math.max(0, Math.min(1, tension));
  }

  /**
   * Update relationship tension from WorldMemory
   */
  updateRelationshipTension(tension: number): void {
    this.metrics.relationshipTension = Math.max(0, Math.min(100, tension));
  }

  // ============================================================================
  // METRIC COMPUTATION
  // ============================================================================

  /**
   * Update timing metrics
   */
  private updateTimingMetrics(): void {
    const now = Date.now();
    this.metrics.timeSinceSessionStart = (now - this.sessionStartTime) / 1000;
    this.metrics.timeSinceLastProgress = (now - this.lastProgressTime) / 1000;

    // Compute average time per turn (last 10 turns)
    const recentTurns = this.turnHistory.slice(-10);
    if (recentTurns.length >= 2) {
      const timeDiff = recentTurns[recentTurns.length - 1].timestamp - recentTurns[0].timestamp;
      this.metrics.timePerTurn = timeDiff / recentTurns.length / 1000;
    }
  }

  /**
   * Update progress metrics
   */
  private updateProgressMetrics(snapshot: TurnSnapshot): void {
    // Track consecutive failures
    if (!snapshot.actionSuccessful) {
      this.metrics.consecutiveFailedActions++;
    } else {
      this.metrics.consecutiveFailedActions = 0;
    }
  }

  /**
   * Update engagement metrics
   */
  private updateEngagementMetrics(): void {
    // Compute input diversity (unique words / total words)
    if (this.recentInputs.length > 0) {
      const uniqueWords = new Set(
        this.recentInputs.flatMap((input) => input.split(/\s+/))
      );
      const totalWords = this.recentInputs.reduce(
        (sum, input) => sum + input.split(/\s+/).length,
        0
      );

      this.metrics.inputDiversity = totalWords > 0 ? uniqueWords.size / totalWords : 0;
    }

    // Compute player stress level (composite metric)
    const tensionFactor = this.metrics.narrativeTension;
    const failureFactor = Math.min(1, this.metrics.consecutiveFailedActions / 5);
    const timePressureFactor = this.metrics.timePerTurn < 5 ? 0.3 : 0;

    this.metrics.playerStressLevel = Math.min(
      1,
      tensionFactor * 0.4 + failureFactor * 0.4 + timePressureFactor * 0.2
    );
  }

  /**
   * Update state flags (stuck, bored, frustrated, rushing)
   */
  private updateStateFlags(): void {
    // Stuck: No progress for extended time
    this.metrics.isStuck =
      this.metrics.timeSinceLastProgress > this.STUCK_THRESHOLD_SECONDS;

    // Bored: Low tension and low diversity for many turns
    const recentTurns = this.turnHistory.slice(-this.BORED_THRESHOLD_TURNS);
    const avgTension =
      recentTurns.reduce((sum, t) => sum + Math.abs(t.tensionDelta), 0) /
      recentTurns.length;

    this.metrics.isBored =
      recentTurns.length >= this.BORED_THRESHOLD_TURNS &&
      avgTension < 0.1 &&
      this.metrics.inputDiversity < 0.3;

    // Frustrated: Multiple consecutive failures
    this.metrics.isFrustrated =
      this.metrics.consecutiveFailedActions >= this.FRUSTRATED_THRESHOLD_FAILS;

    // Rushing: Very fast input with low diversity
    this.metrics.isRushing =
      this.metrics.timePerTurn < 3 && this.metrics.inputDiversity < 0.2;
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  /**
   * Get all current metrics
   */
  getMetrics(): OracleMetrics {
    return { ...this.metrics };
  }

  /**
   * Get turn history
   */
  getTurnHistory(limit?: number): TurnSnapshot[] {
    if (limit) {
      return this.turnHistory.slice(-limit);
    }
    return [...this.turnHistory];
  }

  /**
   * Check if a specific state flag is active
   */
  checkState(flag: 'stuck' | 'bored' | 'frustrated' | 'rushing'): boolean {
    switch (flag) {
      case 'stuck':
        return this.metrics.isStuck;
      case 'bored':
        return this.metrics.isBored;
      case 'frustrated':
        return this.metrics.isFrustrated;
      case 'rushing':
        return this.metrics.isRushing;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Reset all metrics (for new session)
   */
  reset(): void {
    this.sessionStartTime = Date.now();
    this.lastProgressTime = Date.now();
    this.turnHistory = [];
    this.recentInputs = [];

    this.metrics = {
      timeSinceLastProgress: 0,
      timeSinceSessionStart: 0,
      currentTurn: 0,
      beatsCompleted: 0,
      lastBeatCompletedAt: 0,
      consecutiveFailedActions: 0,
      narrativeTension: 0,
      relationshipTension: 0,
      playerStressLevel: 0,
      playerActionsPerTurn: 0,
      inputDiversity: 0,
      timePerTurn: 0,
      isStuck: false,
      isBored: false,
      isFrustrated: false,
      isRushing: false,
    };

    console.log('[Oracle] Metrics reset');
  }

  /**
   * Debug: Print current metrics
   */
  debugPrintMetrics(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('ORACLE METRICS');
    console.log('='.repeat(70));
    console.log('');

    console.log('⏱️  TIMING:');
    console.log(`  Session time: ${this.metrics.timeSinceSessionStart.toFixed(1)}s`);
    console.log(`  Time since progress: ${this.metrics.timeSinceLastProgress.toFixed(1)}s`);
    console.log(`  Avg time/turn: ${this.metrics.timePerTurn.toFixed(1)}s`);
    console.log('');

    console.log('📊 PROGRESS:');
    console.log(`  Current turn: ${this.metrics.currentTurn}`);
    console.log(`  Beats completed: ${this.metrics.beatsCompleted}`);
    console.log(`  Failed actions: ${this.metrics.consecutiveFailedActions}`);
    console.log('');

    console.log('⚡ TENSION:');
    console.log(`  Narrative: ${(this.metrics.narrativeTension * 100).toFixed(1)}%`);
    console.log(`  Relationship: ${this.metrics.relationshipTension.toFixed(1)}`);
    console.log(`  Player stress: ${(this.metrics.playerStressLevel * 100).toFixed(1)}%`);
    console.log('');

    console.log('🎮 ENGAGEMENT:');
    console.log(`  Input diversity: ${(this.metrics.inputDiversity * 100).toFixed(1)}%`);
    console.log('');

    console.log('🚩 STATE FLAGS:');
    console.log(`  Stuck: ${this.metrics.isStuck ? '❌ YES' : '✅ NO'}`);
    console.log(`  Bored: ${this.metrics.isBored ? '❌ YES' : '✅ NO'}`);
    console.log(`  Frustrated: ${this.metrics.isFrustrated ? '❌ YES' : '✅ NO'}`);
    console.log(`  Rushing: ${this.metrics.isRushing ? '⚠️  YES' : '✅ NO'}`);
    console.log('');

    console.log('='.repeat(70));
    console.log('');
  }
}
