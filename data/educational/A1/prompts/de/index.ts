import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "In einem Café bestellen",
        role: "Du bist ein Barista in einem belebten Café.",
        objectives: ["Begrüße den Barista", "Bestelle ein Getränk", "Bestelle etwas zu essen", "Frage nach der Rechnung"]
    },
    directions: {
        title: "Nach dem Weg fragen",
        role: "Du bist ein hilfreicher Einheimischer auf der Straße.",
        objectives: ["Entschuldige dich höflich", "Frage nach dem Bahnhof", "Bedanke dich"]
    },
    doctor_visit: {
        title: "Beim Arzt",
        role: "Du bist ein Arzt. Der Benutzer ist ein Patient.",
        objectives: ["Beschreibe zwei Symptome", "Verstehe den Rat des Arztes", "Frage nach Medikamenten"]
    },
    shopping_clothes: {
        title: "Kleidung kaufen",
        role: "Du bist ein Verkäufer in einem Geschäft.",
        objectives: ["Frage nach einem bestimmten Artikel", "Besprich die Größen", "Frage nach dem Preis"]
    },
    job_interview: {
        title: "Vorstellungsgespräch",
        role: "Du bist ein Personalmanager, der den Benutzer für einen Job im Einzelhandel interviewt.",
        objectives: ["Stelle dich professionell vor", "Beschreibe bisherige Erfahrungen", "Stelle eine Frage zur Position"]
    },
    meeting_friend: {
        title: "Einen neuen Freund treffen",
        role: "Du bist ein Student in einem Park.",
        objectives: ["Nenne deinen Namen und deine Herkunft", "Frage die andere Person nach ihrem Namen", "Verabschiede dich höflich"]
    },
    planning_picnic: {
        title: "Ein Picknick planen",
        role: "Du bist ein Freund des Benutzers.",
        objectives: ["Prüfe das Wetter", "Schlage eine Zeit für das Treffen vor", "Entscheide, welches Essen mitgebracht werden soll"]
    },
    new_coworker: {
        title: "Neuer Kollege",
        role: "Du bist ein neuer Mitarbeiter an deinem ersten Tag.",
        objectives: ["Beschreibe die Büroumgebung", "Erkläre die täglichen Aufgaben", "Gib einen nützlichen Tipp"]
    },
    bank_account: {
        title: "Ein Bankkonto eröffnen",
        role: "Du bist ein Bankangestellter in Berlin.",
        objectives: ["Erkläre den Grund des Besuchs", "Frage nach den Unterlagen", "Frage nach Mobile-Banking-Funktionen"]
    },
    environmental_meeting: {
        title: "Umwelt-Gemeindetreffen",
        role: "Du bist ein Gemeindeorganisator.",
        objectives: ["Argumentiere für eine bestimmte Richtlinie", "Reagiere auf Kostensorgen", "Fasse einen komplexen Standpunkt zusammen"]
    },
    tradition_vs_modernity: {
        title: "Tradition vs. Moderne",
        role: "Du bist ein Modernist, der glaubt, dass Traditionen den Fortschritt behindern.",
        objectives: ["Vergleiche historische und moderne Werte", "Verwende fortgeschrittene Idiome", "Analysiere die kulturelle Identität"]
    },
    travel_complaint: {
        title: "Reisebeschwerde",
        role: "Du bist ein Mitarbeiter einer Fluggesellschaft am Flughafen.",
        objectives: ["Erkläre das Problem", "Frage nach Erstattung oder Umbuchung", "Frage nach einem Hotel"]
    },
    apartment_dispute: {
        title: "Wohnungsstreit",
        role: "Du bist ein Vermieter, der Reparaturen nur ungern bezahlt.",
        objectives: ["Beschreibe den Schaden", "Argumentiere, warum der Vermieter zuständig ist", "Vereinbare einen Termin"]
    },
    cultural_debate: {
        title: "Social-Media-Debatte",
        role: "Du bist ein technikskeptischer Freund.",
        objectives: ["Äußere eine Meinung", "Nenne zwei Gründe", "Antworte auf ein Gegenargument"]
    },
    legal_consultation: {
        title: "Rechtsberatung",
        role: "Du bist ein Anwalt für geistiges Eigentum.",
        objectives: ["Erkläre den Vertragsbruch", "Frage nach rechtlichen Möglichkeiten", "Besprich mögliche Ergebnisse"]
    },
    academic_seminar: {
        title: "Akademisches Seminar",
        role: "Du bist ein Universitätsprofessor.",
        objectives: ["Fasse deine Position zusammen", "Zitiere hypothetische Beweise", "Antworte auf Kritik"]
    },
    philosophical_debate: {
        title: "KI-Ethik",
        role: "Du bist ein bekannter Philosoph.",
        objectives: ["Definiere ein komplexes Konzept", "Nutze anspruchsvolle Metaphern", "Gehe mit Ironie und Nuancen um"]
    },
    diplomatic_crisis: {
        title: "Diplomatische Verhandlung",
        role: "Du bist ein hochrangiger Diplomat einer rivalisierenden Nation.",
        objectives: ["Drücke nationale Bedenken indirekt aus", "Schlage einen Kompromiss vor", "Wahre das Protokoll"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Deine Aufgabe: Setze die Geschichte in GENAU 1 kurzen Satz fort.
Schreibe nur die Geschichte. Keine Header oder Erklärungen.
KRITISCH: KEIN ENGLISCH VERWENDEN. Sprache: Deutsch.
Tonfall: Fröhlich und sehr einfach (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 Satz:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Einfacher Sprachlehrer. Korrigiere die Eingabe. Wenn sie korrekt ist, sage "Perfekt."<|im_end|>
<|im_start|>user
Original: ${userInput}
Korrektur:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Mache es einfacher (3-5 Wörter).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Vereinfacht:<|im_end|>
<|im_start|>assistant
`;
};
