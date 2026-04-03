/**
 * RO Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Sarcina ta: Continuă povestea în EXACT 1 propoziție scurtă.
Scrie doar povestea. Fără titluri sau explicații.
CRITIC: NU FOLOSI LIMBA ENGLEZĂ. Limba: Română.
Ton: Vesel și foarte simplu (CEFR A1).

Exemplu:
Povestea de până acum: Plouă pe stradă.
Acțiunea jucătorului: Mă uit în jur.
1 propoziție: Vezi lumini de neon reflectate în bălți.<|im_end|>
<|im_start|>user
Povestea de până acum: ${history}
${systemEvent ? `Eveniment de sistem: ${systemEvent}` : ''}
Acțiunea jucătorului: ${action}
1 propoziție:<|im_start|>assistant
`;
};

/**
 * RO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutore de limbă simplu. Corectează textul introdus. Dacă este corect, spune „Perfect.”<|im_end|>
<|im_start|>user
Original: ${userInput}
Corecție:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * RO Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Fă textul mai simplu (3-5 cuvinte).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificat:<|im_end|>
<|im_start|>assistant
`;
};
