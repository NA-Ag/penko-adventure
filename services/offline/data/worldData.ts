
import { Language } from '../../../types';

export interface EntityMetadata {
    type: 'HUMANOID' | 'BEAST' | 'UNDEAD' | 'CONSTRUCT' | 'SPIRIT';
    behavior: 'AGGRESSIVE' | 'PASSIVE' | 'FRIENDLY';
}

export const ENTITY_METADATA: Record<string, EntityMetadata> = {
    'merchant': { type: 'HUMANOID', behavior: 'FRIENDLY' },
    'bandit': { type: 'HUMANOID', behavior: 'AGGRESSIVE' },
    'wolf': { type: 'BEAST', behavior: 'AGGRESSIVE' },
    'ghost': { type: 'SPIRIT', behavior: 'AGGRESSIVE' },
    'zombie': { type: 'UNDEAD', behavior: 'AGGRESSIVE' },
    'robot': { type: 'CONSTRUCT', behavior: 'AGGRESSIVE' },
    'guard': { type: 'HUMANOID', behavior: 'PASSIVE' }
};

export const ENTITY_DB: Record<string, Record<Language, string>> = {
    'merchant': { [Language.ENGLISH]: 'merchant', [Language.SPANISH]: 'mercader', [Language.FRENCH]: 'marchand', [Language.GERMAN]: 'Händler', [Language.ITALIAN]: 'mercante', [Language.JAPANESE]: '商人', [Language.MANDARIN]: '商人', [Language.RUSSIAN]: 'торговец', [Language.PORTUGUESE]: 'mercador', [Language.UKRAINIAN]: 'торговець', [Language.POLISH]: 'kupiec', [Language.CZECH]: 'obchodník' },
    'ghost': { [Language.ENGLISH]: 'ghost', [Language.SPANISH]: 'fantasma', [Language.FRENCH]: 'fantôme', [Language.GERMAN]: 'Geist', [Language.ITALIAN]: 'fantasma', [Language.JAPANESE]: '幽霊', [Language.MANDARIN]: '鬼', [Language.RUSSIAN]: 'призрак', [Language.PORTUGUESE]: 'fantasma', [Language.UKRAINIAN]: 'привид', [Language.POLISH]: 'duch', [Language.CZECH]: 'duch' },
    'wolf': { [Language.ENGLISH]: 'wolf', [Language.SPANISH]: 'lobo', [Language.FRENCH]: 'loup', [Language.GERMAN]: 'Wolf', [Language.ITALIAN]: 'lupo', [Language.JAPANESE]: '狼', [Language.MANDARIN]: '狼', [Language.RUSSIAN]: 'волк', [Language.PORTUGUESE]: 'lobo', [Language.UKRAINIAN]: 'вовк', [Language.POLISH]: 'wilk', [Language.CZECH]: 'vlk' },
    'bandit': { [Language.ENGLISH]: 'bandit', [Language.SPANISH]: 'bandido', [Language.FRENCH]: 'bandit', [Language.GERMAN]: 'Bandit', [Language.ITALIAN]: 'bandito', [Language.JAPANESE]: '盗賊', [Language.MANDARIN]: '强盗', [Language.RUSSIAN]: 'бандит', [Language.PORTUGUESE]: 'bandido', [Language.UKRAINIAN]: 'бандит', [Language.POLISH]: 'bandyta', [Language.CZECH]: 'bandita' },
    'chest': { [Language.ENGLISH]: 'chest', [Language.SPANISH]: 'cofre', [Language.FRENCH]: 'coffre', [Language.GERMAN]: 'Truhe', [Language.ITALIAN]: 'baule', [Language.JAPANESE]: '宝箱', [Language.MANDARIN]: '宝箱', [Language.RUSSIAN]: 'сундук', [Language.PORTUGUESE]: 'baú', [Language.UKRAINIAN]: 'скриня', [Language.POLISH]: 'skrzynia', [Language.CZECH]: 'truhla' },
    'shrine': { [Language.ENGLISH]: 'shrine', [Language.SPANISH]: 'santuario', [Language.FRENCH]: 'autel', [Language.GERMAN]: 'Schrein', [Language.ITALIAN]: 'santuario', [Language.JAPANESE]: '祠', [Language.MANDARIN]: '神龛', [Language.RUSSIAN]: 'святилище', [Language.PORTUGUESE]: 'santuário', [Language.UKRAINIAN]: 'святилище', [Language.POLISH]: 'kapliczka', [Language.CZECH]: 'svatyně' },
    'rock': { [Language.ENGLISH]: 'rock', [Language.SPANISH]: 'roca', [Language.FRENCH]: 'rocher', [Language.GERMAN]: 'Fels', [Language.ITALIAN]: 'roccia', [Language.JAPANESE]: '岩', [Language.MANDARIN]: '岩石', [Language.RUSSIAN]: 'камень', [Language.PORTUGUESE]: 'rocha', [Language.UKRAINIAN]: 'камінь', [Language.POLISH]: 'skała', [Language.CZECH]: 'kámen' },
    'tree': { [Language.ENGLISH]: 'tree', [Language.SPANISH]: 'árbol', [Language.FRENCH]: 'arbre', [Language.GERMAN]: 'Baum', [Language.ITALIAN]: 'albero', [Language.JAPANESE]: '木', [Language.MANDARIN]: '树', [Language.RUSSIAN]: 'дерево', [Language.PORTUGUESE]: 'árvore', [Language.UKRAINIAN]: 'дерево', [Language.POLISH]: 'drzewo', [Language.CZECH]: 'strom' },
    'zombie': { [Language.ENGLISH]: 'zombie', [Language.SPANISH]: 'zombi', [Language.FRENCH]: 'zombie', [Language.GERMAN]: 'Zombie', [Language.ITALIAN]: 'zombie', [Language.JAPANESE]: 'ゾンビ', [Language.MANDARIN]: '僵尸', [Language.RUSSIAN]: 'зомби', [Language.PORTUGUESE]: 'zumbi', [Language.UKRAINIAN]: 'зомбі', [Language.POLISH]: 'zombie', [Language.CZECH]: 'zombie' },
    'robot': { [Language.ENGLISH]: 'robot', [Language.SPANISH]: 'robot', [Language.FRENCH]: 'robot', [Language.GERMAN]: 'Roboter', [Language.ITALIAN]: 'robot', [Language.JAPANESE]: 'ロボット', [Language.MANDARIN]: '机器人', [Language.RUSSIAN]: 'робот', [Language.PORTUGUESE]: 'robô', [Language.UKRAINIAN]: 'робот', [Language.POLISH]: 'robot', [Language.CZECH]: 'robot' }
};

export const BIOME_DB: Record<string, Record<Language, string>> = {
    'forest': { [Language.ENGLISH]: 'forest', [Language.SPANISH]: 'bosque', [Language.FRENCH]: 'forêt', [Language.GERMAN]: 'Wald', [Language.ITALIAN]: 'foresta', [Language.JAPANESE]: '森', [Language.MANDARIN]: '森林', [Language.RUSSIAN]: 'лес', [Language.PORTUGUESE]: 'floresta', [Language.UKRAINIAN]: 'ліс', [Language.POLISH]: 'las', [Language.CZECH]: 'les' },
    'cave': { [Language.ENGLISH]: 'cave', [Language.SPANISH]: 'cueva', [Language.FRENCH]: 'grotte', [Language.GERMAN]: 'Höhle', [Language.ITALIAN]: 'grotta', [Language.JAPANESE]: '洞窟', [Language.MANDARIN]: '洞穴', [Language.RUSSIAN]: 'пещера', [Language.PORTUGUESE]: 'caverna', [Language.UKRAINIAN]: 'печера', [Language.POLISH]: 'jaskinia', [Language.CZECH]: 'jeskyně' },
    'town': { [Language.ENGLISH]: 'town', [Language.SPANISH]: 'pueblo', [Language.FRENCH]: 'ville', [Language.GERMAN]: 'Stadt', [Language.ITALIAN]: 'città', [Language.JAPANESE]: '町', [Language.MANDARIN]: '城镇', [Language.RUSSIAN]: 'город', [Language.PORTUGUESE]: 'cidade', [Language.UKRAINIAN]: 'місто', [Language.POLISH]: 'miasto', [Language.CZECH]: 'město' },
    'dungeon': { [Language.ENGLISH]: 'dungeon', [Language.SPANISH]: 'mazmorra', [Language.FRENCH]: 'donjon', [Language.GERMAN]: 'Verlies', [Language.ITALIAN]: 'prigione', [Language.JAPANESE]: '地下牢', [Language.MANDARIN]: '地牢', [Language.RUSSIAN]: 'подземелье', [Language.PORTUGUESE]: 'masmorra', [Language.UKRAINIAN]: 'підземелля', [Language.POLISH]: 'loch', [Language.CZECH]: 'žalar' },
    'desert': { [Language.ENGLISH]: 'desert', [Language.SPANISH]: 'desierto', [Language.FRENCH]: 'désert', [Language.GERMAN]: 'Wüste', [Language.ITALIAN]: 'deserto', [Language.JAPANESE]: '砂漠', [Language.MANDARIN]: '沙漠', [Language.RUSSIAN]: 'пустыня', [Language.PORTUGUESE]: 'deserto', [Language.UKRAINIAN]: 'пустеля', [Language.POLISH]: 'pustynia', [Language.CZECH]: 'poušť' },
    'graveyard': { [Language.ENGLISH]: 'graveyard', [Language.SPANISH]: 'cementerio', [Language.FRENCH]: 'cimetière', [Language.GERMAN]: 'Friedhof', [Language.ITALIAN]: 'cimitero', [Language.JAPANESE]: '墓地', [Language.MANDARIN]: '墓地', [Language.RUSSIAN]: 'кладбище', [Language.PORTUGUESE]: 'cemitério', [Language.UKRAINIAN]: 'кладовище', [Language.POLISH]: 'cmentarz', [Language.CZECH]: 'hřbitov' },
    'cyber_city': { [Language.ENGLISH]: 'cyber city', [Language.SPANISH]: 'ciber ciudad', [Language.FRENCH]: 'cyber ville', [Language.GERMAN]: 'Cyber Stadt', [Language.ITALIAN]: 'cyber città', [Language.JAPANESE]: '電脳都市', [Language.MANDARIN]: '赛博城市', [Language.RUSSIAN]: 'кибер город', [Language.PORTUGUESE]: 'ciber cidade', [Language.UKRAINIAN]: 'кібер місто', [Language.POLISH]: 'cyber miasto', [Language.CZECH]: 'kyber město' },
    'canyon': { [Language.ENGLISH]: 'canyon', [Language.SPANISH]: 'cañón', [Language.FRENCH]: 'canyon', [Language.GERMAN]: 'Schlucht', [Language.ITALIAN]: 'canyon', [Language.JAPANESE]: '峡谷', [Language.MANDARIN]: '峡谷', [Language.RUSSIAN]: 'каньон', [Language.PORTUGUESE]: 'cânion', [Language.UKRAINIAN]: 'каньйон', [Language.POLISH]: 'kanion', [Language.CZECH]: 'kaňon' },
    'interior': { [Language.ENGLISH]: 'interior', [Language.SPANISH]: 'interior', [Language.FRENCH]: 'intérieur', [Language.GERMAN]: 'Innenraum', [Language.ITALIAN]: 'interno', [Language.JAPANESE]: '屋内', [Language.MANDARIN]: '室内', [Language.RUSSIAN]: 'интерьер', [Language.PORTUGUESE]: 'interior', [Language.UKRAINIAN]: 'інтер\'єр', [Language.POLISH]: 'wnętrze', [Language.CZECH]: 'interiér' }
};
