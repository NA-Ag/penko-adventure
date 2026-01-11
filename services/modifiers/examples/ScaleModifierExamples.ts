/**
 * Examples demonstrating SCRIBBLENAUTS PARITY 2.2: Scale Modifiers
 *
 * Shows how the scale system affects object properties.
 */

import { ScaleModifier } from '../ScaleModifier';

console.log('=== SCRIBBLENAUTS PARITY 2.2: Scale Modifiers Examples ===\n');

const scaleMod = new ScaleModifier();

// Example 1: Basic scale lookup
console.log('=== Example 1: Basic Scale Lookup ===');
const tiny = scaleMod.getScale('tiny');
if (tiny) {
  console.log(`Name: ${tiny.name}`);
  console.log(`Tier: ${tiny.tier}`);
  console.log(`Multiplier: ${tiny.multiplier}x`);
  console.log(`Weight multiplier: ${tiny.weightMultiplier}x`);
  console.log(`Strength multiplier: ${tiny.strengthMultiplier}x`);
  console.log(`Speed multiplier: ${tiny.speedMultiplier}x`);
  console.log(`Category: ${tiny.category}`);
  console.log(`Aliases: [${tiny.aliases.join(', ')}]`);
}

// Example 2: Scale alias lookup
console.log('\n=== Example 2: Scale Alias (Miniature → Tiny) ===');
const miniature = scaleMod.parse('miniature');
console.log(`Input: "miniature"`);
console.log(`Is valid: ${miniature.isValid}`);
console.log(`Resolved name: ${miniature.resolvedName}`);
if (miniature.scale) {
  console.log(`Canonical name: ${miniature.scale.name}`);
  console.log(`Multiplier: ${miniature.scale.multiplier}x`);
}

// Example 3: All scales sorted by tier
console.log('\n=== Example 3: All Scales (Tier Order) ===');
const allScales = scaleMod.getAllScalesSorted();
console.log(`Total scales: ${allScales.length}`);
allScales.forEach(s => {
  console.log(`  ${s.tier}. ${s.name.padEnd(15)} - ${s.multiplier.toFixed(2)}x (${s.category})`);
});

// Example 4: Small scales
console.log('\n=== Example 4: Small Scales ===');
const smallScales = scaleMod.getSmallScales();
console.log(`Scales smaller than normal: ${smallScales.length}`);
smallScales.forEach(s => {
  console.log(`  ${s.name}: ${s.multiplier}x`);
});

// Example 5: Large scales
console.log('\n=== Example 5: Large Scales ===');
const largeScales = scaleMod.getLargeScales();
console.log(`Scales larger than normal: ${largeScales.length}`);
largeScales.forEach(s => {
  console.log(`  ${s.name}: ${s.multiplier}x`);
});

// Example 6: Apply scale to object - tiny sword
console.log('\n=== Example 6: Tiny Sword ===');
const swordProps = { can_be_held: true, weight: 5, damage: 10 };
const tinySword = scaleMod.applyScaleToProperties(swordProps, 'tiny');
console.log(`Original sword: weight=${swordProps.weight}, damage=${swordProps.damage}`);
console.log(`Tiny sword: weight=${tinySword.weight}, damage=${tinySword.damage}`);
console.log(`Can be held: ${tinySword.can_be_held}`);
console.log(`Is heavy: ${tinySword.is_heavy}`);
console.log(`Traits: [${tinySword.traits?.join(', ')}]`);

// Example 7: Apply scale to object - gigantic sword
console.log('\n=== Example 7: Gigantic Sword ===');
const giganticSword = scaleMod.applyScaleToProperties(swordProps, 'gigantic');
console.log(`Original sword: weight=${swordProps.weight}, damage=${swordProps.damage}`);
console.log(`Gigantic sword: weight=${giganticSword.weight}, damage=${giganticSword.damage}`);
console.log(`Can be held: ${giganticSword.can_be_held}`);
console.log(`Is heavy: ${giganticSword.is_heavy}`);
console.log(`Traits: [${giganticSword.traits?.join(', ')}]`);

// Example 8: Scale comparison
console.log('\n=== Example 8: Scale Comparison ===');
const comparison1 = scaleMod.compareScales('tiny', 'huge');
console.log(`Tiny vs Huge: ${comparison1}`);
console.log(`Relative size: ${scaleMod.getRelativeSize('tiny', 'huge')}`);

const comparison2 = scaleMod.compareScales('gigantic', 'small');
console.log(`Gigantic vs Small: ${comparison2}`);
console.log(`Relative size: ${scaleMod.getRelativeSize('gigantic', 'small')}`);

// Example 9: Speed multipliers
console.log('\n=== Example 9: Speed by Scale ===');
['microscopic', 'tiny', 'normal', 'huge', 'astronomical'].forEach(scale => {
  const speedMult = scaleMod.getSpeedMultiplier(scale);
  console.log(`${scale}: ${speedMult}x speed`);
});

// Example 10: Defense multipliers
console.log('\n=== Example 10: Defense by Scale ===');
['tiny', 'normal', 'huge', 'titanic'].forEach(scale => {
  const defenseMult = scaleMod.getDefenseMultiplier(scale);
  console.log(`${scale}: ${defenseMult}x defense`);
});

// Example 11: Next larger/smaller scales
console.log('\n=== Example 11: Scale Progression ===');
const current = 'normal';
const nextLarger = scaleMod.getNextLargerScale(current);
const nextSmaller = scaleMod.getNextSmallerScale(current);
console.log(`Current: ${current}`);
console.log(`Next larger: ${nextLarger?.name} (${nextLarger?.multiplier}x)`);
console.log(`Next smaller: ${nextSmaller?.name} (${nextSmaller?.multiplier}x)`);

// Example 12: Intermediate scale
console.log('\n=== Example 12: Intermediate Scale ===');
const intermediate = scaleMod.getIntermediateScale('tiny', 'huge');
console.log(`Between tiny (${scaleMod.getScale('tiny')?.multiplier}x) and huge (${scaleMod.getScale('huge')?.multiplier}x):`);
if (intermediate) {
  console.log(`  Intermediate: ${intermediate.name} (${intermediate.multiplier}x)`);
}

// Example 13: Volume and surface area ratios
console.log('\n=== Example 13: Physics - Volume & Surface Area ===');
const scalesForPhysics = ['tiny', 'normal', 'huge'];
scalesForPhysics.forEach(scale => {
  const volume = scaleMod.getVolumeRatio(scale);
  const surfaceArea = scaleMod.getSurfaceAreaRatio(scale);
  console.log(`${scale}:`);
  console.log(`  Volume ratio: ${volume.toFixed(2)}x`);
  console.log(`  Surface area ratio: ${surfaceArea.toFixed(2)}x`);
});

// Example 14: Carrying capacity
console.log('\n=== Example 14: Carrying Capacity ===');
['tiny', 'small', 'normal', 'large', 'gigantic'].forEach(scale => {
  const capacity = scaleMod.getCarryingCapacityMultiplier(scale);
  console.log(`${scale}: ${capacity}x carrying capacity`);
});

// Example 15: Can fit through door?
console.log('\n=== Example 15: Can Fit Through Door? ===');
allScales.forEach(scale => {
  const canFit = scaleMod.canFitThroughDoor(scale.name);
  console.log(`${scale.name.padEnd(15)}: ${canFit ? 'YES' : 'NO'}`);
});

// Example 16: Scales by category
console.log('\n=== Example 16: Scales by Category ===');
const categories = ['extreme_small', 'small', 'normal', 'large', 'extreme_large'] as const;
categories.forEach(cat => {
  const scales = scaleMod.getScalesByCategory(cat);
  console.log(`${cat}: ${scales.map(s => s.name).join(', ')}`);
});

// Example 17: Scale validation
console.log('\n=== Example 17: Scale Validation ===');
const testScales = ['tiny', 'xyz', 'huge', 'florp', 'miniature', 'giant'];
testScales.forEach(s => {
  const isValid = scaleMod.isValidScale(s);
  console.log(`"${s}" is ${isValid ? 'VALID' : 'INVALID'}`);
});

// Example 18: All scale names (including aliases)
console.log('\n=== Example 18: All Scale Names ===');
const allNames = scaleMod.getAllScaleNames();
console.log(`Total scale names (including aliases): ${allNames.length}`);
console.log(`Actual scale definitions: ${scaleMod.getScaleCount()}`);
console.log(`Sample names: ${allNames.slice(0, 15).join(', ')}...`);

// Example 19: Scaling rules
console.log('\n=== Example 19: Scaling Rules ===');
const rules = scaleMod.getScalingRules();
console.log(`Damage formula: ${rules.damage.formula}`);
console.log(`Weight formula: ${rules.weight.formula}`);
console.log(`Health formula: ${rules.health.formula}`);
console.log(`Max holdable size: ${rules.canBeHeld.maxMultiplier}x`);
console.log(`Heavy threshold: ${rules.isHeavy.minMultiplier}x`);

// Example 20: Extreme scales comparison
console.log('\n=== Example 20: Microscopic vs Astronomical ===');
const micro = scaleMod.getScale('microscopic');
const astro = scaleMod.getScale('astronomical');
if (micro && astro) {
  console.log(`Microscopic: ${micro.multiplier}x`);
  console.log(`Astronomical: ${astro.multiplier}x`);
  const ratio = astro.multiplier / micro.multiplier;
  console.log(`Astronomical is ${ratio.toLocaleString()}x larger than microscopic!`);
}

// Example 21: Health scaling for creatures
console.log('\n=== Example 21: Creature Health Scaling ===');
const baseHealth = 100;
['tiny', 'normal', 'huge', 'titanic'].forEach(scale => {
  const props = scaleMod.applyScaleToProperties({ health_restore: baseHealth }, scale);
  console.log(`${scale} creature: ${props.health_restore} HP (base: ${baseHealth})`);
});

// Example 22: Progressive scale application
console.log('\n=== Example 22: Progressive Scaling (Weapon) ===');
const baseWeapon = { weight: 10, damage: 15 };
console.log(`Base weapon: weight=${baseWeapon.weight}, damage=${baseWeapon.damage}`);
console.log('');

const progressiveScales = ['tiny', 'small', 'normal', 'large', 'huge'];
progressiveScales.forEach(scale => {
  const scaled = scaleMod.applyScaleToProperties({ ...baseWeapon }, scale);
  console.log(`${scale.padEnd(10)}: weight=${scaled.weight?.toFixed(1).padStart(6)}, damage=${scaled.damage?.toString().padStart(3)}`);
});

// Example 23: Alias resolution
console.log('\n=== Example 23: Alias Resolution ===');
const aliases = [
  { alias: 'mini', expected: 'tiny' },
  { alias: 'giant', expected: 'gigantic' },
  { alias: 'big', expected: 'large' },
  { alias: 'massive', expected: 'huge' }
];

aliases.forEach(({ alias, expected }) => {
  const parsed = scaleMod.parse(alias);
  console.log(`"${alias}" → ${parsed.resolvedName} (expected: ${expected})`);
});

// Example 24: Case insensitivity
console.log('\n=== Example 24: Case Insensitivity ===');
const cases = ['TINY', 'Tiny', 'tiny', 'tInY'];
cases.forEach(c => {
  const parsed = scaleMod.parse(c);
  console.log(`"${c}" → valid: ${parsed.isValid}, resolved: ${parsed.resolvedName}`);
});

// Example 25: Complex scaling scenario
console.log('\n=== Example 25: Complex Scenario - Dragon Scales ===');
const dragonBase = {
  weight: 500,
  damage: 30,
  health_restore: 200,
  can_be_held: false
};

const scales = ['tiny', 'normal', 'titanic'];
console.log('Dragon at different scales:');
scales.forEach(scale => {
  const dragon = scaleMod.applyScaleToProperties({ ...dragonBase }, scale);
  console.log(`\n${scale.toUpperCase()} dragon:`);
  console.log(`  Weight: ${dragon.weight}`);
  console.log(`  Damage: ${dragon.damage}`);
  console.log(`  Health: ${dragon.health_restore}`);
  console.log(`  Can be held: ${dragon.can_be_held}`);
  console.log(`  Is heavy: ${dragon.is_heavy}`);
});

console.log('\n=== All Examples Complete ===');
