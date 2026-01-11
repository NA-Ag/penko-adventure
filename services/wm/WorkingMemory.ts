/**
 * WorkingMemory - FACADE 5.1
 *
 * Working Memory manages the collection of WMEs (Working Memory Elements).
 * Based on Facade's working memory architecture.
 *
 * Working Memory is the central fact database that:
 * - Stores all WMEs (facts about the world)
 * - Provides assertion/retraction/modification operations
 * - Supports querying and pattern matching
 * - Triggers listeners when WMEs change
 * - Maintains consistency of world facts
 *
 * Key Operations:
 * - Assert: Add a new WME to working memory
 * - Retract: Remove a WME from working memory
 * - Modify: Update a WME's attributes
 * - Query: Find WMEs matching patterns
 *
 * This enables:
 * - Behavior preconditions ("is player in plaza?")
 * - Reactive behaviors (act when facts change)
 * - Complex reasoning about the world
 * - Persistent world state
 */

import { IWME, WME } from './WME';

/**
 * WME change event types
 */
export enum WMEChangeType {
  ASSERT = 'assert',
  RETRACT = 'retract',
  MODIFY = 'modify',
}

/**
 * WME change event
 */
export interface WMEChangeEvent {
  type: WMEChangeType;
  wme: IWME;
  timestamp: number;
}

/**
 * WME listener callback
 */
export type WMEListener = (event: WMEChangeEvent) => void;

/**
 * WME query pattern
 */
export interface WMEQuery {
  /** Filter by WME type */
  type?: string;

  /** Filter by attribute pattern */
  attributes?: Partial<Record<string, any>>;

  /** Custom filter function */
  filter?: (wme: IWME) => boolean;
}

/**
 * Working Memory - manages collection of WMEs
 */
export class WorkingMemory {
  private wmes: Map<string, IWME> = new Map();
  private listeners: WMEListener[] = [];
  private typeIndex: Map<string, Set<string>> = new Map(); // type -> wme IDs
  private debug: boolean = false;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Assert a new WME into working memory
   */
  assert(wme: IWME): void {
    if (this.wmes.has(wme.id)) {
      this.log(`Warning: WME ${wme.id} already exists, replacing`);
    }

    this.wmes.set(wme.id, wme);

    // Update type index
    if (!this.typeIndex.has(wme.type)) {
      this.typeIndex.set(wme.type, new Set());
    }
    this.typeIndex.get(wme.type)!.add(wme.id);

    this.log(`Assert: ${wme.toString()}`);

    // Notify listeners
    this.notifyListeners({
      type: WMEChangeType.ASSERT,
      wme,
      timestamp: Date.now(),
    });
  }

  /**
   * Retract a WME from working memory
   */
  retract(wmeOrId: IWME | string): boolean {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    const wme = this.wmes.get(id);

    if (!wme) {
      this.log(`Warning: Cannot retract WME ${id}, not found`);
      return false;
    }

    this.wmes.delete(id);

    // Update type index
    const typeSet = this.typeIndex.get(wme.type);
    if (typeSet) {
      typeSet.delete(id);
      if (typeSet.size === 0) {
        this.typeIndex.delete(wme.type);
      }
    }

    this.log(`Retract: ${wme.toString()}`);

    // Notify listeners
    this.notifyListeners({
      type: WMEChangeType.RETRACT,
      wme,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Modify a WME's attributes
   */
  modify(wmeOrId: IWME | string, changes: Record<string, any>): boolean {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    const wme = this.wmes.get(id);

    if (!wme) {
      this.log(`Warning: Cannot modify WME ${id}, not found`);
      return false;
    }

    // Apply changes
    for (const [key, value] of Object.entries(changes)) {
      wme.setAttribute(key, value);
    }

    this.log(`Modify: ${wme.toString()}`);

    // Notify listeners
    this.notifyListeners({
      type: WMEChangeType.MODIFY,
      wme,
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Get a WME by ID
   */
  get(id: string): IWME | undefined {
    return this.wmes.get(id);
  }

  /**
   * Check if a WME exists
   */
  has(wmeOrId: IWME | string): boolean {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    return this.wmes.has(id);
  }

  /**
   * Get all WMEs
   */
  getAll(): IWME[] {
    return Array.from(this.wmes.values());
  }

  /**
   * Get WMEs by type
   */
  getByType(type: string): IWME[] {
    const ids = this.typeIndex.get(type);
    if (!ids) return [];

    const results: IWME[] = [];
    for (const id of ids) {
      const wme = this.wmes.get(id);
      if (wme) {
        results.push(wme);
      }
    }
    return results;
  }

  /**
   * Query WMEs with pattern matching
   */
  query(query: WMEQuery): IWME[] {
    let results: IWME[];

    // Start with type filter if provided (most efficient)
    if (query.type) {
      results = this.getByType(query.type);
    } else {
      results = this.getAll();
    }

    // Apply attribute pattern filter
    if (query.attributes) {
      results = results.filter(wme => wme.matches(query.attributes!));
    }

    // Apply custom filter
    if (query.filter) {
      results = results.filter(query.filter);
    }

    return results;
  }

  /**
   * Find first WME matching query
   */
  findOne(query: WMEQuery): IWME | undefined {
    const results = this.query(query);
    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Check if any WME matches query
   */
  exists(query: WMEQuery): boolean {
    return this.findOne(query) !== undefined;
  }

  /**
   * Count WMEs matching query
   */
  count(query: WMEQuery): number {
    return this.query(query).length;
  }

  /**
   * Clear all WMEs
   */
  clear(): void {
    const allWmes = this.getAll();

    this.wmes.clear();
    this.typeIndex.clear();

    this.log('Clear: All WMEs removed');

    // Notify listeners for each retraction
    for (const wme of allWmes) {
      this.notifyListeners({
        type: WMEChangeType.RETRACT,
        wme,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Add a change listener
   */
  addListener(listener: WMEListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a change listener
   */
  removeListener(listener: WMEListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of a change
   */
  private notifyListeners(event: WMEChangeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in WME listener:', error);
      }
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalWMEs: number;
    typeCount: number;
    types: Record<string, number>;
  } {
    const types: Record<string, number> = {};
    for (const [type, ids] of this.typeIndex.entries()) {
      types[type] = ids.size;
    }

    return {
      totalWMEs: this.wmes.size,
      typeCount: this.typeIndex.size,
      types,
    };
  }

  /**
   * Export working memory (for save files)
   */
  export(): any[] {
    return this.getAll().map(wme => wme.toJSON());
  }

  /**
   * Import working memory (from save files)
   */
  import(data: any[]): void {
    this.clear();

    for (const wmeData of data) {
      const wme = WME.fromJSON(wmeData);
      this.assert(wme);
    }
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[WorkingMemory] ${message}`);
    }
  }

  /**
   * Print working memory contents (debugging)
   */
  dump(): void {
    console.log('\n=== Working Memory Dump ===');
    console.log(`Total WMEs: ${this.wmes.size}\n`);

    const byType = new Map<string, IWME[]>();
    for (const wme of this.wmes.values()) {
      if (!byType.has(wme.type)) {
        byType.set(wme.type, []);
      }
      byType.get(wme.type)!.push(wme);
    }

    for (const [type, wmes] of byType.entries()) {
      console.log(`${type} (${wmes.length}):`);
      for (const wme of wmes) {
        console.log(`  ${wme.toString()}`);
      }
      console.log();
    }
  }
}

/**
 * WME Builder - fluent API for creating and asserting WMEs
 */
export class WMEBuilder {
  private type: string;
  private attributes: Record<string, any> = {};

  constructor(type: string) {
    this.type = type;
  }

  /**
   * Add an attribute
   */
  with(key: string, value: any): WMEBuilder {
    this.attributes[key] = value;
    return this;
  }

  /**
   * Build the WME
   */
  build(): WME {
    return new WME(this.type, this.attributes);
  }

  /**
   * Build and assert into working memory
   */
  assertInto(wm: WorkingMemory): WME {
    const wme = this.build();
    wm.assert(wme);
    return wme;
  }
}

/**
 * Helper functions for common operations
 */
export class WMEHelpers {
  /**
   * Assert or update a singleton WME (only one of this type/pattern should exist)
   */
  static assertSingleton(
    wm: WorkingMemory,
    type: string,
    pattern: Record<string, any>,
    attributes: Record<string, any>
  ): IWME {
    // Find existing WME matching pattern
    const existing = wm.findOne({ type, attributes: pattern });

    if (existing) {
      // Update existing
      wm.modify(existing, attributes);
      return existing;
    } else {
      // Create new
      const wme = new WME(type, { ...pattern, ...attributes });
      wm.assert(wme);
      return wme;
    }
  }

  /**
   * Retract all WMEs matching a pattern
   */
  static retractAll(wm: WorkingMemory, query: WMEQuery): number {
    const matches = wm.query(query);
    for (const wme of matches) {
      wm.retract(wme);
    }
    return matches.length;
  }

  /**
   * Get or create a WME
   */
  static getOrCreate(
    wm: WorkingMemory,
    type: string,
    pattern: Record<string, any>,
    defaultAttributes?: Record<string, any>
  ): IWME {
    const existing = wm.findOne({ type, attributes: pattern });
    if (existing) {
      return existing;
    }

    const wme = new WME(type, { ...pattern, ...defaultAttributes });
    wm.assert(wme);
    return wme;
  }

  /**
   * Increment a numeric attribute (or set to 1 if doesn't exist)
   */
  static increment(wm: WorkingMemory, wmeOrId: IWME | string, attribute: string, delta: number = 1): boolean {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    const wme = wm.get(id);

    if (!wme) return false;

    const currentValue = wme.getAttribute(attribute) || 0;
    const newValue = currentValue + delta;

    return wm.modify(wme, { [attribute]: newValue });
  }

  /**
   * Set a flag (boolean attribute)
   */
  static setFlag(wm: WorkingMemory, wmeOrId: IWME | string, flag: string, value: boolean = true): boolean {
    return wm.modify(wmeOrId, { [flag]: value });
  }

  /**
   * Toggle a flag
   */
  static toggleFlag(wm: WorkingMemory, wmeOrId: IWME | string, flag: string): boolean {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;
    const wme = wm.get(id);

    if (!wme) return false;

    const currentValue = wme.getAttribute(flag) || false;
    return wm.modify(wme, { [flag]: !currentValue });
  }
}
