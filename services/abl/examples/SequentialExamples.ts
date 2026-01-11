/**
 * SequentialExamples - FACADE 3.7
 *
 * Examples demonstrating sequential behavior composition.
 *
 * Sequential behaviors execute sub-behaviors in strict order:
 * - Each step must complete before next begins
 * - Failed steps trigger recovery strategies
 * - Support for checkpoints and resumption
 *
 * Recovery strategies:
 * - FAIL: Stop entire sequence
 * - RETRY: Retry failed step
 * - SKIP: Skip failed step, continue
 * - FALLBACK: Execute alternative behavior
 */

import { Behavior, BehaviorStatus, BehaviorResult } from '../Behavior';
import { WorldState } from '../WorldState';
import { SequentialBehavior, RecoveryStrategy } from '../SequentialBehavior';

// ===== EXAMPLE 1: Make Potion (Success Path) =====

/**
 * GatherIngredientsBehavior
 */
class GatherIngredientsBehavior extends Behavior {
  constructor() {
    super('gather_ingredients', 'Gather Ingredients', 50, 0.6);

    this.addPrecondition('Ingredients available', (ws: WorldState) => {
      return ws.matches('ingredients_available', true);
    });

    this.addSuccessTest('Ingredients gathered', (ws: WorldState) => {
      return ws.matches('ingredients_gathered', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[GatherIngredients] Collecting herbs, crystals, and moonwater...');

    await this.delay(1000);

    worldState.set('ingredients_gathered', true);
    worldState.set('ingredient_count', 5);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Gathered 5 ingredients',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * MixIngredientsBehavior
 */
class MixIngredientsBehavior extends Behavior {
  constructor() {
    super('mix_ingredients', 'Mix Ingredients', 50, 0.6);

    this.addPrecondition('Ingredients gathered', (ws: WorldState) => {
      return ws.matches('ingredients_gathered', true);
    });

    this.addSuccessTest('Mixture created', (ws: WorldState) => {
      return ws.matches('mixture_created', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[MixIngredients] Stirring cauldron with arcane energies...');

    await this.delay(1500);

    worldState.set('mixture_created', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Mixture bubbling nicely',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * BottlePotionBehavior
 */
class BottlePotionBehavior extends Behavior {
  constructor() {
    super('bottle_potion', 'Bottle Potion', 50, 0.6);

    this.addPrecondition('Mixture created', (ws: WorldState) => {
      return ws.matches('mixture_created', true);
    });

    this.addSuccessTest('Potion bottled', (ws: WorldState) => {
      return ws.matches('potion_bottled', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[BottlePotion] Carefully pouring into crystal vial...');

    await this.delay(1000);

    worldState.set('potion_bottled', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Potion safely bottled',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * DeliverPotionBehavior
 */
class DeliverPotionBehavior extends Behavior {
  constructor() {
    super('deliver_potion', 'Deliver Potion', 50, 0.6);

    this.addPrecondition('Potion bottled', (ws: WorldState) => {
      return ws.matches('potion_bottled', true);
    });

    this.addSuccessTest('Potion delivered', (ws: WorldState) => {
      return ws.matches('potion_delivered', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[DeliverPotion] Handing potion to customer...');

    await this.delay(500);

    worldState.set('potion_delivered', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Customer received potion',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Make potion sequence (success path)
 */
export async function testMakePotionSuccess(): Promise<void> {
  console.log('\n===== Example 1: Make Potion (Success Path) =====\n');

  const worldState = new WorldState();
  worldState.set('ingredients_available', true);

  const makePotionSequence = new SequentialBehavior('make_potion', 'Make Potion', 70, 0.8);

  // Add steps with FAIL strategy (default)
  makePotionSequence.addStep(new GatherIngredientsBehavior(), RecoveryStrategy.FAIL);
  makePotionSequence.addStep(new MixIngredientsBehavior(), RecoveryStrategy.FAIL);
  makePotionSequence.addStep(new BottlePotionBehavior(), RecoveryStrategy.FAIL);
  makePotionSequence.addStep(new DeliverPotionBehavior(), RecoveryStrategy.FAIL);

  console.log('--- Executing Sequence ---');
  const result = await makePotionSequence.execute(worldState);

  console.log('\n===== Result =====');
  console.log('Status:', result.status);
  console.log('Message:', result.message);
  console.log('Potion delivered?', worldState.get('potion_delivered'));
  console.log('Expected: SUCCESS, all steps completed');
}

// ===== EXAMPLE 2: Failed Step with RETRY Strategy =====

/**
 * UnreliableMixingBehavior - Fails first 2 times, succeeds on 3rd
 */
class UnreliableMixingBehavior extends Behavior {
  private static attemptCount = 0;

  constructor() {
    super('unreliable_mix', 'Unreliable Mixing', 50, 0.6);

    this.addPrecondition('Ingredients gathered', (ws: WorldState) => {
      return ws.matches('ingredients_gathered', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    UnreliableMixingBehavior.attemptCount++;

    console.log(`[UnreliableMixing] Attempt ${UnreliableMixingBehavior.attemptCount}...`);

    await this.delay(800);

    if (UnreliableMixingBehavior.attemptCount < 3) {
      console.log('[UnreliableMixing] *mixture explodes* Failed!');
      return {
        status: BehaviorStatus.FAILURE,
        message: 'Mixing failed - wrong temperature',
      };
    }

    console.log('[UnreliableMixing] Success! Perfect mixture!');
    worldState.set('mixture_created', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Mixture created after retries',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static resetAttemptCount(): void {
    UnreliableMixingBehavior.attemptCount = 0;
  }
}

/**
 * Test: Retry failed step
 */
export async function testRetryStrategy(): Promise<void> {
  console.log('\n===== Example 2: Failed Step with RETRY Strategy =====\n');

  UnreliableMixingBehavior.resetAttemptCount();

  const worldState = new WorldState();
  worldState.set('ingredients_available', true);

  const makePotionSequence = new SequentialBehavior('make_potion_retry', 'Make Potion (Retry)', 70, 0.8);

  makePotionSequence.addStep(new GatherIngredientsBehavior(), RecoveryStrategy.FAIL);
  // RETRY strategy with max 3 attempts
  makePotionSequence.addStep(new UnreliableMixingBehavior(), RecoveryStrategy.RETRY, 3);
  makePotionSequence.addStep(new BottlePotionBehavior(), RecoveryStrategy.FAIL);
  makePotionSequence.addStep(new DeliverPotionBehavior(), RecoveryStrategy.FAIL);

  console.log('--- Executing Sequence ---');
  const result = await makePotionSequence.execute(worldState);

  console.log('\n===== Result =====');
  console.log('Status:', result.status);
  console.log('Message:', result.message);
  console.log('State:', result.data?.state);
  console.log('Expected: SUCCESS after retrying mixing step 3 times');
}

// ===== EXAMPLE 3: SKIP Strategy =====

/**
 * OptionalPolishBehavior - Optional step that might fail
 */
class OptionalPolishBehavior extends Behavior {
  constructor() {
    super('polish_bottle', 'Polish Bottle', 50, 0.6);

    this.addPrecondition('Potion bottled', (ws: WorldState) => {
      return ws.matches('potion_bottled', true);
    });

    this.addPrecondition('Polish available', (ws: WorldState) => {
      return ws.matches('polish_available', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[PolishBottle] Making bottle shine...');

    await this.delay(500);

    worldState.set('bottle_polished', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Bottle polished',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Skip optional failed step
 */
export async function testSkipStrategy(): Promise<void> {
  console.log('\n===== Example 3: SKIP Strategy (Optional Step) =====\n');

  const worldState = new WorldState();
  worldState.set('ingredients_available', true);
  worldState.set('polish_available', false); // No polish available

  const makePotionSequence = new SequentialBehavior('make_potion_skip', 'Make Potion (Skip)', 70, 0.8);

  makePotionSequence.addStep(new GatherIngredientsBehavior(), RecoveryStrategy.FAIL);
  makePotionSequence.addStep(new MixIngredientsBehavior(), RecoveryStrategy.FAIL);
  makePotionSequence.addStep(new BottlePotionBehavior(), RecoveryStrategy.FAIL);
  // SKIP strategy for optional polishing
  makePotionSequence.addStep(new OptionalPolishBehavior(), RecoveryStrategy.SKIP);
  makePotionSequence.addStep(new DeliverPotionBehavior(), RecoveryStrategy.FAIL);

  console.log('--- Executing Sequence ---');
  const result = await makePotionSequence.execute(worldState);

  console.log('\n===== Result =====');
  console.log('Status:', result.status);
  console.log('Message:', result.message);
  console.log('Bottle polished?', worldState.get('bottle_polished'));
  console.log('Potion delivered?', worldState.get('potion_delivered'));
  console.log('State:', result.data?.state);
  console.log('Expected: SUCCESS, polish step skipped but delivery succeeded');
}

// ===== EXAMPLE 4: FALLBACK Strategy =====

/**
 * BuyIngredientsBehavior - Fallback when gathering fails
 */
class BuyIngredientsBehavior extends Behavior {
  constructor() {
    super('buy_ingredients', 'Buy Ingredients', 50, 0.6);

    this.addPrecondition('Has money', (ws: WorldState) => {
      return (ws.get('gold') as number) >= 10;
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[BuyIngredients] Purchasing ingredients from merchant...');

    await this.delay(1000);

    const gold = (worldState.get('gold') as number) - 10;
    worldState.set('gold', gold);
    worldState.set('ingredients_gathered', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Bought ingredients for 10 gold',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Fallback to buying ingredients
 */
export async function testFallbackStrategy(): Promise<void> {
  console.log('\n===== Example 4: FALLBACK Strategy =====\n');

  const worldState = new WorldState();
  worldState.set('ingredients_available', false); // Can't gather
  worldState.set('gold', 50); // But has money to buy

  const makePotionSequence = new SequentialBehavior('make_potion_fallback', 'Make Potion (Fallback)', 70, 0.8);

  // FALLBACK strategy: if gathering fails, buy instead
  makePotionSequence.addStep(
    new GatherIngredientsBehavior(),
    RecoveryStrategy.FALLBACK,
    3,
    new BuyIngredientsBehavior()
  );
  makePotionSequence.addStep(new MixIngredientsBehavior(), RecoveryStrategy.FAIL);
  makePotionSequence.addStep(new BottlePotionBehavior(), RecoveryStrategy.FAIL);
  makePotionSequence.addStep(new DeliverPotionBehavior(), RecoveryStrategy.FAIL);

  console.log('--- Executing Sequence ---');
  const result = await makePotionSequence.execute(worldState);

  console.log('\n===== Result =====');
  console.log('Status:', result.status);
  console.log('Message:', result.message);
  console.log('Ingredients gathered?', worldState.get('ingredients_gathered'));
  console.log('Gold remaining:', worldState.get('gold'));
  console.log('Expected: SUCCESS using fallback (bought ingredients)');
}

// ===== EXAMPLE 5: Checkpoints and Resumption =====

/**
 * Test: Resume from checkpoint
 */
export async function testCheckpointResumption(): Promise<void> {
  console.log('\n===== Example 5: Checkpoints and Resumption =====\n');

  const worldState = new WorldState();
  worldState.set('ingredients_available', true);

  const makePotionSequence = new SequentialBehavior('make_potion_checkpoint', 'Make Potion (Checkpoint)', 70, 0.8, true);

  // Add steps with checkpoints
  makePotionSequence.addStep(new GatherIngredientsBehavior(), RecoveryStrategy.FAIL, 3, undefined, 'gathered');
  makePotionSequence.addStep(new MixIngredientsBehavior(), RecoveryStrategy.FAIL, 3, undefined, 'mixed');
  makePotionSequence.addStep(new BottlePotionBehavior(), RecoveryStrategy.FAIL, 3, undefined, 'bottled');
  makePotionSequence.addStep(new DeliverPotionBehavior(), RecoveryStrategy.FAIL, 3, undefined, 'delivered');

  console.log('--- Part 1: Execute first 2 steps ---');
  // Manually advance through first 2 steps
  await new GatherIngredientsBehavior().execute(worldState);
  await new MixIngredientsBehavior().execute(worldState);

  console.log('Progress:', worldState.toObject());
  console.log('\n--- Part 2: Resume from "bottled" checkpoint ---');

  // Resume from bottling step (skipping gather and mix)
  const resumed = makePotionSequence.resumeFromCheckpoint('bottled');
  console.log('Resumed?', resumed);

  if (resumed) {
    const result = await makePotionSequence.execute(worldState);
    console.log('\n===== Result =====');
    console.log('Status:', result.status);
    console.log('Progress:', makePotionSequence.getProgress());
    console.log('Expected: Resumed from checkpoint, completed remaining steps');
  }
}

// ===== EXAMPLE 6: Complex Multi-Stage Quest =====

/**
 * Test: Complex quest with multiple recovery strategies
 */
export async function testComplexQuest(): Promise<void> {
  console.log('\n===== Example 6: Complex Multi-Stage Quest =====\n');

  const worldState = new WorldState();
  worldState.set('ingredients_available', true);
  worldState.set('gold', 100);
  worldState.set('polish_available', false);

  UnreliableMixingBehavior.resetAttemptCount();

  const questSequence = new SequentialBehavior('complex_quest', 'Deliver Healing Potion Quest', 80, 0.9);

  console.log('Quest Steps:');
  console.log('  1. Gather ingredients (FALLBACK to buying if fails)');
  console.log('  2. Mix ingredients (RETRY up to 3 times if fails)');
  console.log('  3. Bottle potion (FAIL if fails - critical step)');
  console.log('  4. Polish bottle (SKIP if fails - optional)');
  console.log('  5. Deliver potion (FAIL if fails - critical step)');
  console.log('');

  questSequence.addStep(
    new GatherIngredientsBehavior(),
    RecoveryStrategy.FALLBACK,
    3,
    new BuyIngredientsBehavior(),
    'gathered'
  );

  questSequence.addStep(
    new UnreliableMixingBehavior(),
    RecoveryStrategy.RETRY,
    3,
    undefined,
    'mixed'
  );

  questSequence.addStep(
    new BottlePotionBehavior(),
    RecoveryStrategy.FAIL,
    3,
    undefined,
    'bottled'
  );

  questSequence.addStep(
    new OptionalPolishBehavior(),
    RecoveryStrategy.SKIP,
    3,
    undefined,
    'polished'
  );

  questSequence.addStep(
    new DeliverPotionBehavior(),
    RecoveryStrategy.FAIL,
    3,
    undefined,
    'delivered'
  );

  console.log('--- Executing Quest ---');
  const result = await questSequence.execute(worldState);

  console.log('\n===== Result =====');
  console.log('Status:', result.status);
  console.log('Message:', result.message);
  console.log('Final State:', result.data?.state);
  console.log('\nQuest Outcomes:');
  console.log('  - Ingredients gathered:', worldState.get('ingredients_gathered'));
  console.log('  - Mixture created:', worldState.get('mixture_created'));
  console.log('  - Potion bottled:', worldState.get('potion_bottled'));
  console.log('  - Bottle polished:', worldState.get('bottle_polished') || false);
  console.log('  - Potion delivered:', worldState.get('potion_delivered'));
  console.log('  - Gold remaining:', worldState.get('gold'));
}

// ===== RUN ALL EXAMPLES =====

export async function runAllSequentialExamples(): Promise<void> {
  await testMakePotionSuccess();
  await new Promise(r => setTimeout(r, 1000));

  await testRetryStrategy();
  await new Promise(r => setTimeout(r, 1000));

  await testSkipStrategy();
  await new Promise(r => setTimeout(r, 1000));

  await testFallbackStrategy();
  await new Promise(r => setTimeout(r, 1000));

  await testCheckpointResumption();
  await new Promise(r => setTimeout(r, 1000));

  await testComplexQuest();
}

// Run if executed directly
if (require.main === module) {
  runAllSequentialExamples().catch(console.error);
}
