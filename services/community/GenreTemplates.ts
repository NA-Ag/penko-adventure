/**
 * Genre-Specific Response Templates for Community Mode
 * 
 * Each genre has unique flavor while maintaining the same Berlitz error correction
 * - Fantasy: Magical, ancient, mystical atmosphere
 * - SciFi: Technical, futuristic, electronic atmosphere
 * - Horror: Dark, dread, fear, sinister atmosphere
 * - Western: Dusty, gritty, weathered, rough atmosphere
 * - Cyberpunk: Neon, digital, edgy, augmented atmosphere
 * - Mystery: Clues, investigation, discovery atmosphere
 */

import { Language } from '../../types';
import { ObjectIntent } from './ObjectSystem';
import { ResponseTemplate, NarrativeGenre } from './ResponseTemplates';

/**
 * Fantasy Genre Templates - Magical, mystical, ancient
 */
export const FANTASY_TEMPLATES: ResponseTemplate[] = [
  // EXAMINE - Fantasy (with Berlitz verb highlighting)
  {
    id: 'examine_success_fantasy',
    intent: 'EXAMINE',
    genre: 'Fantasy',
    templates: {
      [Language.ENGLISH]: [
        '**[nativeVerb]** the [object]. Magical energy radiates from it.',
        '**[nativeVerb]** the [object]. Its ancient power calls to you.',
        '**[nativeVerb]** the [object] carefully. Arcane symbols shimmer before your eyes.',
      ],
      [Language.SPANISH]: [
        '**[nativeVerb]** [object]. Una energía mágica irradia de ella.',
        '**[nativeVerb]** [object]. Su poder ancestral te llama.',
        '**[nativeVerb]** cuidadosamente [object]. Símbolos arcanos brillan ante tus ojos.',
      ],
      [Language.FRENCH]: [
        '**[nativeVerb]** [object]. Une énergie magique rayonne d\'elle.',
        '**[nativeVerb]** [object]. Son ancien pouvoir vous appelle.',
      ],
      [Language.GERMAN]: [
        '**[nativeVerb]** [object]. Magische Energie strahlt davon aus.',
        '**[nativeVerb]** [object]. Seine uralte Kraft ruft dich.',
      ],
      [Language.ITALIAN]: [
        '**[nativeVerb]** [object]. Un\'energia magica irradia da essa.',
        '**[nativeVerb]** [object]. Il suo potere antico ti chiama.',
      ],
      [Language.JAPANESE]: [
        '[object]を**[nativeVerb]**。魔法のエネルギーがそれから放射される。',
        '[object]を**[nativeVerb]**。その古い力があなたを呼ぶ。',
      ],
      [Language.MANDARIN]: [
        '你**[nativeVerb]**[object]。魔法能量从它散发出来。',
        '你**[nativeVerb]**[object]。它的古老力量在呼唤你。',
      ],
      [Language.RUSSIAN]: [
        '**[nativeVerb]** [object]. От него исходит магическая энергия.',
        '**[nativeVerb]** [object]. Его древняя сила призывает вас.',
      ],
      [Language.PORTUGUESE]: [
        '**[nativeVerb]** [object]. Energia mágica irradia dela.',
        '**[nativeVerb]** [object]. Seu poder antigo a chama.',
      ],
      [Language.UKRAINIAN]: [
        '**[nativeVerb]** [object]. Магічна енергія виходить від неї.',
        '**[nativeVerb]** [object]. Її древня сила вас закликає.',
      ],
      [Language.POLISH]: [
        '**[nativeVerb]** [object]. Z niej promieniuje magiczna energia.',
        '**[nativeVerb]** [object]. Jej stara moc cię wzywa.',
      ],
      [Language.CZECH]: [
        '**[nativeVerb]** [object]. Z ní vyzařuje magická energie.',
        '**[nativeVerb]** [object]. Její starobylá moc tě volá.',
      ],
    },
    priority: 10,
  },

  // TAKE - Fantasy Success (with Berlitz verb highlighting)
  {
    id: 'take_success_fantasy',
    intent: 'TAKE',
    genre: 'Fantasy',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        '**[nativeVerb]** the [object]. Ancient magic thrums through your hand.',
        '**[nativeVerb]** the [object]. Mystical light surrounds it.',
        '**[nativeVerb]** the [object]. A warm glow emanates from within.',
      ],
      [Language.SPANISH]: [
        '**[nativeVerb]** [object]. La magia antigua vibra en tu mano.',
        '**[nativeVerb]** [object]. Una luz mística la rodea.',
        '**[nativeVerb]** [object]. Un resplandor cálido emana de ella.',
      ],
      [Language.FRENCH]: [
        '**[nativeVerb]** [object]. La magie ancienne vibre dans votre main.',
        '**[nativeVerb]** [object]. Une lumière mystique l\'entoure.',
      ],
      [Language.GERMAN]: [
        '**[nativeVerb]** [object]. Alte Magie vibriert in deiner Hand.',
        '**[nativeVerb]** [object]. Mystisches Licht umgibt sie.',
      ],
      [Language.ITALIAN]: [
        '**[nativeVerb]** [object]. Un potere antico vibra nelle tue mani.',
        '**[nativeVerb]** [object], che brilla di energia mistica.',
      ],
      [Language.JAPANESE]: [
        '[object]を**[nativeVerb]**。古い魔法があなたの手に鼓動する。',
        '[object]を**[nativeVerb]**、神秘的なエネルギーで輝く。',
      ],
      [Language.MANDARIN]: [
        '你**[nativeVerb]**[object]。古老的魔法在你手中跳动。',
        '你**[nativeVerb]**[object]，闪烁着神秘的能量。',
      ],
      [Language.RUSSIAN]: [
        '**[nativeVerb]** [object]. Древняя магия пульсирует в ваших руках.',
        '**[nativeVerb]** [object], светящийся мистической энергией.',
      ],
      [Language.PORTUGUESE]: [
        '**[nativeVerb]** [object]. Magia antiga pulsa em suas mãos.',
        '**[nativeVerb]** [object], brilhando com energia mística.',
      ],
      [Language.UKRAINIAN]: [
        '**[nativeVerb]** [object]. Давня магія тріпоче у ваших руках.',
        '**[nativeVerb]** [object], що світиться містичною енергією.',
      ],
      [Language.POLISH]: [
        '**[nativeVerb]** [object]. W twoich rękach tętnią starożytne czary.',
        '**[nativeVerb]** [object], świecący mistyczną energią.',
      ],
      [Language.CZECH]: [
        '**[nativeVerb]** [object]. Ve tvých rukou pulzuje starobylá kouzla.',
        '**[nativeVerb]** [object], zářící mystickou energií.',
      ],
    },
    priority: 10,
  },

  // OPEN - Fantasy Success
  {
    id: 'open_success_fantasy',
    intent: 'OPEN',
    genre: 'Fantasy',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        'With a mystical click, [object] swings open. Enchantment glows from within.',
        'You push [object] and it opens with a whisper of magic.',
        '[object] opens to reveal treasures bathed in ethereal light.',
      ],
      [Language.SPANISH]: [
        'Con un clic místico, [object] se abre. El encantamiento brilla desde adentro.',
        'Empujas [object] y se abre con un susurro de magia.',
        '[object] se abre para revelar tesoros bañados en luz etérea.',
      ],
      [Language.FRENCH]: [
        'Avec un clic mystique, [object] s\'ouvre. L\'enchantement brille de l\'intérieur.',
        'Vous poussez [object] et elle s\'ouvre avec un murmure de magie.',
      ],
      [Language.GERMAN]: [
        'Mit einem mystischen Klick öffnet sich [object]. Verzauberung leuchtet von innen.',
        'Du drückst [object] und sie öffnet sich mit einem Hauch von Magie.',
      ],
      [Language.ITALIAN]: [
        'Con un clic mistico, [object] si apre. L\'incantesimo brilla dall\'interno.',
        'Spingi [object] e si apre con un sussurro di magia.',
      ],
      [Language.JAPANESE]: [
        '神秘的なクリックで、[object]が開く。魔法が内から輝く。',
        '[object]を押すと、魔法の囁きとともに開く。',
      ],
      [Language.MANDARIN]: [
        '随着神秘的咔哒声，[object]打开了。魔法从内部闪耀。',
        '你推动[object]，它伴随着魔法的低语打开。',
      ],
      [Language.RUSSIAN]: [
        'С мистическим щелчком [object] открывается. Чары светят изнутри.',
        'Вы толкаете [object], и она открывается с шепотом магии.',
      ],
      [Language.PORTUGUESE]: [
        'Com um clique místico, [object] se abre. O encantamento brilha de dentro.',
        'Você empurra [object] e ela se abre com um sussurro de magia.',
      ],
      [Language.UKRAINIAN]: [
        'З містичним клацанням [object] відкривається. Чари світяться зсередини.',
        'Ви штовхаєте [object], і вона відкривається з шепотом магії.',
      ],
      [Language.POLISH]: [
        'Z mistycznym kliknięciem [object] się otwiera. Czary błyszczą od wewnątrz.',
        'Pchasz [object] i otwiera się szeptem magii.',
      ],
      [Language.CZECH]: [
        'S mystickým kliknutím se [object] otevře. Kouzla svítí zevnitř.',
        'Strčíš do [object] a otevře se šeptem magie.',
      ],
    },
    priority: 10,
  },

  // DROP - Fantasy
  {
    id: 'drop_success_fantasy',
    intent: 'DROP',
    genre: 'Fantasy',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        'You release [object]. It falls with a magical shimmer.',
        '[object] tumbles from your grasp, trailing arcane light.',
        'You set down [object] gently. It settles with a soft enchanted glow.',
      ],
      [Language.SPANISH]: [
        'Sueltas [object]. Cae con un brillo mágico.',
        '[object] se cae de tu mano, dejando rastros de luz arcana.',
        'Dejas [object] suavemente. Se asienta con un brillo encantado suave.',
      ],
      [Language.FRENCH]: [
        'Vous relâchez [object]. Elle tombe avec un scintillement magique.',
        '[object] tombe de votre main, laissant des traînées de lumière arcane.',
      ],
      [Language.GERMAN]: [
        'Du lässt [object] fallen. Sie fällt mit einem magischen Schimmer.',
        '[object] fällt aus deiner Hand und hinterlässt arkane Lichter.',
      ],
      [Language.ITALIAN]: [
        'Lasci cadere [object]. Cade con uno scintillio magico.',
        '[object] cade dalle tue mani, lasciando scie di luce arcana.',
      ],
      [Language.JAPANESE]: [
        '[object]を手放す。魔法の輝きとともに落ちる。',
        '[object]があなたの手から落ち、秘術の光の道を残す。',
      ],
      [Language.MANDARIN]: [
        '你放开[object]。它伴随魔法的闪烁而下落。',
        '[object]从你的手中坠落，留下秘术之光。',
      ],
      [Language.RUSSIAN]: [
        'Вы отпускаете [object]. Она падает с магическим мерцанием.',
        '[object] падает из ваших рук, оставляя след магии.',
      ],
      [Language.PORTUGUESE]: [
        'Você solta [object]. Cai com um brilho mágico.',
        '[object] cai das suas mãos, deixando rastros de luz arcana.',
      ],
      [Language.UKRAINIAN]: [
        'Ви відпускаєте [object]. Вона падає з магічним миготінням.',
        '[object] падає з ваших рук, залишаючи слід магії.',
      ],
      [Language.POLISH]: [
        'Puszczasz [object]. Spada z magicznym blaskiem.',
        '[object] pada z twoich rąk, zostawiając ślady światła arkańskiego.',
      ],
      [Language.CZECH]: [
        'Pustíš [object]. Padá s magickým svitem.',
        '[object] padá z tvých rukou, zanechávaje stopy magického světla.',
      ],
    },
    priority: 10,
  },

  // TALK - Fantasy
  {
    id: 'talk_success_fantasy',
    intent: 'TALK',
    genre: 'Fantasy',
    templates: {
      [Language.ENGLISH]: [
        'You speak with [object]. Wisdom from ages past resonates in their words.',
        'Your conversation with [object] feels touched by ancient magic.',
        '[object] speaks, and you sense centuries of knowledge behind their eyes.',
      ],
      [Language.SPANISH]: [
        'Hablas con [object]. La sabiduría del pasado resuena en sus palabras.',
        'Tu conversación con [object] parece tocada por magia antigua.',
        '[object] habla, y sientes siglos de conocimiento tras sus ojos.',
      ],
      [Language.FRENCH]: [
        'Vous parlez avec [object]. La sagesse du passé résonne dans leurs paroles.',
        'Votre conversation avec [object] semble touchée par la magie ancienne.',
      ],
      [Language.GERMAN]: [
        'Du sprichst mit [object]. Die Weisheit der Vergangenheit erklingt in ihren Worten.',
        'Dein Gespräch mit [object] scheint von alter Magie berührt zu sein.',
      ],
      [Language.ITALIAN]: [
        'Parli con [object]. La saggezza del passato risuona nelle loro parole.',
        'La tua conversazione con [object] sembra toccata dalla magia antica.',
      ],
      [Language.JAPANESE]: [
        '[object]と話す。過去の知恵が彼らの言葉に響く。',
        '[object]との会話は古い魔法に触れられているようだ。',
      ],
      [Language.MANDARIN]: [
        '你与[object]交谈。过去的智慧在他们的话语中回响。',
        '你与[object]的谈话似乎被古老的魔法所触碰。',
      ],
      [Language.RUSSIAN]: [
        'Вы разговариваете с [object]. В их словах звучит мудрость прошлого.',
        'Ваш разговор с [object] кажется тронутым древней магией.',
      ],
      [Language.PORTUGUESE]: [
        'Você fala com [object]. A sabedoria do passado ressoa nas suas palavras.',
        'Sua conversa com [object] parece tocada pela magia antiga.',
      ],
      [Language.UKRAINIAN]: [
        'Ви говорите з [object]. Мудрість минулого звучить у їхніх словах.',
        'Ваша розмова з [object] здається торкнутою давньою магією.',
      ],
      [Language.POLISH]: [
        'Mówisz z [object]. W ich słowach brzmi mądrość przeszłości.',
        'Twoja rozmowa z [object] wydaje się dotknięta starożytną magią.',
      ],
      [Language.CZECH]: [
        'Mluvíš s [object]. V jejich slovech zní moudrost minulosti.',
        'Tvůj rozhovor s [object] se zdá být dotčen starobylou magií.',
      ],
    },
    priority: 10,
  },

  // USE - Fantasy
  {
    id: 'use_success_fantasy',
    intent: 'USE',
    genre: 'Fantasy',
    templates: {
      [Language.ENGLISH]: [
        'You activate [object]. Mystical forces surge around you.',
        'With a gesture, [object] comes alive with enchanted power.',
        'You invoke the magic of [object]. Reality shimmers at the edges.',
      ],
      [Language.SPANISH]: [
        'Activas [object]. Fuerzas místicas surgen a tu alrededor.',
        'Con un gesto, [object] cobra vida con poder encantado.',
        'Invocas la magia de [object]. La realidad brilla en los bordes.',
      ],
      [Language.FRENCH]: [
        'Vous activez [object]. Des forces mystiques surgissent autour de vous.',
        'D\'un geste, [object] prend vie avec un pouvoir enchanté.',
      ],
      [Language.GERMAN]: [
        'Du aktivierst [object]. Mystische Kräfte entstehen um dich herum.',
        'Mit einer Geste wird [object] lebendig mit verzauberter Kraft.',
      ],
      [Language.ITALIAN]: [
        'Attivi [object]. Forze mistiche sorgono intorno a te.',
        'Con un gesto, [object] prende vita con potere incantato.',
      ],
      [Language.JAPANESE]: [
        '[object]を起動させる。神秘的な力があなたの周りに湧き上がる。',
        'ジェスチャーで[object]は魔法の力で目覚める。',
      ],
      [Language.MANDARIN]: [
        '你激活[object]。神秘力量在你周围涌起。',
        '一个手势，[object]充满了魔法的力量。',
      ],
      [Language.RUSSIAN]: [
        'Вы активируете [object]. Мистические силы возникают вокруг вас.',
        'С жестом [object] оживает магической силой.',
      ],
      [Language.PORTUGUESE]: [
        'Você ativa [object]. Forças místicas surgem ao seu redor.',
        'Com um gesto, [object] ganha vida com poder encantado.',
      ],
      [Language.UKRAINIAN]: [
        'Ви активуєте [object]. Містичні сили виникають навколо вас.',
        'З жестом [object] пробуджується магічною силою.',
      ],
      [Language.POLISH]: [
        'Aktywujesz [object]. Siły mistyczne pojawiają się wokół ciebie.',
        'Gestem [object] ożywa magiczną mocą.',
      ],
      [Language.CZECH]: [
        'Aktivuješ [object]. Mystické síly vznikají kolem tebe.',
        'Gestem se [object] oživuje magickou silou.',
      ],
    },
    priority: 10,
  },
];

/**
 * SciFi Genre Templates - Technical, futuristic, electronic
 */
export const SCIFI_TEMPLATES: ResponseTemplate[] = [
  // EXAMINE - SciFi
  {
    id: 'examine_success_scifi',
    intent: 'EXAMINE',
    genre: 'SciFi',
    templates: {
      [Language.ENGLISH]: [
        'You scan [object]. Holographic data streams flow across your neural interface.',
        'Technical analysis of [object] reveals advanced technology beyond current understanding.',
        'Your sensors analyze [object]. Quantum processors hum with activity.',
      ],
      [Language.SPANISH]: [
        'Escaneas [object]. Flujos de datos holográficos atraviesan tu interfaz neural.',
        'El análisis técnico de [object] revela tecnología avanzada.',
        'Tus sensores analizan [object]. Los procesadores cuánticos ronronean.',
      ],
      [Language.FRENCH]: [
        'Vous scannez [object]. Des flux de données holographiques traversent votre interface neurale.',
        'L\'analyse technique de [object] révèle une technologie avancée.',
      ],
      [Language.GERMAN]: [
        'Du scannst [object]. Holografische Datenströme fließen durch deine neurale Schnittstelle.',
        'Die technische Analyse von [object] zeigt fortgeschrittene Technologie.',
      ],
      [Language.ITALIAN]: [
        'Scansioni [object]. Flussi di dati olografici scorrono attraverso la tua interfaccia neurale.',
        'L\'analisi tecnica di [object] rivela tecnologia avanzata.',
      ],
      [Language.JAPANESE]: [
        '[object]をスキャンする。ホログラフィックデータストリームがニューラルインターフェースを流れる。',
        '[object]の技術分析は高度な技術を明かす。',
      ],
      [Language.MANDARIN]: [
        '你扫描[object]。全息数据流流过你的神经界面。',
        '[object]的技术分析揭示了先进的技术。',
      ],
      [Language.RUSSIAN]: [
        'Вы сканируете [object]. Потоки голографических данных текут через ваш нейронный интерфейс.',
        'Технический анализ [object] выявляет передовые технологии.',
      ],
      [Language.PORTUGUESE]: [
        'Você digitaliza [object]. Fluxos de dados holográficos fluem através da sua interface neural.',
        'A análise técnica de [object] revela tecnologia avançada.',
      ],
      [Language.UKRAINIAN]: [
        'Ви сканируєте [object]. Голографічні потоки даних текуть через ваш нейронний інтерфейс.',
        'Технічний аналіз [object] виявляє передову технологію.',
      ],
      [Language.POLISH]: [
        'Skanируjesz [object]. Holograficzne strumienie danych przepływają przez twój interfejs neuronowy.',
        'Analiza techniczna [object] ujawnia zaawansowaną technologię.',
      ],
      [Language.CZECH]: [
        'Skenituješ [object]. Holografické toky dat proudí skrz tvůj neuronální rozhraní.',
        'Technická analýza [object] odhaluje pokročilou technologii.',
      ],
    },
    priority: 10,
  },

  // TAKE - SciFi Success
  {
    id: 'take_success_scifi',
    intent: 'TAKE',
    genre: 'SciFi',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        'You secure [object]. Lights blink in acknowledgment across its surface.',
        'You retrieve [object]. The device\'s systems activate with a soft hum.',
        '[object] is now in your inventory. Diagnostic systems confirm optimal functionality.',
      ],
      [Language.SPANISH]: [
        'Aseguras [object]. Las luces parpadean en reconocimiento en su superficie.',
        'Recuperas [object]. Los sistemas del dispositivo se activan con un zumbido suave.',
        '[object] está ahora en tu inventario. Los sistemas de diagnóstico confirman funcionalidad.',
      ],
      [Language.FRENCH]: [
        'Vous sécurisez [object]. Les voyants clignotent en reconnaissance sur sa surface.',
        'Vous récupérez [object]. Les systèmes de l\'appareil s\'activent avec un léger bourdonnement.',
      ],
      [Language.GERMAN]: [
        'Du sicherst [object]. Lichter blinken auf ihrer Oberfläche zur Bestätigung.',
        'Du holst [object]. Die Systeme des Geräts aktivieren sich mit einem sanften Summen.',
      ],
      [Language.ITALIAN]: [
        'Assicuri [object]. Le luci lampeggiano in riconoscimento sulla sua superficie.',
        'Recuperi [object]. I sistemi del dispositivo si attivano con un leggero ronzio.',
      ],
      [Language.JAPANESE]: [
        '[object]を確保する。その表面の光が了解を示す。',
        '[object]を取得する。デバイスのシステムが軽いハムで起動する。',
      ],
      [Language.MANDARIN]: [
        '你固定[object]。灯光在其表面闪烁以确认。',
        '你检索[object]。设备的系统以轻微的嗡嗡声激活。',
      ],
      [Language.RUSSIAN]: [
        'Вы закрепляете [object]. На его поверхности мигают огни подтверждения.',
        'Вы получаете [object]. Системы устройства активируются с мягким гудением.',
      ],
      [Language.PORTUGUESE]: [
        'Você protege [object]. As luzes piscam em reconhecimento em sua superfície.',
        'Você recupera [object]. Os sistemas do dispositivo ativam com um zumbido suave.',
      ],
      [Language.UKRAINIAN]: [
        'Ви закріплюєте [object]. Вогні блимають на його поверхні в знак визнання.',
        'Ви отримуєте [object]. Системи пристрою активуються з м\'яким гудінням.',
      ],
      [Language.POLISH]: [
        'Zabezpieczasz [object]. Światła migają w potwierdzeniu na jego powierzchni.',
        'Wyznawiasz [object]. Systemy urządzenia aktywują się cichym bzyczeniem.',
      ],
      [Language.CZECH]: [
        'Zabezpečuješ [object]. Světla na jeho povrchu blikají v potvrzení.',
        'Vyzvedneš si [object]. Systémy zařízení se aktivují tichým bzučením.',
      ],
    },
    priority: 10,
  },

  // OPEN - SciFi Success
  {
    id: 'open_success_scifi',
    intent: 'OPEN',
    genre: 'SciFi',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        '[object] slides open with a digital chirp. Access granted to secured compartment.',
        'You unlock [object]. Pneumatic seals hiss as it opens.',
        '[object] responds to your input. Advanced security systems verify your clearance.',
      ],
      [Language.SPANISH]: [
        '[object] se desliza abierto con un sonido digital. Acceso otorgado al compartimento seguro.',
        'Desbloqueas [object]. Los sellos neumáticos silban mientras se abre.',
        '[object] responde a tu entrada. Los sistemas de seguridad avanzados verifican tu autorización.',
      ],
      [Language.FRENCH]: [
        '[object] glisse avec un bip numérique. Accès accordé au compartiment sécurisé.',
        'Vous déverrouillez [object]. Les joints pneumatiques sifflent en s\'ouvrant.',
      ],
      [Language.GERMAN]: [
        '[object] gleitet mit einem digitalen Piep auf. Zugang zu gesichertem Fach erteilt.',
        'Du entsperrst [object]. Pneumatische Dichtungen zischen beim Öffnen.',
      ],
      [Language.ITALIAN]: [
        '[object] scivola aperto con un cinguettio digitale. Accesso accordato al vano sicuro.',
        'Sblocchi [object]. I sigilli pneumatici sibilano mentre si apre.',
      ],
      [Language.JAPANESE]: [
        '[object]がデジタルチャープで滑る。セキュアコンパートメントへのアクセスが許可される。',
        '[object]をロック解除する。空気圧シールが開くときにシーという音がする。',
      ],
      [Language.MANDARIN]: [
        '[object]用数字吱吱声滑开。对安全隔间的访问被批准。',
        '你解锁[object]。气动密封件打开时发出嘶鸣声。',
      ],
      [Language.RUSSIAN]: [
        '[object] раскрывается с цифровым щебетом. Доступ к защищённому отсеку предоставлен.',
        'Вы разблокируете [object]. Пневматические уплотнения шипят при открытии.',
      ],
      [Language.PORTUGUESE]: [
        '[object] desliza aberto com um chirp digital. Acesso concedido ao compartimento seguro.',
        'Você desbloqueia [object]. Os selos pneumáticos sibilam quando abrem.',
      ],
      [Language.UKRAINIAN]: [
        '[object] відкривається з цифровим щебетанням. Доступ до захищеної секції надано.',
        'Ви розблоковуєте [object]. Пневматичні ущільнення шиплять при відкритті.',
      ],
      [Language.POLISH]: [
        '[object] przesuwa się otwarte z cyfrowym ćwierkaniem. Dostęp do bezpiecznego przedziału przyznany.',
        'Odblokuwujesz [object]. Uszczelnienia pneumatyczne syczą się otwierając.',
      ],
      [Language.CZECH]: [
        '[object] se posunuje otevřeným digitálním ščebetem. Přístup do zabezpečené přihrádky je vykázán.',
        'Odemykáš [object]. Pneumatické těsnění syčí při otevírání.',
      ],
    },
    priority: 10,
  },

  // USE - SciFi
  {
    id: 'use_success_scifi',
    intent: 'USE',
    genre: 'SciFi',
    templates: {
      [Language.ENGLISH]: [
        'You activate [object]. Electrical circuits surge with power.',
        '[object] comes online. Status lights indicate all systems nominal.',
        'You engage [object]. Quantum processors hum to life.',
      ],
      [Language.SPANISH]: [
        'Activas [object]. Los circuitos eléctricos surgen con poder.',
        '[object] se conecta. Los indicadores de estado muestran todos los sistemas nominales.',
        'Activas [object]. Los procesadores cuánticos zumban para cobrar vida.',
      ],
      [Language.FRENCH]: [
        'Vous activez [object]. Les circuits électriques surgissent avec puissance.',
        '[object] est en ligne. Les voyants d\'état indiquent que tous les systèmes sont nominaux.',
      ],
      [Language.GERMAN]: [
        'Du aktivierst [object]. Elektrische Schaltkreise fluten mit Energie.',
        '[object] kommt online. Statusleuchten zeigen alle Systeme nominal.',
      ],
    },
    priority: 10,
  },

  // DROP - SciFi
  {
    id: 'drop_success_scifi',
    intent: 'DROP',
    genre: 'SciFi',
    templates: {
      [Language.ENGLISH]: [
        'You release [object]. It falls with electronic precision.',
        '[object] drops from your grip, systems blinking with impact.',
        'You set [object] down. Gravitational sensors calibrate its new position.',
      ],
      [Language.SPANISH]: [
        'Sueltas [object]. Cae con precisión electrónica.',
        '[object] se cae de tu mano, los sistemas parpadean con el impacto.',
        'Dejas [object]. Los sensores gravitacionales calibran su nueva posición.',
      ],
      [Language.FRENCH]: [
        'Vous relâchez [object]. Elle tombe avec précision électronique.',
        '[object] tombe de votre prise, les systèmes clignotent à l\'impact.',
      ],
      [Language.GERMAN]: [
        'Du lässt [object] fallen. Sie fällt mit elektronischer Präzision.',
        '[object] fällt aus deinem Griff, Systeme blinken beim Aufprall.',
      ],
      [Language.ITALIAN]: [
        'Rilasci [object]. Cade con precisione elettronica.',
        '[object] cade dalla tua presa, i sistemi lampeggiano all\'impatto.',
      ],
      [Language.JAPANESE]: [
        '[object]を放す。電子的な精密さで落ちる。',
        '[object]が握りから落ちる。衝撃でシステムが点滅する。',
      ],
      [Language.MANDARIN]: [
        '你释放[object]。以电子精度下落。',
        '[object]从你的握力中掉落。系统在撞击时闪烁。',
      ],
      [Language.RUSSIAN]: [
        'Вы отпускаете [object]. Она падает с электронной точностью.',
        '[object] падает из вашего захвата. Системы мигают при ударе.',
      ],
      [Language.PORTUGUESE]: [
        'Você libera [object]. Cai com precisão eletrônica.',
        '[object] cai de seu aperto, os sistemas piscam com o impacto.',
      ],
      [Language.UKRAINIAN]: [
        'Ви відпускаєте [object]. Вона падає з електронною точністю.',
        '[object] падає з вашого захоплення. Системи блимають при впливі.',
      ],
      [Language.POLISH]: [
        'Puszczasz [object]. Spada z elektroniczną precyzją.',
        '[object] pada z twojego uścisku, systemy migają przy uderzeniu.',
      ],
      [Language.CZECH]: [
        'Uvolníš [object]. Padá s elektronickou přesností.',
        '[object] padá z tvého úchopu, systémy blikají při nárazu.',
      ],
    },
    priority: 10,
  },

  // TALK - SciFi
  {
    id: 'talk_success_scifi',
    intent: 'TALK',
    genre: 'SciFi',
    templates: {
      [Language.ENGLISH]: [
        'You interface with [object]. Data transmission complete.',
        '[object]\'s audio systems activate. Communication established.',
        'You sync with [object]. Information exchange successful.',
      ],
      [Language.SPANISH]: [
        'Te conectas con [object]. Transmisión de datos completada.',
        'Los sistemas de audio de [object] se activan. Comunicación establecida.',
        'Te sincronizas con [object]. Intercambio de información exitoso.',
      ],
      [Language.FRENCH]: [
        'Vous vous connectez avec [object]. Transmission de données complète.',
        'Les systèmes audio de [object] s\'activent. Communication établie.',
      ],
      [Language.GERMAN]: [
        'Du verbindest dich mit [object]. Datenübertragung abgeschlossen.',
        'Die Audiosysteme von [object] werden aktiviert. Kommunikation hergestellt.',
      ],
      [Language.ITALIAN]: [
        'Ti interfacci con [object]. Trasmissione dati completata.',
        'I sistemi audio di [object] si attivano. Comunicazione stabilita.',
      ],
      [Language.JAPANESE]: [
        '[object]とインターフェースする。データ送信完了。',
        '[object]のオーディオシステムが起動する。通信確立。',
      ],
      [Language.MANDARIN]: [
        '你与[object]交互。数据传输完成。',
        '[object]的音频系统激活。通信建立。',
      ],
      [Language.RUSSIAN]: [
        'Вы подключаетесь к [object]. Передача данных завершена.',
        'Аудиосистемы [object] активируются. Связь установлена.',
      ],
      [Language.PORTUGUESE]: [
        'Você se conecta com [object]. Transmissão de dados completa.',
        'Os sistemas de áudio de [object] se ativam. Comunicação estabelecida.',
      ],
      [Language.UKRAINIAN]: [
        'Ви підключаєтесь до [object]. Передавання даних завершено.',
        'Аудіосистеми [object] активуються. Зв\'язок встановлено.',
      ],
      [Language.POLISH]: [
        'Interfejsujesz się z [object]. Transmisja danych zakończona.',
        'Systemy audio [object] się aktywują. Komunikacja nawiązana.',
      ],
      [Language.CZECH]: [
        'Rozhraní se s [object]. Přenos dat dokončen.',
        'Zvukové systémy [object] se aktivují. Komunikace navázána.',
      ],
    },
    priority: 10,
  },
];

/**
 * Horror Genre Templates - Dark, dread, sinister
 */
export const HORROR_TEMPLATES: ResponseTemplate[] = [
  // EXAMINE - Horror
  {
    id: 'examine_success_horror',
    intent: 'EXAMINE',
    genre: 'Horror',
    templates: {
      [Language.ENGLISH]: [
        'You examine [object]. Something sinister radiates from it, making your skin crawl.',
        'You study [object]. An unseen presence seems to watch you from within the shadows.',
        'Your gaze falls upon [object]. A chill runs down your spine.',
      ],
      [Language.SPANISH]: [
        'Examinas [object]. Algo siniestro irradia de ella, erizando tu piel.',
        'Estudias [object]. Una presencia invisible parece observarte desde las sombras.',
        'Tu mirada cae sobre [object]. Un escalofrío recorre tu columna vertebral.',
      ],
      [Language.FRENCH]: [
        'Vous examinez [object]. Quelque chose de sinistre émane d\'elle, hérissant votre peau.',
        'Vous étudiez [object]. Une présence invisible semble vous observer depuis les ombres.',
      ],
      [Language.GERMAN]: [
        'Du untersuchst [object]. Etwas Unheilvolles strahlt davon aus und macht dir Angst.',
        'Du studierst [object]. Eine unsichtbare Präsenz scheint dich aus den Schatten zu beobachten.',
      ],
      [Language.ITALIAN]: [
        'Esamini [object]. Qualcosa di sinistro emana da esso, facendoti rabbrividire.',
        'Studi [object]. Una presenza invisibile sembra osservarti dalle ombre.',
      ],
      [Language.JAPANESE]: [
        '[object]を調べる。何か不気味なものがそこから放射され、背筋が寒くなる。',
        '[object]を研究する。見えない存在が影の中からあなたを見ている気がする。',
      ],
      [Language.MANDARIN]: [
        '你检查[object]。阴险的东西从它身上辐射出来，使你毛骨悚然。',
        '你研究[object]。看不见的存在似乎在注视你从阴影。',
      ],
      [Language.RUSSIAN]: [
        'Вы осматриваете [object]. От неё исходит что-то зловещее, вызывающее холод в спине.',
        'Вы изучаете [object]. Невидимое присутствие кажется наблюдает за вами из теней.',
      ],
      [Language.PORTUGUESE]: [
        'Você examina [object]. Algo sinistro emana dela, fazendo sua pele arrepiar.',
        'Você estuda [object]. Uma presença invisível parece observá-lo das sombras.',
      ],
      [Language.UKRAINIAN]: [
        'Ви обстежуєте [object]. Щось зловісне випромінює від нього, викликаючи озноб.',
        'Ви вивчаєте [object]. Невидима присутність, здається, спостерігає за вами з тіней.',
      ],
      [Language.POLISH]: [
        'Badasz [object]. Coś złowrogiego emanuje od niego, powodując ciarki na skórze.',
        'Studiujesz [object]. Niewidzialna obecność wydaje się obserwować cię z cieni.',
      ],
      [Language.CZECH]: [
        'Prozkoumáš [object]. Něco zlého vyzařuje z něj, což ti vzchází hrůza.',
        'Studituješ [object]. Neviditelná přítomnost se zdá, že tě pozoruje ze stínů.',
      ],
    },
    priority: 10,
  },

  // TAKE - Horror Success
  {
    id: 'take_success_horror',
    intent: 'TAKE',
    genre: 'Horror',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        'With trembling hands, you grasp [object]. The darkness seems to follow your touch.',
        'You seize [object]. A low whisper echoes through the air.',
        'You take [object]. Your heart pounds as unseen eyes seem to track your movement.',
      ],
      [Language.SPANISH]: [
        'Con manos temblorosas, agarras [object]. La oscuridad parece seguir tu toque.',
        'Atrapas [object]. Un susurro bajo resuena en el aire.',
        'Tomas [object]. Tu corazón palpita mientras ojos invisibles parecen rastrear tu movimiento.',
      ],
      [Language.FRENCH]: [
        'De mains tremblantes, vous saisissez [object]. Les ténèbres semblent suivre votre toucher.',
        'Vous saisissez [object]. Un murmure bas résonne dans l\'air.',
      ],
      [Language.GERMAN]: [
        'Mit zitternden Händen ergreifst du [object]. Die Finsternis scheint deiner Berührung zu folgen.',
        'Du ergreifst [object]. Ein leises Flüstern hallt durch die Luft.',
      ],
      [Language.ITALIAN]: [
        'Con mani tremanti, afferra [object]. L\'oscurità sembra seguire il tuo tocco.',
        'Afferri [object]. Un sussurro basso echeggia nell\'aria.',
      ],
      [Language.JAPANESE]: [
        '震える手で[object]をつかむ。暗闇があなたの触れ方に従うように見える。',
        '[object]をつかむ。低いささやきが空気を通して響く。',
      ],
      [Language.MANDARIN]: [
        '用颤抖的双手，你抓住[object]。黑暗似乎跟随你的触摸。',
        '你抓住[object]。低声的耳语回荡在空气中。',
      ],
      [Language.RUSSIAN]: [
        'Дрожащими руками вы хватаете [object]. Тьма, кажется, следует за вашим прикосновением.',
        'Вы захватываете [object]. Тихий шепот разносится по воздуху.',
      ],
      [Language.PORTUGUESE]: [
        'Com mãos tremendo, você agarra [object]. A escuridão parece seguir seu toque.',
        'Você apreende [object]. Um sussurro baixo ecoa pelo ar.',
      ],
      [Language.UKRAINIAN]: [
        'З тремтячими руками ви схоплюєте [object]. Темрява, здається, слідує за вашим дотиком.',
        'Ви захоплюєте [object]. Тихий шепіт розноситься повітрям.',
      ],
      [Language.POLISH]: [
        'Trzęsącymi się rękami chwytasz [object]. Ciemność wydaje się podążać za twoim dotykiem.',
        'Przchwytasz [object]. Cichy szept rozbrzmiewa w powietrzu.',
      ],
      [Language.CZECH]: [
        'S chvějícími se rukama se chopíš [object]. Tma se zdá následovat tvý dotek.',
        'Chvatíš [object]. Tichý šepot zní ve vzduchu.',
      ],
    },
    priority: 10,
  },

  // OPEN - Horror Success
  {
    id: 'open_success_horror',
    intent: 'OPEN',
    genre: 'Horror',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        'With great effort, you open [object]. A smell of decay wafts up from within.',
        '[object] opens... and something stares back at you from the darkness.',
        'You push [object] open. Ancient, malevolent presence floods outward.',
      ],
      [Language.SPANISH]: [
        'Con gran esfuerzo, abres [object]. Un olor a descomposición sube desde adentro.',
        '[object] se abre... y algo te mira fijamente desde la oscuridad.',
        'Empujas [object] abierto. Una presencia antigua y malévola se derrama hacia afuera.',
      ],
      [Language.FRENCH]: [
        'Avec beaucoup d\'efforts, vous ouvrez [object]. Une odeur de décomposition s\'échappe de l\'intérieur.',
        '[object] s\'ouvre... et quelque chose vous fixe du regard depuis l\'obscurité.',
      ],
      [Language.GERMAN]: [
        'Mit großer Anstrengung öffnest du [object]. Ein Verwesungsgeruch steigt von innen auf.',
        '[object] öffnet sich... und etwas starrt dich aus der Dunkelheit an.',
      ],
      [Language.ITALIAN]: [
        'Con grande sforzo, apri [object]. Un odore di decomposizione sale da dentro.',
        '[object] si apre... e qualcosa ti fissa lo sguardo dal buio.',
      ],
      [Language.JAPANESE]: [
        '大きな努力で[object]を開く。腐敗の臭いが内側から漂う。',
        '[object]が開く...そして何かが暗闇からあなたを見つめている。',
      ],
      [Language.MANDARIN]: [
        '费力地打开[object]。腐烂的气味从内部飘出。',
        '[object]打开...某样东西从黑暗中盯着你。',
      ],
      [Language.RUSSIAN]: [
        'С большим усилием вы открываете [object]. Запах разложения поднимается изнутри.',
        '[object] открывается... и что-то смотрит на вас из темноты.',
      ],
      [Language.PORTUGUESE]: [
        'Com grande esforço, você abre [object]. Um cheiro de decomposição sai de dentro.',
        '[object] abre... e algo o fita dos olhos da escuridão.',
      ],
      [Language.UKRAINIAN]: [
        'З великим зусиллям ви відкриваєте [object]. Запах розпаду піднімається зсередини.',
        '[object] відкривається... і щось дивиться на вас з темноти.',
      ],
      [Language.POLISH]: [
        'Z wielkim wysiłkiem otwierasz [object]. Zapach rozkładu wznosi się z wnętrza.',
        '[object] się otwiera... a coś patrzy na ciebie z ciemności.',
      ],
      [Language.CZECH]: [
        'S velkým úsilím otevřeš [object]. Zápach rozpadu se zvedá zevnitř.',
        '[object] se otevírá... a něco na tebe zírá z tmy.',
      ],
    },
    priority: 10,
  },

  // USE - Horror
  {
    id: 'use_success_horror',
    intent: 'USE',
    genre: 'Horror',
    templates: {
      [Language.ENGLISH]: [
        'You activate [object]. Reality bends in disturbing ways.',
        'With [object] in hand, you feel reality shift unnaturally around you.',
        'You use [object]. The veil between worlds grows thin.',
      ],
      [Language.SPANISH]: [
        'Activas [object]. La realidad se dobla de maneras perturbadoras.',
        'Con [object] en la mano, sientes que la realidad se desplaza de manera antinatural.',
        'Usas [object]. El velo entre mundos se vuelve delgado.',
      ],
      [Language.FRENCH]: [
        'Vous activez [object]. La réalité se plie de manière troublante.',
        'Avec [object] en main, vous sentez la réalité se déplacer de façon contre nature.',
      ],
      [Language.GERMAN]: [
        'Du aktivierst [object]. Die Realität krümmt sich auf beunruhigende Weise.',
        'Mit [object] in der Hand spürst du, wie sich die Realität auf unnatürliche Weise verschiebt.',
      ],
    },
    priority: 10,
  },

  // DROP - Horror
  {
    id: 'drop_success_horror',
    intent: 'DROP',
    genre: 'Horror',
    templates: {
      [Language.ENGLISH]: [
        'You drop [object]. It falls into shadow and disappears from sight.',
        '[object] slips from your grasp. Darkness swallows it.',
        'You release [object]. It vanishes into the gathering gloom.',
      ],
      [Language.SPANISH]: [
        'Sueltas [object]. Se cae a la sombra y desaparece de la vista.',
        '[object] se desliza de tu mano. La oscuridad la traga.',
        'Sueltas [object]. Desaparece en la penumbra creciente.',
      ],
      [Language.FRENCH]: [
        'Vous lâchez [object]. Elle tombe dans l\'ombre et disparaît de la vue.',
        '[object] glisse de votre prise. Les ténèbres l\'engloutissent.',
      ],
      [Language.GERMAN]: [
        'Du lässt [object] fallen. Sie fällt ins Licht und verschwindet aus dem Blickfeld.',
        '[object] gleitet aus deinem Griff. Die Dunkelheit verschlingt sie.',
      ],
      [Language.ITALIAN]: [
        'Lasci cadere [object]. Cade nell\'ombra e scompare dalla vista.',
        '[object] scivola dalla tua presa. L\'oscurità la inghiotte.',
      ],
      [Language.JAPANESE]: [
        '[object]を落とす。影に落ちて視界から消える。',
        '[object]があなたの握りから滑り落ちる。暗闇がそれを飲み込む。',
      ],
      [Language.MANDARIN]: [
        '你掉落[object]。它掉进阴影并从视线中消失。',
        '[object]从你的握力中滑落。黑暗吞没了它。',
      ],
      [Language.RUSSIAN]: [
        'Вы роняете [object]. Она падает в тень и исчезает из вида.',
        '[object] скользит из вашего захвата. Тьма поглощает её.',
      ],
      [Language.PORTUGUESE]: [
        'Você solta [object]. Ela cai na sombra e desaparece de vista.',
        '[object] escapa de seu aperto. A escuridão a engole.',
      ],
      [Language.UKRAINIAN]: [
        'Ви роняєте [object]. Вона падає в тінь і зникає з виду.',
        '[object] вислизає з вашого захоплення. Темрава її поглинає.',
      ],
      [Language.POLISH]: [
        'Puszczasz [object]. Spada w cień i znika z widoku.',
        '[object] wyślizguje się z twojego uścisku. Ciemność ją pochłania.',
      ],
      [Language.CZECH]: [
        'Pouštíš [object]. Padá do stínu a zmizí z dohledu.',
        '[object] klouzne z tvého úchopu. Tma ji pohltí.',
      ],
    },
    priority: 10,
  },

  // TALK - Horror
  {
    id: 'talk_success_horror',
    intent: 'TALK',
    genre: 'Horror',
    templates: {
      [Language.ENGLISH]: [
        'You speak with [object]. Their voice sounds like wind through a grave.',
        '[object] responds. Words that should not exist form in the air.',
        'You converse with [object]. Ancient malice echoes in every word.',
      ],
      [Language.SPANISH]: [
        'Hablas con [object]. Su voz suena como el viento a través de una tumba.',
        '[object] responde. Palabras que no deberían existir se forman en el aire.',
        'Conversas con [object]. La malicia antigua resuena en cada palabra.',
      ],
      [Language.FRENCH]: [
        'Vous parlez avec [object]. Sa voix ressemble à du vent à travers une tombe.',
        '[object] répond. Des paroles qui ne devraient pas exister se forment dans l\'air.',
      ],
      [Language.GERMAN]: [
        'Du sprichst mit [object]. Ihre Stimme klingt wie Wind durch ein Grab.',
        '[object] antwortet. Worte, die nicht existieren sollten, bilden sich in der Luft.',
      ],
      [Language.ITALIAN]: [
        'Parli con [object]. La loro voce suona come vento attraverso una tomba.',
        '[object] risponde. Parole che non dovrebbero esistere si formano nell\'aria.',
      ],
      [Language.JAPANESE]: [
        '[object]と話す。その声は墓を通る風のように聞こえる。',
        '[object]が応答する。存在するべきではない言葉が空気中に形成される。',
      ],
      [Language.MANDARIN]: [
        '你与[object]交谈。他们的声音听起来像通过墓穴的风。',
        '[object]回应。不应该存在的话语在空气中形成。',
      ],
      [Language.RUSSIAN]: [
        'Вы говорите с [object]. Их голос звучит как ветер сквозь могилу.',
        '[object] отвечает. Слова, которые не должны существовать, формируются в воздухе.',
      ],
      [Language.PORTUGUESE]: [
        'Você fala com [object]. Sua voz soa como vento através de um túmulo.',
        '[object] responde. Palavras que não deveriam existir se formam no ar.',
      ],
      [Language.UKRAINIAN]: [
        'Ви розмовляєте з [object]. Їхній голос звучить як вітер крізь могилу.',
        '[object] відповідає. Слова, які не повинні існувати, формуються в повітрі.',
      ],
      [Language.POLISH]: [
        'Rozmawiasz z [object]. Ich głos brzmi jak wiatr przechodzący przez grób.',
        '[object] odpowiada. Słowa, które nie powinny istnieć, powstają w powietrzu.',
      ],
      [Language.CZECH]: [
        'Mluvíš s [object]. Jejich hlas zní jako vítr procházející hrobem.',
        '[object] odpovídá. Slova, která by neměla existovat, se tvoří ve vzduchu.',
      ],
    },
    priority: 10,
  },
];

/**
 * Western Genre Templates - Dusty, gritty, weathered
 */
export const WESTERN_TEMPLATES: ResponseTemplate[] = [
  // EXAMINE - Western
  {
    id: 'examine_success_western',
    intent: 'EXAMINE',
    genre: 'Western',
    templates: {
      [Language.ENGLISH]: [
        'You examine [object]. The dust of countless trails covers it.',
        'You study [object] carefully. Years of wear mark its weathered surface.',
        'You look over [object]. It\'s seen better days, but still has grit in it.',
      ],
      [Language.SPANISH]: [
        'Examinas [object]. El polvo de incontables senderos la cubre.',
        'Estudias [object] cuidadosamente. Años de desgaste marcan su superficie desgastada.',
        'Observas [object]. Ha visto mejores días, pero aún tiene agallas.',
      ],
      [Language.FRENCH]: [
        'Vous examinez [object]. La poussière de d\'innombrables sentiers la couvre.',
        'Vous étudiez [object] avec soin. Des années d\'usure marquent sa surface usée.',
      ],
      [Language.GERMAN]: [
        'Du untersuchst [object]. Der Staub von zahllosen Pfaden bedeckt sie.',
        'Du studierst [object] sorgfältig. Jahre des Verschleißes prägen ihre abgenutzte Oberfläche.',
      ],
      [Language.ITALIAN]: [
        'Esamini [object]. La polvere di innumerevoli sentieri la copre.',
        'Studi [object] attentamente. Anni di usura segnano la sua superficie consumata.',
      ],
      [Language.JAPANESE]: [
        '[object]を調べる。無数の道の塵がそれを覆っている。',
        '[object]を注意深く研究する。長年の使用が風化した表面に跡を残す。',
      ],
      [Language.MANDARIN]: [
        '你检查[object]。无数路径的灰尘覆盖了它。',
        '你仔细研究[object]。多年的磨损在其风化的表面上留下痕迹。',
      ],
      [Language.RUSSIAN]: [
        'Вы осматриваете [object]. Пыль множества троп покрывает её.',
        'Вы внимательно изучаете [object]. Годы износа оставляют след на её потёртой поверхности.',
      ],
      [Language.PORTUGUESE]: [
        'Você examina [object]. A poeira de inúmeras trilhas a cobre.',
        'Você estuda [object] cuidadosamente. Anos de desgaste marcam sua superfície gasta.',
      ],
      [Language.UKRAINIAN]: [
        'Ви обстежуєте [object]. Пил численних стежок вкриває його.',
        'Ви уважно вивчаєте [object]. Роки зносу залишають сліди на його потертій поверхні.',
      ],
      [Language.POLISH]: [
        'Badasz [object]. Kurz niezliczonych ścieżek go pokrywa.',
        'Starannie studiujesz [object]. Lata zużycia zaznaczają jego zniszczoną powierzchnię.',
      ],
      [Language.CZECH]: [
        'Prozkoumáš [object]. Prach nespočetných cest jej pokrývá.',
        'Pečlivě studituješ [object]. Léta opotřebení zanechávají stopy na její opotřebené povrchu.',
      ],
    },
    priority: 10,
  },

  // TAKE - Western Success
  {
    id: 'take_success_western',
    intent: 'TAKE',
    genre: 'Western',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        'You grab [object] quick as a gunslinger. It\'s yours now.',
        'You take [object]. A real prospector doesn\'t leave anything behind.',
        'You seize [object]. Old habits die hard out here.',
      ],
      [Language.SPANISH]: [
        'Agarras [object] rápido como un pistolero. Ahora es tuyo.',
        'Tomas [object]. Un verdadero buscador no deja nada atrás.',
        'Atrapas [object]. Los viejos hábitos mueren lentamente aquí.',
      ],
      [Language.FRENCH]: [
        'Vous saisissez [object] vite comme un tireur. C\'est vôtre maintenant.',
        'Vous prenez [object]. Un vrai prospecteur ne laisse rien derrière.',
      ],
      [Language.GERMAN]: [
        'Du schnappst dir [object] schnell wie ein Schütze. Sie gehört dir jetzt.',
        'Du nimmst [object]. Ein echter Goldsucher lässt hier nichts zurück.',
      ],
      [Language.ITALIAN]: [
        'Afferri [object] veloce come un pistolero. È tuo ora.',
        'Prendi [object]. Un vero cercatore d\'oro non lascia nulla indietro.',
      ],
      [Language.JAPANESE]: [
        '銃手のように素早く[object]をつかむ。今それはあなたのものだ。',
        '[object]を取る。本当の鉱夫は何も後に残さない。',
      ],
      [Language.MANDARIN]: [
        '你像枪手一样迅速地抓住[object]。现在它是你的了。',
        '你拿[object]。真正的淘金者不会留下任何东西。',
      ],
      [Language.RUSSIAN]: [
        'Вы хватаете [object] быстро как стрелок. Теперь это ваше.',
        'Вы берёте [object]. Настоящий золотоискатель ничего не оставляет.',
      ],
      [Language.PORTUGUESE]: [
        'Você pega [object] rápido como um pistoleiro. Agora é seu.',
        'Você pega [object]. Um verdadeiro garimpeiro não deixa nada para trás.',
      ],
      [Language.UKRAINIAN]: [
        'Ви хватаєте [object] швидко як стрільець. Тепер це ваше.',
        'Ви беретеся [object]. Справжній золотошукач нічого не залишає.',
      ],
      [Language.POLISH]: [
        'Chwytasz [object] szybko jak strzelec. Teraz to twoje.',
        'Bierzesz [object]. Prawdziwy poszukiwacz złota nic nie zostawia.',
      ],
      [Language.CZECH]: [
        'Chvatíš [object] rychle jako střelec. Teď je tvoje.',
        'Bereš [object]. Pravý zlatokopáč nic neponechá.',
      ],
    },
    priority: 10,
  },

  // OPEN - Western Success
  {
    id: 'open_success_western',
    intent: 'OPEN',
    genre: 'Western',
    conditions: { success: true },
    templates: {
      [Language.ENGLISH]: [
        'You pry [object] open. Its rusted hinges groan in protest.',
        '[object] creaks as you force it open. What lies within?',
        'You wrench [object] open. The smell of old leather and gunpowder wafts out.',
      ],
      [Language.SPANISH]: [
        'Abres [object] a la fuerza. Sus bisagras oxidadas crujen en protesta.',
        '[object] cruje mientras lo fuerzas abierto. ¿Qué hay dentro?',
        'Arranques [object] abierto. El olor del cuero viejo y la pólvora flota.',
      ],
      [Language.FRENCH]: [
        'Vous forcez [object] à s\'ouvrir. Ses charnières rouillées grincent en protestation.',
        '[object] craque lorsque vous la forcez à s\'ouvrir. Qu\'y a-t-il à l\'intérieur ?',
      ],
      [Language.GERMAN]: [
        'Du zwingst [object] auf. Ihre rostigen Scharniere knirschen in Protest.',
        '[object] knarrt, während du sie aufzwingst. Was liegt darin?',
      ],
      [Language.ITALIAN]: [
        'Forzi [object] aperto. I suoi cardini arrugginiti protestano cigolando.',
        '[object] scricchiola mentre lo forzi aperto. Cosa c\'è dentro?',
      ],
      [Language.JAPANESE]: [
        '[object]を無理に開く。錆びた蝶番が抗議するように鳴く。',
        '[object]が開きながら軋む。中身は何だろうか?',
      ],
      [Language.MANDARIN]: [
        '你强行打开[object]。它生锈的铰链抗议地吱吱作响。',
        '[object]在你强行打开时吱吱作响。里面是什么？',
      ],
      [Language.RUSSIAN]: [
        'Вы с силой открываете [object]. Её ржавые петли скрипят в протест.',
        '[object] скрипит, когда вы с силой её открываете. Что внутри?',
      ],
      [Language.PORTUGUESE]: [
        'Você força [object] aberto. Suas dobradiças enferrujadas protestam rangendo.',
        '[object] range enquanto você o força aberto. O que há dentro?',
      ],
      [Language.UKRAINIAN]: [
        'Ви силою відкриваєте [object]. Його іржаві петлі скрипіють у протест.',
        '[object] скрипить, коли ви його силою відкриваєте. Що всередину?',
      ],
      [Language.POLISH]: [
        'Zmuszasz [object] otworzyć. Jego zardzewiałe zawiasy protestują skrzypnięciem.',
        '[object] skrzypi gdy zmuszasz go otworzyć. Co jest wewnątrz?',
      ],
      [Language.CZECH]: [
        'Donuceš [object] otevřít. Její rezavé panty protestují vrzáním.',
        '[object] vrzá, když ji donucuješ otevřít. Co je uvnitř?',
      ],
    },
    priority: 10,
  },

  // USE - Western
  {
    id: 'use_success_western',
    intent: 'USE',
    genre: 'Western',
    templates: {
      [Language.ENGLISH]: [
        'You put [object] to use. Old tricks still work out here.',
        'You use [object]. The frontier respects practical folk.',
        'You activate [object]. Survival depends on knowing your tools.',
      ],
      [Language.SPANISH]: [
        'Usas [object]. Los viejos trucos todavía funcionan aquí.',
        'Usas [object]. La frontera respeta a la gente práctica.',
        'Activas [object]. La supervivencia depende de conocer tus herramientas.',
      ],
      [Language.FRENCH]: [
        'Vous utilisez [object]. Les vieilles astuces fonctionnent toujours ici.',
        'Vous utilisez [object]. La frontière respecte les gens pratiques.',
      ],
      [Language.GERMAN]: [
        'Du nutzt [object]. Alte Tricks funktionieren hier immer noch.',
        'Du nutzt [object]. Die Grenze respektiert praktische Menschen.',
      ],
    },
    priority: 10,
  },

  // DROP - Western
  {
    id: 'drop_success_western',
    intent: 'DROP',
    genre: 'Western',
    templates: {
      [Language.ENGLISH]: [
        'You drop [object]. It kicks up a cloud of dust.',
        '[object] tumbles from your hand to the dusty ground.',
        'You let [object] fall. It settles in the parched earth.',
      ],
      [Language.SPANISH]: [
        'Sueltas [object]. Levanta una nube de polvo.',
        '[object] se cae de tu mano al suelo polvoriento.',
        'Dejas caer [object]. Se asienta en la tierra árida.',
      ],
      [Language.FRENCH]: [
        'Vous lâchez [object]. Elle soulève un nuage de poussière.',
        '[object] tombe de votre main sur le sol poussiéreux.',
      ],
      [Language.GERMAN]: [
        'Du lässt [object] fallen. Sie wirbelt eine Staubwolke auf.',
        '[object] fällt aus deiner Hand auf den staubigen Boden.',
      ],
      [Language.ITALIAN]: [
        'Lasci cadere [object]. Solleva una nuvola di polvere.',
        '[object] cade dalla tua mano al suolo polveroso.',
      ],
      [Language.JAPANESE]: [
        '[object]を落とす。塵の雲を巻き上げる。',
        '[object]があなたの手から埃っぽい地面に落ちる。',
      ],
      [Language.MANDARIN]: [
        '你掉落[object]。它卷起一阵尘埃。',
        '[object]从你的手掉落到尘土飞扬的地面。',
      ],
      [Language.RUSSIAN]: [
        'Вы роняете [object]. Она поднимает облако пыли.',
        '[object] падает из вашей руки на пыльную землю.',
      ],
      [Language.PORTUGUESE]: [
        'Você solta [object]. Levanta uma nuvem de poeira.',
        '[object] cai de sua mão para o chão poeirento.',
      ],
      [Language.UKRAINIAN]: [
        'Ви роняєте [object]. Вона піднімає хмару пилу.',
        '[object] падає з вашої руки на пиляву землю.',
      ],
      [Language.POLISH]: [
        'Puszczasz [object]. Unosi chmurę kurzu.',
        '[object] pada z twojej ręki na pylisty grunt.',
      ],
      [Language.CZECH]: [
        'Pouštíš [object]. Zvedá se mrak prachu.',
        '[object] padá z tvé ruky na prašnou zem.',
      ],
    },
    priority: 10,
  },

  // TALK - Western
  {
    id: 'talk_success_western',
    intent: 'TALK',
    genre: 'Western',
    templates: {
      [Language.ENGLISH]: [
        'You speak with [object]. They talk straight, like folks do out here.',
        '[object] opens up to you. The frontier forges honest connections.',
        'You converse with [object]. Words mean something out in this desert.',
      ],
      [Language.SPANISH]: [
        'Hablas con [object]. Hablan derecho, como la gente aquí.',
        '[object] te abre su corazón. La frontera forja conexiones honestas.',
        'Conversas con [object]. Las palabras significan algo en este desierto.',
      ],
      [Language.FRENCH]: [
        'Vous parlez avec [object]. Ils parlent franchement, comme le font les gens ici.',
        '[object] s\'ouvre à vous. La frontière forge des connexions honnêtes.',
      ],
      [Language.GERMAN]: [
        'Du sprichst mit [object]. Sie sprechen direkt, wie Leute hier es tun.',
        '[object] öffnet sich dir. Die Grenze schmiedet ehrliche Verbindungen.',
      ],
      [Language.ITALIAN]: [
        'Parli con [object]. Parlano dritto, come la gente qui.',
        '[object] si apre a te. La frontiera forgia connessioni oneste.',
      ],
      [Language.JAPANESE]: [
        '[object]と話す。彼らはここの人々のようにまっすぐに話す。',
        '[object]があなたに心を開く。フロンティアは正直なつながりを作る。',
      ],
      [Language.MANDARIN]: [
        '你与[object]交谈。他们说得很直白，像这里的人一样。',
        '[object]向你敞开心扉。边界锻造诚实的联系。',
      ],
      [Language.RUSSIAN]: [
        'Вы разговариваете с [object]. Они говорят прямо, как здесь.',
        '[object] открывается вам. Граница куёт честные связи.',
      ],
      [Language.PORTUGUESE]: [
        'Você fala com [object]. Eles falam direto, como as pessoas daqui.',
        '[object] se abre para você. A fronteira forja conexões honestas.',
      ],
      [Language.UKRAINIAN]: [
        'Ви розмовляєте з [object]. Вони говорять прямо, як люди тут.',
        '[object] відкривається вам. Кордон кує чесні зв\'язки.',
      ],
      [Language.POLISH]: [
        'Rozmawiasz z [object]. Mówią wprost, jak ludzie tutaj.',
        '[object] się tobie otwiera. Granica kuję uczciwe połączenia.',
      ],
      [Language.CZECH]: [
        'Mluvíš s [object]. Mluví přímo, jak se mluví tady.',
        '[object] se ti otevírá. Hranice vytváří upřímná spojení.',
      ],
    },
    priority: 10,
  },
];

/**
 * Cyberpunk Genre Templates - Neon, digital, edgy, high-tech low-life
 */
export const CYBERPUNK_TEMPLATES: ResponseTemplate[] = [
  // EXAMINE - Cyberpunk
  {
    id: 'examine_success_cyberpunk',
    intent: 'EXAMINE',
    genre: 'Cyberpunk',
    templates: {
      [Language.ENGLISH]: [
        'Your neural overlay syncs with [object]. Data floods your consciousness.',
        '[object] glows with neon light. Encryption patterns dance across its surface.',
        'You jack into [object]. Streams of digital information flow through your implants.',
      ],
      [Language.SPANISH]: [
        'Tu interfaz neural se sincroniza con [object]. Datos inundan tu conciencia.',
        '[object] brilla con luz de neón. Patrones de cifrado bailan en su superficie.',
        'Te conectas con [object]. Flujos de información digital corren a través de tus implantes.',
      ],
      [Language.FRENCH]: [
        'Votre interface neurale se synchronise avec [object]. Les données inondent votre conscience.',
        '[object] brille de lumière néon. Des motifs de chiffrement dansent à sa surface.',
      ],
      [Language.GERMAN]: [
        'Deine neurale Schnittstelle synchronisiert sich mit [object]. Daten überschwemmen dein Bewusstsein.',
        '[object] leuchtet mit Neonlicht. Verschlüsselungsmuster tanzen über ihre Oberfläche.',
      ],
      [Language.ITALIAN]: [
        'La tua interfaccia neurale si sincronizza con [object]. I dati inondano la tua coscienza.',
        '[object] brilla di luce al neon. I modelli di crittografia ballano sulla sua superficie.',
      ],
      [Language.JAPANESE]: [
        'あなたのニューラルオーバーレイが[object]と同期する。データがあなたの意識に殺到する。',
        '[object]がネオン光で輝く。暗号化パターンが表面を踊る。',
      ],
      [Language.MANDARIN]: [
        '你的神经叠加层与[object]同步。数据涌入你的意识。',
        '[object]闪闪发光。加密模式在其表面上跳动。',
      ],
      [Language.RUSSIAN]: [
        'Ваш нейральный интерфейс синхронизируется с [object]. Данные заполняют ваше сознание.',
        '[object] светится неоновым светом. Паттерны шифрования танцуют по его поверхности.',
      ],
      [Language.PORTUGUESE]: [
        'Sua sobreposição neural se sincroniza com [object]. Os dados inundam sua consciência.',
        '[object] brilha com luz de neon. Os padrões de criptografia dançam em sua superfície.',
      ],
      [Language.UKRAINIAN]: [
        'Ваш нейральний інтерфейс синхронізується з [object]. Дані заповнюють вашу свідомість.',
        '[object] світить неоновим світлом. Моделі шифрування танцюють по його поверхні.',
      ],
      [Language.POLISH]: [
        'Twój interfejs neuralny synchronizuje się z [object]. Dane zalewają twoją świadomość.',
        '[object] błyszczy neonowym światłem. Wzory szyfrowania tańczą na jego powierzchni.',
      ],
      [Language.CZECH]: [
        'Tvé neurální rozhraní se synchronizuje s [object]. Data zaplavují tvé vědomí.',
        '[object] září neonovým světlem. Šifrovací vzory tančí po jeho povrchu.',
      ],
    },
    priority: 10,
  },

  // TAKE - Cyberpunk
  {
    id: 'take_success_cyberpunk',
    intent: 'TAKE',
    genre: 'Cyberpunk',
    templates: {
      [Language.ENGLISH]: [
        'You snatch [object]. It slots perfectly into your deck—encrypted and primed.',
        '[object] is yours now. The black market price flashes in your HUD.',
        'You pocket [object]. Street cred +1.',
      ],
      [Language.SPANISH]: [
        'Arrebatas [object]. Se encaja perfectamente en tu equipo, encriptado y listo.',
        '[object] es tuyo ahora. El precio del mercado negro parpadea en tu HUD.',
        'Guardas [object] en tu bolsillo. Reputación callejera +1.',
      ],
      [Language.FRENCH]: [
        'Vous saisissez [object]. Il s\'adapte parfaitement à votre équipement—chiffré et prêt.',
        '[object] est à vous maintenant. Le prix du marché noir clignote sur votre HUD.',
      ],
      [Language.GERMAN]: [
        'Du schnappst dir [object]. Es passt perfekt in dein Deck—verschlüsselt und einsatzbereit.',
        '[object] gehört dir jetzt. Der Schwarzmarktpreis blinkt auf deinem HUD auf.',
      ],
      [Language.ITALIAN]: [
        'Afferra [object]. Si adatta perfettamente al tuo deck, cifrato e pronto.',
        '[object] è tuo ora. Il prezzo del mercato nero lampeggia sul tuo HUD.',
      ],
      [Language.JAPANESE]: [
        '[object]をつかむ。それはあなたのデッキに完璧に収まる。',
        '[object]は今あなたのものだ。ブラックマーケット価格がHUDに点滅する。',
      ],
      [Language.MANDARIN]: [
        '你抓住[object]。它完美地装入你的卡组。',
        '[object]现在是你的。黑市价格在你的HUD上闪烁。',
      ],
      [Language.RUSSIAN]: [
        'Вы хватаете [object]. Оно идеально подходит в ваш колод—зашифровано и готово.',
        '[object] теперь ваше. Цена чёрного рынка мигает на вашем HUD.',
      ],
      [Language.PORTUGUESE]: [
        'Você apreende [object]. Ele se encaixa perfeitamente em seu deck, cifrado e pronto.',
        '[object] é seu agora. O preço do mercado negro pisca em seu HUD.',
      ],
      [Language.UKRAINIAN]: [
        'Ви хватаєте [object]. Воно ідеально вміщується у вашу колоду.',
        '[object] тепер ваше. Ціна чорного ринку блимає на вашому HUD.',
      ],
      [Language.POLISH]: [
        'Chwytasz [object]. Doskonale pasuje do twojej talii, zaszyfrowany i gotowy.',
        '[object] jest teraz twoje. Cena czarnego rynku miga na twoim HUD.',
      ],
      [Language.CZECH]: [
        'Chopíš se [object]. Dokonale se hodí do tvého balíčku, zašifrován a připraven.',
        '[object] je teď tvoje. Cena černého trhu bliká na tvém HUD.',
      ],
    },
    priority: 10,
  },

  // OPEN - Cyberpunk
  {
    id: 'open_success_cyberpunk',
    intent: 'OPEN',
    genre: 'Cyberpunk',
    templates: {
      [Language.ENGLISH]: [
        'You firewall-breach [object]. Its lock dissolves under your code-fu.',
        '[object] hisses open. Mechanical tendrils reveal their secrets.',
        'You slice the encryption on [object]. Access granted. Time to hunt.',
      ],
      [Language.SPANISH]: [
        'Vulneras el cortafuegos de [object]. Su cerradura se disuelve bajo tu destreza en código.',
        '[object] se abre con un siseo. Los zarcillos mecánicos revelan sus secretos.',
        'Rompes la encriptación de [object]. Acceso concedido. Hora de cazar.',
      ],
      [Language.FRENCH]: [
        'Vous contournez le pare-feu de [object]. Son verrou se dissout sous vos compétences en code.',
        '[object] s\'ouvre avec un sifflement. Les vrilles mécaniques révèlent leurs secrets.',
      ],
      [Language.GERMAN]: [
        'Du umgehst die Firewall von [object]. Sein Schloss löst sich unter deinem Code-Geschick auf.',
        '[object] zischt auf. Mechanische Ranken enthüllen ihre Geheimnisse.',
      ],
      [Language.ITALIAN]: [
        'Infrangi il firewall di [object]. Il suo blocco si dissolve sotto la tua abilità nel codice.',
        '[object] sibila aperto. I viticci meccanici rivelano i loro segreti.',
      ],
      [Language.JAPANESE]: [
        '[object]のファイアウォールをハッキングする。ロックがコードスキルで溶ける。',
        '[object]がシューッという音で開く。機械的なツルが秘密を明かす。',
      ],
      [Language.MANDARIN]: [
        '你破解[object]的防火墙。在你的代码技能下，它的锁融化了。',
        '[object]嘶声打开。机械藤蔓揭示了它们的秘密。',
      ],
      [Language.RUSSIAN]: [
        'Вы обходите брандмауэр [object]. Его замок растворяется под вашим мастерством кодирования.',
        '[object] открывается со свистом. Механические усики раскрывают свои секреты.',
      ],
      [Language.PORTUGUESE]: [
        'Você quebra o firewall de [object]. Sua fechadura se dissolve sob suas habilidades de código.',
        '[object] sibilante se abre. Os tentáculos mecânicos revelam seus segredos.',
      ],
      [Language.UKRAINIAN]: [
        'Ви обходите брандмауер [object]. Його замок розчиняється під вашою навичкою кодування.',
        '[object] відкривається зі свистом. Механічні вусики розкривають свої секрети.',
      ],
      [Language.POLISH]: [
        'Przełamujesz firewall [object]. Jego zamek rozpuszcza się pod twoją umiejętnością kodowania.',
        '[object] otwiera się ze świstem. Mechaniczne wici ujawniają swoje sekrety.',
      ],
      [Language.CZECH]: [
        'Obejdeš firewall [object]. Jeho zámek se rozpustí pod tvou dovedností kódování.',
        '[object] se otevírá se svištěním. Mechanické úponky odhalují své tajemství.',
      ],
    },
    priority: 10,
  },

  // DROP - Cyberpunk
  {
    id: 'drop_success_cyberpunk',
    intent: 'DROP',
    genre: 'Cyberpunk',
    templates: {
      [Language.ENGLISH]: [
        'You drop [object]. It sparks once, then fades into the neon darkness.',
        '[object] hits the metal floor with a digital shriek. Gone. Lost to the net.',
        'You toss [object] away. It vanishes into the cybernetic void.',
      ],
      [Language.SPANISH]: [
        'Sueltas [object]. Brilla una vez, luego se desvanece en la oscuridad de neón.',
        '[object] golpea el suelo metálico con un grito digital. Desaparecido. Perdido en la red.',
        'Lanzas [object] lejos. Se desvanece en el vacío cibernético.',
      ],
      [Language.FRENCH]: [
        'Vous lâchez [object]. Il scintille une fois, puis s\'efface dans l\'obscurité néon.',
        '[object] frappe le sol métallique avec un cri numérique. Disparu. Perdu sur le net.',
      ],
      [Language.GERMAN]: [
        'Du lässt [object] fallen. Es leuchtet einmal auf, verblasst dann in der Neonfinsternis.',
        '[object] schlägt auf dem Metallboden auf. Weg. Im Netz verloren.',
      ],
      [Language.ITALIAN]: [
        'Lasci cadere [object]. Brilla una volta, poi svanisce nell\'oscurità neon.',
        '[object] colpisce il pavimento di metallo con un grido digitale. Sparito. Perso nella rete.',
      ],
      [Language.JAPANESE]: [
        '[object]を落とす。一度輝いて、ネオンの暗闇に消える。',
        '[object]が金属床に当たってデジタルな叫びを上げる。消えた。ネットに失われた。',
      ],
      [Language.MANDARIN]: [
        '你掉落[object]。它闪烁一次，然后消失在霓虹黑暗中。',
        '[object]砸在金属地板上，发出数字尖叫声。消失了。丢失在网络中。',
      ],
      [Language.RUSSIAN]: [
        'Вы роняете [object]. Оно мигает один раз, потом исчезает в неоновую тьму.',
        '[object] ударяется о металлический пол с цифровым криком. Ушёл. Потеря в сети.',
      ],
      [Language.PORTUGUESE]: [
        'Você solta [object]. Pisca uma vez, depois desaparece na escuridão neon.',
        '[object] bate no chão de metal com um grito digital. Desaparecido. Perdido na rede.',
      ],
      [Language.UKRAINIAN]: [
        'Ви роняєте [object]. Воно блимає один раз, потім зникає в неонову темряву.',
        '[object] ударяється об металеву підлогу з цифровим криком. Пропав. Втраче в мережі.',
      ],
      [Language.POLISH]: [
        'Puszczasz [object]. Błyska raz, potem znika w neonową ciemność.',
        '[object] uderza w metalową podłogę z cyfrowym krzykiem. Znikło. Stracone w sieci.',
      ],
      [Language.CZECH]: [
        'Pouštíš [object]. Bliká jednou, pak zmizí v neonové temnotě.',
        '[object] narazí na kovovou podlahu digitálním křikem. Pryč. Ztraceno v síti.',
      ],
    },
    priority: 10,
  },

  // TALK - Cyberpunk
  {
    id: 'talk_success_cyberpunk',
    intent: 'TALK',
    genre: 'Cyberpunk',
    templates: {
      [Language.ENGLISH]: [
        'You jack into [object]. Their mind-voice cuts through encrypted channels.',
        '[object] speaks in corp-speak and street slang. Information flows both ways.',
        'You converse with [object]. Data spills like rain in the neon city.',
      ],
      [Language.SPANISH]: [
        'Te conectas con [object]. Su voz mental corta canales encriptados.',
        '[object] habla en jerga corporativa y de calle. La información fluye en ambas direcciones.',
        'Conversas con [object]. Los datos se derraman como lluvia en la ciudad de neón.',
      ],
      [Language.FRENCH]: [
        'Vous vous connectez avec [object]. Leur voix mentale coupe les canaux chiffrés.',
        '[object] parle en jargon corporatif et argot de rue. Les informations circulent dans les deux sens.',
      ],
      [Language.GERMAN]: [
        'Du verbindest dich mit [object]. Ihre mentale Stimme durchschneidet verschlüsselte Kanäle.',
        '[object] spricht in Konzernsprache und Straßenslang. Informationen fließen in beide Richtungen.',
      ],
      [Language.ITALIAN]: [
        'Ti connetti con [object]. La loro voce mentale taglia attraverso i canali crittografati.',
        '[object] parla in gergo aziendale e slang stradale. Le informazioni fluiscono in entrambe le direzioni.',
      ],
      [Language.JAPANESE]: [
        '[object]にジャックインする。彼らのマインドボイスが暗号化されたチャネルを切る。',
        '[object]は企業用語と街路スラングで話す。情報は両方向に流れる。',
      ],
      [Language.MANDARIN]: [
        '你与[object]连接。他们的心灵之声切割加密频道。',
        '[object]用企业术语和街头黑话说话。信息流向双方。',
      ],
      [Language.RUSSIAN]: [
        'Вы подключаетесь к [object]. Их ментальный голос пробивает зашифрованные каналы.',
        '[object] говорит на корпоративном жаргоне и уличном сленге. Информация течёт в обе стороны.',
      ],
      [Language.PORTUGUESE]: [
        'Você se conecta com [object]. Sua voz mental corta os canais criptografados.',
        '[object] fala em jargão corporativo e gíria de rua. As informações fluem nos dois sentidos.',
      ],
      [Language.UKRAINIAN]: [
        'Ви підключаєтесь до [object]. Їхній ментальний голос розрізує зашифровані канали.',
        '[object] говорить корпоративним жаргоном та вуличним сленгом. Інформація тече в обидва боки.',
      ],
      [Language.POLISH]: [
        'Podłączasz się do [object]. Ich głos umysłu przecina zaszyfrowane kanały.',
        '[object] mówi w żargonie korporacyjnym i slangu ulicy. Informacje płyną w obie strony.',
      ],
      [Language.CZECH]: [
        'Připojíš se k [object]. Jeho myšlenkový hlas prořezává šifrované kanály.',
        '[object] mluví v korporátní mluvě a pouličním slangu. Informace tečou oběma směry.',
      ],
    },
    priority: 10,
  },

  // USE - Cyberpunk
  {
    id: 'use_success_cyberpunk',
    intent: 'USE',
    genre: 'Cyberpunk',
    templates: {
      [Language.ENGLISH]: [
        'You activate [object]. Circuits hum. Reality bends slightly.',
        '[object] comes alive with purpose. The system responds to your touch.',
        'You interface with [object]. Power surges through the network.',
      ],
      [Language.SPANISH]: [
        'Activas [object]. Los circuitos zumban. La realidad se dobla ligeramente.',
        '[object] cobra vida con propósito. El sistema responde a tu toque.',
        'Te conectas con [object]. El poder surge a través de la red.',
      ],
      [Language.FRENCH]: [
        'Vous activez [object]. Les circuits bourdonnent. La réalité se plie légèrement.',
        '[object] prend vie avec intention. Le système répond à votre toucher.',
      ],
      [Language.GERMAN]: [
        'Du aktivierst [object]. Schaltkreise summen. Die Realität verbiegt sich leicht.',
        '[object] erwacht mit Absicht zum Leben. Das System reagiert auf deine Berührung.',
      ],
    },
    priority: 10,
  },
];

/**
 * Mystery Genre Templates - Clues, investigation, discovery, suspense
 */
export const MYSTERY_TEMPLATES: ResponseTemplate[] = [
  // EXAMINE - Mystery
  {
    id: 'examine_success_mystery',
    intent: 'EXAMINE',
    genre: 'Mystery',
    templates: {
      [Language.ENGLISH]: [
        'You inspect [object] closely. A crucial detail catches your eye—a clue.',
        '[object] reveals a hidden pattern. The pieces of the puzzle begin to fit.',
        'You examine [object] with careful attention. Something doesn\'t add up here.',
      ],
      [Language.SPANISH]: [
        'Inspecciona [object] de cerca. Un detalle crucial llama tu atención: una pista.',
        '[object] revela un patrón oculto. Las piezas del rompecabezas comienzan a encajar.',
        'Examina [object] con cuidado. Algo no cuadra aquí.',
      ],
      [Language.FRENCH]: [
        'Vous inspectez [object] de près. Un détail crucial attire votre attention—un indice.',
        '[object] révèle un motif caché. Les pièces du puzzle commencent à s\'emboîter.',
      ],
      [Language.GERMAN]: [
        'Du inspizierst [object] genau. Ein entscheidendes Detail fällt dir auf—ein Hinweis.',
        '[object] enthüllt ein verstecktes Muster. Die Teile des Rätsels passen zusammen.',
      ],
      [Language.ITALIAN]: [
        'Ispezioni [object] attentamente. Un dettaglio cruciale attira la tua attenzione: un indizio.',
        '[object] rivela un modello nascosto. I pezzi del puzzle iniziano a combinarsi.',
      ],
      [Language.JAPANESE]: [
        '[object]を注意深く検査する。重要な詳細があなたの注意を引く。手がかりだ。',
        '[object]が隠されたパターンを明らかにする。パズルのピースが合い始める。',
      ],
      [Language.MANDARIN]: [
        '你仔细检查[object]。一个关键的细节引起你的注意，这是一条线索。',
        '[object]揭示了隐藏的模式。拼图的碎片开始组合。',
      ],
      [Language.RUSSIAN]: [
        'Вы внимательно осматриваете [object]. Решающая деталь привлекает ваше внимание—улика.',
        '[object] раскрывает скрытую закономерность. Части головоломки начинают складываться.',
      ],
      [Language.PORTUGUESE]: [
        'Você inspeciona [object] atentamente. Um detalhe crucial chama sua atenção—uma pista.',
        '[object] revela um padrão oculto. Os pedaços do quebra-cabeça começam a se encaixar.',
      ],
      [Language.UKRAINIAN]: [
        'Ви уважно оглядаєте [object]. Вирішальна деталь привертає вашу увагу—підказка.',
        '[object] розкриває приховану закономірність. Частини головоломки починають складатися.',
      ],
      [Language.POLISH]: [
        'Dokładnie badasz [object]. Kluczowy szczegół przyciąga twoją uwagę—wskazówka.',
        '[object] ujawnia ukryty wzór. Kawałki puzzle\'u zaczynają się dopasowywać.',
      ],
      [Language.CZECH]: [
        'Podrobně zkoumáš [object]. Klíčový detail upoutá tvou pozornost—stopa.',
        '[object] odhaluje skrytý vzor. Kousky puzzle se začínají skládat.',
      ],
    },
    priority: 10,
  },

  // TAKE - Mystery
  {
    id: 'take_success_mystery',
    intent: 'TAKE',
    genre: 'Mystery',
    templates: {
      [Language.ENGLISH]: [
        'You pocket [object]. It might be important. Everything could be a clue.',
        '[object] goes into your evidence bag. Another piece of the puzzle.',
        'You take [object]. Your detective instincts tingle with possibility.',
      ],
      [Language.SPANISH]: [
        'Guardas [object] en tu bolsillo. Podría ser importante. Todo podría ser una pista.',
        '[object] entra en tu bolsa de pruebas. Otra pieza del rompecabezas.',
        'Tomas [object]. Tus instintos de detective hormiguean de posibilidades.',
      ],
      [Language.FRENCH]: [
        'Vous empochetez [object]. Cela pourrait être important. Tout pourrait être un indice.',
        '[object] entre dans votre sac de preuves. Une autre pièce du puzzle.',
      ],
      [Language.GERMAN]: [
        'Du steckst [object] in deine Tasche. Es könnte wichtig sein. Alles könnte ein Hinweis sein.',
        '[object] geht in deine Beweisbeutel. Ein weiteres Stück des Rätsels.',
      ],
      [Language.ITALIAN]: [
        'Metti [object] in tasca. Potrebbe essere importante. Tutto potrebbe essere un indizio.',
        '[object] entra nella tua borsa di prove. Un altro pezzo del puzzle.',
      ],
      [Language.JAPANESE]: [
        '[object]をポケットに入れる。重要かもしれない。すべてが手がかりになる可能性がある。',
        '[object]は証拠袋に入る。別のパズルピース。',
      ],
      [Language.MANDARIN]: [
        '你把[object]放在口袋里。它可能很重要。一切都可能是线索。',
        '[object]进入你的证物袋。拼图的另一块。',
      ],
      [Language.RUSSIAN]: [
        'Вы кладёте [object] в карман. Это может быть важно. Всё может быть уликой.',
        '[object] входит в вашу сумку улик. Ещё один кусок головоломки.',
      ],
      [Language.PORTUGUESE]: [
        'Você coloca [object] no bolso. Poderia ser importante. Tudo poderia ser uma pista.',
        '[object] entra em sua bolsa de evidência. Outra peça do quebra-cabeça.',
      ],
      [Language.UKRAINIAN]: [
        'Ви кладете [object] в кишеню. Це може бути важливо. Все може бути підказкою.',
        '[object] входить у вашу сумку доказів. Ще один шматок головоломки.',
      ],
      [Language.POLISH]: [
        'Wkładasz [object] do kieszeni. Może być ważny. Wszystko mogło być wskazówką.',
        '[object] trafia do twojej torby dowodów. Kolejny kawałek puzzlu.',
      ],
      [Language.CZECH]: [
        'Vložíš [object] do kapsy. Mohlo by to být důležité. Vše by mohlo být stopou.',
        '[object] vejde do tvé tašky důkazů. Další kousek puzzle.',
      ],
    },
    priority: 10,
  },

  // OPEN - Mystery
  {
    id: 'open_success_mystery',
    intent: 'OPEN',
    genre: 'Mystery',
    templates: {
      [Language.ENGLISH]: [
        'You carefully open [object]. What will you find inside?',
        '[object] swings open, revealing its secrets. Your heart races.',
        'You unlock [object]. The truth lies within.',
      ],
      [Language.SPANISH]: [
        'Abres [object] cuidadosamente. ¿Qué encontrarás adentro?',
        '[object] se abre, revelando sus secretos. Tu corazón se acelera.',
        'Desbloqueas [object]. La verdad está dentro.',
      ],
      [Language.FRENCH]: [
        'Vous ouvrez [object] avec soin. Que trouverez-vous à l\'intérieur?',
        '[object] s\'ouvre, révélant ses secrets. Votre cœur s\'accélère.',
      ],
      [Language.GERMAN]: [
        'Du öffnest [object] vorsichtig. Was wirst du darin finden?',
        '[object] öffnet sich und enthüllt seine Geheimnisse. Dein Herz rast.',
      ],
      [Language.ITALIAN]: [
        'Apri [object] con cura. Cosa troverai dentro?',
        '[object] si apre, rivelando i suoi segreti. Il tuo cuore accelera.',
      ],
      [Language.JAPANESE]: [
        '[object]を慎重に開く。中身には何が見つかるだろうか?',
        '[object]が開き、その秘密を明かす。あなたの心が高鳴る。',
      ],
      [Language.MANDARIN]: [
        '你小心地打开[object]。你会在里面发现什么？',
        '[object]打开，揭露了它的秘密。你的心跳加速。',
      ],
      [Language.RUSSIAN]: [
        'Вы осторожно открываете [object]. Что вы найдёте внутри?',
        '[object] открывается, раскрывая свои тайны. Ваше сердце ускоряется.',
      ],
      [Language.PORTUGUESE]: [
        'Você abre [object] cuidadosamente. O que você encontrará dentro?',
        '[object] se abre, revelando seus segredos. Seu coração dispara.',
      ],
      [Language.UKRAINIAN]: [
        'Ви обережно відкриваєте [object]. Що ви знайдете всередину?',
        '[object] відкривається, розкриваючи свої таємниці. Ваше серце прискорюється.',
      ],
      [Language.POLISH]: [
        'Ostrożnie otwierasz [object]. Co znajdziesz w środku?',
        '[object] się otwiera, ujawniając swoje tajemnice. Twoje serce przyspiesza.',
      ],
      [Language.CZECH]: [
        'Opatrně otevřeš [object]. Co v něm najdeš?',
        '[object] se otevírá a odhaluje své tajemství. Tvé srdce zrychluje.',
      ],
    },
    priority: 10,
  },

  // DROP - Mystery
  {
    id: 'drop_success_mystery',
    intent: 'DROP',
    genre: 'Mystery',
    templates: {
      [Language.ENGLISH]: [
        'You drop [object]. It falls, forgotten, into the shadows.',
        '[object] disappears from sight. Another loose end.',
        'You release [object]. It slips away, lost to the mystery.',
      ],
      [Language.SPANISH]: [
        'Sueltas [object]. Cae, olvidado, en las sombras.',
        '[object] desaparece de la vista. Otro cabo suelto.',
        'Sueltas [object]. Se escurre, perdido en el misterio.',
      ],
      [Language.FRENCH]: [
        'Vous lâchez [object]. Il tombe, oublié, dans l\'ombre.',
        '[object] disparaît de la vue. Une autre question sans réponse.',
      ],
      [Language.GERMAN]: [
        'Du lässt [object] fallen. Es fällt, vergessen, in die Schatten.',
        '[object] verschwindet aus dem Blickfeld. Noch eine offene Frage.',
      ],
      [Language.ITALIAN]: [
        'Lasci cadere [object]. Cade, dimenticato, nelle ombre.',
        '[object] scompare dalla vista. Un altro capo sciolto.',
      ],
      [Language.JAPANESE]: [
        '[object]を落とす。忘れられ、影に落ちる。',
        '[object]が視界から消える。別の未解決の端。',
      ],
      [Language.MANDARIN]: [
        '你掉落[object]。它掉落，被遗忘，进入阴影。',
        '[object]从视线中消失。另一条松散的线索。',
      ],
      [Language.RUSSIAN]: [
        'Вы роняете [object]. Оно падает, забытое, в тени.',
        '[object] исчезает из вида. Ещё один открытый вопрос.',
      ],
      [Language.PORTUGUESE]: [
        'Você solta [object]. Cai, esquecido, nas sombras.',
        '[object] desaparece da vista. Outra ponta solta.',
      ],
      [Language.UKRAINIAN]: [
        'Ви роняєте [object]. Воно падає, забуте, у тіні.',
        '[object] зникає з виду. Ще одна незавершена лінія.',
      ],
      [Language.POLISH]: [
        'Puszczasz [object]. Spada, zapomniany, w cienie.',
        '[object] znika z widoku. Kolejny luźny koniec.',
      ],
      [Language.CZECH]: [
        'Pouštíš [object]. Padá, zapomenuté, do stínů.',
        '[object] zmizí z dohledu. Další volný konec.',
      ],
    },
    priority: 10,
  },

  // TALK - Mystery
  {
    id: 'talk_success_mystery',
    intent: 'TALK',
    genre: 'Mystery',
    templates: {
      [Language.ENGLISH]: [
        'You interview [object]. They know more than they\'re telling.',
        '[object] speaks carefully. Every word might hide a secret.',
        'You converse with [object]. The truth is buried in what they DON\'T say.',
      ],
      [Language.SPANISH]: [
        'Entrevistas a [object]. Saben más de lo que dicen.',
        '[object] habla cuidadosamente. Cada palabra podría esconder un secreto.',
        'Conversas con [object]. La verdad está enterrada en lo que NO dicen.',
      ],
      [Language.FRENCH]: [
        'Vous interrogez [object]. Ils savent plus qu\'ils ne le disent.',
        '[object] parle prudemment. Chaque parole pourrait cacher un secret.',
      ],
      [Language.GERMAN]: [
        'Du befragst [object]. Sie wissen mehr, als sie zugeben.',
        '[object] spricht vorsichtig. Jedes Wort könnte ein Geheimnis verbergen.',
      ],
      [Language.ITALIAN]: [
        'Intervisti [object]. Sanno più di quello che dicono.',
        '[object] parla attentamente. Ogni parola potrebbe nascondere un segreto.',
      ],
      [Language.JAPANESE]: [
        '[object]にインタビューする。彼らはもっと知っている。',
        '[object]が慎重に話す。すべての言葉が秘密を隠しているかもしれない。',
      ],
      [Language.MANDARIN]: [
        '你采访[object]。他们知道的比说的多。',
        '[object]谨慎地说话。每一句话都可能隐藏一个秘密。',
      ],
      [Language.RUSSIAN]: [
        'Вы интервьюируете [object]. Они знают больше, чем признаются.',
        '[object] говорит осторожно. Каждое слово может скрывать тайну.',
      ],
      [Language.PORTUGUESE]: [
        'Você entrevista [object]. Eles sabem mais do que estão dizendo.',
        '[object] fala com cuidado. Cada palavra pode esconder um segredo.',
      ],
      [Language.UKRAINIAN]: [
        'Ви беретесь з [object]. Вони знають більше, ніж кажуть.',
        '[object] говорить обережно. Кожне слово може приховувати таємницю.',
      ],
      [Language.POLISH]: [
        'Przesłuchujesz [object]. Wiedzą więcej, niż przyznają.',
        '[object] mówi ostrożnie. Każde słowo mogło by kryć sekret.',
      ],
      [Language.CZECH]: [
        'Vyslechneš [object]. Vědí více, než si připouštějí.',
        '[object] mluví opatrně. Každé slovo by mohlo skrývat tajemství.',
      ],
    },
    priority: 10,
  },

  // USE - Mystery
  {
    id: 'use_success_mystery',
    intent: 'USE',
    genre: 'Mystery',
    templates: {
      [Language.ENGLISH]: [
        'You use [object]. New questions emerge. The case deepens.',
        '[object] serves its purpose. But what does it mean?',
        'You activate [object]. A revelation unfolds before you.',
      ],
      [Language.SPANISH]: [
        'Usas [object]. Surgen nuevas preguntas. El caso se profundiza.',
        '[object] cumple su propósito. ¿Pero qué significa?',
        'Activas [object]. Una revelación se despliega ante ti.',
      ],
      [Language.FRENCH]: [
        'Vous utilisez [object]. De nouvelles questions émergent. L\'enquête s\'approfondit.',
        '[object] remplit son objectif. Mais que signifie-t-il?',
      ],
      [Language.GERMAN]: [
        'Du benutzt [object]. Neue Fragen tauchen auf. Der Fall wird tiefer.',
        '[object] erfüllt seinen Zweck. Aber was bedeutet es?',
      ],
    },
    priority: 10,
  },
];

/**
 * Export all genre templates
 */
export const ALL_GENRE_TEMPLATES: ResponseTemplate[] = [
  ...FANTASY_TEMPLATES,
  ...SCIFI_TEMPLATES,
  ...HORROR_TEMPLATES,
  ...WESTERN_TEMPLATES,
  ...CYBERPUNK_TEMPLATES,
  ...MYSTERY_TEMPLATES,
];
