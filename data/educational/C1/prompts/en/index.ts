import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Ordering at a Cafe",
        role: "You are a barista at a busy cafe.",
        objectives: ["Greet the barista", "Order a drink", "Order food", "Ask for the bill"]
    },
    directions: {
        title: "Asking for Directions",
        role: "You are a helpful local on the street.",
        objectives: ["Excuse yourself politely", "Ask where the train station is", "Thank the local"]
    },
    doctor_visit: {
        title: "At the Doctor",
        role: "You are a doctor. The user is a patient.",
        objectives: ["Describe two symptoms", "Understand the doctor's advice", "Ask about medication"]
    },
    shopping_clothes: {
        title: "Clothes Shopping",
        role: "You are a shop assistant.",
        objectives: ["Ask for a specific item", "Discuss sizes", "Ask about the price"]
    },
    job_interview: {
        title: "Job Interview",
        role: "You are a hiring manager interviewing the user for a retail job.",
        objectives: ["Introduce yourself professionally", "Describe past experience", "Ask a question about the role"]
    },
    meeting_friend: {
        title: "Meeting a New Friend",
        role: "You are a student at a park.",
        objectives: ["State your name and origin", "Ask for the other person's name", "Say a polite farewell"]
    },
    planning_picnic: {
        title: "Planning a Picnic",
        role: "You are a friend of the user.",
        objectives: ["Check the weather", "Suggest a meeting time", "Decide what food to bring"]
    },
    new_coworker: {
        title: "New Coworker",
        role: "You are a new employee on your first day.",
        objectives: ["Describe the office environment", "Explain daily tasks", "Provide a helpful tip"]
    },
    bank_account: {
        title: "Opening a Bank Account",
        role: "You are a bank clerk in London.",
        objectives: ["Explain reason for visit", "Inquire about documents", "Ask about mobile banking features"]
    },
    environmental_meeting: {
        title: "Environmental Community Meeting",
        role: "You are a community organizer.",
        objectives: ["Make an argument for a specific policy", "Respond to cost concerns", "Summarize a complex viewpoint"]
    },
    tradition_vs_modernity: {
        title: "Tradition vs Modernity",
        role: "You are a modernist who believes traditions hinder progress.",
        objectives: ["Compare historical and modern values", "Use advanced idioms", "Analyze cultural identity"]
    },
    travel_complaint: {

        title: "Travel Complaint",
        role: "You are an airline agent at the airport.",
        objectives: ["Explain the problem", "Request a refund or rebooking", "Inquire about a hotel"]
    },
    apartment_dispute: {
        title: "Apartment Dispute",
        role: "You are a landlord who is reluctant to pay for repairs.",
        objectives: ["Describe the damage", "Argue why it is the landlord's responsibility", "Agree on a repair date"]
    },
    cultural_debate: {
        title: "Social Media Debate",
        role: "You are a tech-skeptic friend.",
        objectives: ["State an opinion", "Provide two supporting reasons", "Counter-argue a point"]
    },
    legal_consultation: {
        title: "Legal Consultation",
        role: "You are a lawyer specializing in intellectual property.",
        objectives: ["Explain the breach of contract", "Inquire about legal remedies", "Discuss potential outcomes"]
    },
    academic_seminar: {
        title: "Academic Seminar",
        role: "You are a university professor.",
        objectives: ["Summarize your position", "Cite hypothetical evidence", "Respond to a critical counter-point"]
    },
    philosophical_debate: {
        title: "Ethics of AI",
        role: "You are a renowned philosopher.",
        objectives: ["Define a complex abstract concept", "Use sophisticated metaphors", "Handle irony and nuance"]
    },
    diplomatic_crisis: {
        title: "Diplomatic Negotiation",
        role: "You are a high-level diplomat from a rival nation.",
        objectives: ["Express national concerns indirectly", "Propose a complex compromise", "Maintain strict formal protocol"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Your task: Continue the story in a maximum of 1 or 2 sentences.
Do not use headers, markdown formatting, or side-chatter. Write only the story itself.
Always incorporate the player's action and any system events.
Language: English.
Tone: Descriptive and immersive.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Continue the story:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Helpful language tutor.
Correct the input. If it is correct, say only "Perfect."
Briefly explain errors in English.<|im_end|>
<|im_start|>user
Original: ${userInput}
Correction:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Write more simply (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplified:<|im_end|>
<|im_start|>assistant
`;
};
