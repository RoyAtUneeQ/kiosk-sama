import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useSession } from '@/contexts';
import { 
  MicrophonePermissionsService,
  MicrophoneStreamService,
  SpeechToTextService
} from '@/services';
import { MessageFactory } from '@/factories';
import { MicrophoneStatus } from '@/types/microphone';
import { FiMic, FiMicOff } from 'react-icons/fi';
import type { ReactElement } from 'react';

interface StatusDisplay {
  className: string;
  label: string;
  title: string;
  icon: ReactElement;
}

interface SpeechServicesReturn {
  isProcessing: boolean;
  status: StatusDisplay;
  toggleMicrophone: () => Promise<void>;
}

/**
 * Custom hook that manages speech-to-text services and microphone control.
 * Encapsulates all service initialization, state management, and coordination.
 */
export function useSpeechServices(): SpeechServicesReturn {
  const { state, actions } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  // Service references
  const permissionsServiceRef = useRef<MicrophonePermissionsService | null>(null);
  const streamServiceRef = useRef<MicrophoneStreamService | null>(null);
  const sttServiceRef = useRef<SpeechToTextService | null>(null);

  // Initialize all services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize permissions service
        permissionsServiceRef.current = new MicrophonePermissionsService({
          autoRequest: true,
          onPermissionGranted: () => {
            console.log('Microphone permission granted');
            actions.setMicrophoneStatus(MicrophoneStatus.GRANTED);
          },
          onPermissionDenied: (error) => {
            console.error('Microphone permission denied:', error);
            actions.setMicrophoneStatus(MicrophoneStatus.DENIED);
          },
          onError: (error) => {
            console.error('Microphone permissions error:', error);
            actions.setMicrophoneStatus(MicrophoneStatus.UNKNOWN);
          }
        });

        // Initialize stream service
        streamServiceRef.current = new MicrophoneStreamService({
          targetSampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          onStreamStart: () => {
            console.log('Microphone stream started');
            actions.setMicrophoneStatus(MicrophoneStatus.LISTENING);
            actions.setAwaitingPromptResponse(true);
          },
          onStreamStop: () => {
            console.log('Microphone stream stopped');
            actions.setMicrophoneStatus(MicrophoneStatus.MUTED);
            actions.setAwaitingPromptResponse(false);
          },
          onAudioChunk: (audioChunk: Float32Array) => {
            // Send audio chunk to STT service
            sttServiceRef.current?.sendAudio(audioChunk);
          },
          onError: (error) => {
            console.error('Microphone stream error:', error);
          }
        });

        // Initialize STT service
        if (state.config?.backend?.endpoints?.http && state.config?.backend?.key) {
          sttServiceRef.current = new SpeechToTextService({
            apiBaseUrl: state.config.backend.endpoints.http,
            apiKey: state.config.backend.key,
            onReady: () => {
              console.log('STT service ready');
            },
            onProcessingStart: () => {
              setIsProcessing(true);
            },
            onProcessingEnd: () => {
              setIsProcessing(false);
            },
            onFinal: (text: string) => {
              console.log('STT final text:', text);
              actions.addMessageToHistory(MessageFactory.createUserMessage(text));
            },
            onError: (error: any) => {
              console.error('STT service error:', error);
            }
          });
          await sttServiceRef.current.start();
        }
      } catch (error) {
        console.error('Failed to initialize microphone services:', error);
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      streamServiceRef.current?.stop().catch(console.error);
      sttServiceRef.current?.stop().catch(console.error);
    };
  }, [state.config?.backend?.endpoints?.http, state.config?.backend?.key, actions]);

  // Handle microphone button click
  const toggleMicrophone = useCallback(async () => {
    switch (state.microphoneStatus) {
      // If microphone is granted or muted, start the microphone
      case MicrophoneStatus.GRANTED:
      case MicrophoneStatus.MUTED:
        await streamServiceRef.current?.start();
        actions.setMicrophoneStatus(MicrophoneStatus.LISTENING);
        break;
      // If microphone is listening, stop the microphone
      case MicrophoneStatus.LISTENING:
        await streamServiceRef.current?.stop();
        actions.setMicrophoneStatus(MicrophoneStatus.MUTED);
        break;
      // If microphone is denied or unknown, request permissions
      case MicrophoneStatus.DENIED:
      case MicrophoneStatus.UNKNOWN:
        await permissionsServiceRef.current?.requestPermissions();
        actions.setMicrophoneStatus(MicrophoneStatus.REQUESTING);
        break;
    }
  }, [state.microphoneStatus, actions]);

  // Status display configuration
  const controlStatus: Record<MicrophoneStatus, StatusDisplay> = {
    [MicrophoneStatus.DENIED]: {
      className: "permission-needed",
      label: "Grant microphone permission",
      title: "Click to grant microphone permission",
      icon: React.createElement(FiMicOff)
    },
    [MicrophoneStatus.LISTENING]: {
      className: "listening",
      label: "Stop microphone",
      title: "Stop listening",
      icon: React.createElement(FiMicOff)
    },
    [MicrophoneStatus.MUTED]: {
      className: "ready",
      label: "Start microphone",
      title: "Start listening",
      icon: React.createElement(FiMic)
    },
    [MicrophoneStatus.GRANTED]: {
      className: "ready",
      label: "Start microphone",
      title: "Start listening",
      icon: React.createElement(FiMic)
    },
    [MicrophoneStatus.UNKNOWN]: {
      className: "permission-needed",
      label: "Grant microphone permission",
      title: "Click to grant microphone permission",
      icon: React.createElement(FiMicOff)
    },
    [MicrophoneStatus.REQUESTING]: {
      className: "permission-needed",
      label: "Grant microphone permission",
      title: "Click to grant microphone permission",
      icon: React.createElement(FiMicOff)
    }
  };

  const status = controlStatus[state.microphoneStatus] || controlStatus[MicrophoneStatus.UNKNOWN];

  return {
    isProcessing,
    status,
    toggleMicrophone
  };
}
