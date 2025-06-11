import './UneeqContainer.scss';
import React, { useEffect } from 'react';
import { Loading } from '@/components';

interface UneeqContainerProps {
  id: string;
  loaded: boolean;
  onInit: () => void;
}

const UneeqContainer: React.FC<UneeqContainerProps> = ({ id, loaded = false, onInit }) => {
    useEffect(() => {
        onInit();
    }, []);
    
  return (
    <div className="uneeq-container">
        <div className="uneeq-container-content">
            {!loaded && <Loading />}
            <div id={id} />
        </div>
        <div className="uneeq-container-protection"></div>
    </div>
  );
};

export default UneeqContainer;  