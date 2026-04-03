/**
 * GA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Do thasc: Lean leis an scéal i nDÍREACH 1 abairt ghearr.
Scríobh an scéal amháin. Gan ceanntásca ná mínithe.
CRITICIÚIL: NÁ HÚSÁID AN BHEARLA. Teanga: Gaeilge.
Tón: Áthasach agus an-simplí (CEFR A1).

Sampla:
Scéal go dtí seo: Tá báisteach ag titim ar an tsráid.
Gníomh an imreora: Breathnaím thart orm.
1 abairt: Feiceann tú soilse neon ag taitneamh sna locháin uisce.<|im_end|>
<|im_start|>user
Scéal go dtí seo: ${history}
${systemEvent ? `Imeacht Córais: ${systemEvent}` : ''}
Gníomh an imreora: ${action}
1 abairt:<|im_start|>assistant
`;
};

/**
 * GA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Teagascóir teanga simplí. Ceartaigh an t-ionchur. Más ceart é, abair "Foirfe."<|im_end|>
<|im_start|>user
Bunaidh: ${userInput}
Ceartúchán:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * GA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Déan níos simplí é (3-5 focal).<|im_end|>
<|im_start|>user
Bunaidh: ${narrativeText}
Simplithe:<|im_end|>
<|im_start|>assistant
`;
};
