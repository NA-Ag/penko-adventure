/**
 * ParallelExamples - FACADE 3.8
 *
 * Examples demonstrating parallel behavior execution.
 *
 * NPCs can perform multiple actions simultaneously:
 * - Talk while gesturing
 * - Walk while thinking
 * - Monitor environment while working
 *
 * Completion strategies:
 * - ALL: All tasks must succeed
 * - ANY: At least one task must succeed
 * - MAJORITY: More than half must succeed
 * - FIRST: First to complete wins
 */

import { Behavior, BehaviorStatus, BehaviorResult } from '../Behavior';
import { WorldState } from '../WorldState';
import {
  ParallelBehavior,
  ParallelCompletionStrategy,
  ConflictResolution,
} from '../ParallelBehavior';

// ===== EXAMPLE 1: NPC Talks While Gesturing =====

/**
 * SayGreetingBehavior - Verbal greeting
 */
class SayGreetingBehavior extends Behavior {
  constructor() {
    super('say_greeting', 'Say Greeting', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[SayGreeting] "Welcome, friend! Good to see you!"');

    await this.delay(2000); // Speech takes 2 seconds

    worldState.set('said_greeting', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Greeting spoken',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * GestureWaveBehavior - Wave hand gesture
 */
class GestureWaveBehavior extends Behavior {
  constructor() {
    super('gesture_wave', 'Wave Hand', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[GestureWave] *waves hand enthusiastically*');

    await this.delay(1500); // Gesture takes 1.5 seconds

    worldState.set('waved_hand', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Waved hand',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * GestureSmileBehavior - Smile facial expression
 */
class GestureSmileBehavior extends Behavior {
  constructor() {
    super('gesture_smile', 'Smile', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[GestureSmile] *smiles warmly*');

    await this.delay(1000); // Smile takes 1 second

    worldState.set('smiled', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Smiled',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Talk while gesturing
 */
export async function testTalkWhileGesturing(): Promise<void> {
  console.log('\n===== Example 1: NPC Talks While Gesturing =====\n');

  const worldState = new WorldState();

  const greetPlayer = new ParallelBehavior(
    'greet_player',
    'Greet Player (Speech + Gestures)',
    60,
    0.8,
    ParallelCompletionStrategy.ALL // All must complete
  );

  // Add parallel tasks (no resource conflicts)
  greetPlayer.addTask(new SayGreetingBehavior()); // Uses voice
  greetPlayer.addTask(new GestureWaveBehavior()); // Uses hands
  greetPlayer.addTask(new GestureSmileBehavior()); // Uses face

  console.log('--- Executing Parallel Greeting ---');
  const result = await greetPlayer.execute(worldState);

  console.log('\n===== Result =====');
  console.log('Status:', result.status);
  console.log('Message:', result.message);
  console.log('Said greeting?', worldState.get('said_greeting'));
  console.log('Waved hand?', worldState.get('waved_hand'));
  console.log('Smiled?', worldState.get('smiled'));
  console.log('Expected: All three actions completed simultaneously');
}

// ===== EXAMPLE 2: Walk to Bar While Greeting Player =====

/**
 * WalkToBarBehavior - Movement behavior
 */
class WalkToBarBehavior extends Behavior {
  constructor() {
    super('walk_to_bar', 'Walk to Bar', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[WalkToBar] *walking towards the bar...*');

    const distance = 10;
    for (let i = 0; i < distance; i++) {
      await this.delay(300);
      console.log(`[WalkToBar] Step ${i + 1}/${distance}`);
    }

    worldState.set('location', 'bar');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Arrived at bar',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * CallOutGreetingBehavior - Shout greeting while moving
 */
class CallOutGreetingBehavior extends Behavior {
  constructor() {
    super('call_out', 'Call Out Greeting', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[CallOut] "Hey! I\'ll be right there!"');

    await this.delay(1500);

    worldState.set('called_out', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Called out greeting',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Walk while greeting
 */
export async function testWalkWhileGreeting(): Promise<void> {
  console.log('\n===== Example 2: Walk to Bar While Greeting Player =====\n');

  const worldState = new WorldState();
  worldState.set('location', 'entrance');

  const approachPlayer = new ParallelBehavior(
    'approach_player',
    'Approach Player',
    60,
    0.8,
    ParallelCompletionStrategy.ALL
  );

  // Walk and talk simultaneously
  approachPlayer.addTask(new WalkToBarBehavior(), ['legs']); // Uses legs
  approachPlayer.addTask(new CallOutGreetingBehavior(), ['voice']); // Uses voice

  console.log('--- Executing Parallel Approach ---');
  const result = await approachPlayer.execute(worldState);

  console.log('\n===== Result =====');
  console.log('Status:', result.status);
  console.log('Final location:', worldState.get('location'));
  console.log('Called out?', worldState.get('called_out'));
  console.log('Expected: NPC arrived at bar while calling out greeting');
}

// ===== EXAMPLE 3: Think While Working (Background Behaviors) =====

/**
 * MixDrinkBehavior - Primary task
 */
class MixDrinkBehavior extends Behavior {
  constructor() {
    super('mix_drink', 'Mix Drink', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[MixDrink] *mixing ingredients carefully...*');

    await this.delay(2500);

    worldState.set('drink_mixed', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Drink mixed',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * ThinkAboutDayBehavior - Background thinking
 */
class ThinkAboutDayBehavior extends Behavior {
  constructor() {
    super('think_about_day', 'Think About Day', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[ThinkAboutDay] (thinking: "I should close early today...")');

    await this.delay(1500);

    worldState.set('thought_about_day', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Contemplated plans',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * MonitorEnvironmentBehavior - Background awareness
 */
class MonitorEnvironmentBehavior extends Behavior {
  constructor() {
    super('monitor_env', 'Monitor Environment', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[MonitorEnv] (watching door, listening for sounds...)');

    await this.delay(2000);

    worldState.set('monitored_environment', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Environment monitored',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Multiple background behaviors
 */
export async function testMultipleBackgroundBehaviors(): Promise<void> {
  console.log('\n===== Example 3: Think While Working (Background Behaviors) =====\n');

  const worldState = new WorldState();

  const workAndThink = new ParallelBehavior(
    'work_and_think',
    'Work and Think',
    60,
    0.8,
    ParallelCompletionStrategy.ALL
  );

  // Primary task + background tasks
  workAndThink.addTask(new MixDrinkBehavior(), ['hands']); // Primary
  workAndThink.addTask(new ThinkAboutDayBehavior(), ['mind'], true); // Background (optional)
  workAndThink.addTask(new MonitorEnvironmentBehavior(), ['attention'], true); // Background (optional)

  console.log('--- Executing Work + Background Tasks ---');
  const result = await workAndThink.execute(worldState);

  console.log('\n===== Result =====');
  console.log('Status:', result.status);
  console.log('Drink mixed?', worldState.get('drink_mixed'));
  console.log('Thought about day?', worldState.get('thought_about_day'));
  console.log('Monitored environment?', worldState.get('monitored_environment'));
  console.log('Expected: All tasks completed in parallel');
}

// ===== EXAMPLE 4: Resource Conflicts =====

/**
 * SpeakToCustomerBehavior - Uses voice
 */
class SpeakToCustomerBehavior extends Behavior {
  constructor() {
    super('speak_customer', 'Speak to Customer', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[SpeakToCustomer] "What can I get for you?"');

    await this.delay(1500);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Spoke to customer',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * SingToSelfBehavior - Also uses voice (CONFLICT!)
 */
class SingToSelfBehavior extends Behavior {
  constructor() {
    super('sing_self', 'Sing to Self', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[SingToSelf] *humming a tune*');

    await this.delay(1500);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Sang quietly',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Resource conflict detection
 */
export async function testResourceConflicts(): Promise<void> {
  console.log('\n===== Example 4: Resource Conflicts =====\n');

  const worldState = new WorldState();

  console.log('--- Test A: ALLOW conflicts (default) ---');

  const allowConflicts = new ParallelBehavior(
    'allow_conflicts',
    'Allow Conflicts',
    60,
    0.8,
    ParallelCompletionStrategy.ALL,
    ConflictResolution.ALLOW
  );

  allowConflicts.addTask(new SpeakToCustomerBehavior(), ['voice']);
  allowConflicts.addTask(new SingToSelfBehavior(), ['voice']); // CONFLICT!

  let result = await allowConflicts.execute(worldState);
  console.log('Result:', result.status, '-', result.message);
  console.log('Expected: Both executed (conflict allowed)\n');

  console.log('--- Test B: CANCEL conflicting tasks ---');

  const cancelConflicts = new ParallelBehavior(
    'cancel_conflicts',
    'Cancel Conflicts',
    60,
    0.8,
    ParallelCompletionStrategy.ALL,
    ConflictResolution.CANCEL_CONFLICTS
  );

  cancelConflicts.addTask(new SpeakToCustomerBehavior(), ['voice']);
  cancelConflicts.addTask(new SingToSelfBehavior(), ['voice']); // CONFLICT!
  cancelConflicts.addTask(new GestureWaveBehavior(), ['hands']); // No conflict

  result = await cancelConflicts.execute(worldState);
  console.log('Result:', result.status, '-', result.message);
  console.log('Expected: Conflicting voice tasks cancelled, gesture executed\n');

  console.log('--- Test C: FAIL on conflict ---');

  const failOnConflict = new ParallelBehavior(
    'fail_on_conflict',
    'Fail on Conflict',
    60,
    0.8,
    ParallelCompletionStrategy.ALL,
    ConflictResolution.FAIL_ON_CONFLICT
  );

  failOnConflict.addTask(new SpeakToCustomerBehavior(), ['voice']);
  failOnConflict.addTask(new SingToSelfBehavior(), ['voice']); // CONFLICT!

  result = await failOnConflict.execute(worldState);
  console.log('Result:', result.status, '-', result.message);
  console.log('Expected: FAILURE due to conflict');
}

// ===== EXAMPLE 5: Completion Strategies =====

/**
 * FastTaskBehavior - Completes quickly
 */
class FastTaskBehavior extends Behavior {
  constructor(id: string = 'fast_task') {
    super(id, 'Fast Task', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[FastTask] Starting...');

    await this.delay(500);

    console.log('[FastTask] Done!');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Fast task completed',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * SlowTaskBehavior - Takes longer
 */
class SlowTaskBehavior extends Behavior {
  constructor(id: string = 'slow_task') {
    super(id, 'Slow Task', 50, 0.6);
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[SlowTask] Starting...');

    await this.delay(2000);

    console.log('[SlowTask] Done!');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Slow task completed',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Different completion strategies
 */
export async function testCompletionStrategies(): Promise<void> {
  console.log('\n===== Example 5: Completion Strategies =====\n');

  const worldState = new WorldState();

  console.log('--- Strategy: FIRST (race condition) ---');

  const firstStrategy = new ParallelBehavior(
    'first_wins',
    'First Wins',
    60,
    0.8,
    ParallelCompletionStrategy.FIRST
  );

  firstStrategy.addTask(new FastTaskBehavior('fast1'));
  firstStrategy.addTask(new SlowTaskBehavior('slow1'));

  let result = await firstStrategy.execute(worldState);
  console.log('Result:', result.status, '-', result.message);
  console.log('Expected: Fast task wins\n');

  console.log('--- Strategy: ANY (at least one succeeds) ---');

  const anyStrategy = new ParallelBehavior(
    'any_succeeds',
    'Any Succeeds',
    60,
    0.8,
    ParallelCompletionStrategy.ANY
  );

  anyStrategy.addTask(new FastTaskBehavior('fast2'));
  anyStrategy.addTask(new SlowTaskBehavior('slow2'));

  result = await anyStrategy.execute(worldState);
  console.log('Result:', result.status, '-', result.message);
  console.log('State:', result.data?.state);
  console.log('Expected: SUCCESS (at least one succeeded)\n');

  console.log('--- Strategy: MAJORITY (more than half) ---');

  const majorityStrategy = new ParallelBehavior(
    'majority_wins',
    'Majority Wins',
    60,
    0.8,
    ParallelCompletionStrategy.MAJORITY
  );

  majorityStrategy.addTask(new FastTaskBehavior('fast3'));
  majorityStrategy.addTask(new FastTaskBehavior('fast4'));
  majorityStrategy.addTask(new SlowTaskBehavior('slow3'));

  result = await majorityStrategy.execute(worldState);
  console.log('Result:', result.status, '-', result.message);
  console.log('State:', result.data?.state);
  console.log('Expected: SUCCESS (2/3 succeeded)');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllParallelExamples(): Promise<void> {
  await testTalkWhileGesturing();
  await new Promise(r => setTimeout(r, 1000));

  await testWalkWhileGreeting();
  await new Promise(r => setTimeout(r, 1000));

  await testMultipleBackgroundBehaviors();
  await new Promise(r => setTimeout(r, 1000));

  await testResourceConflicts();
  await new Promise(r => setTimeout(r, 1000));

  await testCompletionStrategies();
}

// Run if executed directly
if (require.main === module) {
  runAllParallelExamples().catch(console.error);
}
