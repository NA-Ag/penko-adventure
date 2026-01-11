/**
 * Parser Integration Test
 *
 * Tests StandardModeParser with content pack vocabulary
 */

import { StandardModeParser, createParserFromContentPack } from '../services/parser';
import { loadContentPack, validateContentPack } from '../services/contentPackService';
import { CommunityEngineV3 } from '../services/CommunityEngineV3';
import { Language, UserProfile } from '../types';

// Mock user profile for testing
const testProfile: UserProfile = {
  targetLanguage: Language.SPANISH,
  nativeLanguage: Language.ENGLISH,
  geminiApiKey: '',
  gameMode: 'offline',
};

async function testContentPackLoading() {
  console.log('🧪 Test 1: Loading Content Pack');

  try {
    const contentPack = await loadContentPack('/content-packs/fantasy_tavern_es_001.json');
    console.log('✅ Content pack loaded successfully');
    console.log(`   Title: ${contentPack.metadata.title}`);
    console.log(`   Language: ${contentPack.metadata.language}`);
    console.log(`   Locations: ${contentPack.world.locations.length}`);
    console.log(`   Entities: ${contentPack.world.entities.length}`);
    console.log(`   Items: ${contentPack.world.items.length}`);

    return contentPack;
  } catch (error) {
    console.error('❌ Failed to load content pack:', error);
    return null;
  }
}

async function testContentPackValidation(contentPack: any) {
  console.log('\n🧪 Test 2: Validating Content Pack');

  const validation = validateContentPack(contentPack);

  if (validation.valid) {
    console.log('✅ Content pack is valid');
  } else {
    console.log('❌ Content pack has errors:');
    validation.errors.forEach(err => {
      console.log(`   - ${err.path}: ${err.message}`);
    });
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warn => {
      console.log(`   - ${warn.path}: ${warn.message}`);
    });
  }

  return validation.valid;
}

async function testParserCreation(contentPack: any) {
  console.log('\n🧪 Test 3: Creating Parser from Content Pack');

  try {
    const parser = createParserFromContentPack(
      contentPack,
      testProfile,
      'tavern_main'
    );

    console.log('✅ Parser created successfully');
    console.log(`   Has custom vocabulary: ${parser.hasCustomVerb('hablar')}`);
    console.log(`   Custom verb "hablar" intent: ${parser.getCustomVerbIntent('hablar')}`);
    console.log(`   Custom noun "taberna" exists: ${parser.hasCustomNoun('taberna')}`);

    return parser;
  } catch (error) {
    console.error('❌ Failed to create parser:', error);
    return null;
  }
}

async function testParserParsing(parser: StandardModeParser) {
  console.log('\n🧪 Test 4: Parsing Commands');

  const testCommands = [
    'hablar con el tabernero',
    'mirar alrededor',
    'ir norte',
    'tomar el pan',
    'examinar la taberna',
  ];

  for (const command of testCommands) {
    try {
      const result = await parser.parseWithContentPack(command, Language.SPANISH);
      console.log(`\n   Input: "${command}"`);
      console.log(`   ✅ Intent: ${result.intent || 'UNKNOWN'}`);
      console.log(`   ✅ Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   ✅ Direction: ${result.direction || 'N/A'}`);
      console.log(`   ✅ Custom vocab used: ${result.contentPackContext?.customVocabUsed || false}`);

      if (result.contentPackContext?.suggestions?.length) {
        console.log(`   💡 Suggestions: ${result.contentPackContext.suggestions.join(', ')}`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to parse "${command}":`, error);
    }
  }
}

async function testVocabularyMerging(parser: StandardModeParser) {
  console.log('\n🧪 Test 5: Vocabulary Merging');

  try {
    const merged = parser.getMergedVocabulary(Language.SPANISH);
    console.log(`✅ Merged vocabulary:`);
    console.log(`   Verbs: ${merged.verbs.length} (includes base + custom)`);
    console.log(`   Nouns: ${merged.nouns.length}`);
    console.log(`   Adjectives: ${merged.adjectives.length}`);

    // Show some examples
    console.log(`   Example verbs: ${merged.verbs.slice(0, 5).join(', ')}`);
    console.log(`   Example nouns: ${merged.nouns.slice(0, 5).join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to merge vocabulary:', error);
  }
}

async function testEngineInitialization(contentPack: any) {
  console.log('\n🧪 Test 6: Engine Initialization');

  try {
    const engine = new CommunityEngineV3(contentPack, testProfile);
    const initialTurn = await engine.initGame();

    console.log('✅ Engine initialized successfully');
    console.log(`   Location: ${initialTurn.locationName}`);
    console.log(`   Biome: ${initialTurn.sceneData.biome}`);
    console.log(`   Time: ${initialTurn.sceneData.timeOfDay}`);
    console.log(`   Health: ${initialTurn.health}`);
    console.log(`   Entities: ${initialTurn.sceneData.entities.length}`);
    console.log(`   Features: ${initialTurn.sceneData.features.length}`);
    console.log(`\n   Narrative:\n   ${initialTurn.narrative}`);
    console.log(`\n   Player Options:`);
    initialTurn.playerOptions.forEach((opt, i) => {
      console.log(`   ${i + 1}. ${opt}`);
    });

    return engine;
  } catch (error) {
    console.error('❌ Failed to initialize engine:', error);
    return null;
  }
}

async function testEngineGameplay(engine: CommunityEngineV3) {
  console.log('\n🧪 Test 7: Engine Gameplay');

  const testInputs = [
    'mirar alrededor',
    'hablar con el tabernero',
    'ir norte',
    'tomar el pan',
  ];

  for (const input of testInputs) {
    try {
      console.log(`\n   Player: "${input}"`);
      const turn = await engine.processTurn(input);
      console.log(`   ✅ Response: ${turn.narrative.substring(0, 100)}...`);
      console.log(`   ✅ Location: ${turn.locationName}`);
      console.log(`   ✅ Health: ${turn.health}`);
      console.log(`   ✅ Inventory: ${turn.inventory.length} items`);

      if (turn.feedback) {
        console.log(`   💬 Feedback: ${turn.feedback}`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to process "${input}":`, error);
    }
  }
}

async function testStatistics(engine: CommunityEngineV3) {
  console.log('\n🧪 Test 8: Statistics Tracking');

  try {
    const stats = engine.getStatistics();
    console.log('✅ Statistics:');
    stats.forEach(stat => {
      const progress = stat.targetValue
        ? ` (${stat.value}/${stat.targetValue})`
        : `: ${stat.value}`;
      console.log(`   ${stat.displayName}${progress}`);
    });
  } catch (error) {
    console.error('❌ Failed to get statistics:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Parser Integration Tests\n');
  console.log('═'.repeat(60));

  const contentPack = await testContentPackLoading();
  if (!contentPack) {
    console.log('\n❌ Cannot continue without content pack');
    return;
  }

  const isValid = await testContentPackValidation(contentPack);
  if (!isValid) {
    console.log('\n⚠️  Continuing with invalid content pack (for testing)');
  }

  const parser = await testParserCreation(contentPack);
  if (!parser) {
    console.log('\n❌ Cannot continue without parser');
    return;
  }

  await testParserParsing(parser);
  await testVocabularyMerging(parser);

  const engine = await testEngineInitialization(contentPack);
  if (!engine) {
    console.log('\n❌ Cannot continue without engine');
    return;
  }

  await testEngineGameplay(engine);
  await testStatistics(engine);

  console.log('\n' + '═'.repeat(60));
  console.log('✅ All tests completed!\n');
}

// Export for use in other test files
export {
  testContentPackLoading,
  testContentPackValidation,
  testParserCreation,
  testParserParsing,
  testVocabularyMerging,
  testEngineInitialization,
  testEngineGameplay,
  testStatistics,
  runAllTests,
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('Parser integration tests available. Call runAllTests() to execute.');
}
