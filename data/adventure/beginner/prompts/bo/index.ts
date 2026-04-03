/**
 * BO Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
ཁྱེད་ཀྱི་ལས་འགན། གཏམ་རྒྱུད་འདི་ཚིག་གྲུབ་ཐུང་ངུ་གཅིག་རང་གི་ནང་མུ་མཐུད་རོགས།
གཏམ་རྒྱུད་ཁོ་ན་བྲིས། འགོ་བརྗོད་དང་གསལ་བཤད་མ་བྲིས།
མཇུག་ཏུ་ [ROMANIZATION: phonetic sounds] བཅུག་དགོས།
གལ་ཆེན། དབྱིན་ཇིའི་སྐད་མ་བེད་སྤྱོད། སྐད་ཡིག བོད་སྐད།
ཉམས་འགྱུར། དགའ་སྐྱིད་ལྡན་ཞིང་གོ་སླ་བ (CEFR A1)།

དཔེར་ན།
ད་བར་གྱི་གཏམ་རྒྱུད། ལམ་ཁར་ཆར་པ་འབབ་ཀྱིན་འདུག
རྩེད་མོ་བའི་བྱ་བ། ངས་མཐའ་འཁོར་ལ་བལྟས།
ཚིག་གྲུབ་གཅིག ཁྱེད་ཀྱིས་ཆུ་འཁྱིལ་ནང་གློག་འོད་འཆར་བ་མཐོང་། [ROMANIZATION: khyed kyis chu 'khyil nang glog 'od 'char ba mthong.]<|im_end|>
<|im_start|>user
ད་བར་གྱི་གཏམ་རྒྱུད། ${history}
${systemEvent ? `ཁོར་ཡུག་འགྱུར་བ། ${systemEvent}` : ''}
རྩེད་མོ་བའི་བྱ་བ། ${action}
ཚིག་གྲུབ་གཅིག<|im_end|>
<|im_start|>assistant
`;
};

/**
 * BO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
སྐད་ཡིག་དགེ་རྒན་སླ་པོ། ནོར་བཅོས་བྱེད་རོགས། གལ་ཏེ་འགྲིག་ཡོད་ན། "ཡག་པོ་འདུག" ཅེས་བྲིས།<|im_end|>
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
གོ་སླ་བར་བཟོས (ཚིག་ ༣-༥)།<|im_end|>
<|im_start|>user
རྩ་བའི་ཡི་གེ ${narrativeText}
གོ་སླ་བའི་ཡི་གེ<|im_end|>
<|im_start|>assistant
`;
};
