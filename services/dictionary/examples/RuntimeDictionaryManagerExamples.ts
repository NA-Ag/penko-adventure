import { RuntimeDictionaryManager } from '../RuntimeDictionaryManager';
import { DictionaryTrie, WordType } from '../DictionaryTrie';
import { ObjectProperties } from '../../../types/game.types';

/**
 * RuntimeDictionaryManagerExamples - Demonstrates runtime dictionary expansion
 *
 * This file shows examples of:
 * 1. Adding user-defined words during gameplay
 * 2. Creating custom object templates
 * 3. Persistence across sessions
 * 4. Word usage tracking
 * 5. AI-assisted metadata generation
 * 6. Community word sharing
 * 7. Import/export functionality
 * 8. Storage management
 */

console.log('=== RUNTIME DICTIONARY MANAGER EXAMPLES ===\n');

// ============================================================================
// Setup: Create base dictionary and runtime manager
// ============================================================================

const baseDict = new DictionaryTrie();

// Add some base words
baseDict.addWords([
  { word: 'sword', metadata: { type: WordType.NOUN, category: 'weapon' } },
  { word: 'door', metadata: { type: WordType.NOUN, category: 'structure' } },
  { word: 'red', metadata: { type: WordType.ADJECTIVE, category: 'color', modifierType: 'color' } },
  { word: 'big', metadata: { type: WordType.ADJECTIVE, category: 'size', modifierType: 'scale' } }
]);

const manager = new RuntimeDictionaryManager(baseDict, 'player1', {
  autoSave: false // Disable for examples
});

console.log('Base dictionary size:', baseDict.size());
console.log('');

// ============================================================================
// Example 1: Adding User-Defined Words
// ============================================================================
console.log('--- Example 1: Adding User-Defined Words ---');

// User creates a custom sci-fi weapon
const result1 = manager.addUserWord('lightsaber', {
  type: WordType.NOUN,
  category: 'weapon',
  properties: { scifi: true, glowing: true, damage: 50 }
});

console.log('Add "lightsaber":', result1.message);

// User creates a fantasy adjective
const result2 = manager.addUserWord('mystical', {
  type: WordType.ADJECTIVE,
  category: 'quality',
  modifierType: 'quality',
  properties: { magical: true, rarity: 'rare' }
});

console.log('Add "mystical":', result2.message);

// Try to add a word that already exists in base dictionary
const result3 = manager.addUserWord('sword', {
  type: WordType.NOUN,
  category: 'weapon'
});

console.log('Add "sword" (already exists):', result3.message);

console.log('\nUser words count:', manager.getAllUserWords().length);
console.log('Dictionary now has "lightsaber":', baseDict.hasWord('lightsaber'));
console.log('');

// ============================================================================
// Example 2: Custom Object Templates
// ============================================================================
console.log('--- Example 2: Custom Object Templates ---');

// User creates a custom "dragon" object with specific properties
const dragonProperties: ObjectProperties = {
  weight: 1000,
  is_movable: false,
  is_alive: true,
  is_hostile: true,
  health: 500,
  damage: 75,
  category: 'creature',
  resistance: {
    fire: 1.0, // Immune to fire
    physical: 0.5,
    magic: 0.3
  },
  traits: ['flying', 'fire_breathing', 'scales']
};

const dragonResult = manager.addCustomObject(
  'dragon',
  dragonProperties,
  ['examine', 'attack', 'talk', 'flee'],
  {
    description: 'A massive fire-breathing dragon',
    isPublic: true
  }
);

console.log('Add custom "dragon":', dragonResult.message);
console.log('Is "dragon" custom?', manager.isCustomObject('dragon'));

const dragonTemplate = manager.getCustomObject('dragon');
console.log('Dragon health:', dragonTemplate?.baseProperties.health);
console.log('Dragon allowed actions:', dragonTemplate?.allowedActions);
console.log('');

// ============================================================================
// Example 3: Word Usage Tracking
// ============================================================================
console.log('--- Example 3: Word Usage Tracking ---');

// Simulate user using words multiple times
manager.recordWordUsage('lightsaber');
manager.recordWordUsage('lightsaber');
manager.recordWordUsage('lightsaber');
manager.recordWordUsage('mystical');

const lightsaberWord = manager.getUserWord('lightsaber');
console.log('Lightsaber usage count:', lightsaberWord?.usageCount);
console.log('Lightsaber last used:', new Date(lightsaberWord?.lastUsedAt || 0).toLocaleTimeString());

const stats = manager.getStats();
console.log('\nDictionary statistics:');
console.log('  Total user words:', stats.totalUserWords);
console.log('  Total custom objects:', stats.totalCustomObjects);
console.log('  Nouns:', stats.wordsByType[WordType.NOUN]);
console.log('  Adjectives:', stats.wordsByType[WordType.ADJECTIVE]);
console.log('  Most used:', stats.mostUsedWords.map(w => `${w.word}(${w.count})`).join(', '));
console.log('');

// ============================================================================
// Example 4: AI-Assisted Metadata Generation
// ============================================================================
console.log('--- Example 4: AI-Assisted Metadata Generation ---');

// Generate metadata for unknown words
const metadata1 = manager.generateMetadata('running');
console.log('Metadata for "running":', metadata1.type, '-', metadata1.category);

const metadata2 = manager.generateMetadata('quickly');
console.log('Metadata for "quickly":', metadata2.type, '-', metadata2.category);

const metadata3 = manager.generateMetadata('beautiful');
console.log('Metadata for "beautiful":', metadata3.type, '-', metadata3.category);

const metadata4 = manager.generateMetadata('spaceship');
console.log('Metadata for "spaceship":', metadata4.type, '-', metadata4.category);
console.log('');

// ============================================================================
// Example 5: Fuzzy Matching and Suggestions
// ============================================================================
console.log('--- Example 5: Fuzzy Matching and Suggestions ---');

// User types "ligthsaber" (typo)
const suggestions = manager.suggestSimilarWords('ligthsaber', 3);
console.log('Suggestions for "ligthsaber":', suggestions);

// Find similar words to "misical" (typo for "mystical")
const suggestions2 = manager.suggestSimilarWords('misical', 3);
console.log('Suggestions for "misical":', suggestions2);
console.log('');

// ============================================================================
// Example 6: Filtering and Queries
// ============================================================================
console.log('--- Example 6: Filtering and Queries ---');

// Add more words for filtering examples
manager.addUserWord('blaster', {
  type: WordType.NOUN,
  category: 'weapon',
  properties: { scifi: true }
}, { source: 'user', tags: ['scifi', 'weapon'] });

manager.addUserWord('enchanted', {
  type: WordType.ADJECTIVE,
  category: 'quality',
  modifierType: 'quality',
  properties: { magical: true }
}, { source: 'ai_generated', tags: ['fantasy', 'magic'] });

// Get words by type
const userNouns = manager.getUserWordsByType(WordType.NOUN);
console.log('User nouns:', userNouns.map(w => w.word).join(', '));

const userAdjectives = manager.getUserWordsByType(WordType.ADJECTIVE);
console.log('User adjectives:', userAdjectives.map(w => w.word).join(', '));

// Get words by source
const userCreated = manager.getUserWordsBySource('user');
console.log('User-created words:', userCreated.map(w => w.word).join(', '));

const aiGenerated = manager.getUserWordsBySource('ai_generated');
console.log('AI-generated words:', aiGenerated.map(w => w.word).join(', '));
console.log('');

// ============================================================================
// Example 7: Export and Import
// ============================================================================
console.log('--- Example 7: Export and Import ---');

// Export user dictionary
const exported = manager.export();
console.log('Exported dictionary:');
console.log('  Version:', exported.version);
console.log('  User ID:', exported.userId);
console.log('  Words:', exported.words.length);
console.log('  Objects:', exported.objects.length);
console.log('  Exported at:', new Date(exported.exportedAt).toLocaleString());

// Create new manager and import
const manager2 = new RuntimeDictionaryManager(new DictionaryTrie(), 'player2', {
  autoSave: false
});

manager2.import(exported);
console.log('\nImported to new manager:');
console.log('  User words:', manager2.getAllUserWords().length);
console.log('  Has "lightsaber":', manager2.isUserWord('lightsaber'));
console.log('  Has "dragon" object:', manager2.isCustomObject('dragon'));
console.log('');

// ============================================================================
// Example 8: File Export/Import
// ============================================================================
console.log('--- Example 8: File Export/Import ---');

// Export to JSON file format
const jsonContent = manager.exportToFile();
console.log('JSON export (first 200 chars):');
console.log(jsonContent.substring(0, 200) + '...');

// Import from JSON
const importResult = manager2.importFromFile(jsonContent);
console.log('\nImport from JSON:', importResult.message);
console.log('');

// ============================================================================
// Example 9: Community Word Sharing
// ============================================================================
console.log('--- Example 9: Community Word Sharing ---');

// Create another user's dictionary
const manager3 = new RuntimeDictionaryManager(new DictionaryTrie(), 'player3', {
  autoSave: false
});

manager3.addUserWord('phaser', {
  type: WordType.NOUN,
  category: 'weapon',
  properties: { scifi: true, energy: true }
});

manager3.addUserWord('quantum', {
  type: WordType.ADJECTIVE,
  category: 'quality',
  modifierType: 'quality',
  properties: { scifi: true }
});

// Export player3's dictionary
const player3Export = manager3.export();

// Merge into player1's dictionary (manager)
const mergeResult = manager.merge(player3Export);
console.log('Merge result:');
console.log('  Added:', mergeResult.added, 'words');
console.log('  Skipped:', mergeResult.skipped, 'words');
console.log('  Conflicts:', mergeResult.conflicts.join(', ') || 'none');

// Check if merged words are marked as community
const phaserWord = manager.getUserWord('phaser');
console.log('\nPhaser word source:', phaserWord?.source);
console.log('Phaser created by:', phaserWord?.createdBy);
console.log('Phaser approved:', phaserWord?.isApproved);
console.log('');

// ============================================================================
// Example 10: Persistence (localStorage simulation)
// ============================================================================
console.log('--- Example 10: Persistence (localStorage simulation) ---');

// Enable auto-save
const persistentManager = new RuntimeDictionaryManager(baseDict, 'player1', {
  autoSave: true,
  storageKey: 'test_dictionary'
});

persistentManager.addUserWord('testword', {
  type: WordType.NOUN,
  category: 'test'
});

const saveResult = persistentManager.save();
console.log('Save result:', saveResult.message);
console.log('Storage size:', (manager.getStats().storageSize / 1024).toFixed(2), 'KB');

// Load from storage
const loadResult = persistentManager.load();
console.log('Load result:', loadResult.message);
console.log('Words loaded:', loadResult.wordsLoaded);
console.log('');

// ============================================================================
// Example 11: Storage Management
// ============================================================================
console.log('--- Example 11: Storage Management ---');

const storageStats = manager.getStats();
console.log('Storage statistics:');
console.log('  Current size:', (storageStats.storageSize / 1024).toFixed(2), 'KB');
console.log('  Near limit?', manager.isStorageNearLimit());

// Add many words to test storage
for (let i = 0; i < 100; i++) {
  manager.addUserWord(`testword${i}`, {
    type: WordType.NOUN,
    category: 'test',
    properties: { test: true, index: i, data: 'x'.repeat(100) }
  });
}

const newStats = manager.getStats();
console.log('\nAfter adding 100 words:');
console.log('  Total words:', newStats.totalUserWords);
console.log('  Storage size:', (newStats.storageSize / 1024).toFixed(2), 'KB');
console.log('');

// ============================================================================
// Example 12: Word Removal
// ============================================================================
console.log('--- Example 12: Word Removal ---');

console.log('Words before removal:', manager.getAllUserWords().length);

// Remove a word
const removed1 = manager.removeUserWord('testword0');
console.log('Removed "testword0":', removed1);

// Remove custom object
const removed2 = manager.removeCustomObject('dragon');
console.log('Removed "dragon" object:', removed2);

console.log('Words after removal:', manager.getAllUserWords().length);
console.log('Has "dragon" object:', manager.isCustomObject('dragon'));
console.log('');

// ============================================================================
// Example 13: Validation and Error Handling
// ============================================================================
console.log('--- Example 13: Validation and Error Handling ---');

// Try to add empty word
const errorResult1 = manager.addUserWord('', {
  type: WordType.NOUN,
  category: 'test'
});
console.log('Add empty word:', errorResult1.message);

// Try to add word with invalid characters
const errorResult2 = manager.addUserWord('test@word!', {
  type: WordType.NOUN,
  category: 'test'
});
console.log('Add invalid word:', errorResult2.message);

// Try to add base dictionary word
const errorResult3 = manager.addUserWord('sword', {
  type: WordType.NOUN,
  category: 'weapon'
});
console.log('Add base dictionary word:', errorResult3.message);
console.log('');

// ============================================================================
// Example 14: Recent Words and Most Used
// ============================================================================
console.log('--- Example 14: Recent Words and Most Used ---');

// Add some words with delays to test recency
manager.addUserWord('newword1', { type: WordType.NOUN, category: 'test' });
manager.addUserWord('newword2', { type: WordType.NOUN, category: 'test' });
manager.addUserWord('newword3', { type: WordType.NOUN, category: 'test' });

// Use some words multiple times
for (let i = 0; i < 10; i++) {
  manager.recordWordUsage('lightsaber');
}
for (let i = 0; i < 5; i++) {
  manager.recordWordUsage('blaster');
}

const finalStats = manager.getStats();
console.log('Most used words:');
finalStats.mostUsedWords.forEach((w, i) => {
  console.log(`  ${i + 1}. ${w.word} (${w.count} uses)`);
});

console.log('\nRecent words:');
finalStats.recentWords.slice(0, 5).forEach((w, i) => {
  const timeAgo = Date.now() - w.timestamp;
  console.log(`  ${i + 1}. ${w.word} (${(timeAgo / 1000).toFixed(1)}s ago)`);
});
console.log('');

// ============================================================================
// Example 15: Clear and Reset
// ============================================================================
console.log('--- Example 15: Clear and Reset ---');

console.log('Words before clear:', manager.getAllUserWords().length);
console.log('Objects before clear:', manager.getAllCustomObjects().length);

manager.clear();

console.log('Words after clear:', manager.getAllUserWords().length);
console.log('Objects after clear:', manager.getAllCustomObjects().length);
console.log('');

// ============================================================================
// Example 16: Real Game Scenario - Player Creates Custom Item
// ============================================================================
console.log('--- Example 16: Real Game Scenario - Player Creates Custom Item ---');

// Player wants to create a "plasma rifle" with custom properties
console.log('Player: "I want to create a plasma rifle"');

// Game generates metadata
const plasmaMetadata = manager.generateMetadata('plasma_rifle');
console.log('Generated metadata:', plasmaMetadata);

// Player customizes the properties
const plasmaProperties: ObjectProperties = {
  weight: 8,
  is_movable: true,
  is_takeable: true,
  damage: 65,
  category: 'weapon',
  traits: ['energy', 'scifi', 'ranged'],
  properties: {
    ammo_capacity: 30,
    fire_rate: 'automatic',
    range: 'long'
  }
};

// Add to dictionary
manager.addUserWord('plasma_rifle', {
  type: WordType.NOUN,
  category: 'weapon',
  properties: { scifi: true, energy: true }
});

manager.addCustomObject('plasma_rifle', plasmaProperties, [
  'take',
  'examine',
  'equip',
  'fire',
  'reload',
  'drop'
], {
  description: 'A futuristic energy weapon that fires superheated plasma bolts',
  isPublic: true
});

console.log('\n✓ Plasma rifle created successfully!');
console.log('  Damage:', plasmaProperties.damage);
console.log('  Weight:', plasmaProperties.weight);
console.log('  Traits:', plasmaProperties.traits.join(', '));

// Now player can use it in commands
console.log('\nPlayer can now use: "create plasma rifle", "take plasma rifle", etc.');
console.log('');

// ============================================================================
// Example 17: Integration with Base Dictionary
// ============================================================================
console.log('--- Example 17: Integration with Base Dictionary ---');

// User words are automatically available in base dictionary
console.log('Base dictionary has "plasma_rifle":', baseDict.hasWord('plasma_rifle'));

// Lookup works for user words
const lookup = baseDict.lookup('plasma_rifle');
console.log('Lookup "plasma_rifle":', lookup.found);
console.log('Metadata:', lookup.metadata);

// Auto-complete includes user words
const autocomplete = baseDict.getAutoComplete('plas', 5);
console.log('Auto-complete "plas":', autocomplete);
console.log('');

console.log('=== END OF EXAMPLES ===');
