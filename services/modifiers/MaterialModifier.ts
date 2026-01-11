import materialsData from '../../data/modifiers/materials.json';

/**
 * Material information structure
 */
export interface MaterialInfo {
  name: string;
  density: number; // Relative to baseline (1.0 = normal)
  durability: number; // Hit points / structural integrity (0-200)
  value: number; // Economic value multiplier (1.0 = baseline)
  properties: {
    is_flammable?: boolean;
    is_magnetic?: boolean;
    is_conductive?: boolean;
    can_float?: boolean;
    is_transparent?: boolean;
    is_reflective?: boolean;
    is_magical?: boolean;
  };
  weightMultiplier: number; // How much heavier/lighter than baseline
  strengthMultiplier: number; // How much stronger/weaker
  resistance: {
    fire: number; // 0.0 = no resistance, 1.0 = immune
    water: number;
    physical: number;
    magic?: number;
  };
  category?: string; // metal, organic, magical_metal, etc.
  aliases?: string[];
}

/**
 * Material parse result
 */
export interface MaterialParseResult {
  success: boolean;
  material?: MaterialInfo;
  originalInput: string;
  resolvedName?: string;
  error?: string;
}

/**
 * Material query filters
 */
export interface MaterialQuery {
  category?: string;
  minDurability?: number;
  maxDurability?: number;
  minValue?: number;
  maxValue?: number;
  properties?: {
    is_flammable?: boolean;
    is_magnetic?: boolean;
    is_conductive?: boolean;
    can_float?: boolean;
    is_transparent?: boolean;
    is_reflective?: boolean;
    is_magical?: boolean;
  };
  minFireResistance?: number;
  minWaterResistance?: number;
  minPhysicalResistance?: number;
}

/**
 * MaterialModifier - Handles material properties for objects
 *
 * Features:
 * - 20+ materials from common to magical
 * - Material aliases (e.g., "steel" vs "metallic")
 * - Property application (density, durability, value)
 * - Resistance calculations (fire, water, physical, magic)
 * - Material queries by category and properties
 *
 * Examples:
 *   "wooden door" -> flammable, can float, 30 durability
 *   "steel sword" -> durable (90), heavy (7.8x), strong (1.5x)
 *   "glass bottle" -> transparent, fragile (20), light (2.5x)
 *   "mythril armor" -> magical, extremely durable (120), lightweight (3.0x)
 */
export class MaterialModifier {
  private materials: Map<string, MaterialInfo>;
  private aliasMap: Map<string, string>;

  constructor() {
    this.materials = new Map();
    this.aliasMap = new Map();
    this.loadMaterials();
  }

  /**
   * Load materials from JSON data
   */
  private loadMaterials(): void {
    const data = materialsData as { materials: Record<string, MaterialInfo> };

    for (const [name, materialData] of Object.entries(data.materials)) {
      const material: MaterialInfo = {
        ...materialData,
        name
      };

      this.materials.set(name, material);

      // Build alias map
      if (material.aliases) {
        for (const alias of material.aliases) {
          this.aliasMap.set(alias.toLowerCase(), name);
        }
      }
    }
  }

  /**
   * Parse a material string (name or alias)
   */
  parse(materialString: string): MaterialParseResult {
    const normalized = materialString.toLowerCase().trim();

    // Try direct name match
    if (this.materials.has(normalized)) {
      return {
        success: true,
        material: this.materials.get(normalized)!,
        originalInput: materialString,
        resolvedName: normalized
      };
    }

    // Try alias resolution
    const resolvedName = this.aliasMap.get(normalized);
    if (resolvedName && this.materials.has(resolvedName)) {
      return {
        success: true,
        material: this.materials.get(resolvedName)!,
        originalInput: materialString,
        resolvedName
      };
    }

    return {
      success: false,
      originalInput: materialString,
      error: `Unknown material: ${materialString}`
    };
  }

  /**
   * Check if a string is a valid material name or alias
   */
  isValidMaterial(materialString: string): boolean {
    const normalized = materialString.toLowerCase().trim();
    return this.materials.has(normalized) || this.aliasMap.has(normalized);
  }

  /**
   * Get material info by name or alias
   */
  getMaterial(materialString: string): MaterialInfo | null {
    const parseResult = this.parse(materialString);
    return parseResult.success ? parseResult.material! : null;
  }

  /**
   * Apply material properties to object properties
   */
  applyMaterialToProperties(properties: any, materialName: string): any {
    const parseResult = this.parse(materialName);

    if (!parseResult.success || !parseResult.material) {
      return properties;
    }

    const material = parseResult.material;
    const modified = { ...properties };

    // Apply weight multiplier
    if (modified.weight !== undefined) {
      modified.weight = modified.weight * material.weightMultiplier;
    }

    // Apply durability
    modified.durability = material.durability;
    modified.max_durability = material.durability;

    // Apply value multiplier
    if (modified.value !== undefined) {
      modified.value = modified.value * material.value;
    } else {
      modified.value = material.value * 10; // Default base value
    }

    // Apply strength multiplier to damage
    if (modified.damage !== undefined) {
      modified.damage = modified.damage * material.strengthMultiplier;
    }

    // Apply material properties
    for (const [prop, value] of Object.entries(material.properties)) {
      modified[prop] = value;
    }

    // Apply resistance values
    modified.resistance = {
      ...(modified.resistance || {}),
      ...material.resistance
    };

    // Add material traits
    if (!modified.traits) {
      modified.traits = [];
    }

    modified.traits.push(`material_${material.name}`);

    if (material.category) {
      modified.traits.push(`material_category_${material.category}`);
    }

    // Add property-based traits
    if (material.properties.is_flammable) {
      modified.traits.push('flammable');
    }
    if (material.properties.is_magnetic) {
      modified.traits.push('magnetic');
    }
    if (material.properties.is_conductive) {
      modified.traits.push('conductive');
    }
    if (material.properties.can_float) {
      modified.traits.push('floats');
    }
    if (material.properties.is_transparent) {
      modified.traits.push('transparent');
    }
    if (material.properties.is_reflective) {
      modified.traits.push('reflective');
    }
    if (material.properties.is_magical) {
      modified.traits.push('magical');
    }

    // Add resistance-based traits
    if (material.resistance.fire >= 0.8) {
      modified.traits.push('fire_resistant');
    }
    if (material.resistance.water >= 0.8) {
      modified.traits.push('waterproof');
    }
    if (material.resistance.physical >= 0.8) {
      modified.traits.push('heavily_armored');
    }

    return modified;
  }

  /**
   * Get all materials matching a query
   */
  queryMaterials(query: MaterialQuery): MaterialInfo[] {
    const results: MaterialInfo[] = [];

    for (const material of this.materials.values()) {
      // Category filter
      if (query.category && material.category !== query.category) {
        continue;
      }

      // Durability filters
      if (query.minDurability !== undefined && material.durability < query.minDurability) {
        continue;
      }
      if (query.maxDurability !== undefined && material.durability > query.maxDurability) {
        continue;
      }

      // Value filters
      if (query.minValue !== undefined && material.value < query.minValue) {
        continue;
      }
      if (query.maxValue !== undefined && material.value > query.maxValue) {
        continue;
      }

      // Property filters
      if (query.properties) {
        let propertyMatch = true;
        for (const [prop, requiredValue] of Object.entries(query.properties)) {
          if (material.properties[prop as keyof typeof material.properties] !== requiredValue) {
            propertyMatch = false;
            break;
          }
        }
        if (!propertyMatch) {
          continue;
        }
      }

      // Resistance filters
      if (query.minFireResistance !== undefined && material.resistance.fire < query.minFireResistance) {
        continue;
      }
      if (query.minWaterResistance !== undefined && material.resistance.water < query.minWaterResistance) {
        continue;
      }
      if (query.minPhysicalResistance !== undefined && material.resistance.physical < query.minPhysicalResistance) {
        continue;
      }

      results.push(material);
    }

    return results;
  }

  /**
   * Get all materials in a category
   */
  getMaterialsByCategory(category: string): MaterialInfo[] {
    return this.queryMaterials({ category });
  }

  /**
   * Get materials with specific property
   */
  getMaterialsWithProperty(property: keyof MaterialInfo['properties']): MaterialInfo[] {
    const results: MaterialInfo[] = [];

    for (const material of this.materials.values()) {
      if (material.properties[property] === true) {
        results.push(material);
      }
    }

    return results;
  }

  /**
   * Get strongest materials (by durability)
   */
  getStrongestMaterials(limit: number = 5): MaterialInfo[] {
    return Array.from(this.materials.values())
      .sort((a, b) => b.durability - a.durability)
      .slice(0, limit);
  }

  /**
   * Get lightest materials (by weight multiplier)
   */
  getLightestMaterials(limit: number = 5): MaterialInfo[] {
    return Array.from(this.materials.values())
      .sort((a, b) => a.weightMultiplier - b.weightMultiplier)
      .slice(0, limit);
  }

  /**
   * Get heaviest materials (by weight multiplier)
   */
  getHeaviestMaterials(limit: number = 5): MaterialInfo[] {
    return Array.from(this.materials.values())
      .sort((a, b) => b.weightMultiplier - a.weightMultiplier)
      .slice(0, limit);
  }

  /**
   * Get most valuable materials
   */
  getMostValuableMaterials(limit: number = 5): MaterialInfo[] {
    return Array.from(this.materials.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  /**
   * Get materials most resistant to a damage type
   */
  getMostResistantMaterials(
    damageType: 'fire' | 'water' | 'physical' | 'magic',
    limit: number = 5
  ): MaterialInfo[] {
    return Array.from(this.materials.values())
      .sort((a, b) => {
        const aResist = a.resistance[damageType] || 0;
        const bResist = b.resistance[damageType] || 0;
        return bResist - aResist;
      })
      .slice(0, limit);
  }

  /**
   * Compare two materials
   */
  compareMaterials(material1Name: string, material2Name: string): {
    material1: MaterialInfo;
    material2: MaterialInfo;
    comparison: {
      durability: 'material1' | 'material2' | 'equal';
      weight: 'material1' | 'material2' | 'equal';
      value: 'material1' | 'material2' | 'equal';
      strength: 'material1' | 'material2' | 'equal';
    };
  } | null {
    const mat1 = this.getMaterial(material1Name);
    const mat2 = this.getMaterial(material2Name);

    if (!mat1 || !mat2) {
      return null;
    }

    const comparison = {
      durability: mat1.durability > mat2.durability ? 'material1' as const :
                   mat1.durability < mat2.durability ? 'material2' as const : 'equal' as const,
      weight: mat1.weightMultiplier > mat2.weightMultiplier ? 'material1' as const :
              mat1.weightMultiplier < mat2.weightMultiplier ? 'material2' as const : 'equal' as const,
      value: mat1.value > mat2.value ? 'material1' as const :
             mat1.value < mat2.value ? 'material2' as const : 'equal' as const,
      strength: mat1.strengthMultiplier > mat2.strengthMultiplier ? 'material1' as const :
                mat1.strengthMultiplier < mat2.strengthMultiplier ? 'material2' as const : 'equal' as const
    };

    return {
      material1: mat1,
      material2: mat2,
      comparison
    };
  }

  /**
   * Get all material names
   */
  getAllMaterialNames(): string[] {
    return Array.from(this.materials.keys());
  }

  /**
   * Get all material categories
   */
  getAllCategories(): string[] {
    const categories = new Set<string>();
    for (const material of this.materials.values()) {
      if (material.category) {
        categories.add(material.category);
      }
    }
    return Array.from(categories);
  }

  /**
   * Calculate effective durability after applying damage with resistance
   */
  calculateEffectiveDurability(
    materialName: string,
    baseDamage: number,
    damageType: 'fire' | 'water' | 'physical' | 'magic'
  ): number {
    const material = this.getMaterial(materialName);
    if (!material) {
      return baseDamage;
    }

    const resistance = material.resistance[damageType] || 0;
    const effectiveDamage = baseDamage * (1 - resistance);

    return material.durability - effectiveDamage;
  }

  /**
   * Check if material is weak against damage type
   */
  isWeakAgainst(
    materialName: string,
    damageType: 'fire' | 'water' | 'physical' | 'magic'
  ): boolean {
    const material = this.getMaterial(materialName);
    if (!material) {
      return false;
    }

    const resistance = material.resistance[damageType] || 0;
    return resistance < 0.3; // Less than 30% resistance = weak
  }

  /**
   * Check if material is strong against damage type
   */
  isStrongAgainst(
    materialName: string,
    damageType: 'fire' | 'water' | 'physical' | 'magic'
  ): boolean {
    const material = this.getMaterial(materialName);
    if (!material) {
      return false;
    }

    const resistance = material.resistance[damageType] || 0;
    return resistance >= 0.7; // 70%+ resistance = strong
  }

  /**
   * Get material weaknesses (damage types with low resistance)
   */
  getMaterialWeaknesses(materialName: string): Array<'fire' | 'water' | 'physical' | 'magic'> {
    const material = this.getMaterial(materialName);
    if (!material) {
      return [];
    }

    const weaknesses: Array<'fire' | 'water' | 'physical' | 'magic'> = [];
    const damageTypes: Array<'fire' | 'water' | 'physical' | 'magic'> = ['fire', 'water', 'physical', 'magic'];

    for (const damageType of damageTypes) {
      if (this.isWeakAgainst(materialName, damageType)) {
        weaknesses.push(damageType);
      }
    }

    return weaknesses;
  }

  /**
   * Get material strengths (damage types with high resistance)
   */
  getMaterialStrengths(materialName: string): Array<'fire' | 'water' | 'physical' | 'magic'> {
    const material = this.getMaterial(materialName);
    if (!material) {
      return [];
    }

    const strengths: Array<'fire' | 'water' | 'physical' | 'magic'> = [];
    const damageTypes: Array<'fire' | 'water' | 'physical' | 'magic'> = ['fire', 'water', 'physical', 'magic'];

    for (const damageType of damageTypes) {
      if (this.isStrongAgainst(materialName, damageType)) {
        strengths.push(damageType);
      }
    }

    return strengths;
  }
}
