import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Zamawianie w kawiarni",
        role: "Jesteś baristą w zatłoczonej kawiarni.",
        objectives: ["Przywitaj się z baristą", "Zamów napój", "Zamów jedzenie", "Poproś o rachunek"]
    },
    directions: {
        title: "Pytanie o drogę",
        role: "Jesteś pomocnym mieszkańcem na ulicy.",
        objectives: ["Uprzejmie przeproś", "Zapytaj, gdzie jest stacja kolejowa", "Podziękuj mieszkańcowi"]
    },
    doctor_visit: {
        title: "U lekarza",
        role: "Jesteś lekarzem. Użytkownik jest pacjentem.",
        objectives: ["Opisz dwa objawy", "Zrozum poradę lekarza", "Zapytaj o leki"]
    },
    shopping_clothes: {
        title: "Kupowanie ubrań",
        role: "Jesteś sprzedawcą w sklepie.",
        objectives: ["Zapytaj o konkretny przedmiot", "Omów rozmiary", "Zapytaj o cenę"]
    },
    job_interview: {
        title: "Rozmowa o pracę",
        role: "Jesteś menedżerem ds. rekrutacji, który przeprowadza rozmowę z użytkownikiem w sprawie pracy w handlu detalicznym.",
        objectives: ["Przedstaw się profesjonalnie", "Opisz dotychczasowe doświadczenie", "Zadaj pytanie dotyczące stanowiska"]
    },
    meeting_friend: {
        title: "Spotkanie z nowym przyjacielem",
        role: "Jesteś studentem w parku.",
        objectives: ["Podaj swoje imię i pochodzenie", "Zapytaj drugą osobę o imię", "Pożegnaj się uprzejmie"]
    },
    planning_picnic: {
        title: "Planowanie pikniku",
        role: "Jesteś przyjacielem użytkownika.",
        objectives: ["Sprawdź pogodę", "Zaproponuj godzinę spotkania", "Zdecyduj, jakie jedzenie przynieść"]
    },
    new_coworker: {
        title: "Nowy współpracownik",
        role: "Jesteś nowym pracownikiem w swoim pierwszym dniu.",
        objectives: ["Opisz środowisko biurowe", "Wyjaśnij codzienne zadania", "Daj przydatną wskazówkę"]
    },
    bank_account: {
        title: "Otwieranie konta bankowego",
        role: "Jesteś urzędnikiem bankowym w Warszawie.",
        objectives: ["Wyjaśnij powód wizyty", "Zapytaj o dokumenty", "Zapytaj o funkcje bankowości mobilnej"]
    },
    environmental_meeting: {
        title: "Spotkanie społeczności ekologicznej",
        role: "Jesteś organizatorem społeczności.",
        objectives: ["Przedstaw argument za konkretną polityką", "Odpowiedz na obawy dotyczące kosztów", "Podsumuj złożony punkt widzenia"]
    },
    tradition_vs_modernity: {
        title: "Tradycja kontra nowoczesność",
        role: "Jesteś modernistą, który wierzy, że tradycje utrudniają postęp.",
        objectives: ["Porównaj wartości historyczne i nowoczesne", "Używaj zaawansowanych idiomów", "Przeanalizuj tożsamość kulturową"]
    },
    travel_complaint: {
        title: "Reklamacja podróży",
        role: "Jesteś agentem linii lotniczych na lotnisku.",
        objectives: ["Wyjaśnij problem", "Poproś o zwrot pieniędzy lub zmianę rezerwacji", "Zapytaj o hotel"]
    },
    apartment_dispute: {
        title: "Spór o mieszkanie",
        role: "Jesteś właścicielem mieszkania, który niechętnie płaci za naprawy.",
        objectives: ["Opisz uszkodzenie", "Uargumentuj, dlaczego jest to odpowiedzialność właściciela", "Ustal datę naprawy"]
    },
    cultural_debate: {

        title: "Debata o mediach społecznościowych",
        role: "Jesteś przyjacielem, który jest sceptyczny wobec technologii.",
        objectives: ["Wyraź opinię", "Podaj dwa powody wspierające", "Odpowiedz na kontrargument"]
    },
    legal_consultation: {
        title: "Konsultacja prawna",
        role: "Jesteś prawnikiem specjalizującym się w własności intelektualnej.",
        objectives: ["Wyjaśnij naruszenie umowy", "Zapytaj o środki prawne", "Omów możliwe wyniki"]
    },
    academic_seminar: {
        title: "Seminarium akademickie",
        role: "Jesteś profesorem uniwersyteckim.",
        objectives: ["Podsumuj swoje stanowisko", "Przytocz hipotetyczne dowody", "Odpowiedz na krytyczną uwagę"]
    },
    philosophical_debate: {
        title: "Etyka SI",
        role: "Jesteś znanym filozofem.",
        objectives: ["Zdefiniuj złożone pojęcie abstrakcyjne", "Użyj wyrafinowanych metafor", "Radź sobie z ironią i niuansami"]
    },
    diplomatic_crisis: {
        title: "Negocjacje dyplomatyczne",
        role: "Jesteś wysokim rangą dyplomatą z konkurencyjnego kraju.",
        objectives: ["Wyraź obawy narodowe pośrednio", "Zaproponuj złożony kompromis", "Zachowaj ścisły protokół formalny"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Twoje zadanie: Kontynuuj opowieść w maksymalnie 1 lub 2 zdaniach.
Nie używaj nagłówków, formatowania markdown ani zbędnych rozmów. Pisz tylko samą historię.
Zawsze uwzględniaj działanie gracza i wszelkie zdarzenia systemowe.
KRYTYCZNE: NIE UŻYWAJ JĘZYKA ANGIELSKIEGO. Język: Polski.
Ton: Opisowy i wciągający.
Przykład:
Historia do tej pory: Na ulicy pada deszcz.
Akcja gracza: Rozglądam się wokół.
Popraw wpis. Jeśli jest poprawny, powiedz tylko „Doskonale.”.
<|im_start|>user
Oryginał: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Kontynuuj opowieść:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Pomocny nauczyciel języka.
Popraw wpis. Jeśli jest poprawny, powiedz tylko „Doskonale.”.
Wyjaśnij błędy krótko w języku polskim.<|im_end|>
<|im_start|>user
Oryginał: ${userInput}
Poprawka:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Pisz prościej (CEFR A1).<|im_end|>
<|im_start|>user
Oryginał: ${narrativeText}
Uproszczone:<|im_end|>
<|im_start|>assistant
`;
};
