# Cloud AI Mode: Overview and Roadmap

## Executive Summary

Cloud AI Mode is a production-ready multi-provider language learning game engine that leverages state-of-the-art large language models to create dynamic, infinite narrative experiences. The system supports 6 cloud AI providers with automatic fallback mechanisms, enabling users to select their preferred provider based on speed, cost, language support, and availability.

**Current Status**: Production-Ready
**Supported Providers**: 6 (Groq, DeepSeek, OpenRouter, Together AI, DeepInfra, Google Gemini)
**Core Strength**: Infinite dynamic content generation with adaptive language learning

---

## What Has Been Implemented

### 1. Multi-Provider Architecture (100% Complete)

Cloud AI Mode implements a factory pattern design that supports six different AI providers, each with distinct advantages. All providers use a unified interface for consistent gameplay regardless of selection.

#### Supported Providers

**Groq (Llama 3.1 70B)**
- API Endpoint: `https://api.groq.com/openai/v1`
- Model: `llama-3.1-70b-versatile`
- Free Tier: 14,400 requests/day (industry-leading)
- Speed: 500+ tokens/second (ultra-fast inference)
- Advantages: Highest quota, fastest inference, reliable uptime
- Limitations: No native TTS (browser fallback)

**DeepSeek V3**
- API Endpoint: `https://api.deepseek.com/v1`
- Model: `deepseek-chat` (V3 architecture)
- Free Tier: Available with registration
- Language Support: 100+ languages (best for multilingual)
- Advantages: Exceptional multi-language quality, competitive pricing
- Limitations: No native TTS

**OpenRouter (Multi-Model Aggregator)**
- API Endpoint: `https://openrouter.ai/api/v1`
- Model: `google/gemini-flash-1.5` (default, configurable)
- Free Tier: Varies by model (many free options)
- Advantages: Access to 100+ models through single API, free Gemini access
- Limitations: Model-dependent performance, no TTS

**Together AI**
- API Endpoint: `https://api.together.xyz/v1`
- Model: `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`
- Free Tier: $25 free credits for new users
- Advantages: High-quality models, good performance
- Limitations: Credits expire, no TTS

**DeepInfra**
- API Endpoint: `https://api.deepinfra.com/v1/openai`
- Model: `meta-llama/Meta-Llama-3.1-70B-Instruct`
- Free Tier: Generous free tier
- Advantages: Reliable infrastructure, good uptime
- Limitations: No TTS

**Google Gemini 2.5 Flash**
- API: Google GenAI SDK (`@google/genai`)
- Model: `gemini-2.5-flash` (with TTS variant)
- Free Tier: 20 requests/day (limited)
- Advantages: Native TTS support, structured JSON schema enforcement
- Limitations: Smallest quota, Google account required

### 2. Unified Game Engine Interface

All providers implement the same interface for consistent gameplay:

#### Core Methods
- `initGame()`: Initialize chat session with system prompt
- `processTurn(input)`: Process player input, return structured game state
- `generateSpeech(text)`: Text-to-speech generation (provider-dependent)

#### Structured Response Schema
All providers return a validated JSON schema:

```typescript
interface GameTurnData {
  narrative: string;               // Main story in target language
  sceneData: {
    biome: string;                 // Visual environment
    features: string[];            // Scene objects (max 5)
    entities: string[];            // NPCs/creatures (max 3)
    timeOfDay: string;             // Lighting/atmosphere
  };
  playerOptions: string[];         // Suggested actions (3)
  inventory: InventoryItem[];      // Current items
  health: number;                  // HP (0-100)
  locationName: string;            // Current location

  // Language Learning (optional)
  simplifiedNarrative?: string;    // A1-level simplified version
  nativeTranslation?: string;      // Translation to native language
  feedback?: string;               // Grammar corrections
}
```

### 3. Language Learning Pedagogy

#### Berlitz Method Implementation
All providers use the Berlitz Method for natural error correction:
- Never explicitly corrects ("that's wrong")
- Recasts mistakes in correct form naturally
- Continues narrative flow without breaking immersion

**Example**:
```
User: "I eated the apple."
AI: "You ate the apple and felt refreshed. The sweet juice..."
```

#### Adaptive CEFR Difficulty
System prompts instruct AI to:
- Start at A1 level (beginner)
- Monitor user performance (vocabulary, grammar correctness)
- Gradually increase complexity toward A2, B1, B2, C1, C2
- Introduce 2-3 new vocabulary words per turn

#### Multi-Format Learning Aids
- **Simplified Narrative**: A1-level version for complex text
- **Native Translation**: Full translation in user's native language
- **Grammar Feedback**: Corrections explained in native language
- **Contextual Learning**: Vocabulary learned through gameplay context

### 4. Genre Support (6 Genres)

#### Implemented Genres
1. **Fantasy**: Forests, caves, dungeons, magical creatures
2. **Science Fiction**: Space stations, cyberpunk cities, alien worlds
3. **Horror**: Graveyards, dark caves, haunted locations
4. **Mystery**: Towns, investigation scenes, detective scenarios
5. **Western**: Deserts, canyons, old west towns
6. **Cyberpunk**: Neon cities, dystopian interiors, tech environments

#### Genre-Specific Biome Mapping
System prompts include genre-appropriate biome instructions:
- Fantasy → forest, cave, dungeon
- Horror → graveyard, cave (dark), interior (haunted)
- Cyberpunk → cyber_city, interior (tech)
- Western → desert, canyon, town (old west)
- SciFi → cyber_city (futuristic), interior (spaceship/lab)
- Mystery → town, interior (investigation scenes)

### 5. Visual Scene System

#### Dynamic Scene Updates
Every turn updates visual scene data:
- **Biome**: Environment type (14 options)
- **Features**: Objects in scene (max 5)
- **Entities**: NPCs/creatures (max 3)
- **Time of Day**: Lighting atmosphere (day, night, sunset, foggy)

#### Supported Biomes
forest, cave, dungeon, town, beach, desert, cyber_city, interior, mountain, graveyard, underwater, canyon, tundra, savannah

### 6. State Management & Persistence

#### Game State Tracking
- **Conversation History**: Full message log (user + AI)
- **Inventory**: Dynamic item management
- **Health**: HP tracking (0-100)
- **Location**: Current location name
- **Loading States**: Real-time feedback

#### Auto-Save System
- Debounced saves every 2 seconds
- Session-based persistence
- Resume capability across browser sessions
- Local storage for state (API keys in sessionStorage)

### 7. Multi-Language Support

#### Supported Languages (12)
English, Spanish, French, German, Italian, Japanese, Chinese (Simplified), Russian, Portuguese, Ukrainian, Polish, Czech

#### Language-Specific Rules
System prompts include specific guidelines:
- **Japanese**: Standard Japanese (Hyōjungo), no strong dialects
- **Mandarin**: Simplified Chinese characters
- **Slavic Languages**: Correct grammatical cases (Ukrainian, Russian, Czech, Polish)
- **All Languages**: CEFR-aligned difficulty progression

### 8. Text-to-Speech Integration

#### Provider Support
- **Gemini**: Native TTS via `gemini-2.5-flash-preview-tts` model
  - Voice: Configurable (default: Kore)
  - Format: Base64 audio data
  - Quality: High-quality neural TTS

- **All Other Providers**: Browser TTS fallback
  - Uses Web Speech API
  - Language-specific voices
  - Quality: Varies by browser

### 9. Security & Privacy

#### API Key Management
- **Storage**: sessionStorage (not persistent across browser restarts)
- **Scope**: Never sent to Penko servers
- **Direct Communication**: Keys sent only to selected AI provider
- **Security**: No server-side key storage

#### Data Privacy
- Conversation history stored locally
- No telemetry or tracking
- User controls all data
- Can clear data anytime

---

## System Prompts & AI Instructions

### Unified Pedagogy Prompt

All cloud providers use the same system prompt template:

```
You are 'Penko', an adaptive AI Game Master that creates immersive
text adventures for language learning.

OBJECTIVE: Create gameplay in [TARGET_LANGUAGE] where the user learns
naturally through context.

LANGUAGE RULES:
- Start at CEFR A1 level
- Monitor user performance and adapt difficulty
- Introduce 2-3 new vocabulary words per turn
- Use Berlitz Method for corrections (recast, don't correct explicitly)

LOCALIZATION:
- Provide simplified narrative (A1 level) if narrative is complex
- Provide native translation in [NATIVE_LANGUAGE]
- Provide grammar feedback in [NATIVE_LANGUAGE]

MECHANICS:
- Update sceneData every turn (biome, features, entities, timeOfDay)
- Provide 3 player options (suggested actions)
- Track inventory and health
- Maintain location continuity

GENRE ADAPTATION:
[Genre-specific biome and atmosphere instructions]

START IMMEDIATELY. No meta-talk. Begin the adventure.
```

---

## User Interface & Experience

### Provider Selection UI

#### Cloud Config Component
Users select provider from dropdown with detailed information:

```
Dropdown Options:
1. ⚡ Groq (Llama 3.1) - 14,400 req/day FREE
2. 🇨🇳 DeepSeek V3 (100+ languages) - FREE tier
3. 🌐 OpenRouter (Multi-Model) - FREE models
4. 🚀 Together AI (Llama/Qwen) - $25 free credits
5. 🔷 DeepInfra (Llama/Qwen) - Generous free tier
6. 🧠 Google Gemini 2.5 Flash - 20 req/day
```

#### Provider Info Panels
Each provider includes help panel:
- About (who created it)
- Free tier details
- Model specifications
- Special features (TTS, language support)
- Direct link to API key page

#### API Key Input
- Dynamic label per provider
- Password-masked input
- Placeholder text with key format
- Direct "Get Key" link
- Real-time validation

### Game Interface Components

#### Message Display
- User messages (right-aligned)
- AI responses (left-aligned)
- System messages (centered)
- Timestamp per message
- Loading indicators

#### Scene Visualizer
- Dynamic biome rendering
- Feature list display
- Entity list display
- Time of day atmosphere

#### Action Buttons
- 3 suggested options per turn
- Click to auto-fill input
- Keyboard shortcuts

#### Language Learning Panel
- Simplified toggle button
- Translate toggle button
- Grammar feedback display
- Vocabulary highlights

---

## Architecture Design

### Factory Pattern Implementation

`EngineFactory.createEngine()` instantiates correct provider:

```typescript
static async createEngine(
  mode: GameMode,
  profile: UserProfile,
  apiKey: string,
  cloudProvider: CloudProvider
): Promise<GameEngineInstance>

Providers:
- 'groq' → GroqEngine
- 'gemini' → GameEngine
- 'openrouter' → OpenRouterEngine
- 'together' → TogetherEngine
- 'deepinfra' → DeepInfraEngine
- 'deepseek' → DeepSeekEngine
```

### Automatic Fallback System

`createEngineWithFallback()` tries providers in priority order:

**Default Priority** (optimized for free tier):
1. Groq (fastest, biggest quota)
2. DeepSeek (best multi-language)
3. OpenRouter (free Gemini access)
4. Together (free credits)
5. DeepInfra (generous free tier)
6. Gemini (smallest quota, TTS)

If provider fails (API key invalid, quota exhausted, network error), automatically tries next in list.

### State Management Pattern

React hook `useGameState` manages all gameplay state:
- Conversation history
- Game state (health, inventory, location)
- Loading states
- Error handling
- Auto-save coordination

---

## Technical Specifications

### Performance Metrics
- **Groq Response Time**: 500-1000ms (fastest)
- **Other Providers**: 1000-3000ms (varies)
- **Gemini TTS Generation**: 2000-4000ms
- **Auto-Save Debounce**: 2000ms
- **Network Timeout**: 30 seconds

### Resource Requirements
- **Memory**: ~100MB (base) + browser overhead
- **Network**: Continuous connectivity required
- **API Quota**: Provider-dependent (20-14,400 req/day)

### Error Handling
- Network errors: Retry with exponential backoff
- API errors: Display user-friendly message
- Quota exhaustion: Suggest provider switch
- Invalid JSON: Request regeneration
- Timeout: Cancel and retry

---

## Current Limitations

### Technical Constraints
1. **Internet Dependency**: Cannot play offline
2. **API Key Required**: Must register with at least one provider
3. **Rate Limits**: Free tiers have daily/monthly quotas
4. **Latency**: Network delay 1-5 seconds per turn
5. **Cost**: Free tiers can be exhausted (Groq exception)

### Feature Limitations
6. **No Structured Objects**: Unlike Community Mode, no object property system
7. **AI Unpredictability**: Responses can occasionally be off-topic
8. **Schema Compliance**: Some providers may deviate from JSON schema
9. **TTS Quality**: Only Gemini has high-quality neural TTS
10. **Limited Vocabulary Database**: No pre-built grammar reference

### Provider-Specific Issues
11. **Gemini Quota**: Only 20 requests/day (severe limitation)
12. **DeepSeek Availability**: China-based, potential regional restrictions
13. **OpenRouter Variability**: Performance depends on selected model
14. **Together Credits**: $25 free credits eventually expire

---

## Comparison: Cloud AI vs Community Mode

| Feature | Cloud AI Mode | Community Mode |
|---------|---------------|----------------|
| **Content Generation** | Infinite AI-generated | Finite template-based (~1,148 strings) |
| **Internet Required** | Yes | No |
| **Response Time** | 1-5 seconds | <50ms |
| **Replayability** | Infinite unique | ~100 predefined scenarios |
| **Language Quality** | Provider-dependent | Pre-validated grammar |
| **Cost** | Free tier + potential API costs | Free (no API) |
| **Determinism** | Unpredictable AI | Deterministic rules |
| **Object System** | AI-described only | Full property system (materials, scale, colors) |
| **Narrative Flexibility** | Handles ANY player input | 23 discourse patterns |
| **Learning Pedagogy** | Berlitz Method (AI-driven) | Structured grammar lessons |
| **Content Packs** | N/A (AI generates) | Community-created packs |
| **Voice Input** | No | Browser AI mode only |
| **Offline Play** | No | Yes |
| **Privacy** | Data sent to AI provider | All local |

---

## Roadmap

### Guiding Principle: User Choice and Open Access

This is a free, open-source project. We believe in maximizing user choice rather than restricting access. Cloud AI Mode will never be removed or restricted. Instead, we continuously expand available options as new AI providers and models become available.

### Phase 1: New Provider Integration (Ongoing)

#### Objective: Add emerging AI providers as they launch

**Planned Additions**:
- **Mistral AI**: When free tier becomes available
- **Anthropic Claude**: If free tier launched
- **Cohere**: Command-R models if free access provided
- **HuggingFace Inference API**: Community models
- **Replicate**: Pay-per-use open models

**Integration Requirements**:
- Free tier OR affordable pay-per-use
- JSON response capability
- Multi-language support
- Reasonable rate limits

**Timeline**: Continuous (add within 2 weeks of provider launch)

### Phase 2: Local Distilled Model Integration (High Priority)

#### Objective: Add offline-capable distilled language models

Distilled models (small LLMs that run locally) will be added to the provider dropdown alongside cloud options, giving users offline AI capabilities without sacrificing dynamic content generation.

**Target Models** (< 1GB):
- **DistilGPT-2** (82M parameters, ~350MB)
  - Smallest option, fastest inference
  - Good for basic dialogue
  - Limited context window

- **TinyLlama 1.1B** (4-bit quantized, ~600MB)
  - Better quality than DistilGPT-2
  - Reasonable speed on CPU
  - Good instruction-following

- **Phi-2 2.7B** (4-bit quantized, ~800MB)
  - Microsoft's efficient small model
  - Strong reasoning capability
  - Better multi-language support

- **Gemma 2B** (4-bit quantized, ~700MB)
  - Google's open model
  - Good balance of size/quality
  - Safety-aligned

**Integration Approach**:
1. **Browser-Based Inference**: ONNX Runtime or Transformers.js
2. **WebAssembly Acceleration**: SIMD optimization for CPU inference
3. **Model Caching**: Download once, cache in IndexedDB
4. **Streaming Responses**: Token-by-token generation
5. **Hybrid Mode**: Use cloud for complex queries, local for simple

**Dropdown Addition**:
```
Cloud Providers:
- ⚡ Groq (Llama 3.1) - 14,400 req/day FREE
- 🇨🇳 DeepSeek V3 (100+ languages) - FREE tier
- ... (existing providers)

Local Models (Offline):
- 🏠 Phi-2 2.7B (Local - ~800MB download)
- 🏠 TinyLlama 1.1B (Local - ~600MB download)
- 🏠 DistilGPT-2 (Local - ~350MB download)
- 🏠 Gemma 2B (Local - ~700MB download)
```

**User Experience**:
- First use: Download model (progress bar)
- Subsequent uses: Load from cache (instant)
- Inference: 2-5 seconds per response (acceptable latency)
- No API key required
- No quota limits
- Full offline capability

**Timeline**: 4-6 months
**Impact**: Provides "best of both worlds" - offline play with AI generation

### Phase 3: Advanced Model Options (Medium Priority)

#### Objective: Support advanced models for power users

**Large Local Models** (2-8GB):
- **Llama 3.1 8B** (4-bit quantized, ~4GB)
  - High-quality local inference
  - Requires 8GB+ RAM
  - Desktop only

- **Mistral 7B** (4-bit quantized, ~3.5GB)
  - Strong multi-language
  - Good instruction-following
  - Reasonable speed on GPU

**Approach**:
- Detect user hardware capabilities
- Only show large models if sufficient RAM/GPU
- Provide performance warnings
- Optional GPU acceleration (WebGPU)

**Dropdown Section**:
```
Local Models (Advanced - Requires 8GB+ RAM):
- 🖥️ Llama 3.1 8B (Local - ~4GB download)
- 🖥️ Mistral 7B (Local - ~3.5GB download)
```

**Timeline**: 8-12 months (after Phase 2)

### Phase 4: Hybrid Intelligence (Long-Term Vision)

#### Objective: Combine local models with cloud for optimal experience

**Concept**: Use small local model for simple tasks, escalate to cloud for complex queries.

**Decision Tree**:
```
User Input → Complexity Analysis
  ├─ Simple (greeting, basic question) → Local Model (instant)
  └─ Complex (creative, multi-step) → Cloud Provider (better quality)
```

**Benefits**:
- Reduce cloud API usage (save quota/costs)
- Faster response for simple queries
- Maintain quality for complex scenarios
- Seamless user experience

**Implementation**:
- Train small classifier to detect complexity
- Route automatically
- Cache cloud responses for reuse
- Learn from user patterns

**Timeline**: 12-18 months

### Phase 5: Community Model Marketplace (Aspirational)

#### Objective: Enable community fine-tuning and sharing

**Vision**:
- Users fine-tune small models on their language learning content
- Share fine-tuned models in marketplace
- Download community models for specialized scenarios
- Rate and review models

**Example Use Cases**:
- Medical Spanish vocabulary model
- Business Japanese conversation model
- Technical German documentation model
- Conversational French slang model

**Timeline**: 18-24 months (research phase)

---

## Provider Expansion Strategy

### Criteria for New Provider Addition

1. **Free Tier Availability**: Must offer free tier OR affordable pay-per-use
2. **API Accessibility**: RESTful API or JavaScript SDK
3. **JSON Support**: Can return structured JSON responses
4. **Multi-Language**: Supports at least 5 of Penko's 12 languages
5. **Rate Limits**: Reasonable quota (minimum 100 requests/day free)
6. **Reliability**: >99% uptime
7. **Documentation**: Clear API documentation
8. **Legal**: Terms of Service allow educational use

### Evaluation Process

New providers evaluated quarterly:
1. Technical assessment (API quality, latency, reliability)
2. Cost analysis (free tier limits, pricing structure)
3. Language quality testing (all 12 Penko languages)
4. Community feedback (request volume, user preference)
5. Integration effort (development time estimate)

### Priority Ranking

**High Priority** (add within 1 month):
- Large free tiers (1,000+ requests/day)
- Unique capabilities (voice, vision, specialized languages)
- High user demand (>10 community requests)

**Medium Priority** (add within 3 months):
- Moderate free tiers (100-1,000 requests/day)
- Good quality/cost ratio
- Moderate user demand

**Low Priority** (evaluate later):
- Small free tiers (<100 requests/day)
- Expensive pay-per-use
- Low user demand

---

## Open Source Philosophy

### Core Commitments

1. **Never Remove Options**: Once a provider is added, it remains available (unless provider discontinues service)
2. **No Artificial Restrictions**: Don't limit user choice for business reasons
3. **Transparent Trade-offs**: Clearly document pros/cons of each provider
4. **Community-Driven**: Add providers based on user requests
5. **Free-Tier First**: Prioritize providers with generous free tiers
6. **Local Options**: Always provide offline alternatives (Community Mode + local models)

### Community Contributions

We welcome community contributions for:
- New provider integrations
- Local model optimizations
- UI/UX improvements
- Language support enhancements
- Bug fixes and testing

**Contribution Guidelines**: See CONTRIBUTING.md

---

## Migration Path: Cloud → Local Models

As local distilled models improve, we expect many users to migrate from cloud to local:

### Phase 1 (Current): Cloud-Only
Users rely on cloud providers (Groq, Gemini, etc.)

### Phase 2 (6 months): Hybrid Option
Users can choose cloud OR local distilled models

### Phase 3 (12 months): Hybrid Intelligence
System automatically routes simple queries to local, complex to cloud

### Phase 4 (18+ months): Local-First
Most queries handled locally, cloud only for edge cases

**Goal**: Provide cloud-quality experience with local-speed and offline capability.

---

## Conclusion

Cloud AI Mode represents a production-ready, extensible platform for AI-powered language learning. The multi-provider architecture ensures users always have access to free AI services while maintaining flexibility to choose based on their priorities (speed, language support, cost, features).

The roadmap emphasizes **user choice** and **continuous expansion** rather than restriction. As the AI landscape evolves with new providers and local models, Penko will integrate these options, always prioritizing free access and user autonomy.

This is a living system that grows with the AI ecosystem. We never remove options—we only add more.

---

## Technical References

### Cloud Provider Documentation
- Groq API: https://console.groq.com/docs
- Google Gemini: https://ai.google.dev/docs
- OpenRouter: https://openrouter.ai/docs
- Together AI: https://docs.together.ai
- DeepInfra: https://deepinfra.com/docs
- DeepSeek: https://platform.deepseek.com/docs

### Local Model Resources
- ONNX Runtime: https://onnxruntime.ai
- Transformers.js: https://huggingface.co/docs/transformers.js
- WebAssembly SIMD: https://v8.dev/features/simd
- TinyLlama: https://github.com/jzhang38/TinyLlama
- Phi-2: https://huggingface.co/microsoft/phi-2

---

**Document Version**: 1.0
**Last Updated**: 2026-01-09
**Status**: Living document, continuously updated as providers and models are added
