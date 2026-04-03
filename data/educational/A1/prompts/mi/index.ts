import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Te tono kai i tētahi Whare Kai",
        role: "He barista koe i tētahi whare kai pukumahi.",
        objectives: ["Mihi ki te barista", "Tonoa he inu", "Tonoa he kai", "Tonoa te pire"]
    },
    directions: {
        title: "Te pātai ara",
        role: "he tangata nō te rohe koe e āwhina ana i te ara.",
        objectives: ["Whakapāha marie", "Pātai kei hea te teihana tereina", "Whakawhetai ki te tangata nō te rohe"]
    },
    doctor_visit: {
        title: "Kei te tākuta",
        role: "He tākuta koe. He tūroro te kaiwhakamahi.",
        objectives: ["Whakaahuatia kia rua ngā tohu māuiui", "Whakamāramahia te tohutohu a te tākuta", "Pātai mō ngā rongoā"]
    },
    shopping_clothes: {
        title: "Te hoko kākahu",
        role: "He kaiāwhina toa koe.",
        objectives: ["Pātai mō tētahi mea motuhake", "Kōrerotia ngā rahi (size)", "Pātai mō te utu"]
    },
    job_interview: {
        title: "Uiuinga mahi",
        role: "He kaiwhakahaere rongo koe e uiui ana i te kaiwhakamahi mō tētahi mahi.",
        objectives: ["Whakataki i a koe anō i runga i te ngaiotanga", "Whakaahuatia ngā wheako o mua", "Pātai tētahi pātai mō te mahi"]
    },
    meeting_friend: {
        title: "Huinga me tetahi hoa hou",
        role: " He akonga koe i tetahi papa rēhia.",
        objectives: ["Whakahuatia tō ingoa me tō takenga mai", "Uiui i te ingoa o tētahi atu", "Korerotia he poroporoaki whakaute"]
    },
    planning_picnic: {
        title: "Whakamahere Pikiniki",
        role: "He hoa koe no te kaiwhakamahi.",
        objectives: ["Tirohia te huarere", "Whakatakotoria he wa hui", "Whakatauhia he aha te kai hei kawe mai"]
    },
    new_coworker: {
        title: "Hoa Mahi Hou",
        role: "He kaimahi hou koe i tō rā tuatahi.",
        objectives: ["Whakaaturia te taiao tari", "Whakamāramahia nga mahi o ia rā", "Homai he tohutohu whaihua"]
    },
    bank_account: {
        title: "Whakatuwhera Pūkete Peeke",
        role: "He kaituhituhi peeke koe i Kirikiriroa.",
        objectives: ["Whakamāramahia te take o te haerenga", "Uiui mo nga tuhinga", "Uiui mo nga ahuatanga peeke pūkoro"]
    },
    environmental_meeting: {
        title: "Huinga Hapori Taiao",
        role: "He kaiwhakarite hapori koe.",
        objectives: ["Whakatakotoria he tohenga mo tētahi kaupapa here motuhake", "Whakautua nga awangawanga mo te utu", "Whakarāpopototia tētahi tirohanga uaua"]
    },
    tradition_vs_modernity: {
        title: "Tikanga vs Te Ao Hou",
        role: "He tangata ao hou koe e whakapono ana he whakahāwea nga tikanga i te ahunga whakamua.",
        objectives: ["Whakatauritehia nga uara o mua me nga uara o naianei", "Whakamahia nga kīwaha matatau", "Tātaritahia te tuakiri ahurea"]
    },
    travel_complaint: {
        title: "Whakapae haere",
        role: "He kaihoko rererangi koe i te taunga rererangi.",
        objectives: ["Whakamāramahia te raruraru", "Tonoa he utunga hoki, he rāhui hōu rānei", "Pātai mō tētahi hōtēra"]
    },
    apartment_dispute: {
        title: "Tautohetohe whare",
        role: "He tangata whai whare koe e tūpato ana ki te utu mō ngā whakatika.",
        objectives: ["Whakaahuatia te tūkinotanga", "Whakapautohe he aha te take ko te kaiwhai whare te kawenga", "Whakaaetia tētahi rā whakatika"]
    },
    cultural_debate: {
        title: "Tautohetohe paapori",
        role: "He hoa koe e ruarua ana ki te hangarau.",
        objectives: ["Whakapuakina he whakaaro", "Homai kia rua ngā take tautoko", "Whakautua tētahi tohu whakahē"]
    },
    legal_consultation: {
        title: "Whakawhitiwhiti ture",
        role: "He rōia koe e tohunga ana ki ngā rawa hinengaro.",
        objectives: ["Whakamāramahia te takahitanga o te kirimana", "Pātai mō ngā rongoā ture", "Kōrerotia ngā putanga ka taea"]
    },
    academic_seminar: {
        title: "Seminā mātauranga",
        role: "He ahorangi whare wānanga koe.",
        objectives: ["Whakarāpopoto i tō tūnga", "Whakaatuhia ngā taunakitanga whakapae", "Whakautua tētahi tohu whakahē"]
    },
    philosophical_debate: {
        title: "Tikanga o te AI",
        role: "He tohunga whakaaro rongonui koe.",
        objectives: ["Whakatauhia tētahi ariā waitara uaua", "Whakamahia ngā kupu whakarite hohonu", "Whakahaerehia te tawai me ngā tūtohu"]
    },
    diplomatic_crisis: {
        title: "Whakawhitiwhiti kōrero paetukutuku",
        role: "He kaiwhakahaere paetukutuku teitei koe nō tētahi iwi whakataetae.",
        objectives: ["Whakapuakina ngā māharahara ā-iwi i runga i te hāngai kore", "Whakatakotoria he whakaaetanga uaua", "Kia mau ki ngā tikanga kawa tino kaha"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tō mahi: Me haere tonu te kōrero i roto i te rerenga kōrero poto 1 anake.
Tuhia te kōrero anake. Kaua he upoko, he whakamārama rānei.
KAUA E WHAKAMAHI I TE REO INGARIHI. Reo: Māori.
Wairua: Harikoa, māmā hoki (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Rerenga kōrero 1:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Kaiako reo māmā. Whakatikahia te tāpiritanga. Ki te tika, kī mai "He pai."<|im_end|>
<|im_start|>user
Taketake: ${userInput}
Whakatikahia:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Whakamāmātia (3-5 kupu).<|im_end|>
<|im_start|>user
Taketake: ${narrativeText}
Whakamāmātia:<|im_end|>
<|im_start|>assistant
`;
};
