/**
 * StoryValueExamples - FACADE 4.2
 *
 * Examples demonstrating story value tracking.
 *
 * Story values track emotional and dramatic state:
 * - Tension, Affinity, Urgency, Mystery, etc.
 * - Range from 0-100
 * - Modified by beats and player actions
 * - Guide narrative progression
 */

import { WorldState } from '../../abl/WorldState';
import { DramaManager } from '../DramaManager';
import { BeatBuilder, BeatPriority } from '../Beat';
import {
  StoryValuesManager,
  STANDARD_STORY_VALUES,
  createActionEffects,
  StoryValueType,
} from '../StoryValues';

// ===== EXAMPLE 1: Basic Story Value Tracking =====

export async function testBasicStoryValues(): Promise<void> {
  console.log('\n===== Example 1: Basic Story Value Tracking =====\n');

  const storyValues = new StoryValuesManager();

  console.log('--- Initial Values ---');
  console.log(storyValues.getAllValues());

  console.log('\n--- Modify Values ---');
  storyValues.modifyValue('tension', 25, 'danger appears');
  storyValues.modifyValue('affinity', 10, 'helped NPC');
  storyValues.modifyValue('mystery', 15, 'discovered clue');

  console.log('\n--- Current Values ---');
  console.log(storyValues.getAllValues());

  console.log('\n--- Recent Changes ---');
  const changes = storyValues.getRecentChanges(3);
  changes.forEach(change => {
    console.log(`  ${change.key}: ${change.oldValue} → ${change.newValue} (${change.reason})`);
  });

  console.log('\nExpected: Values increased, changes tracked');
}

// ===== EXAMPLE 2: Player Actions Modify Story Values =====

export async function testPlayerActions(): Promise<void> {
  console.log('\n===== Example 2: Player Actions Modify Story Values =====\n');

  const storyValues = new StoryValuesManager();

  console.log('--- Initial State ---');
  console.log(`Affinity: ${storyValues.getValue('affinity')}`);
  console.log(`Tension: ${storyValues.getValue('tension')}`);
  console.log(`Morality: ${storyValues.getValue('morality')}`);

  console.log('\n--- Player helps NPC ---');
  const helpEffects = createActionEffects('help');
  for (const effect of helpEffects) {
    storyValues.modifyValue(effect.key, effect.delta, effect.reason);
  }

  console.log('\n--- Current State ---');
  console.log(`Affinity: ${storyValues.getValue('affinity')} (increased)`);
  console.log(`Tension: ${storyValues.getValue('tension')} (decreased)`);
  console.log(`Morality: ${storyValues.getValue('morality')} (increased)`);

  console.log('\n--- Player threatens NPC ---');
  const threatenEffects = createActionEffects('threaten');
  for (const effect of threatenEffects) {
    storyValues.modifyValue(effect.key, effect.delta, effect.reason);
  }

  console.log('\n--- Final State ---');
  console.log(`Affinity: ${storyValues.getValue('affinity')} (decreased)`);
  console.log(`Tension: ${storyValues.getValue('tension')} (increased)`);
  console.log(`Morality: ${storyValues.getValue('morality')} (decreased)`);

  console.log('\nExpected: Values change based on player actions');
}

// ===== EXAMPLE 3: Beats Modify Story Values =====

export async function testBeatsModifyValues(): Promise<void> {
  console.log('\n===== Example 3: Beats Modify Story Values =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      tension: 10,
      mystery: 20,
      urgency: 0,
    },
  });

  // Beat 1: Mysterious noise (increases mystery and tension)
  const beatNoise = new BeatBuilder('hear_noise', 'Hear Mysterious Noise')
    .withPriority(BeatPriority.NORMAL)
    .withStoryEffect('mystery', 15)
    .withStoryEffect('tension', 10)
    .withNarration('You hear strange scratching sounds from behind the wall.')
    .build();

  // Beat 2: Deadline announced (increases urgency)
  const beatDeadline = new BeatBuilder('deadline', 'Deadline Announced')
    .withPriority(BeatPriority.HIGH)
    .withStoryEffect('urgency', 40)
    .withStoryEffect('tension', 20)
    .withNarration('You have only one hour before the ritual begins!')
    .build();

  // Beat 3: Clue found (increases mystery, decreases tension)
  const beatClue = new BeatBuilder('find_clue', 'Find Important Clue')
    .withPriority(BeatPriority.NORMAL)
    .withStoryEffect('mystery', 10)
    .withStoryEffect('tension', -15)
    .withNarration('You discover a hidden passage. Things are starting to make sense.')
    .build();

  dramaManager.addBeats([beatNoise, beatDeadline, beatClue]);

  console.log('--- Initial Story Values ---');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Execute Beat 1: Hear Noise ---');
  dramaManager.executeBeat('hear_noise');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Execute Beat 2: Deadline ---');
  dramaManager.executeBeat('deadline');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Execute Beat 3: Find Clue ---');
  dramaManager.executeBeat('find_clue');
  console.log(dramaManager.getAllStoryValues());

  console.log('\nExpected: Story values change with each beat');
}

// ===== EXAMPLE 4: Value Clamping =====

export async function testValueClamping(): Promise<void> {
  console.log('\n===== Example 4: Value Clamping (0-100) =====\n');

  const storyValues = new StoryValuesManager();

  console.log('--- Set tension to 90 ---');
  storyValues.setValue('tension', 90, 'high danger');
  console.log(`Tension: ${storyValues.getValue('tension')}`);

  console.log('\n--- Try to increase by 50 (would be 140) ---');
  storyValues.modifyValue('tension', 50, 'extreme danger');
  console.log(`Tension: ${storyValues.getValue('tension')} (clamped to 100)`);

  console.log('\n--- Set affinity to 10 ---');
  storyValues.setValue('affinity', 10, 'low relationship');
  console.log(`Affinity: ${storyValues.getValue('affinity')}`);

  console.log('\n--- Try to decrease by 50 (would be -40) ---');
  storyValues.modifyValue('affinity', -50, 'betrayal');
  console.log(`Affinity: ${storyValues.getValue('affinity')} (clamped to 0)`);

  console.log('\nExpected: Values clamped to 0-100 range');
}

// ===== EXAMPLE 5: Value Trends =====

export async function testValueTrends(): Promise<void> {
  console.log('\n===== Example 5: Value Trends =====\n');

  const storyValues = new StoryValuesManager();

  console.log('--- Steadily increase tension ---');
  for (let i = 0; i < 5; i++) {
    storyValues.modifyValue('tension', 10, `danger level ${i + 1}`);
    await new Promise(r => setTimeout(r, 100));
  }

  const tensionTrend = storyValues.getTrend('tension');
  console.log(`Tension trend: ${tensionTrend}`);

  console.log('\n--- Steadily decrease affinity ---');
  for (let i = 0; i < 5; i++) {
    storyValues.modifyValue('affinity', -5, `conflict ${i + 1}`);
    await new Promise(r => setTimeout(r, 100));
  }

  const affinityTrend = storyValues.getTrend('affinity');
  console.log(`Affinity trend: ${affinityTrend}`);

  console.log('\n--- Mystery stays stable ---');
  const mysteryTrend = storyValues.getTrend('mystery');
  console.log(`Mystery trend: ${mysteryTrend}`);

  console.log('\nExpected: Tension increasing, affinity decreasing, mystery stable');
}

// ===== EXAMPLE 6: Emotional Journey =====

export async function testEmotionalJourney(): Promise<void> {
  console.log('\n===== Example 6: Emotional Journey =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: false,
    initialStoryValues: {
      tension: 10,
      affinity: 30,
      romance: 0,
      humor: 40,
    },
  });

  // Act 1: Meet NPC (low tension, building affinity)
  const beatMeet = new BeatBuilder('meet_npc', 'Meet Love Interest')
    .withPriority(BeatPriority.NORMAL)
    .withStoryEffect('affinity', 15)
    .withStoryEffect('romance', 10)
    .withNarration('Your eyes meet across the crowded tavern.')
    .build();

  // Act 2: Share a laugh (humor increases, tension decreases)
  const beatLaugh = new BeatBuilder('share_laugh', 'Share a Laugh')
    .withPriority(BeatPriority.NORMAL)
    .withStoryEffect('humor', 20)
    .withStoryEffect('affinity', 10)
    .withStoryEffect('romance', 15)
    .withStoryEffect('tension', -5)
    .withNarration('You share jokes and laughter over drinks.')
    .build();

  // Act 3: Danger arrives (tension spikes)
  const beatDanger = new BeatBuilder('danger_arrives', 'Danger Interrupts')
    .withPriority(BeatPriority.CRITICAL)
    .withStoryEffect('tension', 50)
    .withStoryEffect('humor', -20)
    .withNarration('Armed guards burst through the door, searching for someone!')
    .build();

  // Act 4: Protect love interest (romance and affinity increase)
  const beatProtect = new BeatBuilder('protect', 'Protect Them')
    .withPriority(BeatPriority.HIGH)
    .withStoryEffect('romance', 25)
    .withStoryEffect('affinity', 20)
    .withStoryEffect('tension', -10)
    .withNarration('You shield them from harm. They look at you with new eyes.')
    .build();

  dramaManager.addBeats([beatMeet, beatLaugh, beatDanger, beatProtect]);

  console.log('--- Act 1: Meeting ---');
  dramaManager.executeBeat('meet_npc');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Act 2: Bonding ---');
  dramaManager.executeBeat('share_laugh');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Act 3: Danger! ---');
  dramaManager.executeBeat('danger_arrives');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Act 4: Heroism ---');
  dramaManager.executeBeat('protect');
  console.log(dramaManager.getAllStoryValues());

  console.log('\nExpected: Romance arc with tension spike and resolution');
}

// ===== EXAMPLE 7: Story Value Summary =====

export async function testStoryValueSummary(): Promise<void> {
  console.log('\n===== Example 7: Story Value Summary =====\n');

  const storyValues = new StoryValuesManager();

  // Simulate a story progression
  storyValues.modifyValue('tension', 35, 'conflict escalates');
  storyValues.modifyValue('affinity', 20, 'friendship grows');
  storyValues.modifyValue('mystery', 40, 'secrets revealed');
  storyValues.modifyValue('urgency', 60, 'deadline approaches');
  storyValues.modifyValue('competence', 25, 'player gains skills');

  console.log(storyValues.getSummary());

  console.log('\nExpected: Visual summary of all story values with bars and trends');
}

// ===== EXAMPLE 8: Categories =====

export async function testStoryValueCategories(): Promise<void> {
  console.log('\n===== Example 8: Story Value Categories =====\n');

  const storyValues = new StoryValuesManager();

  storyValues.modifyValue('tension', 30, 'danger');
  storyValues.modifyValue('romance', 40, 'flirting');
  storyValues.modifyValue('humor', 20, 'joke');
  storyValues.modifyValue('affinity', 25, 'friendship');
  storyValues.modifyValue('morality', 15, 'good deed');

  console.log('--- Emotional Values ---');
  console.log(storyValues.getValuesByCategory('emotional'));

  console.log('\n--- Relational Values ---');
  console.log(storyValues.getValuesByCategory('relational'));

  console.log('\n--- Character Values ---');
  console.log(storyValues.getValuesByCategory('character'));

  console.log('\n--- Narrative Values ---');
  console.log(storyValues.getValuesByCategory('narrative'));

  console.log('\nExpected: Values organized by category');
}

// ===== EXAMPLE 9: Complex Action Sequences =====

export async function testComplexActionSequence(): Promise<void> {
  console.log('\n===== Example 9: Complex Action Sequence =====\n');

  const storyValues = new StoryValuesManager();

  console.log('Initial State:');
  console.log(`  Affinity: ${storyValues.getValue('affinity')}`);
  console.log(`  Tension: ${storyValues.getValue('tension')}`);
  console.log(`  Morality: ${storyValues.getValue('morality')}`);

  console.log('\n--- Sequence of Actions ---');

  console.log('\n1. Player jokes with NPC');
  createActionEffects('joke').forEach(e => storyValues.modifyValue(e.key, e.delta, e.reason));

  console.log('2. Player flirts with NPC');
  createActionEffects('flirt').forEach(e => storyValues.modifyValue(e.key, e.delta, e.reason));

  console.log('3. Player helps NPC');
  createActionEffects('help').forEach(e => storyValues.modifyValue(e.key, e.delta, e.reason));

  console.log('4. Player threatens NPC (oops!)');
  createActionEffects('threaten').forEach(e => storyValues.modifyValue(e.key, e.delta, e.reason));

  console.log('5. Player tries to help again');
  createActionEffects('help').forEach(e => storyValues.modifyValue(e.key, e.delta, e.reason));

  console.log('\nFinal State:');
  console.log(`  Affinity: ${storyValues.getValue('affinity')}`);
  console.log(`  Tension: ${storyValues.getValue('tension')}`);
  console.log(`  Morality: ${storyValues.getValue('morality')}`);
  console.log(`  Romance: ${storyValues.getValue('romance')}`);
  console.log(`  Humor: ${storyValues.getValue('humor')}`);

  console.log('\nExpected: Complex value changes from action sequence');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllStoryValueExamples(): Promise<void> {
  await testBasicStoryValues();
  await new Promise(r => setTimeout(r, 1000));

  await testPlayerActions();
  await new Promise(r => setTimeout(r, 1000));

  await testBeatsModifyValues();
  await new Promise(r => setTimeout(r, 1000));

  await testValueClamping();
  await new Promise(r => setTimeout(r, 1000));

  await testValueTrends();
  await new Promise(r => setTimeout(r, 1000));

  await testEmotionalJourney();
  await new Promise(r => setTimeout(r, 1000));

  await testStoryValueSummary();
  await new Promise(r => setTimeout(r, 1000));

  await testStoryValueCategories();
  await new Promise(r => setTimeout(r, 1000));

  await testComplexActionSequence();
}

// Run if executed directly
if (require.main === module) {
  runAllStoryValueExamples().catch(console.error);
}
