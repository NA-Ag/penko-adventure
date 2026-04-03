import { pipeline, env } from '@huggingface/transformers';
import { KokoroTTS } from 'kokoro-js';

// Specify the correct environment variables for transformers.js
env.allowLocalModels = false; // Force using the huggingface hub
env.useBrowserCache = true;   // Cache models in the browser

let kokoroGenerator: any = null;
let mmsGenerator: any = null;
let piperGenerator: any = null;
let currentMmsModelId: string | null = null;
let currentPiperModelId: string | null = null;
let currentPiperModelFile: string | null = null;
let isTtsInitializing = false;
let currentEngine: 'kokoro' | 'mms' | 'piper' | null = null;

self.onmessage = async (e: MessageEvent) => {
    const { type, id, payload } = e.data;
    console.log(`[TTS Worker] Received message: ${type}`, id);

    try {
        if (type === 'init_tts') {
            const requestedEngine = payload?.engine || 'kokoro';
            const modelId = payload?.modelId || 'onnx-community/Kokoro-82M-v1.0-ONNX';
            const modelFile = payload?.modelFile;
            
            // Check if already initialized
            if (requestedEngine === 'kokoro' && kokoroGenerator) {
                currentEngine = 'kokoro';
                self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });
                return;
            }
            if (requestedEngine === 'mms' && mmsGenerator && currentMmsModelId === modelId) {
                currentEngine = 'mms';
                self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });
                return;
            }
            if (requestedEngine === 'piper' && piperGenerator && currentPiperModelId === modelId && (modelFile === undefined || currentPiperModelFile === modelFile)) {
                currentEngine = 'piper';
                self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });
                return;
            }
            
            if (isTtsInitializing) {
                console.log("[TTS Worker] TTS initialization already in progress");
                const checkInterval = setInterval(() => {
                    if ((requestedEngine === 'kokoro' && kokoroGenerator) || 
                        (requestedEngine === 'mms' && mmsGenerator && currentMmsModelId === modelId) ||
                        (requestedEngine === 'piper' && piperGenerator && currentPiperModelId === modelId && (modelFile === undefined || currentPiperModelFile === modelFile))) {
                        clearInterval(checkInterval);
                        self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });
                    }
                }, 500);
                return;
            }
            
            isTtsInitializing = true;
            try {
                const isWebGPUAvailable = (navigator as any).gpu !== undefined;
                console.log(`[TTS Worker] Initializing ${requestedEngine} TTS (${modelId}). WebGPU:`, isWebGPUAvailable);
                
                if (requestedEngine === 'kokoro') {
                    self.postMessage({ type: 'progress', id, payload: { text: 'Loading Kokoro TTS Engine...' } });
                    kokoroGenerator = await KokoroTTS.from_pretrained(modelId, {
                        dtype: 'q8',
                        device: isWebGPUAvailable ? 'webgpu' : 'wasm',
                        progress_callback: (progress: any) => {
                            self.postMessage({
                                type: 'progress',
                                id,
                                payload: {
                                    progress: progress.progress,
                                    text: `Loading Engine (${progress.name || 'model files'})...`,
                                    loaded: progress.loaded,
                                    total: progress.total
                                }
                            });
                        }
                    });
                    currentEngine = 'kokoro';
                } else if (requestedEngine === 'mms' || requestedEngine === 'piper') {
                    const engineLabel = requestedEngine === 'piper' ? 'Piper' : 'Multilingual';
                    self.postMessage({ type: 'progress', id, payload: { text: `Loading ${engineLabel} Engine (${modelId})...` } });
                    
                    const pipelineOptions: any = {
                        device: isWebGPUAvailable ? 'webgpu' : 'wasm',
                        progress_callback: (progress: any) => {
                            self.postMessage({
                                type: 'progress',
                                id,
                                payload: {
                                    progress: progress.progress,
                                    text: `Downloading Voice Pack (${progress.name || 'model files'})...`,
                                    loaded: progress.loaded,
                                    total: progress.total
                                }
                            });
                        }
                    };
                    
                    if (modelFile) {
                        pipelineOptions.model_file = modelFile;
                    }

                    const gen = await pipeline('text-to-speech', modelId, pipelineOptions);

                    if (requestedEngine === 'piper') {
                        piperGenerator = gen;
                        currentPiperModelId = modelId;
                        currentPiperModelFile = modelFile || null;
                    } else {
                        mmsGenerator = gen;
                        currentMmsModelId = modelId;
                    }
                    currentEngine = requestedEngine;
                }

                console.log(`[TTS Worker] ${requestedEngine} TTS ready`);
                self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });
            } catch (err: any) {
                console.error("[TTS Worker] TTS Pipeline initialization failed:", err);
                self.postMessage({ type: 'error', id, payload: err.message || "Failed to initialize TTS pipeline" });
            } finally {
                isTtsInitializing = false;
            }
        } else if (type === 'generate_tts') {
            const { text, voice } = payload;
            console.log(`[TTS Worker] Generating TTS using engine: ${currentEngine}`);
            
            self.postMessage({ type: 'progress', id, payload: { text: 'Generating audio...' } });
            
            let result;
            if (currentEngine === 'kokoro') {
                if (!kokoroGenerator) throw new Error("Kokoro Model not initialized");
                result = await kokoroGenerator.generate(text, {
                    voice: voice || "af_heart"
                });
            } else if (currentEngine === 'mms' || currentEngine === 'piper') {
                const gen = currentEngine === 'piper' ? piperGenerator : mmsGenerator;
                if (!gen) throw new Error(`${currentEngine} Model not initialized`);
                result = await gen(text);
            } else {
                throw new Error("No TTS engine initialized");
            }
            
            console.log(`[TTS Worker] Audio generated. Samples: ${result.audio.length}, Rate: ${result.sampling_rate}`);
            
            // Send raw Float32Array for maximum performance and reliability
            self.postMessage({ 
                type: 'complete', 
                id, 
                payload: { 
                    audio: result.audio, 
                    sampleRate: result.sampling_rate 
                } 
            }, [result.audio.buffer] as any);
            
            console.log("[TTS Worker] Raw audio sent to main thread");
        }
    } catch (error: any) {
        console.error("[TTS Worker] Error:", error);
        self.postMessage({ type: 'error', id, payload: error.message });
    }
};