/**
 * CategoryMatching - FACADE 6.5
 *
 * Category-level pattern matching for rules.
 * Allows reactions to target categories, not just specific objects.
 *
 * Features:
 * - Category-based matching ("any weapon", "all dragons")
 * - Trait/property matching
 * - Tag-based categorization
 * - Hierarchical categories (Dragon > Fire Dragon > Ancient Fire Dragon)
 * - Custom category predicates
 * - Category registration and management
 *
 * This enables:
 * - "Fear all dragons" without specifying each dragon type
 * - "React to any weapon" vs "React to iron sword"
 * - "Dislike all politicians"
 * - Flexible, maintainable rule definitions
 */

import { IWME } from '../wm/WME';
import { Pattern } from './Rule';

/**
 * Category definition
 */
export interface Category {
  /** Category name */
  name: string;

  /** Description */
  description?: string;

  /** Parent category (for hierarchy) */
  parent?: string;

  /** Predicate function to test if WME belongs to category */
  predicate: (wme: IWME) => boolean;

  /** Metadata */
  metadata?: Record<string, any>;
}

/**
 * Category matcher - manages categories and matching
 */
export class CategoryMatcher {
  private categories: Map<string, Category> = new Map();

  /**
   * Register a category
   */
  registerCategory(category: Category): void {
    this.categories.set(category.name, category);
  }

  /**
   * Remove a category
   */
  removeCategory(name: string): boolean {
    return this.categories.delete(name);
  }

  /**
   * Get category by name
   */
  getCategory(name: string): Category | undefined {
    return this.categories.get(name);
  }

  /**
   * Get all categories
   */
  getAllCategories(): Category[] {
    return Array.from(this.categories.values());
  }

  /**
   * Check if WME belongs to category
   */
  matches(wme: IWME, categoryName: string): boolean {
    const category = this.categories.get(categoryName);
    if (!category) {
      console.warn(`[CategoryMatcher] Category "${categoryName}" not found`);
      return false;
    }

    return category.predicate(wme);
  }

  /**
   * Get all categories a WME belongs to
   */
  getCategories(wme: IWME): string[] {
    const categories: string[] = [];

    for (const [name, category] of this.categories.entries()) {
      if (category.predicate(wme)) {
        categories.push(name);
      }
    }

    return categories;
  }

  /**
   * Check if category is a subcategory of another
   */
  isSubcategoryOf(subcategory: string, parentCategory: string): boolean {
    const category = this.categories.get(subcategory);
    if (!category) return false;

    // Check immediate parent
    if (category.parent === parentCategory) return true;

    // Check parent's parent (recursive)
    if (category.parent) {
      return this.isSubcategoryOf(category.parent, parentCategory);
    }

    return false;
  }

  /**
   * Get category hierarchy (from most specific to most general)
   */
  getHierarchy(categoryName: string): string[] {
    const hierarchy: string[] = [categoryName];
    const category = this.categories.get(categoryName);

    if (category && category.parent) {
      hierarchy.push(...this.getHierarchy(category.parent));
    }

    return hierarchy;
  }

  /**
   * Clear all categories
   */
  clear(): void {
    this.categories.clear();
  }

  /**
   * Display statistics
   */
  displayStats(): void {
    console.log('\n' + '='.repeat(60));
    console.log('CATEGORY MATCHER STATISTICS');
    console.log('='.repeat(60));

    console.log(`\nTotal Categories: ${this.categories.size}`);

    // Group by hierarchy level
    const topLevel: string[] = [];
    const subcategories: Map<string, string[]> = new Map();

    for (const [name, category] of this.categories.entries()) {
      if (!category.parent) {
        topLevel.push(name);
      } else {
        if (!subcategories.has(category.parent)) {
          subcategories.set(category.parent, []);
        }
        subcategories.get(category.parent)!.push(name);
      }
    }

    console.log('\nTop-Level Categories:');
    for (const name of topLevel) {
      console.log(`  - ${name}`);
      this.displayHierarchy(name, subcategories, 2);
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Display category hierarchy
   */
  private displayHierarchy(
    categoryName: string,
    subcategories: Map<string, string[]>,
    indent: number
  ): void {
    const children = subcategories.get(categoryName);
    if (children) {
      for (const child of children) {
        console.log(`${' '.repeat(indent * 2)}- ${child}`);
        this.displayHierarchy(child, subcategories, indent + 1);
      }
    }
  }
}

/**
 * Global category matcher instance
 */
export const GlobalCategoryMatcher = new CategoryMatcher();

/**
 * Category pattern - extends base Pattern with category support
 */
export interface CategoryPattern extends Pattern {
  /** Category name to match */
  category?: string;
}

/**
 * Category-aware pattern matcher
 */
export class CategoryPatternMatcher {
  private categoryMatcher: CategoryMatcher;

  constructor(categoryMatcher: CategoryMatcher = GlobalCategoryMatcher) {
    this.categoryMatcher = categoryMatcher;
  }

  /**
   * Check if WME matches pattern (with category support)
   */
  matches(wme: IWME, pattern: CategoryPattern): boolean {
    // Check type
    if (wme.type !== pattern.type) {
      return false;
    }

    // Check category if specified
    if (pattern.category) {
      if (!this.categoryMatcher.matches(wme, pattern.category)) {
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

        // Variable binding (skip for now, handled by Rule)
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
  findMatches(wmes: IWME[], pattern: CategoryPattern): IWME[] {
    return wmes.filter((wme) => this.matches(wme, pattern));
  }
}

/**
 * Common category predicates
 */
export class CategoryPredicates {
  /**
   * Match WMEs with specific attribute value
   */
  static hasAttribute(key: string, value: any): (wme: IWME) => boolean {
    return (wme) => wme.getAttribute(key) === value;
  }

  /**
   * Match WMEs with attribute in set of values
   */
  static hasAttributeIn(key: string, values: any[]): (wme: IWME) => boolean {
    return (wme) => {
      const val = wme.getAttribute(key);
      return values.includes(val);
    };
  }

  /**
   * Match WMEs with attribute matching predicate
   */
  static attributeMatches(
    key: string,
    predicate: (value: any) => boolean
  ): (wme: IWME) => boolean {
    return (wme) => {
      const val = wme.getAttribute(key);
      return predicate(val);
    };
  }

  /**
   * Match WMEs with tag
   */
  static hasTag(tag: string): (wme: IWME) => boolean {
    return (wme) => {
      const tags = wme.getAttribute('tags');
      if (!tags) return false;
      if (Array.isArray(tags)) return tags.includes(tag);
      return tags === tag;
    };
  }

  /**
   * Match WMEs with any of multiple tags
   */
  static hasAnyTag(tags: string[]): (wme: IWME) => boolean {
    return (wme) => {
      const wmeTags = wme.getAttribute('tags');
      if (!wmeTags) return false;
      if (Array.isArray(wmeTags)) {
        return wmeTags.some((tag) => tags.includes(tag));
      }
      return tags.includes(wmeTags);
    };
  }

  /**
   * Match WMEs with all of multiple tags
   */
  static hasAllTags(tags: string[]): (wme: IWME) => boolean {
    return (wme) => {
      const wmeTags = wme.getAttribute('tags');
      if (!wmeTags) return false;
      if (Array.isArray(wmeTags)) {
        return tags.every((tag) => wmeTags.includes(tag));
      }
      return false; // Single tag can't have all tags
    };
  }

  /**
   * Match WMEs with type in set
   */
  static hasTypeIn(types: string[]): (wme: IWME) => boolean {
    return (wme) => types.includes(wme.type);
  }

  /**
   * Combine predicates with AND
   */
  static and(...predicates: ((wme: IWME) => boolean)[]): (wme: IWME) => boolean {
    return (wme) => predicates.every((p) => p(wme));
  }

  /**
   * Combine predicates with OR
   */
  static or(...predicates: ((wme: IWME) => boolean)[]): (wme: IWME) => boolean {
    return (wme) => predicates.some((p) => p(wme));
  }

  /**
   * Negate predicate
   */
  static not(predicate: (wme: IWME) => boolean): (wme: IWME) => boolean {
    return (wme) => !predicate(wme);
  }

  /**
   * Match numeric attribute in range
   */
  static attributeInRange(
    key: string,
    min: number,
    max: number
  ): (wme: IWME) => boolean {
    return (wme) => {
      const val = wme.getAttribute(key);
      return typeof val === 'number' && val >= min && val <= max;
    };
  }

  /**
   * Match numeric attribute greater than value
   */
  static attributeGreaterThan(key: string, value: number): (wme: IWME) => boolean {
    return (wme) => {
      const val = wme.getAttribute(key);
      return typeof val === 'number' && val > value;
    };
  }

  /**
   * Match numeric attribute less than value
   */
  static attributeLessThan(key: string, value: number): (wme: IWME) => boolean {
    return (wme) => {
      const val = wme.getAttribute(key);
      return typeof val === 'number' && val < value;
    };
  }
}

/**
 * Category builder - fluent API for creating categories
 */
export class CategoryBuilder {
  private name: string = '';
  private description: string = '';
  private parent?: string;
  private predicate?: (wme: IWME) => boolean;
  private metadata: Record<string, any> = {};

  /**
   * Set category name
   */
  named(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Set description
   */
  describedAs(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * Set parent category
   */
  extends(parent: string): this {
    this.parent = parent;
    return this;
  }

  /**
   * Set predicate
   */
  matching(predicate: (wme: IWME) => boolean): this {
    this.predicate = predicate;
    return this;
  }

  /**
   * Match by attribute
   */
  withAttribute(key: string, value: any): this {
    this.predicate = CategoryPredicates.hasAttribute(key, value);
    return this;
  }

  /**
   * Match by tag
   */
  withTag(tag: string): this {
    this.predicate = CategoryPredicates.hasTag(tag);
    return this;
  }

  /**
   * Match by any of tags
   */
  withAnyTag(...tags: string[]): this {
    this.predicate = CategoryPredicates.hasAnyTag(tags);
    return this;
  }

  /**
   * Match by all tags
   */
  withAllTags(...tags: string[]): this {
    this.predicate = CategoryPredicates.hasAllTags(tags);
    return this;
  }

  /**
   * Add metadata
   */
  withMetadata(key: string, value: any): this {
    this.metadata[key] = value;
    return this;
  }

  /**
   * Build category
   */
  build(): Category {
    if (!this.name) {
      throw new Error('Category must have a name');
    }

    if (!this.predicate) {
      throw new Error('Category must have a predicate');
    }

    return {
      name: this.name,
      description: this.description,
      parent: this.parent,
      predicate: this.predicate,
      metadata: this.metadata,
    };
  }

  /**
   * Build and register with matcher
   */
  register(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    const category = this.build();
    matcher.registerCategory(category);
    return category;
  }
}

/**
 * Common category presets
 */
export class CategoryPresets {
  /**
   * Create weapon category
   */
  static weapon(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('Weapon')
      .describedAs('All weapons')
      .withTag('weapon')
      .register(matcher);
  }

  /**
   * Create melee weapon category
   */
  static meleeWeapon(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('MeleeWeapon')
      .describedAs('Melee weapons')
      .extends('Weapon')
      .withAllTags('weapon', 'melee')
      .register(matcher);
  }

  /**
   * Create ranged weapon category
   */
  static rangedWeapon(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('RangedWeapon')
      .describedAs('Ranged weapons')
      .extends('Weapon')
      .withAllTags('weapon', 'ranged')
      .register(matcher);
  }

  /**
   * Create creature category
   */
  static creature(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('Creature')
      .describedAs('All creatures')
      .withTag('creature')
      .register(matcher);
  }

  /**
   * Create dragon category
   */
  static dragon(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('Dragon')
      .describedAs('All dragons')
      .extends('Creature')
      .withAllTags('creature', 'dragon')
      .register(matcher);
  }

  /**
   * Create NPC category
   */
  static npc(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('NPC')
      .describedAs('All NPCs')
      .withTag('npc')
      .register(matcher);
  }

  /**
   * Create merchant category
   */
  static merchant(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('Merchant')
      .describedAs('Merchant NPCs')
      .extends('NPC')
      .withAttribute('profession', 'merchant')
      .register(matcher);
  }

  /**
   * Create politician category
   */
  static politician(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('Politician')
      .describedAs('Politician NPCs')
      .extends('NPC')
      .withAttribute('profession', 'politician')
      .register(matcher);
  }

  /**
   * Create enemy category
   */
  static enemy(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('Enemy')
      .describedAs('All enemies')
      .withTag('enemy')
      .register(matcher);
  }

  /**
   * Create ally category
   */
  static ally(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('Ally')
      .describedAs('All allies')
      .withTag('ally')
      .register(matcher);
  }

  /**
   * Create powerful enemy category
   */
  static powerfulEnemy(matcher: CategoryMatcher = GlobalCategoryMatcher): Category {
    return new CategoryBuilder()
      .named('PowerfulEnemy')
      .describedAs('Powerful enemies')
      .extends('Enemy')
      .matching(
        CategoryPredicates.and(
          CategoryPredicates.hasTag('enemy'),
          CategoryPredicates.attributeGreaterThan('level', 10)
        )
      )
      .register(matcher);
  }

  /**
   * Setup common game categories
   */
  static setupGameCategories(matcher: CategoryMatcher = GlobalCategoryMatcher): void {
    CategoryPresets.weapon(matcher);
    CategoryPresets.meleeWeapon(matcher);
    CategoryPresets.rangedWeapon(matcher);
    CategoryPresets.creature(matcher);
    CategoryPresets.dragon(matcher);
    CategoryPresets.npc(matcher);
    CategoryPresets.merchant(matcher);
    CategoryPresets.politician(matcher);
    CategoryPresets.enemy(matcher);
    CategoryPresets.ally(matcher);
    CategoryPresets.powerfulEnemy(matcher);
  }
}

/**
 * Category helper functions
 */
export class CategoryHelpers {
  /**
   * Create category from tag
   */
  static fromTag(
    name: string,
    tag: string,
    matcher: CategoryMatcher = GlobalCategoryMatcher
  ): Category {
    return new CategoryBuilder().named(name).withTag(tag).register(matcher);
  }

  /**
   * Create category from attribute
   */
  static fromAttribute(
    name: string,
    key: string,
    value: any,
    matcher: CategoryMatcher = GlobalCategoryMatcher
  ): Category {
    return new CategoryBuilder().named(name).withAttribute(key, value).register(matcher);
  }

  /**
   * Create category from predicate
   */
  static fromPredicate(
    name: string,
    predicate: (wme: IWME) => boolean,
    matcher: CategoryMatcher = GlobalCategoryMatcher
  ): Category {
    return new CategoryBuilder().named(name).matching(predicate).register(matcher);
  }

  /**
   * Check if WME is in category
   */
  static isInCategory(
    wme: IWME,
    categoryName: string,
    matcher: CategoryMatcher = GlobalCategoryMatcher
  ): boolean {
    return matcher.matches(wme, categoryName);
  }

  /**
   * Get all WMEs in category
   */
  static getWMEsInCategory(
    wmes: IWME[],
    categoryName: string,
    matcher: CategoryMatcher = GlobalCategoryMatcher
  ): IWME[] {
    return wmes.filter((wme) => matcher.matches(wme, categoryName));
  }
}
