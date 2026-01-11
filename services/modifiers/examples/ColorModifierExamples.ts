/**
 * Examples demonstrating SCRIBBLENAUTS PARITY 2.1: Color Modifiers
 *
 * Shows how the color system works with 60+ named colors.
 */

import { ColorModifier } from '../ColorModifier';

console.log('=== SCRIBBLENAUTS PARITY 2.1: Color Modifiers Examples ===\n');

const colorMod = new ColorModifier();

// Example 1: Basic color lookup
console.log('=== Example 1: Basic Color Lookup ===');
const red = colorMod.getColor('red');
if (red) {
  console.log(`Name: ${red.name}`);
  console.log(`Hex: ${red.hex}`);
  console.log(`RGB: [${red.rgb.join(', ')}]`);
  console.log(`Category: ${red.category}`);
  console.log(`Brightness: ${red.brightness}`);
  console.log(`Temperature: ${red.temperature}`);
  console.log(`Aliases: [${red.aliases.join(', ')}]`);
}

// Example 2: Color alias lookup
console.log('\n=== Example 2: Color Alias (Crimson → Red) ===');
const crimson = colorMod.parse('crimson');
console.log(`Input: "crimson"`);
console.log(`Is valid: ${crimson.isValid}`);
console.log(`Resolved name: ${crimson.resolvedName}`);
if (crimson.color) {
  console.log(`Canonical name: ${crimson.color.name}`);
  console.log(`Hex: ${crimson.color.hex}`);
  console.log(`Base color: ${crimson.color.baseColor}`);
}

// Example 3: Hex color parsing
console.log('\n=== Example 3: Hex Color Parsing ===');
const hexColor = colorMod.parse('#FF5733');
console.log(`Input: "#FF5733"`);
console.log(`Is valid: ${hexColor.isValid}`);
if (hexColor.color) {
  console.log(`Hex: ${hexColor.color.hex}`);
  console.log(`RGB: [${hexColor.color.rgb.join(', ')}]`);
  console.log(`Brightness: ${hexColor.color.brightness}`);
  console.log(`Temperature: ${hexColor.color.temperature}`);
}

// Example 4: Short hex color
console.log('\n=== Example 4: Short Hex (#F00 = Red) ===');
const shortHex = colorMod.parse('#F00');
console.log(`Input: "#F00"`);
console.log(`Is valid: ${shortHex.isValid}`);
if (shortHex.color) {
  console.log(`Expanded hex: ${shortHex.color.hex}`);
  console.log(`RGB: [${shortHex.color.rgb.join(', ')}]`);
}

// Example 5: RGB color parsing
console.log('\n=== Example 5: RGB Color Parsing ===');
const rgbColor = colorMod.parse('rgb(0, 128, 255)');
console.log(`Input: "rgb(0, 128, 255)"`);
console.log(`Is valid: ${rgbColor.isValid}`);
if (rgbColor.color) {
  console.log(`Hex: ${rgbColor.color.hex}`);
  console.log(`RGB: [${rgbColor.color.rgb.join(', ')}]`);
  console.log(`Brightness: ${rgbColor.color.brightness}`);
  console.log(`Temperature: ${rgbColor.color.temperature}`);
}

// Example 6: Get colors by category
console.log('\n=== Example 6: Primary Colors ===');
const primaryColors = colorMod.getColorsByCategory('primary');
console.log(`Primary colors (${primaryColors.length}):`);
primaryColors.forEach(c => console.log(`  - ${c.name} (${c.hex})`));

// Example 7: Metallic colors
console.log('\n=== Example 7: Metallic Colors ===');
const metallicColors = colorMod.getColorsByCategory('metallic');
console.log(`Metallic colors (${metallicColors.length}):`);
metallicColors.forEach(c => console.log(`  - ${c.name} (${c.hex})`));

// Example 8: Warm colors
console.log('\n=== Example 8: Warm Colors ===');
const warmColors = colorMod.getWarmColors();
console.log(`Warm colors (${warmColors.length} total)`);
warmColors.slice(0, 5).forEach(c => console.log(`  - ${c.name} (${c.temperature})`));
console.log('  ...');

// Example 9: Cool colors
console.log('\n=== Example 9: Cool Colors ===');
const coolColors = colorMod.getCoolColors();
console.log(`Cool colors (${coolColors.length} total)`);
coolColors.slice(0, 5).forEach(c => console.log(`  - ${c.name} (${c.temperature})`));
console.log('  ...');

// Example 10: Bright colors
console.log('\n=== Example 10: Bright Colors ===');
const brightColors = colorMod.getBrightColors();
console.log(`Bright colors (${brightColors.length} total)`);
brightColors.slice(0, 5).forEach(c => console.log(`  - ${c.name} (${c.brightness})`));
console.log('  ...');

// Example 11: Dark colors
console.log('\n=== Example 11: Dark Colors ===');
const darkColors = colorMod.getDarkColors();
console.log(`Dark colors (${darkColors.length} total)`);
darkColors.forEach(c => console.log(`  - ${c.name} (${c.brightness})`));

// Example 12: Find similar colors
console.log('\n=== Example 12: Similar Colors to Red ===');
const similarToRed = colorMod.findSimilarColors('red', 5);
console.log(`Colors similar to red:`);
similarToRed.forEach(c => console.log(`  - ${c.name} (${c.hex})`));

// Example 13: Find similar colors to blue
console.log('\n=== Example 13: Similar Colors to Azure ===');
const similarToAzure = colorMod.findSimilarColors('azure', 5);
console.log(`Colors similar to azure:`);
similarToAzure.forEach(c => console.log(`  - ${c.name} (${c.hex})`));

// Example 14: Apply color to object properties
console.log('\n=== Example 14: Apply Color to Object ===');
const properties = { can_be_held: true, weight: 5 };
const coloredProperties = colorMod.applyColorToProperties(properties, 'crimson');
console.log(`Original properties:`, properties);
console.log(`After applying 'crimson':`);
console.log(`  Traits: [${coloredProperties.traits?.join(', ')}]`);

// Example 15: Mix two colors
console.log('\n=== Example 15: Color Mixing ===');
const mixed1 = colorMod.mixColors('red', 'blue');
if (mixed1) {
  console.log(`Red + Blue:`);
  console.log(`  Name: ${mixed1.name}`);
  console.log(`  Hex: ${mixed1.hex}`);
  console.log(`  RGB: [${mixed1.rgb.join(', ')}]`);
}

const mixed2 = colorMod.mixColors('yellow', 'blue');
if (mixed2) {
  console.log(`Yellow + Blue:`);
  console.log(`  Name: ${mixed2.name}`);
  console.log(`  Hex: ${mixed2.hex}`);
  console.log(`  RGB: [${mixed2.rgb.join(', ')}]`);
}

// Example 16: Complementary colors
console.log('\n=== Example 16: Complementary Colors ===');
const redComp = colorMod.getComplementaryColor('red');
if (redComp) {
  console.log(`Complement of red (#FF0000):`);
  console.log(`  Name: ${redComp.name}`);
  console.log(`  Hex: ${redComp.hex}`);
  console.log(`  RGB: [${redComp.rgb.join(', ')}]`);
}

const blueComp = colorMod.getComplementaryColor('blue');
if (blueComp) {
  console.log(`Complement of blue (#0000FF):`);
  console.log(`  Name: ${blueComp.name}`);
  console.log(`  Hex: ${blueComp.hex}`);
}

// Example 17: Color validation
console.log('\n=== Example 17: Color Validation ===');
const testColors = ['red', 'xyz', 'crimson', 'florp', '#FF0000', 'golden'];
testColors.forEach(c => {
  const isValid = colorMod.isValidColor(c);
  console.log(`"${c}" is ${isValid ? 'VALID' : 'INVALID'}`);
});

// Example 18: All color names
console.log('\n=== Example 18: Total Colors ===');
const allNames = colorMod.getAllColorNames();
console.log(`Total color names (including aliases): ${allNames.length}`);
console.log(`Actual color definitions: ${colorMod.getColorCount()}`);
console.log(`Sample names: ${allNames.slice(0, 10).join(', ')}...`);

// Example 19: Color categories
console.log('\n=== Example 19: Colors by Category ===');
const categories = ['primary', 'secondary', 'tertiary', 'neutral', 'metallic', 'shade', 'tint'] as const;
categories.forEach(cat => {
  const colors = colorMod.getColorsByCategory(cat);
  console.log(`${cat}: ${colors.length} colors`);
});

// Example 20: Alias resolution
console.log('\n=== Example 20: Alias Resolution ===');
const aliases = [
  { alias: 'scarlet', expected: 'red' },
  { alias: 'golden', expected: 'gold' },
  { alias: 'azure', expected: 'blue' },
  { alias: 'emerald', expected: 'green' }
];

aliases.forEach(({ alias, expected }) => {
  const parsed = colorMod.parse(alias);
  console.log(`"${alias}" → ${parsed.resolvedName} (expected: ${expected})`);
});

// Example 21: Invalid color handling
console.log('\n=== Example 21: Invalid Color Handling ===');
const invalid = colorMod.parse('not-a-color');
console.log(`Input: "not-a-color"`);
console.log(`Is valid: ${invalid.isValid}`);
console.log(`Color: ${invalid.color}`);

// Example 22: Case insensitivity
console.log('\n=== Example 22: Case Insensitivity ===');
const cases = ['RED', 'Red', 'red', 'rEd'];
cases.forEach(c => {
  const parsed = colorMod.parse(c);
  console.log(`"${c}" → valid: ${parsed.isValid}, resolved: ${parsed.resolvedName}`);
});

// Example 23: Base color relationships
console.log('\n=== Example 23: Base Color Relationships ===');
const shades = colorMod.getColorsByCategory('shade');
console.log(`Shades with base colors:`);
shades.filter(s => s.baseColor).slice(0, 5).forEach(s => {
  console.log(`  ${s.name} is a shade of ${s.baseColor} (${s.hex})`);
});

// Example 24: Temperature and brightness combinations
console.log('\n=== Example 24: Warm & Bright Colors ===');
const warmBright = colorMod.getWarmColors().filter(c => c.brightness === 'bright');
console.log(`Warm & bright colors (${warmBright.length}):`);
warmBright.slice(0, 5).forEach(c => {
  console.log(`  ${c.name}: ${c.temperature}, ${c.brightness}`);
});

// Example 25: Applying multiple colors
console.log('\n=== Example 25: Object with Multiple Colors ===');
let multiColorProps = { can_be_held: true, weight: 1, traits: [] as string[] };
multiColorProps = colorMod.applyColorToProperties(multiColorProps, 'red');
multiColorProps = colorMod.applyColorToProperties(multiColorProps, 'blue');
console.log(`Object with red and blue:`);
console.log(`  Traits: ${multiColorProps.traits.join(', ')}`);

console.log('\n=== All Examples Complete ===');
