/**
 * KY Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Сиздин тапшырмаңыз: Окуяны ТАК 1 кыска сүйлөм менен улантыңыз.
Окуяны гана жазыңыз. Баш сөздөр же түшүндүрмөлөр жок.
МААНИЛҮҮ: АНГЛИС ТИЛИН КОЛДОНБОҢУЗ. Тил: Кыргызча.
Окуянын обону: Шайыр жана абдан жөнөкөй (CEFR A1).

Мисал:
Окуя ушул кезге чейин: Көчөдө жамгыр жаап жатат.
Оюнчунун аракети: мен айлананы карап жатам.
1 сүйлөм: Сиз көлчүктөрдө чагылышкан неон чырактарын көрөсүз.<|im_end|>
<|im_start|>user
Окуя ушул кезге чейин: ${history}
${systemEvent ? `Тутумдук окуя: ${systemEvent}` : ''}
Оюнчунун аракети: ${action}
1 сүйлөм:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KY Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Жөнөкөй тил үйрөтүүчү. Каталарды оңдоңуз. Эгер туура болсо, "Эң жакшы" деп айтыңыз.<|im_end|>
<|im_start|>user
Түпнуска: ${userInput}
Оңдоо:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KY Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Жөнөкөйлөтүңүз (3-5 сөз).<|im_end|>
<|im_start|>user
Түпнуска: ${narrativeText}
Жөнөкөйлөтүлгөн:<|im_end|>
<|im_start|>assistant
`;
};
