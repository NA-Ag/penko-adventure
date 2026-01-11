# i18next Migration Plan

**Date:** December 9, 2025
**Status:** Planning
**Impact:** UI translations only (no game logic affected)

---

## 🎯 Why i18next?

### Current System (`translations.ts`)
```typescript
const TRANSLATIONS = {
  [Language.ENGLISH]: { title: "PENKO", start_adventure: "START_ADVENTURE", ... },
  [Language.SPANISH]: { title: "PENKO", start_adventure: "INICIAR_AVENTURA", ... },
  // ... 12 languages
};

// Usage
const T = TRANSLATIONS[profile.nativeLanguage];
<h1>{T.title}</h1>
```

**Problems:**
- Manual language switching (must pass `nativeLanguage` everywhere)
- No namespace organization (all strings in one massive object)
- Hard to add new languages
- No pluralization support
- No variable interpolation
- No lazy loading (all translations loaded upfront)

### With i18next
```typescript
const { t, i18n } = useTranslation();
<h1>{t('title')}</h1>

// Change language anywhere in app
i18n.changeLanguage('es');
```

**Benefits:**
- ✅ Automatic language detection from browser
- ✅ Dynamic language switching without re-rendering entire app
- ✅ Namespace organization (`common`, `game`, `setup`, etc.)
- ✅ Pluralization & interpolation built-in
- ✅ TypeScript support for translation keys
- ✅ Lazy loading of language files
- ✅ Industry standard (used by millions)

---

## 🔍 Impact Analysis

### What IS Affected:
- **UI Layer** - All user-facing text in components
- **ContentPackBrowser** - Tab names, button labels, messages
- **SetupScreen** - Mode descriptions, labels
- **GameInterface** - Toolbar, settings, messages
- **Header** - Menu items, buttons

### What is NOT Affected:
- ✅ **Cloud Mode AI** - Uses API for generation, unaffected by UI translations
- ✅ **Game Logic** - CommunityEngineV2, parser, event system
- ✅ **Content Packs** - Pack metadata already supports multi-language
- ✅ **Save System** - saveSystem.ts uses profile data, not translations
- ✅ **Workshop** - Creation tools unaffected

### Migration Strategy:
**Gradual parallel approach** - Run both systems simultaneously:

1. Install i18next (no breaking changes)
2. Create translation files in parallel to `translations.ts`
3. Migrate components one-by-one
4. Keep `translations.ts` as fallback until migration complete
5. Remove old system once all components migrated

---

## 📦 Installation

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

**Package sizes:**
- `i18next`: ~30KB (core)
- `react-i18next`: ~15KB (React bindings)
- `i18next-browser-languagedetector`: ~5KB (auto language detection)
- **Total:** ~50KB minified + gzipped ~15KB

---

## 🏗️ Proposed Architecture

### Directory Structure

```
/src
  /locales
    /en
      common.json      # Header, footer, shared UI
      setup.json       # SetupScreen strings
      game.json        # GameInterface strings
      workshop.json    # Workshop strings
      packs.json       # ContentPackBrowser strings
    /es
      common.json
      setup.json
      game.json
      workshop.json
      packs.json
    /fr
      ...
    /de
      ...
  /i18n
    config.ts          # i18next configuration
```

### Configuration (`i18n/config.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en_common from '../locales/en/common.json';
import en_setup from '../locales/en/setup.json';
import en_game from '../locales/en/game.json';
import es_common from '../locales/es/common.json';
import es_setup from '../locales/es/setup.json';
import es_game from '../locales/es/game.json';

i18n
  .use(LanguageDetector) // Detect language from browser/localStorage
  .use(initReactI18next) // Pass i18n to React
  .init({
    resources: {
      en: {
        common: en_common,
        setup: en_setup,
        game: en_game,
      },
      es: {
        common: es_common,
        setup: es_setup,
        game: es_game,
      },
    },
    fallbackLng: 'en', // Fallback if translation missing
    defaultNS: 'common', // Default namespace
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      // Detection order
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'penko_language',
    },
  });

export default i18n;
```

### Translation File Example (`locales/en/common.json`)

```json
{
  "title": "PENKO",
  "support": "SUPPORT PROJECT",
  "exit": "EXIT SESSION",
  "inventory": "INVENTORY",
  "health": "HEALTH",
  "mode": "MODE",
  "language": "LANGUAGE"
}
```

### Translation File with Namespaces (`locales/en/setup.json`)

```json
{
  "start_adventure": "START ADVENTURE",
  "modes": {
    "offline": {
      "title": "STANDARD MODE",
      "description": "Free, Private, Procedural. No AI Key needed."
    },
    "cloud": {
      "title": "CLOUD MODE",
      "description": "Advanced AI, Infinite Story. Requires Key."
    },
    "local": {
      "title": "BROWSER AI",
      "description": "Runs in Browser (CPU). Universal compatibility."
    }
  },
  "target_language": "TARGET LANGUAGE",
  "native_language": "INTERFACE LANGUAGE",
  "genre": "NARRATIVE GENRE"
}
```

### Usage in Components

**Before (current system):**
```typescript
const T = TRANSLATIONS[userProfile.nativeLanguage];
<h1>{T.title}</h1>
<p>{T.start_adventure}</p>
```

**After (i18next):**
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('setup'); // Namespace

  return (
    <>
      <h1>{t('start_adventure')}</h1>
      <p>{t('modes.offline.title')}</p>
      <p>{t('modes.offline.description')}</p>
    </>
  );
}
```

**Language Switching:**
```typescript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
}
```

---

## 🔄 Migration Steps

### Phase 1: Setup (30 min)
1. Install packages
2. Create `/locales` directory structure
3. Create `i18n/config.ts`
4. Import config in `main.tsx`
5. Test with simple component

### Phase 2: Extract Translations (1 hour)
1. Convert `translations.ts` → JSON files
2. Organize into namespaces (common, setup, game, workshop, packs)
3. Create for all 12 languages

### Phase 3: Migrate Components (3-4 hours)
**Priority order:**
1. `ContentPackBrowser` (newest, good test case)
2. `SetupScreen` (moderate complexity)
3. `GameInterface` (complex, many translations)
4. `WorkshopContainer` (moderate)
5. `App.tsx` (header/footer)
6. Smaller components (StatusPanel, SettingsPanel, etc.)

### Phase 4: Testing (1 hour)
1. Test language switching in browser
2. Verify all 12 languages work
3. Check localStorage persistence
4. Test fallback behavior
5. Verify no Cloud Mode impact

### Phase 5: Cleanup (30 min)
1. Remove `translations.ts`
2. Remove old `TRANSLATIONS` imports
3. Update documentation
4. Git commit

---

## 🎯 Parallel Development Strategy

To avoid breaking existing functionality:

**Step 1:** Install i18next alongside current system
**Step 2:** Create wrapper component to test both:

```typescript
// TranslationTest.tsx
import { useTranslation } from 'react-i18next';
import { TRANSLATIONS } from '../translations';

export const TranslationTest = ({ langCode }) => {
  const { t } = useTranslation();
  const T = TRANSLATIONS[langCode];

  return (
    <div>
      <h2>Old System: {T.title}</h2>
      <h2>New System: {t('title')}</h2>
    </div>
  );
};
```

**Step 3:** Migrate one component at a time
**Step 4:** Once all migrated, remove old system

---

## 📊 ContentPackBrowser Migration Example

**Before:**
```typescript
export const ContentPackBrowser: React.FC<Props> = ({
  nativeLanguage = 'en'
}) => {
  return (
    <div>
      <h1>Choose Your Adventure</h1>
      <button>Official Packs</button>
      <button>My Creations</button>
      <p>Select a content pack to start your language learning journey</p>
    </div>
  );
};
```

**After:**
```typescript
import { useTranslation } from 'react-i18next';

export const ContentPackBrowser: React.FC<Props> = () => {
  const { t } = useTranslation('packs');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('tabs.official')}</button>
      <button>{t('tabs.my_creations')}</button>
      <p>{t('description')}</p>
    </div>
  );
};
```

**Translation file (`locales/en/packs.json`):**
```json
{
  "title": "Choose Your Adventure",
  "description": "Select a content pack to start your language learning journey",
  "tabs": {
    "official": "Official Packs",
    "my_creations": "My Creations",
    "custom": "Custom"
  },
  "empty_states": {
    "no_packs": "No Packs Found",
    "workshop_empty": "Create your first pack in the Workshop!",
    "custom_empty": "Upload a custom pack to get started"
  },
  "buttons": {
    "play_now": "Play Now",
    "back": "Back",
    "change": "Change",
    "delete": "Delete"
  },
  "stats": {
    "locations": "{{count}} locations",
    "quests": "{{count}} quests",
    "words": "{{count}} words"
  }
}
```

---

## ⚠️ Important Considerations

### 1. Profile Language vs UI Language
Currently, `profile.nativeLanguage` is used for both:
- UI language (buttons, labels)
- Grammar checking language
- TTS language

With i18next, we separate:
- **UI Language:** `i18n.language` (can be different from learning language)
- **Learning Language:** `profile.targetLanguage`
- **Native Language:** `profile.nativeLanguage` (for translations in-game)

**Example:** Spanish speaker learning French with English UI
- `i18n.language = 'en'` (UI in English)
- `profile.targetLanguage = 'fr'` (learning French)
- `profile.nativeLanguage = 'es'` (in-game translations to Spanish)

### 2. Syncing with UserProfile
Update profile when UI language changes:

```typescript
const { i18n } = useTranslation();

useEffect(() => {
  // Sync i18next with profile
  if (profile.nativeLanguage !== i18n.language) {
    i18n.changeLanguage(profile.nativeLanguage);
  }
}, [profile.nativeLanguage]);

// When user changes language in SetupScreen
const handleLanguageChange = (newLang: Language) => {
  setProfile({ ...profile, nativeLanguage: newLang });
  i18n.changeLanguage(newLang); // Sync i18next
};
```

### 3. TypeScript Support
Enable type-safe translations:

```typescript
// i18next.d.ts
import 'i18next';
import common from './locales/en/common.json';
import setup from './locales/en/setup.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      setup: typeof setup;
    };
  }
}
```

Now get autocomplete for translation keys:
```typescript
t('setup:modes.offline.title') // ✅ TypeScript knows this exists
t('setup:modes.foo.bar')       // ❌ TypeScript error
```

---

## 🚀 Next Steps

**Recommended Approach:**
1. **Install i18next packages** (5 min)
2. **Create minimal config** (15 min) - Just English + Spanish to start
3. **Migrate ContentPackBrowser** (30 min) - Test case for pattern
4. **Evaluate results** - If successful, proceed with full migration

**Questions to Answer:**
1. Do we want UI language separate from learning language?
2. Keep all 12 languages in migration or start with subset?
3. Gradual migration or all-at-once?
4. TypeScript strict mode for translations?

---

## 📈 Benefits Summary

### Developer Experience:
- **Easier to add new languages** - Just add JSON file
- **Better organization** - Namespaces group related strings
- **Type safety** - Catch missing translations at compile time
- **Less boilerplate** - No manual language prop passing

### User Experience:
- **Faster language switching** - No full re-render
- **Auto-detection** - Uses browser language automatically
- **Consistent** - Industry-standard behavior
- **Persistent** - Language preference saved

### Performance:
- **Lazy loading** - Only load needed languages
- **Tree shaking** - Unused translations excluded from bundle
- **Minimal overhead** - ~15KB gzipped total

---

**Recommendation:** ✅ Proceed with i18next migration

The benefits far outweigh the migration effort (~6-8 hours), and the gradual approach minimizes risk.
