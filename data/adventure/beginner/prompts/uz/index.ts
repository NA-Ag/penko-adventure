/**
 * UZ Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Sizning vazifangiz: Hikoyani ROSTDA 1 ta qisqa jumlada davom ettiring.
Faqat hikoyaning o'zini yozing. Sarlavhalar yoki tushuntirishlar yo'q.
MUHIM: INGLIZ TILIDAN FOYDALANMANG. Til: O'zbek tili.
Ton: Quvnoq va juda oddiy (CEFR A1).

Misol:
Hozirgacha bo'lgan hikoya: Ko'chada yomg'ir yog'yapti.
O'yinchi harakati: Atrofimga qarayman.
1 jumla: Siz ko'lmaklarda aks etgan neon chiroqlarini ko'rasiz.<|im_end|>
<|im_start|>user
Hozirgacha bo'lgan hikoya: ${history}
${systemEvent ? `Tizim voqeasi: ${systemEvent}` : ''}
O'yinchi harakati: ${action}
1 jumla:<|im_start|>assistant
`;
};

/**
 * UZ Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Oddiy til o'qituvchisi. Kiritilgan matnni tuzating. Agar u to'g'ri bo'lsa, "Ajoyib" deb ayting.<|im_end|>
<|im_start|>user
Asl nusxa: ${userInput}
Tuzatish:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * UZ Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Uni soddaroq qiling (3-5 so'z).<|im_end|>
<|im_start|>user
Asl nusxa: ${narrativeText}
Soddalashtirilgan:<|im_end|>
<|im_start|>assistant
`;
};
