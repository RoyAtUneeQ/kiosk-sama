import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAnimatedTextOptions {
  speed?: number; // milliseconds per character
  delay?: number; // initial delay before animation starts
  enabled?: boolean; // whether animation is enabled
}

interface UseAnimatedTextReturn {
  displayedText: string;
  isAnimating: boolean;
  currentCharIndex: number;
  startAnimation: () => void;
  resetAnimation: () => void;
}

export const useAnimatedText = (
  text: string,
  options: UseAnimatedTextOptions = {}
): UseAnimatedTextReturn => {
  const {
    speed = 30,
    delay = 0,
    enabled = true
  } = options;

  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndex = useRef(0);

  const startAnimation = useCallback(() => {
    if (!enabled) {
      setDisplayedText(text);
      return;
    }
    
    setShouldAnimate(true);
    setIsAnimating(true);
    currentIndex.current = 0;
    setDisplayedText('');
  }, [enabled, text]);

  const resetAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShouldAnimate(false);
    setIsAnimating(false);
    currentIndex.current = 0;
    setDisplayedText('');
  }, []);

  useEffect(() => {
    if (!shouldAnimate || !enabled || currentIndex.current >= text.length) {
      if (currentIndex.current >= text.length) {
        setIsAnimating(false);
      }
      return;
    }

    const animateNextChar = () => {
      if (currentIndex.current < text.length) {
        setDisplayedText(text.slice(0, currentIndex.current + 1));
        currentIndex.current++;
        
        timeoutRef.current = setTimeout(animateNextChar, speed);
      } else {
        setIsAnimating(false);
      }
    };

    timeoutRef.current = setTimeout(animateNextChar, currentIndex.current === 0 ? delay : speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, delay, enabled, shouldAnimate]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // If animation is disabled or text is empty, return the full text immediately
  if (!enabled || !text) {
    return {
      displayedText: text,
      isAnimating: false,
      currentCharIndex: -1,
      startAnimation,
      resetAnimation
    };
  }

  return {
    displayedText,
    isAnimating,
    currentCharIndex: currentIndex.current,
    startAnimation,
    resetAnimation
  };
};
