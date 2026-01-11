/**
 * MultiMemory - FACADE 5.4
 *
 * Multiple memory spaces for different agents and shared world state.
 * Based on Facade's multi-agent memory architecture.
 *
 * Memory Space Types:
 * - Agent Memory: Private beliefs/perceptions for each agent (player, NPCs)
 * - Shared Memory: Objective facts known to all agents
 * - World Memory: Global world state
 *
 * This enables:
 * - NPCs with false beliefs (different from reality)
 * - Private knowledge vs. shared knowledge
 * - Agent-specific perceptions
 * - Objective vs. subjective facts
 *
 * Example:
 * - Shared: "door is locked" (objective fact)
 * - Agent: "player is trustworthy" (NPC's belief, may be false)
 * - World: "time is night" (global state)
 */

import { IWME, WME } from './WME';
import { WorkingMemory, WMEQuery } from './WorkingMemory';
import { TemporalWorkingMemory } from './TemporalMemory';

/**
 * Memory space types
 */
export enum MemorySpaceType {
  /** Agent-specific private memory (beliefs, perceptions) */
  AGENT = 'agent',

  /** Shared objective facts known to all */
  SHARED = 'shared',

  /** Global world state */
  WORLD = 'world',
}

/**
 * Memory space configuration
 */
export interface MemorySpaceConfig {
  /** Use temporal features (expiration, timestamps) */
  temporal?: boolean;

  /** Debug logging */
  debug?: boolean;

  /** Auto-expiration check interval (for temporal memory) */
  expirationCheckInterval?: number;
}

/**
 * Multi-Memory Manager - manages multiple memory spaces
 */
export class MultiMemoryManager {
  private agentMemories: Map<string, WorkingMemory> = new Map();
  private sharedMemory: WorkingMemory;
  private worldMemory: WorkingMemory;
  private config: MemorySpaceConfig;

  constructor(config: MemorySpaceConfig = {}) {
    this.config = {
      temporal: config.temporal ?? false,
      debug: config.debug ?? false,
      expirationCheckInterval: config.expirationCheckInterval ?? 1000,
    };

    // Create shared and world memories
    this.sharedMemory = this.createMemory();
    this.worldMemory = this.createMemory();

    if (this.config.debug) {
      console.log('[MultiMemory] Initialized with temporal:', this.config.temporal);
    }
  }

  /**
   * Create a memory instance (temporal or regular)
   */
  private createMemory(): WorkingMemory {
    if (this.config.temporal) {
      return new TemporalWorkingMemory(
        this.config.debug ?? false,
        this.config.expirationCheckInterval ?? 1000
      );
    }
    return new WorkingMemory(this.config.debug ?? false);
  }

  /**
   * Get or create agent memory
   */
  getAgentMemory(agentId: string): WorkingMemory {
    if (!this.agentMemories.has(agentId)) {
      const memory = this.createMemory();
      this.agentMemories.set(agentId, memory);

      if (this.config.debug) {
        console.log(`[MultiMemory] Created memory for agent: ${agentId}`);
      }
    }

    return this.agentMemories.get(agentId)!;
  }

  /**
   * Get shared memory (objective facts)
   */
  getSharedMemory(): WorkingMemory {
    return this.sharedMemory;
  }

  /**
   * Get world memory (global state)
   */
  getWorldMemory(): WorkingMemory {
    return this.worldMemory;
  }

  /**
   * Check if agent has private memory
   */
  hasAgentMemory(agentId: string): boolean {
    return this.agentMemories.has(agentId);
  }

  /**
   * Remove agent memory
   */
  removeAgentMemory(agentId: string): boolean {
    return this.agentMemories.delete(agentId);
  }

  /**
   * Get all agent IDs with private memory
   */
  getAgentIds(): string[] {
    return Array.from(this.agentMemories.keys());
  }

  /**
   * Assert fact in agent memory (private belief)
   */
  assertAgentBelief(agentId: string, wme: IWME): void {
    const memory = this.getAgentMemory(agentId);
    memory.assert(wme);
  }

  /**
   * Assert fact in shared memory (objective fact known to all)
   */
  assertSharedFact(wme: IWME): void {
    this.sharedMemory.assert(wme);
  }

  /**
   * Assert fact in world memory (global state)
   */
  assertWorldState(wme: IWME): void {
    this.worldMemory.assert(wme);
  }

  /**
   * Query across multiple memory spaces
   */
  queryAcrossSpaces(
    agentId: string,
    query: WMEQuery,
    includeShared: boolean = true,
    includeWorld: boolean = true
  ): {
    agent: IWME[];
    shared: IWME[];
    world: IWME[];
    all: IWME[];
  } {
    const agent = this.hasAgentMemory(agentId)
      ? this.getAgentMemory(agentId).query(query)
      : [];

    const shared = includeShared ? this.sharedMemory.query(query) : [];

    const world = includeWorld ? this.worldMemory.query(query) : [];

    const all = [...agent, ...shared, ...world];

    return { agent, shared, world, all };
  }

  /**
   * Check if agent believes something (may be false)
   */
  doesAgentBelieve(agentId: string, query: WMEQuery): boolean {
    if (!this.hasAgentMemory(agentId)) return false;
    return this.getAgentMemory(agentId).exists(query);
  }

  /**
   * Check if something is objectively true (in shared memory)
   */
  isObjectivelyTrue(query: WMEQuery): boolean {
    return this.sharedMemory.exists(query);
  }

  /**
   * Check if something is in world state
   */
  isInWorldState(query: WMEQuery): boolean {
    return this.worldMemory.exists(query);
  }

  /**
   * Get what agent knows (agent + shared + world)
   */
  getAgentKnowledge(agentId: string): IWME[] {
    const agent = this.hasAgentMemory(agentId)
      ? this.getAgentMemory(agentId).getAll()
      : [];
    const shared = this.sharedMemory.getAll();
    const world = this.worldMemory.getAll();

    return [...agent, ...shared, ...world];
  }

  /**
   * Compare agent beliefs with objective reality
   */
  getBeliefDiscrepancies(agentId: string, query: WMEQuery): {
    agentBelieves: boolean;
    objectivelyTrue: boolean;
    discrepancy: boolean;
  } {
    const agentBelieves = this.doesAgentBelieve(agentId, query);
    const objectivelyTrue = this.isObjectivelyTrue(query);
    const discrepancy = agentBelieves !== objectivelyTrue;

    return { agentBelieves, objectivelyTrue, discrepancy };
  }

  /**
   * Share knowledge with agent (copy from shared to agent memory)
   */
  shareKnowledgeWithAgent(agentId: string, wme: IWME): void {
    const agentMemory = this.getAgentMemory(agentId);
    const clone = wme.clone();
    agentMemory.assert(clone);
  }

  /**
   * Teach agent (assert fact in agent memory)
   */
  teachAgent(agentId: string, wme: IWME): void {
    this.assertAgentBelief(agentId, wme);
  }

  /**
   * Make agent forget (retract from agent memory)
   */
  makeAgentForget(agentId: string, wmeOrId: IWME | string): boolean {
    if (!this.hasAgentMemory(agentId)) return false;
    return this.getAgentMemory(agentId).retract(wmeOrId);
  }

  /**
   * Correct agent belief (remove false belief, add true fact)
   */
  correctAgentBelief(
    agentId: string,
    falseBelief: IWME | string,
    trueFact: IWME
  ): void {
    const agentMemory = this.getAgentMemory(agentId);
    agentMemory.retract(falseBelief);
    agentMemory.assert(trueFact);
  }

  /**
   * Get statistics across all memory spaces
   */
  getStats(): {
    agents: number;
    agentMemories: Record<string, number>;
    sharedFacts: number;
    worldFacts: number;
    totalFacts: number;
  } {
    const agentMemories: Record<string, number> = {};
    let totalAgentFacts = 0;

    for (const [agentId, memory] of this.agentMemories.entries()) {
      const count = memory.getAll().length;
      agentMemories[agentId] = count;
      totalAgentFacts += count;
    }

    const sharedFacts = this.sharedMemory.getAll().length;
    const worldFacts = this.worldMemory.getAll().length;

    return {
      agents: this.agentMemories.size,
      agentMemories,
      sharedFacts,
      worldFacts,
      totalFacts: totalAgentFacts + sharedFacts + worldFacts,
    };
  }

  /**
   * Clear all memories
   */
  clearAll(): void {
    for (const memory of this.agentMemories.values()) {
      memory.clear();
    }
    this.sharedMemory.clear();
    this.worldMemory.clear();
  }

  /**
   * Clear agent memories only
   */
  clearAgentMemories(): void {
    for (const memory of this.agentMemories.values()) {
      memory.clear();
    }
  }

  /**
   * Export all memories (for save files)
   */
  exportAll(): {
    agents: Record<string, any[]>;
    shared: any[];
    world: any[];
  } {
    const agents: Record<string, any[]> = {};

    for (const [agentId, memory] of this.agentMemories.entries()) {
      agents[agentId] = memory.export();
    }

    return {
      agents,
      shared: this.sharedMemory.export(),
      world: this.worldMemory.export(),
    };
  }

  /**
   * Import all memories (from save files)
   */
  importAll(data: {
    agents?: Record<string, any[]>;
    shared?: any[];
    world?: any[];
  }): void {
    // Import agent memories
    if (data.agents) {
      for (const [agentId, wmeData] of Object.entries(data.agents)) {
        const memory = this.getAgentMemory(agentId);
        memory.import(wmeData);
      }
    }

    // Import shared memory
    if (data.shared) {
      this.sharedMemory.import(data.shared);
    }

    // Import world memory
    if (data.world) {
      this.worldMemory.import(data.world);
    }
  }

  /**
   * Dump all memories (debugging)
   */
  dumpAll(): void {
    console.log('\n=== Multi-Memory Dump ===\n');

    console.log('--- Agent Memories ---');
    for (const [agentId, memory] of this.agentMemories.entries()) {
      console.log(`\nAgent: ${agentId}`);
      const wmes = memory.getAll();
      if (wmes.length === 0) {
        console.log('  (empty)');
      } else {
        wmes.forEach(wme => console.log(`  ${wme.toString()}`));
      }
    }

    console.log('\n--- Shared Memory (Objective Facts) ---');
    const sharedWMEs = this.sharedMemory.getAll();
    if (sharedWMEs.length === 0) {
      console.log('  (empty)');
    } else {
      sharedWMEs.forEach(wme => console.log(`  ${wme.toString()}`));
    }

    console.log('\n--- World Memory (Global State) ---');
    const worldWMEs = this.worldMemory.getAll();
    if (worldWMEs.length === 0) {
      console.log('  (empty)');
    } else {
      worldWMEs.forEach(wme => console.log(`  ${wme.toString()}`));
    }

    console.log();
  }

  /**
   * Cleanup - destroy all temporal memories
   */
  destroy(): void {
    for (const memory of this.agentMemories.values()) {
      if (memory instanceof TemporalWorkingMemory) {
        memory.destroy();
      }
    }

    if (this.sharedMemory instanceof TemporalWorkingMemory) {
      this.sharedMemory.destroy();
    }

    if (this.worldMemory instanceof TemporalWorkingMemory) {
      this.worldMemory.destroy();
    }
  }
}

/**
 * Memory space helper - simplifies common operations
 */
export class MemorySpaceHelper {
  /**
   * Create standard game memory structure
   */
  static createGameMemory(config?: MemorySpaceConfig): MultiMemoryManager {
    return new MultiMemoryManager(config);
  }

  /**
   * Setup player memory with default perceptions
   */
  static setupPlayerMemory(mm: MultiMemoryManager): void {
    const playerMemory = mm.getAgentMemory('player');
    // Add default player knowledge here if needed
  }

  /**
   * Setup NPC memory with personality traits
   */
  static setupNPCMemory(
    mm: MultiMemoryManager,
    npcId: string,
    traits?: Record<string, any>
  ): void {
    const npcMemory = mm.getAgentMemory(npcId);

    if (traits) {
      for (const [key, value] of Object.entries(traits)) {
        npcMemory.assert(new WME('Trait', { trait: key, value }));
      }
    }
  }

  /**
   * Broadcast fact to all agents (teach everyone)
   */
  static broadcastToAllAgents(mm: MultiMemoryManager, wme: IWME): void {
    const agentIds = mm.getAgentIds();
    for (const agentId of agentIds) {
      mm.shareKnowledgeWithAgent(agentId, wme);
    }
  }

  /**
   * Check if agents have conflicting beliefs
   */
  static getConflictingBeliefs(
    mm: MultiMemoryManager,
    agent1: string,
    agent2: string,
    query: WMEQuery
  ): {
    agent1Believes: boolean;
    agent2Believes: boolean;
    conflict: boolean;
  } {
    const agent1Believes = mm.doesAgentBelieve(agent1, query);
    const agent2Believes = mm.doesAgentBelieve(agent2, query);
    const conflict = agent1Believes !== agent2Believes;

    return { agent1Believes, agent2Believes, conflict };
  }

  /**
   * Get agents who believe something
   */
  static getAgentsWhoBelieve(
    mm: MultiMemoryManager,
    query: WMEQuery
  ): string[] {
    const believers: string[] = [];

    for (const agentId of mm.getAgentIds()) {
      if (mm.doesAgentBelieve(agentId, query)) {
        believers.push(agentId);
      }
    }

    return believers;
  }

  /**
   * Synchronize agent belief with reality
   */
  static syncAgentWithReality(
    mm: MultiMemoryManager,
    agentId: string,
    query: WMEQuery
  ): void {
    const reality = mm.getSharedMemory().query(query);

    const agentMemory = mm.getAgentMemory(agentId);

    // Remove conflicting beliefs
    const agentBeliefs = agentMemory.query(query);
    for (const belief of agentBeliefs) {
      agentMemory.retract(belief);
    }

    // Add reality
    for (const fact of reality) {
      agentMemory.assert(fact.clone());
    }
  }
}
