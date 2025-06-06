export interface UneeqOptions {
  /**
   * URL for the connection endpoint.
   */
  connectionUrl: string;
  /**
   * Unique identifier for the persona.
   * This value can be copied from the UneeQ configuration portal -> Digital Human page.
   */
  personaId: string;
  /**
   * Layout mode for the UneeQ frame ('fullScreen', 'overlay', or 'contained').
   * Default value is 'overlay'.
   */
  layoutMode?: string;
  /**
   * Element ID to contain the UneeQ frame in contained mode.
   * To use this layout mode the client must have a div element on the page with the id uneeqContainedLayout.
   */
  containedElementIdName?: string;
  /**
   * Whether to automatically switch between contained and overlay modes based on scroll position.
   */
  containedAutoLayout?: boolean;
  /**
   * Breakpoint width in pixels for switching to mobile layout.
   */
  mobileViewWidthBreakpoint?: number;
  /**
   * Animation duration in milliseconds for layout mode transitions.
   */
  layoutModeChangeSpeedMs?: number;
  /**
   * Whether to automatically start the session.
   * This option will configure your session to start automatically on page load, without calling startSession().
   * Default value is false.
   */
  autoStart?: boolean;
  /**
   * A boolean indicating whether to automatically resume a previous session if one exists.
   * If set to true, the system will attempt to restore the last active session based on stored session data - within 24 hours.
   * Session data is stored per personaId, meaning each persona maintains its own session history.
   * If false or omitted, a new session will always be created.
   * Default value is false.
   */
  allowResumeSession?: boolean;
  /**
   * A boolean indicating whether the digital human frame should be initialised on page load.
   * When this value is true the digital human frame will be initialized when the page is loaded (via a page load event handler).
   * When this value is false , then the digital human frame will not be added to the page on page load.
   * If you set this value to false then you will need to call uneeq.init() yourself when you want the digital human frame to be loaded.
   * Default value is true.
   */
  initLoadHandler?: boolean;
  /**
   * Session token (set internally when session is created).
   */
  token?: string;
  /**
   * Expiry time for the token (set internally).
   */
  tokenExpiry?: string;
  /**
   * Session ID (set internally when session is created).
   */
  sessionId?: string;
  /**
   * Map path (set internally when session is created).
   */
  mapPath?: string;
  /**
   * Enable verbose logging.
   * @deprecated Use logLevel instead.
   */
  verboseLogging?: boolean;
  /**
   * @deprecated Use cameraAnchorDistance or cameraAnchorHorizontal instead
   */
  cameraAnchorPosition?: string;
  /**
   * A string defining the initial camera anchor distance (zoom) when the session starts.
   * Values: 'close_up', 'loose_close_up', 'tight_medium_shot', 'medium_shot', 'medium_full_shot', 'full_shot'.
   */
  cameraAnchorDistance?: string;
  /**
   * A string defining the initial camera anchor horizontal position when the session starts.
   * Values: 'left', 'right', 'center'.
   */
  cameraAnchorHorizontal?: string;
  /**
   * Custom error message when platform is unavailable.
   */
  platformUnavailableError?: string;
  /**
   * (Optional) A string defining where the closed captions will be positioned.
   * Default value is 'bottom-left'.
   * Values: 'bottom-left', 'bottom-right', 'bottom', 'top-left', 'top-right', 'top'.
   */
  captionsPosition?: string;
  /**
   * (Optional) A string URL to override the call-to-action thumbnail image.
   * The image provided by the URL should be a square 140px .jpg .png or .gif.
   */
  ctaThumbnailUrl?: string;
  /**
   * (Optional) JSON data to be passed with all chat prompt or voice prompts.
   * Note, this value can be overwritten at run time using setCustomPromptMetadata().
   * Data set via customMetadata will be sent to your conversation platform, and may be used when generating responses.
   */
  customMetadata?: any;
  /**
   * (Optional) A string defining custom css that will be applied to the hosted experience frame.
   */
  customStyles?: string;
  /**
   * (Optional) A boolean indicating whether to display a call to action.
   * Default value is true.
   */
  displayCallToAction?: boolean;
  /**
   * (Optional) A boolean indicating whether the microphone permission is requested as soon as the session starts.
   * Default value is false.
   */
  enableMicrophone?: boolean;
  /**
   * (Optional) A boolean indicating whether to enable voice activity detection (VAD).
   * VAD allows the user to speak without pushing a button to start/stop recording.
   * Setting this value to false will require the user to push to talk.
   * Default value is true.
   */
  enableVad?: boolean;
  /**
   * (Optional) The languageStrings property can be defined to update any of the text displayed within the Hosted Experience interface.
   */
  languageStrings?: Record<string, Record<string, string>>;
  /**
   * (Optional) A string defining the desired log level.
   * Selecting a lower log level will include all log levels above it.
   * Values: 'error', 'warn', 'info', 'debug', 'trace'.
   */
  logLevel?: string;
  /**
   * (Optional) A boolean indicating whether to render HTML content within the digital human frame.
   * If this option is set to false, you may choose to catch the html content message in the client implementation and render content within your own view.
   */
  renderContent?: boolean;
  /**
   * (Optional) A boolean indicating whether to show closed captions within the view.
   * When disabled, the client may catch the event and render their close.
   * The default value is true.
   */
  showClosedCaptions?: boolean;
  /**
   * (Optional) A boolean indicating whether to show the user input interface, which includes the text input element used for typing text messages, and the microphone mute button.
   * When disabled, you may prefer to implement your own input interface outside of the UneeQ frame.
   * Default value is true.
   */
  showUserInputInterface?: boolean;
  /**
   * (Optional) A comma separated string of hint phrases that should be used to hint the speech recognition system about words to expect.
   */
  speechRecognitionHintPhrases?: string;
  /**
   * (Optional) An integer between 0 and 20 that can be used to boost the likelyhood of hint phrase words being detected in speech.
   */
  speechRecognitionHintPhrasesBoost?: number;
  /**
   * (Optional) This option specifies up to four locales that the Digital Human should understand a person speaking (speech recognition).
   * The locales are specified in the BCP-47 format e.g "en-US".
   * The first locale is considered the primary locale.
   * Locales should be separated with a colon.
   */
  speechRecognitionLocales?: string;
  /**
   * (Optional) The prompt that will be sent to your conversation (LLM) system when the session starts.
   * Default value is "Hello".
   */
  welcomePrompt?: string;
  /**
   * Additional UneeQ options.
   */
  [key: string]: any;
}

/**
 * Options for camera anchor adjustments.
 */
interface CameraAnchorOptions {
  /**
   * The target position for the camera anchor.
   */
  position: string;
  /**
   * The duration of the camera movement in milliseconds.
   */
  duration: number;
}

/**
 * Options for sending a chat prompt.
 */
interface ChatPromptOptions {
  /**
   * The text of the chat prompt.
   */
  prompt: string;
  /**
   * Whether to show closed captions for this specific prompt.
   */
  addClosedCaption?: boolean;
}

/**
 * Options for configuring WebRTC statistics.
 */
interface WebRtcStatsOptions {
  /**
   * Whether to emit WebRTC statistics as messages.
   */
  emitMessages: boolean;
  /**
   * Whether to log WebRTC statistics to the console.
   */
  logMessages: boolean;
}

/**
 * Options for setting the layout mode.
 */
interface LayoutModeOptions {
  /**
   * The desired layout mode.
   */
  layoutMode: string;
}

/**
 * Options for controlling visibility of UI elements.
 */
interface ShowOptions {
  /**
   * Whether to show or hide the element.
   */
  show: boolean;
}

/**
 * Represents the constructor for the Uneeq class.
 */
export interface UneeqConstructor {
  /**
   * Creates a new Uneeq instance.
   * @param {UneeqOptions} options - Configuration options for the Uneeq instance.
   */
  new (options: UneeqOptions): Uneeq;
}

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
   * @param {string} layoutMode - The layout mode to validate.
   */
  validateLayoutMode(layoutMode: string): string;
  /**
   * Posts a message to the UneeQ iFrame.
   * @param {string} type - The message type.
   * @param {any} value - The message payload.
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
   * @param {() => void} fadedOutCallback - Callback to execute when the frame is faded out.
   * @param {string} layoutMode - The new layout mode.
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
   * @param {boolean} allowResumeSession - Option to allow session resumption.
   * @param {any} sessionData - Stored session data.
   */
  shouldResumeSession(allowResumeSession: boolean, sessionData: any): boolean;
  /**
   * Sends a session request to the specified endpoint.
   * @param {string} endpoint - The API endpoint.
   * @param {any} body - The request body.
   */
  sendSessionRequest(endpoint: string, body: any): Promise<any>;
  /**
   * Handles the response from a session request.
   * @param {Response} response - The fetch API Response object.
   * @param {string} personaId - The persona ID.
   */
  handleSessionResponse(response: Response, personaId: string): Promise<any>;
  /**
   * Handles token rejection errors.
   * @param {any} error - The error object.
   */
  handleTokenRejection(error: any): void;
  /**
   * Handles deprecated options, mapping them to new ones.
   * @param {UneeqOptions} options - The UneeQ options object.
   */
  handleDeprecatedOptions(options: UneeqOptions): UneeqOptions;
  /**
   * Initializes the resize handler.
   */
  initResizeHandler(): void;
  /**
   * Validates if the personaId is a valid GUID.
   * @param {string} personaId - The persona ID to validate.
   */
  isPersonaIdValidGuid(personaId: string): boolean;
  /**
   * Sends an event message.
   * @param {any} eventDetail - The detail of the event to send.
   */
  sendEventMessage(eventDetail: any): void;
  
  /**
   * Request the camera to move to anchor position.
   * @param {string} position - The anchor position.
   * @param {number} duration - The duration of the camera movement in milliseconds.
   * @deprecated Use cameraAnchorDistance or cameraAnchorHorizontal instead.
   */
  cameraAnchor(position: string, duration: number): void;
  
  /**
   * Request the camera to move to a horizontal anchor position.
   * @param {string} position - The horizontal anchor position.
   * @param {number} duration - The duration of the camera movement in milliseconds.
   */
  cameraAnchorHorizontal(position: string, duration: number): void;
  
  /**
   * Request the camera to move to an anchor position distance.
   * @param {string} position - The anchor position distance.
   * @param {number} duration - The duration of the camera movement in milliseconds.
   */
  cameraAnchorDistance(position: string, duration: number): void;
  
  /**
   * Send a chat prompt to the digital human.
   * @param {string} prompt - The chat prompt text.
   * @param {boolean} addClosedCaption - Whether to show closed captions for this prompt.
   */
  chatPrompt(prompt: string, addClosedCaption?: boolean): void;
  
  /**
   * Send a speak request to the digital human.
   * @param {string} speech - The text to be spoken.
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
   * @param {any} customMetadata - The custom metadata object.
   */
  setCustomPromptMetadata(customMetadata: any): void;
  
  /**
   * Set the layout mode ( 'overlay' | 'fullScreen' | 'contained' ).
   * @param {string} layoutMode - The desired layout mode.
   */
  setLayoutMode(layoutMode: string): void;
  
  /**
   * Set whether WebRTC stats are logged and/or emitted to the client message handler.
   * @param {boolean} emitMessages - Whether to emit messages.
   * @param {boolean} logMessages - Whether to log messages.
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
   * @param {string} htmlContent - The HTML content string.
   */
  updateDisplayContent(htmlContent: string): void;
  
  /**
   * Set whether closed captions are displayed.
   * @param {boolean} show - True to show captions, false to hide.
   */
  setShowClosedCaptions(show: boolean): void;
  
  /**
   * Set whether the user input interface is displayed (text / voice input UI).
   * @param {boolean} show - True to show the interface, false to hide.
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
   * @param {MessageEvent} event - The MessageEvent passed from the iFrame.
   */
  onMessage(event: MessageEvent): void;
  
  /**
   * Handles log messages from the UneeQ SDK.
   * @param {string} type - The type of log message.
   * @param {any[]} data - The log data.
   */
  handleLogMessages(type: string, data: any[]): void;
  
  /**
   * Shows a snackbar notification.
   * @param {string} message - The message to display.
   * @param {number} [timeout] - Optional timeout in milliseconds.
   */
  showSnackbar(message: string, timeout?: number): void;
}

declare global {
  var uneeqDeployScriptLocation: string;
}

export default Uneeq;
  