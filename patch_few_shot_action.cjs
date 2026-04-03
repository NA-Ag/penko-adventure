const fs = require('fs');
let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

const actionPromptLogic = `
                } else {
                    // Inject a few-shot example for actions to stop it from hallucinating the "glowing crystal" example
                    // but we put it in the system prompt area so it doesn't pollute the chat history.
                    const actionExamples = \`<|im_start|>user\\nPlayer Action: I open the heavy door.\\n[System Event: The player moves to the old library.]<|im_end|>\\n<|im_start|>assistant\\nYou push open the heavy oak door, revealing a dusty old library. The smell of rotting parchment fills the air.<|im_end|>\\n\`;
                    
                    // We must inject this right before the current user turn, but after the history.
                    // The easiest way is to prepend it to the current user message block.
                    let userMsg = \`\${actionExamples}<|im_start|>user\\nPlayer Action: \${prompt}\`;
                    
                    if (systemEvent) {
                        userMsg += \`\\n[System Event: \${systemEvent}]\`;
                    }
                    formattedPrompt += \`\${userMsg}<|im_end|>\\n<|im_start|>assistant\\n\`;
                }
`;

content = content.replace(
    /                \} else \{[\s\S]*?                    let userMsg = `Player Action: \$\{prompt\}`;[\s\S]*?                    if \(systemEvent\) \{[\s\S]*?                        userMsg \+= `\\n\[System Event: \$\{systemEvent\}\]`;[\s\S]*?                    \}[\s\S]*?                    formattedPrompt \+= `<\|im_start\|>user\\n\$\{userMsg\}<\|im_end\|>\\n<\|im_start\|>assistant\\n`;[\s\S]*?                \}/,
    actionPromptLogic
);

fs.writeFileSync('services/cartridge/llm.worker.ts', content);
