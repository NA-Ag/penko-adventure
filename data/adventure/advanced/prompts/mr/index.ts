/**
 * MR Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
तुम्ही ${theme} साहसासाठी गेम मास्टर 'Penko' आहात.
तुमचे कार्य: कथा जास्तीत जास्त १ किंवा २ वाक्यांत पुढे सुरू ठेवा.
कोणतेही हेडर्स, मार्कडाउन फॉरमॅटिंग किंवा अवांतर बोलणे वापरू नका. फक्त कथाच लिहा.
नेहमी खेळाडूची कृती आणि कोणत्याही सिस्टम इव्हेंटचा समावेश करा.
महत्वाचे: इंग्रजी वापरू नका. भाषा: मराठी.
टोन: वर्णनात्मक आणि तल्लीन करणारा.

उदाहरण:
आतापर्यंतची कथा: रस्त्यावर पाऊस पडत आहे.
खेळाडूची कृती: मी माझ्या आजूबाजूला पाहतो.
कथा पुढे सुरू ठेवा: तुम्ही शांत गल्लीचे निरीक्षण करत असताना निऑन लाइट्सखाली पावसाचे थेंब चमकतात. तुम्हाला कचऱ्याच्या डब्यामागून एक लहान मांजर तुमच्याकडे पाहताना दिसते.<|im_end|>
<|im_start|>user
आतापर्यंतची कथा: ${history}
${systemEvent ? `सिस्टम इव्हेंट: ${systemEvent}` : ''}
खेळाडूची कृती: ${action}
कथा पुढे सुरू ठेवा:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
मदत करणारा भाषा शिक्षक.
इनपुट दुरुस्त करा. ते बरोबर असल्यास, फक्त "उत्कृष्ट" म्हणा.
मराठीत चुका थोडक्यात स्पष्ट करा.<|im_end|>
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
आणखी सोप्या पद्धतीने लिहा (CEFR A1).<|im_end|>
<|im_start|>user
मूळ: ${narrativeText}
सोपे रूप:<|im_end|>
<|im_start|>assistant
`;
};
