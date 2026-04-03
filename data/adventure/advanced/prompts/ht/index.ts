/**
 * HT Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Ou se 'Penko', Mèt Jwèt pou yon avanti ${theme}.
Travay ou: Kontinye istwa a nan 1 oswa 2 fraz maksimòm.
Pa sèvi ak tèt tit, fòma markdown oswa diskisyon initil. Ekri sèlman istwa a li menm.
Toujou mete aksyon jwè a ak nenpòt evènman sistèm.
KRITIK: PA SÈVI AK ANGLE. Lang: Kreyòl ayisyen.
Ton: Deskriptif ak Immersion.<|im_end|>
<|im_start|>user
Istwa jiska prezan: ${history}
${systemEvent ? `Evènman Sistèm: ${systemEvent}` : ''}
Aksyon jwè: ${action}
Kontinye istwa a:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HT Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Pwofesè lang ki itil.
Koreksyon sa itilizatè a ekri. Si li kòrèk, di sèlman "Pafè.".
Esplike erè yo yon ti tan nan lang kreyòl ayisyen.<|im_end|>
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
Ekri pi senp (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Senplifye:<|im_end|>
<|im_start|>assistant
`;
};
