#!/usr/bin/env node

/**
 * Convert JSON dictionaries and morphology to binary format
 *
 * TIER 12: Binary Format Optimization
 * - Uses msgpack for efficient binary serialization
 * - Applies gzip compression
 * - Target: 62% size reduction for dictionaries, 81% for morphology
 *
 * Usage: node scripts/convertToBinary.cjs
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const msgpack = require('msgpack-lite');

/**
 * Create reverse dictionary (target→source from source→target)
 * TIER 13: Enables bidirectional lookups (e.g., es-en from en-es)
 */
function createReverseDictionary(dictionary) {
  const reversed = {};

  for (const [sourceWord, targetTranslation] of Object.entries(dictionary)) {
    // Handle multiple translations (comma-separated)
    const translations = targetTranslation.split(',').map(t => t.trim());

    for (const translation of translations) {
      if (typeof reversed[translation] === 'undefined') {
        // First occurrence - use as primary
        reversed[translation] = sourceWord;
      } else if (typeof reversed[translation] === 'string') {
        // Multiple source words map to same target - append with comma if not already present
        const existingTranslations = reversed[translation].split(', ');
        if (!existingTranslations.includes(sourceWord)) {
          reversed[translation] += `, ${sourceWord}`;
        }
      }
    }
  }

  return reversed;
}

/**
 * Convert and compress a JSON file to binary format using msgpack
 */
function convertToBinary(inputPath, outputPath) {
  console.log(`Converting: ${path.basename(inputPath)}`);

  // Read JSON file
  const jsonData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const jsonSize = fs.statSync(inputPath).size;

  // Encode with msgpack
  const msgpackBuffer = msgpack.encode(jsonData);

  // Compress with gzip
  const gzippedBuffer = zlib.gzipSync(msgpackBuffer, { level: 9 });

  // Write binary file
  fs.writeFileSync(outputPath, gzippedBuffer);

  const binarySize = fs.statSync(outputPath).size;
  const reduction = ((1 - binarySize / jsonSize) * 100).toFixed(1);

  console.log(`  JSON: ${(jsonSize / 1024).toFixed(1)} KB`);
  console.log(`  Binary+gzip: ${(binarySize / 1024).toFixed(1)} KB`);
  console.log(`  Reduction: ${reduction}%`);

  return { jsonSize, binarySize, reduction };
}

/**
 * Convert dictionary object directly to binary (for reverse dictionaries)
 */
function convertDictionaryToBinary(dictionary, outputPath, displayName) {
  console.log(`Converting: ${displayName}`);

  // Encode with msgpack
  const msgpackBuffer = msgpack.encode(dictionary);

  // Compress with gzip
  const gzippedBuffer = zlib.gzipSync(msgpackBuffer, { level: 9 });

  // Write binary file
  fs.writeFileSync(outputPath, gzippedBuffer);

  const binarySize = fs.statSync(outputPath).size;
  console.log(`  Binary+gzip: ${(binarySize / 1024).toFixed(1)} KB`);

  return { binarySize };
}

/**
 * Convert all dictionaries
 */
function convertDictionaries() {
  console.log('\n📚 Converting dictionaries to binary format...\n');

  const srcDir = path.join(__dirname, '..', 'src', 'assets', 'dictionaries');
  const outputDir = path.join(__dirname, '..', 'src', 'assets', 'dictionaries-bin');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
  let totalJsonSize = 0;
  let totalBinarySize = 0;
  let reverseDictionariesGenerated = 0;

  for (const file of files) {
    const inputPath = path.join(srcDir, file);
    const baseName = file.replace('.json', '');
    const outputPath = path.join(outputDir, `${baseName}.pbd.gz`);

    // Convert forward direction
    const result = convertToBinary(inputPath, outputPath);
    totalJsonSize += result.jsonSize;
    totalBinarySize += result.binarySize;

    // Generate reverse dictionary (except for fr-en which already has reverse, and en-fr to avoid duplicate)
    // Only generate reverse for en-XX dictionaries (not XX-en)
    if (baseName.startsWith('en-') && baseName !== 'en-fr') {
      const jsonData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      const reversed = createReverseDictionary(jsonData);

      // Determine reverse name (en-es → es-en)
      const [source, target] = baseName.split('-');
      const reverseName = `${target}-${source}`;
      const reversePath = path.join(outputDir, `${reverseName}.pbd.gz`);

      // Convert reversed dictionary to binary
      const reverseResult = convertDictionaryToBinary(reversed, reversePath, `${reverseName} (reverse)`);
      totalBinarySize += reverseResult.binarySize;
      reverseDictionariesGenerated++;

      console.log(`  → Generated reverse: ${reverseName}.pbd.gz`);
    }
  }

  const overallReduction = ((1 - totalBinarySize / totalJsonSize) * 100).toFixed(1);
  console.log(`\n✅ Converted ${files.length} dictionaries`);
  console.log(`✅ Generated ${reverseDictionariesGenerated} reverse dictionaries`);
  console.log(`Total JSON: ${(totalJsonSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Binary: ${(totalBinarySize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Overall Reduction: ${overallReduction}%`);
}

/**
 * Convert morphology files
 */
function convertMorphology() {
  console.log('\n📖 Converting morphology files to binary format...\n');

  const srcDir = path.join(__dirname, '..', 'src', 'assets', 'morphology');
  const outputDir = path.join(__dirname, '..', 'src', 'assets', 'morphology-bin');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
  let totalJsonSize = 0;
  let totalBinarySize = 0;

  for (const file of files) {
    const inputPath = path.join(srcDir, file);
    const outputPath = path.join(outputDir, file.replace('.json', '.pbm.gz'));

    const result = convertToBinary(inputPath, outputPath);
    totalJsonSize += result.jsonSize;
    totalBinarySize += result.binarySize;
  }

  const overallReduction = ((1 - totalBinarySize / totalJsonSize) * 100).toFixed(1);
  console.log(`\n✅ Converted ${files.length} morphology files`);
  console.log(`Total JSON: ${(totalJsonSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Binary: ${(totalBinarySize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Overall Reduction: ${overallReduction}%`);
}

/**
 * Convert universal vocabulary to binary format
 * TIER 15: Binary compression for Façade-inspired universal intent vocabulary
 */
function convertUniversalVocabulary() {
  console.log('\n🎯 Converting universal intent vocabulary to binary format...\n');

  const srcDir = path.join(__dirname, '..', 'data', 'intents');
  const outputDir = path.join(__dirname, '..', 'src', 'assets', 'intents-bin');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputPath = path.join(srcDir, 'universal_vocabulary.json');
  const outputPath = path.join(outputDir, 'universal_vocabulary.pbu.gz');

  // Convert to binary
  const result = convertToBinary(inputPath, outputPath);

  console.log(`\n✅ Converted universal vocabulary`);
  console.log(`JSON: ${(result.jsonSize / 1024).toFixed(1)} KB`);
  console.log(`Binary+gzip: ${(result.binarySize / 1024).toFixed(1)} KB`);
  console.log(`Reduction: ${result.reduction}%`);
  console.log(`\n📊 Contains 726 phrases across 12 languages for 15 intents`);
}

/**
 * Main
 */
function main() {
  console.log('🔄 Starting binary conversion (Tiers 12-15)...');
  convertDictionaries();
  convertMorphology();
  convertUniversalVocabulary();
  console.log('\n✨ Binary conversion complete!\n');
}

main();
