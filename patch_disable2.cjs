const fs = require('fs');

function patchSetup(file) {
    let content = fs.readFileSync(file, 'utf-8');

    // Replace the malformed button with a proper one
    content = content.replace(
        /<button \s*onClick=\{async \(\) => \{\s*if \(window\.confirm[\s\S]*?Remove AI from Cache\s*<\/button>\s*<\/div>/,
        `</div>
                        <button 
                            onClick={async () => {
                                if (window.confirm("Are you sure you want to remove the downloaded AI model from your browser cache? This will free up ~850MB of space.")) {
                                    const { CartridgeService } = await import('../services/adventure/advanced/CartridgeService');
                                    await CartridgeService.deleteModelCache('all');
                                    setIsQwenCached(false);
                                }
                            }}
                            className="w-full py-3 bg-red-900/30 hover:bg-red-800/50 border border-red-500/50 text-red-400 font-pixel text-sm uppercase transition-colors"
                        >
                            Remove AI from Cache
                        </button>
                    </div>`
    );

    fs.writeFileSync(file, content);
}

patchSetup('components/SetupScreen.tsx');
patchSetup('components/setup/EducationalSetupScreen.tsx');

