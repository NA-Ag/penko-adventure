/**
 * MG Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Ny asanao: Tohizo amin'ny fehezanteny fohy 1 marina tsara ny tantara.
Soraty fotsiny ny tantara. Tsy misy lohateny na fanazavana.
TSY MAINTSY: AZA AMPIASAINA NY TENY ANGLEZY. Teny: Malagasy.
Hira: Faly sy tsotra be (CEFR A1).

Ohatra:
Tantara hatramin'izao: Milatsaka ny orana eny an-dalana.
Hetsika ataon'ny mpilalao: mijery manodidina aho.
Fehezanteny 1: Mahita jiro neona hita taratra eny amin'ny doboka ianao.<|im_end|>
<|im_start|>user
Tantara hatramin'izao: ${history}
${systemEvent ? `Zava-nitranga tamin'ny rafitra: ${systemEvent}` : ''}
Hetsika ataon'ny mpilalao: ${action}
Fehezanteny 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MG Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mpampianatra teny tsotra. Ahitsio ny fidirana. Raha marina izany, lazao hoe "Tonga lafatra."<|im_end|>
<|im_start|>user
Tany am-boalohany: ${userInput}
Fanitsiana:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MG Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Ataovy tsotra kokoa (teny 3-5).<|im_end|>
<|im_start|>user
Tany am-boalohany: ${narrativeText}
Notsotsoroina:<|im_end|>
<|im_start|>assistant
`;
};
