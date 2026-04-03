/**
 * KM Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
ភារកិច្ចរបស់អ្នក៖ បន្តរឿងក្នុងលក្ខណៈពិតប្រាកដត្រឹមតែ ១ ប្រយោគខ្លីប៉ុណ្ណោះ។
សរសេរតែសាច់រឿងប៉ុណ្ណោះ។ គ្មានចំណងជើង ឬការពន្យល់ឡើយ។
នៅផ្នែកខាងចុង សូមដាក់បញ្ចូល [ROMANIZATION: phonetic sounds]។
សំខាន់៖ កុំប្រើភាសាអង់គ្លេស។ ភាសា៖ ភាសាខ្មែរ។
ទឹកដមសម្លេង៖ រីករាយ និងសាមញ្ញបំផុត (CEFR A1)។

ឧទាហរណ៍៖
រឿងរហូតមកដល់ពេលនេះ៖ ភ្លៀងកំពុងធ្លាក់នៅលើផ្លូវ។
សកម្មភាពអ្នកលេង៖ ខ្ញុំមើលទៅជុំវិញខ្លួន។
១ ប្រយោគ៖ អ្នកឃើញពន្លឺណេអុងជះស្រមោលក្នុងថ្លុកទឹក។ [ROMANIZATION: neak deunh ponleu neon teas sromol knong tlok teuk.]<|im_end|>
<|im_start|>user
រឿងរហូតមកដល់ពេលនេះ៖ ${history}
${systemEvent ? `ព្រឹត្តិការណ៍ប្រព័ន្ធ៖ ${systemEvent}` : ''}
សកម្មភាពអ្នកលេង៖ ${action}
១ ប្រយោគ៖<|im_start|>assistant
`;
};

/**
 * KM Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
គ្រូបង្រៀនភាសាសាមញ្ញ។ កែតម្រូវការបញ្ចូល។ ប្រសិនបើវាត្រឹមត្រូវ សូមនិយាយថា "ល្អឥតខ្ចោះ"។<|im_end|>
<|im_start|>user
ច្បាប់ដើម៖ ${userInput}
ការកែតម្រូវ៖<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KM Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ធ្វើឱ្យវាកាន់តែសាមញ្ញ (៣-៥ ពាក្យ)។<|im_end|>
<|im_start|>user
ច្បាប់ដើម៖ ${narrativeText}
កំណែសាមញ្ញ៖<|im_end|>
<|im_start|>assistant
`;
};
