import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "سفارش در کافه",
        role: "شما یک باریستا در یک کافه شلوغ هستید.",
        objectives: ["سلام کردن به باریستا", "سفارش نوشیدنی", "سفارش غذا", "درخواست صورتحساب"]
    },
    directions: {
        title: "پرسیدن آدرس",
        role: "شما یک فرد محلی راهنما در خیابان هستید.",
        objectives: ["عذرخواهی مودبانه برای شروع صحبت", "پرسیدن آدرس ایستگاه قطار", "تشکر از فرد محلی"]
    },
    doctor_visit: {
        title: "ویزیت دکتر",
        role: "شما یک پزشک هستید. کاربر بیمار است.",
        objectives: ["توضیح دادن دو نشانه بیماری", "درک توصیه‌های پزشک", "پرسیدن در مورد دارو"]
    },
    shopping_clothes: {
        title: "خرید لباس",
        role: "شما یک فروشنده در مغازه هستید.",
        objectives: ["پرسیدن در مورد یک لباس خاص", "صحبت در مورد سایزها", "پرسیدن قیمت"]
    },
    job_interview: {
        title: "مصاحبه شغلی",
        role: "شما یک مدیر استخدام هستید که با کاربر برای یک شغل مصاحبه می‌کنید.",
        objectives: ["معرفی حرفه‌ای خود", "توضیح سوابق قبلی", "پرسیدن یک سوال در مورد جایگاه شغلی"]
    },
    meeting_friend: {
        title: "ملاقات با یک دوست جدید",
        role: "شما یک دانشجو در یک پارک هستید.",
        objectives: ["نام و اصالت خود را بیان کنید", "نام طرف مقابل را بپرسید", "خداحافظی محترمانه‌ای داشته باشید"]
    },
    planning_picnic: {
        title: "برنامه‌ریزی برای پیک‌نیک",
        role: "شما دوست کاربر هستید.",
        objectives: ["آب و هوا را بررسی کنید", "زمان ملاقات را پیشنهاد دهید", "در مورد غذایی که باید بیاورید تصمیم بگیرید"]
    },
    new_coworker: {
        title: "همکار جدید",
        role: "شما یک کارمند جدید در اولین روز کاری خود هستید.",
        objectives: ["محیط دفتر را توصیف کنید", "وظایف روزانه را توضیح دهید", "یک نکته مفید ارائه دهید"]
    },
    bank_account: {
        title: "افتتاح حساب بانکی",
        role: "شما یک کارمند بانک در تهران هستید.",
        objectives: ["دلیل بازدید را توضیح دهید", "در مورد مدارک سوال کنید", "در مورد ویژگی‌های بانکداری تلفن همراه بپرسید"]
    },
    environmental_meeting: {
        title: "جلسه اجتماعی محیط زیست",
        role: "شما یک سازمان‌دهنده اجتماعی هستید.",
        objectives: ["دلیلی برای یک سیاست خاص بیاورید", "به نگرانی‌های مربوط به هزینه پاسخ دهید", "یک دیدگاه پیچیده را خلاصه کنید"]
    },
    tradition_vs_modernity: {
        title: "سنت در مقابل مدرنیته",
        role: "شما یک مدرنیست هستید که معتقدید سنت‌ها مانع پیشرفت می‌شوند.",
        objectives: ["ارزش‌های تاریخی و مدرن را مقایسه کنید", "از اصطلاحات پیشرفته استفاده کنید", "هویت فرهنگی را تحلیل کنید"]
    },
    travel_complaint: {

        title: "شکایت در سفر",
        role: "شما یک مامور شرکت هواپیمایی در فرودگاه هستید.",
        objectives: ["توضیح مشکل", "درخواست بازپرداخت یا رزرو مجدد", "پرسیدن در مورد هتل"]
    },
    apartment_dispute: {
        title: "اختلاف در مورد آپارتمان",
        role: "شما صاحبخانه‌ای هستید که تمایلی به پرداخت هزینه تعمیرات ندارد.",
        objectives: ["توضیح خسارت", "استدلال در مورد مسئولیت صاحبخانه", "توافق بر سر تاریخ تعمیر"]
    },
    cultural_debate: {
        title: "بحث در مورد شبکه‌های اجتماعی",
        role: "شما یک دوست شکاک نسبت به تکنولوژی هستید.",
        objectives: ["بیان نظر", "ارائه دو دلیل حمایتی", "پاسخ به یک استدلال مخالف"]
    },
    legal_consultation: {
        title: "مشاوره حقوقی",
        role: "شما یک وکیل متخصص در مالکیت معنوی هستید.",
        objectives: ["توضیح نقض قرارداد", "پرسیدن در مورد راه‌کارهای قانونی", "بحث در مورد نتایج احتمالی"]
    },
    academic_seminar: {
        title: "سمینار آکادمیک",
        role: "شما یک استاد دانشگاه هستید.",
        objectives: ["خلاصه کردن موضع خود", "نقل شواهد فرضی", "پاسخ به یک نقد اساسی"]
    },
    philosophical_debate: {
        title: "اخلاق در هوش مصنوعی",
        role: "شما یک فیلسوف مشهور هستید.",
        objectives: ["تعریف یک مفهوم انتزاعی پیچیده", "استفاده از استعاره‌های پیشرفته", "مدیریت کنایه و ظرافت‌های کلامی"]
    },
    diplomatic_crisis: {
        title: "مذاکره دیپلماتیک",
        role: "شما یک دیپلمات بلندپایه از یک کشور رقیب هستید.",
        objectives: ["بیان غیرمستقیم نگرانی‌های ملی", "پیشنهاد یک مصالحه پیچیده", "رعایت پروتکل‌های رسمی سختگیرانه"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

وظیفه شما: داستان را دقیقاً در ۱ جمله کوتاه ادامه دهید.
فقط خود داستان را بنویسید. بدون عنوان یا توضیح.
در پایان، [ROMANIZATION: آوانگاری] را اضافه کنید.
حیاتی: از انگلیسی استفاده نکنید. زبان: فارسی.
لحن: شاد و بسیار ساده (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
۱ جمله:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
معلم زبان ساده. ورودی را اصلاح کنید. اگر درست است، بگویید "عالی."<|im_end|>
<|im_start|>user
اصلی: ${userInput}
اصلاح:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
آن را ساده‌تر کنید (۳-۵ کلمه).<|im_end|>
<|im_start|>user
اصلی: ${narrativeText}
ساده‌شده:<|im_end|>
<|im_start|>assistant
`;
};
