/**
 * TemporalMemory - FACADE 5.3
 *
 * Temporal queries and WME expiration for Working Memory.
 * Extends Working Memory with time-based functionality.
 *
 * Features:
 * - Query WMEs by time range ("what was true 5 minutes ago?")
 * - Transient WMEs with automatic expiration
 * - Temporal snapshots (save/restore state at specific times)
 * - Time-based filtering and analysis
 *
 * This enables:
 * - Short-term memory (facts that expire)
 * - Historical queries
 * - Time-sensitive behaviors
 * - Automatic cleanup of old facts
 */

import { IWME, WME } from './WME';
import { WorkingMemory, WMEChangeType } from './WorkingMemory';

/**
 * Transient WME - WME with expiration time
 */
export class TransientWME extends WME {
  readonly expiresAt: number;

  constructor(type: string, attributes: Record<string, any>, lifetimeMs: number) {
    super(type, attributes);
    this.expiresAt = Date.now() + lifetimeMs;
  }

  /**
   * Check if WME has expired
   */
  isExpired(): boolean {
    return Date.now() >= this.expiresAt;
  }

  /**
   * Get remaining lifetime in milliseconds
   */
  getRemainingLifetime(): number {
    const remaining = this.expiresAt - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Export with expiration data
   */
  toJSON(): any {
    return {
      ...super.toJSON(),
      expiresAt: this.expiresAt,
      isTransient: true,
    };
  }
}

/**
 * Temporal query options
 */
export interface TemporalQuery {
  /** Filter by WME type */
  type?: string;

  /** Filter by attribute pattern */
  attributes?: Partial<Record<string, any>>;

  /** Custom filter function */
  filter?: (wme: IWME) => boolean;

  /** Created after this timestamp */
  createdAfter?: number;

  /** Created before this timestamp */
  createdBefore?: number;

  /** Modified after this timestamp */
  modifiedAfter?: number;

  /** Modified before this timestamp */
  modifiedBefore?: number;

  /** Only include WMEs created within this many ms ago */
  createdWithinMs?: number;

  /** Only include WMEs modified within this many ms ago */
  modifiedWithinMs?: number;
}

/**
 * Memory snapshot - state of working memory at a point in time
 */
export interface MemorySnapshot {
  timestamp: number;
  wmes: any[];
}

/**
 * Temporal Working Memory - extends WorkingMemory with temporal features
 */
export class TemporalWorkingMemory extends WorkingMemory {
  private expirationCheckInterval: NodeJS.Timeout | null = null;
  private snapshots: Map<string, MemorySnapshot> = new Map();
  private maxSnapshots: number = 10;

  constructor(debug: boolean = false, autoExpireCheckIntervalMs: number = 1000) {
    super(debug);

    // Start automatic expiration checking
    if (autoExpireCheckIntervalMs > 0) {
      this.startExpirationChecking(autoExpireCheckIntervalMs);
    }
  }

  /**
   * Assert a transient WME (with expiration)
   */
  assertTransient(wme: TransientWME): void {
    this.assert(wme);
  }

  /**
   * Create and assert a transient WME
   */
  assertTemporary(
    type: string,
    attributes: Record<string, any>,
    lifetimeMs: number
  ): TransientWME {
    const wme = new TransientWME(type, attributes, lifetimeMs);
    this.assert(wme);
    return wme;
  }

  /**
   * Query WMEs with temporal constraints
   */
  queryTemporal(query: TemporalQuery): IWME[] {
    const now = Date.now();
    let results = this.getAll();

    // Apply type filter
    if (query.type) {
      results = this.getByType(query.type);
    }

    // Apply attribute filter
    if (query.attributes) {
      results = results.filter(wme => wme.matches(query.attributes!));
    }

    // Apply temporal filters
    if (query.createdAfter !== undefined) {
      results = results.filter(wme => wme.createdAt > query.createdAfter!);
    }

    if (query.createdBefore !== undefined) {
      results = results.filter(wme => wme.createdAt < query.createdBefore!);
    }

    if (query.modifiedAfter !== undefined) {
      results = results.filter(wme => wme.modifiedAt > query.modifiedAfter!);
    }

    if (query.modifiedBefore !== undefined) {
      results = results.filter(wme => wme.modifiedAt < query.modifiedBefore!);
    }

    if (query.createdWithinMs !== undefined) {
      const threshold = now - query.createdWithinMs;
      results = results.filter(wme => wme.createdAt >= threshold);
    }

    if (query.modifiedWithinMs !== undefined) {
      const threshold = now - query.modifiedWithinMs;
      results = results.filter(wme => wme.modifiedAt >= threshold);
    }

    // Apply custom filter
    if (query.filter) {
      results = results.filter(query.filter);
    }

    return results;
  }

  /**
   * Get WMEs created within time window
   */
  getRecentlyCreated(withinMs: number): IWME[] {
    return this.queryTemporal({ createdWithinMs: withinMs });
  }

  /**
   * Get WMEs modified within time window
   */
  getRecentlyModified(withinMs: number): IWME[] {
    return this.queryTemporal({ modifiedWithinMs: withinMs });
  }

  /**
   * Get WMEs created in time range
   */
  getCreatedBetween(startTime: number, endTime: number): IWME[] {
    return this.queryTemporal({
      createdAfter: startTime,
      createdBefore: endTime,
    });
  }

  /**
   * Get WMEs modified in time range
   */
  getModifiedBetween(startTime: number, endTime: number): IWME[] {
    return this.queryTemporal({
      modifiedAfter: startTime,
      modifiedBefore: endTime,
    });
  }

  /**
   * Get age of a WME (ms since creation)
   */
  getAge(wmeOrId: IWME | string): number | null {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    const wme = this.get(id);

    if (!wme) return null;

    return Date.now() - wme.createdAt;
  }

  /**
   * Get time since last modification
   */
  getTimeSinceModified(wmeOrId: IWME | string): number | null {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    const wme = this.get(id);

    if (!wme) return null;

    return Date.now() - wme.modifiedAt;
  }

  /**
   * Check if WME is "fresh" (created recently)
   */
  isFresh(wmeOrId: IWME | string, freshnessMs: number): boolean {
    const age = this.getAge(wmeOrId);
    return age !== null && age <= freshnessMs;
  }

  /**
   * Check if WME is "stale" (not modified recently)
   */
  isStale(wmeOrId: IWME | string, stalenessMs: number): boolean {
    const timeSinceModified = this.getTimeSinceModified(wmeOrId);
    return timeSinceModified !== null && timeSinceModified >= stalenessMs;
  }

  /**
   * Check for expired WMEs and remove them
   */
  checkExpiredWMEs(): number {
    const toRemove: IWME[] = [];

    for (const wme of this.getAll()) {
      if (wme instanceof TransientWME && wme.isExpired()) {
        toRemove.push(wme);
      }
    }

    for (const wme of toRemove) {
      this.retract(wme);
    }

    return toRemove.length;
  }

  /**
   * Start automatic expiration checking
   */
  startExpirationChecking(intervalMs: number = 1000): void {
    this.stopExpirationChecking();

    this.expirationCheckInterval = setInterval(() => {
      const removed = this.checkExpiredWMEs();
      if (removed > 0) {
        console.log(`[TemporalMemory] Auto-expired ${removed} WMEs`);
      }
    }, intervalMs);
  }

  /**
   * Stop automatic expiration checking
   */
  stopExpirationChecking(): void {
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval);
      this.expirationCheckInterval = null;
    }
  }

  /**
   * Get all transient WMEs
   */
  getTransientWMEs(): TransientWME[] {
    return this.getAll().filter(wme => wme instanceof TransientWME) as TransientWME[];
  }

  /**
   * Get transient WMEs that will expire soon
   */
  getExpiringSoon(withinMs: number): TransientWME[] {
    return this.getTransientWMEs().filter(
      wme => wme.getRemainingLifetime() <= withinMs && !wme.isExpired()
    );
  }

  /**
   * Create a snapshot of current working memory
   */
  createSnapshot(name: string): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      wmes: this.export(),
    };

    this.snapshots.set(name, snapshot);

    // Limit snapshot count
    if (this.snapshots.size > this.maxSnapshots) {
      const oldest = Array.from(this.snapshots.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )[0];
      this.snapshots.delete(oldest[0]);
    }

    return snapshot;
  }

  /**
   * Restore working memory from snapshot
   */
  restoreSnapshot(name: string): boolean {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) return false;

    this.clear();
    this.import(snapshot.wmes);

    return true;
  }

  /**
   * Get all snapshot names
   */
  getSnapshotNames(): string[] {
    return Array.from(this.snapshots.keys());
  }

  /**
   * Delete a snapshot
   */
  deleteSnapshot(name: string): boolean {
    return this.snapshots.delete(name);
  }

  /**
   * Clear all snapshots
   */
  clearSnapshots(): void {
    this.snapshots.clear();
  }

  /**
   * Get temporal statistics
   */
  getTemporalStats(): {
    totalWMEs: number;
    transientWMEs: number;
    expiredWMEs: number;
    averageAge: number;
    oldestWME: number;
    newestWME: number;
    snapshots: number;
  } {
    const all = this.getAll();
    const transient = this.getTransientWMEs();
    const expired = transient.filter(wme => wme.isExpired());

    const now = Date.now();
    const ages = all.map(wme => now - wme.createdAt);
    const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    const oldestWME = ages.length > 0 ? Math.max(...ages) : 0;
    const newestWME = ages.length > 0 ? Math.min(...ages) : 0;

    return {
      totalWMEs: all.length,
      transientWMEs: transient.length,
      expiredWMEs: expired.length,
      averageAge,
      oldestWME,
      newestWME,
      snapshots: this.snapshots.size,
    };
  }

  /**
   * Cleanup - stop expiration checking
   */
  destroy(): void {
    this.stopExpirationChecking();
  }
}

/**
 * Helper functions for temporal queries
 */
export class TemporalHelpers {
  /**
   * Get WMEs that existed at a specific time (from snapshot)
   */
  static getWMEsAtTime(
    wm: TemporalWorkingMemory,
    snapshotName: string
  ): IWME[] | null {
    const snapshots = wm['snapshots'] as Map<string, MemorySnapshot>;
    const snapshot = snapshots.get(snapshotName);

    if (!snapshot) return null;

    return snapshot.wmes.map((data: any) => WME.fromJSON(data));
  }

  /**
   * Get WMEs created in the last N minutes
   */
  static getLastNMinutes(wm: TemporalWorkingMemory, minutes: number): IWME[] {
    return wm.getRecentlyCreated(minutes * 60 * 1000);
  }

  /**
   * Get WMEs created in the last N seconds
   */
  static getLastNSeconds(wm: TemporalWorkingMemory, seconds: number): IWME[] {
    return wm.getRecentlyCreated(seconds * 1000);
  }

  /**
   * Get WMEs older than N minutes
   */
  static getOlderThan(wm: TemporalWorkingMemory, minutes: number): IWME[] {
    const threshold = Date.now() - minutes * 60 * 1000;
    return wm.queryTemporal({ createdBefore: threshold });
  }

  /**
   * Prune old WMEs (remove WMEs older than threshold)
   */
  static pruneOld(wm: TemporalWorkingMemory, olderThanMs: number): number {
    const old = this.getOlderThan(wm, olderThanMs / 60000);
    for (const wme of old) {
      wm.retract(wme);
    }
    return old.length;
  }
}
