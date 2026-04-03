const fs = require('fs');

let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

// The Transformers.js v3 callback_function can halt generation if it returns `true`
// Throwing an error sometimes gets swallowed by the WebWorker message boundary or internal promises.
content = content.replace(
    /                if \(sentenceCount >= maxSentences\) \{[\s\S]*?                    throw new Error\('STOP_GENERATION_LIMIT_REACHED'\);[\s\S]*?                \}/,
    `                if (sentenceCount >= maxSentences) {
                    return true; // Returning true explicitly halts generation in Transformers.js v3
                }`
);

// We need to adjust the try/catch block because if it stops via return true, it won't throw an error,
// it will just resolve the promise normally with the text generated so far!
const tryCatchBlock = `
            let output;
            try {
                output = await generator(formattedPrompt, {
                    max_new_tokens: maxTokens || 50, // Lower max tokens since we expect it to stop early anyway
                    temperature: 0.3,
                    top_p: 0.85,
                    repetition_penalty: 1.15,
                    return_full_text: false,
                    callback_function: callback_function,
                    stop_strings: ["<|im_end|>", "<|im_start|>", "Player:", "System CONCLUSION", "Tu...", "[DAMAGE]", "[HEAL]", "[ITEM:"]
                });
            } catch (e: any) {
                // If it's our custom stop error, we just catch it and proceed with what we generated!
                if (e.message === 'STOP_GENERATION_LIMIT_REACHED') {
                    output = [{ generated_text: generatedOutput }];
                } else {
                    throw e; // Real error, pass it up
                }
            }
`;

const newTryCatchBlock = `
            let output;
            try {
                output = await generator(formattedPrompt, {
                    max_new_tokens: maxTokens || 60,
                    temperature: 0.3,
                    top_p: 0.85,
                    repetition_penalty: 1.15,
                    return_full_text: false,
                    callback_function: callback_function,
                    stop_strings: ["<|im_end|>", "<|im_start|>", "Player:", "[DAMAGE]", "[HEAL]", "[ITEM:"]
                });
            } catch (e: any) {
                throw e; // Real error, pass it up
            }
`;

content = content.replace(tryCatchBlock, newTryCatchBlock);

fs.writeFileSync('services/cartridge/llm.worker.ts', content);
