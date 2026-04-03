const fs = require('fs');
const path = require('path');

const advBeginnerDir = path.join(__dirname, 'data', 'adventure', 'beginner', 'prompts');
const eduDir = path.join(__dirname, 'data', 'educational', 'A1', 'prompts');

const batch2 = ['da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'ff', 'fi'];

function fixLanguage(langCode) {
    const advFile = path.join(advBeginnerDir, langCode, 'index.ts');
    const eduFile = path.join(eduDir, langCode, 'index.ts');

    if (!fs.existsSync(advFile) || !fs.existsSync(eduFile)) return;

    const advContent = fs.readFileSync(advFile, 'utf-8');
    const lines = advContent.split('\n');
    
    // Extractor 1: The Constraints Block
    let capturing = false;
    let constraintsLines = [];
    
    for (const line of lines) {
        if ((line.includes('${theme}') && line.includes('Penko')) || line.includes('Penko GM')) {
            capturing = true;
            continue;
        }
        if (capturing) {
            if (line.match(/(?:Ejemplo|Example|Voorbeeld|Exemple|Eksempel|Beispiel|Παράδειγμα|Näide|Adibidea|مثال|Misal|Esimerkki|Sampla|Eisimpleir|Exemplo|ઉદાહરણ|Egzanp|Példa|Օրինակ|Contoh|Dæmi|Esempio|例：|Conto|მაგალითი|Мысал|ಉದಾಹರಣೆ|예시|Mînak|Exemplum|Beispill|Ekyokulabirako|ຕົວຢ່າງ|Pavyzdys|Piemērs|Ohatra|Tauira|Пример|ഉദാഹരണം|Жишээ|ഉദാഹरण|Eżempju|ဥပမာ|Приклад|例子|K'ad):/i) || line.includes('<|im_end|>')) {
                capturing = false;
            } else if (line.trim() !== '') {
                constraintsLines.push(line);
            }
        }
    }
    const constraints = constraintsLines.join('\n');

    // Extractor 2: The Final Prompt Line (1 sentence: / Continue the story:)
    const userBlockMatch = advContent.match(/<\|im_start\|>user\n([\s\S]+?)<\|im_end\|>/);
    let promptEndLine = "1 sentence:";
    
    if (userBlockMatch) {
        const userBlockLines = userBlockMatch[1].trim().split('\n');
        const lastLine = userBlockLines[userBlockLines.length - 1].trim();
        
        if (lastLine.includes('<|im_start|>assistant')) {
            promptEndLine = lastLine.replace('<|im_start|>assistant', '').trim();
        } else {
            promptEndLine = lastLine;
        }
    }
    
    if (promptEndLine.includes('}')) {
        const parts = promptEndLine.split('}');
        promptEndLine = parts[parts.length-1].trim();
    }

    // Extractor 3: Grammar & Simplify functions
    let grammarContent = "";
    const grammarMatch = advContent.match(/export const grammar = [^{]+{\s+return `([\s\S]+?)`;/);
    if (grammarMatch) grammarContent = grammarMatch[1];

    let simplifyContent = "";
    const simplifyMatch = advContent.match(/export const simplify = [^{]+{\s+return `([\s\S]+?)`;/);
    if (simplifyMatch) simplifyContent = simplifyMatch[1];

    // Read the target Educational file and completely wipe the old functions
    const eduContent = fs.readFileSync(eduFile, 'utf-8');
    const splitIndex = eduContent.indexOf('export const narrative');
    if (splitIndex === -1) return;
    
    const cleanHeader = eduContent.substring(0, splitIndex).trim();

    // Assemble pristine new file
    const newNarrative = `
export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return \`<|im_start|>system
\${levelName} - Penko.
\${local.role}

\${local.title}
\${local.objectives.join(', ')}

${constraints}
<|im_end|>
<|im_start|>user
\${history}
\${systemEvent ? \`\${systemEvent}\` : ''}
\${action}
${promptEndLine}<|im_end|>
<|im_start|>assistant
\`;
};
`;

    const newGrammar = `
export const grammar = (userInput: string): string => {
    return \`${grammarContent}\`;
};
`;

    const newSimplify = `
export const simplify = (narrativeText: string): string => {
    return \`${simplifyContent}\`;
};
`;

    fs.writeFileSync(eduFile, cleanHeader + "\n" + newNarrative + newGrammar + newSimplify);
}

batch2.forEach(langCode => {
    fixLanguage(langCode);
    console.log(`Re-built batch 2 language: ${langCode}`);
});
