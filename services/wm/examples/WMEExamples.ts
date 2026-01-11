/**
 * WMEExamples - FACADE 5.1
 *
 * Examples demonstrating Working Memory Elements (WMEs) and Working Memory.
 *
 * WMEs are structured fact objects that represent discrete facts about the world:
 * - "player is in plaza"
 * - "NPC mood is angry"
 * - "quest_dragon is active"
 * - "inventory contains sword"
 *
 * Working Memory manages these facts:
 * - Assert: Add new facts
 * - Retract: Remove facts
 * - Modify: Update facts
 * - Query: Find facts matching patterns
 *
 * This enables:
 * - Persistent world state
 * - Behavior preconditions based on facts
 * - Complex reasoning about the world
 * - Reactive behaviors when facts change
 */

import {
  WME,
  LocationWME,
  StateWME,
  RelationWME,
  GoalWME,
  BeliefWME,
  EventWME,
  InventoryWME,
  SensoryWME,
  QuestWME,
} from '../WME';
import { WorkingMemory, WMEBuilder, WMEHelpers, WMEChangeType } from '../WorkingMemory';

// ===== EXAMPLE 1: Basic WME Creation and Attributes =====

export async function testBasicWMECreation(): Promise<void> {
  console.log('\n===== Example 1: Basic WME Creation and Attributes =====\n');

  // Create a simple WME
  const wme = new WME('PlayerLocation', {
    entity: 'player',
    location: 'Plaza del Pueblo',
  });

  console.log('--- WME Created ---');
  console.log(`ID: ${wme.id}`);
  console.log(`Type: ${wme.type}`);
  console.log(`Created: ${new Date(wme.createdAt).toLocaleTimeString()}`);

  console.log('\n--- Get Attributes ---');
  console.log(`entity: ${wme.getAttribute('entity')}`);
  console.log(`location: ${wme.getAttribute('location')}`);

  console.log('\n--- Set Attribute ---');
  wme.setAttribute('location', 'Town Square');
  console.log(`New location: ${wme.getAttribute('location')}`);
  console.log(`Modified: ${new Date(wme.modifiedAt).toLocaleTimeString()}`);

  console.log('\n--- Check Attributes ---');
  console.log(`Has 'entity'? ${wme.hasAttribute('entity')}`);
  console.log(`Has 'mood'? ${wme.hasAttribute('mood')}`);

  console.log('\n--- All Attributes ---');
  console.log(JSON.stringify(wme.getAttributes(), null, 2));

  console.log('\n--- String Representation ---');
  console.log(wme.toString());

  console.log('\nExpected: WMEs store structured attributes with timestamps');
}

// ===== EXAMPLE 2: Assert, Retract, Modify =====

export async function testAssertRetractModify(): Promise<void> {
  console.log('\n===== Example 2: Assert, Retract, Modify =====\n');

  const wm = new WorkingMemory(true);

  console.log('--- Assert: Add fact to working memory ---');
  const wme1 = new WME('PlayerLocation', {
    entity: 'player',
    location: 'plaza',
  });
  wm.assert(wme1);
  console.log(`WME count: ${wm.getAll().length}`);

  console.log('\n--- Assert: Add another fact ---');
  const wme2 = new WME('NPCMood', {
    npc: 'merchant',
    mood: 'happy',
  });
  wm.assert(wme2);
  console.log(`WME count: ${wm.getAll().length}`);

  console.log('\n--- Modify: Update a fact ---');
  wm.modify(wme2, { mood: 'angry' });
  console.log(`Merchant mood now: ${wme2.getAttribute('mood')}`);

  console.log('\n--- Retract: Remove a fact ---');
  wm.retract(wme1);
  console.log(`WME count: ${wm.getAll().length}`);

  console.log('\n--- Facts persist until retracted ---');
  console.log(`wme2 still exists? ${wm.has(wme2)}`);
  console.log(`wme1 still exists? ${wm.has(wme1)}`);

  console.log('\nExpected: WMEs persist until explicitly retracted');
}

// ===== EXAMPLE 3: Querying and Pattern Matching =====

export async function testQueryingPatternMatching(): Promise<void> {
  console.log('\n===== Example 3: Querying and Pattern Matching =====\n');

  const wm = new WorkingMemory(false);

  // Add various facts
  wm.assert(new LocationWME('player', 'plaza'));
  wm.assert(new LocationWME('merchant', 'plaza'));
  wm.assert(new LocationWME('guard', 'gate'));
  wm.assert(new StateWME('merchant', 'mood', 'happy'));
  wm.assert(new StateWME('guard', 'mood', 'alert'));

  console.log('--- Query: All Location WMEs ---');
  const locations = wm.getByType('Location');
  console.log(`Found ${locations.length} locations:`);
  locations.forEach(wme => console.log(`  ${wme.toString()}`));

  console.log('\n--- Query: Who is in the plaza? ---');
  const inPlaza = wm.query({
    type: 'Location',
    attributes: { location: 'plaza' },
  });
  console.log(`${inPlaza.length} entities in plaza:`);
  inPlaza.forEach(wme => console.log(`  - ${wme.getAttribute('entity')}`));

  console.log('\n--- Query: Custom filter (moods starting with "h") ---');
  const happyMoods = wm.query({
    type: 'State',
    filter: wme => {
      const mood = wme.getAttribute('value');
      return typeof mood === 'string' && mood.startsWith('h');
    },
  });
  console.log(`Found ${happyMoods.length}:`);
  happyMoods.forEach(wme => console.log(`  ${wme.getAttribute('entity')}: ${wme.getAttribute('value')}`));

  console.log('\n--- Find One: Is player in plaza? ---');
  const playerInPlaza = wm.findOne({
    type: 'Location',
    attributes: { entity: 'player', location: 'plaza' },
  });
  console.log(`Player in plaza? ${playerInPlaza !== undefined}`);

  console.log('\n--- Exists: Check if condition is true ---');
  const guardAtGate = wm.exists({
    type: 'Location',
    attributes: { entity: 'guard', location: 'gate' },
  });
  console.log(`Guard at gate? ${guardAtGate}`);

  console.log('\nExpected: Rich querying with pattern matching');
}

// ===== EXAMPLE 4: Typed WMEs (Location, State, Relation) =====

export async function testTypedWMEs(): Promise<void> {
  console.log('\n===== Example 4: Typed WMEs (Location, State, Relation) =====\n');

  const wm = new WorkingMemory(false);

  console.log('--- LocationWME: Track entity locations ---');
  const playerLoc = new LocationWME('player', 'plaza');
  wm.assert(playerLoc);
  console.log(`Player location: ${playerLoc.getLocation()}`);

  playerLoc.setLocation('market');
  console.log(`Player moved to: ${playerLoc.getLocation()}`);

  console.log('\n--- StateWME: Track entity states ---');
  const merchantMood = new StateWME('merchant', 'mood', 'neutral');
  wm.assert(merchantMood);
  console.log(`Merchant mood: ${merchantMood.getValue()}`);

  merchantMood.setValue('happy');
  console.log(`Merchant mood changed to: ${merchantMood.getValue()}`);

  console.log('\n--- RelationWME: Track relationships ---');
  const friendship = new RelationWME('player', 'friendsWith', 'merchant', 50);
  wm.assert(friendship);
  console.log(`Relationship: ${friendship.getSubject()} ${friendship.getRelation()} ${friendship.getObject()}`);
  console.log(`Friendship value: ${friendship.getValue()}`);

  friendship.setValue(75);
  console.log(`Friendship increased to: ${friendship.getValue()}`);

  console.log('\nExpected: Strongly-typed WMEs with domain-specific methods');
}

// ===== EXAMPLE 5: Goal, Belief, Event WMEs =====

export async function testGoalBeliefEvent(): Promise<void> {
  console.log('\n===== Example 5: Goal, Belief, Event WMEs =====\n');

  const wm = new WorkingMemory(false);

  console.log('--- GoalWME: Active goals ---');
  const goal = new GoalWME('player', 'find_treasure', 100, { location: 'cave' });
  wm.assert(goal);
  console.log(`Goal: ${goal.getGoal()}`);
  console.log(`Priority: ${goal.getPriority()}`);
  console.log(`Status: ${goal.getStatus()}`);

  goal.setStatus('active');
  console.log(`Goal now ${goal.getStatus()}`);

  console.log('\n--- BeliefWME: Agent beliefs ---');
  const belief = new BeliefWME('npc_guard', 'player_is_trustworthy', 0.8, true);
  wm.assert(belief);
  console.log(`Belief: ${belief.getBelief()}`);
  console.log(`Confidence: ${belief.getConfidence()}`);
  console.log(`Value: ${belief.getValue()}`);

  belief.setConfidence(0.3);
  console.log(`Confidence decreased to: ${belief.getConfidence()}`);

  console.log('\n--- EventWME: Discrete events ---');
  const event = new EventWME('player_attacked', 'bandit', 'player', { damage: 10 });
  wm.assert(event);
  console.log(`Event: ${event.getEvent()}`);
  console.log(`Actor: ${event.getActor()} attacked Target: ${event.getTarget()}`);
  console.log(`Data:`, event.getData());

  console.log('\nExpected: Specialized WME types for goals, beliefs, and events');
}

// ===== EXAMPLE 6: Inventory, Quest, Sensory WMEs =====

export async function testInventoryQuestSensory(): Promise<void> {
  console.log('\n===== Example 6: Inventory, Quest, Sensory WMEs =====\n');

  const wm = new WorkingMemory(false);

  console.log('--- InventoryWME: Track items ---');
  const sword = new InventoryWME('player', 'iron_sword', 1);
  wm.assert(sword);
  console.log(`${sword.getEntity()} has ${sword.getQuantity()}x ${sword.getItem()}`);

  const gold = new InventoryWME('player', 'gold', 100);
  wm.assert(gold);
  gold.addQuantity(50);
  console.log(`Gold: ${gold.getQuantity()}`);

  console.log('\n--- QuestWME: Quest state ---');
  const quest = new QuestWME('dragon_quest', 'available');
  wm.assert(quest);
  console.log(`Quest: ${quest.getQuestId()} - ${quest.getStatus()}`);

  quest.setStatus('active');
  quest.setProgress({ dragonsSlain: 0, totalDragons: 3 });
  console.log(`Quest now ${quest.getStatus()}`);
  console.log(`Progress:`, quest.getProgress());

  console.log('\n--- SensoryWME: Perceptions ---');
  const sight = new SensoryWME('player', 'sight', 'dragon_approaching', 0.9);
  wm.assert(sight);
  console.log(`${sight.getEntity()} ${sight.getSense()}: ${sight.getStimulus()}`);
  console.log(`Intensity: ${sight.getIntensity()}`);

  const sound = new SensoryWME('player', 'sound', 'roar', 0.8);
  wm.assert(sound);
  console.log(`Heard: ${sound.getStimulus()} (intensity: ${sound.getIntensity()})`);

  console.log('\nExpected: Domain-specific WMEs for inventory, quests, and senses');
}

// ===== EXAMPLE 7: WME Change Listeners =====

export async function testChangeListeners(): Promise<void> {
  console.log('\n===== Example 7: WME Change Listeners =====\n');

  const wm = new WorkingMemory(false);

  console.log('--- Register listener ---');
  wm.addListener(event => {
    console.log(`[LISTENER] ${event.type}: ${event.wme.type}`);
  });

  console.log('\n--- Assert triggers listener ---');
  const wme1 = new WME('Test', { value: 1 });
  wm.assert(wme1);

  console.log('\n--- Modify triggers listener ---');
  wm.modify(wme1, { value: 2 });

  console.log('\n--- Retract triggers listener ---');
  wm.retract(wme1);

  console.log('\nExpected: Listeners notified on assert/modify/retract');
}

// ===== EXAMPLE 8: Behavior Preconditions =====

export async function testBehaviorPreconditions(): Promise<void> {
  console.log('\n===== Example 8: Behavior Preconditions =====\n');

  const wm = new WorkingMemory(false);

  // Set up world state
  wm.assert(new LocationWME('player', 'plaza'));
  wm.assert(new LocationWME('merchant', 'plaza'));
  wm.assert(new InventoryWME('player', 'gold', 100));
  wm.assert(new StateWME('merchant', 'mood', 'happy'));

  console.log('--- Check preconditions for "buy_from_merchant" behavior ---');

  // Precondition 1: Player must be in same location as merchant
  const playerLoc = wm.findOne({
    type: 'Location',
    attributes: { entity: 'player' },
  });
  const merchantLoc = wm.findOne({
    type: 'Location',
    attributes: { entity: 'merchant' },
  });

  const sameLocation =
    playerLoc &&
    merchantLoc &&
    playerLoc.getAttribute('location') === merchantLoc.getAttribute('location');

  console.log(`✓ Player and merchant in same location? ${sameLocation}`);

  // Precondition 2: Player must have gold
  const gold = wm.findOne({
    type: 'Inventory',
    attributes: { entity: 'player', item: 'gold' },
  });
  const hasGold = gold && gold.getAttribute('quantity') > 0;

  console.log(`✓ Player has gold? ${hasGold}`);

  // Precondition 3: Merchant must be happy
  const mood = wm.findOne({
    type: 'State',
    attributes: { entity: 'merchant', state: 'mood' },
  });
  const merchantHappy = mood && mood.getAttribute('value') === 'happy';

  console.log(`✓ Merchant is happy? ${merchantHappy}`);

  // All preconditions met?
  const canBuy = sameLocation && hasGold && merchantHappy;
  console.log(`\n${canBuy ? '✓ Can buy from merchant!' : '✗ Cannot buy from merchant'}`);

  console.log('\nExpected: Preconditions checked against working memory');
}

// ===== EXAMPLE 9: WME Builder Pattern =====

export async function testWMEBuilder(): Promise<void> {
  console.log('\n===== Example 9: WME Builder Pattern =====\n');

  const wm = new WorkingMemory(false);

  console.log('--- Build and assert WME fluently ---');
  const wme = new WMEBuilder('PlayerState')
    .with('entity', 'player')
    .with('health', 100)
    .with('mana', 50)
    .with('stamina', 75)
    .assertInto(wm);

  console.log(`Created: ${wme.toString()}`);
  console.log(`Health: ${wme.getAttribute('health')}`);

  console.log('\n--- Build without asserting ---');
  const wme2 = new WMEBuilder('NPCState')
    .with('entity', 'guard')
    .with('alertLevel', 'low')
    .build();

  console.log(`Built but not asserted: ${wme2.toString()}`);
  console.log(`In working memory? ${wm.has(wme2)}`);

  console.log('\nExpected: Fluent API for building WMEs');
}

// ===== EXAMPLE 10: Helper Functions =====

export async function testHelperFunctions(): Promise<void> {
  console.log('\n===== Example 10: Helper Functions =====\n');

  const wm = new WorkingMemory(false);

  console.log('--- Assert Singleton (only one should exist) ---');
  WMEHelpers.assertSingleton(
    wm,
    'PlayerLocation',
    { entity: 'player' },
    { location: 'plaza' }
  );
  console.log(`WME count: ${wm.count({ type: 'PlayerLocation' })}`);

  WMEHelpers.assertSingleton(
    wm,
    'PlayerLocation',
    { entity: 'player' },
    { location: 'market' }
  );
  console.log(`After update, WME count: ${wm.count({ type: 'PlayerLocation' })}`);
  console.log(`Location: ${wm.findOne({ type: 'PlayerLocation' })?.getAttribute('location')}`);

  console.log('\n--- Get or Create ---');
  const wme1 = WMEHelpers.getOrCreate(
    wm,
    'Counter',
    { name: 'kills' },
    { value: 0 }
  );
  console.log(`Counter created: ${wme1.getAttribute('value')}`);

  const wme2 = WMEHelpers.getOrCreate(
    wm,
    'Counter',
    { name: 'kills' },
    { value: 100 }
  );
  console.log(`Counter retrieved (not recreated): ${wme2.getAttribute('value')}`);
  console.log(`Same WME? ${wme1.id === wme2.id}`);

  console.log('\n--- Increment ---');
  WMEHelpers.increment(wm, wme1, 'value', 5);
  console.log(`After increment: ${wme1.getAttribute('value')}`);

  console.log('\n--- Set/Toggle Flag ---');
  WMEHelpers.setFlag(wm, wme1, 'active', true);
  console.log(`Flag set: ${wme1.getAttribute('active')}`);

  WMEHelpers.toggleFlag(wm, wme1, 'active');
  console.log(`Flag toggled: ${wme1.getAttribute('active')}`);

  console.log('\n--- Retract All ---');
  wm.assert(new WME('Temp', { value: 1 }));
  wm.assert(new WME('Temp', { value: 2 }));
  wm.assert(new WME('Temp', { value: 3 }));
  console.log(`Temp WMEs: ${wm.count({ type: 'Temp' })}`);

  const removed = WMEHelpers.retractAll(wm, { type: 'Temp' });
  console.log(`Removed ${removed} WMEs`);
  console.log(`Temp WMEs: ${wm.count({ type: 'Temp' })}`);

  console.log('\nExpected: Helper functions simplify common operations');
}

// ===== EXAMPLE 11: Statistics and Debugging =====

export async function testStatisticsDebugging(): Promise<void> {
  console.log('\n===== Example 11: Statistics and Debugging =====\n');

  const wm = new WorkingMemory(false);

  // Add various WMEs
  wm.assert(new LocationWME('player', 'plaza'));
  wm.assert(new LocationWME('merchant', 'plaza'));
  wm.assert(new StateWME('player', 'health', 100));
  wm.assert(new StateWME('player', 'mana', 50));
  wm.assert(new InventoryWME('player', 'sword', 1));
  wm.assert(new InventoryWME('player', 'gold', 100));
  wm.assert(new GoalWME('player', 'find_treasure', 100));

  console.log('--- Statistics ---');
  const stats = wm.getStats();
  console.log(`Total WMEs: ${stats.totalWMEs}`);
  console.log(`Type count: ${stats.typeCount}`);
  console.log('Types:');
  for (const [type, count] of Object.entries(stats.types)) {
    console.log(`  ${type}: ${count}`);
  }

  console.log('\n--- Dump Working Memory ---');
  wm.dump();

  console.log('Expected: Statistics and debugging tools available');
}

// ===== EXAMPLE 12: Export/Import for Save Files =====

export async function testExportImport(): Promise<void> {
  console.log('\n===== Example 12: Export/Import for Save Files =====\n');

  const wm1 = new WorkingMemory(false);

  console.log('--- Create game state ---');
  wm1.assert(new LocationWME('player', 'dungeon'));
  wm1.assert(new StateWME('player', 'health', 75));
  wm1.assert(new InventoryWME('player', 'key', 1));
  wm1.assert(new QuestWME('escape_dungeon', 'active'));

  console.log(`WMEs in session 1: ${wm1.getAll().length}`);

  console.log('\n--- Export (save game) ---');
  const saveData = wm1.export();
  const saveString = JSON.stringify(saveData);
  console.log(`Save data size: ${saveString.length} characters`);

  console.log('\n--- New session ---');
  const wm2 = new WorkingMemory(false);
  console.log(`WMEs in session 2: ${wm2.getAll().length}`);

  console.log('\n--- Import (load game) ---');
  wm2.import(JSON.parse(saveString));
  console.log(`WMEs after import: ${wm2.getAll().length}`);

  console.log('\n--- Verify data ---');
  const playerLoc = wm2.findOne({
    type: 'Location',
    attributes: { entity: 'player' },
  });
  console.log(`Player location: ${playerLoc?.getAttribute('location')}`);

  const quest = wm2.findOne({ type: 'Quest' });
  console.log(`Quest status: ${quest?.getAttribute('status')}`);

  console.log('\nExpected: Working memory persists across sessions');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllWMEExamples(): Promise<void> {
  await testBasicWMECreation();
  await new Promise(r => setTimeout(r, 500));

  await testAssertRetractModify();
  await new Promise(r => setTimeout(r, 500));

  await testQueryingPatternMatching();
  await new Promise(r => setTimeout(r, 500));

  await testTypedWMEs();
  await new Promise(r => setTimeout(r, 500));

  await testGoalBeliefEvent();
  await new Promise(r => setTimeout(r, 500));

  await testInventoryQuestSensory();
  await new Promise(r => setTimeout(r, 500));

  await testChangeListeners();
  await new Promise(r => setTimeout(r, 500));

  await testBehaviorPreconditions();
  await new Promise(r => setTimeout(r, 500));

  await testWMEBuilder();
  await new Promise(r => setTimeout(r, 500));

  await testHelperFunctions();
  await new Promise(r => setTimeout(r, 500));

  await testStatisticsDebugging();
  await new Promise(r => setTimeout(r, 500));

  await testExportImport();
}

// Run if executed directly
if (require.main === module) {
  runAllWMEExamples().catch(console.error);
}
