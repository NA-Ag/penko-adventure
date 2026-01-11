/**
 * TemporalMemoryExamples - FACADE 5.3
 *
 * Examples demonstrating temporal queries and WME expiration.
 *
 * Temporal Memory enables:
 * - Time-based queries ("what was true 5 minutes ago?")
 * - Transient facts with automatic expiration
 * - Historical snapshots
 * - Fresh/stale checks
 * - Automatic cleanup of old facts
 *
 * Use cases:
 * - Short-term memory (recent events, perceptions)
 * - Time-sensitive behaviors
 * - Temporary buffs/debuffs
 * - Fading memories
 */

import { LocationWME, StateWME, EventWME, SensoryWME } from '../WME';
import {
  TemporalWorkingMemory,
  TransientWME,
  TemporalHelpers,
} from '../TemporalMemory';

// ===== EXAMPLE 1: Basic Timestamp Tracking =====

export async function testBasicTimestamps(): Promise<void> {
  console.log('\n===== Example 1: Basic Timestamp Tracking =====\n');

  const wm = new TemporalWorkingMemory(false, 0); // No auto-expiration for this example

  console.log('--- Create WMEs at different times ---');
  const wme1 = new LocationWME('player', 'plaza');
  wm.assert(wme1);
  console.log(`WME1 created at: ${new Date(wme1.createdAt).toLocaleTimeString()}`);

  await new Promise(r => setTimeout(r, 100));

  const wme2 = new LocationWME('player', 'market');
  wm.assert(wme2);
  console.log(`WME2 created at: ${new Date(wme2.createdAt).toLocaleTimeString()}`);

  console.log('\n--- Timestamps are tracked ---');
  console.log(`WME1 age: ${wm.getAge(wme1)}ms`);
  console.log(`WME2 age: ${wm.getAge(wme2)}ms`);
  console.log(`WME1 is older: ${wme1.createdAt < wme2.createdAt}`);

  console.log('\n--- Modify WME ---');
  wm.modify(wme1, { location: 'tavern' });
  console.log(`WME1 modified at: ${new Date(wme1.modifiedAt).toLocaleTimeString()}`);
  console.log(`Time since modified: ${wm.getTimeSinceModified(wme1)}ms`);

  console.log('\nExpected: All WMEs have creation and modification timestamps');

  wm.destroy();
}

// ===== EXAMPLE 2: Transient WMEs with Expiration =====

export async function testTransientWMEs(): Promise<void> {
  console.log('\n===== Example 2: Transient WMEs with Expiration =====\n');

  const wm = new TemporalWorkingMemory(false, 0);

  console.log('--- Create transient WME (expires in 200ms) ---');
  const tempWME = new TransientWME('TempBuff', { buff: 'speed_boost' }, 200);
  wm.assertTransient(tempWME);

  console.log(`Created: ${tempWME.toString()}`);
  console.log(`Expires at: ${new Date(tempWME.expiresAt).toLocaleTimeString()}`);
  console.log(`Remaining lifetime: ${tempWME.getRemainingLifetime()}ms`);
  console.log(`Is expired? ${tempWME.isExpired()}`);

  console.log('\n--- Wait 100ms ---');
  await new Promise(r => setTimeout(r, 100));
  console.log(`Remaining lifetime: ${tempWME.getRemainingLifetime()}ms`);
  console.log(`Is expired? ${tempWME.isExpired()}`);

  console.log('\n--- Wait another 150ms (past expiration) ---');
  await new Promise(r => setTimeout(r, 150));
  console.log(`Remaining lifetime: ${tempWME.getRemainingLifetime()}ms`);
  console.log(`Is expired? ${tempWME.isExpired()}`);

  console.log('\n--- Manual expiration check ---');
  const removed = wm.checkExpiredWMEs();
  console.log(`Removed ${removed} expired WME(s)`);
  console.log(`WME still in memory? ${wm.has(tempWME)}`);

  console.log('\nExpected: Transient WMEs expire after their lifetime');

  wm.destroy();
}

// ===== EXAMPLE 3: Automatic Expiration =====

export async function testAutomaticExpiration(): Promise<void> {
  console.log('\n===== Example 3: Automatic Expiration =====\n');

  // Auto-check every 50ms
  const wm = new TemporalWorkingMemory(false, 50);

  console.log('--- Create multiple transient WMEs ---');
  wm.assertTemporary('Buff', { type: 'strength' }, 100);
  wm.assertTemporary('Buff', { type: 'defense' }, 200);
  wm.assertTemporary('Buff', { type: 'speed' }, 300);

  console.log(`Total WMEs: ${wm.getAll().length}`);
  console.log(`Transient WMEs: ${wm.getTransientWMEs().length}`);

  console.log('\n--- Wait 150ms (first buff should expire) ---');
  await new Promise(r => setTimeout(r, 150));
  console.log(`Total WMEs: ${wm.getAll().length} (strength buff auto-removed)`);

  console.log('\n--- Wait another 100ms (second buff expires) ---');
  await new Promise(r => setTimeout(r, 100));
  console.log(`Total WMEs: ${wm.getAll().length} (defense buff auto-removed)`);

  console.log('\n--- Wait another 100ms (third buff expires) ---');
  await new Promise(r => setTimeout(r, 100));
  console.log(`Total WMEs: ${wm.getAll().length} (all buffs removed)`);

  console.log('\nExpected: Transient WMEs automatically removed after expiration');

  wm.destroy();
}

// ===== EXAMPLE 4: Temporal Queries =====

export async function testTemporalQueries(): Promise<void> {
  console.log('\n===== Example 4: Temporal Queries =====\n');

  const wm = new TemporalWorkingMemory(false, 0);

  console.log('--- Create WMEs at different times ---');
  wm.assert(new EventWME('player_attacked', 'enemy', 'player'));
  await new Promise(r => setTimeout(r, 50));

  wm.assert(new EventWME('player_healed', 'potion', 'player'));
  await new Promise(r => setTimeout(r, 50));

  wm.assert(new EventWME('enemy_defeated', 'player', 'enemy'));
  await new Promise(r => setTimeout(r, 50));

  console.log('\n--- Query: Events created within last 100ms ---');
  const recent = wm.getRecentlyCreated(100);
  console.log(`Found ${recent.length} recent event(s):`);
  recent.forEach(wme => console.log(`  - ${wme.getAttribute('event')}`));

  console.log('\n--- Query: Events created within last 200ms ---');
  const moreRecent = wm.getRecentlyCreated(200);
  console.log(`Found ${moreRecent.length} event(s):`);
  moreRecent.forEach(wme => console.log(`  - ${wme.getAttribute('event')}`));

  console.log('\n--- Query: All events (any time) ---');
  const all = wm.getAll();
  console.log(`Total events: ${all.length}`);

  console.log('\nExpected: Can query WMEs created within specific time windows');

  wm.destroy();
}

// ===== EXAMPLE 5: Time Range Queries =====

export async function testTimeRangeQueries(): Promise<void> {
  console.log('\n===== Example 5: Time Range Queries =====\n');

  const wm = new TemporalWorkingMemory(false, 0);

  const startTime = Date.now();

  console.log('--- Create events over time ---');
  wm.assert(new EventWME('event1'));
  await new Promise(r => setTimeout(r, 50));

  const midTime = Date.now();

  wm.assert(new EventWME('event2'));
  await new Promise(r => setTimeout(r, 50));

  wm.assert(new EventWME('event3'));
  await new Promise(r => setTimeout(r, 50));

  const endTime = Date.now();

  console.log('\n--- Query: Events created in first half ---');
  const firstHalf = wm.getCreatedBetween(startTime, midTime);
  console.log(`Found ${firstHalf.length} event(s):`);
  firstHalf.forEach(wme => console.log(`  - ${wme.getAttribute('event')}`));

  console.log('\n--- Query: Events created in second half ---');
  const secondHalf = wm.getCreatedBetween(midTime, endTime);
  console.log(`Found ${secondHalf.length} event(s):`);
  secondHalf.forEach(wme => console.log(`  - ${wme.getAttribute('event')}`));

  console.log('\nExpected: Can query WMEs within specific time ranges');

  wm.destroy();
}

// ===== EXAMPLE 6: Fresh and Stale Checks =====

export async function testFreshStaleChecks(): Promise<void> {
  console.log('\n===== Example 6: Fresh and Stale Checks =====\n');

  const wm = new TemporalWorkingMemory(false, 0);

  console.log('--- Create WME ---');
  const wme = new StateWME('player', 'combat_stance', 'defensive');
  wm.assert(wme);

  console.log(`Is fresh (within 100ms)? ${wm.isFresh(wme, 100)}`);
  console.log(`Is stale (older than 100ms)? ${wm.isStale(wme, 100)}`);

  console.log('\n--- Wait 150ms ---');
  await new Promise(r => setTimeout(r, 150));

  console.log(`Is fresh (within 100ms)? ${wm.isFresh(wme, 100)}`);
  console.log(`Is stale (older than 100ms)? ${wm.isStale(wme, 100)}`);

  console.log('\n--- Modify WME (refreshes it) ---');
  wm.modify(wme, { value: 'aggressive' });

  console.log(`Is fresh (within 100ms)? ${wm.isFresh(wme, 100)} (creation time unchanged)`);
  console.log(`Is stale (not modified in 100ms)? ${wm.isStale(wme, 100)} (just modified)`);

  console.log('\nExpected: Can check if WMEs are fresh or stale');

  wm.destroy();
}

// ===== EXAMPLE 7: Memory Snapshots =====

export async function testMemorySnapshots(): Promise<void> {
  console.log('\n===== Example 7: Memory Snapshots =====\n');

  const wm = new TemporalWorkingMemory(false, 0);

  console.log('--- Initial state ---');
  wm.assert(new LocationWME('player', 'plaza'));
  wm.assert(new StateWME('player', 'health', 100));
  console.log(`WMEs: ${wm.getAll().length}`);

  console.log('\n--- Create snapshot "checkpoint1" ---');
  wm.createSnapshot('checkpoint1');
  console.log(`Snapshots: ${wm.getSnapshotNames().join(', ')}`);

  console.log('\n--- Modify state ---');
  wm.retract(wm.findOne({ type: 'Location' })!);
  wm.assert(new LocationWME('player', 'dungeon'));
  const healthWME = wm.findOne({ type: 'State' });
  if (healthWME) wm.modify(healthWME, { value: 50 });
  console.log(`Player location: ${wm.findOne({ type: 'Location' })?.getAttribute('location')}`);
  console.log(`Player health: ${wm.findOne({ type: 'State' })?.getAttribute('value')}`);

  console.log('\n--- Create snapshot "checkpoint2" ---');
  wm.createSnapshot('checkpoint2');

  console.log('\n--- Restore snapshot "checkpoint1" ---');
  wm.restoreSnapshot('checkpoint1');
  console.log(`Player location: ${wm.findOne({ type: 'Location' })?.getAttribute('location')}`);
  console.log(`Player health: ${wm.findOne({ type: 'State' })?.getAttribute('value')}`);

  console.log('\nExpected: Can save and restore memory state with snapshots');

  wm.destroy();
}

// ===== EXAMPLE 8: Expiring Soon Detection =====

export async function testExpiringSoon(): Promise<void> {
  console.log('\n===== Example 8: Expiring Soon Detection =====\n');

  const wm = new TemporalWorkingMemory(false, 0);

  console.log('--- Create buffs with different lifetimes ---');
  wm.assertTemporary('Buff', { type: 'strength', power: 10 }, 500);
  wm.assertTemporary('Buff', { type: 'defense', power: 5 }, 1000);
  wm.assertTemporary('Buff', { type: 'speed', power: 15 }, 1500);

  console.log(`Total buffs: ${wm.getTransientWMEs().length}`);

  console.log('\n--- Wait 400ms ---');
  await new Promise(r => setTimeout(r, 400));

  console.log('\n--- Check: Buffs expiring within 200ms ---');
  const expiringSoon = wm.getExpiringSoon(200);
  console.log(`${expiringSoon.length} buff(s) expiring soon:`);
  expiringSoon.forEach(wme =>
    console.log(`  - ${wme.getAttribute('type')}: ${wme.getRemainingLifetime()}ms remaining`)
  );

  console.log('\nExpected: Can detect transient WMEs that will expire soon');

  wm.destroy();
}

// ===== EXAMPLE 9: Short-Term Memory Pattern =====

export async function testShortTermMemory(): Promise<void> {
  console.log('\n===== Example 9: Short-Term Memory Pattern =====\n');

  const wm = new TemporalWorkingMemory(false, 50); // Auto-expire every 50ms

  console.log('--- Simulate sensory perceptions (short-term memory) ---');
  console.log('All perceptions last only 300ms');

  wm.assertTemporary('Sensory', { sense: 'sight', stimulus: 'dragon' }, 300);
  console.log('T+0ms: Saw dragon');

  await new Promise(r => setTimeout(r, 100));
  wm.assertTemporary('Sensory', { sense: 'sound', stimulus: 'roar' }, 300);
  console.log('T+100ms: Heard roar');

  await new Promise(r => setTimeout(r, 100));
  wm.assertTemporary('Sensory', { sense: 'smell', stimulus: 'smoke' }, 300);
  console.log('T+200ms: Smelled smoke');

  console.log(`\nPerceptions in memory: ${wm.getAll().length}`);

  console.log('\n--- Wait 150ms (sight fades) ---');
  await new Promise(r => setTimeout(r, 150));
  console.log(`Perceptions in memory: ${wm.getAll().length} (sight faded)`);

  console.log('\n--- Wait 100ms (sound fades) ---');
  await new Promise(r => setTimeout(r, 100));
  console.log(`Perceptions in memory: ${wm.getAll().length} (sound faded)`);

  console.log('\n--- Wait 100ms (smell fades) ---');
  await new Promise(r => setTimeout(r, 100));
  console.log(`Perceptions in memory: ${wm.getAll().length} (all faded)`);

  console.log('\nExpected: Short-term memory pattern - recent perceptions fade over time');

  wm.destroy();
}

// ===== EXAMPLE 10: Temporal Statistics =====

export async function testTemporalStatistics(): Promise<void> {
  console.log('\n===== Example 10: Temporal Statistics =====\n');

  const wm = new TemporalWorkingMemory(false, 0);

  console.log('--- Add mix of permanent and transient WMEs ---');
  wm.assert(new LocationWME('player', 'plaza'));
  wm.assert(new StateWME('player', 'health', 100));
  wm.assertTemporary('Buff', { type: 'strength' }, 500);
  wm.assertTemporary('Buff', { type: 'speed' }, 1000);

  await new Promise(r => setTimeout(r, 100));

  wm.assert(new StateWME('player', 'mana', 50));

  console.log('\n--- Temporal Statistics ---');
  const stats = wm.getTemporalStats();
  console.log(`Total WMEs: ${stats.totalWMEs}`);
  console.log(`Transient WMEs: ${stats.transientWMEs}`);
  console.log(`Expired WMEs: ${stats.expiredWMEs}`);
  console.log(`Average age: ${stats.averageAge.toFixed(0)}ms`);
  console.log(`Oldest WME: ${stats.oldestWME.toFixed(0)}ms old`);
  console.log(`Newest WME: ${stats.newestWME.toFixed(0)}ms old`);
  console.log(`Snapshots: ${stats.snapshots}`);

  console.log('\nExpected: Comprehensive temporal statistics');

  wm.destroy();
}

// ===== EXAMPLE 11: Helper Functions =====

export async function testTemporalHelpers(): Promise<void> {
  console.log('\n===== Example 11: Temporal Helper Functions =====\n');

  const wm = new TemporalWorkingMemory(false, 0);

  console.log('--- Create events ---');
  wm.assert(new EventWME('event1'));
  await new Promise(r => setTimeout(r, 50));
  wm.assert(new EventWME('event2'));
  await new Promise(r => setTimeout(r, 50));
  wm.assert(new EventWME('event3'));

  console.log('\n--- Get last 2 seconds ---');
  const lastTwoSeconds = TemporalHelpers.getLastNSeconds(wm, 2);
  console.log(`Found ${lastTwoSeconds.length} event(s)`);

  console.log('\n--- Get older than 1 minute ---');
  const old = TemporalHelpers.getOlderThan(wm, 1);
  console.log(`Found ${old.length} old event(s)`);

  console.log('\n--- Add old WME (simulate) ---');
  const oldWME = new EventWME('old_event');
  (oldWME as any).createdAt = Date.now() - 5 * 60 * 1000; // 5 minutes ago
  wm.assert(oldWME);

  console.log('\n--- Prune WMEs older than 1 minute ---');
  const pruned = TemporalHelpers.pruneOld(wm, 1 * 60 * 1000);
  console.log(`Pruned ${pruned} old WME(s)`);
  console.log(`Remaining WMEs: ${wm.getAll().length}`);

  console.log('\nExpected: Helper functions simplify temporal operations');

  wm.destroy();
}

// ===== EXAMPLE 12: Practical Use Case - Temporary Buffs =====

export async function testPracticalBuffSystem(): Promise<void> {
  console.log('\n===== Example 12: Practical Use Case - Temporary Buffs =====\n');

  const wm = new TemporalWorkingMemory(false, 100); // Check every 100ms

  console.log('--- Game: Player drinks strength potion ---');
  wm.assertTemporary('Buff', { type: 'strength', bonus: 10 }, 500);
  console.log('Strength +10 for 500ms');

  console.log('\n--- Check active buffs ---');
  let buffs = wm.query({ type: 'Buff' });
  console.log(`Active buffs: ${buffs.length}`);
  buffs.forEach(buff =>
    console.log(`  - ${buff.getAttribute('type')}: +${buff.getAttribute('bonus')}`)
  );

  console.log('\n--- Calculate total strength ---');
  const baseStrength = 50;
  const buffBonus = buffs.reduce((sum, buff) => sum + (buff.getAttribute('bonus') || 0), 0);
  console.log(`Base: ${baseStrength}, Buff: +${buffBonus}, Total: ${baseStrength + buffBonus}`);

  console.log('\n--- Wait 600ms (buff expires) ---');
  await new Promise(r => setTimeout(r, 600));

  buffs = wm.query({ type: 'Buff' });
  console.log(`Active buffs: ${buffs.length} (strength buff expired)`);

  const newBuffBonus = buffs.reduce((sum, buff) => sum + (buff.getAttribute('bonus') || 0), 0);
  console.log(`Base: ${baseStrength}, Buff: +${newBuffBonus}, Total: ${baseStrength + newBuffBonus}`);

  console.log('\nExpected: Practical buff system with automatic expiration');

  wm.destroy();
}

// ===== RUN ALL EXAMPLES =====

export async function runAllTemporalMemoryExamples(): Promise<void> {
  await testBasicTimestamps();
  await new Promise(r => setTimeout(r, 500));

  await testTransientWMEs();
  await new Promise(r => setTimeout(r, 500));

  await testAutomaticExpiration();
  await new Promise(r => setTimeout(r, 500));

  await testTemporalQueries();
  await new Promise(r => setTimeout(r, 500));

  await testTimeRangeQueries();
  await new Promise(r => setTimeout(r, 500));

  await testFreshStaleChecks();
  await new Promise(r => setTimeout(r, 500));

  await testMemorySnapshots();
  await new Promise(r => setTimeout(r, 500));

  await testExpiringSoon();
  await new Promise(r => setTimeout(r, 500));

  await testShortTermMemory();
  await new Promise(r => setTimeout(r, 500));

  await testTemporalStatistics();
  await new Promise(r => setTimeout(r, 500));

  await testTemporalHelpers();
  await new Promise(r => setTimeout(r, 500));

  await testPracticalBuffSystem();
}

// Run if executed directly
if (require.main === module) {
  runAllTemporalMemoryExamples().catch(console.error);
}
