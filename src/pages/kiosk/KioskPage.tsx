import { UneeqContainer, RemoteConnectionInfo, KioskStartForm, LeftSideBar, MediaContainer } from './components';
import { SessionStatus } from '@/contexts/types';
import { QRCode, TopProgressBar } from '@/components';  
import { useSession } from '@/contexts/SessionContext';
import { defaultUneeqOptions } from '@/types';
import { useUneeqEvents, useWebSocket, usePageLoadMonitor } from '@/hooks';
import { useUneeq } from '@/hooks/useUneeq';
import type { UneeqOptions } from '@/types/uneeq';
import { useConfig } from '@/hooks/useConfig';
import { useEffect } from 'react';
import { createActionFactory } from '@/factories';
import { DebugPanel } from '@/components/debugPanel/DebugPanel';

function KioskPage() {
  // Track page load performance to measure lazy loading impact
  usePageLoadMonitor('KioskPage');
  
  const { state, actions } = useSession();
  const actionFactory = createActionFactory();
  
  useUneeq({
    ...defaultUneeqOptions,
    showClosedCaptions: state.showClosedCaptions,
    welcomePrompt: `Introduce yourself to the user in a friendly and engaging manner. Use your knowledge base to spark a conversation and guide the interaction.
    Follow up with a specific, focused question that directs the next step in the conversation, avoiding open-ended questions.`,
    showUserInputInterface: false
  } as UneeqOptions, state.language, state.renderMode as 'cloud' | 'miniprem');
  useUneeqEvents();
  

  const { config } = useConfig();

  // Set config to session state
  useEffect(() => {
    actions.setConfig(config);
  }, [config]);
  
  const { websocket } = useWebSocket({
    webSocketUrl: config?.backend?.endpoints?.ws!
  });

  // Check remote connection every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.remoteInfo?.connectionId) {
        websocket?.send(actionFactory.checkPeerConnection(state.remoteInfo.connectionId));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.remoteInfo?.connectionId, websocket])
  
  // No token state logging; tokens are fetched on-demand over HTTP

  if (state.status === SessionStatus.IDLE || state.status === SessionStatus.READY)
      return (
        <>
          <KioskStartForm />
          {/* Development DebugPanel - shows based on config.app.environment */}
          <DebugPanel show={config?.app?.environment === 'development' } />
        </>
      );

  return (
    <div>
      {/* Top progress bar for awaiting response */}
      <TopProgressBar 
        isVisible={state.awaitingPromptResponse}
        height={0.5}
        animationSpeed={6}
      />
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
          {state.media && <MediaContainer {...state.media} />}
        </>
      )}
    </div>
  );
}

export default KioskPage;
