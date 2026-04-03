/**
 * HI Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
आपका कार्य: कहानी को बिल्कुल 1 छोटे वाक्य में जारी रखें।
केवल कहानी ही लिखें। कोई शीर्षक या स्पष्टीकरण नहीं।
अंत में, [ROMANIZATION: phonetic sounds] शामिल करें।
महત્વપૂર્ણ: अंग्रेजी का प्रयोग न करें। भाषा: हिन्दी।
स्वर: खुश और बहुत सरल (CEFR A1)।

उदाहरण:
अब तक की कहानी: सड़क पर बारिश हो रही है।
खिलाड़ी की कार्रवाई: मैं अपने चारों ओर देखता हूँ।
1 वाक्य: आप गड्ढों में नियॉन लाइटें देखते हैं। [ROMANIZATION: aap gaddhon mein neon lights dekhate hain.]<|im_end|>
<|im_start|>user
अब तक की कहानी: ${history}
${systemEvent ? `सिस्टम ईवेंट: ${systemEvent}` : ''}
खिलाड़ी की कार्रवाई: ${action}
1 वाक्य:<|im_start|>assistant
`;
};

/**
 * HI Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
सरल भाषा शिक्षक। इनपुट को सही करें। यदि यह सही है, तो "बढ़िया" कहें।<|im_end|>
<|im_start|>user
मूल: ${userInput}
सुधार:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HI Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
इसे और सरल बनाएं (3-5 शब्द)।<|im_end|>
<|im_start|>user
मूल: ${narrativeText}
सरलीकृत:<|im_end|>
<|im_start|>assistant
`;
};
