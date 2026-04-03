/**
 * AR Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
مهمتك: واصل القصة في جملة واحدة قصيرة بالضبط.
اكتب القصة فقط. لا توجد عناوين أو تفسيرات.
في النهاية، قم بتضمين [ROMANIZATION: phonetic sounds].
هام جداً: لا تستخدم اللغة الإنجليزية. اللغة: العربية.
الأسلوب: سعيد وبسيط جداً (CEFR A1).

مثال:
القصة حتى الآن: المطر يسقط في الشارع.
حركة اللاعب: أنظر حولي.
جملة واحدة: ترى أضواء النيون تنعكس في البرك. [ROMANIZATION: tara adwa' al-niyun tan'akis fi al-birak.]<|im_end|>
<|im_start|>user
القصة حتى الآن: ${history}
${systemEvent ? `حدث النظام: ${systemEvent}` : ''}
حركة اللاعب: ${action}
جملة واحدة:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
معلم لغة بسيط. صحح المدخلات. إذا كانت صحيحة، قل فقط "ممتاز."<|im_end|>
<|im_start|>user
الأصل: ${userInput}
التصحيح:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AR Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
اجعلها أبسط (3-5 كلمات).<|im_end|>
<|im_start|>user
الأصل: ${narrativeText}
تبسيط:<|im_end|>
<|im_start|>assistant
`;
};
