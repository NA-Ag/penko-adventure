/**
 * FF Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Aan woni 'Penko', hooreejo fijirde ngam jinne ${theme}.
Kuugal maa: Jokku haala kaa e nder bolle ɗiɗi tan.
Wata naftir tiitooɗe walla markdown. Winndu tan ko woni haala kaa.
Naatnu kadi ko fijoo o waɗi e ko woni e weeyo hee.
GURE: WATA NAFTIR ENGELEERE. Ɗemngal: Fulfulde.
Golle: Faamre e njiylawu.<|im_end|>
<|im_start|>user
Haala haa jooni: ${history}
${systemEvent ? `Ko waɗi e weeyo: ${systemEvent}` : ''}
Ko fijoo o waɗi: ${action}
Jokku haala kaa:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * FF Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Anndinoowo ɗemngal balloowo.
Feewnu ko winndaa koo. So ina feewi, mbi'a tan "Ina feewi".
Fasir ko woni e nder ɗemngal Fulfulde.<|im_end|>
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
Winndu ko weeɓi (CEFR A1).<|im_end|>
<|im_start|>user
Ko winndaa: ${userInput}
Weeɓtugol:<|im_end|>
<|im_start|>assistant
`;
};
