import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "په کافې کې فرمایش",
        role: "تاسو په یوې بوختې کافې کې باریسټا یاست.",
        objectives: ["باریسټا ته سلام وکړئ", "یو څښاک وغواړئ", "خواړه وغواړئ", "د بل غوښتنه وکړئ"]
    },
    directions: {
        title: "د لارې پوښتنه",
        role: "تاسو په سړک کې یو مرستندویه ځايي کس یاست.",
        objectives: ["په ادب سره بښنه وغواړئ", "وپوښتئ چې د اورګاډي سټیشن چیرته دی", "د ځايي کس څخه مننه وکړئ"]
    },
    doctor_visit: {
        title: "ډاکټر ته تلل",
        role: "تاسو ډاکټر یاست. کاروونکی ناروغ دی.",
        objectives: ["دوه نښې بیان کړئ", "د ډاکټر مشوره درک کړئ", "د درملو په اړه وپوښتئ"]
    },
    shopping_clothes: {
        title: "د جامو پیرودل",
        role: "تاسو د پلورنځي مرستندوی یاست.",
        objectives: ["د یو ځانګړي توکي په اړه وپوښتئ", "د اندازو په اړه بحث وکړئ", "د نرخ په اړه وپوښتئ"]
    },
    job_interview: {
        title: "د دندې مرکه",
        role: "تاسو د ګمارنې مدیر یاست چې د پرچون دندې لپاره د کارونکي سره مرکه کوئ.",
        objectives: ["خپل ځان په مسلکي ډول معرفي کړئ", "خپله تیره تجربه بیان کړئ", "د رول په اړه یوه پوښتنه وکړئ"]
    },
    meeting_friend: {
        title: "د نوي ملګري سره لیدنه",
        role: "تاسو په پارک کې یو زده کوونکی یاست.",
        objectives: ["خپل نوم او اصلي ځای ووایاست", "د بل کس نوم وپوښتئ", "په ادب سره مخه ښه وکړئ"]
    },
    planning_picnic: {
        title: "د پکنیک پلان کول",
        role: "تاسو د کارونکي ملګري یاست.",
        objectives: ["هوا وګورئ", "د لیدو وخت وړاندیز کړئ", "پریکړه وکړئ چې کوم خواړه راوړئ"]
    },
    new_coworker: {
        title: "نوی همکار",
        role: "تاسو په خپله لومړۍ ورځ نوی کارمند یاست.",
        objectives: ["د دفتر چاپیریال بیان کړئ", "ورځني کارونه تشریح کړئ", "یو ګټور مشوره ورکړئ"]
    },
    bank_account: {
        title: "د بانکي حساب خلاصول",
        role: "تاسو په کابل کې د بانک کارمند یاست.",
        objectives: ["د لیدنې دلیل تشریح کړئ", "د اسنادو په اړه پوښتنه وکړئ", "د موبایل بانکینګ ځانګړتیاو په اړه وپوښتئ"]
    },
    environmental_meeting: {
        title: "د چاپیریال په اړه د ټولنې ناسته",
        role: "تاسو د ټولنې تنظیم کونکي یاست.",
        objectives: ["د یوې ځانګړې پالیسۍ لپاره دلیل وړاندې کړئ", "د لګښت اندیښنو ته ځواب ووایاست", "یو پیچلی لید لوری لنډیز کړئ"]
    },
    tradition_vs_modernity: {
        title: "دود او عصريتوب",
        role: "تاسو یو مدرنیسټ یاست چې باور لرئ دودونه د پرمختګ مخه نیسي.",
        objectives: ["تاریخي او عصري ارزښتونه پرتله کړئ", "پرمختللي اصطلاحات وکاروئ", "کلتوري هویت تحلیل کړئ"]
    },
    travel_complaint: {
        title: "د سفر په اړه شکایت",
        role: "تاسو په هوایی ډګر کې د هوایی شرکت استازی یاست.",
        objectives: ["ستونزه تشریح کړئ", "د پیسو بیرته ورکولو یا بیا بکینګ غوښتنه وکړئ", "د هوټل په اړه پوښتنه وکړئ"]
    },
    apartment_dispute: {
        title: "د اپارتمان شخړه",
        role: "تاسو یو مالک یاست چې د ترمیم لپاره د پیسو ورکولو ته زړه نه ښه کوئ.",
        objectives: ["زیان بیان کړئ", "دلیل وړاندې کړئ چې ولې دا د مالک مسؤلیت دی", "د ترمیم په نیټه موافقه وکړئ"]
    },
    cultural_debate: {

        title: "د ټولنیزو رسنیو بحث",
        role: "تاسو یو ملګری یاست چې په ټیکنالوژۍ شک لرئ.",
        objectives: ["نظر څرګند کړئ", "دوه ملاتړي لاملونه وړاندې کړئ", "د یو ټکي په اړه ځوابي استدلال وکړئ"]
    },
    legal_consultation: {
        title: "قانوني مشوره",
        role: "تاسو یو وکیل یاست چې په فکري ملکیت کې تخصص لرئ.",
        objectives: ["د قرارداد څخه سرغړونه بیان کړئ", "د قانوني درملنې په اړه وپوښتئ", "د احتمالي پایلو په اړه بحث وکړئ"]
    },
    academic_seminar: {
        title: "علمي سیمینار",
        role: "تاسو د پوهنتون پروفیسور یاست.",
        objectives: ["خپل موقف لنډیز کړئ", "فرضي شواهد ذکر کړئ", "یوې نیوکې ته ځواب ووایئ"]
    },
    philosophical_debate: {
        title: "د AI اخلاق",
        role: "تاسو یو مشهور فیلسوف یاست.",
        objectives: ["یو پیچلی ذهني مفهوم تعریف کړئ", "پرمختللي استعارې وکاروئ", "طنز او نزاکتونه اداره کړئ"]
    },
    diplomatic_crisis: {
        title: "ډیپلوماټیک مذاکرات",
        role: "تاسو د یو سیال هیواد څخه لوړ پوړی ډیپلوماټ یاست.",
        objectives: ["ملي اندیښنې په غیر مستقیم ډول څرګندې کړئ", "یو پیچلی جوړجاړی وړاندیز کړئ", "سخت رسمي پروتوکول وساتئ"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
د AI ژبې ښوونکی (${levelName}). ${local.role}
د برلیټز قاعده: په ښکاره ډول غلطي مه سموئ. په طبیعي ډول د سمې ګرامر په کارولو سره د نظر تایید وکړئ.
مثال: زده کونکی: "ما پرون کیک خوړل" -> تاسو: "ما هم پرون **کیک وخوړل**، کوم خوند خوښوئ؟"

سناریو: ${local.title}
هدفونه: ${local.objectives.join(', ')}

لارښوونې:
۱. اعظمي ۲ جملې.
۲. ژبه: ${language}. انګلیسي مه کاروئ.
۳. په پای کې [ROMANIZATION: تلفظ] اضافه کړئ.
۴. کچه: ${levelName}。<|im_end|>
<|im_start|>user
خبرې اترې: ${history}
${systemEvent ? `پیښه: ${systemEvent}` : ''}
زده کونکی: ${action}
د ښوونکي ځواب:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
د ژبې ښوونکی. د کاروونکي په لیکنه کې غلطۍ سمې کړئ. که سم وي، ووایئ "غوره" (یا "Perfect").<|im_end|>
<|im_start|>user
اصلي: ${userInput}
اصلاح:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
لاندې متن ساده کړئ (د CEFR A1 کچه).<|im_end|>
<|im_start|>user
اصلي: ${narrativeText}
ساده شوی:<|im_end|>
<|im_start|>assistant
`;
};
