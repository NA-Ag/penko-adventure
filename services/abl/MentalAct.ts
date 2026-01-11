/**
 * MentalAct - FACADE 3.9
 *
 * Mental acts are internal behaviors that update NPC's cognitive state
 * without producing external actions.
 *
 * Based on Facade's mental acts system:
 * - Remember: Store information in memory
 * - Forget: Remove information from memory
 * - Decide: Make internal decisions
 * - Infer: Draw conclusions from observations
 * - Evaluate: Assess situations or people
 * - Plan: Formulate future intentions
 *
 * Mental acts update working memory and belief state without
 * visible actions in the game world.
 */

import { Behavior, BehaviorStatus, BehaviorResult } from './Behavior';
import { WorldState } from './WorldState';

/**
 * Memory entry
 */
export interface MemoryEntry {
  /** What is remembered */
  content: string;

  /** Type of memory */
  type: 'event' | 'fact' | 'intention' | 'belief' | 'emotion';

  /** Timestamp when remembered */
  timestamp: number;

  /** Importance/salience (0-1) */
  importance: number;

  /** Related entity (person, object, etc.) */
  subject?: string;

  /** Emotional valence (-1 to 1) */
  emotionalValence?: number;
}

/**
 * Belief entry
 */
export interface Belief {
  /** Statement of belief */
  statement: string;

  /** Confidence in belief (0-1) */
  confidence: number;

  /** Evidence supporting belief */
  evidence: string[];

  /** When belief was formed */
  timestamp: number;
}

/**
 * Decision entry
 */
export interface Decision {
  /** What was decided */
  decision: string;

  /** Reason for decision */
  reasoning: string;

  /** Timestamp */
  timestamp: number;

  /** Alternatives considered */
  alternatives?: string[];
}

/**
 * Mental act base class
 */
export abstract class MentalAct extends Behavior {
  constructor(id: string, name: string, priority: number = 40, specificity: number = 0.5) {
    super(id, name, priority, specificity);
  }

  /**
   * Mental acts don't produce external effects
   * They only update internal state
   */
  protected abstract updateInternalState(worldState: WorldState): void;

  protected async performBehavior(worldState: WorldState): Promise<BehaviorResult> {
    console.log(`[MentalAct:${this.name}] (internal reasoning...)`);

    this.updateInternalState(worldState);

    return {
      status: BehaviorStatus.SUCCESS,
      message: `Mental act completed: ${this.name}`,
    };
  }
}

// ===== REMEMBER =====

/**
 * RememberAct - Store information in memory
 */
export class RememberAct extends MentalAct {
  private memoryEntry: MemoryEntry;

  constructor(
    content: string,
    type: MemoryEntry['type'],
    importance: number = 0.5,
    subject?: string,
    emotionalValence?: number
  ) {
    super('remember', `Remember: "${content}"`, 40, 0.6);

    this.memoryEntry = {
      content,
      type,
      timestamp: Date.now(),
      importance,
      subject,
      emotionalValence,
    };
  }

  protected updateInternalState(worldState: WorldState): void {
    // Get existing memories
    const memories = (worldState.get('memories') as MemoryEntry[]) || [];

    // Add new memory
    memories.push(this.memoryEntry);

    // Store back
    worldState.set('memories', memories);

    console.log(
      `[Remember] Stored memory: "${this.memoryEntry.content}" (${this.memoryEntry.type}, importance: ${this.memoryEntry.importance})`
    );

    // Update memory index by subject
    if (this.memoryEntry.subject) {
      const subjectKey = `memories_about_${this.memoryEntry.subject}`;
      const subjectMemories = (worldState.get(subjectKey) as MemoryEntry[]) || [];
      subjectMemories.push(this.memoryEntry);
      worldState.set(subjectKey, subjectMemories);
    }
  }

  /**
   * Create remember act for an event
   */
  static event(content: string, subject?: string, importance: number = 0.5): RememberAct {
    return new RememberAct(content, 'event', importance, subject);
  }

  /**
   * Create remember act for a fact
   */
  static fact(content: string, subject?: string, importance: number = 0.5): RememberAct {
    return new RememberAct(content, 'fact', importance, subject);
  }

  /**
   * Create remember act for an intention
   */
  static intention(content: string, importance: number = 0.7): RememberAct {
    return new RememberAct(content, 'intention', importance);
  }

  /**
   * Create remember act for an emotional event
   */
  static emotional(
    content: string,
    emotionalValence: number,
    subject?: string,
    importance: number = 0.8
  ): RememberAct {
    return new RememberAct(content, 'emotion', importance, subject, emotionalValence);
  }
}

// ===== FORGET =====

/**
 * ForgetAct - Remove information from memory
 */
export class ForgetAct extends MentalAct {
  private contentToForget: string;

  constructor(contentToForget: string) {
    super('forget', `Forget: "${contentToForget}"`, 40, 0.6);
    this.contentToForget = contentToForget;
  }

  protected updateInternalState(worldState: WorldState): void {
    const memories = (worldState.get('memories') as MemoryEntry[]) || [];

    // Remove matching memories
    const filtered = memories.filter(m => m.content !== this.contentToForget);

    worldState.set('memories', filtered);

    console.log(`[Forget] Removed memory: "${this.contentToForget}"`);
  }
}

// ===== DECIDE =====

/**
 * DecideAct - Make internal decision
 */
export class DecideAct extends MentalAct {
  private decision: Decision;

  constructor(decision: string, reasoning: string, alternatives?: string[]) {
    super('decide', `Decide: "${decision}"`, 50, 0.7);

    this.decision = {
      decision,
      reasoning,
      timestamp: Date.now(),
      alternatives,
    };
  }

  protected updateInternalState(worldState: WorldState): void {
    // Get existing decisions
    const decisions = (worldState.get('decisions') as Decision[]) || [];

    // Add new decision
    decisions.push(this.decision);

    worldState.set('decisions', decisions);

    // Also set as current decision
    worldState.set('current_decision', this.decision.decision);

    console.log(`[Decide] Made decision: "${this.decision.decision}" (reason: ${this.decision.reasoning})`);

    if (this.decision.alternatives) {
      console.log(`[Decide] Considered alternatives: ${this.decision.alternatives.join(', ')}`);
    }
  }
}

// ===== INFER =====

/**
 * InferAct - Draw conclusion from observations
 */
export class InferAct extends MentalAct {
  private belief: Belief;

  constructor(conclusion: string, evidence: string[], confidence: number = 0.7) {
    super('infer', `Infer: "${conclusion}"`, 45, 0.6);

    this.belief = {
      statement: conclusion,
      confidence,
      evidence,
      timestamp: Date.now(),
    };
  }

  protected updateInternalState(worldState: WorldState): void {
    // Get existing beliefs
    const beliefs = (worldState.get('beliefs') as Belief[]) || [];

    // Check if belief already exists
    const existingIndex = beliefs.findIndex(b => b.statement === this.belief.statement);

    if (existingIndex >= 0) {
      // Update existing belief with new evidence and confidence
      const existing = beliefs[existingIndex];
      existing.evidence.push(...this.belief.evidence);
      existing.confidence = Math.max(existing.confidence, this.belief.confidence);
      existing.timestamp = Date.now();

      console.log(
        `[Infer] Updated belief: "${this.belief.statement}" (confidence: ${existing.confidence.toFixed(2)})`
      );
    } else {
      // Add new belief
      beliefs.push(this.belief);

      console.log(
        `[Infer] New belief: "${this.belief.statement}" (confidence: ${this.belief.confidence.toFixed(2)})`
      );
    }

    worldState.set('beliefs', beliefs);

    console.log(`[Infer] Evidence: ${this.belief.evidence.join('; ')}`);
  }
}

// ===== EVALUATE =====

/**
 * EvaluateAct - Assess situation or person
 */
export class EvaluateAct extends MentalAct {
  private subject: string;
  private attribute: string;
  private value: number; // -1 to 1 scale

  constructor(subject: string, attribute: string, value: number) {
    super('evaluate', `Evaluate ${subject}'s ${attribute}`, 45, 0.6);

    this.subject = subject;
    this.attribute = attribute;
    this.value = Math.max(-1, Math.min(1, value)); // Clamp -1 to 1
  }

  protected updateInternalState(worldState: WorldState): void {
    // Store evaluation
    const evaluationKey = `evaluation_${this.subject}_${this.attribute}`;
    worldState.set(evaluationKey, this.value);

    // Also maintain evaluation history
    const historyKey = `evaluation_history_${this.subject}`;
    const history = (worldState.get(historyKey) as any[]) || [];

    history.push({
      attribute: this.attribute,
      value: this.value,
      timestamp: Date.now(),
    });

    worldState.set(historyKey, history);

    const valenceStr = this.value > 0 ? 'positive' : this.value < 0 ? 'negative' : 'neutral';

    console.log(
      `[Evaluate] ${this.subject}'s ${this.attribute}: ${this.value.toFixed(2)} (${valenceStr})`
    );
  }

  /**
   * Evaluate trustworthiness
   */
  static trustworthiness(subject: string, value: number): EvaluateAct {
    return new EvaluateAct(subject, 'trustworthiness', value);
  }

  /**
   * Evaluate threat level
   */
  static threat(subject: string, value: number): EvaluateAct {
    return new EvaluateAct(subject, 'threat', value);
  }

  /**
   * Evaluate friendliness
   */
  static friendliness(subject: string, value: number): EvaluateAct {
    return new EvaluateAct(subject, 'friendliness', value);
  }
}

// ===== PLAN =====

/**
 * PlanAct - Formulate future intention
 */
export class PlanAct extends MentalAct {
  private goal: string;
  private steps: string[];

  constructor(goal: string, steps: string[]) {
    super('plan', `Plan: ${goal}`, 50, 0.7);

    this.goal = goal;
    this.steps = steps;
  }

  protected updateInternalState(worldState: WorldState): void {
    // Store plan
    const plans = (worldState.get('plans') as any[]) || [];

    plans.push({
      goal: this.goal,
      steps: this.steps,
      timestamp: Date.now(),
      completed: false,
    });

    worldState.set('plans', plans);

    // Set current plan
    worldState.set('current_plan', this.goal);

    console.log(`[Plan] Formulated plan: "${this.goal}"`);
    console.log(`[Plan] Steps: ${this.steps.map((s, i) => `${i + 1}. ${s}`).join('; ')}`);
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Retrieve memories about a subject
 */
export function getMemoriesAbout(worldState: WorldState, subject: string): MemoryEntry[] {
  const key = `memories_about_${subject}`;
  return (worldState.get(key) as MemoryEntry[]) || [];
}

/**
 * Retrieve all memories
 */
export function getAllMemories(worldState: WorldState): MemoryEntry[] {
  return (worldState.get('memories') as MemoryEntry[]) || [];
}

/**
 * Retrieve beliefs
 */
export function getBeliefs(worldState: WorldState): Belief[] {
  return (worldState.get('beliefs') as Belief[]) || [];
}

/**
 * Check if NPC has a specific belief
 */
export function hasBelief(worldState: WorldState, statement: string): boolean {
  const beliefs = getBeliefs(worldState);
  return beliefs.some(b => b.statement === statement);
}

/**
 * Get evaluation of subject's attribute
 */
export function getEvaluation(worldState: WorldState, subject: string, attribute: string): number | null {
  const key = `evaluation_${subject}_${attribute}`;
  const value = worldState.get(key);
  return typeof value === 'number' ? value : null;
}

/**
 * Get current decision
 */
export function getCurrentDecision(worldState: WorldState): string | null {
  return worldState.get('current_decision') as string | null;
}

/**
 * Get current plan
 */
export function getCurrentPlan(worldState: WorldState): string | null {
  return worldState.get('current_plan') as string | null;
}
