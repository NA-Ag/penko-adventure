import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Bestilling i en café",
        role: "Du er en barista i en travl café.",
        objectives: ["Hils på baristaen", "Bestil en drink", "Bestil mad", "Bed om regningen"]
    },
    directions: {
        title: "Spørge om vej",
        role: "Du er en hjælpsom lokal person på gaden.",
        objectives: ["Undskyld dig høfligt", "Spørg hvor togstationen er", "Tak den lokale person"]
    },
    doctor_visit: {
        title: "Hos lægen",
        role: "Du er læge. Brugeren er en patient.",
        objectives: ["Beskriv to symptomer", "Forstå lægens råd", "Spørg om medicin"]
    },
    shopping_clothes: {
        title: "Køb af tøj",
        role: "Du er en butiksassistent.",
        objectives: ["Spørg efter en specifik vare", "Diskuter størrelser", "Spørg om prisen"]
    },
    job_interview: {
        title: "Jobsamtale",
        role: "Du er en ansættelsesleder, der interviewer brugeren til et job i detailhandlen.",
        objectives: ["Præsenter dig selv professionelt", "Beskriv tidligere erfaring", "Stil et spørgsmål om rollen"]
    },
    meeting_friend: {
        title: "Møde med en ny ven",
        role: "Du er en studerende i en park.",
        objectives: ["Angiv dit navn og oprindelse", "Spørg den anden person om deres navn", "Sig et høfligt farvel"]
    },
    planning_picnic: {
        title: "Planlægning af en picnic",
        role: "Du er en ven af brugeren.",
        objectives: ["Tjek vejret", "Foreslå et mødetidspunkt", "Beslut hvilken mad der skal medbringes"]
    },
    new_coworker: {
        title: "Ny kollega",
        role: "Du er en ny medarbejder på din første dag.",
        objectives: ["Beskriv kontormiljøet", "Forklar daglige opgaver", "Giv et nyttigt tip"]
    },
    bank_account: {
        title: "Åbning af en bankkonto",
        role: "Du er en bankassistent i København.",
        objectives: ["Forklar årsagen til besøget", "Spørg om dokumenter", "Spørg om mobilbankfunktioner"]
    },
    environmental_meeting: {
        title: "Miljømøde i lokalsamfundet",
        role: "Du er en samfundsarrangør.",
        objectives: ["Argumenter for en bestemt politik", "Svar på bekymringer om omkostninger", "Opsummer et komplekst synspunkt"]
    },
    tradition_vs_modernity: {
        title: "Tradition vs. Modernitet",
        role: "Du er en modernist, der mener, at traditioner hindrer fremskridt.",
        objectives: ["Sammenlign historiske og moderne værdier", "Brug avancerede idiomer", "Analyser kulturel identitet"]
    },
    travel_complaint: {

        title: "Rejseklage",
        role: "Du er en flyselskabsagent i lufthavnen.",
        objectives: ["Forklar problemet", "Anmod om refusion eller ombooking", "Spørg om et hotel"]
    },
    apartment_dispute: {
        title: "Lejlighedsstrid",
        role: "Du er en udlejer, der er modvillig over for at betale for reparationer.",
        objectives: ["Beskriv skaden", "Argumenter for, hvorfor det er udlejerens ansvar", "Bliv enige om en reparationsdato"]
    },
    cultural_debate: {
        title: "Debat om sociale medier",
        role: "Du er en teknologiskeptisk ven.",
        objectives: ["Udtryk en holdning", "Giv to understøttende grunde", "Giv et modargument mod et punkt"]
    },
    legal_consultation: {
        title: "Juridisk rådgivning",
        role: "Du er en advokat med speciale i intellektuel ejendomsret.",
        objectives: ["Forklar kontraktbruddet", "Spørg om juridiske retsmidler", "Diskuter mulige resultater"]
    },
    academic_seminar: {
        title: "Akademisk seminar",
        role: "Du er en universitetsprofessor.",
        objectives: ["Opsummer din holdning", "Citer hypotetiske beviser", "Svar på et kritisk modargument"]
    },
    philosophical_debate: {
        title: "AI-etik",
        role: "Du er en anerkendt filosof.",
        objectives: ["Definer et komplekst abstrakt begreb", "Brug sofistikerede metaforer", "Håndter ironi og nuancer"]
    },
    diplomatic_crisis: {
        title: "Diplomatisk forhandling",
        role: "Du er en højtstående diplomat fra en rivaliserende nation.",
        objectives: ["Udtryk nationale bekymringer indirekte", "Foreslå et komplekst kompromis", "Overhold streng formel protokol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Din opgave: Fortsæt historien med maksimalt 1 eller 2 sætninger.
Brug ikke overskrifter, markdown-formatering eller snak udenom. Skriv kun selve historien.
Inkluder altid spillerens handling og eventuelle systemhændelser.
KRITISK: BRUG IKKE ENGELSK. Sprog: Dansk.
Tone: Beskrivende og medrivende.
Ret inputtet. Hvis det er korrekt, skal du kun sige "Perfekt."
<|im_start|>user
Original: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Fortsæt historien:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Hjælpsom sproglærer.
Ret inputtet. Hvis det er korrekt, skal du kun sige "Perfekt."
Forklar kort fejl på dansk.<|im_end|>
<|im_start|>user
Original: ${userInput}
Rettelse:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Skriv mere simpelt (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Forenklet:<|im_end|>
<|im_start|>assistant
`;
};
