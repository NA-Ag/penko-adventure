/**
 * NE Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
तपाईं 'Penko' हुनुहुन्छ, ${theme} साहसिक कार्यको लागि खेल मास्टर।
तपाईंको काम: कथालाई अधिकतम १ वा २ वाक्यमा जारी राख्नुहोस्।
हेडरहरू, मार्कडाउन ढाँचा, वा साइड-च्याटर प्रयोग नगर्नुहोस्। कथा मात्र लेख्नुहोस्।
सधैं खेलाडीको कार्य र कुनै पनि प्रणाली घटनाहरू समावेश गर्नुहोस्।
भाषा: नेपाली।
टोन: वर्णनात्मक र इमर्सिभ।

उदाहरण:
अहिलेसम्मको कथा: सडकमा पानी परिरहेको छ।
खेलाडीको कार्य: म वरिपरि हेर्छु।
कथा जारी राख्नुहोस्: शान्त गल्ली स्क्यान गर्दा नियन बत्तीहरू मुनि वर्षाका थोपाहरू चम्किन्छन्। तपाईंले एउटा सानो बिरालोलाई फोहोरको टोकरी पछाडिबाट तपाईंलाई हेरिरहेको देख्नुहुन्छ।<|im_end|>
<|im_start|>user
अहिलेसम्मको कथा: ${history}
${systemEvent ? `सिस्टम घटना: ${systemEvent}` : ''}
खेलाडीको कार्य: ${action}
कथा जारी राख्नुहोस्:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NE Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
सहयोगी भाषा शिक्षक।
इनपुट सच्याउनुहोस्। यदि यो सही छ भने, "उत्कृष्ट" मात्र भन्नुहोस्।
नेपालीमा गल्तीहरू संक्षिप्तमा बुझाउनुहोस्।<|im_end|>
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
थप सरल रूपमा लेख्नुहोस् (CEFR A1)।<|im_end|>
<|im_start|>user
मूल: ${narrativeText}
सरलीकृत:<|im_end|>
<|im_start|>assistant
`;
};
