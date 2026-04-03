/**
 * SK Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Vaša úloha: Pokračujte v príbehu PRESNE v 1 krátkej vete.
Píšte iba príbeh. Žiadne nadpisy ani vysvetlenia.
KRITICKÉ: NEPOUŽÍVAJTE ANGLIČTINU. Jazyk: Slovenčina.
Tón: Veselý a veľmi jednoduchý (CEFR A1).

Príklad:
Doterajší príbeh: Na ulici prší.
Akcia hráča: Rozhliadnem sa okolo seba.
1 veta: Vidíte neónové svetlá odrážajúce sa v kalužiach.<|im_end|>
<|im_start|>user
Doterajší príbeh: ${history}
${systemEvent ? `Systémová udalosť: ${systemEvent}` : ''}
Akcia hráča: ${action}
1 veta:<|im_start|>assistant
`;
};

/**
 * SK Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Jednoduchý jazykový lektor. Opravte vstup. Ak je v poriadku, povedzte "Perfektné."<|im_end|>
<|im_start|>user
Originál: ${userInput}
Oprava:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SK Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Urobte to jednoduchšie (3-5 slov).<|im_end|>
<|im_start|>user
Originál: ${narrativeText}
Zjednodušené:<|im_end|>
<|im_start|>assistant
`;
};
