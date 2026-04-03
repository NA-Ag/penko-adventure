/**
 * KU Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Tu 'Penko' yî, Rêveberê Lîstikê ji bo serpêhatiya ${theme}.
Karê te: Çîrokê herî zêde di 1 an 2 hevokan de bidomîne.
Sernavan, formata markdown an axaftinên vala bikar neyne. Tenê çîrokê bixwe binivîse.
Her tim çalakiya lîstikvan û her bûyerên pergalê têkeve nav çîrokê.
KRÎTÎK: ÎNGILÎZÎ BIKAR NEYNE. Ziman: Kurdî.
Ton: Danasînî û balkêş.<|im_end|>
<|im_start|>user
Çîrok heta niha: Li kolanê baran dibare.
Çalakiya lîstikvan: Ez li dora xwe dinêrim.
Çîrokê bidomîne: Dema ku tu li kolana bêdeng dinêrî, dilopên baranê di bin ronahiya neon de dibiriqin. Tu pisîkek piçûk dibînî ku ji pişt qulika çopê li te dinêre.<|im_end|>
<|im_start|>user
Çîrok heta niha: ${history}
${systemEvent ? `Bûyera Pergalê: ${systemEvent}` : ''}
Çalakiya lîstikvan: ${action}
Çîrokê bidomîne:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mamosteyê zimanê alîkar.
Ketina rast bike. Heke rast be, tenê bêje "Kêmasî nîne".
Şaşiyan bi kurtî bi zimanê Kurdî rave bike.<|im_end|>
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
Hêsantir binivîse (CEFR A1).<|im_end|>
<|im_start|>user
Resen: ${narrativeText}
Hêsankirî:<|im_end|>
<|im_start|>assistant
`;
};
