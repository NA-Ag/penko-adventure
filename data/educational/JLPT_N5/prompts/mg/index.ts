import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Manafatra ao amin'ny trano fisotroana kafe",
        role: "Mpanao kafe (barista) ianao ao amin'ny trano fisotroana kafe be olona.",
        objectives: ["Miarahaba ny mpanao kafe", "Manafatra zava-pisotro", "Manafatra sakafo", "Mangataka ny faktiora"]
    },
    directions: {
        title: "Manontany lalana",
        role: "Mponina eo an-toerana manampy olona ianao eny an-dalana.",
        objectives: ["Mifona amim-pahamendrehana", "Manontany ny toerana misy ny gara", "Misaotra ilay mponina"]
    },
    doctor_visit: {
        title: "Any amin'ny dokotera",
        role: "Dokotera ianao. Marary ilay mpampiasa.",
        objectives: ["Manazava aretina roa", "Mahazo ny torohevitry ny dokotera", "Manontany momba ny fanafody"]
    },
    shopping_clothes: {
        title: "Mividy akanjo",
        role: "Mpanampy ao amin'ny fivarotana ianao.",
        objectives: ["Mangataka zavatra manokana", "Miresaka momba ny habe", "Manontany ny vidiny"]
    },
    job_interview: {
        title: "Fampiresahana momba ny asa",
        role: "Mpitantana mpikaroka mpiasa ianao manontany ilay mpampiasa momba ny asa.",
        objectives: ["Manolotra tena amim-pahaiza-manao", "Manazava ny traikefa taloha", "Mametraka fanontaniana momba ny andraikitra"]
    },
    meeting_friend: {
        title: "Hihaona amin'ny namana vaovao",
        role: "Mpianatra ianao ao amin'ny zaridaina.",
        objectives: ["Milaza ny anaranao sy ny fiavianao", "Manontany ny anaran'ilay olona iray hafa", "Manao veloma am-panajana"]
    },
    planning_picnic: {
        title: "Mikarakara fitsangantsanganana",
        role: "Namana ianao amin'ny mpampiasa.",
        objectives: ["Mizaha ny toetr'andro", "Manolotra fotoana hihaonana", "Manapa-kevitra hoe inona no sakafo hoentina"]
    },
    new_coworker: {
        title: "Mpiara-miasa vaovao",
        role: "Mpiasa vaovao ianao amin'ny andro voalohany.",
        objectives: ["Mamaritra ny tontolon'ny birao", "Manazava ny asa isan'andro", "Manome torohevitra mahasoa"]
    },
    bank_account: {
        title: "Manokatra kaonty any amin'ny banky",
        role: "Mpiasan'ny banky ianao ao Antananarivo.",
        objectives: ["Manazava ny anton'ny fitsidihana", "Manontany momba ny antontan-taratasy", "Manontany momba ny tolotra banky amin'ny finday"]
    },
    environmental_meeting: {
        title: "Fivorian'ny mponina momba ny tontolo iainana",
        role: "Mpandamina ny fiaraha-monina ianao.",
        objectives: ["Manolotra hevitra momba ny politika voafaritra tsara", "Mamaly ny fanahiana momba ny sarany", "Mamintina fomba fijery sarotra"]
    },
    tradition_vs_modernity: {
        title: "Fomba amam-panao vs Ny ankehitriny",
        role: "Mpanaraka ny fomba ankehitriny ianao izay mino fa manakana ny fandrosoana ny fomba amam-panao.",
        objectives: ["Mampitaha ny soatoavina ara-tantara sy ny ankehitriny", "Mampiasa ohabolana avo lenta", "Manadihady ny maha-izy azy ara-kolontsaina"]
    },
    travel_complaint: {
        title: "Fitarainana momba ny dia",
        role: "Mpiasan'ny kaompaniam-piaramanidina ianao ao amin'ny seranam-piaramanidina.",
        objectives: ["Manazava ny olana", "Mangataka famerenam-bola na famandrihana vaovao", "Manontany momba ny hotely"]
    },
    apartment_dispute: {
        title: "Fifandirana momba ny trano",
        role: "Tompon-trano ianao izay tsy te handoa vola amin'ny fanamboarana.",
        objectives: ["Manazava ny fahasimbana", "Manome antony maha andraikitry ny tompon-trano izany", "Mifanaraka amin'ny daty hanamboarana"]
    },
    cultural_debate: {
        title: "Hevitra momba ny tambajotra sosialy",
        role: "Namana tsy matoky loatra ny teknolojia ianao.",
        objectives: ["Milaza hevitra", "Manome antony roa manohana izany", "Mamaly hevitra mifanohitra"]
    },
    legal_consultation: {
        title: "Fakan-kevitra momba ny lalàna",
        role: "Mpisolovava manam-pahaizana manokana amin'ny zon'ny mpamorona ianao.",
        objectives: ["Manazava ny fandikana ny fifanarahana", "Manontany momba ny vahaolana ara-dalàna", "Miresaka momba ny vokatra mety hitranga"]
    },
    academic_seminar: {
        title: "Seminera akademika",
        role: "Mpampianatra eny amin'ny oniversite ianao.",
        objectives: ["Mamintina ny hevitrao", "Manome porofo ara-teoria", "Mamaly fanamarihana mitsikera"]
    },
    philosophical_debate: {
        title: "Fitsipi-pitondran-tenan'ny AI",
        role: "Filozofa malaza ianao.",
        objectives: ["Mamaritra hevitra saro-pantarina", "Mampiasa ohatra ara-panoharana lalina", "Mitantana ny fanesoana sy ny tsipiriany"]
    },
    diplomatic_crisis: {
        title: "Fifampiraharahana ara-diplomatika",
        role: "Diplomatika ambony avy amin'ny firenena mpifanandrina ianao.",
        objectives: ["Milaza ny ahiahin'ny firenena amin'ny fomba an-kolaka", "Manolotra marimaritra iraisana saro-pady", "Mitandrina ny fitsipika ofisialy hentitra"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Ny asanao: Tohizo amin'ny fehezanteny fohy 1 marina tsara ny tantara.
Soraty fotsiny ny tantara. Tsy misy lohateny na fanazavana.
TSY MAINTSY: AZA AMPIASAINA NY TENY ANGLEZY. Teny: Malagasy.
Hira: Faly sy tsotra be (CEFR A1).
<|im_start|>user
Tany am-boalohany: ${userInput}
<|im_start|>user
Tany am-boalohany: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Fehezanteny 1:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mpampianatra teny tsotra. Ahitsio ny fidirana. Raha marina izany, lazao hoe "Tonga lafatra."<|im_end|>
<|im_start|>user
Tany am-boalohany: ${userInput}
Fanitsiana:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Ataovy tsotra kokoa (teny 3-5).<|im_end|>
<|im_start|>user
Tany am-boalohany: ${narrativeText}
Notsotsoroina:<|im_end|>
<|im_start|>assistant
`;
};
