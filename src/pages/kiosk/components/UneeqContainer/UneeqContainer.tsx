import './UneeqContainer.scss';
import React from 'react';
import { Loading } from '@/components';
import { SessionStatus } from '@/contexts/types';
import { useSession } from '@/contexts/SessionContext';

interface UneeqContainerProps {
  uneeqContainerId: string;
}

const UneeqContainer: React.FC<UneeqContainerProps> = ({ uneeqContainerId }) => {
    const { state } = useSession();

  return (
    <div className="uneeq-container">
        <div className="uneeq-container-content">
            {state.status === SessionStatus.LOADING && <Loading />}
            <div id={uneeqContainerId} />
        </div>
        <div className="uneeq-container-protection"></div>
    </div>
  );
};

export default UneeqContainer;  