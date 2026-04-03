const fs = require('fs');
const path = require('path');

const advBeginnerDir = path.join(__dirname, 'data', 'adventure', 'beginner', 'prompts');
const eduDir = path.join(__dirname, 'data', 'educational');

const targetLevels = ['A1', 'JLPT_N5', 'HSK_1'];

function processLanguage(langCode, levelDir) {
    const advFile = path.join(advBeginnerDir, langCode, 'index.ts');
    const eduFile = path.join(levelDir, 'prompts', langCode, 'index.ts');

    if (!fs.existsSync(advFile) || !fs.existsSync(eduFile)) return;

    const advContent = fs.readFileSync(advFile, 'utf-8');
    let eduContent = fs.readFileSync(eduFile, 'utf-8');

    // Extract constraints from adventure beginner narrative
    // Looking for everything between "Tu tarea:" or "Your task:" and "Ejemplo:" or "Example:"
    const taskMatch = advContent.match(/(?:Tu tarea:|Your task:|Jouw taak:|Votre tâche :|Din opgave:|Deine Aufgabe:|Η αποστολή σας:|Sinu ülesanne:|Zure lana:|وظیفه شما:|Kuugal maa:|Tehtäväsi:|Do thasc:|An obair agad:|A túa tarefa:|તમારું કાર્ય:|Aikin ku:|Kāu hana:|המשימה שלך:|आपका कार्य:|Tvoj zadatak:|Travay ou:|A feladatod:|Ձեր խնդիրը.|Tugas Anda:|Ọrụ gị:|Verkefni þitt:|Il tuo compito:|あなたのタスク：|Tugas sampeyan:|თქვენი დავალება:|Тапсырмаңыз:|ភារកិច្ចរបស់អ្នក៖|ನಿಮ್ಮ ಕೆಲಸ:|당신의 임무:|Karê te:|Сиздин тапшырмаңыз:|Munus tuum:|Är Aufgab:|Omulimu gwo:|ໜ້າທີ່ຂອງທ່ານ:|Jūsų užduotis:|Tavs uzdevums:|Ny asanao:|Tō mahi:|Твојата задача:|നിങ്ങളുടെ ചുമതല:|Таны даалгавар:|तुमचे कार्य:|Tugas anda:|Ix-xogħol tiegħek:|သင်၏တာဝန်-|तपाईंको काम:|Naanish:|Ntchito yanu:|Hojiin kee:|ଆପଣଙ୍କ କାର୍ଯ୍ୟ:|ਤੁਹਾਡਾ ਕੰਮ:|Twoje zadanie:|Ваша задача:|Ваше завдання:|任务：|Sarcina ta:|Tasca:).+?(?=\n\n(?:Ejemplo:|Example:|Voorbeeld:|Exemple :|Eksempel:|Beispiel:|Παράδειγμα:|Näide:|Adibidea:|مثال:|Misal:|Esimerkki:|Sampla:|Eisimpleir:|Exemplo:|ઉદાહરણ:|Egzanp:|Példa:|Օրինակ.|Contoh:|Dæmi:|Esempio:|例：|Conto:|მაგალითი:|Мысал:|ಉದಾಹರಣೆ:|예시:|Mînak:|Exemplum:|Beispill:|Ekyokulabirako:|ຕົວຢ່າງ:|Pavyzdys:|Piemērs:|Ohatra:|Tauira:|Пример:|ഉദാഹരണം:|Жишээ:|ഉദാഹरण:|Eżempju:|ဥပမာ-|Приклад:|例子：))/s);
    
    let constraints = "";
    let systemLine = "";
    let sentence1Line = "1 sentence:"; // Fallback
    
    if (taskMatch) {
        constraints = taskMatch[0];
    } else {
        console.warn(`Could not extract constraints for ${langCode}`);
        // Fallback simple extraction
        const lines = advContent.split('\n');
        let capturing = false;
        let cLines = [];
        for (const line of lines) {
            if (line.includes('${theme} - Penko.')) capturing = true;
            else if (capturing && (line.startsWith('Ejemplo:') || line.startsWith('Example:') || line.trim() === '')) {
                break;
            } else if (capturing) {
                cLines.push(line);
            }
        }
        constraints = cLines.join('\n');
    }

    // Extract the "1 sentence:" equivalent
    const sentenceMatch = advContent.match(/(?:1 oración:|1 sentence:|1 zin:|1 phrase :|1 sætning:|1 Satz:|1 πρόταση:|1 lause:|Esaldi 1:|۱ جمله:|Bolle gootel:|1 fraz:|1 mondat:|1 նախադասություն.|Ahịrịokwu 1:|1つの文：|1 ukara:|1 წინადადება:|1 сөйлем:|១ ប្រយោគ៖|೧ ವಾಕ್ಯ:|1문장:|1 hevok:|1 сүйлөм:|Sententia 1:|1 Saz:|Ssentensi 1:|1 ປະໂຫຍກ:|1 sakinys:|1 teikums:|Fehezanteny 1:|Rerenga kōrero 1:|1 реченица:|1 വാചകം:|1 өгүүлбэр:|१ वाक्य:|1 ayat:|Sentenza 1:|၁ ဝါကျ-|۱ वाक्य:|1 saad:|Chiganizo 1:|Hima 1:|୧ଟି ବାକ୍ୟ:|੧ ਵਾਕ:|1 zdanie:|1 предложение:|1 речення:|1个句子:)/);
    if (sentenceMatch) {
        sentence1Line = sentenceMatch[0];
    }

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
    fs.readdirSync(advBeginnerDir).forEach(langCode => {
        const langPath = path.join(advBeginnerDir, langCode);
        if (fs.statSync(langPath).isDirectory()) {
            processLanguage(langCode, levelDir);
        }
    });
});
