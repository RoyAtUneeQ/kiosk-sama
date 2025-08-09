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

function RemotePage() {
  const { config } = useConfig();
  const { kioskConnectionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { state } = useSession();
  const { sendAction } = useWebSocket({ webSocketUrl: config.websocket.url });

  if (!kioskConnectionId) {
    return <div>No kiosk connection ID</div>;
  }

  // Connect to kiosk session
  useEffect(() => {
    if (state.webSocketState === WebsocketStatus.CONNECTED && kioskConnectionId && state.connectionId) {
      console.log(`connecting from ${state.connectionId} to ${kioskConnectionId}`);
      sendAction(createAction.peerConnect(kioskConnectionId, useUserInspect(state.connectionId)));
    }
  }, [state.webSocketState, kioskConnectionId, state.connectionId]);

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
    if (sender === 'user') 
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
      <RemoteHeader 
        title="Remote Control" 
        webSocketState={state.webSocketState}
        kioskConnectionId={kioskConnectionId}
        connectionId={state.connectionId}
      />

      <MessageList messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef} />

      {state.webSocketState === WebsocketStatus.CONNECTED && showSuggestions && (
        <Suggestions 
          items={suggestions} 
          onSelect={(text) => {
            // Only send; let the component fade and remove the clicked card.
            sendText(text);
          }} 
          disabled={isTyping}
          onClose={() => setShowSuggestions(false)}
        />
      )}

      <ChatInput
        inputRef={inputRef}
        value={inputText}
        onChange={setInputText}
        onEnter={handleEnter}
        disabled={state.webSocketState !== WebsocketStatus.CONNECTED || isTyping}
      />
    </div>
  );
}

export default RemotePage;
