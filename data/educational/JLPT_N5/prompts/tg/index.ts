import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Sertar dar qahwaxona",
        role: "Shu mo kofexona korgari qahwaxona (barista) hasted.",
        objectives: ["Salom kardan ba korgar", "Qahwa xostan", "Xo'rok xostan", "Xisobro pursidan"]
    },
    directions: {
        title: "Pursidani roh",
        role: "Shu mo yak shaxsi mahalli hastid, ki dar roh ba odamon kumak mekunad.",
        objectives: ["Bo odob uzrxohi kardan", "Pursidan, ki istgohi rohiohan dar kujo ast", "Tashakkur ba shaxsi mahalli"]
    },
    doctor_visit: {
        title: "Nazdi duxtur",
        role: "Shu mo duxtur hasted. Istifodabardand bemor ast.",
        objectives: ["Du alomati bemoriro sharh dihed", "Tavsiyai duxturro fahmed", "Dar borai doru pursed"]
    },
    shopping_clothes: {
        title: "Xaridi libos",
        role: "Shu mo koriyari magoza hasted.",
        objectives: ["Dar borai yak libosi xos pursed", "Dar borai andozaho guftugu kuned", "Dar borai narx pursed"]
    },
    job_interview: {
        title: "Musohibai kor",
        role: "Shu mo mudiri istixdom hasted, ki bo istifodabardand baroi kor musohiba mekuned.",
        objectives: ["Xudro bo tauri kasbi muarriqi kuned", "Tachribai guzashtaro sharh dihed", "Dar borai vazifa yak savol pursed"]
    },
    meeting_friend: {
        title: "Mu'loqot bo d'usti nav",
        role: "Shu mo donishj'u dar bog' hasted.",
        objectives: ["Nom va paydoishi xudro big'uyed", "Nomi shaxsi digarro pursed", "Xushmuomila xayruxush kuned"]
    },
    planning_picnic: {
        title: "Banaqshagirii sayrugasht",
        role: "Shu mo d'usti korbar hasted.",
        objectives: ["Obu havoro taftish kuned", "Vaqti mu'loqotro peshnihod kuned", "Qaror kuned, ki ch'i x'urok biyored"]
    },
    new_coworker: {
        title: "Hamkori nav",
        role: "Shu mo kormandi nav dar r'uzi avvali xud hasted.",
        objectives: ["Muhiti idoraro sharh dihed", "Vazifahoi harr'uzaro fahmoned", "Maslihati mufid dihed"]
    },
    bank_account: {
        title: "Kushodani surathisobi bonk'i",
        role: "Shu mo kormandi bonk dar Dushanbe hasted.",
        objectives: ["Sababi tashrifro sharh dihed", "Dar borai huchchatno pursed", "Dar borai xususiyat_hoi bonkii mobil'i pursed"]
    },
    environmental_meeting: {
        title: "Jalasai jomeai ekolog'i",
        role: "Shu mo tashkilkunandai jomea hasted.",
        objectives: ["Baroi siyosati mushaxxas dalel ored", "Ba nigaronih'o dar borai xarojot posux dihed", "Nuqtai nazari murakkabro jam'bast kuned"]
    },
    tradition_vs_modernity: {
        title: "An'ana va muosir",
        role: "Shu mo yak modernist hasted, ki bovar dored an'anaho ba peshraft xalal merasonand.",
        objectives: ["Arzi_shoi ta'rix'i va muosirro muqoisa kuned", "Idiomahoi murakkabro istifoda bared", "Huviyati farhangiro tahlil kuned"]
    },
    travel_complaint: {
        title: "Shikoyati safar",
        role: "Shu mo koriyari shirkati havoi dar furudgoh hasted.",
        objectives: ["Mushkilro sharh dihed", "Bozgashti mablag' yo daxili nav xostan", "Dar borai mehmonxona pursed"]
    },
    apartment_dispute: {
        title: "Bahsi xona",
        role: "Shu mo sohibxona hasted, ki namexohad baroi ta'mir mablag' suporad.",
        objectives: ["Zararro sharh dihed", "Dalel ored, ki chiro in mas'uliyati sohibxona ast", "Dar borai sanachi ta'mir maslihat kuned"]
    },
    cultural_debate: {
        title: "Bahsi shabakahoi ichthimo'i",
        role: "Shu mo yak dust hasted, ki ba texnologiyahoi nav bo shubha nigoh mekuned.",
        objectives: ["Aqidai xudro bayon kuned", "Du daleli tasdiqkunanda ored", "Ba yak aqidai muxolif javob dihed"]
    },
    legal_consultation: {
        title: "Mashvarati huquqi",
        role: "Shu mo huquqshinosi sohai milkiyati intelektuali hasted.",
        objectives: ["Vajironi shartnomaro sharh dihed", "Dar borai rohohuquqi pursed", "Dar borai natijahoi ehtimoli guftugu kuned"]
    },
    academic_seminar: {
        title: "Seminari akademi",
        role: "Shu mo profesori donishgoh hasted.",
        objectives: ["Mavqei xudro xulosa kuned", "Dalelhoi farzi ored", "Ba yak tanqid javob dihed"]
    },
    philosophical_debate: {
        title: "Axloqi AI",
        role: "Shu mo faylasufi mashhur hasted.",
        objectives: ["Yak mafhumi murakkabi abstraktiro muayyan kuned", "Az metaforahoi peshrafta istifoda kuned", "Bo kinoya va nuzukrho kor kuned"]
    },
    diplomatic_crisis: {
        title: "Muzokiroti diplomati",
        role: "Shu mo diplomati sathi boloi yak kishvari raqib hasted.",
        objectives: ["Nigaronihoi milliro bo tauri g'ayrimustaqim bayon kuned", "Yak murosai murakkabro peshnihod kuned", "Protokoli rasmiro qatiyan rioya kuned"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Вазифаи шумо: Ҳикояро ДАҚИҚАН бо 1 ҷумлаи кӯтоҳ идома диҳед.
Танҳо ҳикояро нависед. Бе ягон сарлавҳа ё тавзеҳот.
МУҲИМ: ЗАБОНИ ИНГЛИСИРО КОР НАФАРМОЕД. Забон: Тоҷикӣ.
Оҳанги ҳикоя: Шодмон ва хеле содда (CEFR A1).
Мисол:
Ҳикоя то ин замон: Дар кӯча борон меборад.
Амали бозигар: ман ба атроф нигоҳ мекунам.
<|im_start|>user
Асл: ${userInput}
<|im_start|>user
Асл: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 ҷумла:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Омӯзгори забони оддӣ. Хатогиҳоро ислоҳ кунед. Агар дуруст бошад, "Оли" гӯед.<|im_end|>
<|im_start|>user
Асл: ${userInput}
Ислоҳ:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Онро соддатар кунед (3-5 калима).<|im_end|>
<|im_start|>user
Асл: ${narrativeText}
Соддашуда:<|im_end|>
<|im_start|>assistant
`;
};
