/**
 * RW Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Inshingano yawe: Komeza inkuru mu nteruro 1 ngufi neza.
Andika inkuru gusa. Nta mitwe y'ibigambo cyangwa ibisobanuro.
INGENZI: NTUKAKORESHA ICYONGEREZA. Ururimi: Ikinyarwanda.
Imiterere: Irashimishije kandi yoroheje cyane (CEFR A1).

Urugero:
Inkuru kugeza ubu: Imvura iri kugwa mu muhanda.
Icyo umukinnyi akoze: nditegereza hirya no hino.
Interuro 1: Urabona amatara ya neon yarabagirana mu bidiba by'amazi.<|im_end|>
<|im_start|>user
Inkuru kugeza ubu: ${history}
${systemEvent ? `Ibyabaye mu buryo: ${systemEvent}` : ''}
Icyo umukinnyi akoze: ${action}
Interuro 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * RW Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Umwarimu w'ururimi woroheje. Kosora ibyanditswe. Niba ari byo, vuga uti "Ni byiza cyane."<|im_end|>
<|im_start|>user
Umwimerere: ${userInput}
Ikosora:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * RW Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Bikore mu buryo bworoshye (amagambo 3-5).<|im_end|>
<|im_start|>user
Umwimerere: ${narrativeText}
Ibyorohejwe:<|im_end|>
<|im_start|>assistant
`;
};
