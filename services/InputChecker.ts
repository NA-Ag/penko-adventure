import { Language, CEFRLevel } from '../types';

export class InputChecker {
  private targetLanguage: Language;
  private nativeLanguage: Language;
  private cefrLevel: CEFRLevel;

  constructor(
    targetLanguage: Language,
    nativeLanguage: Language,
    cefrLevel: CEFRLevel = 'A2'
  ) {
    this.targetLanguage = targetLanguage;
    this.nativeLanguage = nativeLanguage;
    this.cefrLevel = cefrLevel;
  }

  public updateCEFRLevel(level: CEFRLevel) {
    this.cefrLevel = level;
  }

  public async checkAndCorrect(input: string): Promise<{
    original: string;
    corrected: string;
    isValid: boolean;
    confidence: number;
    feedback: string;
    metrics: { spellingScore: number; grammarScore: number };
  }> {
    // Legacy local dictionary checking has been removed in favor of cloud/cartridge AI checking.
    // For now, return a neutral pass-through.
    return {
      original: input,
      corrected: input,
      isValid: true,
      confidence: 1.0,
      feedback: '',
      metrics: { spellingScore: 100, grammarScore: 100 }
    };
  }
}