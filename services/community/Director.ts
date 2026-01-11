/**
 * Director (Pacing Engine) - Inspired by Left 4 Dead AI Director
 *
 * The Director is the "hands" that modify the game world based on Oracle's "brain"
 *
 * Responsibilities:
 * - Spawn dynamic events based on player frustration/boredom
 * - Adjust scenario difficulty on-the-fly
 * - Insert "helper" hints when player is struggling
 * - Add challenges when player is excelling
 * - Maintain pacing and tension
 *
 * Philosophy: "The best teacher knows when to help and when to challenge"
 */

import { Language } from '../../types';
import { Oracle, LearningEvent, OracleDecision } from './Oracle';
import { ScenarioNode } from '../../types/scenarios';

/**
 * Director intervention types
 */
export type InterventionType =
  | 'HINT'           // Provide a helpful hint
  | 'SIMPLIFY'       // Make current challenge easier
  | 'CHALLENGE'      // Add a new challenge
  | 'BREATHER'       // Insert a moment of calm
  | 'MILESTONE'      // Celebrate progress
  | 'NONE';          // No intervention needed

/**
 * Director decision about what to do next
 */
export interface DirectorDecision {
  intervention: InterventionType;
  reason: string;
  confidence: number;           // 0-1
  suggestedAction?: string;     // What action to suggest to player
  narrativeHint?: string;       // Story-based hint
  difficultyAdjustment?: number; // -1 to +1 (decrease/increase difficulty)
}

/**
 * Director configuration
 */
export interface DirectorConfig {
  // Intervention thresholds
  frustrationThreshold: number;   // Trigger help at this frustration level (default: 60)
  boredomThreshold: number;       // Trigger challenge at this boredom level (default: 60)

  // Pacing settings
  minTurnsBetweenInterventions: number;  // Wait at least N turns between interventions (default: 3)
  hintCooldown: number;                   // Turns before can give another hint (default: 5)

  // Feature flags
  enableHints: boolean;                   // Allow giving hints (default: true)
  enableDifficultyAdjustment: boolean;   // Allow changing difficulty (default: true)
  enableMilestones: boolean;              // Celebrate achievements (default: true)
}

/**
 * Director - The Pacing Engine
 *
 * Uses Oracle's analytics to decide when and how to intervene
 */
export class Director {
  private oracle: Oracle;
  private config: DirectorConfig;

  // State tracking
  private turnsSinceLastIntervention: number = 0;
  private turnsSinceLastHint: number = 0;
  private totalInterventions: number = 0;
  private milestonesReached: Set<string> = new Set();

  constructor(oracle: Oracle, config?: Partial<DirectorConfig>) {
    this.oracle = oracle;
    this.config = {
      frustrationThreshold: 60,
      boredomThreshold: 60,
      minTurnsBetweenInterventions: 3,
      hintCooldown: 5,
      enableHints: true,
      enableDifficultyAdjustment: true,
      enableMilestones: true,
      ...config,
    };
  }

  /**
   * Main decision point: Should Director intervene?
   */
  evaluateIntervention(currentNode: ScenarioNode, language: Language): DirectorDecision {
    this.turnsSinceLastIntervention++;
    this.turnsSinceLastHint++;

    const analytics = this.oracle.getAnalytics();
    const profile = this.oracle.getProfile();

    // Don't intervene too frequently
    if (this.turnsSinceLastIntervention < this.config.minTurnsBetweenInterventions) {
      return {
        intervention: 'NONE',
        reason: 'Too soon since last intervention',
        confidence: 1.0,
      };
    }

    // PRIORITY 1: Player is struggling badly (frustration > threshold)
    if (analytics.frustrationLevel > this.config.frustrationThreshold && this.config.enableHints) {
      if (this.turnsSinceLastHint >= this.config.hintCooldown) {
        return this.createHintIntervention(currentNode, language, analytics.frustrationLevel);
      }
    }

    // PRIORITY 2: Player is bored (boredom > threshold)
    if (analytics.boredomLevel > this.config.boredomThreshold) {
      return this.createChallengeIntervention(language, analytics.boredomLevel);
    }

    // PRIORITY 3: Check for milestone celebrations
    if (this.config.enableMilestones) {
      const milestone = this.checkForMilestone(analytics);
      if (milestone) {
        return milestone;
      }
    }

    // PRIORITY 4: Optimal zone - maybe a breather or encouragement
    if (analytics.successRate > 0.6 && analytics.successRate < 0.85) {
      // Player is in the sweet spot, no intervention needed
      return {
        intervention: 'NONE',
        reason: 'Player in optimal learning zone',
        confidence: 0.9,
      };
    }

    // DEFAULT: No intervention
    return {
      intervention: 'NONE',
      reason: 'No intervention needed',
      confidence: 0.7,
    };
  }

  /**
   * Create a HINT intervention for struggling players
   */
  private createHintIntervention(
    currentNode: ScenarioNode,
    language: Language,
    frustrationLevel: number
  ): DirectorDecision {
    this.turnsSinceLastIntervention = 0;
    this.turnsSinceLastHint = 0;
    this.totalInterventions++;

    // Generate context-aware hint based on current scene
    const hint = this.generateHint(currentNode, language);

    return {
      intervention: 'HINT',
      reason: `Player frustration at ${frustrationLevel}% - providing help`,
      confidence: 0.95,
      narrativeHint: hint.narrative,
      suggestedAction: hint.action,
      difficultyAdjustment: -0.5, // Slightly reduce difficulty
    };
  }

  /**
   * Create a CHALLENGE intervention for bored players
   */
  private createChallengeIntervention(
    language: Language,
    boredomLevel: number
  ): DirectorDecision {
    this.turnsSinceLastIntervention = 0;
    this.totalInterventions++;

    // Get Oracle's recommended next event
    const oracleDecision = this.oracle.selectNextEvent();

    return {
      intervention: 'CHALLENGE',
      reason: `Player boredom at ${boredomLevel}% - adding challenge`,
      confidence: 0.9,
      narrativeHint: this.generateChallengeNarrative(language),
      difficultyAdjustment: 0.5, // Slightly increase difficulty
    };
  }

  /**
   * Check if player has reached a milestone worth celebrating
   */
  private checkForMilestone(analytics: {
    knownVocabularySize: number;
    successRate: number;
    currentDifficulty: number;
  }): DirectorDecision | null {
    // Milestone: Learned 10 new words
    if (analytics.knownVocabularySize >= 10 && !this.milestonesReached.has('vocab_10')) {
      this.milestonesReached.add('vocab_10');
      this.turnsSinceLastIntervention = 0;
      return {
        intervention: 'MILESTONE',
        reason: 'Player learned 10 words',
        confidence: 1.0,
        narrativeHint: '🎉 Milestone reached: You\'ve learned 10 new words!',
      };
    }

    // Milestone: Reached difficulty level 5
    if (analytics.currentDifficulty >= 5 && !this.milestonesReached.has('difficulty_5')) {
      this.milestonesReached.add('difficulty_5');
      this.turnsSinceLastIntervention = 0;
      return {
        intervention: 'MILESTONE',
        reason: 'Player reached difficulty 5',
        confidence: 1.0,
        narrativeHint: '🏆 You\'re getting stronger! Difficulty level increased.',
      };
    }

    // Milestone: 10 consecutive successes
    const profile = this.oracle.getProfile();
    if (profile.recentSuccessRate === 1.0 &&
        profile.successfulSentences >= 10 &&
        !this.milestonesReached.has('perfect_10')) {
      this.milestonesReached.add('perfect_10');
      this.turnsSinceLastIntervention = 0;
      return {
        intervention: 'MILESTONE',
        reason: 'Player had 10 perfect attempts',
        confidence: 1.0,
        narrativeHint: '✨ Perfect streak! You\'re on fire!',
      };
    }

    return null;
  }

  /**
   * Generate a context-aware hint based on current scene
   */
  private generateHint(node: ScenarioNode, language: Language): {
    narrative: string;
    action: string;
  } {
    // Hint based on available objects
    if (node.objects && node.objects.length > 0) {
      const firstObject = node.objects[0];

      const hints: Record<Language, { narrative: string; action: string }> = {
        [Language.ENGLISH]: {
          narrative: `💡 Hint: Try examining or interacting with the ${firstObject}.`,
          action: `examine ${firstObject}`,
        },
        [Language.SPANISH]: {
          narrative: `💡 Pista: Intenta examinar o interactuar con ${firstObject}.`,
          action: `examina ${firstObject}`,
        },
        [Language.FRENCH]: {
          narrative: `💡 Indice: Essayez d'examiner ou d'interagir avec ${firstObject}.`,
          action: `examine ${firstObject}`,
        },
        [Language.GERMAN]: {
          narrative: `💡 Hinweis: Versuchen Sie, ${firstObject} zu untersuchen.`,
          action: `untersuche ${firstObject}`,
        },
        [Language.ITALIAN]: {
          narrative: `💡 Suggerimento: Prova a esaminare ${firstObject}.`,
          action: `esamina ${firstObject}`,
        },
        [Language.PORTUGUESE]: {
          narrative: `💡 Dica: Tente examinar ${firstObject}.`,
          action: `examina ${firstObject}`,
        },
        [Language.RUSSIAN]: {
          narrative: `💡 Подсказка: Попробуйте осмотреть ${firstObject}.`,
          action: `осмотри ${firstObject}`,
        },
        [Language.CHINESE]: {
          narrative: `💡 提示：尝试检查 ${firstObject}。`,
          action: `检查 ${firstObject}`,
        },
        [Language.JAPANESE]: {
          narrative: `💡 ヒント：${firstObject}を調べてみてください。`,
          action: `${firstObject}を調べる`,
        },
        [Language.KOREAN]: {
          narrative: `💡 힌트: ${firstObject}를 조사해 보세요.`,
          action: `${firstObject} 조사`,
        },
        [Language.ARABIC]: {
          narrative: `💡 تلميح: حاول فحص ${firstObject}.`,
          action: `افحص ${firstObject}`,
        },
        [Language.DUTCH]: {
          narrative: `💡 Tip: Probeer ${firstObject} te onderzoeken.`,
          action: `onderzoek ${firstObject}`,
        },
      };

      return hints[language] || hints[Language.ENGLISH];
    }

    // Generic hint
    const genericHints: Record<Language, { narrative: string; action: string }> = {
      [Language.ENGLISH]: {
        narrative: '💡 Hint: Try looking around or examining your surroundings.',
        action: 'look',
      },
      [Language.SPANISH]: {
        narrative: '💡 Pista: Intenta mirar alrededor.',
        action: 'mira',
      },
      [Language.FRENCH]: {
        narrative: '💡 Indice: Essayez de regarder autour de vous.',
        action: 'regarde',
      },
      // ... add other languages
      [Language.GERMAN]: {
        narrative: '💡 Hinweis: Schauen Sie sich um.',
        action: 'schau dich um',
      },
      [Language.ITALIAN]: {
        narrative: '💡 Suggerimento: Guarda intorno.',
        action: 'guarda',
      },
      [Language.PORTUGUESE]: {
        narrative: '💡 Dica: Olhe ao redor.',
        action: 'olha',
      },
      [Language.RUSSIAN]: {
        narrative: '💡 Подсказка: Осмотритесь вокруг.',
        action: 'осмотрись',
      },
      [Language.CHINESE]: {
        narrative: '💡 提示：环顾四周。',
        action: '看看周围',
      },
      [Language.JAPANESE]: {
        narrative: '💡 ヒント：周りを見回してください。',
        action: '周りを見る',
      },
      [Language.KOREAN]: {
        narrative: '💡 힌트: 주변을 둘러보세요.',
        action: '둘러보기',
      },
      [Language.ARABIC]: {
        narrative: '💡 تلميح: انظر حولك.',
        action: 'انظر حولك',
      },
      [Language.DUTCH]: {
        narrative: '💡 Tip: Kijk om je heen.',
        action: 'kijk rond',
      },
    };

    return genericHints[language] || genericHints[Language.ENGLISH];
  }

  /**
   * Generate narrative for challenge intervention
   */
  private generateChallengeNarrative(language: Language): string {
    const challenges: Record<Language, string[]> = {
      [Language.ENGLISH]: [
        '⚡ You hear a mysterious sound in the distance...',
        '⚡ Something new has appeared in the room!',
        '⚡ A new challenge awaits you...',
      ],
      [Language.SPANISH]: [
        '⚡ Escuchas un sonido misterioso a lo lejos...',
        '⚡ ¡Algo nuevo ha aparecido en la habitación!',
        '⚡ Un nuevo desafío te espera...',
      ],
      [Language.FRENCH]: [
        '⚡ Vous entendez un son mystérieux au loin...',
        '⚡ Quelque chose de nouveau est apparu dans la pièce!',
        '⚡ Un nouveau défi vous attend...',
      ],
      // Add other languages as needed
      [Language.GERMAN]: [
        '⚡ Du hörst ein mysteriöses Geräusch in der Ferne...',
      ],
      [Language.ITALIAN]: [
        '⚡ Senti un suono misterioso in lontananza...',
      ],
      [Language.PORTUGUESE]: [
        '⚡ Você ouve um som misterioso à distância...',
      ],
      [Language.RUSSIAN]: [
        '⚡ Вы слышите загадочный звук вдали...',
      ],
      [Language.CHINESE]: [
        '⚡ 你听到远处传来神秘的声音...',
      ],
      [Language.JAPANESE]: [
        '⚡ 遠くから不思議な音が聞こえる...',
      ],
      [Language.KOREAN]: [
        '⚡ 멀리서 신비로운 소리가 들립니다...',
      ],
      [Language.ARABIC]: [
        '⚡ تسمع صوتًا غامضًا عن بعد...',
      ],
      [Language.DUTCH]: [
        '⚡ Je hoort een mysterieus geluid in de verte...',
      ],
    };

    const languageChallenges = challenges[language] || challenges[Language.ENGLISH];
    return languageChallenges[Math.floor(Math.random() * languageChallenges.length)];
  }

  /**
   * Get Director statistics (for debugging/analytics)
   */
  getStats() {
    return {
      totalInterventions: this.totalInterventions,
      turnsSinceLastIntervention: this.turnsSinceLastIntervention,
      turnsSinceLastHint: this.turnsSinceLastHint,
      milestonesReached: Array.from(this.milestonesReached),
    };
  }

  /**
   * Reset Director state (e.g., when starting new scenario)
   */
  reset() {
    this.turnsSinceLastIntervention = 0;
    this.turnsSinceLastHint = 0;
    this.totalInterventions = 0;
    this.milestonesReached.clear();
  }
}

/**
 * Create Director with default configuration
 */
export function createDirector(oracle: Oracle, config?: Partial<DirectorConfig>): Director {
  return new Director(oracle, config);
}
