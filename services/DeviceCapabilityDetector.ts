/**
 * DeviceCapabilityDetector - Detects hardware capabilities for Qwen3 0.6B model
 *
 * Purpose: Automatically check if the device can run the local model based on:
 * - Available RAM
 * - CPU cores
 * - Storage quota
 * - Browser performance
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

export interface ModelCompatibilityCheck {
    compatible: boolean;
    issues: string[];                   // List of compatibility issues
    warnings: string[];                 // Non-critical warnings
    recommendations: string[];          // Suggested alternatives or settings
}

export class DeviceCapabilityDetector {
    private static readonly QWEN2_5_SIZE_GB = 0.35;

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
        let storageQuotaGB = 0;
        let storageUsedGB = 0;
        let storageFreeGB = 0;
        
        if (navigator.storage && navigator.storage.estimate) {
            const storageEstimate = await navigator.storage.estimate();
            storageQuotaGB = (storageEstimate.quota || 0) / (1024 ** 3);
            storageUsedGB = (storageEstimate.usage || 0) / (1024 ** 3);
            storageFreeGB = storageQuotaGB - storageUsedGB;
        }

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
        if (params.storageFreeGB >= 2) score += 20;
        else if (params.storageFreeGB >= 1) score += 15;
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
            parts.push('RAM unknown');
        }
        parts.push(`${caps.hardwareConcurrency} cores`);
        parts.push(`${caps.storageFreeGB.toFixed(1)}GB storage`);
        parts.push(caps.browser);

        return parts.join(' • ');
    }

    /**
     * Check compatibility of the Qwen3 0.6B model with user's device
     */
    static async checkModelCompatibility(): Promise<ModelCompatibilityCheck> {
        const caps = await this.detect();
        const issues: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];

        const modelSizeGB = this.QWEN2_5_SIZE_GB;

        // Storage check
        if (caps.storageFreeGB < modelSizeGB + 0.5) { // +0.5GB buffer
            issues.push(`Insufficient storage: ${caps.storageFreeGB.toFixed(1)}GB free, need ${(modelSizeGB + 0.5).toFixed(1)}GB`);
            recommendations.push('Free up browser storage to download the model.');
        }

        const isFirefox = caps.browser === 'Firefox';

        if (isFirefox) {
            warnings.push(`Firefox may cause high CPU usage with local AI models.`);
            recommendations.push('Consider using Chrome/Edge for better WASM performance.');
        }

        // RAM check (if available)
        if (caps.deviceMemoryGB !== null) {
            const recommendedRAM = modelSizeGB * 3; // Rule of thumb: 3x model size
            if (caps.deviceMemoryGB < recommendedRAM) {
                warnings.push(`Low RAM: ${caps.deviceMemoryGB}GB available, ${recommendedRAM.toFixed(0)}GB recommended for this model`);
            }
        }

        // CPU check
        if (caps.hardwareConcurrency < 4) {
            warnings.push(`Low CPU cores: ${caps.hardwareConcurrency} cores, 4+ recommended for optimal performance`);
            recommendations.push('Model may initialize or generate slowly on your device');
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
     */
    static async getRecommendedWASMThreads(): Promise<number> {
        const caps = await this.detect();

        const isFirefox = caps.browser === 'Firefox';

        // Firefox = use fewer threads to prevent crash
        if (isFirefox) {
            return Math.min(2, Math.floor(caps.hardwareConcurrency / 2)); // Max 2 threads
        }

        // Chrome/Edge can handle more threads
        return Math.min(4, Math.floor(caps.hardwareConcurrency * 0.75)); // Use 75% of cores, max 4
    }
}