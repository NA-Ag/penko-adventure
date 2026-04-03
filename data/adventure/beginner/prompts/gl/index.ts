/**
 * GL Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
A túa tarefa: Continuar a historia en EXACTAMENTE 1 oración curta.
Escribe só a historia. Sen cabeceiras nin explicacións.
CRÍTICO: NON USES O INGLÉS. Idioma: Galego.
Tono: Feliz e moi sinxelo (CEFR A1).

Exemplo:
Historia ata agora: A choiva cae na rúa.
Acción do xogador: miro ao redor
1 oración: Ves luces de neón reflectidas nos charcos.<|im_end|>
<|im_start|>user
Historia ata agora: ${history}
${systemEvent ? `Evento do sistema: ${systemEvent}` : ''}
Acción do xogador: ${action}
1 oración:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * GL Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Titor de idiomas sinxelo. Corrixe a entrada. Se é correcta, di "Perfecto."<|im_end|>
<|im_start|>user
Original: ${userInput}
Corrección:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * GL Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Faino máis sinxelo (3-5 palabras).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificado:<|im_end|>
<|im_start|>assistant
`;
};
