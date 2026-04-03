/**
 * DA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Din opgave: Fortsæt historien med PRÆCIS 1 kort sætning.
Skriv kun selve historien. Ingen overskrifter eller forklaringer.
KRITISK: BRUG IKKE ENGELSK. Sprog: Dansk.
Tone: Glad og meget simpel (CEFR A1).

Eksempel:
Historien indtil nu: Regnen falder på gaden.
Spillerens handling: Jeg ser mig omkring.
1 sætning: Du ser neonlys, der spejler sig i vandpytterne.<|im_end|>
<|im_start|>user
Historien indtil nu: ${history}
${systemEvent ? `Systemhændelse: ${systemEvent}` : ''}
Spillerens handling: ${action}
1 sætning:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * DA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Enkel sproglærer. Ret inputtet. Hvis det er korrekt, skal du sige "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Rettelse:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * DA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gør det mere simpelt (3-5 ord).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Forenklet:<|im_end|>
<|im_start|>assistant
`;
};
