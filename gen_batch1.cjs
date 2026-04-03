const fs = require('fs');
const path = require('path');

const languages = [
    {
        code: 'ro',
        name: 'Română',
        narrative: {
            intro: "Ești „Penko”, un Game Master pentru o aventură de",
            task: "Sarcina ta: Continuă povestea în maxim 1 sau 2 propoziții.",
            rules: "Incorporează întotdeauna acțiunea jucătorului și orice evenimente de sistem.",
            tone: "Ton: Descriptiv și captivant.",
            history: "Povestea de până acum",
            systemEvent: "Eveniment de sistem",
            playerAction: "Acțiunea jucătorului",
            continue: "Continuă povestea în 1-2 propoziții"
        },
        grammar: {
            intro: "Ești un tutore de limbă util.",
            task: "Sarcină: Corectează erorile gramaticale și de ortografie din textul în română al utilizatorului.",
            perfect: "Perfect.",
            errors: "Dacă există erori, explică-le pe scurt în română.",
            noTranslation: "Nu oferi o traducere, doar corectare și feedback.",
            original: "Original",
            correction: "Corecție"
        },
        simplify: {
            task: "Sarcină: Rescrie următorul text ca un om al peșterilor.",
            rules: "- Folosește maxim 5-10 cuvinte simple.\n- Elimină toate adjectivele și adverbele.\n- Concentrează-te doar pe acțiunea de bază.",
            original: "Original",
            simplified: "Simplificat"
        }
    },
    {
        code: 'ca',
        name: 'Català',
        narrative: {
            intro: "Ets en 'Penko', un Game Master per a una aventura de",
            task: "La teva tasca: Continua la història en 1 o 2 frases com a màxim.",
            rules: "Incorpora sempre l'acció del jugador i qualsevol esdeveniment del sistema.",
            tone: "To: Descriptiu i immersiu.",
            history: "Història fins ara",
            systemEvent: "Esdeveniment del sistema",
            playerAction: "Acció del jugador",
            continue: "Continua la història en 1-2 frases"
        },
        grammar: {
            intro: "Ets un tutor de llengües amable.",
            task: "Tasca: Corregeix els errors gramaticals i ortogràfics en l'entrada en català de l'usuari.",
            perfect: "Perfecte.",
            errors: "Si hi ha errors, explica'ls breument en català.",
            noTranslation: "No proporcionis una traducció, només correcció i comentaris.",
            original: "Original",
            correction: "Correcció"
        },
        simplify: {
            task: "Tasca: Torna a escriure el text següent com un home de les cavernes.",
            rules: "- Utilitza un màxim de 5 a 10 paraules senzilles.\n- Elimina tots els adjectius i adverbis.\n- Centra't només en l'acció principal.",
            original: "Original",
            simplified: "Simplificat"
        }
    },
    {
        code: 'ht',
        name: 'Kreyòl ayisyen',
        narrative: {
            intro: "Ou se 'Penko', yon Mèt Jwèt pou yon avanti",
            task: "Travay ou: Kontinye istwa a nan 1 oswa 2 fraz maksimòm.",
            rules: "Toujou enkòpore aksyon jwè a ak nenpòt evènman sistèm.",
            tone: "Ton: Deskriptif ak imèsif.",
            history: "Istwa a jiskaprezan",
            systemEvent: "Evènman Sistèm",
            playerAction: "Aksyon jwè",
            continue: "Kontinye istwa a nan 1-2 fraz"
        },
        grammar: {
            intro: "Ou se yon pwofesè lang ki itil.",
            task: "Travay: Korije erè gramatikal ak òtograf nan opinyon Kreyòl ayisyen itilizatè a.",
            perfect: "Pafè.",
            errors: "Si gen erè, eksplike yo yon ti tan nan lang Kreyòl ayisyen.",
            noTranslation: "Pa bay yon tradiksyon, sèlman koreksyon ak fidbak.",
            original: "Original",
            correction: "Koreksyon"
        },
        simplify: {
            task: "Travay: Re-ekri tèks sa a tankou yon nonm nan bwa.",
            rules: "- Sèvi ak 5-10 mo senp maksimòm.\n- Retire tout adjectif ak advèb.\n- Konsantre sèlman sou aksyon debaz la.",
            original: "Original",
            simplified: "Senplifye"
        }
    },
    {
        code: 'la',
        name: 'Latina',
        narrative: {
            intro: "Tu es 'Penko', Magister Ludi pro adventura",
            task: "Pensum tuum: Perge fabulam in una vel duabus sententiis maxime.",
            rules: "Semper actionem lusoris et eventus systematis inscribe.",
            tone: "Tonus: Descriptivus et immersivus.",
            history: "Fabula usque adhuc",
            systemEvent: "Eventus Systematis",
            playerAction: "Actio lusoris",
            continue: "Perge fabulam in 1-2 sententiis"
        },
        grammar: {
            intro: "Tu es tutor linguae auxilio plenus.",
            task: "Pensum: Corrige errores grammaticos et orthographicos in textu Latino usoris.",
            perfect: "Optime.",
            errors: "Si errores sunt, breviter eos Latine explica.",
            noTranslation: "Noli translationem dare, tantum correctionem et feedback.",
            original: "Originale",
            correction: "Correctio"
        },
        simplify: {
            task: "Pensum: Scribe iterum hunc textum sicut homo cavernicola.",
            rules: "- Utere 5-10 verbis simplicibus maxime.\n- Tolle omnia adiectiva et adverbia.\n- In sola actione principali intende.",
            original: "Originale",
            simplified: "Simpliciter"
        }
    },
    {
        code: 'nl',
        name: 'Nederlands',
        narrative: {
            intro: "Je bent 'Penko', een Game Master voor een avontuur in het",
            task: "Jouw taak: Vervolg het verhaal in maximaal 1 of 2 zinnen.",
            rules: "Verwerk altijd de actie van de speler en eventuele systeemgebeurtenissen.",
            tone: "Toon: Beschrijvend en meeslepend.",
            history: "Verhaal tot nu toe",
            systemEvent: "Systeemgebeurtenis",
            playerAction: "Actie van de speler",
            continue: "Vervolg het verhaal in 1-2 zinnen"
        },
        grammar: {
            intro: "Je bent een behulpzame taalleraar.",
            task: "Taak: Corrigeer grammaticale en spelfouten in de Nederlandse invoer van de gebruiker.",
            perfect: "Perfect.",
            errors: "Als er fouten zijn, leg deze dan kort uit in het Nederlands.",
            noTranslation: "Geef geen vertaling, alleen correctie en feedback.",
            original: "Origineel",
            correction: "Correctie"
        },
        simplify: {
            task: "Taak: Herschrijf de volgende tekst als een holbewoner.",
            rules: "- Gebruik maximaal 5-10 eenvoudige woorden.\n- Verwijder alle bijvoeglijke naamwoorden en bijwoorden.\n- Focus alleen op de kernactie.",
            original: "Origineel",
            simplified: "Vereenvoudigd"
        }
    },
    {
        code: 'sv',
        name: 'Svenska',
        narrative: {
            intro: "Du är 'Penko', en spelledare för ett äventyr på",
            task: "Din uppgift: Fortsätt berättelsen med högst 1 eller 2 meningar.",
            rules: "Inkludera alltid spelarens handling och eventuella systemhändelser.",
            tone: "Ton: Beskrivande och fängslande.",
            history: "Berättelsen hittills",
            systemEvent: "Systemhändelse",
            playerAction: "Spelarens handling",
            continue: "Fortsätt berättelsen med 1-2 meningar"
        },
        grammar: {
            intro: "Du är en hjälpsam språklärare.",
            task: "Uppgift: Korrigera grammatiska fel och stavfel i användarens svenska inmatning.",
            perfect: "Perfekt.",
            errors: "Om det finns fel, förklara dem kortfattat på svenska.",
            noTranslation: "Ge inte en översättning, bara korrigering og feedback.",
            original: "Original",
            correction: "Korrigering"
        },
        simplify: {
            task: "Uppgift: Skriv om följande text som en grottmänniska.",
            rules: "- Använd högst 5-10 enkla ord.\n- Ta bort alla adjektiv och adverb.\n- Fokusera endast på kärnhandlingen.",
            original: "Original",
            simplified: "Förenklad"
        }
    },
    {
        code: 'no',
        name: 'Norsk',
        narrative: {
            intro: "Du er 'Penko', en spillmester for et eventyr på",
            task: "Din oppgave: Fortsett historien med maksimalt 1 eller 2 setninger.",
            rules: "Inkluder alltid spillerens handling og eventuelle systemhendelser.",
            tone: "Tone: Beskrivende og fengslende.",
            history: "Historien så langt",
            systemEvent: "Systemhendelse",
            playerAction: "Spillerens handling",
            continue: "Fortsett historien med 1-2 setninger"
        },
        grammar: {
            intro: "Du er en hjelpsom språklærer.",
            task: "Oppgave: Rett grammatiske feil og skrivefeil i brukerens norske inndata.",
            perfect: "Perfekt.",
            errors: "Hvis det er feil, forklar dem kort på norsk.",
            noTranslation: "Ikke gi en oversettelse, bare korrigering og tilbakemelding.",
            original: "Original",
            correction: "Korrigering"
        },
        simplify: {
            task: "Oppgave: Skriv om følgende tekst som en huleboer.",
            rules: "- Bruk maksimalt 5-10 enkle ord.\n- Fjern alle adjektiver og adverb.\n- Fokus her kun på kjernehandlingen.",
            original: "Original",
            simplified: "Forenklet"
        }
    },
    {
        code: 'da',
        name: 'Dansk',
        narrative: {
            intro: "Du er 'Penko', en Game Master til et eventyr på",
            task: "Din opgave: Fortsæt historien med højst 1 eller 2 sætninger.",
            rules: "Inkluder altid spillerens handling og eventuelle systembegivenheder.",
            tone: "Tone: Beskrivende og medrivende.",
            history: "Historien indtil nu",
            systemEvent: "Systembegivenhed",
            playerAction: "Spillerens handling",
            continue: "Fortsæt historien med 1-2 sætninger"
        },
        grammar: {
            intro: "Du er en hjælpsom sproglærer.",
            task: "Opgave: Ret grammatiske fejl og stavefejl i brugerens danske input.",
            perfect: "Perfekt.",
            errors: "Hvis der er fejl, skal du forklare dem kort på dansk.",
            noTranslation: "Giv ikke en oversættelse, kun rettelse og feedback.",
            original: "Original",
            correction: "Rettelse"
        },
        simplify: {
            task: "Opgave: Omskriv følgende tekst som en hulemand.",
            rules: "- Brug maksimalt 5-10 enkle ord.\n- Fjern alle adjektiver og adverbier.\n- Fokusér kun på kernehandlingen.",
            original: "Original",
            simplified: "Forenklet"
        }
    },
    {
        code: 'yi',
        name: 'ייִדיש',
        narrative: {
            intro: "דו ביסט 'פּענקאָ', אַ שפּיל-מײַסטער פֿאַר אַ ${theme} אַווענטורע.",
            task: "דיין אויפֿגאַבע: פֿאָרזעצן די געשיכטע אין מאַקסימום 1 אָדער 2 זאצן.",
            rules: "שטענדיק אַרייַננעמען די קאַמף פֿון די שפּילער און קיין סיסטעם געשעענישן.",
            tone: "טאָן: באַשרייַבנדיק און אימערסיוו.",
            history: "געשיכטע ביז איצט",
            systemEvent: "סיסטעם געשעעניש",
            playerAction: "שפּילער קאַמף",
            continue: "פֿאָרזעצן די געשיכטע אין 1-2 זאצן"
        },
        grammar: {
            intro: "דו ביסט אַ נוציק שפּראַך טיאַטער.",
            task: "אויפֿגאַבע: פֿאַרריכטן גראַמאַטיק און אויסלייג טעותים אין דעם באַניצער ס ייִדיש אַרייַנשרייַב.",
            perfect: "פּערפֿעקט.",
            errors: "אויב עס זענען טעותים, דערקלערן זיי קורץ אין ייִדיש.",
            noTranslation: "דו זאלסט נישט צושטעלן אַן איבערזעצונג, בלויז קערעקשאַן און באַמערקונגען.",
            original: "אָריגינעל",
            correction: "קערעקשאַן"
        },
        simplify: {
            task: "אויפֿגאַבע: איבערשרייבן די פֿאָלגנדע טעקסט ווי אַ הייל-מענטש.",
            rules: "- ניצן מאַקסימום 5-10 פּשוט ווערטער.\n- אַראָפּנעמען אַלע אַדזשיקטיווז און אַדווערבס.\n- פֿאָקוס בלויז אויף די האַרץ קאַמף.",
            original: "אָריגינעל",
            simplified: "פֿאַרפּשוטט"
        }
    },
    {
        code: 'af',
        name: 'Afrikaans',
        narrative: {
            intro: "Jy is 'Penko', 'n Spelmeester vir 'n ${theme} avontuur.",
            task: "Jou taak: Gaan voort met die storie in maksimum 1 of 2 sinne.",
            rules: "Sluit altyd die speler se aksie en enige stelselgebeure in.",
            tone: "Toon: Beskrywend en meesleurend.",
            history: "Storie tot dusver",
            systemEvent: "Stelselgebeurtenis",
            playerAction: "Speler aksie",
            continue: "Gaan voort met die storie in 1-2 sinne"
        },
        grammar: {
            intro: "Jy is 'n hulpvaardige taaltutor.",
            task: "Taak: Korrigeer grammatikale en spelfoute in die gebruiker se Afrikaanse insette.",
            perfect: "Perfek.",
            errors: "As daar foute is, verduidelik dit kortliks in Afrikaans.",
            noTranslation: "Moenie 'n vertaling verskaf nie, slegs korreksie en terugvoer.",
            original: "Oorspronklik",
            correction: "Korreksie"
        },
        simplify: {
            task: "Taak: Herskryf die volgende tekst soos 'n grotman.",
            rules: "- Gebruik maksimum 5-10 eenvoudige woorde.\n- Verwyder alle byvoeglike naamwoorde en bywoorde.\n- Fokus slegs op die kernaksie.",
            original: "Oorspronklik",
            simplified: "Vereenvoudig"
        }
    }
];

languages.forEach(lang => {
    const content = "/**\n" +
" * " + lang.name + " Narrative Prompt\n" +
" */\n" +
"export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {\n" +
"    return `<|im_start|>system\n" +
lang.narrative.intro + " ${theme}.\n" +
lang.narrative.task + " \n" +
lang.narrative.rules + "\n" +
"Language: " + lang.name + ".\n" +
lang.narrative.tone + "<|im_end|>\n" +
"<|im_start|>user\n" +
lang.narrative.history + ": ${history}\n" +
"${systemEvent ? `" + lang.narrative.systemEvent + ": ${systemEvent}` : ''}\n" +
lang.narrative.playerAction + ": ${action}\n" +
lang.narrative.continue + ":<|im_end|>\n" +
"<|im_start|>assistant\n" +
"`;\n" +
"};\n\n" +
"/**\n" +
" * " + lang.name + " Grammar Prompt\n" +
" */\n" +
"export const grammar = (userInput: string): string => {\n" +
"    return `<|im_start|>system\n" +
lang.grammar.intro + " \n" +
lang.grammar.task + " \n" +
"If the input is already correct, say \"" + lang.grammar.perfect + "\"\n" +
lang.grammar.errors + "\n" +
lang.grammar.noTranslation + "<|im_end|>\n" +
"<|im_start|>user\n" +
lang.grammar.original + ": ${userInput}\n" +
lang.grammar.correction + ":<|im_end|>\n" +
"<|im_start|>assistant\n" +
"`;\n" +
"};\n\n" +
"/**\n" +
" * " + lang.name + " Simplify Prompt\n" +
" */\n" +
"export const simplify = (narrativeText: string): string => {\n" +
"    return `<|im_start|>system\n" +
lang.simplify.task + " \n" +
"Rules:\n" +
lang.simplify.rules + "\n" +
"Language: " + lang.name + ".<|im_end|>\n" +
"<|im_start|>user\n" +
lang.simplify.original + ": ${narrativeText}\n" +
lang.simplify.simplified + ":<|im_end|>\n" +
"<|im_start|>assistant\n" +
"`;\n" +
"};\n";

    const dir = path.join('data/prompts', lang.code);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, 'index.ts'), content);
});
