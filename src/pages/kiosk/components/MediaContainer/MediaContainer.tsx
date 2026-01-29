import React, { useState, useEffect } from "react";
import "./MediaContainer.scss";
import type { Media } from "@/types";
import { useViewport } from "@/hooks"; 

const MediaContainer: React.FC<Media> = ({ 
  type, 
  url,   
  autoPlay = true, 
  controls = true, 
  loop = false, 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isChanging, setIsChanging] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const { isMobile, isTablet } = useViewport();

  const handleMediaLoad = () => {
    setLoaded(true);
  };

  const handleVideoRef = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      // Set volume based on device type
      videoElement.volume = (isMobile || isTablet) ? 0.0 : 0.2;
      
      // For mobile devices, try to play muted first to enable autoplay
      if ((isMobile || isTablet) && autoPlay) {
        videoElement.muted = true;
        videoElement.play().catch((_error) => {
          setPlaybackError(true);
        });
      }
    }
  };

  const handleUserInteraction = () => {
    setUserInteracted(true);
    setPlaybackError(false);
  };

  const handleVideoPlay = () => {
    setPlaybackError(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    setPlaybackError(true);
  };

  useEffect(() => {
    // Immediately show loader and reset loaded state when URL changes
    setLoaded(false);
    setPlaybackError(false);
    setUserInteracted(false);
    
    if (url) {
      // For transitions between media items
      if (isVisible && !isChanging) {
        setIsChanging(true);
        setIsVisible(false);
        
        // After fade out completes, start loading new media
        setTimeout(() => {
          setIsVisible(true);
          setIsChanging(false);
        }, 500); // Match this to the fadeOut animation duration
      } else if (!isChanging) {
        // Initial load
        setIsVisible(true);
      }
    }
  }, [url]);

  return (
    <div 
      className={`media-container ${type} ${!isVisible ? 'fade-out' : ''}`} 
      style={{ display: isChanging && !isVisible ? 'none' : 'flex' }}
      onClick={handleUserInteraction}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleUserInteraction();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Media container - click to interact"
    >
      {/* Always render the loader, but only show it when not loaded */}
      <div className="loader" style={{ opacity: loaded ? 0 : 1, visibility: loaded ? 'hidden' : 'visible' }}></div>
      
      {/* Show playback error message for mobile */}
      {playbackError && (isMobile || isTablet) && type === 'video' && (
        <div className="playback-error">
          <p>Tap to play video</p>
        </div>
      )}
      
      <div className="media-inner">
        {type === 'image' ? (
          <img 
            key={url} // Add key to force remount when URL changes
            src={url} 
            onLoad={handleMediaLoad}
            alt="Display content"
            style={{ opacity: loaded ? 1 : 0 }}
          />
        ) : (
          <video 
            key={url} // Add key to force remount when URL changes
            ref={handleVideoRef}
            src={url}
            autoPlay={autoPlay}
            controls={controls}
            loop={loop}
            muted={(isMobile || isTablet) && !userInteracted} // Muted on mobile until user interaction
            playsInline // Essential for iOS
            preload="metadata" // Better mobile performance
            onLoadedData={handleMediaLoad}
            onPlay={handleVideoPlay}
            onError={handleVideoError}
            onClick={handleUserInteraction}
            style={{ opacity: loaded ? 1 : 0 }}
            aria-label="Video content"
          >
            {/* Add track for accessibility */}
            <track kind="captions" src="" label="No captions available" />
          </video>
        )}
      </div>
    </div>
  );
};

export default MediaContainer; 