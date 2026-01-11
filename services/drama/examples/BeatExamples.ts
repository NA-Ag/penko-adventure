/**
 * BeatExamples - FACADE 4.1
 *
 * Examples demonstrating beat-based narrative structure.
 *
 * Beats are narrative segments that:
 * - Represent story moments
 * - Have preconditions (when can they trigger?)
 * - Have effects (story values and world state changes)
 * - Progress the story dynamically
 */

import { WorldState } from '../../abl/WorldState';
import { PreconditionBuilder } from '../../abl/Precondition';
import { Beat, BeatBuilder, BeatPriority } from '../Beat';
import { DramaManager } from '../DramaManager';

// ===== EXAMPLE 1: Simple Beat Sequence =====

export async function testSimpleBeatSequence(): Promise<void> {
  console.log('\n===== Example 1: Simple Beat Sequence =====\n');

  const worldState = new WorldState();
  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      tension: 0,
      affinity: 50,
    },
  });

  // Beat 1: Player Arrives
  const beatArrive = new BeatBuilder('arrive', 'Player Arrives at Tavern')
    .withDescription('Player enters the tavern for the first time')
    .withPriority(BeatPriority.NORMAL)
    .withWorldEffect('player_at_tavern', true)
    .withStoryEffect('tension', 5)
    .withNarration('You push open the heavy wooden door and step into the warm, crowded tavern.')
    .build();

  // Beat 2: Meet Bartender (requires arrival)
  const beatMeet = new BeatBuilder('meet_bartender', 'Meet the Bartender')
    .withDescription('First conversation with bartender')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('player_at_tavern'))
    .withWorldEffect('met_bartender', true)
    .withStoryEffect('affinity', 10)
    .withDialogue([
      'Bartender: "Welcome, stranger! What brings you to our humble establishment?"',
      'Player: "Just passing through. I\'ll have an ale."',
      'Bartender: "Coming right up!"',
    ])
    .build();

  // Beat 3: Learn About Quest (requires meeting bartender)
  const beatQuest = new BeatBuilder('learn_quest', 'Learn About the Dragon')
    .withDescription('Bartender tells player about the dragon')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('met_bartender'))
    .withWorldEffect('knows_about_dragon', true)
    .withStoryEffect('tension', 20)
    .withStoryEffect('urgency', 30)
    .withDialogue([
      'Bartender: "You look like an adventurer. Perhaps you can help us."',
      'Bartender: "A dragon has been terrorizing the nearby villages."',
      'Player: "A dragon? That\'s serious."',
    ])
    .build();

  dramaManager.addBeats([beatArrive, beatMeet, beatQuest]);

  console.log('--- Initial State ---');
  console.log('Story Values:', dramaManager.getAllStoryValues());

  // Execute beats in sequence
  console.log('\n--- Beat 1 ---');
  dramaManager.advance();

  console.log('\n--- Beat 2 ---');
  dramaManager.advance();

  console.log('\n--- Beat 3 ---');
  dramaManager.advance();

  console.log('\n--- Final State ---');
  console.log('Story Values:', dramaManager.getAllStoryValues());
  console.log('World State:', worldState.toObject());
  console.log('\nExpected: Three beats executed in order, tension and affinity increased');
}

// ===== EXAMPLE 2: Conditional Beats =====

export async function testConditionalBeats(): Promise<void> {
  console.log('\n===== Example 2: Conditional Beats =====\n');

  const worldState = new WorldState();
  worldState.set('player_gold', 50);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Beat: Buy Drink (requires gold)
  const beatBuy = new BeatBuilder('buy_drink', 'Buy Expensive Drink')
    .withDescription('Player buys expensive wine')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.greaterOrEqual('player_gold', 30))
    .withWorldEffect('has_wine', true)
    .withNarration('You purchase a bottle of fine wine for 30 gold.')
    .build();

  // Beat: Can't Afford (alternative if no gold)
  const beatCantAfford = new BeatBuilder('cant_afford', 'Can\'t Afford Drink')
    .withDescription('Player doesn\'t have enough gold')
    .withPriority(BeatPriority.LOW)
    .withPreconditionBuilder(PreconditionBuilder.lessThan('player_gold', 30))
    .withNarration('You don\'t have enough gold for the expensive wine.')
    .build();

  dramaManager.addBeats([beatBuy, beatCantAfford]);

  console.log('--- Scenario A: Has 50 gold (can afford) ---');
  dramaManager.advance();

  console.log('\n--- Change gold to 20 ---');
  worldState.set('player_gold', 20);
  dramaManager.reset();

  console.log('\n--- Scenario B: Has 20 gold (can\'t afford) ---');
  dramaManager.advance();

  console.log('\nExpected: Different beats trigger based on gold amount');
}

// ===== EXAMPLE 3: Priority System =====

export async function testBeatPriority(): Promise<void> {
  console.log('\n===== Example 3: Beat Priority System =====\n');

  const worldState = new WorldState();
  worldState.set('player_at_tavern', true);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Low priority: Idle chatter
  const beatIdle = new BeatBuilder('idle_chatter', 'Idle Chatter')
    .withPriority(BeatPriority.LOW)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('player_at_tavern'))
    .withNarration('The patrons chat idly about the weather.')
    .build();

  // Normal priority: Serve drink
  const beatServe = new BeatBuilder('serve_drink', 'Serve Drink')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('player_at_tavern'))
    .withNarration('The bartender serves you a drink.')
    .build();

  // High priority: Important visitor
  const beatVisitor = new BeatBuilder('visitor_arrives', 'Important Visitor Arrives')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('player_at_tavern'))
    .withNarration('A hooded figure enters the tavern. Everyone falls silent.')
    .withStoryEffect('tension', 25)
    .build();

  // Critical priority: Fire!
  const beatFire = new BeatBuilder('fire_breaks_out', 'Fire Breaks Out!')
    .withPriority(BeatPriority.CRITICAL)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('player_at_tavern'))
    .withNarration('FIRE! The kitchen is ablaze!')
    .withStoryEffect('tension', 50)
    .build();

  dramaManager.addBeats([beatIdle, beatServe, beatVisitor, beatFire]);

  console.log('--- All beats available, which triggers? ---');
  const available = dramaManager.getAvailableBeats();
  console.log('Available beats:', available.map(b => `${b.name} (priority: ${b.priority})`).join(', '));

  dramaManager.advance();

  console.log('\nExpected: CRITICAL priority beat (Fire) executes first');
}

// ===== EXAMPLE 4: Repeatable Beats with Cooldown =====

export async function testRepeatableBeats(): Promise<void> {
  console.log('\n===== Example 4: Repeatable Beats with Cooldown =====\n');

  const worldState = new WorldState();
  worldState.set('in_combat', true);

  const dramaManager = new DramaManager(worldState, { debug: true });

  // Repeatable beat with 3-second cooldown
  const beatAttack = new BeatBuilder('monster_attacks', 'Monster Attacks')
    .withPriority(BeatPriority.NORMAL)
    .withPreconditionBuilder(PreconditionBuilder.isTrue('in_combat'))
    .withStoryEffect('tension', 5, { min: 0, max: 100 })
    .withNarration('The monster swings its claws at you!')
    .repeatable(true)
    .withCooldown(3000) // 3 seconds
    .build();

  dramaManager.addBeat(beatAttack);

  console.log('--- Attack 1 ---');
  dramaManager.advance();

  console.log('\n--- Try attack 2 (should fail - cooldown) ---');
  const result2 = dramaManager.advance();
  if (!result2) {
    console.log('Attack blocked by cooldown');
  }

  console.log('\n--- Wait 3 seconds ---');
  await new Promise(r => setTimeout(r, 3000));

  console.log('\n--- Attack 3 (cooldown expired) ---');
  dramaManager.advance();

  console.log('\nExpected: Attack 1 succeeds, attack 2 blocked, attack 3 succeeds after cooldown');
}

// ===== EXAMPLE 5: Story Value Effects =====

export async function testStoryValueEffects(): Promise<void> {
  console.log('\n===== Example 5: Story Value Effects =====\n');

  const worldState = new WorldState();

  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      tension: 20,
      affinity: 50,
      mystery: 0,
      urgency: 0,
    },
  });

  // Beat: Hear Scream (increases tension and urgency)
  const beatScream = new BeatBuilder('hear_scream', 'Hear a Scream')
    .withPriority(BeatPriority.HIGH)
    .withStoryEffect('tension', 30, { min: 0, max: 100 })
    .withStoryEffect('urgency', 25, { min: 0, max: 100 })
    .withNarration('A blood-curdling scream echoes through the night!')
    .build();

  // Beat: Find Clue (increases mystery)
  const beatClue = new BeatBuilder('find_clue', 'Find Mysterious Clue')
    .withPriority(BeatPriority.NORMAL)
    .withStoryEffect('mystery', 20, { min: 0, max: 100 })
    .withStoryEffect('tension', -5, { min: 0, max: 100 }) // Reduces tension slightly
    .withNarration('You discover a strange symbol carved into the wall.')
    .build();

  // Beat: Calm Down (reduces tension)
  const beatCalm = new BeatBuilder('calm_down', 'Take a Deep Breath')
    .withPriority(BeatPriority.LOW)
    .withStoryEffect('tension', -15, { min: 0, max: 100 })
    .withNarration('You take a moment to collect yourself.')
    .build();

  dramaManager.addBeats([beatScream, beatClue, beatCalm]);

  console.log('--- Initial Story Values ---');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Hear Scream ---');
  dramaManager.executeBeat('hear_scream');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Find Clue ---');
  dramaManager.executeBeat('find_clue');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Calm Down ---');
  dramaManager.executeBeat('calm_down');
  console.log(dramaManager.getAllStoryValues());

  console.log('\nExpected: Story values change based on beat effects');
}

// ===== EXAMPLE 6: Fantasy Quest Sequence =====

export async function testFantasyQuestSequence(): Promise<void> {
  console.log('\n===== Example 6: Fantasy Quest Sequence =====\n');

  const worldState = new WorldState();
  worldState.set('player_location', 'plaza');

  const dramaManager = new DramaManager(worldState, {
    debug: true,
    initialStoryValues: {
      tension: 10,
      urgency: 0,
    },
  });

  // Beat 1: Meet the Wizard
  const beatMeetWizard = new BeatBuilder('meet_wizard', 'Meet the Wizard')
    .withDescription('Player encounters the wizard at the plaza')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(PreconditionBuilder.equals('player_location', 'plaza'))
    .withWorldEffect('wizard_met', true)
    .withStoryEffect('tension', 10)
    .withDialogue([
      'Wizard: "Ah, at last! I\'ve been searching for someone like you."',
      'Player: "Me? What do you mean?"',
      'Wizard: "You have the mark of destiny upon you."',
    ])
    .build();

  // Beat 2: Learn About Dragon (requires meeting wizard)
  const beatLearnDragon = new BeatBuilder('learn_dragon', 'Learn About Dragon')
    .withDescription('Wizard explains the dragon threat')
    .withPriority(BeatPriority.HIGH)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.isTrue('wizard_met'),
        PreconditionBuilder.equals('player_location', 'plaza')
      )
    )
    .withWorldEffect('dragon_knowledge', true)
    .withStoryEffect('tension', 15)
    .withStoryEffect('urgency', 30)
    .withDialogue([
      'Wizard: "A great dragon has awoken in the mountains."',
      'Wizard: "It will destroy everything unless someone stops it."',
      'Player: "And you think I can stop it?"',
      'Wizard: "You are our only hope."',
    ])
    .build();

  // Beat 3: Dragon Appears (requires dragon knowledge + at forest)
  const beatDragonAppears = new BeatBuilder('dragon_appears', 'Dragon Appears!')
    .withDescription('The dragon makes its dramatic entrance')
    .withPriority(BeatPriority.CRITICAL)
    .withPreconditionBuilder(
      PreconditionBuilder.all(
        PreconditionBuilder.isTrue('dragon_knowledge'),
        PreconditionBuilder.equals('player_location', 'forest')
      )
    )
    .withWorldEffect('dragon_encountered', true)
    .withStoryEffect('tension', 50, { min: 0, max: 100 })
    .withStoryEffect('urgency', 40, { min: 0, max: 100 })
    .withNarration(
      'The sky darkens as massive wings blot out the sun. The dragon descends with a deafening roar!'
    )
    .build();

  dramaManager.addBeats([beatMeetWizard, beatLearnDragon, beatDragonAppears]);

  console.log('--- Step 1: At plaza ---');
  dramaManager.advance();

  console.log('\n--- Step 2: Still at plaza ---');
  dramaManager.advance();

  console.log('\n--- Step 3: Travel to forest ---');
  worldState.set('player_location', 'forest');

  console.log('\n--- Step 4: Dragon appears! ---');
  dramaManager.advance();

  console.log('\n--- Final Story Values ---');
  console.log(dramaManager.getAllStoryValues());

  console.log('\n--- Narrative Summary ---');
  console.log(dramaManager.getNarrativeSummary());

  console.log('\nExpected: Three-act quest structure with escalating tension');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllBeatExamples(): Promise<void> {
  await testSimpleBeatSequence();
  await new Promise(r => setTimeout(r, 1000));

  await testConditionalBeats();
  await new Promise(r => setTimeout(r, 1000));

  await testBeatPriority();
  await new Promise(r => setTimeout(r, 1000));

  await testRepeatableBeats();
  await new Promise(r => setTimeout(r, 1000));

  await testStoryValueEffects();
  await new Promise(r => setTimeout(r, 1000));

  await testFantasyQuestSequence();
}

// Run if executed directly
if (require.main === module) {
  runAllBeatExamples().catch(console.error);
}
