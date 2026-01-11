# Berlitz Integration - Concrete Code Implementation

**Purpose:** Show exactly how to wire Berlitz error correction into Community Mode

---

## 🔗 Integration Points

### Point 1: ResponseTemplates - Add Corrected Form Support

**Current Code (lines 19-23):**
```typescript
export interface TemplateContext {
  verb?: string;
  object?: string;
  objectState?: string;
  result?: string;
  adjective?: string;
  location?: string;
  [key: string]: string | undefined;
}
```

**Add these fields for Berlitz:**
```typescript
export interface TemplateContext {
  // ... existing fields ...
  
  // NEW: Berlitz correction support
  originalInput?: string;      // What user typed (with errors)
  correctedInput?: string;     // What user typed (corrected)
  hadErrors?: boolean;         // Did input have grammar errors?
  nativeVerb?: string;         // Conjugated verb in target language
  nativeObject?: string;       // Gendered/cased object in target language
}
```

**Why:** These fields let templates showcase the corrected form.

---

### Point 2: ResponseTemplates - Create Genre-Aware Variants

**Current code (lines 145-175):**
```typescript
{
  id: 'take_success',
  intent: 'TAKE',
  templates: {
    [Language.ENGLISH]: [
      'You take the [object].',
      'You pick up the [object].',
    ],
    [Language.SPANISH]: [
      'Tomas [object].',
      'Recoges [object].',
    ],
  },
  conditions: { success: true },
  priority: 5,
}
```

**Add genre-specific variants:**
```typescript
// TAKE (Generic - all genres)
{
  id: 'take_success_generic',
  intent: 'TAKE',
  templates: {
    [Language.SPANISH]: [
      'Tomas [object].',
      'Recoges [object].',
    ],
  },
  conditions: { success: true },
  priority: 1,  // Low priority - use only if no genre-specific match
}

// TAKE (Fantasy - emphasizes magical elements)
{
  id: 'take_success_fantasy',
  intent: 'TAKE',
  templates: {
    [Language.SPANISH]: [
      '**Tomas** [object]. Su magia brilla en tu mano.',
      '**Agarras** [object]. Sientes su poder ancestral.',
      '**Coges** [object]. El encantamiento se envuelve alrededor de ti.',
    ],
  },
  conditions: { success: true },
  genre: 'Fantasy',      // NEW: Genre condition
  priority: 10,          // Higher priority - prefer genre-specific
}

// TAKE (SciFi - emphasizes futuristic elements)
{
  id: 'take_success_scifi',
  intent: 'TAKE',
  templates: {
    [Language.SPANISH]: [
      '**Recuperas** [object]. Su superficie emite un zumbido electrónico.',
      '**Aseguran** [object]. Los sensores parpadean con aprobación.',
    ],
  },
  conditions: { success: true },
  genre: 'SciFi',
  priority: 10,
}

// TAKE (Horror - emphasizes dread)
{
  id: 'take_success_horror',
  intent: 'TAKE',
  templates: {
    [Language.SPANISH]: [
      '**Agarras** [object] con dedos temblorosos.',
      '**Coges** [object]. Algo maléfico observa desde la oscuridad.',
    ],
  },
  conditions: { success: true },
  genre: 'Horror',
  priority: 10,
}
```

**Key changes:**
- ✅ **Bold markup** on verb to highlight corrected conjugation
- ✅ Genre-specific continuation (Fantasy = magical, SciFi = technical, Horror = ominous)
- ✅ `genre` condition added to template interface
- ✅ Higher priority for genre matches

---

### Point 3: ResponseTemplates - Extend selectTemplate()

**Current code (lines 82-117):**
```typescript
selectTemplate(
  intent: ObjectIntent | 'INVALID' | 'GENERIC',
  context: TemplateContext,
  language: Language
): string | null {
  const candidates = Array.from(this.templates.values()).filter(template => {
    if (template.intent !== intent) return false;
    if (!template.templates[language]) return false;
    // ... condition checks ...
    return true;
  });
  // ... sort and select ...
}
```

**Updated signature to support genre:**
```typescript
selectTemplate(
  intent: ObjectIntent | 'INVALID' | 'GENERIC',
  context: TemplateContext,
  language: Language,
  genre?: NarrativeGenre  // NEW: Optional genre for template selection
): string | null {
  const candidates = Array.from(this.templates.values()).filter(template => {
    if (template.intent !== intent) return false;
    if (!template.templates[language]) return false;

    // Check conditions
    if (template.conditions) {
      const { requiresState, objectType, success } = template.conditions;
      if (requiresState && context.objectState !== requiresState) return false;
      if (objectType && context.object !== objectType) return false;
      if (success !== undefined && context.result) {
        const isSuccess = context.result === 'success';
        if (success !== isSuccess) return false;
      }
    }

    // NEW: Genre condition
    if ('genre' in template && template.genre) {
      // Only include genre-specific templates if genre matches
      if (template.genre !== genre) return false;
    } else if (genre) {
      // Generic templates only used if no genre-specific match
      continue;
    }

    return true;
  });

  // ... rest of method ...
}
```

---

### Point 4: CommunityEngineV3 - Integrate InputChecker

**File:** `/services/CommunityEngineV3.ts`

**Current skeleton (lines 100-115 approx):**
```typescript
async processTurn(playerInput: string): Promise<GameTurnData> {
  if (!this.currentGame) throw new Error('No game in progress');

  // 1. Parse input
  const parseResult = await this.parser.parseWithContentPack(
    playerInput,
    this.currentGame.language
  );
  
  // 2. Validate action
  const validation = await this.actionValidator.validateInput(
    playerInput,
    this.currentGame.availableObjects
  );
  
  // 3. Generate response
  const response = this.responseTemplates.selectTemplate(
    validation.intent,
    { object: validation.target },
    this.currentGame.language
  );
  
  // ... return GameTurnData ...
}
```

**Updated with Berlitz:**
```typescript
async processTurn(playerInput: string): Promise<GameTurnData> {
  if (!this.currentGame) throw new Error('No game in progress');

  // ===== NEW: STEP 1A - CHECK AND CORRECT INPUT =====
  const checkResult = await this.inputChecker.checkAndCorrect(
    playerInput,
    this.currentGame.language,
    this.profile.cefr  // CEFR level for feedback adjustment
  );

  // Log for Oracle learning
  if (checkResult.hadErrors) {
    console.log(`[Berlitz] Errors detected: ${checkResult.feedback}`);
  }

  // USE CORRECTED INPUT for parsing (not original with errors)
  const inputToUse = checkResult.corrected;

  // ===== STEP 1B - PARSE INPUT (with corrections) =====
  const parseResult = await this.parser.parseWithContentPack(
    inputToUse,  // ← CORRECTED VERSION
    this.currentGame.language
  );

  // ===== STEP 2 - VALIDATE ACTION =====
  const validation = await this.actionValidator.validateInput(
    inputToUse,  // ← CORRECTED VERSION
    this.currentGame.availableObjects
  );

  // ===== STEP 3A - PREPARE TEMPLATE CONTEXT WITH CORRECTED FORM =====
  const templateContext: TemplateContext = {
    object: validation.target,
    objectState: validation.objectState,
    result: validation.isValid ? 'success' : 'failed',
    
    // NEW: Add corrected form for Berlitz
    originalInput: playerInput,
    correctedInput: checkResult.corrected,
    hadErrors: checkResult.hadErrors,
    
    // NEW: Genre-specific verbs (conjugated correctly)
    nativeVerb: this.getGenreAwareVerb(validation.intent, this.currentGame.language),
    nativeObject: validation.target,
  };

  // ===== STEP 3B - SELECT TEMPLATE (with genre support) =====
  const response = this.responseTemplates.selectTemplate(
    validation.intent,
    templateContext,
    this.currentGame.language,
    this.currentGame.genre  // ← PASS GENRE for selection
  );

  if (!response) {
    // Fallback to generic response
    return this.createGenericResponse(validation.intent, inputToUse);
  }

  // ===== STEP 4 - ORACLE LEARNS FROM ATTEMPT =====
  await this.oracle.recordAttempt({
    action: validation.intent,
    input: checkResult.corrected,  // Use corrected form for learning
    hadGrammarErrors: checkResult.hadErrors,
    errorTypes: checkResult.errorDetails.map(e => e.type),
    success: validation.isValid,
    cefr: this.profile.cefr
  });

  // ===== STEP 5 - DIRECTOR DECIDES INTERVENTION =====
  const directorDecision = await this.director.evaluateIntervention(
    this.oracle.getCurrentProfile(),
    validation.intent
  );

  // ===== STEP 6 - COMPILE RESPONSE =====
  let finalNarrative = response;
  let feedback = '';
  
  if (checkResult.hadErrors) {
    // Add Berlitz feedback showing what was corrected
    feedback = checkResult.feedback;
  }

  if (directorDecision.decision !== 'continue') {
    // Add director intervention (hint, encouragement, etc.)
    finalNarrative += '\n\n' + directorDecision.message;
  }

  // ===== RETURN GAME DATA =====
  return {
    narrative: finalNarrative,
    feedback,  // ← NEW: Separate feedback section
    hadErrors: checkResult.hadErrors,
    attemptedAction: validation.intent,
    success: validation.isValid,
    nextObjective: this.director.nextObjective,
    learnerMetrics: {
      grammarAccuracy: this.oracle.getGrammarAccuracy(),
      vocabularyMastery: this.oracle.getVocabularyScore(),
      frustrationLevel: this.oracle.getFrustrationLevel(),
    }
  };
}

/**
 * Helper: Get conjugated verb appropriate for genre
 */
private getGenreAwareVerb(intent: ObjectIntent, language: Language): string {
  // This returns the correctly conjugated verb for the genre
  // Examples:
  // - "Take" (Fantasy) = "Tomas" (present tense, 2nd person singular)
  // - "Take" (SciFi) = "Recuperas" (more technical)
  // - "Take" (Horror) = "Agarras" (more desperate)
  
  const verbMap: Record<ObjectIntent, Record<Language, string>> = {
    [ObjectIntent.TAKE]: {
      [Language.SPANISH]: 'Tomas',
      [Language.FRENCH]: 'Vous prenez',
      // ... etc
    },
    [ObjectIntent.EXAMINE]: {
      [Language.SPANISH]: 'Examinas',
      [Language.FRENCH]: 'Vous examinez',
      // ... etc
    },
    // ... more intents ...
  };

  return verbMap[intent]?.[language] || '';
}
```

---

### Point 5: Update GameTurnData Interface

**File:** `/types.ts`

**Current:**
```typescript
export interface GameTurnData {
  narrative: string;
  attemptedAction: string;
  success: boolean;
  nextObjective: string;
}
```

**Updated:**
```typescript
export interface GameTurnData {
  narrative: string;
  
  // NEW: Berlitz feedback
  feedback?: string;           // Grammar correction explanation
  hadErrors?: boolean;         // Did input have errors?
  
  attemptedAction: string;
  success: boolean;
  nextObjective: string;
  
  // NEW: Learner progress tracking
  learnerMetrics?: {
    grammarAccuracy: number;        // 0-100%
    vocabularyMastery: number;      // 0-100%
    frustrationLevel: 'low' | 'medium' | 'high';
    cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  };
  
  // NEW: Director intervention
  directorMessage?: string;    // Hint, encouragement, etc.
}
```

---

## 📋 Complete Berlitz Flow (Concrete Example)

### Scenario: Spanish learner, Fantasy genre, beginner level

**User types:** "Yo voy tomar la espada" (grammatically incorrect)
- "voy tomar" should be "voy a tomar" (missing preposition)

**Step 1: InputChecker**
```typescript
const checkResult = await inputChecker.checkAndCorrect(
  'Yo voy tomar la espada',
  Language.SPANISH,
  'A1'
);

// Returns:
{
  original: 'Yo voy tomar la espada',
  corrected: 'Yo voy a tomar la espada',
  hadErrors: true,
  feedback: '[Spanish] Grammar: "voy tomar" should be "voy a tomar" (missing preposition for infinitive)',
  errorDetails: [
    {
      type: 'grammar',
      original: 'voy tomar',
      corrected: 'voy a tomar',
      severity: 'major',
      explanation: 'Present + infinitive requires "a"',
      priority: 1
    }
  ]
}
```

**Step 2: Parser**
```typescript
const parseResult = parser.parseWithContentPack(
  'Yo voy a tomar la espada',  // ← Uses CORRECTED input
  Language.SPANISH
);

// Returns: { intent: 'TAKE', target: 'sword' }
```

**Step 3: Validator**
```typescript
const validation = actionValidator.validateInput(
  'Yo voy a tomar la espada',  // ← Uses CORRECTED input
  availableObjects
);

// Returns: { 
//   intent: 'TAKE', 
//   target: 'sword', 
//   isValid: true,
//   objectState: 'available' 
// }
```

**Step 4: Template Selection**
```typescript
const response = responseTemplates.selectTemplate(
  'TAKE',
  {
    object: 'la espada',
    objectState: 'available',
    result: 'success',
    originalInput: 'Yo voy tomar la espada',
    correctedInput: 'Yo voy a tomar la espada',
    hadErrors: true,
    nativeVerb: 'Tomas',
    nativeObject: 'la espada'
  },
  Language.SPANISH,
  NarrativeGenre.FANTASY
);

// Matches template: 'take_success_fantasy'
// Template: '**Tomas** [object]. Su magia brilla en tu mano.'
// After substitution: '**Tomas** la espada. Su magia brilla en tu mano.'
```

**Step 5: Display to User**

```
═══════════════════════════════════════════════════════════════════
NARRATIVE (in Spanish, shows corrected form naturally):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Tomas** la espada. Su magia brilla en tu mano. El arma antigua 
pulsa con poder ancestral mientras la empuñas.

═══════════════════════════════════════════════════════════════════
💡 GRAMMAR FEEDBACK (in learner's native language):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[English]: Grammar: "voy tomar" → "voy a tomar"
When combining present + infinitive, use "a" between them.

═══════════════════════════════════════════════════════════════════
📊 YOUR PROGRESS:
Grammar Accuracy: 90% | Vocabulary: 45% | Difficulty: A1
═══════════════════════════════════════════════════════════════════
```

**What the learner sees:**
1. ✅ **Narrative** with corrected form naturally used (**Tomas** la espada)
2. ✅ **Feedback** explaining what was wrong and why
3. ✅ **Action succeeds** (positive reinforcement)
4. ✅ **Genre flavor** (Fantasy-specific response)
5. ✅ **Progress tracking** (metrics improve)

**What the system tracks:**
1. ✅ Learner made grammar error (preposition)
2. ✅ Corrected form demonstrated in context
3. ✅ Feedback given in learner's native language
4. ✅ Oracle learns: This learner struggles with prepositions
5. ✅ Director can choose next event focusing on prepositions

---

## ✅ Implementation Checklist

**Before writing code:**
- [ ] Review existing templates in ResponseTemplates.ts
- [ ] Add `genre` field to ResponseTemplate interface
- [ ] Add Berlitz fields to TemplateContext interface
- [ ] Update selectTemplate() to support genre parameter

**Then implement:**
- [ ] Create genre-specific templates for all 6 genres
- [ ] Add corrected form display (bold, highlight)
- [ ] Integrate InputChecker into processTurn()
- [ ] Wire feedback output to GameTurnData
- [ ] Update UI to display feedback section

**Then test:**
- [ ] Load enchanted-forest.json (Fantasy)
- [ ] Play with intentional grammar errors
- [ ] Verify feedback appears in UI
- [ ] Verify corrected form shown in narrative
- [ ] Verify genre flavor matches

---

## 🎓 Educational Psychology Check

User makes error: "Yo voy tomar" (missing preposition)

**Berlitz approach:**
1. System corrects: "Yo voy a tomar"
2. Narrative shows: "**Tomas** la espada..." (demonstrates correct form)
3. Feedback explains: "voy tomar" → "voy a tomar" (what was wrong, why)
4. Action succeeds: ✓ (positive reinforcement)
5. Oracle learns: User struggles with prepositions

**Result:**
- ✅ User never feels rejected ("wrong!")
- ✅ Correct form repeated in context (implicit learning)
- ✅ Explanation provided (explicit learning)
- ✅ Achievement validated (success)
- ✅ System adapts next content (personalization)

**This is proven pedagogy. Berlitz method works.**

---

## 🚀 Next Steps

1. **Update ResponseTemplates interface** to support genre conditions
2. **Create genre-specific templates** for all 6 genres (150+ templates)
3. **Integrate InputChecker** into CommunityEngineV3.processTurn()
4. **Wire feedback to UI** (separate feedback display box)
5. **Test with first content pack** (enchanted-forest)

**Estimated time:** 6-8 hours for full Berlitz implementation

**Ready to start?**
