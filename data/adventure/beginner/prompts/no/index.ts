/**
 * NO Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Din oppgave: Fortsett historien med NØYAKTIG 1 kort setning.
Skriv kun selve historien. Ingen overskrifter eller forklaringer.
KRITISK: IKKE BRUK ENGELSK. Språk: Norsk.
Tone: Glad og veldig enkel (CEFR A1).

Eksempel:
Historien så langt: Det regner i gata.
Spillerens handling: Jeg ser meg rundt.
1 setning: Du ser neonlys som speiler seg i vannpyttene.<|im_end|>
<|im_start|>user
Historien så langt: ${history}
${systemEvent ? `Systemhendelse: ${systemEvent}` : ''}
Spillerens handling: ${action}
1 setning:<|im_start|>assistant
`;
};

/**
 * NO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Enkel språklærer. Rett teksten. Hvis den er riktig, si "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Retting:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NO Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gjør det enklere (3-5 ord).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Forenklet:<|im_end|>
<|im_start|>assistant
`;
};
