const fs = require('fs');
let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

// Replace the streamer logic with the callback logic that returns true, since search confirmed
// returning true from callback_function is the official way to stop it in v3!
const streamerLogic = `            // Instead of a callback function, we will use an Interruptable Streamer which is the definitive kill switch
            let generatedOutput = "";
            let sentenceCount = 0;
            const maxSentences = isStart ? 1 : 2;

            const streamer = new class {
                put(value) {
                    if (typeof value === 'string') {
                        generatedOutput += value;
                        if (value.includes('.') || value.includes('!') || value.includes('?')) {
                            sentenceCount++;
                        }
                        if (sentenceCount >= maxSentences) {
                            throw new Error("HALT");
                        }
                    } else if (Array.isArray(value)) {
                         const token = value[0].text || value[0];
                         if (typeof token === 'string') {
                             generatedOutput += token;
                             if (token.includes('.') || token.includes('!') || token.includes('?')) {
                                 sentenceCount++;
                             }
                             if (sentenceCount >= maxSentences) {
                                 throw new Error("HALT");
                             }
                         }
                    }
                }
                end() {}
            }();

            let generatedText = "";
            try {
                const output = await generator(formattedPrompt, {
                    max_new_tokens: maxTokens || 60,
                    temperature: 0.3,
                    top_p: 0.85,
                    repetition_penalty: 1.15,
                    return_full_text: false,
                    streamer: streamer,
                    stop_strings: ["<|im_end|>", "<|im_start|>", "Player:", "[DAMAGE]", "[HEAL]", "[ITEM:"]
                });
                generatedText = output[0].generated_text.trim();
            } catch (e: any) {
                if (e.message === "HALT") {
                    generatedText = generatedOutput.trim();
                } else {
                    throw e;
                }
            }`;

const callbackLogic = `            let generatedOutput = "";
            let sentenceCount = 0;
            const maxSentences = isStart ? 1 : 2; // For start we only want 2 sentences. Since our prompt says "exactly two sentences", we will cut after the second sentence ends.

            // The official way to halt Transformers.js early is returning true from the callback_function
            const callback_function = (beams: any[]) => {
                if (!beams || beams.length === 0) return false;
                
                // Decode just the newest token to check for punctuation
                // Depending on the exact structure returned by Qwen in Transformers v3, we get the text
                const token = beams[0].output_token_text || beams[0].text || String(beams[0]);
                
                if (token && typeof token === 'string') {
                    generatedOutput += token;
                    // Check if this specific token contains a sentence ender
                    if (token.includes('.') || token.includes('!') || token.includes('?')) {
                        sentenceCount++;
                    }
                    
                    // Kill switch
                    if (sentenceCount >= maxSentences) {
                        return true; 
                    }
                }
                return false;
            };

            let generatedText = "";
            try {
                const output = await generator(formattedPrompt, {
                    max_new_tokens: maxTokens || 60,
                    temperature: 0.3,
                    top_p: 0.85,
                    repetition_penalty: 1.15,
                    return_full_text: false,
                    callback_function: callback_function,
                    stop_strings: ["<|im_end|>", "<|im_start|>", "Player:", "[DAMAGE]", "[HEAL]", "[ITEM:"]
                });
                
                // If it finished naturally without being killed early by the callback
                if (output && output.length > 0 && output[0].generated_text) {
                    generatedText = output[0].generated_text.trim();
                } else {
                    generatedText = generatedOutput.trim();
                }
            } catch (e: any) {
                // If returning true throws an internal pipeline abortion error, catch it gracefully
                if (e.message && e.message.includes('abort')) {
                    generatedText = generatedOutput.trim();
                } else {
                    throw e;
                }
            }`;

content = content.replace(streamerLogic, callbackLogic);
fs.writeFileSync('services/cartridge/llm.worker.ts', content);
