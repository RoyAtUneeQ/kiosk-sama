/**
 * Interface defining the Uneeq digital human API methods and properties.
 */
import type { UneeqOptions } from "./options/UneeqOptions";

export interface Uneeq {
    /**
     * Configuration options for the Uneeq instance.
     */
    options: UneeqOptions;
    /**
     * Flag indicating if a scroll event is currently being processed.
     */
    scrollTicking: boolean;
    /**
     * HTML element used for contained layout mode.
     */
    containedLayoutElem: HTMLElement | null;
    /**
     * ID of the HTML element used for contained layout mode.
     */
    containedLayoutId: string;
    /**
     * Flag indicating if a layout transition is in progress.
     */
    layoutTransitionInProgress: boolean;
    /**
     * Current layout mode.
     */
    layoutMode: string | null;
    /**
     * Flag indicating if the UneeQ frame is ready.
     */
    frameReady: boolean;
    /**
     * Flag indicating if the session is currently starting.
     */
    sessionStarting: boolean;
    /**
     * Flag indicating if the session is live.
     */
    sessionLive: boolean;
    /**
     * Custom error message for platform unavailability.
     */
    platformUnavailableError: string;
    /**
     * ID of the UneeQ iFrame element.
     */
    frameId: string;
    /**
     * The UneeQ iFrame element.
     */
    uneeqFrame: HTMLIFrameElement;
    
    /**
     * Adds a handler for the UneeQ frame load event.
     */
    addLoadHandler(): void;
    /**
     * Initializes the UneeQ instance.
     */
    init(): void;
    /**
     * Removes event listeners.
     */
    removeListeners(): void;
    /**
     * Validates the provided UneeqOptions.
     */
    validateOptions(): boolean;
    /**
     * Gets the URL for the hosted UneeQ experience.
     */
    getHostedExperienceUrl(): string;
    /**
     * Adds the UneeQ iFrame to the DOM.
     */
    addFrame(): void;
    /**
     * Validates the layoutModeChangeSpeedMs option.
     */
    validateLayoutModeChangeSpeedMs(): void;
    /**
     * Validates the provided layout mode.
     * @param layoutMode The layout mode to validate.
     */
    validateLayoutMode(layoutMode: string): string;
    /**
     * Posts a message to the UneeQ iFrame.
     * @param type The message type.
     * @param value The message payload.
     */
    postToFrame(type: string, value: any): void;
    /**
     * Gets the HTML element used for contained layout mode.
     */
    getContainedLayoutElem(): HTMLElement | null;
    /**
     * Initializes the scroll handler for contained layout mode.
     */
    initScrollHandler(): void;
    /**
     * Fades the UneeQ frame out and then in during layout mode changes.
     * @param fadedOutCallback Callback to execute when the frame is faded out.
     * @param layoutMode The new layout mode.
     */
    frameFadeOutIn(fadedOutCallback: () => void, layoutMode: string): void;
    /**
     * Checks if mobile layout mode is enabled based on window width.
     */
    isMobileLayoutModeEnabled(): boolean;
    /**
     * Handles client window resize events.
     */
    handleClientResize(): void;
    /**
     * Handles the UneeQ frame ready event.
     */
    frameReadyHandler(): void;
    /**
     * Determines if a session should be resumed.
     * @param allowResumeSession Option to allow session resumption.
     * @param sessionData Stored session data.
     */
    shouldResumeSession(allowResumeSession: boolean, sessionData: any): boolean;
    /**
     * Sends a session request to the specified endpoint.
     * @param endpoint The API endpoint.
     * @param body The request body.
     */
    sendSessionRequest(endpoint: string, body: any): Promise<any>;
    /**
     * Handles the response from a session request.
     * @param response The fetch API Response object.
     * @param personaId The persona ID.
     */
    handleSessionResponse(response: Response, personaId: string): Promise<any>;
    /**
     * Handles token rejection errors.
     * @param error The error object.
     */
    handleTokenRejection(error: any): void;
    /**
     * Handles deprecated options, mapping them to new ones.
     * @param options The UneeQ options object.
     */
    handleDeprecatedOptions(options: UneeqOptions): UneeqOptions;
    /**
     * Initializes the resize handler.
     */
    initResizeHandler(): void;
    /**
     * Validates if the personaId is a valid GUID.
     * @param personaId The persona ID to validate.
     */
    isPersonaIdValidGuid(personaId: string): boolean;
    /**
     * Sends an event message.
     * @param eventDetail The detail of the event to send.
     */
    sendEventMessage(eventDetail: any): void;
    
    /**
     * Request the camera to move to anchor position.
     * @param position The anchor position.
     * @param duration The duration of the camera movement in milliseconds.
     * @deprecated Use cameraAnchorDistance or cameraAnchorHorizontal instead.
     */
    cameraAnchor(position: string, duration: number): void;
    
    /**
     * Request the camera to move to a horizontal anchor position.
     * @param position The horizontal anchor position.
     * @param duration The duration of the camera movement in milliseconds.
     */
    cameraAnchorHorizontal(position: string, duration: number): void;
    
    /**
     * Request the camera to move to an anchor position distance.
     * @param position The anchor position distance.
     * @param duration The duration of the camera movement in milliseconds.
     */
    cameraAnchorDistance(position: string, duration: number): void;
    
    /**
     * Send a chat prompt to the digital human.
     * @param prompt The chat prompt text.
     * @param addClosedCaption Whether to show closed captions for this prompt.
     */
    chatPrompt(prompt: string, addClosedCaption?: boolean): void;
    
    /**
     * Send a speak request to the digital human.
     * @param speech The text to be spoken.
     */
    speak(speech: string): void;
    
    /**
     * Enable the user's microphone for audio recording.
     */
    enableMicrophone(): void;
    
    /**
     * End the current session.
     */
    endSession(): void;
    
    /**
     * Pause speech recognition processing.
     */
    pauseSpeechRecognition(): void;
    
    /**
     * Resume speech recognition processing.
     */
    resumeSpeechRecognition(): void;
    
    /**
     * Sets the custom chat metadata.
     * @param customMetadata The custom metadata object.
     */
    setCustomPromptMetadata(customMetadata: any): void;
    
    /**
     * Set the layout mode ( 'overlay' | 'fullScreen' | 'contained' ).
     * @param layoutMode The desired layout mode.
     */
    setLayoutMode(layoutMode: string): void;
    
    /**
     * Set whether WebRTC stats are logged and/or emitted to the client message handler.
     * @param emitMessages Whether to emit messages.
     * @param logMessages Whether to log messages.
     */
    setWebRtcStatsEnabled(emitMessages: boolean, logMessages: boolean): void;
    
    /**
     * Instruct the digital human to stop speaking.
     */
    stopSpeaking(): void;
    
    /**
     * Unmute the digital human.
     * This is used in cases where the browser has muted audio due to auto-play policies.
     */
    unmuteDigitalHuman(): void;
    
    /**
     * Mute the digital human.
     */
    muteDigitalHuman(): void;
    
    /**
     * Set HTML content to be displayed in the content window.
     * @param htmlContent The HTML content string.
     */
    updateDisplayContent(htmlContent: string): void;
    
    /**
     * Set whether closed captions are displayed.
     * @param show True to show captions, false to hide.
     */
    setShowClosedCaptions(show: boolean): void;
    
    /**
     * Set whether the user input interface is displayed (text / voice input UI).
     * @param show True to show the interface, false to hide.
     */
    setShowUserInputInterface(show: boolean): void;
    
    /**
     * Call to start a session with the digital human.
     * Not applicable when using the autoStart=true option.
     */
    startSession(): void;
    
    /**
     * Waiting for a token returned by session service.
     */
    waitForToken(): Promise<string>;
    
    /**
     * Handles events from the iFrame.
     * @param event The MessageEvent passed from the iFrame.
     */
    onMessage(event: MessageEvent): void;
    
    /**
     * Handles log messages from the UneeQ SDK.
     * @param type The type of log message.
     * @param data The log data.
     */
    handleLogMessages(type: string, data: any[]): void;
    
    /**
     * Shows a snackbar notification.
     * @param message The message to display.
     * @param timeout Optional timeout in milliseconds.
     */
    showSnackbar(message: string, timeout?: number): void;
}

declare global {
    var uneeqDeployScriptLocation: string;
}
