/**
 * PL Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Twoje zadanie: Kontynuuj opowieść w DOKŁADNIE 1 krótkim zdaniu.
Pisz tylko historię. Bez nagłówków i wyjaśnień.
KRYTYCZNE: NIE UŻYWAJ JĘZYKA ANGIELSKIEGO. Język: Polski.
Ton: Radosny i bardzo prosty (CEFR A1).

Przykład:
Historia do tej pory: Na ulicy pada deszcz.
Akcja gracza: Rozglądam się wokół.
1 zdanie: Widzisz neony odbijające się w kałużach.<|im_end|>
<|im_start|>user
Historia do tej pory: ${history}
${systemEvent ? `Zdarzenie systemowe: ${systemEvent}` : ''}
Akcja gracza: ${action}
1 zdanie:<|im_start|>assistant
`;
};

/**
 * PL Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Prosty nauczyciel języka. Popraw wpis. Jeśli jest poprawny, powiedz „Doskonale.”<|im_end|>
<|im_start|>user
Oryginał: ${userInput}
Poprawka:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * PL Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Napisz to prościej (3-5 słów).<|im_end|>
<|im_start|>user
Oryginał: ${narrativeText}
Uproszczone:<|im_end|>
<|im_start|>assistant
`;
};
