import './RemotePage.scss';
import { useEffect, useState, useRef } from 'react';
import { useWebSocket, useUserInspect } from '@/hooks';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { useParams } from 'react-router-dom';
import { type Message } from '@/types';
import { useConfig } from '@/hooks/useConfig';
import { useSession } from '@/contexts';
import { createAction } from '@/utils';
import { FiFeather, FiImage, FiHelpCircle, FiPower } from 'react-icons/fi';
import { RemoteHeader, MessageList, Suggestions, ChatInput } from './components';
import { GlowBackground } from '@/components';

function RemotePage() {
  const { config } = useConfig();
  const { kioskConnectionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { state } = useSession();
  const { sendAction } = useWebSocket({ webSocketUrl: config.websocket.url });
  const userInspect = useUserInspect(state.connectionId ?? '');
  const hasKioskId = Boolean(kioskConnectionId);

  // Connect to kiosk session
  useEffect(() => {
    if (state.webSocketState === WebsocketStatus.CONNECTED && kioskConnectionId && state.connectionId) {
      console.log(`connecting from ${state.connectionId} to ${kioskConnectionId}`);
      sendAction(createAction.peerConnect(kioskConnectionId, userInspect));
    }
  }, [state.webSocketState, kioskConnectionId, state.connectionId, sendAction, userInspect]);

  // Auto-scroll to most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input field on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    if (sender === 'user' && kioskConnectionId)
      sendAction(createAction.sendMessage(kioskConnectionId, newMessage));
    setMessages(prev => [...prev, newMessage]);
  };

  const sendText = (text: string) => {
    if (!text || isTyping) return;
    const messageContent = text.trim();
    if (!messageContent) return;
    setInputText('');
    addMessage(messageContent, 'user');
    setIsTyping(true);
  };

  const handleSendMessage = () => {
    sendText(inputText);
  };

  const toggleMic = () => {
    setMicActive(prev => !prev);
    if (!micActive) {
      // entering mic mode: hide suggestions and messages view
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (state.peerMessage) {
      addMessage(state.peerMessage.data, 'assistant');
      setIsTyping(false);
    }
  }, [state.peerMessage]);

  const handleEnter = () => handleSendMessage();

  const suggestions: Array<{ label: string; text: string; Icon: React.ComponentType<{ size?: number }> }>
    = [
      { label: 'Unique and Fun Birthday Surprise Ideas', text: 'Unique and Fun Birthday Surprise Ideas', Icon: FiFeather },
      { label: 'Create an image', text: 'Please create an image of a sunny beach at golden hour', Icon: FiImage },
      { label: 'How can you help me?', text: 'How can you help me?', Icon: FiHelpCircle },
      { label: 'End session', text: 'End session', Icon: FiPower },
    ];

  return (
    <div className="chat-container">
      {!hasKioskId ? (
        <div className="chat-content">
          <div style={{ padding: '1rem' }}>No kiosk connection ID</div>
        </div>
      ) : (
        <>
          <GlowBackground balls={
            [
              { delay: '0s', size: 0.55, speed: '26s' }, 
              { delay: '-4s', size: 0.75, speed: '32s' }, 
              { delay: '-8s', size: 0.45, speed: '24s' },
              { delay: '-12s', size: 0.65, speed: '30s' },
              { delay: '-16s', size: 0.35, speed: '18s' },
              { delay: '-20s', size: 0.85, speed: '36s' },
            ]} 
            className="glow-background"
            ariaHidden={false}
            reactiveActive={micActive}
            reactiveIntensity={0.7}
          />

          <div className="chat-content">
            <RemoteHeader 
              title="Remote Control" 
              webSocketState={state.webSocketState}
              kioskConnectionId={kioskConnectionId}
              connectionId={state.connectionId}
            />

              {!micActive ? (
                <>
                  <MessageList messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef} />
                  {state.webSocketState === WebsocketStatus.CONNECTED && showSuggestions && (
                    <Suggestions 
                      items={suggestions} 
                      onSelect={(text) => {
                        sendText(text);
                      }} 
                      disabled={isTyping}
                      onClose={() => setShowSuggestions(false)}
                    />
                  )}
                </>
              ) : (
                <div style={{ flex: 1 }} />
              )}

            {micActive && (
              <div className="listening-overlay" aria-live="polite" aria-atomic="true">
                <div className="listening-bubble" role="status">
                  <span className="dot" aria-hidden="true" />
                  <span className="text">Listening…</span>
                </div>
              </div>
            )}

            <ChatInput
              inputRef={inputRef}
              value={inputText}
              onChange={setInputText}
              onEnter={handleEnter}
              disabled={state.webSocketState !== WebsocketStatus.CONNECTED || isTyping}
              micActive={micActive}
              onToggleMic={toggleMic}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default RemotePage;
