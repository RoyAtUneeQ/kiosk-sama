import './RemotePage.scss';
import { useEffect, useState, useRef } from 'react';
import { WebSocketService } from '@/services/WebsocketService'; 
import { WebsocketState } from '@/types/WebsocketState';
import { SessionMessageGenerator } from '@/utils';
import { useParams } from 'react-router-dom';
import { UserInspectService } from '@/services/UserInspectService';
import { Loading } from '@/components';
import type { Message } from '@/types/Message';


function RemotePage() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const checkRemoteConnection = useRef<NodeJS.Timeout | null>(null);
  const [peerConnected, setPeerConnected] = useState<boolean>(false);

  if (!sessionId)
    return <div className="error-container">No session ID found</div>;

  const { webSocketState, sendMessage, connectionId, on } = WebSocketService({webSocketUrl: `${import.meta.env.VITE_WEBSOCKET_URL}/session/${sessionId}`});
  
  // Join session when connectionId and sessionId are available
  useEffect(() => {
    if (connectionId) {
      sendMessage(SessionMessageGenerator.joinSession(sessionId, UserInspectService(connectionId)));
      checkRemoteConnection.current = setInterval(() => {   
        sendMessage({
          type: "CheckPeerConnection",
          remoteId: sessionId
        });
      }, 1000);
    }
    setPeerConnected(true);
  }, [connectionId, sessionId, sendMessage]);
  
  const handleRemoteDisconnected = () => {
    if (checkRemoteConnection.current)
      clearInterval(checkRemoteConnection.current);
    setPeerConnected(false);
  };

  useEffect(() => {
    on("PeerDisconnected", handleRemoteDisconnected);
  }, []);
  

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when component loads
  useEffect(() => {
    if (webSocketState === WebsocketState.CONNECTED) {
      inputRef.current?.focus();
    }
  }, [webSocketState]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate sending the message via websocket
    //sendMessage(SessionMessageFactory.sendMessage(sessionId, inputText));
    
    // Clear input
    setInputText('');
    
    // Simulate typing indicator
    setIsTyping(true);
    
    // Simulate response (this would be replaced with actual websocket response handling)
    setTimeout(() => {
      setIsTyping(false);
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        text: "I've received your message and I'm processing your request.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 2000);
  };

  // Handle pressing Enter to send message
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Determine if websocket is in connecting state based on current state
  const connected = webSocketState === WebsocketState.CONNECTED && peerConnected;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Remote Assistant</h1>
        <div className="connection-status">
          {connected && <span className="status connected">Connected</span>}
          {!connected && <span className="status disconnected">Disconnected</span>}
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-bubble">
              <p>{message.text}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message assistant-message">
            <div className="message-bubble typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {!connected ? (
        <div className="loading-overlay">
          <Loading text="Lost connection!" size="medium" />
        </div>
      ) : (
        <div className="input-container">
          <input
            type="text"
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!connected}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={!inputText.trim() || !connected}
            className="send-button remote-page-send-button"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default RemotePage;
