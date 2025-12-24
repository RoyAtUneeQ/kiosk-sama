import './ChatInput.scss';
import { FeedbackLine } from '@/components';
import React, { useState, useRef, useCallback } from 'react';
import { FiSend } from 'react-icons/fi';
import MicrophoneControl from '../MicrophoneControl/MicrophoneControl';
import { useSession } from '@/contexts';
import { MicrophoneStatus } from '@/types/microphone';

interface ChatInputProps {
  disabled?: boolean;
  onSendText: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({ 
  disabled,
  onSendText,
}) => {
  const { state } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');

  const handleSendText = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;

    setInputText('');
    onSendText(trimmed);
  }, [inputText, disabled, onSendText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <>
      <FeedbackLine listening={state.microphoneStatus === MicrophoneStatus.LISTENING} thickness={4} />
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          disabled={disabled}
        />
        <MicrophoneControl disabled={disabled} />
        <button
          onClick={handleSendText}
          disabled={!inputText.trim() || disabled}
          className="send-button"
          aria-label="Send"
          title="Send"
        >
          <FiSend />
        </button>
      </div>
    </>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;

