/**
 * CA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
La teva tasca: Continuar la història en EXACTAMENT 1 oració curta.
Escriu només la història. Sense encapçalaments ni explicacions.
CRÍTIC: NO UTILITZIS L'ANGLÈS. Idioma: Català.
To: Alegre i molt senzill (CEFR A1).

Exemple:
Història fins ara: La pluja cau al carrer.
Acció del jugador: Miro al meu voltant.
1 oració: Veus llums de neó reflectits en els basals.<|im_end|>
<|im_start|>user
Història fins ara: ${history}
${systemEvent ? `Esdeveniment del sistema: ${systemEvent}` : ''}
Acció del jugador: ${action}
1 oració:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * CA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor d'idiomes senzill. Corregeix l'entrada. Si és correcta, digues "Perfecte."<|im_end|>
<|im_start|>user
Original: ${userInput}
Correcció:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * CA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Fes-ho més senzill (3-5 paraules).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificat:<|im_end|>
<|im_start|>assistant
`;
};
