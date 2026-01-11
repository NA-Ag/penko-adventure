/**
 * BeatPreconditionExamples - FACADE 4.4
 *
 * Examples demonstrating beat preconditions.
 *
 * Preconditions determine when beats can activate:
 * - Location-based (player must be in specific place)
 * - Inventory-based (player must have specific item)
 * - Relationship-based (affinity/trust must be high enough)
 * - Time-based (specific time or after delay)
 * - State-based (specific world state conditions)
 *
 * This ensures beats only trigger when contextually appropriate.
 */

import { WorldState } from '../../abl/WorldState';
import { PreconditionBuilder } from '../../abl/Precondition';
import { DramaManager } from '../DramaManager';
import { BeatBuilder, BeatPriority } from '../Beat';

// ===== EXAMPLE 1: Location-Based Preconditions =====

export async function testLocationPreconditions(): Promise<void> {
  console.log('\n===== Example 1: Location-Based Preconditions =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat 1: Tavern greeting (only at tavern)
  const beatTavernGreeting = new BeatBuilder('tavern_greeting', 'Tavern Greeting')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.equals('player_location', 'tavern'))
    .withNarration('The bartender waves as you enter.')
    .build();

  // Beat 2: Forest ambush (only in forest)
  const beatForestAmbush = new BeatBuilder('forest_ambush', 'Forest Ambush')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(PreconditionBuilder.equals('player_location', 'forest'))
    .withStoryEffect('tension', 30)
    .withNarration('Bandits leap from the trees!')
    .build();

  // Beat 3: Castle entrance (only at castle)
  const beatCastleEntrance = new BeatBuilder('castle_entrance', 'Castle Entrance')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.equals('player_location', 'castle'))
    .withNarration('Guards stand at attention as you approach the gates.')
    .build();

  dramaManager.addBeats([beatTavernGreeting, beatForestAmbush, beatCastleEntrance]);

  console.log('--- Player at tavern ---');
  worldState.set('player_location', 'tavern');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Player moves to forest ---');
  worldState.set('player_location', 'forest');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Player moves to castle ---');
  worldState.set('player_location', 'castle');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\nExpected: Different beats available based on location');
}

// ===== EXAMPLE 2: Inventory-Based Preconditions =====

export async function testInventoryPreconditions(): Promise<void> {
  console.log('\n===== Example 2: Inventory-Based Preconditions (Dragon Boss Fight) =====\n');

  const worldState = new WorldState();
  worldState.set('player_location', 'dragon_lair');
  worldState.set('has_sword', false);
  worldState.set('has_shield', false);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat 1: Unprepared warning (no sword)
  const beatUnprepared = new BeatBuilder('unprepared', 'Unprepared for Dragon')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.equals('player_location', 'dragon_lair'),
        PreconditionBuilder.isFalse('has_sword')
      )
    )
    .withNarration('You face the dragon unarmed. This is suicide!')
    .withStoryEffect('tension', 50)
    .build();

  // Beat 2: Dragon boss fight (requires sword)
  const beatDragonFight = new BeatBuilder('dragon_fight', 'Dragon Boss Fight')
    .withPriority(BeatPriority.CRITICAL)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.equals('player_location', 'dragon_lair'),
        PreconditionBuilder.isTrue('has_sword')
      )
    )
    .withNarration('With sword in hand, you challenge the mighty dragon!')
    .withStoryEffect('tension', 90)
    .withWorldEffect('dragon_fight_started', true)
    .build();

  // Beat 3: Well-equipped fight (has both sword and shield)
  const beatWellEquipped = new BeatBuilder('well_equipped', 'Well-Equipped Dragon Fight')
    .withPriority(BeatPriority.CRITICAL)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.equals('player_location', 'dragon_lair'),
        PreconditionBuilder.isTrue('has_sword'),
        PreconditionBuilder.isTrue('has_shield')
      )
    )
    .withNarration('Armed with legendary sword and shield, you are ready!')
    .withStoryEffect('tension', 80)
    .withStoryEffect('competence', 30)
    .withWorldEffect('dragon_fight_started', true)
    .build();

  dramaManager.addBeats([beatUnprepared, beatDragonFight, beatWellEquipped]);

  console.log('--- Scenario 1: No equipment ---');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Scenario 2: Found sword! ---');
  worldState.set('has_sword', true);
  dramaManager.reset();
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Scenario 3: Found shield too! ---');
  worldState.set('has_shield', true);
  dramaManager.reset();
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\nExpected: Dragon fight only happens after player has sword');
}

// ===== EXAMPLE 3: Relationship-Based Preconditions =====

export async function testRelationshipPreconditions(): Promise<void> {
  console.log('\n===== Example 3: Relationship-Based Preconditions (Romance Scene) =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      affinity: 20,
      romance: 0,
    },
  });

  // Beat 1: First meeting (low affinity)
  const beatFirstMeeting = new BeatBuilder('first_meeting', 'First Meeting')
    .withPriority(BeatPriority.NORMAL)
    .withNarration('You exchange polite greetings.')
    .withStoryEffect('affinity', 10)
    .build();

  // Beat 2: Friendly conversation (medium affinity)
  const beatFriendlyChat = new BeatBuilder('friendly_chat', 'Friendly Chat')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(
      PreconditionBuilder.greaterOrEqual('affinity', 40)
    )
    .withNarration('You share stories and laugh together.')
    .withStoryEffect('affinity', 15)
    .withStoryEffect('romance', 10)
    .build();

  // Beat 3: Romance scene (high affinity required)
  const beatRomance = new BeatBuilder('romance_scene', 'Romance Scene')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.greaterOrEqual('affinity', 70),
        PreconditionBuilder.greaterOrEqual('romance', 30)
      )
    )
    .withNarration('Under the stars, you confess your feelings...')
    .withStoryEffect('romance', 40)
    .withStoryEffect('affinity', 20)
    .withWorldEffect('relationship_status', 'romantic')
    .build();

  // Beat 4: Marriage proposal (very high affinity and romance)
  const beatProposal = new BeatBuilder('proposal', 'Marriage Proposal')
    .withPriority(BeatPriority.CRITICAL)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.greaterOrEqual('affinity', 90),
        PreconditionBuilder.greaterOrEqual('romance', 80),
        PreconditionBuilder.equals('relationship_status', 'romantic')
      )
    )
    .withNarration('You kneel and offer the ring...')
    .withWorldEffect('engaged', true)
    .build();

  dramaManager.addBeats([beatFirstMeeting, beatFriendlyChat, beatRomance, beatProposal]);

  console.log('--- Stage 1: First meeting (affinity: 20) ---');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Stage 2: Building friendship (affinity: 30) ---');
  dramaManager.setStoryValue('affinity', 30);
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  console.log('Romance scene blocked: affinity too low');

  console.log('\n--- Stage 3: Good friends (affinity: 50, romance: 10) ---');
  dramaManager.setStoryValue('affinity', 50);
  dramaManager.setStoryValue('romance', 10);
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.executeBeat('friendly_chat');

  console.log('\n--- Stage 4: Romance begins (affinity: 75, romance: 35) ---');
  dramaManager.setStoryValue('affinity', 75);
  dramaManager.setStoryValue('romance', 35);
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.executeBeat('romance_scene');

  console.log('\n--- Stage 5: Ready for proposal (affinity: 95, romance: 85) ---');
  dramaManager.setStoryValue('affinity', 95);
  dramaManager.setStoryValue('romance', 85);
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\nExpected: Romance scene only happens if affinity high enough');
}

// ===== EXAMPLE 4: Time-Based Preconditions =====

export async function testTimePreconditions(): Promise<void> {
  console.log('\n===== Example 4: Time-Based Preconditions =====\n');

  const worldState = new WorldState();
  worldState.set('game_start_time', Date.now());

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat 1: Morning greeting (time 6-12)
  const beatMorning = new BeatBuilder('morning_greeting', 'Morning Greeting')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.greaterOrEqual('hour', 6))
    .withPreconditionBuilder(PreconditionBuilder.lessThan('hour', 12))
    .withNarration('Good morning! The day is young.')
    .build();

  // Beat 2: Delayed event (5 seconds after game start)
  const gameStartTime = worldState.get('game_start_time') as number;
  const delayedEventTime = gameStartTime + 5000;

  const beatDelayed = new BeatBuilder('delayed_event', 'Delayed Event')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(PreconditionBuilder.greaterOrEqual('current_time', delayedEventTime))
    .withNarration('The messenger arrives, breathless from running.')
    .withWorldEffect('messenger_arrived', true)
    .build();

  dramaManager.addBeats([beatMorning, beatDelayed]);

  console.log('--- Immediately after game start ---');
  worldState.set('current_time', Date.now());
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));

  console.log('\n--- Wait 5 seconds... ---');
  await new Promise(r => setTimeout(r, 5000));
  worldState.set('current_time', Date.now());
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\nExpected: Delayed beat only triggers after time threshold');
}

// ===== EXAMPLE 5: Complex Multi-Condition Preconditions =====

export async function testComplexPreconditions(): Promise<void> {
  console.log('\n===== Example 5: Complex Multi-Condition Preconditions =====\n');

  const worldState = new WorldState();
  worldState.set('player_location', 'throne_room');
  worldState.set('has_evidence', false);
  worldState.set('king_trust', 30);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Accuse the traitor (complex preconditions)
  const beatAccuse = new BeatBuilder('accuse_traitor', 'Accuse the Traitor')
    .withPriority(BeatPriority.CRITICAL)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        // Must be in throne room
        PreconditionBuilder.equals('player_location', 'throne_room'),
        // Must have evidence
        PreconditionBuilder.isTrue('has_evidence'),
        // King must trust you
        PreconditionBuilder.greaterOrEqual('king_trust', 60),
        // Traitor must be present
        PreconditionBuilder.isTrue('traitor_present')
      )
    )
    .withDialogue([
      'Player: "Your Majesty, I have proof of the betrayal!"',
      'Player: "Lord Blackwood is the traitor!"',
      'King: "This is a grave accusation. Show me your evidence."',
    ])
    .withWorldEffect('traitor_accused', true)
    .withStoryEffect('tension', 80)
    .build();

  dramaManager.addBeat(beatAccuse);

  console.log('--- Scenario 1: Not ready (missing everything) ---');
  console.log(`  Location: ${worldState.get('player_location')}`);
  console.log(`  Has evidence: ${worldState.get('has_evidence')}`);
  console.log(`  King trust: ${worldState.get('king_trust')}`);
  console.log(`  Traitor present: ${worldState.get('traitor_present') || false}`);
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));

  console.log('\n--- Scenario 2: Have evidence, but trust too low ---');
  worldState.set('has_evidence', true);
  worldState.set('traitor_present', true);
  console.log(`  Has evidence: ${worldState.get('has_evidence')}`);
  console.log(`  King trust: ${worldState.get('king_trust')}`);
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));

  console.log('\n--- Scenario 3: All conditions met! ---');
  worldState.set('king_trust', 70);
  console.log(`  Location: ${worldState.get('player_location')}`);
  console.log(`  Has evidence: ${worldState.get('has_evidence')}`);
  console.log(`  King trust: ${worldState.get('king_trust')}`);
  console.log(`  Traitor present: ${worldState.get('traitor_present')}`);
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\nExpected: Beat only triggers when ALL conditions are satisfied');
}

// ===== EXAMPLE 6: Alternative Beats Based on Conditions =====

export async function testAlternativeBeats(): Promise<void> {
  console.log('\n===== Example 6: Alternative Beats Based on Conditions =====\n');

  const worldState = new WorldState();
  worldState.set('player_gold', 100);
  worldState.set('player_reputation', 50);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat 1: Rich merchant approach (high gold)
  const beatRichApproach = new BeatBuilder('rich_approach', 'Merchant: Wealthy Customer')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.greaterOrEqual('player_gold', 100))
    .withNarration('The merchant bows deeply. "Welcome, honored patron!"')
    .build();

  // Beat 2: Regular merchant approach (medium gold)
  const beatRegularApproach = new BeatBuilder('regular_approach', 'Merchant: Regular Customer')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.greaterOrEqual('player_gold', 20),
        PreconditionBuilder.lessThan('player_gold', 100)
      )
    )
    .withNarration('The merchant nods. "What can I get for you today?"')
    .build();

  // Beat 3: Poor merchant approach (low gold)
  const beatPoorApproach = new BeatBuilder('poor_approach', 'Merchant: Poor Customer')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.lessThan('player_gold', 20))
    .withNarration('The merchant eyes you suspiciously. "Can you even afford anything?"')
    .build();

  // Beat 4: Hero greeting (high reputation)
  const beatHeroGreeting = new BeatBuilder('hero_greeting', 'Hero Recognition')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(PreconditionBuilder.greaterOrEqual('player_reputation', 80))
    .withNarration('The crowd parts as they recognize the hero!')
    .build();

  dramaManager.addBeats([beatRichApproach, beatRegularApproach, beatPoorApproach, beatHeroGreeting]);

  console.log('--- Wealthy player (gold: 100) ---');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Regular player (gold: 50) ---');
  worldState.set('player_gold', 50);
  dramaManager.reset();
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Poor player (gold: 5) ---');
  worldState.set('player_gold', 5);
  dramaManager.reset();
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Famous hero (gold: 50, reputation: 90) ---');
  worldState.set('player_gold', 50);
  worldState.set('player_reputation', 90);
  dramaManager.reset();
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\nExpected: Different beats based on player state');
}

// ===== EXAMPLE 7: Sequential Story Progression =====

export async function testSequentialProgression(): Promise<void> {
  console.log('\n===== Example 7: Sequential Story Progression =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: { tension: 10 },
  });

  // Act 1: Setup
  const beatAct1 = new BeatBuilder('act1_setup', 'Act 1: The Call to Adventure')
    .withPriority(BeatPriority.HIGH)
    .withNarration('A mysterious stranger offers you a quest.')
    .withWorldEffect('act1_complete', true)
    .withStoryEffect('tension', 10)
    .build();

  // Act 2: Confrontation (requires Act 1)
  const beatAct2 = new BeatBuilder('act2_confrontation', 'Act 2: Rising Conflict')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('act1_complete'))
    .withNarration('Your enemy reveals themselves!')
    .withWorldEffect('act2_complete', true)
    .withStoryEffect('tension', 30)
    .build();

  // Act 3: Resolution (requires Act 2)
  const beatAct3 = new BeatBuilder('act3_resolution', 'Act 3: Final Showdown')
    .withPriority(BeatPriority.CRITICAL)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.isTrue('act1_complete'),
        PreconditionBuilder.isTrue('act2_complete')
      )
    )
    .withNarration('The final battle begins!')
    .withWorldEffect('act3_complete', true)
    .withStoryEffect('tension', 50)
    .build();

  dramaManager.addBeats([beatAct1, beatAct2, beatAct3]);

  console.log('--- Beginning: Only Act 1 available ---');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- After Act 1: Act 2 unlocked ---');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- After Act 2: Act 3 unlocked ---');
  console.log('Available beats:', dramaManager.getAvailableBeats().map(b => b.name));
  dramaManager.advance();

  console.log('\n--- Final state ---');
  console.log('Story progression:', {
    act1: worldState.get('act1_complete'),
    act2: worldState.get('act2_complete'),
    act3: worldState.get('act3_complete'),
  });

  console.log('\nExpected: Acts unlock sequentially based on completion');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllBeatPreconditionExamples(): Promise<void> {
  await testLocationPreconditions();
  await new Promise(r => setTimeout(r, 1000));

  await testInventoryPreconditions();
  await new Promise(r => setTimeout(r, 1000));

  await testRelationshipPreconditions();
  await new Promise(r => setTimeout(r, 1000));

  await testTimePreconditions();
  await new Promise(r => setTimeout(r, 1000));

  await testComplexPreconditions();
  await new Promise(r => setTimeout(r, 1000));

  await testAlternativeBeats();
  await new Promise(r => setTimeout(r, 1000));

  await testSequentialProgression();
}

// Run if executed directly
if (require.main === module) {
  runAllBeatPreconditionExamples().catch(console.error);
}
