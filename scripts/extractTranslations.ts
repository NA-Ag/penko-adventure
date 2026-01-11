import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TRANSLATIONS } from '../translations.js';
import { Language } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Map Language enum to i18next language codes
const languageCodeMap: Record<Language, string> = {
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

// Ensure directories exist
Object.values(languageCodeMap).forEach(langCode => {
    const dir = join(__dirname, '..', 'src', 'locales', langCode);
    mkdirSync(dir, { recursive: true });
});

// Extract and write translations
Object.entries(TRANSLATIONS).forEach(([lang, translations]) => {
    const langCode = languageCodeMap[lang as Language];
    const filePath = join(__dirname, '..', 'src', 'locales', langCode, 'common.json');

    writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
    console.log(`✓ Extracted ${langCode}/common.json`);
});

console.log('\n✅ All translations extracted successfully!');
