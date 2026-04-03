/**
 * JA Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
あなたのタスク：物語を「必ず」1つの短い文で続けてください。
物語のみを書いてください。ヘッダーや説明は不要です。
最後に、[ROMANIZATION: ローマ字読み]を含めてください。
重要：英語は使用しないでください。言語：日本語。
トーン：明るく非常にシンプル（CEFR A1）。

例：
これまでの物語: 通りに雨が降っています。
プレイヤーの行動: 周りを見回す。
1つの文：水たまりにネオンの光が反射しているのが見えます。[ROMANIZATION: Mizutamari ni neon no hikari ga hansha shite iru no ga miemasu.]<|im_end|>
<|im_start|>user
これまでの物語: ${history}
${systemEvent ? `システムイベント: ${systemEvent}` : ''}
プレイヤーの行動: ${action}
1つの文：<|im_start|>assistant
`;
};

/**
 * JA Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
簡単な語学家庭教師。入力を修正してください。正しい場合は「完璧です」と言ってください。<|im_end|>
<|im_start|>user
オリジナル: ${userInput}
修正:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * JA Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
もっと単純にしてください（3〜5単語）。<|im_end|>
<|im_start|>user
オリジナル: ${narrativeText}
簡略化:<|im_end|>
<|im_start|>assistant
`;
};
