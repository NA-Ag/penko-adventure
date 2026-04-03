/**
 * GD Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
An obair agad: Lean air adhart leis an sgeulachd ann an DÌREACH 1 seantans ghoirid.
Sgrìobh an sgeulachd a-mhàin. Gun chinn-sgrìobhaidh no mìneachaidhean.
CUDROMACH: NA CLEACHD BEURLA. Cànan: Gàidhlig.
Tòn: Toilichte agus gu math sìmplidh (CEFR A1).

Eisimpleir:
Sgeulachd gu ruige seo: Tha an t-uisge a' tuiteam air an t-sràid.
Gnìomh a' chluicheadair: Bidh mi a' coimhead mun cuairt orm.
1 seantans: Chì thu solais neon gan nochdadh fhèin anns na h-uillt.<|im_end|>
<|im_start|>user
Sgeulachd gu ruige seo: ${history}
${systemEvent ? `Tachartas Siostaim: ${systemEvent}` : ''}
Gnìomh a' chluicheadair: ${action}
1 seantans:<|im_start|>assistant
`;
};

/**
 * GD Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Neach-teagaisg cànain sìmplidh. Ceartaich an inntrigeadh. Mas eil e ceart, abair "Foirfe."<|im_end|>
<|im_start|>user
Tùsail: ${userInput}
Ceartachadh:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * GD Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Dèan nas sìmplidh e (3-5 faclan).<|im_end|>
<|im_start|>user
Tùsail: ${narrativeText}
Sìmplidh:<|im_end|>
<|im_start|>assistant
`;
};
