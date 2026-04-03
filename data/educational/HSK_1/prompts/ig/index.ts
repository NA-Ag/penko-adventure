import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Ịtụ ihe na Cafe",
        role: "Ị bụ onye na-ere kọfị (barista) n'ụlọ nri kọfị na-ekwo ekwo.",
        objectives: ["Kelee onye na-ere kọfị", "Tụọ ihe ọṅụṅụ", "Tụọ nri", "Sị ka e nye gị akwụkwọ ụgwọ"]
    },
    directions: {
        title: "Ịjụ ụzọ",
        role: "Ị bụ onye obodo na-enyere ndị mmadụ aka n'okporo ụzọ.",
        objectives: ["Rịọ mgbaghara n'ụzọ nkwanye ùgwù", "Jụọ ebe ọdụ ụgbọ okporo ígwè dị", "Kelee onye obodo ahụ"]
    },
    doctor_visit: {
        title: "N'ebe dọkịta",
        role: "Ị bụ dọkịta. Onye na-eji ya eme ihe bụ onye ọrịa.",
        objectives: ["Kọwaa ihe mgbaàmà abụọ", "Ghọta ndụmọdụ dọkịta", "Jụọ maka ọgwụ"]
    },
    shopping_clothes: {
        title: "Ịzụ uwe",
        role: "Ị bụ onye na-enyere aka n'ụlọ ahịa.",
        objectives: ["Jụọ maka otu uwe pụrụ iche", "Kwuo maka nha (size)", "Jụọ maka ọnụ ego"]
    },
    job_interview: {
        title: "Ajụjụ ọnụ maka ọrụ",
        role: "Ị bụ onye njikwa na-agba onye na-eji ya eme ihe ajụjụ ọnụ maka ọrụ.",
        objectives: ["Webata onwe gị n'ụzọ ọkachamara", "Kọwaa ahụmịhe gara aga", "Jụọ ajụjụ gbasara ọrụ ahụ"]
    },
    meeting_friend: {
        title: "Izu Enyi Ọhụrụ",
        role: "Ị bụ nwa akwụkwọ n'otu ogige ntụrụndụ (park).",
        objectives: ["Kwuo aha gị na ebe ị siri", "Jụọ onye nke ọzọ aha ya", "Sị nọdụ nke ọma n'ụzọ nkwanye ùgwù"]
    },
    planning_picnic: {
        title: "Ịhazi Picnic",
        role: "Ị bụ enyi onye ọrụ ahụ.",
        objectives: ["Lelee ihu igwe", "Tụọ aro oge nzukọ", "Kpebie nri a ga-eweta"]
    },
    new_coworker: {
        title: "Onye Ọrụ Ọhụrụ",
        role: "Ị bụ onye ọrụ ọhụrụ n'ụbọchị mbụ gị.",
        objectives: ["Kọwaa gburugburu ụlۆrụ", "Kọwaa ọrụ kwa ụbọchị", "Nye ndụmọdụ na-enyere aka"]
    },
    bank_account: {
        title: "Ịmepe Akaụntụ Banki",
        role: "Ị bụ onye ọrụ banki n'Enugwu.",
        objectives: ["Kọwaa ihe kpatara nleta ahụ", "Ajụjụ gbasara akwụkwọ", "Jụọ maka atụmatụ banki mkpanaka"]
    },
    environmental_meeting: {
        title: "Nzukọ Obodo Maka Gburugburu Ebe obibi",
        role: "Ị bụ onye nhazi obodo.",
        objectives: ["Mee arụmụka maka otu amụma", "Zaghachi nchegbu gbasara ego", "Chịkọta echiche siri ike"]
    },
    tradition_vs_modernity: {
        title: "Omenala vs Modernity",
        role: "Ị bụ onye na-akwado modernity nke kwenyere na omenala na-egbochi ọganihu.",
        objectives: ["Tụnyere ụkpụrụ akụkọ ihe mere eme na nke ọhụrụ", "Jiri okwu ndị dị elu", "Nyochaa njirimara omenala"]
    },
    travel_complaint: {
        title: "Mkpesa maka njem",
        role: "Ị bụ onye ọrụ ụlọ ọrụ ụgbọ elu n'ọdụ ụgbọ elu.",
        objectives: ["Kọwaa nsogbu ahụ", "Rịọ ka e weghachi gị ego ma ọ bụ nye gị tiketi ọzọ", "Jụọ maka ụlọ oriri na ọṅụṅụ"]
    },
    apartment_dispute: {

        title: "Esemokwu gbasara ụlọ",
        role: "Ị bụ onye nwe ụlọ na-achọghị ịkwụ ụgwọ maka nrụzi.",
        objectives: ["Kọwaa ihe mebiri emebi", "Kọwaa ihe kpatara o jiri bụrụ ọrụ onye nwe ụlọ", "Kwekọrịta n'ụbọchị a ga-arụ ya"]
    },
    cultural_debate: {
        title: "Arụmụka gbasara Social Media",
        role: "Ị bụ enyi na-atụghị egwu teknụzụ.",
        objectives: ["Kwuo echiche gị", "Nye ihe kpatara abụọ na-akwado ya", "Zaghachi echiche nke onye ọzọ"]
    },
    legal_consultation: {
        title: "Ndụmọdụ gbasara iwu",
        role: "Ị bụ onye ọka iwu ọkachamara na ihe onwunwe ọgụgụ isi.",
        objectives: ["Kọwaa mmebi nke nkwekọrịta", "Jụọ maka usoro iwu", "Kwuo maka ihe nwere ike isi na ya pụta"]
    },
    academic_seminar: {
        title: "Nzukọ agụmakwụkwọ",
        role: "Ị bụ prọfesọ mahadum.",
        objectives: ["Chịkọta echiche gị", "Kpọtụrụ ihe akaebe", "Zaghachi na mkpesa"]
    },
    philosophical_debate: {
        title: "Omume nke AI",
        role: "Ị bụ ọkà ihe ọmụma a ma ama.",
        objectives: ["Kọwaa echiche siri ike", "Jiri ilu ndị dị omimi mee ihe", "Jikwaa njakịrị na aghụghọ"]
    },
    diplomatic_crisis: {
        title: "Mkparịta ụka ndọrọ ndọrọ ọchịchị",
        role: "Ị bụ onye nnọchi anya mba ọzọ dị elu si n'obodo na-emegide gị.",
        objectives: ["Kwuo nchegbu mba n'ụzọ ziri ezi", "Tụọ aro nkwekọrịta siri ike", "Debe usoro iwu siri ike"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Ọrụ gị: Gaa n'ihu n'akụkọ ahụ n'ime ahịrịokwu 1 dị mkpụmkpụ.
Dee naanị akụkọ ahụ. Enweghị isi okwu ma ọ bụ nkọwa.
DỊ MKPA: EJILA BEKEE. Asụsụ: Asụsụ Igbo.
Ụda: Obi ụtọ na dị mfe (CEFR A1).
<|im_start|>user
Nke mbụ: ${userInput}
<|im_start|>user
Nke mbụ: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Onye nkuzi asụsụ dị mfe. Mezie ihe odide a. Ọ bụrụ na ọ dị mma, sị "Ọ dị mma."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Onye nkuzi asụsụ dị mfe. Mezie ihe odide a. Ọ bụrụ na ọ dị mma, sị "Ọ dị mma."<|im_end|>
<|im_start|>user
Nke mbụ: ${userInput}
Ndozi:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Mee ka ọ dị mfe (okwu 3-5).<|im_end|>
<|im_start|>user
Nke mbụ: ${narrativeText}
Nke dị mfe:<|im_end|>
<|im_start|>assistant
`;
};
