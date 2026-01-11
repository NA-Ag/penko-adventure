import React, { useEffect, useState } from "react";
import { UserProfile, Language } from "../../types";
import { TRANSLATIONS } from "../../translations";
import toast from "react-hot-toast";
import { Download, HardDrive, Trash2, Play, Cpu, Gauge, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { getModelFiles } from '../../services/modelManifests';
import { CartridgeService } from '../../services/CartridgeService';

// Cartridge types
export type CartridgeTier = 'tiny' | 'small' | 'medium' | 'reasoning';

export interface Cartridge {
  id: string;                    // "en-es-medium"
  interfaceLanguage: string;     // "English"
  targetLanguage: string;        // "Spanish"
  interfaceCode: string;         // "en"
  targetCode: string;            // "es"
  tier: CartridgeTier;
  modelId: string;               // "onnx-community/gemma-3n-e2b-it-ONNX"
  estimatedSize: number;         // Bytes
  installedAt: number;           // Timestamp
}

// Hardware detection result
interface HardwareProfile {
  ram: number;              // GB
  cores: number;            // CPU cores
  gpu: boolean;             // WebGPU available?
  browser: string;          // Chrome, Firefox, Safari, Edge
  platform: string;         // Desktop, Mobile, Tablet
  recommendedTier: CartridgeTier;
  reason: string;           // Why this tier was recommended
}

// Model tier configurations - TRUE OPEN SOURCE MODELS ONLY
// Note: Gemma removed due to licensing restrictions (requires Google ToS agreement)
// All models below are MIT/Apache 2.0 licensed with NO usage restrictions
const MODEL_TIERS = {
  tiny: {
    id: 'tiny',
    name: 'Tiny',
    modelId: 'onnx-community/granite-4.0-350m-ONNX-web',  // IBM Granite 4.0 - Apache 2.0
    size: 700_000_000, // ~700MB (350M params)
    ramRequired: '2-4GB',
    description: 'IBM Granite 4.0 - Fastest. Works on any device. 12 languages.',
    recommended: false,
  },
  small: {
    id: 'small',
    name: 'Small',
    modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',  // Qwen 2.5 - Apache 2.0
    size: 600_000_000, // ~600MB (500M params)
    ramRequired: '4-8GB',
    description: 'Qwen 2.5 0.5B - Recommended. Best balance. 29 languages.',
    recommended: true,
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    modelId: 'onnx-community/Qwen2.5-1.5B',  // Qwen 2.5 1.5B - Apache 2.0
    size: 1_800_000_000, // ~1.8GB (1.5B params)
    ramRequired: '8GB+',
    description: 'Qwen 2.5 1.5B - Larger context, better quality. 29 languages.',
    recommended: false,
  },
  reasoning: {
    id: 'reasoning',
    name: 'Reasoning',
    modelId: 'onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX',  // DeepSeek R1 - MIT
    size: 1_500_000_000, // ~1.5GB (1.5B params)
    ramRequired: '8GB+',
    description: 'DeepSeek R1 - Best for complex narratives. MIT license. English+Chinese strong.',
    recommended: false,
  },
};

// Language display names
const LANGUAGE_NAMES: { [key: string]: string } = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
  ru: 'Русский',
  uk: 'Українська',
  pl: 'Polski',
  cs: 'Čeština',
};

// Detect hardware capabilities
function detectHardware(): HardwareProfile {
  const ram = (navigator as any).deviceMemory || 4; // Default 4GB if unavailable
  const cores = navigator.hardwareConcurrency || 2;
  const gpu = 'gpu' in navigator;

  // Detect browser
  const ua = navigator.userAgent;
  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  // Detect platform
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
  const platform = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  // Recommendation logic
  let recommendedTier: CartridgeTier;
  let reason: string;

  if (ram <= 2 || browser === 'Firefox' || platform === 'mobile') {
    recommendedTier = 'tiny';
    if (browser === 'Firefox') {
      reason = 'Firefox has WASM memory limits. Tiny tier is most stable.';
    } else if (platform === 'mobile') {
      reason = 'Mobile device detected. Tiny tier optimized for mobile.';
    } else {
      reason = 'Limited RAM detected. Tiny tier will run smoothly.';
    }
  } else if (ram >= 8 && gpu && platform === 'desktop') {
    recommendedTier = 'medium';
    reason = 'Powerful desktop detected. Medium tier will give you the best experience.';
  } else {
    recommendedTier = 'small';
    reason = 'Your device is perfect for Small tier. Best balance of quality and performance.';
  }

  return { ram, cores, gpu, browser, platform, recommendedTier, reason };
}

// Format bytes to human-readable
function formatBytes(bytes: number): string {
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}

// Format date
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

interface CartridgeManagerProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  onCartridgeReady: (cartridge: Cartridge) => void;
}

export const CartridgeManager: React.FC<CartridgeManagerProps> = ({
  profile,
  setProfile,
  onCartridgeReady,
}) => {
  const T = TRANSLATIONS[profile.nativeLanguage] || TRANSLATIONS[Language.ENGLISH];

  // State
  const [hardware, setHardware] = useState<HardwareProfile | null>(null);
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [storagePersisted, setStoragePersisted] = useState(false);

  // Install form state - use profile languages directly
  const selectedInterface = profile.nativeLanguage;
  const selectedTarget = profile.targetLanguage;
  const [selectedTier, setSelectedTier] = useState<CartridgeTier>('small'); // Default to recommended tier

  // Download state
  const [installing, setInstalling] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  // Initialize
  useEffect(() => {
    // Detect hardware
    const hw = detectHardware();
    setHardware(hw);
    setSelectedTier(hw.recommendedTier);

    // Request persistent storage
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(granted => {
        setStoragePersisted(granted);
        if (granted) {
          console.log('✅ Persistent storage granted');
        }
      });
    }

    // Load cartridges from LocalStorage
    const saved = localStorage.getItem('penko_cartridges');
    if (saved) {
      try {
        setCartridges(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cartridges:', e);
      }
    }
  }, []);

  // Install new cartridge
  const installCartridge = async () => {
    const tier = MODEL_TIERS[selectedTier];
    const cartridgeId = `${selectedInterface}-${selectedTarget}-${selectedTier}`;

    // Check if already installed
    if (cartridges.some(c => c.id === cartridgeId)) {
      toast.error('This cartridge is already installed!');
      return;
    }

    setInstalling(true);
    setDownloadProgress(0);
    setCurrentFile('Initializing...');

    try {
      // Create cartridge metadata
      const newCartridge: Cartridge = {
        id: cartridgeId,
        interfaceLanguage: LANGUAGE_NAMES[selectedInterface] || selectedInterface,
        targetLanguage: LANGUAGE_NAMES[selectedTarget] || selectedTarget,
        interfaceCode: selectedInterface,
        targetCode: selectedTarget,
        tier: selectedTier,
        modelId: tier.modelId,
        estimatedSize: tier.size,
        installedAt: Date.now(),
      };

      // Save cartridge (no pre-download needed - will download on first play)
      const updated = [...cartridges, newCartridge];
      setCartridges(updated);
      localStorage.setItem('penko_cartridges', JSON.stringify(updated));

      console.log(`[CartridgeManager] ✅ Cartridge registered: ${tier.modelId}`);
      toast.success('Cartridge installed! Model will download when you start playing.');
      setInstalling(false);

      // Don't auto-load - just save it for the user to select
      // User will click "Play" on the installed cartridge

    } catch (error) {
      console.error('Installation failed:', error);
      toast.error(`Installation failed: ${error}`);
      setInstalling(false);
    }
  };


  // Delete cartridge
  const deleteCartridge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cartridge?')) return;

    const cartridge = cartridges.find(c => c.id === id);
    if (!cartridge) return;

    const updated = cartridges.filter(c => c.id !== id);
    setCartridges(updated);
    localStorage.setItem('penko_cartridges', JSON.stringify(updated));
    
    // Clear browser cache and worker memory cache
    try {
      const deletedCount = await CartridgeService.deleteModelCache(cartridge.modelId);
      await CartridgeService.clearWorkerCache(cartridge.modelId);
      console.log(`[CartridgeManager] Deleted ${deletedCount} cached files for model ${cartridge.modelId}`);
      toast.success('Cartridge deleted and cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
      toast.success('Cartridge deleted (cache clearing failed)');
    }
  };

  // Select cartridge (doesn't start game - that's done by SetupScreen's "Browser AI" button)
  const selectCartridge = (cartridge: Cartridge) => {
    // Update profile with cartridge languages
    setProfile({
      ...profile,
      nativeLanguage: cartridge.interfaceCode as Language,
      targetLanguage: cartridge.targetCode as Language,
    });

    // Notify parent that cartridge is selected (ready to play)
    onCartridgeReady(cartridge);
  };

  if (!hardware) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 flex items-center gap-4 font-pixel text-lg">
          <Loader2 className="animate-spin" size={28} />
          <span>Detecting hardware...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-5xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-cyan-300 mb-2 uppercase tracking-wider font-pixel">Cartridge Manager</h3>
          <p className="text-gray-400 text-base font-pixel">Select quality tier and install cartridge to play offline</p>
        </div>

        {/* Hardware Info Banner */}
        <div className="bg-gray-900/50 border-2 border-cyan-500/50 rounded p-5 mb-6 flex items-start gap-4">
          <Cpu className="text-cyan-400 flex-shrink-0" size={28} />
          <div className="flex-1">
            <p className="text-cyan-200 text-base font-medium font-pixel">
              {hardware.ram}GB RAM · {hardware.cores} Cores · {hardware.browser} · {hardware.platform}
            </p>
            <p className="text-green-400 text-sm mt-2 font-pixel">
              {hardware.reason}
            </p>
          </div>
          {storagePersisted && (
            <CheckCircle className="text-green-400 flex-shrink-0" size={22} />
          )}
        </div>

        {/* Installing Progress */}
        {installing && (
          <div className="bg-green-900/30 border-2 border-green-500/50 rounded p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="animate-spin text-green-400" size={24} />
              <span className="text-green-400 font-medium text-base font-pixel">Installing cartridge...</span>
            </div>
            <div className="w-full bg-slate-900 border-2 border-slate-700 rounded h-4 overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-3 font-pixel">{currentFile}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Install New Cartridge */}
          <div className="bg-gray-900/50 border-2 border-gray-700 rounded-xl p-6">
            <h2 className="text-cyan-300 font-bold uppercase tracking-wider mb-6 flex items-center gap-3 text-lg font-pixel border-b-2 border-slate-600 pb-3">
              <Download size={24} />
              Install New Cartridge
            </h2>

            <div className="space-y-5">
              {/* Show selected languages (read-only) */}
              <div className="bg-slate-800/50 border-2 border-slate-700 rounded p-4">
                <div className="text-center">
                  <p className="text-sm text-slate-400 uppercase font-bold mb-3 font-pixel">Selected Languages</p>
                  <p className="text-cyan-400 font-medium text-xl font-pixel">
                    {LANGUAGE_NAMES[selectedInterface] || selectedInterface} → {LANGUAGE_NAMES[selectedTarget] || selectedTarget}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-pixel">Change languages using the selectors above</p>
                </div>
              </div>

              {/* Quality Tier */}
              <div>
                <label className="text-sm text-cyan-300 uppercase font-bold block mb-3 font-pixel border-b-2 border-slate-600 pb-2">
                  Quality Tier
                </label>
                <div className="space-y-3">
                  {Object.values(MODEL_TIERS).map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id as CartridgeTier)}
                      disabled={installing}
                      className={`w-full text-left p-4 rounded border-2 transition-all font-pixel shadow-[2px_2px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none ${
                        selectedTier === tier.id
                          ? 'bg-cyan-900/30 border-cyan-500 ring-2 ring-cyan-400/50'
                          : 'bg-slate-800 border-slate-600 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-200 font-bold text-base">{tier.name}</span>
                            {tier.recommended && hardware.recommendedTier === tier.id && (
                              <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded font-bold uppercase border border-green-700">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mt-2">{tier.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-400 text-sm font-bold">{formatBytes(tier.size)}</p>
                          <p className="text-gray-400 text-xs mt-1">{tier.ramRequired}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Install Button */}
              <button
                onClick={installCartridge}
                disabled={installing}
                className="w-full py-4 bg-green-600 hover:bg-green-500 rounded text-white font-bold shadow-[2px_2px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-base font-pixel"
              >
                {installing ? 'Installing...' : 'Install Cartridge'}
              </button>
            </div>
          </div>

          {/* Right: Library */}
          <div className="bg-gray-900/50 border-2 border-gray-700 rounded-xl p-6 flex flex-col">
            <h2 className="text-cyan-300 font-bold uppercase tracking-wider mb-6 flex items-center gap-3 text-lg font-pixel border-b-2 border-slate-600 pb-3">
              <HardDrive size={24} />
              Your Library
            </h2>

            <div className="flex-1 space-y-3">
              {cartridges.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <HardDrive size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-base font-pixel">No cartridges installed yet.</p>
                  <p className="text-sm mt-2 font-pixel">Install one to get started!</p>
                </div>
              ) : (
                cartridges.map((cart) => (
                  <div
                    key={cart.id}
                    className="bg-slate-800/50 border-2 border-slate-700 rounded p-4 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-cyan-200 font-bold text-base font-pixel">
                          {cart.interfaceLanguage} → {cart.targetLanguage}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 font-pixel">
                          {MODEL_TIERS[cart.tier].name} · {formatBytes(cart.estimatedSize)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 font-pixel">{formatDate(cart.installedAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => selectCartridge(cart)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white text-sm font-bold font-pixel shadow-[2px_2px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all"
                      >
                        <CheckCircle size={16} />
                        Select
                      </button>
                      <button
                        onClick={() => deleteCartridge(cart.id)}
                        className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 border-2 border-red-700 rounded text-red-400 shadow-[2px_2px_0_rgba(0,0,0,0.8)] active:translate-y-1 active:shadow-none transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
