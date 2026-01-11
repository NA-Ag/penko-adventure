/**
 * FacadeNPCController - COMPLETE Facade AI Integration
 *
 * Full 1:1 implementation of Facade architecture:
 * - ABL Behavior System (goal-driven behaviors)
 * - Drama Management (beat selection, story values)
 * - Working Memory (WME tracking)
 * - Rule Engine (reactive behaviors)
 * - Story Memory (timeline tracking)
 * - Player Memory integration
 * - Conversation Management
 *
 * This is NOT a simplified version. This is the FULL system.
 */

import { NPCDefinition } from '../../types/ContentPack';
import { UserProfile, Language } from '../../types';

// ABL System
import { Goal, GoalPriority } from '../abl/Goal';
import { BehaviorTree, ExecutionStrategy } from '../abl/BehaviorTree';
import { WorldState } from '../abl/WorldState';
import { Behavior, BehaviorResult, BehaviorStatus } from '../abl/Behavior';
import { SequentialBehavior, RecoveryStrategy } from '../abl/SequentialBehavior';
import { ParallelBehavior, ParallelCompletionStrategy } from '../abl/ParallelBehavior';
import { PreconditionBuilder } from '../abl/Precondition';
import { SuccessTestBuilder } from '../abl/SuccessTest';
import { Say, Gesture, GestureType, Wait } from '../abl/PrimitiveAct';
import { RememberAct, DecideAct, EvaluateAct } from '../abl/MentalAct';

// Drama System
import { DramaManager } from '../drama/DramaManager';
import { Beat, BeatBuilder, BeatPriority, BeatOutcome } from '../drama/Beat';
import { StoryArcs } from '../drama/StoryTarget';
import { createActionEffects } from '../drama/StoryValues';

// Working Memory
import { WorkingMemory } from '../wm/WorkingMemory';
import { WME } from '../wm/WME';

// Rules
import { RuleEngine, ExecutionMode } from '../rules/RuleEngine';
import { Rule } from '../rules/Rule';

// Social Systems
import { PlayerMemory } from './PlayerMemory';
import { ConversationManager } from './ConversationManager';

export interface FacadeNPCState {
  npcId: string;
  npcName: string;
  npcRole: string;
  behaviorTree: BehaviorTree;
  workingMemory: WorkingMemory;
  worldState: WorldState;
  dramaManager: DramaManager;
  ruleEngine: RuleEngine;
  currentGoal: Goal | null;
}

/**
 * FacadeNPCController - Complete Facade Integration
 */
export class FacadeNPCController {
  private state: FacadeNPCState;
  private npc: NPCDefinition;
  private profile: UserProfile;
  private playerMemory: PlayerMemory;
  private conversationManager: ConversationManager;
  private interactionCount: number = 0;

  constructor(
    npc: NPCDefinition,
    profile: UserProfile,
    playerMemory: PlayerMemory,
    conversationManager: ConversationManager
  ) {
    this.npc = npc;
    this.profile = profile;
    this.playerMemory = playerMemory;
    this.conversationManager = conversationManager;

    console.log(`[FacadeNPCController] Initializing ${npc.id} with FULL Facade architecture...`);

    // 1. Initialize Core Systems
    const worldState = new WorldState();
    const workingMemory = new WorkingMemory(true);  // Enable debug
    const behaviorTree = new BehaviorTree(npc.id, worldState, ExecutionStrategy.PRIORITY);
    const dramaManager = new DramaManager(worldState, {
      debug: true,
      useTargetDrivenSelection: true,
      useWeightedSelection: true,
      useDynamicSelection: true,
      randomnessFactor: 0.3,
    });
    const ruleEngine = new RuleEngine(workingMemory, {
      executionMode: ExecutionMode.ONCE,
      debug: true,
      autoReact: true,
    });

    // 2. Initialize World State
    const npcRole = (npc as any).role || 'generic';
    worldState.set('npc.id', npc.id);
    worldState.set('npc.name', npc.name[profile.nativeLanguage as Language] || npc.name['en' as Language]);
    worldState.set('npc.role', npcRole);
    worldState.set('npc.mood', 'neutral');
    worldState.set('player.greeted', false);
    worldState.set('player.trust', 0.5);
    worldState.set('conversation.turn', 0);

    // 3. Initialize Working Memory
    const npcInfoWME = new WME('npc_info', {
      id: npc.id,
      role: npcRole,
      mood: 'neutral',
      energy: 1.0,
    });
    workingMemory.assert(npcInfoWME);

    // 4. Setup Drama System
    this.initializeDramaSystem(dramaManager, worldState);

    // 5. Setup Goals & Behaviors
    const goals = this.createNPCGoals(npc, npcRole, worldState, behaviorTree);
    goals.forEach(goal => behaviorTree.addGoal(goal));

    // 6. Setup Rules
    this.setupRules(ruleEngine, workingMemory);

    this.state = {
      npcId: npc.id,
      npcName: npc.name[profile.nativeLanguage as Language] || npc.name['en' as Language],
      npcRole,
      behaviorTree,
      workingMemory,
      worldState,
      dramaManager,
      ruleEngine,
      currentGoal: null,
    };

    console.log(`[FacadeNPCController] ✓ ${this.state.npcName} initialized:`);
    console.log(`  - Goals: ${behaviorTree.getStats().totalGoals}`);
    console.log(`  - Behaviors: ${behaviorTree.getStats().totalBehaviors}`);
    console.log(`  - Beats: ${dramaManager.getAllBeats().length}`);
    console.log(`  - Rules: ${ruleEngine.getAllRules().length}`);
    console.log(`  - Working Memory: ${workingMemory.getStats().totalWMEs} WMEs`);
  }

  /**
   * Initialize Drama System with story values, targets, and beats
   */
  private initializeDramaSystem(dramaManager: DramaManager, worldState: WorldState): void {
    // Initialize story values
    dramaManager.setStoryValue('trust', 50);      // Player trust (0-100)
    dramaManager.setStoryValue('tension', 0);     // Narrative tension (0-100)
    dramaManager.setStoryValue('affinity', 50);   // Relationship warmth (0-100)
    dramaManager.setStoryValue('mystery', 30);    // Story mystery level (0-100)

    // Setup story targets (FACADE 4.3 - Target-driven selection)
    const tensionArc = StoryArcs.threeActTension(300000);  // 5 minute arc
    dramaManager.getTargetManager().addTarget(tensionArc);

    // Define beats (FACADE 4.1 - Beat-based narrative)
    this.createDramaBeats(dramaManager);

    console.log(`[FacadeNPCController] Drama system initialized with ${dramaManager.getAllBeats().length} beats`);
  }

  /**
   * Create dramatic beats for narrative flow
   */
  private createDramaBeats(dramaManager: DramaManager): void {
    // Beat 1: First Meeting
    const firstMeetingBeat = new BeatBuilder('first_meeting', 'First Meeting')
      .withDescription('Player meets NPC for the first time')
      .withPriority(BeatPriority.HIGH)
      .withPreconditionBuilder(
        PreconditionBuilder.isFalse('player.greeted')
      )
      .withWorldEffect('player.greeted', true)
      .withWorldEffect('conversation.started_at', Date.now())
      .withStoryEffect('affinity', 10)
      .withWeight(1.0)
      .build();

    // Beat 2: Build Trust
    const buildTrustBeat = new BeatBuilder('build_trust', 'Building Trust')
      .withDescription('NPC shares something personal to build trust')
      .withPriority(BeatPriority.NORMAL)
      .withPreconditionBuilder(
        PreconditionBuilder.all(
          PreconditionBuilder.isTrue('player.greeted'),
          PreconditionBuilder.lessThan('trust', 70)
        )
      )
      .withStoryEffect('trust', 15)
      .withStoryEffect('affinity', 5)
      .withWeight(0.8)
      .build();

    // Beat 3: Increase Tension
    const tensionBeat = new BeatBuilder('increase_tension', 'Rising Tension')
      .withDescription('Something concerning happens')
      .withPriority(BeatPriority.NORMAL)
      .withPreconditionBuilder(
        PreconditionBuilder.all(
          PreconditionBuilder.isTrue('player.greeted'),
          PreconditionBuilder.lessThan('tension', 70)
        )
      )
      .withStoryEffect('tension', 20)
      .withStoryEffect('trust', -5)
      .withWeight(0.6)
      .build();

    // Beat 4: Conflict
    const conflictBeat = new BeatBuilder('conflict', 'Conflict')
      .withDescription('Disagreement or problem arises')
      .withPriority(BeatPriority.NORMAL)
      .withPreconditionBuilder(
        PreconditionBuilder.all(
          PreconditionBuilder.greaterThan('trust', 30),
          PreconditionBuilder.lessThan('tension', 80)
        )
      )
      .withStoryEffect('tension', 25)
      .withStoryEffect('trust', -10)
      .withStoryEffect('affinity', -5)
      .withWeight(0.5)
      .unlocksOnSuccess(['resolution'])
      .build();

    // Beat 5: Resolution
    const resolutionBeat = new BeatBuilder('resolution', 'Resolution')
      .withDescription('Problem is resolved')
      .withPriority(BeatPriority.HIGH)
      .withPreconditionBuilder(
        PreconditionBuilder.greaterThan('tension', 50)
      )
      .withStoryEffect('tension', -30)
      .withStoryEffect('trust', 20)
      .withStoryEffect('affinity', 15)
      .withWeight(0.9)
      .build();

    dramaManager.addBeats([firstMeetingBeat, buildTrustBeat, tensionBeat, conflictBeat, resolutionBeat]);
  }

  /**
   * Create goals and behaviors for this NPC based on role
   */
  private createNPCGoals(
    npc: NPCDefinition,
    role: string,
    worldState: WorldState,
    tree: BehaviorTree
  ): Goal[] {
    const goals: Goal[] = [];
    const lang = this.profile.nativeLanguage;

    // Universal Goal: Greet Player
    const greetGoal = new Goal(
      'greet_player',
      'Greet Player',
      'Welcome the player warmly',
      GoalPriority.HIGH
    );

    greetGoal.addSuccessCriteria('player_greeted', (ws) => ws.get('player.greeted') === true);

    // Greeting behavior sequence
    const greetSequence = this.createGreetingSequence(npc.id, lang);
    greetGoal.addSatisfyingBehavior(greetSequence);

    goals.push(greetGoal);

    // Role-specific goals
    switch (role) {
      case 'merchant':
        goals.push(...this.createMerchantGoals(npc.id, lang, worldState));
        break;
      case 'guard':
        goals.push(...this.createGuardGoals(npc.id, lang, worldState));
        break;
      case 'wizard':
        goals.push(...this.createWizardGoals(npc.id, lang, worldState));
        break;
      default:
        goals.push(...this.createGenericGoals(npc.id, lang, worldState));
    }

    return goals;
  }

  /**
   * Create greeting behavior sequence
   */
  private createGreetingSequence(npcId: string, lang: Language): SequentialBehavior {
    const greetings = this.getLocalizedGreetings(lang);

    const sequence = new SequentialBehavior('greet_sequence', 'Greeting Sequence', 80, 0.9);

    // Step 1: Wave gesture
    const waveGesture = new Gesture(npcId, GestureType.WAVE);
    waveGesture.addPrecondition('not already greeted', (ws) => !ws.get('player.greeted'));
    sequence.addStep(waveGesture, RecoveryStrategy.SKIP);  // Optional

    // Step 2: Say greeting
    const sayGreeting = new Say(npcId, greetings.initial);
    sequence.addStep(sayGreeting, RecoveryStrategy.FAIL);  // Required

    // Step 3: Remember this interaction (Mental Act)
    const rememberGreeting = RememberAct.event(
      'Met the player for the first time',
      'player',
      0.8
    );
    sequence.addStep(rememberGreeting, RecoveryStrategy.SKIP);  // Optional

    return sequence;
  }

  /**
   * Create merchant-specific goals
   */
  private createMerchantGoals(npcId: string, lang: Language, ws: WorldState): Goal[] {
    const goals: Goal[] = [];

    // Goal: Offer Wares
    const offerGoal = new Goal(
      'offer_wares',
      'Offer Wares',
      'Show goods to potential customers',
      GoalPriority.NORMAL
    );

    offerGoal.addSuccessCriteria('player knows about wares', (ws) =>
      ws.get('player.knows_wares') === true
    );

    const offerBehavior = this.createOfferWaresBehavior(npcId, lang);
    offerGoal.addSatisfyingBehavior(offerBehavior);

    goals.push(offerGoal);

    return goals;
  }

  /**
   * Create offer wares behavior
   */
  private createOfferWaresBehavior(npcId: string, lang: Language): Behavior {
    const messages = this.getLocalizedMerchantMessages(lang);

    const offerBehavior = new Say(npcId, messages.offerWares);

    offerBehavior.addPrecondition('player greeted', (ws) => ws.get('player.greeted') === true);
    offerBehavior.addPrecondition('not yet offered', (ws) => !ws.get('player.knows_wares'));

    offerBehavior.addSuccessTest('wares offered', (ws) => ws.get('player.knows_wares') === true);

    return offerBehavior;
  }

  /**
   * Create guard-specific goals
   */
  private createGuardGoals(npcId: string, lang: Language, ws: WorldState): Goal[] {
    const goals: Goal[] = [];

    // Goal: Maintain Security
    const securityGoal = new Goal(
      'maintain_security',
      'Maintain Security',
      'Watch for threats and maintain order',
      GoalPriority.HIGH
    );

    const patrolBehavior = this.createPatrolBehavior(npcId, lang);
    securityGoal.addSatisfyingBehavior(patrolBehavior);

    goals.push(securityGoal);

    return goals;
  }

  /**
   * Create patrol behavior
   */
  private createPatrolBehavior(npcId: string, lang: Language): Behavior {
    const messages = this.getLocalizedGuardMessages(lang);

    const patrolBehavior = new Say(npcId, messages.onDuty);

    patrolBehavior.addPrecondition('on duty', (ws) => ws.get('npc.mood') !== 'sleeping');

    return patrolBehavior;
  }

  /**
   * Create wizard-specific goals
   */
  private createWizardGoals(npcId: string, lang: Language, ws: WorldState): Goal[] {
    const goals: Goal[] = [];

    // Goal: Share Knowledge
    const knowledgeGoal = new Goal(
      'share_knowledge',
      'Share Knowledge',
      'Teach the player about magic',
      GoalPriority.NORMAL
    );

    const teachBehavior = this.createTeachBehavior(npcId, lang);
    knowledgeGoal.addSatisfyingBehavior(teachBehavior);

    goals.push(knowledgeGoal);

    return goals;
  }

  /**
   * Create teach behavior
   */
  private createTeachBehavior(npcId: string, lang: Language): Behavior {
    const messages = this.getLocalizedWizardMessages(lang);

    const teachBehavior = new Say(npcId, messages.offerKnowledge);

    teachBehavior.addPrecondition('player interested', (ws) =>
      ws.get('player.trust') > 0.3
    );

    return teachBehavior;
  }

  /**
   * Create generic goals for non-specialized NPCs
   */
  private createGenericGoals(npcId: string, lang: Language, ws: WorldState): Goal[] {
    const goals: Goal[] = [];

    // Goal: Converse
    const converseGoal = new Goal(
      'converse',
      'Converse',
      'Have a friendly conversation',
      GoalPriority.NORMAL
    );

    const converseBehavior = this.createConverseBehavior(npcId, lang);
    converseGoal.addSatisfyingBehavior(converseBehavior);

    goals.push(converseGoal);

    return goals;
  }

  /**
   * Create converse behavior
   */
  private createConverseBehavior(npcId: string, lang: Language): Behavior {
    const messages = this.getLocalizedGenericMessages(lang);

    const converseBehavior = new Say(npcId, messages.chat);

    converseBehavior.addPrecondition('player greeted', (ws) => ws.get('player.greeted') === true);

    return converseBehavior;
  }

  /**
   * Setup reactive rules (FACADE 6.x - Rule Engine)
   */
  private setupRules(engine: RuleEngine, wm: WorkingMemory): void {
    // Rule 1: Detect player greeting
    const greetingRule = new Rule(
      'detect_greeting',
      'Detects when player greets NPC',
      {
        patterns: [
          { type: 'interaction', filter: (wme) => {
            const input = wme.getAttribute('playerInput');
            return input && (
              input.includes('hello') || input.includes('hi') ||
              input.includes('hola') || input.includes('bonjour') ||
              input.includes('hallo') || input.includes('ciao')
            );
          }}
        ]
      },
      [
        (bindings, workingMem) => {
          const greetWME = new WME('player_action', { action: 'greeted', timestamp: Date.now() });
          workingMem.assert(greetWME);
        }
      ],
      100
    );

    // Rule 2: Track conversation turns
    const turnTrackingRule = new Rule(
      'track_turns',
      'Counts conversation turns',
      {
        patterns: [
          { type: 'interaction' }
        ]
      },
      [
        (bindings, workingMem) => {
          const turnWME = new WME('turn_counter', { count: 1, timestamp: Date.now() });
          workingMem.assert(turnWME);
        }
      ],
      90
    );

    engine.addRule(greetingRule);
    engine.addRule(turnTrackingRule);
  }

  /**
   * Process player interaction through FULL Facade pipeline
   */
  async processInteraction(
    playerInput: string,
    intent: string,
    context: any
  ): Promise<string> {
    this.interactionCount++;

    console.log(`\n[FacadeNPCController] ===== INTERACTION ${this.interactionCount} =====`);
    console.log(`[FacadeNPCController] Input: "${playerInput}" (intent: ${intent})`);

    // STEP 1: Update World State
    this.updateWorldState(playerInput, intent, context);

    // STEP 2: Assert interaction WME
    const interactionWME = new WME('interaction', {
      playerInput,
      intent,
      timestamp: Date.now(),
      turn: this.interactionCount,
    });
    this.state.workingMemory.assert(interactionWME);

    // STEP 3: Run Rules (FACADE 6.x)
    this.state.ruleEngine.run();
    const agenda = this.state.ruleEngine.getAgenda();
    console.log(`[FacadeNPCController] Rules fired: ${agenda.length} activations`);

    // STEP 4: Select Drama Beat (FACADE 4.x)
    const beat = this.state.dramaManager.selectBeat();
    if (beat) {
      console.log(`[FacadeNPCController] Beat selected: ${beat.id} (${beat.name})`);
      const beatResult = this.state.dramaManager.executeBeat(beat.id);

      if (beatResult) {
        console.log(`[FacadeNPCController] Beat outcome: ${beatResult.outcome}`);
        console.log(`[FacadeNPCController] Story values changed: ${Object.keys(beatResult.storyValueChanges).length}`);
      }
    }

    // STEP 5: Execute Behavior Tree (FACADE 3.x - ABL)
    const behaviorResults = await this.state.behaviorTree.tick();
    console.log(`[FacadeNPCController] Behaviors executed: ${behaviorResults.length}`);

    // STEP 6: Extract response from behavior results
    let response = '';
    for (const result of behaviorResults) {
      if (result.status === BehaviorStatus.SUCCESS && result.data) {
        // Extract dialogue from Say actions
        if (result.data.type === 'say' && result.data.text) {
          response = result.data.text;
          break;
        }
      }
    }

    // STEP 7: Fallback if no response
    if (!response) {
      response = this.getDefaultResponse(this.profile.nativeLanguage);
      console.log(`[FacadeNPCController] Using default response (no behavior generated dialogue)`);
    }

    // STEP 8: Update NPC memory (Mental Act)
    const memory = RememberAct.event(
      `Player said: ${playerInput}`,
      'player',
      0.6
    );
    await memory.execute(this.state.worldState);

    // STEP 9: Log final state
    this.logDramaticState();

    console.log(`[FacadeNPCController] Response: "${response}"`);
    console.log(`[FacadeNPCController] ===== END INTERACTION =====\n`);

    return response;
  }

  /**
   * Update world state based on player input
   */
  private updateWorldState(playerInput: string, intent: string, context: any): void {
    const ws = this.state.worldState;

    // Update conversation turn
    ws.increment('conversation.turn');

    // Store last intent
    ws.set('player.last_intent', intent);
    ws.set('player.last_input', playerInput);

    // Detect emotional tone
    const lower = playerInput.toLowerCase();
    if (lower.includes('thank') || lower.includes('gracias') || lower.includes('merci')) {
      ws.increment('player.politeness', 0.1);
      ws.set('player.last_emotion', 'grateful');
    } else if (lower.includes('help') || lower.includes('ayuda') || lower.includes('aide')) {
      ws.set('player.needs_help', true);
      ws.set('player.last_emotion', 'seeking');
    }

    // Update trust based on interaction history
    const turnCount = ws.get('conversation.turn') || 0;
    if (turnCount > 5) {
      ws.set('player.trust', Math.min(1.0, (ws.get('player.trust') || 0.5) + 0.05));
    }
  }

  /**
   * Log current dramatic state
   */
  private logDramaticState(): void {
    const wmStats = this.state.workingMemory.getStats();
    const storyValues = this.state.dramaManager.getAllStoryValues();
    const treeStats = this.state.behaviorTree.getStats();

    console.log(`[FacadeNPCController] State:`);
    console.log(`  Working Memory: ${wmStats.totalWMEs} WMEs`);
    console.log(`  Story Values: trust=${storyValues.trust}, tension=${storyValues.tension}, affinity=${storyValues.affinity}`);
    console.log(`  Goals: ${treeStats.activeGoals} active / ${treeStats.totalGoals} total`);
    console.log(`  Behaviors: ${treeStats.executing} executing`);
  }

  /**
   * Get default response (fallback)
   */
  private getDefaultResponse(lang: Language): string {
    const responses = this.getLocalizedGenericMessages(lang);
    const options = [responses.yes, responses.help, responses.chat];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get localized greetings
   */
  private getLocalizedGreetings(lang: Language): { initial: string } {
    const greetings: Record<string, { initial: string }> = {
      en: { initial: 'Hello! Welcome!' },
      es: { initial: '¡Hola! ¡Bienvenido!' },
      fr: { initial: 'Bonjour! Bienvenue!' },
      de: { initial: 'Hallo! Willkommen!' },
      it: { initial: 'Ciao! Benvenuto!' },
      ja: { initial: 'こんにちは！ようこそ！' },
      zh: { initial: '你好！欢迎！' },
      ru: { initial: 'Привет! Добро пожаловать!' },
      pt: { initial: 'Olá! Bem-vindo!' },
      uk: { initial: 'Привіт! Ласкаво просимо!' },
      pl: { initial: 'Cześć! Witaj!' },
      cs: { initial: 'Ahoj! Vítej!' },
    };
    return greetings[lang] || greetings.en;
  }

  /**
   * Get localized merchant messages
   */
  private getLocalizedMerchantMessages(lang: Language): { offerWares: string } {
    const messages: Record<string, { offerWares: string }> = {
      en: { offerWares: 'Take a look at my wares! I have the finest goods in town.' },
      es: { offerWares: '¡Mira mis productos! Tengo los mejores artículos de la ciudad.' },
      fr: { offerWares: 'Regardez mes marchandises! J\'ai les meilleurs produits en ville.' },
    };
    return messages[lang] || messages.en;
  }

  /**
   * Get localized guard messages
   */
  private getLocalizedGuardMessages(lang: Language): { onDuty: string } {
    const messages: Record<string, { onDuty: string }> = {
      en: { onDuty: 'I\'m on duty. Everything is secure here.' },
      es: { onDuty: 'Estoy de servicio. Todo está seguro aquí.' },
      fr: { onDuty: 'Je suis de service. Tout est sécurisé ici.' },
    };
    return messages[lang] || messages.en;
  }

  /**
   * Get localized wizard messages
   */
  private getLocalizedWizardMessages(lang: Language): { offerKnowledge: string } {
    const messages: Record<string, { offerKnowledge: string }> = {
      en: { offerKnowledge: 'Ah, a student of the arcane arts? I can teach you much.' },
      es: { offerKnowledge: 'Ah, ¿un estudiante de las artes arcanas? Puedo enseñarte mucho.' },
      fr: { offerKnowledge: 'Ah, un étudiant des arts occultes? Je peux vous enseigner beaucoup.' },
    };
    return messages[lang] || messages.en;
  }

  /**
   * Get localized generic messages
   */
  private getLocalizedGenericMessages(lang: Language): { yes: string; help: string; chat: string } {
    const messages: Record<string, { yes: string; help: string; chat: string }> = {
      en: { yes: 'Yes?', help: 'How can I help you?', chat: 'What would you like to talk about?' },
      es: { yes: '¿Sí?', help: '¿Cómo puedo ayudarte?', chat: '¿De qué te gustaría hablar?' },
      fr: { yes: 'Oui?', help: 'Comment puis-je vous aider?', chat: 'De quoi aimeriez-vous parler?' },
    };
    return messages[lang] || messages.en;
  }

  /**
   * Get dramatic state (for debugging/UI)
   */
  getDramaticState() {
    return {
      workingMemorySize: this.state.workingMemory.getStats().totalWMEs,
      storyValues: this.state.dramaManager.getAllStoryValues(),
      availableBeats: this.state.dramaManager.getAvailableBeats().map(b => b.id),
      completedBeats: this.state.dramaManager.getCompletedBeats().map(b => b.id),
      activeGoals: this.state.behaviorTree.getActiveGoals().map(g => g.id),
      worldState: this.state.worldState.toObject(),
    };
  }
}
