import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Naručivanje u kafiću",
        role: "Vi ste konobar u prometnom kafiću.",
        objectives: ["Pozdravite konobara", "Naručite piće", "Naručite hranu", "Zatražite račun"]
    },
    directions: {
        title: "Pitanje za smjer",
        role: "Vi ste ljubazni lokalac na ulici.",
        objectives: ["Ljubazno se ispričajte", "Pitajte gdje je željeznička stanica", "Zahvalite lokalcu"]
    },
    doctor_visit: {
        title: "Kod liječnika",
        role: "Vi ste liječnik. Korisnik je pacijent.",
        objectives: ["Opišite dva simptoma", "Razumijte savjet liječnika", "Pitajte o lijekovima"]
    },
    shopping_clothes: {
        title: "Kupnja odjeće",
        role: "Vi ste prodavač.",
        objectives: ["Pitajte za određeni artikl", "Razgovarajte o veličinama", "Pitajte za cijenu"]
    },
    job_interview: {
        title: "Razgovor za posao",
        role: "Vi ste voditelj zapošljavanja koji intervjuira korisnika za posao u maloprodaji.",
        objectives: ["Predstavite se profesionalno", "Opišite prethodno iskustvo", "Postavite pitanje o ulozi"]
    },
    meeting_friend: {
        title: "Upoznavanje novog prijatelja",
        role: "Vi ste student u parku.",
        objectives: ["Navedite svoje ime i podrijetlo", "Pitajte drugu osobu za ime", "Recite učtivo zbogom"]
    },
    planning_picnic: {
        title: "Planiranje piknika",
        role: "Vi ste prijatelj korisnika.",
        objectives: ["Provjerite vrijeme", "Predložite vrijeme sastanka", "Odlučite koju hranu ćete ponijeti"]
    },
    new_coworker: {
        title: "Novi kolega",
        role: "Vi ste novi zaposlenik na svom prvom danu.",
        objectives: ["Opišite uredsko okruženje", "Objasnite svakodnevne zadatke", "Dajte koristan savjet"]
    },
    bank_account: {
        title: "Otvaranje bankovnog računa",
        role: "Vi ste bankovni službenik u Zagrebu.",
        objectives: ["Objasnite razlog posjeta", "Raspitajte se o dokumentima", "Pitajte o značajkama mobilnog bankarstva"]
    },
    environmental_meeting: {
        title: "Sastanak ekološke zajednice",
        role: "Vi ste organizator zajednice.",
        objectives: ["Iznesite argument za određenu politiku", "Odgovorite na zabrinutost oko troškova", "Sažmite složeno stajalište"]
    },
    tradition_vs_modernity: {
        title: "Tradicija protiv modernosti",
        role: "Vi ste modernist koji vjeruje da tradicije ometaju napredak.",
        objectives: ["Usporedite povijesne i moderne vrijednosti", "Koristite napredne idiome", "Analizirajte kulturni identitet"]
    },
    travel_complaint: {
        title: "Pritužba na putovanje",
        role: "Vi ste agent zrakoplovne tvrtke u zračnoj luci.",
        objectives: ["Objasnite problem", "Zatražite povrat novca ili novu rezervaciju", "Pitajte o hotelu"]
    },
    apartment_dispute: {
        title: "Spor oko stana",
        role: "Vi ste stanodavac koji ne želi platiti popravke.",
        objectives: ["Opišite štetu", "Argumentirajte zašto je to odgovornost stanodavca", "Dogovorite datum popravka"]
    },
    cultural_debate: {
        title: "Rasprava o društvenim mrežama",
        role: "Vi ste prijatelj koji je skeptičan prema tehnologiji.",
        objectives: ["Izrazite mišljenje", "Navedite dva razloga za potporu", "Odgovorite na protuargument"]
    },
    legal_consultation: {
        title: "Pravno savjetovanje",
        role: "Vi ste odvjetnik specijaliziran za intelektualno vlasništvo.",
        objectives: ["Objasnite kršenje ugovora", "Pitajte o pravnim lijekovima", "Razgovarajte o mogućim ishodima"]
    },
    academic_seminar: {
        title: "Akademski seminar",
        role: "Vi ste sveučilišni profesor.",
        objectives: ["Sažmite svoj stav", "Navedite hipotetske dokaze", "Odgovorite na kritičku primjedbu"]
    },
    philosophical_debate: {
        title: "Etika umjetne inteligencije",
        role: "Vi ste poznati filozof.",
        objectives: ["Definirajte složeni apstraktni pojam", "Koristite sofisticirane metafore", "Nosite se s ironijom i nijansama"]
    },
    diplomatic_crisis: {
        title: "Diplomatski pregovori",
        role: "Vi ste visoki diplomat iz konkurentske nacije.",
        objectives: ["Neizravno izrazite nacionalnu zabrinutost", "Predložite složeni kompromis", "Održavajte strogi formalni protokol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tvoj zadatak: Nastavi priču u najviše 1 ili 2 rečenice.
Ne koristi zaglavlja, markdown formatiranje niti popratne komentare. Piši samo samu priču.
Uvijek uključi igračevu akciju i sve sistemske događaje.
Jezik: Hrvatski.
Ton: Deskriptivan i impresivan.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Nastavi priču:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Korisni učitelj jezika.
Ispravi unos. Ako je točan, reci samo "Savršeno."
Kratko objasni pogreške na hrvatskom.<|im_end|>
<|im_start|>user
Original: ${userInput}
Ispravak:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Piši jednostavnije (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Pojednostavljeno:<|im_end|>
<|im_start|>assistant
`;
};
