/**
 * Fula Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
Aan woni 'Penko', Mawdo Pijirlo wonande jinngu ${theme}.
Gollal maa: Jokku taalol ngol e nate 1 malla 2 ko ɓuri.
Naatnu gollal fijoowo e kala ko feewti e njuɓɓudi ndii.
Ɗemngal: Fulfulde.
Iiba: Deftere e naatnde.<|im_end|>
<|im_start|>user
Taalol ngol haa jooni: ${history}
${systemEvent ? `Kewu Njuɓɓudi: ${systemEvent}` : ''}
Gollal fijoowo: ${action}
Jokku taalol ngol e nate 1-2:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Fula Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Aan woni jannginoowo ɗemngal balloowo.
Gollal: Feewnu boofeeji garmal e mbinndiin e naatgol Fulfulde neɗɗo oo.
Si naatgol ngol feewii tan, mbi'a "Heɓii."
Si boofeeji ina ngoodi, firtu ɗi seeɗa e ɗemngal Fulfulde.
Wataa hokku firo, tan peewnugol e ballal.<|im_end|>
<|im_start|>user
Asli: ${userInput}
Peewnugol:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * Fula Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Gollal: Winndu kadi mbinndol ngol hono neɗɗo ɓunndu.
Kandol:
- Huutoro kelme 5-10 mbeebɗe ko ɓuri.
- Ittu kala sifaaji e mbayliiguuji.
- Tiim njiylu gollal mawngal ngal tan.
Ɗemngal: Fulfulde.<|im_end|>
<|im_start|>user
Asli: ${narrativeText}
Mbeebɗinaaɗum:<|im_end|>
<|im_start|>assistant
`;
};
