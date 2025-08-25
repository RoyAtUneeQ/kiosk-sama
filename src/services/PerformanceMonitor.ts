/**
 * Lightweight performance monitoring service.
 * Tracks key metrics without external dependencies or complex setup.
 * 
 * Usage:
 * ```typescript
 * // Start timing
 * PerformanceMonitor.startTiming('page-load');
 * 
 * // End timing and log
 * PerformanceMonitor.endTiming('page-load'); // Logs to console in dev
 * 
 * // Get current metrics
 * const metrics = PerformanceMonitor.getMetrics();
 * ```
 */
export class PerformanceMonitor {
  private static timings = new Map<string, number>();
  private static metrics = new Map<string, number>();
  private static isEnabled = false; // Will be set by config or environment

  /**
   * Start timing an operation
   */
  static startTiming(label: string): void {
    if (!this.isEnabled) return;
    this.timings.set(label, performance.now());
  }

  /**
   * End timing and record the metric
   */
  static endTiming(label: string): number | null {
    if (!this.isEnabled) return null;
    
    const startTime = this.timings.get(label);
    if (!startTime) {
      console.warn(`PerformanceMonitor: No start time found for "${label}"`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(label, duration);
    this.timings.delete(label);

    // Log in development
    console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  /**
   * Record a custom metric
   */
  static recordMetric(label: string, value: number): void {
    if (!this.isEnabled) return;
    this.metrics.set(label, value);
    console.log(`📊 ${label}: ${value}`);
  }

  /**
   * Get all recorded metrics
   */
  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Track web vitals if available
   */
  static trackWebVitals(): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Track Time to First Byte
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordMetric('TTFB', navigation.responseStart - navigation.fetchStart);
        this.recordMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.fetchStart);
      }
    });

    // Track Largest Contentful Paint (if supported)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported, ignore
      }
    }
  }

  /**
   * Clear all metrics and timings
   */
  static clear(): void {
    this.timings.clear();
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring (useful for production)
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Initialize performance monitoring based on environment and config
   */
  static initialize(config?: { app?: { environment?: string } }): void {
    // Check config.yaml app.environment setting first, fallback to NODE_ENV
    const configEnvironment = config?.app?.environment;
    const isDevelopment = configEnvironment === 'development' || 
                         (configEnvironment === undefined && process.env.NODE_ENV === 'development');
    
    this.setEnabled(isDevelopment);
  }
}

export default PerformanceMonitor;
