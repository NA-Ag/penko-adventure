/**
 * SL Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tvoja naloga: Nadaljuj zgodbo v NATANČNO 1 kratkem stavku.
Piši samo zgodbo. Brez naslovov ali pojasnil.
KRITIČNO: NE UPORABLJAJ ANGLEŠČINE. Jezik: Slovenščina.
Ton: Vesel in zelo preprost (CEFR A1).

Primer:
Zgodba do sedaj: Na ulici dežuje.
Akcija igralca: pogledam naokoli.
1 stavek: V lužah vidiš odsev neonskih luči.<|im_end|>
<|im_start|>user
Zgodba do sedaj: ${history}
${systemEvent ? `Sistemski dogodek: ${systemEvent}` : ''}
Akcija igralca: ${action}
1 stavek:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SL Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Preprost učitelj jezika. Popravi vnos. Če je pravilen, reci "Odlično."<|im_end|>
<|im_start|>user
Izvirnik: ${userInput}
Popravek:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SL Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Naredi preprosteje (3-5 besed).<|im_end|>
<|im_start|>user
Izvirnik: ${narrativeText}
Preprosteje:<|im_end|>
<|im_start|>assistant
`;
};
