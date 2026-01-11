/**
 * StandardModeParser - Enhanced parser for Community Mode
 *
 * Extends SmartParser with content pack vocabulary integration.
 * Merges custom vocabulary from content packs with base GRAMMAR database.
 */

import { SmartParser, ParseResult } from './SmartParser';
import { VERB_DB, GRAMMAR } from './data/languageData';
import { ENTITY_DB } from './data/worldData';
import { Language, UserProfile } from '../../types';
import type { Vocabulary, Intent } from '../contentPackService';
import type { VocabularySet, IntentPhraseMap, IntentVocabularySet } from '../../types/ContentPack';
import { loadBinaryMorphology } from '../browser/BinaryDictionaryLoader';
import { loadBinaryUniversalVocabulary } from '../browser/BinaryIntentLoader';
import { SemanticExpander } from '../semantic/SemanticExpander';  // FACADE 1.2: Semantic expansion
import intentMetadata from '../../data/intents/intent_metadata.json';  // FACADE 1.3: Priority-based matching

// Import all binary morphology files using Vite's glob import
// TIER 12: Uses optimized .pbm.gz format for 83% size reduction
const morphologyModules = import.meta.glob('../../src/assets/morphology-bin/*.pbm.gz', {
    eager: false,
    query: '?url',
    import: 'default'
}) as Record<string, () => Promise<string>>;

// Import universal intent vocabulary (TIER 15: Binary compressed Façade-inspired intents)
// Uses optimized .pbu.gz format for 63.3% size reduction (11.8 KB → 4.3 KB)
const vocabularyModules = import.meta.glob('../../src/assets/intents-bin/*.pbu.gz', {
    eager: false,
    query: '?url',
    import: 'default'
}) as Record<string, () => Promise<string>>;

export interface EnhancedParseResult extends ParseResult {
  // Additional context for content packs
  contentPackContext?: {
    customVocabUsed: boolean;
    recognizedEntity?: string;
    recognizedLocation?: string;
    suggestions?: string[];
  };
}

export interface ContentPackContext {
  entity?: string[];
  feature?: string[];
  location?: string;
  availableLocations?: string[];
  availableEntities?: string[];
}

/**
 * Morphology data structure
 */
interface MorphologyData {
  verbs: {
    [infinitive: string]: {
      infinitive: string;
      gerund?: string;
      participle?: string;
      present?: string[];
      preterite?: string[];
      imperfect?: string[];
      future?: string[];
      conditional?: string[];
      subjunctive_present?: string[];
      subjunctive_imperfect?: string[];
      imperative?: string[];
    };
  };
}

/**
 * StandardModeParser extends SmartParser with content pack vocabulary
 */
export class StandardModeParser extends SmartParser {
  private customVocabulary: Vocabulary | null = null;
  private contentPackContext: ContentPackContext | null = null;
  private intentVocabulary: VocabularySet | null = null;
  private morphologyData: MorphologyData | null = null;
  private morphologyCache: Map<string, string> = new Map(); // Cache: conjugated form -> infinitive
  private semanticExpander: any | null = null;  // FACADE 1.2: Semantic expansion for synonym matching
  private currentLanguage: Language = Language.ENGLISH;  // FACADE 1.2/1.3: Track current language

  // Language code mapping
  private static readonly LANG_CODES: Record<Language, string> = {
    [Language.ENGLISH]: 'en',
    [Language.SPANISH]: 'es',
    [Language.FRENCH]: 'fr',
    [Language.GERMAN]: 'de',
    [Language.ITALIAN]: 'it',
    [Language.JAPANESE]: 'ja',
    [Language.MANDARIN]: 'zh',
    [Language.RUSSIAN]: 'ru',
    [Language.PORTUGUESE]: 'pt',
    [Language.UKRAINIAN]: 'uk',
    [Language.POLISH]: 'pl',
    [Language.CZECH]: 'cs'
  };

  // Morphology file name mapping
  private static readonly MORPHOLOGY_FILES: Record<Language, string> = {
    [Language.ENGLISH]: 'english',
    [Language.SPANISH]: 'spanish',
    [Language.FRENCH]: 'french',
    [Language.GERMAN]: 'german',
    [Language.ITALIAN]: 'italian',
    [Language.JAPANESE]: 'japanese',
    [Language.MANDARIN]: 'mandarin',
    [Language.RUSSIAN]: 'russian',
    [Language.PORTUGUESE]: 'portuguese',
    [Language.UKRAINIAN]: 'ukrainian',
    [Language.POLISH]: 'polish',
    [Language.CZECH]: 'czech'
  };

  constructor(
    context: { entity?: string; feature?: string } | null,
    useAPI: boolean,
    profile: UserProfile,
    customVocabulary?: Vocabulary,
    contentPackContext?: ContentPackContext,
    intentVocabulary?: VocabularySet
  ) {
    // Ensure context has both entity and feature for parent constructor
    const normalizedContext = context ? { entity: context.entity || '', feature: context.feature || '' } : { entity: '', feature: '' };
    super(normalizedContext, useAPI, profile);
    this.customVocabulary = customVocabulary || null;
    this.contentPackContext = contentPackContext || null;
    this.intentVocabulary = intentVocabulary || null;

    // TIER 15: Load universal intent vocabulary (Binary compressed)
    // This loads automatically and works for ALL content packs in ALL 12 languages
    this.loadUniversalVocabulary();

    // Load morphology data for target language
    this.loadMorphologyData(profile.targetLanguage);
  }

  /**
   * Load morphology data for the target language
   * TIER 12: Uses msgpack + gzip format for 83% size reduction
   */
  private async loadMorphologyData(language: Language): Promise<void> {
    // FACADE 1.2/1.3: Store current language for use in other methods
    this.currentLanguage = language;

    const fileName = StandardModeParser.MORPHOLOGY_FILES[language];
    if (!fileName) {
      console.warn(`[StandardModeParser] No morphology file for language: ${language}`);
      return;
    }

    try {
      // Find the binary morphology file in the glob imports
      const modulePath = `../../src/assets/morphology-bin/${fileName}.pbm.gz`;
      const fileUrlLoader = morphologyModules[modulePath];

      if (!fileUrlLoader) {
        console.warn(`[StandardModeParser] Morphology file not found: ${modulePath}`);
        return;
      }

      // Get the file URL
      const fileUrl = await fileUrlLoader();

      // Fetch the binary file
      const response = await fetch(fileUrl);
      if (!response.ok) {
        console.warn(`[StandardModeParser] Failed to fetch morphology for ${language}`);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();

      // Parse binary format (msgpack + gzip)
      this.morphologyData = await loadBinaryMorphology(arrayBuffer);
      this.buildMorphologyCache();
      console.log(`[StandardModeParser] Loaded morphology data for ${language}`);
    } catch (error) {
      console.warn(`[StandardModeParser] Error loading morphology: ${error}`);
    }
  }

  /**
   * Build a reverse lookup cache: conjugated form -> infinitive
   */
  private buildMorphologyCache(): void {
    if (!this.morphologyData) return;

    this.morphologyCache.clear();

    for (const [infinitive, conjugations] of Object.entries(this.morphologyData.verbs)) {
      // Map all conjugated forms to their infinitive
      const allForms: string[] = [
        infinitive,
        conjugations.gerund || '',
        conjugations.participle || '',
        ...(conjugations.present || []),
        ...(conjugations.preterite || []),
        ...(conjugations.imperfect || []),
        ...(conjugations.future || []),
        ...(conjugations.conditional || []),
        ...(conjugations.subjunctive_present || []),
        ...(conjugations.subjunctive_imperfect || []),
        ...(conjugations.imperative || [])
      ];

      for (const form of allForms) {
        if (form && form.trim()) {
          this.morphologyCache.set(form.toLowerCase(), infinitive);
        }
      }
    }

    console.log(`[StandardModeParser] Morphology cache built: ${this.morphologyCache.size} forms`);

    // FACADE 1.2: Initialize semantic expander for this language
    if (!this.semanticExpander) {
      this.semanticExpander = new SemanticExpander(this.currentLanguage);
      console.log(`[StandardModeParser] FACADE 1.2: Semantic expander initialized for language ${this.currentLanguage}`);
    }
  }

  /**
   * Load universal intent vocabulary (TIER 15: Binary compressed Façade-inspired)
   * This vocabulary works for ALL content packs across ALL 12 languages
   * No need to define verbs in each content pack anymore!
   * Now using binary format for 63.3% size reduction!
   */
  private async loadUniversalVocabulary(): Promise<void> {
    try {
      // Get the vocabulary module path
      const modulePath = Object.keys(vocabularyModules).find(path =>
        path.includes('universal_vocabulary.pbu.gz')
      );

      if (!modulePath) {
        console.warn('[StandardModeParser] Binary vocabulary not found, this is expected in dev mode');
        return;
      }

      // Load the binary file
      const urlLoader = vocabularyModules[modulePath];
      const url = await urlLoader();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Parse binary data
      const vocabulary = await loadBinaryUniversalVocabulary(arrayBuffer);

      // TIER 16 FIX: Transform vocabulary structure from Intent→Language to Language→Intent
      // Input format:  { "LOOK_AROUND": { "fr": [...], "es": [...] } }
      // Output format: { "fr": { "LOOK_AROUND": [...] }, "es": { "LOOK_AROUND": [...] } }
      const transformedIntents = this.transformVocabularyStructure(vocabulary);

      // Convert to VocabularySet format
      this.intentVocabulary = {
        intents: transformedIntents
      };

      console.log('[StandardModeParser] ✅ Universal intent vocabulary loaded (Tier 15 - Binary)');
      console.log('[StandardModeParser] Binary format: 11.8 KB → 4.3 KB (63.3% reduction)');
      console.log('[StandardModeParser] All game intents now work in all 12 languages automatically!');
      console.log('[StandardModeParser] Vocabulary structure transformed: Intent→Lang to Lang→Intent');
    } catch (error) {
      console.error('[StandardModeParser] Failed to load universal vocabulary:', error);
      throw error;
    }
  }

  /**
   * TIER 16 FIX: Transform vocabulary structure from Intent→Language to Language→Intent
   *
   * The universal_vocabulary.json file is structured as:
   * { "LOOK_AROUND": { "fr": [...], "es": [...] }, "TAKE": { "fr": [...] } }
   *
   * But the parser expects:
   * { "fr": { "LOOK_AROUND": [...], "TAKE": [...] }, "es": { "LOOK_AROUND": [...] } }
   *
   * This transformation makes lookups by language code O(1) instead of O(n*m)
   */
  private transformVocabularyStructure(vocabulary: any): IntentVocabularySet {
    const transformed: IntentVocabularySet = {};

    // Iterate over each intent (LOOK_AROUND, TAKE, etc.)
    for (const [intent, langMap] of Object.entries(vocabulary)) {
      // Skip if langMap is not an object
      if (typeof langMap !== 'object' || langMap === null) {
        console.warn(`[StandardModeParser] Skipping invalid intent: ${intent}`);
        continue;
      }

      // Iterate over each language in this intent
      for (const [lang, phrases] of Object.entries(langMap as Record<string, any>)) {
        // Initialize language object if it doesn't exist
        if (!transformed[lang]) {
          transformed[lang] = {};
        }

        // Add this intent's phrases to the language's intent map
        transformed[lang][intent] = phrases as string[];
      }
    }

    // Log transformation result for debugging
    const langCount = Object.keys(transformed).length;
    const intentCount = Object.keys(vocabulary).length;
    console.log(`[StandardModeParser] Transformed ${intentCount} intents across ${langCount} languages`);

    return transformed;
  }

  /**
   * TIER 1.3: Calculate Levenshtein distance between two strings (fuzzy matching)
   * Used for typo tolerance and similarity scoring
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * TIER 1.3: Calculate similarity score between two strings (0.0 to 1.0)
   * Uses Levenshtein distance normalized by string length
   */
  private calculateSimilarity(input: string, template: string): number {
    const maxLen = Math.max(input.length, template.length);
    if (maxLen === 0) return 1.0;

    const distance = this.levenshteinDistance(input, template);
    return 1.0 - (distance / maxLen);
  }

  /**
   * TIER 1.3: Fuzzy phrase matching with confidence scoring
   * Handles variations, typos, and partial matches
   *
   * Returns best match score considering:
   * - Exact word matches
   * - Partial word matches (substring)
   * - Fuzzy matches (Levenshtein distance)
   * - Word order preservation
   */
  private fuzzyMatchPhrase(input: string, template: string): number {
    const inputWords = input.toLowerCase().split(/\s+/);
    const templateWords = template.toLowerCase().split(/\s+/);

    // Exact match = perfect score
    if (input.toLowerCase() === template.toLowerCase()) {
      return 1.0;
    }

    // Calculate word-level matching
    let matchedWords = 0;
    let fuzzyMatchScore = 0;

    for (const templateWord of templateWords) {
      let bestWordMatch = 0;

      for (const inputWord of inputWords) {
        // Exact word match
        if (inputWord === templateWord) {
          bestWordMatch = 1.0;
          break;
        }

        // Partial match (one contains the other)
        if (inputWord.includes(templateWord) || templateWord.includes(inputWord)) {
          bestWordMatch = Math.max(bestWordMatch, 0.8);
        }

        // Fuzzy match (typo tolerance)
        const similarity = this.calculateSimilarity(inputWord, templateWord);
        if (similarity >= 0.7) {
          bestWordMatch = Math.max(bestWordMatch, similarity * 0.9);
        }
      }

      if (bestWordMatch > 0.5) {
        matchedWords++;
        fuzzyMatchScore += bestWordMatch;
      }
    }

    // Calculate confidence based on coverage
    const coverage = matchedWords / templateWords.length;
    const avgMatchQuality = matchedWords > 0 ? fuzzyMatchScore / matchedWords : 0;

    return coverage * avgMatchQuality;
  }

  /**
   * FACADE 1.3: Get priority score for an intent
   * Higher priority intents beat lower priority ones when confidence is similar
   */
  private getIntentPriority(intent: string): number {
    const metadata = (intentMetadata as any).intents[intent];
    return metadata?.priority || 50; // Default to MEDIUM priority
  }

  /**
   * FACADE 1.3: Calculate specificity score based on input and intent requirements
   * More specific intents (requiring targets) score higher when targets are present
   */
  private calculateSpecificity(intent: string, input: string, hasTarget: boolean): number {
    const metadata = (intentMetadata as any).intents[intent];

    if (!metadata) return 0.5; // Default specificity

    // Base specificity from metadata
    let specificity = 0.5;
    if (metadata.specificity === 'high') specificity = 0.9;
    else if (metadata.specificity === 'medium') specificity = 0.6;
    else if (metadata.specificity === 'low') specificity = 0.3;

    // Boost specificity if intent requires target and input has target
    if (metadata.requires_target && hasTarget) {
      specificity = Math.min(1.0, specificity + 0.1);
    }

    // Penalize if intent requires target but input doesn't have one
    if (metadata.requires_target && !hasTarget) {
      specificity *= 0.7;
    }

    // Boost specificity if input is longer (more context = more specific)
    const wordCount = input.split(/\s+/).length;
    if (wordCount > 2) {
      specificity = Math.min(1.0, specificity + (wordCount - 2) * 0.05);
    }

    return specificity;
  }

  /**
   * FACADE 1.3: Calculate composite score combining confidence, priority, and specificity
   * This ensures more specific, higher priority intents win over generic ones
   */
  private calculateCompositeScore(
    confidence: number,
    intent: string,
    input: string,
    hasTarget: boolean
  ): number {
    const priority = this.getIntentPriority(intent);
    const specificity = this.calculateSpecificity(intent, input, hasTarget);

    // Normalize priority to 0-1 range (100 -> 1.0)
    const normalizedPriority = priority / 100;

    // Weighted composite score:
    // - 60% confidence (match quality)
    // - 25% priority (intent importance)
    // - 15% specificity (context appropriateness)
    const composite = (confidence * 0.6) + (normalizedPriority * 0.25) + (specificity * 0.15);

    return composite;
  }

  /**
   * TIER 5: Preprocess Asian language input (Japanese and Mandarin Chinese)
   * Handles:
   * 1. Japanese particles (を、に、で、と、が、は)
   * 2. Chinese measure words and aspect markers
   * 3. SOV word order (Japanese)
   */
  private preprocessAsianLanguage(input: string, lang: Language): string {
    const langCode = StandardModeParser.LANG_CODES[lang];
    let processed = input.toLowerCase().trim();

    if (langCode === 'ja') {
      // TIER 5.1: Japanese particle handling
      // Remove particles to get core words for matching
      // を (wo) - direct object marker
      // に (ni) - location/direction/indirect object
      // で (de) - location of action/means
      // と (to) - "with" / quotation
      // が (ga) - subject marker
      // は (wa) - topic marker
      // へ (e) - direction marker

      const particles = ['を', 'に', 'で', 'と', 'が', 'は', 'へ', 'の', 'から', 'まで', 'や', 'か'];

      for (const particle of particles) {
        const before = processed;
        processed = processed.replace(new RegExp(particle, 'g'), ' ');

        if (processed !== before) {
          console.log(`[StandardModeParser] TIER 5: Stripped Japanese particle "${particle}"`);
        }
      }

      // Normalize whitespace
      processed = processed.replace(/\s+/g, ' ').trim();

    } else if (langCode === 'zh') {
      // TIER 5.2: Chinese preprocessing
      // Remove common measure words (量词)
      const measureWords = ['个', '只', '本', '条', '张', '把', '件', '位', '台', '辆', '座'];

      for (const measure of measureWords) {
        processed = processed.replace(new RegExp(measure, 'g'), '');
      }

      // Remove aspect markers
      // 了 (le) - completed action
      // 过 (guo) - past experience
      // 着 (zhe) - ongoing action
      const aspectMarkers = ['了', '过', '着'];

      for (const marker of aspectMarkers) {
        const before = processed;
        processed = processed.replace(new RegExp(marker, 'g'), '');

        if (processed !== before) {
          console.log(`[StandardModeParser] TIER 5: Stripped Chinese aspect marker "${marker}"`);
        }
      }

      // Remove common question particles
      processed = processed.replace(/吗/g, '');
      processed = processed.replace(/呢/g, '');

      // Normalize spacing (Chinese doesn't use spaces, but our system might have added some)
      processed = processed.replace(/\s+/g, '');
    }

    return processed;
  }

  /**
   * TIER 4: Preprocess Slavic language input (Russian, Ukrainian, Polish, Czech)
   * Handles:
   * 1. Reflexive suffixes/particles - Russian: -ся/-сь, Polish: się, Czech: se
   * 2. Case system normalization
   * 3. Aspect pair handling
   */
  private preprocessSlavicLanguage(input: string, lang: Language): string {
    const langCode = StandardModeParser.LANG_CODES[lang];
    let processed = input.toLowerCase().trim();

    // TIER 4.1: Handle reflexive markers
    if (langCode === 'ru' || langCode === 'uk') {
      // Russian/Ukrainian: Strip reflexive suffixes -ся and -сь from verbs
      // "подойти" vs "подойтись" or "приближаюсь" vs "приближаю"
      const words = processed.split(/\s+/);
      const processedWords = words.map(word => {
        // Remove reflexive suffixes
        if (word.endsWith('ся') || word.endsWith('сь')) {
          const stripped = word.replace(/(ся|сь)$/, '');
          console.log(`[StandardModeParser] TIER 4: Stripped Russian reflexive: "${word}" → "${stripped}"`);
          return stripped;
        }
        return word;
      });
      processed = processedWords.join(' ');
    } else if (langCode === 'pl') {
      // Polish: Remove reflexive particle "się"
      const regex = /\bsię\b/g;
      const before = processed;
      processed = processed.replace(regex, '').trim().replace(/\s+/g, ' ');

      if (processed !== before) {
        console.log(`[StandardModeParser] TIER 4: Stripped Polish reflexive "się"`);
      }
    } else if (langCode === 'cs') {
      // Czech: Remove reflexive particle "se" or "si"
      const regex = /\b(se|si)\b/g;
      const before = processed;
      processed = processed.replace(regex, '').trim().replace(/\s+/g, ' ');

      if (processed !== before) {
        console.log(`[StandardModeParser] TIER 4: Stripped Czech reflexive "se/si"`);
      }
    }

    // TIER 4.2: Normalize case endings for common nouns
    // This is a simplified approach - full case handling would require extensive morphology
    // For now, we strip common case markers to help matching

    if (langCode === 'ru' || langCode === 'uk') {
      // Common Russian/Ukrainian case endings that can be normalized
      // Accusative/Genitive/Dative/Instrumental/Prepositional markers
      // This is very simplified but helps with basic matching

      // Note: We're NOT doing this for all words as it would break morphology
      // Only doing it for specific patterns that commonly cause issues
    }

    return processed;
  }

  /**
   * TIER 3: Preprocess Germanic language input (German)
   * Handles:
   * 1. Separable verbs - "nehme...mit" → "mitnehmen"
   * 2. Reflexive pronouns - "mich", "dich", "sich"
   * 3. Case declensions - normalize articles
   */
  private preprocessGermanicLanguage(input: string): string {
    let processed = input.toLowerCase().trim();

    // TIER 3.1: Strip reflexive pronouns
    const reflexivePronouns = ['mich', 'dich', 'sich', 'uns', 'euch'];
    for (const pronoun of reflexivePronouns) {
      const regex = new RegExp(`(^|\\s)${pronoun}\\s+`, 'g');
      const before = processed;
      processed = processed.replace(regex, '$1');

      if (processed !== before) {
        console.log(`[StandardModeParser] TIER 3: Stripped German reflexive "${pronoun}"`);
      }
    }

    // TIER 3.2: Normalize case articles to nominative
    // This helps match templates that use nominative forms
    processed = processed.replace(/\bden\b/g, 'der'); // accusative masc → nominative
    processed = processed.replace(/\bdem\b/g, 'der'); // dative masc → nominative
    processed = processed.replace(/\bdes\b/g, 'der'); // genitive masc → nominative

    // TIER 3.3: Handle common separable verb prefixes
    // Look for pattern: verb + ... + prefix
    // Example: "ich nehme das Buch mit" → should match "mitnehmen"
    const separablePrefixes = ['ab', 'an', 'auf', 'aus', 'bei', 'ein', 'mit', 'nach', 'vor', 'zu', 'zurück'];

    const words = processed.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (separablePrefixes.includes(lastWord) && words.length >= 2) {
      // Try to find a verb in the sentence
      // Common verb forms: -e, -st, -t, -en (present tense)
      const verbIndex = words.findIndex(word =>
        /[a-z]+(e|st|t|en)$/.test(word) &&
        !['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'eines'].includes(word)
      );

      if (verbIndex !== -1) {
        const verb = words[verbIndex];
        const prefix = lastWord;
        const combined = prefix + verb;

        console.log(`[StandardModeParser] TIER 3: Detected separable verb "${verb}" + "${prefix}" → "${combined}"`);

        // Replace the verb with the combined form and remove the prefix
        words[verbIndex] = combined;
        words.splice(words.length - 1, 1); // Remove prefix from end

        processed = words.join(' ');
      }
    }

    return processed;
  }

  /**
   * TIER 2: Preprocess Romance language input (Spanish, French, Italian, Portuguese)
   * Handles:
   * 1. Reflexive pronouns (me, te, se, nos, os) - strip and note presence
   * 2. Article contractions (al, del, du, nel, etc.) - expand for matching
   * 3. Clitic pronouns - separate from verbs
   */
  private preprocessRomanceLanguage(input: string, lang: Language): string {
    const langCode = StandardModeParser.LANG_CODES[lang];
    let processed = input.toLowerCase().trim();

    // TIER 2.1: Handle reflexive pronouns (Spanish, French, Italian, Portuguese)
    // "me acerco al mago" → "acerco al mago" (strip reflexive pronoun)
    if (['es', 'fr', 'it', 'pt'].includes(langCode)) {
      // Spanish: me/te/se/nos/os
      // French: me/te/se/nous/vous
      // Italian: mi/ti/si/ci/vi
      // Portuguese: me/te/se/nos/vos
      const reflexivePronouns = {
        'es': ['me', 'te', 'se', 'nos', 'os'],
        'fr': ['me', 'te', 'se', 'nous', 'vous', "m'", "t'", "s'"],
        'it': ['mi', 'ti', 'si', 'ci', 'vi'],
        'pt': ['me', 'te', 'se', 'nos', 'vos']
      };

      const pronouns = reflexivePronouns[langCode as 'es' | 'fr' | 'it' | 'pt'] || [];

      for (const pronoun of pronouns) {
        // Match pronoun at start of sentence or after whitespace
        const regex = new RegExp(`(^|\\s)${pronoun}\\s+`, 'g');
        const before = processed;
        processed = processed.replace(regex, '$1');

        if (processed !== before) {
          console.log(`[StandardModeParser] TIER 2: Stripped reflexive "${pronoun}" from "${before}"`);
        }
      }
    }

    // TIER 2.2: Expand article contractions
    if (langCode === 'es') {
      // Spanish: al = a + el, del = de + el
      processed = processed.replace(/\bal\b/g, 'a el');
      processed = processed.replace(/\bdel\b/g, 'de el');
    } else if (langCode === 'fr') {
      // French: au = à + le, aux = à + les, du = de + le, des = de + les
      processed = processed.replace(/\bau\b/g, 'à le');
      processed = processed.replace(/\baux\b/g, 'à les');
      processed = processed.replace(/\bdu\b/g, 'de le');
      processed = processed.replace(/\bdes\b/g, 'de les');
    } else if (langCode === 'it') {
      // Italian: al = a + il, del = di + il, nel = in + il, sul = su + il
      processed = processed.replace(/\bal\b/g, 'a il');
      processed = processed.replace(/\bdel\b/g, 'di il');
      processed = processed.replace(/\bnel\b/g, 'in il');
      processed = processed.replace(/\bsul\b/g, 'su il');
      processed = processed.replace(/\bdal\b/g, 'da il');
      // Plural forms
      processed = processed.replace(/\bai\b/g, 'a i');
      processed = processed.replace(/\bdei\b/g, 'di i');
      processed = processed.replace(/\bnei\b/g, 'in i');
      processed = processed.replace(/\bsui\b/g, 'su i');
      processed = processed.replace(/\bdai\b/g, 'da i');
    } else if (langCode === 'pt') {
      // Portuguese: ao = a + o, do = de + o, no = em + o, pelo = por + o
      processed = processed.replace(/\bao\b/g, 'a o');
      processed = processed.replace(/\bdo\b/g, 'de o');
      processed = processed.replace(/\bno\b/g, 'em o');
      processed = processed.replace(/\bpelo\b/g, 'por o');
      // Plural forms
      processed = processed.replace(/\baos\b/g, 'a os');
      processed = processed.replace(/\bdos\b/g, 'de os');
      processed = processed.replace(/\bnos\b/g, 'em os');
      processed = processed.replace(/\bpelos\b/g, 'por os');
    }

    if (processed !== input.toLowerCase().trim()) {
      console.log(`[StandardModeParser] TIER 2: Preprocessed Romance "${input}" → "${processed}"`);
    }

    return processed;
  }

  /**
   * Lemmatize input: convert conjugated verbs to their infinitive forms
   *
   * Example: "je prends la pomme" -> "prendre la pomme"
   */
  private lemmatizeInput(input: string): string {
    if (!this.morphologyCache || this.morphologyCache.size === 0) {
      return input; // No morphology data available
    }

    const words = input.toLowerCase().split(/\s+/);
    const lemmatizedWords = words.map(word => {
      // Check if this word is a known conjugated form
      const infinitive = this.morphologyCache.get(word);
      return infinitive || word; // Use infinitive if found, otherwise keep original
    });

    const result = lemmatizedWords.join(' ');

    if (result !== input.toLowerCase()) {
      console.log(`[StandardModeParser] Lemmatized: "${input}" -> "${result}"`);
    }

    return result;
  }

  /**
   * Parse player input with content pack vocabulary integration
   *
   * NEW: Supports intent-based vocabulary from content packs (Phase 3.2)
   * Prioritizes intent-based matching over legacy verb lookups
   */
  async parseWithContentPack(
    input: string,
    lang: Language
  ): Promise<EnhancedParseResult> {
    const normalizedInput = input.toLowerCase().trim();

    // NEW: Try intent-based parsing first if available
    if (this.intentVocabulary?.intents) {
      const intentResult = this.parseWithIntentVocabulary(normalizedInput, lang);
      if (intentResult) {
        return intentResult;
      }
    }

    // LEGACY: Fall back to old vocabulary system
    // First, use base SmartParser
    const baseResult = await this.parse(input, lang);

    // Enhance with content pack context
    const enhancedResult: EnhancedParseResult = {
      ...baseResult,
      contentPackContext: {
        customVocabUsed: false,
        suggestions: [],
      },
    };

    // If we have custom vocabulary, check if any custom words were used
    if (this.customVocabulary) {
      const words = normalizedInput.split(/\s+/);

      // Check if any custom verbs were used
      for (const word of words) {
        if (this.customVocabulary.verbs?.[word]) {
          enhancedResult.contentPackContext!.customVocabUsed = true;
          // Override intent if custom verb has different mapping
          const customIntent = this.customVocabulary.verbs[word].intent;
          if (customIntent && !baseResult.intent) {
            enhancedResult.intent = customIntent;
            enhancedResult.confidence = 0.85; // High confidence for exact custom vocab match
          }
        }

        // Check for custom nouns (entities, locations)
        if (this.customVocabulary.nouns?.[word]) {
          enhancedResult.contentPackContext!.customVocabUsed = true;
        }
      }

      // Try to match entities from content pack context
      if (this.contentPackContext?.availableEntities) {
        for (const entityId of this.contentPackContext.availableEntities) {
          const entityName = this.getEntityName(entityId, lang);
          if (entityName && normalizedInput.includes(entityName.toLowerCase())) {
            enhancedResult.contentPackContext!.recognizedEntity = entityId;
            break;
          }
        }
      }

      // Try to match locations from content pack context
      if (this.contentPackContext?.availableLocations) {
        for (const locationName of this.contentPackContext.availableLocations) {
          if (normalizedInput.includes(locationName.toLowerCase())) {
            enhancedResult.contentPackContext!.recognizedLocation = locationName;
            break;
          }
        }
      }
    }

    // Generate suggestions if confidence is low
    if (enhancedResult.confidence < 0.7 && this.customVocabulary) {
      enhancedResult.contentPackContext!.suggestions = this.generateSuggestions(
        input,
        lang
      );
    }

    return enhancedResult;
  }

  /**
   * NEW: Parse input using intent-based vocabulary (Phase 3.2 + 4.2)
   *
   * This is the new "Facade" - it maps native language phrases
   * directly to abstract game intents without any English translation.
   *
   * Phase 4.2: Now includes lemmatization support!
   * - Converts conjugated verbs to infinitives before matching
   * - Dramatically increases input flexibility
   */
  private parseWithIntentVocabulary(
    input: string,
    lang: Language
  ): EnhancedParseResult | null {
    if (!this.intentVocabulary?.intents) {
      console.warn('[StandardModeParser] No intentVocabulary loaded');
      return null;
    }

    const langCode = StandardModeParser.LANG_CODES[lang];
    const intentMap: IntentPhraseMap | undefined = this.intentVocabulary.intents[langCode];

    if (!intentMap) {
      // TIER 16 FIX: Add detailed logging for debugging
      const availableLangs = Object.keys(this.intentVocabulary.intents);
      console.warn(`[StandardModeParser] No intent vocabulary for language: ${langCode}`);
      console.warn(`[StandardModeParser] Available languages: ${availableLangs.join(', ')}`);
      console.warn(`[StandardModeParser] Input was: "${input}"`);
      return null;
    }

    // TIER 16: Log successful vocabulary access
    const intentCount = Object.keys(intentMap).length;
    console.log(`[StandardModeParser] Parsing "${input}" with ${intentCount} intents for ${langCode}`);

    // TIER 2: Preprocess Romance languages (Spanish, French, Italian, Portuguese)
    // TIER 3: Preprocess Germanic languages (German)
    // TIER 4: Preprocess Slavic languages (Russian, Ukrainian, Polish, Czech)
    // TIER 5: Preprocess Asian languages (Japanese, Mandarin Chinese)
    // Handles language-specific features: reflexive pronouns, article contractions, separable verbs,
    // case declensions, reflexive suffixes, particles, measure words, and aspect markers
    let preprocessed = input;
    if (['es', 'fr', 'it', 'pt'].includes(langCode)) {
      preprocessed = this.preprocessRomanceLanguage(input, lang);
    } else if (langCode === 'de') {
      preprocessed = this.preprocessGermanicLanguage(input);
    } else if (['ru', 'uk', 'pl', 'cs'].includes(langCode)) {
      preprocessed = this.preprocessSlavicLanguage(input, lang);
    } else if (['ja', 'zh'].includes(langCode)) {
      preprocessed = this.preprocessAsianLanguage(input, lang);
    }

    // NEW (Phase 4.2): Lemmatize the input before matching
    // This converts "je prends" -> "prendre", "tu vas" -> "aller", etc.
    const lemmatizedInput = this.lemmatizeInput(preprocessed);

    // FACADE 1.2: Semantic normalization - replace synonyms with canonical forms
    // Example: "grab the sword" -> "take the sword"
    let semanticallyNormalizedInput = lemmatizedInput;
    if (this.semanticExpander) {
      semanticallyNormalizedInput = this.semanticExpander.normalize(lemmatizedInput);
      if (semanticallyNormalizedInput !== lemmatizedInput) {
        console.log(`[StandardModeParser] FACADE 1.2: Semantic normalization "${lemmatizedInput}" → "${semanticallyNormalizedInput}"`);
      }
    }

    // FACADE 1.3: Check if input has a target (for specificity scoring)
    const hasTarget = semanticallyNormalizedInput.split(/\s+/).length > 1;

    // Try to match input against all known phrases for all intents
    // FACADE 1.3: Now tracks composite score for priority-based matching
    let bestMatch: {
      intent: string;
      confidence: number;
      compositeScore: number;  // FACADE 1.3
      matchedPhrase?: string;
    } | null = null;

    for (const [intent, phrases] of Object.entries(intentMap)) {
      for (const phrase of phrases) {
        const normalizedPhrase = phrase.toLowerCase().trim();
        // Also lemmatize the phrase for fair comparison
        const lemmatizedPhrase = this.lemmatizeInput(normalizedPhrase);

        // Exact match on lemmatized forms - highest confidence
        if (lemmatizedInput === lemmatizedPhrase) {
          const compositeScore = this.calculateCompositeScore(1.0, intent, input, hasTarget);
          bestMatch = { intent, confidence: 1.0, compositeScore, matchedPhrase: lemmatizedPhrase };
          break;
        }

        // FACADE 1.2: Exact match on semantically normalized input
        if (semanticallyNormalizedInput === lemmatizedPhrase) {
          const compositeScore = this.calculateCompositeScore(1.0, intent, input, hasTarget);
          bestMatch = { intent, confidence: 1.0, compositeScore, matchedPhrase: lemmatizedPhrase };
          console.log(`[StandardModeParser] FACADE 1.2: Semantic exact match for intent "${intent}"`);
          break;
        }

        // Also try original input (in case lemmatization isn't needed)
        if (input === normalizedPhrase) {
          const compositeScore = this.calculateCompositeScore(1.0, intent, input, hasTarget);
          bestMatch = { intent, confidence: 1.0, compositeScore, matchedPhrase: normalizedPhrase };
          break;
        }

        // TIER 1.3: Fuzzy phrase matching with confidence scoring
        // Use fuzzy matcher to handle variations, typos, and partial matches
        const fuzzyScore = this.fuzzyMatchPhrase(lemmatizedInput, lemmatizedPhrase);

        if (fuzzyScore > 0.5) {
          // FACADE 1.3: Calculate composite score for priority-based matching
          const compositeScore = this.calculateCompositeScore(fuzzyScore, intent, input, hasTarget);

          // Compare using composite score (not just confidence)
          if (!bestMatch || compositeScore > bestMatch.compositeScore) {
            bestMatch = { intent, confidence: fuzzyScore, compositeScore, matchedPhrase: lemmatizedPhrase };
            console.log(`[StandardModeParser] TIER 1.3: Fuzzy match "${input}" → "${lemmatizedPhrase}" (${intent}, confidence: ${fuzzyScore.toFixed(2)}, composite: ${compositeScore.toFixed(2)})`);
          }
        }

        // FACADE 1.2: Semantic fuzzy matching on normalized input
        if (this.semanticExpander && semanticallyNormalizedInput !== lemmatizedInput) {
          const semanticFuzzyScore = this.fuzzyMatchPhrase(semanticallyNormalizedInput, lemmatizedPhrase);

          if (semanticFuzzyScore > 0.5) {
            // Boost confidence slightly for semantic matches (they're higher quality)
            const boostedScore = Math.min(1.0, semanticFuzzyScore + 0.05);

            // FACADE 1.3: Calculate composite score
            const compositeScore = this.calculateCompositeScore(boostedScore, intent, input, hasTarget);

            if (!bestMatch || compositeScore > bestMatch.compositeScore) {
              bestMatch = { intent, confidence: boostedScore, compositeScore, matchedPhrase: lemmatizedPhrase };
              console.log(`[StandardModeParser] FACADE 1.2: Semantic fuzzy match "${input}" → "${lemmatizedPhrase}" (${intent}, confidence: ${boostedScore.toFixed(2)}, composite: ${compositeScore.toFixed(2)})`);
            }
          }
        }

        // TIER 16 FIX: Word-boundary matching for better intent recognition (legacy fallback)
        // Check if the phrase appears as a complete word (not substring)
        const lemmatizedWords = lemmatizedInput.split(/\s+/);
        const phraseWords = lemmatizedPhrase.split(/\s+/);

        // Check if ALL words from phrase appear in input (in order)
        let phraseIndex = 0;
        for (const inputWord of lemmatizedWords) {
          if (phraseIndex < phraseWords.length && inputWord === phraseWords[phraseIndex]) {
            phraseIndex++;
          }
        }

        if (phraseIndex === phraseWords.length) {
          // All phrase words found in order
          const confidence = phraseWords.length / lemmatizedWords.length;

          // FACADE 1.3: Calculate composite score
          const compositeScore = this.calculateCompositeScore(confidence, intent, input, hasTarget);

          if (!bestMatch || compositeScore > bestMatch.compositeScore) {
            bestMatch = { intent, confidence, compositeScore, matchedPhrase: lemmatizedPhrase };
          }
        }

        // FACADE 1.2: Semantic word-boundary matching
        // Check if words match semantically (synonyms, hypernyms, etc.)
        if (this.semanticExpander) {
          const semanticWords = semanticallyNormalizedInput.split(/\s+/);
          let semanticPhraseIndex = 0;

          for (const semanticWord of semanticWords) {
            if (semanticPhraseIndex < phraseWords.length) {
              // Try exact match first
              if (semanticWord === phraseWords[semanticPhraseIndex]) {
                semanticPhraseIndex++;
              } else {
                // Try semantic match (for verbs primarily)
                const semanticScore = this.semanticExpander.matchWord(semanticWord, phraseWords[semanticPhraseIndex], 'verb');
                if (semanticScore >= 0.85) {
                  semanticPhraseIndex++;
                }
              }
            }
          }

          if (semanticPhraseIndex === phraseWords.length) {
            // All phrase words matched semantically
            const semanticConfidence = (phraseWords.length / semanticWords.length) * 0.95; // Slightly lower than exact

            // FACADE 1.3: Calculate composite score
            const compositeScore = this.calculateCompositeScore(semanticConfidence, intent, input, hasTarget);

            if (!bestMatch || compositeScore > bestMatch.compositeScore) {
              bestMatch = { intent, confidence: semanticConfidence, compositeScore, matchedPhrase: lemmatizedPhrase };
              console.log(`[StandardModeParser] FACADE 1.2: Semantic word-boundary match for intent "${intent}" (confidence: ${semanticConfidence.toFixed(2)}, composite: ${compositeScore.toFixed(2)})`);
            }
          }
        }
      }

      if (bestMatch?.confidence === 1.0) break; // Early exit on exact match
    }

    if (bestMatch && bestMatch.confidence >= 0.6) {
      // TIER 18 ENHANCEMENT: Extract target entity from input
      // Remove the matched intent phrase to get the remaining text (the target)
      // Example: "j'approche le vieux magicien" - "approche" = "le vieux magicien"
      let targetEntity: string | null = null;
      const matchedPhrase = bestMatch.matchedPhrase;

      if (matchedPhrase) {
        // Remove the intent phrase from input to isolate the target
        const normalizedInput = input.toLowerCase().trim();
        const phraseStart = normalizedInput.indexOf(matchedPhrase);

        if (phraseStart !== -1) {
          // Extract everything after the matched phrase
          let remaining = normalizedInput.substring(phraseStart + matchedPhrase.length).trim();

          // Remove common articles and prepositions (le, la, les, l', à, etc.)
          remaining = remaining
            .replace(/^(le|la|les|l'|un|une|des|du|de|à|au|aux)\s+/i, '')
            .trim();

          if (remaining.length > 0) {
            targetEntity = remaining;
          }
        }
      }

      // Successfully matched an intent!
      return {
        intent: bestMatch.intent,
        confidence: bestMatch.confidence,
        contentPackContext: {
          customVocabUsed: true,
          recognizedEntity: targetEntity || undefined,
          suggestions: [],
        },
      };
    }

    // No match found
    return null;
  }

  /**
   * Get entity name in target language
   */
  private getEntityName(entityId: string, lang: Language): string | null {
    // Check ENTITY_DB first
    if (ENTITY_DB[entityId]?.[lang]) {
      return ENTITY_DB[entityId][lang];
    }

    // Check custom vocabulary nouns
    if (this.customVocabulary?.nouns[entityId]) {
      return entityId; // Use the key itself as the name
    }

    return null;
  }

  /**
   * Generate suggestions based on custom vocabulary
   */
  private generateSuggestions(input: string, lang: Language): string[] {
    if (!this.customVocabulary) return [];

    const suggestions: string[] = [];
    const normalizedInput = input.toLowerCase();

    // Suggest verbs if no clear intent
    const customVerbs = Object.keys(this.customVocabulary.verbs);
    for (const verb of customVerbs.slice(0, 3)) {
      if (!normalizedInput.includes(verb)) {
        suggestions.push(verb);
      }
    }

    // Suggest entities from context
    if (this.contentPackContext?.availableEntities) {
      for (const entityId of this.contentPackContext.availableEntities.slice(0, 2)) {
        const entityName = this.getEntityName(entityId, lang);
        if (entityName) {
          suggestions.push(entityName);
        }
      }
    }

    return suggestions.slice(0, 5); // Max 5 suggestions
  }

  /**
   * Check if a verb exists in custom vocabulary
   */
  hasCustomVerb(word: string): boolean {
    return this.customVocabulary?.verbs[word.toLowerCase()] !== undefined;
  }

  /**
   * Get intent for custom verb
   */
  getCustomVerbIntent(word: string): Intent | null {
    return this.customVocabulary?.verbs[word.toLowerCase()]?.intent || null;
  }

  /**
   * Get synonyms for a custom verb
   */
  getCustomVerbSynonyms(word: string): string[] {
    return this.customVocabulary?.verbs[word.toLowerCase()]?.synonyms || [];
  }

  /**
   * Check if a noun exists in custom vocabulary
   */
  hasCustomNoun(word: string): boolean {
    return this.customVocabulary?.nouns[word.toLowerCase()] !== undefined;
  }

  /**
   * Get gender for custom noun
   */
  getCustomNounGender(word: string): 'M' | 'F' | 'N' | null {
    return this.customVocabulary?.nouns[word.toLowerCase()]?.gender || null;
  }

  /**
   * Merge custom vocabulary with base GRAMMAR for comprehensive coverage
   */
  getMergedVocabulary(lang: Language): {
    verbs: string[];
    nouns: string[];
    adjectives: string[];
  } {
    const merged = {
      verbs: [] as string[],
      nouns: [] as string[],
      adjectives: [] as string[],
    };

    // Add base GRAMMAR verbs from VERB_DB
    Object.values(VERB_DB).forEach((intentVerbs) => {
      if (intentVerbs[lang]) {
        merged.verbs.push(...intentVerbs[lang]);
      }
    });

    // Add custom verbs
    if (this.customVocabulary) {
      merged.verbs.push(...Object.keys(this.customVocabulary.verbs));
      merged.nouns.push(...Object.keys(this.customVocabulary.nouns));
      merged.adjectives.push(...Object.keys(this.customVocabulary.adjectives));
    }

    // Remove duplicates
    merged.verbs = [...new Set(merged.verbs)];
    merged.nouns = [...new Set(merged.nouns)];
    merged.adjectives = [...new Set(merged.adjectives)];

    return merged;
  }

  /**
   * Validate if input uses vocabulary from content pack
   */
  validateAgainstContentPack(input: string, lang: Language): {
    valid: boolean;
    unknownWords: string[];
    recognizedWords: string[];
  } {
    const words = input.toLowerCase().split(/\s+/);
    const mergedVocab = this.getMergedVocabulary(lang);
    const allWords = [
      ...mergedVocab.verbs,
      ...mergedVocab.nouns,
      ...mergedVocab.adjectives,
    ];

    const unknownWords: string[] = [];
    const recognizedWords: string[] = [];

    for (const word of words) {
      // Skip common articles, prepositions, etc.
      if (this.isStopWord(word, lang)) {
        continue;
      }

      if (allWords.includes(word)) {
        recognizedWords.push(word);
      } else {
        unknownWords.push(word);
      }
    }

    return {
      valid: unknownWords.length === 0,
      unknownWords,
      recognizedWords,
    };
  }

  /**
   * Check if word is a stop word (article, preposition, etc.)
   */
  private isStopWord(word: string, lang: Language): boolean {
    const stopWords: Record<Language, string[]> = {
      [Language.ENGLISH]: ['the', 'a', 'an', 'to', 'in', 'on', 'at', 'with', 'from'],
      [Language.SPANISH]: ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'al', 'en', 'con', 'por', 'para'],
      [Language.FRENCH]: ['le', 'la', 'les', 'un', 'une', 'de', 'du', 'à', 'au', 'en', 'dans', 'avec', 'pour'],
      [Language.GERMAN]: ['der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'zu', 'in', 'mit', 'von', 'für'],
      [Language.ITALIAN]: ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'di', 'del', 'al', 'in', 'con', 'per'],
      [Language.JAPANESE]: ['の', 'に', 'を', 'は', 'が', 'で', 'と', 'から', 'まで'],
      [Language.MANDARIN]: ['的', '了', '在', '是', '我', '有', '和', '人', '这'],
      [Language.RUSSIAN]: ['и', 'в', 'не', 'на', 'я', 'быть', 'он', 'с', 'как', 'а', 'то', 'все'],
      [Language.PORTUGUESE]: ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'em', 'no', 'na', 'com', 'para'],
      [Language.UKRAINIAN]: ['і', 'в', 'не', 'на', 'з', 'до', 'за', 'у', 'що', 'як', 'та'],
      [Language.POLISH]: ['i', 'w', 'na', 'z', 'do', 'o', 'nie', 'że', 'się', 'jak', 'od'],
      [Language.CZECH]: ['a', 'v', 'na', 'z', 'do', 'o', 'se', 'že', 'k', 'od', 'pro'],
    };

    return stopWords[lang]?.includes(word) || false;
  }

  /**
   * Get all available verbs for a specific intent in current context
   */
  getVerbsForIntent(intent: Intent, lang: Language): string[] {
    const verbs: string[] = [];

    // Add base VERB_DB verbs
    if (VERB_DB[intent]?.[lang]) {
      verbs.push(...VERB_DB[intent][lang]);
    }

    // Add custom verbs for this intent
    if (this.customVocabulary) {
      Object.entries(this.customVocabulary.verbs).forEach(([verb, entry]) => {
        if (entry.intent === intent) {
          verbs.push(verb);
          // Add synonyms too
          if (entry.synonyms) {
            verbs.push(...entry.synonyms);
          }
        }
      });
    }

    return [...new Set(verbs)]; // Remove duplicates
  }

  /**
   * Get educational feedback for content pack context
   */
  getEducationalFeedback(
    input: string,
    result: EnhancedParseResult,
    lang: Language
  ): string | null {
    if (!this.customVocabulary) return null;

    // If custom vocabulary was used, provide positive feedback
    if (result.contentPackContext?.customVocabUsed) {
      const vocab = this.getMergedVocabulary(lang);
      const usedWords = input.toLowerCase().split(/\s+/).filter(w =>
        vocab.verbs.includes(w) || vocab.nouns.includes(w)
      );

      if (usedWords.length > 0) {
        return `Great! You used vocabulary from this adventure: ${usedWords.join(', ')}`;
      }
    }

    // If confidence is low, suggest alternatives
    if (result.confidence < 0.6 && result.contentPackContext?.suggestions?.length) {
      return `Try using: ${result.contentPackContext.suggestions.join(', ')}`;
    }

    // If unknown words detected
    const validation = this.validateAgainstContentPack(input, lang);
    if (validation.unknownWords.length > 0) {
      return `Unknown words: ${validation.unknownWords.join(', ')}. Check the vocabulary for this adventure.`;
    }

    return null;
  }
}

/**
 * Factory function to create StandardModeParser from content pack
 */
export function createParserFromContentPack(
  contentPack: {
    metadata: { language: Language };
    vocabulary: Vocabulary;
    world: {
      locations: Array<{ id: string; name: string; entities: string[] }>;
      entities: Array<{ id: string; name: string }>;
    };
  },
  userProfile: UserProfile,
  currentLocation?: string
): StandardModeParser {
  // Build context from current location
  const context: ContentPackContext = {
    availableLocations: contentPack.world.locations.map((l) => l.name),
    availableEntities: contentPack.world.entities.map((e) => e.id),
  };

  // If we have a current location, get entities there
  if (currentLocation) {
    const location = contentPack.world.locations.find(
      (l) => l.id === currentLocation
    );
    if (location) {
      context.entity = location.entities;
      context.location = currentLocation;
    }
  }

  return new StandardModeParser(
    null,
    false, // Don't use API for Standard Mode
    userProfile,
    contentPack.vocabulary,
    context
  );
}
