import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Yin oda a kanti",
        role: "Kai ne mai kanti a wani kanti mai cunkoso.",
        objectives: ["Gaishe da mai kanti", "Yi odar abin sha", "Yi odar abinci", "Nemi lissafin kuɗi"]
    },
    directions: {
        title: "Neman hanya",
        role: "Kai ne wani mutumin gari mai taimako a kan titi.",
        objectives: ["Bada haƙuri cikin ladabi", "Tambayi inda tashar jirgin ƙasa take", "Gode wa mutumin garin"]
    },
    doctor_visit: {
        title: "Wurin Likita",
        role: "Kai ne likita. Mai amfani shi ne majiyyaci.",
        objectives: ["Bayyana alamun rashin lafiya biyu", "Fahimci shawarar likita", "Tambaya game da magani"]
    },
    shopping_clothes: {
        title: "Siyan Tufafi",
        role: "Kai ne mataimakin shago.",
        objectives: ["Tambayi takamaiman kaya", "Tattauna girma (size)", "Tambayi farashi"]
    },
    job_interview: {
        title: "Hira don Aiki",
        role: "Kai ne manajan ɗaukar ma'aikata da ke hira da mai amfani don aikin sayarwa.",
        objectives: ["Gabatar da kanka cikin ƙwarewa", "Bayyana ƙwarewar baya", "Yi tambaya game da aikin"]
    },
    meeting_friend: {
        title: "Haɗuwa da Sabon Aboki",
        role: "Kai ɗalibi ne a wurin shakatawa (park).",
        objectives: ["Faɗi sunanka da inda ka fito", "Tambayi ɗayan sunansa", "Yi ban kwana cikin ladabi"]
    },
    planning_picnic: {
        title: "Shirya Walimar Shakatawa (Picnic)",
        role: "Kai abokin mai amfani ne.",
        objectives: ["Duba yanayin sararin samaniya", "Ba da shawarar lokacin haɗuwa", "Yanke shawarar abincin da za a kawo"]
    },
    new_coworker: {
        title: "Sabon Abokin Aiki",
        role: "Kai sabon ma'aikata ne a ranar farko.",
        objectives: ["Bayyana yanayin ofis", "Bayyana ayyukan yau da kullun", "Ba da shawara mai amfani"]
    },
    bank_account: {
        title: "Buɗe Asusun Banki",
        role: "Kai ma'aikacin banki ne a Kano.",
        objectives: ["Bayyana dalilin ziyarar", "Tambaya game da takaddun da ake buƙata", "Tambaya game da fasalin banki na wayar salula"]
    },
    environmental_meeting: {
        title: "Taron Al'umma kan Muhalli",
        role: "Kai mai tsara taron al'umma ne.",
        objectives: ["Ba da hujjoji don takamaiman tsarin manufofin", "Ba da amsa ga damuwa game da tsada", "Takaita ra'ayi mai rikitarwa"]
    },
    tradition_vs_modernity: {
        title: "Al'ada da Zamanci",
        role: "Kai mai ra'ayin zamanci ne wanda ya yi imanin cewa al'adu suna hana ci gaba.",
        objectives: ["Kwatanta darajojin tarihi da na zamani", "Yi amfani da karin magana masu zurfi", "Yi nazarin asalin al'ada"]
    },
    travel_complaint: {
        title: "Ƙarar Balaguro",
        role: "Kai ne jami'in kamfanin jirgin sama a filin jirgi.",
        objectives: ["Bayyana matsalar", "Nemi mayar da kuɗi ko sake yin rajista", "Tambaya game da masauki (hotel)"]
    },
    apartment_dispute: {
        title: "Rigimar Gida",
        role: "Kai ne mai gida wanda ba ya son biyan kuɗin gyara.",
        objectives: ["Bayyana ɓarnar", "Bayyana dalilin da ya sa gyaran ya rataya a wuyan mai gida", "Amince kan ranar gyara"]
    },
    cultural_debate: {
        title: "Muhawara kan Kafofin Sadarwa",
        role: "Kai ne abokin da ba ya amincewa da fasaha sosai.",
        objectives: ["Bayyana ra'ayi", "Ba da dalilai biyu masu ƙarfafawa", "Bayyana ra'ayin adawa kan wani batu"]
    },
    legal_consultation: {
        title: "Shawarar Lauya",
        role: "Kai ne lauya mai ƙwarewa kan haƙƙin mallaka.",
        objectives: ["Bayyana keta yarjejeniya", "Tambayi game da hanyoyin shari'a", "Tattauna sakamakon da za a iya samu"]
    },
    academic_seminar: {
        title: "Taron Karatu",
        role: "Kai ne malamin jami'a.",
        objectives: ["Taƙaita matsayinka", "Ambato hujjoji na tunani", "Ba da amsar suka"]
    },
    philosophical_debate: {
        title: "Ma'anar Rayuwa da AI",
        role: "Kai ne shahararren masanin falsafa.",
        objectives: ["Bayyana wani ra'ayi mai sarkakiya", "Yi amfani da misalai masu zurfi", "Sarrafa ba'a da ma'anoni ɓoyayyu"]
    },
    diplomatic_crisis: {
        title: "Tattaunawar Diplomasiyya",
        role: "Kai ne babban jami'in diplomasiyya daga wata ƙasa kishiya.",
        objectives: ["Bayyana damuwar ƙasa a fakaice", "Ba da shawarar yarjejeniya mai sarkakiya", "Kiyaye ƙa'idojin hukuma sosai"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Aikin ku: Ci gaba da labarin a cikin jimla 1 tak gajera.
Rubuta labarin kawai. Babu kanun labarai ko bayani.
MAHIMMANCI: KADA KA YI AMFANI DA TURANCI. Harshe: Hausa.
Sauti: Abun farin ciki da sauƙi (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Jimla 1:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Malamin harshe mai sauƙi. Gyara abun da aka rubuta. Idan daidai ne, kace "Yayi kyau."<|im_end|>
<|im_start|>user
Asali: ${userInput}
Gyara:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Maida shi mafi sauƙi (kalmomi 3-5).<|im_end|>
<|im_start|>user
Asali: ${narrativeText}
Sauƙaƙawa:<|im_end|>
<|im_start|>assistant
`;
};
