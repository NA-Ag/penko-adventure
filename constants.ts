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

// Gemini Voice Options
export const GEMINI_VOICES = [
    { id: 'Kore', name: 'Kore (Female, Calm)' },
    { id: 'Zephyr', name: 'Zephyr (Female, Soft)' },
    { id: 'Puck', name: 'Puck (Male, Energetic)' },
    { id: 'Charon', name: 'Charon (Male, Deep)' },
    { id: 'Fenrir', name: 'Fenrir (Male, Intense)' },
];

// Voice Effect Presets
export const VOICE_EFFECTS = {
    DROID: { pitch: 1.15, rate: 1.15, filterType: 'highpass' as BiquadFilterType, filterFreq: 1000, distortion: 50 },
    VILLAIN: { pitch: 0.88, rate: 0.9, filterType: 'lowpass' as BiquadFilterType, filterFreq: 600, distortion: 80 },
    NEUTRAL: { pitch: 1.0, rate: 1.0, filterType: 'allpass' as BiquadFilterType, filterFreq: 0, distortion: 0 }
} as const;

// TTS Settings
export const TTS_CONFIG = {
    DEFAULT_VOICE: 'Kore',
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