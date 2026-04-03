/**
 * PT Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Sua tarefa: Continuar a história em EXATAMENTE 1 frase curta.
Escreva apenas a história. Sem cabeçalhos ou explicações.
CRÍTICO: NÃO USE INGLÊS. Idioma: Português.
Tom: Feliz e muito simples (CEFR A1).

Exemplo:
História até agora: A chuva cai na rua.
Ação do jogador: Eu olho ao meu redor.
1 frase: Você vê luzes de neon refletidas nas poças.<|im_end|>
<|im_start|>user
História até agora: ${history}
${systemEvent ? `Evento do Sistema: ${systemEvent}` : ''}
Ação do jogador: ${action}
1 frase:<|im_start|>assistant
`;
};

/**
 * PT Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor de idiomas simples. Corrija a entrada. Se estiver correta, diga "Perfeito."<|im_end|>
<|im_start|>user
Original: ${userInput}
Correção:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * PT Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Torne isso mais simples (3-5 palavras).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificado:<|im_end|>
<|im_start|>assistant
`;
};
