/**
 * Integrated Lookup Service
 *
 * This service combines MorphologyEngine and DictionaryService to provide
 * complete word lookups with morphological analysis.
 *
 * Pipeline:
 * 1. Input word (e.g., "comiendo")
 * 2. MorphologyEngine finds base form (e.g., "comer")
 * 3. DictionaryService looks up base form in layered dictionaries
 * 4. Return complete result with object ID, part-of-speech, and morphology info
 *
 * Use cases:
 * - Player types: "examiner le manoir" (examine the manor)
 * - "examiner" → base form "examiner" (verb)
 * - "manoir" → ID_MANOR (noun, from content pack dictionary)
 * - NLU can now understand intent: EXAMINE + target: ID_MANOR
 */

import { Language } from '../types';
import { MorphologyEngine } from './morphology/MorphologyEngine';
import { DictionaryService, DictionaryEntry, PartOfSpeech } from './DictionaryService';

export interface IntegratedLookupResult {
  word: string; // Original word
  baseForm: string | null; // Base form (infinitive/singular)
  partOfSpeech: PartOfSpeech;
  objectId: string | null; // Language-agnostic object ID (if found)
  source: 'content_pack' | 'core' | 'external' | 'morphology' | 'not_found';
  isMorphologicalVariant: boolean; // true if word != baseForm
  definition?: string; // Optional definition from external API
}

export interface IntegratedLookupConfig {
  enableMorphology?: boolean; // Use morphology engine (default: true)
  enableDictionary?: boolean; // Use dictionary service (default: true)
  debugMode?: boolean;
}

export class IntegratedLookupService {
  private morphologyEngine: MorphologyEngine;
  private dictionaryService: DictionaryService;
  private config: IntegratedLookupConfig;

  // Statistics
  private stats = {
    totalLookups: 0,
    morphologyHits: 0,
    dictionaryHits: 0,
    notFound: 0,
  };

  constructor(
    morphologyEngine: MorphologyEngine,
    dictionaryService: DictionaryService,
    config: IntegratedLookupConfig = {}
  ) {
    this.morphologyEngine = morphologyEngine;
    this.dictionaryService = dictionaryService;

    this.config = {
      enableMorphology: config.enableMorphology ?? true,
      enableDictionary: config.enableDictionary ?? true,
      debugMode: config.debugMode ?? false,
    };

    console.log('[IntegratedLookupService] Initialized');
    console.log(`[IntegratedLookupService] Morphology: ${this.config.enableMorphology}`);
    console.log(`[IntegratedLookupService] Dictionary: ${this.config.enableDictionary}`);
  }

  // ============================================================================
  // MAIN LOOKUP METHOD
  // ============================================================================

  /**
   * Perform integrated lookup: morphology + dictionary
   *
   * @param word - The word to look up
   * @param language - The language of the word
   * @returns Complete lookup result with morphology and dictionary data
   */
  async lookupWord(word: string, language: Language): Promise<IntegratedLookupResult> {
    this.stats.totalLookups++;

    const normalizedWord = word.toLowerCase().trim();

    if (this.config.debugMode) {
      console.log(`[IntegratedLookupService] Looking up: "${normalizedWord}"`);
    }

    // Step 1: Try to find base form using morphology
    let baseForm: string | null = null;
    let isMorphologicalVariant = false;

    if (this.config.enableMorphology) {
      baseForm = this.morphologyEngine.getBaseForm(normalizedWord, language);

      if (baseForm && baseForm !== normalizedWord) {
        isMorphologicalVariant = true;
        this.stats.morphologyHits++;

        if (this.config.debugMode) {
          console.log(
            `[IntegratedLookupService] Morphology: "${normalizedWord}" → "${baseForm}"`
          );
        }
      }
    }

    // If no base form found, treat the word itself as the base form
    if (!baseForm) {
      baseForm = normalizedWord;
    }

    // Step 2: Look up the base form in dictionary
    if (this.config.enableDictionary) {
      const dictionaryEntry = await this.dictionaryService.lookupWord(baseForm, language);

      if (dictionaryEntry.source !== 'not_found') {
        this.stats.dictionaryHits++;

        if (this.config.debugMode) {
          console.log(
            `[IntegratedLookupService] Dictionary: "${baseForm}" → ${dictionaryEntry.objectId || dictionaryEntry.partOfSpeech}`
          );
        }

        return {
          word: normalizedWord,
          baseForm,
          partOfSpeech: dictionaryEntry.partOfSpeech,
          objectId: dictionaryEntry.objectId,
          source: dictionaryEntry.source,
          isMorphologicalVariant,
          definition: dictionaryEntry.definition,
        };
      }
    }

    // Step 3: Not found in dictionary - but we might have morphology info
    if (isMorphologicalVariant) {
      // We know it's a valid word form, just not in our dictionaries
      if (this.config.debugMode) {
        console.log(
          `[IntegratedLookupService] Found morphological variant but no dictionary entry`
        );
      }

      return {
        word: normalizedWord,
        baseForm,
        partOfSpeech: 'unknown',
        objectId: null,
        source: 'morphology',
        isMorphologicalVariant: true,
      };
    }

    // Step 4: Not found anywhere
    this.stats.notFound++;

    if (this.config.debugMode) {
      console.log(`[IntegratedLookupService] Not found: "${normalizedWord}"`);
    }

    return {
      word: normalizedWord,
      baseForm: null,
      partOfSpeech: 'unknown',
      objectId: null,
      source: 'not_found',
      isMorphologicalVariant: false,
    };
  }

  /**
   * Batch lookup multiple words (optimized)
   */
  async lookupWords(
    words: string[],
    language: Language
  ): Promise<IntegratedLookupResult[]> {
    return Promise.all(words.map((word) => this.lookupWord(word, language)));
  }

  /**
   * Parse a sentence and look up all content words
   * Skips common function words (articles, prepositions, etc.)
   */
  async parseSentence(sentence: string, language: Language): Promise<{
    words: string[];
    lookups: IntegratedLookupResult[];
    objects: Array<{ objectId: string; word: string; baseForm: string }>;
  }> {
    // Tokenize sentence
    const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    // Look up all words
    const lookups = await this.lookupWords(words, language);

    // Extract objects that were found
    const objects: Array<{ objectId: string; word: string; baseForm: string }> = [];
    for (const lookup of lookups) {
      if (lookup.objectId) {
        objects.push({
          objectId: lookup.objectId,
          word: lookup.word,
          baseForm: lookup.baseForm || lookup.word,
        });
      }
    }

    if (this.config.debugMode) {
      console.log(`[IntegratedLookupService] Sentence parsed: ${objects.length} objects found`);
      for (const obj of objects) {
        console.log(`  - ${obj.word} (${obj.baseForm}) → ${obj.objectId}`);
      }
    }

    return { words, lookups, objects };
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get lookup statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalLookups: 0,
      morphologyHits: 0,
      dictionaryHits: 0,
      notFound: 0,
    };
  }

  /**
   * Debug: Print current state
   */
  debugPrintState(): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('INTEGRATED LOOKUP SERVICE STATE');
    console.log('='.repeat(70));
    console.log(`Morphology enabled: ${this.config.enableMorphology}`);
    console.log(`Dictionary enabled: ${this.config.enableDictionary}`);
    console.log('');
    console.log('STATISTICS:');
    console.log(`  Total lookups: ${this.stats.totalLookups}`);
    console.log(`  Morphology hits: ${this.stats.morphologyHits}`);
    console.log(`  Dictionary hits: ${this.stats.dictionaryHits}`);
    console.log(`  Not found: ${this.stats.notFound}`);
    console.log('');

    if (this.stats.totalLookups > 0) {
      const morphologyRate = (this.stats.morphologyHits / this.stats.totalLookups) * 100;
      const dictionaryRate = (this.stats.dictionaryHits / this.stats.totalLookups) * 100;
      const notFoundRate = (this.stats.notFound / this.stats.totalLookups) * 100;

      console.log('HIT RATES:');
      console.log(`  Morphology: ${morphologyRate.toFixed(1)}%`);
      console.log(`  Dictionary: ${dictionaryRate.toFixed(1)}%`);
      console.log(`  Not found: ${notFoundRate.toFixed(1)}%`);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('');
  }
}
