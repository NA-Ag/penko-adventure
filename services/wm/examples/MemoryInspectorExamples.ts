/**
 * MemoryInspector Examples - FACADE 5.7
 *
 * Demonstrates memory debugging and inspection tools.
 */

import {
  MemoryInspector,
  MultiMemoryInspector,
  InspectorHelpers,
  InspectorFilter,
  DisplayOptions,
} from '../MemoryInspector';
import { WorkingMemory } from '../WorkingMemory';
import { WME, LocationWME, StateWME, RelationWME } from '../WME';
import { TemporalWorkingMemory } from '../TemporalMemory';
import { ConditionalWorkingMemory, ConditionalHelpers } from '../ConditionalMemory';
import { ReflectiveWorkingMemory, ReflectiveHelpers } from '../ReflectiveMemory';
import { MultiMemoryManager } from '../MultiMemory';

console.log('='.repeat(80));
console.log('FACADE 5.7: MEMORY INSPECTOR EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Inspection - View All WMEs
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Inspection - View All WMEs');
console.log('='.repeat(80));

const wm1 = new WorkingMemory();
const inspector1 = new MemoryInspector(wm1);

// Add some WMEs
wm1.assert(new LocationWME('player', 'town_square'));
wm1.assert(new LocationWME('merchant', 'shop'));
wm1.assert(new StateWME('player', 'health', 100));
wm1.assert(new StateWME('player', 'mana', 50));
wm1.assert(new RelationWME('player', 'friendsWith', 'merchant', 75));

console.log('\nDisplaying all WMEs:');
inspector1.display();

// ============================================================================
// Example 2: Filtered Inspection - Filter by Type
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Filtered Inspection - Filter by Type');
console.log('='.repeat(80));

const wm2 = new WorkingMemory();
const inspector2 = new MemoryInspector(wm2);

// Add various WMEs
wm2.assert(new LocationWME('player', 'forest'));
wm2.assert(new LocationWME('guard', 'gate'));
wm2.assert(new StateWME('player', 'stamina', 80));
wm2.assert(new StateWME('player', 'hunger', 30));
wm2.assert(new WME('Quest', { id: 'main_quest', status: 'active' }));

console.log('\nFiltering by type "Location":');
inspector2.display({ type: 'Location' }, { groupByType: true });

console.log('\nFiltering by type "State":');
inspector2.display({ type: 'State' }, { verbose: true, showTimestamps: true });

// ============================================================================
// Example 3: Statistics
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Memory Statistics');
console.log('='.repeat(80));

const wm3 = new WorkingMemory();
const inspector3 = new MemoryInspector(wm3);

// Add many WMEs
for (let i = 0; i < 10; i++) {
  wm3.assert(new LocationWME(`npc_${i}`, `location_${i % 3}`));
}

for (let i = 0; i < 15; i++) {
  wm3.assert(new StateWME(`entity_${i}`, 'status', 'active'));
}

for (let i = 0; i < 5; i++) {
  wm3.assert(new WME('Quest', { id: `quest_${i}`, status: 'pending' }));
}

console.log('\nMemory Statistics:');
inspector3.displayStats();

// ============================================================================
// Example 4: Filtering with Patterns
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Advanced Filtering - Regex and Attributes');
console.log('='.repeat(80));

const wm4 = new WorkingMemory();
const inspector4 = new MemoryInspector(wm4);

// Add WMEs
wm4.assert(new WME('Enemy', { name: 'Goblin', health: 50 }));
wm4.assert(new WME('Enemy', { name: 'Orc', health: 100 }));
wm4.assert(new WME('Ally', { name: 'Knight', health: 150 }));
wm4.assert(new WME('Ally', { name: 'Wizard', health: 80 }));

console.log('\nAll enemies and allies:');
inspector4.display({ typePattern: /^(Enemy|Ally)$/ }, { groupByType: true });

console.log('\nLow health entities (< 100):');
inspector4.display(
  {
    customFilter: (wme) => {
      const health = wme.getAttribute('health');
      return typeof health === 'number' && health < 100;
    },
  },
  { verbose: true }
);

// ============================================================================
// Example 5: Change Tracking
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Change Tracking');
console.log('='.repeat(80));

const wm5 = new WorkingMemory();
const inspector5 = new MemoryInspector(wm5, true); // Enable tracking

console.log('\nTracking changes...');

// Make some changes
const player = new StateWME('player', 'health', 100);
wm5.assert(player);

await new Promise((resolve) => setTimeout(resolve, 100));

player.setAttribute('health', 75);
wm5.modify(player, { health: 75 });

await new Promise((resolve) => setTimeout(resolve, 100));

wm5.retract(player);

console.log('\nChange History:');
inspector5.displayChangeHistory();

// ============================================================================
// Example 6: Snapshots and Comparison
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Snapshots and Comparison');
console.log('='.repeat(80));

const wm6 = new WorkingMemory();
const inspector6 = new MemoryInspector(wm6);

// Initial state
wm6.assert(new LocationWME('player', 'town'));
wm6.assert(new StateWME('player', 'health', 100));
wm6.assert(new WME('Quest', { id: 'quest1', status: 'active' }));

console.log('\nCreating "before" snapshot...');
inspector6.createSnapshot('before', { note: 'Initial state' });

// Make changes
await new Promise((resolve) => setTimeout(resolve, 100));

wm6.assert(new LocationWME('npc1', 'town'));
wm6.assert(new LocationWME('npc2', 'forest'));
wm6.assert(new WME('Quest', { id: 'quest2', status: 'active' }));

console.log('\nCreating "after" snapshot...');
inspector6.createSnapshot('after', { note: 'After adding NPCs' });

console.log('\nComparing snapshots:');
inspector6.compareSnapshots('before', 'after');

// ============================================================================
// Example 7: Temporal Memory Inspection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Temporal Memory Inspection');
console.log('='.repeat(80));

const wm7 = new TemporalWorkingMemory(false, 100);
const inspector7 = new MemoryInspector(wm7);

// Add temporal WMEs
wm7.assertTemporary('Effect', { name: 'speed_boost', active: true }, 5000);
wm7.assertTemporary('Effect', { name: 'strength', active: true }, 3000);
wm7.assert(new StateWME('player', 'status', 'normal'));

console.log('\nInspecting temporal memory:');
inspector7.display(
  { isTransient: true },
  { verbose: true, showExpiration: true, showTimestamps: true }
);

wm7.destroy();

// ============================================================================
// Example 8: Conditional Memory Inspection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Conditional Memory Inspection');
console.log('='.repeat(80));

const wm8 = new ConditionalWorkingMemory(false, 100);
const inspector8 = new MemoryInspector(wm8);

// Add conditional WMEs
const buff1 = ConditionalHelpers.createBuff(wm8, 'player', 'strength', 10000);
const buff2 = ConditionalHelpers.createBuff(wm8, 'player', 'speed', 5000);
const combatMode = ConditionalHelpers.createCombatMode(wm8, 'player');

console.log('\nInspecting conditional WMEs:');
inspector8.display(
  { isConditional: true },
  { verbose: true, showExpiration: true }
);

console.log('\nConditional memory statistics:');
inspector8.displayStats();

wm8.destroy();

// ============================================================================
// Example 9: Reflective Memory Inspection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Reflective Memory Inspection - Beliefs');
console.log('='.repeat(80));

const wm9 = new ReflectiveWorkingMemory();
const inspector9 = new MemoryInspector(wm9);

// Create fact and beliefs
const treasure = new LocationWME('treasure', 'cave');
wm9.assert(treasure);

const playerBelief = wm9.assertBeliefAbout('player', 'treasure in cave', 0.9, treasure.id);
const guardBelief = wm9.assertBeliefAbout('guard', 'treasure in castle', 0.6, treasure.id);

console.log('\nInspecting reflective memory:');
inspector9.display(
  { isMeta: true },
  { verbose: true, showReferences: true }
);

// ============================================================================
// Example 10: Multi-Memory Inspection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Multi-Memory Inspection');
console.log('='.repeat(80));

const multiManager = new MultiMemoryManager();
const multiInspector = new MultiMemoryInspector(multiManager);

// Add to different memory spaces
multiManager.assertWorldState(new StateWME('world', 'time', 'day'));
multiManager.assertSharedFact(new LocationWME('treasure', 'cave'));

multiManager.assertAgentBelief('guard', new StateWME('player', 'suspicious', true));
multiManager.assertAgentBelief('merchant', new StateWME('player', 'friendly', true));

console.log('\nDisplaying all memory spaces:');
multiInspector.displayAll();

console.log('\nDisplaying guard knowledge:');
multiInspector.displayAgentKnowledge('guard');

// ============================================================================
// Example 11: Testing Tools
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Testing Tools - Manual Assert/Retract');
console.log('='.repeat(80));

const wm11 = new WorkingMemory();
const inspector11 = new MemoryInspector(wm11);

console.log('\nManually asserting test WMEs:');
const test1 = inspector11.testAssert('TestWME', { test: 'value1' });
const test2 = inspector11.testAssert('TestWME', { test: 'value2' });

console.log('\nCurrent state:');
inspector11.display({ type: 'TestWME' });

console.log('\nRetracting test WME:');
inspector11.testRetract(test1);

console.log('\nAfter retract:');
inspector11.display({ type: 'TestWME' });

console.log('\nClearing all:');
inspector11.testClear();

console.log('\nAfter clear:');
inspector11.displayStats();

// ============================================================================
// Example 12: Quick Helper Functions
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Quick Helper Functions');
console.log('='.repeat(80));

const wm12 = new WorkingMemory();

// Add some WMEs
wm12.assert(new LocationWME('player', 'town'));
wm12.assert(new StateWME('player', 'health', 100));
wm12.assert(new WME('Quest', { id: 'main', status: 'active' }));

console.log('\n--- Quick Inspect ---');
InspectorHelpers.inspect(wm12);

console.log('\n--- Quick Stats ---');
InspectorHelpers.stats(wm12);

console.log('\n--- Quick Filter ---');
InspectorHelpers.filter(wm12, { type: 'Location' });

// ============================================================================
// Example 13: Export/Import
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 13: Export/Import Memory State');
console.log('='.repeat(80));

const wm13 = new WorkingMemory();
const inspector13 = new MemoryInspector(wm13, true);

// Add WMEs
wm13.assert(new LocationWME('player', 'dungeon'));
wm13.assert(new StateWME('player', 'health', 75));
wm13.assert(new WME('Quest', { id: 'rescue', status: 'active' }));

console.log('\nOriginal memory:');
inspector13.displayStats();

// Export
const exported = inspector13.export();
console.log('\nExported data:');
console.log(`  Timestamp: ${new Date(exported.timestamp).toISOString()}`);
console.log(`  WMEs: ${exported.wmes.length}`);
console.log(`  Stats: ${JSON.stringify(exported.stats.byType)}`);

// Clear and import
wm13.clear();
console.log('\nAfter clearing:');
inspector13.displayStats();

inspector13.import(exported);
console.log('\nAfter importing:');
inspector13.displayStats();

// ============================================================================
// Example 14: Practical Use Case - Debug NPC Beliefs
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 14: Practical Use Case - Debug NPC Beliefs');
console.log('='.repeat(80));

const gameMemory = new ReflectiveWorkingMemory();
const gameInspector = new MemoryInspector(gameMemory, true);

console.log('\n--- GAME SCENARIO: Investigating NPC Beliefs ---\n');

// Create game state
const playerLocation = new LocationWME('player', 'tavern');
gameMemory.assert(playerLocation);

// NPCs have different beliefs about player
gameMemory.assertBeliefAbout('bartender', 'player is friendly', 0.8, playerLocation.id);
gameMemory.assertBeliefAbout('thief', 'player is wealthy', 0.9, playerLocation.id);
gameMemory.assertBeliefAbout('guard', 'player is suspicious', 0.6, playerLocation.id);

console.log('Game state created. NPCs have beliefs about player.');

// Developer wants to inspect beliefs
console.log('\n--- INSPECTOR: All Beliefs ---');
gameInspector.display(
  { isMeta: true },
  { verbose: true, showReferences: true, groupByType: true }
);

// Track changes as player interacts
console.log('\n--- GAME EVENT: Player helps bartender ---');
const bartenderBelief = gameMemory.query({ type: 'BeliefAboutWME', attributes: { agent: 'bartender' } })[0];
bartenderBelief.setAttribute('confidence', 1.0);
gameMemory.modify(bartenderBelief, { confidence: 1.0 });

console.log('\n--- GAME EVENT: Guard loses suspicion ---');
const guardBelief = gameMemory.query({ type: 'BeliefAboutWME', attributes: { agent: 'guard' } })[0];
gameMemory.retract(guardBelief);

// Check changes
console.log('\n--- INSPECTOR: Change History ---');
gameInspector.displayChangeHistory();

console.log('\n--- INSPECTOR: Current Beliefs ---');
gameInspector.display({ isMeta: true }, { verbose: false });

console.log('\n--- DEBUG COMPLETE ---');

console.log('\n' + '='.repeat(80));
console.log('FACADE 5.7 EXAMPLES COMPLETE');
console.log('='.repeat(80));

// Helper for async operations
async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
