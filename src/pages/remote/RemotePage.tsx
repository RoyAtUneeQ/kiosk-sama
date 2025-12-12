import './RemotePage.scss';
import { useEffect, useCallback } from 'react';
import { useWebSocket, useUserInspect, usePageLoadMonitor, useViewport } from '@/hooks';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { useParams } from 'react-router-dom';
import { MessageSender } from '@/types';
import { useConfig } from '@/hooks/useConfig';
import { useSession } from '@/contexts';
import { createActionFactory, MessageFactory } from '@/factories';

import { RemoteHeader, MessageList, Suggestions, ChatInput } from './components';
import { MessageCards } from './components/MessageCards';
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
      // Set awaiting response to true when sending a user message
      actions.setAwaitingPromptResponse(true);
      websocket?.send(createActionFactory().sendMessage(kioskConnectionId, lastMessage));
    }
  }, [state.history, kioskConnectionId, websocket, actions]);

  // Function to send a value via WebSocket without adding to chat history
  // Used for flight numbers, boundIds, and other card selections
  const handleCardValueClick = useCallback((value: string) => {
    if (!kioskConnectionId || !websocket) {
      console.warn('[RemotePage] Cannot send card value: missing kioskConnectionId or websocket');
      return;
    }

    // Set awaiting response to true when clicking on a card
    actions.setAwaitingPromptResponse(true);

    // Create a user message with the value (silent=true means it won't appear in chat)
    const message = MessageFactory.createUserMessage(value, true);
    
    // Send directly via WebSocket without adding to chat history
    console.log('[RemotePage] Sending card value to kiosk via WebSocket:', value);
    websocket.send(createActionFactory().sendMessage(kioskConnectionId, message));
  }, [kioskConnectionId, websocket, actions]);

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

            <MessageList 
              messages={state.history}
              messageCards={state.messageCards}
              awaitingPromptResponse={state.awaitingPromptResponse}
              renderCardsForMessage={(message, cardData) => (
                <MessageCards 
                  message={message} 
                  cardData={cardData}
                  onFlightNumberClick={handleCardValueClick}
                  onBoundIdClick={handleCardValueClick}
                />
              )}
            />
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
