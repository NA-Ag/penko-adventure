/**
 * World Memory Service
 *
 * The state container for the entire Facade interactive drama.
 * Maintains all facts, character states, relationships, and story progression.
 *
 * Corresponds to Facade's Working Memory (WME) system.
 */

import {
  FacadeWorldMemory,
  FacadeInitialWorldState,
  CharacterState,
  RelationshipState,
  BeatStatusWME,
  DiscourseActWME,
  BeatID,
  WorldEffect,
} from '../../types/facade';

export class WorldMemory {
  private state: FacadeWorldMemory;

  constructor(initialState: FacadeInitialWorldState) {
    // Initialize world memory with initial state
    this.state = {
      ...initialState,

      // Runtime-only fields
      currentBeat: undefined,
      currentBeatStep: 0,
      beatStatusWME: {
        status: 0,
        curBGSig: '',
        bCommitPointReached: false,
        bGistPointReached: false,
        bTxningOut: false,
        abortReason: 0,
        mixInAllowed_pushTooFar: true,
        mixInAllowed_satellite: true,
        mixInAllowed_redirectConnect: true,
        mixInAllowed_object: true,
        mixInAllowed_DA: true,
        mixInAllowed_deflect: true,
        mixInAllowed_pattern: true,
        mixInAllowed_ltb: true,
        disallowedPushTooFarObjects: [],
      },
      unhandledDiscourseActs: [],
      recentDiscourseActs: [],
      beatActivationCounts: new Map(),
      flags: {},
      counters: {},
    };

    console.log('[WorldMemory] Initialized with initial state');
    console.log(`[WorldMemory] Grace mood: ${this.state.characterStates.grace.mood}`);
    console.log(`[WorldMemory] Trip mood: ${this.state.characterStates.trip.mood}`);
    console.log(`[WorldMemory] Relationship tension: ${this.state.relationshipTension}`);
  }

  // ============================================================================
  // FACT MANAGEMENT
  // ============================================================================

  /**
   * Get a global fact value
   */
  getFact(factName: string): any {
    return this.state.globalFacts[factName];
  }

  /**
   * Set a global fact value
   */
  setFact(factName: string, value: any): void {
    const oldValue = this.state.globalFacts[factName];
    this.state.globalFacts[factName] = value;

    console.log(`[WorldMemory] Fact changed: ${factName} = ${oldValue} → ${value}`);
  }

  /**
   * Get a flag value (boolean fact)
   */
  getFlag(flagName: string): boolean {
    return this.state.flags[flagName] ?? false;
  }

  /**
   * Set a flag value
   */
  setFlag(flagName: string, value: boolean): void {
    this.state.flags[flagName] = value;
    console.log(`[WorldMemory] Flag set: ${flagName} = ${value}`);
  }

  /**
   * Get a counter value
   */
  getCounter(counterName: string): number {
    return this.state.counters[counterName] ?? 0;
  }

  /**
   * Increment a counter
   */
  incrementCounter(counterName: string, amount: number = 1): number {
    const oldValue = this.getCounter(counterName);
    const newValue = oldValue + amount;
    this.state.counters[counterName] = newValue;

    console.log(`[WorldMemory] Counter: ${counterName} = ${oldValue} → ${newValue}`);
    return newValue;
  }

  // ============================================================================
  // CHARACTER STATE
  // ============================================================================

  /**
   * Get a character's state
   */
  getCharacterState(character: 'grace' | 'trip'): CharacterState {
    return this.state.characterStates[character];
  }

  /**
   * Update a character's mood
   */
  setCharacterMood(character: 'grace' | 'trip', mood: number): void {
    const oldMood = this.state.characterStates[character].mood;
    this.state.characterStates[character].mood = mood;

    console.log(`[WorldMemory] ${character} mood: ${oldMood} → ${mood}`);
  }

  /**
   * Adjust a character's mood (relative change)
   */
  adjustCharacterMood(character: 'grace' | 'trip', delta: number): number {
    const state = this.state.characterStates[character];
    const newMood = Math.max(-100, Math.min(100, state.mood + delta));
    this.setCharacterMood(character, newMood);
    return newMood;
  }

  /**
   * Update character's affinity toward player
   */
  setCharacterAffinity(character: 'grace' | 'trip', affinity: number): void {
    const oldAffinity = this.state.characterStates[character].affinityToPlayer;
    this.state.characterStates[character].affinityToPlayer = affinity;

    console.log(`[WorldMemory] ${character} affinity to player: ${oldAffinity} → ${affinity}`);
  }

  /**
   * Adjust character's affinity toward player (relative change)
   */
  adjustCharacterAffinity(character: 'grace' | 'trip', delta: number): number {
    const state = this.state.characterStates[character];
    const newAffinity = Math.max(-100, Math.min(100, state.affinityToPlayer + delta));
    this.setCharacterAffinity(character, newAffinity);
    return newAffinity;
  }

  /**
   * Set character's tension level
   */
  setCharacterTension(character: 'grace' | 'trip', tension: number): void {
    const oldTension = this.state.characterStates[character].tension;
    this.state.characterStates[character].tension = Math.max(0, Math.min(100, tension));

    console.log(`[WorldMemory] ${character} tension: ${oldTension} → ${tension}`);
  }

  /**
   * Add a revealed secret to character's memory
   */
  addRevealedSecret(character: 'grace' | 'trip', secret: string): void {
    const secrets = this.state.characterStates[character].revealedSecrets;
    if (!secrets.includes(secret)) {
      secrets.push(secret);
      console.log(`[WorldMemory] ${character} revealed secret: ${secret}`);
    }
  }

  /**
   * Check if a secret has been revealed
   */
  hasRevealedSecret(character: 'grace' | 'trip', secret: string): boolean {
    return this.state.characterStates[character].revealedSecrets.includes(secret);
  }

  // ============================================================================
  // RELATIONSHIP STATE
  // ============================================================================

  /**
   * Get relationship state between two characters
   */
  getRelationship(from: 'grace' | 'trip' | 'player', to: 'grace' | 'trip' | 'player'): RelationshipState | undefined {
    return this.state.relationships.find(r => r.from === from && r.to === to);
  }

  /**
   * Update relationship affinity
   */
  setRelationshipAffinity(from: 'grace' | 'trip' | 'player', to: 'grace' | 'trip' | 'player', affinity: number): void {
    const relationship = this.getRelationship(from, to);
    if (relationship) {
      const oldAffinity = relationship.affinity;
      relationship.affinity = Math.max(-100, Math.min(100, affinity));
      console.log(`[WorldMemory] ${from}→${to} affinity: ${oldAffinity} → ${affinity}`);
    }
  }

  /**
   * Adjust relationship affinity (relative change)
   */
  adjustRelationshipAffinity(from: 'grace' | 'trip' | 'player', to: 'grace' | 'trip' | 'player', delta: number): void {
    const relationship = this.getRelationship(from, to);
    if (relationship) {
      const newAffinity = Math.max(-100, Math.min(100, relationship.affinity + delta));
      this.setRelationshipAffinity(from, to, newAffinity);
    }
  }

  /**
   * Get overall relationship tension (between Grace & Trip)
   */
  getRelationshipTension(): number {
    return this.state.relationshipTension;
  }

  /**
   * Set overall relationship tension
   */
  setRelationshipTension(tension: number): void {
    const oldTension = this.state.relationshipTension;
    this.state.relationshipTension = Math.max(0, Math.min(100, tension));
    console.log(`[WorldMemory] Relationship tension: ${oldTension} → ${tension}`);
  }

  /**
   * Adjust relationship tension (relative change)
   */
  adjustRelationshipTension(delta: number): number {
    const newTension = Math.max(0, Math.min(100, this.state.relationshipTension + delta));
    this.setRelationshipTension(newTension);
    return newTension;
  }

  // ============================================================================
  // BEAT MANAGEMENT
  // ============================================================================

  /**
   * Get current beat ID
   */
  getCurrentBeat(): BeatID | undefined {
    return this.state.currentBeat;
  }

  /**
   * Set current beat
   */
  setCurrentBeat(beatId: BeatID | undefined): void {
    this.state.currentBeat = beatId;
    this.state.currentBeatStep = 0;

    if (beatId !== undefined) {
      // Track beat activation
      const count = this.state.beatActivationCounts.get(beatId) ?? 0;
      this.state.beatActivationCounts.set(beatId, count + 1);

      // Add to history
      this.state.beatHistory.push(beatId);

      console.log(`[WorldMemory] Current beat set: ${beatId} (activation #${count + 1})`);
    } else {
      console.log(`[WorldMemory] Current beat cleared`);
    }
  }

  /**
   * Get current beat step index
   */
  getCurrentBeatStep(): number {
    return this.state.currentBeatStep;
  }

  /**
   * Advance to next beat step
   */
  advanceBeatStep(): number {
    this.state.currentBeatStep++;
    return this.state.currentBeatStep;
  }

  /**
   * Get beat activation count
   */
  getBeatActivationCount(beatId: BeatID): number {
    return this.state.beatActivationCounts.get(beatId) ?? 0;
  }

  /**
   * Check if a beat has been played
   */
  hasBeatBeenPlayed(beatId: BeatID): boolean {
    return this.state.beatHistory.includes(beatId);
  }

  /**
   * Get beat history
   */
  getBeatHistory(): BeatID[] {
    return [...this.state.beatHistory];
  }

  /**
   * Get beat status WME
   */
  getBeatStatus(): BeatStatusWME {
    return this.state.beatStatusWME;
  }

  /**
   * Update beat status
   */
  updateBeatStatus(updates: Partial<BeatStatusWME>): void {
    this.state.beatStatusWME = {
      ...this.state.beatStatusWME,
      ...updates,
    };
  }

  // ============================================================================
  // DISCOURSE ACT MANAGEMENT
  // ============================================================================

  /**
   * Add a discourse act to the unhandled queue
   */
  addDiscourseAct(da: DiscourseActWME): void {
    this.state.unhandledDiscourseActs.push(da);
    this.state.recentDiscourseActs.unshift(da);

    // Keep only last 10 DAs in recent history
    if (this.state.recentDiscourseActs.length > 10) {
      this.state.recentDiscourseActs.pop();
    }

    console.log(`[WorldMemory] Discourse act added: type=${da.id}, char=${da.charID}, handled=${da.handledStatus}`);
  }

  /**
   * Get unhandled discourse acts
   */
  getUnhandledDiscourseActs(): DiscourseActWME[] {
    return [...this.state.unhandledDiscourseActs];
  }

  /**
   * Mark a discourse act as handled
   */
  markDiscourseActHandled(da: DiscourseActWME, handledStatus: number): void {
    da.handledStatus = handledStatus;

    // Remove from unhandled queue if fully handled
    if (handledStatus === 2) {
      const index = this.state.unhandledDiscourseActs.indexOf(da);
      if (index !== -1) {
        this.state.unhandledDiscourseActs.splice(index, 1);
        console.log(`[WorldMemory] Discourse act fully handled and removed from queue`);
      }
    }
  }

  /**
   * Clear all unhandled discourse acts
   */
  clearUnhandledDiscourseActs(): void {
    const count = this.state.unhandledDiscourseActs.length;
    this.state.unhandledDiscourseActs = [];
    console.log(`[WorldMemory] Cleared ${count} unhandled discourse acts`);
  }

  /**
   * Get recent discourse act history
   */
  getRecentDiscourseActs(): DiscourseActWME[] {
    return [...this.state.recentDiscourseActs];
  }

  // ============================================================================
  // WORLD EFFECTS
  // ============================================================================

  /**
   * Apply a world effect
   */
  applyWorldEffect(effect: WorldEffect): void {
    console.log(`[WorldMemory] Applying effect: ${effect.type} on ${effect.target}`);

    switch (effect.type) {
      case 'setFact':
        this.setFact(effect.target, effect.value);
        break;

      case 'incrementCounter':
        this.incrementCounter(effect.target, effect.value);
        break;

      case 'mood':
        // Target format: "grace" or "trip"
        if (effect.target === 'grace' || effect.target === 'trip') {
          if (effect.operation === 'add') {
            this.adjustCharacterMood(effect.target, effect.value);
          } else {
            this.setCharacterMood(effect.target, effect.value);
          }
        }
        break;

      case 'relationship':
        // Target format: "grace→trip" or "player→grace"
        const [from, to] = effect.target.split('→') as ['grace' | 'trip' | 'player', 'grace' | 'trip' | 'player'];
        if (from && to) {
          if (effect.operation === 'add') {
            this.adjustRelationshipAffinity(from, to, effect.value);
          } else {
            this.setRelationshipAffinity(from, to, effect.value);
          }
        }
        break;

      case 'flag':
        this.setFlag(effect.target, effect.value);
        break;

      default:
        console.warn(`[WorldMemory] Unknown effect type: ${effect.type}`);
    }
  }

  /**
   * Apply multiple world effects
   */
  applyWorldEffects(effects: WorldEffect[]): void {
    console.log(`[WorldMemory] Applying ${effects.length} world effects`);
    for (const effect of effects) {
      this.applyWorldEffect(effect);
    }
  }

  // ============================================================================
  // STORY PROGRESSION
  // ============================================================================

  /**
   * Get current story tier
   */
  getCurrentTier(): 1 | 2 | 3 {
    return this.state.currentTier;
  }

  /**
   * Advance to next story tier
   */
  advanceToNextTier(): void {
    if (this.state.currentTier < 3) {
      this.state.currentTier = (this.state.currentTier + 1) as 1 | 2 | 3;
      console.log(`[WorldMemory] Advanced to Tier ${this.state.currentTier}`);
    }
  }

  // ============================================================================
  // STATE ACCESS
  // ============================================================================

  /**
   * Get complete world state (read-only copy)
   */
  getState(): Readonly<FacadeWorldMemory> {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return Date.now();
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    return Date.now() - this.state.sessionStartTime;
  }

  /**
   * Debug: Print current state summary
   */
  printStateSummary(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('WORLD MEMORY STATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`Current Beat: ${this.state.currentBeat ?? 'None'}`);
    console.log(`Beat Step: ${this.state.currentBeatStep}`);
    console.log(`Tier: ${this.state.currentTier}`);
    console.log(`Beats Played: ${this.state.beatHistory.length}`);
    console.log('');
    console.log('Grace:');
    console.log(`  Mood: ${this.state.characterStates.grace.mood}`);
    console.log(`  Tension: ${this.state.characterStates.grace.tension}`);
    console.log(`  Affinity to Player: ${this.state.characterStates.grace.affinityToPlayer}`);
    console.log(`  Affinity to Partner: ${this.state.characterStates.grace.affinityToPartner}`);
    console.log('');
    console.log('Trip:');
    console.log(`  Mood: ${this.state.characterStates.trip.mood}`);
    console.log(`  Tension: ${this.state.characterStates.trip.tension}`);
    console.log(`  Affinity to Player: ${this.state.characterStates.trip.affinityToPlayer}`);
    console.log(`  Affinity to Partner: ${this.state.characterStates.trip.affinityToPartner}`);
    console.log('');
    console.log(`Relationship Tension: ${this.state.relationshipTension}`);
    console.log(`Unhandled DAs: ${this.state.unhandledDiscourseActs.length}`);
    console.log('='.repeat(70));
    console.log('');
  }
}
