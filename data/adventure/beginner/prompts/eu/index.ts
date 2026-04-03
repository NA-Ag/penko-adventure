/**
 * EU Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Zure lana: Istorioa ZIUR esaldi labur 1ekin jarraitu.
Idatzi istorioa soilik. Izenbururik edo azalpenik gabe.
GARRANTZITSUA: EZ ERABILI INGELESA. Hizkuntza: Euskara.
Tonua: Pozik eta oso erraza (CEFR A1).

Adibidea:
Istorioa orain arte: Kalean euria ari du.
Jokalariaren ekintza: Ingurura begiratzen dut.
Esaldi 1: Neon argiak putzuetan islatuta ikusten dituzu.<|im_end|>
<|im_start|>user
Istorioa orain arte: ${history}
${systemEvent ? `Sistemaren gertaera: ${systemEvent}` : ''}
Jokalariaren ekintza: ${action}
Esaldi 1:<|im_start|>assistant
`;
};

/**
 * EU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Hizkuntza-tutore erraza. Zuzendu sarrera. Ondo badago, esan "Bikain."<|im_end|>
<|im_start|>user
Jatorrizkoa: ${userInput}
Zuzenketa:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * EU Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Egin ezazu errazago (3-5 hitz).<|im_end|>
<|im_start|>user
Jatorrizkoa: ${narrativeText}
Sinplifikatua:<|im_end|>
<|im_start|>assistant
`;
};
