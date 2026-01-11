/**
 * Facade Natural Language Understanding Service
 *
 * Parses player input into Discourse Acts (DAs) that the Drama Manager can understand.
 * This is a more advanced replacement for StandardModeParser, designed specifically
 * for the Facade interactive drama system.
 *
 * Key responsibilities:
 * - Classify player input into Discourse Act types
 * - Extract parameters (which character, which topic, etc.)
 * - Analyze sentiment and intensity
 * - Provide context-aware interpretation
 */

import {
  DiscourseActType,
  DiscourseActWME,
  DiscourseActPattern,
  DACharParam,
  BeatID,
} from '../../types/facade';
import { WorldMemory } from './worldMemory';

export interface DARecognitionResult {
  daType: DiscourseActType;
  confidence: number;
  charID: DACharParam;        // Who the DA is directed at
  param1: number;              // Context-dependent parameter
  param2: number;
  param3: number;
  rawInput: string;
  matchedPattern?: string;
}

export class FacadeNLU {
  private patterns: DiscourseActPattern[];
  private worldMemory: WorldMemory;

  constructor(patterns: DiscourseActPattern[], worldMemory: WorldMemory) {
    this.patterns = patterns;
    this.worldMemory = worldMemory;
    console.log(`[FacadeNLU] Initialized with ${patterns.length} discourse act patterns`);
  }

  // ============================================================================
  // MAIN NLU PIPELINE
  // ============================================================================

  /**
   * Parse player input into a Discourse Act
   */
  parseInput(input: string): DARecognitionResult {
    const normalizedInput = input.toLowerCase().trim();

    console.log(`[FacadeNLU] Parsing input: "${input}"`);

    // Get context from world memory
    const currentBeat = this.worldMemory.getCurrentBeat();
    const recentDAs = this.worldMemory.getRecentDiscourseActs();
    const previousDA = recentDAs[0];

    // Try pattern matching
    const matches: Array<{pattern: DiscourseActPattern; confidence: number; matchedText: string}> = [];

    for (const pattern of this.patterns) {
      const matchResult = this.matchPattern(normalizedInput, pattern, currentBeat, previousDA);

      if (matchResult.confidence > 0) {
        matches.push({
          pattern,
          confidence: matchResult.confidence,
          matchedText: matchResult.matchedText,
        });
      }
    }

    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);

    // Get best match
    if (matches.length > 0) {
      const bestMatch = matches[0];

      console.log(`[FacadeNLU] Best match: ${DiscourseActType[bestMatch.pattern.daType]} (confidence: ${bestMatch.confidence.toFixed(2)})`);

      // Extract parameters
      const charID = this.extractTargetCharacter(normalizedInput);
      const param1 = this.extractParam1(normalizedInput, bestMatch.pattern.daType);
      const param2 = this.extractParam2(normalizedInput, bestMatch.pattern.daType);
      const param3 = 0;

      return {
        daType: bestMatch.pattern.daType,
        confidence: bestMatch.confidence,
        charID,
        param1,
        param2,
        param3,
        rawInput: input,
        matchedPattern: bestMatch.matchedText,
      };
    }

    // No match - return Misc DA
    console.warn(`[FacadeNLU] No pattern matched, returning Misc DA`);

    return {
      daType: DiscourseActType.Misc,
      confidence: 0.3,
      charID: DACharParam.grace, // Default to Grace
      param1: 0,
      param2: 0,
      param3: 0,
      rawInput: input,
    };
  }

  /**
   * Convert recognition result to WME
   */
  createDiscourseActWME(result: DARecognitionResult): DiscourseActWME {
    return {
      id: result.daType,
      charID: result.charID,
      param1: result.param1,
      param2: result.param2,
      param3: result.param3,
      timestamp: Date.now(),
      handledStatus: 0, // Unhandled
    };
  }

  // ============================================================================
  // PATTERN MATCHING
  // ============================================================================

  /**
   * Match input against a discourse act pattern
   */
  private matchPattern(
    input: string,
    pattern: DiscourseActPattern,
    currentBeat?: BeatID,
    previousDA?: DiscourseActWME
  ): { confidence: number; matchedText: string } {
    let confidence = 0;
    let matchedText = '';

    // Try regex patterns
    for (const regexPattern of pattern.patterns) {
      try {
        const regex = new RegExp(regexPattern, 'i');
        const match = input.match(regex);

        if (match) {
          confidence = pattern.confidence;
          matchedText = match[0];
          break;
        }
      } catch (e) {
        console.warn(`[FacadeNLU] Invalid regex pattern: ${regexPattern}`);
      }
    }

    // Keyword matching (additive confidence)
    let keywordMatches = 0;
    for (const keyword of pattern.keywords) {
      if (input.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }

    if (keywordMatches > 0 && pattern.keywords.length > 0) {
      const keywordConfidence = (keywordMatches / pattern.keywords.length) * 0.7;
      confidence = Math.max(confidence, keywordConfidence);
    }

    // Context boosting
    if (pattern.context) {
      // Boost if this DA type matches conversation context
      if (pattern.context.previousDA && previousDA && previousDA.id === pattern.context.previousDA) {
        confidence *= 1.2; // 20% boost for context match
      }

      if (pattern.context.currentBeat && currentBeat === pattern.context.currentBeat) {
        confidence *= 1.1; // 10% boost for beat context
      }
    }

    // Cap at 1.0
    confidence = Math.min(1.0, confidence);

    return { confidence, matchedText };
  }

  // ============================================================================
  // PARAMETER EXTRACTION
  // ============================================================================

  /**
   * Extract which character the DA is directed at
   */
  private extractTargetCharacter(input: string): DACharParam {
    if (input.includes('grace')) {
      return DACharParam.grace;
    } else if (input.includes('trip')) {
      return DACharParam.trip;
    }

    // Default: Check who player has been interacting with more
    const recentDAs = this.worldMemory.getRecentDiscourseActs();
    const graceCount = recentDAs.filter(da => da.charID === DACharParam.grace).length;
    const tripCount = recentDAs.filter(da => da.charID === DACharParam.trip).length;

    return graceCount >= tripCount ? DACharParam.grace : DACharParam.trip;
  }

  /**
   * Extract param1 (context-dependent)
   */
  private extractParam1(input: string, daType: DiscourseActType): number {
    // For Express DA, param1 is the emotion
    if (daType === DiscourseActType.Express) {
      if (input.includes('happy') || input.includes('joy')) return 54; // happy
      if (input.includes('laugh') || input.includes('funny')) return 55; // laugh
      if (input.includes('sad') || input.includes('upset')) return 56; // sad
      if (input.includes('angry') || input.includes('mad')) return 57; // angry
    }

    // For Ally/Oppose, param1 could indicate intensity
    if (daType === DiscourseActType.Ally || daType === DiscourseActType.Oppose) {
      if (input.includes('strongly') || input.includes('definitely')) return 2; // Strong
      return 1; // Mild
    }

    return 0;
  }

  /**
   * Extract param2 (context-dependent)
   */
  private extractParam2(input: string, daType: DiscourseActType): number {
    // For topic-related DAs, param2 could be the topic
    if (input.includes('art') || input.includes('advertising')) return 59; // artistAdv
    if (input.includes('facade') || input.includes('pretend')) return 60; // facade
    if (input.includes('marriage') || input.includes('relationship')) return 61; // rockyMarriage

    return 0;
  }

  // ============================================================================
  // SENTIMENT ANALYSIS
  // ============================================================================

  /**
   * Analyze sentiment of input (positive, negative, neutral)
   */
  analyzeSentiment(input: string): 'positive' | 'negative' | 'neutral' {
    const normalizedInput = input.toLowerCase();

    const positiveWords = ['good', 'great', 'wonderful', 'amazing', 'love', 'beautiful', 'nice', 'excellent', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'ugly', 'disgusting', 'worst'];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (normalizedInput.includes(word)) positiveCount++;
    }

    for (const word of negativeWords) {
      if (normalizedInput.includes(word)) negativeCount++;
    }

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Analyze intensity of input (mild, moderate, strong)
   */
  analyzeIntensity(input: string): 'mild' | 'moderate' | 'strong' {
    const normalizedInput = input.toLowerCase();

    const intensifiers = ['very', 'really', 'so', 'extremely', 'totally', 'completely', 'absolutely'];
    const hasIntensifier = intensifiers.some(word => normalizedInput.includes(word));

    const hasExclamation = input.includes('!');
    const hasAllCaps = input === input.toUpperCase() && input.length > 3;

    if (hasIntensifier || hasExclamation || hasAllCaps) {
      return 'strong';
    }

    const hasHedge = normalizedInput.includes('maybe') || normalizedInput.includes('kinda') || normalizedInput.includes('sort of');

    if (hasHedge) {
      return 'mild';
    }

    return 'moderate';
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get all patterns for a specific DA type
   */
  getPatternsForDA(daType: DiscourseActType): DiscourseActPattern[] {
    return this.patterns.filter(p => p.daType === daType);
  }

  /**
   * Get pattern count
   */
  getPatternCount(): number {
    return this.patterns.length;
  }

  /**
   * Test input against all patterns (for debugging)
   */
  testAllPatterns(input: string): Array<{daType: DiscourseActType; confidence: number}> {
    const normalizedInput = input.toLowerCase().trim();
    const results: Array<{daType: DiscourseActType; confidence: number}> = [];

    for (const pattern of this.patterns) {
      const matchResult = this.matchPattern(normalizedInput, pattern);

      if (matchResult.confidence > 0) {
        results.push({
          daType: pattern.daType,
          confidence: matchResult.confidence,
        });
      }
    }

    results.sort((a, b) => b.confidence - a.confidence);

    return results;
  }

  /**
   * Debug: Print pattern match results
   */
  debugPatternMatching(input: string): void {
    console.log('');
    console.log('='.repeat(70));
    console.log('FACADE NLU PATTERN MATCHING DEBUG');
    console.log('='.repeat(70));
    console.log(`Input: "${input}"`);
    console.log('');

    const results = this.testAllPatterns(input);

    console.log(`Matched ${results.length} patterns:`);
    console.log('');

    for (let i = 0; i < Math.min(10, results.length); i++) {
      const result = results[i];
      console.log(`[${i + 1}] ${DiscourseActType[result.daType]}: ${(result.confidence * 100).toFixed(1)}%`);
    }

    console.log('');
    console.log(`Sentiment: ${this.analyzeSentiment(input)}`);
    console.log(`Intensity: ${this.analyzeIntensity(input)}`);
    console.log('='.repeat(70));
    console.log('');
  }
}
