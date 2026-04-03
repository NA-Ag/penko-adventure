const fs = require('fs');

let content = fs.readFileSync('translations.ts', 'utf-8');

const badBlock = `
    // Delete AI Modal
    remove_ai_btn: "REMOVE AI FROM CACHE",
    remove_ai_title: "REMOVE LOCAL AI?",
    remove_ai_desc: "This will permanently delete the ~850MB Qwen 3.5 model from your browser's local storage cache. You will need to download it again if you want to play Offline Mode later.",
    cancel: "CANCEL",
    delete: "DELETE AI",
    // SetupScreen`;

// Remove all occurrences
content = content.split(badBlock).join('    // SetupScreen');

// Now inject it ONCE per language. We'll use `install_got_it: "GOT IT",` or similar as the anchor.
// The anchor is different for every language, but they all end with `install_got_it: "...",`.
// We can use a regex that matches `install_got_it: "...",` and inserts the new keys right after it.

const newKeysEn = `
    
    // Delete AI Modal
    remove_ai_btn: "REMOVE AI FROM CACHE",
    remove_ai_title: "REMOVE LOCAL AI?",
    remove_ai_desc: "This will permanently delete the ~850MB Qwen 3.5 model from your browser's local storage cache. You will need to download it again if you want to play Offline Mode later.",
    cancel: "CANCEL",
    delete: "DELETE AI",`;

content = content.replace(/(install_got_it: ".*?",)/g, '$1' + newKeysEn);

fs.writeFileSync('translations.ts', content);
