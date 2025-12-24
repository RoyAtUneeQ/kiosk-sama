import { useState, useEffect } from 'react';

export interface UseViewportResult {
  viewportWidth: number;
  viewportHeight: number;
  isLargeScreen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useViewport(): UseViewportResult {
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      // Clear any pending resize handler
      clearTimeout(timeoutId);
      
      // Throttle resize events to prevent blocking the browser
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        setViewportWidth(width);
        setViewportHeight(height);
        
        // Set CSS custom property for viewport height (fallback for browsers without dvh support)
        document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
      }, 16); // ~60fps throttling
    };
    
    // Initial call
    handleResize();
    
    // Add event listeners with passive option for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
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
