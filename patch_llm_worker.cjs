const fs = require('fs');

let content = fs.readFileSync('services/cartridge/llm.worker.ts', 'utf-8');

const isStartReplacement = `
                if (isStart) {
                    const themeName = theme || 'fantasy';
                    const biomeName = context?.biome || 'unknown area';
                    
                    let fewShotExamples = "";
                    if (themeName === 'horror') {
                        fewShotExamples = \`
Location: graveyard
Output: You wake up in a cold, fog-drenched graveyard surrounded by crumbling tombstones. A rusted iron gate looms in the darkness ahead.

Location: cave
Output: The damp cave walls glisten with moisture as the smell of stale air fills your lungs. You hear a low, unnatural growl echoing from the depths.

Location: interior
Output: You stand in the center of an abandoned, dusty room lit only by a single flickering candle. Shadows dance menacingly across the peeling wallpaper.\`;
                    } else if (themeName === 'cyberpunk' || themeName === 'scifi') {
                        fewShotExamples = \`
Location: cyber_city
Output: You step out into the rain-slicked streets of the neon-lit lower levels. Holographic advertisements hum and flicker above the crowded alleyways.

Location: interior
Output: You wake up on a cold metal slab inside a sterile, humming laboratory. A glaring red security light flashes rhythmically from the ceiling.

Location: cyber_city
Output: The deafening roar of flying traffic echoes between towering skyscrapers. You stand alone on a metal walkway, surrounded by glowing data screens.\`;
                    } else if (themeName === 'western') {
                        fewShotExamples = \`
Location: desert
Output: The scorching sun beats down on the cracked, dry earth of the barren desert. A lonely tumbleweed rolls past your dusty boots.

Location: town
Output: You walk into the quiet main street of a dusty frontier town. A pair of wooden saloon doors swing lazily on their rusty hinges.

Location: canyon
Output: You stand at the edge of a massive, red-rock canyon that stretches as far as the eye can see. The hot wind carries the faint sound of a distant train whistle.\`;
                    } else if (themeName === 'mystery') {
                        fewShotExamples = \`
Location: town
Output: A thick layer of fog rolls through the cobblestone streets of the quiet harbor town. The dim glow of a streetlamp illuminates a dropped, muddy envelope.

Location: interior
Output: You find yourself in a luxurious but completely ransacked study. A grand mahogany desk sits in the center, covered in scattered papers and a knocked-over inkwell.

Location: interior
Output: You stand in the shadowy hallway of an old Victorian mansion. A grandfather clock ticks loudly, counting down the seconds in the dead silence.\`;
                    } else { // Fantasy
                        fewShotExamples = \`
Location: forest
Output: You stand at the edge of an ancient, whispering forest. The scent of pine and damp earth fills the cool morning air.

Location: dungeon
Output: You stand before a massive stone door covered in glowing blue runes. The air inside is thick with the smell of ancient dust and forgotten magic.

Location: cave
Output: You carefully step into the dark, echoing cavern. A faint, bioluminescent moss illuminates a narrow path leading deeper underground.\`;
                    }

                    formattedPrompt += \`<|im_start|>system
You are a text adventure author. Write exactly two sentences describing the starting location.
You MUST write in the second-person ("You").

EXAMPLES:
\${fewShotExamples}
<|im_end|>
<|im_start|>user
Location: \${biomeName}
Output:<|im_end|>
<|im_start|>assistant
\`;
                } else {
`;

content = content.replace(
    /                if \(isStart\) \{[\s\S]*?                \} else \{/,
    isStartReplacement
);


// Ensure stop tags logic
const promptReplacement = `
            let formattedPrompt = "";
            const actualSystemPrompt = typeof systemPrompt === 'string' && systemPrompt.length > 0 
                ? systemPrompt 
                : \`You are the narrator of a \${theme || 'fantasy'} text adventure game. Write ONLY the story text in English. You MUST write in the second-person perspective ("You"). Limit response to 1 or 2 sentences.\`;

            // If it is a summarization task, handle it uniquely
            if (prompt.startsWith("Task: Summarize")) {
                formattedPrompt = \`<|im_start|>system\\n\${actualSystemPrompt}<|im_end|>\\n\`;
                formattedPrompt += \`<|im_start|>user\\n\${prompt}<|im_end|>\\n<|im_start|>assistant\\n\`;
            } else {
                formattedPrompt = \`<|im_start|>system\\n\${actualSystemPrompt}\\n\\nAlways end your response with exactly ONE of these tags:\\n[STATUS: NEUTRAL]\\n[STATUS: HURT]\\n[STATUS: HEALED]\\n[STATUS: ITEM]<|im_end|>\\n\`;
`;

content = content.replace(
    /            let formattedPrompt = "";[\s\S]*?            \/\/ If it is a summarization task, handle it uniquely[\s\S]*?            if \(prompt.startsWith\("Task: Summarize"\)\) \{[\s\S]*?                formattedPrompt \+= `<\|im_start\|>user\\n\$\{prompt\}<\|im_end\|>\\n<\|im_start\|>assistant\\n`;[\s\S]*?            \} else \{/,
    promptReplacement
);

// Update stop strings
content = content.replace(
    /stop_strings: \["<\|im_end\|>", "<\|im_start\|>", "Player:", "System CONCLUSION", "Tu..."\]/,
    `stop_strings: ["<|im_end|>", "<|im_start|>", "Player:", "System CONCLUSION", "Tu...", "[STATUS:", "[DAMAGE]", "[HEAL]", "[ITEM:"]`
);

fs.writeFileSync('services/cartridge/llm.worker.ts', content);
