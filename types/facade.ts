/**
 * Facade Engine TypeScript Interfaces
 *
 * These interfaces represent the core data structures from the Facade interactive drama system,
 * converted from Java/ABL to TypeScript for use in Penko's narrative engine.
 *
 * Based on analysis of Facade-master source code:
 * - facade/characters/wmedef/*.java (Working Memory Elements)
 * - facade/beats/*.java (Beat system)
 * - facade/util/DAType.java (Discourse Act types)
 * - facade/util/BeatID.java (Beat identifiers)
 */

// ============================================================================
// DISCOURSE ACT (DA) TYPES
// ============================================================================

/**
 * Discourse Acts - How player input is categorized
 * Represents the player's communicative intent
 * From facade/util/DAType.java
 */
export enum DiscourseActType {
  NULL = -1,

  // Agreement/Disagreement
  Agree = 0,
  Disagree = 1,
  MildAgreement = 45,
  StrongAgreement = 46,
  MildDisagreement = 47,
  StrongDisagreement = 48,

  // Exclamations
  GeneralExcl = 2,
  PositiveExcl = 3,
  NegativeExcl = 4,

  // Expressions
  Express = 5,           // Has sub-params: happy, laugh, sad, angry
  MaybeUnsure = 6,
  DontUnderstand = 7,

  // Social
  Thank = 8,
  ApologizeExcuseMe = 9,
  Greet = 30,
  GetAttention = 31,
  Goodbye = 32,

  // Referential
  ReferTo = 10,          // Refers to a topic/object/person

  // Emotional/Social Acts
  Praise = 11,           // Praise a character
  Criticize = 12,        // Criticize a character
  Ally = 13,             // Ally with a character
  Oppose = 14,           // Oppose a character
  Comfort = 17,          // Comfort someone
  Support = 22,          // Support someone

  // Physical/Romantic
  Flirt = 15,
  Hug = 16,
  Kiss = 18,
  Intimate = 19,
  PhysicallyFavor = 35,

  // Questions/Inquiry
  HowAreYou = 20,
  AreYouOkay = 21,
  Explain = 23,          // Ask to explain
  ExplainNot = 24,       // Ask NOT to explain
  Advice = 25,           // Ask for advice
  AdviceNot = 26,        // Advise NOT to do something
  ExplBig = 27,          // Ask for big explanation
  ExplBigNot = 28,       // Don't explain the big thing

  // De-escalation
  Pacify = 29,           // Try to calm situation

  // Special/Meta
  Misc = 33,
  Inappropriate = 34,
  LeaveApartment = 36,
  LeaveForKitchen = 37,

  // Uncooperative behavior detection
  UncoopNotSpeaking = 38,
  UncoopNotMoving = 39,
  UncoopActingWeird = 40,
  UncoopFidgety = 41,

  // System
  Timeout = 42,
  SystemDoesntUnderstand = 43,
  NonAnswer = 44,
  Distraction = 49,
  MildConfusion = 50,
  IgnoreThis = 51,
  Utility1 = 52,
  Utility2 = 53,
}

/**
 * Express emotion sub-parameters
 */
export enum DAExpressParam {
  happy = 54,
  laugh = 55,
  sad = 56,
  angry = 57,
}

/**
 * Story topic parameters - main narrative threads
 */
export enum DAStoryTopicParam {
  none = 58,
  artistAdv = 59,        // Artist/Advertising topic
  facade = 60,           // The "facade" they're maintaining
  rockyMarriage = 61,    // Their troubled marriage
}

/**
 * Beat reference parameters - specific story beats
 */
export enum DABeatRefParam {
  GGreetsP = 62,                // Grace greets player
  explDatAnniv = 63,            // Explaining date/anniversary
  artistAdv_decorating = 64,    // Artist topic: decorating
  facade_drinks = 65,           // Facade topic: drinks
  rockyMarriage_italyPic = 66,  // Marriage topic: Italy picture
  phoneCall = 67,               // Phone call beat
}

/**
 * Character parameters
 */
export enum DACharParam {
  grace = 68,
  trip = 69,
  player = 70,
}

/**
 * Satellite topic parameters - side topics that can emerge
 */
export enum DASatelliteTopicParam {
  marriage = 71,
  divorce = 72,
  sex = 73,
  therapy = 74,
  infidelity = 75,
  maria = 76,
  vince = 77,
  gracesParents = 78,
  tripsParents = 79,
}

/**
 * Object parameters - interactive objects in the scene
 */
export enum DAObjectParam {
  couch = 80,
  sideTable = 81,
  workTable = 82,
  // ... more objects
}

// ============================================================================
// WORKING MEMORY ELEMENTS (WME)
// ============================================================================

/**
 * Discourse Act WME - represents a player's input action
 * From facade/characters/wmedef/DAWME.java
 */
export interface DiscourseActWME {
  id: DiscourseActType;    // The type of discourse act
  charID: DACharParam;     // Character it's directed at
  param1: number;          // Context-dependent parameter 1
  param2: number;          // Context-dependent parameter 2
  param3: number;          // Context-dependent parameter 3
  timestamp: number;       // When this DA occurred (milliseconds)
  handledStatus: number;   // 0=unhandled, 1=partially handled, 2=fully handled
}

/**
 * Beat Status WME - tracks the current state of beat execution
 * From facade/characters/wmedef/BeatStatusWME.java
 */
export interface BeatStatusWME {
  status: number;                      // Current beat status (enum)
  curBGSig: string;                    // Current beat goal signature
  bCommitPointReached: boolean;        // Has beat reached commit point?
  bGistPointReached: boolean;          // Has beat's gist been conveyed?
  bTxningOut: boolean;                 // Is beat transitioning out?
  abortReason: number;                 // Why beat was aborted (if applicable)
  mixInAllowed_pushTooFar: boolean;    // Can "push too far" mix-ins interrupt?
  mixInAllowed_satellite: boolean;     // Can satellite topics interrupt?
  mixInAllowed_redirectConnect: boolean;
  mixInAllowed_object: boolean;        // Can object interactions interrupt?
  mixInAllowed_DA: boolean;            // Can discourse acts interrupt?
  mixInAllowed_deflect: boolean;
  mixInAllowed_pattern: boolean;
  mixInAllowed_ltb: boolean;           // "Listen to both" mode
  disallowedPushTooFarObjects: string[]; // Objects that shouldn't trigger "push too far"
}

/**
 * Mood WME - tracks character emotional state
 * From facade/characters/wmedef/MoodWME.java
 */
export interface MoodWME {
  character: 'grace' | 'trip';
  mood: number;              // Mood level (-100 to 100 range typical)
  tension: number;           // Tension level
  intimacy: number;          // Intimacy level with player
  affinity: number;          // Affinity toward player
}

/**
 * Beat Argument WME - parameters passed to a beat
 * From facade/characters/wmedef/BeatArgumentWME.java
 */
export interface BeatArgumentWME {
  txnInType: number;         // Transition-in type
  abortReason?: number;      // Why previous beat was aborted
  subtopic?: number;         // Subtopic index
  isRedo?: boolean;          // Is this a redo of the beat?
}

// ============================================================================
// BEAT SYSTEM
// ============================================================================

/**
 * Beat IDs - Unique identifiers for all beats in Facade
 * From facade/util/BeatID.java
 */
export enum BeatID {
  NOTABEAT = -1,

  // Opening sequence (Tier 1)
  PBehindDoor_T1 = 0,
  TGreetsP_T1 = 1,
  TFetchesG_T1 = 2,
  GGreetsP_T1 = 3,
  ExplDatAnniv_T1 = 4,

  // Phone call beats
  PhoneCall_NGPA_T1 = 5,
  PhoneCall_NTPA_T1 = 6,

  // Transitions
  TxnT1toT2NGPA = 7,
  TxnT1toT2TPA = 8,

  // Topic beats - Artist/Advertising (Tier 1)
  ArtistAdv_GPA_T1 = 9,
  ArtistAdv_TPA_T1 = 10,
  ArtistAdv_N_T1 = 11,

  // Topic beats - Facade (Tier 1)
  Facade_GPA_T1 = 12,
  Facade_NTPA_T1 = 13,

  // Topic beats - Rocky Marriage (Tier 1)
  RockyMarriage_GPA_T1 = 14,
  RockyMarriage_TPA_T1 = 15,
  RockyMarriage_N_T1 = 16,

  // Topic beats (Tier 2)
  ArtistAdv_GPA_T2 = 17,
  ArtistAdv_TPA_T2 = 18,
  Facade_GPA_T2 = 19,
  Facade_TPA_T2 = 20,
  RockyMarriage_GPA_T2 = 21,
  RockyMarriage_TPA_T2 = 22,

  // One-on-one beats (Tier 2)
  OneOnOneGAffChr_T2 = 23,
  OneOnOneTAffChr_T2 = 24,
  OneOnOneGNonAffChr_T2 = 25,
  OneOnOneTNonAffChr_T2 = 26,
  NonAffChrGReturns_T2 = 27,
  NonAffChrTReturns_T2 = 28,
  RomPrp_GPA_T2 = 29,

  // Crisis and resolution (Part 2)
  TxnT2ToT3 = 30,
  PartI_Crisis = 31,
  C2TGGlue_P2 = 32,
  TherapyGame_P2 = 33,
  RevBuildup_P2 = 34,
  Revelations_P2 = 35,

  // Ending beats
  EndingNoRevs = 36,
  EndingSelfsOnly = 37,
  EndingRelatsOnly = 38,
  EndingSRNotGTR = 39,
  EndingGTR = 40,
}

/**
 * Beat Precondition - conditions that must be met for a beat to be selectable
 */
export interface BeatPrecondition {
  type: 'wme' | 'fact' | 'history' | 'timing' | 'custom';
  condition: string;        // Evaluable condition expression
  required: boolean;        // Must be true (vs. should be true for priority)
  weight?: number;          // How much this affects beat priority
}

/**
 * Beat Step - a single action within a beat's execution
 */
export interface BeatStep {
  character: 'grace' | 'trip' | 'player' | 'system';
  action: string;           // Action to perform (e.g., 'speak', 'moveTo', 'gesture')
  args: any[];              // Arguments for the action
  dialogue?: string;        // Dialogue line (if speaking)
  dialogueAudio?: string;   // Audio file for dialogue
  waitFor?: 'playerInput' | 'animationEnd' | 'duration' | 'none';
  waitDuration?: number;    // Duration in ms (if waitFor === 'duration')
  mixinCheck?: boolean;     // Should check for mix-ins after this step?
}

/**
 * Beat Definition - complete definition of a story beat
 */
export interface FacadeBeat {
  id: BeatID;
  name: string;                           // Human-readable name
  tier: 1 | 2 | 3;                       // Story tier/act
  topic?: DAStoryTopicParam;             // Associated story topic
  affinity?: 'grace' | 'trip' | 'neutral'; // Character affinity required

  // Beat lifecycle hooks
  preconditions: BeatPrecondition[];     // When can this beat be selected?
  priority: number;                       // Base priority (0-100)
  maxActivations: number;                 // How many times can this beat run?
  activationCount?: number;               // How many times has it run? (runtime state)

  // Beat execution
  initAction?: string;                    // Function to call on init
  selectAction?: string;                  // Function to call on select
  succeedAction?: string;                 // Function to call on success
  failAction?: string;                    // Function to call on failure
  abortAction?: string;                   // Function to call on abort

  steps: BeatStep[];                      // Sequence of actions in this beat

  // Beat effects
  commitPoint?: number;                   // Step index where beat commits (can't be interrupted)
  gistPoint?: number;                     // Step index where beat's gist is conveyed
  worldEffects?: WorldEffect[];          // Changes to world state on success

  // Mix-in configuration
  allowMixins: {
    pushTooFar: boolean;
    satellite: boolean;
    object: boolean;
    DA: boolean;
    deflect: boolean;
    pattern: boolean;
  };
}

/**
 * World Effect - a change to world state
 */
export interface WorldEffect {
  type: 'setFact' | 'incrementCounter' | 'mood' | 'relationship' | 'flag';
  target: string;          // What to affect (fact name, counter name, etc.)
  value: any;              // New value or delta
  operation?: 'set' | 'add' | 'multiply';  // How to apply value
}

// ============================================================================
// WORLD MEMORY & STATE
// ============================================================================

/**
 * Character State - internal state for Grace or Trip
 */
export interface CharacterState {
  character: 'grace' | 'trip';

  // Core attributes
  mood: number;                 // Current mood (-100 to 100)
  tension: number;              // Tension level (0-100)
  affinityToPlayer: number;     // How much they like the player (-100 to 100)
  affinityToPartner: number;    // How much they like their partner

  // Goals & desires
  activeGoals: string[];        // Current active goals
  desireToReveal: number;       // Desire to reveal secrets (0-100)
  desireToMaintainFacade: number; // Desire to keep up appearances

  // Memory
  revealedSecrets: string[];    // What they've revealed
  playerActions: string[];      // Actions player has taken toward them

  // Physical state
  position: string;             // Location in apartment
  heldObject?: string;          // Object they're holding
  currentAnimation?: string;    // Current animation/gesture
}

/**
 * Relationship State - state between two characters
 */
export interface RelationshipState {
  from: 'grace' | 'trip' | 'player';
  to: 'grace' | 'trip' | 'player';
  affinity: number;             // How much 'from' likes 'to' (-100 to 100)
  tension: number;              // Tension between them (0-100)
  intimacy: number;             // Closeness level (0-100)
  trustLevel: number;           // Trust level (0-100)
}

/**
 * Initial World State - starting state for a Facade session
 * Loaded from converted WME definitions
 */
export interface FacadeInitialWorldState {
  // Global facts about the world
  globalFacts: Record<string, any>;

  // Character initial states
  characterStates: {
    grace: CharacterState;
    trip: CharacterState;
  };

  // Initial relationships
  relationships: RelationshipState[];

  // Story state
  relationshipTension: number;  // Overall tension between Grace & Trip (0-100)
  currentTier: 1 | 2 | 3;      // Which act/tier we're in
  beatHistory: BeatID[];        // Beats that have been played

  // Timing
  sessionStartTime: number;     // When session started (ms)
  currentTime: number;          // Current time (ms)

  // Player state
  playerPosition: string;       // Where player is
  playerHeldObject?: string;    // What player is holding
  playerTotalSpeechActs: number; // How many times player has spoken
}

/**
 * Runtime World Memory - mutable state during gameplay
 * This is updated continuously as the story progresses
 */
export interface FacadeWorldMemory extends FacadeInitialWorldState {
  // Current beat state
  currentBeat?: BeatID;
  currentBeatStep: number;
  beatStatusWME: BeatStatusWME;

  // Pending discourse acts
  unhandledDiscourseActs: DiscourseActWME[];
  recentDiscourseActs: DiscourseActWME[]; // Last 10 DAs for context

  // Beat tracking
  beatActivationCounts: Map<BeatID, number>;

  // Dynamic flags
  flags: Record<string, boolean>;
  counters: Record<string, number>;
}

// ============================================================================
// BEAT SELECTION & DRAMA MANAGEMENT
// ============================================================================

/**
 * Beat Selection Result - result of drama manager's beat selection
 */
export interface BeatSelectionResult {
  selected: boolean;
  beat?: FacadeBeat;
  reason: string;              // Why this beat was (or wasn't) selected
  candidateCount: number;      // How many beats were candidates
  alternativeBeat?: BeatID;   // If selected beat unavailable, next best option
}

/**
 * Mix-in Beat - short interruption beat
 */
export interface MixinBeat {
  type: 'pushTooFar' | 'satellite' | 'object' | 'DA' | 'deflect' | 'pattern';
  trigger: string;             // What triggered this mixin
  beat: FacadeBeat;            // The mixin beat to execute
  priority: number;            // Mixin priority
  returnToPreviousBeat: boolean; // Should we return after mixin?
}

// ============================================================================
// BEHAVIOR & ANIMATION
// ============================================================================

/**
 * Character Behavior - an action a character can perform
 */
export interface CharacterBehavior {
  character: 'grace' | 'trip';
  behaviorId: string;

  // Action types
  type: 'speak' | 'moveTo' | 'gesture' | 'pickUp' | 'putDown' | 'gaze' | 'animation';

  // Parameters (vary by type)
  dialogue?: string;
  dialogueAudio?: string;
  targetLocation?: string;
  targetObject?: string;
  gestureType?: string;
  animationName?: string;

  // Timing
  duration?: number;           // Expected duration in ms
  interruptible: boolean;      // Can this be interrupted?
}

/**
 * Animation Cue - visual/audio cue for the UI
 */
export interface AnimationCue {
  character: 'grace' | 'trip' | 'player' | 'environment';
  cueType: 'speak' | 'move' | 'gesture' | 'sfx' | 'music' | 'lighting';

  // Data payload
  data: {
    dialogue?: string;
    audioFile?: string;
    fromPosition?: string;
    toPosition?: string;
    gesture?: string;
    animationFile?: string;
    sfxFile?: string;
    musicFile?: string;
    lightingPreset?: string;
  };

  timestamp: number;
  duration?: number;
}

// ============================================================================
// EXPORT FORMATS
// ============================================================================

/**
 * Facade Data Bundle - all converted data ready for runtime
 * This is what gets saved to /data/facade/
 */
export interface FacadeDataBundle {
  version: string;

  // Core narrative data
  beats: FacadeBeat[];
  initialState: FacadeInitialWorldState;

  // Configuration
  discourseActPatterns: DiscourseActPattern[];  // How to recognize DAs from text
  characterBehaviors: CharacterBehavior[];

  // Metadata
  totalBeats: number;
  totalDiscourseActTypes: number;
  conversionDate: string;
}

/**
 * Discourse Act Pattern - pattern for matching player input to DA type
 */
export interface DiscourseActPattern {
  daType: DiscourseActType;
  patterns: string[];          // Regex patterns to match
  keywords: string[];          // Keywords that suggest this DA
  context?: {                  // Context that makes this DA more likely
    previousDA?: DiscourseActType;
    currentBeat?: BeatID;
    characterSpeaking?: 'grace' | 'trip';
  };
  confidence: number;          // Base confidence (0-1)
}
