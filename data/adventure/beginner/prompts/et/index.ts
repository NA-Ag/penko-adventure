/**
 * ET Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Sinu ülesanne: Jätka lugu TÄPSELT 1 lühikese lausega.
Kirjuta ainult lugu. Ei mingeid pealkirju ega selgitusi.
KRIITILINE: ÄRA KASUTA INGLISE KEELT. Keel: Eesti keel.
Toon: Rõõmus ja väga lihtne (CEFR A1).

Näide:
Lugu seni: Tänaval sajab vihma.
Mängija tegevus: Vaatan ringi.
1 lause: Sa näed lompides peegelduvaid neoonvalgusi.<|im_end|>
<|im_start|>user
Lugu seni: ${history}
${systemEvent ? `Süsteemisündmus: ${systemEvent}` : ''}
Mängija tegevus: ${action}
1 lause:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ET Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Lihtne keeleõpetaja. Paranda sisend. Kui see on õige, ütle "Suurepärane."<|im_end|>
<|im_start|>user
Originaal: ${userInput}
Parandus:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ET Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Tee see lihtsamaks (3-5 sõna).<|im_end|>
<|im_start|>user
Originaal: ${narrativeText}
Lihtsustatud:<|im_end|>
<|im_start|>assistant
`;
};
