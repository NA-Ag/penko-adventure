const fs = require('fs');
let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

// Remove the mandatory [STATUS] tag requirement
content = content.replace(
    "formattedPrompt = `<|im_start|>system\\n${actualSystemPrompt}\\n\\nAlways end your response with exactly ONE of these tags:\\n[STATUS: NEUTRAL]\\n[STATUS: HURT]\\n[STATUS: HEALED]\\n[STATUS: ITEM]<|im_end|>\\n`;",
    "formattedPrompt = `<|im_start|>system\\n${actualSystemPrompt}<|im_end|>\\n`;"
);

// We still keep the stop_strings for safety to prevent massive runs if it hallucinates tags,
// but we remove "[STATUS:" from the list since we aren't using it anymore.
content = content.replace(
    /stop_strings: \["<\|im_end\|>", "<\|im_start\|>", "Player:", "System CONCLUSION", "Tu\.\.\.", "\[STATUS:", "\[DAMAGE\]", "\[HEAL\]", "\[ITEM:"\]/,
    `stop_strings: ["<|im_end|>", "<|im_start|>", "Player:", "System CONCLUSION", "Tu...", "[DAMAGE]", "[HEAL]", "[ITEM:"]`
);

fs.writeFileSync('services/cartridge/llm.worker.ts', content);
