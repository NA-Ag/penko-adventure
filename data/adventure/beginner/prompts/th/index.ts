/**
 * TH Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
หน้าที่ของคุณ: เล่าเรื่องต่อไปด้วยประโยคสั้นๆ เพียง 1 ประโยคเท่านั้น
เขียนเฉพาะเนื้อเรื่องเท่านั้น ไม่มีหัวข้อหรือคำอธิบาย
ในตอนท้าย ให้ใส่ [ROMANIZATION: phonetic sounds] มาด้วย
สำคัญ: ห้ามใช้ภาษาอังกฤษ ภาษา: ภาษาไทย
น้ำเสียง: ร่าเริงและเรียบง่ายมาก (CEFR A1)

ตัวอย่าง:
เรื่องราวที่ผ่านมา: ฝนตกบนถนน
การกระทำของผู้เล่น: ฉันมองไปรอบๆ
1 ประโยค: คุณเห็นแสงไฟนีออนสะท้อนในแอ่งน้ำ [ROMANIZATION: khun hen saeng fai ni-on sa thon nai aeng nam.]<|im_end|>
<|im_start|>user
เรื่องราวที่ผ่านมา: ${history}
${systemEvent ? `เหตุการณ์ระบบ: ${systemEvent}` : ''}
การกระทำของผู้เล่น: ${action}
1 ประโยค:<|im_start|>assistant
`;
};

/**
 * TH Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ครูสอนภาษาง่ายๆ แก้ไขข้อความที่ป้อน หากถูกต้องแล้ว ให้พูดว่า "สมบูรณ์แบบ"<|im_end|>
<|im_start|>user
ต้นฉบับ: ${userInput}
แก้ไข:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * TH Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ทำให้มันง่ายขึ้น (3-5 คำ)<|im_end|>
<|im_start|>user
ต้นฉบับ: ${narrativeText}
แบบง่าย:<|im_end|>
<|im_start|>assistant
`;
};
