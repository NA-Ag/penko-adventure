const fs = require('fs');

let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

// I am rewriting the entire end of the file from the streamer instantiation down
// to ensure perfect bracket balance and logic.

const index = content.indexOf('let generatedOutput = "";');
if (index !== -1) {
    const validContent = content.substring(0, index);
    const newEnd = `let generatedOutput = "";
            let sentenceCount = 0;
            const maxSentences = isStart ? 1 : 2;

            const callback_function = (beams: any[]) => {
                if (!beams || beams.length === 0) return false;
                
                const token = beams[0].output_token_text || beams[0].text || String(beams[0]);
                
                if (token && typeof token === 'string') {
                    generatedOutput += token;
                    if (token.includes('.') || token.includes('!') || token.includes('?')) {
                        sentenceCount++;
                    }
                    if (sentenceCount >= maxSentences) {
                        return true; 
                    }
                }
                return false;
            };

            let generatedText = "";
            try {
                const output = await generator(formattedPrompt, {
                    max_new_tokens: maxTokens || 45,
                    temperature: 0.3,
                    top_p: 0.85,
                    repetition_penalty: 1.05,
                    return_full_text: false,
                    callback_function: callback_function,
                    stop_strings: ["<|im_end|>", "<|im_start|>", "Player:", "[DAMAGE]", "[HEAL]", "[ITEM:"]
                });
                
                if (output && output.length > 0 && output[0].generated_text) {
                    generatedText = output[0].generated_text.trim();
                } else {
                    generatedText = generatedOutput.trim();
                }
            } catch (e: any) {
                if (e.message && e.message.includes('abort')) {
                    generatedText = generatedOutput.trim();
                } else {
                    throw e;
                }
            }
            
            self.postMessage({ type: 'complete', id, payload: generatedText });
        }
    } catch (error: any) {
        console.error("Worker Error:", error);
        self.postMessage({ type: 'error', id, payload: error.message });
    }
};
`;
    fs.writeFileSync('services/cartridge/llm.worker.ts', validContent + newEnd);
}
