/**
 * PriorityExamples - FACADE 3.5
 *
 * Examples demonstrating behavior priority system with preemption.
 *
 * Priority ranges:
 * - 90-100: CRITICAL (life/death, urgent danger)
 * - 70-89:  HIGH (important goals, social obligations)
 * - 40-69:  MEDIUM (normal activities, daily tasks)
 * - 20-39:  LOW (idle behaviors, background activities)
 * - 1-19:   TRIVIAL (filler, ambient actions)
 *
 * Key concepts:
 * - Higher priority behaviors can preempt lower priority ones
 * - Preemption threshold prevents constant interruption
 * - Non-preemptable behaviors cannot be interrupted
 */

import { Behavior, BehaviorStatus, BehaviorResult } from '../Behavior';
import { Goal, GoalPriority } from '../Goal';
import { WorldState } from '../WorldState';
import { BehaviorTree, ExecutionStrategy } from '../BehaviorTree';
import { PriorityLevel, PriorityManager } from '../PriorityManager';

// ===== EXAMPLE 1: Flee from Danger Preempts Serve Drink =====

/**
 * ServeDrinkBehavior - Medium priority (50)
 * Takes time to prepare and serve a drink
 */
class ServeDrinkBehavior extends Behavior {
  constructor() {
    super('serve_drink', 'Serve Drink', 50, 0.7);

    this.addPrecondition('Has active order', (ws: WorldState) => {
      return ws.has('active_drink_order');
    });

    this.addSuccessTest('Drink served', (ws: WorldState) => {
      return ws.matches('drink_served', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[ServeDrink] Starting to prepare drink...');

    // Simulate drink preparation (5 seconds)
    for (let i = 0; i < 5; i++) {
      await this.delay(1000);
      console.log(`[ServeDrink] Preparing... ${i + 1}/5`);
    }

    worldState.set('drink_served', true);
    worldState.delete('active_drink_order');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Drink served successfully',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * FleeFromDangerBehavior - Critical priority (95)
 * Immediately flee when danger is detected
 */
class FleeFromDangerBehavior extends Behavior {
  constructor() {
    super('flee_danger', 'Flee from Danger', PriorityLevel.CRITICAL, 0.9);

    this.addPrecondition('Danger detected', (ws: WorldState) => {
      return ws.matches('danger_present', true);
    });

    this.addSuccessTest('Reached safety', (ws: WorldState) => {
      return ws.matches('player_location', 'safe_room');
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[FleeFromDanger] DANGER! Running to safety!');

    await this.delay(2000);

    worldState.set('player_location', 'safe_room');
    worldState.set('danger_present', false);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Reached safety',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Flee from danger preempts serving drink
 */
export async function testFleePreemptsServe(): Promise<void> {
  console.log('\n===== Example 1: Flee from Danger Preempts Serve Drink =====\n');

  const worldState = new WorldState();
  worldState.set('active_drink_order', 'beer');
  worldState.set('player_location', 'bar');

  const tree = new BehaviorTree('bartender', worldState, ExecutionStrategy.PRIORITY);

  const goal = new Goal('serve_customers', 'Serve Customers', 'Keep customers happy', GoalPriority.NORMAL);
  goal.addSatisfyingBehavior(new ServeDrinkBehavior());
  goal.addSatisfyingBehavior(new FleeFromDangerBehavior());
  goal.activate();

  tree.addGoal(goal);

  // Tick 1: Start serving drink
  console.log('\n--- Tick 1: Start serving ---');
  const promise1 = tree.tick();

  // Wait 2 seconds, then introduce danger
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('\n⚠️  DANGER APPEARS! ⚠️\n');
  worldState.set('danger_present', true);

  // Tick 2: Flee should preempt serve
  console.log('\n--- Tick 2: Danger detected ---');
  await tree.tick();

  console.log('\n===== Result =====');
  console.log('Final location:', worldState.get('player_location'));
  console.log('Drink served?', worldState.get('drink_served'));
  console.log('Expected: Bartender fled to safety, drink NOT served');
}

// ===== EXAMPLE 2: Social Behaviors with Medium Priority =====

/**
 * GreetPlayerBehavior - High priority (75)
 */
class GreetPlayerBehavior extends Behavior {
  constructor() {
    super('greet_player', 'Greet Player', 75, 0.8);

    this.addPrecondition('Player nearby', (ws: WorldState) => {
      const distance = ws.get('player_distance') as number;
      return distance <= 5;
    });

    this.addPrecondition('Not yet greeted', (ws: WorldState) => {
      return !ws.matches('greeted_player', true);
    });

    this.addSuccessTest('Greeting complete', (ws: WorldState) => {
      return ws.matches('greeted_player', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[GreetPlayer] Hello there! Welcome!');

    await this.delay(1000);

    worldState.set('greeted_player', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Player greeted',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * CleanBarBehavior - Low priority (30)
 */
class CleanBarBehavior extends Behavior {
  constructor() {
    super('clean_bar', 'Clean Bar', 30, 0.4);

    this.addPrecondition('Bar is dirty', (ws: WorldState) => {
      return ws.matches('bar_clean', false);
    });

    this.addSuccessTest('Bar cleaned', (ws: WorldState) => {
      return ws.matches('bar_clean', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[CleanBar] *wipes down the bar*');

    await this.delay(3000);

    worldState.set('bar_clean', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Bar is clean',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Greeting preempts cleaning
 */
export async function testGreetPreemptsClean(): Promise<void> {
  console.log('\n===== Example 2: Social Behavior Preempts Idle Task =====\n');

  const worldState = new WorldState();
  worldState.set('bar_clean', false);
  worldState.set('player_distance', 20); // Player far away
  worldState.set('greeted_player', false);

  const tree = new BehaviorTree('bartender', worldState, ExecutionStrategy.PRIORITY);

  const goal = new Goal('stay_busy', 'Stay Busy', 'Keep the bar running', GoalPriority.NORMAL);
  goal.addSatisfyingBehavior(new GreetPlayerBehavior());
  goal.addSatisfyingBehavior(new CleanBarBehavior());
  goal.activate();

  tree.addGoal(goal);

  // Tick 1: Start cleaning (player far away)
  console.log('\n--- Tick 1: Start cleaning ---');
  const promise1 = tree.tick();

  // Wait 1 second, then player approaches
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('\n👤 Player approaches! 👤\n');
  worldState.set('player_distance', 3);

  // Tick 2: Greeting should preempt cleaning
  console.log('\n--- Tick 2: Player nearby ---');
  await tree.tick();

  console.log('\n===== Result =====');
  console.log('Player greeted?', worldState.get('greeted_player'));
  console.log('Bar clean?', worldState.get('bar_clean'));
  console.log('Expected: Player greeted, bar cleaning interrupted');
}

// ===== EXAMPLE 3: Non-Preemptable Atomic Action =====

/**
 * LockDoorBehavior - High priority, NON-preemptable
 * Once started, must complete (atomic action)
 */
class LockDoorBehavior extends Behavior {
  constructor() {
    super('lock_door', 'Lock Door', 80, 0.9);

    // Mark as non-preemptable
    this.setPreemptable(false);

    this.addPrecondition('Door is unlocked', (ws: WorldState) => {
      return ws.matches('door_locked', false);
    });

    this.addSuccessTest('Door locked', (ws: WorldState) => {
      return ws.matches('door_locked', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[LockDoor] Turning key in lock... (cannot be interrupted!)');

    await this.delay(2000);

    worldState.set('door_locked', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Door securely locked',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * AnswerPhoneBehavior - Critical priority (95)
 */
class AnswerPhoneBehavior extends Behavior {
  constructor() {
    super('answer_phone', 'Answer Phone', PriorityLevel.CRITICAL, 0.9);

    this.addPrecondition('Phone ringing', (ws: WorldState) => {
      return ws.matches('phone_ringing', true);
    });

    this.addSuccessTest('Call answered', (ws: WorldState) => {
      return ws.matches('phone_answered', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[AnswerPhone] Hello? Yes, this is...');

    await this.delay(1000);

    worldState.set('phone_answered', true);
    worldState.set('phone_ringing', false);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Call answered',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Non-preemptable behavior cannot be interrupted
 */
export async function testNonPreemptableBehavior(): Promise<void> {
  console.log('\n===== Example 3: Non-Preemptable Atomic Action =====\n');

  const worldState = new WorldState();
  worldState.set('door_locked', false);
  worldState.set('phone_ringing', false);

  const tree = new BehaviorTree('security_guard', worldState, ExecutionStrategy.PRIORITY);

  const goal = new Goal('security', 'Security Tasks', 'Keep building secure', GoalPriority.HIGH);
  goal.addSatisfyingBehavior(new LockDoorBehavior());
  goal.addSatisfyingBehavior(new AnswerPhoneBehavior());
  goal.activate();

  tree.addGoal(goal);

  // Tick 1: Start locking door
  console.log('\n--- Tick 1: Start locking door ---');
  const promise1 = tree.tick();

  // Wait 500ms, then phone rings
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('\n📞 PHONE RINGS! 📞\n');
  worldState.set('phone_ringing', true);

  // Tick 2: Phone should NOT preempt lock (non-preemptable)
  console.log('\n--- Tick 2: Phone ringing (critical priority) ---');
  await tree.tick();

  console.log('\n===== Result =====');
  console.log('Door locked?', worldState.get('door_locked'));
  console.log('Phone answered?', worldState.get('phone_answered'));
  console.log('Expected: Door locked FIRST (non-preemptable), phone still ringing');
}

// ===== EXAMPLE 4: Preemption Threshold Prevents Thrashing =====

/**
 * Test: Priority difference must exceed threshold
 */
export async function testPreemptionThreshold(): Promise<void> {
  console.log('\n===== Example 4: Preemption Threshold Prevents Thrashing =====\n');

  const worldState = new WorldState();

  // Create custom priority manager with threshold of 25
  const priorityManager = new PriorityManager({
    preemptionThreshold: 25,
    allowPreemption: true,
    onPriorityChange: (event) => {
      if (event.preempted) {
        console.log(
          `⚡ PREEMPTED: "${event.oldBehavior?.name}" (${event.oldBehavior?.priority}) → "${event.newBehavior.name}" (${event.newBehavior.priority})`
        );
      } else {
        console.log(`✓ Selected: "${event.newBehavior.name}" (${event.newBehavior.priority})`);
      }
    },
  });

  const tree = new BehaviorTree('npc', worldState, ExecutionStrategy.PRIORITY, priorityManager);

  // Create behaviors with small priority differences
  class Task1 extends Behavior {
    constructor() {
      super('task1', 'Task 1', 50, 0.5);
      this.addPrecondition('Can do task 1', (ws) => ws.matches('task1_available', true));
    }
    protected async performBehavior(ws: WorldState): Promise<BehaviorResult> {
      console.log('[Task1] Working...');
      await new Promise(r => setTimeout(r, 1000));
      return { status: BehaviorStatus.SUCCESS };
    }
  }

  class Task2 extends Behavior {
    constructor() {
      super('task2', 'Task 2', 65, 0.5); // +15 priority (below threshold of 25)
      this.addPrecondition('Can do task 2', (ws) => ws.matches('task2_available', true));
    }
    protected async performBehavior(ws: WorldState): Promise<BehaviorResult> {
      console.log('[Task2] Working...');
      await new Promise(r => setTimeout(r, 1000));
      return { status: BehaviorStatus.SUCCESS };
    }
  }

  class Task3 extends Behavior {
    constructor() {
      super('task3', 'Task 3', 80, 0.5); // +30 priority (EXCEEDS threshold of 25)
      this.addPrecondition('Can do task 3', (ws) => ws.matches('task3_available', true));
    }
    protected async performBehavior(ws: WorldState): Promise<BehaviorResult> {
      console.log('[Task3] Working...');
      await new Promise(r => setTimeout(r, 1000));
      return { status: BehaviorStatus.SUCCESS };
    }
  }

  const goal = new Goal('tasks', 'Tasks', 'Complete tasks', GoalPriority.NORMAL);
  goal.addSatisfyingBehavior(new Task1());
  goal.addSatisfyingBehavior(new Task2());
  goal.addSatisfyingBehavior(new Task3());
  goal.activate();

  tree.addGoal(goal);

  worldState.set('task1_available', true);

  console.log('\n--- Tick 1: Start Task 1 (priority 50) ---');
  const p1 = tree.tick();

  await new Promise(r => setTimeout(r, 500));
  worldState.set('task2_available', true);

  console.log('\n--- Tick 2: Task 2 available (priority 65, diff +15) ---');
  await tree.tick();
  console.log('Expected: Task 1 CONTINUES (diff 15 < threshold 25)');

  await new Promise(r => setTimeout(r, 500));
  worldState.set('task3_available', true);

  console.log('\n--- Tick 3: Task 3 available (priority 80, diff +30) ---');
  await tree.tick();
  console.log('Expected: Task 1 PREEMPTED (diff 30 > threshold 25)');

  console.log('\n===== Complete =====');
}

// ===== EXAMPLE 5: Priority Levels in Practice =====

export async function testPriorityLevels(): Promise<void> {
  console.log('\n===== Example 5: Priority Levels in Practice =====\n');

  console.log('Priority Levels:');
  console.log('  CRITICAL (95):  Flee from danger, save life');
  console.log('  HIGH (80):      Serve VIP, fulfill promise');
  console.log('  MEDIUM (50):    Serve drink, have conversation');
  console.log('  LOW (30):       Clean bar, idle chitchat');
  console.log('  TRIVIAL (10):   Look around, ambient gesture');

  console.log('\nPreemption Example:');
  console.log('  • TRIVIAL (10) → LOW (30):       +20 (may not preempt if threshold is 25)');
  console.log('  • LOW (30) → MEDIUM (50):        +20 (may not preempt if threshold is 25)');
  console.log('  • MEDIUM (50) → HIGH (80):       +30 (WILL preempt with threshold 25)');
  console.log('  • HIGH (80) → CRITICAL (95):     +15 (may not preempt if threshold is 25)');
  console.log('  • MEDIUM (50) → CRITICAL (95):   +45 (WILL preempt)');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllPriorityExamples(): Promise<void> {
  await testFleePreemptsServe();
  await new Promise(r => setTimeout(r, 1000));

  await testGreetPreemptsClean();
  await new Promise(r => setTimeout(r, 1000));

  await testNonPreemptableBehavior();
  await new Promise(r => setTimeout(r, 1000));

  await testPreemptionThreshold();
  await new Promise(r => setTimeout(r, 1000));

  await testPriorityLevels();
}

// Run if executed directly
if (require.main === module) {
  runAllPriorityExamples().catch(console.error);
}
