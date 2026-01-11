/**
 * BeatOutcomeExamples - FACADE 4.8
 *
 * Examples demonstrating beat success/failure handling and branching narratives.
 *
 * Beat outcomes allow stories to branch based on success or failure:
 * - SUCCESS: Beat achieved its goal
 * - FAILURE: Beat failed to achieve its goal
 * - PARTIAL: Beat partially succeeded
 * - NONE: No outcome yet
 *
 * Outcomes can unlock/lock other beats, creating branching narratives:
 * - unlocksOnSuccess: Beats available after success
 * - unlocksOnFailure: Beats available after failure
 * - locksOnSuccess: Beats unavailable after success
 * - locksOnFailure: Beats unavailable after failure
 *
 * This enables:
 * - Branching story paths
 * - Consequences for player actions
 * - Alternative routes through the story
 * - Reactive narrative progression
 */

import { WorldState } from '../../abl/WorldState';
import { DramaManager } from '../DramaManager';
import { BeatBuilder, BeatPriority, BeatOutcome } from '../Beat';
import { PreconditionBuilder } from '../../abl/Precondition';

// ===== EXAMPLE 1: Basic Success/Failure Branching =====

export async function testBasicSuccessFailure(): Promise<void> {
  console.log('\n===== Example 1: Basic Success/Failure Branching =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
  });

  // Main beat: Attempt to persuade the guard
  const beatPersuade = new BeatBuilder('persuade_guard', 'Persuade the Guard')
    .withDescription('Try to talk your way past the guard')
    .withPriority(BeatPriority.HIGH)
    .unlocksOnSuccess(['enter_peacefully'])
    .unlocksOnFailure(['fight_guard', 'sneak_past'])
    .withStoryEffect('persuasion_skill', 10)
    .build();

  // Success path: Enter peacefully
  const beatEnterPeacefully = new BeatBuilder('enter_peacefully', 'Enter Peacefully')
    .withDescription('The guard lets you through')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('The guard nods and steps aside. "Go on through."')
    .withStoryEffect('reputation', 5)
    .build();

  // Failure path 1: Fight the guard
  const beatFightGuard = new BeatBuilder('fight_guard', 'Fight the Guard')
    .withDescription('Battle the guard')
    .withPriority(BeatPriority.HIGH)
    .withNarration('The guard draws his sword! "Then we do this the hard way!"')
    .withStoryEffect('tension', 50)
    .withStoryEffect('reputation', -10)
    .build();

  // Failure path 2: Sneak past
  const beatSneakPast = new BeatBuilder('sneak_past', 'Sneak Past')
    .withDescription('Try to slip by unnoticed')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You wait for the guard to look away...')
    .withStoryEffect('stealth_skill', 10)
    .build();

  dramaManager.addBeats([beatPersuade, beatEnterPeacefully, beatFightGuard, beatSneakPast]);

  console.log('--- Initial state ---');
  console.log(`Locked beats: enter_peacefully, fight_guard, sneak_past`);

  console.log('\n--- Scenario A: Success ---');
  dramaManager.executeBeatWithOutcome('persuade_guard', BeatOutcome.SUCCESS);
  console.log('After success: "enter_peacefully" unlocked');
  console.log(`Available beats: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);

  console.log('\n--- Scenario B: Failure ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('persuade_guard', BeatOutcome.FAILURE);
  console.log('After failure: "fight_guard", "sneak_past" unlocked');
  console.log(`Available beats: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);

  console.log('\nExpected: Different beats available based on success vs failure');
}

// ===== EXAMPLE 2: Multi-Level Branching =====

export async function testMultiLevelBranching(): Promise<void> {
  console.log('\n===== Example 2: Multi-Level Branching =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
  });

  // Level 1: Steal the artifact
  const beatSteal = new BeatBuilder('steal_artifact', 'Steal the Artifact')
    .withDescription('Attempt the heist')
    .withPriority(BeatPriority.CRITICAL)
    .unlocksOnSuccess(['escape_clean'])
    .unlocksOnFailure(['chase_sequence'])
    .build();

  // Level 2a (Success): Clean escape
  const beatEscapeClean = new BeatBuilder('escape_clean', 'Escape Cleanly')
    .withDescription('Get away without being noticed')
    .withPriority(BeatPriority.HIGH)
    .unlocksOnSuccess(['sell_artifact'])
    .unlocksOnFailure(['hide_artifact'])
    .withStoryEffect('reputation', 20)
    .build();

  // Level 2b (Failure): Chase sequence
  const beatChase = new BeatBuilder('chase_sequence', 'Chase Sequence')
    .withDescription('Guards pursue you!')
    .withPriority(BeatPriority.CRITICAL)
    .unlocksOnSuccess(['lose_guards'])
    .unlocksOnFailure(['captured'])
    .withStoryEffect('tension', 80)
    .build();

  // Level 3a1: Sell the artifact (escape → success)
  const beatSell = new BeatBuilder('sell_artifact', 'Sell the Artifact')
    .withDescription('Find a buyer')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You find a buyer in the black market.')
    .withStoryEffect('wealth', 100)
    .build();

  // Level 3a2: Hide the artifact (escape → failure)
  const beatHide = new BeatBuilder('hide_artifact', 'Hide the Artifact')
    .withDescription('Stash it for later')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You hide the artifact in a safe location.')
    .build();

  // Level 3b1: Lose the guards (chase → success)
  const beatLoseGuards = new BeatBuilder('lose_guards', 'Lose the Guards')
    .withDescription('Escape the pursuit')
    .withPriority(BeatPriority.HIGH)
    .withNarration('You duck into an alley and lose them!')
    .build();

  // Level 3b2: Captured (chase → failure)
  const beatCaptured = new BeatBuilder('captured', 'Captured!')
    .withDescription('You are caught')
    .withPriority(BeatPriority.CRITICAL)
    .withNarration('The guards surround you. There is no escape.')
    .withStoryEffect('freedom', -100)
    .build();

  dramaManager.addBeats([
    beatSteal,
    beatEscapeClean,
    beatChase,
    beatSell,
    beatHide,
    beatLoseGuards,
    beatCaptured,
  ]);

  console.log('--- Path 1: Success → Success → Best Ending ---');
  dramaManager.executeBeatWithOutcome('steal_artifact', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('escape_clean', BeatOutcome.SUCCESS);
  console.log('Result: Can sell the artifact for profit!');

  console.log('\n--- Path 2: Success → Failure → Hide ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('steal_artifact', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('escape_clean', BeatOutcome.FAILURE);
  console.log('Result: Must hide the artifact');

  console.log('\n--- Path 3: Failure → Success → Escape ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('steal_artifact', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('chase_sequence', BeatOutcome.SUCCESS);
  console.log('Result: Lost the guards!');

  console.log('\n--- Path 4: Failure → Failure → Worst Ending ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('steal_artifact', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('chase_sequence', BeatOutcome.FAILURE);
  console.log('Result: Captured by the guards');

  console.log('\nExpected: Four different story paths based on outcomes');
}

// ===== EXAMPLE 3: Partial Success =====

export async function testPartialSuccess(): Promise<void> {
  console.log('\n===== Example 3: Partial Success =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
  });

  // Beat with partial success handling
  const beatNegotiate = new BeatBuilder('negotiate_trade', 'Negotiate Trade Deal')
    .withDescription('Negotiate with the merchant')
    .withPriority(BeatPriority.HIGH)
    .unlocksOnSuccess(['lucrative_deal', 'exclusive_access'])
    .unlocksOnFailure(['poor_deal', 'no_access'])
    .build();

  // Full success rewards
  const beatLucrative = new BeatBuilder('lucrative_deal', 'Lucrative Deal')
    .withDescription('Get excellent terms')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You strike an excellent bargain!')
    .withStoryEffect('wealth', 100)
    .build();

  const beatExclusive = new BeatBuilder('exclusive_access', 'Exclusive Access')
    .withDescription('Gain access to rare goods')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('The merchant grants you access to exclusive items.')
    .build();

  // Failure consequences
  const beatPoor = new BeatBuilder('poor_deal', 'Poor Deal')
    .withDescription('Accept unfavorable terms')
    .withPriority(BeatPriority.LOW)
    .withNarration('You agree to unfavorable terms.')
    .withStoryEffect('wealth', 10)
    .build();

  const beatNoAccess = new BeatBuilder('no_access', 'No Special Access')
    .withDescription('Denied exclusive items')
    .withPriority(BeatPriority.LOW)
    .withNarration('The merchant refuses special access.')
    .build();

  dramaManager.addBeats([beatNegotiate, beatLucrative, beatExclusive, beatPoor, beatNoAccess]);

  console.log('--- Success: All rewards unlocked ---');
  dramaManager.executeBeatWithOutcome('negotiate_trade', BeatOutcome.SUCCESS);
  console.log(`Available: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);

  console.log('\n--- Failure: Only failure consequences unlocked ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('negotiate_trade', BeatOutcome.FAILURE);
  console.log(`Available: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);

  console.log('\n--- Partial: Both rewards AND consequences unlocked ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('negotiate_trade', BeatOutcome.PARTIAL);
  console.log(`Available: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);
  console.log('Partial allows player to choose their own path!');

  console.log('\nExpected: Partial unlocks all options, giving player choice');
}

// ===== EXAMPLE 4: Locking Beats =====

export async function testLockingBeats(): Promise<void> {
  console.log('\n===== Example 4: Locking Beats (Mutually Exclusive Paths) =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
  });

  // Choice beat: Join a faction
  const beatJoinMages = new BeatBuilder('join_mages', 'Join the Mages Guild')
    .withDescription('Pledge to the mages')
    .withPriority(BeatPriority.CRITICAL)
    .unlocksOnSuccess(['mage_quests'])
    .locksOnSuccess(['join_warriors', 'join_thieves']) // Lock other factions
    .build();

  const beatJoinWarriors = new BeatBuilder('join_warriors', 'Join the Warriors Guild')
    .withDescription('Pledge to the warriors')
    .withPriority(BeatPriority.CRITICAL)
    .unlocksOnSuccess(['warrior_quests'])
    .locksOnSuccess(['join_mages', 'join_thieves'])
    .build();

  const beatJoinThieves = new BeatBuilder('join_thieves', 'Join the Thieves Guild')
    .withDescription('Pledge to the thieves')
    .withPriority(BeatPriority.CRITICAL)
    .unlocksOnSuccess(['thief_quests'])
    .locksOnSuccess(['join_mages', 'join_warriors'])
    .build();

  // Faction-specific content
  const beatMageQuests = new BeatBuilder('mage_quests', 'Mage Quests')
    .withDescription('Mage guild missions')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('The archmage assigns you magical tasks.')
    .build();

  const beatWarriorQuests = new BeatBuilder('warrior_quests', 'Warrior Quests')
    .withDescription('Warrior guild missions')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('The warlord sends you into battle.')
    .build();

  const beatThiefQuests = new BeatBuilder('thief_quests', 'Thief Quests')
    .withDescription('Thief guild missions')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('The guildmaster assigns you heists.')
    .build();

  dramaManager.addBeats([
    beatJoinMages,
    beatJoinWarriors,
    beatJoinThieves,
    beatMageQuests,
    beatWarriorQuests,
    beatThiefQuests,
  ]);

  console.log('--- Before joining any guild ---');
  console.log(`Can join: Mages, Warriors, or Thieves`);
  console.log(`Locked: ${Array.from((dramaManager as any).lockedBeats).join(', ') || 'None'}`);

  console.log('\n--- Join the Mages Guild ---');
  dramaManager.executeBeatWithOutcome('join_mages', BeatOutcome.SUCCESS);
  console.log('Unlocked: mage_quests');
  console.log('Locked: join_warriors, join_thieves');
  console.log(`Available beats: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);

  console.log('\n--- Try to join Warriors (should be locked) ---');
  const result = dramaManager.executeBeatWithOutcome('join_warriors', BeatOutcome.SUCCESS);
  console.log(`Result: ${result ? 'Executed' : 'LOCKED - Cannot join multiple guilds'}`);

  console.log('\nExpected: Choosing one faction locks out the others permanently');
}

// ===== EXAMPLE 5: Quest Chain with Success/Failure =====

export async function testQuestChain(): Promise<void> {
  console.log('\n===== Example 5: Quest Chain with Success/Failure =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
  });

  // Quest 1: Find the village
  const beatFindVillage = new BeatBuilder('find_village', 'Find the Village')
    .withDescription('Locate the hidden village')
    .withPriority(BeatPriority.HIGH)
    .unlocksOnSuccess(['quest2_rescue'])
    .unlocksOnFailure(['quest2_investigate'])
    .build();

  // Quest 2a: Rescue path (if found village)
  const beatRescue = new BeatBuilder('quest2_rescue', 'Rescue the Villagers')
    .withDescription('Save the villagers from bandits')
    .withPriority(BeatPriority.CRITICAL)
    .unlocksOnSuccess(['quest3_hero'])
    .unlocksOnFailure(['quest3_aftermath'])
    .withStoryEffect('hero_reputation', 50)
    .build();

  // Quest 2b: Investigate path (if didn't find village)
  const beatInvestigate = new BeatBuilder('quest2_investigate', 'Investigate the Area')
    .withDescription('Search for clues')
    .withPriority(BeatPriority.NORMAL)
    .unlocksOnSuccess(['quest3_discovery'])
    .unlocksOnFailure(['quest3_givup'])
    .build();

  // Quest 3a1: Hero ending (rescue success)
  const beatHero = new BeatBuilder('quest3_hero', 'Celebrated as Hero')
    .withDescription('The villagers celebrate you')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('The villagers throw a feast in your honor!')
    .withStoryEffect('hero_reputation', 100)
    .build();

  // Quest 3a2: Aftermath (rescue failure)
  const beatAftermath = new BeatBuilder('quest3_aftermath', 'Deal with Aftermath')
    .withDescription('Help survivors')
    .withPriority(BeatPriority.HIGH)
    .withNarration('You help the survivors rebuild.')
    .withStoryEffect('hero_reputation', 20)
    .build();

  // Quest 3b1: Discovery (investigate success)
  const beatDiscovery = new BeatBuilder('quest3_discovery', 'Make Discovery')
    .withDescription('Find important clue')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You discover evidence of a larger conspiracy!')
    .build();

  // Quest 3b2: Give up (investigate failure)
  const beatGiveUp = new BeatBuilder('quest3_givup', 'Give Up')
    .withDescription('Abandon the quest')
    .withPriority(BeatPriority.LOW)
    .withNarration('The trail has gone cold. You give up the search.')
    .build();

  dramaManager.addBeats([
    beatFindVillage,
    beatRescue,
    beatInvestigate,
    beatHero,
    beatAftermath,
    beatDiscovery,
    beatGiveUp,
  ]);

  console.log('--- Quest Path A: Success → Success → Hero ---');
  dramaManager.executeBeatWithOutcome('find_village', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('quest2_rescue', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('quest3_hero', BeatOutcome.SUCCESS);
  console.log('Outcome: Maximum reputation!');

  console.log('\n--- Quest Path B: Success → Failure → Aftermath ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('find_village', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('quest2_rescue', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('quest3_aftermath', BeatOutcome.SUCCESS);
  console.log('Outcome: Moderate reputation');

  console.log('\n--- Quest Path C: Failure → Success → Discovery ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('find_village', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('quest2_investigate', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('quest3_discovery', BeatOutcome.SUCCESS);
  console.log('Outcome: Uncover conspiracy!');

  console.log('\n--- Quest Path D: Failure → Failure → Give Up ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('find_village', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('quest2_investigate', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('quest3_givup', BeatOutcome.SUCCESS);
  console.log('Outcome: Quest abandoned');

  console.log('\nExpected: Complete quest with four distinct story paths');
}

// ===== EXAMPLE 6: Dynamic Outcome Based on Game State =====

export async function testDynamicOutcome(): Promise<void> {
  console.log('\n===== Example 6: Dynamic Outcome Based on Game State =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      skill: 50,
      luck: 30,
    },
  });

  const beatChallenge = new BeatBuilder('face_challenge', 'Face the Challenge')
    .withDescription('Attempt a difficult task')
    .withPriority(BeatPriority.CRITICAL)
    .unlocksOnSuccess(['success_reward'])
    .unlocksOnFailure(['failure_consequence'])
    .build();

  const beatSuccessReward = new BeatBuilder('success_reward', 'Claim Reward')
    .withDescription('Receive your prize')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You succeeded! Here is your reward.')
    .withStoryEffect('wealth', 50)
    .build();

  const beatFailureConsequence = new BeatBuilder('failure_consequence', 'Face Consequence')
    .withDescription('Deal with failure')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You failed. There are consequences.')
    .withStoryEffect('reputation', -20)
    .build();

  dramaManager.addBeats([beatChallenge, beatSuccessReward, beatFailureConsequence]);

  console.log('--- Scenario A: High skill (50), High luck (30) ---');
  console.log('Outcome: SUCCESS (good stats)');
  dramaManager.executeBeatWithOutcome('face_challenge', BeatOutcome.SUCCESS);
  console.log(`Result: ${dramaManager.getAvailableBeats()[0]?.name || 'None'}`);

  console.log('\n--- Scenario B: Low skill (20), Low luck (10) ---');
  dramaManager.reset();
  dramaManager.setStoryValue('skill', 20);
  dramaManager.setStoryValue('luck', 10);
  console.log('Outcome: FAILURE (poor stats)');
  dramaManager.executeBeatWithOutcome('face_challenge', BeatOutcome.FAILURE);
  console.log(`Result: ${dramaManager.getAvailableBeats()[0]?.name || 'None'}`);

  console.log('\n--- Scenario C: Medium skill (40), Medium luck (40) ---');
  dramaManager.reset();
  dramaManager.setStoryValue('skill', 40);
  dramaManager.setStoryValue('luck', 40);
  console.log('Outcome: PARTIAL (okay stats)');
  dramaManager.executeBeatWithOutcome('face_challenge', BeatOutcome.PARTIAL);
  console.log(`Available: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);
  console.log('Player gets to choose: accept reward or face consequence');

  console.log('\nExpected: Outcome determined by game state (skill + luck)');
}

// ===== EXAMPLE 7: Relationship Branching =====

export async function testRelationshipBranching(): Promise<void> {
  console.log('\n===== Example 7: Relationship Branching =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      romance: 0,
      friendship: 0,
    },
  });

  // Confession beat
  const beatConfess = new BeatBuilder('confess_feelings', 'Confess Your Feelings')
    .withDescription('Tell them how you feel')
    .withPriority(BeatPriority.CRITICAL)
    .unlocksOnSuccess(['romance_path', 'dating'])
    .locksOnSuccess(['friendship_path']) // Can't be friends after romance
    .unlocksOnFailure(['friendship_path', 'awkward'])
    .locksOnFailure(['romance_path']) // Can't romance after rejection
    .build();

  // Romance path
  const beatRomance = new BeatBuilder('romance_path', 'Romance Path')
    .withDescription('Begin a romantic relationship')
    .withPriority(BeatPriority.HIGH)
    .withNarration('They feel the same way!')
    .withStoryEffect('romance', 100)
    .build();

  const beatDating = new BeatBuilder('dating', 'Dating')
    .withDescription('Go on dates')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You start dating!')
    .build();

  // Friendship path
  const beatFriendship = new BeatBuilder('friendship_path', 'Friendship Path')
    .withDescription('Remain close friends')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('"Let\'s just be friends."')
    .withStoryEffect('friendship', 80)
    .build();

  const beatAwkward = new BeatBuilder('awkward', 'Awkward Situation')
    .withDescription('Things are awkward now')
    .withPriority(BeatPriority.LOW)
    .withNarration('Things are a bit awkward between you now.')
    .build();

  dramaManager.addBeats([beatConfess, beatRomance, beatDating, beatFriendship, beatAwkward]);

  console.log('--- Scenario A: Confession Succeeds ---');
  dramaManager.executeBeatWithOutcome('confess_feelings', BeatOutcome.SUCCESS);
  console.log('Unlocked: romance_path, dating');
  console.log('Locked: friendship_path');
  console.log(`Can only pursue: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);

  console.log('\n--- Scenario B: Confession Fails ---');
  dramaManager.reset();
  dramaManager.executeBeatWithOutcome('confess_feelings', BeatOutcome.FAILURE);
  console.log('Unlocked: friendship_path, awkward');
  console.log('Locked: romance_path');
  console.log(`Can only pursue: ${dramaManager.getAvailableBeats().map(b => b.name).join(', ')}`);

  console.log('\nExpected: Mutually exclusive relationship paths based on confession outcome');
}

// ===== EXAMPLE 8: Outcome Tracking and History =====

export async function testOutcomeTracking(): Promise<void> {
  console.log('\n===== Example 8: Outcome Tracking and History =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: false,
  });

  const beat1 = new BeatBuilder('challenge1', 'First Challenge')
    .withDescription('First test')
    .withPriority(BeatPriority.NORMAL)
    .build();

  const beat2 = new BeatBuilder('challenge2', 'Second Challenge')
    .withDescription('Second test')
    .withPriority(BeatPriority.NORMAL)
    .build();

  const beat3 = new BeatBuilder('challenge3', 'Third Challenge')
    .withDescription('Third test')
    .withPriority(BeatPriority.NORMAL)
    .build();

  dramaManager.addBeats([beat1, beat2, beat3]);

  // Execute with different outcomes
  dramaManager.executeBeatWithOutcome('challenge1', BeatOutcome.SUCCESS);
  dramaManager.executeBeatWithOutcome('challenge2', BeatOutcome.FAILURE);
  dramaManager.executeBeatWithOutcome('challenge3', BeatOutcome.PARTIAL);

  console.log('--- Beat Outcome History ---');
  const beat1Instance = dramaManager['beats'].get('challenge1');
  const beat2Instance = dramaManager['beats'].get('challenge2');
  const beat3Instance = dramaManager['beats'].get('challenge3');

  console.log(`Challenge 1: ${beat1Instance?.getOutcome()}`);
  console.log(`Challenge 2: ${beat2Instance?.getOutcome()}`);
  console.log(`Challenge 3: ${beat3Instance?.getOutcome()}`);

  console.log('\n--- Beat Info with Outcome ---');
  console.log(JSON.stringify(beat1Instance?.getInfo(), null, 2));

  console.log('\nExpected: Each beat remembers its outcome');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllBeatOutcomeExamples(): Promise<void> {
  await testBasicSuccessFailure();
  await new Promise(r => setTimeout(r, 1000));

  await testMultiLevelBranching();
  await new Promise(r => setTimeout(r, 1000));

  await testPartialSuccess();
  await new Promise(r => setTimeout(r, 1000));

  await testLockingBeats();
  await new Promise(r => setTimeout(r, 1000));

  await testQuestChain();
  await new Promise(r => setTimeout(r, 1000));

  await testDynamicOutcome();
  await new Promise(r => setTimeout(r, 1000));

  await testRelationshipBranching();
  await new Promise(r => setTimeout(r, 1000));

  await testOutcomeTracking();
}

// Run if executed directly
if (require.main === module) {
  runAllBeatOutcomeExamples().catch(console.error);
}
