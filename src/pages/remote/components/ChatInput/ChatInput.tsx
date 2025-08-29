import './ChatInput.scss';
import { FeedbackLine } from '@/components';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSend } from 'react-icons/fi';
import MicrophoneControl from '../MicrophoneControl/MicrophoneControl';
import { useSession } from '@/contexts';
import { MessageFactory } from '@/factories';
import { MicrophoneStatus } from '@/types/microphone';

interface ChatInputProps {
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({ 
  disabled,
}) => {
  const { state, actions } = useSession();
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input field on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendText = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;
    
    setInputText('');
    actions.addMessageToHistory(
      MessageFactory.createUserMessage(trimmed)
    );
  }, [inputText, disabled, actions]);

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

