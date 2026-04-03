import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Tordna f'Kafè",
        role: "Inti barista f'kafè mimli nies.",
        objectives: ["Sellmet lill-barista", "Ordna xarba", "Ordna l-ikel", "Staqsi għall-kont"]
    },
    directions: {
        title: "Tistaqsi għat-Triq",
        role: "Inti persuna lokali li tgħin fit-triq.",
        objectives: ["Skuża ruħek b'mod edukat", "Staqsi fejn qiegħda l-istazzjon tal-ferrovija", "Irringrazzja lill-persuna lokali"]
    },
    doctor_visit: {
        title: "Għand it-Tabib",
        role: "Inti tabib. L-utent huwa pazjent.",
        objectives: ["Iddeskrivi żewġ sintomi", "Ifhem il-parir tat-tabib", "Staqsi dwar il-mediċina"]
    },
    shopping_clothes: {
        title: "Tixtri l-Ħwejjeġ",
        role: "Inti assistent tal-ħanut.",
        objectives: ["Staqsi għal oġġett speċifiku", "Iddiskuti d-daqsijiet", "Staqsi dwar il-prezz"]
    },
    job_interview: {
        title: "Intervista għax-Xogħol",
        role: "Inti maniġer tar-reklutaġġ li qed tintervista lill-utent għal xogħol fil-bejgħ.",
        objectives: ["Introduċi lilek innifsek b'mod professjonali", "Iddeskrivi esperjenza passata", "Staqsi mistoqsija dwar ir-rwol"]
    },
    meeting_friend: {
        title: "Tiltaqa' ma' Ħabib Ġdid",
        role: "Inti student f'park.",
        objectives: ["Għid ismek u l-oriġini tiegħek", "Staqsi l-isem tal-persuna l-oħra", "Għid addio b'mod edukat"]
    },
    planning_picnic: {
        title: "Ippjanar ta' Picnic",
        role: "Inti ħabib tal-utent.",
        objectives: ["Iċċekkja t-temp", "Issuġġerixxi ħin għal-laqgħa", "Iddeċiedi liema ikel se ġġib"]
    },
    new_coworker: {
        title: "Kollegi Ġdid",
        role: "Inti impjegat ġdid fl-ewwel ġurnata tiegħek.",
        objectives: ["Iddeskrivi l-ambjent tal-uffiċċju", "Spjega l-kompiti ta' kuljum", "Agħti parir utli"]
    },
    bank_account: {
        title: "Ftuħ ta' Kont Bankarju",
        role: "Inti skrivan tal-bank fil-Belt Valletta.",
        objectives: ["Spjega r-raġuni għaż-żjara", "Staqsi dwar id-dokumenti", "Staqsi dwar il-karatteristiċi tal-mobile banking"]
    },
    environmental_meeting: {
        title: "Laqgħa Komunitarja Ambjentali",
        role: "Inti organizzatur komunitarju.",
        objectives: ["Agħmel argument favur politika speċifika", "Irrispondi għal tħassib dwar l-ispiża", "Agħti sommarju ta' opinjoni kumplessa"]
    },
    tradition_vs_modernity: {
        title: "Tradizzjoni vs Modernità",
        role: "Inti modernista li jemmen li t-tradizzjonijiet ifixklu l-progress.",
        objectives: ["Qabbel il-valuri storiċi u moderni", "Uża idjomi avvanzati", "Analizza l-identità kulturali"]
    },
    travel_complaint: {
        title: "Ilment dwar l-Ivvjaġġar",
        role: "Inti aġent tal-linja tal-ajru fl-ajruport.",
        objectives: ["Spjega l-problema", "Itlob rifużjoni jew prenotazzjoni ġdida", "Staqsi dwar lukanda"]
    },
    apartment_dispute: {
        title: "Tilwima dwar l-Appartament",
        role: "Inti sid il-kera li ma tridx tħallas għat-tiswijiet.",
        objectives: ["Iddeskrivi l-ħsara", "Argummenta għaliex hija r-responsabbiltà tas-sid", "Aqbel fuq data għat-tiswija"]
    },
    cultural_debate: {

        title: "Debattitu dwar il-Midja Soċjali",
        role: "Inti ħabib li huwa xettiku dwar it-teknoloġija.",
        objectives: ["Esprimi opinjoni", "Agħti żewġ raġunijiet ta' appoġġ", "Irrispondi għal punt kuntrarju"]
    },
    legal_consultation: {
        title: "Konsulenza Legali",
        role: "Inti avukat speċjalizzat fil-proprjetà intellettwali.",
        objectives: ["Spjega l-ksur tal-kuntratt", "Staqsi dwar rimedji legali", "Iddiskuti r-riżultati possibbli"]
    },
    academic_seminar: {
        title: "Seminar Akkademiku",
        role: "Inti professur tal-università.",
        objectives: ["Agħmel sommarju tal-pożizzjoni tiegħek", "Ikkwota evidenza ipotetika", "Irrispondi għal kritika"]
    },
    philosophical_debate: {
        title: "Etika tal-AI",
        role: "Inti filosfu famuż.",
        objectives: ["Iddefinixxi kunċett astratt kumpless", "Uża metafori sofistikati", "Immaniġġja l-ironija u n-sfumaturi"]
    },
    diplomatic_crisis: {
        title: "Negozjati Diplomatiċi",
        role: "Inti diplomatiku ta' livell għoli minn nazzjon rivali.",
        objectives: ["Esprimi tħassib nazzjonali b'mod indirett", "Ipproponi kompromess kumpless", "Żomm protokoll formali strett"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Ix-xogħol tiegħek: Kompli l-istorja f'sentenza 1 qasira EŻATT.
Ikteb biss l-istorja. L-ebda headers jew spjegazzjonijiet.
KRITIKU: TUŻAX L-INGLIŻ. Lingwa: Malti.
Ton: Ferħan u sempliċi ħafna (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Sentenza 1:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor tal-lingwa sempliċi. Ikkoreġi l-input. Jekk huwa korrett, għid "Perfett."<|im_end|>
<|im_start|>user
Oriġinali: ${userInput}
Korrezzjoni:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Agħmilha aktar sempliċi (3-5 kelmiet).<|im_end|>
<|im_start|>user
Oriġinali: ${narrativeText}
Semplifikat:<|im_end|>
<|im_start|>assistant
`;
};
