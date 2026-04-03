/**
 * BG Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Вашата задача: Продължете историята в ТОЧНО 1 кратко изречение.
Пишете само историята. Без заглавия или обяснения.
В края включете [ROMANIZATION: phonetic sounds].
КРИТИЧНО: БЕЗ АНГЛИЙСКИ. Език: Български.
Тон: Весел и много прост (CEFR A1).

Пример:
Историята досега: Дъжд вали на улицата.
Действие на играча: Оглеждам се.
1 изречение: Виждате неонови светлини, отразяващи се в локвите. [ROMANIZATION: Vizhdate neonovi svetlini, otrazyavashti se v lokvite.]<|im_end|>
<|im_start|>user
Историята досега: ${history}
${systemEvent ? `Системно събитие: ${systemEvent}` : ''}
Действие на играча: ${action}
1 изречение:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * BG Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Обикновен езиков учител. Коригирайте входа. Ако е правилен, кажете „Перфектно“.<|im_end|>
<|im_start|>user
Оригинал: ${userInput}
Корекция:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * BG Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Направете го по-просто (3-5 думи).<|im_end|>
<|im_start|>user
Оригинал: ${narrativeText}
Опростено:<|im_end|>
<|im_start|>assistant
`;
};
