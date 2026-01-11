import { AdjectiveDictionary } from '../AdjectiveDictionary';

/**
 * AdjectiveDictionaryExamples - Demonstrates adjective dictionary usage
 *
 * This file shows examples of:
 * 1. Basic lookups
 * 2. Synonym resolution
 * 3. Modifier type filtering
 * 4. Auto-complete
 * 5. Fuzzy matching
 * 6. Category queries
 */

console.log('=== ADJECTIVE DICTIONARY EXAMPLES ===\n');

const dict = new AdjectiveDictionary();

// ============================================================================
// Example 1: Basic Lookup
// ============================================================================
console.log('--- Example 1: Basic Lookup ---');

console.log('Lookup "red":', dict.lookup('red'));
console.log('Lookup "tiny":', dict.lookup('tiny'));
console.log('Lookup "wooden":', dict.lookup('wooden'));
console.log('Lookup "sharp":', dict.lookup('sharp'));
console.log('Lookup "unknown":', dict.lookup('unknown'));

console.log('');

// ============================================================================
// Example 2: Synonym Resolution
// ============================================================================
console.log('--- Example 2: Synonym Resolution ---');

console.log('Is "crimson" a valid adjective?', dict.isAdjective('crimson'));
console.log('Lookup "crimson":', dict.lookup('crimson'));
console.log('Canonical form of "crimson":', dict.getCanonical('crimson')); // "red"

console.log('\nIs "big" a valid adjective?', dict.isAdjective('big'));
console.log('Canonical form of "big":', dict.getCanonical('big')); // "large"

console.log('\nIs "mighty" a valid adjective?', dict.isAdjective('mighty'));
console.log('Canonical form of "mighty":', dict.getCanonical('mighty')); // "powerful"

console.log('\nResolve all synonyms:', dict.resolveAllSynonyms(['big', 'crimson', 'mighty', 'wooden']));

console.log('');

// ============================================================================
// Example 3: Type Checking
// ============================================================================
console.log('--- Example 3: Type Checking ---');

console.log('Is "red" a color?', dict.isColor('red')); // true
console.log('Is "tiny" a size?', dict.isSize('tiny')); // true
console.log('Is "wooden" a material?', dict.isMaterial('wooden')); // true
console.log('Is "sharp" a quality?', dict.isQuality('sharp')); // true
console.log('Is "locked" a state?', dict.isState('locked')); // true

console.log('\nIs "red" a size?', dict.isColor('red') && !dict.isSize('red')); // false
console.log('Is "tiny" a color?', dict.isSize('tiny') && !dict.isColor('tiny')); // false

console.log('');

// ============================================================================
// Example 4: Get All by Modifier Type
// ============================================================================
console.log('--- Example 4: Get All by Modifier Type ---');

const colors = dict.getAllColors();
console.log(`All colors (${colors.length}):`, colors.slice(0, 10).join(', '), '...');

const sizes = dict.getAllSizes();
console.log(`All sizes (${sizes.length}):`, sizes.slice(0, 10).join(', '), '...');

const materials = dict.getAllMaterials();
console.log(`All materials (${materials.length}):`, materials.slice(0, 10).join(', '), '...');

const qualities = dict.getAllQualities();
console.log(`All qualities (${qualities.length}):`, qualities.slice(0, 15).join(', '), '...');

const states = dict.getAllStates();
console.log(`All states (${states.length}):`, states.join(', '));

console.log('');

// ============================================================================
// Example 5: Auto-Complete
// ============================================================================
console.log('--- Example 5: Auto-Complete ---');

console.log('Auto-complete "r":', dict.getAutoComplete('r', 10));
console.log('Auto-complete "bl":', dict.getAutoComplete('bl', 10));
console.log('Auto-complete "mag":', dict.getAutoComplete('mag', 10));
console.log('Auto-complete "gig":', dict.getAutoComplete('gig', 5));

console.log('');

// ============================================================================
// Example 6: Fuzzy Matching
// ============================================================================
console.log('--- Example 6: Fuzzy Matching ---');

// User types "rde" instead of "red"
const fuzzy1 = dict.fuzzyLookup('rde', 2);
console.log('Fuzzy lookup "rde":');
fuzzy1.slice(0, 5).forEach(r => console.log(`  - ${r.word} (distance: ${r.distance})`));

// User types "tny" instead of "tiny"
const fuzzy2 = dict.fuzzyLookup('tny', 2);
console.log('\nFuzzy lookup "tny":');
fuzzy2.slice(0, 5).forEach(r => console.log(`  - ${r.word} (distance: ${r.distance})`));

console.log('');

// ============================================================================
// Example 7: Statistics
// ============================================================================
console.log('--- Example 7: Statistics ---');

const stats = dict.getStats();
console.log('Dictionary statistics:');
console.log('  Total adjectives:', stats.totalAdjectives);
console.log('  By modifier type:');
for (const [type, count] of Object.entries(stats.byModifierType)) {
  console.log(`    ${type}: ${count}`);
}

console.log('');

// ============================================================================
// Example 8: Random Adjectives
// ============================================================================
console.log('--- Example 8: Random Adjectives ---');

console.log('Random adjective:', dict.getRandomAdjective());
console.log('Random color:', dict.getRandomByModifierType('color'));
console.log('Random size:', dict.getRandomByModifierType('scale'));
console.log('Random material:', dict.getRandomByModifierType('material'));
console.log('Random quality:', dict.getRandomByModifierType('quality'));

console.log('');

// ============================================================================
// Example 9: All Modifier Types
// ============================================================================
console.log('--- Example 9: All Modifier Types ---');

const modifierTypes = dict.getAllModifierTypes();
console.log('All modifier types:', modifierTypes.join(', '));

console.log('\nHas "color" modifier type?', dict.hasModifierType('color'));
console.log('Has "size" modifier type?', dict.hasModifierType('size')); // uses 'scale'
console.log('Has "scale" modifier type?', dict.hasModifierType('scale'));

console.log('');

// ============================================================================
// Example 10: Effect-Based Queries
// ============================================================================
console.log('--- Example 10: Effect-Based Queries ---');

const damageIncrease = dict.getDamageIncreasingAdjectives();
console.log('Damage-increasing adjectives:', damageIncrease.join(', '));

const damageDecrease = dict.getDamageDecreasingAdjectives();
console.log('Damage-decreasing adjectives:', damageDecrease.join(', '));

const weightAffecting = dict.getWeightAffectingAdjectives();
console.log('Weight-increasing adjectives:', weightAffecting.increasing.join(', '));
console.log('Weight-decreasing adjectives:', weightAffecting.decreasing.join(', '));

console.log('');

// ============================================================================
// Example 11: Pattern Matching
// ============================================================================
console.log('--- Example 11: Pattern Matching ---');

console.log('Pattern "r.d":', dict.searchPattern('r.d'));
console.log('Pattern "..g":', dict.searchPattern('..g').slice(0, 10).join(', '), '...');

console.log('');

// ============================================================================
// Example 12: Similar Word Suggestions
// ============================================================================
console.log('--- Example 12: Similar Word Suggestions ---');

console.log('Similar to "red":', dict.findSimilar('red', 5));
console.log('Similar to "magcal" (typo for "magical"):', dict.findSimilar('magcal', 5));
console.log('Similar to "shiny":', dict.findSimilar('shiny', 5));

console.log('');

// ============================================================================
// Example 13: Bulk Operations
// ============================================================================
console.log('--- Example 13: Bulk Operations ---');

const words = ['red', 'blue', 'cat', 'tiny', 'dog', 'magical'];
const results = dict.areAdjectives(words);
console.log('Are these adjectives?');
words.forEach((word, i) => {
  console.log(`  ${word}: ${results[i]}`);
});

console.log('');

// ============================================================================
// Example 14: Real Game Scenario - Parsing Player Input
// ============================================================================
console.log('--- Example 14: Real Game Scenario - Parsing Player Input ---');

const playerInput = 'create big red iron magical sword';
const inputWords = playerInput.split(' ').filter(w => w !== 'create');

console.log('Player input:', playerInput);
console.log('\nAnalyzing adjectives:');

const adjectives = inputWords.filter(word => dict.isAdjective(word));
const noun = inputWords.find(word => !dict.isAdjective(word));

console.log('Found adjectives:', adjectives.join(', '));
console.log('Noun:', noun);

console.log('\nAdjective details:');
adjectives.forEach(adj => {
  const result = dict.lookup(adj);
  const canonical = dict.getCanonical(adj);
  console.log(`  ${adj}${canonical !== adj ? ` (canonical: ${canonical})` : ''}:`,
              result.metadata?.modifierType);
});

console.log('');

// ============================================================================
// Example 15: Category Queries
// ============================================================================
console.log('--- Example 15: Category Queries ---');

console.log('All "color" category:', dict.getAllByCategory('color').slice(0, 10).join(', '), '...');
console.log('All "size" category:', dict.getAllByCategory('size').slice(0, 10).join(', '), '...');
console.log('All "quality" category:', dict.getAllByCategory('quality').slice(0, 15).join(', '), '...');

console.log('');

// ============================================================================
// Example 16: Lookup Performance Test
// ============================================================================
console.log('--- Example 16: Lookup Performance Test ---');

const testWords = ['red', 'blue', 'green', 'tiny', 'huge', 'wooden', 'iron', 'magical', 'sharp', 'locked'];

const startTime = Date.now();
for (let i = 0; i < 10000; i++) {
  const word = testWords[i % testWords.length];
  dict.lookup(word);
}
const endTime = Date.now();

console.log(`Performed 10,000 lookups in ${endTime - startTime}ms`);
console.log(`Average: ${((endTime - startTime) / 10000).toFixed(3)}ms per lookup`);

console.log('');

// ============================================================================
// Example 17: Comprehensive Type Breakdown
// ============================================================================
console.log('--- Example 17: Comprehensive Type Breakdown ---');

console.log('Modifier types and sample adjectives:');

const types = dict.getAllModifierTypes();
for (const type of types) {
  const adjectives = dict.getAllByModifierType(type);
  console.log(`  ${type} (${adjectives.length}):`, adjectives.slice(0, 5).join(', '),
              adjectives.length > 5 ? '...' : '');
}

console.log('');

console.log('=== END OF EXAMPLES ===');
