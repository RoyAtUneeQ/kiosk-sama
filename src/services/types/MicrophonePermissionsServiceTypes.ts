/**
 * Configuration options for `MicrophonePermissionsService`.
 */
export interface MicrophonePermissionsServiceOptions {
  /** Auto-request permissions on service creation (defaults to true). */
  autoRequest?: boolean;
}

/**
 * Event callbacks for `MicrophonePermissionsService` state changes.
 */
export interface MicrophonePermissionsServiceCallbacks {
  /** Invoked when permission is granted. */
  onPermissionGranted?: () => void;
  /** Invoked when permission is denied. */
  onPermissionDenied?: (error: string) => void;
  /** Invoked when permission request starts. */
  onRequestStart?: () => void;
  /** Invoked when permission request ends (success or failure). */
  onRequestEnd?: () => void;
  /** Invoked when an error occurs. */
  onError?: (error: any) => void;
}

/**
 * Current state of the MicrophonePermissionsService.
 */
export interface MicrophonePermissionsState {
  /** Whether microphone permission is granted. */
  hasPermission: boolean;
  /** Whether a permission request is currently in progress. */
  isRequesting: boolean;
  /** Error message if permission request failed. */
  error: string | null;
}
