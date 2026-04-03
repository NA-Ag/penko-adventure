/**
 * HR Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tvoj zadatak: Nastavi priču u TOČNO 1 kratkoj rečenici.
Piši samo priču. Bez zaglavlja ili objašnjenja.
KRITIČNO: NE KORISTI ENGLESKI. Jezik: Hrvatski.
Ton: Sretan i vrlo jednostavan (CEFR A1).

Primjer:
Dosadašnja priča: Kiša pada na ulici.
Akcija igrača: gledam oko sebe
1 rečenica: Vidiš neonska svjetla koja se ogledaju u lokvama.<|im_end|>
<|im_start|>user
Dosadašnja priča: ${history}
${systemEvent ? `Događaj sustava: ${systemEvent}` : ''}
Akcija igrača: ${action}
1 rečenica:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Jednostavan učitelj jezika. Ispravi unos. Ako je točan, reci "Savršeno."<|im_end|>
<|im_start|>user
Original: ${userInput}
Ispravak:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HR Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Učini jednostavnijim (3-5 riječi).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Pojednostavljeno:<|im_end|>
<|im_start|>assistant
`;
};
