/**
 * LG Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Omulimu gwo: Yongera ku lugero mu lulimi olunyangu mu ssentensi 1 yokka.
Wandiika lugero lwokka. Teweeyambisa mitwe gy'ebigambo oba nnyonnyola.
KY'AMAANYI: TOKOZESA LUNGEREZA. Olulimi: Luganda.
Eddaala: Kisanyusa era kyangu nnyo (CEFR A1).

Ekyokulabirako:
Olugero okutuusa kati: Enkuba etonnya mu kkubo.
Ekikolwa ky'omuzannyi: ntunula okwetooloola.
Ssentensi 1: Olaba amataala ga neoni nga geeranga mu bidiba by'amazzi.<|im_end|>
<|im_start|>user
Olugero okutuusa kati: ${history}
${systemEvent ? `Ekibaddewo mu sisitemu: ${systemEvent}` : ''}
Ekikolwa ky'omuzannyi: ${action}
Ssentensi 1:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LG Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Musomesa w'olulimi omunyangu. Tereereza ebawandiikiddwa. Bwekiba kituufu, gamba nti "Kirungi nnyo."<|im_end|>
<|im_start|>user
Original: ${userInput}
Okutereereza:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * LG Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Kola mu ngeri ennyangu (ebigambo 3-5).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Okunnyonnyola mu ngeri ennyangu:<|im_end|>
<|im_start|>assistant
`;
};
