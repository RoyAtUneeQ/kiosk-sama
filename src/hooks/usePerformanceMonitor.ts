import { useEffect, useRef } from 'react';
import { PerformanceMonitor } from '@/services';

/**
 * Hook to track component mount/unmount performance
 * and page transitions.
 */
export const usePerformanceMonitor = (componentName: string, trackMount = true) => {
  const mountTimeRef = useRef<string>();

  useEffect(() => {
    if (trackMount) {
      const timingKey = `${componentName}-mount`;
      PerformanceMonitor.startTiming(timingKey);
      mountTimeRef.current = timingKey;

      // End timing on next tick (after render complete)
      const timeoutId = setTimeout(() => {
        PerformanceMonitor.endTiming(timingKey);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        if (mountTimeRef.current) {
          // Track unmount timing as well
          PerformanceMonitor.recordMetric(`${componentName}-lifetime`, performance.now() - (performance.now() - (PerformanceMonitor.getMetrics()[mountTimeRef.current] || 0)));
        }
      };
    }
  }, [componentName, trackMount]);

  // Return helper functions for custom timing
  return {
    startTiming: (label: string) => PerformanceMonitor.startTiming(`${componentName}-${label}`),
    endTiming: (label: string) => PerformanceMonitor.endTiming(`${componentName}-${label}`),
    recordMetric: (label: string, value: number) => PerformanceMonitor.recordMetric(`${componentName}-${label}`, value),
  };
};

/**
 * Hook to track page load performance
 */
export const usePageLoadMonitor = (pageName: string) => {
  const { startTiming, endTiming, recordMetric } = usePerformanceMonitor(pageName, false);

  useEffect(() => {
    startTiming('page-load');
    
    // Track when page is fully loaded
    const handleLoad = () => {
      endTiming('page-load');
      
      // Track bundle size impact (approximate)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        recordMetric('network-type', connection.effectiveType === '4g' ? 1 : 0);
      }
    };

    // If document is already loaded
    if (document.readyState === 'complete') {
      setTimeout(handleLoad, 0);
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [pageName, startTiming, endTiming, recordMetric]);
};

export default usePerformanceMonitor;
