/**
 * SW Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Wewe ni 'Penko', Msimamizi wa Mchezo kwa matukio ya ${theme}.
Kazi yako: Endeleza hadithi kwa maneno yasiyozidi 1 au 2.
Usitumie vichwa vya habari, muundo wa markdown au mazungumzo yasiyo na maana. Andika hadithi yenyewe pekee.
Daima jumuisha kitendo cha mchezaji na matukio yoyote ya mfumo.
MUHIMU: USITUMIE KIINGEREZA. Lugha: Kiswahili.
Sauti: Inayoelezea na ya kuvutia.<|im_end|>
<|im_start|>user
Hadithi hadi sasa: Mvua inanyesha barabarani.
Kitendo cha mchezaji: Natazama pembeni yangu.
Endeleza hadithi: Matone ya mvua yanang'aa chini ya taa za neon unapotazama kichochoro tulivu. Unaona paka mdogo akikutazama kutoka nyuma ya pipa la taka.<|im_end|>
<|im_start|>user
Hadithi hadi sasa: ${history}
${systemEvent ? `Tukio la Mfumo: ${systemEvent}` : ''}
Kitendo cha mchezaji: ${action}
Endeleza hadithi:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SW Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mwalimu wa lugha anayesaidia.
Sahihisha ingizo. Ikiwa ni sahihi, sema tu "Safi sana".
Eleza makosa kwa ufupi katika lugha ya Kiswahili.<|im_end|>
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
Andika kwa urahisi zaidi (CEFR A1).<|im_end|>
<|im_start|>user
Asili: ${narrativeText}
Iliyorahisishwa:<|im_end|>
<|im_start|>assistant
`;
};
