/**
 * OpenRouter API Service
 * Multi-model aggregator with free options
 * Free models: Google Gemini Flash, Meta Llama, and more
 * Website: https://openrouter.ai
 */

import { GameTurnData, Language, UserProfile } from "../types";
import { SYSTEM_PROMPTS } from "../data/systemPrompts";

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterChatRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' };
}

interface OpenRouterChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterEngine {
  private apiKey: string;
  private profile: UserProfile;
  private conversationHistory: OpenRouterMessage[] = [];
  private baseUrl = 'https://openrouter.ai/api/v1';

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
    const requestBody: OpenRouterChatRequest = {
      model: 'google/gemini-flash-1.5', // Free Gemini Flash via OpenRouter!
      messages: this.conversationHistory,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://penko.app', // Optional: For rankings
        'X-Title': 'Penko Language Adventure', // Optional: Show in rankings
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} - ${error}`);
    }

    const data: OpenRouterChatResponse = await response.json();
    return data.choices[0].message.content;
  }

  // TTS not supported by OpenRouter - return empty string
  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
    console.warn('[OpenRouter] TTS not supported - use browser TTS instead');
    return '';
  }
}
