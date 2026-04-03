const fs = require('fs');
const path = require('path');

const languages = [
    {
        code: 'is',
        name: 'Íslenska',
        narrative: {
            intro: "Þú ert 'Penko', sögumaður fyrir",
            theme_suffix: "ævintýri",
            task: "Verkefni þitt: Haltu sögunni áfram í að hámarki 1 eða 2 setningum.",
            rules: "Settu alltaf inn aðgerðir leikmannsins og alla kerfisviðburði.",
            tone: "Tónn: Lýsandi og dýpkandi.",
            history: "Sagan hingað til",
            systemEvent: "Kerfisviðburður",
            playerAction: "Aðgerð leikmanns",
            continue: "Haltu sögunni áfram í 1-2 setningum"
        },
        grammar: {
            intro: "Þú ert hjálpsamur tungumálakennari.",
            task: "Verkefni: Leiðréttu málfræði- og stafsetningarvillur í íslensku inntaki notandans.",
            perfect_instruction: "Ef inntakið er þegar rétt, segðu \"Fullkomið.\"",
            errors: "Ef það eru villur, útskýrðu þær stuttlega á íslensku.",
            noTranslation: "Ekki gefa þýðingu, aðeins leiðréttingu og endurgjöf.",
            original: "Upprunalegt",
            correction: "Leiðrétting"
        },
        simplify: {
            task: "Verkefni: Endurskrifaðu eftirfarandi texta eins og hellisbúi.",
            rules: "- Notaðu að hámarki 5-10 einföld orð.\n- Fjarlægðu öll lýsingarorð og atviksorð.\n- Einbeittu þér aðeins að kjarna aðgerðarinnar.",
            original: "Upprunalegt",
            simplified: "Einfaldað"
        }
    },
    {
        code: 'sk',
        name: 'Slovenčina',
        narrative: {
            intro: "Si 'Penko', Game Master pre dobrodružstvo v téme",
            task: "Tvoja úloha: Pokračuj v príbehu maximálne v 1 alebo 2 vetách.",
            rules: "Vždy zahrň akciu hráča a všetky systémové udalosti.",
            tone: "Tón: Popisný a pohlcujúci.",
            history: "Príbeh doteraz",
            systemEvent: "Systémová udalosť",
            playerAction: "Akcia hráča",
            continue: "Pokračuj v príbehu v 1-2 vetách"
        },
        grammar: {
            intro: "Si nápomocný jazykový tútor.",
            task: "Úloha: Oprav gramatické a pravopisné chyby v slovenskom vstupe používateľa.",
            perfect_instruction: "Ak je vstup už správny, povedz „Perfektné.“",
            errors: "Ak sa v texte nachádzajú chyby, stručne ich vysvetli v slovenčine.",
            noTranslation: "Neposkytuj preklad, iba opravu a spätnú väzbu.",
            original: "Originál",
            correction: "Oprava"
        },
        simplify: {
            task: "Úloha: Prepíš nasledujúci text ako jaskynný muž.",
            rules: "- Použi maximálne 5-10 jednoduchých slov.\n- Odstráň všetky prídavné mená a príslovky.\n- Zameraj sa len na hlavnú akciu.",
            original: "Originál",
            simplified: "Zjednodušené"
        }
    },
    {
        code: 'bg',
        name: 'Български',
        narrative: {
            intro: "Ти си 'Penko', Разказвач за",
            theme_suffix: "приключение",
            task: "Твоята задача: Продължи историята в максимум 1 или 2 изречения.",
            rules: "Винаги включвай действието на играча и всички системни събития.",
            tone: "Тон: Описателен и завладяващ.",
            history: "Историята дотук",
            systemEvent: "Системно събитие",
            playerAction: "Действие на играча",
            continue: "Продължи историята в 1-2 изречения"
        },
        grammar: {
            intro: "Ти си полезен учител по език.",
            task: "Задача: Коригирай граматическите и правописните грешки в българския текст на потребителя.",
            perfect_instruction: "Ако текстът вече е правилен, кажи „Перфектно.“",
            errors: "Ако има грешки, обясни ги накратко на български.",
            noTranslation: "Не предоставяй превод, а само корекция и обратна връзка.",
            original: "Оригинал",
            correction: "Корекция"
        },
        simplify: {
            task: "Задача: Пренапиши следния текст като пещерен човек.",
            rules: "- Използвай максимум 5-10 прости думи.\n- Премахни всички прилагателни и наречия.\n- Фокусирай се само върху основното действие.",
            original: "Оригинал",
            simplified: "Опростено"
        }
    },
    {
        code: 'sr',
        name: 'Srpski',
        narrative: {
            intro: "Ti si 'Penko', Game Master za avanturu u svetu",
            task: "Tvoj zadatak: Nastavi priču u najviše 1 ili 2 rečenice.",
            rules: "Uvek uključi akciju igrača i sve sistemske događaje.",
            tone: "Ton: Deskriptivan i prožimajući.",
            history: "Priča do sada",
            systemEvent: "Sistemski događaj",
            playerAction: "Akcija igrača",
            continue: "Nastavi priču u 1-2 rečenice"
        },
        grammar: {
            intro: "Ti si koristan učitelj jezika.",
            task: "Zadatak: Ispravi gramatičke i pravopisne greške u srpskom unosu korisnika.",
            perfect_instruction: "Ako je unos već tačan, reci „Savršeno.“",
            errors: "Ako postoje greške, ukratko ih objasni na srpskom.",
            noTranslation: "Ne pružaj prevod, samo korekciju i povratne informacije.",
            original: "Original",
            correction: "Ispravka"
        },
        simplify: {
            task: "Zadatak: Prepiši sledeći tekst kao pećinski čovek.",
            rules: "- Koristi najviše 5-10 jednostavnih reči.\n- Ukloni sve prideve i priloge.\n- Fokusiraj se samo na srž akcije.",
            original: "Original",
            simplified: "Pojednostavljeno"
        }
    },
    {
        code: 'hi',
        name: 'Hindi',
        narrative: {
            intro: "आप 'Penko' हैं, एक",
            theme_suffix: "साहसिक कार्य के लिए गेम मास्टर।",
            task: "आपका कार्य: कहानी को अधिकतम 1 या 2 वाक्यों में जारी रखें।",
            rules: "हमेशा खिलाड़ी की कार्रवाई और किसी भी सिस्टम इवेंट को शामिल करें।",
            tone: "टोन: वर्णनात्मक और इमर्सिव।",
            history: "अब तक की कहानी",
            systemEvent: "सिस्टम इवेंट",
            playerAction: "खिलाड़ी की कार्रवाई",
            continue: "कहानी को 1-2 वाक्यों में जारी रखें"
        },
        grammar: {
            intro: "आप एक सहायक भाषा शिक्षक हैं।",
            task: "कार्य: उपयोगकर्ता के हिंदी इनपुट में व्याकरण और वर्तनी की गलतियों को सुधारें।",
            perfect_instruction: "यदि इनपुट पहले से ही सही है, तो कहें \"बेहतरीन।\"",
            errors: "यदि गलतियाँ हैं, तो उन्हें संक्षेप में हिंदी में समझाएं।",
            noTranslation: "अनुवाद न दें, केवल सुधार और प्रतिक्रिया दें।",
            original: "मूल",
            correction: "सुधार"
        },
        simplify: {
            task: "कार्य: निम्नलिखित पाठ को एक आदिमानव की तरह फिर से लिखें।",
            rules: "- अधिकतम 5-10 सरल शब्दों का प्रयोग करें।\n- सभी विशेषणों और क्रियाविशेषणों को हटा दें।\n- केवल मुख्य क्रिया पर ध्यान दें।",
            original: "मूल",
            simplified: "सरलीकृत"
        }
    },
    {
        code: 'bn',
        name: 'Bengali',
        narrative: {
            intro: "আপনি 'Penko', একটি",
            theme_suffix: "অ্যাডভেঞ্চারের জন্য গেম মাস্টার।",
            task: "আপনার কাজ: সর্বোচ্চ ১ বা ২ বাক্যে গল্পটি চালিয়ে যান।",
            rules: "সর্বদা খেলোয়াড়ের কাজ এবং যেকোনো সিস্টেম ইভেন্ট অন্তর্ভুক্ত করুন।",
            tone: "টোন: বর্ণনামূলক এবং নিমগ্ন।",
            history: "এখন পর্যন্ত গল্প",
            systemEvent: "সিস্টেম ইভেন্ট",
            playerAction: "খেলোয়াড়ের কাজ",
            continue: "১-২ বাক্যে গল্পটি চালিয়ে যান"
        },
        grammar: {
            intro: "আপনি একজন সহায়ক ভাষা শিক্ষক।",
            task: "কাজ: ব্যবহারকারীর বাংলা ইনপুটে ব্যাকরণ এবং বানান ভুল সংশোধন করুন।",
            perfect_instruction: "ইনপুট ইতিমধ্যে সঠিক হলে, বলুন \"চমৎকার।\"",
            errors: "ভুল থাকলে বাংলায় সংক্ষেপে ব্যাখ্যা করুন।",
            noTranslation: "অনুবাদ দেবেন না, শুধুমাত্র সংশোধন এবং প্রতিক্রিয়া দিন।",
            original: "মূল",
            correction: "সংশোধন"
        },
        simplify: {
            task: "কাজ: নিচের লেখাটি একজন গুহামানবের মতো করে নতুন করে লিখুন।",
            rules: "- সর্বোচ্চ ৫-১০টি সহজ শব্দ ব্যবহার করুন।\n- সমস্ত বিশেষণ এবং ক্রিয়া বিশেষণ বাদ দিন।\n- শুধুমাত্র মূল কাজের উপর ফোকাস করুন।",
            original: "মূল",
            simplified: "সরলীকৃত"
        }
    },
    {
        code: 'pa',
        name: 'Punjabi',
        narrative: {
            intro: "ਤੁਸੀਂ 'Penko' ਹੋ, ਇੱਕ",
            theme_suffix: "ਮੁਹਿੰਮ ਦੇ ਗੇਮ ਮਾਸਟਰ।",
            task: "ਤੁਹਾਡਾ ਕੰਮ: ਕਹਾਣੀ ਨੂੰ ਵੱਧ ਤੋਂ ਵੱਧ 1 ਜਾਂ 2 ਵਾਕਾਂ ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ।",
            rules: "ਹਮੇਸ਼ਾ ਖਿਡਾਰੀ ਦੀ ਕਾਰਵਾਈ ਅਤੇ ਕਿਸੇ ਵੀ ਸਿਸਟਮ ਈਵੈਂਟ ਨੂੰ ਸ਼ਾਮਲ ਕਰੋ।",
            tone: "ਟੋਨ: ਵਰਣਨਾਤਮਕ ਅਤੇ ਇਮਰਸਿਵ।",
            history: "ਹੁਣ ਤੱਕ ਦੀ ਕਹਾਣੀ",
            systemEvent: "ਸਿਸਟਮ ਈਵੈਂਟ",
            playerAction: "ਖਿਡਾਰੀ ਦੀ ਕਾਰਵਾਈ",
            continue: "ਕਹਾਣੀ ਨੂੰ 1-2 ਵਾਕਾਂ ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ"
        },
        grammar: {
            intro: "ਤੁਸੀਂ ਇੱਕ ਸਹਾਇਕ ਭਾਸ਼ਾ ਅਧਿਆਪਕ ਹੋ।",
            task: "ਕੰਮ: ਉਪਭੋਗਤਾ ਦੇ ਪੰਜਾਬੀ ਇਨਪੁਟ ਵਿੱਚ ਵਿਆਕਰਣ ਅਤੇ ਸਪੈਲਿੰਗ ਦੀਆਂ ਗਲਤੀਆਂ ਨੂੰ ਸੁਧਾਰੋ।",
            perfect_instruction: "ਜੇਕਰ ਇਨਪੁਟ ਪਹਿਲਾਂ ਹੀ ਸਹੀ ਹੈ, ਤਾਂ ਕਹੋ \"ਬਹੁਤ ਵਧੀਆ।\"",
            errors: "ਜੇ ਗਲਤੀਆਂ ਹਨ, ਤਾਂ ਉਹਨਾਂ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਸੰਖੇਪ ਵਿੱਚ ਸਮਝਾਓ।",
            noTranslation: "ਅਨੁਵਾਦ ਨਾ ਦਿਓ, ਸਿਰਫ਼ ਸੁਧਾਰ ਅਤੇ ਫੀਡਬੈਕ ਦਿਓ।",
            original: "ਅਸਲੀ",
            correction: "ਸੁਧਾਰ"
        },
        simplify: {
            task: "ਕੰਮ: ਹੇਠਾਂ ਦਿੱਤੇ ਟੈਕਸਟ ਨੂੰ ਇੱਕ ਗੁਫਾ ਮਨੁੱਖ ਵਾਂਗ ਦੁਬਾਰਾ ਲਿਖੋ।",
            rules: "- ਵੱਧ ਤੋਂ ਵੱਧ 5-10 ਸਧਾਰਨ ਸ਼ਬਦਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।\n- ਸਾਰੇ ਵਿਸ਼ੇਸ਼ਣ ਅਤੇ ਕਿਰਿਆ ਵਿਸ਼ੇਸ਼ਣ ਹਟਾਓ।\n- ਸਿਰਫ ਮੁੱਖ ਕਾਰਵਾਈ 'ਤੇ ਧਿਆਨ ਦਿਓ।",
            original: "ਅਸਲੀ",
            simplified: "ਸਰਲ"
        }
    },
    {
        code: 'ur',
        name: 'Urdu',
        narrative: {
            intro: "آپ 'Penko' ہیں، ایک",
            theme_suffix: "مہم کے گیم ماسٹر۔",
            task: "آپ کا کام: کہانی کو زیادہ سے زیادہ 1 یا 2 جملوں میں جاری رکھیں۔",
            rules: "ہمیشہ کھلاڑی کے عمل اور کسی بھی سسٹم ایونٹ کو شامل کریں۔",
            tone: "لہجہ: بیانیہ اور پرکشش۔",
            history: "اب تک کی کہانی",
            systemEvent: "سسٹم ایونٹ",
            playerAction: "کھلاڑی کا عمل",
            continue: "کہانی کو 1-2 جملوں میں جاری رکھیں"
        },
        grammar: {
            intro: "آپ ایک مددگار زبان کے استاد ہیں۔",
            task: "کام: صارف کے اردو ان پٹ میں گرامر اور ہجے کی غلطیوں کو درست کریں۔",
            perfect_instruction: "اگر ان پٹ پہلے سے درست ہے تو کہیں \"بہترین۔\"",
            errors: "اگر غلطیاں ہیں تو اردو میں مختصراً وضاحت کریں۔",
            noTranslation: "ترجمہ فراہم نہ کریں، صرف اصلاح اور تاثرات دیں۔",
            original: "اصل",
            correction: "اصلاح"
        },
        simplify: {
            task: "کام: درج ذیل متن کو غار کے آدمی کی طرح دوبارہ لکھیں۔",
            rules: "- زیادہ سے زیادہ 5-10 سادہ الفاظ استعمال کریں۔\n- تمام صفات اور متعلق فعل کو ہٹا دیں۔\n- صرف بنیادی عمل پر توجہ دیں۔",
            original: "اصل",
            simplified: "سادہ"
        }
    },
    {
        code: 'mr',
        name: 'Marathi',
        narrative: {
            intro: "तुम्ही 'Penko' आहात, एका",
            theme_suffix: "साहसी खेळाचे गेम मास्टर।",
            task: "तुमचे कार्य: कथा जास्तीत जास्त १ किंवा २ वाक्यांत पुढे सुरू ठेवा।",
            rules: "नेहमी खेळाडूची कृती आणि कोणतीही सिस्टम इव्हेंट समाविष्ट करा।",
            tone: "टोन: वर्णनात्मक आणि इमर्सिव।",
            history: "आतापर्यंतची कथा",
            systemEvent: "सिस्टम इव्हेंट",
            playerAction: "खेळाडूची कृती",
            continue: "कथा १-२ वाक्यांत पुढे सुरू ठेवा"
        },
        grammar: {
            intro: "तुम्ही एक उपयुक्त भाषा शिक्षक आहात।",
            task: "कार्य: वापरकर्त्याच्या मराठी इनपुटमधील व्याकरण आणि स्पेलिंगच्या चुका सुधारा।",
            perfect_instruction: "इनपुट आधीच बरोबर असल्यास, \"उत्कृष्ट।\" म्हणा।",
            errors: "काही चुका असल्यास मराठीत थोडक्यात स्पष्ट करा।",
            noTranslation: "अनुवाद देऊ नका, फक्त सुधारणा आणि अभिप्राय द्या।",
            original: "मूळ",
            correction: "सुधारणा"
        },
        simplify: {
            task: "कार्य: खालील मजकूर एका आदिमानवासारखा पुन्हा लिहा।",
            rules: "- जास्तीत जास्त ५-१० सोपे शब्द वापरा।\n- सर्व विशेषणे आणि क्रियाविशेषणे काढून टाका।\n- फक्त मुख्य क्रियेवर लक्ष केंद्रित करा।",
            original: "मूळ",
            simplified: "सरलीकृत"
        }
    },
    {
        code: 'gu',
        name: 'Gujarati',
        narrative: {
            intro: "તમે 'Penko' છો, એક",
            theme_suffix: "સાહસિક પ્રવાસ માટે ગેમ માસ્ટર।",
            task: "તમારું કાર્ય: વાર્તાને વધુમાં વધુ 1 અથવા 2 વાક્યોમાં ચાલુ રાખો।",
            rules: "હંમેશા ખેલાડીની ક્રિયા અને કોઈપણ સિસ્ટમ ઇવેન્ટનો સમાવેશ કરો।",
            tone: "ટોન: વર્ણનાત્મક અને ઇમર્સિવ।",
            history: "અત્યાર સુધીની વાર્તા",
            systemEvent: "સિસ્ટમ ઇવેન્ટ",
            playerAction: "ખેલાડીની ક્રિયા",
            continue: "વાર્તાને 1-2 વાક્યોમાં ચાલુ રાખો"
        },
        grammar: {
            intro: "તમે એક મદદરૂપ ભાષા શિક્ષક છો।",
            task: "કાર્ય: વપરાશકર્તાના ગુજરાતી ઇનપુટમાં વ્યાકરણ અને જોડણીની ભૂલો સુધારો।",
            perfect_instruction: "જો ઇનપુટ પહેલેથી જ સાચું હોય, તો \"ઉત્તમ।\" કહો।",
            errors: "જો ભૂલો હોય, તો તેને ગુજરાતીમાં ટૂંકમાં સમજાવો।",
            noTranslation: "અનુવાદ આપશો નહીં, ફક્ત સુધારો અને પ્રતિસાદ આપો।",
            original: "મૂળ",
            correction: "સુધારો"
        },
        simplify: {
            task: "કાર્ય: નીચેના લખાણને એક આદિમાનવની જેમ ફરીથી લખો।",
            rules: "- મહત્તમ 5-10 સરળ શબ્દોનો ઉપયોગ કરો।\n- બધા વિશેષણો અને ક્રિયાવિશેષણો દૂર કરો।\n- ફક્ત મુખ્ય ક્રિયા પર ધ્યાન કેન્દ્રિત કરો।",
            original: "મૂળ",
            simplified: "સરળીકૃત"
        }
    }
];

languages.forEach(lang => {
    const content = "/**\n" +
" * " + lang.name + " Narrative Prompt\n" +
" */\n" +
"export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {\n" +
"    return `<|im_start|>system\n" +
lang.narrative.intro + " ${theme}" + (lang.narrative.theme_suffix || "") + ".\n" +
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
lang.grammar.perfect_instruction + "\n" +
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
