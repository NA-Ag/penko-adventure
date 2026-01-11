# Browser AI Mode - Technical Review & Issues

**Date:** December 11, 2025
**Status:** Implementation In Progress
**Focus:** Identifying blockers and hardcoded values preventing proper functionality

---

## 📋 Executive Summary

Browser AI Mode uses the Cartridge System to deliver offline language learning via ONNX models (Qwen, Granite, DeepSeek). The UI and architecture are solid, but the implementation layer has critical gaps preventing users from selecting and loading arbitrary models.

---

## 🔴 Critical Issues

### 1. **Incomplete Model Generation Pipeline**

**File:** `/services/CartridgeService.ts` (lines 43-85+)
**Issue:** `loadModel()` initializes the cartridge but the actual generation logic is incomplete

```typescript
// Current state: Loads model, but generate() method likely returns placeholder
// Missing: Actual Transformers.js integration for inference
```

**Impact:** Users can download cartridges but cannot actually play (model won't generate responses)

**Solution Required:**
- Complete the worker communication protocol
- Implement proper `text-generation` pipeline in cartridge worker
- Add streaming support for real-time response generation
- Error handling for OOM, model crashes, timeout

---

### 2. **Hardcoded Model References in CartridgeManager**

**File:** `/components/setup/CartridgeManager.tsx` (lines 44-68)
**Issue:** MODEL_TIERS dictionary hardcodes tier names and descriptions

```typescript
const MODEL_TIERS = {
  tiny: { modelId: 'onnx-community/granite-4.0-350m-ONNX-web', ... },
  small: { modelId: 'onnx-community/Qwen2.5-0.5B-Instruct', ... },
  medium: { modelId: 'onnx-community/Qwen2.5-1.5B', ... },
  reasoning: { modelId: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX', ... }
};
```

**Impact:**
- Adding new models requires code changes (not user-configurable)
- Tier naming is inflexible (tiny/small/medium don't match user expectations)
- Model manifest system exists but isn't used here

**Solution Required:**
- Pull MODEL_TIERS from `modelManifests.ts` dynamically
- Allow users to select models from a registry (HuggingFace model list, custom URLs)
- Decouple tier naming from infrastructure

---

### 3. **Translation Pipeline Dependency (v1.x Limitation)**

**Issue:** Browser AI still uses CustomTranslationEngine for non-Gemini modes

**Context:**
```
User Spanish → Model English → Translate back to Spanish
```

This defeats the purpose of multilingual models like Qwen (supports 29 languages natively).

**Solution Required:**
- Remove translation layer for Qwen/Granite models
- Add language-aware system prompts (29 different variants)
- Test native generation quality in each language

---

### 4. **Missing Storage Quota Management**

**File:** `/services/CartridgeService.ts` (line 55)
**Issue:** Checks storage but doesn't handle quota gracefully

```typescript
if (!isCached && details.free < this.cartridge.estimatedSize && details.quota > 0) {
    throw new Error(`Insufficient storage...`); // Abrupt error
}
```

**Impact:**
- iOS Safari: 1GB limit (can't install Medium tier)
- Chrome: 50GB limit (fine)
- Firefox: No persistent storage (ephemeral download)
- User gets hard error instead of guidance

**Solution Required:**
- Warn before download: "Your browser has only 2GB free, Medium tier needs 1.8GB"
- Suggest tier downgrade automatically
- Implement Download Manager pattern (resume, pause, cancel)
- Show storage usage dashboard

---

### 5. **No Voice Integration in CartridgeService**

**Mentioned in README:** Whisper (STT) + SpeechT5 (TTS)
**Reality:** Not wired into CartridgeService

**Files Missing Integration:**
- `services/voice/*.ts` (if it exists)
- TTS model loading (separate ONNX model)
- Audio processing pipeline

**Solution Required:**
- Add voice as optional cartridge feature (language + TTS model)
- Integrate `useAudio.ts`, `useSpeechRecognition.ts`, `useTTS.ts` hooks
- Test Whisper tiny for speech input

---

### 6. **System Prompts Hardcoded for English**

**Files Affected:**
- `services/CartridgeService.ts` - System prompt generation
- `data/systemPrompts.ts` - Likely English-only

**Issue:** Qwen needs language-specific prompts to generate quality output in target language

**Example Problem:**
```
User wants to learn Spanish
System Prompt: "You are a language teacher..." (in English)
Qwen: Responds in English instead of Spanish
```

**Solution Required:**
- Create 29 language variants of system prompts
- Selection logic: `getSystemPrompt(interfaceLanguage, targetLanguage)`
- Include CEFR level guidance in prompts
- Test with native speakers

---

### 7. **ONNX Worker Implementation Gaps**

**File:** `/services/cartridge/worker?worker&url` (or `/services/cartridge/worker.ts`)
**Issue:** Worker exists but likely incomplete

**Missing Pieces:**
- Message protocol definition (init_model, generate, cleanup)
- Memory management (models are 1-4GB, browser limits)
- Timeout handling (long generation should show progress)
- Graceful shutdown on tab close

**Solution Required:**
- Document worker message protocol
- Implement proper lifecycle (init → ready → generate → dispose)
- Add memory pressure detection (stop generation if RAM critical)
- Test worker reuse (multiple games shouldn't reload model)

---

### 8. **No Model Preloading Strategy**

**Issue:** Every game starts with 10-15s model initialization

**Current:** User clicks "Play" → waits 10-15s → game starts

**Solution Required:**
- Lazy-load model on cartridge install (background, optional)
- Pre-warm model on game setup screen (show progress)
- Cache compiled ONNX graph after first initialization
- Show "Model ready!" indicator in UI

---

## 🟡 Medium Priority Issues

### 9. **Download Resume/Retry Missing**
- Large downloads (1-4GB) can fail mid-download
- Currently: No retry or resume capability
- Solution: Implement chunked download with checksums

### 10. **No Offline Verification**
- User can launch game while offline without knowing model is missing
- Solution: Add pre-game cache verification check

### 11. **DeviceCapabilityDetector Assumptions**
- Hardware detection might be too optimistic (WebGPU availability, RAM estimation)
- Solution: Test on real mobile devices, add fallback detection

### 12. **No A/B Testing Infrastructure**
- Can't compare model quality across tiers without manual testing
- Solution: Add optional telemetry (privacy-preserving, on-device scoring)

---

## ✅ What's Working Well

- ✅ CartridgeManager UI is polished and user-friendly
- ✅ Tier recommendation logic is sound
- ✅ Storage detection and persistence API integration
- ✅ Multiple cloud provider fallback system (EngineFactory)
- ✅ CEFR level system exists in types

---

## 🎯 Recommended Implementation Order

1. **Week 1:** Complete ONNX worker + test on 2-3 devices
2. **Week 2:** Add language-specific system prompts + remove translation layer
3. **Week 3:** Integrate voice (Whisper + TTS) as optional feature
4. **Week 4:** Download management (resume, quota warnings, preloading)

---

## 📝 Testing Checklist

- [ ] Download 270M model on 4GB RAM phone (Android Chrome)
- [ ] Download 1.5B model on 8GB laptop (Firefox)
- [ ] Play game completely offline after download
- [ ] Generate responses in 10+ languages natively
- [ ] Voice input and output work in target language
- [ ] Resume download after network interruption
- [ ] Storage quota warning before install
- [ ] Model pre-warming on setup screen

---

**Next Review:** After CartridgeService.generate() is functional
