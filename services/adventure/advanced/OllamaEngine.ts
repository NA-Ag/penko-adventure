import { GameTurnData, UserProfile, Language } from '../../../types';
import { DEBUG } from '../../../config';

export class OllamaEngine {
    private profile: UserProfile;
    private baseUrl: string = 'http://localhost:11434';
    private model: string;
    private historyContext: string[] = [];

    // The Game Console Warm-Up state
    private isModelWarm: boolean = false;

    constructor(profile: UserProfile, model: string = 'qwen3:0.6b') {
        this.profile = profile;
        this.model = model;
    }

    /**
     * The "Game Console" Boot Sequence
     * 1. Check if Ollama is running.
     * 2. Pull the model if missing.
     * 3. Send a silent "warm-up" prompt to load the massive model into VRAM.
     */
    async initialize(onProgress?: (progress: number, text: string) => void): Promise<void> {
        try {
            onProgress?.(10, 'Connecting to Native PC Engine...');
            const tags = await fetch(`${this.baseUrl}/api/tags`);
            if (!tags.ok) throw new Error('Native engine not responding.');

            const data = await tags.json();
            const models = data.models || [];
            const hasModel = models.some((m: any) => m.name.includes(this.model) || m.name.startsWith(this.model.split(':')[0]));

            if (!hasModel) {
                onProgress?.(30, `Downloading ${this.model} to Native Engine (This may take a while)...`);
                await this.pullModel(onProgress);
            }

            onProgress?.(90, 'Warming up AI Engine (Loading into VRAM)...');
            await this.warmUpModel();
            
            this.isModelWarm = true;
            onProgress?.(100, 'Native PC Engine Ready!');
            
        } catch (error: any) {
            console.error('[OllamaEngine] Initialization failed:', error);
            throw new Error(`Native PC Engine Error: ${error.message}. Is Ollama running?`);
        }
    }

    private async pullModel(onProgress?: (progress: number, text: string) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            fetch(`${this.baseUrl}/api/pull`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: this.model })
            }).then(async response => {
                if (!response.body) throw new Error("No response body");
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunks = decoder.decode(value).split('\\n').filter(Boolean);
                    for (const chunk of chunks) {
                        try {
                            const data = JSON.parse(chunk);
                            if (data.status) {
                                // Calculate percentage if total bytes are provided
                                let percent = 50;
                                if (data.total && data.completed) {
                                    percent = 30 + Math.round((data.completed / data.total) * 60);
                                }
                                onProgress?.(percent, `Downloading: ${data.status}`);
                            }
                        } catch (e) {
                            // Ignore partial chunks
                        }
                    }
                }
                resolve();
            }).catch(reject);
        });
    }

    private async warmUpModel(): Promise<void> {
        // Send a tiny prompt just to force Ollama to load the model from Disk to VRAM
        await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt: "System check. Reply 'ok'.",
                stream: false,
                options: { num_predict: 2 } // Only generate 2 tokens
            })
        });
    }

    private buildSystemPrompt(): string {
        return `You are a strict text adventure game master. 
CRITICAL RULE: You MUST write your ENTIRE response in ${this.profile.targetLanguage}. 
NO ENGLISH ALLOWED in the narrative.
Genre: ${this.profile.theme}.

You must return ONLY a raw JSON object. Use this exact format:
{
  "narrative": "(Write the story response here in ${this.profile.targetLanguage})",
  "biome": "(forest, cave, town, desert, dungeon, interior, graveyard, cyber_city, or canyon)",
  "features": ["(item1)", "(item2)"],
  "entities": ["(character1)"],
  "time": "(day, night, sunset, or foggy)",
  "options": []
}`;
    }

    async initGame(onProgress?: (p: number, t: string) => void, onStream?: (chunk: string, text: string) => void): Promise<GameTurnData> {
        if (!this.isModelWarm) {
            await this.initialize();
        }

        this.historyContext = [];
        const startPrompt = `Start a new ${this.profile.theme} adventure. Describe the opening scene.`;

        return this.processTurn(startPrompt, undefined, undefined, true, onStream);
    }

    async processTurn(playerInput: string, context?: any, skipInputCheck?: boolean, isStart = false, onStream?: (chunk: string, text: string) => void): Promise<GameTurnData> {
        if (!this.isModelWarm) throw new Error("Engine not initialized");

        if (!isStart) {
            this.historyContext.push(`Player: ${playerInput}`);
        }

        const messages = [
            { role: "system", content: this.buildSystemPrompt() },
            ...this.historyContext.map(msg => ({
                role: msg.startsWith("Player:") ? "user" : "assistant",
                content: msg.replace(/^(Player|AI):\\s*/, "")
            })),
            ...(isStart ? [{ role: "user", content: playerInput }] : [])
        ];

        try {
            if (DEBUG.OLLAMA) console.log("[OllamaEngine] Sending request:", messages);

            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: false, // We will upgrade this to streaming later!
                    format: "json", // Ollama 0.1.30+ supports native JSON mode!
                    options: {
                        temperature: 0.7,
                        num_predict: 500
                    }
                })
            });

            if (!response.ok) throw new Error(`Ollama HTTP Error: ${response.status}`);

            const data = await response.json();
            const content = data.message?.content || "{}";
            
            // Push AI response to history
            this.historyContext.push(`AI: ${content}`);

            return this.parseResponse(content);

        } catch (error: any) {
            console.error("[OllamaEngine] Generation failed:", error);
            throw error;
        }
    }

    private parseResponse(jsonString: string): GameTurnData {
        try {
            const data = JSON.parse(jsonString);
            return {
                narrative: data.narrative || "The system is quiet...",
                nativeTranslation: "Translation pending...", // Agent 2 placeholder
                sceneData: {
                    biome: data.biome || "forest",
                    features: Array.isArray(data.features) ? data.features : [],
                    entities: Array.isArray(data.entities) ? data.entities : [],
                    timeOfDay: data.time || "day"
                },
                playerOptions: Array.isArray(data.options) ? data.options : [],
                inventory: [],
                health: 100,
                locationName: (data.biome || "Unknown").toUpperCase(),
                feedback: ""
            };
        } catch (e) {
            console.warn("[OllamaEngine] Failed to parse JSON:", jsonString);
            return {
                narrative: jsonString,
                nativeTranslation: "Parse error",
                sceneData: { biome: "dungeon", features: [], entities: [], timeOfDay: "night" },
                playerOptions: [],
                inventory: [],
                health: 100,
                locationName: "ERROR",
                feedback: ""
            };
        }
    }
}