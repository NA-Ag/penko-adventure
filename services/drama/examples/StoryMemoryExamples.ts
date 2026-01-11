/**
 * StoryMemoryExamples - FACADE 4.9
 *
 * Examples demonstrating story memory and timeline tracking.
 *
 * Story Memory enables:
 * - Tracking which beats have fired and when
 * - Recording beat outcomes (success/failure/partial)
 * - NPCs referencing past events in dialogue
 * - Reflection on past story moments
 * - Maintaining a coherent narrative timeline
 * - Querying story history
 *
 * This creates:
 * - NPCs that remember what happened
 * - Callbacks to earlier story moments
 * - Consequence tracking across long time spans
 * - Rich, reactive dialogue based on history
 */

import { WorldState } from '../../abl/WorldState';
import { DramaManager } from '../DramaManager';
import { BeatBuilder, BeatPriority, BeatOutcome } from '../Beat';
import { StoryMemory, StoryMemoryManager } from '../StoryMemory';

// ===== EXAMPLE 1: Basic Story Memory Tracking =====

export async function testBasicMemoryTracking(): Promise<void> {
  console.log('\n===== Example 1: Basic Story Memory Tracking =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: false,
    initialStoryValues: { tension: 10 },
  });

  // Create some beats
  const beat1 = new BeatBuilder('meet_merchant', 'Meet the Merchant')
    .withDescription('First encounter with the merchant')
    .withPriority(BeatPriority.NORMAL)
    .withCategory('introduction')
    .withStoryEffect('reputation', 5)
    .build();

  const beat2 = new BeatBuilder('negotiate_trade', 'Negotiate Trade')
    .withDescription('Negotiate a trade deal')
    .withPriority(BeatPriority.NORMAL)
    .withCategory('commerce')
    .withStoryEffect('wealth', 50)
    .build();

  const beat3 = new BeatBuilder('defend_merchant', 'Defend the Merchant')
    .withDescription('Protect the merchant from bandits')
    .withPriority(BeatPriority.HIGH)
    .withCategory('combat')
    .withStoryEffect('reputation', 20)
    .withStoryEffect('tension', 30)
    .build();

  dramaManager.addBeats([beat1, beat2, beat3]);

  // Execute beats
  console.log('--- Executing story beats ---');
  dramaManager.executeBeatWithOutcome('meet_merchant', BeatOutcome.SUCCESS);
  await new Promise(r => setTimeout(r, 100));

  dramaManager.executeBeatWithOutcome('negotiate_trade', BeatOutcome.SUCCESS);
  await new Promise(r => setTimeout(r, 100));

  dramaManager.executeBeatWithOutcome('defend_merchant', BeatOutcome.SUCCESS);

  // Access story memory
  const memory = dramaManager.getStoryMemory();

  console.log('\n--- Story Memory Contents ---');
  console.log(`Total events: ${memory.getAllEvents().length}`);
  console.log(`Beat "meet_merchant" fired? ${memory.hasBeatFired('meet_merchant')}`);
  console.log(`Beat "defeat_dragon" fired? ${memory.hasBeatFired('defeat_dragon')}`);

  console.log('\n--- Timeline ---');
  console.log(memory.getTimelineSummary());

  console.log('\nExpected: All beats tracked in memory with timestamps');
}

// ===== EXAMPLE 2: Querying Story History =====

export async function testQueryingHistory(): Promise<void> {
  console.log('\n===== Example 2: Querying Story History =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, { debug: false });

  // Create diverse beats
  const beats = [
    new BeatBuilder('quest1_start', 'Quest 1 Start')
      .withPriority(BeatPriority.NORMAL)
      .withCategory('quest')
      .build(),

    new BeatBuilder('quest1_complete', 'Quest 1 Complete')
      .withPriority(BeatPriority.NORMAL)
      .withCategory('quest')
      .build(),

    new BeatBuilder('combat1', 'First Combat')
      .withPriority(BeatPriority.HIGH)
      .withCategory('combat')
      .build(),

    new BeatBuilder('dialogue1', 'Casual Chat')
      .withPriority(BeatPriority.LOW)
      .withCategory('dialogue')
      .build(),
  ];

  dramaManager.addBeats(beats);

  // Execute with different outcomes
  dramaManager.executeBeatWithOutcome('quest1_start', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('combat1', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('dialogue1', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('quest1_complete', BeatOutcome.SUCCESS);

  const memory = dramaManager.getStoryMemory();

  console.log('--- Query: All quest-related events ---');
  const questEvents = memory.query({ tag: 'quest' });
  console.log(`Found ${questEvents.length} quest events:`);
  questEvents.forEach(e => console.log(`  - ${e.beatName} (${e.outcome})`));

  console.log('\n--- Query: All failures ---');
  const failures = memory.query({ outcome: BeatOutcome.FAILURE });
  console.log(`Found ${failures.length} failure(s):`);
  failures.forEach(e => console.log(`  - ${e.beatName}`));

  console.log('\n--- Query: Recent 2 events ---');
  const recent = memory.getRecentEvents(2);
  console.log('Most recent events:');
  recent.forEach(e => console.log(`  - ${e.beatName}`));

  console.log('\nExpected: Can query events by tag, outcome, and recency');
}

// ===== EXAMPLE 3: NPC Dialogue References Past Events =====

export async function testNPCDialogueReferences(): Promise<void> {
  console.log('\n===== Example 3: NPC Dialogue References Past Events =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, { debug: false });

  const beatDefeatDragon = new BeatBuilder('defeat_dragon', 'Defeat the Dragon')
    .withDescription('Slay the mighty dragon')
    .withPriority(BeatPriority.CRITICAL)
    .withCategory('legendary')
    .build();

  const beatSaveVillage = new BeatBuilder('save_village', 'Save the Village')
    .withDescription('Rescue villagers from bandits')
    .withPriority(BeatPriority.HIGH)
    .withCategory('heroic')
    .build();

  dramaManager.addBeats([beatDefeatDragon, beatSaveVillage]);

  console.log('--- Player defeats the dragon ---');
  dramaManager.executeBeatWithOutcome('defeat_dragon', BeatOutcome.SUCCESS);

  console.log('\n--- Later: NPC wants to reference this event ---');
  const memory = dramaManager.getStoryMemory();
  const memoryManager = new StoryMemoryManager();
  memoryManager.getMemory().import(memory.export());

  if (memory.didPlayerSucceed('defeat_dragon')) {
    const dialogue = memoryManager.generateRememberWhenDialogue('defeat_dragon');
    console.log(`NPC: "${dialogue}"`);
  }

  console.log('\n--- Player fails to save village ---');
  dramaManager.executeBeatWithOutcome('save_village', BeatOutcome.FAILURE);

  if (memory.didPlayerFail('save_village')) {
    console.log('NPC: "I know you tried your best to save the village, even if it didn\'t work out."');
  }

  console.log('\n--- Check if player has heroic history ---');
  const heroicDeeds = memory.query({ tag: 'heroic' });
  const legendaryDeeds = memory.query({ tag: 'legendary' });

  if (legendaryDeeds.length > 0) {
    console.log('NPC: "Word of your legendary deeds has spread far and wide!"');
  }

  console.log('\nExpected: NPCs reference past successes and failures naturally');
}

// ===== EXAMPLE 4: Beat Outcome Tracking =====

export async function testBeatOutcomeTracking(): Promise<void> {
  console.log('\n===== Example 4: Beat Outcome Tracking =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, { debug: false });

  const beatChallenge = new BeatBuilder('difficult_challenge', 'Difficult Challenge')
    .withDescription('A very hard task')
    .withPriority(BeatPriority.HIGH)
    .repeatable(true)
    .build();

  dramaManager.addBeat(beatChallenge);

  console.log('--- Player attempts challenge multiple times ---');
  dramaManager.executeBeatWithOutcome('difficult_challenge', BeatOutcome.FAILURE);
  console.log('Attempt 1: FAILURE');

  await new Promise(r => setTimeout(r, 100));
  dramaManager.executeBeatWithOutcome('difficult_challenge', BeatOutcome.FAILURE);
  console.log('Attempt 2: FAILURE');

  await new Promise(r => setTimeout(r, 100));
  dramaManager.executeBeatWithOutcome('difficult_challenge', BeatOutcome.PARTIAL);
  console.log('Attempt 3: PARTIAL');

  await new Promise(r => setTimeout(r, 100));
  dramaManager.executeBeatWithOutcome('difficult_challenge', BeatOutcome.SUCCESS);
  console.log('Attempt 4: SUCCESS');

  const memory = dramaManager.getStoryMemory();

  console.log('\n--- Beat History ---');
  const history = memory.getBeatHistory('difficult_challenge');
  console.log(`Total attempts: ${history.length}`);
  console.log('Outcomes:', history.map(h => h.outcome).join(' → '));

  console.log('\n--- Most Recent Outcome ---');
  const outcome = memory.getBeatOutcome('difficult_challenge');
  console.log(`Last outcome: ${outcome}`);

  console.log('\n--- Success Rate ---');
  const successRate = memory.getBeatSuccessRate('difficult_challenge');
  console.log(`Success rate: ${(successRate * 100).toFixed(0)}%`);

  console.log('\n--- Execution Count ---');
  const count = memory.getBeatExecutionCount('difficult_challenge');
  console.log(`Executed ${count} times`);

  console.log('\nExpected: Complete history of all attempts with outcomes');
}

// ===== EXAMPLE 5: Story Statistics =====

export async function testStoryStatistics(): Promise<void> {
  console.log('\n===== Example 5: Story Statistics =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, { debug: false });

  const beats = [
    new BeatBuilder('beat1', 'Beat 1').withPriority(BeatPriority.NORMAL).build(),
    new BeatBuilder('beat2', 'Beat 2').withPriority(BeatPriority.NORMAL).build(),
    new BeatBuilder('beat3', 'Beat 3').withPriority(BeatPriority.NORMAL).build(),
    new BeatBuilder('beat4', 'Beat 4').withPriority(BeatPriority.NORMAL).build(),
    new BeatBuilder('beat5', 'Beat 5').withPriority(BeatPriority.NORMAL).build(),
  ];

  dramaManager.addBeats(beats);

  // Execute with mixed outcomes
  dramaManager.executeBeatWithOutcome('beat1', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('beat2', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('beat3', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('beat4', BeatOutcome.PARTIAL);
  dramaManager.executeBeatWithOutcome('beat5', BeatOutcome.SUCCESS);

  const memory = dramaManager.getStoryMemory();
  const stats = memory.getStats();

  console.log('--- Story Statistics ---');
  console.log(`Total events: ${stats.totalEvents}`);
  console.log(`Successes: ${stats.successCount}`);
  console.log(`Failures: ${stats.failureCount}`);
  console.log(`Partial: ${stats.partialCount}`);
  console.log(`Unique beats: ${stats.uniqueBeats}`);
  console.log(`Story duration: ${stats.duration}ms`);

  const overallSuccessRate = stats.successCount / stats.totalEvents;
  console.log(`\nOverall success rate: ${(overallSuccessRate * 100).toFixed(0)}%`);

  console.log('\nExpected: Comprehensive statistics about the story so far');
}

// ===== EXAMPLE 6: Narrative Summary Generation =====

export async function testNarrativeSummary(): Promise<void> {
  console.log('\n===== Example 6: Narrative Summary Generation =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: false,
    initialStoryValues: { tension: 20 },
  });

  const beats = [
    new BeatBuilder('begin_journey', 'Begin the Journey')
      .withDescription('Set out on your quest')
      .withPriority(BeatPriority.NORMAL)
      .withStoryEffect('tension', 10)
      .build(),

    new BeatBuilder('meet_ally', 'Meet Your Ally')
      .withDescription('Find a trustworthy companion')
      .withPriority(BeatPriority.NORMAL)
      .withStoryEffect('tension', -5)
      .build(),

    new BeatBuilder('face_betrayal', 'Face Betrayal')
      .withDescription('Your ally betrays you!')
      .withPriority(BeatPriority.CRITICAL)
      .withStoryEffect('tension', 60)
      .build(),
  ];

  dramaManager.addBeats(beats);

  console.log('--- Story Progression ---');
  dramaManager.executeBeatWithOutcome('begin_journey', BeatOutcome.SUCCESS);
  console.log('Chapter 1: Journey begins');

  await new Promise(r => setTimeout(r, 100));
  dramaManager.executeBeatWithOutcome('meet_ally', BeatOutcome.SUCCESS);
  console.log('Chapter 2: Ally found');

  await new Promise(r => setTimeout(r, 100));
  dramaManager.executeBeatWithOutcome('face_betrayal', BeatOutcome.SUCCESS);
  console.log('Chapter 3: BETRAYAL!');

  const memory = dramaManager.getStoryMemory();

  console.log('\n--- Narrative Summary ---');
  console.log(memory.generateNarrativeSummary());

  console.log('\n--- Timeline ---');
  console.log(memory.getTimelineSummary());

  console.log('\nExpected: Human-readable narrative summary of the story');
}

// ===== EXAMPLE 7: Story Arc Analysis =====

export async function testStoryArcAnalysis(): Promise<void> {
  console.log('\n===== Example 7: Story Arc Analysis =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: false,
    initialStoryValues: { tension: 20 },
  });

  const beats = [
    new BeatBuilder('act1_setup', 'Act 1: Setup')
      .withPriority(BeatPriority.NORMAL)
      .withStoryEffect('tension', 10)
      .build(),

    new BeatBuilder('act2_rising', 'Act 2: Rising Action')
      .withPriority(BeatPriority.HIGH)
      .withStoryEffect('tension', 30)
      .build(),

    new BeatBuilder('act3_climax', 'Act 3: Climax!')
      .withPriority(BeatPriority.CRITICAL)
      .withStoryEffect('tension', 40)
      .build(),

    new BeatBuilder('act4_resolution', 'Act 4: Resolution')
      .withPriority(BeatPriority.NORMAL)
      .withStoryEffect('tension', -60)
      .build(),
  ];

  dramaManager.addBeats(beats);

  // Execute story
  dramaManager.executeBeatWithOutcome('act1_setup', BeatOutcome.SUCCESS);
  await new Promise(r => setTimeout(r, 50));

  dramaManager.executeBeatWithOutcome('act2_rising', BeatOutcome.SUCCESS);
  await new Promise(r => setTimeout(r, 50));

  dramaManager.executeBeatWithOutcome('act3_climax', BeatOutcome.SUCCESS);
  await new Promise(r => setTimeout(r, 50));

  dramaManager.executeBeatWithOutcome('act4_resolution', BeatOutcome.SUCCESS);

  const memory = dramaManager.getStoryMemory();

  console.log('--- Story Arc (Tension Over Time) ---');
  const arc = memory.getStoryArc();
  arc.forEach((point, i) => {
    const time = (point.time / 1000).toFixed(1);
    const tension = point.tension.toFixed(0);
    console.log(`[+${time}s] Tension: ${tension}`);
  });

  console.log('\n--- Find Climax (Highest Tension) ---');
  const climax = memory.findClimax();
  if (climax) {
    console.log(`Climax: "${climax.beatName}"`);
    console.log(`Tension at climax: ${climax.storyValueSnapshot.tension}`);
  }

  console.log('\n--- Find Turning Points ---');
  const turningPoints = memory.getTurningPoints();
  console.log(`Found ${turningPoints.length} turning point(s)`);
  turningPoints.forEach(tp => {
    console.log(`  - ${tp.beatName} (${tp.outcome})`);
  });

  console.log('\nExpected: Can analyze the emotional arc of the story');
}

// ===== EXAMPLE 8: Time-Based Queries =====

export async function testTimeBasedQueries(): Promise<void> {
  console.log('\n===== Example 8: Time-Based Queries =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, { debug: false });

  const beats = [
    new BeatBuilder('event1', 'Event 1').withPriority(BeatPriority.NORMAL).build(),
    new BeatBuilder('event2', 'Event 2').withPriority(BeatPriority.NORMAL).build(),
    new BeatBuilder('event3', 'Event 3').withPriority(BeatPriority.NORMAL).build(),
  ];

  dramaManager.addBeats(beats);

  const startTime = Date.now();

  dramaManager.executeBeatWithOutcome('event1', BeatOutcome.SUCCESS);
  await new Promise(r => setTimeout(r, 100));

  const midTime = Date.now();

  dramaManager.executeBeatWithOutcome('event2', BeatOutcome.SUCCESS);
  await new Promise(r => setTimeout(r, 100));

  dramaManager.executeBeatWithOutcome('event3', BeatOutcome.SUCCESS);
  const endTime = Date.now();

  const memory = dramaManager.getStoryMemory();

  console.log('--- Time Since Beat Fired ---');
  const timeSince1 = memory.getTimeSinceBeat('event1');
  console.log(`Time since event1: ${timeSince1}ms`);

  console.log('\n--- Events in Time Window ---');
  const earlyEvents = memory.getEventsInWindow(startTime, midTime);
  console.log(`Events before midpoint: ${earlyEvents.map(e => e.beatName).join(', ')}`);

  const lateEvents = memory.getEventsInWindow(midTime, endTime);
  console.log(`Events after midpoint: ${lateEvents.map(e => e.beatName).join(', ')}`);

  console.log('\n--- Recent Events ---');
  const recent = memory.getRecentEvents(2);
  console.log(`Last 2 events: ${recent.map(e => e.beatName).join(', ')}`);

  console.log('\nExpected: Can query events based on time windows');
}

// ===== EXAMPLE 9: Sequence Detection =====

export async function testSequenceDetection(): Promise<void> {
  console.log('\n===== Example 9: Sequence Detection =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, { debug: false });

  const beats = [
    new BeatBuilder('steal_item', 'Steal Item').withPriority(BeatPriority.NORMAL).build(),
    new BeatBuilder('get_caught', 'Get Caught').withPriority(BeatPriority.HIGH).build(),
    new BeatBuilder('escape_guards', 'Escape Guards').withPriority(BeatPriority.HIGH).build(),
  ];

  dramaManager.addBeats(beats);

  // Execute sequence
  dramaManager.executeBeatWithOutcome('steal_item', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('get_caught', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('escape_guards', BeatOutcome.SUCCESS);

  const memory = dramaManager.getStoryMemory();

  console.log('--- Check Sequences ---');

  const sequence1 = memory.didBeatsOccurInSequence('steal_item', 'get_caught');
  console.log(`"steal_item" followed by "get_caught"? ${sequence1}`);

  const sequence2 = memory.didBeatsOccurInSequence('get_caught', 'escape_guards');
  console.log(`"get_caught" followed by "escape_guards"? ${sequence2}`);

  const sequence3 = memory.didBeatsOccurInSequence('steal_item', 'escape_guards');
  console.log(`"steal_item" followed by "escape_guards"? ${sequence3} (not consecutive)`);

  if (sequence1 && sequence2) {
    console.log('\nNPC: "So you stole something, got caught, then escaped? You\'re quite the troublemaker!"');
  }

  console.log('\nExpected: Can detect if beats occurred in specific sequence');
}

// ===== EXAMPLE 10: Export/Import for Save Files =====

export async function testExportImport(): Promise<void> {
  console.log('\n===== Example 10: Export/Import for Save Files =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, { debug: false });

  const beats = [
    new BeatBuilder('progress1', 'Progress 1').withPriority(BeatPriority.NORMAL).build(),
    new BeatBuilder('progress2', 'Progress 2').withPriority(BeatPriority.NORMAL).build(),
  ];

  dramaManager.addBeats(beats);

  console.log('--- Original Playthrough ---');
  dramaManager.executeBeatWithOutcome('progress1', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('progress2', BeatOutcome.SUCCESS);

  const memory1 = dramaManager.getStoryMemory();
  console.log(`Events recorded: ${memory1.getAllEvents().length}`);

  console.log('\n--- Export Memory ---');
  const saveData = memory1.export();
  const saveString = JSON.stringify(saveData);
  console.log(`Save data size: ${saveString.length} characters`);

  console.log('\n--- Create New Session ---');
  const worldState2 = new WorldState();
  const dramaManager2 = new DramaManager(worldState2, { debug: false });
  const memory2 = dramaManager2.getStoryMemory();
  console.log(`New session events: ${memory2.getAllEvents().length}`);

  console.log('\n--- Import Memory ---');
  memory2.import(JSON.parse(saveString));
  console.log(`After import events: ${memory2.getAllEvents().length}`);

  console.log('\n--- Verify Import ---');
  console.log(`Beat "progress1" fired? ${memory2.hasBeatFired('progress1')}`);
  console.log(`Beat "progress2" fired? ${memory2.hasBeatFired('progress2')}`);

  console.log('\nExpected: Memory persists across sessions via export/import');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllStoryMemoryExamples(): Promise<void> {
  await testBasicMemoryTracking();
  await new Promise(r => setTimeout(r, 1000));

  await testQueryingHistory();
  await new Promise(r => setTimeout(r, 1000));

  await testNPCDialogueReferences();
  await new Promise(r => setTimeout(r, 1000));

  await testBeatOutcomeTracking();
  await new Promise(r => setTimeout(r, 1000));

  await testStoryStatistics();
  await new Promise(r => setTimeout(r, 1000));

  await testNarrativeSummary();
  await new Promise(r => setTimeout(r, 1000));

  await testStoryArcAnalysis();
  await new Promise(r => setTimeout(r, 1000));

  await testTimeBasedQueries();
  await new Promise(r => setTimeout(r, 1000));

  await testSequenceDetection();
  await new Promise(r => setTimeout(r, 1000));

  await testExportImport();
}

// Run if executed directly
if (require.main === module) {
  runAllStoryMemoryExamples().catch(console.error);
}
