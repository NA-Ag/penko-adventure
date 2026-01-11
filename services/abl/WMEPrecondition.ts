/**
 * WMEPrecondition - FACADE 5.2
 *
 * WME-based preconditions for ABL behaviors.
 * Extends the precondition system to check Working Memory Elements.
 *
 * This enables behaviors to have preconditions like:
 * - "player is in plaza" (LocationWME check)
 * - "player has gold" (InventoryWME check)
 * - "NPC mood is happy" (StateWME check)
 * - "player friendsWith merchant >= 50" (RelationWME check)
 *
 * WME preconditions are more structured than WorldState checks:
 * - Type-safe queries
 * - Pattern matching
 * - Support for complex WME structures
 * - Better separation of concerns
 */

import { IPrecondition, PreconditionBuilder } from './Precondition';
import { WorldState } from './WorldState';
import { WorkingMemory, WMEQuery } from '../wm/WorkingMemory';
import { IWME } from '../wm/WME';

/**
 * WME-based precondition
 */
export class WMEPrecondition implements IPrecondition {
  readonly description: string;
  private wm: WorkingMemory;
  private query: WMEQuery;
  private validator?: (wme: IWME) => boolean;

  constructor(
    wm: WorkingMemory,
    description: string,
    query: WMEQuery,
    validator?: (wme: IWME) => boolean
  ) {
    this.wm = wm;
    this.description = description;
    this.query = query;
    this.validator = validator;
  }

  /**
   * Check if WME exists matching the query
   */
  check(worldState: WorldState): boolean {
    const wmes = this.wm.query(this.query);

    if (wmes.length === 0) {
      return false;
    }

    // If validator provided, at least one WME must pass validation
    if (this.validator) {
      return wmes.some(this.validator);
    }

    return true;
  }
}

/**
 * WME Precondition Builder - fluent API for creating WME-based preconditions
 */
export class WMEPreconditionBuilder {
  private wm: WorkingMemory;

  constructor(wm: WorkingMemory) {
    this.wm = wm;
  }

  /**
   * Check if WME of type exists
   */
  exists(type: string, description?: string): PreconditionBuilder {
    const desc = description || `WME type "${type}" exists`;
    return new PreconditionBuilder(desc, () => this.wm.exists({ type }));
  }

  /**
   * Check if WME matching pattern exists
   */
  hasWME(type: string, attributes: Record<string, any>, description?: string): PreconditionBuilder {
    const desc = description || `WME[${type}] with ${JSON.stringify(attributes)} exists`;
    return new PreconditionBuilder(desc, () =>
      this.wm.exists({ type, attributes })
    );
  }

  /**
   * Check if WME matching custom filter exists
   */
  hasWMEMatching(
    type: string,
    filter: (wme: IWME) => boolean,
    description: string
  ): PreconditionBuilder {
    return new PreconditionBuilder(description, () =>
      this.wm.exists({ type, filter })
    );
  }

  /**
   * Check count of WMEs matching query
   */
  count(
    type: string,
    operator: '==' | '>' | '<' | '>=' | '<=',
    value: number,
    attributes?: Record<string, any>,
    description?: string
  ): PreconditionBuilder {
    const desc =
      description ||
      `Count of WME[${type}] ${operator} ${value}`;

    return new PreconditionBuilder(desc, () => {
      const count = this.wm.count({ type, attributes });

      switch (operator) {
        case '==':
          return count === value;
        case '>':
          return count > value;
        case '<':
          return count < value;
        case '>=':
          return count >= value;
        case '<=':
          return count <= value;
        default:
          return false;
      }
    });
  }

  /**
   * Check if entity is at location (LocationWME)
   */
  entityAtLocation(entity: string, location: string): PreconditionBuilder {
    return this.hasWME('Location', { entity, location }, `${entity} is at ${location}`);
  }

  /**
   * Check if entity has state with value (StateWME)
   */
  entityHasState(entity: string, state: string, value: any): PreconditionBuilder {
    return this.hasWME('State', { entity, state, value }, `${entity} ${state} is ${value}`);
  }

  /**
   * Check if entity has state meeting condition (StateWME with filter)
   */
  entityStateMatches(
    entity: string,
    state: string,
    filter: (value: any) => boolean,
    description: string
  ): PreconditionBuilder {
    return this.hasWMEMatching(
      'State',
      wme =>
        wme.getAttribute('entity') === entity &&
        wme.getAttribute('state') === state &&
        filter(wme.getAttribute('value')),
      description
    );
  }

  /**
   * Check if relation exists between entities (RelationWME)
   */
  hasRelation(
    subject: string,
    relation: string,
    object: string
  ): PreconditionBuilder {
    return this.hasWME(
      'Relation',
      { subject, relation, object },
      `${subject} ${relation} ${object}`
    );
  }

  /**
   * Check if relation value meets condition (RelationWME with filter)
   */
  relationValueMatches(
    subject: string,
    relation: string,
    object: string,
    operator: '==' | '>' | '<' | '>=' | '<=' | '!=',
    value: number
  ): PreconditionBuilder {
    const description = `${subject} ${relation} ${object} ${operator} ${value}`;

    return this.hasWMEMatching(
      'Relation',
      wme => {
        if (
          wme.getAttribute('subject') !== subject ||
          wme.getAttribute('relation') !== relation ||
          wme.getAttribute('object') !== object
        ) {
          return false;
        }

        const relValue = wme.getAttribute('value');
        if (typeof relValue !== 'number') return false;

        switch (operator) {
          case '==':
            return relValue === value;
          case '>':
            return relValue > value;
          case '<':
            return relValue < value;
          case '>=':
            return relValue >= value;
          case '<=':
            return relValue <= value;
          case '!=':
            return relValue !== value;
          default:
            return false;
        }
      },
      description
    );
  }

  /**
   * Check if entity has item in inventory (InventoryWME)
   */
  hasItem(entity: string, item: string, minQuantity: number = 1): PreconditionBuilder {
    return this.hasWMEMatching(
      'Inventory',
      wme =>
        wme.getAttribute('entity') === entity &&
        wme.getAttribute('item') === item &&
        wme.getAttribute('quantity') >= minQuantity,
      `${entity} has ${minQuantity}+ ${item}`
    );
  }

  /**
   * Check if entity has active goal (GoalWME)
   */
  hasGoal(entity: string, goal: string): PreconditionBuilder {
    return this.hasWME('Goal', { entity, goal }, `${entity} has goal "${goal}"`);
  }

  /**
   * Check if entity has active goal with specific status (GoalWME)
   */
  hasGoalWithStatus(
    entity: string,
    goal: string,
    status: 'pending' | 'active' | 'completed' | 'failed'
  ): PreconditionBuilder {
    return this.hasWME(
      'Goal',
      { entity, goal, status },
      `${entity} goal "${goal}" is ${status}`
    );
  }

  /**
   * Check if entity has belief (BeliefWME)
   */
  hasBelief(entity: string, belief: string, minConfidence: number = 0.5): PreconditionBuilder {
    return this.hasWMEMatching(
      'Belief',
      wme =>
        wme.getAttribute('entity') === entity &&
        wme.getAttribute('belief') === belief &&
        wme.getAttribute('confidence') >= minConfidence,
      `${entity} believes "${belief}" (confidence >= ${minConfidence})`
    );
  }

  /**
   * Check if quest is in specific status (QuestWME)
   */
  questStatus(
    questId: string,
    status: 'available' | 'active' | 'completed' | 'failed'
  ): PreconditionBuilder {
    return this.hasWME('Quest', { questId, status }, `Quest "${questId}" is ${status}`);
  }

  /**
   * Check if recent event occurred (EventWME within time window)
   */
  recentEvent(event: string, withinMs: number): PreconditionBuilder {
    const description = `Event "${event}" occurred within ${withinMs}ms`;

    return new PreconditionBuilder(description, () => {
      const events = this.wm.query({ type: 'Event', attributes: { event } });

      if (events.length === 0) return false;

      const now = Date.now();
      return events.some(wme => now - wme.createdAt <= withinMs);
    });
  }

  /**
   * Check if entities are in same location (LocationWME)
   */
  sameLocation(entity1: string, entity2: string): PreconditionBuilder {
    const description = `${entity1} and ${entity2} in same location`;

    return new PreconditionBuilder(description, () => {
      const loc1 = this.wm.findOne({ type: 'Location', attributes: { entity: entity1 } });
      const loc2 = this.wm.findOne({ type: 'Location', attributes: { entity: entity2 } });

      if (!loc1 || !loc2) return false;

      return loc1.getAttribute('location') === loc2.getAttribute('location');
    });
  }

  /**
   * Check if entity can sense stimulus (SensoryWME)
   */
  canSense(
    entity: string,
    sense: 'sight' | 'sound' | 'smell' | 'touch' | 'taste',
    stimulus: string,
    minIntensity: number = 0.5
  ): PreconditionBuilder {
    return this.hasWMEMatching(
      'Sensory',
      wme =>
        wme.getAttribute('entity') === entity &&
        wme.getAttribute('sense') === sense &&
        wme.getAttribute('stimulus') === stimulus &&
        wme.getAttribute('intensity') >= minIntensity,
      `${entity} can ${sense} "${stimulus}" (intensity >= ${minIntensity})`
    );
  }

  /**
   * Check if any WME of type exists (general)
   */
  anyExists(type: string): PreconditionBuilder {
    return this.exists(type, `Any WME of type "${type}" exists`);
  }

  /**
   * Check if no WME of type exists (negation)
   */
  noneExists(type: string, attributes?: Record<string, any>): PreconditionBuilder {
    const desc = attributes
      ? `No WME[${type}] with ${JSON.stringify(attributes)} exists`
      : `No WME of type "${type}" exists`;

    return new PreconditionBuilder(desc, () => !this.wm.exists({ type, attributes }));
  }
}

/**
 * Helper to create WME precondition builders from working memory
 */
export function createWMEPreconditions(wm: WorkingMemory): WMEPreconditionBuilder {
  return new WMEPreconditionBuilder(wm);
}

/**
 * Common precondition patterns
 */
export class CommonWMEPreconditions {
  /**
   * Player is at location
   */
  static playerAt(wm: WorkingMemory, location: string): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).entityAtLocation('player', location);
  }

  /**
   * Player has item
   */
  static playerHas(wm: WorkingMemory, item: string, minQuantity: number = 1): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).hasItem('player', item, minQuantity);
  }

  /**
   * NPC is friendly (relationship value >= threshold)
   */
  static npcIsFriendly(wm: WorkingMemory, npc: string, threshold: number = 50): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).relationValueMatches(
      'player',
      'friendsWith',
      npc,
      '>=',
      threshold
    );
  }

  /**
   * Player and NPC in same location
   */
  static playerNearNPC(wm: WorkingMemory, npc: string): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).sameLocation('player', npc);
  }

  /**
   * Player health above threshold
   */
  static playerHealthAbove(wm: WorkingMemory, threshold: number): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).entityStateMatches(
      'player',
      'health',
      (value: any) => typeof value === 'number' && value > threshold,
      `Player health > ${threshold}`
    );
  }

  /**
   * Quest is active
   */
  static questActive(wm: WorkingMemory, questId: string): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).questStatus(questId, 'active');
  }

  /**
   * Time of day check (using StateWME)
   */
  static timeOfDay(
    wm: WorkingMemory,
    time: 'morning' | 'afternoon' | 'evening' | 'night'
  ): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).entityHasState('world', 'timeOfDay', time);
  }

  /**
   * Weather condition (using StateWME)
   */
  static weather(wm: WorkingMemory, condition: string): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).entityHasState('world', 'weather', condition);
  }

  /**
   * Combat check (using StateWME)
   */
  static inCombat(wm: WorkingMemory, entity: string): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).entityHasState(entity, 'inCombat', true);
  }

  /**
   * Conversation check (using StateWME)
   */
  static inConversation(wm: WorkingMemory, entity: string): PreconditionBuilder {
    return new WMEPreconditionBuilder(wm).entityHasState(entity, 'inConversation', true);
  }
}
