/**
 * SQ Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Detyra juaj: Vazhdoni historinë në EKZAKTËSISHT 1 fjali të shkurtër.
Shkruani vetëm historinë. Pa tituj ose shpjegime.
KRITIKE: MOS PËRDORNI ANGLISHT. Gjuha: Shqip.
Toni: I gëzuar dhe shumë i thjeshtë (CEFR A1).

Shembull:
Historia deri më tani: Bie shi në rrugë.
Veprimi i lojtarit: Shikoj rreth e rrotull.
1 fjali: Ju shihni drita neoni që reflektohen në pellgje.<|im_end|>
<|im_start|>user
Historia deri më tani: ${history}
${systemEvent ? `Ngjarje e Sistemit: ${systemEvent}` : ''}
Veprimi i lojtarit: ${action}
1 fjali:<|im_start|>assistant
`;
};

/**
 * SQ Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Mësues gjuhe i thjeshtë. Korrigjoni hyrjen. Nëse është e saktë, thoni "Shkëlqyeshëm."<|im_end|>
<|im_start|>user
Origjinali: ${userInput}
Korrigjimi:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * SQ Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Bëjeni më të thjeshtë (3-5 fjalë).<|im_end|>
<|im_start|>user
Origjinali: ${narrativeText}
E thjeshtuar:<|im_end|>
<|im_start|>assistant
`;
};
