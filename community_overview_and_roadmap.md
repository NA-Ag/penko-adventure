# Community Mode: Overview and Roadmap

## Executive Summary

Community Mode is an experimental AI-free game engine designed to provide offline, language-learning gameplay without requiring cloud API calls or internet connectivity. The system implements sophisticated AI architectures from academic research, specifically the Facade interactive drama system and Scribblenauts-inspired object creation, to create a finite but rich narrative experience.

**Current Status**: Experimental Phase
**Architecture Completeness**: 88%
**Primary Limitation**: Finite template-based dialogue system vs infinite AI generation

---

## What Has Been Implemented

### 1. Facade AI Architecture (95% Complete)

The core AI system is based on the Facade interactive drama architecture developed by Mateas and Stern (2003). This implementation provides goal-driven NPC behaviors with sophisticated narrative management.

#### A Behavior Language (ABL) System
- **Goal Management**: Priority-based goal selection with success criteria and lifecycle tracking
- **Behavior Execution**: Hierarchical behavior trees with preconditions and success tests
- **Execution Strategies**: Priority-based, round-robin, and best-first selection
- **Behavior Composition**: Sequential and parallel behavior execution with recovery strategies
- **Primitive Acts**: Dialogue (Say), gestures (Gesture), movement (Move), timing (Wait)
- **Mental Acts**: Memory encoding (RememberAct), decision-making (DecideAct), evaluation (EvaluateAct), analysis (AnalyzeAct)

#### Drama Management System
- **Story Value Tracking**: Monitors narrative dimensions (trust, tension, affinity, mystery)
- **Beat Selection**: Multiple strategies including priority-based, weighted probabilistic, target-driven, and dynamic selection
- **Story Arcs**: Predefined narrative structures (three-act, hero's journey, romance)
- **Story Memory**: Timeline tracking of narrative events with query capabilities
- **Beat Execution**: World state and story value modifications based on narrative progression

#### Working Memory (WME) System
- **Fact Management**: Assert, modify, and retract operations for world state facts
- **Pattern Matching**: Query-based retrieval with type filtering
- **Reactive Listeners**: Change notification system for responsive behaviors
- **Predefined Types**: 9 specialized WME types (Location, State, Relation, Goal, Belief, Event, Inventory, Sensory, Quest)

#### Rule Engine
- **Forward-Chaining Inference**: Pattern-based rule activation and execution
- **Conflict Resolution**: 5 strategies (priority, recency, least recent, least fired, FIFO)
- **Execution Modes**: Single-pass, exhaustive, and continuous execution
- **Auto-React**: Automatic rule processing on working memory changes

### 2. Scribblenauts-Inspired Object Creation (85% Complete)

The object creation system enables dynamic instantiation of game objects from natural language descriptions, inspired by the Scribblenauts game series.

#### Object Creation Pipeline
- **Natural Language Parsing**: Advanced adjective-noun extraction with confidence scoring
- **Template System**: Base object templates with property inheritance
- **Unknown Object Inference**: Heuristic-based property inference for undefined objects
- **Runtime Dictionary**: User-defined custom objects with usage tracking

#### Property Modification System
- **Material System**: 20+ materials with physical properties (density, durability, conductivity, flammability)
- **Scale System**: 10 size tiers from microscopic to astronomical with physics-based calculations
- **Color System**: 40+ colors including fantasy variants
- **Quality Modifiers**: Sharp, heavy, magical, rusty, powerful attributes
- **State Modifiers**: Open, locked, broken, lit states

#### Property Composition
- **Conflict Detection**: Identifies logical inconsistencies (hot AND cold)
- **Validation**: Prevents impossible states (open AND locked)
- **Physics Calculations**: Weight scales with cube of size, strength scales differently
- **Smart Interactions**: Flammable + hot = fire

#### Persistence System
- **World State Management**: Complete save/load with multiple slots
- **Auto-Save**: Configurable interval-based persistence
- **Object Tracking**: Position, rotation, scale, visibility, destroyed states
- **Export/Import**: World state sharing capabilities

### 3. Integration Layer

#### FacadeNPCController
Full integration of all subsystems into coherent NPC behavior:
- World state initialization and tracking
- Working memory management with WME assertions
- Rule engine activation for reactive behaviors
- Drama beat selection and execution
- Behavior tree tick execution
- Mental act processing for NPC memory
- 9-step interaction pipeline processing player input

#### Multi-Language Support
- 12 language support: English, Spanish, French, German, Italian, Japanese, Chinese, Russian, Portuguese, Ukrainian, Polish, Czech
- Localized dialogue templates across all systems
- Language-learning focus with native language preference tracking

---

## Sources of Inspiration

### Facade (Mateas & Stern, 2003)
The primary architectural inspiration comes from the Facade interactive drama system, which pioneered:
- ABL (A Behavior Language) for goal-driven agent behaviors
- Beat-based drama management for narrative control
- Integration of reactive planning with authored content

**Citation**: Mateas, M., & Stern, A. (2003). "Facade: An experiment in building a fully-realized interactive drama." Game Developers Conference.

### Scribblenauts (5th Cell, 2009)
The object creation system draws inspiration from Scribblenauts' emergent gameplay through object instantiation:
- Natural language object creation
- Adjective-based property modification
- Emergent interactions through property combinations

### Cognitive Architectures
Working Memory and Rule Engine concepts derive from:
- Soar cognitive architecture (working memory, production rules)
- Rete algorithm for efficient pattern matching
- Forward-chaining inference systems

---

## Current Limitations

### Template-Based Dialogue System
The most significant limitation is the finite template-based approach to dialogue generation:

**What Works**:
- 828 NPC dialogue templates across 23 discourse act categories
- Context-aware template selection based on relationship, mood, and sentiment
- 12-language localization of all templates

**What Does Not Work**:
- Cannot generate novel responses to unexpected player input
- Limited to predefined discourse patterns (GREETING, FAREWELL, COMPLIMENT, INSULT, etc.)
- Falls back to generic responses for unrecognized actions
- Cannot handle arbitrary creative player actions ("fly to moon on banana")

**Example Limitations**:
- Player: "I juggle flaming bananas while reciting poetry"
- System: Returns generic "I don't understand" fallback
- Gemini: Generates contextually appropriate narrative response

### Finite Narrative Structure
Current implementation includes 5 predefined drama beats:
1. First Meeting
2. Build Trust
3. Increase Tension
4. Conflict
5. Resolution

After exhausting these beats, the system lacks dynamic beat generation capabilities.

### Object-NPC Interaction Gap
While object creation works comprehensively, NPCs cannot dynamically react to created objects:
- Objects register in world state
- NPCs lack discourse patterns for object-specific reactions
- No dynamic awareness of object properties in NPC responses

### No Text Generation Capability
The system is fundamentally a sophisticated finite state machine rather than a generative AI:
- Selects from predefined templates rather than synthesizing text
- Cannot create new dialogue content at runtime
- Limited to combinatorial variation of existing templates

---

## Experimental Phase Acknowledgment

Community Mode represents a reverse-engineering effort of the Facade game architecture combined with Scribblenauts object creation concepts. As such:

**This is experimental software**:
- Architecture is sound but content is limited
- Template pools require significant expansion
- Integration points between subsystems need refinement
- Performance has not been optimized at scale

**Known Issues**:
- WME listener errors (non-blocking) during initialization
- Limited testing coverage
- No physics simulation (properties tracked but not simulated)
- No 3D rendering (positions stored but not visualized)

**Design Trade-offs**:
- Chose offline capability over infinite flexibility
- Chose deterministic behaviors over probabilistic AI
- Chose template-based responses over generative text
- Chose rule-based logic over neural networks

---

## Roadmap

### Phase 1: Template Expansion (Short-term)
**Objective**: Improve illusion of infinite possibilities through quantity

- Expand dialogue templates from 828 to 5,000+ variants
- Add 50+ discourse act categories
- Increase NPC role types from 4 to 20+
- Generate 100+ drama beats per genre
- Add 500+ object noun templates
- Expand adjective vocabulary to 200+

**Timeline**: 2-3 months
**Impact**: Reduces repetition, handles more scenarios

### Phase 2: Distilled Language Model Integration (Medium-term)
**Objective**: Add limited generative capability without cloud dependency

**Approach**: Integrate a small distilled language model (< 500MB) that runs locally:

**Model Candidates**:
- DistilGPT-2 (82M parameters, ~350MB)
- TinyLlama (1.1B parameters, quantized to 4-bit, ~600MB)
- Phi-2 (2.7B parameters, quantized, ~800MB)

**Use Cases**:
- Generate dialogue variations from templates
- Synthesize novel responses for unexpected input
- Create dynamic beat descriptions
- Generate object property descriptions
- Provide fallback responses that feel less robotic

**Architecture Changes**:
- Add local model inference layer
- Template system becomes prompt engineering
- Hybrid approach: use templates when possible, generate when necessary
- Cache generated responses for performance

**Requirements**:
- Model must run on consumer hardware (CPU inference)
- Inference latency < 2 seconds
- Memory footprint < 1GB
- No internet connectivity required
- Multi-language support

**Implementation Steps**:
1. Evaluate distilled models for quality/size trade-off
2. Build local inference wrapper (ONNX Runtime or llama.cpp)
3. Design prompt templates for dialogue generation
4. Implement caching layer for generated responses
5. Create fallback chain: templates → cache → generation
6. Optimize inference performance
7. Multi-language fine-tuning or translation layer

**Timeline**: 4-6 months
**Impact**: Provides pseudo-infinite dialogue while maintaining offline capability

### Phase 3: Dynamic Content Generation (Long-term)
**Objective**: Generate beats, goals, and scenarios procedurally

- Procedural beat generation based on story values
- Dynamic goal creation based on NPC personality
- Emergent narrative structures beyond predefined arcs
- Object-aware NPC behaviors (react to created objects)
- Physics simulation integration

**Timeline**: 6-12 months
**Impact**: Approaches Gemini-like infinite possibility space

### Phase 4: Performance and Polish
**Objective**: Production-ready optimization

- Comprehensive testing suite
- Performance profiling and optimization
- Memory management improvements
- Error handling robustness
- User experience refinement
- Documentation completion

**Timeline**: 3-4 months
**Impact**: Stable, performant, maintainable codebase

---

## Technical Specifications

### Current Architecture
- **Language**: TypeScript
- **Total Files**: 191 TypeScript files
- **Core Systems**: 6 (ABL, Drama, Working Memory, Rules, Object Creation, Persistence)
- **Lines of Code**: ~25,000 (estimated)
- **Template Count**: 1,148 hardcoded response strings
- **Supported Languages**: 12

### Performance Metrics
- **NPC Initialization**: < 100ms
- **Interaction Processing**: < 50ms (9-step pipeline)
- **Object Creation**: < 20ms
- **Save/Load**: < 200ms

### Resource Requirements
- **Memory**: ~50MB (base system)
- **Disk**: ~10MB (code + templates)
- **CPU**: Minimal (no heavy computation)

### With Distilled Model (Projected)
- **Memory**: ~600MB (base + model)
- **Disk**: ~500MB (code + model weights)
- **CPU**: Moderate (inference on-demand)
- **Inference Time**: 1-2 seconds per generation

---

## Comparison: Community Mode vs Cloud Gemini

| Capability | Cloud Gemini | Community Mode (Current) | Community Mode (With Distilled Model) |
|---|---|---|---|
| Text Input Handling | Infinite AI-generated responses | 23 discourse patterns, fallback for unknown | Hybrid: templates + generation for fallback |
| NPC Responses | Unlimited unique | 828 templates | 5,000+ templates + generated variations |
| Story Progression | Endless generation | 5 predefined beats | 100+ beats + procedural generation |
| Object Creation | AI-described | Full property system | Full system + AI descriptions |
| Offline Capability | No | Yes | Yes |
| Language Learning Focus | Moderate | High | High |
| Cost | API costs per call | Free | Free |
| Latency | 500-2000ms (network) | < 50ms | 50-2000ms (generation when needed) |
| Possibility Space | Infinite | ~100 scenarios | ~1,000 scenarios |

---

## Conclusion

Community Mode represents a significant engineering achievement in implementing complex academic AI systems for offline gameplay. The current template-based architecture provides a solid foundation for deterministic, language-learning focused experiences.

The primary limitation—finite dialogue possibilities—is being addressed through a roadmap that includes distilled language model integration. This hybrid approach will provide pseudo-infinite text generation while maintaining the offline, AI-free philosophy that defines Community Mode.

This is experimental software in active development. Contributions, feedback, and testing are welcome as we work toward production readiness.

---

## References

1. Mateas, M., & Stern, A. (2003). "Facade: An experiment in building a fully-realized interactive drama." Game Developers Conference.

2. Mateas, M., & Stern, A. (2005). "Structuring content in the Facade interactive drama architecture." Proceedings of Artificial Intelligence and Interactive Digital Entertainment (AIIDE).

3. Laird, J. E. (2012). "The Soar Cognitive Architecture." MIT Press.

4. Forgy, C. L. (1982). "Rete: A fast algorithm for the many pattern/many object pattern match problem." Artificial Intelligence, 19(1), 17-37.

5. "Scribblenauts" (2009). Developed by 5th Cell, published by Warner Bros. Interactive Entertainment.

---

**Document Version**: 1.0
**Last Updated**: 2026-01-09
**Status**: Living document, subject to updates as development progresses
