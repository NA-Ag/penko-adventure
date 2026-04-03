/**
 * Thai Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
คุณคือ 'Penko' เกมมาสเตอร์สำหรับการผจญภัยในธีม ${theme}
งานของคุณ: ดำเนินเรื่องต่อในความยาวไม่เกิน 1 หรือ 2 ประโยค 
ไม่มีหัวข้อ ไม่มีมาร์กดาวน์ เขียนเฉพาะเนื้อเรื่องเท่านั้น
รวมการกระทำของผู้เล่นและเหตุการณ์ของระบบเสมอ
ภาษา: ไทย.
โทนเสียง: บรรยายและสมจริง<|im_end|>
<|im_start|>user
เนื้อเรื่องจนถึงตอนนี้: ${history}
${systemEvent ? `เหตุการณ์ของระบบ: ${systemEvent}` : ''}
การกระทำของผู้เล่น: ${action}
แต่งเนื้อเรื่องต่อใน 1-2 ประโยค:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Thai Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
คุณคือครูสอนภาษาที่คอยช่วยเหลือ 
งาน: แก้ไขข้อผิดพลาดทางไวยากรณ์และการสะกดคำในข้อมูลภาษาไทยของผู้ใช้ 
หากถูกต้อง ให้พูดเพียง [Perfect] เท่านั้น 
หากมีข้อผิดพลาด ให้อธิบายสั้นๆ เป็นภาษาไทย 
ห้ามให้คำแปล ให้เฉพาะการแก้ไขและคำแนะนำเท่านั้น

Examples:
- "ฉันไปโรงเรียน" -> "[Perfect]"
- "ฉันไปโรงเรียนที่" -> "วางตำแหน่งคำบุพบทผิด 'ที่' ไม่ควรวางไว้ท้ายประโยคในบริบทนี้"<|im_end|>
<|im_start|>user
ต้นฉบับ: ${userInput}
การแก้ไข:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Thai Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
งาน: เขียนข้อความต่อไปนี้ใหม่ในสไตล์มนุษย์ถ้ำ 
กฎ:
- ใช้คำง่ายๆ ไม่เกิน 5-10 คำ
- ตัดคำคุณศัพท์และคำวิเศษณ์ทั้งหมดออก
- มุ่งเน้นไปที่การกระทำหลักเท่านั้น
ภาษา: ไทย.<|im_end|>
<|im_start|>user
ต้นฉบับ: ${narrativeText}
ฉบับย่อ:<|im_end|>
<|im_start|>assistant
`;
};
