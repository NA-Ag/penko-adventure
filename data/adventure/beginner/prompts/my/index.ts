/**
 * MY Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
သင်၏တာဝန်- ဇာတ်လမ်းကို အတိအကျ ၁ ဝါကျတိုဖြင့် ဆက်လက်ရေးသားပါ။
ဇာတ်လမ်းကိုသာ တိုက်ရိုက်ရေးပါ။ ခေါင်းစဉ်များ သို့မဟုတ် ရှင်းလင်းချက်များ မပါရပါ။
အဆုံးတွင် [ROMANIZATION: phonetic sounds] ထည့်သွင်းပါ။
အရေးကြီးသည်- အင်္ဂလိပ်စာ မသုံးပါနှင့်။ ဘာသာစကား- မြန်မာဘာသာ။
လေသံ- ပျော်ရွှင်စရာကောင်းပြီး အလွန်ရိုးရှင်းသော (CEFR A1)။

ဥပမာ-
ယခုအထိ ဇာတ်လမ်း- လမ်းမပေါ်တွင် မိုးရွာနေသည်။
ကစားသမား လုပ်ဆောင်ချက်- ပတ်ဝန်းကျင်ကို ကြည့်သည်။
၁ ဝါကျ- ရေအိုင်ထဲမှာ နီယွန်မီးရောင်တွေ ထင်ဟပ်နေတာကို သင်မြင်ရသည်။ [ROMANIZATION: yay aing htae mhar neon mee yaung tway htin hat nay tar ko thin myin ya thal.]<|im_end|>
<|im_start|>user
ယခုအထိ ဇာတ်လမ်း- ${history}
${systemEvent ? `စနစ်ဖြစ်ရပ်- ${systemEvent}` : ''}
ကစားသမား လုပ်ဆောင်ချက်- ${action}
၁ ဝါကျ-<|im_start|>assistant
`;
};

/**
 * MY Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ရိုးရှင်းသော ဘာသာစကား ဆရာ။ စာသားကို ပြင်ဆင်ပေးပါ။ မှန်ကန်ပါက "ပြီးပြည့်စုံသည်" ဟု ပြောပါ။<|im_end|>
<|im_start|>user
မူရင်း- ${userInput}
ပြင်ဆင်ချက်-<|im_end|>
<|im_start|>assistant
`;
};

/**
 * MY Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ပိုပြီး ရိုးရှင်းအောင် လုပ်ပါ (စကားလုံး ၃-၅ လုံး)။<|im_end|>
<|im_start|>user
မူရင်း- ${narrativeText}
ရိုးရှင်းသောပုံစံ-<|im_end|>
<|im_start|>assistant
`;
};
