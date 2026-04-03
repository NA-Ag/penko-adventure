import * as af from './af';
import * as am from './am';
import * as ar from './ar';
import * as az from './az';
import * as bg from './bg';
import * as bn from './bn';
import * as bo from './bo';
import * as ca from './ca';
import * as cs from './cs';
import * as cy from './cy';
import * as da from './da';
import * as de from './de';
import * as el from './el';
import * as en from './en';
import * as es from './es';
import * as et from './et';
import * as eu from './eu';
import * as fa from './fa';
import * as ff from './ff';
import * as fi from './fi';
import * as fr from './fr';
import * as ga from './ga';
import * as gd from './gd';
import * as gl from './gl';
import * as gu from './gu';
import * as ha from './ha';
import * as haw from './haw';
import * as he from './he';
import * as hi from './hi';
import * as hr from './hr';
import * as ht from './ht';
import * as hu from './hu';
import * as hy from './hy';
import * as id from './id';
import * as ig from './ig';
import * as is from './is';
import * as it from './it';
import * as ja from './ja';
import * as jv from './jv';
import * as ka from './ka';
import * as kk from './kk';
import * as km from './km';
import * as kn from './kn';
import * as ko from './ko';
import * as ku from './ku';
import * as ky from './ky';
import * as la from './la';
import * as lb from './lb';
import * as lg from './lg';
import * as lo from './lo';
import * as lt from './lt';
import * as lv from './lv';
import * as mg from './mg';
import * as mi from './mi';
import * as mk from './mk';
import * as ml from './ml';
import * as mn from './mn';
import * as mr from './mr';
import * as ms from './ms';
import * as mt from './mt';
import * as my from './my';
import * as ne from './ne';
import * as nl from './nl';
import * as no from './no';
import * as nv from './nv';
import * as ny from './ny';
import * as om from './om';
import * as or from './or';
import * as pa from './pa';
import * as pl from './pl';
import * as ps from './ps';
import * as pt from './pt';
import * as ro from './ro';
import * as ru from './ru';
import * as rw from './rw';
import * as sd from './sd';
import * as si from './si';
import * as sk from './sk';
import * as sl from './sl';
import * as sn from './sn';
import * as so from './so';
import * as sq from './sq';
import * as sr from './sr';
import * as st from './st';
import * as su from './su';
import * as sv from './sv';
import * as sw from './sw';
import * as ta from './ta';
import * as te from './te';
import * as tg from './tg';
import * as th from './th';
import * as tl from './tl';
import * as tr from './tr';
import * as uk from './uk';
import * as ur from './ur';
import * as uz from './uz';
import * as vi from './vi';
import * as wuu from './wuu';
import * as yi from './yi';
import * as yo from './yo';
import * as yue from './yue';
import * as zh from './zh';
import * as zu from './zu';

export const PROMPTS = {
    af, am, ar, az, bg, bn, bo, ca, cs, cy, da, de, el, en, es, et, eu, fa, ff, fi, fr, ga, gd, gl, gu, ha, haw, he, hi, hr, ht, hu, hy, id, ig, is, it, ja, jv, ka, kk, km, kn, ko, ku, ky, la, lb, lg, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, no, nv, ny, om, or, pa, pl, ps, pt, ro, ru, rw, sd, si, sk, sl, sn, so, sq, sr, st, su, sv, sw, ta, te, tg, th, tl, tr, uk, ur, uz, vi, wuu, yi, yo, yue, zh, zu
} as Record<string, any>;

/**
 * Helper to get the correct educational prompt set for a language.
 * Falls back to English if the language folder does not exist yet.
 */
export const getEducationalPromptSet = (langCode: string) => {
    const mapping: Record<string, string> = {
        'Afrikaans': 'af',
        'Amharic': 'am',
        'Arabic': 'ar',
        'Azerbaijani': 'az',
        'Bulgarian': 'bg',
        'Bengali': 'bn',
        'Tibetan': 'bo',
        'Catalan': 'ca',
        'Czech': 'cs',
        'Welsh': 'cy',
        'Danish': 'da',
        'German': 'de',
        'Greek': 'el',
        'English': 'en',
        'Spanish': 'es',
        'Estonian': 'et',
        'Basque': 'eu',
        'Persian': 'fa',
        'Fula': 'ff',
        'Finnish': 'fi',
        'French': 'fr',
        'Irish': 'ga',
        'Scottish Gaelic': 'gd',
        'Galician': 'gl',
        'Gujarati': 'gu',
        'Hausa': 'ha',
        'Hawaiian': 'haw',
        'Hebrew': 'he',
        'Hindi': 'hi',
        'Croatian': 'hr',
        'Haitian Creole': 'ht',
        'Hungarian': 'hu',
        'Armenian': 'hy',
        'Indonesian': 'id',
        'Igbo': 'ig',
        'Icelandic': 'is',
        'Italian': 'it',
        'Japanese': 'ja',
        'Javanese': 'jv',
        'Georgian': 'ka',
        'Kazakh': 'kk',
        'Khmer': 'km',
        'Kannada': 'kn',
        'Korean': 'ko',
        'Kurdish': 'ku',
        'Kyrgyz': 'ky',
        'Latin': 'la',
        'Luxembourgish': 'lb',
        'Ganda': 'lg',
        'Lao': 'lo',
        'Lithuanian': 'lt',
        'Latvian': 'lv',
        'Malagasy': 'mg',
        'Maori': 'mi',
        'Macedonian': 'mk',
        'Malayalam': 'ml',
        'Mongolian': 'mn',
        'Marathi': 'mr',
        'Malay': 'ms',
        'Maltese': 'mt',
        'Burmese': 'my',
        'Nepali': 'ne',
        'Dutch': 'nl',
        'Norwegian': 'no',
        'Navajo': 'nv',
        'Chichewa': 'ny',
        'Oromo': 'om',
        'Oriya': 'or',
        'Punjabi': 'pa',
        'Polish': 'pl',
        'Pashto': 'ps',
        'Portuguese': 'pt',
        'Romanian': 'ro',
        'Russian': 'ru',
        'Kinyarwanda': 'rw',
        'Sindhi': 'sd',
        'Sinhala': 'si',
        'Slovak': 'sk',
        'Slovenian': 'sl',
        'Shona': 'sn',
        'Somali': 'so',
        'Albanian': 'sq',
        'Serbian': 'sr',
        'Sotho': 'st',
        'Sundanese': 'su',
        'Swedish': 'sv',
        'Swahili': 'sw',
        'Tamil': 'ta',
        'Telugu': 'te',
        'Tajik': 'tg',
        'Thai': 'th',
        'Tagalog': 'tl',
        'Turkish': 'tr',
        'Ukrainian': 'uk',
        'Urdu': 'ur',
        'Uzbek': 'uz',
        'Vietnamese': 'vi',
        'Wu Chinese': 'wuu',
        'Yiddish': 'yi',
        'Yoruba': 'yo',
        'Cantonese': 'yue',
        'Mandarin': 'zh',
        'Zulu': 'zu'
    };

    const normalized = mapping[langCode] || langCode.toLowerCase();
    
    // Check exact match
    if (PROMPTS[normalized]) return PROMPTS[normalized];
    
    // Check 2-letter prefix
    const twoLetter = normalized.substring(0, 2);
    if (PROMPTS[twoLetter]) return PROMPTS[twoLetter];

    // Default to English
    return PROMPTS.en;
};

// Legacy export for compatibility during transition if needed
export const educationalPrompts = PROMPTS.en;
