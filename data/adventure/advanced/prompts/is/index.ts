/**
 * IS Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Þú ert 'Penko', leikstjórnandi fyrir ${theme} ævintýri.
Verkefni þitt: Haltu sögunni áfram í að hámarki 1 eða 2 setningum.
Ekki nota fyrirsagnir, markdown-snið eða auka spjall. Skrifaðu aðeins söguna sjálfa.
Láttu alltaf aðgerð leikmannsins og alla kerfisatburði fylgja með.
MIKILVÆGT: EKKI NOTA ENSKU. Tungumál: Íslenska.
Tónn: Lýsandi og grípandi.

Dæmi:
Sagan hingað til: Það rignir á götunni.
Aðgerð leikmanns: Ég lít í kringum mig.
Haltu sögunni áfram: Regndroparnir glitra undir neonljósunum á meðan þú virðir fyrir þér hljóðláta húsasundið. Þú tekur eftir litlum ketti sem fylgist með þér aftan úr ruslatunnu.<|im_end|>
<|im_start|>user
Sagan hingað til: ${history}
${systemEvent ? `Kerfisatburður: ${systemEvent}` : ''}
Aðgerð leikmanns: ${action}
Haltu sögunni áfram:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * IS Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Hjálpsamur tungumálakennari.
LeiRéttu inntakið. Ef það er rétt skaltu aðeins segja "Fullkomið.".
Útskýrðu villur stuttlega á íslensku.<|im_end|>
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
Skrifaðu einfaldar (CEFR A1).<|im_end|>
<|im_start|>user
Upprunalegt: ${narrativeText}
Einfaldað:<|im_end|>
<|im_start|>assistant
`;
};
