/**
 * HU Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Te vagy 'Penko', a kalandmester egy ${theme} kalandban.
A feladatod: Folytasd a történetet legfeljebb 1 vagy 2 mondatban.
Ne használj címsorokat, markdown formázást vagy felesleges csevegést. Csak magát a történetet írd le.
Mindig építsd be a játékos cselekedeteit és a rendszereseményeket.
KRITIKUS: NE HASZNÁLJ ANGOL NYELVET. Nyelv: Magyar.
Stílus: Leíró és magával ragadó.

Példa:
Eddigi történet: Esik az eső az utcán.
Játékos cselekvése: Körülnézek.
Történet folytatása: Az esőcseppek megcsillannak a neonfények alatt, miközben végigpásztázod a csendes sikátort. Észreveszel egy kis macskát, aki egy szemetes mögül figyel téged.<|im_end|>
<|im_start|>user
Eddigi történet: ${history}
${systemEvent ? `Rendszeresemény: ${systemEvent}` : ''}
Játékos cselekvése: ${action}
Történet folytatása:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Segítőkész nyelvtanár.
Javítsd ki a beírt szöveget. Ha helyes, csak annyit mondj: "Tökéletes.".
Röviden magyarázd el a hibákat magyarul.<|im_end|>
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
Írj egyszerűbben (CEFR A1).<|im_end|>
<|im_start|>user
Eredeti: ${narrativeText}
Egyszerűsített:<|im_end|>
<|im_start|>assistant
`;
};
