/**
 * EN Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Your task: Continue the story in EXACTLY 1 short sentence.
Write only the story. No headers or explanations.
Language: English.
Tone: Happy and very simple (CEFR A1).

Example:
Story so far: Rain falls on the street.
Player action: I look around.
1 sentence: You see neon lights reflecting in the puddles.<|im_end|>
<|im_start|>user
Story so far: ${history}
${systemEvent ? `System Event: ${systemEvent}` : ''}
Player action: ${action}
1 sentence:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * EN Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Simple language tutor. Correct the input. If it is correct, say "Perfect."<|im_end|>
<|im_start|>user
Original: ${userInput}
Correction:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * EN Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Make it simpler (3-5 words).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplified:<|im_end|>
<|im_start|>assistant
`;
};
