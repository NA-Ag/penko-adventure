/**
 * EventSystem - Enhanced Event Management for Community Mode
 *
 * Handles complex event triggers, conditions, and actions for content packs.
 * Supports event chains, conditional sequences, and dynamic world changes.
 */

import type {
  GameEvent,
  EventTrigger,
  EventCondition,
  EventAction,
  Location,
  Entity,
  Item,
  Quest,
} from '../contentPackService';

export interface EventContext {
  currentLocationId: string;
  statistics: Record<string, number | string>;
  questStates: Map<string, string>;
  visitedLocations: Set<string>;
  inventory: Array<{ id: string }>;
  health: number;
  timeOfDay: string;
  daysPassed: number;
  turnCount: number;
}

export interface EventResult {
  triggered: boolean;
  messages: string[];
  worldChanges: WorldChange[];
  statisticChanges: Map<string, number>;
}

export interface WorldChange {
  type: 'SPAWN_ENTITY' | 'REMOVE_ENTITY' | 'UNLOCK_LOCATION' | 'CHANGE_BIOME' | 'CHANGE_TIME' | 'MODIFY_LOCATION';
  locationId?: string;
  entityId?: string;
  itemId?: string;
  newValue?: any;
}

export class EventSystem {
  private eventCooldowns: Map<string, number> = new Map();
  private eventTriggerCount: Map<string, number> = new Map();
  private eventChains: Map<string, string[]> = new Map(); // eventId -> [dependent event IDs]

  /**
   * Check and execute events based on trigger type and context
   */
  public async checkEvents(
    triggerType: string,
    events: GameEvent[],
    context: EventContext,
    targetId?: string
  ): Promise<EventResult> {
    const result: EventResult = {
      triggered: false,
      messages: [],
      worldChanges: [],
      statisticChanges: new Map(),
    };

    const now = Date.now();
    const eligibleEvents = this.getEligibleEvents(events, triggerType, now);

    for (const event of eligibleEvents) {
      const shouldTrigger = await this.evaluateTrigger(event.trigger, context, targetId);

      if (shouldTrigger) {
        // Execute event actions
        await this.executeEvent(event, context, result);

        // Record trigger
        this.recordEventTrigger(event, now);

        // Check for chained events
        await this.triggerChainedEvents(event.id, events, context, result);

        result.triggered = true;
      }
    }

    return result;
  }

  /**
   * Get events eligible for execution (not on cooldown, repeatable check)
   */
  private getEligibleEvents(events: GameEvent[], triggerType: string, now: number): GameEvent[] {
    return events
      .filter((event) => event.trigger.type === triggerType)
      .filter((event) => {
        // Check repeatability
        if (!event.repeatable) {
          const triggerCount = this.eventTriggerCount.get(event.id) || 0;
          if (triggerCount > 0) return false; // Already triggered once
        }

        // Check cooldown
        const lastTriggered = this.eventCooldowns.get(event.id);
        if (lastTriggered && now - lastTriggered < event.cooldown * 1000) {
          return false; // Still on cooldown
        }

        return true;
      })
      .sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  /**
   * Evaluate if event trigger conditions are met
   */
  private async evaluateTrigger(
    trigger: EventTrigger,
    context: EventContext,
    targetId?: string
  ): Promise<boolean> {
    // Type-specific checks
    switch (trigger.type) {
      case 'LOCATION':
        if (trigger.location && trigger.location !== context.currentLocationId) {
          return false;
        }
        break;

      case 'COMBAT':
        if (targetId === undefined) return false;
        break;

      case 'ITEM':
        if (targetId === undefined) return false;
        break;

      case 'DIALOGUE':
        if (targetId === undefined) return false;
        break;

      case 'QUEST':
        if (trigger.questId && targetId !== trigger.questId) {
          return false;
        }
        break;

      case 'STATISTIC':
        if (trigger.statistic) {
          const statValue = context.statistics[trigger.statistic];
          if (statValue === undefined) return false;

          // Check threshold
          if (trigger.threshold !== undefined) {
            if (typeof statValue === 'number' && typeof trigger.threshold === 'number') {
              if (statValue < trigger.threshold) return false;
            }
          }
        }
        break;

      case 'TIME':
        if (trigger.timeOfDay && trigger.timeOfDay !== context.timeOfDay) {
          return false;
        }
        if (trigger.daysPassed !== undefined && context.daysPassed < trigger.daysPassed) {
          return false;
        }
        break;

      case 'TURN_COUNT':
        if (trigger.turnCount !== undefined && context.turnCount < trigger.turnCount) {
          return false;
        }
        break;

      case 'HEALTH':
        if (trigger.healthThreshold !== undefined) {
          if (trigger.healthOperator === 'below' && context.health >= trigger.healthThreshold) {
            return false;
          }
          if (trigger.healthOperator === 'above' && context.health <= trigger.healthThreshold) {
            return false;
          }
        }
        break;

      case 'INVENTORY':
        if (trigger.requiredItem) {
          const hasItem = context.inventory.some((item) => item.id === trigger.requiredItem);
          if (!hasItem) return false;
        }
        if (trigger.inventoryCount !== undefined) {
          if (context.inventory.length < trigger.inventoryCount) return false;
        }
        break;
    }

    // Evaluate additional conditions
    if (trigger.conditions && trigger.conditions.length > 0) {
      return this.evaluateConditions(trigger.conditions, context);
    }

    return true;
  }

  /**
   * Evaluate all conditions (AND logic)
   */
  private evaluateConditions(conditions: EventCondition[], context: EventContext): boolean {
    return conditions.every((condition) => this.evaluateCondition(condition, context));
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: EventCondition, context: EventContext): boolean {
    const value = context.statistics[condition.stat];
    if (value === undefined) return false;

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return typeof value === 'number' && value > condition.value;
      case 'less_than':
        return typeof value === 'number' && value < condition.value;
      case 'greater_or_equal':
        return typeof value === 'number' && value >= condition.value;
      case 'less_or_equal':
        return typeof value === 'number' && value <= condition.value;
      case 'contains':
        if (typeof value === 'string') {
          return value.includes(condition.value);
        }
        return false;
      case 'not_contains':
        if (typeof value === 'string') {
          return !value.includes(condition.value);
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Execute event actions
   */
  private async executeEvent(
    event: GameEvent,
    context: EventContext,
    result: EventResult
  ): Promise<void> {
    for (const action of event.actions) {
      await this.executeAction(action, context, result);
    }
  }

  /**
   * Execute single action
   */
  private async executeAction(
    action: EventAction,
    context: EventContext,
    result: EventResult
  ): Promise<void> {
    switch (action.type) {
      case 'SHOW_MESSAGE':
        if (action.text) {
          result.messages.push(action.text);
        }
        break;

      case 'MODIFY_STAT':
        if (action.stat && action.value !== undefined) {
          const currentValue = context.statistics[action.stat] as number;
          const newValue = currentValue + action.value;
          context.statistics[action.stat] = newValue;
          result.statisticChanges.set(action.stat, action.value);
        }
        break;

      case 'SET_STAT':
        if (action.stat && action.value !== undefined) {
          context.statistics[action.stat] = action.value;
          result.statisticChanges.set(action.stat, action.value);
        }
        break;

      case 'SPAWN_ENTITY':
        if (action.entity && action.location) {
          result.worldChanges.push({
            type: 'SPAWN_ENTITY',
            locationId: action.location,
            entityId: action.entity,
          });
        }
        break;

      case 'REMOVE_ENTITY':
        if (action.entity) {
          result.worldChanges.push({
            type: 'REMOVE_ENTITY',
            locationId: action.location || context.currentLocationId,
            entityId: action.entity,
          });
        }
        break;

      case 'ADD_ITEM':
        if (action.item) {
          context.inventory.push({ id: action.item });
        }
        break;

      case 'REMOVE_ITEM':
        if (action.item) {
          const index = context.inventory.findIndex((i) => i.id === action.item);
          if (index !== -1) {
            context.inventory.splice(index, 1);
          }
        }
        break;

      case 'UNLOCK_LOCATION':
        if (action.location) {
          result.worldChanges.push({
            type: 'UNLOCK_LOCATION',
            locationId: action.location,
          });
        }
        break;

      case 'START_QUEST':
        if (action.quest) {
          context.questStates.set(action.quest, 'active');
        }
        break;

      case 'COMPLETE_QUEST':
        if (action.quest) {
          context.questStates.set(action.quest, 'completed');
        }
        break;

      case 'FAIL_QUEST':
        if (action.quest) {
          context.questStates.set(action.quest, 'failed');
        }
        break;

      case 'PLAY_ANIMATION':
        // Animation will be handled by the UI layer
        if (action.animation) {
          result.messages.push(`[ANIMATION: ${action.animation}]`);
        }
        break;

      case 'CHANGE_BIOME':
        if (action.location && action.biome) {
          result.worldChanges.push({
            type: 'CHANGE_BIOME',
            locationId: action.location,
            newValue: action.biome,
          });
        }
        break;

      case 'CHANGE_TIME':
        if (action.timeOfDay) {
          context.timeOfDay = action.timeOfDay;
          result.worldChanges.push({
            type: 'CHANGE_TIME',
            newValue: action.timeOfDay,
          });
        }
        break;

      case 'HEAL_PLAYER':
        if (action.amount) {
          context.health = Math.min(100, context.health + action.amount);
        }
        break;

      case 'DAMAGE_PLAYER':
        if (action.amount) {
          context.health = Math.max(0, context.health - action.amount);
        }
        break;

      case 'TELEPORT_PLAYER':
        if (action.location) {
          context.currentLocationId = action.location;
          context.visitedLocations.add(action.location);
        }
        break;

      case 'CHAIN_EVENT':
        if (action.eventId) {
          // Record event chain for later execution
          if (!this.eventChains.has(action.eventId)) {
            this.eventChains.set(action.eventId, []);
          }
        }
        break;

      case 'WAIT':
        // Advance time or turn count
        if (action.turns) {
          context.turnCount += action.turns;
        }
        if (action.days) {
          context.daysPassed += action.days;
        }
        break;
    }
  }

  /**
   * Record event trigger for cooldown and repeatability tracking
   */
  private recordEventTrigger(event: GameEvent, timestamp: number): void {
    this.eventCooldowns.set(event.id, timestamp);
    const currentCount = this.eventTriggerCount.get(event.id) || 0;
    this.eventTriggerCount.set(event.id, currentCount + 1);
  }

  /**
   * Trigger events that are chained to the current event
   */
  private async triggerChainedEvents(
    eventId: string,
    allEvents: GameEvent[],
    context: EventContext,
    result: EventResult
  ): Promise<void> {
    const chainedEventIds = this.eventChains.get(eventId);
    if (!chainedEventIds || chainedEventIds.length === 0) return;

    for (const chainedId of chainedEventIds) {
      const chainedEvent = allEvents.find((e) => e.id === chainedId);
      if (chainedEvent) {
        const shouldTrigger = await this.evaluateTrigger(chainedEvent.trigger, context);
        if (shouldTrigger) {
          await this.executeEvent(chainedEvent, context, result);
          this.recordEventTrigger(chainedEvent, Date.now());
        }
      }
    }
  }

  /**
   * Register event chain relationship
   */
  public registerEventChain(fromEventId: string, toEventId: string): void {
    if (!this.eventChains.has(fromEventId)) {
      this.eventChains.set(fromEventId, []);
    }
    this.eventChains.get(fromEventId)!.push(toEventId);
  }

  /**
   * Get event trigger statistics
   */
  public getEventStats(): Map<string, { triggerCount: number; lastTriggered: number | null }> {
    const stats = new Map<string, { triggerCount: number; lastTriggered: number | null }>();

    this.eventTriggerCount.forEach((count, eventId) => {
      stats.set(eventId, {
        triggerCount: count,
        lastTriggered: this.eventCooldowns.get(eventId) || null,
      });
    });

    return stats;
  }

  /**
   * Reset event system (for new game or save load)
   */
  public reset(): void {
    this.eventCooldowns.clear();
    this.eventTriggerCount.clear();
    this.eventChains.clear();
  }

  /**
   * Get serializable state for saving
   */
  public getState(): {
    cooldowns: Array<[string, number]>;
    triggerCounts: Array<[string, number]>;
    chains: Array<[string, string[]]>;
  } {
    return {
      cooldowns: Array.from(this.eventCooldowns.entries()),
      triggerCounts: Array.from(this.eventTriggerCount.entries()),
      chains: Array.from(this.eventChains.entries()),
    };
  }

  /**
   * Load state from saved data
   */
  public loadState(state: {
    cooldowns: Array<[string, number]>;
    triggerCounts: Array<[string, number]>;
    chains: Array<[string, string[]]>;
  }): void {
    this.eventCooldowns = new Map(state.cooldowns);
    this.eventTriggerCount = new Map(state.triggerCounts);
    this.eventChains = new Map(state.chains);
  }
}

/**
 * Helper to create event from simple parameters
 */
export function createSimpleEvent(params: {
  id: string;
  name: string;
  triggerType: string;
  triggerLocation?: string;
  conditions?: EventCondition[];
  actions: EventAction[];
  priority?: number;
  repeatable?: boolean;
  cooldown?: number;
}): GameEvent {
  return {
    id: params.id,
    name: params.name,
    description: `Auto-generated event: ${params.name}`,
    trigger: {
      type: params.triggerType as any,
      location: params.triggerLocation,
      conditions: params.conditions || [],
    },
    actions: params.actions,
    priority: params.priority || 5,
    repeatable: params.repeatable || false,
    cooldown: params.cooldown || 0,
  };
}
