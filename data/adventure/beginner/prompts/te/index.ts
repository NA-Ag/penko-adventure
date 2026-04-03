/**
 * TE Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
మీ పని: కథను సరిగ్గా 1 చిన్న వాక్యంలో కొనసాగించండి.
కథను మాత్రమే రాయండి. శీర్షికలు లేదా వివరణలు లేవు.
చివరలో [ROMANIZATION: phonetic sounds] చేర్చండి.
ముఖ్యమైనది: ఇంగ్లీష్ ఉపయోగించవద్దు. భాష: తెలుగు.
టోన్: సంతోషకరమైనది మరియు చాలా సరళమైనది (CEFR A1).

ఉదాహరణ:
ఇప్పటి వరకు కథ: రోడ్డుపై వర్షం పడుతోంది.
ప్లేయర్ చర్య: నేను నా చుట్టూ చూస్తాను.
1 వాక్యం: మీరు గుంటలలో నియాన్ లైట్లు ప్రతిబింబించడం చూస్తారు. [ROMANIZATION: mīru gunṭalalō niyān laiṭlu pratibimbis̄aṭan chūstāru.]<|im_end|>
<|im_start|>user
ఇప్పటి వరకు కథ: ${history}
${systemEvent ? `సిస్టమ్ ఈవెంట్: ${systemEvent}` : ''}
ప్లేయర్ చర్య: ${action}
1 వాక్యం:<|im_start|>assistant
`;
};

/**
 * TE Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
సరళమైన భాషా బోధకుడు. ఇన్‌పుట్‌ను సరిచేయండి. అది సరిగ్గా ఉంటే, "అద్భుతం" అని చెప్పండి.<|im_end|>
<|im_start|>user
అసలైనది: ${userInput}
సవరణ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TE Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
దీన్ని మరింత సరళంగా చేయండి (3-5 పదాలు).<|im_end|>
<|im_start|>user
అసలైనది: ${narrativeText}
సరళీకృతం:<|im_end|>
<|im_start|>assistant
`;
};
