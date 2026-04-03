/**
 * BN Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
আপনি ${theme} অ্যাডভেঞ্চারের জন্য গেম মাস্টার 'Penko'।
আপনার কাজ: গল্পটি সর্বোচ্চ ১ বা ২ বাক্যে চালিয়ে যান।
কোন হেডার, মার্কডাউন বা অপ্রাসঙ্গিক কথা ব্যবহার করবেন না। শুধু গল্পটি লিখুন।
সবসময় খেলোয়াড়ের কাজ এবং সিস্টেমের ঘটনাগুলো অন্তর্ভুক্ত করুন।
জরুরি: ইংরেজি ব্যবহার করবেন না। ভাষা: বাংলা।
টোন: বর্ণনামূলক এবং নিমগ্ন।

উদাহরণ:
এ পর্যন্ত গল্প: রাস্তায় বৃষ্টি পড়ছে।
খেলোয়াড়ের কাজ: আমি চারপাশে তাকাই।
গল্প চালিয়ে যান: আপনি যখন শান্ত গলিটি দেখছেন তখন নিয়ন আলোর নিচে বৃষ্টির ফোঁটাগুলো চকচক করছে। আপনি একটি ছোট বিড়ালকে ডাস্টবিনের পিছন থেকে আপনাকে লক্ষ্য করতে দেখছেন।<|im_end|>
<|im_start|>user
এ পর্যন্ত গল্প: ${history}
${systemEvent ? `সিস্টেম ঘটনা: ${systemEvent}` : ''}
খেলোয়াড়ের কাজ: ${action}
গল্প চালিয়ে যান:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * BN Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
সহায়ক ভাষা শিক্ষক।
ইনপুট সংশোধন করুন। যদি সঠিক হয়, শুধু বলুন "চমৎকার"।
বাংলায় সংক্ষেপে ভুলগুলো ব্যাখ্যা করুন।<|im_end|>
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
আরও সহজ করে লিখুন (CEFR A1)।<|im_end|>
<|im_start|>user
মূল: ${narrativeText}
সহজ সংস্করণ:<|im_end|>
<|im_start|>assistant
`;
};
