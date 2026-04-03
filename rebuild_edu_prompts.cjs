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

    // 1. Read the source Adventure file to extract constraints
    const advContent = fs.readFileSync(advFile, 'utf-8');
    const lines = advContent.split('\n');
    let capturing = false;
    let constraintsLines = [];
    let promptEndLine = isBeginner ? "1 sentence:" : "Continue the story:";

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

    // Extract the final prompt line ("1 sentence:" or "Continue the story:")
    const assistantIndex = lines.findIndex(l => l.includes('<|im_start|>assistant'));
    if (assistantIndex > 0) {
        let prevLine = lines[assistantIndex - 1];
        if (prevLine.includes('<|im_end|>')) {
            const match = prevLine.match(/(.*?)(?:<\|im_end\|>)/);
            if (match && match[1].trim()) {
                promptEndLine = match[1].trim();
            } else {
                 promptEndLine = lines[assistantIndex - 2].trim();
            }
        } else {
            promptEndLine = prevLine.replace('<|im_start|>assistant', '').trim();
        }
    }

    if (promptEndLine.includes('}')) {
        const parts = promptEndLine.split('}');
        promptEndLine = parts[parts.length-1].trim();
    }

    const constraints = constraintsLines.join('\n');

    // Extract Grammar & Simplify prompt functions safely
    let grammarContent = "";
    const grammarMatch = advContent.match(/export const grammar = [^{]+{\s+return `([\s\S]+?)`;/);
    if (grammarMatch) grammarContent = grammarMatch[1];

    let simplifyContent = "";
    const simplifyMatch = advContent.match(/export const simplify = [^{]+{\s+return `([\s\S]+?)`;/);
    if (simplifyMatch) simplifyContent = simplifyMatch[1];

    // 2. Read the corrupted Educational file and truncate everything from 'export const narrative' downwards
    const eduContent = fs.readFileSync(eduFile, 'utf-8');
    const splitIndex = eduContent.indexOf('export const narrative');
    if (splitIndex === -1) {
        console.warn(`Could not find 'export const narrative' in ${eduFile}. Skipping.`);
        return;
    }
    
    // This gives us ONLY the imports and the LOCALIZED_SCENARIOS object.
    const cleanHeader = eduContent.substring(0, splitIndex).trim();

    // 3. Build the perfect Narrative function string
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

    // 4. Build Grammar and Simplify strings
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

    // 5. Combine and overwrite
    const finalFileContent = cleanHeader + "\n" + newNarrative + newGrammar + newSimplify;
    fs.writeFileSync(eduFile, finalFileContent);
}

// Run for all levels
allLevels.forEach(level => {
    const isBeginner = beginnerLevels.includes(level);
    allLanguages.forEach(langCode => {
        processLanguage(langCode, level, isBeginner);
    });
    console.log(`Successfully rebuilt ${level} prompts.`);
});
