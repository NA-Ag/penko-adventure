const fs = require('fs');

function patchSetupFile(file) {
    let content = fs.readFileSync(file, 'utf-8');

    // 1. Add state variable
    if (!content.includes('const [showDeleteConfirm, setShowDeleteConfirm]')) {
        content = content.replace(
            /const \[isPrewarming, setIsPrewarming\] = useState\(false\);/,
            `const [isPrewarming, setIsPrewarming] = useState(false);\n  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);`
        );
    }

    // 2. Change the onClick to open the modal
    content = content.replace(
        /onClick=\{async \(\) => \{\s*if \(window\.confirm\([\s\S]*?setIsQwenCached\(false\);\s*\}\s*\}\}/,
        `onClick={() => setShowDeleteConfirm(true)}`
    );

    // 3. Add the modal JSX at the very end of the component before the final closing </div>
    const modalJSX = `
        {/* DELETE MODEL MODAL */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in font-pixel">
                <div className="bg-slate-900 border-4 border-red-500 rounded-xl p-8 max-w-lg w-full relative shadow-[0_0_30px_rgba(239,68,68,0.5)] flex flex-col">
                    <div className="text-5xl mb-4 text-center">⚠️</div>
                    <h3 className="text-2xl sm:text-3xl font-retro text-red-400 mb-4 text-center">REMOVE LOCAL AI?</h3>
                    <p className="text-slate-300 text-center mb-8 leading-relaxed">
                        This will permanently delete the ~850MB Qwen 3.5 model from your browser's local storage cache. You will need to download it again if you want to play Offline Mode later.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-retro text-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all rounded"
                        >
                            CANCEL
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
                            DELETE AI
                        </button>
                    </div>
                </div>
            </div>
        )}
    `;

    // Inject before the last </div>
    content = content.replace(/(<\/div>\s*)$/, modalJSX + '\n$1');

    fs.writeFileSync(file, content);
}

patchSetupFile('components/SetupScreen.tsx');
patchSetupFile('components/setup/EducationalSetupScreen.tsx');

