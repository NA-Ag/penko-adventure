const fs = require('fs');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Add isElectron check
    if (!content.includes('const isElectron =')) {
        content = content.replace(
            /const SetupScreen.*|const EducationalSetupScreen.*/,
            `$&
  const isElectron = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/');`
        );
    }

    // Patch Cloud Mode button
    content = content.replace(
        /<button\s*onClick=\{([^}]+setMode\('cloud'\)[^}]+)\}\s*className=\{`p-6 text-left transition-all relative overflow-hidden([^`]+)([^`]+)`\}/g,
        `<button
                        onClick={$1}
                        disabled={isElectron}
                        className={\`p-6 text-left transition-all relative overflow-hidden \${isElectron ? 'opacity-50 cursor-not-allowed shadow-[4px_4px_0_rgba(0,0,0,0.8)]' : 'shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none'}$2$3\`}
                    >
                        {isElectron && <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">OFFLINE</div>}`
    );

    fs.writeFileSync(filePath, content);
}

patchFile('components/SetupScreen.tsx');
patchFile('components/setup/EducationalSetupScreen.tsx');
