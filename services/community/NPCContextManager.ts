/**
 * NPCContextManager - TIER 20 Context-Aware Response System
 *
 * NPCs respond differently based on environmental context:
 * - Time of day (morning, afternoon, evening, night)
 * - Location type (safe vs dangerous, formal vs casual)
 * - Weather conditions
 * - Quest state (if player helped them before)
 * - Recent events
 *
 * Features:
 * - Time-of-day affects mood baseline (grumpy in morning, tired at night)
 * - Location-appropriate responses (whisper in library, shout in tavern)
 * - Context-specific mood modifiers
 * - Quest memory and gratitude
 */

import type { NPCMood } from './NPCMoodManager';

/**
 * Time of day periods
 */
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'midnight';

/**
 * Location atmosphere types
 */
export type LocationType =
  | 'peaceful'     // Towns, villages, safe areas
  | 'formal'       // Throne rooms, libraries, temples
  | 'casual'       // Taverns, markets, homes
  | 'dangerous'    // Dungeons, battlefields, dark forests
  | 'mysterious'   // Ancient ruins, magical places
  | 'festive';     // Celebrations, festivals

/**
 * Weather conditions
 */
export type Weather = 'clear' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'hot';

/**
 * Quest relationship types
 */
export type QuestStatus = 'none' | 'active' | 'completed' | 'failed';

/**
 * Environmental context for an NPC
 */
export interface EnvironmentalContext {
  timeOfDay: TimeOfDay;
  locationType: LocationType;
  weather?: Weather;
  isIndoors: boolean;
  crowdLevel: 'empty' | 'quiet' | 'busy' | 'crowded';
}

/**
 * Quest-related context
 */
export interface QuestContext {
  questId: string;
  status: QuestStatus;
  playerHelped: boolean;      // Did player help this NPC?
  playerHarmed: boolean;       // Did player harm this NPC?
  lastInteractionTime?: number;
}

/**
 * Complete contextual state for an NPC
 */
export interface NPCContext {
  npcId: string;
  currentEnvironment: EnvironmentalContext;
  questHistory: Map<string, QuestContext>;
  recentEvents: string[];      // Last 5 significant events
  lastSeenTime?: number;       // When player last talked to this NPC
}

/**
 * Context-based mood modifier
 */
export interface ContextMoodModifier {
  mood: NPCMood;
  intensityChange: number;  // -0.3 to +0.3
  reason: string;
}

/**
 * Manages environmental and quest context for NPCs
 */
export class NPCContextManager {
  private contexts: Map<string, NPCContext> = new Map();

  // Time of day affects NPC baseline mood
  private readonly TIME_MOOD_EFFECTS: Record<TimeOfDay, ContextMoodModifier | null> = {
    'dawn': { mood: 'neutral', intensityChange: -0.1, reason: 'just waking up' },
    'morning': { mood: 'neutral', intensityChange: -0.15, reason: 'morning grogginess' },
    'afternoon': null,  // No modifier, neutral time
    'evening': { mood: 'happy', intensityChange: 0.1, reason: 'relaxing evening' },
    'night': { mood: 'neutral', intensityChange: -0.2, reason: 'tired from long day' },
    'midnight': { mood: 'neutral', intensityChange: -0.25, reason: 'exhausted, should be sleeping' },
  };

  // Location type affects response style and mood
  private readonly LOCATION_MOOD_EFFECTS: Record<LocationType, ContextMoodModifier | null> = {
    'peaceful': { mood: 'happy', intensityChange: 0.15, reason: 'comfortable environment' },
    'formal': { mood: 'neutral', intensityChange: 0, reason: 'formal atmosphere' },
    'casual': { mood: 'happy', intensityChange: 0.1, reason: 'relaxed setting' },
    'dangerous': { mood: 'scared', intensityChange: 0.3, reason: 'dangerous area' },
    'mysterious': { mood: 'neutral', intensityChange: -0.1, reason: 'uneasy about unknown' },
    'festive': { mood: 'happy', intensityChange: 0.25, reason: 'celebration atmosphere' },
  };

  // Weather affects mood
  private readonly WEATHER_MOOD_EFFECTS: Record<Weather, ContextMoodModifier | null> = {
    'clear': { mood: 'happy', intensityChange: 0.05, reason: 'nice weather' },
    'rainy': { mood: 'sad', intensityChange: 0.1, reason: 'gloomy weather' },
    'stormy': { mood: 'scared', intensityChange: 0.15, reason: 'dangerous storm' },
    'snowy': { mood: 'neutral', intensityChange: -0.05, reason: 'cold weather' },
    'foggy': { mood: 'neutral', intensityChange: -0.1, reason: 'reduced visibility' },
    'hot': { mood: 'angry', intensityChange: 0.1, reason: 'uncomfortable heat' },
  };

  /**
   * Initialize or get context for an NPC
   */
  getContext(npcId: string): NPCContext {
    if (!this.contexts.has(npcId)) {
      this.contexts.set(npcId, {
        npcId,
        currentEnvironment: {
          timeOfDay: 'afternoon',
          locationType: 'peaceful',
          isIndoors: false,
          crowdLevel: 'quiet',
        },
        questHistory: new Map(),
        recentEvents: [],
      });
    }

    return this.contexts.get(npcId)!;
  }

  /**
   * Update environmental context for an NPC
   */
  updateEnvironment(npcId: string, environment: Partial<EnvironmentalContext>): void {
    const context = this.getContext(npcId);
    context.currentEnvironment = {
      ...context.currentEnvironment,
      ...environment,
    };

    console.log(
      `[NPCContextManager] ${npcId}: Environment updated - ` +
      `${environment.timeOfDay || context.currentEnvironment.timeOfDay}, ` +
      `${environment.locationType || context.currentEnvironment.locationType}`
    );
  }

  /**
   * Record a quest-related event
   */
  recordQuestEvent(
    npcId: string,
    questId: string,
    status: QuestStatus,
    playerHelped: boolean = false,
    playerHarmed: boolean = false
  ): void {
    const context = this.getContext(npcId);

    context.questHistory.set(questId, {
      questId,
      status,
      playerHelped,
      playerHarmed,
      lastInteractionTime: Date.now(),
    });

    // Add to recent events
    if (playerHelped) {
      this.addRecentEvent(npcId, `player helped with ${questId}`);
    } else if (playerHarmed) {
      this.addRecentEvent(npcId, `player harmed during ${questId}`);
    }

    console.log(
      `[NPCContextManager] ${npcId}: Quest ${questId} ${status} ` +
      `(helped: ${playerHelped}, harmed: ${playerHarmed})`
    );
  }

  /**
   * Add a significant event to NPC's recent memory
   */
  addRecentEvent(npcId: string, event: string): void {
    const context = this.getContext(npcId);

    context.recentEvents.unshift(event);
    if (context.recentEvents.length > 5) {
      context.recentEvents.pop();
    }
  }

  /**
   * Update last seen time (when player talks to NPC)
   */
  updateLastSeen(npcId: string): void {
    const context = this.getContext(npcId);
    context.lastSeenTime = Date.now();
  }

  /**
   * Get time since last interaction (in minutes)
   */
  getTimeSinceLastSeen(npcId: string): number | null {
    const context = this.getContext(npcId);
    if (!context.lastSeenTime) return null;

    return (Date.now() - context.lastSeenTime) / (1000 * 60);
  }

  /**
   * Get all context-based mood modifiers for an NPC
   * Returns array of modifiers that should be applied
   */
  getContextMoodModifiers(npcId: string): ContextMoodModifier[] {
    const context = this.getContext(npcId);
    const modifiers: ContextMoodModifier[] = [];

    // Time of day modifier
    const timeModifier = this.TIME_MOOD_EFFECTS[context.currentEnvironment.timeOfDay];
    if (timeModifier) {
      modifiers.push(timeModifier);
    }

    // Location type modifier
    const locationModifier = this.LOCATION_MOOD_EFFECTS[context.currentEnvironment.locationType];
    if (locationModifier) {
      modifiers.push(locationModifier);
    }

    // Weather modifier (if applicable)
    if (context.currentEnvironment.weather && !context.currentEnvironment.isIndoors) {
      const weatherModifier = this.WEATHER_MOOD_EFFECTS[context.currentEnvironment.weather];
      if (weatherModifier) {
        modifiers.push(weatherModifier);
      }
    }

    return modifiers;
  }

  /**
   * Get strongest context mood modifier (for applying to NPC mood)
   */
  getStrongestMoodModifier(npcId: string): ContextMoodModifier | null {
    const modifiers = this.getContextMoodModifiers(npcId);

    if (modifiers.length === 0) return null;

    // Return modifier with highest absolute intensity change
    return modifiers.reduce((strongest, current) => {
      return Math.abs(current.intensityChange) > Math.abs(strongest.intensityChange)
        ? current
        : strongest;
    });
  }

  /**
   * Check if player has completed quests for this NPC
   */
  hasCompletedQuestsFor(npcId: string): boolean {
    const context = this.getContext(npcId);

    for (const quest of context.questHistory.values()) {
      if (quest.status === 'completed' && quest.playerHelped) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if player has harmed this NPC in past quests
   */
  hasHarmedInPast(npcId: string): boolean {
    const context = this.getContext(npcId);

    for (const quest of context.questHistory.values()) {
      if (quest.playerHarmed) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get greeting modifier based on time since last seen
   * Returns special greeting type if appropriate
   */
  getGreetingModifier(npcId: string): 'first_meeting' | 'just_saw' | 'long_time' | 'normal' {
    const context = this.getContext(npcId);

    if (!context.lastSeenTime) {
      return 'first_meeting';
    }

    const minutesSince = this.getTimeSinceLastSeen(npcId)!;

    if (minutesSince < 5) {
      return 'just_saw';  // "Didn't we just talk?"
    } else if (minutesSince > 60 * 24) {  // More than 1 day
      return 'long_time';  // "It's been a while!"
    }

    return 'normal';
  }

  /**
   * Get response intensity modifier based on crowd level
   * Loud/energetic in crowds, quiet in empty spaces
   */
  getCrowdIntensityModifier(npcId: string): number {
    const context = this.getContext(npcId);

    switch (context.currentEnvironment.crowdLevel) {
      case 'empty': return -0.2;    // Quieter, more subdued
      case 'quiet': return -0.1;    // Slightly quieter
      case 'busy': return 0.1;      // Slightly louder
      case 'crowded': return 0.2;   // Much louder, more energetic
      default: return 0;
    }
  }

  /**
   * Should NPC whisper based on location?
   */
  shouldWhisper(npcId: string): boolean {
    const context = this.getContext(npcId);

    // Whisper in formal locations or when it's very late
    return (
      context.currentEnvironment.locationType === 'formal' ||
      context.currentEnvironment.timeOfDay === 'midnight' ||
      context.currentEnvironment.timeOfDay === 'night'
    );
  }

  /**
   * Get contextual response prefix based on environment
   * Used to modify how NPC speaks
   */
  getResponseStyleModifier(npcId: string): {
    prefix?: string;
    suffix?: string;
    style: 'normal' | 'whisper' | 'shout' | 'formal' | 'casual';
  } {
    const context = this.getContext(npcId);

    // Formal locations = formal speech
    if (context.currentEnvironment.locationType === 'formal') {
      return { style: 'formal' };
    }

    // Whisper at night or in formal places
    if (this.shouldWhisper(npcId)) {
      return { prefix: '*whispers*', style: 'whisper' };
    }

    // Shout in crowded places
    if (context.currentEnvironment.crowdLevel === 'crowded') {
      return { suffix: '(shouting over the noise)', style: 'shout' };
    }

    // Casual everywhere else
    return { style: 'casual' };
  }

  /**
   * Get contextual description of NPC's current state
   */
  getContextDescription(npcId: string): string {
    const context = this.getContext(npcId);
    const modifiers = this.getContextMoodModifiers(npcId);

    if (modifiers.length === 0) {
      return 'in normal spirits';
    }

    // Combine reasons
    const reasons = modifiers.map(m => m.reason).join(', ');
    return reasons;
  }

  /**
   * Reset context for specific NPC
   */
  resetContext(npcId: string): void {
    this.contexts.delete(npcId);
    console.log(`[NPCContextManager] Reset context for ${npcId}`);
  }

  /**
   * Get all contexts (for debugging/analytics)
   */
  getAllContexts(): Map<string, NPCContext> {
    return this.contexts;
  }
}

/**
 * Factory function for easy instantiation
 */
export function createNPCContextManager(): NPCContextManager {
  return new NPCContextManager();
}
