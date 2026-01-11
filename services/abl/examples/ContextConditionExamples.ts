/**
 * ContextConditionExamples - FACADE 3.3
 *
 * Examples demonstrating context conditions that monitor the environment
 * continuously during behavior execution and interrupt/fail when violated.
 */

import { Behavior, BehaviorStatus, BehaviorResult } from '../Behavior';
import { WorldState } from '../WorldState';
import { ContextConditionBuilder } from '../ContextCondition';
import { BehaviorTree, ExecutionStrategy } from '../BehaviorTree';
import { Goal, GoalPriority } from '../Goal';

// ===== EXAMPLE 1: Bartender Serving Drink - Player Leaves =====

/**
 * Bartender prepares drink, but player might leave during preparation
 */
export class PrepareDrinkWithContextBehavior extends Behavior {
  constructor() {
    super('prepare_drink_monitored', 'Prepare Drink (Monitored)', 60, 0.7);

    // Precondition: Order must exist
    this.addPrecondition('Has active order', (ws) => ws.has('drink_order'));

    // Context condition: Player must stay at bar (interrupt if they leave)
    const playerAtBar = ContextConditionBuilder
      .playerInLocation('bar', 'interrupt')
      .build();

    this.addContextCondition(playerAtBar.description, playerAtBar.check, playerAtBar.onFailure);

    // Success: Drink prepared
    this.addSuccessTest('Drink prepared', (ws) => ws.get('drink_prepared') === true);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[PrepareDrink] Starting to prepare drink...');

    worldState.set('preparation_start_time', Date.now());

    // Simulate drink preparation (2 seconds)
    // Context condition will be checked during this time
    for (let i = 0; i < 20; i++) {
      await this.delay(100);
      console.log(`[PrepareDrink] Preparing... ${(i + 1) * 5}%`);

      // Check if player is still at bar (this would normally be done by the behavior executor)
      if (worldState.get('player_location') !== 'bar') {
        console.log('[PrepareDrink] Player left! Stopping preparation.');
        return {
          status: BehaviorStatus.INTERRUPTED,
          message: 'Player left before drink was ready',
        };
      }
    }

    worldState.set('drink_prepared', true);
    console.log('[PrepareDrink] Drink ready!');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Drink prepared successfully',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run Example 1: Player leaves while bartender prepares drink
 */
export async function example1_PlayerLeavesBar(): Promise<void> {
  console.log('\n===== Example 1: Bartender - Player Leaves =====\n');

  const worldState = new WorldState();
  worldState.set('player_location', 'bar');
  worldState.set('drink_order', 'beer');

  const behavior = new PrepareDrinkWithContextBehavior();

  console.log('Starting drink preparation...');

  // Start behavior in background
  const resultPromise = behavior.execute(worldState);

  // After 1 second, player leaves
  setTimeout(() => {
    console.log('\n[PLAYER ACTION] Player leaves the bar!\n');
    worldState.set('player_location', 'street');
  }, 1000);

  const result = await resultPromise;

  console.log(`\nResult: ${result.status}`);
  console.log(`Message: ${result.message}`);
  console.log('Expected: INTERRUPTED (player left during preparation)');
}

// ===== EXAMPLE 2: Conversation Interrupted by Danger =====

/**
 * NPC having conversation, but danger appears
 */
export class ConverseBehavior extends Behavior {
  constructor() {
    super('converse_monitored', 'Converse (Monitored)', 50, 0.6);

    // Precondition: Conversation partner present
    this.addPrecondition('Partner present', (ws) => ws.get('conversation_partner_present') === true);

    // Context conditions: No danger AND partner still present
    const noDanger = ContextConditionBuilder
      .noDanger('interrupt')
      .build();

    const partnerPresent = ContextConditionBuilder
      .conversationPartnerPresent('conversation_partner_present', 'interrupt')
      .build();

    this.addContextCondition(noDanger.description, noDanger.check, noDanger.onFailure);
    this.addContextCondition(partnerPresent.description, partnerPresent.check, partnerPresent.onFailure);

    // Success: Conversation completed
    this.addSuccessTest('Conversation complete', (ws) => ws.get('conversation_complete') === true);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[Converse] Starting conversation...');

    // Simulate conversation (3 seconds)
    for (let i = 0; i < 30; i++) {
      await this.delay(100);

      if (i === 10) {
        console.log('[Converse] "So, about that quest..."');
      } else if (i === 20) {
        console.log('[Converse] "Yes, I think I can help with that."');
      }

      // Check context conditions
      if (worldState.get('danger_present')) {
        console.log('[Converse] DANGER! Breaking off conversation!');
        return {
          status: BehaviorStatus.INTERRUPTED,
          message: 'Conversation interrupted by danger',
        };
      }

      if (!worldState.get('conversation_partner_present')) {
        console.log('[Converse] Partner left!');
        return {
          status: BehaviorStatus.INTERRUPTED,
          message: 'Conversation partner left',
        };
      }
    }

    worldState.set('conversation_complete', true);
    console.log('[Converse] Conversation finished naturally.');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Conversation completed',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run Example 2: Danger interrupts conversation
 */
export async function example2_DangerInterruptsConversation(): Promise<void> {
  console.log('\n===== Example 2: Danger Interrupts Conversation =====\n');

  const worldState = new WorldState();
  worldState.set('conversation_partner_present', true);
  worldState.set('danger_present', false);

  const behavior = new ConverseBehavior();

  console.log('Starting conversation...');

  // Start behavior
  const resultPromise = behavior.execute(worldState);

  // After 1.5 seconds, danger appears!
  setTimeout(() => {
    console.log('\n🔥 [DANGER APPEARS] Dragon spotted nearby! 🔥\n');
    worldState.set('danger_present', true);
  }, 1500);

  const result = await resultPromise;

  console.log(`\nResult: ${result.status}`);
  console.log(`Message: ${result.message}`);
  console.log('Expected: INTERRUPTED (danger appeared)');
}

// ===== EXAMPLE 3: Mining with Health Monitoring =====

/**
 * Mining ore, but must maintain health above threshold
 */
export class MineBehavior extends Behavior {
  constructor() {
    super('mine_ore', 'Mine Ore', 55, 0.6);

    // Precondition: Has pickaxe
    this.addPrecondition('Has pickaxe', (ws) => ws.get('has_pickaxe') === true);

    // Context condition: Health must stay above 20 (mining is dangerous)
    const healthCheck = ContextConditionBuilder
      .healthAbove(20, 'fail')  // FAIL strategy - mining too dangerous if health drops
      .build();

    this.addContextCondition(healthCheck.description, healthCheck.check, healthCheck.onFailure);

    // Success: Ore collected
    this.addSuccessTest('Ore collected', (ws) => (ws.get('ore_collected') as number) >= 5);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[Mine] Starting to mine ore...');

    worldState.set('ore_collected', 0);
    let health = worldState.get('health') as number;

    // Mine for 10 iterations
    for (let i = 0; i < 10; i++) {
      await this.delay(300);

      // Mining damages health
      health -= 8;
      worldState.set('health', health);

      const oreCollected = (worldState.get('ore_collected') as number) + 1;
      worldState.set('ore_collected', oreCollected);

      console.log(`[Mine] *swing* Collected ${oreCollected} ore. Health: ${health}`);

      // Check health
      if (health <= 20) {
        console.log('[Mine] Health too low! Must stop mining.');
        return {
          status: BehaviorStatus.FAILURE,
          message: 'Health dropped too low during mining',
        };
      }
    }

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Mining completed successfully',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run Example 3: Mining with health monitoring
 */
export async function example3_MiningWithHealthMonitor(): Promise<void> {
  console.log('\n===== Example 3: Mining with Health Monitoring =====\n');

  const worldState = new WorldState();
  worldState.set('has_pickaxe', true);
  worldState.set('health', 100);

  const behavior = new MineBehavior();

  console.log('Starting mining with 100 health...');

  const result = await behavior.execute(worldState);

  console.log(`\nResult: ${result.status}`);
  console.log(`Message: ${result.message}`);
  console.log(`Final health: ${worldState.get('health')}`);
  console.log(`Ore collected: ${worldState.get('ore_collected')}`);
  console.log('Expected: FAILURE (health drops below 20)');
}

// ===== EXAMPLE 4: Time-Limited Task =====

/**
 * Task that must complete within time limit
 */
export class DefuseBombBehavior extends Behavior {
  constructor() {
    super('defuse_bomb', 'Defuse Bomb', 90, 0.9);

    // Precondition: Has defusal kit
    this.addPrecondition('Has defusal kit', (ws) => ws.get('has_defusal_kit') === true);

    // Context condition: Must complete within 5 seconds
    const timeLimit = ContextConditionBuilder
      .withinTimeLimit('defusal_start_time', 5000, 'fail')
      .build();

    this.addContextCondition(timeLimit.description, timeLimit.check, timeLimit.onFailure);

    // Success: Bomb defused
    this.addSuccessTest('Bomb defused', (ws) => ws.get('bomb_defused') === true);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    worldState.set('defusal_start_time', Date.now());
    console.log('[DefuseBomb] Starting defusal... Timer: 5 seconds!');

    // Simulate defusal process (6 seconds - will exceed time limit)
    for (let i = 0; i < 60; i++) {
      await this.delay(100);

      const elapsed = Date.now() - (worldState.get('defusal_start_time') as number);

      if (i % 10 === 0) {
        const remaining = 5000 - elapsed;
        console.log(`[DefuseBomb] Working... Time remaining: ${Math.max(0, remaining)}ms`);
      }

      // Check time limit
      if (elapsed > 5000) {
        console.log('[DefuseBomb] ⏰ TIME UP! 💥');
        return {
          status: BehaviorStatus.FAILURE,
          message: 'Failed to defuse in time',
        };
      }
    }

    worldState.set('bomb_defused', true);
    console.log('[DefuseBomb] ✅ Bomb defused!');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Bomb successfully defused',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run Example 4: Time-limited bomb defusal
 */
export async function example4_TimeLimitedTask(): Promise<void> {
  console.log('\n===== Example 4: Time-Limited Bomb Defusal =====\n');

  const worldState = new WorldState();
  worldState.set('has_defusal_kit', true);

  const behavior = new DefuseBombBehavior();

  const result = await behavior.execute(worldState);

  console.log(`\nResult: ${result.status}`);
  console.log(`Message: ${result.message}`);
  console.log('Expected: FAILURE (exceeded 5 second time limit)');
}

// ===== EXAMPLE 5: Retry Strategy - Weather Monitoring =====

/**
 * Farming that continues despite weather changes (retry strategy)
 */
export class FarmBehavior extends Behavior {
  constructor() {
    super('farm_crops', 'Farm Crops', 40, 0.5);

    // Context condition: Prefer sunny weather, but continue if it changes (retry)
    const sunnyWeather = ContextConditionBuilder
      .weatherIs('sunny', 'retry')  // RETRY - continue even if weather changes
      .build();

    this.addContextCondition(sunnyWeather.description, sunnyWeather.check, sunnyWeather.onFailure);

    // Success: Crops harvested
    this.addSuccessTest('Crops harvested', (ws) => (ws.get('crops_harvested') as number) >= 10);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[Farm] Starting farming...');

    worldState.set('crops_harvested', 0);

    for (let i = 0; i < 10; i++) {
      await this.delay(300);

      const weather = worldState.get('current_weather');
      const harvested = (worldState.get('crops_harvested') as number) + 1;
      worldState.set('crops_harvested', harvested);

      console.log(`[Farm] Harvested ${harvested} crops. Weather: ${weather}`);
    }

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Farming completed',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run Example 5: Farming with weather changes (retry strategy)
 */
export async function example5_RetryStrategy(): Promise<void> {
  console.log('\n===== Example 5: Farming with Retry Strategy =====\n');

  const worldState = new WorldState();
  worldState.set('current_weather', 'sunny');

  const behavior = new FarmBehavior();

  console.log('Starting farming in sunny weather...');

  const resultPromise = behavior.execute(worldState);

  // Weather changes during farming
  setTimeout(() => {
    console.log('\n☁️ [WEATHER CHANGE] It starts raining!\n');
    worldState.set('current_weather', 'rainy');
  }, 1500);

  const result = await resultPromise;

  console.log(`\nResult: ${result.status}`);
  console.log(`Message: ${result.message}`);
  console.log('Expected: SUCCESS (continued despite weather change due to retry strategy)');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllContextConditionExamples(): Promise<void> {
  console.log('\n\n========================================');
  console.log('FACADE 3.3: Context Condition Examples');
  console.log('========================================');

  await example1_PlayerLeavesBar();
  await example2_DangerInterruptsConversation();
  await example3_MiningWithHealthMonitor();
  await example4_TimeLimitedTask();
  await example5_RetryStrategy();

  console.log('\n\n========================================');
  console.log('All Examples Complete!');
  console.log('========================================\n');
}

// Run if executed directly
if (require.main === module) {
  runAllContextConditionExamples().catch(console.error);
}
