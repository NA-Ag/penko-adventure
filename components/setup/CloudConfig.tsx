
import React from 'react';

interface CloudConfigProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    geminiModel: string;
    setGeminiModel: (model: string) => void;
    T: any;
}

export const CloudConfig: React.FC<CloudConfigProps> = ({
    apiKey,
    setApiKey,
    geminiModel,
    setGeminiModel,
    T
}) => {
    return (
        <div className="bg-slate-800 border-4 border-cyan-600 rounded-none p-6 animate-fade-in space-y-6 shadow-[6px_6px_0_rgba(0,0,0,0.6)]">
            
            {/* Model Selection */}
            <div>
                <label className="block text-2xl font-bold tracking-wider text-cyan-300 uppercase mb-4 font-pixel border-b-2 border-slate-600 pb-3">
                    GEMINI MODEL
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite', desc: 'Newest Fast Preview' },
                        { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', desc: 'Newest Advanced Preview' },
                        { id: 'gemini-3-flash-preview', label: 'Gemini 3.0 Flash', desc: 'Fast Preview' },
                        { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Advanced & Recommended' },
                    ].map(model => (
                        <button
                            key={model.id}
                            onClick={() => setGeminiModel(model.id)}
                            className={`p-4 text-left transition-all relative shadow-[4px_4px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none border-4
                                ${geminiModel === model.id
                                    ? 'bg-cyan-600 border-cyan-300 text-white'
                                    : 'bg-slate-700 border-slate-500 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            <h3 className="font-pixel text-xl mb-2">{model.label}</h3>
                            <p className="text-base opacity-80 font-pixel">{model.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* API Key Input */}
            <div>
                <label className="block text-2xl font-bold tracking-wider text-cyan-300 uppercase mb-4 font-pixel border-b-2 border-slate-600 pb-3">
                    {T.cloud_api_key_label || "GOOGLE GEMINI API KEY"}
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="flex-1 bg-slate-900 border-4 border-cyan-500 text-cyan-200 p-5 text-2xl focus:outline-none focus:ring-2 focus:ring-cyan-300 font-mono shadow-inner"
                    />
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="py-5 px-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-retro text-2xl shadow-[6px_6px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center whitespace-nowrap"
                    >
                        {T.cloud_get_key || "GET KEY"}
                    </a>
                </div>
                <div className="mt-6 bg-slate-900 border-l-8 border-cyan-500 p-5">
                    <p className="text-xl text-white font-pixel leading-relaxed">
                        <span className="text-cyan-400 mr-2">*</span> 
                        {T.cloud_key_note || "Key is stored in your browser session only. It is deleted when you close this tab."} 
                        <br/><span className="text-amber-400 mr-2 mt-2 inline-block">|</span> 
                        {T.cloud_key_required || "Required for Cloud Mode."}
                    </p>
                </div>
            </div>

            {/* Provider Info */}
            <div className="bg-slate-900 border-4 border-amber-500/50 p-6 font-pixel text-xl text-gray-200 space-y-4 shadow-inner">
                <p className="font-bold text-amber-400 text-2xl mb-5 flex items-center gap-3">
                    <span className="text-3xl">⚠️</span> {T.cloud_service_title || "CLOUD AI SERVICE"}
                </p>
                <div className="space-y-3 opacity-90 leading-relaxed">
                    <p>{T.cloud_service_desc1 || "By using this mode, your gameplay data is sent to Google's servers for processing via your API Key."}</p>
                    <p className="text-amber-200">• {T.cloud_service_desc2 || "Usage is subject to your Google AI Studio account's billing and rate limits."}</p>
                    <p>• {T.cloud_service_desc3 || "Ensure you monitor your API usage if you have a linked billing account."}</p>
                    <p className="text-cyan-300">• {T.cloud_service_desc4 || "We provide ONLY the interface. We have no servers and do not save your key."}</p>
                </div>
            </div>
        </div>
    );
};
