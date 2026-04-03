import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Beställa på ett kafé",
        role: "Du är en barista på ett livligt kafé.",
        objectives: ["Hälsa på baristan", "Beställ en dryck", "Beställ mat", "Be om notan"]
    },
    directions: {
        title: "Fråga om vägen",
        role: "Du är en hjälpsam lokalbo på gatan.",
        objectives: ["Ursäkta dig artigt", "Fråga var tågstationen ligger", "Tacka lokalbon"]
    },
    doctor_visit: {
        title: "Hos doktorn",
        role: "Du är en läkare. Användaren är en patient.",
        objectives: ["Beskriv två symtom", "Förstå doktorns råd", "Fråga om medicin"]
    },
    shopping_clothes: {
        title: "Handla kläder",
        role: "Du är en butiksanställd.",
        objectives: ["Fråga efter en specifik vara", "Diskutera storlekar", "Fråga om priset"]
    },
    job_interview: {
        title: "Anställningsintervju",
        role: "Du är en rekryteringsansvarig som intervjuar användaren för ett jobb inom detaljhandeln.",
        objectives: ["Presentera dig professionellt", "Beskriv tidigare erfarenhet", "Ställ en fråga om rollen"]
    },
    meeting_friend: {
        title: "Möta en ny vän",
        role: "Du är en student i en park.",
        objectives: ["Ange ditt namn och ursprung", "Fråga efter den andra personens namn", "Säg ett artigt adjö"]
    },
    planning_picnic: {
        title: "Planera en picknick",
        role: "Du är en vän till användaren.",
        objectives: ["Kontrollera vädret", "Föreslå en tid för mötet", "Bestäm vilken mat som ska tas med"]
    },
    new_coworker: {
        title: "Ny kollega",
        role: "Du är en nyanställd på din första dag.",
        objectives: ["Beskriv kontorsmiljön", "Förklara dagliga uppgifter", "Ge ett användbart tips"]
    },
    bank_account: {
        title: "Öppna ett bankkonto",
        role: "Du är en banktjänsteman i Stockholm.",
        objectives: ["Förklara orsaken till besöket", "Fråga om dokument", "Fråga om mobilbankfunktioner"]
    },
    environmental_meeting: {
        title: "Miljömöte i lokalsamhället",
        role: "Du är en samhällsorganisatör.",
        objectives: ["Argumentera för en specifik policy", "Svara på oro kring kostnader", "Sammanfatta en komplex ståndpunkt"]
    },
    tradition_vs_modernity: {
        title: "Tradition vs. Modernitet",
        role: "Du är en modernist som anser att traditioner hindrar framsteg.",
        objectives: ["Jämför historiska och moderna värden", "Använd avancerade idiom", "Analysera kulturell identitet"]
    },
    travel_complaint: {
        title: "Reseklagomål",
        role: "Du är en flygbolagsagent på flygplatsen.",
        objectives: ["Förklara problemet", "Be om återbetalning eller ombokning", "Fråga om ett hotell"]
    },
    apartment_dispute: {
        title: "Lägenhetsvist",
        role: "Du är en hyresvärd som är motvillig att betala för reparationer.",
        objectives: ["Beskriv skadan", "Argumentera för varför det är hyresvärdens ansvar", "Kom överens om ett datum för reparation"]
    },
    cultural_debate: {

        title: "Debatt om sociala medier",
        role: "Du är en teknikskeptisk vän.",
        objectives: ["Uttryck en åsikt", "Ge två stödjande skäl", "Svara på ett motargument"]
    },
    legal_consultation: {
        title: "Juridisk rådgivning",
        role: "Du är en advokat specialiserad på immaterialrätt.",
        objectives: ["Förklara avtalsbrottet", "Fråga om rättsliga åtgärder", "Diskutera möjliga utfall"]
    },
    academic_seminar: {
        title: "Akademiskt seminarium",
        role: "Du är en universitetsprofessor.",
        objectives: ["Sammanfatta din ståndpunkt", "Citera hypotetiska bevis", "Svara på en kritisk punkt"]
    },
    philosophical_debate: {
        title: "AI-etik",
        role: "Du är en känd filosof.",
        objectives: ["Definiera ett komplext abstrakt koncept", "Använd sofistikerade metaforer", "Hantera ironi och nyanser"]
    },
    diplomatic_crisis: {
        title: "Diplomatisk förhandling",
        role: "Du är en högt uppsatt diplomat från en rivaliserande nation.",
        objectives: ["Uttryck nationella bekymren indirekt", "Föreslå en komplex kompromiss", "Upprätthåll strikt formellt protokoll"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Din uppgift: Fortsätt berättelsen med EXAKT 1 kort mening.
Skriv bara själva berättelsen. Inga rubriker eller förklaringar.
KRITISKT: ANVÄND INTE ENGELSKA. Språk: Svenska.
Ton: Glad och mycket enkel (CEFR A1).
Exempel:
Berättelsen hittills: Det regnar på gatan.
Spelarens handling: Jag ser mig omkring.
<|im_start|>user
Original: ${userInput}
<|im_start|>user
Original: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Enkel språklärare. Rätta texten. Om den är rätt, säg "Perfekt."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Enkel språklärare. Rätta texten. Om den är rätt, säg "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Rättning:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gör det enklare (3-5 ord).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Förenklat:<|im_end|>
<|im_start|>assistant
`;
};
