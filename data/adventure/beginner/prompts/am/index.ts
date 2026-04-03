/**
 * AM Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
የእርስዎ ተግባር፡ ታሪኩን በትክክል በ1 አጭር ዓረፍተ ነገር ይቀጥሉ።
ታሪኩን ብቻ ፃፍ። ምንም ራስጌዎች ወይም ማብራሪያዎች የሉም።
በስተመጨረሻ [ROMANIZATION: phonetic sounds] ያካትቱ።
ወሳኝ፡ እንግሊዝኛ የለም። ቋንቋ፡ አማርኛ።
ድምጽ፡ ደስተኛ እና በጣም ቀላል (CEFR A1)።

ምሳሌ፡
እስካሁን ያለው ታሪክ፡ በመንገዱ ላይ ዝናብ እየዘነበ ነው።
የተጫዋች ድርጊት፡ ዙሪያዬን እመለከታለሁ።
1 ዓረፍተ ነገር፡ በውሃ ገንዳዎች ውስጥ የኒዮን መብራቶች ሲንፀባረቁ ታያለህ። [ROMANIZATION: be-wuha gende-woch-u-wisit ye-neon mebratoch si-nin-tseba-re-ku taya-leh.]<|im_end|>
<|im_start|>user
እስካሁን ያለው ታሪክ፡ ${history}
${systemEvent ? `የስርዓት ክስተት፡ ${systemEvent}` : ''}
የተጫዋች ድርጊት፡ ${action}
1 ዓረፍተ ነገር፡<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AM Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ቀላል የቋንቋ አስተማሪ። ግቤቱን ያስተካክሉ። ትክክል ከሆነ "ፍጹም" ይበሉ።<|im_end|>
<|im_start|>user
ኦሪጅናል፡ ${userInput}
እርማት፡<|im_end|>
<|im_start|>assistant
`;
};

/**
 * AM Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ቀለል ያድርጉት (3-5 ቃላት)።<|im_end|>
<|im_start|>user
ኦሪጅናል፡ ${narrativeText}
ቀላል፡<|im_end|>
<|im_start|>assistant
`;
};
