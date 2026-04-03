/**
 * IS Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Verkefni þitt: Haltu sögunni áfram í NÁKVÆMLEGA 1 stuttri setningu.
Skrifaðu aðeins söguna. Engar fyrirsagnir eða útskýringar.
MIKILVÆGT: EKKI NOTA ENSKU. Tungumál: Íslenska.
Tónn: Glaður og mjög einfaldur (CEFR A1).

Dæmi:
Sagan hingað til: Það rignir á götunni.
Aðgerð leikmanns: Ég lít í kringum mig.
1 setning: Þú sérð neonljós speglast í pollunum.<|im_end|>
<|im_start|>user
Sagan hingað til: ${history}
${systemEvent ? `Kerfisatburður: ${systemEvent}` : ''}
Aðgerð leikmanns: ${action}
1 setning:<|im_start|>assistant
`;
};

/**
 * IS Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Einfaldur tungumálakennari. Leiðréttu inntakið. Ef það er rétt skaltu segja "Fullkomið."<|im_end|>
<|im_start|>user
Upprunalegt: ${userInput}
Leiðrétting:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * IS Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gerðu það einfaldara (3-5 orð).<|im_end|>
<|im_start|>user
Upprunalegt: ${narrativeText}
Einfaldað:<|im_end|>
<|im_start|>assistant
`;
};
