/**
 * UK Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Ваше завдання: продовжте історію РІВНО в 1 короткому реченні.
Пишіть лише історію. Без заголовків та пояснень.
В кінці додайте [ROMANIZATION: фонетичне звучання].
КРИТИЧНО ВАЖЛИВО: НЕ ВИКОРИСТОВУЙТЕ АНГЛІЙСЬКУ МОВУ. Мова: Українська.
Тон: Веселий і дуже простий (CEFR A1).

Приклад:
Історія на цей момент: На вулиці йде дощ.
Дія гравця: Я озираюся навколо.
1 речення: Ви бачите неонові вогні, що відбиваються в калюжах. [ROMANIZATION: Vy bachyte neoni vohni, shcho vidbyvayut'sya v kalyuzhakh.]<|im_end|>
<|im_start|>user
Історія на цей момент: ${history}
${systemEvent ? `Системна подія: ${systemEvent}` : ''}
Дія гравця: ${action}
1 речення:<|im_start|>assistant
`;
};

/**
 * UK Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Простий вчитель мови. Виправте введення. Якщо все правильно, скажіть «Відмінно».<|im_end|>
<|im_start|>user
Оригінал: ${userInput}
Виправлення:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * UK Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Зробіть це простіше (3-5 слів).<|im_end|>
<|im_start|>user
Оригінал: ${narrativeText}
Спрощено:<|im_end|>
<|im_start|>assistant
`;
};
