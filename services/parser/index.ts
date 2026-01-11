/**
 * Parser Module - Natural Language Processing for Penko
 *
 * This module provides comprehensive NLP capabilities for parsing player commands
 * across all 12 supported languages.
 */

// Core Parser
export { SmartParser } from './SmartParser';
export type { ParseResult } from './SmartParser';

// Standard Mode Parser (with content pack support)
export { StandardModeParser, createParserFromContentPack } from './StandardModeParser';
export type { EnhancedParseResult } from './StandardModeParser';

// Grammar Utilities
export { GrammarUtils } from './grammarUtils';

// Language Data
export { VERB_DB, GRAMMAR } from './data/languageData';

// World Data
export { ENTITY_DB, BIOME_DB, ENTITY_METADATA } from './data/worldData';
export type { EntityMetadata } from './data/worldData';
