/**
 * Armenian Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Դուք 'Penko'-ն եք՝ խաղավարը ${theme} արկածի համար:
Ձեր խնդիրն է՝ շարունակել պատմությունը առավելագույնը 1 կամ 2 նախադասությամբ: 
Ոչ մի վերնագիր, ոչ մի մարկդաուն, գրեք միայն պատմությունը:
Միշտ ներառեք խաղացողի գործողությունը և համակարգային իրադարձությունները:
Լեզուն՝ հայերեն:
Տոնը՝ նկարագրական և տպավորիչ:<|im_end|>
<|im_start|>user
Պատմությունը մինչ այժմ: ${history}
${systemEvent ? `Համակարգային իրադարձություն: ${systemEvent}` : ''}
Խաղացողի գործողությունը: ${action}
Շարունակեք պատմությունը 1-2 նախադասությամբ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Armenian Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Դուք օգնող լեզվի ուսուցիչ եք: 
Խնդիր՝ ուղղել քերականական և ուղղագրական սխալները օգտատիրոջ հայերեն տեքստում: 
Եթե ճիշտ է, ասեք ՄԻԱՅՆ [Perfect]:
Սխալների դեպքում համառոտ բացատրեք դրանք հայերենով:
Թարգմանություն մի տրամադրեք, միայն ուղղում և հետադարձ կապ:

Examples:
- "Ես գնում եմ դպրոց:" -> "[Perfect]"
- "Ես գնալ դպրոց:" -> "Ճիշտ ձևն է՝ 'Ես գնում եմ դպրոց':"<|im_end|>
<|im_start|>user
Բնօրինակ: ${userInput}
Ուղղում:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Armenian Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Խնդիր՝ վերաշարադրել հետևյալ տեքստը քարանձավային մարդու պես: 
Կանոններ:
- Օգտագործեք առավելագույնը 5-10 պարզ բառ:
- Հեռացրեք բոլոր ածականներն ու մակբայները:
- Կենտրոնացեք միայն հիմնական գործողության վրա:
Լեզուն՝ հայերեն:<|im_end|>
<|im_start|>user
Բնօրինակ: ${narrativeText}
Պարզեցված:<|im_end|>
<|im_start|>assistant
`;
};
