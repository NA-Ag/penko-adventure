/**
 * NarrativeDecipherService - On-Demand Translation for TRANSLATE Button
 *
 * ARCHITECTURE: "My French Coach" / "Batman Arkham" Model
 * - Game runs 100% in target language (Spanish, French, etc.)
 * - Translation is SEPARATE from game loop
 * - Called ONLY when user clicks TRANSLATE button
 * - Not part of turn processing (keeps game fast)
 *
 * This service provides contextual "deciphering" of narrative text,
 * showing vocabulary hints and translations in the learner's native language.
 */

import { Language } from '../types';
import { CustomTranslationEngine } from './CustomTranslationEngine';
import { DictionaryManager } from './browser/DictionaryManager';

export interface DecipherResult {
  originalText: string;
  translation: string;
  vocabularyHints?: VocabularyHint[];
}

export interface VocabularyHint {
  word: string;
  translation: string;
  partOfSpeech?: string;
}

export class NarrativeDecipherService {
  private translationEngine: CustomTranslationEngine;
  private dictManager: DictionaryManager;

  constructor() {
    this.translationEngine = new CustomTranslationEngine();
    this.dictManager = DictionaryManager.getInstance();
  }

  /**
   * Decipher narrative text from target language to native language
   * Called ONLY when user clicks TRANSLATE button (not during game loop)
   */
  async decipher(
    narrative: string,
    sourceLanguage: Language,
    targetLanguage: Language
  ): Promise<DecipherResult> {
    // If same language, no translation needed
    if (sourceLanguage === targetLanguage) {
      return {
        originalText: narrative,
        translation: narrative,
      };
    }

    // Use the existing translation engine
    const result = await this.translationEngine.translateText(narrative, {
      sourceLanguage,
      targetLanguage,
      useGrammarRules: true,
      maintainFormatting: true,
    });

    return {
      originalText: narrative,
      translation: result.translatedText,
    };
  }

  /**
   * Extract key vocabulary from narrative with translations
   * Useful for showing "hints" instead of full translation
   */
  async extractVocabulary(
    narrative: string,
    sourceLanguage: Language,
    targetLanguage: Language
  ): Promise<VocabularyHint[]> {
    // Tokenize the narrative into words
    const words = narrative
      .toLowerCase()
      .match(/\b\w+\b/g) || [];

    // Get unique words
    const uniqueWords = [...new Set(words)];

    // Translate each word
    const hints: VocabularyHint[] = [];
    for (const word of uniqueWords.slice(0, 10)) { // Limit to 10 most important words
      try {
        const translations = await this.dictManager.translate(
          word,
          sourceLanguage,
          targetLanguage
        );

        if (translations.length > 0) {
          hints.push({
            word,
            translation: translations[0], // Use first/primary translation
          });
        }
      } catch (error) {
        // Skip words that can't be translated
        continue;
      }
    }

    return hints;
  }
}
