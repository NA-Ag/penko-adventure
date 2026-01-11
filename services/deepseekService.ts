/**
 * DeepSeek API Service
 * Chinese AI company's open-source V3 model
 * Supports 100+ languages including all of Penko's 12 languages
 * Website: https://www.deepseek.com
 */

import { GameTurnData, Language, UserProfile } from "../types";
import { SYSTEM_PROMPTS } from "../data/systemPrompts";

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekChatRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' };
}

interface DeepSeekChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekEngine {
  private apiKey: string;
  private profile: UserProfile;
  private conversationHistory: DeepSeekMessage[] = [];
  private baseUrl = 'https://api.deepseek.com/v1';

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
    const requestBody: DeepSeekChatRequest = {
      model: 'deepseek-chat', // V3 model with 100+ language support
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
      throw new Error(`DeepSeek API Error: ${response.status} - ${error}`);
    }

    const data: DeepSeekChatResponse = await response.json();
    return data.choices[0].message.content;
  }

  // TTS not supported by DeepSeek - return empty string
  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
    console.warn('[DeepSeek] TTS not supported - use browser TTS instead');
    return '';
  }
}
