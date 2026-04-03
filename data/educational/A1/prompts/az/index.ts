import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kafedə Sifariş",
        role: "Siz məşğul bir kafedə baristasınız.",
        objectives: ["Barista ilə salamlaşın", "İçki sifariş edin", "Yemək sifariş edin", "Hesabı istəyin"]
    },
    directions: {
        title: "İstiqamət Soruşmaq",
        role: "Siz küçədə köməksevər bir yerli sakinsiniz.",
        objectives: ["Nəzakətlə üzr istəyin", "Qatar stansiyasının harada olduğunu soruşun", "Sakinə təşəkkür edin"]
    },
    doctor_visit: {
        title: "Həkim Yanında",
        role: "Siz həkimsiniz. İstifadəçi isə pasiyentdir.",
        objectives: ["İki simptomu təsvir edin", "Həkimin məsləhətini anlayın", "Dərman haqqında soruşun"]
    },
    shopping_clothes: {
        title: "Paltar Alış-verişi",
        role: "Siz mağaza köməkçisiniz.",
        objectives: ["Xüsusi bir məhsul soruşun", "Ölçüləri müzakirə edin", "Qiymət haqqında soruşun"]
    },
    job_interview: {
        title: "İş Müsahibəsi",
        role: "Siz pərakəndə satış işi üçün istifadəçi ilə müsahibə aparan işə qəbul menecerisiniz.",
        objectives: ["Özünüzü peşəkar şəkildə təqdim edin", "Keçmiş təcrübənizi təsvir edin", "Vəzifə ilə bağlı sual verin"]
    },
    meeting_friend: {
        title: "Yeni Dostla Tanışlıq",
        role: "Siz parkda tələbəsiniz.",
        objectives: ["Adınızı və mənşəyinizi bildirin", "Digər şəxsin adını soruşun", "Nəzakətlə sağollaşın"]
    },
    planning_picnic: {
        title: "Piknik Planlaşdırmaq",
        role: "Siz istifadəçinin dostusunuz.",
        objectives: ["Havanı yoxlayın", "Görüş vaxtı təklif edin", "Hansı yeməyi gətirəcəyinizə qərar verin"]
    },
    new_coworker: {
        title: "Yeni İş Yoldaşı",
        role: "Siz ilk iş gününüzdə yeni işçisiniz.",
        objectives: ["Ofis mühitini təsvir edin", "Gündəlik tapşırıqları izah edin", "Faydalı bir məsləhət verin"]
    },
    bank_account: {
        title: "Bank Hesabı Açmaq",
        role: "Siz Bakıda bank işçisisiniz.",
        objectives: ["Səfərin səbəbini izah edin", "Sənədlər haqqında soruşun", "Mobil bankçılıq funksiyaları haqqında soruşun"]
    },
    environmental_meeting: {
        title: "Ekoloji İcma İclası",
        role: "Siz icma təşkilatçısınız.",
        objectives: ["Müəyyən bir siyasət üçün arqument gətirin", "Xərclərlə bağlı narahatlıqlara cavab verin", "Mürəkkəb bir baxış bucağını ümumiləşdirin"]
    },
    tradition_vs_modernity: {
        title: "Ənənə vs Müasirlik",
        role: "Siz ənənələrin tərəqqiyə mane olduğuna inanan bir müasirsiniz.",
        objectives: ["Tarixi və müasir dəyərləri müqayisə edin", "Qabaqcıl idiomlardan istifadə edin", "Mədəni kimliyi təhlil edin"]
    },
    travel_complaint: {

        title: "Səyahət Şikayəti",
        role: "Siz hava limanında aviaşirkət agentisiniz.",
        objectives: ["Problemi izah edin", "Geri ödəniş və ya yenidən rezervasiya tələb edin", "Mehmanxana haqqında soruşun"]
    },
    apartment_dispute: {
        title: "Mənzil Mübahisəsi",
        role: "Siz təmir üçün pul ödəməyə tərəddüd edən ev sahibisiniz.",
        objectives: ["Zərəri təsvir edin", "Niyə məsuliyyətin ev sahibində olduğunu əsaslandırın", "Təmir tarixi barədə razılaşın"]
    },
    cultural_debate: {
        title: "Sosial Media Mübahisəsi",
        role: "Siz texnologiyaya şübhə ilə yanaşan bir dostsunuz.",
        objectives: ["Fikir bildirin", "İki dəstəkləyici səbəb göstərin", "Bir fikrə qarşı arqument gətirin"]
    },
    legal_consultation: {
        title: "Hüquqi Məsləhət",
        role: "Siz əqli mülkiyyət sahəsində ixtisaslaşmış vəkilsiniz.",
        objectives: ["Müqavilənin pozulmasını izah edin", "Hüquqi müdafiə vasitələri haqqında soruşun", "Mümkün nəticələri müzakirə edin"]
    },
    academic_seminar: {
        title: "Akademik Seminar",
        role: "Siz universitet professorusunuz.",
        objectives: ["Mövqeyinizi ümumiləşdirin", "Fərziyyəvi sübutlara istinad edin", "Tənqidi əks-arqumentə cavab verin"]
    },
    philosophical_debate: {
        title: "Sİ Etikası",
        role: "Siz tanınmış filosofsunuz.",
        objectives: ["Mürəkkəb mücərrəd anlayışı tərif edin", "Mürəkkəb metaforalardan istifadə edin", "İroniya və nüansları idarə edin"]
    },
    diplomatic_crisis: {
        title: "Diplomatik Danışıqlar",
        role: "Siz rəqib ölkədən yüksək rütbəli diplomatsınız.",
        objectives: ["Milli narahatlıqları dolayı yolla ifadə edin", "Mürəkkəb kompromis təklif edin", "Ciddi rəsmi protokola riayət edin"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tapşırığınız: Hekayəni DƏQİQ 1 qısa cümlə ilə davam etdirin.
Yalnız hekayəni yazın. Başlıqlar və ya izahatlar yoxdur.
VACİB: İNGİLİS DİLİNDƏN İSTİFADƏ ETMƏYİN. Dil: Azərbaycan dili.
Ton: Şən və çox sadə (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 cümlə:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Sadə dil müəllimi. Girişi düzəldin. Əgər doğrudursa, "Mükəmməl" deyin.<|im_end|>
<|im_start|>user
Orijinal: ${userInput}
Düzəliş:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Daha sadə edin (3-5 söz).<|im_end|>
<|im_start|>user
Orijinal: ${narrativeText}
Sadələşdirilmiş:<|im_end|>
<|im_start|>assistant
`;
};
