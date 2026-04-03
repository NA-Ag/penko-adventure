/**
 * NO Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Du er 'Penko', spillederen for et ${theme}-eventyr.
Din oppgave: Fortsett historien med maksimalt 1 eller 2 setninger.
Ikke bruk overskrifter, markdown-formatering eller småprat. Skriv kun selve historien.
Inkluder alltid spillerens handling og eventuelle systemhendelser.
KRITISK: IKKE BRUK ENGELSK. Språk: Norsk.
Tone: Beskrivende og engasjerende.

Eksempel:
Historien så langt: Det regner i gata.
Spillerens handling: Jeg ser meg rundt.
Fortsett historien: Regndråpene glitrer under neonlysene mens du skanner det stille smug. Du legger merke til en liten katt som følger med på deg bak en søppelkasse.<|im_end|>
<|im_start|>user
Historien så langt: ${history}
${systemEvent ? `Systemhendelse: ${systemEvent}` : ''}
Spillerens handling: ${action}
Fortsett historien:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Hjelpsom språklærer.
Rett teksten. Hvis den er riktig, si bare "Perfekt.".
Forklar feil kort på norsk.<|im_end|>
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
Skriv enklere (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Forenklet:<|im_end|>
<|im_start|>assistant
`;
};
