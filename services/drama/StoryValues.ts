/**
 * StoryValues - FACADE 4.2
 *
 * Story values track the emotional and dramatic state of the narrative.
 * Based on Facade's story value system.
 *
 * Common story values:
 * - Tension: Suspense and conflict (0 = calm, 100 = extreme danger)
 * - Affinity: Relationship with NPCs (0 = hostile, 100 = close friends)
 * - Urgency: Time pressure (0 = relaxed, 100 = critical deadline)
 * - Mystery: Unknown elements (0 = everything clear, 100 = deeply mysterious)
 * - Romance: Romantic tension (0 = platonic, 100 = passionate)
 * - Humor: Comedic tone (0 = serious, 100 = hilarious)
 *
 * Story values guide beat selection and NPC behavior.
 */

/**
 * Standard story value definitions
 */
export enum StoryValueType {
  /** Suspense, conflict, danger */
  TENSION = 'tension',

  /** Player relationship with NPCs */
  AFFINITY = 'affinity',

  /** Time pressure, urgency */
  URGENCY = 'urgency',

  /** Unknown elements, intrigue */
  MYSTERY = 'mystery',

  /** Romantic tension */
  ROMANCE = 'romance',

  /** Comedic tone */
  HUMOR = 'humor',

  /** Player power/capability */
  COMPETENCE = 'competence',

  /** Player morality */
  MORALITY = 'morality',

  /** Story stakes/importance */
  STAKES = 'stakes',

  /** Pace of story */
  PACING = 'pacing',
}

/**
 * Story value metadata
 */
export interface StoryValueDefinition {
  /** Unique identifier */
  key: string;

  /** Display name */
  name: string;

  /** Description */
  description: string;

  /** Minimum value (default 0) */
  min: number;

  /** Maximum value (default 100) */
  max: number;

  /** Initial value */
  initialValue: number;

  /** Visual color for UI */
  color?: string;

  /** Category for grouping */
  category?: 'emotional' | 'relational' | 'narrative' | 'character';
}

/**
 * Story value change event
 */
export interface StoryValueChange {
  /** Value that changed */
  key: string;

  /** Previous value */
  oldValue: number;

  /** New value */
  newValue: number;

  /** Delta (change amount) */
  delta: number;

  /** Reason for change */
  reason: string;

  /** Timestamp */
  timestamp: number;
}

/**
 * Story value state
 */
export interface StoryValueState {
  /** Current value */
  value: number;

  /** History of changes */
  history: StoryValueChange[];

  /** Peak value ever reached */
  peak: number;

  /** Lowest value ever reached */
  trough: number;
}

/**
 * Standard story value definitions
 */
export const STANDARD_STORY_VALUES: Record<string, StoryValueDefinition> = {
  tension: {
    key: 'tension',
    name: 'Tension',
    description: 'Suspense, conflict, and danger level',
    min: 0,
    max: 100,
    initialValue: 10,
    color: '#ff4444',
    category: 'emotional',
  },

  affinity: {
    key: 'affinity',
    name: 'Affinity',
    description: 'Relationship quality with NPCs',
    min: 0,
    max: 100,
    initialValue: 50,
    color: '#44ff44',
    category: 'relational',
  },

  urgency: {
    key: 'urgency',
    name: 'Urgency',
    description: 'Time pressure and need for immediate action',
    min: 0,
    max: 100,
    initialValue: 0,
    color: '#ff8800',
    category: 'narrative',
  },

  mystery: {
    key: 'mystery',
    name: 'Mystery',
    description: 'Unknown elements and intrigue',
    min: 0,
    max: 100,
    initialValue: 20,
    color: '#8844ff',
    category: 'narrative',
  },

  romance: {
    key: 'romance',
    name: 'Romance',
    description: 'Romantic tension and attraction',
    min: 0,
    max: 100,
    initialValue: 0,
    color: '#ff44aa',
    category: 'emotional',
  },

  humor: {
    key: 'humor',
    name: 'Humor',
    description: 'Comedic tone and levity',
    min: 0,
    max: 100,
    initialValue: 30,
    color: '#ffff44',
    category: 'emotional',
  },

  competence: {
    key: 'competence',
    name: 'Competence',
    description: 'Player power and capability',
    min: 0,
    max: 100,
    initialValue: 40,
    color: '#4488ff',
    category: 'character',
  },

  morality: {
    key: 'morality',
    name: 'Morality',
    description: 'Player moral alignment (0=evil, 50=neutral, 100=good)',
    min: 0,
    max: 100,
    initialValue: 50,
    color: '#88ffff',
    category: 'character',
  },

  stakes: {
    key: 'stakes',
    name: 'Stakes',
    description: 'Importance and consequences of current situation',
    min: 0,
    max: 100,
    initialValue: 20,
    color: '#ff4488',
    category: 'narrative',
  },

  pacing: {
    key: 'pacing',
    name: 'Pacing',
    description: 'Speed of story progression (0=slow, 100=fast)',
    min: 0,
    max: 100,
    initialValue: 50,
    color: '#88ff88',
    category: 'narrative',
  },
};

/**
 * Story values manager
 */
export class StoryValuesManager {
  private values: Map<string, StoryValueState> = new Map();
  private definitions: Map<string, StoryValueDefinition> = new Map();

  constructor(definitions?: StoryValueDefinition[]) {
    // Load standard definitions
    for (const def of Object.values(STANDARD_STORY_VALUES)) {
      this.registerValue(def);
    }

    // Load custom definitions
    if (definitions) {
      for (const def of definitions) {
        this.registerValue(def);
      }
    }
  }

  /**
   * Register a story value definition
   */
  registerValue(definition: StoryValueDefinition): void {
    this.definitions.set(definition.key, definition);

    // Initialize state
    this.values.set(definition.key, {
      value: definition.initialValue,
      history: [],
      peak: definition.initialValue,
      trough: definition.initialValue,
    });
  }

  /**
   * Get story value
   */
  getValue(key: string): number {
    const state = this.values.get(key);
    return state?.value ?? 0;
  }

  /**
   * Set story value
   */
  setValue(key: string, value: number, reason: string = 'manual'): void {
    const def = this.definitions.get(key);
    if (!def) {
      console.warn(`[StoryValues] Unknown story value: ${key}`);
      return;
    }

    const state = this.values.get(key)!;
    const oldValue = state.value;

    // Clamp to min/max
    const newValue = Math.max(def.min, Math.min(def.max, value));

    // Update state
    state.value = newValue;
    state.peak = Math.max(state.peak, newValue);
    state.trough = Math.min(state.trough, newValue);

    // Record change
    const change: StoryValueChange = {
      key,
      oldValue,
      newValue,
      delta: newValue - oldValue,
      reason,
      timestamp: Date.now(),
    };

    state.history.push(change);

    console.log(
      `[StoryValues] ${def.name}: ${oldValue.toFixed(1)} → ${newValue.toFixed(1)} (${change.delta > 0 ? '+' : ''}${change.delta.toFixed(1)}) - ${reason}`
    );
  }

  /**
   * Modify story value by delta
   */
  modifyValue(key: string, delta: number, reason: string = 'modification'): void {
    const currentValue = this.getValue(key);
    this.setValue(key, currentValue + delta, reason);
  }

  /**
   * Get all current values
   */
  getAllValues(): Record<string, number> {
    const values: Record<string, number> = {};
    for (const [key, state] of this.values.entries()) {
      values[key] = state.value;
    }
    return values;
  }

  /**
   * Get story value state (with history)
   */
  getState(key: string): StoryValueState | undefined {
    return this.values.get(key);
  }

  /**
   * Get value definition
   */
  getDefinition(key: string): StoryValueDefinition | undefined {
    return this.definitions.get(key);
  }

  /**
   * Get recent changes (last N changes)
   */
  getRecentChanges(limit: number = 10): StoryValueChange[] {
    const allChanges: StoryValueChange[] = [];

    for (const state of this.values.values()) {
      allChanges.push(...state.history);
    }

    // Sort by timestamp (most recent first)
    allChanges.sort((a, b) => b.timestamp - a.timestamp);

    return allChanges.slice(0, limit);
  }

  /**
   * Get value trend (increasing, decreasing, stable)
   */
  getTrend(key: string, windowSize: number = 5): 'increasing' | 'decreasing' | 'stable' {
    const state = this.values.get(key);
    if (!state || state.history.length < 2) {
      return 'stable';
    }

    // Get recent changes
    const recentChanges = state.history.slice(-windowSize);
    const totalDelta = recentChanges.reduce((sum, change) => sum + change.delta, 0);

    if (Math.abs(totalDelta) < 5) {
      return 'stable';
    }

    return totalDelta > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Get values by category
   */
  getValuesByCategory(category: StoryValueDefinition['category']): Record<string, number> {
    const values: Record<string, number> = {};

    for (const [key, def] of this.definitions.entries()) {
      if (def.category === category) {
        values[key] = this.getValue(key);
      }
    }

    return values;
  }

  /**
   * Reset all values to initial
   */
  reset(): void {
    for (const [key, def] of this.definitions.entries()) {
      this.values.set(key, {
        value: def.initialValue,
        history: [],
        peak: def.initialValue,
        trough: def.initialValue,
      });
    }

    console.log('[StoryValues] Reset all values to initial');
  }

  /**
   * Export state for save/load
   */
  exportState(): {
    values: Record<string, number>;
    history: Record<string, StoryValueChange[]>;
  } {
    const values: Record<string, number> = {};
    const history: Record<string, StoryValueChange[]> = {};

    for (const [key, state] of this.values.entries()) {
      values[key] = state.value;
      history[key] = [...state.history];
    }

    return { values, history };
  }

  /**
   * Import state from save
   */
  importState(state: {
    values: Record<string, number>;
    history?: Record<string, StoryValueChange[]>;
  }): void {
    for (const [key, value] of Object.entries(state.values)) {
      const def = this.definitions.get(key);
      if (!def) continue;

      const valueState = this.values.get(key)!;
      valueState.value = value;

      if (state.history && state.history[key]) {
        valueState.history = [...state.history[key]];
      }
    }

    console.log('[StoryValues] State imported');
  }

  /**
   * Get summary report
   */
  getSummary(): string {
    const lines = ['=== Story Values Summary ===\n'];

    // Group by category
    const categories = new Map<string, Array<{ key: string; def: StoryValueDefinition; value: number }>>();

    for (const [key, def] of this.definitions.entries()) {
      const category = def.category || 'other';
      if (!categories.has(category)) {
        categories.set(category, []);
      }

      categories.get(category)!.push({
        key,
        def,
        value: this.getValue(key),
      });
    }

    // Print by category
    for (const [category, values] of categories.entries()) {
      lines.push(`${category.toUpperCase()}:`);

      for (const { def, value } of values) {
        const trend = this.getTrend(def.key);
        const trendSymbol = trend === 'increasing' ? '↑' : trend === 'decreasing' ? '↓' : '→';

        const bar = this.createBar(value, def.max);
        lines.push(`  ${def.name.padEnd(12)} ${bar} ${value.toFixed(1).padStart(5)}/${def.max} ${trendSymbol}`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Create visual bar for value
   */
  private createBar(value: number, max: number, width: number = 20): string {
    const filled = Math.round((value / max) * width);
    const empty = width - filled;

    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
  }
}

/**
 * Helper: Create story values from player action
 */
export function createActionEffects(
  action: 'help' | 'threaten' | 'joke' | 'flirt' | 'ignore' | 'betray'
): Array<{ key: string; delta: number; reason: string }> {
  switch (action) {
    case 'help':
      return [
        { key: 'affinity', delta: 15, reason: 'player helped NPC' },
        { key: 'tension', delta: -5, reason: 'conflict reduced' },
        { key: 'morality', delta: 10, reason: 'good deed' },
      ];

    case 'threaten':
      return [
        { key: 'tension', delta: 20, reason: 'player threatened NPC' },
        { key: 'affinity', delta: -20, reason: 'hostile action' },
        { key: 'morality', delta: -10, reason: 'evil deed' },
      ];

    case 'joke':
      return [
        { key: 'humor', delta: 15, reason: 'player made joke' },
        { key: 'tension', delta: -10, reason: 'levity added' },
        { key: 'affinity', delta: 5, reason: 'positive interaction' },
      ];

    case 'flirt':
      return [
        { key: 'romance', delta: 20, reason: 'player flirted' },
        { key: 'affinity', delta: 10, reason: 'romantic interest shown' },
      ];

    case 'ignore':
      return [
        { key: 'affinity', delta: -5, reason: 'player ignored NPC' },
      ];

    case 'betray':
      return [
        { key: 'affinity', delta: -40, reason: 'player betrayed NPC' },
        { key: 'tension', delta: 30, reason: 'betrayal causes conflict' },
        { key: 'morality', delta: -20, reason: 'evil deed' },
        { key: 'stakes', delta: 15, reason: 'consequences increased' },
      ];

    default:
      return [];
  }
}
