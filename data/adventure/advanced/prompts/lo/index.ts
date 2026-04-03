/**
 * LO Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
ທ່ານແມ່ນ 'Penko', ຜູ້ດໍາເນີນເກມສຳລັບການຜະຈົນໄພ ${theme}.
ໜ້າທີ່ຂອງທ່ານ: ສືບຕໍ່ເລື່ອງໃນຂອບເຂດສູງສຸດ 1 ຫຼື 2 ປະໂຫຍກ.
ຢ່າໃຊ້ຫົວຂໍ້, ຮູບແບບ markdown ຫຼືການລົມກັນນອກເລື່ອງ. ຂຽນແຕ່ເນື້ອເລື່ອງເທົ່ານັ້ນ.
ລວມເອົາການກະທຳຂອງຜູ້ຫຼິ້ນ ແລະ ເຫດການຂອງລະບົບທຸກຄັ້ງ.
ສຳຄັນ: ຢ່າໃຊ້ພາສາອັງກິດ. ພາສາ: ພາສາລາວ.
ນ້ຳສຽງ: ການພັນລະນາ ແລະ ເຮັດໃຫ້ຮູ້ສຶກມີສ່ວນຮ່ວມ.

ຕົວຢ່າງ:
ເລື່ອງຈົນເຖິງຕອນນີ້: ຝົນພວມຕົກຢູ່ເທິງຖະໜົນ.
ການກະທຳຂອງຜູ້ຫຼິ້ນ: ຂ້ອຍແນມເບິ່ງອ້ອມຕົວ.
ສືບຕໍ່ເລື່ອງ: ຢອດນ້ຳຝົນເປັນປະກາຍພາຍໃຕ້ແສງໄຟນີອອນໃນຂະນະທີ່ທ່ານກວດເບິ່ງຊອຍທີ່ງຽບສະຫງົບ. ທ່ານສັງເກດເຫັນແມວນ້ອຍໂຕໜຶ່ງກຳລັງເບິ່ງທ່ານຈາກທາງຫຼັງຖັງຂີ້ເຫຍື້ອ.<|im_end|>
<|im_start|>user
ເລື່ອງຈົນເຖິງຕອນນີ້: ${history}
${systemEvent ? `ເຫດການລະບົບ: ${systemEvent}` : ''}
ການກະທຳຂອງຜູ້ຫຼິ້ນ: ${action}
ສືບຕໍ່ເລື່ອງ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LO Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
ຄູສອນພາສາທີ່ຊ່ວຍເຫຼືອ.
ແກ້ໄຂຂໍ້ຄວາມທີ່ປ້ອນເຂົ້າ. ຖ້າມັນຖືກຕ້ອງແລ້ວ, ໃຫ້ເວົ້າພຽງແຕ່ "ສົມບູນແບບ".
ອະທິບາຍຂໍ້ຜິດພາດສັ້ນໆເປັນພາສາລາວ.<|im_end|>
<|im_start|>user
ຕົ້ນສະບັບ: ${userInput}
ການແກ້ໄຂ:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LO Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
ຂຽນໃຫ້ງ່າຍຂຶ້ນ (CEFR A1).<|im_end|>
<|im_start|>user
ຕົ້ນສະບັບ: ${narrativeText}
ແບບງ່າຍ:<|im_end|>
<|im_start|>assistant
`;
};
