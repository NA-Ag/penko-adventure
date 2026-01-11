/**
 * InterruptionDetector - FACADE 2.3
 *
 * Detects when player is trying to interrupt an NPC mid-conversation.
 * Patterns like "wait", "hold on", "stop" indicate interruption intent.
 *
 * Based on Facade's interruption handling system.
 */

import { Language } from '../../types';

export interface InterruptionPattern {
  pattern: string;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
}

export interface InterruptionDetectionResult {
  isInterruption: boolean;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  matchedPattern: string | null;
}

export class InterruptionDetector {
  // Interruption patterns for all 12 languages
  private interruptionPatterns: Record<Language, InterruptionPattern[]> = {
    [Language.ENGLISH]: [
      // High urgency - immediate attention needed
      { pattern: 'wait', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'stop', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'hold on', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'hang on', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'excuse me', urgency: 'medium', reason: 'player_requests_attention' },

      // Medium urgency - polite interruption
      { pattern: 'but', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'however', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'actually', urgency: 'medium', reason: 'player_corrects' },
      { pattern: 'listen', urgency: 'medium', reason: 'player_redirects' },

      // Low urgency - gentle topic change
      { pattern: 'by the way', urgency: 'low', reason: 'player_changes_topic' },
      { pattern: 'speaking of', urgency: 'low', reason: 'player_relates_topic' },
      { pattern: 'before you go', urgency: 'low', reason: 'player_delays_departure' },
      { pattern: 'one more thing', urgency: 'low', reason: 'player_extends_conversation' },
    ],

    [Language.SPANISH]: [
      { pattern: 'espera', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'para', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'un momento', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'perdón', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'disculpa', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'pero', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'sin embargo', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'escucha', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'por cierto', urgency: 'low', reason: 'player_changes_topic' },
      { pattern: 'antes de que te vayas', urgency: 'low', reason: 'player_delays_departure' },
    ],

    [Language.FRENCH]: [
      { pattern: 'attends', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'arrête', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'un instant', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'excuse-moi', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'pardon', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'mais', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'cependant', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'écoute', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'au fait', urgency: 'low', reason: 'player_changes_topic' },
      { pattern: 'avant que tu partes', urgency: 'low', reason: 'player_delays_departure' },
    ],

    [Language.GERMAN]: [
      { pattern: 'warte', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'halt', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'stopp', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'einen moment', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'entschuldigung', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'aber', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'jedoch', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'hör zu', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'übrigens', urgency: 'low', reason: 'player_changes_topic' },
      { pattern: 'bevor du gehst', urgency: 'low', reason: 'player_delays_departure' },
    ],

    [Language.ITALIAN]: [
      { pattern: 'aspetta', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'ferma', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'un attimo', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'scusa', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'mi scusi', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'ma', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'però', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'ascolta', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'comunque', urgency: 'low', reason: 'player_changes_topic' },
      { pattern: 'prima che tu vada', urgency: 'low', reason: 'player_delays_departure' },
    ],

    [Language.JAPANESE]: [
      { pattern: '待って', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'ちょっと', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'すみません', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'でも', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'しかし', urgency: 'medium', reason: 'player_counters' },
      { pattern: '聞いて', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'ところで', urgency: 'low', reason: 'player_changes_topic' },
    ],

    [Language.MANDARIN]: [
      { pattern: '等等', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: '等一下', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: '对不起', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: '但是', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: '可是', urgency: 'medium', reason: 'player_counters' },
      { pattern: '听着', urgency: 'medium', reason: 'player_redirects' },
      { pattern: '顺便说一下', urgency: 'low', reason: 'player_changes_topic' },
    ],

    [Language.RUSSIAN]: [
      { pattern: 'подожди', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'стой', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'минутку', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'извини', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'но', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'однако', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'слушай', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'кстати', urgency: 'low', reason: 'player_changes_topic' },
    ],

    [Language.PORTUGUESE]: [
      { pattern: 'espera', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'para', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'um momento', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'desculpa', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'com licença', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'mas', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'porém', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'escuta', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'a propósito', urgency: 'low', reason: 'player_changes_topic' },
    ],

    [Language.UKRAINIAN]: [
      { pattern: 'зачекай', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'стій', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'хвилинку', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'вибач', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'але', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'однак', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'слухай', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'до речі', urgency: 'low', reason: 'player_changes_topic' },
    ],

    [Language.POLISH]: [
      { pattern: 'czekaj', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'stop', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'chwilę', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'przepraszam', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'ale', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'jednak', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'słuchaj', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'nawiasem mówiąc', urgency: 'low', reason: 'player_changes_topic' },
    ],

    [Language.CZECH]: [
      { pattern: 'počkej', urgency: 'high', reason: 'player_demands_attention' },
      { pattern: 'zastav', urgency: 'high', reason: 'player_halts_conversation' },
      { pattern: 'chvilku', urgency: 'high', reason: 'player_pauses_conversation' },
      { pattern: 'promiň', urgency: 'medium', reason: 'player_requests_attention' },
      { pattern: 'ale', urgency: 'medium', reason: 'player_disagrees' },
      { pattern: 'však', urgency: 'medium', reason: 'player_counters' },
      { pattern: 'poslouchej', urgency: 'medium', reason: 'player_redirects' },
      { pattern: 'mimochodem', urgency: 'low', reason: 'player_changes_topic' },
    ],
  };

  /**
   * Detect if player input contains interruption patterns
   */
  detectInterruption(input: string, language: Language): InterruptionDetectionResult {
    const normalizedInput = input.toLowerCase().trim();
    const patterns = this.interruptionPatterns[language] || this.interruptionPatterns[Language.ENGLISH];

    // Check patterns in order of urgency (high → medium → low)
    // This ensures we catch the most urgent interruptions first
    const sortedPatterns = [...patterns].sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    for (const pattern of sortedPatterns) {
      // Check if input starts with pattern (highest priority)
      if (normalizedInput.startsWith(pattern.pattern)) {
        return {
          isInterruption: true,
          urgency: pattern.urgency,
          reason: pattern.reason,
          matchedPattern: pattern.pattern,
        };
      }

      // Check if input contains pattern as a separate word
      const regex = new RegExp(`\\b${this.escapeRegex(pattern.pattern)}\\b`, 'i');
      if (regex.test(normalizedInput)) {
        return {
          isInterruption: true,
          urgency: pattern.urgency,
          reason: pattern.reason,
          matchedPattern: pattern.pattern,
        };
      }
    }

    // No interruption detected
    return {
      isInterruption: false,
      urgency: 'low',
      reason: 'none',
      matchedPattern: null,
    };
  }

  /**
   * Check if input is ONLY an interruption (e.g., just "wait" with no follow-up)
   */
  isPureInterruption(input: string, language: Language): boolean {
    const detection = this.detectInterruption(input, language);
    if (!detection.isInterruption || !detection.matchedPattern) {
      return false;
    }

    const normalizedInput = input.toLowerCase().trim();

    // Check if input is ONLY the interruption pattern (with optional punctuation)
    const purePattern = new RegExp(`^${this.escapeRegex(detection.matchedPattern)}[!.?]*$`, 'i');
    return purePattern.test(normalizedInput);
  }

  /**
   * Get interruption patterns for a specific language (for testing/debugging)
   */
  getPatterns(language: Language): InterruptionPattern[] {
    return this.interruptionPatterns[language] || this.interruptionPatterns[Language.ENGLISH];
  }

  /**
   * Helper: Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
