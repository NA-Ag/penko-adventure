import { Language } from './types';

// Audio Settings
export const AUDIO = {
    CLICK_FREQUENCY: 800,
    CLICK_DURATION: 0.05,
    SEND_FREQUENCY: 440,
    SEND_DURATION: 0.1,
    RECEIVE_FREQUENCY: 220,
    RECEIVE_DURATION: 0.2,
    VOLUME_MASTER: 0.1,
    SAMPLE_RATE: 24000
} as const;

// Kokoro Local Voice Options
export const KOKORO_VOICES = [
    // English (US)
    { id: 'af_heart', name: 'US Female 1 (Heart)' },
    { id: 'af_bella', name: 'US Female 2 (Bella)' },
    { id: 'af_kore', name: 'US Female 3 (Kore)' },
    { id: 'af_nicole', name: 'US Female 4 (Nicole)' },
    { id: 'am_adam', name: 'US Male 1 (Adam)' },
    { id: 'am_michael', name: 'US Male 2 (Michael)' },
    { id: 'am_puck', name: 'US Male 3 (Puck)' },
    // English (UK)
    { id: 'bf_emma', name: 'UK Female 1 (Emma)' },
    { id: 'bf_isabella', name: 'UK Female 2 (Isabella)' },
    { id: 'bm_george', name: 'UK Male 1 (George)' },
    { id: 'bm_lewis', name: 'UK Male 2 (Lewis)' },
    // Spanish
    { id: 'ef_dora', name: 'ES Female 1 (Dora)' },
    { id: 'em_alex', name: 'ES Male 1 (Alex)' },
    // French
    { id: 'ff_siwis', name: 'FR Female 1 (Siwis)' },
    // Italian
    { id: 'if_sara', name: 'IT Female 1 (Sara)' },
    { id: 'im_nicola', name: 'IT Male 1 (Nicola)' },
    // Japanese
    { id: 'jf_alpha', name: 'JA Female 1 (Alpha)' },
    { id: 'jf_gongitsune', name: 'JA Female 2 (Gongitsune)' },
    { id: 'jm_kumo', name: 'JA Male 1 (Kumo)' },
    // Mandarin
    { id: 'zf_xiaobei', name: 'ZH Female 1 (Xiaobei)' },
    { id: 'zf_xiaoni', name: 'ZH Female 2 (Xiaoni)' },
    { id: 'zm_yunxi', name: 'ZH Male 1 (Yunxi)' },
    { id: 'zm_yunjian', name: 'ZH Male 2 (Yunjian)' },
    // Portuguese
    { id: 'pf_dora', name: 'PT Female 1 (Dora)' },
    { id: 'pm_alex', name: 'PT Male 1 (Alex)' }
];

// TTS Settings
export const TTS_CONFIG = {
    DEFAULT_VOICE: 'af_heart',
    ESPEAK_PITCH: 50,
    ESPEAK_SPEED: 150,
    ESPEAK_CONFIG_URL: "https://unpkg.com/mespeak@2.0.2/src/mespeak_config.json",
    ESPEAK_VOICE_URL: "https://unpkg.com/mespeak@2.0.2/voices/en/en.json"
} as const;

// Game Balance
export const GAME_BALANCE = {
    STARTING_HEALTH: 100,
    MAX_HEALTH: 100,
    CRITICAL_HEALTH_THRESHOLD: 20
} as const;

// Visualizer
export const VISUALS = {
    TILE_SIZE: 96,
    GRID_COLS: 8,
    GRID_ROWS: 5,
    ANIMATION_INTERVAL: 200
} as const;

// Language Codes mapping for Browser TTS
export const LANG_CODES: Record<string, string> = {
    [Language.ENGLISH]: 'en-US',
    [Language.SPANISH]: 'es-ES',
    [Language.FRENCH]: 'fr-FR',
    [Language.GERMAN]: 'de-DE',
    [Language.ITALIAN]: 'it-IT',
    [Language.JAPANESE]: 'ja-JP',
    [Language.MANDARIN]: 'zh-CN',
    [Language.RUSSIAN]: 'ru-RU',
    [Language.PORTUGUESE]: 'pt-BR',
    [Language.UKRAINIAN]: 'uk-UA',
    [Language.POLISH]: 'pl-PL',
    [Language.CZECH]: 'cs-CZ'
};