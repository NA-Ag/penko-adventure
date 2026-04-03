// Re-export ObjectIntent from ObjectSystem for convenience
export type { ObjectIntent } from './types/game.types';

export enum Language {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  ITALIAN = 'Italian',
  JAPANESE = 'Japanese',
  MANDARIN = 'Mandarin',
  RUSSIAN = 'Russian',
  PORTUGUESE = 'Portuguese',
  UKRAINIAN = 'Ukrainian',
  POLISH = 'Polish',
  CZECH = 'Czech',
  ROMANIAN = 'Romanian',
  CATALAN = 'Catalan',
  HAITIAN_CREOLE = 'Haitian Creole',
  LATIN = 'Latin',
  DUTCH = 'Dutch',
  SWEDISH = 'Swedish',
  NORWEGIAN = 'Norwegian',
  DANISH = 'Danish',
  YIDDISH = 'Yiddish',
  AFRIKAANS = 'Afrikaans',
  ICELANDIC = 'Icelandic',
  SLOVAK = 'Slovak',
  BULGARIAN = 'Bulgarian',
  CROATIAN = 'Croatian',
  SERBIAN = 'Serbian',
  MACEDONIAN = 'Macedonian',
  SLOVENIAN = 'Slovenian',
  HINDI = 'Hindi',
  BENGALI = 'Bengali',
  PUNJABI = 'Punjabi',
  URDU = 'Urdu',
  MARATHI = 'Marathi',
  GUJARATI = 'Gujarati',
  SINDHI = 'Sindhi',
  SINHALA = 'Sinhala',
  ORIYA = 'Oriya',
  NEPALI = 'Nepali',
  CANTONESE = 'Cantonese',
  WU_CHINESE = 'Wu Chinese',
  VIETNAMESE = 'Vietnamese',
  THAI = 'Thai',
  BURMESE = 'Burmese',
  KHMER = 'Khmer',
  LAO = 'Lao',
  TIBETAN = 'Tibetan',
  INDONESIAN = 'Indonesian',
  JAVANESE = 'Javanese',
  TAGALOG = 'Tagalog',
  MALAY = 'Malay',
  HAWAIIAN = 'Hawaiian',
  MALAGASY = 'Malagasy',
  MAORI = 'Maori',
  SUNDANESE = 'Sundanese',
  TELUGU = 'Telugu',
  TAMIL = 'Tamil',
  KANNADA = 'Kannada',
  MALAYALAM = 'Malayalam',
  ARABIC = 'Arabic',
  HEBREW = 'Hebrew',
  AMHARIC = 'Amharic',
  MALTESE = 'Maltese',
  TURKISH = 'Turkish',
  AZERBAIJANI = 'Azerbaijani',
  UZBEK = 'Uzbek',
  KAZAKH = 'Kazakh',
  KYRGYZ = 'Kyrgyz',
  TAJIK = 'Tajik',
  SWAHILI = 'Swahili',
  ZULU = 'Zulu',
  YORUBA = 'Yoruba',
  IGBO = 'Igbo',
  FULA = 'Fula',
  GANDA = 'Ganda',
  SHONA = 'Shona',
  SOTHO = 'Sotho',
  CHICHEWA = 'Chichewa',
  KINYARWANDA = 'Kinyarwanda',
  FINNISH = 'Finnish',
  HUNGARIAN = 'Hungarian',
  ESTONIAN = 'Estonian',
  HAUSA = 'Hausa',
  OROMO = 'Oromo',
  SOMALI = 'Somali',
  IRISH = 'Irish',
  WELSH = 'Welsh',
  SCOTTISH_GAELIC = 'Scottish Gaelic',
  GREEK = 'Greek',
  PERSIAN = 'Persian',
  ARMENIAN = 'Armenian',
  PASHTO = 'Pashto',
  KURDISH = 'Kurdish',
  NAVAJO = 'Navajo',
  GEORGIAN = 'Georgian',
  MONGOLIAN = 'Mongolian',
  ALBANIAN = 'Albanian',
  BASQUE = 'Basque',
  GALICIAN = 'Galician',
  LITHUANIAN = 'Lithuanian',
  LATVIAN = 'Latvian',
  LUXEMBOURGISH = 'Luxembourgish'
}

export enum Difficulty {
  DYNAMIC = 'Dynamic Adaptation'
}

// Active game modes
// - offline: Community-driven JSON scenarios (no AI, runs anywhere)
// - cloud: 6 cloud AI providers (requires API key, internet)
// - local: Browser AI with cartridges (ONNX models, WebGPU)
// - facade: Interactive drama system (Facade-style narrative engine)
export type GameMode = 'ollama' | 'cloud' | 'local' | 'facade';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'HSK 1' | 'HSK 2' | 'HSK 3' | 'HSK 4' | 'HSK 5' | 'HSK 6';

// Content Pack types
export type Biome = 'forest' | 'cave' | 'town' | 'desert' | 'dungeon' | 'interior' | 'graveyard' | 'cyber_city' | 'canyon' | 'ocean' | 'beach';
export type TimeOfDay = 'day' | 'night' | 'sunset' | 'foggy';
export type NarrativeGenre = 'fantasy' | 'scifi' | 'mystery' | 'horror' | 'western' | 'cyberpunk' | 'time_travel' | 'post_apocalyptic' | 'pirate' | 'spy' | 'slice_of_life' | 'survival' | 'superhero' | 'fairy_tale' | 'steampunk' | 'school';

export interface UserProfile {
  targetLanguage: Language;
  nativeLanguage: Language;
  theme: NarrativeGenre;
  learningPath?: 'adventure' | 'educational';
  cefrLevel?: CEFRLevel;  // Dynamic CEFR level (defaults to A2, adapts based on performance)
  ollamaModel?: string;
  openaiBaseUrl?: string;
  openaiModel?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface SceneData {
  biome: Biome;
  features: string[];
  entities: string[];
  timeOfDay: TimeOfDay;
}

// TIER 18: Simplified to pure gameplay - pedagogy fields are optional
export interface GameTurnData {
  narrative: string;               // Game response in target language
  sceneData: SceneData;
  playerOptions?: string[];
  inventory: InventoryItem[];
  health: number;
  locationName: string;

  // Optional pedagogy fields (Community Mode provides these)
  userInput?: string;               // The raw user input that triggered this turn
  feedback?: string;                // Grammar feedback
  simplifiedNarrative?: string;     // A1-level simplified version
  nativeTranslation?: string;       // Translation to native language
  romanization?: string;            // Phonetic transcription for non-Latin scripts
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  meta?: GameTurnData;
  timestamp: number;
  audioUrl?: string;
}

export interface GameState {
  history: ChatMessage[];
  currentInventory: InventoryItem[];
  health: number;
  location: string;
  isLoading: boolean;
}

export interface AppConfig {
    proxyUrl: string;
}

// ========== COMMUNITY ADVENTURE TYPES ==========

export interface CommunityAdventure {
  id: string;
  title: Record<Language, string>;
  author: string;
  version: string;
  description: Record<Language, string>;
  rooms: CommunityRoom[];
  items: CommunityItem[];
  npcs: CommunityNPC[];
  startRoomId: string;
  createdAt: number;
  updatedAt: number;
  downloads?: number;
  rating?: number;
  tags?: string[];
}

export interface CommunityRoom {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  exits: Exit[];
  items: string[]; // item IDs present in this room
  npcs: string[]; // NPC IDs present in this room
  features: string[]; // Visual features (from grammar database)
  ambiance?: string; // Audio/visual ambiance key
  visited: boolean;
}

export interface Exit {
  direction: string; // "north", "south", "east", "west", "up", "down"
  targetRoomId: string;
  locked?: boolean;
  requiredItem?: string; // item ID required to unlock
  lockDescription?: Record<Language, string>; // Description when locked
}

export interface CommunityItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
  usable: boolean;
  combinable?: string[]; // Other item IDs this can combine with
  takeable: boolean;
  useWith?: Record<string, string>; // Map of target item ID to result item ID
  useDescription?: Record<Language, string>; // What happens when used
}

export interface CommunityNPC {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  dialogue: NPCDialogue[];
  givesItem?: string; // item ID given when talked to (optional)
  requiresItem?: string; // item ID required to trigger dialogue
  defaultDialogue: Record<Language, string>; // Shown when no matching dialogue
}

export interface NPCDialogue {
  id: string;
  trigger: 'greeting' | 'item_given' | 'quest_complete' | 'custom';
  triggerItem?: string; // item ID that triggers this dialogue
  lines: Record<Language, string[]>; // Array of dialogue lines
  responseOptions?: DialogueResponse[]; // Player response options
  givesItem?: string; // item ID given after this dialogue
  completesQuest?: string; // quest ID completed
}

export interface DialogueResponse {
  text: Record<Language, string>;
  nextDialogueId?: string; // ID of next dialogue node
  requiresItem?: string; // item ID required to show this option
  givesItem?: string; // item ID given when chosen
  endsConversation?: boolean;
}

// ========== WORKSHOP TYPES ==========

export interface WorkshopProject {
  id: string;
  name: string;
  description: string;
  targetLanguage: Language;
  adventure: CommunityAdventure;
  lastModified: number;
}

// ========== PARSER TYPES ==========

export interface ParseResult {
  intent: string;
  confidence: number;
  feedback?: string;
  correction?: { original: string; corrected: string };
  targetItemId?: string;
  targetNpcId?: string;
  preposition?: string;
}
