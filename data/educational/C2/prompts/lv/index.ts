import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Pasūtīšana kafejnīcā",
        role: "Jūs esat barista pārpildītā kafejnīcā.",
        objectives: ["Sveiciniet baristu", "Pasūtiet dzērienu", "Pasūtiet ēdienu", "Palūdziet rēķinu"]
    },
    directions: {
        title: "Ceļa jautāšana",
        role: "Jūs esat atsaucīgs vietējais iedzīvotājs uz ielas.",
        objectives: ["Pieklājīgi atvainojieties", "Pajautājiet, kur atrodas dzelzceļa stacija", "Pateicieties vietējam"]
    },
    doctor_visit: {
        title: "Pie ārsta",
        role: "Jūs esat ārsts. Lietotājs ir pacients.",
        objectives: ["Aprakstiet divus simptomus", "Saprotiet ārsta padomu", "Pajautājiet par zālēm"]
    },
    shopping_clothes: {
        title: "Apģērbu pirkšana",
        role: "Jūs esat veikala asistents.",
        objectives: ["Pajautājiet par konkrētu preci", "Pārrunājiet izmērus", "Pajautājiet par cenu"]
    },
    job_interview: {
        title: "Darba intervija",
        role: "Jūs esat personāla atlases vadītājs, kurš intervē lietotāju darbam mazumtirdzniecībā.",
        objectives: ["Iepazīstiniet ar sevi profesionāli", "Aprakstiet iepriekšējo pieredzi", "Uzdodiet jautājumu par amatu"]
    },
    meeting_friend: {
        title: "Iepazīšanās ar jaunu draugu",
        role: "Jūs esat students parkā.",
        objectives: ["Pasakiet savu vārdu un izcelsmi", "Pajautājiet otras personas vārdu", "Pieklājīgi atvadieties"]
    },
    planning_picnic: {
        title: "Piknika plānošana",
        role: "Jūs esat lietotāja draugs.",
        objectives: ["Pārbaudiet laikapstākļus", "Ierosiniet tikšanās laiku", "Izlemiet, kādu ēdienu ņemt līdzi"]
    },
    new_coworker: {
        title: "Jauns kolēģis",
        role: "Jūs esat jauns darbinieks savā pirmajā dienā.",
        objectives: ["Aprakstiet biroja vidi", "Paskaidrojiet ikdienas uzdevumus", "Sniedziet noderīgu padomu"]
    },
    bank_account: {
        title: "Bankas konta atvēršana",
        role: "Jūs esat bankas darbinieks Rīgā.",
        objectives: ["Paskaidrojiet vizītes iemeslu", "Pajautājiet par dokumentiem", "Pajautājiet par mobilās bankas funkcijām"]
    },
    environmental_meeting: {
        title: "Vides kopienas sanāksme",
        role: "Jūs esat kopienas organizators.",
        objectives: ["Sniedziet argumentu par labu konkrētai politikai", "Atbildiet uz bažām par izmaksām", "Apkopojiet sarežģītu viedokli"]
    },
    tradition_vs_modernity: {
        title: "Tradīcijas pret modernitāti",
        role: "Jūs esat modernists, kurš uzskata, ka tradīcijas kavē progresu.",
        objectives: ["Salīdziniet vēsturiskās un mūsdienu vērtības", "Izmantojiet sarežģītus frazeoloģismus", "Analizējiet kultūras identitāti"]
    },
    travel_complaint: {
        title: "Sūdzība par ceļojumu",
        role: "Jūs esat aviokompānijas aģents lidostā.",
        objectives: ["Paskaidrojiet problēmu", "Pieprasiet atmaksu vai rezervācijas maiņu", "Pajautājiet par viesnīcu"]
    },
    apartment_dispute: {
        title: "Strīds par dzīvokli",
        role: "Jūs esat izīrētājs, kurš nelabprāt maksā par remontu.",
        objectives: ["Aprakstiet bojājumus", "Argumentējiet, kāpēc tā ir izīrētāja atbildība", "Vienojieties par remonta datumu"]
    },

    cultural_debate: {
        title: "Sociālo mediju debates",
        role: "Jūs esat draugs, kurš ir skeptisks pret tehnoloģijām.",
        objectives: ["Izsakiet viedokli", "Sniedziet divus pamatojošus iemeslus", "Atbildiet uz pretargumentu"]
    },
    legal_consultation: {
        title: "Juridiskā konsultācija",
        role: "Jūs esat jurists, kas specializējas intelektuālā īpašuma jomā.",
        objectives: ["Paskaidrojiet līguma pārkāpumu", "Interesējieties par tiesiskās aizsardzības līdzekļiem", "Pārrunājiet iespējamos rezultātus"]
    },
    academic_seminar: {
        title: "Akadēmiskais seminārs",
        role: "Jūs esat universitātes profesors.",
        objectives: ["Apkopojiet savu nostāju", "Citējiet hipotētiskus pierādījumus", "Atbildiet uz kritisku piezīmi"]
    },
    philosophical_debate: {
        title: "MI ētika",
        role: "Jūs esat slavens filozofs.",
        objectives: ["Definējiet sarežģītu abstraktu jēdzienu", "Izmantojiet smalkas metaforas", "Tieciet galā ar ironiju un niansēm"]
    },
    diplomatic_crisis: {
        title: "Diplomātiskās sarunas",
        role: "Jūs esat augsta līmeņa diplomāts no konkurējošas valsts.",
        objectives: ["Netieši izsakiet nacionālās bažas", "Piedāvājiet sarežģītu kompromisu", "Ievērojiet stingru formālu protokolu"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tavs uzdevums: Turpināt stāstu ne vairāk kā 1 vai 2 teikumos.
Nelietojiet virsrakstus, markdown formatējumu vai blakus piezīmes. Rakstiet tikai pašu stāstu.
Vienmēr iekļaujiet spēlētāja darbību un visus sistēmas notikumus.
Valoda: Latviešu.
Tonis: Aprakstošs un aizraujošs.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Turpināt stāstu:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Noderīgs valodu skolotājs.
Izlabo ievadi. Ja tā ir pareiza, saki tikai "Izcili."
Īsi paskaidro kļūdas latviešu valodā.<|im_end|>
<|im_start|>user
Oriģināls: ${userInput}
Labojums:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Rakstiet vienkāršāk (CEFR A1).<|im_end|>
<|im_start|>user
Oriģināls: ${narrativeText}
Vienkāršots:<|im_end|>
<|im_start|>assistant
`;
};
