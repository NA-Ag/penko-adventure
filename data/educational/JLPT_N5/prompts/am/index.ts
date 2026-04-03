import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "በካፌ ውስጥ ማዘዝ",
        role: "እርስዎ በሚበዛበት ካፌ ውስጥ ባሪስታ ነዎት።",
        objectives: ["ባሪስታውን ሰላም ይበሉ", "መጠጥ ያዝዙ", "ምግብ ያዝዙ", "ሂሳብ ይጠይቁ"]
    },
    directions: {
        title: "አቅጣጫ መጠየቅ",
        role: "እርስዎ በመንገድ ላይ ያለዎት አጋዥ የአካባቢው ሰው ነዎት።",
        objectives: ["በትህትና ይቅርታ ይጠይቁ", "የባቡር ጣቢያው የት እንደሆነ ይጠይቁ", "የአካባቢውን ሰው ያመስግኑ"]
    },
    doctor_visit: {
        title: "በዶክተር ቤት",
        role: "እርስዎ ዶክተር ነዎት። ተጠቃሚው ታካሚ ነው።",
        objectives: ["ሁለት ምልክቶችን ይግለጹ", "የዶክተሩን ምክር ይረዱ", "ስለ መድሃኒት ይጠይቁ"]
    },
    shopping_clothes: {
        title: "ልብስ መግዛት",
        role: "እርስዎ የሱቅ ረዳት ነዎት።",
        objectives: ["የተለየ እቃ ይጠይቁ", "ስለ መጠኖች ይወያዩ", "ስለ ዋጋ ይጠይቁ"]
    },
    job_interview: {
        title: "የሥራ ቃለ መጠይቅ",
        role: "እርስዎ ለችርቻሮ ሥራ ተጠቃሚውን ቃለ መጠይቅ የሚያደርጉ የቅጥር ሥራ አስኪያጅ ነዎት።",
        objectives: ["ራስዎን በሙያዊ ሁኔታ ያስተዋውቁ", "ያለፈውን ልምድ ይግለጹ", "ስለ ሥራው ድርሻ ጥያቄ ይጠይቁ"]
    },
    meeting_friend: {
        title: "አዲስ ጓደኛ መገናኘት",
        role: "እርስዎ በፓርክ ውስጥ ተማሪ ነዎት።",
        objectives: ["ስምዎን እና የትውልድ ቦታዎን ይናገሩ", "የሌላውን ሰው ስም ይጠይቁ", "በትህትና ይሰናበቱ"]
    },
    planning_picnic: {
        title: "ሽርሽር ማቀድ",
        role: "እርስዎ የተጠቃሚው ጓደኛ ነዎት።",
        objectives: ["የአየር ሁኔታን ያረጋግጡ", "የመገናኛ ሰዓት ያቅርቡ", "ምን ዓይነት ምግብ ይዘው እንደሚመጡ ይወስኑ"]
    },
    new_coworker: {
        title: "አዲስ የሥራ ባልደረባ",
        role: "እርስዎ በመጀመሪያው ቀንዎ አዲስ ተቀጣሪ ነዎት።",
        objectives: ["የቢሮውን ሁኔታ ይግለጹ", "የዕለት ተዕለት ተግባራትን ያብራሩ", "ጠቃሚ ምክር ይስጡ"]
    },
    bank_account: {
        title: "የባንክ ሂሳብ መክፈት",
        role: "እርስዎ በአዲስ አበባ የባንክ ሠራተኛ ነዎት።",
        objectives: ["የጉብኝቱን ምክንያት ያብራሩ", "ስለ ሰነዶች ይጠይቁ", "ስለ ሞባይል ባንኪንግ አገልግሎቶች ይጠይቁ"]
    },
    environmental_meeting: {
        title: "የአካባቢ ጥበቃ ማህበረሰብ ስብሰባ",
        role: "እርስዎ የማህበረሰብ አደራጅ ነዎት።",
        objectives: ["ለአንድ የተወሰነ ፖሊሲ ክርክር ያቅርቡ", "ስለ ወጪ ስጋቶች ምላሽ ይስጡ", "ውስብስብ አመለካከትን ያጠቃልሉ"]
    },
    tradition_vs_modernity: {
        title: "ባህል እና ዘመናዊነት",
        role: "እርስዎ ባህሎች እድገትን ያደናቅፋሉ ብለው የሚያምኑ ዘመናዊ ሰው ነዎት።",
        objectives: ["ታሪካዊ እና ዘመናዊ እሴቶችን ያወዳድሩ", "ከፍተኛ ደረጃ ያላቸውን አባባሎች ይጠቀሙ", "ባህላዊ ማንነትን ይተንትኑ"]
    },
    travel_complaint: {

        title: "የጉዞ ቅሬታ",
        role: "እርስዎ በአውሮፕላን ማረፊያ ውስጥ የአየር መንገድ ወኪል ነዎት።",
        objectives: ["ችግሩን ያስረዱ", "ተመላሽ ገንዘብ ወይም እንደገና ቦታ ማስያዝ ይጠይቁ", "ስለ ሆቴል ይጠይቁ"]
    },
    apartment_dispute: {
        title: "የቤት ኪራይ ክርክር",
        role: "እርስዎ ለጥገና ክፍያ ለመክፈል ፈቃደኛ ያልሆኑ አከራይ ነዎት።",
        objectives: ["ጉዳቱን ይግለጹ", "አከራዩ ለምን ተጠያቂ እንደሆነ ይከራከሩ", "በጥገና ቀን ላይ ይስማሙ"]
    },
    cultural_debate: {
        title: "የማህበራዊ ሚዲያ ክርክር",
        role: "እርስዎ የቴክኖሎጂ ተጠራጣሪ ጓደኛ ነዎት።",
        objectives: ["አስተያየት ይስጡ", "ሁለት ደጋፊ ምክንያቶችን ይስጡ", "ለአንድ ነጥብ የመልሶ ማጥቃት ክርክር ያቅርቡ"]
    },
    legal_consultation: {
        title: "የሕግ ምክክር",
        role: "እርስዎ በምሁራዊ ንብረት ላይ የተካኑ ጠበቃ ነዎት።",
        objectives: ["የውል ጥሰቱን ያስረዱ", "ስለ ሕጋዊ መፍትሄዎች ይጠይቁ", "ሊሆኑ ስለሚችሉ ውጤቶች ይወያዩ"]
    },
    academic_seminar: {
        title: "የአካዳሚክ ሴሚናር",
        role: "እርስዎ የዩኒቨርሲቲ ፕሮፌሰር ነዎት።",
        objectives: ["አቋምዎን ያጠቃልሉ", "መላምታዊ ማስረጃዎችን ይጠቅሱ", "ለአንድ ወሳኝ ነጥብ ምላሽ ይስጡ"]
    },
    philosophical_debate: {
        title: "የኤአይ (AI) ስነ-ምግባር",
        role: "እርስዎ ታዋቂ ፈላስፋ ነዎት።",
        objectives: ["ረቂቅ ጽንሰ-ሀሳብን ይግለጹ", "ረቂቅ ዘይቤዎችን ይጠቀሙ", "ምልከታን እና ረቂቅ ነገሮችን ይያዙ"]
    },
    diplomatic_crisis: {
        title: "የዲፕሎማሲያዊ ድርድር",
        role: "እርስዎ ከተቀናቃኝ ሀገር የመጡ ከፍተኛ ደረጃ ዲፕሎማት ነዎት።",
        objectives: ["ብሄራዊ ስጋቶችን በተዘዋዋሪ ይግለጹ", "ውስብስብ ስምምነት ያቅርቡ", "ጥብቅ መደበኛ ፕሮቶኮልን ይጠብቁ"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

የእርስዎ ተግባር፡ ታሪኩን በትክክል በ1 አጭር ዓረፍተ ነገር ይቀጥሉ።
ታሪኩን ብቻ ፃፍ። ምንም ራስጌዎች ወይም ማብራሪያዎች የሉም።
በስተመጨረሻ  ያካትቱ።
ወሳኝ፡ እንግሊዝኛ የለም። ቋንቋ፡ አማርኛ።
ድምጽ፡ ደስተኛ እና በጣም ቀላል (CEFR A1)።
ምሳሌ፡
እስካሁን ያለው ታሪክ፡ በመንገዱ ላይ ዝናብ እየዘነበ ነው።
የተጫዋች ድርጊት፡ ዙሪያዬን እመለከታለሁ።
<|im_start|>user
ኦሪጅናል፡ ${userInput}
<|im_start|>user
ኦሪጅናል፡ ${narrativeText}
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
1 ዓረፍተ ነገር፡<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ቀላል የቋንቋ አስተማሪ። ግቤቱን ያስተካክሉ። ትክክል ከሆነ "ፍጹም" ይበሉ።<|im_end|>
<|im_start|>user
ኦሪጅናል፡ ${userInput}
እርማት፡<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ቀለል ያድርጉት (3-5 ቃላት)።<|im_end|>
<|im_start|>user
ኦሪጅናል፡ ${narrativeText}
ቀላል፡<|im_end|>
<|im_start|>assistant
`;
};
