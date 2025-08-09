import './ChatInput.scss';
import { FeedbackLine } from '@/components';
import React, { type RefObject } from 'react';
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi';

interface ChatInputProps {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  disabled?: boolean;
  micActive?: boolean;
  onToggleMic?: () => void;
  speaking?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ inputRef, value, onChange, onEnter, disabled, micActive = false, onToggleMic, speaking = false }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <>
    <FeedbackLine listening={!!micActive} speaking={!!speaking} thickness={4} />
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
        type="button"
        onClick={onToggleMic}
        className={`mic-button${micActive ? ' active' : ''}`}
        aria-label={micActive ? 'Stop microphone' : 'Start microphone'}
        title={micActive ? 'Stop microphone' : 'Start microphone'}
        disabled={disabled}
      >
        {micActive ? <FiMicOff /> : <FiMic />}
      </button>
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
    </>
  );
};

export default ChatInput;

