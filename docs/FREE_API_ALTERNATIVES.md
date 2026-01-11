# Free API Alternatives to Gemini

## Current Problem
- **Gemini Free Tier**: 20 requests/day (RPD) - You've hit the limit!
- Need alternatives with generous free tiers

## Top Free API Providers

### 1. **Groq** (BEST FOR GAMING - Ultra Fast!)
- **Model**: Llama 3.1, Mixtral, Gemma
- **Free Tier**: 14,400 requests/day, 30 requests/minute
- **Speed**: 500+ tokens/second (FASTEST!)
- **JSON Mode**: ✅ Yes (structured output)
- **Cost**: $0 forever (free tier)
- **Website**: https://console.groq.com
- **Why Perfect**: Instant responses, huge free quota, perfect for real-time gaming

### 2. **OpenRouter** (Aggregator with Free Models)
- **Models**: Multiple free models (Google Gemini Flash, Meta Llama, etc.)
- **Free Tier**: Various free models available
- **JSON Mode**: ✅ Yes
- **Cost**: Some models are completely free
- **Website**: https://openrouter.ai
- **Why Good**: Access to multiple providers through one API

### 3. **HuggingFace Inference API** (Open Source Models)
- **Models**: Qwen 2.5, Mistral, Llama, etc.
- **Free Tier**: Generous (community tier)
- **JSON Mode**: ⚠️ Depends on model
- **Cost**: Free for most models
- **Website**: https://huggingface.co/inference-api
- **Why Good**: Fully open source, no vendor lock-in

### 4. **Together AI**
- **Models**: Llama 3.1, Qwen, Mixtral
- **Free Tier**: $25 free credits
- **JSON Mode**: ✅ Yes
- **Speed**: Very fast
- **Website**: https://together.ai
- **Why Good**: High performance, multiple models

### 5. **DeepInfra**
- **Models**: Llama, Qwen, Mistral
- **Free Tier**: Generous free tier
- **JSON Mode**: ✅ Yes
- **Website**: https://deepinfra.com
- **Why Good**: Good speed, reliable

## Recommended Setup (Multi-Provider)

### Priority Order:
1. **Groq** (Primary) - Fastest, biggest quota
2. **OpenRouter** (Fallback 1) - Free Gemini Flash access
3. **Gemini** (Fallback 2) - Your existing key
4. **Local Cartridge** (Offline) - No internet needed

### Implementation Plan:

```typescript
interface CloudProvider {
  id: 'groq' | 'openrouter' | 'gemini' | 'huggingface';
  name: string;
  requiresApiKey: boolean;
  freeQuota: string;
  speed: 'ultra-fast' | 'fast' | 'medium';
  jsonMode: boolean;
}

const PROVIDERS: CloudProvider[] = [
  {
    id: 'groq',
    name: 'Groq (Llama 3.1)',
    requiresApiKey: true,
    freeQuota: '14,400 requests/day',
    speed: 'ultra-fast',
    jsonMode: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Multi-Model)',
    requiresApiKey: true,
    freeQuota: 'Varies by model',
    speed: 'fast',
    jsonMode: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini 2.5 Flash',
    requiresApiKey: true,
    freeQuota: '20 requests/day',
    speed: 'fast',
    jsonMode: true,
  },
];
```

## API Implementation

### Groq Example:
```typescript
// groqService.ts
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: API_KEY });

const response = await groq.chat.completions.create({
  model: 'llama-3.1-70b-versatile',
  messages: [{ role: 'user', content: 'Hello!' }],
  response_format: { type: 'json_object' }, // JSON mode!
  temperature: 0.7,
});
```

### OpenRouter Example:
```typescript
// openrouterService.ts
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-flash-1.5', // Free Gemini!
    messages: [{ role: 'user', content: 'Hello!' }],
    response_format: { type: 'json_object' },
  }),
});
```

## Setup Screen Changes

```
┌─────────────────────────────────────┐
│ Cloud Provider:                     │
│ ○ Groq (Llama 3.1) - FREE          │
│ ○ OpenRouter - FREE                │
│ ○ Google Gemini                    │
│ ● Local AI (Offline)               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ API Key:                            │
│ [_____________________________]     │
│                                     │
│ Get free key:                      │
│ • Groq: console.groq.com           │
│ • OpenRouter: openrouter.ai        │
└─────────────────────────────────────┘
```

## Benefits of Multi-Provider:

1. **Never hit quota** - Rotate between providers
2. **No vendor lock-in** - Not dependent on one company
3. **Better uptime** - If one is down, use another
4. **Speed options** - Choose ultra-fast (Groq) or slow but free
5. **Cost savings** - Always use free tiers

## Next Steps:

1. Create `services/groqService.ts` (same structure as geminiService)
2. Create `services/openrouterService.ts`
3. Update `EngineFactory.ts` to support providers
4. Add provider selection in SetupScreen
5. Store provider preference in localStorage

This will make Penko sustainable as a free game!
