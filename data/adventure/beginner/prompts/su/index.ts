/**
 * SU Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tugas anjeun: Nuluykeun carita dina PAS 1 kalimah pondok.
Tulis caritana wungkul. Teu aya lulugu atanapi guaran.
KRITIS: ULAH NGAGUNAKEUN BASA INGGRIS. Basa: Sunda.
Nada: Bingah sareng saderhana pisan (CEFR A1).

Conto:
Carita dugi ka ayeuna: Hujan ragrag di jalan.
Lampah pamaén: abdi ningal sakurilingeun.
1 kalimah: Anjeun ningali lampu neon katingal dina kulah cai.<|im_end|>
<|im_start|>user
Carita dugi ka ayeuna: ${history}
${systemEvent ? `Kajadian sistem: ${systemEvent}` : ''}
Lampah pamaén: ${action}
1 kalimah:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor basa saderhana. Benerkeun inputna. Upami leres, ucapkeun "Sampurna."<|im_end|>
<|im_start|>user
Asli: ${userInput}
Benerake:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SU Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Jantenkeun langkung saderhana (3-5 kecap).<|im_end|>
<|im_start|>user
Asli: ${narrativeText}
Basajan:<|im_end|>
<|im_start|>assistant
`;
};
