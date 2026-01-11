/**
 * RuleContext Examples - FACADE 6.3
 *
 * Demonstrates context-based rule activation and deactivation.
 */

import {
  ContextManager,
  ContextBuilder,
  ContextPatterns,
  RuleContext,
} from '../RuleContext';
import { WorkingMemory } from '../../wm/WorkingMemory';
import { RuleEngine } from '../RuleEngine';
import { Rule, RuleBuilder, RuleActions } from '../Rule';
import { ShadowFactIntegration, ShadowFactHelpers } from '../ShadowFacts';
import { WME, StateWME, LocationWME } from '../../wm/WME';

console.log('='.repeat(80));
console.log('FACADE 6.3: RULE CONTEXT EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Context Creation and Activation
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Context Creation and Activation');
console.log('='.repeat(80));

const contextManager1 = new ContextManager(true);

console.log('\nCreating contexts:');
contextManager1.createContext('Combat', 'Combat and fighting behaviors', 90);
contextManager1.createContext('Social', 'Social interaction and conversation', 70);
contextManager1.createContext('Exploration', 'Exploration and discovery', 50);

console.log('\nInitial state:');
contextManager1.displayStats();

console.log('\nActivating Combat context:');
contextManager1.activate('Combat');

console.log('\nActivating Social context:');
contextManager1.activate('Social');

console.log('\nCurrent state:');
contextManager1.displayStats();

// ============================================================================
// Example 2: Adding Rules to Contexts
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Adding Rules to Contexts');
console.log('='.repeat(80));

const wm2 = new WorkingMemory();
const engine2 = new RuleEngine(wm2, { debug: false });
const contextManager2 = new ContextManager(true);
contextManager2.setEngine(engine2);

// Create contexts
contextManager2.createContext('Combat', 'Combat behaviors', 90);
contextManager2.createContext('Social', 'Social behaviors', 70);

// Create rules
const attackRule = new RuleBuilder()
  .named('Attack Enemy')
  .whenType('Enemy', {}, 'enemy')
  .then(() => console.log('>>> Attacking enemy!'))
  .build();

const greetRule = new RuleBuilder()
  .named('Greet Friend')
  .whenType('Friend', {}, 'friend')
  .then(() => console.log('>>> Hello, friend!'))
  .build();

const exploreRule = new RuleBuilder()
  .named('Explore Area')
  .whenType('Location', {}, 'loc')
  .then(() => console.log('>>> Exploring location'))
  .build();

engine2.addRule(attackRule);
engine2.addRule(greetRule);
engine2.addRule(exploreRule);

// Initially disable all rules
engine2.setRuleEnabled('Attack Enemy', false);
engine2.setRuleEnabled('Greet Friend', false);
engine2.setRuleEnabled('Explore Area', false);

// Add rules to contexts
console.log('\nAssigning rules to contexts:');
contextManager2.addRuleToContext('Attack Enemy', 'Combat');
contextManager2.addRuleToContext('Greet Friend', 'Social');

console.log('\nActivating Combat context:');
contextManager2.activate('Combat');

console.log('\nAdding enemy (should trigger attack):');
wm2.assert(new WME('Enemy', { name: 'Goblin' }));
engine2.run();

console.log('\nActivating Social context:');
contextManager2.activate('Social');

console.log('\nAdding friend (should trigger greeting):');
wm2.assert(new WME('Friend', { name: 'Alice' }));
engine2.run();

// ============================================================================
// Example 3: Mutual Exclusion
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Mutual Exclusion - Combat vs Social');
console.log('='.repeat(80));

const contextManager3 = new ContextManager(true);

contextManager3.createContext('Combat', 'Combat mode', 90);
contextManager3.createContext('Social', 'Social mode', 70);

console.log('\nSetting mutual exclusion between Combat and Social:');
contextManager3.setMutualExclusion('Combat', 'Social');

console.log('\nActivating Combat:');
contextManager3.activate('Combat');

console.log('\nAttempting to activate Social (should deactivate Combat):');
contextManager3.activate('Social');

console.log('\nCurrent state:');
contextManager3.displayStats();

// ============================================================================
// Example 4: Context Requirements
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Context Requirements');
console.log('='.repeat(80));

const contextManager4 = new ContextManager(true);

contextManager4.createContext('Base', 'Base context', 50);
contextManager4.createContext('Advanced', 'Advanced context', 70);

console.log('\nSetting requirement: Advanced requires Base:');
contextManager4.setRequirement('Advanced', 'Base');

console.log('\nAttempting to activate Advanced without Base:');
const result1 = contextManager4.activate('Advanced');
console.log(`Success: ${result1}`);

console.log('\nActivating Base first:');
contextManager4.activate('Base');

console.log('\nNow activating Advanced:');
const result2 = contextManager4.activate('Advanced');
console.log(`Success: ${result2}`);

console.log('\nCurrent state:');
contextManager4.displayStats();

// ============================================================================
// Example 5: Auto-Activation Based on WME Conditions
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Auto-Activation Based on WME Conditions');
console.log('='.repeat(80));

const wm5 = new WorkingMemory();
const contextManager5 = new ContextManager(true);
contextManager5.setWorkingMemory(wm5);

const combatContext = contextManager5.createContext('Combat', 'Combat mode', 90);
const socialContext = contextManager5.createContext('Social', 'Social mode', 70);

console.log('\nSetting auto-activation conditions:');
contextManager5.setAutoActivation('Combat', (wm) => wm.exists({ type: 'Enemy' }));
contextManager5.setAutoDeactivation('Combat', (wm) => !wm.exists({ type: 'Enemy' }));

contextManager5.setAutoActivation('Social', (wm) => wm.exists({ type: 'Conversation' }));
contextManager5.setAutoDeactivation('Social', (wm) => !wm.exists({ type: 'Conversation' }));

console.log('\nAdding enemy to working memory:');
wm5.assert(new WME('Enemy', { name: 'Orc' }));

console.log('\nUpdating auto-contexts:');
contextManager5.updateAutoContexts();

console.log('\nStarting conversation:');
wm5.assert(new WME('Conversation', { with: 'merchant' }));
contextManager5.updateAutoContexts();

console.log('\nRemoving enemy:');
const enemy = wm5.query({ type: 'Enemy' })[0];
wm5.retract(enemy);
contextManager5.updateAutoContexts();

console.log('\nCurrent state:');
contextManager5.displayStats();

// ============================================================================
// Example 6: Context Builder
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Context Builder - Fluent API');
console.log('='.repeat(80));

const contextManager6 = new ContextManager(true);

console.log('\nBuilding Combat context with fluent API:');
const combatCtx = new ContextBuilder()
  .named('Combat')
  .describedAs('Combat and fighting behaviors')
  .withPriority(90)
  .addRules('Attack Enemy', 'Defend Self', 'Use Ability')
  .activateWhen((wm) => wm.exists({ type: 'Enemy' }))
  .deactivateWhen((wm) => !wm.exists({ type: 'Enemy' }))
  .withMetadata('color', 'red')
  .withMetadata('icon', '⚔️')
  .build(contextManager6);

console.log(`\nCreated context: ${combatCtx.name}`);
console.log(`  Description: ${combatCtx.description}`);
console.log(`  Priority: ${combatCtx.priority}`);
console.log(`  Rules: ${Array.from(combatCtx.rules).join(', ')}`);
console.log(`  Metadata: ${JSON.stringify(combatCtx.metadata)}`);

// ============================================================================
// Example 7: Context Patterns
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Context Patterns - Common Configurations');
console.log('='.repeat(80));

const contextManager7 = new ContextManager(true);

console.log('\nCreating common context patterns:');

const combat = ContextPatterns.combat(contextManager7, ['Attack', 'Defend']);
const social = ContextPatterns.social(contextManager7, ['Greet', 'Talk']);
const exploration = ContextPatterns.exploration(contextManager7, ['Explore', 'Search']);
const stealth = ContextPatterns.stealth(contextManager7, ['Sneak', 'Hide']);
const emergency = ContextPatterns.emergency(contextManager7, ['Flee', 'CallHelp']);

console.log('\nCreated contexts:');
contextManager7.displayStats();

// ============================================================================
// Example 8: Full Integration - Combat vs Social Scenario
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Full Integration - Combat vs Social Scenario');
console.log('='.repeat(80));

const wm8 = new WorkingMemory();
const engine8 = new RuleEngine(wm8, { debug: false });
const contextManager8 = new ContextManager(true);
const integration8 = new ShadowFactIntegration(wm8, engine8);

contextManager8.setEngine(engine8);
contextManager8.setWorkingMemory(wm8);

// Create contexts
contextManager8.createContext('Combat', 'Combat mode', 90);
contextManager8.createContext('Social', 'Social mode', 70);
contextManager8.setMutualExclusion('Combat', 'Social');

// Create combat rules
const combatRule = new RuleBuilder()
  .named('Combat Action')
  .whenType('Enemy', {}, 'enemy')
  .then((bindings) => {
    const enemy = bindings.get('enemy')!;
    console.log(`\n>>> [COMBAT] Fighting ${enemy.getAttribute('name')}!`);
  })
  .build();

// Create social rules
const socialRule = new RuleBuilder()
  .named('Social Action')
  .whenType('Friend', {}, 'friend')
  .then((bindings) => {
    const friend = bindings.get('friend')!;
    console.log(`\n>>> [SOCIAL] Chatting with ${friend.getAttribute('name')}!`);
  })
  .build();

engine8.addRule(combatRule);
engine8.addRule(socialRule);

// Disable rules initially
engine8.setRuleEnabled('Combat Action', false);
engine8.setRuleEnabled('Social Action', false);

// Assign to contexts
contextManager8.addRuleToContext('Combat Action', 'Combat');
contextManager8.addRuleToContext('Social Action', 'Social');

console.log('\n--- SCENARIO START ---');

console.log('\nPlayer enters peaceful town:');
contextManager8.activate('Social');
wm8.assert(new WME('Friend', { name: 'Merchant' }));
engine8.run();

console.log('\nBandits attack! Switching to combat:');
contextManager8.deactivate('Social');
contextManager8.activate('Combat');
wm8.assert(new WME('Enemy', { name: 'Bandit' }));
engine8.run();

console.log('\nBandits defeated, returning to social:');
const bandits = wm8.query({ type: 'Enemy' });
for (const bandit of bandits) {
  wm8.retract(bandit);
}
contextManager8.deactivate('Combat');
contextManager8.activate('Social');
console.log('>>> [SOCIAL] Peace restored!');

// ============================================================================
// Example 9: Context History Tracking
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Context History Tracking');
console.log('='.repeat(80));

const contextManager9 = new ContextManager(true);

contextManager9.createContext('Mode1', 'First mode', 80);
contextManager9.createContext('Mode2', 'Second mode', 70);
contextManager9.createContext('Mode3', 'Third mode', 60);

console.log('\nPerforming context switches:');
contextManager9.activate('Mode1', 'User request');
await new Promise((resolve) => setTimeout(resolve, 100));

contextManager9.activate('Mode2', 'Automatic trigger');
await new Promise((resolve) => setTimeout(resolve, 100));

contextManager9.deactivate('Mode1', 'No longer needed');
await new Promise((resolve) => setTimeout(resolve, 100));

contextManager9.activate('Mode3', 'New situation');
await new Promise((resolve) => setTimeout(resolve, 100));

contextManager9.deactivate('Mode2', 'Timeout');

console.log('\nContext change history:');
contextManager9.displayHistory();

// ============================================================================
// Example 10: Rule Active Status
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Rule Active Status - Multi-Context Rules');
console.log('='.repeat(80));

const contextManager10 = new ContextManager(true);

contextManager10.createContext('ContextA', 'First context', 80);
contextManager10.createContext('ContextB', 'Second context', 70);

console.log('\nAdding rule to multiple contexts:');
contextManager10.addRuleToContext('SharedRule', 'ContextA');
contextManager10.addRuleToContext('SharedRule', 'ContextB');

console.log('\nChecking rule status (both inactive):');
console.log(`SharedRule active: ${contextManager10.isRuleActive('SharedRule')}`);

console.log('\nActivating ContextA:');
contextManager10.activate('ContextA');
console.log(`SharedRule active: ${contextManager10.isRuleActive('SharedRule')}`);

console.log('\nActivating ContextB too:');
contextManager10.activate('ContextB');
console.log(`SharedRule active: ${contextManager10.isRuleActive('SharedRule')}`);

console.log('\nDeactivating ContextA (ContextB still active):');
contextManager10.deactivate('ContextA');
console.log(`SharedRule active: ${contextManager10.isRuleActive('SharedRule')}`);

console.log('\nDeactivating ContextB (both inactive):');
contextManager10.deactivate('ContextB');
console.log(`SharedRule active: ${contextManager10.isRuleActive('SharedRule')}`);

// ============================================================================
// Example 11: Practical Use Case - Game State Management
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Practical Use Case - Game State Management');
console.log('='.repeat(80));

const wm11 = new WorkingMemory();
const engine11 = new RuleEngine(wm11, { debug: false });
const contextManager11 = new ContextManager(false); // Disable debug for cleaner output

contextManager11.setEngine(engine11);
contextManager11.setWorkingMemory(wm11);

// Create game contexts
contextManager11.createContext('MainMenu', 'Main menu', 100);
contextManager11.createContext('Exploration', 'Exploring world', 50);
contextManager11.createContext('Combat', 'In combat', 90);
contextManager11.createContext('Dialogue', 'In conversation', 80);
contextManager11.createContext('Inventory', 'Managing inventory', 70);

// Set mutual exclusions
contextManager11.setMutualExclusion('MainMenu', 'Exploration');
contextManager11.setMutualExclusion('MainMenu', 'Combat');
contextManager11.setMutualExclusion('Combat', 'Dialogue');
contextManager11.setMutualExclusion('Combat', 'Inventory');

// Set auto-activation
contextManager11.setAutoActivation('Combat', (wm) =>
  wm.exists({ type: 'State', attributes: { entity: 'player', attribute: 'inCombat', value: true } })
);
contextManager11.setAutoDeactivation('Combat', (wm) =>
  !wm.exists({ type: 'State', attributes: { entity: 'player', attribute: 'inCombat', value: true } })
);

console.log('\n--- GAME SESSION START ---');

console.log('\n1. Starting at main menu:');
contextManager11.activate('MainMenu');
contextManager11.displayStats();

console.log('\n2. Starting exploration:');
contextManager11.activate('Exploration');

console.log('\n3. Player enters combat:');
wm11.assert(new StateWME('player', 'inCombat', true));
contextManager11.updateAutoContexts();
console.log('Active contexts:', contextManager11.getActiveContexts().map(c => c.name).join(', '));

console.log('\n4. Combat ends:');
const combatState = wm11.query({ type: 'State', attributes: { entity: 'player', attribute: 'inCombat' } })[0];
wm11.retract(combatState);
contextManager11.updateAutoContexts();
console.log('Active contexts:', contextManager11.getActiveContexts().map(c => c.name).join(', '));

console.log('\n5. Opening inventory:');
contextManager11.activate('Inventory');
console.log('Active contexts:', contextManager11.getActiveContexts().map(c => c.name).join(', '));

console.log('\n6. Closing inventory:');
contextManager11.deactivate('Inventory');
console.log('Active contexts:', contextManager11.getActiveContexts().map(c => c.name).join(', '));

// ============================================================================
// Example 12: Performance - Context-Based Rule Filtering
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Performance - Context-Based Rule Filtering');
console.log('='.repeat(80));

const wm12 = new WorkingMemory();
const engine12 = new RuleEngine(wm12, { debug: false });
const contextManager12 = new ContextManager(true);

contextManager12.setEngine(engine12);

// Create many rules
console.log('\nCreating 20 rules across 4 contexts:');
for (let i = 0; i < 20; i++) {
  const rule = new RuleBuilder()
    .named(`Rule${i}`)
    .whenType('Test', {})
    .then(() => {})
    .build();

  engine12.addRule(rule);
  engine12.setRuleEnabled(`Rule${i}`, false); // Start disabled
}

// Create contexts
contextManager12.createContext('Context1', 'First context', 80);
contextManager12.createContext('Context2', 'Second context', 70);
contextManager12.createContext('Context3', 'Third context', 60);
contextManager12.createContext('Context4', 'Fourth context', 50);

// Distribute rules across contexts
for (let i = 0; i < 20; i++) {
  const contextNum = (i % 4) + 1;
  contextManager12.addRuleToContext(`Rule${i}`, `Context${contextNum}`);
}

console.log('\nInitial state (all contexts inactive):');
console.log(`Active rules: ${contextManager12.getActiveRules().size}`);

console.log('\nActivating Context1 (5 rules):');
contextManager12.activate('Context1');
console.log(`Active rules: ${contextManager12.getActiveRules().size}`);

console.log('\nActivating Context2 (10 rules total):');
contextManager12.activate('Context2');
console.log(`Active rules: ${contextManager12.getActiveRules().size}`);

console.log('\nDeactivating Context1 (back to 5 rules):');
contextManager12.deactivate('Context1');
console.log(`Active rules: ${contextManager12.getActiveRules().size}`);

console.log('\nFinal statistics:');
contextManager12.displayStats();

console.log('\n' + '='.repeat(80));
console.log('FACADE 6.3 EXAMPLES COMPLETE');
console.log('='.repeat(80));
