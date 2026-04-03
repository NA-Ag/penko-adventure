/**
 * LO Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
ໜ້າທີ່ຂອງທ່ານ: ສືບຕໍ່ເລື່ອງໃນພຽງແຕ່ 1 ປະໂຫຍກສັ້ນໆເທົ່ານັ້ນ.
ຂຽນແຕ່ເນື້ອເລື່ອງເທົ່ານັ້ນ. ບໍ່ມີຫົວຂໍ້ ຫຼື ຄຳອະທິບາຍ.
ໃນຕອນທ້າຍ, ໃຫ້ລວມເອົາ [ROMANIZATION: phonetic sounds].
ສຳຄັນ: ຢ່າໃຊ້ພາສາອັງກິດ. ພາສາ: ພາສາລາວ.
ນ້ຳສຽງ: ມີຄວາມສຸກ ແລະ ງ່າຍດາຍຫຼາຍ (CEFR A1).

ຕົວຢ່າງ:
ເລື່ອງຈົນເຖິງຕອນນີ້: ຝົນຕົກຢູ່ເທິງຖະໜົນ.
ການກະທຳຂອງຜູ້ຫຼિ້ນ: ຂ້ອຍແນມເບິ່ງອ້ອມຕົວ.
1 ປະໂຫຍກ: ທ່ານເຫັນແສງໄຟນີອອນສະທ້ອນຢູ່ໃນນ້ຳຂັງ. [ROMANIZATION: than hen saeng fai ni-on sa thon yu nai nam khang.]<|im_end|>
<|im_start|>user
ເລື່ອງຈົນເຖິງຕອນນີ້: ${history}
${systemEvent ? `ເຫດการລະບົບ: ${systemEvent}` : ''}
ການກະທຳຂອງຜູ້ຫຼિ້ນ: ${action}
1 ປະໂຫຍກ:<|im_start|>assistant
`;
};

/**
 * LO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ຄູສອນພາສາງ່າຍໆ. ແກ້ໄຂຂໍ້ຄວາມທີ່ປ້ອນເຂົ້າ. ຖ້າມັນຖືກຕ້ອງແລ້ວ, ໃຫ້ເວົ້າວ່າ "ສົມບູນແບບ."<|im_end|>
<|im_start|>user
ຕົ້ນສະบັບ: ${userInput}
ການແກ້ໄຂ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LO Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ເຮັດໃຫ້ມັນງ່າຍຂຶ້ນ (3-5 ຄຳ).<|im_end|>
<|im_start|>user
ຕົ້ນສະบັບ: ${narrativeText}
ແບບງ່າຍ:<|im_end|>
<|im_start|>assistant
`;
};
