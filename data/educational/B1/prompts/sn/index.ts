import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kuraira paCafe",
        role: "Uri barista pacafe yakabatikana.",
        objectives: ["Kwazisa barista", "Odha chinwiwa", "Odha chikafu", "Kumbira bhiri"]
    },
    directions: {
        title: "Kubvunza Nzira",
        role: "Uri munhu wemuno anobatsira mumugwagwa.",
        objectives: ["Kumbira ruregerero zvine unhu", "Bvunza kuti chiteshi chechitima chiri kupi", "Tenda munhu wemuno"]
    },
    doctor_visit: {
        title: "Kuna Chiremba",
        role: "Uri chiremba. Mushandisi murwere.",
        objectives: ["Tsanhangudza zviratidzo zviviri", "Nzwisisa zano rachiremba", "Bvunza nezvemishonga"]
    },
    shopping_clothes: {
        title: "Kutenga Hembe",
        role: "Uri mubatsiri wemuchitoro.",
        objectives: ["Bvunza hembe yakati sandara", "Kurukura nezvesaizi", "Bvunza mutengo"]
    },
    job_interview: {
        title: "Bvunzurudzo yeBasa",
        role: "Uri maneja ari kubvunzurudza mushandisi basa.",
        objectives: ["Zvizivise zvine unhu", "Tsanhangudza ruzivo rwekare", "Bvunza mubvunzo nezvebasa"]
    },
    meeting_friend: {
        title: "Kusangana neshamwari itsva",
        role: "Uri mudzidzi mupaki.",
        objectives: ["Taura zita rako kwanakabva", "Bvunza mumwe munhu zita rake", "Taura uonei neruremekedzo"]
    },
    planning_picnic: {
        title: "Kuronga pikiniki",
        role: "Uri shamwari yemushandisi.",
        objectives: ["Check mamiriro ekunze", "Kurudzira nguva yekusangana", "Sarudza kuti ndechipi chikafu chekuuya nacho"]
    },
    new_coworker: {
        title: "Mushandi mutsva",
        role: "Uri mushandi mutsva pazuva rako rekutanga.",
        objectives: ["Tsangura mamiriro eofisi", "Tsangura mabasa ezuva nezuva", "Ipai zano rinobatsira"]
    },
    bank_account: {
        title: "Kuvhura akaunti yebhengi",
        role: "Uri mushandi webhengi muHarare.",
        objectives: ["Tsangura chikonzero chekushanya", "Bvunza nezvemagwaro", "Bvunza nezve maficha ebhengi pafoni"]
    },
    environmental_meeting: {
        title: "Musangano wenharaunda wezvemamiriro ekunze",
        role: "Uri murongi wenharaunda.",
        objectives: ["Ita nharo yezano rimwe chete", "Pindura kune zvinonetsa nezvemutengo", "Pfupisa maonero akaoma"]
    },
    tradition_vs_modernity: {
        title: "Tsika vs Modernity",
        role: "Uri munhu anofarira zvinhu zvemazuva ano anotenda kuti tsika dzinodzivisa kufambira mberi.",
        objectives: ["Enzanisa tsika dzekare nedzemazuva ano", "Shandisa mazwi emhando yepamusoro", "Ongorora kuzivikanwa kwetsika"]
    },
    travel_complaint: {
        title: "Chichemo cheRwendo",
        role: "Uri mushandi wepanhandare yendege.",
        objectives: ["Tsanhangudza dambudziko", "Kumbira kudzorerwa mari kana kuchinja zuva", "Bvunza nezvehotera"]
    },
    apartment_dispute: {
        title: "Gakava reImba",
        role: "Uri muchengeti weimba asingadi kubhadhara kugadzirisa zvinhu.",
        objectives: ["Tsanhangudza zvakakuvara", "Taura chikonzero nei riri basa ramuchengeti weimba", "Wiriranai zuva rekugadzirisa"]
    },
    cultural_debate: {
        title: "Gakava reSocial Media",
        role: "Uri shamwari isinganyanyi kuvimba netechnology.",
        objectives: ["Taura maonero ako", "Pa zvikonzero zviviri zvinotsigira", "Pindura pfungwa inopikisa"]
    },
    legal_consultation: {
        title: "Mazano eZvemutemo",
        role: "Uri gweta rinoziva nezve intellectual property.",
        objectives: ["Tsanhangudza kutyora chibvumirano", "Bvunza nezvemagadzirisirwo emhosva", "Kurukura zvinogona kubuda"]
    },
    academic_seminar: {
        title: "Semina yeZvidzidzo",
        role: "Uri purofesa wepayunivhesiti.",
        objectives: ["Pfupisa maonero ako", "Shandisa humbowo hwekufungidzira", "Pindura kushorwa"]
    },
    philosophical_debate: {
        title: "Tsika dzeAI",
        role: "Uri muzvinapfungwa ane mukurumbira.",
        objectives: ["Tsanhangudza pfungwa yakaoma", "Shandisa mifananidzo yakadzama", "Bata kuseka nekupfava"]
    },
    diplomatic_crisis: {
        title: "Hurukuro dzeDiplomacy",
        role: "Uri mumiriri wepamusoro anobva kunyika inokwikwidza.",
        objectives: ["Taura zvichemo zvenyika nenzira isina kunanga", "Kurudzira kuwirirana kwakaoma", "Chengetedza tsika dzebasa dzakaoma"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Basa rako: Enderera mberi nenyaya mumitsara isingadariki 2.
Usashandisa misoro yenyaya, markdown format, kana kutaura kweparutivi. Nyora nyaya yacho pachayo chete.
Nguva dzose sanganisira zvaitwa nemutambi nezviitiko zvehurongwa.
Mutauro: Shona.
Maitiro: Anotsanangura uye anonyudza mune zviri kuitika.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Enderera mberi nenyaya:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mudzidzisi wemutauro anobatsira.
Gadzirisa zvanyorwa. Kana zviri izvo, iti "Zvakanaka kwazvo" chete.
Tsanangura zvikanganiso muchidimbu muchishandisa Shona.<|im_end|>
<|im_start|>user
Zvekutanga: ${userInput}
Kugadzirisa:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Nyora nenzira iri nyore (CEFR A1).<|im_end|>
<|im_start|>user
Zvekutanga: ${narrativeText}
Kugadzirisa:<|im_end|>
<|im_start|>assistant
`;
};
