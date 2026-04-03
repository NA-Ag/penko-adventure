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
Barsiisaa afaanii AI (${levelName}). ${local.role}
Seera Berlitz: Kallattiin hin sirreessin. Seera afaanii sirrii ta'e fayyadamuun yaada isaa mirkaneessi.
Fakkeenya: Tayyiitaa: "Ani kaleessa keek nyaachuu" -> Ati: "Anis kaleessa **keek nyaadheera**, akaakuu kam jaallatta?"

Scenario: ${local.title}
Galmawwan: ${local.objectives.join(', ')}

Qaajeelfama:
1. Hima 1 yookaan 2 qofa.
2. Afaan: ${language}. AFAAN INGILIFFÂ DHORKAADHÂ.
3. Sadaarkaa: ${levelName}.<|im_end|>
<|im_start|>user
Marii: ${history}
${systemEvent ? `Ta'ee: ${systemEvent}` : ''}
Tayyiitaa: ${action}
Deebii barsiisaa:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * OM Educational Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Barsiisaa afaanii. Dogoggora galtee tayyitaa keessaa sirreessi. Yoo sirrii ta'e, "Baay'ee gaarii" (yookaan "Perfect") jedhi.<|im_end|>
<|im_start|>user
Kan duraa: ${userInput}
Sirreeffama:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * OM Educational Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Barreeffama armaan gadii salphisi (sadaarkaa CEFR A1).<|im_end|>
<|im_start|>user
Kan duraa: ${narrativeText}
Salphifamaa:<|im_end|>
<|im_start|>assistant
`;
};
