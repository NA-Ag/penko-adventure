const fs = require('fs');

let gi = fs.readFileSync('components/GameInterface.tsx', 'utf-8');

// Replace left column wrapper
gi = gi.replace(
    /<div className=\{\`lg:w-1\/3 flex flex-col border-r border-gray-700 bg-gray-900 shrink-0 transition-\[height\] duration-300 \$\{isVisualizerOpen \? 'h-\[45%\] lg:h-full' : 'h-auto lg:h-full'\}\`\}>/,
    '<div className="lg:w-1/3 flex flex-col border-r border-gray-700 bg-gray-900 shrink-0 h-auto lg:h-full">'
);

// Remove mobile toggle button
gi = gi.replace(
    /\{\/\* Mobile Toggle for Visualizer \*\/\}\s*<button[\s\S]*?<\/button>/,
    ''
);

// Hide visualizer on mobile
gi = gi.replace(
    /\{isVisualizerOpen && \(\s*<div className="bg-gray-800 rounded-xl border border-gray-700 p-2 shadow-lg shrink-0 animate-fade-in flex flex-col items-center">/,
    '{isVisualizerOpen && (\n                <div className="hidden lg:flex bg-gray-800 rounded-xl border border-gray-700 p-2 shadow-lg shrink-0 animate-fade-in flex-col items-center">'
);

// Always show StatusPanel
gi = gi.replace(
    /\{isVisualizerOpen && \(\s*<StatusPanel/,
    '<StatusPanel'
);

// Remove the closing brace of {isVisualizerOpen && ( for the StatusPanel
gi = gi.replace(
    /nativeLanguage=\{userProfile\.nativeLanguage\}\s*\/>\s*\)\}/,
    'nativeLanguage={userProfile.nativeLanguage}\n                />'
);

fs.writeFileSync('components/GameInterface.tsx', gi);
