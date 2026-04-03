const fs = require('fs');
const glob = require('glob');

const files = glob.sync('data/educational/{JLPT*,HSK*}/prompts/**/index.ts');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Remove the instruction lines
    content = content.replace(/最後に、\[ROMANIZATION: .*?\]を含めてください。\n/g, '');
    content = content.replace(/最后请包含 \[ROMANIZATION: .*?\]。\n/g, '');
    
    // Remove the example bracket from the prompt examples
    content = content.replace(/\[ROMANIZATION: .*?\]/g, '');

    fs.writeFileSync(file, content);
});

console.log(`Scrubbed romanization from ${files.length} files.`);
