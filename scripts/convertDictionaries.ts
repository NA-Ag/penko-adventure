/**
 * StarDict to TypeScript Dictionary Converter
 *
 * This script extracts complete dictionaries from StarDict format
 * and generates simple TypeScript modules with hardcoded word pairs.
 *
 * Output format: TypeScript modules with Map<string, string> for instant lookup
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DictionaryEntry {
  word: string;
  definition: string;
}

interface StarDictInfo {
  version: string;
  wordcount: number;
  bookname: string;
  sametypesequence?: string;
}

/**
 * Parse .ifo file to get dictionary metadata
 */
function parseIfoFile(ifoPath: string): StarDictInfo {
  const content = fs.readFileSync(ifoPath, 'utf-8');
  const lines = content.split('\n');

  const info: any = {};

  for (const line of lines) {
    if (line.includes('=')) {
      const [key, value] = line.split('=');
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();

      if (trimmedKey === 'wordcount' || trimmedKey === 'idxoffsetbits') {
        info[trimmedKey] = parseInt(trimmedValue);
      } else {
        info[trimmedKey] = trimmedValue;
      }
    }
  }

  return info as StarDictInfo;
}

/**
 * Decompress .gz or .dz file
 */
function decompressFile(filePath: string): Buffer {
  const compressed = fs.readFileSync(filePath);
  return zlib.gunzipSync(compressed);
}

/**
 * Parse .idx file to get word offsets
 */
function parseIdxFile(idxBuffer: Buffer): Map<string, { offset: number, size: number }> {
  const entries = new Map<string, { offset: number, size: number }>();
  let pos = 0;

  while (pos < idxBuffer.length) {
    // Read null-terminated word
    let wordEnd = pos;
    while (wordEnd < idxBuffer.length && idxBuffer[wordEnd] !== 0) {
      wordEnd++;
    }

    if (wordEnd >= idxBuffer.length) break;

    const word = idxBuffer.subarray(pos, wordEnd).toString('utf-8').toLowerCase();
    pos = wordEnd + 1;

    if (pos + 8 > idxBuffer.length) break;

    // Read offset (4 bytes, big-endian)
    const offset = idxBuffer.readUInt32BE(pos);
    pos += 4;

    // Read size (4 bytes, big-endian)
    const size = idxBuffer.readUInt32BE(pos);
    pos += 4;

    entries.set(word, { offset, size });
  }

  return entries;
}

/**
 * Extract definition from .dict file
 */
function extractDefinition(dictBuffer: Buffer, offset: number, size: number): string {
  // First byte is type indicator (usually 'm' for text or 'g' for data)
  const typeIndicator = dictBuffer[offset];

  // Skip type indicator, get actual definition
  const defBuffer = dictBuffer.subarray(offset + 1, offset + size);
  let definition = defBuffer.toString('utf-8');

  // Clean up definition
  definition = definition
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '; ')    // Convert newlines to semicolons
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();

  return definition;
}

/**
 * Convert StarDict to TypeScript module
 */
function convertDictionary(
  baseDir: string,
  dictName: string,
  outputPath: string,
  langCode: string
): void {
  console.log(`\n[Converting] ${dictName} (${langCode})...`);

  // Find .ifo file
  const ifoFiles = fs.readdirSync(baseDir, { recursive: true })
    .filter((f: any) => f.toString().endsWith('.ifo'));

  if (ifoFiles.length === 0) {
    console.error(`  ❌ No .ifo file found in ${baseDir}`);
    return;
  }

  const ifoPath = path.join(baseDir, ifoFiles[0].toString());
  const baseName = ifoFiles[0].toString().replace('.ifo', '');
  const dictDir = path.dirname(ifoPath);

  console.log(`  📖 Found: ${baseName}`);

  // Parse info
  const info = parseIfoFile(ifoPath);
  console.log(`  📊 Word count: ${info.wordcount}`);

  // Find and decompress .idx file
  let idxBuffer: Buffer;
  const idxPathGz = path.join(dictDir, `${baseName}.idx.gz`);
  const idxPathDz = path.join(dictDir, `${baseName}.idx.dz`);
  const idxPathRaw = path.join(dictDir, `${baseName}.idx`);

  if (fs.existsSync(idxPathGz)) {
    console.log(`  🗜️  Decompressing index (.gz)...`);
    idxBuffer = decompressFile(idxPathGz);
  } else if (fs.existsSync(idxPathDz)) {
    console.log(`  🗜️  Decompressing index (.dz)...`);
    idxBuffer = decompressFile(idxPathDz);
  } else if (fs.existsSync(idxPathRaw)) {
    console.log(`  📄 Reading uncompressed index...`);
    idxBuffer = fs.readFileSync(idxPathRaw);
  } else {
    console.error(`  ❌ No .idx file found`);
    return;
  }

  // Parse index
  console.log(`  📇 Parsing index...`);
  const entries = parseIdxFile(idxBuffer);
  console.log(`  ✅ Parsed ${entries.size} entries`);

  // Find and decompress .dict file
  const dictPath = path.join(dictDir, `${baseName}.dict.dz`);
  if (!fs.existsSync(dictPath)) {
    console.error(`  ❌ No .dict file found`);
    return;
  }

  console.log(`  🗜️  Decompressing dictionary data...`);
  const dictBuffer = decompressFile(dictPath);
  console.log(`  ✅ Dictionary size: ${(dictBuffer.length / 1024 / 1024).toFixed(2)} MB`);

  // Extract all definitions
  console.log(`  📝 Extracting definitions...`);
  const dictionary: DictionaryEntry[] = [];

  for (const [word, { offset, size }] of entries) {
    try {
      const definition = extractDefinition(dictBuffer, offset, size);
      if (definition && definition.length > 0) {
        dictionary.push({ word, definition });
      }
    } catch (err) {
      // Skip malformed entries
    }
  }

  console.log(`  ✅ Extracted ${dictionary.size} valid definitions`);

  // Generate TypeScript module
  console.log(`  💾 Writing TypeScript module...`);

  const header = `/**
 * ${info.bookname}
 * Auto-generated from StarDict dictionary
 *
 * Language: ${langCode}
 * Entries: ${dictionary.length}
 * Generated: ${new Date().toISOString()}
 */

export const ${langCode.replace('-', '_')}_dictionary = new Map<string, string>([
`;

  const footer = `]);

export default ${langCode.replace('-', '_')}_dictionary;
`;

  // Write in chunks to avoid memory issues
  const outputFile = path.join(outputPath, `${langCode}.dict.ts`);

  return new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(outputFile);

    writeStream.on('error', reject);
    writeStream.on('finish', () => {
      console.log(`  ✅ Written to ${outputFile}`);
      const fileSizeMB = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2);
      console.log(`  📦 File size: ${fileSizeMB} MB`);
      resolve();
    });

    writeStream.write(header);

    let count = 0;
    for (const { word, definition } of dictionary) {
      // Escape special characters properly for JavaScript strings
      const escapedWord = word
        .replace(/\\/g, '\\\\')   // Escape backslashes first
        .replace(/'/g, "\\'")      // Escape single quotes
        .replace(/"/g, '\\"')      // Escape double quotes
        .replace(/\n/g, '\\n')     // Escape newlines
        .replace(/\r/g, '\\r')     // Escape carriage returns
        .replace(/\t/g, '\\t');    // Escape tabs

      const escapedDef = definition
        .replace(/\\/g, '\\\\')    // Escape backslashes first
        .replace(/'/g, "\\'")      // Escape single quotes
        .replace(/"/g, '\\"')      // Escape double quotes
        .replace(/\n/g, '\\n')     // Escape newlines
        .replace(/\r/g, '\\r')     // Escape carriage returns
        .replace(/\t/g, '\\t');    // Escape tabs

      writeStream.write(`  ['${escapedWord}', '${escapedDef}'],\n`);
      count++;

      if (count % 5000 === 0) {
        console.log(`    Progress: ${count}/${dictionary.length}`);
      }
    }

    writeStream.write(footer);
    writeStream.end();
  });
}

/**
 * Main conversion process
 */
async function main() {
  const baseDir = path.join(__dirname, '../public/dictionaries/organized');
  const outputDir = path.join(__dirname, '../src/data/dictionaries');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Starting dictionary conversion...');
  console.log(`📂 Source: ${baseDir}`);
  console.log(`📂 Output: ${outputDir}`);

  // Dictionary mapping: folder -> language code
  const dictionaries = [
    { dir: 'romance/eng-spa', code: 'en-es', name: 'English-Spanish' },
    { dir: 'romance/eng-fra', code: 'en-fr', name: 'English-French' },
    { dir: 'romance/French-English Wiktionary dictionary stardict', code: 'fr-en', name: 'French-English' },
    { dir: 'romance/freedict-eng-ita-2024.10.10.stardict', code: 'en-it', name: 'English-Italian' },
    { dir: 'romance/freedict-eng-por-0.3.stardict', code: 'en-pt', name: 'English-Portuguese' },
    { dir: 'germanic/freedict-eng-deu-1.9-fd1.stardict', code: 'en-de', name: 'English-German' },
    { dir: 'slavic/freedict-eng-rus-2024.10.10.stardict', code: 'en-ru', name: 'English-Russian' },
    { dir: 'slavic/freedict-eng-pol-0.2.1.stardict', code: 'en-pl', name: 'English-Polish' },
    { dir: 'slavic/freedict-eng-ces-0.1.3.stardict', code: 'en-cs', name: 'English-Czech' },
    { dir: 'slavic/Ukrainian-English Wiktionary dictionary stardict', code: 'en-uk', name: 'English-Ukrainian' },
    { dir: 'east-asian/jpn-eng', code: 'en-ja', name: 'English-Japanese' },
    { dir: 'east-asian/Chinese-English Wiktionary dictionary stardict', code: 'en-zh', name: 'English-Chinese' },
  ];

  for (const dict of dictionaries) {
    const dictPath = path.join(baseDir, dict.dir);
    if (fs.existsSync(dictPath)) {
      try {
        await convertDictionary(dictPath, dict.name, outputDir, dict.code);
      } catch (err) {
        console.error(`  ❌ Failed to convert ${dict.name}:`, err);
      }
    } else {
      console.error(`  ❌ Directory not found: ${dictPath}`);
    }
  }

  console.log('\n✅ Conversion complete!');
}

main().catch(console.error);
