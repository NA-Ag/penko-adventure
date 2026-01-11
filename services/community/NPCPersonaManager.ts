/**
 * NPCPersonaManager - Manages NPC internal states, goals, and behavior (Tier 10)
 *
 * This service makes NPCs feel alive by:
 * - Tracking relationships with the player
 * - Managing NPC goals and letting them act on them
 * - Updating NPC knowledge based on events they witness
 * - Simulating mood changes based on interactions
 *
 * Inspired by:
 * - The Sims (relationship dynamics, mood system)
 * - Oblivion (NPC schedules and goals)
 * - Crusader Kings (opinion modifiers, memory of events)
 */

import { NPCDefinition, NPCPersona, NPCGoal, NPCMemory, NPCMood } from '../../types/ContentPack';
import { Language } from '../../types';
import { WorldState, WorldFact } from './WorldState';

/**
 * Result of NPC attempting to advance a goal
 */
export interface NPCGoalResult {
  npcId: string;
  goal: NPCGoal;
  actionTaken: string;                     // What the NPC did
  narrative?: Record<Language, string>;    // Narrative to show player
  goalCompleted: boolean;
  newFacts?: string[];                     // New facts to add to WorldState
}

/**
 * NPCPersonaManager - Handles all NPC persona logic
 */
export class NPCPersonaManager {
  private npcs: Map<string, NPCDefinition> = new Map();
  private worldState: WorldState;

  constructor(worldState: WorldState) {
    this.worldState = worldState;
  }

  /**
   * Register an NPC with the manager
   */
  registerNPC(npc: NPCDefinition): void {
    // Initialize persona if not exists
    if (!npc.persona) {
      npc.persona = this.createDefaultPersona();
    }
    this.npcs.set(npc.id, npc);
    console.log(`[NPCPersonaManager] Registered NPC: ${npc.id}`);
  }

  /**
   * Register multiple NPCs
   */
  registerNPCs(npcs: NPCDefinition[]): void {
    npcs.forEach(npc => this.registerNPC(npc));
  }

  /**
   * Get an NPC by ID
   */
  getNPC(npcId: string): NPCDefinition | undefined {
    return this.npcs.get(npcId);
  }

  /**
   * Create default persona for new NPCs
   */
  private createDefaultPersona(): NPCPersona {
    return {
      relationshipWithPlayer: 0,     // Neutral
      mood: 'neutral',
      goals: [],
      knowledge: new Set<string>(),
      timesSpokenTo: 0,
      memorableEvents: []
    };
  }

  /**
   * Update NPC relationship with player
   */
  updateRelationship(
    npcId: string,
    change: number,
    reason: string,
    reasonLocalized: Record<Language, string>
  ): void {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.persona) return;

    const oldRelationship = npc.persona.relationshipWithPlayer;
    npc.persona.relationshipWithPlayer = Math.max(-100, Math.min(100, oldRelationship + change));

    // Record as memorable event if significant change
    if (Math.abs(change) >= 10) {
      const memory: NPCMemory = {
        turn: this.worldState.getCurrentTurn(),
        event: reason,
        relationshipImpact: change,
        description: reasonLocalized
      };
      npc.persona.memorableEvents.push(memory);

      // Keep only last 10 memorable events
      if (npc.persona.memorableEvents.length > 10) {
        npc.persona.memorableEvents.shift();
      }
    }

    console.log(`[NPCPersonaManager] ${npcId} relationship: ${oldRelationship} -> ${npc.persona.relationshipWithPlayer} (${reason})`);

    // Update mood based on relationship change
    this.updateMoodBasedOnRelationship(npcId, change);
  }

  /**
   * Update NPC mood based on relationship changes
   */
  private updateMoodBasedOnRelationship(npcId: string, relationshipChange: number): void {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.persona) return;

    const relationship = npc.persona.relationshipWithPlayer;

    // Large positive change -> happy
    if (relationshipChange >= 20) {
      npc.persona.mood = 'happy';
    }
    // Large negative change -> angry
    else if (relationshipChange <= -20) {
      npc.persona.mood = 'angry';
    }
    // Based on overall relationship
    else if (relationship >= 60) {
      npc.persona.mood = 'happy';
    } else if (relationship <= -60) {
      npc.persona.mood = 'angry';
    } else if (relationship <= -30) {
      npc.persona.mood = 'suspicious';
    } else {
      npc.persona.mood = 'neutral';
    }
  }

  /**
   * Teach an NPC about a world fact
   */
  teachFact(npcId: string, factId: string): void {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.persona) return;

    if (this.worldState.hasFact(factId)) {
      npc.persona.knowledge.add(factId);
      console.log(`[NPCPersonaManager] ${npcId} learned: ${factId}`);
    }
  }

  /**
   * NPCs at a location learn about public facts that happened there
   */
  spreadFactsAtLocation(locationId: string): void {
    const factsHere = this.worldState.getFactsByLocation(locationId);
    const npcsHere = Array.from(this.npcs.values()).filter(
      npc => npc.currentLocation === locationId
    );

    for (const fact of factsHere) {
      if (fact.isPublic) {
        for (const npc of npcsHere) {
          if (npc.persona) {
            npc.persona.knowledge.add(fact.id);
          }
        }
      }
    }
  }

  /**
   * Add a goal to an NPC
   */
  addGoal(npcId: string, goal: NPCGoal): void {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.persona) return;

    npc.persona.goals.push(goal);
    console.log(`[NPCPersonaManager] ${npcId} new goal: ${goal.type} - ${goal.description}`);
  }

  /**
   * Remove a completed or cancelled goal
   */
  removeGoal(npcId: string, goalId: string): void {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.persona) return;

    npc.persona.goals = npc.persona.goals.filter(g => g.id !== goalId);
  }

  /**
   * Get NPC's highest priority active goal
   */
  getHighestPriorityGoal(npcId: string): NPCGoal | null {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.persona || npc.persona.goals.length === 0) return null;

    return npc.persona.goals.reduce((highest, current) =>
      current.priority > highest.priority ? current : highest
    );
  }

  /**
   * NPC attempts to advance their highest priority goal
   * Returns null if no action taken, or result if action taken
   */
  advanceNPCGoal(
    npcId: string,
    playerInventory: string[],
    playerLocation: string
  ): NPCGoalResult | null {
    const npc = this.npcs.get(npcId);
    if (!npc || !npc.persona) return null;

    const goal = this.getHighestPriorityGoal(npcId);
    if (!goal) return null;

    // Check if NPC is in same location as player (needed for interaction)
    const canInteract = npc.currentLocation === playerLocation;

    let actionTaken = '';
    let narrative: Record<Language, string> | undefined;
    let goalCompleted = false;
    const newFacts: string[] = [];

    // Process different goal types
    switch (goal.type) {
      case 'acquire_item':
        // If player has the item the NPC wants and NPC can see them
        if (canInteract && goal.targetObjectId && playerInventory.includes(goal.targetObjectId)) {
          actionTaken = `attempt_trade_for_${goal.targetObjectId}`;
          narrative = this.generateAcquireItemNarrative(npc, goal);
          goal.progress = 50; // Player has item, halfway there
        }
        break;

      case 'find_object':
        // If player has the object, NPC might ask about it
        if (canInteract && goal.targetObjectId && playerInventory.includes(goal.targetObjectId)) {
          actionTaken = `ask_about_${goal.targetObjectId}`;
          narrative = this.generateFindObjectNarrative(npc, goal);
        }
        break;

      case 'teach_player':
        // If player is present and relationship is good enough
        if (canInteract && npc.persona.relationshipWithPlayer >= 20) {
          actionTaken = `offer_teaching`;
          narrative = this.generateTeachNarrative(npc, goal);
          goalCompleted = true;
        }
        break;

      case 'learn_fact':
        // Check if player knows a fact the NPC wants to learn
        if (canInteract && goal.completionCondition) {
          const desiredFactId = goal.completionCondition;
          if (this.worldState.hasFact(desiredFactId)) {
            actionTaken = `ask_about_${desiredFactId}`;
            narrative = this.generateLearnFactNarrative(npc, goal);
          }
        }
        break;

      case 'help_player':
        // Altruistic NPCs offer help when relationship is good
        if (canInteract && npc.persona.relationshipWithPlayer >= 30) {
          actionTaken = `offer_help`;
          narrative = this.generateHelpNarrative(npc, goal);
          goal.progress += 25;
        }
        break;
    }

    if (actionTaken) {
      return {
        npcId,
        goal,
        actionTaken,
        narrative,
        goalCompleted,
        newFacts
      };
    }

    return null;
  }

  /**
   * Generate narrative for NPC trying to acquire item
   */
  private generateAcquireItemNarrative(npc: NPCDefinition, goal: NPCGoal): Record<Language, string> {
    const npcName = npc.name[Language.ENGLISH] || npc.id;
    return {
      [Language.ENGLISH]: `${npcName} notices you have something they need. "Is that a ${goal.targetObjectId}? I've been looking for one!"`,
      [Language.SPANISH]: `${npcName} nota que tienes algo que necesitan. "¿Es eso un ${goal.targetObjectId}? ¡Lo he estado buscando!"`,
      [Language.FRENCH]: `${npcName} remarque que vous avez quelque chose dont ils ont besoin. "Est-ce un ${goal.targetObjectId} ? J'en cherche un !"`,
      [Language.GERMAN]: `${npcName} bemerkt, dass du etwas hast, das sie brauchen. "Ist das ein ${goal.targetObjectId}? Ich habe nach einem gesucht!"`,
      [Language.ITALIAN]: `${npcName} nota che hai qualcosa di cui hanno bisogno. "È un ${goal.targetObjectId}? Ne sto cercando uno!"`,
      [Language.JAPANESE]: `${npcName}はあなたが必要なものを持っていることに気づく。「それは${goal.targetObjectId}ですか？探していたんです！」`,
      [Language.MANDARIN]: `${npcName}注意到你有他们需要的东西。"那是${goal.targetObjectId}吗？我一直在找它！"`,
      [Language.RUSSIAN]: `${npcName} замечает, что у вас есть то, что им нужно. "Это ${goal.targetObjectId}? Я искал такой!"`,
      [Language.PORTUGUESE]: `${npcName} percebe que você tem algo de que precisam. "É um ${goal.targetObjectId}? Estive procurando por um!"`,
      [Language.UKRAINIAN]: `${npcName} помічає, що у вас є те, що їм потрібно. "Це ${goal.targetObjectId}? Я шукав такий!"`,
      [Language.POLISH]: `${npcName} zauważa, że masz coś, czego potrzebują. "To ${goal.targetObjectId}? Szukałem go!"`,
      [Language.CZECH]: `${npcName} si všimne, že máš něco, co potřebují. "Je to ${goal.targetObjectId}? Hledal jsem ho!"`
    };
  }

  /**
   * Generate narrative for NPC looking for object
   */
  private generateFindObjectNarrative(npc: NPCDefinition, goal: NPCGoal): Record<Language, string> {
    const npcName = npc.name[Language.ENGLISH] || npc.id;
    return {
      [Language.ENGLISH]: `${npcName} looks at you curiously. "Have you by chance seen a ${goal.targetObjectId}?"`,
      [Language.SPANISH]: `${npcName} te mira con curiosidad. "¿Has visto por casualidad un ${goal.targetObjectId}?"`,
      [Language.FRENCH]: `${npcName} vous regarde avec curiosité. "Avez-vous vu par hasard un ${goal.targetObjectId} ?"`,
      [Language.GERMAN]: `${npcName} schaut dich neugierig an. "Hast du zufällig ein ${goal.targetObjectId} gesehen?"`,
      [Language.ITALIAN]: `${npcName} ti guarda con curiosità. "Per caso hai visto un ${goal.targetObjectId}?"`,
      [Language.JAPANESE]: `${npcName}が興味深そうにあなたを見る。「${goal.targetObjectId}を見かけませんでしたか？」`,
      [Language.MANDARIN]: `${npcName}好奇地看着你。"你有没有看到${goal.targetObjectId}？"`,
      [Language.RUSSIAN]: `${npcName} смотрит на вас с любопытством. "Вы случайно не видели ${goal.targetObjectId}?"`,
      [Language.PORTUGUESE]: `${npcName} olha para você com curiosidade. "Por acaso você viu um ${goal.targetObjectId}?"`,
      [Language.UKRAINIAN]: `${npcName} дивиться на вас з цікавістю. "Ви випадково не бачили ${goal.targetObjectId}?"`,
      [Language.POLISH]: `${npcName} patrzy na ciebie z ciekawością. "Czy przypadkiem widziałeś ${goal.targetObjectId}?"`,
      [Language.CZECH]: `${npcName} se na tebe dívá zvědavě. "Neviděl jsi náhodou ${goal.targetObjectId}?"`
    };
  }

  /**
   * Generate narrative for NPC offering to teach
   */
  private generateTeachNarrative(npc: NPCDefinition, goal: NPCGoal): Record<Language, string> {
    const npcName = npc.name[Language.ENGLISH] || npc.id;
    return {
      [Language.ENGLISH]: `${npcName} smiles warmly. "I'd like to teach you something useful, if you're interested."`,
      [Language.SPANISH]: `${npcName} sonríe calurosamente. "Me gustaría enseñarte algo útil, si estás interesado."`,
      [Language.FRENCH]: `${npcName} sourit chaleureusement. "J'aimerais vous apprendre quelque chose d'utile, si vous êtes intéressé."`,
      [Language.GERMAN]: `${npcName} lächelt herzlich. "Ich würde dir gerne etwas Nützliches beibringen, wenn du interessiert bist."`,
      [Language.ITALIAN]: `${npcName} sorride calorosamente. "Vorrei insegnarti qualcosa di utile, se sei interessato."`,
      [Language.JAPANESE]: `${npcName}が温かく微笑む。「興味があれば、役に立つことを教えたいんだ。」`,
      [Language.MANDARIN]: `${npcName}温暖地微笑。"如果你感兴趣，我想教你一些有用的东西。"`,
      [Language.RUSSIAN]: `${npcName} тепло улыбается. "Я хотел бы научить вас чему-то полезному, если вам интересно."`,
      [Language.PORTUGUESE]: `${npcName} sorri calorosamente. "Gostaria de te ensinar algo útil, se estiveres interessado."`,
      [Language.UKRAINIAN]: `${npcName} тепло посміхається. "Я хотів би навчити вас чогось корисного, якщо вам цікаво."`,
      [Language.POLISH]: `${npcName} uśmiecha się ciepło. "Chciałbym nauczyć cię czegoś użytecznego, jeśli jesteś zainteresowany."`,
      [Language.CZECH]: `${npcName} se vřele usmívá. "Rád bych tě naučil něco užitečného, pokud tě to zajímá."`
    };
  }

  /**
   * Generate narrative for NPC seeking information
   */
  private generateLearnFactNarrative(npc: NPCDefinition, goal: NPCGoal): Record<Language, string> {
    const npcName = npc.name[Language.ENGLISH] || npc.id;
    return {
      [Language.ENGLISH]: `${npcName} leans in. "I've heard rumors... Do you know anything about what happened?"`,
      [Language.SPANISH]: `${npcName} se inclina. "He oído rumores... ¿Sabes algo sobre lo que pasó?"`,
      [Language.FRENCH]: `${npcName} se penche. "J'ai entendu des rumeurs... Savez-vous quelque chose sur ce qui s'est passé ?"`,
      [Language.GERMAN]: `${npcName} beugt sich vor. "Ich habe Gerüchte gehört... Weißt du etwas darüber, was passiert ist?"`,
      [Language.ITALIAN]: `${npcName} si sporge. "Ho sentito delle voci... Sai qualcosa su quello che è successo?"`,
      [Language.JAPANESE]: `${npcName}が身を乗り出す。「噂を聞いたんだが...何があったか知ってるかい？」`,
      [Language.MANDARIN]: `${npcName}靠近。"我听说了一些传闻...你知道发生了什么吗？"`,
      [Language.RUSSIAN]: `${npcName} наклоняется. "Я слышал слухи... Вы что-нибудь знаете о том, что произошло?"`,
      [Language.PORTUGUESE]: `${npcName} inclina-se. "Ouvi rumores... Sabes alguma coisa sobre o que aconteceu?"`,
      [Language.UKRAINIAN]: `${npcName} нахиляється. "Я чув чутки... Ви щось знаєте про те, що сталося?"`,
      [Language.POLISH]: `${npcName} pochyla się. "Słyszałem plotki... Czy wiesz coś o tym, co się stało?"`,
      [Language.CZECH]: `${npcName} se naklání. "Slyšel jsem fámy... Víš něco o tom, co se stalo?"`
    };
  }

  /**
   * Generate narrative for NPC offering help
   */
  private generateHelpNarrative(npc: NPCDefinition, goal: NPCGoal): Record<Language, string> {
    const npcName = npc.name[Language.ENGLISH] || npc.id;
    return {
      [Language.ENGLISH]: `${npcName} approaches with a friendly expression. "You look like you could use some help. Let me assist you."`,
      [Language.SPANISH]: `${npcName} se acerca con expresión amistosa. "Pareces necesitar ayuda. Déjame ayudarte."`,
      [Language.FRENCH]: `${npcName} s'approche avec une expression amicale. "Vous avez l'air d'avoir besoin d'aide. Laissez-moi vous aider."`,
      [Language.GERMAN]: `${npcName} nähert sich mit freundlichem Gesichtsausdruck. "Du siehst aus, als könntest du Hilfe gebrauchen. Lass mich dir helfen."`,
      [Language.ITALIAN]: `${npcName} si avvicina con un'espressione amichevole. "Sembra che tu possa aver bisogno di aiuto. Lascia che ti aiuti."`,
      [Language.JAPANESE]: `${npcName}が友好的な表情で近づく。「助けが必要そうだね。手伝わせてくれ。」`,
      [Language.MANDARIN]: `${npcName}带着友好的表情走近。"你看起来需要帮助。让我帮你。"`,
      [Language.RUSSIAN]: `${npcName} подходит с дружелюбным выражением. "Похоже, вам нужна помощь. Позвольте мне помочь вам."`,
      [Language.PORTUGUESE]: `${npcName} aproxima-se com uma expressão amigável. "Pareces precisar de ajuda. Deixa-me ajudar-te."`,
      [Language.UKRAINIAN]: `${npcName} підходить з дружнім виразом обличчя. "Схоже, вам потрібна допомога. Дозвольте мені допомогти."`,
      [Language.POLISH]: `${npcName} podchodzi z przyjaznym wyrazem twarzy. "Wyglądasz, jakbyś potrzebował pomocy. Pozwól mi ci pomóc."`,
      [Language.CZECH]: `${npcName} se přibližuje s přátelským výrazem. "Vypadáš, že bys mohl potřebovat pomoc. Dovol mi ti pomoci."`
    };
  }

  /**
   * Get all NPCs
   */
  getAllNPCs(): NPCDefinition[] {
    return Array.from(this.npcs.values());
  }

  /**
   * Get NPCs at a specific location
   */
  getNPCsAtLocation(locationId: string): NPCDefinition[] {
    return Array.from(this.npcs.values()).filter(npc => npc.currentLocation === locationId);
  }
}
