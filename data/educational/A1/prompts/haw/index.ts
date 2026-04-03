import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Hoʻonohonoho i ka hale kope",
        role: "He barista ʻoe ma kahi hale kope paʻahana.",
        objectives: ["E aloha i ka barista", "E kauoha i mea inu", "E kauoha i meaʻai", "E noi i ka pila"]
    },
    directions: {
        title: "Nīnau i ke ala",
        role: "He kamaʻāina kōkua ʻoe ma ke alanui.",
        objectives: ["E noi i ke kala me ke akahai", "E nīnau i kahi o ke kahua kaʻaahi", "E hoʻomaikaʻi i ke kamaʻāina"]
    },
    doctor_visit: {
        title: "I ke kauka",
        role: "He kauka ʻoe. He mea maʻi ka mea hoʻohana.",
        objectives: ["E wehewehe i ʻelua mau hōʻailona", "E hoʻomaopopo i ka ʻōlelo a ke kauka", "E nīnau e pili ana i ka lāʻau"]
    },
    shopping_clothes: {
        title: "Kūʻai lole",
        role: "He kōkua hale kūʻai ʻoe.",
        objectives: ["E nīnau no kekahi mea kikoʻī", "E kūkākūkā i nā nui lole", "E nīnau no ke kumu kūʻai"]
    },
    job_interview: {
        title: "Nīnauele Hana",
        role: "He luna hoʻolimalima ʻoe e nīnauele ana i ka mea hoʻohana no kekahi hana kūʻai.",
        objectives: ["E hoʻolauna iā ʻoe iho me ka mākaukau", "E wehewehe i ka ʻike mua", "E nīnau i kekahi nīnau e pili ana i ka hana"]
    },
    meeting_friend: {
        title: "Hālāwai me kahi hoa hou",
        role: "He haumāna ʻoe ma kahi pāka.",
        objectives: ["E haʻi i kou inoa a me kou wahi kumu", "E nīnau i ka inoa o kēlā mea", "E haʻi i ke aloha me ke akahai"]
    },
    planning_picnic: {
        title: "Hoʻolālā i ka Pikiniki",
        role: "He hoa aloha ʻoe no ka mea hoʻohana.",
        objectives: ["E nānā i ke aniau", "E hāpai i kahi manawa hālāwai", "E hoʻoholo i ka meaʻai e lawe mai ai"]
    },
    new_coworker: {
        title: "Hoa Hana Hou",
        role: "He limahana hou ʻoe ma kou lā mua.",
        objectives: ["E wehewehe i ke kaiapuni keʻena", "E wehewehe i nā hana o kēlā me kēia lā", "E hāʻawi i kahi kōkua"]
    },
    bank_account: {
        title: "Wehe i kahi Waihona Panakō",
        role: "He kākau ʻōለlo panakō ʻoe ma Honolulu.",
        objectives: ["E wehewehe i ke kumu o ka makaʻikaʻi", "E nīnau e pili ana i nā palapala", "E nīnau e pili ana i nā hiʻohiʻona panakō kelepona"]
    },
    environmental_meeting: {
        title: "Hālāwai Kaiaulu Kaiapuni",
        role: "He mea hoʻonohonoho kaiaulu ʻoe.",
        objectives: ["E hāpai i kahi manaʻo no kekahi kulekele", "E pane i nā hopohopo no ke kumu kūʻai", "E hōʻuluʻulu i kahi manaʻo paʻakikī"]
    },
    tradition_vs_modernity: {
        title: "Loina vs Kūlana Hou",
        role: "He mea manaʻo hou ʻoe e manaʻo ana he keʻakeʻa ka loina i ka holomua.",
        objectives: ["E hoʻohālikelike i nā loina kahiko a me nā loina hou", "E hoʻohana i nā ʻōlelo noʻeau hohonu", "E kālailai i ka ʻike moʻomeheu"]
    },
    travel_complaint: {
        title: "Hoʻopiʻi Huakaʻi",
        role: "He ʻelele mokulele ʻoe ma ke kahua mokulele.",
        objectives: ["E wehewehe i ka pilikia", "E noi i ka hoʻihoʻi kālā a i ʻole ke kākau hou ʻana", "E nīnau e pili ana i kahi hōtel"]
    },
    apartment_dispute: {
        title: "Hoʻopaʻapaʻa Noho Hale",
        role: "He konohiki ʻoe e hōʻole ana e uku no nā hoʻoponopono.",
        objectives: ["E wehewehe i ka pōʻino", "E hoʻopaʻapaʻa no ke kumu o ke kuleana o ke konohiki", "E ʻae i ka lā hoʻoponopono"]
    },
    cultural_debate: {
        title: "Hoʻopaʻapaʻa Pūnaewele",
        role: "He hoa aloha ʻoe e kānalua ana i ka ʻenehana.",
        objectives: ["E hōʻike i kahi manaʻo", "E hāʻawi i ʻelua mau kumu kākoʻo", "E pane i kekahi manaʻo kūʻē"]
    },
    legal_consultation: {
        title: "Kūkākūkā Kanāwai",
        role: "He loio ʻoe i mākaukau i ka waiwai noʻonoʻo.",
        objectives: ["E wehewehe i ke kānāwai i uhaki ʻia", "E nīnau no nā hoʻoponopono kānāwai", "E kūkākūkā i nā hopena"]
    },
    academic_seminar: {
        title: "Semina Kulanui",
        role: "He polopeka kulanui ʻoe.",
        objectives: ["E hōʻuluʻulu i kou kūlana", "E haʻi i nā hōʻike kuhiakau", "E pane i kahi manaʻo koʻikoʻi"]
    },
    philosophical_debate: {
        title: "AI a me ka Pono",
        role: "He loea noʻonoʻo kaulana ʻoe.",
        objectives: ["E wehewehe i kahi manaʻo paʻakikī", "E hoʻohana i nā ʻōlelo hoʻohālikelike", "E lawelawe i ka گا گا a me nā mea kikoʻī"]
    },
    diplomatic_crisis: {
        title: "Kūkākūkā Pilina ʻĀina",
        role: "He ʻelele aupuni kiʻekiʻe ʻoe mai kahi ʻāina hoa paio.",
        objectives: ["E hōʻike i nā hopohopo aupuni", "E hāpai i kahi kuʻikahi paʻakikī", "E mālama i ka loina aupuni koʻikoʻi"]
    }
};

/**
 * HAW Educational Narrative Prompt
 */

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Kāu hana: E hoʻomau i ka moʻolelo ma hoʻokahi hopunaʻōlelo pōkole wale nō.
E kākau i ka moʻolelo wale nō. ʻAʻohe poʻo inoa a wehewehe paha.
KOʻIKOʻI: MAI HOʻOHANA I KA ʻŌLELO PELEKANE. ʻŌlelo: ʻŌlelo Hawaiʻi.
Kaila: Hauʻoli a maʻalahi loa (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Hopunaʻōlelo 1:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
He kumu aʻo ʻōlelo maʻalahi. E hoʻopololei i ka mea i kākau ʻia. Inā pololei, e ʻōlelo "Maikaʻi loa."<|im_end|>
<|im_start|>user
Kumu: ${userInput}
Hoʻopololei:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
E hana i mea maʻalahi (3-5 mau huaʻōlelo).<|im_end|>
<|im_start|>user
Kumu: ${narrativeText}
Maʻalahi:<|im_end|>
<|im_start|>assistant
`;
};
