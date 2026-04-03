import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Bestilling på kafé",
        role: "Du er en barista på en travel kafé.",
        objectives: ["Hils på baristaen", "Bestill en drink", "Bestill mat", "Be om regningen"]
    },
    directions: {
        title: "Spørre om vei",
        role: "Du er en hjelpsom lokal person på gaten.",
        objectives: ["Unnskyld deg høflig", "Spør hvor togstasjonen er", "Takk den lokale personen"]
    },
    doctor_visit: {
        title: "Hos legen",
        role: "Du er en lege. Brukeren er en pasient.",
        objectives: ["Beskriv to symptomer", "Forstå legens råd", "Spør om medisin"]
    },
    shopping_clothes: {
        title: "Kleshandel",
        role: "Du er en butikkassistent.",
        objectives: ["Spør etter en spesifikk vare", "Diskuter størrelser", "Spør om prisen"]
    },
    job_interview: {
        title: "Jobbintervju",
        role: "Du er en rekrutteringsansvarlig som intervjuer brukeren for en jobb i detaljhandelen.",
        objectives: ["Introduser deg selv profesjonelt", "Beskriv tidligere erfaring", "Still et spørsmål om rollen"]
    },
    meeting_friend: {
        title: "Møte en ny venn",
        role: "Du er en student i en park.",
        objectives: ["Oppgi navn og opprinnelse", "Spør om den andre personens navn", "Si et høflig farvel"]
    },
    planning_picnic: {
        title: "Planlegge en piknik",
        role: "Du er en venn av brukeren.",
        objectives: ["Sjekk været", "Foreslå et tidspunkt for møtet", "Bestem hvilken mat som skal tas med"]
    },
    new_coworker: {
        title: "Ny kollega",
        role: "Du er en ny ansatt på din første dag.",
        objectives: ["Beskriv kontormiljøet", "Forklar daglige oppgaver", "Gi et nyttig tips"]
    },
    bank_account: {
        title: "Åpne en bankkonto",
        role: "Du er en bankmedarbeider i Oslo.",
        objectives: ["Forklar årsaken til besøket", "Spør om dokumenter", "Spør om mobilbankfunksjoner"]
    },
    environmental_meeting: {
        title: "Miljømøte i lokalsamfunnet",
        role: "Du er en samfunnsorganisator.",
        objectives: ["Argumenter for en bestemt politikk", "Svar på bekymringer om kostnader", "Oppsummer et komplekst synspunkt"]
    },
    tradition_vs_modernity: {
        title: "Tradisjon vs. Modernitet",
        role: "Du er en modernist som mener at tradisjoner hindrer fremgang.",
        objectives: ["Sammenlign historiske og moderne verdier", "Bruk avanserte idiomer", "Analyser kulturell identitet"]
    },
    travel_complaint: {
        title: "Reiseklage",
        role: "Du er en flyselskapagent på flyplassen.",
        objectives: ["Forklar problemet", "Be om refusjon eller ombooking", "Spør om et hotell"]
    },
    apartment_dispute: {
        title: "Leilighetsdisputt",
        role: "Du er en utleier som er motvillig til å betale for reparasjoner.",
        objectives: ["Beskriv skaden", "Argumenter for hvorfor det er utleiers ansvar", "Bli enig om en reparasjonsdato"]
    },
    cultural_debate: {
        title: "Debatt om sosiale medier",
        role: "Du er en teknologiskjeptisk venn.",
        objectives: ["Uttrykk en mening", "Gi to støttebegrunnelser", "Svar på et motargument"]
    },
    legal_consultation: {
        title: "Juridisk rådgivning",
        role: "Du er en advokat som spesialiserer seg på intellektuell eiendom.",
        objectives: ["Forklar kontraktsbruddet", "Spør om juridiske virkemidler", "Diskuter mulige resultater"]
    },
    academic_seminar: {
        title: "Akademisk seminar",
        role: "Du er en universitetsprofessor.",
        objectives: ["Oppsummer din posisjon", "Siter hypotetiske bevis", "Svar på en kritisk bemerkning"]
    },
    philosophical_debate: {
        title: "AI-etikk",
        role: "Du er en anerkjent filosof.",
        objectives: ["Definer et komplekst abstrakt konsept", "Bruk sofistikerte metaforer", "Håndter ironi og nyanser"]
    },
    diplomatic_crisis: {
        title: "Diplomatisk forhandling",
        role: "Du er en høytstående diplomat fra en rivaliserende nasjon.",
        objectives: ["Uttrykk nasjonale bekymringer indirekte", "Foreslå et komplekst kompromiss", "Overhold streng formell protokoll"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
AI-språklærer (${levelName}). ${local.role}
Berlitz-regel: IKKE rett feil eksplisitt. Bekreft ideen ved å bruke riktig grammatikk naturlig.
Eksempel: Elev: "Jeg spise kake i går" -> Du: "Jeg **spiste** også kake i går, hvilken smak liker du?"

Scenario: ${local.title}
Mål: ${local.objectives.join(', ')}

Instruksjoner:
1. AKKURAT 1 eller 2 korte setninger.
2. Språk: ${language}. ENGELSK ER FORBUDT.
3. Nivå: ${levelName}.<|im_end|>
<|im_start|>user
Samtale: ${history}
${systemEvent ? `Hendelse: ${systemEvent}` : ''}
Elev: ${action}
Lærerens svar:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Språklærer. Rett feil i brukerens inndata. Hvis det er riktig, si "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Retting:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gjør følgende tekst enklere (CEFR A1-nivå).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Forenklet:<|im_end|>
<|im_start|>assistant
`;
};
