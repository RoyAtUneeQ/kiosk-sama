import './MessageList.scss';
import React from 'react';
import type { RefObject } from 'react';
import type { Message } from '@/types/transport/Message';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, messagesEndRef }) => {
  return (
    <div className="messages-container">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.sender}-message`}>
          <div className="message-bubble">
            <p>{message.text}</p>
            <span className="message-time">
              {message.timestamp.toLocaleTimeString()}
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
            <span className="typing-text">Searching</span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

