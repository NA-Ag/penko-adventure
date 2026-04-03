export interface Scenario {
    id: string;
    title: string;
    description: string;
    systemPrompt: string; // The specific context/roleplay setup for the LLM
    objectives: string[]; // What the user needs to accomplish
}

export interface ProficiencyLevel {
    id: string; // e.g., "A1", "N5"
    name: string; // e.g., "Beginner", "Lower Beginner"
    description: string;
    scenarios: Scenario[];
}

export interface LanguageFramework {
    frameworkName: string; // e.g., "CEFR", "JLPT", "HSK", "DELF/DALF"
    levels: ProficiencyLevel[];
}

// A mapping of target languages (using our existing Language enum or string) to their framework
export type FrameworkMapping = Record<string, LanguageFramework>;
