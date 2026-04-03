/**
 * SD Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
توهان جو ڪم: ڪهاڻي کي بلڪل ۱ ننڍي جملي ۾ جاري رکو.
صرف ڪهاڻي لکو. ڪو به هيڊر يا وضاحت نه.
آخر ۾ [ROMANIZATION: phonetic sounds] شامل ڪريو.
اهم: انگريزي استعمال نه ڪريو. ٻولي: سنڌي.
ٽون: خوش ۽ تمام سادو (CEFR A1).

مثال:
ڪهاڻي هينئر تائين: روڊ تي مينهن پئجي رهيو آهي.
رانديگر جو عمل: مان پنهنجي چوڌاري ڏسان ٿو.
۱ جملو: توهان دٻن ۾ نيون لائيٽن جو عڪس ڏسو ٿا. [ROMANIZATION: tuhan dabban mein neon lightan jo aks dhaso tha.]<|im_end|>
<|im_start|>user
ڪهاڻي هينئر تائين: ${history}
${systemEvent ? `سسٽم واقعو: ${systemEvent}` : ''}
رانديگر جو عمل: ${action}
۱ جملو:<|im_start|>assistant
`;
};

/**
 * SD Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
سادي ٻولي استاد. ان پٽ کي درست ڪريو. جيڪڏهن اهو صحيح آهي، چئو "بهترين."<|im_end|>
<|im_start|>user
اصل: ${userInput}
درستي:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SD Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ان کي وڌيڪ سادو ڪريو (۳-۵ لفظ).<|im_end|>
<|im_start|>user
اصل: ${narrativeText}
سادو روپ:<|im_end|>
<|im_start|>assistant
`;
};
