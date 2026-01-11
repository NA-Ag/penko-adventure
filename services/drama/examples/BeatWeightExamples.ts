/**
 * BeatWeightExamples - FACADE 4.6
 *
 * Examples demonstrating weighted/probabilistic beat selection.
 *
 * Beat weights control selection probability:
 * - Base weight from beat configuration
 * - Modified by priority
 * - Modified by target alignment
 * - Randomness prevents predictability
 *
 * This ensures:
 * - Appropriate beats selected probabilistically
 * - Same playthrough differs slightly each time
 * - Story feels natural, not scripted
 */

import { WorldState } from '../../abl/WorldState';
import { DramaManager } from '../DramaManager';
import { BeatBuilder, BeatPriority } from '../Beat';
import { StoryTargetBuilder, CurveType } from '../StoryTarget';

// ===== EXAMPLE 1: Basic Weighted Selection =====

export async function testBasicWeightedSelection(): Promise<void> {
  console.log('\n===== Example 1: Basic Weighted Selection =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    useWeightedSelection: true,
    randomnessFactor: 0.3,
  });

  // Three beats with different weights
  const beatCommon = new BeatBuilder('common_event', 'Common Event')
    .withPriority(BeatPriority.LOW)
    .withWeight(10) // Very common
    .withNarration('A common everyday occurrence.')
    .build();

  const beatUncommon = new BeatBuilder('uncommon_event', 'Uncommon Event')
    .withPriority(BeatPriority.NORMAL)
    .withWeight(3) // Less common
    .withNarration('Something unusual happens.')
    .build();

  const beatRare = new BeatBuilder('rare_event', 'Rare Event')
    .withPriority(BeatPriority.HIGH)
    .withWeight(1) // Very rare
    .withNarration('An extraordinary event occurs!')
    .build();

  dramaManager.addBeats([beatCommon, beatUncommon, beatRare]);

  console.log('--- Run 10 selections (should be weighted) ---');
  const results: Record<string, number> = {
    common_event: 0,
    uncommon_event: 0,
    rare_event: 0,
  };

  for (let i = 0; i < 10; i++) {
    const beat = dramaManager.selectBeat();
    if (beat) {
      results[beat.id]++;
      console.log(`Selection ${i + 1}: ${beat.name}`);
    }
    dramaManager.reset();
  }

  console.log('\n--- Results (Expected: Common > Uncommon > Rare) ---');
  console.log(`Common:   ${results.common_event}/10`);
  console.log(`Uncommon: ${results.uncommon_event}/10`);
  console.log(`Rare:     ${results.rare_event}/10`);

  console.log('\nExpected: Common event selected most often, rare event least often');
}

// ===== EXAMPLE 2: Weight Modified by Priority =====

export async function testPriorityModifiesWeight(): Promise<void> {
  console.log('\n===== Example 2: Weight Modified by Priority =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    useWeightedSelection: true,
    randomnessFactor: 0.3,
  });

  // Same base weight, different priorities
  const beatLowPriority = new BeatBuilder('low_priority', 'Low Priority Beat')
    .withPriority(BeatPriority.LOW) // 25
    .withWeight(5)
    .withNarration('Low priority event.')
    .build();

  const beatNormalPriority = new BeatBuilder('normal_priority', 'Normal Priority Beat')
    .withPriority(BeatPriority.NORMAL) // 50
    .withWeight(5)
    .withNarration('Normal priority event.')
    .build();

  const beatHighPriority = new BeatBuilder('high_priority', 'High Priority Beat')
    .withPriority(BeatPriority.HIGH) // 75
    .withWeight(5)
    .withNarration('High priority event.')
    .build();

  dramaManager.addBeats([beatLowPriority, beatNormalPriority, beatHighPriority]);

  console.log('--- Run 15 selections (higher priority = higher effective weight) ---');
  const results: Record<string, number> = {
    low_priority: 0,
    normal_priority: 0,
    high_priority: 0,
  };

  for (let i = 0; i < 15; i++) {
    const beat = dramaManager.selectBeat();
    if (beat) {
      results[beat.id]++;
    }
    dramaManager.reset();
  }

  console.log('\n--- Results (Expected: High > Normal > Low) ---');
  console.log(`Low:    ${results.low_priority}/15`);
  console.log(`Normal: ${results.normal_priority}/15`);
  console.log(`High:   ${results.high_priority}/15`);

  console.log('\nExpected: Higher priority beats selected more often despite same base weight');
}

// ===== EXAMPLE 3: Weight Modified by Target Alignment =====

export async function testTargetModifiesWeight(): Promise<void> {
  console.log('\n===== Example 3: Weight Modified by Target Alignment =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    useWeightedSelection: true,
    useTargetDrivenSelection: true,
    randomnessFactor: 0.3,
    initialStoryValues: {
      tension: 10,
    },
  });

  // Set target: tension should be at 60
  const target = new StoryTargetBuilder('tension', 'Target Tension')
    .fromTo(10, 60)
    .overDuration(10000)
    .withCurveType(CurveType.LINEAR)
    .build();

  target.start();
  dramaManager.getTargetManager().addTarget(target);

  // Simulate being at 5 seconds (target should be ~35)
  target.getTargetValueAtTime(5000); // Target: 35
  dramaManager.setStoryValue('tension', 20); // Current: 20 (below target by 15)

  // Beats with different tension effects
  const beatIncreaseTension = new BeatBuilder('increase_tension', 'Increase Tension')
    .withPriority(BeatPriority.NORMAL)
    .withWeight(5)
    .withStoryEffect('tension', 20) // Helps reach target
    .withNarration('Tension increases!')
    .build();

  const beatDecreaseTension = new BeatBuilder('decrease_tension', 'Decrease Tension')
    .withPriority(BeatPriority.NORMAL)
    .withWeight(5)
    .withStoryEffect('tension', -10) // Moves away from target
    .withNarration('Tension decreases...')
    .build();

  const beatNeutral = new BeatBuilder('neutral', 'Neutral Event')
    .withPriority(BeatPriority.NORMAL)
    .withWeight(5)
    .withNarration('Something happens.')
    .build();

  dramaManager.addBeats([beatIncreaseTension, beatDecreaseTension, beatNeutral]);

  console.log('--- Current: 20, Target: 35 (need to increase) ---');
  console.log('--- Run 20 selections ---');

  const results: Record<string, number> = {
    increase_tension: 0,
    decrease_tension: 0,
    neutral: 0,
  };

  for (let i = 0; i < 20; i++) {
    const beat = dramaManager.selectBeat();
    if (beat) {
      results[beat.id]++;
    }
    dramaManager.reset();
  }

  console.log('\n--- Results (Expected: Increase > Neutral > Decrease) ---');
  console.log(`Increase: ${results.increase_tension}/20 (helps reach target)`);
  console.log(`Neutral:  ${results.neutral}/20 (no effect)`);
  console.log(`Decrease: ${results.decrease_tension}/20 (moves away from target)`);

  console.log('\nExpected: Beats that help reach target get higher weight');
}

// ===== EXAMPLE 4: Randomness Prevents Predictability =====

export async function testRandomnessFactor(): Promise<void> {
  console.log('\n===== Example 4: Randomness Prevents Predictability =====\n');

  const worldState = new WorldState();

  // Low randomness (more deterministic)
  const dramaManagerLow = new DramaManager(worldState, {
    debug: false,
    useWeightedSelection: true,
    randomnessFactor: 0.1,
  });

  // High randomness (more random)
  const dramaManagerHigh = new DramaManager(worldState, {
    debug: false,
    useWeightedSelection: true,
    randomnessFactor: 0.9,
  });

  const beatCommon = new BeatBuilder('common', 'Common')
    .withWeight(10)
    .withNarration('Common event')
    .build();

  const beatRare = new BeatBuilder('rare', 'Rare')
    .withWeight(1)
    .withNarration('Rare event')
    .build();

  dramaManagerLow.addBeats([beatCommon, beatRare]);
  dramaManagerHigh.addBeats([beatCommon, beatRare]);

  console.log('--- Low Randomness (0.1) - 20 selections ---');
  const resultsLow: Record<string, number> = { common: 0, rare: 0 };
  for (let i = 0; i < 20; i++) {
    const beat = dramaManagerLow.selectBeat();
    if (beat) resultsLow[beat.id]++;
    dramaManagerLow.reset();
  }
  console.log(`Common: ${resultsLow.common}/20, Rare: ${resultsLow.rare}/20`);

  console.log('\n--- High Randomness (0.9) - 20 selections ---');
  const resultsHigh: Record<string, number> = { common: 0, rare: 0 };
  for (let i = 0; i < 20; i++) {
    const beat = dramaManagerHigh.selectBeat();
    if (beat) resultsHigh[beat.id]++;
    dramaManagerHigh.reset();
  }
  console.log(`Common: ${resultsHigh.common}/20, Rare: ${resultsHigh.rare}/20`);

  console.log('\nExpected: Low randomness = predictable (mostly common), High randomness = more variety');
}

// ===== EXAMPLE 5: Same Playthrough Differs =====

export async function testPlaythroughVariation(): Promise<void> {
  console.log('\n===== Example 5: Same Playthrough Differs Each Time =====\n');

  const createPlaythrough = () => {
    const worldState = new WorldState();
    const dramaManager = new DramaManager(worldState, {
      debug: false,
      useWeightedSelection: true,
      randomnessFactor: 0.4,
    });

    const beat1 = new BeatBuilder('encounter_1', 'Encounter Type A')
      .withWeight(4)
      .withNarration('You encounter a merchant')
      .build();

    const beat2 = new BeatBuilder('encounter_2', 'Encounter Type B')
      .withWeight(3)
      .withNarration('You encounter a guard')
      .build();

    const beat3 = new BeatBuilder('encounter_3', 'Encounter Type C')
      .withWeight(2)
      .withNarration('You encounter a traveler')
      .build();

    const beat4 = new BeatBuilder('encounter_4', 'Encounter Type D')
      .withWeight(1)
      .withNarration('You encounter a wizard')
      .build();

    dramaManager.addBeats([beat1, beat2, beat3, beat4]);

    const sequence: string[] = [];
    for (let i = 0; i < 5; i++) {
      const beat = dramaManager.selectBeat();
      if (beat) {
        sequence.push(beat.name.split(' ').pop()!); // Get just the letter
      }
      dramaManager.reset();
    }

    return sequence.join(' → ');
  };

  console.log('--- Playthrough 1 ---');
  console.log(createPlaythrough());

  console.log('\n--- Playthrough 2 ---');
  console.log(createPlaythrough());

  console.log('\n--- Playthrough 3 ---');
  console.log(createPlaythrough());

  console.log('\n--- Playthrough 4 ---');
  console.log(createPlaythrough());

  console.log('\n--- Playthrough 5 ---');
  console.log(createPlaythrough());

  console.log('\nExpected: Each playthrough shows different sequence (replayability)');
}

// ===== EXAMPLE 6: Weighted Selection Distribution =====

export async function testWeightDistribution(): Promise<void> {
  console.log('\n===== Example 6: Weighted Selection Distribution (100 runs) =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: false,
    useWeightedSelection: true,
    randomnessFactor: 0.3,
  });

  const beats = [
    new BeatBuilder('weight_1', 'Weight 1').withWeight(1).withNarration('1').build(),
    new BeatBuilder('weight_2', 'Weight 2').withWeight(2).withNarration('2').build(),
    new BeatBuilder('weight_5', 'Weight 5').withWeight(5).withNarration('5').build(),
    new BeatBuilder('weight_10', 'Weight 10').withWeight(10).withNarration('10').build(),
  ];

  dramaManager.addBeats(beats);

  const results: Record<string, number> = {
    weight_1: 0,
    weight_2: 0,
    weight_5: 0,
    weight_10: 0,
  };

  for (let i = 0; i < 100; i++) {
    const beat = dramaManager.selectBeat();
    if (beat) results[beat.id]++;
    dramaManager.reset();
  }

  const totalWeight = 1 + 2 + 5 + 10; // 18
  console.log('--- Results (100 selections) ---');
  console.log(`Weight 1:  ${results.weight_1}/100 (expected ~${Math.round((1 / totalWeight) * 100)}%)`);
  console.log(`Weight 2:  ${results.weight_2}/100 (expected ~${Math.round((2 / totalWeight) * 100)}%)`);
  console.log(`Weight 5:  ${results.weight_5}/100 (expected ~${Math.round((5 / totalWeight) * 100)}%)`);
  console.log(`Weight 10: ${results.weight_10}/100 (expected ~${Math.round((10 / totalWeight) * 100)}%)`);

  console.log('\nExpected: Distribution roughly matches weight ratios');
}

// ===== EXAMPLE 7: Combined Priority and Weight =====

export async function testCombinedFactors(): Promise<void> {
  console.log('\n===== Example 7: Combined Priority, Weight, and Targets =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: false,
    useWeightedSelection: true,
    useTargetDrivenSelection: true,
    randomnessFactor: 0.3,
    initialStoryValues: { tension: 30 },
  });

  // Target: tension should be at 70
  const target = new StoryTargetBuilder('tension', 'High Tension')
    .fromTo(30, 70)
    .overDuration(10000)
    .withCurveType(CurveType.LINEAR)
    .build();

  target.start();
  dramaManager.getTargetManager().addTarget(target);

  // Current: 30, Target at 50% progress: 50 (need +20)

  const beat1 = new BeatBuilder('action_scene', 'Action Scene')
    .withPriority(BeatPriority.HIGH) // 75
    .withWeight(3)
    .withStoryEffect('tension', 25) // Helps reach target
    .withNarration('Intense action!')
    .build();

  const beat2 = new BeatBuilder('drama_scene', 'Drama Scene')
    .withPriority(BeatPriority.NORMAL) // 50
    .withWeight(5)
    .withStoryEffect('tension', 15) // Helps reach target
    .withNarration('Dramatic moment')
    .build();

  const beat3 = new BeatBuilder('calm_scene', 'Calm Scene')
    .withPriority(BeatPriority.LOW) // 25
    .withWeight(8)
    .withStoryEffect('tension', -10) // Moves away from target
    .withNarration('Peaceful moment')
    .build();

  dramaManager.addBeats([beat1, beat2, beat3]);

  console.log('--- Current tension: 30, Target: 50 (need to increase) ---');
  console.log('--- Beat weights and priorities ---');
  console.log('Action: HIGH priority (75), weight 3, +25 tension (HELPS target)');
  console.log('Drama:  NORMAL priority (50), weight 5, +15 tension (HELPS target)');
  console.log('Calm:   LOW priority (25), weight 8, -10 tension (HURTS target)');

  const results: Record<string, number> = {
    action_scene: 0,
    drama_scene: 0,
    calm_scene: 0,
  };

  console.log('\n--- Run 30 selections ---');
  for (let i = 0; i < 30; i++) {
    const beat = dramaManager.selectBeat();
    if (beat) results[beat.id]++;
    dramaManager.reset();
  }

  console.log('\n--- Results ---');
  console.log(`Action: ${results.action_scene}/30 (high priority, helps target)`);
  console.log(`Drama:  ${results.drama_scene}/30 (medium priority, helps target)`);
  console.log(`Calm:   ${results.calm_scene}/30 (low priority, hurts target)`);

  console.log('\nExpected: Action and Drama favored (help target), Calm rare (high weight negated by low priority and target mismatch)');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllBeatWeightExamples(): Promise<void> {
  await testBasicWeightedSelection();
  await new Promise(r => setTimeout(r, 1000));

  await testPriorityModifiesWeight();
  await new Promise(r => setTimeout(r, 1000));

  await testTargetModifiesWeight();
  await new Promise(r => setTimeout(r, 1000));

  await testRandomnessFactor();
  await new Promise(r => setTimeout(r, 1000));

  await testPlaythroughVariation();
  await new Promise(r => setTimeout(r, 1000));

  await testWeightDistribution();
  await new Promise(r => setTimeout(r, 1000));

  await testCombinedFactors();
}

// Run if executed directly
if (require.main === module) {
  runAllBeatWeightExamples().catch(console.error);
}
