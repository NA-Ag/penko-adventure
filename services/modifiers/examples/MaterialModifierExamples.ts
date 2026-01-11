import { MaterialModifier } from '../MaterialModifier';

/**
 * MaterialModifierExamples - Demonstrates material system usage
 *
 * This file shows examples of:
 * 1. Basic material parsing and validation
 * 2. Applying materials to object properties
 * 3. Material queries and filtering
 * 4. Material comparisons
 * 5. Resistance calculations
 * 6. Material weaknesses and strengths
 */

// Initialize the material modifier
const materialModifier = new MaterialModifier();

console.log('=== MATERIAL MODIFIER EXAMPLES ===\n');

// ============================================================================
// Example 1: Basic Material Parsing
// ============================================================================
console.log('--- Example 1: Basic Material Parsing ---');

const woodenParse = materialModifier.parse('wooden');
console.log('Parse "wooden":', JSON.stringify(woodenParse, null, 2));
// Result: { success: true, material: { name: 'wooden', density: 0.6, ... } }

const steelParse = materialModifier.parse('steel');
console.log('Parse "steel":', JSON.stringify(steelParse, null, 2));

const mythrilParse = materialModifier.parse('mythril');
console.log('Parse "mythril":', JSON.stringify(mythrilParse, null, 2));

const invalidParse = materialModifier.parse('unobtanium');
console.log('Parse "unobtanium" (invalid):', JSON.stringify(invalidParse, null, 2));
// Result: { success: false, error: 'Unknown material: unobtanium' }

console.log('');

// ============================================================================
// Example 2: Material Validation
// ============================================================================
console.log('--- Example 2: Material Validation ---');

console.log('Is "iron" valid?', materialModifier.isValidMaterial('iron')); // true
console.log('Is "golden" valid?', materialModifier.isValidMaterial('golden')); // true
console.log('Is "vibranium" valid?', materialModifier.isValidMaterial('vibranium')); // false
console.log('Is "metallic" valid (alias)?', materialModifier.isValidMaterial('metallic')); // true (alias for steel)

console.log('');

// ============================================================================
// Example 3: Applying Materials to Object Properties
// ============================================================================
console.log('--- Example 3: Applying Materials to Properties ---');

const baseProperties = {
  name: 'sword',
  weight: 10,
  damage: 20,
  value: 50,
  traits: []
};

console.log('Base sword properties:', JSON.stringify(baseProperties, null, 2));

// Wooden sword (light, flammable, weak)
const woodenSword = materialModifier.applyMaterialToProperties({ ...baseProperties }, 'wooden');
console.log('\nWooden sword:', JSON.stringify(woodenSword, null, 2));
// Weight: 6 (0.6x), Damage: 14 (0.7x), Durability: 30, Flammable: true

// Steel sword (heavy, strong, durable)
const steelSword = materialModifier.applyMaterialToProperties({ ...baseProperties }, 'steel');
console.log('\nSteel sword:', JSON.stringify(steelSword, null, 2));
// Weight: 78 (7.8x), Damage: 30 (1.5x), Durability: 90

// Mythril sword (magical, very durable, surprisingly light)
const mythrilSword = materialModifier.applyMaterialToProperties({ ...baseProperties }, 'mythril');
console.log('\nMythril sword:', JSON.stringify(mythrilSword, null, 2));
// Weight: 30 (3.0x), Damage: 44 (2.2x), Durability: 120, Magical: true

console.log('');

// ============================================================================
// Example 4: Material Queries - By Category
// ============================================================================
console.log('--- Example 4: Material Queries - By Category ---');

const metals = materialModifier.getMaterialsByCategory('metal');
console.log('Metal materials:', metals.map(m => m.name).join(', '));
// Result: iron, steel, copper, bronze, etc.

const magicalMetals = materialModifier.getMaterialsByCategory('magical_metal');
console.log('Magical metal materials:', magicalMetals.map(m => m.name).join(', '));
// Result: mythril, adamantine

const organicMaterials = materialModifier.getMaterialsByCategory('organic');
console.log('Organic materials:', organicMaterials.map(m => m.name).join(', '));
// Result: leather, cloth, paper, bone

console.log('');

// ============================================================================
// Example 5: Material Queries - By Properties
// ============================================================================
console.log('--- Example 5: Material Queries - By Properties ---');

const flammableMaterials = materialModifier.getMaterialsWithProperty('is_flammable');
console.log('Flammable materials:', flammableMaterials.map(m => m.name).join(', '));
// Result: wooden, paper, cloth, leather

const magneticMaterials = materialModifier.getMaterialsWithProperty('is_magnetic');
console.log('Magnetic materials:', magneticMaterials.map(m => m.name).join(', '));
// Result: iron, steel

const transparentMaterials = materialModifier.getMaterialsWithProperty('is_transparent');
console.log('Transparent materials:', transparentMaterials.map(m => m.name).join(', '));
// Result: glass, ice, ethereal

const floatingMaterials = materialModifier.getMaterialsWithProperty('can_float');
console.log('Floating materials:', floatingMaterials.map(m => m.name).join(', '));
// Result: wooden, cork (if added), ice

console.log('');

// ============================================================================
// Example 6: Material Rankings
// ============================================================================
console.log('--- Example 6: Material Rankings ---');

const strongest = materialModifier.getStrongestMaterials(5);
console.log('Top 5 strongest materials (by durability):');
strongest.forEach((m, i) => {
  console.log(`  ${i + 1}. ${m.name} (durability: ${m.durability})`);
});
// Result: 1. adamantine (150), 2. diamond (140), 3. mythril (120), ...

const lightest = materialModifier.getLightestMaterials(5);
console.log('\nTop 5 lightest materials:');
lightest.forEach((m, i) => {
  console.log(`  ${i + 1}. ${m.name} (weight: ${m.weightMultiplier}x)`);
});
// Result: 1. ethereal (0.1x), 2. paper (0.2x), 3. cloth (0.3x), ...

const heaviest = materialModifier.getHeaviestMaterials(5);
console.log('\nTop 5 heaviest materials:');
heaviest.forEach((m, i) => {
  console.log(`  ${i + 1}. ${m.name} (weight: ${m.weightMultiplier}x)`);
});
// Result: 1. gold (19.3x), 2. diamond (17.8x), 3. silver (10.5x), ...

const valuable = materialModifier.getMostValuableMaterials(5);
console.log('\nTop 5 most valuable materials:');
valuable.forEach((m, i) => {
  console.log(`  ${i + 1}. ${m.name} (value: ${m.value}x)`);
});
// Result: 1. diamond (100x), 2. mythril (75x), 3. adamantine (80x), ...

console.log('');

// ============================================================================
// Example 7: Resistance Queries
// ============================================================================
console.log('--- Example 7: Resistance Queries ---');

const fireResistant = materialModifier.getMostResistantMaterials('fire', 5);
console.log('Top 5 fire-resistant materials:');
fireResistant.forEach((m, i) => {
  console.log(`  ${i + 1}. ${m.name} (fire resistance: ${m.resistance.fire})`);
});
// Result: stone, obsidian, adamantine, etc.

const waterResistant = materialModifier.getMostResistantMaterials('water', 5);
console.log('\nTop 5 water-resistant materials:');
waterResistant.forEach((m, i) => {
  console.log(`  ${i + 1}. ${m.name} (water resistance: ${m.resistance.water})`);
});
// Result: gold, silver, steel, obsidian, etc.

const physicalResistant = materialModifier.getMostResistantMaterials('physical', 5);
console.log('\nTop 5 physically-resistant materials:');
physicalResistant.forEach((m, i) => {
  console.log(`  ${i + 1}. ${m.name} (physical resistance: ${m.resistance.physical})`);
});
// Result: adamantine, diamond, steel, mythril, etc.

console.log('');

// ============================================================================
// Example 8: Material Comparison
// ============================================================================
console.log('--- Example 8: Material Comparison ---');

const ironVsSteel = materialModifier.compareMaterials('iron', 'steel');
if (ironVsSteel) {
  console.log('Iron vs Steel comparison:');
  console.log('  Durability winner:', ironVsSteel.comparison.durability);
  console.log('  Weight winner:', ironVsSteel.comparison.weight);
  console.log('  Value winner:', ironVsSteel.comparison.value);
  console.log('  Strength winner:', ironVsSteel.comparison.strength);
}

const woodVsDiamond = materialModifier.compareMaterials('wooden', 'diamond');
if (woodVsDiamond) {
  console.log('\nWooden vs Diamond comparison:');
  console.log('  Durability winner:', woodVsDiamond.comparison.durability); // diamond
  console.log('  Weight winner:', woodVsDiamond.comparison.weight); // wooden (lighter)
  console.log('  Value winner:', woodVsDiamond.comparison.value); // diamond
  console.log('  Strength winner:', woodVsDiamond.comparison.strength); // diamond
}

console.log('');

// ============================================================================
// Example 9: Advanced Queries with Multiple Filters
// ============================================================================
console.log('--- Example 9: Advanced Queries with Multiple Filters ---');

// Find durable, lightweight materials (good for armor)
const armorMaterials = materialModifier.queryMaterials({
  minDurability: 60,
  maxDurability: 150,
  properties: {}
});
console.log('Good armor materials (durability 60-150):');
armorMaterials.forEach(m => {
  console.log(`  - ${m.name}: durability=${m.durability}, weight=${m.weightMultiplier}x`);
});

// Find cheap, flammable materials (good for firewood)
const firewoodMaterials = materialModifier.queryMaterials({
  maxValue: 2.0,
  properties: {
    is_flammable: true
  }
});
console.log('\nGood firewood materials (cheap + flammable):');
firewoodMaterials.forEach(m => {
  console.log(`  - ${m.name}: value=${m.value}x, fire_resist=${m.resistance.fire}`);
});

// Find valuable metals
const preciousMetals = materialModifier.queryMaterials({
  category: 'precious_metal',
  minValue: 10.0
});
console.log('\nPrecious metals (value >= 10x):');
preciousMetals.forEach(m => {
  console.log(`  - ${m.name}: value=${m.value}x, weight=${m.weightMultiplier}x`);
});

console.log('');

// ============================================================================
// Example 10: Effective Durability Calculation
// ============================================================================
console.log('--- Example 10: Effective Durability Calculation ---');

// Wooden object hit by fire
const woodenFireDurability = materialModifier.calculateEffectiveDurability('wooden', 50, 'fire');
console.log('Wooden object (durability 30) hit by 50 fire damage:');
console.log(`  Remaining durability: ${woodenFireDurability}`);
// Fire resistance: 0.1 -> effective damage: 45 -> remaining: -15 (destroyed)

// Stone object hit by fire
const stoneFireDurability = materialModifier.calculateEffectiveDurability('stone', 50, 'fire');
console.log('\nStone object (durability 60) hit by 50 fire damage:');
console.log(`  Remaining durability: ${stoneFireDurability}`);
// Fire resistance: 0.9 -> effective damage: 5 -> remaining: 55

// Steel object hit by physical damage
const steelPhysicalDurability = materialModifier.calculateEffectiveDurability('steel', 50, 'physical');
console.log('\nSteel object (durability 90) hit by 50 physical damage:');
console.log(`  Remaining durability: ${steelPhysicalDurability}`);
// Physical resistance: 0.8 -> effective damage: 10 -> remaining: 80

console.log('');

// ============================================================================
// Example 11: Material Weaknesses and Strengths
// ============================================================================
console.log('--- Example 11: Material Weaknesses and Strengths ---');

const woodenWeaknesses = materialModifier.getMaterialWeaknesses('wooden');
console.log('Wooden weaknesses:', woodenWeaknesses.join(', '));
// Result: fire (0.1 resistance)

const woodenStrengths = materialModifier.getMaterialStrengths('wooden');
console.log('Wooden strengths:', woodenStrengths.join(', '));
// Result: (none with >= 0.7 resistance)

const stoneWeaknesses = materialModifier.getMaterialWeaknesses('stone');
console.log('\nStone weaknesses:', stoneWeaknesses.join(', '));
// Result: (minimal, mostly neutral)

const stoneStrengths = materialModifier.getMaterialStrengths('stone');
console.log('Stone strengths:', stoneStrengths.join(', '));
// Result: fire (0.9 resistance)

const adamantineWeaknesses = materialModifier.getMaterialWeaknesses('adamantine');
console.log('\nAdamantine weaknesses:', adamantineWeaknesses.join(', '));
// Result: magic (0.2 resistance)

const adamantineStrengths = materialModifier.getMaterialStrengths('adamantine');
console.log('Adamantine strengths:', adamantineStrengths.join(', '));
// Result: fire, water, physical (all >= 0.9)

console.log('');

// ============================================================================
// Example 12: Specific Weakness/Strength Checks
// ============================================================================
console.log('--- Example 12: Specific Weakness/Strength Checks ---');

console.log('Is wooden weak against fire?', materialModifier.isWeakAgainst('wooden', 'fire')); // true
console.log('Is wooden strong against fire?', materialModifier.isStrongAgainst('wooden', 'fire')); // false

console.log('\nIs stone weak against fire?', materialModifier.isWeakAgainst('stone', 'fire')); // false
console.log('Is stone strong against fire?', materialModifier.isStrongAgainst('stone', 'fire')); // true

console.log('\nIs steel weak against physical?', materialModifier.isWeakAgainst('steel', 'physical')); // false
console.log('Is steel strong against physical?', materialModifier.isStrongAgainst('steel', 'physical')); // true

console.log('\nIs paper weak against water?', materialModifier.isWeakAgainst('paper', 'water')); // true
console.log('Is paper weak against fire?', materialModifier.isWeakAgainst('paper', 'fire')); // true

console.log('');

// ============================================================================
// Example 13: All Material Names and Categories
// ============================================================================
console.log('--- Example 13: All Material Names and Categories ---');

const allMaterials = materialModifier.getAllMaterialNames();
console.log('All available materials:');
console.log(allMaterials.join(', '));

const allCategories = materialModifier.getAllCategories();
console.log('\nAll material categories:');
console.log(allCategories.join(', '));

console.log('');

// ============================================================================
// Example 14: Practical Game Scenarios
// ============================================================================
console.log('--- Example 14: Practical Game Scenarios ---');

// Scenario 1: Choosing material for a shield
console.log('Scenario 1: Best shield materials (high physical resistance, reasonable weight)');
const shieldMaterials = materialModifier.queryMaterials({
  minPhysicalResistance: 0.6,
  maxDurability: 120
});
shieldMaterials.forEach(m => {
  console.log(`  - ${m.name}: phys_resist=${m.resistance.physical}, weight=${m.weightMultiplier}x, durability=${m.durability}`);
});

// Scenario 2: Materials that float (for boats)
console.log('\nScenario 2: Materials for boats (can float, durable)');
const boatMaterials = materialModifier.queryMaterials({
  properties: {
    can_float: true
  },
  minDurability: 25
});
boatMaterials.forEach(m => {
  console.log(`  - ${m.name}: durability=${m.durability}, water_resist=${m.resistance.water}`);
});

// Scenario 3: Materials for magical items
console.log('\nScenario 3: Materials for magical items (is_magical property)');
const magicalMaterials = materialModifier.queryMaterials({
  properties: {
    is_magical: true
  }
});
magicalMaterials.forEach(m => {
  console.log(`  - ${m.name}: value=${m.value}x, magic_resist=${m.resistance.magic || 0}`);
});

// Scenario 4: Budget materials (cheap, adequate durability)
console.log('\nScenario 4: Budget materials (cheap but functional)');
const budgetMaterials = materialModifier.queryMaterials({
  maxValue: 5.0,
  minDurability: 30
});
budgetMaterials.forEach(m => {
  console.log(`  - ${m.name}: value=${m.value}x, durability=${m.durability}`);
});

console.log('\n=== END OF EXAMPLES ===');
