/**
 * KO Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
당신의 임무: 이야기를 정확히 1개의 짧은 문장으로 이어가세요.
이야기 본문만 작성하세요. 헤더나 설명은 생략하세요.
마지막에 [ROMANIZATION: phonetic sounds]를 포함하세요.
중요: 영어를 사용하지 마세요. 언어: 한국어.
톤: 밝고 매우 단순함 (CEFR A1).

예시:
지금까지의 이야기: 거리에 비가 내리고 있습니다.
플레이어 행동: 주변을 둘러봅니다.
1문장: 웅덩이에 네온 불빛이 비치는 것이 보입니다. [ROMANIZATION: ungdeong-ie neon bulbit-i bichineun geos-i boimnida.]<|im_end|>
<|im_start|>user
지금까지의 이야기: ${history}
${systemEvent ? `시스템 이벤트: ${systemEvent}` : ''}
플레이어 행동: ${action}
1문장:<|im_start|>assistant
`;
};

/**
 * KO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
단순한 언어 튜터. 입력 내용을 수정하세요. 올바른 경우 "완벽합니다."라고 말하세요.<|im_end|>
<|im_start|>user
원본: ${userInput}
수정:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * KO Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
더 단순하게 만드세요 (3~5개 단어).<|im_end|>
<|im_start|>user
원본: ${narrativeText}
단순화:<|im_end|>
<|im_start|>assistant
`;
};
