/**
 * MN Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Таны даалгавар: Түүхийг ЯГ 1 богино өгүүлбэрээр үргэлжлүүлнэ үү.
Зөвхөн түүхийг бичээрэй. Гарчиг эсвэл тайлбар байхгүй.
Төгсгөлд нь [ROMANIZATION: phonetic sounds] оруулаарай.
ЧУХАЛ: АНГЛИ ХЭЛ БҮҮ АШИГЛА. Хэл: Монгол хэл.
Тон: Баяртай бөгөөд маш энгийн (CEFR A1).

Жишээ:
Одоогийн түүх: Гудамжинд бороо орж байна.
Тоглогчийн үйлдэл: Би эргэн тойрноо харна.
1 өгүүлбэр: Та шалбаагт туссан неон гэрлийг харж байна. [ROMANIZATION: Ta shalbaagt tussan neon gerliig harj baina.]<|im_end|>
<|im_start|>user
Одоогийн түүх: ${history}
${systemEvent ? `Системийн үйл явдал: ${systemEvent}` : ''}
Тоглогчийн үйлдэл: ${action}
1 өгүүлбэр:<|im_start|>assistant
`;
};

/**
 * MN Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Энгийн хэлний багш. Оролтыг засна уу. Хэрэв зөв бол "Төгс" гэж хэлээрэй.<|im_end|>
<|im_start|>user
Эх хувь: ${userInput}
Засвар:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MN Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Үүнийг илүү хялбар болго (3-5 үг).<|im_end|>
<|im_start|>user
Эх хувь: ${narrativeText}
Хялбаршуулсан:<|im_end|>
<|im_start|>assistant
`;
};
