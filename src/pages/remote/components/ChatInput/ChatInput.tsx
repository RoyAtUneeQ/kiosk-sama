import './ChatInput.scss';
import React, { type RefObject } from 'react';
import { FiSend } from 'react-icons/fi';

interface ChatInputProps {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ inputRef, value, onChange, onEnter, disabled }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="input-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message..."
        disabled={disabled}
      />
      <button
        onClick={onEnter}
        disabled={!value.trim() || disabled}
        className="send-button"
        aria-label="Send"
        title="Send"
      >
        <FiSend />
      </button>
    </div>
  );
};

export default ChatInput;

