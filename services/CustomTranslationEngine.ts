/**
 * CustomTranslationEngine - High-quality dictionary-based translation
 *
 * Goal: Match Gemini translation quality for Browser AI mode
 * Strategy: StarDict dictionaries + grammar rules + context awareness
 *
 * Features:
 * - Word-level dictionary lookup (95%+ coverage)
 * - Sentence tokenization and parsing
 * - Grammar rule application (articles, gender, word order)
 * - Translation memory for consistency
 * - CEFR-aware word selection
 * - Entity preservation (game-specific terms)
 */

import { Language } from '../types';
import { DictionaryManager } from './browser/DictionaryManager';
import { DEBUG, MODEL_CONFIG, PERFORMANCE } from '../config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TranslationOptions {
  sourceLanguage?: Language;        // Source language (defaults to English)
  targetLanguage: Language;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  preserveEntities?: string[];      // Game entities to keep untranslated
  useGrammarRules?: boolean;        // Apply grammar corrections
  maintainFormatting?: boolean;     // Preserve capitalization, punctuation
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  wordsCovered: number;             // Number of words found in dictionary
  totalWords: number;               // Total words in text
  coveragePercent: number;          // Coverage percentage
  tokensUsed: number;               // For performance tracking
  error?: string;                   // User-friendly error message
  dictionaryMissing?: boolean;      // Flag indicating dictionary is unavailable
}

interface Token {
  type: 'word' | 'punctuation' | 'whitespace' | 'entity';
  original: string;
  translation?: string;
  isCapitalized?: boolean;
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'article' | 'pronoun' | 'preposition';
  gender?: 'masculine' | 'feminine' | 'neuter';
}

interface TranslationMemoryEntry {
  source: string;
  target: string;
  frequency: number;
  lastUsed: number;
}

// ============================================================================
// MAIN TRANSLATION ENGINE
// ============================================================================

export class CustomTranslationEngine {
  private dictManager: DictionaryManager;
  private translationMemory: Map<string, TranslationMemoryEntry> = new Map();
  private entityPatterns: RegExp[] = [];
  private initialized = false;

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

  constructor() {
    this.dictManager = DictionaryManager.getInstance();
    this.loadTranslationMemory();
  }

  /**
   * Initialize the translation engine
   * DictionaryManager loads binary dictionaries on-demand
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize the dictionary manager
    await this.dictManager.init();

    if (DEBUG.TRANSLATION) console.log('[CustomTranslationEngine] Initializing (dictionaries load on-demand)...');
    this.initialized = true;
    if (DEBUG.TRANSLATION) console.log('[CustomTranslationEngine] Ready');
  }

  /**
   * Translate text from English to target language
   * This is the main public API
   */
  async translateText(
    text: string,
    options: TranslationOptions
  ): Promise<TranslationResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = performance.now();
    if (DEBUG.TRANSLATION) console.log('[CustomTranslationEngine] Translating:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      targetLanguage: options.targetLanguage,
      cefrLevel: options.cefrLevel
    });

    try {
      // Step 1: Tokenize the text
      const tokens = this.tokenize(text, options);
      if (DEBUG.TRANSLATION) console.log(`[CustomTranslationEngine] Tokenized into ${tokens.length} tokens`);

      // Step 2: Translate each token
      const translatedTokens = await this.translateTokens(tokens, options);

      // Step 3: Apply grammar rules (if enabled)
      const grammarCorrected = options.useGrammarRules !== false
        ? this.applyGrammarRules(translatedTokens, options.targetLanguage)
        : translatedTokens;

      // Step 4: Reassemble into final text
      const translatedText = this.reassemble(grammarCorrected, options);

      // Step 5: Calculate statistics
      const wordTokens = tokens.filter(t => t.type === 'word');
      const translatedWords = translatedTokens.filter(t => t.type === 'word' && t.translation).length;

      const result: TranslationResult = {
        originalText: text,
        translatedText,
        wordsCovered: translatedWords,
        totalWords: wordTokens.length,
        coveragePercent: wordTokens.length > 0 ? (translatedWords / wordTokens.length) * 100 : 0,
        tokensUsed: Date.now() - startTime
      };

      if (DEBUG.TRANSLATION) console.log('[CustomTranslationEngine] Result:', {
        coverage: `${result.coveragePercent.toFixed(1)}%`,
        time: `${result.tokensUsed}ms`
      });

      return result;

    } catch (error) {
      if (DEBUG.ERRORS) console.error('[CustomTranslationEngine] Translation failed:', error);

      // Check if this is a dictionary missing error
      const isDictionaryError = error instanceof Error && error.message.includes('Dictionary for');

      // Fallback: return original text with error info
      return {
        originalText: text,
        translatedText: text,
        wordsCovered: 0,
        totalWords: 0,
        coveragePercent: 0,
        tokensUsed: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Translation failed',
        dictionaryMissing: isDictionaryError
      };
    }
  }

  // ============================================================================
  // TOKENIZATION
  // ============================================================================

  /**
   * Tokenize text into words, punctuation, whitespace
   */
  private tokenize(text: string, options: TranslationOptions): Token[] {
    const tokens: Token[] = [];

    // Regex to match: words (with optional apostrophes), punctuation, whitespace
    const tokenRegex = /(\w+(?:'\w+)?)|([^\w\s])|(\s+)/g;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const [fullMatch, word, punct, space] = match;

      if (word) {
        // Check if this word is a preserved entity
        const isEntity = options.preserveEntities?.some(entity =>
          word.toLowerCase() === entity.toLowerCase()
        );

        tokens.push({
          type: isEntity ? 'entity' : 'word',
          original: word,
          isCapitalized: word[0] === word[0].toUpperCase()
        });
      } else if (punct) {
        tokens.push({
          type: 'punctuation',
          original: punct
        });
      } else if (space) {
        tokens.push({
          type: 'whitespace',
          original: space
        });
      }
    }

    return tokens;
  }

  // ============================================================================
  // TRANSLATION
  // ============================================================================

  /**
   * Translate array of tokens using dictionary lookup
   * TIER 16: Now supports pivot translation via English (fr→en→pt)
   */
  private async translateTokens(
    tokens: Token[],
    options: TranslationOptions
  ): Promise<Token[]> {
    const sourceLanguage = options.sourceLanguage || Language.ENGLISH;

    // TIER 16 FIX: Check if direct translation is possible
    const needsPivot = !this.canTranslateDirectly(sourceLanguage, options.targetLanguage);

    if (needsPivot) {
      // Pivot translation: source → English → target
      console.warn(`[CustomTranslationEngine] No direct ${sourceLanguage}→${options.targetLanguage} dictionary`);
      console.warn(`[CustomTranslationEngine] Using pivot translation via English`);
      console.warn(`[CustomTranslationEngine] Note: Pivot translation may be less accurate than direct translation`);

      // Step 1: Translate to English
      const englishTokens = await this.translateTokensDirect(tokens, sourceLanguage, Language.ENGLISH);

      // Step 2: Update 'original' field for second translation step
      // The translated English text becomes the new "original" for the next step
      const englishAsSource = englishTokens.map(token => ({
        ...token,
        original: token.translation || token.original,
        translation: undefined // Reset translation for next step
      }));

      // Step 3: Translate from English to target
      return await this.translateTokensDirect(englishAsSource, Language.ENGLISH, options.targetLanguage);
    } else {
      // Direct translation
      return await this.translateTokensDirect(tokens, sourceLanguage, options.targetLanguage);
    }
  }

  /**
   * Check if direct translation is possible (no pivot needed)
   */
  private canTranslateDirectly(from: Language, to: Language): boolean {
    const fromCode = CustomTranslationEngine.LANG_CODES[from];
    const toCode = CustomTranslationEngine.LANG_CODES[to];

    // Direct translation only available if one language is English
    return fromCode === 'en' || toCode === 'en';
  }

  /**
   * Perform direct dictionary-based translation (no pivot)
   */
  private async translateTokensDirect(
    tokens: Token[],
    sourceLanguage: Language,
    targetLanguage: Language
  ): Promise<Token[]> {
    const langPair = this.getLangPair(sourceLanguage, targetLanguage);

    // Load dictionary directly from bundled files (no IndexedDB download needed)
    try {
      await this.dictManager.loadDictionary(langPair);
      if (DEBUG.TRANSLATION) console.log(`[CustomTranslationEngine] Dictionary ${langPair} loaded from bundled files`);
    } catch (error) {
      if (DEBUG.ERRORS) console.error(`[CustomTranslationEngine] Failed to load dictionary ${langPair}:`, error);
      if (DEBUG.ERRORS) console.error(`[CustomTranslationEngine] Continuing with untranslated text...`);

      // Throw error with user-friendly message so UI can display it
      throw new Error(`Dictionary for ${this.getLanguageName(targetLanguage)} is not available. Translation cannot be provided.`);
    }

    // Translate each word token
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'word') {
        // Check translation memory first (faster)
        const memoryKey = `${token.original.toLowerCase()}:${langPair}`;
        if (this.translationMemory.has(memoryKey)) {
          const cached = this.translationMemory.get(memoryKey)!;
          token.translation = cached.target;
          cached.frequency++;
          cached.lastUsed = Date.now();
          continue;
        }

        // Dictionary lookup
        try {
          const translations = await this.dictManager.translate(
            token.original,
            sourceLanguage,
            options.targetLanguage
          );

          const translation = translations.length > 0 ? translations[0] : null;

          if (DEBUG.TRANSLATION) console.log(`[Dict] "${token.original}" lookup returned:`, translation);

          if (translation) {
            // Use the translation
            token.translation = translation;

            // Store in memory (with cache eviction if enabled)
            if (PERFORMANCE.ENABLE_CACHE_LIMITS && this.translationMemory.size >= MODEL_CONFIG.TRANSLATION_CACHE_MAX_SIZE) {
              // Evict oldest entry (LRU)
              const oldestKey = Array.from(this.translationMemory.entries())
                .sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0]?.[0];
              if (oldestKey) {
                this.translationMemory.delete(oldestKey);
              }
            }

            this.translationMemory.set(memoryKey, {
              source: token.original,
              target: translation,
              frequency: 1,
              lastUsed: Date.now()
            });

            if (DEBUG.TRANSLATION) console.log(`[Dict] "${token.original}" → "${translation}"`);
          } else {
            // No translation found - keep original (learning opportunity!)
            if (DEBUG.TRANSLATION) console.log(`[Dict] "${token.original}" → [not found]`);
            token.translation = token.original;
          }
        } catch (error) {
          if (DEBUG.TRANSLATION) console.warn(`[Dict] Error translating "${token.original}":`, error);
          token.translation = token.original; // Fallback to original
        }
      } else if (token.type === 'entity') {
        // Entities are preserved as-is
        token.translation = token.original;
      }
    }

    // Save updated translation memory
    this.saveTranslationMemory();

    return tokens;
  }

  /**
   * Get language pair string (e.g., "en-es")
   * TIER 16: Only used for direct translations (one language must be English)
   */
  private getLangPair(from: Language, to: Language): string {
    const fromCode = CustomTranslationEngine.LANG_CODES[from];
    const toCode = CustomTranslationEngine.LANG_CODES[to];

    // Always format as "en-XX" for consistency
    if (fromCode === 'en') {
      return `en-${toCode}`;
    } else if (toCode === 'en') {
      return `${fromCode}-en`;
    } else {
      // This should never happen if canTranslateDirectly() is called first
      throw new Error(`getLangPair() called for non-English pair: ${from}-${to}. Use pivot translation instead.`);
    }
  }

  /**
   * Get human-readable language name
   */
  private getLanguageName(lang: Language): string {
    const names: Record<Language, string> = {
      [Language.ENGLISH]: 'English',
      [Language.SPANISH]: 'Spanish',
      [Language.FRENCH]: 'French',
      [Language.GERMAN]: 'German',
      [Language.ITALIAN]: 'Italian',
      [Language.JAPANESE]: 'Japanese',
      [Language.MANDARIN]: 'Chinese',
      [Language.RUSSIAN]: 'Russian',
      [Language.PORTUGUESE]: 'Portuguese',
      [Language.UKRAINIAN]: 'Ukrainian',
      [Language.POLISH]: 'Polish',
      [Language.CZECH]: 'Czech'
    };
    return names[lang] || 'Unknown';
  }

  // ============================================================================
  // GRAMMAR RULES
  // ============================================================================

  /**
   * Apply language-specific grammar rules
   * This is a placeholder for the full GrammarEngine (Phase 3.2)
   */
  private applyGrammarRules(tokens: Token[], targetLang: Language): Token[] {
    // For now, implement basic article/gender agreement for Spanish/French/Italian

    switch (targetLang) {
      case Language.SPANISH:
        return this.applySpanishGrammar(tokens);
      case Language.FRENCH:
        return this.applyFrenchGrammar(tokens);
      case Language.ITALIAN:
        return this.applyItalianGrammar(tokens);
      case Language.GERMAN:
        return this.applyGermanGrammar(tokens);
      case Language.JAPANESE:
        return this.applyJapaneseGrammar(tokens);
      case Language.RUSSIAN:
        return this.applyRussianGrammar(tokens);
      case Language.UKRAINIAN:
        return this.applyUkrainianGrammar(tokens);
      case Language.POLISH:
        return this.applyPolishGrammar(tokens);
      default:
        return tokens; // No grammar rules yet
    }
  }

  /**
   * Spanish grammar: Basic article/gender agreement
   */
  private applySpanishGrammar(tokens: Token[]): Token[] {
    // TODO: Implement in Phase 3.2
    // For now, just basic article detection
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];

      // Example: "a" + noun ending in -o → "un"
      // Example: "a" + noun ending in -a → "una"
      if (token.translation?.toLowerCase() === 'a' || token.translation?.toLowerCase() === 'an') {
        if (nextToken.translation) {
          const nextWord = nextToken.translation.toLowerCase();
          if (nextWord.endsWith('o')) {
            token.translation = 'un';
          } else if (nextWord.endsWith('a')) {
            token.translation = 'una';
          } else {
            token.translation = 'un'; // Default masculine
          }
        }
      }
    }
    return tokens;
  }

  /**
   * French grammar: Phrase patterns and basic rules
   */
  private applyFrenchGrammar(tokens: Token[]): Token[] {
    // Common phrase patterns (subject + "is/are" + verb-ing)
    const phrasePatterns: Record<string, string> = {
      'you are': 'vous êtes',
      'you see': 'vous voyez',
      'you find': 'vous trouvez',
      'you enter': 'vous entrez dans',
      'you walk': 'vous marchez',
      'you stand': 'vous vous tenez',
      'you go': 'vous allez',
      'you look': 'vous regardez',
      'you take': 'vous prenez',
      'you open': 'vous ouvrez',
      'there is': 'il y a',
      'there are': 'il y a',
    };

    // Try to match and replace common phrases first
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].type === 'word' && tokens[i + 1]?.type === 'whitespace' && tokens[i + 2]?.type === 'word') {
        const phrase = `${tokens[i].original} ${tokens[i + 2].original}`.toLowerCase();
        if (phrasePatterns[phrase]) {
          tokens[i].translation = phrasePatterns[phrase];
          tokens[i + 1].original = ''; // Remove space
          tokens[i + 2].translation = ''; // Remove second word (already in phrase)
          i += 2; // Skip ahead
        }
      }
    }

    // Basic article agreement
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];

      if (token.translation?.toLowerCase() === 'a' || token.translation?.toLowerCase() === 'an') {
        if (nextToken.translation) {
          const nextWord = nextToken.translation.toLowerCase();
          // Basic heuristic: words ending in 'e' are often feminine
          if (nextWord.endsWith('e') && !nextWord.endsWith('ble')) {
            token.translation = 'une';
          } else {
            token.translation = 'un';
          }
        }
      }

      // Elision: "le/la" + vowel → "l'"
      if (token.translation && ['le', 'la'].includes(token.translation.toLowerCase())) {
        if (nextToken.translation && /^[aeiouàéèêëïîôùû]/i.test(nextToken.translation)) {
          token.translation = "l'";
          if (tokens[i + 1] && tokens[i + 1].type === 'whitespace') {
            tokens[i + 1].original = '';
          }
        }
      }
    }
    return tokens;
  }

  /**
   * Italian grammar: Basic article/gender agreement
   */
  private applyItalianGrammar(tokens: Token[]): Token[] {
    // TODO: Implement in Phase 3.2
    // Similar to Spanish
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];

      if (token.translation?.toLowerCase() === 'a' || token.translation?.toLowerCase() === 'an') {
        if (nextToken.translation) {
          const nextWord = nextToken.translation.toLowerCase();
          if (nextWord.endsWith('o')) {
            token.translation = 'un';
          } else if (nextWord.endsWith('a')) {
            token.translation = 'una';
          } else {
            token.translation = 'un';
          }
        }
      }
    }
    return tokens;
  }

  /**
   * German grammar: Articles, cases, and word order
   *
   * German has:
   * - 3 genders: masculine (m), feminine (f), neuter (n)
   * - 4 cases: nominative (subject), accusative (direct object), dative (indirect object), genitive (possessive)
   * - V2 word order: verb must be second element in main clauses
   */
  private applyGermanGrammar(tokens: Token[]): Token[] {
    // Definite articles (der/die/das system)
    const definitiArticles: Record<string, Record<string, string>> = {
      'the': {
        'nom_m': 'der',
        'nom_f': 'die',
        'nom_n': 'das',
        'nom_pl': 'die',
        'acc_m': 'den',
        'acc_f': 'die',
        'acc_n': 'das',
        'acc_pl': 'die',
        'dat_m': 'dem',
        'dat_f': 'der',
        'dat_n': 'dem',
        'dat_pl': 'den',
        'gen_m': 'des',
        'gen_f': 'der',
        'gen_n': 'des',
        'gen_pl': 'der'
      }
    };

    // Indefinite articles (ein/eine/ein system)
    const indefiniteArticles: Record<string, Record<string, string>> = {
      'a': {
        'nom_m': 'ein',
        'nom_f': 'eine',
        'nom_n': 'ein',
        'acc_m': 'einen',
        'acc_f': 'eine',
        'acc_n': 'ein',
        'dat_m': 'einem',
        'dat_f': 'einer',
        'dat_n': 'einem',
        'gen_m': 'eines',
        'gen_f': 'einer',
        'gen_n': 'eines'
      },
      'an': { // same as 'a'
        'nom_m': 'ein',
        'nom_f': 'eine',
        'nom_n': 'ein',
        'acc_m': 'einen',
        'acc_f': 'eine',
        'acc_n': 'ein',
        'dat_m': 'einem',
        'dat_f': 'einer',
        'dat_n': 'einem',
        'gen_m': 'eines',
        'gen_f': 'einer',
        'gen_n': 'eines'
      }
    };

    // Common German nouns with their genders (for article agreement)
    const nounGenders: Record<string, 'masculine' | 'feminine' | 'neuter'> = {
      // Masculine (-er ending often masculine)
      'mann': 'masculine', 'vater': 'masculine', 'bruder': 'masculine',
      'hund': 'masculine', 'tisch': 'masculine', 'stuhl': 'masculine',
      'baum': 'masculine', 'wagen': 'masculine', 'tag': 'masculine',
      // Feminine (-e, -heit, -keit, -ung endings often feminine)
      'frau': 'feminine', 'mutter': 'feminine', 'schwester': 'feminine',
      'katze': 'feminine', 'blume': 'feminine', 'sonne': 'feminine',
      'freiheit': 'feminine', 'schönheit': 'feminine', 'zeitung': 'feminine',
      // Neuter (-chen, -lein endings always neuter, also -um)
      'kind': 'neuter', 'haus': 'neuter', 'buch': 'neuter',
      'mädchen': 'neuter', 'fenster': 'neuter', 'zimmer': 'neuter',
      'auto': 'neuter', 'tier': 'neuter', 'museum': 'neuter'
    };

    // Verbs that take accusative objects (most transitive verbs)
    const accusativeVerbs = new Set([
      'haben', 'sehen', 'essen', 'trinken', 'kaufen', 'lesen',
      'schreiben', 'machen', 'nehmen', 'finden', 'lieben', 'kennen'
    ]);

    // Verbs that take dative objects
    const dativeVerbs = new Set([
      'helfen', 'geben', 'zeigen', 'sagen', 'danken', 'folgen',
      'gehören', 'passen', 'schmecken', 'gratulieren', 'antworten'
    ]);

    // Prepositions that govern specific cases
    const accusativePreps = new Set([
      'durch', 'für', 'gegen', 'ohne', 'um', 'bis', 'entlang'
    ]);

    const dativePreps = new Set([
      'aus', 'bei', 'mit', 'nach', 'seit', 'von', 'zu',
      'außer', 'gegenüber'
    ]);

    const genitivePreps = new Set([
      'während', 'wegen', 'trotz', 'statt', 'anstatt', 'innerhalb', 'außerhalb'
    ]);

    // Two-way prepositions (accusative for motion, dative for location)
    const twoWayPreps = new Set([
      'an', 'auf', 'hinter', 'in', 'neben', 'über', 'unter', 'vor', 'zwischen'
    ]);

    // Apply article corrections based on context
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];

      if (token.type !== 'word' || !token.translation) continue;

      const articleLower = token.translation.toLowerCase();

      // Check if this is an article followed by a noun
      if ((definitiArticles[articleLower] || indefiniteArticles[articleLower]) &&
          nextToken.type === 'word' && nextToken.translation) {

        const nounLower = nextToken.translation.toLowerCase();
        const gender = nounGenders[nounLower] || 'masculine'; // Default to masculine

        // Determine case based on context
        let grammaticalCase = 'nom'; // Default to nominative

        // Check if preceded by a preposition
        if (i > 0) {
          const prevToken = tokens[i - 1];
          if (prevToken.type === 'word' && prevToken.translation) {
            const prevWord = prevToken.translation.toLowerCase();

            if (accusativePreps.has(prevWord)) {
              grammaticalCase = 'acc';
            } else if (dativePreps.has(prevWord)) {
              grammaticalCase = 'dat';
            } else if (genitivePreps.has(prevWord)) {
              grammaticalCase = 'gen';
            } else if (twoWayPreps.has(prevWord)) {
              // Default to dative for location (more common in A1-B1 usage)
              grammaticalCase = 'dat';
            }
          }
        }

        // Check if following a verb that governs a specific case
        if (i > 1 && grammaticalCase === 'nom') {
          const verbToken = tokens[i - 1];
          if (verbToken.type === 'word' && verbToken.translation) {
            const verb = verbToken.translation.toLowerCase();
            if (accusativeVerbs.has(verb)) {
              grammaticalCase = 'acc';
            } else if (dativeVerbs.has(verb)) {
              grammaticalCase = 'dat';
            }
          }
        }

        // Select correct article form
        const genderKey = gender === 'masculine' ? 'm' : gender === 'feminine' ? 'f' : 'n';
        const caseKey = `${grammaticalCase}_${genderKey}`;

        if (definitiArticles[articleLower]) {
          const correctForm = definitiArticles[articleLower][caseKey];
          if (correctForm) {
            token.translation = correctForm;
          }
        } else if (indefiniteArticles[articleLower]) {
          const correctForm = indefiniteArticles[articleLower][caseKey];
          if (correctForm) {
            token.translation = correctForm;
          }
        }
      }
    }

    return tokens;
  }

  /**
   * Japanese grammar: Particles, politeness, and word order
   *
   * Japanese has:
   * - Particles that mark grammatical function (は/が/を/に/で/と/も/や/から/まで)
   * - SOV word order (Subject-Object-Verb)
   * - Politeness levels (です/ます forms vs casual だ/る forms)
   * - No articles, plurals, or conjugation for gender
   */
  private applyJapaneseGrammar(tokens: Token[]): Token[] {
    // Common particle mappings
    const particleRules: Record<string, string> = {
      // Topic/subject markers
      'as for': 'は', // topic marker
      'is': 'です',    // copula (polite)
      'am': 'です',
      'are': 'です',

      // Subject marker (emphasis/new information)
      'subject': 'が',

      // Object marker
      'object': 'を',

      // Location/direction markers
      'at': 'で',       // location of action
      'in': 'で',       // location of action
      'to': 'に',       // destination/target
      'from': 'から',   // source/origin
      'until': 'まで',  // endpoint

      // Means/method marker
      'by': 'で',
      'with': 'で',     // location/means (context-dependent)

      // Together/and markers
      'and': 'と',      // connects nouns
      'also': 'も',     // also/too
      'or': 'や'        // non-exhaustive list
    };

    // Common verb endings mapping
    const verbEndings: Record<string, string> = {
      // Polite present/future
      'go': '行きます',
      'come': '来ます',
      'eat': '食べます',
      'drink': '飲みます',
      'see': '見ます',
      'read': '読みます',
      'write': '書きます',
      'speak': '話します',
      'do': 'します',
      'make': '作ります',

      // Past tense polite
      'went': '行きました',
      'came': '来ました',
      'ate': '食べました',
      'drank': '飲みました',
      'saw': '見ました',
      'read (past)': '読みました',
      'wrote': '書きました',
      'spoke': '話しました',
      'did': 'しました',
      'made': '作りました'
    };

    // Pronouns in Japanese
    const pronouns: Record<string, string> = {
      'i': '私',
      'you': 'あなた',
      'he': '彼',
      'she': '彼女',
      'we': '私たち',
      'they': '彼ら',
      'this': 'これ',
      'that': 'それ',
      'that (over there)': 'あれ',
      'what': '何',
      'who': '誰',
      'where': 'どこ',
      'when': 'いつ'
    };

    // Question particle
    const questionMarker = 'か';

    // Apply Japanese grammatical transformations
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type !== 'word' || !token.translation) continue;

      const word = token.original.toLowerCase();
      const translation = token.translation.toLowerCase();

      // Apply particle rules
      if (particleRules[word]) {
        token.translation = particleRules[word];
      }

      // Apply verb endings (add polite ます form)
      if (verbEndings[word]) {
        token.translation = verbEndings[word];
      }

      // Apply pronoun mappings
      if (pronouns[word]) {
        token.translation = pronouns[word];
      }

      // Add question particle か to end of questions
      if (i === tokens.length - 1 &&
          tokens.length > 2 &&
          (word === '?' || word === 'か')) {
        // Replace ? with か
        token.translation = 'か';
      }
    }

    // Japanese word order adjustment (SOV)
    // This is complex and would require full parsing, so we'll keep basic token translation
    // In a full implementation, this would reorder: Subject + Object + Verb
    // Example: "I eat sushi" → "私は 寿司を 食べます" (watashi wa sushi wo tabemasu)

    return tokens;
  }

  /**
   * Russian grammar: Cases, gender, and aspect
   *
   * Russian has:
   * - 6 cases: nominative, genitive, dative, accusative, instrumental, prepositional
   * - 3 genders: masculine, feminine, neuter
   * - Verb aspects: perfective (completed action) vs imperfective (ongoing/habitual)
   * - No articles (no "the" or "a")
   */
  private applyRussianGrammar(tokens: Token[]): Token[] {
    // Remove English articles (Russian has no articles)
    const filteredTokens = tokens.filter(token => {
      if (token.type === 'word' && token.translation) {
        const word = token.translation.toLowerCase();
        return word !== 'the' && word !== 'a' && word !== 'an';
      }
      return true;
    });

    // Common Russian prepositions and their required cases
    // Note: Some prepositions like в/на can take different cases based on context
    // (accusative for motion, prepositional for location). This is simplified.
    const prepositionCases: Record<string, string> = {
      // Genitive case
      'без': 'genitive',   // without
      'для': 'genitive',   // for
      'из': 'genitive',    // from/out of
      'от': 'genitive',    // from
      'до': 'genitive',    // until/to
      'у': 'genitive',     // at/by
      'около': 'genitive', // near
      'после': 'genitive', // after
      'из-за': 'genitive', // because of

      // Dative case
      'к': 'dative',       // to/toward
      'по': 'dative',      // along/by

      // Accusative case (with motion - simplified to default to this)
      'в': 'accusative',   // in/into
      'на': 'accusative',  // on/onto
      'через': 'accusative', // through/across
      'за': 'accusative',  // behind/beyond

      // Instrumental case
      'с': 'instrumental', // with
      'под': 'instrumental', // under
      'над': 'instrumental', // over
      'между': 'instrumental', // between
      'перед': 'instrumental', // before/in front of

      // Prepositional case (о/об/обо)
      'о': 'prepositional', // about
      'об': 'prepositional', // about
      'при': 'prepositional' // in the presence of
    };

    // Common verbs and their case governance
    const verbCases: Record<string, string> = {
      // Genitive
      'бояться': 'genitive', // to fear
      'хотеть': 'genitive',  // to want (with partitive meaning)

      // Dative
      'помогать': 'dative',  // to help
      'звонить': 'dative',   // to call
      'нравиться': 'dative', // to please/like

      // Accusative (most transitive verbs)
      'видеть': 'accusative', // to see
      'читать': 'accusative', // to read
      'любить': 'accusative', // to love
      'знать': 'accusative',  // to know

      // Instrumental
      'быть': 'instrumental',      // to be (with predicate instrumental)
      'работать': 'instrumental',  // to work as
      'интересоваться': 'instrumental' // to be interested in
    };

    // Pronouns in Russian (nominative case)
    const pronouns: Record<string, string> = {
      'i': 'я',
      'you': 'ты', // informal singular
      'he': 'он',
      'she': 'она',
      'it': 'оно',
      'we': 'мы',
      'you (plural)': 'вы', // formal or plural
      'they': 'они',
      'this': 'это',
      'that': 'то',
      'what': 'что',
      'who': 'кто',
      'where': 'где',
      'when': 'когда'
    };

    // Apply pronoun mappings
    for (const token of filteredTokens) {
      if (token.type === 'word' && token.translation) {
        const word = token.original.toLowerCase();
        if (pronouns[word]) {
          token.translation = pronouns[word];
        }
      }
    }

    // Note: Full case declension would require knowing noun genders and patterns
    // This is a simplified implementation focusing on article removal and basic patterns

    return filteredTokens;
  }

  /**
   * Ukrainian grammar: Similar to Russian but with some differences
   *
   * Ukrainian has:
   * - 7 cases (includes vocative)
   * - 3 genders
   * - No articles
   */
  private applyUkrainianGrammar(tokens: Token[]): Token[] {
    // Remove English articles (Ukrainian has no articles)
    const filteredTokens = tokens.filter(token => {
      if (token.type === 'word' && token.translation) {
        const word = token.translation.toLowerCase();
        return word !== 'the' && word !== 'a' && word !== 'an';
      }
      return true;
    });

    // Ukrainian-specific pronouns
    const pronouns: Record<string, string> = {
      'i': 'я',
      'you': 'ти',
      'he': 'він',
      'she': 'вона',
      'it': 'воно',
      'we': 'ми',
      'you (plural)': 'ви',
      'they': 'вони',
      'this': 'це',
      'that': 'те',
      'what': 'що',
      'who': 'хто',
      'where': 'де',
      'when': 'коли'
    };

    for (const token of filteredTokens) {
      if (token.type === 'word' && token.translation) {
        const word = token.original.toLowerCase();
        if (pronouns[word]) {
          token.translation = pronouns[word];
        }
      }
    }

    return filteredTokens;
  }

  /**
   * Polish grammar: 7 cases and virile plural
   *
   * Polish has:
   * - 7 cases: nominative, genitive, dative, accusative, instrumental, locative, vocative
   * - 3 genders + virile masculine plural (male persons)
   * - No articles
   */
  private applyPolishGrammar(tokens: Token[]): Token[] {
    // Remove English articles (Polish has no articles)
    const filteredTokens = tokens.filter(token => {
      if (token.type === 'word' && token.translation) {
        const word = token.translation.toLowerCase();
        return word !== 'the' && word !== 'a' && word !== 'an';
      }
      return true;
    });

    // Polish pronouns
    const pronouns: Record<string, string> = {
      'i': 'ja',
      'you': 'ty',
      'he': 'on',
      'she': 'ona',
      'it': 'ono',
      'we': 'my',
      'you (plural)': 'wy',
      'they': 'oni',
      'this': 'to',
      'that': 'tamto',
      'what': 'co',
      'who': 'kto',
      'where': 'gdzie',
      'when': 'kiedy'
    };

    for (const token of filteredTokens) {
      if (token.type === 'word' && token.translation) {
        const word = token.original.toLowerCase();
        if (pronouns[word]) {
          token.translation = pronouns[word];
        }
      }
    }

    return filteredTokens;
  }

  // ============================================================================
  // REASSEMBLY
  // ============================================================================

  /**
   * Reassemble tokens back into translated text
   */
  private reassemble(tokens: Token[], options: TranslationOptions): string {
    let result = '';

    for (const token of tokens) {
      switch (token.type) {
        case 'word':
        case 'entity':
          if (token.translation) {
            // Preserve capitalization if option enabled
            if (options.maintainFormatting !== false && token.isCapitalized) {
              result += this.capitalize(token.translation);
            } else {
              result += token.translation;
            }
          } else {
            result += token.original; // Fallback
          }
          break;

        case 'punctuation':
        case 'whitespace':
          result += token.original;
          break;
      }
    }

    return result;
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ============================================================================
  // TRANSLATION MEMORY (CACHE)
  // ============================================================================

  /**
   * Load translation memory from localStorage
   */
  private loadTranslationMemory() {
    try {
      const stored = localStorage.getItem('penko_translation_memory_v5');  // v5: Added reverse index support
      if (stored) {
        const parsed = JSON.parse(stored);
        this.translationMemory = new Map(Object.entries(parsed));
        if (DEBUG.TRANSLATION) console.log(`[CustomTranslationEngine] Loaded ${this.translationMemory.size} cached translations`);
      }
    } catch (error) {
      if (DEBUG.TRANSLATION) console.warn('[CustomTranslationEngine] Failed to load translation memory:', error);
    }
  }

  /**
   * Save translation memory to localStorage (debounced)
   */
  private saveTimeout: any;
  private saveTranslationMemory() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(() => {
      try {
        // Keep only most recent N translations (configured limit to prevent memory leaks)
        const maxCacheSize = PERFORMANCE.ENABLE_CACHE_LIMITS ? MODEL_CONFIG.TRANSLATION_CACHE_MAX_SIZE : 5000;
        const entries = Array.from(this.translationMemory.entries())
          .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
          .slice(0, maxCacheSize);

        const toStore = Object.fromEntries(entries);
        localStorage.setItem('penko_translation_memory_v5', JSON.stringify(toStore));  // v5: Added reverse index support

        if (DEBUG.TRANSLATION) console.log(`[CustomTranslationEngine] Saved ${entries.length}/${this.translationMemory.size} translations (limit: ${maxCacheSize})`);
      } catch (error) {
        if (DEBUG.TRANSLATION) console.warn('[CustomTranslationEngine] Failed to save translation memory:', error);
      }
    }, 2000); // 2s debounce
  }

  /**
   * Clear translation memory
   */
  clearMemory() {
    this.translationMemory.clear();
    localStorage.removeItem('penko_translation_memory_v5');  // v5: Added reverse index support
    if (DEBUG.TRANSLATION) console.log('[CustomTranslationEngine] Translation memory cleared');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      memorySize: this.translationMemory.size,
      initialized: this.initialized
    };
  }
}
