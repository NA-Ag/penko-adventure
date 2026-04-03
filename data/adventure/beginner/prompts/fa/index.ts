/**
 * FA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
وظیفه شما: داستان را دقیقاً در ۱ جمله کوتاه ادامه دهید.
فقط خود داستان را بنویسید. بدون عنوان یا توضیح.
در پایان، [ROMANIZATION: آوانگاری] را اضافه کنید.
حیاتی: از انگلیسی استفاده نکنید. زبان: فارسی.
لحن: شاد و بسیار ساده (CEFR A1).

مثال:
داستان تا اینجا: باران در خیابان می‌بارد.
کنش بازیکن: به اطراف نگاه می‌کنم.
۱ جمله: شما نورهای نئون را می‌بینید که در چاله‌های آب منعکس شده‌اند. [ROMANIZATION: shoma nor-haye neon ra mibinid ke dar chale-haye ab monakes shode-and.]<|im_end|>
<|im_start|>user
داستان تا اینجا: ${history}
${systemEvent ? `رویداد سیستم: ${systemEvent}` : ''}
کنش بازیکن: ${action}
۱ جمله:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * FA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
معلم زبان ساده. ورودی را اصلاح کنید. اگر درست است، بگویید "عالی."<|im_end|>
<|im_start|>user
اصلی: ${userInput}
اصلاح:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * FA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
آن را ساده‌تر کنید (۳-۵ کلمه).<|im_end|>
<|im_start|>user
اصلی: ${narrativeText}
ساده‌شده:<|im_end|>
<|im_start|>assistant
`;
};
