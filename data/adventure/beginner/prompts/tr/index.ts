/**
 * TR Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Göreviniz: Hikayeyi TAM OLARAK 1 kısa cümleyle devam ettirin.
Sadece hikayeyi yazın. Başlık veya açıklama yok.
KRİTİK: İNGİLİZCE KULLANMAYIN. Dil: Türkçe.
Ton: Neşeli ve çok basit (CEFR A1).

Örnek:
Şimdiye kadarki hikaye: Sokakta yağmur yağıyor.
Oyuncu eylemi: Etrafıma bakıyorum.
1 cümle: Su birikintilerinde yansıyan neon ışıklarını görüyorsunuz.<|im_end|>
<|im_start|>user
Şimdiye kadarki hikaye: ${history}
${systemEvent ? `Sistem Olayı: ${systemEvent}` : ''}
Oyuncu eylemi: ${action}
1 cümle:<|im_start|>assistant
`;
};

/**
 * TR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Basit dil öğretmeni. Girişi düzeltin. Eğer doğruysa, "Mükemmel" deyin.<|im_end|>
<|im_start|>user
Orijinal: ${userInput}
Düzeltme:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TR Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Daha basit hale getirin (3-5 kelime).<|im_end|>
<|im_start|>user
Orijinal: ${narrativeText}
Basitleştirilmiş:<|im_end|>
<|im_start|>assistant
`;
};
