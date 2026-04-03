/**
 * NL Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Jouw taak: Zet het verhaal voort in PRECIES 1 korte zin.
Schrijf alleen het verhaal. Geen koppen of uitleg.
CRITIEK: GEBRUIK GEEN ENGELS. Taal: Nederlands.
Toon: Vrolijk en heel eenvoudig (CEFR A1).

Voorbeeld:
Verhaal tot nu toe: Het regent op straat.
Actie van de speler: Ik kijk om me heen.
1 zin: Je ziet neonlichten reflecteren in de plassen.<|im_end|>
<|im_start|>user
Verhaal tot nu toe: ${history}
${systemEvent ? `Systeemgebeurtenis: ${systemEvent}` : ''}
Actie van de speler: ${action}
1 zin:<|im_start|>assistant
`;
};

/**
 * NL Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Eenvoudige taaldocent. Corrigeer de invoer. Als het correct is, zeg "Perfect."<|im_end|>
<|im_start|>user
Origineel: ${userInput}
Correctie:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NL Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Maak het eenvoudiger (3-5 woorden).<|im_end|>
<|im_start|>user
Origineel: ${narrativeText}
Vereenvoudigd:<|im_end|>
<|im_start|>assistant
`;
};
