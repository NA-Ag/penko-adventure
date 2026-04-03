import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Uku-oda e-Cafe",
        role: "Ungubharista e-cafe ephuphumayo.",
        objectives: ["Bingelela ubharista", "Oda isiphuzo", "Oda ukudla", "Cela ibhili"]
    },
    directions: {
        title: "Ukubuza Indlela",
        role: "Ungumuntu wasekhaya osizayo emgwaqweni.",
        objectives: ["Xolisa ngenhlonipho", "Buza ukuthi isiteshi sesitimela sikuphi", "Bonga umuntu wasekhaya"]
    },
    doctor_visit: {
        title: "Kudokotela",
        role: "Ungudokotela. Umsebenzisi uyisiguli.",
        objectives: ["Chaza izimpawu ezimbili", "Qonda iseluleko sikadokotela", "Buza ngemithi"]
    },
    shopping_clothes: {
        title: "Ukuthenga Izimpahla",
        role: "Ungumsizi wasesitolo.",
        objectives: ["Buza ngento ethile", "Xoxa ngosayizi", "Buza ngenani"]
    },
    job_interview: {
        title: "Inhlolokhono Yomsebenzi",
        role: "Ungumphathi oqashayo obuza umsebenzisi ngomsebenzi.",
        objectives: ["Zethule ngendlela efanele", "Chaza okuhlangenwe nakho kwesikhathi esidlule", "Buza umbuzo ngomsebenzi"]
    },
    meeting_friend: {
        title: "Ukuhlangana nomngane omusha",
        role: "Ungumfundi epaki.",
        objectives: ["Yisho igama lakho nalapho uvela khona", "Buza elinye igama lomuntu", "Valelisa ngenhlonipho"]
    },
    planning_picnic: {
        title: "Ukuhlela ipikiniki",
        role: "Ungumngane womsebenzisi.",
        objectives: ["Hlola isimo sezulu", "Phakamisa isikhathi sokuhlangana", "Nquma ukuthi yikuphi ukudla okuzolethwa"]
    },
    new_coworker: {
        title: "Osebenza naye omusha",
        role: "Ungumsebenzi omusha ngosuku lwakho lokuqala.",
        objectives: ["Chaza isimo sasehhovisi", "Chaza imisebenzi yansuku zonke", "Nikeza ithiphu eliwusizo"]
    },
    bank_account: {
        title: "Ukuvula i-akhawunti yasebhange",
        role: "Ungumsebenzi wasebhange eThekwini.",
        objectives: ["Chaza isizathu sokuvakasha", "Buza ngemibhalo", "Buza ngezici zebhange lomakhalekhukhwini"]
    },
    environmental_meeting: {
        title: "Umhlangano womphakathi wezemvelo",
        role: "Ungumhleli womphakathi.",
        objectives: ["Yenza i-agumenti yenqubomgomo ethile", "Phendula ekukhathazekeni ngezindleko", "Fingqa umbono onzima"]
    },
    tradition_vs_modernity: {
        title: "Isiko vs Isimanjemanje",
        role: "Ungumuntu othanda izinto zesimanjemanje okholelwa ukuthi amasiko avimbela inqubekelaphambili.",
        objectives: ["Qhathanisa amanani omlando nalawo osuku lwanamuhla", "Sebenzisa izisho ezithuthukile", "Hlaziya ubunikazi bamasiko"]
    },
    travel_complaint: {
        title: "Isikhalazo Sohambo",
        role: "Ungumenzeli wenkampani yezindiza esikhumulweni sezindiza.",
        objectives: ["Chaza inkinga", "Cela ukubuyiselwa imali noma ukubhukha kabusha", "Buza ngehhotela"]
    },
    apartment_dispute: {
        title: "Umbango Wefulethi",
        role: "Ungumnini wendlu onganqeni ukukhokhela ukulungiswa.",
        objectives: ["Chaza umonakalo", "Phikisa ngokuthi kungani kuwumsebenzi womnini wendlu", "Vumelana ngosuku lokulungisa"]
    },
    cultural_debate: {
        title: "Inkulumo-mpikiswano Yezokuxhumana",
        role: "Ungumngane ongakholelwa kakhulu kwezobuchwepheshe.",
        objectives: ["Sula umbono", "Nikeza izizathu ezimbili ezisekelayo", "Phendula iphuzu eliphikisayo"]
    },
    legal_consultation: {
        title: "Iseluleko Somthetho",
        role: "Ungummeli okhethekile kwezempahla yengqondo.",
        objectives: ["Chaza ukwephulwa kwenkontileka", "Buza ngezixazululo zomthetho", "Xoxa ngemiphumela engaba khona"]
    },
    academic_seminar: {
        title: "Iseminali Yezemfundo",
        role: "Unguprofesa waseyunivesithi.",
        objectives: ["Fingqa isikhundla sakho", "Caphuna ubufakazi bokucatshangelwa", "Phendula ukugxekwa"]
    },
    philosophical_debate: {
        title: "Ukuziphatha kwe-AI",
        role: "Ungumfilosofi owaziwayo.",
        objectives: ["Chaza umqondo onzima ongabambeki", "Sebenzisa izingathekiso eziyinkimbinkimbi", "Phatha ukubhuqa neminye imininingwane"]
    },
    diplomatic_crisis: {
        title: "Izingxoxo Zenxusa",
        role: "Ungunxusa lasezingeni eliphezulu elivela ezweni eliqhudelanayo.",
        objectives: ["Veza ukukhathazeka kwezwe ngezindlela ezingaqondile", "Phakamisa ukuvumelana okuyinkimbinkimbi", "Gcina imithetho eqinile kahulumeni"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Unga 'Penko', umphathi womdlalo we ${theme}.
Umsebenzi: Qhubeka nendaba ngemisho emi-1 noma emi-2 kakhulu.
Faka isenzo somdlali kanye nemicimbi yesistimu.
KUBALULEKILE: AKUKHO ISINGISI. Phendula ngesiZulu kuphela.
Ithoni: Echazayo futhi egxilisayo.
Isibonelo:
Indaba kuze kube manje: Imvula ina emgwaqeni.
Isenzo somdlali: Ngibheka nxazonke.
<|im_start|>user
Okwangempela: ${userInput}
<|im_start|>user
Okwangempela: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Qhubeka nendaba:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Uthisha Wolimi. Lungisa amaphutha. Uma kulungile, yithi "Iphelele."<|im_end|>
<|im_start|>user
Okwangempela: ${userInput}
Ukulungiswa:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Kwenze kube lula (CEFR A1).<|im_end|>
<|im_start|>user
Okwangempela: ${narrativeText}
Kwenziwe kwaba lula:<|im_end|>
<|im_start|>assistant
`;
};
