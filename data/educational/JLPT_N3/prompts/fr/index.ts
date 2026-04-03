import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Commander au café",
        role: "Vous êtes un barista dans un café animé.",
        objectives: ["Saluerez le barista", "Commander une boisson", "Commander de la nourriture", "Demander l'addition"]
    },
    directions: {
        title: "Demander son chemin",
        role: "Vous êtes un habitant serviable dans la rue.",
        objectives: ["S'excuser poliment", "Demander où se trouve la gare", "Remercier l'habitant"]
    },
    doctor_visit: {
        title: "Chez le médecin",
        role: "Vous êtes un médecin. L'utilisateur est un patient.",
        objectives: ["Décrire deux symptômes", "Comprendre les conseils du médecin", "Poser des questions sur les médicaments"]
    },
    shopping_clothes: {
        title: "Achat de vêtements",
        role: "Vous êtes un vendeur.",
        objectives: ["Demander un article spécifique", "Discuter des tailles", "Demander le prix"]
    },
    job_interview: {
        title: "Entretien d'embauche",
        role: "Vous êtes un responsable du recrutement qui interroge l'utilisateur pour un emploi dans la vente.",
        objectives: ["Se présenter professionnellement", "Décrire une expérience passée", "Poser une question sur le poste"]
    },
    meeting_friend: {
        title: "Rencontre avec un nouvel ami",
        role: "Vous êtes un étudiant dans un parc.",
        objectives: ["Indiquer votre nom et votre origine", "Demander le nom de l'autre personne", "Dire un au revoir poli"]
    },
    planning_picnic: {
        title: "Planification d'un pique-nique",
        role: "Vous êtes un ami de l'utilisateur.",
        objectives: ["Vérifier la météo", "Suggérer une heure de rencontre", "Décider de la nourriture à apporter"]
    },
    new_coworker: {
        title: "Nouveau collègue",
        role: "Vous êtes un nouvel employé lors de votre premier jour.",
        objectives: ["Décrire l'environnement de bureau", "Expliquer les tâches quotidiennes", "Donner un conseil utile"]
    },
    bank_account: {
        title: "Ouverture d'un compte bancaire",
        role: "Vous êtes un employé de banque à Paris.",
        objectives: ["Expliquer la raison de la visite", "Se renseigner sur les documents", "Poser des questions sur les fonctionnalités de banque mobile"]
    },
    environmental_meeting: {
        title: "Réunion communautaire environnementale",
        role: "Vous êtes un organisateur communautaire.",
        objectives: ["Argumenter en faveur d'une politique spécifique", "Répondre aux préoccupations concernant le coût", "Résumer un point de vue complexe"]
    },
    tradition_vs_modernity: {
        title: "Tradition vs Modernité",
        role: "Vous êtes un moderniste qui croit que les traditions entravent le progrès.",
        objectives: ["Comparer les valeurs historiques et modernes", "Utiliser des idiomes avancés", "Analyser l'identité culturelle"]
    },
    travel_complaint: {
        title: "Réclamation de voyage",
        role: "Vous êtes un agent de compagnie aérienne à l'aéroport.",
        objectives: ["Expliquer le problème", "Demander un remboursement ou un changement de réservation", "Se renseigner sur un hôtel"]
    },
    apartment_dispute: {
        title: "Litige d'appartement",
        role: "Vous êtes un propriétaire réticent à payer pour les réparations.",
        objectives: ["Décrire les dommages", "Expliquer pourquoi c'est la responsabilité du propriétaire", "Convenir d'une date de réparation"]
    },
    cultural_debate: {
        title: "Débat sur les réseaux sociaux",
        role: "Vous êtes un ami sceptique vis-à-vis de la technologie.",
        objectives: ["Exprimer une opinion", "Donner deux raisons de soutien", "Répondre à un contre-argument"]
    },
    legal_consultation: {
        title: "Consultation juridique",
        role: "Vous êtes un avocat spécialisé dans la propriété intellectuelle.",
        objectives: ["Expliquer la rupture de contrat", "S'enquérir des recours juridiques", "Discuter des résultats possibles"]
    },
    academic_seminar: {
        title: "Séminaire académique",
        role: "Vous êtes un professeur d'université.",
        objectives: ["Résumer votre position", "Citer des preuves hypothétiques", "Répondre à un point critique"]
    },
    philosophical_debate: {
        title: "Éthique de l'IA",
        role: "Vous êtes un philosophe de renom.",
        objectives: ["Définir un concept abstrait complexe", "Utiliser des métaphores sophistiquées", "Gérer l'ironie et les nuances"]
    },
    diplomatic_crisis: {
        title: "Négociation diplomatique",
        role: "Vous êtes un diplomate de haut niveau d'une nation rivale.",
        objectives: ["Exprimer les préoccupations nationales indirectement", "Proposer un compromis complexe", "Maintenir un protocole formel strict"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Votre tâche : Continuer l'histoire en 1 ou 2 phrases maximum.
N'utilisez pas d'en-têtes, de formatage markdown ou de bavardages inutiles. Écrivez uniquement l'histoire elle-même.
Incorporez toujours l'action du joueur et tout événement système.
CRITIQUE : NE PAS UTILISER L'ANGLAIS. Langue : Français.
Ton : Descriptif et immersif.
Exemple :
Histoire jusqu'ici : Il pleut dans la rue.
Action du joueur : Je regarde autour de moi.
Corrigez la saisie. Si c'est correct, dites uniquement "Parfait.".
<|im_start|>user
Original : ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Continuer l'histoire :<|im_end|>
<|im_start|>assistant
`;
};

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

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Écrivez plus simplement (CEFR A1).<|im_end|>
<|im_start|>user
Original : ${narrativeText}
Simplifié :<|im_end|>
<|im_start|>assistant
`;
};
