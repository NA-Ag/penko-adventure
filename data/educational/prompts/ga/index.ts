import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Ordú i gCaifé",
        role: "Is barista thú i gcaifé gnóthach.",
        objectives: ["Beannaigh don bharista", "Ordú deoch", "Ordú bia", "Iarr an bille"]
    },
    directions: {
        title: "Ag lorg treoracha",
        role: "Is duine áitiúil cabhrach thú ar an tsráid.",
        objectives: ["Gabh leithscéal go múinte", "Fiafraigh cá bhfuil an stáisiún traenach", "Gabh buíochas leis an duine áitiúil"]
    },
    doctor_visit: {
        title: "Ag an Dochtúir",
        role: "Is dochtúir thú. Is othar é an t-úsáideoir.",
        objectives: ["Déan cur síos ar dhá shiomptóm", "Tuig comhairle an dochtúra", "Fiafraigh faoi chógas"]
    },
    shopping_clothes: {
        title: "Ag siopadóireacht éadaí",
        role: "Is cúntóir siopa thú.",
        objectives: ["Iarr mír ar leith", "Pléigh méideanna", "Fiafraigh faoin bpraghas"]
    },
    job_interview: {
        title: "Agallamh Poist",
        role: "Is bainisteoir fostaíochta thú atá ag cur agallaimh ar an úsáideoir do phost miondíola.",
        objectives: ["Cuir tú féin in aithne go gairmiúil", "Déan cur síos ar thaithí roimhe seo", "Cuir ceist faoin ról"]
    },
    meeting_friend: {
        title: "Bualadh le Cara Nua",
        role: "Is mac léinn thú i bpáirc.",
        objectives: ["Sloinn d'ainm agus do thionscnamh", "Iarr ainm an duine eile", "Abair slán béasach"]
    },
    planning_picnic: {
        title: "Picnic a Phleanáil",
        role: "Is cara leis an úsáideoir thú.",
        objectives: ["Seiceáil an aimsir", "Mol am cruinnithe", "Cinntigh cén bia a thabharfar leat"]
    },
    new_coworker: {
        title: "Comhghleacaí Nua",
        role: "Is fostaí nua thú ar do chéad lá.",
        objectives: ["Déan cur síos ar thimpeallacht na hoifige", "Mínigh tascanna laethúla", "Tabhair leid chabhrach"]
    },
    bank_account: {
        title: "Cuntas Bainc a Oscailt",
        role: "Is cléireach bainc thú i mBaile Átha Cliath.",
        objectives: ["Mínigh an chúis leis an gcuairt", "Fiafraigh faoi dhoiciméid", "Fiafraigh faoi ghnéithe baincéireachta soghluaiste"]
    },
    environmental_meeting: {
        title: "Cruinniú Pobail Comhshaoil",
        role: "Is eagraí pobail thú.",
        objectives: ["Déan argóint ar son polasaí ar leith", "Freagair imní faoi chostais", "Tabhair achoimre ar dhearcadh casta"]
    },
    tradition_vs_modernity: {
        title: "Traidisiún vs Nua-aimsearthacht",
        role: "Is nua-aimsearthóir thú a chreideann go gcuireann traidisiúin bac ar dhul chun cinn.",
        objectives: ["Déan comparáid idir luachanna stairiúla agus nua-aimseartha", "Úsáid idióim arda", "Déan anailís ar fhéiniúlacht chultúrtha"]
    },
    travel_complaint: {
        title: "Gearán Taistil",
        role: "Is gníomhaire aerlíne thú ag an aerfort.",
        objectives: ["Mínigh an fhadhb", "Iarr aisíoc nó ath-áirithint", "Fiafraigh faoi óstán"]
    },
    apartment_dispute: {
        title: "Aighneas Árasáin",
        role: "Is tiarna talún thú nach bhfuil ag iarraidh íoc as deisiúcháin.",
        objectives: ["Déan cur síos ar an damáiste", "Argóint cén fáth gurb é freagracht an tiarna talún é", "Aontaigh ar dháta deisiúcháin"]
    },
    cultural_debate: {
        title: "Díospóireacht Meán Sóisialta",
        role: "Is cara thú atá amhrasach faoin teicneolaíocht.",
        objectives: ["Sloinn tuairim", "Tabhair dhá chúis thacaíochta", "Tabhair frith-argóint do phointe"]
    },
    legal_consultation: {
        title: "Comhairliúchán Dlí",
        role: "Is dlíodóir thú a dhéanann sainfheidhmiú ar mhaoin intleachtúil.",
        objectives: ["Mínigh an sárú conartha", "Fiafraigh faoi leigheasanna dlíthiúla", "Pléigh torthaí féideartha"]
    },
    academic_seminar: {
        title: "Seimineár Acadúil",
        role: "Is ollamh ollscoile thú.",
        objectives: ["Déan achoimre ar do sheasamh", "Luaigh fianaise hipitéiseach", "Freagair pointe criticiúil"]
    },
    philosophical_debate: {
        title: "Eitic AI",
        role: "Is fealsúnaí clúiteach thú.",
        objectives: ["Sainigh coincheap teibí casta", "Úsáid meafair sofaisticiúla", "Láimhseáil íoróin agus nuances"]
    },
    diplomatic_crisis: {
        title: "Idirbheartaíocht Taidhleoireachta",
        role: "Is taidhleoir ardleibhéil thú ó náisiún iomaíoch.",
        objectives: ["Sloinn imaggalaí náisiúnta go hindíreach", "Mol comhréiteach casta", "Coinnigh prótacal foirmiúil docht"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
Teagascóir teanga AI (${levelName}). ${local.role}
Riail Berlitz: NÁ ceartaigh earráidí go sainráite. Bailíochtú an smaoineamh ag baint úsáide as an ngramadach cheart go nádúrtha.
Sampla: Mac léinn: "Mise ithe cáca inné" -> Tú: "**D'ith** mise cáca inné freisin, cén blas is maith leat?"

Scenario: ${local.title}
Cuspóirí: ${local.objectives.join(', ')}

Treoracha:
1. GO EXACTLY 1 nó 2 abairt ghearra.
2. Teanga: ${language}. BÉARLA TOIRMISCTHE.
3. Leibhéal: ${levelName}.<|im_end|>
<|im_start|>user
Comhrá: ${history}
${systemEvent ? `Imeacht: ${systemEvent}` : ''}
Mac léinn: ${action}
Freagra an teagascóra:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Teagascóir teanga. Ceartaigh earráidí in ionchur an úsáideora. Má tá sé ceart, abair "Foirfe" (nó "Perfect").<|im_end|>
<|im_start|>user
Bunaidh: ${userInput}
Ceartúchán:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Déan an téacs seo a leanas níos simplí (leibhéal CEFR A1).<|im_end|>
<|im_start|>user
Bunaidh: ${narrativeText}
Simplithe:<|im_end|>
<|im_start|>assistant
`;
};
