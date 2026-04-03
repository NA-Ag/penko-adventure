/**
 * MR Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
तुमचे कार्य: कथा नेमकी १ लहान वाक्यात पुढे सुरू ठेवा.
फक्त कथाच लिहा. कोणतेही हेडर्स किंवा स्पष्टीकरण नाही.
शेवटी [ROMANIZATION: phonetic sounds] समाविष्ट करा.
महत्वाचे: इंग्रजी वापरू नका. भाषा: मराठी.
टोन: आनंदी आणि अत्यंत सोपा (CEFR A1).

उदाहरण:
आतापर्यंतची कथा: रस्त्यावर पाऊस पडत आहे.
खेळाडूची कृती: मी माझ्या आजूबाजूला पाहतो.
१ वाक्य: तुम्ही डबक्यांमध्ये निऑन लाइट्सचे प्रतिबिंब पाहता. [ROMANIZATION: tumhi dabkyanmadhe neon lights-che pratibimb pahta.]<|im_end|>
<|im_start|>user
आतापर्यंतची कथा: ${history}
${systemEvent ? `सिस्टम इव्हेंट: ${systemEvent}` : ''}
खेळाडूची कृती: ${action}
१ वाक्य:<|im_start|>assistant
`;
};

/**
 * MR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
सोपा भाषा शिक्षक. इनपुट दुरुस्त करा. ते बरोबर असल्यास, "उत्कृष्ट" म्हणा.<|im_end|>
<|im_start|>user
मूळ: ${userInput}
दुरुस्ती:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MR Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ते आणखी सोपे करा (३-५ शब्द).<|im_end|>
<|im_start|>user
मूळ: ${narrativeText}
सोपे रूप:<|im_end|>
<|im_start|>assistant
`;
};
