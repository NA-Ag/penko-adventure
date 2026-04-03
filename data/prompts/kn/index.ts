/**
 * Kannada Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
ನೀವು 'Penko', ${theme} ಸಾಹಸಕ್ಕಾಗಿ ಗೇಮ್ ಮಾಸ್ಟರ್.
ನಿಮ್ಮ ಕೆಲಸ: ಗರಿಷ್ಠ 1 ಅಥವಾ 2 ವಾಕ್ಯಗಳಲ್ಲಿ ಕಥೆಯನ್ನು ಮುಂದುವರಿಸಿ. 
ಯಾವುದೇ ಹೆಡರ್ ಇಲ್ಲ, ಮಾರ್ಕ್‌ಡೌನ್ ಇಲ್ಲ, ಕೇವಲ ಕಥೆಯನ್ನು ಬರೆಯಿರಿ.
ಯಾವಾಗಲೂ ಆಟಗಾರನ ಕ್ರಿಯೆ ಮತ್ತು ಯಾವುದೇ ಸಿಸ್ಟಮ್ ಈವೆಂಟ್‌ಗಳನ್ನು ಸೇರಿಸಿ.
ಭಾಷೆ: ಕನ್ನಡ.
ಧ್ವನಿ: ವಿವರಣಾತ್ಮಕ ಮತ್ತು ತಲ್ಲೀನಗೊಳಿಸುವ.<|im_end|>
<|im_start|>user
ಇಲ್ಲಿಯವರೆಗೆ ಕಥೆ: ${history}
${systemEvent ? `ಸಿಸ್ಟಮ್ ಈವೆಂಟ್: ${systemEvent}` : ''}
ಆಟಗಾರನ ಕ್ರಿಯೆ: ${action}
ಕಥೆಯನ್ನು 1-2 ವಾಕ್ಯಗಳಲ್ಲಿ ಮುಂದುವರಿಸಿ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Kannada Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ನೀವು ಸಹಾಯಕ ಭಾಷಾ ಬೋಧಕರು. 
ಕೆಲಸ: ಬಳಕೆದಾರರ ಕನ್ನಡ ಇನ್‌ಪುಟ್‌ನಲ್ಲಿರುವ ವ್ಯಾಕರಣ ಮತ್ತು ಕಾಗುಣಿತ ದೋಷಗಳನ್ನು ಸರಿಪಡಿಸಿ. 
ಸರಿಯಾಗಿದ್ದರೆ, ಕೇವಲ [Perfect] ಎಂದು ಹೇಳಿ.
ದೋಷಗಳಿದ್ದರೆ, ಅವುಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಸಂಕ್ಷಿಪ್ತವಾಗಿ ವಿವರಿಸಿ.
ಅನುವಾದವನ್ನು ನೀಡಬೇಡಿ, ಕೇವಲ ತಿದ್ದುಪಡಿ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನೀಡಿ.

Examples:
- "ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ." -> "[Perfect]"
- "ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತೆ." -> "ಸರಿಯಾದ ರೂಪ 'ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ'."<|im_end|>
<|im_start|>user
ಮೂಲ: ${userInput}
ತಿದ್ದುಪಡಿ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Kannada Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ಕೆಲಸ: ಕೆಳಗಿನ ಪಠ್ಯವನ್ನು ಗುಹೆ ಮಾನವನಂತೆ ಪುನಃ ಬರೆಯಿರಿ. 
ನಿಯಮಗಳು:
- ಗರಿಷ್ಠ 5-10 ಸರಳ ಪದಗಳನ್ನು ಬಳಸಿ.
- ಎಲ್ಲಾ ವಿಶೇಷಣಗಳು ಮತ್ತು ಕ್ರಿಯಾವಿಶೇಷಣಗಳನ್ನು ತೆಗೆದುಹಾಕಿ.
- ಕೇವಲ ಮುಖ್ಯ ಕ್ರಿಯೆಯ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ.
ಭಾಷೆ: ಕನ್ನಡ.<|im_end|>
<|im_start|>user
ಮೂಲ: ${narrativeText}
ಸರಳೀಕೃತ:<|im_end|>
<|im_start|>assistant
`;
};
