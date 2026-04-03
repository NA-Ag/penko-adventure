import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Porositja në një kafe",
        role: "Ju jeni një banakier në një kafene të ngarkuar.",
        objectives: ["Përshëndetni banakierin", "Porositni një pije", "Porositni ushqim", "Kërkoni faturën"]
    },
    directions: {
        title: "Kërkimi i rrugës",
        role: "Ju jeni një banor vendas ndihmues në rrugë.",
        objectives: ["Kërkoni ndjesë me edukatë", "Pyetni se ku është stacioni i trenit", "Falënderoni banorin vendas"]
    },
    doctor_visit: {
        title: "Te doktori",
        role: "Ju jeni një doktor. Përdoruesi është një pacient.",
        objectives: ["Përshkruani dy simptoma", "Kuptoni këshillën e doktorit", "Pyetni për medikamentet"]
    },
    shopping_clothes: {
        title: "Blerja e rrobave",
        role: "Ju jeni një asistent dyqani.",
        objectives: ["Kërkoni për një artikull specifik", "Diskutoni për madhësitë", "Pyetni për çmimin"]
    },
    job_interview: {
        title: "Intervistë pune",
        role: "Ju jeni një menaxher punësimi që intervistoni përdoruesin për një punë në shitje me pakicë.",
        objectives: ["Prezantoni veten profesionalisht", "Përshkruani përvojën e kaluar", "Bëni një pyetje rreth rolit"]
    },
    meeting_friend: {
        title: "Takimi me një mik të ri",
        role: "Ju jeni një student në një park.",
        objectives: ["Tregoni emrin dhe origjinën tuaj", "Pyetni emrin e personit tjetër", "Thoni një lamtumirë të sjellshme"]
    },
    planning_picnic: {
        title: "Planifikimi i një pikniku",
        role: "Ju jeni një mik i përdoruesit.",
        objectives: ["Kontrolloni motin", "Sugjeroni një kohë takimi", "Vendosni se çfarë ushqimi do të sillni"]
    },
    new_coworker: {
        title: "Kolegu i ri",
        role: "Ju jeni një punonjës i ri në ditën tuaj të parë.",
        objectives: ["Përshkruani mjedisin e zyrës", "Shpjegoni detyrat e përditshme", "Jepni një këshillë të dobishme"]
    },
    bank_account: {
        title: "Hapja e një llogarie bankare",
        role: "Ju jeni një nëpunës banke në Tiranë.",
        objectives: ["Shpjegoni arsyen e vizitës", "Pyetni për dokumentet", "Pyetni për tiparet e bankingut celular"]
    },
    environmental_meeting: {
        title: "Takimi i komunitetit mjedisor",
        role: "Ju jeni një organizator i komunitetit.",
        objectives: ["Bëni një argument për një politikë specifike", "Përgjigjuni shqetësimeve për koston", "Përmblidhni një pikëpamje komplekse"]
    },
    tradition_vs_modernity: {
        title: "Tradita vs Moderniteti",
        role: "Ju jeni një modernist që beson se traditat pengojnë përparimin.",
        objectives: ["Krahasoni vlerat historike dhe moderne", "Përdorni idioma të avancuara", "Analizoni identitetin kulturor"]
    },
    travel_complaint: {
        title: "Ankesë udhëtimi",
        role: "Ju jeni një agjent i linjës ajrore në aeroport.",
        objectives: ["Shpjegoni problemin", "Kërkoni rimbursim ose rezervim të ri", "Pyetni për një hotel"]
    },
    apartment_dispute: {
        title: "Mosmarrëveshje për apartamentin",
        role: "Ju jeni një qiradhënës që heziton të paguajë për riparimet.",
        objectives: ["Përshkruani dëmin", "Argumentoni pse është përgjegjësi e qiradhënësit", "Bini dakord për një datë riparimi"]
    },
    cultural_debate: {
        title: "Debat në rrjetet sociale",
        role: "Ju jeni një mik skeptik ndaj teknologjisë.",
        objectives: ["Shprehni një mendim", "Jepni dy arsye mbështetëse", "Përgjigjuni një kundërargumenti"]
    },
    legal_consultation: {

        title: "Konsultë ligjore",
        role: "Ju jeni një avokat i specializuar në pronësinë intelektuale.",
        objectives: ["Shpjegoni shkeljen e kontratës", "Pyetni për mjetet juridike", "Diskutoni rezultatet e mundshme"]
    },
    academic_seminar: {
        title: "Seminar akademik",
        role: "Ju jeni një profesor universiteti.",
        objectives: ["Përmblidhni pozicionin tuaj", "Citoni prova hipotetike", "Përgjigjuni një pike kritike"]
    },
    philosophical_debate: {
        title: "Etika e AI",
        role: "Ju jeni një filozof i njohur.",
        objectives: ["Përcaktoni një koncept abstrakt kompleks", "Përdorni metafora të sofistikuara", "Menaxhoni ironinë dhe nuancat"]
    },
    diplomatic_crisis: {
        title: "Negociatë diplomatike",
        role: "Ju jeni një diplomat i nivelit të lartë nga një komb rival.",
        objectives: ["Shprehni shqetësimet kombëtare tërthorazi", "Propozoni një kompromis kompleks", "Ruani protokollin formal të rreptë"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Detyra juaj: Vazhdoni historinë në EKZAKTËSISHT 1 fjali të shkurtër.
Shkruani vetëm historinë. Pa tituj ose shpjegime.
KRITIKE: MOS PËRDORNI ANGLISHT. Gjuha: Shqip.
Toni: I gëzuar dhe shumë i thjeshtë (CEFR A1).
Shembull:
Historia deri më tani: Bie shi në rrugë.
Veprimi i lojtarit: Shikoj rreth e rrotull.
<|im_start|>user
Origjinali: ${userInput}
<|im_start|>user
Origjinali: ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Mësues gjuhe i thjeshtë. Korrigjoni hyrjen. Nëse është e saktë, thoni "Shkëlqyeshëm."<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mësues gjuhe i thjeshtë. Korrigjoni hyrjen. Nëse është e saktë, thoni "Shkëlqyeshëm."<|im_end|>
<|im_start|>user
Origjinali: ${userInput}
Korrigjimi:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Bëjeni më të thjeshtë (3-5 fjalë).<|im_end|>
<|im_start|>user
Origjinali: ${narrativeText}
E thjeshtuar:<|im_end|>
<|im_start|>assistant
`;
};
