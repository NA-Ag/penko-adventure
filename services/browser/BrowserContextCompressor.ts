/**
 * Aggressive Context Compression for Browser AI
 *
 * Idea #4: More aggressive than BaseService (5 turns vs 15)
 * - Browser AI has limited WASM memory (512 tokens max)
 * - Smaller context = faster inference
 * - Inspired by Community Mode's finite state approach
 */

export interface CompressedContext {
    summary: string;           // One-sentence summary
    recentTurns: string[];     // Last 3 turns only
    importantFacts: string[];  // Key story elements (max 5)
    currentState: {            // Minimal state
        location: string;
        inventory: string[];   // Max 5 items
        health: number;
    };
}

export class BrowserContextCompressor {
    private static MAX_RECENT_TURNS = 3;     // Down from BaseService's 15
    private static MAX_FACTS = 5;            // Core story elements only
    private static MAX_INVENTORY = 5;        // Limit items

    /**
     * Compress full game history to minimal context
     * Target: <100 tokens (vs BaseService's ~200 tokens)
     */
    static compress(
        turnHistory: string[],
        currentState: any
    ): CompressedContext {
        // Take only last 3 turns
        const recentTurns = turnHistory.slice(-this.MAX_RECENT_TURNS);

        // Extract important facts from entire history
        const importantFacts = this.extractImportantFacts(turnHistory);

        // Generate ultra-short summary (1 sentence)
        const summary = this.generateSummary(turnHistory, importantFacts);

        // Compress inventory
        const inventory = (currentState.inventory || []).slice(0, this.MAX_INVENTORY);

        return {
            summary,
            recentTurns,
            importantFacts,
            currentState: {
                location: currentState.locationName || 'Unknown',
                inventory,
                health: currentState.health || 100
            }
        };
    }

    /**
     * Extract key story facts (quest goals, important NPCs, critical items)
     */
    private static extractImportantFacts(history: string[]): string[] {
        const facts: string[] = [];

        // Keywords that indicate important facts
        const importantKeywords = [
            'quest', 'mission', 'goal', 'king', 'queen', 'wizard', 'dragon',
            'artifact', 'treasure', 'key', 'sword', 'spell', 'curse'
        ];

        for (const turn of history) {
            const lowerTurn = turn.toLowerCase();

            // Check if turn contains important keywords
            for (const keyword of importantKeywords) {
                if (lowerTurn.includes(keyword)) {
                    // Extract sentence containing keyword
                    const sentences = turn.split(/[.!?]/);
                    const relevantSentence = sentences.find(s =>
                        s.toLowerCase().includes(keyword)
                    );

                    if (relevantSentence && !facts.includes(relevantSentence.trim())) {
                        facts.push(relevantSentence.trim());
                    }

                    if (facts.length >= this.MAX_FACTS) {
                        return facts.slice(0, this.MAX_FACTS);
                    }
                }
            }
        }

        return facts.slice(0, this.MAX_FACTS);
    }

    /**
     * Generate one-sentence summary of entire story
     * Target: <15 words
     */
    private static generateSummary(
        history: string[],
        importantFacts: string[]
    ): string {
        if (history.length === 0) {
            return "You begin your adventure.";
        }

        // If we have important facts, summarize those
        if (importantFacts.length > 0) {
            const firstFact = importantFacts[0];
            const words = firstFact.split(' ').slice(0, 12);  // Max 12 words
            return words.join(' ') + '.';
        }

        // Otherwise, use first and last turn
        const first = history[0].split(/[.!?]/)[0];
        const last = history[history.length - 1].split(/[.!?]/)[0];

        if (history.length === 1) {
            return first + '.';
        }

        // Combine first and last
        const combined = `${first}, now ${last}`.split(' ').slice(0, 15);
        return combined.join(' ') + '.';
    }

    /**
     * Build minimal prompt from compressed context
     * Target: <120 tokens total (including persona)
     */
    static buildMinimalPrompt(
        compressed: CompressedContext,
        currentAction: string,
        language: string = 'en',
        theme: string = 'fantasy'
    ): string {
        let prompt = `You are 'Penko', a Game Master for a ${theme} language learning game.
- Respond in ${language} with 1-2 short sentences.
- Use simple vocabulary (A2 level).
- Always incorporate the player's action.\n\n`;

        // Summary (1 line)
        prompt += `Story: ${compressed.summary}\n`;

        // Current state (3 lines max)
        prompt += `Location: ${compressed.currentState.location}\n`;

        if (compressed.currentState.inventory.length > 0) {
            prompt += `Items: ${compressed.currentState.inventory.join(', ')}\n`;
        }

        prompt += `Health: ${compressed.currentState.health}\n`;

        // Recent context (last 1-2 turns only)
        if (compressed.recentTurns.length > 0) {
            const lastTurn = compressed.recentTurns[compressed.recentTurns.length - 1];
            const sentence = lastTurn.split(/[.!?]/)[0];  // First sentence only
            prompt += `Previous: ${sentence}.\n`;
        }

        // Important facts (condensed)
        if (compressed.importantFacts.length > 0) {
            prompt += `Quest: ${compressed.importantFacts[0]}\n`;
        }

        // Current action (optional)
        if (currentAction && currentAction.trim().length > 0) {
            prompt += `Action: ${currentAction}\n`;
        }

        return prompt;
    }

    /**
     * Estimate token count (rough approximation)
     * 1 token ≈ 4 characters
     */
    static estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    /**
     * Validate that context is within WASM limits
     * Firefox WASM has 512 token max context
     */
    static validateContextSize(prompt: string, maxTokens: number = 512): boolean {
        const estimatedTokens = this.estimateTokens(prompt);

        if (estimatedTokens > maxTokens) {
            console.warn(
                `[BrowserContextCompressor] Context too large: ${estimatedTokens} tokens (max: ${maxTokens})`
            );
            return false;
        }

        return true;
    }

    /**
     * Truncate prompt if it exceeds token limit
     * Emergency fallback
     */
    static truncatePrompt(prompt: string, maxTokens: number = 512): string {
        const maxChars = maxTokens * 4;  // Rough conversion

        if (prompt.length <= maxChars) {
            return prompt;
        }

        // Truncate and add ellipsis
        console.warn(`[BrowserContextCompressor] Truncating prompt from ${prompt.length} to ${maxChars} chars`);
        return prompt.substring(0, maxChars - 3) + '...';
    }

    /**
     * Clear compression cache
     * Called when starting new game
     */
    static clearCache(): void {
        // No cache in this simple implementation
        // More advanced version could cache summaries
    }
}
