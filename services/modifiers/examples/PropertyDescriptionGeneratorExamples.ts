import { PropertyDescriptionGenerator } from '../PropertyDescriptionGenerator';
import { ColorModifier } from '../ColorModifier';
import { ScaleModifier } from '../ScaleModifier';
import { MaterialModifier } from '../MaterialModifier';
import { ObjectProperties } from '../../community/ObjectSystem';
import { Language } from '../../../types';

/**
 * PropertyDescriptionGeneratorExamples - Demonstrates description generation
 *
 * This file shows examples of:
 * 1. Short descriptions
 * 2. Detailed descriptions
 * 3. Examining descriptions
 * 4. Multilingual support
 * 5. Various property combinations
 */

// Initialize modifiers and generator
const colorModifier = new ColorModifier();
const scaleModifier = new ScaleModifier();
const materialModifier = new MaterialModifier();

const generator = new PropertyDescriptionGenerator(
  colorModifier,
  scaleModifier,
  materialModifier
);

console.log('=== PROPERTY DESCRIPTION GENERATOR EXAMPLES ===\n');

// ============================================================================
// Example 1: Simple Object - Red Door
// ============================================================================
console.log('--- Example 1: Simple Object - Red Door ---');

const redDoorProps: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  weight: 20,
  traits: ['structure', 'color_red', 'hex_#FF0000']
};

const redDoorDesc = generator.generateDescriptions('door', redDoorProps, Language.ENGLISH);
console.log('Short:', redDoorDesc.short);
console.log('Detailed:', redDoorDesc.detailed);
console.log('Examining:', redDoorDesc.examining);

console.log('');

// ============================================================================
// Example 2: Complex Object - Big Heavy Iron Door
// ============================================================================
console.log('--- Example 2: Complex Object - Big Heavy Iron Door ---');

const bigIronDoorProps: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  weight: 312,
  is_heavy: true,
  durability: 70,
  traits: ['structure', 'scale_large', 'material_iron']
};

const bigIronDoorDesc = generator.generateDescriptions('door', bigIronDoorProps, Language.ENGLISH);
console.log('Short:', bigIronDoorDesc.short);
console.log('Detailed:', bigIronDoorDesc.detailed);
console.log('Examining:', bigIronDoorDesc.examining);

console.log('');

// ============================================================================
// Example 3: Weapon - Tiny Wooden Sword
// ============================================================================
console.log('--- Example 3: Weapon - Tiny Wooden Sword ---');

const tinySwordProps: ObjectProperties = {
  can_be_held: true,
  is_sharp: true,
  damage: 3.6,
  weight: 0.3,
  is_flammable: true,
  durability: 30,
  traits: ['weapon', 'scale_tiny', 'material_wooden']
};

const tinySwordDesc = generator.generateDescriptions('sword', tinySwordProps, Language.ENGLISH);
console.log('Short:', tinySwordDesc.short);
console.log('Detailed:', tinySwordDesc.detailed);
console.log('Examining:', tinySwordDesc.examining);

console.log('');

// ============================================================================
// Example 4: Magical Item - Huge Golden Enchanted Sword
// ============================================================================
console.log('--- Example 4: Magical Item - Huge Golden Enchanted Sword ---');

const magicalSwordProps: ObjectProperties = {
  can_be_held: true,
  is_sharp: true,
  is_heavy: true,
  damage: 62,
  weight: 965,
  value: 2500,
  durability: 60,
  traits: ['weapon', 'scale_huge', 'material_golden', 'color_gold', 'magical', 'shiny']
};

const magicalSwordDesc = generator.generateDescriptions('sword', magicalSwordProps, Language.ENGLISH);
console.log('Short:', magicalSwordDesc.short);
console.log('Detailed:', magicalSwordDesc.detailed);
console.log('Examining:', magicalSwordDesc.examining);

console.log('');

// ============================================================================
// Example 5: Fragile Object - Glass Door
// ============================================================================
console.log('--- Example 5: Fragile Object - Glass Door ---');

const glassDoorProps: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  is_fragile: true,
  is_transparent: true,
  weight: 50,
  durability: 20,
  traits: ['structure', 'material_glass']
};

const glassDoorDesc = generator.generateDescriptions('door', glassDoorProps, Language.ENGLISH);
console.log('Short:', glassDoorDesc.short);
console.log('Detailed:', glassDoorDesc.detailed);
console.log('Examining:', glassDoorDesc.examining);

console.log('');

// ============================================================================
// Example 6: State Properties - Locked Iron Door
// ============================================================================
console.log('--- Example 6: State Properties - Locked Iron Door ---');

const lockedDoorProps: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  can_be_locked: true,
  is_locked: true,
  is_open: false,
  weight: 156,
  durability: 70,
  traits: ['structure', 'material_iron']
};

const lockedDoorDesc = generator.generateDescriptions('door', lockedDoorProps, Language.ENGLISH);
console.log('Short:', lockedDoorDesc.short);
console.log('Detailed:', lockedDoorDesc.detailed);
console.log('Examining:', lockedDoorDesc.examining);

console.log('');

// ============================================================================
// Example 7: Hot Object - Hot Iron Sword
// ============================================================================
console.log('--- Example 7: Hot Object - Hot Iron Sword ---');

const hotSwordProps: ObjectProperties = {
  can_be_held: true,
  is_sharp: true,
  is_hot: true,
  is_lit: true,
  damage: 10,
  weight: 39,
  durability: 70,
  traits: ['weapon', 'material_iron']
};

const hotSwordDesc = generator.generateDescriptions('sword', hotSwordProps, Language.ENGLISH);
console.log('Short:', hotSwordDesc.short);
console.log('Detailed:', hotSwordDesc.detailed);
console.log('Examining:', hotSwordDesc.examining);

console.log('');

// ============================================================================
// Example 8: Broken Object - Broken Wooden Door
// ============================================================================
console.log('--- Example 8: Broken Object - Broken Wooden Door ---');

const brokenDoorProps: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  is_broken: true,
  is_flammable: true,
  weight: 12,
  durability: 30,
  traits: ['structure', 'material_wooden']
};

const brokenDoorDesc = generator.generateDescriptions('door', brokenDoorProps, Language.ENGLISH);
console.log('Short:', brokenDoorDesc.short);
console.log('Detailed:', brokenDoorDesc.detailed);
console.log('Examining:', brokenDoorDesc.examining);

console.log('');

// ============================================================================
// Example 9: Cursed Item - Small Rusty Cursed Sword
// ============================================================================
console.log('--- Example 9: Cursed Item - Small Rusty Cursed Sword ---');

const cursedSwordProps: ObjectProperties = {
  can_be_held: true,
  is_sharp: true,
  damage: 4,
  weight: 2.5,
  traits: ['weapon', 'scale_small', 'material_iron', 'rusty', 'cursed']
};

const cursedSwordDesc = generator.generateDescriptions('sword', cursedSwordProps, Language.ENGLISH);
console.log('Short:', cursedSwordDesc.short);
console.log('Detailed:', cursedSwordDesc.detailed);
console.log('Examining:', cursedSwordDesc.examining);

console.log('');

// ============================================================================
// Example 10: Multilingual - Red Iron Door in Spanish
// ============================================================================
console.log('--- Example 10: Multilingual - Red Iron Door in Spanish ---');

const redIronDoorProps: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  weight: 156,
  durability: 70,
  traits: ['structure', 'color_red', 'material_iron']
};

const spanishDesc = generator.generateDescriptions('puerta', redIronDoorProps, Language.SPANISH);
console.log('Short (Spanish):', spanishDesc.short);
console.log('Detailed (Spanish):', spanishDesc.detailed);
console.log('Examining (Spanish):', spanishDesc.examining);

console.log('');

// ============================================================================
// Example 11: Multilingual - Huge Golden Sword in Japanese
// ============================================================================
console.log('--- Example 11: Multilingual - Huge Golden Sword in Japanese ---');

const japaneseDesc = generator.generateDescriptions('剣', magicalSwordProps, Language.JAPANESE);
console.log('Short (Japanese):', japaneseDesc.short);
console.log('Detailed (Japanese):', japaneseDesc.detailed);
console.log('Examining (Japanese):', japaneseDesc.examining);

console.log('');

// ============================================================================
// Example 12: Multilingual - Tiny Wooden Sword in French
// ============================================================================
console.log('--- Example 12: Multilingual - Tiny Wooden Sword in French ---');

const frenchDesc = generator.generateDescriptions('épée', tinySwordProps, Language.FRENCH);
console.log('Short (French):', frenchDesc.short);
console.log('Detailed (French):', frenchDesc.detailed);
console.log('Examining (French):', frenchDesc.examining);

console.log('');

// ============================================================================
// Example 13: All Properties Combined - Tiny Red Glass Locked Broken Door
// ============================================================================
console.log('--- Example 13: All Properties Combined ---');

const complexDoorProps: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  can_be_locked: true,
  is_locked: true,
  is_open: false,
  is_broken: true,
  is_fragile: true,
  is_transparent: true,
  weight: 5,
  durability: 20,
  traits: ['structure', 'scale_tiny', 'color_red', 'material_glass']
};

const complexDoorDesc = generator.generateDescriptions('door', complexDoorProps, Language.ENGLISH);
console.log('Short:', complexDoorDesc.short);
console.log('Detailed:', complexDoorDesc.detailed);
console.log('Examining:', complexDoorDesc.examining);

console.log('');

// ============================================================================
// Example 14: Comparison - Same Object in Different Languages
// ============================================================================
console.log('--- Example 14: Comparison - Same Object in Different Languages ---');

const testProps: ObjectProperties = {
  can_be_held: true,
  is_sharp: true,
  is_heavy: true,
  damage: 31,
  weight: 156,
  durability: 90,
  traits: ['weapon', 'scale_large', 'material_steel', 'shiny']
};

console.log('English:');
const enDesc = generator.generateDescriptions('sword', testProps, Language.ENGLISH);
console.log('  Short:', enDesc.short);

console.log('\nSpanish:');
const esDesc = generator.generateDescriptions('espada', testProps, Language.SPANISH);
console.log('  Short:', esDesc.short);

console.log('\nFrench:');
const frDesc = generator.generateDescriptions('épée', testProps, Language.FRENCH);
console.log('  Short:', frDesc.short);

console.log('\nGerman:');
const deDesc = generator.generateDescriptions('schwert', testProps, Language.GERMAN);
console.log('  Short:', deDesc.short);

console.log('\nJapanese:');
const jaDesc = generator.generateDescriptions('剣', testProps, Language.JAPANESE);
console.log('  Short:', jaDesc.short);

console.log('\nChinese (Simplified):');
const zhDesc = generator.generateDescriptions('剑', testProps, Language.CHINESE_SIMPLIFIED);
console.log('  Short:', zhDesc.short);

console.log('\nPortuguese:');
const ptDesc = generator.generateDescriptions('espada', testProps, Language.PORTUGUESE);
console.log('  Short:', ptDesc.short);

console.log('\nItalian:');
const itDesc = generator.generateDescriptions('spada', testProps, Language.ITALIAN);
console.log('  Short:', itDesc.short);

console.log('');

// ============================================================================
// Example 15: Real Game Scenarios
// ============================================================================
console.log('--- Example 15: Real Game Scenarios ---');

// Scenario 1: Player creates a weapon
console.log('Scenario 1: Player creates "create big sharp steel sword"');
const playerWeaponProps: ObjectProperties = {
  can_be_held: true,
  is_sharp: true,
  damage: 26,
  weight: 78,
  durability: 90,
  traits: ['weapon', 'scale_large', 'material_steel']
};
const weaponDesc = generator.generateDescriptions('sword', playerWeaponProps, Language.ENGLISH);
console.log('  Player sees:', weaponDesc.short);
console.log('  When examining:', weaponDesc.examining);

// Scenario 2: Player encounters a locked door
console.log('\nScenario 2: Player encounters locked door');
const encounterDoorProps: ObjectProperties = {
  is_solid: true,
  can_be_opened: true,
  can_be_locked: true,
  is_locked: true,
  is_heavy: true,
  weight: 312,
  durability: 150,
  traits: ['structure', 'scale_huge', 'material_adamantine']
};
const encounterDesc = generator.generateDescriptions('door', encounterDoorProps, Language.ENGLISH);
console.log('  Description:', encounterDesc.detailed);

// Scenario 3: Player finds a magical artifact
console.log('\nScenario 3: Player finds magical artifact');
const artifactProps: ObjectProperties = {
  can_be_held: true,
  can_be_worn: true,
  weight: 0.5,
  value: 5000,
  durability: 120,
  traits: ['armor', 'scale_small', 'material_mythril', 'color_silver', 'magical', 'shiny']
};
const artifactDesc = generator.generateDescriptions('amulet', artifactProps, Language.ENGLISH);
console.log('  Examining:', artifactDesc.examining);

console.log('\n=== END OF EXAMPLES ===');
