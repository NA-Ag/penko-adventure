/**
 * VI Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Nhiệm vụ của bạn: Tiếp tục câu chuyện trong ĐÚNG 1 câu ngắn.
Chỉ viết câu chuyện. Không có tiêu đề hay giải thích.
KRITIKAL: KHÔNG SỬ DỤNG TIẾNG ANH. Ngôn ngữ: Tiếng Việt.
Tông giọng: Vui vẻ và rất đơn giản (CEFR A1).

Ví dụ:
Câu chuyện cho đến nay: Mưa rơi trên phố.
Hành động của người chơi: Tôi nhìn quanh.
1 câu: Bạn thấy ánh đèn neon phản chiếu trong vũng nước.<|im_end|>
<|im_start|>user
Câu chuyện cho đến nay: ${history}
${systemEvent ? `Sự kiện hệ thống: ${systemEvent}` : ''}
Hành động của người chơi: ${action}
1 câu:<|im_start|>assistant
`;
};

/**
 * VI Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Gia sư ngôn ngữ đơn giản. Sửa lỗi đầu vào. Nếu nó đúng, hãy nói "Hoàn hảo."<|im_end|>
<|im_start|>user
Bản gốc: ${userInput}
Sửa lỗi:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * VI Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Làm cho nó đơn giản hơn (3-5 từ).<|im_end|>
<|im_start|>user
Bản gốc: ${narrativeText}
Đơn giản hóa:<|im_end|>
<|im_start|>assistant
`;
};
