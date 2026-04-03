/**
 * BN Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
আপনার কাজ: গল্পটি ঠিক ১টি ছোট বাক্যে চালিয়ে যান।
শুধু গল্পটি লিখুন। কোন শিরোনাম বা ব্যাখ্যা দেবেন না।
শেষে [ROMANIZATION: phonetic sounds] অন্তর্ভুক্ত করুন।
জরুরি: ইংরেজি ব্যবহার করবেন না। ভাষা: বাংলা।
টোন: আনন্দদায়ক এবং খুব সহজ (CEFR A1)।

উদাহরণ:
এ পর্যন্ত গল্প: রাস্তায় বৃষ্টি পড়ছে।
খেলোয়াড়ের কাজ: আমি চারপাশে তাকাই।
১টি বাক্য: আপনি গর্তে নিয়ন আলোর প্রতিফলন দেখছেন। [ROMANIZATION: apani gorte niyan alor protiphulon dekhchen.]<|im_end|>
<|im_start|>user
এ পর্যন্ত গল্প: ${history}
${systemEvent ? `সিস্টেম ঘটনা: ${systemEvent}` : ''}
খেলোয়াড়ের কাজ: ${action}
১টি বাক্য:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * BN Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
সহজ ভাষা শিক্ষক। ইনপুট সংশোধন করুন। যদি সঠিক হয়, শুধু বলুন "চমৎকার"।<|im_end|>
<|im_start|>user
মূল: ${userInput}
সংশোধন:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * BN Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
আরও সহজ করুন (৩-৫ শব্দ)।<|im_end|>
<|im_start|>user
মূল: ${narrativeText}
সহজ সংস্করণ:<|im_end|>
<|im_start|>assistant
`;
};
