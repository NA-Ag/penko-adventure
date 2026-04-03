import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Yamirde e kafe",
        role: "Aan woni b barista e nder kafe heewɗo yimɓe.",
        objectives: ["Salmin barista oo", "Yamiru njaram", "Yamiru nguure", "Yamiru konte oo"]
    },
    directions: {
        title: "Yamirde laawol",
        role: "Aan woni neɗɗo nokku oo mballoowo e laawol he.",
        objectives: ["Yaafno e neesu", "Yamiru ɗo gare werlaa oo woni", "Yetto neɗɗo nokku oo"]
    },
    doctor_visit: {
        title: "To lokotoro",
        role: "Aan woni lokotoro. Kuutoroowo oo ko ñawɗo.",
        objectives: ["Siftu maandeeji ñawu ɗiɗi", "Faamu wasiyaaji lokotoro oo", "Yamiru ko fayti e leɗɗe"]
    },
    shopping_clothes: {
        title: "Soodeede comci",
        role: "Aan woni mballoowo e nder yeeyirdu.",
        objectives: ["Yamiru huunde heertinde", "Yewtu ko fayti e mawnudiiji", "Yamiru njaru oo"]
    },
    job_interview: {
        title: "Yeewtere golle",
        role: "Aan woni kalfinaaɗo gollotooɓe fof e nder yeeyirdu.",
        objectives: ["Anndin hoore maa e neesu", "Siftu humpito maa gollal", "Yamiru kadi ko fayti e darnde ndee"]
    },
    meeting_friend: {
        title: "Gofɗe e sehilaajo keso",
        role: "Aan woni janngowo e nder dingiral (park).",
        objectives: ["Innira innde maa e ɗo njey-ɗaa", "Landa neɗɗo oo innde mum", "Wiyu mbeɗa yaha e laawol belngol"]
    },
    planning_picnic: {
        title: "Pewnugol pijirlo",
        role: "Aan woni sehilaajo neɗɗo oo.",
        objectives: ["Ƴeew weeyo ngo", "Hollu sa'aa gofɗe", "Ƴeew ko nyanneye njarataa"]
    },
    new_coworker: {
        title: "Gollidiiɗo keso",
        role: "Aan woni gollidiiɗo keso e nyannde maa adannde.",
        objectives: ["Limtu mbeeyu biro oo", "Faamin golle nyannde kala", "Hollu miijo balloowo"]
    },
    bank_account: {
        title: "Uddugol konte banke",
        role: "Aan woni gollowo banke e nder Dakar.",
        objectives: ["Hollu sabaabu yaadu maa", "Landa kayeoji potɗi", "Landa ko fayti e banke e dow cinndel"]
    },
    environmental_meeting: {
        title: "Potal renndo ko fayti e weeyo",
        role: "Aan woni gardiiɗo renndo oo.",
        objectives: ["Hollu sabaabu dawol gootol", "Jaabo ko fayti e njaruuji", "Hollu miijo lugguɗo"]
    },
    tradition_vs_modernity: {
        title: "Aadaaji e Jamano",
        role: "Aan woni neɗɗo jamano mo yaadaani e aadaaji.",
        objectives: ["Ƴeew ko woni hakkunde aadaaji e jamano", "Huutoro kelme lugguɗe", "Ƴeew ko woni wonndere maa"]
    },
    travel_complaint: {
        title: "Wullaango njahdi",
        role: "Aan woni golloowo e piirowal to simmeere.",
        objectives: ["Fasiru caɗeele ɗee", "Yamiru njobdi maa walla biskit njahdi keso", "Yamiru ko fayti e otel"]
    },
    apartment_dispute: {
        title: "Luural suudu",
        role: "Aan woni joom suudu mo yiɗaa yoɓde peewnugol.",
        objectives: ["Siftu ko boni koo", "Haalan ko waɗi peewnugol ngol woni e dow joom suudu", "Nanondiru ñalngu peewnugol"]
    },
    cultural_debate: {
        title: "Yewtere jaayndeeji renndo",
        role: "Aan woni sehil mo hoolaaki karallaagal (tech).",
        objectives: ["Hollu miijo maa", "Siftu dalillaaji ɗiɗi", "Habtu e miijo sehil maa"]
    },
    legal_consultation: {
        title: "Wasiya sariya",
        role: "Aan woni awoka kalfinaaɗo sariyaaji jeyi.",
        objectives: ["Fasiru ko meha e nanondiral he", "Yamiru ko sariya haali", "Yewtu ko waawi jibinde koo"]
    },
    academic_seminar: {
        title: "Yeewtere janngirde",
        role: "Aan woni porfeseer duɗal jaaɓi-haatimeere.",
        objectives: ["Siftu miijo maa e raɓɓere", "Siftu dalillaaji wonɗi", "Jaabo e miijo sehil maa"]
    },
    philosophical_debate: {
        title: "Gollal AI",
        role: "Aan woni ganndo lolluɗo.",
        objectives: ["Fasiru miijo luggu", "Huutoro misaluuji lugguɗi", "Yewtu e kadi e nulaaji"]
    },
    diplomatic_crisis: {
        title: "Yewtere dipolomasi",
        role: "Aan woni dipolomaat mawɗo ummoriiɗo e leydi wonndi.",
        objectives: ["Hollu kulhuli leydi maa e laawol laaɓngol", "Dokku nanondiral luggungal", "Jogito e neesu laamu nguu"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Kuugal maa: Jokku haala kaa e nder bolle gootel tan.
Winndu tan ko woni haala kaa. Wata naftir tiitooɗe walla fasiraaji.
GURE: WATA NAFTIR ENGELEERE. Ɗemngal: Fulfulde.
Golle: Weltaare e ko weeɓi (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Anndinoowo ɗemngal weeɓungol. Feewnu ko winndaa koo. So ina feewi, mbi'a "Ina feewi."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Anndinoowo ɗemngal weeɓungol. Feewnu ko winndaa koo. So ina feewi, mbi'a "Ina feewi."<|im_end|>
<|im_start|>user
Ko winndaa: ${userInput}
Peewnugol:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Weeɓtu ɗum haa heewa (konngudi 3-5).<|im_end|>
<|im_start|>user
Ko winndaa: ${userInput}
Weeɓtugol:<|im_end|>
<|im_start|>assistant
`;
};
