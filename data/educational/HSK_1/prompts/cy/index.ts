import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Archebu mewn Caffi",
        role: "Barista wyt ti mewn caffi prysur.",
        objectives: ["Cyfarch y barista", "Archebu diod", "Archebu bwyd", "Gofyn am y bil"]
    },
    directions: {
        title: "Gofyn am Gyfarwyddiadau",
        role: "Rwyt ti'n berson lleol cymorthgar ar y stryd.",
        objectives: ["Ymddiheuro'n gwrtais", "Gofyn ble mae'r orsaf drenau", "Diolch i'r person lleol"]
    },
    doctor_visit: {
        title: "At y Meddyg",
        role: "Meddyg wyt ti. Mae'r defnyddiwr yn glaf.",
        objectives: ["Disgrifio dau symptom", "Deall cyngor y meddyg", "Gofyn am feddyginiaeth"]
    },
    shopping_clothes: {
        title: "Siopa Dillad",
        role: "Cynorthwyydd siop wyt ti.",
        objectives: ["Gofyn am eitem benodol", "Trafod meintiau", "Gofyn am y pris"]
    },
    job_interview: {
        title: "Cyfweliad Swydd",
        role: "Rheolwr hurio wyt ti sy'n cyfweld â'r defnyddiwr ar gyfer swydd adwerthu.",
        objectives: ["Cyflwynwch eich hun yn broffesiynol", "Disgrifiwch brofiad blaenorol", "Gofynnwch gwestiwn am y rôl"]
    },
    meeting_friend: {
        title: "Cwrdd â Chyfaill Newydd",
        role: "Myfyriwr mewn parc wyt ti.",
        objectives: ["Nodwch eich enw a'ch tarddiad", "Gofynnwch am enw'r person arall", "Dywedwch ffarwel yn gwrtais"]
    },
    planning_picnic: {
        title: "Cynllunio Picnic",
        role: "Ffrind i'r defnyddiwr wyt ti.",
        objectives: ["Gwiriwch y tywydd", "Awgrymwch amser i gwrdd", "Penderfynwch pa fwyd i'w ddod"]
    },
    new_coworker: {
        title: "Cydweithiwr Newydd",
        role: "Gweithiwr newydd ar dy ddiwrnod cyntaf wyt ti.",
        objectives: ["Disgrifiwch amgylchedd y swyddfa", "Esboniwch dasgau dyddiol", "Rhowch gyngor defnyddiol"]
    },
    bank_account: {
        title: "Agor Cyfrif Banc",
        role: "Clerc banc yng Nghaerdydd wyt ti.",
        objectives: ["Esboniwch y rheswm dros yr ymweliad", "Holwch am ddogfennau", "Gofynnwch am nodweddion bancio symudol"]
    },
    environmental_meeting: {
        title: "Cyfarfod Cymunedol Amgylcheddol",
        role: "Trefnydd cymunedol wyt ti.",
        objectives: ["Dadlewch dros bolisi penodol", "Ymatebwch i bryderon am gost", "Crynhowch safbwynt cymhleth"]
    },
    tradition_vs_modernity: {
        title: "Traddodiad vs Moderneiddio",
        role: "Moderneiddiwr wyt ti sy'n credu bod traddodiadau'n rhwystro cynnydd.",
        objectives: ["Cymharwch werthoedd hanesyddol a modern", "Defnyddiwch idiomau uwch", "Dadansoddwch hunaniaeth ddiwylliannol"]
    },
    travel_complaint: {

        title: "Cwyn Teithio",
        role: "Asiant cwmni hedfan wyt ti yn y maes awyr.",
        objectives: ["Esbonio'r broblem", "Gofyn am adrefund neu ail-archebu", "Holi am westy"]
    },
    apartment_dispute: {
        title: "Anghydfod Fflat",
        role: "Landlord wyt ti sy'n amdráth i dalu am atgyweiriadau.",
        objectives: ["Disgrifio'r difrod", "Dadleu pam mai cyfrifoldeb y landlord ydyw", "Cytuno ar ddyddiad atgyweirio"]
    },
    cultural_debate: {
        title: "Dadl Cyfryngau Cymdeithasol",
        role: "Ffrind sy'n amheus o dechnoleg wyt ti.",
        objectives: ["Datgan barn", "Darparu dau reswm cefnogol", "Gwrth-ddadl i bwynt penodol"]
    },
    legal_consultation: {
        title: "Ymgynghoriad Cyfreithiol",
        role: "Cyfreithiwr sy'n arbenigo mewn eiddo deallusol wyt ti.",
        objectives: ["Esbonio torri contract", "Holi am rwymedi cyfreithiol", "Trafod canlyniadau posibl"]
    },
    academic_seminar: {
        title: "Seminar Academaidd",
        role: "Athro prifysgol wyt ti.",
        objectives: ["Crynhoi eich safle", "Dyfynnu tystiolaeth ddamcaniaethol", "Ymateb i bwynt beirniadol"]
    },
    philosophical_debate: {
        title: "Moeseg AI",
        role: "Athronydd byd-enwog wyt ti.",
        objectives: ["Diffinio cysyniad haniaethol cymhleth", "Defnyddio trosiadau soffistigedig", "Trin eironi a naws"]
    },
    diplomatic_crisis: {
        title: "Negodi Diplomyddol",
        role: "Diplomydd lefel uchel o genedl sy'n cystadlu wyt ti.",
        objectives: ["Mynegi pryderon cenedlaethol yn anuniongyrchol", "Cynnig cyfaddawd cymhleth", "Cynnal protocol ffurfiol llym"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Eich tasg: Parhewch â'r stori mewn union 1 frawddeg fer.
Ysgrifennwch y stori yn unig. Dim penawdau na hesboniadau.
TYNGEDFOL: PEIDIWCH Â DEFNYDDIO SAESNEG. Iaith: Cymraeg.
Tôn: Llawen a syml iawn (CEFR A1).
Enghraifft:
Stori hyd yma: Mae hi'n bwrw glaw ar y stryd.
Gweithred y chwaraewr: Edrychaf o'm cwmpas.
<|im_start|>user
Gwreiddiol: ${userInput}
<|im_start|>user
Gwreiddiol: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 frawddeg:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tiwtor iaith syml. Cywirwch y mewnbwn. Os yw'n iawn, dywedwch "Perffaith."<|im_end|>
<|im_start|>user
Gwreiddiol: ${userInput}
Cywiriad:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gwnewch hi'n symlach (3-5 gair).<|im_end|>
<|im_start|>user
Gwreiddiol: ${narrativeText}
Symledig:<|im_end|>
<|im_start|>assistant
`;
};
