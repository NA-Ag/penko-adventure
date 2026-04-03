import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Rendelés egy kávézóban",
        role: "Te egy barista vagy egy forgalmas kávézóban.",
        objectives: ["Köszönj a baristának", "Rendelj egy italt", "Rendelj ételt", "Kérd a számlát"]
    },
    directions: {
        title: "Útbaigazítás kérése",
        role: "Te egy segítőkész helyi lakos vagy az utcán.",
        objectives: ["Kérj elnézést udvariasan", "Kérdezd meg, hol van a vasútállomás", "Mondj köszönetet a helyinek"]
    },
    doctor_visit: {
        title: "Az orvosnál",
        role: "Te egy orvos vagy. A felhasználó egy beteg.",
        objectives: ["Írj le két tünetet", "Értsd meg az orvos tanácsát", "Kérdezz a gyógyszerről"]
    },
    shopping_clothes: {
        title: "Ruha vásárlása",
        role: "Te egy bolti eladó vagy.",
        objectives: ["Kérj egy konkrét terméket", "Beszéljétek meg a méreteket", "Kérdezz az árról"]
    },
    job_interview: {
        title: "Állásinterjú",
        role: "Te egy felvételi menedzser vagy, aki interjúztatja a felhasználót.",
        objectives: ["Mutatkozz be professzionálisan", "Mesélj a korábbi tapasztalatokról", "Tegyél fel egy kérdést a munkakörről"]
    },
    meeting_friend: {
        title: "Találkozás egy új baráttal",
        role: "Te egy diák vagy egy parkban.",
        objectives: ["Mondd el a neved és származásod", "Kérdezd meg a másik személy nevét", "Köszönj el udvariasan"]
    },
    planning_picnic: {
        title: "Piknik tervezése",
        role: "A felhasználó barátja vagy.",
        objectives: ["Ellenőrizd az időjárást", "Javasolj egy találkozási időpontot", "Döntsd el, milyen ételt hozzatok"]
    },
    new_coworker: {
        title: "Új munkatárs",
        role: "Új alkalmazott vagy az eerste napodon.",
        objectives: ["Írd le az irodai környezetet", "Magyarázd el a napi feladatokat", "Adj egy hasznos tippet"]
    },
    bank_account: {
        title: "Bankszámlanyitás",
        role: "Banki ügyintéző vagy Budapesten.",
        objectives: ["Magyarázd el a látogatás okát", "Érdeklődj a dokumentumokról", "Kérdezz a mobilbanki funkciókról"]
    },
    environmental_meeting: {
        title: "Környezetvédelmi közösségi találkozó",
        role: "Közösségi szervező vagy.",
        objectives: ["Érvelj egy adott politika mellett", "Válaszolj a költségekkel kapcsolatos aggályokra", "Foglalj össze egy összetett nézőpontot"]
    },
    tradition_vs_modernity: {
        title: "Hagyomány vs. Modernitás",
        role: "Modernista vagy, aki szerint a hagyományok gátolják a fejlődést.",
        objectives: ["Hasonlítsd össze a történelmi és modern értékeket", "Használj haladó idiómákat", "Elemezd a kulturális identitást"]
    },
    travel_complaint: {
        title: "Utazási panasz",
        role: "Te egy légitársasági ügynök vagy a repülőtéren.",
        objectives: ["Magyarázd el a problémát", "Kérj visszatérítést vagy újrafoglalást", "Érdeklődj szálloda felől"]
    },
    apartment_dispute: {

        title: "Lakásvita",
        role: "Te egy főbérlő vagy, aki nem szívesen fizet a javításokért.",
        objectives: ["Írd le a kárt", "Érvelj, miért a főbérlő felelőssége", "Egyezzetek meg a javítás időpontjában"]
    },
    cultural_debate: {
        title: "Közösségi média vita",
        role: "Te egy technológia-szkeptikus barát vagy.",
        objectives: ["Fejtsd ki a véleményed", "Adj két indokot", "Válaszolj egy ellenérvre"]
    },
    legal_consultation: {
        title: "Jogi tanácsadás",
        role: "Te egy szellemi tulajdonra szakosodott ügyvéd vagy.",
        objectives: ["Magyarázd el a szerződésszegést", "Kérdezz a jogorvoslatokról", "Beszéljetek a lehetséges kimenetelekről"]
    },
    academic_seminar: {
        title: "Akadémiai szeminárium",
        role: "Te egy egyetemi professzor vagy.",
        objectives: ["Foglald össze az álláspontodat", "Idézz hipotetikus bizonyítékokat", "Válaszolj egy kritikai észrevételre"]
    },
    philosophical_debate: {
        title: "AI etika",
        role: "Te egy neves filozófus vagy.",
        objectives: ["Definiálj egy összetett absztrakt fogalmat", "Használj kifinomult metaforákat", "Kezeled az iróniát és az árnyalatokat"]
    },
    diplomatic_crisis: {
        title: "Diplomáciai tárgyalás",
        role: "Te egy rivális nemzet magas rangú diplomatája vagy.",
        objectives: ["Fejezd ki a nemzeti aggályokat közvetve", "Javasolj összetett kompromisszumot", "Tarts be szigorú formális protokollt"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

A feladatod: Folytasd a történetet PONTOSAN 1 rövid mondatban.
Csak magát a történetet írd le. Ne használj címsorokat vagy magyarázatokat.
KRITIKUS: NE HASZNÁLJ ANGOL NYELVET. Nyelv: Magyar.
Stílus: Vidám és nagyon egyszerű (CEFR A1).
<|im_start|>user
Eredeti: ${userInput}
<|im_start|>user
Eredeti: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Egyszerű nyelvtanár. Javítsd ki a beírt szöveget. Ha helyes, mondd azt: "Tökéletes."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Egyszerű nyelvtanár. Javítsd ki a beírt szöveget. Ha helyes, mondd azt: "Tökéletes."<|im_end|>
<|im_start|>user
Eredeti: ${userInput}
Javítás:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Legyen egyszerűbb (3-5 szó).<|im_end|>
<|im_start|>user
Eredeti: ${narrativeText}
Egyszerűsített:<|im_end|>
<|im_start|>assistant
`;
};
