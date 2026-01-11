import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { GameTurnData, Language, UserProfile } from "../types";
import { SYSTEM_PROMPTS } from "../data/systemPrompts";

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

  constructor(profile: UserProfile, apiKey: string) {
    this.profile = profile;
    this.ai = new GoogleGenAI({ apiKey });
  }

  async initGame(): Promise<GameTurnData> {
    const systemInstruction = SYSTEM_PROMPTS.GEMINI(
        this.profile.targetLanguage,
        this.profile.nativeLanguage,
        this.profile.theme
    );

    this.chatSession = this.ai.chats.create({
      model: 'gemini-2.5-flash',
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

  async processTurn(playerInput: string): Promise<GameTurnData> {
    if (!this.chatSession) throw new Error("Game not initialized");
    const response = await this.chatSession.sendMessage({ message: playerInput });
    return JSON.parse(response.text) as GameTurnData;
  }

  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName }
                    }
                }
            }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    } catch (e) {
        console.error("Speech generation failed", e);
        return '';
    }
  }
}
