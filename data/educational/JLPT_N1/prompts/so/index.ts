import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Dalbashada Kafeega",
        role: "Waxaad tahay barista ka shaqeeya kafee mashquul ah.",
        objectives: ["Salaan baristaha", "Dalbo cabitaan", "Dalbo cunto", "Codso biilka"]
    },
    directions: {
        title: "Waydiinta Jidka",
        role: "Waxaad tahay qof deegaanka ah oo caawinaaya dadka jidka maraya.",
        objectives: ["Raali-gelin bixi si asluub leh", "Waydi weeye halka ay ku taal saldhigga tareenka", "U mahadcel qofka deegaanka ah"]
    },
    doctor_visit: {
        title: "Agagaarka Dhakhtarka",
        role: "Waxaad tahay dhakhtar. Isticmaalahu waa bukaan.",
        objectives: ["Sharax laba astaamood", "Faham talada dhakhtarka", "Weydii wax ku saabsan dawada"]
    },
    shopping_clothes: {
        title: "Iibsashada Dharka",
        role: "Waxaad tahay kaaliyaha dukaanka.",
        objectives: ["Weydii shay gaar ah", "Ka hadal cabirrada", "Weydii qiimaha"]
    },
    job_interview: {
        title: "Wareysiga Shaqada",
        role: "Waxaad tahay maareeyaha shaqaaleysiinta oo wareysanaya isticmaalaha shaqo tafaariiq ah.",
        objectives: ["Isku bar si xirfad leh", "Sharax khibradii hore", "Weydii su'aal ku saabsan doorka shaqada"]
    },
    meeting_friend: {
        title: "La kulanka saaxiib cusub",
        role: "Waxaad tahay arday jooga beer nasasho.",
        objectives: ["Sheeg magacaaga iyo halka aad ka timid", "Weydii qofka kale magiciisa", "Dheh sagootin asluub leh"]
    },
    planning_picnic: {
        title: "Qorshaynta dalxiis (Picnic)",
        role: "Waxaad tahay saaxiibka isticmaalaha.",
        objectives: ["Hubi cimilada", "Soo jeedi wakhti la kulan", "Go'aanso cuntada la keenayo"]
    },
    new_coworker: {
        title: "Saaxiib shaqo oo cusub",
        role: "Waxaad tahay shaqaale cusub maalintaada koowaad.",
        objectives: ["Sharax jawiga xafiiska", "Sharax hawlaha maalinlaha ah", "Sii talo waxtar leh"]
    },
    bank_account: {
        title: "Furitaanka akoon bangi",
        role: "Waxaad tahay karaani bangi oo jooga Muqdisho.",
        objectives: ["Sharax sababta booqashada", "Weydii dukumentiyada", "Weydii sifooyinka bangiga mobilada"]
    },
    environmental_meeting: {
        title: "Kulanka bulshada ee deegaanka",
        role: "Waxaad tahay qabanqaabiyaha bulshada.",
        objectives: ["U dood siyaasad gaar ah", "Ka jawaab walaacyada kharashka", "Soo koob aragti adcalculate"]
    },
    tradition_vs_modernity: {
        title: "Hiddaha vs Casriyeynta",
        role: "Waxaad tahay qof casri ah oo aaminsan in hidduhu hortaagan yihiin horumarka.",
        objectives: ["Isbarbardhig qiyamka taariikhiga ah iyo kuwa casriga ah", "Isticmaal oraahyo heer sare ah", "Falanqee aqoonsiga dhaqanka"]
    },
    travel_complaint: {
        title: "Cabashada Safarka",
        role: "Waxaad tahay wakiilka shirkadda diyaaradaha ee madaarka.",
        objectives: ["Sharax dhibaatada", "Codso lacag celin ama ballansasho cusub", "Weydii wax ku saabsan huteel"]
    },
    apartment_dispute: {
        title: "Muranka Guriga",
        role: "Waxaad tahay qof guri kireeyay oo aan rabin inuu bixiyo kharashka dayactirka.",
        objectives: ["Sharax waxyeelada", "Ku doodo sababta ay u tahay mas'uuliyadda qofka guriga leh", "Ku heshiiya taariikhda dayactirka"]
    },
    cultural_debate: {
        title: "Doodda Baraha Bulshada",
        role: "Waxaad tahay saaxiib shaki ka qaba tignoolajiyada.",
        objectives: ["Dhiibo ra'yi", "Bixi laba sababood oo taageeraya", "U jawaab qodob ka soo horjeeda"]
    },
    legal_consultation: {
        title: "Latalinta Sharciga",
        role: "Waxaad tahay qareen ku takhasusay hantida aqooneed.",
        objectives: ["Sharax jebinta qandaraaska", "Weydii wax ku saabsan dawaynta sharciga ah", "Ka hadal natiijooyinka suurtogalka ah"]
    },
    academic_seminar: {
        title: "Seminaarka Akadeemiyada",
        role: "Waxaad tahay borofiso jaamacadeed.",
        objectives: ["Soo koob mowqifkaaga", "Xigasho caddaymo mala-awaal ah", "U jawaab qodob naqdin ah"]
    },
    philosophical_debate: {
        title: "Anshaxa AI",
        role: "Waxaad tahay faylasuuf caan ah.",
        objectives: ["Qeex fikrad kakan oo aan muuqan", "Isticmaal tusaalayaal qoto dheer", "Maaree kaftanka iyo xeeladaha kale"]
    },
    diplomatic_crisis: {
        title: "Wada-hadallada Diblamaasiyadeed",
        role: "Waxaad tahay diblamaasi heer sare ah oo ka yimid dal ay xafiiltamaan.",
        objectives: ["Muuji welwelka qaranka si dadban", "Soo jeedi tanaasul kakan", "Ilaali hab-maamuuska rasmiga ah ee adag"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Shaqadaada: Sii wad sheekada ugu badnaan 1 ama 2 weedh.
Ha isticmaalin cinwaano, qaabka markdown ama sheeko aan loo baahnayn. Qor sheekada oo kaliya.
Had iyo jeer ku dar ficilka ciyaartoyga iyo dhacdo kasta oo nidaamka ah.
MUHIIM: HA ISTICMAALIN INGIRIISI. Luqadda: Soomaali.
Sax gelinta. Haddii ay sax tahay, dheh kaliya "Waa sax".
<|im_start|>user
Asalka: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Sii wad sheekada: Dhibcaha roobka ayaa dhalaalaya iftiinka neoonka hoostiisa intaad scan-garaynayso dariiqa aamusan. Waxaad dareemaysaa bisad yar oo kaa soo eegaysa gadaasha weelka qashinka.<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Macallin luqadeed oo caawiya.
Sax gelinta. Haddii ay sax tahay, dheh kaliya "Waa sax".
Ku sharax khaladaadka si kooban luqadda Soomaaliga.<|im_end|>
<|im_start|>user
Asalka: ${userInput}
Sixidda:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
U qor si ka fudud (CEFR A1).<|im_end|>
<|im_start|>user
Asalka: ${narrativeText}
Fududayn:<|im_end|>
<|im_start|>assistant
`;
};
