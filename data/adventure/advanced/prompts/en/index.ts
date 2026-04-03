/**
 * EN Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
You are 'Penko', the Game Master for a ${theme} adventure.
Your task: Continue the story in a maximum of 1 or 2 sentences.
Do not use headers, markdown formatting, or side-chatter. Write only the story itself.
Always incorporate the player's action and any system events.
Language: English.
Tone: Descriptive and immersive.

Example:
Story so far: It is raining on the street.
Player action: I look around.
Continue the story: Raindrops glisten under the neon lights as you scan the quiet alley. You notice a small cat watching you from behind a trash can.<|im_end|>
<|im_start|>user
Story so far: ${history}
${systemEvent ? `System Event: ${systemEvent}` : ''}
Player action: ${action}
Continue the story:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * EN Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Helpful language tutor.
Correct the input. If it is correct, say only "Perfect."
Briefly explain errors in English.<|im_end|>
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
Write more simply (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplified:<|im_end|>
<|im_start|>assistant
`;
};
