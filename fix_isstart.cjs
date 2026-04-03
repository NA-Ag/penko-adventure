const fs = require('fs');

let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

// The replacement logic for isStart lost the actual prompt compilation block when I previously patched the file.
// I'm putting it back in cleanly.

const brokenIsStartBlock = `                        fewShotExamples = \`<|im_start|>user\\nLocation: town<|im_end|>\\n<|im_start|>assistant\\nA thick layer of fog rolls through the cobblestone streets of the quiet harbor town. The dim glow of a streetlamp illuminates a dropped, muddy envelope.<|im_end|>\\n<|im_start|>user\\nLocation: interior<|im_end|>\\n<|im_start|>assistant\\nYou find yourself in a luxurious but completely ransacked study. A grand mahogany desk sits in the center, covered in scattered papers and a knocked-over inkwell.<|im_end|>\\n<|im_start|>user\\nLocation: interior<|im_end|>\\n<|im_start|>assistant\\nYou stand in the shadowy hallway of an old Victorian mansion. A grandfather clock ticks loudly, counting down the seconds in the dead silence.<|im_end|>\\n\`;
    
                } else {`;

const fixedIsStartBlock = `                        fewShotExamples = \`<|im_start|>user\\nLocation: town<|im_end|>\\n<|im_start|>assistant\\nA thick layer of fog rolls through the cobblestone streets of the quiet harbor town. The dim glow of a streetlamp illuminates a dropped, muddy envelope.<|im_end|>\\n<|im_start|>user\\nLocation: interior<|im_end|>\\n<|im_start|>assistant\\nYou find yourself in a luxurious but completely ransacked study. A grand mahogany desk sits in the center, covered in scattered papers and a knocked-over inkwell.<|im_end|>\\n<|im_start|>user\\nLocation: interior<|im_end|>\\n<|im_start|>assistant\\nYou stand in the shadowy hallway of an old Victorian mansion. A grandfather clock ticks loudly, counting down the seconds in the dead silence.<|im_end|>\\n\`;
                    } else { // Fantasy
                        fewShotExamples = \`<|im_start|>user\\nLocation: forest<|im_end|>\\n<|im_start|>assistant\\nYou stand at the edge of an ancient, whispering forest. The scent of pine and damp earth fills the cool morning air.<|im_end|>\\n<|im_start|>user\\nLocation: dungeon<|im_end|>\\n<|im_start|>assistant\\nYou stand before a massive stone door covered in glowing blue runes. The air inside is thick with the smell of ancient dust and forgotten magic.<|im_end|>\\n<|im_start|>user\\nLocation: cave<|im_end|>\\n<|im_start|>assistant\\nYou carefully step into the dark, echoing cavern. A faint, bioluminescent moss illuminates a narrow path leading deeper underground.<|im_end|>\\n\`;
                    }

                    // Completely overwrite the prompt for a clean, strict Start template
                    formattedPrompt = \`<|im_start|>system\\nYou are a text adventure author. Write exactly two sentences describing the starting location. You MUST write in the second-person ("You").<|im_end|>\\n\`;
                    formattedPrompt += fewShotExamples;
                    formattedPrompt += \`<|im_start|>user\\nLocation: \${biomeName}<|im_end|>\\n<|im_start|>assistant\\n\`;
                } else {`;

content = content.replace(brokenIsStartBlock, fixedIsStartBlock);
fs.writeFileSync('services/cartridge/llm.worker.ts', content);
