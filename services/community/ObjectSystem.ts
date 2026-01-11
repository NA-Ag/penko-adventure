/**
 * ObjectSystem - Defines object properties and behaviors for Community Mode
 *
 * Inspired by Scribblenauts: objects have properties that determine what actions
 * they support and how they interact with other objects.
 *
 * Example:
 * - "rope": { can_be_held: true, is_climbable: true, can_be_tied_to: ['tree', 'post'] }
 * - "door": { is_solid: true, blocks_movement: true, can_be_opened: true, is_locked: true }
 */

import { Language } from '../../types';
import { getMessage } from '../SystemStrings';

/**
 * Intent types that objects can respond to
 * These map to the intents from StandardModeParser
 */
export type ObjectIntent =
  | 'MOVE'         // move, go, walk - TIER 17 (doesn't operate on objects, changes location)
  | 'LOOK_AROUND'  // look around, observe surroundings, survey area
  | 'EXAMINE'      // look at, inspect, examine
  | 'TAKE'         // take, get, pick up, grab
  | 'DROP'         // drop, put down, discard
  | 'USE'          // use, activate, apply
  | 'USE_ON'       // use [item] on [target] - two-object interaction (Tier 9)
  | 'OPEN'         // open, unlock
  | 'CLOSE'        // close, shut, lock
  | 'TALK'         // talk to, speak with (for NPCs)
  | 'ATTACK'       // attack, hit, fight
  | 'EAT'          // eat, drink, consume
  | 'GIVE'         // give, offer, hand
  | 'CLIMB'        // climb, ascend
  | 'TIE'          // tie, bind, attach
  | 'BURN'         // burn, ignite, light
  | 'READ'         // read, study
  | 'WEAR'         // wear, put on, equip
  | 'THROW';       // throw, toss, hurl

/**
 * Base properties that any object can have
 */
export interface ObjectProperties {
  // Physical properties
  is_solid?: boolean;           // Blocks movement/passage
  is_liquid?: boolean;          // Can be drunk, flows
  is_heavy?: boolean;           // Cannot be picked up
  is_fragile?: boolean;         // Can break
  is_sharp?: boolean;           // Can cut things
  is_hot?: boolean;             // Can burn things
  is_cold?: boolean;            // Can freeze things
  is_flammable?: boolean;       // Can catch fire
  is_edible?: boolean;          // Can be eaten
  is_drinkable?: boolean;       // Can be drunk

  // Interactive properties
  can_be_held?: boolean;        // Can be picked up
  can_be_opened?: boolean;      // Has open/close states
  can_be_locked?: boolean;      // Can be locked
  can_be_worn?: boolean;        // Can be equipped
  can_be_read?: boolean;        // Contains text
  can_be_climbed?: boolean;     // Can climb on/up
  can_be_tied_to?: string[];    // List of object types this can be tied to
  can_contain?: string[];       // Can hold other objects

  // NPC properties
  is_alive?: boolean;           // Is a living entity
  is_friendly?: boolean;        // Won't attack player
  can_talk?: boolean;           // Can have conversations
  disposition?: number;         // -100 to 100, affects dialogue

  // State properties
  is_locked?: boolean;          // Current lock state
  is_open?: boolean;            // Current open state
  is_broken?: boolean;          // Current broken state
  is_lit?: boolean;             // Current light state

  // Metadata
  required_item?: string;       // Item needed to interact (e.g., key for door)
  damage?: number;              // Damage dealt if weapon
  health_restore?: number;      // Health restored if consumed
  weight?: number;              // Affects carry capacity

  // TIER 9 ENHANCEMENT: Flexible trait-based properties
  // Allows content creators to define arbitrary properties for rule-based interactions
  // Examples: ["conductive", "magnetic", "waterproof", "ropelike", "wooden", "metallic"]
  traits?: string[];            // Array of custom properties for advanced interactions
}

/**
 * Complete object definition with all properties and behaviors
 */
export interface GameObject {
  id: string;                           // Unique identifier (e.g., "wooden_door", "iron_sword")
  name: Record<Language, string>;       // Localized names
  description: Record<Language, string>; // What you see when examining
  properties: ObjectProperties;
  allowedActions: ObjectIntent[];       // Actions this object responds to
  customActions?: {                     // Custom action handlers
    [key: string]: {
      requiresItem?: string;            // Item needed to perform action
      requiresState?: Partial<ObjectProperties>; // Required state
      stateChanges?: Partial<ObjectProperties>; // State changes after action
      narrative: Record<Language, string>; // Response narrative
    };
  };
}

/**
 * Action validation result
 */
export interface ActionValidation {
  valid: boolean;
  reason?: string;                      // Why action failed
  requiredItem?: string;                // Item needed
  suggestion?: string;                  // Helpful hint
}

/**
 * ObjectSystem - Manages object definitions and validates actions
 */
export class ObjectSystem {
  private objects: Map<string, GameObject> = new Map();

  /**
   * Register a game object
   */
  registerObject(object: GameObject): void {
    this.objects.set(object.id, object);
  }

  /**
   * Register multiple objects
   */
  registerObjects(objects: GameObject[]): void {
    objects.forEach(obj => this.registerObject(obj));
  }

  /**
   * Get object by ID
   */
  getObject(id: string): GameObject | null {
    return this.objects.get(id) || null;
  }

  /**
   * Get all registered objects
   */
  getAllObjects(): GameObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * TIER 1.2: Infer if an intent is possible based on object properties (Scribblenauts approach)
   *
   * Instead of requiring explicit allowedActions, check if properties support the intent.
   * This enables emergent gameplay - if an object has the right properties, the action works.
   */
  private canIntentBeInferredFromProperties(object: GameObject, intent: ObjectIntent): boolean {
    const props = object.properties;

    switch (intent) {
      case 'TAKE':
        return props.can_be_held === true && !props.is_heavy;

      case 'OPEN':
      case 'CLOSE':
        return props.can_be_opened === true;

      case 'EAT':
        return props.is_edible === true;

      case 'TALK':
        return props.can_talk === true || (props.is_alive === true && props.can_talk !== false);

      case 'CLIMB':
        return props.can_be_climbed === true;

      case 'WEAR':
        return props.can_be_worn === true;

      case 'READ':
        return props.can_be_read === true;

      case 'EXAMINE':
        // EVERYTHING can be examined (Scribblenauts rule)
        return true;

      case 'USE':
        // Most objects can be "used" in some generic way
        return true;

      case 'DROP':
        // If you can hold it, you can drop it
        return props.can_be_held === true;

      case 'ATTACK':
        // Can attack living things or breakable things
        return props.is_alive === true || props.is_fragile === true;

      case 'BURN':
        return props.is_flammable === true;

      case 'THROW':
        // Can throw anything you can hold that's not too heavy
        return props.can_be_held === true && !props.is_heavy;

      default:
        return false;
    }
  }

  /**
   * Validate if an action can be performed on an object
   */
  validateAction(
    objectId: string,
    intent: ObjectIntent,
    playerInventory: string[] = [],
    language: Language = Language.ENGLISH
  ): ActionValidation {
    const object = this.getObject(objectId);

    if (!object) {
      return {
        valid: false,
        reason: `Object "${objectId}" not found`
      };
    }

    // TIER 1.2: Check if object supports this action
    // First check explicit allowedActions, then fall back to property-based inference (Scribblenauts)
    const explicitlyAllowed = object.allowedActions.includes(intent);
    const inferredFromProperties = this.canIntentBeInferredFromProperties(object, intent);

    if (!explicitlyAllowed && !inferredFromProperties) {
      return {
        valid: false,
        reason: `You can't ${intent.toLowerCase()} the ${objectId}`,
        suggestion: this.getSuggestion(object)
      };
    }

    // TIER 1.2: Log when using property-based inference (helps debug)
    if (!explicitlyAllowed && inferredFromProperties) {
      console.log(`[ObjectSystem] TIER 1.2: Intent ${intent} inferred from properties for ${objectId}`);
    }

    // Check specific intent requirements
    switch (intent) {
      case 'TAKE':
        if (object.properties.is_heavy) {
          return { valid: false, reason: "It's too heavy to carry" };
        }
        if (!object.properties.can_be_held) {
          return { valid: false, reason: "You can't pick that up" };
        }
        break;

      case 'OPEN':
        if (!object.properties.can_be_opened) {
          return { valid: false, reason: getMessage('cant_be_opened', language) };
        }
        if (object.properties.is_locked && object.properties.required_item) {
          if (!playerInventory.includes(object.properties.required_item)) {
            return {
              valid: false,
              reason: getMessage('its_locked', language),
              requiredItem: object.properties.required_item,
              suggestion: getMessage('you_need_item_to_open', language, { item: object.properties.required_item })
            };
          }
        }
        if (object.properties.is_open) {
          return { valid: false, reason: getMessage('already_open', language) };
        }
        break;

      case 'CLOSE':
        if (!object.properties.can_be_opened) {
          return { valid: false, reason: getMessage('cant_be_closed', language) };
        }
        if (!object.properties.is_open) {
          return { valid: false, reason: getMessage('already_closed', language) };
        }
        break;

      case 'EAT':
        if (!object.properties.is_edible) {
          return { valid: false, reason: "You can't eat that!" };
        }
        break;

      case 'TALK':
        if (!object.properties.can_talk) {
          return { valid: false, reason: "It doesn't respond" };
        }
        break;

      case 'CLIMB':
        if (!object.properties.can_be_climbed) {
          return { valid: false, reason: "You can't climb that" };
        }
        break;

      case 'WEAR':
        if (!object.properties.can_be_worn) {
          return { valid: false, reason: "You can't wear that" };
        }
        break;

      case 'READ':
        if (!object.properties.can_be_read) {
          return { valid: false, reason: "There's nothing to read" };
        }
        break;
    }

    // Action is valid!
    return { valid: true };
  }

  /**
   * Get helpful suggestion for what player can do with object
   */
  private getSuggestion(object: GameObject): string {
    const actions = object.allowedActions.slice(0, 3);
    if (actions.length === 0) return '';

    const verbs = actions.map(a => a.toLowerCase()).join(', ');
    return `Try: ${verbs}`;
  }

  /**
   * Apply state changes after successful action
   */
  applyStateChange(
    objectId: string,
    intent: ObjectIntent
  ): Partial<ObjectProperties> | null {
    const object = this.getObject(objectId);
    if (!object) return null;

    const changes: Partial<ObjectProperties> = {};

    switch (intent) {
      case 'OPEN':
        changes.is_open = true;
        changes.is_locked = false;
        break;

      case 'CLOSE':
        changes.is_open = false;
        break;

      case 'TAKE':
        // Object is now in inventory, remove from world
        break;

      case 'DROP':
        // Object is now in world, remove from inventory
        break;

      case 'BURN':
        if (object.properties.is_flammable) {
          changes.is_lit = true;
        }
        break;
    }

    // Apply changes to object
    if (Object.keys(changes).length > 0) {
      object.properties = { ...object.properties, ...changes };
      return changes;
    }

    return null;
  }

  /**
   * Get narrative response for successful action
   */
  getNarrative(
    objectId: string,
    intent: ObjectIntent,
    language: Language,
    stateChanges?: Partial<ObjectProperties>
  ): string {
    const object = this.getObject(objectId);
    if (!object) return '';

    // Check for custom action narrative
    if (object.customActions?.[intent]) {
      return object.customActions[intent].narrative[language] || '';
    }

    // Generate default narrative based on intent
    const name = object.name[language] || objectId;
    return this.generateDefaultNarrative(intent, name, language, stateChanges);
  }

  /**
   * Generate default narrative for common actions
   */
  private generateDefaultNarrative(
    intent: ObjectIntent,
    objectName: string,
    language: Language,
    stateChanges?: Partial<ObjectProperties>
  ): string {
    // Simple templates for now - can be expanded with proper localization
    const templates: Record<ObjectIntent, string> = {
      MOVE: `You move toward the ${objectName}.`,
      LOOK_AROUND: `You look around.`,
      EXAMINE: `You examine the ${objectName}.`,
      TAKE: `You take the ${objectName}.`,
      DROP: `You drop the ${objectName}.`,
      USE: `You use the ${objectName}.`,
      USE_ON: `You use the ${objectName}.`,
      OPEN: `You open the ${objectName}.`,
      CLOSE: `You close the ${objectName}.`,
      TALK: `You talk to the ${objectName}.`,
      ATTACK: `You attack the ${objectName}!`,
      EAT: `You eat the ${objectName}.`,
      GIVE: `You give the ${objectName}.`,
      CLIMB: `You climb the ${objectName}.`,
      TIE: `You tie the ${objectName}.`,
      BURN: `You burn the ${objectName}.`,
      READ: `You read the ${objectName}.`,
      WEAR: `You wear the ${objectName}.`,
      THROW: `You throw the ${objectName}.`
    };

    return templates[intent] || `You interact with the ${objectName}.`;
  }

  /**
   * Check if two objects can interact
   */
  canObjectsInteract(
    objectId1: string,
    objectId2: string,
    interactionType: string
  ): boolean {
    const obj1 = this.getObject(objectId1);
    const obj2 = this.getObject(objectId2);

    if (!obj1 || !obj2) return false;

    // Example: can rope be tied to tree?
    if (interactionType === 'tie') {
      return obj1.properties.can_be_tied_to?.includes(objectId2) || false;
    }

    return false;
  }

  /**
   * Clear all registered objects
   */
  clear(): void {
    this.objects.clear();
  }
}

/**
 * Create demo objects for testing
 */
export function createDemoObjects(): GameObject[] {
  return [
    // Wooden Door
    {
      id: 'wooden_door',
      name: {
        [Language.ENGLISH]: 'wooden door',
        [Language.SPANISH]: 'puerta de madera',
        [Language.FRENCH]: 'porte en bois',
        [Language.GERMAN]: 'Holztür',
        [Language.ITALIAN]: 'porta di legno',
        [Language.JAPANESE]: '木のドア',
        [Language.MANDARIN]: '木门',
        [Language.RUSSIAN]: 'деревянная дверь',
        [Language.PORTUGUESE]: 'porta de madeira',
        [Language.UKRAINIAN]: "дерев'яні двері",
        [Language.POLISH]: 'drewniane drzwi',
        [Language.CZECH]: 'dřevěné dveře'
      },
      description: {
        [Language.ENGLISH]: 'A sturdy wooden door. It appears to be locked.',
        [Language.SPANISH]: 'Una puerta de madera robusta. Parece estar cerrada.',
        [Language.FRENCH]: 'Une porte en bois solide. Elle semble verrouillée.',
        [Language.GERMAN]: 'Eine robuste Holztür. Sie scheint verschlossen zu sein.',
        [Language.ITALIAN]: 'Una robusta porta di legno. Sembra chiusa a chiave.',
        [Language.JAPANESE]: '頑丈な木のドア。鍵がかかっているようだ。',
        [Language.MANDARIN]: '一扇坚固的木门。看起来被锁住了。',
        [Language.RUSSIAN]: 'Прочная деревянная дверь. Похоже, она заперта.',
        [Language.PORTUGUESE]: 'Uma porta de madeira robusta. Parece estar trancada.',
        [Language.UKRAINIAN]: "Міцні дерев'яні двері. Схоже, вони замкнені.",
        [Language.POLISH]: 'Solidne drewniane drzwi. Wydają się być zamknięte.',
        [Language.CZECH]: 'Pevné dřevěné dveře. Zdá se, že jsou zamčené.'
      },
      properties: {
        is_solid: true,
        can_be_opened: true,
        can_be_locked: true,
        is_locked: true,
        is_open: false,
        required_item: 'iron_key',
        traits: ['wooden', 'lockable']  // Tier 9: Added traits for interaction rules
      },
      allowedActions: ['EXAMINE', 'OPEN', 'CLOSE', 'ATTACK']
    },

    // Iron Key
    {
      id: 'iron_key',
      name: {
        [Language.ENGLISH]: 'iron key',
        [Language.SPANISH]: 'llave de hierro',
        [Language.FRENCH]: 'clé en fer',
        [Language.GERMAN]: 'Eisenschlüssel',
        [Language.ITALIAN]: 'chiave di ferro',
        [Language.JAPANESE]: '鉄の鍵',
        [Language.MANDARIN]: '铁钥匙',
        [Language.RUSSIAN]: 'железный ключ',
        [Language.PORTUGUESE]: 'chave de ferro',
        [Language.UKRAINIAN]: 'залізний ключ',
        [Language.POLISH]: 'żelazny klucz',
        [Language.CZECH]: 'železný klíč'
      },
      description: {
        [Language.ENGLISH]: 'An old iron key. It looks like it might open something.',
        [Language.SPANISH]: 'Una vieja llave de hierro. Parece que podría abrir algo.',
        [Language.FRENCH]: "Une vieille clé en fer. On dirait qu'elle pourrait ouvrir quelque chose.",
        [Language.GERMAN]: 'Ein alter Eisenschlüssel. Er sieht aus, als könnte er etwas öffnen.',
        [Language.ITALIAN]: 'Una vecchia chiave di ferro. Sembra che possa aprire qualcosa.',
        [Language.JAPANESE]: '古い鉄の鍵。何かを開けられそうだ。',
        [Language.MANDARIN]: '一把旧铁钥匙。看起来可能能打开什么。',
        [Language.RUSSIAN]: 'Старый железный ключ. Похоже, он может что-то открыть.',
        [Language.PORTUGUESE]: 'Uma velha chave de ferro. Parece que pode abrir algo.',
        [Language.UKRAINIAN]: 'Старий залізний ключ. Схоже, він може щось відкрити.',
        [Language.POLISH]: 'Stary żelazny klucz. Wygląda, jakby mógł coś otworzyć.',
        [Language.CZECH]: 'Starý železný klíč. Vypadá, že by mohl něco otevřít.'
      },
      properties: {
        can_be_held: true,
        is_solid: true,
        weight: 1,
        traits: ['metallic', 'key_for_wooden_door']  // Tier 9: Added traits
      },
      allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE']
    },

    // Rope
    {
      id: 'rope',
      name: {
        [Language.ENGLISH]: 'rope',
        [Language.SPANISH]: 'cuerda',
        [Language.FRENCH]: 'corde',
        [Language.GERMAN]: 'Seil',
        [Language.ITALIAN]: 'corda',
        [Language.JAPANESE]: 'ロープ',
        [Language.MANDARIN]: '绳子',
        [Language.RUSSIAN]: 'верёвка',
        [Language.PORTUGUESE]: 'corda',
        [Language.UKRAINIAN]: 'мотузка',
        [Language.POLISH]: 'lina',
        [Language.CZECH]: 'lano'
      },
      description: {
        [Language.ENGLISH]: 'A sturdy rope. Useful for climbing or tying things.',
        [Language.SPANISH]: 'Una cuerda resistente. Útil para escalar o atar cosas.',
        [Language.FRENCH]: 'Une corde solide. Utile pour grimper ou attacher des choses.',
        [Language.GERMAN]: 'Ein robustes Seil. Nützlich zum Klettern oder Festbinden.',
        [Language.ITALIAN]: 'Una corda robusta. Utile per arrampicarsi o legare cose.',
        [Language.JAPANESE]: '丈夫なロープ。登ったり物を縛ったりするのに便利だ。',
        [Language.MANDARIN]: '一根结实的绳子。可以用来攀爬或绑东西。',
        [Language.RUSSIAN]: 'Прочная верёвка. Полезна для лазания или связывания вещей.',
        [Language.PORTUGUESE]: 'Uma corda resistente. Útil para escalar ou amarrar coisas.',
        [Language.UKRAINIAN]: 'Міцна мотузка. Корисна для лазіння або зв\'язування речей.',
        [Language.POLISH]: 'Solidna lina. Przydatna do wspinania się lub wiązania rzeczy.',
        [Language.CZECH]: 'Pevné lano. Užitečné pro lezení nebo vázání věcí.'
      },
      properties: {
        can_be_held: true,
        can_be_climbed: true,
        can_be_tied_to: ['tree', 'post', 'rock'],
        is_flammable: true,
        weight: 2,
        traits: ['ropelike', 'cuttable', 'flexible']  // Tier 9: Added traits for cutting interactions
      },
      allowedActions: ['EXAMINE', 'TAKE', 'DROP', 'USE', 'TIE', 'CLIMB']
    }
  ];
}
