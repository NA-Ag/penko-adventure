const fs = require('fs');

function patchSetup(file) {
    let content = fs.readFileSync(file, 'utf-8');

    // 1. Add "Remove AI" button
    const removeAiButton = `
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
                    </div>`;
                    
    content = content.replace(
        /\{T\.local_model_ready \|\| "✅ Model is downloaded and ready to play!"\}\s*<\/div>\s*\) : \(/,
        `{T.local_model_ready || "✅ Model is downloaded and ready to play!"}
                        </div>${removeAiButton}
                 ) : (`
    );

    // 2. Disable "Continue Saved Game" buttons (there are multiple)
    // Find: className="... text-white font-pixel text-xl shadow... transition-all uppercase"
    // Change to disabled, add "COMING SOON" absolute badge
    content = content.replace(
        /<button\s+onClick=\{onContinue\}\s+className="([^"]+)"\s*>\s*\{T\.continue_session \|\| 'Continue Saved Game'\}\s*<\/button>/g,
        `<button
                        disabled={true}
                        onClick={onContinue}
                        className="$1 opacity-50 cursor-not-allowed relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">COMING SOON</div>
                        {T.continue_session || 'Continue Saved Game'}
                    </button>`
    );

    content = content.replace(
        /<button\s+onClick=\{onContinue\}\s+className="([^"]+)"\s*>\s*\{T\.continue_session \|\| 'Continue'\}\s*<\/button>/g,
        `<button
                        disabled={true}
                        onClick={onContinue}
                        className="$1 opacity-50 cursor-not-allowed relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">COMING SOON</div>
                        {T.continue_session || 'Continue'}
                    </button>`
    );

    // 3. Disable "Import Save" button
    content = content.replace(
        /<button\s+onClick=\{handleImportClick\}\s+className="([^"]+)"\s*>\s*\{T\.import_save \|\| 'Import Save'\}\s*<\/button>/g,
        `<button
                        disabled={true}
                        onClick={handleImportClick}
                        className="$1 opacity-50 cursor-not-allowed relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] px-3 py-1 font-bold font-retro">COMING SOON</div>
                        {T.import_save || 'Import Save'}
                    </button>`
    );

    fs.writeFileSync(file, content);
}

patchSetup('components/SetupScreen.tsx');
patchSetup('components/setup/EducationalSetupScreen.tsx');

