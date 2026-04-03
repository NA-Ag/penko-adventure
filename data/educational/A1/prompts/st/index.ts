import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Ho odela ka k'hefeng",
        role: "O mosebeletsi oa k'hefe (barista) k'hefeng e tšoarehileng.",
        objectives: ["Lumelisa mosebeletsi", "Odela seno", "Odela lijo", "Kopa bili"]
    },
    directions: {
        title: "Ho botsa tsela",
        role: "O motho oa sebaka ea thusang seterateng.",
        objectives: ["Kopa tšoarelo ka mekhoa", "Botsa hore na seteishene sa literene se hokae", "Leboha motho oa sebaka"]
    },
    doctor_visit: {
        title: "Ho Ngaka",
        role: "O ngaka. Mosebelisi ke mokuli.",
        objectives: ["Hlalosa matšoao a mabeli", "Utloisisa keletso ea ngaka", "Botsa ka meriana"]
    },
    shopping_clothes: {
        title: "Ho reka liaparo",
        role: "O mothusi oa lebenkele.",
        objectives: ["Kopa ntho e itseng", "Buisana ka boholo", "Botsa ka theko"]
    },
    job_interview: {
        title: "Puisano ea Mosebetsi",
        role: "O mookameli ea hirang ea botsang mosebelisi lipotso bakeng sa mosebetsi.",
        objectives: ["Ithehele ka mokhoa oa setsebi", "Hlalosa boiphihlelo ba nakong e fetileng", "Botsa potso ka mosebetsi"]
    },
    meeting_friend: {
        title: "Ho kopana le motswalle e motjha",
        role: "O moithuti phaking.",
        objectives: [" Bolela lebitso la hao le moo o tswang teng", "Botsa lebitso la motho e mong", "Dumedisa ka tlhompho ha o tsamaya"]
    },
    planning_picnic: {
        title: "Ho rala pikiniki",
        role: "O motswalle wa mosebedisi.",
        objectives: ["Hlahloba boemo ba lehodimo", "Sisinya nako ya ho kopana", "Etshwa qeto ya hore na ke dijo dife tseo o tla tla ka tsona"]
    },
    new_coworker: {
        title: "Mosebetsimmoho e motjha",
        role: "O mosebeletsi e motjha ka letsatsi la hao la pele.",
        objectives: ["Hlalosa boemo ba ofisi", "Hlalosa mesebetsi ya letsatsi le letsatsi", "Fana ka keletso e thusang"]
    },
    bank_account: {
        title: "Ho bula akhaonto ya banka",
        role: "O mosebeletsi wa banka Maseru.",
        objectives: ["Hlalosa lebaka la ho etela", "Botsa ka ditokomane", "Botsa ka dikarolo tsa banka ya selefouno"]
    },
    environmental_meeting: {
        title: "Seboka sa baahi ka tikoloho",
        role: "O morulaganyi wa baahi.",
        objectives: ["Fana ka mabaka bakeng sa pholisi e itseng", "Araba matshwenyeho ka ditshenyehelo", "Akaretsa pono e rarahaneng"]
    },
    tradition_vs_modernity: {
        title: "Setso vs Boemo ba jwale",
        role: "O motho ya ratang boemo ba jwale ya dumelang hore ditso di sitisa tswelopele.",
        objectives: ["Bapisa mekgwa ya kgalale le ya jwale", "Sebelisa maele a hlabollang", "Sekaseka boitsebiso ba setso"]
    },
    travel_complaint: {
        title: "Tletlebo ea Leeto",
        role: "O moemeli oa k'hamphani ea lifofane boema-fofane.",
        objectives: ["Hlalosa bothata", "Kopa pusetso ea chelete kapa ho fetola nako", "Botsa ka hotele"]
    },
    apartment_dispute: {
        title: "Khohlano ea Folete",
        role: "O mong'a ntlo ea sa batleng ho lefa bakeng sa litokiso.",
        objectives: ["Hlalosa tšenyo", "Fana ka mabaka a hore na ke hobane'ng ha e le boikarabelo ba mong'a ntlo", "Lumellanang ka letsatsi la ho lokisa"]
    },
    cultural_debate: {
        title: "Puisano ea Mecha ea Litaba ea Sechaba",
        role: "O motsoalle ea sa tšepeng theknoloji haholo.",
        objectives: ["Fana ka maikutlo", "Fana ka mabaka a mabeli a tšehetsang", "Araba ntlha e khahlanong le maikutlo a hau"]
    },
    legal_consultation: {
        title: "Keletso ea Molao",
        role: "O loia ea ikhethang ka thepa ea bohlale (intellectual property).",
        objectives: ["Hlalosa ho tloloa ha konteraka", "Botsa ka litsela tsa molao", "Buisana ka liphello tse ka bang teng"]
    },
    academic_seminar: {
        title: "Semina ea Thuto",
        role: "O moprofesa oa yunivesithi.",
        objectives: ["Akaretsa maikutlo a hau", "Qotsa bopaki ba boikaketsi", "Araba nyatso"]
    },
    philosophical_debate: {
        title: "Melao ea Boitšoaro ea AI",
        role: "O rafilosofi ea tummeng.",
        objectives: ["Hlalosa mohopolo o rarahaneng", "Sebelisa lipapiso tse tebileng", "Tšoara ho tšeha le lintlha tse ling"]
    },
    diplomatic_crisis: {
        title: "Lipuisano tsa Boemeli",
        role: "O moemeli oa maemo a phahameng ea tsoang naheng e phelisanang le e 'ngoe.",
        objectives: ["Hlalosa matšoenyeho a naha ka tsela e sa tobang", "Sutumelletsa tumellano e rarahaneng", "Boloka melao e tiileng ea 'muso"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Mosebetsi oa hao: Tsoela pele ka pale ka polelo e le 1 e khutšoanyane hantle.
Ngola pale feela. Ntle le lihlooho kapa litlhaloso.
BOHLOA: U SE KE UA SEBELISA SENYESEMANE. Puo: Sesotho.
Molumo: O thabileng le o bonolo haholo (CEFR A1).
Mohlala:
Pale ho fihlela joale: Pula e na seterateng.
Ketso ea sebapali: ke qamaka hohle.
<|im_start|>user
Sefeane: ${userInput}
<|im_start|>user
Sefeane: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Polelo e le 1:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mokoetlisi oa puo ea bonolo. Lokisa lintlha. Haeba ho nepahetse, re "Ho lokile haholo."<|im_end|>
<|im_start|>user
Sefeane: ${userInput}
Tokiso:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
E etse hore e be bonolo (mantsoe a 3-5).<|im_end|>
<|im_start|>user
Sefeane: ${narrativeText}
Tlhaloso e bonolo:<|im_end|>
<|im_start|>assistant
`;
};
