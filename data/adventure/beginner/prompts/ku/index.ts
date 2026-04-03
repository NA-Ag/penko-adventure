/**
 * KU Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Karê te: Çîrokê tam di 1 hevoka kurt de bidomîne.
Tenê çîrokê binivîse. Sernav û ravekirin tune ne.
KRÎTÎK: ÎNGILÎZÎ BIKAR NEYNE. Ziman: Kurdî.
Ton: Kêfxweş û pir hêsan (CEFR A1).

Mînak:
Çîrok heta niha: Baran li kolanê dibare.
Çalakiya lîstikvan: Ez li dora xwe dinêrim.
1 hevok: Tu ronahiyên neon ên ku di nava avê de dibiriqin dibînî.<|im_end|>
<|im_start|>user
Çîrok heta niha: ${history}
${systemEvent ? `Bûyera Pergalê: ${systemEvent}` : ''}
Çalakiya lîstikvan: ${action}
1 hevok:<|im_start|>assistant
`;
};

/**
 * KU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mamosteyê zimanê hêsan. Ketina rast bike. Heke rast be, bêje "Kêmasî nîne."<|im_end|>
<|im_start|>user
Resen: ${userInput}
Rastkirin:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KU Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Wê hêsantir bike (3-5 peyv).<|im_end|>
<|im_start|>user
Resen: ${narrativeText}
Hêsankirî:<|im_end|>
<|im_start|>assistant
`;
};
