/**
 * ObjectFocusedReactions - FACADE 6.7
 *
 * Object-focused reactions allow rules to reference specific game objects
 * and react to actions involving owned or related objects.
 *
 * Features:
 * - Object ownership tracking
 * - "MY sword" vs "any sword"
 * - Relationship-based reactions
 * - Possession detection
 * - Object reference binding
 * - Ownership transfers
 *
 * This enables:
 * - NPC reacts when player takes THEIR property
 * - NPC doesn't care about other NPC's property
 * - Personal item reactions
 * - Territorial behavior
 * - Possession-based interactions
 */

import { IWME } from '../wm/WME';
import { WorkingMemory } from '../wm/WorkingMemory';
import { Pattern } from './Rule';

/**
 * Object ownership relationship
 */
export interface Ownership {
  /** Owner entity ID */
  owner: string;

  /** Owned object ID */
  object: string;

  /** Type of ownership */
  type: 'owns' | 'carries' | 'wears' | 'guards' | 'controls';

  /** Ownership strength (0-1) */
  strength: number;

  /** When ownership was established */
  since: number;

  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Ownership manager - tracks object ownership
 */
export class OwnershipManager {
  private ownerships: Map<string, Ownership> = new Map(); // object ID -> ownership
  private ownerIndex: Map<string, Set<string>> = new Map(); // owner ID -> object IDs
  private debug: boolean = false;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Set ownership relationship
   */
  setOwnership(ownership: Ownership): void {
    this.ownerships.set(ownership.object, ownership);

    // Update index
    if (!this.ownerIndex.has(ownership.owner)) {
      this.ownerIndex.set(ownership.owner, new Set());
    }
    this.ownerIndex.get(ownership.owner)!.add(ownership.object);

    if (this.debug) {
      console.log(
        `[OwnershipManager] ${ownership.owner} ${ownership.type} ${ownership.object}`
      );
    }
  }

  /**
   * Remove ownership
   */
  removeOwnership(objectId: string): boolean {
    const ownership = this.ownerships.get(objectId);
    if (!ownership) return false;

    this.ownerships.delete(objectId);

    const ownerObjects = this.ownerIndex.get(ownership.owner);
    if (ownerObjects) {
      ownerObjects.delete(objectId);
    }

    if (this.debug) {
      console.log(`[OwnershipManager] Removed ownership of ${objectId}`);
    }

    return true;
  }

  /**
   * Get ownership for object
   */
  getOwnership(objectId: string): Ownership | undefined {
    return this.ownerships.get(objectId);
  }

  /**
   * Get owner of object
   */
  getOwner(objectId: string): string | undefined {
    const ownership = this.ownerships.get(objectId);
    return ownership?.owner;
  }

  /**
   * Check if entity owns object
   */
  owns(owner: string, objectId: string): boolean {
    const ownership = this.ownerships.get(objectId);
    return ownership?.owner === owner;
  }

  /**
   * Get all objects owned by entity
   */
  getOwnedObjects(owner: string): string[] {
    const objects = this.ownerIndex.get(owner);
    return objects ? Array.from(objects) : [];
  }

  /**
   * Transfer ownership
   */
  transfer(objectId: string, newOwner: string, type?: 'owns' | 'carries' | 'wears' | 'guards' | 'controls'): boolean {
    const ownership = this.ownerships.get(objectId);
    if (!ownership) return false;

    const oldOwner = ownership.owner;

    // Remove from old owner's index
    const oldOwnerObjects = this.ownerIndex.get(oldOwner);
    if (oldOwnerObjects) {
      oldOwnerObjects.delete(objectId);
    }

    // Update ownership
    ownership.owner = newOwner;
    if (type) {
      ownership.type = type;
    }
    ownership.since = Date.now();

    // Add to new owner's index
    if (!this.ownerIndex.has(newOwner)) {
      this.ownerIndex.set(newOwner, new Set());
    }
    this.ownerIndex.get(newOwner)!.add(objectId);

    if (this.debug) {
      console.log(`[OwnershipManager] Transferred ${objectId} from ${oldOwner} to ${newOwner}`);
    }

    return true;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalOwnerships: number;
    byOwner: Record<string, number>;
    byType: Record<string, number>;
  } {
    const byOwner: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const ownership of this.ownerships.values()) {
      byOwner[ownership.owner] = (byOwner[ownership.owner] || 0) + 1;
      byType[ownership.type] = (byType[ownership.type] || 0) + 1;
    }

    return {
      totalOwnerships: this.ownerships.size,
      byOwner,
      byType,
    };
  }

  /**
   * Clear all ownerships
   */
  clear(): void {
    this.ownerships.clear();
    this.ownerIndex.clear();

    if (this.debug) {
      console.log('[OwnershipManager] Cleared all ownerships');
    }
  }

  /**
   * Display statistics
   */
  displayStats(): void {
    const stats = this.getStats();

    console.log('\n' + '='.repeat(60));
    console.log('OWNERSHIP MANAGER STATISTICS');
    console.log('='.repeat(60));

    console.log(`\nTotal Ownerships: ${stats.totalOwnerships}`);

    console.log('\nBy Owner:');
    const sortedOwners = Object.entries(stats.byOwner).sort((a, b) => b[1] - a[1]);
    for (const [owner, count] of sortedOwners) {
      console.log(`  ${owner}: ${count}`);
    }

    console.log('\nBy Type:');
    for (const [type, count] of Object.entries(stats.byType)) {
      console.log(`  ${type}: ${count}`);
    }

    console.log('='.repeat(60) + '\n');
  }
}

/**
 * Object reference pattern - extends Pattern with ownership support
 */
export interface ObjectReferencePattern extends Pattern {
  /** Owner entity ID (for "MY sword") */
  owner?: string;

  /** Check ownership relationship */
  ownershipType?: 'owns' | 'carries' | 'wears' | 'guards' | 'controls';

  /** Minimum ownership strength */
  minOwnershipStrength?: number;
}

/**
 * Object-focused pattern matcher
 */
export class ObjectFocusedMatcher {
  private ownershipManager: OwnershipManager;

  constructor(ownershipManager: OwnershipManager) {
    this.ownershipManager = ownershipManager;
  }

  /**
   * Check if WME matches object reference pattern
   */
  matches(wme: IWME, pattern: ObjectReferencePattern): boolean {
    // Check type
    if (wme.type !== pattern.type) {
      return false;
    }

    // Check owner if specified
    if (pattern.owner !== undefined) {
      const owner = this.ownershipManager.getOwner(wme.id);
      if (owner !== pattern.owner) {
        return false;
      }
    }

    // Check ownership type
    if (pattern.ownershipType !== undefined) {
      const ownership = this.ownershipManager.getOwnership(wme.id);
      if (!ownership || ownership.type !== pattern.ownershipType) {
        return false;
      }
    }

    // Check ownership strength
    if (pattern.minOwnershipStrength !== undefined) {
      const ownership = this.ownershipManager.getOwnership(wme.id);
      if (!ownership || ownership.strength < pattern.minOwnershipStrength) {
        return false;
      }
    }

    // Check attributes
    if (pattern.attributes) {
      for (const [key, value] of Object.entries(pattern.attributes)) {
        const actualValue = wme.getAttribute(key);

        // Wildcard
        if (value === '*' || value === '?') {
          continue;
        }

        // Variable binding (skip for now)
        if (typeof value === 'string' && value.startsWith('$')) {
          continue;
        }

        // Exact match
        if (actualValue !== value) {
          return false;
        }
      }
    }

    // Check custom filter
    if (pattern.filter && !pattern.filter(wme)) {
      return false;
    }

    return true;
  }

  /**
   * Find all WMEs matching pattern
   */
  findMatches(wmes: IWME[], pattern: ObjectReferencePattern): IWME[] {
    return wmes.filter((wme) => this.matches(wme, pattern));
  }

  /**
   * Find WMEs owned by entity
   */
  findOwnedBy(wmes: IWME[], owner: string): IWME[] {
    return wmes.filter((wme) => this.ownershipManager.owns(owner, wme.id));
  }

  /**
   * Find WMEs not owned by entity
   */
  findNotOwnedBy(wmes: IWME[], owner: string): IWME[] {
    return wmes.filter((wme) => !this.ownershipManager.owns(owner, wme.id));
  }
}

/**
 * Action detection - detect actions on objects
 */
export interface ActionOnObject {
  /** Action type */
  action: 'take' | 'use' | 'give' | 'drop' | 'destroy' | 'interact';

  /** Actor performing action */
  actor: string;

  /** Target object */
  object: string;

  /** Timestamp */
  timestamp: number;

  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Action detector - detects actions on objects
 */
export class ActionDetector {
  private ownershipManager: OwnershipManager;
  private actionHistory: ActionOnObject[] = [];
  private maxHistory: number = 100;

  constructor(ownershipManager: OwnershipManager) {
    this.ownershipManager = ownershipManager;
  }

  /**
   * Record an action on object
   */
  recordAction(action: ActionOnObject): void {
    this.actionHistory.push(action);

    if (this.actionHistory.length > this.maxHistory) {
      this.actionHistory.shift();
    }
  }

  /**
   * Check if action involves owned object
   */
  isActionOnOwnedObject(action: ActionOnObject, owner: string): boolean {
    return this.ownershipManager.owns(owner, action.object);
  }

  /**
   * Get recent actions on owned objects
   */
  getActionsOnOwnedObjects(owner: string, limit?: number): ActionOnObject[] {
    const actions = this.actionHistory.filter((action) =>
      this.isActionOnOwnedObject(action, owner)
    );

    if (limit) {
      return actions.slice(-limit);
    }

    return actions;
  }

  /**
   * Get recent actions by actor
   */
  getActionsByActor(actor: string, limit?: number): ActionOnObject[] {
    const actions = this.actionHistory.filter((action) => action.actor === actor);

    if (limit) {
      return actions.slice(-limit);
    }

    return actions;
  }

  /**
   * Check if actor recently took owner's property
   */
  didActorTakeProperty(actor: string, owner: string, within: number = 5000): boolean {
    const now = Date.now();
    const recentActions = this.actionHistory.filter(
      (action) =>
        action.actor === actor &&
        action.action === 'take' &&
        now - action.timestamp <= within
    );

    for (const action of recentActions) {
      if (this.isActionOnOwnedObject(action, owner)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clear action history
   */
  clearHistory(): void {
    this.actionHistory = [];
  }

  /**
   * Get action history
   */
  getHistory(): ActionOnObject[] {
    return [...this.actionHistory];
  }
}

/**
 * Object reference helpers
 */
export class ObjectReferenceHelpers {
  /**
   * Create "MY object" pattern
   */
  static myObject(
    type: string,
    owner: string,
    attributes?: Record<string, any>
  ): ObjectReferencePattern {
    return {
      type,
      owner,
      attributes,
    };
  }

  /**
   * Create "any object" pattern
   */
  static anyObject(type: string, attributes?: Record<string, any>): Pattern {
    return {
      type,
      attributes,
    };
  }

  /**
   * Create "not MY object" pattern
   */
  static notMyObject(
    type: string,
    owner: string,
    attributes?: Record<string, any>
  ): ObjectReferencePattern {
    return {
      type,
      attributes,
      filter: (wme) => {
        // This would need access to ownership manager
        // In practice, use ObjectFocusedMatcher.findNotOwnedBy
        return true;
      },
    };
  }

  /**
   * Quick ownership setup
   */
  static setOwner(
    manager: OwnershipManager,
    objectId: string,
    owner: string,
    type: 'owns' | 'carries' | 'wears' | 'guards' | 'controls' = 'owns',
    strength: number = 1.0
  ): void {
    manager.setOwnership({
      owner,
      object: objectId,
      type,
      strength,
      since: Date.now(),
    });
  }

  /**
   * Check if action is theft
   */
  static isTheft(
    action: ActionOnObject,
    ownershipManager: OwnershipManager
  ): { isTheft: boolean; victim?: string } {
    if (action.action !== 'take') {
      return { isTheft: false };
    }

    const owner = ownershipManager.getOwner(action.object);
    if (!owner) {
      return { isTheft: false };
    }

    // If actor is not the owner, it's theft
    if (owner !== action.actor) {
      return { isTheft: true, victim: owner };
    }

    return { isTheft: false };
  }

  /**
   * Create ownership from WME attributes
   */
  static createOwnershipFromWME(
    manager: OwnershipManager,
    wme: IWME,
    ownerAttribute: string = 'owner',
    type: 'owns' | 'carries' | 'wears' | 'guards' | 'controls' = 'owns'
  ): boolean {
    const owner = wme.getAttribute(ownerAttribute);
    if (!owner || typeof owner !== 'string') {
      return false;
    }

    manager.setOwnership({
      owner,
      object: wme.id,
      type,
      strength: 1.0,
      since: Date.now(),
    });

    return true;
  }
}

/**
 * Ownership integration with working memory
 */
export class OwnershipIntegration {
  private wm: WorkingMemory;
  private ownershipManager: OwnershipManager;
  private actionDetector: ActionDetector;

  constructor(wm: WorkingMemory, ownershipManager: OwnershipManager) {
    this.wm = wm;
    this.ownershipManager = ownershipManager;
    this.actionDetector = new ActionDetector(ownershipManager);
  }

  /**
   * Get ownership manager
   */
  getOwnershipManager(): OwnershipManager {
    return this.ownershipManager;
  }

  /**
   * Get action detector
   */
  getActionDetector(): ActionDetector {
    return this.actionDetector;
  }

  /**
   * Get working memory
   */
  getWorkingMemory(): WorkingMemory {
    return this.wm;
  }

  /**
   * Create object-focused matcher
   */
  createMatcher(): ObjectFocusedMatcher {
    return new ObjectFocusedMatcher(this.ownershipManager);
  }

  /**
   * Record action on object
   */
  recordAction(action: ActionOnObject): void {
    this.actionDetector.recordAction(action);

    // If action is "take", transfer ownership
    if (action.action === 'take') {
      this.ownershipManager.transfer(action.object, action.actor, 'carries');
    }

    // If action is "give", transfer to recipient
    if (action.action === 'give' && action.data?.recipient) {
      this.ownershipManager.transfer(action.object, action.data.recipient, 'owns');
    }

    // If action is "drop", remove ownership
    if (action.action === 'drop') {
      this.ownershipManager.removeOwnership(action.object);
    }
  }

  /**
   * Auto-setup ownership from WMEs with owner attribute
   */
  autoSetupOwnership(ownerAttribute: string = 'owner'): number {
    let count = 0;
    const wmes = this.wm.getAll();

    for (const wme of wmes) {
      const owner = wme.getAttribute(ownerAttribute);
      if (owner && typeof owner === 'string') {
        this.ownershipManager.setOwnership({
          owner,
          object: wme.id,
          type: 'owns',
          strength: 1.0,
          since: Date.now(),
        });
        count++;
      }
    }

    return count;
  }

  /**
   * Find objects owned by entity
   */
  findOwnedObjects(owner: string): IWME[] {
    const objectIds = this.ownershipManager.getOwnedObjects(owner);
    return objectIds
      .map((id) => this.wm.get(id))
      .filter((wme): wme is IWME => wme !== undefined);
  }

  /**
   * Check if action was theft
   */
  wasTheft(action: ActionOnObject): { isTheft: boolean; victim?: string } {
    return ObjectReferenceHelpers.isTheft(action, this.ownershipManager);
  }
}
