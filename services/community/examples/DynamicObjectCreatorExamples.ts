/**
 * Examples demonstrating SCRIBBLENAUTS PARITY 1.1: Text-Based Object Spawning
 *
 * Shows how players can create objects by typing descriptions.
 */

import { DynamicObjectCreator } from '../DynamicObjectCreator';
import { Language } from '../../../types';

console.log('=== SCRIBBLENAUTS PARITY 1.1: Text-Based Object Spawning Examples ===\n');

const creator = new DynamicObjectCreator();

// Example 1: Simple object creation
console.log('=== Example 1: Simple Object Creation ===');
const result1 = creator.createObject({
  description: 'door',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result1.success}`);
console.log(`Message: ${result1.message}`);
if (result1.object) {
  console.log(`Object ID: ${result1.object.id}`);
  console.log(`Name: ${result1.object.name[Language.ENGLISH]}`);
  console.log(`Can be opened: ${result1.object.properties.can_be_opened}`);
  console.log(`Allowed actions: ${result1.object.allowedActions.join(', ')}`);
}

// Example 2: Object with adjective (color)
console.log('\n=== Example 2: Red Door ===');
const result2 = creator.createObject({
  description: 'red door',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result2.success}`);
console.log(`Message: ${result2.message}`);
if (result2.object) {
  console.log(`Name: ${result2.object.name[Language.ENGLISH]}`);
  console.log(`Traits: ${result2.object.properties.traits?.join(', ')}`);
}

// Example 3: Multiple adjectives
console.log('\n=== Example 3: Big Wooden Door ===');
const result3 = creator.createObject({
  description: 'big wooden door',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result3.success}`);
console.log(`Message: ${result3.message}`);
if (result3.object) {
  console.log(`Name: ${result3.object.name[Language.ENGLISH]}`);
  console.log(`Is heavy: ${result3.object.properties.is_heavy}`);
  console.log(`Is flammable: ${result3.object.properties.is_flammable}`);
  console.log(`Traits: ${result3.object.properties.traits?.join(', ')}`);
}

// Example 4: Create a weapon
console.log('\n=== Example 4: Iron Sword ===');
const result4 = creator.createObject({
  description: 'iron sword',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result4.success}`);
console.log(`Message: ${result4.message}`);
if (result4.object) {
  console.log(`Name: ${result4.object.name[Language.ENGLISH]}`);
  console.log(`Damage: ${result4.object.properties.damage}`);
  console.log(`Is sharp: ${result4.object.properties.is_sharp}`);
  console.log(`Can be held: ${result4.object.properties.can_be_held}`);
  console.log(`Allowed actions: ${result4.object.allowedActions.join(', ')}`);
}

// Example 5: Size modifiers on weapons
console.log('\n=== Example 5: Tiny Sword vs Huge Sword ===');
const tinySword = creator.createObject({
  description: 'tiny sword',
  requestedBy: 'player',
  language: Language.ENGLISH
});

const hugeSword = creator.createObject({
  description: 'huge sword',
  requestedBy: 'player',
  language: Language.ENGLISH
});

if (tinySword.object && hugeSword.object) {
  console.log(`Tiny sword damage: ${tinySword.object.properties.damage}`);
  console.log(`Tiny sword weight: ${tinySword.object.properties.weight}`);
  console.log(`Huge sword damage: ${hugeSword.object.properties.damage}`);
  console.log(`Huge sword weight: ${hugeSword.object.properties.weight}`);
  console.log(`Huge sword is heavy: ${hugeSword.object.properties.is_heavy}`);
}

// Example 6: Create a creature
console.log('\n=== Example 6: Tiny Dragon ===');
const result6 = creator.createObject({
  description: 'tiny dragon',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result6.success}`);
console.log(`Message: ${result6.message}`);
if (result6.object) {
  console.log(`Name: ${result6.object.name[Language.ENGLISH]}`);
  console.log(`Is alive: ${result6.object.properties.is_alive}`);
  console.log(`Damage: ${result6.object.properties.damage}`);
  console.log(`Weight (affected by 'tiny'): ${result6.object.properties.weight}`);
}

// Example 7: Friendly vs dangerous creature
console.log('\n=== Example 7: Friendly Wolf vs Dangerous Wolf ===');
const friendlyWolf = creator.createObject({
  description: 'friendly wolf',
  requestedBy: 'player',
  language: Language.ENGLISH
});

const dangerousWolf = creator.createObject({
  description: 'dangerous wolf',
  requestedBy: 'player',
  language: Language.ENGLISH
});

if (friendlyWolf.object && dangerousWolf.object) {
  console.log(`Friendly wolf disposition: ${friendlyWolf.object.properties.disposition}`);
  console.log(`Friendly wolf is_friendly: ${friendlyWolf.object.properties.is_friendly}`);
  console.log(`Dangerous wolf disposition: ${dangerousWolf.object.properties.disposition}`);
  console.log(`Dangerous wolf is_friendly: ${dangerousWolf.object.properties.is_friendly}`);
}

// Example 8: Container creation
console.log('\n=== Example 8: Big Chest ===');
const result8 = creator.createObject({
  description: 'big chest',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result8.success}`);
console.log(`Message: ${result8.message}`);
if (result8.object) {
  console.log(`Name: ${result8.object.name[Language.ENGLISH]}`);
  console.log(`Can be opened: ${result8.object.properties.can_be_opened}`);
  console.log(`Can contain: ${result8.object.properties.can_contain?.join(', ')}`);
  console.log(`Is heavy (from 'big'): ${result8.object.properties.is_heavy}`);
}

// Example 9: State modifiers
console.log('\n=== Example 9: Locked Door ===');
const result9 = creator.createObject({
  description: 'locked door',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result9.success}`);
console.log(`Message: ${result9.message}`);
if (result9.object) {
  console.log(`Name: ${result9.object.name[Language.ENGLISH]}`);
  console.log(`Is locked: ${result9.object.properties.is_locked}`);
  console.log(`Can be locked: ${result9.object.properties.can_be_locked}`);
}

// Example 10: Temperature modifiers
console.log('\n=== Example 10: Hot Sword ===');
const result10 = creator.createObject({
  description: 'hot sword',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result10.success}`);
console.log(`Message: ${result10.message}`);
if (result10.object) {
  console.log(`Name: ${result10.object.name[Language.ENGLISH]}`);
  console.log(`Is hot: ${result10.object.properties.is_hot}`);
  console.log(`Is lit: ${result10.object.properties.is_lit}`);
}

// Example 11: Magical modifier
console.log('\n=== Example 11: Magical Sword ===');
const normalSword = creator.createObject({
  description: 'sword',
  requestedBy: 'player',
  language: Language.ENGLISH
});

const magicalSword = creator.createObject({
  description: 'magical sword',
  requestedBy: 'player',
  language: Language.ENGLISH
});

if (normalSword.object && magicalSword.object) {
  console.log(`Normal sword damage: ${normalSword.object.properties.damage}`);
  console.log(`Magical sword damage: ${magicalSword.object.properties.damage}`);
  console.log(`Magical sword traits: ${magicalSword.object.properties.traits?.join(', ')}`);
}

// Example 12: Sharp modifier on weapon
console.log('\n=== Example 12: Sharp Dagger ===');
const result12 = creator.createObject({
  description: 'sharp dagger',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result12.success}`);
console.log(`Message: ${result12.message}`);
if (result12.object) {
  console.log(`Name: ${result12.object.name[Language.ENGLISH]}`);
  console.log(`Base damage (dagger): ${result12.object.properties.damage}`);
  console.log(`Is sharp: ${result12.object.properties.is_sharp}`);
}

// Example 13: Material modifiers
console.log('\n=== Example 13: Glass Door ===');
const result13 = creator.createObject({
  description: 'glass door',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result13.success}`);
console.log(`Message: ${result13.message}`);
if (result13.object) {
  console.log(`Name: ${result13.object.name[Language.ENGLISH]}`);
  console.log(`Is fragile: ${result13.object.properties.is_fragile}`);
  console.log(`Traits: ${result13.object.properties.traits?.join(', ')}`);
}

// Example 14: Unknown object (low confidence)
console.log('\n=== Example 14: Unknown Object ===');
const result14 = creator.createObject({
  description: 'quantum blaster',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result14.success}`);
console.log(`Message: ${result14.message}`);
if (result14.object) {
  console.log(`Created: ${result14.object.name[Language.ENGLISH]}`);
} else {
  console.log('Object was not created due to low confidence');
}

// Example 15: Retrieve created objects
console.log('\n=== Example 15: List All Created Objects ===');
const allObjects = creator.getAllCreatedObjects();
console.log(`Total objects created: ${allObjects.length}`);
console.log('Objects:');
allObjects.slice(0, 5).forEach(obj => {
  console.log(`  - ${obj.name[Language.ENGLISH]} (${obj.id})`);
});

// Example 16: Spanish language
console.log('\n=== Example 16: Spanish Language ===');
const result16 = creator.createObject({
  description: 'red door',
  requestedBy: 'player',
  language: Language.SPANISH
});

console.log(`Success: ${result16.success}`);
console.log(`Message (Spanish): ${result16.message}`);

// Example 17: Combining many adjectives
console.log('\n=== Example 17: Complex Description ===');
const result17 = creator.createObject({
  description: 'huge magical golden sharp sword',
  requestedBy: 'player',
  language: Language.ENGLISH
});

console.log(`Success: ${result17.success}`);
console.log(`Message: ${result17.message}`);
if (result17.object) {
  console.log(`Name: ${result17.object.name[Language.ENGLISH]}`);
  console.log(`Is heavy: ${result17.object.properties.is_heavy}`);
  console.log(`Is sharp: ${result17.object.properties.is_sharp}`);
  console.log(`Damage (boosted by size and magical): ${result17.object.properties.damage}`);
  console.log(`Traits: ${result17.object.properties.traits?.join(', ')}`);
}

// Example 18: Parse description directly
console.log('\n=== Example 18: Parse Description ===');
const parsed = creator.parseDescription('big red wooden door');
console.log(`Noun: ${parsed.noun}`);
console.log(`Adjectives: ${parsed.adjectives.join(', ')}`);
console.log(`Confidence: ${parsed.confidence}`);

console.log('\n=== All Examples Complete ===');
