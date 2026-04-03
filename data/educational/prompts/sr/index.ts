import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Naručivanje u kafiću",
        role: "Vi ste barista u prometnom kafiću.",
        objectives: ["Pozdravite baristu", "Naručite piće", "Naručite hranu", "Zatražite račun"]
    },
    directions: {
        title: "Pitanje za smer",
        role: "Vi ste ljubazni lokalac na ulici.",
        objectives: ["Ljubazno se izvinite", "Pitajte gde je železnička stanica", "Zahvalite lokalcu"]
    },
    doctor_visit: {
        title: "Kod lekara",
        role: "Vi ste lekar. Korisnik je pacijent.",
        objectives: ["Opišite dva simptoma", "Razumite savet lekara", "Pitajte o lekovima"]
    },
    shopping_clothes: {
        title: "Kupovina odeće",
        role: "Vi ste prodavac.",
        objectives: ["Pitajte za određeni artikl", "Razgovarajte o veličinama", "Pitajte za cenu"]
    },
    job_interview: {
        title: "Intervju za posao",
        role: "Vi ste menadžer zapošljavanja koji intervjuiše korisnika za posao u maloprodaji.",
        objectives: ["Predstavite se profesionalno", "Opišite prošlo iskustvo", "Postavite pitanje o ulozi"]
    },
    meeting_friend: {
        title: "Upoznavanje novog prijatelja",
        role: "Vi ste student u parku.",
        objectives: ["Navedite svoje ime i poreklo", "Pitajte drugu osobu za ime", "Recite učtivo zbogom"]
    },
    planning_picnic: {
        title: "Planiranje piknika",
        role: "Vi ste prijatelj korisnika.",
        objectives: ["Proverite vreme", "Predložite vreme sastanka", "Odlučite koju hranu ćete poneti"]
    },
    new_coworker: {
        title: "Novi kolega",
        role: "Vi ste novi zaposleni u svom prvom danu.",
        objectives: ["Opišite kancelarijsko okruženje", "Objasnite svakodnevne zadatke", "Dajte koristan savet"]
    },
    bank_account: {
        title: "Otvaranje bankovnog računa",
        role: "Vi ste bankovni službenik u Beogradu.",
        objectives: ["Objasnite razlog posete", "Raspitajte se o dokumentima", "Pitajte o funkcijama mobilnog bankarstva"]
    },
    environmental_meeting: {
        title: "Sastanak ekološke zajednice",
        role: "Vi ste organizator zajednice.",
        objectives: ["Iznesite argument za određenu politiku", "Odgovorite na zabrinutost oko troškova", "Sumirajte složeno gledište"]
    },
    tradition_vs_modernity: {
        title: "Tradicija protiv modernosti",
        role: "Vi ste modernist koji veruje da tradicije ometaju napredak.",
        objectives: ["Uporedite istorijske i moderne vrednosti", "Koristite napredne idiome", "Analizirajte kulturni identitet"]
    },
    travel_complaint: {
        title: "Žalba na putovanje",
        role: "Vi ste agent avio-kompanije na aerodromu.",
        objectives: ["Objasnite problem", "Zatražite povraćaj novca ili novu rezervaciju", "Raspitajte se o hotelu"]
    },
    apartment_dispute: {
        title: "Spor oko stana",
        role: "Vi ste stanodavac koji nerado plaća popravke.",
        objectives: ["Opišite štetu", "Argumentujte zašto je to odgovornost stanodavca", "Dogovorite datum popravke"]
    },
    cultural_debate: {
        title: "Debata o društvenim medijima",
        role: "Vi ste prijatelj koji je skeptičan prema tehnologiji.",
        objectives: ["Izrazite mišljenje", "Navedite dva razloga za podršku", "Odgovorite na kontraargument"]
    },
    legal_consultation: {

        title: "Pravno savetovanje",
        role: "Vi ste advokat specijalizovan za intelektualnu svojinu.",
        objectives: ["Objasnite kršenje ugovora", "Pitajte o pravnim lekovima", "Razgovarajte o mogućim ishodima"]
    },
    academic_seminar: {
        title: "Akademski seminar",
        role: "Vi ste univerzitetski profesor.",
        objectives: ["Sumirajte svoj stav", "Navedite hipotetičke dokaze", "Odgovorite na kritičku primedbu"]
    },
    philosophical_debate: {
        title: "Etika veštačke inteligencije",
        role: "Vi ste poznati filozof.",
        objectives: ["Definišite složeni apstraktni pojam", "Koristite sofisticirane metafore", "Nosite se sa ironijom i nijansama"]
    },
    diplomatic_crisis: {
        title: "Diplomatski pregovori",
        role: "Vi ste visoki diplomata iz konkurentske nacije.",
        objectives: ["Indirektno izrazite nacionalnu zabrinutost", "Predložite složeni kompromis", "Održavajte strogi formalni protokol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
AI учитељ језика (${levelName}). ${local.role}
Берлицово правило: НЕ исправљајте грешке експлицитно. Потврдите идеју природним коришћењем исправне граматике.
Пример: Ученик: "Ја јести торта јуче" -> Ви: "И ја сам јуче **јео торту**, који укус волиш?"

Сценарио: ${local.title}
Циљеви: ${local.objectives.join(', ')}

Упутства:
1. ТАЧНО 1 или 2 кратке реченице.
2. Језик: ${language}. ЕНГЛЕСКИ ЈЕ ЗАБРАЊЕН.
3. Ниво: ${levelName}.<|im_end|>
<|im_start|>user
Разговор: ${history}
${systemEvent ? `Догађај: ${systemEvent}` : ''}
Ученик: ${action}
Одговор учитеља:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Učitelj jezika. Ispravite greške u korisničkom unosu. Ako je tačno, recite "Savršeno" (ili "Perfect").<|im_end|>
<|im_start|>user
Original: ${userInput}
Ispravka:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Pojednostavite sledeći tekst (nivo CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Pojednostavljeno:<|im_end|>
<|im_start|>assistant
`;
};
