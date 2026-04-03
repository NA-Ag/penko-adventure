import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Bestellen an engem Café",
        role: "Dir sidd e Barista an engem belafte Café.",
        objectives: ["Begréisst de Barista", "Bestellt e Gedrénks", "Bestellt Iessen", "Frot no der Rechnung"]
    },
    directions: {
        title: "Nom Wee froen",
        role: "Dir sidd eng hëllefsbereet lokal Persoun op der Strooss.",
        objectives: ["Entschëllegt Iech héiflech", "Frot wou d'Gare ass", "Merci un d'lokal Persoun"]
    },
    doctor_visit: {
        title: "Beim Dokter",
        role: "Dir sidd en Dokter. De Benotzer ass e Patient.",
        objectives: ["Beschreift zwee Symptomer", "Verstitt de Rot vum Dokter", "Frot no Medikamenter"]
    },
    shopping_clothes: {
        title: "Kleeder kafen",
        role: "Dir sidd e Verkeefer.",
        objectives: ["Frot no engem spezifeschen Artikel", "Diskutéiert d'Gréissten", "Frot nom Präis"]
    },
    job_interview: {
        title: "Virstellungsgespréich",
        role: "Dir sidd e Personalmanager, deen de Benotzer fir eng Aarbecht interviewt.",
        objectives: ["Stellt Iech professionell vir", "Beschreift fréier Erfahrung", "Stellt eng Fro iwwer d'Roll"]
    },
    meeting_friend: {
        title: "En neie Frënd treffen",
        role: "Dir sidd e Student an engem Park.",
        objectives: ["Sot Ären Numm an hierkonft", "Frot déi aner Persoun no hirem Numm", "Sot eng héiflech Äddi"]
    },
    planning_picnic: {
        title: "E Picknick plangen",
        role: "Dir sidd e Frënd vum Benotzer.",
        objectives: ["Iwwerpréift d'Wieder", "Proposéiert eng Zäit fir de Treffpunkt", "Entscheet wéi eng Liewensmëttel Dir matbréngt"]
    },
    new_coworker: {
        title: "Neie Kolleg",
        role: "Dir sidd en neien Employé op Ärem éischten Dag.",
        objectives: ["Beschreift d'Büroëmfeld", "Erkläert déi deeglech Aufgaben", "Gitt en nëtzlechen Tipp"]
    },
    bank_account: {
        title: "E Bankkonto opmaachen",
        role: "Dir sidd e Bankbeamten an der Stad Lëtzebuerg.",
        objectives: ["Erkläert de grond vum Besuch", "Frot no Dokumenter", "Frot no Mobile Banking Funktiounen"]
    },
    environmental_meeting: {
        title: "Ëmwelt-Gemeinschaftsversammlung",
        role: "Dir sidd e Gemeinschaftsorganisateur.",
        objectives: ["Argumentéiert fir eng spezifesch Politik", "Reagéiert op Käschtenbedenken", "Faasst eng komplex Vue zesummen"]
    },
    tradition_vs_modernity: {
        title: "Traditioun vs Modernitéit",
        role: "Dir sidd e Modernist deen gleeft datt Traditiounen de Fortschrëtt behënneren.",
        objectives: ["Vergläicht historesch a modern Wäerter", "Benotzt fortgeschratt Idiomen", "Analyséiert d'kulturell Identitéit"]
    },
    travel_complaint: {
        title: "Reisereklamatioun",
        role: "Dir sidd en Agent vun enger Airline um Fluchhafen.",
        objectives: ["Erkläert de Problem", "Frot no engem Remboursement oder Ëmbuchung", "Informéiert Iech iwwer en Hotel"]
    },
    apartment_dispute: {
        title: "Appartementssträit",
        role: "Dir sidd e Vermieter, deen net gär fir Reparaturen bezilt.",
        objectives: ["Beschreift de Schued", "Argumentéiert firwat et d'Verantwortung vum Vermieter ass", "Eenecht Iech op en Datum fir d'Reparatur"]
    },
    cultural_debate: {
        title: "Social Media Debatt",
        role: "Dir sidd en technoskeptesche Frënd.",
        objectives: ["Sot Är Meenung", "Gitt zwee Grënn un", "Äntwert op e Géigenargument"]
    },
    legal_consultation: {
        title: "Juristesch Berodung",
        role: "Dir sidd en Affekot spezialiséiert op intellektuell Proprietéit.",
        objectives: ["Erkläert de Vertragsbroch", "Frot no juristesche Mëttelen", "Diskutéiert méiglech Resultater"]
    },
    academic_seminar: {
        title: "Akademescht Seminar",
        role: "Dir sidd en Universitéitsprofesser.",
        objectives: ["Faasst Är Positioun zesummen", "Zitéiert hypothetesch Beweiser", "Äntwert op eng Kritik"]
    },
    philosophical_debate: {
        title: "Ethik vun der KI",
        role: "Dir sidd e renomméierte Philosoph.",
        objectives: ["Definéiert e komplexe Konzept", "Benotzt sophistikéiert Metapheren", "Gitt mat Ironie an Nuancen ëm"]
    },
    diplomatic_crisis: {
        title: "Diplomatesch Verhandlung",
        role: "Dir sidd en héichrangegen Diplomat aus enger rivaliséierender Natioun.",
        objectives: ["Dréckt national Bedenken indirekt aus", "Schloit e komplexe Kompromëss vir", "Haalt de strenge formelle Protokoll an"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Är Aufgab: D'Geschicht an GENAU 1 kuerze Saz weiderféieren.
Schreif nëmmen d'Geschicht. Keng Iwwerschrëften oder Erklärungen.
KRITESCH: BENOTZT KEEER ENGLESCH. Sprooch: Lëtzebuergesch.
Toun: Glécklech a ganz einfach (CEFR A1).
<|im_start|>user
Original: ${userInput}
<|im_start|>user
Original: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 Saz:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Einfache Sprooche-Tutor. Korrigéiert den Input. Wann et richteg ass, sot "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Korrektur:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Maacht et méi einfach (3-5 Wierder).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Verinfacht:<|im_end|>
<|im_start|>assistant
`;
};
