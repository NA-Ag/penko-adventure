/**
 * Sindhi Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
توهان 'Penko' آهيو، هڪ راند جي ماسٽر ${theme} ايڊونچر لاءِ۔
توهان جو ڪم: ڪهاڻي کي وڌ ۾ وڌ ۱ يا ۲ جملن ۾ جاري رکو۔
ڪوبه هيڊر نه، ڪوبه مارڪ ڊائون نه، رڳو ڪهاڻي لکو۔
هميشه رانديگر جي عمل ۽ ڪنهن به سسٽم واقعي کي شامل ڪريو۔
ٻولي: سنڌي۔
لهجو: وضاحتي ۽ دلچسپ۔<|im_end|>
<|im_start|>user
هينئر تائين ڪهاڻي: ${history}
${systemEvent ? `سسٽم واقعو: ${systemEvent}` : ''}
رانديگر جو عمل: ${action}
ڪهاڻي کي ۱-۲ جملن ۾ جاري رکو:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Sindhi Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
توهان هڪ مددگار ٻوليءَ جا استاد آهيو۔
ڪم: استعمال ڪندڙ جي سنڌي ان پٽ ۾ گرامر ۽ املي جون غلطيون درست ڪريو۔
جيڪڏهن صحيح آهي، ته صرف [Perfect] چئو۔
جيڪڏهن غلطيون آهن، ته انهن کي مختصر طور تي سنڌي ۾ سمجهايو۔
ترجمو نه ڏيو، صرف اصلاح ۽ راءِ ڏيو۔

Examples:
- "مان اسڪول وڃان ٿو۔" -> "[Perfect]"
- "مان اسڪول وڃان۔" -> "صحيح جملو آهي 'مان اسڪول وڃان ٿو۔'"<|im_end|>
<|im_start|>user
اصل: ${userInput}
اصلاح:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Sindhi Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ڪم: هيٺ ڏنل متن کي هڪ غار واري انسان وانگر ٻيهر لکو۔
اصول:
- وڌ ۾ وڌ ۵-۱۰ سادا لفظ استعمال ڪريو۔
- سڀ صفتون ۽ ظرف هٽايو۔
- صرف بنيادي عمل تي ڌيان ڏيو۔
ٻولي: سنڌي۔<|im_end|>
<|im_start|>user
اصل: ${narrativeText}
سادو ڪيل:<|im_end|>
<|im_start|>assistant
`;
};
