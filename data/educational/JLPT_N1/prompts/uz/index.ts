import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kafeda buyurtma berish",
        role: "Siz gavjum kafeda baristasiz.",
        objectives: ["Barista bilan salomlashing", "Ichimlik buyurtma qiling", "Ovqat buyurtma qiling", "Hisobni so'rang"]
    },
    directions: {
        title: "Yo'l so'rash",
        role: "Siz ko'chada yordam beradigan mahalliy aholi vakilisiz.",
        objectives: ["Xushmuomalalik bilan uzr so'rang", "Temir yo'l vokzali qayerdaligini so'rang", "Mahalliy aholiga rahmat ayting"]
    },
    doctor_visit: {
        title: "Shifokor huzurida",
        role: "Siz shifokorsiz. Foydalanuvchi esa bemor.",
        objectives: ["Ikkita simptomni tasvirlang", "Shifokor maslahatini tushunib oling", "Dori haqida so'rang"]
    },
    shopping_clothes: {
        title: "Kiyim sotib olish",
        role: "Siz do'kon yordamchisiz.",
        objectives: ["Muayyan buyumni so'rang", "O'lchamlarni muhokama qiling", "Narxini so'rang"]
    },
    job_interview: {
        title: "Ish suhbati",
        role: "Siz chakana savdo ishi uchun foydalanuvchi bilan suhbat o'tkazayotgan ishga qabul qilish menejerisiz.",
        objectives: ["O'zingizni professional tarzda tanishtiring", "O'tmishdagi tajribangizni tasvirlang", "Lavozim haqida savol bering"]
    },
    meeting_friend: {
        title: "Yangi do'st bilan uchrashish",
        role: "Siz parkdagi talabasiz.",
        objectives: ["Ismingizni va qayerdan ekanligingizni ayting", "Boshqa odamning ismini so'rang", "Xushmuomalalik bilan xayrlashing"]
    },
    planning_picnic: {
        title: "Piknikni rejalashtirish",
        role: "Siz foydalanuvchining do'stisiz.",
        objectives: ["Ob-havoni tekshiring", "Uchrashuv vaqtini taklif qiling", "Qanday ovqat olib kelishni hal qiling"]
    },
    new_coworker: {
        title: "Yangi hamkasb",
        role: "Siz birinchi kuningizdagi yangi xodimsiniz.",
        objectives: ["Ofis muhitini tasvirlang", "Kundalik vazifalarni tushuntiring", "Foydali maslahat bering"]
    },
    bank_account: {
        title: "Bank hisobini ochish",
        role: "Siz Toshkentdagi bank xodimisiz.",
        objectives: ["Tashrif sababini tushuntiring", "Hujjatlar haqida so'rang", "Mobil banking xususiyatlari haqida so'rang"]
    },
    environmental_meeting: {
        title: "Ekologik jamoat yig'ilishi",
        role: "Siz jamoat tashkilotchisisiz.",
        objectives: ["Muayyan siyosat uchun dalil keltiring", "Xarajatlar bo'yicha xavotirlarga javob bering", "Murakkab nuqtai nazarni xulosa qiling"]
    },
    tradition_vs_modernity: {
        title: "An'ana vs Zamonaviylik",
        role: "Siz an'analar taraqqiyotga to'sqinlik qiladi deb ishonadigan modernistiz.",
        objectives: ["Tarixiy va zamonaviy qadriyatlarni solishtiring", "Murakkab iboralardan foydalaning", "Madaniy o'zlikni tahlil qiling"]
    },
    travel_complaint: {
        title: "Sayohat bo'yicha shikoyat",
        role: "Siz aeroportdagi aviakompaniya agentisiz.",
        objectives: ["Muammoni tushuntiring", "Pulni qaytarish yoki qayta bron qilishni so'rang", "Mehmonxona haqida so'rang"]
    },
    apartment_dispute: {
        title: "Kvartira bo'yicha nizo",
        role: "Siz ta'mirlash uchun pul to'lashni istamayotgan uy egasisiz.",
        objectives: ["Zararni tasvirlang", "Nima uchun bu uy egasining mas'uliyati ekanligini isbotlang", "Ta'mirlash sanasi bo'yicha kelishib oling"]
    },
    cultural_debate: {
        title: "Ijtimoiy tarmoqlar bo'yicha bahs",
        role: "Siz texnologiyaga shubha bilan qaraydigan do'stisiz.",
        objectives: ["Fikr bildiring", "Ikkita asoslovchi sabab keltiring", "Qarshi dalilga javob bering"]
    },
    legal_consultation: {
        title: "Yuridik maslahat",
        role: "Siz intellektual mulk sohasida ixtisoslashgan advokatsiz.",
        objectives: ["Shartnomaning buzilishini tushuntiring", "Huquqiy himoya vositalari haqida so'rang", "Mumkin bo'lgan natijalarni muhokama qiling"]
    },
    academic_seminar: {
        title: "Akademik seminar",
        role: "Siz universitet professorisiz.",
        objectives: ["O'z pozitsiyangizni yakunlang", "Faraziy dalillarni keltiring", "Tanqidiy nuqtaga javob bering"]
    },
    philosophical_debate: {
        title: "AI etikasi",
        role: "Siz mashhur faylasufsiz.",
        objectives: ["Murakkab mavhum tushunchani aniqlang", "Murakkab metaforalardan foydalaning", "Kesatiq va nozik jihatlarni boshqaring"]
    },
    diplomatic_crisis: {
        title: "Diplomatik muzokaralar",
        role: "Siz raqib davlatning yuqori martabali diplomatidiriz.",
        objectives: ["Milliy manfaatlarni bilvosita ifoda eting", "Murakkab murosani taklif qiling", "Qat'iy rasmiy protokolga rioya qiling"]
    }
};

/**
 * UZ Educational Narrative Prompt
 */

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Sizning vazifangiz: Hikoyani ko'pi bilan 1 yoki 2 jumlada davom ettiring.
Sarlavhalar, markdown formati yoki ortiqcha gaplardan foydalanmang. Faqat hikoyaning o'zini yozing.
Har doim o'yinchi harakati va har qanday tizim voqealarini kiriting.
MUHIM: INGLIZ TILIDAN FOYDALANMANG. Til: O'zbek tili.
Ton: Tasviriy va qiziqarli.
Misol:
Hozirgacha bo'lgan hikoya: Ko'chada yomg'ir yog'yapti.
O'yinchi harakati: Atrofimga qarayman.
Kiritilgan matnni tuzating. Agar u to'g'ri bo'lsa, faqat "Ajoyib" deb ayting.
<|im_start|>user
Asl nusxa: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Hikoyani davom ettiring:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Yordamchi til o'qituvchisi.
Kiritilgan matnni tuzating. Agar u to'g'ri bo'lsa, faqat "Ajoyib" deb ayting.
Xatolarni o'zbek tilida qisqacha tushuntiring.<|im_end|>
<|im_start|>user
Asl nusxa: ${userInput}
Tuzatish:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Oddiyroq qilib yozing (CEFR A1).<|im_end|>
<|im_start|>user
Asl nusxa: ${narrativeText}
Soddalashtirilgan:<|im_end|>
<|im_start|>assistant
`;
};
