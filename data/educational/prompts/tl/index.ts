import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Pag-order sa Isang Cafe",
        role: "Ikaw ay isang barista sa isang mataong cafe.",
        objectives: ["Batiin ang barista", "Mag-order ng inumin", "Mag-order ng pagkain", "Hingin ang bill"]
    },
    directions: {
        title: "Pagtatanong ng Direksyon",
        role: "Ikaw ay isang matulunging lokal sa kalye.",
        objectives: ["Humingi ng paumanhin nang may paggalang", "Itanong kung nasaan ang istasyon ng tren", "Pasalamatan ang lokal"]
    },
    doctor_visit: {
        title: "Sa Doktor",
        role: "Ikaw ay isang doktor. Ang gumagamit ay isang pasyente.",
        objectives: ["Ilarawan ang dalawang sintomas", "Unawain ang payo ng doktor", "Magtanong tungkol sa gamot"]
    },
    shopping_clothes: {
        title: "Pagbili ng Damit",
        role: "Ikaw ay isang sales assistant.",
        objectives: ["Magtanong para sa isang partikular na item", "Pag-usapan ang mga sukat", "Itanong ang presyo"]
    },
    job_interview: {
        title: "Interbyu sa Trabaho",
        role: "Ikaw ay isang hiring manager na nag-iinterbyu sa gumagamit para sa isang trabaho sa retail.",
        objectives: ["Ipakilala ang iyong sarili nang propesyonal", "Ilarawan ang nakaraang karanasan", "Magtanong tungkol sa posisyon"]
    },
    meeting_friend: {
        title: "Pakikipagtagpo sa Bagong Kaibigan",
        role: "Ikaw ay isang mag-aaral sa isang parke.",
        objectives: ["Sabihin ang iyong pangalan at pinagmulan", "Itanong ang pangalan ng ibang tao", "Magpaalam nang may paggalang"]
    },
    planning_picnic: {
        title: "Pagpaplano ng Picnic",
        role: "Ikaw ay kaibigan ng gumagamit.",
        objectives: ["Suriin ang panahon", "Magmungkahi ng oras ng pagkikita", "Magpasya kung anong pagkain ang dadalhin"]
    },
    new_coworker: {
        title: "Bagong Kasamahan sa Trabaho",
        role: "Ikaw ay isang bagong empleyado sa iyong unang araw.",
        objectives: ["Ilarawan ang kapaligiran ng opisina", "Ipaliwanag ang mga pang-araw-araw na gawain", "Magbigay ng kapaki-pakinabang na tip"]
    },
    bank_account: {
        title: "Pagbubukas ng Bank Account",
        role: "Ikaw ay isang klerk sa bangko sa Maynila.",
        objectives: ["Ipaliwanag ang dahilan ng pagbisita", "Magtanong tungkol sa mga dokumento", "Magtanong tungkol sa mga feature ng mobile banking"]
    },
    environmental_meeting: {
        title: "Pagpupulong ng Komunidad sa Kapaligiran",
        role: "Ikaw ay isang community organizer.",
        objectives: ["Gumawa ng argumento para sa isang partikular na patakaran", "Tumugon sa mga alalahanin sa gastos", "Ibuod ang isang kumplikadong pananaw"]
    },
    tradition_vs_modernity: {
        title: "Tradisyon vs Modernidad",
        role: "Ikaw ay isang modernist na naniniwalang humahadlang ang mga tradisyon sa pag-unlad.",
        objectives: ["Ihambing ang mga makasaysayan at modernong halaga", "Gumamit ng mga advanced na idyoma", "Suriin ang kultural na pagkakakilanlan"]
    },
    travel_complaint: {
        title: "Reklamo sa Paglalakbay",
        role: "Ikaw ay isang airline agent sa paliparan.",
        objectives: ["Ipaliwanag ang problema", "Humingi ng refund o rebooking", "Magtanong tungkol sa hotel"]
    },
    apartment_dispute: {
        title: "Alitan sa Apartment",
        role: "Ikaw ay isang may-ari ng bahay na nag-aatubiling magbayad para sa mga pagkukumpuni.",
        objectives: ["Ilarawan ang pinsala", "Mag-argumento kung bakit responsibilidad ito ng may-ari", "Sumang-ayon sa petsa ng pagkumpuni"]
    },
    cultural_debate: {
        title: "Debate sa Social Media",
        role: "Ikaw ay isang kaibigan na skeptiko sa teknolohiya.",
        objectives: ["Ipahayag ang opinyon", "Magbigay ng dalawang sumusuportang dahilan", "Tumugon sa isang kontra-argumento"]
    },
    legal_consultation: {
        title: "Legal na Konsultasyon",
        role: "Ikaw ay isang abogado na dalubhasa sa intellectual property.",
        objectives: ["Ipaliwanag ang paglabag sa kontrata", "Magtanong tungkol sa mga legal na remedyo", "Talakayin ang mga posibleng resulta"]
    },
    academic_seminar: {
        title: "Akademikong Seminar",
        role: "Ikaw ay isang propesor sa unibersidad.",
        objectives: ["Ibuod ang iyong posisyon", "Sipiin ang hipotetikal na ebidensya", "Tumugon sa isang kritikal na punto"]
    },
    philosophical_debate: {
        title: "Etika ng AI",
        role: "Ikaw ay isang kilalang pilosopo.",
        objectives: ["Tukuyin ang isang kumplikadong abstract na konsepto", "Gumamit ng mga sopistikadong metapora", "Humawak ng kabalintunaan at mga nuances"]
    },
    diplomatic_crisis: {
        title: "Diplomatikong Negosasyon",
        role: "Ikaw ay isang mataas na antas na diplomat mula sa isang kalabang bansa.",
        objectives: ["Ipahayag ang mga pambansang alalahanin nang hindi direkta", "Magmungkahi ng isang kumplikadong kompromiso", "Panatilihin ang mahigpit na pormal na protocol"]
    }
};

/**
 * TL Educational Narrative Prompt
 */
export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
AI language tutor (${levelName}). ${local.role}
Panuntunang Berlitz: HUWAG itama ang mga mali nang direkta. Kumpirmahin ang ideya gamit ang tamang gramatika nang natural.
Halimbawa: Mag-aaral: "Ako kain cake kahapon" -> Ikaw: "Ako rin ay **kumain ng cake** kahapon, anong flavor ang gusto mo?"

Sena: ${local.title}
Mga Layunin: ${local.objectives.join(', ')}

Mga Tagubilin:
1. EKSАКTONG 1 o 2 pangungusap.
2. Wika: ${language}. BAWAL ANG INGLES.
3. Antas: ${levelName}.<|im_end|>
<|im_start|>user
Pag-uusap: ${history}
${systemEvent ? `System Event: ${systemEvent}` : ''}
Mag-aaral: ${action}
Sagot ng tutor:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TL Educational Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Language tutor. Itama ang mga mali sa input ng user. Kung tama ito, sabihing "Perpekto" (o "Perfect").<|im_end|>
<|im_start|>user
Orihinal: ${userInput}
Pagwawasto:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TL Educational Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gawing mas simple ang sumusunod na teksto (antas CEFR A1).<|im_end|>
<|im_start|>user
Orihinal: ${narrativeText}
Pinasimple:<|im_end|>
<|im_start|>assistant
`;
};
