/**
 * SCRIBBLENAUTS PARITY 2.1: Color Modifiers
 *
 * Handles color properties for objects:
 * - Named colors (red, blue, crimson, azure, etc.)
 * - Hex colors (#FF0000)
 * - RGB colors (255, 0, 0)
 * - Color aliases (scarlet = red, golden = gold)
 * - Color properties (brightness, temperature, category)
 *
 * Future: Apply to visual representation
 */

import colorData from '../../data/modifiers/colors.json';
import { ObjectProperties } from '../../types/game.types';

/**
 * Color information
 */
export interface ColorInfo {
  name: string;
  hex: string;
  rgb: [number, number, number];
  category: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'metallic' | 'shade' | 'tint';
  aliases: string[];
  brightness: 'bright' | 'medium' | 'dark';
  temperature: 'warm' | 'cool' | 'neutral';
  baseColor?: string;
}

/**
 * Result of color parsing
 */
export interface ColorParseResult {
  color?: ColorInfo;
  isValid: boolean;
  originalInput: string;
  resolvedName?: string; // For aliases
}

/**
 * Color modifier system
 */
export class ColorModifier {
  private colors: Map<string, ColorInfo> = new Map();
  private aliasMap: Map<string, string> = new Map(); // alias -> canonical name

  constructor() {
    this.loadColors();
  }

  /**
   * Load colors from JSON data
   */
  private loadColors(): void {
    const data = colorData.colors as Record<string, any>;

    for (const [name, colorDef] of Object.entries(data)) {
      const color: ColorInfo = {
        name,
        hex: colorDef.hex,
        rgb: colorDef.rgb as [number, number, number],
        category: colorDef.category,
        aliases: colorDef.aliases || [],
        brightness: colorDef.brightness,
        temperature: colorDef.temperature,
        baseColor: colorDef.baseColor
      };

      this.colors.set(name.toLowerCase(), color);

      // Register aliases
      for (const alias of color.aliases) {
        this.aliasMap.set(alias.toLowerCase(), name.toLowerCase());
      }
    }
  }

  /**
   * Parse a color from string (name, hex, or rgb)
   */
  parse(colorString: string): ColorParseResult {
    const normalized = colorString.toLowerCase().trim();

    // Try direct name lookup
    if (this.colors.has(normalized)) {
      return {
        color: this.colors.get(normalized)!,
        isValid: true,
        originalInput: colorString,
        resolvedName: normalized
      };
    }

    // Try alias lookup
    if (this.aliasMap.has(normalized)) {
      const canonicalName = this.aliasMap.get(normalized)!;
      return {
        color: this.colors.get(canonicalName)!,
        isValid: true,
        originalInput: colorString,
        resolvedName: canonicalName
      };
    }

    // Try hex color parsing
    if (normalized.startsWith('#')) {
      const hexColor = this.parseHexColor(normalized);
      if (hexColor) {
        return {
          color: hexColor,
          isValid: true,
          originalInput: colorString,
          resolvedName: 'custom_hex'
        };
      }
    }

    // Try rgb parsing
    if (normalized.startsWith('rgb')) {
      const rgbColor = this.parseRgbColor(normalized);
      if (rgbColor) {
        return {
          color: rgbColor,
          isValid: true,
          originalInput: colorString,
          resolvedName: 'custom_rgb'
        };
      }
    }

    // Color not recognized
    return {
      isValid: false,
      originalInput: colorString
    };
  }

  /**
   * Parse hex color string
   */
  private parseHexColor(hex: string): ColorInfo | null {
    // Remove # if present
    const cleanHex = hex.replace('#', '');

    // Support 3-digit and 6-digit hex
    let fullHex = cleanHex;
    if (cleanHex.length === 3) {
      fullHex = cleanHex.split('').map(c => c + c).join('');
    }

    if (fullHex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
      return null;
    }

    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);

    return {
      name: `custom_${hex}`,
      hex: `#${fullHex.toUpperCase()}`,
      rgb: [r, g, b],
      category: 'neutral',
      aliases: [],
      brightness: this.calculateBrightness([r, g, b]),
      temperature: this.calculateTemperature([r, g, b])
    };
  }

  /**
   * Parse RGB color string
   */
  private parseRgbColor(rgb: string): ColorInfo | null {
    // Match rgb(r, g, b) or rgb r g b
    const match = rgb.match(/rgb\s*\(?\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*\)?/i);

    if (!match) {
      return null;
    }

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    if (r > 255 || g > 255 || b > 255 || r < 0 || g < 0 || b < 0) {
      return null;
    }

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();

    return {
      name: `custom_rgb`,
      hex,
      rgb: [r, g, b],
      category: 'neutral',
      aliases: [],
      brightness: this.calculateBrightness([r, g, b]),
      temperature: this.calculateTemperature([r, g, b])
    };
  }

  /**
   * Calculate brightness from RGB
   */
  private calculateBrightness(rgb: [number, number, number]): 'bright' | 'medium' | 'dark' {
    // Use perceived brightness formula
    const brightness = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

    if (brightness > 0.7) return 'bright';
    if (brightness > 0.3) return 'medium';
    return 'dark';
  }

  /**
   * Calculate temperature from RGB
   */
  private calculateTemperature(rgb: [number, number, number]): 'warm' | 'cool' | 'neutral' {
    const [r, g, b] = rgb;

    // Warm: more red/yellow
    // Cool: more blue/green
    const warmth = r - b;

    if (warmth > 50) return 'warm';
    if (warmth < -50) return 'cool';
    return 'neutral';
  }

  /**
   * Get color by name
   */
  getColor(name: string): ColorInfo | undefined {
    const result = this.parse(name);
    return result.isValid ? result.color : undefined;
  }

  /**
   * Check if a color name is valid
   */
  isValidColor(name: string): boolean {
    return this.parse(name).isValid;
  }

  /**
   * Get all colors in a category
   */
  getColorsByCategory(category: ColorInfo['category']): ColorInfo[] {
    return Array.from(this.colors.values()).filter(c => c.category === category);
  }

  /**
   * Get all warm colors
   */
  getWarmColors(): ColorInfo[] {
    return Array.from(this.colors.values()).filter(c => c.temperature === 'warm');
  }

  /**
   * Get all cool colors
   */
  getCoolColors(): ColorInfo[] {
    return Array.from(this.colors.values()).filter(c => c.temperature === 'cool');
  }

  /**
   * Get all bright colors
   */
  getBrightColors(): ColorInfo[] {
    return Array.from(this.colors.values()).filter(c => c.brightness === 'bright');
  }

  /**
   * Get all dark colors
   */
  getDarkColors(): ColorInfo[] {
    return Array.from(this.colors.values()).filter(c => c.brightness === 'dark');
  }

  /**
   * Find similar colors (based on hue/brightness/temperature)
   */
  findSimilarColors(colorName: string, maxResults: number = 5): ColorInfo[] {
    const parsed = this.parse(colorName);
    if (!parsed.isValid || !parsed.color) {
      return [];
    }

    const targetColor = parsed.color;
    const similar: Array<{ color: ColorInfo; score: number }> = [];

    for (const color of this.colors.values()) {
      if (color.name === targetColor.name) continue;

      let score = 0;

      // Same category = +3
      if (color.category === targetColor.category) score += 3;

      // Same temperature = +2
      if (color.temperature === targetColor.temperature) score += 2;

      // Same brightness = +2
      if (color.brightness === targetColor.brightness) score += 2;

      // Same base color = +5
      if (color.baseColor === targetColor.baseColor || targetColor.baseColor === color.name) score += 5;

      // RGB similarity (Euclidean distance)
      const rgbDistance = Math.sqrt(
        Math.pow(color.rgb[0] - targetColor.rgb[0], 2) +
        Math.pow(color.rgb[1] - targetColor.rgb[1], 2) +
        Math.pow(color.rgb[2] - targetColor.rgb[2], 2)
      );
      const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
      const rgbSimilarity = 1 - (rgbDistance / maxDistance);
      score += rgbSimilarity * 10;

      similar.push({ color, score });
    }

    similar.sort((a, b) => b.score - a.score);
    return similar.slice(0, maxResults).map(s => s.color);
  }

  /**
   * Apply color to object properties
   */
  applyColorToProperties(properties: ObjectProperties, colorName: string): ObjectProperties {
    const parsed = this.parse(colorName);

    if (!parsed.isValid || !parsed.color) {
      return properties;
    }

    const color = parsed.color;
    const modified = { ...properties };

    // Add color trait
    if (!modified.traits) {
      modified.traits = [];
    }

    modified.traits.push(`color_${color.name}`);

    // Add hex color trait (for future visual rendering)
    modified.traits.push(`hex_${color.hex}`);

    // Add color category trait
    modified.traits.push(`color_category_${color.category}`);

    // Add temperature trait
    if (color.temperature !== 'neutral') {
      modified.traits.push(`color_temp_${color.temperature}`);
    }

    // Add brightness trait
    modified.traits.push(`color_brightness_${color.brightness}`);

    return modified;
  }

  /**
   * Get all color names (including aliases)
   */
  getAllColorNames(): string[] {
    const names = Array.from(this.colors.keys());
    const aliases = Array.from(this.aliasMap.keys());
    return [...names, ...aliases].sort();
  }

  /**
   * Get total color count
   */
  getColorCount(): number {
    return this.colors.size;
  }

  /**
   * Mix two colors (simple RGB average)
   */
  mixColors(color1Name: string, color2Name: string): ColorInfo | null {
    const c1 = this.parse(color1Name);
    const c2 = this.parse(color2Name);

    if (!c1.isValid || !c1.color || !c2.isValid || !c2.color) {
      return null;
    }

    const r = Math.round((c1.color.rgb[0] + c2.color.rgb[0]) / 2);
    const g = Math.round((c1.color.rgb[1] + c2.color.rgb[1]) / 2);
    const b = Math.round((c1.color.rgb[2] + c2.color.rgb[2]) / 2);

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();

    return {
      name: `${c1.color.name}_${c2.color.name}_mix`,
      hex,
      rgb: [r, g, b],
      category: 'neutral',
      aliases: [],
      brightness: this.calculateBrightness([r, g, b]),
      temperature: this.calculateTemperature([r, g, b])
    };
  }

  /**
   * Get complementary color (opposite on color wheel)
   */
  getComplementaryColor(colorName: string): ColorInfo | null {
    const parsed = this.parse(colorName);
    if (!parsed.isValid || !parsed.color) {
      return null;
    }

    const [r, g, b] = parsed.color.rgb;

    // Invert RGB
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;

    const hex = `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`.toUpperCase();

    return {
      name: `${parsed.color.name}_complement`,
      hex,
      rgb: [compR, compG, compB],
      category: 'neutral',
      aliases: [],
      brightness: this.calculateBrightness([compR, compG, compB]),
      temperature: this.calculateTemperature([compR, compG, compB])
    };
  }
}
