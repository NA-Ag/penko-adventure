/**
 * ZU Beginner Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - UPenko umphathi womdlalo.
Unga 'Penko', umphathi womdlalo we ${theme}.
Umsebenzi: Qhubeka nendaba ngomusho owu-1 omfishane ngqo.
Azikho izihloko, akukho markdown, akukho ngxoxo.

KUBALULEKILE: AKUKHO ISINGISI. Phendula ngesiZulu kuphela.
Ithoni: Ejabulayo futhi elula kakhulu (CEFR A1).

Isibonelo:
Indaba kuze kube manje: Imvula ina emgwaqeni.
Isenzo somdlali: Ngibheka nxazonke.
Umusho owu-1: Ubona izibani ze-neon zikhanya emachibini amanzi.<|im_end|>
<|im_start|>user
Indaba kuze kube manje: ${history}
${systemEvent ? `Umcimbi Wesistimu: ${systemEvent}` : ''}
Isenzo somdlali: ${action}
Umusho owu-1:<|im_end|>
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
