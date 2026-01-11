/**
 * Together AI Service
 * High-performance open-source models
 * $25 free credits for new users
 * Website: https://together.ai
 */

import { GameTurnData, Language, UserProfile } from "../types";
import { SYSTEM_PROMPTS } from "../data/systemPrompts";

interface TogetherMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface TogetherChatRequest {
  model: string;
  messages: TogetherMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' };
}

interface TogetherChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class TogetherEngine {
  private apiKey: string;
  private profile: UserProfile;
  private conversationHistory: TogetherMessage[] = [];
  private baseUrl = 'https://api.together.xyz/v1';

  constructor(profile: UserProfile, apiKey: string) {
    this.profile = profile;
    this.apiKey = apiKey;
  }

  async initGame(): Promise<GameTurnData> {
    const systemInstruction = SYSTEM_PROMPTS.GEMINI(
      this.profile.targetLanguage,
      this.profile.nativeLanguage,
      this.profile.theme
    );

    // Initialize conversation with system prompt
    this.conversationHistory = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: 'Initialize game state.' },
    ];

    const response = await this.sendRequest();
    return JSON.parse(response) as GameTurnData;
  }

  async processTurn(playerInput: string): Promise<GameTurnData> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: playerInput,
    });

    const response = await this.sendRequest();

    // Add assistant response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
    });

    return JSON.parse(response) as GameTurnData;
  }

  private async sendRequest(): Promise<string> {
    const requestBody: TogetherChatRequest = {
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', // Fast and capable
      messages: this.conversationHistory,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Together AI API Error: ${response.status} - ${error}`);
    }

    const data: TogetherChatResponse = await response.json();
    return data.choices[0].message.content;
  }

  // TTS not supported by Together AI - return empty string
  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
    console.warn('[Together AI] TTS not supported - use browser TTS instead');
    return '';
  }
}
