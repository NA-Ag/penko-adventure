import { pipeline, env, TextStreamer } from '@huggingface/transformers';
import { getFewShot } from '../../data/fewShots';

// Specify the correct environment variables for transformers.js
env.allowLocalModels = false; // Force using the huggingface hub
env.useBrowserCache = true;   // Cache models in the browser

// FORCE DISABLE WEBGPU: Prevent Fedora/Firefox from crashing on unsupported quantization ops
// by stripping 'webgpu' from the allowed backends list entirely.
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 4) : 4;
const webgpuIndex = env.backends.onnx.wasm.wasmPaths ? -1 : 0; // Just a dummy op to ensure we only touch backends if needed
env.backends.onnx.wasm.proxy = true; 
(env.backends.onnx as any).webgpu = undefined; // Nullify webgpu completely

let generator: any = null;
let currentModelId = '';
let isInitializing = false;

// Constant few-shot example (demonstrates the format)
const FEW_SHOT_EXAMPLE = `Story so far: The clock ticks in the dark hall.
Player action: I look around.
Continue the story in 1-2 sentences:
You notice a portrait with eyes that follow you.

`;

self.onmessage = async (e: MessageEvent) => {
    const { type, id, payload } = e.data;
    console.log(`[LLM Worker] Received message: ${type}`, id);

    try {
        if (type === 'init_model') {
            const { modelId } = payload;
            
            if (generator && currentModelId === modelId) {
                 self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });
                 return;
            }

            if (isInitializing) {
                // Wait for the existing initialization to finish, then resolve
                const checkInterval = setInterval(() => {
                    if (generator && currentModelId === modelId) {
                        clearInterval(checkInterval);
                        self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });
                    }
                }, 500);
                return;
            }

                        isInitializing = true;

                        self.postMessage({ type: 'progress', id, payload: { text: 'Loading ONNX Runtime...' } });

                        try {
                            // Check if WebGPU is available
                            const isWebGPUAvailable = false; // FORCED FALSE FOR FEDORA FIREFOX
                            
                            // More aggressive WebGPU disabling
                            if (env.backends && env.backends.onnx) {
                                (env.backends.onnx as any).webgpu = false;
                                env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 4) : 4;
                            }

                            generator = await pipeline('text-generation', modelId, {
                                device: 'wasm',
                                dtype: {
                                    embed_tokens: "fp16",
                                    decoder_model_merged: "q4"
                                }, 

                                progress_callback: (progress: any) => {
                                    self.postMessage({
                                        type: 'progress',
                                        id,
                                        payload: {
                                            progress: progress.progress,
                                            text: `Loading into memory (${progress.name || 'model files'})...`,
                                            loaded: progress.loaded,
                                            total: progress.total
                                        }
                                    });
                                }
                            });

                            // TRUE PRE-WARMING (The "Dummy Generation")
                            // We run this asynchronously so it doesn't block the UI from transitioning.
                            self.postMessage({ type: 'progress', id, payload: { text: 'Compiling neural graph...' } });
                            generator("A", { max_new_tokens: 1 })
                                .then(() => console.log("[LLM Worker] WASM kernels compiled and warmed up."))
                                .catch((e: any) => console.error("Warmup failed", e));

                            currentModelId = modelId;
                            self.postMessage({ type: 'complete', id, payload: { status: 'ready' } });

                        } catch (err: any) {
                            console.error("Pipeline initialization failed:", err);
                            self.postMessage({ type: 'error', id, payload: err.message || "Failed to initialize pipeline" });
                        } finally {
                            isInitializing = false;
                        }

                    } else if (type === 'generate_turn') {
            if (!generator) {
                throw new Error("Model not initialized");
            }
            
            const {
                prompt, // NOW EXPECTS FULL PRE-BUILT PROMPT
                maxTokens
            } = payload;

            console.log(`[LLM Worker] Running prompt: \n${prompt}`);

            self.postMessage({ type: 'progress', id, payload: { text: 'Generating response...' } });

            let completeSentences: string[] = [];
            let buffer = '';
            let sentenceCount = 0;
            const maxSentences = payload.maxSentences || 2; 

            const tokenizer = generator.tokenizer;
            const streamer = new TextStreamer(tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function: (token: string) => {
                    buffer += token;
                    
                    // Accumulate for UI - aggressively strip complete AND partial think tags
                    let displayBuffer = buffer.replace(/<think>.*?<\/think>/gs, '').replace(/<think>.*/s, '');
                    displayBuffer = displayBuffer.replace(/<.*?>/g, '').trimStart();
                    
                    let currentFullText = completeSentences.join(' ') + (completeSentences.length > 0 ? ' ' : '') + displayBuffer;

                    if (currentFullText.length > 0) {
                        self.postMessage({ type: 'stream', id, payload: { chunk: token, text: currentFullText } });
                    }

                    if (/[.!?]\s*$/.test(buffer)) {
                        let strippedBuffer = buffer.replace(/<think>.*?<\/think>/gs, '').replace(/<think>.*/s, '').replace(/<.*?>/g, '').trim();
                        if (strippedBuffer.length > 0) {
                            completeSentences.push(strippedBuffer);
                            sentenceCount++;
                            buffer = ''; 
                            if (sentenceCount >= maxSentences) throw new Error("HALT"); 
                        }
                    }
                }
            });

            let generatedText = "";
            try {
                const output = await generator(prompt, {
                    max_new_tokens: maxTokens || 80,
                    temperature: 0.2,      
                    top_p: 0.9,
                    repetition_penalty: 1.1,
                    do_sample: true,
                    return_full_text: false,
                    streamer: streamer,
                    stop_strings: ["<|im_end|>", "<|im_start|>", "Player:", "Story so far:"]
                });
                
                // If it finished naturally without throwing HALT, we still enforce the sentence count
                // using our tracked completeSentences just in case the model ignored stop tokens
                if (sentenceCount >= maxSentences) {
                    generatedText = completeSentences.slice(0, maxSentences).join(' ');
                } else {
                    generatedText = (output && output[0]?.generated_text) ? output[0].generated_text.trim() : (completeSentences.join(' ') + buffer);
                    
                    // Fallback regex split just in case the streamer missed it
                    const fallbackSentences = generatedText.match(/[^.!?]+[.!?]+/g);
                    if (fallbackSentences && fallbackSentences.length > maxSentences) {
                        generatedText = fallbackSentences.slice(0, maxSentences).join(' ').trim();
                    }
                }
            } catch (e: any) {
                if (e.message === "HALT") {
                    generatedText = completeSentences.slice(0, maxSentences).join(' ');
                } else throw e;
            }
            
            generatedText = generatedText.replace(/<think>.*?<\/think>/gs, '').replace(/<.*?>/g, '').trim();
            if (generatedText.length > 0 && !generatedText.match(/[.!?]$/)) generatedText += '.';

            self.postMessage({ 
                type: 'complete', 
                id, 
                payload: {
                    text: generatedText
                } 
            });
        } else if (type === 'generate_correction') {
            if (!generator) {
                throw new Error("Model not initialized");
            }

            const { prompt } = payload;
            
            console.log(`[LLM Worker] Running correction prompt: \n${prompt}`);

            let buffer = '';
            const tokenizer = generator.tokenizer;
            const streamer = new TextStreamer(tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function: (token: string) => {
                    buffer += token;
                    let displayBuffer = buffer.replace(/<think>.*?<\/think>/gs, '').replace(/<think>.*/s, '').replace(/<.*?>/g, '').trimStart();
                    if (displayBuffer.length > 0) {
                        self.postMessage({ type: 'stream', id, payload: { chunk: token, text: displayBuffer } });
                    }
                }
            });

            let generatedText = "";
            try {
                const output = await generator(prompt, {
                    max_new_tokens: 60,
                    temperature: 0.1,   // Highly deterministic
                    top_p: 0.9,
                    do_sample: false,   // Greedy decoding
                    return_full_text: false,
                    streamer: streamer,
                    stop_strings: ["<|im_end|>", "\n\n"]
                });
                
                if (output && output.length > 0 && output[0].generated_text) {
                    generatedText = output[0].generated_text.replace(/<think>.*?<\/think>/gs, '').replace(/<.*?>/g, '').trim();
                }
            } catch (e: any) {
                console.error("[LLM Worker] Correction failed:", e);
            }

            self.postMessage({ 
                type: 'complete', 
                id, 
                payload: generatedText
            });

        } else if (type === 'generate_simplification') {
            if (!generator) {
                throw new Error("Model not initialized");
            }

            const { prompt } = payload;
            
            console.log(`[LLM Worker] Running simplification prompt: \n${prompt}`);

            let buffer = '';
            const tokenizer = generator.tokenizer;
            const streamer = new TextStreamer(tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function: (token: string) => {
                    buffer += token;
                    let displayBuffer = buffer.replace(/<think>.*?<\/think>/gs, '').replace(/<think>.*/s, '').replace(/<.*?>/g, '').trimStart();
                    if (displayBuffer.length > 0) {
                        self.postMessage({ type: 'stream', id, payload: { chunk: token, text: displayBuffer } });
                    }
                }
            });

            let generatedText = "";
            try {
                const output = await generator(prompt, {
                    max_new_tokens: 40,
                    temperature: 0.1,   
                    top_p: 0.9,
                    do_sample: false,   
                    return_full_text: false,
                    streamer: streamer,
                    stop_strings: ["<|im_end|>", "\n\n"]
                });
                
                if (output && output.length > 0 && output[0].generated_text) {
                    generatedText = output[0].generated_text.replace(/<think>.*?<\/think>/gs, '').replace(/<.*?>/g, '').trim();
                }
            } catch (e: any) {
                console.error("[LLM Worker] Simplification failed:", e);
            }

            self.postMessage({ 
                type: 'complete', 
                id, 
                payload: generatedText
            });
        } // End of message types
    } catch (error: any) {
        console.error("Worker Error:", error);
        self.postMessage({ type: 'error', id, payload: error.message });
    }
};
