import './Panel.scss';
import React from 'react';


interface PanelProps {
  imageUrl: string;
  imageAltText?: string;
  formSlot: React.ReactNode;
  panelClassName?: string;
  leftSideClassName?: string;
  rightSideClassName?: string;
}

const Panel: React.FC<PanelProps> = ({
  imageUrl,
  imageAltText = 'Panel image',
  formSlot,
  panelClassName = '',
  leftSideClassName = '',
  rightSideClassName = '',
}) => {
  return (
    <div className={`pageContainer ${panelClassName}`}>
      <div className="panel">
        <div className={`leftHalf ${leftSideClassName} panel-image-container`}>
          <img src={imageUrl} alt={imageAltText} className="image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className={`rightHalf ${rightSideClassName}`}>
          {formSlot}
        </div>
      </div>
    </div>
  );
};

export default Panel; 