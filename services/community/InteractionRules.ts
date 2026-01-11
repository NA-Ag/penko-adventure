/**
 * InteractionRules - Defines rules for two-object interactions (Tier 9)
 *
 * Inspired by Scribblenauts' emergent gameplay system.
 * This service determines what happens when one object is used on another
 * based on their properties and traits.
 *
 * Philosophy:
 * - Rules are based on object PROPERTIES, not IDs (emergent behavior)
 * - Content creators define traits, this engine provides the logic
 * - New objects automatically work with existing rules
 *
 * Example:
 * - USE rope (has trait: "ropelike") ON door (has trait: "lockable")
 *   -> Rule: If item is sharp + target is ropelike -> CUT
 * - USE key (has required_item_for: "wooden_door") ON wooden_door
 *   -> Rule: If item.required_item matches target.id -> UNLOCK
 */

import { GameObject, ObjectProperties } from './ObjectSystem';
import { Language } from '../../types';

/**
 * Result of evaluating an interaction rule
 */
export interface InteractionResult {
  success: boolean;
  outcome: InteractionOutcome;
  stateChanges?: {
    item?: Partial<ObjectProperties>;
    target?: Partial<ObjectProperties>;
  };
  narrative: Record<Language, string>;
  unlocks?: string[];  // New objects/areas that become available
}

/**
 * Types of interaction outcomes
 */
export type InteractionOutcome =
  | 'UNLOCK'       // Key unlocks door
  | 'CUT'          // Sharp object cuts rope
  | 'LIGHT'        // Fire lights candle
  | 'EXTINGUISH'   // Water extinguishes fire
  | 'BREAK'        // Heavy object breaks fragile object
  | 'REPAIR'       // Tool repairs broken object
  | 'COMBINE'      // Two objects merge into new object
  | 'ATTACH'       // Objects connect (rope to tree)
  | 'FEED'         // Food given to creature
  | 'NO_EFFECT'    // Nothing happens (safe failure)
  | 'IMPOSSIBLE';  // Logically impossible (helpful error)

/**
 * Rule condition checker
 */
interface RuleCondition {
  itemMustHave?: Partial<ObjectProperties>;     // Item must have these properties
  targetMustHave?: Partial<ObjectProperties>;   // Target must have these properties
  itemTraits?: string[];                        // Item must have these traits
  targetTraits?: string[];                      // Target must have these traits
  itemId?: string;                              // Specific item ID (for unique items)
  targetId?: string;                            // Specific target ID (for unique targets)
}

/**
 * Interaction rule definition
 */
interface InteractionRule {
  id: string;
  condition: RuleCondition;
  outcome: InteractionOutcome;
  applyStateChanges: (item: GameObject, target: GameObject) => {
    item?: Partial<ObjectProperties>;
    target?: Partial<ObjectProperties>;
  };
  generateNarrative: (item: GameObject, target: GameObject, language: Language) => string;
  unlocks?: string[];  // Optional: what becomes available after this interaction
}

/**
 * InteractionRules engine
 */
export class InteractionRules {
  private rules: InteractionRule[] = [];

  constructor() {
    this.registerDefaultRules();
  }

  /**
   * Register the default interaction rules
   * These work for ANY objects with the matching properties
   */
  private registerDefaultRules(): void {
    // RULE: Sharp object cuts ropelike object
    this.rules.push({
      id: 'sharp_cuts_rope',
      condition: {
        itemMustHave: { is_sharp: true },
        targetTraits: ['ropelike', 'fabric', 'cuttable']
      },
      outcome: 'CUT',
      applyStateChanges: (item, target) => ({
        target: { is_broken: true }
      }),
      generateNarrative: (item, target, language) => {
        const itemName = item.name[language] || item.id;
        const targetName = target.name[language] || target.id;
        const templates: Record<Language, string> = {
          [Language.ENGLISH]: `You cut the ${targetName} with the ${itemName}. It falls apart.`,
          [Language.SPANISH]: `Cortas la ${targetName} con el ${itemName}. Se cae en pedazos.`,
          [Language.FRENCH]: `Vous coupez la ${targetName} avec le ${itemName}. Elle se désagrège.`,
          [Language.GERMAN]: `Du schneidest das ${targetName} mit dem ${itemName}. Es fällt auseinander.`,
          [Language.ITALIAN]: `Tagli la ${targetName} con il ${itemName}. Si sgretola.`,
          [Language.JAPANESE]: `${itemName}で${targetName}を切る。ばらばらになった。`,
          [Language.MANDARIN]: `你用${itemName}切断了${targetName}。它散开了。`,
          [Language.RUSSIAN]: `Вы разрезаете ${targetName} с помощью ${itemName}. Он разваливается.`,
          [Language.PORTUGUESE]: `Você corta a ${targetName} com o ${itemName}. Ela se desfaz.`,
          [Language.UKRAINIAN]: `Ви розрізаєте ${targetName} за допомогою ${itemName}. Воно розпадається.`,
          [Language.POLISH]: `Tniesz ${targetName} za pomocą ${itemName}. Rozpada się.`,
          [Language.CZECH]: `Přeřízneš ${targetName} pomocí ${itemName}. Rozpadá se.`
        };
        return templates[language] || templates[Language.ENGLISH];
      }
    });

    // RULE: Key unlocks lock
    this.rules.push({
      id: 'key_unlocks_lock',
      condition: {
        targetMustHave: { is_locked: true, can_be_locked: true }
      },
      outcome: 'UNLOCK',
      applyStateChanges: (item, target) => {
        // Check if this is the correct key
        if (target.properties.required_item === item.id) {
          return {
            target: { is_locked: false, is_open: true }
          };
        }
        return {};
      },
      generateNarrative: (item, target, language) => {
        const itemName = item.name[language] || item.id;
        const targetName = target.name[language] || target.id;

        // Check if correct key
        if (target.properties.required_item === item.id) {
          const templates: Record<Language, string> = {
            [Language.ENGLISH]: `You use the ${itemName} to unlock the ${targetName}. It swings open.`,
            [Language.SPANISH]: `Usas el ${itemName} para abrir el ${targetName}. Se abre.`,
            [Language.FRENCH]: `Vous utilisez le ${itemName} pour déverrouiller le ${targetName}. Il s'ouvre.`,
            [Language.GERMAN]: `Du benutzt den ${itemName}, um das ${targetName} aufzuschließen. Es öffnet sich.`,
            [Language.ITALIAN]: `Usi la ${itemName} per sbloccare la ${targetName}. Si apre.`,
            [Language.JAPANESE]: `${itemName}で${targetName}の鍵を開ける。開いた。`,
            [Language.MANDARIN]: `你用${itemName}打开了${targetName}。它打开了。`,
            [Language.RUSSIAN]: `Вы используете ${itemName}, чтобы открыть ${targetName}. Он открывается.`,
            [Language.PORTUGUESE]: `Você usa a ${itemName} para destrancar a ${targetName}. Ela se abre.`,
            [Language.UKRAINIAN]: `Ви використовуєте ${itemName}, щоб відімкнути ${targetName}. Воно відчиняється.`,
            [Language.POLISH]: `Używasz ${itemName} do otwarcia ${targetName}. Otwiera się.`,
            [Language.CZECH]: `Použiješ ${itemName} k odemknutí ${targetName}. Otevře se.`
          };
          return templates[language] || templates[Language.ENGLISH];
        } else {
          const templates: Record<Language, string> = {
            [Language.ENGLISH]: `The ${itemName} doesn't fit in the ${targetName}.`,
            [Language.SPANISH]: `El ${itemName} no encaja en el ${targetName}.`,
            [Language.FRENCH]: `Le ${itemName} ne rentre pas dans le ${targetName}.`,
            [Language.GERMAN]: `Der ${itemName} passt nicht in das ${targetName}.`,
            [Language.ITALIAN]: `La ${itemName} non entra nella ${targetName}.`,
            [Language.JAPANESE]: `${itemName}は${targetName}に合わない。`,
            [Language.MANDARIN]: `${itemName}不适合${targetName}。`,
            [Language.RUSSIAN]: `${itemName} не подходит к ${targetName}.`,
            [Language.PORTUGUESE]: `A ${itemName} não se encaixa na ${targetName}.`,
            [Language.UKRAINIAN]: `${itemName} не підходить до ${targetName}.`,
            [Language.POLISH]: `${itemName} nie pasuje do ${targetName}.`,
            [Language.CZECH]: `${itemName} nesedí do ${targetName}.`
          };
          return templates[language] || templates[Language.ENGLISH];
        }
      }
    });

    // RULE: Fire lights flammable object
    this.rules.push({
      id: 'fire_lights_flammable',
      condition: {
        itemMustHave: { is_hot: true },
        targetMustHave: { is_flammable: true }
      },
      outcome: 'LIGHT',
      applyStateChanges: (item, target) => ({
        target: { is_lit: true }
      }),
      generateNarrative: (item, target, language) => {
        const itemName = item.name[language] || item.id;
        const targetName = target.name[language] || target.id;
        const templates: Record<Language, string> = {
          [Language.ENGLISH]: `You use the ${itemName} to set the ${targetName} on fire. It begins to burn.`,
          [Language.SPANISH]: `Usas el ${itemName} para prender fuego al ${targetName}. Comienza a arder.`,
          [Language.FRENCH]: `Vous utilisez le ${itemName} pour mettre le feu au ${targetName}. Il commence à brûler.`,
          [Language.GERMAN]: `Du benutzt den ${itemName}, um das ${targetName} anzuzünden. Es beginnt zu brennen.`,
          [Language.ITALIAN]: `Usi il ${itemName} per dare fuoco al ${targetName}. Inizia a bruciare.`,
          [Language.JAPANESE]: `${itemName}で${targetName}に火をつける。燃え始めた。`,
          [Language.MANDARIN]: `你用${itemName}点燃了${targetName}。它开始燃烧。`,
          [Language.RUSSIAN]: `Вы используете ${itemName}, чтобы поджечь ${targetName}. Он начинает гореть.`,
          [Language.PORTUGUESE]: `Você usa o ${itemName} para acender o ${targetName}. Começa a queimar.`,
          [Language.UKRAINIAN]: `Ви використовуєте ${itemName}, щоб підпалити ${targetName}. Воно починає горіти.`,
          [Language.POLISH]: `Używasz ${itemName} do podpalenia ${targetName}. Zaczyna się palić.`,
          [Language.CZECH]: `Použiješ ${itemName} k zapálení ${targetName}. Začíná hořet.`
        };
        return templates[language] || templates[Language.ENGLISH];
      }
    });

    // RULE: Heavy object breaks fragile object
    this.rules.push({
      id: 'heavy_breaks_fragile',
      condition: {
        itemMustHave: { is_heavy: true },
        targetMustHave: { is_fragile: true }
      },
      outcome: 'BREAK',
      applyStateChanges: (item, target) => ({
        target: { is_broken: true }
      }),
      generateNarrative: (item, target, language) => {
        const itemName = item.name[language] || item.id;
        const targetName = target.name[language] || target.id;
        const templates: Record<Language, string> = {
          [Language.ENGLISH]: `You smash the ${targetName} with the ${itemName}. It shatters into pieces.`,
          [Language.SPANISH]: `Rompes el ${targetName} con el ${itemName}. Se hace pedazos.`,
          [Language.FRENCH]: `Vous fracassez le ${targetName} avec le ${itemName}. Il se brise en morceaux.`,
          [Language.GERMAN]: `Du zerschmetterst das ${targetName} mit dem ${itemName}. Es zerbricht in Stücke.`,
          [Language.ITALIAN]: `Frantumi il ${targetName} con il ${itemName}. Si rompe in pezzi.`,
          [Language.JAPANESE]: `${itemName}で${targetName}を壊す。粉々になった。`,
          [Language.MANDARIN]: `你用${itemName}砸碎了${targetName}。它碎成了碎片。`,
          [Language.RUSSIAN]: `Вы разбиваете ${targetName} с помощью ${itemName}. Он разлетается на куски.`,
          [Language.PORTUGUESE]: `Você esmaga o ${targetName} com o ${itemName}. Ele se despedaça.`,
          [Language.UKRAINIAN]: `Ви розбиваєте ${targetName} за допомогою ${itemName}. Воно розлітається на шматки.`,
          [Language.POLISH]: `Rozbijasz ${targetName} za pomocą ${itemName}. Rozpada się na kawałki.`,
          [Language.CZECH]: `Rozbíjíš ${targetName} pomocí ${itemName}. Rozpadá se na kousky.`
        };
        return templates[language] || templates[Language.ENGLISH];
      }
    });

    // RULE: Rope attaches to climbable object
    this.rules.push({
      id: 'rope_attach_climbable',
      condition: {
        itemTraits: ['ropelike'],
        targetMustHave: { can_be_climbed: true }
      },
      outcome: 'ATTACH',
      applyStateChanges: (item, target) => ({}),  // Just narrative, no state change
      generateNarrative: (item, target, language) => {
        const itemName = item.name[language] || item.id;
        const targetName = target.name[language] || target.id;
        const templates: Record<Language, string> = {
          [Language.ENGLISH]: `You tie the ${itemName} securely to the ${targetName}.`,
          [Language.SPANISH]: `Atas la ${itemName} firmemente al ${targetName}.`,
          [Language.FRENCH]: `Vous attachez solidement la ${itemName} au ${targetName}.`,
          [Language.GERMAN]: `Du bindest das ${itemName} fest an das ${targetName}.`,
          [Language.ITALIAN]: `Leghi la ${itemName} saldamente al ${targetName}.`,
          [Language.JAPANESE]: `${itemName}を${targetName}にしっかりと結ぶ。`,
          [Language.MANDARIN]: `你把${itemName}牢牢地绑在${targetName}上。`,
          [Language.RUSSIAN]: `Вы крепко привязываете ${itemName} к ${targetName}.`,
          [Language.PORTUGUESE]: `Você amarra a ${itemName} firmemente ao ${targetName}.`,
          [Language.UKRAINIAN]: `Ви міцно прив'язуєте ${itemName} до ${targetName}.`,
          [Language.POLISH]: `Mocno przywiązujesz ${itemName} do ${targetName}.`,
          [Language.CZECH]: `Pevně přivážeš ${itemName} k ${targetName}.`
        };
        return templates[language] || templates[Language.ENGLISH];
      }
    });
  }

  /**
   * Evaluate an interaction between two objects
   */
  evaluateInteraction(
    item: GameObject,
    target: GameObject,
    language: Language
  ): InteractionResult {
    // Find matching rule
    for (const rule of this.rules) {
      if (this.matchesCondition(item, target, rule.condition)) {
        const stateChanges = rule.applyStateChanges(item, target);
        const narrative = rule.generateNarrative(item, target, language);

        return {
          success: true,
          outcome: rule.outcome,
          stateChanges,
          narrative: this.wrapNarrative(narrative, language),
          unlocks: rule.unlocks
        };
      }
    }

    // No matching rule - return "no effect" result
    return this.generateNoEffectResult(item, target, language);
  }

  /**
   * Check if item and target match a rule condition
   */
  private matchesCondition(
    item: GameObject,
    target: GameObject,
    condition: RuleCondition
  ): boolean {
    // Check specific IDs (if specified)
    if (condition.itemId && item.id !== condition.itemId) return false;
    if (condition.targetId && target.id !== condition.targetId) return false;

    // Check item properties
    if (condition.itemMustHave) {
      for (const [prop, value] of Object.entries(condition.itemMustHave)) {
        if ((item.properties as any)[prop] !== value) return false;
      }
    }

    // Check target properties
    if (condition.targetMustHave) {
      for (const [prop, value] of Object.entries(condition.targetMustHave)) {
        if ((target.properties as any)[prop] !== value) return false;
      }
    }

    // Check item traits
    if (condition.itemTraits) {
      const itemTraits = item.properties.traits || [];
      if (!condition.itemTraits.some(trait => itemTraits.includes(trait))) {
        return false;
      }
    }

    // Check target traits
    if (condition.targetTraits) {
      const targetTraits = target.properties.traits || [];
      if (!condition.targetTraits.some(trait => targetTraits.includes(trait))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate a "no effect" result when no rule matches
   */
  private generateNoEffectResult(
    item: GameObject,
    target: GameObject,
    language: Language
  ): InteractionResult {
    const itemName = item.name[language] || item.id;
    const targetName = target.name[language] || target.id;

    const narrativeText: Record<Language, string> = {
      [Language.ENGLISH]: `Using the ${itemName} on the ${targetName} has no effect.`,
      [Language.SPANISH]: `Usar el ${itemName} en el ${targetName} no tiene efecto.`,
      [Language.FRENCH]: `Utiliser le ${itemName} sur le ${targetName} n'a aucun effet.`,
      [Language.GERMAN]: `Das Verwenden von ${itemName} auf ${targetName} hat keine Wirkung.`,
      [Language.ITALIAN]: `Usare il ${itemName} sul ${targetName} non ha effetto.`,
      [Language.JAPANESE]: `${itemName}を${targetName}に使っても何も起こらない。`,
      [Language.MANDARIN]: `在${targetName}上使用${itemName}没有效果。`,
      [Language.RUSSIAN]: `Использование ${itemName} на ${targetName} не имеет эффекта.`,
      [Language.PORTUGUESE]: `Usar o ${itemName} no ${targetName} não tem efeito.`,
      [Language.UKRAINIAN]: `Використання ${itemName} на ${targetName} не має ефекту.`,
      [Language.POLISH]: `Użycie ${itemName} na ${targetName} nie ma efektu.`,
      [Language.CZECH]: `Použití ${itemName} na ${targetName} nemá žádný účinek.`
    };

    return {
      success: false,
      outcome: 'NO_EFFECT',
      narrative: this.wrapNarrative(narrativeText[language] || narrativeText[Language.ENGLISH], language)
    };
  }

  /**
   * Wrap a single narrative string into all language keys
   */
  private wrapNarrative(text: string, language: Language): Record<Language, string> {
    const result: Record<Language, string> = {} as Record<Language, string>;
    // For now, just use the same text for all languages
    // In the future, each rule can provide translations
    Object.values(Language).forEach(lang => {
      result[lang as Language] = text;
    });
    return result;
  }

  /**
   * Register a custom interaction rule
   * Allows content packs to define their own unique interactions
   */
  registerRule(rule: InteractionRule): void {
    this.rules.push(rule);
  }

  /**
   * Clear all custom rules (useful for loading new content packs)
   */
  clearCustomRules(): void {
    // Keep only default rules
    this.rules = this.rules.filter(rule =>
      rule.id.startsWith('sharp_cuts_rope') ||
      rule.id.startsWith('key_unlocks_lock') ||
      rule.id.startsWith('fire_lights_flammable') ||
      rule.id.startsWith('heavy_breaks_fragile') ||
      rule.id.startsWith('rope_attach_climbable')
    );
  }
}
