/**
 * KA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
თქვენი დავალება: გააგრძელეთ ამბავი ზუსტად 1 მოკლე წინადადებით.
დაწერეთ მხოლოდ ამბავი. სათაურების ან განმარტებების გარეშე.
ბოლოს დაურთეთ [ROMANIZATION: phonetic sounds].
მნიშვნელოვანია: არ გამოიყენოთ ინგლისური. ენა: ქართული.
ტონი: მხიარული და ძალიან მარტივი (CEFR A1).

მაგალითი:
ამბავი აქამდე: ქუჩაში წვიმს.
მოთამაშის მოქმედება: ვიხედები ირგვლივ.
1 წინადადება: თქვენ ხედავთ გუბეებში არეკლილ ნეონის შუქებს. [ROMANIZATION: tkven khedavt gubeebshi areklil neonis shukebs.]<|im_end|>
<|im_start|>user
ამბავი აქამდე: ${history}
${systemEvent ? `სისტემური მოვლენა: ${systemEvent}` : ''}
მოთამაშის მოქმედება: ${action}
1 წინადადება:<|im_start|>assistant
`;
};

/**
 * KA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
მარტივი ენის მასწავლებელი. შეასწორეთ ტექსტი. თუ ის სწორია, თქვით "სრულყოფილია."<|im_end|>
<|im_start|>user
ორიგინალი: ${userInput}
შესწორება:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
გაამარტივეთ (3-5 სიტყვა).<|im_end|>
<|im_start|>user
ორიგინალი: ${narrativeText}
გამარტივებული:<|im_end|>
<|im_start|>assistant
`;
};
