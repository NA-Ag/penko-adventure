/**
 * SV Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Din uppgift: Fortsätt berättelsen med EXAKT 1 kort mening.
Skriv bara själva berättelsen. Inga rubriker eller förklaringar.
KRITISKT: ANVÄND INTE ENGELSKA. Språk: Svenska.
Ton: Glad och mycket enkel (CEFR A1).

Exempel:
Berättelsen hittills: Det regnar på gatan.
Spelarens handling: Jag ser mig omkring.
1 mening: Du ser neonlys som speglar sig i vattenpölarna.<|im_end|>
<|im_start|>user
Berättelsen hittills: ${history}
${systemEvent ? `Systemhändelse: ${systemEvent}` : ''}
Spelarens handling: ${action}
1 mening:<|im_start|>assistant
`;
};

/**
 * SV Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Enkel språklärare. Rätta texten. Om den är rätt, säg "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Rättning:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SV Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gör det enklare (3-5 ord).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Förenklat:<|im_end|>
<|im_start|>assistant
`;
};
