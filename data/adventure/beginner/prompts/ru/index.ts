/**
 * RU Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Ваша задача: продолжите историю РОВНО в 1 коротком предложении.
Пишите только историю. Без заголовков и объяснений.
В конце добавьте [ROMANIZATION: фонетическое звучание].
КРИТИЧЕСКИ ВАЖНО: НЕ ИСПОЛЬЗУЙТЕ АНГЛИЙСКИЙ ЯЗЫК. Язык: Русский.
Тон: Веселый и очень простой (CEFR A1).

Пример:
История на данный момент: На улице идет дождь.
Действие игрока: Я оглядываюсь вокруг.
1 предложение: Вы видите неоновые огни, отражающиеся в лужах. [ROMANIZATION: Vy vidite neonovye ogni, otrazhayushchiyesya v luzhah.]<|im_end|>
<|im_start|>user
История на данный момент: ${history}
${systemEvent ? `Системное событие: ${systemEvent}` : ''}
Действие игрока: ${action}
1 предложение:<|im_start|>assistant
`;
};

/**
 * RU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Простой учитель языка. Исправьте ввод. Если всё правильно, скажите «Отлично».<|im_end|>
<|im_start|>user
Оригинал: ${userInput}
Исправление:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * RU Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Сделайте это проще (3-5 слов).<|im_end|>
<|im_start|>user
Оригинал: ${narrativeText}
Упрощенно:<|im_end|>
<|im_start|>assistant
`;
};
