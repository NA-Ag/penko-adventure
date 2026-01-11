/**
 * Shadow Facts Examples - FACADE 6.2
 *
 * Demonstrates automatic WME → shadow fact synchronization and rule triggering.
 */

import {
  ShadowFactManager,
  ShadowFactIntegration,
  ShadowFactHelpers,
  ShadowFact,
} from '../ShadowFacts';
import { WorkingMemory } from '../../wm/WorkingMemory';
import { RuleEngine, ConflictResolution, ExecutionMode } from '../RuleEngine';
import { Rule, RuleBuilder, RuleActions } from '../Rule';
import { WME, LocationWME, StateWME, RelationWME } from '../../wm/WME';

console.log('='.repeat(80));
console.log('FACADE 6.2: SHADOW FACTS EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Shadow Fact Creation
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Shadow Fact Creation');
console.log('='.repeat(80));

const wm1 = new WorkingMemory();
const engine1 = new RuleEngine(wm1, { debug: false });
const shadowManager1 = new ShadowFactManager(wm1, engine1, true);

console.log('\nAsserting WMEs and creating shadows:');

// Add WMEs - shadows are automatically created
wm1.assert(new LocationWME('player', 'town'));
wm1.assert(new StateWME('player', 'health', 100));
wm1.assert(new StateWME('player', 'mana', 50));

console.log('\nShadow Facts Statistics:');
shadowManager1.displayStats();

// ============================================================================
// Example 2: Automatic Rule Triggering on WME Changes
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Automatic Rule Triggering on WME Changes');
console.log('='.repeat(80));

const wm2 = new WorkingMemory();
const engine2 = new RuleEngine(wm2, { debug: true });

// Add rule that reacts to low health
const lowHealthRule = new RuleBuilder()
  .named('Low Health Alert')
  .describedAs('Alert when player health is low')
  .whenType('State', { attribute: 'health' }, 'healthWME')
  .validate((bindings) => {
    const healthWME = bindings.get('healthWME')!;
    const health = healthWME.getAttribute('value');
    return typeof health === 'number' && health < 30;
  })
  .then((bindings) => {
    const healthWME = bindings.get('healthWME')!;
    console.log(`\n>>> ALERT: ${healthWME.getAttribute('entity')} health is ${healthWME.getAttribute('value')}!`);
  })
  .withPriority(100)
  .build();

engine2.addRule(lowHealthRule);

const integration2 = new ShadowFactIntegration(wm2, engine2, true);
integration2.enableAutoFire();

console.log('\nInitial state (healthy):');
const playerHealth = new StateWME('player', 'health', 100);
wm2.assert(playerHealth);

console.log('\nReducing health to 25 (should trigger rule):');
playerHealth.setAttribute('health', 25);
wm2.modify(playerHealth, { value: 25 });

// ============================================================================
// Example 3: Shadow Query and Inspection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Shadow Query and Inspection');
console.log('='.repeat(80));

const wm3 = new WorkingMemory();
const engine3 = new RuleEngine(wm3);
const shadowManager3 = new ShadowFactManager(wm3, engine3);

// Add various WMEs
wm3.assert(new LocationWME('player', 'forest'));
wm3.assert(new LocationWME('npc1', 'forest'));
wm3.assert(new LocationWME('npc2', 'town'));
wm3.assert(new StateWME('player', 'stamina', 80));
wm3.assert(new StateWME('player', 'hunger', 40));

console.log('\nAll shadows:');
console.log(`Total: ${shadowManager3.getAllShadows().length}`);

console.log('\nLocation shadows:');
const locationShadows = shadowManager3.getShadowsByType('Location');
for (const shadow of locationShadows) {
  console.log(`  - ${shadow.type}: ${shadow.attributes.get('entity')} at ${shadow.attributes.get('location')}`);
}

console.log('\nQuerying shadows (Location in forest):');
const forestShadows = shadowManager3.query('Location', { location: 'forest' });
console.log(`Found ${forestShadows.length} entities in forest`);

// ============================================================================
// Example 4: Batch Updates for Performance
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Batch Updates for Performance');
console.log('='.repeat(80));

const wm4 = new WorkingMemory();
const engine4 = new RuleEngine(wm4, { debug: false });
const integration4 = new ShadowFactIntegration(wm4, engine4);

let ruleFireCount = 0;

// Add rule that counts fires
const batchTestRule = new RuleBuilder()
  .named('Batch Test Rule')
  .whenType('State', {}, 'state')
  .then(() => {
    ruleFireCount++;
  })
  .build();

engine4.addRule(batchTestRule);
integration4.enableAutoFire();

console.log('\nAdding 10 WMEs without batching:');
ruleFireCount = 0;
for (let i = 0; i < 10; i++) {
  wm4.assert(new StateWME(`entity${i}`, 'status', 'active'));
}
console.log(`Rule fired ${ruleFireCount} times`);

// Clear and try with batching
wm4.clear();
ruleFireCount = 0;

console.log('\nAdding 10 WMEs WITH batching:');
integration4.batch(() => {
  for (let i = 0; i < 10; i++) {
    wm4.assert(new StateWME(`entity${i}`, 'status', 'active'));
  }
});
console.log(`Rule fired ${ruleFireCount} times (batched)`);

// ============================================================================
// Example 5: Affected Rules Tracking
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Affected Rules Tracking');
console.log('='.repeat(80));

const wm5 = new WorkingMemory();
const engine5 = new RuleEngine(wm5);

// Add rules for different types
const locationRule = new RuleBuilder()
  .named('Location Rule')
  .whenType('Location')
  .then(() => {})
  .build();

const stateRule = new RuleBuilder()
  .named('State Rule')
  .whenType('State')
  .then(() => {})
  .build();

const healthRule = new RuleBuilder()
  .named('Health Rule')
  .whenType('State', { attribute: 'health' })
  .then(() => {})
  .build();

engine5.addRule(locationRule);
engine5.addRule(stateRule);
engine5.addRule(healthRule);

const shadowManager5 = new ShadowFactManager(wm5, engine5, true);

console.log('\nAsserting Location WME:');
const loc = new LocationWME('player', 'town');
wm5.assert(loc);

const locShadow = shadowManager5.getShadow(loc.id);
console.log(`Affected rules: ${Array.from(locShadow!.affectedRules).join(', ')}`);

console.log('\nAsserting State WME (health):');
const health = new StateWME('player', 'health', 100);
wm5.assert(health);

const healthShadow = shadowManager5.getShadow(health.id);
console.log(`Affected rules: ${Array.from(healthShadow!.affectedRules).join(', ')}`);

// ============================================================================
// Example 6: Shadow Fact Lifecycle - Assert, Modify, Retract
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Shadow Fact Lifecycle');
console.log('='.repeat(80));

const wm6 = new WorkingMemory();
const engine6 = new RuleEngine(wm6);
const shadowManager6 = new ShadowFactManager(wm6, engine6, true);

console.log('\nPhase 1: Assert');
const status = new StateWME('player', 'status', 'idle');
wm6.assert(status);

console.log('\nPhase 2: Modify');
status.setAttribute('status', 'combat');
wm6.modify(status, { value: 'combat' });

const shadow = shadowManager6.getShadow(status.id);
console.log(`Shadow updated: value = ${shadow?.attributes.get('value')}`);

console.log('\nPhase 3: Retract');
wm6.retract(status);

const shadowAfterRetract = shadowManager6.getShadow(status.id);
console.log(`Shadow exists after retract: ${shadowAfterRetract !== undefined}`);

// ============================================================================
// Example 7: Reactive NPC Behavior
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Reactive NPC Behavior');
console.log('='.repeat(80));

const wm7 = new WorkingMemory();
const engine7 = new RuleEngine(wm7, {
  debug: false,
  conflictResolution: ConflictResolution.PRIORITY
});

// NPC reacts when player enters same location
const greetRule = new RuleBuilder()
  .named('NPC Greets Player')
  .describedAs('NPC greets player when they enter same location')
  .whenType('Location', { entity: 'player' }, 'playerLoc')
  .whenType('Location', { entity: 'merchant' }, 'merchantLoc')
  .validate((bindings) => {
    const playerLoc = bindings.get('playerLoc')!;
    const merchantLoc = bindings.get('merchantLoc')!;
    return playerLoc.getAttribute('location') === merchantLoc.getAttribute('location');
  })
  .then((bindings) => {
    const location = bindings.get('playerLoc')!.getAttribute('location');
    console.log(`\n>>> Merchant: "Welcome to ${location}, traveler!"`);
  })
  .withPriority(90)
  .build();

engine7.addRule(greetRule);

const integration7 = new ShadowFactIntegration(wm7, engine7);
integration7.enableAutoFire();

console.log('\nInitial state:');
wm7.assert(new LocationWME('merchant', 'shop'));
wm7.assert(new LocationWME('player', 'forest'));

console.log('\nPlayer moves to shop:');
const playerLoc = wm7.query({ type: 'Location', attributes: { entity: 'player' } })[0];
playerLoc.setAttribute('location', 'shop');
wm7.modify(playerLoc, { location: 'shop' });

// ============================================================================
// Example 8: Complex Rule Chain
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Complex Rule Chain - Combat System');
console.log('='.repeat(80));

const wm8 = new WorkingMemory();
const engine8 = new RuleEngine(wm8, {
  debug: false,
  executionMode: ExecutionMode.EXHAUSTIVE,
  maxCycles: 10
});

// Rule 1: Player attacks enemy
const attackRule = new RuleBuilder()
  .named('Player Attack')
  .whenType('Action', { type: 'attack', source: 'player' }, 'action')
  .whenType('State', { entity: 'enemy', attribute: 'health' }, 'enemyHealth')
  .then((bindings, wm) => {
    const action = bindings.get('action')!;
    const enemyHealth = bindings.get('enemyHealth')!;
    const damage = action.getAttribute('damage');
    const currentHealth = enemyHealth.getAttribute('value');
    const newHealth = Math.max(0, currentHealth - damage);

    console.log(`\n>>> Player attacks for ${damage} damage!`);
    console.log(`>>> Enemy health: ${currentHealth} -> ${newHealth}`);

    enemyHealth.setAttribute('value', newHealth);
    wm.modify(enemyHealth, { value: newHealth });
    wm.retract(action);
  })
  .withPriority(100)
  .build();

// Rule 2: Enemy defeated
const defeatRule = new RuleBuilder()
  .named('Enemy Defeated')
  .whenType('State', { entity: 'enemy', attribute: 'health' }, 'enemyHealth')
  .validate((bindings) => {
    const health = bindings.get('enemyHealth')!.getAttribute('value');
    return health <= 0;
  })
  .then((bindings, wm) => {
    console.log(`\n>>> Enemy defeated!`);
    wm.assert(new WME('Victory', { entity: 'player' }));
  })
  .withPriority(90)
  .build();

engine8.addRule(attackRule);
engine8.addRule(defeatRule);

const integration8 = new ShadowFactIntegration(wm8, engine8);
integration8.enableAutoFire();

console.log('\nInitial combat state:');
wm8.assert(new StateWME('enemy', 'health', 30));
wm8.assert(new StateWME('player', 'health', 100));

console.log('\nPlayer attacks:');
wm8.assert(new WME('Action', { type: 'attack', source: 'player', damage: 35 }));

// ============================================================================
// Example 9: Shadow Statistics and Monitoring
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Shadow Statistics and Monitoring');
console.log('='.repeat(80));

const wm9 = new WorkingMemory();
const engine9 = new RuleEngine(wm9);
const integration9 = new ShadowFactIntegration(wm9, engine9);

// Add many WMEs
console.log('\nPopulating world with entities:');
for (let i = 0; i < 20; i++) {
  wm9.assert(new LocationWME(`npc${i}`, `location${i % 5}`));
}

for (let i = 0; i < 15; i++) {
  wm9.assert(new StateWME(`entity${i}`, 'status', 'active'));
}

for (let i = 0; i < 10; i++) {
  wm9.assert(new RelationWME(`entity${i}`, 'alliedWith', `entity${i + 1}`, 50));
}

console.log('\nComprehensive Statistics:');
const stats = integration9.getStats();

console.log('\nShadow Facts:');
console.log(`  Total: ${stats.shadows.totalShadows}`);
console.log(`  By Type:`);
for (const [type, count] of Object.entries(stats.shadows.byType)) {
  console.log(`    - ${type}: ${count}`);
}

console.log('\nRule Engine:');
console.log(`  Cycles: ${stats.engine.cycleCount}`);
console.log(`  Total Activations: ${stats.engine.totalActivations}`);
console.log(`  Total Firings: ${stats.engine.totalFirings}`);

// ============================================================================
// Example 10: Manual vs Auto-React Mode
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Manual vs Auto-React Mode');
console.log('='.repeat(80));

const wm10 = new WorkingMemory();
const engine10 = new RuleEngine(wm10, { debug: false });
const integration10 = new ShadowFactIntegration(wm10, engine10);

let reactionCount = 0;

const reactionRule = new RuleBuilder()
  .named('Reaction Counter')
  .whenType('State')
  .then(() => {
    reactionCount++;
    console.log(`  -> Rule fired (count: ${reactionCount})`);
  })
  .build();

engine10.addRule(reactionRule);

console.log('\n--- MANUAL MODE ---');
integration10.disableAutoFire();

console.log('Adding WME (manual mode):');
wm10.assert(new StateWME('test1', 'status', 'active'));
console.log('Rule fired automatically? No');

console.log('\nManually running engine:');
engine10.run();

console.log('\n--- AUTO-REACT MODE ---');
integration10.enableAutoFire();
reactionCount = 0;

console.log('Adding WME (auto-react mode):');
wm10.assert(new StateWME('test2', 'status', 'active'));
console.log('Rule fired automatically? Yes');

// ============================================================================
// Example 11: Practical Use Case - Dialogue System
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Practical Use Case - Dialogue System');
console.log('='.repeat(80));

const wm11 = new WorkingMemory();
const engine11 = new RuleEngine(wm11, {
  debug: false,
  conflictResolution: ConflictResolution.PRIORITY
});

// Rule: NPC responds based on relation
const dialogueRule = new RuleBuilder()
  .named('NPC Dialogue Response')
  .whenType('Conversation', { target: 'merchant' }, 'conversation')
  .whenType('Relation', { subject: 'player', target: 'merchant' }, 'relation')
  .then((bindings, wm) => {
    const conversation = bindings.get('conversation')!;
    const relation = bindings.get('relation')!;
    const trust = relation.getAttribute('value');
    const topic = conversation.getAttribute('topic');

    let response = '';
    if (trust > 70) {
      response = `"Of course! I'd be happy to discuss ${topic} with a friend."`;
    } else if (trust > 30) {
      response = `"I suppose I can talk about ${topic}."`;
    } else {
      response = `"I don't know you well enough to discuss ${topic}."`;
    }

    console.log(`\n>>> Merchant (trust: ${trust}): ${response}`);

    // Clean up conversation
    wm.retract(conversation);
  })
  .withPriority(100)
  .build();

engine11.addRule(dialogueRule);

const integration11 = new ShadowFactIntegration(wm11, engine11);
integration11.enableAutoFire();

console.log('\nInitializing relationship:');
wm11.assert(new RelationWME('player', 'trustsWith', 'merchant', 50));

console.log('\nPlayer initiates conversation:');
wm11.assert(new WME('Conversation', { target: 'merchant', topic: 'quest information' }));

console.log('\nPlayer helps merchant (trust increases):');
const relation = wm11.query({ type: 'Relation' })[0];
relation.setAttribute('value', 80);
wm11.modify(relation, { value: 80 });

console.log('\nPlayer asks again:');
wm11.assert(new WME('Conversation', { target: 'merchant', topic: 'secret treasure' }));

// ============================================================================
// Example 12: Shadow Helpers Usage
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Shadow Helpers Usage');
console.log('='.repeat(80));

const wm12 = new WorkingMemory();
const engine12 = new RuleEngine(wm12);

// Create auto-reactive system
console.log('\nCreating auto-reactive system:');
const autoSystem = ShadowFactHelpers.createAutoReactiveSystem(wm12, engine12, true);

console.log('\nAsserting WME:');
const testWME = new StateWME('test', 'value', 42);
wm12.assert(testWME);

console.log('\nChecking if shadow exists:');
const manager = autoSystem.getShadowManager();
console.log(`Has shadow: ${ShadowFactHelpers.hasShadow(manager, testWME)}`);

console.log('\nGetting shadow for WME:');
const shadow12 = ShadowFactHelpers.getShadowForWME(manager, testWME);
console.log(`Shadow type: ${shadow12?.type}`);
console.log(`Shadow attributes: ${JSON.stringify(Object.fromEntries(shadow12?.attributes || []))}`);

console.log('\nGetting affected rules:');
const affectedRules = ShadowFactHelpers.getAffectedRules(manager, testWME);
console.log(`Affected rules: ${affectedRules.length > 0 ? affectedRules.join(', ') : 'none'}`);

console.log('\n' + '='.repeat(80));
console.log('FACADE 6.2 EXAMPLES COMPLETE');
console.log('='.repeat(80));
