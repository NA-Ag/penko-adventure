/**
 * Language Family Registry
 * Maps linguistic roots to Penko-themed icons and member languages.
 */

import { PenkoIconType } from '../components/icons/PenkoIcon';

export interface LanguageFamily {
    id: string;
    label: string;
    description: string;
    icon: PenkoIconType; // Changed from string (emoji) to PenkoIconType
    languages: string[];
}

export const LANGUAGE_FAMILIES: LanguageFamily[] = [
    {
        id: 'romance',
        label: 'Romance',
        description: 'Derived from Latin, spoken across Europe and the Americas.',
        icon: 'romance',
        languages: ['Spanish', 'French', 'Italian', 'Portuguese', 'Romanian', 'Catalan', 'Haitian Creole', 'Latin', 'Galician']
    },
    {
        id: 'germanic',
        label: 'Germanic',
        description: 'Northern and Western European languages, including the global lingua franca.',
        icon: 'germanic',
        languages: ['English', 'German', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Yiddish', 'Afrikaans', 'Icelandic', 'Luxembourgish']
    },
    {
        id: 'slavic',
        label: 'Slavic',
        description: 'Languages of Central and Eastern Europe and Northern Asia.',
        icon: 'slavic',
        languages: ['Russian', 'Ukrainian', 'Polish', 'Czech', 'Slovak', 'Bulgarian', 'Croatian', 'Serbian', 'Macedonian', 'Slovenian']
    },
    {
        id: 'indo_aryan',
        label: 'Indo-Aryan',
        description: 'The dominant language family of the Indian subcontinent.',
        icon: 'indo_aryan',
        languages: ['Hindi', 'Bengali', 'Punjabi', 'Urdu', 'Marathi', 'Gujarati', 'Sindhi', 'Sinhala', 'Oriya', 'Nepali']
    },
    {
        id: 'east_asian',
        label: 'East Asian',
        description: 'Diverse languages from East and Southeast Asia.',
        icon: 'east_asian',
        languages: ['Mandarin', 'Japanese', 'Korean', 'Cantonese', 'Wu Chinese', 'Vietnamese', 'Thai', 'Burmese', 'Khmer', 'Lao', 'Tibetan']
    },
    {
        id: 'austronesian',
        label: 'Austronesian',
        description: 'Languages spoken across the islands of SE Asia and the Pacific.',
        icon: 'austronesian',
        languages: ['Indonesian', 'Javanese', 'Tagalog', 'Malay', 'Hawaiian', 'Malagasy', 'Maori', 'Sundanese']
    },
    {
        id: 'dravidian',
        label: 'Dravidian',
        description: 'Ancient languages of Southern India and Northern Sri Lanka.',
        icon: 'dravidian',
        languages: ['Telugu', 'Tamil', 'Kannada', 'Malayalam']
    },
    {
        id: 'semitic',
        label: 'Semitic',
        description: 'Afroasiatic languages from the Middle East and Horn of Africa.',
        icon: 'semitic',
        languages: ['Arabic', 'Hebrew', 'Amharic', 'Maltese']
    },
    {
        id: 'turkic',
        label: 'Turkic',
        description: 'Languages spanning from Eastern Europe to East Asia.',
        icon: 'turkic',
        languages: ['Turkish', 'Azerbaijani', 'Uzbek', 'Kazakh', 'Kyrgyz']
    },
    {
        id: 'niger_congo',
        label: 'Niger-Congo',
        description: 'The largest language family in Africa.',
        icon: 'niger_congo',
        languages: ['Swahili', 'Zulu', 'Yoruba', 'Igbo', 'Fula', 'Ganda', 'Shona', 'Sotho', 'Chichewa', 'Kinyarwanda']
    },
    {
        id: 'uralic',
        label: 'Uralic',
        description: 'Languages of Northern and Eastern Europe and Siberia.',
        icon: 'uralic',
        languages: ['Finnish', 'Hungarian', 'Estonian']
    },
    {
        id: 'afro_asiatic',
        label: 'Afro-Asiatic',
        description: 'Major languages of the Middle East and Northern Africa.',
        icon: 'afro_asiatic',
        languages: ['Hausa', 'Oromo', 'Somali']
    },
    {
        id: 'celtic',
        label: 'Celtic',
        description: 'Ancient Insular languages of Western Europe.',
        icon: 'celtic',
        languages: ['Irish', 'Welsh', 'Scottish Gaelic']
    },
    {
        id: 'indo_european_other',
        label: 'IE (Other)',
        description: 'Other branches of the Indo-European family.',
        icon: 'ie_other',
        languages: ['Greek', 'Persian', 'Armenian', 'Pashto', 'Kurdish', 'Lithuanian', 'Latvian', 'Tajik']
    },
    {
        id: 'other',
        label: 'Other',
        description: 'Indigenous languages and other families.',
        icon: 'other',
        languages: ['Navajo', 'Georgian', 'Mongolian', 'Albanian', 'Basque']
    }
];
