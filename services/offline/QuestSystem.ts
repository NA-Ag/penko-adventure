
import { Language } from '../../types';
import { GRAMMAR } from './data/languageData';
import { BIOME_DB, ENTITY_DB } from './data/worldData';

export interface Quest {
    type: 'kill' | 'loot' | 'explore';
    target: string;
    completed: boolean;
    required: number;
}

export class QuestSystem {
    public static generateQuest(): Quest {
        const rand = Math.random();
        if (rand < 0.33) {
            const targets = ['wolf', 'bandit', 'ghost', 'zombie', 'robot'];
            return { type: 'kill', target: targets[Math.floor(Math.random() * targets.length)], completed: false, required: 3 };
        } else if (rand < 0.66) {
            const items = ['Ancient Relic', 'Golden Idol', 'Lost Map', 'Cursed Ring'];
            return { type: 'loot', target: items[Math.floor(Math.random() * items.length)], completed: false, required: 1 };
        } else {
            return { type: 'explore', target: 'Dungeon', completed: false, required: 5 };
        }
    }

    public static getQuestDescription(quest: Quest, lang: Language, customBiomeDB?: any): string {
        const t = (key: string) => {
            if (customBiomeDB && customBiomeDB[key] && customBiomeDB[key][lang]) return customBiomeDB[key][lang];
            if (BIOME_DB[key] && BIOME_DB[key][lang]) return BIOME_DB[key][lang];
            if (ENTITY_DB[key] && ENTITY_DB[key][lang]) return ENTITY_DB[key][lang];
            // Fallback search
            for (const category of ['NOUN_FEATURE', 'NOUN_QUEST_ITEM', 'NOUN_DECOR', 'NOUN_SCENT']) {
                if (GRAMMAR[category] && GRAMMAR[category][Language.ENGLISH]) {
                    const idx = GRAMMAR[category][Language.ENGLISH].indexOf(key);
                    if (idx >= 0 && GRAMMAR[category][lang]) return GRAMMAR[category][lang][idx];
                }
            }
            return key;
        };

        let desc = "";
        if (quest.type === 'kill') {
             const templates = GRAMMAR.QUEST_DESC_KILL[lang] || GRAMMAR.QUEST_DESC_KILL[Language.ENGLISH];
             const tpl = templates[0];
             desc = tpl.replace('{REQUIRED}', quest.required.toString()).replace('{TARGET}', t(quest.target));
        }
        else if (quest.type === 'loot') {
             const templates = GRAMMAR.QUEST_DESC_LOOT[lang] || GRAMMAR.QUEST_DESC_LOOT[Language.ENGLISH];
             const tpl = templates[0];
             desc = tpl.replace('{TARGET}', t(quest.target));
        }
        else if (quest.type === 'explore') {
             const templates = GRAMMAR.QUEST_DESC_EXPLORE[lang] || GRAMMAR.QUEST_DESC_EXPLORE[Language.ENGLISH];
             const tpl = templates[0];
             desc = tpl.replace('{REQUIRED}', quest.required.toString());
        }
        return desc;
    }
}
