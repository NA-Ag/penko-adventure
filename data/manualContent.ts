
import { Language } from '../types';

const MANUAL_EN = `
🐧 PENKO - PLAYER'S HANDBOOK
============================

1. GAME MODES
-------------
🛡️ STANDARD MODE (Offline)
- Best for: Privacy, Travel, Battery Life.
- Logic: Uses smart templates and dictionaries. No AI.
- Modding: Supports Custom Content from Workshop.

🧠 BROWSER AI (Universal)
- Best for: Smart storytelling on mobile without internet.
- Logic: Downloads a brain (~800MB) to your device.
- Note: First load takes time. Afterward, it is instant.

☁️ CLOUD MODE (Gemini)
- Best for: Infinite vocabulary and grammar explanations.
- Logic: Uses Google's supercomputer via API Key.
- Note: Requires internet.

2. THE CARTRIDGE SYSTEM (SAVES)
-------------------------------
Penko has no server. You own your save files.
- EXPORT: Go to Settings -> "Export Save Cartridge". Keeps this file safe!
- IMPORT: Click "Import Cartridge" on the main screen to move progress between devices.
- IMPORTANT: Your custom Workshop mods are saved inside the cartridge.

3. WORKSHOP
-----------
Create your own world.
- Vocab Editor: Add specific words you want to learn.
- Scenario Editor: Create new biomes (Space, Underwater, etc).
- Share: Submit your creations to GitHub to be included in the official game.

4. INSTALLATION
---------------
- iOS: Tap Share -> "Add to Home Screen".
- Android: Tap the [⬇ INSTALL] button in the header.

Keep learning!
`;

const MANUAL_ES = `
🐧 PENKO - MANUAL DEL JUGADOR
=============================

1. MODOS DE JUEGO
-----------------
🛡️ MODO ESTÁNDAR (Offline)
- Ideal para: Privacidad, Viajes, Ahorro de Batería.
- Lógica: Usa plantillas inteligentes y diccionarios. Sin IA.
- Modding: Soporta Contenido Personalizado del Taller.

🧠 IA DE NAVEGADOR (Universal)
- Ideal para: Narración inteligente en móvil sin internet.
- Lógica: Descarga un cerebro (~800MB) a tu dispositivo.
- Nota: La primera carga toma tiempo. Después es instantáneo.

☁️ MODO CLOUD (Gemini)
- Ideal para: Vocabulario infinito y explicaciones gramaticales.
- Lógica: Usa la supercomputadora de Google vía API Key.
- Nota: Requiere internet.

2. EL SISTEMA DE CARTUCHOS (GUARDADO)
-------------------------------------
Penko no tiene servidor. Tú eres dueño de tus datos.
- EXPORTAR: Ve a Configuración -> "Exportar Cartucho". ¡Guarda este archivo!
- IMPORTAR: Clic en "Importar Cartucho" en la pantalla principal para mover progreso.
- IMPORTANTE: Tus mods personalizados se guardan dentro del cartucho.

3. TALLER (WORKSHOP)
--------------------
Crea tu propio mundo.
- Editor de Vocabulario: Añade palabras específicas que quieras aprender.
- Editor de Escenarios: Crea nuevos biomas (Espacio, Submarino, etc).
- Compartir: Envía tus creaciones a GitHub para ser incluidas en el juego oficial.

4. INSTALACIÓN
--------------
- iOS: Toca Compartir -> "Añadir a Pantalla de Inicio".
- Android: Toca el botón [⬇ INSTALAR] en la cabecera.

¡Sigue aprendiendo!
`;

const MANUAL_FR = `
🐧 PENKO - MANUEL DU JOUEUR
===========================

1. MODES DE JEU
---------------
🛡️ MODE STANDARD (Hors ligne)
- Idéal pour : Confidentialité, Voyage, Batterie.
- Logique : Utilise des modèles intelligents et dictionnaires. Pas d'IA.
- Modding : Supporte le contenu personnalisé de l'Atelier.

🧠 IA NAVIGATEUR (Universel)
- Idéal pour : Narration intelligente sur mobile sans internet.
- Logique : Télécharge un cerveau (~800MB) sur votre appareil.
- Note : Le premier chargement prend du temps. Ensuite, c'est instantané.

☁️ MODE CLOUD (Gemini)
- Idéal pour : Vocabulaire infini et explications grammaticales.
- Logique : Utilise le supercalculateur de Google via une clé API.
- Note : Nécessite internet.

2. LE SYSTÈME DE CARTOUCHE (SAUVEGARDES)
----------------------------------------
Penko n'a pas de serveur. Vous possédez vos sauvegardes.
- EXPORTER : Allez dans Paramètres -> "Exporter Cartouche". Gardez ce fichier !
- IMPORTER : Cliquez sur "Importer Cartouche" sur l'écran principal.
- IMPORTANT : Vos mods personnalisés sont sauvegardés dans la cartouche.

3. ATELIER (WORKSHOP)
---------------------
Créez votre propre monde.
- Éditeur de Vocabulaire : Ajoutez des mots spécifiques.
- Éditeur de Scénarios : Créez de nouveaux biomes.
- Partager : Soumettez vos créations sur GitHub.

4. INSTALLATION
---------------
- iOS : Appuyez sur Partager -> "Sur l'écran d'accueil".
- Android : Appuyez sur le bouton [⬇ INSTALLER].

Bon apprentissage !
`;

const MANUAL_DE = `
🐧 PENKO - SPIELERHANDBUCH
==========================

1. SPIELMODI
------------
🛡️ STANDARDMODUS (Offline)
- Beste für: Datenschutz, Reisen, Akkulaufzeit.
- Logik: Verwendet intelligente Vorlagen. Keine KI.
- Modding: Unterstützt benutzerdefinierte Inhalte.

🧠 BROWSER KI (Universal)
- Beste für: Intelligentes Erzählen auf dem Handy ohne Internet.
- Logik: Lädt ein Gehirn (~800MB) auf dein Gerät.
- Hinweis: Erstes Laden dauert etwas. Danach sofort bereit.

☁️ CLOUD MODUS (Gemini)
- Beste für: Unendliches Vokabular und Grammatik.
- Logik: Verwendet Google via API Key.
- Hinweis: Erfordert Internet.

2. DAS MODUL-SYSTEM (SPEICHERN)
-------------------------------
Penko hat keinen Server. Deine Daten gehören dir.
- EXPORTIEREN: Einstellungen -> "Speichermodul exportieren".
- IMPORTIEREN: Klicke "Modul importieren" auf dem Hauptbildschirm.
- WICHTIG: Deine Mods werden im Modul gespeichert.

3. WERKSTATT (WORKSHOP)
-----------------------
Erschaffe deine eigene Welt.
- Vokabel-Editor: Füge spezifische Wörter hinzu.
- Szenario-Editor: Erstelle neue Biome.
- Teilen: Reiche deine Kreationen auf GitHub ein.

4. INSTALLATION
---------------
- iOS: Teilen -> "Zum Home-Bildschirm".
- Android: Tippe auf [⬇ INSTALLIEREN].

Viel Spaß beim Lernen!
`;

const MANUAL_IT = `
🐧 PENKO - MANUALE DEL GIOCATORE
================================

1. MODALITÀ DI GIOCO
--------------------
🛡️ MODALITÀ STANDARD (Offline)
- Ideale per: Privacy, Viaggi, Batteria.
- Logica: Usa modelli intelligenti. Niente IA.
- Modding: Supporta contenuti personalizzati.

🧠 IA BROWSER (Universale)
- Ideale per: Narrazione intelligente su mobile senza internet.
- Logica: Scarica un cervello (~800MB) sul dispositivo.
- Nota: Il primo caricamento richiede tempo. Poi è istantaneo.

☁️ MODALITÀ CLOUD (Gemini)
- Ideale per: Vocabolario infinito e spiegazioni.
- Logica: Usa Google via Chiave API.
- Nota: Richiede internet.

2. SISTEMA A CARTUCCIA (SALVATAGGI)
-----------------------------------
Penko non ha server. I dati sono tuoi.
- ESPORTA: Impostazioni -> "Esporta Cartuccia".
- IMPORTA: Clicca "Importa Cartuccia" nella schermata principale.
- IMPORTANTE: Le tue mod sono salvate nella cartuccia.

3. LABORATORIO (WORKSHOP)
-------------------------
Crea il tuo mondo.
- Editor Vocaboli: Aggiungi parole specifiche.
- Editor Scenari: Crea nuovi biomi.
- Condividi: Invia le tue creazioni su GitHub.

4. INSTALLAZIONE
----------------
- iOS: Condividi -> "Aggiungi a schermata Home".
- Android: Tocca il pulsante [⬇ INSTALLA].

Buono studio!
`;

const MANUAL_JA = `
🐧 PENKO - プレイヤーハンドブック
================================

1. ゲームモード
---------------
🛡️ 標準モード (オフライン)
- 最適: プライバシー、旅行、バッテリー節約。
- 仕組み: テンプレートと辞書を使用。AIなし。
- 改造: ワークショップのカスタムコンテンツに対応。

🧠 ブラウザAI (ユニバーサル)
- 最適: インターネットなしでのスマートなストーリー。
- 仕組み: AIモデル（約800MB）をデバイスにダウンロード。
- 注意: 初回ロードに時間がかかります。その後は瞬時です。

☁️ クラウドモード (Gemini)
- 最適: 無限の語彙と文法解説。
- 仕組み: APIキーを使用してGoogleのAIを利用。
- 注意: インターネットが必要です。

2. カートリッジシステム (セーブ)
--------------------------------
Penkoにサーバーはありません。データはあなたのものです。
- エクスポート: 設定 -> 「セーブカートリッジをエクスポート」。
- インポート: メイン画面の「カートリッジをインポート」。
- 重要: 作成したModもカートリッジ内に保存されます。

3. ワークショップ
-----------------
自分だけの世界を作ろう。
- 単語エディタ: 学びたい単語を追加。
- シナリオエディタ: 新しいバイオームを作成。
- 共有: GitHubに送信して公式ゲームに追加。

4. インストール
---------------
- iOS: 共有 -> 「ホーム画面に追加」。
- Android: ヘッダーの [⬇ インストール] ボタン。

学習を続けましょう！
`;

const MANUAL_ZH = `
🐧 PENKO - 玩家手册
===================

1. 游戏模式
-----------
🛡️ 标准模式 (离线)
- 适合：隐私、旅行、省电。
- 逻辑：使用智能模板和词典。无AI。
- Mod：支持工坊自定义内容。

🧠 浏览器 AI (通用)
- 适合：无需网络的移动端智能故事。
- 逻辑：下载大脑 (~800MB) 到您的设备。
- 注意：首次加载需要时间。之后即开即用。

☁️ 云端模式 (Gemini)
- 适合：无限词汇和语法解释。
- 逻辑：通过API Key使用Google超级计算机。
- 注意：需要联网。

2. 卡带系统 (存档)
------------------
Penko没有服务器。您拥有存档文件。
- 导出：设置 -> "导出存档卡带"。保存好此文件！
- 导入：点击主屏幕上的 "导入卡带"。
- 重要：您的自定义Mod保存在卡带内。

3. 工坊 (WORKSHOP)
------------------
创造你自己的世界。
- 词汇编辑器：添加您想学习的单词。
- 剧本编辑器：创建新的生物群落。
- 分享：提交到GitHub以包含在官方游戏中。

4. 安装
-------
- iOS：点击分享 -> "添加到主屏幕"。
- Android：点击顶部的 [⬇ 安装] 按钮。

快乐学习！
`;

const MANUAL_RU = `
🐧 PENKO - РУКОВОДСТВО ИГРОКА
=============================

1. РЕЖИМЫ ИГРЫ
--------------
🛡️ СТАНДАРТНЫЙ РЕЖИМ (Офлайн)
- Идеально для: Приватности, Поездок, Батареи.
- Логика: Шаблоны и словари. Без ИИ.
- Моды: Поддержка контента из Мастерской.

🧠 БРАУЗЕРНЫЙ ИИ (Универсальный)
- Идеально для: Умных историй без интернета.
- Логика: Скачивает модель (~800MB) на устройство.
- Прим.: Первая загрузка долгая. Потом мгновенно.

☁️ ОБЛАЧНЫЙ РЕЖИМ (Gemini)
- Идеально для: Бесконечного словаря и объяснений.
- Логика: Использует Google через API Key.
- Прим.: Нужен интернет.

2. СИСТЕМА КАРТРИДЖЕЙ (СОХРАНЕНИЯ)
----------------------------------
У Penko нет сервера. Файлы принадлежат вам.
- ЭКСПОРТ: Настройки -> "Экспорт Картриджа".
- ИМПОРТ: Нажмите "Импорт Картриджа" на главном экране.
- ВАЖНО: Ваши моды сохраняются внутри картриджа.

3. МАСТЕРСКАЯ
-------------
Создайте свой мир.
- Редактор Слов: Добавляйте нужные слова.
- Редактор Сценариев: Создавайте новые биомы.
- Поделиться: Отправьте на GitHub.

4. УСТАНОВКА
------------
- iOS: Поделиться -> "На экран «Домой»".
- Android: Нажмите кнопку [⬇ УСТАНОВИТЬ].

Учитесь с удовольствием!
`;

const MANUAL_PT = `
🐧 PENKO - MANUAL DO JOGADOR
============================

1. MODOS DE JOGO
----------------
🛡️ MODO PADRÃO (Offline)
- Melhor para: Privacidade, Viagens, Bateria.
- Lógica: Usa modelos inteligentes. Sem IA.
- Mods: Suporta conteúdo da Oficina.

🧠 IA DE NAVEGADOR (Universal)
- Melhor para: Histórias inteligentes no celular sem internet.
- Lógica: Baixa um cérebro (~800MB) para o dispositivo.
- Nota: O primeiro carregamento demora. Depois é instantâneo.

☁️ MODO NUVEM (Gemini)
- Melhor para: Vocabulário infinito.
- Lógica: Usa Google via Chave API.
- Nota: Requer internet.

2. SISTEMA DE CARTUCHO (SALVAMENTO)
-----------------------------------
Penko não tem servidor. Você é dono dos dados.
- EXPORTAR: Configurações -> "Exportar Cartucho".
- IMPORTAR: Clique em "Importar Cartucho" na tela inicial.
- IMPORTANTE: Seus mods ficam salvos no cartucho.

3. OFICINA (WORKSHOP)
---------------------
Crie seu mundo.
- Editor de Vocabulário: Adicione palavras.
- Editor de Cenários: Crie novos biomas.
- Compartilhar: Envie para o GitHub.

4. INSTALAÇÃO
-------------
- iOS: Compartilhar -> "Adicionar à Tela de Início".
- Android: Botão [⬇ INSTALAR] no cabeçalho.

Continue aprendendo!
`;

const MANUAL_UK = `
🐧 PENKO - ПОСІБНИК ГРАВЦЯ
==========================

1. РЕЖИМИ ГРИ
-------------
🛡️ СТАНДАРТНИЙ РЕЖИМ (Офлайн)
- Для: Приватності, Подорожей, Батареї.
- Логіка: Шаблони та словники. Без ШІ.
- Моди: Підтримка контенту з Майстерні.

🧠 БРАУЗЕРНИЙ ШІ (Універсальний)
- Для: Розумних історій без інтернету.
- Логіка: Завантажує модель (~800MB) на пристрій.
- Прим.: Перше завантаження довге. Потім миттєво.

☁️ ХМАРНИЙ РЕЖИМ (Gemini)
- Для: Нескінченного словника.
- Логіка: Використовує Google через API Key.
- Прим.: Потрібен інтернет.

2. СИСТЕМА КАРТРИДЖІВ (ЗБЕРЕЖЕННЯ)
----------------------------------
У Penko немає сервера. Файли ваші.
- ЕКСПОРТ: Налаштування -> "Експорт Картриджа".
- ІМПОРТ: Натисніть "Імпорт Картриджа" на головному екрані.
- ВАЖЛИВО: Ваші моди зберігаються в картриджі.

3. МАЙСТЕРНЯ
------------
Створіть свій світ.
- Редактор Слів: Додавайте слова.
- Редактор Сценаріїв: Створюйте біоми.
- Поділитися: Надішліть на GitHub.

4. ВСТАНОВЛЕННЯ
---------------
- iOS: Поділитися -> "На початковий екран".
- Android: Кнопка [⬇ ВСТАНОВИТИ].

Вчіться з задоволенням!
`;

const MANUAL_PL = `
🐧 PENKO - PODRĘCZNIK GRACZA
============================

1. TRYBY GRY
------------
🛡️ TRYB STANDARDOWY (Offline)
- Najlepszy dla: Prywatności, Podróży, Baterii.
- Logika: Używa szablonów i słowników. Bez AI.
- Mody: Obsługuje zawartość z Warsztatu.

🧠 AI PRZEGLĄDARKI (Uniwersalne)
- Najlepsze dla: Inteligentnych historii bez internetu.
- Logika: Pobiera model (~800MB) na urządzenie.
- Uwaga: Pierwsze ładowanie trwa chwilę.

☁️ TRYB CHMURY (Gemini)
- Najlepsze dla: Nieskończonego słownictwa.
- Logika: Używa Google przez Klucz API.
- Uwaga: Wymaga internetu.

2. SYSTEM KARTRIDŻY (ZAPISY)
----------------------------
Penko nie ma serwera. Dane należą do ciebie.
- EKSPORT: Ustawienia -> "Eksportuj Kartridż".
- IMPORT: Kliknij "Importuj Kartridż" na ekranie głównym.
- WAŻNE: Twoje mody są zapisywane w kartridżu.

3. WARSZTAT (WORKSHOP)
----------------------
Stwórz swój świat.
- Edytor Słownictwa: Dodaj słowa.
- Edytor Scenariuszy: Twórz biomy.
- Udostępnij: Wyślij na GitHub.

4. INSTALACJA
-------------
- iOS: Udostępnij -> "Do ekranu początkowego".
- Android: Przycisk [⬇ INSTALUJ].

Owocnej nauki!
`;

const MANUAL_CS = `
🐧 PENKO - PŘÍRUČKA HRÁČE
=========================

1. HERNÍ REŽIMY
---------------
🛡️ STANDARDNÍ REŽIM (Offline)
- Ideální pro: Soukromí, Cestování, Baterii.
- Logika: Používá šablony a slovníky. Žádná AI.
- Mody: Podporuje obsah z Dílny.

🧠 PROHLÍŽEČOVÁ AI (Univerzální)
- Ideální pro: Chytré příběhy na mobilu bez internetu.
- Logika: Stáhne mozek (~800MB) do zařízení.
- Poznámka: První načtení trvá déle.

☁️ CLOUD REŽIM (Gemini)
- Ideální pro: Nekonečnou slovní zásobu.
- Logika: Používá Google přes API Key.
- Poznámka: Vyžaduje internet.

2. SYSTÉM CARTRIDGE (UKLÁDÁNÍ)
------------------------------
Penko nemá server. Data jsou vaše.
- EXPORT: Nastavení -> "Exportovat Cartridge".
- IMPORT: Klikněte na "Importovat Cartridge" na hlavní obrazovce.
- DŮLEŽITÉ: Vaše mody se ukládají do cartridge.

3. DÍLNA (WORKSHOP)
-------------------
Vytvořte svůj svět.
- Editor Slovíček: Přidejte slova.
- Editor Scénářů: Vytvořte biomy.
- Sdílet: Odešlete na GitHub.

4. INSTALACE
------------
- iOS: Sdílet -> "Na plochu".
- Android: Tlačítko [⬇ INSTALOVAT].

Učte se s radostí!
`;

export const MANUALS: Record<Language, string> = {
    [Language.ENGLISH]: MANUAL_EN,
    [Language.SPANISH]: MANUAL_ES,
    [Language.FRENCH]: MANUAL_FR,
    [Language.GERMAN]: MANUAL_DE,
    [Language.ITALIAN]: MANUAL_IT,
    [Language.JAPANESE]: MANUAL_JA,
    [Language.MANDARIN]: MANUAL_ZH,
    [Language.RUSSIAN]: MANUAL_RU,
    [Language.PORTUGUESE]: MANUAL_PT,
    [Language.UKRAINIAN]: MANUAL_UK,
    [Language.POLISH]: MANUAL_PL,
    [Language.CZECH]: MANUAL_CS
};
