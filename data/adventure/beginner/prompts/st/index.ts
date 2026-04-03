/**
 * ST Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Mosebetsi oa hao: Tsoela pele ka pale ka polelo e le 1 e khutšoanyane hantle.
Ngola pale feela. Ntle le lihlooho kapa litlhaloso.
BOHLOA: U SE KE UA SEBELISA SENYESEMANE. Puo: Sesotho.
Molumo: O thabileng le o bonolo haholo (CEFR A1).

Mohlala:
Pale ho fihlela joale: Pula e na seterateng.
Ketso ea sebapali: ke qamaka hohle.
Polelo e le 1: U bona mabone a neon a bonahala makhakhapeng a metsi.<|im_end|>
<|im_start|>user
Pale ho fihlela joale: ${history}
${systemEvent ? `Ketsahalo ea sisitimi: ${systemEvent}` : ''}
Ketso ea sebapali: ${action}
Polelo e le 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ST Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mokoetlisi oa puo ea bonolo. Lokisa lintlha. Haeba ho nepahetse, re "Ho lokile haholo."<|im_end|>
<|im_start|>user
Sefeane: ${userInput}
Tokiso:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ST Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
E etse hore e be bonolo (mantsoe a 3-5).<|im_end|>
<|im_start|>user
Sefeane: ${narrativeText}
Tlhaloso e bonolo:<|im_end|>
<|im_start|>assistant
`;
};
