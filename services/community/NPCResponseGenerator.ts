/**
 * NPCResponseGenerator - TIER 20 Façade-style NPC Responses
 *
 * Generates dynamic NPC responses based on discourse acts, creating the feeling
 * of natural conversation like in Façade (2005).
 *
 * Architecture:
 * - Takes DiscourseAnalysis as input
 * - Selects response based on discourse act type
 * - Considers sentiment and intensity
 * - Multilingual support
 * - No AI required - template-based like Façade
 *
 * Example Interactions:
 * Player: "Hello wizard!" → GREETING → NPC: "Greetings, traveler!"
 * Player: "You're amazing!" → COMPLIMENT (positive, 0.9) → NPC: "You flatter me!"
 * Player: "Why did you do that?" → QUESTION_WHY → NPC: "I had my reasons..."
 */

import { Language } from '../../types';
import { DiscourseAct, DiscourseAnalysis } from './DiscourseActRecognizer';
import type { ConversationTurn, TopicChangeAnalysis, RepetitionAnalysis } from './NPCConversationMemory';

export interface NPCResponseContext {
  npcId: string;
  npcName: string;
  discourse: DiscourseAnalysis;
  language: Language;
  playerInput: string;

  // Optional context for richer responses
  relationshipLevel?: number;  // -1.0 to 1.0 (from relationship manager)
  npcMood?: 'happy' | 'neutral' | 'angry' | 'sad' | 'scared';
  conversationHistory?: ConversationTurn[];  // Recent conversation turns

  // Environmental context
  timeOfDay?: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'midnight';
  locationType?: 'peaceful' | 'formal' | 'casual' | 'dangerous' | 'mysterious' | 'festive';
  shouldWhisper?: boolean;
  crowdIntensityModifier?: number;
  greetingType?: 'first_meeting' | 'just_saw' | 'long_time' | 'normal';

  // Conversation memory context
  topicChange?: TopicChangeAnalysis;
  repetition?: RepetitionAnalysis;

  // Reputation/gossip context
  reputationModifier?: number;
  reputationReason?: string;
}

/**
 * Response template with multilingual variants
 */
interface DiscourseResponseTemplate {
  discourseAct: DiscourseAct;

  // Sentiment-specific variants
  responses: {
    positive?: Record<Language, string[]>;
    negative?: Record<Language, string[]>;
    neutral?: Record<Language, string[]>;
  };

  // Default fallback (if sentiment doesn't match)
  fallback: Record<Language, string[]>;
}

export class NPCResponseGenerator {
  private templates: Map<DiscourseAct, DiscourseResponseTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  /**
   * Generate NPC response based on discourse analysis
   */
  generateResponse(context: NPCResponseContext): string {
    const { discourse, language, npcName } = context;

    // Get template for this discourse act
    const template = this.templates.get(discourse.primary);

    if (!template) {
      // Fallback for unmapped discourse acts
      return this.getGenericResponse(discourse, language, npcName);
    }

    // Select response variants based on sentiment
    let variants: Record<Language, string[]> | undefined;

    if (template.responses[discourse.sentiment]) {
      variants = template.responses[discourse.sentiment];
    } else {
      variants = template.fallback;
    }

    // Get language-specific variants
    const languageVariants = variants[language] || variants[Language.ENGLISH];

    if (!languageVariants || languageVariants.length === 0) {
      return this.getGenericResponse(discourse, language, npcName);
    }

    // TIER 20: Adjust intensity based on relationship level
    let adjustedIntensity = discourse.intensity;

    if (context.relationshipLevel !== undefined) {
      // Positive relationship = warmer responses (higher intensity)
      // Negative relationship = colder responses (lower intensity)
      if (discourse.sentiment === 'positive') {
        // Amplify positive responses when relationship is good
        adjustedIntensity = Math.min(1.0, discourse.intensity + (context.relationshipLevel * 0.3));
      } else if (discourse.sentiment === 'negative') {
        // Amplify negative responses when relationship is bad
        adjustedIntensity = Math.min(1.0, discourse.intensity + (Math.abs(context.relationshipLevel) * 0.3));
      }
    }

    // TIER 20: Further adjust intensity based on NPC mood
    if (context.npcMood) {
      // Happy NPCs amplify positive discourse
      if (context.npcMood === 'happy' && discourse.sentiment === 'positive') {
        adjustedIntensity = Math.min(1.0, adjustedIntensity + 0.2);
      }
      // Angry NPCs amplify negative discourse
      else if (context.npcMood === 'angry' && discourse.sentiment === 'negative') {
        adjustedIntensity = Math.min(1.0, adjustedIntensity + 0.3);
      }
      // Sad NPCs dampen positive discourse (they're not in the mood)
      else if (context.npcMood === 'sad' && discourse.sentiment === 'positive') {
        adjustedIntensity = Math.max(0, adjustedIntensity - 0.15);
      }
      // Scared NPCs amplify negative discourse (they're already anxious)
      else if (context.npcMood === 'scared' && discourse.sentiment === 'negative') {
        adjustedIntensity = Math.min(1.0, adjustedIntensity + 0.25);
      }
    }

    // TIER 20: Apply crowd intensity modifier
    if (context.crowdIntensityModifier !== undefined) {
      adjustedIntensity = Math.max(0, Math.min(1.0, adjustedIntensity + context.crowdIntensityModifier));
    }

    // Select variant based on adjusted intensity
    const index = Math.min(
      Math.floor(adjustedIntensity * languageVariants.length),
      languageVariants.length - 1
    );

    let response = languageVariants[index];

    // TIER 20: Apply whisper prefix if needed
    if (context.shouldWhisper) {
      response = '*whispers* ' + response;
    }

    // TIER 20: Handle repetition (player saying similar things repeatedly)
    if (context.repetition?.isRepetitive) {
      response = this.handleRepetition(context.repetition, language);
    }
    // TIER 20: Handle topic changes
    else if (context.topicChange?.isTopicChange) {
      response = this.handleTopicChange(context.topicChange, response, language);
    }
    // TIER 20: Apply reputation-based greeting prefix (first time meeting with reputation)
    else if (discourse.primary === 'GREETING' && context.reputationModifier && Math.abs(context.reputationModifier) > 0.1) {
      response = this.applyReputationGreeting(response, context.reputationModifier, context.reputationReason || '', language);
    }
    // TIER 20: Handle special greeting types
    else if (discourse.primary === 'GREETING' && context.greetingType) {
      response = this.applyGreetingModifier(response, context.greetingType, language);
    }

    // Substitute placeholders
    response = response.replace('{npc}', npcName);
    response = response.replace('{player}', 'traveler'); // Could be personalized

    return response;
  }

  /**
   * Apply greeting modifier based on time since last seen
   */
  private applyGreetingModifier(
    baseResponse: string,
    greetingType: 'first_meeting' | 'just_saw' | 'long_time' | 'normal',
    language: Language
  ): string {
    if (greetingType === 'first_meeting') {
      const prefixes: Record<Language, string> = {
        [Language.ENGLISH]: "Nice to meet you! ",
        [Language.SPANISH]: "¡Encantado de conocerte! ",
        [Language.FRENCH]: "Ravi de vous rencontrer! ",
        [Language.GERMAN]: "Schön, dich kennenzulernen! ",
        [Language.ITALIAN]: "Piacere di conoscerti! ",
        [Language.JAPANESE]: "はじめまして！ ",
        [Language.MANDARIN]: "很高兴认识你！ ",
        [Language.RUSSIAN]: "Приятно познакомиться! ",
        [Language.PORTUGUESE]: "Prazer em conhecê-lo! ",
        [Language.UKRAINIAN]: "Приємно познайомитись! ",
        [Language.POLISH]: "Miło cię poznać! ",
        [Language.CZECH]: "Těší mě! ",
      };
      return prefixes[language] + baseResponse;
    }

    if (greetingType === 'just_saw') {
      const replacements: Record<Language, string> = {
        [Language.ENGLISH]: "Didn't we just talk?",
        [Language.SPANISH]: "¿No acabamos de hablar?",
        [Language.FRENCH]: "On ne vient pas de parler?",
        [Language.GERMAN]: "Haben wir nicht gerade gesprochen?",
        [Language.ITALIAN]: "Non abbiamo appena parlato?",
        [Language.JAPANESE]: "さっき話したばかりでは？",
        [Language.MANDARIN]: "我们不是刚说过话吗？",
        [Language.RUSSIAN]: "Мы же только что говорили?",
        [Language.PORTUGUESE]: "Não acabamos de falar?",
        [Language.UKRAINIAN]: "Ми ж щойно розмовляли?",
        [Language.POLISH]: "Czy nie rozmawialiśmy właśnie?",
        [Language.CZECH]: "Nemluvili jsme právě?",
      };
      return replacements[language];
    }

    if (greetingType === 'long_time') {
      const prefixes: Record<Language, string> = {
        [Language.ENGLISH]: "It's been a while! ",
        [Language.SPANISH]: "¡Ha pasado tiempo! ",
        [Language.FRENCH]: "Ça fait longtemps! ",
        [Language.GERMAN]: "Lange nicht gesehen! ",
        [Language.ITALIAN]: "È passato un po'! ",
        [Language.JAPANESE]: "久しぶり！ ",
        [Language.MANDARIN]: "好久不见！ ",
        [Language.RUSSIAN]: "Давно не виделись! ",
        [Language.PORTUGUESE]: "Faz tempo! ",
        [Language.UKRAINIAN]: "Давно не бачилися! ",
        [Language.POLISH]: "Dawno się nie widzieliśmy! ",
        [Language.CZECH]: "Dlouho jsme se neviděli! ",
      };
      return prefixes[language] + baseResponse;
    }

    return baseResponse;  // normal
  }

  /**
   * Handle repetitive player input
   */
  private handleRepetition(repetition: RepetitionAnalysis, language: Language): string {
    const responses: Record<Language, string[]> = {
      [Language.ENGLISH]: [
        "We've talked about this already...",
        "Didn't we just discuss this?",
        "You're repeating yourself.",
        "I already answered that.",
      ],
      [Language.SPANISH]: [
        "Ya hablamos de esto...",
        "¿No acabamos de discutir esto?",
        "Te estás repitiendo.",
        "Ya respondí eso.",
      ],
      [Language.FRENCH]: [
        "On a déjà parlé de ça...",
        "N'avons-nous pas déjà discuté de cela?",
        "Vous vous répétez.",
        "J'ai déjà répondu à ça.",
      ],
      [Language.GERMAN]: [
        "Darüber haben wir schon gesprochen...",
        "Haben wir das nicht gerade besprochen?",
        "Du wiederholst dich.",
        "Das habe ich schon beantwortet.",
      ],
      [Language.ITALIAN]: [
        "Ne abbiamo già parlato...",
        "Non ne abbiamo appena discusso?",
        "Ti stai ripetendo.",
        "Ho già risposto a quello.",
      ],
      [Language.JAPANESE]: [
        "それはもう話しました...",
        "それについて話したばかりでは?",
        "同じことを繰り返していますね。",
        "それにはもう答えました。",
      ],
      [Language.MANDARIN]: [
        "我们已经谈过这个了...",
        "我们不是刚讨论过吗?",
        "你在重复自己。",
        "我已经回答过了。",
      ],
      [Language.RUSSIAN]: [
        "Мы уже говорили об этом...",
        "Мы не только что обсуждали это?",
        "Вы повторяетесь.",
        "Я уже ответил на это.",
      ],
      [Language.PORTUGUESE]: [
        "Já falamos sobre isso...",
        "Não acabamos de discutir isso?",
        "Você está se repetindo.",
        "Eu já respondi isso.",
      ],
      [Language.UKRAINIAN]: [
        "Ми вже говорили про це...",
        "Ми щойно не обговорювали це?",
        "Ви повторюєтесь.",
        "Я вже відповів на це.",
      ],
      [Language.POLISH]: [
        "Już o tym rozmawialiśmy...",
        "Czy właśnie o tym nie rozmawialiśmy?",
        "Powtarzasz się.",
        "Już na to odpowiedziałem.",
      ],
      [Language.CZECH]: [
        "O tom jsme už mluvili...",
        "Nemluvili jsme o tom právě?",
        "Opakujete se.",
        "Už jsem na to odpověděl.",
      ],
    };

    // Select response based on repetition count
    const variants = responses[language];
    const index = Math.min(repetition.repetitionCount - 1, variants.length - 1);
    return variants[index];
  }

  /**
   * Handle topic changes in conversation
   */
  private handleTopicChange(
    topicChange: TopicChangeAnalysis,
    baseResponse: string,
    language: Language
  ): string {
    // For abrupt topic changes, acknowledge the shift
    if (topicChange.changeType === 'abrupt') {
      const acknowledgments: Record<Language, string> = {
        [Language.ENGLISH]: "Wait, changing topic? ",
        [Language.SPANISH]: "Espera, ¿cambiando de tema? ",
        [Language.FRENCH]: "Attendez, changement de sujet? ",
        [Language.GERMAN]: "Warte, Themenwechsel? ",
        [Language.ITALIAN]: "Aspetta, cambiamo argomento? ",
        [Language.JAPANESE]: "待って、話題を変える? ",
        [Language.MANDARIN]: "等等，换话题？ ",
        [Language.RUSSIAN]: "Подожди, меняем тему? ",
        [Language.PORTUGUESE]: "Espera, mudando de assunto? ",
        [Language.UKRAINIAN]: "Зачекай, міняємо тему? ",
        [Language.POLISH]: "Czekaj, zmieniamy temat? ",
        [Language.CZECH]: "Počkej, měníme téma? ",
      };
      return acknowledgments[language] + baseResponse;
    }

    // For callbacks to earlier topics, reference the return
    if (topicChange.changeType === 'callback') {
      const callbacks: Record<Language, string> = {
        [Language.ENGLISH]: "Ah, back to that topic. ",
        [Language.SPANISH]: "Ah, de vuelta a ese tema. ",
        [Language.FRENCH]: "Ah, retour à ce sujet. ",
        [Language.GERMAN]: "Ah, zurück zu diesem Thema. ",
        [Language.ITALIAN]: "Ah, torniamo a quell'argomento. ",
        [Language.JAPANESE]: "ああ、その話題に戻るのね。 ",
        [Language.MANDARIN]: "啊，回到那个话题。 ",
        [Language.RUSSIAN]: "Ах, возвращаемся к той теме. ",
        [Language.PORTUGUESE]: "Ah, de volta àquele assunto. ",
        [Language.UKRAINIAN]: "Ах, повертаємось до тієї теми. ",
        [Language.POLISH]: "Ah, wracamy do tamtego tematu. ",
        [Language.CZECH]: "Ach, zpět k tomu tématu. ",
      };
      return callbacks[language] + baseResponse;
    }

    // Smooth topic changes don't need special acknowledgment
    return baseResponse;
  }

  /**
   * Apply reputation-based greeting for first impressions
   */
  private applyReputationGreeting(
    baseResponse: string,
    reputationModifier: number,
    reputationReason: string,
    language: Language
  ): string {
    // Positive reputation (hero/accepted)
    if (reputationModifier > 0.2) {
      const prefixes: Record<Language, string> = {
        [Language.ENGLISH]: "I've heard good things about you! ",
        [Language.SPANISH]: "¡He oído cosas buenas sobre ti! ",
        [Language.FRENCH]: "J'ai entendu de bonnes choses sur vous! ",
        [Language.GERMAN]: "Ich habe Gutes über dich gehört! ",
        [Language.ITALIAN]: "Ho sentito cose belle su di te! ",
        [Language.JAPANESE]: "あなたの良い噂を聞いています！ ",
        [Language.MANDARIN]: "我听说过你的好事！ ",
        [Language.RUSSIAN]: "Я слышал хорошее о вас! ",
        [Language.PORTUGUESE]: "Ouvi coisas boas sobre você! ",
        [Language.UKRAINIAN]: "Я чув хороше про вас! ",
        [Language.POLISH]: "Słyszałem o tobie dobre rzeczy! ",
        [Language.CZECH]: "Slyšel jsem o vás dobré věci! ",
      };
      return prefixes[language] + baseResponse;
    }

    // Slightly positive reputation
    else if (reputationModifier > 0.1) {
      const prefixes: Record<Language, string> = {
        [Language.ENGLISH]: "Your reputation precedes you. ",
        [Language.SPANISH]: "Tu reputación te precede. ",
        [Language.FRENCH]: "Votre réputation vous précède. ",
        [Language.GERMAN]: "Dein Ruf eilt dir voraus. ",
        [Language.ITALIAN]: "La tua reputazione ti precede. ",
        [Language.JAPANESE]: "あなたの評判は先に聞いています。 ",
        [Language.MANDARIN]: "你的名声在前。 ",
        [Language.RUSSIAN]: "Ваша репутация вас опережает. ",
        [Language.PORTUGUESE]: "Sua reputação o precede. ",
        [Language.UKRAINIAN]: "Ваша репутація вас випереджає. ",
        [Language.POLISH]: "Twoja reputacja cię wyprzedza. ",
        [Language.CZECH]: "Vaše pověst vás předchází. ",
      };
      return prefixes[language] + baseResponse;
    }

    // Negative reputation (shunned/vilified)
    else if (reputationModifier < -0.2) {
      const prefixes: Record<Language, string> = {
        [Language.ENGLISH]: "I've heard terrible things about you. ",
        [Language.SPANISH]: "He oído cosas terribles sobre ti. ",
        [Language.FRENCH]: "J'ai entendu des choses terribles sur vous. ",
        [Language.GERMAN]: "Ich habe Schreckliches über dich gehört. ",
        [Language.ITALIAN]: "Ho sentito cose terribili su di te. ",
        [Language.JAPANESE]: "あなたの悪い噂を聞いています。 ",
        [Language.MANDARIN]: "我听说过你的坏事。 ",
        [Language.RUSSIAN]: "Я слышал ужасное о вас. ",
        [Language.PORTUGUESE]: "Ouvi coisas terríveis sobre você. ",
        [Language.UKRAINIAN]: "Я чув жахливе про вас. ",
        [Language.POLISH]: "Słyszałem okropne rzeczy o tobie. ",
        [Language.CZECH]: "Slyšel jsem hrozné věci o vás. ",
      };
      return prefixes[language] + baseResponse;
    }

    // Slightly negative reputation
    else if (reputationModifier < -0.1) {
      const prefixes: Record<Language, string> = {
        [Language.ENGLISH]: "I've heard some concerning things... ",
        [Language.SPANISH]: "He oído algunas cosas preocupantes... ",
        [Language.FRENCH]: "J'ai entendu des choses inquiétantes... ",
        [Language.GERMAN]: "Ich habe besorgniserregende Dinge gehört... ",
        [Language.ITALIAN]: "Ho sentito cose preoccupanti... ",
        [Language.JAPANESE]: "心配なことを聞いています... ",
        [Language.MANDARIN]: "我听说了一些令人担忧的事... ",
        [Language.RUSSIAN]: "Я слышал тревожные вещи... ",
        [Language.PORTUGUESE]: "Ouvi algumas coisas preocupantes... ",
        [Language.UKRAINIAN]: "Я чув деякі тривожні речі... ",
        [Language.POLISH]: "Słyszałem niepokojące rzeczy... ",
        [Language.CZECH]: "Slyšel jsem znepokojující věci... ",
      };
      return prefixes[language] + baseResponse;
    }

    return baseResponse;
  }

  /**
   * Generic fallback response when no template matches
   */
  private getGenericResponse(
    discourse: DiscourseAnalysis,
    language: Language,
    npcName: string
  ): string {
    const generic: Record<Language, string> = {
      [Language.ENGLISH]: `${npcName} acknowledges your words.`,
      [Language.SPANISH]: `${npcName} reconoce tus palabras.`,
      [Language.FRENCH]: `${npcName} reconnaît vos paroles.`,
      [Language.GERMAN]: `${npcName} nimmt deine Worte zur Kenntnis.`,
      [Language.ITALIAN]: `${npcName} riconosce le tue parole.`,
      [Language.JAPANESE]: `${npcName}はあなたの言葉を認めます。`,
      [Language.MANDARIN]: `${npcName}承认你的话。`,
      [Language.RUSSIAN]: `${npcName} признаёт ваши слова.`,
      [Language.PORTUGUESE]: `${npcName} reconhece suas palavras.`,
      [Language.UKRAINIAN]: `${npcName} визнає ваші слова.`,
      [Language.POLISH]: `${npcName} przyjmuje twoje słowa do wiadomości.`,
      [Language.CZECH]: `${npcName} bere na vědomí vaše slova.`,
    };

    return generic[language] || generic[Language.ENGLISH];
  }

  /**
   * Register default discourse response templates
   */
  private registerDefaultTemplates(): void {
    // ===== GREETINGS =====
    this.templates.set('GREETING', {
      discourseAct: 'GREETING',
      responses: {
        positive: {
          [Language.ENGLISH]: ['Hello there!', 'Greetings, friend!', 'Welcome!'],
          [Language.SPANISH]: ['¡Hola!', '¡Saludos, amigo!', '¡Bienvenido!'],
          [Language.FRENCH]: ['Bonjour!', 'Salutations, ami!', 'Bienvenue!'],
          [Language.GERMAN]: ['Hallo!', 'Grüße, Freund!', 'Willkommen!'],
          [Language.ITALIAN]: ['Ciao!', 'Saluti, amico!', 'Benvenuto!'],
          [Language.JAPANESE]: ['こんにちは！', 'ようこそ、友よ！', 'いらっしゃい！'],
          [Language.MANDARIN]: ['你好！', '欢迎，朋友！', '欢迎！'],
          [Language.RUSSIAN]: ['Здравствуйте!', 'Приветствую, друг!', 'Добро пожаловать!'],
          [Language.PORTUGUESE]: ['Olá!', 'Saudações, amigo!', 'Bem-vindo!'],
          [Language.UKRAINIAN]: ['Привіт!', 'Вітаю, друже!', 'Ласкаво просимо!'],
          [Language.POLISH]: ['Cześć!', 'Pozdrawiam, przyjacielu!', 'Witaj!'],
          [Language.CZECH]: ['Ahoj!', 'Pozdrav, příteli!', 'Vítej!'],
        },
        neutral: {
          [Language.ENGLISH]: ['Hello.', 'Greetings.', 'Yes?'],
          [Language.SPANISH]: ['Hola.', 'Saludos.', '¿Sí?'],
          [Language.FRENCH]: ['Bonjour.', 'Salutations.', 'Oui?'],
          [Language.GERMAN]: ['Hallo.', 'Grüße.', 'Ja?'],
          [Language.ITALIAN]: ['Ciao.', 'Saluti.', 'Sì?'],
          [Language.JAPANESE]: ['こんにちは。', '挨拶します。', 'はい？'],
          [Language.MANDARIN]: ['你好。', '问候。', '是？'],
          [Language.RUSSIAN]: ['Здравствуйте.', 'Приветствую.', 'Да?'],
          [Language.PORTUGUESE]: ['Olá.', 'Saudações.', 'Sim?'],
          [Language.UKRAINIAN]: ['Привіт.', 'Вітання.', 'Так?'],
          [Language.POLISH]: ['Cześć.', 'Pozdrowienia.', 'Tak?'],
          [Language.CZECH]: ['Ahoj.', 'Pozdravy.', 'Ano?'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['Hello.', 'Greetings.'],
        [Language.SPANISH]: ['Hola.', 'Saludos.'],
        [Language.FRENCH]: ['Bonjour.', 'Salutations.'],
        [Language.GERMAN]: ['Hallo.', 'Grüße.'],
        [Language.ITALIAN]: ['Ciao.', 'Saluti.'],
        [Language.JAPANESE]: ['こんにちは。', '挨拶します。'],
        [Language.MANDARIN]: ['你好。', '问候。'],
        [Language.RUSSIAN]: ['Здравствуйте.', 'Приветствую.'],
        [Language.PORTUGUESE]: ['Olá.', 'Saudações.'],
        [Language.UKRAINIAN]: ['Привіт.', 'Вітання.'],
        [Language.POLISH]: ['Cześć.', 'Pozdrowienia.'],
        [Language.CZECH]: ['Ahoj.', 'Pozdravy.'],
      },
    });

    // ===== FAREWELLS =====
    this.templates.set('FAREWELL', {
      discourseAct: 'FAREWELL',
      responses: {
        positive: {
          [Language.ENGLISH]: ['Farewell, friend!', 'Safe travels!', 'Until we meet again!'],
          [Language.SPANISH]: ['¡Adiós, amigo!', '¡Viajes seguros!', '¡Hasta que nos volvamos a ver!'],
          [Language.FRENCH]: ['Au revoir, ami!', 'Bon voyage!', 'À la prochaine!'],
          [Language.GERMAN]: ['Auf Wiedersehen, Freund!', 'Gute Reise!', 'Bis wir uns wiedersehen!'],
          [Language.ITALIAN]: ['Addio, amico!', 'Buon viaggio!', 'Arrivederci!'],
          [Language.JAPANESE]: ['さようなら、友よ！', '旅の安全を！', 'また会おう！'],
          [Language.MANDARIN]: ['再见，朋友！', '旅途平安！', '直到我们再次见面！'],
          [Language.RUSSIAN]: ['До свидания, друг!', 'Счастливого пути!', 'До встречи!'],
          [Language.PORTUGUESE]: ['Adeus, amigo!', 'Boa viagem!', 'Até nos encontrarmos novamente!'],
          [Language.UKRAINIAN]: ['До побачення, друже!', 'Щасливої дороги!', 'До зустрічі!'],
          [Language.POLISH]: ['Żegnaj, przyjacielu!', 'Bezpiecznej podróży!', 'Do zobaczenia!'],
          [Language.CZECH]: ['Sbohem, příteli!', 'Šťastnou cestu!', 'Na shledanou!'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['Goodbye.', 'Farewell.'],
        [Language.SPANISH]: ['Adiós.', 'Hasta luego.'],
        [Language.FRENCH]: ['Au revoir.', 'Adieu.'],
        [Language.GERMAN]: ['Auf Wiedersehen.', 'Tschüss.'],
        [Language.ITALIAN]: ['Addio.', 'Ciao.'],
        [Language.JAPANESE]: ['さようなら。', 'じゃあね。'],
        [Language.MANDARIN]: ['再见。', '拜拜。'],
        [Language.RUSSIAN]: ['До свидания.', 'Пока.'],
        [Language.PORTUGUESE]: ['Adeus.', 'Tchau.'],
        [Language.UKRAINIAN]: ['До побачення.', 'Бувай.'],
        [Language.POLISH]: ['Do widzenia.', 'Cześć.'],
        [Language.CZECH]: ['Sbohem.', 'Ahoj.'],
      },
    });

    // ===== COMPLIMENTS =====
    this.templates.set('COMPLIMENT', {
      discourseAct: 'COMPLIMENT',
      responses: {
        positive: {
          [Language.ENGLISH]: ['{npc} smiles warmly.', 'You flatter me!', '{npc} beams with pride.'],
          [Language.SPANISH]: ['{npc} sonríe cálidamente.', '¡Me halagas!', '{npc} sonríe con orgullo.'],
          [Language.FRENCH]: ['{npc} sourit chaleureusement.', 'Vous me flattez!', '{npc} rayonne de fierté.'],
          [Language.GERMAN]: ['{npc} lächelt herzlich.', 'Du schmeichelst mir!', '{npc} strahlt vor Stolz.'],
          [Language.ITALIAN]: ['{npc} sorride calorosamente.', 'Mi lusinga!', '{npc} splende di orgoglio.'],
          [Language.JAPANESE]: ['{npc}は温かく微笑む。', 'お世辞が上手ですね！', '{npc}は誇らしげに輝く。'],
          [Language.MANDARIN]: ['{npc}温暖地微笑。', '你过奖了！', '{npc}自豪地微笑。'],
          [Language.RUSSIAN]: ['{npc} тепло улыбается.', 'Вы льстите мне!', '{npc} сияет от гордости.'],
          [Language.PORTUGUESE]: ['{npc} sorri calorosamente.', 'Você me lisonjeia!', '{npc} brilha de orgulho.'],
          [Language.UKRAINIAN]: ['{npc} тепло посміхається.', 'Ви мені лестите!', '{npc} сяє від гордості.'],
          [Language.POLISH]: ['{npc} uśmiecha się ciepło.', 'Pochlebiasz mi!', '{npc} promienieje z dumy.'],
          [Language.CZECH]: ['{npc} se vřele usmívá.', 'Lichotíš mi!', '{npc} září hrdostí.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['{npc} nods appreciatively.', 'Thank you.'],
        [Language.SPANISH]: ['{npc} asiente con aprecio.', 'Gracias.'],
        [Language.FRENCH]: ['{npc} hoche la tête avec reconnaissance.', 'Merci.'],
        [Language.GERMAN]: ['{npc} nickt dankbar.', 'Danke.'],
        [Language.ITALIAN]: ['{npc} annuisce con apprezzamento.', 'Grazie.'],
        [Language.JAPANESE]: ['{npc}は感謝して頷く。', 'ありがとう。'],
        [Language.MANDARIN]: ['{npc}感激地点头。', '谢谢。'],
        [Language.RUSSIAN]: ['{npc} кивает с благодарностью.', 'Спасибо.'],
        [Language.PORTUGUESE]: ['{npc} acena com gratidão.', 'Obrigado.'],
        [Language.UKRAINIAN]: ['{npc} вдячно киває.', 'Дякую.'],
        [Language.POLISH]: ['{npc} kiwa głową z uznaniem.', 'Dziękuję.'],
        [Language.CZECH]: ['{npc} vděčně přikývne.', 'Děkuji.'],
      },
    });

    // ===== INSULTS =====
    this.templates.set('INSULT', {
      discourseAct: 'INSULT',
      responses: {
        negative: {
          [Language.ENGLISH]: ['{npc} frowns deeply.', 'How dare you!', '{npc} looks offended.'],
          [Language.SPANISH]: ['{npc} frunce el ceño profundamente.', '¡Cómo te atreves!', '{npc} parece ofendido.'],
          [Language.FRENCH]: ['{npc} fronce profondément les sourcils.', 'Comment osez-vous!', '{npc} a l\'air offensé.'],
          [Language.GERMAN]: ['{npc} runzelt tief die Stirn.', 'Wie kannst du es wagen!', '{npc} sieht beleidigt aus.'],
          [Language.ITALIAN]: ['{npc} aggrotta profondamente la fronte.', 'Come osi!', '{npc} sembra offeso.'],
          [Language.JAPANESE]: ['{npc}は深く眉をひそめる。', 'よくもそんなことが！', '{npc}は怒っているようだ。'],
          [Language.MANDARIN]: ['{npc}深深皱眉。', '你怎么敢！', '{npc}看起来很生气。'],
          [Language.RUSSIAN]: ['{npc} глубоко хмурится.', 'Как ты смеешь!', '{npc} выглядит обиженным.'],
          [Language.PORTUGUESE]: ['{npc} franze a testa profundamente.', 'Como ousa!', '{npc} parece ofendido.'],
          [Language.UKRAINIAN]: ['{npc} глибоко хмуриться.', 'Як ти смієш!', '{npc} виглядає ображеним.'],
          [Language.POLISH]: ['{npc} marszczy głęboko brwi.', 'Jak śmiesz!', '{npc} wygląda na obrażonego.'],
          [Language.CZECH]: ['{npc} se hluboce mračí.', 'Jak si dovolíš!', '{npc} vypadá uražené.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['{npc} looks displeased.', 'That was uncalled for.'],
        [Language.SPANISH]: ['{npc} parece disgustado.', 'Eso fue innecesario.'],
        [Language.FRENCH]: ['{npc} a l\'air mécontent.', 'C\'était déplacé.'],
        [Language.GERMAN]: ['{npc} sieht unzufrieden aus.', 'Das war unnötig.'],
        [Language.ITALIAN]: ['{npc} sembra scontento.', 'Non era necessario.'],
        [Language.JAPANESE]: ['{npc}は不快そうだ。', 'それは不要でした。'],
        [Language.MANDARIN]: ['{npc}看起来不高兴。', '这没有必要。'],
        [Language.RUSSIAN]: ['{npc} выглядит недовольным.', 'Это было лишним.'],
        [Language.PORTUGUESE]: ['{npc} parece descontente.', 'Isso foi desnecessário.'],
        [Language.UKRAINIAN]: ['{npc} виглядає незадоволеним.', 'Це було зайвим.'],
        [Language.POLISH]: ['{npc} wygląda na niezadowolonego.', 'To było niepotrzebne.'],
        [Language.CZECH]: ['{npc} vypadá nespokojené.', 'To bylo zbytečné.'],
      },
    });

    // ===== THANKS =====
    this.templates.set('THANKS', {
      discourseAct: 'THANKS',
      responses: {
        positive: {
          [Language.ENGLISH]: ['You\'re most welcome!', 'Happy to help!', 'Anytime, friend!'],
          [Language.SPANISH]: ['¡De nada!', '¡Encantado de ayudar!', '¡Cuando quieras, amigo!'],
          [Language.FRENCH]: ['De rien!', 'Ravi d\'aider!', 'N\'importe quand, ami!'],
          [Language.GERMAN]: ['Gern geschehen!', 'Gerne geholfen!', 'Jederzeit, Freund!'],
          [Language.ITALIAN]: ['Prego!', 'Felice di aiutare!', 'Quando vuoi, amico!'],
          [Language.JAPANESE]: ['どういたしまして！', '喜んで手伝います！', 'いつでも、友よ！'],
          [Language.MANDARIN]: ['不客气！', '很高兴帮助！', '随时，朋友！'],
          [Language.RUSSIAN]: ['Пожалуйста!', 'Рад помочь!', 'В любое время, друг!'],
          [Language.PORTUGUESE]: ['De nada!', 'Feliz em ajudar!', 'Quando quiser, amigo!'],
          [Language.UKRAINIAN]: ['Будь ласка!', 'Радий допомогти!', 'Будь-коли, друже!'],
          [Language.POLISH]: ['Proszę bardzo!', 'Cieszę się, że mogłem pomóc!', 'Zawsze, przyjacielu!'],
          [Language.CZECH]: ['Není zač!', 'Rád pomohl!', 'Kdykoli, příteli!'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['You\'re welcome.', 'No problem.'],
        [Language.SPANISH]: ['De nada.', 'No hay problema.'],
        [Language.FRENCH]: ['De rien.', 'Pas de problème.'],
        [Language.GERMAN]: ['Gern geschehen.', 'Kein Problem.'],
        [Language.ITALIAN]: ['Prego.', 'Nessun problema.'],
        [Language.JAPANESE]: ['どういたしまして。', '問題ありません。'],
        [Language.MANDARIN]: ['不客气。', '没问题。'],
        [Language.RUSSIAN]: ['Пожалуйста.', 'Без проблем.'],
        [Language.PORTUGUESE]: ['De nada.', 'Sem problema.'],
        [Language.UKRAINIAN]: ['Будь ласка.', 'Немає проблем.'],
        [Language.POLISH]: ['Proszę bardzo.', 'Nie ma problemu.'],
        [Language.CZECH]: ['Není zač.', 'Žádný problém.'],
      },
    });

    // ===== APOLOGY =====
    this.templates.set('APOLOGY', {
      discourseAct: 'APOLOGY',
      responses: {
        positive: {
          [Language.ENGLISH]: ['It\'s alright, don\'t worry.', 'No harm done!', 'All is forgiven.'],
          [Language.SPANISH]: ['Está bien, no te preocupes.', '¡No hay daño!', 'Todo está perdonado.'],
          [Language.FRENCH]: ['C\'est bon, ne vous inquiétez pas.', 'Aucun mal!', 'Tout est pardonné.'],
          [Language.GERMAN]: ['Schon gut, mach dir keine Sorgen.', 'Kein Schaden!', 'Alles vergeben.'],
          [Language.ITALIAN]: ['Va bene, non preoccuparti.', 'Nessun danno!', 'Tutto perdonato.'],
          [Language.JAPANESE]: ['大丈夫、心配しないで。', '問題ないよ！', 'すべて許す。'],
          [Language.MANDARIN]: ['没关系，别担心。', '没有伤害！', '一切都原谅了。'],
          [Language.RUSSIAN]: ['Всё в порядке, не волнуйся.', 'Ничего страшного!', 'Всё прощено.'],
          [Language.PORTUGUESE]: ['Está tudo bem, não se preocupe.', 'Sem problemas!', 'Tudo perdoado.'],
          [Language.UKRAINIAN]: ['Все гаразд, не хвилюйся.', 'Нічого страшного!', 'Все прощено.'],
          [Language.POLISH]: ['W porządku, nie martw się.', 'Nic się nie stało!', 'Wszystko wybaczone.'],
          [Language.CZECH]: ['Je to v pořádku, nedělej si starosti.', 'Žádná škoda!', 'Vše odpuštěno.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['It\'s okay.', 'Don\'t worry about it.'],
        [Language.SPANISH]: ['Está bien.', 'No te preocupes.'],
        [Language.FRENCH]: ['C\'est bon.', 'Ne vous inquiétez pas.'],
        [Language.GERMAN]: ['Schon gut.', 'Mach dir keine Sorgen.'],
        [Language.ITALIAN]: ['Va bene.', 'Non preoccuparti.'],
        [Language.JAPANESE]: ['大丈夫。', '心配しないで。'],
        [Language.MANDARIN]: ['没关系。', '别担心。'],
        [Language.RUSSIAN]: ['Всё в порядке.', 'Не волнуйся.'],
        [Language.PORTUGUESE]: ['Está tudo bem.', 'Não se preocupe.'],
        [Language.UKRAINIAN]: ['Все гаразд.', 'Не хвилюйся.'],
        [Language.POLISH]: ['W porządku.', 'Nie martw się.'],
        [Language.CZECH]: ['Je to v pořádku.', 'Nedělej si starosti.'],
      },
    });

    // ===== QUESTIONS =====
    this.templates.set('QUESTION_WHY', {
      discourseAct: 'QUESTION_WHY',
      responses: {},
      fallback: {
        [Language.ENGLISH]: ['I had my reasons.', 'It seemed like the right thing to do.', 'Why not?'],
        [Language.SPANISH]: ['Tenía mis razones.', 'Parecía lo correcto.', '¿Por qué no?'],
        [Language.FRENCH]: ['J\'avais mes raisons.', 'Cela semblait juste.', 'Pourquoi pas?'],
        [Language.GERMAN]: ['Ich hatte meine Gründe.', 'Es schien richtig.', 'Warum nicht?'],
        [Language.ITALIAN]: ['Avevo le mie ragioni.', 'Sembrava giusto.', 'Perché no?'],
        [Language.JAPANESE]: ['理由があった。', '正しいことのように思えた。', 'なぜダメなの？'],
        [Language.MANDARIN]: ['我有我的理由。', '这似乎是正确的。', '为什么不？'],
        [Language.RUSSIAN]: ['У меня были причины.', 'Это казалось правильным.', 'Почему бы и нет?'],
        [Language.PORTUGUESE]: ['Eu tinha minhas razões.', 'Parecia certo.', 'Por que não?'],
        [Language.UKRAINIAN]: ['У мене були причини.', 'Це здавалося правильним.', 'Чому б ні?'],
        [Language.POLISH]: ['Miałem swoje powody.', 'Wydawało się słuszne.', 'Dlaczego nie?'],
        [Language.CZECH]: ['Měl jsem své důvody.', 'Zdálo se to správné.', 'Proč ne?'],
      },
    });

    this.templates.set('QUESTION_WHO', {
      discourseAct: 'QUESTION_WHO',
      responses: {},
      fallback: {
        [Language.ENGLISH]: ['I am {npc}.', 'They call me {npc}.', 'Who wants to know?'],
        [Language.SPANISH]: ['Soy {npc}.', 'Me llaman {npc}.', '¿Quién quiere saber?'],
        [Language.FRENCH]: ['Je suis {npc}.', 'On m\'appelle {npc}.', 'Qui veut savoir?'],
        [Language.GERMAN]: ['Ich bin {npc}.', 'Man nennt mich {npc}.', 'Wer will es wissen?'],
        [Language.ITALIAN]: ['Sono {npc}.', 'Mi chiamano {npc}.', 'Chi vuole sapere?'],
        [Language.JAPANESE]: ['私は{npc}です。', '人々は私を{npc}と呼ぶ。', '誰が知りたいの？'],
        [Language.MANDARIN]: ['我是{npc}。', '他们叫我{npc}。', '谁想知道？'],
        [Language.RUSSIAN]: ['Я {npc}.', 'Меня зовут {npc}.', 'Кто хочет знать?'],
        [Language.PORTUGUESE]: ['Eu sou {npc}.', 'Eles me chamam de {npc}.', 'Quem quer saber?'],
        [Language.UKRAINIAN]: ['Я {npc}.', 'Мене називають {npc}.', 'Хто хоче знати?'],
        [Language.POLISH]: ['Jestem {npc}.', 'Nazywają mnie {npc}.', 'Kto chce wiedzieć?'],
        [Language.CZECH]: ['Jsem {npc}.', 'Říkají mi {npc}.', 'Kdo chce vědět?'],
      },
    });

    this.templates.set('QUESTION_WHAT', {
      discourseAct: 'QUESTION_WHAT',
      responses: {},
      fallback: {
        [Language.ENGLISH]: ['What do you mean?', 'I\'m not sure what you\'re asking.', 'Can you be more specific?'],
        [Language.SPANISH]: ['¿Qué quieres decir?', 'No estoy seguro de lo que preguntas.', '¿Puedes ser más específico?'],
        [Language.FRENCH]: ['Que voulez-vous dire?', 'Je ne suis pas sûr de ce que vous demandez.', 'Pouvez-vous être plus précis?'],
        [Language.GERMAN]: ['Was meinst du?', 'Ich bin mir nicht sicher, was du fragst.', 'Kannst du genauer sein?'],
        [Language.ITALIAN]: ['Cosa intendi?', 'Non sono sicuro di cosa stai chiedendo.', 'Puoi essere più specifico?'],
        [Language.JAPANESE]: ['どういう意味？', '何を聞いているのかわからない。', 'もっと具体的にできますか？'],
        [Language.MANDARIN]: ['你是什么意思？', '我不确定你在问什么。', '你能更具体吗？'],
        [Language.RUSSIAN]: ['Что ты имеешь в виду?', 'Я не уверен, о чём ты спрашиваешь.', 'Можешь быть конкретнее?'],
        [Language.PORTUGUESE]: ['O que você quer dizer?', 'Não tenho certeza do que você está perguntando.', 'Você pode ser mais específico?'],
        [Language.UKRAINIAN]: ['Що ти маєш на увазі?', 'Я не впевнений, що ти питаєш.', 'Можеш бути конкретнішим?'],
        [Language.POLISH]: ['Co masz na myśli?', 'Nie jestem pewien, o co pytasz.', 'Czy możesz być bardziej konkretny?'],
        [Language.CZECH]: ['Co tím myslíš?', 'Nejsem si jistý, na co se ptáš.', 'Můžeš být konkrétnější?'],
      },
    });

    // ===== AGREEMENT / DISAGREEMENT =====
    this.templates.set('AGREEMENT', {
      discourseAct: 'AGREEMENT',
      responses: {},
      fallback: {
        [Language.ENGLISH]: ['{npc} nods in agreement.', 'Indeed.', 'I agree.'],
        [Language.SPANISH]: ['{npc} asiente en señal de acuerdo.', 'En efecto.', 'Estoy de acuerdo.'],
        [Language.FRENCH]: ['{npc} hoche la tête en accord.', 'En effet.', 'Je suis d\'accord.'],
        [Language.GERMAN]: ['{npc} nickt zustimmend.', 'In der Tat.', 'Ich stimme zu.'],
        [Language.ITALIAN]: ['{npc} annuisce in accordo.', 'Infatti.', 'Sono d\'accordo.'],
        [Language.JAPANESE]: ['{npc}は同意して頷く。', '確かに。', '同意します。'],
        [Language.MANDARIN]: ['{npc}点头同意。', '确实。', '我同意。'],
        [Language.RUSSIAN]: ['{npc} кивает в знак согласия.', 'Действительно.', 'Я согласен.'],
        [Language.PORTUGUESE]: ['{npc} acena em concordância.', 'De fato.', 'Eu concordo.'],
        [Language.UKRAINIAN]: ['{npc} киває на знак згоди.', 'Справді.', 'Я згоден.'],
        [Language.POLISH]: ['{npc} kiwa głową na zgodę.', 'Rzeczywiście.', 'Zgadzam się.'],
        [Language.CZECH]: ['{npc} kývne na souhlas.', 'Skutečně.', 'Souhlasím.'],
      },
    });

    this.templates.set('DISAGREEMENT', {
      discourseAct: 'DISAGREEMENT',
      responses: {},
      fallback: {
        [Language.ENGLISH]: ['{npc} shakes their head.', 'I disagree.', 'I don\'t think so.'],
        [Language.SPANISH]: ['{npc} niega con la cabeza.', 'No estoy de acuerdo.', 'No lo creo.'],
        [Language.FRENCH]: ['{npc} secoue la tête.', 'Je ne suis pas d\'accord.', 'Je ne pense pas.'],
        [Language.GERMAN]: ['{npc} schüttelt den Kopf.', 'Ich stimme nicht zu.', 'Ich glaube nicht.'],
        [Language.ITALIAN]: ['{npc} scuote la testa.', 'Non sono d\'accordo.', 'Non penso.'],
        [Language.JAPANESE]: ['{npc}は首を横に振る。', '同意しない。', 'そうは思わない。'],
        [Language.MANDARIN]: ['{npc}摇头。', '我不同意。', '我不这么认为。'],
        [Language.RUSSIAN]: ['{npc} качает головой.', 'Я не согласен.', 'Я так не думаю.'],
        [Language.PORTUGUESE]: ['{npc} balança a cabeça.', 'Eu discordo.', 'Eu não acho.'],
        [Language.UKRAINIAN]: ['{npc} хитає головою.', 'Я не згоден.', 'Я так не думаю.'],
        [Language.POLISH]: ['{npc} kręci głową.', 'Nie zgadzam się.', 'Nie sądzę.'],
        [Language.CZECH]: ['{npc} kroutí hlavou.', 'Nesouhlasím.', 'Nemyslím si to.'],
      },
    });

    // ===== TOPIC MANAGEMENT =====
    this.templates.set('TOPIC_CHANGE', {
      discourseAct: 'TOPIC_CHANGE',
      responses: {},
      fallback: {
        [Language.ENGLISH]: ['What did you want to talk about?', 'Go on...', 'Yes?'],
        [Language.SPANISH]: ['¿De qué querías hablar?', 'Continúa...', '¿Sí?'],
        [Language.FRENCH]: ['De quoi vouliez-vous parler?', 'Continuez...', 'Oui?'],
        [Language.GERMAN]: ['Worüber wolltest du sprechen?', 'Weiter...', 'Ja?'],
        [Language.ITALIAN]: ['Di cosa volevi parlare?', 'Continua...', 'Sì?'],
        [Language.JAPANESE]: ['何について話したかったの？', '続けて...', 'はい？'],
        [Language.MANDARIN]: ['你想谈什么？', '继续...', '是？'],
        [Language.RUSSIAN]: ['О чём ты хотел поговорить?', 'Продолжай...', 'Да?'],
        [Language.PORTUGUESE]: ['Do que você queria falar?', 'Continue...', 'Sim?'],
        [Language.UKRAINIAN]: ['Про що ти хотів поговорити?', 'Продовжуй...', 'Так?'],
        [Language.POLISH]: ['O czym chciałeś porozmawiać?', 'Dalej...', 'Tak?'],
        [Language.CZECH]: ['O čem jsi chtěl mluvit?', 'Pokračuj...', 'Ano?'],
      },
    });

    // ===== COMPLEX SOCIAL DYNAMICS (TIER 20 EXPANSION) =====

    // SARCASM - Negative intent with faux-positive response
    this.templates.set('SARCASM', {
      discourseAct: 'SARCASM',
      responses: {
        negative: {
          [Language.ENGLISH]: ['{npc} raises an eyebrow.', '{npc} looks unimpressed.', '{npc} scoffs.'],
          [Language.SPANISH]: ['{npc} levanta una ceja.', '{npc} parece poco impresionado.', '{npc} se burla.'],
          [Language.FRENCH]: ['{npc} lève un sourcil.', '{npc} semble peu impressionné.', '{npc} ricane.'],
          [Language.GERMAN]: ['{npc} hebt eine Augenbraue.', '{npc} sieht unbeeindruckt aus.', '{npc} schnaubt.'],
          [Language.ITALIAN]: ['{npc} alza un sopracciglio.', '{npc} sembra poco impressionato.', '{npc} sbuffa.'],
          [Language.JAPANESE]: ['{npc}は眉を上げる。', '{npc}は感心していないようだ。', '{npc}は鼻で笑う。'],
          [Language.MANDARIN]: ['{npc}扬起眉毛。', '{npc}看起来毫无印象。', '{npc}嗤之以鼻。'],
          [Language.RUSSIAN]: ['{npc} поднимает бровь.', '{npc} выглядит неимпрессированным.', '{npc} фыркает.'],
          [Language.PORTUGUESE]: ['{npc} levanta uma sobrancelha.', '{npc} parece pouco impressionado.', '{npc} zomba.'],
          [Language.UKRAINIAN]: ['{npc} піднімає брову.', '{npc} виглядає невражено.', '{npc} пирхає.'],
          [Language.POLISH]: ['{npc} unosi brew.', '{npc} wygląda na niezaimpresowanego.', '{npc} prycha.'],
          [Language.CZECH]: ['{npc} zvedne obočí.', '{npc} vypadá neohroženě.', '{npc} odfrkne.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['{npc} doesn\'t seem amused.'],
        [Language.SPANISH]: ['{npc} no parece divertido.'],
        [Language.FRENCH]: ['{npc} ne semble pas amusé.'],
        [Language.GERMAN]: ['{npc} scheint nicht amüsiert zu sein.'],
        [Language.ITALIAN]: ['{npc} non sembra divertito.'],
        [Language.JAPANESE]: ['{npc}は楽しんでいないようだ。'],
        [Language.MANDARIN]: ['{npc}似乎不觉得有趣。'],
        [Language.RUSSIAN]: ['{npc} не кажется веселым.'],
        [Language.PORTUGUESE]: ['{npc} não parece divertido.'],
        [Language.UKRAINIAN]: ['{npc} не здається веселим.'],
        [Language.POLISH]: ['{npc} nie wygląda na rozbawionego.'],
        [Language.CZECH]: ['{npc} nevypadá pobaveně.'],
      },
    });

    // FLIRTING - Romantic/playful expressions
    this.templates.set('FLIRTING', {
      discourseAct: 'FLIRTING',
      responses: {
        positive: {
          [Language.ENGLISH]: ['{npc} smiles warmly.', '{npc} blushes slightly.', '{npc} seems flattered.'],
          [Language.SPANISH]: ['{npc} sonríe calurosamente.', '{npc} se ruboriza ligeramente.', '{npc} parece halagado.'],
          [Language.FRENCH]: ['{npc} sourit chaleureusement.', '{npc} rougit légèrement.', '{npc} semble flatté.'],
          [Language.GERMAN]: ['{npc} lächelt warm.', '{npc} errötet leicht.', '{npc} scheint geschmeichelt.'],
          [Language.ITALIAN]: ['{npc} sorride calorosamente.', '{npc} arrossisce leggermente.', '{npc} sembra lusingato.'],
          [Language.JAPANESE]: ['{npc}は温かく微笑む。', '{npc}はわずかに赤面する。', '{npc}はお世辞を言われているようだ。'],
          [Language.MANDARIN]: ['{npc}温暖地微笑。', '{npc}微微脸红。', '{npc}似乎很受宠若惊。'],
          [Language.RUSSIAN]: ['{npc} тепло улыбается.', '{npc} слегка краснеет.', '{npc} кажется польщённым.'],
          [Language.PORTUGUESE]: ['{npc} sorri calorosamente.', '{npc} cora ligeiramente.', '{npc} parece lisonjeado.'],
          [Language.UKRAINIAN]: ['{npc} тепло посміхається.', '{npc} злегка червоніє.', '{npc} здається улещеним.'],
          [Language.POLISH]: ['{npc} uśmiecha się ciepło.', '{npc} lekko się rumieni.', '{npc} wygląda na pochlebionego.'],
          [Language.CZECH]: ['{npc} se mile usmívá.', '{npc} se lehce červená.', '{npc} vypadá lichotivě.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['{npc} acknowledges your comment.'],
        [Language.SPANISH]: ['{npc} reconoce tu comentario.'],
        [Language.FRENCH]: ['{npc} reconnaît votre commentaire.'],
        [Language.GERMAN]: ['{npc} nimmt deinen Kommentar zur Kenntnis.'],
        [Language.ITALIAN]: ['{npc} riconosce il tuo commento.'],
        [Language.JAPANESE]: ['{npc}はあなたのコメントを認めます。'],
        [Language.MANDARIN]: ['{npc}承认你的评论。'],
        [Language.RUSSIAN]: ['{npc} признаёт ваш комментарий.'],
        [Language.PORTUGUESE]: ['{npc} reconhece seu comentário.'],
        [Language.UKRAINIAN]: ['{npc} визнає ваш коментар.'],
        [Language.POLISH]: ['{npc} przyjmuje twój komentarz.'],
        [Language.CZECH]: ['{npc} bere váš komentář na vědomí.'],
      },
    });

    // BRAGGING - Self-aggrandizement
    this.templates.set('BRAGGING', {
      discourseAct: 'BRAGGING',
      responses: {
        neutral: {
          [Language.ENGLISH]: ['{npc} looks skeptical.', 'Is that so?', '{npc} seems unimpressed.'],
          [Language.SPANISH]: ['{npc} parece escéptico.', '¿Es así?', '{npc} parece poco impresionado.'],
          [Language.FRENCH]: ['{npc} semble sceptique.', 'C\'est vrai?', '{npc} semble peu impressionné.'],
          [Language.GERMAN]: ['{npc} sieht skeptisch aus.', 'Ist das so?', '{npc} sieht unbeeindruckt aus.'],
          [Language.ITALIAN]: ['{npc} sembra scettico.', 'È così?', '{npc} sembra poco impressionato.'],
          [Language.JAPANESE]: ['{npc}は懐疑的に見える。', 'そうなのか？', '{npc}は感心していないようだ。'],
          [Language.MANDARIN]: ['{npc}看起来怀疑。', '是这样吗？', '{npc}看起来毫无印象。'],
          [Language.RUSSIAN]: ['{npc} выглядит скептически.', 'Это так?', '{npc} выглядит неимпрессированным.'],
          [Language.PORTUGUESE]: ['{npc} parece cético.', 'É assim?', '{npc} parece pouco impressionado.'],
          [Language.UKRAINIAN]: ['{npc} виглядає скептично.', 'Це так?', '{npc} виглядає невражено.'],
          [Language.POLISH]: ['{npc} wygląda na sceptycznego.', 'Czy to prawda?', '{npc} wygląda na niezaimpresowanego.'],
          [Language.CZECH]: ['{npc} vypadá skepticky.', 'Je to tak?', '{npc} vypadá neohroženě.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['I see...'],
        [Language.SPANISH]: ['Ya veo...'],
        [Language.FRENCH]: ['Je vois...'],
        [Language.GERMAN]: ['Ich verstehe...'],
        [Language.ITALIAN]: ['Capisco...'],
        [Language.JAPANESE]: ['そうか...'],
        [Language.MANDARIN]: ['我明白了...'],
        [Language.RUSSIAN]: ['Понятно...'],
        [Language.PORTUGUESE]: ['Entendo...'],
        [Language.UKRAINIAN]: ['Зрозуміло...'],
        [Language.POLISH]: ['Rozumiem...'],
        [Language.CZECH]: ['Chápu...'],
      },
    });

    // TEASING - Light mockery
    this.templates.set('TEASING', {
      discourseAct: 'TEASING',
      responses: {
        neutral: {
          [Language.ENGLISH]: ['{npc} chuckles.', 'Very funny.', '{npc} rolls their eyes playfully.'],
          [Language.SPANISH]: ['{npc} se ríe entre dientes.', 'Muy gracioso.', '{npc} pone los ojos en blanco juguetonamente.'],
          [Language.FRENCH]: ['{npc} rigole.', 'Très drôle.', '{npc} lève les yeux au ciel de manière ludique.'],
          [Language.GERMAN]: ['{npc} kichert.', 'Sehr lustig.', '{npc} verdreht spielerisch die Augen.'],
          [Language.ITALIAN]: ['{npc} ridacchia.', 'Molto divertente.', '{npc} alza gli occhi al cielo scherzosamente.'],
          [Language.JAPANESE]: ['{npc}はくすくす笑う。', '面白い。', '{npc}は遊び心で目を転がす。'],
          [Language.MANDARIN]: ['{npc}轻声笑。', '很有趣。', '{npc}顽皮地翻白眼。'],
          [Language.RUSSIAN]: ['{npc} хихикает.', 'Очень смешно.', '{npc} игриво закатывает глаза.'],
          [Language.PORTUGUESE]: ['{npc} ri baixinho.', 'Muito engraçado.', '{npc} revira os olhos brincalhonamente.'],
          [Language.UKRAINIAN]: ['{npc} хихикає.', 'Дуже смішно.', '{npc} грайливо закочує очі.'],
          [Language.POLISH]: ['{npc} chichoce.', 'Bardzo śmieszne.', '{npc} przewraca oczami żartobliwie.'],
          [Language.CZECH]: ['{npc} se chichotá.', 'Velmi vtipné.', '{npc} přehrabuje očima hravě.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['{npc} smirks.'],
        [Language.SPANISH]: ['{npc} sonríe con suficiencia.'],
        [Language.FRENCH]: ['{npc} sourit narquoisement.'],
        [Language.GERMAN]: ['{npc} grinst.'],
        [Language.ITALIAN]: ['{npc} sorride maliziosamente.'],
        [Language.JAPANESE]: ['{npc}はニヤリと笑う。'],
        [Language.MANDARIN]: ['{npc}得意地笑。'],
        [Language.RUSSIAN]: ['{npc} усмехается.'],
        [Language.PORTUGUESE]: ['{npc} sorri maliciosamente.'],
        [Language.UKRAINIAN]: ['{npc} посміхається.'],
        [Language.POLISH]: ['{npc} uśmiecha się złośliwie.'],
        [Language.CZECH]: ['{npc} se ušklíbá.'],
      },
    });

    // PLEADING - Desperate requests
    this.templates.set('PLEADING', {
      discourseAct: 'PLEADING',
      responses: {
        neutral: {
          [Language.ENGLISH]: ['{npc} looks concerned.', 'Calm down...', '{npc} considers your plea.'],
          [Language.SPANISH]: ['{npc} parece preocupado.', 'Cálmate...', '{npc} considera tu súplica.'],
          [Language.FRENCH]: ['{npc} semble inquiet.', 'Calmez-vous...', '{npc} considère votre plaidoyer.'],
          [Language.GERMAN]: ['{npc} sieht besorgt aus.', 'Beruhige dich...', '{npc} erwägt deine Bitte.'],
          [Language.ITALIAN]: ['{npc} sembra preoccupato.', 'Calmati...', '{npc} considera la tua supplica.'],
          [Language.JAPANESE]: ['{npc}は心配そうに見える。', '落ち着いて...', '{npc}はあなたの嘆願を考慮する。'],
          [Language.MANDARIN]: ['{npc}看起来担心。', '冷静下来...', '{npc}考虑你的恳求。'],
          [Language.RUSSIAN]: ['{npc} выглядит обеспокоенным.', 'Успокойся...', '{npc} рассматривает твою просьбу.'],
          [Language.PORTUGUESE]: ['{npc} parece preocupado.', 'Acalme-se...', '{npc} considera seu pedido.'],
          [Language.UKRAINIAN]: ['{npc} виглядає стурбованим.', 'Заспокойся...', '{npc} розглядає твоє прохання.'],
          [Language.POLISH]: ['{npc} wygląda na zaniepokojenia.', 'Uspokój się...', '{npc} rozważa twoją prośbę.'],
          [Language.CZECH]: ['{npc} vypadá znepokojeně.', 'Uklidni se...', '{npc} zvažuje tvou prosbu.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['I hear you...'],
        [Language.SPANISH]: ['Te escucho...'],
        [Language.FRENCH]: ['Je vous entends...'],
        [Language.GERMAN]: ['Ich höre dich...'],
        [Language.ITALIAN]: ['Ti sento...'],
        [Language.JAPANESE]: ['聞いている...'],
        [Language.MANDARIN]: ['我听到了...'],
        [Language.RUSSIAN]: ['Я слышу тебя...'],
        [Language.PORTUGUESE]: ['Eu ouço você...'],
        [Language.UKRAINIAN]: ['Я чую тебе...'],
        [Language.POLISH]: ['Słyszę cię...'],
        [Language.CZECH]: ['Slyším tě...'],
      },
    });

    // DISMISSAL - Disinterest/rejection
    this.templates.set('DISMISSAL', {
      discourseAct: 'DISMISSAL',
      responses: {
        negative: {
          [Language.ENGLISH]: ['{npc} turns away.', '{npc} shrugs dismissively.', '{npc} looks away coldly.'],
          [Language.SPANISH]: ['{npc} se aleja.', '{npc} se encoge de hombros con desdén.', '{npc} mira hacia otro lado fríamente.'],
          [Language.FRENCH]: ['{npc} se détourne.', '{npc} hausse les épaules dédaigneusement.', '{npc} détourne le regard froidement.'],
          [Language.GERMAN]: ['{npc} wendet sich ab.', '{npc} zuckt abweisend mit den Schultern.', '{npc} schaut kalt weg.'],
          [Language.ITALIAN]: ['{npc} si allontana.', '{npc} alza le spalle con disprezzo.', '{npc} distoglie lo sguardo freddamente.'],
          [Language.JAPANESE]: ['{npc}は立ち去る。', '{npc}は軽蔑的に肩をすくめる。', '{npc}は冷たく目をそらす。'],
          [Language.MANDARIN]: ['{npc}转身离开。', '{npc}轻蔑地耸肩。', '{npc}冷冷地看向别处。'],
          [Language.RUSSIAN]: ['{npc} отворачивается.', '{npc} презрительно пожимает плечами.', '{npc} холодно отводит взгляд.'],
          [Language.PORTUGUESE]: ['{npc} se afasta.', '{npc} dá de ombros desdenhosamente.', '{npc} desvia o olhar friamente.'],
          [Language.UKRAINIAN]: ['{npc} відвертається.', '{npc} зневажливо знизує плечима.', '{npc} холодно відводить погляд.'],
          [Language.POLISH]: ['{npc} odwraca się.', '{npc} wzrusza ramionami lekceważąco.', '{npc} odwraca wzrok chłodno.'],
          [Language.CZECH]: ['{npc} se odvrací.', '{npc} pokrčí rameny pohrdavě.', '{npc} odvrací pohled chladně.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['{npc} ignores you.'],
        [Language.SPANISH]: ['{npc} te ignora.'],
        [Language.FRENCH]: ['{npc} vous ignore.'],
        [Language.GERMAN]: ['{npc} ignoriert dich.'],
        [Language.ITALIAN]: ['{npc} ti ignora.'],
        [Language.JAPANESE]: ['{npc}はあなたを無視する。'],
        [Language.MANDARIN]: ['{npc}无视你。'],
        [Language.RUSSIAN]: ['{npc} игнорирует тебя.'],
        [Language.PORTUGUESE]: ['{npc} ignora você.'],
        [Language.UKRAINIAN]: ['{npc} ігнорує тебе.'],
        [Language.POLISH]: ['{npc} ignoruje cię.'],
        [Language.CZECH]: ['{npc} tě ignoruje.'],
      },
    });

    // SURPRISE - Unexpected reactions
    this.templates.set('SURPRISE', {
      discourseAct: 'SURPRISE',
      responses: {
        neutral: {
          [Language.ENGLISH]: ['{npc} looks surprised!', 'That\'s unexpected!', '{npc} seems shocked.'],
          [Language.SPANISH]: ['¡{npc} parece sorprendido!', '¡Eso es inesperado!', '{npc} parece conmocionado.'],
          [Language.FRENCH]: ['{npc} a l\'air surpris!', 'C\'est inattendu!', '{npc} semble choqué.'],
          [Language.GERMAN]: ['{npc} sieht überrascht aus!', 'Das ist unerwartet!', '{npc} scheint schockiert.'],
          [Language.ITALIAN]: ['{npc} sembra sorpreso!', 'È inaspettato!', '{npc} sembra scioccato.'],
          [Language.JAPANESE]: ['{npc}は驚いたようだ！', 'それは予想外だ！', '{npc}はショックを受けているようだ。'],
          [Language.MANDARIN]: ['{npc}看起来很惊讶！', '真出乎意料！', '{npc}似乎很震惊。'],
          [Language.RUSSIAN]: ['{npc} выглядит удивлённым!', 'Это неожиданно!', '{npc} кажется шокированным.'],
          [Language.PORTUGUESE]: ['{npc} parece surpreso!', 'Isso é inesperado!', '{npc} parece chocado.'],
          [Language.UKRAINIAN]: ['{npc} виглядає здивованим!', 'Це несподівано!', '{npc} здається шокованим.'],
          [Language.POLISH]: ['{npc} wygląda na zaskoczonego!', 'To nieoczekiwane!', '{npc} wydaje się zszokowany.'],
          [Language.CZECH]: ['{npc} vypadá překvapeně!', 'To je nečekané!', '{npc} vypadá šokovaně.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['Interesting...'],
        [Language.SPANISH]: ['Interesante...'],
        [Language.FRENCH]: ['Intéressant...'],
        [Language.GERMAN]: ['Interessant...'],
        [Language.ITALIAN]: ['Interessante...'],
        [Language.JAPANESE]: ['面白い...'],
        [Language.MANDARIN]: ['有趣...'],
        [Language.RUSSIAN]: ['Интересно...'],
        [Language.PORTUGUESE]: ['Interessante...'],
        [Language.UKRAINIAN]: ['Цікаво...'],
        [Language.POLISH]: ['Interesujące...'],
        [Language.CZECH]: ['Zajímavé...'],
      },
    });

    // RELIEF - Tension release
    this.templates.set('RELIEF', {
      discourseAct: 'RELIEF',
      responses: {
        positive: {
          [Language.ENGLISH]: ['{npc} breathes a sigh of relief.', 'I\'m glad too.', '{npc} relaxes visibly.'],
          [Language.SPANISH]: ['{npc} suspira de alivio.', 'Yo también me alegro.', '{npc} se relaja visiblemente.'],
          [Language.FRENCH]: ['{npc} pousse un soupir de soulagement.', 'Je suis content aussi.', '{npc} se détend visiblement.'],
          [Language.GERMAN]: ['{npc} atmet erleichtert auf.', 'Ich bin auch froh.', '{npc} entspannt sich sichtlich.'],
          [Language.ITALIAN]: ['{npc} tira un sospiro di sollievo.', 'Sono contento anche io.', '{npc} si rilassa visibilmente.'],
          [Language.JAPANESE]: ['{npc}は安堵のため息をつく。', '私も嬉しい。', '{npc}は明らかにリラックスする。'],
          [Language.MANDARIN]: ['{npc}松了一口气。', '我也很高兴。', '{npc}明显放松了。'],
          [Language.RUSSIAN]: ['{npc} вздыхает с облегчением.', 'Я тоже рад.', '{npc} заметно расслабляется.'],
          [Language.PORTUGUESE]: ['{npc} suspira de alívio.', 'Também fico feliz.', '{npc} relaxa visivelmente.'],
          [Language.UKRAINIAN]: ['{npc} зітхає з полегшенням.', 'Я теж радий.', '{npc} помітно розслаблюється.'],
          [Language.POLISH]: ['{npc} wzdycha z ulgą.', 'Ja też się cieszę.', '{npc} widocznie się relaksuje.'],
          [Language.CZECH]: ['{npc} si oddechne s úlevou.', 'Jsem také rád.', '{npc} se viditelně uvolní.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['Good to know.'],
        [Language.SPANISH]: ['Bueno saberlo.'],
        [Language.FRENCH]: ['Bon à savoir.'],
        [Language.GERMAN]: ['Gut zu wissen.'],
        [Language.ITALIAN]: ['Buono a sapersi.'],
        [Language.JAPANESE]: ['知っておいて良かった。'],
        [Language.MANDARIN]: ['很高兴知道。'],
        [Language.RUSSIAN]: ['Хорошо знать.'],
        [Language.PORTUGUESE]: ['Bom saber.'],
        [Language.UKRAINIAN]: ['Добре знати.'],
        [Language.POLISH]: ['Dobrze wiedzieć.'],
        [Language.CZECH]: ['Dobré vědět.'],
      },
    });

    // CURIOSITY - Inquisitive interest
    this.templates.set('CURIOSITY', {
      discourseAct: 'CURIOSITY',
      responses: {
        positive: {
          [Language.ENGLISH]: ['What makes you wonder?', '{npc} seems interested.', 'Tell me what you\'re thinking...'],
          [Language.SPANISH]: ['¿Qué te hace preguntarte?', '{npc} parece interesado.', 'Dime qué estás pensando...'],
          [Language.FRENCH]: ['Qu\'est-ce qui vous fait vous demander?', '{npc} semble intéressé.', 'Dites-moi ce que vous pensez...'],
          [Language.GERMAN]: ['Was lässt dich fragen?', '{npc} scheint interessiert.', 'Sag mir, was du denkst...'],
          [Language.ITALIAN]: ['Cosa ti fa chiedere?', '{npc} sembra interessato.', 'Dimmi cosa stai pensando...'],
          [Language.JAPANESE]: ['何があなたを疑問に思わせる？', '{npc}は興味があるようだ。', '何を考えているか教えて...'],
          [Language.MANDARIN]: ['是什么让你好奇？', '{npc}似乎很感兴趣。', '告诉我你在想什么...'],
          [Language.RUSSIAN]: ['Что заставляет тебя задуматься?', '{npc} кажется заинтересованным.', 'Скажи мне, о чём ты думаешь...'],
          [Language.PORTUGUESE]: ['O que te faz se perguntar?', '{npc} parece interessado.', 'Diga-me o que você está pensando...'],
          [Language.UKRAINIAN]: ['Що змушує тебе дивуватися?', '{npc} здається зацікавленим.', 'Скажи мені, про що ти думаєш...'],
          [Language.POLISH]: ['Co cię zastanawia?', '{npc} wydaje się zainteresowany.', 'Powiedz mi, o czym myślisz...'],
          [Language.CZECH]: ['Co tě nutí přemýšlet?', '{npc} vypadá zainteresovaně.', 'Řekni mi, na co myslíš...'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['What do you want to know?'],
        [Language.SPANISH]: ['¿Qué quieres saber?'],
        [Language.FRENCH]: ['Que voulez-vous savoir?'],
        [Language.GERMAN]: ['Was willst du wissen?'],
        [Language.ITALIAN]: ['Cosa vuoi sapere?'],
        [Language.JAPANESE]: ['何を知りたいですか？'],
        [Language.MANDARIN]: ['你想知道什么？'],
        [Language.RUSSIAN]: ['Что ты хочешь знать?'],
        [Language.PORTUGUESE]: ['O que você quer saber?'],
        [Language.UKRAINIAN]: ['Що ти хочеш знати?'],
        [Language.POLISH]: ['Co chcesz wiedzieć?'],
        [Language.CZECH]: ['Co chceš vědět?'],
      },
    });

    // NOSTALGIA - Reminiscing
    this.templates.set('NOSTALGIA', {
      discourseAct: 'NOSTALGIA',
      responses: {
        neutral: {
          [Language.ENGLISH]: ['{npc} nods wistfully.', 'I remember...', '{npc} gazes into the distance.'],
          [Language.SPANISH]: ['{npc} asiente con nostalgia.', 'Recuerdo...', '{npc} mira a la distancia.'],
          [Language.FRENCH]: ['{npc} hoche la tête avec nostalgie.', 'Je me souviens...', '{npc} regarde au loin.'],
          [Language.GERMAN]: ['{npc} nickt wehmütig.', 'Ich erinnere mich...', '{npc} blickt in die Ferne.'],
          [Language.ITALIAN]: ['{npc} annuisce malinconicamente.', 'Ricordo...', '{npc} guarda in lontananza.'],
          [Language.JAPANESE]: ['{npc}は物思いにふける。', '覚えている...', '{npc}は遠くを見つめる。'],
          [Language.MANDARIN]: ['{npc}若有所思地点头。', '我记得...', '{npc}凝视远方。'],
          [Language.RUSSIAN]: ['{npc} кивает с тоской.', 'Я помню...', '{npc} смотрит вдаль.'],
          [Language.PORTUGUESE]: ['{npc} acena nostalgicamente.', 'Eu lembro...', '{npc} olha para a distância.'],
          [Language.UKRAINIAN]: ['{npc} кива з ностальгією.', 'Я пам\'ятаю...', '{npc} дивиться вдалину.'],
          [Language.POLISH]: ['{npc} kiwa głową z nostalgią.', 'Pamiętam...', '{npc} patrzy w dal.'],
          [Language.CZECH]: ['{npc} kývne nostalgicky.', 'Pamatuji si...', '{npc} hledí do dálky.'],
        },
      },
      fallback: {
        [Language.ENGLISH]: ['Those were different times...'],
        [Language.SPANISH]: ['Esos eran tiempos diferentes...'],
        [Language.FRENCH]: ['C\'étaient d\'autres temps...'],
        [Language.GERMAN]: ['Das waren andere Zeiten...'],
        [Language.ITALIAN]: ['Erano tempi diversi...'],
        [Language.JAPANESE]: ['あれは違う時代だった...'],
        [Language.MANDARIN]: ['那是不同的时代...'],
        [Language.RUSSIAN]: ['Это были другие времена...'],
        [Language.PORTUGUESE]: ['Eram tempos diferentes...'],
        [Language.UKRAINIAN]: ['Це були інші часи...'],
        [Language.POLISH]: ['To były inne czasy...'],
        [Language.CZECH]: ['To byly jiné časy...'],
      },
    });
  }
}

/**
 * Factory function for easy instantiation
 */
export function createNPCResponseGenerator(): NPCResponseGenerator {
  return new NPCResponseGenerator();
}
