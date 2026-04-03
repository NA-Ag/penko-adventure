/**
 * NE Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
तपाईंको काम: कथालाई ठ्याक्कै १ छोटो वाक्यमा जारी राख्नुहोस्।
कथा मात्र लेख्नुहोस्। कुनै हेडर वा स्पष्टीकरण बिना।
महत्त्वपूर्ण: अंग्रेजी प्रयोग नगर्नुहोस्। भाषा: नेपाली।
टोन: खुसी र धेरै सरल (CEFR A1)।

उदाहरण:
अहिलेसम्मको कथा: सडकमा पानी परिरहेको छ।
खेलाडीको कार्य: म वरिपरि हेर्छु।
१ वाक्य: तपाईंले खाडलहरूमा प्रतिबिम्बित भएको नियन बत्तीहरू देख्नुहुन्छ।<|im_end|>
<|im_start|>user
अहिलेसम्मको कथा: ${history}
${systemEvent ? `सिस्टम घटना: ${systemEvent}` : ''}
खेलाडीको कार्य: ${action}
१ वाक्य:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NE Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
सरल भाषा शिक्षक। इनपुट सच्याउनुहोस्। यदि यो सही छ भने, भन्नुहोस् "उत्कृष्ट।"<|im_end|>
<|im_start|>user
मूल: ${userInput}
सुधार:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NE Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
यसलाई सरल बनाउनुहोस् (३-५ शब्द)।<|im_end|>
<|im_start|>user
मूल: ${narrativeText}
सरलीकृत:<|im_end|>
<|im_start|>assistant
`;
};
