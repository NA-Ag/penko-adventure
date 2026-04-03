/**
 * SN Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Basa rako: Enderera mberi nenyaya mumutsara 1 mupfupi nemazvo.
Nyora nyaya chete. Pasina misoro yenyaya kana tsananguro.
WAKAKOSHA: USASHANDISA CHIRUNGU. Mutauro: Shona.
Maitiro: Anofadza uye ari nyore kwazvo (CEFR A1).

Muenzaniso:
Nyaya kusvika pari zvino: Kunze kuri kunaya mumugwagwa.
Zvekuita kwemutambi: ndinotarisa kwese kwese.
Mutsara 1: Unoona mwenje yeneyoni ichipenya mumadhaka.<|im_end|>
<|im_start|>user
Nyaya kusvika pari zvino: ${history}
${systemEvent ? `System Event: ${systemEvent}` : ''}
Zvekuita kwemutambi: ${action}
Mutsara 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SN Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mudzidzisi wemutauro ari nyore. Gadzirisa zvanyorwa. Kana zviri izvo, iti "Zvakanaka kwazvo."<|im_end|>
<|im_start|>user
Zvekutanga: ${userInput}
Kugadzirisa:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SN Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Zviite zvive nyore (mazwi 3-5).<|im_end|>
<|im_start|>user
Zvekutanga: ${narrativeText}
Kugadzirisa:<|im_end|>
<|im_start|>assistant
`;
};
