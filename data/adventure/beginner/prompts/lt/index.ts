/**
 * LT Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Jūsų užduotis: Tęskite istoriją TIKSLIAI 1 trumpu sakiniu.
Rašykite tik istoriją. Be jokių antraščių ar paaiškinimų.
SVARBU: NEVARTOKITE ANGLŲ KALBOS. Kalba: Lietuvių.
Tonų: Linksmas ir labai paprastas (CEFR A1).

Pavyzdys:
Istorija iki šiol: Gatvėje lyja.
Žaidėjo veiksmas: apsižvalgau.
1 sakinys: Matai balose atsispindinčias neono šviesas.<|im_end|>
<|im_start|>user
Istorija iki šiol: ${history}
${systemEvent ? `Sistemos įvykis: ${systemEvent}` : ''}
Žaidėjo veiksmas: ${action}
1 sakinys:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LT Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Paprastas kalbų mokytojas. Ištaisykite įvestį. Jei teisinga, sakykite "Puiku."<|im_end|>
<|im_start|>user
Originalas: ${userInput}
Pataisymas:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LT Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Padarykite paprasčiau (3-5 žodžiai).<|im_end|>
<|im_start|>user
Originalas: ${narrativeText}
Supaprastinta:<|im_end|>
<|im_start|>assistant
`;
};
