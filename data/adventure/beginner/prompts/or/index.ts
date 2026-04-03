/**
 * OR Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
ଆପଣଙ୍କ କାର୍ଯ୍ୟ: କାହାଣୀକୁ ଠିକ୍ ୧ଟି ଛୋଟ ବାକ୍ୟରେ ଜାରି ରଖନ୍ତୁ।
କେବଳ କାହାଣୀ ହିଁ ଲେଖନ୍ତୁ। କୌଣସି ହେଡର୍ କିମ୍ବା ବ୍ୟାଖ୍ୟା ନାହିଁ।
ଶେଷରେ [ROMANIZATION: phonetic sounds] ଅନ୍ତର୍ଭୁକ୍ତ କରନ୍ତୁ।
ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ: ଇଂରାଜୀ ବ୍ୟବହାର କରନ୍ତୁ ନାହିଁ। ଭାଷା: ଓଡ଼ିଆ।
ସ୍ୱର: ଆନନ୍ଦଦାୟକ ଏବଂ ଅତି ସରଳ (CEFR A1)।

ଉଦାହରଣ:
ଏପର୍ଯ୍ୟନ୍ତ କାହାଣୀ: ରାସ୍ତାରେ ବର୍ଷା ହେଉଛି।
ଖେଳାଳିଙ୍କ କାର୍ଯ୍ୟ: ମୁଁ ଚାରିଆଡ଼କୁ ଚାହୁଁଛି।
୧ଟି ବାକ୍ୟ: ଆପଣ ପାଣି ଜମିଥିବା ସ୍ଥାନରେ ନିଅନ୍ ଲାଇଟ୍ ପ୍ରତିଫଳିତ ହେଉଥିବା ଦେଖୁଛନ୍ତି। [ROMANIZATION: apana pani jamithiba sthanare neon light pratiphalita heuthiba dekhuchanti.]<|im_end|>
<|im_start|>user
ଏପର୍ଯ୍ୟନ୍ତ କାହାණୀ: ${history}
${systemEvent ? `ସିଷ୍ଟମ୍ ଇଭେଣ୍ଟ: ${systemEvent}` : ''}
ଖେଳାଳିଙ୍କ କାର୍ଯ୍ୟ: ${action}
୧ଟି ବାକ୍ୟ:<|im_start|>assistant
`;
};

/**
 * OR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ସରଳ ଭାଷା ଶିକ୍ଷକ। ଇନପୁଟ୍ ସଂଶୋଧନ କରନ୍ତୁ। ଯଦି ଏହା ସଠିକ୍ ଅଛି, ତେବେ "ଉତ୍କୃଷ୍ଟ" କୁହନ୍ତୁ।<|im_end|>
<|im_start|>user
ମୂଳ: ${userInput}
ସଂଶୋଧନ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * OR Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ଏହାକୁ ଅଧିକ ସରଳ କରନ୍ତୁ (୩-୫ ଶବ୍ଦ)।<|im_end|>
<|im_start|>user
ମୂଳ: ${narrativeText}
ସରଳୀକୃତ:<|im_end|>
<|im_start|>assistant
`;
};
