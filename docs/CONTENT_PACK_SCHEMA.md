# Content Pack Schema

**Version:** 1.0.0
**Created:** 2025-12-09
**Status:** Draft Specification

---

## 📦 Overview

A **Content Pack** is a single JSON file containing everything needed for a complete language learning adventure in Penko's Community Mode.

Content packs are:
- **Portable** - One file, share anywhere
- **Multilingual** - Support any of 12 languages
- **Genre-based** - Tied to narrative themes
- **Community-driven** - Created by users, shared freely
- **Zero AI** - Work 100% offline

---

## 📐 File Structure

```json
{
  "metadata": { /* Content pack info */ },
  "world": { /* Locations, NPCs, items */ },
  "events": [ /* Dynamic event system */ ],
  "statistics": { /* Progress tracking */ },
  "vocabulary": { /* Custom words for parser */ }
}
```

---

## 🏷️ Metadata Section

```json
{
  "metadata": {
    "id": "fantasy_forest_es_001",
    "title": "El Bosque Encantado",
    "description": "A magical forest adventure for Spanish learners",
    "author": "username",
    "version": "1.0.0",
    "created": "2025-12-09",
    "language": "SPANISH",
    "genre": "fantasy",
    "difficulty": "beginner",
    "estimatedTime": 30,
    "tags": ["magic", "forest", "creatures", "quests"],
    "thumbnail": "base64_encoded_image_optional",
    "contentRating": "everyone",
    "dependencies": []
  }
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier (format: `{genre}_{theme}_{lang}_{number}`) |
| `title` | string | ✅ | Display name (in target language) |
| `description` | string | ✅ | Brief description (in English for discovery) |
| `author` | string | ✅ | Creator username |
| `version` | string | ✅ | Semantic versioning (e.g., "1.0.0") |
| `created` | string | ✅ | ISO date (YYYY-MM-DD) |
| `language` | Language | ✅ | One of 12 supported languages |
| `genre` | NarrativeGenre | ✅ | One of: fantasy, scifi, mystery, horror, western, cyberpunk |
| `difficulty` | string | ✅ | beginner, intermediate, advanced |
| `estimatedTime` | number | ✅ | Minutes to complete |
| `tags` | string[] | ❌ | Searchable keywords |
| `thumbnail` | string | ❌ | Base64 PNG/JPG (optional preview image) |
| `contentRating` | string | ❌ | everyone, teen, mature |
| `dependencies` | string[] | ❌ | IDs of required content packs (future feature) |

---

## 🗺️ World Section

```json
{
  "world": {
    "startLocation": "forest_entrance",
    "locations": [
      {
        "id": "forest_entrance",
        "name": "Entrada del Bosque",
        "biome": "forest",
        "timeOfDay": "day",
        "description": "Un sendero oscuro se adentra en el bosque encantado.",
        "features": ["ancient_tree", "stone_path"],
        "entities": ["mysterious_traveler"],
        "items": ["wooden_staff"],
        "connections": {
          "north": "deep_forest",
          "east": "river_crossing"
        },
        "metadata": {
          "visited": false,
          "discoverable": true
        }
      }
    ],
    "entities": [
      {
        "id": "mysterious_traveler",
        "name": "Viajero Misterioso",
        "type": "HUMANOID",
        "behavior": "FRIENDLY",
        "description": "Un viajero anciano con una capa azul oscuro.",
        "dialogue": [
          {
            "id": "greeting",
            "condition": "first_meeting",
            "text": "¡Bienvenido al bosque! Ten cuidado con las criaturas nocturnas.",
            "responses": [
              { "text": "Gracias por el consejo", "effect": "gain_knowledge" },
              { "text": "No tengo miedo", "effect": "gain_courage" }
            ]
          }
        ],
        "quests": ["find_ancient_artifact"],
        "shop": null
      }
    ],
    "items": [
      {
        "id": "wooden_staff",
        "name": "Bastón de Madera",
        "description": "Un bastón tallado con runas antiguas.",
        "type": "WEAPON",
        "properties": {
          "damage": 5,
          "durability": 100
        },
        "stackable": false,
        "questItem": false
      }
    ],
    "quests": [
      {
        "id": "find_ancient_artifact",
        "title": "El Artefacto Perdido",
        "description": "Encuentra el artefacto antiguo escondido en el bosque.",
        "giver": "mysterious_traveler",
        "objectives": [
          { "id": "explore_cave", "type": "VISIT", "target": "hidden_cave", "completed": false },
          { "id": "defeat_guardian", "type": "DEFEAT", "target": "stone_guardian", "completed": false },
          { "id": "collect_artifact", "type": "COLLECT", "target": "ancient_medallion", "completed": false }
        ],
        "rewards": {
          "experience": 100,
          "items": ["magic_amulet"],
          "statistics": { "quests_completed": 1 }
        },
        "state": "available"
      }
    ]
  }
}
```

### Biomes (9 types)
- `forest` - Mystical woods
- `cave` - Dark underground
- `town` - Settlements
- `desert` - Arid wasteland
- `dungeon` - Dangerous labyrinths
- `interior` - Inside buildings
- `graveyard` - Spooky cemetery
- `cyber_city` - Futuristic metropolis
- `canyon` - Rocky gorges

### Entity Types
- `HUMANOID` - People, merchants, travelers
- `BEAST` - Animals, creatures
- `UNDEAD` - Zombies, ghosts, skeletons
- `SPIRIT` - Ethereal beings
- `CONSTRUCT` - Robots, golems, machines

### Entity Behaviors
- `FRIENDLY` - Will help player
- `PASSIVE` - Neutral, won't attack
- `AGGRESSIVE` - Attacks on sight

---

## ⚡ Events Section

```json
{
  "events": [
    {
      "id": "wolf_encounter",
      "name": "Encuentro con Lobo",
      "description": "A wolf appears when entering the deep forest at night",
      "trigger": {
        "type": "LOCATION",
        "location": "deep_forest",
        "conditions": [
          { "stat": "time_of_day", "operator": "equals", "value": "night" },
          { "stat": "wolf_defeated", "operator": "equals", "value": false }
        ]
      },
      "actions": [
        {
          "type": "SPAWN_ENTITY",
          "entity": "hungry_wolf",
          "location": "deep_forest"
        },
        {
          "type": "SHOW_MESSAGE",
          "text": "¡Un lobo hambriento aparece de las sombras!",
          "style": "danger"
        },
        {
          "type": "PLAY_ANIMATION",
          "animation": "wolf_growl"
        }
      ],
      "priority": 10,
      "repeatable": false,
      "cooldown": 0
    }
  ]
}
```

### Event Trigger Types
- `LOCATION` - Player enters location
- `COMBAT` - Combat starts/ends
- `ITEM` - Item used/collected
- `DIALOGUE` - Conversation completed
- `QUEST` - Quest state changes
- `STATISTIC` - Stat reaches threshold
- `TIME` - Time-based trigger

### Event Action Types
- `SPAWN_ENTITY` - Add entity to world
- `REMOVE_ENTITY` - Remove entity from world
- `SHOW_MESSAGE` - Display text to player
- `MODIFY_STAT` - Change statistic value
- `ADD_ITEM` - Give item to player
- `REMOVE_ITEM` - Take item from player
- `UNLOCK_LOCATION` - Make location accessible
- `START_QUEST` - Begin quest
- `COMPLETE_QUEST` - Finish quest
- `PLAY_ANIMATION` - Trigger animation
- `CHANGE_BIOME` - Transform location appearance
- `CHANGE_TIME` - Alter time of day

### Condition Operators
- `equals` - Exact match
- `not_equals` - Not equal
- `greater_than` - Number comparison
- `less_than` - Number comparison
- `contains` - Array/string contains value
- `not_contains` - Array/string doesn't contain

---

## 📊 Statistics Section

```json
{
  "statistics": {
    "words_learned": {
      "displayName": "Palabras Aprendidas",
      "startValue": 0,
      "targetValue": 100,
      "unit": "words",
      "visible": true,
      "category": "vocabulary"
    },
    "enemies_defeated": {
      "displayName": "Enemigos Derrotados",
      "startValue": 0,
      "targetValue": null,
      "unit": "enemies",
      "visible": true,
      "category": "combat"
    },
    "locations_discovered": {
      "displayName": "Lugares Descubiertos",
      "startValue": 0,
      "targetValue": 10,
      "unit": "locations",
      "visible": true,
      "category": "exploration"
    },
    "quests_completed": {
      "displayName": "Misiones Completadas",
      "startValue": 0,
      "targetValue": 5,
      "unit": "quests",
      "visible": true,
      "category": "progression"
    },
    "time_of_day": {
      "displayName": "Hora del Día",
      "startValue": "day",
      "targetValue": null,
      "unit": null,
      "visible": false,
      "category": "internal"
    }
  }
}
```

### Statistic Categories
- `vocabulary` - Language learning metrics
- `combat` - Battle statistics
- `exploration` - Discovery metrics
- `progression` - Quest/story progress
- `social` - NPC interactions
- `internal` - Hidden state variables

---

## 📚 Vocabulary Section

```json
{
  "vocabulary": {
    "verbs": {
      "examinar": { "intent": "LOOK", "synonyms": ["mirar", "observar", "inspeccionar"] },
      "atacar": { "intent": "ATTACK", "synonyms": ["golpear", "luchar", "pelear"] },
      "tomar": { "intent": "LOOT", "synonyms": ["agarrar", "coger", "recoger"] },
      "hablar": { "intent": "SPEAK", "synonyms": ["decir", "conversar", "preguntar"] },
      "caminar": { "intent": "MOVE", "synonyms": ["ir", "mover", "andar"] }
    },
    "nouns": {
      "bosque": { "gender": "M", "category": "location" },
      "espada": { "gender": "F", "category": "weapon" },
      "lobo": { "gender": "M", "category": "creature" }
    },
    "adjectives": {
      "antiguo": { "feminine": "antigua", "plural": "antiguos", "category": "condition" },
      "oscuro": { "feminine": "oscura", "plural": "oscuros", "category": "atmosphere" }
    }
  }
}
```

### Intent Types (from SmartParser)
- `MOVE` - Movement commands
- `ATTACK` - Combat commands
- `LOOT` - Item interaction
- `LOOK` - Examination
- `SPEAK` - Dialogue

### Why Custom Vocabulary?
1. **Content-specific words** not in base GRAMMAR database
2. **Synonym expansion** for better parser accuracy
3. **Gender hints** for Romance language agreement
4. **Context clues** for disambiguation

---

## ✅ Validation Rules

### Required Sections
- ✅ `metadata` - Must exist
- ✅ `world` - Must have at least 1 location
- ❌ `events` - Optional but recommended
- ❌ `statistics` - Optional
- ❌ `vocabulary` - Optional (falls back to GRAMMAR)

### Metadata Validation
- `id` must be unique and follow naming convention
- `language` must be one of 12 supported languages
- `genre` must be one of 6 narrative genres
- `version` must follow semver format

### World Validation
- `startLocation` must reference existing location ID
- All location `connections` must reference existing locations
- All entity references must exist in `entities` array
- All item references must exist in `items` array
- Quest objectives must reference valid targets

### Event Validation
- Trigger `location` must reference existing location
- Action `entity` must reference existing entity
- Condition stats must reference statistics or world state
- No circular event dependencies

### Statistics Validation
- All statistics referenced in events must be defined
- `startValue` type must match expected type
- `targetValue` must be greater than `startValue` (if numeric)

---

## 📏 Size Limits

| Element | Limit | Reasoning |
|---------|-------|-----------|
| Total file size | 5 MB | Mobile/web performance |
| Locations | 100 | Memory constraints |
| Entities | 200 | Performance |
| Items | 200 | Inventory management |
| Events | 500 | Event processing |
| Statistics | 50 | UI display limits |
| Vocabulary words | 1,000 | Parser efficiency |
| Quest objectives | 10 per quest | UX complexity |
| Dialogue responses | 5 per node | Decision fatigue |

---

## 🎯 Example: Simple Content Pack

```json
{
  "metadata": {
    "id": "fantasy_tavern_es_001",
    "title": "La Taberna del Dragón",
    "description": "Learn Spanish in a fantasy tavern",
    "author": "penko_team",
    "version": "1.0.0",
    "created": "2025-12-09",
    "language": "SPANISH",
    "genre": "fantasy",
    "difficulty": "beginner",
    "estimatedTime": 15,
    "tags": ["tavern", "conversation", "simple"],
    "contentRating": "everyone"
  },
  "world": {
    "startLocation": "tavern_main",
    "locations": [
      {
        "id": "tavern_main",
        "name": "Sala Principal",
        "biome": "interior",
        "timeOfDay": "day",
        "description": "Una acogedora taberna con mesas de madera y una chimenea.",
        "features": ["fireplace", "bar_counter"],
        "entities": ["bartender"],
        "items": ["menu"],
        "connections": {},
        "metadata": { "visited": false, "discoverable": true }
      }
    ],
    "entities": [
      {
        "id": "bartender",
        "name": "Tabernero",
        "type": "HUMANOID",
        "behavior": "FRIENDLY",
        "description": "Un hombre alegre con un delantal blanco.",
        "dialogue": [
          {
            "id": "greeting",
            "condition": "first_meeting",
            "text": "¡Bienvenido! ¿Qué deseas beber?",
            "responses": [
              { "text": "Una cerveza, por favor", "effect": "order_beer" },
              { "text": "Solo agua", "effect": "order_water" }
            ]
          }
        ],
        "quests": [],
        "shop": null
      }
    ],
    "items": [
      {
        "id": "menu",
        "name": "Menú",
        "description": "El menú de la taberna.",
        "type": "MISC",
        "properties": {},
        "stackable": false,
        "questItem": false
      }
    ],
    "quests": []
  },
  "events": [],
  "statistics": {
    "words_learned": {
      "displayName": "Palabras Aprendidas",
      "startValue": 0,
      "targetValue": 10,
      "unit": "words",
      "visible": true,
      "category": "vocabulary"
    }
  },
  "vocabulary": {
    "verbs": {
      "beber": { "intent": "SPEAK", "synonyms": ["tomar"] }
    },
    "nouns": {
      "cerveza": { "gender": "F", "category": "item" },
      "taberna": { "gender": "F", "category": "location" }
    },
    "adjectives": {}
  }
}
```

---

## 🔧 TypeScript Interfaces

```typescript
export interface ContentPack {
  metadata: ContentPackMetadata;
  world: World;
  events: Event[];
  statistics: Record<string, Statistic>;
  vocabulary: Vocabulary;
}

export interface ContentPackMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  version: string;
  created: string;
  language: Language;
  genre: NarrativeGenre;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags?: string[];
  thumbnail?: string;
  contentRating?: 'everyone' | 'teen' | 'mature';
  dependencies?: string[];
}

export interface World {
  startLocation: string;
  locations: Location[];
  entities: Entity[];
  items: Item[];
  quests: Quest[];
}

export interface Location {
  id: string;
  name: string;
  biome: Biome;
  timeOfDay: TimeOfDay;
  description: string;
  features: string[];
  entities: string[];
  items: string[];
  connections: Record<Direction, string>;
  metadata: {
    visited: boolean;
    discoverable: boolean;
  };
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  behavior: EntityBehavior;
  description: string;
  dialogue: DialogueNode[];
  quests: string[];
  shop: Shop | null;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  trigger: EventTrigger;
  actions: EventAction[];
  priority: number;
  repeatable: boolean;
  cooldown: number;
}

export interface Statistic {
  displayName: string;
  startValue: number | string;
  targetValue: number | string | null;
  unit: string | null;
  visible: boolean;
  category: string;
}

export interface Vocabulary {
  verbs: Record<string, VerbEntry>;
  nouns: Record<string, NounEntry>;
  adjectives: Record<string, AdjectiveEntry>;
}
```

---

## 📦 File Naming Convention

Content packs should follow this naming pattern:

```
{genre}_{theme}_{language}_{number}.json
```

Examples:
- `fantasy_forest_es_001.json` - Spanish fantasy forest
- `scifi_spaceship_fr_002.json` - French sci-fi spaceship
- `mystery_mansion_de_001.json` - German mystery mansion
- `horror_graveyard_ja_003.json` - Japanese horror graveyard

---

## 🚀 Usage in Penko

### Loading a Content Pack

```typescript
import { loadContentPack, validateContentPack } from './services/contentPackService';

// Load and validate
const contentPack = await loadContentPack('fantasy_forest_es_001.json');
const validation = validateContentPack(contentPack);

if (!validation.valid) {
  console.error('Invalid content pack:', validation.errors);
  return;
}

// Initialize game with content pack
const engine = new CommunityEngine(contentPack, userProfile);
await engine.initialize();
```

### Parsing with Custom Vocabulary

```typescript
import { SmartParser } from './services/parser';

// Create parser with content pack vocabulary
const parser = new SmartParser(
  { entity: 'bartender', feature: 'bar_counter' },
  false,
  userProfile,
  contentPack.vocabulary  // Custom vocabulary
);

const result = await parser.parse("hablar con el tabernero", Language.SPANISH);
// Uses both GRAMMAR and custom vocabulary
```

---

## 🎓 Educational Benefits

### For Content Creators
- Learn vocabulary in context
- Practice grammar rules
- Understand sentence structure
- Get immediate parser feedback

### For Players
- Contextual vocabulary acquisition
- Immersive language practice
- Grammar correction (Romance languages)
- Typo tolerance (Levenshtein distance)

---

## 🔗 Resources

### Related Files
- `services/parser/` - Parser implementation
- `services/contentPackService.ts` - Loading and validation (to be created)
- `services/legacy/CommunityEngine.ts` - Game engine
- `types.ts` - TypeScript type definitions

### External References
- [AdventStudio](https://github.com/TheEpGuy/AdventStudio) - Inspiration for JSON format
- [OVERHAUL_STANDARD_MODE.md](./OVERHAUL_STANDARD_MODE.md) - Implementation roadmap
- [LEGACY_SYSTEMS_FOR_PARSER.md](./LEGACY_SYSTEMS_FOR_PARSER.md) - Parser documentation

---

## 📝 Notes

- Content packs are **portable** - one file = complete adventure
- Content packs are **language-specific** - one language per pack
- Content packs are **genre-aligned** - visual consistency
- Content packs can be **chained** via dependencies (future feature)
- Workshop will generate these JSON files automatically

---

*"Make content creation accessible, make adventures portable."*
