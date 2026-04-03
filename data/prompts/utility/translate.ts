/**
 * Multi-language Translation Prompt - The "Bridge"
 */
export const translate = (text: string, fromLang: string, toLang: string): string => {
    const localizedInstructions: Record<string, string> = {
        'Spanish': 'Traduce el siguiente texto al inglés. Proporciona SOLO la traducción, sin texto adicional ni explicaciones.',
        'French': 'Traduisez le texte suivant en anglais. Fournissez UNIQUEMENT la traduction, sans texte supplémentaire ni explication.',
        'German': 'Übersetze den folgenden Text ins Englische. Gib NUR die Übersetzung an, keinen zusätzlichen Text oder Erklärungen.',
        'Italian': 'Traduci il seguente testo in inglese. Fornisci SOLO la traduzione, senza testo aggiuntivo o spiegazioni.',
        'Japanese': '次のテキストを英語に翻訳してください。翻訳のみを提供し、余分なテキストや説明は含めないでください。',
        'Mandarin': '请将以下文本翻译成英文。仅提供翻译，不要有额外的文字或解释。',
        'Portuguese': 'Traduza o seguinte texto para o inglês. Forneça APENAS a tradução, sem texto adicional ou explicações.',
        'Russian': 'Переведите следующий текст на английский язык. Предоставьте ТОЛЬКО перевод, без лишнего текста или объяснений.',
        'Arabic': 'ترجم النص التالي إلى الإنجليزية. قدم الترجمة فقط، بدون نص إضافي أو تفسيرات.',
        'Hindi': 'निम्नलिखित पाठ का अंग्रेजी में अनुवाद करें। केवल अनुवाद प्रदान करें, कोई अतिरिक्त पाठ या स्पष्टीकरण नहीं।',
        'Korean': '다음 텍스트를 영어로 번역하십시오. 추가 텍스트나 설명 없이 번역만 제공하십시오.'
    };

    const instruction = localizedInstructions[fromLang] || `Translate the following text from ${fromLang} to ${toLang}. Provide ONLY the translation, no extra text or explanations.`;

    return `<|im_start|>system
${instruction}<|im_end|>
<|im_start|>user
Text: ${text}
Translation:<|im_end|>
<|im_start|>assistant
`;
};
