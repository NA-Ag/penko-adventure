/**
 * CategoryMatching Examples - FACADE 6.5
 *
 * Demonstrates category-level pattern matching for rules.
 */

import {
  CategoryMatcher,
  CategoryBuilder,
  CategoryPredicates,
  CategoryPresets,
  CategoryHelpers,
  CategoryPatternMatcher,
  GlobalCategoryMatcher,
  CategoryPattern,
} from '../CategoryMatching';
import { WorkingMemory } from '../../wm/WorkingMemory';
import { RuleEngine } from '../RuleEngine';
import { Rule, RuleBuilder } from '../Rule';
import { WME } from '../../wm/WME';

console.log('='.repeat(80));
console.log('FACADE 6.5: CATEGORY MATCHING EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Category Creation
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Category Creation');
console.log('='.repeat(80));

const matcher1 = new CategoryMatcher();

console.log('\nCreating weapon category:');
const weaponCategory = new CategoryBuilder()
  .named('Weapon')
  .describedAs('All weapons')
  .matching((wme) => {
    const tags = wme.getAttribute('tags');
    return Array.isArray(tags) && tags.includes('weapon');
  })
  .register(matcher1);

console.log(`Created: ${weaponCategory.name} - ${weaponCategory.description}`);

// Test matching
const sword = new WME('Item', { name: 'Iron Sword', tags: ['weapon', 'melee'] });
const potion = new WME('Item', { name: 'Health Potion', tags: ['consumable'] });

console.log('\nTesting matches:');
console.log(`Sword is weapon: ${matcher1.matches(sword, 'Weapon')}`);
console.log(`Potion is weapon: ${matcher1.matches(potion, 'Weapon')}`);

// ============================================================================
// Example 2: Category Hierarchy
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Category Hierarchy - Weapons');
console.log('='.repeat(80));

const matcher2 = new CategoryMatcher();

// Base weapon category
new CategoryBuilder()
  .named('Weapon')
  .describedAs('All weapons')
  .withTag('weapon')
  .register(matcher2);

// Melee weapon subcategory
new CategoryBuilder()
  .named('MeleeWeapon')
  .describedAs('Close-range weapons')
  .extends('Weapon')
  .withAllTags('weapon', 'melee')
  .register(matcher2);

// Ranged weapon subcategory
new CategoryBuilder()
  .named('RangedWeapon')
  .describedAs('Long-range weapons')
  .extends('Weapon')
  .withAllTags('weapon', 'ranged')
  .register(matcher2);

// Sword subcategory
new CategoryBuilder()
  .named('Sword')
  .describedAs('All swords')
  .extends('MeleeWeapon')
  .withAllTags('weapon', 'melee', 'sword')
  .register(matcher2);

console.log('\nCategory hierarchy:');
matcher2.displayStats();

// Test items
const ironSword = new WME('Item', { name: 'Iron Sword', tags: ['weapon', 'melee', 'sword'] });
const bow = new WME('Item', { name: 'Longbow', tags: ['weapon', 'ranged', 'bow'] });
const dagger = new WME('Item', { name: 'Dagger', tags: ['weapon', 'melee'] });

console.log('\nTesting Iron Sword:');
console.log(`  Weapon: ${matcher2.matches(ironSword, 'Weapon')}`);
console.log(`  MeleeWeapon: ${matcher2.matches(ironSword, 'MeleeWeapon')}`);
console.log(`  Sword: ${matcher2.matches(ironSword, 'Sword')}`);
console.log(`  RangedWeapon: ${matcher2.matches(ironSword, 'RangedWeapon')}`);

console.log('\nTesting Longbow:');
console.log(`  Weapon: ${matcher2.matches(bow, 'Weapon')}`);
console.log(`  RangedWeapon: ${matcher2.matches(bow, 'RangedWeapon')}`);
console.log(`  MeleeWeapon: ${matcher2.matches(bow, 'MeleeWeapon')}`);

// ============================================================================
// Example 3: Category Predicates
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Category Predicates - Complex Matching');
console.log('='.repeat(80));

const matcher3 = new CategoryMatcher();

// Powerful enemy category (level > 10)
new CategoryBuilder()
  .named('PowerfulEnemy')
  .describedAs('High-level enemies')
  .matching(
    CategoryPredicates.and(
      CategoryPredicates.hasTag('enemy'),
      CategoryPredicates.attributeGreaterThan('level', 10)
    )
  )
  .register(matcher3);

// Weak enemy category (level <= 5)
new CategoryBuilder()
  .named('WeakEnemy')
  .describedAs('Low-level enemies')
  .matching(
    CategoryPredicates.and(
      CategoryPredicates.hasTag('enemy'),
      CategoryPredicates.attributeLessThan('level', 6)
    )
  )
  .register(matcher3);

// Boss enemy category (has boss tag OR level > 20)
new CategoryBuilder()
  .named('Boss')
  .describedAs('Boss enemies')
  .matching(
    CategoryPredicates.or(
      CategoryPredicates.hasTag('boss'),
      CategoryPredicates.attributeGreaterThan('level', 20)
    )
  )
  .register(matcher3);

const goblin = new WME('Enemy', { name: 'Goblin', level: 3, tags: ['enemy'] });
const orc = new WME('Enemy', { name: 'Orc', level: 12, tags: ['enemy'] });
const dragon = new WME('Enemy', { name: 'Dragon', level: 25, tags: ['enemy', 'boss'] });

console.log('\nTesting Goblin (level 3):');
console.log(`  WeakEnemy: ${matcher3.matches(goblin, 'WeakEnemy')}`);
console.log(`  PowerfulEnemy: ${matcher3.matches(goblin, 'PowerfulEnemy')}`);
console.log(`  Boss: ${matcher3.matches(goblin, 'Boss')}`);

console.log('\nTesting Orc (level 12):');
console.log(`  WeakEnemy: ${matcher3.matches(orc, 'WeakEnemy')}`);
console.log(`  PowerfulEnemy: ${matcher3.matches(orc, 'PowerfulEnemy')}`);
console.log(`  Boss: ${matcher3.matches(orc, 'Boss')}`);

console.log('\nTesting Dragon (level 25, boss):');
console.log(`  WeakEnemy: ${matcher3.matches(dragon, 'WeakEnemy')}`);
console.log(`  PowerfulEnemy: ${matcher3.matches(dragon, 'PowerfulEnemy')}`);
console.log(`  Boss: ${matcher3.matches(dragon, 'Boss')}`);

// ============================================================================
// Example 4: Category Presets
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Category Presets - Common Game Categories');
console.log('='.repeat(80));

const matcher4 = new CategoryMatcher();

console.log('\nSetting up common game categories:');
CategoryPresets.setupGameCategories(matcher4);

matcher4.displayStats();

// ============================================================================
// Example 5: Fear All Dragons
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Fear All Dragons - Category-Based Rule');
console.log('='.repeat(80));

const wm5 = new WorkingMemory();
const engine5 = new RuleEngine(wm5, { debug: false });
const matcher5 = new CategoryMatcher();

// Register dragon category
CategoryPresets.dragon(matcher5);

// Create fear rule using category
const fearDragonRule = new RuleBuilder()
  .named('Fear Dragon')
  .describedAs('NPC fears all dragons')
  .whenType('Entity', {}, 'entity')
  .validate((bindings) => {
    const entity = bindings.get('entity')!;
    return matcher5.matches(entity, 'Dragon');
  })
  .then((bindings) => {
    const entity = bindings.get('entity')!;
    console.log(`>>> NPC: "A ${entity.getAttribute('name')}! Run away!"`);
  })
  .build();

engine5.addRule(fearDragonRule);

console.log('\nAdding various dragons:');
wm5.assert(new WME('Entity', { name: 'Red Dragon', tags: ['creature', 'dragon'], level: 20 }));
wm5.assert(new WME('Entity', { name: 'Ice Dragon', tags: ['creature', 'dragon'], level: 18 }));
wm5.assert(new WME('Entity', { name: 'Ancient Dragon', tags: ['creature', 'dragon'], level: 30 }));
wm5.assert(new WME('Entity', { name: 'Wolf', tags: ['creature'], level: 5 }));

console.log('\nRule fires for all dragons:');
engine5.run();

// ============================================================================
// Example 6: React to Any Weapon vs Specific Weapon
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: React to Any Weapon vs Specific Weapon');
console.log('='.repeat(80));

const wm6 = new WorkingMemory();
const engine6 = new RuleEngine(wm6, { debug: false });
const matcher6 = new CategoryMatcher();

CategoryPresets.weapon(matcher6);
CategoryPresets.meleeWeapon(matcher6);

// Generic weapon reaction
const weaponReaction = new RuleBuilder()
  .named('See Weapon')
  .whenType('Item', {}, 'item')
  .validate((bindings) => {
    const item = bindings.get('item')!;
    return matcher6.matches(item, 'Weapon');
  })
  .then((bindings) => {
    const item = bindings.get('item')!;
    console.log(`>>> NPC: "I see you have a ${item.getAttribute('name')}."`);
  })
  .withPriority(50)
  .build();

// Specific sword reaction (higher priority)
const swordReaction = new RuleBuilder()
  .named('See Legendary Sword')
  .whenType('Item', { name: 'Excalibur' })
  .then((bindings) => {
    const item = bindings.get('item')!;
    console.log(`>>> NPC: "That's EXCALIBUR! The legendary blade!"`);
  })
  .withPriority(100)
  .build();

engine6.addRule(weaponReaction);
engine6.addRule(swordReaction);

console.log('\nShowing generic weapon:');
wm6.assert(new WME('Item', { name: 'Iron Dagger', tags: ['weapon', 'melee'] }));
engine6.run();

console.log('\nShowing legendary sword:');
wm6.clear();
wm6.assert(new WME('Item', { name: 'Excalibur', tags: ['weapon', 'melee'] }));
engine6.run();

// ============================================================================
// Example 7: Dislike All Politicians
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Dislike All Politicians - Profession Category');
console.log('='.repeat(80));

const wm7 = new WorkingMemory();
const engine7 = new RuleEngine(wm7, { debug: false });
const matcher7 = new CategoryMatcher();

CategoryPresets.politician(matcher7);

// Dislike politicians rule
const dislikePolitician = new RuleBuilder()
  .named('Dislike Politician')
  .whenType('NPC', {}, 'npc')
  .validate((bindings) => {
    const npc = bindings.get('npc')!;
    return matcher7.matches(npc, 'Politician');
  })
  .then((bindings) => {
    const npc = bindings.get('npc')!;
    console.log(`>>> Player: "Ugh, another politician. I don't trust ${npc.getAttribute('name')}."`);
  })
  .build();

engine7.addRule(dislikePolitician);

console.log('\nEncountering various NPCs:');
wm7.assert(new WME('NPC', { name: 'Senator Marcus', profession: 'politician', tags: ['npc'] }));
wm7.assert(new WME('NPC', { name: 'Mayor Helena', profession: 'politician', tags: ['npc'] }));
wm7.assert(new WME('NPC', { name: 'Blacksmith John', profession: 'blacksmith', tags: ['npc'] }));

engine7.run();

// ============================================================================
// Example 8: Category Pattern Matching
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Category Pattern Matching');
console.log('='.repeat(80));

const matcher8 = new CategoryMatcher();
CategoryPresets.enemy(matcher8);
CategoryPresets.ally(matcher8);

const patternMatcher = new CategoryPatternMatcher(matcher8);

// Test WMEs
const enemy1 = new WME('Character', { name: 'Bandit', tags: ['enemy'] });
const enemy2 = new WME('Character', { name: 'Thief', tags: ['enemy'] });
const ally1 = new WME('Character', { name: 'Knight', tags: ['ally'] });

const allChars = [enemy1, enemy2, ally1];

// Pattern with category
const enemyPattern: CategoryPattern = {
  type: 'Character',
  category: 'Enemy',
};

const allyPattern: CategoryPattern = {
  type: 'Character',
  category: 'Ally',
};

console.log('\nFinding enemies:');
const enemies = patternMatcher.findMatches(allChars, enemyPattern);
console.log(`Found ${enemies.length} enemies: ${enemies.map(e => e.getAttribute('name')).join(', ')}`);

console.log('\nFinding allies:');
const allies = patternMatcher.findMatches(allChars, allyPattern);
console.log(`Found ${allies.length} allies: ${allies.map(e => e.getAttribute('name')).join(', ')}`);

// ============================================================================
// Example 9: Dynamic Category Membership
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Dynamic Category Membership');
console.log('='.repeat(80));

const matcher9 = new CategoryMatcher();

// Create categories
new CategoryBuilder()
  .named('HealthyUnit')
  .describedAs('Units with health > 50')
  .matching(CategoryPredicates.attributeGreaterThan('health', 50))
  .register(matcher9);

new CategoryBuilder()
  .named('InjuredUnit')
  .describedAs('Units with health <= 50')
  .matching(CategoryPredicates.attributeLessThan('health', 51))
  .register(matcher9);

const unit = new WME('Unit', { name: 'Warrior', health: 80 });

console.log('\nInitial state (health: 80):');
console.log(`  Healthy: ${matcher9.matches(unit, 'HealthyUnit')}`);
console.log(`  Injured: ${matcher9.matches(unit, 'InjuredUnit')}`);

console.log('\nAfter taking damage (health: 30):');
unit.setAttribute('health', 30);
console.log(`  Healthy: ${matcher9.matches(unit, 'HealthyUnit')}`);
console.log(`  Injured: ${matcher9.matches(unit, 'InjuredUnit')}`);

console.log('\nAfter healing (health: 70):');
unit.setAttribute('health', 70);
console.log(`  Healthy: ${matcher9.matches(unit, 'HealthyUnit')}`);
console.log(`  Injured: ${matcher9.matches(unit, 'InjuredUnit')}`);

// ============================================================================
// Example 10: Multiple Categories
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Getting All Categories for a WME');
console.log('='.repeat(80));

const matcher10 = new CategoryMatcher();

// Register multiple categories
CategoryPresets.weapon(matcher10);
CategoryPresets.meleeWeapon(matcher10);
new CategoryBuilder().named('Valuable').describedAs('Valuable items').matching(CategoryPredicates.attributeGreaterThan('value', 100)).register(matcher10);
new CategoryBuilder().named('Magical').describedAs('Magical items').withTag('magical').register(matcher10);

const excalibur = new WME('Item', {
  name: 'Excalibur',
  tags: ['weapon', 'melee', 'magical'],
  value: 1000
});

console.log('\nExcalibur belongs to categories:');
const categories = matcher10.getCategories(excalibur);
for (const category of categories) {
  console.log(`  - ${category}`);
}

// ============================================================================
// Example 11: Hierarchical Category Queries
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Hierarchical Category Queries');
console.log('='.repeat(80));

const matcher11 = new CategoryMatcher();

new CategoryBuilder().named('Living').withTag('living').register(matcher11);
new CategoryBuilder().named('Creature').extends('Living').withAllTags('living', 'creature').register(matcher11);
new CategoryBuilder().named('Dragon').extends('Creature').withAllTags('living', 'creature', 'dragon').register(matcher11);
new CategoryBuilder().named('AncientDragon').extends('Dragon').withAllTags('living', 'creature', 'dragon', 'ancient').register(matcher11);

console.log('\nCategory hierarchy for AncientDragon:');
const hierarchy = matcher11.getHierarchy('AncientDragon');
console.log(hierarchy.join(' > '));

console.log('\nChecking subcategory relationships:');
console.log(`  Dragon is subcategory of Creature: ${matcher11.isSubcategoryOf('Dragon', 'Creature')}`);
console.log(`  AncientDragon is subcategory of Living: ${matcher11.isSubcategoryOf('AncientDragon', 'Living')}`);
console.log(`  Dragon is subcategory of Living: ${matcher11.isSubcategoryOf('Dragon', 'Living')}`);
console.log(`  Creature is subcategory of Dragon: ${matcher11.isSubcategoryOf('Creature', 'Dragon')}`);

// ============================================================================
// Example 12: Category Helpers
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Category Helpers - Quick Creation');
console.log('='.repeat(80));

const matcher12 = new CategoryMatcher();

console.log('\nCreating categories with helpers:');

// From tag
CategoryHelpers.fromTag('Consumable', 'consumable', matcher12);

// From attribute
CategoryHelpers.fromAttribute('Rare', 'rarity', 'rare', matcher12);

// From predicate
CategoryHelpers.fromPredicate(
  'Expensive',
  (wme) => {
    const price = wme.getAttribute('price');
    return typeof price === 'number' && price > 500;
  },
  matcher12
);

const healthPotion = new WME('Item', { name: 'Health Potion', tags: ['consumable'], price: 50 });
const rareGem = new WME('Item', { name: 'Ruby', rarity: 'rare', price: 800 });

console.log('\nTesting Health Potion:');
console.log(`  Consumable: ${CategoryHelpers.isInCategory(healthPotion, 'Consumable', matcher12)}`);
console.log(`  Rare: ${CategoryHelpers.isInCategory(healthPotion, 'Rare', matcher12)}`);
console.log(`  Expensive: ${CategoryHelpers.isInCategory(healthPotion, 'Expensive', matcher12)}`);

console.log('\nTesting Ruby:');
console.log(`  Consumable: ${CategoryHelpers.isInCategory(rareGem, 'Consumable', matcher12)}`);
console.log(`  Rare: ${CategoryHelpers.isInCategory(rareGem, 'Rare', matcher12)}`);
console.log(`  Expensive: ${CategoryHelpers.isInCategory(rareGem, 'Expensive', matcher12)}`);

// ============================================================================
// Example 13: Practical Use Case - RPG Reactions
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 13: Practical Use Case - RPG Reactions');
console.log('='.repeat(80));

const wm13 = new WorkingMemory();
const engine13 = new RuleEngine(wm13, { debug: false });
const matcher13 = new CategoryMatcher();

// Setup categories
CategoryPresets.setupGameCategories(matcher13);

// Rule: Greet all NPCs
const greetNPC = new RuleBuilder()
  .named('Greet NPC')
  .whenType('Entity', { nearby: true }, 'entity')
  .validate((bindings) => {
    const entity = bindings.get('entity')!;
    return matcher13.matches(entity, 'NPC');
  })
  .then((bindings) => {
    const entity = bindings.get('entity')!;
    console.log(`>>> Player: "Hello, ${entity.getAttribute('name')}!"`);
  })
  .withPriority(50)
  .build();

// Rule: Attack all enemies
const attackEnemy = new RuleBuilder()
  .named('Attack Enemy')
  .whenType('Entity', { nearby: true }, 'entity')
  .validate((bindings) => {
    const entity = bindings.get('entity')!;
    return matcher13.matches(entity, 'Enemy');
  })
  .then((bindings) => {
    const entity = bindings.get('entity')!;
    console.log(`>>> Player attacks ${entity.getAttribute('name')}!`);
  })
  .withPriority(80)
  .build();

// Rule: Flee from powerful enemies
const fleePowerful = new RuleBuilder()
  .named('Flee Powerful')
  .whenType('Entity', { nearby: true }, 'entity')
  .validate((bindings) => {
    const entity = bindings.get('entity')!;
    return matcher13.matches(entity, 'PowerfulEnemy');
  })
  .then((bindings) => {
    const entity = bindings.get('entity')!;
    console.log(`>>> Player: "That ${entity.getAttribute('name')} is too strong! Running away!"`);
  })
  .withPriority(100)
  .build();

engine13.addRule(greetNPC);
engine13.addRule(attackEnemy);
engine13.addRule(fleePowerful);

console.log('\n--- SCENARIO START ---');

console.log('\n1. Encountering a friendly merchant:');
wm13.assert(new WME('Entity', {
  name: 'Thomas the Merchant',
  tags: ['npc'],
  profession: 'merchant',
  nearby: true
}));
engine13.run();

console.log('\n2. Encountering a weak goblin:');
wm13.clear();
wm13.assert(new WME('Entity', {
  name: 'Goblin Scout',
  tags: ['enemy'],
  level: 3,
  nearby: true
}));
engine13.run();

console.log('\n3. Encountering a powerful dragon:');
wm13.clear();
wm13.assert(new WME('Entity', {
  name: 'Ancient Red Dragon',
  tags: ['enemy'],
  level: 25,
  nearby: true
}));
engine13.run();

console.log('\n' + '='.repeat(80));
console.log('FACADE 6.5 EXAMPLES COMPLETE');
console.log('='.repeat(80));
