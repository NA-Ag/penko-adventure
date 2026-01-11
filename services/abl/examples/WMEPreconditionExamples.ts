/**
 * WMEPreconditionExamples - FACADE 5.2
 *
 * Examples demonstrating WME-based preconditions for behaviors.
 *
 * WME preconditions enable behaviors to check structured facts:
 * - Location-based: "player is in plaza"
 * - Inventory-based: "player has gold"
 * - Relationship-based: "player friendsWith merchant >= 50"
 * - State-based: "NPC mood is happy"
 * - Goal-based: "player has active goal 'find_treasure'"
 *
 * Benefits over WorldState preconditions:
 * - Type-safe queries
 * - Pattern matching
 * - Better structured data
 * - Clearer intent
 */

import { WorldState } from '../WorldState';
import { WorkingMemory } from '../../wm/WorkingMemory';
import {
  LocationWME,
  StateWME,
  RelationWME,
  InventoryWME,
  GoalWME,
  BeliefWME,
  QuestWME,
  EventWME,
  SensoryWME,
} from '../../wm/WME';
import {
  WMEPreconditionBuilder,
  CommonWMEPreconditions,
  createWMEPreconditions,
} from '../WMEPrecondition';

// ===== EXAMPLE 1: Basic Location Preconditions =====

export async function testLocationPreconditions(): Promise<void> {
  console.log('\n===== Example 1: Basic Location Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up world
  wm.assert(new LocationWME('player', 'plaza'));
  wm.assert(new LocationWME('merchant', 'market'));
  wm.assert(new LocationWME('guard', 'plaza'));

  console.log('--- Check: Is player at plaza? ---');
  const playerAtPlaza = wmePrec.entityAtLocation('player', 'plaza').build();
  console.log(`Result: ${playerAtPlaza.check(ws)}`);
  console.log(`Description: ${playerAtPlaza.description}`);

  console.log('\n--- Check: Is player at market? ---');
  const playerAtMarket = wmePrec.entityAtLocation('player', 'market').build();
  console.log(`Result: ${playerAtMarket.check(ws)}`);

  console.log('\n--- Check: Are player and guard in same location? ---');
  const sameLocation = wmePrec.sameLocation('player', 'guard').build();
  console.log(`Result: ${sameLocation.check(ws)}`);

  console.log('\n--- Check: Are player and merchant in same location? ---');
  const differentLocation = wmePrec.sameLocation('player', 'merchant').build();
  console.log(`Result: ${differentLocation.check(ws)}`);

  console.log('\nExpected: Location-based preconditions work correctly');
}

// ===== EXAMPLE 2: Inventory Preconditions =====

export async function testInventoryPreconditions(): Promise<void> {
  console.log('\n===== Example 2: Inventory Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up inventory
  wm.assert(new InventoryWME('player', 'gold', 100));
  wm.assert(new InventoryWME('player', 'sword', 1));
  wm.assert(new InventoryWME('player', 'potion', 5));

  console.log('--- Check: Player has gold? ---');
  const hasGold = wmePrec.hasItem('player', 'gold').build();
  console.log(`Result: ${hasGold.check(ws)}`);

  console.log('\n--- Check: Player has at least 50 gold? ---');
  const hasEnoughGold = wmePrec.hasItem('player', 'gold', 50).build();
  console.log(`Result: ${hasEnoughGold.check(ws)}`);

  console.log('\n--- Check: Player has at least 200 gold? ---');
  const hasTooMuchGold = wmePrec.hasItem('player', 'gold', 200).build();
  console.log(`Result: ${hasTooMuchGold.check(ws)}`);

  console.log('\n--- Check: Player has shield? ---');
  const hasShield = wmePrec.hasItem('player', 'shield').build();
  console.log(`Result: ${hasShield.check(ws)}`);

  console.log('\n--- Common Pattern: Player has gold ---');
  const commonHasGold = CommonWMEPreconditions.playerHas(wm, 'gold', 50).build();
  console.log(`Result: ${commonHasGold.check(ws)}`);
  console.log(`Description: ${commonHasGold.description}`);

  console.log('\nExpected: Inventory preconditions with quantity checks');
}

// ===== EXAMPLE 3: State Preconditions =====

export async function testStatePreconditions(): Promise<void> {
  console.log('\n===== Example 3: State Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up states
  wm.assert(new StateWME('player', 'health', 75));
  wm.assert(new StateWME('player', 'mana', 50));
  wm.assert(new StateWME('merchant', 'mood', 'happy'));
  wm.assert(new StateWME('guard', 'mood', 'alert'));

  console.log('--- Check: Merchant mood is happy? ---');
  const merchantHappy = wmePrec.entityHasState('merchant', 'mood', 'happy').build();
  console.log(`Result: ${merchantHappy.check(ws)}`);

  console.log('\n--- Check: Player health > 50? ---');
  const healthAbove50 = wmePrec
    .entityStateMatches('player', 'health', (v: any) => v > 50, 'Player health > 50')
    .build();
  console.log(`Result: ${healthAbove50.check(ws)}`);

  console.log('\n--- Check: Player health > 100? ---');
  const healthAbove100 = wmePrec
    .entityStateMatches('player', 'health', (v: any) => v > 100, 'Player health > 100')
    .build();
  console.log(`Result: ${healthAbove100.check(ws)}`);

  console.log('\n--- Common Pattern: Player health above threshold ---');
  const commonHealthCheck = CommonWMEPreconditions.playerHealthAbove(wm, 50).build();
  console.log(`Result: ${commonHealthCheck.check(ws)}`);

  console.log('\nExpected: State preconditions with value comparisons');
}

// ===== EXAMPLE 4: Relationship Preconditions =====

export async function testRelationshipPreconditions(): Promise<void> {
  console.log('\n===== Example 4: Relationship Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up relationships
  wm.assert(new RelationWME('player', 'friendsWith', 'merchant', 75));
  wm.assert(new RelationWME('player', 'friendsWith', 'guard', 25));
  wm.assert(new RelationWME('player', 'enemyOf', 'bandit', 100));

  console.log('--- Check: Player has relationship with merchant? ---');
  const knowsMerchant = wmePrec.hasRelation('player', 'friendsWith', 'merchant').build();
  console.log(`Result: ${knowsMerchant.check(ws)}`);

  console.log('\n--- Check: Friendship with merchant >= 50? ---');
  const merchantFriendly = wmePrec
    .relationValueMatches('player', 'friendsWith', 'merchant', '>=', 50)
    .build();
  console.log(`Result: ${merchantFriendly.check(ws)}`);

  console.log('\n--- Check: Friendship with guard >= 50? ---');
  const guardUnfriendly = wmePrec
    .relationValueMatches('player', 'friendsWith', 'guard', '>=', 50)
    .build();
  console.log(`Result: ${guardUnfriendly.check(ws)}`);

  console.log('\n--- Common Pattern: NPC is friendly ---');
  const commonFriendly = CommonWMEPreconditions.npcIsFriendly(wm, 'merchant', 50).build();
  console.log(`Result: ${commonFriendly.check(ws)}`);
  console.log(`Description: ${commonFriendly.description}`);

  console.log('\nExpected: Relationship preconditions with value comparisons');
}

// ===== EXAMPLE 5: Goal Preconditions =====

export async function testGoalPreconditions(): Promise<void> {
  console.log('\n===== Example 5: Goal Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up goals
  wm.assert(new GoalWME('player', 'find_treasure', 100));
  const questGoal = new GoalWME('player', 'defeat_dragon', 90);
  questGoal.setStatus('active');
  wm.assert(questGoal);

  console.log('--- Check: Player has "find_treasure" goal? ---');
  const hasTreasureGoal = wmePrec.hasGoal('player', 'find_treasure').build();
  console.log(`Result: ${hasTreasureGoal.check(ws)}`);

  console.log('\n--- Check: Player has "explore_dungeon" goal? ---');
  const hasDungeonGoal = wmePrec.hasGoal('player', 'explore_dungeon').build();
  console.log(`Result: ${hasDungeonGoal.check(ws)}`);

  console.log('\n--- Check: "defeat_dragon" goal is active? ---');
  const dragonActive = wmePrec.hasGoalWithStatus('player', 'defeat_dragon', 'active').build();
  console.log(`Result: ${dragonActive.check(ws)}`);

  console.log('\n--- Check: "find_treasure" goal is active? ---');
  const treasureActive = wmePrec.hasGoalWithStatus('player', 'find_treasure', 'active').build();
  console.log(`Result: ${treasureActive.check(ws)} (it's pending, not active)`);

  console.log('\nExpected: Goal-based preconditions with status checks');
}

// ===== EXAMPLE 6: Quest Preconditions =====

export async function testQuestPreconditions(): Promise<void> {
  console.log('\n===== Example 6: Quest Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up quests
  wm.assert(new QuestWME('dragon_quest', 'active'));
  wm.assert(new QuestWME('merchant_quest', 'completed'));
  wm.assert(new QuestWME('dungeon_quest', 'available'));

  console.log('--- Check: Dragon quest is active? ---');
  const dragonActive = wmePrec.questStatus('dragon_quest', 'active').build();
  console.log(`Result: ${dragonActive.check(ws)}`);

  console.log('\n--- Check: Merchant quest is completed? ---');
  const merchantDone = wmePrec.questStatus('merchant_quest', 'completed').build();
  console.log(`Result: ${merchantDone.check(ws)}`);

  console.log('\n--- Check: Dungeon quest is active? ---');
  const dungeonActive = wmePrec.questStatus('dungeon_quest', 'active').build();
  console.log(`Result: ${dungeonActive.check(ws)} (it's available, not active)`);

  console.log('\n--- Common Pattern: Quest is active ---');
  const commonQuestActive = CommonWMEPreconditions.questActive(wm, 'dragon_quest').build();
  console.log(`Result: ${commonQuestActive.check(ws)}`);

  console.log('\nExpected: Quest status preconditions');
}

// ===== EXAMPLE 7: Belief Preconditions =====

export async function testBeliefPreconditions(): Promise<void> {
  console.log('\n===== Example 7: Belief Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up beliefs
  wm.assert(new BeliefWME('guard', 'player_is_trustworthy', 0.8, true));
  wm.assert(new BeliefWME('merchant', 'player_is_thief', 0.3, true));
  wm.assert(new BeliefWME('npc_wizard', 'magic_is_dangerous', 0.9, true));

  console.log('--- Check: Guard believes player is trustworthy (confidence >= 0.5)? ---');
  const guardTrusts = wmePrec.hasBelief('guard', 'player_is_trustworthy', 0.5).build();
  console.log(`Result: ${guardTrusts.check(ws)}`);

  console.log('\n--- Check: Merchant believes player is thief (confidence >= 0.5)? ---');
  const merchantSuspects = wmePrec.hasBelief('merchant', 'player_is_thief', 0.5).build();
  console.log(`Result: ${merchantSuspects.check(ws)} (confidence only 0.3)`);

  console.log('\n--- Check: Wizard believes magic is dangerous (high confidence)? ---');
  const wizardBelief = wmePrec.hasBelief('npc_wizard', 'magic_is_dangerous', 0.8).build();
  console.log(`Result: ${wizardBelief.check(ws)}`);

  console.log('\nExpected: Belief preconditions with confidence thresholds');
}

// ===== EXAMPLE 8: Event and Sensory Preconditions =====

export async function testEventSensoryPreconditions(): Promise<void> {
  console.log('\n===== Example 8: Event and Sensory Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up events
  wm.assert(new EventWME('player_attacked', 'bandit', 'player'));
  await new Promise(r => setTimeout(r, 100));

  // Set up sensory perceptions
  wm.assert(new SensoryWME('player', 'sight', 'dragon_approaching', 0.9));
  wm.assert(new SensoryWME('player', 'sound', 'footsteps', 0.4));

  console.log('--- Check: "player_attacked" event occurred within 1000ms? ---');
  const recentAttack = wmePrec.recentEvent('player_attacked', 1000).build();
  console.log(`Result: ${recentAttack.check(ws)}`);

  console.log('\n--- Check: "explosion" event occurred within 1000ms? ---');
  const recentExplosion = wmePrec.recentEvent('explosion', 1000).build();
  console.log(`Result: ${recentExplosion.check(ws)}`);

  console.log('\n--- Check: Player can see dragon approaching (intensity >= 0.5)? ---');
  const seeDragon = wmePrec.canSense('player', 'sight', 'dragon_approaching', 0.5).build();
  console.log(`Result: ${seeDragon.check(ws)}`);

  console.log('\n--- Check: Player can hear footsteps (intensity >= 0.5)? ---');
  const hearFootsteps = wmePrec.canSense('player', 'sound', 'footsteps', 0.5).build();
  console.log(`Result: ${hearFootsteps.check(ws)} (intensity only 0.4)`);

  console.log('\nExpected: Event and sensory preconditions with time/intensity checks');
}

// ===== EXAMPLE 9: Complex Combined Preconditions =====

export async function testComplexCombinations(): Promise<void> {
  console.log('\n===== Example 9: Complex Combined Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up world
  wm.assert(new LocationWME('player', 'market'));
  wm.assert(new LocationWME('merchant', 'market'));
  wm.assert(new InventoryWME('player', 'gold', 100));
  wm.assert(new StateWME('merchant', 'mood', 'happy'));
  wm.assert(new RelationWME('player', 'friendsWith', 'merchant', 60));

  console.log('--- Behavior: "buy_from_merchant" ---');
  console.log('Preconditions:');
  console.log('  1. Player and merchant in same location');
  console.log('  2. Player has gold');
  console.log('  3. Merchant is happy');
  console.log('  4. Player is friendly with merchant (>= 50)');

  const prec1 = wmePrec.sameLocation('player', 'merchant');
  const prec2 = wmePrec.hasItem('player', 'gold');
  const prec3 = wmePrec.entityHasState('merchant', 'mood', 'happy');
  const prec4 = wmePrec.relationValueMatches('player', 'friendsWith', 'merchant', '>=', 50);

  const combinedPrec = prec1.and(prec2).and(prec3).and(prec4).build();

  console.log('\n--- Check combined precondition ---');
  console.log(`Result: ${combinedPrec.check(ws)}`);
  console.log(`Description: ${combinedPrec.description}`);

  console.log('\n--- Modify world: Merchant becomes angry ---');
  const moodWME = wm.findOne({ type: 'State', attributes: { entity: 'merchant', state: 'mood' } });
  if (moodWME) {
    wm.modify(moodWME, { value: 'angry' });
  }

  console.log('\n--- Check combined precondition again ---');
  console.log(`Result: ${combinedPrec.check(ws)} (merchant no longer happy)`);

  console.log('\nExpected: Complex AND combinations of WME preconditions');
}

// ===== EXAMPLE 10: OR and NOT Preconditions =====

export async function testOrNotPreconditions(): Promise<void> {
  console.log('\n===== Example 10: OR and NOT Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up world
  wm.assert(new LocationWME('player', 'plaza'));
  wm.assert(new InventoryWME('player', 'key', 1));
  wm.assert(new StateWME('door', 'locked', true));

  console.log('--- Behavior: "enter_building" ---');
  console.log('Preconditions: (has key) OR (door unlocked)');

  const hasKey = wmePrec.hasItem('player', 'key');
  const doorUnlocked = wmePrec.entityHasState('door', 'locked', false);

  const enterPrec = hasKey.or(doorUnlocked).build();

  console.log('\n--- Check: Can enter? ---');
  console.log(`Result: ${enterPrec.check(ws)} (has key, even though door locked)`);

  console.log('\n--- Remove key ---');
  const keyWME = wm.findOne({ type: 'Inventory', attributes: { item: 'key' } });
  if (keyWME) wm.retract(keyWME);

  console.log('\n--- Check: Can enter? ---');
  console.log(`Result: ${enterPrec.check(ws)} (no key and door locked)`);

  console.log('\n--- NOT example: NOT in combat ---');
  wm.assert(new StateWME('player', 'inCombat', false));

  const inCombat = wmePrec.entityHasState('player', 'inCombat', true);
  const notInCombat = inCombat.not().build();

  console.log(`Result: ${notInCombat.check(ws)}`);
  console.log(`Description: ${notInCombat.description}`);

  console.log('\nExpected: OR and NOT logical operators work with WME preconditions');
}

// ===== EXAMPLE 11: Common Precondition Patterns =====

export async function testCommonPatterns(): Promise<void> {
  console.log('\n===== Example 11: Common Precondition Patterns =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();

  // Set up world
  wm.assert(new LocationWME('player', 'plaza'));
  wm.assert(new InventoryWME('player', 'gold', 100));
  wm.assert(new StateWME('player', 'health', 80));
  wm.assert(new RelationWME('player', 'friendsWith', 'merchant', 70));
  wm.assert(new LocationWME('merchant', 'plaza'));
  wm.assert(new QuestWME('dragon_quest', 'active'));
  wm.assert(new StateWME('world', 'timeOfDay', 'morning'));

  console.log('--- Common Pattern 1: Player at location ---');
  const playerAt = CommonWMEPreconditions.playerAt(wm, 'plaza').build();
  console.log(`Player at plaza? ${playerAt.check(ws)}`);

  console.log('\n--- Common Pattern 2: Player has item ---');
  const playerHas = CommonWMEPreconditions.playerHas(wm, 'gold', 50).build();
  console.log(`Player has 50+ gold? ${playerHas.check(ws)}`);

  console.log('\n--- Common Pattern 3: NPC is friendly ---');
  const npcFriendly = CommonWMEPreconditions.npcIsFriendly(wm, 'merchant', 50).build();
  console.log(`Merchant friendly? ${npcFriendly.check(ws)}`);

  console.log('\n--- Common Pattern 4: Player near NPC ---');
  const playerNear = CommonWMEPreconditions.playerNearNPC(wm, 'merchant').build();
  console.log(`Player near merchant? ${playerNear.check(ws)}`);

  console.log('\n--- Common Pattern 5: Player health above threshold ---');
  const healthOk = CommonWMEPreconditions.playerHealthAbove(wm, 50).build();
  console.log(`Player health > 50? ${healthOk.check(ws)}`);

  console.log('\n--- Common Pattern 6: Quest active ---');
  const questActive = CommonWMEPreconditions.questActive(wm, 'dragon_quest').build();
  console.log(`Dragon quest active? ${questActive.check(ws)}`);

  console.log('\n--- Common Pattern 7: Time of day ---');
  const timeCheck = CommonWMEPreconditions.timeOfDay(wm, 'morning').build();
  console.log(`Is morning? ${timeCheck.check(ws)}`);

  console.log('\nExpected: Common precondition patterns provide shortcuts');
}

// ===== EXAMPLE 12: Count-Based Preconditions =====

export async function testCountPreconditions(): Promise<void> {
  console.log('\n===== Example 12: Count-Based Preconditions =====\n');

  const wm = new WorkingMemory(false);
  const ws = new WorldState();
  const wmePrec = new WMEPreconditionBuilder(wm);

  // Set up multiple entities
  wm.assert(new LocationWME('guard1', 'plaza'));
  wm.assert(new LocationWME('guard2', 'plaza'));
  wm.assert(new LocationWME('guard3', 'gate'));
  wm.assert(new LocationWME('merchant', 'plaza'));

  console.log('--- Check: At least 2 entities in plaza? ---');
  const twoInPlaza = wmePrec.count('Location', '>=', 2, { location: 'plaza' }).build();
  console.log(`Result: ${twoInPlaza.check(ws)}`);

  console.log('\n--- Check: Exactly 3 entities in plaza? ---');
  const threeInPlaza = wmePrec.count('Location', '==', 3, { location: 'plaza' }).build();
  console.log(`Result: ${threeInPlaza.check(ws)}`);

  console.log('\n--- Check: More than 5 entities in plaza? ---');
  const manyInPlaza = wmePrec.count('Location', '>', 5, { location: 'plaza' }).build();
  console.log(`Result: ${manyInPlaza.check(ws)}`);

  console.log('\n--- Check: Exactly 1 entity at gate? ---');
  const oneAtGate = wmePrec.count('Location', '==', 1, { location: 'gate' }).build();
  console.log(`Result: ${oneAtGate.check(ws)}`);

  console.log('\nExpected: Count-based preconditions for checking entity quantities');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllWMEPreconditionExamples(): Promise<void> {
  await testLocationPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testInventoryPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testStatePreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testRelationshipPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testGoalPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testQuestPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testBeliefPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testEventSensoryPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testComplexCombinations();
  await new Promise(r => setTimeout(r, 500));

  await testOrNotPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testCommonPatterns();
  await new Promise(r => setTimeout(r, 500));

  await testCountPreconditions();
}

// Run if executed directly
if (require.main === module) {
  runAllWMEPreconditionExamples().catch(console.error);
}
