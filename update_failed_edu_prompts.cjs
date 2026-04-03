const fs = require('fs');
const path = require('path');

const advBeginnerDir = path.join(__dirname, 'data', 'adventure', 'beginner', 'prompts');
const eduDir = path.join(__dirname, 'data', 'educational');

const targetLevels = ['A1', 'JLPT_N5', 'HSK_1'];

const failedLanguages = [
  'af', 'am', 'ar', 'az', 'bg', 'bn', 'bo', 'ca', 'cs', 'cy', 'ha', 'he', 'hi',
  'hr', 'km', 'ky', 'mr', 'ne', 'no', 'nv', 'ny', 'om', 'or', 'pa', 'pl', 'ps',
  'pt', 'ro', 'rw', 'sd', 'si', 'sk', 'sl', 'sn', 'so', 'sq', 'sr', 'st', 'su',
  'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tl', 'tr', 'ur', 'uz', 'vi', 'yi', 'yo',
  'yue', 'zu'
];

function processLanguage(langCode, levelDir) {
    const advFile = path.join(advBeginnerDir, langCode, 'index.ts');
    const eduFile = path.join(levelDir, 'prompts', langCode, 'index.ts');

    if (!fs.existsSync(advFile) || !fs.existsSync(eduFile)) return;

    const advContent = fs.readFileSync(advFile, 'utf-8');
    let eduContent = fs.readFileSync(eduFile, 'utf-8');

    // Robust extraction: get lines between Penko definition and Example block
    const lines = advContent.split('\n');
    let capturing = false;
    let constraintsLines = [];
    let sentence1Line = "1 sentence:";

    for (const line of lines) {
        if (line.includes('${theme} - Penko') || line.includes("Penko GM")) {
            capturing = true;
            continue; // Skip the Penko line, we'll add it back manually
        }
        
        if (capturing) {
            // Stop capturing when we hit the Example block or end of system prompt
            if (line.match(/(?:Ejemplo|Example|Voorbeeld|Exemple|Eksempel|Beispiel|Παράδειγμα|Näide|Adibidea|مثال|Misal|Esimerkki|Sampla|Eisimpleir|Exemplo|ઉદાહરણ|Egzanp|Példa|Օրինակ|Contoh|Dæmi|Esempio|例：|Conto|მაგალითი|Мысал|ಉದಾಹರಣೆ|예시|Mînak|Exemplum|Beispill|Ekyokulabirako|ຕົວຢ່າງ|Pavyzdys|Piemērs|Ohatra|Tauira|Пример|ഉദാഹരണം|Жишээ|ഉദാഹरण|Eżempju|ဥပမာ|Приклад|例子|K'ad):/i) || line.includes('<|im_end|>')) {
                capturing = false;
            } else if (line.trim() !== '') {
                constraintsLines.push(line);
            }
        }

        // Try to capture the "1 sentence:" equivalent near the end of the user block
        if (line.includes('<|im_start|>assistant') || line.includes('<|im_end|>')) {
            const match = line.match(/(.+?:)/);
            if (match && !line.includes('Ejemplo') && !line.includes('user')) {
                // Not ideal, we'll use a better regex for the sentence line
            }
        }
    }
    
    // Better extraction for the '1 sentence:' line
    const sentenceMatch = advContent.match(/([^\n]+:\s*)(?=<\|im_start|>assistant|<\|im_end|>)/);
    if (sentenceMatch) {
       sentence1Line = sentenceMatch[1].trim();
       if (sentence1Line.includes('}')) {
          const parts = sentence1Line.split('}');
          sentence1Line = parts[parts.length-1].trim();
       }
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

    // Now rewrite the educational narrative prompt to use the exact beginner constraints
    const newNarrative = `export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return \`<|im_start|>system
\${levelName} - Penko.
\${local.role}

\${local.title}
\${local.objectives.join(', ')}

\${constraints}
<|im_end|>
<|im_start|>user
\${history}
\${systemEvent ? \`\${systemEvent}\` : ''}
\${action}
\${sentence1Line}<|im_start|>assistant
\`;
};`;

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
    console.log(`Updated ${langCode} in ${levelDir}`);
}

targetLevels.forEach(level => {
    const levelDir = path.join(eduDir, level);
    failedLanguages.forEach(langCode => {
        processLanguage(langCode, levelDir);
    });
});
