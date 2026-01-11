/**
 * ReflectiveMemory - FACADE 5.5
 *
 * WME Reflection System - WMEs can reference other WMEs.
 * Enables meta-reasoning and beliefs about beliefs.
 *
 * Features:
 * - WMEs can reference other WMEs by ID
 * - Beliefs about beliefs ("NPC thinks player believes X")
 * - Knowledge about knowledge ("Wizard knows that player knows about dragon")
 * - Meta-reasoning support
 * - Nested belief chains
 *
 * This enables:
 * - Theory of mind (understanding what others believe)
 * - Deception detection
 * - Social reasoning
 * - Complex dialogue about beliefs
 */

import { IWME, WME } from './WME';
import { WorkingMemory, WMEQuery } from './WorkingMemory';

/**
 * Meta-WME - WME that references another WME
 */
export class MetaWME extends WME {
  readonly referencedWMEId: string;

  constructor(type: string, attributes: Record<string, any>, referencedWMEId: string) {
    super(type, attributes);
    this.referencedWMEId = referencedWMEId;
  }

  /**
   * Get the referenced WME from working memory
   */
  getReferencedWME(wm: WorkingMemory): IWME | undefined {
    return wm.get(this.referencedWMEId);
  }

  /**
   * Check if referenced WME still exists
   */
  isValid(wm: WorkingMemory): boolean {
    return wm.has(this.referencedWMEId);
  }

  /**
   * Export with reference data
   */
  toJSON(): any {
    return {
      ...super.toJSON(),
      referencedWMEId: this.referencedWMEId,
      isMeta: true,
    };
  }
}

/**
 * Belief WME - Agent believes something (may reference another WME)
 */
export interface BeliefWMEAttributes {
  agent: string;
  belief: string;
  confidence: number; // 0-1
  referencedWME?: string; // Optional WME ID that this belief is about
}

export class BeliefAboutWME extends MetaWME {
  constructor(agent: string, belief: string, confidence: number, referencedWMEId: string) {
    super('BeliefAboutWME', { agent, belief, confidence }, referencedWMEId);
  }

  getAgent(): string {
    return this.getAttribute('agent');
  }

  getBelief(): string {
    return this.getAttribute('belief');
  }

  getConfidence(): number {
    return this.getAttribute('confidence');
  }
}

/**
 * Knowledge WME - Agent knows that another agent knows/believes something
 */
export interface KnowledgeWMEAttributes {
  knower: string; // Who knows
  known: string; // Who they know about
  knowledge: string; // What they know about them
  confidence: number; // 0-1
}

export class KnowledgeAboutBeliefWME extends MetaWME {
  constructor(
    knower: string,
    known: string,
    knowledge: string,
    confidence: number,
    referencedWMEId: string
  ) {
    super('KnowledgeAboutBelief', { knower, known, knowledge, confidence }, referencedWMEId);
  }

  getKnower(): string {
    return this.getAttribute('knower');
  }

  getKnown(): string {
    return this.getAttribute('known');
  }

  getKnowledge(): string {
    return this.getAttribute('knowledge');
  }

  getConfidence(): number {
    return this.getAttribute('confidence');
  }
}

/**
 * Reflective Working Memory - extends WorkingMemory with reflection support
 */
export class ReflectiveWorkingMemory extends WorkingMemory {
  /**
   * Assert a meta-WME (WME that references another WME)
   */
  assertMeta(metaWME: MetaWME): void {
    // Verify referenced WME exists
    if (!this.has(metaWME.referencedWMEId)) {
      console.warn(
        `[ReflectiveMemory] Meta-WME references non-existent WME: ${metaWME.referencedWMEId}`
      );
    }

    this.assert(metaWME);
  }

  /**
   * Assert a belief about a WME
   */
  assertBeliefAbout(
    agent: string,
    belief: string,
    confidence: number,
    referencedWMEId: string
  ): BeliefAboutWME {
    const wme = new BeliefAboutWME(agent, belief, confidence, referencedWMEId);
    this.assertMeta(wme);
    return wme;
  }

  /**
   * Assert knowledge about another agent's belief
   */
  assertKnowledgeAboutBelief(
    knower: string,
    known: string,
    knowledge: string,
    confidence: number,
    referencedWMEId: string
  ): KnowledgeAboutBeliefWME {
    const wme = new KnowledgeAboutBeliefWME(knower, known, knowledge, confidence, referencedWMEId);
    this.assertMeta(wme);
    return wme;
  }

  /**
   * Get all meta-WMEs that reference a specific WME
   */
  getMetaWMEsReferencing(wmeId: string): MetaWME[] {
    return this.getAll().filter(
      (wme): wme is MetaWME => wme instanceof MetaWME && wme.referencedWMEId === wmeId
    );
  }

  /**
   * Get all beliefs about a specific WME
   */
  getBeliefsAbout(wmeId: string): BeliefAboutWME[] {
    return this.getAll().filter(
      (wme): wme is BeliefAboutWME =>
        wme instanceof BeliefAboutWME && wme.referencedWMEId === wmeId
    );
  }

  /**
   * Get all knowledge WMEs about beliefs
   */
  getKnowledgeAboutBeliefs(): KnowledgeAboutBeliefWME[] {
    return this.getAll().filter(
      (wme): wme is KnowledgeAboutBeliefWME => wme instanceof KnowledgeAboutBeliefWME
    );
  }

  /**
   * Check if agent believes something (by querying belief WMEs)
   */
  doesAgentBelieve(agent: string, beliefPattern: string): boolean {
    const beliefs = this.query({
      type: 'BeliefAboutWME',
      attributes: { agent },
      filter: (wme: IWME) => {
        const belief = wme.getAttribute('belief');
        return typeof belief === 'string' && belief.includes(beliefPattern);
      },
    });

    return beliefs.length > 0;
  }

  /**
   * Check if agent knows that another agent believes something
   */
  doesAgentKnowAbout(knower: string, known: string, knowledgePattern: string): boolean {
    const knowledge = this.query({
      type: 'KnowledgeAboutBelief',
      attributes: { knower, known },
      filter: (wme: IWME) => {
        const k = wme.getAttribute('knowledge');
        return typeof k === 'string' && k.includes(knowledgePattern);
      },
    });

    return knowledge.length > 0;
  }

  /**
   * Get belief chain (nested beliefs)
   */
  getBeliefChain(startWMEId: string, maxDepth: number = 10): IWME[] {
    const chain: IWME[] = [];
    let currentId = startWMEId;
    let depth = 0;

    while (depth < maxDepth) {
      const wme = this.get(currentId);
      if (!wme) break;

      chain.push(wme);

      // If this is a meta-WME, follow the reference
      if (wme instanceof MetaWME) {
        currentId = wme.referencedWMEId;
      } else {
        break; // End of chain
      }

      depth++;
    }

    return chain;
  }

  /**
   * Validate all meta-WMEs (check that referenced WMEs exist)
   */
  validateMetaWMEs(): { valid: MetaWME[]; invalid: MetaWME[] } {
    const metaWMEs = this.getAll().filter((wme): wme is MetaWME => wme instanceof MetaWME);

    const valid: MetaWME[] = [];
    const invalid: MetaWME[] = [];

    for (const metaWME of metaWMEs) {
      if (metaWME.isValid(this)) {
        valid.push(metaWME);
      } else {
        invalid.push(metaWME);
      }
    }

    return { valid, invalid };
  }

  /**
   * Clean up invalid meta-WMEs (remove ones with dangling references)
   */
  cleanupInvalidMetaWMEs(): number {
    const { invalid } = this.validateMetaWMEs();

    for (const metaWME of invalid) {
      this.retract(metaWME);
    }

    return invalid.length;
  }

  /**
   * When retracting a WME, optionally cascade to meta-WMEs that reference it
   */
  retractWithCascade(wmeOrId: IWME | string): number {
    const id = typeof wmeOrId === 'string' ? wmeOrId : wmeOrId.id;

    // Find all meta-WMEs that reference this WME
    const dependents = this.getMetaWMEsReferencing(id);

    // Retract the original WME
    const retracted = this.retract(id);
    if (!retracted) return 0;

    // Retract all dependent meta-WMEs
    let count = 1;
    for (const dependent of dependents) {
      count += this.retractWithCascade(dependent);
    }

    return count;
  }
}

/**
 * Theory of Mind helper - reasoning about what others know/believe
 */
export class TheoryOfMind {
  constructor(private wm: ReflectiveWorkingMemory) {}

  /**
   * Check if agent A knows that agent B believes X
   */
  knowsBeliefOf(agentA: string, agentB: string, belief: string): boolean {
    return this.wm.doesAgentKnowAbout(agentA, agentB, belief);
  }

  /**
   * Get what agent knows about another agent's beliefs
   */
  getKnowledgeAbout(agentA: string, agentB: string): KnowledgeAboutBeliefWME[] {
    return this.wm
      .getKnowledgeAboutBeliefs()
      .filter(
        (wme) => wme.getKnower() === agentA && wme.getKnown() === agentB
      );
  }

  /**
   * Get all agents who believe something
   */
  whoBelieves(beliefPattern: string): string[] {
    const believers = new Set<string>();

    const beliefs = this.wm.query({
      type: 'BeliefAboutWME',
      filter: (wme: IWME) => {
        const belief = wme.getAttribute('belief');
        return typeof belief === 'string' && belief.includes(beliefPattern);
      },
    });

    for (const belief of beliefs) {
      const agent = belief.getAttribute('agent');
      if (agent) believers.add(agent);
    }

    return Array.from(believers);
  }

  /**
   * Get all agents who know about another agent's belief
   */
  whoKnowsAbout(knownAgent: string, knowledge: string): string[] {
    const knowers = new Set<string>();

    const knowledgeWMEs = this.wm
      .getKnowledgeAboutBeliefs()
      .filter(
        (wme) =>
          wme.getKnown() === knownAgent && wme.getKnowledge().includes(knowledge)
      );

    for (const wme of knowledgeWMEs) {
      knowers.add(wme.getKnower());
    }

    return Array.from(knowers);
  }

  /**
   * Check for belief discrepancies (A believes X, B believes not-X)
   */
  findBeliefDiscrepancies(agentA: string, agentB: string): Array<{
    agentA: string;
    agentB: string;
    beliefA: string;
    beliefB: string;
    confidence: { a: number; b: number };
  }> {
    const discrepancies: Array<{
      agentA: string;
      agentB: string;
      beliefA: string;
      beliefB: string;
      confidence: { a: number; b: number };
    }> = [];

    const beliefsA = this.wm.query({
      type: 'BeliefAboutWME',
      attributes: { agent: agentA },
    }) as BeliefAboutWME[];

    const beliefsB = this.wm.query({
      type: 'BeliefAboutWME',
      attributes: { agent: agentB },
    }) as BeliefAboutWME[];

    // Compare beliefs about the same referenced WMEs
    for (const beliefA of beliefsA) {
      for (const beliefB of beliefsB) {
        if (beliefA.referencedWMEId === beliefB.referencedWMEId) {
          // Same WME, different beliefs
          if (beliefA.getBelief() !== beliefB.getBelief()) {
            discrepancies.push({
              agentA,
              agentB,
              beliefA: beliefA.getBelief(),
              beliefB: beliefB.getBelief(),
              confidence: {
                a: beliefA.getConfidence(),
                b: beliefB.getConfidence(),
              },
            });
          }
        }
      }
    }

    return discrepancies;
  }

  /**
   * Check if agent might be deceiving (knows truth but believes something else)
   */
  isLikelyDeceiving(agent: string, referencedWMEId: string): boolean {
    const beliefs = this.wm.getBeliefsAbout(referencedWMEId).filter((b) => b.getAgent() === agent);

    if (beliefs.length === 0) return false;

    // Check if agent has knowledge that contradicts their stated belief
    const knowledge = this.wm
      .getKnowledgeAboutBeliefs()
      .filter((k) => k.getKnower() === agent);

    for (const k of knowledge) {
      const referencedBelief = this.wm.get(k.referencedWMEId);
      if (referencedBelief instanceof BeliefAboutWME) {
        if (referencedBelief.referencedWMEId === referencedWMEId) {
          // Agent knows about someone else's belief about the same WME
          // If their own belief differs, might be deception
          for (const belief of beliefs) {
            if (belief.getBelief() !== referencedBelief.getBelief()) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }
}

/**
 * Dialogue helper for reflective reasoning
 */
export class ReflectiveDialogue {
  /**
   * Generate dialogue about beliefs
   */
  static generateBeliefDialogue(belief: BeliefAboutWME, wm: ReflectiveWorkingMemory): string {
    const agent = belief.getAgent();
    const beliefStr = belief.getBelief();
    const confidence = belief.getConfidence();

    const referencedWME = belief.getReferencedWME(wm);
    const context = referencedWME ? ` about ${referencedWME.type}` : '';

    if (confidence > 0.8) {
      return `${agent} is certain that ${beliefStr}${context}.`;
    } else if (confidence > 0.5) {
      return `${agent} believes that ${beliefStr}${context}.`;
    } else if (confidence > 0.3) {
      return `${agent} thinks that ${beliefStr}${context}.`;
    } else {
      return `${agent} suspects that ${beliefStr}${context}.`;
    }
  }

  /**
   * Generate dialogue about knowledge of beliefs
   */
  static generateKnowledgeDialogue(
    knowledge: KnowledgeAboutBeliefWME,
    wm: ReflectiveWorkingMemory
  ): string {
    const knower = knowledge.getKnower();
    const known = knowledge.getKnown();
    const knowledgeStr = knowledge.getKnowledge();
    const confidence = knowledge.getConfidence();

    if (confidence > 0.8) {
      return `${knower} knows that ${known} ${knowledgeStr}.`;
    } else if (confidence > 0.5) {
      return `${knower} believes that ${known} ${knowledgeStr}.`;
    } else {
      return `${knower} suspects that ${known} ${knowledgeStr}.`;
    }
  }

  /**
   * Generate dialogue for belief discrepancies
   */
  static generateDiscrepancyDialogue(
    agentA: string,
    agentB: string,
    beliefA: string,
    beliefB: string
  ): string {
    return `${agentA} believes ${beliefA}, but ${agentB} believes ${beliefB}. They disagree.`;
  }
}

/**
 * Helper functions for reflective memory operations
 */
export class ReflectiveHelpers {
  /**
   * Create a simple belief (not about another WME)
   */
  static createSimpleBelief(wm: ReflectiveWorkingMemory, agent: string, belief: string, confidence: number): IWME {
    const wme = new WME('Belief', { agent, belief, confidence });
    wm.assert(wme);
    return wme;
  }

  /**
   * Create a belief about a WME
   */
  static createBeliefAbout(
    wm: ReflectiveWorkingMemory,
    agent: string,
    belief: string,
    confidence: number,
    aboutWME: IWME
  ): BeliefAboutWME {
    return wm.assertBeliefAbout(agent, belief, confidence, aboutWME.id);
  }

  /**
   * Create nested belief (A knows that B believes X)
   */
  static createNestedBelief(
    wm: ReflectiveWorkingMemory,
    knower: string,
    believer: string,
    belief: string,
    confidence: number,
    aboutWME: IWME
  ): KnowledgeAboutBeliefWME {
    // First create the belief that B has
    const beliefWME = wm.assertBeliefAbout(believer, belief, confidence, aboutWME.id);

    // Then create knowledge that A knows about B's belief
    return wm.assertKnowledgeAboutBelief(
      knower,
      believer,
      `believes ${belief}`,
      confidence,
      beliefWME.id
    );
  }

  /**
   * Get all agents involved in reflective reasoning
   */
  static getReflectiveAgents(wm: ReflectiveWorkingMemory): string[] {
    const agents = new Set<string>();

    const beliefs = wm.query({ type: 'BeliefAboutWME' });
    for (const belief of beliefs) {
      const agent = belief.getAttribute('agent');
      if (agent) agents.add(agent);
    }

    const knowledge = wm.getKnowledgeAboutBeliefs();
    for (const k of knowledge) {
      agents.add(k.getKnower());
      agents.add(k.getKnown());
    }

    return Array.from(agents);
  }

  /**
   * Export reflective memory state
   */
  static exportReflectiveState(wm: ReflectiveWorkingMemory): any {
    return {
      beliefs: wm.query({ type: 'BeliefAboutWME' }).map((wme) => wme.toJSON()),
      knowledge: wm.getKnowledgeAboutBeliefs().map((wme) => wme.toJSON()),
      validation: wm.validateMetaWMEs(),
    };
  }
}
