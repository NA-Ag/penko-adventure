# Language Support Registry

This document outlines the current support status for the 103 languages in Penko Adventure. Support is tiered based on the capabilities of the **0.8B Browser AI (Qwen)** model to ensure zero English leakage and high precision in localized prompts.

## 🟢 Stable Tier (70 Languages - Available Now)
These languages are fully localized and tested for high-precision Browser AI performance.

### **Europe**
- **Romance:** Spanish, French, Italian, Portuguese, Romanian, Catalan, Galician, Haitian Creole, Latin.
- **Germanic:** English, German, Dutch, Swedish, Norwegian, Danish, Afrikaans, Icelandic, Luxembourgish, Yiddish.
- **Slavic:** Russian, Ukrainian, Polish, Czech, Slovak, Bulgarian, Croatian, Serbian, Macedonian, Slovenian.
- **Other:** Greek, Finnish, Estonian, Latvian, Lithuanian, Hungarian, Albanian, Basque, Welsh, Irish, Scottish Gaelic.

### **Middle East & Turkic**
- Turkish, Azerbaijani, Arabic, Hebrew, Persian.

### **Asia & Pacific**
- **High Resource:** Mandarin (Simplified), Cantonese, Japanese, Korean, Vietnamese, Thai, Indonesian, Malay, Tagalog.
- **Indigenous/Polynesian:** Hawaiian, Maori.

### **Africa & Americas**
- **Latin Script African:** Swahili, Zulu, Yoruba, Hausa, Somali, Oromo, Chichewa, Kinyarwanda, Shona, Sotho, Ganda, Fula, Igbo.
- **Andean:** Quechua.

---

## 🟡 Beta Tier (33 Languages - Coming Soon)
These languages are currently visible but disabled in the UI. They are undergoing optimization for low-resource scripts and will be enabled as "Stable" once prompt-tuning for the 0.8B model is perfected.

### **Indian Subcontinent (Indic)**
- Hindi, Bengali, Punjabi, Urdu, Marathi, Gujarati, Sindhi, Sinhala, Oriya, Nepali.
- Telugu, Tamil, Kannada, Malayalam.

### **Low-Resource Asian**
- Burmese, Khmer, Lao, Tibetan, Wu Chinese.

### **Central Asian & Other**
- Uzbek, Kazakh, Kyrgyz, Tajik, Pashto, Kurdish.
- Amharic (Ethiopic Script).
- Armenian, Georgian, Mongolian.
- Navajo.

---

## 📂 Prompt Architecture & File Locations

The prompt system is split into distinct modes and difficulty tiers to optimize for Browser AI performance.

### **1. Educational Mode**
Used for structured learning scenarios (e.g., "At the Doctor", "Job Interview").
- **Directory:** `data/educational/prompts/`
- **Structure:** `[lang_code]/index.ts`
- **Key Feature:** Contains `LOCALIZED_SCENARIOS` with translated titles, roles, and objectives to prevent English leakage.

### **2. Adventure Mode (Tiered)**
Used for the open-ended RPG narrative. It is split into two tiers:

#### **A. Beginner Tier**
- **Directory:** `data/adventure/beginner/prompts/`
- **Usage:** Routed for `A1`, `N5`, and `HSK 1` levels.
- **Constraint:** Strict 1-sentence response limit and mandatory `[ROMANIZATION: ...]` tags.

#### **B. Advanced Tier**
- **Directory:** `data/adventure/advanced/prompts/`
- **Usage:** Routed for all other proficiency levels (`A2` through `C2`).
- **Feature:** Allows for deeper narrative flow and multi-sentence responses.

---

## 🛤️ Routing Logic

### **Engine Selection (`services/EngineFactory.ts`)**
The system automatically selects the correct prompt tier based on the user's CEFR/HSK level:
- **Beginner Engine:** `cefrLevel === 'A1' || 'N5' || 'HSK 1'`
- **Advanced Engine:** Everything else.

### **Local Model Services**
Both `OptimizedBrowserService.ts` files (in `beginner` and `advanced` folders) dynamically import the localized prompt set based on the `UserProfile.targetLanguage`.

---

## 🛠️ Implementation Note
Language availability is controlled via `data/languageStatus.ts`. Beta languages are rendered with `opacity-50` and `cursor-not-allowed` in the Setup screens to prevent a degraded user experience while the underlying localized logic remains in the codebase for Native PC / Cloud mode testing.
