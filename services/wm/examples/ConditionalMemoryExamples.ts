/**
 * ConditionalMemory Examples - FACADE 5.6
 *
 * Demonstrates advanced WME expiration with conditions.
 */

import {
  ConditionalWorkingMemory,
  ConditionalWME,
  ExpirationStrategy,
  ExpirationConditions,
  ConditionalHelpers,
  ExpirationReason,
  ExpirationEvent,
} from '../ConditionalMemory';
import { WME } from '../WME';

console.log('='.repeat(80));
console.log('FACADE 5.6: CONDITIONAL WME EXPIRATION EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Time-Based Expiration (from 5.3, still works)
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Time-Based Expiration');
console.log('='.repeat(80));

const wm1 = new ConditionalWorkingMemory(false, 100); // Check every 100ms

// Create temporary WME that expires after 2 seconds
const tempWME = wm1.assertWithConditions(
  'TempEffect',
  { name: 'speed boost', active: true },
  2000,
  ExpirationStrategy.IMMEDIATE
);

console.log('\nCreated temporary WME:');
console.log(`  ID: ${tempWME.id.substring(0, 8)}...`);
console.log(`  Expires in: ${tempWME.getRemainingLifetime()}ms`);
console.log(`  Total WMEs: ${wm1.getAll().length}`);

// Wait and check
await new Promise((resolve) => setTimeout(resolve, 2500));
console.log('\nAfter 2.5 seconds:');
console.log(`  Total WMEs: ${wm1.getAll().length} (should be 0 - expired)`);

wm1.destroy();

// ============================================================================
// Example 2: Condition-Based Expiration - "Door is open"
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Condition-Based Expiration - Door State');
console.log('='.repeat(80));

const wm2 = new ConditionalWorkingMemory(false, 100);

// Create door open state that expires when changed
const doorState = ConditionalHelpers.createDoorState(wm2, 'wooden_door', true);

console.log('\nInitial state:');
console.log(`  Door state: ${doorState.getAttribute('value') ? 'OPEN' : 'CLOSED'}`);
console.log(`  Total WMEs: ${wm2.getAll().length}`);

// Change door state (closes the door)
doorState.setAttribute('value', false);

// Check conditions (should expire)
await new Promise((resolve) => setTimeout(resolve, 200));
console.log('\nAfter closing door:');
console.log(`  Total WMEs: ${wm2.getAll().length} (should be 0 - condition triggered expiration)`);

wm2.destroy();

// ============================================================================
// Example 3: "Player is angry" - Time OR Condition
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Player Emotion State - Time OR Condition');
console.log('='.repeat(80));

const wm3 = new ConditionalWorkingMemory(false, 100);

// Player becomes angry (expires after 5 minutes OR when calmed)
const angryState = ConditionalHelpers.createAngryState(wm3, 'player', 300000);

console.log('\nPlayer is now angry:');
console.log(`  Angry: ${angryState.getAttribute('value')}`);
console.log(`  Time until auto-calm: ${Math.floor(angryState.getRemainingLifetime() / 1000)}s`);
console.log(`  Total WMEs: ${wm3.getAll().length}`);

// Player calms down before timer expires
angryState.setAttribute('value', false);

await new Promise((resolve) => setTimeout(resolve, 200));
console.log('\nAfter calming down:');
console.log(`  Total WMEs: ${wm3.getAll().length} (expired due to condition, not time)`);

wm3.destroy();

// ============================================================================
// Example 4: Combat Mode - Expires When No Enemies
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Combat Mode - Condition-Based Expiration');
console.log('='.repeat(80));

const wm4 = new ConditionalWorkingMemory(false, 100);

// Add enemies
const enemy1 = new WME('Enemy', { name: 'Goblin', health: 100 });
const enemy2 = new WME('Enemy', { name: 'Orc', health: 150 });
wm4.assert(enemy1);
wm4.assert(enemy2);

// Enter combat mode (expires when no enemies left)
const combatMode = ConditionalHelpers.createCombatMode(wm4, 'player');

console.log('\nEntering combat:');
console.log(`  Enemies: ${wm4.count({ type: 'Enemy' })}`);
console.log(`  In combat: ${combatMode.getAttribute('value')}`);
console.log(`  Total WMEs: ${wm4.getAll().length}`);

// Defeat enemies one by one
wm4.retract(enemy1);
console.log('\nAfter defeating first enemy:');
console.log(`  Enemies: ${wm4.count({ type: 'Enemy' })}`);
console.log(`  Still in combat`);

wm4.retract(enemy2);
await new Promise((resolve) => setTimeout(resolve, 200));
console.log('\nAfter defeating all enemies:');
console.log(`  Enemies: ${wm4.count({ type: 'Enemy' })}`);
console.log(`  Combat mode: ${wm4.has(combatMode.id) ? 'ACTIVE' : 'EXPIRED (no enemies left)'}`);

wm4.destroy();

// ============================================================================
// Example 5: Expiration Strategies
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Different Expiration Strategies');
console.log('='.repeat(80));

const wm5 = new ConditionalWorkingMemory(false, 100);

// IMMEDIATE - removed as soon as expired
const immediate = wm5.assertWithConditions(
  'Effect',
  { name: 'immediate' },
  500,
  ExpirationStrategy.IMMEDIATE
);

// GRACEFUL - notifies listeners before removing
const graceful = wm5.assertWithConditions(
  'Effect',
  { name: 'graceful' },
  500,
  ExpirationStrategy.GRACEFUL
);

// DELAYED - kept for extra time after expiration
const delayed = wm5.assertWithConditions(
  'Effect',
  { name: 'delayed' },
  500,
  ExpirationStrategy.DELAYED
);

console.log('\nCreated 3 WMEs with different strategies:');
console.log(`  Total WMEs: ${wm5.getAll().length}`);

await new Promise((resolve) => setTimeout(resolve, 700));
console.log('\nAfter expiration time:');
console.log(`  Total WMEs: ${wm5.getAll().length} (delayed kept temporarily)`);

await new Promise((resolve) => setTimeout(resolve, 5000));
console.log('\nAfter delayed expiration period:');
console.log(`  Total WMEs: ${wm5.getAll().length} (all expired)`);

wm5.destroy();

// ============================================================================
// Example 6: Event-Triggered Expiration
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Event-Triggered Expiration');
console.log('='.repeat(80));

const wm6 = new ConditionalWorkingMemory(false, 100);

// Create buff that expires on time OR dispel event
const buff1 = ConditionalHelpers.createBuff(wm6, 'player', 'strength', 30000);
const buff2 = ConditionalHelpers.createBuff(wm6, 'player', 'speed', 30000);
const buff3 = ConditionalHelpers.createBuff(wm6, 'player', 'defense', 30000);

console.log('\nPlayer has 3 active buffs:');
console.log(`  Total buffs: ${wm6.count({ type: 'Buff' })}`);
console.log(`  Strength: ${buff1.getAttribute('active')}`);
console.log(`  Speed: ${buff2.getAttribute('active')}`);
console.log(`  Defense: ${buff3.getAttribute('active')}`);

// Trigger dispel event
console.log('\nDispelling all buffs...');
const dispelled = wm6.triggerEvent('dispel_buffs');
console.log(`  Triggered expiration for ${dispelled} buffs`);

await new Promise((resolve) => setTimeout(resolve, 200));
console.log('\nAfter dispel:');
console.log(`  Total buffs: ${wm6.count({ type: 'Buff' })} (all removed by event)`);

wm6.destroy();

// ============================================================================
// Example 7: Dependency-Based Expiration
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Dependency-Based Expiration');
console.log('='.repeat(80));

const wm7 = new ConditionalWorkingMemory(false, 100);

// Create quest
const quest = new WME('Quest', { id: 'rescue_princess', status: 'active' });
wm7.assert(quest);

// Create quest marker that depends on quest
const marker = ConditionalHelpers.createQuestMarker(
  wm7,
  'rescue_princess',
  'castle_entrance',
  quest.id
);

console.log('\nQuest and marker created:');
console.log(`  Quest: ${quest.getAttribute('id')} - ${quest.getAttribute('status')}`);
console.log(`  Marker at: ${marker.getAttribute('location')}`);
console.log(`  Total WMEs: ${wm7.getAll().length}`);

// Complete quest (removes quest WME)
console.log('\nCompleting quest...');
wm7.retract(quest);

await new Promise((resolve) => setTimeout(resolve, 200));
console.log('\nAfter quest completion:');
console.log(`  Total WMEs: ${wm7.getAll().length} (marker auto-removed with quest)`);

wm7.destroy();

// ============================================================================
// Example 8: Expiration Listeners
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Expiration Listeners');
console.log('='.repeat(80));

const wm8 = new ConditionalWorkingMemory(false, 100);

// Add expiration listener
wm8.addExpirationListener((event: ExpirationEvent) => {
  console.log(`  [EXPIRED] ${event.wme.type} - Reason: ${event.reason}`);
});

// Create various WMEs
const timeExpire = wm8.assertWithConditions('Effect', { name: 'time' }, 500);
const conditionExpire = wm8.assertWithConditions('State', { value: true }, Infinity);
conditionExpire.addCondition(ExpirationConditions.whenAttributeEquals('value', false));

console.log('\nCreated 2 WMEs:');
console.log(`  Total WMEs: ${wm8.getAll().length}`);

console.log('\nWaiting for expirations...');

// Trigger time expiration
await new Promise((resolve) => setTimeout(resolve, 700));

// Trigger condition expiration
conditionExpire.setAttribute('value', false);
await new Promise((resolve) => setTimeout(resolve, 200));

console.log('\nAll expirations processed');

wm8.destroy();

// ============================================================================
// Example 9: Complex Conditions
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Complex Expiration Conditions');
console.log('='.repeat(80));

const wm9 = new ConditionalWorkingMemory(false, 100);

// Create WME that expires when:
// - Health drops below 50 OR
// - Age exceeds 10 seconds
const character = wm9.assertWithConditions(
  'Character',
  { name: 'Warrior', health: 100 },
  10000,
  ExpirationStrategy.GRACEFUL
);

character.addCondition(
  ExpirationConditions.any(
    ExpirationConditions.whenAttributeBelow('health', 50),
    ExpirationConditions.whenOlderThan(10000)
  )
);

console.log('\nCharacter created with complex condition:');
console.log(`  Health: ${character.getAttribute('health')}`);
console.log(`  Expires when: health < 50 OR age > 10s`);
console.log(`  Total WMEs: ${wm9.getAll().length}`);

// Damage character
character.setAttribute('health', 30);
console.log('\nCharacter took damage:');
console.log(`  Health: ${character.getAttribute('health')}`);

await new Promise((resolve) => setTimeout(resolve, 200));
console.log('\nAfter condition check:');
console.log(`  Total WMEs: ${wm9.getAll().length} (expired due to low health)`);

wm9.destroy();

// ============================================================================
// Example 10: Conditional Statistics
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Conditional Memory Statistics');
console.log('='.repeat(80));

const wm10 = new ConditionalWorkingMemory(false, 100);

// Create various conditional WMEs
wm10.assertWithConditions('Effect', { type: 'buff' }, 5000, ExpirationStrategy.IMMEDIATE);
wm10.assertWithConditions('Effect', { type: 'debuff' }, 3000, ExpirationStrategy.DELAYED);
wm10.assertWithConditions('State', { active: true }, 10000, ExpirationStrategy.GRACEFUL);

const conditional = wm10.assertWithConditions('Custom', {}, Infinity, ExpirationStrategy.IMMEDIATE);
conditional.addCondition(ExpirationConditions.whenAttributeEquals('done', true));
conditional.addDependency('fake_id');
conditional.addExpirationEvent('custom_event');

console.log('\nConditional Memory Statistics:');
const stats = wm10.getConditionalStats();
console.log(`  Total WMEs: ${stats.totalWMEs}`);
console.log(`  Conditional WMEs: ${stats.conditionalWMEs}`);
console.log(`  By Strategy:`);
console.log(`    - IMMEDIATE: ${stats.byStrategy.immediate}`);
console.log(`    - DELAYED: ${stats.byStrategy.delayed}`);
console.log(`    - GRACEFUL: ${stats.byStrategy.graceful}`);
console.log(`    - CONDITIONAL_ONLY: ${stats.byStrategy.conditional_only}`);
console.log(`  With Conditions: ${stats.withConditions}`);
console.log(`  With Dependencies: ${stats.withDependencies}`);
console.log(`  With Events: ${stats.withEvents}`);
console.log(`  Delayed Expirations: ${stats.delayedExpirations}`);

wm10.destroy();

// ============================================================================
// Example 11: Manual Expiration
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Manual Expiration');
console.log('='.repeat(80));

const wm11 = new ConditionalWorkingMemory(false, 100);

// Create long-lived WME
const effect = wm11.assertWithConditions(
  'LongEffect',
  { name: 'permanent shield' },
  Infinity,
  ExpirationStrategy.GRACEFUL
);

console.log('\nCreated permanent effect:');
console.log(`  Name: ${effect.getAttribute('name')}`);
console.log(`  Total WMEs: ${wm11.getAll().length}`);

// Manually expire it
console.log('\nManually expiring effect...');
wm11.expire(effect);

await new Promise((resolve) => setTimeout(resolve, 200));
console.log('\nAfter manual expiration:');
console.log(`  Total WMEs: ${wm11.getAll().length}`);

wm11.destroy();

// ============================================================================
// Example 12: Practical Use Case - Temporary Power-Up System
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Practical Use Case - Power-Up System');
console.log('='.repeat(80));

const wm12 = new ConditionalWorkingMemory(false, 100, 1000);

// Add expiration listener for feedback
wm12.addExpirationListener((event: ExpirationEvent) => {
  const name = event.wme.getAttribute('buffType') || event.wme.type;
  console.log(`  💫 ${name} power-up expired (${event.reason})`);
});

console.log('\n--- POWER-UP SYSTEM DEMO ---\n');

// Player picks up strength boost (lasts 10 seconds)
console.log('Player picks up STRENGTH power-up (10s duration)');
const strength = ConditionalHelpers.createBuff(wm12, 'player', 'strength', 10000);

// Player picks up speed boost (lasts 8 seconds)
console.log('Player picks up SPEED power-up (8s duration)');
const speed = ConditionalHelpers.createBuff(wm12, 'player', 'speed', 8000);

// Player picks up invincibility (lasts 5 seconds OR until taking damage)
console.log('Player picks up INVINCIBILITY power-up (5s OR until damage)');
const invincibility = wm12.assertWithConditions(
  'Buff',
  { entity: 'player', buffType: 'invincibility', active: true },
  5000,
  ExpirationStrategy.GRACEFUL
);
invincibility.addExpirationEvent('player_damaged');
invincibility.addCondition(ExpirationConditions.whenAttributeEquals('active', false));

console.log('\nActive power-ups:', wm12.count({ type: 'Buff' }));

// Simulate gameplay
console.log('\n--- GAMEPLAY SIMULATION ---\n');

// After 3 seconds, player takes damage
await new Promise((resolve) => setTimeout(resolve, 3000));
console.log('[3s] Player takes damage!');
wm12.triggerEvent('player_damaged');

// Wait for rest of timers
await new Promise((resolve) => setTimeout(resolve, 6000));
console.log('[9s] Speed boost expired');

await new Promise((resolve) => setTimeout(resolve, 2000));
console.log('[11s] Strength boost expired');

console.log('\nFinal active power-ups:', wm12.count({ type: 'Buff' }));

wm12.destroy();

console.log('\n' + '='.repeat(80));
console.log('FACADE 5.6 EXAMPLES COMPLETE');
console.log('='.repeat(80));

// Helper to make examples runnable
async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
