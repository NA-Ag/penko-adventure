/**
 * CY Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Eich tasg: Parhewch â'r stori mewn union 1 frawddeg fer.
Ysgrifennwch y stori yn unig. Dim penawdau na hesboniadau.
TYNGEDFOL: PEIDIWCH Â DEFNYDDIO SAESNEG. Iaith: Cymraeg.
Tôn: Llawen a syml iawn (CEFR A1).

Enghraifft:
Stori hyd yma: Mae hi'n bwrw glaw ar y stryd.
Gweithred y chwaraewr: Edrychaf o'm cwmpas.
1 frawddeg: Rydych chi'n gweld goleuadau neon yn adlewyrchu yn y pyllau dŵr.<|im_end|>
<|im_start|>user
Stori hyd yma: ${history}
${systemEvent ? `Digwyddiad system: ${systemEvent}` : ''}
Gweithred y chwaraewr: ${action}
1 frawddeg:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * CY Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tiwtor iaith syml. Cywirwch y mewnbwn. Os yw'n iawn, dywedwch "Perffaith."<|im_end|>
<|im_start|>user
Gwreiddiol: ${userInput}
Cywiriad:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * CY Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gwnewch hi'n symlach (3-5 gair).<|im_end|>
<|im_start|>user
Gwreiddiol: ${narrativeText}
Symledig:<|im_end|>
<|im_start|>assistant
`;
};
