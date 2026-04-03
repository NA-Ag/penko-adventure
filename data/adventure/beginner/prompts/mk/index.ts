/**
 * MK Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Твојата задача: Продолжи ја приказната во ТОЧНО 1 кратка реченица.
Пишувај ја само приказната. Без наслови или објаснувања.
КРИТИЧНО: НЕ КОРИСТИ АНГЛИСКИ. Јазик: Македонски.
Тон: Среќен и многу едноставен (CEFR A1).

Пример:
Приказна досега: Врне дожд на улицата.
Акција на играчот: гледам околу себе.
1 реченица: Гледаш неонски светла како се рефлектираат во локвите.<|im_end|>
<|im_start|>user
Приказна досега: ${history}
${systemEvent ? `Системски настан: ${systemEvent}` : ''}
Акција на играчот: ${action}
1 реченица:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MK Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Едноставен учител по јазик. Поправи го внесот. Ако е точно, кажи „Совршено“.<|im_end|>
<|im_start|>user
Оригинал: ${userInput}
Поправка:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MK Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Направи го поедноставно (3-5 зборови).<|im_end|>
<|im_start|>user
Оригинал: ${narrativeText}
Поедноставено:<|im_end|>
<|im_start|>assistant
`;
};
