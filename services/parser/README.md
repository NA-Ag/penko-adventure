# Parser Module

**Natural Language Processing for Penko**

This module provides comprehensive NLP capabilities for parsing player commands across all 12 supported languages.

---

## 📁 Structure

```
services/parser/
├── index.ts                # Main exports
├── SmartParser.ts          # Core NLP parser
├── grammarUtils.ts         # Gender agreement & inflection
├── data/
│   ├── languageData.ts     # VERB_DB + GRAMMAR vocabulary
│   └── worldData.ts        # ENTITY_DB + BIOME_DB
└── README.md              # This file
```

---

## 🚀 Quick Start

```typescript
import { SmartParser, VERB_DB, GRAMMAR } from './services/parser';

// Create parser instance
const parser = new SmartParser(
  { entity: 'merchant', feature: 'chest' },  // Context
  false,                                      // Use API? (false = use local dictionary)
  userProfile                                 // User profile with target/native language
);

// Parse command
const result = await parser.parse("hablar con el mercader", Language.SPANISH);
// Returns: { intent: 'SPEAK', confidence: 0.95, feedback: undefined }
```

---

## 📚 Components

### SmartParser

Natural language command parser with:
- Intent classification (MOVE, ATTACK, LOOT, LOOK, SPEAK)
- Direction extraction (north, south, east, west)
- Typo correction via Levenshtein distance
- Synonym matching via dictionaries
- Context-aware entity/feature recognition

**Usage:**
```typescript
const parser = new SmartParser(context, useAPI, profile);
const result = await parser.parse(input, language);
```

### StandardModeParser ⭐ NEW

Enhanced parser for Community Mode with content pack support:
- Extends SmartParser with custom vocabulary integration
- Merges content pack vocabulary with base GRAMMAR
- Entity/location recognition from content packs
- Educational feedback for learners
- Vocabulary validation against content pack
- Intent-based verb suggestions

**Usage:**
```typescript
import { createParserFromContentPack } from './services/parser';

// Create parser from content pack
const parser = createParserFromContentPack(
  contentPack,
  userProfile,
  currentLocationId
);

// Parse with content pack context
const result = await parser.parseWithContentPack(input, language);

// Access enhanced features
console.log(result.contentPackContext?.customVocabUsed);
console.log(result.contentPackContext?.recognizedEntity);
console.log(result.contentPackContext?.suggestions);

// Get educational feedback
const feedback = parser.getEducationalFeedback(input, result, language);
```

### GrammarUtils

Gender agreement and inflection for Romance languages:
- Auto-correct articles (un/una, el/la, le/la)
- Inflect adjectives to match noun gender
- Guess word gender with 90% accuracy
- Support for Spanish, French, Italian, Portuguese, Russian

**Usage:**
```typescript
// Auto-correct gender agreement
const corrected = GrammarUtils.autoCorrect("Un manzana rojo", Language.SPANISH);
// Returns: "Una manzana roja"

// Inflect adjective to feminine
const feminine = GrammarUtils.inflect("rojo", 'F', Language.SPANISH);
// Returns: "roja"

// Guess gender
const gender = GrammarUtils.guessGender("manzana", Language.SPANISH);
// Returns: 'F'
```

### VERB_DB

Intent classification database mapping verbs → intents:
- **MOVE** - Movement (go, walk, run, enter)
- **ATTACK** - Combat (attack, hit, kill, fight)
- **LOOT** - Items (take, grab, open, search)
- **LOOK** - Examination (look, examine, inspect)
- **SPEAK** - Communication (talk, speak, ask)

**All 12 languages supported.**

### GRAMMAR

Comprehensive vocabulary database (10,000+ words):
- Adjectives (personality, atmosphere, size, color, condition)
- Nouns (features, decor, directions, quest items)
- Verbs (dialogue, movement, intransitive)
- Directions (north, south, east, west)

**All 12 languages supported.**

### ENTITY_DB & BIOME_DB

World object translations:
- **Entities**: merchant, wolf, ghost, zombie, robot, chest, shrine, etc.
- **Biomes**: forest, cave, town, desert, dungeon, graveyard, cyber_city, canyon, interior
- **Metadata**: Entity types (HUMANOID, BEAST, UNDEAD, SPIRIT, CONSTRUCT)
- **Behaviors**: AGGRESSIVE, PASSIVE, FRIENDLY

---

## 🔧 Integration Guide

### For Standard Mode

```typescript
import { SmartParser } from './services/parser';

export class StandardModeParser extends SmartParser {
  async parseForContentPack(
    input: string,
    lang: Language,
    contentPack: ContentPack
  ): Promise<EnhancedParseResult> {
    // Use SmartParser's existing parse()
    const baseResult = await this.parse(input, lang);

    // Add content pack context
    // ...

    return enhancedResult;
  }
}
```

### For Workshop

```typescript
import { GRAMMAR, ENTITY_DB, BIOME_DB, GrammarUtils } from './services/parser';

// Validate content pack vocabulary
function validateVocabulary(word: string, category: string, lang: Language): boolean {
  return GRAMMAR[category]?.[lang]?.includes(word) ?? false;
}

// Auto-correct gender in editor
function correctGender(text: string, lang: Language): string {
  return GrammarUtils.autoCorrect(text, lang);
}
```

---

## 📊 Supported Languages

All parser components support these languages:
- English
- Spanish
- French
- German
- Italian
- Japanese
- Mandarin
- Russian
- Portuguese
- Ukrainian
- Polish
- Czech

---

## 🧪 Testing

```typescript
import { SmartParser } from './services/parser';

// Test Spanish parsing
const parser = new SmartParser({}, false, profile);
const result = await parser.parse("atacar al lobo", Language.SPANISH);
expect(result.intent).toBe('ATTACK');

// Test typo correction
const result2 = await parser.parse("attck wolf", Language.ENGLISH);
expect(result2.correction).toBeDefined();
```

---

## 📝 Notes

- Parser was moved from `services/offline/` to `services/parser/` on 2025-12-09
- Previously named `Parser.ts`, renamed to `SmartParser.ts` for clarity
- All imports updated throughout codebase
- Fully backward compatible with existing code

---

## 🔗 Related Documentation

- `/docs/LEGACY_SYSTEMS_FOR_PARSER.md` - Detailed system analysis
- `/docs/OVERHAUL_STANDARD_MODE.md` - Integration roadmap
- `/services/dictionaryService.ts` - Frequency dictionaries
