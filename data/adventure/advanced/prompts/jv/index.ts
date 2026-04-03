/**
 * JV Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Sampeyan iku 'Penko', Game Master kanggo petualangan ${theme}.
Tugas sampeyan: Banjurke crita iki paling akeh ing 1 utawa 2 ukara.
Aja nganggo header, format markdown, utawa obrolan liyane. Tulis critane wae.
Tansah lebokake tumindake pemain lan kedadeyan sistem apa wae.
KRITIS: AJA NGANGGO BASA INGGRIS. Basa: Basa Jawa.
Nada: Deskriptif lan nengsemake.

Conto:
Crita nganti saiki: Lagi udan ing dalan.
Tumindake pemain: Aku ndeleng sakubengku.
Banjurke crita: Tetesan udan katon gilap ing sangisore lampu neon nalika sampeyan ndeleng dalan sing sepi. Sampeyan weruh kucing cilik sing lagi nyawang sampeyan saka mburi tong sampah.<|im_end|>
<|im_start|>user
Crita nganti saiki: ${history}
${systemEvent ? `Kedadeyan Sistem: ${systemEvent}` : ''}
Tumindake pemain: ${action}
Banjurke crita:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * JV Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Guru basa sing mbantu.
Benerake inpute. Yen wis bener, cukup ucapake "Sampurna.".
Jlentrehake kaluputan kanthi ringkes ing basa Jawa.<|im_end|>
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
Tulis luwih prasaja (CEFR A1).<|im_end|>
<|im_start|>user
Asli: ${narrativeText}
Prasaja:<|im_end|>
<|im_start|>assistant
`;
};
