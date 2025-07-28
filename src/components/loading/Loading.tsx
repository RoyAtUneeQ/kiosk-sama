import React, { useEffect, useState, useMemo } from 'react';
import './Loading.scss';
import { useTranslation } from '@/hooks/useTranslation';

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

  const NUM_PARTICLES = useMemo(() => {
    if (window.innerWidth >= 1920 && window.innerHeight > window.innerWidth) return 325; // holobox portrait
    if (window.innerWidth >= 1024) return 80; // desktop
    if (window.innerWidth >= 768) return 50;   // tablet
    return 20; // smartphone
  }, [window.innerWidth, window.innerHeight]);

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

  const particles = useMemo(() => (
    Array.from({ length: NUM_PARTICLES }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 1,
    }))
  ), [NUM_PARTICLES]);

  // Use provided text or fallback to translation
  const displayText = text || t('loading.default');

  return (
    <div className={`loading-container ${className} ${sizeClass} ${visibilityClass} ${fullScreenClass}`}>
      <div className="loading-particles">
        {particles.map((p, i) => (
          <div
            className="particle"
            key={i}
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>
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
    </div>
  );
};
export default Loading;

