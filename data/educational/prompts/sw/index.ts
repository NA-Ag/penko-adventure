import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kuagiza katika Kahawa",
        role: "Wewe ni mhudumu wa kahawa (barista) katika duka lenye shughuli nyingi.",
        objectives: ["Msalimie mhudumu", "Agiza kinywaji", "Agiza chakula", "Omba bili"]
    },
    directions: {
        title: "Kuuliza Njia",
        role: "Wewe ni mwenyeji msaada mitaani.",
        objectives: ["Omba radhi kwa adabu", "Uliza kituo cha treni kiko wapi", "Mshukuru mwenyeji"]
    },
    doctor_visit: {
        title: "Kwa Daktari",
        role: "Wewe ni daktari. Mtumiaji ni mgonjwa.",
        objectives: ["Eleza dalili mbili", "Elewa ushauri wa daktari", "Uliza kuhusu dawa"]
    },
    shopping_clothes: {
        title: "Kununua Nguo",
        role: "Wewe ni msaidizi wa duka.",
        objectives: ["Ulizia bidhaa maalum", "Jadili saizi", "Uliza kuhusu bei"]
    },
    job_interview: {
        title: "Mahojiano ya Kazi",
        role: "Wewe ni meneja unayeajiri unayemhoji mtumiaji kwa kazi ya rejareja.",
        objectives: ["Jitambulishe kitaaluma", "Eleza uzoefu wa zamani", "Uliza swali kuhusu jukumu hilo"]
    },
    meeting_friend: {
        title: "Kukutana na Rafiki Mpya",
        role: "Wewe ni mwanafunzi katika bustani.",
        objectives: ["Taja jina lako na asili yako", "Muulize mtu mwingine jina lake", "Sema kwaheri kwa adabu"]
    },
    planning_picnic: {
        title: "Kupanga Picniki",
        role: "Wewe ni rafiki wa mtumiaji.",
        objectives: ["Angalia hali ya hewa", "Pendekeza muda wa kukutana", "Amua chakula cha kuleta"]
    },
    new_coworker: {
        title: "Mshirika Mpya wa Kazi",
        role: "Wewe ni mfanyakazi mpya katika siku yako ya kwanza.",
        objectives: ["Eleza mazingira ya ofisi", "Eleza kazi ya kila siku", "Toa dokezo la msaada"]
    },
    bank_account: {
        title: "Kufungua Akaunti ya Benki",
        role: "Wewe ni karani wa benki huko Nairobi.",
        objectives: ["Eleza sababu ya kutembelea", "Ulizia kuhusu nyaraka", "Uliza kuhusu vipengele vya benki ya simu"]
    },
    environmental_meeting: {
        title: "Mkutano wa Jumuiya ya Mazingira",
        role: "Wewe ni mratibu wa jumuiya.",
        objectives: ["Toa hoja kwa ajili ya sera maalum", "Jibu wasiwasi kuhusu gharama", "Muhtasari wa mtazamo tata"]
    },
    tradition_vs_modernity: {
        title: "Mila dhidi ya Usasa",
        role: "Wewe ni mtu wa kisasa unayeamini kuwa mila huzuia maendeleo.",
        objectives: ["Linganisha maadili ya kihistoria na ya kisasa", "Tumia methali za hali ya juu", "Changanua utambulisho wa kitamaduni"]
    },
    travel_complaint: {
        title: "Malalamiko ya Safari",
        role: "Wewe ni wakala wa shirika la ndege kwenye uwanja wa ndege.",
        objectives: ["Eleza tatizo", "Omba kurejeshewa pesa au kuwekewa nafasi nyingine", "Ulizia kuhusu hoteli"]
    },
    apartment_dispute: {
        title: "Mgogoro wa Ghorofa",
        role: "Wewe ni mwenye nyumba ambaye hataki kulipia matengenezo.",
        objectives: ["Eleza uharibifu", "Toa hoja kwa nini ni jukumu la mwenye nyumba", "Kubaliana tarehe ya matengenezo"]
    },
    cultural_debate: {
        title: "Mjadala wa Mitandao ya Kijamii",
        role: "Wewe ni rafiki ambaye una shaka na teknolojia.",
        objectives: ["Toa maoni", "Toa sababu mbili za kuunga mkono", "Jibu hoja ya kupinga"]
    },
    legal_consultation: {
        title: "Ushauri wa Kisheria",
        role: "Wewe ni mwanasheria aliyebobea katika miliki ya kiakili.",
        objectives: ["Eleza ukiukaji wa mkataba", "Ulizia kuhusu suluhu za kisheria", "Jadili matokeo yanayoweza kutokea"]
    },
    academic_seminar: {
        title: "Semina ya Kitaaluma",
        role: "Wewe ni profesa wa chuo kikuu.",
        objectives: ["Muhtasari wa msimamo wako", "Nukuu ushahidi wa kinadharia", "Jibu ukosoaji"]
    },
    philosophical_debate: {
        title: "Maadili ya AI",
        role: "Wewe ni mwanafalsafa mashuhuri.",
        objectives: ["Eleza dhana ngumu isiyoonekana", "Tumia sitiari za kina", "Shughulikia kejeli na mambo madogo"]
    },
    diplomatic_crisis: {
        title: "Mazungumzo ya Kidiplomasia",
        role: "Wewe ni mwanadiplomasia wa ngazi ya juu kutoka nchi mpinzani.",
        objectives: ["Eleza wasiwasi wa kitaifa kwa njia isiyo ya moja kwa moja", "Pendekeza maelewano magumu", "Zingatia itifaki kali ya serikali"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
Mwalimu wa lugha wa AI (${levelName}). ${local.role}
Kanuni ya Berlitz: USISAHEHISHE makosa moja kwa moja. Thibitisha wazo kwa kutumia sarufi sahihi kiasili.
Mfano: Mwanafunzi: "Mimi kula keki jana" -> Wewe: "Mimi pia **ndilikula keki** jana, unapenda ladha gani?"

Scenario: ${local.title}
Malengo: ${local.objectives.join(', ')}

Maelekezo:
1. Sentensi 2 pekee.
2. Lugha: ${language}. USITUMIE KIINGEREZA.
3. Kiwango: ${levelName}.<|im_end|>
<|im_start|>user
Mazungumzo: ${history}
${systemEvent ? `Tukio: ${systemEvent}` : ''}
Mwanafunzi: ${action}
Jibu la mwalimu:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mwalimu wa lugha. Sahihisha makosa katika maandishi ya mtumiaji. Ikiwa ni sahihi, sema "Safi sana" (au "Perfect").<|im_end|>
<|im_start|>user
Asili: ${userInput}
Usahihishaji:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Fanya maandishi yafuatayo yawe rahisi zaidi (kiwango cha CEFR A1).<|im_end|>
<|im_start|>user
Asili: ${narrativeText}
Maelezo rahisi:<|im_end|>
<|im_start|>assistant
`;
};
