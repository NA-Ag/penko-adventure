const fs = require('fs');
let content = fs.readFileSync('translations.ts', 'utf-8');

const englishBlock = `    local_trans_title: "Local Translation Engine (OPUS-MT)",
    local_trans_desc: "Required for offline translation of your actions and the game's story.",
    local_trans_storage: "Required Storage: ~75 MB",
    local_trans_download: "Download Translation Engine",
    local_trans_ready: "✅ Translation Engine is ready!",
    local_trans_initializing: "Initializing translation engine...",`;

const spanishBlock = `        local_trans_title: "Motor de Traducción Local (OPUS-MT)",
        local_trans_desc: "Requerido para la traducción sin conexión de tus acciones y la historia del juego.",
        local_trans_storage: "Almacenamiento requerido: ~75 MB",
        local_trans_download: "Descargar Motor de Traducción",
        local_trans_ready: "✅ ¡El motor de traducción está listo!",
        local_trans_initializing: "Inicializando motor de traducción...",`;

const frenchBlock = `        local_trans_title: "Moteur de Traduction Local (OPUS-MT)",
        local_trans_desc: "Requis pour la traduction hors ligne de vos actions et de l'histoire du jeu.",
        local_trans_storage: "Stockage requis : ~75 MB",
        local_trans_download: "Télécharger le Moteur de Traduction",
        local_trans_ready: "✅ Le moteur de traduction est prêt !",
        local_trans_initializing: "Initialisation du moteur de traduction...",`;

const germanBlock = `        local_trans_title: "Lokale Übersetzungs-Engine (OPUS-MT)",
        local_trans_desc: "Erforderlich für die Offline-Übersetzung deiner Aktionen und der Spielgeschichte.",
        local_trans_storage: "Erforderlicher Speicherplatz: ~75 MB",
        local_trans_download: "Übersetzungs-Engine herunterladen",
        local_trans_ready: "✅ Übersetzungs-Engine ist bereit!",
        local_trans_initializing: "Initialisiere Übersetzungs-Engine...",`;

const italianBlock = `        local_trans_title: "Motore di Traduzione Locale (OPUS-MT)",
        local_trans_desc: "Richiesto per la traduzione offline delle tue azioni e della storia del gioco.",
        local_trans_storage: "Spazio richiesto: ~75 MB",
        local_trans_download: "Scarica Motore di Traduzione",
        local_trans_ready: "✅ Il motore di traduzione è pronto!",
        local_trans_initializing: "Inizializzazione motore di traduzione...",`;

const japaneseBlock = `        local_trans_title: "ローカル翻訳エンジン (OPUS-MT)",
        local_trans_desc: "アクションとゲームストーリーのオフライン翻訳に必要です。",
        local_trans_storage: "必要なストレージ: ~75 MB",
        local_trans_download: "翻訳エンジンをダウンロード",
        local_trans_ready: "✅ 翻訳エンジンの準備ができました！",
        local_trans_initializing: "翻訳エンジンを初期化中...",`;

const mandarinBlock = `        local_trans_title: "本地翻译引擎 (OPUS-MT)",
        local_trans_desc: "用于离线翻译您的动作和游戏故事。",
        local_trans_storage: "所需存储空间：~75 MB",
        local_trans_download: "下载翻译引擎",
        local_trans_ready: "✅ 翻译引擎已就绪！",
        local_trans_initializing: "正在初始化翻译引擎...",`;

const russianBlock = `        local_trans_title: "Локальный механизм перевода (OPUS-MT)",
        local_trans_desc: "Требуется для офлайн-перевода ваших действий и истории игры.",
        local_trans_storage: "Требуемое место: ~75 МБ",
        local_trans_download: "Скачать механизм перевода",
        local_trans_ready: "✅ Механизм перевода готов!",
        local_trans_initializing: "Инициализация механизма перевода...",`;

const portugueseBlock = `        local_trans_title: "Motor de Tradução Local (OPUS-MT)",
        local_trans_desc: "Necessário para a tradução offline de suas ações e da história do jogo.",
        local_trans_storage: "Armazenamento necessário: ~75 MB",
        local_trans_download: "Baixar Motor de Tradução",
        local_trans_ready: "✅ O motor de tradução está pronto!",
        local_trans_initializing: "Inicializando motor de tradução...",`;

const ukrainianBlock = `        local_trans_title: "Локальний механізм перекладу (OPUS-MT)",
        local_trans_desc: "Потрібен для офлайн-перекладу ваших дій та історії гри.",
        local_trans_storage: "Потрібне місце: ~75 МБ",
        local_trans_download: "Завантажити механізм перекладу",
        local_trans_ready: "✅ Механізм перекладу готовий!",
        local_trans_initializing: "Ініціалізація механізму перекладу...",`;

content = content.replace('    local_model_initializing: "Initializing download...",', '    local_model_initializing: "Initializing download...",\n' + englishBlock);
content = content.replace('        local_model_download: "Descargar Modelo Local",', '        local_model_download: "Descargar Modelo Local",\n' + spanishBlock);
content = content.replace('        local_model_download: "Télécharger le modèle local",', '        local_model_download: "Télécharger le modèle local",\n' + frenchBlock);
content = content.replace('        local_model_download: "Lokales Modell herunterladen",', '        local_model_download: "Lokales Modell herunterladen",\n' + germanBlock);
content = content.replace('        local_model_download: "Scarica Modello Locale",', '        local_model_download: "Scarica Modello Locale",\n' + italianBlock);
content = content.replace('        local_model_download: "ローカルモデルをダウンロード",', '        local_model_download: "ローカルモデルをダウンロード",\n' + japaneseBlock);
content = content.replace('        local_model_download: "下载本地模型",', '        local_model_download: "下载本地模型",\n' + mandarinBlock);
content = content.replace('        local_model_download: "Скачать локальную модель",', '        local_model_download: "Скачать локальную модель",\n' + russianBlock);
content = content.replace('        local_model_download: "Baixar Modelo Local",', '        local_model_download: "Baixar Modelo Local",\n' + portugueseBlock);
content = content.replace('        local_model_download: "Завантажити локальну модель",', '        local_model_download: "Завантажити локальну модель",\n' + ukrainianBlock);

fs.writeFileSync('translations.ts', content);
