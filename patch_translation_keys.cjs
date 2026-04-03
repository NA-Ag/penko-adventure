const fs = require('fs');

let t = fs.readFileSync('translations.ts', 'utf-8');

// We need to add the new keys to ENGLISH and copy them to the other languages to ensure they exist.
// Since we don't speak all 12 languages natively, we will at least add the keys so they fallback or are ready to be translated.
const newKeysEn = `
    // Delete AI Modal
    remove_ai_btn: "REMOVE AI FROM CACHE",
    remove_ai_title: "REMOVE LOCAL AI?",
    remove_ai_desc: "This will permanently delete the ~850MB Qwen 3.5 model from your browser's local storage cache. You will need to download it again if you want to play Offline Mode later.",
    cancel: "CANCEL",
    delete: "DELETE AI",`;

t = t.replace(/(\/\/ SetupScreen)/g, newKeysEn + '\n    $1');

fs.writeFileSync('translations.ts', t);
