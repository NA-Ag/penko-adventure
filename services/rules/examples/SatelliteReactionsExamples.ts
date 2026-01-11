/**
 * SatelliteReactions Examples - FACADE 6.6
 *
 * Demonstrates satellite reactions that add flavor to main reactions.
 */

import {
  SatelliteManager,
  SatelliteBuilder,
  SatellitePresets,
  SatelliteHelpers,
  SatelliteCategory,
  ReactionWithSatellites,
} from '../SatelliteReactions';
import { WorkingMemory } from '../../wm/WorkingMemory';
import { RuleEngine } from '../RuleEngine';
import { RuleBuilder } from '../Rule';
import { WME } from '../../wm/WME';

console.log('='.repeat(80));
console.log('FACADE 6.6: SATELLITE REACTIONS EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Satellite Creation
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Satellite Creation');
console.log('='.repeat(80));

const manager1 = new SatelliteManager(true);

console.log('\nCreating smile satellite:');
const smile = new SatelliteBuilder()
  .withId('smile')
  .describedAs('Friendly smile')
  .does(() => console.log('  *smiles warmly*'))
  .withPriority(50)
  .withProbability(1.0)
  .inCategory(SatelliteCategory.FACIAL)
  .register(manager1);

console.log(`Created: ${smile.id} - ${smile.description}`);

// ============================================================================
// Example 2: Main Reaction with Satellites
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Main Reaction with Satellites');
console.log('='.repeat(80));

const manager2 = new SatelliteManager();

// Register satellites
SatellitePresets.registerAll(manager2);

console.log('\nCreating reaction: Accept help');
const reaction2: ReactionWithSatellites = {
  mainAction: () => {
    console.log('>>> NPC: "Thank you for your help!"');
  },
  satellites: [
    manager2.get('smile')!,
    manager2.get('nod')!,
  ],
  fireAllSatellites: true,
};

console.log('\nExecuting reaction:');
manager2.execute(reaction2, new Map(), new WorkingMemory());

// ============================================================================
// Example 3: Refuse Help with Scowl
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Refuse Help with Scowl');
console.log('='.repeat(80));

const manager3 = new SatelliteManager();
SatellitePresets.registerAll(manager3);

const refuseReaction: ReactionWithSatellites = {
  mainAction: () => {
    console.log('>>> NPC: "I don\'t need your help!"');
  },
  satellites: [
    manager3.get('scowl')!,
    manager3.get('cross_arms')!,
  ],
  fireAllSatellites: true,
};

console.log('\nExecuting refusal:');
manager3.execute(refuseReaction, new Map(), new WorkingMemory());

// ============================================================================
// Example 4: Multiple Satellites Can Fire Together
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Multiple Satellites Can Fire Together');
console.log('='.repeat(80));

const manager4 = new SatelliteManager();
SatellitePresets.registerAll(manager4);

const annoyedReaction: ReactionWithSatellites = {
  mainAction: () => {
    console.log('>>> NPC: "Fine, whatever you say..."');
  },
  satellites: [
    manager4.get('sigh')!,
    manager4.get('eye_roll')!,
    manager4.get('shrug')!,
  ],
  fireAllSatellites: true,
};

console.log('\nExecuting annoyed reaction (multiple satellites):');
manager4.execute(annoyedReaction, new Map(), new WorkingMemory());

// ============================================================================
// Example 5: Probability-Based Satellites
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Probability-Based Satellites');
console.log('='.repeat(80));

const manager5 = new SatelliteManager();

// 100% probability - always fires
const alwaysSatellite = new SatelliteBuilder()
  .withId('always')
  .does(() => console.log('  This always fires'))
  .withProbability(1.0)
  .register(manager5);

// 50% probability - sometimes fires
const sometimesSatellite = new SatelliteBuilder()
  .withId('sometimes')
  .does(() => console.log('  This fires 50% of the time'))
  .withProbability(0.5)
  .register(manager5);

// 10% probability - rarely fires
const rarelySatellite = new SatelliteBuilder()
  .withId('rarely')
  .does(() => console.log('  This fires 10% of the time'))
  .withProbability(0.1)
  .register(manager5);

const probabilisticReaction: ReactionWithSatellites = {
  mainAction: () => console.log('>>> Main action'),
  satellites: [alwaysSatellite, sometimesSatellite, rarelySatellite],
  fireAllSatellites: true,
};

console.log('\nExecuting 5 times to see probability:');
for (let i = 1; i <= 5; i++) {
  console.log(`\nAttempt ${i}:`);
  manager5.execute(probabilisticReaction, new Map(), new WorkingMemory());
}

// ============================================================================
// Example 6: Mutual Exclusion
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Mutual Exclusion - Can\'t Smile and Frown');
console.log('='.repeat(80));

const manager6 = new SatelliteManager();

const smile6 = new SatelliteBuilder()
  .withId('smile')
  .does(() => console.log('  *smiles*'))
  .excludes('frown')
  .withPriority(60)
  .register(manager6);

const frown6 = new SatelliteBuilder()
  .withId('frown')
  .does(() => console.log('  *frowns*'))
  .excludes('smile')
  .withPriority(50)
  .register(manager6);

const conflictReaction: ReactionWithSatellites = {
  mainAction: () => console.log('>>> NPC: "Hmm..."'),
  satellites: [smile6, frown6],
  fireAllSatellites: true,
};

console.log('\nExecuting (smile has higher priority, excludes frown):');
manager6.execute(conflictReaction, new Map(), new WorkingMemory());

// ============================================================================
// Example 7: Conditional Satellites
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Conditional Satellites - Based on Context');
console.log('='.repeat(80));

const wm7 = new WorkingMemory();
const manager7 = new SatelliteManager();

// Satellite that only fires when NPC is friendly
const friendlyGesture = new SatelliteBuilder()
  .withId('friendly_wave')
  .does(() => console.log('  *waves friendly*'))
  .when((bindings, wm) => {
    const relation = wm.query({ type: 'Relation', attributes: { trust: 70 } });
    return relation.length > 0 && relation[0].getAttribute('trust') >= 70;
  })
  .register(manager7);

// Satellite that only fires when NPC is unfriendly
const unfriendlyGesture = new SatelliteBuilder()
  .withId('unfriendly_glare')
  .does(() => console.log('  *glares suspiciously*'))
  .when((bindings, wm) => {
    const relation = wm.query({ type: 'Relation' });
    return relation.length > 0 && relation[0].getAttribute('trust') < 30;
  })
  .register(manager7);

const greetingReaction: ReactionWithSatellites = {
  mainAction: () => console.log('>>> NPC: "Hello."'),
  satellites: [friendlyGesture, unfriendlyGesture],
  fireAllSatellites: true,
};

console.log('\nWith high trust (70):');
wm7.assert(new WME('Relation', { npc: 'merchant', player: 'player', trust: 70 }));
manager7.execute(greetingReaction, new Map(), wm7);

console.log('\nWith low trust (20):');
wm7.clear();
wm7.assert(new WME('Relation', { npc: 'merchant', player: 'player', trust: 20 }));
manager7.execute(greetingReaction, new Map(), wm7);

// ============================================================================
// Example 8: Limited Satellite Selection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Limited Satellite Selection - Max 2');
console.log('='.repeat(80));

const manager8 = new SatelliteManager();

const sat1 = SatelliteHelpers.quickSatellite('sat1', () => console.log('  Satellite 1'), 'test');
sat1.priority = 100;
const sat2 = SatelliteHelpers.quickSatellite('sat2', () => console.log('  Satellite 2'), 'test');
sat2.priority = 90;
const sat3 = SatelliteHelpers.quickSatellite('sat3', () => console.log('  Satellite 3'), 'test');
sat3.priority = 80;
const sat4 = SatelliteHelpers.quickSatellite('sat4', () => console.log('  Satellite 4'), 'test');
sat4.priority = 70;

manager8.register(sat1);
manager8.register(sat2);
manager8.register(sat3);
manager8.register(sat4);

const limitedReaction = SatelliteHelpers.withLimitedSatellites(
  () => console.log('>>> Main action'),
  [sat1, sat2, sat3, sat4],
  2
);

console.log('\nExecuting (max 2 satellites, highest priority):');
manager8.execute(limitedReaction, new Map(), new WorkingMemory());

// ============================================================================
// Example 9: Single Satellite Selection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Single Satellite Selection');
console.log('='.repeat(80));

const manager9 = new SatelliteManager();
SatellitePresets.registerAll(manager9);

const singleReaction = SatelliteHelpers.withSingleSatellite(
  () => console.log('>>> NPC: "I see."'),
  [
    manager9.get('nod')!,
    manager9.get('shrug')!,
    manager9.get('smile')!,
  ]
);

console.log('\nExecuting (only highest priority satellite fires):');
manager9.execute(singleReaction, new Map(), new WorkingMemory());

// ============================================================================
// Example 10: Non-Concurrent Satellites
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Non-Concurrent Satellites');
console.log('='.repeat(80));

const manager10 = new SatelliteManager();

const exclusiveSat = new SatelliteBuilder()
  .withId('exclusive')
  .does(() => console.log('  Exclusive action (blocks others)'))
  .allowsConcurrent(false)
  .withPriority(100)
  .register(manager10);

const otherSat1 = SatelliteHelpers.quickSatellite('other1', () => console.log('  Other 1'), 'test');
const otherSat2 = SatelliteHelpers.quickSatellite('other2', () => console.log('  Other 2'), 'test');

manager10.register(otherSat1);
manager10.register(otherSat2);

const exclusiveReaction = SatelliteHelpers.withLimitedSatellites(
  () => console.log('>>> Main'),
  [exclusiveSat, otherSat1, otherSat2],
  10
);

console.log('\nExecuting (exclusive satellite blocks others):');
manager10.execute(exclusiveReaction, new Map(), new WorkingMemory());

// ============================================================================
// Example 11: Satellite Categories
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Satellite Categories');
console.log('='.repeat(80));

const manager11 = new SatelliteManager();
SatellitePresets.registerAll(manager11);

console.log('\nFacial satellites:');
const facialSats = manager11.getByCategory(SatelliteCategory.FACIAL);
console.log(`  Found ${facialSats.length}: ${facialSats.map(s => s.id).join(', ')}`);

console.log('\nGesture satellites:');
const gestureSats = manager11.getByCategory(SatelliteCategory.GESTURE);
console.log(`  Found ${gestureSats.length}: ${gestureSats.map(s => s.id).join(', ')}`);

console.log('\nVocal satellites:');
const vocalSats = manager11.getByCategory(SatelliteCategory.VOCAL);
console.log(`  Found ${vocalSats.length}: ${vocalSats.map(s => s.id).join(', ')}`);

// ============================================================================
// Example 12: Execution Tracking
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Execution Tracking');
console.log('='.repeat(80));

const manager12 = new SatelliteManager();

const trackedSat = new SatelliteBuilder()
  .withId('tracked')
  .does(() => console.log('  Tracked satellite'))
  .register(manager12);

const trackReaction: ReactionWithSatellites = {
  mainAction: () => {},
  satellites: [trackedSat],
  fireAllSatellites: true,
};

console.log('\nExecuting 3 times:');
for (let i = 0; i < 3; i++) {
  manager12.execute(trackReaction, new Map(), new WorkingMemory());
}

console.log(`\nExecution count: ${manager12.getExecutionCount('tracked')}`);
console.log(`Last execution: ${manager12.getLastExecutionTime('tracked')}`);

console.log('\nStatistics:');
manager12.displayStats();

// ============================================================================
// Example 13: Practical Use Case - Rich NPC Dialogue
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 13: Practical Use Case - Rich NPC Dialogue');
console.log('='.repeat(80));

const wm13 = new WorkingMemory();
const engine13 = new RuleEngine(wm13, { debug: false });
const manager13 = new SatelliteManager();

// Register satellites
SatellitePresets.registerAll(manager13);

// Greeting rule with satellites
const greetRule = new RuleBuilder()
  .named('Greet Player')
  .whenType('Event', { type: 'player_approaches' })
  .then(() => {
    const reaction: ReactionWithSatellites = {
      mainAction: () => {
        console.log('>>> Merchant: "Welcome to my shop, friend!"');
      },
      satellites: [
        manager13.get('smile')!,
        manager13.get('nod')!,
        manager13.get('lean_forward')!,
      ],
      fireAllSatellites: true,
    };

    manager13.execute(reaction, new Map(), wm13);
  })
  .build();

// Insult rule with satellites
const insultRule = new RuleBuilder()
  .named('React to Insult')
  .whenType('Event', { type: 'player_insults' })
  .then(() => {
    const reaction: ReactionWithSatellites = {
      mainAction: () => {
        console.log('>>> Merchant: "How dare you speak to me like that!"');
      },
      satellites: [
        manager13.get('scowl')!,
        manager13.get('cross_arms')!,
        manager13.get('step_back')!,
      ],
      fireAllSatellites: true,
    };

    manager13.execute(reaction, new Map(), wm13);
  })
  .build();

// Dismiss rule with satellites
const dismissRule = new RuleBuilder()
  .named('Dismiss Player')
  .whenType('Event', { type: 'player_wastes_time' })
  .then(() => {
    const reaction: ReactionWithSatellites = {
      mainAction: () => {
        console.log('>>> Merchant: "If you\'re not buying, don\'t waste my time."');
      },
      satellites: [
        manager13.get('sigh')!,
        manager13.get('shake_head')!,
        manager13.get('eye_roll')!,
      ],
      fireAllSatellites: true,
    };

    manager13.execute(reaction, new Map(), wm13);
  })
  .build();

engine13.addRule(greetRule);
engine13.addRule(insultRule);
engine13.addRule(dismissRule);

console.log('\n--- SCENARIO: Merchant Interactions ---');

console.log('\n1. Player approaches shop:');
wm13.assert(new WME('Event', { type: 'player_approaches' }));
engine13.run();

console.log('\n2. Player insults merchant:');
wm13.clear();
wm13.assert(new WME('Event', { type: 'player_insults' }));
engine13.run();

console.log('\n3. Player wastes merchant\'s time:');
wm13.clear();
wm13.assert(new WME('Event', { type: 'player_wastes_time' }));
engine13.run();

// ============================================================================
// Example 14: Dynamic Satellite Composition
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 14: Dynamic Satellite Composition');
console.log('='.repeat(80));

const manager14 = new SatelliteManager();
SatellitePresets.registerAll(manager14);

function createReactionForMood(mood: 'happy' | 'neutral' | 'angry'): ReactionWithSatellites {
  const satelliteMap = {
    happy: [manager14.get('smile')!, manager14.get('laugh')!, manager14.get('nod')!],
    neutral: [manager14.get('shrug')!],
    angry: [manager14.get('scowl')!, manager14.get('cross_arms')!, manager14.get('grunt')!],
  };

  return {
    mainAction: () => console.log(`>>> NPC is feeling ${mood}`),
    satellites: satelliteMap[mood],
    fireAllSatellites: true,
  };
}

console.log('\nHappy mood:');
manager14.execute(createReactionForMood('happy'), new Map(), new WorkingMemory());

console.log('\nNeutral mood:');
manager14.execute(createReactionForMood('neutral'), new Map(), new WorkingMemory());

console.log('\nAngry mood:');
manager14.execute(createReactionForMood('angry'), new Map(), new WorkingMemory());

console.log('\n' + '='.repeat(80));
console.log('FACADE 6.6 EXAMPLES COMPLETE');
console.log('='.repeat(80));
