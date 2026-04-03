/**
 * IG Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Ọrụ gị: Gaa n'ihu n'akụkọ ahụ n'ime ahịrịokwu 1 dị mkpụmkpụ.
Dee naanị akụkọ ahụ. Enweghị isi okwu ma ọ bụ nkọwa.
DỊ MKPA: EJILA BEKEE. Asụsụ: Asụsụ Igbo.
Ụda: Obi ụtọ na dị mfe (CEFR A1).

Sampla:
Akụkọ ruo ugbu a: Mmiri na-ezo n'okporo ụzọ.
Omume onye ọkpụkpọ: Ana m elegharị anya m.
Ahịrịokwu 1: Ị na-ahụ ọkụ neon na-egosipụta n'ime ọdọ mmiri.<|im_end|>
<|im_start|>user
Akụkọ ruo ugbu a: ${history}
${systemEvent ? `Ihe omume usoro: ${systemEvent}` : ''}
Omume onye ọkpụkpọ: ${action}
Ahịrịokwu 1:<|im_start|>assistant
`;
};

/**
 * IG Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Onye nkuzi asụsụ dị mfe. Mezie ihe odide a. Ọ bụrụ na ọ dị mma, sị "Ọ dị mma."<|im_end|>
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
Mee ka ọ dị mfe (okwu 3-5).<|im_end|>
<|im_start|>user
Nke mbụ: ${narrativeText}
Nke dị mfe:<|im_end|>
<|im_start|>assistant
`;
};
