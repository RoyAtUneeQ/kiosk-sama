import './Panel.scss';
import React, { useRef, useEffect } from 'react';

interface PanelProps {
  mediaUrl: string;
  mediaAltText?: string;
  formSlot: React.ReactNode;
  panelClassName?: string;
  leftSideClassName?: string;
  rightSideClassName?: string;
  isVideo?: boolean;
  loopStartTime?: number;
}

const Panel: React.FC<PanelProps> = ({
  mediaUrl,
  mediaAltText = 'Panel media',
  formSlot,
  panelClassName = '',
  leftSideClassName = '',
  rightSideClassName = '',
  isVideo = false,
  loopStartTime = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (isVideo && videoElement && loopStartTime > 0) {
      const handleEnded = () => {
        videoElement.currentTime = loopStartTime;
        videoElement.play();
      };
      
      videoElement.addEventListener('ended', handleEnded);
      
      return () => {
        videoElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [isVideo, loopStartTime]);

  return (
    <div className={`pageContainer ${panelClassName}`}>
      <div className="panel">
        <div className={`leftHalf ${leftSideClassName} panel-media-container`}>
          {isVideo ? (
            <video 
              ref={videoRef}
              src={mediaUrl} 
              className="video" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              autoPlay
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt={mediaAltText} 
              className="image" 
              style={{ objectFit: 'cover' }} 
            />
          )}
        </div>
        <div className={`rightHalf ${rightSideClassName}`}>
          {formSlot}
        </div>
      </div>
    </div>
  );
};

export default Panel; 