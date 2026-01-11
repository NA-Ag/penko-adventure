# Penko Adventure

**Free, open-source language learning through interactive storytelling**

Penko Adventure is a text-based adventure game designed for natural language acquisition. Learn languages by writing your thoughts, actions, and opinions in a controlled narrative environment where you drive the story through your choices.

---

## Why Penko Adventure?

Traditional language learning apps like Duolingo have limitations:
- Limited daily practice (artificial restrictions)
- Repetitive exercises (memorization-focused)
- Passive learning (multiple choice, no production)
- Subscription paywalls (expensive for unlimited access)

**Penko Adventure is different:**
- **Study as much as you want, whenever you want** - No artificial limits
- **Active production** - Write full sentences, not just select from options
- **Context-driven learning** - Navigate complex narratives you create
- **Grammar refinement** - Acquire language naturally through use
- **Free forever** - No subscriptions, no ads, no paywalls
- **Offline capable** - Learn without internet connection
- **Privacy-first** - Your data stays on your device

---

## Core Philosophy

**Natural Language Acquisition through Interactive Narrative**

The objective is simple: enable learners to acquire and refine grammar and vocabulary through active use in meaningful contexts. You write your thoughts, actions, and opinions to drive the narrative forward. The game responds in your target language, creating a feedback loop that mirrors natural conversation.

This is not about memorizing word lists or completing exercises. It's about *using* the language to accomplish goals in a story you control.

**Free Open-Source Education for Everyone**

Language education should be accessible to everyone, regardless of economic status or geographic location. Penko Adventure is:
- **Free forever** - GPL v3 licensed, always free
- **Open source** - Community-driven development
- **Offline-capable** - Works without internet (Browser AI & Community modes)
- **Privacy-respecting** - No data collection, no tracking
- **Quality-focused** - No compromises on educational effectiveness

---

## Features

### Three Game Modes

**1. Community Mode** (Offline, Template-Based)
- Pre-authored narrative templates
- Instant responses (<50ms)
- Perfect for beginners (A1-A2)
- No AI, no downloads, works anywhere
- 1,148+ templates in 12 languages
- **Status**: ⚠️ Experimental

**2. Cloud AI Mode** (Online, Frontier LLMs)
- 6 AI providers (Groq, Gemini, DeepSeek, OpenRouter, Together, DeepInfra)
- Unlimited narrative variety
- Sub-second responses (0.5-2s)
- Best for advanced learners (B1-C2)
- Free tier available on most providers
- **Status**: Production-ready

**3. Browser AI Mode** (Offline, Local Models)
- Runs AI models in your browser (ONNX + WebAssembly)
- Complete privacy (everything stays local)
- Works offline after initial download
- 4 quality tiers (Tiny: 700MB → Reasoning: 1.5GB)
- Native multilingual support (29+ languages)
- **Status**: ⚠️ Experimental

### Language Learning Features

- **12 Languages Supported**: English, Spanish, French, German, Italian, Portuguese, Japanese, Mandarin, Russian, Ukrainian, Polish, Czech
- **CEFR-Adaptive Difficulty**: Automatically adjusts from A1 to C2 based on your performance
- **Berlitz Method Grammar Correction**: Recasts instead of explicit corrections (natural acquisition)
- **Smart Vocabulary Tracking**: Learns which words you know, introduces new ones gradually
- **Context Compression**: Maintains story coherence across long sessions
- **Input Checking**: Real-time grammar and spelling feedback

### Technical Features

- **Progressive Web App (PWA)**: Install on desktop or mobile
- **Offline-First Architecture**: Core functionality works without internet
- **Cross-Platform**: Runs on Windows, Mac, Linux, Android, iOS
- **Low-End Device Support**: Optimized for devices with as little as 2GB RAM
- **Firefox Optimized**: Specifically tested and tuned for Firefox on Linux
- **Browser Cache Management**: Smart model storage and cleanup

---

## How It Works

### 1. Choose Your Mode

**Community Mode**: Best for beginners or offline learners. Uses pre-written narrative templates for instant responses. No downloads required.

**Cloud AI Mode**: Best for intermediate/advanced learners with internet. Generates unique narratives using frontier AI models. Requires API key (free tiers available).

**Browser AI Mode**: Best for privacy-conscious learners or those with unreliable internet. Downloads AI model once, then works completely offline.

### 2. Select Your Target Language

Choose from 12 supported languages. The game will generate narratives, provide feedback, and track your progress in your chosen language.

### 3. Start Playing

Write what you want to do in the target language. The game responds and the story unfolds based on your choices. Make mistakes - that's how you learn. The game provides gentle corrections using the Berlitz method.

Example:
```
You: "voy al bosque" (Spanish, A1)
Game: "Vas al bosque oscuro. Ves un árbol grande y un sendero estrecho."
[Correction: "voy" → "vas" (recast in response)]

Options:
- Examinar el árbol
- Seguir el sendero
- Descansar
```

### 4. Learn Through Context

As you play, the game:
- Introduces new vocabulary in context (2-3 words per turn)
- Tracks which words you've mastered
- Adapts difficulty based on your performance
- Provides grammar feedback through recasting
- Maintains narrative coherence across sessions

---

## Installation

### Play Online (Recommended)

Visit [penko.app](https://penko.app) to play immediately in your browser. No installation required.

### Install as PWA (Desktop/Mobile)

1. Visit [penko.app](https://penko.app) in Chrome, Firefox, or Safari
2. Click the install prompt or "Add to Home Screen"
3. Launch from your desktop or app drawer

### Build from Source

```bash
# Clone repository
git clone https://github.com/NA-Ag/penko-adventure
cd penko-adventure

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

**Requirements:**
- Node.js 18+
- npm 9+
- Modern browser (Chrome 113+, Firefox 115+, Safari 16+)

---

## Game Modes in Detail

### Community Mode (Template-Based)

**Architecture**: Facade interactive drama system + ResponseTemplates

**Pros:**
- Instant responses (<50ms)
- Zero downloads
- Works on any device
- Perfect offline capability
- Validated content (no inappropriate responses)

**Cons:**
- Finite content (~1,148 templates)
- Limited to 23 discourse patterns
- Exhausts after 20-30 turns
- Cannot handle unexpected player actions

**Best For**: Absolute beginners (A1-A2), offline learners, low-bandwidth environments

**Technical Details**: See [community_overview_and_roadmap.md](community_overview_and_roadmap.md)

---

### Cloud AI Mode (Frontier LLMs)

**Architecture**: Multi-provider fallback system with 6 AI providers

**Providers:**
1. **Groq** (Llama 3.1 70B) - 14,400 req/day FREE, 500+ tokens/sec
2. **DeepSeek V3** - 100+ language support, trial available
3. **OpenRouter** (Gemini Flash 1.5) - Access to 100+ models
4. **Together AI** (Llama 3.1 70B) - $25 free credits
5. **DeepInfra** (Llama 3.1 70B) - Generous free tier
6. **Gemini 2.5 Flash** - Native TTS, 20 req/day

**Pros:**
- Unlimited narrative variety
- Sub-second responses (0.5-2s)
- Frontier-quality narratives
- Automatic provider fallback
- Free tiers available

**Cons:**
- Requires internet connectivity
- API key setup required
- Data sent to third-party providers
- Free tier rate limits

**Best For**: Intermediate/advanced learners (B1-C2), learners prioritizing speed and quality

**Technical Details**: See [cloud_overview_and_roadmap.md](cloud_overview_and_roadmap.md)

---

### Browser AI Mode (Local ONNX Models)

**Architecture**: WebAssembly + ONNX Runtime + Transformers.js

**Model Tiers:**
- **Tiny** (IBM Granite 4.0 350M) - 700MB, 3-8s, 12 languages
- **Small** (Qwen 2.5 0.5B) - 600MB, 5-15s, 29 languages ⭐ RECOMMENDED
- **Medium** (Qwen 2.5 1.5B) - 1.8GB, 10-30s, 29 languages
- **Reasoning** (DeepSeek R1 1.5B) - 1.5GB, 10-25s, EN+ZH

**Pros:**
- Complete offline capability
- Perfect privacy (all local processing)
- Zero API costs
- Native multilingual (29+ languages)
- True open-source (Apache 2.0 / MIT licenses)

**Cons:**
- Initial 2-20min download
- Slower inference (5-30s on CPU)
- Requires 600MB-1.8GB storage
- Firefox WASM memory limits

**Best For**: Privacy-conscious learners, offline-first users, learners with unreliable internet

**Technical Details**: See [browser_overview_and_roadmap.md](browser_overview_and_roadmap.md)

---

## Browser AI Optimizations

Browser AI includes 5 optimization strategies to match Cloud AI's speed:

1. **Pre-Generation** - Predicts next actions, generates responses in background
2. **Smart Vocabulary** - Constrains AI vocabulary based on your level (3-5x faster)
3. **Structured Output** - Forces JSON schema instead of free-text (3-5x faster)
4. **Context Compression** - Aggressive history compression (2x faster)
5. **Batched Generation** - Generates 3 turns at once (3x amortized speedup)

**Result**: <2s average response time (matching Cloud AI) with 85-90% cache hit rate

**Implementation**: See [services/browser/README.md](services/browser/README.md)

---

## Supported Languages

| Language | Code | CEFR Levels | Native AI Support |
|----------|------|-------------|-------------------|
| English | en | A1-C2 | ✅ |
| Spanish | es | A1-C2 | ✅ |
| French | fr | A1-C2 | ✅ |
| German | de | A1-C2 | ✅ |
| Italian | it | A1-C2 | ✅ |
| Portuguese | pt | A1-C2 | ✅ |
| Japanese | ja | A1-C2 | ✅ |
| Mandarin | zh | A1-C2 | ✅ |
| Russian | ru | A1-C2 | ✅ |
| Ukrainian | uk | A1-C2 | ✅ |
| Polish | pl | A1-C2 | ✅ |
| Czech | cs | A1-C2 | ✅ |

**Note**: Browser AI (Qwen 2.5) natively supports 29+ languages. Cloud AI providers support 50-100+ languages depending on the model.

---

## Development Roadmap

### Community Mode
- [ ] Expand template library (1,148 → 3,000+ templates)
- [ ] Add more genres (6 → 12 genres)
- [ ] Implement community content pack system
- [ ] Add visual novel-style character portraits

### Cloud AI Mode
- [ ] Add more providers (Claude, Mistral, Cohere)
- [ ] Implement response streaming (token-by-token display)
- [ ] Add conversation memory persistence
- [ ] Improve automatic fallback logic

### Browser AI Mode
- [ ] ~~WebGPU acceleration~~ (Not viable - Firefox incompatible)
- [ ] Bundle starter cartridge (<100MB) for instant start
- [ ] Implement streaming inference (CPU only)
- [ ] Add INT8 quantization option (larger but faster)
- [ ] Improve vocabulary constraint system

### General
- [ ] Add multiplayer co-op mode
- [ ] Implement save/load system
- [ ] Add achievements and progress tracking
- [ ] Create mobile-optimized UI
- [ ] Add text-to-speech (TTS) narration
- [ ] Implement spaced repetition flashcards
- [ ] Add pronunciation practice mode

---

## Contributing

Penko Adventure is a solo project, but contributions are welcome!

### How to Contribute

1. **Report Bugs**: Open an issue on GitHub
2. **Suggest Features**: Discuss ideas in GitHub Discussions
3. **Submit Pull Requests**: Follow the contribution guidelines
4. **Create Content Packs**: Design narrative templates for Community Mode
5. **Translate**: Help add more languages
6. **Test**: Test on different devices and browsers

### Contribution Guidelines

- Follow existing code style (TypeScript + React)
- Write clear commit messages
- Test your changes on Firefox Linux (primary target)
- Update documentation for new features
- Respect GPL v3 license terms

### Development Setup

```bash
# Clone and install
git clone https://github.com/NA-Ag/penko-adventure.git
cd penko-adventure
npm install

# Run development server
npm run dev  # Starts at http://localhost:3002

# Run tests
npm run test

# Build for production
npm run build
```

---

## Architecture

**Tech Stack:**
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS
- **AI Integration**:
  - Transformers.js (@huggingface/transformers)
  - ONNX Runtime Web
  - Google Generative AI SDK
  - Custom multi-provider abstraction
- **State Management**: React hooks + localStorage
- **PWA**: Service Worker + Web App Manifest

**Directory Structure:**
```
penko(2)/
├── components/          # React components
│   ├── setup/          # Setup screen, mode selection
│   └── GameInterface/  # Main game UI
├── services/           # Game engines
│   ├── browser/        # Browser AI optimizations
│   ├── CartridgeService.ts
│   ├── GroqService.ts
│   ├── GeminiService.ts
│   └── CommunityEngineV3.ts
├── types/              # TypeScript definitions
├── hooks/              # Custom React hooks
├── config.ts           # Global configuration
└── public/             # Static assets
```

**Design Principles:**
- **Offline-first**: Core functionality without internet
- **Privacy-first**: No telemetry, no tracking
- **Performance**: Optimized for low-end devices
- **Accessibility**: Keyboard navigation, screen reader support
- **Modularity**: Independent game modes, swappable AI providers

---

## FAQ

**Q: Is this really free?**
A: Yes. GPL v3 licensed, free forever. No ads, no subscriptions, no paywalls.

**Q: How does it work offline?**
A: Community Mode uses pre-written templates (no AI). Browser AI Mode downloads AI models once, then runs them locally in your browser using WebAssembly.

**Q: Do I need a powerful computer?**
A: No. Community Mode runs on any device. Browser AI Mode needs 2GB+ RAM. Cloud AI Mode needs only internet.

**Q: Is my data private?**
A: Yes. Community Mode and Browser AI Mode keep everything local. Cloud AI Mode sends text to AI providers (but you control which provider).

**Q: Can I use this on mobile?**
A: Yes. Install as a PWA on iOS/Android. Community Mode and Cloud AI Mode work great on mobile. Browser AI Mode is better on desktop (larger models).

**Q: Which mode should I use?**
A: Beginners → Community Mode. Intermediate → Cloud AI Mode (Groq). Privacy-focused → Browser AI Mode.

**Q: How do I get an API key for Cloud Mode?**
A: Sign up at [groq.com](https://groq.com), [deepseek.com](https://deepseek.com), or [openrouter.ai](https://openrouter.ai). Most have generous free tiers.

**Q: Why is Browser AI Mode slower than Cloud Mode?**
A: Small models (0.5B-1.5B parameters) on CPU vs large models (70B parameters) on GPU. Browser AI includes 5 optimizations to close this gap (<2s with cache hits).

**Q: Can I contribute to the project?**
A: Yes! Report bugs, suggest features, submit PRs, create content packs. See [Contributing](#contributing).

---

## License

**GNU General Public License v3.0**

Copyright (C) 2026 Penko Software

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

See [LICENSE.md](LICENSE.md) for full license text.

---

## Acknowledgments

**Inspired By:**
- **Duolingo**: For popularizing language learning apps (and showing us what not to do)
- **Facade**: Interactive drama system (Mateas & Stern, 2003)
- **Choice of Games**: Text-based interactive fiction engine
- **Anki**: Spaced repetition system
- **HuggingFace**: For open-source AI models and tools

**Built With:**
- [Qwen 2.5](https://github.com/QwenLM/Qwen2.5) (Alibaba) - Browser AI models
- [IBM Granite 4.0](https://github.com/ibm-granite/granite-code-models) - Tiny tier model
- [DeepSeek R1](https://github.com/deepseek-ai/DeepSeek-R1) - Reasoning tier model
- [Transformers.js](https://github.com/xenova/transformers.js) - Browser AI runtime
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev) - Build tool
- [TailwindCSS](https://tailwindcss.com) - Styling

**Special Thanks:**
- The Free Software Foundation for GPL v3
- The open-source AI community for truly free models
- Early testers and contributors

---

## About

**Penko Adventure** is part of the **Penko Hub** software project ecosystem, focused on building free, open-source educational tools.

**Developer**: Solo project by [@Penko-Software](https://github.com/Penko-Software)

**Philosophy**: Free open-source education for everyone. Language learning should be accessible, unlimited, and private.

**Status**: Active development (v1.8.0-beta.1)

**Contact**:
- GitHub: [github.com/Penko-Software/penko-adventure](https://github.com/Penko-Software/penko-adventure)
- Issues: [github.com/Penko-Software/penko-adventure/issues](https://github.com/Penko-Software/penko-adventure/issues)

---

**Study as much as you want, whenever you want. Free forever.**

