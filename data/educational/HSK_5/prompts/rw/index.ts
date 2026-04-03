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
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Inshingano yawe: Komeza inkuru mu nteruro zitarenze 2.
Ntukakoreshe imitwe y'ibigambo, imiterere ya markdown, cyangwa andi magambo adakenewe. Andika inkuru ubwayo gusa.
Buri gihe shyiramo ibyo umukinnyi akoze n'ibyabaye mu buryo bwa sisitemu.
Ururimi: Ikinyarwanda.
Imiterere: Isobanura kandi yinjiza mu nkuru.
Urugero:
Inkuru kugeza ubu: Imvura iri kugwa mu muhanda.
Icyo umukinnyi akoze: nditegereza hirya no hino.
Kosora ibyanditswe. Niba ari byo, vuga gusa uti "Ni byiza cyane."
<|im_start|>user
Umwimerere: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Komeza inkuru:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Umwarimu w'ururimi ufasha.
Kosora ibyanditswe. Niba ari byo, vuga gusa uti "Ni byiza cyane."
Sobanura amakosa muri make mu Kinyarwanda.<|im_end|>
<|im_start|>user
Umwimerere: ${userInput}
Ikosora:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Andika mu buryo bworoshye kurushaho (CEFR A1).<|im_end|>
<|im_start|>user
Umwimerere: ${narrativeText}
Ibyorohejwe:<|im_end|>
<|im_start|>assistant
`;
};
