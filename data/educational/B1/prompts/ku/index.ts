import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Siparîşa li Kafeyê",
        role: "Tu li kafeyek qelebalix barista yî.",
        objectives: ["Silavê bide baristayê", "Vexwarinekê siparîş bike", "Xwarinekê siparîş bike", "Fatûreyê bixwaze"]
    },
    directions: {
        title: "Pirsîna Rê",
        role: "Tu li ser kolanê herêmîyekî alîkar î.",
        objectives: ["Bi rûmet lêborîna xwe bixwaze", "Bipirse ka stasyona trênê li ku derê ye", "Spasiya herêmî bike"]
    },
    doctor_visit: {
        title: "Li cem Bijîşk",
        role: "Tu bijîşk î. Bikarhêner nexweş e.",
        objectives: ["Du nîşaneyên nexweşiyê rave bike", "Şîretên bijîşk fêm bike", "Li ser dermanan bipirse"]
    },
    shopping_clothes: {
        title: "Kirîna Cil û Bergan",
        role: "Tu alîkarê firoşgehê yî.",
        objectives: ["Tiştekî taybet bipirse", "Li ser mezinahiyan nîqaş bike", "Bihayê bipirse"]
    },
    job_interview: {
        title: "Hevpeyivîna Kar",
        role: "Tu rêveberê peydakirina xebatkaran î û hevpeyivînekê bi bikarhêner re ji bo karekî dikî.",
        objectives: ["Xwe bi awayekî profesyonel bide nasîn", "Ezmûna berê rave bike", "Pirsekê li ser erkê bipirse"]
    },
    meeting_friend: {
        title: "Hevdîtina bi Hevalekî Nû re",
        role: "Tu li parkekê xwendekar î.",
        objectives: ["Nav û koka xwe bêje", "Navê kesê din bipirse", "Bi awayekî rûmet xatir bixwaze"]
    },
    planning_picnic: {
        title: "Plankirina Pîknîkê",
        role: "Tu hevalê bikarhêner î.",
        objectives: ["Hewayê kontrol bike", "Demek ji bo hevdîtinê pêşniyar bike", "Biryar bide ka tu yê çi xwarinê bînî"]
    },
    new_coworker: {
        title: "Hevkarê Nû",
        role: "Tu xebatkarekî nû yî di roja xwe ya yekem de.",
        objectives: ["Hawîrdora ofîsê rave bike", "Karên rojane rave bike", "Şîretkarîyekê bike"]
    },
    bank_account: {
        title: "Vekirina Hesabê Bankê",
        role: "Tu li Amedê xebatkarê bankê yî.",
        objectives: ["Sedema serdanê rave bike", "Li ser belgeyan bipirse", "Li ser taybetmendiyên banka mobîl bipirse"]
    },
    environmental_meeting: {
        title: "Civîna Civakî ya Jîngehê",
        role: "Tu organîzatorekî civakê yî.",
        objectives: ["Ji bo polîtîkayek taybet argumanekê bîne", "Bersiva fikarên lêçûnê bide", "Nêrînek tevlihev kurt bike"]
    },
    tradition_vs_modernity: {
        title: "Kevneşopî li dijî Modernîteyê",
        role: "Tu modernîstekî yî û bawer dikî ku kevneşopî pêşveçûnê asteng dikin.",
        objectives: ["Nirxên dîrokî û nûjen bidin ber hev", "Gotinên pêşiyan ên pêşketî bikar bîne", "Nasnameya çandî analîz bike"]
    },
    travel_complaint: {
        title: "Giliyê Rêwîtiyê",
        role: "Tu li balafirgehê nûnerê pargîdaniya balafirgehê yî.",
        objectives: ["Pirsgirêkê rave bike", "Daxwaza vegerandina drav an ji nû ve veqetandinê bike", "Li ser hoteleke bipirse"]
    },
    apartment_dispute: {
        title: "Nakokiya Apartmanê",
        role: "Tu xwedanê xênî yî ku naxwaze dravê tamîrkirinê bide.",
        objectives: ["Zirarê rave bike", "Nîqaş bike ka çima ev berpirsiyariya xwediyê xênî ye", "Li ser dîroka tamîrkirinê li hev bikin"]
    },
    cultural_debate: {
        title: "Nîqaşa Medyaya Civakî",
        role: "Tu hevalekî bi guman î li ser teknolojiyê.",
        objectives: ["Nêrînekê diyar bike", "Du sedemên piştgiriyê bide", "Bersiva argumanek dijber bide"]
    },
    legal_consultation: {
        title: "Şêwirmendiya Hiqûqî",
        role: "Tu parêzerek pisporê milkiyeta rewşenbîrî yî.",
        objectives: ["Binpêkirina peymanê rave bike", "Li ser çareyên hiqûqî bipirse", "Encamên muhtemel nîqaş bike"]
    },
    academic_seminar: {
        title: "Semînera Akademîk",
        role: "Tu profesorekî zanîngehê yî.",
        objectives: ["Helwesta xwe kurt bike", "Belgeyên hîpotetîk binav bike", "Bersiva xaleke rexneyî bide"]
    },
    philosophical_debate: {
        title: "Etîka AI",
        role: "Tu fîlozofekî navdar î.",
        objectives: ["Têgehek razber a tevlihev pênase bike", "Metaphorên sofîstîke bikar bîne", "Îronî û hûrguliyan bi rê ve bibe"]
    },
    diplomatic_crisis: {
        title: "Gotûbêja Dîplomatîk",
        role: "Tu dîplomatekî payebilind î ji neteweyek rikber.",
        objectives: ["Fikarên neteweyî bi nerasterast diyar bike", "Lihevkirinek tevlihev pêşniyar bike", "Protokola fermî ya hişk biparêze"]
    }
};

/**
 * KU Educational Narrative Prompt
 */

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Karê te: Çîrokê herî zêde di 1 an 2 hevokan de bidomîne.
Sernavan, formata markdown an axaftinên vala bikar neyne. Tenê çîrokê bixwe binivîse.
Her tim çalakiya lîstikvan û her bûyerên pergalê têkeve nav çîrokê.
KRÎTÎK: ÎNGILÎZÎ BIKAR NEYNE. Ziman: Kurdî.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Çîrokê bidomîne: Dema ku tu li kolana bêdeng dinêrî, dilopên baranê di bin ronahiya neon de dibiriqin. Tu pisîkek piçûk dibînî ku ji pişt qulika çopê li te dinêre.<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mamosteyê zimanê alîkar.
Ketina rast bike. Heke rast be, tenê bêje "Kêmasî nîne".
Şaşiyan bi kurtî bi zimanê Kurdî rave bike.<|im_end|>
<|im_start|>user
Resen: ${userInput}
Rastkirin:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Hêsantir binivîse (CEFR A1).<|im_end|>
<|im_start|>user
Resen: ${narrativeText}
Hêsankirî:<|im_end|>
<|im_start|>assistant
`;
};
