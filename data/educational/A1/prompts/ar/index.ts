import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "الطلب في المقهى",
        role: "أنت باريستا في مقهى مزدحم.",
        objectives: ["تحية الباريستا", "طلب مشروب", "طلب طعام", "طلب الحساب"]
    },
    directions: {
        title: "السؤال عن الاتجاهات",
        role: "أنت شخص محلي متعاون في الشارع.",
        objectives: ["الاعتذار بأدب", "السؤال عن موقع محطة القطار", "شكر الشخص المحلي"]
    },
    doctor_visit: {
        title: "عند الطبيب",
        role: "أنت طبيب. المستخدم هو مريض.",
        objectives: ["وصف عرضين مرضيين", "فهم نصيحة الطبيب", "السؤال عن الدواء"]
    },
    shopping_clothes: {
        title: "تسوق الملابس",
        role: "أنت مساعد مبيعات في متجر.",
        objectives: ["السؤال عن قطعة معينة", "مناقشة المقاسات", "السؤال عن السعر"]
    },
    job_interview: {
        title: "مقابلة عمل",
        role: "أنت مدير توظيف تجري مقابلة مع المستخدم لوظيفة في متجر تجزئة.",
        objectives: ["تقديم نفسك بشكل احترافي", "وصف الخبرات السابقة", "طرح سؤال عن الوظيفة"]
    },
    meeting_friend: {
        title: "مقابلة صديق جديد",
        role: "أنت طالب في الحديقة.",
        objectives: ["اذكر اسمك وأصلك", "اسأل الشخص الآخر عن اسمه", "ودع الشخص بلباقة"]
    },
    planning_picnic: {
        title: "التخطيط لنزهة",
        role: "أنت صديق للمستخدم.",
        objectives: ["تحقق من حالة الطقس", "اقترح وقتاً للمقابلة", "قرر نوع الطعام الذي ستحضره"]
    },
    new_coworker: {
        title: "زميل عمل جديد",
        role: "أنت موظف جديد في يومك الأول.",
        objectives: ["صف بيئة المكتب", "اشرح المهام اليومية", "قدم نصيحة مفيدة"]
    },
    bank_account: {
        title: "فتح حساب بنكي",
        role: "أنت موظف بنك في القاهرة.",
        objectives: ["اشرح سبب الزيارة", "استفسر عن الوثائق المطلوبة", "اسأل عن ميزات الخدمات الوحدات المصرفية عبر الهاتف"]
    },
    environmental_meeting: {
        title: "اجتماع مجتمعي حول البيئة",
        role: "أنت منظم مجتمعي.",
        objectives: ["قدم حجة لسياسة محددة", "رد على المخاوف بشأن التكلفة", "لخص وجهة نظر معقدة"]
    },
    tradition_vs_modernity: {
        title: "التقليد مقابل الحداثة",
        role: "أنت شخص حداثي تعتقد أن التقاليد تعيق التقدم.",
        objectives: ["قارن بين القيم التاريخية والحديثة", "استخدم تعبيرات لغوية متقدمة", "حلل الهوية الثقافية"]
    },
    travel_complaint: {
        title: "شكوى سفر",
        role: "أنت موظف في شركة طيران بالمطار.",
        objectives: ["شرح المشكلة", "طلب استرداد المبلغ أو إعادة الحجز", "الاستفسار عن فندق"]
    },
    apartment_dispute: {
        title: "نزاع حول الشقة",
        role: "أنت صاحب عقار يتردد في دفع تكاليف الإصلاحات.",
        objectives: ["وصف الضرر", "توضيح لماذا تقع المسؤولية على صاحب العقار", "الاتفاق على موعد للإصلاح"]
    },
    cultural_debate: {
        title: "نقاش حول وسائل التواصل الاجتماعي",
        role: "أنت صديق متشكك في التكنولوجيا.",
        objectives: ["إبداء الرأي", "تقديم سببين داعمين", "الرد على حجة مضادة"]
    },
    legal_consultation: {
        title: "استشارة قانونية",
        role: "أنت محامٍ متخصص في الملكية الفكرية.",
        objectives: ["شرح خرق العقد", "الاستفسار عن الحلول القانونية", "مناقشة النتائج المحتملة"]
    },
    academic_seminar: {
        title: "ندوة أكاديمية",
        role: "أنت أستاذ جامعي.",
        objectives: ["تلخيص موقفك", "الاستشهاد بأدلة فرضية", "الرد على نقطة نقدية مضادة"]
    },
    philosophical_debate: {
        title: "أخلاقيات الذكاء الاصطناعي",
        role: "أنت فيلسوف مشهور.",
        objectives: ["تعريف مفهوم تجريدي معقد", "استخدام استعارات متطورة", "التعامل مع السخرية والفروق الدقيقة"]
    },
    diplomatic_crisis: {
        title: "تفاوض دبلوماسي",
        role: "أنت دبلوماسي رفيع المستوى من دولة منافسة.",
        objectives: ["التعبير عن المخاوف الوطنية بشكل غير مباشر", "اقتراح تسوية معقدة", "الحفاظ على البروتوكول الرسمي الصارم"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

مهمتك: واصل القصة في جملة واحدة قصيرة بالضبط.
اكتب القصة فقط. لا توجد عناوين أو تفسيرات.
في النهاية، قم بتضمين [ROMANIZATION: phonetic sounds].
هام جداً: لا تستخدم اللغة الإنجليزية. اللغة: العربية.
الأسلوب: سعيد وبسيط جداً (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
جملة واحدة:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
معلم لغة بسيط. صحح المدخلات. إذا كانت صحيحة، قل فقط "ممتاز."<|im_end|>
<|im_start|>user
الأصل: ${userInput}
التصحيح:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
اجعلها أبسط (3-5 كلمات).<|im_end|>
<|im_start|>user
الأصل: ${narrativeText}
تبسيط:<|im_end|>
<|im_start|>assistant
`;
};
