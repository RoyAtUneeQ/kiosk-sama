import { useState, useEffect, useCallback } from 'react';

export enum MicPermissionState {
  UNKNOWN = 'unknown',
  REQUESTING = 'requesting', 
  GRANTED = 'granted',
  DENIED = 'denied'
}

export enum MicUsageState {
  IDLE = 'idle',           // Permission granted, not listening
  REQUESTING = 'requesting', // Permission granted, setting up token/connection
  LISTENING = 'listening', // Permission granted, actively listening
  MUTED = 'muted',         // Permission granted, user muted
  DENIED = 'denied'        // Permission denied
}

export interface UseMicPermissionsResult {
  permissionState: MicPermissionState;
  usageState: MicUsageState;
  requestPermissions: () => Promise<boolean>;
  setUsageState: (state: MicUsageState) => void;
  canUseMic: boolean;
  errorMessage: string | null;
}

/**
 * Hook to manage microphone permissions and usage states.
 * Automatically requests permissions on mount.
 */
export function useMicPermissions(): UseMicPermissionsResult {
  const [permissionState, setPermissionState] = useState<MicPermissionState>(MicPermissionState.UNKNOWN);
  const [usageState, setUsageState] = useState<MicUsageState>(MicUsageState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (permissionState === MicPermissionState.REQUESTING) {
      return false; // Already requesting
    }

    setPermissionState(MicPermissionState.REQUESTING);
    setErrorMessage(null);

    try {
      // Check if permissions API is supported
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permission.state === 'granted') {
          setPermissionState(MicPermissionState.GRANTED);
          setUsageState(MicUsageState.IDLE);
          return true;
        }
        
        if (permission.state === 'denied') {
          setPermissionState(MicPermissionState.DENIED);
          setUsageState(MicUsageState.DENIED);
          setErrorMessage('Microphone access has been denied. Please enable it in your browser settings and reload the page.');
          return false;
        }
      }

      // Request access via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true 
        } 
      });
      
      // Immediately stop the stream - we just wanted to check permissions
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState(MicPermissionState.GRANTED);
      setUsageState(MicUsageState.IDLE);
      return true;

    } catch (error: any) {
      console.error('[MicPermissions] Permission request failed:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionState(MicPermissionState.DENIED);
        setUsageState(MicUsageState.DENIED);
        setErrorMessage('Microphone access was denied. Please reload the page and allow microphone access to use voice features.');
      } else if (error.name === 'NotFoundError') {
        setPermissionState(MicPermissionState.DENIED);
        setUsageState(MicUsageState.DENIED);
        setErrorMessage('No microphone found on this device.');
      } else {
        setPermissionState(MicPermissionState.DENIED);
        setUsageState(MicUsageState.DENIED);
        setErrorMessage('Failed to access microphone. Please check your browser settings.');
      }
      
      return false;
    }
  }, [permissionState]);

  // Auto-request permissions on mount
  useEffect(() => {
    let isMounted = true;

    const initPermissions = async () => {
      // Small delay to ensure component is fully mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (isMounted && permissionState === MicPermissionState.UNKNOWN) {
        await requestPermissions();
      }
    };

    initPermissions();

    return () => {
      isMounted = false;
    };
  }, [permissionState, requestPermissions]);

  // Listen for permission changes if supported
  useEffect(() => {
    let permissionListener: (() => void) | null = null;

    const setupPermissionListener = async () => {
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          permissionListener = () => {
            if (permission.state === 'granted' && permissionState !== MicPermissionState.GRANTED) {
              setPermissionState(MicPermissionState.GRANTED);
              setUsageState(MicUsageState.IDLE);
              setErrorMessage(null);
            } else if (permission.state === 'denied' && permissionState !== MicPermissionState.DENIED) {
              setPermissionState(MicPermissionState.DENIED);
              setUsageState(MicUsageState.DENIED);
              setErrorMessage('Microphone access has been denied.');
            }
          };
          
          permission.addEventListener('change', permissionListener);
        } catch (e) {
          // Permissions API not fully supported
        }
      }
    };

    setupPermissionListener();

    return () => {
      if (permissionListener && 'permissions' in navigator) {
        navigator.permissions.query({ name: 'microphone' as PermissionName })
          .then(permission => {
            permission.removeEventListener('change', permissionListener!);
          })
          .catch(() => {});
      }
    };
  }, [permissionState]);

  const canUseMic = permissionState === MicPermissionState.GRANTED;

  return {
    permissionState,
    usageState,
    requestPermissions,
    setUsageState,
    canUseMic,
    errorMessage
  };
}