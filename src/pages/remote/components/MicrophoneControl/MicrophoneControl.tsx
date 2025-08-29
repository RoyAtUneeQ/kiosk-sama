import './MicrophoneControl.scss';
import React from 'react';
import { useSpeechServices } from '@/hooks';

interface MicrophoneControlProps {
  disabled?: boolean;
}

const MicrophoneControl: React.FC<MicrophoneControlProps> = React.memo(({
  disabled = false
}) => {
  const { isProcessing, status, toggleMicrophone } = useSpeechServices();

  return (
    <button
      type="button"
      onClick={toggleMicrophone}
      className={`microphone-control ${status?.className}`}
      aria-label={status?.label}
      title={status?.title}
      disabled={disabled}
    >
      <span className={`mic-icon ${status?.className} ${isProcessing ? 'processing-animation' : ''}`}>
        {status.icon}
      </span>
    </button>
  );
});

MicrophoneControl.displayName = 'MicrophoneControl';

export default MicrophoneControl;
