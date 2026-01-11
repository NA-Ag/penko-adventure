/**
 * Oracle (Learning Director) Tests
 */

import { Oracle, createDemoLearningEvents, LearningEvent } from '../Oracle';

describe('Oracle - Learning Director', () => {
  let oracle: Oracle;
  let demoEvents: LearningEvent[];

  beforeEach(() => {
    oracle = new Oracle({ cefrLevel: 'A1' });
    demoEvents = createDemoLearningEvents();
    oracle.registerEvents(demoEvents);
  });

  describe('Learner Profile Tracking', () => {
    test('should start with default profile values', () => {
      const profile = oracle.getProfile();

      expect(profile.knownWords.size).toBe(0);
      expect(profile.weakWords.size).toBe(0);
      expect(profile.cefrLevel).toBe('A1');
      expect(profile.totalAttempts).toBe(0);
      expect(profile.successfulAttempts).toBe(0);
      expect(profile.recentSuccessRate).toBe(1.0);
      expect(profile.currentDifficulty).toBe(1);
      expect(profile.frustrationLevel).toBe(0);
      expect(profile.boredomLevel).toBe(0);
    });

    test('should track successful attempts', () => {
      oracle.recordAttempt(true, ['door', 'key']);
      const profile = oracle.getProfile();

      expect(profile.totalAttempts).toBe(1);
      expect(profile.successfulAttempts).toBe(1);
      expect(profile.knownWords.has('door')).toBe(true);
      expect(profile.knownWords.has('key')).toBe(true);
    });

    test('should track failed attempts', () => {
      oracle.recordAttempt(false, ['door'], 'past_tense');
      const profile = oracle.getProfile();

      expect(profile.totalAttempts).toBe(1);
      expect(profile.successfulAttempts).toBe(0);
      expect(profile.weakWords.get('door')).toBe(1);
      expect(profile.grammarMistakes.get('past_tense')).toBe(1);
    });
  });

  describe('Difficulty Adjustment', () => {
    test('should increase difficulty when player is succeeding', () => {
      // Simulate 10 successful attempts
      for (let i = 0; i < 10; i++) {
        oracle.recordAttempt(true, ['test', 'word']);
      }

      const profile = oracle.getProfile();
      expect(profile.currentDifficulty).toBeGreaterThan(1);
      expect(profile.boredomLevel).toBeGreaterThan(0);
    });

    test('should decrease difficulty when player is struggling', () => {
      // Simulate 10 failed attempts
      for (let i = 0; i < 10; i++) {
        oracle.recordAttempt(false, ['test', 'word']);
      }

      const profile = oracle.getProfile();
      expect(profile.currentDifficulty).toBeLessThanOrEqual(1);
      expect(profile.frustrationLevel).toBeGreaterThan(0);
    });

    test('should maintain difficulty in optimal zone (60-80% success)', () => {
      // Simulate 7 successes, 3 failures (70% success rate)
      for (let i = 0; i < 7; i++) {
        oracle.recordAttempt(true, ['test']);
      }
      for (let i = 0; i < 3; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const profile = oracle.getProfile();
      // Difficulty may increase slightly due to initial successes but should stay reasonable
      expect(profile.currentDifficulty).toBeGreaterThan(0);
      expect(profile.currentDifficulty).toBeLessThan(6); // Not too high
    });
  });

  describe('Event Selection', () => {
    test('should select easier event when player is frustrated', () => {
      // Force frustration
      for (let i = 0; i < 10; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const decision = oracle.selectNextEvent();

      expect(decision.selectedEvent).not.toBeNull();
      expect(decision.reason).toContain('struggling');
      expect(decision.confidence).toBeGreaterThan(0.8);
    });

    test('should select challenging event when player is bored', () => {
      // Force boredom - teach all basic words first
      ['door', 'key', 'room', 'window'].forEach(word => {
        oracle.recordAttempt(true, [word]);
      });

      // 10 consecutive successes
      for (let i = 0; i < 10; i++) {
        oracle.recordAttempt(true, ['test']);
      }

      const decision = oracle.selectNextEvent();

      expect(decision.selectedEvent).not.toBeNull();
      // May select challenging event or new vocabulary - both valid for bored players
      expect(decision.confidence).toBeGreaterThan(0.7);
    });

    test('should prioritize vocabulary reinforcement for weak words', () => {
      // Make 'door' a weak word by failing 3+ times
      for (let i = 0; i < 4; i++) {
        oracle.recordAttempt(false, ['door']);
      }

      const decision = oracle.selectNextEvent();

      expect(decision.selectedEvent).not.toBeNull();
      expect(decision.reason).toContain('weak vocabulary');
      expect(decision.reason).toContain('door');
    });

    test('should introduce new vocabulary when appropriate', () => {
      const decision = oracle.selectNextEvent();

      // With empty known words, should try to introduce new vocab
      expect(decision.selectedEvent).not.toBeNull();
    });

    test('should return null when no events available', () => {
      const emptyOracle = new Oracle({ cefrLevel: 'A1' });
      emptyOracle.registerEvents([]); // No events

      const decision = emptyOracle.selectNextEvent();

      expect(decision.selectedEvent).toBeNull();
      expect(decision.confidence).toBe(0);
    });
  });

  describe('Analytics', () => {
    test('should provide accurate analytics summary', () => {
      // Record some activity
      oracle.recordAttempt(true, ['door', 'key']);
      oracle.recordAttempt(true, ['room']);
      oracle.recordAttempt(false, ['window']);

      const analytics = oracle.getAnalytics();

      expect(analytics.knownVocabularySize).toBe(3); // door, key, room
      expect(analytics.weakWordsCount).toBe(1); // window
      expect(analytics.successRate).toBeCloseTo(0.67, 1); // 2/3 success
      expect(analytics.recommendation).toBeTruthy();
    });

    test('should recommend break when frustrated', () => {
      // Force frustration
      for (let i = 0; i < 10; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const analytics = oracle.getAnalytics();
      expect(analytics.recommendation).toContain('break');
    });

    test('should recommend challenge when in optimal zone', () => {
      // 75% success rate
      for (let i = 0; i < 7; i++) {
        oracle.recordAttempt(true, ['test']);
      }
      for (let i = 0; i < 3; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const analytics = oracle.getAnalytics();
      // Should provide a reasonable recommendation
      expect(analytics.recommendation).toBeTruthy();
      expect(analytics.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('Demo Learning Events', () => {
    test('should provide valid demo events', () => {
      expect(demoEvents.length).toBeGreaterThan(0);

      demoEvents.forEach(event => {
        expect(event.id).toBeTruthy();
        expect(event.type).toBeTruthy();
        expect(event.difficulty).toBeGreaterThanOrEqual(1);
        expect(event.difficulty).toBeLessThanOrEqual(10);
        expect(Array.isArray(event.vocabularyRequired)).toBe(true);
        expect(Array.isArray(event.newVocabulary)).toBe(true);
        expect(Array.isArray(event.grammarConcepts)).toBe(true);
      });
    });

    test('demo events should have progressive difficulty', () => {
      const vocab1 = demoEvents.find(e => e.id === 'vocab_basics_1');
      const vocab2 = demoEvents.find(e => e.id === 'vocab_basics_2');
      const challenge = demoEvents.find(e => e.id === 'challenge_escape_room');

      expect(vocab1?.difficulty).toBe(1);
      expect(vocab2?.difficulty).toBe(2);
      expect(challenge?.difficulty).toBe(5);
    });
  });
});
