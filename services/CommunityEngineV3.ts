/**
 * CommunityEngineV3 - Modernized Community Mode Engine
 *
 * Fully integrated with ContentPack system from types/ContentPack.ts
 * Combines the best of Phase 1-5:
 * - Object System with properties
 * - Oracle (Learning Director)
 * - Actor (ResponseTemplates)
 * - Director (Pacing Engine)
 * - ContentPack loading system
 *
 * Phase 6 Integration Goals:
 * - Load pack-specific vocabulary
 * - Load pack-specific objects
 * - Load pack-specific NPCs
 * - Initialize world state from pack
 */

import type { Biome, TimeOfDay, NarrativeGenre } from '../types';
import type { ObjectIntent } from './community/ObjectSystem';
import { GameTurnData, UserProfile, Language, SceneData, InventoryItem } from '../types';
import { ContentPack, LocationNode, NPCDefinition } from '../types/ContentPack';
import { ObjectSystem, GameObject } from './community/ObjectSystem';
import { ActionValidator, createActionValidator, ValidatedAction } from './community/ActionValidator';
import { StandardModeParser } from './parser/StandardModeParser';
import { Oracle, LearningEvent } from './community/Oracle';
import { ResponseTemplates, createResponseTemplates, TemplateContext } from './community/ResponseTemplates';
import { InputChecker } from './InputChecker';
import { Director, createDirector } from './community/Director';
import { CustomTranslationEngine } from './CustomTranslationEngine';
import { ScenarioNode } from '../types/scenarios';
import { getDirection, buildExitDescription, getMessage } from './SystemStrings';
import { InteractionRules } from './community/InteractionRules';
import { WorldState } from './community/WorldState';
import { NPCPersonaManager } from './community/NPCPersonaManager';
import { DialogueSelector } from './community/DialogueSelector';
import { IntegratedLookupService } from './IntegratedLookupService';
import { MorphologyEngine } from './morphology/MorphologyEngine';
import { DictionaryService } from './DictionaryService';
import { NPCResponseGenerator } from './community/NPCResponseGenerator';
import { NPCRelationshipManager } from './community/NPCRelationshipManager';
import { NPCMoodManager } from './community/NPCMoodManager';
import { NPCContextManager } from './community/NPCContextManager';
import { NPCConversationMemory } from './community/NPCConversationMemory';
import { NPCGossipManager } from './community/NPCGossipManager';
import { PlayerMemory } from './community/PlayerMemory';  // FACADE 2.1: Player Working Memory
import { ConversationManager } from './community/ConversationManager';  // FACADE 2.2: Turn-Taking and Conversation Flow
import { InterruptionDetector } from './community/InterruptionDetector';  // FACADE 2.3: Interruption Handling
import { DynamicObjectCreator } from './community/DynamicObjectCreator';  // SCRIBBLENAUTS 1.1: Text-Based Object Spawning
import { DictionaryTranslator } from './browser/DictionaryTranslator';  // Translation for simplify/translate UI features
import { FacadeNPCController } from './community/FacadeNPCController';  // FACADE: Full integration of all Facade systems

interface EngineState {
  currentLocationId: string;
  inventory: InventoryItem[];
  health: number;
  visitedLocations: Set<string>;
  discoveredLocations: Set<string>;
}

export class CommunityEngineV3 {
  private profile: UserProfile;
  private contentPack: ContentPack;
  private state: EngineState;
  private initialized: boolean = false;

  // Core systems (Phase 1-5)
  private objectSystem: ObjectSystem;
  private actionValidator: ActionValidator | null = null;
  private parser: StandardModeParser | null = null;
  private oracle: Oracle;
  private responseTemplates: ResponseTemplates;
  private inputChecker: InputChecker | null = null;
  private director: Director;
  private translationEngine: CustomTranslationEngine;
  private interactionRules: InteractionRules;  // Tier 9: Two-object interactions
  private worldState: WorldState;              // Tier 10: World facts tracking
  private npcPersonaManager: NPCPersonaManager; // Tier 10: NPC internal states
  private dialogueSelector: DialogueSelector;  // Tier 10: State-driven dialogue
  private npcResponseGenerator: NPCResponseGenerator; // Tier 20: Façade-style NPC responses
  private npcRelationshipManager: NPCRelationshipManager; // Tier 20: Relationship tracking
  private npcMoodManager: NPCMoodManager; // Tier 20: Emotional contagion system
  private npcContextManager: NPCContextManager; // Tier 20: Context-aware responses
  private npcConversationMemory: NPCConversationMemory; // Tier 20: Multi-turn conversation memory
  private npcGossipManager: NPCGossipManager; // Tier 20: NPC-to-NPC gossip system
  private playerMemory: PlayerMemory; // FACADE 2.1: Player Working Memory System
  private conversationManager: ConversationManager; // FACADE 2.2: Turn-Taking and Conversation Flow
  private interruptionDetector: InterruptionDetector; // FACADE 2.3: Interruption Pattern Detection

  // Tier 22: Layered Dictionary System (initialized async in initGame)
  private morphologyEngine: MorphologyEngine | null = null;
  private dictionaryService: DictionaryService | null = null;
  private lookupService: IntegratedLookupService | null = null;

  // SCRIBBLENAUTS PARITY 1.1: Dynamic Object Creation
  private dynamicObjectCreator: DynamicObjectCreator;

  // Translation for Simplify/Translate UI features
  private translator: DictionaryTranslator | null = null;

  // FACADE: Full Facade integration - replaces simple NPC responses with ABL behaviors, beats, WME, rules
  private facadeNPCs: Map<string, FacadeNPCController> = new Map();

  constructor(contentPack: ContentPack, profile: UserProfile) {
    this.contentPack = contentPack;
    this.profile = profile;

    console.log(`[CommunityEngineV3] Loading pack: ${this.getLocalizedText(contentPack.metadata.title)}`);
    console.log(`[CommunityEngineV3] Genre: ${contentPack.metadata.genre}`);
    console.log(`[CommunityEngineV3] Locations: ${contentPack.world.locations.length}`);

    // Initialize state
    this.state = {
      currentLocationId: contentPack.world.startingLocationId,
      inventory: [],
      health: 100,
      visitedLocations: new Set([contentPack.world.startingLocationId]),
      discoveredLocations: new Set([contentPack.world.startingLocationId]),
    };

    // ===== Phase 6 Task 1: Initialize Object System with pack objects =====
    this.objectSystem = new ObjectSystem();
    
    // Register objects from pack (if defined)
    if (contentPack.world.objects && contentPack.world.objects.length > 0) {
      console.log(`[CommunityEngineV3] Registering ${contentPack.world.objects.length} objects from pack`);
      this.objectSystem.registerObjects(contentPack.world.objects);
    }
    
    // Also create game objects from item definitions (ContentPack format)
    const items = (contentPack.world as any).items || [];
    if (items && items.length > 0) {
      console.log(`[CommunityEngineV3] Creating ${items.length} game objects from pack items`);
      items.forEach((item: any) => {
        if (item.id) {
          const gameObject: GameObject = {
            id: item.id,
            name: item.name || { en: item.id },
            description: item.description || { en: 'An item' },
            properties: item.properties || {
              takeable: true,
              examinable: true,
              visible: true,
              flammable: false,
              edible: false,
              heavy: false,
              locked: false,
            },
            allowedActions: item.allowedActions || ['TAKE', 'EXAMINE', 'DROP'],
          };
          this.objectSystem.registerObject(gameObject);
        }
      });
    }
    
    if (!contentPack.world.objects && !items) {
      console.log('[CommunityEngineV3] No objects or items defined in pack');
    }

    // ===== Phase 6 Task 2: Initialize Parser with pack vocabulary =====
    this.parser = new StandardModeParser(
      null,
      false, // Don't use API
      profile
    );

    // Load pack-specific vocabulary into parser
    if (contentPack.world.vocabulary) {
      console.log('[CommunityEngineV3] Loading pack vocabulary into parser');
      // TODO: Parser needs method to accept custom vocabulary
      // For now, parser will use contentPack context during parsing
    }

    // ===== Tier 22: Initialize Layered Dictionary System =====
    // Note: Async initialization moved to initGame() method
    // Services will be initialized when game starts

    // Initialize action validator (TIER 1: Pass NPCPersonaManager for context-aware detection)
    this.actionValidator = createActionValidator(
      this.objectSystem,
      this.parser,
      profile.targetLanguage,
      this.npcPersonaManager  // TIER 1: Enable NPC detection for intent conversion (MOVE → TALK)
    );

    // ===== Phase 3A: Initialize Oracle (Learning Director) =====
    this.oracle = new Oracle({
      cefrLevel: this.mapDifficultyToCEFR(contentPack.metadata.difficulty),
    });

    // Load pack-specific learning events
    if (contentPack.world.events && contentPack.world.events.length > 0) {
      console.log(`[CommunityEngineV3] Registering ${contentPack.world.events.length} learning events`);
      this.oracle.registerEvents(contentPack.world.events);
    }

    // ===== Phase 3B: Initialize Response Templates (Actor) =====
    this.responseTemplates = createResponseTemplates();

    // Load pack-specific templates if available
    if (contentPack.world.templates) {
      console.log('[CommunityEngineV3] Loading custom response templates from pack');
      // TODO: Merge pack templates with default templates
    }

    // ===== Phase 3B: Initialize InputChecker for grammar feedback =====
    this.inputChecker = new InputChecker(
      profile.targetLanguage,
      profile.nativeLanguage,
      this.mapDifficultyToCEFR(contentPack.metadata.difficulty)
    );

    // ===== Phase 3C: Initialize Director (Pacing Engine) =====
    this.director = createDirector(this.oracle, {
      frustrationThreshold: 60,
      boredomThreshold: 60,
      enableHints: true,
      enableDifficultyAdjustment: true,
      enableMilestones: true,
    });

    // ===== Phase 5: Initialize Translation Engine =====
    this.translationEngine = new CustomTranslationEngine();
    // Note: Translation engine initialization moved to initGame()

    // ===== Tier 9: Initialize Interaction Rules Engine =====
    this.interactionRules = new InteractionRules();
    console.log('[CommunityEngineV3] InteractionRules initialized with 5 default rules');

    // ===== Tier 10: Initialize Persona System =====
    this.worldState = new WorldState();
    this.npcPersonaManager = new NPCPersonaManager(this.worldState);
    this.dialogueSelector = new DialogueSelector(this.worldState);

    // FACADE 2.1: Initialize Player Working Memory System
    this.playerMemory = new PlayerMemory();
    this.playerMemory.setLocation(contentPack.world.startingLocationId);
    console.log('[CommunityEngineV3] FACADE 2.1: Player Working Memory initialized');

    // FACADE 2.2: Initialize Conversation Manager (Turn-Taking and Flow)
    this.conversationManager = new ConversationManager();
    console.log('[CommunityEngineV3] FACADE 2.2: Conversation Manager initialized - NPCs can now manage turn-taking!');

    // FACADE 2.3: Initialize Interruption Detector
    this.interruptionDetector = new InterruptionDetector();
    console.log('[CommunityEngineV3] FACADE 2.3: Interruption Detector initialized - Player can interrupt NPCs!');

    // Register NPCs from content pack
    if (contentPack.world.npcs && contentPack.world.npcs.length > 0) {
      console.log(`[CommunityEngineV3] Registering ${contentPack.world.npcs.length} NPCs with Persona system`);
      this.npcPersonaManager.registerNPCs(contentPack.world.npcs);
    }

    console.log('[CommunityEngineV3] Persona System initialized - NPCs can now remember and react!');

    // ===== Tier 20: Initialize Façade-style NPC Response System =====
    this.npcResponseGenerator = new NPCResponseGenerator();
    console.log('[CommunityEngineV3] Façade-style NPC Response Generator initialized');

    this.npcRelationshipManager = new NPCRelationshipManager();
    console.log('[CommunityEngineV3] NPC Relationship Manager initialized - NPCs now remember your actions!');

    this.npcMoodManager = new NPCMoodManager();
    console.log('[CommunityEngineV3] NPC Mood Manager initialized - NPCs now have dynamic moods!');

    this.npcContextManager = new NPCContextManager();
    console.log('[CommunityEngineV3] NPC Context Manager initialized - NPCs now respond to environmental context!');

    this.npcConversationMemory = new NPCConversationMemory();
    console.log('[CommunityEngineV3] NPC Conversation Memory initialized - NPCs now remember your conversations!');

    this.npcGossipManager = new NPCGossipManager();
    console.log('[CommunityEngineV3] NPC Gossip Manager initialized - NPCs now share information about you!');

    // ===== SCRIBBLENAUTS PARITY 1.1: Initialize Dynamic Object Creator =====
    this.dynamicObjectCreator = new DynamicObjectCreator();
    console.log('[CommunityEngineV3] SCRIBBLENAUTS 1.1: Dynamic Object Creator initialized - Players can now create objects!');

    console.log('[CommunityEngineV3] Initialization complete!');
  }

  /**
   * Map difficulty level to CEFR level
   */
  private mapDifficultyToCEFR(difficulty: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
    switch (difficulty) {
      case 'beginner': return 'A1';
      case 'intermediate': return 'B1';
      case 'advanced': return 'C1';
      default: return 'A1';
    }
  }

  /**
   * Translate direction words to target language
   * Now uses centralized SystemStrings
   */
  private translateDirection(direction: string): string {
    return getDirection(direction, this.profile.targetLanguage);
  }

  /**
   * Get localized text from multi-language object
   */
  private getLocalizedText(texts: Record<string, string>, fallback: string = ''): string {
    // Map Language enum to language codes used in content packs
    const languageCodeMap: Record<Language, string> = {
      [Language.ENGLISH]: 'en',
      [Language.SPANISH]: 'es',
      [Language.FRENCH]: 'fr',
      [Language.GERMAN]: 'de',
      [Language.ITALIAN]: 'it',
      [Language.JAPANESE]: 'ja',
      [Language.MANDARIN]: 'zh',
      [Language.RUSSIAN]: 'ru',
      [Language.PORTUGUESE]: 'pt',
      [Language.UKRAINIAN]: 'uk',
      [Language.POLISH]: 'pl',
      [Language.CZECH]: 'cs',
    };

    const targetCode = languageCodeMap[this.profile.targetLanguage];

    // Try target language code first
    if (targetCode && texts[targetCode]) {
      return texts[targetCode];
    }
    // Fallback to English
    if (texts['en']) {
      return texts['en'];
    }
    // Fallback to first available
    const keys = Object.keys(texts);
    if (keys.length > 0) {
      return texts[keys[0]];
    }
    return fallback;
  }

  /**
   * Get current location object
   */
  private getCurrentLocation(): LocationNode | null {
    return this.contentPack.world.locations.find(
      l => l.id === this.state.currentLocationId
    ) || null;
  }

  /**
   * Get NPC by ID
   */
  private getNPC(npcId: string): NPCDefinition | null {
    if (!this.contentPack.world.npcs) return null;
    return this.contentPack.world.npcs.find(npc => npc.id === npcId) || null;
  }

  /**
   * Initialize game and return first turn
   *
   * CRITICAL: This method performs async initialization of all services.
   * It MUST be called before any game turns are processed.
   */
  async initGame(): Promise<GameTurnData> {
    // ===== STEP 1: Initialize Async Services (only once) =====
    if (!this.initialized) {
      console.log('[CommunityEngineV3] Initializing async services...');

      try {
        // Initialize MorphologyEngine for word analysis
        this.morphologyEngine = new MorphologyEngine();
        // Note: MorphologyEngine doesn't have async init, loads morphology on-demand

        // Initialize DictionaryService with 3-layer waterfall lookup
        this.dictionaryService = new DictionaryService();

        // Load core dictionary for target language
        await this.dictionaryService.loadCoreDictionary(this.profile.targetLanguage);
        console.log(`[CommunityEngineV3] ✓ Core dictionary loaded for ${this.profile.targetLanguage}`);

        // Load content pack dictionary if available
        if (this.contentPack.metadata.id) {
          await this.dictionaryService.loadContentPackDictionary(
            this.profile.targetLanguage,
            this.contentPack.metadata.id
          );
          console.log(`[CommunityEngineV3] ✓ Content pack dictionary loaded`);
        }

        // Create IntegratedLookupService combining morphology + dictionary
        this.lookupService = new IntegratedLookupService(
          this.morphologyEngine,
          this.dictionaryService
        );

        // Inject lookup service into parser for object identification
        if (this.parser) {
          this.parser.setLookupService(this.lookupService);
          console.log('[CommunityEngineV3] ✓ Tier 22 Layered Dictionary integrated');
        }

        // Initialize Translation Engine (for native language feedback)
        await this.translationEngine.initialize();
        console.log('[CommunityEngineV3] ✓ Translation engine initialized');

        // Initialize DictionaryTranslator for simplify/translate features
        this.translator = new DictionaryTranslator(this.profile.targetLanguage, this.profile.nativeLanguage);
        console.log('[CommunityEngineV3] ✓ Dictionary translator initialized');

        // FACADE: Initialize full Facade architecture for all NPCs
        this.initializeFacadeNPCs();
        console.log('[CommunityEngineV3] ✓ Facade NPCs initialized with ABL + Beats + WME + Rules');

        this.initialized = true;
        console.log('[CommunityEngineV3] ✓ All async services initialized');

      } catch (error) {
        console.error('[CommunityEngineV3] Failed to initialize services:', error);
        // Continue anyway - game will work with reduced functionality
      }
    }

    // ===== STEP 2: Start the Game =====
    const location = this.getCurrentLocation();
    if (!location) {
      throw new Error(`Starting location "${this.state.currentLocationId}" not found in pack`);
    }

    const locationName = this.getLocalizedText(location.name as any, location.id);
    console.log(`[CommunityEngineV3] Game started at: ${locationName}`);

    // Generate initial narrative from description
    const narrative = this.generateLocationDescription(location);

    // Extract scene data
    const sceneData = this.extractSceneData(location);

    // TIER 18: Pure gameplay with simplify/translate features
    const turnData: GameTurnData = {
      narrative,
      sceneData,
      health: this.state.health,
      inventory: this.state.inventory,
      locationName: locationName,
      playerOptions: this.generatePlayerOptions(location),
    };

    return await this.enhanceWithTranslations(turnData);
  }

  /**
   * Process player's input
   */
  async processTurn(playerInput: string): Promise<GameTurnData> {
    const location = this.getCurrentLocation();
    if (!location) {
      throw new Error('Current location not found');
    }

    // Check what mode this location should use
    const availableItems = (location as any).items || location.objects || [];
    const hasChoices = location.choices && location.choices.length > 0;
    const allowFreeInput = (location as any).allowFreeInput !== false;

    // Determine which processing mode to use
    if (hasChoices && !allowFreeInput) {
      // Choice-based only
      return await this.processChoiceInput(playerInput, location);
    } else if (availableItems.length > 0 && allowFreeInput) {
      // Free-form with objects to interact with
      return await this.processFreeFormInput(playerInput, location);
    } else if (hasChoices) {
      // Has choices, try choice first, then free form fallback
      const choice = location.choices.find(c =>
        c.text.toLowerCase() === playerInput.toLowerCase() ||
        (c.translation && c.translation.toLowerCase() === playerInput.toLowerCase())
      );
      if (choice) {
        return await this.processChoiceInput(playerInput, location);
      }
      // Fall through to free form
      return await this.processFreeFormInput(playerInput, location);
    } else {
      // Default to free form
      return await this.processFreeFormInput(playerInput, location);
    }
  }

  /**
   * SCRIBBLENAUTS 1.1: Handle object creation commands
   *
   * Processes commands like:
   * - "create red door"
   * - "spawn tiny dragon"
   * - "make big sword"
   */
  private async handleCreateCommand(input: string, location: LocationNode): Promise<GameTurnData | null> {
    const lowerInput = input.toLowerCase().trim();

    // Check if input starts with create/spawn/make command
    const createPattern = /^(create|spawn|make|summon)\s+(.+)$/;
    const match = lowerInput.match(createPattern);

    if (!match) {
      return null; // Not a create command
    }

    const description = match[2]; // "red door", "tiny dragon", etc.

    // Use DynamicObjectCreator to create the object
    const result = this.dynamicObjectCreator.createObject({
      description,
      location: location.id,
      requestedBy: 'player',
      language: this.profile.targetLanguage
    });

    if (result.success && result.object) {
      // Register the object with ObjectSystem
      this.objectSystem.registerObject(result.object);

      // Add to current location's objects
      if (!(location as any).objects) {
        (location as any).objects = [];
      }
      (location as any).objects.push(result.object.id);

      // Generate narrative response
      const narrative = result.message;

      const turnData: GameTurnData = {
        narrative,
        sceneData: this.extractSceneData(location),
        health: this.state.health,
        inventory: this.state.inventory,
        locationName: this.getLocalizedText((location as any).name, location.id),
        playerOptions: this.generatePlayerOptions(location),
      };
      return await this.enhanceWithTranslations(turnData);
    } else {
      // Creation failed
      const narrative = result.message || result.error || 'Failed to create object.';

      const turnData: GameTurnData = {
        narrative,
        sceneData: this.extractSceneData(location),
        health: this.state.health,
        inventory: this.state.inventory,
        locationName: this.getLocalizedText((location as any).name, location.id),
        playerOptions: this.generatePlayerOptions(location),
      };
      return await this.enhanceWithTranslations(turnData);
    }
  }

  /**
   * Process free-form text input (Façade architecture - Tier 16.6)
   *
   * ARCHITECTURE PHILOSOPHY:
   * This implements the Façade model where natural language processing
   * feeds a language-agnostic behavior engine. Grammar quality affects
   * pedagogy, but NEVER blocks gameplay.
   *
   * Think: Batman Arkham Asylum - switching to German doesn't change
   * combat mechanics, only UI strings. Same here: French input triggers
   * the same TAKE intent as English input.
   *
   * PHASES:
   * Phase 1: Parse intent (language-agnostic) - Maps "prendre" → TAKE
   * Phase 2: Execute game logic (intent-based) - TAKE(object_id)
   * Phase 3: Generate narrative (target language) - French response
   * Phase 4: Pedagogical feedback (parallel, non-blocking) - Grammar corrections
   *
   * KEY INSIGHT: Grammar errors DON'T prevent actions from executing!
   * Even "je marche a porte" (missing "la", wrong "à") still executes MOVE.
   * Players learn by doing, not by being blocked.
   */
  private async processFreeFormInput(
    playerInput: string,
    currentLocation: LocationNode
  ): Promise<GameTurnData> {
    if (!this.actionValidator) {
      throw new Error('ActionValidator not initialized');
    }

    // SCRIBBLENAUTS 1.1: Check for object creation commands first
    const createResult = await this.handleCreateCommand(playerInput, currentLocation);
    if (createResult) {
      return createResult;
    }

    // FACADE 2.3: Check for interruption patterns first
    const interruptionResult = this.interruptionDetector.detectInterruption(
      playerInput,
      this.profile.targetLanguage
    );

    if (interruptionResult.isInterruption) {
      console.log(
        `[CommunityEngineV3] FACADE 2.3: Interruption detected - "${interruptionResult.matchedPattern}" ` +
        `(${interruptionResult.urgency} urgency, reason: ${interruptionResult.reason})`
      );

      // Check if this is a PURE interruption (just "wait!" with no follow-up)
      const isPure = this.interruptionDetector.isPureInterruption(playerInput, this.profile.targetLanguage);

      if (isPure && this.conversationManager.getFloor().type === 'npc') {
        // Player is just interrupting to stop the NPC - save state and give floor to player
        this.conversationManager.playerInterrupts(interruptionResult.reason);

        // Generate acknowledgment response
        const interruptionResponses: Record<Language, string> = {
          [Language.ENGLISH]: "Yes? What is it?",
          [Language.SPANISH]: "¿Sí? ¿Qué pasa?",
          [Language.FRENCH]: "Oui ? Qu'y a-t-il ?",
          [Language.GERMAN]: "Ja? Was ist los?",
          [Language.ITALIAN]: "Sì? Cosa c'è?",
          [Language.JAPANESE]: "はい？何ですか？",
          [Language.MANDARIN]: "是吗？怎么了？",
          [Language.RUSSIAN]: "Да? Что случилось?",
          [Language.PORTUGUESE]: "Sim? O que foi?",
          [Language.UKRAINIAN]: "Так? Що сталося?",
          [Language.POLISH]: "Tak? Co się stało?",
          [Language.CZECH]: "Ano? Co se děje?",
        };

        const narrative = interruptionResponses[this.profile.targetLanguage] || interruptionResponses[Language.ENGLISH];

        return {
          narrative,
          sceneData: this.extractSceneData(currentLocation),
          health: this.state.health,
          inventory: this.state.inventory,
          locationName: this.getLocalizedText((currentLocation as any).name, currentLocation.id),
          playerOptions: this.generatePlayerOptions(currentLocation),
        };
      }

      // If not pure interruption, continue processing but note the interruption
      if (this.conversationManager.getFloor().type === 'npc') {
        this.conversationManager.playerInterrupts(interruptionResult.reason);
      }
    }

    // FACADE 2.2: Give conversation floor to player at start of turn
    const floorTransition = this.conversationManager.giveFloorToPlayer();
    if (floorTransition.message) {
      console.log('[CommunityEngineV3] FACADE 2.2:', floorTransition.message);
    }

    // ===== PHASE 1: INTENT RECOGNITION (Language-Agnostic) =====
    // Parse input using StandardModeParser to get abstract intent
    // This ALWAYS succeeds - returns UNKNOWN intent if no match
    const parseResult = await this.parser.parseWithContentPack(
      playerInput,
      this.profile.targetLanguage
    );

    console.log('[CommunityEngineV3] Parsed intent:', parseResult.intent || 'UNKNOWN');

    // Get available objects in this location (ContentPack format)
    // TIER 18: Include NPCs as interactable objects
    const locationItems = (currentLocation as any).items || currentLocation.objects || [];
    const locationNPCs = (currentLocation as any).npcs || [];
    const availableObjectIds = [...locationItems, ...locationNPCs];

    // ===== PHASE 2: GAME LOGIC EXECUTION (Intent-Based, No Language Knowledge) =====
    // TIER 17: Pass parseResult directly to eliminate duplicate parsing
    const validatedAction = await this.actionValidator.validateAction(
      parseResult,       // Already-parsed intent (no re-parsing!)
      playerInput,       // Original text (for object extraction only)
      availableObjectIds,
      this.state.inventory.map(item => item.id),
      currentLocation    // TIER 17: Needed for MOVE intent validation
    );

    console.log('[CommunityEngineV3] Validated action:', validatedAction);

    // FACADE 2.1: Record player action in working memory
    this.playerMemory.recordAction(
      validatedAction.intent || 'UNKNOWN',
      validatedAction.objectId,
      this.state.currentLocationId,
      validatedAction.valid,
      playerInput
    );
    this.playerMemory.nextTurn();

    let narrative = '';

    // ===== TIER 20: HANDLE FAÇADE-STYLE DISCOURSE ACTS =====
    // If the action has discourse analysis and targets an NPC, generate dynamic response
    if (validatedAction.discourseAnalysis && validatedAction.intent === 'TALK' && validatedAction.objectId) {
      const npc = this.getNPC(validatedAction.objectId);

      if (npc) {
        // Get NPC name in target language
        const npcName = this.getLocalizedText(npc.name);

        // TIER 20: Update environmental context
        this.updateNPCEnvironmentalContext(validatedAction.objectId, currentLocation);

        // TIER 20: Update last seen time
        this.npcContextManager.updateLastSeen(validatedAction.objectId);

        // TIER 20: Apply relationship decay/growth based on time since last interaction
        const oldRelationship = this.npcRelationshipManager.getRelationship(validatedAction.objectId);
        const oldScore = oldRelationship.relationshipScore;
        const decayResult = this.npcRelationshipManager.applyRelationshipDecay(validatedAction.objectId);

        // TIER 20: Check for relationship milestone (tier change)
        if (decayResult.changed) {
          const milestone = this.npcRelationshipManager.checkForMilestone(
            validatedAction.objectId,
            oldScore,
            oldRelationship.relationshipScore
          );

          if (milestone.crossed) {
            console.log(
              `[CommunityEngineV3] ${npcName}: Relationship ${milestone.direction} ` +
              `(${milestone.oldTier} → ${milestone.newTier}) due to ${decayResult.reason}`
            );
          }
        }

        // TIER 20: Get old relationship score before interaction
        const oldRelationshipScore = this.npcRelationshipManager.getRelationship(validatedAction.objectId).relationshipScore;

        // TIER 20: Record interaction and update relationship
        const relationship = this.npcRelationshipManager.recordInteraction(
          validatedAction.objectId,
          validatedAction.discourseAnalysis,
          playerInput
        );

        // FACADE 2.1: Record conversation in player memory
        // Calculate relationship change to determine if conversation was significant
        const relationshipChange = Math.abs(relationship.relationshipScore - oldRelationshipScore);
        const isSignificant = relationshipChange >= 0.1; // 10% change is significant
        this.playerMemory.recordConversation(
          validatedAction.objectId,
          validatedAction.discourseAnalysis.primary,
          isSignificant
        );

        // TIER 20: Record gossip-worthy events
        const regionId = currentLocation.id;
        const gossipEvent = this.npcGossipManager.recordGossipEvent(
          validatedAction.objectId,
          playerInput,
          validatedAction.discourseAnalysis.primary,
          validatedAction.discourseAnalysis.intensity,
          regionId
        );

        // TIER 20: Get first impression modifier based on regional reputation
        const firstImpression = this.npcGossipManager.getFirstImpressionModifier(
          validatedAction.objectId,
          regionId
        );

        // TIER 20: Update NPC mood based on discourse act
        this.npcMoodManager.updateMoodFromDiscourse(
          validatedAction.objectId,
          validatedAction.discourseAnalysis.primary,
          validatedAction.discourseAnalysis.intensity,
          `player ${validatedAction.discourseAnalysis.primary}`
        );

        // TIER 20: Apply context-based mood modifiers
        this.applyContextMoodModifiers(validatedAction.objectId);

        // TIER 20: Apply mood decay
        this.npcMoodManager.applyMoodDecay(validatedAction.objectId);

        // TIER 20: Get current mood for response generation
        const moodProfile = this.npcMoodManager.getMoodProfile(validatedAction.objectId);

        // TIER 20: Spread mood to nearby NPCs (emotional contagion)
        const nearbyNpcIds = (currentLocation as any).npcs || [];
        if (nearbyNpcIds.length > 1) {
          this.npcMoodManager.spreadMood(
            validatedAction.objectId,
            nearbyNpcIds,
            0.3  // 30% contagion strength
          );
        }

        // TIER 20: Get context information
        const npcContext = this.npcContextManager.getContext(validatedAction.objectId);
        const greetingType = this.npcContextManager.getGreetingModifier(validatedAction.objectId);
        const crowdModifier = this.npcContextManager.getCrowdIntensityModifier(validatedAction.objectId);
        const shouldWhisper = this.npcContextManager.shouldWhisper(validatedAction.objectId);

        // TIER 20: Detect topic changes and repetition
        const topicChange = this.npcConversationMemory.detectTopicChange(
          validatedAction.objectId,
          validatedAction.discourseAnalysis
        );
        const repetition = this.npcConversationMemory.detectRepetition(
          validatedAction.objectId,
          playerInput
        );

        // TIER 20: Get conversation history (last 5 turns for context)
        const conversationHistory = this.npcConversationMemory.getRecentTurns(validatedAction.objectId, 5);

        // FACADE 2.2: Give conversation floor to NPC and start topic tracking
        this.conversationManager.giveFloorToNPC(validatedAction.objectId, false);

        // FACADE 2.3: Check if NPC can resume an interrupted conversation
        let resumePrompt = '';
        if (this.conversationManager.canResumeInterrupted()) {
          const interruptedState = this.conversationManager.resumeInterrupted();
          if (interruptedState && interruptedState.npcId === validatedAction.objectId) {
            // NPC can resume their interrupted thought
            const resumeResponses: Record<Language, string> = {
              [Language.ENGLISH]: "Ah, yes, as I was saying... ",
              [Language.SPANISH]: "Ah, sí, como estaba diciendo... ",
              [Language.FRENCH]: "Ah oui, comme je disais... ",
              [Language.GERMAN]: "Ach ja, wie ich sagte... ",
              [Language.ITALIAN]: "Ah sì, come stavo dicendo... ",
              [Language.JAPANESE]: "ああ、はい、言っていたように... ",
              [Language.MANDARIN]: "啊，是的，就像我说的... ",
              [Language.RUSSIAN]: "Ах да, как я говорил... ",
              [Language.PORTUGUESE]: "Ah sim, como eu estava dizendo... ",
              [Language.UKRAINIAN]: "Ах так, як я казав... ",
              [Language.POLISH]: "Ach tak, jak mówiłem... ",
              [Language.CZECH]: "Ach ano, jak jsem říkal... ",
            };

            resumePrompt = resumeResponses[this.profile.targetLanguage] || resumeResponses[Language.ENGLISH];
            console.log(`[CommunityEngineV3] FACADE 2.3: ${npcName} resuming interrupted conversation`);
          }
        }

        // FACADE 2.2: Track conversation topic
        const topicId = validatedAction.discourseAnalysis.primary;
        const topicName = `${validatedAction.discourseAnalysis.primary} about ${validatedAction.discourseAnalysis.secondary || 'general'}`;
        const currentTopic = this.conversationManager.getCurrentTopic();

        if (!currentTopic || currentTopic.id !== topicId) {
          this.conversationManager.startTopic(
            topicId,
            topicName,
            'player',
            [validatedAction.objectId]
          );
          console.log(`[CommunityEngineV3] FACADE 2.2: Started conversation topic "${topicName}" with ${npcName}`);
        }

        // Check if NPC refuses to interact (if relationship is too negative)
        if (this.npcRelationshipManager.shouldRefuseInteraction(validatedAction.objectId)) {
          narrative = this.getRefusalResponse(npcName, this.profile.targetLanguage);
        } else {
          // Generate discourse-based response with full context (relationship + mood + environment + conversation + reputation)
          // Apply reputation modifier to relationship level for first-time interactions
          let effectiveRelationship = relationship.relationshipScore;
          if (relationship.totalInteractions === 1) {
            // First interaction - apply reputation bias
            effectiveRelationship = Math.max(-1.0, Math.min(1.0,
              effectiveRelationship + firstImpression.modifier
            ));

            if (firstImpression.modifier !== 0) {
              console.log(
                `[CommunityEngineV3] ${npcName}: First impression from ${firstImpression.reason} ` +
                `(${firstImpression.modifier >= 0 ? '+' : ''}${firstImpression.modifier.toFixed(2)})`
              );
            }
          }

          // FACADE: Use full Facade architecture if available, otherwise fall back to simple response
          const facadeNPC = this.getFacadeNPC(validatedAction.objectId);

          if (facadeNPC) {
            // Use full Facade system: ABL behaviors + Drama beats + WME + Rules
            console.log(`[CommunityEngineV3] Using Facade architecture for ${npcName}`);

            const context = {
              relationshipLevel: effectiveRelationship,
              npcMood: moodProfile.currentMood.mood,
              timeOfDay: npcContext.currentEnvironment.timeOfDay,
              locationType: npcContext.currentEnvironment.locationType,
              shouldWhisper: shouldWhisper,
              crowdIntensityModifier: crowdModifier,
              greetingType: greetingType,
              topicChange: topicChange,
              repetition: repetition,
              conversationHistory: conversationHistory,
              reputationModifier: firstImpression.modifier,
              reputationReason: firstImpression.reason,
            };

            narrative = await facadeNPC.processInteraction(
              playerInput,
              validatedAction.intent,
              context
            );

            // Log dramatic state for debugging
            const dramaticState = facadeNPC.getDramaticState();
            console.log(`[CommunityEngineV3] Dramatic state: ${dramaticState.workingMemorySize} WMEs, ${dramaticState.availableBeats.length} available beats`);
          } else {
            // Fallback to simple response generator
            console.log(`[CommunityEngineV3] Using simple response generator for ${npcName} (Facade not initialized)`);
            narrative = this.npcResponseGenerator.generateResponse({
              npcId: validatedAction.objectId,
              npcName: npcName,
              discourse: validatedAction.discourseAnalysis,
              language: this.profile.targetLanguage,
              playerInput: playerInput,
              relationshipLevel: effectiveRelationship,
              npcMood: moodProfile.currentMood.mood,
              // Environmental context
              timeOfDay: npcContext.currentEnvironment.timeOfDay,
              locationType: npcContext.currentEnvironment.locationType,
              shouldWhisper: shouldWhisper,
              crowdIntensityModifier: crowdModifier,
              greetingType: greetingType,
              // Conversation context
              topicChange: topicChange,
              repetition: repetition,
              conversationHistory: conversationHistory,
              // Reputation context
              reputationModifier: firstImpression.modifier,
              reputationReason: firstImpression.reason,
            });
          }

          // FACADE 2.3: Prepend resume prompt if NPC is resuming interrupted conversation
          if (resumePrompt) {
            narrative = resumePrompt + narrative;
          }
        }

        // TIER 20: Record conversation turn for memory
        this.npcConversationMemory.recordTurn(
          validatedAction.objectId,
          playerInput,
          validatedAction.discourseAnalysis,
          narrative
        );

        const moodDesc = this.npcMoodManager.getMoodDescription(validatedAction.objectId);
        console.log(
          `[CommunityEngineV3] ${npcName}: ${validatedAction.discourseAnalysis.primary} ` +
          `(Relationship: ${relationship.relationshipScore.toFixed(2)} - ${relationship.tier}, Mood: ${moodDesc}) → ` +
          `${narrative.substring(0, 50)}...`
        );

        // Return early with NPC response
        return {
          narrative,
          sceneData: this.extractSceneData(currentLocation),
          health: this.state.health,
          inventory: this.state.inventory,
          locationName: this.getLocalizedText((currentLocation as any).name, currentLocation.id),
          playerOptions: this.generatePlayerOptions(currentLocation),
        };
      }
    }

    // ===== PHASE 3: NARRATIVE GENERATION (Target Language) =====
    // TIER 17: Handle LOOK_AROUND intent (re-describe current location)
    if (validatedAction.valid && validatedAction.intent === 'LOOK_AROUND') {
      narrative = this.generateLocationDescription(currentLocation);

      return {
        narrative,
        sceneData: this.extractSceneData(currentLocation),
        health: this.state.health,
        inventory: this.state.inventory,
        locationName: this.getLocalizedText((currentLocation as any).name, currentLocation.id),
        playerOptions: this.generatePlayerOptions(currentLocation),
      };
    }

    // TIER 17: Handle MOVE intent (location changes)
    if (validatedAction.valid && validatedAction.intent === 'MOVE' && validatedAction.objectId) {
      // MOVE intent: objectId contains the direction
      const direction = validatedAction.objectId;
      const connections = (currentLocation as any).connections || {};
      const targetLocationId = typeof connections[direction] === 'string'
        ? connections[direction]
        : connections[direction]?.locationId;

      if (targetLocationId) {
        // Execute movement
        this.state.currentLocationId = targetLocationId;

        // FACADE 2.1: Record location change in player memory
        this.playerMemory.setLocation(targetLocationId);

        const nextLocation = this.getCurrentLocation();

        if (nextLocation) {
          const locationName = this.getLocalizedText(nextLocation.name as any, nextLocation.id);
          narrative = this.generateLocationDescription(nextLocation);

          // FACADE 2.2: Check for NPCs that might initiate conversation upon player entry
          const locationNPCs = (nextLocation as any).npcs || [];
          if (locationNPCs.length > 0) {
            // Example: First NPC might greet player if relationship is friendly
            const firstNPCId = locationNPCs[0];
            const relationship = this.npcRelationshipManager.getRelationship(firstNPCId);

            // Only initiate if relationship is friendly and this is first visit or special condition
            if (relationship.relationshipScore > 0.3 && !this.playerMemory.hasVisited(targetLocationId)) {
              const npc = this.getNPC(firstNPCId);
              if (npc) {
                const npcName = this.getLocalizedText(npc.name);

                // Create multilingual greeting messages
                const greetingMessage: Record<Language, string> = {
                  [Language.ENGLISH]: `Welcome! I've been expecting you.`,
                  [Language.SPANISH]: `¡Bienvenido! Te estaba esperando.`,
                  [Language.FRENCH]: `Bienvenue ! Je t'attendais.`,
                  [Language.GERMAN]: `Willkommen! Ich habe dich erwartet.`,
                  [Language.ITALIAN]: `Benvenuto! Ti stavo aspettando.`,
                  [Language.JAPANESE]: `ようこそ！待っていました。`,
                  [Language.MANDARIN]: `欢迎！我一直在等你。`,
                  [Language.RUSSIAN]: `Добро пожаловать! Я тебя ждал.`,
                  [Language.PORTUGUESE]: `Bem-vindo! Eu estava esperando por você.`,
                  [Language.UKRAINIAN]: `Ласкаво просимо! Я на тебе чекав.`,
                  [Language.POLISH]: `Witaj! Czekałem na ciebie.`,
                  [Language.CZECH]: `Vítej! Čekal jsem tě.`,
                };

                // Use conversation manager to handle NPC-initiated conversation
                const initiated = this.conversationManager.npcInitiateConversation(
                  firstNPCId,
                  'greeting',
                  greetingMessage,
                  'low'  // Low urgency greeting
                );

                if (initiated) {
                  const greeting = greetingMessage[this.profile.targetLanguage] || greetingMessage[Language.ENGLISH];
                  narrative = `${narrative}\n\n${npcName}: ${greeting}`;
                  console.log(`[CommunityEngineV3] FACADE 2.2: ${npcName} initiated greeting conversation`);
                }
              }
            }
          }

          // TIER 18: Return early with new location data (no pedagogy)
          return {
            narrative,
            sceneData: this.extractSceneData(nextLocation),
            health: this.state.health,
            inventory: this.state.inventory,
            locationName: locationName,
            playerOptions: this.generatePlayerOptions(nextLocation),
          };
        }
      }
    }

    // Generate narrative using Response Templates with genre awareness
    if (validatedAction.valid && validatedAction.intent) {
      // ===== TIER 9: Handle two-object interactions =====
      if (validatedAction.intent === 'USE_ON' && validatedAction.objectId && validatedAction.targetObjectId) {
        const itemObject = this.objectSystem.getObject(validatedAction.objectId);
        const targetObject = this.objectSystem.getObject(validatedAction.targetObjectId);

        if (itemObject && targetObject) {
          // Evaluate interaction using rules engine
          const interactionResult = this.interactionRules.evaluateInteraction(
            itemObject,
            targetObject,
            this.profile.targetLanguage
          );

          // Use the multilingual narrative from the interaction result
          narrative = interactionResult.narrative[this.profile.targetLanguage] ||
                     interactionResult.narrative[Language.ENGLISH];

          // Apply state changes if interaction was successful
          if (interactionResult.success && interactionResult.stateChanges) {
            if (interactionResult.stateChanges.item) {
              Object.assign(itemObject.properties, interactionResult.stateChanges.item);
            }
            if (interactionResult.stateChanges.target) {
              Object.assign(targetObject.properties, interactionResult.stateChanges.target);
            }
          }

          // Handle unlocks (new areas, objects, etc.)
          if (interactionResult.unlocks) {
            // TODO: Implement unlock logic (add new objects to location, open new exits, etc.)
            console.log('[InteractionRules] Unlocked:', interactionResult.unlocks);
          }

          console.log('[InteractionRules] Interaction outcome:', interactionResult.outcome);
        } else {
          narrative = 'Something went wrong with that interaction.';
        }
      } else {
        // Standard single-object action
        const context: TemplateContext = {
          intent: validatedAction.intent,
          objectId: validatedAction.objectId || '',
          success: true,
          language: this.profile.targetLanguage,

          // TIER 16.6: Removed Berlitz fields from context - they're now in Phase 4
          originalInput: playerInput,
          correctedInput: playerInput, // Will be updated in Phase 4
          hadErrors: false, // Will be updated in Phase 4
          nativeVerb: this.getGenreAwareVerb(validatedAction.intent, this.profile.targetLanguage, this.contentPack.metadata.genre as any),
          nativeObject: validatedAction.objectId, // This will be the object ID, templates will use it to get localized name
        };

        // Get object for context
        if (validatedAction.objectId) {
          const gameObject = this.objectSystem.getObject(validatedAction.objectId);
          if (gameObject) {
            context.objectName = this.getLocalizedText(gameObject.name);
          }
        }

        // Select template with genre awareness (Berlitz + genre flavor)
        narrative = this.responseTemplates.selectTemplate(
          validatedAction.intent,
          context,
          this.profile.targetLanguage,
          this.contentPack.metadata.genre as any  // Pass genre for template selection
        ) || 'You performed the action.';

        // Handle state changes (take items, etc.)
        if (validatedAction.intent === 'TAKE' && validatedAction.objectId) {
          this.handleTakeObject(validatedAction.objectId, currentLocation);
        }
      }
    } else {
      // Translate error message to target language
      const errorMessages: Record<Language, string> = {
        [Language.ENGLISH]: "I don't understand that action.",
        [Language.SPANISH]: "No entiendo esa acción.",
        [Language.FRENCH]: "Je ne comprends pas cette action.",
        [Language.GERMAN]: "Ich verstehe diese Aktion nicht.",
        [Language.ITALIAN]: "Non capisco questa azione.",
        [Language.JAPANESE]: "そのアクションが理解できません。",
        [Language.MANDARIN]: "我不明白那个动作。",
        [Language.RUSSIAN]: "Я не понимаю это действие.",
        [Language.PORTUGUESE]: "Não entendo essa ação.",
        [Language.UKRAINIAN]: "Я не розумію цю дію.",
        [Language.POLISH]: "Nie rozumiem tej akcji.",
        [Language.CZECH]: "Nerozumím této akci.",
      };
      narrative = errorMessages[this.profile.targetLanguage] || errorMessages[Language.ENGLISH];
    }

    const sceneData = this.extractSceneData(currentLocation);

    // TIER 18: All pedagogy removed - pure gameplay only
    const locationName = (currentLocation as any).name
      ? this.getLocalizedText((currentLocation as any).name)
      : currentLocation.id;

    // FACADE 2.2: Check for pending NPC interruptions after player action
    const pendingInterruption = this.conversationManager.executePendingInterruption();
    if (pendingInterruption) {
      const interruptingNPC = this.getNPC(pendingInterruption.npcId);
      if (interruptingNPC) {
        const npcName = this.getLocalizedText(interruptingNPC.name);
        const interruptionMessage = pendingInterruption.message[this.profile.targetLanguage] ||
          pendingInterruption.message[Language.ENGLISH];

        console.log(`[CommunityEngineV3] FACADE 2.2: ${npcName} interrupts (${pendingInterruption.urgency} urgency)`);

        // Prepend interruption to narrative
        narrative = `${npcName}: ${interruptionMessage}\n\n${narrative}`;
      }
    }

    // FACADE 2.2: Release conversation floor at end of turn
    this.conversationManager.releaseFloor();

    // TIER 18: Pure gameplay return with optional simplify/translate features
    const turnData: GameTurnData = {
      narrative,
      sceneData,
      health: this.state.health,
      inventory: this.state.inventory,
      locationName: locationName,
      playerOptions: this.generatePlayerOptions(currentLocation),
    };

    // Add simplify/translate features for UI buttons
    return await this.enhanceWithTranslations(turnData);
  }

  /**
   * Helper: Get conjugated verb appropriate for genre and intent
   */
  private getGenreAwareVerb(intent: ObjectIntent, language: Language, genre: NarrativeGenre): string {
    // This returns the correctly conjugated verb for the genre and intent
    // This is a simplified example. In a real scenario, this would be much more complex,
    // potentially involving a lookup table or a more sophisticated conjugation engine.
    // For now, we'll use a basic mapping.

    const verbMap: Partial<Record<ObjectIntent, Partial<Record<Language, string>>>> = {
      'TAKE': {
        [Language.ENGLISH]: 'Take',
        [Language.SPANISH]: 'Tomas',
        [Language.FRENCH]: 'Prends',
        [Language.GERMAN]: 'Nimmst',
        [Language.ITALIAN]: 'Prendi',
        [Language.JAPANESE]: '取る', // Toru
        [Language.MANDARIN]: '拿', // Ná
        [Language.RUSSIAN]: 'Берешь', // Beresh'
        [Language.PORTUGUESE]: 'Pegas',
        [Language.UKRAINIAN]: 'Береш', // Beresh
        [Language.POLISH]: 'Bierzesz',
        [Language.CZECH]: 'Bereš',
      },
      'EXAMINE': {
        [Language.ENGLISH]: 'Examine',
        [Language.SPANISH]: 'Examinas',
        [Language.FRENCH]: 'Examines',
        [Language.GERMAN]: 'Untersuchst',
        [Language.ITALIAN]: 'Esamini',
        [Language.JAPANESE]: '調べる', // Shiraberu
        [Language.MANDARIN]: '检查', // Jiǎnchá
        [Language.RUSSIAN]: 'Осматриваешь', // Osmatrivayesh'
        [Language.PORTUGUESE]: 'Examinas',
        [Language.UKRAINIAN]: 'Оглядаєш', // Ohliadayesh
        [Language.POLISH]: 'Badzasz',
        [Language.CZECH]: 'Zkoumáš',
      },
      // Add more intents as needed
    };

    // Genre-specific variations (simplified for now)
    // This would ideally be driven by templates or a more complex system
    if (genre === 'horror' && intent === 'TAKE') {
      return verbMap[intent]?.[language] || 'Grab'; // More intense verb
    }

    return verbMap[intent]?.[language] || '';
  }

  /**
   * Process choice-based input (backward compatible)
   */
  private async processChoiceInput(
    playerInput: string,
    currentLocation: LocationNode
  ): Promise<GameTurnData> {
    if (!currentLocation.choices) {
      return await this.processFreeFormInput(playerInput, currentLocation);
    }

    // Find matching choice
    const choice = currentLocation.choices.find(c =>
      c.text.toLowerCase() === playerInput.toLowerCase() ||
      (c.translation && c.translation.toLowerCase() === playerInput.toLowerCase())
    );

    if (!choice) {
      const narrative = 'I don\'t understand that choice. Please select one of the available options.';
      const locationName = (currentLocation as any).name
        ? this.getLocalizedText((currentLocation as any).name)
        : currentLocation.id;
      // TIER 18: No pedagogy, but include simplify/translate features
      const turnData: GameTurnData = {
        narrative,
        sceneData: this.extractSceneData(currentLocation),
        health: this.state.health,
        inventory: this.state.inventory,
        locationName: locationName,
        playerOptions: this.generatePlayerOptions(currentLocation),
      };
      return await this.enhanceWithTranslations(turnData);
    }

    // Move to next location if choice has nextNodeId
    if (choice.nextNodeId) {
      const nextLocation = this.contentPack.world.locations.find(l => l.id === choice.nextNodeId);
      if (nextLocation) {
        this.state.currentLocationId = choice.nextNodeId;
        this.state.visitedLocations.add(choice.nextNodeId);

        const narrative = this.generateLocationDescription(nextLocation);
        const locationName = (nextLocation as any).name
          ? this.getLocalizedText((nextLocation as any).name)
          : nextLocation.id;

        // TIER 18: No pedagogy, but include simplify/translate features
        const turnData: GameTurnData = {
          narrative,
          sceneData: this.extractSceneData(nextLocation),
          health: this.state.health,
          inventory: this.state.inventory,
          locationName: locationName,
          playerOptions: this.generatePlayerOptions(nextLocation),
        };
        return await this.enhanceWithTranslations(turnData);
      }
    }

    // If no next node, just acknowledge the choice
    const narrative = choice.text;
    const locationName = (currentLocation as any).name
      ? this.getLocalizedText((currentLocation as any).name)
      : currentLocation.id;

    // TIER 18: No pedagogy, but include simplify/translate features
    const turnData: GameTurnData = {
      narrative,
      sceneData: this.extractSceneData(currentLocation),
      health: this.state.health,
      inventory: this.state.inventory,
      locationName: locationName,
      playerOptions: this.generatePlayerOptions(currentLocation),
    };

    return await this.enhanceWithTranslations(turnData);
  }

  /**
   * Generate location description from location data
   * Builds narrative from: base description + NPCs + items/objects
   */
  private generateLocationDescription(location: LocationNode): string {
    // Get base description in target language
    let desc = '';
    
    if ((location as any).description) {
      // ContentPack format: description is a multi-language object
      const description = (location as any).description;
      if (typeof description === 'string') {
        desc = description;
      } else {
        desc = this.getLocalizedText(description, 'A location in the world.');
      }
    } else if ((location as any).text) {
      // Legacy format: text is already a string
      desc = (location as any).text;
    } else {
      desc = 'You arrive at a new location.';
    }

    // Add NPCs if present
    if (location.npcs && location.npcs.length > 0) {
      const npcNames = location.npcs
        .map(npcId => {
          const npc = this.getNPC(npcId);
          return npc ? this.getLocalizedText(npc.name) : null;
        })
        .filter(name => name !== null);

      if (npcNames.length > 0) {
        const youSee = getMessage('you_see', this.profile.nativeLanguage);
        const here = getMessage('here', this.profile.nativeLanguage);
        desc += `\n\n${npcNames.map(name => `${youSee} **${name}** ${here}.`).join('\n')}`;
      }
    }

    // Add items/objects if present (ContentPack format uses "items")
    const itemIds = (location as any).items || location.objects || [];
    if (itemIds && itemIds.length > 0) {
      const itemNames = itemIds
        .map((itemId: string) => {
          const obj = this.objectSystem.getObject(itemId);
          return obj ? this.getLocalizedText(obj.name) : null;
        })
        .filter(name => name !== null);

      if (itemNames.length > 0) {
        const youNotice = getMessage('you_notice', this.profile.nativeLanguage);
        desc += `\n\n${youNotice}: ${itemNames.join(', ')}.`;
      }
    }

    // Add exits/connections if present
    const connections = (location as any).connections;
    if (connections && typeof connections === 'object') {
      const exits = Object.entries(connections).map(([direction, connData]: [string, any]) => {
        // Handle both formats: string or {locationId, description} object
        const targetId = typeof connData === 'string' ? connData : connData.locationId;
        const targetLocation = this.contentPack.world.locations.find(l => l.id === targetId);
        const targetName = targetLocation ? this.getLocalizedText(targetLocation.name as any, targetId) : targetId;
        return buildExitDescription(direction, targetName, this.profile.targetLanguage);
      });
      if (exits.length > 0) {
        // TIER 16 FIX: Use localized "Exits" label
        const exitsLabel = getMessage('exits', this.profile.targetLanguage);
        desc += `\n\n${exitsLabel}: ${exits.join(', ')}.`;
      }
    } else if (location.exits && location.exits.length > 0) {
      const exitDescriptions = location.exits.map(exit => {
        const targetLocation = this.contentPack.world.locations.find(l => l.id === exit.locationId);
        const targetName = targetLocation ? this.getLocalizedText(targetLocation.name as any, exit.locationId) : exit.locationId;
        return buildExitDescription(exit.direction, targetName, this.profile.targetLanguage);
      });
      // TIER 16 FIX: Use localized "Exits" label
      const exitsLabel = getMessage('exits', this.profile.targetLanguage);
      desc += `\n\n${exitsLabel}: ${exitDescriptions.join(', ')}.`;
    }

    return desc;
  }

  /**
   * Handle taking an object
   */
  private handleTakeObject(objectId: string, location: LocationNode): void {
    const gameObject = this.objectSystem.getObject(objectId);
    if (!gameObject) return;

    // Add to inventory
    const inventoryItem: InventoryItem = {
      id: objectId,
      name: this.getLocalizedText(gameObject.name),
      description: this.getLocalizedText(gameObject.description),
      icon: '📦', // TODO: Map object properties to icons
    };

    this.state.inventory.push(inventoryItem);

    // FACADE 2.1: Record object pickup in player memory
    this.playerMemory.addToInventory(objectId);

    // Remove from location (handle both ContentPack and legacy format)
    const itemIds = (location as any).items || location.objects;
    if (itemIds && Array.isArray(itemIds)) {
      const idx = itemIds.indexOf(objectId);
      if (idx >= 0) {
        itemIds.splice(idx, 1);
      }
    }

    console.log(`[CommunityEngineV3] Took object: ${inventoryItem.name}`);
  }

  /**
   * Generate player options
   */
  private generatePlayerOptions(location: LocationNode): string[] {
    const options: string[] = [];

    // Add choices if available
    if (location.choices) {
      options.push(...location.choices.map(c => c.text));
    }

    // Add common commands if free input allowed (translated to target language)
    if (location.allowFreeInput !== false) {
      const commonCommands: Record<string, Record<Language, string>> = {
        'look': { [Language.ENGLISH]: 'look around', [Language.SPANISH]: 'mirar alrededor', [Language.FRENCH]: 'regarder autour', [Language.GERMAN]: 'umsehen', [Language.ITALIAN]: 'guardarsi intorno', [Language.JAPANESE]: '見回す', [Language.MANDARIN]: '环顾四周', [Language.RUSSIAN]: 'осмотреться', [Language.PORTUGUESE]: 'olhar em volta', [Language.UKRAINIAN]: 'озирнутися', [Language.POLISH]: 'rozejrzeć się', [Language.CZECH]: 'rozhlédnout se' },
        'examine': { [Language.ENGLISH]: 'examine', [Language.SPANISH]: 'examinar', [Language.FRENCH]: 'examiner', [Language.GERMAN]: 'untersuchen', [Language.ITALIAN]: 'esaminare', [Language.JAPANESE]: '調べる', [Language.MANDARIN]: '检查', [Language.RUSSIAN]: 'осмотреть', [Language.PORTUGUESE]: 'examinar', [Language.UKRAINIAN]: 'оглянути', [Language.POLISH]: 'zbadać', [Language.CZECH]: 'prozkoumat' },
        'take': { [Language.ENGLISH]: 'take', [Language.SPANISH]: 'tomar', [Language.FRENCH]: 'prendre', [Language.GERMAN]: 'nehmen', [Language.ITALIAN]: 'prendere', [Language.JAPANESE]: '取る', [Language.MANDARIN]: '拿', [Language.RUSSIAN]: 'взять', [Language.PORTUGUESE]: 'pegar', [Language.UKRAINIAN]: 'взяти', [Language.POLISH]: 'wziąć', [Language.CZECH]: 'vzít' },
        'move': { [Language.ENGLISH]: 'move', [Language.SPANISH]: 'mover', [Language.FRENCH]: 'bouger', [Language.GERMAN]: 'bewegen', [Language.ITALIAN]: 'muovere', [Language.JAPANESE]: '動く', [Language.MANDARIN]: '移动', [Language.RUSSIAN]: 'двигаться', [Language.PORTUGUESE]: 'mover', [Language.UKRAINIAN]: 'рухатись', [Language.POLISH]: 'ruszyć', [Language.CZECH]: 'pohybovat' },
      };

      options.push(
        commonCommands['look'][this.profile.targetLanguage],
        commonCommands['examine'][this.profile.targetLanguage],
        commonCommands['take'][this.profile.targetLanguage],
        commonCommands['move'][this.profile.targetLanguage]
      );
    }

    return options;
  }

  /**
   * Simplify narrative to A1 level
   *
   * FIXED: Previously used buggy regex that mangled non-English text.
   * Now uses safe, simple fallback: returns only the first sentence.
   */
  private simplifyNarrative(narrative: string): string {
    if (!narrative) return '';

    // Find first sentence ending (., !, or ?)
    const firstSentenceMatch = narrative.match(/^[^.!?]+[.!?]/);

    if (firstSentenceMatch) {
      return firstSentenceMatch[0].trim();
    }

    // If no sentence ending found, return first 100 characters
    if (narrative.length > 100) {
      return narrative.slice(0, 100).trim() + '...';
    }

    // Otherwise return as-is
    return narrative.trim();
  }

  /**
   * Translate narrative to native language using CustomTranslationEngine
   */
  private async translateToNativeLanguage(narrative: string): Promise<string> {
    if (this.profile.nativeLanguage === this.profile.targetLanguage) {
      return ''; // No translation needed
    }

    try {
      console.log(`[CommunityEngineV3] Translating: ${this.profile.targetLanguage} → ${this.profile.nativeLanguage}`);

      const result = await this.translationEngine.translateText(narrative, {
        sourceLanguage: this.profile.targetLanguage,
        targetLanguage: this.profile.nativeLanguage,
        cefrLevel: this.mapDifficultyToCEFR(this.contentPack.metadata.difficulty),
        useGrammarRules: true,
        maintainFormatting: true,
      });

      console.log(`[CommunityEngineV3] Translation result:`, {
        coverage: `${result.coveragePercent.toFixed(1)}%`,
        hasError: !!result.error,
        translatedLength: result.translatedText.length,
        originalLength: result.originalText.length
      });

      if (result.error) {
        console.warn('[CommunityEngineV3] Translation error:', result.error);
        return ''; // Return empty string on error
      }

      if (result && result.translatedText && result.translatedText !== result.originalText) {
        return result.translatedText;
      } else {
        console.warn('[CommunityEngineV3] Translation returned same as original (pivot translation may have failed)');
        return ''; // Don't show identical translation
      }
    } catch (error) {
      console.warn('[CommunityEngineV3] Translation failed:', error);
    }

    // Return empty string if translation fails (UI won't show translate button)
    return '';
  }

  /**
   * Update environmental context for an NPC based on current location
   */
  private updateNPCEnvironmentalContext(npcId: string, location: LocationNode): void {
    // Extract context from location metadata (if available)
    const timeOfDay = (location as any).timeOfDay || 'afternoon';
    const locationType = (location as any).locationType || 'peaceful';
    const weather = (location as any).weather;
    const isIndoors = (location as any).isIndoors || false;
    const crowdLevel = (location as any).npcs?.length > 3 ? 'crowded' :
                       (location as any).npcs?.length > 1 ? 'busy' : 'quiet';

    this.npcContextManager.updateEnvironment(npcId, {
      timeOfDay,
      locationType,
      weather,
      isIndoors,
      crowdLevel,
    });
  }

  /**
   * Apply context-based mood modifiers to NPC
   */
  private applyContextMoodModifiers(npcId: string): void {
    const modifiers = this.npcContextManager.getContextMoodModifiers(npcId);

    if (modifiers.length === 0) return;

    // Apply strongest modifier to mood
    const strongest = this.npcContextManager.getStrongestMoodModifier(npcId);

    if (strongest) {
      // Adjust mood intensity based on context
      const moodProfile = this.npcMoodManager.getMoodProfile(npcId);

      // If context suggests different mood, apply gentle shift
      if (strongest.mood !== moodProfile.currentMood.mood && Math.abs(strongest.intensityChange) > 0.15) {
        this.npcMoodManager.updateMoodFromDiscourse(
          npcId,
          'STATEMENT_FACT',  // Neutral discourse act
          Math.abs(strongest.intensityChange),
          strongest.reason
        );
      }
    }
  }

  /**
   * Get refusal response when NPC refuses to interact
   */
  private getRefusalResponse(npcName: string, language: Language): string {
    const responses: Record<Language, string[]> = {
      [Language.ENGLISH]: [
        `${npcName} turns away from you.`,
        `${npcName} refuses to talk to you.`,
        `${npcName} glares at you coldly and says nothing.`,
      ],
      [Language.SPANISH]: [
        `${npcName} se aleja de ti.`,
        `${npcName} se niega a hablar contigo.`,
        `${npcName} te mira con frialdad y no dice nada.`,
      ],
      [Language.FRENCH]: [
        `${npcName} se détourne de vous.`,
        `${npcName} refuse de vous parler.`,
        `${npcName} vous regarde froidement et ne dit rien.`,
      ],
      [Language.GERMAN]: [
        `${npcName} wendet sich von dir ab.`,
        `${npcName} weigert sich, mit dir zu sprechen.`,
        `${npcName} starrt dich kalt an und sagt nichts.`,
      ],
      [Language.ITALIAN]: [
        `${npcName} si allontana da te.`,
        `${npcName} rifiuta di parlarti.`,
        `${npcName} ti guarda freddamente e non dice nulla.`,
      ],
      [Language.JAPANESE]: [
        `${npcName}はあなたから離れます。`,
        `${npcName}はあなたと話すことを拒否します。`,
        `${npcName}は冷たくあなたを見つめ、何も言いません。`,
      ],
      [Language.MANDARIN]: [
        `${npcName}转身离开你。`,
        `${npcName}拒绝与你交谈。`,
        `${npcName}冷冷地盯着你，什么也不说。`,
      ],
      [Language.RUSSIAN]: [
        `${npcName} отворачивается от вас.`,
        `${npcName} отказывается с вами разговаривать.`,
        `${npcName} холодно смотрит на вас и молчит.`,
      ],
      [Language.PORTUGUESE]: [
        `${npcName} se afasta de você.`,
        `${npcName} se recusa a falar com você.`,
        `${npcName} olha para você friamente e não diz nada.`,
      ],
      [Language.UKRAINIAN]: [
        `${npcName} відвертається від вас.`,
        `${npcName} відмовляється з вами розмовляти.`,
        `${npcName} холодно дивиться на вас і мовчить.`,
      ],
      [Language.POLISH]: [
        `${npcName} odwraca się od ciebie.`,
        `${npcName} odmawia rozmowy z tobą.`,
        `${npcName} patrzy na ciebie zimno i nic nie mówi.`,
      ],
      [Language.CZECH]: [
        `${npcName} se od vás odvrací.`,
        `${npcName} odmítá s vámi mluvit.`,
        `${npcName} se na vás chladně dívá a nic neříká.`,
      ],
    };

    const languageResponses = responses[language] || responses[Language.ENGLISH];
    return languageResponses[Math.floor(Math.random() * languageResponses.length)];
  }

  /**
   * Extract scene data for visualization
   */
  private extractSceneData(location: LocationNode): SceneData {
    // Try to extract from location properties
    const biome: Biome = (location as any).biome || 'town';
    const features = (location as any).features || [];
    const entities = location.npcs || [];
    const timeOfDay: TimeOfDay = (location as any).timeOfDay || 'day';

    return {
      biome,
      features,
      entities,
      timeOfDay,
    };
  }

  /**
   * Convert ContentPack LocationNode to legacy ScenarioNode format for Director
   */
  private locationToScenarioNode(location: LocationNode): ScenarioNode {
    return {
      id: location.id,
      text: location.text,
      translation: location.translation,
      choices: location.choices?.map(c => ({
        text: c.text,
        nextNodeId: c.nextNodeId || null,
        requiredVocab: c.requires,
      })),
      objects: location.objects,
      allowFreeInput: location.allowFreeInput,
      vocabulary: location.vocabulary || [],
      grammar: location.grammar?.[0],
      sceneData: this.extractSceneData(location),
    };
  }

  /**
   * Get pack info for display in UI
   */
  getPackInfo() {
    return {
      title: this.getLocalizedText(this.contentPack.metadata.title),
      author: this.contentPack.metadata.author,
      genre: this.contentPack.metadata.genre,
      // Removed difficulty - all packs are the same difficulty level
      progress: `${this.state.visitedLocations.size}/${this.contentPack.world.locations.length} locations`,
    };
  }

  /**
   * Get Oracle analytics (for debugging/display)
   */
  getOracleAnalytics() {
    return this.oracle.getAnalytics();
  }

  /**
   * FACADE 2.1: Get Player Working Memory
   * NPCs can use this to reference player's past actions and state
   */
  getPlayerMemory(): PlayerMemory {
    return this.playerMemory;
  }

  // FACADE 2.2: Public accessor for Conversation Manager
  getConversationManager(): ConversationManager {
    return this.conversationManager;
  }

  /**
   * Enhance GameTurnData with simplify/translate features
   * Adds simplifiedNarrative and nativeTranslation for UI buttons
   */
  private async enhanceWithTranslations(turnData: GameTurnData): Promise<GameTurnData> {
    // Generate simplified narrative (uses existing simplifyNarrative method)
    turnData.simplifiedNarrative = this.simplifyNarrative(turnData.narrative);

    // Generate native translation (uses existing translateToNativeLanguage method)
    turnData.nativeTranslation = await this.translateToNativeLanguage(turnData.narrative);

    return turnData;
  }

  /**
   * FACADE: Initialize full Facade architecture for all NPCs
   * Creates FacadeNPCController for each NPC with:
   * - ABL Behavior System (goal-driven behaviors)
   * - Beat/Drama System (narrative management)
   * - Advanced WME System (working memory)
   * - Rule Engine (reactions)
   */
  private initializeFacadeNPCs(): void {
    if (!this.contentPack.world.npcs || this.contentPack.world.npcs.length === 0) {
      console.log('[CommunityEngineV3] No NPCs to initialize with Facade architecture');
      return;
    }

    console.log(`[CommunityEngineV3] Initializing ${this.contentPack.world.npcs.length} NPCs with full Facade architecture...`);

    for (const npc of this.contentPack.world.npcs) {
      try {
        const facadeNPC = new FacadeNPCController(
          npc,
          this.profile,
          this.playerMemory,
          this.conversationManager
        );

        this.facadeNPCs.set(npc.id, facadeNPC);
        console.log(`[CommunityEngineV3] ✓ ${npc.id} initialized with ABL behaviors, drama beats, WME, and rules`);
      } catch (error) {
        console.error(`[CommunityEngineV3] Failed to initialize Facade NPC ${npc.id}:`, error);
        // Continue with other NPCs
      }
    }

    console.log(`[CommunityEngineV3] Facade architecture complete: ${this.facadeNPCs.size} NPCs ready`);
  }

  /**
   * FACADE: Get Facade-powered NPC controller
   */
  private getFacadeNPC(npcId: string): FacadeNPCController | undefined {
    return this.facadeNPCs.get(npcId);
  }
}
