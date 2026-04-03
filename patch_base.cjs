const fs = require('fs');

let content = fs.readFileSync('services/BaseService.ts', 'utf-8');

// 1. Add translation fields
if (!content.includes('translationWorkerInstance')) {
    content = content.replace(
        "protected static ttsWorkerInstance: Worker | null = null;",
        "protected static ttsWorkerInstance: Worker | null = null;\n    protected static translationWorkerInstance: Worker | null = null;"
    );
}

if (!content.includes('translationPendingRequests')) {
    content = content.replace(
        "protected static ttsPendingRequests: Map<string, { resolve: Function; reject: Function; onProgress?: Function }> = new Map();",
        "protected static ttsPendingRequests: Map<string, { resolve: Function; reject: Function; onProgress?: Function }> = new Map();\n    protected static translationPendingRequests: Map<string, { resolve: Function; reject: Function; onProgress?: Function }> = new Map();"
    );
}

// 2. Add getTranslationWorkerUrl
if (!content.includes('getTranslationWorkerUrl')) {
    content = content.replace(
        "protected abstract getTtsWorkerUrl(): string;",
        "protected abstract getTtsWorkerUrl(): string;\n    protected abstract getTranslationWorkerUrl(): string;"
    );
}

// 3. Add translation methods
if (!content.includes('initTranslationWorker')) {
    const translationMethods = `
    protected initTranslationWorker(): void {
        if (!BaseService.translationWorkerInstance && typeof window !== 'undefined') {
            try {
                if (DEBUG.ONNX) console.log('[BaseService] Initializing Translation Worker');
                BaseService.translationWorkerInstance = new Worker(this.getTranslationWorkerUrl(), { type: 'module' });
                BaseService.translationWorkerInstance.addEventListener('message', this.handleTranslationWorkerMessage.bind(this));
                BaseService.translationWorkerInstance.addEventListener('error', (e) => {
                    console.error('[TranslationWorker Error]', e);
                    BaseService.translationWorkerInstance = null;
                });
            } catch (e) {
                console.error('[BaseService] Failed to initialize translation worker', e);
            }
        }
    }

    protected handleTranslationWorkerMessage(event: MessageEvent): void {
        const { type, id, payload } = event.data as WorkerMessage;
        const request = BaseService.translationPendingRequests.get(id);

        if (!request) return;

        if (type === 'progress') {
            if (request.onProgress) {
                request.onProgress(
                    payload.progress || 0,
                    payload.file || 'Loading...',
                    payload.loaded,
                    payload.total
                );
            }
        } else if (type === 'complete') {
            request.resolve(payload);
            BaseService.translationPendingRequests.delete(id);
        } else if (type === 'error') {
            request.reject(new Error(payload));
            BaseService.translationPendingRequests.delete(id);
        }
    }

    protected requestTranslation(type: string, payload: any, onProgress?: (p: number, t: string, loaded?: number, total?: number) => void): Promise<any> {
        this.initTranslationWorker();
        if (!BaseService.translationWorkerInstance) return Promise.reject(new Error("Translation worker unavailable"));

        const id = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            BaseService.translationPendingRequests.set(id, { resolve, reject, onProgress });
            BaseService.translationWorkerInstance!.postMessage({ type, id, payload });
        });
    }
`;
    content = content.replace(
        "// --- GAME LOOP HELPERS ---",
        translationMethods + "\n    // --- GAME LOOP HELPERS ---"
    );
}

fs.writeFileSync('services/BaseService.ts', content);
