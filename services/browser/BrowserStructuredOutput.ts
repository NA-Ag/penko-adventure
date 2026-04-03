/**
 * Structured Output System for Browser AI
 *
 * Idea #3: Force Browser AI to generate JSON schema, not free-text
 * - Constrained generation = 3-5x faster inference
 * - Smaller output token space = faster decoding
 * - Similar to Community Mode's structured object system
 */

import { GameTurnData, Language } from '../../types';

export interface StructuredPromptTemplate {
    systemPrompt: string;
    schema: any;
    exampleOutput: string;
}

export class BrowserStructuredOutput {
    /**
     * Build highly constrained prompt that forces JSON output
     * This drastically reduces generation time
     */
    static buildConstrainedPrompt(
        input: string,
        context: any,
        language: Language,
        vocabularyHint?: string
    ): string {
        const template = this.getTemplateForLanguage(language);

        // Build ultra-constrained prompt
        let prompt = template.systemPrompt;

        // Add vocabulary constraint if provided (from BrowserVocabularyManager)
        if (vocabularyHint) {
            prompt += `\n\nUSE ONLY THESE WORDS: ${vocabularyHint}`;
        }

        // Add strict format enforcement
        prompt += `\n\nOUTPUT FORMAT (STRICT):
{
  "narrative": "ONE sentence only, max 20 words",
  "biome": "one of: forest, town, cave, desert, mountain, ocean, ruins, swamp",
  "features": ["max 3 items"],
  "entities": ["max 2 items"],
  "timeOfDay": "one of: day, night, sunset, foggy",
  "options": ["exactly 3 choices"]
}`;

        // Add context
        if (context.locationName) {
            prompt += `\nLocation: ${context.locationName}`;
        }

        if (context.sceneData) {
            prompt += `\nCurrent: ${context.sceneData.biome}, ${context.sceneData.timeOfDay}`;
        }

        // Add player action
        prompt += `\n\nPlayer action: ${input}`;
        prompt += `\n\nGenerate ONLY valid JSON, nothing else:`;

        return prompt;
    }

    /**
     * Parse AI response with strict validation
     * Falls back to minimal valid response if parsing fails
     */
    static parseResponse(
        rawOutput: string,
        context: any,
        fallbackNarrative: string = "You continue your journey."
    ): GameTurnData {
        try {
            // Extract JSON from response (handle cases where AI adds text)
            const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Validate and construct GameTurnData
            return {
                narrative: parsed.narrative || fallbackNarrative,
                simplifiedNarrative: this.simplifyNarrative(parsed.narrative || fallbackNarrative),
                sceneData: {
                    biome: parsed.biome || context.sceneData?.biome || 'forest',
                    features: (parsed.features || []).slice(0, 3),
                    entities: (parsed.entities || []).slice(0, 2),
                    timeOfDay: parsed.timeOfDay || context.sceneData?.timeOfDay || 'day'
                },
                playerOptions: (parsed.options || ['Continue', 'Look around', 'Rest']).slice(0, 3),
                inventory: context.inventory || [],
                health: context.health || 100,
                locationName: context.locationName || 'Unknown'
            };

        } catch (error) {
            console.error('[BrowserStructuredOutput] Parse error, using fallback:', error);

            // Return minimal valid response
            return {
                narrative: fallbackNarrative,
                sceneData: {
                    biome: context.sceneData?.biome || 'forest',
                    features: context.sceneData?.features || [],
                    entities: context.sceneData?.entities || [],
                    timeOfDay: context.sceneData?.timeOfDay || 'day'
                },
                playerOptions: ['Continue', 'Look around', 'Rest'],
                inventory: context.inventory || [],
                health: context.health || 100,
                locationName: context.locationName || 'Unknown'
            };
        }
    }

    /**
     * Simplify narrative for A1 learners
     * Max 10 words, simple vocabulary
     */
    private static simplifyNarrative(narrative: string): string {
        const words = narrative.split(' ');
        if (words.length <= 10) return narrative;

        // Truncate to 10 words
        return words.slice(0, 10).join(' ') + '...';
    }

    /**
     * Get language-specific template
     * Each template is hyper-optimized for fast generation
     */
    private static getTemplateForLanguage(language: Language): StructuredPromptTemplate {
        const templates: Partial<Record<Language, StructuredPromptTemplate>> = {
            [Language.ENGLISH]: {
                systemPrompt: `You are a game narrator. Generate SHORT JSON responses.
Rules:
- narrative: ONE sentence, max 20 words
- biome: forest, town, cave, desert, mountain, ocean, ruins, or swamp
- features: max 3 objects
- entities: max 2 characters
- timeOfDay: day, night, sunset, or foggy
- options: exactly 3 player actions`,
                schema: {},
                exampleOutput: `{"narrative":"You enter a dark forest.","biome":"forest","features":["tree","path"],"entities":["wolf"],"timeOfDay":"night","options":["Go north","Hide","Run"]}`
            },

            [Language.SPANISH]: {
                systemPrompt: `Eres narrador de juegos. Genera respuestas JSON CORTAS.
Reglas:
- narrative: UNA oración, máx 20 palabras
- biome: bosque, pueblo, cueva, desierto, montaña, océano, ruinas, pantano
- features: máx 3 objetos
- entities: máx 2 personajes
- timeOfDay: día, noche, atardecer, niebla
- options: exactamente 3 acciones`,
                schema: {},
                exampleOutput: `{"narrative":"Entras en un bosque oscuro.","biome":"bosque","features":["árbol","camino"],"entities":["lobo"],"timeOfDay":"noche","options":["Ir al norte","Esconderse","Correr"]}`
            },

            [Language.FRENCH]: {
                systemPrompt: `Vous êtes narrateur de jeu. Générez des réponses JSON COURTES.
Règles:
- narrative: UNE phrase, max 20 mots
- biome: forêt, ville, grotte, désert, montagne, océan, ruines, marais
- features: max 3 objets
- entities: max 2 personnages
- timeOfDay: jour, nuit, coucher_du_soleil, brouillard
- options: exactement 3 actions`,
                schema: {},
                exampleOutput: `{"narrative":"Vous entrez dans une forêt sombre.","biome":"forêt","features":["arbre","chemin"],"entities":["loup"],"timeOfDay":"nuit","options":["Aller au nord","Se cacher","Courir"]}`
            }
        };

        return templates[language] || templates[Language.ENGLISH]!;
    }

    /**
     * Get max tokens based on constrained format
     * Structured output needs FAR fewer tokens (50 vs 150)
     */
    static getMaxTokens(): number {
        return 80;  // Drastically reduced from 150 (faster generation)
    }

    /**
     * Validate that output matches schema
     */
    static validateOutput(output: any): boolean {
        const required = ['narrative', 'biome', 'features', 'entities', 'timeOfDay', 'options'];

        for (const field of required) {
            if (!(field in output)) {
                console.warn(`[BrowserStructuredOutput] Missing field: ${field}`);
                return false;
            }
        }

        // Validate types
        if (typeof output.narrative !== 'string') return false;
        if (!Array.isArray(output.features)) return false;
        if (!Array.isArray(output.entities)) return false;
        if (!Array.isArray(output.options)) return false;

        // Validate lengths
        if (output.features.length > 3) return false;
        if (output.entities.length > 2) return false;
        if (output.options.length !== 3) return false;

        return true;
    }
}
