/**
 * LV Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tavs uzdevums: Turpināt stāstu PRECIZI 1 īsā teikumā.
Raksti tikai stāstu. Bez virsrakstiem vai paskaidrojumiem.
SVARĪGI: NEIZMANTOJIET ANGLU VALODU. Valoda: Latviešu.
Tonis: Priecīgs un ļoti vienkāršs (CEFR A1).

Piemērs:
Stāsts līdz šim: Uz ielas līst lietus.
Spēlētāja darbība: es paskatos apkārt.
1 teikums: Tu redzi peļķēs atspoguļojamies neona gaismas.<|im_end|>
<|im_start|>user
Stāsts līdz šim: ${history}
${systemEvent ? `Sistēmas notikums: ${systemEvent}` : ''}
Spēlētāja darbība: ${action}
1 teikums:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LV Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Vienkāršs valodu skolotājs. Izlabo ievadi. Ja tā ir pareiza, saki "Izcili."<|im_end|>
<|im_start|>user
Oriģināls: ${userInput}
Labojums:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LV Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Padari vienkāršāk (3-5 vārdi).<|im_end|>
<|im_start|>user
Oriģināls: ${narrativeText}
Vienkāršots:<|im_end|>
<|im_start|>assistant
`;
};
