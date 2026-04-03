/**
 * ID Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tugas Anda: Lanjutkan cerita dalam TEPAT 1 kalimat pendek.
Tulis ceritanya saja. Tidak ada tajuk atau penjelasan.
KRITIS: JANGAN GUNAKAN BAHASA INGGRIS. Bahasa: Bahasa Indonesia.
Nada: Ceria dan sangat sederhana (CEFR A1).

Contoh:
Cerita sejauh ini: Hujan turun di jalanan.
Tindakan pemain: Saya melihat sekeliling.
1 kalimat: Anda melihat lampu neon terpantul di genangan air.<|im_end|>
<|im_start|>user
Cerita sejauh ini: ${history}
${systemEvent ? `Peristiwa Sistem: ${systemEvent}` : ''}
Tindakan pemain: ${action}
1 kalimat:<|im_start|>assistant
`;
};

/**
 * ID Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor bahasa sederhana. Perbaiki input. Jika sudah benar, katakan "Sempurna."<|im_end|>
<|im_start|>user
Asli: ${userInput}
Koreksi:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ID Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Buat lebih sederhana (3-5 kata).<|im_end|>
<|im_start|>user
Asli: ${narrativeText}
Disederhanakan:<|im_end|>
<|im_start|>assistant
`;
};
