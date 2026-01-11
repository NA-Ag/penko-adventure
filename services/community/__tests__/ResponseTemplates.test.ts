/**
 * Response Templates (Actor) Tests
 */

import { ResponseTemplates, createResponseTemplates, TemplateContext, ResponseTemplate } from '../ResponseTemplates';
import { Language } from '../../../types';

describe('ResponseTemplates - Actor (Interaction Engine)', () => {
  let templates: ResponseTemplates;

  beforeEach(() => {
    templates = createResponseTemplates();
  });

  describe('Template Registration', () => {
    test('should have default templates registered', () => {
      expect(templates.getTemplateCount()).toBeGreaterThan(0);
    });

    test('should allow registering new templates', () => {
      const initialCount = templates.getTemplateCount();

      const newTemplate: ResponseTemplate = {
        id: 'test_template',
        intent: 'TAKE',
        templates: {
          [Language.ENGLISH]: ['Test: You take [object]'],
        },
      };

      templates.registerTemplate(newTemplate);
      expect(templates.getTemplateCount()).toBe(initialCount + 1);
    });

    test('should allow registering multiple templates at once', () => {
      const initialCount = templates.getTemplateCount();

      const newTemplates: ResponseTemplate[] = [
        {
          id: 'test_1',
          intent: 'TAKE',
          templates: { [Language.ENGLISH]: ['Test 1'] },
        },
        {
          id: 'test_2',
          intent: 'OPEN',
          templates: { [Language.ENGLISH]: ['Test 2'] },
        },
      ];

      templates.registerTemplates(newTemplates);
      expect(templates.getTemplateCount()).toBe(initialCount + 2);
    });
  });

  describe('Template Selection', () => {
    test('should select template for EXAMINE action in English', () => {
      const context: TemplateContext = {
        object: 'door',
        result: 'It is made of wood',
      };

      const result = templates.selectTemplate('EXAMINE', context, Language.ENGLISH);

      expect(result).toBeTruthy();
      expect(result).toContain('door');
      expect(result).toContain('It is made of wood');
    });

    test('should select template for TAKE action in Spanish', () => {
      const context: TemplateContext = {
        object: 'la llave',
      };

      const result = templates.selectTemplate('TAKE', context, Language.SPANISH);

      expect(result).toBeTruthy();
      expect(result).toContain('la llave');
    });

    test('should return null when no template exists for language', () => {
      const context: TemplateContext = {
        object: 'door',
      };

      // Try a language that doesn't have templates
      const result = templates.selectTemplate('EXAMINE', context, Language.JAPANESE);

      expect(result).toBeNull();
    });

    test('should select higher priority templates over lower priority', () => {
      // Register two templates with different priorities
      templates.registerTemplate({
        id: 'low_priority',
        intent: 'TAKE',
        templates: {
          [Language.ENGLISH]: ['Low priority template [object]'],
        },
        priority: 1,
      });

      templates.registerTemplate({
        id: 'high_priority',
        intent: 'TAKE',
        templates: {
          [Language.ENGLISH]: ['High priority template [object]'],
        },
        priority: 10,
      });

      const context: TemplateContext = { object: 'key' };
      const result = templates.selectTemplate('TAKE', context, Language.ENGLISH);

      expect(result).toContain('High priority');
    });
  });

  describe('Variable Substitution', () => {
    test('should substitute single variable', () => {
      const context: TemplateContext = {
        object: 'key',
      };

      const result = templates.selectTemplate('TAKE', context, Language.ENGLISH);

      expect(result).toBeTruthy();
      expect(result).toContain('key');
      expect(result).not.toContain('[object]');
    });

    test('should substitute multiple variables', () => {
      const context: TemplateContext = {
        object: 'door',
        verb: 'open',
        result: 'It creaks loudly',
      };

      const result = templates.selectTemplate('OPEN', context, Language.ENGLISH);

      expect(result).toBeTruthy();
      expect(result).toContain('door');
    });

    test('should handle missing variables gracefully', () => {
      const context: TemplateContext = {
        object: 'key',
        // verb is missing
      };

      const result = templates.selectTemplate('TAKE', context, Language.ENGLISH);

      // Should still return a result, just with [verb] not replaced
      expect(result).toBeTruthy();
    });
  });

  describe('Conditional Template Selection', () => {
    test('should select success template when success=true', () => {
      const context: TemplateContext = {
        object: 'chest',
        result: 'success',
      };

      templates.registerTemplate({
        id: 'test_success',
        intent: 'OPEN',
        templates: {
          [Language.ENGLISH]: ['SUCCESS: You open the [object]'],
        },
        conditions: { success: true },
        priority: 100,
      });

      const result = templates.selectTemplate('OPEN', context, Language.ENGLISH);

      expect(result).toContain('SUCCESS');
    });

    test('should select failure template when success=false', () => {
      const context: TemplateContext = {
        object: 'locked door',
        result: 'failure',
      };

      templates.registerTemplate({
        id: 'test_failure',
        intent: 'OPEN',
        templates: {
          [Language.ENGLISH]: ['FAILURE: The [object] won\'t open'],
        },
        conditions: { success: false },
        priority: 100,
      });

      const result = templates.selectTemplate('OPEN', context, Language.ENGLISH);

      expect(result).toContain('FAILURE');
    });

    test('should respect requiresState condition', () => {
      const context: TemplateContext = {
        object: 'door',
        objectState: 'is_locked',
      };

      templates.registerTemplate({
        id: 'test_locked',
        intent: 'OPEN',
        templates: {
          [Language.ENGLISH]: ['LOCKED: The [object] is locked'],
        },
        conditions: { requiresState: 'is_locked' },
        priority: 100,
      });

      const result = templates.selectTemplate('OPEN', context, Language.ENGLISH);

      expect(result).toContain('LOCKED');
    });
  });

  describe('Multi-language Support', () => {
    test('should provide Spanish templates', () => {
      const context: TemplateContext = {
        object: 'la puerta',
      };

      const result = templates.selectTemplate('EXAMINE', context, Language.SPANISH);

      expect(result).toBeTruthy();
      expect(result).toContain('la puerta');
    });

    test('should provide French templates', () => {
      const context: TemplateContext = {
        object: 'la porte',
      };

      const result = templates.selectTemplate('EXAMINE', context, Language.FRENCH);

      expect(result).toBeTruthy();
      expect(result).toContain('la porte');
    });

    test('should return different text for same action in different languages', () => {
      const context: TemplateContext = {
        object: 'key/llave',
      };

      const englishResult = templates.selectTemplate('TAKE', context, Language.ENGLISH);
      const spanishResult = templates.selectTemplate('TAKE', context, Language.SPANISH);

      expect(englishResult).toBeTruthy();
      expect(spanishResult).toBeTruthy();
      expect(englishResult).not.toBe(spanishResult);
    });
  });

  describe('Default Templates', () => {
    test('should have EXAMINE templates', () => {
      const context: TemplateContext = { object: 'book', result: 'An old tome' };
      const result = templates.selectTemplate('EXAMINE', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have TAKE templates', () => {
      const context: TemplateContext = { object: 'coin' };
      const result = templates.selectTemplate('TAKE', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have OPEN templates', () => {
      const context: TemplateContext = { object: 'box' };
      const result = templates.selectTemplate('OPEN', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have USE templates', () => {
      const context: TemplateContext = { object: 'lever', result: 'Click!' };
      const result = templates.selectTemplate('USE', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have UNLOCK templates', () => {
      const context: TemplateContext = { object: 'door' };
      const result = templates.selectTemplate('UNLOCK', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have DROP templates', () => {
      const context: TemplateContext = { object: 'stone' };
      const result = templates.selectTemplate('DROP', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have BREAK templates', () => {
      const context: TemplateContext = { object: 'vase' };
      const result = templates.selectTemplate('BREAK', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have READ templates', () => {
      const context: TemplateContext = { object: 'sign', result: 'Welcome!' };
      const result = templates.selectTemplate('READ', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have INVALID action templates', () => {
      const context: TemplateContext = {};
      const result = templates.selectTemplate('INVALID', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });

    test('should have GENERIC fallback templates', () => {
      const context: TemplateContext = { result: 'Something happens' };
      const result = templates.selectTemplate('GENERIC', context, Language.ENGLISH);

      expect(result).toBeTruthy();
    });
  });

  describe('Randomization', () => {
    test('should select from multiple template variations', () => {
      // Register template with multiple variations
      templates.registerTemplate({
        id: 'multi_variation',
        intent: 'TAKE',
        templates: {
          [Language.ENGLISH]: [
            'Variation 1: [object]',
            'Variation 2: [object]',
            'Variation 3: [object]',
          ],
        },
        priority: 999,
      });

      const context: TemplateContext = { object: 'test' };

      // Run multiple times and collect results
      const results = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const result = templates.selectTemplate('TAKE', context, Language.ENGLISH);
        if (result) results.add(result);
      }

      // Should eventually get at least 2 different variations
      expect(results.size).toBeGreaterThan(1);
    });
  });
});
