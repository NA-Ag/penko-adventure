import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "कैफे में ऑर्डर देना",
        role: "आप एक व्यस्त कैफे में बरिस्ता हैं।",
        objectives: ["बरिस्ता का अभिवादन करें", "पेय का ऑर्डर दें", "भोजन का ऑर्डर दें", "बिल मांगें"]
    },
    directions: {
        title: "रास्ता पूछना",
        role: "आप सड़क पर एक सहायक स्थानीय व्यक्ति हैं।",
        objectives: ["विनम्रता से क्षमा मांगें", "पूछें कि रेलवे स्टेशन कहाँ है", "स्थानीय व्यक्ति को धन्यवाद दें"]
    },
    doctor_visit: {
        title: "डॉक्टर के पास",
        role: "आप एक डॉक्टर हैं। उपयोगकर्ता एक मरीज है।",
        objectives: ["दो लक्षणों का वर्णन करें", "डॉक्टर की सलाह समझें", "दवा के बारे में पूछें"]
    },
    shopping_clothes: {
        title: "कपड़ों की खरीदारी",
        role: "आप एक स्टोर सहायक हैं।",
        objectives: ["किसी विशिष्ट वस्तु के लिए पूछें", "आकार (size) पर चर्चा करें", "कीमत के बारे में पूछें"]
    },
    job_interview: {
        title: "नौकरी के लिए साक्षात्कार",
        role: "आप एक हायरिंग मैनेजर हैं जो खुदरा नौकरी के लिए उपयोगकर्ता का साक्षात्कार ले रहे हैं।",
        objectives: ["अपना पेशेवर परिचय दें", "पिछले अनुभव का वर्णन करें", "भूमिका के बारे में एक प्रश्न पूछें"]
    },
    travel_complaint: {
        title: "यात्रा की शिकायत",
        role: "आप हवाई अड्डे पर एक एयरलाइन एजेंट हैं।",
        objectives: ["समस्या समझाएं", "धनवापसी या पुन: बुकिंग का अनुरोध करें", "होटल के बारे में पूछताछ करें"]
    },
    apartment_dispute: {
        title: "अपार्टमेंट विवाद",
        role: "आप एक मकान मालिक हैं जो मरम्मत के लिए भुगतान करने में अनिच्छुक हैं।",
        objectives: ["नुकसान का वर्णन करें", "तर्क दें कि यह मकान मालिक की जिम्मेदारी क्यों है", "मरम्मत की तारीख पर सहमत हों"]
    },
    cultural_debate: {
        title: "सोशल मीडिया पर बहस",
        role: "आप एक तकनीक-संदेहवादी मित्र हैं।",
        objectives: ["एक राय व्यक्त करें", "दो सहायक कारण प्रदान करें", "किसी बिंदु पर प्रतिवाद करें"]
    },
    legal_consultation: {
        title: "कानूनी परामर्श",
        role: "आप बौद्धिक संपदा में विशेषज्ञता रखने वाले वकील हैं।",
        objectives: ["अनुबंध के उल्लंघन की व्याख्या करें", "कानूनी उपायों के बारे में पूछताछ करें", "संभावित परिणामों पर चर्चा करें"]
    },
    academic_seminar: {
        title: "अकादमिक संगोष्ठी",
        role: "आप एक विश्वविद्यालय के प्रोफेसर हैं।",
        objectives: ["अपनी स्थिति का सारांश दें", "परिकल्पित साक्ष्य उद्धृत करें", "एक आलोचनात्मक बिंदु का उत्तर दें"]
    },
    philosophical_debate: {
        title: "एआई की नैतिकता",
        role: "आप एक प्रसिद्ध दार्शनिक हैं।",
        objectives: ["एक जटिल अमूर्त अवधारणा को परिभाषित करें", "परिष्कृत रूपकों का उपयोग करें", "व्यंग्य और बारीकियों को संभालें"]
    },
    diplomatic_crisis: {
        title: "राजनयिक बातचीत",
        role: "आप एक प्रतिद्वंद्वी देश के उच्च स्तरीय राजनयिक हैं।",
        objectives: ["अप्रत्यक्ष रूप से राष्ट्रीय चिंताओं को व्यक्त करें", "एक जटिल समझौते का प्रस्ताव दें", "सख्त औपचारिक प्रोटोकॉल बनाए रखें"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

आपका कार्य: कहानी को बिल्कुल 1 छोटे वाक्य में जारी रखें।
केवल कहानी ही लिखें। कोई शीर्षक या स्पष्टीकरण नहीं।
अंत में, [ROMANIZATION: phonetic sounds] शामिल करें।
महત્વપૂર્ણ: अंग्रेजी का प्रयोग न करें। भाषा: हिन्दी।
स्वर: खुश और बहुत सरल (CEFR A1)।
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 वाक्य:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
सरल भाषा शिक्षक। इनपुट को सही करें। यदि यह सही है, तो "बढ़िया" कहें।<|im_end|>
<|im_start|>user
मूल: ${userInput}
सुधार:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
इसे और सरल बनाएं (3-5 शब्द)।<|im_end|>
<|im_start|>user
मूल: ${narrativeText}
सरलीकृत:<|im_end|>
<|im_start|>assistant
`;
};
