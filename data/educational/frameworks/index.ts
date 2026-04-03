import { FrameworkMapping, LanguageFramework } from './types';

const defaultCEFRScenarios = [
    {
        id: 'cafe_order',
        title: 'Ordering at a Cafe',
        description: 'Order a coffee and a pastry at a local cafe.',
        systemPrompt: 'You are a barista at a busy cafe. The user is a customer. Keep your sentences short and simple. Ask them what they want to order.',
        objectives: ['Greet the barista', 'Order a drink', 'Order food', 'Ask for the bill']
    },
    {
        id: 'directions',
        title: 'Asking for Directions',
        description: 'You are lost and need to find the train station.',
        systemPrompt: 'You are a helpful local on the street. The user will ask you for directions to the train station. Keep your vocabulary simple and use basic directional terms.',
        objectives: ['Excuse yourself politely', 'Ask where the train station is', 'Thank the local']
    }
];

export const CEFR_FRAMEWORK: LanguageFramework = {
    frameworkName: 'CEFR (Common European Framework)',
    levels: [
        {
            id: 'A1',
            name: 'Beginner (A1)',
            description: 'Can understand and use familiar everyday expressions and very basic phrases.',
            scenarios: defaultCEFRScenarios
        },
        {
            id: 'A2',
            name: 'Elementary (A2)',
            description: 'Can understand sentences and frequently used expressions related to areas of most immediate relevance.',
            scenarios: [
                {
                    id: 'doctor_visit',
                    title: 'At the Doctor',
                    description: 'Explain your symptoms to a doctor.',
                    systemPrompt: 'You are a doctor. The user is a patient. Ask them how they are feeling and what their symptoms are using A2 level vocabulary.',
                    objectives: ['Describe two symptoms', 'Understand the doctor\'s advice', 'Ask about medication']
                },
                {
                    id: 'shopping_clothes',
                    title: 'Clothes Shopping',
                    description: 'Find a specific item of clothing in a store.',
                    systemPrompt: 'You are a shop assistant. The user is looking for a gift. Help them find the right size and color.',
                    objectives: ['Ask for a specific item', 'Discuss sizes', 'Ask about the price']
                }
            ]
        },
        {
            id: 'B1',
            name: 'Intermediate (B1)',
            description: 'Can understand the main points of clear standard input on familiar matters.',
            scenarios: [
                {
                    id: 'job_interview',
                    title: 'Job Interview',
                    description: 'Interview for a part-time job.',
                    systemPrompt: 'You are a hiring manager interviewing the user for a part-time retail job. Ask them about their experience and availability using B1 level vocabulary.',
                    objectives: ['Introduce yourself professionally', 'Describe past experience', 'Ask a question about the role']
                }
            ]
        },
        {
            id: 'B2',
            name: 'Upper Intermediate (B2)',
            description: 'Can understand the main ideas of complex text on both concrete and abstract topics.',
            scenarios: [
                {
                    id: 'cultural_debate',
                    title: 'Social Media Debate',
                    description: 'Discuss the impact of technology on society.',
                    systemPrompt: 'You are a tech-skeptic friend. Engage the user in a debate about whether social media does more harm than good.',
                    objectives: ['State an opinion', 'Provide two supporting reasons', 'Counter-argue a point']
                }
            ]
        },
        {
            id: 'C1',
            name: 'Advanced (C1)',
            description: 'Can understand a wide range of demanding, longer texts, and recognise implicit meaning.',
            scenarios: [
                {
                    id: 'academic_seminar',
                    title: 'Academic Seminar',
                    description: 'Defend a thesis point in a graduate seminar.',
                    systemPrompt: 'You are a university professor. Challenge the user\'s interpretation of a complex historical event or scientific theory.',
                    objectives: ['Summarize your position', 'Cite hypothetical evidence', 'Respond to a critical counter-point']
                }
            ]
        },
        {
            id: 'C2',
            name: 'Mastery (C2)',
            description: 'Can understand with ease virtually everything heard or read.',
            scenarios: [
                {
                    id: 'philosophical_debate',
                    title: 'Ethics of AI',
                    description: 'Debate the nature of consciousness with a philosopher.',
                    systemPrompt: 'You are a renowned philosopher. Engage the user in a deep, nuanced discussion about the definition of "being" in the age of AI.',
                    objectives: ['Define a complex abstract concept', 'Use sophisticated metaphors', 'Handle irony and nuance']
                }
            ]
        }
    ]
};

export const DELF_FRAMEWORK: LanguageFramework = {
    frameworkName: 'DELF/DALF (French)',
    levels: [
         {
            id: 'A1',
            name: 'DELF A1 (Débutant)',
            description: 'Basic knowledge of French. Can interact in a simple way.',
            scenarios: defaultCEFRScenarios
        },
        {
            id: 'A2',
            name: 'DELF A2 (Élémentaire)',
            description: 'Can perform simple tasks of daily life.',
            scenarios: CEFR_FRAMEWORK.levels[1].scenarios
        },
        {
            id: 'B1',
            name: 'DELF B1 (Indépendant)',
            description: 'Can maintain a conversation and give your opinion.',
            scenarios: [
                {
                    id: 'travel_complaint',
                    title: 'Travel Complaint',
                    description: 'Complain about a cancelled flight at the airport.',
                    systemPrompt: 'You are an airline agent. The user\'s flight was cancelled. Handle their frustration and offer alternatives.',
                    objectives: ['Explain the problem', 'Request a refund or rebooking', 'Inquire about a hotel']
                }
            ]
        },
        {
            id: 'B2',
            name: 'DELF B2 (Avancé)',
            description: 'Can argue to defend an opinion and explain your point of view.',
            scenarios: [
                {
                    id: 'recycling_persuasion',
                    title: 'Office Recycling Program',
                    description: 'Convince your boss to invest in an environmental initiative.',
                    systemPrompt: 'You are a skeptical manager. The user wants to start a costly recycling program. Make them convince you of its value.',
                    objectives: ['Present the initiative', 'Explain the benefits', 'Address the manager\'s budget concerns']
                }
            ]
        },
        {
            id: 'C1',
            name: 'DALF C1 (Autonome)',
            description: 'Can communicate with ease and precision on complex subjects.',
            scenarios: [
                {
                    id: 'opinion_synthesis',
                    title: 'Synthesis of Opinions',
                    description: 'Synthesize conflicting views on the future of French cinema.',
                    systemPrompt: 'You are a cultural journalist. Present two conflicting views on cinema and ask the student to synthesize them into a coherent argument.',
                    objectives: ['Identify key arguments', 'Compare two perspectives', 'Formulate a balanced conclusion']
                }
            ]
        },
        {
            id: 'C2',
            name: 'DALF C2 (Maîtrise)',
            description: 'Can express yourself with great precision and nuance.',
            scenarios: CEFR_FRAMEWORK.levels[5].scenarios
        }
    ]
};

export const DELE_FRAMEWORK: LanguageFramework = {
    frameworkName: 'DELE (Spanish)',
    levels: [
        {
            id: 'A1',
            name: 'DELE A1 (Acceso)',
            description: 'Nivel básico de español para situaciones cotidianas.',
            scenarios: defaultCEFRScenarios
        },
        {
            id: 'A2',
            name: 'DELE A2 (Plataforma)',
            description: 'Capacidad para comprender y utilizar expresiones cotidianas de uso frecuente.',
            scenarios: CEFR_FRAMEWORK.levels[1].scenarios
        },
        {
            id: 'B1',
            name: 'DELE B1 (Umbral)',
            description: 'Capacidad para comprender los puntos principales de textos claros.',
            scenarios: [
                {
                    id: 'recounting_journey',
                    title: 'Recounting a Journey',
                    description: 'Tell a story about a past vacation to a friend.',
                    systemPrompt: 'You are a friend at a dinner party. The user just returned from a trip. Encourage them to tell a detailed story using multiple past tenses.',
                    objectives: ['Use preterite tense for events', 'Use imperfect tense for descriptions', 'Express a personal feeling about the trip']
                }
            ]
        },
        {
            id: 'B2',
            name: 'DELE B2 (Avanzado)',
            description: 'Capacidad para interactuar con hablantes nativos con un grado suficiente de fluidez.',
            scenarios: [
                {
                    id: 'apartment_dispute',
                    title: 'Apartment Dispute',
                    description: 'Negotiate repairs with a difficult landlord.',
                    systemPrompt: 'You are a landlord who is reluctant to pay for repairs. The user is a tenant with a leaking ceiling. Be firm but fair.',
                    objectives: ['Describe the damage', 'Argue why it is the landlord\'s responsibility', 'Agree on a repair date']
                }
            ]
        },
        {
            id: 'C1',
            name: 'DELE C1 (Dominio Operativo Eficaz)',
            description: 'Capacidad para comprender una amplia variedad de textos extensos y con cierto nivel de exigencia.',
            scenarios: [
                {
                    id: 'digital_journalism',
                    title: 'Digital Journalism',
                    description: 'A formal debate about the loss of privacy in the digital age.',
                    systemPrompt: 'You are a pro-tech advocate. Engage the user in a formal debate about privacy. Challenge their use of high-level connectors and idioms.',
                    objectives: ['State a complex position', 'Use two idiomatic expressions (refranes)', 'Handle a direct rebuttal']
                }
            ]
        },
        {
            id: 'C2',
            name: 'DELE C2 (Maestría)',
            description: 'Capacidad para expresarse espontáneamente con gran precisión y matices.',
            scenarios: CEFR_FRAMEWORK.levels[5].scenarios
        }
    ]
};

export const CAMBRIDGE_FRAMEWORK: LanguageFramework = {
    frameworkName: 'Cambridge English / TOEFL',
    levels: [
        {
            id: 'B1',
            name: 'PET (Preliminary)',
            description: 'Can deal with most situations while travelling in an English-speaking country.',
            scenarios: CEFR_FRAMEWORK.levels[2].scenarios
        },
        {
            id: 'B2',
            name: 'FCE (First Certificate)',
            description: 'Can communicate effectively and express opinions.',
            scenarios: [
                {
                    id: 'weekend_trip_negotiation',
                    title: 'The Weekend Trip',
                    description: 'Reach a compromise on where to go for a group trip.',
                    systemPrompt: 'You are a friend who wants a relaxing spa weekend. The user wants an active hiking trip. Negotiate until you reach a compromise.',
                    objectives: ['State your preference', 'Negotiate pros and cons', 'Reach a final compromise']
                }
            ]
        },
        {
            id: 'C1',
            name: 'CAE (Advanced)',
            description: 'High-level English skills for academic and professional success.',
            scenarios: [
                {
                    id: 'environmental_study',
                    title: 'Environmental Impact Study',
                    description: 'Analyze the pros and cons of a new high-speed rail project.',
                    systemPrompt: 'You are a government official interviewing the user (an environmental expert). Ask for a deep analysis of a major infrastructure project.',
                    objectives: ['Analyze long-term impacts', 'Use formal academic register', 'Discuss mitigation strategies']
                }
            ]
        }
    ]
};

export const GOETHE_FRAMEWORK: LanguageFramework = {
    frameworkName: 'Goethe-Zertifikat (German)',
    levels: [
        {
            id: 'A1',
            name: 'Goethe-Zertifikat A1',
            description: 'Kann sich auf ganz einfache Weise über konkrete Bedürfnisse verständigen.',
            scenarios: [
                {
                    id: 'lost_and_found',
                    title: 'Lost and Found',
                    description: 'Describe a lost object to an official.',
                    systemPrompt: 'You are an official at a Lost and Found office. The user has lost a bag. Ask for its color, material, and contents.',
                    objectives: ['Greet the official', 'Describe the object\'s color and size', 'State what was inside']
                }
            ]
        },
        {
            id: 'B2',
            name: 'Goethe-Zertifikat B2',
            description: 'Kann die Hauptinhalte komplexer Texte zu konkreten und abstrakten Themen verstehen.',
            scenarios: [
                {
                    id: 'car_sharing_debate',
                    title: 'Car-Sharing Debate',
                    description: 'A logical discussion about urban planning and private transport.',
                    systemPrompt: 'You are a traditionalist who loves private cars. Engage the user in a logical debate about car-sharing initiatives in German cities.',
                    objectives: ['Formulate a logical argument', 'Compare two different models', 'Respond to an urban planning challenge']
                }
            ]
        }
    ]
};

export const JLPT_FRAMEWORK: LanguageFramework = {
    frameworkName: 'JLPT (Japanese)',
    levels: [
        {
            id: 'N5',
            name: 'JLPT N5 (Introductory)',
            description: 'The ability to understand some basic Japanese.',
            scenarios: defaultCEFRScenarios
        },
        {
            id: 'N4',
            name: 'JLPT N4 (Basic)',
            description: 'The ability to understand basic Japanese.',
            scenarios: [
                {
                    id: 'requesting_favor',
                    title: 'Requesting a Favor',
                    description: 'Ask a neighbor for help with a package delivery.',
                    systemPrompt: 'You are a busy neighbor. The user needs you to sign for a package. Expect the user to use polite Desu/Masu forms.',
                    objectives: ['Use appropriate greetings', 'Explain the request politely', 'Express gratitude']
                }
            ]
        },
        {
            id: 'N3',
            name: 'JLPT N3 (Intermediate)',
            description: 'The ability to understand Japanese used in everyday situations to a certain degree.',
            scenarios: [
                {
                    id: 'pharmacy_visit',
                    title: 'At the Pharmacy',
                    description: 'Describe symptoms and ask for medicine.',
                    systemPrompt: 'You are a pharmacist. The user has a mild illness. Ask for details and provide advice using N3-level polite Japanese.',
                    objectives: ['Describe a symptom clearly', 'Ask about dosage', 'Inquire about side effects']
                }
            ]
        },
        {
            id: 'N2',
            name: 'JLPT N2 (Upper Intermediate)',
            description: 'The ability to understand Japanese used in everyday situations and in a variety of circumstances.',
            scenarios: [
                {
                    id: 'festival_volunteer',
                    title: 'Local Festival Volunteer',
                    description: 'Discuss duties at a local Matsuri.',
                    systemPrompt: 'You are a festival coordinator. The user is a volunteer. Explain the schedule and duties using appropriate semi-formal register.',
                    objectives: ['Ask about your specific role', 'Confirm the event timing', 'Navigate a social hierarchy politely']
                }
            ]
        },
        {
            id: 'N1',
            name: 'JLPT N1 (Mastery)',
            description: 'The ability to understand Japanese used in a variety of circumstances.',
            scenarios: [
                {
                    id: 'aging_population',
                    title: 'The Aging Population',
                    description: 'High-level discussion on Japan\'s declining birthrate.',
                    systemPrompt: 'You are a sociologist. Engage the user in a professional discussion about the societal impacts of Japan\'s demographic shift. Use N1-level Kanji-heavy vocabulary.',
                    objectives: ['Discuss economic implications', 'Analyze social trends', 'Propose a hypothetical solution']
                }
            ]
        }
    ]
};

export const HSK_FRAMEWORK: LanguageFramework = {
    frameworkName: 'HSK (Mandarin Chinese)',
    levels: [
        {
            id: 'HSK 1',
            name: 'HSK 1 (Beginner)',
            description: 'Can understand and use very simple Chinese phrases.',
            scenarios: [
                {
                    id: 'meeting_friend',
                    title: 'Meeting a New Friend',
                    description: 'Introduce yourself at a park.',
                    systemPrompt: 'You are a student at a park. The user approaches you to introduce themselves. Use HSK 1 level basic structures.',
                    objectives: ['State your name and origin', 'Ask for the other person\'s name', 'Say a polite farewell']
                }
            ]
        },
        {
            id: 'HSK 2',
            name: 'HSK 2 (Elementary)',
            description: 'Can communicate in Chinese on simple and direct topics.',
            scenarios: [
                {
                    id: 'planning_picnic',
                    title: 'Planning a Picnic',
                    description: 'Coordinate weekend plans with a friend.',
                    systemPrompt: 'You are a friend of the user. Discuss a picnic plan for Saturday. Use HSK 2 level vocabulary.',
                    objectives: ['Check the weather', 'Suggest a meeting time', 'Decide on food to bring']
                }
            ]
        },
        {
            id: 'HSK 3',
            name: 'HSK 3 (Intermediate Low)',
            description: 'Can communicate in Chinese at a basic level in their daily, academic and professional lives.',
            scenarios: [
                {
                    id: 'new_coworker',
                    title: 'The New Coworker',
                    description: 'Explain the company layout to a new employee.',
                    systemPrompt: 'You are a new employee on your first day. The user is your mentor. Ask them about the office and your tasks.',
                    objectives: ['Describe the office environment', 'Explain a daily task', 'Give a helpful tip']
                }
            ]
        },
        {
            id: 'HSK 4',
            name: 'HSK 4 (Intermediate)',
            description: 'Can converse in Chinese on a wide range of topics and are able to communicate relatively fluently with native Chinese speakers.',
            scenarios: [
                {
                    id: 'bank_account',
                    title: 'Opening a Bank Account',
                    description: 'Handle administrative tasks at a bank.',
                    systemPrompt: 'You are a bank clerk in Beijing. The user wants to open an account. Explain the process and requirements.',
                    objectives: ['Explain the reason for the visit', 'Inquire about documents', 'Ask about mobile banking features']
                }
            ]
        },
        {
            id: 'HSK 5',
            name: 'HSK 5 (Upper Intermediate)',
            description: 'Can read Chinese newspapers and magazines, enjoy Chinese films and plays and can make a long speech in Chinese.',
            scenarios: [
                {
                    id: 'environmental_meeting',
                    title: 'Environmental Community Meeting',
                    description: 'Discuss plastic waste reduction.',
                    systemPrompt: 'You are a community organizer. Lead a discussion about a new recycling initiative. Encourage the user to speak at length.',
                    objectives: ['Argue for a specific policy', 'Respond to a concern about cost', 'Summarize a complex viewpoint']
                }
            ]
        },
        {
            id: 'HSK 6',
            name: 'HSK 6 (Advanced)',
            description: 'Can easily understand any information communicated in Chinese and can effectively express themselves.',
            scenarios: [
                {
                    id: 'tradition_vs_modernity',
                    title: 'Tradition vs. Modernity',
                    description: 'Debate the place of ancient traditions in 21st-century China.',
                    systemPrompt: 'You are a modernist who believes traditions hold back progress. Debate the user about the value of ancient Chinese customs today.',
                    objectives: ['Compare historical and modern values', 'Use advanced Chengyu (idioms)', 'Analyze cultural identity']
                }
            ]
        }
    ]
};

export const EDUCATIONAL_FRAMEWORKS: FrameworkMapping = {
    'French': DELF_FRAMEWORK,
    'Japanese': JLPT_FRAMEWORK,
    'Spanish': DELE_FRAMEWORK,
    'English': CAMBRIDGE_FRAMEWORK,
    'German': GOETHE_FRAMEWORK,
    'Mandarin': HSK_FRAMEWORK
};

export function getFrameworkForLanguage(language: string): LanguageFramework {
    return EDUCATIONAL_FRAMEWORKS[language] || CEFR_FRAMEWORK;
}
