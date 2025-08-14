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
            <p>{message.content}</p>
            <span className="message-time">
              {(typeof message.timestamp === 'string' 
                ? new Date(message.timestamp) 
                : message.timestamp
              ).toLocaleTimeString()}
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
            <span className="typing-text"></span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

