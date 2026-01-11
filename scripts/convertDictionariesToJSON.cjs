#!/usr/bin/env node

/**
 * Convert StarDict dictionaries to simple JSON format
 *
 * This script reads .ifo, .idx/.idx.gz, and .dict.dz files
 * and converts them into a simple JSON key-value map:
 * { "word": "translation", ... }
 */

const fs = require('fs');
const path = require('path');
const pako = require('pako');

// Dictionary metadata - matches DictionaryManager.ts
const DICTIONARIES = {
  'en-es': {
    langPair: 'en-es',
    downloadUrl: '/dictionaries/organized/romance/eng-spa',
    filePrefix: 'eng-spa'
  },
  'en-fr': {
    langPair: 'en-fr',
    downloadUrl: '/dictionaries/organized/romance/French-English Wiktionary dictionary stardict',
    filePrefix: 'French-English Wiktionary dictionary',
    reverse: true
  },
  'fr-en': {
    langPair: 'fr-en',
    downloadUrl: '/dictionaries/organized/romance/French-English Wiktionary dictionary stardict',
    filePrefix: 'French-English Wiktionary dictionary'
  },
  'en-it': {
    langPair: 'en-it',
    downloadUrl: '/dictionaries/organized/romance/freedict-eng-ita-2024.10.10.stardict',
    filePrefix: 'eng-ita'
  },
  'en-pt': {
    langPair: 'en-pt',
    downloadUrl: '/dictionaries/organized/romance/freedict-eng-por-0.3.stardict',
    filePrefix: 'eng-por'
  },
  'en-de': {
    langPair: 'en-de',
    downloadUrl: '/dictionaries/organized/germanic/freedict-eng-deu-1.9-fd1.stardict',
    filePrefix: 'eng-deu'
  },
  'en-ru': {
    langPair: 'en-ru',
    downloadUrl: '/dictionaries/organized/slavic/freedict-eng-rus-2024.10.10.stardict',
    filePrefix: 'eng-rus'
  },
  'en-pl': {
    langPair: 'en-pl',
    downloadUrl: '/dictionaries/organized/slavic/freedict-eng-pol-0.2.1.stardict',
    filePrefix: 'eng-pol'
  },
  'en-cs': {
    langPair: 'en-cs',
    downloadUrl: '/dictionaries/organized/slavic/freedict-eng-ces-0.1.3.stardict',
    filePrefix: 'eng-ces'
  },
  'en-uk': {
    langPair: 'en-uk',
    downloadUrl: '/dictionaries/organized/slavic/Ukrainian-English Wiktionary dictionary stardict',
    filePrefix: 'Ukrainian-English Wiktionary dictionary'
  },
  'en-ja': {
    langPair: 'en-ja',
    downloadUrl: '/dictionaries/organized/east-asian/jpn-eng',
    filePrefix: 'jpn-eng'
  },
  'en-zh': {
    langPair: 'en-zh',
    downloadUrl: '/dictionaries/organized/east-asian/Chinese-English Wiktionary dictionary stardict',
    filePrefix: 'Chinese-English Wiktionary dictionary'
  }
};

/**
 * Parse .idx or .idx.gz index file
 * Format: NULL-terminated word, 4-byte offset (big-endian), 4-byte size (big-endian)
 */
function parseIndex(data) {
  const index = new Map();
  let pos = 0;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let entriesFound = 0;

  while (pos < data.length) {
    // Read NULL-terminated word
    let wordEnd = pos;
    while (wordEnd < data.length && data[wordEnd] !== 0) {
      wordEnd++;
    }

    if (wordEnd >= data.length) break;

    const word = Buffer.from(data.slice(pos, wordEnd)).toString('utf-8');
    pos = wordEnd + 1; // Skip NULL byte

    // Read offset (4 bytes, big-endian)
    if (pos + 8 > data.length) break;
    const offset = view.getUint32(pos, false); // false = big-endian
    pos += 4;

    // Read size (4 bytes, big-endian)
    const size = view.getUint32(pos, false);
    pos += 4;

    index.set(word.toLowerCase(), { offset, size });
    entriesFound++;
  }

  console.log(`  Parsed ${entriesFound} index entries`);
  return index;
}

/**
 * Parse HTML definition and extract clean translations
 */
function parseDefinition(htmlDef) {
  const translations = [];

  // Extract content from <div> tags (where translations usually are)
  const divRegex = /<div[^>]*>(.*?)<\/div>/gi;
  let divMatch;
  while ((divMatch = divRegex.exec(htmlDef)) !== null) {
    const divContent = divMatch[1].trim();
    if (divContent.length > 0 &&
        !divContent.startsWith('<') &&
        !divContent.match(/^\/.*\/$/)) {
      translations.push(divContent);
    }
  }

  if (translations.length > 0) {
    return [...new Set(translations)].slice(0, 5);
  }

  // Fallback - Parse the rest of the HTML
  const cleaned = htmlDef
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  const lines = cleaned
    .split('\n')
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l.length > 0 && !l.startsWith('/') && !l.match(/^[0-9]+\.$/));

  const ENGLISH_POS_TAGS = /^(noun|verb|adjective|adverb|pronoun|preposition|conjunction|determiner|article|interjection)$/i;
  const ENGLISH_COMMON_WORDS = /\b(the|and|or|of|to|from|for|with|by|at|on|in|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|may|might|can|must|shall|that|this|which|what|who|where|when|why|how)\b/i;

  for (const line of lines) {
    if (ENGLISH_POS_TAGS.test(line)) continue;
    if (line.length > 80) continue;

    const words = line.split(/\s+/);
    const englishWords = words.filter(w => ENGLISH_COMMON_WORDS.test(w));
    if (englishWords.length > words.length / 2) continue;

    translations.push(line);
  }

  return [...new Set(translations)].slice(0, 5);
}

/**
 * Convert a single dictionary to JSON
 */
async function convertDictionary(langPair, metadata) {
  console.log(`\nConverting ${langPair}...`);

  const publicDir = path.join(__dirname, '..', 'public');
  const baseDir = path.join(publicDir, metadata.downloadUrl);
  const filePrefix = metadata.filePrefix;

  // Read index file
  console.log(`  Loading index...`);
  let indexData;
  const idxGzPath = path.join(baseDir, `${filePrefix}.idx.gz`);
  const idxPath = path.join(baseDir, `${filePrefix}.idx`);

  if (fs.existsSync(idxGzPath)) {
    const compressed = fs.readFileSync(idxGzPath);
    indexData = pako.ungzip(compressed);
  } else if (fs.existsSync(idxPath)) {
    const rawData = fs.readFileSync(idxPath);
    // Check if the .idx file is actually gzipped (magic number 0x1f 0x8b)
    if (rawData[0] === 0x1f && rawData[1] === 0x8b) {
      indexData = pako.ungzip(rawData);
    } else {
      indexData = rawData;
    }
  } else {
    throw new Error(`Index file not found for ${langPair}`);
  }

  const index = parseIndex(indexData);

  // Read dictionary data
  console.log(`  Loading dictionary data...`);
  const dictPath = path.join(baseDir, `${filePrefix}.dict.dz`);
  if (!fs.existsSync(dictPath)) {
    throw new Error(`Dictionary file not found: ${dictPath}`);
  }

  const dictCompressed = fs.readFileSync(dictPath);
  const dictData = pako.ungzip(dictCompressed);

  // Build JSON dictionary
  console.log(`  Building JSON dictionary...`);
  const jsonDict = {};
  let processed = 0;
  let successful = 0;

  for (const [word, entry] of index.entries()) {
    processed++;
    if (processed % 5000 === 0) {
      console.log(`  Progress: ${processed}/${index.size} words...`);
    }

    try {
      // Extract definition
      const defData = dictData.slice(entry.offset, entry.offset + entry.size);
      const definition = Buffer.from(defData).toString('utf-8');

      // Parse definition
      const translations = parseDefinition(definition);

      if (translations.length > 0) {
        // Store the first (best) translation
        jsonDict[word] = translations[0];
        successful++;
      }
    } catch (error) {
      // Skip words that fail to parse
    }
  }

  console.log(`  Successfully converted ${successful}/${processed} words`);
  return jsonDict;
}

/**
 * Main function
 */
async function main() {
  console.log('StarDict to JSON Converter');
  console.log('==========================\n');

  const outputDir = path.join(__dirname, '..', 'dictionaries-json');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Convert each dictionary
  for (const [langPair, metadata] of Object.entries(DICTIONARIES)) {
    try {
      const jsonDict = await convertDictionary(langPair, metadata);

      // Write JSON file
      const outputPath = path.join(outputDir, `${langPair}.json`);
      fs.writeFileSync(
        outputPath,
        JSON.stringify(jsonDict, null, 2),
        'utf-8'
      );

      console.log(`  ✅ Saved to ${outputPath}`);

      // Print stats
      const fileSize = fs.statSync(outputPath).size;
      const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
      console.log(`  File size: ${fileSizeMB} MB`);

    } catch (error) {
      console.error(`  ❌ Failed to convert ${langPair}:`, error.message);
    }
  }

  console.log('\n✅ Conversion complete!');
  console.log(`Output directory: ${outputDir}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
