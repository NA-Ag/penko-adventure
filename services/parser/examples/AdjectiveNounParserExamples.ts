/**
 * Examples demonstrating SCRIBBLENAUTS PARITY 1.2: Adjective-Noun Parsing
 *
 * Shows advanced parsing of object descriptions with various patterns.
 */

import { AdjectiveNounParser } from '../AdjectiveNounParser';
import { Language } from '../../../types';

console.log('=== SCRIBBLENAUTS PARITY 1.2: Adjective-Noun Parsing Examples ===\n');

const parser = new AdjectiveNounParser(Language.ENGLISH);

// Example 1: Simple adjective-noun
console.log('=== Example 1: Simple Pattern ===');
const parse1 = parser.parse('red door');
console.log(`Input: "red door"`);
console.log(`Adjectives: [${parse1.adjectives.join(', ')}]`);
console.log(`Noun: ${parse1.noun}`);
console.log(`Confidence: ${parse1.confidence}`);
console.log(`Parse method: ${parse1.parseMethod}`);

// Example 2: Multiple adjectives
console.log('\n=== Example 2: Multiple Adjectives ===');
const parse2 = parser.parse('big red door');
console.log(`Input: "big red door"`);
console.log(`Adjectives: [${parse2.adjectives.join(', ')}]`);
console.log(`Noun: ${parse2.noun}`);
console.log(`Confidence: ${parse2.confidence}`);
console.log(`Parse method: ${parse2.parseMethod}`);

// Example 3: With article (determiner)
console.log('\n=== Example 3: With Determiner ===');
const parse3 = parser.parse('a big red door');
console.log(`Input: "a big red door"`);
console.log(`Determiners: [${parse3.determiners.join(', ')}]`);
console.log(`Adjectives: [${parse3.adjectives.join(', ')}]`);
console.log(`Noun: ${parse3.noun}`);
console.log(`Confidence: ${parse3.confidence}`);

// Example 4: With intensifier
console.log('\n=== Example 4: With Intensifier ===');
const parse4 = parser.parse('a very sharp sword');
console.log(`Input: "a very sharp sword"`);
console.log(`Determiners: [${parse4.determiners.join(', ')}]`);
console.log(`Intensifiers: [${parse4.intensifiers.join(', ')}]`);
console.log(`Adjectives: [${parse4.adjectives.join(', ')}]`);
console.log(`Noun: ${parse4.noun}`);
console.log(`Confidence: ${parse4.confidence}`);
console.log(`Parse method: ${parse4.parseMethod}`);

// Example 5: Multiple intensifiers
console.log('\n=== Example 5: Multiple Intensifiers ===');
const parse5 = parser.parse('an extremely really big dragon');
console.log(`Input: "an extremely really big dragon"`);
console.log(`Determiners: [${parse5.determiners.join(', ')}]`);
console.log(`Intensifiers: [${parse5.intensifiers.join(', ')}]`);
console.log(`Adjectives: [${parse5.adjectives.join(', ')}]`);
console.log(`Noun: ${parse5.noun}`);

// Example 6: Relative clause - "door that is red"
console.log('\n=== Example 6: Relative Clause Pattern ===');
const parse6 = parser.parse('door that is big and red');
console.log(`Input: "door that is big and red"`);
console.log(`Adjectives: [${parse6.adjectives.join(', ')}]`);
console.log(`Noun: ${parse6.noun}`);
console.log(`Confidence: ${parse6.confidence}`);
console.log(`Parse method: ${parse6.parseMethod}`);

// Example 7: With "the"
console.log('\n=== Example 7: With "the" ===');
const parse7 = parser.parse('the door that is red');
console.log(`Input: "the door that is red"`);
console.log(`Determiners: [${parse7.determiners.join(', ')}]`);
console.log(`Adjectives: [${parse7.adjectives.join(', ')}]`);
console.log(`Noun: ${parse7.noun}`);
console.log(`Parse method: ${parse7.parseMethod}`);

// Example 8: Complex relative clause
console.log('\n=== Example 8: Complex Relative Clause ===');
const parse8 = parser.parse('sword that is sharp and magical');
console.log(`Input: "sword that is sharp and magical"`);
console.log(`Adjectives: [${parse8.adjectives.join(', ')}]`);
console.log(`Noun: ${parse8.noun}`);
console.log(`Parse method: ${parse8.parseMethod}`);

// Example 9: Many adjectives
console.log('\n=== Example 9: Many Adjectives ===');
const parse9 = parser.parse('huge magical golden sharp legendary sword');
console.log(`Input: "huge magical golden sharp legendary sword"`);
console.log(`Adjectives: [${parse9.adjectives.join(', ')}]`);
console.log(`Noun: ${parse9.noun}`);
console.log(`Count: ${parse9.adjectives.length} adjectives`);

// Example 10: Possessive determiner
console.log('\n=== Example 10: Possessive Determiner ===');
const parse10 = parser.parse('my big red sword');
console.log(`Input: "my big red sword"`);
console.log(`Determiners: [${parse10.determiners.join(', ')}]`);
console.log(`Adjectives: [${parse10.adjectives.join(', ')}]`);
console.log(`Noun: ${parse10.noun}`);

// Example 11: Just a noun
console.log('\n=== Example 11: Noun Only ===');
const parse11 = parser.parse('door');
console.log(`Input: "door"`);
console.log(`Adjectives: [${parse11.adjectives.join(', ')}]`);
console.log(`Noun: ${parse11.noun}`);
console.log(`Confidence: ${parse11.confidence}`);

// Example 12: Empty input
console.log('\n=== Example 12: Empty Input ===');
const parse12 = parser.parse('');
console.log(`Input: ""`);
console.log(`Adjectives: [${parse12.adjectives.join(', ')}]`);
console.log(`Noun: ${parse12.noun}`);
console.log(`Confidence: ${parse12.confidence}`);

// Example 13: Demonstrative determiner
console.log('\n=== Example 13: Demonstrative Determiner ===');
const parse13 = parser.parse('that big door');
console.log(`Input: "that big door"`);
console.log(`Determiners: [${parse13.determiners.join(', ')}]`);
console.log(`Adjectives: [${parse13.adjectives.join(', ')}]`);
console.log(`Noun: ${parse13.noun}`);

// Example 14: Parse multiple objects
console.log('\n=== Example 14: Multiple Objects ===');
const parseMultiple = parser.parseMultiple('big red door and tiny sword');
console.log(`Input: "big red door and tiny sword"`);
parseMultiple.forEach((parse, index) => {
  console.log(`  Object ${index + 1}:`);
  console.log(`    Adjectives: [${parse.adjectives.join(', ')}]`);
  console.log(`    Noun: ${parse.noun}`);
});

// Example 15: Comma-separated objects
console.log('\n=== Example 15: Comma-Separated Objects ===');
const parseComma = parser.parseMultiple('red door, blue window, green gate');
console.log(`Input: "red door, blue window, green gate"`);
parseComma.forEach((parse, index) => {
  console.log(`  Object ${index + 1}:`);
  console.log(`    Adjectives: [${parse.adjectives.join(', ')}]`);
  console.log(`    Noun: ${parse.noun}`);
});

// Example 16: Word validation - known adjectives
console.log('\n=== Example 16: Adjective Validation ===');
const testWords = ['red', 'xyz', 'magical', 'florp', 'tiny'];
testWords.forEach(word => {
  const isKnown = parser.isKnownAdjective(word);
  console.log(`"${word}" is ${isKnown ? 'KNOWN' : 'UNKNOWN'} adjective`);
});

// Example 17: Word validation - known nouns
console.log('\n=== Example 17: Noun Validation ===');
const testNouns = ['door', 'flibbertigibbet', 'sword', 'widget', 'dragon'];
testNouns.forEach(word => {
  const isKnown = parser.isKnownNoun(word);
  console.log(`"${word}" is ${isKnown ? 'KNOWN' : 'UNKNOWN'} noun`);
});

// Example 18: Parse validation
console.log('\n=== Example 18: Parse Validation ===');
const validParse = parser.parse('red door');
const invalidParse = parser.parse('');
console.log(`"red door" is ${parser.isValidParse(validParse) ? 'VALID' : 'INVALID'} parse`);
console.log(`"" is ${parser.isValidParse(invalidParse) ? 'VALID' : 'INVALID'} parse`);

// Example 19: Complex pattern with "which"
console.log('\n=== Example 19: Relative Clause with "which" ===');
const parse19 = parser.parse('the sword which is sharp and deadly');
console.log(`Input: "the sword which is sharp and deadly"`);
console.log(`Determiners: [${parse19.determiners.join(', ')}]`);
console.log(`Adjectives: [${parse19.adjectives.join(', ')}]`);
console.log(`Noun: ${parse19.noun}`);
console.log(`Parse method: ${parse19.parseMethod}`);

// Example 20: Quantifier determiners
console.log('\n=== Example 20: Quantifier Determiners ===');
const parse20 = parser.parse('several small dragons');
console.log(`Input: "several small dragons"`);
console.log(`Determiners: [${parse20.determiners.join(', ')}]`);
console.log(`Adjectives: [${parse20.adjectives.join(', ')}]`);
console.log(`Noun: ${parse20.noun}`);

// Example 21: Intensifier + adjective combination
console.log('\n=== Example 21: Intensifier Combinations ===');
const parse21 = parser.parse('super ultra mega big sword');
console.log(`Input: "super ultra mega big sword"`);
console.log(`Intensifiers: [${parse21.intensifiers.join(', ')}]`);
console.log(`Adjectives: [${parse21.adjectives.join(', ')}]`);
console.log(`Noun: ${parse21.noun}`);

// Example 22: Material adjectives
console.log('\n=== Example 22: Material Adjectives ===');
const parse22 = parser.parse('wooden iron steel door');
console.log(`Input: "wooden iron steel door"`);
console.log(`Adjectives: [${parse22.adjectives.join(', ')}]`);
console.log(`Noun: ${parse22.noun}`);
console.log(`Note: Multiple material adjectives detected`);

// Example 23: Checking all known adjectives
console.log('\n=== Example 23: Known Adjective Categories ===');
const adjectiveCategories = {
  'Colors': ['red', 'blue', 'crimson', 'azure'],
  'Sizes': ['tiny', 'huge', 'gigantic', 'miniature'],
  'Materials': ['wooden', 'iron', 'glass', 'crystal'],
  'Qualities': ['sharp', 'dull', 'strong', 'weak'],
  'Magic': ['magical', 'enchanted', 'cursed', 'blessed']
};

Object.entries(adjectiveCategories).forEach(([category, words]) => {
  const knownCount = words.filter(w => parser.isKnownAdjective(w)).length;
  console.log(`${category}: ${knownCount}/${words.length} recognized`);
});

// Example 24: Confidence scoring
console.log('\n=== Example 24: Confidence Comparison ===');
const testCases = [
  'door',
  'red door',
  'big red door',
  'door that is red',
  'a very big red door',
  'super ultra mega extremely big red door'
];

testCases.forEach(input => {
  const parse = parser.parse(input);
  console.log(`"${input}"`);
  console.log(`  Confidence: ${parse.confidence.toFixed(2)} (${parse.parseMethod})`);
});

// Example 25: Edge cases
console.log('\n=== Example 25: Edge Cases ===');
const edgeCases = [
  'the the the door',  // Multiple determiners
  'and and door',       // Multiple conjunctions
  'very very very big door',  // Multiple intensifiers
  'door door door'      // Multiple nouns?
];

edgeCases.forEach(input => {
  const parse = parser.parse(input);
  console.log(`Input: "${input}"`);
  console.log(`  Result: adjectives=[${parse.adjectives.join(', ')}], noun="${parse.noun}"`);
});

console.log('\n=== All Examples Complete ===');
