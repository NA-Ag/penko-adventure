/**
 * SCRIBBLENAUTS PARITY 2.2: Scale Modifiers
 *
 * Handles size/scale properties for objects:
 * - 10 scale tiers from microscopic (0.01x) to astronomical (100x)
 * - Affects weight, strength, speed, damage, defense, health
 * - Smart property scaling based on physics principles
 * - Can't hold objects that are too large
 * - Large objects are automatically heavy
 *
 * Scale tiers:
 * 1. microscopic (0.01x)
 * 2. minuscule (0.05x)
 * 3. tiny (0.1x)
 * 4. small (0.5x)
 * 5. normal (1.0x)
 * 6. large (2.0x)
 * 7. huge (5.0x)
 * 8. gigantic (10.0x)
 * 9. titanic (50.0x)
 * 10. astronomical (100.0x)
 */

import scaleData from '../../data/modifiers/scales.json';
import { ObjectProperties } from '../../types/game.types';

/**
 * Scale information
 */
export interface ScaleInfo {
  name: string;
  tier: number; // 1-10
  multiplier: number; // Overall size multiplier
  weightMultiplier: number; // Weight scales with cube of size
  strengthMultiplier: number; // Strength/damage multiplier
  speedMultiplier: number; // Speed inversely scales with size
  aliases: string[];
  description: string;
  category: 'extreme_small' | 'small' | 'normal' | 'large' | 'extreme_large';
}

/**
 * Result of scale parsing
 */
export interface ScaleParseResult {
  scale?: ScaleInfo;
  isValid: boolean;
  originalInput: string;
  resolvedName?: string; // For aliases
}

/**
 * Scaling rules configuration
 */
export interface ScalingRules {
  damage: {
    formula: string;
    description: string;
  };
  defense: {
    formula: string;
    description: string;
  };
  speed: {
    formula: string;
    description: string;
  };
  weight: {
    formula: string;
    description: string;
  };
  health: {
    formula: string;
    description: string;
  };
  canBeHeld: {
    maxMultiplier: number;
    description: string;
  };
  isHeavy: {
    minMultiplier: number;
    description: string;
  };
}

/**
 * Scale modifier system
 */
export class ScaleModifier {
  private scales: Map<string, ScaleInfo> = new Map();
  private aliasMap: Map<string, string> = new Map(); // alias -> canonical name
  private rules: ScalingRules;

  constructor() {
    this.loadScales();
    this.rules = scaleData.scalingRules as ScalingRules;
  }

  /**
   * Load scales from JSON data
   */
  private loadScales(): void {
    const data = scaleData.scales as Record<string, any>;

    for (const [name, scaleDef] of Object.entries(data)) {
      const scale: ScaleInfo = {
        name,
        tier: scaleDef.tier,
        multiplier: scaleDef.multiplier,
        weightMultiplier: scaleDef.weightMultiplier,
        strengthMultiplier: scaleDef.strengthMultiplier,
        speedMultiplier: scaleDef.speedMultiplier,
        aliases: scaleDef.aliases || [],
        description: scaleDef.description,
        category: scaleDef.category
      };

      this.scales.set(name.toLowerCase(), scale);

      // Register aliases
      for (const alias of scale.aliases) {
        this.aliasMap.set(alias.toLowerCase(), name.toLowerCase());
      }
    }
  }

  /**
   * Parse a scale from string
   */
  parse(scaleString: string): ScaleParseResult {
    const normalized = scaleString.toLowerCase().trim();

    // Try direct name lookup
    if (this.scales.has(normalized)) {
      return {
        scale: this.scales.get(normalized)!,
        isValid: true,
        originalInput: scaleString,
        resolvedName: normalized
      };
    }

    // Try alias lookup
    if (this.aliasMap.has(normalized)) {
      const canonicalName = this.aliasMap.get(normalized)!;
      return {
        scale: this.scales.get(canonicalName)!,
        isValid: true,
        originalInput: scaleString,
        resolvedName: canonicalName
      };
    }

    // Scale not recognized
    return {
      isValid: false,
      originalInput: scaleString
    };
  }

  /**
   * Get scale by name
   */
  getScale(name: string): ScaleInfo | undefined {
    const result = this.parse(name);
    return result.isValid ? result.scale : undefined;
  }

  /**
   * Check if a scale name is valid
   */
  isValidScale(name: string): boolean {
    return this.parse(name).isValid;
  }

  /**
   * Get scales by category
   */
  getScalesByCategory(category: ScaleInfo['category']): ScaleInfo[] {
    return Array.from(this.scales.values()).filter(s => s.category === category);
  }

  /**
   * Get scales smaller than normal
   */
  getSmallScales(): ScaleInfo[] {
    return Array.from(this.scales.values())
      .filter(s => s.multiplier < 1.0)
      .sort((a, b) => b.multiplier - a.multiplier); // Descending
  }

  /**
   * Get scales larger than normal
   */
  getLargeScales(): ScaleInfo[] {
    return Array.from(this.scales.values())
      .filter(s => s.multiplier > 1.0)
      .sort((a, b) => a.multiplier - b.multiplier); // Ascending
  }

  /**
   * Get all scales sorted by tier
   */
  getAllScalesSorted(): ScaleInfo[] {
    return Array.from(this.scales.values()).sort((a, b) => a.tier - b.tier);
  }

  /**
   * Apply scale to object properties
   */
  applyScaleToProperties(properties: ObjectProperties, scaleName: string): ObjectProperties {
    const parsed = this.parse(scaleName);

    if (!parsed.isValid || !parsed.scale) {
      return properties;
    }

    const scale = parsed.scale;
    const modified = { ...properties };

    // Add scale trait
    if (!modified.traits) {
      modified.traits = [];
    }

    modified.traits.push(`scale_${scale.name}`);
    modified.traits.push(`scale_tier_${scale.tier}`);
    modified.traits.push(`scale_category_${scale.category}`);
    modified.traits.push(`scale_multiplier_${scale.multiplier}`);

    // Apply weight scaling
    if (modified.weight !== undefined) {
      modified.weight = this.applyWeightScaling(modified.weight, scale);
    } else {
      // Set default weight based on scale
      modified.weight = scale.weightMultiplier;
    }

    // Apply damage scaling (for weapons)
    if (modified.damage !== undefined) {
      modified.damage = this.applyDamageScaling(modified.damage, scale);
    }

    // Apply health scaling (for creatures)
    if (modified.health_restore !== undefined) {
      modified.health_restore = this.applyHealthScaling(modified.health_restore, scale);
    }

    // Determine if object can be held
    if (scale.multiplier > this.rules.canBeHeld.maxMultiplier) {
      modified.can_be_held = false;
      modified.traits.push('too_large_to_hold');
    }

    // Determine if object is heavy
    if (scale.multiplier >= this.rules.isHeavy.minMultiplier) {
      modified.is_heavy = true;
      modified.traits.push('heavy_due_to_scale');
    } else if (scale.multiplier < 0.5) {
      // Small objects are not heavy
      modified.is_heavy = false;
      modified.traits.push('light_due_to_scale');
    }

    return modified;
  }

  /**
   * Apply weight scaling
   * Weight scales with cube of size (volume)
   */
  private applyWeightScaling(baseWeight: number, scale: ScaleInfo): number {
    return baseWeight * scale.weightMultiplier;
  }

  /**
   * Apply damage scaling
   * Damage scales with both strength and size
   */
  private applyDamageScaling(baseDamage: number, scale: ScaleInfo): number {
    // Formula: base * (strengthMultiplier * 0.8 + multiplier * 0.2)
    const scaledDamage = baseDamage * (scale.strengthMultiplier * 0.8 + scale.multiplier * 0.2);
    return Math.round(scaledDamage);
  }

  /**
   * Apply health scaling
   * Health scales moderately with size
   */
  private applyHealthScaling(baseHealth: number, scale: ScaleInfo): number {
    // Formula: base * (multiplier * 0.7 + 1)
    const scaledHealth = baseHealth * (scale.multiplier * 0.7 + 1);
    return Math.round(scaledHealth);
  }

  /**
   * Calculate speed modifier from scale
   */
  getSpeedMultiplier(scaleName: string): number {
    const scale = this.getScale(scaleName);
    return scale ? scale.speedMultiplier : 1.0;
  }

  /**
   * Calculate defense modifier from scale
   * Defense scales linearly with size
   */
  getDefenseMultiplier(scaleName: string): number {
    const scale = this.getScale(scaleName);
    return scale ? scale.multiplier : 1.0;
  }

  /**
   * Compare two scales
   */
  compareScales(scale1Name: string, scale2Name: string): number {
    const s1 = this.getScale(scale1Name);
    const s2 = this.getScale(scale2Name);

    if (!s1 || !s2) return 0;

    return s1.multiplier - s2.multiplier;
  }

  /**
   * Get the relative size difference between two scales
   */
  getRelativeSize(scale1Name: string, scale2Name: string): string {
    const comparison = this.compareScales(scale1Name, scale2Name);

    if (comparison === 0) return 'same size';
    if (comparison > 0) {
      const ratio = (this.getScale(scale1Name)?.multiplier || 1) / (this.getScale(scale2Name)?.multiplier || 1);
      return `${ratio.toFixed(1)}x larger`;
    } else {
      const ratio = (this.getScale(scale2Name)?.multiplier || 1) / (this.getScale(scale1Name)?.multiplier || 1);
      return `${ratio.toFixed(1)}x smaller`;
    }
  }

  /**
   * Get all scale names (including aliases)
   */
  getAllScaleNames(): string[] {
    const names = Array.from(this.scales.keys());
    const aliases = Array.from(this.aliasMap.keys());
    return [...names, ...aliases].sort();
  }

  /**
   * Get total scale count
   */
  getScaleCount(): number {
    return this.scales.size;
  }

  /**
   * Find intermediate scale between two scales
   */
  getIntermediateScale(scale1Name: string, scale2Name: string): ScaleInfo | null {
    const s1 = this.getScale(scale1Name);
    const s2 = this.getScale(scale2Name);

    if (!s1 || !s2) return null;

    const avgMultiplier = (s1.multiplier + s2.multiplier) / 2;

    // Find the scale closest to average
    let closest: ScaleInfo | null = null;
    let minDiff = Infinity;

    for (const scale of this.scales.values()) {
      const diff = Math.abs(scale.multiplier - avgMultiplier);
      if (diff < minDiff) {
        minDiff = diff;
        closest = scale;
      }
    }

    return closest;
  }

  /**
   * Get next larger scale
   */
  getNextLargerScale(scaleName: string): ScaleInfo | null {
    const current = this.getScale(scaleName);
    if (!current) return null;

    const allScales = this.getAllScalesSorted();
    const currentIndex = allScales.findIndex(s => s.name === current.name);

    if (currentIndex === -1 || currentIndex === allScales.length - 1) {
      return null; // Already at max
    }

    return allScales[currentIndex + 1];
  }

  /**
   * Get next smaller scale
   */
  getNextSmallerScale(scaleName: string): ScaleInfo | null {
    const current = this.getScale(scaleName);
    if (!current) return null;

    const allScales = this.getAllScalesSorted();
    const currentIndex = allScales.findIndex(s => s.name === current.name);

    if (currentIndex === -1 || currentIndex === 0) {
      return null; // Already at min
    }

    return allScales[currentIndex - 1];
  }

  /**
   * Calculate volume ratio (for physics calculations)
   */
  getVolumeRatio(scaleName: string): number {
    const scale = this.getScale(scaleName);
    if (!scale) return 1.0;

    // Volume scales with cube of linear dimension
    return Math.pow(scale.multiplier, 3);
  }

  /**
   * Calculate surface area ratio (for physics calculations)
   */
  getSurfaceAreaRatio(scaleName: string): number {
    const scale = this.getScale(scaleName);
    if (!scale) return 1.0;

    // Surface area scales with square of linear dimension
    return Math.pow(scale.multiplier, 2);
  }

  /**
   * Get scaling rules
   */
  getScalingRules(): ScalingRules {
    return this.rules;
  }

  /**
   * Determine if object at this scale can fit through a doorway
   */
  canFitThroughDoor(scaleName: string, doorMultiplier: number = 2.0): boolean {
    const scale = this.getScale(scaleName);
    if (!scale) return true;

    return scale.multiplier <= doorMultiplier;
  }

  /**
   * Determine carrying capacity modifier for scaled creatures
   */
  getCarryingCapacityMultiplier(scaleName: string): number {
    const scale = this.getScale(scaleName);
    if (!scale) return 1.0;

    // Strength grows with cross-sectional area (square of size)
    // But weight grows with volume (cube of size)
    // So relative carrying capacity = strength / weight = size^2 / size^3 = 1/size
    // BUT we also want larger creatures to carry more in absolute terms
    // So we use strength multiplier directly
    return scale.strengthMultiplier;
  }
}
