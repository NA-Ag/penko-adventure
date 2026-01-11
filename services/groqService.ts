/**
 * Groq Cloud API Service
 * Ultra-fast inference with Llama 3.1
 * Free Tier: 14,400 requests/day (vs Gemini's 20/day!)
 * Speed: 500+ tokens/second
 */

import { GameTurnData, Language, UserProfile } from "../types";
import { SYSTEM_PROMPTS } from "../data/systemPrompts";

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' };
}

interface GroqChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqEngine {
  private apiKey: string;
  private profile: UserProfile;
  private conversationHistory: GroqMessage[] = [];
  private baseUrl = 'https://api.groq.com/openai/v1';

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
    const requestBody: GroqChatRequest = {
      model: 'llama-3.1-70b-versatile', // Best free model
      messages: this.conversationHistory,
      temperature: 0.7,
      response_format: { type: 'json_object' }, // Force JSON output
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
      throw new Error(`Groq API Error: ${response.status} - ${error}`);
    }

    const data: GroqChatResponse = await response.json();
    return data.choices[0].message.content;
  }

  // TTS not supported by Groq - return empty string
  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
    console.warn('[Groq] TTS not supported - use browser TTS instead');
    return '';
  }
}
