import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Objednávanie v kaviarni",
        role: "Ste barista v rušnej kaviarni.",
        objectives: ["Pozdravte baristu", "Objednajte si nápoj", "Objednajte si jedlo", "Požiadajte o účet"]
    },
    directions: {
        title: "Pýtanie sa na cestu",
        role: "Ste ochotný miestny obyvateľ na ulici.",
        objectives: ["Slušne sa ospravedlňte", "Opýtajte sa, kde je vlaková stanica", "Poďakujte miestnemu"]
    },
    doctor_visit: {
        title: "U lekára",
        role: "Ste lekár. Používateľ je pacient.",
        objectives: ["Popíšte dva príznaky", "Rozumejte radám lekára", "Opýtajte sa na lieky"]
    },
    shopping_clothes: {
        title: "Nakupovanie oblečenia",
        role: "Ste predavač v obchode.",
        objectives: ["Opýtajte sa na konkrétnu vec", "Prediskutujte veľkosti", "Opýtajte sa na cenu"]
    },
    job_interview: {
        title: "Pracovný pohovor",
        role: "Ste náborový manažér, ktorý vedie pohovor s používateľom na pozíciu v maloobchode.",
        objectives: ["Profesionálne sa predstavte", "Opíšte predchádzajúce skúsenosti", "Položte otázku týkajúcu sa roly"]
    },
    meeting_friend: {
        title: "Stretnutie s novým priateľom",
        role: "Ste študent v parku.",
        objectives: ["Uveďte svoje meno a pôvod", "Spýtajte sa druhú osobu na meno", "Zdvorilo sa rozlúčte"]
    },
    planning_picnic: {
        title: "Plánovanie pikniku",
        role: "Ste priateľ používateľa.",
        objectives: ["Skontrolujte počasie", "Navrhnite čas stretnutia", "Rozhodnite, aké jedlo prinesiete"]
    },
    new_coworker: {
        title: "Nový kolega",
        role: "Ste nový zamestnanec vo svoj prvý deň.",
        objectives: ["Opíšte prostredie kancelárie", "Vysvetlite každodenné úlohy", "Dajte užitočný tip"]
    },
    bank_account: {
        title: "Otvorenie bankového účtu",
        role: "Ste bankový úradník v Bratislave.",
        objectives: ["Vysvetlite dôvod návštevy", "Spýtajte sa na dokumenty", "Spýtajte sa na funkcie mobilného bankovníctva"]
    },
    environmental_meeting: {
        title: "Stretnutie ekologickej komunity",
        role: "Ste komunitný organizátor.",
        objectives: ["Predložte argument pre konkrétnu politiku", "Odpovedzte na obavy týkajúce sa nákladov", "Zhrňte zložitý uhol pohľadu"]
    },
    tradition_vs_modernity: {
        title: "Tradícia vs. modernita",
        role: "Ste modernista, ktorý verí, že tradície bránia pokroku.",
        objectives: ["Porovnajte historické a moderné hodnoty", "Použite pokročilé idiomy", "Analyzujte kultúrnu identitu"]
    },
    travel_complaint: {
        title: "Sťažnosť na cestu",
        role: "Ste pracovník leteckej spoločnosti na letisku.",
        objectives: ["Vysvetlite problém", "Požiadajte o vrátenie peňazí alebo zmenu rezervácie", "Spýtajte sa na hotel"]
    },
    apartment_dispute: {
        title: "Spor o byt",
        role: "Ste prenajímateľ, ktorý neochotne platí za opravy.",
        objectives: ["Opíšte poškodenie", "Argumentujte, prečo je to zodpovednosť prenajímateľa", "Dohodnite sa na dátume opravy"]
    },
    cultural_debate: {
        title: "Debata o sociálnych médiách",
        role: "Ste priateľ, ktorý je skeptický voči technológiám.",
        objectives: ["Vyjadrite názor", "Uveďte dva podporné dôvody", "Odpovedzte na protiargument"]
    },
    legal_consultation: {

        title: "Právna konzultácia",
        role: "Ste právnik špecializujúci sa na duševné vlastníctvo.",
        objectives: ["Vysvetlite porušenie zmluvy", "Opýtajte sa na právne prostriedky nápravy", "Prediskutujte možné výsledky"]
    },
    academic_seminar: {
        title: "Akademický seminár",
        role: "Ste univerzitný profesor.",
        objectives: ["Zhrňte svoj postoj", "Citujte hypotetické dôkazy", "Reagujte na kritickú pripomienku"]
    },
    philosophical_debate: {
        title: "Etika AI",
        role: "Ste uznávaný filozof.",
        objectives: ["Definujte zložitý abstraktný pojem", "Používajte prepracované metafory", "Zvládajte iróniu a nuansy"]
    },
    diplomatic_crisis: {
        title: "Diplomatické vyjednávanie",
        role: "Ste vysoko postavený diplomat z konkurenčnej krajiny.",
        objectives: ["Nepriamo vyjadrite národné obavy", "Navrhnite zložitý kompromis", "Dodržiavajte prísny formálny protokol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
AI jazykový lektor (${levelName}). ${local.role}
Berlitzovo pravidlo: NEOPRAVUJTE explicitne. Potvrďte myšlienku prirodzeným použitím správnej gramatiky.
Príklad: Študent: "Ja jesť tortu včera" -> Vy: "Ja som včera tiež **jedol tortu**, akú príchuť máš rád?"

Scenár: ${local.title}
Ciele: ${local.objectives.join(', ')}

Inštrukcie:
1. PRESNE 1 alebo 2 krátke vety.
2. Jazyk: ${language}. ANGLIČTINA ZAKÁZANÁ.
3. Úroveň: ${levelName}.<|im_end|>
<|im_start|>user
Rozhovor: ${history}
${systemEvent ? `Udalosť: ${systemEvent}` : ''}
Študent: ${action}
Odpoveď lektora:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Jazykový lektor. Opravte chyby v používateľskom vstupe. Ak je to správne, povedzte „Perfektné“ (alebo „Perfect“).<|im_end|>
<|im_start|>user
Originál: ${userInput}
Oprava:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Zjednodušte nasledujúci text (úroveň CEFR A1).<|im_end|>
<|im_start|>user
Originál: ${narrativeText}
Zjednodušené:<|im_end|>
<|im_start|>assistant
`;
};
