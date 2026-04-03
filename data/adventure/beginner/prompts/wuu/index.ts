/**
 * WUU Beginner Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko GM。
侬是 'Penko'，${theme} 个 GM。
任务：用「准确个」1 句简短个闲话继续只故事。
覅标题，覅 markdown，覅撘讪。

极度重要：覅用英文。只可以用吴语回覆。
语气：开心搭仔邪气简单（CEFR A1程度）。

例子：
故事进度：街浪向落辣海雨。
玩家行动：我四面望望。
1 句闲话：侬看到霓虹灯勒水塘里向反光。<|im_end|>
<|im_start|>user
故事进度：${history}
${systemEvent ? `系统事件：${systemEvent}` : ''}
玩家行动：${action}
1 句闲话：<|im_end|>
<|im_start|>assistant
`;
};

/**
 * WUU Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
语言导师。改正错误。假使呒没错，讲「完美」。<|im_end|>
<|im_start|>user
原文：${userInput}
改正：<|im_end|>
<|im_start|>assistant
`;
};

/**
 * WUU Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
拿伊变得简单点（CEFR A1程度）。<|im_end|>
<|im_start|>user
原文：${narrativeText}
简化后：<|im_end|>
<|im_start|>assistant
`;
};
