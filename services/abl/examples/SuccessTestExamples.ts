/**
 * SuccessTestExamples - FACADE 3.4
 *
 * Examples demonstrating success tests that determine if behaviors
 * achieved their goals, including partial success and parent-child relationships.
 */

import { Behavior, BehaviorStatus, BehaviorResult } from '../Behavior';
import { WorldState } from '../WorldState';
import { SuccessTestBuilder, SuccessCriteria, SuccessEvaluator } from '../SuccessTest';

// ===== EXAMPLE 1: Simple Success Test =====

/**
 * Collect 5 apples - simple success test
 */
export class CollectApplesBehavior extends Behavior {
  constructor() {
    super('collect_apples', 'Collect Apples', 50, 0.5);

    // Success: Collected at least 5 apples
    const collectedEnough = SuccessTestBuilder
      .collectedCount('apples_collected', 5)
      .build();

    this.addSuccessTest(collectedEnough.description, collectedEnough.check);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[CollectApples] Searching for apples...');

    // Simulate collecting apples (random 3-7)
    const collected = Math.floor(Math.random() * 5) + 3;
    worldState.set('apples_collected', collected);

    console.log(`[CollectApples] Collected ${collected} apples`);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `Collected ${collected} apples`,
      data: { apples: collected },
    };
  }
}

export async function example1_SimpleSuccessTest(): Promise<void> {
  console.log('\n===== Example 1: Simple Success Test =====\n');

  const worldState = new WorldState();
  const behavior = new CollectApplesBehavior();

  const result = await behavior.execute(worldState);

  const apples = worldState.get('apples_collected');
  console.log(`\nResult: ${result.status}`);
  console.log(`Apples collected: ${apples}`);
  console.log(`Success: ${apples >= 5 ? 'YES ✅' : 'NO ❌'}`);
}

// ===== EXAMPLE 2: Multiple Success Tests (All Must Pass) =====

/**
 * Complete quest - multiple objectives
 */
export class CompleteQuestBehavior extends Behavior {
  constructor() {
    super('complete_quest', 'Complete Quest', 70, 0.8);

    // Success requires ALL of:
    // 1. Talk to NPC
    // 2. Collect item
    // 3. Return to quest giver

    const talkedToNPC = SuccessTestBuilder
      .stateEquals('talked_to_npc', true)
      .build();

    const hasItem = SuccessTestBuilder
      .stateEquals('has_quest_item', true)
      .build();

    const returnedToGiver = SuccessTestBuilder
      .stateEquals('returned_to_giver', true)
      .build();

    this.addSuccessTest(talkedToNPC.description, talkedToNPC.check);
    this.addSuccessTest(hasItem.description, hasItem.check);
    this.addSuccessTest(returnedToGiver.description, returnedToGiver.check);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[CompleteQuest] Starting quest...');

    // Step 1: Talk to NPC
    console.log('[CompleteQuest] Talking to NPC...');
    worldState.set('talked_to_npc', true);

    // Step 2: Try to collect item (50% chance of success)
    console.log('[CompleteQuest] Searching for quest item...');
    const foundItem = Math.random() > 0.5;
    worldState.set('has_quest_item', foundItem);
    console.log(`[CompleteQuest] Item ${foundItem ? 'found' : 'not found'}`);

    // Step 3: Return to giver (only if have item)
    if (foundItem) {
      console.log('[CompleteQuest] Returning to quest giver...');
      worldState.set('returned_to_giver', true);
    }

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Quest attempt completed',
    };
  }
}

export async function example2_MultipleSuccessTests(): Promise<void> {
  console.log('\n===== Example 2: Multiple Success Tests =====\n');

  const worldState = new WorldState();
  const behavior = new CompleteQuestBehavior();

  const result = await behavior.execute(worldState);

  console.log(`\nResult: ${result.status}`);
  console.log(`Talked to NPC: ${worldState.get('talked_to_npc')}`);
  console.log(`Has quest item: ${worldState.get('has_quest_item')}`);
  console.log(`Returned to giver: ${worldState.get('returned_to_giver')}`);

  const allComplete =
    worldState.get('talked_to_npc') &&
    worldState.get('has_quest_item') &&
    worldState.get('returned_to_giver');

  console.log(`\nQuest Complete: ${allComplete ? 'YES ✅' : 'NO ❌ (partial success)'}`);
}

// ===== EXAMPLE 3: Weighted Success Tests =====

/**
 * Rescue mission with weighted objectives
 */
export class RescueMissionBehavior extends Behavior {
  constructor() {
    super('rescue_mission', 'Rescue Mission', 80, 0.9);

    // Success tests with different weights
    const rescuedTarget = SuccessTestBuilder
      .stateEquals('target_rescued', true)
      .withWeight(1.0) // Critical - full weight
      .build();

    const noInjuries = SuccessTestBuilder
      .stateEquals('team_injured', false)
      .withWeight(0.5) // Important but not critical
      .build();

    const completedInTime = SuccessTestBuilder
      .completedInTime('mission_start', 10000) // 10 seconds
      .withWeight(0.3) // Bonus for speed
      .build();

    this.addSuccessTest(rescuedTarget.description, rescuedTarget.check);
    this.addSuccessTest(noInjuries.description, noInjuries.check);
    this.addSuccessTest(completedInTime.description, completedInTime.check);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    worldState.set('mission_start', Date.now());
    console.log('[RescueMission] Starting rescue operation...');

    // Rescue attempt (80% success)
    await this.delay(2000);
    const rescued = Math.random() > 0.2;
    worldState.set('target_rescued', rescued);
    console.log(`[RescueMission] Target ${rescued ? 'rescued ✅' : 'not found ❌'}`);

    // Check for injuries (60% chance of no injuries)
    const injured = Math.random() > 0.6;
    worldState.set('team_injured', injured);
    console.log(`[RescueMission] Team ${injured ? 'sustained injuries ⚠️' : 'unharmed ✅'}`);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Rescue mission completed',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export async function example3_WeightedSuccessTests(): Promise<void> {
  console.log('\n===== Example 3: Weighted Success Tests =====\n');

  const worldState = new WorldState();
  const behavior = new RescueMissionBehavior();

  const result = await behavior.execute(worldState);

  const duration = Date.now() - (worldState.get('mission_start') as number);

  console.log(`\nResult: ${result.status}`);
  console.log(`Target rescued: ${worldState.get('target_rescued')} (weight: 1.0)`);
  console.log(`Team unharmed: ${!worldState.get('team_injured')} (weight: 0.5)`);
  console.log(`Completed in time: ${duration <= 10000} (weight: 0.3, time: ${duration}ms)`);

  // Calculate weighted score
  let score = 0;
  let totalWeight = 0;

  if (worldState.get('target_rescued')) {
    score += 1.0;
  }
  totalWeight += 1.0;

  if (!worldState.get('team_injured')) {
    score += 0.5;
  }
  totalWeight += 0.5;

  if (duration <= 10000) {
    score += 0.3;
  }
  totalWeight += 0.3;

  const finalScore = (score / totalWeight) * 100;
  console.log(`\nMission Score: ${finalScore.toFixed(1)}%`);
}

// ===== EXAMPLE 4: Success Criteria with Primary/Secondary/Bonus Objectives =====

/**
 * Heist mission with tiered objectives
 */
export class HeistBehavior extends Behavior {
  private criteria: SuccessCriteria;

  constructor() {
    super('heist', 'Execute Heist', 85, 0.9);

    // Define success criteria
    this.criteria = new SuccessCriteria();

    // Primary objectives (REQUIRED for success)
    this.criteria.addPrimary(
      SuccessTestBuilder.stateEquals('vault_opened', true)
    );
    this.criteria.addPrimary(
      SuccessTestBuilder.stateEquals('loot_collected', true)
    );

    // Secondary objectives (important)
    this.criteria.addSecondary(
      SuccessTestBuilder.stateEquals('alarm_triggered', false)
    );
    this.criteria.addSecondary(
      SuccessTestBuilder.stateEquals('guards_alerted', false)
    );

    // Bonus objectives (optional)
    this.criteria.addBonus(
      SuccessTestBuilder.completedInTime('heist_start', 60000) // 1 minute
    );
    this.criteria.addBonus(
      SuccessTestBuilder.stateEquals('left_no_evidence', true)
    );

    const finalTest = this.criteria.build();
    this.addSuccessTest(finalTest.description, finalTest.check);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    worldState.set('heist_start', Date.now());
    console.log('[Heist] Initiating heist...\n');

    // Primary: Open vault (90% success)
    console.log('[Heist] Attempting to open vault...');
    await this.delay(1000);
    const vaultOpened = Math.random() > 0.1;
    worldState.set('vault_opened', vaultOpened);
    console.log(`  Vault: ${vaultOpened ? 'OPENED ✅' : 'FAILED ❌'}\n`);

    if (!vaultOpened) {
      return {
        status: BehaviorStatus.SUCCESS,
        message: 'Heist attempt completed (vault failed)',
      };
    }

    // Primary: Collect loot
    console.log('[Heist] Collecting loot...');
    await this.delay(1500);
    worldState.set('loot_collected', true);
    console.log('  Loot: COLLECTED ✅\n');

    // Secondary: Alarm (70% chance of avoiding)
    const alarmTriggered = Math.random() > 0.7;
    worldState.set('alarm_triggered', alarmTriggered);
    console.log(`  Alarm: ${alarmTriggered ? 'TRIGGERED ⚠️' : 'AVOIDED ✅'}`);

    // Secondary: Guards (60% chance of avoiding)
    const guardsAlerted = Math.random() > 0.6;
    worldState.set('guards_alerted', guardsAlerted);
    console.log(`  Guards: ${guardsAlerted ? 'ALERTED ⚠️' : 'UNAWARE ✅'}\n`);

    // Bonus: Evidence
    const noEvidence = Math.random() > 0.5;
    worldState.set('left_no_evidence', noEvidence);
    console.log(`  Evidence: ${noEvidence ? 'NONE ⭐' : 'LEFT TRACES'}`);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Heist completed',
    };
  }

  getDetailedScore(worldState: WorldState, result?: any): any {
    return this.criteria.evaluateDetailed(worldState, result);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export async function example4_TieredObjectives(): Promise<void> {
  console.log('\n===== Example 4: Tiered Objectives (Primary/Secondary/Bonus) =====\n');

  const worldState = new WorldState();
  const behavior = new HeistBehavior();

  const result = await behavior.execute(worldState);
  const scores = behavior.getDetailedScore(worldState, result.data);

  console.log('\n--- HEIST RESULTS ---');
  console.log(`\nPrimary Objectives: ${(scores.primaryScore * 100).toFixed(0)}%`);
  console.log(`  - Vault opened: ${worldState.get('vault_opened')}`);
  console.log(`  - Loot collected: ${worldState.get('loot_collected')}`);

  console.log(`\nSecondary Objectives: ${(scores.secondaryScore * 100).toFixed(0)}%`);
  console.log(`  - Alarm avoided: ${!worldState.get('alarm_triggered')}`);
  console.log(`  - Guards unaware: ${!worldState.get('guards_alerted')}`);

  console.log(`\nBonus Objectives: ${(scores.bonusScore * 100).toFixed(0)}%`);
  const duration = Date.now() - (worldState.get('heist_start') as number);
  console.log(`  - Completed in time: ${duration <= 60000} (${duration}ms)`);
  console.log(`  - No evidence: ${worldState.get('left_no_evidence')}`);

  console.log(`\n🎯 TOTAL SCORE: ${(scores.totalScore * 100).toFixed(1)}%`);
  console.log(`Mission Status: ${scores.success ? 'SUCCESS ✅' : 'FAILURE ❌'}`);
}

// ===== EXAMPLE 5: Parent-Child Behavior Success Checking =====

/**
 * Parent behavior: Make Potion
 */
export class MakePotionBehavior extends Behavior {
  private gatherBehavior: GatherIngredientsBehavior;
  private mixBehavior: MixIngredientsBehavior;
  private bottleBehavior: BottlePotionBehavior;

  constructor() {
    super('make_potion', 'Make Potion', 60, 0.7);

    // Create child behaviors
    this.gatherBehavior = new GatherIngredientsBehavior();
    this.mixBehavior = new MixIngredientsBehavior();
    this.bottleBehavior = new BottlePotionBehavior();

    // Add as children
    this.addChild(this.gatherBehavior);
    this.addChild(this.mixBehavior);
    this.addChild(this.bottleBehavior);

    // Success: Potion bottled
    const potionComplete = SuccessTestBuilder
      .stateEquals('potion_bottled', true)
      .build();

    this.addSuccessTest(potionComplete.description, potionComplete.check);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[MakePotion] Starting potion creation process...\n');

    // Step 1: Gather ingredients
    console.log('Step 1: Gathering ingredients...');
    const gatherResult = await this.gatherBehavior.execute(worldState);

    if (gatherResult.status !== BehaviorStatus.SUCCESS) {
      console.log('  FAILED: Could not gather ingredients ❌\n');
      return {
        status: BehaviorStatus.FAILURE,
        message: 'Failed at gathering step',
      };
    }
    console.log('  SUCCESS: Ingredients gathered ✅\n');

    // Step 2: Mix ingredients
    console.log('Step 2: Mixing ingredients...');
    const mixResult = await this.mixBehavior.execute(worldState);

    if (mixResult.status !== BehaviorStatus.SUCCESS) {
      console.log('  FAILED: Mixing went wrong ❌\n');
      return {
        status: BehaviorStatus.FAILURE,
        message: 'Failed at mixing step',
      };
    }
    console.log('  SUCCESS: Potion mixed ✅\n');

    // Step 3: Bottle potion
    console.log('Step 3: Bottling potion...');
    const bottleResult = await this.bottleBehavior.execute(worldState);

    if (bottleResult.status !== BehaviorStatus.SUCCESS) {
      console.log('  FAILED: Bottling failed ❌\n');
      return {
        status: BehaviorStatus.FAILURE,
        message: 'Failed at bottling step',
      };
    }
    console.log('  SUCCESS: Potion bottled ✅\n');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Potion creation complete!',
    };
  }
}

/**
 * Child behavior: Gather Ingredients
 */
class GatherIngredientsBehavior extends Behavior {
  constructor() {
    super('gather_ingredients', 'Gather Ingredients', 50, 0.6);

    const hasIngredients = SuccessTestBuilder
      .stateGreaterOrEqual('ingredients_count', 3)
      .build();

    this.addSuccessTest(hasIngredients.description, hasIngredients.check);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    // Gather 3-5 ingredients
    const gathered = Math.floor(Math.random() * 3) + 3;
    worldState.set('ingredients_count', gathered);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `Gathered ${gathered} ingredients`,
    };
  }
}

/**
 * Child behavior: Mix Ingredients
 */
class MixIngredientsBehavior extends Behavior {
  constructor() {
    super('mix_ingredients', 'Mix Ingredients', 55, 0.7);

    this.addPrecondition('Has ingredients', (ws) => {
      const count = ws.get('ingredients_count') as number;
      return count >= 3;
    });

    const mixedSuccessfully = SuccessTestBuilder
      .stateEquals('potion_mixed', true)
      .build();

    this.addSuccessTest(mixedSuccessfully.description, mixedSuccessfully.check);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    // 80% chance of successful mix
    const success = Math.random() > 0.2;
    worldState.set('potion_mixed', success);

    return {
      status: success ? BehaviorStatus.SUCCESS : BehaviorStatus.FAILURE,
      message: success ? 'Mixed successfully' : 'Mixing failed',
    };
  }
}

/**
 * Child behavior: Bottle Potion
 */
class BottlePotionBehavior extends Behavior {
  constructor() {
    super('bottle_potion', 'Bottle Potion', 60, 0.8);

    this.addPrecondition('Potion is mixed', (ws) => ws.get('potion_mixed') === true);

    const bottled = SuccessTestBuilder
      .stateEquals('potion_bottled', true)
      .build();

    this.addSuccessTest(bottled.description, bottled.check);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    worldState.set('potion_bottled', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Potion bottled',
    };
  }
}

export async function example5_ParentChildSuccess(): Promise<void> {
  console.log('\n===== Example 5: Parent-Child Behavior Success Checking =====\n');

  const worldState = new WorldState();
  const behavior = new MakePotionBehavior();

  const result = await behavior.execute(worldState);

  console.log('--- FINAL RESULT ---');
  console.log(`Status: ${result.status}`);
  console.log(`Message: ${result.message}`);
  console.log(`\nPotion created: ${worldState.get('potion_bottled') ? 'YES ✅' : 'NO ❌'}`);
}

// ===== RUN ALL EXAMPLES =====

export async function runAllSuccessTestExamples(): Promise<void> {
  console.log('\n\n========================================');
  console.log('FACADE 3.4: Success Test Examples');
  console.log('========================================');

  await example1_SimpleSuccessTest();
  await example2_MultipleSuccessTests();
  await example3_WeightedSuccessTests();
  await example4_TieredObjectives();
  await example5_ParentChildSuccess();

  console.log('\n\n========================================');
  console.log('All Examples Complete!');
  console.log('========================================\n');
}

// Run if executed directly
if (require.main === module) {
  runAllSuccessTestExamples().catch(console.error);
}
