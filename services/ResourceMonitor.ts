/**
 * Resource Monitor
 * Monitors browser memory usage and suggests optimizations
 * Inspired by whisplay-ai-chatbot's battery monitoring to prevent crashes
 */

export type MemoryPressure = 'low' | 'medium' | 'high' | 'critical';

export interface ResourceStats {
  usedMemoryMB: number;
  totalMemoryMB: number;
  limitMemoryMB: number;
  usagePercent: number;
  pressure: MemoryPressure;
}

export class ResourceMonitor {
  private monitoringInterval: number | null = null;
  private onPressureChange?: (pressure: MemoryPressure) => void;
  private lastPressure: MemoryPressure = 'low';

  constructor(onPressureChange?: (pressure: MemoryPressure) => void) {
    this.onPressureChange = onPressureChange;
  }

  /**
   * Check current memory pressure level
   * @returns Memory pressure level
   */
  checkMemoryPressure(): MemoryPressure {
    const stats = this.getMemoryStats();

    if (!stats) {
      return 'low'; // Firefox/Safari - assume safe
    }

    const { usagePercent } = stats;

    if (usagePercent > 95) return 'critical';
    if (usagePercent > 85) return 'high';
    if (usagePercent > 70) return 'medium';
    return 'low';
  }

  /**
   * Get detailed memory statistics (Chrome/Edge only)
   */
  getMemoryStats(): ResourceStats | null {
    // @ts-ignore - performance.memory is Chrome-specific
    const memory = (performance as any).memory;

    if (!memory) {
      console.warn('[ResourceMonitor] performance.memory not available (Firefox/Safari)');
      return null;
    }

    const usedHeap = memory.usedJSHeapSize;
    const totalHeap = memory.totalJSHeapSize;
    const heapLimit = memory.jsHeapSizeLimit;

    const usagePercent = (usedHeap / heapLimit) * 100;

    return {
      usedMemoryMB: Math.round(usedHeap / 1024 / 1024),
      totalMemoryMB: Math.round(totalHeap / 1024 / 1024),
      limitMemoryMB: Math.round(heapLimit / 1024 / 1024),
      usagePercent: Math.round(usagePercent),
      pressure: this.checkMemoryPressure()
    };
  }

  /**
   * Get user-friendly suggestion based on memory pressure
   */
  getSuggestion(): string {
    const pressure = this.checkMemoryPressure();

    switch (pressure) {
      case 'critical':
        return '🔴 Memory critical! Please save your progress and restart the browser.';

      case 'high':
        return '🟠 Memory usage high. Consider:\n• Switching to Cloud Mode\n• Using a smaller cartridge (Qwen 0.5B)\n• Restarting the game';

      case 'medium':
        return '🟡 Memory usage elevated. Consider clearing old conversation history.';

      case 'low':
      default:
        return '';
    }
  }

  /**
   * Start monitoring memory during gameplay
   * Checks every 30 seconds and triggers callback on pressure changes
   */
  startMonitoring(intervalMs: number = 30000) {
    if (this.monitoringInterval !== null) {
      console.warn('[ResourceMonitor] Already monitoring');
      return;
    }

    console.log('[ResourceMonitor] Starting memory monitoring');

    this.monitoringInterval = window.setInterval(() => {
      const pressure = this.checkMemoryPressure();
      const stats = this.getMemoryStats();

      if (stats) {
        console.log(
          `[ResourceMonitor] Memory: ${stats.usedMemoryMB}MB / ${stats.limitMemoryMB}MB (${stats.usagePercent}%) - ${pressure.toUpperCase()}`
        );
      }

      // Trigger callback if pressure level changed
      if (pressure !== this.lastPressure && this.onPressureChange) {
        this.onPressureChange(pressure);
        this.lastPressure = pressure;
      }

      // Auto-warn on high pressure
      if (pressure === 'high' || pressure === 'critical') {
        console.warn(`[ResourceMonitor] ⚠️ ${this.getSuggestion()}`);
      }
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval !== null) {
      window.clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[ResourceMonitor] Stopped memory monitoring');
    }
  }

  /**
   * Check if browser supports memory monitoring
   */
  static isSupported(): boolean {
    // @ts-ignore
    return !!(performance as any).memory;
  }

  /**
   * Get browser/device info
   */
  static getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency, // CPU cores
      deviceMemory: (navigator as any).deviceMemory, // GB of RAM (Chrome only)
      supportsMemoryAPI: ResourceMonitor.isSupported()
    };
  }
}
