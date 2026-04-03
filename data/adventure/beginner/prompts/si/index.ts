/**
 * SI Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
ඔබේ කාර්යය: කතාව හරියටම 1 කෙටි වාක්‍යයකින් ඉදිරියට ගෙන යන්න.
කතාව පමණක් ලියන්න. ශීර්ෂ පාඨ හෝ පැහැදිලි කිරීම් අවශ්‍ය නොවේ.
අවසානයේදී [ROMANIZATION: phonetic sounds] ඇතුළත් කරන්න.
වැදගත්: ඉංග්‍රීසි භාවිතා නොකරන්න. භාෂාව: සිංහල.
ස්වරය: ප්‍රීතිමත් සහ ඉතා සරල (CEFR A1).

උදාහරණ:
මෙතෙක් කතාව: පාරේ වැස්ස වහිනවා.
ක්‍රීඩකයාගේ ක්‍රියාව: මම වටපිට බලනවා.
1 වාක්‍යය: වතුර වලවල් වල නියොන් ලාම්පු පරාවර්තනය වන බව ඔබ දකිනවා. [ROMANIZATION: vathura walaval vala neon lampu paravarthanaya vana bava oba dakinava.]<|im_end|>
<|im_start|>user
මෙතෙක් කතාව: ${history}
${systemEvent ? `පද්ධති සිදුවීම: ${systemEvent}` : ''}
ක්‍රීඩකයාගේ ක්‍රියාව: ${action}
1 වාක්‍යය:<|im_start|>assistant
`;
};

/**
 * SI Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
සරල භාෂා ගුරුවරයෙක්. ඇතුළත් කිරීම නිවැරදි කරන්න. එය නිවැරදි නම්, "විශිෂ්ටයි" පවසන්න.<|im_end|>
<|im_start|>user
මුල් පිටපත: ${userInput}
නිවැරදි කිරීම:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SI Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
එය වඩාත් සරල කරන්න (වචන 3-5).<|im_end|>
<|im_start|>user
මුල් පිටපත: ${narrativeText}
සරල කළ අනුවාදය:<|im_end|>
<|im_start|>assistant
`;
};
