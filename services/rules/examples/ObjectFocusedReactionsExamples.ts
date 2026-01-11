/**
 * ObjectFocusedReactions Examples - FACADE 6.7
 *
 * Demonstrates object-focused reactions with ownership tracking.
 */

import {
  OwnershipManager,
  ObjectFocusedMatcher,
  ActionDetector,
  OwnershipIntegration,
  ObjectReferenceHelpers,
  ObjectReferencePattern,
  ActionOnObject,
} from '../ObjectFocusedReactions';
import { WorkingMemory } from '../../wm/WorkingMemory';
import { RuleEngine } from '../RuleEngine';
import { RuleBuilder } from '../Rule';
import { WME } from '../../wm/WME';

console.log('='.repeat(80));
console.log('FACADE 6.7: OBJECT-FOCUSED REACTIONS EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Ownership Tracking
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Ownership Tracking');
console.log('='.repeat(80));

const ownershipMgr1 = new OwnershipManager(true);

console.log('\nSetting up ownership:');
ObjectReferenceHelpers.setOwner(ownershipMgr1, 'sword_001', 'merchant', 'owns');
ObjectReferenceHelpers.setOwner(ownershipMgr1, 'potion_001', 'merchant', 'owns');
ObjectReferenceHelpers.setOwner(ownershipMgr1, 'shield_001', 'guard', 'carries');

console.log('\nChecking ownership:');
console.log(`Merchant owns sword_001: ${ownershipMgr1.owns('merchant', 'sword_001')}`);
console.log(`Guard owns sword_001: ${ownershipMgr1.owns('guard', 'sword_001')}`);
console.log(`Owner of shield_001: ${ownershipMgr1.getOwner('shield_001')}`);

console.log('\nMerchant\'s possessions:');
const merchantItems = ownershipMgr1.getOwnedObjects('merchant');
console.log(`  ${merchantItems.join(', ')}`);

// ============================================================================
// Example 2: MY Sword vs ANY Sword
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: MY Sword vs ANY Sword');
console.log('='.repeat(80));

const wm2 = new WorkingMemory();
const ownershipMgr2 = new OwnershipManager();

// Create swords
const merchantSword = new WME('Weapon', { name: 'Iron Sword', type: 'sword' });
const guardSword = new WME('Weapon', { name: 'Steel Sword', type: 'sword' });
const playerSword = new WME('Weapon', { name: 'Bronze Sword', type: 'sword' });

wm2.assert(merchantSword);
wm2.assert(guardSword);
wm2.assert(playerSword);

// Set ownership
ObjectReferenceHelpers.setOwner(ownershipMgr2, merchantSword.id, 'merchant');
ObjectReferenceHelpers.setOwner(ownershipMgr2, guardSword.id, 'guard');
ObjectReferenceHelpers.setOwner(ownershipMgr2, playerSword.id, 'player');

const matcher2 = new ObjectFocusedMatcher(ownershipMgr2);

// Pattern for "MY sword" (merchant's)
const mySwordPattern: ObjectReferencePattern = {
  type: 'Weapon',
  owner: 'merchant',
  attributes: { type: 'sword' },
};

// Pattern for "ANY sword"
const anySwordPattern: ObjectReferencePattern = {
  type: 'Weapon',
  attributes: { type: 'sword' },
};

console.log('\nFinding MY sword (merchant):');
const mySwords = matcher2.findMatches(wm2.getAll(), mySwordPattern);
console.log(`  Found ${mySwords.length}: ${mySwords.map(s => s.getAttribute('name')).join(', ')}`);

console.log('\nFinding ANY sword:');
const anySwords = matcher2.findMatches(wm2.getAll(), anySwordPattern);
console.log(`  Found ${anySwords.length}: ${anySwords.map(s => s.getAttribute('name')).join(', ')}`);

// ============================================================================
// Example 3: Theft Detection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Theft Detection');
console.log('='.repeat(80));

const wm3 = new WorkingMemory();
const ownershipMgr3 = new OwnershipManager();
const actionDetector3 = new ActionDetector(ownershipMgr3);

// Setup: Merchant owns a valuable gem
const gem = new WME('Item', { name: 'Ruby Gem', value: 500 });
wm3.assert(gem);
ObjectReferenceHelpers.setOwner(ownershipMgr3, gem.id, 'merchant');

console.log('\nInitial ownership:');
console.log(`  Gem owner: ${ownershipMgr3.getOwner(gem.id)}`);

// Player takes the gem
const takeAction: ActionOnObject = {
  action: 'take',
  actor: 'player',
  object: gem.id,
  timestamp: Date.now(),
};

console.log('\nPlayer takes the gem:');
actionDetector3.recordAction(takeAction);

// Check if it was theft
const theftCheck = ObjectReferenceHelpers.isTheft(takeAction, ownershipMgr3);
console.log(`  Was theft: ${theftCheck.isTheft}`);
console.log(`  Victim: ${theftCheck.victim}`);

// ============================================================================
// Example 4: NPC Reacts to Theft of THEIR Property
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: NPC Reacts to Theft of THEIR Property');
console.log('='.repeat(80));

const wm4 = new WorkingMemory();
const engine4 = new RuleEngine(wm4, { debug: false });
const ownershipMgr4 = new OwnershipManager();
const integration4 = new OwnershipIntegration(wm4, ownershipMgr4);

// Setup merchant's property
const merchantGold = new WME('Item', { name: 'Gold Coins', owner: 'merchant' });
wm4.assert(merchantGold);
ObjectReferenceHelpers.setOwner(ownershipMgr4, merchantGold.id, 'merchant');

// Rule: React to theft of MY property
const theftReactionRule = new RuleBuilder()
  .named('React to Theft')
  .whenType('Action', { type: 'take' }, 'action')
  .validate((bindings) => {
    const action = bindings.get('action')!;
    const objectId = action.getAttribute('object');
    const actor = action.getAttribute('actor');

    // Check if someone took merchant's property
    return (
      ownershipMgr4.owns('merchant', objectId) && actor !== 'merchant'
    );
  })
  .then((bindings) => {
    const action = bindings.get('action')!;
    const actor = action.getAttribute('actor');
    console.log(`>>> Merchant: "Hey! ${actor}! That's MY property! Give it back!"`);
  })
  .build();

engine4.addRule(theftReactionRule);

console.log('\nPlayer takes merchant\'s gold:');
wm4.assert(
  new WME('Action', {
    type: 'take',
    actor: 'player',
    object: merchantGold.id,
  })
);
engine4.run();

// ============================================================================
// Example 5: NPC Doesn't Care About Other NPC's Property
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: NPC Doesn\'t Care About Other NPC\'s Property');
console.log('='.repeat(80));

const wm5 = new WorkingMemory();
const engine5 = new RuleEngine(wm5, { debug: false });
const ownershipMgr5 = new OwnershipManager();

// Setup: Guard's sword and Merchant's sword
const guardSword5 = new WME('Weapon', { name: 'Guard Sword' });
const merchantSword5 = new WME('Weapon', { name: 'Merchant Sword' });
wm5.assert(guardSword5);
wm5.assert(merchantSword5);

ObjectReferenceHelpers.setOwner(ownershipMgr5, guardSword5.id, 'guard');
ObjectReferenceHelpers.setOwner(ownershipMgr5, merchantSword5.id, 'merchant');

// Rule: Merchant only cares about THEIR property
const merchantTheftRule = new RuleBuilder()
  .named('Merchant Theft Reaction')
  .whenType('Action', { type: 'take' }, 'action')
  .validate((bindings) => {
    const action = bindings.get('action')!;
    const objectId = action.getAttribute('object');
    return ownershipMgr5.owns('merchant', objectId);
  })
  .then(() => {
    console.log('>>> Merchant: "MY property was stolen!"');
  })
  .build();

engine5.addRule(merchantTheftRule);

console.log('\nPlayer takes guard\'s sword (merchant doesn\'t care):');
wm5.assert(
  new WME('Action', {
    type: 'take',
    actor: 'player',
    object: guardSword5.id,
  })
);
engine5.run();

console.log('\nPlayer takes merchant\'s sword (merchant reacts):');
wm5.clear();
wm5.assert(
  new WME('Action', {
    type: 'take',
    actor: 'player',
    object: merchantSword5.id,
  })
);
engine5.run();

// ============================================================================
// Example 6: Ownership Transfer
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Ownership Transfer');
console.log('='.repeat(80));

const ownershipMgr6 = new OwnershipManager(true);

ObjectReferenceHelpers.setOwner(ownershipMgr6, 'item_001', 'merchant');

console.log('\nInitial owner:');
console.log(`  Owner: ${ownershipMgr6.getOwner('item_001')}`);

console.log('\nTransferring to player:');
ownershipMgr6.transfer('item_001', 'player', 'carries');

console.log(`  New owner: ${ownershipMgr6.getOwner('item_001')}`);

// ============================================================================
// Example 7: Action History Tracking
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Action History Tracking');
console.log('='.repeat(80));

const ownershipMgr7 = new OwnershipManager();
const actionDetector7 = new ActionDetector(ownershipMgr7);

ObjectReferenceHelpers.setOwner(ownershipMgr7, 'item1', 'merchant');
ObjectReferenceHelpers.setOwner(ownershipMgr7, 'item2', 'merchant');

console.log('\nRecording actions:');

actionDetector7.recordAction({
  action: 'take',
  actor: 'player',
  object: 'item1',
  timestamp: Date.now(),
});

await new Promise((resolve) => setTimeout(resolve, 100));

actionDetector7.recordAction({
  action: 'use',
  actor: 'player',
  object: 'item1',
  timestamp: Date.now(),
});

await new Promise((resolve) => setTimeout(resolve, 100));

actionDetector7.recordAction({
  action: 'take',
  actor: 'player',
  object: 'item2',
  timestamp: Date.now(),
});

console.log('\nActions on merchant\'s property:');
const merchantActions = actionDetector7.getActionsOnOwnedObjects('merchant');
console.log(`  Total: ${merchantActions.length}`);
for (const action of merchantActions) {
  console.log(`  - ${action.actor} ${action.action} ${action.object}`);
}

console.log('\nDid player take merchant\'s property recently?');
console.log(`  ${actionDetector7.didActorTakeProperty('player', 'merchant', 10000)}`);

// ============================================================================
// Example 8: Ownership Types
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Ownership Types');
console.log('='.repeat(80));

const ownershipMgr8 = new OwnershipManager();

console.log('\nDifferent ownership types:');

ownershipMgr8.setOwnership({
  owner: 'merchant',
  object: 'shop_building',
  type: 'owns',
  strength: 1.0,
  since: Date.now(),
});

ownershipMgr8.setOwnership({
  owner: 'guard',
  object: 'sword_equipped',
  type: 'carries',
  strength: 1.0,
  since: Date.now(),
});

ownershipMgr8.setOwnership({
  owner: 'guard',
  object: 'armor_equipped',
  type: 'wears',
  strength: 1.0,
  since: Date.now(),
});

ownershipMgr8.setOwnership({
  owner: 'guard',
  object: 'gate_entrance',
  type: 'guards',
  strength: 0.8,
  since: Date.now(),
});

ownershipMgr8.displayStats();

// ============================================================================
// Example 9: Integration with Working Memory
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Integration with Working Memory');
console.log('='.repeat(80));

const wm9 = new WorkingMemory();
const ownershipMgr9 = new OwnershipManager();
const integration9 = new OwnershipIntegration(wm9, ownershipMgr9);

// Create items with owner attribute
wm9.assert(new WME('Item', { name: 'Sword', owner: 'merchant' }));
wm9.assert(new WME('Item', { name: 'Shield', owner: 'guard' }));
wm9.assert(new WME('Item', { name: 'Potion', owner: 'merchant' }));

console.log('\nAuto-setup ownership from WME attributes:');
const count = integration9.autoSetupOwnership('owner');
console.log(`  Setup ${count} ownerships`);

console.log('\nMerchant\'s items:');
const merchantItems9 = integration9.findOwnedObjects('merchant');
for (const item of merchantItems9) {
  console.log(`  - ${item.getAttribute('name')}`);
}

// ============================================================================
// Example 10: Ownership-Based Pattern Matching
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Ownership-Based Pattern Matching');
console.log('='.repeat(80));

const wm10 = new WorkingMemory();
const ownershipMgr10 = new OwnershipManager();
const matcher10 = new ObjectFocusedMatcher(ownershipMgr10);

// Create weapons
const weapons = [
  new WME('Weapon', { name: 'Merchant Sword', type: 'sword' }),
  new WME('Weapon', { name: 'Guard Sword', type: 'sword' }),
  new WME('Weapon', { name: 'Player Sword', type: 'sword' }),
  new WME('Weapon', { name: 'Merchant Axe', type: 'axe' }),
];

for (const weapon of weapons) {
  wm10.assert(weapon);
}

ObjectReferenceHelpers.setOwner(ownershipMgr10, weapons[0].id, 'merchant');
ObjectReferenceHelpers.setOwner(ownershipMgr10, weapons[1].id, 'guard');
ObjectReferenceHelpers.setOwner(ownershipMgr10, weapons[2].id, 'player');
ObjectReferenceHelpers.setOwner(ownershipMgr10, weapons[3].id, 'merchant');

console.log('\nFinding merchant\'s weapons:');
const merchantWeapons = matcher10.findOwnedBy(wm10.getAll(), 'merchant');
console.log(`  Found ${merchantWeapons.length}: ${merchantWeapons.map(w => w.getAttribute('name')).join(', ')}`);

console.log('\nFinding weapons not owned by merchant:');
const notMerchantWeapons = matcher10.findNotOwnedBy(wm10.getAll(), 'merchant');
console.log(`  Found ${notMerchantWeapons.length}: ${notMerchantWeapons.map(w => w.getAttribute('name')).join(', ')}`);

// ============================================================================
// Example 11: Complex Ownership Scenarios
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Complex Ownership Scenarios - Trading');
console.log('='.repeat(80));

const wm11 = new WorkingMemory();
const ownershipMgr11 = new OwnershipManager(true);
const integration11 = new OwnershipIntegration(wm11, ownershipMgr11);

const tradedItem = new WME('Item', { name: 'Rare Gem' });
wm11.assert(tradedItem);

console.log('\n1. Merchant owns gem:');
ObjectReferenceHelpers.setOwner(ownershipMgr11, tradedItem.id, 'merchant');

console.log('\n2. Player buys gem (give action):');
integration11.recordAction({
  action: 'give',
  actor: 'merchant',
  object: tradedItem.id,
  timestamp: Date.now(),
  data: { recipient: 'player' },
});

console.log(`   New owner: ${ownershipMgr11.getOwner(tradedItem.id)}`);

console.log('\n3. Player drops gem:');
integration11.recordAction({
  action: 'drop',
  actor: 'player',
  object: tradedItem.id,
  timestamp: Date.now(),
});

console.log(`   Owner after drop: ${ownershipMgr11.getOwner(tradedItem.id) || 'none'}`);

// ============================================================================
// Example 12: Territorial Behavior
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Territorial Behavior - Guarding Territory');
console.log('='.repeat(80));

const wm12 = new WorkingMemory();
const engine12 = new RuleEngine(wm12, { debug: false });
const ownershipMgr12 = new OwnershipManager();

// Guard guards the gate
const gate = new WME('Location', { name: 'City Gate' });
wm12.assert(gate);
ownershipMgr12.setOwnership({
  owner: 'guard',
  object: gate.id,
  type: 'guards',
  strength: 1.0,
  since: Date.now(),
});

// Rule: React when someone enters guarded territory
const territorialRule = new RuleBuilder()
  .named('Guard Territory')
  .whenType('Event', { type: 'enter_location' }, 'event')
  .validate((bindings) => {
    const event = bindings.get('event')!;
    const locationId = event.getAttribute('location');
    const actor = event.getAttribute('actor');

    // Check if guard guards this location and actor is not guard
    const ownership = ownershipMgr12.getOwnership(locationId);
    return ownership?.type === 'guards' && ownership.owner !== actor;
  })
  .then((bindings) => {
    const event = bindings.get('event')!;
    const actor = event.getAttribute('actor');
    console.log(`>>> Guard: "Halt! State your business, ${actor}!"`);
  })
  .build();

engine12.addRule(territorialRule);

console.log('\nPlayer enters guarded gate:');
wm12.assert(
  new WME('Event', {
    type: 'enter_location',
    actor: 'player',
    location: gate.id,
  })
);
engine12.run();

// ============================================================================
// Example 13: Practical Use Case - Shop System
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 13: Practical Use Case - Shop System');
console.log('='.repeat(80));

const wm13 = new WorkingMemory();
const engine13 = new RuleEngine(wm13, { debug: false });
const ownershipMgr13 = new OwnershipManager();
const integration13 = new OwnershipIntegration(wm13, ownershipMgr13);

// Setup shop inventory
const shopItems = [
  new WME('Item', { name: 'Health Potion', price: 50, owner: 'merchant' }),
  new WME('Item', { name: 'Mana Potion', price: 60, owner: 'merchant' }),
  new WME('Item', { name: 'Iron Sword', price: 200, owner: 'merchant' }),
];

for (const item of shopItems) {
  wm13.assert(item);
}

integration13.autoSetupOwnership('owner');

// Rule: Detect unpaid theft
const theftRule13 = new RuleBuilder()
  .named('Detect Theft')
  .whenType('Action', { type: 'take' }, 'action')
  .validate((bindings) => {
    const action = bindings.get('action')!;
    const objectId = action.getAttribute('object');
    const isPaid = action.getAttribute('paid');

    return ownershipMgr13.owns('merchant', objectId) && !isPaid;
  })
  .then((bindings) => {
    const action = bindings.get('action')!;
    const actor = action.getAttribute('actor');
    console.log(`>>> Merchant: "THIEF! ${actor} is stealing from my shop!"`);
  })
  .build();

// Rule: Allow paid purchase
const purchaseRule13 = new RuleBuilder()
  .named('Process Purchase')
  .whenType('Action', { type: 'take', paid: true }, 'action')
  .validate((bindings) => {
    const action = bindings.get('action')!;
    const objectId = action.getAttribute('object');
    return ownershipMgr13.owns('merchant', objectId);
  })
  .then((bindings) => {
    const action = bindings.get('action')!;
    const objectId = action.getAttribute('object');
    const item = wm13.get(objectId);

    console.log(`>>> Merchant: "Thank you for your purchase of ${item?.getAttribute('name')}!"`);

    // Transfer ownership
    integration13.recordAction({
      action: 'give',
      actor: 'merchant',
      object: objectId,
      timestamp: Date.now(),
      data: { recipient: action.getAttribute('actor') },
    });
  })
  .build();

engine13.addRule(theftRule13);
engine13.addRule(purchaseRule13);

console.log('\n--- SCENARIO START ---');

console.log('\n1. Player tries to steal potion:');
wm13.assert(
  new WME('Action', {
    type: 'take',
    actor: 'player',
    object: shopItems[0].id,
    paid: false,
  })
);
engine13.run();

console.log('\n2. Player buys sword legitimately:');
wm13.clear();
wm13.assert(
  new WME('Action', {
    type: 'take',
    actor: 'player',
    object: shopItems[2].id,
    paid: true,
  })
);
engine13.run();

console.log(`\n3. Sword now owned by: ${ownershipMgr13.getOwner(shopItems[2].id)}`);

console.log('\n' + '='.repeat(80));
console.log('FACADE 6.7 EXAMPLES COMPLETE');
console.log('='.repeat(80));
