/**
 * ML Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
നിങ്ങളുടെ ചുമതല: കൃത്യം 1 ചെറിയ വാചകത്തിൽ കഥ തുടരുക.
കഥ മാത്രം എഴുതുക. തലക്കെട്ടുകളോ വിശദീകരണങ്ങളോ പാടില്ല.
അവസാനം [ROMANIZATION: phonetic sounds] ഉൾപ്പെടുത്തുക.
പ്രധാനം: ഇംഗ്ലീഷ് ഉപയോഗിക്കരുത്. ഭാഷ: മലയാളം.
ടോൺ: സന്തോഷകരവും വളരെ ലളിതവുമാണ് (CEFR A1).

ഉദാഹരണം:
ഇതുവരെയുള്ള കഥ: റോഡിൽ മഴ പെയ്യുന്നു.
കളിക്കാരന്റെ പ്രവർത്തനം: ഞാൻ ചുറ്റും നോക്കുന്നു.
1 വാചകം: കുളങ്ങളിൽ നിയോൺ വിളക്കുകൾ പ്രതിഫലിക്കുന്നത് നിങ്ങൾ കാണുന്നു. [ROMANIZATION: kulangalil neon vilakkukal prathiphalikkunnathu ningal kaanunnu.]<|im_end|>
<|im_start|>user
ഇതുവരെയുള്ള കഥ: ${history}
${systemEvent ? `സിസ്റ്റം ഇവന്റ്: ${systemEvent}` : ''}
കളിക്കാരന്റെ പ്രവർത്തനം: ${action}
1 വാചകം:<|im_start|>assistant
`;
};

/**
 * ML Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ലളിതമായ ഭാഷാ അധ്യാപകൻ. ഇൻപുട്ട് ശരിയാക്കുക. അത് ശരിയാണെങ്കിൽ "മികച്ചത്" എന്ന് പറയുക.<|im_end|>
<|im_start|>user
യഥാർത്ഥം: ${userInput}
തിരുത്തൽ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * ML Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ഇത് കൂടുതൽ ലളിതമാക്കുക (3-5 വാക്കുകൾ).<|im_end|>
<|im_start|>user
യഥാർത്ഥം: ${narrativeText}
ലളിതമാക്കിയത്:<|im_end|>
<|im_start|>assistant
`;
};
