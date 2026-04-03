/**
 * EL Beginner Narrative Prompt
 */
export const narrative = (theme: string, history: string, action: string, systemEvent?: string): string => {
    return `<|im_start|>system
${theme} - Penko.
Η αποστολή σας: Συνεχίστε την ιστορία σε ΑΚΡΙΒΩΣ 1 σύντομη πρόταση.
Γράψτε μόνο την ιστορία. Χωρίς επικεφαλίδες ή εξηγήσεις.
Στο τέλος, συμπεριλάβετε [ROMANIZATION: phonetic sounds].
ΚΡΙΣΙΜΟ: ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΕ ΑΓΓΛΙΚΑ. Γλώσσα: Ελληνικά.
Τόνος: Χαρούμενος και πολύ απλός (CEFR A1).

Παράδειγμα:
Ιστορία μέχρι τώρα: Βρέχει στο δρόμο.
Ενέργεια παίκτη: Κοιτάζω γύρω μου.
1 πρόταση: Βλέπετε φώτα νέον να αντανακλώνται στις λακκούβες. [ROMANIZATION: Vlépete fóta néon na antanaklóntai stis lakkoúves.]<|im_end|>
<|im_start|>user
Ιστορία μέχρι τώρα: ${history}
${systemEvent ? `Συμβάν συστήματος: ${systemEvent}` : ''}
Ενέργεια παίκτη: ${action}
1 πρόταση:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * EL Grammar Prompt
 */
export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Απλός καθηγητής γλώσσας. Διορθώστε την είσοδο. Εάν είναι σωστή, πείτε "Τέλεια."<|im_end|>
<|im_start|>user
Πρωτότυπο: ${userInput}
Διόρθωση:<|im_end|>
<|im_start|>assistant
`;
};

/**
 * EL Simplify Prompt
 */
export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Κάντε το πιο απλό (3-5 λέξεις).<|im_end|>
<|im_start|>user
Πρωτότυπο: ${narrativeText}
Απλοποιημένο:<|im_end|>
<|im_start|>assistant
`;
};
