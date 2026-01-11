
import { Language } from '../../../types';

export interface ThesaurusEntry {
    word: string;
    tags: string[];
}

// EXCLUSIVE BIOME TAGS: If a word has one of these, it CANNOT appear in a different biome context.
// FOREST, CITY, DUNGEON, CAVE, DESERT, GRAVEYARD, INTERIOR

export const SMART_THESAURUS: Record<string, ThesaurusEntry[]> = {
    ADJ: [
        // ATMOSPHERE
        { word: "oppressive", tags: ["ATMOSPHERE", "SCARY", "NEGATIVE", "INDOOR", "DUNGEON", "CAVE"] },
        { word: "stifling", tags: ["ATMOSPHERE", "HOT", "NEGATIVE", "INDOOR", "DESERT"] },
        { word: "frigid", tags: ["ATMOSPHERE", "COLD", "NEGATIVE", "OUTDOOR", "MOUNTAIN", "GRAVEYARD"] },
        { word: "sun-dappled", tags: ["ATMOSPHERE", "LIGHT", "POSITIVE", "FOREST", "OUTDOOR"] },
        { word: "hallowed", tags: ["ATMOSPHERE", "HOLY", "POSITIVE", "INDOOR", "SHRINE"] },
        { word: "picturesque", tags: ["ATMOSPHERE", "BEAUTIFUL", "POSITIVE", "OUTDOOR", "CITY", "FOREST"] },
        { word: "putrid", tags: ["ATMOSPHERE", "SMELL", "NEGATIVE", "GROSS", "GRAVEYARD", "SEWER"] },
        { word: "claustrophobic", tags: ["ATMOSPHERE", "SCARY", "SMALL", "INDOOR", "CAVE", "DUNGEON"] },
        { word: "cavernous", tags: ["ATMOSPHERE", "BIG", "INDOOR", "SOUND", "CAVE"] },
        { word: "labyrinthine", tags: ["ATMOSPHERE", "CONFUSING", "BIG", "INDOOR", "CITY", "DUNGEON"] },
        { word: "dilapidated", tags: ["CONDITION", "OLD", "BROKEN", "NEGATIVE", "CITY", "HOUSE"] },
        { word: "bustling", tags: ["ATMOSPHERE", "BUSY", "SOUND", "CITY", "MARKET"] },
        { word: "desolate", tags: ["ATMOSPHERE", "EMPTY", "SAD", "OUTDOOR", "DESERT", "GRAVEYARD"] },
        { word: "neon-lit", tags: ["ATMOSPHERE", "LIGHT", "CITY", "CYBERPUNK"] },
        { word: "mossy", tags: ["CONDITION", "OLD", "NATURE", "FOREST", "GRAVEYARD"] },
        
        // PERSONALITY
        { word: "suspicious", tags: ["PERSONALITY", "NEGATIVE", "HUMANOID"] },
        { word: "jovial", tags: ["PERSONALITY", "POSITIVE", "HUMANOID"] },
        { word: "frantic", tags: ["PERSONALITY", "FAST", "NEGATIVE"] },
        { word: "stoic", tags: ["PERSONALITY", "CALM", "HUMANOID"] },
        { word: "skittish", tags: ["PERSONALITY", "NERVOUS", "BEAST"] },
        { word: "menacing", tags: ["PERSONALITY", "AGGRESSIVE"] },
        { word: "greedy", tags: ["PERSONALITY", "NEGATIVE", "HUMANOID"] },
        { word: "feral", tags: ["PERSONALITY", "AGGRESSIVE", "BEAST", "UNDEAD"] },
        { word: "wise", tags: ["PERSONALITY", "POSITIVE", "HUMANOID"] }
    ],
    NOUN: [
        // FEATURES - LIGHTS
        { word: "chandelier", tags: ["LIGHT", "GLASS", "INDOOR", "FEATURE", "CITY", "MANSION"] },
        { word: "brazier", tags: ["LIGHT", "FIRE", "METAL", "INDOOR", "DUNGEON", "FEATURE", "TEMPLE"] },
        { word: "campfire", tags: ["LIGHT", "FIRE", "OUTDOOR", "FEATURE", "FOREST", "DESERT"] },
        { word: "streetlight", tags: ["LIGHT", "CITY", "OUTDOOR", "FEATURE"] },
        { word: "full moon", tags: ["LIGHT", "NATURE", "OUTDOOR", "FEATURE", "FOREST", "GRAVEYARD", "DESERT"] },
        { word: "bioluminescent fungi", tags: ["LIGHT", "NATURE", "CAVE", "FEATURE"] },
        { word: "holographic sign", tags: ["LIGHT", "TECH", "CITY", "FEATURE", "CYBERPUNK"] },

        // FEATURES - DECOR
        { word: "gargoyle", tags: ["FEATURE", "STONE", "SCARY", "DECOR", "CITY", "DUNGEON", "GRAVEYARD"] },
        { word: "tapestry", tags: ["FEATURE", "CLOTH", "DECOR", "OLD", "INDOOR", "CASTLE"] },
        { word: "sarcophagus", tags: ["FEATURE", "DEATH", "STONE", "SCARY", "INDOOR", "DUNGEON", "GRAVEYARD"] },
        { word: "stalactite", tags: ["FEATURE", "STONE", "NATURE", "CAVE", "INDOOR"] },
        { word: "fresco", tags: ["FEATURE", "ART", "OLD", "WALL", "INDOOR", "TEMPLE"] },
        { word: "portcullis", tags: ["FEATURE", "METAL", "DOOR", "STRONG", "DUNGEON", "CASTLE"] },
        { word: "totem", tags: ["FEATURE", "WOOD", "RELIGIOUS", "NATURE", "OUTDOOR", "FOREST"] },
        { word: "fissure", tags: ["FEATURE", "HOLE", "DANGEROUS", "GROUND", "OUTDOOR", "CAVE", "CANYON"] },
        { word: "altar", tags: ["FEATURE", "RELIGIOUS", "STONE", "INDOOR", "OUTDOOR", "TEMPLE", "DUNGEON"] },
        { word: "ancient oak", tags: ["FEATURE", "TREE", "NATURE", "OUTDOOR", "FOREST"] },
        { word: "cactus", tags: ["FEATURE", "PLANT", "NATURE", "OUTDOOR", "DESERT"] },
        { word: "tombstone", tags: ["FEATURE", "STONE", "DEATH", "GRAVEYARD"] },
        { word: "server rack", tags: ["FEATURE", "TECH", "INDOOR", "CITY", "CYBERPUNK"] },
        
        // CONTAINERS
        { word: "coffer", tags: ["CONTAINER", "MONEY", "INDOOR"] },
        { word: "crate", tags: ["CONTAINER", "WOOD", "CITY", "INDOOR", "PORT"] },
        { word: "barrel", tags: ["CONTAINER", "WOOD", "LIQUID", "TAVERN"] },
        { word: "urn", tags: ["CONTAINER", "CERAMIC", "DEATH", "DUNGEON", "GRAVEYARD"] },
        
        // SCENTS
        { word: "ozone", tags: ["SCENT", "MAGIC", "STORM", "CITY"] },
        { word: "pine needles", tags: ["SCENT", "NATURE", "FOREST"] },
        { word: "rotting wood", tags: ["SCENT", "DECAY", "OLD", "FOREST", "DUNGEON"] },
        { word: "old iron", tags: ["SCENT", "METAL", "DUNGEON", "CITY"] },
        { word: "sulfur", tags: ["SCENT", "FIRE", "DEMON", "CAVE"] },
        { word: "wet earth", tags: ["SCENT", "NATURE", "RAIN", "GRAVEYARD", "FOREST"] },
        { word: "incense", tags: ["SCENT", "HOLY", "INDOOR", "TEMPLE"] },
        { word: "exhaust fumes", tags: ["SCENT", "CITY", "BAD"] },
    ],
    VERB: [
        // INTRANSITIVE (Does not take an object) - "It [VERB]"
        { word: "scuttles", tags: ["INTRANS", "MOVE", "FAST", "BUG", "BEAST"] },
        { word: "lumbers", tags: ["INTRANS", "MOVE", "SLOW", "BIG", "BEAST", "CONSTRUCT"] },
        { word: "prowls", tags: ["INTRANS", "MOVE", "SNEAKY", "PREDATOR", "BEAST"] },
        { word: "sprints", tags: ["INTRANS", "MOVE", "FAST", "HUMANOID"] },
        { word: "meanders", tags: ["INTRANS", "MOVE", "SLOW", "CASUAL", "HUMANOID"] },
        { word: "slithers", tags: ["INTRANS", "MOVE", "SNAKE", "GROUND", "BEAST"] },
        { word: "marches", tags: ["INTRANS", "MOVE", "SOLDIER", "LOUD", "HUMANOID", "CONSTRUCT"] },
        { word: "hovers", tags: ["INTRANS", "MOVE", "FLY", "GHOST", "SPIRIT", "CONSTRUCT"] },
        { word: "sneers", tags: ["INTRANS", "DIALOGUE", "MEAN", "HUMANOID"] },
        { word: "shrugs", tags: ["INTRANS", "DIALOGUE", "CASUAL", "HUMANOID"] },
        { word: "coughs", tags: ["INTRANS", "BODY", "SICK", "HUMANOID"] },
        { word: "trembles", tags: ["INTRANS", "BODY", "FEAR", "HUMANOID"] },
        { word: "howls", tags: ["INTRANS", "SOUND", "LOUD", "BEAST"] },
        { word: "moans", tags: ["INTRANS", "SOUND", "SAD", "UNDEAD", "SPIRIT"] },
        { word: "paces", tags: ["INTRANS", "MOVE", "NERVOUS", "HUMANOID"] },

        // TRANSITIVE (Takes an object) - "It [VERB] you"
        { word: "scrutinizes", tags: ["TRANS", "LOOK", "INTENSE", "HUMANOID"] },
        { word: "glances at", tags: ["TRANS", "LOOK", "FAST", "HUMANOID"] },
        { word: "stares down", tags: ["TRANS", "LOOK", "SCARY", "HUMANOID", "BEAST"] },
        { word: "obliterates", tags: ["TRANS", "ATTACK", "STRONG", "CONSTRUCT", "BEAST"] },
        { word: "nicks", tags: ["TRANS", "ATTACK", "WEAK", "HUMANOID"] },
        { word: "beckons", tags: ["TRANS", "DIALOGUE", "GESTURE", "HUMANOID", "SPIRIT"] },
        { word: "points at", tags: ["TRANS", "DIALOGUE", "GESTURE", "HUMANOID"] },
        { word: "ignores", tags: ["TRANS", "DIALOGUE", "MEAN", "HUMANOID"] },
        { word: "inspects", tags: ["TRANS", "LOOK", "CLOSE", "HUMANOID", "CONSTRUCT"] },
        { word: "snarls at", tags: ["TRANS", "SOUND", "AGGRESSIVE", "BEAST"] },
        { word: "haggles with", tags: ["TRANS", "DIALOGUE", "TRADE", "HUMANOID"] }
    ]
};
