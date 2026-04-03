import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "הזמנה בבית קפה",
        role: "אתה בריסטה בבית קפה עמוס.",
        objectives: ["ברך את הבריסטה", "הזמן משקה", "הזמן אוכל", "בקש את החשבון"]
    },
    directions: {
        title: "בקשת הכוונה",
        role: "אתה תושב מקומי עוזר ברחוב.",
        objectives: ["התנצל בנימוס", "שאל איפה תחנת הרכבת", "הודה למקומי"]
    },
    doctor_visit: {
        title: "אצל הרופא",
        role: "אתה רופא. המשתמש הוא מטופל.",
        objectives: ["תאר שני תסמינים", "הבן את עצת הרופא", "שאל על טיפול תרופתי"]
    },
    shopping_clothes: {
        title: "קניית בגדים",
        role: "אתה עוזר בחנות.",
        objectives: ["בקש פריט ספציפי", "דון במידות", "שאל על המחיר"]
    },
    job_interview: {
        title: "ראיון עבודה",
        role: "אתה מנהל גיוס המראיין את המשתמש לעבודה בקמעונאות.",
        objectives: ["הצג את עצמך בצורה מקצועית", "תאר ניסיון קודם", "שאל שאלה על התפקיד"]
    },
    meeting_friend: {
        title: "להכיר חבר חדש",
        role: "אתה סטודנט בפארק.",
        objectives: ["ציין את שמך ומוצאך", "שאל את האדם האחר לשמו", "פרד לשלום בנימוס"]
    },
    planning_picnic: {
        title: "תכנון פיקניק",
        role: "אתה חבר של המשתמש.",
        objectives: ["בדוק את מזג האוויר", "הצע זמן פגישה", "החלט איזה אוכל להביא"]
    },
    new_coworker: {
        title: "קולגה חדש",
        role: "אתה עובד חדש ביומך הראשון.",
        objectives: ["תאר את סביבת המשרד", "הסבר משימה יומיומית", "תן טיפ מועיל"]
    },
    bank_account: {
        title: "פתיחת חשבון בנק",
        role: "אתה פקיד בנק בתל אביב.",
        objectives: ["הסבר את סיבת הביקור", "ברר לגבי מסמכים", "שאל על תכונות בנקאות במובייל"]
    },
    environmental_meeting: {
        title: "מפגש קהילתי בנושא סביבה",
        role: "אתה מארגן קהילתי.",
        objectives: ["טען בעד מדיניות ספציפית", "הגב לחשש לגבי עלות", "סכם נקודת מבט מורכבת"]
    },
    tradition_vs_modernity: {
        title: "מסורת מול מודרניות",
        role: "אתה מודרניסט שמאמין שמסורות מעכבות קדמה.",
        objectives: ["השווה בין ערכים היסטוריים ומודרניים", "השתמש בביטויים גבוהים", "נתח זהות תרבותית"]
    },
    travel_complaint: {
        title: "תלונה על נסיעה",
        role: "אתה סוכן חברת תעופה בשדה התעופה.",
        objectives: ["הסבר את הבעיה", "בקש החזר או רישום מחדש", "ברר לגבי מלון"]
    },
    apartment_dispute: {
        title: "סכסוך על דירה",
        role: "אתה בעל בית שמתחמק מתשלום על תיקונים.",
        objectives: ["תאר את הנזק", "טען מדוע זו אחריות בעל הבית", "הסכם על תאריך לתיקון"]
    },
    cultural_debate: {
        title: "דיון על רשתות חברתיות",
        role: "אתה חבר שספקן לגבי טכנולוגיה.",
        objectives: ["הבע דעה", "ספק שתי סיבות תומכות", "הצג טיעון נגד"]
    },
    legal_consultation: {
        title: "ייעוץ משפטי",
        role: "אתה עורך דין המתמחה בקניין רוחני.",
        objectives: ["הסבר את הפרת החוזה", "ברר לגבי סעדים משפטיים", "דון בתוצאות אפשריות"]
    },
    academic_seminar: {
        title: "סמינר אקדמי",
        role: "אתה פרופסור באוניברסיטה.",
        objectives: ["סכם את עמדתך", "צטט ראיות היפותטיות", "הגב לנקודת ביקורת"]
    },
    philosophical_debate: {
        title: "אתיקה של בינה מלאכותית",
        role: "אתה פילוסוף מפורסם.",
        objectives: ["הגדר מושג מופשט מורכב", "השתמש במטאפורות מתוחכמות", "נהל אירוניה ודקויות"]
    },
    diplomatic_crisis: {
        title: "משא ומתן דיפלומטי",
        role: "אתה דיפלומט בכיר מאומה יריבה.",
        objectives: ["הבע דאגות לאומיות בעקיפין", "הצע פשרה מורכבת", "שמור על פרוטוקול רשמי קפדני"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

המשימה שלך: המשך את הסיפור בדיוק במשפט קצר אחד.
כתוב רק את הסיפור. ללא כותרות או הסברים.
בסוף, כלול .
קריטי: אל תשתמש באנגלית. שפה: עברית.
טון: שמח ופשוט מאוד (CEFR A1).
דוגמה:
הסיפור עד כה: יורד גשם ברחוב.
פעולת השחקן: אני מסתכל סביבי.
<|im_start|>user
מקור: ${userInput}
<|im_start|>user
מקור: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
מורה לשפות פשוט. תקן את הקלט. אם הוא נכון, אמור "מצוין."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
מורה לשפות פשוט. תקן את הקלט. אם הוא נכון, אמור "מצוין."<|im_end|>
<|im_start|>user
מקור: ${userInput}
תיקון:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
עשה זאת פשוט יותר (3-5 מילים).<|im_end|>
<|im_start|>user
מקור: ${narrativeText}
פישוט:<|im_end|>
<|im_start|>assistant
`;
};
