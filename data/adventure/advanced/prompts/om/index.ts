/**
 * OM Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Ati 'Penko', ajajaa tapha diimmaa ${theme} ti.
Hojiin kee: Seenicha yoo baay'ate hima 1 ykn 2n itti fufi.
Mata-duree, bifa markdown ykn dubbii tarree hin fayyadamin. Seenicha qofa barreessi.
Yeroo hunda gocha taphataa fi mudannoo sirnaa kamiyyuu dabaladhu.
MURTEESSAA: INGLIFFFA HIN FAYYADAMIN. Afaan: Afaan Oromoo.
Haala: Ibsaa fi hawwataa.<|im_end|>
<|im_start|>user
Seenicha hanga ammaatti: Daandii irratti bokkaan roobaa jira.
Gocha taphataa: Naannoo koo nan ilaala.
Seenicha itti fufi: Utuu ati karaa cal'isaa sana sakatta'uun bokkaan ibsaa neeyon jalaatti calaqqisa. Adurree xiqqoo tokko kan qodaa kosiitti gadi dhufe si ilaalu hubatta.<|im_end|>
<|im_start|>user
Seenicha hanga ammaatti: ${history}
${systemEvent ? `Mudannoo Sirnaa: ${systemEvent}` : ''}
Gocha taphataa: ${action}
Seenicha itti fufi:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * OM Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Barsiisaa afaanii gargaaraa.
Galfata sirreessi. Yoo sirrii ta'e, "Gaarii dha" qofa jedhi.
Dogoggora Afaan Oromootiin gabaabsanii ibsi.<|im_end|>
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
Salphaatti barreessi (CEFR A1).<|im_end|>
<|im_start|>user
Kan jalqabaa: ${narrativeText}
Salphaa:<|im_end|>
<|im_start|>assistant
`;
};
