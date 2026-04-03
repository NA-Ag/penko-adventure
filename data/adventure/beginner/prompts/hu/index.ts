/**
 * HU Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
A feladatod: Folytasd a történetet PONTOSAN 1 rövid mondatban.
Csak magát a történetet írd le. Ne használj címsorokat vagy magyarázatokat.
KRITIKUS: NE HASZNÁLJ ANGOL NYELVET. Nyelv: Magyar.
Stílus: Vidám és nagyon egyszerű (CEFR A1).

Példa:
Eddigi történet: Esik az eső az utcán.
Játékos cselekvése: Körülnézek.
1 mondat: Látod a tócsákban tükröződő neonfényeket.<|im_end|>
<|im_start|>user
Eddigi történet: ${history}
${systemEvent ? `Rendszeresemény: ${systemEvent}` : ''}
Játékos cselekvése: ${action}
1 mondat:<|im_start|>assistant
`;
};

/**
 * HU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Egyszerű nyelvtanár. Javítsd ki a beírt szöveget. Ha helyes, mondd azt: "Tökéletes."<|im_end|>
<|im_start|>user
Eredeti: ${userInput}
Javítás:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HU Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Legyen egyszerűbb (3-5 szó).<|im_end|>
<|im_start|>user
Eredeti: ${narrativeText}
Egyszerűsített:<|im_end|>
<|im_start|>assistant
`;
};
