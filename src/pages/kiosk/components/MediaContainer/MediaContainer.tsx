import React, { useState, useEffect } from "react";
import "./MediaContainer.scss";
import type { Media } from "@/types"; 

const MediaContainer: React.FC<Media> = ({ 
  type, 
  url,   
  autoPlay = true, 
  controls = true, 
  loop = false, 
  muted = true 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  const handleMediaLoad = () => {
    setLoaded(true);
  };

  useEffect(() => {
    // Immediately show loader and reset loaded state when URL changes
    setLoaded(false);
    
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
    >
      {/* Always render the loader, but only show it when not loaded */}
      <div className="loader" style={{ opacity: loaded ? 0 : 1, visibility: loaded ? 'hidden' : 'visible' }}></div>
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
            src={url}
            autoPlay={autoPlay}
            controls={controls}
            loop={loop}
            muted={muted}
            onLoadedData={handleMediaLoad}
            onError={(e) => console.error('Video load error:', e)}
            style={{ opacity: loaded ? 1 : 0 }}
          />
        )}
      </div>
    </div>
  );
};

export default MediaContainer; 