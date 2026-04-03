import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kọfí bá hooghan",
        role: "Kọfí áyiilaaígíí nílį́.",
        objectives: ["Yáʼátʼééh nisin", "Kọfí nínízin", "Chʼiyáán nínízin", "Béeso bee íʼdiilyéél"]
    },
    directions: {
        title: "Atiin binídíkid",
        role: "Diné tʼáá ákogi átʼéii atiin tʼą́ą́ʼ nílį́.",
        objectives: ["Ahéheeʼ nínízin", "Koní bee naʼałkid", "Diné baa ahééh nízin"]
    },
    doctor_visit: {
        title: "Azeeʼíiłʼíní",
        role: "Azeeʼíiłʼíní nílį́.",
        objectives: ["Naałniih bikʼehgo haadzííh", "Azeeʼíiłʼíní tʼáá ákogi átʼéii", "Azeeʼ bił hózhǫ́"]
    },
    shopping_clothes: {
        title: "Ééʼ nayiiłniiʼ",
        role: "Naalyéhé yá sidáhí nílį́.",
        objectives: ["Ééʼ nínízin", "Ééʼ áłtsʼíísígi", "Béeso bikʼé"]
    },
    job_interview: {
        title: "Naanish baa haneʼ",
        role: "Naanish yaa sidáhí nílį́.",
        objectives: ["Ádahodilzhish", "Naanish bee hasih", "Naanish baa naʼídíkid"]
    },
    meeting_friend: {
        title: "Kʼé náhásdliìʼ",
        role: "Ółtaʼí nílį́.",
        objectives: ["Nizhónígo ádahodilzhish", "Diné bizaad", "Hágoshíí"]
    },
    planning_picnic: {
        title: "Chʼiyáán bee ałchʼįʼ nahadlá",
        role: "Akʼis nílį́.",
        objectives: ["Níłtsą́ bił hózhǫ́", "Ahééh", "Chʼiyáán"]
    },
    new_coworker: {
        title: "Naanish tʼáá ániidígíí",
        role: "Naanish tʼáá ániidígíí nílį́.",
        objectives: ["Naanish", "Naanish tʼáá ákogo", "Haneʼ"]
    },
    bank_account: {
        title: "Béeso bá hooghan",
        role: "Béeso yá sidáhí nílį́.",
        objectives: ["Béeso", "Naaltsoos", "Béeso bił hózhǫ́"]
    },
    environmental_meeting: {
        title: "Kéyah baa áháyą́",
        role: "Diné yá sidáhí nílį́.",
        objectives: ["Kéyah", "Béeso", "Haneʼ"]
    },
    tradition_vs_modernity: {
        title: "Kʼé dóó iiná",
        role: "Diné tʼáá ániidígíí nílį́.",
        objectives: ["Kʼé", "Saad", "Iiná"]
    },
    travel_complaint: {
        title: "Chidi naatʼaʼí",
        role: "Chidi naatʼaʼí yá sidáhí nílį́.",
        objectives: ["Haneʼ", "Béeso", "Kin bá hooghan"]
    },
    apartment_dispute: {
        title: "Kin bá hooghan",
        role: "Kin yá sidáhí nílį́.",
        objectives: ["Kin", "Béeso", "Ahééh"]
    },
    cultural_debate: {
        title: "Diné bizaad",
        role: "Akʼis nílį́.",
        objectives: ["Haneʼ", "Saad", "Ahééh"]
    },
    legal_consultation: {
        title: "Bee hazʼáanii",
        role: "Bee hazʼáanii yá sidáhí nílį́.",
        objectives: ["Bee hazʼáanii", "Haneʼ", "Ahééh"]
    },
    academic_seminar: {
        title: "Ółtaʼ",
        role: "Báʼóltaʼí nílį́.",
        objectives: ["Ółtaʼ", "Haneʼ", "Ahééh"]
    },
    philosophical_debate: {
        title: "Iiná",
        role: "Diné nílį́.",
        objectives: ["Iiná", "Saad", "Ahééh"]
    },
    diplomatic_crisis: {
        title: "Kéyah",
        role: "Diné yá sidáhí nílį́.",
        objectives: ["Kéyah", "Haneʼ", "Ahééh"]
    }
};

/**
 * NV Educational Narrative Prompt
 */

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Ni 'Penko' nilį́, GM bá ${theme}.
Naanish: Haneʼ tʼáá łáaʼii doodago naaki saad bee yitʼihígo náás yíníłtiʼ.
Naanéé yee áánííłígíí dóó system events bił ałtah áshłééh.
TʼÁÁ ÍÍYISÍÍ: BILAGÁANA BIZAAD ÁDIN. Tʼáá Diné bizaad bee haadzííh.
Tone: Nizhónígo naaltsoos bikʼeʼashchíigo.
Kʼad:
Haneʼ kʼad: Nahałtin atiin bikáaʼgi.
Naanéé yee áánííł: Hoshxaał.
<|im_start|>user
Átséedi: ${userInput}
<|im_start|>user
Átséedi: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Haneʼ náás:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Saad naʼnitiní. Yíníłchxǫǫhgo hashtʼeʼ niníł. Tʼáá ákogi átʼéego, "Perfect" dííniid.<|im_end|>
<|im_start|>user
Átséedi: ${userInput}
Hashtʼeʼ:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Tʼáá ádinígo áshłééh (CEFR A1).<|im_end|>
<|im_start|>user
Átséedi: ${narrativeText}
Tʼáá ádinígo:<|im_end|>
<|im_start|>assistant
`;
};
