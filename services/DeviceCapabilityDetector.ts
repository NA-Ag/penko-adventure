/**
 * DeviceCapabilityDetector - Detects hardware capabilities for smart model selection
 *
 * Purpose: Automatically recommend the best Qwen model based on:
 * - Available RAM
 * - CPU cores & speed
 * - Storage quota
 * - Mobile vs Desktop
 * - Browser performance
 *
 * This prevents users from selecting models that will crash/freeze their device!
 */

export interface DeviceCapabilities {
    // Hardware
    deviceMemoryGB: number | null;      // RAM in GB (navigator.deviceMemory)
    hardwareConcurrency: number;        // CPU cores
    isMobile: boolean;                  // Mobile vs Desktop
    isLowEnd: boolean;                  // Low-end device flag

    // Storage
    storageQuotaGB: number;             // Available storage in GB
    storageUsedGB: number;              // Currently used storage in GB
    storageFreeGB: number;              // Free storage in GB

    // Browser/Platform
    browser: string;                    // Chrome/Safari/Firefox/etc
    platform: string;                   // Win/Mac/Linux/iOS/Android
    hasWebGPU: boolean;                 // WebGPU support

    // Performance
    performanceScore: number;           // 0-100 composite score
}

export interface ModelRecommendation {
    modelId: string;                    // Model ID (e.g., "onnx-community/Qwen2.5-0.5B-Instruct")
    modelName: string;
    reason: string;
    sizeGB: number;
    canRun: boolean;                    // false if insufficient resources
    warning?: string;                   // Optional warning message
}

export interface ModelCompatibilityCheck {
    compatible: boolean;
    issues: string[];                   // List of compatibility issues
    warnings: string[];                 // Non-critical warnings
    recommendations: string[];          // Suggested alternatives or settings
}

export class DeviceCapabilityDetector {

    /**
     * Detect all device capabilities
     */
    static async detect(): Promise<DeviceCapabilities> {
        // Get device memory (Chrome/Edge only, returns GB)
        const deviceMemoryGB = (navigator as any).deviceMemory || null;

        // Get CPU cores
        const hardwareConcurrency = navigator.hardwareConcurrency || 2;

        // Detect mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Get storage quota
        const storageEstimate = await navigator.storage.estimate();
        const storageQuotaGB = (storageEstimate.quota || 0) / (1024 ** 3);
        const storageUsedGB = (storageEstimate.usage || 0) / (1024 ** 3);
        const storageFreeGB = storageQuotaGB - storageUsedGB;

        // Detect browser
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edg')) browser = 'Edge';

        // Detect platform
        const platform = this.detectPlatform();

        // Check WebGPU support
        const hasWebGPU = 'gpu' in navigator;

        // Calculate performance score
        const performanceScore = this.calculatePerformanceScore({
            deviceMemoryGB,
            hardwareConcurrency,
            isMobile,
            storageFreeGB,
            hasWebGPU
        });

        // Determine if low-end device
        const isLowEnd = performanceScore < 30 || (deviceMemoryGB !== null && deviceMemoryGB < 4) || isMobile;

        return {
            deviceMemoryGB,
            hardwareConcurrency,
            isMobile,
            isLowEnd,
            storageQuotaGB,
            storageUsedGB,
            storageFreeGB,
            browser,
            platform,
            hasWebGPU,
            performanceScore
        };
    }

    /**
     * Recommend the best model for this device
     */
    static async recommendModel(): Promise<ModelRecommendation> {
        const caps = await this.detect();

        console.log('[DeviceCapabilityDetector] Device capabilities:', caps);

        // CRITICAL: Insufficient storage
        if (caps.storageFreeGB < 1) {
            return {
                modelId: 'lamini',
                modelName: 'LaMini (250MB)',
                reason: 'Less than 1GB free storage',
                sizeGB: 0.25,
                canRun: true,
                warning: '⚠️ Very low storage! Consider freeing space.'
            };
        }

        // LOW-END: Mobile or <4GB RAM or <2 cores
        if (caps.isLowEnd || caps.hardwareConcurrency < 2 || (caps.deviceMemoryGB !== null && caps.deviceMemoryGB < 4)) {
            return {
                modelId: 'qwen-small',
                modelName: 'Qwen 0.5B (800MB)',
                reason: caps.isMobile
                    ? 'Mobile device - optimized for battery & memory'
                    : 'Low-end device - balanced performance',
                sizeGB: 0.8,
                canRun: caps.storageFreeGB >= 1,
                warning: caps.storageFreeGB < 1.5 ? '⚠️ Low storage. May need to clear cache.' : undefined
            };
        }

        // MID-RANGE: Desktop with 4-8GB RAM, 4+ cores
        if (caps.deviceMemoryGB !== null && caps.deviceMemoryGB >= 4 && caps.deviceMemoryGB < 8) {
            return {
                modelId: 'qwen-small',
                modelName: 'Qwen 0.5B (800MB)',
                reason: 'Good balance of quality and speed for your device',
                sizeGB: 0.8,
                canRun: caps.storageFreeGB >= 1
            };
        }

        // HIGH-END: Desktop with 8GB+ RAM, 4+ cores, 3GB+ free storage
        if (
            !caps.isMobile &&
            caps.hardwareConcurrency >= 4 &&
            caps.storageFreeGB >= 3 &&
            (caps.deviceMemoryGB === null || caps.deviceMemoryGB >= 8)
        ) {
            return {
                modelId: 'qwen-medium',
                modelName: 'Qwen 1.5B (2.2GB)',
                reason: 'High-end device - best quality stories!',
                sizeGB: 2.2,
                canRun: true
            };
        }

        // DEFAULT: Qwen 0.5B (safest choice)
        return {
            modelId: 'qwen-small',
            modelName: 'Qwen 0.5B (800MB)',
            reason: 'Recommended for most devices',
            sizeGB: 0.8,
            canRun: caps.storageFreeGB >= 1
        };
    }

    /**
     * Get all available models with compatibility info
     */
    static async getAllModels(): Promise<ModelRecommendation[]> {
        const caps = await this.detect();

        return [
            {
                modelId: 'qwen-medium',
                modelName: 'Qwen 1.5B - Best Quality',
                reason: 'Desktop only, 8GB+ RAM recommended',
                sizeGB: 2.2,
                canRun: !caps.isMobile && caps.storageFreeGB >= 3,
                warning: caps.isMobile ? '❌ Not recommended for mobile' :
                         caps.storageFreeGB < 3 ? '❌ Insufficient storage' : undefined
            },
            {
                modelId: 'qwen-small',
                modelName: 'Qwen 0.5B - Good Quality',
                reason: 'Recommended for most devices',
                sizeGB: 0.8,
                canRun: caps.storageFreeGB >= 1,
                warning: caps.storageFreeGB < 1 ? '❌ Insufficient storage' : undefined
            },
            {
                modelId: 'lamini',
                modelName: 'LaMini - Basic Quality',
                reason: 'Fallback for low-end devices',
                sizeGB: 0.25,
                canRun: true,
                warning: undefined
            }
        ];
    }

    /**
     * Calculate composite performance score (0-100)
     */
    private static calculatePerformanceScore(params: {
        deviceMemoryGB: number | null;
        hardwareConcurrency: number;
        isMobile: boolean;
        storageFreeGB: number;
        hasWebGPU: boolean;
    }): number {
        let score = 0;

        // RAM score (0-30 points)
        if (params.deviceMemoryGB !== null) {
            if (params.deviceMemoryGB >= 16) score += 30;
            else if (params.deviceMemoryGB >= 8) score += 25;
            else if (params.deviceMemoryGB >= 4) score += 15;
            else score += 5;
        } else {
            // Unknown RAM, assume mid-range
            score += 15;
        }

        // CPU cores score (0-30 points)
        if (params.hardwareConcurrency >= 8) score += 30;
        else if (params.hardwareConcurrency >= 4) score += 25;
        else if (params.hardwareConcurrency >= 2) score += 15;
        else score += 5;

        // Mobile penalty (-20 points)
        if (params.isMobile) score -= 20;

        // Storage score (0-20 points)
        if (params.storageFreeGB >= 5) score += 20;
        else if (params.storageFreeGB >= 3) score += 15;
        else if (params.storageFreeGB >= 1) score += 10;
        else score += 0;

        // WebGPU bonus (0-20 points)
        if (params.hasWebGPU) score += 20;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Detect platform/OS
     */
    private static detectPlatform(): string {
        const ua = navigator.userAgent;
        if (ua.includes('Win')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Unknown';
    }

    /**
     * Format device info for display
     */
    static formatDeviceInfo(caps: DeviceCapabilities): string {
        const parts: string[] = [];

        if (caps.deviceMemoryGB !== null) {
            parts.push(`${caps.deviceMemoryGB}GB RAM`);
        } else {
            parts.push('RAM unknown'); // Firefox doesn't expose navigator.deviceMemory
        }
        parts.push(`${caps.hardwareConcurrency} cores`);
        parts.push(`${caps.storageFreeGB.toFixed(1)}GB storage`);
        parts.push(caps.browser);

        return parts.join(' • ');
    }

    /**
     * Check compatibility of specific model with user's device
     * This is the KEY method to prevent crashes!
     */
    static async checkModelCompatibility(modelId: string, modelSizeGB: number): Promise<ModelCompatibilityCheck> {
        const caps = await this.detect();
        const issues: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Storage check
        if (caps.storageFreeGB < modelSizeGB + 0.5) { // +0.5GB buffer
            issues.push(`Insufficient storage: ${caps.storageFreeGB.toFixed(1)}GB free, need ${(modelSizeGB + 0.5).toFixed(1)}GB`);
            recommendations.push('Free up browser storage or choose a smaller model');
        }

        // Firefox + large model check (the crash you experienced!)
        const isFirefox = caps.browser === 'Firefox';
        const isLargeModel = modelSizeGB > 1.0 || modelId.toLowerCase().includes('1.5b') || modelId.toLowerCase().includes('xl');

        if (isFirefox && isLargeModel) {
            warnings.push(`Firefox + large models (${modelSizeGB.toFixed(1)}GB) may cause high CPU usage`);
            recommendations.push('Consider using Qwen 0.5B (800MB) for better Firefox compatibility');
            recommendations.push('Or use Chrome/Edge for better WASM performance with large models');
        }

        // RAM check (if available)
        if (caps.deviceMemoryGB !== null) {
            const recommendedRAM = modelSizeGB * 3; // Rule of thumb: 3x model size
            if (caps.deviceMemoryGB < recommendedRAM) {
                warnings.push(`Low RAM: ${caps.deviceMemoryGB}GB available, ${recommendedRAM.toFixed(0)}GB recommended for this model`);
                if (caps.deviceMemoryGB < 4) {
                    recommendations.push('Choose a model under 500MB for smoother performance');
                }
            }
        }

        // CPU check
        if (caps.hardwareConcurrency < 4 && isLargeModel) {
            warnings.push(`Low CPU cores: ${caps.hardwareConcurrency} cores, 4+ recommended for large models`);
            recommendations.push('Large models may initialize slowly on your device');
        }

        // Mobile check
        if (caps.isMobile && modelSizeGB > 0.8) {
            warnings.push('Large models (>800MB) not recommended on mobile devices');
            recommendations.push('Use Qwen 0.5B (800MB) or LaMini (250MB) for mobile');
        }

        // GPT-2-XL specific warnings (doesn't support chat templates well)
        if (modelId.toLowerCase().includes('gpt2-xl')) {
            warnings.push('GPT-2-XL uses older architecture without chat template support');
            recommendations.push('Qwen models provide better quality output for language learning');
        }

        // Determine if compatible (no blocking issues)
        const compatible = issues.length === 0;

        return {
            compatible,
            issues,
            warnings,
            recommendations
        };
    }

    /**
     * Get recommended WASM thread count based on device capabilities
     * This prevents the CPU bottleneck crash!
     */
    static async getRecommendedWASMThreads(modelSizeGB: number): Promise<number> {
        const caps = await this.detect();

        const isFirefox = caps.browser === 'Firefox';
        const isLargeModel = modelSizeGB > 1.0;

        // Firefox + large model = use fewer threads to prevent crash
        if (isFirefox && isLargeModel) {
            return Math.min(2, Math.floor(caps.hardwareConcurrency / 2)); // Max 2 threads
        }

        // Chrome/Edge can handle more threads
        if (isLargeModel) {
            return Math.min(4, Math.floor(caps.hardwareConcurrency * 0.5)); // Use 50% of cores, max 4
        }

        // Small models can use more threads
        return Math.min(4, caps.hardwareConcurrency); // Use all cores up to 4
    }
}
