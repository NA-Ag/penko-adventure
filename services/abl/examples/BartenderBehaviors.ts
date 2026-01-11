/**
 * BartenderBehaviors - FACADE 3.1 Example
 *
 * Example implementation showing how to use the ABL behavior system.
 * Demonstrates a bartender NPC with hierarchical goal-driven behaviors.
 *
 * Goal: "Serve drinks to the player"
 * ├─ Behavior: "TakeDrinkOrder"
 * │  ├─ Precondition: player is at bar && hasn't ordered
 * │  ├─ Execute: Ask "What'll it be?"
 * │  └─ Success: Player stated drink choice
 * ├─ Behavior: "PrepareDrink"
 * │  ├─ Precondition: Order received
 * │  ├─ Execute: Make drink animation
 * │  └─ Success: Drink prepared
 * └─ Behavior: "ServeDrink"
 *    ├─ Precondition: Drink prepared
 *    ├─ Execute: Hand drink to player
 *    └─ Success: Player has drink
 */

import { Behavior, BehaviorStatus, BehaviorResult } from '../Behavior';
import { Goal, GoalPriority } from '../Goal';
import { WorldState } from '../WorldState';

// ===== BEHAVIORS =====

/**
 * TakeDrinkOrder - Ask player what they want to drink
 */
export class TakeDrinkOrderBehavior extends Behavior {
  constructor() {
    super(
      'take_drink_order',
      'Take Drink Order',
      60, // Medium-high priority
      0.8  // High specificity (very specific action)
    );

    // Precondition: Player must be at bar and not have an active order
    this.addPrecondition('Player is at bar', (ws: WorldState) => {
      return ws.matches('player_location', 'bar');
    });

    this.addPrecondition('No active order', (ws: WorldState) => {
      return !ws.has('active_drink_order');
    });

    // Success test: Order has been placed
    this.addSuccessTest('Order placed', (ws: WorldState) => {
      return ws.has('active_drink_order');
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    // Simulate asking for order
    console.log('[TakeDrinkOrder] Bartender: "What will it be?"');

    // In a real implementation, this would wait for player input
    // For this example, we'll simulate receiving an order
    await this.simulateDelay(1000);

    // Record the order in world state
    worldState.set('active_drink_order', 'beer');
    worldState.set('order_time', Date.now());

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Drink order taken successfully',
      data: { drink: 'beer' },
    };
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * PrepareDrink - Make the requested drink
 */
export class PrepareDrinkBehavior extends Behavior {
  constructor() {
    super(
      'prepare_drink',
      'Prepare Drink',
      55, // Medium priority
      0.7  // Moderately specific
    );

    // Precondition: Must have an active order and drink not prepared
    this.addPrecondition('Active order exists', (ws: WorldState) => {
      return ws.has('active_drink_order');
    });

    this.addPrecondition('Drink not already prepared', (ws: WorldState) => {
      return !ws.matches('drink_prepared', true);
    });

    // Context condition: Player must still be at bar (if they leave, interrupt)
    this.addContextCondition(
      'Player still at bar',
      (ws: WorldState) => ws.matches('player_location', 'bar'),
      'interrupt'
    );

    // Success test: Drink is prepared
    this.addSuccessTest('Drink prepared', (ws: WorldState) => {
      return ws.matches('drink_prepared', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    const drinkType = worldState.get('active_drink_order') as string;

    console.log(`[PrepareDrink] Bartender is preparing a ${drinkType}...`);

    // Simulate drink preparation time
    await this.simulateDelay(2000);

    // Mark drink as prepared
    worldState.set('drink_prepared', true);
    worldState.set('prepared_drink_type', drinkType);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `${drinkType} prepared`,
      data: { drink: drinkType },
    };
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * ServeDrink - Hand the prepared drink to the player
 */
export class ServeDrinkBehavior extends Behavior {
  constructor() {
    super(
      'serve_drink',
      'Serve Drink',
      70, // High priority (final step)
      0.9  // Very specific
    );

    // Precondition: Drink must be prepared
    this.addPrecondition('Drink is prepared', (ws: WorldState) => {
      return ws.matches('drink_prepared', true);
    });

    this.addPrecondition('Player at bar', (ws: WorldState) => {
      return ws.matches('player_location', 'bar');
    });

    // Success test: Player has received the drink
    this.addSuccessTest('Player has drink', (ws: WorldState) => {
      return ws.matches('player_has_drink', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    const drinkType = worldState.get('prepared_drink_type') as string;

    console.log(`[ServeDrink] Bartender: "Here's your ${drinkType}. Enjoy!"`);

    // Give drink to player
    worldState.set('player_has_drink', true);

    // Clean up order state
    worldState.delete('active_drink_order');
    worldState.set('drink_prepared', false);
    worldState.delete('prepared_drink_type');

    // Track successful service
    worldState.increment('drinks_served');

    return {
      status: BehaviorStatus.SUCCESS,
      message: `Served ${drinkType} to player`,
      data: { drink: drinkType },
    };
  }
}

/**
 * IdleChitChat - Make small talk when not serving
 */
export class IdleChitChatBehavior extends Behavior {
  constructor() {
    super(
      'idle_chitchat',
      'Idle Chitchat',
      20, // Low priority (only when nothing else to do)
      0.3  // Low specificity (generic behavior)
    );

    // Precondition: No active orders
    this.addPrecondition('No active work', (ws: WorldState) => {
      return !ws.has('active_drink_order') && !ws.matches('drink_prepared', true);
    });

    // Success test: Always succeeds (idle behavior)
    this.addSuccessTest('Chitchat completed', () => true);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    const chitchatPhrases = [
      "Business has been slow today...",
      "How's the weather treating you?",
      "You hear about the dragon in the mountains?",
      "*wipes down the bar*",
      "Let me know if you need anything!",
    ];

    const phrase = chitchatPhrases[Math.floor(Math.random() * chitchatPhrases.length)];
    console.log(`[IdleChitChat] Bartender: "${phrase}"`);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Chitchat completed',
    };
  }
}

// ===== GOAL =====

/**
 * Create "Serve Drinks" goal with all behaviors
 */
export function createServeDrinksGoal(): Goal {
  const goal = new Goal(
    'serve_drinks',
    'Serve Drinks to Player',
    'Provide beverage service to the player at the bar',
    GoalPriority.NORMAL
  );

  // Success criteria: Player has received their drink
  goal.addSuccessCriteria('Player has drink', (ws: WorldState) => {
    return ws.matches('player_has_drink', true);
  });

  // Failure criteria: Player left the bar before service complete
  goal.addFailureCriteria('Player left bar', (ws: WorldState) => {
    // Fail only if player left AND we had started an order
    return ws.has('active_drink_order') && !ws.matches('player_location', 'bar');
  });

  // Maximum 3 attempts (if player keeps leaving)
  goal.setMaxAttempts(3);

  // Add behaviors that satisfy this goal
  goal.addSatisfyingBehavior(new TakeDrinkOrderBehavior());
  goal.addSatisfyingBehavior(new PrepareDrinkBehavior());
  goal.addSatisfyingBehavior(new ServeDrinkBehavior());

  return goal;
}

/**
 * Create idle/background goal
 */
export function createIdleGoal(): Goal {
  const goal = new Goal(
    'stay_busy',
    'Stay Busy',
    'Keep busy when not serving customers',
    GoalPriority.BACKGROUND
  );

  // This goal never really "completes" - it's always active at low priority
  goal.addSuccessCriteria('Always incomplete', () => false);

  // Add idle behaviors
  goal.addSatisfyingBehavior(new IdleChitChatBehavior());

  return goal;
}

// ===== USAGE EXAMPLE =====

/**
 * Example: Set up bartender with behavior tree
 */
export async function runBartenderExample(): Promise<void> {
  console.log('\n===== Bartender Behavior Example =====\n');

  // Create world state
  const worldState = new WorldState();
  worldState.set('player_location', 'bar');
  worldState.set('drinks_served', 0);

  // Import BehaviorTree
  const { BehaviorTree, ExecutionStrategy } = await import('../BehaviorTree');

  // Create behavior tree for bartender
  const bartenderTree = new BehaviorTree('bartender_bob', worldState, ExecutionStrategy.PRIORITY);

  // Create and activate goals
  const serveDrinksGoal = createServeDrinksGoal();
  const idleGoal = createIdleGoal();

  bartenderTree.addGoal(serveDrinksGoal);
  bartenderTree.addGoal(idleGoal);

  // Activate serve drinks goal
  serveDrinksGoal.activate();
  idleGoal.activate();

  console.log('Bartender Bob is ready to serve!\n');

  // Simulate 5 behavior tree ticks
  for (let i = 0; i < 5; i++) {
    console.log(`\n--- Tick ${i + 1} ---`);
    console.log('World State:', worldState.toObject());
    console.log('Active Goals:', bartenderTree.getActiveGoals().map(g => g.name).join(', '));

    const results = await bartenderTree.tick();

    console.log('Results:', results.map(r => `${r.status}: ${r.message}`).join(', '));

    // Wait between ticks
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if serve drinks goal is achieved
    if (serveDrinksGoal.isAchieved()) {
      console.log('\n✅ Goal achieved! Player has their drink!');
      break;
    }

    // Check if goal failed
    if (serveDrinksGoal.hasFailed()) {
      console.log('\n❌ Goal failed! Player left or too many failed attempts.');
      break;
    }
  }

  console.log('\n===== Example Complete =====\n');
  console.log('Final Stats:', bartenderTree.getStats());
  console.log('Final World State:', worldState.toObject());
}

// Run example if executed directly
if (require.main === module) {
  runBartenderExample().catch(console.error);
}
