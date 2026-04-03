/**
 * PS Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
ستاسو دنده: کیسه دقیقا په ۱ لنډه جمله کې جاري وساتئ.
یوازې کیسه ولیکئ. هیڅ سرلیک یا تشریح مه ورکوئ.
په پای کې [ROMANIZATION: phonetic sounds] شامل کړئ.
مهم: انګلیسي مه کاروئ. ژبه: پښتو.
ټون: خوشحاله او خورا ساده (CEFR A1).

مثال:
کیسه تر دې دمه: په سړک باران وریږي.
د لوبغاړي عمل: زه شاوخوا ګورم.
۱ جمله: تاسو ګورئ چې د نیون څراغونه په اوبو کې ښکاري. [ROMANIZATION: taso gorai che da neon tsraghone pa obo ke khkari.]<|im_end|>
<|im_start|>user
کیسه تر دې دمه: ${history}
${systemEvent ? `د سیسټم پیښه: ${systemEvent}` : ''}
د لوبغاړي عمل: ${action}
۱ جمله:<|im_start|>assistant
`;
};

/**
 * PS Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
د ساده ژبې ښوونکی. ننوتنه سمه کړئ. که سمه وي، ووایئ "غوره."<|im_end|>
<|im_start|>user
اصلي: ${userInput}
اصلاح:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * PS Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
دا ساده کړئ (۳-۵ کلمې).<|im_end|>
<|im_start|>user
اصلي: ${narrativeText}
ساده بڼه:<|im_end|>
<|im_start|>assistant
`;
};
