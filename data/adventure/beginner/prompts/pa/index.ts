/**
 * PA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
ਤੁਹਾਡਾ ਕੰਮ: ਕਹਾਣੀ ਨੂੰ ਬਿਲਕੁਲ ੧ ਛੋਟੇ ਵਾਕ ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ।
ਸਿਰਫ਼ ਕਹਾਣੀ ਹੀ ਲਿਖੋ। ਕੋਈ ਹੈਡਰ ਜਾਂ ਸਪੱਸ਼ਟੀਕਰਨ ਨਹੀਂ।
ਅੰਤ ਵਿੱਚ [ROMANIZATION: phonetic sounds] ਸ਼ਾਮਲ ਕਰੋ।
ਮਹੱਤਵਪੂਰਨ: ਅੰਗਰੇਜ਼ੀ ਦੀ ਵਰਤੋਂ ਨਾ ਕਰੋ। ਭਾਸ਼ਾ: ਪੰਜਾਬੀ।
ਟੋਨ: ਖੁਸ਼ ਅਤੇ ਬਹੁਤ ਸਰਲ (CEFR A1)।

ਉਦਾਹਰਨ:
ਹੁਣ ਤੱਕ ਦੀ ਕਹਾਣੀ: ਸੜਕ 'ਤੇ ਮੀਂਹ ਪੈ ਰਿਹਾ ਹੈ।
ਖਿਡਾਰੀ ਦੀ ਕਾਰਵਾਈ: ਮੈਂ ਆਪਣੇ ਆਲੇ-ਦੁਆਲੇ ਦੇਖਦਾ ਹਾਂ।
੧ ਵਾਕ: ਤੁਸੀਂ ਟੋਇਆਂ ਵਿੱਚ ਨਿਓਨ ਲਾਈਟਾਂ ਦਾ ਪ੍ਰਤੀਬਿੰਬ ਦੇਖਦੇ ਹੋ। [ROMANIZATION: tusi toyan vich neon lightan da pratibimb dekhde ho.]<|im_end|>
<|im_start|>user
ਹੁਣ ਤੱਕ ਦੀ ਕਹਾਣੀ: ${history}
${systemEvent ? `ਸਿਸਟਮ ਈਵੈਂਟ: ${systemEvent}` : ''}
ਖਿਡਾਰੀ ਦੀ ਕਾਰਵਾਈ: ${action}
੧ ਵਾਕ:<|im_start|>assistant
`;
};

/**
 * PA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ਸਰਲ ਭਾਸ਼ਾ ਅਧਿਆਪਕ। ਇਨਪੁਟ ਨੂੰ ਸਹੀ ਕਰੋ। ਜੇ ਇਹ ਸਹੀ ਹੈ, ਤਾਂ "ਬਹੁਤ ਵਧੀਆ" ਕਹੋ।<|im_end|>
<|im_start|>user
ਮੂਲ: ${userInput}
ਸੁਧਾਰ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * PA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ਇਸ ਨੂੰ ਹੋਰ ਸਰਲ ਬਣਾਓ (੩-੫ ਸ਼ਬਦ)।<|im_end|>
<|im_start|>user
ਮੂਲ: ${narrativeText}
ਸਰਲ ਰੂਪ:<|im_end|>
<|im_start|>assistant
`;
};
