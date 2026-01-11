/**
 * BeatEffectExamples - FACADE 4.5
 *
 * Examples demonstrating beat effects on world state.
 *
 * Beat effects are declarative modifications to the game world:
 * - Spawn NPCs and items
 * - Change locations
 * - Modify relationships and reputation
 * - Unlock areas and abilities
 * - Set quest flags
 *
 * Effects are declarative (not code) - defined as data in beat configuration.
 */

import { WorldState } from '../../abl/WorldState';
import { DramaManager } from '../DramaManager';
import { BeatBuilder, BeatPriority } from '../Beat';
import { PreconditionBuilder } from '../../abl/Precondition';

// ===== EXAMPLE 1: Spawning NPCs =====

export async function testSpawnNPC(): Promise<void> {
  console.log('\n===== Example 1: Spawning NPCs (Merchant Arrives) =====\n');

  const worldState = new WorldState();
  worldState.set('town_square_empty', true);
  worldState.set('day', 1);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Merchant arrives
  const beatMerchantArrives = new BeatBuilder('merchant_arrives', 'Merchant Arrives')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('town_square_empty'))
    .withNarration('A traveling merchant sets up shop in the town square.')
    .withWorldEffect('merchant_spawned', true)
    .withWorldEffect('merchant_location', 'town_square')
    .withWorldEffect('merchant_inventory', ['sword', 'shield', 'potion', 'map'])
    .withWorldEffect('town_square_empty', false)
    .withWorldEffect('merchant_gold', 500)
    .withStoryEffect('affinity', 5)
    .build();

  // Beat: Guard patrol arrives
  const beatGuardArrives = new BeatBuilder('guard_arrives', 'Guard Patrol Arrives')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('City guards begin their patrol of the area.')
    .withWorldEffect('guards_present', true)
    .withWorldEffect('guard_count', 3)
    .withWorldEffect('guard_alert_level', 0)
    .withStoryEffect('tension', 10)
    .build();

  dramaManager.addBeats([beatMerchantArrives, beatGuardArrives]);

  console.log('--- Before beats ---');
  console.log('Town square empty:', worldState.get('town_square_empty'));
  console.log('Merchant spawned:', worldState.get('merchant_spawned') || false);
  console.log('Guards present:', worldState.get('guards_present') || false);

  console.log('\n--- Execute merchant arrives beat ---');
  dramaManager.executeBeat('merchant_arrives');

  console.log('\n--- After merchant arrives ---');
  console.log('Town square empty:', worldState.get('town_square_empty'));
  console.log('Merchant spawned:', worldState.get('merchant_spawned'));
  console.log('Merchant location:', worldState.get('merchant_location'));
  console.log('Merchant inventory:', worldState.get('merchant_inventory'));
  console.log('Merchant gold:', worldState.get('merchant_gold'));

  console.log('\n--- Execute guard arrives beat ---');
  dramaManager.executeBeat('guard_arrives');

  console.log('\n--- After guards arrive ---');
  console.log('Guards present:', worldState.get('guards_present'));
  console.log('Guard count:', worldState.get('guard_count'));
  console.log('Guard alert level:', worldState.get('guard_alert_level'));

  console.log('\nExpected: Merchant spawns with inventory and gold, guards patrol area');
}

// ===== EXAMPLE 2: Spawning Items =====

export async function testSpawnItems(): Promise<void> {
  console.log('\n===== Example 2: Spawning Items =====\n');

  const worldState = new WorldState();
  worldState.set('player_location', 'dungeon_level_1');

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Find treasure chest
  const beatTreasureChest = new BeatBuilder('find_treasure', 'Discover Treasure Chest')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You discover a hidden treasure chest!')
    .withWorldEffect('chest_spawned', true)
    .withWorldEffect('chest_location', 'dungeon_level_1')
    .withWorldEffect('chest_contents', {
      gold: 100,
      items: ['magic_sword', 'health_potion', 'key'],
    })
    .withWorldEffect('chest_locked', false)
    .withStoryEffect('mystery', -10)
    .build();

  // Beat: Legendary weapon appears
  const beatLegendaryWeapon = new BeatBuilder('legendary_weapon', 'Legendary Weapon Appears')
    .withPriority(BeatPriority.HIGH)
    .withNarration('A beam of light reveals an ancient weapon embedded in stone!')
    .withWorldEffect('excalibur_spawned', true)
    .withWorldEffect('excalibur_location', 'altar_room')
    .withWorldEffect('excalibur_enchantments', ['fire_damage', 'unbreakable', 'light'])
    .withWorldEffect('excalibur_power', 150)
    .withStoryEffect('stakes', 20)
    .withStoryEffect('tension', 15)
    .build();

  dramaManager.addBeats([beatTreasureChest, beatLegendaryWeapon]);

  console.log('--- Execute treasure chest beat ---');
  dramaManager.executeBeat('find_treasure');
  console.log('Chest spawned:', worldState.get('chest_spawned'));
  console.log('Chest location:', worldState.get('chest_location'));
  console.log('Chest contents:', worldState.get('chest_contents'));

  console.log('\n--- Execute legendary weapon beat ---');
  dramaManager.executeBeat('legendary_weapon');
  console.log('Excalibur spawned:', worldState.get('excalibur_spawned'));
  console.log('Excalibur location:', worldState.get('excalibur_location'));
  console.log('Excalibur enchantments:', worldState.get('excalibur_enchantments'));
  console.log('Excalibur power:', worldState.get('excalibur_power'));

  console.log('\nExpected: Items spawn with properties and locations');
}

// ===== EXAMPLE 3: Changing Locations =====

export async function testChangeLocations(): Promise<void> {
  console.log('\n===== Example 3: Changing Locations =====\n');

  const worldState = new WorldState();
  worldState.set('player_location', 'village');
  worldState.set('npc_merchant_location', 'town_square');

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Teleport to safety
  const beatTeleport = new BeatBuilder('teleport_safety', 'Teleport to Safety')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('A magic portal opens! You leap through to safety.')
    .withWorldEffect('player_location', 'safe_house')
    .withWorldEffect('portal_used', true)
    .withWorldEffect('previous_location', 'village')
    .withStoryEffect('tension', -30)
    .build();

  // Beat: Chase sequence
  const beatChase = new BeatBuilder('chase_sequence', 'Chase Through City')
    .withPriority(BeatPriority.HIGH)
    .withNarration('You run through the winding streets!')
    .withWorldEffect('player_location', 'alley')
    .withWorldEffect('npc_guard_location', 'alley')
    .withWorldEffect('chase_active', true)
    .withStoryEffect('tension', 40)
    .withStoryEffect('urgency', 30)
    .build();

  // Beat: Merchant moves on
  const beatMerchantLeaves = new BeatBuilder('merchant_leaves', 'Merchant Departs')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('The merchant packs up and heads to the next town.')
    .withWorldEffect('npc_merchant_location', 'highway')
    .withWorldEffect('merchant_available', false)
    .withWorldEffect('merchant_returns_day', 8)
    .build();

  dramaManager.addBeats([beatTeleport, beatChase, beatMerchantLeaves]);

  console.log('--- Initial locations ---');
  console.log('Player location:', worldState.get('player_location'));
  console.log('Merchant location:', worldState.get('npc_merchant_location'));

  console.log('\n--- Execute teleport ---');
  dramaManager.executeBeat('teleport_safety');
  console.log('Player location:', worldState.get('player_location'));
  console.log('Portal used:', worldState.get('portal_used'));
  console.log('Previous location:', worldState.get('previous_location'));

  console.log('\n--- Execute chase ---');
  dramaManager.executeBeat('chase_sequence');
  console.log('Player location:', worldState.get('player_location'));
  console.log('Guard location:', worldState.get('npc_guard_location'));
  console.log('Chase active:', worldState.get('chase_active'));

  console.log('\n--- Execute merchant leaves ---');
  dramaManager.executeBeat('merchant_leaves');
  console.log('Merchant location:', worldState.get('npc_merchant_location'));
  console.log('Merchant available:', worldState.get('merchant_available'));
  console.log('Returns on day:', worldState.get('merchant_returns_day'));

  console.log('\nExpected: Locations change for player and NPCs');
}

// ===== EXAMPLE 4: Modifying Relationships (Betrayal) =====

export async function testModifyRelationships(): Promise<void> {
  console.log('\n===== Example 4: Modifying Relationships (Betrayal) =====\n');

  const worldState = new WorldState();
  worldState.set('npc_betrayer_trust', 75);
  worldState.set('npc_betrayer_relationship', 'ally');

  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      affinity: 80,
      tension: 30,
    },
  });

  // Beat: The betrayal
  const beatBetrayal = new BeatBuilder('betrayal', 'The Betrayal')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('Your trusted ally reveals their true colors. They were working for the enemy all along!')
    .withWorldEffect('npc_betrayer_trust', 0)
    .withWorldEffect('npc_betrayer_relationship', 'enemy')
    .withWorldEffect('npc_betrayer_hostile', true)
    .withWorldEffect('player_betrayed', true)
    .withWorldEffect('betrayal_revealed', true)
    .withWorldEffect('story_twist', 'ally_was_traitor')
    .withStoryEffect('affinity', -60)
    .withStoryEffect('tension', 50)
    .withStoryEffect('stakes', 30)
    .withStoryEffect('mystery', 20)
    .build();

  // Beat: Reconciliation
  const beatReconciliation = new BeatBuilder('reconciliation', 'Forgiveness')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('player_betrayed'))
    .withNarration('After much soul-searching, you decide to forgive them.')
    .withWorldEffect('npc_betrayer_trust', 40)
    .withWorldEffect('npc_betrayer_relationship', 'uneasy_ally')
    .withWorldEffect('npc_betrayer_hostile', false)
    .withWorldEffect('reconciliation_achieved', true)
    .withStoryEffect('affinity', 30)
    .withStoryEffect('tension', -20)
    .withStoryEffect('morality', 25)
    .build();

  dramaManager.addBeats([beatBetrayal, beatReconciliation]);

  console.log('--- Before betrayal ---');
  console.log('Betrayer trust:', worldState.get('npc_betrayer_trust'));
  console.log('Relationship:', worldState.get('npc_betrayer_relationship'));
  console.log('Story values:', dramaManager.getAllStoryValues());

  console.log('\n--- THE BETRAYAL! ---');
  dramaManager.executeBeat('betrayal');
  console.log('Betrayer trust:', worldState.get('npc_betrayer_trust'));
  console.log('Relationship:', worldState.get('npc_betrayer_relationship'));
  console.log('Hostile:', worldState.get('npc_betrayer_hostile'));
  console.log('Betrayal revealed:', worldState.get('betrayal_revealed'));
  console.log('Story twist:', worldState.get('story_twist'));
  console.log('Story values:', dramaManager.getAllStoryValues());

  console.log('\n--- After reconciliation ---');
  dramaManager.executeBeat('reconciliation');
  console.log('Betrayer trust:', worldState.get('npc_betrayer_trust'));
  console.log('Relationship:', worldState.get('npc_betrayer_relationship'));
  console.log('Hostile:', worldState.get('npc_betrayer_hostile'));
  console.log('Story values:', dramaManager.getAllStoryValues());

  console.log('\nExpected: Betrayal reduces trust to 0, changes relationship to enemy');
}

// ===== EXAMPLE 5: Modifying Reputation =====

export async function testModifyReputation(): Promise<void> {
  console.log('\n===== Example 5: Modifying Reputation =====\n');

  const worldState = new WorldState();
  worldState.set('player_reputation', 50);
  worldState.set('player_fame', 30);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Heroic deed
  const beatHeroicDeed = new BeatBuilder('heroic_deed', 'Heroic Deed')
    .withPriority(BeatPriority.HIGH)
    .withNarration('You save the village from the dragon! The people cheer your name!')
    .withWorldEffect('player_reputation', 95)
    .withWorldEffect('player_fame', 80)
    .withWorldEffect('hero_status', true)
    .withWorldEffect('village_saved', true)
    .withWorldEffect('dragon_defeated', true)
    .withWorldEffect('statue_built', true)
    .withStoryEffect('competence', 40)
    .withStoryEffect('stakes', -30)
    .build();

  // Beat: Scandal
  const beatScandal = new BeatBuilder('scandal', 'Public Scandal')
    .withPriority(BeatPriority.HIGH)
    .withNarration('Rumors spread about your past misdeeds...')
    .withWorldEffect('player_reputation', 20)
    .withWorldEffect('scandal_active', true)
    .withWorldEffect('town_trust', 10)
    .withStoryEffect('tension', 25)
    .build();

  dramaManager.addBeats([beatHeroicDeed, beatScandal]);

  console.log('--- Initial reputation ---');
  console.log('Reputation:', worldState.get('player_reputation'));
  console.log('Fame:', worldState.get('player_fame'));

  console.log('\n--- After heroic deed ---');
  dramaManager.executeBeat('heroic_deed');
  console.log('Reputation:', worldState.get('player_reputation'));
  console.log('Fame:', worldState.get('player_fame'));
  console.log('Hero status:', worldState.get('hero_status'));
  console.log('Village saved:', worldState.get('village_saved'));
  console.log('Statue built:', worldState.get('statue_built'));

  console.log('\n--- After scandal ---');
  dramaManager.executeBeat('scandal');
  console.log('Reputation:', worldState.get('player_reputation'));
  console.log('Scandal active:', worldState.get('scandal_active'));
  console.log('Town trust:', worldState.get('town_trust'));

  console.log('\nExpected: Reputation changes based on player actions');
}

// ===== EXAMPLE 6: Unlocking Areas =====

export async function testUnlockAreas(): Promise<void> {
  console.log('\n===== Example 6: Unlocking Areas =====\n');

  const worldState = new WorldState();
  worldState.set('castle_accessible', false);
  worldState.set('secret_passage_known', false);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Gain castle access
  const beatCastleAccess = new BeatBuilder('castle_access', 'Gain Castle Access')
    .withPriority(BeatPriority.HIGH)
    .withNarration('The king grants you entry to the royal castle!')
    .withWorldEffect('castle_accessible', true)
    .withWorldEffect('castle_gate_open', true)
    .withWorldEffect('castle_guards_friendly', true)
    .withWorldEffect('castle_map_revealed', true)
    .withWorldEffect('unlocked_areas', ['throne_room', 'armory', 'library', 'courtyard'])
    .withStoryEffect('stakes', 15)
    .build();

  // Beat: Discover secret passage
  const beatSecretPassage = new BeatBuilder('secret_passage', 'Discover Secret Passage')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You find a hidden passage behind the bookshelf!')
    .withWorldEffect('secret_passage_known', true)
    .withWorldEffect('secret_passage_entrance', 'library')
    .withWorldEffect('secret_passage_exit', 'dungeon')
    .withWorldEffect('shortcut_unlocked', true)
    .withStoryEffect('mystery', 20)
    .build();

  // Beat: Earthquake opens cave
  const beatEarthquake = new BeatBuilder('earthquake', 'Earthquake Opens Cave')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('The ground shakes! A massive cave entrance opens in the mountainside!')
    .withWorldEffect('mountain_cave_accessible', true)
    .withWorldEffect('cave_entrance_location', 'mountain_base')
    .withWorldEffect('cave_levels', 5)
    .withWorldEffect('boss_location', 'cave_level_5')
    .withStoryEffect('tension', 35)
    .withStoryEffect('mystery', 30)
    .build();

  dramaManager.addBeats([beatCastleAccess, beatSecretPassage, beatEarthquake]);

  console.log('--- Before unlocking ---');
  console.log('Castle accessible:', worldState.get('castle_accessible'));
  console.log('Secret passage known:', worldState.get('secret_passage_known'));
  console.log('Mountain cave accessible:', worldState.get('mountain_cave_accessible') || false);

  console.log('\n--- Gain castle access ---');
  dramaManager.executeBeat('castle_access');
  console.log('Castle accessible:', worldState.get('castle_accessible'));
  console.log('Castle gate open:', worldState.get('castle_gate_open'));
  console.log('Unlocked areas:', worldState.get('unlocked_areas'));

  console.log('\n--- Discover secret passage ---');
  dramaManager.executeBeat('secret_passage');
  console.log('Secret passage known:', worldState.get('secret_passage_known'));
  console.log('Entrance:', worldState.get('secret_passage_entrance'));
  console.log('Exit:', worldState.get('secret_passage_exit'));

  console.log('\n--- Earthquake ---');
  dramaManager.executeBeat('earthquake');
  console.log('Cave accessible:', worldState.get('mountain_cave_accessible'));
  console.log('Cave entrance:', worldState.get('cave_entrance_location'));
  console.log('Cave levels:', worldState.get('cave_levels'));
  console.log('Boss location:', worldState.get('boss_location'));

  console.log('\nExpected: New areas become accessible');
}

// ===== EXAMPLE 7: Unlocking Abilities =====

export async function testUnlockAbilities(): Promise<void> {
  console.log('\n===== Example 7: Unlocking Abilities =====\n');

  const worldState = new WorldState();
  worldState.set('player_abilities', ['attack', 'defend']);
  worldState.set('magic_unlocked', false);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Learn magic
  const beatLearnMagic = new BeatBuilder('learn_magic', 'Learn Magic')
    .withPriority(BeatPriority.HIGH)
    .withNarration('The ancient wizard teaches you the ways of magic!')
    .withWorldEffect('magic_unlocked', true)
    .withWorldEffect('player_abilities', ['attack', 'defend', 'fireball', 'heal', 'teleport'])
    .withWorldEffect('mana', 100)
    .withWorldEffect('spell_slots', 5)
    .withWorldEffect('wizard_apprentice', true)
    .withStoryEffect('competence', 30)
    .build();

  // Beat: Master swordsmanship
  const beatMasterSword = new BeatBuilder('master_sword', 'Master Swordsmanship')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('Through intense training, you master the blade!')
    .withWorldEffect('swordsmanship_level', 'master')
    .withWorldEffect('combo_attacks_unlocked', true)
    .withWorldEffect('critical_hit_chance', 0.25)
    .withWorldEffect('special_moves', ['whirlwind', 'pierce', 'parry_counter'])
    .withStoryEffect('competence', 25)
    .build();

  dramaManager.addBeats([beatLearnMagic, beatMasterSword]);

  console.log('--- Before learning ---');
  console.log('Abilities:', worldState.get('player_abilities'));
  console.log('Magic unlocked:', worldState.get('magic_unlocked'));

  console.log('\n--- Learn magic ---');
  dramaManager.executeBeat('learn_magic');
  console.log('Magic unlocked:', worldState.get('magic_unlocked'));
  console.log('Abilities:', worldState.get('player_abilities'));
  console.log('Mana:', worldState.get('mana'));
  console.log('Spell slots:', worldState.get('spell_slots'));

  console.log('\n--- Master swordsmanship ---');
  dramaManager.executeBeat('master_sword');
  console.log('Swordsmanship level:', worldState.get('swordsmanship_level'));
  console.log('Combo attacks:', worldState.get('combo_attacks_unlocked'));
  console.log('Crit chance:', worldState.get('critical_hit_chance'));
  console.log('Special moves:', worldState.get('special_moves'));

  console.log('\nExpected: New abilities and skills unlocked');
}

// ===== EXAMPLE 8: Setting Quest Flags =====

export async function testQuestFlags(): Promise<void> {
  console.log('\n===== Example 8: Setting Quest Flags =====\n');

  const worldState = new WorldState();

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Quest accepted
  const beatQuestAccepted = new BeatBuilder('quest_accepted', 'Accept Dragon Quest')
    .withPriority(BeatPriority.HIGH)
    .withNarration('You accept the quest to slay the dragon!')
    .withWorldEffect('quest_dragon_active', true)
    .withWorldEffect('quest_dragon_stage', 'accepted')
    .withWorldEffect('quest_dragon_objectives', {
      find_sword: false,
      reach_mountain: false,
      defeat_dragon: false,
    })
    .withWorldEffect('quest_log', ['Find the legendary sword', 'Travel to Dragon Mountain', 'Defeat the dragon'])
    .withStoryEffect('stakes', 25)
    .withStoryEffect('urgency', 20)
    .build();

  // Beat: Quest progress
  const beatFoundSword = new BeatBuilder('found_sword', 'Found Legendary Sword')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('quest_dragon_active'))
    .withNarration('You found the legendary dragon-slaying sword!')
    .withWorldEffect('quest_dragon_stage', 'sword_acquired')
    .withWorldEffect('quest_dragon_objectives', {
      find_sword: true,
      reach_mountain: false,
      defeat_dragon: false,
    })
    .withWorldEffect('has_dragon_sword', true)
    .withStoryEffect('competence', 20)
    .build();

  // Beat: Quest completed
  const beatQuestComplete = new BeatBuilder('quest_complete', 'Dragon Quest Complete')
    .withPriority(BeatPriority.CRITICAL)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('quest_dragon_active'))
    .withNarration('The dragon is defeated! The quest is complete!')
    .withWorldEffect('quest_dragon_active', false)
    .withWorldEffect('quest_dragon_stage', 'completed')
    .withWorldEffect('quest_dragon_objectives', {
      find_sword: true,
      reach_mountain: true,
      defeat_dragon: true,
    })
    .withWorldEffect('quest_dragon_reward', { gold: 1000, xp: 5000, title: 'Dragonslayer' })
    .withStoryEffect('stakes', -30)
    .withStoryEffect('tension', -40)
    .withStoryEffect('competence', 40)
    .build();

  dramaManager.addBeats([beatQuestAccepted, beatFoundSword, beatQuestComplete]);

  console.log('--- Accept quest ---');
  dramaManager.executeBeat('quest_accepted');
  console.log('Quest active:', worldState.get('quest_dragon_active'));
  console.log('Quest stage:', worldState.get('quest_dragon_stage'));
  console.log('Objectives:', worldState.get('quest_dragon_objectives'));
  console.log('Quest log:', worldState.get('quest_log'));

  console.log('\n--- Found sword ---');
  dramaManager.executeBeat('found_sword');
  console.log('Quest stage:', worldState.get('quest_dragon_stage'));
  console.log('Objectives:', worldState.get('quest_dragon_objectives'));
  console.log('Has dragon sword:', worldState.get('has_dragon_sword'));

  console.log('\n--- Quest complete ---');
  dramaManager.executeBeat('quest_complete');
  console.log('Quest active:', worldState.get('quest_dragon_active'));
  console.log('Quest stage:', worldState.get('quest_dragon_stage'));
  console.log('Objectives:', worldState.get('quest_dragon_objectives'));
  console.log('Reward:', worldState.get('quest_dragon_reward'));

  console.log('\nExpected: Quest flags track progression and completion');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllBeatEffectExamples(): Promise<void> {
  await testSpawnNPC();
  await new Promise(r => setTimeout(r, 1000));

  await testSpawnItems();
  await new Promise(r => setTimeout(r, 1000));

  await testChangeLocations();
  await new Promise(r => setTimeout(r, 1000));

  await testModifyRelationships();
  await new Promise(r => setTimeout(r, 1000));

  await testModifyReputation();
  await new Promise(r => setTimeout(r, 1000));

  await testUnlockAreas();
  await new Promise(r => setTimeout(r, 1000));

  await testUnlockAbilities();
  await new Promise(r => setTimeout(r, 1000));

  await testQuestFlags();
}

// Run if executed directly
if (require.main === module) {
  runAllBeatEffectExamples().catch(console.error);
}
