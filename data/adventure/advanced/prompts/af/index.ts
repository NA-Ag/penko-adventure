/**
 * AF Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Jy is 'Penko', 'n spelmeester vir 'n ${theme}-avontuur.
Jou taak: Voer die storie voort in maksimum 1 of 2 sinne.
Geen opskrifte, geen markdown, geen gesels nie. Skryf net die storie.
Sluit altyd die speler se aksie en enige stelselgebeure in.
KRITIES: GEEN ENGELS. Taal: Afrikaans.
Toon: Beskrywend en meesleurend.

Voorbeeld:
Storie tot dusver: Reën val op die straat.
Speleraksie: Ek kyk rond.
Gaan voort met die storie: Die reëndruppels glinster onder die neonligte terwyl jy die stil stegie skandeer. Jy sien 'n klein katjie wat jou van agter 'n vullisblik dophou.<|im_end|>
<|im_start|>user
Storie tot dusver: ${history}
${systemEvent ? `Stelselgebeurtenis: ${systemEvent}` : ''}
Speleraksie: ${action}
Gaan voort met die storie:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AF Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Hulpsame taalonderwyser.
Korrigeer die insette. As dit reg is, sê net "Perfek."
Verduidelik foute kortliks in Afrikaans.<|im_end|>
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
Skryf eenvoudiger (CEFR A1).<|im_end|>
<|im_start|>user
Oorspronklik: ${narrativeText}
Vereenvoudig:<|im_end|>
<|im_start|>assistant
`;
};
