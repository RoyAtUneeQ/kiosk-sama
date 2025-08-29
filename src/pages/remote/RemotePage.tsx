import './RemotePage.scss';
import { useEffect } from 'react';
import { useWebSocket, useUserInspect, usePageLoadMonitor, useViewport } from '@/hooks';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { useParams } from 'react-router-dom';
import { MessageSender } from '@/types';
import { useConfig } from '@/hooks/useConfig';
import { useSession } from '@/contexts';
import { createActionFactory } from '@/factories';

import { RemoteHeader, MessageList, Suggestions, ChatInput } from './components';
import { GlowBackground } from '@/components';

import { MicrophoneStatus } from '@/types/microphone';

function RemotePage() {
  // Track page load performance to measure lazy loading impact
  usePageLoadMonitor('RemotePage');
  const { config } = useConfig();
  const { kioskConnectionId } = useParams<{ kioskConnectionId: string }>();
  const { state, actions } = useSession();

  // Load config to session state
  useEffect(() => {
    if (config) {
      actions.setConfig(config);
    }
  }, [config, actions]);

  const { websocket } = useWebSocket({ webSocketUrl: config?.backend?.endpoints?.ws! });
  
  // Viewport management for responsive behavior
  const { isLargeScreen } = useViewport();
  
  // Initialize user inspect
  const userInspect = useUserInspect(state.connectionId ?? '');

  // Check if kiosk connection ID is valid
  const hasKioskId = Boolean(kioskConnectionId);

  // Connect to kiosk session
  useEffect(() => {
    if (state.webSocketState === WebsocketStatus.CONNECTED && kioskConnectionId && state.connectionId) {
      console.log(`connecting from ${state.connectionId} to ${kioskConnectionId}`);
      websocket?.send(createActionFactory().peerConnect(kioskConnectionId, userInspect));
    }
  }, [state.webSocketState, kioskConnectionId, state.connectionId, websocket, userInspect]);


  // Handle message state changes
  useEffect(() => {
    const lastMessage = state.history[state.history.length - 1];
    if (!lastMessage) return;
    
    // Send user messages to kiosk
    if (lastMessage.sender === MessageSender.User && kioskConnectionId) {
      console.log('Sending user message to kiosk:', lastMessage);
      websocket?.send(createActionFactory().sendMessage(kioskConnectionId, lastMessage));
    }
  }, [state.history, kioskConnectionId, websocket, actions]);

  return (
    <div className="chat-container">
      {!hasKioskId ? (
        <div className="chat-content">
          <div style={{ padding: '1rem' }}>No kiosk connection ID</div>
        </div>
      ) : (
        <>
          <GlowBackground 
            className="glow-background"
            ariaHidden={false}
            isLargeScreen={isLargeScreen}
            reactiveActive={state.microphoneStatus === MicrophoneStatus.LISTENING}
            dimOpacity={0.65}
          />

          <div className="chat-content">
            <RemoteHeader 
              title="Thoughts Bridge" 
              webSocketState={state.webSocketState}
              kioskConnectionId={kioskConnectionId}
              connectionId={state.connectionId}
            />

            <MessageList messages={state.history} />
            {state.webSocketState === WebsocketStatus.CONNECTED && state.showSuggestions && (
              <Suggestions disabled={state.microphoneStatus === MicrophoneStatus.LISTENING} 
                onClose={() => actions.setShowSuggestions(false)}
                autoHideOnSelect={true}
              />
            )}

            <ChatInput disabled={state.webSocketState !== WebsocketStatus.CONNECTED}/>
          </div>
        </>
      )}
    </div>
  );
}

export default RemotePage;
