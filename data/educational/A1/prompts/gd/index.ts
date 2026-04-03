import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Ag òrdachadh ann an Cafaidh",
        role: "Is tusa barista ann an cafaidh trang.",
        objectives: ["Beannaich don bharista", "Òrdaich deoch", "Òrdaich biadh", "Iarr am bile"]
    },
    directions: {
        title: "Ag iarraidh stiùiridhean",
        role: "Is tusa neach ionadail cuideachail air an t-sràid.",
        objectives: ["Gabh leisgeul gu modhail", "Faighnich cà bheil an stèisean trèana", "Tapadh leat don neach ionadail"]
    },
    doctor_visit: {
        title: "Aig an Dotair",
        role: "Is tusa dotair. Is e euslainteach a tha san neach-cleachdaidh.",
        objectives: ["Thoir cunntas air dà chomharradh", "Tuig comhairle an dotair", "Faighnich mu chungaidh-leigheis"]
    },
    shopping_clothes: {
        title: "A' ceannach aodach",
        role: "Is tusa neach-cuideachaidh bùtha.",
        objectives: ["Iarr nì sònraichte", "Bruidhinn mu mheudan", "Faighnich mun phrìs"]
    },
    job_interview: {
        title: "Agallamh Obrach",
        role: "Is tusa manaidsear fastaidh a tha a' dèanamh agallamh air an neach-cleachdaidh.",
        objectives: ["Sloinn thu fhèin gu proifeasanta", "Thoir cunntas air eòlas roimhe", "Faighnich ceist mun dreuchd"]
    },
    meeting_friend: {
        title: "Coinneachadh ri Caraid Ùr",
        role: "Is tusa oileanach ann am pàirc.",
        objectives: ["Innis d' ainm agus cò às a tha thu", "Faighnich ainm an neach eile", "Abair beannachd gu modhail"]
    },
    planning_picnic: {
        title: "A' Dealbhadh Picnic",
        role: "Is tusa caraid an neach-cleachdaidh.",
        objectives: ["Thoir sùil air an t-sìde", "Molaibh ùine airson coinneachadh", "Co-dhùin dè am biadh a bheir thu leat"]
    },
    new_coworker: {
        title: "Co-obraiche Ùr",
        role: "Is tusa neach-obrach ùr air a' chiad latha agad.",
        objectives: ["Mìnich àrainneachd an oifis", "Mìnich gnìomhan làitheil", "Thoir seachad comhairle fheumail"]
    },
    bank_account: {
        title: "A' Fosgladh Cunntas Banca",
        role: "Is tusa clèireach banca ann an Dùn Èideann.",
        objectives: ["Mìnich an t-adhbhar airson an turais", "Faighnich mu sgrìobhainnean", "Faighnich mu fheartan banca gluasadach"]
    },
    environmental_meeting: {
        title: "Coinneamh Coimhearsnachd Àrainneachd",
        role: "Is tusa eagraiche coimhearsnachd.",
        objectives: ["Dèan argamaid airson poileasaidh sònraichte", "Freagair draghan mu chosgais", "Geàrr-chunntas air sealladh iom-fhillte"]
    },
    tradition_vs_modernity: {
        title: "Dualchas vs Nuadh-aimsearrachd",
        role: "Is tusa neach-nuadh-aimsearrachd a tha a' creidsinn gu bheil dualchas a' bacadh adhartas.",
        objectives: ["Dèan coimeas eadar luachan eachdraidheil agus nuadh", "Cleachd gnàthasan-cainnte adhartach", "Sgrùdaich dearbh-aithne cultarail"]
    },
    travel_complaint: {
        title: "Gearan Turais",
        role: "Is tusa neach-ionaid loidhne-adhair aig an t-port-adhair.",
        objectives: ["Mìnich an duilgheadas", "Iarr ais-dhìol no ath-ghleidheadh", "Faighnich mu thaigh-òsta"]
    },
    apartment_dispute: {
        title: "Connspaid Àrosain",
        role: "Is tusa uachdaran nach eil ag iarraidh pàigheadh airson càradh.",
        objectives: ["Thoir cunntas air a' mhilleadh", "Dèan argamaid carson a tha e an urra ris an uachdaran", "Aontaich air ceann-latha càraidh"]
    },
    cultural_debate: {
        title: "Deasbad Meadhanan Sòisealta",
        role: "Is tusa caraid a tha teagmhach mu theicneòlas.",
        objectives: ["Sloinn beachd", "Thoir seachad dà adhbhar taiceil", "Dèan frith-argamaid air puing"]
    },
    legal_consultation: {
        title: "Co-chomhairle Laghail",
        role: "Is tusa neach-lagha a tha a' speisealachadh ann an seilbh inntleachdail.",
        objectives: ["Mìnich am briseadh cùmhnant", "Iarr mu leigheasau laghail", "Bruidhinn mu thoraidhean a dh'fhaodadh a bhith ann"]
    },
    academic_seminar: {
        title: "Seiminear Acadaimigeach",
        role: "Is tusa ollamh oilthigh.",
        objectives: ["Geàrr-chunntas air do shuidheachadh", "Luaidh fianais hipoteiticeach", "Freagair puing breithneachail"]
    },
    philosophical_debate: {
        title: "Beusachd AI",
        role: "Is tusa fealsanaiche ainmeil.",
        objectives: ["Mìnich bun-bheachd eas-chruthach iomadh-fhillte", "Cleachd metaphors sòlaimte", "Làimhseachadh ìoranas agus nuances"]
    },
    diplomatic_crisis: {
        title: "Co-rèiteachadh Dioplòmasach",
        role: "Is tusa dioplòmaiche àrd-ìre bho dhùthaich iomaìtheach.",
        objectives: ["Sloinn draghan nàiseanta gu neo-dhìreach", "Molaibh co-rèiteachadh iomadh-fhillte", "Cùm protocolaid foirmeil teann"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

An obair agad: Lean air adhart leis an sgeulachd ann an DÌREACH 1 seantans ghoirid.
Sgrìobh an sgeulachd a-mhàin. Gun chinn-sgrìobhaidh no mìneachaidhean.
CUDROMACH: NA CLEACHD BEURLA. Cànan: Gàidhlig.
Tòn: Toilichte agus gu math sìmplidh (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 seantans:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Neach-teagaisg cànain sìmplidh. Ceartaich an inntrigeadh. Mas eil e ceart, abair "Foirfe."<|im_end|>
<|im_start|>user
Tùsail: ${userInput}
Ceartachadh:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Dèan nas sìmplidh e (3-5 faclan).<|im_end|>
<|im_start|>user
Tùsail: ${narrativeText}
Sìmplidh:<|im_end|>
<|im_start|>assistant
`;
};
