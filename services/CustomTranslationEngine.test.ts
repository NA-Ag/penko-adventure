/**
 * Tests for CustomTranslationEngine
 */

import { CustomTranslationEngine } from './CustomTranslationEngine';
import { Language } from '../types';

describe('CustomTranslationEngine', () => {
  let engine: CustomTranslationEngine;

  beforeEach(() => {
    engine = new CustomTranslationEngine();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await engine.initialize();
      const stats = engine.getStats();
      expect(stats.initialized).toBe(true);
    });
  });

  describe('English to Spanish Translation', () => {
    it('should translate simple sentence', async () => {
      const result = await engine.translateText('You see a forest.', {
        targetLanguage: Language.SPANISH
      });

      expect(result.translatedText).toBeTruthy();
      expect(result.coveragePercent).toBeGreaterThan(50);
      console.log('Spanish:', result.translatedText);
    });

    it('should translate game narrative', async () => {
      const narrative = 'You enter a dark cave. A mysterious merchant appears.';
      const result = await engine.translateText(narrative, {
        targetLanguage: Language.SPANISH,
        useGrammarRules: true
      });

      expect(result.translatedText).toBeTruthy();
      expect(result.coveragePercent).toBeGreaterThan(60);
      console.log('Spanish narrative:', result.translatedText);
      console.log('Coverage:', result.coveragePercent.toFixed(1) + '%');
    });

    it('should preserve capitalization', async () => {
      const result = await engine.translateText('Hello world', {
        targetLanguage: Language.SPANISH,
        maintainFormatting: true
      });

      expect(result.translatedText[0]).toBe(result.translatedText[0].toUpperCase());
    });

    it('should preserve game entities', async () => {
      const result = await engine.translateText('You meet Gandalf the wizard', {
        targetLanguage: Language.SPANISH,
        preserveEntities: ['Gandalf']
      });

      expect(result.translatedText).toContain('Gandalf');
    });
  });

  describe('English to French Translation', () => {
    it('should translate simple sentence', async () => {
      const result = await engine.translateText('You find a sword.', {
        targetLanguage: Language.FRENCH
      });

      expect(result.translatedText).toBeTruthy();
      console.log('French:', result.translatedText);
    });

    it('should apply elision rules', async () => {
      const result = await engine.translateText('the ancient sword', {
        targetLanguage: Language.FRENCH,
        useGrammarRules: true
      });

      // Should have "l'" before vowels
      console.log('French with elision:', result.translatedText);
    });
  });

  describe('English to Japanese Translation', () => {
    it('should translate simple sentence', async () => {
      const result = await engine.translateText('You enter the forest.', {
        targetLanguage: Language.JAPANESE
      });

      expect(result.translatedText).toBeTruthy();
      console.log('Japanese:', result.translatedText);
    });
  });

  describe('Translation Memory', () => {
    it('should cache translations', async () => {
      const text = 'forest';

      // First translation
      const result1 = await engine.translateText(text, {
        targetLanguage: Language.SPANISH
      });
      const time1 = result1.tokensUsed;

      // Second translation (should be faster from cache)
      const result2 = await engine.translateText(text, {
        targetLanguage: Language.SPANISH
      });
      const time2 = result2.tokensUsed;

      expect(result1.translatedText).toBe(result2.translatedText);
      expect(time2).toBeLessThanOrEqual(time1);
      console.log('Cache performance:', { time1, time2, improvement: time1 - time2 + 'ms' });
    });

    it('should clear memory', () => {
      engine.clearMemory();
      const stats = engine.getStats();
      expect(stats.memorySize).toBe(0);
    });
  });

  describe('Coverage Statistics', () => {
    it('should report accurate coverage', async () => {
      const result = await engine.translateText('Hello world test unknown_word', {
        targetLanguage: Language.SPANISH
      });

      expect(result.totalWords).toBe(4);
      expect(result.wordsCovered).toBeGreaterThan(0);
      expect(result.coveragePercent).toBeGreaterThanOrEqual(0);
      expect(result.coveragePercent).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle untranslatable text gracefully', async () => {
      const result = await engine.translateText('xyzabc123', {
        targetLanguage: Language.SPANISH
      });

      // Should return original text if no translation found
      expect(result.translatedText).toBeTruthy();
    });

    it('should handle empty text', async () => {
      const result = await engine.translateText('', {
        targetLanguage: Language.SPANISH
      });

      expect(result.translatedText).toBe('');
      expect(result.totalWords).toBe(0);
    });
  });
});
