/**
 * RuleEngine Examples - FACADE 6.1
 *
 * Demonstrates rule-based reactive behaviors.
 */

import {
  Rule,
  RuleBuilder,
  RulePatterns,
  RuleActions,
} from '../Rule';
import {
  RuleEngine,
  RuleEngineBuilder,
  ConflictResolution,
  ExecutionMode,
} from '../RuleEngine';
import { WorkingMemory } from '../../wm/WorkingMemory';
import { WME, StateWME, RelationWME, LocationWME } from '../../wm/WME';

console.log('='.repeat(80));
console.log('FACADE 6.1: RULE ENGINE EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Rule - React to Player Insult
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Rule - React to Player Insult');
console.log('='.repeat(80));

const wm1 = new WorkingMemory();
const engine1 = new RuleEngine(wm1, { debug: true });

// Create rule: When player insults NPC, reduce relationship
const insultRule = new RuleBuilder()
  .named('React to Insult')
  .describedAs('NPC gets angry when player insults them')
  .whenType('Conversation', { sentiment: 'negative', isInsult: true }, 'insult')
  .whenType('Relation', { subject: 'player' }, 'relation')
  .then(
    RuleActions.modify('relation', (wme) => ({
      trust: Math.max(0, wme.getAttribute('trust') - 20),
    }))
  )
  .then(
    RuleActions.log(
      () => 'NPC relationship decreased due to insult!'
    )
  )
  .withPriority(80)
  .build();

engine1.addRule(insultRule);

// Setup game state
wm1.assert(new RelationWME('player', 'friendsWith', 'merchant', 50));

console.log('\nInitial state: trust = 50');

// Player insults merchant
wm1.assert(
  new WME('Conversation', { sentiment: 'negative', isInsult: true })
);

console.log('\nRunning rule engine...');
engine1.run();

// Check updated trust
const relation = wm1.findOne({ type: 'Relation' });
console.log(`\nAfter insult: trust = ${relation?.getAttribute('trust')}`);

// ============================================================================
// Example 2: Pattern Matching with Wildcards
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Pattern Matching with Wildcards');
console.log('='.repeat(80));

const wm2 = new WorkingMemory();
const engine2 = new RuleEngine(wm2, { debug: true });

// Rule: When any enemy has low health, mark as vulnerable
const lowHealthRule = new RuleBuilder()
  .named('Mark Low Health Enemies')
  .describedAs('Mark enemies with low health as vulnerable')
  .when(
    RulePatterns.matching(
      'Enemy',
      (wme) => {
        const health = wme.getAttribute('health');
        return typeof health === 'number' && health < 30;
      },
      'enemy'
    )
  )
  .then(
    RuleActions.modify('enemy', (wme) => ({
      vulnerable: true,
    }))
  )
  .then(
    RuleActions.log((bindings) => {
      const enemy = bindings.get('enemy')!;
      return `Enemy ${enemy.getAttribute('name')} marked as vulnerable!`;
    })
  )
  .build();

engine2.addRule(lowHealthRule);

// Add enemies
wm2.assert(new WME('Enemy', { name: 'Goblin', health: 25 }));
wm2.assert(new WME('Enemy', { name: 'Orc', health: 80 }));
wm2.assert(new WME('Enemy', { name: 'Troll', health: 15 }));

console.log('\nRunning rule engine...');
engine2.run();

console.log('\nVulnerable enemies:');
const enemies = wm2.query({
  type: 'Enemy',
  filter: (wme) => wme.getAttribute('vulnerable') === true,
});
for (const enemy of enemies) {
  console.log(`  - ${enemy.getAttribute('name')} (health: ${enemy.getAttribute('health')})`);
}

// ============================================================================
// Example 3: Variable Binding
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Variable Binding - Same Location');
console.log('='.repeat(80));

const wm3 = new WorkingMemory();
const engine3 = new RuleEngine(wm3, { debug: true });

// Rule: When player and NPC are in same location, initiate conversation
const sameLocationRule = new RuleBuilder()
  .named('Same Location Conversation')
  .describedAs('NPCs greet player when in same location')
  .when({
    type: 'Location',
    attributes: { entity: 'player', location: '$loc' },
    bindTo: 'playerLoc',
  })
  .when({
    type: 'Location',
    attributes: { entity: '$npc', location: '$loc' },
    bindTo: 'npcLoc',
  })
  .validate((bindings) => {
    const npcLoc = bindings.get('npcLoc')!;
    return npcLoc.getAttribute('entity') !== 'player'; // Don't match player with self
  })
  .then(
    RuleActions.assert((bindings) => {
      const npcLoc = bindings.get('npcLoc')!;
      const npc = npcLoc.getAttribute('entity');
      const location = npcLoc.getAttribute('location');
      return new WME('Greeting', {
        from: npc,
        to: 'player',
        location,
      });
    })
  )
  .then(
    RuleActions.log((bindings) => {
      const npcLoc = bindings.get('npcLoc')!;
      const npc = npcLoc.getAttribute('entity');
      const location = npcLoc.getAttribute('location');
      return `${npc} greets player at ${location}`;
    })
  )
  .build();

engine3.addRule(sameLocationRule);

// Setup locations
wm3.assert(new LocationWME('player', 'town_square'));
wm3.assert(new LocationWME('merchant', 'town_square'));
wm3.assert(new LocationWME('guard', 'town_square'));
wm3.assert(new LocationWME('wizard', 'tower'));

console.log('\nRunning rule engine...');
engine3.run();

console.log('\nGreetings generated:');
const greetings = wm3.getByType('Greeting');
for (const greeting of greetings) {
  console.log(
    `  - ${greeting.getAttribute('from')} -> ${greeting.getAttribute('to')} at ${greeting.getAttribute('location')}`
  );
}

// ============================================================================
// Example 4: Priority-Based Execution
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Priority-Based Execution');
console.log('='.repeat(80));

const wm4 = new WorkingMemory();
const engine4 = new RuleEngine(wm4, {
  debug: true,
  conflictResolution: ConflictResolution.PRIORITY,
});

// High priority rule: Flee from danger
const fleeRule = new RuleBuilder()
  .named('Flee from Danger')
  .whenType('Danger', { level: 'high' })
  .then(RuleActions.log(() => '[HIGH PRIORITY] Fleeing from danger!'))
  .withPriority(100)
  .build();

// Medium priority rule: Greet player
const greetRule = new RuleBuilder()
  .named('Greet Player')
  .whenType('Player', { present: true })
  .then(RuleActions.log(() => '[MEDIUM PRIORITY] Greeting player'))
  .withPriority(50)
  .build();

// Low priority rule: Idle behavior
const idleRule = new RuleBuilder()
  .named('Idle Behavior')
  .whenType('NPC', { state: 'idle' })
  .then(RuleActions.log(() => '[LOW PRIORITY] Performing idle animation'))
  .withPriority(10)
  .build();

engine4.addRule(fleeRule);
engine4.addRule(greetRule);
engine4.addRule(idleRule);

// Trigger all rules
wm4.assert(new WME('Danger', { level: 'high' }));
wm4.assert(new WME('Player', { present: true }));
wm4.assert(new WME('NPC', { state: 'idle' }));

console.log('\nRunning with priority resolution (highest first):');
engine4.run();

// ============================================================================
// Example 5: Exhaustive Execution
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Exhaustive Execution - Chain Reactions');
console.log('='.repeat(80));

const wm5 = new WorkingMemory();
const engine5 = new RuleEngine(wm5, {
  debug: true,
  executionMode: ExecutionMode.EXHAUSTIVE,
  maxCycles: 10,
});

// Rule 1: Low health creates "NeedHealing" WME
const needHealingRule = new RuleBuilder()
  .named('Detect Low Health')
  .when(
    RulePatterns.matching(
      'Health',
      (wme) => wme.getAttribute('value') < 50
    )
  )
  .then(
    RuleActions.assert(() => new WME('NeedHealing', { urgent: true }))
  )
  .then(RuleActions.log(() => 'Detected low health, need healing'))
  .build();

// Rule 2: "NeedHealing" triggers potion use
const usePotionRule = new RuleBuilder()
  .named('Use Potion')
  .whenType('NeedHealing', { urgent: true }, 'need')
  .whenType('Inventory', { item: 'health_potion' }, 'potion')
  .then(RuleActions.retract('need'))
  .then(RuleActions.retract('potion'))
  .then(
    RuleActions.assert(() => new WME('Health', { value: 100 }))
  )
  .then(RuleActions.log(() => 'Used potion, health restored'))
  .build();

engine5.addRule(needHealingRule);
engine5.addRule(usePotionRule);

// Initial state
wm5.assert(new WME('Health', { value: 30 }));
wm5.assert(new WME('Inventory', { item: 'health_potion' }));

console.log('\nRunning exhaustive execution (chain reaction):');
engine5.run();

console.log('\nFinal health:');
const health = wm5.findOne({ type: 'Health' });
console.log(`  Health: ${health?.getAttribute('value')}`);

// ============================================================================
// Example 6: Complex Pattern Matching
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Complex Pattern Matching - Quest Completion');
console.log('='.repeat(80));

const wm6 = new WorkingMemory();
const engine6 = new RuleEngine(wm6, { debug: true });

// Rule: Quest completes when all objectives met
const questCompleteRule = new RuleBuilder()
  .named('Quest Complete')
  .whenType('Quest', { id: '$questId', status: 'active' }, 'quest')
  .whenType('Objective', { questId: '$questId', completed: true }, 'obj1')
  .whenType('Objective', { questId: '$questId', completed: true }, 'obj2')
  .validate((bindings) => {
    // Ensure objectives are different
    const obj1 = bindings.get('obj1')!;
    const obj2 = bindings.get('obj2')!;
    return obj1.id !== obj2.id;
  })
  .then(
    RuleActions.modify('quest', () => ({ status: 'completed' }))
  )
  .then(
    RuleActions.log((bindings) => {
      const quest = bindings.get('quest')!;
      return `Quest "${quest.getAttribute('id')}" completed!`;
    })
  )
  .build();

engine6.addRule(questCompleteRule);

// Setup quest with objectives
wm6.assert(new WME('Quest', { id: 'rescue_princess', status: 'active' }));
wm6.assert(new WME('Objective', { questId: 'rescue_princess', name: 'find_key', completed: true }));
wm6.assert(new WME('Objective', { questId: 'rescue_princess', name: 'defeat_dragon', completed: true }));

console.log('\nRunning rule engine...');
engine6.run();

const quest = wm6.findOne({ type: 'Quest' });
console.log(`\nQuest status: ${quest?.getAttribute('status')}`);

// ============================================================================
// Example 7: Rule Engine Builder
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Rule Engine Builder');
console.log('='.repeat(80));

const wm7 = new WorkingMemory();

// Build engine with fluent API
const engine7 = new RuleEngineBuilder()
  .withWorkingMemory(wm7)
  .withConflictResolution(ConflictResolution.PRIORITY)
  .withExecutionMode(ExecutionMode.ONCE)
  .withDebug(true)
  .addRule(
    new RuleBuilder()
      .named('High Priority Rule')
      .whenType('Event', { type: 'important' })
      .then(RuleActions.log(() => 'Important event handled'))
      .withPriority(90)
      .build()
  )
  .addRule(
    new RuleBuilder()
      .named('Low Priority Rule')
      .whenType('Event', { type: 'minor' })
      .then(RuleActions.log(() => 'Minor event handled'))
      .withPriority(10)
      .build()
  )
  .build();

wm7.assert(new WME('Event', { type: 'important' }));
wm7.assert(new WME('Event', { type: 'minor' }));

console.log('\nRunning built engine:');
engine7.run();

// ============================================================================
// Example 8: Statistics and Monitoring
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Statistics and Monitoring');
console.log('='.repeat(80));

const wm8 = new WorkingMemory();
const engine8 = new RuleEngine(wm8, { trackStats: true });

const statsRule = new RuleBuilder()
  .named('Stats Rule')
  .whenType('TestWME')
  .then(RuleActions.log(() => 'Rule fired'))
  .build();

engine8.addRule(statsRule);

// Fire multiple times
for (let i = 0; i < 5; i++) {
  wm8.assert(new WME('TestWME', { index: i }));
  engine8.run();
  wm8.clear();
}

console.log('\nDisplaying statistics:');
engine8.displayStats();

// ============================================================================
// Example 9: Practical Use Case - Combat System
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Practical Use Case - Combat System');
console.log('='.repeat(80));

const wm9 = new WorkingMemory();
const engine9 = new RuleEngine(wm9, {
  debug: false,
  executionMode: ExecutionMode.EXHAUSTIVE,
});

// Rule 1: Enemy attacks when player is in range
const attackRule = new RuleBuilder()
  .named('Enemy Attack')
  .whenType('Enemy', { state: 'aggressive', inRange: true }, 'enemy')
  .whenType('Player', { health: '$health' }, 'player')
  .then(
    RuleActions.modify('player', (wme) => {
      const health = wme.getAttribute('health');
      return { health: Math.max(0, health - 10) };
    })
  )
  .then(
    RuleActions.log((bindings) => {
      const enemy = bindings.get('enemy')!;
      return `${enemy.getAttribute('name')} attacks! Player takes 10 damage`;
    })
  )
  .withPriority(80)
  .build();

// Rule 2: Player defeated when health reaches 0
const defeatRule = new RuleBuilder()
  .named('Player Defeated')
  .whenType('Player', { health: 0 }, 'player')
  .then(
    RuleActions.assert(() => new WME('GameOver', { reason: 'defeated' }))
  )
  .then(RuleActions.log(() => 'Player defeated!'))
  .withPriority(100)
  .build();

// Rule 3: Victory when all enemies defeated
const victoryRule = new RuleBuilder()
  .named('Victory')
  .whenType('Player', { health: '$health' })
  .validate((_, wm) => {
    // No enemies left
    return wm.count({ type: 'Enemy' }) === 0;
  })
  .then(
    RuleActions.assert(() => new WME('GameOver', { reason: 'victory' }))
  )
  .then(RuleActions.log(() => 'Victory! All enemies defeated'))
  .withPriority(100)
  .build();

engine9.addRule(attackRule);
engine9.addRule(defeatRule);
engine9.addRule(victoryRule);

// Setup combat
console.log('\n--- COMBAT SCENARIO ---\n');
wm9.assert(new WME('Player', { health: 25 }));
wm9.assert(new WME('Enemy', { name: 'Goblin', state: 'aggressive', inRange: true }));
wm9.assert(new WME('Enemy', { name: 'Orc', state: 'aggressive', inRange: true }));

console.log('Initial: Player health = 25, 2 enemies');
console.log('\nRunning combat simulation...\n');

engine9.run();

// Check outcome
const gameOver = wm9.findOne({ type: 'GameOver' });
const player = wm9.findOne({ type: 'Player' });

console.log('\n--- COMBAT RESULT ---');
if (gameOver) {
  console.log(`Result: ${gameOver.getAttribute('reason')}`);
}
console.log(`Player final health: ${player?.getAttribute('health') || 0}`);

console.log('\n' + '='.repeat(80));
console.log('FACADE 6.1 EXAMPLES COMPLETE');
console.log('='.repeat(80));
