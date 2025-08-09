import { UneeqContainer, RemoteConnectionInfo, KioskStartForm, LeftSideBar, MediaContainer } from './components';
import { SessionStatus } from '@/types';
import { QRCode } from '@/components';  
import { useSession } from '@/contexts/SessionContext';
import { defaultUneeqOptions } from '@/types';
import { useUneeqEvents, useWebSocket } from '@/hooks';
import { useUneeq } from '@/hooks/useUneeq';
import type { UneeqOptions } from '@/types/uneeq';
import { useConfig } from '@/hooks/useConfig';
import { useEffect } from 'react';
import { createAction, createOutgoingInstruction } from '@/utils';

function KioskPage() {
  const { state, actions } = useSession();

  useUneeq({...defaultUneeqOptions} as UneeqOptions);
  useUneeqEvents();

  const { config } = useConfig();

  const { sendAction } = useWebSocket({webSocketUrl: config.websocket.url});

  useEffect(() => {
    if (state.peerMessage)
      actions.setOutgoingInstruction(createOutgoingInstruction.userInstruction(state.peerMessage.data));
  }, [state.peerMessage]);
  
  // Check remote connection every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.remoteInfo && state.remoteInfo.connectionId) {
        sendAction(createAction.CheckPeerConnection(state.remoteInfo.connectionId));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.remoteInfo?.connectionId, sendAction])

  if (state.status === SessionStatus.IDLE || state.status === SessionStatus.READY)
      return (<KioskStartForm />);

  return (
    <div>
      <UneeqContainer uneeqContainerId={defaultUneeqOptions.containedElementIdName} />
      {state.status === SessionStatus.LIVE && (
        <>
          <LeftSideBar />
          {!state.remoteInfo && (
            <QRCode 
              value={`${window.location.protocol}//${window.location.host}/remote/${state.connectionId}`} 
              size={160} 
            />
          )}
          {state.remoteInfo && <RemoteConnectionInfo info={state.remoteInfo} />}
          {state.imageUrl && <MediaContainer type="image" src={state.imageUrl} />}
          {state.videoUrl && <MediaContainer type="video" src={state.videoUrl} loop={true} />}
        </>
      )}
    </div>
  );
}

export default KioskPage;
