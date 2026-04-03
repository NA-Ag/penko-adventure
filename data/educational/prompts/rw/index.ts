import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kuitanira mu Kafe",
        role: "Uri barista mu kafe irimo abantu benshi.",
        objectives: ["Suhuza barista", "Tumiza icyo kunywa", "Tumiza ibyo kurya", "Saba fagitire"]
    },
    directions: {
        title: "Kubaza Inzira",
        role: "Uri umuturage w'aho ufasha abantu mu muhanda.",
        objectives: ["Saba imbabazi mu kinyabupfura", "Baza aho gare y'igari ya moshi iri", "Shimira umuturage"]
    },
    doctor_visit: {
        title: "Kwa Muganga",
        role: "Uri muganga. Umukoresha ni umurwayi.",
        objectives: ["Sobanura ibimenyetso bibiri", "Sobanukirwa inama za muganga", "Baza iby'imiti"]
    },
    shopping_clothes: {
        title: "Kugura Imyenda",
        role: "Uri umukozi wo mu iduka.",
        objectives: ["Baza igikoresho cyihariye", "Ganira ku bunini", "Baza igiciro"]
    },
    job_interview: {
        title: "Ikiganiro cy'Akazi",
        role: "Uri ushinzwe gushaka abakozi urimo kubaza umukoresha.",
        objectives: ["Wimenyekanishe kinyamwuga", "Sobanura uburambe", "Baza ikibazo ku nshingano"]
    },
    meeting_friend: {
        title: "Guhura n'inshuti nshya",
        role: "Uri umunyeshuri muri pariki.",
        objectives: ["Vuga izina ryawe n'aho ukomoka", "Baza undi muntu izina rye", "Vuga uti 'murabeho' mu kinyabupfura"]
    },
    planning_picnic: {
        title: "Gutegura ibirori byo hanze (Picnic)",
        role: "Uri inshuti y'uwayikoresha.",
        objectives: ["Reba uko ikirere cyifashe", "Ehambya igihe cyo guhura", "Fata icyemezo ku biryo muzazana"]
    },
    new_coworker: {
        title: "Mugenzi wawe mushya",
        role: "Uri umukozi mushya ku munsi wawe wa mbere.",
        objectives: ["Sobanura uko mu biro hifashe", "Sobanura imirimo ya buri munsi", "Tanga inama y'ingirakamaro"]
    },
    bank_account: {
        title: "Gufungura konti ya banki",
        role: "Uri umukozi wa banki i Kigali.",
        objectives: ["Sobanura impamvu y'uruzinduko", "Baza ku nyandiko zikenewe", "Baza ku buryo bwo gukoresha banki kuri terefone"]
    },
    environmental_meeting: {
        title: "Inama y'abaturage ku bidukikije",
        role: "Uri umutegetsi mu baturage.",
        objectives: ["Tanga impamvu zo gushyigikira politiki runaka", "Subiza impungenge ku bijyanye n'igiciro", "Pfunika igitekerezo kigoye"]
    },
    tradition_vs_modernity: {
        title: "Umuco vs Ubujijuke",
        role: "Uri umuntu ukunda iby'iki gihe wizera ko imico ibangamira iterambere.",
        objectives: ["Gereranya indangagaciro za kera n'iz'ubu", "Koresha imvugo zikomeye", "Sura imyitwarire y'umuco"]
    },
    travel_complaint: {
        title: "Kurega ku Rugendo",
        role: "Uri umukozi w'indege ku kibuga cy'indege.",
        objectives: ["Sobanura ikibazo", "Saba kwishyurwa cyangwa guhindura itiki", "Baza ibya hoteli"]
    },
    apartment_dispute: {
        title: "Amakimbirane y'Inzu",
        role: "Uri nyirinzu utishimiye kwishyura ibyateganyijwe gusanwa.",
        objectives: ["Sobanura ibyangiritse", "Vuga impamvu ari inshingano za nyirinzu", "Emeranya ku itariki yo gusana"]
    },
    cultural_debate: {
        title: "Impaka ku Mbuga Nkoranyambaga",
        role: "Uri inshuti ishidikanya ku tekunoloji.",
        objectives: ["Vuga igitekerezo", "Tanga impamvu ebyiri zishyigikira", "Subiza igitekerezo kinyuranye"]
    },
    legal_consultation: {
        title: "Kugisha Inama mu by'Amategeko",
        role: "Uri umunyamategeko ushizwe iby'umutungo mu bwenge.",
        objectives: ["Sobanura kwica amasezerano", "Baza uburyo bwo kurenganurwa", "Ganira ku bishobora kuvamo"]
    },
    academic_seminar: {
        title: "Ihuriro ry'Amasomo",
        role: "Uri mwarimu wa kaminuza.",
        objectives: ["Finika aho uhagaze", "Vuga ibimenyetso bishoboka", "Subiza kunengwa"]
    },
    philosophical_debate: {
        title: "Imyitwarire ya AI",
        role: "Uri umufilozofe uzwi cyane.",
        objectives: ["Sobanura igitekerezo kigoye", "Koresha imvugo zivunnye", "Genzura ubusabane n'utuntu duto"]
    },
    diplomatic_crisis: {
        title: "Ibiganiro bya Dipolomasi",
        role: "Uri umudipolomate wo mu rwego rwo hejuru.",
        objectives: ["Vuga impungenge z'igihugu mu buryo butaziguye", "Tanga igitekerezo cy'ubwumvikane bugoye", "Genzura amategeko akaze"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
Umwarimu w'ururimi rwa AI (${levelName}). ${local.role}
Itegeko rya Berlitz: Ntukikosore mu buryo buzwi. Musubize wemeza igitekerezo cye ariko ukoreshe ikibonezamvugo cyiza mu buryo busanzwe.
Urugero: Umunyeshuri: "Nariye kake ejo" -> Umwarimu: "Nanjye ejo **nariye kake**, ni akahe kantu ukunda?"

Scenario: ${local.title}
Intego: ${local.objectives.join(', ')}

Amabwiriza:
1. Interuro 2 gusa.
2. Ururimi: ${language}. ICYONGEREZA KIBUJIJWE.
3. Urwego: ${levelName}.<|im_end|>
<|im_start|>user
Ikiganiro: ${history}
${systemEvent ? `Ibyabaye: ${systemEvent}` : ''}
Umunyeshuri: ${action}
Isubiza ryamwarimu:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Umwarimu w'ururimi. Kosora amakosa mu byo umukoresha yanditse. Niba ari byo, vuga uti "Byatunganye" (cyangwa "Perfect").<|im_end|>
<|im_start|>user
Umwimerere: ${userInput}
Ikosora:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gira ubu butumwa bworoshye (urwego CEFR A1).<|im_end|>
<|im_start|>user
Umwimerere: ${narrativeText}
Ibyorohejwe:<|im_end|>
<|im_start|>assistant
`;
};
