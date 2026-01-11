/**
 * ReflectiveMemory Examples - FACADE 5.5
 *
 * Demonstrates WME reflection system for meta-reasoning.
 */

import {
  ReflectiveWorkingMemory,
  BeliefAboutWME,
  KnowledgeAboutBeliefWME,
  TheoryOfMind,
  ReflectiveDialogue,
  ReflectiveHelpers,
} from '../ReflectiveMemory';
import { WME, LocationWME, StateWME, RelationWME } from '../WME';

console.log('='.repeat(80));
console.log('FACADE 5.5: WME REFLECTION SYSTEM EXAMPLES');
console.log('='.repeat(80));

// ============================================================================
// Example 1: Basic Belief About WME
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 1: Basic Belief About WME');
console.log('='.repeat(80));

const wm1 = new ReflectiveWorkingMemory();

// Create a fact about the world
const dragonLocation = new LocationWME('dragon', 'Dark Forest');
wm1.assert(dragonLocation);

// Guard believes the dragon is in the forest
const guardBelief = wm1.assertBeliefAbout(
  'guard',
  'dragon is in Dark Forest',
  0.9,
  dragonLocation.id
);

console.log('\nFact:', dragonLocation.toString());
console.log('Guard belief:', ReflectiveDialogue.generateBeliefDialogue(guardBelief, wm1));

// Player believes something different
const playerBelief = wm1.assertBeliefAbout(
  'player',
  'dragon is in Mountains',
  0.7,
  dragonLocation.id
);

console.log('Player belief:', ReflectiveDialogue.generateBeliefDialogue(playerBelief, wm1));

// Check beliefs
console.log('\nBeliefs about dragon location:');
const beliefsAboutDragon = wm1.getBeliefsAbout(dragonLocation.id);
for (const belief of beliefsAboutDragon) {
  console.log(`  - ${belief.getAgent()}: "${belief.getBelief()}" (confidence: ${belief.getConfidence()})`);
}

// ============================================================================
// Example 2: Nested Beliefs (Knowledge About Beliefs)
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 2: Nested Beliefs - "Wizard knows that player believes X"');
console.log('='.repeat(80));

const wm2 = new ReflectiveWorkingMemory();

// Fact: There's treasure in the cave
const treasureLocation = new LocationWME('treasure', 'Hidden Cave');
wm2.assert(treasureLocation);

// Player believes treasure is in the cave
const playerTreasureBelief = wm2.assertBeliefAbout(
  'player',
  'treasure is in Hidden Cave',
  0.8,
  treasureLocation.id
);

// Wizard knows that player believes this
const wizardKnowledge = wm2.assertKnowledgeAboutBelief(
  'wizard',
  'player',
  'believes treasure is in Hidden Cave',
  0.9,
  playerTreasureBelief.id
);

console.log('\nFact:', treasureLocation.toString());
console.log('Player belief:', ReflectiveDialogue.generateBeliefDialogue(playerTreasureBelief, wm2));
console.log('Wizard knowledge:', ReflectiveDialogue.generateKnowledgeDialogue(wizardKnowledge, wm2));

// Check belief chain
console.log('\nBelief chain from wizard knowledge:');
const chain = wm2.getBeliefChain(wizardKnowledge.id);
for (let i = 0; i < chain.length; i++) {
  console.log(`  ${i + 1}. ${chain[i].type} (id: ${chain[i].id.substring(0, 8)}...)`);
}

// ============================================================================
// Example 3: Theory of Mind - Who Believes What?
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 3: Theory of Mind - Who Believes What?');
console.log('='.repeat(80));

const wm3 = new ReflectiveWorkingMemory();
const tom = new TheoryOfMind(wm3);

// Fact: King is in the throne room
const kingLocation = new LocationWME('king', 'Throne Room');
wm3.assert(kingLocation);

// Multiple NPCs have different beliefs
wm3.assertBeliefAbout('guard', 'king is in Throne Room', 1.0, kingLocation.id);
wm3.assertBeliefAbout('thief', 'king is away traveling', 0.6, kingLocation.id);
wm3.assertBeliefAbout('merchant', 'king is in Throne Room', 0.8, kingLocation.id);
wm3.assertBeliefAbout('peasant', 'king is in the gardens', 0.4, kingLocation.id);

console.log('\nWho believes the king is in the Throne Room?');
const believersInThrone = tom.whoBelieves('king is in Throne Room');
console.log('  Believers:', believersInThrone.join(', '));

console.log('\nWho believes the king is traveling?');
const believersTraveling = tom.whoBelieves('king is away');
console.log('  Believers:', believersTraveling.join(', '));

// ============================================================================
// Example 4: Belief Discrepancies
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 4: Belief Discrepancies - Conflicting Beliefs');
console.log('='.repeat(80));

const wm4 = new ReflectiveWorkingMemory();
const tom4 = new TheoryOfMind(wm4);

// Fact: NPC's mood
const npcMood = new StateWME('merchant', 'mood', 'angry');
wm4.assert(npcMood);

// Player believes merchant is friendly
wm4.assertBeliefAbout('player', 'merchant is friendly', 0.7, npcMood.id);

// Guard believes merchant is angry
wm4.assertBeliefAbout('guard', 'merchant is angry', 0.9, npcMood.id);

console.log('\nFact:', npcMood.toString());

const discrepancies = tom4.findBeliefDiscrepancies('player', 'guard');
console.log('\nBelief discrepancies between player and guard:');
for (const d of discrepancies) {
  console.log(
    ReflectiveDialogue.generateDiscrepancyDialogue(d.agentA, d.agentB, d.beliefA, d.beliefB)
  );
  console.log(`  Confidence: ${d.agentA}=${d.confidence.a.toFixed(2)}, ${d.agentB}=${d.confidence.b.toFixed(2)}`);
}

// ============================================================================
// Example 5: Deception Detection
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 5: Deception Detection');
console.log('='.repeat(80));

const wm5 = new ReflectiveWorkingMemory();
const tom5 = new TheoryOfMind(wm5);

// Fact: Sword is magical
const swordState = new StateWME('sword', 'enchantment', 'powerful magic');
wm5.assert(swordState);

// Merchant publicly believes sword is ordinary
const merchantPublicBelief = wm5.assertBeliefAbout(
  'merchant',
  'sword is ordinary',
  0.9,
  swordState.id
);

// But merchant also knows that wizard knows it's magical
const wizardBelief = wm5.assertBeliefAbout('wizard', 'sword is magical', 1.0, swordState.id);
const merchantKnowledge = wm5.assertKnowledgeAboutBelief(
  'merchant',
  'wizard',
  'knows sword is magical',
  0.9,
  wizardBelief.id
);

console.log('\nFact:', swordState.toString());
console.log('Merchant public belief:', merchantPublicBelief.getBelief());
console.log('Merchant knowledge:', merchantKnowledge.getKnowledge());

const isDeceiving = tom5.isLikelyDeceiving('merchant', swordState.id);
console.log('\nIs merchant likely deceiving?', isDeceiving ? 'YES' : 'NO');
console.log(
  'Reasoning: Merchant claims sword is ordinary but knows wizard knows it\'s magical'
);

// ============================================================================
// Example 6: Complex Social Reasoning
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 6: Complex Social Reasoning - Multi-Agent Knowledge');
console.log('='.repeat(80));

const wm6 = new ReflectiveWorkingMemory();
const tom6 = new TheoryOfMind(wm6);

// Fact: Princess is in danger
const princessState = new StateWME('princess', 'status', 'kidnapped');
wm6.assert(princessState);

// King believes princess is safe
const kingBelief = wm6.assertBeliefAbout('king', 'princess is safe', 0.9, princessState.id);

// Knight knows princess is kidnapped
const knightBelief = wm6.assertBeliefAbout('knight', 'princess is kidnapped', 1.0, princessState.id);

// Knight knows that king doesn't know (hasn't told him yet)
const knightKnowledge = wm6.assertKnowledgeAboutBelief(
  'knight',
  'king',
  'believes princess is safe',
  0.9,
  kingBelief.id
);

// Player knows that knight knows about the kidnapping
const playerBelief = wm6.assertBeliefAbout('player', 'princess is kidnapped', 0.8, princessState.id);
const playerKnowledge = wm6.assertKnowledgeAboutBelief(
  'player',
  'knight',
  'knows princess is kidnapped',
  1.0,
  knightBelief.id
);

console.log('\nFact:', princessState.toString());
console.log('\nSocial knowledge network:');
console.log('  - King:', ReflectiveDialogue.generateBeliefDialogue(kingBelief, wm6));
console.log('  - Knight:', ReflectiveDialogue.generateBeliefDialogue(knightBelief, wm6));
console.log('  - Knight:', ReflectiveDialogue.generateKnowledgeDialogue(knightKnowledge, wm6));
console.log('  - Player:', ReflectiveDialogue.generateBeliefDialogue(playerBelief, wm6));
console.log('  - Player:', ReflectiveDialogue.generateKnowledgeDialogue(playerKnowledge, wm6));

// Who knows about the princess?
console.log('\nWho knows about the princess kidnapping?');
const whoKnows = tom6.whoBelieves('princess is kidnapped');
console.log('  Direct knowledge:', whoKnows.join(', '));

// Who knows that someone else knows?
console.log('\nWho knows that knight knows?');
const whoKnowsKnight = tom6.whoKnowsAbout('knight', 'knows princess');
console.log('  Meta-knowledge:', whoKnowsKnight.join(', '));

// ============================================================================
// Example 7: Belief Chain Validation
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 7: Belief Chain Validation');
console.log('='.repeat(80));

const wm7 = new ReflectiveWorkingMemory();

// Create a fact
const artifact = new WME('Artifact', { name: 'Ancient Relic', power: 'healing' });
wm7.assert(artifact);

// Create nested beliefs
const scholarBelief = wm7.assertBeliefAbout(
  'scholar',
  'artifact has healing power',
  0.9,
  artifact.id
);

const wizardKnows = wm7.assertKnowledgeAboutBelief(
  'wizard',
  'scholar',
  'believes artifact heals',
  0.8,
  scholarBelief.id
);

const playerKnows = wm7.assertKnowledgeAboutBelief(
  'player',
  'wizard',
  'knows scholar believes artifact heals',
  0.7,
  wizardKnows.id
);

console.log('\nBelief chain (from deepest to base fact):');
const fullChain = wm7.getBeliefChain(playerKnows.id);
for (let i = 0; i < fullChain.length; i++) {
  const indent = '  '.repeat(i);
  console.log(`${indent}Level ${i + 1}: ${fullChain[i].type}`);
  if (fullChain[i] instanceof BeliefAboutWME) {
    console.log(`${indent}         ${(fullChain[i] as BeliefAboutWME).getAgent()} believes: "${(fullChain[i] as BeliefAboutWME).getBelief()}"`);
  } else if (fullChain[i] instanceof KnowledgeAboutBeliefWME) {
    const k = fullChain[i] as KnowledgeAboutBeliefWME;
    console.log(`${indent}         ${k.getKnower()} knows about ${k.getKnown()}`);
  }
}

// Validate meta-WMEs
console.log('\nValidating meta-WMEs:');
const validation = wm7.validateMetaWMEs();
console.log(`  Valid: ${validation.valid.length}`);
console.log(`  Invalid: ${validation.invalid.length}`);

// ============================================================================
// Example 8: Cascade Deletion
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 8: Cascade Deletion - Remove WME and Dependent Beliefs');
console.log('='.repeat(80));

const wm8 = new ReflectiveWorkingMemory();

// Create base fact
const quest = new WME('Quest', { name: 'Rescue Mission', status: 'active' });
wm8.assert(quest);

// Multiple beliefs about it
wm8.assertBeliefAbout('npc1', 'quest is doable', 0.8, quest.id);
wm8.assertBeliefAbout('npc2', 'quest is too dangerous', 0.6, quest.id);
wm8.assertBeliefAbout('npc3', 'quest is a trap', 0.3, quest.id);

console.log('\nInitial state:');
console.log(`  Total WMEs: ${wm8.getAll().length}`);
console.log(`  Beliefs about quest: ${wm8.getBeliefsAbout(quest.id).length}`);

// Retract quest with cascade (removes all dependent beliefs)
console.log('\nRetracting quest with cascade...');
const retractedCount = wm8.retractWithCascade(quest);
console.log(`  Retracted ${retractedCount} WMEs (quest + beliefs)`);

console.log('\nFinal state:');
console.log(`  Total WMEs: ${wm8.getAll().length}`);
console.log(`  Beliefs about quest: ${wm8.getBeliefsAbout(quest.id).length}`);

// ============================================================================
// Example 9: Invalid Reference Cleanup
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 9: Invalid Reference Cleanup');
console.log('='.repeat(80));

const wm9 = new ReflectiveWorkingMemory();

// Create some facts
const fact1 = new WME('Fact', { data: 'fact1' });
const fact2 = new WME('Fact', { data: 'fact2' });
wm9.assert(fact1);
wm9.assert(fact2);

// Create beliefs
wm9.assertBeliefAbout('agent1', 'fact1 is true', 0.9, fact1.id);
wm9.assertBeliefAbout('agent2', 'fact2 is true', 0.9, fact2.id);

console.log('\nInitial state:');
console.log(`  Total WMEs: ${wm9.getAll().length}`);
const val1 = wm9.validateMetaWMEs();
console.log(`  Valid meta-WMEs: ${val1.valid.length}`);
console.log(`  Invalid meta-WMEs: ${val1.invalid.length}`);

// Retract fact1 (but not its belief - creates dangling reference)
wm9.retract(fact1);

console.log('\nAfter retracting fact1:');
console.log(`  Total WMEs: ${wm9.getAll().length}`);
const val2 = wm9.validateMetaWMEs();
console.log(`  Valid meta-WMEs: ${val2.valid.length}`);
console.log(`  Invalid meta-WMEs: ${val2.invalid.length}`);

// Clean up invalid references
const cleaned = wm9.cleanupInvalidMetaWMEs();
console.log('\nCleaning up invalid meta-WMEs...');
console.log(`  Removed ${cleaned} invalid meta-WMEs`);

console.log('\nFinal state:');
console.log(`  Total WMEs: ${wm9.getAll().length}`);
const val3 = wm9.validateMetaWMEs();
console.log(`  Valid meta-WMEs: ${val3.valid.length}`);
console.log(`  Invalid meta-WMEs: ${val3.invalid.length}`);

// ============================================================================
// Example 10: Helper Functions
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 10: Helper Functions');
console.log('='.repeat(80));

const wm10 = new ReflectiveWorkingMemory();

// Create simple belief (not about another WME)
const simpleBelief = ReflectiveHelpers.createSimpleBelief(
  wm10,
  'villager',
  'the sun will rise tomorrow',
  1.0
);
console.log('\nSimple belief:', simpleBelief.toString());

// Create fact
const door = new StateWME('door', 'status', 'locked');
wm10.assert(door);

// Create belief about the door
const beliefAboutDoor = ReflectiveHelpers.createBeliefAbout(
  wm10,
  'thief',
  'door is locked',
  0.95,
  door
);
console.log('Belief about door:', beliefAboutDoor.toString());

// Create nested belief
const nestedBelief = ReflectiveHelpers.createNestedBelief(
  wm10,
  'guard',
  'thief',
  'door is unlocked',
  0.7,
  door
);
console.log('Nested belief:', nestedBelief.toString());

// Get all agents involved
const agents = ReflectiveHelpers.getReflectiveAgents(wm10);
console.log('\nAgents involved in reflective reasoning:', agents.join(', '));

// Export state
const exportedState = ReflectiveHelpers.exportReflectiveState(wm10);
console.log('\nExported reflective state:');
console.log(`  Beliefs: ${exportedState.beliefs.length}`);
console.log(`  Knowledge: ${exportedState.knowledge.length}`);
console.log(`  Valid meta-WMEs: ${exportedState.validation.valid.length}`);

// ============================================================================
// Example 11: Dialogue Generation
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 11: Dialogue Generation from Beliefs');
console.log('='.repeat(80));

const wm11 = new ReflectiveWorkingMemory();

// Create fact about a character
const characterState = new StateWME('mysterious_stranger', 'identity', 'unknown');
wm11.assert(characterState);

// Multiple confidence levels for dialogue variety
const confidences = [0.95, 0.75, 0.5, 0.25];
const agents = ['guard', 'merchant', 'scholar', 'peasant'];

console.log('\nDialogue variations based on confidence:');
for (let i = 0; i < confidences.length; i++) {
  const belief = wm11.assertBeliefAbout(
    agents[i],
    'stranger is a spy',
    confidences[i],
    characterState.id
  );
  const dialogue = ReflectiveDialogue.generateBeliefDialogue(belief, wm11);
  console.log(`  ${dialogue}`);
}

// ============================================================================
// Example 12: Practical Use Case - Murder Mystery
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('Example 12: Practical Use Case - Murder Mystery Investigation');
console.log('='.repeat(80));

const wm12 = new ReflectiveWorkingMemory();
const tom12 = new TheoryOfMind(wm12);

// The crime
const crime = new WME('Crime', {
  type: 'murder',
  victim: 'Lord Blackwood',
  location: 'library',
  time: '11pm',
});
wm12.assert(crime);

// Suspects and their beliefs
console.log('\n--- SUSPECT BELIEFS ---');

// Butler believes gardener did it
const butlerBelief = wm12.assertBeliefAbout(
  'butler',
  'gardener is the murderer',
  0.8,
  crime.id
);
console.log('Butler:', ReflectiveDialogue.generateBeliefDialogue(butlerBelief, wm12));

// Gardener believes butler did it
const gardenerBelief = wm12.assertBeliefAbout(
  'gardener',
  'butler is the murderer',
  0.7,
  crime.id
);
console.log('Gardener:', ReflectiveDialogue.generateBeliefDialogue(gardenerBelief, wm12));

// Maid believes Lady Blackwood did it
const maidBelief = wm12.assertBeliefAbout(
  'maid',
  'Lady Blackwood is the murderer',
  0.6,
  crime.id
);
console.log('Maid:', ReflectiveDialogue.generateBeliefDialogue(maidBelief, wm12));

// Detective knows what everyone believes
console.log('\n--- DETECTIVE KNOWLEDGE ---');

const detectiveKnowsButler = wm12.assertKnowledgeAboutBelief(
  'detective',
  'butler',
  'believes gardener did it',
  1.0,
  butlerBelief.id
);
console.log('Detective:', ReflectiveDialogue.generateKnowledgeDialogue(detectiveKnowsButler, wm12));

const detectiveKnowsGardener = wm12.assertKnowledgeAboutBelief(
  'detective',
  'gardener',
  'believes butler did it',
  1.0,
  gardenerBelief.id
);
console.log('Detective:', ReflectiveDialogue.generateKnowledgeDialogue(detectiveKnowsGardener, wm12));

const detectiveKnowsMaid = wm12.assertKnowledgeAboutBelief(
  'detective',
  'maid',
  'believes Lady Blackwood did it',
  1.0,
  maidBelief.id
);
console.log('Detective:', ReflectiveDialogue.generateKnowledgeDialogue(detectiveKnowsMaid, wm12));

// Analysis
console.log('\n--- ANALYSIS ---');

const suspects = tom12.whoBelieves('is the murderer');
console.log('All suspects mentioned:', [...new Set(suspects.map(s => {
  const beliefs = wm12.query({ type: 'BeliefAboutWME', attributes: { agent: s } });
  if (beliefs.length > 0) {
    const belief = beliefs[0].getAttribute('belief');
    return belief.match(/(\w+) is the murderer/)?.[1];
  }
  return null;
}))].filter(Boolean).join(', '));

// Find contradictions
console.log('\nContradictory beliefs:');
const allSuspects = ['butler', 'gardener', 'maid'];
for (let i = 0; i < allSuspects.length; i++) {
  for (let j = i + 1; j < allSuspects.length; j++) {
    const discrepancies = tom12.findBeliefDiscrepancies(allSuspects[i], allSuspects[j]);
    for (const d of discrepancies) {
      console.log(`  - ${ReflectiveDialogue.generateDiscrepancyDialogue(d.agentA, d.agentB, d.beliefA, d.beliefB)}`);
    }
  }
}

// Detective's summary
console.log('\n--- DETECTIVE SUMMARY ---');
console.log('The detective now has a complete theory of mind:');
console.log('  - Knows what each suspect believes');
console.log('  - Can identify contradictions');
console.log('  - Can reason about who might be lying');
console.log('  - Has meta-knowledge about the social dynamics');

console.log('\n' + '='.repeat(80));
console.log('FACADE 5.5 EXAMPLES COMPLETE');
console.log('='.repeat(80));
