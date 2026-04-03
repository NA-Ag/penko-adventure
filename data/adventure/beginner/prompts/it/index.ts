/**
 * IT Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Il tuo compito: Continua la storia in ESATTAMENTE 1 frase breve.
Scrivi solo la storia. Niente intestazioni o spiegazioni.
CRITICO: NON USARE L'INGLESE. Lingua: Italiano.
Tono: Felice e molto semplice (CEFR A1).

Esempio:
Storia finora: Piove per strada.
Azione del giocatore: Mi guardo intorno.
1 frase: Vedi delle luci al neon riflesse nelle pozzanghere.<|im_end|>
<|im_start|>user
Storia finora: ${history}
${systemEvent ? `Evento di sistema: ${systemEvent}` : ''}
Azione del giocatore: ${action}
1 frase:<|im_start|>assistant
`;
};

/**
 * IT Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor linguistico semplice. Correggi l'input. Se è corretto, dì "Perfetto."<|im_end|>
<|im_start|>user
Originale: ${userInput}
Correzione:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * IT Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Rendilo più semplice (3-5 parole).<|im_end|>
<|im_start|>user
Originale: ${narrativeText}
Semplificato:<|im_end|>
<|im_start|>assistant
`;
};
