#!/usr/bin/env node

/**
 * Build Core Dictionaries Script
 *
 * Purpose: Generate core dictionary files containing ~5000 most common words
 * for each of the 12 supported languages.
 *
 * For each language, this script will:
 * 1. Find or download word frequency lists from open-source datasets
 * 2. Extract the top 5000 most common words
 * 3. Determine part-of-speech for each word (using heuristics or external data)
 * 4. Generate a JSON file in format: { "word": { "partOfSpeech": "noun", "frequency": 1234 }, ... }
 * 5. Save to /public/dictionaries/core/{language_code}_core.json
 *
 * Data Sources:
 * - Hermit Dave's Word Frequency Lists (https://github.com/hermitdave/FrequencyWords)
 * - Leipzig Corpora Collection
 * - Custom curated lists
 *
 * Usage:
 *   node scripts/build-core-dictionaries.cjs [--language=fr] [--limit=5000]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============================================================================
// CONFIGURATION
// ============================================================================

const LANGUAGES = {
  en: { name: 'English', sourceType: 'hermitdave', sourceFile: 'en_50k.txt' },
  es: { name: 'Spanish', sourceType: 'hermitdave', sourceFile: 'es_50k.txt' },
  fr: { name: 'French', sourceType: 'hermitdave', sourceFile: 'fr_50k.txt' },
  de: { name: 'German', sourceType: 'hermitdave', sourceFile: 'de_50k.txt' },
  it: { name: 'Italian', sourceType: 'hermitdave', sourceFile: 'it_50k.txt' },
  ja: { name: 'Japanese', sourceType: 'custom', sourceFile: 'ja_common.txt' },
  zh: { name: 'Mandarin', sourceType: 'custom', sourceFile: 'zh_common.txt' },
  ru: { name: 'Russian', sourceType: 'hermitdave', sourceFile: 'ru_50k.txt' },
  pt: { name: 'Portuguese', sourceType: 'hermitdave', sourceFile: 'pt_50k.txt' },
  uk: { name: 'Ukrainian', sourceType: 'custom', sourceFile: 'uk_common.txt' },
  pl: { name: 'Polish', sourceType: 'hermitdave', sourceFile: 'pl_50k.txt' },
  cs: { name: 'Czech', sourceType: 'hermitdave', sourceFile: 'cs_50k.txt' },
};

const DEFAULT_LIMIT = 5000;
const SOURCE_DIR = path.join(__dirname, '../data/source/word-frequency');
const OUTPUT_DIR = path.join(__dirname, '../public/dictionaries/core');

// Command line arguments
const args = process.argv.slice(2);
const targetLanguage = args.find((arg) => arg.startsWith('--language='))?.split('=')[1];
const limit =
  parseInt(args.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || '') ||
  DEFAULT_LIMIT;

// ============================================================================
// PART OF SPEECH DETECTION
// ============================================================================

/**
 * Determine part of speech using heuristics
 * This is a simplified implementation - a production system would use
 * more sophisticated NLP libraries or pre-tagged datasets
 */
function guessPartOfSpeech(word, language) {
  word = word.toLowerCase().trim();

  // Language-specific rules
  switch (language) {
    case 'en':
      return guessEnglishPOS(word);
    case 'es':
      return guessSpanishPOS(word);
    case 'fr':
      return guessFrenchPOS(word);
    case 'de':
      return guessGermanPOS(word);
    default:
      return 'unknown';
  }
}

function guessEnglishPOS(word) {
  // Common verb endings
  if (word.endsWith('ing') || word.endsWith('ed') || word.endsWith('s')) return 'verb';

  // Common noun endings
  if (
    word.endsWith('tion') ||
    word.endsWith('ness') ||
    word.endsWith('ment') ||
    word.endsWith('ship')
  )
    return 'noun';

  // Common adjective endings
  if (
    word.endsWith('able') ||
    word.endsWith('ible') ||
    word.endsWith('ful') ||
    word.endsWith('less') ||
    word.endsWith('ous')
  )
    return 'adjective';

  // Common adverb endings
  if (word.endsWith('ly')) return 'adverb';

  // Prepositions (common words)
  const prepositions = [
    'in',
    'on',
    'at',
    'to',
    'for',
    'with',
    'from',
    'by',
    'about',
    'under',
    'over',
  ];
  if (prepositions.includes(word)) return 'preposition';

  // Articles
  if (['the', 'a', 'an'].includes(word)) return 'article';

  // Pronouns
  const pronouns = [
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
  ];
  if (pronouns.includes(word)) return 'pronoun';

  // Default to noun (most common)
  return 'noun';
}

function guessSpanishPOS(word) {
  // Verb infinitives
  if (word.endsWith('ar') || word.endsWith('er') || word.endsWith('ir')) return 'verb';

  // Verb conjugations
  if (word.endsWith('ando') || word.endsWith('iendo') || word.endsWith('ado') || word.endsWith('ido'))
    return 'verb';

  // Nouns
  if (
    word.endsWith('ción') ||
    word.endsWith('sión') ||
    word.endsWith('dad') ||
    word.endsWith('tad')
  )
    return 'noun';

  // Adjectives
  if (word.endsWith('oso') || word.endsWith('osa') || word.endsWith('able')) return 'adjective';

  // Adverbs
  if (word.endsWith('mente')) return 'adverb';

  // Articles
  if (['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'].includes(word))
    return 'article';

  return 'noun';
}

function guessFrenchPOS(word) {
  // Verb infinitives
  if (word.endsWith('er') || word.endsWith('ir') || word.endsWith('re')) return 'verb';

  // Verb conjugations
  if (word.endsWith('ant') || word.endsWith('é')) return 'verb';

  // Nouns
  if (
    word.endsWith('tion') ||
    word.endsWith('sion') ||
    word.endsWith('té') ||
    word.endsWith('eur')
  )
    return 'noun';

  // Adjectives
  if (word.endsWith('able') || word.endsWith('ible')) return 'adjective';

  // Adverbs
  if (word.endsWith('ment')) return 'adverb';

  // Articles
  if (['le', 'la', 'les', 'un', 'une', 'des'].includes(word)) return 'article';

  return 'noun';
}

function guessGermanPOS(word) {
  // German nouns are capitalized
  if (word[0] === word[0].toUpperCase() && word.length > 1) return 'noun';

  // Verb infinitives
  if (word.endsWith('en') || word.endsWith('eln') || word.endsWith('ern')) return 'verb';

  // Adjectives
  if (word.endsWith('ig') || word.endsWith('lich') || word.endsWith('bar')) return 'adjective';

  // Articles
  if (['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen'].includes(word))
    return 'article';

  return 'unknown';
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

/**
 * Parse a word frequency file
 * Expected format: "word frequency" (one per line)
 */
function parseFrequencyFile(filePath, languageCode, limit) {
  console.log(`\nProcessing: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log(`\nPlease download word frequency data for ${LANGUAGES[languageCode].name}:`);
    console.log(`1. Visit: https://github.com/hermitdave/FrequencyWords`);
    console.log(`2. Download ${LANGUAGES[languageCode].sourceFile}`);
    console.log(`3. Place it in: ${SOURCE_DIR}/`);
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim());

  const dictionary = {};
  let count = 0;

  for (const line of lines) {
    if (count >= limit) break;

    // Parse line: "word frequency" or just "word"
    const parts = line.trim().split(/\s+/);
    if (parts.length === 0) continue;

    const word = parts[0].toLowerCase();
    const frequency = parts.length > 1 ? parseInt(parts[1]) || count + 1 : count + 1;

    // Skip very short words (likely particles/typos)
    if (word.length < 2) continue;

    // Skip numbers
    if (/^\d+$/.test(word)) continue;

    // Determine part of speech
    const partOfSpeech = guessPartOfSpeech(word, languageCode);

    dictionary[word] = {
      partOfSpeech,
      frequency,
      rank: count + 1,
    };

    count++;
  }

  console.log(`✓ Parsed ${Object.keys(dictionary).length} words`);
  return dictionary;
}

/**
 * Build a core dictionary for a language
 */
function buildCoreDictionary(languageCode) {
  console.log('\n' + '='.repeat(70));
  console.log(`Building Core Dictionary: ${LANGUAGES[languageCode].name} (${languageCode})`);
  console.log('='.repeat(70));

  const sourceFile = LANGUAGES[languageCode].sourceFile;
  const sourcePath = path.join(SOURCE_DIR, sourceFile);

  const dictionary = parseFrequencyFile(sourcePath, languageCode, limit);

  if (!dictionary) {
    console.error(`❌ Failed to build dictionary for ${languageCode}`);
    return false;
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write output file
  const outputPath = path.join(OUTPUT_DIR, `${languageCode}_core.json`);
  fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2));

  console.log(`\n✅ Saved: ${outputPath}`);
  console.log(`   Words: ${Object.keys(dictionary).length}`);

  // Print part-of-speech distribution
  const posDistribution = {};
  for (const entry of Object.values(dictionary)) {
    posDistribution[entry.partOfSpeech] = (posDistribution[entry.partOfSpeech] || 0) + 1;
  }

  console.log('\n📊 Part-of-Speech Distribution:');
  for (const [pos, count] of Object.entries(posDistribution)) {
    console.log(`   ${pos}: ${count}`);
  }

  return true;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('\n' + '='.repeat(70));
  console.log('Core Dictionary Builder');
  console.log('='.repeat(70));
  console.log(`Limit: ${limit} words per language`);
  console.log(`Source directory: ${SOURCE_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  // Create source directory if it doesn't exist
  if (!fs.existsSync(SOURCE_DIR)) {
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    console.log(`\n✓ Created source directory: ${SOURCE_DIR}`);
  }

  // Build for specific language or all languages
  if (targetLanguage) {
    if (!LANGUAGES[targetLanguage]) {
      console.error(`\n❌ Unknown language code: ${targetLanguage}`);
      console.log('Available languages:', Object.keys(LANGUAGES).join(', '));
      process.exit(1);
    }

    buildCoreDictionary(targetLanguage);
  } else {
    console.log('\nBuilding dictionaries for all languages...\n');

    let successCount = 0;
    let failCount = 0;

    for (const languageCode of Object.keys(LANGUAGES)) {
      const success = buildCoreDictionary(languageCode);
      if (success) successCount++;
      else failCount++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('BUILD SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('');
  }

  console.log('\n💡 Next steps:');
  console.log('1. Download missing word frequency files (see error messages above)');
  console.log('2. Run this script again to generate missing dictionaries');
  console.log('3. The DictionaryService will automatically load these files at runtime');
  console.log('');
}

main();
