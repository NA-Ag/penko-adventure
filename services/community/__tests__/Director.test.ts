/**
 * Director (Pacing Engine) Tests
 */

import { Director, createDirector } from '../Director';
import { Oracle } from '../Oracle';
import { ScenarioNode } from '../../../types/scenarios';
import { Language } from '../../../types';

describe('Director - Pacing Engine', () => {
  let oracle: Oracle;
  let director: Director;

  beforeEach(() => {
    oracle = new Oracle({ cefrLevel: 'A1' });
    director = createDirector(oracle, {
      frustrationThreshold: 60,
      boredomThreshold: 60,
      minTurnsBetweenInterventions: 3,
      hintCooldown: 5,
      enableHints: true,
      enableDifficultyAdjustment: true,
      enableMilestones: true,
    });
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      const testOracle = new Oracle({ cefrLevel: 'A1' });
      const defaultDirector = createDirector(testOracle);
      expect(defaultDirector).toBeDefined();
      expect(defaultDirector.getStats().totalInterventions).toBe(0);
    });

    test('should initialize with custom configuration', () => {
      const testOracle = new Oracle({ cefrLevel: 'A1' });
      const customDirector = createDirector(testOracle, {
        frustrationThreshold: 70,
        boredomThreshold: 50,
        enableHints: false,
      });
      expect(customDirector).toBeDefined();
    });
  });

  describe('Intervention Evaluation', () => {
    test('should return NONE when no intervention needed', () => {
      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      const decision = director.evaluateIntervention(node, Language.ENGLISH);

      // First call should be NONE due to minTurnsBetweenInterventions
      expect(decision.intervention).toBe('NONE');
      expect(decision.reason).toContain('Too soon');
    });

    test('should enforce minTurnsBetweenInterventions cooldown', () => {
      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      // Call multiple times
      director.evaluateIntervention(node, Language.ENGLISH);
      director.evaluateIntervention(node, Language.ENGLISH);
      const decision = director.evaluateIntervention(node, Language.ENGLISH);

      // Should still be NONE due to cooldown
      expect(decision.intervention).toBe('NONE');
      expect(decision.confidence).toBeGreaterThan(0);
    });

    test('should provide HINT when player is frustrated', () => {
      // Simulate player frustration by recording many failures
      // Need enough failures to get frustration > 60
      for (let i = 0; i < 20; i++) {
        oracle.recordAttempt(false, ['test', 'words']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
        objects: ['door'],
      };

      // Skip cooldown period
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.ENGLISH);
      }

      const decision = director.evaluateIntervention(node, Language.ENGLISH);

      expect(decision.intervention).toBe('HINT');
      expect(decision.reason).toContain('frustration');
      expect(decision.narrativeHint).toBeTruthy();
      expect(decision.suggestedAction).toBeTruthy();
      expect(decision.difficultyAdjustment).toBeLessThan(0); // Should reduce difficulty
    });

    test('should provide CHALLENGE when player is bored', () => {
      // Simulate player boredom by recording many easy successes
      for (let i = 0; i < 20; i++) {
        oracle.recordAttempt(true, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      // Skip cooldown period
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.ENGLISH);
      }

      const decision = director.evaluateIntervention(node, Language.ENGLISH);

      expect(decision.intervention).toBe('CHALLENGE');
      expect(decision.reason).toContain('boredom');
      expect(decision.narrativeHint).toBeTruthy();
      expect(decision.difficultyAdjustment).toBeGreaterThan(0); // Should increase difficulty
    });
  });

  describe('Hint Generation', () => {
    test('should generate context-aware hints based on scene objects', () => {
      // Create frustrated player state
      for (let i = 0; i < 20; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
        objects: ['chest', 'key'],
      };

      // Skip cooldown
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.ENGLISH);
      }

      const decision = director.evaluateIntervention(node, Language.ENGLISH);

      expect(decision.intervention).toBe('HINT');
      expect(decision.narrativeHint).toContain('chest');
      expect(decision.suggestedAction).toContain('chest');
    });

    test('should generate hints in multiple languages', () => {
      // Create frustrated player state
      for (let i = 0; i < 20; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
        objects: ['puerta'],
      };

      // Skip cooldown
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.SPANISH);
      }

      const decision = director.evaluateIntervention(node, Language.SPANISH);

      expect(decision.intervention).toBe('HINT');
      expect(decision.narrativeHint).toBeTruthy();
      // Should contain Spanish text
      expect(decision.narrativeHint).toContain('Pista');
    });

    test('should generate generic hints when no objects available', () => {
      // Create frustrated player state
      for (let i = 0; i < 20; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
        // No objects
      };

      // Skip cooldown
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.ENGLISH);
      }

      const decision = director.evaluateIntervention(node, Language.ENGLISH);

      expect(decision.intervention).toBe('HINT');
      expect(decision.narrativeHint).toBeTruthy();
      expect(decision.suggestedAction).toBeTruthy();
    });
  });

  describe('Statistics and State Management', () => {
    test('should track total interventions', () => {
      const initialStats = director.getStats();
      expect(initialStats.totalInterventions).toBe(0);

      // Create frustrated player and trigger intervention
      for (let i = 0; i < 10; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      // Skip cooldown and trigger intervention
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.ENGLISH);
      }

      director.evaluateIntervention(node, Language.ENGLISH);

      const finalStats = director.getStats();
      expect(finalStats.totalInterventions).toBeGreaterThan(0);
    });

    test('should reset all state when reset() is called', () => {
      // Create some state
      for (let i = 0; i < 10; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      // Trigger intervention
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.ENGLISH);
      }
      director.evaluateIntervention(node, Language.ENGLISH);

      const beforeReset = director.getStats();
      expect(beforeReset.totalInterventions).toBeGreaterThan(0);

      // Reset
      director.reset();

      const afterReset = director.getStats();
      expect(afterReset.totalInterventions).toBe(0);
      expect(afterReset.turnsSinceLastIntervention).toBe(0);
      expect(afterReset.turnsSinceLastHint).toBe(0);
      expect(afterReset.milestonesReached).toHaveLength(0);
    });
  });

  describe('Challenge Narrative Generation', () => {
    test('should generate challenge narratives in English', () => {
      // Create bored player state
      for (let i = 0; i < 20; i++) {
        oracle.recordAttempt(true, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      // Skip cooldown
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.ENGLISH);
      }

      const decision = director.evaluateIntervention(node, Language.ENGLISH);

      expect(decision.intervention).toBe('CHALLENGE');
      expect(decision.narrativeHint).toBeTruthy();
      expect(decision.narrativeHint).toContain('⚡');
    });

    test('should generate challenge narratives in multiple languages', () => {
      // Create bored player state
      for (let i = 0; i < 20; i++) {
        oracle.recordAttempt(true, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      // Skip cooldown
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.SPANISH);
      }

      const decision = director.evaluateIntervention(node, Language.SPANISH);

      expect(decision.intervention).toBe('CHALLENGE');
      expect(decision.narrativeHint).toBeTruthy();
    });
  });

  describe('Priority System', () => {
    test('should prioritize frustration over boredom', () => {
      // Create both frustrated AND bored state - force high frustration
      for (let i = 0; i < 20; i++) {
        oracle.recordAttempt(false, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      // Skip cooldown
      for (let i = 0; i < 5; i++) {
        director.evaluateIntervention(node, Language.ENGLISH);
      }

      const decision = director.evaluateIntervention(node, Language.ENGLISH);

      // Should prioritize HINT over CHALLENGE
      expect(decision.intervention).toBe('HINT');
    });
  });

  describe('Configuration Options', () => {
    test('should respect enableHints flag', () => {
      const testOracle = new Oracle({ cefrLevel: 'A1' });
      const noHintDirector = createDirector(testOracle, {
        enableHints: false,
        frustrationThreshold: 0, // Always frustrated
        minTurnsBetweenInterventions: 0,
      });

      // Create frustrated player state
      for (let i = 0; i < 10; i++) {
        testOracle.recordAttempt(false, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      const decision = noHintDirector.evaluateIntervention(node, Language.ENGLISH);

      // Should NOT provide hints
      expect(decision.intervention).not.toBe('HINT');
    });

    test('should respect custom frustrationThreshold', () => {
      const testOracle = new Oracle({ cefrLevel: 'A1' });
      const highThresholdDirector = createDirector(testOracle, {
        frustrationThreshold: 99, // Very high threshold
        minTurnsBetweenInterventions: 0,
        hintCooldown: 0,
      });

      // Create moderately frustrated player state
      for (let i = 0; i < 5; i++) {
        testOracle.recordAttempt(false, ['test']);
      }

      const node: ScenarioNode = {
        id: 'test_node',
        text: 'Test scene',
        translation: 'Test translation',
        choices: [],
      };

      const decision = highThresholdDirector.evaluateIntervention(node, Language.ENGLISH);

      // Should NOT trigger hint due to high threshold
      expect(decision.intervention).not.toBe('HINT');
    });
  });
});
