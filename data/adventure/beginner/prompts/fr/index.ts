/**
 * FR Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Votre tâche : Continuer l'histoire en EXACTEMENT 1 phrase courte.
Écrivez uniquement l'histoire. Pas d'en-têtes ni d'explications.
CRITIQUE : NE PAS UTILISER L'ANGLAIS. Langue : Français.
Ton : Joyeux et très simple (CEFR A1).

Exemple :
Histoire jusqu'ici : La pluie tombe sur la rue.
Action du joueur : Je regarde autour de moi.
1 phrase : Vous voyez des néons se refléter dans les flaques d'eau.<|im_end|>
<|im_start|>user
Histoire jusqu'ici : ${history}
${systemEvent ? `Événement système : ${systemEvent}` : ''}
Action du joueur : ${action}
1 phrase :<|im_start|>assistant
`;
};

/**
 * FR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Professeur de langue simple. Corrigez la saisie. Si c'est correct, dites "Parfait."<|im_end|>
<|im_start|>user
Original : ${userInput}
Correction :<|im_end|>
<|im_start|>assistant
`;
};

/**
 * FR Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Faites plus simple (3-5 mots).<|im_end|>
<|im_start|>user
Original : ${narrativeText}
Simplifié :<|im_end|>
<|im_start|>assistant
`;
};
