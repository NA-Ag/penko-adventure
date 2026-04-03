const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('index.ts') && (file.includes('JLPT') || file.includes('HSK'))) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('data/educational');

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
