import { PropertyCompositor, ConflictResolution } from '../PropertyCompositor';
import { ColorModifier } from '../ColorModifier';
import { ScaleModifier } from '../ScaleModifier';
import { MaterialModifier } from '../MaterialModifier';
import { ObjectProperties } from '../../community/ObjectSystem';

/**
 * PropertyCompositorExamples - Demonstrates property combination system
 *
 * This file shows examples of:
 * 1. Simple modifier combinations
 * 2. Conflict detection and resolution
 * 3. Complex multi-modifier objects
 * 4. Composition preview
 * 5. Validation warnings
 */

// Initialize modifiers
const colorModifier = new ColorModifier();
const scaleModifier = new ScaleModifier();
const materialModifier = new MaterialModifier();

const compositor = new PropertyCompositor(colorModifier, scaleModifier, materialModifier);

console.log('=== PROPERTY COMPOSITOR EXAMPLES ===\n');

// ============================================================================
// Example 1: Simple Modifier Combination
// ============================================================================
console.log('--- Example 1: Simple Modifier Combination ---');

const baseSword: ObjectProperties = {
  can_be_held: true,
  is_sharp: true,
  damage: 10,
  weight: 5,
  traits: ['weapon']
};

console.log('Base sword:', JSON.stringify(baseSword, null, 2));

// Red iron sword
const redIronSword = compositor.composeProperties(baseSword, ['red', 'iron']);
console.log('\n"red iron sword":');
console.log('Applied modifiers:', redIronSword.appliedModifiers.map(m => `${m.modifierType}: ${m.adjective}`));
console.log('Final weight:', redIronSword.finalProperties.weight); // ~39 (5 * 7.8)
console.log('Final durability:', redIronSword.finalProperties.durability); // 70
console.log('Traits include color_red?', redIronSword.finalProperties.traits?.includes('color_red'));
console.log('Traits include material_iron?', redIronSword.finalProperties.traits?.includes('material_iron'));
console.log('Conflicts:', redIronSword.conflicts);
console.log('Warnings:', redIronSword.warnings);

console.log('');

// ============================================================================
// Example 2: Size and Material Combination
// ============================================================================
console.log('--- Example 2: Size and Material Combination ---');

// Big wooden door
const baseDoor: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  weight: 20,
  traits: ['structure']
};

const bigWoodenDoor = compositor.composeProperties(baseDoor, ['big', 'wooden']);
console.log('"big wooden door":');
console.log('Original weight:', baseDoor.weight);
console.log('Final weight:', bigWoodenDoor.finalProperties.weight); // 20 * 2.0 * 0.6 = 24
console.log('Is flammable?', bigWoodenDoor.finalProperties.is_flammable); // true (from wooden)
console.log('Can float?', bigWoodenDoor.finalProperties.can_float); // true (from wooden)
console.log('Durability:', bigWoodenDoor.finalProperties.durability); // 30 (from wooden)
console.log('Applied modifiers:', bigWoodenDoor.appliedModifiers.length);

console.log('');

// ============================================================================
// Example 3: Size Conflicts - Last Wins
// ============================================================================
console.log('--- Example 3: Size Conflicts - Last Wins ---');

// Tiny huge door
const tinyHugeDoor = compositor.composeProperties(baseDoor, ['tiny', 'huge']);
console.log('"tiny huge door":');
console.log('Conflicts:', JSON.stringify(tinyHugeDoor.conflicts, null, 2));
console.log('Resolution: Last scale wins');
console.log('Final weight:', tinyHugeDoor.finalProperties.weight); // Should be huge (20 * 5.0 = 100)
console.log('Is heavy?', tinyHugeDoor.finalProperties.is_heavy); // true (from huge)

// Huge tiny door (opposite order)
const hugeTinyDoor = compositor.composeProperties(baseDoor, ['huge', 'tiny']);
console.log('\n"huge tiny door":');
console.log('Final weight:', hugeTinyDoor.finalProperties.weight); // Should be tiny (20 * 0.1 = 2)
console.log('Is heavy?', hugeTinyDoor.finalProperties.is_heavy); // false (from tiny)

console.log('');

// ============================================================================
// Example 4: Color Accumulation
// ============================================================================
console.log('--- Example 4: Color Accumulation ---');

// Red blue green door
const rainbowDoor = compositor.composeProperties(baseDoor, ['red', 'blue', 'green']);
console.log('"red blue green door":');
console.log('Conflicts:', JSON.stringify(rainbowDoor.conflicts, null, 2));
console.log('All colors in traits?');
console.log('  - color_red:', rainbowDoor.finalProperties.traits?.includes('color_red'));
console.log('  - color_blue:', rainbowDoor.finalProperties.traits?.includes('color_blue'));
console.log('  - color_green:', rainbowDoor.finalProperties.traits?.includes('color_green'));
console.log('Total traits:', rainbowDoor.finalProperties.traits?.length);

console.log('');

// ============================================================================
// Example 5: Material Conflicts - Last Wins
// ============================================================================
console.log('--- Example 5: Material Conflicts - Last Wins ---');

// Wooden steel door
const woodenSteelDoor = compositor.composeProperties(baseDoor, ['wooden', 'steel']);
console.log('"wooden steel door":');
console.log('Conflicts:', JSON.stringify(woodenSteelDoor.conflicts, null, 2));
console.log('Warnings:', woodenSteelDoor.warnings);
console.log('Final durability:', woodenSteelDoor.finalProperties.durability); // 90 (steel wins)
console.log('Final weight:', woodenSteelDoor.finalProperties.weight); // 156 (20 * 7.8 from steel)
console.log('Is flammable?', woodenSteelDoor.finalProperties.is_flammable); // false (steel overrides)

// Steel wooden door (opposite order)
const steelWoodenDoor = compositor.composeProperties(baseDoor, ['steel', 'wooden']);
console.log('\n"steel wooden door":');
console.log('Final durability:', steelWoodenDoor.finalProperties.durability); // 30 (wooden wins)
console.log('Final weight:', steelWoodenDoor.finalProperties.weight); // 12 (20 * 0.6 from wooden)
console.log('Is flammable?', steelWoodenDoor.finalProperties.is_flammable); // true (wooden wins)

console.log('');

// ============================================================================
// Example 6: Complex Multi-Modifier Object
// ============================================================================
console.log('--- Example 6: Complex Multi-Modifier Object ---');

// Big heavy iron enchanted sharp sword
const epicSword = compositor.composeProperties(
  baseSword,
  ['big', 'heavy', 'iron', 'enchanted', 'sharp']
);
console.log('"big heavy iron enchanted sharp sword":');
console.log('Applied modifiers:');
epicSword.appliedModifiers.forEach((m, i) => {
  console.log(`  ${i + 1}. ${m.modifierType}: ${m.adjective}`);
});
console.log('\nFinal stats:');
console.log('  Weight:', epicSword.finalProperties.weight);
// 5 (base) * 2.0 (big) * 2.0 (heavy) * 7.8 (iron) = 156
console.log('  Damage:', epicSword.finalProperties.damage);
// 10 (base) * ~1.6 (big scale) * 1.3 (sharp) * 1.5 (enchanted) = ~31.2
console.log('  Durability:', epicSword.finalProperties.durability); // 70 (iron)
console.log('  Is sharp?', epicSword.finalProperties.is_sharp); // true
console.log('  Is heavy?', epicSword.finalProperties.is_heavy); // true
console.log('  Traits:', epicSword.finalProperties.traits);

console.log('');

// ============================================================================
// Example 7: State Modifiers
// ============================================================================
console.log('--- Example 7: State Modifiers ---');

// Locked iron door
const lockedDoor = compositor.composeProperties(baseDoor, ['locked', 'iron']);
console.log('"locked iron door":');
console.log('Is locked?', lockedDoor.finalProperties.is_locked); // true
console.log('Is open?', lockedDoor.finalProperties.is_open); // false (locked implies closed)
console.log('Can be locked?', lockedDoor.finalProperties.can_be_locked); // true
console.log('Can be opened?', lockedDoor.finalProperties.can_be_opened); // true

// Broken glass door
const brokenGlassDoor = compositor.composeProperties(baseDoor, ['broken', 'glass']);
console.log('\n"broken glass door":');
console.log('Is broken?', brokenGlassDoor.finalProperties.is_broken); // true
console.log('Durability:', brokenGlassDoor.finalProperties.durability); // 20 (glass)
console.log('Is fragile?', brokenGlassDoor.finalProperties.is_fragile); // true (glass)

console.log('');

// ============================================================================
// Example 8: Quality Modifiers
// ============================================================================
console.log('--- Example 8: Quality Modifiers ---');

// Sharp rusty iron sword
const rustySharpSword = compositor.composeProperties(
  baseSword,
  ['sharp', 'rusty', 'iron']
);
console.log('"sharp rusty iron sword":');
console.log('Base damage:', baseSword.damage);
console.log('Final damage:', rustySharpSword.finalProperties.damage);
// 10 * 1.3 (sharp) * 0.8 (rusty) = 10.4
console.log('Is sharp?', rustySharpSword.finalProperties.is_sharp); // true
console.log('Has rusty trait?', rustySharpSword.finalProperties.traits?.includes('rusty')); // true

// Hot iron sword
const hotIronSword = compositor.composeProperties(baseSword, ['hot', 'iron']);
console.log('\n"hot iron sword":');
console.log('Is hot?', hotIronSword.finalProperties.is_hot); // true
console.log('Is lit?', hotIronSword.finalProperties.is_lit); // true

console.log('');

// ============================================================================
// Example 9: Logical Validation Warnings
// ============================================================================
console.log('--- Example 9: Logical Validation Warnings ---');

// Hot cold sword (contradiction)
const hotColdSword = compositor.composeProperties(baseSword, ['hot', 'cold']);
console.log('"hot cold sword":');
console.log('Warnings:', hotColdSword.warnings);
console.log('Is hot?', hotColdSword.finalProperties.is_hot); // false
console.log('Is cold?', hotColdSword.finalProperties.is_cold); // true (cold wins)

// Open locked door (contradiction)
const openLockedDoor = compositor.composeProperties(baseDoor, ['open', 'locked']);
console.log('\n"open locked door":');
console.log('Warnings:', openLockedDoor.warnings);
console.log('Is open?', openLockedDoor.finalProperties.is_open); // false
console.log('Is locked?', openLockedDoor.finalProperties.is_locked); // true

// Hot wooden sword (dangerous)
const hotWoodenSword = compositor.composeProperties(baseSword, ['hot', 'wooden']);
console.log('\n"hot wooden sword":');
console.log('Warnings:', hotWoodenSword.warnings);
console.log('Is flammable?', hotWoodenSword.finalProperties.is_flammable); // true
console.log('Is hot?', hotWoodenSword.finalProperties.is_hot); // true
console.log('Has on_fire trait?', hotWoodenSword.finalProperties.traits?.includes('on_fire')); // true

console.log('');

// ============================================================================
// Example 10: Composition Preview (Dry Run)
// ============================================================================
console.log('--- Example 10: Composition Preview (Dry Run) ---');

const preview1 = compositor.previewComposition(baseSword, ['red', 'huge', 'steel', 'sharp', 'locked']);
console.log('Preview: "red huge steel sharp locked sword"');
console.log('Colors:', preview1.colors);
console.log('Scales:', preview1.scales);
console.log('Materials:', preview1.materials);
console.log('Qualities:', preview1.qualities);
console.log('States:', preview1.states);
console.log('Potential conflicts:', preview1.potentialConflicts);

const preview2 = compositor.previewComposition(baseDoor, ['tiny', 'huge', 'red', 'blue', 'wooden', 'steel']);
console.log('\nPreview: "tiny huge red blue wooden steel door"');
console.log('Potential conflicts:', preview2.potentialConflicts);

console.log('');

// ============================================================================
// Example 11: All Modifier Types Combined
// ============================================================================
console.log('--- Example 11: All Modifier Types Combined ---');

// Tiny red glass locked broken door
const complexDoor = compositor.composeProperties(
  baseDoor,
  ['tiny', 'red', 'glass', 'locked', 'broken']
);
console.log('"tiny red glass locked broken door":');
console.log('Summary:');
console.log('  - Size: tiny');
console.log('  - Color: red');
console.log('  - Material: glass');
console.log('  - States: locked, broken');
console.log('\nFinal properties:');
console.log('  Weight:', complexDoor.finalProperties.weight); // 20 * 0.1 * 2.5 = 5
console.log('  Durability:', complexDoor.finalProperties.durability); // 20 (glass)
console.log('  Is locked?', complexDoor.finalProperties.is_locked); // true
console.log('  Is broken?', complexDoor.finalProperties.is_broken); // true
console.log('  Is fragile?', complexDoor.finalProperties.is_fragile); // true (glass)
console.log('  Is transparent?', complexDoor.finalProperties.is_transparent); // true (glass)
console.log('\nApplied modifiers:', complexDoor.appliedModifiers.length);
console.log('Conflicts:', complexDoor.conflicts.length);
console.log('Warnings:', complexDoor.warnings.length);

console.log('');

// ============================================================================
// Example 12: Real Game Scenarios
// ============================================================================
console.log('--- Example 12: Real Game Scenarios ---');

// Scenario 1: Creating a powerful legendary weapon
console.log('Scenario 1: Legendary Weapon');
const legendaryWeapon = compositor.composeProperties(
  { can_be_held: true, is_sharp: true, damage: 15, weight: 8, traits: [] },
  ['huge', 'golden', 'enchanted', 'shiny', 'powerful']
);
console.log('"huge golden enchanted shiny powerful sword":');
console.log('  Damage:', legendaryWeapon.finalProperties.damage); // Massive
console.log('  Weight:', legendaryWeapon.finalProperties.weight); // Very heavy
console.log('  Value:', legendaryWeapon.finalProperties.value); // Very valuable (gold)
console.log('  Traits:', legendaryWeapon.finalProperties.traits?.filter(t =>
    t === 'magical' || t === 'shiny'
  ));

// Scenario 2: Creating a secure vault door
console.log('\nScenario 2: Vault Door');
const vaultDoor = compositor.composeProperties(
  { is_solid: true, can_be_opened: true, weight: 50, traits: [] },
  ['huge', 'adamantine', 'locked']
);
console.log('"huge adamantine locked door":');
console.log('  Weight:', vaultDoor.finalProperties.weight); // Extremely heavy
console.log('  Durability:', vaultDoor.finalProperties.durability); // 150 (adamantine)
console.log('  Is locked?', vaultDoor.finalProperties.is_locked); // true
console.log('  Physical resistance:', vaultDoor.finalProperties.resistance?.physical); // 0.95

// Scenario 3: Creating a magical scroll
console.log('\nScenario 3: Magical Scroll');
const magicalScroll = compositor.composeProperties(
  { can_be_held: true, can_be_read: true, weight: 0.5, traits: [] },
  ['tiny', 'paper', 'enchanted']
);
console.log('"tiny paper enchanted scroll":');
console.log('  Weight:', magicalScroll.finalProperties.weight); // Ultra-light
console.log('  Durability:', magicalScroll.finalProperties.durability); // 10 (paper)
console.log('  Is flammable?', magicalScroll.finalProperties.is_flammable); // true
console.log('  Has magical trait?', magicalScroll.finalProperties.traits?.includes('magical')); // true
console.log('  Warnings:', magicalScroll.warnings);

// Scenario 4: Creating a trap object
console.log('\nScenario 4: Trap Object');
const trapChest = compositor.composeProperties(
  { can_be_opened: true, can_contain: ['*'], weight: 15, traits: [] },
  ['small', 'wooden', 'locked', 'cursed']
);
console.log('"small wooden locked cursed chest":');
console.log('  Weight:', trapChest.finalProperties.weight); // Light
console.log('  Is locked?', trapChest.finalProperties.is_locked); // true
console.log('  Has cursed trait?', trapChest.finalProperties.traits?.includes('cursed')); // true
console.log('  Is flammable?', trapChest.finalProperties.is_flammable); // true

console.log('\n=== END OF EXAMPLES ===');
