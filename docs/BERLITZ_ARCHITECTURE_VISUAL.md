# Berlitz Method - Visual Architecture & Data Flow

---

## 🔄 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMUNITY MODE - BERLITZ FLOW                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. USER INPUT (in target language, may have errors)               │   │
│  │    Example: "Yo voy tomar la espada"                              │   │
│  │    (Missing preposition "a")                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 2. INPUTCHECKER VALIDATION & CORRECTION                           │   │
│  │    /services/InputChecker.ts                                       │   │
│  │                                                                     │   │
│  │    Input:  "Yo voy tomar la espada"                               │   │
│  │    ↓                                                               │   │
│  │    Tokenize: ["Yo", "voy", "tomar", "la", "espada"]              │   │
│  │    ↓                                                               │   │
│  │    Dictionary Lookup:                                             │   │
│  │    • "Yo" ✓ (pronoun)                                             │   │
│  │    • "voy" ✓ (present of ir)                                     │   │
│  │    • "tomar" ✓ (infinitive, should be conjugated after ir+a)     │   │
│  │    • "la" ✓ (article)                                             │   │
│  │    • "espada" ✓ (noun)                                            │   │
│  │    ↓                                                               │   │
│  │    Grammar Check:                                                 │   │
│  │    • Missing "a" before infinitive → ERROR (major)                │   │
│  │    ↓                                                               │   │
│  │    Auto-Correct: "Yo voy a tomar la espada"                      │   │
│  │    ↓                                                               │   │
│  │    Generate Feedback:                                             │   │
│  │    • Type: grammar (preposition)                                  │   │
│  │    • Original: "voy tomar"                                        │   │
│  │    • Corrected: "voy a tomar"                                    │   │
│  │    • Explanation: "Present + infinitive needs 'a' connector"      │   │
│  │    • Translate to native language                                 │   │
│  │                                                                     │   │
│  │    Output: CheckResult {                                          │   │
│  │      original: "Yo voy tomar la espada",                         │   │
│  │      corrected: "Yo voy a tomar la espada",                      │   │
│  │      hadErrors: true,                                             │   │
│  │      feedback: "[User Native Lang] Grammar: voy tomar → voy a...", │   │
│  │      errorDetails: [...],                                         │   │
│  │      confidence: 0.95                                             │   │
│  │    }                                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 3. USE CORRECTED INPUT FOR PARSING                                │   │
│  │    (NOT the original with errors)                                  │   │
│  │                                                                     │   │
│  │    Input (use this):  "Yo voy a tomar la espada"                │   │
│  │    NOT this:          "Yo voy tomar la espada"                  │   │
│  │                                                                     │   │
│  │    Parser Output:                                                 │   │
│  │    • Intent: TAKE                                                 │   │
│  │    • Target: "espada" (sword)                                     │   │
│  │    • Type: object                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 4. ACTION VALIDATOR                                               │   │
│  │    /services/community/ActionValidator.ts                         │   │
│  │                                                                     │   │
│  │    Check: Is "take" a valid action for "sword"?                   │   │
│  │    ObjectSystem.validateAction('TAKE', 'sword') → ✓ true         │   │
│  │                                                                     │   │
│  │    Output:                                                        │   │
│  │    • isValid: true                                                │   │
│  │    • intent: 'TAKE'                                               │   │
│  │    • target: 'sword'                                              │   │
│  │    • objectState: 'available'                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 5. TEMPLATE SELECTION (BERLITZ CORE)                              │   │
│  │    /services/community/ResponseTemplates.ts                       │   │
│  │                                                                     │   │
│  │    Build Template Context:                                        │   │
│  │    {                                                              │   │
│  │      object: 'sword',                                             │   │
│  │      objectState: 'available',                                    │   │
│  │      result: 'success',                                           │   │
│  │      originalInput: 'Yo voy tomar la espada',  ← ORIGINAL        │   │
│  │      correctedInput: 'Yo voy a tomar la espada', ← CORRECTED     │   │
│  │      hadErrors: true,                          ← FLAG            │   │
│  │      nativeVerb: 'Tomas',  ← CORRECT FORM      ← BERLITZ KEY    │   │
│  │      nativeObject: 'la espada'                                    │   │
│  │    }                                                              │   │
│  │    ↓                                                               │   │
│  │    Select Template:                                               │   │
│  │    • Intent: TAKE ✓                                               │   │
│  │    • Language: Spanish ✓                                          │   │
│  │    • Genre: Fantasy ✓                                             │   │
│  │    • Condition (success): true ✓                                  │   │
│  │    ↓                                                               │   │
│  │    Matched Template:                                              │   │
│  │    {                                                              │   │
│  │      id: 'take_success_fantasy',                                  │   │
│  │      intent: 'TAKE',                                              │   │
│  │      template: '**Tomas** [object]. Su magia brilla en tu mano.', │   │
│  │      genre: 'Fantasy',                                            │   │
│  │      priority: 10                                                 │   │
│  │    }                                                              │   │
│  │    ↓                                                               │   │
│  │    Substitute Variables:                                          │   │
│  │    Template:     '**Tomas** [object]. Su magia...'                │   │
│  │    Context:      { object: 'la espada' }                         │   │
│  │    Result:       '**Tomas** la espada. Su magia...'              │   │
│  │                   ↑ BERLITZ HIGHLIGHT ↑                          │   │
│  │                   Shows corrected verb form                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 6. ORACLE LEARNING                                                │   │
│  │    /services/community/Oracle.ts                                   │   │
│  │                                                                     │   │
│  │    Record Attempt:                                                │   │
│  │    • Action: TAKE                                                 │   │
│  │    • Input: "Yo voy a tomar la espada" (corrected)               │   │
│  │    • HadGrammarErrors: true                                       │   │
│  │    • ErrorTypes: ['grammar:preposition']                         │   │
│  │    • Success: true                                                │   │
│  │                                                                     │   │
│  │    Oracle learns:                                                │   │
│  │    ✓ User struggles with prepositions (voy + infinitive)         │   │
│  │    ✓ User succeeded despite error (positive)                     │   │
│  │    ✓ User is progressing in CEFR level                           │   │
│  │    ✓ Adjust difficulty accordingly                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 7. DIRECTOR INTERVENTION                                          │   │
│  │    /services/community/Director.ts                                │   │
│  │                                                                     │   │
│  │    Evaluate:                                                      │   │
│  │    • User frustration level: Low (made error but succeeded)      │   │
│  │    • Boredom level: Low (facing appropriate challenge)            │   │
│  │    • Error pattern: Prepositions                                  │   │
│  │                                                                     │   │
│  │    Decision:                                                      │   │
│  │    → Continue (no hint needed)                                    │   │
│  │    → But next event will focus on prepositions (learning path)    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 8. DISPLAY TO USER (TWO SECTIONS)                                 │   │
│  │                                                                     │   │
│  │    ═════════════════════════════════════════════════════════════   │   │
│  │    NARRATIVE (in Spanish, target language):                       │   │
│  │    ─────────────────────────────────────────────────────────────   │   │
│  │    **Tomas** la espada. Su magia brilla en tu mano. El arma      │   │
│  │    antigua pulsa con poder ancestral mientras la empuñas.        │   │
│  │                                                                     │   │
│  │    (Narrative shows corrected form naturally = Berlitz!)           │   │
│  │                                                                     │   │
│  │    ═════════════════════════════════════════════════════════════   │   │
│  │    💡 FEEDBACK (in English, learner's native language):           │   │
│  │    ─────────────────────────────────────────────────────────────   │   │
│  │    Grammar: "voy tomar" should be "voy a tomar"                 │   │
│  │    When using "ir" (to go) + infinitive, add "a" between them.   │   │
│  │    Example: "Voy a estudiar" (I'm going to study)                │   │
│  │                                                                     │   │
│  │    (Feedback explains error = Learning!)                          │   │
│  │                                                                     │   │
│  │    ═════════════════════════════════════════════════════════════   │   │
│  │    📊 YOUR PROGRESS:                                              │   │
│  │    ─────────────────────────────────────────────────────────────   │   │
│  │    Grammar Accuracy: 90% | Vocabulary: 45% | Level: A1            │   │
│  │    Strengths: Nouns, verbs | Needs work: Prepositions            │   │
│  │                                                                     │   │
│  │    (Progress tracking = Motivation!)                              │   │
│  │                                                                     │   │
│  │    ═════════════════════════════════════════════════════════════   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎬 Data Flow Diagram

```
User Input              InputChecker           Parser              Validator
("Yo voy tomar")   →   (Correction)      →    (Extract)     →   (Validate)
                          ↓                        ↓
                    Corrected:                Intent: TAKE
                    "Yo voy a tomar"        Target: sword
                    
                    Feedback:
                    "Grammar: voy tomar 
                     → voy a tomar"
                    
                                              ↓
                    ┌─────────────────────────────────────────┐
                    │   ResponseTemplates (BERLITZ CORE)     │
                    │   - Select by intent (TAKE)            │
                    │   - Select by language (Spanish)       │
                    │   - Select by genre (Fantasy)          │
                    │   - Select by condition (success)      │
                    │   - Substitute variables:              │
                    │     [nativeVerb] = Tomas               │
                    │     [object] = la espada               │
                    │   - Return: **Tomas** la espada...     │
                    └─────────────────────────────────────────┘
                                              ↓
                                        Narrative
                                    "**Tomas** la espada.
                                     Su magia brilla..."
                                              ↓
                    ┌─────────────────────────────────────────┐
                    │        Display to User                 │
                    │ ┌───────────────────────────────────┐  │
                    │ │ Narrative (Spanish, corrected)   │  │
                    │ │ Feedback (English, explanation)  │  │
                    │ │ Progress (Metrics)               │  │
                    │ └───────────────────────────────────┘  │
                    └─────────────────────────────────────────┘
                                              ↓
                                    Oracle Learning
                                    (error patterns)
                                              ↓
                                    Director Decision
                                    (next content)
```

---

## 📝 Template Matching Logic

```
ResponseTemplates.selectTemplate(intent, context, language, genre)
                                    ↓
        ┌───────────────────────────────────────────────────┐
        │ Filter: All templates with matching intent        │
        │ (TAKE, EXAMINE, OPEN, USE, TALK, DROP)          │
        └───────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────┐
        │ Filter: All templates with matching language      │
        │ (SPANISH, FRENCH, GERMAN, etc.)                  │
        └───────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────┐
        │ Filter: All templates with matching genre         │
        │ (FANTASY, SCIFI, HORROR, etc.)                   │
        │ Prefer: Genre-specific (priority 10)             │
        │ Fallback: Generic (priority 1)                   │
        └───────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────┐
        │ Filter: All templates with matching conditions    │
        │ - requiresState (locked/open/etc)                │
        │ - objectType (container/door/etc)                │
        │ - success (true/false)                           │
        └───────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────┐
        │ Sort: By priority (highest first)                │
        │ Pick: First (highest priority match)             │
        └───────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────┐
        │ Select: Random variant from template array       │
        │ (Each template has 3-5 variants for variety)    │
        └───────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────┐
        │ Substitute: Variables from context                │
        │ [object] → "la espada"                           │
        │ [nativeVerb] → "Tomas"                           │
        │ [result] → "success"                             │
        └───────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────────┐
        │ Return: Final narrative                          │
        │ "**Tomas** la espada. Su magia brilla en..."    │
        └───────────────────────────────────────────────────┘
```

---

## 🎓 Berlitz Psychology Flow

```
ERROR OCCURS
    ↓
User makes grammar mistake: "voy tomar" (missing preposition)
    ↓
IMPLICIT LEARNING (Subconscious)
    ├─ System corrects: "voy a tomar"
    ├─ Narrative shows: "**Vas a tomar** la espada..."
    ├─ User sees correct form in context
    └─ Brain absorbs pattern (implicit = fast learning)
    ↓
EXPLICIT LEARNING (Conscious)
    ├─ Feedback shown: "Grammar: voy tomar → voy a tomar"
    ├─ Explanation given: "ir + infinitive needs 'a'"
    ├─ Example provided: "Voy a estudiar"
    └─ User understands rule (explicit = deep learning)
    ↓
POSITIVE REINFORCEMENT
    ├─ Action succeeds: ✓ "You obtained the sword"
    ├─ User achieves goal: ✓ Despite error
    ├─ No shame/rejection: ✗ Never says "wrong"
    └─ Confidence builds (motivation)
    ↓
PATTERN LEARNING (System-level)
    ├─ Oracle records: User makes preposition errors
    ├─ Oracle learns: Pattern in conjugation systems
    ├─ Director decides: Next content focuses on prepositions
    └─ System adapts: Personalized learning path
    ↓
LONG-TERM CONSOLIDATION
    ├─ Same error type → Repeated naturally
    ├─ Correct form → Shown in multiple contexts
    ├─ Multiple exposures → Memory consolidation
    └─ User internalizes: "Ir + infinitive ALWAYS needs 'a'"
    ↓
MASTERY ACHIEVED
    ✓ User stops making error
    ✓ User uses "voy a + infinitive" automatically
    ✓ Error removed from learning target list
    ✓ System moves to next difficulty
```

---

## 🔄 Genre-Specific Template Variants

```
User Action: TAKE sword

GENERIC TEMPLATE (priority 1):
─────────────────────────────────
English:   "You take the sword."
Spanish:   "Tomas la espada."
French:    "Vous prenez l'épée."
Result:    ✓ Works, but boring

FANTASY TEMPLATE (priority 10):
─────────────────────────────────
English:   "You seize the sword. Ancient magic crackles through..."
Spanish:   "**Tomas** la espada. Su magia ancestral te envuelve..."
French:    "Vous prenez l'épée. La puissance magique..."
Result:    ✓ Immersive, atmospheric, exciting

SCIFI TEMPLATE (priority 10):
─────────────────────────────────
English:   "You retrieve the sword. Sensors flash green."
Spanish:   "**Recuperas** la espada. Los sensores parpadean..."
French:    "Vous saisissez le sabre. L'interface confirme..."
Result:    ✓ Technical, futuristic, sleek

HORROR TEMPLATE (priority 10):
─────────────────────────────────
English:   "You grab the sword with trembling hands..."
Spanish:   "**Agarras** la espada. El miedo te paraliza..."
French:    "Vous saisissez l'épée. Quelque chose d'horrible..."
Result:    ✓ Tense, ominous, suspenseful

WESTERN TEMPLATE (priority 10):
─────────────────────────────────
English:   "You draw the sword. Dust swirls around you..."
Spanish:   "**Desenvanas** la espada. El polvo vuela..."
French:    "Vous dégainez le sabre. Le vent siffle..."
Result:    ✓ Gritty, action-packed, wild west

CYBERPUNK TEMPLATE (priority 10):
─────────────────────────────────
English:   "You jack the sword. Neon light reflects..."
Spanish:   "**Adquieres** la espada. Luces de neón brillan..."
French:    "Vous hackez le sabre. Les lumières cybernétiques..."
Result:    ✓ Edgy, digital, dystopian

RESULT:
─────────────────────────────────
Same action (TAKE sword) but:
✓ Each genre has unique flavor
✓ Each language fully supported  
✓ Each response recasts corrected verb naturally
✓ User stays immersed in genre
✓ Learning happens transparently
```

---

## ✅ Quality Assurance Checkpoints

```
╔═══════════════════════════════════════════════════════════╗
║ CHECKPOINT 1: Error Detection                            ║
║───────────────────────────────────────────────────────────║
║ Does InputChecker catch all 7 error types?              ║
║ ✓ Spelling (typos, accents)                             ║
║ ✓ Grammar (agreement, cases, prepositions)              ║
║ ✓ Conjugation (verb forms)                              ║
║ ✓ Word order (wrong sequence)                           ║
║ ✓ Unknown words (not in dictionary)                     ║
║ ✓ Accent marks (café vs cafe)                           ║
║ ✓ Other (uncommon errors)                               ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║ CHECKPOINT 2: Berlitz Display                            ║
║───────────────────────────────────────────────────────────║
║ Does narrative show corrected form clearly?             ║
║ ✓ Corrected verb in bold: **Tomas**                     ║
║ ✓ Corrected form matches genre tone                     ║
║ ✓ Narrative flows naturally (not awkward)               ║
║ ✓ All 12 languages supported                            ║
║ ✓ All 6 genres have variants                            ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║ CHECKPOINT 3: Feedback Quality                           ║
║───────────────────────────────────────────────────────────║
║ Does feedback explain error clearly?                    ║
║ ✓ Shows original and correction                         ║
║ ✓ Explains grammar rule                                 ║
║ ✓ Provides example                                      ║
║ ✓ Translated to native language                         ║
║ ✓ Appropriate for CEFR level                            ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║ CHECKPOINT 4: User Experience                            ║
║───────────────────────────────────────────────────────────║
║ Does user learn without shame?                          ║
║ ✓ Action succeeds (positive reinforcement)              ║
║ ✓ Never sees "You're wrong" message                     ║
║ ✓ Corrected form shown naturally                        ║
║ ✓ Feedback helpful, not punitive                        ║
║ ✓ Progress tracked and celebrated                       ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║ CHECKPOINT 5: System Learning                            ║
║───────────────────────────────────────────────────────────║
║ Does Oracle learn error patterns?                       ║
║ ✓ Records which error types occur                       ║
║ ✓ Tracks frequency per learner                          ║
║ ✓ Identifies weak areas (prepositions, articles, etc.)  ║
║ ✓ Director uses this to personalize next content        ║
║ ✓ Learning path adapts dynamically                      ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🎯 Key Implementation Insights

### 1. **Why We Use Corrected Input (Not Original)**
```
Wrong Approach:
Input: "yo voy tomar"
Parser sees: incomplete sentence structure
Parser fails: Can't extract clean intent

Correct Approach:
Input: "yo voy tomar"
InputChecker corrects: "yo voy a tomar"  
Parser sees: complete structure
Parser succeeds: intent=TAKE, target=sword
Result: ✓ Action works despite error
```

### 2. **Why We Display Corrected Form in Narrative (Not Just Feedback)**
```
Feedback-Only Approach:
User sees: "Feedback: voy tomar → voy a tomar"
Result: ✗ User knows intellectually, but doesn't internalize

Berlitz Approach (Narrative + Feedback):
User sees: "**Vas a tomar** la espada..." (in narrative)
User sees: "Feedback: voy tomar → voy a tomar" (explanation)
Result: ✓ User sees correct form in context (implicit learning)
        ✓ User understands rule (explicit learning)
        ✓ User internalizes through repetition
```

### 3. **Why Genre-Specific Templates Matter**
```
Same Intent, Multiple Genres:

Fantasy:   "**Tomas** la espada. Su magia brilla..."
           (Emphasizes magical properties)

SciFi:     "**Recuperas** la espada. Sensores activan..."
           (Emphasizes technical aspects)

Horror:    "**Agarras** la espada. El terror te envuelve..."
           (Emphasizes danger/dread)

Result: ✓ Same learning objective (preposition "a")
        ✓ Different narrative flavor (genre immersion)
        ✓ User stays engaged (not repetitive)
        ✓ Different conjugations (multiple exposures)
```

### 4. **Why Feedback is Separate from Narrative**
```
Mixed Approach:
"**Tomas** la espada [Grammar: voy tomar → voy a tomar]"
Result: ✗ Immersion broken, awkward reading

Separated Approach:
Narrative: "**Tomas** la espada. Su magia brilla..."
Feedback:  "[Separate box] Grammar: voy tomar → voy a tomar"
Result:    ✓ Narrative flows naturally
           ✓ Feedback available when user wants it
           ✓ Two learning channels active
```

---

## 🏁 Implementation Completion Checklist

- [ ] ResponseTemplates interface updated with genre field
- [ ] ResponseTemplates.selectTemplate() accepts genre parameter
- [ ] TemplateContext includes: originalInput, correctedInput, nativeVerb, hadErrors
- [ ] Genre-specific templates created for all 6 genres
- [ ] All 12 languages have variant templates
- [ ] CommunityEngineV3.processTurn() calls InputChecker
- [ ] CommunityEngineV3.processTurn() uses corrected input
- [ ] CommunityEngineV3.processTurn() passes genre to selectTemplate()
- [ ] GameTurnData interface includes feedback field
- [ ] UI displays narrative and feedback separately
- [ ] UI shows corrected verb in bold
- [ ] Feedback translated to native language
- [ ] Oracle records grammar errors
- [ ] Director uses error patterns for content selection
- [ ] All 8 content packs tested
- [ ] User never sees "wrong" message
- [ ] Berlitz principle verified in production

---

**Status:** 🟡 Ready for implementation  
**Blockers:** None  
**Risk Level:** Low  
**Complexity:** Medium (assembly of existing components)
