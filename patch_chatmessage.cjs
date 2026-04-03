const fs = require('fs');
let code = fs.readFileSync('components/ChatMessage.tsx', 'utf-8');

// Replace romanization useMemo
code = code.replace(
`    // Romanization logic: Priority 1: AI provided it. Priority 2: Utility generated it.
    const romanization = React.useMemo(() => {
        if (!isBeginner || msg.role === 'user') return null;
        if (msg.meta?.romanization) return msg.meta.romanization;
        
        // Only auto-generate for specific languages if AI didn't provide it
        return TransliterationService.transliterate(msg.content, targetLanguage);
    }, [msg.content, msg.meta?.romanization, targetLanguage, msg.role, isBeginner]);`,
`    // Romanization logic
    const [romanizedText, setRomanizedText] = React.useState<string>(msg.meta?.romanization || '');
    const [isRomanizing, setIsRomanizing] = React.useState(false);`
);

// Add handleRomanize
code = code.replace(
`    const handleTranslate = async (e: React.MouseEvent) => {`,
`    const handleRomanize = async (e: React.MouseEvent) => {
        if (romanizedText || isRomanizing) return;
        
        e.preventDefault();
        const details = (e.target as HTMLElement).closest('details');
        if (details) details.open = true;

        setIsRomanizing(true);
        try {
            let result = '';
            const needsLLM = [Language.JAPANESE, Language.MANDARIN, Language.CANTONESE, Language.WU].includes(targetLanguage);
            
            if (needsLLM && engine?.requestRomanization) {
                result = await engine.requestRomanization(msg.content);
            } else {
                result = TransliterationService.transliterate(msg.content, targetLanguage);
                if (!result && engine?.requestRomanization) {
                     result = await engine.requestRomanization(msg.content);
                }
            }

            if (!result) result = 'Not supported for this language.';
            
            setRomanizedText(result);
            if (msg.meta) msg.meta.romanization = result;
        } catch (err) {
            console.error("Romanization failed", err);
            setRomanizedText("Failed to generate.");
        } finally {
            setIsRomanizing(false);
        }
    };

    const handleTranslate = async (e: React.MouseEvent) => {`
);

// Remove the old static romanization render
code = code.replace(
`                {romanization && (
                    <p className="text-sm text-cyan-400/70 font-mono mt-1 italic tracking-wide animate-fade-in">
                        {romanization}
                    </p>
                )}`,
``
);

// Add the romanization button inside the details block
const newButton = 
`                       {engine?.requestRomanization && (
                         <details className="group bg-gray-900/50 rounded border border-gray-700/50 overflow-hidden">
                            <summary 
                                onClick={handleRomanize}
                                className="px-3 py-2 text-[10px] text-emerald-400 cursor-pointer hover:bg-gray-800 list-none uppercase tracking-widest font-bold flex items-center gap-2"
                            >
                                <span className={\`transition-transform text-[8px] \${romanizedText ? 'rotate-90' : ''}\`}>▶</span> 
                                {isRomanizing ? 'Generating...' : 'Romanize'}
                                {isRomanizing && <div className="w-2 h-2 border border-emerald-400 border-t-transparent rounded-full animate-spin ml-auto"></div>}
                            </summary>
                            {romanizedText && (
                                <div className="p-3 text-lg text-emerald-100 bg-emerald-900/10 border-t border-gray-700/50 leading-relaxed font-serif">
                                    {romanizedText}
                                </div>
                            )}
                         </details>
                       )}
                       
                       {engine?.requestNativeTranslation`;

code = code.replace(`                       {engine?.requestNativeTranslation`, newButton);

fs.writeFileSync('components/ChatMessage.tsx', code);
