const fs = require('fs');

// Patch SegaBootSequence.tsx
let sega = fs.readFileSync('components/SegaBootSequence.tsx', 'utf-8');

sega = sega.replace(
    /const ET = \(require\('\.\.\/data\/educational\/translations'\)\.EDUCATIONAL_TRANSLATIONS\[nativeLanguage\] \|\| require\('\.\.\/data\/educational\/translations'\)\.EDUCATIONAL_TRANSLATIONS\[Language\.ENGLISH\]\) as any;/,
    ""
);

sega = sega.replace(
    /const themeTitle = isEducational \? \(ET\?\.learning\?\.toUpperCase\(\) \|\| 'LEARNING'\) : theme\.toUpperCase\(\);/,
    "const themeTitle = isEducational ? 'LEARNING' : theme.toUpperCase();"
);

fs.writeFileSync('components/SegaBootSequence.tsx', sega);
