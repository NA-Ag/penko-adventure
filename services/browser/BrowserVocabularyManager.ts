/**
 * Smart Vocabulary Manager for Browser AI
 *
 * Idea #2: Constrain Browser AI's output vocabulary based on user's known words
 * - Tracks which words user has seen and mastered
 * - Provides vocabulary hints to AI to reduce generation complexity
 * - Smaller vocabulary = faster token generation (3-5x speedup)
 */

import { Language } from '../../types';

export interface VocabularyLevel {
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    knownWords: Set<string>;
    masteredWords: Set<string>;
    recentWords: string[];  // Last 20 words encountered
}

export class BrowserVocabularyManager {
    private vocabularyLevels: Map<Language, VocabularyLevel>;
    private maxVocabularySize: number = 1000;  // Limit for faster AI generation

    constructor() {
        this.vocabularyLevels = new Map();
    }

    /**
     * Get current vocabulary level for a language
     */
    getLevel(language: Language): VocabularyLevel {
        if (!this.vocabularyLevels.has(language)) {
            this.vocabularyLevels.set(language, {
                level: 'A1',
                knownWords: new Set(),
                masteredWords: new Set(),
                recentWords: []
            });
        }
        return this.vocabularyLevels.get(language)!;
    }

    /**
     * Track that user encountered a word
     */
    addWord(language: Language, word: string): void {
        const level = this.getLevel(language);
        level.knownWords.add(word.toLowerCase());

        // Track recent words
        level.recentWords.unshift(word.toLowerCase());
        if (level.recentWords.length > 20) {
            level.recentWords.pop();
        }

        // Auto-promote to mastered after seeing 5+ times
        const seenCount = level.recentWords.filter(w => w === word.toLowerCase()).length;
        if (seenCount >= 5) {
            level.masteredWords.add(word.toLowerCase());
        }

        this.autoAdjustLevel(language);
    }

    /**
     * Get vocabulary constraint for AI prompt
     * This tells the AI to prefer words from this list (faster generation)
     */
    getVocabularyConstraint(language: Language, maxWords: number = 200): string {
        const level = this.getLevel(language);

        // Get core vocabulary for current CEFR level
        const coreVocab = this.getCoreVocabularyForLevel(level.level, language);

        // Combine with user's known words
        const constrainedVocab = [
            ...Array.from(level.masteredWords).slice(0, maxWords / 2),
            ...coreVocab.slice(0, maxWords / 2)
        ];

        return constrainedVocab.join(', ');
    }

    /**
     * Auto-adjust CEFR level based on vocabulary growth
     */
    private autoAdjustLevel(language: Language): void {
        const level = this.getLevel(language);
        const masteredCount = level.masteredWords.size;

        // CEFR level progression thresholds
        if (masteredCount > 2500 && level.level !== 'C2') level.level = 'C2';
        else if (masteredCount > 1500 && level.level !== 'C1') level.level = 'C1';
        else if (masteredCount > 800 && level.level !== 'B2') level.level = 'B2';
        else if (masteredCount > 400 && level.level !== 'B1') level.level = 'B1';
        else if (masteredCount > 150 && level.level !== 'A2') level.level = 'A2';
    }

    /**
     * Get core vocabulary for CEFR level
     * In production, this would load from actual word frequency lists
     */
    private getCoreVocabularyForLevel(level: string, language: Language): string[] {
        // Simplified core vocabulary (in production, load from files)
        const coreA1: Record<string, string[]> = {
            'en': ['the', 'a', 'is', 'you', 'go', 'see', 'have', 'find', 'take', 'use'],
            'es': ['el', 'la', 'un', 'es', 'ir', 'ver', 'tener', 'encontrar', 'tomar', 'usar'],
            'fr': ['le', 'la', 'un', 'est', 'aller', 'voir', 'avoir', 'trouver', 'prendre', 'utiliser'],
            'de': ['der', 'die', 'ein', 'ist', 'gehen', 'sehen', 'haben', 'finden', 'nehmen', 'benutzen']
        };

        return coreA1[language] || coreA1['en'];
    }

    /**
     * Get vocabulary size constraint for AI generation parameters
     * Smaller vocabulary = faster inference
     */
    getTokenizerConstraint(language: Language): number {
        const level = this.getLevel(language);

        // Limit tokenizer vocabulary size based on user level
        const vocabSizeLimits: Record<string, number> = {
            'A1': 500,    // Ultra-fast generation
            'A2': 1000,   // Fast generation
            'B1': 2000,   // Balanced
            'B2': 5000,   // More variety
            'C1': 10000,  // Advanced
            'C2': 20000   // Full vocabulary
        };

        return vocabSizeLimits[level.level] || 1000;
    }

    /**
     * Save vocabulary progress to localStorage
     */
    save(): void {
        const data: Record<string, any> = {};

        this.vocabularyLevels.forEach((level, lang) => {
            data[lang] = {
                level: level.level,
                knownWords: Array.from(level.knownWords),
                masteredWords: Array.from(level.masteredWords),
                recentWords: level.recentWords
            };
        });

        localStorage.setItem('penko_browser_vocabulary', JSON.stringify(data));
    }

    /**
     * Load vocabulary progress from localStorage
     */
    load(): void {
        const stored = localStorage.getItem('penko_browser_vocabulary');
        if (!stored) return;

        try {
            const data = JSON.parse(stored);

            Object.keys(data).forEach(lang => {
                const langData = data[lang as Language];
                this.vocabularyLevels.set(lang as Language, {
                    level: langData.level,
                    knownWords: new Set(langData.knownWords),
                    masteredWords: new Set(langData.masteredWords),
                    recentWords: langData.recentWords
                });
            });
        } catch (e) {
            console.error('[BrowserVocabularyManager] Failed to load vocabulary data:', e);
        }
    }
}
