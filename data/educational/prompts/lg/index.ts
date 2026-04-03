import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Oda ni kafe",
        role: "Ndi barista ni kafe ebijjula abantu.",
        objectives: ["Galamusa barista", "Oda ekyokunywa", "Oda emmere", "Saba bbiiru"]
    },
    directions: {
        title: "Okubuuza ekkubo",
        role: "Ndi munnansi ayamba ku kkubo.",
        objectives: ["Yetonda mu ngeri ey'ekitiibwa", "Buuza webali sitayiseni y'egaali y'omukka", "Yeebaza munnansi"]
    },
    doctor_visit: {
        title: "Ewa musawo",
        role: "Ndi musawo. Omukozesa mulwadde.",
        objectives: ["Nnyonnyola obubonero bubiri", "Tegeera okuwuliriza kwa musawo", "Buuza ku ddagala"]
    },
    shopping_clothes: {
        title: "Okugula ebyambalo",
        role: "Ndi muyambi mu dduuka.",
        objectives: ["Buuza ku kyambalo eky'enjawulo", "Teesa ku bipimo (size)", "Buuza omuwendo"]
    },
    job_interview: {
        title: "Okubuzibwa ebibuuzo by'omulimu",
        role: "Oli mukozi akulira eby'okuwandiika abakozi ng'obuuza omukozesa ebibuuzo ku mulimu gw'okutunda.",
        objectives: ["Nnyonnyola ebikukwatako mu ngeri ey'ekikugu", "Nnyonnyola obumanyirivu bwo obw'emabega", "Buuza ekibuuzo ku mulimu guno"]
    },
    meeting_friend: {
        title: "Okusisinkana mukwano gwo omuggya",
        role: "Oli muyizi mu ppaaka.",
        objectives: ["Yogera erinnya lyo n'ebikukwatako", "Buuza munno erinnya lye", "Siibula mu ngeri ey'ekibabu"]
    },
    planning_picnic: {
        title: "Okuteekateeka akabaga",
        role: "Oli mukwano gw'omukozesa.",
        objectives: ["Kebera embeera y'obudde", "Sembayo ekiseera ky'okusisinkana", "Salawo emmere ey'okuleeta"]
    },
    new_coworker: {
        title: "Mukozi munno omuggya",
        role: "Oli mukozi muggya ku lunaku lwo olusooka.",
        objectives: ["Nnyonnyola embeera y'omu ofiisi", "Nnyonnyola emirimu gya buli lunaku", "Gaba amagezi agayamba"]
    },
    bank_account: {
        title: "Okuggulawo akawunti y'ebbanka",
        role: "Oli mukozi w'ebbanka mu Kampala.",
        objectives: ["Nnyonnyola ensonga ekulesse", "Buuza ku biwandiiko ebyetaagisa", "Buuza ku ngeri y'okukozesa ebbanka ku ssimu"]
    },
    environmental_meeting: {
        title: "Olukiiko lw'ekitundu ku butonde bw'ensi",
        role: "Oli muteesiteesi w'ebikolewa mu kitundu.",
        objectives: ["Lwana ku lwa ntekateeka emu", "Yanukula ku nsonga z'ebbeeyi", "Funza endowooza enzibu"]
    },
    tradition_vs_modernity: {
        title: "Obuwangwa n'omulembe omuggya",
        role: "Oli muntu ow'omulembe omuggya akkiriza nti obuwangwa buziyiza enkulaakulana.",
        objectives: ["Geraageranya empisa ez'edda n'ez'omulembe guno", "Kozesa ebigambo ebikulu", " wekebeje obuwangwa bwo"]
    },
    travel_complaint: {
        title: "Okwemulugunya ku lugendo",
        role: "Oli mukozi w'enyonyi ku kisaawe.",
        objectives: ["Nnyonnyola ekizibu", "Saba ssente zo okukuddirwa oba okukyusa olunaku", "Buuza ku woteri"]
    },
    apartment_dispute: {
        title: "Enkaayana z'ennyumba",
        role: "Ndi nnannyini nnyumba atayagala kusasula byakumalawo bisago.",
        objectives: ["Nnyonnyola ekononefu", "Laga ensonga lwaki nnannyini nnyumba y'alina okusasula", "Kkiriziganya ku lunaku lw'okuddaabiriza"]
    },
    cultural_debate: {
        title: "Okuteesa ku mikutu gya mbeera z'abantu",
        role: "Ndi mukwano gwo atayagala nnyo bya tekinologiya.",
        objectives: ["Laga endowezza yo", "Wa ensonga ebbiri ezikuwagira", "Ddamu omuntu akugamba ekikontana"]
    },
    legal_consultation: {
        title: "Okwebuuza ku bannamateeka",
        role: "Ndi looya akuggyidde mu by'obunnyini bw'ebikole n'ebirowoozo.",
        objectives: ["Nnyonnyola okumenya endagaano", "Buuza ku ngeri ey'amateeka ey'okuyambibwamu", "Teesa ku bivaamu"]
    },
    academic_seminar: {
        title: "Okuteesa kw'abasomesa",
        role: "Ndi pulofeesa wa yunivasite.",
        objectives: ["Funza endowezza yo", "Juliza obujulizi obuteeberezebwa", "Ddamu omuntu akunenya"]
    },
    philosophical_debate: {
        title: "Empisa za AI",
        role: "Ndi munnassayansi ow'ebirowoozo amanyiddwa ennyo.",
        objectives: ["Nnyonnyola ekirowoozo ekizibu", "Kozesa eby'okulabirako ebizibu", "Kola ku ngeri y'okusekerera"]
    },
    diplomatic_crisis: {
        title: "Okuteesa kw'ababaka",
        role: "Ndi mubaka ow'omuyingo okuva mu nsi evuganya.",
        objectives: ["Laga ebirowoozo by'eggwanga mu ngeri ey'ekyama", "Semba okukkiriziganya okuzibu", "Kuumira ddala empisa ez'ekikugu"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
Musomesa w'olulimi owa AI (${levelName}). ${local.role}
Etteeka lya Berlitz: Terekereza omuyizi mu ngeri ey'olwatu. Kakasa ekirowoozo kye naye kozesa nnamateeka omutuufu mu kuddamu kwo.
Ekyokulabirako: Omuyizi: "Nze riri kake jjo" -> Gwe: "Nange jjo **nalidde kake**, kika ki ky'oyagala?"

Scenario: ${local.title}
Ebigendererwa: ${local.objectives.join(', ')}

Ebiragiro:
1. Sentensi 1 oba 2 zokka.
2. Olulimi: ${language}. TOKOZESA LUNGEREZA.
3. Eddaala: ${levelName}.<|im_end|>
<|im_start|>user
Okuteesa: ${history}
${systemEvent ? `Ekibaddewo: ${systemEvent}` : ''}
Omuyizi: ${action}
Okuddamu kwa musomesa:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Musomesa w'olulimi. Tereereza ensobi mu bintu omukozesa byawandiise. Bwekiba kituufu, gamba nti "Kirungi nnyo" (oba "Perfect").<|im_end|>
<|im_start|>user
Original: ${userInput}
Okutereereza:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Kola ekiwandiiko kino mu ngeri ennyangu (eddaala lya CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Okunnyonnyola mu ngeri ennyangu:<|im_end|>
<|im_start|>assistant
`;
};
