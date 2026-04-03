/**
 * MS Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tugas anda: Teruskan cerita dalam TEPAT 1 ayat pendek.
Tulis cerita itu sahaja. Tiada pengepala atau penjelasan.
KRITIKAL: JANGAN GUNAKAN BAHASA INGGRIS. Bahasa: Bahasa Melayu.
Nada: Ceria dan sangat mudah (CEFR A1).

Contoh:
Cerita setakat ini: Hujan turun di jalanan.
Tindakan pemain: Saya melihat sekeliling.
1 ayat: Anda melihat lampu neon terpantul di lopak air.<|im_end|>
<|im_start|>user
Cerita setakat ini: ${history}
${systemEvent ? `Peristiwa Sistem: ${systemEvent}` : ''}
Tindakan pemain: ${action}
1 ayat:<|im_start|>assistant
`;
};

/**
 * MS Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor bahasa mudah. Betulkan input. Jika ia betul, katakan "Sempurna."<|im_end|>
<|im_start|>user
Asal: ${userInput}
Pembetulan:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MS Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Jadikan ia lebih mudah (3-5 perkataan).<|im_end|>
<|im_start|>user
Asal: ${narrativeText}
Mudah:<|im_end|>
<|im_start|>assistant
`;
};
