import './MicButton.scss';
import hand from '@/assets/hand.svg';
import finger from '@/assets/finger.svg';
import { useCallback, useState } from 'react';
import { useTranslation } from '@/hooks';

export const MicButton = ({ onStart, onStop }: { onStart: () => void, onStop: () => void }) => {
    const { t } = useTranslation();
    const [isPressed, setIsPressed] = useState(false);
    const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
    const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

    // Check if getUserMedia is available (with iOS compatibility)
    const getUserMedia = useCallback((): ((constraints: MediaStreamConstraints) => Promise<MediaStream>) | null => {
        // Modern browsers
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            return navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        }
        
        // Fallback for older browsers (including older iOS Safari)
        const legacyGetUserMedia = (navigator as any).getUserMedia || 
                                  (navigator as any).webkitGetUserMedia || 
                                  (navigator as any).mozGetUserMedia || 
                                  (navigator as any).msGetUserMedia;
        
        if (legacyGetUserMedia) {
            return (constraints: MediaStreamConstraints) => {
                return new Promise((resolve, reject) => {
                    legacyGetUserMedia.call(navigator, constraints, resolve, reject);
                });
            };
        }
        
        return null;
    }, []);

    // Request microphone permission
    const requestMicPermission = useCallback(async () => {
        const getUserMediaFunc = getUserMedia();
        
        if (!getUserMediaFunc) {
            console.error('getUserMedia is not supported in this browser');
            setMicPermission('denied');
            return false;
        }

        // Check if we're on HTTPS or localhost (required for getUserMedia on iOS)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            console.error('getUserMedia requires HTTPS on iOS and modern browsers');
            setMicPermission('denied');
            return false;
        }

        try {
            // Request microphone access
            const stream = await getUserMediaFunc({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            // Permission granted, stop the stream
            stream.getTracks().forEach(track => track.stop());
            setMicPermission('granted');
            console.log('Microphone permission granted');
            return true;
        } catch (error) {
            console.error('Microphone permission denied or error:', error);
            setMicPermission('denied');
            
            // Show user-friendly error message
            if (error instanceof DOMException || error instanceof Error) {
                const errorName = (error as any).name || error.message;
                switch (errorName) {
                    case 'NotAllowedError':
                    case 'PermissionDeniedError':
                        console.warn('Microphone access was denied. User will need to allow access manually.');
                        break;
                    case 'NotFoundError':
                    case 'DevicesNotFoundError':
                        console.warn('No microphone found.');
                        break;
                    case 'NotReadableError':
                    case 'TrackStartError':
                        console.warn('Microphone is already in use by another application.');
                        break;
                    case 'OverconstrainedError':
                    case 'ConstraintNotSatisfiedError':
                        console.warn('Microphone constraints could not be satisfied.');
                        break;
                    case 'NotSupportedError':
                        console.warn('Microphone access is not supported in this browser.');
                        break;
                    case 'SecurityError':
                        console.warn('Microphone access blocked due to security restrictions. Please ensure you are using HTTPS.');
                        break;
                    default:
                        console.warn('Unable to access microphone:', error.message || error);
                }
            }
            return false;
        }
    }, [getUserMedia]);

    const handlePressStart = useCallback(async (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        
        // Request microphone permission on first touch/click
        if (!hasRequestedPermission) {
            setHasRequestedPermission(true);
            const permissionGranted = await requestMicPermission();
            
            // Only proceed if permission was granted
            if (!permissionGranted) {
                return;
            }
            return;
        } else if (micPermission !== 'granted') {
            // If permission was already requested but denied, don't proceed
            return;
        }
        
        setIsPressed(true);
        onStart();
    }, [onStart, hasRequestedPermission, micPermission, requestMicPermission]);

    const handlePressEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        setIsPressed(false);
        onStop();
    }, [onStop]);

    return (
        <div 
            className={`mic-button-container ${isPressed ? 'pressed' : ''} ${micPermission}`} 
            onTouchStart={handlePressStart} 
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            style={{ userSelect: 'none', touchAction: 'none' }}
            role="button"
            aria-label={t('accessibility.micButton')}
            tabIndex={0}
        >
            <div className="mic-protection"></div>
            <div className="mic-icon-container">
                <img src={hand} alt={t('accessibility.micButton')} className="hand-icon mic-icon" draggable={false}/>
                <img src={finger} alt={t('accessibility.micButton')} className="finger-icon mic-icon" draggable={false}/>
            </div>
            {[...Array(40)].map((_, i) => <div key={i} className="particle"></div>)}
        </div>
    );
};