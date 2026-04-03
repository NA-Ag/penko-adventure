import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Comanda la cafenea",
        role: "Ești un barista într-o cafenea aglomerată.",
        objectives: ["Salută barista", "Comandă o băutură", "Comandă mâncare", "Cere nota de plată"]
    },
    directions: {
        title: "Întreabă de drum",
        role: "Ești un localnic amabil de pe stradă.",
        objectives: ["Cere-ți scuze politicos", "Întreabă unde este gara", "Mulțumește localnicului"]
    },
    doctor_visit: {
        title: "La doctor",
        role: "Ești un doctor. Utilizatorul este un pacient.",
        objectives: ["Descrie două simptome", "Înțelege sfatul doctorului", "Întreabă despre medicație"]
    },
    shopping_clothes: {
        title: "Cumpărături de haine",
        role: "Ești un asistent de magazin.",
        objectives: ["Cere un articol specific", "Discută despre mărimi", "Întreabă de preț"]
    },
    job_interview: {
        title: "Interviu de angajare",
        role: "Sunteți un manager de recrutare care intervievează utilizatorul pentru un loc de muncă în retail.",
        objectives: ["Prezentați-vă profesional", "Descrieți experiența anterioară", "Puneți o întrebare despre rol"]
    },
    meeting_friend: {
        title: "Întâlnirea unui prieten nou",
        role: "Sunteți un student într-un parc.",
        objectives: ["Menționați numele și originea", "Întrebați numele celeilalte persoane", "Spuneți un la revedere politicos"]
    },
    planning_picnic: {
        title: "Planificarea unui picnic",
        role: "Sunteți un prieten al utilizatorului.",
        objectives: ["Verificați vremea", "Sugerați o oră de întâlnire", "Decideți ce mâncare să aduceți"]
    },
    new_coworker: {
        title: "Coleg nou",
        role: "Sunteți un nou angajat în prima zi.",
        objectives: ["Descrieți mediul de birou", "Explicați sarcinile zilnice", "Oferiți un sfat util"]
    },
    bank_account: {
        title: "Deschiderea unui cont bancar",
        role: "Sunteți un funcționar bancar în București.",
        objectives: ["Explicați motivul vizitei", "Întrebați despre documente", "Întrebați despre funcțiile de mobile banking"]
    },
    environmental_meeting: {
        title: "Întâlnire comunitară pentru mediu",
        role: "Sunteți un organizator comunitar.",
        objectives: ["Aduceți un argument pentru o anumită politică", "Răspundeți la preocupările legate de costuri", "Rezumați un punct de vedere complex"]
    },
    tradition_vs_modernity: {
        title: "Tradiție vs Modernitate",
        role: "Sunteți un modernist care crede că tradițiile împiedică progresul.",
        objectives: ["Comparați valorile istorice și moderne", "Folosiți expresii avansate", "Analizați identitatea culturală"]
    },
    travel_complaint: {
        title: "Reclamație de călătorie",
        role: "Sunteți un agent de companie aeriană la aeroport.",
        objectives: ["Explicați problema", "Solicitați o rambursare sau o reprogramare", "Întrebați despre un hotel"]
    },
    apartment_dispute: {
        title: "Dispută privind apartamentul",
        role: "Sunteți un proprietar care ezită să plătească pentru reparații.",
        objectives: ["Descrieți dauna", "Argumentați de ce este responsabilitatea proprietarului", "Stabiliți o dată pentru reparație"]
    },
    cultural_debate: {

        title: "Dezbatere despre rețelele sociale",
        role: "Ești un prieten sceptic față de tehnologie.",
        objectives: ["Exprimă o opinie", "Oferă două motive de susținere", "Răspunde la un contraargument"]
    },
    legal_consultation: {
        title: "Consultanță juridică",
        role: "Ești un avocat specializat în proprietate intelectuală.",
        objectives: ["Explică încălcarea contractului", "Întreabă de căi de atac juridice", "Discută rezultatele posibile"]
    },
    academic_seminar: {
        title: "Seminar academic",
        role: "Ești un profesor universitar.",
        objectives: ["Rezultă poziția ta", "Citează dovezi ipotetice", "Răspunde la o critică"]
    },
    philosophical_debate: {
        title: "Etica AI",
        role: "Ești un filozof renumit.",
        objectives: ["Definește un concept abstract complex", "Folosește metafore sofisticate", "Gestionează ironia și nuanțele"]
    },
    diplomatic_crisis: {
        title: "Negociere diplomatică",
        role: "Ești un diplomat de rang înalt dintr-o națiune rivală.",
        objectives: ["Exprimă preocupările naționale indirect", "Propune un compromis complex", "Menține protocolul formal strict"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Sarcina ta: Continuă povestea în maximum 1 sau 2 propoziții.
Nu folosi titluri, formatare markdown sau discuții inutile. Scrie doar povestea în sine.
Include întotdeauna acțiunea jucătorului și orice evenimente de sistem.
CRITIC: NU FOLOSI LIMBA ENGLEZĂ. Limba: Română.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Continuă povestea: Picăturile de ploaie sclipesc sub luminile de neon în timp ce cercetezi aleea liniștită. Observi o pisică mică care te urmărește din spatele unui coș de gunoi.<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutore de limbă util.
Corectează textul introdus. Dacă este corect, spune doar „Perfect.”.
Explică greșelile pe scurt în limba română.<|im_end|>
<|im_start|>user
Original: ${userInput}
Corecție:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Scrie mai simplu (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificat:<|im_end|>
<|im_start|>assistant
`;
};
