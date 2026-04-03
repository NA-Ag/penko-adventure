import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Demanar en una cafeteria",
        role: "Ets un cambrer en una cafeteria molt concorreguda.",
        objectives: ["Saludar el cambrer", "Demanar una beguda", "Demanar menjar", "Demanar el compte"]
    },
    directions: {
        title: "Demanar indicacions",
        role: "Ets una persona local amable al carrer.",
        objectives: ["Demanar perdó educadament", "Preguntar on és l'estació de tren", "Donar les gràcies"]
    },
    doctor_visit: {
        title: "Al metge",
        role: "Ets un metge. L'usuari és un pacient.",
        objectives: ["Descriure dos símptomes", "Entendre els consells del metge", "Preguntar sobre la medicació"]
    },
    shopping_clothes: {
        title: "Comprar roba",
        role: "Ets un dependent de botiga.",
        objectives: ["Demanar un article específic", "Parlar sobre les talles", "Preguntar pel preu"]
    },
    job_interview: {
        title: "Entrevista de feina",
        role: "Ets un gerent de contractació que entrevista l'usuari per a una feina.",
        objectives: ["Presentar-se professionalment", "Descriure l'experiència passada", "Fer una pregunta sobre el lloc"]
    },
    meeting_friend: {
        title: "Conèixer un nou amic",
        role: "Ets un estudiant en un parc.",
        objectives: ["Dir el teu nom i origen", "Preguntar el nom de l'altra persona", "Dir un comiat educat"]
    },
    planning_picnic: {
        title: "Planificar un pícnic",
        role: "Ets un amic de l'usuari.",
        objectives: ["Comprovar el temps", "Suggerir una hora de trobada", "Decidir quina menjar portar"]
    },
    new_coworker: {
        title: "Nou company de feina",
        role: "Ets un nou empleat en el teu primer dia.",
        objectives: ["Descriure l'entorn de l'oficina", "Explicar les tasques diàries", "Donar un consell útil"]
    },
    bank_account: {
        title: "Obrir un compte bancari",
        role: "Ets un empleat de banc a Barcelona.",
        objectives: ["Explicar el motiu de la visita", "Preguntar pels documents", "Preguntar sobre les funcions de banca mòbil"]
    },
    environmental_meeting: {
        title: "Reunió comunitària ambiental",
        role: "Ets un organitzador comunitari.",
        objectives: ["Argumentar a favor d'una política específica", "Respondre a les preocupacions sobre el cost", "Resumir un punt de vista complex"]
    },
    tradition_vs_modernity: {
        title: "Tradició vs Modernitat",
        role: "Ets un modernista que creu que les tradicions impedeixen el progrés.",
        objectives: ["Comparar els valors històrics i moderns", "Utilitzar idiomes avançats", "Analitzar la identitat cultural"]
    },
    travel_complaint: {

        title: "Queixa de viatge",
        role: "Ets un agent de companyia aèria a l'aeroport.",
        objectives: ["Explicar el problema", "Demanar un reemborsament o canvi de bitllet", "Preguntar per un hotel"]
    },
    apartment_dispute: {
        title: "Disputa per l'apartament",
        role: "Ets un propietari que es resisteix a pagar les reparacions.",
        objectives: ["Descriure els danys", "Argumentar per què és responsabilitat del propietari", "Acordar una data de reparació"]
    },
    cultural_debate: {
        title: "Debat sobre xarxes socials",
        role: "Ets un amic escèptic amb la tecnologia.",
        objectives: ["Expressar una opinió", "Donar dos motius de suport", "Respondre a un contraargument"]
    },
    legal_consultation: {
        title: "Consulta legal",
        role: "Ets un advocat especialitzat en propietat intel·lectual.",
        objectives: ["Explicar l'incompliment del contracte", "Preguntar per solucions legals", "Parlar dels possibles resultats"]
    },
    academic_seminar: {
        title: "Seminari acadèmic",
        role: "Ets un professor d'universitat.",
        objectives: ["Resumir la teva posició", "Citar evidències hipotètiques", "Respondre a una crítica"]
    },
    philosophical_debate: {
        title: "Ètica de l'IA",
        role: "Ets un filòsof de renom.",
        objectives: ["Definir un concepte abstracte complex", "Utilitzar metàfores sofisticades", "Gestionar la ironia i els matisos"]
    },
    diplomatic_crisis: {
        title: "Negociació diplomàtica",
        role: "Ets un diplomat d'alt nivell d'una nació rival.",
        objectives: ["Expressar preocupacions nacionals indirectament", "Proposar un compromís complex", "Mantenir un protocol formal estricte"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
Tutor d'idiomes d'IA (${levelName}). ${local.role}
Regla Berlitz: NO corregeixis explícitament. Valida la idea utilitzant la gramàtica correcta de forma natural.
Exemple: Estudiant: "Jo menjar pastís" -> Tu: "Jo també **vaig menjar** pastís avui, quin sabor t'agrada?"

Escenari: ${local.title}
Objectius: ${local.objectives.join(', ')}

Regles:
1. EXACTAMENT 1 o 2 frases curtes.
2. Llengua: ${language}. ANGLÈS PROHIBIT.
3. Nivell: ${levelName}.<|im_end|>
<|im_start|>user
Conversa: ${history}
${systemEvent ? `Esdeveniment: ${systemEvent}` : ''}
Estudiant: ${action}
Resposta del tutor:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor d'idiomes. Corregeix els errors en l'entrada de l'usuari. Si és correcte, digues "Perfecte."<|im_end|>
<|im_start|>user
Original: ${userInput}
Correcció:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Fes que el següent text sigui més senzill (nivell CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificat:<|im_end|>
<|im_start|>assistant
`;
};
