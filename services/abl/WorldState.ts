/**
 * WorldState - FACADE 3.1
 *
 * Represents the current state of the game world.
 * Used by behaviors to check preconditions and success criteria.
 *
 * This is a simple key-value store with type-safe getters/setters.
 * In Facade, this would be the "working memory" that behaviors query.
 */

export type WorldStateValue = string | number | boolean | null | undefined | any;

export class WorldState {
  private state: Map<string, WorldStateValue> = new Map();
  private history: Array<{ key: string; oldValue: WorldStateValue; newValue: WorldStateValue; timestamp: number }> = [];

  /**
   * Set a world state value
   */
  set(key: string, value: WorldStateValue): void {
    const oldValue = this.state.get(key);

    // Record history for debugging and rollback
    if (oldValue !== value) {
      this.history.push({
        key,
        oldValue,
        newValue: value,
        timestamp: Date.now(),
      });
    }

    this.state.set(key, value);
  }

  /**
   * Get a world state value
   */
  get(key: string): WorldStateValue {
    return this.state.get(key);
  }

  /**
   * Get a value with a default if not found
   */
  getOrDefault<T extends WorldStateValue>(key: string, defaultValue: T): T {
    const value = this.state.get(key);
    return value !== undefined ? (value as T) : defaultValue;
  }

  /**
   * Check if a key exists
   */
  has(key: string): boolean {
    return this.state.has(key);
  }

  /**
   * Delete a key
   */
  delete(key: string): void {
    const oldValue = this.state.get(key);
    this.history.push({
      key,
      oldValue,
      newValue: undefined,
      timestamp: Date.now(),
    });
    this.state.delete(key);
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.state.clear();
    this.history = [];
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * Get all entries
   */
  entries(): Array<[string, WorldStateValue]> {
    return Array.from(this.state.entries());
  }

  /**
   * Get state as plain object (for debugging/serialization)
   */
  toObject(): Record<string, WorldStateValue> {
    const obj: Record<string, WorldStateValue> = {};
    for (const [key, value] of this.state.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Load state from plain object
   */
  fromObject(obj: Record<string, WorldStateValue>): void {
    this.clear();
    for (const [key, value] of Object.entries(obj)) {
      this.set(key, value);
    }
  }

  /**
   * Get recent history (for debugging)
   */
  getHistory(limit: number = 10): Array<{ key: string; oldValue: WorldStateValue; newValue: WorldStateValue; timestamp: number }> {
    return this.history.slice(-limit);
  }

  /**
   * Helper: Check if a value matches expected
   */
  matches(key: string, expected: WorldStateValue): boolean {
    return this.get(key) === expected;
  }

  /**
   * Helper: Check if a numeric value is greater than threshold
   */
  greaterThan(key: string, threshold: number): boolean {
    const value = this.get(key);
    return typeof value === 'number' && value > threshold;
  }

  /**
   * Helper: Check if a numeric value is less than threshold
   */
  lessThan(key: string, threshold: number): boolean {
    const value = this.get(key);
    return typeof value === 'number' && value < threshold;
  }

  /**
   * Helper: Check if a value is in a list
   */
  isOneOf(key: string, values: WorldStateValue[]): boolean {
    const value = this.get(key);
    return values.includes(value);
  }

  /**
   * Helper: Increment a numeric value
   */
  increment(key: string, amount: number = 1): void {
    const current = this.getOrDefault(key, 0) as number;
    this.set(key, current + amount);
  }

  /**
   * Helper: Decrement a numeric value
   */
  decrement(key: string, amount: number = 1): void {
    const current = this.getOrDefault(key, 0) as number;
    this.set(key, current - amount);
  }

  /**
   * Clone the world state
   */
  clone(): WorldState {
    const cloned = new WorldState();
    cloned.fromObject(this.toObject());
    return cloned;
  }
}
