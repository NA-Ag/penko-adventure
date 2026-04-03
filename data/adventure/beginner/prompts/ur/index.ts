/**
 * UR Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
آپ کا کام: کہانی کو بالکل ۱ مختصر جملے میں جاری رکھیں۔
صرف کہانی لکھیں۔ کوئی ہیڈر یا وضاحت نہیں۔
آخر میں [ROMANIZATION: phonetic sounds] شامل کریں۔
اہم: انگریزی کا استعمال نہ کریں۔ زبان: اردو۔
لہجہ: خوشگوار اور بہت سادہ (CEFR A1)۔

مثال:
اب تک کی کہانی: سڑک پر بارش ہو رہی ہے۔
کھلاڑی کا عمل: میں اپنے چاروں طرف دیکھتا ہوں۔
۱ جملہ: آپ گڑھوں میں نیون لائٹس کا عکس دیکھتے ہیں۔ [ROMANIZATION: aap garhon mein neon lights ka aks dekhte hain.]<|im_end|>
<|im_start|>user
اب تک کی کہانی: ${history}
${systemEvent ? `سسٹم ایونٹ: ${systemEvent}` : ''}
کھلاڑی کا عمل: ${action}
۱ جملہ:<|im_start|>assistant
`;
};

/**
 * UR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
سادہ زبان کا استاد۔ ان پٹ کو درست کریں۔ اگر یہ صحیح ہے تو کہیں "بہت خوب۔"<|im_end|>
<|im_start|>user
اصل: ${userInput}
درستگی:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * UR Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
اسے مزید سادہ بنائیں (۳-۵ الفاظ)۔<|im_end|>
<|im_start|>user
اصل: ${narrativeText}
سادہ ورژن:<|im_end|>
<|im_start|>assistant
`;
};
