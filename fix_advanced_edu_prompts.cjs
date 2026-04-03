const fs = require('fs');
const path = require('path');

const advAdvancedDir = path.join(__dirname, 'data', 'adventure', 'advanced', 'prompts');
const eduDir = path.join(__dirname, 'data', 'educational');

const targetLevels = [
    'A2', 'B1', 'B2', 'C1', 'C2', 
    'JLPT_N4', 'JLPT_N3', 'JLPT_N2', 'JLPT_N1', 
    'HSK_2', 'HSK_3', 'HSK_4', 'HSK_5', 'HSK_6'
];

const allLanguages = fs.readdirSync(advAdvancedDir).filter(f => fs.statSync(path.join(advAdvancedDir, f)).isDirectory());

function processLanguage(langCode, levelDir) {
    const advFile = path.join(advAdvancedDir, langCode, 'index.ts');
    const eduFile = path.join(levelDir, 'prompts', langCode, 'index.ts');

    if (!fs.existsSync(advFile) || !fs.existsSync(eduFile)) return;

    const advContent = fs.readFileSync(advFile, 'utf-8');
    let eduContent = fs.readFileSync(eduFile, 'utf-8');

    // Robust extraction: get lines between Penko definition and Example block
    const lines = advContent.split('\n');
    let capturing = false;
    let constraintsLines = [];
    let continueLine = "Continue the story:";

    for (const line of lines) {
        if ((line.includes('${theme}') && line.includes('Penko')) || line.includes('Penko GM')) {
            capturing = true;
            continue; // Skip the Penko line
        }
        
        if (capturing) {
            // Stop capturing when we hit the Example block or end of system prompt
            if (line.match(/(?:Ejemplo|Example|Voorbeeld|Exemple|Eksempel|Beispiel|Παράδειγμα|Näide|Adibidea|مثال|Misal|Esimerkki|Sampla|Eisimpleir|Exemplo|ઉદાહરણ|Egzanp|Példa|Օրինակ|Contoh|Dæmi|Esempio|例：|Conto|მაგალითი|Мысал|ಉದಾಹರಣೆ|예시|Mînak|Exemplum|Beispill|Ekyokulabirako|ຕົວຢ່າງ|Pavyzdys|Piemērs|Ohatra|Tauira|Пример|ഉദാഹരണം|Жишээ|ഉദാഹरण|Eżempju|ဥပမာ|Приклад|例子|K'ad):/i) || line.includes('<|im_end|>')) {
                capturing = false;
            } else if (line.trim() !== '') {
                constraintsLines.push(line);
            }
        }
    }
    
    // Better extraction for the 'Continue the story:' line
    // Search backwards from <|im_start|>assistant
    const assistantIndex = lines.findIndex(l => l.includes('<|im_start|>assistant'));
    if (assistantIndex > 0) {
        let prevLine = lines[assistantIndex - 1];
        if (prevLine.includes('<|im_end|>')) {
            const match = prevLine.match(/(.*?)(?:<\|im_end\|>)/);
            if (match && match[1].trim()) {
                continueLine = match[1].trim();
            } else {
                 // if it's just <|im_end|>, the actual prompt is on the line above
                 continueLine = lines[assistantIndex - 2].trim();
            }
        } else {
            continueLine = prevLine.trim();
        }
    }

    // Clean up template literal injections in continue line
    if (continueLine.includes('}')) {
        const parts = continueLine.split('}');
        continueLine = parts[parts.length-1].trim();
    }

    const constraints = constraintsLines.join('\n');

    // Extract Grammar prompt content
    const grammarContentMatch = advContent.match(/export const grammar = [^{]+{\s+return `([\s\S]+?)`;/);
    let grammarContent = "";
    if (grammarContentMatch) {
        grammarContent = grammarContentMatch[1];
    }

    // Extract Simplify prompt content
    const simplifyContentMatch = advContent.match(/export const simplify = [^{]+{\s+return `([\s\S]+?)`;/);
    let simplifyContent = "";
    if (simplifyContentMatch) {
        simplifyContent = simplifyContentMatch[1];
    }

    const newNarrative = "export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {\n" +
"    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };\n\n" +
"    return `<|im_start|>system\n" +
"${levelName} - Penko.\n" +
"${local.role}\n\n" +
"${local.title}\n" +
"${local.objectives.join(', ')}\n\n" +
constraints + "\n" +
"<|im_end|>\n" +
"<|im_start|>user\n" +
"${history}\n" +
"${systemEvent ? `${systemEvent}` : ''}\n" +
"${action}\n" +
continueLine + "<|im_end|>\n<|im_start|>assistant\n" +
"`;\n" +
"};";


    // Replace the narrative function in eduContent
    eduContent = eduContent.replace(/export const narrative = [\s\S]+?};\n/s, newNarrative + '\n');
    
    // Replace grammar function
    if (grammarContent) {
        eduContent = eduContent.replace(/export const grammar = [\s\S]+?};\n/s, `export const grammar = (userInput: string): string => {\n    return \`${grammarContent}\`;\n};\n`);
    }

    // Replace simplify function
    if (simplifyContent) {
        eduContent = eduContent.replace(/export const simplify = [\s\S]+?};\n/s, `export const simplify = (narrativeText: string): string => {\n    return \`${simplifyContent}\`;\n};\n`);
    }

    fs.writeFileSync(eduFile, eduContent);
}

targetLevels.forEach(level => {
    const levelDir = path.join(eduDir, level);
    if (!fs.existsSync(levelDir)) return;
    
    allLanguages.forEach(langCode => {
        processLanguage(langCode, levelDir);
    });
    console.log(`Updated ${level} prompts.`);
});
