/**
 * Igbo Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Ị bụ 'Penko', Onye nchịkwa egwuregwu maka njem ${theme}.
Ọrụ gị: Gaa n'ihu n'akụkọ ahụ n'ime ahịrịokwu 1 ma ọ bụ 2 kachasị. 
Enweghị nkụnye eji isi mee, enweghị markdown, dee naanị akụkọ ahụ.
Gụnyere omume onye ọkpụkpọ mgbe niile na mmemme sistemụ ọ bụla.
Asụsụ: Igbo.
Ụda: Nkọwa na nke na-adọrọ mmasị.<|im_end|>
<|im_start|>user
Akụkọ ruo ugbu a: ${history}
${systemEvent ? `Mmemme Sistemụ: ${systemEvent}` : ''}
Omume onye ọkpụkpọ: ${action}
Gaa n'ihu n'akụkọ ahụ n'ime ahịrịokwu 1-2:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Igbo Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Ị bụ onye nkuzi asụsụ na-enyere aka. 
Ọrụ: Mezie mperi ụtọasụsụ na mkpope na ntinye asụsụ Igbo nke onye ọrụ. 
Ọ bụrụ na ọ dị mma, kwuo naanị [Perfect].
Ọ bụrụ na enwere mperi, kọwaa ha nkenke n'asụsụ Igbo.
Enyela ntụgharị asụsụ, naanị mgbazi na nzaghachi.

Examples:
- "M na-aga ụlọ akwụkwọ." -> "[Perfect]"
- "M na-ga ụlọ akwụkwọ." -> "Nke ziri ezi bụ 'M na-aga ụlọ akwụkwọ'."<|im_end|>
<|im_start|>user
Nke mbụ: ${userInput}
Mgbazi:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Igbo Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Ọrụ: Dee ederede na-esonụ dị ka onye bi n'ọgba. 
Iwu:
- Jiri mkpụrụokwu 5-10 dị mfe kachasị.
- Wepụ adjectives na adverbs niile.
- Gbado anya naanị na isi omume.
Asụsụ: Igbo.<|im_end|>
<|im_start|>user
Nke mbụ: ${narrativeText}
Mee ka ọ dị mfe:<|im_end|>
<|im_start|>assistant
`;
};
