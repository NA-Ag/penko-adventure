/**
 * SO Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Shaqadaada: Sii wad sheekada 1 weedh oo gaaban oo kaliya.
Qor sheekada oo kaliya. Wax cinwaano ah ama sharaxaad ah ma jiraan.
MUHIIM: HA ISTICMAALIN INGIRIISI. Luqadda: Soomaali.
Codka: Farxad leh oo aad u fudud (CEFR A1).

Tusaale:
Sheekada ilaa hadda: Roob ayaa ku da'aya wadada.
Ficilka ciyaartoyga: Hareerahayga ayaan eegayaa.
1 weedh: Waxaad arkaysaa laydhadhka neoonka oo ku dhex milmaya biyaha.<|im_end|>
<|im_start|>user
Sheekada ilaa hadda: ${history}
${systemEvent ? `Dhacdada Nidaamka: ${systemEvent}` : ''}
Ficilka ciyaartoyga: ${action}
1 weedh:<|im_start|>assistant
`;
};

/**
 * SO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Macallin luqadeed oo fudud. Sax gelinta. Haddii ay sax tahay, dheh "Waa sax."<|im_end|>
<|im_start|>user
Asalka: ${userInput}
Sixidda:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SO Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Ka dhig mid ka fudud (3-5 eray).<|im_end|>
<|im_start|>user
Asalka: ${narrativeText}
Fududayn:<|im_end|>
<|im_start|>assistant
`;
};
