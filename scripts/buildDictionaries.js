
const fs = require('fs');
const path = require('path');

// Map full language names to ISO codes matching our app types
const LANGUAGES = {
  'English': 'en',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Japanese': 'ja',
  'Mandarin': 'zh',
  'Russian': 'ru',
  'Portuguese': 'pt',
  'Ukrainian': 'uk',
  'Polish': 'pl',
  'Czech': 'cs'
};

const TOP_N = 3000; // Limit to top 3000 words to keep JSON small

/**
 * Parse a frequency list file (format: "word frequency")
 */
function parseFrequencyFile(filePath, topN = TOP_N) {
  if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  const words = lines
    .slice(0, topN)
    .map(line => {
      // Handle different formats (space or tab separated)
      const parts = line.trim().split(/\s+/);
      const word = parts[0];
      const freq = parts[1] ? parseInt(parts[1]) : 0;
      
      return {
        word: word.toLowerCase(),
        frequency: isNaN(freq) ? 0 : freq
      };
    });

  return words;
}

function buildDictionary(words) {
  const dictionary = {};
  words.forEach((entry, index) => {
    dictionary[entry.word] = {
      frequency: entry.frequency,
      rank: index + 1
    };
  });
  return dictionary;
}

function buildAllDictionaries() {
  const dictDir = path.join(__dirname, '../public/dictionaries');
  
  if (!fs.existsSync(dictDir)) {
      fs.mkdirSync(dictDir, { recursive: true });
  }

  console.log("🏗️ Building Offline Dictionaries...");

  for (const [langName, code] of Object.entries(LANGUAGES)) {
    const inputFile = path.join(dictDir, `${code}_raw.txt`);
    const outputFile = path.join(dictDir, `${code}.json`);

    try {
      const words = parseFrequencyFile(inputFile);
      const dictionary = buildDictionary(words);

      // Write compressed JSON (no whitespace)
      fs.writeFileSync(outputFile, JSON.stringify(dictionary));

      const sizeMB = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2);
      console.log(`✅ ${langName} (${code}): ${Object.keys(dictionary).length} words, ${sizeMB}MB`);

    } catch (error) {
      console.warn(`⚠️ Skipping ${langName}: ${error.message}. (Add ${code}_raw.txt to public/dictionaries to fix)`);
    }
  }
  console.log("\n✨ Dictionary build complete.");

  // Run binary conversion for Tier 12
  console.log("\n🔄 Starting Tier 12 binary conversion...");
  try {
    require('./convertToBinary.cjs');
  } catch (error) {
    console.error("⚠️ Binary conversion failed:", error.message);
  }
}

buildAllDictionaries();
