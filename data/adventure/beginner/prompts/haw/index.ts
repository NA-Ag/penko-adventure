/**
 * HAW Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Kāu hana: E hoʻomau i ka moʻolelo ma hoʻokahi hopunaʻōlelo pōkole wale nō.
E kākau i ka moʻolelo wale nō. ʻAʻohe poʻo inoa a wehewehe paha.
KOʻIKOʻI: MAI HOʻOHANA I KA ʻŌLELO PELEKANE. ʻŌlelo: ʻŌlelo Hawaiʻi.
Kaila: Hauʻoli a maʻalahi loa (CEFR A1).

Sampla:
Moʻolelo i kēia manawa: Ke ua nei ma ke alanui.
Hana a ka mea pāʻani: Nānā au i koʻu puni.
Hopunaʻōlelo 1: ʻIke ʻoe i nā kukui neon e hōʻike ana i loko o nā pūnāwai.<|im_end|>
<|im_start|>user
Moʻolelo i kēia manawa: ${history}
${systemEvent ? `Hana ʻŌnaehana: ${systemEvent}` : ''}
Hana a ka mea pāʻani: ${action}
Hopunaʻōlelo 1:<|im_start|>assistant
`;
};

/**
 * HAW Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
He kumu aʻo ʻōlelo maʻalahi. E hoʻopololei i ka mea i kākau ʻia. Inā pololei, e ʻōlelo "Maikaʻi loa."<|im_end|>
<|im_start|>user
Kumu: ${userInput}
Hoʻopololei:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HAW Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
E hana i mea maʻalahi (3-5 mau huaʻōlelo).<|im_end|>
<|im_start|>user
Kumu: ${narrativeText}
Maʻalahi:<|im_end|>
<|im_start|>assistant
`;
};
