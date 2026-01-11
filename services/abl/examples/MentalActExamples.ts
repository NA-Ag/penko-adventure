/**
 * MentalActExamples - FACADE 3.9
 *
 * Examples demonstrating mental acts (internal reasoning).
 *
 * Mental acts update NPC's cognitive state without external actions:
 * - Remember: Store events, facts, emotions
 * - Forget: Remove memories
 * - Decide: Make internal decisions
 * - Infer: Draw conclusions from evidence
 * - Evaluate: Assess people and situations
 * - Plan: Formulate future intentions
 */

import { BehaviorStatus } from '../Behavior';
import { WorldState } from '../WorldState';
import {
  RememberAct,
  ForgetAct,
  DecideAct,
  InferAct,
  EvaluateAct,
  PlanAct,
  getMemoriesAbout,
  getAllMemories,
  getBeliefs,
  hasBelief,
  getEvaluation,
  getCurrentDecision,
  getCurrentPlan,
} from '../MentalAct';

// ===== EXAMPLE 1: NPC Remembers Player Insulted Them =====

export async function testRememberInsult(): Promise<void> {
  console.log('\n===== Example 1: NPC Remembers Player Insulted Them =====\n');

  const worldState = new WorldState();

  console.log('--- Player insults bartender ---');
  console.log('Player: "Your drinks are terrible!"');

  // Bartender remembers the insult
  const rememberInsult = RememberAct.emotional(
    'Player insulted my drinks',
    -0.8, // Very negative emotion
    'player',
    0.9 // High importance
  );

  await rememberInsult.execute(worldState);

  // Check memories
  const memoriesAboutPlayer = getMemoriesAbout(worldState, 'player');

  console.log('\n--- Bartender\'s Memories About Player ---');
  for (const memory of memoriesAboutPlayer) {
    console.log(`  - "${memory.content}" (${memory.type})`);
    console.log(`    Importance: ${memory.importance}, Emotion: ${memory.emotionalValence}`);
  }

  console.log('\nExpected: Bartender remembers insult with negative emotion');
}

// ===== EXAMPLE 2: NPC Infers Player is Untrustworthy =====

export async function testInferUntrustworthy(): Promise<void> {
  console.log('\n===== Example 2: NPC Infers Player is Untrustworthy =====\n');

  const worldState = new WorldState();

  console.log('--- Observing player behavior ---');

  // Bartender observes evidence
  console.log('1. Player tried to pay with fake coins');
  await RememberAct.event('Player used counterfeit coins', 'player', 0.7).execute(worldState);

  console.log('2. Player lied about knowing the innkeeper');
  await RememberAct.event('Player lied about innkeeper', 'player', 0.6).execute(worldState);

  console.log('3. Player was caught stealing bread');
  await RememberAct.event('Player stole bread', 'player', 0.8).execute(worldState);

  console.log('\n--- Bartender draws conclusion ---');

  // Infer player is untrustworthy based on evidence
  const inferUntrustworthy = new InferAct(
    'Player is untrustworthy',
    [
      'Used counterfeit coins',
      'Lied about innkeeper',
      'Caught stealing bread',
    ],
    0.85 // High confidence
  );

  await inferUntrustworthy.execute(worldState);

  // Also evaluate player's trustworthiness
  const evaluateTrust = EvaluateAct.trustworthiness('player', -0.8);
  await evaluateTrust.execute(worldState);

  // Check beliefs
  const beliefs = getBeliefs(worldState);

  console.log('\n--- Bartender\'s Beliefs ---');
  for (const belief of beliefs) {
    console.log(`  - "${belief.statement}"`);
    console.log(`    Confidence: ${belief.confidence.toFixed(2)}`);
    console.log(`    Evidence: ${belief.evidence.join(', ')}`);
  }

  // Check evaluation
  const trustScore = getEvaluation(worldState, 'player', 'trustworthiness');
  console.log(`\n--- Trustworthiness Score: ${trustScore?.toFixed(2)} ---`);

  console.log('\nExpected: Bartender believes player is untrustworthy based on evidence');
}

// ===== EXAMPLE 3: Decide Between Options =====

export async function testDecideAction(): Promise<void> {
  console.log('\n===== Example 3: Decide Between Options =====\n');

  const worldState = new WorldState();

  console.log('--- Situation: Bar is closing, player still inside ---');

  // Bartender considers options
  const decide = new DecideAct(
    'Ask player to leave politely',
    'Player is regular customer, want to maintain relationship',
    [
      'Force player out (would damage relationship)',
      'Let player stay (would delay closing)',
      'Ask player to leave politely (balanced approach)',
    ]
  );

  await decide.execute(worldState);

  // Check decision
  const currentDecision = getCurrentDecision(worldState);

  console.log('\n--- Bartender\'s Decision ---');
  console.log(`Decision: "${currentDecision}"`);

  console.log('\nExpected: Bartender decided to ask politely');
}

// ===== EXAMPLE 4: Remember and Forget =====

export async function testRememberAndForget(): Promise<void> {
  console.log('\n===== Example 4: Remember and Forget =====\n');

  const worldState = new WorldState();

  console.log('--- Storing multiple memories ---');

  // Store several memories
  await RememberAct.fact('Bar opens at 6pm', undefined, 0.5).execute(worldState);
  await RememberAct.fact('Ale costs 3 gold', undefined, 0.4).execute(worldState);
  await RememberAct.event('Wizard visited yesterday', 'wizard', 0.6).execute(worldState);
  await RememberAct.intention('Clean bar before closing', undefined, 0.7).execute(worldState);

  console.log('\n--- Current Memories ---');
  let memories = getAllMemories(worldState);
  memories.forEach((m, i) => console.log(`${i + 1}. "${m.content}" (${m.type})`));

  console.log('\n--- Forgetting outdated information ---');

  // Forget old event
  const forget = new ForgetAct('Wizard visited yesterday');
  await forget.execute(worldState);

  console.log('\n--- Updated Memories ---');
  memories = getAllMemories(worldState);
  memories.forEach((m, i) => console.log(`${i + 1}. "${m.content}" (${m.type})`));

  console.log('\nExpected: Wizard memory removed, others remain');
}

// ===== EXAMPLE 5: Formulate Plan =====

export async function testFormPlan(): Promise<void> {
  console.log('\n===== Example 5: Formulate Plan =====\n');

  const worldState = new WorldState();

  console.log('--- Bartender plans to prepare for busy night ---');

  // Create plan
  const plan = new PlanAct(
    'Prepare for busy night',
    [
      'Stock up on ale and wine',
      'Clean all tables and mugs',
      'Prepare extra food',
      'Light candles and torches',
      'Greet first customers warmly',
    ]
  );

  await plan.execute(worldState);

  // Check plan
  const currentPlan = getCurrentPlan(worldState);

  console.log('\n--- Current Plan ---');
  console.log(`Goal: "${currentPlan}"`);

  console.log('\nExpected: Bartender has plan with 5 steps');
}

// ===== EXAMPLE 6: Complex Reasoning Chain =====

export async function testComplexReasoning(): Promise<void> {
  console.log('\n===== Example 6: Complex Reasoning Chain =====\n');

  const worldState = new WorldState();

  console.log('--- Scenario: Stranger enters bar, acts suspiciously ---\n');

  // Step 1: Remember observations
  console.log('Step 1: Remember observations');
  await RememberAct.event('Stranger wearing hood, hiding face', 'stranger', 0.7).execute(worldState);
  await RememberAct.event('Stranger keeps looking at door', 'stranger', 0.6).execute(worldState);
  await RememberAct.event('Stranger has weapon on belt', 'stranger', 0.8).execute(worldState);

  // Step 2: Evaluate threat
  console.log('\nStep 2: Evaluate threat level');
  await EvaluateAct.threat('stranger', 0.6).execute(worldState);

  // Step 3: Infer danger
  console.log('\nStep 3: Infer potential danger');
  await new InferAct(
    'Stranger might be dangerous',
    [
      'Hiding identity with hood',
      'Watching door nervously',
      'Armed with weapon',
    ],
    0.7
  ).execute(worldState);

  // Step 4: Decide action
  console.log('\nStep 4: Decide how to respond');
  await new DecideAct(
    'Watch stranger carefully but act normal',
    'Don\'t want to provoke, but need to stay alert',
    [
      'Confront stranger immediately (risky)',
      'Ignore stranger (dangerous)',
      'Watch carefully (balanced)',
      'Call guards (might be overreaction)',
    ]
  ).execute(worldState);

  // Step 5: Plan response
  console.log('\nStep 5: Plan response strategy');
  await new PlanAct(
    'Handle suspicious stranger',
    [
      'Serve drinks normally to avoid suspicion',
      'Keep eye on stranger\'s movements',
      'Position self near exit',
      'Signal to bouncer to be ready',
      'If threat confirmed, evacuate customers',
    ]
  ).execute(worldState);

  // Display final mental state
  console.log('\n--- Bartender\'s Final Mental State ---');

  console.log('\nMemories:');
  const memories = getMemoriesAbout(worldState, 'stranger');
  memories.forEach(m => console.log(`  - ${m.content}`));

  console.log('\nBeliefs:');
  const beliefs = getBeliefs(worldState);
  beliefs.forEach(b => console.log(`  - ${b.statement} (confidence: ${b.confidence.toFixed(2)})`));

  console.log('\nEvaluations:');
  const threat = getEvaluation(worldState, 'stranger', 'threat');
  console.log(`  - Threat level: ${threat?.toFixed(2)}`);

  console.log('\nDecision:');
  const decision = getCurrentDecision(worldState);
  console.log(`  - ${decision}`);

  console.log('\nPlan:');
  const plan = getCurrentPlan(worldState);
  console.log(`  - ${plan}`);

  console.log('\nExpected: Complete reasoning chain from observation to action plan');
}

// ===== EXAMPLE 7: Emotional Memory and Relationship =====

export async function testEmotionalMemory(): Promise<void> {
  console.log('\n===== Example 7: Emotional Memory and Relationship =====\n');

  const worldState = new WorldState();

  console.log('--- Player interactions over time ---\n');

  // Positive interaction
  console.log('Day 1: Player tips generously');
  await RememberAct.emotional(
    'Player gave generous tip',
    0.7, // Positive
    'player',
    0.6
  ).execute(worldState);

  await EvaluateAct.friendliness('player', 0.5).execute(worldState);

  // Another positive interaction
  console.log('Day 2: Player helps clean up broken glass');
  await RememberAct.emotional(
    'Player helped clean up mess',
    0.6, // Positive
    'player',
    0.7
  ).execute(worldState);

  await EvaluateAct.friendliness('player', 0.7).execute(worldState);

  // Negative interaction
  console.log('Day 3: Player gets drunk and causes scene');
  await RememberAct.emotional(
    'Player caused drunken scene',
    -0.8, // Very negative
    'player',
    0.9
  ).execute(worldState);

  await EvaluateAct.friendliness('player', 0.3).execute(worldState);

  // Infer overall relationship
  console.log('\n--- Bartender reflects on relationship ---');
  await new InferAct(
    'Player is friendly but unreliable when drunk',
    [
      'Generous tipper',
      'Helpful when sober',
      'Causes problems when drunk',
    ],
    0.8
  ).execute(worldState);

  // Display emotional history
  console.log('\n--- Emotional Memory Timeline ---');
  const memories = getMemoriesAbout(worldState, 'player');

  for (const memory of memories) {
    const emotion = memory.emotionalValence! > 0 ? '😊' : '😠';
    console.log(`  ${emotion} "${memory.content}" (valence: ${memory.emotionalValence?.toFixed(2)})`);
  }

  console.log('\n--- Final Assessment ---');
  const friendliness = getEvaluation(worldState, 'player', 'friendliness');
  console.log(`Friendliness: ${friendliness?.toFixed(2)}`);

  const beliefs = getBeliefs(worldState);
  beliefs.forEach(b => console.log(`Belief: "${b.statement}"`));

  console.log('\nExpected: Mixed relationship with nuanced belief');
}

// ===== RUN ALL EXAMPLES =====

export async function runAllMentalActExamples(): Promise<void> {
  await testRememberInsult();
  await new Promise(r => setTimeout(r, 1000));

  await testInferUntrustworthy();
  await new Promise(r => setTimeout(r, 1000));

  await testDecideAction();
  await new Promise(r => setTimeout(r, 1000));

  await testRememberAndForget();
  await new Promise(r => setTimeout(r, 1000));

  await testFormPlan();
  await new Promise(r => setTimeout(r, 1000));

  await testComplexReasoning();
  await new Promise(r => setTimeout(r, 1000));

  await testEmotionalMemory();
}

// Run if executed directly
if (require.main === module) {
  runAllMentalActExamples().catch(console.error);
}
