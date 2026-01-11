/**
 * SpecificityExamples - FACADE 3.6
 *
 * Examples demonstrating behavior specificity ranking.
 *
 * Key principle: More specific behaviors override generic fallback behaviors.
 *
 * Specificity hierarchy:
 * 1. Specific target + specific parameters + specific context (most specific)
 * 2. Specific target + specific parameters
 * 3. Specific target type + specific parameters
 * 4. Specific parameters only
 * 5. Generic behavior (least specific)
 *
 * Examples:
 * - "Greet the player character" > "Greet anyone"
 * - "Serve beer to wizard" > "Serve drink to customer"
 * - "Talk to friend at bar" > "Talk to anyone anywhere"
 */

import { Behavior, BehaviorStatus, BehaviorResult } from '../Behavior';
import { Goal, GoalPriority } from '../Goal';
import { WorldState } from '../WorldState';
import { BehaviorTree, ExecutionStrategy } from '../BehaviorTree';
import { SpecificityMatcher } from '../SpecificityMatcher';

// ===== EXAMPLE 1: Greet Specific Character vs Anyone =====

/**
 * GreetPlayerBehavior - Specific to player character
 * High specificity (0.9) - targets specific character
 */
class GreetPlayerBehavior extends Behavior {
  constructor() {
    super('greet_player', 'Greet Player Character', 60, 0.9);

    // Set specificity criteria: specific target "player"
    this.setSpecificityCriteria(SpecificityMatcher.forSpecificTarget('player'));

    this.addPrecondition('Player nearby', (ws: WorldState) => {
      return ws.has('player');
    });

    this.addSuccessTest('Player greeted', (ws: WorldState) => {
      return ws.matches('greeted_player', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[GreetPlayer] Well hello there, brave adventurer! Welcome back!');

    await this.delay(1000);

    worldState.set('greeted_player', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Player greeted with personalized message',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * GreetAnyoneBehavior - Generic greeting
 * Low specificity (0.2) - accepts any target
 */
class GreetAnyoneBehavior extends Behavior {
  constructor() {
    super('greet_anyone', 'Greet Anyone', 60, 0.2);

    // Set specificity criteria: generic (any target)
    this.setSpecificityCriteria(SpecificityMatcher.generic());

    this.addSuccessTest('Someone greeted', (ws: WorldState) => {
      return ws.matches('greeted_someone', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[GreetAnyone] Hello there.');

    await this.delay(1000);

    worldState.set('greeted_someone', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Generic greeting given',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Specific greeting preferred over generic
 */
export async function testGreetPlayerVsAnyone(): Promise<void> {
  console.log('\n===== Example 1: Greet Player Character > Greet Anyone =====\n');

  const worldState = new WorldState();
  worldState.set('player', true);

  const tree = new BehaviorTree('bartender', worldState, ExecutionStrategy.PRIORITY);

  const goal = new Goal('be_social', 'Be Social', 'Greet visitors', GoalPriority.NORMAL);

  const greetPlayer = new GreetPlayerBehavior();
  const greetAnyone = new GreetAnyoneBehavior();

  // Calculate specificity scores
  const playerScore = greetPlayer.calculateSpecificityScore(worldState, 'player');
  const anyoneScore = greetAnyone.calculateSpecificityScore(worldState, 'player');

  console.log(`GreetPlayer specificity: ${playerScore.toFixed(2)}`);
  console.log(`GreetAnyone specificity: ${anyoneScore.toFixed(2)}`);
  console.log(`Winner: ${playerScore > anyoneScore ? 'GreetPlayer' : 'GreetAnyone'}\n`);

  goal.addSatisfyingBehavior(greetPlayer);
  goal.addSatisfyingBehavior(greetAnyone);
  goal.activate();

  tree.addGoal(goal);

  console.log('--- Executing ---');
  await tree.tick();

  console.log('\n===== Result =====');
  console.log('Expected: Specific player greeting used (higher specificity)');
}

// ===== EXAMPLE 2: Serve Beer to Wizard vs Serve Drink to Customer =====

/**
 * ServeBeerToWizardBehavior - Specific drink + specific target type
 */
class ServeBeerToWizardBehavior extends Behavior {
  constructor() {
    super('serve_beer_wizard', 'Serve Beer to Wizard', 55, 0.8);

    // Specific target type + specific parameter
    const criteria = SpecificityMatcher.forTargetType('wizard');
    criteria.parameters = { drink: 'beer' };
    this.setSpecificityCriteria(criteria);

    this.addPrecondition('Customer is wizard', (ws: WorldState) => {
      return ws.matches('customer_type', 'wizard');
    });

    this.addSuccessTest('Beer served', (ws: WorldState) => {
      return ws.matches('drink_served', 'beer');
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[ServeBeerToWizard] Here\'s a frothy brew, oh wise one! Best mead in the realm!');

    await this.delay(1000);

    worldState.set('drink_served', 'beer');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Beer served to wizard with special message',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * ServeDrinkToCustomerBehavior - Generic drink serving
 */
class ServeDrinkToCustomerBehavior extends Behavior {
  constructor() {
    super('serve_drink_customer', 'Serve Drink to Customer', 55, 0.3);

    // Generic serving
    this.setSpecificityCriteria(SpecificityMatcher.generic());

    this.addSuccessTest('Drink served', (ws: WorldState) => {
      return ws.has('drink_served');
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[ServeDrinkToCustomer] Here you go.');

    await this.delay(1000);

    worldState.set('drink_served', 'generic_drink');

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Generic drink served',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Specific serving preferred
 */
export async function testServeBeerToWizard(): Promise<void> {
  console.log('\n===== Example 2: Serve Beer to Wizard > Serve Drink to Customer =====\n');

  const worldState = new WorldState();
  worldState.set('customer_type', 'wizard');
  worldState.set('customer_id', 'gandalf');

  const tree = new BehaviorTree('bartender', worldState, ExecutionStrategy.PRIORITY);

  const goal = new Goal('serve_customers', 'Serve Customers', 'Serve drinks', GoalPriority.NORMAL);

  const serveBeerToWizard = new ServeBeerToWizardBehavior();
  const serveDrinkToCustomer = new ServeDrinkToCustomerBehavior();

  const beerScore = serveBeerToWizard.calculateSpecificityScore(
    worldState,
    'gandalf',
    { drink: 'beer' }
  );
  const genericScore = serveDrinkToCustomer.calculateSpecificityScore(
    worldState,
    'gandalf',
    { drink: 'beer' }
  );

  console.log(`ServeBeerToWizard specificity: ${beerScore.toFixed(2)}`);
  console.log(`ServeDrinkToCustomer specificity: ${genericScore.toFixed(2)}`);
  console.log(`Winner: ${beerScore > genericScore ? 'ServeBeerToWizard' : 'ServeDrinkToCustomer'}\n`);

  goal.addSatisfyingBehavior(serveBeerToWizard);
  goal.addSatisfyingBehavior(serveDrinkToCustomer);
  goal.activate();

  tree.addGoal(goal);

  console.log('--- Executing ---');
  await tree.tick();

  console.log('\n===== Result =====');
  console.log('Expected: Specific wizard serving used (target type + parameters)');
}

// ===== EXAMPLE 3: Talk to Friend at Bar vs Talk to Anyone Anywhere =====

/**
 * TalkToFriendAtBarBehavior - Specific relationship + specific context
 */
class TalkToFriendAtBarBehavior extends Behavior {
  constructor() {
    super('talk_friend_bar', 'Talk to Friend at Bar', 50, 0.85);

    // Specific relationship + specific context
    const criteria = SpecificityMatcher.withRelationship('friend');
    criteria.contextRequirements = ['at_bar'];
    this.setSpecificityCriteria(criteria);

    this.addPrecondition('Friend at bar', (ws: WorldState) => {
      return ws.matches('at_bar', true);
    });

    this.addSuccessTest('Conversation had', (ws: WorldState) => {
      return ws.matches('talked_to_friend', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(
      '[TalkToFriendAtBar] Hey buddy! *slaps on back* Let me pour you the good stuff!'
    );

    await this.delay(1000);

    worldState.set('talked_to_friend', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Friendly conversation at bar',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * TalkToAnyoneAnywhereBehavior - Generic conversation
 */
class TalkToAnyoneAnywhereBehavior extends Behavior {
  constructor() {
    super('talk_anyone', 'Talk to Anyone Anywhere', 50, 0.25);

    // Generic conversation
    this.setSpecificityCriteria(SpecificityMatcher.generic());

    this.addSuccessTest('Conversation had', (ws: WorldState) => {
      return ws.matches('talked_to_someone', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[TalkToAnyone] ...');

    await this.delay(1000);

    worldState.set('talked_to_someone', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Generic conversation',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Specific conversation preferred
 */
export async function testTalkToFriendAtBar(): Promise<void> {
  console.log('\n===== Example 3: Talk to Friend at Bar > Talk to Anyone Anywhere =====\n');

  const worldState = new WorldState();
  worldState.set('at_bar', true);
  worldState.set('relationship_oldpal', 'friend');

  const tree = new BehaviorTree('bartender', worldState, ExecutionStrategy.PRIORITY);

  const goal = new Goal('socialize', 'Socialize', 'Chat with people', GoalPriority.NORMAL);

  const talkToFriend = new TalkToFriendAtBarBehavior();
  const talkToAnyone = new TalkToAnyoneAnywhereBehavior();

  const friendScore = talkToFriend.calculateSpecificityScore(worldState, 'oldpal');
  const anyoneScore = talkToAnyone.calculateSpecificityScore(worldState, 'oldpal');

  console.log(`TalkToFriendAtBar specificity: ${friendScore.toFixed(2)}`);
  console.log(`TalkToAnyone specificity: ${anyoneScore.toFixed(2)}`);
  console.log(`Winner: ${friendScore > anyoneScore ? 'TalkToFriendAtBar' : 'TalkToAnyone'}\n`);

  goal.addSatisfyingBehavior(talkToFriend);
  goal.addSatisfyingBehavior(talkToAnyone);
  goal.activate();

  tree.addGoal(goal);

  console.log('--- Executing ---');
  await tree.tick();

  console.log('\n===== Result =====');
  console.log('Expected: Specific friend conversation (relationship + context)');
}

// ===== EXAMPLE 4: Character-Specific Behaviors Override Defaults =====

/**
 * FlirtWithPlayerBehavior - Character-specific behavior for romantic NPC
 */
class FlirtWithPlayerBehavior extends Behavior {
  constructor() {
    super('flirt_player', 'Flirt with Player', 65, 0.95);

    // Very specific: exact target + relationship
    const criteria = SpecificityMatcher.forSpecificTarget('player');
    criteria.relationshipLevel = 'friend';
    criteria.contextRequirements = ['night_time'];
    this.setSpecificityCriteria(criteria);

    this.addPrecondition('Romantic character', (ws: WorldState) => {
      return ws.matches('character_trait', 'romantic');
    });

    this.addSuccessTest('Flirted', (ws: WorldState) => {
      return ws.matches('flirted_with_player', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[FlirtWithPlayer] *blushes* You know... you have the most captivating eyes...');

    await this.delay(1000);

    worldState.set('flirted_with_player', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Character-specific flirting behavior',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * DefaultGreetPlayerBehavior - Default behavior all NPCs have
 */
class DefaultGreetPlayerBehavior extends Behavior {
  constructor() {
    super('default_greet', 'Default Greet Player', 65, 0.4);

    // Less specific: target but no other requirements
    this.setSpecificityCriteria(SpecificityMatcher.forSpecificTarget('player'));

    this.addSuccessTest('Greeted', (ws: WorldState) => {
      return ws.matches('greeted_player_default', true);
    });
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log('[DefaultGreet] Hello.');

    await this.delay(1000);

    worldState.set('greeted_player_default', true);

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Default greeting',
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test: Character-specific behaviors override defaults
 */
export async function testCharacterSpecificOverride(): Promise<void> {
  console.log('\n===== Example 4: Character-Specific Behaviors Override Defaults =====\n');

  const worldState = new WorldState();
  worldState.set('character_trait', 'romantic');
  worldState.set('relationship_player', 'friend');
  worldState.set('night_time', true);

  const tree = new BehaviorTree('romantic_npc', worldState, ExecutionStrategy.PRIORITY);

  const goal = new Goal('interact', 'Interact with Player', 'Engage player', GoalPriority.NORMAL);

  const flirt = new FlirtWithPlayerBehavior();
  const defaultGreet = new DefaultGreetPlayerBehavior();

  const flirtScore = flirt.calculateSpecificityScore(worldState, 'player');
  const defaultScore = defaultGreet.calculateSpecificityScore(worldState, 'player');

  console.log(`FlirtWithPlayer specificity: ${flirtScore.toFixed(2)}`);
  console.log(`DefaultGreet specificity: ${defaultScore.toFixed(2)}`);
  console.log(`Winner: ${flirtScore > defaultScore ? 'FlirtWithPlayer' : 'DefaultGreet'}\n`);

  goal.addSatisfyingBehavior(flirt);
  goal.addSatisfyingBehavior(defaultGreet);
  goal.activate();

  tree.addGoal(goal);

  console.log('--- Executing ---');
  await tree.tick();

  console.log('\n===== Result =====');
  console.log('Expected: Character-specific flirting (target + relationship + context)');
}

// ===== EXAMPLE 5: Specificity Score Breakdown =====

export async function testSpecificityScoreBreakdown(): Promise<void> {
  console.log('\n===== Example 5: Specificity Score Breakdown =====\n');

  const worldState = new WorldState();
  worldState.set('customer_type', 'wizard');
  worldState.set('at_bar', true);
  worldState.set('relationship_merlin', 'friend');

  console.log('Situation:');
  console.log('  - Target: merlin (wizard)');
  console.log('  - Location: at bar');
  console.log('  - Relationship: friend');
  console.log('  - Parameters: { drink: "beer" }\n');

  // Test different specificity levels
  const behaviors = [
    {
      name: 'Most Specific (target + params + context + relationship)',
      criteria: {
        targetId: 'merlin',
        parameters: { drink: 'beer' },
        contextRequirements: ['at_bar'],
        relationshipLevel: 'friend' as const,
      },
    },
    {
      name: 'Specific Target + Parameters',
      criteria: {
        targetId: 'merlin',
        parameters: { drink: 'beer' },
      },
    },
    {
      name: 'Target Type + Parameters',
      criteria: {
        targetType: 'wizard',
        parameters: { drink: 'beer' },
      },
    },
    {
      name: 'Parameters Only',
      criteria: {
        parameters: { drink: 'beer' },
      },
    },
    {
      name: 'Generic (no requirements)',
      criteria: SpecificityMatcher.generic(),
    },
  ];

  console.log('Specificity Scores:\n');

  for (const behavior of behaviors) {
    const score = SpecificityMatcher.calculateScore(
      behavior.criteria as any,
      worldState,
      'merlin',
      { drink: 'beer' }
    );

    console.log(`${behavior.name}:`);
    console.log(`  Total: ${score.total.toFixed(2)}`);
    console.log(`  - Target: ${score.targetScore.toFixed(2)} (max 0.4)`);
    console.log(`  - Parameters: ${score.parameterScore.toFixed(2)} (max 0.3)`);
    console.log(`  - Context: ${score.contextScore.toFixed(2)} (max 0.2)`);
    console.log(`  - Relationship: ${score.relationshipScore.toFixed(2)} (max 0.1)`);
    console.log('');
  }

  console.log('===== Conclusion =====');
  console.log('More specific behaviors (higher total score) are preferred!');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllSpecificityExamples(): Promise<void> {
  await testGreetPlayerVsAnyone();
  await new Promise(r => setTimeout(r, 1000));

  await testServeBeerToWizard();
  await new Promise(r => setTimeout(r, 1000));

  await testTalkToFriendAtBar();
  await new Promise(r => setTimeout(r, 1000));

  await testCharacterSpecificOverride();
  await new Promise(r => setTimeout(r, 1000));

  await testSpecificityScoreBreakdown();
}

// Run if executed directly
if (require.main === module) {
  runAllSpecificityExamples().catch(console.error);
}
