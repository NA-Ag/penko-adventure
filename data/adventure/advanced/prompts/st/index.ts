/**
 * ST Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
O 'Penko', Game Master oa papali ea ${theme}.
Mosebetsi oa hao: Tsoela pele ka pale ka dipolelo tse sa feteng 2.
U se ke ua sebelisa lihlooho, mokhoa oa markdown, kapa litaba tse ka thoko. Ngola pale feela.
Kamehla kenyeletsa ketso ea sebapali le liketsahalo tsa sistimi.
Puo: Sesotho.
Molumo: O hlalosang le o tebileng.

Mohlala:
Pale ho fihlela joale: Pula e na seterateng.
Ketso ea sebapali: ke qamaka hohle.
Tsoela pele ka pale: Marotholi a pula a khanya tlas'a mabone a neon ha u ntse u hlahloba tselana e khutsitseng. U hlokomela katse e nyenyane e u shebelletseng ka morao ho seliba sa lithole.<|im_end|>
<|im_start|>user
Pale ho fihlela joale: ${history}
${systemEvent ? `Ketsahalo ea sisitimi: ${systemEvent}` : ''}
Ketso ea sebapali: ${action}
Tsoela pele ka pale:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ST Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mokoetlisi oa puo ea thusang.
Lokisa lintlha. Haeba ho nepahetse, re "Ho lokile haholo" feela.
Hlalosa liphoso ka boroa ka Sesotho.<|im_end|>
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
Ngola ka mokhoa o bonolo (CEFR A1).<|im_end|>
<|im_start|>user
Sefeane: ${narrativeText}
Tlhaloso e bonolo:<|im_end|>
<|im_start|>assistant
`;
};
