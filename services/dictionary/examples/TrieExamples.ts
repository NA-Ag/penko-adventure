import { Trie } from '../Trie';

/**
 * TrieExamples - Demonstrates Trie data structure usage
 *
 * This file shows examples of:
 * 1. Basic operations (insert, search, delete)
 * 2. Prefix matching and auto-complete
 * 3. Wildcard search
 * 4. Fuzzy matching
 * 5. Performance comparisons
 */

console.log('=== TRIE EXAMPLES ===\n');

// ============================================================================
// Example 1: Basic Insert and Search
// ============================================================================
console.log('--- Example 1: Basic Insert and Search ---');

const trie = new Trie();

// Insert words
trie.insert('door');
trie.insert('dog');
trie.insert('dolphin');
trie.insert('dragon');
trie.insert('dart');

console.log('Inserted 5 words: door, dog, dolphin, dragon, dart');
console.log('Trie size:', trie.size());

// Search for exact words
console.log('\nSearch "door":', trie.search('door').found); // true
console.log('Search "dog":', trie.search('dog').found); // true
console.log('Search "cat":', trie.search('cat').found); // false
console.log('Search "do":', trie.search('do').found); // false (not a complete word)

console.log('');

// ============================================================================
// Example 2: Insert with Values
// ============================================================================
console.log('--- Example 2: Insert with Values ---');

const dictTrie = new Trie();

dictTrie.insert('red', { type: 'adjective', category: 'color', hex: '#FF0000' });
dictTrie.insert('blue', { type: 'adjective', category: 'color', hex: '#0000FF' });
dictTrie.insert('tiny', { type: 'adjective', category: 'size', multiplier: 0.1 });
dictTrie.insert('huge', { type: 'adjective', category: 'size', multiplier: 5.0 });

const redResult = dictTrie.search('red');
console.log('Search "red":', JSON.stringify(redResult, null, 2));

const tinyResult = dictTrie.search('tiny');
console.log('\nSearch "tiny":', JSON.stringify(tinyResult, null, 2));

console.log('');

// ============================================================================
// Example 3: Prefix Matching
// ============================================================================
console.log('--- Example 3: Prefix Matching ---');

console.log('StartsWith "do":', trie.startsWith('do')); // true
console.log('StartsWith "dra":', trie.startsWith('dra')); // true
console.log('StartsWith "cat":', trie.startsWith('cat')); // false

// Get all words with prefix
console.log('\nAll words starting with "do":', trie.getAllWithPrefix('do'));
// Result: ['door', 'dog', 'dolphin']

console.log('All words starting with "da":', trie.getAllWithPrefix('da'));
// Result: ['dart']

console.log('All words starting with "dr":', trie.getAllWithPrefix('dr'));
// Result: ['dragon']

console.log('');

// ============================================================================
// Example 4: Auto-Complete
// ============================================================================
console.log('--- Example 4: Auto-Complete ---');

const autoCompleteTrie = new Trie();
const words = [
  'apple', 'application', 'apply', 'april',
  'banana', 'band', 'banner',
  'cat', 'category', 'cathedral'
];

words.forEach(word => autoCompleteTrie.insert(word));

console.log('Auto-complete "app" (max 5):', autoCompleteTrie.autoComplete('app', 5));
// Result: ['apple', 'application', 'apply']

console.log('Auto-complete "ban" (max 3):', autoCompleteTrie.autoComplete('ban', 3));
// Result: ['banana', 'band', 'banner']

console.log('Auto-complete "cat" (max 5):', autoCompleteTrie.autoComplete('cat', 5));
// Result: ['cat', 'category', 'cathedral']

console.log('');

// ============================================================================
// Example 5: Wildcard Search
// ============================================================================
console.log('--- Example 5: Wildcard Search ---');

const wildcardTrie = new Trie();
['dog', 'dig', 'dug', 'bug', 'bag', 'big'].forEach(w => wildcardTrie.insert(w));

console.log('Pattern "d.g":', wildcardTrie.searchWithWildcard('d.g'));
// Result: ['dog', 'dig', 'dug']

console.log('Pattern "b.g":', wildcardTrie.searchWithWildcard('b.g'));
// Result: ['bug', 'bag', 'big']

console.log('Pattern "..g":', wildcardTrie.searchWithWildcard('..g'));
// Result: ['dog', 'dig', 'dug', 'bug', 'bag', 'big']

console.log('');

// ============================================================================
// Example 6: Fuzzy Matching (Spell Correction)
// ============================================================================
console.log('--- Example 6: Fuzzy Matching (Spell Correction) ---');

const spellTrie = new Trie();
['red', 'read', 'ready', 'red', 'ride', 'road', 'reed'].forEach(w => spellTrie.insert(w));

// User types "rde" (typo for "red")
const fuzzyResults1 = spellTrie.fuzzySearch('rde', 2);
console.log('Fuzzy search for "rde" (max distance 2):');
fuzzyResults1.forEach(r => console.log(`  - ${r.word} (distance: ${r.distance})`));

// User types "raed" (typo for "read")
const fuzzyResults2 = spellTrie.fuzzySearch('raed', 2);
console.log('\nFuzzy search for "raed" (max distance 2):');
fuzzyResults2.forEach(r => console.log(`  - ${r.word} (distance: ${r.distance})`));

console.log('');

// ============================================================================
// Example 7: Delete Operations
// ============================================================================
console.log('--- Example 7: Delete Operations ---');

const deleteTrie = new Trie();
['cat', 'cats', 'category', 'dog'].forEach(w => deleteTrie.insert(w));

console.log('Before delete:');
console.log('  Size:', deleteTrie.size());
console.log('  Has "cat":', deleteTrie.search('cat').found);
console.log('  Has "cats":', deleteTrie.search('cats').found);
console.log('  All words:', deleteTrie.getAllWords());

// Delete "cat" (but "cats" and "category" should remain)
deleteTrie.delete('cat');

console.log('\nAfter deleting "cat":');
console.log('  Size:', deleteTrie.size());
console.log('  Has "cat":', deleteTrie.search('cat').found); // false
console.log('  Has "cats":', deleteTrie.search('cats').found); // true (still exists)
console.log('  Has "category":', deleteTrie.search('category').found); // true (still exists)
console.log('  All words:', deleteTrie.getAllWords());

console.log('');

// ============================================================================
// Example 8: Get All Words and Values
// ============================================================================
console.log('--- Example 8: Get All Words and Values ---');

const valueTrie = new Trie();
valueTrie.insert('sword', { damage: 10, weight: 5 });
valueTrie.insert('axe', { damage: 15, weight: 8 });
valueTrie.insert('dagger', { damage: 5, weight: 2 });

console.log('All words:', valueTrie.getAllWords());
console.log('\nAll words with values:');
const allWithValues = valueTrie.getAllWordsWithValues();
allWithValues.forEach(item => {
  console.log(`  ${item.word}:`, JSON.stringify(item.value));
});

console.log('');

// ============================================================================
// Example 9: Longest Common Prefix
// ============================================================================
console.log('--- Example 9: Longest Common Prefix ---');

const lcpTrie1 = new Trie();
['flower', 'flow', 'flight'].forEach(w => lcpTrie1.insert(w));
console.log('Words: flower, flow, flight');
console.log('Longest common prefix:', lcpTrie1.longestCommonPrefix()); // 'fl'

const lcpTrie2 = new Trie();
['dog', 'racecar', 'car'].forEach(w => lcpTrie2.insert(w));
console.log('\nWords: dog, racecar, car');
console.log('Longest common prefix:', lcpTrie2.longestCommonPrefix()); // '' (no common prefix)

console.log('');

// ============================================================================
// Example 10: Statistics
// ============================================================================
console.log('--- Example 10: Statistics ---');

const statsTrie = new Trie();
['a', 'ab', 'abc', 'abcd', 'abcde', 'x', 'xy', 'xyz'].forEach(w => statsTrie.insert(w));

const stats = statsTrie.getStats();
console.log('Trie statistics:');
console.log('  Word count:', stats.wordCount);
console.log('  Node count:', stats.nodeCount);
console.log('  Average depth:', stats.averageDepth.toFixed(2));
console.log('  Max depth:', stats.maxDepth);

console.log('');

// ============================================================================
// Example 11: Export and Import
// ============================================================================
console.log('--- Example 11: Export and Import ---');

const exportTrie = new Trie();
exportTrie.insert('apple', { price: 1.5, color: 'red' });
exportTrie.insert('banana', { price: 0.5, color: 'yellow' });
exportTrie.insert('orange', { price: 2.0, color: 'orange' });

console.log('Original trie size:', exportTrie.size());

// Export data
const exportedData = exportTrie.export();
console.log('Exported data:', JSON.stringify(exportedData, null, 2));

// Create new trie and import
const importTrie = new Trie();
importTrie.import(exportedData);

console.log('\nImported trie size:', importTrie.size());
console.log('Search "apple" in imported trie:', importTrie.search('apple'));

console.log('');

// ============================================================================
// Example 12: Performance Comparison
// ============================================================================
console.log('--- Example 12: Performance Comparison ---');

// Generate large dataset
const largeDataset = [];
for (let i = 0; i < 10000; i++) {
  largeDataset.push(`word${i}`);
}

// Trie insertion
const perfTrie = new Trie();
const trieInsertStart = Date.now();
largeDataset.forEach(word => perfTrie.insert(word));
const trieInsertTime = Date.now() - trieInsertStart;

console.log(`Inserted ${largeDataset.length} words into trie in ${trieInsertTime}ms`);

// Trie search
const trieSearchStart = Date.now();
for (let i = 0; i < 1000; i++) {
  perfTrie.search(`word${i}`);
}
const trieSearchTime = Date.now() - trieSearchStart;

console.log(`Searched for 1000 words in trie in ${trieSearchTime}ms`);

// Array search (for comparison)
const arraySearchStart = Date.now();
for (let i = 0; i < 1000; i++) {
  largeDataset.includes(`word${i}`);
}
const arraySearchTime = Date.now() - arraySearchStart;

console.log(`Searched for 1000 words in array in ${arraySearchTime}ms`);
console.log(`\nTrie is ${(arraySearchTime / trieSearchTime).toFixed(1)}x faster for search!`);

console.log('');

// ============================================================================
// Example 13: Case Insensitivity
// ============================================================================
console.log('--- Example 13: Case Insensitivity ---');

const caseTrie = new Trie();
caseTrie.insert('Door');
caseTrie.insert('DOG');
caseTrie.insert('DolPhIn');

console.log('Search "door":', caseTrie.search('door').found); // true (case insensitive)
console.log('Search "DOOR":', caseTrie.search('DOOR').found); // true
console.log('Search "Dog":', caseTrie.search('Dog').found); // true
console.log('Search "dolphin":', caseTrie.search('dolphin').found); // true

console.log('');

console.log('=== END OF EXAMPLES ===');
