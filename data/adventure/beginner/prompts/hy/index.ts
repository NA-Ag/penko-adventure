/**
 * HY Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Ձեր խնդիրը. շարունակեք պատմությունը ՈՒՂԻՂ 1 կարճ նախադասությամբ:
Գրեք միայն պատմությունը: Առանց վերնագրերի կամ բացատրությունների:
Վերջում ներառեք [ROMANIZATION: phonetic sounds]:
ԿԱՐԵՎՈՐ. ՄԻ ՕԳՏԱԳՈՐԾԵՔ ԱՆԳԼԵՐԵՆ: Լեզու. Հայերեն:
Տոնը. ուրախ և շատ պարզ (CEFR A1):

Օրինակ.
Պատմությունը մինչ այժմ. Փողոցում անձրև է գալիս:
Խաղացողի գործողությունը. Ես նայում եմ շուրջս:
1 նախադասություն. Դուք տեսնում եք ջրափոսերի մեջ արտացոլվող նեոնային լույսերը: [ROMANIZATION: Duk’ tesnum ek’ chrap’oseri mej artats’olvogh neonyin luysery:]<|im_end|>
<|im_start|>user
Պատմությունը մինչ այժմ. ${history}
${systemEvent ? `Համակարգի իրադարձություն. ${systemEvent}` : ''}
Խաղացողի գործողությունը. ${action}
1 նախադասություն.<|im_start|>assistant
`;
};

/**
 * HY Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Պարզ լեզվի ուսուցիչ: Ուղղեք մուտքագրված տեքստը: Եթե այն ճիշտ է, ասեք "Կատարյալ է":<|im_end|>
<|im_start|>user
Բնօրինակ. ${userInput}
Ուղղում.<|im_end|>
<|im_start|>assistant
`;
};

/**
 * HY Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Դարձրեք այն ավելի պարզ (3-5 բառ):<|im_end|>
<|im_start|>user
Բնօրինակ. ${narrativeText}
Պարզեցված.<|im_end|>
<|im_start|>assistant
`;
};
