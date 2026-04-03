/**
 * Hindi Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
आप 'Penko' हैं, एक ${theme} साहसिक कार्य के लिए गेम मास्टर।
आपका कार्य: कहानी को अधिकतम 1 या 2 वाक्यों में जारी रखें। 
कोई हेडर नहीं, कोई मार्कडाउन नहीं, केवल कहानी लिखें।
हमेशा खिलाड़ी की कार्रवाई और किसी भी सिस्टम इवेंट को शामिल करें।
भाषा: हिंदी।
टोन: वर्णनात्मक और इमर्सिव।<|im_end|>
<|im_start|>user
अब तक की कहानी: ${history}
${systemEvent ? `सिस्टम इवेंट: ${systemEvent}` : ''}
खिलाड़ी की कार्रवाई: ${action}
कहानी को 1-2 वाक्यों में जारी रखें:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Hindi Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
आप एक सहायक भाषा शिक्षक हैं। 
कार्य: उपयोगकर्ता के हिंदी इनपुट में व्याकरण और वर्तनी की गलतियों को सुधारें। 
यदि सही है, तो केवल [Perfect] कहें।
यदि गलतियाँ हैं, तो उन्हें संक्षेप में हिंदी में समझाएं।
अनुवाद न दें, केवल सुधार और प्रतिक्रिया दें।

Examples:
- "मैं स्कूल जा रहा हूँ।" -> "[Perfect]"
- "मैं स्कूल जा रहा है।" -> "शुद्ध वाक्य है 'मैं स्कूल जा रहा हूँ'।"<|im_end|>
<|im_start|>user
मूल: ${userInput}
सुधार:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Hindi Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
कार्य: निम्नलिखित पाठ को एक आदिमानव की तरह फिर से लिखें। 
नियम:
- अधिकतम 5-10 सरल शब्दों का प्रयोग करें।
- सभी विशेषणों और क्रियाविशेषणों को हटा दें।
- केवल मुख्य क्रिया पर ध्यान दें।
भाषा: हिंदी।<|im_end|>
<|im_start|>user
मूल: ${narrativeText}
सरलीकृत:<|im_end|>
<|im_start|>assistant
`;
};
