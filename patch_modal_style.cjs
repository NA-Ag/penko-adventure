const fs = require('fs');

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf-8');

    const oldModal = /{showDeleteConfirm && \([\s\S]*?<\/div>\s*<\/div>\s*\)\}/;
    const newModal = `{showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-sm animate-fade-in font-pixel">
              <div className="bg-slate-50 w-full max-w-xl max-h-[90vh] rounded-xl shadow-[8px_8px_0_rgba(0,0,0,0.5)] border-4 border-slate-800 flex flex-col overflow-hidden relative">
                
                <div className="bg-slate-800 p-4 border-b-4 border-slate-700 flex justify-between items-center sticky top-0 z-10 shrink-0">
                  <h2 className="text-2xl font-retro text-amber-400 glow-text">{T.remove_ai_title || "REMOVE LOCAL AI?"}</h2>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-400 text-white font-retro text-xl border-b-4 border-red-700 active:border-b-0 active:translate-y-1 rounded transition-all"
                  >
                    X
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-6 text-base md:text-lg leading-relaxed overflow-y-auto">
                  <div className="text-5xl mb-4 text-center">⚠️</div>
                  <p className="text-slate-800 text-center font-bold">
                      {T.remove_ai_desc || "This will permanently delete the ~850MB Qwen 3.5 model from your browser's local storage cache. You will need to download it again if you want to play Offline Mode later."}
                  </p>
                </div>

                <div className="p-4 bg-slate-200 border-t-4 border-slate-300 shrink-0 flex gap-4">
                  <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-retro text-xl py-4 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all rounded"
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
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-retro text-xl py-4 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all rounded"
                  >
                      {T.delete || "DELETE AI"}
                  </button>
                </div>
              </div>
            </div>
        )}`;

    content = content.replace(oldModal, newModal);
    fs.writeFileSync(file, content);
}

patchFile('components/SetupScreen.tsx');
patchFile('components/setup/EducationalSetupScreen.tsx');
