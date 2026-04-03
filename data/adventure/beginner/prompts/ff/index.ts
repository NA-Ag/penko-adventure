/**
 * FF Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Kuugal maa: Jokku haala kaa e nder bolle gootel tan.
Winndu tan ko woni haala kaa. Wata naftir tiitooɗe walla fasiraaji.
GURE: WATA NAFTIR ENGELEERE. Ɗemngal: Fulfulde.
Golle: Weltaare e ko weeɓi (CEFR A1).

Misal:
Haala haa jooni: Ndiyam ina toɓa e laawol hee.
Ko fijoo o waɗi: Miin ina ndaara weeyo hee.
Bolle gootel: A yiyii neyon ina mertsoo e nder ndiyam ɗam.<|im_end|>
<|im_start|>user
Haala haa jooni: ${history}
${systemEvent ? `Ko waɗi e weeyo: ${systemEvent}` : ''}
Ko fijoo o waɗi: ${action}
Bolle gootel:<|im_start|>assistant
`;
};

/**
 * FF Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Anndinoowo ɗemngal weeɓungol. Feewnu ko winndaa koo. So ina feewi, mbi'a "Ina feewi."<|im_end|>
<|im_start|>user
Ko winndaa: ${userInput}
Peewnugol:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * FF Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Weeɓtu ɗum haa heewa (konngudi 3-5).<|im_end|>
<|im_start|>user
Ko winndaa: ${userInput}
Weeɓtugol:<|im_end|>
<|im_start|>assistant
`;
};
