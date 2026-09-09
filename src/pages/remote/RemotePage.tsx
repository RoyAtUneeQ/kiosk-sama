import './RemotePage.scss';
import { useParams } from 'react-router-dom';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { MicrophoneStatus } from '@/types/microphone';
import { useConfig } from '@/hooks';
import { useSession } from '@/contexts';
import { useRemoteOrchestrator } from './hooks/useRemoteOrchestrator';

import { RemoteHeader, MessageList, Suggestions, ChatInput } from './components';
import { MessageCards } from '@/components/features/booking';
import { GlowBackground } from '@/components';
import { useCallback } from 'react';
import { MessageFactory } from '@/factories';

function RemotePage() {

  const { config } = useConfig();
  const { kioskConnectionId } = useParams<{ kioskConnectionId: string }>();
  const { state, actions } = useSession();

  const { isLargeScreen, handleFlightSelection, handleFareSelection, handleGuidedExperienceConfirm } = useRemoteOrchestrator({ 
    config, 
    kioskConnectionId: kioskConnectionId ?? null 
  });

  const onSendText = useCallback((text: string) => {
    actions.addMessageToHistory(MessageFactory.createUserMessage(text));
  }, []);

  if (!kioskConnectionId) {
    return (
      <div className="chat-container">
        <div className="chat-content">
          <div style={{ padding: '1rem' }}>No kiosk connection ID</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
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
          messages={state.history}
        />

        <MessageList
          messages={state.history}
          messageCards={state.messageCards}
          awaitingPromptResponse={state.awaitingPromptResponse}
          renderCardsForMessage={(_message, cardData) => (
            <MessageCards
              cardData={cardData ?? null}
              onFlightIdClick={handleFlightSelection}
              onBoundIdClick={handleFareSelection}
              onGuidedExperienceConfirm={handleGuidedExperienceConfirm}
            />
          )}
        />

        {state.webSocketState === WebsocketStatus.CONNECTED && state.showSuggestions && (
          <Suggestions
            disabled={state.microphoneStatus === MicrophoneStatus.LISTENING}
            onClose={() => actions.setShowSuggestions(false)}
            autoHideOnSelect={true}
          />
        )}

        <ChatInput disabled={state.webSocketState !== WebsocketStatus.CONNECTED} onSendText={onSendText} />
      </div>
    </div>
  );
}

export default RemotePage;
