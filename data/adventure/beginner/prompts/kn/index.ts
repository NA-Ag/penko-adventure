/**
 * KN Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
ನಿಮ್ಮ ಕೆಲಸ: ಕಥೆಯನ್ನು ನಿಖರವಾಗಿ ೧ ಸಣ್ಣ ವಾಕ್ಯದಲ್ಲಿ ಮುಂದುವರಿಸಿ.
ಕಥೆಯನ್ನು ಮಾತ್ರ ಬರೆಯಿರಿ. ಯಾವುದೇ ಹೆಡರ್‌ಗಳು ಅಥವಾ ವಿವರಣೆಗಳಿಲ್ಲ.
ಕೊನೆಯಲ್ಲಿ [ROMANIZATION: phonetic sounds] ಸೇರಿಸಿ.
ನಿರ್ಣಾಯಕ: ಇಂಗ್ಲಿಷ್ ಬಳಸಬೇಡಿ. ಭಾಷೆ: ಕನ್ನಡ.
ಧ್ವನಿ: ಸಂತೋಷದಾಯಕ ಮತ್ತು ತುಂಬಾ ಸರಳ (CEFR A1).

ಉದಾಹರಣೆ:
ಇಲ್ಲಿಯವರೆಗಿನ ಕಥೆ: ರಸ್ತೆಯಲ್ಲಿ ಮಳೆ ಬೀಳುತ್ತಿದೆ.
ಆಟಗಾರನ ಕ್ರಿಯೆ: ನಾನು ನನ್ನ ಸುತ್ತಲೂ ನೋಡುತ್ತೇನೆ.
೧ ವಾಕ್ಯ: ನೀವು ಗುಂಡಿಗಳಲ್ಲಿ ಪ್ರತಿಫಲಿಸುವ ನಿಯಾನ್ ದೀಪಗಳನ್ನು ನೋಡುತ್ತೀರಿ. [ROMANIZATION: nīvu gunḍigaḷalli pratiphalisuva niyān dīpagaḷannu nōḍuttīri.]<|im_end|>
<|im_start|>user
ಇಲ್ಲಿಯವರೆಗಿನ ಕಥೆ: ${history}
${systemEvent ? `ಸಿಸ್ಟಮ್ ಈವೆಂಟ್: ${systemEvent}` : ''}
ಆಟಗಾರನ ಕ್ರಿಯೆ: ${action}
೧ ವಾಕ್ಯ:<|im_start|>assistant
`;
};

/**
 * KN Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ಸರಳ ಭಾಷಾ ಶಿಕ್ಷಕ. ಇನ್ಪುಟ್ ಅನ್ನು ಸರಿಪಡಿಸಿ. ಅದು ಸರಿಯಾಗಿದ್ದರೆ, "ಅತ್ಯುತ್ತಮ" ಎಂದು ಹೇಳಿ.<|im_end|>
<|im_start|>user
ಮೂಲ: ${userInput}
ತಿದ್ದುಪಡಿ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KN Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ಅದನ್ನು ಸರಳಗೊಳಿಸಿ (೩-೫ ಪದಗಳು).<|im_end|>
<|im_start|>user
ಮೂಲ: ${narrativeText}
ಸರಳೀಕೃತ:<|im_end|>
<|im_start|>assistant
`;
};
