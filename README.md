# Penko Adventure: Public Beta

**Free, open-source language learning through interactive storytelling**

Penko Adventure is a text-based RPG designed for natural language acquisition. Learn languages by writing your thoughts, actions, and opinions in a controlled narrative environment where you drive the story through your choices.

![Penko Logo](./public/icon-512.png)

---

## 🌟 The Public Beta is Live!

Welcome to the initial Public Beta of the Penko Engine! Our primary objective with this release is to test the core mechanics of our WebAssembly (WASM) AI engine and gather community feedback on our structured language learning pathways. 

### Choose Your Path
*   **Adventure Path:** Learn through play in an open world. Form sentences to interact with your environment, talk to NPCs, and progress the procedural story.
*   **Educational Path:** Follow highly-structured scenarios designed specifically for **CEFR (A1-C2)**, **JLPT (N5-N1)**, and **HSK (1-6)** exam tracks. Practice specific, real-world goals (like ordering at a cafe, asking for directions, or arguing with a difficult landlord).

### Two Ways to Play
*   **🧠 Browser AI Mode (Default):** Runs 100% locally and privately directly inside your web browser using a highly optimized **Qwen 3.5 0.8B** model via WebAssembly. Completely free, no installation required, and playable completely offline once the initial 850MB cache is downloaded!
*   **☁️ Cloud Mode:** Connects to advanced frontier models (like Gemini) via your own API key for an infinite, highly-intelligent story with massive context windows.

### Multilingual Support
The UI interface is fully localized into **12 languages** (English, Spanish, French, German, Italian, Japanese, Mandarin, Russian, Portuguese, Ukrainian, Polish, Czech), allowing you to learn your target language natively! Non-Latin languages (like Japanese, Chinese, Russian, etc.) feature an on-demand **Romanization Button** to help you instantly read phonetic scripts (Romaji, Pinyin, Cyrillic, etc.) without relying on heavy dictionaries.

---

## 🚀 Roadmap: What's Next?

We are actively expanding the Penko ecosystem! Here are the next major milestones we are currently building:

### 1. Native PC Desktop App (Electron)
While our Browser AI is a phenomenal technical achievement for accessibility, web browsers place strict limits on RAM and GPU access. 
Our next major update will introduce a standalone **Native Desktop App (Windows/Mac/Linux)**. This native client will bypass the browser entirely and bundle a much larger, more intelligent model (such as **Gemma 4 E4B**) that runs directly on your computer's GPU via `llama.cpp`. This will provide blazing-fast, hyper-intelligent 1st-person roleplay while remaining 100% offline and private.

### 2. Local Voice Support
Language learning isn't just about typing! We are building full conversational voice support.
*   **Text-to-Speech (TTS):** High-quality, offline AI voices (like Kokoro) to read the NPC dialogue naturally.
*   **Speech-to-Text (STT):** Local microphone transcription (like Whisper WASM) tuned to understand language learners so you can speak directly to the characters instead of typing!

---

## 🛠️ Development & Tech Stack

Penko is built with a focus on edge-compute efficiency and retro aesthetics:
*   **Frontend:** React, TypeScript, TailwindCSS, Vite
*   **Visualizer:** A custom `<canvas>` based 2D tilemap generator that proceduraly renders environments and pixel-art sprites (0 image dependencies!).
*   **Local AI Engine:** `onnxruntime-web` running Qwen 3.5 0.8B entirely client-side.

### Getting Started (Development)
To run the Web App locally for development:
```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## 🤝 Contributing
Penko is a 100% free, open-source project. If you want to help us write new educational scenarios, translate UI components, or optimize our WebAssembly inference, feel free to open a Pull Request!

Stay tuned for updates at [penkosoftware.org](https://penkosoftware.org).