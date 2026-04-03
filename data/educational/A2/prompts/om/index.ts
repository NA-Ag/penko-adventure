import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kaffee keessatti ajajuu",
        role: "Ati kaffee namni baay'atu keessatti baristaadha.",
        objectives: ["Baristicha nagaa gaafadhu", "Dhugaatii ajaji", "Nyaata ajaji", "Hisaaba gaafadhu"]
    },
    directions: {
        title: "Karaa gaafachuu",
        role: "Ati nama naannoo karaa irratti nama gargaaruudha.",
        objectives: ["Kabajaan dhiifama gaafadhu", "Buufanni baaburaa eessa akka jiru gaafadhu", "Nama naannoo galateeffadhu"]
    },
    doctor_visit: {
        title: "Hakiima bira",
        role: "Ati hakiimadha. Fayyadamaan immoo dhukkubsataadha.",
        objectives: ["Mallattoolee lama ibsi", "Gorsa hakiimaa hubadhu", "Qoricha gaafadhu"]
    },
    shopping_clothes: {
        title: "Uffata bitachuu",
        role: "Ati gargaaraa suuqiiti.",
        objectives: ["Meessaa adda ta'e gaafadhu", "Hammi isaa irratti mari'adhu", "Gatii isaa gaafadhu"]
    },
    job_interview: {
        title: "Gaaffii fi deebii hojii",
        role: "Ati bulchaa qaxaraa hojii daldalaaf fayyadamaa gaafachaa jirudha.",
        objectives: ["Akka ogummaatti of beeksisi", "Muuxannoo darbe ibsi", "Gaaffii waa'ee hojii gaafadhu"]
    },
    meeting_friend: {
        title: "Michuu haaraa qunnamuu",
        role: "Ati barataa paarkii keessa jirudha.",
        objectives: ["Maqaa kee fi bakka dhalootaa ibsi", "Maqaa nama biraa gaafadhu", "Kabajaan nagaatti jedhi"]
    },
    planning_picnic: {
        title: "Pikinikii karoorsuu",
        role: "Ati michuu fayyadamaati.",
        objectives: ["Haala qilleensaa sakatta'i", "Yeroo walga'ii yaada dhiyeessi", "Nyaata akkamii akka fiddu murteessi"]
    },
    new_coworker: {
        title: "Hiriya hojii haaraa",
        role: "Ati hojjetaa haaraa guyyaa jalqabaa keeti.",
        objectives: ["Haala waajjiraa ibsi", "Hojii guyyaa guyyaa ibsi", "Gorsa fayyadu kenni"]
    },
    bank_account: {
        title: "Akkaawuntii baankii banuu",
        role: "Ati hojjetaa baankii Finfinnee keessatti.",
        objectives: ["Sababa daawwannaa ibsi", "Waraqaa gaafadhu", "Tajaajila baankii moobaayilaa gaafadhu"]
    },
    environmental_meeting: {
        title: "Walga'ii hawaasa naannoo",
        role: "Ati qindeessaa hawaasaati.",
        objectives: ["Imaammata murtaa'eef falmi", "Yaaddoo baasii irratti deebii kenni", "Ilaalcha walxaxaa gabaabsi"]
    },
    tradition_vs_modernity: {
        title: "Aadaa vs Ammayyummaa",
        role: "Ati ammayyeessaa aadaan guddina danqa jedhuudha.",
        objectives: ["Gatii seenaa fi ammayyaa wal bira qabi", "Mammaaksa ol'aanaa fayyadami", "Eenyummaa aadaa xiinxali"]
    },
    travel_complaint: {
        title: "Koomii imalaa",
        role: "Ati hojjetaa sarara xiyyaaraa buufata xiyyaaraa keessatti.",
        objectives: ["Rakkina ibsi", "Maallaqa akka deebi'u ykn bakka biraa akka qabamu gaafadhu", "Waa'ee hoteelaa gaafadhu"]
    },
    apartment_dispute: {
        title: "Falmii kireeffannaa",
        role: "Ati abbaa manaa suphaaf kaffaluu hin barbaannedha.",
        objectives: ["Miidhaa ibsi", "Maaliif itti gaafatamummaa abbaa manaa akka ta'e falmi", "Guyyaa suphaa irratti walii gali"]
    },
    cultural_debate: {
        title: "Marii miidiyaa hawaasaa",
        role: "Ati michuu teeknooloojii shakkudha.",
        objectives: ["Ilaalcha kee ibsi", "Sababa deeggaraa lama kenni", "Yaada mormii irratti deebii kenni"]
    },
    legal_consultation: {
        title: "Gorsa seeraa",
        role: "Ati abukaatoo qabeenya sammuu irratti ogummaa qabudha.",
        objectives: ["Cabinsa waliigaltee ibsi", "Furmaata seeraa gaafadhu", "Bu'aa ta'uu danda'an irratti mari'adhu"]
    },
    academic_seminar: {
        title: "Seminaara barnootaa",
        role: "Ati pirofeesara yunivarsiitiiti.",
        objectives: ["Ilaalcha kee gabaabsi", "Ragaa yaadaa dhiyeessi", "Qeeqaf deebii kenni"]
    },
    philosophical_debate: {
        title: "Naamusni AI",
        role: "Ati falaasama beekamadha.",
        objectives: ["Yaada walxaxaa ibsi", "Akkasummaa gadi fagoo fayyadami", "Iroonii fi bal'ina qabi"]
    },
    diplomatic_crisis: {
        title: "Marii dippilomaasii",
        role: "Ati dippilomaatii sadarkaa ol'aanaa biyya morkattuu irraati.",
        objectives: ["Yaaddoo biyyaa karaa al-kallattiin ibsi", "Waliigaltee walxaxaa yaada dhiyeessi", "Sirna mootummaa jabaa eagi"]
    }
};

/**
 * OM Educational Narrative Prompt
 */

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Hojiin kee: Seenicha yoo baay'ate hima 1 ykn 2n itti fufi.
Mata-duree, bifa markdown ykn dubbii tarree hin fayyadamin. Seenicha qofa barreessi.
Yeroo hunda gocha taphataa fi mudannoo sirnaa kamiyyuu dabaladhu.
MURTEESSAA: INGLIFFFA HIN FAYYADAMIN. Afaan: Afaan Oromoo.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Seenicha itti fufi: Utuu ati karaa cal'isaa sana sakatta'uun bokkaan ibsaa neeyon jalaatti calaqqisa. Adurree xiqqoo tokko kan qodaa kosiitti gadi dhufe si ilaalu hubatta.<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Barsiisaa afaanii gargaaraa.
Galfata sirreessi. Yoo sirrii ta'e, "Gaarii dha" qofa jedhi.
Dogoggora Afaan Oromootiin gabaabsanii ibsi.<|im_end|>
<|im_start|>user
Kan jalqabaa: ${userInput}
Sirreeffama:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Salphaatti barreessi (CEFR A1).<|im_end|>
<|im_start|>user
Kan jalqabaa: ${narrativeText}
Salphaa:<|im_end|>
<|im_start|>assistant
`;
};
