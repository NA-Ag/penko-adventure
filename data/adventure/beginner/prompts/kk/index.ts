/**
 * KK Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Тапсырмаңыз: Оқиғаны ДӘЛ 1 қысқа сөйлеммен жалғастырыңыз.
Тек оқиғаны жазыңыз. Тақырыптар немесе түсініктемелер жоқ.
Соңында [ROMANIZATION: phonetic sounds] қосыңыз.
МАҢЫЗДЫ: АҒЫЛШЫН ТІЛІН ҚОЛДАНБАҢЫЗ. Тіл: Қазақ тілі.
Тон: Көңілді және өте қарапайым (CEFR A1).

Мысал:
Осы уақытқа дейінгі оқиға: Көшеде жаңбыр жауып тұр.
Ойыншы әрекеті: Жан-жағыма қараймын.
1 сөйлем: Көлшіктерде шағылысқан неон шамдарын көресіз. [ROMANIZATION: Kölshikterde shağılısqan neon shamdarın köresiz.]<|im_end|>
<|im_start|>user
Осы уақытқа дейінгі оқиға: ${history}
${systemEvent ? `Жүйелік оқиға: ${systemEvent}` : ''}
Ойыншы әрекеті: ${action}
1 сөйлем:<|im_start|>assistant
`;
};

/**
 * KK Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Қарапайым тіл маманы. Мәтінді түзетіңіз. Егер ол дұрыс болса, "Керемет" деп айтыңыз.<|im_end|>
<|im_start|>user
Түпнұсқа: ${userInput}
Түзету:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KK Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Оны жеңілдетіңіз (3-5 сөз).<|im_end|>
<|im_start|>user
Түпнұсқа: ${narrativeText}
Жеңілдетілген:<|im_end|>
<|im_start|>assistant
`;
};
