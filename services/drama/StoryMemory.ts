/**
 * StoryMemory - FACADE 4.9
 *
 * Story Memory tracks the narrative timeline and beat history.
 * Based on Facade's story memory system.
 *
 * The story memory system:
 * - Tracks which beats have fired and when
 * - Records beat outcomes (success/failure/partial)
 * - Maintains a coherent timeline of story events
 * - Enables NPCs to reference past events in dialogue
 * - Supports reflection on past story moments
 * - Allows querying story history (e.g., "Did player defeat the dragon?")
 *
 * This creates narrative coherence and enables:
 * - NPCs that remember what happened
 * - Callbacks to earlier story moments
 * - Consequence tracking across long time spans
 * - Rich, reactive dialogue based on history
 */

import { BeatOutcome, BeatStatus } from './Beat';

/**
 * Story event entry (beat execution record)
 */
export interface StoryEvent {
  /** Unique event ID */
  id: string;

  /** Beat ID that fired */
  beatId: string;

  /** Beat name */
  beatName: string;

  /** When the beat fired (timestamp) */
  timestamp: number;

  /** Beat outcome */
  outcome: BeatOutcome;

  /** Story values at time of execution */
  storyValueSnapshot: Record<string, number>;

  /** World state changes made */
  worldStateChanges: Array<{ key: string; value: any }>;

  /** Story value changes made */
  storyValueChanges: Array<{ value: string; delta: number }>;

  /** Optional tags/categories */
  tags?: string[];

  /** Optional description/narration */
  description?: string;
}

/**
 * Story query filters
 */
export interface StoryQuery {
  /** Filter by beat ID */
  beatId?: string;

  /** Filter by beat name */
  beatName?: string;

  /** Filter by outcome */
  outcome?: BeatOutcome;

  /** Filter by tag */
  tag?: string;

  /** Filter by time range */
  timeRange?: {
    start?: number;
    end?: number;
  };

  /** Limit results */
  limit?: number;
}

/**
 * Story statistics
 */
export interface StoryStats {
  /** Total events recorded */
  totalEvents: number;

  /** Total successes */
  successCount: number;

  /** Total failures */
  failureCount: number;

  /** Total partial outcomes */
  partialCount: number;

  /** Unique beats executed */
  uniqueBeats: number;

  /** Story duration (ms) */
  duration: number;

  /** First event timestamp */
  startTime: number;

  /** Last event timestamp */
  lastEventTime: number;
}

/**
 * Story Memory - tracks narrative timeline
 */
export class StoryMemory {
  private events: StoryEvent[] = [];
  private eventIdCounter: number = 0;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Record a story event (beat execution)
   */
  recordEvent(event: Omit<StoryEvent, 'id' | 'timestamp'>): StoryEvent {
    const fullEvent: StoryEvent = {
      ...event,
      id: `event_${this.eventIdCounter++}`,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    return fullEvent;
  }

  /**
   * Get all story events
   */
  getAllEvents(): StoryEvent[] {
    return [...this.events];
  }

  /**
   * Query story events with filters
   */
  query(query: StoryQuery): StoryEvent[] {
    let results = [...this.events];

    // Filter by beat ID
    if (query.beatId !== undefined) {
      results = results.filter(e => e.beatId === query.beatId);
    }

    // Filter by beat name
    if (query.beatName !== undefined) {
      results = results.filter(e => e.beatName === query.beatName);
    }

    // Filter by outcome
    if (query.outcome !== undefined) {
      results = results.filter(e => e.outcome === query.outcome);
    }

    // Filter by tag
    if (query.tag !== undefined) {
      results = results.filter(e => e.tags?.includes(query.tag));
    }

    // Filter by time range
    if (query.timeRange) {
      if (query.timeRange.start !== undefined) {
        results = results.filter(e => e.timestamp >= query.timeRange.start!);
      }
      if (query.timeRange.end !== undefined) {
        results = results.filter(e => e.timestamp <= query.timeRange.end!);
      }
    }

    // Limit results
    if (query.limit !== undefined) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Check if a specific beat has fired
   */
  hasBeatFired(beatId: string): boolean {
    return this.events.some(e => e.beatId === beatId);
  }

  /**
   * Get the outcome of the most recent execution of a beat
   */
  getBeatOutcome(beatId: string): BeatOutcome | null {
    // Search from end (most recent first)
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i].beatId === beatId) {
        return this.events[i].outcome;
      }
    }
    return null;
  }

  /**
   * Get all executions of a specific beat
   */
  getBeatHistory(beatId: string): StoryEvent[] {
    return this.events.filter(e => e.beatId === beatId);
  }

  /**
   * Get the most recent N events
   */
  getRecentEvents(count: number): StoryEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Get events within a time window
   */
  getEventsInWindow(startTime: number, endTime: number): StoryEvent[] {
    return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  /**
   * Get story statistics
   */
  getStats(): StoryStats {
    const uniqueBeats = new Set(this.events.map(e => e.beatId));

    const successCount = this.events.filter(e => e.outcome === BeatOutcome.SUCCESS).length;
    const failureCount = this.events.filter(e => e.outcome === BeatOutcome.FAILURE).length;
    const partialCount = this.events.filter(e => e.outcome === BeatOutcome.PARTIAL).length;

    const lastEventTime = this.events.length > 0
      ? this.events[this.events.length - 1].timestamp
      : this.startTime;

    return {
      totalEvents: this.events.length,
      successCount,
      failureCount,
      partialCount,
      uniqueBeats: uniqueBeats.size,
      duration: lastEventTime - this.startTime,
      startTime: this.startTime,
      lastEventTime,
    };
  }

  /**
   * Get a timeline summary (human-readable)
   */
  getTimelineSummary(): string {
    if (this.events.length === 0) {
      return 'No story events yet.';
    }

    const lines: string[] = [];
    lines.push('=== Story Timeline ===\n');

    for (const event of this.events) {
      const elapsed = ((event.timestamp - this.startTime) / 1000).toFixed(1);
      const outcomeSymbol =
        event.outcome === BeatOutcome.SUCCESS ? '✓' :
        event.outcome === BeatOutcome.FAILURE ? '✗' :
        event.outcome === BeatOutcome.PARTIAL ? '~' : '?';

      lines.push(`[+${elapsed}s] ${outcomeSymbol} ${event.beatName}`);

      if (event.description) {
        lines.push(`          ${event.description}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Check if player succeeded at a specific task
   * Useful for NPC dialogue: "Remember when you defeated the dragon?"
   */
  didPlayerSucceed(beatId: string): boolean {
    const outcome = this.getBeatOutcome(beatId);
    return outcome === BeatOutcome.SUCCESS || outcome === BeatOutcome.PARTIAL;
  }

  /**
   * Check if player failed at a specific task
   */
  didPlayerFail(beatId: string): boolean {
    const outcome = this.getBeatOutcome(beatId);
    return outcome === BeatOutcome.FAILURE;
  }

  /**
   * Get time elapsed since a beat fired
   */
  getTimeSinceBeat(beatId: string): number | null {
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i].beatId === beatId) {
        return Date.now() - this.events[i].timestamp;
      }
    }
    return null;
  }

  /**
   * Get the number of times a beat has fired
   */
  getBeatExecutionCount(beatId: string): number {
    return this.events.filter(e => e.beatId === beatId).length;
  }

  /**
   * Find beats with a specific tag
   */
  getEventsByTag(tag: string): StoryEvent[] {
    return this.events.filter(e => e.tags?.includes(tag));
  }

  /**
   * Get success rate for a specific beat
   */
  getBeatSuccessRate(beatId: string): number {
    const executions = this.getBeatHistory(beatId);
    if (executions.length === 0) return 0;

    const successes = executions.filter(
      e => e.outcome === BeatOutcome.SUCCESS || e.outcome === BeatOutcome.PARTIAL
    ).length;

    return successes / executions.length;
  }

  /**
   * Clear all story memory
   */
  clear(): void {
    this.events = [];
    this.eventIdCounter = 0;
    this.startTime = Date.now();
  }

  /**
   * Export story memory (for save files)
   */
  export(): {
    events: StoryEvent[];
    eventIdCounter: number;
    startTime: number;
  } {
    return {
      events: [...this.events],
      eventIdCounter: this.eventIdCounter,
      startTime: this.startTime,
    };
  }

  /**
   * Import story memory (from save files)
   */
  import(data: {
    events: StoryEvent[];
    eventIdCounter: number;
    startTime: number;
  }): void {
    this.events = [...data.events];
    this.eventIdCounter = data.eventIdCounter;
    this.startTime = data.startTime;
  }

  /**
   * Generate a narrative summary based on event patterns
   */
  generateNarrativeSummary(): string {
    const stats = this.getStats();

    if (stats.totalEvents === 0) {
      return 'Your story has just begun.';
    }

    const lines: string[] = [];

    // Overall tone based on success rate
    const successRate = stats.successCount / stats.totalEvents;
    if (successRate >= 0.7) {
      lines.push('Your journey has been one of triumph.');
    } else if (successRate >= 0.4) {
      lines.push('Your journey has had its share of both victories and setbacks.');
    } else {
      lines.push('Your journey has been fraught with challenges and failures.');
    }

    // Key moments
    const recentEvents = this.getRecentEvents(3);
    if (recentEvents.length > 0) {
      lines.push('\nRecent events:');
      for (const event of recentEvents) {
        const outcomeText =
          event.outcome === BeatOutcome.SUCCESS ? 'succeeded' :
          event.outcome === BeatOutcome.FAILURE ? 'failed' :
          event.outcome === BeatOutcome.PARTIAL ? 'partially completed' : 'attempted';

        lines.push(`- You ${outcomeText}: ${event.beatName}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Get all beats that led to a specific outcome
   */
  getBeatsWithOutcome(outcome: BeatOutcome): string[] {
    const beatIds = new Set<string>();

    for (const event of this.events) {
      if (event.outcome === outcome) {
        beatIds.add(event.beatId);
      }
    }

    return Array.from(beatIds);
  }

  /**
   * Check if two beats occurred in sequence
   */
  didBeatsOccurInSequence(beatId1: string, beatId2: string): boolean {
    for (let i = 0; i < this.events.length - 1; i++) {
      if (this.events[i].beatId === beatId1 && this.events[i + 1].beatId === beatId2) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the story arc (emotional trajectory)
   */
  getStoryArc(): { time: number; tension: number }[] {
    return this.events.map(event => ({
      time: event.timestamp - this.startTime,
      tension: event.storyValueSnapshot.tension || 0,
    }));
  }

  /**
   * Find the climax (highest tension point)
   */
  findClimax(): StoryEvent | null {
    if (this.events.length === 0) return null;

    let maxTension = -Infinity;
    let climaxEvent: StoryEvent | null = null;

    for (const event of this.events) {
      const tension = event.storyValueSnapshot.tension || 0;
      if (tension > maxTension) {
        maxTension = tension;
        climaxEvent = event;
      }
    }

    return climaxEvent;
  }

  /**
   * Get turning points (significant outcome changes)
   */
  getTurningPoints(): StoryEvent[] {
    const turningPoints: StoryEvent[] = [];

    for (let i = 1; i < this.events.length; i++) {
      const prev = this.events[i - 1];
      const curr = this.events[i];

      // Success after failure (or vice versa) is a turning point
      if (
        (prev.outcome === BeatOutcome.FAILURE && curr.outcome === BeatOutcome.SUCCESS) ||
        (prev.outcome === BeatOutcome.SUCCESS && curr.outcome === BeatOutcome.FAILURE)
      ) {
        turningPoints.push(curr);
      }
    }

    return turningPoints;
  }
}

/**
 * Story Memory Manager - integrates with Drama Manager
 */
export class StoryMemoryManager {
  private memory: StoryMemory;

  constructor() {
    this.memory = new StoryMemory();
  }

  /**
   * Get the story memory instance
   */
  getMemory(): StoryMemory {
    return this.memory;
  }

  /**
   * Record a beat execution
   */
  recordBeatExecution(
    beatId: string,
    beatName: string,
    outcome: BeatOutcome,
    storyValueSnapshot: Record<string, number>,
    worldStateChanges: Array<{ key: string; value: any }>,
    storyValueChanges: Array<{ value: string; delta: number }>,
    tags?: string[],
    description?: string
  ): StoryEvent {
    return this.memory.recordEvent({
      beatId,
      beatName,
      outcome,
      storyValueSnapshot,
      worldStateChanges,
      storyValueChanges,
      tags,
      description,
    });
  }

  /**
   * Generate dialogue reference to past event
   * "Remember when you [beat]?"
   */
  generateRememberWhenDialogue(beatId: string): string | null {
    const event = this.memory.getBeatHistory(beatId)[0];
    if (!event) return null;

    const timeSince = this.memory.getTimeSinceBeat(beatId);
    if (timeSince === null) return null;

    const timeAgo =
      timeSince < 60000 ? 'just now' :
      timeSince < 3600000 ? `${Math.floor(timeSince / 60000)} minutes ago` :
      timeSince < 86400000 ? `${Math.floor(timeSince / 3600000)} hours ago` :
      `${Math.floor(timeSince / 86400000)} days ago`;

    if (event.outcome === BeatOutcome.SUCCESS) {
      return `Remember when you ${event.beatName.toLowerCase()}? That was ${timeAgo}.`;
    } else if (event.outcome === BeatOutcome.FAILURE) {
      return `I remember when you tried to ${event.beatName.toLowerCase()} ${timeAgo}. That didn't go so well.`;
    }

    return `${event.beatName} happened ${timeAgo}.`;
  }

  /**
   * Check if NPC should reference past event
   */
  shouldReferencePastEvent(beatId: string, relevanceThreshold: number = 300000): boolean {
    const timeSince = this.memory.getTimeSinceBeat(beatId);
    if (timeSince === null) return false;

    // Reference events that happened within threshold (default 5 minutes)
    return timeSince < relevanceThreshold;
  }

  /**
   * Get contextual dialogue based on story history
   */
  getContextualDialogue(context: {
    beatId?: string;
    outcome?: BeatOutcome;
    tag?: string;
  }): string {
    if (context.beatId && this.memory.hasBeatFired(context.beatId)) {
      const outcome = this.memory.getBeatOutcome(context.beatId);

      if (outcome === BeatOutcome.SUCCESS) {
        return `You handled that well when you ${context.beatId}.`;
      } else if (outcome === BeatOutcome.FAILURE) {
        return `Maybe you'll have better luck this time.`;
      }
    }

    return 'Let\'s see how this goes.';
  }

  /**
   * Reset story memory
   */
  reset(): void {
    this.memory.clear();
  }

  /**
   * Save story memory
   */
  save(): string {
    return JSON.stringify(this.memory.export());
  }

  /**
   * Load story memory
   */
  load(data: string): void {
    this.memory.import(JSON.parse(data));
  }
}
