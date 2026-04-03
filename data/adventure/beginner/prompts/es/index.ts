/**
 * ES Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Tu tarea: Continuar la historia en EXACTAMENTE 1 oración corta.
Escribe solo la historia. Sin encabezados ni explicaciones.
CRÍTICO: NO USES EL INGLÉS. Idioma: Español.
Tono: Feliz y muy simple (CEFR A1).

Ejemplo:
Historia hasta ahora: La lluvia cae en la calle.
Acción del jugador: miro alrededor
1 oración: Ves luces de neón reflejadas en los charcos.<|im_end|>
<|im_start|>user
Historia hasta ahora: ${history}
${systemEvent ? `Evento del sistema: ${systemEvent}` : ''}
Acción del jugador: ${action}
1 oración:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ES Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor de idiomas sencillo. Corrige la entrada. Si es correcta, di "Perfecto."<|im_end|>
<|im_start|>user
Original: ${userInput}
Corrección:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ES Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Hazlo más sencillo (3-5 palabras).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificado:<|im_end|>
<|im_start|>assistant
`;
};
