/**
 * NPCMoodManager - TIER 20 Emotional Contagion System
 *
 * NPCs have dynamic moods that are affected by player discourse acts and
 * spread to nearby NPCs, creating realistic emotional atmospheres.
 *
 * Features:
 * - 5 mood states: happy, neutral, angry, sad, scared
 * - Player discourse acts affect NPC moods
 * - Moods gradually decay back to neutral
 * - Mood contagion between nearby NPCs
 * - Mood influences response intensity and word choice
 */

import type { DiscourseAct } from './DiscourseActRecognizer';

/**
 * NPC mood states
 */
export type NPCMood = 'happy' | 'neutral' | 'angry' | 'sad' | 'scared';

/**
 * Mood state with intensity
 */
export interface MoodState {
  mood: NPCMood;
  intensity: number;  // 0.0 to 1.0 (how strong the mood is)
  lastUpdateTime: number;
  triggeredBy?: string;  // What caused this mood (for debugging)
}

/**
 * NPC's complete mood information
 */
export interface NPCMoodProfile {
  npcId: string;
  currentMood: MoodState;
  moodHistory: MoodState[];  // Last 5 mood changes
  basePersonality: NPCMood;  // Default mood when neutral
}

/**
 * Manages emotional states for all NPCs
 */
export class NPCMoodManager {
  private moodProfiles: Map<string, NPCMoodProfile> = new Map();

  // How much each discourse act affects different moods
  private readonly DISCOURSE_MOOD_EFFECTS: Record<DiscourseAct, Partial<Record<NPCMood, number>>> = {
    // Positive discourse acts → happy mood
    'COMPLIMENT': { happy: 0.3 },
    'THANKS': { happy: 0.2 },
    'ENCOURAGEMENT': { happy: 0.25 },
    'SYMPATHY': { happy: 0.15 },
    'FLIRTING': { happy: 0.2 },
    'RELIEF': { happy: 0.2 },
    'CURIOSITY': { happy: 0.1 },
    'NOSTALGIA': { happy: 0.1 },
    'OFFER': { happy: 0.15 },
    'PROMISE': { happy: 0.15 },

    // Negative discourse acts → angry mood
    'INSULT': { angry: 0.4 },
    'THREAT': { angry: 0.5 },
    'SARCASM': { angry: 0.3 },
    'DISMISSAL': { angry: 0.35 },
    'PROHIBITION': { angry: 0.2 },
    'BRAGGING': { angry: 0.15 },
    'DISAGREEMENT': { angry: 0.1 },

    // Concern/apology → sad mood (empathy)
    'APOLOGY': { sad: 0.15 },
    'CONCERN': { sad: 0.2 },
    'COMPLAINT': { sad: 0.2 },
    'FRUSTRATION': { sad: 0.15 },

    // Threats/warnings → scared mood
    'WARNING': { scared: 0.3 },

    // Teasing can make NPCs slightly annoyed or amused
    'TEASING': { angry: 0.1, happy: 0.05 },

    // Pleading can evoke sympathy (sadness) or annoyance
    'PLEADING': { sad: 0.15, angry: 0.05 },

    // Most questions and neutral statements have no mood effect
    'GREETING': {},
    'FAREWELL': {},
    'QUESTION_WHO': {},
    'QUESTION_WHAT': {},
    'QUESTION_WHERE': {},
    'QUESTION_WHY': {},
    'QUESTION_HOW': {},
    'QUESTION_WHEN': {},
    'QUESTION_YESNO': {},
    'STATEMENT_FACT': {},
    'STATEMENT_OPINION': {},
    'STATEMENT_FEELING': {},
    'STATEMENT_BELIEF': {},
    'STATEMENT_MEMORY': {},
    'AGREEMENT': {},
    'CONFIRMATION': {},
    'DOUBT': {},
    'ACCEPTANCE': {},
    'REQUEST': {},
    'COMMAND': {},
    'SUGGESTION': {},
    'INVITATION': {},
    'PERMISSION': {},
    'TOPIC_CHANGE': {},
    'TOPIC_CALLBACK': {},
    'CLARIFICATION': {},
    'ACKNOWLEDGMENT': {},
    'INTERRUPTION': {},
    'REASSURANCE': {},
    'INTRODUCTION': {},
    'SMALL_TALK': {},
    'EXCITEMENT': { happy: 0.15 },
    'SURPRISE': {},
  };

  // Mood decay rate per minute (moods gradually return to neutral)
  private readonly MOOD_DECAY_RATE = 0.1;  // 10% decay per minute

  /**
   * Initialize or get mood profile for an NPC
   */
  getMoodProfile(npcId: string, basePersonality: NPCMood = 'neutral'): NPCMoodProfile {
    if (!this.moodProfiles.has(npcId)) {
      this.moodProfiles.set(npcId, {
        npcId,
        currentMood: {
          mood: basePersonality,
          intensity: 0.5,
          lastUpdateTime: Date.now(),
        },
        moodHistory: [],
        basePersonality,
      });
    }

    return this.moodProfiles.get(npcId)!;
  }

  /**
   * Update NPC mood based on a discourse act
   */
  updateMoodFromDiscourse(
    npcId: string,
    discourseAct: DiscourseAct,
    intensity: number,
    triggerDescription?: string
  ): NPCMoodProfile {
    const profile = this.getMoodProfile(npcId);
    const moodEffects = this.DISCOURSE_MOOD_EFFECTS[discourseAct];

    if (!moodEffects || Object.keys(moodEffects).length === 0) {
      // No mood effect for this discourse act
      return profile;
    }

    // Find the strongest mood effect
    let strongestMood: NPCMood = profile.currentMood.mood;
    let strongestEffect = 0;

    for (const [mood, effect] of Object.entries(moodEffects)) {
      if (effect > strongestEffect) {
        strongestMood = mood as NPCMood;
        strongestEffect = effect;
      }
    }

    // Calculate new mood intensity (discourse intensity amplifies the effect)
    const moodChange = strongestEffect * intensity;
    const newIntensity = Math.min(1.0, profile.currentMood.intensity + moodChange);

    // Only change mood if the new mood is different and strong enough
    if (strongestMood !== profile.currentMood.mood && newIntensity > 0.3) {
      // Save current mood to history
      profile.moodHistory.unshift(profile.currentMood);
      if (profile.moodHistory.length > 5) {
        profile.moodHistory.pop();
      }

      // Set new mood
      profile.currentMood = {
        mood: strongestMood,
        intensity: newIntensity,
        lastUpdateTime: Date.now(),
        triggeredBy: triggerDescription || discourseAct,
      };

      console.log(
        `[NPCMoodManager] ${npcId}: ${discourseAct} → mood changed to ${strongestMood} (${newIntensity.toFixed(2)})`
      );
    } else if (strongestMood === profile.currentMood.mood) {
      // Same mood, just increase intensity
      profile.currentMood.intensity = newIntensity;
      profile.currentMood.lastUpdateTime = Date.now();

      console.log(
        `[NPCMoodManager] ${npcId}: ${discourseAct} → mood intensity increased to ${newIntensity.toFixed(2)}`
      );
    }

    return profile;
  }

  /**
   * Apply mood decay (moods gradually return to neutral over time)
   */
  applyMoodDecay(npcId: string): NPCMoodProfile {
    const profile = this.getMoodProfile(npcId);
    const now = Date.now();
    const minutesElapsed = (now - profile.currentMood.lastUpdateTime) / (1000 * 60);

    if (minutesElapsed < 0.1) {
      // Less than 6 seconds, no decay yet
      return profile;
    }

    const decayAmount = this.MOOD_DECAY_RATE * minutesElapsed;
    const newIntensity = Math.max(0, profile.currentMood.intensity - decayAmount);

    // If intensity drops below threshold, return to base personality
    if (newIntensity < 0.2 && profile.currentMood.mood !== profile.basePersonality) {
      profile.moodHistory.unshift(profile.currentMood);
      if (profile.moodHistory.length > 5) {
        profile.moodHistory.pop();
      }

      profile.currentMood = {
        mood: profile.basePersonality,
        intensity: 0.5,
        lastUpdateTime: now,
        triggeredBy: 'mood decay',
      };

      console.log(`[NPCMoodManager] ${npcId}: mood decayed to ${profile.basePersonality}`);
    } else {
      profile.currentMood.intensity = newIntensity;
      profile.currentMood.lastUpdateTime = now;
    }

    return profile;
  }

  /**
   * Spread mood from one NPC to nearby NPCs (emotional contagion)
   *
   * @param sourceNpcId - NPC whose mood is spreading
   * @param nearbyNpcIds - NPCs in the same location
   * @param contagionStrength - How strongly moods spread (0.0 to 1.0)
   */
  spreadMood(
    sourceNpcId: string,
    nearbyNpcIds: string[],
    contagionStrength: number = 0.3
  ): void {
    const sourceProfile = this.getMoodProfile(sourceNpcId);

    // Only spread strong moods (intensity > 0.6)
    if (sourceProfile.currentMood.intensity < 0.6) {
      return;
    }

    // Only spread non-neutral moods
    if (sourceProfile.currentMood.mood === 'neutral') {
      return;
    }

    for (const nearbyNpcId of nearbyNpcIds) {
      if (nearbyNpcId === sourceNpcId) continue;

      const nearbyProfile = this.getMoodProfile(nearbyNpcId);

      // Emotional contagion: nearby NPCs pick up the mood
      const contagionEffect = sourceProfile.currentMood.intensity * contagionStrength;
      const newIntensity = Math.min(1.0, nearbyProfile.currentMood.intensity + contagionEffect);

      // Change mood if contagion is strong enough
      if (newIntensity > 0.4 && sourceProfile.currentMood.mood !== nearbyProfile.currentMood.mood) {
        nearbyProfile.moodHistory.unshift(nearbyProfile.currentMood);
        if (nearbyProfile.moodHistory.length > 5) {
          nearbyProfile.moodHistory.pop();
        }

        nearbyProfile.currentMood = {
          mood: sourceProfile.currentMood.mood,
          intensity: newIntensity * 0.7,  // Contagious moods are weaker
          lastUpdateTime: Date.now(),
          triggeredBy: `contagion from ${sourceNpcId}`,
        };

        console.log(
          `[NPCMoodManager] ${nearbyNpcId}: caught ${sourceProfile.currentMood.mood} mood from ${sourceNpcId}`
        );
      }
    }
  }

  /**
   * Get mood modifier for response intensity
   * Returns a value to add to discourse intensity based on current mood
   */
  getMoodIntensityModifier(npcId: string, discourseSentiment: 'positive' | 'negative' | 'neutral'): number {
    const profile = this.getMoodProfile(npcId);
    const mood = profile.currentMood.mood;
    const intensity = profile.currentMood.intensity;

    // Happy NPCs amplify positive discourse
    if (mood === 'happy' && discourseSentiment === 'positive') {
      return intensity * 0.2;  // Up to +0.2 intensity
    }

    // Angry NPCs amplify negative discourse
    if (mood === 'angry' && discourseSentiment === 'negative') {
      return intensity * 0.3;  // Up to +0.3 intensity
    }

    // Sad NPCs dampen positive discourse (they're not in the mood)
    if (mood === 'sad' && discourseSentiment === 'positive') {
      return -intensity * 0.15;  // Up to -0.15 intensity
    }

    // Scared NPCs amplify negative discourse (they're already anxious)
    if (mood === 'scared' && discourseSentiment === 'negative') {
      return intensity * 0.25;  // Up to +0.25 intensity
    }

    return 0;  // No modifier
  }

  /**
   * Get a descriptive string for the current mood
   */
  getMoodDescription(npcId: string): string {
    const profile = this.getMoodProfile(npcId);
    const mood = profile.currentMood.mood;
    const intensity = profile.currentMood.intensity;

    if (intensity < 0.3) {
      return 'neutral';
    }

    if (intensity >= 0.8) {
      const intenseMoods: Record<NPCMood, string> = {
        happy: 'ecstatic',
        angry: 'furious',
        sad: 'depressed',
        scared: 'terrified',
        neutral: 'calm',
      };
      return intenseMoods[mood];
    }

    if (intensity >= 0.5) {
      const moderateMoods: Record<NPCMood, string> = {
        happy: 'cheerful',
        angry: 'irritated',
        sad: 'melancholic',
        scared: 'nervous',
        neutral: 'composed',
      };
      return moderateMoods[mood];
    }

    return mood;
  }

  /**
   * Get all mood profiles (for debugging/analytics)
   */
  getAllMoodProfiles(): Map<string, NPCMoodProfile> {
    return this.moodProfiles;
  }

  /**
   * Reset mood for specific NPC
   */
  resetMood(npcId: string): void {
    const profile = this.getMoodProfile(npcId);
    profile.currentMood = {
      mood: profile.basePersonality,
      intensity: 0.5,
      lastUpdateTime: Date.now(),
      triggeredBy: 'manual reset',
    };
    console.log(`[NPCMoodManager] Reset mood for ${npcId}`);
  }
}

/**
 * Factory function for easy instantiation
 */
export function createNPCMoodManager(): NPCMoodManager {
  return new NPCMoodManager();
}
