import './RemotePage.scss';
import { useEffect, useState, useRef } from 'react';
import { useWebSocket, useUserInspect } from '@/hooks'; 
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { SessionMessageGenerator } from '@/utils';
import { useParams } from 'react-router-dom';
import { Loading } from '@/components';
import { type Message } from '@/types';
import { useConfig } from '@/hooks/useConfig';
import { useSession } from '@/contexts/SessionContext';

function RemotePage() {
  // Config is now guaranteed to be available
  const { config } = useConfig();
  const { kioskConnectionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { state } = useSession();

  const { sendMessage } = useWebSocket({
    webSocketUrl: config.websocket.url
  });

  useEffect(() => {
    console.log('useEffect', state.webSocketState, kioskConnectionId, state.connectionId);
    if (state.webSocketState === WebsocketStatus.CONNECTED && kioskConnectionId && state.connectionId) {
      console.log('joinSession', kioskConnectionId, " with connectionId ", state.connectionId);
      sendMessage(SessionMessageGenerator.joinSession(kioskConnectionId, useUserInspect(state.connectionId)));
    }
  }, [state.webSocketState, kioskConnectionId, state.connectionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() && !isTyping) {
      const messageContent = inputText.trim();
      setInputText('');
      
      // Add user message
      addMessage(messageContent, 'user');
      
      // Show typing indicator
      setIsTyping(true);
      
      // Send message via WebSocket
      sendMessage({
        type: "ChatMessage",
        content: messageContent,
        timestamp: new Date().toISOString()
      });
      
             // For demo purposes, simulate AI response
       setTimeout(() => {
         addMessage("I received your message: " + messageContent, 'assistant');
         setIsTyping(false);
       }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  return (
    <div className="remote-page">
      <div className="remote-header">
        <h1>Remote Control</h1>
        <div className="connection-status">
          <span className={`status ${state.webSocketState.toLowerCase()}`}>
            {state.webSocketState}
          </span>
          {state.connectionId && <span className="connection-id">ID: {state.connectionId}</span>}
        </div>
      </div>

      <div className="messages-container">
        <div className="messages">
                   {messages.map((message) => (
           <div key={message.id} className={`message ${message.sender}`}>
             <div className="message-content">{message.text}</div>
             <div className="message-time">
               {message.timestamp.toLocaleTimeString()}
             </div>
           </div>
         ))}
          {isTyping && (
            <div className="message ai typing">
              <div className="message-content">
                <Loading />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={state.webSocketState !== WebsocketStatus.CONNECTED || isTyping}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || state.webSocketState !== WebsocketStatus.CONNECTED || isTyping}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default RemotePage;
