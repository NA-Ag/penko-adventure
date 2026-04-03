/**
 * AZ Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tapşırığınız: Hekayəni DƏQİQ 1 qısa cümlə ilə davam etdirin.
Yalnız hekayəni yazın. Başlıqlar və ya izahatlar yoxdur.
VACİB: İNGİLİS DİLİNDƏN İSTİFADƏ ETMƏYİN. Dil: Azərbaycan dili.
Ton: Şən və çox sadə (CEFR A1).

Misal:
İndiyə qədərki hekayə: Küçəyə yağış yağır.
Oyunçu hərəkəti: Ətrafa baxıram.
1 cümlə: Gölməçələrdə əks olunan neon işıqlarını görürsünüz.<|im_end|>
<|im_start|>user
İndiyə qədərki hekayə: ${history}
${systemEvent ? `Sistem hadisəsi: ${systemEvent}` : ''}
Oyunçu hərəkəti: ${action}
1 cümlə:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AZ Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Sadə dil müəllimi. Girişi düzəldin. Əgər doğrudursa, "Mükəmməl" deyin.<|im_end|>
<|im_start|>user
Orijinal: ${userInput}
Düzəliş:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AZ Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Daha sadə edin (3-5 söz).<|im_end|>
<|im_start|>user
Orijinal: ${narrativeText}
Sadələşdirilmiş:<|im_end|>
<|im_start|>assistant
`;
};
