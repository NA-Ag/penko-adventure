/**
 * JV Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tugas sampeyan: Banjurke crita iki ing TEPAT 1 ukara cendhak.
Tulis critane wae. Ora ana header utawa katrangan.
KRITIS: AJA NGANGGO BASA INGGRIS. Basa: Basa Jawa.
Nada: Senang lan prasaja banget (CEFR A1).

Conto:
Crita nganti saiki: Lagi udan ing dalan.
Tumindake pemain: Aku ndeleng sakubengku.
1 ukara: Sampeyan ndeleng lampu neon mantul ing banyu.<|im_end|>
<|im_start|>user
Crita nganti saiki: ${history}
${systemEvent ? `Kedadeyan Sistem: ${systemEvent}` : ''}
Tumindake pemain: ${action}
1 ukara:<|im_start|>assistant
`;
};

/**
 * JV Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Guru basa sing prasaja. Benerake inpute. Yen wis bener, ucapake "Sampurna."<|im_end|>
<|im_start|>user
Asli: ${userInput}
Benerake:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * JV Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Dadekne luwih prasaja (3-5 tembung).<|im_end|>
<|im_start|>user
Asli: ${narrativeText}
Prasaja:<|im_end|>
<|im_start|>assistant
`;
};
