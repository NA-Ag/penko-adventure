/**
 * TL Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Ang iyong gawain: Ipagpatuloy ang kuwento sa EKSAKTONG 1 maikling pangungusap.
Isulat lamang ang kuwento. Walang mga header o paliwanag.
KRITIKAL: HUWAG GUMAMIT NG INGLES. Wika: Tagalog.
Tono: Masaya at napakasimple (CEFR A1).

Halimbawa:
Kuwento hanggang ngayon: Umuulan sa kalsada.
Kilos ng manlalaro: Titingin ako sa paligid.
1 pangungusap: Nakakakita ka ng mga neon light na makikita sa mga puddles.<|im_end|>
<|im_start|>user
Kuwento hanggang ngayon: ${history}
${systemEvent ? `Kaganapan sa System: ${systemEvent}` : ''}
Kilos ng manlalaro: ${action}
1 pangungusap:<|im_start|>assistant
`;
};

/**
 * TL Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Simpleng tutor sa wika. Itama ang input. Kung tama ito, sabihin ang "Perpekto."<|im_end|>
<|im_start|>user
Orihinal: ${userInput}
Pagwawasto:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TL Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gawing mas simple (3-5 salita).<|im_end|>
<|im_start|>user
Orihinal: ${narrativeText}
Pinasimple:<|im_end|>
<|im_start|>assistant
`;
};
