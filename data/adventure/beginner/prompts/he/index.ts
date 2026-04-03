/**
 * HE Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
המשימה שלך: המשך את הסיפור בדיוק במשפט קצר אחד.
כתוב רק את הסיפור. ללא כותרות או הסברים.
בסוף, כלול [ROMANIZATION: phonetic sounds].
קריטי: אל תשתמש באנגלית. שפה: עברית.
טון: שמח ופשוט מאוד (CEFR A1).

דוגמה:
הסיפור עד כה: יורד גשם ברחוב.
פעולת השחקן: אני מסתכל סביבי.
משפט אחד: אתה רואה אורות ניאון משתקפים בשלוליות. [ROMANIZATION: ata ro'e orot neon mishtakfim ba-shluliyot.]<|im_end|>
<|im_start|>user
הסיפור עד כה: ${history}
${systemEvent ? `אירוע מערכת: ${systemEvent}` : ''}
פעולת השחקן: ${action}
משפט אחד:<|im_start|>assistant
`;
};

/**
 * HE Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
מורה לשפות פשוט. תקן את הקלט. אם הוא נכון, אמור "מצוין."<|im_end|>
<|im_start|>user
מקור: ${userInput}
תיקון:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HE Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
עשה זאת פשוט יותר (3-5 מילים).<|im_end|>
<|im_start|>user
מקור: ${narrativeText}
פישוט:<|im_end|>
<|im_start|>assistant
`;
};
