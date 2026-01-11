/**
 * Response Template System - Inspired by Façade (2005)
 *
 * Instead of generating text with AI, we use:
 * - Template library with variable substitution
 * - Context-aware template selection
 * - Multi-language support
 * - Mad Libs-style text generation
 * - Genre-specific variants (Fantasy, SciFi, Horror, Western, Cyberpunk, Mystery)
 * - Berlitz error correction integration
 *
 * Example: "You [verb] the [object]. It [result]."
 *          → "You open the door. It creaks loudly."
 */

import { Language } from '../../types';
import { ObjectIntent } from './ObjectSystem';
import { ALL_GENRE_TEMPLATES } from './GenreTemplates';

/**
 * Narrative genres for Community Mode
 */
export type NarrativeGenre = 'Fantasy' | 'SciFi' | 'Mystery' | 'Horror' | 'Western' | 'Cyberpunk';

/**
 * Template variables that can be substituted (with Berlitz support)
 */
export interface TemplateContext {
  verb?: string;           // Action verb (examine, take, open)
  object?: string;         // Object name (door, key)
  objectState?: string;    // Object's current state (locked, open)
  result?: string;         // Result of action (success, failure reason)
  adjective?: string;      // Descriptive adjective (heavy, rusty)
  location?: string;       // Current location
  
  // Berlitz error correction support
  originalInput?: string;      // What user typed (with errors)
  correctedInput?: string;     // What user typed (corrected)
  hadErrors?: boolean;         // Did input have grammar errors?
  nativeVerb?: string;         // Conjugated verb in target language (to show corrected form)
  nativeObject?: string;       // Gendered/cased object in target language
  correctionNote?: string;     // Visual marker (e.g., "**corrected_verb**")
  
  // Language support
  language?: Language;
  intent?: ObjectIntent;
  success?: boolean;
  
  [key: string]: string | boolean | Language | ObjectIntent | undefined;
}

/**
 * Multi-language response template (with genre support)
 */
export interface ResponseTemplate {
  id: string;
  intent: ObjectIntent | 'INVALID' | 'GENERIC';

  // Template strings with [variable] placeholders
  templates: {
    [lang in Language]?: string[];
  };

  // When to use this template
  conditions?: {
    requiresState?: string;    // e.g., "is_locked"
    objectType?: string;       // e.g., "container", "door"
    success?: boolean;         // true = success, false = failure
  };

  // Narrative genre (Fantasy, SciFi, Horror, etc.)
  genre?: NarrativeGenre;
  
  // Priority (higher = preferred when multiple templates match)
  // Genre-specific: 10, Generic: 1
  priority?: number;
}

/**
 * Response Template Library
 */
export class ResponseTemplates {
  private templates: Map<string, ResponseTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
    this.registerGenreTemplates();  // Register all genre-specific templates
  }

  /**
   * Register a template
   */
  registerTemplate(template: ResponseTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Register multiple templates
   */
  registerTemplates(templates: ResponseTemplate[]): void {
    templates.forEach(t => this.registerTemplate(t));
  }

  /**
   * Get appropriate template for context (with genre support)
   */
  selectTemplate(
    intent: ObjectIntent | 'INVALID' | 'GENERIC',
    context: TemplateContext,
    language: Language,
    genre?: NarrativeGenre
  ): string | null {
    // Find matching templates
    const candidates = Array.from(this.templates.values()).filter(template => {
      if (template.intent !== intent) return false;
      if (!template.templates[language]) return false;

      // Check conditions
      if (template.conditions) {
        const { requiresState, objectType, success } = template.conditions;

        if (requiresState && context.objectState !== requiresState) return false;
        if (objectType && context.object !== objectType) return false;
        // Only check success condition if explicitly provided in context
        if (success !== undefined && context.result) {
          const isSuccess = context.result === 'success' || context.result === 'Success';
          if (success !== isSuccess) return false;
        }
      }

      // Genre condition (prefer genre-specific, fall back to generic)
      if (template.genre) {
        if (template.genre !== genre) return false;
      }

      return true;
    });

    if (candidates.length === 0) return null;

    // Sort by priority (higher first), preferring genre-specific templates
    candidates.sort((a, b) => {
      const aScore = (a.priority || 0) + (a.genre === genre ? 100 : 0);
      const bScore = (b.priority || 0) + (b.genre === genre ? 100 : 0);
      return bScore - aScore;
    });

    // Get templates for selected candidate
    const selectedTemplates = candidates[0].templates[language];
    if (!selectedTemplates || selectedTemplates.length === 0) return null;

    // Pick random template from array
    const randomTemplate = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];

    // Substitute variables
    return this.substituteVariables(randomTemplate, context);
  }

  /**
   * Substitute [variable] placeholders with context values
   */
  private substituteVariables(template: string, context: TemplateContext): string {
    let result = template;

    // Replace all [variable] with context values
    Object.keys(context).forEach(key => {
      const value = context[key];
      if (value !== undefined) {
        const regex = new RegExp(`\\[${key}\\]`, 'g');
        result = result.replace(regex, value);
      }
    });

    return result;
  }

  /**
   * Register default templates for common actions
   */
  private registerDefaultTemplates(): void {
    const templates: ResponseTemplate[] = [
      // EXAMINE templates
      {
        id: 'examine_basic',
        intent: 'EXAMINE',
        templates: {
          [Language.ENGLISH]: [
            'You examine the [object]. [result]',
            'You look closely at the [object]. [result]',
            'You inspect the [object]. [result]',
          ],
          [Language.SPANISH]: [
            'Examinas [object]. [result]',
            'Miras de cerca [object]. [result]',
            'Inspeccionas [object]. [result]',
          ],
          [Language.FRENCH]: [
            'Vous examinez [object]. [result]',
            'Vous regardez de près [object]. [result]',
          ],
        },
        priority: 1,
      },

      // TAKE templates (success)
      {
        id: 'take_success',
        intent: 'TAKE',
        templates: {
          [Language.ENGLISH]: [
            'You take the [object].',
            'You pick up the [object].',
            'You grab the [object].',
            'The [object] is now in your inventory.',
          ],
          [Language.SPANISH]: [
            'Tomas [object].',
            'Recoges [object].',
            'Agarras [object].',
            '[object] está ahora en tu inventario.',
          ],
          [Language.FRENCH]: [
            'Vous prenez [object].',
            'Vous ramassez [object].',
          ],
        },
        conditions: { success: true },
        priority: 5,
      },

      // TAKE templates (failure - too heavy)
      {
        id: 'take_too_heavy',
        intent: 'TAKE',
        templates: {
          [Language.ENGLISH]: [
            'The [object] is too heavy to carry.',
            'You try to lift the [object], but it\'s too heavy.',
          ],
          [Language.SPANISH]: [
            '[object] es demasiado pesado para llevarlo.',
            'Intentas levantar [object], pero es demasiado pesado.',
          ],
        },
        conditions: { success: false },
        priority: 3,
      },

      // OPEN templates (success)
      {
        id: 'open_success',
        intent: 'OPEN',
        templates: {
          [Language.ENGLISH]: [
            'You open the [object]. [result]',
            'The [object] opens with a [adjective] sound.',
            'You successfully open the [object].',
          ],
          [Language.SPANISH]: [
            'Abres [object]. [result]',
            '[object] se abre con un sonido [adjective].',
            'Abres [object] con éxito.',
          ],
        },
        conditions: { success: true },
        priority: 5,
      },

      // OPEN templates (generic)
      {
        id: 'open_generic',
        intent: 'OPEN',
        templates: {
          [Language.ENGLISH]: [
            'You open the [object].',
          ],
          [Language.SPANISH]: [
            'Abres [object].',
          ],
        },
        priority: 3,
      },

      // OPEN templates (failure - locked)
      {
        id: 'open_locked',
        intent: 'OPEN',
        templates: {
          [Language.ENGLISH]: [
            'The [object] is locked. You need a key.',
            'You try to open the [object], but it\'s locked.',
            'The [object] won\'t budge. It\'s locked.',
          ],
          [Language.SPANISH]: [
            '[object] está cerrado con llave. Necesitas una llave.',
            'Intentas abrir [object], pero está cerrado.',
            '[object] no se mueve. Está cerrado con llave.',
          ],
        },
        conditions: { success: false, requiresState: 'is_locked' },
        priority: 10,
      },

      // USE templates (success)
      {
        id: 'use_success',
        intent: 'USE',
        templates: {
          [Language.ENGLISH]: [
            'You use the [object]. [result]',
            'You activate the [object].',
          ],
          [Language.SPANISH]: [
            'Usas [object]. [result]',
            'Activas [object].',
          ],
        },
        conditions: { success: true },
        priority: 5,
      },

      // USE templates (generic)
      {
        id: 'use_generic',
        intent: 'USE',
        templates: {
          [Language.ENGLISH]: [
            'You use the [object].',
          ],
          [Language.SPANISH]: [
            'Usas [object].',
          ],
        },
        priority: 3,
      },

      // UNLOCK templates (success)
      {
        id: 'unlock_success',
        intent: 'UNLOCK',
        templates: {
          [Language.ENGLISH]: [
            'You unlock the [object] with the key.',
            'Click! The [object] is now unlocked.',
            'The key turns smoothly. The [object] is unlocked.',
          ],
          [Language.SPANISH]: [
            'Desbloqueas [object] con la llave.',
            '¡Clic! [object] está ahora desbloqueado.',
            'La llave gira suavemente. [object] está desbloqueado.',
          ],
        },
        conditions: { success: true },
        priority: 5,
      },

      // UNLOCK templates (failure - no key)
      {
        id: 'unlock_no_key',
        intent: 'UNLOCK',
        templates: {
          [Language.ENGLISH]: [
            'You need a key to unlock the [object].',
            'You don\'t have the right key.',
          ],
          [Language.SPANISH]: [
            'Necesitas una llave para desbloquear [object].',
            'No tienes la llave correcta.',
          ],
        },
        conditions: { success: false },
        priority: 8,
      },

      // DROP templates
      {
        id: 'drop_success',
        intent: 'DROP',
        templates: {
          [Language.ENGLISH]: [
            'You drop the [object].',
            'You place the [object] on the ground.',
          ],
          [Language.SPANISH]: [
            'Sueltas [object].',
            'Colocas [object] en el suelo.',
          ],
        },
        priority: 5,
      },

      // BREAK templates
      {
        id: 'break_success',
        intent: 'BREAK',
        templates: {
          [Language.ENGLISH]: [
            'You break the [object]!',
            'The [object] shatters into pieces.',
            'With a loud crack, the [object] breaks apart.',
          ],
          [Language.SPANISH]: [
            '¡Rompes [object]!',
            '[object] se rompe en pedazos.',
            'Con un fuerte crujido, [object] se rompe.',
          ],
        },
        conditions: { success: true },
        priority: 5,
      },

      // READ templates (success)
      {
        id: 'read_success',
        intent: 'READ',
        templates: {
          [Language.ENGLISH]: [
            'You read the [object]. [result]',
            'The [object] says: [result]',
          ],
          [Language.SPANISH]: [
            'Lees [object]. [result]',
            '[object] dice: [result]',
          ],
        },
        conditions: { success: true },
        priority: 5,
      },

      // READ templates (generic)
      {
        id: 'read_generic',
        intent: 'READ',
        templates: {
          [Language.ENGLISH]: [
            'You read the [object].',
          ],
          [Language.SPANISH]: [
            'Lees [object].',
          ],
        },
        priority: 3,
      },

      // INVALID action templates
      {
        id: 'invalid_generic',
        intent: 'INVALID',
        templates: {
          [Language.ENGLISH]: [
            'You can\'t do that.',
            'That doesn\'t work.',
            'You try, but nothing happens.',
          ],
          [Language.SPANISH]: [
            'No puedes hacer eso.',
            'Eso no funciona.',
            'Lo intentas, pero no pasa nada.',
          ],
        },
        priority: 1,
      },

      // Generic fallback
      {
        id: 'generic_fallback',
        intent: 'GENERIC',
        templates: {
          [Language.ENGLISH]: [
            '[result]',
          ],
          [Language.SPANISH]: [
            '[result]',
          ],
        },
        priority: 0,
      },
    ];

    this.registerTemplates(templates);
  }

  /**
   * Register all genre-specific templates (Fantasy, SciFi, Horror, Western, etc.)
   */
  private registerGenreTemplates(): void {
    console.log(`[ResponseTemplates] Registering ${ALL_GENRE_TEMPLATES.length} genre-specific templates`);
    this.registerTemplates(ALL_GENRE_TEMPLATES);
  }

  /**
   * Get template count (for debugging)
   */
  getTemplateCount(): number {
    return this.templates.size;
  }
}

/**
 * Create default response template system
 */
export function createResponseTemplates(): ResponseTemplates {
  return new ResponseTemplates();
}
