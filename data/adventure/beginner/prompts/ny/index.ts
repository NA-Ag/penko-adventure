/**
 * NY Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Ntchito yanu: Pitirizani nkhaniyo mu chiganizo 1 chachidule ndendende.
Lembani nkhani yokha. Palibe mitu kapena mafotokozedwe.
LOFUNIKA: MUSAGWIRITSE NTCHITO CHINGEREZI. Chilankhulo: Chichewa.
Mawonekedwe: Osangalala komanso osavuta (CEFR A1).

Chitsanzo:
Nkhani mpaka pano: Mvula ikugwa mumsewu.
Zochita za wosewera:ndimayang'ana paliponse.
Chiganizo 1: Mukuwona magetsi a neon akuwala m'madzi apansi.<|im_end|>
<|im_start|>user
Nkhani mpaka pano: ${history}
${systemEvent ? `Chochitika cha sisitimu: ${systemEvent}` : ''}
Zochita za wosewera: ${action}
Chiganizo 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NY Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mlangizi wosavuta wa chilankhulo. Konzani zolakwikazo. Ngati kuli koyenera, nenani kuti "Zabwino kwambiri."<|im_end|>
<|im_start|>user
Choyambirira: ${userInput}
Kukonza:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * NY Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Pangani kukhala kosavuta (mawu 3-5).<|im_end|>
<|im_start|>user
Choyambirira: ${narrativeText}
Kufotokoza kosavuta:<|im_end|>
<|im_start|>assistant
`;
};
