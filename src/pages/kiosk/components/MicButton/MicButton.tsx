import './MicButton.scss';
import hand from '@/assets/hand.svg';
import { useState } from 'react';
import { MicrophoneService } from '@/services/MicrophoneService';

export const MicButton = ({ onTranscript }: { onTranscript: (text: string) => void }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePressStart = () => {
        setIsPressed(true);
        MicrophoneService.startCapture((text: string, isFinal: boolean) => {
            if (isFinal) {
                console.log('Transcription:', text);
                onTranscript(text);
            }
        }).catch((err: any) => {
            console.error('Microphone error:', err);
        });
    };

    const handlePressEnd = () => {
        setIsPressed(false);
        MicrophoneService.stopCapture();
    };

    return (
        <div
            className={`mic-button ${isPressed ? 'pressed' : ''}`}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
        >
            <img src={hand} alt="Hand" className="hand-icon" />
            {[...Array(40)].map((_, i) => <div key={i} className="particle"></div>)}
        </div>
    );
};