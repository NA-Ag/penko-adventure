/**
 * DE Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Deine Aufgabe: Setze die Geschichte in GENAU 1 kurzen Satz fort.
Schreibe nur die Geschichte. Keine Header oder Erklärungen.
KRITISCH: KEIN ENGLISCH VERWENDEN. Sprache: Deutsch.
Tonfall: Fröhlich und sehr einfach (CEFR A1).

Beispiel:
Bisherige Geschichte: Regen fällt auf die Straße.
Spieleraktion: Ich schaue mich um.
1 Satz: Du siehst Neonlichter, die sich in den Pfützen spiegeln.<|im_end|>
<|im_start|>user
Bisherige Geschichte: ${history}
${systemEvent ? `Systemereignis: ${systemEvent}` : ''}
Spieleraktion: ${action}
1 Satz:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * DE Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Einfacher Sprachlehrer. Korrigiere die Eingabe. Wenn sie korrekt ist, sage "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Korrektur:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * DE Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Mache es einfacher (3-5 Wörter).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Vereinfacht:<|im_end|>
<|im_start|>assistant
`;
};
