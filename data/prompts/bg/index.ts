/**
 * Български Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Ти си 'Penko', Разказвач за ${theme}приключение.
Твоята задача: Продължи историята в максимум 1 или 2 изречения. 
Винаги включвай действието на играча и всички системни събития.
Language: Български.
Тон: Описателен и завладяващ.<|im_end|>
<|im_start|>user
Историята дотук: ${history}
${systemEvent ? `Системно събитие: ${systemEvent}` : ''}
Действие на играча: ${action}
Продължи историята в 1-2 изречения:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Български Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Ти си полезен учител по език. 
Задача: Коригирай граматическите и правописните грешки в българския текст на потребителя. 
Ако текстът вече е правилен, кажи „Перфектно.“
Ако има грешки, обясни ги накратко на български.
Не предоставяй превод, а само корекция и обратна връзка.<|im_end|>
<|im_start|>user
Оригинал: ${userInput}
Корекция:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Български Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Задача: Пренапиши следния текст като пещерен човек. 
Rules:
- Използвай максимум 5-10 прости думи.
- Премахни всички прилагателни и наречия.
- Фокусирай се само върху основното действие.
Language: Български.<|im_end|>
<|im_start|>user
Оригинал: ${narrativeText}
Опростено:<|im_end|>
<|im_start|>assistant
`;
};
