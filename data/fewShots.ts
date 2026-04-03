export function getFewShot(language: string, theme: string): string {
    const examples: Record<string, Record<string, string[]>> = {
        'English': {
            'fantasy': [
                `Example:\nStory so far: You stand before a massive stone door covered in glowing blue runes.\nPlayer action: I push the door open.\nStory continuation: The heavy stone grinds against the floor as you push it, revealing a cavern filled with glittering treasure.`,
                `Example:\nStory so far: You arrive at a small village hidden deep in the forest.\nPlayer action: I look for a tavern.\nStory continuation: You easily spot a lively tavern by the warm glow of lanterns spilling from its windows.`
            ],
            'horror': [
                `Example:\nStory so far: You are in a cold, fog-drenched graveyard.\nPlayer action: I examine the closest tombstone.\nStory continuation: You brush the moss away, revealing a name that is completely illegible, scratched out by deep claw marks.`
            ],
            'western': [
                `Example:\nStory so far: You stand at the edge of a dusty, sun-baked canyon.\nPlayer action: I look for a way down.\nStory continuation: You spot a narrow, rocky trail winding precariously down the steep canyon wall.`
            ],
            'mystery': [
                `Example:\nStory so far: You are standing in the grand foyer of a dimly lit Victorian mansion.\nPlayer action: I ask if anyone is there.\nStory continuation: You listen closely, but only the heavy silence and the ticking of a grandfather clock answer you.`
            ],
            'cyberpunk': [
                `Example:\nStory so far: Rain slicks the pavement of the neon-lit street.\nPlayer action: I check my cybernetic arm.\nStory continuation: You glance at your metal forearm, noting the blinking red light that warns of low battery.`
            ],
            'default': [
                `Example:\nStory so far: You are standing in a quiet area.\nPlayer action: I look around.\nStory continuation: You scan your surroundings carefully, taking in the sights and sounds of the environment.`
            ]
        },
        'French': {
            'fantasy': [
                `Example:\nStory so far: Vous vous tenez devant une immense porte de pierre couverte de runes bleues lumineuses.\nPlayer action: je pousse la porte\nStory continuation: La pierre lourde grince contre le sol lorsque vous la poussez, révélant une caverne remplie de trésors scintillants.`
            ],
            'horror': [
                `Example:\nStory so far: Vous êtes dans un cimetière froid et brumeux.\nPlayer action: j'examine la tombe la plus proche\nStory continuation: Vous brossez la mousse, révélant un nom complètement illisible, rayé par de profondes marques de griffes.`
            ],
            'western': [
                `Example:\nStory so far: Vous vous tenez au bord d'un canyon poussiéreux et cuit par le soleil.\nPlayer action: je cherche un moyen de descendre\nStory continuation: Vous apercevez un sentier étroit et rocailleux qui serpente dangereusement sur la paroi abrupte du canyon.`
            ],
            'mystery': [
                `Example:\nStory so far: Vous êtes dans le grand hall d'un manoir victorien mal éclairé.\nPlayer action: je demande s'il y a quelqu'un\nStory continuation: Vous tendez l'oreille, mais seul le silence pesant et le tic-tac d'une horloge vous répondent.`
            ],
            'cyberpunk': [
                `Example:\nStory so far: La pluie rend les trottoirs de la rue éclairée aux néons glissants.\nPlayer action: je vérifie mon bras cybernétique\nStory continuation: Vous jetez un coup d'œil à votre avant-bras en métal, remarquant la lumière rouge clignotante qui signale une batterie faible.`
            ],
            'default': [
                `Example:\nStory so far: Vous vous trouvez dans un endroit calme.\nPlayer action: je regarde autour de moi\nStory continuation: Vous scrutez attentivement votre environnement, observant chaque détail de la zone.`
            ]
        },
        'Spanish': {
            'fantasy': [
                `Example:\nStory so far: Estás frente a una enorme puerta de piedra cubierta de runas azules brillantes.\nPlayer action: empujo la puerta para abrirla\nStory continuation: La pesada piedra chirría contra el suelo mientras la empujas, revelando una caverna llena de tesoros relucientes.`
            ],
            'horror': [
                `Example:\nStory so far: Estás en un cementerio frío y cubierto de niebla.\nPlayer action: examino la lápida más cercana\nStory continuation: Apartas el musgo, revelando un nombre completamente ilegible, tachado por profundas marcas de garras.`
            ],
            'western': [
                `Example:\nStory so far: Estás en el borde de un cañón polvoriento y horneado por el sol.\nPlayer action: busco una forma de bajar\nStory continuation: Divisas un sendero estrecho y rocoso que desciende peligrosamente por la escarpada pared del cañón.`
            ],
            'mystery': [
                `Example:\nStory so far: Estás en el gran vestíbulo de una mansión victoriana tenuemente iluminada.\nPlayer action: pregunto si hay alguien ahí\nStory continuation: Escuchas atentamente, pero solo el pesado silencio y el tictac de un reloj de pie te responden.`
            ],
            'cyberpunk': [
                `Example:\nStory so far: La lluvia hace resbaladizo el pavimento de la calle iluminada con neón.\nPlayer action: reviso mi brazo cibernético\nStory continuation: Miras tu antebrazo de metal, notando la luz roja parpadeante que advierte de batería baja.`
            ],
            'default': [
                `Example:\nStory so far: Te encuentras en un lugar tranquilo.\nPlayer action: miro a mi alrededor\nStory continuation: Escaneas cuidadosamente tu entorno, asimilando las vistas y los sonidos del área.`
            ]
        },
        'Russian': {
            'mystery': [
                `Example:\nStory so far: Вы стоите в огромном вестибюле тускло освещенного викторианского особняка.\nPlayer action: Я спрашиваю, есть ли здесь кто-нибудь.\nStory continuation: Вы прислушиваетесь, но ответом вам служит лишь тяжелая тишина и тиканье напольных часов.`
            ],
            'western': [
                `Example:\nStory so far: Вы стоите на краю пыльного, выжженного солнцем каньона.\nPlayer action: Я ищу путь вниз.\nStory continuation: Вы замечаете узкую каменистую тропу, которая опасно извивается по крутой стене каньона.`
            ],
            'horror': [
                `Example:\nStory so far: Вы находитесь на холодном, окутанном туманом кладбище.\nPlayer action: Я осматриваю ближайшую могилу.\nStory continuation: Вы смахиваете мох, открывая совершенно неразборчивое имя, выцарапанное глубокими следами когтей.`
            ],
            'default': [
                `Example:\nStory so far: Вы стоите в тихом месте.\nPlayer action: Я оглядываюсь.\nStory continuation: Вы внимательно осматриваете окрестности, подмечая каждую деталь.`
            ]
        },
        'German': {
            'default': [
                `Example:\nStory so far: Du befindest dich an einem ruhigen Ort.\nPlayer action: Ich sehe mich um.\nStory continuation: Du scannst deine Umgebung sorgfältig und nimmst jedes Detail auf.`
            ]
        },
        'Italian': {
            'default': [
                `Example:\nStory so far: Ti trovi in un posto tranquillo.\nPlayer action: Mi guardo intorno.\nStory continuation: Scruti attentamente l'ambiente circostante, notando ogni dettaglio.`
            ]
        },
        'Portuguese': {
            'default': [
                `Example:\nStory so far: Você está em um lugar tranquilo.\nPlayer action: Eu olho ao redor.\nStory continuation: Você escaneia cuidadosamente o ambiente, observando cada detalhe.`
            ]
        },
        'Mandarin': {
            'default': [
                `Example:\nStory so far: 你站在一个安静的地方。\nPlayer action: 我四处看看。\nStory continuation: 你仔细环顾四周，观察着环境的每一个细节。`
            ]
        },
                'Japanese': {
            'fantasy': [
                `Example:\nStory so far: あなたは青く光るルーン文字で覆われた巨大な石の扉の前に立っています。\nPlayer action: 扉を押して開けます。\nStory continuation: あなたが扉を押すと、重い石が床に擦れる音が響き、中には輝く宝物でいっぱいの洞窟が現れます。`,
                `Example:\nStory so far: あなたは森の奥深くに隠された小さな村に到着します。\nPlayer action: 酒場を探します。\nStory continuation: 窓から漏れる提灯の暖かい光で、活気のある酒場をすぐに見つけることができます。`
            ],
            'horror': [
                `Example:\nStory so far: あなたは冷たく霧に包まれた墓地にいます。\nPlayer action: 一番近い墓石を調べます。\nStory continuation: 苔を払い落とすと、そこには深い爪痕で削り取られた、まったく判別できない名前が現れました。`
            ],
            'western': [
                `Example:\nStory so far: あなたは埃っぽく、太陽に照らされたカニオンの端に立っています。\nPlayer action: 下に降りる道を探します。\nStory continuation: あなたは急なカニオンの壁を危うく曲がりくねって降りる、狭い岩の道を見つけました。`
            ],
            'mystery': [
                `Example:\nStory so far: あなたは薄暗いヴィクトリア朝の屋敷の広い玄関ホールに立っています。\nPlayer action: 誰かいるか尋ねます。\nStory continuation: 耳を澄ませますが、重苦しい静寂と祖父の時計のチクタクという音だけが返ってきます。`
            ],
            'cyberpunk': [
                `Example:\nStory so far: 雨がネオンに照らされた通りの舗装を濡らしています。\nPlayer action: サイバネティックアームをチェックします。\nStory continuation: 金属製の前腕に目をやると、バッテリー低下を警告する赤い光が点滅しています。`
            ],
            'default': [
                `Example:\nStory so far: あなたは静かな場所に立っています。\nPlayer action: 周りを見回す。\nStory continuation: あなたは周囲を注意深く見渡し、環境の細部を観察します。`
            ]
        },
        'Ukrainian': {
            'default': [
                `Example:\nStory so far: Ви стоїте в тихому місці.\nPlayer action: Я озираюся.\nStory continuation: Ви уважно оглядаєте околиці, підмічаючи кожну деталь.`
            ]
        },
        'Polish': {
            'default': [
                `Example:\nStory so far: Stoisz w spokojnym miejscu.\nPlayer action: Rozglądam się.\nStory continuation: Uważnie przyglądasz się otoczeniu, dostrzegając każdy szczegół.`
            ]
        },
        'Czech': {
            'default': [
                `Example:\nStory so far: Stojíte na klidném místě.\nPlayer action: Rozhlížím se.\nStory continuation: Pečlivě si prohlížíte své okolí a všímáte si každého detailu.`
            ]
        }
    };

    const langData = examples[language] || examples['English'];
    const themeExamples = langData[theme] || langData['default'] || examples['English']['default'];
    
    // Pick a random example from the array
    return themeExamples[Math.floor(Math.random() * themeExamples.length)];
}