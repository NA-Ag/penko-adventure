/**
 * NV Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko GM.
Ni 'Penko' nilį́, GM bá ${theme}.
Naanish: Haneʼ tʼáá łáaʼii doodago naaki saad bee yitʼihígo náás yíníłtiʼ.
Naanéé yee áánííłígíí dóó system events bił ałtah áshłééh.

TʼÁÁ ÍÍYISÍÍ: BILAGÁANA BIZAAD ÁDIN. Tʼáá Diné bizaad bee haadzííh.
Tone: Nizhónígo naaltsoos bikʼeʼashchíigo.

Kʼad:
Haneʼ kʼad: Nahałtin atiin bikáaʼgi.
Naanéé yee áánííł: Hoshxaał.
Haneʼ náás: Nahałtinígíí neon lights bikáaʼgi ditsʼid go dínółʼį́į́ʼ. Mósí yázhí tsʼídláád bikáaʼgi niłtsą́.<|im_end|>
<|im_start|>user
Haneʼ kʼad: ${history}
${systemEvent ? `System Event: ${systemEvent}` : ''}
Naanéé yee áánííł: ${action}
Haneʼ náás:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NV Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Saad naʼnitiní. Yíníłchxǫǫhgo hashtʼeʼ niníł. Tʼáá ákogi átʼéego, "Perfect" dííniid.<|im_end|>
<|im_start|>user
Átséedi: ${userInput}
Hashtʼeʼ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NV Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Tʼáá ádinígo áshłééh (CEFR A1).<|im_end|>
<|im_start|>user
Átséedi: ${narrativeText}
Tʼáá ádinígo:<|im_end|>
<|im_start|>assistant
`;
};
