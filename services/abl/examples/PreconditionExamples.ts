/**
 * PreconditionExamples - FACADE 3.2
 *
 * Examples demonstrating the enhanced precondition system with
 * logical operators (AND, OR, NOT) and comparisons (>, <, ==, !=, etc.)
 */

import { PreconditionBuilder, PreconditionCache, CachedPrecondition } from '../Precondition';
import { WorldState } from '../WorldState';
import { Behavior, BehaviorStatus, BehaviorResult } from '../Behavior';

// ===== EXAMPLE 1: Simple Preconditions =====

/**
 * Example: Simple equality check
 */
export function example1_SimpleEquality(): void {
  console.log('\n===== Example 1: Simple Equality =====\n');

  const worldState = new WorldState();
  worldState.set('player_location', 'tavern');

  // Create precondition: player must be at tavern
  const atTavern = PreconditionBuilder.equals('player_location', 'tavern').build();

  console.log(`Precondition: ${atTavern.description}`);
  console.log(`Result: ${atTavern.check(worldState)}`); // true

  worldState.set('player_location', 'forest');
  console.log(`After moving to forest: ${atTavern.check(worldState)}`); // false
}

// ===== EXAMPLE 2: Numeric Comparisons =====

/**
 * Example: Numeric comparisons (>, <, >=, <=)
 */
export function example2_NumericComparisons(): void {
  console.log('\n===== Example 2: Numeric Comparisons =====\n');

  const worldState = new WorldState();
  worldState.set('player_health', 75);
  worldState.set('player_gold', 50);

  // Health > 50
  const healthyEnough = PreconditionBuilder.greaterThan('player_health', 50).build();
  console.log(`${healthyEnough.description}: ${healthyEnough.check(worldState)}`); // true

  // Gold >= 100
  const richEnough = PreconditionBuilder.greaterOrEqual('player_gold', 100).build();
  console.log(`${richEnough.description}: ${richEnough.check(worldState)}`); // false

  // Health between 50 and 100
  const healthInRange = PreconditionBuilder.between('player_health', 50, 100).build();
  console.log(`${healthInRange.description}: ${healthInRange.check(worldState)}`); // true
}

// ===== EXAMPLE 3: Logical AND =====

/**
 * Example: Combining conditions with AND
 */
export function example3_LogicalAND(): void {
  console.log('\n===== Example 3: Logical AND =====\n');

  const worldState = new WorldState();
  worldState.set('player_at_bar', true);
  worldState.set('has_money', true);
  worldState.set('is_banned', false);

  // Can buy drink = at bar AND has money AND NOT banned
  const canBuyDrink = PreconditionBuilder
    .isTrue('player_at_bar')
    .and(PreconditionBuilder.isTrue('has_money'))
    .and(PreconditionBuilder.isFalse('is_banned'))
    .build();

  console.log(`Precondition: ${canBuyDrink.description}`);
  console.log(`Result: ${canBuyDrink.check(worldState)}`); // true

  // Ban the player
  worldState.set('is_banned', true);
  console.log(`After being banned: ${canBuyDrink.check(worldState)}`); // false
}

// ===== EXAMPLE 4: Logical OR =====

/**
 * Example: Combining conditions with OR
 */
export function example4_LogicalOR(): void {
  console.log('\n===== Example 4: Logical OR =====\n');

  const worldState = new WorldState();
  worldState.set('is_vip', false);
  worldState.set('relationship_score', 0.3);

  // Can enter = VIP OR relationship >= 0.5
  const canEnter = PreconditionBuilder
    .isTrue('is_vip')
    .or(PreconditionBuilder.greaterOrEqual('relationship_score', 0.5))
    .build();

  console.log(`Precondition: ${canEnter.description}`);
  console.log(`Result: ${canEnter.check(worldState)}`); // false

  // Improve relationship
  worldState.set('relationship_score', 0.6);
  console.log(`After improving relationship: ${canEnter.check(worldState)}`); // true

  // Or become VIP
  worldState.set('relationship_score', 0.3);
  worldState.set('is_vip', true);
  console.log(`As VIP with low relationship: ${canEnter.check(worldState)}`); // true
}

// ===== EXAMPLE 5: Logical NOT =====

/**
 * Example: Negating conditions with NOT
 */
export function example5_LogicalNOT(): void {
  console.log('\n===== Example 5: Logical NOT =====\n');

  const worldState = new WorldState();
  worldState.set('is_poisoned', false);
  worldState.set('is_cursed', false);
  worldState.set('health', 80);

  // Can fight = NOT poisoned AND NOT cursed AND health > 50
  const canFight = PreconditionBuilder
    .isTrue('is_poisoned').not()
    .and(PreconditionBuilder.isTrue('is_cursed').not())
    .and(PreconditionBuilder.greaterThan('health', 50))
    .build();

  console.log(`Precondition: ${canFight.description}`);
  console.log(`Result: ${canFight.check(worldState)}`); // true

  // Get poisoned
  worldState.set('is_poisoned', true);
  console.log(`After being poisoned: ${canFight.check(worldState)}`); // false
}

// ===== EXAMPLE 6: Complex Nested Logic =====

/**
 * Example: Complex nested conditions
 * (has_quest_item OR completed_tutorial) AND (level >= 5 OR is_premium) AND NOT banned
 */
export function example6_ComplexLogic(): void {
  console.log('\n===== Example 6: Complex Nested Logic =====\n');

  const worldState = new WorldState();
  worldState.set('has_quest_item', false);
  worldState.set('completed_tutorial', true);
  worldState.set('level', 3);
  worldState.set('is_premium', false);
  worldState.set('is_banned', false);

  // Build complex condition
  const questOrTutorial = PreconditionBuilder
    .isTrue('has_quest_item')
    .or(PreconditionBuilder.isTrue('completed_tutorial'));

  const levelOrPremium = PreconditionBuilder
    .greaterOrEqual('level', 5)
    .or(PreconditionBuilder.isTrue('is_premium'));

  const notBanned = PreconditionBuilder.isFalse('is_banned');

  const canAccessDungeon = questOrTutorial
    .and(levelOrPremium)
    .and(notBanned)
    .build();

  console.log(`Precondition: ${canAccessDungeon.description}`);
  console.log(`Result: ${canAccessDungeon.check(worldState)}`); // false (level < 5 and not premium)

  // Become premium
  worldState.set('is_premium', true);
  console.log(`After becoming premium: ${canAccessDungeon.check(worldState)}`); // true
}

// ===== EXAMPLE 7: String Operations =====

/**
 * Example: String contains, starts with, ends with
 */
export function example7_StringOperations(): void {
  console.log('\n===== Example 7: String Operations =====\n');

  const worldState = new WorldState();
  worldState.set('player_name', 'Sir Galahad');
  worldState.set('current_quest', 'find_holy_grail');

  // Check if player is a knight (name starts with "Sir")
  const isKnight = PreconditionBuilder.startsWith('player_name', 'Sir').build();
  console.log(`${isKnight.description}: ${isKnight.check(worldState)}`); // true

  // Check if quest involves grail
  const grailQuest = PreconditionBuilder.contains('current_quest', 'grail').build();
  console.log(`${grailQuest.description}: ${grailQuest.check(worldState)}`); // true
}

// ===== EXAMPLE 8: Value in List =====

/**
 * Example: Check if value is in a list
 */
export function example8_ValueInList(): void {
  console.log('\n===== Example 8: Value in List =====\n');

  const worldState = new WorldState();
  worldState.set('player_class', 'warrior');
  worldState.set('current_location', 'dungeon');

  // Check if player can use heavy weapons (warrior, paladin, or berserker)
  const canUseHeavyWeapons = PreconditionBuilder
    .isIn('player_class', ['warrior', 'paladin', 'berserker'])
    .build();

  console.log(`${canUseHeavyWeapons.description}: ${canUseHeavyWeapons.check(worldState)}`); // true

  // Check if location is safe
  const inSafeZone = PreconditionBuilder
    .isIn('current_location', ['town', 'village', 'camp'])
    .build();

  console.log(`${inSafeZone.description}: ${inSafeZone.check(worldState)}`); // false
}

// ===== EXAMPLE 9: Using PreconditionBuilder.all() and any() =====

/**
 * Example: Convenience methods for multiple conditions
 */
export function example9_AllAndAny(): void {
  console.log('\n===== Example 9: All and Any =====\n');

  const worldState = new WorldState();
  worldState.set('has_sword', true);
  worldState.set('has_shield', true);
  worldState.set('has_armor', false);

  // Must have ALL equipment
  const fullyEquipped = PreconditionBuilder.all(
    PreconditionBuilder.isTrue('has_sword'),
    PreconditionBuilder.isTrue('has_shield'),
    PreconditionBuilder.isTrue('has_armor')
  ).build();

  console.log(`${fullyEquipped.description}`);
  console.log(`Fully equipped: ${fullyEquipped.check(worldState)}`); // false

  // Must have ANY weapon
  const hasAnyWeapon = PreconditionBuilder.any(
    PreconditionBuilder.isTrue('has_sword'),
    PreconditionBuilder.isTrue('has_bow'),
    PreconditionBuilder.isTrue('has_staff')
  ).build();

  console.log(`${hasAnyWeapon.description}`);
  console.log(`Has any weapon: ${hasAnyWeapon.check(worldState)}`); // true
}

// ===== EXAMPLE 10: Precondition Caching =====

/**
 * Example: Using cache for performance
 */
export function example10_Caching(): void {
  console.log('\n===== Example 10: Precondition Caching =====\n');

  const worldState = new WorldState();
  worldState.set('expensive_calculation_result', 42);

  // Create expensive precondition (simulated)
  const expensivePrecondition = PreconditionBuilder.custom(
    'expensive check',
    (ws: WorldState) => {
      console.log('  [Expensive calculation running...]');
      // Simulate expensive operation
      return ws.get('expensive_calculation_result') === 42;
    }
  ).build();

  // Create cache with 2 second TTL
  const cache = new PreconditionCache(2000);

  // Wrap precondition with cache
  const cachedPrecondition = new CachedPrecondition(expensivePrecondition, cache);

  console.log('First check (will calculate):');
  console.log(`Result: ${cachedPrecondition.check(worldState)}`);

  console.log('\nSecond check (will use cache):');
  console.log(`Result: ${cachedPrecondition.check(worldState)}`);

  console.log('\nThird check (will use cache):');
  console.log(`Result: ${cachedPrecondition.check(worldState)}`);

  console.log(`\nCache stats: ${JSON.stringify(cache.getStats())}`);
}

// ===== EXAMPLE 11: Behavior with Enhanced Preconditions =====

/**
 * Example: Using enhanced preconditions in a Behavior
 */
export class GuardBehavior extends Behavior {
  constructor() {
    super('guard_door', 'Guard the Door', 60, 0.7);

    // Complex precondition: (has_weapon OR has_magic) AND health > 30 AND NOT sleeping
    const canGuard = PreconditionBuilder
      .any(
        PreconditionBuilder.isTrue('has_weapon'),
        PreconditionBuilder.isTrue('has_magic')
      )
      .and(PreconditionBuilder.greaterThan('health', 30))
      .and(PreconditionBuilder.isFalse('is_sleeping'))
      .build();

    this.addPrecondition(canGuard.description, canGuard.check);

    // Success test: guarded for at least 5 seconds
    this.addSuccessTest(
      'Guarded for 5 seconds',
      (ws) => {
        const startTime = ws.get('guard_start_time') as number;
        return startTime && (Date.now() - startTime) >= 5000;
      }
    );
  }

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    worldState.set('guard_start_time', Date.now());
    console.log('[GuardBehavior] Standing guard...');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    return {
      status: BehaviorStatus.SUCCESS,
      message: 'Guard duty completed',
    };
  }
}

export function example11_BehaviorWithPreconditions(): void {
  console.log('\n===== Example 11: Behavior with Enhanced Preconditions =====\n');

  const worldState = new WorldState();
  worldState.set('has_weapon', true);
  worldState.set('has_magic', false);
  worldState.set('health', 50);
  worldState.set('is_sleeping', false);

  const guard = new GuardBehavior();

  console.log(`Can execute: ${guard.canExecute(worldState)}`); // true

  // Lose weapon and magic
  worldState.set('has_weapon', false);
  console.log(`After losing weapon: ${guard.canExecute(worldState)}`); // false

  // Get magic
  worldState.set('has_magic', true);
  console.log(`After getting magic: ${guard.canExecute(worldState)}`); // true
}

// ===== RUN ALL EXAMPLES =====

export async function runAllPreconditionExamples(): Promise<void> {
  console.log('\n\n========================================');
  console.log('FACADE 3.2: Precondition Examples');
  console.log('========================================');

  example1_SimpleEquality();
  example2_NumericComparisons();
  example3_LogicalAND();
  example4_LogicalOR();
  example5_LogicalNOT();
  example6_ComplexLogic();
  example7_StringOperations();
  example8_ValueInList();
  example9_AllAndAny();
  example10_Caching();
  example11_BehaviorWithPreconditions();

  console.log('\n\n========================================');
  console.log('All Examples Complete!');
  console.log('========================================\n');
}

// Run examples if executed directly
if (require.main === module) {
  runAllPreconditionExamples().catch(console.error);
}
