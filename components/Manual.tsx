import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface ManualProps {
  onClose: () => void;
  nativeLanguage: Language;
}

export const Manual: React.FC<ManualProps> = ({ onClose, nativeLanguage }) => {
  const T = TRANSLATIONS[nativeLanguage] || TRANSLATIONS[Language.ENGLISH];

  // Determine if language is RTL (Arabic, Hebrew, etc.)
  const isRTL = false; // Set to true for Arabic/Hebrew when needed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-100 text-slate-900 w-full max-w-2xl h-[80vh] overflow-y-auto rounded shadow-[10px_10px_0_#0f172a] border-4 border-slate-800 flex flex-col relative font-pixel"
        dir={isRTL ? 'rtl' : 'ltr'}
      >

        {/* Header */}
        <div className="bg-slate-800 text-white p-4 border-b-4 border-slate-900 sticky top-0 z-10 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-retro text-amber-400 glow-text">{T.manual_title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 font-bold text-2xl px-2 transition-colors"
          >
            X
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 space-y-6 text-base md:text-lg leading-relaxed">

          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase border-b-2 border-slate-400 pb-1 text-cyan-600">
              {T.manual_welcome_title}
            </h3>
            <p className="text-slate-700">
              {T.manual_welcome_desc}
            </p>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase border-b-2 border-slate-400 pb-1 text-cyan-600">
              {T.manual_game_modes_title}
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-200 p-3 rounded border-l-4 border-cyan-500">
                <h4 className="font-bold text-cyan-700 mb-1">{T.manual_community_mode}</h4>
                <p className="text-sm text-slate-600">
                  {T.manual_community_desc}
                </p>
              </div>

              <div className="bg-slate-200 p-3 rounded border-l-4 border-amber-500">
                <h4 className="font-bold text-amber-700 mb-1">{T.manual_browser_ai}</h4>
                <p className="text-sm text-slate-600">
                  {T.manual_browser_ai_desc}
                </p>
              </div>

              <div className="bg-slate-200 p-3 rounded border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-700 mb-1">{T.manual_cloud_mode}</h4>
                <p className="text-sm text-slate-600">
                  {T.manual_cloud_desc}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase border-b-2 border-slate-400 pb-1 text-cyan-600">
              {T.manual_how_to_play}
            </h3>
            <ol className="list-decimal space-y-2 pl-6 text-slate-700">
              <li>{T.manual_how_step1}</li>
              <li>{T.manual_how_step2}</li>
              <li>{T.manual_how_step3}</li>
              <li>{T.manual_how_step4}</li>
              <li>{T.manual_how_step5}</li>
              <li>{T.manual_how_step6}</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase border-b-2 border-slate-400 pb-1 text-cyan-600">
              {T.manual_tips_title}
            </h3>
            <ul className="list-disc space-y-2 pl-6 text-slate-700">
              <li>{T.manual_tip1}</li>
              <li>{T.manual_tip2}</li>
              <li>{T.manual_tip3}</li>
              <li>{T.manual_tip4}</li>
              <li>{T.manual_tip5}</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-3 uppercase border-b-2 border-slate-400 pb-1 text-cyan-600">
              {T.manual_shortcuts_title}
            </h3>
            <div className="bg-slate-200 p-4 rounded space-y-1 text-sm font-mono">
              <p><kbd className="bg-slate-800 text-cyan-400 px-2 py-1 rounded">Ctrl+S</kbd> - {T.manual_shortcut_save}</p>
              <p><kbd className="bg-slate-800 text-cyan-400 px-2 py-1 rounded">Ctrl+L</kbd> - {T.manual_shortcut_load}</p>
              <p><kbd className="bg-slate-800 text-cyan-400 px-2 py-1 rounded">Esc</kbd> - {T.manual_shortcut_exit}</p>
            </div>
          </section>

          {/* Info Box */}
          <div className="flex justify-center mt-8">
            <div className="bg-slate-800 text-cyan-400 px-4 py-3 rounded text-sm font-retro text-center">
              {T.manual_footer}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-200 border-t-4 border-slate-800 sticky bottom-0 text-center shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 text-white font-retro text-sm hover:bg-slate-700 active:translate-y-1 shadow-[4px_4px_0_#94a3b8] active:shadow-none transition-all"
          >
            {T.manual_close}
          </button>
        </div>
      </div>
    </div>
  );
};
