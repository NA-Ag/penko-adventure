/**
 * AF Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Jou taak: Voer die storie voort in PRESIES 1 kort sin.
Skryf net die storie. Geen opskrifte of verduidelikings nie.
KRITIES: GEEN ENGELS. Taal: Afrikaans.
Toon: Gelukkig en baie eenvoudig (CEFR A1).

Voorbeeld:
Storie tot dusver: Reën val op die straat.
Speleraksie: Ek kyk rond.
1 sin: Jy sien neonligte wat in die plasse reflekteer.<|im_end|>
<|im_start|>user
Storie tot dusver: ${history}
${systemEvent ? `Stelselgebeurtenis: ${systemEvent}` : ''}
Speleraksie: ${action}
1 sin:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AF Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Eenvoudige taalonderwyser. Korrigeer foute. As dit reg is, sê "Perfek."<|im_end|>
<|im_start|>user
Oorspronklik: ${userInput}
Regstelling:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AF Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Maak dit eenvoudiger (3-5 woorde).<|im_end|>
<|im_start|>user
Oorspronklik: ${narrativeText}
Vereenvoudig:<|im_end|>
<|im_start|>assistant
`;
};
