export interface MicrophonePermissionsServiceOptions {
  autoRequest?: boolean;
}

export interface MicrophonePermissionsServiceCallbacks {
  onPermissionGranted?: () => void;
  onPermissionDenied?: (error: string) => void;
  onRequestStart?: () => void;
  onRequestEnd?: () => void;
  onError?: (error: any) => void;
}

export interface MicrophonePermissionsState {
  hasPermission: boolean;
  isRequesting: boolean;
  error: string | null;
}
