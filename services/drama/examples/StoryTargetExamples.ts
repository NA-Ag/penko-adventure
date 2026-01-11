/**
 * StoryTargetExamples - FACADE 4.3
 *
 * Examples demonstrating story targets (desired trajectories).
 *
 * Story targets define how story values SHOULD evolve over time:
 * - Linear progression
 * - Exponential growth
 * - Bell curves (rise and fall)
 * - Step functions
 * - Custom curves
 *
 * The drama manager uses targets to select beats that move values
 * toward desired trajectories.
 */

import { WorldState } from '../../abl/WorldState';
import { DramaManager } from '../DramaManager';
import { BeatBuilder, BeatPriority } from '../Beat';
import {
  StoryTarget,
  StoryTargetBuilder,
  CurveType,
  TargetManager,
  StoryArcs,
} from '../StoryTarget';

// ===== EXAMPLE 1: Linear Target =====

export async function testLinearTarget(): Promise<void> {
  console.log('\n===== Example 1: Linear Target =====\n');

  // Create target: tension should rise linearly from 10 to 90 over 10 seconds
  const target = new StoryTargetBuilder('tension', 'Linear Tension Rise')
    .fromTo(10, 90)
    .overDuration(10000)
    .withCurveType(CurveType.LINEAR)
    .build();

  target.start();

  console.log('--- Target at different times ---');
  console.log(`At 0%:   ${target.getTargetValueAtTime(0).toFixed(1)}`);
  console.log(`At 25%:  ${target.getTargetValueAtTime(2500).toFixed(1)}`);
  console.log(`At 50%:  ${target.getTargetValueAtTime(5000).toFixed(1)}`);
  console.log(`At 75%:  ${target.getTargetValueAtTime(7500).toFixed(1)}`);
  console.log(`At 100%: ${target.getTargetValueAtTime(10000).toFixed(1)}`);

  console.log('\nExpected: Steady linear increase from 10 to 90');
}

// ===== EXAMPLE 2: Exponential Target =====

export async function testExponentialTarget(): Promise<void> {
  console.log('\n===== Example 2: Exponential Target (Slow Start, Rapid Growth) =====\n');

  // Tension starts low, then explodes
  const target = new StoryTargetBuilder('tension', 'Exponential Tension')
    .fromTo(5, 95)
    .overDuration(10000)
    .withCurveType(CurveType.EXPONENTIAL)
    .build();

  target.start();

  console.log('--- Target at different times ---');
  console.log(`At 0%:   ${target.getTargetValueAtTime(0).toFixed(1)} (slow start)`);
  console.log(`At 25%:  ${target.getTargetValueAtTime(2500).toFixed(1)}`);
  console.log(`At 50%:  ${target.getTargetValueAtTime(5000).toFixed(1)}`);
  console.log(`At 75%:  ${target.getTargetValueAtTime(7500).toFixed(1)}`);
  console.log(`At 100%: ${target.getTargetValueAtTime(10000).toFixed(1)} (rapid growth)`);

  console.log('\nExpected: Slow start, rapid acceleration toward end');
}

// ===== EXAMPLE 3: Logarithmic Target =====

export async function testLogarithmicTarget(): Promise<void> {
  console.log('\n===== Example 3: Logarithmic Target (Fast Start, Slow Growth) =====\n');

  // Affinity grows quickly at first, then plateaus
  const target = new StoryTargetBuilder('affinity', 'Logarithmic Affinity')
    .fromTo(10, 80)
    .overDuration(10000)
    .withCurveType(CurveType.LOGARITHMIC)
    .build();

  target.start();

  console.log('--- Target at different times ---');
  console.log(`At 0%:   ${target.getTargetValueAtTime(0).toFixed(1)} (rapid start)`);
  console.log(`At 25%:  ${target.getTargetValueAtTime(2500).toFixed(1)}`);
  console.log(`At 50%:  ${target.getTargetValueAtTime(5000).toFixed(1)}`);
  console.log(`At 75%:  ${target.getTargetValueAtTime(7500).toFixed(1)}`);
  console.log(`At 100%: ${target.getTargetValueAtTime(10000).toFixed(1)} (slow growth)`);

  console.log('\nExpected: Fast initial growth, then slowing to plateau');
}

// ===== EXAMPLE 4: Bell Curve Target =====

export async function testBellCurveTarget(): Promise<void> {
  console.log('\n===== Example 4: Bell Curve (Rise to Peak, Then Fall) =====\n');

  // Mystery rises to peak at midpoint, then is resolved
  const target = new StoryTargetBuilder('mystery', 'Bell Curve Mystery')
    .fromTo(10, 90)
    .overDuration(10000)
    .withCurveType(CurveType.BELL)
    .build();

  target.start();

  console.log('--- Target at different times ---');
  console.log(`At 0%:   ${target.getTargetValueAtTime(0).toFixed(1)} (low)`);
  console.log(`At 25%:  ${target.getTargetValueAtTime(2500).toFixed(1)} (rising)`);
  console.log(`At 50%:  ${target.getTargetValueAtTime(5000).toFixed(1)} (PEAK)`);
  console.log(`At 75%:  ${target.getTargetValueAtTime(7500).toFixed(1)} (falling)`);
  console.log(`At 100%: ${target.getTargetValueAtTime(10000).toFixed(1)} (resolved)`);

  console.log('\nExpected: Rise to peak at midpoint, then fall');
}

// ===== EXAMPLE 5: Step Function Target =====

export async function testStepTarget(): Promise<void> {
  console.log('\n===== Example 5: Step Function (Sudden Jumps) =====\n');

  // Urgency jumps at specific story moments
  const target = new StoryTargetBuilder('urgency', 'Step Urgency')
    .fromTo(5, 5) // Base value
    .overDuration(15000)
    .withCurveType(CurveType.STEP)
    .withKeyPoint(0, 5)       // Start: low urgency
    .withKeyPoint(5000, 30)   // First deadline mentioned
    .withKeyPoint(10000, 60)  // Second warning
    .withKeyPoint(12000, 90)  // Final countdown
    .build();

  target.start();

  console.log('--- Target at different times ---');
  console.log(`At 0ms:     ${target.getTargetValueAtTime(0).toFixed(1)}`);
  console.log(`At 3000ms:  ${target.getTargetValueAtTime(3000).toFixed(1)}`);
  console.log(`At 5000ms:  ${target.getTargetValueAtTime(5000).toFixed(1)} (JUMP)`);
  console.log(`At 8000ms:  ${target.getTargetValueAtTime(8000).toFixed(1)}`);
  console.log(`At 10000ms: ${target.getTargetValueAtTime(10000).toFixed(1)} (JUMP)`);
  console.log(`At 12000ms: ${target.getTargetValueAtTime(12000).toFixed(1)} (JUMP)`);
  console.log(`At 15000ms: ${target.getTargetValueAtTime(15000).toFixed(1)}`);

  console.log('\nExpected: Sudden jumps at specific times');
}

// ===== EXAMPLE 6: Custom Curve Target =====

export async function testCustomCurveTarget(): Promise<void> {
  console.log('\n===== Example 6: Custom Curve =====\n');

  // Custom wave pattern for humor
  const target = new StoryTargetBuilder('humor', 'Wave Pattern Humor')
    .fromTo(20, 80)
    .overDuration(10000)
    .withCustomCurve((progress) => {
      // Sine wave: oscillate between 20 and 80
      const amplitude = 30;
      const baseline = 50;
      const frequency = 2;
      return baseline + amplitude * Math.sin(progress * frequency * Math.PI * 2);
    })
    .build();

  target.start();

  console.log('--- Target at different times ---');
  for (let i = 0; i <= 10; i++) {
    const time = i * 1000;
    console.log(`At ${(i * 10).toString().padStart(3)}%: ${target.getTargetValueAtTime(time).toFixed(1)}`);
  }

  console.log('\nExpected: Oscillating wave pattern');
}

// ===== EXAMPLE 7: Deviation Tracking =====

export async function testDeviationTracking(): Promise<void> {
  console.log('\n===== Example 7: Deviation Tracking =====\n');

  const target = new StoryTargetBuilder('tension', 'Target Tension')
    .fromTo(10, 90)
    .overDuration(10000)
    .withCurveType(CurveType.LINEAR)
    .withTolerance(10)
    .build();

  target.start();

  console.log('--- Check deviations at 50% progress ---');
  const targetAt50 = target.getTargetValueAtTime(5000);
  console.log(`Target value at 50%: ${targetAt50.toFixed(1)}`);

  const scenarios = [
    { current: 45, label: 'Below target' },
    { current: 50, label: 'On target' },
    { current: 55, label: 'Above target' },
    { current: 30, label: 'Way below' },
    { current: 70, label: 'Way above' },
  ];

  for (const scenario of scenarios) {
    const deviation = target.getDeviation(scenario.current);
    const onTarget = target.isOnTarget(scenario.current);
    console.log(`  Current=${scenario.current}: Deviation=${deviation > 0 ? '+' : ''}${deviation.toFixed(1)} ${onTarget ? '✓' : '✗'} (${scenario.label})`);
  }

  console.log('\nExpected: Deviations calculated, on-target checked');
}

// ===== EXAMPLE 8: Multiple Targets with Manager =====

export async function testTargetManager(): Promise<void> {
  console.log('\n===== Example 8: Multiple Targets with Manager =====\n');

  const manager = new TargetManager();

  // Add multiple targets
  const tensionTarget = new StoryTargetBuilder('tension', 'Rising Tension')
    .fromTo(10, 80)
    .overDuration(10000)
    .withCurveType(CurveType.EXPONENTIAL)
    .build();

  const affinityTarget = new StoryTargetBuilder('affinity', 'Growing Affinity')
    .fromTo(20, 70)
    .overDuration(10000)
    .withCurveType(CurveType.LOGARITHMIC)
    .build();

  const romanceTarget = new StoryTargetBuilder('romance', 'Romance Development')
    .fromTo(0, 60)
    .overDuration(10000)
    .withCurveType(CurveType.LINEAR)
    .build();

  manager.addTarget(tensionTarget);
  manager.addTarget(affinityTarget);
  manager.addTarget(romanceTarget);

  manager.startAll();

  console.log('--- Current values (simulated) ---');
  const currentValues = new Map<string, number>([
    ['tension', 45],
    ['affinity', 55],
    ['romance', 30],
  ]);

  console.log(manager.getSummary(currentValues));

  console.log('\n--- Worst deviation ---');
  const worst = manager.getWorstDeviation(currentValues);
  if (worst) {
    console.log(`${worst.storyValueKey}: ${worst.deviation > 0 ? '+' : ''}${worst.deviation.toFixed(1)}`);
  }

  console.log('\nExpected: Multiple targets tracked, worst deviation identified');
}

// ===== EXAMPLE 9: Story Arc Presets =====

export async function testStoryArcPresets(): Promise<void> {
  console.log('\n===== Example 9: Story Arc Presets =====\n');

  const duration = 10000;

  console.log('--- Three-Act Tension Arc ---');
  const threeAct = StoryArcs.threeActTension(duration);
  threeAct.start();
  console.log(`Act 1 (30%): ${threeAct.getTargetValueAtTime(3000).toFixed(1)}`);
  console.log(`Act 2 (60%): ${threeAct.getTargetValueAtTime(6000).toFixed(1)}`);
  console.log(`Act 3 (90%): ${threeAct.getTargetValueAtTime(9000).toFixed(1)}`);

  console.log('\n--- Romance Arc ---');
  const romance = StoryArcs.romanceArc(duration);
  romance.start();
  console.log(`Early (25%): ${romance.getTargetValueAtTime(2500).toFixed(1)}`);
  console.log(`Mid (50%):   ${romance.getTargetValueAtTime(5000).toFixed(1)}`);
  console.log(`Late (75%):  ${romance.getTargetValueAtTime(7500).toFixed(1)}`);

  console.log('\n--- Mystery Arc ---');
  const mystery = StoryArcs.mysteryArc(duration);
  mystery.start();
  console.log(`Setup (25%):      ${mystery.getTargetValueAtTime(2500).toFixed(1)}`);
  console.log(`Investigation (50%): ${mystery.getTargetValueAtTime(5000).toFixed(1)}`);
  console.log(`Resolution (75%):    ${mystery.getTargetValueAtTime(7500).toFixed(1)}`);

  console.log('\n--- Comedy Constant ---');
  const comedy = StoryArcs.comedyConstant(duration, 40);
  comedy.start();
  console.log(`Start (0%):  ${comedy.getTargetValueAtTime(0).toFixed(1)}`);
  console.log(`Mid (50%):   ${comedy.getTargetValueAtTime(5000).toFixed(1)}`);
  console.log(`End (100%):  ${comedy.getTargetValueAtTime(10000).toFixed(1)}`);

  console.log('\nExpected: Preset arcs with appropriate curves');
}

// ===== EXAMPLE 10: Integration with Drama Manager =====

export async function testDramaManagerIntegration(): Promise<void> {
  console.log('\n===== Example 10: Integration with Drama Manager =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      tension: 10,
      affinity: 30,
    },
  });

  // Set target: tension should rise to 60 over time
  const target = new StoryTargetBuilder('tension', 'Rising Tension')
    .fromTo(10, 60)
    .overDuration(10000)
    .withCurveType(CurveType.LINEAR)
    .withTolerance(10)
    .build();

  target.start();

  // Create beats that increase tension
  const beatThreat = new BeatBuilder('threat', 'Threatening Situation')
    .withPriority(BeatPriority.NORMAL)
    .withStoryEffect('tension', 15)
    .withNarration('Danger looms!')
    .build();

  const beatCalm = new BeatBuilder('calm', 'Calming Moment')
    .withPriority(BeatPriority.LOW)
    .withStoryEffect('tension', -5)
    .withNarration('Things settle down...')
    .build();

  dramaManager.addBeats([beatThreat, beatCalm]);

  console.log('--- Simulate progression ---');

  // Simulate at 0%
  console.log('\nAt 0% progress:');
  const targetValue0 = target.getTargetValueAtTime(0);
  const currentValue0 = dramaManager.getStoryValue('tension');
  const deviation0 = target.getDeviation(currentValue0);
  console.log(`  Target: ${targetValue0.toFixed(1)}, Current: ${currentValue0.toFixed(1)}, Deviation: ${deviation0 > 0 ? '+' : ''}${deviation0.toFixed(1)}`);
  console.log(`  Recommendation: ${deviation0 < -5 ? 'Execute tension-increasing beat' : 'On track'}`);

  // Execute tension beat (we're below target)
  if (deviation0 < -5) {
    console.log('  → Executing tension beat');
    dramaManager.executeBeat('threat');
  }

  // Simulate at 50%
  console.log('\nAt 50% progress:');
  const targetValue50 = target.getTargetValueAtTime(5000);
  const currentValue50 = dramaManager.getStoryValue('tension');
  const deviation50 = target.getDeviation(currentValue50);
  console.log(`  Target: ${targetValue50.toFixed(1)}, Current: ${currentValue50.toFixed(1)}, Deviation: ${deviation50 > 0 ? '+' : ''}${deviation50.toFixed(1)}`);
  console.log(`  Recommendation: ${deviation50 < -5 ? 'Execute tension-increasing beat' : deviation50 > 5 ? 'Execute tension-decreasing beat' : 'On track'}`);

  if (deviation50 < -5) {
    console.log('  → Executing tension beat');
    dramaManager.executeBeat('threat');
  } else if (deviation50 > 5) {
    console.log('  → Executing calm beat');
    dramaManager.executeBeat('calm');
  }

  console.log('\nExpected: Drama manager uses targets to guide beat selection');
}

// ===== EXAMPLE 11: Complete Story Arc =====

export async function testCompleteStoryArc(): Promise<void> {
  console.log('\n===== Example 11: Complete Story Arc =====\n');

  const manager = new TargetManager();

  // Define complete story arc (30 second story)
  const storyDuration = 30000;

  // Act 1: Setup (0-10s) - Low tension, building affinity
  const act1Tension = new StoryTargetBuilder('tension', 'Act 1 Tension')
    .fromTo(10, 30)
    .overDuration(storyDuration)
    .withCurveType(CurveType.LINEAR)
    .build();

  const act1Affinity = new StoryTargetBuilder('affinity', 'Act 1 Affinity')
    .fromTo(20, 60)
    .overDuration(storyDuration)
    .withCurveType(CurveType.LOGARITHMIC)
    .build();

  // Urgency spikes in Act 3
  const urgency = new StoryTargetBuilder('urgency', 'Urgency Arc')
    .fromTo(5, 5)
    .overDuration(storyDuration)
    .withCurveType(CurveType.STEP)
    .withKeyPoint(0, 5)
    .withKeyPoint(10000, 15)
    .withKeyPoint(20000, 60)   // Act 3 starts
    .withKeyPoint(25000, 90)   // Climax
    .build();

  manager.addTarget(act1Tension);
  manager.addTarget(act1Affinity);
  manager.addTarget(urgency);

  manager.startAll();

  console.log('--- Story Timeline ---\n');

  const timePoints = [
    { time: 0, label: 'Act 1 Start' },
    { time: 5000, label: 'Act 1 Middle' },
    { time: 10000, label: 'Act 2 Start' },
    { time: 15000, label: 'Act 2 Middle' },
    { time: 20000, label: 'Act 3 Start' },
    { time: 25000, label: 'Climax' },
    { time: 30000, label: 'Resolution' },
  ];

  for (const point of timePoints) {
    console.log(`${point.label} (${(point.time / 1000).toFixed(0)}s):`);
    console.log(`  Tension target:  ${act1Tension.getTargetValueAtTime(point.time).toFixed(1)}`);
    console.log(`  Affinity target: ${act1Affinity.getTargetValueAtTime(point.time).toFixed(1)}`);
    console.log(`  Urgency target:  ${urgency.getTargetValueAtTime(point.time).toFixed(1)}`);
    console.log('');
  }

  console.log('Expected: Complete three-act structure with appropriate value curves');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllStoryTargetExamples(): Promise<void> {
  await testLinearTarget();
  await new Promise(r => setTimeout(r, 1000));

  await testExponentialTarget();
  await new Promise(r => setTimeout(r, 1000));

  await testLogarithmicTarget();
  await new Promise(r => setTimeout(r, 1000));

  await testBellCurveTarget();
  await new Promise(r => setTimeout(r, 1000));

  await testStepTarget();
  await new Promise(r => setTimeout(r, 1000));

  await testCustomCurveTarget();
  await new Promise(r => setTimeout(r, 1000));

  await testDeviationTracking();
  await new Promise(r => setTimeout(r, 1000));

  await testTargetManager();
  await new Promise(r => setTimeout(r, 1000));

  await testStoryArcPresets();
  await new Promise(r => setTimeout(r, 1000));

  await testDramaManagerIntegration();
  await new Promise(r => setTimeout(r, 1000));

  await testCompleteStoryArc();
}

// Run if executed directly
if (require.main === module) {
  runAllStoryTargetExamples().catch(console.error);
}
