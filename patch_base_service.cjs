const fs = require('fs');

let content = fs.readFileSync('services/BaseService.ts', 'utf-8');

// Add translation worker logic to BaseService
const getTranslationWorkerUrlLine = `    protected abstract getTtsWorkerUrl(): string;\n    protected abstract getTranslationWorkerUrl(): string;`;
content = content.replace(`    protected abstract getTtsWorkerUrl(): string;`, getTranslationWorkerUrlLine);

const workerVariablesLine = `    protected static worker: Worker | null = null;
    protected static ttsWorker: Worker | null = null;
    protected static translationWorker: Worker | null = null;`;
content = content.replace(`    protected static worker: Worker | null = null;\n    protected static ttsWorker: Worker | null = null;`, workerVariablesLine);

const initTranslationWorkerLine = `
    protected initTranslationWorker(): void {
        if (!BaseService.translationWorker && typeof window !== 'undefined') {
            try {
                if (DEBUG.ONNX) console.log('[BaseService] Initializing Translation Worker');
                BaseService.translationWorker = new Worker(this.getTranslationWorkerUrl(), { type: 'module' });
                BaseService.translationWorker.addEventListener('message', this.handleTranslationWorkerMessage.bind(this));
                BaseService.translationWorker.addEventListener('error', (e) => {
                    console.error('[TranslationWorker Error]', e);
                    BaseService.translationWorker = null;
                });
            } catch (e) {
                console.error('[BaseService] Failed to initialize translation worker', e);
            }
        }
    }

    protected handleTranslationWorkerMessage(event: MessageEvent): void {
        const { type, id, payload } = event.data;
        
        if (type === 'progress') {
            const pending = this.pendingRequests.get(id);
            if (pending?.onProgress && payload) {
                // Approximate translation loading progress
                const progress = payload.progress !== undefined ? payload.progress : 50;
                let text = \`Loading translation model (\${payload.file || '...'})...\`;
                if (payload.status === 'downloading') {
                    text = \`Downloading \${payload.name} (\${Math.round(progress)}%)\`;
                }
                pending.onProgress(progress, text);
            }
            return;
        }

        const pending = this.pendingRequests.get(id);
        if (!pending) return;

        if (type === 'complete') {
            this.pendingRequests.delete(id);
            pending.resolve(payload);
        } else if (type === 'error') {
            this.pendingRequests.delete(id);
            pending.reject(new Error(payload || 'Translation Worker Error'));
        }
    }

    protected requestTranslation(type: string, payload: any, onProgress?: (p: number, text?: string, loaded?: number, total?: number) => void): Promise<any> {
        this.initTranslationWorker();
        if (!BaseService.translationWorker) return Promise.reject(new Error("Translation worker unavailable"));

        return new Promise((resolve, reject) => {
            const id = \`req_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`;
            this.pendingRequests.set(id, { resolve, reject, onProgress });
            BaseService.translationWorker!.postMessage({ type, id, payload });
        });
    }
`;

content = content.replace(
    /    protected handleTtsWorkerMessage\(event: MessageEvent\): void \{[\s\S]*?    protected abstract processTurn\(input: string, context\?: any, skipInputCheck\?: boolean\): Promise<any>;/,
    (match) => {
        return match.replace("    // --- GAME LOOP HELPERS ---", initTranslationWorkerLine + "\n    // --- GAME LOOP HELPERS ---");
    }
);

content = content.replace(
    "    public static cleanup(forceKillWorker: boolean = false) {",
    "    public static cleanup(forceKillWorker: boolean = false) {\n        if (forceKillWorker && BaseService.translationWorker) {\n            BaseService.translationWorker.terminate();\n            BaseService.translationWorker = null;\n        }"
)

fs.writeFileSync('services/BaseService.ts', content);
