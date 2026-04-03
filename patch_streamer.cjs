const fs = require('fs');

let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

const newGenerationLogic = `
            // Instead of a callback function, we will use an Interruptable Streamer which is the definitive kill switch
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
            }
`;

content = content.replace(
    /            \/\/ Custom streamer to count sentences and throw an error to halt generation early[\s\S]*?            \} catch \(e: any\) \{[\s\S]*?                throw e; \/\/ Real error, pass it up[\s\S]*?            \}[\s\S]*?            let generatedText = output\[0\]\.generated_text\.trim\(\);/,
    newGenerationLogic
);

fs.writeFileSync('services/cartridge/llm.worker.ts', content);
