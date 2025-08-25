import './ChatInput.scss';
import { FeedbackLine } from '@/components';
import React, { type RefObject } from 'react';
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi';
import { MdMicOff } from 'react-icons/md';
import { MicUsageState } from '@/hooks/useMicPermissions';

interface ChatInputProps {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  disabled?: boolean;
  micUsageState?: MicUsageState;
  onToggleMic?: () => void;
  speaking?: boolean;
  micError?: string | null;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  inputRef, 
  value, 
  onChange, 
  onEnter, 
  disabled, 
  micUsageState = MicUsageState.IDLE, 
  onToggleMic, 
  speaking = false, 
  micError 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
  };

  const handleMicClick = () => {
    if (micUsageState === MicUsageState.DENIED) {
      alert(micError || 'Microphone access was denied. Please reload the page and allow microphone access to use voice features.');
      return;
    }
    onToggleMic?.();
  };

  const getMicButtonState = () => {
    switch (micUsageState) {
      case MicUsageState.REQUESTING:
        return {
          className: 'mic-button requesting',
          icon: <FiMic />,
          label: 'Setting up microphone...',
          disabled: true
        };
      case MicUsageState.LISTENING:
        return {
          className: 'mic-button listening',
          icon: <FiMic />,
          label: 'Stop recording',
          disabled: false
        };
      case MicUsageState.MUTED:
        return {
          className: 'mic-button muted',
          icon: <MdMicOff />,
          label: 'Start recording',
          disabled: false
        };
      case MicUsageState.DENIED:
        return {
          className: 'mic-button denied',
          icon: <FiMicOff />,
          label: 'Microphone access denied',
          disabled: false // Allow click to show error message
        };
      default: // IDLE
        return {
          className: 'mic-button idle',
          icon: <FiMic />,
          label: 'Start recording',
          disabled: false
        };
    }
  };

  const micButtonState = getMicButtonState();
  const isListening = micUsageState === MicUsageState.LISTENING;

  return (
    <>
      <FeedbackLine listening={isListening} speaking={!!speaking} thickness={4} />
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
          onClick={handleMicClick}
          className={micButtonState.className}
          aria-label={micButtonState.label}
          title={micButtonState.label}
          disabled={disabled && micUsageState !== MicUsageState.DENIED}
        >
          <span className={`mic-icon ${isListening ? 'listening-animation' : ''}`}>
            {micButtonState.icon}
          </span>
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

