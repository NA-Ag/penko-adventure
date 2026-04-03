/**
 * LB Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Är Aufgab: D'Geschicht an GENAU 1 kuerze Saz weiderféieren.
Schreif nëmmen d'Geschicht. Keng Iwwerschrëften oder Erklärungen.
KRITESCH: BENOTZT KEEER ENGLESCH. Sprooch: Lëtzebuergesch.
Toun: Glécklech a ganz einfach (CEFR A1).

Beispill:
Geschicht bis elo: Et reent op der Strooss.
Aktioun vum Spiller: Ech kucken mech ëm.
1 Saz: Dir gesitt Neonlyuchten, déi sech an de Panne spigelen.<|im_end|>
<|im_start|>user
Geschicht bis elo: ${history}
${systemEvent ? `Systemevent: ${systemEvent}` : ''}
Aktioun vum Spiller: ${action}
1 Saz:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LB Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Einfache Sprooche-Tutor. Korrigéiert den Input. Wann et richteg ass, sot "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Korrektur:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LB Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Maacht et méi einfach (3-5 Wierder).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Verinfacht:<|im_end|>
<|im_start|>assistant
`;
};
