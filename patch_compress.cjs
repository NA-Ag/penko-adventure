const fs = require('fs');
let content = fs.readFileSync('services/BaseService.ts', 'utf-8');

const newCompressContext = `
    // --- Context Compression ---
    protected async compressContextAsync(): Promise<void> {
        if (this.historyContext.length <= this.MAX_CONTEXT_LENGTH) {
            return;
        }

        if (DEBUG.ONNX) console.log(\`[Context] Compressing history: \${this.historyContext.length} → \${this.MAX_CONTEXT_LENGTH} turns via AI Summary\`);

        const firstTurns = this.historyContext.slice(0, this.KEEP_FIRST_TURNS);
        const recentTurns = this.historyContext.slice(-this.KEEP_RECENT_TURNS);
        const middleTurns = this.historyContext.slice(
            this.KEEP_FIRST_TURNS,
            this.historyContext.length - this.KEEP_RECENT_TURNS
        );

        const summaryPrompt = \`Task: Summarize the following game events into exactly one short sentence. Keep only the most important actions.
Events to summarize:
\${middleTurns.join('\\n')}

Summary:\`;

        try {
            // Send a lightweight summary request to the LLM worker
            const rawSummary = await this.request('generate_turn', {
                prompt: summaryPrompt,
                maxTokens: 40,
                language: 'English',
                history: [], // No history needed for summarization
                context: {},
                playerState: { health: 100, inventory: [] }
            }, undefined, 300000);
            
            let cleanSummary = rawSummary.replace(/\`\`\`json|\`\`\`|\\{|\\}/g, '').trim();
            // Just in case it rambles
            cleanSummary = (cleanSummary.match(/[^.!?]+[.!?]+/g) || [cleanSummary])[0] || cleanSummary;

            this.historyContext = [
                ...firstTurns,
                \`[Story so far: \${cleanSummary}]\`,
                ...recentTurns
            ];
            
            if (DEBUG.ONNX) console.log(\`[Context] AI Summary created: \${cleanSummary}\`);
        } catch (e) {
            console.error('[Context] AI Summary failed, falling back to heuristic', e);
            // Fallback to the old heuristic if the AI fails
            const middleSummary = this.summarizeMiddleTurns(middleTurns);
            this.historyContext = [
                ...firstTurns,
                middleSummary,
                ...recentTurns
            ];
        }
    }

    protected compressContext(): void {
        // Now just a fallback shell if called synchronously
        if (this.historyContext.length <= this.MAX_CONTEXT_LENGTH) {
            return;
        }
        const firstTurns = this.historyContext.slice(0, this.KEEP_FIRST_TURNS);
        const recentTurns = this.historyContext.slice(-this.KEEP_RECENT_TURNS);
        const middleTurns = this.historyContext.slice(
            this.KEEP_FIRST_TURNS,
            this.historyContext.length - this.KEEP_RECENT_TURNS
        );
        const middleSummary = this.summarizeMiddleTurns(middleTurns);
        this.historyContext = [
            ...firstTurns,
            middleSummary,
            ...recentTurns
        ];
    }
`;

content = content.replace(
    /    \/\/ \-\-\- Context Compression \-\-\-[\s\S]*?    protected summarizeMiddleTurns\(turns: string\[\]\): string \{/,
    newCompressContext + "\n    protected summarizeMiddleTurns(turns: string[]): string {"
);

fs.writeFileSync('services/BaseService.ts', content);
