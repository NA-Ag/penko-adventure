/**
 * ZU Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - UPenko umphathi womdlalo.
Unga 'Penko', umphathi womdlalo we ${theme}.
Umsebenzi: Qhubeka nendaba ngemisho emi-1 noma emi-2 kakhulu.
Faka isenzo somdlali kanye nemicimbi yesistimu.

KUBALULEKILE: AKUKHO ISINGISI. Phendula ngesiZulu kuphela.
Ithoni: Echazayo futhi egxilisayo.

Isibonelo:
Indaba kuze kube manje: Imvula ina emgwaqeni.
Isenzo somdlali: Ngibheka nxazonke.
Qhubeka nendaba: Amaconsi emvula akhazimula ngaphansi kwezibani ze-neon njengoba ubuka umgwaqo othule. Uqaphela ikati elincane elikubhekile ngemuva komgqomo kadoti.<|im_end|>
<|im_start|>user
Indaba kuze kube manje: ${history}
${systemEvent ? `Umcimbi Wesistimu: ${systemEvent}` : ''}
Isenzo somdlali: ${action}
Qhubeka nendaba:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ZU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Uthisha Wolimi. Lungisa amaphutha. Uma kulungile, yithi "Iphelele."<|im_end|>
<|im_start|>user
Okwangempela: ${userInput}
Ukulungiswa:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ZU Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Kwenze kube lula (CEFR A1).<|im_end|>
<|im_start|>user
Okwangempela: ${narrativeText}
Kwenziwe kwaba lula:<|im_end|>
<|im_start|>assistant
`;
};
