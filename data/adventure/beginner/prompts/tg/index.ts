/**
 * TG Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Вазифаи шумо: Ҳикояро ДАҚИҚАН бо 1 ҷумлаи кӯтоҳ идома диҳед.
Танҳо ҳикояро нависед. Бе ягон сарлавҳа ё тавзеҳот.
МУҲИМ: ЗАБОНИ ИНГЛИСИРО КОР НАФАРМОЕД. Забон: Тоҷикӣ.
Оҳанги ҳикоя: Шодмон ва хеле содда (CEFR A1).

Мисол:
Ҳикоя то ин замон: Дар кӯча борон меборад.
Амали бозигар: ман ба атроф нигоҳ мекунам.
1 ҷумла: Шумо чароғҳои неониро мебинед, ки дар кӯлчаҳо инъикос меёбанд.<|im_end|>
<|im_start|>user
Ҳикоя то ин замон: ${history}
${systemEvent ? `Ҳодисаи системавӣ: ${systemEvent}` : ''}
Амали бозигар: ${action}
1 ҷумла:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TG Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Омӯзгори забони оддӣ. Хатогиҳоро ислоҳ кунед. Агар дуруст бошад, "Оли" гӯед.<|im_end|>
<|im_start|>user
Асл: ${userInput}
Ислоҳ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TG Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Онро соддатар кунед (3-5 калима).<|im_end|>
<|im_start|>user
Асл: ${narrativeText}
Соддашуда:<|im_end|>
<|im_start|>assistant
`;
};
