import type {
  MicrophonePermissionsServiceOptions,
  MicrophonePermissionsServiceCallbacks,
  MicrophonePermissionsState
} from './types/MicrophonePermissionsServiceTypes';

/**
 * Service for managing microphone permissions.
 * Provides automatic permission requests and state management.
 *
 * @example
 * const permService = new MicrophonePermissionsService({
 *   onPermissionGranted: () => console.log('Permission granted'),
 *   onPermissionDenied: (error) => console.error('Permission denied:', error),
 *   onError: (error) => console.error('Permission error:', error)
 * });
 * 
 * await permService.requestPermissions();
 * const hasPermission = permService.hasPermission();
 */
export class MicrophonePermissionsService {
  private readonly options: Required<MicrophonePermissionsServiceOptions>;
  private readonly callbacks: MicrophonePermissionsServiceCallbacks;
  
  private state: MicrophonePermissionsState = {
    hasPermission: false,
    isRequesting: false,
    error: null
  };

  /**
   * Create a new microphone permissions service.
   *
   * @param options - Configuration and callback options.
   */
  constructor(options: MicrophonePermissionsServiceOptions & MicrophonePermissionsServiceCallbacks = {}) {
    // Separate options from callbacks
    const {
      onPermissionGranted,
      onPermissionDenied,
      onRequestStart,
      onRequestEnd,
      onError,
      ...serviceOptions
    } = options;

    this.options = {
      autoRequest: true,
      ...serviceOptions
    };

    this.callbacks = {
      onPermissionGranted,
      onPermissionDenied,
      onRequestStart,
      onRequestEnd,
      onError
    };

    // Auto-request permissions if enabled
    if (this.options.autoRequest) {
      this.requestPermissions().catch(error => {
        this.handleError('constructor', error);
      });
    }
  }

  /**
   * Request microphone permissions from the user.
   *
   * @returns Promise that resolves when permission request is complete.
   */
  public async requestPermissions(): Promise<void> {
    if (this.state.isRequesting) {
      return;
    }

    this.updateState({ isRequesting: true, error: null });
    this.callbacks.onRequestStart?.();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      
      // Immediately stop the stream - we just wanted to request permissions
      stream.getTracks().forEach(track => track.stop());
      
      this.updateState({ 
        hasPermission: true, 
        isRequesting: false 
      });

      this.callbacks.onPermissionGranted?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Microphone permission denied';
      
      this.updateState({ 
        hasPermission: false, 
        isRequesting: false, 
        error: errorMessage 
      });

      this.callbacks.onPermissionDenied?.(errorMessage);
      this.callbacks.onError?.(error);
    } finally {
      this.callbacks.onRequestEnd?.();
    }
  }

  /**
   * Get current permissions state.
   */
  public getState(): Readonly<MicrophonePermissionsState> {
    return { ...this.state };
  }

  /**
   * Check if microphone permission is granted.
   */
  public hasPermission(): boolean {
    return this.state.hasPermission;
  }

  /**
   * Check if permission request is in progress.
   */
  public isRequesting(): boolean {
    return this.state.isRequesting;
  }

  /**
   * Get current error message.
   */
  public getError(): string | null {
    return this.state.error;
  }

  /**
   * Clear current error state.
   */
  public clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Update internal state and notify if changed.
   */
  private updateState(updates: Partial<MicrophonePermissionsState>): void {
    const hasChanges = Object.keys(updates).some(
      key => this.state[key as keyof MicrophonePermissionsState] !== updates[key as keyof MicrophonePermissionsState]
    );

    if (hasChanges) {
      this.state = { ...this.state, ...updates };
    }
  }

  /**
   * Log errors with method context.
   */
  private handleError(method: string, error: unknown): void {
    console.error(`[MicrophonePermissionsService] ${method} failed:`, error);
  }
}

export default MicrophonePermissionsService;
