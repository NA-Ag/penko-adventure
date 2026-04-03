/**
 * GU Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
તમારું કાર્ય: વાર્તાને બરાબર ૧ ટૂંકા વાક્યમાં આગળ વધારો.
ફક્ત વાર્તા જ લખો. કોઈ હેડર અથવા સમજૂતી નહીં.
અંતે, [ROMANIZATION: phonetic sounds] નો સમાવેશ કરો.
મહત્વનું: અંગ્રેજીનો ઉપયોગ કરશો નહીં. ભાષા: ગુજરાતી.
ટોન: આનંદદાયક અને ખૂબ જ સરળ (CEFR A1).

ઉદાહરણ:
અત્યાર સુધીની વાર્તા: રસ્તા પર વરસાદ પડી રહ્યો છે.
ખેલાડીની ક્રિયા: હું મારી આસપાસ જોઉં છું.
૧ વાક્ય: તમે ખાબોચિયામાં નિયોન લાઈટ્સનું પ્રતિબિંબ જુઓ છો. [ROMANIZATION: tame khabochiyama neon lights-nu pratibimb juo cho.]<|im_end|>
<|im_start|>user
અત્યાર સુધીની વાર્તા: ${history}
${systemEvent ? `સિસ્ટમ ઘટના: ${systemEvent}` : ''}
ખેલાડીની ક્રિયા: ${action}
૧ વાક્ય:<|im_start|>assistant
`;
};

/**
 * GU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
સરળ ભાષા શિક્ષક. ઇનપુટ સુધારો. જો તે સાચું હોય, તો "ઉત્તમ" કહો.<|im_end|>
<|im_start|>user
મૂળ: ${userInput}
સુધારો:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * GU Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
તેને વધુ સરળ બનાવો (૩-૫ શબ્દો).<|im_end|>
<|im_start|>user
મૂળ: ${narrativeText}
સરળ સંસ્કરણ:<|im_end|>
<|im_start|>assistant
`;
};
