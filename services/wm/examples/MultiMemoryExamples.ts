/**
 * MultiMemoryExamples - FACADE 5.4
 *
 * Examples demonstrating multiple memory spaces for agents.
 *
 * Memory Space Types:
 * - Agent Memory: Private beliefs/perceptions (can be false)
 * - Shared Memory: Objective facts known to all
 * - World Memory: Global world state
 *
 * This enables:
 * - NPCs with false beliefs
 * - Private vs. shared knowledge
 * - Objective vs. subjective reality
 * - Agent-specific perceptions
 */

import { LocationWME, StateWME, RelationWME, BeliefWME, InventoryWME } from '../WME';
import { MultiMemoryManager, MemorySpaceHelper } from '../MultiMemory';

// ===== EXAMPLE 1: Basic Memory Spaces =====

export async function testBasicMemorySpaces(): Promise<void> {
  console.log('\n===== Example 1: Basic Memory Spaces =====\n');

  const mm = new MultiMemoryManager({ debug: false });

  console.log('--- Three memory spaces ---');
  console.log('1. Agent Memory: Private beliefs for each agent');
  console.log('2. Shared Memory: Objective facts known to all');
  console.log('3. World Memory: Global world state');

  console.log('\n--- Add fact to shared memory ---');
  mm.assertSharedFact(new LocationWME('door', 'tavern'));
  mm.assertSharedFact(new StateWME('door', 'locked', true));
  console.log('Shared: Door is locked (objective fact)');

  console.log('\n--- Add fact to world memory ---');
  mm.assertWorldState(new StateWME('world', 'timeOfDay', 'night'));
  console.log('World: Time is night (global state)');

  console.log('\n--- Add beliefs to agent memory ---');
  mm.assertAgentBelief('player', new BeliefWME('player', 'door_is_open', 0.8, true));
  console.log('Player believes: Door is open (false belief!)');

  console.log('\n--- Check beliefs vs. reality ---');
  console.log(`Player believes door is open: ${mm.doesAgentBelieve('player', {
    type: 'Belief',
    attributes: { belief: 'door_is_open' },
  })}`);

  console.log(`Door actually locked (shared): ${mm.isObjectivelyTrue({
    type: 'State',
    attributes: { entity: 'door', state: 'locked', value: true },
  })}`);

  console.log('\nExpected: Separate memory spaces for agents, shared facts, and world state');

  mm.destroy();
}

// ===== EXAMPLE 2: False Beliefs =====

export async function testFalseBeliefs(): Promise<void> {
  console.log('\n===== Example 2: False Beliefs =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Objective Reality (Shared Memory) ---');
  mm.assertSharedFact(new RelationWME('player', 'alignment', 'world', 'good'));
  console.log('Reality: Player is good');

  console.log('\n--- NPC False Belief (Agent Memory) ---');
  mm.assertAgentBelief('guard', new BeliefWME('guard', 'player_is_evil', 0.9, true));
  console.log('Guard believes: Player is evil (FALSE!)');

  console.log('\n--- Check discrepancy ---');
  const discrepancy = mm.getBeliefDiscrepancies('guard', {
    type: 'Belief',
    attributes: { belief: 'player_is_evil' },
  });

  console.log(`Guard believes player is evil: ${discrepancy.agentBelieves}`);
  console.log(`Objectively true: ${discrepancy.objectivelyTrue}`);
  console.log(`Discrepancy (false belief): ${discrepancy.discrepancy}`);

  console.log('\n--- Guard acts on false belief ---');
  console.log('Guard: "Stop right there, evil-doer!"');

  console.log('\n--- Player proves innocence, correct belief ---');
  const falseBelief = mm.getAgentMemory('guard').findOne({
    type: 'Belief',
    attributes: { belief: 'player_is_evil' },
  });

  mm.correctAgentBelief(
    'guard',
    falseBelief!,
    new BeliefWME('guard', 'player_is_good', 0.8, true)
  );

  console.log('Guard now believes: Player is good');

  console.log('\nExpected: NPCs can have false beliefs that differ from reality');

  mm.destroy();
}

// ===== EXAMPLE 3: Private vs. Shared Knowledge =====

export async function testPrivateSharedKnowledge(): Promise<void> {
  console.log('\n===== Example 3: Private vs. Shared Knowledge =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Shared Knowledge (everyone knows) ---');
  mm.assertSharedFact(new LocationWME('treasure', 'cave'));
  console.log('Shared: Treasure is in cave (common knowledge)');

  console.log('\n--- Private Knowledge (only player knows) ---');
  mm.assertAgentBelief('player', new StateWME('treasure', 'trapped', true));
  console.log('Player knows: Treasure is trapped (private knowledge)');

  console.log('\n--- NPC does not know about trap ---');
  const npcKnowsTrap = mm.doesAgentBelieve('thief', {
    type: 'State',
    attributes: { entity: 'treasure', state: 'trapped' },
  });
  console.log(`Thief knows about trap: ${npcKnowsTrap}`);

  console.log('\n--- Thief only knows shared knowledge ---');
  const thiefKnowsLocation = mm.queryAcrossSpaces('thief', {
    type: 'Location',
    attributes: { entity: 'treasure' },
  });
  console.log(`Thief knows treasure location: ${thiefKnowsLocation.all.length > 0}`);

  console.log('\n--- Player warns thief (share knowledge) ---');
  const trapKnowledge = mm.getAgentMemory('player').findOne({
    type: 'State',
    attributes: { entity: 'treasure', state: 'trapped' },
  });

  mm.shareKnowledgeWithAgent('thief', trapKnowledge!);
  console.log('Shared trap knowledge with thief');

  const thiefKnowsTrapNow = mm.doesAgentBelieve('thief', {
    type: 'State',
    attributes: { entity: 'treasure', state: 'trapped' },
  });
  console.log(`Thief now knows about trap: ${thiefKnowsTrapNow}`);

  console.log('\nExpected: Agents have private knowledge separate from shared knowledge');

  mm.destroy();
}

// ===== EXAMPLE 4: Agent Knowledge (Agent + Shared + World) =====

export async function testAgentKnowledge(): Promise<void> {
  console.log('\n===== Example 4: Agent Knowledge (Combined View) =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Setup memories ---');
  mm.assertAgentBelief('npc', new BeliefWME('npc', 'player_is_friendly', 0.7, true));
  mm.assertSharedFact(new LocationWME('player', 'plaza'));
  mm.assertWorldState(new StateWME('world', 'weather', 'sunny'));

  console.log('Agent memory: NPC believes player is friendly');
  console.log('Shared memory: Player is in plaza');
  console.log('World memory: Weather is sunny');

  console.log('\n--- What NPC knows (all three combined) ---');
  const npcKnowledge = mm.getAgentKnowledge('npc');
  console.log(`NPC knows ${npcKnowledge.length} facts total:`);
  npcKnowledge.forEach(wme => console.log(`  - ${wme.toString()}`));

  console.log('\n--- Query across all spaces ---');
  const locationQuery = mm.queryAcrossSpaces('npc', { type: 'Location' });
  console.log('Location facts:');
  console.log(`  Agent: ${locationQuery.agent.length}`);
  console.log(`  Shared: ${locationQuery.shared.length}`);
  console.log(`  World: ${locationQuery.world.length}`);
  console.log(`  Total: ${locationQuery.all.length}`);

  console.log('\nExpected: Agents see combination of private + shared + world knowledge');

  mm.destroy();
}

// ===== EXAMPLE 5: Multiple NPCs with Different Beliefs =====

export async function testMultipleNPCBeliefs(): Promise<void> {
  console.log('\n===== Example 5: Multiple NPCs with Different Beliefs =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Setup: Three NPCs, different beliefs about player ---');

  mm.assertAgentBelief('guard', new BeliefWME('guard', 'player_is_criminal', 0.8, true));
  console.log('Guard believes: Player is criminal');

  mm.assertAgentBelief('merchant', new BeliefWME('merchant', 'player_is_trustworthy', 0.9, true));
  console.log('Merchant believes: Player is trustworthy');

  mm.assertAgentBelief('thief', new BeliefWME('thief', 'player_is_ally', 0.6, true));
  console.log('Thief believes: Player is ally');

  console.log('\n--- Reality (Shared Memory) ---');
  mm.assertSharedFact(new StateWME('player', 'reputation', 'neutral'));
  console.log('Reality: Player has neutral reputation');

  console.log('\n--- Each NPC sees player differently ---');
  console.log(`Guard: ${mm.doesAgentBelieve('guard', {
    type: 'Belief',
    attributes: { belief: 'player_is_criminal' },
  }) ? 'Criminal!' : 'Not criminal'}`);

  console.log(`Merchant: ${mm.doesAgentBelieve('merchant', {
    type: 'Belief',
    attributes: { belief: 'player_is_trustworthy' },
  }) ? 'Trustworthy' : 'Not trustworthy'}`);

  console.log(`Thief: ${mm.doesAgentBelieve('thief', {
    type: 'Belief',
    attributes: { belief: 'player_is_ally' },
  }) ? 'Ally' : 'Not ally'}`);

  console.log('\n--- Find agents who believe player is trustworthy ---');
  const believers = MemorySpaceHelper.getAgentsWhoBelieve(mm, {
    type: 'Belief',
    attributes: { belief: 'player_is_trustworthy' },
  });
  console.log(`Agents who trust player: ${believers.join(', ')}`);

  console.log('\nExpected: Different NPCs have different subjective beliefs');

  mm.destroy();
}

// ===== EXAMPLE 6: Teaching and Forgetting =====

export async function testTeachingForgetting(): Promise<void> {
  console.log('\n===== Example 6: Teaching and Forgetting =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- NPC does not know secret ---');
  const knowsSecret = mm.doesAgentBelieve('npc', {
    type: 'State',
    attributes: { entity: 'vault', state: 'code' },
  });
  console.log(`NPC knows vault code: ${knowsSecret}`);

  console.log('\n--- Teach NPC the vault code ---');
  mm.teachAgent('npc', new StateWME('vault', 'code', '1234'));
  console.log('Taught NPC: Vault code is 1234');

  const knowsSecretNow = mm.doesAgentBelieve('npc', {
    type: 'State',
    attributes: { entity: 'vault', state: 'code' },
  });
  console.log(`NPC knows vault code: ${knowsSecretNow}`);

  console.log('\n--- NPC gets mind-wiped, forgets code ---');
  const vaultCode = mm.getAgentMemory('npc').findOne({
    type: 'State',
    attributes: { entity: 'vault', state: 'code' },
  });

  mm.makeAgentForget('npc', vaultCode!);
  console.log('NPC forgets vault code');

  const knowsSecretAfter = mm.doesAgentBelieve('npc', {
    type: 'State',
    attributes: { entity: 'vault', state: 'code' },
  });
  console.log(`NPC knows vault code: ${knowsSecretAfter}`);

  console.log('\nExpected: Can teach agents knowledge and make them forget');

  mm.destroy();
}

// ===== EXAMPLE 7: Broadcast to All Agents =====

export async function testBroadcast(): Promise<void> {
  console.log('\n===== Example 7: Broadcast to All Agents =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Create multiple NPCs ---');
  mm.getAgentMemory('npc1');
  mm.getAgentMemory('npc2');
  mm.getAgentMemory('npc3');

  console.log(`Agents: ${mm.getAgentIds().join(', ')}`);

  console.log('\n--- Broadcast announcement to all ---');
  const announcement = new StateWME('world', 'alarm', true);
  MemorySpaceHelper.broadcastToAllAgents(mm, announcement);
  console.log('Broadcasted: Alarm is sounding!');

  console.log('\n--- Check if all agents heard it ---');
  for (const agentId of mm.getAgentIds()) {
    const heard = mm.doesAgentBelieve(agentId, {
      type: 'State',
      attributes: { entity: 'world', state: 'alarm' },
    });
    console.log(`${agentId} heard alarm: ${heard}`);
  }

  console.log('\nExpected: Broadcast knowledge to all agents at once');

  mm.destroy();
}

// ===== EXAMPLE 8: Conflicting Beliefs Between Agents =====

export async function testConflictingBeliefs(): Promise<void> {
  console.log('\n===== Example 8: Conflicting Beliefs Between Agents =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Two witnesses, different accounts ---');
  mm.assertAgentBelief('witness1', new BeliefWME('witness1', 'culprit_is_merchant', 0.9, true));
  console.log('Witness 1 believes: Merchant is culprit');

  mm.assertAgentBelief('witness2', new BeliefWME('witness2', 'culprit_is_guard', 0.9, true));
  console.log('Witness 2 believes: Guard is culprit');

  console.log('\n--- Check for conflict ---');
  const conflict1 = MemorySpaceHelper.getConflictingBeliefs(mm, 'witness1', 'witness2', {
    type: 'Belief',
    attributes: { belief: 'culprit_is_merchant' },
  });

  console.log(`Witness 1 believes merchant is culprit: ${conflict1.agent1Believes}`);
  console.log(`Witness 2 believes merchant is culprit: ${conflict1.agent2Believes}`);
  console.log(`Conflict: ${conflict1.conflict}`);

  console.log('\nExpected: Can detect conflicting beliefs between agents');

  mm.destroy();
}

// ===== EXAMPLE 9: Sync Agent with Reality =====

export async function testSyncWithReality(): Promise<void> {
  console.log('\n===== Example 9: Sync Agent with Reality =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Reality: Door is unlocked ---');
  mm.assertSharedFact(new StateWME('door', 'locked', false));

  console.log('\n--- NPC believes door is locked (outdated) ---');
  mm.assertAgentBelief('npc', new BeliefWME('npc', 'door_is_locked', 0.9, true));

  console.log(`NPC believes door locked: ${mm.doesAgentBelieve('npc', {
    type: 'Belief',
    attributes: { belief: 'door_is_locked' },
  })}`);

  console.log('\n--- Sync NPC belief with reality ---');
  MemorySpaceHelper.syncAgentWithReality(mm, 'npc', {
    type: 'State',
    attributes: { entity: 'door', state: 'locked' },
  });

  console.log(`NPC now knows door is unlocked: ${mm.doesAgentBelieve('npc', {
    type: 'State',
    attributes: { entity: 'door', state: 'locked', value: false },
  })}`);

  console.log('\nExpected: Can synchronize agent beliefs with objective reality');

  mm.destroy();
}

// ===== EXAMPLE 10: Memory Statistics =====

export async function testMemoryStatistics(): Promise<void> {
  console.log('\n===== Example 10: Memory Statistics =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Populate memories ---');
  mm.assertAgentBelief('npc1', new BeliefWME('npc1', 'test', 0.5, true));
  mm.assertAgentBelief('npc1', new BeliefWME('npc1', 'test2', 0.5, true));
  mm.assertAgentBelief('npc2', new BeliefWME('npc2', 'test', 0.5, true));

  mm.assertSharedFact(new LocationWME('player', 'plaza'));
  mm.assertSharedFact(new LocationWME('npc1', 'plaza'));

  mm.assertWorldState(new StateWME('world', 'time', 'day'));
  mm.assertWorldState(new StateWME('world', 'weather', 'sunny'));
  mm.assertWorldState(new StateWME('world', 'season', 'summer'));

  console.log('\n--- Statistics ---');
  const stats = mm.getStats();
  console.log(`Total agents: ${stats.agents}`);
  console.log(`Shared facts: ${stats.sharedFacts}`);
  console.log(`World facts: ${stats.worldFacts}`);
  console.log(`Total facts: ${stats.totalFacts}`);

  console.log('\nAgent memories:');
  for (const [agentId, count] of Object.entries(stats.agentMemories)) {
    console.log(`  ${agentId}: ${count} facts`);
  }

  console.log('\nExpected: Comprehensive statistics across all memory spaces');

  mm.destroy();
}

// ===== EXAMPLE 11: Export/Import All Memories =====

export async function testExportImport(): Promise<void> {
  console.log('\n===== Example 11: Export/Import All Memories =====\n');

  const mm1 = new MultiMemoryManager();

  console.log('--- Session 1: Create memories ---');
  mm1.assertAgentBelief('player', new BeliefWME('player', 'test', 0.5, true));
  mm1.assertSharedFact(new LocationWME('player', 'plaza'));
  mm1.assertWorldState(new StateWME('world', 'time', 'day'));

  console.log(`Session 1 total facts: ${mm1.getStats().totalFacts}`);

  console.log('\n--- Export all memories ---');
  const saveData = mm1.exportAll();
  const saveString = JSON.stringify(saveData);
  console.log(`Save data size: ${saveString.length} characters`);

  console.log('\n--- Session 2: New game ---');
  const mm2 = new MultiMemoryManager();
  console.log(`Session 2 total facts: ${mm2.getStats().totalFacts}`);

  console.log('\n--- Import memories ---');
  mm2.importAll(JSON.parse(saveString));
  console.log(`Session 2 total facts after import: ${mm2.getStats().totalFacts}`);

  console.log('\nExpected: All memory spaces persist across sessions');

  mm1.destroy();
  mm2.destroy();
}

// ===== EXAMPLE 12: Practical Use Case - Interrogation =====

export async function testPracticalInterrogation(): Promise<void> {
  console.log('\n===== Example 12: Practical Use Case - Interrogation =====\n');

  const mm = new MultiMemoryManager();

  console.log('--- Setup: Crime scene investigation ---');
  mm.assertSharedFact(new StateWME('crime', 'victim', 'merchant'));
  mm.assertSharedFact(new LocationWME('crime', 'marketplace'));
  console.log('Reality: Merchant murdered in marketplace');

  console.log('\n--- Suspect 1: Knows they did it (guilty) ---');
  mm.assertAgentBelief('suspect1', new BeliefWME('suspect1', 'i_am_guilty', 1.0, true));
  mm.assertAgentBelief('suspect1', new StateWME('crime', 'weapon', 'dagger'));
  console.log('Suspect 1 knows: Used dagger (only killer knows!)');

  console.log('\n--- Suspect 2: Believes Suspect 1 did it (witness) ---');
  mm.assertAgentBelief('suspect2', new BeliefWME('suspect2', 'suspect1_is_guilty', 0.8, true));
  console.log('Suspect 2 believes: Suspect 1 is guilty');

  console.log('\n--- Suspect 3: No knowledge ---');
  mm.getAgentMemory('suspect3'); // Empty memory
  console.log('Suspect 3 knows: Nothing (alibi?)');

  console.log('\n--- Detective checks what each suspect knows ---');

  const suspect1Knowledge = mm.getAgentKnowledge('suspect1').length;
  console.log(`Suspect 1 knows ${suspect1Knowledge} facts (including private knowledge of weapon)`);

  const suspect2Knowledge = mm.getAgentKnowledge('suspect2').length;
  console.log(`Suspect 2 knows ${suspect2Knowledge} facts (no private knowledge of weapon)`);

  const suspect3Knowledge = mm.getAgentKnowledge('suspect3').length;
  console.log(`Suspect 3 knows ${suspect3Knowledge} facts (only shared facts)`);

  console.log('\n--- Check: Who knows about the weapon? ---');
  const knowsWeapon = (agentId: string) =>
    mm.doesAgentBelieve(agentId, {
      type: 'State',
      attributes: { entity: 'crime', state: 'weapon' },
    });

  console.log(`Suspect 1 knows weapon: ${knowsWeapon('suspect1')} (GUILTY!)`);
  console.log(`Suspect 2 knows weapon: ${knowsWeapon('suspect2')}`);
  console.log(`Suspect 3 knows weapon: ${knowsWeapon('suspect3')}`);

  console.log('\nExpected: Detective uses memory analysis to find guilty party');

  mm.destroy();
}

// ===== RUN ALL EXAMPLES =====

export async function runAllMultiMemoryExamples(): Promise<void> {
  await testBasicMemorySpaces();
  await new Promise(r => setTimeout(r, 500));

  await testFalseBeliefs();
  await new Promise(r => setTimeout(r, 500));

  await testPrivateSharedKnowledge();
  await new Promise(r => setTimeout(r, 500));

  await testAgentKnowledge();
  await new Promise(r => setTimeout(r, 500));

  await testMultipleNPCBeliefs();
  await new Promise(r => setTimeout(r, 500));

  await testTeachingForgetting();
  await new Promise(r => setTimeout(r, 500));

  await testBroadcast();
  await new Promise(r => setTimeout(r, 500));

  await testConflictingBeliefs();
  await new Promise(r => setTimeout(r, 500));

  await testSyncWithReality();
  await new Promise(r => setTimeout(r, 500));

  await testMemoryStatistics();
  await new Promise(r => setTimeout(r, 500));

  await testExportImport();
  await new Promise(r => setTimeout(r, 500));

  await testPracticalInterrogation();
}

// Run if executed directly
if (require.main === module) {
  runAllMultiMemoryExamples().catch(console.error);
}
