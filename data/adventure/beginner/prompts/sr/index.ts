/**
 * SR Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Vaš zadatak: Nastavite priču u TAČNO 1 kratkoj rečenici.
Pišite samo priču. Bez naslova ili objašnjenja.
Na kraju uključite [ROMANIZATION: phonetic sounds].
KRITIČNO: NE KORISTITE ENGLESKI JEZIK. Jezik: Srpski.
Ton: Veseta i veoma jednostavan (CEFR A1).

Primer:
Priča do sada: Na ulici pada kiša.
Akcija igrača: Gledam oko sebe.
1 rečenica: Vidite neonska svetla koja se ogledaju u barama. [ROMANIZATION: Vidite neonska svetla koja se ogledaju u barama.]<|im_end|>
<|im_start|>user
Priča do sada: ${history}
${systemEvent ? `Sistemski događaj: ${systemEvent}` : ''}
Akcija igrača: ${action}
1 rečenica:<|im_start|>assistant
`;
};

/**
 * SR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Jednostavni učitelj jezika. Ispravite unos. Ako je ispravan, recite "Savršeno."<|im_end|>
<|im_start|>user
Original: ${userInput}
Ispravka:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SR Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Učinite to jednostavnijim (3-5 reči).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Pojednostavljeno:<|im_end|>
<|im_start|>assistant
`;
};
