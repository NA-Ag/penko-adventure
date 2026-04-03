import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Naročanje v kavarni",
        role: "Ste natakar v prometni kavarni.",
        objectives: ["Pozdravite natakarja", "Naročite pijačo", "Naročite hrano", "Prosite za račun"]
    },
    directions: {
        title: "Spraševanje za pot",
        role: "Ste prijazen domačin na ulici.",
        objectives: ["Vljudno se opravičite", "Vprašajte, kje je železniška postaja", "Zahvalite se domačinu"]
    },
    doctor_visit: {
        title: "Pri zdravniku",
        role: "Ste zdravnik. Uporabnik je bolnik.",
        objectives: ["Opišite dva simptoma", "Razumite zdravnikov nasvet", "Vprašajte o zdravilih"]
    },
    shopping_clothes: {
        title: "Nakupovanje oblačil",
        role: "Ste prodajalec v trgovini.",
        objectives: ["Vprašajte za določen izdelek", "Pogovorite se o velikostih", "Vprašajte za ceno"]
    },
    job_interview: {
        title: "Razgovor za službo",
        role: "Ste vodja zaposlovanja, ki opravlja razgovor z uporabnikom za delo v trgovini.",
        objectives: ["Profesionalno se predstavite", "Opišite pretekle izkušnje", "Postavite vprašanje o vlogi"]
    },
    meeting_friend: {
        title: "Srečanje z novim prijateljem",
        role: "Ste študent v parku.",
        objectives: ["Navedite svoje ime in poreklo", "Vprašajte drugo osebo po imenu", "Vljudno se poslovite"]
    },
    planning_picnic: {
        title: "Načrtovanje piknika",
        role: "Ste prijatelj uporabnika.",
        objectives: ["Preverite vreme", "Predlagajte čas srečanja", "Odločite se, katero hrano boste prinesli"]
    },
    new_coworker: {
        title: "Nov sodelavec",
        role: "Ste novi zaposleni na svoj prvi dan.",
        objectives: ["Opišite pisarniško okolje", "Razložite vsakodnevne naloge", "Dajte koristen nasvet"]
    },
    bank_account: {
        title: "Odpiranje bančnega računa",
        role: "Ste bančni uslužbenec v Ljubljani.",
        objectives: ["Pojasnite razlog obiska", "Povprašajte o dokumentih", "Vprašajte o funkcijah mobilnega bančništva"]
    },
    environmental_meeting: {
        title: "Sestanek okoljske skupnosti",
        role: "Ste organizator skupnosti.",
        objectives: ["Podajte argument za določeno politiko", "Odzovite se na pomisleke glede stroškov", "Povzemite zapleteno stališče"]
    },
    tradition_vs_modernity: {
        title: "Tradicija proti modernosti",
        role: "Ste modernist, ki verjame, da tradicije ovirajo napredek.",
        objectives: ["Primerjajte zgodovinske in moderne vrednote", "Uporabite napredne idiome", "Analizirajte kulturno identiteto"]
    },
    travel_complaint: {
        title: "Pritožba glede potovanja",
        role: "Ste letališki agent na letališču.",
        objectives: ["Pojasnite težavo", "Zahtevajte vračilo kupnine ali ponovno rezervacijo", "Povprašajte o hotelu"]
    },
    apartment_dispute: {
        title: "Spor glede stanovanja",
        role: "Ste najemodajalec, ki nerad plača za popravila.",
        objectives: ["Opišite škodo", "Argumentirajte, zakaj je to odgovornost najemodajalca", "Dogovorite se o datumu popravila"]
    },
    cultural_debate: {
        title: "Debata o družbenih medijih",
        role: "Ste prijatelj, ki je skeptičen do tehnologije.",
        objectives: ["Izrazite mnenje", "Navedite dva podporna razloga", "Odgovorite na nasprotni argument"]
    },
    legal_consultation: {

        title: "Pravno svetovanje",
        role: "Ste odvetnik, specializiran za intelektualno lastnino.",
        objectives: ["Pojasnite kršitev pogodbe", "Vprašajte o pravnih sredstvih", "Pogovorite se o možnih izidih"]
    },
    academic_seminar: {
        title: "Akademski seminar",
        role: "Ste univerzitetni profesor.",
        objectives: ["Povzemite svoje stališče", "Navedite hipotetične dokaze", "Odgovorite na kritično pripombo"]
    },
    philosophical_debate: {
        title: "Etika umetne inteligence",
        role: "Ste znani filozof.",
        objectives: ["Definirajte zapleten abstrakten pojem", "Uporabite prefinjene metafore", "Obvladujte ironijo in nianse"]
    },
    diplomatic_crisis: {
        title: "Diplomatska pogajanja",
        role: "Ste visoki diplomat iz konkurenčne države.",
        objectives: ["Posredno izrazite nacionalne skrbi", "Predlagajte zapleten kompromis", "Upoštevajte strog formalni protokol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
AI jezikovni učitelj (${levelName}). ${local.role}
Berlitzovo pravilo: NE popravljajte eksplicitno. Potrdite idejo z naravno uporabo pravilne gramatike.
Primer: Učenec: "Jaz jesti torto včeraj" -> Vi: "Tudi jaz sem včeraj **jedel torto**, kateri okus ti je všeč?"

Scenarij: ${local.title}
Cilji: ${local.objectives.join(', ')}

Navodila:
1. NATANČNO 1 ali 2 kratka stavka.
2. Jezik: ${language}. ANGLEŠČINA PREPOVEDANA.
3. Raven: ${levelName}.<|im_end|>
<|im_start|>user
Pogovor: ${history}
${systemEvent ? `Dogodek: ${systemEvent}` : ''}
Učenec: ${action}
Odgovor učitelja:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Jezikovni učitelj. Popravite napake v uporabnikovem vnosu. Če je pravilno, recite "Odlično" (ali "Perfect").<|im_end|>
<|im_start|>user
Izvirnik: ${userInput}
Popravek:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Poenostavite naslednje besedilo (raven CEFR A1).<|im_end|>
<|im_start|>user
Izvirnik: ${narrativeText}
Poenostavljeno:<|im_end|>
<|im_start|>assistant
`;
};
