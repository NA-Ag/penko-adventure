import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "In Caupona",
        role: "Tu es cocus vel administer in caupona frequenti.",
        objectives: ["Saluta administrum", "Potiunem iube", "Cibum iube", "Libellum pete"]
    },
    directions: {
        title: "Viam Rogare",
        role: "Tu es vicinus benevolus in via.",
        objectives: ["Comiter excusa", "Ubi sit statio ferriviaria roga", "Vicino gratias age"]
    },
    doctor_visit: {
        title: "Apud Medicum",
        role: "Tu es medicus. Usor est aegrotus.",
        objectives: ["Duo symptomata describe", "Consilium medici intellege", "De medicamine roga"]
    },
    shopping_clothes: {
        title: "Vestimenta Emere",
        role: "Tu es venditor in taberna.",
        objectives: ["Rem certam roga", "De magnitudinibus loquere", "Pretium roga"]
    },
    job_interview: {
        title: "Colloquium de Opere",
        role: "Tu es curator qui cum usore de munere mercatorio loquitur.",
        objectives: ["Te ipsum professione introduce", "Experientiam praeteritam describe", "Quaestionem de officio roga"]
    },
    meeting_friend: {
        title: "Occursus cum Novo Amico",
        role: "Tu es discipulus in hortis publicis.",
        objectives: ["Nomen tuum et originem dic", "Nomen alterius personae roga", "Comiter vale dic"]
    },
    planning_picnic: {
        title: "De Merenda Paranda",
        role: "Tu es amicus usoris.",
        objectives: ["Caelum inspice", "Tempus conveniendi propone", "Decide quos cibos feras"]
    },
    new_coworker: {
        title: "Novus Collega",
        role: "Tu es novus operarius in primo die tuo.",
        objectives: ["Ambientem officii describe", "Munera cotidiana explica", "Consilium utile da"]
    },
    bank_account: {
        title: "Rationem Argentariam Aperire",
        role: "Tu es scriba argentarius Romae.",
        objectives: ["Causam visitationis explica", "De documentis inquire", "De muneribus argentariae mobilis roga"]
    },
    environmental_meeting: {
        title: "Conventus Communitatis de Oecologia",
        role: "Tu es ordinator communitatis.",
        objectives: ["Argumentum pro certa re publica fac", "De curis sumptuum responde", "Sententiam difficilem breviter dic"]
    },
    tradition_vs_modernity: {
        title: "Traditio vs Modernitas",
        role: "Tu es modernista qui credit traditiones progressum impedire.",
        objectives: ["Valores historicos et modernos compara", "Idiomata provecta adhibe", "Identitatem culturalem investiga"]
    },
    travel_complaint: {
        title: "Querela de Itinere",
        role: "Tu es administer societatis aeriae in aeroportu.",
        objectives: ["Problema explica", "Pecuniam reddi aut novam tesseram pete", "De deversorio inquire"]
    },
    apartment_dispute: {
        title: "Lis de Habitaculo",
        role: "Tu es dominus aedium qui pecuniam pro refectione solvere non vult.",
        objectives: ["Damnum describe", "Argue cur sit officium domini", "De die refectionis conveni"]
    },
    cultural_debate: {
        title: "Disputatio in Mediis Socialibus",
        role: "Tu es amicus qui de technologia dubitat.",
        objectives: ["Sententiam dic", "Duas rationes affer", "Contra argumentum responde"]
    },
    legal_consultation: {
        title: "Consultatio Iuridica",
        role: "Tu es iurisconsultus qui rebus intellectualibus studet.",
        objectives: ["Violationem pacti explica", "De remediis iuridicis roga", "De eventibus loquere"]
    },
    academic_seminar: {
        title: "Seminarium Academicum",
        role: "Tu es professor universitatis.",
        objectives: ["Sententiam tuam breviter dic", "Argumenta hypothetica affer", "Ad criticam responde"]
    },
    philosophical_debate: {
        title: "Ethica AI",
        role: "Tu es philosophus clarus.",
        objectives: ["Conceptum difficilem defini", "Metaphoras subtiles adhibe", "Ironiam et subtilitatem tracta"]
    },
    diplomatic_crisis: {
        title: "Negotium Diplomaticum",
        role: "Tu es legatus summus ex natione aemula.",
        objectives: ["Curam nationalem tecte dic", "Compromissum difficile propone", "Mores sollemnes serva"]
    }
};

/**
 * LA Educational Narrative Prompt
 */
export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
Tutor linguae AI (${levelName}). ${local.role}
Regula Berlitz: NOLI errores palam corrigere. Sententiam confirma utendo grammatica recta naturaliter.
Exemplum: Discipulus: "Ego crustum heri edere" -> Tu: "Et ego heri **crustum edi**, quale tibi placet?"

Scenarium: ${local.title}
Propositi: ${local.objectives.join(', ')}

Praecepta:
1. EXACTE 1 vel 2 sententiae breves.
2. Lingua: ${language}. LINGUA ANGLICA PROHIBITA.
3. Gradus: ${levelName}.<|im_end|>
<|im_start|>user
Conversatio: ${history}
${systemEvent ? `Eventus: ${systemEvent}` : ''}
Discipulus: ${action}
Responsum tutoris:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LA Educational Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor linguae. Corrige errores in scriptis usoris. Si rectum est, dic "Optime" (vel "Perfect").<|im_end|>
<|im_start|>user
Textus: ${userInput}
Correctio:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LA Educational Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Fac hunc textum simpliciorem (gradus CEFR A1).<|im_end|>
<|im_start|>user
Originale: ${narrativeText}
Simplificatio:<|im_end|>
<|im_start|>assistant
`;
};
