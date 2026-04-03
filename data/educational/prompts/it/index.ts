import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Ordinare al Caffè",
        role: "Sei un barista in un caffè affollato.",
        objectives: ["Salutare il barista", "Ordinare una bevanda", "Ordinare cibo", "Chiedere il conto"]
    },
    directions: {
        title: "Chiedere indicazioni",
        role: "Sei un abitante del posto gentile per strada.",
        objectives: ["Scusarsi educatamente", "Chiedere dove si trova la stazione ferroviaria", "Ringraziare l'abitante del posto"]
    },
    doctor_visit: {
        title: "Dal Medico",
        role: "Sei un medico. L'utente è un paziente.",
        objectives: ["Descrivere due sintomi", "Capire il consiglio del medico", "Chiedere informazioni sui farmaci"]
    },
    shopping_clothes: {
        title: "Acquistare vestiti",
        role: "Sei un commesso.",
        objectives: ["Chiedere un articolo specifico", "Discutere le taglie", "Chiedere il prezzo"]
    },
    job_interview: {
        title: "Colloquio di lavoro",
        role: "Sei un responsabile delle assunzioni che intervista l'utente per un lavoro nel settore retail.",
        objectives: ["Presentarsi professionalmente", "Descrivere l'esperienza passata", "Fare una domanda sul ruolo"]
    },
    meeting_friend: {
        title: "Incontrare un nuovo amico",
        role: "Sei uno studente in un parco.",
        objectives: ["Dire il proprio nome e l'origine", "Chiedere il nome dell'altra persona", "Dire un addio educato"]
    },
    planning_picnic: {
        title: "Pianificare un picnic",
        role: "Sei un amico dell'utente.",
        objectives: ["Controllare il meteo", "Suggerire un orario di incontro", "Decidere cosa portare da mangiare"]
    },
    new_coworker: {
        title: "Nuovo collega",
        role: "Sei un nuovo dipendente al tuo primo giorno.",
        objectives: ["Descrivere l'ambiente dell'ufficio", "Spiegare i compiti quotidiani", "Dare un consiglio utile"]
    },
    bank_account: {
        title: "Aprire un conto bancario",
        role: "Sei un impiegato di banca a Roma.",
        objectives: ["Spiegare il motivo della visita", "Chiedere informazioni sui documenti", "Chiedere informazioni sulle funzioni di mobile banking"]
    },
    environmental_meeting: {
        title: "Incontro comunitario ambientale",
        role: "Sei un organizzatore comunitario.",
        objectives: ["Sostenere una politica specifica", "Rispondere alle preoccupazioni sui costi", "Riassumere un punto di vista complesso"]
    },
    tradition_vs_modernity: {
        title: "Tradizione vs Modernità",
        role: "Sei un modernista che crede che le tradizioni ostacolino il progresso.",
        objectives: ["Confrontare i valori storici e moderni", "Usare idiomi avanzati", "Analizzare l'identità culturale"]
    },
    travel_complaint: {

        title: "Reclamo di viaggio",
        role: "Sei un agente di compagnia aerea in aeroporto.",
        objectives: ["Spiegare il problema", "Chiedere un rimborso o una nuova prenotazione", "Chiedere informazioni su un hotel"]
    },
    apartment_dispute: {
        title: "Disputa sull'appartamento",
        role: "Sei un proprietario riluttante a pagare le riparazioni.",
        objectives: ["Descrivere il danno", "Argomentare perché è responsabilità del proprietario", "Concordare una data per la riparazione"]
    },
    cultural_debate: {
        title: "Dibattito sui Social Media",
        role: "Sei un amico scettico sulla tecnologia.",
        objectives: ["Esprimere un'opinione", "Fornire due motivi di supporto", "Rispondere a un contro-argomento"]
    },
    legal_consultation: {
        title: "Consulenza legale",
        role: "Sei un avvocato specializzato in proprietà intellettuale.",
        objectives: ["Spiegare la violazione del contratto", "Chiedere rimedi legali", "Discutere i possibili esiti"]
    },
    academic_seminar: {
        title: "Seminario accademico",
        role: "Sei un professore universitario.",
        objectives: ["Riassumere la propria posizione", "Citare prove ipotetiche", "Rispondere a una critica"]
    },
    philosophical_debate: {
        title: "Etica dell'IA",
        role: "Sei un rinomato filosofo.",
        objectives: ["Definire un concetto astratto complesso", "Usare metafore sofisticate", "Gestire ironia e sfumature"]
    },
    diplomatic_crisis: {
        title: "Negoziato diplomatico",
        role: "Sei un diplomatico di alto livello di una nazione rivale.",
        objectives: ["Esprimere le preoccupazioni nazionali indirettamente", "Proporre un compromesso complesso", "Mantenere un protocollo formale rigoroso"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
Tutor linguistico AI (${levelName}). ${local.role}
Regola Berlitz: NON correggere esplicitamente. Convalida l'idea usando la grammatica corretta in modo naturale.
Esempio: Studente: "Io mangiare torta ieri" -> Tu: "Anch'io ho **mangiato la torta** ieri, che gusto ti piace?"

Scenario: ${local.title}
Obiettivi: ${local.objectives.join(', ')}

Istruzioni:
1. ESATTAMENTE 1 o 2 frasi brevi.
2. Lingua: ${language}. INGLESE PROIBITO.
3. Livello: ${levelName}.<|im_end|>
<|im_start|>user
Conversazione: ${history}
${systemEvent ? `Evento: ${systemEvent}` : ''}
Studente: ${action}
Risposta del tutor:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor linguistico. Correggi gli errori nell'input dell'utente. Se è corretto, dì "Perfetto" (o "Perfect").<|im_end|>
<|im_start|>user
Originale: ${userInput}
Correzione:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Rendi il seguente testo più semplice (livello CEFR A1).<|im_end|>
<|im_start|>user
Originale: ${narrativeText}
Semplificato:<|im_end|>
<|im_start|>assistant
`;
};
