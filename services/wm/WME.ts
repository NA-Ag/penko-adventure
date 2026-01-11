/**
 * WME (Working Memory Element) - FACADE 5.1
 *
 * Working Memory Elements are structured fact objects in the ABL system.
 * Based on Facade's WME architecture.
 *
 * WMEs represent discrete facts about the world:
 * - "player is in plaza"
 * - "NPC mood is angry"
 * - "quest_dragon is active"
 * - "inventory contains sword"
 *
 * Key properties:
 * - Type: Category of fact (location, mood, quest, etc.)
 * - Attributes: Key-value pairs describing the fact
 * - Timestamp: When the WME was created/modified
 * - Unique ID: For tracking and removal
 *
 * WME Lifecycle:
 * - Assert: Add a new fact to working memory
 * - Modify: Update an existing fact's attributes
 * - Retract: Remove a fact from working memory
 *
 * WMEs persist until explicitly retracted, enabling:
 * - Persistent world state
 * - Behavior preconditions based on facts
 * - Complex reasoning about the world
 */

/**
 * Base WME interface - all WMEs implement this
 */
export interface IWME {
  /** Unique identifier for this WME */
  id: string;

  /** Type/category of this WME */
  type: string;

  /** When this WME was created */
  createdAt: number;

  /** When this WME was last modified */
  modifiedAt: number;

  /** Get all attributes as a record */
  getAttributes(): Record<string, any>;

  /** Get a specific attribute value */
  getAttribute(key: string): any;

  /** Set a specific attribute value */
  setAttribute(key: string, value: any): void;

  /** Check if WME has an attribute */
  hasAttribute(key: string): boolean;

  /** Check if WME matches a pattern */
  matches(pattern: Partial<Record<string, any>>): boolean;

  /** Clone this WME */
  clone(): IWME;

  /** Export WME to JSON */
  toJSON(): any;
}

/**
 * Base WME class - foundation for all working memory elements
 */
export class WME implements IWME {
  readonly id: string;
  readonly type: string;
  readonly createdAt: number;
  modifiedAt: number;
  protected attributes: Map<string, any>;

  private static idCounter: number = 0;

  constructor(type: string, attributes?: Record<string, any>) {
    this.id = `wme_${WME.idCounter++}`;
    this.type = type;
    this.createdAt = Date.now();
    this.modifiedAt = this.createdAt;
    this.attributes = new Map();

    // Initialize attributes
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        this.attributes.set(key, value);
      }
    }
  }

  /**
   * Get all attributes as a record
   */
  getAttributes(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of this.attributes.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Get a specific attribute value
   */
  getAttribute(key: string): any {
    return this.attributes.get(key);
  }

  /**
   * Set a specific attribute value
   */
  setAttribute(key: string, value: any): void {
    this.attributes.set(key, value);
    this.modifiedAt = Date.now();
  }

  /**
   * Check if WME has an attribute
   */
  hasAttribute(key: string): boolean {
    return this.attributes.has(key);
  }

  /**
   * Check if WME matches a pattern
   */
  matches(pattern: Partial<Record<string, any>>): boolean {
    for (const [key, value] of Object.entries(pattern)) {
      const attrValue = this.attributes.get(key);

      // Exact match
      if (attrValue !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Clone this WME (creates a new WME with same attributes)
   */
  clone(): WME {
    return new WME(this.type, this.getAttributes());
  }

  /**
   * Export WME to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      type: this.type,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      attributes: this.getAttributes(),
    };
  }

  /**
   * Create WME from JSON
   */
  static fromJSON(data: any): WME {
    const wme = new WME(data.type, data.attributes);
    (wme as any).id = data.id;
    (wme as any).createdAt = data.createdAt;
    wme.modifiedAt = data.modifiedAt;
    return wme;
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    const attrs = Array.from(this.attributes.entries())
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(', ');
    return `WME[${this.type}](${attrs})`;
  }
}

/**
 * Typed WME factory - creates strongly-typed WMEs
 */
export class TypedWME<T extends Record<string, any>> extends WME {
  constructor(type: string, attributes: T) {
    super(type, attributes);
  }

  /**
   * Get typed attribute
   */
  getTypedAttribute<K extends keyof T>(key: K): T[K] {
    return this.getAttribute(key as string);
  }

  /**
   * Set typed attribute
   */
  setTypedAttribute<K extends keyof T>(key: K, value: T[K]): void {
    this.setAttribute(key as string, value);
  }

  /**
   * Get all attributes with type safety
   */
  getTypedAttributes(): T {
    return this.getAttributes() as T;
  }
}

// ===== Common WME Types =====

/**
 * Location WME - tracks entity location
 */
export interface LocationWMEAttributes {
  entity: string;
  location: string;
}

export class LocationWME extends TypedWME<LocationWMEAttributes> {
  constructor(entity: string, location: string) {
    super('Location', { entity, location });
  }

  getEntity(): string {
    return this.getTypedAttribute('entity');
  }

  getLocation(): string {
    return this.getTypedAttribute('location');
  }

  setLocation(location: string): void {
    this.setTypedAttribute('location', location);
  }
}

/**
 * State WME - tracks entity state
 */
export interface StateWMEAttributes {
  entity: string;
  state: string;
  value?: any;
}

export class StateWME extends TypedWME<StateWMEAttributes> {
  constructor(entity: string, state: string, value?: any) {
    super('State', { entity, state, value });
  }

  getEntity(): string {
    return this.getTypedAttribute('entity');
  }

  getState(): string {
    return this.getTypedAttribute('state');
  }

  getValue(): any {
    return this.getTypedAttribute('value');
  }

  setValue(value: any): void {
    this.setTypedAttribute('value', value);
  }
}

/**
 * Relation WME - tracks relationships between entities
 */
export interface RelationWMEAttributes {
  subject: string;
  relation: string;
  object: string;
  value?: any;
}

export class RelationWME extends TypedWME<RelationWMEAttributes> {
  constructor(subject: string, relation: string, object: string, value?: any) {
    super('Relation', { subject, relation, object, value });
  }

  getSubject(): string {
    return this.getTypedAttribute('subject');
  }

  getRelation(): string {
    return this.getTypedAttribute('relation');
  }

  getObject(): string {
    return this.getTypedAttribute('object');
  }

  getValue(): any {
    return this.getTypedAttribute('value');
  }

  setValue(value: any): void {
    this.setTypedAttribute('value', value);
  }
}

/**
 * Goal WME - tracks active goals
 */
export interface GoalWMEAttributes {
  entity: string;
  goal: string;
  priority: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  params?: Record<string, any>;
}

export class GoalWME extends TypedWME<GoalWMEAttributes> {
  constructor(
    entity: string,
    goal: string,
    priority: number = 50,
    params?: Record<string, any>
  ) {
    super('Goal', {
      entity,
      goal,
      priority,
      status: 'pending',
      params,
    });
  }

  getEntity(): string {
    return this.getTypedAttribute('entity');
  }

  getGoal(): string {
    return this.getTypedAttribute('goal');
  }

  getPriority(): number {
    return this.getTypedAttribute('priority');
  }

  getStatus(): 'pending' | 'active' | 'completed' | 'failed' {
    return this.getTypedAttribute('status');
  }

  setStatus(status: 'pending' | 'active' | 'completed' | 'failed'): void {
    this.setTypedAttribute('status', status);
  }

  getParams(): Record<string, any> | undefined {
    return this.getTypedAttribute('params');
  }
}

/**
 * Belief WME - tracks agent beliefs
 */
export interface BeliefWMEAttributes {
  entity: string;
  belief: string;
  confidence: number;
  value?: any;
}

export class BeliefWME extends TypedWME<BeliefWMEAttributes> {
  constructor(entity: string, belief: string, confidence: number = 1.0, value?: any) {
    super('Belief', { entity, belief, confidence, value });
  }

  getEntity(): string {
    return this.getTypedAttribute('entity');
  }

  getBelief(): string {
    return this.getTypedAttribute('belief');
  }

  getConfidence(): number {
    return this.getTypedAttribute('confidence');
  }

  setConfidence(confidence: number): void {
    this.setTypedAttribute('confidence', confidence);
  }

  getValue(): any {
    return this.getTypedAttribute('value');
  }

  setValue(value: any): void {
    this.setTypedAttribute('value', value);
  }
}

/**
 * Event WME - tracks discrete events
 */
export interface EventWMEAttributes {
  event: string;
  actor?: string;
  target?: string;
  data?: any;
}

export class EventWME extends TypedWME<EventWMEAttributes> {
  constructor(event: string, actor?: string, target?: string, data?: any) {
    super('Event', { event, actor, target, data });
  }

  getEvent(): string {
    return this.getTypedAttribute('event');
  }

  getActor(): string | undefined {
    return this.getTypedAttribute('actor');
  }

  getTarget(): string | undefined {
    return this.getTypedAttribute('target');
  }

  getData(): any {
    return this.getTypedAttribute('data');
  }
}

/**
 * Inventory WME - tracks inventory contents
 */
export interface InventoryWMEAttributes {
  entity: string;
  item: string;
  quantity: number;
}

export class InventoryWME extends TypedWME<InventoryWMEAttributes> {
  constructor(entity: string, item: string, quantity: number = 1) {
    super('Inventory', { entity, item, quantity });
  }

  getEntity(): string {
    return this.getTypedAttribute('entity');
  }

  getItem(): string {
    return this.getTypedAttribute('item');
  }

  getQuantity(): number {
    return this.getTypedAttribute('quantity');
  }

  setQuantity(quantity: number): void {
    this.setTypedAttribute('quantity', quantity);
  }

  addQuantity(delta: number): void {
    this.setQuantity(this.getQuantity() + delta);
  }
}

/**
 * Sensory WME - tracks sensory perceptions
 */
export interface SensoryWMEAttributes {
  entity: string;
  sense: 'sight' | 'sound' | 'smell' | 'touch' | 'taste';
  stimulus: string;
  intensity: number;
}

export class SensoryWME extends TypedWME<SensoryWMEAttributes> {
  constructor(
    entity: string,
    sense: 'sight' | 'sound' | 'smell' | 'touch' | 'taste',
    stimulus: string,
    intensity: number = 1.0
  ) {
    super('Sensory', { entity, sense, stimulus, intensity });
  }

  getEntity(): string {
    return this.getTypedAttribute('entity');
  }

  getSense(): 'sight' | 'sound' | 'smell' | 'touch' | 'taste' {
    return this.getTypedAttribute('sense');
  }

  getStimulus(): string {
    return this.getTypedAttribute('stimulus');
  }

  getIntensity(): number {
    return this.getTypedAttribute('intensity');
  }
}

/**
 * Quest WME - tracks quest state
 */
export interface QuestWMEAttributes {
  questId: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  progress?: Record<string, any>;
}

export class QuestWME extends TypedWME<QuestWMEAttributes> {
  constructor(questId: string, status: 'available' | 'active' | 'completed' | 'failed' = 'available') {
    super('Quest', { questId, status });
  }

  getQuestId(): string {
    return this.getTypedAttribute('questId');
  }

  getStatus(): 'available' | 'active' | 'completed' | 'failed' {
    return this.getTypedAttribute('status');
  }

  setStatus(status: 'available' | 'active' | 'completed' | 'failed'): void {
    this.setTypedAttribute('status', status);
  }

  getProgress(): Record<string, any> | undefined {
    return this.getTypedAttribute('progress');
  }

  setProgress(progress: Record<string, any>): void {
    this.setTypedAttribute('progress', progress);
  }
}
