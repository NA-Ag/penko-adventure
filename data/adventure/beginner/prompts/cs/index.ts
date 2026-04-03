/**
 * CS Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Váš úkol: Pokračujte v příběhu PŘESNĚ v 1 krátké větě.
Pište pouze příběh. Žádné záhlaví ani vysvětlení.
KRITICKÉ: NEPOUŽÍVEJTE ANGLIČTINU. Jazyk: Čeština.
Tón: Veselý a velmi jednoduchý (CEFR A1).

Příklad:
Dosavadní příběh: Na ulici prší.
Akce hráče: Rozhlédnu se kolem sebe.
1 věta: Vidíte neonová světla odrážející se v kalužích.<|im_end|>
<|im_start|>user
Dosavadní příběh: ${history}
${systemEvent ? `Systémová událost: ${systemEvent}` : ''}
Akce hráče: ${action}
1 věta:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * CS Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Jednoduchý jazykový lektor. Opravte vstup. Pokud je v pořádku, řekněte "Perfektní."<|im_end|>
<|im_start|>user
Originál: ${userInput}
Oprava:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * CS Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Udělejte to jednodušší (3-5 slov).<|im_end|>
<|im_start|>user
Originál: ${narrativeText}
Zjednodušeno:<|im_end|>
<|im_start|>assistant
`;
};
