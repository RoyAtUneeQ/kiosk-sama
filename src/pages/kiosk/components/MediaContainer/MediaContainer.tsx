import React, { useState, useEffect } from "react";
import "./MediaContainer.scss";

interface MediaContainerProps {
  type: 'image' | 'video';
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
}

const MediaContainer: React.FC<MediaContainerProps> = ({ 
  type, 
  src, 
  autoPlay = true, 
  controls = true, 
  loop = false, 
  muted = true 
}) => {
  const [loaded, setLoaded] = useState(false);

  const handleMediaLoad = () => {
    setLoaded(true);
  };

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className={`media-container ${type}`} style={{ opacity: loaded ? 1 : 0 }}>
      {type === 'image' ? (
        <img 
          src={src} 
          onLoad={handleMediaLoad}
          alt="Display content"
        />
      ) : (
        <video 
          src={src}
          autoPlay={autoPlay}
          controls={controls}
          loop={loop}
          muted={muted}
          onLoadedData={handleMediaLoad}
          onError={(e) => console.error('Video load error:', e)}
        />
      )}
    </div>
  );
};

export default MediaContainer; 