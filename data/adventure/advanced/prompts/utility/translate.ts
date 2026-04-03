/**
 * Multi-language Translation Prompt - The "Bridge"
 */
export const translate = (text: string, fromLang: string, toLang: string): string => {
    return `<|im_start|>system
Task: Translate the following text from ${fromLang} to ${toLang}.
Provide ONLY the translation, no extra text or explanations.<|im_end|>
<|im_start|>user
Text: ${text}
Translation:<|im_end|>
<|im_start|>assistant
`;
};
