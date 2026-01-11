// Script to extract translations from translations.ts to JSON files
const fs = require('fs');
const path = require('path');

// Import the translations
const { TRANSLATIONS } = require('../translations.ts');
const { Language } = require('../types.ts');

// Language code mapping
const languageMap = {
  [Language.ENGLISH]: 'en',
  [Language.SPANISH]: 'es',
  [Language.FRENCH]: 'fr',
  [Language.GERMAN]: 'de',
  [Language.ITALIAN]: 'it',
  [Language.JAPANESE]: 'ja',
  [Language.MANDARIN]: 'zh',
  [Language.RUSSIAN]: 'ru',
  [Language.PORTUGUESE]: 'pt',
  [Language.UKRAINIAN]: 'uk',
  [Language.POLISH]: 'pl',
  [Language.CZECH]: 'cs'
};

// Create locale directories and JSON files
Object.entries(languageMap).forEach(([langEnum, langCode]) => {
  const dirPath = path.join(__dirname, '..', 'src', 'locales', langCode);
  const filePath = path.join(dirPath, 'common.json');

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Get translations for this language
  const translations = TRANSLATIONS[langEnum];

  // Write to JSON file
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));

  console.log(`✅ Created ${langCode}/common.json`);
});

console.log('\n✨ All translation files created!');
