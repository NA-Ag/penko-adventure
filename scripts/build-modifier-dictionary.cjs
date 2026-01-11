/**
 * Modifier Dictionary Builder
 *
 * Reads source JSON files for modifiers (colors, scales, states, etc.)
 * and builds a single optimized dictionary with trie-like structure
 * for fast word lookups during gameplay.
 *
 * Usage: node scripts/build-modifier-dictionary.cjs
 */

const fs = require('fs');
const path = require('path');

// Paths
const SOURCE_DIR = path.join(__dirname, '../data/source');
const OUTPUT_FILE = path.join(__dirname, '../data/community/modifier-dictionary.json');

// Source files to process
const SOURCE_FILES = [
  'colors.json',
  'scales.json',
  'states.json',
  'materials.json',
  'physics.json',
];

/**
 * Build the modifier dictionary from source files
 */
function buildDictionary() {
  console.log('='.repeat(70));
  console.log('MODIFIER DICTIONARY BUILDER');
  console.log('='.repeat(70));
  console.log('');

  const dictionary = {};
  let totalWords = 0;
  let totalAliases = 0;

  // Process each source file
  for (const filename of SOURCE_FILES) {
    const filePath = path.join(SOURCE_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: Source file not found: ${filename}`);
      continue;
    }

    console.log(`📖 Processing: ${filename}`);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const modifierType = data.modifierType;

    // Process each word in the source file
    for (const entry of data.words) {
      // Add main word
      addWordToDictionary(dictionary, entry.name, {
        name: entry.name,
        modifiers: [createModifier(modifierType, entry)],
      });
      totalWords++;

      // Add aliases
      if (entry.aliases && entry.aliases.length > 0) {
        for (const alias of entry.aliases) {
          addWordToDictionary(dictionary, alias, {
            name: alias,
            modifiers: [createModifier(modifierType, entry)],
          });
          totalAliases++;
        }
      }
    }

    console.log(`  ✓ Added ${data.words.length} words from ${filename}`);
  }

  console.log('');
  console.log(`📊 Statistics:`);
  console.log(`  • Total unique words: ${totalWords}`);
  console.log(`  • Total aliases: ${totalAliases}`);
  console.log(`  • Total entries: ${totalWords + totalAliases}`);
  console.log('');

  // Write output
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dictionary, null, 2));
  console.log(`✅ Dictionary written to: ${OUTPUT_FILE}`);
  console.log('');
  console.log('='.repeat(70));
}

/**
 * Add a word to the dictionary with trie-like structure
 */
function addWordToDictionary(dictionary, word, wordData) {
  const normalized = word.toLowerCase();
  const firstLetter = normalized[0];

  // Create first-letter bucket if it doesn't exist
  if (!dictionary[firstLetter]) {
    dictionary[firstLetter] = {};
  }

  // Add word to bucket
  dictionary[firstLetter][normalized] = wordData;
}

/**
 * Create a modifier object based on type and entry data
 */
function createModifier(modifierType, entry) {
  switch (modifierType) {
    case 'Color':
      return { type: 'Color', value: entry.value };

    case 'Scale':
      return { type: 'Scale', value: entry.value };

    case 'State':
      return { type: entry.type, value: entry.value };

    case 'Material':
      return { type: 'Material', value: entry.value };

    case 'Physics':
      return { type: entry.type, value: entry.value };

    default:
      console.warn(`⚠️  Unknown modifier type: ${modifierType}`);
      return { type: 'Custom', name: entry.name, value: entry.value };
  }
}

// Run the builder
try {
  buildDictionary();
  process.exit(0);
} catch (error) {
  console.error('❌ Error building dictionary:', error);
  process.exit(1);
}
