import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Tilaaminen kahvilassa",
        role: "Olet barista kiireisessä kahvilassa.",
        objectives: ["Tervehdi baristaa", "Tilaa juoma", "Tilaa ruokaa", "Pyydä lasku"]
    },
    directions: {
        title: "Tien kysyminen",
        role: "Olet avulias paikallinen kadulla.",
        objectives: ["Pyydä anteeksi kohteliaasti", "Kysy missä juna-asema on", "Kiitä paikallista"]
    },
    doctor_visit: {
        title: "Lääkärissä",
        role: "Olet lääkäri. Käyttäjä on potilas.",
        objectives: ["Kuvaile kaksi oiretta", "Ymmärrä lääkärin neuvo", "Kysy lääkityksestä"]
    },
    shopping_clothes: {
        title: "Vaateostokset",
        role: "Olet myyjä.",
        objectives: ["Kysy tiettyä tuotetta", "Keskustele kooista", "Kysy hintaa"]
    },
    job_interview: {
        title: "Työhaastattelu",
        role: "Olet rekrytoija, joka haastattelee käyttäjää kaupan työhön.",
        objectives: ["Esittele itsesi ammattimaisesti", "Kuvaile aiempaa kokemusta", "Esitä kysymys roolista"]
    },
    meeting_friend: {
        title: "Uuden ystävän tapaaminen",
        role: "Olet opiskelija puistossa.",
        objectives: ["Kerro nimesi ja mistä olet kotoisin", "Kysy toisen henkilön nimeä", "Sano kohteliaat hyvästit"]
    },
    planning_picnic: {
        title: "Piknikin suunnittelu",
        role: "Olet käyttäjän ystävä.",
        objectives: ["Tarkista sää", "Ehdotta tapaamisaikaa", "Päätä mitä ruokaa tuot mukanasi"]
    },
    new_coworker: {
        title: "Uusi työkaveri",
        role: "Olet uusi työntekijä ensimmäisenä päivänäsi.",
        objectives: ["Kuvaile toimistoympäristöä", "Selitä päivittäiset tehtävät", "Anna hyödyllinen vinkki"]
    },
    bank_account: {
        title: "Pankkitilin avaaminen",
        role: "Olet pankkivirkailija Helsingissä.",
        objectives: ["Selitä vierailun syy", "Tiedustele tarvittavista asiakirjoista", "Kysy mobiilipankkiominaisuuksista"]
    },
    environmental_meeting: {
        title: "Ympäristöyhteisön kokous",
        role: "Olet yhteisön järjestäjä.",
        objectives: ["Esitä argumentti tietyn politiikan puolesta", "Vastaa kustannuksia koskeviin huoliin", "Yhdistä monimutkainen näkökulma"]
    },
    tradition_vs_modernity: {
        title: "Perinteet vs. modernisuus",
        role: "Olet modernisti, joka uskoo perinteiden estävän edistystä.",
        objectives: ["Vertaa historiallisia ja moderneja arvoja", "Käytä edistyneitä idiomeja", "Analysoi kulttuurista identiteettiä"]
    },
    travel_complaint: {
        title: "Matkavalitus",
        role: "Olet lentoyhtiön virkailija lentokentällä.",
        objectives: ["Selitä ongelma", "Pyydä hyvitystä tai uutta varausta", "Kysy hotellista"]
    },
    apartment_dispute: {
        title: "Asuntokiista",
        role: "Olet vuokranantaja, joka on haluton maksamaan korjauksista.",
        objectives: ["Kuvaile vaurio", "Perustele miksi se on vuokranantajan vastuulla", "Sovi korjauspäivämäärästä"]
    },
    cultural_debate: {
        title: "Sosiaalisen median keskustelu",
        role: "Olet teknologiaan skeptisesti suhtautuva ystävä.",
        objectives: ["Ilmaise mielipide", "Anna kaksi tukevaa syytä", "Vastaa vastaväitteeseen"]
    },
    legal_consultation: {
        title: "Oikeudellinen neuvonta",
        role: "Olet tekijänoikeuksiin erikoistunut lakimies.",
        objectives: ["Selitä sopimusrikkomus", "Kysy oikeussuojakeinoista", "Keskustele mahdollisista tuloksista"]
    },
    academic_seminar: {
        title: "Akateeminen seminaari",
        role: "Olet yliopiston professori.",
        objectives: ["Tiivistä kantasi", "Lainaa hypoteettisia todisteita", "Vastaa kriittiseen vastaväitteeseen"]
    },
    philosophical_debate: {
        title: "Tekoälyn etiikka",
        role: "Olet tunnettu filosofi.",
        objectives: ["Määrittele monimutkainen abstrakti käsite", "Käytä hienostuneita metaforia", "Käsittele ironiaa ja vivahteita"]
    },
    diplomatic_crisis: {
        title: "Diplomaattiset neuvottelut",
        role: "Olet korkea-arvoinen diplomaatti kilpailevasta maasta.",
        objectives: ["Ilmaise kansalliset huolet epäsuorasti", "Ehdotuta monimutkaista kompromissia", "Noudata tiukkaa muodollista etikettiä"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tehtäväsi: Jatka tarinaa TÄSMÄLLEEN 1 lyhyellä lauseella.
Kirjoita vain itse tarina. Ei otsikoita tai selityksiä.
KRIITTISTÄ: ÄLÄ KÄYTÄ ENGLANTIA. Kieli: Suomi.
Sävy: Iloinen ja erittäin yksinkertainen (CEFR A1).
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Yksinkertainen kielenopettaja. Korjaa teksti. Jos se on oikein, sano "Täydellistä."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Yksinkertainen kielenopettaja. Korjaa teksti. Jos se on oikein, sano "Täydellistä."<|im_end|>
<|im_start|>user
Alkuperäinen: ${userInput}
Korjaus:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Tee siitä yksinkertaisempi (3-5 sanaa).<|im_end|>
<|im_start|>user
Alkuperäinen: ${narrativeText}
Yksinkertaistettu:<|im_end|>
<|im_start|>assistant
`;
};
