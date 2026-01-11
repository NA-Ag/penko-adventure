import { DictionaryTrie, WordType, WordMetadata } from '../DictionaryTrie';

/**
 * DictionaryTrieExamples - Demonstrates dictionary usage
 *
 * This file shows examples of:
 * 1. Building a game dictionary
 * 2. Word lookups and categorization
 * 3. Auto-complete and fuzzy matching
 * 4. Import/export for persistence
 * 5. Runtime dictionary expansion
 */

console.log('=== DICTIONARY TRIE EXAMPLES ===\n');

// ============================================================================
// Example 1: Building a Basic Dictionary
// ============================================================================
console.log('--- Example 1: Building a Basic Dictionary ---');

const dict = new DictionaryTrie();

// Add nouns
dict.addWord('door', { type: WordType.NOUN, category: 'structure' });
dict.addWord('sword', { type: WordType.NOUN, category: 'weapon' });
dict.addWord('dragon', { type: WordType.NOUN, category: 'creature' });
dict.addWord('apple', { type: WordType.NOUN, category: 'food' });

// Add adjectives
dict.addWord('red', { type: WordType.ADJECTIVE, category: 'color', modifierType: 'color' });
dict.addWord('blue', { type: WordType.ADJECTIVE, category: 'color', modifierType: 'color' });
dict.addWord('tiny', { type: WordType.ADJECTIVE, category: 'size', modifierType: 'scale' });
dict.addWord('huge', { type: WordType.ADJECTIVE, category: 'size', modifierType: 'scale' });
dict.addWord('wooden', { type: WordType.ADJECTIVE, category: 'material', modifierType: 'material' });
dict.addWord('iron', { type: WordType.ADJECTIVE, category: 'material', modifierType: 'material' });

// Add verbs
dict.addWord('open', { type: WordType.VERB, category: 'action' });
dict.addWord('close', { type: WordType.VERB, category: 'action' });
dict.addWord('attack', { type: WordType.VERB, category: 'combat' });

console.log('Dictionary size:', dict.size());
console.log('Nouns:', dict.getAllNouns().length);
console.log('Adjectives:', dict.getAllAdjectives().length);
console.log('Verbs:', dict.getAllVerbs().length);

console.log('');

// ============================================================================
// Example 2: Word Lookup
// ============================================================================
console.log('--- Example 2: Word Lookup ---');

const doorLookup = dict.lookup('door');
console.log('Lookup "door":', JSON.stringify(doorLookup, null, 2));

const redLookup = dict.lookup('red');
console.log('\nLookup "red":', JSON.stringify(redLookup, null, 2));

const unknownLookup = dict.lookup('cat');
console.log('\nLookup "cat" (unknown):', JSON.stringify(unknownLookup, null, 2));

console.log('');

// ============================================================================
// Example 3: Words by Type and Category
// ============================================================================
console.log('--- Example 3: Words by Type and Category ---');

console.log('All nouns:', dict.getAllNouns());
console.log('All adjectives:', dict.getAllAdjectives());
console.log('All verbs:', dict.getAllVerbs());

console.log('\nWords by category:');
console.log('  Structures:', dict.getWordsByCategory('structure'));
console.log('  Weapons:', dict.getWordsByCategory('weapon'));
console.log('  Colors:', dict.getWordsByCategory('color'));
console.log('  Sizes:', dict.getWordsByCategory('size'));
console.log('  Materials:', dict.getWordsByCategory('material'));

console.log('');

// ============================================================================
// Example 4: Modifier Type Filtering
// ============================================================================
console.log('--- Example 4: Modifier Type Filtering ---');

console.log('Color adjectives:', dict.getColorAdjectives());
console.log('Scale adjectives:', dict.getScaleAdjectives());
console.log('Material adjectives:', dict.getMaterialAdjectives());

console.log('');

// ============================================================================
// Example 5: Auto-Complete
// ============================================================================
console.log('--- Example 5: Auto-Complete ---');

// Add more words for auto-complete demo
dict.addWord('dog', { type: WordType.NOUN, category: 'creature' });
dict.addWord('dolphin', { type: WordType.NOUN, category: 'creature' });
dict.addWord('dart', { type: WordType.NOUN, category: 'weapon' });

console.log('Auto-complete "d":', dict.getAutoComplete('d'));
console.log('Auto-complete "do":', dict.getAutoComplete('do'));
console.log('Auto-complete "doo":', dict.getAutoComplete('doo'));

// Auto-complete with metadata
console.log('\nAuto-complete "d" with metadata:');
const autoCompleteResults = dict.getAutoCompleteWithMetadata('d', 5);
autoCompleteResults.forEach(r => {
  console.log(`  - ${r.word} (${r.metadata.type}, ${r.metadata.category})`);
});

console.log('');

// ============================================================================
// Example 6: Fuzzy Matching (Spell Correction)
// ============================================================================
console.log('--- Example 6: Fuzzy Matching (Spell Correction) ---');

// User types "rde" instead of "red"
const fuzzy1 = dict.fuzzyLookup('rde', 2);
console.log('Fuzzy lookup for "rde":');
fuzzy1.forEach(r => {
  console.log(`  - ${r.word} (distance: ${r.distance}, type: ${r.metadata.type})`);
});

// User types "dor" instead of "door"
const fuzzy2 = dict.fuzzyLookup('dor', 2);
console.log('\nFuzzy lookup for "dor":');
fuzzy2.forEach(r => {
  console.log(`  - ${r.word} (distance: ${r.distance}, type: ${r.metadata.type})`);
});

console.log('');

// ============================================================================
// Example 7: Pattern Matching
// ============================================================================
console.log('--- Example 7: Pattern Matching ---');

// Add more words
dict.addWord('dig', { type: WordType.VERB, category: 'action' });
dict.addWord('dug', { type: WordType.VERB, category: 'action' });
dict.addWord('bug', { type: WordType.NOUN, category: 'creature' });

console.log('Pattern "d.g":', dict.searchPattern('d.g'));
// Matches: dig, dug, dog

console.log('Pattern "..g":', dict.searchPattern('..g'));
// Matches: dig, dug, dog, bug

console.log('');

// ============================================================================
// Example 8: Dictionary Statistics
// ============================================================================
console.log('--- Example 8: Dictionary Statistics ---');

const stats = dict.getStats();
console.log('Dictionary statistics:');
console.log('  Total words:', stats.totalWords);
console.log('  Nouns:', stats.nouns);
console.log('  Adjectives:', stats.adjectives);
console.log('  Verbs:', stats.verbs);
console.log('  Categories:', stats.categories);
console.log('  Trie node count:', stats.trieStats.nodeCount);
console.log('  Average word depth:', stats.trieStats.averageDepth.toFixed(2));
console.log('  Max word depth:', stats.trieStats.maxDepth);

console.log('');

// ============================================================================
// Example 9: Runtime Dictionary Expansion
// ============================================================================
console.log('--- Example 9: Runtime Dictionary Expansion ---');

console.log('Before expansion:', dict.size(), 'words');

// User creates custom objects, add their names to dictionary
dict.addWord('lightsaber', {
  type: WordType.NOUN,
  category: 'weapon',
  properties: { scifi: true, glowing: true }
});

dict.addWord('quantum', {
  type: WordType.ADJECTIVE,
  category: 'scifi',
  modifierType: 'quality'
});

console.log('After expansion:', dict.size(), 'words');
console.log('Lookup "lightsaber":', dict.lookup('lightsaber'));
console.log('Auto-complete "light":', dict.getAutoComplete('light'));

console.log('');

// ============================================================================
// Example 10: Export and Import
// ============================================================================
console.log('--- Example 10: Export and Import ---');

// Export dictionary
const exportedData = dict.export();
console.log('Exported dictionary:');
console.log('  Version:', exportedData.version);
console.log('  Word count:', exportedData.words.length);
console.log('  First 3 words:', exportedData.words.slice(0, 3).map(w => w.word).join(', '));

// Create new dictionary and import
const newDict = new DictionaryTrie();
newDict.import(exportedData);

console.log('\nImported dictionary:');
console.log('  Size:', newDict.size());
console.log('  Has "door":', newDict.hasWord('door'));
console.log('  Has "red":', newDict.hasWord('red'));

console.log('');

// ============================================================================
// Example 11: Bulk Operations
// ============================================================================
console.log('--- Example 11: Bulk Operations ---');

const bulkDict = new DictionaryTrie();

const bulkWords = [
  { word: 'cat', metadata: { type: WordType.NOUN, category: 'creature' } },
  { word: 'hat', metadata: { type: WordType.NOUN, category: 'clothing' } },
  { word: 'bat', metadata: { type: WordType.NOUN, category: 'weapon' } },
  { word: 'mat', metadata: { type: WordType.NOUN, category: 'furniture' } },
  { word: 'rat', metadata: { type: WordType.NOUN, category: 'creature' } }
];

bulkDict.addWords(bulkWords);
console.log('Added', bulkWords.length, 'words in bulk');
console.log('Dictionary size:', bulkDict.size());

// Bulk check
const checkWords = ['cat', 'hat', 'bat', 'sat', 'rat'];
const checkResults = bulkDict.hasWords(checkWords);
console.log('\nBulk check results:');
checkWords.forEach((word, i) => {
  console.log(`  ${word}: ${checkResults[i]}`);
});

console.log('');

// ============================================================================
// Example 12: Random Word Selection
// ============================================================================
console.log('--- Example 12: Random Word Selection ---');

console.log('Random word:', dict.getRandomWord());
console.log('Random noun:', dict.getRandomWordOfType(WordType.NOUN));
console.log('Random adjective:', dict.getRandomWordOfType(WordType.ADJECTIVE));
console.log('Random verb:', dict.getRandomWordOfType(WordType.VERB));
console.log('Random color:', dict.getRandomAdjectiveOfCategory('color'));
console.log('Random size:', dict.getRandomAdjectiveOfCategory('size'));

console.log('');

// ============================================================================
// Example 13: Dictionary Merging
// ============================================================================
console.log('--- Example 13: Dictionary Merging ---');

const dict1 = new DictionaryTrie();
dict1.addWord('apple', { type: WordType.NOUN, category: 'food' });
dict1.addWord('banana', { type: WordType.NOUN, category: 'food' });

const dict2 = new DictionaryTrie();
dict2.addWord('carrot', { type: WordType.NOUN, category: 'food' });
dict2.addWord('potato', { type: WordType.NOUN, category: 'food' });

console.log('Dict1 size:', dict1.size());
console.log('Dict2 size:', dict2.size());

dict1.merge(dict2);

console.log('After merge, Dict1 size:', dict1.size());
console.log('Dict1 now has:', dict1.getAllNouns());

console.log('');

// ============================================================================
// Example 14: Category Management
// ============================================================================
console.log('--- Example 14: Category Management ---');

console.log('All categories:', dict.getAllCategories());
console.log('Has "color" category:', dict.hasCategory('color'));
console.log('Has "magic" category:', dict.hasCategory('magic'));
console.log('Words in "weapon" category:', dict.getWordCountByCategory('weapon'));
console.log('Words in "creature" category:', dict.getWordCountByCategory('creature'));

console.log('');

// ============================================================================
// Example 15: Similar Word Suggestions
// ============================================================================
console.log('--- Example 15: Similar Word Suggestions ---');

// User types "drgon" (typo for "dragon")
const similar1 = dict.findSimilarWords('drgon', 5);
console.log('Similar words to "drgon":', similar1);

// User types "swrd" (typo for "sword")
const similar2 = dict.findSimilarWords('swrd', 5);
console.log('Similar words to "swrd":', similar2);

console.log('');

// ============================================================================
// Example 16: Real Game Scenario - Player Input Processing
// ============================================================================
console.log('--- Example 16: Real Game Scenario - Player Input Processing ---');

const gameDict = new DictionaryTrie();

// Build game dictionary
gameDict.addWords([
  // Nouns
  { word: 'door', metadata: { type: WordType.NOUN, category: 'structure' } },
  { word: 'sword', metadata: { type: WordType.NOUN, category: 'weapon' } },
  { word: 'key', metadata: { type: WordType.NOUN, category: 'item' } },

  // Adjectives
  { word: 'red', metadata: { type: WordType.ADJECTIVE, modifierType: 'color' } },
  { word: 'big', metadata: { type: WordType.ADJECTIVE, modifierType: 'scale' } },
  { word: 'iron', metadata: { type: WordType.ADJECTIVE, modifierType: 'material' } },

  // Verbs
  { word: 'open', metadata: { type: WordType.VERB, category: 'action' } },
  { word: 'take', metadata: { type: WordType.VERB, category: 'action' } },
  { word: 'use', metadata: { type: WordType.VERB, category: 'action' } }
]);

console.log('Player input: "create big red iron door"');
const words = 'create big red iron door'.split(' ');

console.log('Analyzing input:');
words.forEach(word => {
  const result = gameDict.lookup(word);
  if (result.found) {
    console.log(`  ✓ "${word}" - ${result.metadata?.type} (${result.metadata?.category || result.metadata?.modifierType})`);
  } else {
    console.log(`  ✗ "${word}" - unknown (suggestions: ${result.suggestions?.join(', ') || 'none'})`);
  }
});

console.log('');

console.log('=== END OF EXAMPLES ===');
