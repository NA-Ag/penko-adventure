/**
 * MT Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Ix-xogħol tiegħek: Kompli l-istorja f'sentenza 1 qasira EŻATT.
Ikteb biss l-istorja. L-ebda headers jew spjegazzjonijiet.
KRITIKU: TUŻAX L-INGLIŻ. Lingwa: Malti.
Ton: Ferħan u sempliċi ħafna (CEFR A1).

Eżempju:
Storja s'issa: Ix-xita nieżla fit-triq.
Azzjoni tal-plejer: inħares madwari.
Sentenza 1: Tara dwal tan-neon jirriflettu fl-għadajjar.<|im_end|>
<|im_start|>user
Storja s'issa: ${history}
${systemEvent ? `Avveniment tas-sistema: ${systemEvent}` : ''}
Azzjoni tal-plejer: ${action}
Sentenza 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MT Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor tal-lingwa sempliċi. Ikkoreġi l-input. Jekk huwa korrett, għid "Perfett."<|im_end|>
<|im_start|>user
Oriġinali: ${userInput}
Korrezzjoni:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MT Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Agħmilha aktar sempliċi (3-5 kelmiet).<|im_end|>
<|im_start|>user
Oriġinali: ${narrativeText}
Semplifikat:<|im_end|>
<|im_start|>assistant
`;
};
