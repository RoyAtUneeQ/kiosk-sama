import React, { useEffect, useState, useMemo } from 'react';
import './Loading.scss';
import { useTranslation } from '@/hooks/useTranslation';
import { Particles } from '@/components';
import type { ParticlesOptions } from '@/types';

interface LoadingProps {
  text?: string;
  subText?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  text,
  size = 'medium',
  className = '',
  fullScreen = false
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [nextPhraseIndex, setNextPhraseIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const animatedPhrases = t('loading.phrases', { returnObjects: true }) as string[];


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentPhraseIndex(nextPhraseIndex);
        setNextPhraseIndex((nextPhraseIndex + 1) % animatedPhrases.length);
        setIsTransitioning(false);
      }, 300);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [nextPhraseIndex, animatedPhrases.length]);

  const sizeClass = `loading-${size}`;
  const visibilityClass = isVisible ? 'loading-visible' : '';
  const fullScreenClass = fullScreen ? 'loading-fullscreen' : '';

  // Use provided text or fallback to translation
  const displayText = text || t('loading.default');

  // Memoize particle options so Particles renders only once
  const particleOptions = useMemo<ParticlesOptions>(() => ({
    preset: 'floating',
    background: 'transparent',
    color: '#cd3761',
    count: 50,
    size: { min: 2, max: 4 },
    speed: 2,
    interactive: false,
    zIndex: 1,
  }), []);

  return (
    <div className={`loading-container ${className} ${sizeClass} ${visibilityClass} ${fullScreenClass}`}>
      <div className="loading-elements-container">
        <div className="loading-ring">
          <div className="loading-core"></div>
        </div>
        <div className="loading-text-container">
          <div className="loading-text">{displayText}</div>
          <div className="loading-phrases-wrapper">
            <div 
              className={`loading-subtext loading-phrase ${
                isTransitioning ? 'exiting' : 'active'
              }`}
            >
              {animatedPhrases[currentPhraseIndex]}
            </div>
            {isTransitioning && (
              <div className="loading-subtext loading-phrase entering">
                {animatedPhrases[nextPhraseIndex]}
              </div>
            )}
          </div>
        </div>
      </div>
       
      <Particles options={particleOptions} />
    </div>
  );
};
export default Loading;

