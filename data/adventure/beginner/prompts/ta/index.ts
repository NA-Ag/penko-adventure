/**
 * TA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
உங்கள் பணி: கதையை சரியாக 1 சிறிய வாக்கியத்தில் தொடரவும்.
கதையை மட்டுமே எழுதவும். தலைப்புகள் அல்லது விளக்கங்கள் எதுவும் இல்லை.
இறுதியில் [ROMANIZATION: phonetic sounds] சேர்க்கவும்.
முக்கியமானது: ஆங்கிலத்தைப் பயன்படுத்த வேண்டாம். மொழி: தமிழ்.
தொனி: மகிழ்ச்சியான மற்றும் மிகவும் எளிமையான (CEFR A1).

உதாரணம்:
இதுவரை கதை: தெருவில் மழை பெய்கிறது.
பிளேயர் செயல்: நான் என்னைச் சுற்றிப் பார்க்கிறேன்.
1 வாக்கியம்: குட்டைகளில் நியான் விளக்குகள் பிரதிபலிப்பதைக் காண்கிறீர்கள். [ROMANIZATION: kuttaigalil neon vilakkugal pirathibalipadhai kaangireergal.]<|im_end|>
<|im_start|>user
இதுவரை கதை: ${history}
${systemEvent ? `சிஸ்டம் நிகழ்வு: ${systemEvent}` : ''}
பிளேயர் செயல்: ${action}
1 வாக்கியம்:<|im_start|>assistant
`;
};

/**
 * TA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
எளிமையான மொழி ஆசிரியர். உள்ளீட்டைச் சரிசெய்யவும். அது சரியாக இருந்தால், "அற்புதம்" என்று சொல்லவும்.<|im_end|>
<|im_start|>user
அசலானது: ${userInput}
திருத்தம்:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
இதை இன்னும் எளிமையாக்குங்கள் (3-5 வார்த்தைகள்).<|im_end|>
<|im_start|>user
அசலானது: ${narrativeText}
எளிமையாக்கப்பட்டது:<|im_end|>
<|im_start|>assistant
`;
};
