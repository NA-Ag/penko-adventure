const fs = require('fs');

function patchSetupFile(file) {
    let content = fs.readFileSync(file, 'utf-8');

    const modalJSX = `
        {/* DELETE MODEL MODAL */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in font-pixel">
                <div className="bg-slate-900 border-4 border-red-500 rounded-xl p-8 max-w-lg w-full relative shadow-[0_0_30px_rgba(239,68,68,0.5)] flex flex-col">
                    <div className="text-5xl mb-4 text-center">⚠️</div>
                    <h3 className="text-2xl sm:text-3xl font-retro text-red-400 mb-4 text-center">{T.remove_ai_title || "REMOVE LOCAL AI?"}</h3>
                    <p className="text-slate-300 text-center mb-8 leading-relaxed">
                        {T.remove_ai_desc || "This will permanently delete the ~850MB Qwen 3.5 model from your browser's local storage cache. You will need to download it again if you want to play Offline Mode later."}
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-retro text-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all rounded"
                        >
                            {T.cancel || "CANCEL"}
                        </button>
                        <button
                            onClick={async () => {
                                setShowDeleteConfirm(false);
                                const { CartridgeService } = await import('${file.includes('setup/') ? '../../services/adventure/advanced/CartridgeService' : '../services/adventure/advanced/CartridgeService'}');
                                await CartridgeService.deleteModelCache('all');
                                setIsQwenCached(false);
                            }}
                            className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-retro text-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all rounded"
                        >
                            {T.delete || "DELETE AI"}
                        </button>
                    </div>
                </div>
            </div>
        )}
    `;

    // Inject before the closing </div></> of the component.
    content = content.replace(/<\/div>\s*<\/>\s*\);\s*\};\s*export default/, modalJSX + '\n      </div>\n    </>\n  );\n};\n\nexport default');

    // Also update "Remove AI from Cache" to use translation keys
    content = content.replace(
        /Remove AI from Cache\s*<\/button>/g,
        `{T.remove_ai_btn || "Remove AI from Cache"}\n                        </button>`
    );

    // Now modify the Native PC and Cloud Mode buttons based on user request.
    // The user wants Cloud Mode and Browser Mode to be blocked and labeled "OFFLINE" ONLY if Native PC is selected.
    // BUT we haven't built Native PC mode logic yet. The user says: 
    // "i think best to keep browser and cloud mode in that offline tag, sine the point of downloading is to user the very good very small qwen model"
    // Wait, the user wants the Cloud Mode and Browser Mode buttons to be OPAQUE and UNCLICKABLE (with "OFFLINE" tag) *right now* to simulate the Native PC experience? No. 
    // "i think it would be better if we did something like have them look like how the native button looks now (opaque and not clickable) but instead of a coming soon tag it says offline so users know they're doing things locally disconnected from the outside"
    // Ah! The user is proposing what the *future* Native PC app UI should look like.
    // Let's implement that visually when "Native PC" mode is active! But currently Native PC is disabled. 
    // Wait, the user might mean to change the "COMING SOON" text on Cloud and Browser to "OFFLINE" if they run it natively. But we are still in the web version!
    // Let me just add the translation keys for now.

    fs.writeFileSync(file, content);
}

patchSetupFile('components/SetupScreen.tsx');
patchSetupFile('components/setup/EducationalSetupScreen.tsx');

