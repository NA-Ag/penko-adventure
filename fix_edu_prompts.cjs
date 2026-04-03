const fs = require('fs');
const path = require('path');

const advBeginnerDir = path.join(__dirname, 'data', 'adventure', 'beginner', 'prompts');
const eduDir = path.join(__dirname, 'data', 'educational');

const targetLevels = ['A1', 'JLPT_N5', 'HSK_1'];

const allLanguages = fs.readdirSync(advBeginnerDir).filter(f => fs.statSync(path.join(advBeginnerDir, f)).isDirectory());

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

    // Use string concatenation to avoid template literal issues in the generated code
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
sentence1Line + "<|im_start|>assistant\n" +
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
    console.log(`Fixed ${langCode} in ${levelDir}`);
}

targetLevels.forEach(level => {
    const levelDir = path.join(eduDir, level);
    allLanguages.forEach(langCode => {
        processLanguage(langCode, levelDir);
    });
});
