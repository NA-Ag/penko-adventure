/**
 * MemoryInspector - FACADE 5.7
 *
 * Console tool to view, filter, and inspect Working Memory Elements.
 * Enables developers to debug and visualize WME relationships.
 *
 * Features:
 * - View all WMEs in working memory
 * - Filter by type, agent, time range
 * - Visualize WME relationships and references
 * - Inspect NPC beliefs and knowledge
 * - Manually assert/retract WMEs for testing
 * - Export/import memory state
 * - Real-time monitoring with change tracking
 *
 * This enables:
 * - Debugging NPC beliefs and behaviors
 * - Testing specific memory states
 * - Visualizing complex WME relationships
 * - Performance monitoring
 */

import { IWME, WME } from './WME';
import { WorkingMemory, WMEChangeType } from './WorkingMemory';
import { TemporalWorkingMemory } from './TemporalMemory';
import { ReflectiveWorkingMemory, MetaWME, BeliefAboutWME, KnowledgeAboutBeliefWME } from './ReflectiveMemory';
import { MultiMemoryManager, MemorySpaceType } from './MultiMemory';
import { ConditionalWorkingMemory, ConditionalWME, ExpirationStrategy } from './ConditionalMemory';

/**
 * Filter options for memory inspection
 */
export interface InspectorFilter {
  /** Filter by WME type */
  type?: string;

  /** Filter by type pattern (regex) */
  typePattern?: RegExp;

  /** Filter by agent (for multi-memory systems) */
  agent?: string;

  /** Filter by attribute key-value pairs */
  attributes?: Record<string, any>;

  /** Filter by creation time range */
  createdAfter?: number;
  createdBefore?: number;

  /** Filter by modification time range */
  modifiedAfter?: number;
  modifiedBefore?: number;

  /** Filter by age (ms) */
  maxAge?: number;
  minAge?: number;

  /** Filter conditional WMEs */
  isConditional?: boolean;

  /** Filter transient WMEs */
  isTransient?: boolean;

  /** Filter meta-WMEs (reflective) */
  isMeta?: boolean;

  /** Custom filter function */
  customFilter?: (wme: IWME) => boolean;
}

/**
 * Display options for memory inspection
 */
export interface DisplayOptions {
  /** Show full WME details */
  verbose?: boolean;

  /** Show timestamps */
  showTimestamps?: boolean;

  /** Show expiration info */
  showExpiration?: boolean;

  /** Show references/relationships */
  showReferences?: boolean;

  /** Limit number of results */
  limit?: number;

  /** Sort by field */
  sortBy?: 'createdAt' | 'modifiedAt' | 'type' | 'id';

  /** Sort direction */
  sortDirection?: 'asc' | 'desc';

  /** Group by type */
  groupByType?: boolean;

  /** Color output (for terminal) */
  useColors?: boolean;
}

/**
 * Memory snapshot for comparison
 */
export interface MemorySnapshot {
  timestamp: number;
  wmeCount: number;
  wmesByType: Record<string, number>;
  wmes: any[];
  metadata?: Record<string, any>;
}

/**
 * Change tracking entry
 */
export interface ChangeEntry {
  timestamp: number;
  changeType: WMEChangeType;
  wmeId: string;
  wmeType: string;
  details?: any;
}

/**
 * Memory Inspector - main debugging tool
 */
export class MemoryInspector {
  private wm: WorkingMemory;
  private changeHistory: ChangeEntry[] = [];
  private snapshots: Map<string, MemorySnapshot> = new Map();
  private monitoring: boolean = false;
  private maxHistorySize: number = 1000;

  constructor(wm: WorkingMemory, trackChanges: boolean = false) {
    this.wm = wm;

    if (trackChanges) {
      this.startTracking();
    }
  }

  /**
   * Start tracking changes
   */
  startTracking(): void {
    if (this.monitoring) return;

    this.monitoring = true;
    this.wm.addListener({
      onAssert: (wme: IWME) => {
        this.recordChange(WMEChangeType.ASSERT, wme);
      },
      onRetract: (wme: IWME) => {
        this.recordChange(WMEChangeType.RETRACT, wme);
      },
      onModify: (wme: IWME, changes: Record<string, any>) => {
        this.recordChange(WMEChangeType.MODIFY, wme, changes);
      },
    });
  }

  /**
   * Stop tracking changes
   */
  stopTracking(): void {
    this.monitoring = false;
  }

  /**
   * Record a change
   */
  private recordChange(changeType: WMEChangeType, wme: IWME, details?: any): void {
    this.changeHistory.push({
      timestamp: Date.now(),
      changeType,
      wmeId: wme.id,
      wmeType: wme.type,
      details,
    });

    // Limit history size
    if (this.changeHistory.length > this.maxHistorySize) {
      this.changeHistory.shift();
    }
  }

  /**
   * List all WMEs with optional filtering
   */
  list(filter?: InspectorFilter, options?: DisplayOptions): IWME[] {
    let wmes = this.wm.getAll();

    // Apply filters
    if (filter) {
      wmes = this.applyFilter(wmes, filter);
    }

    // Apply sorting
    if (options?.sortBy) {
      wmes = this.sortWMEs(wmes, options.sortBy, options.sortDirection || 'asc');
    }

    // Apply limit
    if (options?.limit) {
      wmes = wmes.slice(0, options.limit);
    }

    return wmes;
  }

  /**
   * Display WMEs to console
   */
  display(filter?: InspectorFilter, options?: DisplayOptions): void {
    const wmes = this.list(filter, options);

    if (wmes.length === 0) {
      console.log('No WMEs found matching filter.');
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`MEMORY INSPECTOR - ${wmes.length} WME(s)`);
    console.log('='.repeat(80));

    if (options?.groupByType) {
      this.displayGrouped(wmes, options);
    } else {
      this.displayList(wmes, options);
    }

    console.log('='.repeat(80));
  }

  /**
   * Display WMEs as list
   */
  private displayList(wmes: IWME[], options?: DisplayOptions): void {
    for (let i = 0; i < wmes.length; i++) {
      const wme = wmes[i];
      console.log(`\n[${i + 1}] ${wme.type} (${wme.id.substring(0, 8)}...)`);

      if (options?.verbose) {
        this.displayWMEDetails(wme, options);
      } else {
        this.displayWMESummary(wme);
      }
    }
  }

  /**
   * Display WMEs grouped by type
   */
  private displayGrouped(wmes: IWME[], options?: DisplayOptions): void {
    const grouped = new Map<string, IWME[]>();

    for (const wme of wmes) {
      if (!grouped.has(wme.type)) {
        grouped.set(wme.type, []);
      }
      grouped.get(wme.type)!.push(wme);
    }

    for (const [type, typeWMEs] of grouped.entries()) {
      console.log(`\n--- ${type} (${typeWMEs.length}) ---`);
      for (const wme of typeWMEs) {
        console.log(`  ${wme.id.substring(0, 8)}...`, this.getWMESummaryText(wme));
      }
    }
  }

  /**
   * Display WME summary (one line)
   */
  private displayWMESummary(wme: IWME): void {
    console.log(`  ${this.getWMESummaryText(wme)}`);
  }

  /**
   * Get WME summary text
   */
  private getWMESummaryText(wme: IWME): string {
    const attrs: string[] = [];
    const allAttrs = (wme as any).attributes || new Map();

    if (allAttrs instanceof Map) {
      for (const [key, value] of allAttrs.entries()) {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        attrs.push(`${key}: ${valueStr.substring(0, 30)}`);
      }
    }

    return attrs.length > 0 ? `{ ${attrs.join(', ')} }` : '{}';
  }

  /**
   * Display full WME details
   */
  private displayWMEDetails(wme: IWME, options?: DisplayOptions): void {
    // Attributes
    console.log('  Attributes:');
    const allAttrs = (wme as any).attributes || new Map();

    if (allAttrs instanceof Map) {
      for (const [key, value] of allAttrs.entries()) {
        console.log(`    ${key}: ${JSON.stringify(value)}`);
      }
    }

    // Timestamps
    if (options?.showTimestamps) {
      console.log('  Timestamps:');
      console.log(`    Created: ${new Date(wme.createdAt).toISOString()}`);
      console.log(`    Modified: ${new Date(wme.modifiedAt).toISOString()}`);
      console.log(`    Age: ${Math.floor((Date.now() - wme.createdAt) / 1000)}s`);
    }

    // Expiration info (if transient)
    if (options?.showExpiration && wme instanceof ConditionalWME) {
      console.log('  Expiration:');
      console.log(`    Strategy: ${wme.strategy}`);
      console.log(`    Expires at: ${new Date(wme.expiresAt).toISOString()}`);
      console.log(`    Remaining: ${Math.floor(wme.getRemainingLifetime() / 1000)}s`);
      console.log(`    Is expired: ${wme.isExpired()}`);

      if (wme.getConditions().length > 0) {
        console.log(`    Conditions: ${wme.getConditions().length}`);
      }

      if (wme.getDependencies().length > 0) {
        console.log(`    Dependencies: ${wme.getDependencies().join(', ')}`);
      }

      if (wme.getExpirationEvents().length > 0) {
        console.log(`    Events: ${wme.getExpirationEvents().join(', ')}`);
      }
    }

    // Reference info (if meta-WME)
    if (options?.showReferences && wme instanceof MetaWME) {
      console.log('  References:');
      console.log(`    Referenced WME: ${wme.referencedWMEId}`);

      if (wme instanceof BeliefAboutWME) {
        console.log(`    Agent: ${wme.getAgent()}`);
        console.log(`    Belief: ${wme.getBelief()}`);
        console.log(`    Confidence: ${wme.getConfidence()}`);
      }

      if (wme instanceof KnowledgeAboutBeliefWME) {
        console.log(`    Knower: ${wme.getKnower()}`);
        console.log(`    Known: ${wme.getKnown()}`);
        console.log(`    Knowledge: ${wme.getKnowledge()}`);
      }
    }
  }

  /**
   * Apply filter to WME list
   */
  private applyFilter(wmes: IWME[], filter: InspectorFilter): IWME[] {
    let filtered = wmes;

    if (filter.type) {
      filtered = filtered.filter((wme) => wme.type === filter.type);
    }

    if (filter.typePattern) {
      filtered = filtered.filter((wme) => filter.typePattern!.test(wme.type));
    }

    if (filter.attributes) {
      filtered = filtered.filter((wme) => wme.matches(filter.attributes!));
    }

    if (filter.createdAfter) {
      filtered = filtered.filter((wme) => wme.createdAt > filter.createdAfter!);
    }

    if (filter.createdBefore) {
      filtered = filtered.filter((wme) => wme.createdAt < filter.createdBefore!);
    }

    if (filter.modifiedAfter) {
      filtered = filtered.filter((wme) => wme.modifiedAt > filter.modifiedAfter!);
    }

    if (filter.modifiedBefore) {
      filtered = filtered.filter((wme) => wme.modifiedAt < filter.modifiedBefore!);
    }

    if (filter.maxAge) {
      const threshold = Date.now() - filter.maxAge;
      filtered = filtered.filter((wme) => wme.createdAt >= threshold);
    }

    if (filter.minAge) {
      const threshold = Date.now() - filter.minAge;
      filtered = filtered.filter((wme) => wme.createdAt <= threshold);
    }

    if (filter.isConditional !== undefined) {
      filtered = filtered.filter((wme) => (wme instanceof ConditionalWME) === filter.isConditional);
    }

    if (filter.isTransient !== undefined) {
      filtered = filtered.filter(
        (wme) => (wme instanceof ConditionalWME || (wme as any).expiresAt !== undefined) === filter.isTransient
      );
    }

    if (filter.isMeta !== undefined) {
      filtered = filtered.filter((wme) => (wme instanceof MetaWME) === filter.isMeta);
    }

    if (filter.customFilter) {
      filtered = filtered.filter(filter.customFilter);
    }

    return filtered;
  }

  /**
   * Sort WMEs
   */
  private sortWMEs(wmes: IWME[], sortBy: string, direction: 'asc' | 'desc'): IWME[] {
    const sorted = [...wmes];

    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        case 'modifiedAt':
          aVal = a.modifiedAt;
          bVal = b.modifiedAt;
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        case 'id':
          aVal = a.id;
          bVal = b.id;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Get statistics about working memory
   */
  getStats(): {
    totalWMEs: number;
    byType: Record<string, number>;
    conditionalWMEs: number;
    transientWMEs: number;
    metaWMEs: number;
    averageAge: number;
    oldestWME: number;
    newestWME: number;
  } {
    const wmes = this.wm.getAll();
    const byType: Record<string, number> = {};
    let conditionalCount = 0;
    let transientCount = 0;
    let metaCount = 0;

    for (const wme of wmes) {
      byType[wme.type] = (byType[wme.type] || 0) + 1;

      if (wme instanceof ConditionalWME) conditionalCount++;
      if ((wme as any).expiresAt !== undefined) transientCount++;
      if (wme instanceof MetaWME) metaCount++;
    }

    const now = Date.now();
    const ages = wmes.map((wme) => now - wme.createdAt);
    const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    const oldestWME = ages.length > 0 ? Math.max(...ages) : 0;
    const newestWME = ages.length > 0 ? Math.min(...ages) : 0;

    return {
      totalWMEs: wmes.length,
      byType,
      conditionalWMEs: conditionalCount,
      transientWMEs: transientCount,
      metaWMEs: metaCount,
      averageAge,
      oldestWME,
      newestWME,
    };
  }

  /**
   * Display statistics
   */
  displayStats(): void {
    const stats = this.getStats();

    console.log(`\n${'='.repeat(80)}`);
    console.log('MEMORY STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total WMEs: ${stats.totalWMEs}`);
    console.log(`Conditional WMEs: ${stats.conditionalWMEs}`);
    console.log(`Transient WMEs: ${stats.transientWMEs}`);
    console.log(`Meta-WMEs: ${stats.metaWMEs}`);
    console.log(`Average Age: ${Math.floor(stats.averageAge / 1000)}s`);
    console.log(`Oldest WME: ${Math.floor(stats.oldestWME / 1000)}s`);
    console.log(`Newest WME: ${Math.floor(stats.newestWME / 1000)}s`);

    console.log('\nWMEs by Type:');
    const sorted = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted) {
      console.log(`  ${type}: ${count}`);
    }

    console.log('='.repeat(80));
  }

  /**
   * Create a snapshot of current memory state
   */
  createSnapshot(name: string, metadata?: Record<string, any>): MemorySnapshot {
    const wmes = this.wm.getAll();
    const byType: Record<string, number> = {};

    for (const wme of wmes) {
      byType[wme.type] = (byType[wme.type] || 0) + 1;
    }

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      wmeCount: wmes.length,
      wmesByType: byType,
      wmes: wmes.map((wme) => wme.toJSON()),
      metadata,
    };

    this.snapshots.set(name, snapshot);
    return snapshot;
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(name1: string, name2: string): void {
    const snap1 = this.snapshots.get(name1);
    const snap2 = this.snapshots.get(name2);

    if (!snap1 || !snap2) {
      console.log('Snapshot not found');
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`SNAPSHOT COMPARISON: ${name1} vs ${name2}`);
    console.log('='.repeat(80));

    console.log(`\nTotal WMEs: ${snap1.wmeCount} → ${snap2.wmeCount} (${snap2.wmeCount - snap1.wmeCount > 0 ? '+' : ''}${snap2.wmeCount - snap1.wmeCount})`);

    console.log('\nChanges by Type:');
    const allTypes = new Set([...Object.keys(snap1.wmesByType), ...Object.keys(snap2.wmesByType)]);

    for (const type of allTypes) {
      const count1 = snap1.wmesByType[type] || 0;
      const count2 = snap2.wmesByType[type] || 0;
      const diff = count2 - count1;

      if (diff !== 0) {
        console.log(`  ${type}: ${count1} → ${count2} (${diff > 0 ? '+' : ''}${diff})`);
      }
    }

    console.log('='.repeat(80));
  }

  /**
   * Get change history
   */
  getChangeHistory(filter?: { changeType?: WMEChangeType; limit?: number }): ChangeEntry[] {
    let history = [...this.changeHistory];

    if (filter?.changeType) {
      history = history.filter((entry) => entry.changeType === filter.changeType);
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Display change history
   */
  displayChangeHistory(filter?: { changeType?: WMEChangeType; limit?: number }): void {
    const history = this.getChangeHistory(filter);

    console.log(`\n${'='.repeat(80)}`);
    console.log(`CHANGE HISTORY - ${history.length} change(s)`);
    console.log('='.repeat(80));

    for (const entry of history) {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      console.log(`[${time}] ${entry.changeType} ${entry.wmeType} (${entry.wmeId.substring(0, 8)}...)`);

      if (entry.details) {
        console.log(`  Details: ${JSON.stringify(entry.details)}`);
      }
    }

    console.log('='.repeat(80));
  }

  /**
   * Manually assert a WME for testing
   */
  testAssert(type: string, attributes: Record<string, any>): IWME {
    const wme = new WME(type, attributes);
    this.wm.assert(wme);
    console.log(`[TEST] Asserted ${type} (${wme.id.substring(0, 8)}...)`);
    return wme;
  }

  /**
   * Manually retract a WME for testing
   */
  testRetract(wmeOrId: IWME | string): boolean {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    const success = this.wm.retract(id);
    console.log(`[TEST] Retracted ${id.substring(0, 8)}... - ${success ? 'Success' : 'Failed'}`);
    return success;
  }

  /**
   * Clear all WMEs (for testing)
   */
  testClear(): void {
    const count = this.wm.getAll().length;
    this.wm.clear();
    console.log(`[TEST] Cleared ${count} WMEs`);
  }

  /**
   * Export memory state to JSON
   */
  export(): any {
    return {
      timestamp: Date.now(),
      wmes: this.wm.export(),
      stats: this.getStats(),
      snapshots: Array.from(this.snapshots.entries()).map(([name, snap]) => ({ name, ...snap })),
      changeHistory: this.monitoring ? this.changeHistory : null,
    };
  }

  /**
   * Import memory state from JSON
   */
  import(data: any): void {
    this.wm.import(data.wmes);
    console.log(`[IMPORT] Imported ${data.wmes.length} WMEs`);
  }
}

/**
 * Multi-Memory Inspector - for inspecting multi-memory systems
 */
export class MultiMemoryInspector {
  private manager: MultiMemoryManager;
  private inspectors: Map<string, MemoryInspector> = new Map();

  constructor(manager: MultiMemoryManager) {
    this.manager = manager;

    // Create inspectors for each memory space
    this.inspectors.set('shared', new MemoryInspector(manager.getSharedMemory()));
    this.inspectors.set('world', new MemoryInspector(manager.getWorldMemory()));
  }

  /**
   * Get inspector for agent
   */
  getAgentInspector(agentId: string): MemoryInspector {
    if (!this.inspectors.has(agentId)) {
      this.inspectors.set(agentId, new MemoryInspector(this.manager.getAgentMemory(agentId)));
    }
    return this.inspectors.get(agentId)!;
  }

  /**
   * Display all memory spaces
   */
  displayAll(): void {
    console.log(`\n${'='.repeat(80)}`);
    console.log('MULTI-MEMORY INSPECTOR');
    console.log('='.repeat(80));

    console.log('\n--- SHARED MEMORY ---');
    this.inspectors.get('shared')!.display(undefined, { limit: 10, groupByType: true });

    console.log('\n--- WORLD MEMORY ---');
    this.inspectors.get('world')!.display(undefined, { limit: 10, groupByType: true });

    console.log('\n--- AGENT MEMORIES ---');
    for (const agentId of this.manager.getAllAgentIds()) {
      console.log(`\n  Agent: ${agentId}`);
      const inspector = this.getAgentInspector(agentId);
      const stats = inspector.getStats();
      console.log(`    WMEs: ${stats.totalWMEs}`);
    }

    console.log('='.repeat(80));
  }

  /**
   * Display agent's knowledge (combined view)
   */
  displayAgentKnowledge(agentId: string): void {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`AGENT KNOWLEDGE: ${agentId}`);
    console.log('='.repeat(80));

    const knowledge = this.manager.getAgentKnowledge(agentId);

    console.log(`\nTotal Knowledge: ${knowledge.length} WME(s)`);
    console.log(`  Private: ${knowledge.filter(wme => wme.getAttribute('_source') === 'agent').length}`);
    console.log(`  Shared: ${knowledge.filter(wme => wme.getAttribute('_source') === 'shared').length}`);
    console.log(`  World: ${knowledge.filter(wme => wme.getAttribute('_source') === 'world').length}`);

    // Display by type
    const byType = new Map<string, IWME[]>();
    for (const wme of knowledge) {
      if (!byType.has(wme.type)) {
        byType.set(wme.type, []);
      }
      byType.get(wme.type)!.push(wme);
    }

    for (const [type, wmes] of byType.entries()) {
      console.log(`\n  ${type} (${wmes.length}):`);
      for (const wme of wmes.slice(0, 5)) {
        console.log(`    - ${wme.id.substring(0, 8)}...`);
      }
      if (wmes.length > 5) {
        console.log(`    ... and ${wmes.length - 5} more`);
      }
    }

    console.log('='.repeat(80));
  }
}

/**
 * Quick inspection helpers
 */
export class InspectorHelpers {
  /**
   * Quick inspect - display all WMEs
   */
  static inspect(wm: WorkingMemory): void {
    const inspector = new MemoryInspector(wm);
    inspector.display();
  }

  /**
   * Quick stats - display statistics
   */
  static stats(wm: WorkingMemory): void {
    const inspector = new MemoryInspector(wm);
    inspector.displayStats();
  }

  /**
   * Quick filter - display filtered WMEs
   */
  static filter(wm: WorkingMemory, filter: InspectorFilter): void {
    const inspector = new MemoryInspector(wm);
    inspector.display(filter);
  }

  /**
   * Quick watch - monitor changes in real-time
   */
  static watch(wm: WorkingMemory, durationMs: number = 10000): MemoryInspector {
    const inspector = new MemoryInspector(wm, true);
    console.log(`[WATCH] Monitoring changes for ${durationMs}ms...`);

    setTimeout(() => {
      inspector.stopTracking();
      inspector.displayChangeHistory();
      console.log('[WATCH] Monitoring stopped');
    }, durationMs);

    return inspector;
  }

  /**
   * Quick compare - create snapshot, wait, then compare
   */
  static async compare(wm: WorkingMemory, waitMs: number = 5000): Promise<void> {
    const inspector = new MemoryInspector(wm);

    console.log('[COMPARE] Creating initial snapshot...');
    inspector.createSnapshot('before');

    console.log(`[COMPARE] Waiting ${waitMs}ms...`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    console.log('[COMPARE] Creating final snapshot...');
    inspector.createSnapshot('after');

    inspector.compareSnapshots('before', 'after');
  }
}
