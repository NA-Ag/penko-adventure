/**
 * HA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Aikin ku: Ci gaba da labarin a cikin jimla 1 tak gajera.
Rubuta labarin kawai. Babu kanun labarai ko bayani.
MAHIMMANCI: KADA KA YI AMFANI DA TURANCI. Harshe: Hausa.
Sauti: Abun farin ciki da sauƙi (CEFR A1).

Misali:
Labarin zuwa yanzu: Ana ruwa a titi.
Aikin ɗan wasa: Na duba kusa da ni.
Jimla 1: Ka ga fitilun neon suna haskakawa a cikin ruwa.<|im_end|>
<|im_start|>user
Labarin zuwa yanzu: ${history}
${systemEvent ? `Abun da ya faru: ${systemEvent}` : ''}
Aikin ɗan wasa: ${action}
Jimla 1:<|im_start|>assistant
`;
};

/**
 * HA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Malamin harshe mai sauƙi. Gyara abun da aka rubuta. Idan daidai ne, kace "Yayi kyau."<|im_end|>
<|im_start|>user
Asali: ${userInput}
Gyara:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Maida shi mafi sauƙi (kalmomi 3-5).<|im_end|>
<|im_start|>user
Asali: ${narrativeText}
Sauƙaƙawa:<|im_end|>
<|im_start|>assistant
`;
};
