import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Pöntun á kaffihúsi",
        role: "Þú ert kaffibarþjónn á fjölförnu kaffihúsi.",
        objectives: ["Heilsa kaffibarþjóninum", "Panta drykk", "Panta mat", "Biðja um reikninginn"]
    },
    directions: {
        title: "Spyrja til vegar",
        role: "Þú ert hjálpsamur heimamaður á götunni.",
        objectives: ["Afruka sig kurteislega", "Spyrja hvar lestarstöðin er", "Þakka heimamanninum"]
    },
    doctor_visit: {
        title: "Hjá lækninum",
        role: "Þú ert læknir. Notandinn er sjúklingur.",
        objectives: ["Lýsa tveimur einkennum", "Skilja ráðleggingar læknisins", "Spyrja um lyf"]
    },
    shopping_clothes: {
        title: "Fataverslun",
        role: "Þú ert afgreiðslumaður í verslun.",
        objectives: ["Biðja um ákveðna vöru", "Ræða stærðir", "Spyrja um verðið"]
    },
    job_interview: {
        title: "Atvinnuviðtal",
        role: "Þú ert ráðningarstjóri sem tekur viðtal við notandann fyrir starf í smásölu.",
        objectives: ["Kynntu þig á faglegan hátt", "Lýstu fyrri reynslu", "Spyrðu spurningu um hlutverkið"]
    },
    meeting_friend: {
        title: "Hitta nýjan vin",
        role: "Þú ert nemandi í garði.",
        objectives: ["Segðu nafn þitt og uppruna", "Spyrðu hina manneskjuna um nafn hennar", "Segðu kurteislega bless"]
    },
    planning_picnic: {
        title: "Skipuleggja lautarferð",
        role: "Þú ert vinur notandans.",
        objectives: ["Athugaðu veðrið", "Leggðu til tíma fyrir fundinn", "Ákveddu hvaða mat á að koma með"]
    },
    new_coworker: {
        title: "Nýr samstarfsmaður",
        role: "Þú ert nýr starfsmaður á þínum fyrsta degi.",
        objectives: ["Lýstu skrifstofuumhverfinu", "Útskýrðu dagleg verkefni", "Gefðu gagnlegt ráð"]
    },
    bank_account: {
        title: "Opna bankareikning",
        role: "Þú ert bankastarfsmaður í Reykjavík.",
        objectives: ["Útskýrðu ástæðu heimsóknarinnar", "Spyrðu um skjöl", "Spyrðu um eiginleika farsímabanka"]
    },
    environmental_meeting: {
        title: "Umhverfisfundur í samfélaginu",
        role: "Þú ert skipuleggjandi samfélagsins.",
        objectives: ["Færðu rök fyrir tiltekinni stefnu", "Svaraðu áhyggjum af kostnaði", "Samantekt á flóknu sjónarmiði"]
    },
    tradition_vs_modernity: {
        title: "Hefð gegn nútíma",
        role: "Þú ert nútímasinni sem telur að hefðir hindri framfarir.",
        objectives: ["Berðu saman söguleg og nútímaleg gildi", "Notaðu háþróuð orðatiltæki", "Greindu menningarlega sjálfsmynd"]
    },
    travel_complaint: {

        title: "Ferðakvörtun",
        role: "Þú ert starfsmaður flugfélags á flugvellinum.",
        objectives: ["Útskýra vandamálið", "Biðja um endurgreiðslu eða nýja bókun", "Spyrjast fyrir um hótel"]
    },
    apartment_dispute: {
        title: "Íbúðardeila",
        role: "Þú ert leigusalinn sem er tregur til að borga fyrir viðgerðir.",
        objectives: ["Lýsa skemmdunum", "Rökstyðja hvers vegna það er ábyrgð leigusalans", "Sammælast um viðgerðardagsetningu"]
    },
    cultural_debate: {
        title: "Umræða um samfélagsmiðla",
        role: "Þú ert vinur sem er efagjarn gagnvart tækni.",
        objectives: ["Lýsa skoðun", "Gefa tvær stuðningsástæður", "Svara mótrökum"]
    },
    legal_consultation: {
        title: "Lögfræðileg ráðgjöf",
        role: "Þú ert lögfræðingur sem sérhæfir sig í hugverkarétti.",
        objectives: ["Útskýra samningsbrot", "Spyrjast fyrir um lagaleg úrræði", "Ræða mögulegar útkomur"]
    },
    academic_seminar: {
        title: "Fræðileg málstofa",
        role: "Þú ert háskólaprófessor.",
        objectives: ["Samantekt á afstöðu þinni", "Vitna í ímynduð sönnunargögn", "Svara gagnrýni"]
    },
    philosophical_debate: {
        title: "Siðfræði gervigreindar",
        role: "Þú ert þekktur heimspekingur.",
        objectives: ["Skilgreina flókið hugtak", "Nota vandaðar líkingar", "Meðhöndla kaldhæðni og blæbrigði"]
    },
    diplomatic_crisis: {
        title: "Diplómatískar samningaviðræður",
        role: "Þú ert háttsettur diplómat frá keppinautaríki.",
        objectives: ["Tjá áhyggjur þjóðarinnar óbeint", "Leggja til flókna málamiðlun", "Fylgja ströngum formlegum siðareglum"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Verkefni þitt: Haltu sögunni áfram í NÁKVÆMLEGA 1 stuttri setningu.
Skrifaðu aðeins söguna. Engar fyrirsagnir eða útskýringar.
MIKILVÆGT: EKKI NOTA ENSKU. Tungumál: Íslenska.
Tónn: Glaður og mjög einfaldur (CEFR A1).
<|im_start|>user
Upprunalegt: ${userInput}
<|im_start|>user
Upprunalegt: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Einfaldur tungumálakennari. Leiðréttu inntakið. Ef það er rétt skaltu segja "Fullkomið."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Einfaldur tungumálakennari. Leiðréttu inntakið. Ef það er rétt skaltu segja "Fullkomið."<|im_end|>
<|im_start|>user
Upprunalegt: ${userInput}
Leiðrétting:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gerðu það einfaldara (3-5 orð).<|im_end|>
<|im_start|>user
Upprunalegt: ${narrativeText}
Einfaldað:<|im_end|>
<|im_start|>assistant
`;
};
