import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kuitanitsa mu Kafe",
        role: "Ndinu barista m'kafe yotanganidwa.",
        objectives: ["Perekani moni kwa barista", "Itanitsani chakumwa", "Itanitsani chakudya", "Pemphani bilu"]
    },
    directions: {
        title: "Kufunsa Njira",
        role: "Ndinu m'mwenyekaya wothandiza mumsewu.",
        objectives: ["Pepesani mwaulemu", "Funsani komwe kuli siteshoni ya sitima", "Thandizani m'mwenyekaya"]
    },
    doctor_visit: {
        title: "Kwa Dokotala",
        role: "Ndinu dokotala. Wogwiritsa ntchito ndi wodwala.",
        objectives: ["Fotokozani zizindikiro ziwiri", "Mvetsetsani malangizo a dokotala", "Funsani za mankhwala"]
    },
    shopping_clothes: {
        title: "Kugula Zovala",
        role: "Ndinu wothandiza m'sitolo.",
        objectives: ["Funsani chinthu chinachake", "Kambiranani za saizi", "Funsani za mtengo"]
    },
    job_interview: {
        title: "Kufunsidwa Ntchito",
        role: "Ndinu bwana wolemba ntchito yemwe mukufunsa wogwiritsa ntchito ntchito yogulitsa.",
        objectives: ["Didziwitseni mwaulemu", "Fotokozani zomwe munachitapo kale", "Funsani funso za ntchitoyo"]
    },
    meeting_friend: {
        title: "Kukumana ndi Mnzanu Watsopano",
        role: "Ndinu wophunzira pakiyi.",
        objectives: ["Nenani dzina lanu ndi komwe mukuchokera", "Funsani dzina la munthu winayo", "Tsanzikani mwaulemu"]
    },
    planning_picnic: {
        title: "Kukonzekera Phwando la Panja (Picnic)",
        role: "Ndinu mnzake wa wogwiritsa ntchito.",
        objectives: ["Onani nyengo", "Pangani nthawi yokumana", "Sankhani chakudya chomwe mungabweretse"]
    },
    new_coworker: {
        title: "Mnzanu Wapantchito Watsopano",
        role: "Ndinu wogwira ntchito watsopano pa tsiku lanu loyamba.",
        objectives: ["Fotokozani momwe ofesi ilili", "Fotokozani ntchito za tsiku ndi tsiku", "Perekani malangizo othandiza"]
    },
    bank_account: {
        title: "Kutsegula Akaunti ya Banki",
        role: "Ndinu mlembi wa ku banki ku Lilongwe.",
        objectives: ["Fotokozani cholinga cha ulendowu", "Funsani za zikalata", "Funsani za mautumiki a banki pa foni"]
    },
    environmental_meeting: {
        title: "Msonkhano wa Chilengedwe m'dera",
        role: "Ndinu wokonza zochitika m'dera.",
        objectives: ["Pangani mfundo yochirikiza ndondomeko inayake", "Yankhani nkhawa za mtengo", "Chidule cha malingaliro ovuta"]
    },
    tradition_vs_modernity: {
        title: "Mwambo vs Makono",
        role: "Ndinu munthu wokonda zamakono yemwe amakhulupirira kuti miyambo imalepheretsa chitukuko.",
        objectives: ["Yerekezerani mfundo zakale ndi zamakono", "Gwiritsani ntchito miyambo yapamwamba", "Santhulani za chikhalidwe"]
    },
    travel_complaint: {
        title: "Dandaulo la Ulendo",
        role: "Ndinu wogwira ntchito pakampani ya ndege pa eyapoti.",
        objectives: ["Fotokozani vuto", "Pemphani kubwezeredwa ndalama kapena kusintha tsiku", "Funsani za hotelo"]
    },
    apartment_dispute: {

        title: "Kusamvana kwa Nyumba",
        role: "Ndinu mwininyumba yemwe simukufuna kulipira zokonza.",
        objectives: ["Fotokozani kuwonongeka", "Perekani zifukwa zomwe mwininyumba ayenera kulipira", "Gwirizanani tsiku lokonza"]
    },
    cultural_debate: {
        title: "Mtsutso wa Social Media",
        role: "Ndinu mnzanu yemwe simukhulupirira kwambiri zamakono (tech).",
        objectives: ["Perekani maganizo", "Perekani zifukwa ziwiri zochirikiza", "Yankhani mfundo yotsutsa"]
    },
    legal_consultation: {
        title: "Upangiri wa Zamalamulo",
        role: "Ndinu loya wodziwa bwino za nzeru zamaluso (intellectual property).",
        objectives: ["Fotokozani kuswa pangano", "Funsani za njira zamalamulo", "Kambiranani zomwe zingachitike"]
    },
    academic_seminar: {
        title: "Semina ya Maphunziro",
        role: "Ndinu pulofesa wa kuyunivesite.",
        objectives: ["Fotokozani mwachidule maganizo anu", "Gwiritsani ntchito umboni wopeka", "Yankhani kudzudzulidwa"]
    },
    philosophical_debate: {
        title: "Makhalidwe a AI",
        role: "Ndinu wafilosofi wotchuka.",
        objectives: ["Fotokozani lingaliro lovuta", "Gwiritsani ntchito mafanizo ozama", "Limbanani ndi chipongwe ndi zovuta zina"]
    },
    diplomatic_crisis: {
        title: "Zokambirana za Ukazembe",
        role: "Ndinu kazembe wapamwamba wochokera kudziko limene mukupikisana nalo.",
        objectives: ["Onetsani nkhawa za dziko m'njira yozungulira", "Perekani malingaliro ogwirizana ovuta", "Sungani malamulo okhwima a boma"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Ntchito yanu: Pitirizani nkhaniyo mu chiganizo 1 chachidule ndendende.
Lembani nkhani yokha. Palibe mitu kapena mafotokozedwe.
LOFUNIKA: MUSAGWIRITSE NTCHITO CHINGEREZI. Chilankhulo: Chichewa.
Mawonekedwe: Osangalala komanso osavuta (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Chiganizo 1:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mlangizi wosavuta wa chilankhulo. Konzani zolakwikazo. Ngati kuli koyenera, nenani kuti "Zabwino kwambiri."<|im_end|>
<|im_start|>user
Choyambirira: ${userInput}
Kukonza:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Pangani kukhala kosavuta (mawu 3-5).<|im_end|>
<|im_start|>user
Choyambirira: ${narrativeText}
Kufotokoza kosavuta:<|im_end|>
<|im_start|>assistant
`;
};
