/**
 * Facade Data Conversion Script
 *
 * Converts Facade's Java source code data structures into JSON format
 * for use by the TypeScript Facade engine.
 *
 * Usage: node scripts/convert-facade-data.cjs
 */

const fs = require('fs');
const path = require('path');

const FACADE_SOURCE_DIR = path.join(__dirname, '../Facade-master/facade');
const OUTPUT_DIR = path.join(__dirname, '../data/facade');

// Discourse Act Types (from facade/util/DAType.java)
const DiscourseActType = {
  NULL: -1,
  Agree: 0,
  Disagree: 1,
  Praise: 11,
  Criticize: 12,
  Greet: 30,
  Goodbye: 32,
  Thank: 8,
  HowAreYou: 20,
  AreYouOkay: 21,
  Explain: 23,
  Flirt: 15,
  Hug: 16,
  Kiss: 18,
  Comfort: 17,
  Support: 22,
  Ally: 13,
  Oppose: 14,
  PositiveExcl: 3,
  NegativeExcl: 4,
  DontUnderstand: 7,
  Misc: 33,
  StrongAgreement: 46,
  StrongDisagreement: 48,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function readJavaFile(relativePath) {
  const fullPath = path.join(FACADE_SOURCE_DIR, relativePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

function extractEnumConstants(javaContent) {
  const constants = {};
  const regex = /public static final int (\w+)\s*=\s*(-?\d+);/g;
  let match;

  while ((match = regex.exec(javaContent)) !== null) {
    const [, name, value] = match;
    constants[name] = parseInt(value, 10);
  }

  return constants;
}

function extractMethodCalls(javaContent, methodPattern) {
  const calls = [];
  const regex = new RegExp(`${methodPattern}\\([^)]*\\)`, 'g');
  let match;

  while ((match = regex.exec(javaContent)) !== null) {
    calls.push(match[0]);
  }

  return calls;
}

function parseBeatActionMethod(methodName, javaContent) {
  const methodRegex = new RegExp(
    `public static void ${methodName}\\(.*?\\)\\s*{([\\s\\S]*?)\n    }\n`,
    'm'
  );
  const match = javaContent.match(methodRegex);

  if (!match) {
    console.warn(`[WARN] Could not find method: ${methodName}`);
    return null;
  }

  const methodBody = match[1];

  const operations = {
    setsUnhandledAct: methodBody.includes('unhandledAct'),
    setsTxnInType: methodBody.includes('txnInType'),
    setsAbortReason: methodBody.includes('abortReason'),
    setsSubtopic: methodBody.includes('subtopic'),
    addsWME: extractMethodCalls(methodBody, 'addWME'),
    deletesWME: extractMethodCalls(methodBody, 'deleteAllWMEClass'),
    setsHandledStatus: methodBody.includes('setHandledStatus'),
  };

  return operations;
}

// ============================================================================
// BEAT EXTRACTION
// ============================================================================

function extractBeats() {
  console.log('[Phase 1] Extracting beat definitions...');

  const beatIDContent = readJavaFile('util/BeatID.java');
  const beatIDs = extractEnumConstants(beatIDContent);

  const beatActionsContent = readJavaFile('beats/BeatActions.java');

  const beats = [];

  for (const [beatName, beatId] of Object.entries(beatIDs)) {
    if (beatName === 'NOTABEAT' || beatName === 'FIRSTBEAT' || beatName === 'LASTBEAT') {
      continue;
    }

    console.log(`  Processing beat: ${beatName} (ID: ${beatId})`);

    let tier = 1;
    if (beatName.includes('_T2')) tier = 2;
    else if (beatName.includes('_P2') || beatName.includes('_T3')) tier = 3;

    let topic = undefined;
    if (beatName.includes('ArtistAdv')) topic = 59;
    else if (beatName.includes('Facade')) topic = 60;
    else if (beatName.includes('RockyMarriage')) topic = 61;

    let affinity = 'neutral';
    if (beatName.includes('_GPA_') || beatName.includes('GAffChr')) affinity = 'grace';
    else if (beatName.includes('_TPA_') || beatName.includes('TAffChr')) affinity = 'trip';

    const initAction = parseBeatActionMethod(`_${beatName}_initAction`, beatActionsContent);
    const selectAction = parseBeatActionMethod(`_${beatName}_selectAction`, beatActionsContent);
    const succeedAction = parseBeatActionMethod(`_${beatName}_succeedAction`, beatActionsContent);

    const beat = {
      id: beatId,
      name: beatName,
      tier,
      topic,
      affinity,
      preconditions: [],
      priority: 50,
      maxActivations: 1,
      initAction: initAction ? `_${beatName}_initAction` : undefined,
      selectAction: selectAction ? `_${beatName}_selectAction` : undefined,
      succeedAction: succeedAction ? `_${beatName}_succeedAction` : undefined,
      steps: [],
      allowMixins: {
        pushTooFar: true,
        satellite: true,
        object: true,
        DA: true,
        deflect: true,
        pattern: true,
      },
    };

    beats.push(beat);
  }

  console.log(`[Phase 1] Extracted ${beats.length} beats`);
  return beats;
}

// ============================================================================
// INITIAL STATE EXTRACTION
// ============================================================================

function extractInitialState() {
  console.log('[Phase 2] Extracting initial world state...');

  const initialState = {
    globalFacts: {
      playerInvited: true,
      dateAnniversary: 'anniversary',
      apartmentLocation: 'suburban',
      timeOfDay: 'evening',
    },

    characterStates: {
      grace: {
        character: 'grace',
        mood: -20,
        tension: 40,
        affinityToPlayer: 0,
        affinityToPartner: -10,
        activeGoals: ['maintain_facade', 'avoid_conflict'],
        desireToReveal: 20,
        desireToMaintainFacade: 80,
        revealedSecrets: [],
        playerActions: [],
        position: 'bedroom',
      },

      trip: {
        character: 'trip',
        mood: -15,
        tension: 45,
        affinityToPlayer: 0,
        affinityToPartner: -10,
        activeGoals: ['maintain_facade', 'be_good_host'],
        desireToReveal: 15,
        desireToMaintainFacade: 85,
        revealedSecrets: [],
        playerActions: [],
        position: 'entryway',
      },
    },

    relationships: [
      {
        from: 'grace',
        to: 'trip',
        affinity: -10,
        tension: 60,
        intimacy: 40,
        trustLevel: 30,
      },
      {
        from: 'trip',
        to: 'grace',
        affinity: -5,
        tension: 60,
        intimacy: 40,
        trustLevel: 35,
      },
      {
        from: 'grace',
        to: 'player',
        affinity: 0,
        tension: 10,
        intimacy: 0,
        trustLevel: 50,
      },
      {
        from: 'trip',
        to: 'player',
        affinity: 5,
        tension: 5,
        intimacy: 0,
        trustLevel: 50,
      },
    ],

    relationshipTension: 60,
    currentTier: 1,
    beatHistory: [],

    sessionStartTime: Date.now(),
    currentTime: Date.now(),

    playerPosition: 'hallway_outside_door',
    playerTotalSpeechActs: 0,
  };

  console.log('[Phase 2] Initial state created with defaults');
  return initialState;
}

// ============================================================================
// DISCOURSE ACT PATTERNS
// ============================================================================

function createDiscourseActPatterns() {
  console.log('[Phase 3] Creating discourse act patterns...');

  const patterns = [
    {
      daType: DiscourseActType.Agree,
      patterns: ['^(yes|yeah|yep|sure|okay|ok|right|exactly|absolutely)\\b'],
      keywords: ['yes', 'yeah', 'agree', 'right', 'true'],
      confidence: 0.9,
    },
    {
      daType: DiscourseActType.StrongAgreement,
      patterns: ['^(absolutely|definitely|completely|totally) (right|true|agree)'],
      keywords: ['absolutely', 'definitely', 'completely'],
      confidence: 0.95,
    },
    {
      daType: DiscourseActType.Disagree,
      patterns: ['^(no|nope|nah|not really|i disagree)\\b'],
      keywords: ['no', 'not', 'disagree', 'wrong'],
      confidence: 0.9,
    },
    {
      daType: DiscourseActType.StrongDisagreement,
      patterns: ['(absolutely not|completely wrong|totally disagree|bullshit)'],
      keywords: ['absolutely not', 'bullshit', 'wrong'],
      confidence: 0.95,
    },
    {
      daType: DiscourseActType.Thank,
      patterns: ['(thank|thanks|appreciate)'],
      keywords: ['thank', 'thanks', 'appreciate'],
      confidence: 0.9,
    },
    {
      daType: DiscourseActType.Greet,
      patterns: ['^(hi|hello|hey|good evening|greetings)\\b'],
      keywords: ['hi', 'hello', 'hey'],
      confidence: 0.95,
    },
    {
      daType: DiscourseActType.Goodbye,
      patterns: ['(goodbye|bye|see you|gotta go|i should leave)'],
      keywords: ['bye', 'goodbye', 'leave', 'go'],
      confidence: 0.9,
    },
    {
      daType: DiscourseActType.Praise,
      patterns: ['(great|wonderful|excellent|amazing|good job|well done|nice|beautiful|love it)'],
      keywords: ['great', 'wonderful', 'amazing', 'love', 'beautiful'],
      confidence: 0.85,
    },
    {
      daType: DiscourseActType.Criticize,
      patterns: ['(terrible|awful|horrible|disgusting|bad|ugly|hate)'],
      keywords: ['terrible', 'awful', 'horrible', 'hate', 'disgusting'],
      confidence: 0.85,
    },
    {
      daType: DiscourseActType.HowAreYou,
      patterns: ['(how are you|how\'re you|how you doing|you okay)'],
      keywords: ['how are you', 'how you', 'doing'],
      confidence: 0.9,
    },
    {
      daType: DiscourseActType.AreYouOkay,
      patterns: ['(are you (okay|ok|alright|fine)|you (okay|ok|alright))'],
      keywords: ['okay', 'alright', 'fine'],
      confidence: 0.85,
    },
    {
      daType: DiscourseActType.Explain,
      patterns: ['(what do you mean|explain|tell me more|what happened|why)'],
      keywords: ['explain', 'why', 'what', 'tell me'],
      confidence: 0.8,
    },
    {
      daType: DiscourseActType.Flirt,
      patterns: ['(sexy|hot|attractive|beautiful|gorgeous|cute)'],
      keywords: ['sexy', 'hot', 'attractive', 'gorgeous'],
      confidence: 0.8,
    },
    {
      daType: DiscourseActType.Hug,
      patterns: ['(hug|embrace|hold)'],
      keywords: ['hug', 'embrace', 'hold'],
      confidence: 0.9,
    },
    {
      daType: DiscourseActType.Kiss,
      patterns: ['(kiss|make out)'],
      keywords: ['kiss'],
      confidence: 0.95,
    },
    {
      daType: DiscourseActType.Comfort,
      patterns: ['(it\'s okay|don\'t worry|it\'ll be alright|i\'m here for you)'],
      keywords: ['okay', 'alright', 'here for you', 'worry'],
      confidence: 0.85,
    },
    {
      daType: DiscourseActType.Support,
      patterns: ['(i support you|i\'m on your side|i understand|i\'m with you)'],
      keywords: ['support', 'understand', 'with you', 'side'],
      confidence: 0.85,
    },
    {
      daType: DiscourseActType.Ally,
      patterns: ['(i agree with (grace|trip)|i\'m with (grace|trip)|(grace|trip) is right)'],
      keywords: ['agree with', 'with grace', 'with trip'],
      confidence: 0.9,
    },
    {
      daType: DiscourseActType.Oppose,
      patterns: ['((grace|trip) is wrong|i disagree with (grace|trip)|against (grace|trip))'],
      keywords: ['wrong', 'disagree with', 'against'],
      confidence: 0.9,
    },
    {
      daType: DiscourseActType.PositiveExcl,
      patterns: ['^(wow|amazing|incredible|fantastic)(!|\\.|$)'],
      keywords: ['wow', 'amazing', 'incredible'],
      confidence: 0.85,
    },
    {
      daType: DiscourseActType.NegativeExcl,
      patterns: ['^(oh no|shit|damn|fuck|crap)(!|\\.|$)'],
      keywords: ['oh no', 'shit', 'damn'],
      confidence: 0.85,
    },
    {
      daType: DiscourseActType.DontUnderstand,
      patterns: ['^(what|huh|i don\'t understand|confused)\\??$'],
      keywords: ['what', 'huh', 'confused'],
      confidence: 0.75,
    },
    {
      daType: DiscourseActType.Misc,
      patterns: ['.*'],
      keywords: [],
      confidence: 0.3,
    },
  ];

  console.log(`[Phase 3] Created ${patterns.length} DA patterns`);
  return patterns;
}

// ============================================================================
// MAIN CONVERSION
// ============================================================================

async function convertFacadeData() {
  console.log('='.repeat(70));
  console.log('FACADE DATA CONVERSION SCRIPT');
  console.log('='.repeat(70));
  console.log('');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`[Setup] Created output directory: ${OUTPUT_DIR}`);
  }

  const beats = extractBeats();
  const initialState = extractInitialState();
  const discourseActPatterns = createDiscourseActPatterns();

  const dataBundle = {
    version: '1.0.0',
    beats,
    initialState,
    discourseActPatterns,
    characterBehaviors: [],

    totalBeats: beats.length,
    totalDiscourseActTypes: Object.keys(DiscourseActType).length,
    conversionDate: new Date().toISOString(),
  };

  console.log('');
  console.log('[Output] Writing JSON files...');

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'beats.json'),
    JSON.stringify(beats, null, 2)
  );
  console.log(`  ✓ beats.json (${beats.length} beats)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'initialState.json'),
    JSON.stringify(initialState, null, 2)
  );
  console.log(`  ✓ initialState.json`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'discourseActPatterns.json'),
    JSON.stringify(discourseActPatterns, null, 2)
  );
  console.log(`  ✓ discourseActPatterns.json (${discourseActPatterns.length} patterns)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'facade-data-bundle.json'),
    JSON.stringify(dataBundle, null, 2)
  );
  console.log(`  ✓ facade-data-bundle.json (complete bundle)`);

  console.log('');
  console.log('='.repeat(70));
  console.log('CONVERSION COMPLETE');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Total beats extracted: ${beats.length}`);
  console.log(`Total DA patterns: ${discourseActPatterns.length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('');
  console.log('Next step: Implement the Facade runtime engine (Phase 2)');
}

convertFacadeData().catch((error) => {
  console.error('[ERROR] Conversion failed:', error);
  process.exit(1);
});
