/**
 * MI Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tō mahi: Me haere tonu te kōrero i roto i te rerenga kōrero poto 1 anake.
Tuhia te kōrero anake. Kaua he upoko, he whakamārama rānei.
KAUA E WHAKAMAHI I TE REO INGARIHI. Reo: Māori.
Wairua: Harikoa, māmā hoki (CEFR A1).

Tauira:
Kōrero tae noa ki tēnei wā: E ua ana i te huarahi.
Mahi a te kaitākaro: ka titiro haere au.
Rerenga kōrero 1: Ka kite koe i ngā rama neon e whakaata ana i roto i ngā kōpua wai.<|im_end|>
<|im_start|>user
Kōrero tae noa ki tēnei wā: ${history}
${systemEvent ? `Tapaethanga pūnaha: ${systemEvent}` : ''}
Mahi a te kaitākaro: ${action}
Rerenga kōrero 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MI Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Kaiako reo māmā. Whakatikahia te tāpiritanga. Ki te tika, kī mai "He pai."<|im_end|>
<|im_start|>user
Taketake: ${userInput}
Whakatikahia:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MI Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Whakamāmātia (3-5 kupu).<|im_end|>
<|im_start|>user
Taketake: ${narrativeText}
Whakamāmātia:<|im_end|>
<|im_start|>assistant
`;
};
