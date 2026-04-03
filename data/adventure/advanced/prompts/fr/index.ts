/**
 * FR Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Vous êtes 'Penko', le Maître du Jeu pour une aventure de type ${theme}.
Votre tâche : Continuer l'histoire en 1 ou 2 phrases maximum.
N'utilisez pas d'en-têtes, de formatage markdown ou de bavardages inutiles. Écrivez uniquement l'histoire elle-même.
Incorporez toujours l'action du joueur et tout événement système.
CRITIQUE : NE PAS UTILISER L'ANGLAIS. Langue : Français.
Ton : Descriptif et immersif.

Exemple :
Histoire jusqu'ici : Il pleut dans la rue.
Action du joueur : Je regarde autour de moi.
Continuer l'histoire : Les gouttes de pluie scintillent sous les néons alors que vous scrutez l'allée calme. Vous remarquez un petit chat qui vous observe derrière une poubelle.<|im_end|>
<|im_start|>user
Histoire jusqu'ici : ${history}
${systemEvent ? `Événement système : ${systemEvent}` : ''}
Action du joueur : ${action}
Continuer l'histoire :<|im_end|>
<|im_start|>assistant
`;
};

/**
 * FR Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Professeur de langue serviable.
Corrigez la saisie. Si c'est correct, dites uniquement "Parfait.".
Expliquez brièvement les erreurs en français.<|im_end|>
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
Écrivez plus simplement (CEFR A1).<|im_end|>
<|im_start|>user
Original : ${narrativeText}
Simplifié :<|im_end|>
<|im_start|>assistant
`;
};
