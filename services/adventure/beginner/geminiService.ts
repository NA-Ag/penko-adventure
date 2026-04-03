import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { GameTurnData, Language, UserProfile } from '../../../types';
import { SYSTEM_PROMPTS } from '../../../data/adventure/beginner/systemPrompts';
import { Scenario } from '../../../data/educational/frameworks/types';
import { getEducationalPromptSet } from '../../../data/educational';

// --- Type Definitions for Schema ---

const InventoryItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    icon: { type: Type.STRING },
  },
  required: ["id", "name", "description", "icon"],
};

const SceneDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    biome: {
      type: Type.STRING,
      enum: ['forest', 'cave', 'town', 'desert', 'dungeon', 'interior', 'graveyard', 'cyber_city', 'canyon'],
      description: "The general environment type matching the genre."
    },
    features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Static environmental objects (e.g., ['tree', 'rock', 'grave', 'cactus', 'neon_sign']). Max 5."
    },
    entities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Active characters or items (e.g., ['merchant', 'chest', 'zombie', 'cowboy']). Max 3."
    },
    timeOfDay: {
      type: Type.STRING,
      enum: ['day', 'night', 'sunset', 'foggy']
    }
  },
  required: ["biome", "features", "entities", "timeOfDay"]
};

const GameResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "The main story text in the target language."
    },
    simplifiedNarrative: {
      type: Type.STRING,
      description: "A simpler version if the narrative is complex."
    },
    nativeTranslation: {
      type: Type.STRING,
      description: "Translation of the narrative into the user's native language."
    },
    romanization: {
      type: Type.STRING,
      description: "Phonetic sounds (e.g. Pinyin, Romaji) if the target language uses non-Latin script."
    },
    sceneData: SceneDataSchema,
    playerOptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 suggested actions in the target language."
    },
    inventory: {
      type: Type.ARRAY,
      items: InventoryItemSchema,
    },
    health: { type: Type.INTEGER },
    locationName: { type: Type.STRING },
    feedback: {
      type: Type.STRING,
      description: "Constructive feedback on grammar/vocabulary in the user's native language."
    },
  },
  required: ["narrative", "sceneData", "health", "locationName", "inventory"],
};

// --- Core Logic ---

export class GameEngine {
  private chatSession: Chat | null = null;
  private profile: UserProfile;
  private ai: GoogleGenAI;
  private model: string;
  private educationalScenario: Scenario | null;

  constructor(profile: UserProfile, apiKey: string, model: string = 'gemini-2.5-pro', educationalScenario: Scenario | null = null) {
    this.profile = profile;
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
    this.educationalScenario = educationalScenario;
  }

  async initGame(): Promise<GameTurnData> {
    let systemInstruction = SYSTEM_PROMPTS.GEMINI(
        this.profile.targetLanguage,
        this.profile.nativeLanguage,
        this.profile.theme
    );

    // If educational mode is active, override the system prompt with the scenario
    if (this.educationalScenario) {
        const promptSet = getEducationalPromptSet(this.profile.targetLanguage, this.profile.cefrLevel || 'A1') as any;
        const localScenario = promptSet.LOCALIZED_SCENARIOS?.[this.educationalScenario.id] || this.educationalScenario;
        
        systemInstruction = `You are an AI Language Tutor for ${this.profile.targetLanguage} at CEFR Level ${this.profile.cefrLevel || 'A1'}.
Role: ${localScenario.role || localScenario.systemPrompt}
Scenario: ${localScenario.title}
Objectives: ${(localScenario.objectives || []).join(', ')}

CRITICAL RULES:
1. You MUST output ONLY valid JSON matching the exact schema provided.
2. The 'narrative' field MUST be in ${this.profile.targetLanguage}. NO ENGLISH.
3. Keep the 'narrative' to exactly 1 short sentence, appropriate for ${this.profile.cefrLevel || 'A1'} beginners.
4. Advance the scenario based on the user's action.`;
    }

    this.chatSession = this.ai.chats.create({
      model: this.model,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: GameResponseSchema,
        temperature: 0.7,
      },
    });

    const response = await this.chatSession.sendMessage({ message: "Initialize game state." });
    return JSON.parse(response.text) as GameTurnData;
  }

  async processTurn(playerInput: string, context?: any, skipInputCheck?: boolean, isStart?: boolean, onStream?: (chunk: string, text: string) => void): Promise<GameTurnData> {
    if (!this.chatSession) throw new Error("Game not initialized");
    const response = await this.chatSession.sendMessage({ message: playerInput });
    return JSON.parse(response.text) as GameTurnData;
  }

  async requestRomanization(targetText: string): Promise<string> {
    if (!this.ai) return "";
    const response = await this.ai.models.generateContent({
        model: this.model,
        contents: `Provide ONLY the phonetic romanization (e.g. Romaji, Pinyin) for the following text, no explanations: ${targetText}`,
    });
    return response.text || "";
  }
}
