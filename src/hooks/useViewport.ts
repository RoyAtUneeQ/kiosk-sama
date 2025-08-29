import { useState, useEffect } from 'react';

export interface UseViewportResult {
  viewportWidth: number;
  viewportHeight: number;
  isLargeScreen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Hook to track viewport dimensions and breakpoints.
 * Automatically updates CSS custom properties for viewport height.
 * Provides common breakpoint helpers for responsive behavior.
 */
export function useViewport(): UseViewportResult {
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewportWidth(width);
      setViewportHeight(height);
      
      // Set CSS custom property for viewport height (fallback for browsers without dvh support)
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
    };
    
    // Initial call
    handleResize();
    
    // Add event listeners with passive option for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Breakpoint helpers matching the existing SCSS breakpoints
  const isMobile = viewportWidth <= 600;
  const isTablet = viewportWidth > 600 && viewportWidth <= 1024;
  const isDesktop = viewportWidth > 1024;
  const isLargeScreen = viewportWidth >= 1280; // Matches RemotePage's existing logic

  return {
    viewportWidth,
    viewportHeight,
    isLargeScreen,
    isMobile,
    isTablet,
    isDesktop
  };
}
