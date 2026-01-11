/**
 * RulePriority Examples - FACADE 6.4
 *
 * Demonstrates priority-based rule firing and specificity handling.
 */

import {
  PriorityManager,
  SpecificityCalculator,
  PriorityHelpers,
  PriorityPresets,
  PriorityConflictResolver,
  PriorityBuilder,
  UrgencyLevel,
  PriorityCategory,
} from '../RulePriority';
import { WorkingMemory } from '../../wm/WorkingMemory';
import { RuleEngine, ConflictResolution } from '../RuleEngine';
import { Rule, RuleBuilder, RuleActions, Pattern } from '../Rule';
import { WME, StateWME } from '../../wm/WME';

console.log('='.repeat(80));
console.log('FACADE 6.4: RULE PRIORITY EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Specificity Calculation
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Specificity Calculation');
console.log('='.repeat(80));

// Generic pattern
const genericPattern: Pattern = {
  type: 'Conversation',
};

// Specific pattern with attributes
const specificPattern: Pattern = {
  type: 'Conversation',
  attributes: {
    sentiment: 'negative',
    isInsult: true,
    target: 'player',
  },
};

// Very specific pattern with filter
const verySpecificPattern: Pattern = {
  type: 'Conversation',
  attributes: {
    sentiment: 'negative',
    isInsult: true,
    target: 'player',
    severity: 'high',
  },
  filter: (wme) => wme.getAttribute('repeated') === true,
  bindTo: 'conversation',
};

console.log('\nCalculating pattern specificity:');
console.log(`Generic pattern score: ${SpecificityCalculator.calculatePatternSpecificity(genericPattern)}`);
console.log(`Specific pattern score: ${SpecificityCalculator.calculatePatternSpecificity(specificPattern)}`);
console.log(`Very specific pattern score: ${SpecificityCalculator.calculatePatternSpecificity(verySpecificPattern)}`);

// ============================================================================
// Example 2: Specific vs General Rules
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Specific vs General Rules');
console.log('='.repeat(80));

const wm2 = new WorkingMemory();
const engine2 = new RuleEngine(wm2, { debug: false });
const priorityManager2 = new PriorityManager();

// Generic negative reaction
const genericRule = new RuleBuilder()
  .named('Generic Negative')
  .describedAs('React to any negative conversation')
  .whenType('Conversation', { sentiment: 'negative' })
  .then(() => console.log('>>> [GENERIC] I sense negativity...'))
  .withPriority(50)
  .build();

// Specific insult reaction
const specificRule = new RuleBuilder()
  .named('Specific Insult')
  .describedAs('React to direct insults')
  .whenType('Conversation', { sentiment: 'negative', isInsult: true })
  .then(() => console.log('>>> [SPECIFIC] How dare you insult me!'))
  .withPriority(50) // Same base priority
  .build();

// Very specific repeated insult reaction
const verySpecificRule = new RuleBuilder()
  .named('Repeated Insult')
  .describedAs('React to repeated insults')
  .whenType('Conversation', { sentiment: 'negative', isInsult: true })
  .validate((bindings) => {
    const conv = bindings.get('conversation');
    return conv ? conv.getAttribute('repeated') === true : false;
  })
  .then(() => console.log('>>> [VERY SPECIFIC] That\'s it! I\'m done with you!'))
  .withPriority(50) // Same base priority
  .build();

engine2.addRule(genericRule);
engine2.addRule(specificRule);
engine2.addRule(verySpecificRule);

// Auto-assign priorities based on specificity
console.log('\nAuto-assigning priorities based on specificity:');
PriorityHelpers.autoAssignPriorities(priorityManager2, [genericRule, specificRule, verySpecificRule]);

console.log(`Generic rule specificity: ${SpecificityCalculator.calculateRuleSpecificity(genericRule.getPatterns())}`);
console.log(`Specific rule specificity: ${SpecificityCalculator.calculateRuleSpecificity(specificRule.getPatterns())}`);
console.log(`Very specific rule specificity: ${SpecificityCalculator.calculateRuleSpecificity(verySpecificRule.getPatterns())}`);

console.log('\nTesting with simple negative conversation:');
wm2.assert(new WME('Conversation', { sentiment: 'negative' }));
engine2.run();

console.log('\nTesting with insult:');
wm2.clear();
wm2.assert(new WME('Conversation', { sentiment: 'negative', isInsult: true }));
engine2.run();

console.log('\nTesting with repeated insult:');
wm2.clear();
wm2.assert(new WME('Conversation', { sentiment: 'negative', isInsult: true, repeated: true }));
engine2.run();

// ============================================================================
// Example 3: Urgency Levels
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Urgency Levels');
console.log('='.repeat(80));

const wm3 = new WorkingMemory();
const engine3 = new RuleEngine(wm3, { debug: false, conflictResolution: ConflictResolution.PRIORITY });
const priorityManager3 = new PriorityManager();

// Low urgency - casual chat
const casualRule = new RuleBuilder()
  .named('Casual Chat')
  .whenType('Event', { type: 'chat' })
  .then(() => console.log('>>> [LOW] Oh, hello there.'))
  .build();

// Normal urgency - quest offer
const questRule = new RuleBuilder()
  .named('Quest Offer')
  .whenType('Event', { type: 'quest' })
  .then(() => console.log('>>> [NORMAL] I have a task for you.'))
  .build();

// High urgency - combat
const combatRule = new RuleBuilder()
  .named('Combat Alert')
  .whenType('Event', { type: 'combat' })
  .then(() => console.log('>>> [HIGH] Enemies approaching!'))
  .build();

// Critical urgency - danger
const dangerRule = new RuleBuilder()
  .named('Danger Warning')
  .whenType('Event', { type: 'danger' })
  .then(() => console.log('>>> [CRITICAL] RUN! DRAGON!'))
  .build();

engine3.addRule(casualRule);
engine3.addRule(questRule);
engine3.addRule(combatRule);
engine3.addRule(dangerRule);

// Set urgency levels
priorityManager3.setUrgency('Casual Chat', UrgencyLevel.LOW);
priorityManager3.setUrgency('Quest Offer', UrgencyLevel.NORMAL);
priorityManager3.setUrgency('Combat Alert', UrgencyLevel.HIGH);
priorityManager3.setUrgency('Danger Warning', UrgencyLevel.CRITICAL);

console.log('\nUrgency priorities:');
console.log(`Casual: ${priorityManager3.calculatePriority(casualRule)}`);
console.log(`Quest: ${priorityManager3.calculatePriority(questRule)}`);
console.log(`Combat: ${priorityManager3.calculatePriority(combatRule)}`);
console.log(`Danger: ${priorityManager3.calculatePriority(dangerRule)}`);

console.log('\nTriggering all events simultaneously:');
wm3.assert(new WME('Event', { type: 'chat' }));
wm3.assert(new WME('Event', { type: 'quest' }));
wm3.assert(new WME('Event', { type: 'combat' }));
wm3.assert(new WME('Event', { type: 'danger' }));

// Get activations and sort by priority
const activations3 = engine3.getAllRules().flatMap(rule => rule.match(wm3));
const sorted3 = priorityManager3.sortActivations(activations3);

console.log('\nFiring in priority order:');
for (const activation of sorted3) {
  activation.rule.fire(activation.bindings, wm3);
}

// ============================================================================
// Example 4: Priority Categories
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Priority Categories');
console.log('='.repeat(80));

const priorityManager4 = new PriorityManager();

const survivalRule = new RuleBuilder().named('Survive').whenType('Test').then(() => {}).build();
const combatRule4 = new RuleBuilder().named('Fight').whenType('Test').then(() => {}).build();
const socialRule4 = new RuleBuilder().named('Talk').whenType('Test').then(() => {}).build();
const exploreRule4 = new RuleBuilder().named('Explore').whenType('Test').then(() => {}).build();
const backgroundRule = new RuleBuilder().named('Background').whenType('Test').then(() => {}).build();

priorityManager4.setCategory('Survive', PriorityCategory.SURVIVAL);
priorityManager4.setCategory('Fight', PriorityCategory.COMBAT);
priorityManager4.setCategory('Talk', PriorityCategory.SOCIAL);
priorityManager4.setCategory('Explore', PriorityCategory.EXPLORATION);
priorityManager4.setCategory('Background', PriorityCategory.BACKGROUND);

console.log('\nCategory-based priorities:');
console.log(`Survival: ${priorityManager4.calculatePriority(survivalRule)}`);
console.log(`Combat: ${priorityManager4.calculatePriority(combatRule4)}`);
console.log(`Social: ${priorityManager4.calculatePriority(socialRule4)}`);
console.log(`Exploration: ${priorityManager4.calculatePriority(exploreRule4)}`);
console.log(`Background: ${priorityManager4.calculatePriority(backgroundRule)}`);

// ============================================================================
// Example 5: Priority Boosting and Penalties
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Priority Boosting and Penalties');
console.log('='.repeat(80));

const priorityManager5 = new PriorityManager();

const rule5a = new RuleBuilder().named('RuleA').whenType('Test').then(() => {}).withPriority(500).build();
const rule5b = new RuleBuilder().named('RuleB').whenType('Test').then(() => {}).withPriority(500).build();

console.log('\nInitial priorities:');
console.log(`RuleA: ${priorityManager5.calculatePriority(rule5a)}`);
console.log(`RuleB: ${priorityManager5.calculatePriority(rule5b)}`);

console.log('\nBoosting RuleA by 100:');
priorityManager5.boost('RuleA', 100);
console.log(`RuleA: ${priorityManager5.calculatePriority(rule5a)}`);

console.log('\nPenalizing RuleB by 50:');
priorityManager5.penalize('RuleB', 50);
console.log(`RuleB: ${priorityManager5.calculatePriority(rule5b)}`);

// ============================================================================
// Example 6: Preemptive Rules
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Preemptive Rules - Emergency Override');
console.log('='.repeat(80));

const wm6 = new WorkingMemory();
const engine6 = new RuleEngine(wm6, { debug: false });
const priorityManager6 = new PriorityManager();

// Normal rules
const normalRule1 = new RuleBuilder()
  .named('Normal 1')
  .whenType('Event')
  .then(() => console.log('>>> [NORMAL] Regular action 1'))
  .withPriority(500)
  .build();

const normalRule2 = new RuleBuilder()
  .named('Normal 2')
  .whenType('Event')
  .then(() => console.log('>>> [NORMAL] Regular action 2'))
  .withPriority(500)
  .build();

// Preemptive emergency rule
const emergencyRule = new RuleBuilder()
  .named('Emergency')
  .whenType('Event', { emergency: true })
  .then(() => console.log('>>> [PREEMPTIVE] EMERGENCY! All other actions cancelled!'))
  .withPriority(500)
  .build();

engine6.addRule(normalRule1);
engine6.addRule(normalRule2);
engine6.addRule(emergencyRule);

priorityManager6.setPreemptive('Emergency', true);

console.log('\nNormal situation:');
wm6.assert(new WME('Event', { type: 'normal' }));
engine6.run();

console.log('\nEmergency situation (preemptive rule):');
wm6.clear();
wm6.assert(new WME('Event', { emergency: true }));

const activations6 = engine6.getAllRules().flatMap(rule => rule.match(wm6));
const preemptiveFiltered = PriorityConflictResolver.checkPreemption(activations6, priorityManager6);

console.log(`Total activations: ${activations6.length}`);
console.log(`After preemption check: ${preemptiveFiltered.length}`);

for (const activation of preemptiveFiltered) {
  activation.rule.fire(activation.bindings, wm6);
}

// ============================================================================
// Example 7: Priority Presets
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Priority Presets');
console.log('='.repeat(80));

const priorityManager7 = new PriorityManager();

// Create rule sets
const survivalRules = ['Flee Danger', 'Seek Shelter', 'Call for Help'];
const combatRules = ['Attack Enemy', 'Defend Self', 'Use Ability'];
const socialRules = ['Greet NPC', 'Start Conversation', 'Trade'];
const backgroundRules = ['Idle Animation', 'Ambient Sound', 'Update UI'];

console.log('\nApplying priority presets:');
PriorityPresets.survival(priorityManager7, survivalRules);
PriorityPresets.combat(priorityManager7, combatRules);
PriorityPresets.social(priorityManager7, socialRules);
PriorityPresets.background(priorityManager7, backgroundRules);

priorityManager7.displayStats();

// ============================================================================
// Example 8: Specific Before General Preset
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Specific Before General Preset');
console.log('='.repeat(80));

const wm8 = new WorkingMemory();
const engine8 = new RuleEngine(wm8, { debug: false });
const priorityManager8 = new PriorityManager();

// General rule
const generalInsultRule = new RuleBuilder()
  .named('General Insult Response')
  .whenType('Insult')
  .then(() => console.log('>>> [GENERAL] That wasn\'t nice.'))
  .withPriority(500)
  .build();

// Specific rules
const personalInsultRule = new RuleBuilder()
  .named('Personal Insult Response')
  .whenType('Insult', { target: 'appearance' })
  .then(() => console.log('>>> [SPECIFIC] My appearance is none of your business!'))
  .withPriority(500)
  .build();

const familyInsultRule = new RuleBuilder()
  .named('Family Insult Response')
  .whenType('Insult', { target: 'family' })
  .then(() => console.log('>>> [SPECIFIC] Don\'t you DARE insult my family!'))
  .withPriority(500)
  .build();

engine8.addRule(generalInsultRule);
engine8.addRule(personalInsultRule);
engine8.addRule(familyInsultRule);

// Apply specific-before-general preset
PriorityPresets.specificBeforeGeneral(
  priorityManager8,
  ['Personal Insult Response', 'Family Insult Response'],
  ['General Insult Response']
);

console.log('\nPriorities after specific-before-general:');
console.log(`General: ${priorityManager8.calculatePriority(generalInsultRule)}`);
console.log(`Personal: ${priorityManager8.calculatePriority(personalInsultRule)}`);
console.log(`Family: ${priorityManager8.calculatePriority(familyInsultRule)}`);

console.log('\nTesting with general insult:');
wm8.assert(new WME('Insult', { text: 'You are annoying' }));
engine8.run();

console.log('\nTesting with specific insult (appearance):');
wm8.clear();
wm8.assert(new WME('Insult', { target: 'appearance', text: 'You look terrible' }));
engine8.run();

// ============================================================================
// Example 9: Priority Builder
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Priority Builder - Fluent API');
console.log('='.repeat(80));

const priorityManager9 = new PriorityManager();

console.log('\nBuilding priority configurations:');

new PriorityBuilder()
  .forRule('Critical Rule')
  .withUrgency(UrgencyLevel.CRITICAL)
  .inCategory(PriorityCategory.SURVIVAL)
  .makePreemptive()
  .boost(50)
  .apply(priorityManager9);

new PriorityBuilder()
  .forRule('Normal Rule')
  .withUrgency(UrgencyLevel.NORMAL)
  .inCategory(PriorityCategory.SOCIAL)
  .apply(priorityManager9);

console.log('\nPriority configurations:');
priorityManager9.displayStats();

// ============================================================================
// Example 10: Priority Tiers
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Priority Tiers - Grouping by Priority Range');
console.log('='.repeat(80));

const wm10 = new WorkingMemory();
const priorityManager10 = new PriorityManager();

// Create rules with varying priorities
const rules10: Rule[] = [];
for (let i = 0; i < 10; i++) {
  const rule = new RuleBuilder()
    .named(`Rule ${i}`)
    .whenType('Test')
    .then(() => {})
    .withPriority(i * 100)
    .build();
  rules10.push(rule);
}

// Create mock activations
const activations10 = rules10.map(rule => ({
  rule,
  bindings: new Map(),
  timestamp: Date.now(),
  priority: rule.priority,
}));

console.log('\nGrouping activations by tier (100-point intervals):');
const tiers = PriorityConflictResolver.groupByTier(activations10, priorityManager10, 100);

for (const [tier, acts] of Array.from(tiers.entries()).sort((a, b) => b[0] - a[0])) {
  console.log(`\nTier ${tier} (${tier * 100}-${(tier + 1) * 100}):`);
  for (const act of acts) {
    console.log(`  - ${act.rule.name}: priority ${priorityManager10.calculatePriority(act.rule)}`);
  }
}

// ============================================================================
// Example 11: Practical Use Case - Combat vs Social Priority
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Practical Use Case - Combat vs Social Priority');
console.log('='.repeat(80));

const wm11 = new WorkingMemory();
const engine11 = new RuleEngine(wm11, { debug: false });
const priorityManager11 = new PriorityManager();

// Social rule
const greetRule = new RuleBuilder()
  .named('Greet Player')
  .whenType('Player', { nearby: true })
  .then(() => console.log('>>> [SOCIAL] Hello, traveler!'))
  .withPriority(500)
  .build();

// Combat rule
const attackRule = new RuleBuilder()
  .named('Attack Enemy')
  .whenType('Enemy', { nearby: true })
  .then(() => console.log('>>> [COMBAT] Attacking enemy!'))
  .withPriority(500)
  .build();

// Emergency rule
const fleeRule = new RuleBuilder()
  .named('Flee Danger')
  .whenType('Enemy', { nearby: true, level: 'high' })
  .then(() => console.log('>>> [EMERGENCY] Running away!'))
  .withPriority(500)
  .build();

engine11.addRule(greetRule);
engine11.addRule(attackRule);
engine11.addRule(fleeRule);

// Set priorities
priorityManager11.setCategory('Greet Player', PriorityCategory.SOCIAL);
priorityManager11.setUrgency('Greet Player', UrgencyLevel.NORMAL);

priorityManager11.setCategory('Attack Enemy', PriorityCategory.COMBAT);
priorityManager11.setUrgency('Attack Enemy', UrgencyLevel.HIGH);

priorityManager11.setCategory('Flee Danger', PriorityCategory.SURVIVAL);
priorityManager11.setUrgency('Flee Danger', UrgencyLevel.CRITICAL);
priorityManager11.setPreemptive('Flee Danger', true);

console.log('\nScenario 1: Peaceful encounter');
wm11.assert(new WME('Player', { nearby: true }));
const acts11a = engine11.getAllRules().flatMap(rule => rule.match(wm11));
const sorted11a = priorityManager11.sortActivations(acts11a);
for (const act of sorted11a) {
  act.rule.fire(act.bindings, wm11);
}

console.log('\nScenario 2: Combat situation');
wm11.clear();
wm11.assert(new WME('Enemy', { nearby: true }));
wm11.assert(new WME('Player', { nearby: true }));
const acts11b = engine11.getAllRules().flatMap(rule => rule.match(wm11));
const sorted11b = priorityManager11.sortActivations(acts11b);
console.log('Firing in priority order:');
for (const act of sorted11b) {
  console.log(`  Priority ${priorityManager11.calculatePriority(act.rule)}: ${act.rule.name}`);
  act.rule.fire(act.bindings, wm11);
}

console.log('\nScenario 3: Overwhelming enemy (preemptive flee)');
wm11.clear();
wm11.assert(new WME('Enemy', { nearby: true, level: 'high' }));
wm11.assert(new WME('Player', { nearby: true }));
const acts11c = engine11.getAllRules().flatMap(rule => rule.match(wm11));
const sorted11c = PriorityConflictResolver.checkPreemption(acts11c, priorityManager11);
console.log(`Total matching rules: ${acts11c.length}, After preemption: ${sorted11c.length}`);
for (const act of sorted11c) {
  act.rule.fire(act.bindings, wm11);
}

// ============================================================================
// Example 12: Dynamic Priority Adjustment
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Dynamic Priority Adjustment');
console.log('='.repeat(80));

const priorityManager12 = new PriorityManager();

const dynamicRule = new RuleBuilder()
  .named('Dynamic Rule')
  .whenType('Test')
  .then(() => {})
  .withPriority(500)
  .build();

console.log('\nInitial priority:');
console.log(`Priority: ${priorityManager12.calculatePriority(dynamicRule)}`);

console.log('\nPlayer helps NPC - boosting priority by 50:');
priorityManager12.boost('Dynamic Rule', 50);
console.log(`Priority: ${priorityManager12.calculatePriority(dynamicRule)}`);

console.log('\nPlayer insults NPC - penalizing by 100:');
priorityManager12.penalize('Dynamic Rule', 100);
console.log(`Priority: ${priorityManager12.calculatePriority(dynamicRule)}`);

console.log('\nPlayer saves NPC\'s life - boosting by 200:');
priorityManager12.boost('Dynamic Rule', 200);
console.log(`Priority: ${priorityManager12.calculatePriority(dynamicRule)}`);

console.log('\n' + '='.repeat(80));
console.log('FACADE 6.4 EXAMPLES COMPLETE');
console.log('='.repeat(80));
