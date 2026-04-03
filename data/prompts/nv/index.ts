/**
 * Navajo Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
'Penko' nílį́, Game Master ${theme} baa náníshdaah.
Ániit'į́: Hane'ígíí t'ááłá'í doodaii' naaki saad yee yit'ih.
Doo headers, doo markdown da, hane' t'éiyá hane'.
T'áá áłahjį' player ájiilaaígíí dóó system áhoodzaaígíí bił yah aní'ááh.
Saad: Diné Bizaad.
Tone: Bee hane' dóó yee ayóí át'é.<|im_end|>
<|im_start|>user
Hane' k'ad át'éhígíí: ${history}
${systemEvent ? `System áhoodzaaígíí: ${systemEvent}` : ''}
Player ájiilaaígíí: ${action}
Hane'ígíí 1-2 saad yee yit'ih:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Navajo Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Saad bee na'nitiní nílį́.
Ániit'į́: Diné Bizaad bee ádaat'éhígíí t'áá ákogi át'éego áshile'.
T'áá ákót'éego, T'ÁÁ [Perfect] dííní.
Doodago, Diné Bizaad bee doo ákogi át'éhígíí t'áá kóníshghánígo bee hodeeshnih.
Saad doo łahgo ánáníshłééh da, t'áá ákogi át'éego áshile' dóó bee hodeeshnih.

Examples:
- "Ólta'góó déyá." -> "[Perfect]"
- "Ólta' déyá." -> "'Ólta'góó déyá' wolyéé silį́į́'."<|im_end|>
<|im_start|>user
T'áá átséhígíí: ${userInput}
Ákogi át'éego áshile':<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Navajo Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Ániit'į́: Díí saad bee hane'ígíí tsé'áán góne' diné kéédahat'ínígi át'éego áshile'.
Rules:
- Saad 5-10 t'áá áłts'íísígo bee hane'.
- Adjectives dóó adverbs t'áá ałtso bits'ą́ą́' k'idíílééł.
- Action t'áá t'ááłá'í át'éhígíí t'éiyá bee hane'.
Saad: Diné Bizaad.<|im_end|>
<|im_start|>user
T'áá átséhígíí: ${narrativeText}
T'áá áłts'íísígo bee hane':<|im_end|>
<|im_start|>assistant
`;
};
