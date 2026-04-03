import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Užsakymas kavinėje",
        role: "Esate barista judrioje kavinėje.",
        objectives: ["Pasveikinkite baristą", "Užsisakykite gėrimą", "Užsisakykite maisto", "Paprašykite sąskaitos"]
    },
    directions: {
        title: "Kelio klausimas",
        role: "Esate paslaugus vietinis gyventojas gatvėje.",
        objectives: ["Mandagiai atsiprašykite", "Paklauskite, kur yra traukinių stotis", "Padėkokite vietiniam"]
    },
    doctor_visit: {
        title: "Pas gydytoją",
        role: "Esate gydytojas. Vartotojas yra pacientas.",
        objectives: ["Apibūdinkite du simptomus", "Supraskite gydytojo patarimą", "Paklauskite apie vaistus"]
    },
    shopping_clothes: {
        title: "Drabužių pirkimas",
        role: "Esate parduotuvės asistentas.",
        objectives: ["Paprašykite konkretaus daikto", "Aptarkite dydžius", "Paklauskite apie kainą"]
    },
    job_interview: {
        title: "Darbo pokalbis",
        role: "Esate atrankos vadybininkas, apklausiantis naudotoją dėl darbo mažmeninėje prekyboje.",
        objectives: ["Prisistatykite profesionaliai", "Apibūdinkite praeitą patirtį", "Užduokite klausimą apie pareigas"]
    },
    meeting_friend: {
        title: "Susitikimas su nauju draugu",
        role: "Esate studentas parke.",
        objectives: ["Pasakykite savo vardą ir kilmę", "Paklauskite kito asmens vardo", "Mandagiai atsisveikinkite"]
    },
    planning_picnic: {
        title: "Iškylos planavimas",
        role: "Esate naudotojo draugas.",
        objectives: ["Patikrinkite orus", "Pasiūlykite susitikimo laiką", "Nuspręskite, kokį maistą atsinešti"]
    },
    new_coworker: {
        title: "Naujas bendradarbis",
        role: "Esate naujas darbuotojas savo pirmąją dieną.",
        objectives: ["Apibūdinkite biuro aplinką", "Paaiškinkite kasdienes užduotis", "Duokite naudingą patarimą"]
    },
    bank_account: {
        title: "Banko sąskaitos atidarymas",
        role: "Esate banko darbuotojas Vilniuje.",
        objectives: ["Paaiškinkite vizito priežastį", "Pasiteiraukite apie dokumentus", "Paklauskite apie mobiliosios bankininkystės funkcijas"]
    },
    environmental_meeting: {
        title: "Aplinkosaugos bendruomenės susitikimas",
        role: "Esate bendruomenės organizatorius.",
        objectives: ["Pateikite argumentą už konkrečią politiką", "Atsakykite į susirūpinimą dėl išlaidų", "Apibendrinkite sudėtingą požiūrį"]
    },
    tradition_vs_modernity: {
        title: "Tradicija prieš modernumą",
        role: "Esate modernistas, manantis, kad tradicijos trukdo pažangai.",
        objectives: ["Palyginkite istorinius ir modernius vertybes", "Naudokite sudėtingus frazeologizmus", "Išanalizuokite kultūrinį identitetą"]
    },
    travel_complaint: {
        title: "Skundas dėl kelionės",
        role: "Esate oro linijų agentas oro uoste.",
        objectives: ["Paaiškinkite problemą", "Paprašykite grąžinti pinigus arba perregistruoti bilietą", "Pasiteiraukite apie viešbutį"]
    },
    apartment_dispute: {
        title: "Ginčas dėl buto",
        role: "Esate nuomotojas, kuris nenori mokėti už remontą.",
        objectives: ["Apibūdinkite žalą", "Argumentuokite, kodėl tai nuomotojo atsakomybė", "Susitarkite dėl remonto datos"]
    },

    cultural_debate: {
        title: "Diskusija apie socialinę mediją",
        role: "Esate draugas, kuris skeptiškai vertina technologijas.",
        objectives: ["Išreikškite nuomonę", "Pateikite dvi pagrindžiančias priežastis", "Atsakykite į priešingą argumentą"]
    },
    legal_consultation: {
        title: "Teisinė konsultacija",
        role: "Esate teisininkas, besispecializuojantis intelektinės nuosavybės srityje.",
        objectives: ["Paaiškinkite sutarties pažeidimą", "Pasiteiraukite apie teisinės gynybos priemones", "Aptarkite galimus rezultatus"]
    },
    academic_seminar: {
        title: "Akademinis seminaras",
        role: "Esate universiteto profesorius.",
        objectives: ["Apibendrinkite savo poziciją", "Citata hipotetinius įrodymus", "Atsakykite į kritinę pastabą"]
    },
    philosophical_debate: {
        title: "DI etika",
        role: "Esate garsus filosofas.",
        objectives: ["Apibrėžkite sudėtingą abstrakčią sąvoką", "Naudokite sudėtingas metaforas", "Susitvarkykite su ironija ir niuansais"]
    },
    diplomatic_crisis: {
        title: "Diplomatinės derybos",
        role: "Esate aukšto lygio diplomatas iš konkuruojančios šalies.",
        objectives: ["Netiesiogiai išreikškite nacionalinį susirūpinimą", "Pasiūlykite sudėtingą kompromisą", "Laikykitės griežto oficialaus protokolo"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Jūsų užduotis: Tęskite istoriją daugiausiai 1 arba 2 sakiniais.
Nenaudokite antraščių, „markdown“ formatavimo ar šalutinių komentarų. Rašykite tik pačią istoriją.
Visada įtraukite žaidėjo veiksmus ir bet kokius sistemos įvykius.
Kalba: Lietuvių.
Tonų: Aprašomasis ir įtraukiantis.
Ištaisykite įvestį. Jei ji teisinga, sakykite tik „Puiku.“
<|im_start|>user
Originalas: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Tęskite istoriją:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Naudingas kalbų mokytojas.
Ištaisykite įvestį. Jei ji teisinga, sakykite tik „Puiku.“
Trumpai paaiškinkite klaidas lietuvių kalba.<|im_end|>
<|im_start|>user
Originalas: ${userInput}
Pataisymas:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Rašykite paprasčiau (CEFR A1).<|im_end|>
<|im_start|>user
Originalas: ${narrativeText}
Supaprastinta:<|im_end|>
<|im_start|>assistant
`;
};
