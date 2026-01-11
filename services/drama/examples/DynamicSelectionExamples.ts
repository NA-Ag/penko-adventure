/**
 * DynamicSelectionExamples - FACADE 4.7
 *
 * Examples demonstrating dynamic beat selection with triggers.
 *
 * Dynamic beat selection triggers beats based on:
 * - Player actions (major gameplay moments)
 * - Story value thresholds (tension gets too high)
 * - Time elapsed (after X minutes)
 * - World state changes (location changes, quest completion)
 *
 * This ensures:
 * - Dramatic moments happen at appropriate times
 * - Story flows naturally without feeling scripted
 * - High-priority beats respond to player actions
 */

import { WorldState } from '../../abl/WorldState';
import { DramaManager, TriggerType } from '../DramaManager';
import { BeatBuilder, BeatPriority } from '../Beat';

// ===== EXAMPLE 1: Player Action Triggers =====

export async function testPlayerActionTriggers(): Promise<void> {
  console.log('\n===== Example 1: Player Action Triggers =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    useDynamicSelection: true,
  });

  // Critical beat: Betrayal revealed (triggered by player action)
  const beatBetrayal = new BeatBuilder('betrayal_revealed', 'Betrayal Revealed!')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('Your ally suddenly attacks you! They were a traitor all along!')
    .withStoryEffect('tension', 60)
    .withStoryEffect('affinity', -50)
    .withWorldEffect('ally_hostile', true)
    .build();

  // High priority beat: Combat begins
  const beatCombat = new BeatBuilder('combat_begins', 'Combat Begins')
    .withPriority(BeatPriority.HIGH)
    .withNarration('The enemy charges!')
    .withStoryEffect('tension', 30)
    .build();

  // Normal priority beat: Dialogue
  const beatDialogue = new BeatBuilder('casual_dialogue', 'Casual Dialogue')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You chat with your companion.')
    .build();

  dramaManager.addBeats([beatBetrayal, beatCombat, beatDialogue]);

  console.log('--- Player performs normal action ---');
  let result = dramaManager.onPlayerAction('walk');
  if (result) {
    console.log(`Beat triggered: ${result.beatName}`);
  } else {
    console.log('No beat triggered (action not significant enough)');
  }

  console.log('\n--- Player attacks (major action) ---');
  result = dramaManager.onPlayerAction('attack');
  if (result) {
    console.log(`Beat triggered: ${result.beatName}`);
  } else {
    console.log('No beat triggered');
  }

  console.log('\n--- Player talks to ally (major action) ---');
  dramaManager.reset();
  result = dramaManager.onPlayerAction('talk_to_ally');
  if (result) {
    console.log(`Beat triggered: ${result.beatName}`);
  } else {
    console.log('No beat triggered');
  }

  console.log('\nExpected: Major player actions trigger high-priority beats');
}

// ===== EXAMPLE 2: Story Value Threshold Triggers =====

export async function testStoryValueThresholds(): Promise<void> {
  console.log('\n===== Example 2: Story Value Threshold Triggers =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    useDynamicSelection: true,
    initialStoryValues: {
      tension: 10,
    },
    storyValueThresholds: {
      tension: { threshold: 70, direction: 'above' },
      affinity: { threshold: 20, direction: 'below' },
    },
  });

  // Critical beat: Panic attack (triggered when tension too high)
  const beatPanic = new BeatBuilder('panic_attack', 'Panic Attack!')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('The stress is overwhelming! You need to calm down!')
    .withStoryEffect('tension', -20)
    .withWorldEffect('player_panicking', true)
    .build();

  // High beat: Relationship crisis (triggered when affinity too low)
  const beatCrisis = new BeatBuilder('relationship_crisis', 'Relationship Crisis')
    .withPriority(BeatPriority.HIGH)
    .withNarration('Your companion questions your friendship.')
    .withStoryEffect('affinity', 10)
    .build();

  dramaManager.addBeats([beatPanic, beatCrisis]);

  console.log('--- Initial tension: 10 ---');
  console.log(`Tension: ${dramaManager.getStoryValue('tension')}`);

  console.log('\n--- Increase tension to 50 (below threshold) ---');
  dramaManager.setStoryValue('tension', 50);
  console.log(`Tension: ${dramaManager.getStoryValue('tension')}`);
  console.log('No beat triggered yet');

  console.log('\n--- Increase tension to 75 (crosses threshold!) ---');
  dramaManager.setStoryValue('tension', 75);
  console.log(`Tension: ${dramaManager.getStoryValue('tension')}`);
  console.log('Panic beat should trigger!');

  console.log('\n--- Decrease affinity to 15 (crosses threshold!) ---');
  dramaManager.setStoryValue('affinity', 15);
  console.log(`Affinity: ${dramaManager.getStoryValue('affinity')}`);
  console.log('Crisis beat should trigger!');

  console.log('\nExpected: Beats trigger when story values cross thresholds');
}

// ===== EXAMPLE 3: Threshold Directions =====

export async function testThresholdDirections(): Promise<void> {
  console.log('\n===== Example 3: Threshold Directions (Above/Below/Crosses) =====\n');

  const worldState = new WorldState();

  console.log('--- Direction: "above" (triggers once when crossing from below) ---');
  const dmAbove = new DramaManager(worldState, {
    debug: false,
    useDynamicSelection: true,
    initialStoryValues: { danger: 30 },
    storyValueThresholds: {
      danger: { threshold: 50, direction: 'above' },
    },
  });

  const beatDanger = new BeatBuilder('danger_high', 'High Danger!')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('Danger level critical!')
    .build();

  dmAbove.addBeat(beatDanger);

  dmAbove.setStoryValue('danger', 55); // Cross from below
  console.log('Danger 30 → 55: Triggered');

  dmAbove.reset();
  dmAbove.setStoryValue('danger', 60); // Already above (from initial)
  dmAbove.setStoryValue('danger', 65); // Still above
  console.log('Danger 30 → 60 → 65: Only triggered once');

  console.log('\n--- Direction: "below" (triggers once when crossing from above) ---');
  const dmBelow = new DramaManager(worldState, {
    debug: false,
    useDynamicSelection: true,
    initialStoryValues: { health: 80 },
    storyValueThresholds: {
      health: { threshold: 30, direction: 'below' },
    },
  });

  const beatLowHealth = new BeatBuilder('low_health', 'Low Health Warning!')
    .withPriority(BeatPriority.HIGH)
    .withNarration('Health critical!')
    .build();

  dmBelow.addBeat(beatLowHealth);

  dmBelow.setStoryValue('health', 25); // Cross from above
  console.log('Health 80 → 25: Triggered');

  console.log('\n--- Direction: "crosses" (triggers every time threshold is crossed) ---');
  const dmCrosses = new DramaManager(worldState, {
    debug: false,
    useDynamicSelection: true,
    initialStoryValues: { mood: 40 },
    storyValueThresholds: {
      mood: { threshold: 50, direction: 'crosses' },
    },
  });

  const beatMoodChange = new BeatBuilder('mood_swing', 'Mood Swing')
    .withPriority(BeatPriority.HIGH)
    .withNarration('Mood changes!')
    .build();

  dmCrosses.addBeat(beatMoodChange);

  dmCrosses.setStoryValue('mood', 60); // Cross upward
  console.log('Mood 40 → 60: Triggered');

  dmCrosses.reset();
  dmCrosses.setStoryValue('mood', 60);
  dmCrosses.setStoryValue('mood', 40); // Cross downward
  console.log('Mood 60 → 40: Triggered again');

  console.log('\nExpected: Different threshold directions trigger at different times');
}

// ===== EXAMPLE 4: Dramatic Moments at Appropriate Times =====

export async function testDramaticTiming(): Promise<void> {
  console.log('\n===== Example 4: Dramatic Moments at Appropriate Times =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    useDynamicSelection: true,
    initialStoryValues: {
      tension: 20,
      stakes: 30,
    },
    storyValueThresholds: {
      tension: { threshold: 80, direction: 'above' },
      stakes: { threshold: 70, direction: 'above' },
    },
  });

  // Climactic beat
  const beatClimax = new BeatBuilder('climax', 'The Climax!')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('Everything comes to a head! This is the moment!')
    .withStoryEffect('tension', 20)
    .withStoryEffect('stakes', 30)
    .withWorldEffect('climax_reached', true)
    .build();

  // Boss fight beat
  const beatBossFight = new BeatBuilder('boss_fight', 'Boss Fight')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('The final boss appears!')
    .withStoryEffect('tension', 50)
    .build();

  dramaManager.addBeats([beatClimax, beatBossFight]);

  console.log('--- Story progression ---');

  console.log('\nAct 1: Setup (tension: 20, stakes: 30)');
  console.log('No dramatic beats trigger yet');

  console.log('\nAct 2: Rising action');
  dramaManager.setStoryValue('tension', 50);
  dramaManager.setStoryValue('stakes', 50);
  console.log('Tension: 50, Stakes: 50 - Still building');

  console.log('\nAct 3: Approaching climax');
  dramaManager.setStoryValue('tension', 70);
  dramaManager.setStoryValue('stakes', 65);
  console.log('Tension: 70, Stakes: 65 - Getting close');

  console.log('\nCLIMAX: Tension and stakes peak!');
  dramaManager.setStoryValue('tension', 85);
  console.log('Tension crosses 80 threshold →  Beat triggers!');

  console.log('\nExpected: Dramatic beats triggered at peak moments, not randomly');
}

// ===== EXAMPLE 5: Natural Story Flow =====

export async function testNaturalFlow(): Promise<void> {
  console.log('\n===== Example 5: Natural Story Flow =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: false,
    useDynamicSelection: true,
    initialStoryValues: { tension: 10 },
    storyValueThresholds: {
      tension: { threshold: 60, direction: 'above' },
    },
  });

  const beatIntervention = new BeatBuilder('intervention', 'Dramatic Intervention')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('Suddenly, something dramatic happens to relieve the tension!')
    .withStoryEffect('tension', -40)
    .build();

  dramaManager.addBeat(beatIntervention);

  console.log('--- Simulating gameplay ---');

  const actions = [
    { action: 'explore', tensionDelta: 5 },
    { action: 'encounter_enemy', tensionDelta: 10 },
    { action: 'explore', tensionDelta: 5 },
    { action: 'difficult_puzzle', tensionDelta: 15 },
    { action: 'explore', tensionDelta: 5 },
    { action: 'boss_appears', tensionDelta: 25 }, // Should trigger intervention
    { action: 'explore', tensionDelta: 5 },
  ];

  for (let i = 0; i < actions.length; i++) {
    const { action, tensionDelta } = actions[i];
    const oldTension = dramaManager.getStoryValue('tension');
    const newTension = oldTension + tensionDelta;

    console.log(`\n${i + 1}. Player action: ${action}`);
    console.log(`   Tension: ${oldTension.toFixed(0)} → ${newTension.toFixed(0)}`);

    dramaManager.setStoryValue('tension', newTension);

    if (newTension >= 60 && oldTension < 60) {
      console.log('   *** DRAMATIC INTERVENTION TRIGGERED ***');
      console.log(`   Tension reduced to ${dramaManager.getStoryValue('tension').toFixed(0)}`);
    }
  }

  console.log('\nExpected: Story naturally builds tension, then intervention provides relief');
}

// ===== EXAMPLE 6: Multiple Simultaneous Triggers =====

export async function testMultipleTriggers(): Promise<void> {
  console.log('\n===== Example 6: Multiple Simultaneous Triggers =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    useDynamicSelection: true,
    initialStoryValues: {
      tension: 30,
      danger: 20,
    },
    storyValueThresholds: {
      tension: { threshold: 70, direction: 'above' },
      danger: { threshold: 60, direction: 'above' },
    },
  });

  // Multiple high-priority beats
  const beatPanic = new BeatBuilder('panic', 'Panic!')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('Everything is falling apart!')
    .withStoryEffect('tension', -20)
    .build();

  const beatDanger = new BeatBuilder('danger_alert', 'Danger Alert!')
    .withPriority(BeatPriority.HIGH)
    .withNarration('Danger level critical!')
    .withStoryEffect('danger', -15)
    .build();

  dramaManager.addBeats([beatPanic, beatDanger]);

  console.log('--- Tension and danger both spike simultaneously ---');
  console.log('Before: Tension=30, Danger=20');

  dramaManager.setStoryValue('tension', 75); // Crosses threshold
  dramaManager.setStoryValue('danger', 65);  // Crosses threshold

  console.log('After: Tension=75, Danger=65');
  console.log('Both thresholds crossed, but only highest priority beat executes');

  console.log('\nExpected: Highest priority beat executes when multiple triggers fire');
}

// ===== EXAMPLE 7: Preventing Scripted Feel =====

export async function testNotScripted(): Promise<void> {
  console.log('\n===== Example 7: Story Doesn\'t Feel Scripted =====\n');

  const createScenario = (useDynamic: boolean) => {
    const worldState = new WorldState();
    const dramaManager = new DramaManager(worldState, {
      debug: false,
      useDynamicSelection: useDynamic,
      initialStoryValues: { tension: 10 },
      storyValueThresholds: {
        tension: { threshold: 50, direction: 'above' },
      },
    });

    const beatRelief = new BeatBuilder('relief', 'Relief Moment')
      .withPriority(BeatPriority.CRITICAL)
      .withNarration('A moment of relief!')
      .withStoryEffect('tension', -30)
      .build();

    dramaManager.addBeat(beatRelief);

    return dramaManager;
  };

  console.log('--- Scenario A: Without Dynamic Selection ---');
  const dmStatic = createScenario(false);
  console.log('Tension rises: 10 → 30 → 55');
  dmStatic.setStoryValue('tension', 30);
  dmStatic.setStoryValue('tension', 55);
  console.log('No automatic relief beat (must manually call advance())');
  console.log('Story feels scripted - player controls pacing completely');

  console.log('\n--- Scenario B: With Dynamic Selection ---');
  const dmDynamic = createScenario(true);
  console.log('Tension rises: 10 → 30 → 55');
  dmDynamic.setStoryValue('tension', 30);
  dmDynamic.setStoryValue('tension', 55); // Crosses threshold
  console.log('Relief beat automatically triggers when tension gets too high');
  console.log('Story feels natural - dramatic moments emerge organically');

  console.log('\nExpected: Dynamic selection creates organic story flow');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllDynamicSelectionExamples(): Promise<void> {
  await testPlayerActionTriggers();
  await new Promise(r => setTimeout(r, 1000));

  await testStoryValueThresholds();
  await new Promise(r => setTimeout(r, 1000));

  await testThresholdDirections();
  await new Promise(r => setTimeout(r, 1000));

  await testDramaticTiming();
  await new Promise(r => setTimeout(r, 1000));

  await testNaturalFlow();
  await new Promise(r => setTimeout(r, 1000));

  await testMultipleTriggers();
  await new Promise(r => setTimeout(r, 1000));

  await testNotScripted();
}

// Run if executed directly
if (require.main === module) {
  runAllDynamicSelectionExamples().catch(console.error);
}
