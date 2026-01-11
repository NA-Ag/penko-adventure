/**
 * SystemStrings - Centralized multilingual system messages
 *
 * Provides access to all system-generated text in all 12 supported languages.
 * Replaces hardcoded English strings throughout the codebase.
 */

import { Language } from '../types';
import systemStringsData from '../data/translations/system_strings.json';

type SystemStrings = typeof systemStringsData;

/**
 * Map Language enum to ISO codes used in system_strings.json
 */
const LANGUAGE_CODE_MAP: Record<Language, string> = {
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
  [Language.CZECH]: 'cs',
};

/**
 * Get a system string in the specified language
 */
export function getSystemString(
  category: keyof SystemStrings,
  key: string,
  language: Language,
  replacements?: Record<string, string>
): string {
  const langCode = LANGUAGE_CODE_MAP[language] || 'en';
  const categoryData = systemStringsData[category] as any;

  if (!categoryData || !categoryData[key]) {
    console.warn(`[SystemStrings] Missing translation: ${category}.${key}`);
    return key; // Fallback to key name
  }

  let text = categoryData[key][langCode] || categoryData[key]['en'] || key;

  // Replace placeholders like {item} with actual values
  if (replacements) {
    for (const [placeholder, value] of Object.entries(replacements)) {
      text = text.replace(`{${placeholder}}`, value);
    }
  }

  return text;
}

/**
 * Get a direction string
 */
export function getDirection(direction: string, language: Language): string {
  return getSystemString('directions', direction.toLowerCase(), language);
}

/**
 * Get an error message
 */
export function getError(errorKey: string, language: Language): string {
  return getSystemString('errors', errorKey, language);
}

/**
 * Get a general message
 */
export function getMessage(
  messageKey: string,
  language: Language,
  replacements?: Record<string, string>
): string {
  return getSystemString('messages', messageKey, language, replacements);
}

/**
 * Get exit format string (e.g., "to")
 */
export function getExitFormat(formatKey: string, language: Language): string {
  return getSystemString('exit_format', formatKey, language);
}

/**
 * Build "You can see: X, Y, Z" message
 */
export function buildAvailableObjectsMessage(
  objectNames: string[],
  language: Language
): string {
  if (objectNames.length === 0) {
    return getError('nothing_here', language);
  }

  const youCanSee = getMessage('you_can_see', language);
  const names = objectNames.join(', ');
  return `${youCanSee}: ${names}`;
}

/**
 * Build "Direction to Location" exit description
 *
 * Examples:
 * - English: "north to Great Hall"
 * - Spanish: "norte a Gran Salón"
 * - French: "nord vers Grande Salle"
 */
export function buildExitDescription(
  direction: string,
  locationName: string,
  language: Language
): string {
  const translatedDirection = getDirection(direction, language);
  const to = getExitFormat('to', language);

  // Capitalize first letter of direction for sentence case
  const capitalizedDirection = translatedDirection.charAt(0).toUpperCase() + translatedDirection.slice(1);

  return `${capitalizedDirection} ${to} ${locationName}`;
}
