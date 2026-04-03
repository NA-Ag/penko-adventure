/**
 * Facade Engine - Top-level Orchestrator
 *
 * Coordinates all Facade subsystems to create the interactive drama experience.
 * This replaces CommunityEngineV3's logic for Facade-mode gameplay.
 *
 * Architecture:
 * - Loads initial state and beats from JSON data
 * - Initializes all subsystems (WorldMemory, DramaManager, NLU, BehaviorExecutor)
 * - Processes player input through the full Facade pipeline
 * - Returns animation cues and dialogue for the UI to render
 */

import fs from 'fs';
import path from 'path';
import {
  FacadeDataBundle,
  FacadeInitialWorldState,
  FacadeBeat,
  DiscourseActPattern,
  AnimationCue,
  BeatID,
} from '../types/facade';
import { WorldMemory } from './facade-engine/worldMemory';
import { BehaviorExecutor } from './facade-engine/behaviorExecutor';
import { FacadeNLU } from './facade-engine/facadeNLU';
import { DramaManager } from './facade-engine/dramaManager';
import { ScribblenautsEngine } from './ScribblenautsEngine';
import { Oracle, TurnSnapshot } from './Oracle';
import { Director } from './Director';
import { GameTurnData, Language } from '../types';

export interface FacadeEngineConfig {
  dataDirectory?: string;        // Path to facade data files
  autoStart?: boolean;            // Automatically start first beat
  debugMode?: boolean;            // Enable verbose logging
  language?: Language;            // UI language (for future localization)
}

export class FacadeEngine {
  private worldMemory!: WorldMemory;
  private behaviorExecutor!: BehaviorExecutor;
  private nlu!: FacadeNLU;
  private dramaManager!: DramaManager;
  private scribblenautsEngine!: ScribblenautsEngine;
  private oracle!: Oracle;
  private director!: Director;

  // Tier 22: Layered Dictionary System

  private config: FacadeEngineConfig;
  private isInitialized: boolean = false;
  private isSessionActive: boolean = false;

  // Cached data
  private beats: FacadeBeat[] = [];
  private initialState!: FacadeInitialWorldState;
  private daPatterns: DiscourseActPattern[] = [];

  // Turn tracking
  private currentTurnNumber: number = 0;
  private turnStartTime: number = 0;

  constructor(config: FacadeEngineConfig = {}) {
    this.config = {
      dataDirectory: config.dataDirectory ?? path.join(__dirname, '../data/facade'),
      autoStart: config.autoStart ?? true,
      debugMode: config.debugMode ?? false,
      language: config.language ?? Language.ENGLISH,
    };

    console.log('[FacadeEngine] Constructed with config:', this.config);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the Facade engine
   * Loads all data and creates subsystems
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[FacadeEngine] Already initialized');
      return;
    }

    console.log('='.repeat(70));
    console.log('FACADE ENGINE INITIALIZATION');
    console.log('='.repeat(70));
    console.log('');

    // Load data
    console.log('[FacadeEngine] Loading Facade data...');
    await this.loadData();

    // Initialize subsystems
    console.log('[FacadeEngine] Initializing subsystems...');
    await this.initializeSubsystems();

    this.isInitialized = true;

    console.log('');
    console.log('[FacadeEngine] ✅ Initialization complete');
    console.log('='.repeat(70));
    console.log('');

    // Auto-start if configured
    if (this.config.autoStart) {
      await this.startSession();
    }
  }

  /**
   * Load Facade data from JSON files
   */
  private async loadData(): Promise<void> {
    const dataDir = this.config.dataDirectory!;

    // Load data bundle
    const bundlePath = path.join(dataDir, 'facade-data-bundle.json');
    const bundleData = fs.readFileSync(bundlePath, 'utf-8');
    const bundle: FacadeDataBundle = JSON.parse(bundleData);

    this.beats = bundle.beats;
    this.initialState = bundle.initialState;
    this.daPatterns = bundle.discourseActPatterns;

    console.log(`  ✓ Loaded ${this.beats.length} beats`);
    console.log(`  ✓ Loaded ${this.daPatterns.length} discourse act patterns`);
    console.log(`  ✓ Loaded initial world state`);
  }

  /**
   * Initialize all subsystems
   */
  private async initializeSubsystems(): Promise<void> {
    // Create world memory
    this.worldMemory = new WorldMemory(this.initialState);
    console.log('  ✓ WorldMemory initialized');

    // Create behavior executor
    this.behaviorExecutor = new BehaviorExecutor(this.worldMemory);
    console.log('  ✓ BehaviorExecutor initialized');

    // Create NLU
    this.nlu = new FacadeNLU(this.daPatterns, this.worldMemory);
    console.log('  ✓ FacadeNLU initialized');

    // Create drama manager
    this.dramaManager = new DramaManager(
      this.beats,
      this.worldMemory,
      this.behaviorExecutor
    );
    console.log('  ✓ DramaManager initialized');

    // Create Scribblenauts engine
    this.scribblenautsEngine = new ScribblenautsEngine({
      debugMode: this.config.debugMode,
    });
    await this.scribblenautsEngine.initialize();
    console.log('  ✓ ScribblenautsEngine initialized');

    // Create Oracle (metrics gathering)
    this.oracle = new Oracle();
    console.log('  ✓ Oracle initialized');

    // Create Director (AI Director)
    this.director = new Director(this.oracle, this.worldMemory, {
      debugMode: this.config.debugMode,
    });
    console.log('  ✓ Director initialized');
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Start a new Facade session
   */
  async startSession(): Promise<GameTurnData> {
    if (!this.isInitialized) {
      throw new Error('[FacadeEngine] Cannot start session - engine not initialized');
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('FACADE SESSION START');
    console.log('='.repeat(70));
    console.log('');

    this.isSessionActive = true;

    // Select and execute the opening beat
    const selectionResult = await this.dramaManager.selectNextBeat();

    if (!selectionResult.selected || !selectionResult.beat) {
      throw new Error('[FacadeEngine] Failed to select opening beat');
    }

    console.log(`[FacadeEngine] Starting with beat: ${selectionResult.beat.name}`);

    // Execute the opening beat
    const cues = await this.dramaManager.executeBeat(selectionResult.beat);

    // Convert to GameTurnData
    const turnData = this.createGameTurnDataFromCues(cues);

    console.log('[FacadeEngine] Session started successfully');
    console.log('='.repeat(70));
    console.log('');

    return turnData;
  }

  /**
   * Alias for startSession to match GameEngineInstance interface
   */
  async initGame(): Promise<GameTurnData> {
      return this.startSession();
  }

  /**
   * End the current session
   */
  endSession(): void {
    console.log('[FacadeEngine] Session ended');
    this.isSessionActive = false;
  }

  // ============================================================================
  // MAIN GAME LOOP
  // ============================================================================

  /**
   * Process a turn - the main entry point for player input
   * This is called by the UI when the player submits text
   */
  async processTurn(playerInput: string): Promise<GameTurnData> {
    if (!this.isInitialized) {
      throw new Error('[FacadeEngine] Engine not initialized');
    }

    if (!this.isSessionActive) {
      throw new Error('[FacadeEngine] No active session');
    }

    console.log('');
    console.log('='.repeat(70));
    console.log(`PROCESSING TURN: "${playerInput}"`);
    console.log('='.repeat(70));
    console.log('');

    // Track turn start
    this.currentTurnNumber++;
    this.turnStartTime = Date.now();
    const previousBeat = this.worldMemory.getCurrentBeat();

    // STEP 0: Try to parse as object spawn (Scribblenauts layer)
    console.log('[FacadeEngine] STEP 0: Scribblenauts Object Parsing');
    const objectParse = this.scribblenautsEngine.parseInput(playerInput);

    if (objectParse.success && objectParse.baseObject) {
      console.log(`[FacadeEngine] 🎨 Object spawn detected: ${objectParse.baseObject.name}`);
      console.log(`[FacadeEngine] Modifiers: ${objectParse.modifiers.length}`);

      // Spawn the object in the current location
      const currentLocation = this.worldMemory.getCharacterState('grace').position;

      const spawnedObject = this.scribblenautsEngine.spawnObject({
        baseObjectId: objectParse.baseObject.id,
        modifiers: objectParse.modifiers,
        position: currentLocation,
        owner: 'player',
      });

      // Notify world memory about the new object
      this.worldMemory.setFact(`object.${spawnedObject.instanceId}.exists`, true);
      this.worldMemory.setFact(`object.${spawnedObject.instanceId}.location`, currentLocation);

      console.log(`[FacadeEngine] ✅ Spawned ${objectParse.baseObject.name} at ${currentLocation}`);

      // Characters will react to the object on next turn through regular NLU
    } else {
      if (objectParse.unrecognizedWords.length > 0 && this.config.debugMode) {
        console.log(`[FacadeEngine] No object spawn (unrecognized: ${objectParse.unrecognizedWords.join(', ')})`);
      }
    }

    // STEP 1: Parse input into Discourse Act
    console.log('[FacadeEngine] STEP 1: NLU Processing');
    const daResult = this.nlu.parseInput(playerInput);
    const daWME = this.nlu.createDiscourseActWME(daResult);

    console.log(`[FacadeEngine] Recognized DA: ${daResult.daType} (confidence: ${daResult.confidence.toFixed(2)})`);

    // STEP 2: Process discourse act through drama manager
    console.log('[FacadeEngine] STEP 2: Drama Manager Processing');
    await this.dramaManager.processDiscourseAct(daWME);

    // STEP 3: Select next beat (or continue current beat)
    console.log('[FacadeEngine] STEP 3: Beat Selection');
    const currentBeat = this.worldMemory.getCurrentBeat();
    let cues: AnimationCue[] = [];

    // Check if we need to select a new beat
    const currentBeatStep = this.worldMemory.getCurrentBeatStep();
    const currentBeatObj = currentBeat !== undefined ? this.dramaManager.getBeat(currentBeat) : undefined;

    if (!currentBeatObj || currentBeatStep >= currentBeatObj.steps.length) {
      // Need to select a new beat
      const selectionResult = await this.dramaManager.selectNextBeat();

      if (selectionResult.selected && selectionResult.beat) {
        console.log(`[FacadeEngine] Selected new beat: ${selectionResult.beat.name}`);
        cues = await this.dramaManager.executeBeat(selectionResult.beat);
      } else {
        console.log('[FacadeEngine] No beat selected - session may be ending');
        // Generate a closing message
        cues = [
          this.behaviorExecutor.speak(
            'grace',
            "Well, I think we've covered a lot tonight. Thanks for coming over."
          ),
          this.behaviorExecutor.speak(
            'trip',
            "Yeah, it's been... interesting. See you around."
          ),
        ];

        this.endSession();
      }
    } else {
      // Continue current beat
      console.log(`[FacadeEngine] Continuing beat: ${currentBeatObj.name} (step ${currentBeatStep + 1}/${currentBeatObj.steps.length})`);

      // Execute next steps until we hit a player wait
      while (currentBeatStep < currentBeatObj.steps.length) {
        const step = currentBeatObj.steps[currentBeatStep];
        const stepCues = await this.behaviorExecutor.executeBeatStep(step);
        cues.push(...stepCues);

        this.worldMemory.advanceBeatStep();

        if (step.waitFor === 'playerInput') {
          break; // Wait for next player input
        }
      }
    }

    // STEP 4: Convert to GameTurnData
    console.log('[FacadeEngine] STEP 4: Generate Output');
    const turnData = this.createGameTurnDataFromCues(cues);

    // STEP 5: Oracle & Director (L4D AI Director system)
    console.log('[FacadeEngine] STEP 5: Oracle & Director Processing');

    // Record turn metrics with Oracle
    const currentBeatAfter = this.worldMemory.getCurrentBeat();
    const beatChanged = previousBeat !== currentBeatAfter;

    const previousTension = this.worldMemory.getRelationshipTension();

    const turnSnapshot: TurnSnapshot = {
      turnNumber: this.currentTurnNumber,
      timestamp: Date.now(),
      playerInput,
      actionSuccessful: cues.length > 0, // Had some response
      beatChanged,
      tensionDelta: 0, // Will be updated below
    };

    this.oracle.recordTurn(turnSnapshot);

    // Update tension metrics
    const currentTension = this.worldMemory.getRelationshipTension();
    turnSnapshot.tensionDelta = (currentTension - previousTension) / 100;

    this.oracle.updateRelationshipTension(currentTension);
    this.oracle.updateNarrativeTension(currentTension / 100); // Normalize to 0-1

    // Record beat completion if applicable
    if (beatChanged && currentBeatAfter !== undefined) {
      const beatObj = this.dramaManager.getBeat(currentBeatAfter);
      if (beatObj) {
        this.oracle.recordBeatCompletion(beatObj.name, this.currentTurnNumber);
      }
    }

    // Director evaluation and intervention
    await this.director.evaluateAndIntervene();

    // Debug logging
    if (this.config.debugMode) {
      this.worldMemory.printStateSummary();
      this.dramaManager.printState();
      this.scribblenautsEngine.debugPrintObjects();
      this.oracle.debugPrintMetrics();
      this.director.debugPrintState();
    }

    // Advance Scribblenauts turn counter
    this.scribblenautsEngine.advanceTurn();

    console.log('[FacadeEngine] Turn complete');
    console.log('='.repeat(70));
    console.log('');

    return turnData;
  }

  // ============================================================================
  // OUTPUT GENERATION
  // ============================================================================

  /**
   * Convert animation cues to GameTurnData for the UI
   */
  private createGameTurnDataFromCues(cues: AnimationCue[]): GameTurnData {
    // Collect all dialogue from cues
    const dialogueLines: string[] = [];

    for (const cue of cues) {
      if (cue.cueType === 'speak' && cue.data.dialogue) {
        const speaker = cue.character === 'grace' ? 'Grace' : cue.character === 'trip' ? 'Trip' : 'System';
        dialogueLines.push(`${speaker}: ${cue.data.dialogue}`);
      }
    }

    // Join all dialogue into narrative
    const narrative = dialogueLines.join('\n\n');

    // Get current scene data
    const graceState = this.worldMemory.getCharacterState('grace');
    const tripState = this.worldMemory.getCharacterState('trip');

    const sceneData = {
      biome: 'interior' as const,
      features: [
        graceState.position,
        tripState.position,
        'apartment_living_room',
      ],
      entities: ['grace', 'trip', 'player'],
      timeOfDay: 'night' as const,
    };

    // Get current world state for metadata
    const tension = this.worldMemory.getRelationshipTension();
    const currentBeat = this.worldMemory.getCurrentBeat();

    return {
      narrative: narrative || 'The apartment is quiet. Grace and Trip are waiting...',
      sceneData,
      playerOptions: this.generatePlayerOptions(),
      inventory: [], // Facade doesn't have traditional inventory
      health: 100,   // Not used in Facade
      locationName: 'Grace & Trip\'s Apartment',
    };
  }

  /**
   * Generate contextual player options based on current state
   */
  private generatePlayerOptions(): string[] {
    const options: string[] = [];

    const graceAffinity = this.worldMemory.getCharacterState('grace').affinityToPlayer;
    const tripAffinity = this.worldMemory.getCharacterState('trip').affinityToPlayer;
    const tension = this.worldMemory.getRelationshipTension();

    // Always available options
    options.push('Agree');
    options.push('Disagree');

    // Context-dependent options
    if (tension > 50) {
      options.push('Try to calm things down');
      options.push('Ask what\'s wrong');
    } else {
      options.push('Ask about their relationship');
      options.push('Compliment the apartment');
    }

    if (graceAffinity > 20) {
      options.push('Support Grace');
    }

    if (tripAffinity > 20) {
      options.push('Support Trip');
    }

    if (tension > 70) {
      options.push('Excuse yourself and leave');
    }

    return options.slice(0, 6); // Limit to 6 options
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Check if engine is initialized
   */
  isEngineInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if session is active
   */
  isSessionRunning(): boolean {
    return this.isSessionActive;
  }

  /**
   * Get current world state (read-only)
   */
  getWorldState(): any {
    return this.worldMemory?.getState();
  }

  /**
   * Get current beat name
   */
  getCurrentBeatName(): string | undefined {
    const currentBeat = this.worldMemory?.getCurrentBeat();
    if (currentBeat !== undefined) {
      const beat = this.dramaManager?.getBeat(currentBeat);
      return beat?.name;
    }
    return undefined;
  }

  /**
   * Get Integrated Lookup Service (Tier 22)
   * Exposes the layered dictionary system to other components
   */
  /**
   * Debug: Test NLU parsing
   */
  debugNLU(input: string): void {
    if (this.nlu) {
      this.nlu.debugPatternMatching(input);
    } else {
      console.error('[FacadeEngine] NLU not initialized');
    }
  }

  /**
   * Debug: Print full engine state
   */
  debugPrintState(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('FACADE ENGINE STATE');
    console.log('='.repeat(70));
    console.log(`Initialized: ${this.isInitialized}`);
    console.log(`Session Active: ${this.isSessionActive}`);
    console.log(`Current Beat: ${this.getCurrentBeatName() ?? 'None'}`);
    console.log('');

    if (this.worldMemory) {
      this.worldMemory.printStateSummary();
    }

    if (this.dramaManager) {
      this.dramaManager.printState();
    }

    if (this.behaviorExecutor) {
      this.behaviorExecutor.printAnimationQueue();
    }

    console.log('='.repeat(70));
    console.log('');
  }
}
