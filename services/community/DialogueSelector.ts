/**
 * DialogueSelector - State-driven dialogue selection (Tier 10)
 *
 * Selects NPC dialogue based on:
 * - Relationship with player
 * - Current mood
 * - Knowledge of world facts
 * - Interaction history
 *
 * Creates personalized, contextually-relevant conversations that feel alive.
 */

import { NPCDefinition, NPCPersona, NPCMood } from '../../types/ContentPack';
import { Language } from '../../types';
import { WorldState } from './WorldState';

/**
 * Context for dialogue selection
 */
export interface DialogueContext {
  npcId: string;
  playerLocation: string;
  language: Language;
  recentFacts?: string[];      // Facts that happened recently
}

/**
 * Dialogue with metadata
 */
export interface DialogueResponse {
  text: string;                // The actual dialogue text
  mood: NPCMood;               // NPC's current mood
  relationshipLevel: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'close_friend';
  references?: string[];       // World facts referenced in dialogue
}

/**
 * DialogueSelector - Chooses appropriate dialogue based on NPC state
 */
export class DialogueSelector {
  private worldState: WorldState;

  constructor(worldState: WorldState) {
    this.worldState = worldState;
  }

  /**
   * Select greeting dialogue based on NPC persona
   */
  selectGreeting(npc: NPCDefinition, language: Language): DialogueResponse {
    if (!npc.persona) {
      return this.getDefaultGreeting(npc, language);
    }

    const persona = npc.persona;
    const relationship = this.getRelationshipLevel(persona.relationshipWithPlayer);
    const npcName = npc.name[language] || npc.id;

    let text = '';

    // First-time meeting vs subsequent meetings
    if (persona.timesSpokenTo === 0) {
      text = this.getFirstMeetingGreeting(npcName, persona.mood, language);
    } else {
      text = this.getRegularGreeting(npcName, relationship, persona.mood, language);
    }

    // Add fact-based context if NPC knows something relevant
    const factReference = this.selectRelevantFact(persona);
    if (factReference) {
      const factText = this.generateFactComment(factReference, language);
      text += ` ${factText}`;
    }

    return {
      text,
      mood: persona.mood,
      relationshipLevel: relationship,
      references: factReference ? [factReference] : undefined
    };
  }

  /**
   * Get relationship level category
   */
  private getRelationshipLevel(relationship: number): 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'close_friend' {
    if (relationship >= 70) return 'close_friend';
    if (relationship >= 30) return 'friendly';
    if (relationship >= -30) return 'neutral';
    if (relationship >= -70) return 'unfriendly';
    return 'hostile';
  }

  /**
   * Get first meeting greeting
   */
  private getFirstMeetingGreeting(npcName: string, mood: NPCMood, language: Language): string {
    const greetings: Record<NPCMood, Record<Language, string>> = {
      happy: {
        [Language.ENGLISH]: `Hello! I'm ${npcName}. Nice to meet you!`,
        [Language.SPANISH]: `¡Hola! Soy ${npcName}. ¡Encantado de conocerte!`,
        [Language.FRENCH]: `Bonjour ! Je suis ${npcName}. Enchanté !`,
        [Language.GERMAN]: `Hallo! Ich bin ${npcName}. Schön dich kennenzulernen!`,
        [Language.ITALIAN]: `Ciao! Sono ${npcName}. Piacere di conoscerti!`,
        [Language.JAPANESE]: `こんにちは！${npcName}です。よろしく！`,
        [Language.MANDARIN]: `你好！我是${npcName}。很高兴认识你！`,
        [Language.RUSSIAN]: `Привет! Я ${npcName}. Рад познакомиться!`,
        [Language.PORTUGUESE]: `Olá! Sou ${npcName}. Prazer em conhecê-lo!`,
        [Language.UKRAINIAN]: `Привіт! Я ${npcName}. Радий познайомитися!`,
        [Language.POLISH]: `Cześć! Jestem ${npcName}. Miło cię poznać!`,
        [Language.CZECH]: `Ahoj! Jsem ${npcName}. Těší mě!`
      },
      neutral: {
        [Language.ENGLISH]: `Greetings. I am ${npcName}.`,
        [Language.SPANISH]: `Saludos. Soy ${npcName}.`,
        [Language.FRENCH]: `Salutations. Je suis ${npcName}.`,
        [Language.GERMAN]: `Grüße. Ich bin ${npcName}.`,
        [Language.ITALIAN]: `Salve. Sono ${npcName}.`,
        [Language.JAPANESE]: `こんにちは。${npcName}と申します。`,
        [Language.MANDARIN]: `你好。我是${npcName}。`,
        [Language.RUSSIAN]: `Приветствую. Я ${npcName}.`,
        [Language.PORTUGUESE]: `Saudações. Sou ${npcName}.`,
        [Language.UKRAINIAN]: `Вітання. Я ${npcName}.`,
        [Language.POLISH]: `Witam. Jestem ${npcName}.`,
        [Language.CZECH]: `Pozdravy. Jsem ${npcName}.`
      },
      suspicious: {
        [Language.ENGLISH]: `Who are you? I'm ${npcName}... but I don't know you.`,
        [Language.SPANISH]: `¿Quién eres? Soy ${npcName}... pero no te conozco.`,
        [Language.FRENCH]: `Qui êtes-vous ? Je suis ${npcName}... mais je ne vous connais pas.`,
        [Language.GERMAN]: `Wer bist du? Ich bin ${npcName}... aber ich kenne dich nicht.`,
        [Language.ITALIAN]: `Chi sei? Sono ${npcName}... ma non ti conosco.`,
        [Language.JAPANESE]: `誰だ？私は${npcName}だが...君のことは知らない。`,
        [Language.MANDARIN]: `你是谁？我是${npcName}...但我不认识你。`,
        [Language.RUSSIAN]: `Кто ты? Я ${npcName}... но я тебя не знаю.`,
        [Language.PORTUGUESE]: `Quem é você? Sou ${npcName}... mas não te conheço.`,
        [Language.UKRAINIAN]: `Хто ти? Я ${npcName}... але я тебе не знаю.`,
        [Language.POLISH]: `Kto jesteś? Jestem ${npcName}... ale cię nie znam.`,
        [Language.CZECH]: `Kdo jsi? Jsem ${npcName}... ale neznám tě.`
      },
      angry: {
        [Language.ENGLISH]: `What do you want? I'm ${npcName}.`,
        [Language.SPANISH]: `¿Qué quieres? Soy ${npcName}.`,
        [Language.FRENCH]: `Que voulez-vous ? Je suis ${npcName}.`,
        [Language.GERMAN]: `Was willst du? Ich bin ${npcName}.`,
        [Language.ITALIAN]: `Cosa vuoi? Sono ${npcName}.`,
        [Language.JAPANESE]: `何の用だ？${npcName}だ。`,
        [Language.MANDARIN]: `你想要什么？我是${npcName}。`,
        [Language.RUSSIAN]: `Чего ты хочешь? Я ${npcName}.`,
        [Language.PORTUGUESE]: `O que você quer? Sou ${npcName}.`,
        [Language.UKRAINIAN]: `Чого ти хочеш? Я ${npcName}.`,
        [Language.POLISH]: `Czego chcesz? Jestem ${npcName}.`,
        [Language.CZECH]: `Co chceš? Jsem ${npcName}.`
      },
      sad: {
        [Language.ENGLISH]: `...Hello. I'm ${npcName}.`,
        [Language.SPANISH]: `...Hola. Soy ${npcName}.`,
        [Language.FRENCH]: `...Bonjour. Je suis ${npcName}.`,
        [Language.GERMAN]: `...Hallo. Ich bin ${npcName}.`,
        [Language.ITALIAN]: `...Ciao. Sono ${npcName}.`,
        [Language.JAPANESE]: `...こんにちは。${npcName}です。`,
        [Language.MANDARIN]: `...你好。我是${npcName}。`,
        [Language.RUSSIAN]: `...Привет. Я ${npcName}.`,
        [Language.PORTUGUESE]: `...Olá. Sou ${npcName}.`,
        [Language.UKRAINIAN]: `...Привіт. Я ${npcName}.`,
        [Language.POLISH]: `...Cześć. Jestem ${npcName}.`,
        [Language.CZECH]: `...Ahoj. Jsem ${npcName}.`
      },
      fearful: {
        [Language.ENGLISH]: `P-Please don't hurt me! I'm just ${npcName}...`,
        [Language.SPANISH]: `¡P-Por favor no me hagas daño! Solo soy ${npcName}...`,
        [Language.FRENCH]: `S-S'il vous plaît ne me faites pas de mal ! Je suis juste ${npcName}...`,
        [Language.GERMAN]: `B-Bitte tu mir nichts! Ich bin nur ${npcName}...`,
        [Language.ITALIAN]: `P-Per favore non farmi del male! Sono solo ${npcName}...`,
        [Language.JAPANESE]: `お、お願い、傷つけないで！私はただの${npcName}です...`,
        [Language.MANDARIN]: `请、请不要伤害我！我只是${npcName}...`,
        [Language.RUSSIAN]: `П-Пожалуйста, не делай мне больно! Я просто ${npcName}...`,
        [Language.PORTUGUESE]: `P-Por favor não me magoe! Sou apenas ${npcName}...`,
        [Language.UKRAINIAN]: `Б-Благаю, не роби мені боляче! Я лише ${npcName}...`,
        [Language.POLISH]: `P-Proszę, nie skrzywdź mnie! Jestem tylko ${npcName}...`,
        [Language.CZECH]: `P-Prosím, neubližuj mi! Jsem jen ${npcName}...`
      },
      excited: {
        [Language.ENGLISH]: `Oh wow, a visitor! I'm ${npcName}! This is so exciting!`,
        [Language.SPANISH]: `¡Oh vaya, un visitante! ¡Soy ${npcName}! ¡Esto es tan emocionante!`,
        [Language.FRENCH]: `Oh wow, un visiteur ! Je suis ${npcName} ! C'est si excitant !`,
        [Language.GERMAN]: `Oh wow, ein Besucher! Ich bin ${npcName}! Das ist so aufregend!`,
        [Language.ITALIAN]: `Oh wow, un visitatore! Sono ${npcName}! Questo è così eccitante!`,
        [Language.JAPANESE]: `おお、訪問者だ！${npcName}です！すごく興奮する！`,
        [Language.MANDARIN]: `哇，有访客！我是${npcName}！太激动了！`,
        [Language.RUSSIAN]: `О вау, посетитель! Я ${npcName}! Это так волнующе!`,
        [Language.PORTUGUESE]: `Oh uau, um visitante! Sou ${npcName}! Isso é tão emocionante!`,
        [Language.UKRAINIAN]: `О вау, відвідувач! Я ${npcName}! Це так хвилююче!`,
        [Language.POLISH]: `O wow, gość! Jestem ${npcName}! To takie ekscytujące!`,
        [Language.CZECH]: `Ó wow, návštěvník! Jsem ${npcName}! To je tak vzrušující!`
      }
    };

    return greetings[mood][language] || greetings[mood][Language.ENGLISH];
  }

  /**
   * Get regular greeting for repeat meetings
   */
  private getRegularGreeting(
    npcName: string,
    relationship: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'close_friend',
    mood: NPCMood,
    language: Language
  ): string {
    // Relationship dominates mood for regular greetings
    const greetings: Record<string, Record<Language, string>> = {
      'close_friend': {
        [Language.ENGLISH]: `${npcName}: My friend! It's wonderful to see you again!`,
        [Language.SPANISH]: `${npcName}: ¡Mi amigo! ¡Es maravilloso verte de nuevo!`,
        [Language.FRENCH]: `${npcName}: Mon ami ! C'est merveilleux de vous revoir !`,
        [Language.GERMAN]: `${npcName}: Mein Freund! Es ist wunderbar, dich wiederzusehen!`,
        [Language.ITALIAN]: `${npcName}: Amico mio! È meraviglioso rivederti!`,
        [Language.JAPANESE]: `${npcName}: 友よ！また会えて嬉しいよ！`,
        [Language.MANDARIN]: `${npcName}: 我的朋友！很高兴再次见到你！`,
        [Language.RUSSIAN]: `${npcName}: Друг мой! Как чудесно снова видеть тебя!`,
        [Language.PORTUGUESE]: `${npcName}: Meu amigo! É maravilhoso ver-te novamente!`,
        [Language.UKRAINIAN]: `${npcName}: Друже! Як чудово знову бачити тебе!`,
        [Language.POLISH]: `${npcName}: Mój przyjacielu! Wspaniale cię znowu widzieć!`,
        [Language.CZECH]: `${npcName}: Můj příteli! Je skvělé tě zase vidět!`
      },
      'friendly': {
        [Language.ENGLISH]: `${npcName}: Hello again! Good to see you.`,
        [Language.SPANISH]: `${npcName}: ¡Hola de nuevo! Me alegro de verte.`,
        [Language.FRENCH]: `${npcName}: Bonjour encore ! Content de vous voir.`,
        [Language.GERMAN]: `${npcName}: Hallo nochmal! Schön dich zu sehen.`,
        [Language.ITALIAN]: `${npcName}: Ciao di nuovo! Bello vederti.`,
        [Language.JAPANESE]: `${npcName}: またね！会えて嬉しいよ。`,
        [Language.MANDARIN]: `${npcName}: 又见面了！很高兴见到你。`,
        [Language.RUSSIAN]: `${npcName}: Снова привет! Рад видеть тебя.`,
        [Language.PORTUGUESE]: `${npcName}: Olá novamente! Bom ver-te.`,
        [Language.UKRAINIAN]: `${npcName}: Знову привіт! Радий бачити тебе.`,
        [Language.POLISH]: `${npcName}: Witaj ponownie! Dobrze cię widzieć.`,
        [Language.CZECH]: `${npcName}: Ahoj znovu! Dobře tě vidět.`
      },
      'neutral': {
        [Language.ENGLISH]: `${npcName}: Oh, it's you.`,
        [Language.SPANISH]: `${npcName}: Ah, eres tú.`,
        [Language.FRENCH]: `${npcName}: Oh, c'est vous.`,
        [Language.GERMAN]: `${npcName}: Oh, du bist es.`,
        [Language.ITALIAN]: `${npcName}: Oh, sei tu.`,
        [Language.JAPANESE]: `${npcName}: ああ、君か。`,
        [Language.MANDARIN]: `${npcName}: 哦，是你。`,
        [Language.RUSSIAN]: `${npcName}: О, это ты.`,
        [Language.PORTUGUESE]: `${npcName}: Oh, és tu.`,
        [Language.UKRAINIAN]: `${npcName}: О, це ти.`,
        [Language.POLISH]: `${npcName}: O, to ty.`,
        [Language.CZECH]: `${npcName}: Ach, to jsi ty.`
      },
      'unfriendly': {
        [Language.ENGLISH]: `${npcName}: You again...`,
        [Language.SPANISH]: `${npcName}: Tú otra vez...`,
        [Language.FRENCH]: `${npcName}: Encore vous...`,
        [Language.GERMAN]: `${npcName}: Schon wieder du...`,
        [Language.ITALIAN]: `${npcName}: Di nuovo tu...`,
        [Language.JAPANESE]: `${npcName}: また君か...`,
        [Language.MANDARIN]: `${npcName}: 又是你...`,
        [Language.RUSSIAN]: `${npcName}: Опять ты...`,
        [Language.PORTUGUESE]: `${npcName}: Tu outra vez...`,
        [Language.UKRAINIAN]: `${npcName}: Знову ти...`,
        [Language.POLISH]: `${npcName}: Znowu ty...`,
        [Language.CZECH]: `${npcName}: Zase ty...`
      },
      'hostile': {
        [Language.ENGLISH]: `${npcName}: Get away from me!`,
        [Language.SPANISH]: `${npcName}: ¡Aléjate de mí!`,
        [Language.FRENCH]: `${npcName}: Éloignez-vous de moi !`,
        [Language.GERMAN]: `${npcName}: Geh weg von mir!`,
        [Language.ITALIAN]: `${npcName}: Allontanati da me!`,
        [Language.JAPANESE]: `${npcName}: 近寄るな！`,
        [Language.MANDARIN]: `${npcName}: 离我远点！`,
        [Language.RUSSIAN]: `${npcName}: Отойди от меня!`,
        [Language.PORTUGUESE]: `${npcName}: Afasta-te de mim!`,
        [Language.UKRAINIAN]: `${npcName}: Відійди від мене!`,
        [Language.POLISH]: `${npcName}: Odejdź ode mnie!`,
        [Language.CZECH]: `${npcName}: Jdi ode mě pryč!`
      }
    };

    return greetings[relationship][language] || greetings[relationship][Language.ENGLISH];
  }

  /**
   * Select a relevant fact the NPC might comment on
   */
  private selectRelevantFact(persona: NPCPersona): string | null {
    if (persona.knowledge.size === 0) return null;

    // Get recent facts from knowledge
    const facts = Array.from(persona.knowledge);
    // Pick a random recent fact to comment on
    return facts.length > 0 ? facts[facts.length - 1] : null;
  }

  /**
   * Generate a comment about a world fact
   */
  private generateFactComment(factId: string, language: Language): string {
    const fact = this.worldState.getFact(factId);
    if (!fact) return '';

    // Use the localized description if available
    return fact.description[language] || fact.description[Language.ENGLISH] || '';
  }

  /**
   * Get default greeting for NPCs without persona
   */
  private getDefaultGreeting(npc: NPCDefinition, language: Language): DialogueResponse {
    const npcName = npc.name[language] || npc.id;
    const defaultGreetings: Record<Language, string> = {
      [Language.ENGLISH]: `${npcName}: Hello there.`,
      [Language.SPANISH]: `${npcName}: Hola.`,
      [Language.FRENCH]: `${npcName}: Bonjour.`,
      [Language.GERMAN]: `${npcName}: Hallo.`,
      [Language.ITALIAN]: `${npcName}: Ciao.`,
      [Language.JAPANESE]: `${npcName}: こんにちは。`,
      [Language.MANDARIN]: `${npcName}: 你好。`,
      [Language.RUSSIAN]: `${npcName}: Привет.`,
      [Language.PORTUGUESE]: `${npcName}: Olá.`,
      [Language.UKRAINIAN]: `${npcName}: Привіт.`,
      [Language.POLISH]: `${npcName}: Cześć.`,
      [Language.CZECH]: `${npcName}: Ahoj.`
    };

    return {
      text: defaultGreetings[language] || defaultGreetings[Language.ENGLISH],
      mood: 'neutral',
      relationshipLevel: 'neutral'
    };
  }
}
