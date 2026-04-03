import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Bestel by 'n Kafee",
        role: "Jy is 'n barista by 'n besige kafee.",
        objectives: ["Groet die barista", "Bestel 'n drankie", "Bestel kos", "Vra vir die rekening"]
    },
    directions: {
        title: "Vra vir Padwysings",
        role: "Jy is 'n hulpvaardige plaaslike persoon op straat.",
        objectives: ["Verskoon jouself beleefd", "Vra waar die treinstasie is", "Bedank die plaaslike persoon"]
    },
    doctor_visit: {
        title: "By die Dokter",
        role: "Jy is 'n dokter. Die gebruiker is 'n pasiënt.",
        objectives: ["Beskryf twee simptome", "Verstaan die dokter se advies", "Vra oor medikasie"]
    },
    shopping_clothes: {
        title: "Klere Koop",
        role: "Jy is 'n winkelassistent.",
        objectives: ["Vra vir 'n spesifieke item", "Bespreek groottes", "Vra oor die prys"]
    },
    job_interview: {
        title: "Werksonderhoud",
        role: "Jy is 'n huurbestuurder wat die gebruiker onderhou vir 'n kleinhandelwerk.",
        objectives: ["Stel jouself professioneel voor", "Beskryf vorige ervaring", "Vra 'n vraag oor die rol"]
    },
    meeting_friend: {
        title: "Ontmoet 'n Nuwe Vriend",
        role: "Jy is 'n student in 'n park.",
        objectives: ["Noem jou naam en herkoms", "Vra vir die ander persoon se naam", "Sê 'n beleefde afskeid"]
    },
    planning_picnic: {
        title: "Beplanning van 'n Piekniek",
        role: "Jy is 'n vriend van die gebruiker.",
        objectives: ["Gaan die weer na", "Stel 'n ontmoetingstyd voor", "Besluit watter kos om saam te neem"]
    },
    new_coworker: {
        title: "Nuwe Medewerker",
        role: "Jy is 'n nuwe werknemer op jou eerste dag.",
        objectives: ["Beskryf die kantooromgewing", "Verduidelik daaglikse take", "Gee 'n nuttige wenk"]
    },
    bank_account: {
        title: "Maak 'n Bankrekening Oop",
        role: "Jy is 'n bankklerk in Kaapstad.",
        objectives: ["Verduidelik die rede vir die besoek", "Navraag oor dokumente", "Vra oor mobiele bankfunksies"]
    },
    environmental_meeting: {
        title: "Omgewingsgemeenskapsvergadering",
        role: "Jy is 'n gemeenskapsorganiseerder.",
        objectives: ["Voer 'n argument vir 'n spesifieke beleid", "Reageer op kommer oor koste", "Opsomming van 'n komplekse standpunt"]
    },
    tradition_vs_modernity: {
        title: "Tradisie vs Moderniteit",
        role: "Jy is 'n modernis wat glo tradisies belemmer vooruitgang.",
        objectives: ["Vergelyk historiese en moderne waardes", "Gebruik gevorderde idiome", "Ontleed kulturele identiteit"]
    },
    travel_complaint: {
        title: "Reisklagte",
        role: "Jy is 'n lugredery-agent by die lughawe.",
        objectives: ["Verduidelik die probleem", "Versoek 'n terugbetaling of herbespreking", "Navraag oor 'n hotel"]
    },
    apartment_dispute: {
        title: "Woonsteldispuut",
        role: "Jy is 'n verhuurder wat huiwerig is om vir herstelwerk te betaal.",
        objectives: ["Beskryf die skade", "Redeneer waarom dit die verhuurder se verantwoordelikheid is", "Stem in oor 'n hersteldatum"]
    },
    cultural_debate: {
        title: "Sosiale Media Debat",
        role: "Jy is 'n tegnologie-skeptiese vriend.",
        objectives: ["Stel 'n mening", "Verskaf twee ondersteunende redes", "Voer 'n teenargument teen 'n punt"]
    },
    legal_consultation: {
        title: "Regskonsultasie",
        role: "Jy is 'n prokureur wat spesialiseer in intellektuele eiendom.",
        objectives: ["Verduidelik die kontrakbreuk", "Navraag oor regsmiddels", "Bespreek moontlike uitkomste"]
    },
    academic_seminar: {
        title: "Akademiese Seminaar",
        role: "Jy is 'n universiteitsprofessor.",
        objectives: ["Opsomming van jou posisie", "Haal hipotetiese bewyse aan", "Reageer op 'n kritiese teenpunt"]
    },
    philosophical_debate: {
        title: "Etiek van KI",
        role: "Jy is 'n bekende filosoof.",
        objectives: ["Definieer 'n komplekse abstrakte konsep", "Gebruik gesofistikeerde metafore", "Hanteer ironie en nuanse"]
    },
    diplomatic_crisis: {
        title: "Diplomatieke Onderhandeling",
        role: "Jy is 'n hoëvlak diplomaat van 'n mededingende nasie.",
        objectives: ["Druk nasionale bekommernisse indirek uit", "Stel 'n komplekse kompromie voor", "Handhaaf streng formele protokol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Jou taak: Voer die storie voort in maksimum 1 of 2 sinne.
Geen opskrifte, geen markdown, geen gesels nie. Skryf net die storie.
Sluit altyd die speler se aksie en enige stelselgebeure in.
KRITIES: GEEN ENGELS. Taal: Afrikaans.
Toon: Beskrywend en meesleurend.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Gaan voort met die storie:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Hulpsame taalonderwyser.
Korrigeer die insette. As dit reg is, sê net "Perfek."
Verduidelik foute kortliks in Afrikaans.<|im_end|>
<|im_start|>user
Oorspronklik: ${userInput}
Regstelling:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Skryf eenvoudiger (CEFR A1).<|im_end|>
<|im_start|>user
Oorspronklik: ${narrativeText}
Vereenvoudig:<|im_end|>
<|im_start|>assistant
`;
};
