import './UneeqContainer.scss';
import React, { useEffect } from 'react';
import { Loading } from '@/components';

interface UneeqContainerProps {
  id: string;
  onInit: () => void;
}

const UneeqContainer: React.FC<UneeqContainerProps> = ({ id, onInit }) => {
    useEffect(() => {
        onInit();
    }, []);
    
  return (
    <div className="uneeq-container">
        <Loading text="Loading..." subText="Please wait while we prepare your experience." />
        <div id={id} />
    </div>
  );
};

export default UneeqContainer;  