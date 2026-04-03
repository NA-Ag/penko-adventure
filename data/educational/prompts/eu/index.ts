import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Kafetegian eskatzea",
        role: "Kafetegi jendetsu bateko zerbitzaria zara.",
        objectives: ["Agurtu zerbitzaria", "Edari bat eskatu", "Janaria eskatu", "Kontua eskatu"]
    },
    directions: {
        title: "Norabideak galdetzea",
        role: "Kaleko bertako pertsona lagunkoi bat zara.",
        objectives: ["Barkamena eskatu adeitasunez", "Galdetu non dagoen tren geltokia", "Eskerrak eman bertakoari"]
    },
    doctor_visit: {
        title: "Medikuarenean",
        role: "Medikua zara. Erabiltzailea gaixoa da.",
        objectives: ["Deskribatu bi sintoma", "Ulertu medikuaren aholkuak", "Galdetu botikei buruz"]
    },
    shopping_clothes: {
        title: "Arropa erostea",
        role: "Dendako saltzailea zara.",
        objectives: ["Galdetu artikulu zehatz bati buruz", "Eztabaidatu neurriak", "Galdetu prezioari buruz"]
    },
    job_interview: {
        title: "Lan elkarrizketa",
        role: "Erabiltzaileari elkarrizketa egiten ari zaren kontratazio arduraduna zara.",
        objectives: ["Aurkeztu zure burua profesionalki", "Deskribatu aurreko esperientzia", "Egin galdera bat lanpostuaren inguruan"]
    },
    meeting_friend: {
        title: "Lagun berri bat ezagutzea",
        role: "Parke bateko ikaslea zara.",
        objectives: ["Esan zure izena eta jatorria", "Galdetu beste pertsonaren izena", "Esan agur adeitsu bat"]
    },
    planning_picnic: {
        title: "Piknik bat antolatzea",
        role: "Erabiltzailearen laguna zara.",
        objectives: ["Egiaztatu eguraldia", "Proposatu elkartzeko ordua", "Erabaki zer janari ekarri"]
    },
    new_coworker: {
        title: "Lankide berria",
        role: "Langile berria zara zure lehen egunean.",
        objectives: ["Deskribatu bulegoko giroa", "Azaldu eguneroko zereginak", "Eman aholku lagungarri bat"]
    },
    bank_account: {
        title: "Banku-kontu bat irekitzea",
        role: "Bilboko banku-langilea zara.",
        objectives: ["Azaldu bisitaren arrazoia", "Galdetu dokumentuei buruz", "Galdetu banku mugikorraren funtzioei buruz"]
    },
    environmental_meeting: {
        title: "Ingurumen-bilera komunitarioa",
        role: "Komunitateko antolatzailea zara.",
        objectives: ["Argudiatu politika zehatz baten alde", "Erantzun kostuei buruzko kezkei", "Laburbildu ikuspuntu konplexu bat"]
    },
    tradition_vs_modernity: {
        title: "Tradizioa vs Modernitatea",
        role: "Tradizioek aurrerapena oztopatzen dutela uste duen modernista zara.",
        objectives: ["Konparatu balio historikoak eta modernoak", "Erabili esamolde aurreratuak", "Analizatu identitate kulturala"]
    },
    travel_complaint: {
        title: "Bidaia-erreklamazioa",
        role: "Aireportuko airelinea bateko langilea zara.",
        objectives: ["Azaldu arazoa", "Eskatu dirua itzultzea edo bidaia aldatzea", "Galdetu hotel bati buruz"]
    },
    apartment_dispute: {
        title: "Etxebizitza gatazka",
        role: "Konponketak ordaintzeko gogorik ez duen jabea zara.",
        objectives: ["Deskribatu kaltea", "Arrazoitu zergatik den jabearen erantzukizuna", "Konponketa data bat adostu"]
    },
    cultural_debate: {
        title: "Sare sozialei buruzko eztabaida",
        role: "Teknologiarekin eszeptikoa den lagun bat zara.",
        objectives: ["Irritzi bat eman", "Eman bi arrazoi babesgarri", "Erantzun kontra-argumentu bati"]
    },
    legal_consultation: {
        title: "Aholkularitza juridikoa",
        role: "Jabetza intelektualean espezializatutako abokatua zara.",
        objectives: ["Azaldu kontratu-haustea", "Galdetu bide juridikoei buruz", "Eztabaidatu emaitza posibleak"]
    },
    academic_seminar: {
        title: "Mintegi akademikoa",
        role: "Unibertsitateko irakaslea zara.",
        objectives: ["Laburbildu zure jarrera", "Aipatu ebidentzia hipotetikoak", "Erantzun kritika bati"]
    },
    philosophical_debate: {
        title: "AIaren etika",
        role: "Filosofo ospetsu bat zara.",
        objectives: ["Definitu kontzeptu abstraktu konplexu bat", "Erabili metafora sofistikatuak", "Kudeatu ironia eta ñabardurak"]
    },
    diplomatic_crisis: {
        title: "Negoziazio diplomatikoa",
        role: "Herrialde arerio bateko maila altuko diplomatikoa zara.",
        objectives: ["Adierazi kezka nazionalak zeharka", "Proposatu konpromiso konplexu bat", "Mantendu protokolo formal zorrotza"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
AI hizkuntza-tutorea (${levelName}). ${local.role}
Berlitz araua: EZ zuzendu akatsak modu esplizituan. Balioztatu ideia gramatika zuzena modu naturalean erabiliz.
Adibidea: Ikaslea: "Nik jan tarta atzo" -> Zu: "Nik ere **tarta jan nuen** atzo, zein zapore gustatzen zaizu?"

Eszenatokia: ${local.title}
Helburuak: ${local.objectives.join(', ')}

Arauak:
1. ZEHAZKI 1 edo 2 esaldi labur.
2. Hizkuntza: ${language}. INGELERA DEBEKATUTA DAGO.
3. Maila: ${levelName}.<|im_end|>
<|im_start|>user
Elkarrizketa: ${history}
${systemEvent ? `Gertaera: ${systemEvent}` : ''}
Ikaslea: ${action}
Tutorearen erantzuna:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Hizkuntza-tutorea. Zuzendu erabiltzailearen sarrerako akatsak. Zuzena bada, esan "Bikain" (edo "Perfect").<|im_end|>
<|im_start|>user
Originala: ${userInput}
Zuzenketa:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Erraztu ondorengo testua (CEFR A1 maila).<|im_end|>
<|im_start|>user
Originala: ${narrativeText}
Erraztua:<|im_end|>
<|im_start|>assistant
`;
};
