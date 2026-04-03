import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Pípaṣẹ ní ilé oúnjẹ",
        role: "O jẹ́ olùpèsè kọfí (barista) ní ilé oúnjẹ kan tó kún fún ènìyàn.",
        objectives: ["Kí olùpèsè kọfí náà", "Pàṣẹ ohun mímu kan", "Pàṣẹ oúnjẹ kan", "Béèrè fún ìwé ìsannwó (bill)"]
    },
    directions: {
        title: "Bíbèèrè ọ̀nà",
        role: "O jẹ́ ọmọ ìlú kan tó fẹ́ ràn ẹ́ lọ́wọ́ ní ojú títì.",
        objectives: ["Ṣe àtúnṣe pẹ̀lú ọ̀wọ̀", "Béèrè ibi tí ibùdókọ̀ rélùwé wà", "Dúpẹ́ lọ́wọ́ ọmọ ìlú náà"]
    },
    doctor_visit: {
        title: "Ní ọ́fíìsì dókítà",
        role: "Dókítà ni ẹ́. Olùlò náà jẹ́ aláìsàn.",
        objectives: ["Ṣàpèjúwe àmì àìsàn méjì", "Mọ̀ nípa ìmọ̀ràn dókítà", "Béèrè nípa oògùn"]
    },
    shopping_clothes: {
        title: "Ríra aṣọ",
        role: "O jẹ́ olùrànlọ́wọ́ ní ilé ìtajà.",
        objectives: ["Béèrè fún nǹkan pàtó kan", "Sọ̀rọ̀ nípa ìwọ̀n aṣọ", "Béèrè iye owó rẹ̀"]
    },
    job_interview: {
        title: "Ifọrọwanilẹnuwo Iṣẹ",
        role: "O jẹ oluṣakoso igbanisiṣẹ ti o n ṣe ifọrọwanilẹnuwo fun olumulo fun iṣẹ tita.",
        objectives: ["Ṣe afihan ararẹ ni ọna ọjọgbọn", "Ṣapejuwe iriri ti o kọja", "Beere ibeere kan nipa ipa naa"]
    },
    meeting_friend: {
        title: "Ipade Ọrẹ Tuntun",
        role: "O jẹ ọmọ ile-iwe ni ibi isinmi (park).",
        objectives: ["Sọ orukọ rẹ ati ibi ti o ti wa", "Beere orukọ eniyan keji", "Sọ o dabọ pẹlu ọwọ"]
    },
    planning_picnic: {
        title: "Iṣeto Pikiniki",
        role: "O jẹ ọrẹ olumulo.",
        objectives: ["Ṣayẹwo oju-ọjọ", "Daba akoko ipade", "Pinnu iru ounjẹ ti iwọ yoo mu wa"]
    },
    new_coworker: {
        title: "Alabaṣiṣẹpọ Tuntun",
        role: "O jẹ oṣiṣẹ tuntun ni ọjọ akọkọ rẹ.",
        objectives: ["Ṣapejuwe agbegbe ọfiisi", "Ṣalaye awọn iṣẹ ṣiṣe ojoojumọ", "Fun ni imọran to wulo"]
    },
    bank_account: {
        title: "Ṣiṣi Akọọlẹ Banki",
        role: "O jẹ akọwe banki ni Lagos.",
        objectives: ["Ṣalaye idi fun abẹwo naa", "Beere nipa awọn iwe aṣẹ", "Beere nipa awọn ẹya ile-ifowopamọ alagbeka"]
    },
    environmental_meeting: {
        title: "Ipade Agbegbe lori Ayika",
        role: "O jẹ oluṣeto agbegbe.",
        objectives: ["Ṣe ariyanjiyan fun eto imulo kan pato", "Dahun si awọn ifiyesi idiyele", "Ṣe akopọ oju-iwoye ti o nira"]
    },
    tradition_vs_modernity: {
        title: "Aṣa vs Igbalode",
        role: "O jẹ ẹni ti o nifẹ si igbalode ti o gbagbọ pe awọn aṣa n ṣe idiwọ ilọsiwaju.",
        objectives: ["Ṣe afiwe awọn iye itan ati ti igbalode", "Lo awọn owe ti o jinlẹ", "Ṣe itupalẹ idanimọ aṣa"]
    },
    travel_complaint: {
        title: "Esun Irin-ajo",
        role: "O jẹ aṣoju ile-iṣẹ ọkọ ofurufu ni papa ọkọ ofurufu.",
        objectives: ["Ṣalaye iṣoro naa", "Beere fun agbapada tabi iyipada tikẹti", "Beere nipa hotẹẹli"]
    },
    apartment_dispute: {
        title: "Iyapa lori Iyẹwu",
        role: "O jẹ onile ti ko fẹ sanwo fun atunṣe.",
        objectives: ["Ṣapejuwe ibajẹ naa", "Ṣe ariyanjiyan idi ti o fi jẹ ojuse onile", "Gba lori ọjọ atunṣe"]
    },
    cultural_debate: {
        title: "Àríyànjiyàn lórí Mídià Àwùjọ",
        role: "O jẹ́ ọ̀rẹ́ kan tí kò ní ìgbàgbọ́ púpọ̀ nínú tẹkinọlọ́jì.",
        objectives: ["Sọ èrò rẹ", "Fún ní ìdí méjì láti tì í lẹ́yìn", "Dáhùn sí àríyànjiyàn kan"]
    },
    legal_consultation: {
        title: "Ìgbìmọ̀ Òfin",
        role: "O jẹ́ agbẹjọ́rò kan tó mọ̀ nípa ohun ìní ọpọlọ.",
        objectives: ["Ṣàlàyé rírú òfin àdéhùn", "Béèrè nípa àwọn àtúnṣe òfin", "Sọ̀rọ̀ nípa àwọn àbájáde tó lè wáyé"]
    },
    academic_seminar: {
        title: "Àpérò Ilé-ẹ̀kọ́",
        role: "O jẹ́ ọ̀jọ̀gbọ́n ní ilé-ẹ̀kọ́ gíga.",
        objectives: ["Ṣàkópọ̀ ipò rẹ", "Sọ àwọn ẹ̀rí tó fojú rí", "Dáhùn sí àríwísí kan"]
    },
    philosophical_debate: {
        title: "Ìlànà Ìwà rere AI",
        role: "O jẹ́ onímọ̀ ọgbọ́n orí olókìkí kan.",
        objectives: ["Túmọ̀ èrò tó nira", "Lo àwọn àpèjúwe tó jinlẹ̀", "Mójútó yẹ̀yẹ́ àti àwọn nǹkan mìíràn"]
    },
    diplomatic_crisis: {
        title: "Ìjíròrò Diplay",
        role: "O jẹ́ aṣojú ìjọba gíga láti orílẹ̀-èdè tó ń bá yín díje.",
        objectives: ["Sọ àwọn ìdààmú orílẹ̀-èdè lọ́nà tààrà", "Dábàá àdéhùn tó nira", "Pa àwọn ìlànà ìjọba mọ́ ní mímú"]
    }
};

/**
 * YO Educational Narrative Prompt
 */

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Ìwọ ni 'Penko', Olùdarí Eré fún ${theme}.
Iṣẹ́ rẹ: Tẹ̀síwájú ìtàn náà ní gbólóhùn kúkúrú kan péré.
Kò sí àkọlé, kò sí markdown, kò sí ìsọ̀rọ̀.
PÀTÀKÌ: KÒ SÍ GẸ̀Ẹ́SÌ. Fèsì ní èdè Yorùbá nìkan.
Ohùn: Ayọ̀ àti ìrọ̀rùn (CEFR A1).
Àpẹẹrẹ:
Ìtàn di báyìí: Òjò ń rọ̀ ní ojú títì.
Ìṣe agbáyò: Mo wo àyíká mi.
<|im_start|>user
Àkọ́kọ́: ${userInput}
<|im_start|>user
Àkọ́kọ́: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Gbólóhùn 1:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Olùkọ́ Èdè. Ṣàtúnṣe àwọn àṣìṣe. Tí ó bá dára, sọ pé "Pípé."<|im_end|>
<|im_start|>user
Àkọ́kọ́: ${userInput}
Àtúnṣe:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Ṣe é ní ìrọ̀rùn jùlọ (CEFR A1).<|im_end|>
<|im_start|>user
Àkọ́kọ́: ${narrativeText}
Ìrọ̀rùn:<|im_end|>
<|im_start|>assistant
`;
};
