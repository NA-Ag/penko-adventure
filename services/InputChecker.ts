/**
 * InputChecker - Validates and corrects user input in target language
 *
 * Architecture:
 * 1. User types in target language (with potential errors)
 * 2. InputChecker validates and corrects ALL errors aggressively
 * 3. Generates feedback in native language (shows top 3 errors)
 * 4. Returns corrected text for translation to English → Qwen
 *
 * Philosophy: "Aggressive but Educational"
 * - Flag EVERYTHING (typos, accents, grammar, word order)
 * - Auto-correct ALL errors
 * - Show up to 3 most important errors to avoid overwhelming
 * - Users learn from mistakes they didn't even know they were making
 */

import { Language } from '../types';
import { DictionaryManager } from './browser/DictionaryManager';
import { CustomTranslationEngine } from './CustomTranslationEngine';
import { getMorphologyEngine } from './morphology/MorphologyEngine';
import { DEBUG } from '../config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CheckResult {
  original: string;              // What user typed
  corrected: string;             // Auto-corrected version
  hadErrors: boolean;            // Any errors found?
  feedback: string;              // Formatted feedback in native language (up to 3 errors)
  errorDetails: ErrorDetail[];   // All errors found (for analytics)
  confidence: number;            // 0-1, how confident in corrections
  isIncomprehensible: boolean;   // Signal to Qwen to rephrase gently
}

export interface ErrorDetail {
  type: 'spelling' | 'accent' | 'grammar' | 'word-order' | 'unknown-word' | 'conjugation';
  position: { start: number; end: number };
  original: string;              // Wrong version
  corrected: string;             // Fixed version
  severity: 'minor' | 'major';   // For prioritization
  explanation: string;           // Technical explanation (in English, will be translated)
  priority: number;              // For ranking (higher = more important)
}

interface Token {
  type: 'word' | 'punctuation' | 'whitespace';
  value: string;
  normalized: string;            // Lowercase, no accents (for matching)
  position: { start: number; end: number };
  isValid?: boolean;             // Found in dictionary
  corrections?: string[];        // Possible corrections
}

// ============================================================================
// MAIN INPUT CHECKER
// ============================================================================

export class InputChecker {
  private dictManager: DictionaryManager;
  private translationEngine: CustomTranslationEngine | null = null; // Shared instance
  private morphologyEngine = getMorphologyEngine();
  private targetLanguage: Language;
  private nativeLanguage: Language;
  private cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  private morphologyLoaded = false;

  // Error tolerance thresholds by CEFR level
  private static readonly ERROR_THRESHOLDS = {
    'A1': { maxErrors: 5, minConfidence: 0.3 },  // Very lenient
    'A2': { maxErrors: 4, minConfidence: 0.4 },
    'B1': { maxErrors: 3, minConfidence: 0.5 },
    'B2': { maxErrors: 2, minConfidence: 0.6 },
    'C1': { maxErrors: 1, minConfidence: 0.7 },
    'C2': { maxErrors: 0, minConfidence: 0.8 }   // Very strict
  };

  // Feedback templates (will be translated to native language)
  private static readonly FEEDBACK_TEMPLATES = {
    spelling: '"{original}" should be spelled "{corrected}"',
    accent: '"{original}" is missing accent marks. Correct: "{corrected}"',
    grammar: 'Grammar error: "{original}" → "{corrected}". {explanation}',
    conjugation: 'Verb conjugation: "{original}" should be "{corrected}"',
    'unknown-word': '"{original}" is not a valid word. Did you mean "{corrected}"?',
    'word-order': 'Word order issue: "{original}" → "{corrected}"',
  };

  constructor(
    targetLanguage: Language,
    nativeLanguage: Language,
    cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'A2',
    sharedTranslationEngine?: CustomTranslationEngine // Accept shared instance
  ) {
    this.dictManager = DictionaryManager.getInstance();
    this.translationEngine = sharedTranslationEngine || null; // Use shared or defer creation
    this.targetLanguage = targetLanguage;
    this.nativeLanguage = nativeLanguage;
    this.cefrLevel = cefrLevel;

    // Load morphology tables for target language (async, track completion)
    this.morphologyEngine.loadLanguage(targetLanguage)
      .then(() => {
        this.morphologyLoaded = true;
        if (DEBUG.INPUT_CHECKER) console.log('[InputChecker] Morphology loaded for', targetLanguage);
      })
      .catch(e => {
        if (DEBUG.INPUT_CHECKER) console.warn('[InputChecker] Failed to load morphology:', e);
        this.morphologyLoaded = false;
      });
  }

  /**
   * Set shared translation engine (called by OnnxService to avoid duplication)
   */
  setTranslationEngine(engine: CustomTranslationEngine): void {
    this.translationEngine = engine;
  }

  /**
   * Update CEFR level without recreating entire InputChecker
   */
  updateCEFRLevel(newLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'): void {
    if (this.cefrLevel !== newLevel) {
      console.log(`[InputChecker] CEFR level updated: ${this.cefrLevel} → ${newLevel}`);
      this.cefrLevel = newLevel;
    }
  }

  /**
   * Main entry point: Check and correct user input
   */
  async checkAndCorrect(userInput: string): Promise<CheckResult> {
    console.log('[InputChecker] Checking input:', {
      input: userInput,
      targetLang: this.targetLanguage,
      cefrLevel: this.cefrLevel
    });

    // Handle empty input
    if (!userInput.trim()) {
      return this.createEmptyResult(userInput);
    }

    try {
      // 1. Tokenize input
      const tokens = this.tokenize(userInput);

      // 2. Validate each word (dictionary lookup)
      await this.validateTokens(tokens);

      // 3. Find and collect all errors
      const errors = this.detectErrors(tokens);

      // 4. Auto-correct all errors
      const correctedTokens = await this.correctErrors(tokens, errors);

      // 5. Reassemble corrected text
      const correctedText = this.reassemble(correctedTokens);

      // 6. Calculate confidence (based on coverage and errors)
      const confidence = this.calculateConfidence(tokens, errors);

      // 7. Determine if input is incomprehensible
      const isIncomprehensible = this.isIncomprehensible(errors, confidence);

      // 8. Generate feedback (top 3 errors, translated to native language)
      const feedback = await this.generateFeedback(errors);

      console.log('[InputChecker] Results:', {
        hadErrors: errors.length > 0,
        errorCount: errors.length,
        confidence: confidence.toFixed(2),
        isIncomprehensible,
        corrected: correctedText
      });

      return {
        original: userInput,
        corrected: correctedText,
        hadErrors: errors.length > 0,
        feedback,
        errorDetails: errors,
        confidence,
        isIncomprehensible
      };

    } catch (error) {
      console.error('[InputChecker] Error during checking:', error);
      // Fallback: return original input
      return {
        original: userInput,
        corrected: userInput,
        hadErrors: false,
        feedback: '',
        errorDetails: [],
        confidence: 0.5,
        isIncomprehensible: false
      };
    }
  }

  // ============================================================================
  // TOKENIZATION
  // ============================================================================

  /**
   * Tokenize input into words, punctuation, and whitespace
   */
  private tokenize(text: string): Token[] {
    const tokens: Token[] = [];
    let currentPos = 0;

    // Regex to match words (including accented characters)
    const wordRegex = /[\p{L}\p{M}]+|[\p{P}]|[\s]+/gu;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      const value = match[0];
      const start = match.index;
      const end = start + value.length;

      let type: 'word' | 'punctuation' | 'whitespace';

      if (/^[\p{L}\p{M}]+$/u.test(value)) {
        type = 'word';
      } else if (/^\s+$/.test(value)) {
        type = 'whitespace';
      } else {
        type = 'punctuation';
      }

      tokens.push({
        type,
        value,
        normalized: this.normalize(value),
        position: { start, end }
      });
    }

    return tokens;
  }

  /**
   * Normalize word for matching (lowercase, no accents for fuzzy matching)
   */
  private normalize(word: string): string {
    return word
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics for fuzzy matching
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate each word token against dictionary
   */
  private async validateTokens(tokens: Token[]): Promise<void> {
    for (const token of tokens) {
      if (token.type !== 'word') {
        token.isValid = true; // Punctuation/whitespace always valid
        continue;
      }

      // Check if word exists in target language dictionary
      const isValid = await this.isWordValid(token.value);
      token.isValid = isValid;

      // If invalid, try to find corrections
      if (!isValid) {
        token.corrections = await this.findCorrections(token.value);
      }
    }
  }

  /**
   * Check if word exists in dictionary (reverse lookup: target → English)
   * NOW WITH MORPHOLOGY SUPPORT - recognizes conjugations, plurals, etc.
   */
  private async isWordValid(word: string): Promise<boolean> {
    try {
      // 1. Check morphology tables first (FAST O(1) lookup)
      // This catches: comiendo, comí, comido, etc.
      if (this.morphologyEngine.isValidForm(word, this.targetLanguage)) {
        if (DEBUG.INPUT_CHECKER) console.log('[InputChecker] Morphology match:', word);
        return true;
      }

      // 2. Check dictionary (slower, but necessary for base forms not in morphology)
      // For target language words, we need to check if they exist
      // We can do this by trying to translate them to English
      // DictionaryManager.translate(word, fromLang, toLang) returns string[] of translations

      // Try exact match first
      const translations = await this.dictManager.translate(word, this.targetLanguage, Language.ENGLISH);
      if (translations && translations.length > 0) return true;

      // Try lowercase
      const lowerTranslations = await this.dictManager.translate(word.toLowerCase(), this.targetLanguage, Language.ENGLISH);
      if (lowerTranslations && lowerTranslations.length > 0) return true;

      // For some languages, try without accents (to detect missing accents)
      const normalized = this.normalize(word);
      if (normalized !== word.toLowerCase()) {
        const normTranslations = await this.dictManager.translate(normalized, this.targetLanguage, Language.ENGLISH);
        if (normTranslations && normTranslations.length > 0) return false; // Word exists but missing accents!
      }

      return false;
    } catch (error) {
      console.warn('[InputChecker] Dictionary lookup failed:', error);
      return true; // Assume valid on error (lenient)
    }
  }

  /**
   * Find possible corrections for misspelled word
   */
  private async findCorrections(word: string): Promise<string[]> {
    const corrections: string[] = [];

    // Strategy 1: Try with common accent additions (for Romance languages)
    if (this.isRomanceLanguage()) {
      const accentVariants = this.generateAccentVariants(word);
      for (const variant of accentVariants) {
        if (await this.isWordValid(variant)) {
          corrections.push(variant);
        }
      }
    }

    // Strategy 2: Levenshtein distance (future: implement fuzzy matching)
    // TODO: Implement in Phase 2

    return corrections.slice(0, 3); // Return top 3
  }

  /**
   * Generate accent variants for common Romance language patterns
   */
  private generateAccentVariants(word: string): string[] {
    const variants: string[] = [];

    // Spanish: á, é, í, ó, ú, ñ
    if (this.targetLanguage === Language.SPANISH) {
      const accentMap: Record<string, string[]> = {
        'a': ['á'],
        'e': ['é'],
        'i': ['í'],
        'o': ['ó'],
        'u': ['ú', 'ü'],
        'n': ['ñ']
      };
      variants.push(...this.applyAccentMap(word, accentMap));
    }

    // French: à, â, é, è, ê, ë, î, ï, ô, ù, û, ü, ÿ, ç
    if (this.targetLanguage === Language.FRENCH) {
      const accentMap: Record<string, string[]> = {
        'a': ['à', 'â'],
        'e': ['é', 'è', 'ê', 'ë'],
        'i': ['î', 'ï'],
        'o': ['ô'],
        'u': ['ù', 'û', 'ü'],
        'y': ['ÿ'],
        'c': ['ç']
      };
      variants.push(...this.applyAccentMap(word, accentMap));
    }

    // German: ä, ö, ü, ß
    if (this.targetLanguage === Language.GERMAN) {
      const accentMap: Record<string, string[]> = {
        'a': ['ä'],
        'o': ['ö'],
        'u': ['ü'],
        's': ['ß']
      };
      variants.push(...this.applyAccentMap(word, accentMap));
    }

    return variants;
  }

  /**
   * Apply accent map to generate variants
   */
  private applyAccentMap(word: string, accentMap: Record<string, string[]>): string[] {
    const variants: string[] = [];

    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      const accents = accentMap[char];

      if (accents) {
        for (const accent of accents) {
          const variant = word.slice(0, i) + accent + word.slice(i + 1);
          variants.push(variant);
        }
      }
    }

    return variants;
  }

  // ============================================================================
  // ERROR DETECTION
  // ============================================================================

  /**
   * Detect all errors in tokens
   */
  private detectErrors(tokens: Token[]): ErrorDetail[] {
    const errors: ErrorDetail[] = [];

    for (const token of tokens) {
      if (token.type !== 'word' || token.isValid) continue;

      // Determine error type
      const errorType = this.classifyError(token);

      // Determine severity
      const severity = this.determineErrorSeverity(errorType, token);

      // Calculate priority (for ranking)
      const priority = this.calculateErrorPriority(errorType, severity);

      // Get best correction
      const correction = token.corrections?.[0] || token.value;

      // Generate explanation
      const explanation = this.generateErrorExplanation(errorType, token, correction);

      errors.push({
        type: errorType,
        position: token.position,
        original: token.value,
        corrected: correction,
        severity,
        explanation,
        priority
      });
    }

    // Sort by priority (highest first)
    errors.sort((a, b) => b.priority - a.priority);

    return errors;
  }

  /**
   * Classify error type
   */
  private classifyError(token: Token): ErrorDetail['type'] {
    // If we have corrections, determine error type
    if (token.corrections && token.corrections.length > 0) {
      const correction = token.corrections[0];

      // Check if only difference is accents
      if (this.normalize(token.value) === this.normalize(correction)) {
        return 'accent';
      }

      // Check if it's a conjugation (basic heuristic: ends in common verb suffixes)
      if (this.looksLikeVerb(token.value)) {
        return 'conjugation';
      }

      return 'spelling';
    }

    return 'unknown-word';
  }

  /**
   * Determine error severity
   */
  private determineErrorSeverity(
    errorType: ErrorDetail['type'],
    token: Token
  ): 'minor' | 'major' {
    // Accents are minor (word is recognizable)
    if (errorType === 'accent') return 'minor';

    // Unknown words are major (changes meaning)
    if (errorType === 'unknown-word') return 'major';

    // Grammar and conjugation are major
    if (errorType === 'grammar' || errorType === 'conjugation') return 'major';

    // Spelling depends on how different the word is
    if (errorType === 'spelling' && token.corrections?.[0]) {
      const correction = token.corrections[0];
      const distance = this.levenshteinDistance(token.value, correction);
      return distance <= 2 ? 'minor' : 'major';
    }

    return 'minor';
  }

  /**
   * Calculate error priority for ranking
   */
  private calculateErrorPriority(
    errorType: ErrorDetail['type'],
    severity: 'minor' | 'major'
  ): number {
    const baseScore = severity === 'major' ? 100 : 50;

    const typeBonus: Record<ErrorDetail['type'], number> = {
      'unknown-word': 30,
      'conjugation': 25,
      'grammar': 25,
      'word-order': 20,
      'spelling': 15,
      'accent': 10
    };

    return baseScore + (typeBonus[errorType] || 0);
  }

  /**
   * Generate error explanation (in English, will be translated later)
   */
  private generateErrorExplanation(
    errorType: ErrorDetail['type'],
    token: Token,
    correction: string
  ): string {
    switch (errorType) {
      case 'accent':
        return `This word requires accent marks in ${this.targetLanguage}.`;
      case 'spelling':
        return `Spelling mistake.`;
      case 'conjugation':
        return `Verb conjugation error.`;
      case 'unknown-word':
        return `This word doesn't exist in ${this.targetLanguage}.`;
      case 'grammar':
        return `Grammar rule violation.`;
      default:
        return `Error detected.`;
    }
  }

  // ============================================================================
  // ERROR CORRECTION
  // ============================================================================

  /**
   * Auto-correct all errors in tokens
   */
  private async correctErrors(tokens: Token[], errors: ErrorDetail[]): Promise<Token[]> {
    // Create corrected copy
    const corrected = [...tokens];

    // Apply corrections
    for (const error of errors) {
      // Find token by position
      const tokenIndex = corrected.findIndex(
        t => t.position.start === error.position.start
      );

      if (tokenIndex !== -1) {
        corrected[tokenIndex].value = error.corrected;
      }
    }

    return corrected;
  }

  /**
   * Reassemble tokens into corrected text
   */
  private reassemble(tokens: Token[]): string {
    return tokens.map(t => t.value).join('');
  }

  // ============================================================================
  // CONFIDENCE & COMPREHENSIBILITY
  // ============================================================================

  /**
   * Calculate confidence score (0-1)
   */
  private calculateConfidence(tokens: Token[], errors: ErrorDetail[]): number {
    const wordTokens = tokens.filter(t => t.type === 'word');
    if (wordTokens.length === 0) return 1.0;

    const validWords = wordTokens.filter(t => t.isValid).length;
    const coverage = validWords / wordTokens.length;

    // Penalize for errors
    const errorPenalty = Math.min(errors.length * 0.1, 0.5);

    return Math.max(0, Math.min(1, coverage - errorPenalty));
  }

  /**
   * Determine if input is incomprehensible
   */
  private isIncomprehensible(errors: ErrorDetail[], confidence: number): boolean {
    const threshold = InputChecker.ERROR_THRESHOLDS[this.cefrLevel];

    // Too many errors?
    if (errors.length > threshold.maxErrors * 2) return true;

    // Confidence too low?
    if (confidence < threshold.minConfidence) return true;

    // Too many unknown words?
    const unknownWords = errors.filter(e => e.type === 'unknown-word').length;
    if (unknownWords > 3) return true;

    return false;
  }

  // ============================================================================
  // FEEDBACK GENERATION
  // ============================================================================

  /**
   * Generate feedback message (top 3 errors, translated to native language)
   */
  private async generateFeedback(errors: ErrorDetail[]): Promise<string> {
    if (errors.length === 0) return '';

    // Take top 3 errors
    const topErrors = errors.slice(0, 3);

    // Generate feedback for each error (in English first)
    const feedbackLines: string[] = [];

    for (let i = 0; i < topErrors.length; i++) {
      const error = topErrors[i];
      const template = InputChecker.FEEDBACK_TEMPLATES[error.type];

      const line = template
        .replace('{original}', error.original)
        .replace('{corrected}', error.corrected)
        .replace('{explanation}', error.explanation);

      feedbackLines.push(`${i + 1}. ${line}`);
    }

    const englishFeedback = feedbackLines.join('\n');

    // Translate to native language if not English
    if (this.nativeLanguage === Language.ENGLISH) {
      return englishFeedback;
    }

    // Handle case where translation engine isn't set yet
    if (!this.translationEngine) {
      console.warn('[InputChecker] Translation engine not set, returning English feedback');
      return englishFeedback;
    }

    try {
      const result = await this.translationEngine.translateText(englishFeedback, {
        targetLanguage: this.nativeLanguage,
        cefrLevel: 'B1', // Use intermediate level for feedback clarity
        useGrammarRules: false,
        maintainFormatting: true
      });

      return result.translatedText;
    } catch (error) {
      console.warn('[InputChecker] Failed to translate feedback:', error);
      return englishFeedback; // Fallback to English
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get language code for dictionary lookup
   */
  private getLangCode(language: Language): string {
    const codes: Record<Language, string> = {
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
    return codes[language];
  }

  /**
   * Check if language is Romance (for accent handling)
   */
  private isRomanceLanguage(): boolean {
    return [
      Language.SPANISH,
      Language.FRENCH,
      Language.ITALIAN,
      Language.PORTUGUESE
    ].includes(this.targetLanguage);
  }

  /**
   * Basic heuristic to detect if word looks like a verb
   */
  private looksLikeVerb(word: string): boolean {
    const lowerWord = word.toLowerCase();

    // Spanish verb endings
    if (this.targetLanguage === Language.SPANISH) {
      return /ar|er|ir|ando|iendo|ado|ido$/i.test(lowerWord);
    }

    // French verb endings
    if (this.targetLanguage === Language.FRENCH) {
      return /er|ir|re|ant|é|és|ée|ées$/i.test(lowerWord);
    }

    // German verb endings
    if (this.targetLanguage === Language.GERMAN) {
      return /en|st|t|te|ten$/i.test(lowerWord);
    }

    return false;
  }

  /**
   * Calculate Levenshtein distance between two strings
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
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Create empty result for empty input
   */
  private createEmptyResult(input: string): CheckResult {
    return {
      original: input,
      corrected: input,
      hadErrors: false,
      feedback: '',
      errorDetails: [],
      confidence: 1.0,
      isIncomprehensible: false
    };
  }
}
