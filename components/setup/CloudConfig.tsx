
import React, { useState } from 'react';
import { CloudProvider } from '../../services/EngineFactory';

interface CloudConfigProps {
    apiKey: string;
    setApiKey: (key: string) => void;
    cloudProvider?: CloudProvider;
    setCloudProvider?: (provider: CloudProvider) => void;
    T: any;
}

export const CloudConfig: React.FC<CloudConfigProps> = ({
    apiKey,
    setApiKey,
    cloudProvider = 'groq',
    setCloudProvider,
    T
}) => {
    return (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 animate-fade-in space-y-4">

            {/* Cloud Provider Selection */}
            <div>
                <label className="block text-sm font-bold tracking-wider text-cyan-300 uppercase mb-3 font-pixel border-b-2 border-slate-600 pb-2">
                    CLOUD PROVIDER
                </label>
                <div className="relative">
                    <select
                        value={cloudProvider}
                        onChange={(e) => setCloudProvider?.(e.target.value as CloudProvider)}
                        className="w-full bg-slate-900 border-2 border-cyan-500 text-cyan-200 p-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-300 appearance-none font-pixel"
                    >
                        <option value="groq">Groq - 14,400 req/day 100% FREE (Recommended)</option>
                        <option value="gemini">Google Gemini - 250 req/day 100% FREE</option>
                        <option value="openrouter">OpenRouter - 50-1000 req/day (Free models only)</option>
                        <option value="deepseek">DeepSeek - 30-day trial then PAID</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-cyan-500 text-xl">
                        ▼
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {cloudProvider === 'groq' && 'Ultra-fast inference (500+ tokens/sec) • NO credit card • Cannot incur charges'}
                    {cloudProvider === 'gemini' && 'Advanced reasoning • NO credit card • Hard rate limits prevent charges'}
                    {cloudProvider === 'openrouter' && 'Access 100+ models • Requires credit card • Free models only'}
                    {cloudProvider === 'deepseek' && 'Multilingual (100+ languages) • Trial expires in 30 days • Pay-per-use after'}
                </p>
            </div>

            {/* API Key Input - Changes based on provider */}
            <div>
                <label className="block text-sm font-bold tracking-wider text-cyan-300 uppercase mb-3 font-pixel border-b-2 border-slate-600 pb-2 flex justify-between items-end">
                    <span>
                        {cloudProvider === 'groq' && 'GROQ API KEY'}
                        {cloudProvider === 'deepseek' && 'DEEPSEEK API KEY'}
                        {cloudProvider === 'openrouter' && 'OPENROUTER API KEY'}
                        {cloudProvider === 'gemini' && 'GOOGLE GEMINI API KEY'}
                    </span>
                    <a
                        href={
                            cloudProvider === 'groq' ? 'https://console.groq.com/keys' :
                            cloudProvider === 'deepseek' ? 'https://platform.deepseek.com/api_keys' :
                            cloudProvider === 'openrouter' ? 'https://openrouter.ai/keys' :
                            'https://aistudio.google.com/app/apikey'
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline hover:text-white font-normal"
                    >
                        {T.get_key || 'Get Key'}
                    </a>
                </label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                        cloudProvider === 'groq' ? 'gsk_...' :
                        cloudProvider === 'deepseek' ? 'sk-...' :
                        cloudProvider === 'openrouter' ? 'sk-or-...' :
                        'AIzaSy...'
                    }
                    className="w-full bg-slate-900 border-2 border-cyan-500 text-cyan-200 p-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-300 font-pixel"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <span>* {T.security_note || 'Keys stored in browser session only'}</span>
                    <span className="text-yellow-600 hidden sm:inline">| Required for Cloud Mode & Workshop Audit</span>
                </p>
            </div>

            {/* Provider Info */}
            {cloudProvider === 'groq' && (
                <div className="bg-blue-900/30 border-2 border-blue-500/50 rounded p-5 font-pixel text-base text-gray-200 space-y-2">
                    <p className="font-bold text-blue-400 text-lg mb-3">✅ 100% FREE - No Charges Possible</p>
                    <p className="mb-2">Developed by Groq Inc. (ex-Google TPU team)</p>
                    <p>• Ultra-fast LPU™ inference (500+ tokens/sec)</p>
                    <p>• 14,400 requests/day for Llama 3.1 8B</p>
                    <p>• 1,000 requests/day for Llama 3.3 70B</p>
                    <p>• NO credit card required</p>
                    <p className="text-green-400 mt-3 font-bold">• You cannot incur charges on free tier</p>
                </div>
            )}
            {cloudProvider === 'gemini' && (
                <div className="bg-purple-900/30 border-2 border-purple-500/50 rounded p-5 font-pixel text-base text-gray-200 space-y-2">
                    <p className="font-bold text-purple-400 text-lg mb-3">✅ 100% FREE - No Charges Possible</p>
                    <p className="mb-2">Google's latest Gemini 2.5 models</p>
                    <p>• Gemini 2.5 Flash: 250 requests/day</p>
                    <p>• Gemini 2.5 Flash-Lite: 1,000 requests/day</p>
                    <p>• NO credit card required</p>
                    <p>• Hard rate limits prevent overage charges</p>
                    <p className="text-green-400 mt-3 font-bold">• You cannot incur charges on free tier</p>
                </div>
            )}
            {cloudProvider === 'openrouter' && (
                <div className="bg-yellow-900/30 border-2 border-yellow-500/50 rounded p-5 font-pixel text-base text-gray-200 space-y-2">
                    <p className="font-bold text-yellow-400 text-lg mb-3">⚠️ CONDITIONAL - Free Models Only</p>
                    <p className="mb-2">API aggregator with 100+ models</p>
                    <p>• 50 req/day free (no purchase)</p>
                    <p>• 1,000 req/day free (after $10 one-time purchase)</p>
                    <p>• Requires credit card for free plan</p>
                    <p className="text-yellow-400 mt-3 font-bold">⚠️ WARNING: If you select PAID models, you WILL be charged</p>
                    <p className="text-green-400">✓ Free models (Gemini Flash, Llama) are safe</p>
                    <p className="text-base mt-2 text-gray-300">Verify model pricing at openrouter.ai before use</p>
                </div>
            )}
            {cloudProvider === 'deepseek' && (
                <div className="bg-red-900/30 border-2 border-red-500/50 rounded p-5 font-pixel text-base text-gray-200 space-y-2">
                    <p className="font-bold text-red-400 text-lg mb-3">⚠️ TRIAL ONLY - Charges After 30 Days</p>
                    <p className="mb-2">Chinese AI company (open-source V3 model)</p>
                    <p>• Free trial: 5 million tokens (expires in 30 days)</p>
                    <p>• Supports 100+ languages (excellent for multilingual)</p>
                    <p>• NO credit card for trial</p>
                    <p className="text-red-400 mt-3 font-bold">⚠️ AFTER TRIAL: Pay-per-use ($0.28-$0.42 per 1M tokens)</p>
                    <p className="text-yellow-400">⚠️ You WILL incur charges after trial expires</p>
                    <p className="text-base mt-2 text-gray-300">Review pricing at api-docs.deepseek.com before trial ends</p>
                </div>
            )}
        </div>
    );
};
