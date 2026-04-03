import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Bestellen in een café",
        role: "Je bent een barista in een druk café.",
        objectives: ["Groet de barista", "Bestel een drankje", "Bestel eten", "Vraag om de rekening"]
    },
    directions: {
        title: "De weg vragen",
        role: "Je bent een behulpzame lokale bewoner op straat.",
        objectives: ["Excuseer je beleefd", "Vraag waar het treinstation is", "Bedank de bewoner"]
    },
    doctor_visit: {
        title: "Bij de dokter",
        role: "Je bent een dokter. De gebruiker is een patiënt.",
        objectives: ["Beschrijf twee symptomen", "Begrijp het advies van de dokter", "Vraag naar medicatie"]
    },
    shopping_clothes: {
        title: "Kleding kopen",
        role: "Je bent een winkelmedewerker.",
        objectives: ["Vraag naar een specifiek artikel", "Bespreek maten", "Vraag naar de prijs"]
    },
    job_interview: {
        title: "Sollicitatiegesprek",
        role: "Je bent een personeelsmanager die de gebruiker interviewt voor een baan in de detailhandel.",
        objectives: ["Stel jezelf professioneel voor", "Beschrijf eerdere ervaring", "Stel een vraag over de rol"]
    },
    meeting_friend: {
        title: "Een nieuwe vriend ontmoeten",
        role: "Je bent een student in een park.",
        objectives: ["Noem je naam en herkomst", "Vraag naar de naam van de andere persoon", "Zeg een beleefd afscheid"]
    },
    planning_picnic: {
        title: "Een picknick plannen",
        role: "Je bent een vriend van de gebruiker.",
        objectives: ["Controleer het weer", "Stel een tijdstip voor de ontmoeting voor", "Beslis welk eten je meeneemt"]
    },
    new_coworker: {
        title: "Nieuwe collega",
        role: "Je bent een nieuwe medewerker op je eerste dag.",
        objectives: ["Beschrijf de kantooromgeving", "Leg de dagelijkse taken uit", "Geef een nuttige tip"]
    },
    bank_account: {
        title: "Een bankrekening openen",
        role: "Je bent een bankbediende in Amsterdam.",
        objectives: ["Leg de reden voor het bezoek uit", "Informeer naar documenten", "Vraag naar functies voor mobiel bankieren"]
    },
    environmental_meeting: {
        title: "Milieubijeenkomst voor de gemeenschap",
        role: "Je bent een organisator van de gemeenschap.",
        objectives: ["Voer een argument aan voor een specifiek beleid", "Reageer op zorgen over de kosten", "Vat een complex standpunt samen"]
    },
    tradition_vs_modernity: {
        title: "Traditie vs. Moderniteit",
        role: "Je bent een modernist die gelooft dat tradities de vooruitgang belemmeren.",
        objectives: ["Vergelijk historische en moderne waarden", "Gebruik geavanceerde idiomen", "Analyseer de culturele identiteit"]
    },
    travel_complaint: {
        title: "Reisklacht",
        role: "Je bent een medewerker van een luchtvaartmaatschappij op de luchthaven.",
        objectives: ["Leg het probleem uit", "Vraag om terugbetaling of omboeking", "Informeer naar een hotel"]
    },
    apartment_dispute: {

        title: "Conflict over appartement",
        role: "Je bent een huisbaas die onwillig is om voor reparaties te betalen.",
        objectives: ["Beschrijf de schade", "Argumenteer waarom het de verantwoordelijkheid van de huisbaas is", "Spreek een reparatiedatum af"]
    },
    cultural_debate: {
        title: "Social media debat",
        role: "Je bent een technoskeptische vriend.",
        objectives: ["Geef je mening", "Geef twee ondersteunende redenen", "Reageer op een tegenargument"]
    },
    legal_consultation: {
        title: "Juridisch advies",
        role: "Je bent een advocaat gespecialiseerd in intellectueel eigendom.",
        objectives: ["Leg de contractbreuk uit", "Vraag naar juridische stappen", "Bespreek mogelijke uitkomsten"]
    },
    academic_seminar: {
        title: "Academisch seminar",
        role: "Je bent een universiteitsprofessor.",
        objectives: ["Vat je standpunt samen", "Citeer hypothetisch bewijs", "Reageer op een kritisch punt"]
    },
    philosophical_debate: {
        title: "Ethiek van AI",
        role: "Je bent een beroemd filosoof.",
        objectives: ["Definieer een complex abstract concept", "Gebruik verfijnde metaforen", "Ga om met ironie en nuances"]
    },
    diplomatic_crisis: {
        title: "Diplomatieke onderhandeling",
        role: "Je bent een hooggeplaatste diplomaat van een rivaliserend land.",
        objectives: ["Uite nationale zorgen indirect", "Stel een complex compromis voor", "Houd je aan strikt formeel protocol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
AI taaldocent (${levelName}). ${local.role}
Berlitz-regel: Verbeter fouten NIET expliciet. Bevestig het idee door op natuurlijke wijze de juiste grammatica te gebruiken.
Voorbeeld: Student: "Ik eten taart gisteren" -> Jij: "Ik heb gisteren ook **taart gegeten**, welke smaak vind je lekker?"

Scenario: ${local.title}
Doelen: ${local.objectives.join(', ')}

Instructies:
1. PRECIES 1 of 2 korte zinnen.
2. Taal: ${language}. ENGELS IS VERBODEN.
3. Niveau: ${levelName}.<|im_end|>
<|im_start|>user
Gesprek: ${history}
${systemEvent ? `Gebeurtenis: ${systemEvent}` : ''}
Student: ${action}
Antwoord van de docent:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Taaldocent. Verbeter fouten in de invoer van de gebruiker. Als het correct is, zeg "Perfect."<|im_end|>
<|im_start|>user
Origineel: ${userInput}
Correctie:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Maak de volgende tekst eenvoudiger (CEFR A1-niveau).<|im_end|>
<|im_start|>user
Origineel: ${narrativeText}
Vereenvoudigd:<|im_end|>
<|im_start|>assistant
`;
};
