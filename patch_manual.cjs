const fs = require('fs');

const manualContent = `import React from 'react';
import { Language } from '../types';

interface ManualProps {
  onClose: () => void;
  nativeLanguage: Language;
}

const MANUAL_CONTENT: Record<string, any> = {
  [Language.ENGLISH]: {
    title: "PENKO PUBLIC BETA",
    welcome: "Welcome to the initial public beta of Penko! Our objective is to test the core mechanics of the Penko Engine and gather feedback on our language learning pathways.",
    paths_title: "CHOOSE YOUR PATH",
    path_adv: "Adventure Path",
    path_adv_desc: "Learn through play in an open world. Form sentences to interact with your environment and progress the story.",
    path_edu: "Educational Path",
    path_edu_desc: "Follow structured scenarios designed for CEFR, JLPT, and HSK exam tracks. Practice specific goals like ordering at a cafe or arguing with a landlord.",
    modes_title: "GAME MODES",
    mode_browser: "Browser AI Mode",
    mode_browser_desc: "Runs 100% locally and privately in your web browser. Completely free, no installation required.",
    mode_cloud: "Cloud Mode",
    mode_cloud_desc: "Connects to advanced AI models for an infinite, highly-intelligent story. Requires your own API key.",
    future_title: "WHAT'S NEXT?",
    future_desc: "We are actively expanding Penko! Soon we will be adding full Voice Chat support and a dedicated Native Desktop App experience, all for free.",
    stay_tuned: "Stay tuned for updates at",
    close: "CLOSE MANUAL"
  },
  [Language.SPANISH]: {
    title: "BETA PÚBLICA DE PENKO",
    welcome: "¡Bienvenido a la beta pública inicial de Penko! Nuestro objetivo es probar las mecánicas principales y recopilar comentarios sobre las rutas de aprendizaje.",
    paths_title: "ELIGE TU CAMINO",
    path_adv: "Ruta de Aventura",
    path_adv_desc: "Aprende jugando en un mundo abierto. Forma oraciones para interactuar con tu entorno.",
    path_edu: "Ruta Educativa",
    path_edu_desc: "Sigue escenarios estructurados para los exámenes CEFR, JLPT y HSK. Practica objetivos específicos.",
    modes_title: "MODOS DE JUEGO",
    mode_browser: "Modo IA de Navegador",
    mode_browser_desc: "Se ejecuta 100% de forma local y privada. Totalmente gratis, sin instalación.",
    mode_cloud: "Modo en la Nube",
    mode_cloud_desc: "Se conecta a modelos de IA avanzados para una historia infinita. Requiere tu propia clave de API.",
    future_title: "¿QUÉ SIGUE?",
    future_desc: "¡Pronto añadiremos soporte para chat de voz y una aplicación de escritorio nativa gratuita!",
    stay_tuned: "Mantente atento a las actualizaciones en",
    close: "CERRAR MANUAL"
  },
  [Language.FRENCH]: {
    title: "BÊTA PUBLIQUE DE PENKO",
    welcome: "Bienvenue dans la bêta publique initiale de Penko ! Notre objectif est de tester les mécanismes principaux et de recueillir des avis sur l'apprentissage.",
    paths_title: "CHOISISSEZ VOTRE CHEMIN",
    path_adv: "Chemin d'Aventure",
    path_adv_desc: "Apprenez en jouant dans un monde ouvert. Formez des phrases pour interagir avec votre environnement.",
    path_edu: "Chemin Éducatif",
    path_edu_desc: "Suivez des scénarios structurés pour les examens CEFR, JLPT et HSK.",
    modes_title: "MODES DE JEU",
    mode_browser: "Mode IA du Navigateur",
    mode_browser_desc: "S'exécute à 100 % localement et en privé. Entièrement gratuit, sans installation.",
    mode_cloud: "Mode Cloud",
    mode_cloud_desc: "Se connecte à des modèles d'IA avancés pour une histoire infinie. Nécessite votre propre clé API.",
    future_title: "À VENIR",
    future_desc: "Nous ajouterons bientôt la prise en charge du chat vocal et une application de bureau native gratuite !",
    stay_tuned: "Restez à l'écoute des mises à jour sur",
    close: "FERMER LE MANUEL"
  },
  [Language.GERMAN]: {
    title: "PENKO ÖFFENTLICHE BETA",
    welcome: "Willkommen zur öffentlichen Beta von Penko! Unser Ziel ist es, die Kernmechaniken zu testen und Feedback zu sammeln.",
    paths_title: "WÄHLE DEINEN WEG",
    path_adv: "Abenteuer-Weg",
    path_adv_desc: "Lerne durch Spielen in einer offenen Welt. Bilde Sätze, um mit deiner Umgebung zu interagieren.",
    path_edu: "Bildungs-Weg",
    path_edu_desc: "Folge strukturierten Szenarien für CEFR, JLPT und HSK. Übe spezifische Ziele.",
    modes_title: "SPIELMODI",
    mode_browser: "Browser KI-Modus",
    mode_browser_desc: "Läuft zu 100% lokal und privat. Völlig kostenlos, keine Installation erforderlich.",
    mode_cloud: "Cloud-Modus",
    mode_cloud_desc: "Verbindet sich mit fortschrittlichen KI-Modellen für eine unendliche Geschichte. Benötigt einen eigenen API-Schlüssel.",
    future_title: "WAS KOMMT ALS NÄCHSTES?",
    future_desc: "Wir werden bald Voice-Chat-Unterstützung und eine kostenlose native Desktop-App hinzufügen!",
    stay_tuned: "Bleiben Sie dran für Updates unter",
    close: "HANDBUCH SCHLIESSEN"
  },
  [Language.ITALIAN]: {
    title: "BETA PUBBLICA DI PENKO",
    welcome: "Benvenuti alla beta pubblica iniziale di Penko! Il nostro obiettivo è testare le meccaniche principali e raccogliere feedback.",
    paths_title: "SCEGLI IL TUO PERCORSO",
    path_adv: "Percorso Avventura",
    path_adv_desc: "Impara giocando in un mondo aperto. Forma frasi per interagire con l'ambiente.",
    path_edu: "Percorso Educativo",
    path_edu_desc: "Segui scenari strutturati per gli esami CEFR, JLPT e HSK.",
    modes_title: "MODALITÀ DI GIOCO",
    mode_browser: "Modalità IA del Browser",
    mode_browser_desc: "Funziona al 100% localmente e privatamente. Completamente gratuito, nessuna installazione richiesta.",
    mode_cloud: "Modalità Cloud",
    mode_cloud_desc: "Si collega a modelli IA avanzati per una storia infinita. Richiede la tua chiave API.",
    future_title: "COSA C'È DI NUOVO?",
    future_desc: "Aggiungeremo presto il supporto per la chat vocale e un'app desktop nativa gratuita!",
    stay_tuned: "Restate sintonizzati per aggiornamenti su",
    close: "CHIUDI MANUALE"
  },
  [Language.JAPANESE]: {
    title: "PENKO パブリックベータ",
    welcome: "Penkoの初期パブリックベータへようこそ！私たちの目的は、コアメカニクスをテストし、フィードバックを収集することです。",
    paths_title: "道を選ぶ",
    path_adv: "アドベンチャーパス",
    path_adv_desc: "オープンワールドで遊びながら学びます。環境と対話するために文章を組み立てます。",
    path_edu: "教育パス",
    path_edu_desc: "CEFR、JLPT、HSKの試験向けに設計されたシナリオに従います。特定の目標を練習します。",
    modes_title: "ゲームモード",
    mode_browser: "ブラウザAIモード",
    mode_browser_desc: "ブラウザで100％ローカルかつプライベートに動作します。完全無料でインストールは不要です。",
    mode_cloud: "クラウドモード",
    mode_cloud_desc: "高度なAIモデルに接続し、無限のストーリーを提供します。ご自身のAPIキーが必要です。",
    future_title: "今後の展開",
    future_desc: "間もなくボイスチャットのサポートと無料のネイティブデスクトップアプリを追加する予定です！",
    stay_tuned: "最新情報についてはこちらをご覧ください",
    close: "マニュアルを閉じる"
  },
  [Language.MANDARIN]: {
    title: "PENKO 公开测试版",
    welcome: "欢迎来到 Penko 的初始公开测试版！我们的目标是测试核心机制并收集关于学习路径的反馈。",
    paths_title: "选择你的路径",
    path_adv: "冒险路径",
    path_adv_desc: "在开放世界中通过游戏学习。造句与环境互动。",
    path_edu: "教育路径",
    path_edu_desc: "遵循为 CEFR、JLPT 和 HSK 考试设计的结构化场景。练习特定目标。",
    modes_title: "游戏模式",
    mode_browser: "浏览器AI模式",
    mode_browser_desc: "100% 本地隐私运行。完全免费，无需安装。",
    mode_cloud: "云模式",
    mode_cloud_desc: "连接高级 AI 模型，讲述无限故事。需要您自己的 API 密钥。",
    future_title: "下一步是什么？",
    future_desc: "我们很快将添加语音聊天支持和免费的本地桌面应用程序！",
    stay_tuned: "请关注更新",
    close: "关闭手册"
  },
  [Language.RUSSIAN]: {
    title: "ПУБЛИЧНАЯ БЕТА PENKO",
    welcome: "Добро пожаловать в начальную публичную бета-версию Penko! Наша цель - протестировать основные механики и собрать отзывы.",
    paths_title: "ВЫБЕРИТЕ ПУТЬ",
    path_adv: "Путь приключений",
    path_adv_desc: "Обучение через игру в открытом мире. Составляйте предложения для взаимодействия с окружением.",
    path_edu: "Образовательный путь",
    path_edu_desc: "Следуйте структурированным сценариям для экзаменов CEFR, JLPT и HSK.",
    modes_title: "РЕЖИМЫ ИГРЫ",
    mode_browser: "Режим ИИ в браузере",
    mode_browser_desc: "Работает 100% локально и приватно. Полностью бесплатно, установка не требуется.",
    mode_cloud: "Облачный режим",
    mode_cloud_desc: "Подключается к передовым моделям ИИ для бесконечной истории. Требуется ваш собственный API ключ.",
    future_title: "ЧТО ДАЛЬШЕ?",
    future_desc: "Скоро мы добавим поддержку голосового чата и бесплатное нативное приложение для ПК!",
    stay_tuned: "Следите за обновлениями на",
    close: "ЗАКРЫТЬ РУКОВОДСТВО"
  },
  [Language.PORTUGUESE]: {
    title: "BETA PÚBLICA PENKO",
    welcome: "Bem-vindo à beta pública inicial do Penko! Nosso objetivo é testar as mecânicas e reunir feedback.",
    paths_title: "ESCOLHA SEU CAMINHO",
    path_adv: "Caminho de Aventura",
    path_adv_desc: "Aprenda brincando em um mundo aberto. Forme frases para interagir com seu ambiente.",
    path_edu: "Caminho Educacional",
    path_edu_desc: "Siga cenários estruturados para exames CEFR, JLPT e HSK.",
    modes_title: "MODOS DE JOGO",
    mode_browser: "Modo IA do Navegador",
    mode_browser_desc: "Roda 100% local e privadamente. Totalmente gratuito, sem instalação.",
    mode_cloud: "Modo Nuvem",
    mode_cloud_desc: "Conecta-se a modelos de IA avançados. Requer sua própria chave de API.",
    future_title: "O QUE VEM A SEGUIR?",
    future_desc: "Em breve adicionaremos chat de voz e um aplicativo de desktop nativo gratuito!",
    stay_tuned: "Fique ligado nas atualizações em",
    close: "FECHAR MANUAL"
  },
  [Language.UKRAINIAN]: {
    title: "ПУБЛІЧНА БЕТА PENKO",
    welcome: "Ласкаво просимо до початкової публічної бета-версії Penko! Наша мета - протестувати механіки та зібрати відгуки.",
    paths_title: "ОБЕРІТЬ СВІЙ ШЛЯХ",
    path_adv: "Шлях пригод",
    path_adv_desc: "Навчання через гру у відкритому світі. Будуйте речення для взаємодії з оточенням.",
    path_edu: "Освітній шлях",
    path_edu_desc: "Дотримуйтесь сценаріїв для іспитів CEFR, JLPT та HSK.",
    modes_title: "РЕЖИМИ ГРИ",
    mode_browser: "Режим ШІ в браузері",
    mode_browser_desc: "Працює 100% локально та приватно. Повністю безкоштовно, без встановлення.",
    mode_cloud: "Хмарний режим",
    mode_cloud_desc: "Підключається до передових моделей ШІ. Потрібен ваш власний ключ API.",
    future_title: "ЩО ДАЛІ?",
    future_desc: "Незабаром ми додамо підтримку голосового чату та безкоштовний настільний додаток!",
    stay_tuned: "Слідкуйте за оновленнями на",
    close: "ЗАКРИТИ ПОСІБНИК"
  },
  [Language.POLISH]: {
    title: "PUBLICZNA BETA PENKO",
    welcome: "Witamy w początkowej publicznej wersji beta Penko! Naszym celem jest przetestowanie mechanik i zebranie opinii.",
    paths_title: "WYBIERZ SWOJĄ ŚCIEŻKĘ",
    path_adv: "Ścieżka Przygody",
    path_adv_desc: "Ucz się przez zabawę w otwartym świecie. Twórz zdania, aby wchodzić w interakcję z otoczeniem.",
    path_edu: "Ścieżka Edukacyjna",
    path_edu_desc: "Postępuj zgodnie ze scenariuszami przygotowującymi do egzaminów CEFR, JLPT i HSK.",
    modes_title: "TRYBY GRY",
    mode_browser: "Tryb AI Przeglądarki",
    mode_browser_desc: "Działa w 100% lokalnie i prywatnie. Całkowicie za darmo, bez instalacji.",
    mode_cloud: "Tryb Chmury",
    mode_cloud_desc: "Łączy się z zaawansowanymi modelami AI. Wymaga własnego klucza API.",
    future_title: "CO DALEJ?",
    future_desc: "Wkrótce dodamy obsługę czatu głosowego oraz darmową aplikację na komputery!",
    stay_tuned: "Bądź na bieżąco z aktualizacjami na",
    close: "ZAMKNIJ INSTRUKCJĘ"
  },
  [Language.CZECH]: {
    title: "VEŘEJNÁ BETA PENKO",
    welcome: "Vítejte v počáteční veřejné beta verzi Penko! Naším cílem je otestovat mechanismy a shromáždit zpětnou vazbu.",
    paths_title: "VYBERTE SI CESTU",
    path_adv: "Cesta Dobrodružství",
    path_adv_desc: "Učte se hrou v otevřeném světě. Tvořte věty pro interakci s prostředím.",
    path_edu: "Vzdělávací Cesta",
    path_edu_desc: "Sledujte scénáře pro zkoušky CEFR, JLPT a HSK.",
    modes_title: "HERNÍ REŽIMY",
    mode_browser: "Režim UI v prohlížeči",
    mode_browser_desc: "Běží 100% lokálně a soukromě. Zcela zdarma, bez instalace.",
    mode_cloud: "Cloudový Režim",
    mode_cloud_desc: "Připojuje se k pokročilým modelům UI. Vyžaduje vlastní API klíč.",
    future_title: "CO BUDE DÁL?",
    future_desc: "Brzy přidáme podporu hlasového chatu a bezplatnou aplikaci pro PC!",
    stay_tuned: "Sledujte aktualizace na",
    close: "ZAVŘÍT MANUÁL"
  }
};

export const Manual: React.FC<ManualProps> = ({ onClose, nativeLanguage }) => {
  const content = MANUAL_CONTENT[nativeLanguage] || MANUAL_CONTENT[Language.ENGLISH];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-sm animate-fade-in font-pixel">
      <div className="bg-slate-50 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-[8px_8px_0_rgba(0,0,0,0.5)] border-4 border-slate-800 flex flex-col overflow-hidden relative">
        
        <div className="bg-slate-800 p-4 border-b-4 border-slate-700 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <h2 className="text-2xl font-retro text-amber-400 glow-text">{content.title}</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-400 text-white font-retro text-xl border-b-4 border-red-700 active:border-b-0 active:translate-y-1 rounded transition-all"
            aria-label="Close"
          >
            X
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 text-base md:text-lg leading-relaxed overflow-y-auto">
          <section className="bg-amber-100 p-4 border-2 border-amber-300 rounded">
            <p className="text-slate-800 font-bold">{content.welcome}</p>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase border-b-2 border-slate-400 pb-1 text-cyan-600">
              {content.paths_title}
            </h3>
            <div className="space-y-4 text-slate-700">
              <div>
                <h4 className="font-bold text-amber-600">{content.path_adv}</h4>
                <p>{content.path_adv_desc}</p>
              </div>
              <div>
                <h4 className="font-bold text-blue-600">{content.path_edu}</h4>
                <p>{content.path_edu_desc}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase border-b-2 border-slate-400 pb-1 text-cyan-600">
              {content.modes_title}
            </h3>
            <div className="space-y-4 text-slate-700">
              <div>
                <h4 className="font-bold text-emerald-600">{content.mode_browser}</h4>
                <p>{content.mode_browser_desc}</p>
              </div>
              <div>
                <h4 className="font-bold text-purple-600">{content.mode_cloud}</h4>
                <p>{content.mode_cloud_desc}</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-200 p-4 border-2 border-slate-300 rounded">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{content.future_title}</h3>
            <p className="text-slate-700 mb-2">{content.future_desc}</p>
            <p className="text-slate-700 font-bold text-center mt-4">
              {content.stay_tuned} <a href="https://penkosoftware.org" className="text-cyan-600 hover:text-cyan-500 underline">penkosoftware.org</a>
            </p>
          </section>
        </div>

        <div className="p-4 bg-slate-200 border-t-4 border-slate-300 shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-retro text-xl py-4 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all rounded"
          >
            {content.close}
          </button>
        </div>
      </div>
    </div>
  );
};
`
fs.writeFileSync('components/Manual.tsx', manualContent);

let appContent = fs.readFileSync('App.tsx', 'utf-8');

// The user wants to remove the Install button. 
// I'll regex out the install button block in App.tsx
appContent = appContent.replace(/\{\!isInstalled\s*&&\s*\([\s\S]*?⬇\s*\{t\('common:install'\)\}\s*<\/button>\s*\)\}/, '');
fs.writeFileSync('App.tsx', appContent);

