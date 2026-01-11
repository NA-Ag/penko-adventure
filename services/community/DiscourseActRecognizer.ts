/**
 * TIER 20: Discourse Act Recognizer
 *
 * Inspired by Façade's NLU system, this recognizes communicative intent
 * beyond simple game actions. Understands greetings, questions, compliments,
 * insults, agreements, and more.
 *
 * This enables natural conversation with NPCs, not just commands.
 */

import type { Language } from '../../types';

export type DiscourseAct =
  // Social Interactions
  | 'GREETING'           // "Hello", "Hi there"
  | 'FAREWELL'           // "Goodbye", "See you"
  | 'INTRODUCTION'       // "I'm Alex", "My name is..."
  | 'SMALL_TALK'         // "Nice weather", "How's it going?"

  // Questions
  | 'QUESTION_WHO'       // "Who are you?"
  | 'QUESTION_WHAT'      // "What is that?"
  | 'QUESTION_WHERE'     // "Where is the key?"
  | 'QUESTION_WHY'       // "Why did you do that?"
  | 'QUESTION_HOW'       // "How does this work?"
  | 'QUESTION_WHEN'      // "When did it happen?"
  | 'QUESTION_YESNO'     // "Do you know?", "Can you?"

  // Statements
  | 'STATEMENT_FACT'     // "The door is locked"
  | 'STATEMENT_OPINION'  // "I think this is wrong"
  | 'STATEMENT_FEELING'  // "I feel confused"
  | 'STATEMENT_BELIEF'   // "I believe in magic"
  | 'STATEMENT_MEMORY'   // "I remember when..."

  // Emotional Expressions
  | 'COMPLIMENT'         // "You're amazing!"
  | 'INSULT'             // "You're terrible"
  | 'THANKS'             // "Thank you"
  | 'APOLOGY'            // "I'm sorry"
  | 'COMPLAINT'          // "This is awful"
  | 'ENCOURAGEMENT'      // "You can do it!"
  | 'SYMPATHY'           // "I understand how you feel"
  | 'EXCITEMENT'         // "This is amazing!", "Wow!"
  | 'FRUSTRATION'        // "This is so annoying!"
  | 'CONCERN'            // "I'm worried about...", "Are you okay?"
  | 'SURPRISE'           // "What?!", "No way!", "Really?!"
  | 'RELIEF'             // "Thank goodness!", "Phew!", "Finally!"
  | 'CURIOSITY'          // "I wonder...", "Interesting...", "Tell me more"
  | 'NOSTALGIA'          // "Those were the days...", "I miss..."

  // Agreement/Disagreement
  | 'AGREEMENT'          // "Yes", "I agree"
  | 'DISAGREEMENT'       // "No", "I disagree"
  | 'CONFIRMATION'       // "Really?", "Are you sure?"
  | 'DOUBT'              // "I'm not sure about that"
  | 'ACCEPTANCE'         // "Okay", "Fair enough"

  // Requests/Commands
  | 'REQUEST'            // "Can you help me?"
  | 'COMMAND'            // "Do it now!"
  | 'SUGGESTION'         // "Maybe try this?"
  | 'OFFER'              // "I can help"
  | 'INVITATION'         // "Come with me", "Join us"
  | 'PERMISSION'         // "May I?", "Is it okay if..."
  | 'PROHIBITION'        // "Don't do that!", "Stop!"

  // Topic Management
  | 'TOPIC_CHANGE'       // "Anyway...", "Speaking of..."
  | 'TOPIC_CALLBACK'     // "But what about...", "Going back to..."
  | 'CLARIFICATION'      // "What do you mean?"
  | 'ACKNOWLEDGMENT'     // "I see", "Got it", "Understood"
  | 'INTERRUPTION'       // "Wait!", "Hold on"

  // Promises & Commitments
  | 'PROMISE'            // "I promise", "I swear"
  | 'THREAT'             // "Or else!", "You'll regret this"
  | 'WARNING'            // "Be careful", "Watch out"
  | 'REASSURANCE'        // "Don't worry", "It'll be okay"

  // Complex Social Dynamics (TIER 20 Expansion)
  | 'SARCASM'            // "Oh, that's just wonderful..." (negative intent, positive words)
  | 'FLIRTING'           // "You look nice today", "Is it hot in here?"
  | 'BRAGGING'           // "I'm the best at this", "Nobody does it better than me"
  | 'TEASING'            // "Look who finally showed up!", light mockery
  | 'PLEADING'           // "Please, I'm begging you!", "I need this!"
  | 'DISMISSAL';         // "Whatever", "I don't care", "As if"

export interface DiscourseAnalysis {
  primary: DiscourseAct;
  secondary?: DiscourseAct;  // Some inputs have multiple acts
  sentiment: 'positive' | 'negative' | 'neutral';
  intensity: number;         // 0.0 to 1.0 (how strong)
  topicReferences: string[]; // What is being discussed
  isPolite: boolean;         // Uses "please", polite phrasing
  isUrgent: boolean;         // Uses "now", "quick", exclamation marks
}

/**
 * Recognizes discourse acts in player input
 *
 * Unlike ObjectIntent (game actions), DiscourseActs represent
 * communicative functions - how the player is using language
 * to interact socially.
 */
export class DiscourseActRecognizer {
  private language: Language;

  constructor(language: Language) {
    this.language = language;
  }

  /**
   * Analyze input for discourse act and emotional content
   */
  analyze(input: string): DiscourseAnalysis {
    const normalized = input.toLowerCase().trim();

    // Check greeting first (common opening)
    const greeting = this.checkGreeting(normalized);
    if (greeting) return greeting;

    // Check farewell
    const farewell = this.checkFarewell(normalized);
    if (farewell) return farewell;

    // Check introduction
    const introduction = this.checkIntroduction(normalized);
    if (introduction) return introduction;

    // Check small talk
    const smallTalk = this.checkSmallTalk(normalized);
    if (smallTalk) return smallTalk;

    // Check questions (by question word)
    const question = this.checkQuestions(normalized);
    if (question) return question;

    // Check emotional expressions
    const emotional = this.checkEmotional(normalized);
    if (emotional) return emotional;

    // Check complex social dynamics (TIER 20 expansion)
    const complexSocial = this.checkComplexSocial(normalized, input);
    if (complexSocial) return complexSocial;

    // Check agreement/disagreement
    const stance = this.checkStance(normalized);
    if (stance) return stance;

    // Check requests/commands
    const directive = this.checkDirectives(normalized);
    if (directive) return directive;

    // Check topic management
    const topic = this.checkTopicManagement(normalized);
    if (topic) return topic;

    // Default: statement
    return {
      primary: this.isOpinion(normalized) ? 'STATEMENT_OPINION' : 'STATEMENT_FACT',
      sentiment: this.detectSentiment(normalized),
      intensity: 0.5,
      topicReferences: this.extractTopics(normalized),
      isPolite: this.checkPoliteness(normalized),
      isUrgent: this.checkUrgency(normalized)
    };
  }

  private checkGreeting(input: string): DiscourseAnalysis | null {
    const patterns = [
      // English
      /^(hello|hi|hey|greetings|howdy|yo)\b/,
      /^good\s+(morning|afternoon|evening|day)/,
      /^what'?s\s+up/,

      // Spanish
      /^(hola|buenos|buenas|qué\s+tal|saludos)/,

      // French
      /^(bonjour|salut|bonsoir|coucou)/,

      // German
      /^(hallo|guten\s+tag|guten\s+morgen|servus)/,

      // Italian
      /^(ciao|buongiorno|buonasera|salve)/,

      // Portuguese
      /^(olá|oi|bom\s+dia)/,

      // Russian
      /^(привет|здравствуй)/,
    ];

    if (this.matchesAny(input, patterns)) {
      return {
        primary: 'GREETING',
        sentiment: 'positive',
        intensity: 0.6,
        topicReferences: [],
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private checkFarewell(input: string): DiscourseAnalysis | null {
    const patterns = [
      /^(goodbye|bye|farewell|see\s+you|later|cya|take\s+care)/,
      /^(adiós|hasta\s+luego|chao|nos\s+vemos)/,
      /^(au\s+revoir|salut|à\s+bientôt)/,
      /^(auf\s+wiedersehen|tschüss)/,
      /^(arrivederci|ciao)/,
    ];

    if (this.matchesAny(input, patterns)) {
      return {
        primary: 'FAREWELL',
        sentiment: 'neutral',
        intensity: 0.5,
        topicReferences: [],
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private checkIntroduction(input: string): DiscourseAnalysis | null {
    const patterns = [
      /^(i'm|i\s+am|my\s+name\s+is|they\s+call\s+me)/,
      /^(me\s+llamo|soy)/,
      /^(je\s+m'appelle|je\s+suis)/,
      /^(ich\s+bin|ich\s+heiße)/,
      /^(mi\s+chiamo|sono)/,
    ];

    if (this.matchesAny(input, patterns)) {
      return {
        primary: 'INTRODUCTION',
        sentiment: 'positive',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private checkSmallTalk(input: string): DiscourseAnalysis | null {
    const patterns = [
      /^(nice|lovely|beautiful)\s+(weather|day)/,
      /^how'?s\s+(it\s+going|things|life)/,
      /^(what|how)\s+have\s+you\s+been/,
      /long\s+time\s+no\s+see/,
    ];

    if (this.matchesAny(input, patterns)) {
      return {
        primary: 'SMALL_TALK',
        sentiment: 'positive',
        intensity: 0.4,
        topicReferences: [],
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private checkQuestions(input: string): DiscourseAnalysis | null {
    // WHO questions
    if (/^(who|quién|qui|wer|chi|quem|кто)/i.test(input)) {
      return {
        primary: 'QUESTION_WHO',
        sentiment: 'neutral',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: this.checkPoliteness(input),
        isUrgent: this.checkUrgency(input)
      };
    }

    // WHAT questions
    if (/^(what|qué|que|was|cosa|o\s+que|что)/i.test(input)) {
      return {
        primary: 'QUESTION_WHAT',
        sentiment: 'neutral',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: this.checkPoliteness(input),
        isUrgent: this.checkUrgency(input)
      };
    }

    // WHERE questions
    if (/^(where|dónde|où|wo|dove|onde|где)/i.test(input)) {
      return {
        primary: 'QUESTION_WHERE',
        sentiment: 'neutral',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: this.checkPoliteness(input),
        isUrgent: this.checkUrgency(input)
      };
    }

    // WHY questions
    if (/^(why|por\s+qué|pourquoi|warum|perché|por\s+que|почему)/i.test(input)) {
      return {
        primary: 'QUESTION_WHY',
        sentiment: 'neutral',
        intensity: 0.7, // Why questions often indicate concern
        topicReferences: this.extractTopics(input),
        isPolite: this.checkPoliteness(input),
        isUrgent: this.checkUrgency(input)
      };
    }

    // HOW questions
    if (/^(how|cómo|comment|wie|come|como|как)/i.test(input)) {
      return {
        primary: 'QUESTION_HOW',
        sentiment: 'neutral',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: this.checkPoliteness(input),
        isUrgent: this.checkUrgency(input)
      };
    }

    // WHEN questions
    if (/^(when|cuándo|quand|wann|quando|когда)/i.test(input)) {
      return {
        primary: 'QUESTION_WHEN',
        sentiment: 'neutral',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: this.checkPoliteness(input),
        isUrgent: this.checkUrgency(input)
      };
    }

    // Generic questions (ends with ?)
    if (input.endsWith('?')) {
      return {
        primary: 'QUESTION_WHAT', // Generic question
        sentiment: 'neutral',
        intensity: 0.5,
        topicReferences: this.extractTopics(input),
        isPolite: this.checkPoliteness(input),
        isUrgent: this.checkUrgency(input)
      };
    }

    return null;
  }

  private checkEmotional(input: string): DiscourseAnalysis | null {
    // COMPLIMENTS
    const complimentPatterns = [
      /(you're|you\s+are|you\s+look)\s+(amazing|wonderful|beautiful|great|fantastic|awesome|incredible)/,
      /(that's|that\s+is|this\s+is)\s+(beautiful|amazing|wonderful|fantastic|great)/,
      /i\s+love\s+(you|your|this|that)/,
      /you're\s+the\s+best/,
      /(nice|good|great|excellent)\s+(job|work)/,
    ];

    if (this.matchesAny(input, complimentPatterns)) {
      return {
        primary: 'COMPLIMENT',
        sentiment: 'positive',
        intensity: 0.8,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // INSULTS
    const insultPatterns = [
      /(you're|you\s+are)\s+(stupid|idiot|dumb|pathetic|terrible|awful|useless)/,
      /i\s+hate\s+(you|this|that)/,
      /(fuck|shit|damn|hell)\s+(you|this|that)/,
      /shut\s+up/,
      /leave\s+me\s+alone/,
      /you\s+suck/,
    ];

    if (this.matchesAny(input, insultPatterns)) {
      return {
        primary: 'INSULT',
        sentiment: 'negative',
        intensity: 0.9,
        topicReferences: [],
        isPolite: false,
        isUrgent: this.checkUrgency(input)
      };
    }

    // THANKS
    const thanksPatterns = [
      /^(thank\s+you|thanks|ty|thx|gracias|merci|danke|grazie|obrigado)/,
      /i\s+appreciate/,
    ];

    if (this.matchesAny(input, thanksPatterns)) {
      return {
        primary: 'THANKS',
        sentiment: 'positive',
        intensity: 0.7,
        topicReferences: [],
        isPolite: true,
        isUrgent: false
      };
    }

    // APOLOGY
    const apologyPatterns = [
      /^(sorry|my\s+bad|i'm\s+sorry|i\s+apologize|perdón|pardon|entschuldigung)/,
      /forgive\s+me/,
      /didn't\s+mean/,
    ];

    if (this.matchesAny(input, apologyPatterns)) {
      return {
        primary: 'APOLOGY',
        sentiment: 'neutral',
        intensity: 0.7,
        topicReferences: [],
        isPolite: true,
        isUrgent: false
      };
    }

    // COMPLAINT
    const complaintPatterns = [
      /(this|that)\s+is\s+(terrible|awful|horrible|bad)/,
      /i\s+hate\s+this/,
      /this\s+sucks/,
      /not\s+fair/,
    ];

    if (this.matchesAny(input, complaintPatterns)) {
      return {
        primary: 'COMPLAINT',
        sentiment: 'negative',
        intensity: 0.7,
        topicReferences: this.extractTopics(input),
        isPolite: false,
        isUrgent: false
      };
    }

    // EXCITEMENT
    const excitementPatterns = [
      /^(wow|amazing|incredible|awesome|fantastic)/i,
      /this\s+is\s+(amazing|incredible|awesome|fantastic)/,
      /!\s*$/,  // Ends with exclamation
      /so\s+(cool|great|awesome)/,
    ];

    if (this.matchesAny(input, excitementPatterns)) {
      return {
        primary: 'EXCITEMENT',
        sentiment: 'positive',
        intensity: 0.9,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // FRUSTRATION
    const frustrationPatterns = [
      /(this|that)\s+is\s+(so|really)\s+(annoying|frustrating)/,
      /i\s+(can't|cannot)\s+believe/,
      /ugh/,
      /come\s+on/,
      /seriously\?/,
    ];

    if (this.matchesAny(input, frustrationPatterns)) {
      return {
        primary: 'FRUSTRATION',
        sentiment: 'negative',
        intensity: 0.7,
        topicReferences: this.extractTopics(input),
        isPolite: false,
        isUrgent: false
      };
    }

    // CONCERN
    const concernPatterns = [
      /i'm\s+(worried|concerned)\s+about/,
      /are\s+you\s+(okay|alright|fine)/,
      /is\s+(everything|it)\s+(okay|alright)/,
      /what's\s+wrong/,
      /be\s+careful/,
    ];

    if (this.matchesAny(input, concernPatterns)) {
      return {
        primary: 'CONCERN',
        sentiment: 'neutral',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // SYMPATHY
    const sympathyPatterns = [
      /i\s+understand\s+(how\s+you\s+feel|your)/,
      /i'm\s+sorry\s+(for|about)\s+your/,
      /that\s+must\s+be\s+(hard|difficult|tough)/,
      /i\s+feel\s+(for|with)\s+you/,
    ];

    if (this.matchesAny(input, sympathyPatterns)) {
      return {
        primary: 'SYMPATHY',
        sentiment: 'positive',
        intensity: 0.7,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // ENCOURAGEMENT
    const encouragementPatterns = [
      /you\s+can\s+do\s+it/,
      /(don't|do\s+not)\s+give\s+up/,
      /keep\s+(going|trying)/,
      /(everything|it)\s+will\s+be\s+(okay|fine|alright)/,
      /i\s+believe\s+in\s+you/,
    ];

    if (this.matchesAny(input, encouragementPatterns)) {
      return {
        primary: 'ENCOURAGEMENT',
        sentiment: 'positive',
        intensity: 0.8,
        topicReferences: [],
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private checkComplexSocial(normalized: string, original: string): DiscourseAnalysis | null {
    // SARCASM - Positive words with negative intent (needs context clues)
    const sarcasmPatterns = [
      /oh,?\s+(great|wonderful|fantastic|perfect|brilliant)/,
      /just\s+(great|wonderful|fantastic|perfect)/,
      /(yeah|sure),?\s+right/,
      /that'?s\s+just\s+(great|wonderful|brilliant)/,
      /how\s+(lovely|nice|wonderful)/,  // Often sarcastic when standalone
      /real(ly)?\s+(smart|clever|brilliant)/,  // "Real smart" = sarcastic
    ];

    if (this.matchesAny(normalized, sarcasmPatterns)) {
      return {
        primary: 'SARCASM',
        sentiment: 'negative',  // Negative intent despite positive words
        intensity: 0.7,
        topicReferences: this.extractTopics(normalized),
        isPolite: false,
        isUrgent: false
      };
    }

    // FLIRTING - Romantic/attraction expressions
    const flirtingPatterns = [
      /you\s+look\s+(nice|beautiful|handsome|pretty|good|amazing|stunning)/,
      /is\s+it\s+(hot|warm)\s+in\s+here/,
      /did\s+it\s+hurt\s+when/,  // Classic pickup line
      /your\s+(eyes|smile|hair)/,
      /you\s+have\s+(beautiful|gorgeous|lovely|nice)\s+(eyes|smile|hair)/,
      /are\s+you\s+(single|available|seeing\s+anyone)/,
      /i\s+like\s+your\s+(style|look|outfit)/,
      /you're\s+(cute|adorable|charming)/,
      /come\s+here\s+often/,
    ];

    if (this.matchesAny(normalized, flirtingPatterns)) {
      return {
        primary: 'FLIRTING',
        sentiment: 'positive',
        intensity: 0.7,
        topicReferences: this.extractTopics(normalized),
        isPolite: true,
        isUrgent: false
      };
    }

    // BRAGGING - Self-aggrandizement
    const braggingPatterns = [
      /i'm\s+(the\s+best|amazing|incredible|unbeatable)/,
      /nobody\s+(can|does|is)\s+(better|stronger|smarter)/,
      /i\s+(never|always)\s+(win|succeed|beat)/,
      /i'm\s+better\s+than/,
      /watch\s+and\s+learn/,
      /that's\s+why\s+i'm\s+the\s+best/,
      /of\s+course\s+i\s+(can|did|will)/,  // Arrogant confidence
      /easy\s+for\s+me/,
      /i\s+could\s+do\s+that\s+in\s+my\s+sleep/,
    ];

    if (this.matchesAny(normalized, braggingPatterns)) {
      return {
        primary: 'BRAGGING',
        sentiment: 'neutral',  // Not necessarily negative, just boastful
        intensity: 0.8,
        topicReferences: this.extractTopics(normalized),
        isPolite: false,
        isUrgent: false
      };
    }

    // TEASING - Light-hearted mockery
    const teasingPatterns = [
      /look\s+who\s+(finally|decided\s+to)/,
      /took\s+you\s+long\s+enough/,
      /about\s+time/,
      /sleeping\s+beauty\s+(awake|woke\s+up)/,
      /well,?\s+well,?\s+well/,
      /fancy\s+(seeing|meeting)\s+you/,
      /look\s+what\s+the\s+cat\s+dragged\s+in/,
    ];

    if (this.matchesAny(normalized, teasingPatterns)) {
      return {
        primary: 'TEASING',
        sentiment: 'neutral',  // Playful, not necessarily mean
        intensity: 0.6,
        topicReferences: this.extractTopics(normalized),
        isPolite: false,
        isUrgent: false
      };
    }

    // PLEADING - Desperate requests
    const pleadingPatterns = [
      /please,?\s+(please|i\s+beg)/,
      /i'm\s+begging\s+you/,
      /i\s+(need|must\s+have)\s+this/,
      /you\s+have\s+to\s+help/,
      /i'll\s+do\s+anything/,
      /just\s+this\s+once/,
      /i\s+really\s+need/,
      /have\s+mercy/,
      /give\s+me\s+(a\s+chance|another\s+chance)/,
    ];

    if (this.matchesAny(normalized, pleadingPatterns)) {
      return {
        primary: 'PLEADING',
        sentiment: 'neutral',
        intensity: 0.9,  // Very intense emotion
        topicReferences: this.extractTopics(normalized),
        isPolite: true,  // Desperation is polite
        isUrgent: true
      };
    }

    // DISMISSAL - Disinterest/rejection
    const dismissalPatterns = [
      /^(whatever|whatev)/,
      /i\s+don't\s+care/,
      /^(as\s+if|yeah\s+right)/,
      /who\s+cares/,
      /so\s+what/,
      /big\s+deal/,
      /like\s+i\s+care/,
      /not\s+interested/,
      /leave\s+me\s+alone/,
      /go\s+away/,
      /^meh\b/,
    ];

    if (this.matchesAny(normalized, dismissalPatterns)) {
      return {
        primary: 'DISMISSAL',
        sentiment: 'negative',
        intensity: 0.6,
        topicReferences: [],
        isPolite: false,
        isUrgent: false
      };
    }

    // SURPRISE - Unexpected reactions
    const surprisePatterns = [
      /^(what|wha|huh)\?!?$/,
      /no\s+way!?/,
      /you're\s+kidding!?/,
      /are\s+you\s+serious\?!?/,
      /i\s+can't\s+believe/,
      /really\?!/,
      /that's\s+(impossible|unbelievable|incredible)!?/,
      /get\s+out!?/,  // Expression of disbelief
      /shut\s+up!?$/,  // Can be surprise, not just insult
      /oh\s+my\s+(god|gosh|goodness)!?/,
    ];

    if (this.matchesAny(normalized, surprisePatterns)) {
      return {
        primary: 'SURPRISE',
        sentiment: 'neutral',  // Can be positive or negative surprise
        intensity: 0.8,
        topicReferences: this.extractTopics(normalized),
        isPolite: true,
        isUrgent: false
      };
    }

    // RELIEF - Tension release
    const reliefPatterns = [
      /thank\s+(god|goodness|heavens)/,
      /^phew!?$/,
      /finally!?$/,
      /at\s+last!?/,
      /about\s+time!?/,
      /that's\s+a\s+relief/,
      /i'm\s+(so\s+)?relieved/,
      /we're\s+safe/,
      /it's\s+(finally\s+)?over/,
      /made\s+it!?/,
    ];

    if (this.matchesAny(normalized, reliefPatterns)) {
      return {
        primary: 'RELIEF',
        sentiment: 'positive',
        intensity: 0.7,
        topicReferences: this.extractTopics(normalized),
        isPolite: true,
        isUrgent: false
      };
    }

    // CURIOSITY - Inquisitive interest
    const curiosityPatterns = [
      /i\s+wonder\s+(if|what|why|how|when|where)/,
      /^interesting\.?$/,
      /tell\s+me\s+more/,
      /i'm\s+(curious|intrigued)/,
      /how\s+(fascinating|interesting)/,
      /what's\s+that\s+about/,
      /i'd\s+like\s+to\s+know/,
      /makes\s+me\s+(curious|wonder)/,
      /want\s+to\s+learn/,
      /show\s+me/,
    ];

    if (this.matchesAny(normalized, curiosityPatterns)) {
      return {
        primary: 'CURIOSITY',
        sentiment: 'positive',
        intensity: 0.6,
        topicReferences: this.extractTopics(normalized),
        isPolite: true,
        isUrgent: false
      };
    }

    // NOSTALGIA - Reminiscing about the past
    const nostalgiaPatterns = [
      /(those|the\s+good\s+old)\s+were\s+the\s+days/,
      /i\s+miss\s+(those|the\s+old)/,
      /back\s+in\s+(my|the)\s+day/,
      /remember\s+when\s+we/,
      /things\s+were\s+(better|different|simpler)/,
      /i\s+wish\s+(things|it)\s+were\s+like/,
      /takes\s+me\s+back/,
      /reminds\s+me\s+of/,
      /used\s+to\s+be/,
      /ah,?\s+memories/,
    ];

    if (this.matchesAny(normalized, nostalgiaPatterns)) {
      return {
        primary: 'NOSTALGIA',
        sentiment: 'neutral',  // Bittersweet
        intensity: 0.6,
        topicReferences: this.extractTopics(normalized),
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private checkStance(input: string): DiscourseAnalysis | null {
    // AGREEMENT
    const agreementPatterns = [
      /^(yes|yeah|yep|yup|sure|okay|ok|fine|right|exactly|absolutely|definitely)/,
      /i\s+agree/,
      /(that's|you're)\s+(right|correct)/,
      /^(sí|oui|ja|sim|да)/,
    ];

    if (this.matchesAny(input, agreementPatterns)) {
      return {
        primary: 'AGREEMENT',
        sentiment: 'positive',
        intensity: 0.6,
        topicReferences: [],
        isPolite: true,
        isUrgent: false
      };
    }

    // DISAGREEMENT
    const disagreementPatterns = [
      /^(no|nope|nah|nay)/,
      /i\s+disagree/,
      /(that's|you're)\s+(wrong|incorrect)/,
      /not\s+true/,
      /^(no|non|nein|não|нет)/,
    ];

    if (this.matchesAny(input, disagreementPatterns)) {
      return {
        primary: 'DISAGREEMENT',
        sentiment: 'negative',
        intensity: 0.6,
        topicReferences: [],
        isPolite: this.checkPoliteness(input),
        isUrgent: false
      };
    }

    // CONFIRMATION
    const confirmationPatterns = [
      /really\?/,
      /are\s+you\s+sure/,
      /you\s+mean/,
      /seriously\?/,
    ];

    if (this.matchesAny(input, confirmationPatterns)) {
      return {
        primary: 'CONFIRMATION',
        sentiment: 'neutral',
        intensity: 0.5,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private checkDirectives(input: string): DiscourseAnalysis | null {
    // PROHIBITION (strong negative directive)
    const prohibitionPatterns = [
      /^(don't|do\s+not|never)\s+(do|say|go|touch)/,
      /^stop/,
      /^no\s+way/,
      /forbidden/,
    ];

    if (this.matchesAny(input, prohibitionPatterns)) {
      return {
        primary: 'PROHIBITION',
        sentiment: 'negative',
        intensity: 0.8,
        topicReferences: this.extractTopics(input),
        isPolite: false,
        isUrgent: true
      };
    }

    // PERMISSION (asking for approval)
    const permissionPatterns = [
      /^(may|can|could)\s+i/,
      /is\s+it\s+(okay|alright|fine)\s+if/,
      /do\s+you\s+mind\s+if/,
    ];

    if (this.matchesAny(input, permissionPatterns)) {
      return {
        primary: 'PERMISSION',
        sentiment: 'neutral',
        intensity: 0.5,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // INVITATION (asking to join)
    const invitationPatterns = [
      /^(come|join|follow)\s+(with|me|us)/,
      /would\s+you\s+(like|want)\s+to\s+(come|join)/,
      /let's\s+go/,
    ];

    if (this.matchesAny(input, invitationPatterns)) {
      return {
        primary: 'INVITATION',
        sentiment: 'positive',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // REQUESTS (polite)
    const requestPatterns = [
      /^(can|could|would|may)\s+(you|i)/,
      /^please/,
      /would\s+you\s+mind/,
    ];

    if (this.matchesAny(input, requestPatterns)) {
      return {
        primary: 'REQUEST',
        sentiment: 'neutral',
        intensity: 0.5,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: this.checkUrgency(input)
      };
    }

    // COMMANDS (direct)
    const commandPatterns = [
      /^(do|give|show|tell|move|stop|start|help|wait)\s+(me|it|that|this)/,
      /!\s*$/,  // Ends with exclamation mark
    ];

    if (this.matchesAny(input, commandPatterns)) {
      return {
        primary: 'COMMAND',
        sentiment: 'neutral',
        intensity: 0.7,
        topicReferences: this.extractTopics(input),
        isPolite: this.checkPoliteness(input),
        isUrgent: this.checkUrgency(input)
      };
    }

    // SUGGESTIONS
    const suggestionPatterns = [
      /^(maybe|perhaps|what\s+if|how\s+about)/,
      /(you|we)\s+could/,
      /(you|we)\s+should/,
    ];

    if (this.matchesAny(input, suggestionPatterns)) {
      return {
        primary: 'SUGGESTION',
        sentiment: 'neutral',
        intensity: 0.5,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // OFFERS
    const offerPatterns = [
      /^(i\s+can|let\s+me|i'll|i\s+will)\s+(help|do|give|show)/,
      /do\s+you\s+(want|need)/,
    ];

    if (this.matchesAny(input, offerPatterns)) {
      return {
        primary: 'OFFER',
        sentiment: 'positive',
        intensity: 0.6,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private checkTopicManagement(input: string): DiscourseAnalysis | null {
    // TOPIC CHANGE
    const topicChangePatterns = [
      /^(anyway|anyways|so|well)/,
      /speaking\s+of/,
      /by\s+the\s+way/,
      /on\s+another\s+note/,
    ];

    if (this.matchesAny(input, topicChangePatterns)) {
      return {
        primary: 'TOPIC_CHANGE',
        sentiment: 'neutral',
        intensity: 0.4,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // TOPIC CALLBACK
    const callbackPatterns = [
      /^but\s+what\s+about/,
      /going\s+back\s+to/,
      /earlier\s+you\s+said/,
      /remember\s+when/,
    ];

    if (this.matchesAny(input, callbackPatterns)) {
      return {
        primary: 'TOPIC_CALLBACK',
        sentiment: 'neutral',
        intensity: 0.5,
        topicReferences: this.extractTopics(input),
        isPolite: true,
        isUrgent: false
      };
    }

    // CLARIFICATION
    const clarificationPatterns = [
      /what\s+do\s+you\s+mean/,
      /i\s+don't\s+understand/,
      /can\s+you\s+explain/,
      /huh\?/,
    ];

    if (this.matchesAny(input, clarificationPatterns)) {
      return {
        primary: 'CLARIFICATION',
        sentiment: 'neutral',
        intensity: 0.6,
        topicReferences: [],
        isPolite: true,
        isUrgent: false
      };
    }

    return null;
  }

  private matchesAny(input: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(input));
  }

  private checkPoliteness(input: string): boolean {
    const politeWords = ['please', 'kindly', 'would', 'could', 'may', 'por favor', 's\'il vous plaît', 'bitte'];
    const lower = input.toLowerCase();
    return politeWords.some(word => lower.includes(word));
  }

  private checkUrgency(input: string): boolean {
    const urgentWords = ['now', 'quick', 'hurry', 'fast', 'immediately', 'ahora', 'rápido', 'vite'];
    const lower = input.toLowerCase();
    return urgentWords.some(word => lower.includes(word)) || input.includes('!');
  }

  private isOpinion(input: string): boolean {
    const opinionMarkers = ['i think', 'i believe', 'in my opinion', 'seems', 'probably', 'maybe'];
    const lower = input.toLowerCase();
    return opinionMarkers.some(marker => lower.includes(marker));
  }

  private detectSentiment(input: string): 'positive' | 'negative' | 'neutral' {
    const positive = [
      'love', 'like', 'great', 'wonderful', 'amazing', 'beautiful', 'happy',
      'good', 'fantastic', 'awesome', 'excellent', 'perfect', 'nice'
    ];

    const negative = [
      'hate', 'dislike', 'terrible', 'awful', 'bad', 'horrible', 'sad',
      'angry', 'stupid', 'ugly', 'wrong', 'disgusting', 'pathetic'
    ];

    const lower = input.toLowerCase();
    const hasPositive = positive.some(w => lower.includes(w));
    const hasNegative = negative.some(w => lower.includes(w));

    if (hasNegative) return 'negative';
    if (hasPositive) return 'positive';
    return 'neutral';
  }

  private extractTopics(input: string): string[] {
    // Common topic keywords for game contexts
    const topics = [
      'treasure', 'dragon', 'magic', 'spell', 'key', 'door', 'map',
      'wizard', 'merchant', 'guard', 'quest', 'journey', 'battle',
      'sword', 'potion', 'scroll', 'gold', 'crystal', 'artifact'
    ];

    const lower = input.toLowerCase();
    return topics.filter(topic => lower.includes(topic));
  }
}
