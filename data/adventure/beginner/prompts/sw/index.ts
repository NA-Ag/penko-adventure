/**
 * SW Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Kazi yako: Endeleza hadithi kwa sentensi 1 fupi pekee.
Andika hadithi pekee. Hakuna vichwa vya habari wala maelezo.
MUHIMU: USITUMIE KIINGEREZA. Lugha: Kiswahili.
Sauti: Ya kufurahisha na rahisi sana (CEFR A1).

Mfano:
Hadithi hadi sasa: Mvua inanyesha barabarani.
Kitendo cha mchezaji: Natazama pembeni yangu.
Sentensi 1: Unaona taa za neon zikiakisi kwenye madimbwi.<|im_end|>
<|im_start|>user
Hadithi hadi sasa: ${history}
${systemEvent ? `Tukio la Mfumo: ${systemEvent}` : ''}
Kitendo cha mchezaji: ${action}
Sentensi 1:<|im_start|>assistant
`;
};

/**
 * SW Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mwalimu wa lugha rahisi. Sahihisha ingizo. Ikiwa ni sahihi, sema "Safi sana."<|im_end|>
<|im_start|>user
Asili: ${userInput}
Sahihisho:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SW Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Ifanye iwe rahisi zaidi (maneno 3-5).<|im_end|>
<|im_start|>user
Asili: ${narrativeText}
Iliyorahisishwa:<|im_end|>
<|im_start|>assistant
`;
};
