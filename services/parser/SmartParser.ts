
import { Language, UserProfile } from '../../types';
import * as APIDict from '../apiDictionaryService';
import { levenshteinDistance } from '../utils/stringUtils';
import { IntegratedLookupService } from '../IntegratedLookupService';
import { VERB_DB, GRAMMAR } from './data/languageData';
import { ENTITY_DB, BIOME_DB } from './data/worldData';

export interface ParseResult {
    intent: string;
    confidence: number;
    feedback?: string;
    correction?: { original: string, corrected: string };
    targetObjectId?: string; // NEW: Language-agnostic object ID from layered dictionary
    targetWord?: string; // NEW: The word that matched the object
}

export class SmartParser {
    private context: { entity: string; feature: string };
    private useAPI: boolean;
    private profile: UserProfile;
    private customBiomeDB: any = null;

    // Tier 22 Integration - Layered Dictionary System
    private lookupService: IntegratedLookupService | null = null;

    constructor(context: { entity: string; feature: string }, useAPI: boolean, profile: UserProfile) {
        this.context = context;
        this.useAPI = useAPI;
        this.profile = profile;
    }

    public updateContext(entity: string, feature: string) {
        this.context = { entity, feature };
    }

    /**
     * Inject the IntegratedLookupService for layered dictionary lookups
     * Enables the full Tier 22 pipeline: morphology + content pack + core + external
     */
    public setLookupService(service: IntegratedLookupService) {
        this.lookupService = service;
    }

    public injectCustomData(data: any) {
        if (data.type === 'biome') {
            this.customBiomeDB = data.data;
        }
    }

    public async parse(input: string, lang: Language): Promise<ParseResult> {
        const lowerInput = input.toLowerCase();
        const inputWords = lowerInput.split(' ');
        let bestIntent = 'NONE';
        let maxScore = 0;
        let feedback = "";
        let correction = undefined;

        // NEW: Tier 22 - Object identification using layered dictionary
        let targetObjectId: string | undefined = undefined;
        let targetWord: string | undefined = undefined;

        // 1. Check Directions specific
        const direction = this.checkDirection(input, lang);
        if (direction) {
            return { intent: `MOVE_${direction}`, confidence: 1.0, targetObjectId, targetWord };
        }

        // 2. NEW: Use IntegratedLookupService to identify objects (nouns)
        if (this.lookupService) {
            try {
                const sentenceParseResult = await this.lookupService.parseSentence(input, lang);

                // If we found any objects with IDs, use the first one as the target
                if (sentenceParseResult.objects.length > 0) {
                    const firstObject = sentenceParseResult.objects[0];
                    targetObjectId = firstObject.objectId;
                    targetWord = firstObject.word;

                    if (this.profile.targetLanguage === lang) {
                        console.log(`[SmartParser] Object identified: "${targetWord}" → ${targetObjectId}`);
                    }
                }
            } catch (error) {
                console.error('[SmartParser] Error in object lookup:', error);
            }
        }

        // 3. Unified API/Local Check (for verbs/intents)
        if (this.useAPI) {
             for (const word of inputWords) {
                 if (word.length < 3) continue;
                 try {
                     const synonyms = await APIDict.getSynonyms(word, lang);
                     const match = this.checkVerbs(synonyms, lang);
                     if (match) return { intent: match, confidence: 0.85, feedback, targetObjectId, targetWord };
                 } catch (e) { }
             }
        }

        // 3. Direct Keyword Match (Fallback if API fails or word is simple like "go")
        Object.entries(VERB_DB).forEach(([intent, langMap]) => {
            // @ts-ignore
            const keywords = langMap[lang] || [];
            const englishKeywords = (langMap as any)[Language.ENGLISH] || [];
            const allKeywords = [...keywords, ...englishKeywords];

            for (const keyword of allKeywords) {
                if (lowerInput.includes(keyword.toLowerCase())) {
                    if (maxScore < 1) {
                        maxScore = 0.8;
                        bestIntent = intent;
                    }
                }
                // Check for fuzzy match on keywords directly if no dictionary
                if (maxScore === 0 && keyword.length > 3) {
                    const dist = levenshteinDistance(lowerInput, keyword.toLowerCase());
                    if (dist <= 2) {
                        maxScore = 0.7;
                        bestIntent = intent;
                        correction = { original: input, corrected: keyword };
                        feedback = `(Spelling) Did you mean '${keyword}'?`;
                    }
                }
            }
        });

        // 4. Contextual Entity Matching
        const entityName = (ENTITY_DB[this.context.entity]?.[lang] || this.context.entity).toLowerCase();
        const featureName = this.findFeatureTranslation(this.context.feature, lang).toLowerCase();

        if (this.context.entity && lowerInput.includes(entityName)) {
            if (bestIntent === 'ATTACK' || bestIntent === 'SPEAK' || bestIntent === 'LOOT') maxScore += 0.2;
            if (bestIntent === 'NONE') { bestIntent = 'ATTACK'; maxScore = 0.5; }
        }

        if (this.context.feature && lowerInput.includes(featureName)) {
             if (bestIntent === 'LOOT') maxScore += 0.2;
             if (bestIntent === 'NONE') { bestIntent = 'LOOT'; maxScore = 0.5; }
        }

        if (bestIntent === 'NONE' && input.length < 10) return { intent: 'MOVE', confidence: 0.4, feedback, targetObjectId, targetWord };

        return { intent: bestIntent, confidence: maxScore, feedback, correction, targetObjectId, targetWord };
    }

    private checkDirection(input: string, lang: Language): string | null {
        const words = input.toLowerCase().split(' ');
        const directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
        
        for (const dir of directions) {
            // @ts-ignore
            const terms = GRAMMAR[dir]?.[lang] || GRAMMAR[dir]?.[Language.ENGLISH] || [];
            if (terms.some(t => input.includes(t.toLowerCase()))) return dir;
        }
        return null;
    }

    private checkVerbs(words: string[], lang: Language): string | null {
        for (const word of words) {
            for (const [intent, verbs] of Object.entries(VERB_DB)) {
                // @ts-ignore
                const langVerbs = verbs[lang] || [];
                // @ts-ignore
                const engVerbs = verbs[Language.ENGLISH] || [];
                if (langVerbs.includes(word.toLowerCase()) || engVerbs.includes(word.toLowerCase())) {
                    return intent;
                }
            }
        }
        return null;
    }

    private findFeatureTranslation(key: string, lang: Language): string {
        if (this.customBiomeDB && this.customBiomeDB[key] && this.customBiomeDB[key][lang]) {
            return this.customBiomeDB[key][lang];
        }
        if (BIOME_DB[key] && BIOME_DB[key][lang]) return BIOME_DB[key][lang];
        
        for (const category of ['NOUN_FEATURE', 'NOUN_QUEST_ITEM', 'NOUN_DECOR', 'NOUN_SCENT']) {
            if (GRAMMAR[category] && GRAMMAR[category][Language.ENGLISH]) {
                const englishItems = GRAMMAR[category][Language.ENGLISH];
                const index = englishItems.indexOf(key);
                if (index >= 0 && GRAMMAR[category][lang]) {
                    return GRAMMAR[category][lang][index];
                }
            }
        }
        return key;
    }
}
