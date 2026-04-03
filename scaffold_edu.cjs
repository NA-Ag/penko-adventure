const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'data', 'educational');
const srcPromptsDir = path.join(baseDir, 'prompts');

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'JLPT_N5', 'JLPT_N4', 'JLPT_N3', 'JLPT_N2', 'JLPT_N1', 'HSK_1', 'HSK_2', 'HSK_3', 'HSK_4', 'HSK_5', 'HSK_6'];

function copyRecursiveSync(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

levels.forEach(level => {
  const destPromptsDir = path.join(baseDir, level, 'prompts');
  console.log(`Copying to ${destPromptsDir}...`);
  copyRecursiveSync(srcPromptsDir, destPromptsDir);
});

console.log('Scaffolding complete!');
