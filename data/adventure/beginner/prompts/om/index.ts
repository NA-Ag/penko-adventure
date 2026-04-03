/**
 * OM Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Hojiin kee: Seenicha hima gabaabaa 1 qofaan itti fufi.
Seenicha qofa barreessi. Mata-duree ykn ibsa hin barbaachisu.
MURTEESSAA: INGLIFFFA HIN FAYYADAMIN. Afaan: Afaan Oromoo.
Haala: Gammachuu fi baay'ee salphaa (CEFR A1).

Misala:
Seenicha hanga ammaatti: Daandii irratti bokkaan roobaa jira.
Gocha taphataa: Naannoo koo nan ilaala.
Hima 1: Ibsaa neeyon calaqqisa bishaan keessatti argita.<|im_end|>
<|im_start|>user
Seenicha hanga ammaatti: ${history}
${systemEvent ? `Mudannoo Sirnaa: ${systemEvent}` : ''}
Gocha taphataa: ${action}
Hima 1:<|im_start|>assistant
`;
};

/**
 * OM Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Barsiisaa afaanii salphaa. Galfata sirreessi. Yoo sirrii ta'e, "Gaarii dha" jedhi.<|im_end|>
<|im_start|>user
Kan jalqabaa: ${userInput}
Sirreeffama:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * OM Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Salphaa godhi (jechoota 3-5).<|im_end|>
<|im_start|>user
Kan jalqabaa: ${narrativeText}
Salphaa:<|im_end|>
<|im_start|>assistant
`;
};
