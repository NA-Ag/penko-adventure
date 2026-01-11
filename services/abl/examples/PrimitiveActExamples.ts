/**
 * PrimitiveActExamples - FACADE 3.10
 *
 * Examples demonstrating primitive acts (atomic game actions).
 *
 * Primitive acts are leaf nodes that directly interface with the game:
 * - Say: Dialogue output
 * - Gesture: Physical emotes
 * - MoveTo: Character movement
 * - LookAt: Gaze direction
 * - PlayAnimation: Character animations
 * - PlaySound: Audio effects
 * - SetExpression: Facial expressions
 * - Wait: Timing pauses
 */

import { WorldState } from '../WorldState';
import {
  Say,
  Gesture,
  GestureType,
  MoveTo,
  LookAt,
  PlayAnimation,
  PlaySound,
  SetExpression,
  Expression,
  Wait,
  setPrimitiveActOutput,
  createConversation,
  createGestureSequence,
} from '../PrimitiveAct';
import { SequentialBehavior, RecoveryStrategy } from '../SequentialBehavior';
import { ParallelBehavior, ParallelCompletionStrategy } from '../ParallelBehavior';

// ===== EXAMPLE 1: Basic Dialogue =====

export async function testBasicDialogue(): Promise<void> {
  console.log('\n===== Example 1: Basic Dialogue =====\n');

  const worldState = new WorldState();

  // Simple dialogue
  const greet = new Say('bartender', 'Welcome to the tavern!');
  await greet.execute(worldState);

  // Dialogue with emotion
  const cheerful = Say.happy('bartender', 'So glad you could make it!');
  await cheerful.execute(worldState);

  const angry = Say.angry('bartender', 'Get out of my tavern!');
  await angry.execute(worldState);

  const sad = Say.sad('bartender', 'Times have been tough lately...');
  await sad.execute(worldState);

  console.log('\n--- World State ---');
  console.log('Last speaker:', worldState.get('last_speaker'));
  console.log('Last speech:', worldState.get('last_speech_bartender'));

  console.log('\nExpected: Four dialogue lines with different emotions');
}

// ===== EXAMPLE 2: Gestures and Emotes =====

export async function testGestures(): Promise<void> {
  console.log('\n===== Example 2: Gestures and Emotes =====\n');

  const worldState = new WorldState();

  // Various gestures
  await Gesture.wave('bartender', 'player').execute(worldState);
  await Gesture.nod('bartender').execute(worldState);
  await Gesture.point('bartender', 'door').execute(worldState);

  await new Gesture('bartender', GestureType.THUMBS_UP).execute(worldState);
  await new Gesture('bartender', GestureType.BOW).execute(worldState);

  console.log('\nExpected: Five different gestures performed');
}

// ===== EXAMPLE 3: Movement =====

export async function testMovement(): Promise<void> {
  console.log('\n===== Example 3: Movement =====\n');

  const worldState = new WorldState();

  console.log('--- Bartender moves around tavern ---');

  // Normal speed movement
  await new MoveTo('bartender', 'bar').execute(worldState);
  console.log('Current location:', worldState.get('location_bartender'));

  // Fast movement
  await MoveTo.fast('bartender', 'cellar').execute(worldState);
  console.log('Current location:', worldState.get('location_bartender'));

  // Slow movement
  await MoveTo.slow('bartender', 'kitchen').execute(worldState);
  console.log('Current location:', worldState.get('location_bartender'));

  console.log('\nExpected: Three movements at different speeds');
}

// ===== EXAMPLE 4: Look At and Expressions =====

export async function testLookAndExpression(): Promise<void> {
  console.log('\n===== Example 4: Look At and Expressions =====\n');

  const worldState = new WorldState();

  // Look at target
  await new LookAt('bartender', 'player').execute(worldState);

  // Change expressions
  await SetExpression.happy('bartender').execute(worldState);
  await new Wait('bartender', 1000).execute(worldState);

  await SetExpression.surprised('bartender').execute(worldState);
  await new Wait('bartender', 1000).execute(worldState);

  await SetExpression.angry('bartender').execute(worldState);

  console.log('\n--- World State ---');
  console.log('Looking at:', worldState.get('looking_at_bartender'));
  console.log('Expression:', worldState.get('expression_bartender'));

  console.log('\nExpected: Gaze and expression changes');
}

// ===== EXAMPLE 5: Animations and Sounds =====

export async function testAnimationsAndSounds(): Promise<void> {
  console.log('\n===== Example 5: Animations and Sounds =====\n');

  const worldState = new WorldState();

  // Play animation
  await new PlayAnimation('bartender', 'pour_drink', 1500).execute(worldState);

  // Play sound
  await new PlaySound('bartender', 'glass_clink', 0.8).execute(worldState);

  // Another animation
  await new PlayAnimation('bartender', 'wipe_bar', 2000).execute(worldState);

  console.log('\nExpected: Animations and sounds played');
}

// ===== EXAMPLE 6: Conversation Sequence =====

export async function testConversationSequence(): Promise<void> {
  console.log('\n===== Example 6: Conversation Sequence =====\n');

  const worldState = new WorldState();

  console.log('--- Two-person conversation ---\n');

  const conversation = createConversation([
    { actor: 'bartender', text: 'What can I get for you?', emotion: 'friendly' },
    { actor: 'player', text: 'I\'ll have an ale, please.' },
    { actor: 'bartender', text: 'Coming right up!', emotion: 'happy' },
    { actor: 'player', text: 'Have you heard any news from the capital?' },
    { actor: 'bartender', text: 'Aye, dark times ahead...', emotion: 'worried' },
  ]);

  for (const say of conversation) {
    await say.execute(worldState);
    await new Wait('system', 800).execute(worldState); // Pause between lines
  }

  console.log('\nExpected: Natural conversation flow with pauses');
}

// ===== EXAMPLE 7: Coordinated Action (Sequential) =====

export async function testCoordinatedAction(): Promise<void> {
  console.log('\n===== Example 7: Coordinated Action (Sequential) =====\n');

  const worldState = new WorldState();

  console.log('--- Bartender serves drink ---\n');

  const serveDrink = new SequentialBehavior('serve_drink', 'Serve Drink', 60, 0.8);

  // Step 1: Greet
  serveDrink.addStep(
    new Say('bartender', 'Coming right up!'),
    RecoveryStrategy.FAIL
  );

  // Step 2: Move to bar
  serveDrink.addStep(
    new MoveTo('bartender', 'bar'),
    RecoveryStrategy.FAIL
  );

  // Step 3: Pour drink animation
  serveDrink.addStep(
    new PlayAnimation('bartender', 'pour_drink', 1500),
    RecoveryStrategy.FAIL
  );

  // Step 4: Sound effect
  serveDrink.addStep(
    new PlaySound('bartender', 'liquid_pour', 0.7),
    RecoveryStrategy.FAIL
  );

  // Step 5: Deliver
  serveDrink.addStep(
    new Say('bartender', 'Here you go! Enjoy!', 'cheerful'),
    RecoveryStrategy.FAIL
  );

  // Step 6: Gesture
  serveDrink.addStep(
    Gesture.wave('bartender', 'player'),
    RecoveryStrategy.FAIL
  );

  await serveDrink.execute(worldState);

  console.log('\nExpected: Complete drink service sequence');
}

// ===== EXAMPLE 8: Simultaneous Actions (Parallel) =====

export async function testSimultaneousActions(): Promise<void> {
  console.log('\n===== Example 8: Simultaneous Actions (Parallel) =====\n');

  const worldState = new WorldState();

  console.log('--- Bartender talks while gesturing ---\n');

  const talkAndGesture = new ParallelBehavior(
    'talk_and_gesture',
    'Talk and Gesture',
    60,
    0.8,
    ParallelCompletionStrategy.ALL
  );

  // Speech
  talkAndGesture.addTask(
    new Say('bartender', 'The dragon attacked from the north!', 'dramatic'),
    ['voice']
  );

  // Gestures while talking
  talkAndGesture.addTask(
    Gesture.point('bartender', 'north'),
    ['hands']
  );

  // Facial expression
  talkAndGesture.addTask(
    SetExpression.fearful('bartender'),
    ['face']
  );

  await talkAndGesture.execute(worldState);

  console.log('\nExpected: Speech, gesture, and expression happen together');
}

// ===== EXAMPLE 9: Custom Output Handler =====

export async function testCustomOutputHandler(): Promise<void> {
  console.log('\n===== Example 9: Custom Output Handler =====\n');

  const worldState = new WorldState();

  // Track outputs
  const outputs: string[] = [];

  // Set custom handler
  setPrimitiveActOutput({
    onSay: (speaker, text, emotion) => {
      outputs.push(`[OUTPUT] ${speaker} says: "${text}" ${emotion ? `(${emotion})` : ''}`);
    },
    onGesture: (actor, gestureType, target) => {
      outputs.push(`[OUTPUT] ${actor} ${gestureType}${target ? ` at ${target}` : ''}`);
    },
    onMoveTo: (actor, destination) => {
      outputs.push(`[OUTPUT] ${actor} moves to ${destination}`);
    },
  });

  console.log('--- Actions with custom handler ---\n');

  await new Say('bartender', 'Welcome!', 'friendly').execute(worldState);
  await Gesture.wave('bartender', 'player').execute(worldState);
  await new MoveTo('bartender', 'bar').execute(worldState);

  console.log('\n--- Captured Outputs ---');
  outputs.forEach(output => console.log(output));

  console.log('\nExpected: Output handler captured all primitive acts');

  // Reset handler
  setPrimitiveActOutput({});
}

// ===== EXAMPLE 10: Complex Interaction =====

export async function testComplexInteraction(): Promise<void> {
  console.log('\n===== Example 10: Complex Interaction (Dramatic Scene) =====\n');

  const worldState = new WorldState();

  console.log('--- Tense confrontation ---\n');

  // Setup
  await SetExpression.neutral('bartender').execute(worldState);
  await new LookAt('bartender', 'stranger').execute(worldState);

  // Stranger enters
  await MoveTo.slow('stranger', 'bar_center').execute(worldState);
  await new PlaySound('stranger', 'footsteps_heavy', 0.6).execute(worldState);

  // Bartender notices
  await SetExpression.surprised('bartender').execute(worldState);
  await new Say('bartender', 'You...', 'shocked').execute(worldState);

  // Pause
  await new Wait('system', 1000).execute(worldState);

  // Stranger responds
  await SetExpression.angry('stranger').execute(worldState);
  await new Say('stranger', 'We meet again, old friend.', 'menacing').execute(worldState);
  await Gesture.point('stranger', 'bartender').execute(worldState);

  // Bartender backs away
  await SetExpression.fearful('bartender').execute(worldState);
  await MoveTo.fast('bartender', 'back_door').execute(worldState);
  await new Say('bartender', 'I thought you were dead!', 'terrified').execute(worldState);

  // Stranger laughs
  await new PlayAnimation('stranger', 'evil_laugh', 2000).execute(worldState);
  await new PlaySound('stranger', 'laugh_evil', 0.8).execute(worldState);

  console.log('\n--- Scene Complete ---');
  console.log('Bartender location:', worldState.get('location_bartender'));
  console.log('Bartender expression:', worldState.get('expression_bartender'));
  console.log('Stranger expression:', worldState.get('expression_stranger'));

  console.log('\nExpected: Dramatic cinematic sequence with multiple primitive acts');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllPrimitiveActExamples(): Promise<void> {
  await testBasicDialogue();
  await new Promise(r => setTimeout(r, 1000));

  await testGestures();
  await new Promise(r => setTimeout(r, 1000));

  await testMovement();
  await new Promise(r => setTimeout(r, 1000));

  await testLookAndExpression();
  await new Promise(r => setTimeout(r, 1000));

  await testAnimationsAndSounds();
  await new Promise(r => setTimeout(r, 1000));

  await testConversationSequence();
  await new Promise(r => setTimeout(r, 1000));

  await testCoordinatedAction();
  await new Promise(r => setTimeout(r, 1000));

  await testSimultaneousActions();
  await new Promise(r => setTimeout(r, 1000));

  await testCustomOutputHandler();
  await new Promise(r => setTimeout(r, 1000));

  await testComplexInteraction();
}

// Run if executed directly
if (require.main === module) {
  runAllPrimitiveActExamples().catch(console.error);
}
