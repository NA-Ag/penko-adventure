/**
 * Scene Parser - Extract visual scene data from narrative text
 * No AI dependency - uses keyword matching like classic text adventures (Zork, etc.)
 */

export interface ParsedScene {
  biome: string;
  features: string[];
  entities: string[];
  timeOfDay: 'day' | 'night' | 'sunset' | 'foggy';
  penkoAction: 'idle' | 'walk' | 'jump' | 'hurt' | 'talk';
}

// Keyword → Biome mapping
const BIOME_KEYWORDS: Record<string, string> = {
  // Nature
  'forest': 'forest',
  'woods': 'forest',
  'tree': 'forest',
  'jungle': 'forest',

  'desert': 'desert',
  'sand': 'desert',
  'dune': 'desert',
  'oasis': 'desert',

  'cave': 'cave',
  'cavern': 'cave',
  'underground': 'cave',

  'canyon': 'canyon',
  'cliff': 'canyon',
  'gorge': 'canyon',

  // Urban/Indoor
  'town': 'town',
  'village': 'town',
  'city': 'town',
  'street': 'town',

  'house': 'interior',
  'room': 'interior',
  'building': 'interior',
  'inside': 'interior',
  'indoor': 'interior',

  'cyber': 'cyber_city',
  'neon': 'cyber_city',
  'futuristic': 'cyber_city',
  'robot': 'cyber_city',

  // Dark/Spooky
  'dungeon': 'dungeon',
  'prison': 'dungeon',
  'cell': 'dungeon',

  'graveyard': 'graveyard',
  'cemetery': 'graveyard',
  'grave': 'graveyard',
  'tomb': 'graveyard',
};

// Keyword → Feature mapping
const FEATURE_KEYWORDS: Record<string, string> = {
  // Nature
  'tree': 'tree',
  'oak': 'tree',
  'pine': 'tree',
  'bush': 'grass',
  'grass': 'grass',
  'flower': 'grass',
  'rock': 'rock',
  'stone': 'rock',
  'boulder': 'rock',

  // Desert
  'cactus': 'cactus',
  'sand': 'sand',

  // Urban
  'door': 'door',
  'gate': 'door',
  'entrance': 'door',
  'table': 'table',
  'chair': 'table',
  'furniture': 'table',
  'sign': 'neon_sign',
  'billboard': 'neon_sign',

  // Interactive
  'chest': 'chest',
  'box': 'chest',
  'crate': 'chest',
  'fire': 'campfire',
  'campfire': 'campfire',
  'flame': 'campfire',

  // Tech
  'terminal': 'terminal',
  'computer': 'terminal',
  'screen': 'terminal',
  'hologram': 'hologram',
  'projection': 'hologram',

  // Spooky
  'fog': 'fog',
  'mist': 'fog',
  'grave': 'grave',
  'tombstone': 'grave',
};

// Keyword → Entity mapping
const ENTITY_KEYWORDS: Record<string, string> = {
  'merchant': 'merchant',
  'trader': 'merchant',
  'shopkeeper': 'merchant',

  'guard': 'guard',
  'soldier': 'guard',
  'knight': 'guard',

  'wolf': 'wolf',
  'dog': 'wolf',

  'zombie': 'zombie',
  'undead': 'zombie',

  'robot': 'robot',
  'android': 'robot',
  'droid': 'robot',

  'cowboy': 'cowboy',
  'sheriff': 'cowboy',
};

// Time of day keywords
const TIME_KEYWORDS: Record<string, 'day' | 'night' | 'sunset' | 'foggy'> = {
  'night': 'night',
  'dark': 'night',
  'evening': 'night',
  'midnight': 'night',

  'sunset': 'sunset',
  'dusk': 'sunset',
  'dawn': 'sunset',

  'fog': 'foggy',
  'foggy': 'foggy',
  'misty': 'foggy',

  'day': 'day',
  'morning': 'day',
  'noon': 'day',
  'bright': 'day',
};

// Action keywords for Penko animations
const ACTION_KEYWORDS: Record<string, 'idle' | 'walk' | 'jump' | 'hurt' | 'talk'> = {
  // Movement
  'walk': 'walk',
  'move': 'walk',
  'go': 'walk',
  'travel': 'walk',
  'run': 'walk',
  'enter': 'walk',
  'leave': 'walk',

  'jump': 'jump',
  'leap': 'jump',
  'hop': 'jump',

  // Interaction
  'talk': 'talk',
  'speak': 'talk',
  'say': 'talk',
  'tell': 'talk',
  'ask': 'talk',

  // Combat/Damage
  'hurt': 'hurt',
  'damage': 'hurt',
  'hit': 'hurt',
  'attack': 'hurt',
  'wound': 'hurt',
};

/**
 * Parse narrative text to extract scene information
 */
export function parseScene(text: string, previousScene?: ParsedScene): ParsedScene {
  const lowerText = text.toLowerCase();

  // Extract biome (use previous if not found)
  let biome = previousScene?.biome || 'forest';
  for (const [keyword, biomeName] of Object.entries(BIOME_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      biome = biomeName;
      break;
    }
  }

  // Extract features (max 5)
  const features: string[] = [];
  for (const [keyword, featureName] of Object.entries(FEATURE_KEYWORDS)) {
    if (lowerText.includes(keyword) && !features.includes(featureName)) {
      features.push(featureName);
      if (features.length >= 5) break;
    }
  }

  // Extract entities (max 3)
  const entities: string[] = [];
  for (const [keyword, entityName] of Object.entries(ENTITY_KEYWORDS)) {
    if (lowerText.includes(keyword) && !entities.includes(entityName)) {
      entities.push(entityName);
      if (entities.length >= 3) break;
    }
  }

  // Extract time of day (use previous if not found)
  let timeOfDay: 'day' | 'night' | 'sunset' | 'foggy' = previousScene?.timeOfDay || 'day';
  for (const [keyword, time] of Object.entries(TIME_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      timeOfDay = time;
      break;
    }
  }

  // Extract Penko action
  let penkoAction: 'idle' | 'walk' | 'jump' | 'hurt' | 'talk' = 'idle';
  for (const [keyword, action] of Object.entries(ACTION_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      penkoAction = action;
      break; // Use first match
    }
  }

  return {
    biome,
    features,
    entities,
    timeOfDay,
    penkoAction,
  };
}

/**
 * Parse player input to detect action
 */
export function parsePlayerAction(input: string): 'idle' | 'walk' | 'jump' | 'hurt' | 'talk' {
  const lowerInput = input.toLowerCase();

  for (const [keyword, action] of Object.entries(ACTION_KEYWORDS)) {
    if (lowerInput.includes(keyword)) {
      return action;
    }
  }

  return 'idle';
}
