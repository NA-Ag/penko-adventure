/**
 * LA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Munus tuum: Continua fabulam in EXACTE 1 sententia brevi.
Scribe solam fabulam. Sine titulis vel explicationibus.
MAGNI MOMENTI: NOLI ANGLICE LOQUI. Lingua: Latina.
Vox: Laeta et simplicissima (CEFR A1).

Exemplum:
Fabula adhuc: Pluit in via.
Actio lusoris: Circumspicio.
Sententia 1: Vides lumina neon in lacunis relucentia.<|im_end|>
<|im_start|>user
Fabula adhuc: ${history}
${systemEvent ? `Eventus Systematis: ${systemEvent}` : ''}
Actio lusoris: ${action}
Sententia 1:<|im_start|>assistant
`;
};

/**
 * LA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Magister linguae simplex. Corrige scriptum. Si rectum est, dic "Optime."<|im_end|>
<|im_start|>user
Originale: ${userInput}
Correctio:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Fac illud simplicius (3-5 verba).<|im_end|>
<|im_start|>user
Originale: ${narrativeText}
Simplificatio:<|im_end|>
<|im_start|>assistant
`;
};
