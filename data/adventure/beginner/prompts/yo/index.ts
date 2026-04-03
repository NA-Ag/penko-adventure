/**
 * YO Beginner Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Olùdarí Eré Penko.
Ìwọ ni 'Penko', Olùdarí Eré fún ${theme}.
Iṣẹ́ rẹ: Tẹ̀síwájú ìtàn náà ní gbólóhùn kúkúrú kan péré.
Kò sí àkọlé, kò sí markdown, kò sí ìsọ̀rọ̀.

PÀTÀKÌ: KÒ SÍ GẸ̀Ẹ́SÌ. Fèsì ní èdè Yorùbá nìkan.
Ohùn: Ayọ̀ àti ìrọ̀rùn (CEFR A1).

Àpẹẹrẹ:
Ìtàn di báyìí: Òjò ń rọ̀ ní ojú títì.
Ìṣe agbáyò: Mo wo àyíká mi.
Gbólóhùn 1: O rí ìmọ́lẹ̀ neon tó ń dán nínú omi.<|im_end|>
<|im_start|>user
Ìtàn di báyìí: ${history}
${systemEvent ? `Ìṣẹ̀lẹ̀ Ètò: ${systemEvent}` : ''}
Ìṣe agbáyò: ${action}
Gbólóhùn 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * YO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Olùkọ́ Èdè. Ṣàtúnṣe àwọn àṣìṣe. Tí ó bá dára, sọ pé "Pípé."<|im_end|>
<|im_start|>user
Àkọ́kọ́: ${userInput}
Àtúnṣe:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * YO Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Ṣe é ní ìrọ̀rùn jùlọ (CEFR A1).<|im_end|>
<|im_start|>user
Àkọ́kọ́: ${narrativeText}
Ìrọ̀rùn:<|im_end|>
<|im_start|>assistant
`;
};
