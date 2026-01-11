import { ObjectProperties } from '../community/ObjectSystem';
import { ColorModifier } from './ColorModifier';
import { ScaleModifier } from './ScaleModifier';
import { MaterialModifier } from './MaterialModifier';

/**
 * Modifier application result
 */
export interface ModifierResult {
  applied: boolean;
  modifierType: 'color' | 'scale' | 'material' | 'quality' | 'state' | 'unknown';
  adjective: string;
  conflicts?: string[]; // Adjectives that conflicted with this one
}

/**
 * Property composition summary
 */
export interface CompositionSummary {
  originalProperties: ObjectProperties;
  finalProperties: ObjectProperties;
  appliedModifiers: ModifierResult[];
  conflicts: Array<{
    type: string;
    adjectives: string[];
    resolution: string;
  }>;
  warnings: string[];
}

/**
 * Conflict resolution strategy
 */
export enum ConflictResolution {
  LAST_WINS = 'last_wins',        // Last adjective takes precedence
  FIRST_WINS = 'first_wins',      // First adjective takes precedence
  ACCUMULATE = 'accumulate',      // Both adjectives contribute (multiply effects)
  AVERAGE = 'average',            // Average the effects
  MAX = 'max',                    // Take maximum value
  MIN = 'min'                     // Take minimum value
}

/**
 * PropertyCompositor - Handles combination of multiple property modifiers
 *
 * Features:
 * - Applies modifiers in correct order (color → scale → material → quality → state)
 * - Detects and resolves conflicts between modifiers
 * - Tracks what modifications were applied
 * - Provides composition summary for debugging
 * - Configurable conflict resolution strategies
 *
 * Examples:
 *   "big heavy iron door" → size + weight + material all compound correctly
 *   "tiny huge door" → size conflict resolved (last wins: huge)
 *   "red blue door" → colors accumulate as traits
 *   "wooden steel sword" → materials conflict (last wins: steel)
 */
export class PropertyCompositor {
  private colorModifier: ColorModifier;
  private scaleModifier: ScaleModifier;
  private materialModifier: MaterialModifier;

  // Conflict resolution strategies by property type
  private conflictStrategies: Map<string, ConflictResolution>;

  // Track applied modifiers by type
  private appliedColors: string[] = [];
  private appliedScales: string[] = [];
  private appliedMaterials: string[] = [];

  constructor(
    colorModifier: ColorModifier,
    scaleModifier: ScaleModifier,
    materialModifier: MaterialModifier
  ) {
    this.colorModifier = colorModifier;
    this.scaleModifier = scaleModifier;
    this.materialModifier = materialModifier;

    // Set default conflict resolution strategies
    this.conflictStrategies = new Map([
      ['color', ConflictResolution.ACCUMULATE],      // Multiple colors = all traits added
      ['scale', ConflictResolution.LAST_WINS],       // Size conflicts = last wins
      ['material', ConflictResolution.LAST_WINS],    // Material conflicts = last wins
      ['weight', ConflictResolution.ACCUMULATE],     // Weight modifiers multiply
      ['damage', ConflictResolution.ACCUMULATE],     // Damage modifiers multiply
      ['boolean', ConflictResolution.LAST_WINS]      // Boolean states = last wins
    ]);
  }

  /**
   * Set conflict resolution strategy for a property type
   */
  setConflictStrategy(propertyType: string, strategy: ConflictResolution): void {
    this.conflictStrategies.set(propertyType, strategy);
  }

  /**
   * Compose properties from base properties and adjectives
   */
  composeProperties(
    baseProperties: ObjectProperties,
    adjectives: string[]
  ): CompositionSummary {
    // Reset tracking
    this.appliedColors = [];
    this.appliedScales = [];
    this.appliedMaterials = [];

    const originalProperties = { ...baseProperties };
    let currentProperties = { ...baseProperties };
    const appliedModifiers: ModifierResult[] = [];
    const conflicts: CompositionSummary['conflicts'] = [];
    const warnings: string[] = [];

    // Phase 1: Apply color modifiers
    for (const adj of adjectives) {
      if (this.colorModifier.isValidColor(adj)) {
        const result = this.applyColorModifier(currentProperties, adj);
        appliedModifiers.push(result);
      }
    }

    // Check for color conflicts (multiple colors)
    if (this.appliedColors.length > 1) {
      conflicts.push({
        type: 'color',
        adjectives: this.appliedColors,
        resolution: 'All colors accumulated as traits'
      });
    }

    // Phase 2: Apply scale modifiers
    for (const adj of adjectives) {
      if (this.scaleModifier.isValidScale(adj)) {
        const result = this.applyScaleModifier(currentProperties, adj);
        appliedModifiers.push(result);
      }
    }

    // Check for scale conflicts
    if (this.appliedScales.length > 1) {
      conflicts.push({
        type: 'scale',
        adjectives: this.appliedScales,
        resolution: `Last scale wins: ${this.appliedScales[this.appliedScales.length - 1]}`
      });
    }

    // Phase 3: Apply material modifiers
    for (const adj of adjectives) {
      if (this.materialModifier.isValidMaterial(adj)) {
        const result = this.applyMaterialModifier(currentProperties, adj);
        appliedModifiers.push(result);
      }
    }

    // Check for material conflicts
    if (this.appliedMaterials.length > 1) {
      conflicts.push({
        type: 'material',
        adjectives: this.appliedMaterials,
        resolution: `Last material wins: ${this.appliedMaterials[this.appliedMaterials.length - 1]}`
      });
      warnings.push(
        `Multiple materials detected (${this.appliedMaterials.join(', ')}). ` +
        `Using ${this.appliedMaterials[this.appliedMaterials.length - 1]} as primary material.`
      );
    }

    // Phase 4: Apply quality modifiers (sharp, heavy, etc.)
    for (const adj of adjectives) {
      const result = this.applyQualityModifier(currentProperties, adj);
      if (result.applied) {
        appliedModifiers.push(result);
      }
    }

    // Phase 5: Apply state modifiers (open, locked, broken, etc.)
    for (const adj of adjectives) {
      const result = this.applyStateModifier(currentProperties, adj);
      if (result.applied) {
        appliedModifiers.push(result);
      }
    }

    // Validate final properties
    this.validateProperties(currentProperties, warnings);

    return {
      originalProperties,
      finalProperties: currentProperties,
      appliedModifiers,
      conflicts,
      warnings
    };
  }

  /**
   * Apply color modifier
   */
  private applyColorModifier(properties: ObjectProperties, color: string): ModifierResult {
    this.colorModifier.applyColorToProperties(properties, color);
    this.appliedColors.push(color);

    return {
      applied: true,
      modifierType: 'color',
      adjective: color,
      conflicts: this.appliedColors.length > 1 ? this.appliedColors.slice(0, -1) : undefined
    };
  }

  /**
   * Apply scale modifier
   */
  private applyScaleModifier(properties: ObjectProperties, scale: string): ModifierResult {
    // If there's already a scale applied, this is a conflict
    const hadPreviousScale = this.appliedScales.length > 0;

    this.scaleModifier.applyScaleToProperties(properties, scale);
    this.appliedScales.push(scale);

    return {
      applied: true,
      modifierType: 'scale',
      adjective: scale,
      conflicts: hadPreviousScale ? this.appliedScales.slice(0, -1) : undefined
    };
  }

  /**
   * Apply material modifier
   */
  private applyMaterialModifier(properties: ObjectProperties, material: string): ModifierResult {
    // If there's already a material applied, this is a conflict
    const hadPreviousMaterial = this.appliedMaterials.length > 0;

    this.materialModifier.applyMaterialToProperties(properties, material);
    this.appliedMaterials.push(material);

    return {
      applied: true,
      modifierType: 'material',
      adjective: material,
      conflicts: hadPreviousMaterial ? this.appliedMaterials.slice(0, -1) : undefined
    };
  }

  /**
   * Apply quality modifiers (sharp, heavy, light, etc.)
   */
  private applyQualityModifier(properties: ObjectProperties, quality: string): ModifierResult {
    const lowerQuality = quality.toLowerCase();

    // Already handled by specialized modifiers
    if (this.colorModifier.isValidColor(lowerQuality) ||
        this.scaleModifier.isValidScale(lowerQuality) ||
        this.materialModifier.isValidMaterial(lowerQuality)) {
      return { applied: false, modifierType: 'quality', adjective: quality };
    }

    let applied = false;

    // Sharp modifier
    if (lowerQuality === 'sharp') {
      properties.is_sharp = true;
      if (properties.damage !== undefined) {
        properties.damage *= 1.3;
      }
      applied = true;
    }

    // Dull modifier (opposite of sharp)
    if (lowerQuality === 'dull') {
      properties.is_sharp = false;
      if (properties.damage !== undefined) {
        properties.damage *= 0.7;
      }
      applied = true;
    }

    // Heavy modifier (if not already handled by scale/material)
    if (lowerQuality === 'heavy') {
      properties.is_heavy = true;
      if (properties.weight !== undefined) {
        properties.weight *= 2;
      }
      applied = true;
    }

    // Light modifier (if not already handled by scale/material)
    if (lowerQuality === 'light' || lowerQuality === 'lightweight') {
      properties.is_heavy = false;
      if (properties.weight !== undefined) {
        properties.weight *= 0.5;
      }
      applied = true;
    }

    // Hot/burning modifier
    if (lowerQuality === 'hot' || lowerQuality === 'burning') {
      properties.is_hot = true;
      properties.is_lit = true;
      applied = true;
    }

    // Cold/frozen modifier
    if (lowerQuality === 'cold' || lowerQuality === 'frozen' || lowerQuality === 'icy') {
      properties.is_cold = true;
      applied = true;
    }

    // Magical/enchanted modifier
    if (lowerQuality === 'magical' || lowerQuality === 'enchanted') {
      if (!properties.traits) properties.traits = [];
      properties.traits.push('magical');
      if (properties.damage !== undefined) {
        properties.damage *= 1.5;
      }
      applied = true;
    }

    // Cursed modifier
    if (lowerQuality === 'cursed') {
      if (!properties.traits) properties.traits = [];
      properties.traits.push('cursed');
      applied = true;
    }

    // Blessed modifier
    if (lowerQuality === 'blessed') {
      if (!properties.traits) properties.traits = [];
      properties.traits.push('blessed');
      applied = true;
    }

    // Rusty/old modifier
    if (lowerQuality === 'rusty' || lowerQuality === 'old') {
      if (!properties.traits) properties.traits = [];
      properties.traits.push('rusty');
      if (properties.damage !== undefined) {
        properties.damage *= 0.8;
      }
      applied = true;
    }

    // Shiny/new modifier
    if (lowerQuality === 'shiny' || lowerQuality === 'new' || lowerQuality === 'polished') {
      if (!properties.traits) properties.traits = [];
      properties.traits.push('shiny');
      applied = true;
    }

    // Powerful modifier
    if (lowerQuality === 'powerful' || lowerQuality === 'mighty') {
      if (properties.damage !== undefined) {
        properties.damage *= 1.5;
      }
      applied = true;
    }

    // Weak modifier
    if (lowerQuality === 'weak' || lowerQuality === 'feeble') {
      if (properties.damage !== undefined) {
        properties.damage *= 0.5;
      }
      applied = true;
    }

    return {
      applied,
      modifierType: 'quality',
      adjective: quality
    };
  }

  /**
   * Apply state modifiers (open, locked, broken, etc.)
   */
  private applyStateModifier(properties: ObjectProperties, state: string): ModifierResult {
    const lowerState = state.toLowerCase();
    let applied = false;

    // Open state
    if (lowerState === 'open' || lowerState === 'opened') {
      properties.is_open = true;
      properties.can_be_opened = true;
      applied = true;
    }

    // Closed state
    if (lowerState === 'closed' || lowerState === 'shut') {
      properties.is_open = false;
      properties.can_be_opened = true;
      applied = true;
    }

    // Locked state
    if (lowerState === 'locked') {
      properties.is_locked = true;
      properties.can_be_locked = true;
      properties.is_open = false; // Locked implies closed
      applied = true;
    }

    // Unlocked state
    if (lowerState === 'unlocked') {
      properties.is_locked = false;
      properties.can_be_locked = true;
      applied = true;
    }

    // Broken state
    if (lowerState === 'broken' || lowerState === 'damaged') {
      properties.is_broken = true;
      applied = true;
    }

    // Lit state
    if (lowerState === 'lit' || lowerState === 'illuminated') {
      properties.is_lit = true;
      applied = true;
    }

    // Unlit/extinguished state
    if (lowerState === 'unlit' || lowerState === 'extinguished' || lowerState === 'dark') {
      properties.is_lit = false;
      applied = true;
    }

    return {
      applied,
      modifierType: 'state',
      adjective: state
    };
  }

  /**
   * Validate final properties and add warnings for inconsistencies
   */
  private validateProperties(properties: ObjectProperties, warnings: string[]): void {
    // Check for logical inconsistencies

    // Can't be both hot and cold
    if (properties.is_hot && properties.is_cold) {
      warnings.push('Object has both hot and cold properties. Cold takes precedence.');
      properties.is_hot = false;
    }

    // Can't be open and locked
    if (properties.is_open && properties.is_locked) {
      warnings.push('Object cannot be both open and locked. Setting to closed and locked.');
      properties.is_open = false;
    }

    // Heavy objects can't be held (in most cases)
    if (properties.is_heavy && properties.can_be_held) {
      warnings.push('Heavy objects typically cannot be held. Consider if this is intentional.');
    }

    // Flammable + hot = problem
    if (properties.is_flammable && properties.is_hot) {
      warnings.push('Flammable object is hot - it may catch fire!');
      if (!properties.traits) properties.traits = [];
      properties.traits.push('on_fire');
    }

    // Validate weight
    if (properties.weight !== undefined && properties.weight < 0) {
      warnings.push('Object has negative weight. Setting to 0.1.');
      properties.weight = 0.1;
    }

    // Validate damage
    if (properties.damage !== undefined && properties.damage < 0) {
      warnings.push('Object has negative damage. Setting to 0.');
      properties.damage = 0;
    }
  }

  /**
   * Get a summary of what would happen with given adjectives (dry run)
   */
  previewComposition(
    baseProperties: ObjectProperties,
    adjectives: string[]
  ): {
    colors: string[];
    scales: string[];
    materials: string[];
    qualities: string[];
    states: string[];
    potentialConflicts: string[];
  } {
    const colors: string[] = [];
    const scales: string[] = [];
    const materials: string[] = [];
    const qualities: string[] = [];
    const states: string[] = [];
    const potentialConflicts: string[] = [];

    for (const adj of adjectives) {
      if (this.colorModifier.isValidColor(adj)) {
        colors.push(adj);
      } else if (this.scaleModifier.isValidScale(adj)) {
        scales.push(adj);
      } else if (this.materialModifier.isValidMaterial(adj)) {
        materials.push(adj);
      } else if (this.isQualityModifier(adj)) {
        qualities.push(adj);
      } else if (this.isStateModifier(adj)) {
        states.push(adj);
      }
    }

    // Check for conflicts
    if (colors.length > 1) {
      potentialConflicts.push(`Multiple colors: ${colors.join(', ')}`);
    }
    if (scales.length > 1) {
      potentialConflicts.push(`Multiple scales: ${scales.join(', ')} - last wins`);
    }
    if (materials.length > 1) {
      potentialConflicts.push(`Multiple materials: ${materials.join(', ')} - last wins`);
    }

    return { colors, scales, materials, qualities, states, potentialConflicts };
  }

  /**
   * Check if adjective is a quality modifier
   */
  private isQualityModifier(adj: string): boolean {
    const qualities = [
      'sharp', 'dull', 'heavy', 'light', 'lightweight', 'hot', 'burning', 'cold',
      'frozen', 'icy', 'magical', 'enchanted', 'cursed', 'blessed', 'rusty', 'old',
      'shiny', 'new', 'polished', 'powerful', 'mighty', 'weak', 'feeble'
    ];
    return qualities.includes(adj.toLowerCase());
  }

  /**
   * Check if adjective is a state modifier
   */
  private isStateModifier(adj: string): boolean {
    const states = [
      'open', 'opened', 'closed', 'shut', 'locked', 'unlocked', 'broken',
      'damaged', 'lit', 'illuminated', 'unlit', 'extinguished', 'dark'
    ];
    return states.includes(adj.toLowerCase());
  }
}
