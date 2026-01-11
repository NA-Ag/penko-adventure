/**
 * Oracle (Learning Director) - The "20 Questions" AI for language learning
 *
 * Inspired by:
 * - 20 Questions toy: Pattern matching based on player data
 * - Left 4 Dead AI Director: Dynamic difficulty adjustment
 *
 * The Oracle doesn't understand language—it understands PATTERNS.
 * It asks itself internal questions:
 * - "Has the user mastered the word 'key'?"
 * - "Are they struggling with past-tense verbs?"
 * - "Is it time to introduce a new grammar concept?"
 *
 * Based on the answers, it selects the perfect learning event from the pool.
 */

import { Language } from '../../types';

/**
 * Player learning metrics tracked by Oracle
 */
export interface LearnerProfile {
  // Vocabulary tracking
  knownWords: Set<string>;                    // Words successfully used
  weakWords: Map<string, number>;             // Words with mistakes (word -> mistake count)
  newWordsIntroducedRecently: string[];       // Last 5 new words introduced

  // Grammar tracking
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  grammarMistakes: Map<string, number>;       // Grammar type -> mistake count
  successfulSentences: number;                // Count of correct inputs

  // Performance metrics
  totalAttempts: number;                      // Total actions attempted
  successfulAttempts: number;                 // Actions that were valid
  recentSuccessRate: number;                  // Success rate of last 10 attempts (0-1)

  // Difficulty tracking
  currentDifficulty: number;                  // 1-10 scale
  frustrationLevel: number;                   // 0-100 (calculated)
  boredomLevel: number;                       // 0-100 (calculated)

  // Session data
  turnsPlayed: number;                        // Number of turns in this session
  timeInSession: number;                      // Minutes in current session
}

/**
 * Learning event difficulty rating
 */
export interface LearningEvent {
  id: string;
  type: 'vocabulary' | 'grammar' | 'scenario' | 'challenge';
  difficulty: number;                         // 1-10
  vocabularyRequired: string[];               // Words player must know
  newVocabulary: string[];                    // New words introduced
  grammarConcepts: string[];                  // Grammar points covered
  estimatedDuration: number;                  // Minutes to complete
  cooldown?: number;                          // Turns before can repeat
}

/**
 * Oracle decision result
 */
export interface OracleDecision {
  selectedEvent: LearningEvent | null;
  reason: string;
  confidence: number;                         // 0-1
  recommendations: string[];                  // Alternative suggestions
}

/**
 * Learning attempt event data
 */
export interface AttemptEvent {
  action: string;                             // Action intent (e.g., 'TAKE', 'EXAMINE')
  input: string;                              // User's input (corrected)
  hadGrammarErrors: boolean;                  // Did input have grammar errors?
  errorTypes: string[];                       // Types of errors found
  success: boolean;                           // Was the action successful?
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'; // Current CEFR level
}

/**
 * Oracle - The Learning Director
 */
export class Oracle {
  private learnerProfile: LearnerProfile;
  private availableEvents: LearningEvent[] = [];
  private completedEvents: Set<string> = new Set();
  private recentHistory: boolean[] = [];      // Last 10 attempts (true = success)

  constructor(initialProfile?: Partial<LearnerProfile>) {
    this.learnerProfile = {
      knownWords: new Set(),
      weakWords: new Map(),
      newWordsIntroducedRecently: [],
      cefrLevel: 'A1',
      grammarMistakes: new Map(),
      successfulSentences: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      recentSuccessRate: 1.0,
      currentDifficulty: 1,
      frustrationLevel: 0,
      boredomLevel: 0,
      turnsPlayed: 0,
      timeInSession: 0,
      ...initialProfile,
    };
  }

  /**
   * Register available learning events
   */
  registerEvents(events: LearningEvent[]): void {
    this.availableEvents = events;
  }

  /**
   * Record a player action result (Berlitz-enhanced)
   */
  recordAttempt(event: AttemptEvent): void {
    this.learnerProfile.totalAttempts++;
    this.learnerProfile.turnsPlayed++;

    // Extract words from input for vocabulary tracking
    const wordsUsed = event.input
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && /^[a-záéíóúñäöüàèìòù]+$/i.test(word));

    // Track successful grammar (no errors means successful sentence)
    const hadSuccessfulGrammar = event.success && !event.hadGrammarErrors;

    if (event.success) {
      this.learnerProfile.successfulAttempts++;

      // Only count as successful sentence if no grammar errors
      if (hadSuccessfulGrammar) {
        this.learnerProfile.successfulSentences++;
      }

      // Add words to known vocabulary
      wordsUsed.forEach(word => {
        this.learnerProfile.knownWords.add(word);
        // Reduce weak word count on success
        const weakCount = this.learnerProfile.weakWords.get(word) || 0;
        if (weakCount > 0) {
          this.learnerProfile.weakWords.set(word, weakCount - 1);
        }
      });
    } else {
      // Track mistakes
      wordsUsed.forEach(word => {
        const currentCount = this.learnerProfile.weakWords.get(word) || 0;
        this.learnerProfile.weakWords.set(word, currentCount + 1);
      });
    }

    // Track grammar errors
    if (event.hadGrammarErrors) {
      event.errorTypes.forEach(errorType => {
        const currentCount = this.learnerProfile.grammarMistakes.get(errorType) || 0;
        this.learnerProfile.grammarMistakes.set(errorType, currentCount + 1);
      });
    }

    // Update CEFR level if provided
    if (event.cefr) {
      this.learnerProfile.cefrLevel = event.cefr;
    }

    // Update recent history (last 10 attempts)
    this.recentHistory.push(event.success);
    if (this.recentHistory.length > 10) {
      this.recentHistory.shift();
    }

    // Recalculate metrics
    this.updateMetrics();
  }

  /**
   * Update calculated metrics (frustration, boredom, success rate)
   */
  private updateMetrics(): void {
    // Calculate recent success rate
    if (this.recentHistory.length > 0) {
      const successes = this.recentHistory.filter(s => s).length;
      this.learnerProfile.recentSuccessRate = successes / this.recentHistory.length;
    }

    // Calculate frustration level (many recent failures)
    if (this.learnerProfile.recentSuccessRate < 0.3) {
      this.learnerProfile.frustrationLevel = Math.min(100, this.learnerProfile.frustrationLevel + 10);
    } else {
      this.learnerProfile.frustrationLevel = Math.max(0, this.learnerProfile.frustrationLevel - 5);
    }

    // Calculate boredom level (too easy, consistent success)
    if (this.learnerProfile.recentSuccessRate > 0.9 && this.recentHistory.length >= 5) {
      this.learnerProfile.boredomLevel = Math.min(100, this.learnerProfile.boredomLevel + 10);
    } else {
      this.learnerProfile.boredomLevel = Math.max(0, this.learnerProfile.boredomLevel - 5);
    }

    // Adjust difficulty based on performance
    this.adjustDifficulty();
  }

  /**
   * Dynamically adjust difficulty (Left 4 Dead style)
   */
  private adjustDifficulty(): void {
    const { recentSuccessRate, frustrationLevel, boredomLevel } = this.learnerProfile;

    // Struggling: reduce difficulty
    if (recentSuccessRate < 0.4 || frustrationLevel > 60) {
      this.learnerProfile.currentDifficulty = Math.max(1, this.learnerProfile.currentDifficulty - 0.5);
    }
    // Bored: increase difficulty
    else if (recentSuccessRate > 0.85 || boredomLevel > 60) {
      this.learnerProfile.currentDifficulty = Math.min(10, this.learnerProfile.currentDifficulty + 0.5);
    }
    // Optimal zone (60-80% success): maintain difficulty
  }

  /**
   * Select the next learning event (20 Questions logic)
   */
  selectNextEvent(): OracleDecision {
    const recommendations: string[] = [];

    // Filter out completed events on cooldown
    const candidateEvents = this.availableEvents.filter(event => {
      return !this.completedEvents.has(event.id) || !event.cooldown;
    });

    if (candidateEvents.length === 0) {
      return {
        selectedEvent: null,
        reason: 'No available events',
        confidence: 0,
        recommendations: ['Create more learning events'],
      };
    }

    // QUESTION 1: Is player frustrated? (Priority: reduce difficulty)
    if (this.learnerProfile.frustrationLevel > 60) {
      const easyEvent = this.findEasiestSuitableEvent(candidateEvents);
      if (easyEvent) {
        return {
          selectedEvent: easyEvent,
          reason: 'Player struggling - providing easier content',
          confidence: 0.9,
          recommendations: ['Focus on vocabulary review', 'Practice known concepts'],
        };
      }
    }

    // QUESTION 2: Is player bored? (Priority: increase challenge)
    if (this.learnerProfile.boredomLevel > 60) {
      const hardEvent = this.findChallengingEvent(candidateEvents);
      if (hardEvent) {
        return {
          selectedEvent: hardEvent,
          reason: 'Player excelling - increasing challenge',
          confidence: 0.9,
          recommendations: ['Introduce new grammar', 'Combine multiple concepts'],
        };
      }
    }

    // QUESTION 3: Does player have weak words to reinforce?
    const weakWords = Array.from(this.learnerProfile.weakWords.entries())
      .filter(([_, count]) => count > 2)
      .map(([word]) => word);

    if (weakWords.length > 0) {
      const reinforcementEvent = this.findEventWithWords(candidateEvents, weakWords);
      if (reinforcementEvent) {
        return {
          selectedEvent: reinforcementEvent,
          reason: `Reinforcing weak vocabulary: ${weakWords.slice(0, 3).join(', ')}`,
          confidence: 0.85,
          recommendations: weakWords.slice(0, 5),
        };
      }
    }

    // QUESTION 4: Is it time for new vocabulary?
    if (this.learnerProfile.newWordsIntroducedRecently.length < 3) {
      const newVocabEvent = this.findNewVocabularyEvent(candidateEvents);
      if (newVocabEvent) {
        return {
          selectedEvent: newVocabEvent,
          reason: 'Introducing new vocabulary',
          confidence: 0.8,
          recommendations: newVocabEvent.newVocabulary.slice(0, 5),
        };
      }
    }

    // DEFAULT: Select event matching current difficulty
    const matchedEvent = this.findEventByDifficulty(
      candidateEvents,
      this.learnerProfile.currentDifficulty
    );

    return {
      selectedEvent: matchedEvent,
      reason: `Selected based on difficulty level ${Math.round(this.learnerProfile.currentDifficulty)}`,
      confidence: 0.7,
      recommendations: ['Continue practicing'],
    };
  }

  /**
   * Find easiest suitable event (for frustrated players)
   */
  private findEasiestSuitableEvent(events: LearningEvent[]): LearningEvent | null {
    const knownWords = Array.from(this.learnerProfile.knownWords);

    // Find events that only use words player already knows
    const suitableEvents = events.filter(event =>
      event.vocabularyRequired.every(word => knownWords.includes(word))
    );

    if (suitableEvents.length === 0) return null;

    // Return easiest
    return suitableEvents.reduce((easiest, event) =>
      event.difficulty < easiest.difficulty ? event : easiest
    );
  }

  /**
   * Find challenging event (for bored players)
   */
  private findChallengingEvent(events: LearningEvent[]): LearningEvent | null {
    const currentDiff = this.learnerProfile.currentDifficulty;

    // Find events 2+ difficulty levels higher
    const challenges = events.filter(event => event.difficulty >= currentDiff + 2);

    if (challenges.length === 0) return null;

    // Return one with most new vocabulary
    return challenges.reduce((best, event) =>
      event.newVocabulary.length > best.newVocabulary.length ? event : best
    );
  }

  /**
   * Find event that uses specific words (for reinforcement)
   */
  private findEventWithWords(events: LearningEvent[], targetWords: string[]): LearningEvent | null {
    const matches = events.filter(event =>
      event.vocabularyRequired.some(word => targetWords.includes(word)) ||
      event.newVocabulary.some(word => targetWords.includes(word))
    );

    if (matches.length === 0) return null;

    // Return event with most target words
    return matches.reduce((best, event) => {
      const bestCount = [...event.vocabularyRequired, ...event.newVocabulary]
        .filter(w => targetWords.includes(w)).length;
      const currentCount = [...best.vocabularyRequired, ...best.newVocabulary]
        .filter(w => targetWords.includes(w)).length;
      return currentCount > bestCount ? best : event;
    });
  }

  /**
   * Find event with new vocabulary
   */
  private findNewVocabularyEvent(events: LearningEvent[]): LearningEvent | null {
    const knownWords = Array.from(this.learnerProfile.knownWords);

    const newVocabEvents = events.filter(event =>
      event.newVocabulary.length > 0 &&
      event.newVocabulary.some(word => !knownWords.includes(word))
    );

    if (newVocabEvents.length === 0) return null;

    // Return event closest to current difficulty
    return newVocabEvents.reduce((best, event) =>
      Math.abs(event.difficulty - this.learnerProfile.currentDifficulty) <
      Math.abs(best.difficulty - this.learnerProfile.currentDifficulty)
        ? event
        : best
    );
  }

  /**
   * Find event by difficulty
   */
  private findEventByDifficulty(events: LearningEvent[], targetDifficulty: number): LearningEvent | null {
    if (events.length === 0) return null;

    // Find event closest to target difficulty
    return events.reduce((best, event) =>
      Math.abs(event.difficulty - targetDifficulty) <
      Math.abs(best.difficulty - targetDifficulty)
        ? event
        : best
    );
  }

  /**
   * Mark event as completed
   */
  markEventCompleted(eventId: string): void {
    this.completedEvents.add(eventId);
  }

  /**
   * Get current learner profile (for debugging/display)
   */
  getProfile(): LearnerProfile {
    return { ...this.learnerProfile };
  }

  /**
   * Get learning analytics summary
   */
  getAnalytics(): {
    knownVocabularySize: number;
    weakWordsCount: number;
    successRate: number;
    currentDifficulty: number;
    frustrationLevel: number;
    boredomLevel: number;
    recommendation: string;
  } {
    let recommendation = 'Continue practicing';

    if (this.learnerProfile.frustrationLevel > 60) {
      recommendation = 'Take a break or try easier content';
    } else if (this.learnerProfile.boredomLevel > 60) {
      recommendation = 'Ready for more challenging content';
    } else if (this.learnerProfile.recentSuccessRate > 0.7 && this.learnerProfile.recentSuccessRate < 0.9) {
      recommendation = 'Perfect learning zone! Keep going';
    }

    return {
      knownVocabularySize: this.learnerProfile.knownWords.size,
      weakWordsCount: this.learnerProfile.weakWords.size,
      successRate: this.learnerProfile.recentSuccessRate,
      currentDifficulty: this.learnerProfile.currentDifficulty,
      frustrationLevel: this.learnerProfile.frustrationLevel,
      boredomLevel: this.learnerProfile.boredomLevel,
      recommendation,
    };
  }
}

/**
 * Create demo learning events for testing
 */
export function createDemoLearningEvents(): LearningEvent[] {
  return [
    {
      id: 'vocab_basics_1',
      type: 'vocabulary',
      difficulty: 1,
      vocabularyRequired: [],
      newVocabulary: ['door', 'key', 'room'],
      grammarConcepts: ['present_tense', 'articles'],
      estimatedDuration: 5,
    },
    {
      id: 'vocab_basics_2',
      type: 'vocabulary',
      difficulty: 2,
      vocabularyRequired: ['door', 'key'],
      newVocabulary: ['window', 'table', 'chair'],
      grammarConcepts: ['present_tense', 'adjectives'],
      estimatedDuration: 5,
    },
    {
      id: 'challenge_escape_room',
      type: 'challenge',
      difficulty: 5,
      vocabularyRequired: ['door', 'key', 'room', 'window'],
      newVocabulary: ['lock', 'unlock', 'escape'],
      grammarConcepts: ['past_tense', 'conditionals'],
      estimatedDuration: 10,
      cooldown: 3,
    },
    {
      id: 'grammar_past_tense',
      type: 'grammar',
      difficulty: 4,
      vocabularyRequired: ['door', 'key', 'open'],
      newVocabulary: [],
      grammarConcepts: ['past_tense'],
      estimatedDuration: 8,
    },
  ];
}
