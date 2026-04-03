/**
 * HT Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Travay ou: Kontinye istwa a nan EGZAKTEMAN 1 fraz kout.
Ekri sèlman istwa a. Pa gen tit oswa esplikasyon.
KRITIK: PA SÈVI AK ANGLE. Lang: Kreyòl ayisyen.
Ton: Kè kontan ak trè senp (CEFR A1).

Egzanp:
Istwa jiska prezan: Lapli ap tonbe nan lari a.
Aksyon jwè: Mwen gade toutotou.
1 fraz: Ou wè limyè lumineuz reflete nan flak dlo yo.<|im_end|>
<|im_start|>user
Istwa jiska prezan: ${history}
${systemEvent ? `Evènman Sistèm: ${systemEvent}` : ''}
Aksyon jwè: ${action}
1 fraz:<|im_start|>assistant
`;
};

/**
 * HT Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Pwofesè lang senp. Koreksyon sa itilizatè a ekri. Si li kòrèk, di "Pafè."<|im_end|>
<|im_start|>user
Original: ${userInput}
Koreksyon:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HT Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Fè li pi senp (3-5 mo).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Senplifye:<|im_end|>
<|im_start|>assistant
`;
};
