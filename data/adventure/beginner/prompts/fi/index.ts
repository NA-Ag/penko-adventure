/**
 * FI Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tehtäväsi: Jatka tarinaa TÄSMÄLLEEN 1 lyhyellä lauseella.
Kirjoita vain itse tarina. Ei otsikoita tai selityksiä.
KRIITTISTÄ: ÄLÄ KÄYTÄ ENGLANTIA. Kieli: Suomi.
Sävy: Iloinen ja erittäin yksinkertainen (CEFR A1).

Esimerkki:
Tarina tähän asti: Kadulla sataa.
Pelaajan toiminta: Katson ympärilleni.
1 lause: Näet lätäköistä heijastuvia neonvaloja.<|im_end|>
<|im_start|>user
Tarina tähän asti: ${history}
${systemEvent ? `Järjestelmätapahtuma: ${systemEvent}` : ''}
Pelaajan toiminta: ${action}
1 lause:<|im_start|>assistant
`;
};

/**
 * FI Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Yksinkertainen kielenopettaja. Korjaa teksti. Jos se on oikein, sano "Täydellistä."<|im_end|>
<|im_start|>user
Alkuperäinen: ${userInput}
Korjaus:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * FI Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Tee siitä yksinkertaisempi (3-5 sanaa).<|im_end|>
<|im_start|>user
Alkuperäinen: ${narrativeText}
Yksinkertaistettu:<|im_end|>
<|im_start|>assistant
`;
};
