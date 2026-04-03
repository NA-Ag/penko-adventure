import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Objednávání v kavárně",
        role: "Jsi barista v rušné kavárně.",
        objectives: ["Pozdrav baristu", "Objednej si nápoj", "Objednej si jídlo", "Požádej o účet"]
    },
    directions: {
        title: "Ptaní se na cestu",
        role: "Jsi ochotný místní obyvatel na ulici.",
        objectives: ["Slušně se omluv", "Zeptej se, kde je vlakové nádraží", "Poděkuj místnímu"]
    },
    doctor_visit: {
        title: "U lékaře",
        role: "Jsi lékař. Uživatel je pacient.",
        objectives: ["Popiš dva příznaky", "Rozuměj radám lékaře", "Zeptej se na léky"]
    },
    shopping_clothes: {
        title: "Nakupování oblečení",
        role: "Jsi prodavač v obchodě.",
        objectives: ["Zeptej se na konkrétní věc", "Prodiskutuj velikosti", "Zeptej se na cenu"]
    },
    job_interview: {
        title: "Pracovní pohovor",
        role: "Jsi personalista, který vede pohovor s uživatelem na pozici v obchodě.",
        objectives: ["Profesionálně se představ", "Popiš předchozí zkušenosti", "Polož otázku k pozici"]
    },
    meeting_friend: {
        title: "Setkání s novým přítelem",
        role: "Jsi student v parku.",
        objectives: ["Uveď své jméno a původ", "Zeptej se druhé osoby na jméno", "Zdvořile se rozluč"]
    },
    planning_picnic: {
        title: "Plánování pikniku",
        role: "Jsi přítel uživatele.",
        objectives: ["Zkontroluj počasí", "Navrhni čas setkání", "Rozhodni, jaké jídlo přineseš"]
    },
    new_coworker: {
        title: "Nový kolega",
        role: "Jsi nový zaměstnanec ve svůj první den.",
        objectives: ["Popiš prostředí kanceláře", "Vysvětli každodenní úkoly", "Dej užitečný tip"]
    },
    bank_account: {
        title: "Otevření bankovního účtu",
        role: "Jsi bankovní úředník v Praze.",
        objectives: ["Vysvětli důvod návštěvy", "Zeptej se na dokumenty", "Zeptej se na funkce mobilního bankovnictví"]
    },
    environmental_meeting: {
        title: "Setkání ekologické komunity",
        role: "Jsi komunitní organizátor.",
        objectives: ["Předlož argument pro konkrétní politiku", "Odpověz na obavy ohledně nákladů", "Shrň složitý úhel pohledu"]
    },
    tradition_vs_modernity: {
        title: "Tradice vs. modernita",
        role: "Jsi modernista, který věří, že tradice brání pokroku.",
        objectives: ["Porovnej historické a moderní hodnoty", "Použij pokročilé idiomy", "Analyzuj kulturní identitu"]
    },
    travel_complaint: {
        title: "Stížnost na cestu",
        role: "Jsi pracovník letecké společnosti na letišti.",
        objectives: ["Vysvětli problém", "Požádej o vrácení peněz nebo přerezervování", "Zeptej se na hotel"]
    },
    apartment_dispute: {
        title: "Spor o byt",
        role: "Jsi pronajímatel, který se zdráhá zaplatit opravy.",
        objectives: ["Popiš poškození", "Argumentuj, proč je to odpovědnost pronajímatele", "Dohodni se na datu opravy"]
    },
    cultural_debate: {
        title: "Debata o sociálních médiích",
        role: "Jsi technopesimistický přítel.",
        objectives: ["Vyjádři názor", "Uveď dva podpůrné důvody", "Oponuj argumentu"]
    },
    legal_consultation: {
        title: "Právní konzultace",
        role: "Jsi právník specializující se na duševní vlastnictví.",
        objectives: ["Vysvětli porušení smlouvy", "Zeptej se na právní prostředky nápravy", "Prodiskutuj možné výsledky"]
    },
    academic_seminar: {
        title: "Akademický seminář",
        role: "Jsi univerzitní profesor.",
        objectives: ["Shrň svůj postoj", "Cituj hypotetické důkazy", "Reaguj na kritickou připomínku"]
    },
    philosophical_debate: {
        title: "Etika AI",
        role: "Jsi uznávaný filozof.",
        objectives: ["Definuj složitý abstraktní pojem", "Používej propracované metafory", "Zvládej ironii a nuance"]
    },
    diplomatic_crisis: {
        title: "Diplomatické vyjednávání",
        role: "Jsi vysoce postavený diplomat z konkurenční země.",
        objectives: ["Nepřímo vyjádři národní obavy", "Navrhni složitý kompromis", "Dodržuj přísný formální protokol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Váš úkol: Pokračujte v příběhu maximálně v 1 nebo 2 větách.
Nepoužívejte nadpisy, formátování markdown ani mimotematické řeči. Pište pouze příběh.
Vždy zahrňte akci hráče a jakékoli systémové události.
KRITICKÉ: NEPOUŽÍVEJTE ANGLIČTINU. Jazyk: Čeština.
Tón: Popisný a pohlcující.
Příklad:
Dosavadní příběh: Na ulici prší.
Akce hráče: Rozhlédnu se kolem sebe.
Opravte vstup. Pokud je v pořádku, řekněte pouze "Perfektní.".
<|im_start|>user
Originál: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Pokračujte v příběhu:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Pomocný jazykový lektor.
Opravte vstup. Pokud je v pořádku, řekněte pouze "Perfektní.".
Stručně vysvětlete chyby v češtině.<|im_end|>
<|im_start|>user
Originál: ${userInput}
Oprava:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Pište jednodušeji (CEFR A1).<|im_end|>
<|im_start|>user
Originál: ${narrativeText}
Zjednodušeno:<|im_end|>
<|im_start|>assistant
`;
};
