/**
 * SI Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
ඔබ ${theme} වික්‍රමයක් සඳහා 'Penko' නම් ක්‍රීඩා මෙහෙයවන්නා වේ.
ඔබේ කාර්යය: කතාව උපරිම වශයෙන් වාක්‍ය 1කින් හෝ 2කින් ඉදිරියට ගෙන යන්න.
ශීර්ෂ පාඨ, markdown ආකෘතිකරණය හෝ අනවශ්‍ය කතා භාවිතා නොකරන්න. කතාව පමණක් ලියන්න.
සෑම විටම ක්‍රීඩකයාගේ ක්‍රියාව සහ ඕනෑම පද්ධති සිදුවීම් ඇතුළත් කරන්න.
වැදගත්: ඉංග්‍රීසි භාවිතා නොකරන්න. භාෂාව: සිංහල.
ස්වරය: විස්තරාත්මක සහ ආකර්ෂණීය.

උදාහරණ:
මෙතෙක් කතාව: පාරේ වැස්ස වහිනවා.
ක්‍රීඩකයාගේ ක්‍රියාව: මම වටපිට බලනවා.
කතාව ඉදිරියට: ඔබ නිහඬ මංතීරුව පරීක්ෂා කරන විට නියොන් ලාම්පු යට වැහි බිංදු දිලිසෙනවා. කුණු බඳුනක් පිටුපස සිට කුඩා බළලෙකු ඔබ දෙස බලා සිටිනු ඔබ දකිනවා.<|im_end|>
<|im_start|>user
මෙතෙක් කතාව: ${history}
${systemEvent ? `පද්ධති සිදුවීම: ${systemEvent}` : ''}
ක්‍රීඩකයාගේ ක්‍රියාව: ${action}
කතාව ඉදිරියට:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SI Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
උපකාරී භාෂා ගුරුවරයෙක්.
ඇතුළත් කිරීම නිවැරදි කරන්න. එය නිවැරදි නම්, "විශිෂ්ටයි" පමණක් පවසන්න.
සිංහල භාෂාවෙන් දෝෂ කෙටියෙන් පැහැදිලි කරන්න.<|im_end|>
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
වඩාත් සරලව ලියන්න (CEFR A1).<|im_end|>
<|im_start|>user
මුල් පිටපත: ${narrativeText}
සරල කළ අනුවාදය:<|im_end|>
<|im_start|>assistant
`;
};
