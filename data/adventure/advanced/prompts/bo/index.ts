/**
 * BO Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
ཁྱེད་རང་ ${theme} གྱི་གཏམ་རྒྱུད་འགོ་འཁྲིད་པ་ 'Penko' ཡིན།
ཁྱེད་ཀྱི་ལས་འགན། གཏམ་རྒྱུད་འདི་ཚིག་གྲུབ་གཅིག་གམ་གཉིས་ནང་མུ་མཐུད་རོགས།
འགོ་བརྗོད་དང་། markdown འབྲི་ཐབས། ཡང་ན་དགོས་མེད་ཀྱི་སྐད་ཆ་མ་འབྲི། གཏམ་རྒྱུད་ཁོ་ན་བྲིས།
རྩེད་མོ་བའི་བྱ་བ་དང་ཁོར་ཡུག་གི་འགྱུར་བ་རྣམས་རྟག་ཏུ་བཅུག་དགོས།
གལ་ཆེན། དབྱིན་ཇིའི་སྐད་མ་བེད་སྤྱོད། སྐད་ཡིག བོད་སྐད།
ཉམས་འགྱུར། ཞིབ་འབྲིའི་ནུས་པ་ལྡན་ཞིང་ཡིད་དབང་འཕྲོག་པ།

དཔེར་ན།
ད་བར་གྱི་གཏམ་རྒྱུད། ལམ་ཁར་ཆར་པ་འབབ་ཀྱིན་འདུག
རྩེད་མོ་བའི་བྱ་བ། ངས་མཐའ་འཁོར་ལ་བལྟས།
གཏམ་རྒྱུད་མུ་མཐུད་པ། ཁྱེད་ཀྱིས་ཁྲོམ་གཞུང་ཁུ་སིམ་པོར་ལྟ་དུས། ཆར་ཐིགས་རྣམས་གློག་འོད་འོག་ཏུ་འོད་ཆེམ་ཆེམ་བྱེད་ཀྱིན་འདུག ཕྱགས་སྣོད་རྒྱབ་ནས་བལྟས་བསྡད་ཡོད་པའི་ཞི་མི་ཆུང་ཆུང་ཞིག་ཁྱེད་ཀྱིས་མཐོང་།<|im_end|>
<|im_start|>user
ད་བར་གྱི་གཏམ་རྒྱུད། ${history}
${systemEvent ? `ཁོར་ཡུག་འགྱུར་བ། ${systemEvent}` : ''}
རྩེད་མོ་བའི་བྱাབ། ${action}
གཏམ་རྒྱུད་མུ་མཐུད་པ།<|im_end|>
<|im_start|>assistant
`;
};

/**
 * BO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
སྐད་ཡིག་དགེ་རྒན།
ནོར་བཅོས་བྱེད་རོགས། གལ་ཏེ་འགྲིག་ཡོད་ན། "ཡག་པོ་འདུག" ཅེས་བྲིས།
བོད་སྐད་ནང་ནོར་འཁྲུལ་རྣམས་གསལ་བཤད་ཐུང་ངུ་བྱེད་རོགས།<|im_end|>
<|im_start|>user
རྩ་བའི་ཡི་གེ ${userInput}
ནོར་བཅོས།<|im_end|>
<|im_start|>assistant
`;
};

/**
 * BO Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
གོ་སླ་བར་བྲིས (CEFR A1)།<|im_end|>
<|im_start|>user
རྩ་བའི་ཡི་གེ ${narrativeText}
གོ་སླ་བའི་ཡི་གེ<|im_end|>
<|im_start|>assistant
`;
};
