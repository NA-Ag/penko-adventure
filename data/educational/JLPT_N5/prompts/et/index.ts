import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kohvikus tellimine",
        role: "Sa oled barista kiires kohvikus.",
        objectives: ["Tervita baristat", "Telli jook", "Telli toit", "Küsi arvet"]
    },
    directions: {
        title: "Tee küsimine",
        role: "Sa oled abivalmis kohalik elanik tänaval.",
        objectives: ["Vabanda viisakalt", "Küsi, kus on rongijaam", "Täna kohalikku"]
    },
    doctor_visit: {
        title: "Arsti juures",
        role: "Sa oled arst. Kasutaja on patsient.",
        objectives: ["Kirjelda kahte sümptomit", "Mõista arsti nõuandeid", "Küsi ravimite kohta"]
    },
    shopping_clothes: {
        title: "Riiete ostmine",
        role: "Sa oled kaupluse müüja.",
        objectives: ["Küsi konkreetset eset", "Aruta suurusi", "Küsi hinna kohta"]
    },
    job_interview: {
        title: "Tööintervjuu",
        role: "Sa oled personalijuht, kes intervjueerib kasutajat jaemüügi tööks.",
        objectives: ["Tutvusta end professionaalselt", "Kirjelda varasemat kogemust", "Esita küsimus rolli kohta"]
    },
    meeting_friend: {
        title: "Uue sõbraga kohtumine",
        role: "Sa oled õpilane pargis.",
        objectives: ["Ütle oma nimi ja päritolu", "Küsi teise inimese nime", "Ütle viisakas hüvastijätt"]
    },
    planning_picnic: {
        title: "Pikniku planeerimine",
        role: "Sa oled kasutaja sõber.",
        objectives: ["Kontrolli ilma", "Paku välja kohtumisaeg", "Otsusta, millist toitu kaasa võtta"]
    },
    new_coworker: {
        title: "Uus kolleeg",
        role: "Sa oled uus töötaja oma esimesel päeval.",
        objectives: ["Kirjelda kontorikeskkonda", "Selgita igapäevaseid ülesandeid", "Anna kasulik nõuanne"]
    },
    bank_account: {
        title: "Pangakonto avamine",
        role: "Sa oled pangatöötaja Tallinnas.",
        objectives: ["Selgita külastuse põhjust", "Küsi dokumentide kohta", "Küsi mobiilipanga funktsioonide kohta"]
    },
    environmental_meeting: {
        title: "Keskkonnaalane kogukonna koosolek",
        role: "Sa oled kogukonna korraldaja.",
        objectives: ["Esita argument konkreetse poliitika poolt", "Vasta kulusid puudutavatele muredele", "Võta kokku keeruline seisukoht"]
    },
    tradition_vs_modernity: {
        title: "Traditsioon vs modernsus",
        role: "Sa oled modernist, kes usub, et traditsioonid takistavad progressi.",
        objectives: ["Võrdle ajaloolisi ja kaasaegseid väärtusi", "Kasuta edasijõudnud idioome", "Analüüsi kultuurilist identiteeti"]
    },
    travel_complaint: {
        title: "Reisikaebus",
        role: "Sa oled lennufirma agent lennujaamas.",
        objectives: ["Selgita probleemi", "Küsi raha tagastamist või uut broneeringut", "Uuri hotelli kohta"]
    },
    apartment_dispute: {
        title: "Korteritüli",
        role: "Sa oled korteriomanik, kes ei taha remondi eest maksta.",
        objectives: ["Kirjelda kahjustusi", "Argumenteeri, miks see on omaniku vastutus", "Lepi kokku remondi kuupäev"]
    },
    cultural_debate: {
        title: "Sotsiaalmeedia debatt",
        role: "Sa oled tehnoloogia suhtes skeptiline sõber.",
        objectives: ["Avalda arvamust", "Esita kaks toetavat põhjust", "Vasta vastuargumendile"]
    },
    legal_consultation: {
        title: "Õigusalane konsultatsioon",
        role: "Sa oled intellektuaalomandile spetsialiseerunud jurist.",
        objectives: ["Selgita lepingu rikkumist", "Küsi õiguskaitsevahendite kohta", "Aruta võimalikke tulemusi"]
    },
    academic_seminar: {
        title: "Akadeemiline seminar",
        role: "Sa oled ülikooli professor.",
        objectives: ["Võta oma seisukoht kokku", "Tsiteeri hüpoteetilisi tõendeid", "Vasta kriitilisele vastuväitele"]
    },
    philosophical_debate: {
        title: "AI eetika",
        role: "Sa oled tunnustatud filosoof.",
        objectives: ["Defineeri keeruline abstraktne mõiste", "Kasuta peeneid metafoore", "Tule toime iroonia ja nüanssidega"]
    },
    diplomatic_crisis: {
        title: "Diplomaatilised läbirääkimised",
        role: "Sa oled konkureeriva riigi kõrgetasemeline diplomaat.",
        objectives: ["Väljenda riiklikke muresid kaudselt", "Paku välja keeruline kompromiss", "Järgi ranget ametlikku protokolli"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Sinu ülesanne: Jätka lugu TÄPSELT 1 lühikese lausega.
Kirjuta ainult lugu. Ei mingeid pealkirju ega selgitusi.
KRIITILINE: ÄRA KASUTA INGLISE KEELT. Keel: Eesti keel.
Toon: Rõõmus ja väga lihtne (CEFR A1).
<|im_start|>user
Originaal: ${userInput}
<|im_start|>user
Originaal: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 lause:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Lihtne keeleõpetaja. Paranda sisend. Kui see on õige, ütle "Suurepärane."<|im_end|>
<|im_start|>user
Originaal: ${userInput}
Parandus:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Tee see lihtsamaks (3-5 sõna).<|im_end|>
<|im_start|>user
Originaal: ${narrativeText}
Lihtsustatud:<|im_end|>
<|im_start|>assistant
`;
};
