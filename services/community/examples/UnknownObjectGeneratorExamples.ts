/**
 * Examples demonstrating SCRIBBLENAUTS PARITY 1.4: Unknown Object Handling
 *
 * Shows how the system handles creating objects with unknown nouns.
 */

import { UnknownObjectGenerator } from '../UnknownObjectGenerator';

console.log('=== SCRIBBLENAUTS PARITY 1.4: Unknown Object Handling Examples ===\n');

const generator = new UnknownObjectGenerator();

// Example 1: Sci-fi weapon - "quantum blaster"
console.log('=== Example 1: Quantum Blaster (Sci-Fi Weapon) ===');
const result1 = generator.inferObject('quantumblaster', []);
console.log(`Noun: "quantumblaster"`);
console.log(`Adjectives: none`);
console.log(`Category: ${result1.category}`);
console.log(`Confidence: ${result1.confidence}`);
console.log(`Inference method: ${result1.inferenceMethod}`);
console.log(`Description: ${result1.description}`);
console.log(`Traits: ${result1.baseProperties.traits?.join(', ')}`);
console.log(`Can be held: ${result1.baseProperties.can_be_held}`);
console.log(`Damage: ${result1.baseProperties.damage}`);

// Example 2: With adjectives - "powerful quantum blaster"
console.log('\n=== Example 2: Powerful Quantum Blaster ===');
const result2 = generator.inferObject('quantumblaster', ['powerful', 'deadly']);
console.log(`Noun: "quantumblaster"`);
console.log(`Adjectives: [powerful, deadly]`);
console.log(`Category: ${result2.category}`);
console.log(`Confidence: ${result2.confidence}`);
console.log(`Inference method: ${result2.inferenceMethod}`);
console.log(`Description: ${result2.description}`);

// Example 3: Telepathic helmet (magic prefix)
console.log('\n=== Example 3: Telepathic Helmet ===');
const result3 = generator.inferObject('telepathichelmet', []);
console.log(`Noun: "telepathichelmet"`);
console.log(`Category: ${result3.category}`);
console.log(`Confidence: ${result3.confidence}`);
console.log(`Inference method: ${result3.inferenceMethod}`);
console.log(`Description: ${result3.description}`);
console.log(`Traits: ${result3.baseProperties.traits?.join(', ')}`);

// Example 4: Antigravity boots (anti- prefix)
console.log('\n=== Example 4: Antigravity Boots ===');
const result4 = generator.inferObject('antigravityboots', []);
console.log(`Noun: "antigravityboots"`);
console.log(`Category: ${result4.category}`);
console.log(`Confidence: ${result4.confidence}`);
console.log(`Inference method: ${result4.inferenceMethod}`);
console.log(`Description: ${result4.description}`);
console.log(`Can be worn: ${result4.baseProperties.can_be_worn}`);
console.log(`Traits: ${result4.baseProperties.traits?.join(', ')}`);

// Example 5: Compound word with weapon component
console.log('\n=== Example 5: Laser Sword ===');
const result5 = generator.inferObject('lasersword', []);
console.log(`Noun: "lasersword"`);
console.log(`Category: ${result5.category}`);
console.log(`Confidence: ${result5.confidence}`);
console.log(`Inference method: ${result5.inferenceMethod}`);
console.log(`Is sharp: ${result5.baseProperties.is_sharp}`);
console.log(`Damage: ${result5.baseProperties.damage}`);
console.log(`Allowed actions: ${result5.allowedActions.join(', ')}`);

// Example 6: Compound word with armor component
console.log('\n=== Example 6: Cyber Helmet ===');
const result6 = generator.inferObject('cyberhelmet', []);
console.log(`Noun: "cyberhelmet"`);
console.log(`Category: ${result6.category}`);
console.log(`Confidence: ${result6.confidence}`);
console.log(`Inference method: ${result6.inferenceMethod}`);
console.log(`Can be worn: ${result6.baseProperties.can_be_worn}`);
console.log(`Traits: ${result6.baseProperties.traits?.join(', ')}`);

// Example 7: Magical adjective inference
console.log('\n=== Example 7: Enchanted Amulet (Magical) ===');
const result7 = generator.inferObject('amulet', ['enchanted', 'mystical']);
console.log(`Noun: "amulet"`);
console.log(`Adjectives: [enchanted, mystical]`);
console.log(`Category: ${result7.category}`);
console.log(`Confidence: ${result7.confidence}`);
console.log(`Inference method: ${result7.inferenceMethod}`);
console.log(`Description: ${result7.description}`);

// Example 8: Weapon adjective inference
console.log('\n=== Example 8: Deadly Widget (Weapon) ===');
const result8 = generator.inferObject('widget', ['deadly', 'sharp']);
console.log(`Noun: "widget"`);
console.log(`Adjectives: [deadly, sharp]`);
console.log(`Category: ${result8.category}`);
console.log(`Confidence: ${result8.confidence}`);
console.log(`Inference method: ${result8.inferenceMethod}`);
console.log(`Damage: ${result8.baseProperties.damage}`);

// Example 9: Tech adjective inference
console.log('\n=== Example 9: Quantum Gadget (Tech) ===');
const result9 = generator.inferObject('gadget', ['quantum', 'advanced']);
console.log(`Noun: "gadget"`);
console.log(`Adjectives: [quantum, advanced]`);
console.log(`Category: ${result9.category}`);
console.log(`Confidence: ${result9.confidence}`);
console.log(`Inference method: ${result9.inferenceMethod}`);
console.log(`Traits: ${result9.baseProperties.traits?.join(', ')}`);

// Example 10: Word ending in -inator
console.log('\n=== Example 10: Doofinator (Suffix -inator) ===');
const result10 = generator.inferObject('doofinator', []);
console.log(`Noun: "doofinator"`);
console.log(`Category: ${result10.category}`);
console.log(`Confidence: ${result10.confidence}`);
console.log(`Inference method: ${result10.inferenceMethod}`);
console.log(`Description: ${result10.description}`);

// Example 11: Word ending in -er
console.log('\n=== Example 11: Flibberter ===');
const result11 = generator.inferObject('flibberter', []);
console.log(`Noun: "flibberter"`);
console.log(`Category: ${result11.category}`);
console.log(`Confidence: ${result11.confidence}`);
console.log(`Inference method: ${result11.inferenceMethod}`);

// Example 12: Completely unknown with no clues
console.log('\n=== Example 12: Completely Unknown - Zorblax ===');
const result12 = generator.inferObject('zorblax', []);
console.log(`Noun: "zorblax"`);
console.log(`Adjectives: none`);
console.log(`Category: ${result12.category}`);
console.log(`Confidence: ${result12.confidence}`);
console.log(`Inference method: ${result12.inferenceMethod}`);
console.log(`Description: ${result12.description}`);
console.log(`Allowed actions: ${result12.allowedActions.join(', ')}`);

// Example 13: Nano prefix
console.log('\n=== Example 13: Nano Machine ===');
const result13 = generator.inferObject('nanomachine', []);
console.log(`Noun: "nanomachine"`);
console.log(`Category: ${result13.category}`);
console.log(`Confidence: ${result13.confidence}`);
console.log(`Inference method: ${result13.inferenceMethod}`);
console.log(`Traits: ${result13.baseProperties.traits?.join(', ')}`);

// Example 14: Crystal compound
console.log('\n=== Example 14: Power Crystal ===');
const result14 = generator.inferObject('powercrystal', []);
console.log(`Noun: "powercrystal"`);
console.log(`Category: ${result14.category}`);
console.log(`Confidence: ${result14.confidence}`);
console.log(`Inference method: ${result14.inferenceMethod}`);
console.log(`Can be worn: ${result14.baseProperties.can_be_worn}`);

// Example 15: Ray gun compound
console.log('\n=== Example 15: Freeze Ray ===');
const result15 = generator.inferObject('freezeray', []);
console.log(`Noun: "freezeray"`);
console.log(`Category: ${result15.category}`);
console.log(`Confidence: ${result15.confidence}`);
console.log(`Inference method: ${result15.inferenceMethod}`);
console.log(`Damage: ${result15.baseProperties.damage}`);
console.log(`Allowed actions: ${result15.allowedActions.join(', ')}`);

// Example 16: Armor compound with adjectives
console.log('\n=== Example 16: Legendary Dragon Armor ===');
const result16 = generator.inferObject('dragonarmor', ['legendary', 'enchanted']);
console.log(`Noun: "dragonarmor"`);
console.log(`Adjectives: [legendary, enchanted]`);
console.log(`Category: ${result16.category}`);
console.log(`Confidence: ${result16.confidence}`);
console.log(`Inference method: ${result16.inferenceMethod}`);
console.log(`Traits: ${result16.baseProperties.traits?.join(', ')}`);

// Example 17: Mystic prefix
console.log('\n=== Example 17: Mystic Orb ===');
const result17 = generator.inferObject('mysticorb', []);
console.log(`Noun: "mysticorb"`);
console.log(`Category: ${result17.category}`);
console.log(`Confidence: ${result17.confidence}`);
console.log(`Inference method: ${result17.inferenceMethod}`);

// Example 18: Convert to template
console.log('\n=== Example 18: Converting to Template ===');
const inferred = generator.inferObject('quantumblaster', ['powerful']);
const template = generator.toTemplate(inferred, 'quantumblaster');
console.log(`Template type: ${template.type}`);
console.log(`Template category: ${template.category}`);
console.log(`Template tags: ${template.tags.join(', ')}`);
console.log(`Allowed actions: ${template.allowedActions.join(', ')}`);

// Example 19: Comparison of confidence scores
console.log('\n=== Example 19: Confidence Score Comparison ===');
const testCases = [
  { noun: 'quantumblaster', adjectives: [], label: 'Quantum Blaster (prefix)' },
  { noun: 'doofinator', adjectives: [], label: 'Doofinator (suffix)' },
  { noun: 'lasersword', adjectives: [], label: 'Laser Sword (compound)' },
  { noun: 'widget', adjectives: ['magical'], label: 'Magical Widget (adjective)' },
  { noun: 'zorblax', adjectives: [], label: 'Zorblax (generic)' }
];

testCases.forEach(test => {
  const result = generator.inferObject(test.noun, test.adjectives);
  console.log(`${test.label}: confidence=${result.confidence.toFixed(2)} (${result.inferenceMethod})`);
});

// Example 20: Multiple inference clues
console.log('\n=== Example 20: Multiple Clues - Cyber Blast Gun ===');
const result20 = generator.inferObject('cyberblastgun', ['deadly', 'futuristic']);
console.log(`Noun: "cyberblastgun"`);
console.log(`Adjectives: [deadly, futuristic]`);
console.log(`Category: ${result20.category}`);
console.log(`Confidence: ${result20.confidence}`);
console.log(`Inference method: ${result20.inferenceMethod}`);
console.log(`Traits: ${result20.baseProperties.traits?.join(', ')}`);
console.log(`Note: Has both prefix (cyber), compound (blast, gun), and weapon adjectives`);

console.log('\n=== All Examples Complete ===');
