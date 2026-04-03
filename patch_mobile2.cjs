const fs = require('fs');

// 1. App.tsx changes
let app = fs.readFileSync('App.tsx', 'utf-8');
// Make language dropdown visible on mobile
app = app.replace(
    /<div className="relative hidden md:flex items-center gap-2">/,
    '<div className="relative flex items-center gap-1 sm:gap-2">'
);
// Make dropdown button smaller on mobile
app = app.replace(
    /className="text-base sm:text-lg text-cyan-200 bg-slate-900 border-2 border-cyan-500 font-pixel px-4 py-3 pr-10/,
    'className="text-xs sm:text-lg text-cyan-200 bg-slate-900 border-2 border-cyan-500 font-pixel px-2 sm:px-4 py-2 sm:py-3 pr-6 sm:pr-10'
);
app = app.replace(
    /<span className="text-cyan-400 font-pixel text-sm uppercase">\{T\.i_speak \|\| 'I SPEAK'\}:<\/span>/,
    '<span className="hidden sm:inline text-cyan-400 font-pixel text-sm uppercase">{T.i_speak || \'I SPEAK\'}:</span>'
);

// Make Manual button smaller and hide in game on mobile
app = app.replace(
    /<button\s+onClick=\{handleOpenManual\}\s+className="text-base sm:text-xl text-slate-900 bg-amber-500 hover:bg-amber-400 transition-all font-pixel border-2 border-amber-300 px-4 py-3/g,
    '<button\n                  onClick={handleOpenManual}\n                  className={`${gameActive ? \'hidden md:block\' : \'\'} text-xs sm:text-xl text-slate-900 bg-amber-500 hover:bg-amber-400 transition-all font-pixel border-2 border-amber-300 px-2 sm:px-4 py-2 sm:py-3'
);

// Make Exit button smaller on mobile
app = app.replace(
    /<button\s+onClick=\{handleExitGame\}\s+className="text-base sm:text-xl text-slate-900 bg-red-500 hover:bg-red-400 transition-all font-pixel border-2 border-red-300 px-4 py-3/g,
    '<button\n                  onClick={handleExitGame}\n                  className="text-xs sm:text-xl text-slate-900 bg-red-500 hover:bg-red-400 transition-all font-pixel border-2 border-red-300 px-2 sm:px-4 py-2 sm:py-3'
);
fs.writeFileSync('App.tsx', app);

// 2. SetupScreen and EducationalSetupScreen fixes (Prevent text popping out)
let setup = fs.readFileSync('components/SetupScreen.tsx', 'utf-8');
setup = setup.replace(/text-3xl sm:text-5xl font-retro text-cyan-400/g, 'text-2xl sm:text-4xl lg:text-5xl font-retro text-cyan-400');
setup = setup.replace(/className="w-full py-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-retro text-3xl/g, 'className="w-full py-4 sm:py-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-retro text-xl sm:text-3xl');
fs.writeFileSync('components/SetupScreen.tsx', setup);

let eduSetup = fs.readFileSync('components/setup/EducationalSetupScreen.tsx', 'utf-8');
eduSetup = eduSetup.replace(/text-3xl sm:text-5xl font-retro text-cyan-400/g, 'text-2xl sm:text-4xl lg:text-5xl font-retro text-cyan-400');
eduSetup = eduSetup.replace(/className="w-full py-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-retro text-3xl/g, 'className="w-full py-4 sm:py-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-retro text-xl sm:text-3xl');
fs.writeFileSync('components/setup/EducationalSetupScreen.tsx', eduSetup);

// 3. StatusPanel.tsx wrap in Collapsible for mobile
let status = fs.readFileSync('components/StatusPanel.tsx', 'utf-8');

const innerContent = `
        <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-gray-800 p-2 shrink-0 select-none">
                 <div className="flex justify-between mb-1 font-pixel">
                     <span className="text-red-500 tracking-widest text-lg">{T.hp}</span>
                     <span className="text-gray-300">{health}/100</span>
                 </div>
                 <div className="w-full h-6 bg-gray-900 border-2 border-gray-600 relative p-0.5">
                     <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000,#000_5px,#222_5px,#222_10px)]"></div>
                     <div 
                        className="h-full bg-red-600 transition-all duration-500 relative" 
                        style={{ width: \`\${Math.max(0, Math.min(100, health))}%\` }}
                     >
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-white/30"></div>
                     </div>
                 </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-lg grow flex flex-col overflow-hidden">
                <h3 className="text-green-400 font-pixel text-lg mb-3 border-b border-gray-700 pb-2 tracking-wider shrink-0">
                    {educationalScenario ? (ET?.objectives_label || 'OBJECTIVES') : T.inventory}
                </h3>
                <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar min-h-0">
                    {educationalScenario ? (
                        <ul className="space-y-3">
                            {objectives?.map((obj: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 bg-gray-900/50 p-3 rounded border border-gray-700 animate-fade-in">
                                    <div className="w-4 h-4 rounded-none border-2 border-cyan-500 mt-1 shrink-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-cyan-500 opacity-20"></div>
                                    </div>
                                    <span className="text-xs font-mono text-cyan-100 leading-tight uppercase tracking-wider">{obj}</span>
                                </li>
                            ))}
                        </ul>
                    ) : inventory.length === 0 ? (
                        <p className="text-gray-500 text-sm italic py-4 text-center">{T.empty_pockets}</p>
                    ) : (
                        <ul className="space-y-2">
                        {inventory.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 bg-gray-700/50 p-2 rounded border border-gray-600 hover:bg-gray-700 transition-colors animate-fade-in">
                            <span className="text-2xl select-none filter drop-shadow-md">{item.icon}</span>
                            <div>
                                <p className="text-sm font-bold text-gray-200">{item.name}</p>
                                <p className="text-[10px] text-gray-400">{item.description.substring(0, 30)}...</p>
                            </div>
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>`;

const newStatus = `import React, { useState } from 'react';
import { InventoryItem, Language } from '../types';
import { Scenario } from '../data/educational/frameworks/types';
import { EDUCATIONAL_TRANSLATIONS } from '../data/educational/translations';

interface StatusPanelProps {
    health: number;
    inventory: InventoryItem[];
    T: any;
    educationalScenario?: Scenario;
    nativeLanguage?: Language;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ health, inventory, T, educationalScenario, nativeLanguage }) => {
    const ET = nativeLanguage ? (EDUCATIONAL_TRANSLATIONS[nativeLanguage] || EDUCATIONAL_TRANSLATIONS[Language.ENGLISH]) : null;
    const localizedScenario = (ET && educationalScenario) ? ET.scenarios[educationalScenario.id] : null;
    const objectives = ET?.scenarios?.[educationalScenario?.id || '']?.objectives || localizedScenario?.objectives || educationalScenario?.objectives;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Desktop View: Always expanded, takes full flex space */}
            <div className="hidden lg:flex flex-col flex-1 min-h-0 w-full">
                ${innerContent}
            </div>

            {/* Mobile View: Collapsible Menu button floating at top of chat or anchored */}
            <div className="lg:hidden w-full bg-gray-900 border-b border-gray-700 shrink-0">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-gray-800 p-2 text-xs font-pixel text-gray-300 uppercase tracking-widest flex justify-between items-center"
                >
                    <span>{educationalScenario ? (ET?.objectives_label || 'OBJECTIVES') : 'STATUS'} & HEALTH</span>
                    <span className="text-cyan-400">{health}/100 HP {isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                    <div className="flex flex-col h-64 border-t border-gray-700 w-full overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-10 relative">
                        ${innerContent}
                    </div>
                )}
            </div>
        </>
    );
};
`;

fs.writeFileSync('components/StatusPanel.tsx', newStatus);

