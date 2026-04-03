const fs = require('fs');
const path = require('path');

const advBeginnerDir = path.join(__dirname, 'data', 'adventure', 'beginner', 'prompts');
const advAdvancedDir = path.join(__dirname, 'data', 'adventure', 'advanced', 'prompts');
const eduDir = path.join(__dirname, 'data', 'educational');

const beginnerLevels = ['A1', 'JLPT_N5', 'HSK_1'];
const advancedLevels = [
    'A2', 'B1', 'B2', 'C1', 'C2', 
    'JLPT_N4', 'JLPT_N3', 'JLPT_N2', 'JLPT_N1', 
    'HSK_2', 'HSK_3', 'HSK_4', 'HSK_5', 'HSK_6'
];

const allLevels = [...beginnerLevels, ...advancedLevels];
const allLanguages = fs.readdirSync(advBeginnerDir).filter(f => fs.statSync(path.join(advBeginnerDir, f)).isDirectory());

function processLanguage(langCode, levelName, isBeginner) {
    const sourceDir = isBeginner ? advBeginnerDir : advAdvancedDir;
    const advFile = path.join(sourceDir, langCode, 'index.ts');
    const eduFile = path.join(eduDir, levelName, 'prompts', langCode, 'index.ts');

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
    // We will do this by explicitly parsing the user block string.
    const userBlockMatch = advContent.match(/<\|im_start\|>user\n([\s\S]+?)<\|im_end\|>/);
    let promptEndLine = isBeginner ? "1 sentence:" : "Continue the story:";
    
    if (userBlockMatch) {
        const userBlockLines = userBlockMatch[1].trim().split('\n');
        // The last line of the user block is our promptEndLine
        const lastLine = userBlockLines[userBlockLines.length - 1].trim();
        
        // Sometimes it has <|im_start|>assistant attached to it due to missing newlines in source
        if (lastLine.includes('<|im_start|>assistant')) {
            promptEndLine = lastLine.replace('<|im_start|>assistant', '').trim();
        } else {
            promptEndLine = lastLine;
        }
    }
    
    // Clean out variable injections if they accidentally leaked in
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

allLevels.forEach(level => {
    const isBeginner = beginnerLevels.includes(level);
    allLanguages.forEach(langCode => {
        processLanguage(langCode, level, isBeginner);
    });
    console.log(`Successfully hard-rebuilt ${level} prompts.`);
});
