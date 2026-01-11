# BERLITZ IMPLEMENTATION - QUICK REFERENCE GUIDE

**Use this checklist during development for 48-hour sprint**

---

## ⚡ Quick Facts

| Item | Details |
|------|---------|
| **Method** | Berlitz - Recast errors naturally without saying "wrong" |
| **Status** | All infrastructure ready, assembly phase |
| **Timeline** | 48 hours |
| **Risk** | Minimal |
| **Infrastructure** | InputChecker, MorphologyEngine, DictionaryManager, ResponseTemplates, CommunityEngineV3 |
| **Key Files** | InputChecker.ts, ResponseTemplates.ts, CommunityEngineV3.ts, types.ts |

---

## 🔧 Implementation Phases

### PHASE 1: InputChecker Integration (2 hours)
**Goal:** Wire error checking into game loop

**Checklist:**
- [ ] Open `/services/CommunityEngineV3.ts`
- [ ] Find `processTurn()` method (line ~100)
- [ ] Add at top: `const checked = await this.inputChecker.checkAndCorrect(playerInput, language)`
- [ ] Use `checked.corrected` instead of `playerInput` for parser
- [ ] Use `checked.corrected` instead of `playerInput` for validator
- [ ] Pass `checked.hadErrors` and `checked.feedback` to GameTurnData output

**Code Template:**
```typescript
async processTurn(playerInput: string): Promise<GameTurnData> {
  // STEP 1: Check & correct input
  const checked = await this.inputChecker.checkAndCorrect(
    playerInput,
    this.currentGame.language,
    this.profile.cefr
  );

  // STEP 2: Use CORRECTED input (not original)
  const inputToUse = checked.corrected;

  // STEP 3: Parse corrected input
  const parseResult = await this.parser.parseWithContentPack(inputToUse, ...);

  // STEP 4: Validate corrected input  
  const validation = await this.actionValidator.validateInput(inputToUse, ...);

  // ... rest of method ...

  // STEP 5: Return with feedback
  return {
    narrative: response,
    feedback: checked.feedback,  // ← NEW: Add feedback
    hadErrors: checked.hadErrors, // ← NEW: Add error flag
    // ... rest of data ...
  };
}
```

**Verification:** `processTurn()` now validates and corrects input before parsing

---

### PHASE 2: ResponseTemplates Update (2 hours)
**Goal:** Support genre parameter and Berlitz display

**Checklist:**
- [ ] Open `/services/community/ResponseTemplates.ts`
- [ ] Find `ResponseTemplate` interface (line ~33)
- [ ] Add new field: `genre?: NarrativeGenre;`
- [ ] Find `selectTemplate()` method (line ~82)
- [ ] Add parameter: `genre?: NarrativeGenre`
- [ ] Update filtering logic to prefer genre-specific templates
- [ ] Find `TemplateContext` interface (line ~19)
- [ ] Add fields: `originalInput`, `correctedInput`, `hadErrors`, `nativeVerb`

**Code Template:**
```typescript
// In ResponseTemplate interface
export interface ResponseTemplate {
  id: string;
  intent: ObjectIntent | 'INVALID' | 'GENERIC';
  templates: { [lang in Language]?: string[]; };
  conditions?: { ... };
  priority?: number;
  genre?: NarrativeGenre;  // ← NEW
}

// In selectTemplate() signature
selectTemplate(
  intent: ObjectIntent | 'INVALID' | 'GENERIC',
  context: TemplateContext,
  language: Language,
  genre?: NarrativeGenre  // ← NEW
): string | null { ... }

// In TemplateContext interface
export interface TemplateContext {
  verb?: string;
  object?: string;
  objectState?: string;
  result?: string;
  adjective?: string;
  location?: string;
  originalInput?: string;      // ← NEW: What user typed
  correctedInput?: string;     // ← NEW: What was corrected to
  hadErrors?: boolean;         // ← NEW: Was there an error?
  nativeVerb?: string;         // ← NEW: Correct conjugation
  [key: string]: string | undefined;
}
```

**Verification:** ResponseTemplates now supports genre and Berlitz fields

---

### PHASE 3: Genre-Specific Templates (4 hours)
**Goal:** Create templates that showcase corrected forms by genre

**Checklist:**
- [ ] Open `/services/community/ResponseTemplates.ts`
- [ ] Find `registerDefaultTemplates()` method (line ~130)
- [ ] Keep existing generic templates (priority: 1)
- [ ] Add Fantasy variants for EXAMINE, TAKE, OPEN, USE, TALK
- [ ] Add SciFi variants for same 5 actions
- [ ] Add Horror variants for same 5 actions
- [ ] Add Western variants for same 5 actions
- [ ] Add Cyberpunk variants for same 5 actions
- [ ] Add Mystery variants for same 5 actions
- [ ] Ensure all 12 languages supported for each

**Template Creation Formula:**
```typescript
{
  id: 'take_success_fantasy',           // action_result_genre
  intent: 'TAKE',
  templates: {
    [Language.ENGLISH]: [
      'You seize the [object]. [GENRE_FLAVOR]',
      'You grab the [object]. [GENRE_FLAVOR]',
      // 3-5 variants total
    ],
    [Language.SPANISH]: [
      '**Tomas** [object]. [GENRE_FLAVOR_ES]',
      '**Agarras** [object]. [GENRE_FLAVOR_ES]',
      // 3-5 variants total
    ],
    // All 12 languages
    [Language.FRENCH]: [...],
    [Language.GERMAN]: [...],
    // etc
  },
  conditions: { success: true },
  genre: 'Fantasy',
  priority: 10  // Higher than generic (priority: 1)
}
```

**Genre Flavors:**
- **Fantasy:** magical, ancient, mystical, enchanted, glowing
- **SciFi:** technical, futuristic, sensors, electronic, digital
- **Horror:** dark, dread, fear, sinister, creeping
- **Western:** dusty, gritty, worn, weathered, rough
- **Cyberpunk:** neon, digital, tech, edgy, augmented
- **Mystery:** clue, suspect, investigate, uncover, discover

**Verification:** All 6 genres have templates for major actions

---

### PHASE 4: Update GameTurnData Interface (1 hour)
**Goal:** Allow feedback to flow through game data

**Checklist:**
- [ ] Open `/types.ts`
- [ ] Find `GameTurnData` interface
- [ ] Add field: `feedback?: string;`
- [ ] Add field: `hadErrors?: boolean;`
- [ ] Add field: `learnerMetrics?: {...}`

**Code Template:**
```typescript
export interface GameTurnData {
  narrative: string;
  
  // ← NEW: Berlitz feedback
  feedback?: string;
  hadErrors?: boolean;
  
  attemptedAction: string;
  success: boolean;
  nextObjective: string;
  
  // ← NEW: Progress tracking
  learnerMetrics?: {
    grammarAccuracy: number;
    vocabularyMastery: number;
    frustrationLevel: 'low' | 'medium' | 'high';
    cefr: string;
  };
}
```

**Verification:** GameTurnData interface updated

---

### PHASE 5: Wire CommunityEngineV3 to ResponseTemplates (2 hours)
**Goal:** Pass genre to template selection

**Checklist:**
- [ ] Open `/services/CommunityEngineV3.ts`
- [ ] Find where `selectTemplate()` is called
- [ ] Pass `this.currentGame.genre` as 4th parameter
- [ ] Build TemplateContext with Berlitz fields

**Code Template:**
```typescript
// In processTurn()
const templateContext: TemplateContext = {
  object: validation.target,
  objectState: validation.objectState,
  result: validation.isValid ? 'success' : 'failed',
  originalInput: playerInput,
  correctedInput: checked.corrected,
  hadErrors: checked.hadErrors,
  nativeVerb: this.getConjugatedVerb(validation.intent, language),
};

const response = this.responseTemplates.selectTemplate(
  validation.intent,
  templateContext,
  language,
  this.currentGame.genre  // ← PASS GENRE
);
```

**Verification:** Genre parameter flows through template selection

---

### PHASE 6: UI Display (2 hours)
**Goal:** Show narrative and feedback separately

**Checklist:**
- [ ] Open relevant React component (likely App.tsx or GameScreen)
- [ ] Find where GameTurnData is displayed
- [ ] Separate narrative from feedback in display
- [ ] Add styling for feedback box (yellow/blue background)
- [ ] Make feedback optional (only show if hadErrors)
- [ ] Format feedback with line breaks for readability

**Display Template:**
```tsx
// Example React component
<div className="game-response">
  {/* Narrative - main content */}
  <div className="narrative">
    {gameTurnData.narrative}
  </div>

  {/* Feedback - separate, optional */}
  {gameTurnData.hadErrors && (
    <div className="feedback-box">
      <strong>💡 Grammar Feedback:</strong>
      <p>{gameTurnData.feedback}</p>
    </div>
  )}

  {/* Metrics - optional */}
  {gameTurnData.learnerMetrics && (
    <div className="metrics">
      Grammar: {gameTurnData.learnerMetrics.grammarAccuracy}%
    </div>
  )}
</div>
```

**Verification:** UI displays feedback separately from narrative

---

## 📝 Quick Testing Checklist

After each phase, verify:

- [ ] **InputChecker:** Input corrected, feedback generated
- [ ] **ResponseTemplates:** Genre-specific template selected
- [ ] **Narrative:** Shows corrected form (in bold or highlight)
- [ ] **Feedback:** Appears in separate box, in native language
- [ ] **No errors:** Console shows no crashes
- [ ] **All languages:** Test with Spanish, French, German (at minimum)
- [ ] **All genres:** Test with Fantasy, SciFi, Horror (at minimum)
- [ ] **Fallback:** Generic template used if genre-specific missing

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Template not found | Check: intent, language, genre all match; use generic fallback |
| Feedback undefined | Check: `hadErrors` is boolean; `feedback` is populated |
| Genre-specific template not selected | Check: `genre` parameter passed to `selectTemplate()`; priority set high |
| Corrected form not showing | Check: `[nativeVerb]` in template; context has nativeVerb field |
| Feedback in wrong language | Check: CustomTranslationEngine called; native language in profile |
| UI error with feedback | Check: `hadErrors` is boolean before conditional render |

---

## 🎯 Minimal Working Example (MVP)

**Bare minimum to make Berlitz work:**

1. **InputChecker integration** (1 hour)
   - Check and correct input
   - Return corrected version + feedback

2. **Pass to parser** (30 min)
   - Use corrected input, not original
   - Extract intent

3. **One generic template** (30 min)
   - Register: "You [verb] the [object]."
   - Support 3 languages
   - Substitute variables

4. **Display feedback** (30 min)
   - Show narrative
   - Show feedback below
   - Optional feature

**Total MVP time:** ~3 hours

**Result:** Functional Berlitz with basic templates

---

## 📊 Template Priority Legend

```
Priority 10 = Genre-specific (preferred)
├─ take_success_fantasy
├─ take_success_scifi
├─ take_success_horror
├─ take_success_western
├─ take_success_cyberpunk
└─ take_success_mystery

Priority 1 = Generic (fallback)
└─ take_success_generic
```

**Selection:** First preference = genre-specific. If missing, use generic.

---

## 🔗 File Structure Reference

```
/services/
  ├─ CommunityEngineV3.ts ← Orchestration (processTurn integration)
  ├─ InputChecker.ts ← Error detection & correction (USE THIS)
  ├─ community/
  │  ├─ ResponseTemplates.ts ← Template selection (UPDATE THIS)
  │  ├─ ObjectSystem.ts ← Object properties
  │  ├─ ActionValidator.ts ← Action validation
  │  ├─ Oracle.ts ← Learning tracking
  │  └─ Director.ts ← Pacing decisions
  ├─ morphology/
  │  ├─ MorphologyEngine.ts ← Grammar forms
  │  └─ PatternBasedMorphology.ts ← Pattern rules
  └─ DictionaryManager.ts ← Word lookup

/types.ts ← GameTurnData interface (UPDATE THIS)

/components/
  └─ GameScreen.tsx ← Display feedback (UPDATE THIS)
```

---

## ⏱️ Time Breakdown

| Phase | Task | Hours | Status |
|-------|------|-------|--------|
| 1 | InputChecker integration | 2 | Start here |
| 2 | ResponseTemplates update | 2 | Then this |
| 3 | Genre-specific templates | 4 | Parallel with #2 |
| 4 | Update GameTurnData | 1 | Quick |
| 5 | Wire CommunityEngineV3 | 2 | Then this |
| 6 | UI display | 2 | Last |
| 7 | Testing & polish | 4 | Throughout |
| **TOTAL** | **48-hour sprint** | **~17** | **Achievable** |

---

## ✅ Done Checklist

- [ ] All 6 genres have 5+ templates each
- [ ] All 12 languages covered
- [ ] Corrected forms bolded/highlighted
- [ ] Feedback separated from narrative
- [ ] Feedback in native language
- [ ] Genre flavor matches each genre
- [ ] No regressions in existing templates
- [ ] InputChecker integrated
- [ ] CommunityEngineV3.processTurn() updated
- [ ] GameTurnData includes feedback
- [ ] UI displays feedback
- [ ] Tested with fantasy pack
- [ ] Tested with scifi pack
- [ ] Tested with horror pack
- [ ] All 8 content packs load
- [ ] Berlitz principle verified in production

---

## 🎓 Remember: Why We're Doing This

**Berlitz Method = Proven Pedagogy**

1. Error caught automatically ✓
2. Corrected form shown naturally ✓
3. Explanation provided separately ✓
4. Action succeeds (positive) ✓
5. User never feels shame ✓
6. System learns patterns ✓
7. Next content personalized ✓

**Result:** Community Mode matches Gemini quality through templates, not AI.

---

**Status:** Ready to implement  
**Last Updated:** December 11, 2025  
**Estimated Completion:** December 13, 2025  

Good luck! 🚀
