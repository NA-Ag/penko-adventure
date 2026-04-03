/**
 * IG Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Ị bụ 'Penko', onye nwe egwuregwu maka njem ${theme}.
Ọrụ gị: Gaa n'ihu n'akụkọ ahụ n'ime ahịrịokwu 1 ma ọ bụ 2 kachasị.
Ejila isiokwu, usoro markdown ma ọ bụ mkparịta ụka efu. Dee naanị akụkọ ahụ n'onwe ya.
Gụnyere omume onye ọkpụkpọ na ihe omume usoro ọ bụla mgbe niile.
DỊ MKPA: EJILA BEKEE. Asụsụ: Asụsụ Igbo.
Ụda: Nkọwa na nke na-adọrọ mmasị.<|im_end|>
<|im_start|>user
Akụkọ ruo ugbu a: Mmiri na-ezo n'okporo ụzọ.
Omume onye ọkpụkpọ: Ana m elegharị anya m.
Gaa n'ihu n'akụkọ ahụ: Mmiri na-egbu maramara n'okpuru ọkụ neon ka ị na-enyocha ụzọ dị nwayọọ. Ị hụrụ obere nwamba ka ọ na-ele gị anya n'azụ igbe mkpofu.<|im_end|>
<|im_start|>user
Akụkọ ruo ugbu a: ${history}
${systemEvent ? `Ihe omume usoro: ${systemEvent}` : ''}
Omume onye ọkpụkpọ: ${action}
Gaa n'ihu n'akụkọ ahụ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * IG Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Onye nkuzi asụsụ na-enyere aka.
Mezie ihe odide a. Ọ bụrụ na ọ dị mma, sị naanị "Ọ dị mma.".
Kọwaa mmejọ nkenke n'asụsụ Igbo.<|im_end|>
<|im_start|>user
Nke mbụ: ${userInput}
Ndozi:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * IG Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Dee ya n'ụzọ dị mfe (CEFR A1).<|im_end|>
<|im_start|>user
Nke mbụ: ${narrativeText}
Nke dị mfe:<|im_end|>
<|im_start|>assistant
`;
};
