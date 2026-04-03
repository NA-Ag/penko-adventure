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
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Vaš zadatak: Nastavite priču u TAČNO 1 kratkoj rečenici.
Pišite samo priču. Bez naslova ili objašnjenja.
Na kraju uključite [ROMANIZATION: phonetic sounds].
KRITIČNO: NE KORISTITE ENGLESKI JEZIK. Jezik: Srpski.
Ton: Veseta i veoma jednostavan (CEFR A1).
Primer:
Priča do sada: Na ulici pada kiša.
Akcija igrača: Gledam oko sebe.
<|im_start|>user
Original: ${userInput}
<|im_start|>user
Original: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Jednostavni učitelj jezika. Ispravite unos. Ako je ispravan, recite "Savršeno."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Jednostavni učitelj jezika. Ispravite unos. Ako je ispravan, recite "Savršeno."<|im_end|>
<|im_start|>user
Original: ${userInput}
Ispravka:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Učinite to jednostavnijim (3-5 reči).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Pojednostavljeno:<|im_end|>
<|im_start|>assistant
`;
};
